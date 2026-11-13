// The Node Board (1D, Swiss relief map). DESIGN.md section 11, cut to the drill, b4-board-terrace:
// Hollin's six nodes, four emitters, no opponent, one hidden seed on the node fed by N1's relay
// reading. Each node's load is the sum of K on its edges; at most γ/4 when the pulses fire, it damps.
// Emitters take a firing slot 1..4 (phase = slot × 2π/4). Tuned: its edges × 0.5. Mistuned (seeded):
// × 1.5. Two emitters on one edge: opposite slots cancel it (both tuned), otherwise it × 1.5. Strain
// is λmax of the coupling Laplacian, computed exactly, against the calm line γ/2. γ is shown re-measured
// (8). Win: all six damped. Any node that amplifies loses the drill.
const P = "lira-calyx-node-board-";
const INK = "#2e2a24", SEAL = "#b3212b", VIOLET = "#5a3f7a", GREEN = "#2f6b3f", PAPER = "#efe7d3";
const GAMMA = 8, MARK = GAMMA / 4, CALM = GAMMA / 2, N = 4;
const NODES = [
  { n: "H1", name: "Siren", x: 130, y: 112, seed: true, relay: "N1" },
  { n: "H2", name: "Water lifts", x: 300, y: 86 },
  { n: "H3", name: "Rope bridge", x: 474, y: 132 },
  { n: "H4", name: "Schoolroom", x: 118, y: 300 },
  { n: "H5", name: "Market", x: 300, y: 248 },
  { n: "H6", name: "Bench", x: 482, y: 322 },
];
const EDGES = [[0, 1, 1.5], [1, 2, 1], [0, 3, 1], [0, 4, 1.5], [1, 4, 3], [2, 4, 1.5], [2, 5, 1.5], [3, 4, 3], [4, 5, 3]];

function effective(em, truth) {
  return EDGES.map(([a, b, k]) => {
    const ea = em[a] != null, eb = em[b] != null;
    const tuned = (i) => !(truth && NODES[i].seed);
    if (ea && eb) {
      const d = Math.abs(em[a] - em[b]);
      return d === N / 2 && tuned(a) && tuned(b) ? 0 : k * 1.5;
    }
    let f = k;
    if (ea) f *= tuned(a) ? 0.5 : 1.5;
    if (eb) f *= tuned(b) ? 0.5 : 1.5;
    return f;
  });
}
function loads(K) { const l = NODES.map(() => 0); EDGES.forEach(([a, b], i) => { l[a] += K[i]; l[b] += K[i]; }); return l; }
function lambdaMax(K) {
  const n = NODES.length, A = Array.from({ length: n }, () => Array(n).fill(0));
  EDGES.forEach(([a, b], i) => { A[a][b] -= K[i]; A[b][a] -= K[i]; A[a][a] += K[i]; A[b][b] += K[i]; });
  for (let sweep = 0; sweep < 60; sweep++) { // cyclic Jacobi
    let offd = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      offd += A[p][q] ** 2;
      if (Math.abs(A[p][q]) < 1e-12) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
    }
    if (offd < 1e-18) break;
  }
  return Math.max(...A.map((r, i) => r[i]));
}

function relief(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data;
  const peaks = [[0.5, 0.42, 0.28, 1], [0.2, 0.25, 0.14, 0.5], [0.82, 0.3, 0.16, 0.6], [0.78, 0.8, 0.18, 0.45], [0.22, 0.75, 0.15, 0.35], [0.5, 0.95, 0.2, 0.2]];
  const H = (x, y) => { let v = 0; for (const [px, py, r, a] of peaks) v += a * Math.exp(-(((x / w - px) ** 2 + ((y / h - py) * 0.7) ** 2) / (r * r))); return v + 0.03 * Math.sin(x / 23) * Math.cos(y / 31); };
  const hf = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) hf[y * w + x] = H(x, y);
  const step = 0.07;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, v = hf[i];
    const dx = hf[y * w + Math.min(w - 1, x + 1)] - hf[y * w + Math.max(0, x - 1)];
    const dy = hf[Math.min(h - 1, y + 1) * w + x] - hf[Math.max(0, y - 1) * w + x];
    const shade = Math.max(0, Math.min(1.25, 0.82 - (dx + dy) * 9));
    const t = Math.min(1, v / 1.05);
    let r = 196 + (246 - 196) * t, gg = 210 + (244 - 210) * t, b = 168 + (236 - 168) * t;
    r *= shade; gg *= shade; b *= shade * 1.03 + (1 - shade) * 0.12;
    const band = Math.floor(v / step);
    const edge = band !== Math.floor(hf[y * w + Math.min(w - 1, x + 1)] / step) || band !== Math.floor(hf[Math.min(h - 1, y + 1) * w + x] / step);
    if (edge) { const m = band % 5 === 0 ? 0.55 : 0.75; r = r * m + 90 * (1 - m); gg = gg * m + 70 * (1 - m); b = b * m + 45 * (1 - m); }
    d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

export default {
  mount(root, api) {
    const off = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = "#d9d2c0";
    const st = { em: {}, sel: null, slot: 1, over: false, started: false, revealed: false };
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;background:#d9d2c0;color:${INK};font-family:Georgia,serif}
      .${P}sheet{max-width:1200px;margin:10px auto;background:${PAPER};padding:12px 14px;box-shadow:0 4px 14px rgba(0,0,0,.2);display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:12px}
      @media (max-width:760px){.${P}sheet{grid-template-columns:1fr}}
      .${P}strain{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;font:700 12px Helvetica,Arial,sans-serif;letter-spacing:.08em}
      .${P}meter{position:relative;height:22px;border:1.5px solid ${INK};background:#fff}
      .${P}meter i{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(135deg,${SEAL} 0 6px,#cf4b54 6px 12px)}
      .${P}meter i.ok{background:repeating-linear-gradient(135deg,${GREEN} 0 6px,#4d8a5c 6px 12px)}
      .${P}meter b{position:absolute;top:-4px;bottom:-4px;width:2px;background:${INK}}
      .${P}meter span{position:absolute;top:24px;font:400 10px Helvetica,Arial,sans-serif;transform:translateX(-50%);white-space:nowrap}
      .${P}map svg{width:100%;height:auto;display:block;border:1.5px solid ${INK};touch-action:manipulation}
      .${P}map svg .nd{cursor:pointer}
      .${P}map svg .nd:focus{outline:none}.${P}map svg .nd:focus .fr{stroke:${VIOLET};stroke-width:3}
      .${P}side h3{font:700 12px Helvetica,Arial,sans-serif;letter-spacing:.1em;margin:4px 0 6px}
      .${P}wheel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
      .${P}wrap button{font:700 13px Helvetica,Arial,sans-serif;color:${INK};background:#fff;border:1.5px solid ${INK};padding:8px;min-height:42px;cursor:pointer}
      .${P}wrap button.sel{background:${VIOLET};color:#fff;border-color:${VIOLET}}
      .${P}wrap button:disabled{opacity:.4;cursor:default}
      .${P}wrap button.trig{background:${INK};color:#fff;width:100%;letter-spacing:.12em;margin-top:8px}
      .${P}info{font:14px/1.4 Georgia,serif;min-height:5.5em;border-top:1px solid rgba(46,42,36,.3);padding-top:6px;margin-top:8px}
      .${P}tray{display:flex;gap:6px;margin:4px 0 8px}.${P}tray i{width:18px;height:18px;transform:rotate(45deg);border:1.5px solid ${INK}}.${P}tray i.f{background:#25c2a8}
      .${P}eq{grid-column:1/-1;font:italic 17px 'IM Fell English',Georgia,serif;display:flex;flex-wrap:wrap;gap:6px 24px;color:#3b2618}
      .${P}legend{font:12px Helvetica,Arial,sans-serif;line-height:1.7}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(217,210,192,.86);z-index:5;padding:16px}
      .${P}card{max-width:500px;background:${PAPER};border:1.5px solid ${INK};padding:18px 20px}
      .${P}card h2{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px}.${P}card p{margin:0 0 10px;font:15px/1.45 Georgia,serif}
    </style>
    <div class="${P}sheet">
      <div class="${P}strain"><span>STRAIN</span><div class="${P}meter" aria-live="polite"><i></i><b></b><span></span></div><span class="val"></span></div>
      <div class="${P}map"><svg viewBox="0 0 600 420" aria-label="Hollin's network on the relief map"></svg></div>
      <div class="${P}side">
        <h3>EMITTERS</h3><div class="${P}tray"></div>
        <h3>FIRING SLOT · φ = slot × 2π/4</h3>
        <div class="${P}wheel">${[1, 2, 3, 4].map((s) => `<button type="button" data-s="${s}">${s}<br><small>${["90°", "180°", "270°", "360°"][s - 1]}</small></button>`).join("")}</div>
        <button type="button" data-a="place">PLACE ON NODE</button> <button type="button" data-a="remove">REMOVE</button>
        <button type="button" class="trig" data-a="trigger">TRIGGER</button>
        <div class="${P}info" aria-live="polite">Select a node.</div>
        <div class="${P}legend">◯ damped (load ≤ γ/4 = 2) · ✶ amplifies<br>line weight = K (1, 1.5, 2, 3) · dashed = cancelled<br>dotted node = fed by a relay reading</div>
      </div>
      <div class="${P}eq"><span>ẍᵢ + γẋᵢ + ωᵢ²xᵢ = Σⱼ Kᵢⱼ (xⱼ − xᵢ)</span><span>λ<sub>max</sub>(L) &lt; γ/2</span><span style="font-size:14px">γ = 8, re-measured · drill: Hollin's network</span></div>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const svg = $("svg"), info = $("." + P + "info");
    const say = (t) => { info.textContent = t; };
    const bg = relief(300, 210);

    const star = (x, y, r) => { let d = ""; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; } return d + "Z"; };
    const draw = () => {
      const truth = st.revealed, K = effective(st.em, truth), L = loads(K), lam = lambdaMax(K);
      let s = `<image href="${bg}" x="0" y="0" width="600" height="420" preserveAspectRatio="none"/>`;
      s += `<text x="12" y="408" font-size="11" font-family="Helvetica,Arial,sans-serif" fill="${INK}" opacity=".7">HOLLIN TERRACE · RELIEF 1:25 000 · CONTOURS 50 m</text>`;
      EDGES.forEach(([a, b, k0], i) => {
        const A = NODES[a], B = NODES[b], k = K[i];
        s += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${k === 0 ? "#7a6f60" : k > k0 ? SEAL : INK}" stroke-width="${k === 0 ? 1.5 : 1 + k * 1.6}" ${k === 0 ? 'stroke-dasharray="5 5"' : ""} stroke-linecap="round" opacity="${k === 0 ? 0.7 : 0.88}"/>`;
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        s += `<g transform="translate(${mx},${my})"><rect x="-17" y="-9" width="34" height="16" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width=".8" opacity=".92"/><text y="3" text-anchor="middle" font-size="10" font-family="Helvetica,Arial,sans-serif" fill="${INK}">K ${+k.toFixed(2)}</text></g>`;
      });
      NODES.forEach((nd, i) => {
        const ld = L[i], ok = ld <= MARK + 1e-9, sel = st.sel === i, em = st.em[i];
        const frac = Math.min(1, ld / (MARK * 2)), r = 19, circ = 2 * Math.PI * (r + 6);
        s += `<g class="nd" data-i="${i}" tabindex="0" role="button" aria-label="${nd.n} ${nd.name}, load ${ld.toFixed(2)}${em ? `, emitter slot ${em}` : ""}">`;
        s += `<circle cx="${nd.x}" cy="${nd.y}" r="34" fill="transparent"/>`;
        if (sel) s += `<circle cx="${nd.x}" cy="${nd.y}" r="31" fill="none" stroke="${VIOLET}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
        s += `<circle cx="${nd.x}" cy="${nd.y}" r="${r + 6}" fill="none" stroke="rgba(46,42,36,.18)" stroke-width="5"/>`;
        s += `<circle cx="${nd.x}" cy="${nd.y}" r="${r + 6}" fill="none" stroke="${ok ? GREEN : SEAL}" stroke-width="5" stroke-dasharray="${circ * frac} ${circ}" transform="rotate(-90 ${nd.x} ${nd.y})"/>`;
        s += `<line x1="${nd.x}" y1="${nd.y + r + 2}" x2="${nd.x}" y2="${nd.y + r + 10}" stroke="${INK}" stroke-width="2"/>`;
        if (truth && !ok) s += `<path d="${star(nd.x, nd.y, r)}" fill="${SEAL}" stroke="#fff" stroke-width="1.5"/>`;
        else s += `<circle class="fr" cx="${nd.x}" cy="${nd.y}" r="${r - 3}" fill="#fff" stroke="${truth ? GREEN : INK}" stroke-width="${truth ? 6 : 2.5}" ${nd.relay && !truth ? 'stroke-dasharray="2 3"' : ""}/>`;
        if (em) s += `<path d="M${nd.x},${nd.y - 10} L${nd.x + 10},${nd.y} L${nd.x},${nd.y + 10} L${nd.x - 10},${nd.y}Z" fill="#25c2a8" stroke="${INK}"/><text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" font-size="11" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${INK}">${em}</text>`;
        if (truth && nd.seed) s += `<text x="${nd.x}" y="${nd.y + 50}" text-anchor="middle" font-size="11" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${SEAL}">SEED</text>`;
        s += `<text x="${nd.x + 30}" y="${nd.y - 22}" font-size="12" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${INK}" paint-order="stroke" stroke="${PAPER}" stroke-width="3">${nd.n} ${nd.name}</text>`;
        s += `<text x="${nd.x + 30}" y="${nd.y - 8}" font-size="11" font-family="Helvetica,Arial,sans-serif" fill="${ok ? GREEN : SEAL}" paint-order="stroke" stroke="${PAPER}" stroke-width="3">load ${+ld.toFixed(2)}${nd.relay && !truth ? ` · relay (${nd.relay})` : ""}</text>`;
        s += `</g>`;
      });
      svg.innerHTML = s;
      // strain bar: projected (or true, after the trigger) against the calm line
      const max = 16, pct = (v) => Math.min(100, (v / max) * 100);
      const bar = $("." + P + "meter i"); bar.style.width = pct(lam) + "%"; bar.className = lam < CALM ? "ok" : "";
      $("." + P + "meter b").style.left = pct(CALM) + "%";
      $("." + P + "meter span").style.left = pct(CALM) + "%"; $("." + P + "meter span").textContent = "calm line γ/2 = 4";
      $("." + P + "strain .val").textContent = `λmax ${lam.toFixed(2)}${truth ? "" : " (projected)"}`;
      $("." + P + "tray").innerHTML = Array.from({ length: N }, (_, i) => `<i class="${i < N - Object.keys(st.em).length ? "f" : ""}"></i>`).join("") + `<span style="font:12px Helvetica,Arial,sans-serif;margin-left:6px">${N - Object.keys(st.em).length} left</span>`;
      el.querySelectorAll("[data-s]").forEach((b) => b.classList.toggle("sel", +b.dataset.s === st.slot));
      $("[data-a=trigger]").disabled = Object.keys(st.em).length < N || st.over;
      return { L, lam };
    };
    const describe = (i) => {
      const nd = NODES[i], { L } = draw();
      say(`${nd.n} ${nd.name}: load ${+L[i].toFixed(2)} against its mark of 2.${nd.relay ? ` Its ω comes from the relay reading of ${nd.relay}, never checked by hand.` : ""}${st.em[i] ? ` Emitter in slot ${st.em[i]}.` : ""}`);
    };
    const place = () => {
      if (st.over || st.sel == null) { say("Select a node first."); return; }
      if (st.em[st.sel] == null && Object.keys(st.em).length >= N) { say("All four emitters are placed. Remove one first."); return; }
      st.em[st.sel] = st.slot; describe(st.sel);
    };
    const remove = () => { if (st.over || st.sel == null) return; delete st.em[st.sel]; describe(st.sel); };
    const trigger = () => {
      if (st.over || Object.keys(st.em).length < N) return;
      st.revealed = true; st.over = true;
      const { L, lam } = draw();
      const amp = NODES.filter((_, i) => L[i] > MARK + 1e-9);
      const seeded = NODES.find((n) => n.seed);
      if (!amp.length) api.end({ outcome: "win", text: `All six nodes damp; Strain ${lam.toFixed(2)}, under the calm line. Hollin's drill holds. The seed on ${seeded.n} sat where no emitter went.` });
      else api.end({ outcome: "lose", text: `${amp.map((n) => n.n + " " + n.name).join(", ")} amplif${amp.length > 1 ? "y" : "ies"}; Strain ${lam.toFixed(2)}. ${st.em[0] != null ? `The emitter on ${seeded.n} was mistuned: its ω came from a seeded relay reading.` : "Some nodes damp; others amplify."}` });
    };
    on(svg, "click", (e) => { const g = e.target.closest(".nd"); if (!g || st.over || !st.started) return; st.sel = +g.dataset.i; describe(st.sel); });
    on(svg, "keydown", (e) => { const g = e.target.closest(".nd"); if (!g || st.over) return; if (e.key === "Enter" || e.key === " ") { st.sel = +g.dataset.i; describe(st.sel); svg.querySelector(`.nd[data-i="${st.sel}"]`).focus(); e.preventDefault(); } });
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      if (e.key >= "1" && e.key <= "4") { st.slot = +e.key; place(); if (st.sel != null) svg.querySelector(`.nd[data-i="${st.sel}"]`)?.focus(); }
      else if (e.key === "Delete" || e.key === "Backspace") remove();
      else if (e.key === "t" || e.key === "T") trigger();
    });
    el.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => { st.slot = +b.dataset.s; if (st.sel != null && st.em[st.sel] != null) place(); else draw(); }));
    on($("[data-a=place]"), "click", place); on($("[data-a=remove]"), "click", remove); on($("[data-a=trigger]"), "click", trigger);
    draw();

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The Node Board: the terrace drill</h2>
      <p>Each node is a bell joined by springs (K). Its load is the sum of K on its edges; at 2 or less (γ/4) it damps. Place four emitters, each with a firing slot: a tuned emitter halves its edges; two on one edge in opposite slots (2 apart) cancel it; any other pair reinforces it.</p>
      <p>A node fed by a relay reading may be seeded: an emitter there amplifies instead. Damp all six, then Trigger.</p>
      <button type="button">Spread the map</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); st.started = true; say("Select a node to see its load. Keys: Tab to a node, Enter to select, 1–4 to place, Delete to remove, T to trigger."); });
    sb.focus();
    return { unmount() { off.forEach((f) => f()); } };
  },
};

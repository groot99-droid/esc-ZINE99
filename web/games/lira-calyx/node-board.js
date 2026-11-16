// The Node Board (1D, Swiss relief map). DESIGN.md section 11, cut to the drill, b4-board-terrace:
// Hollin's six nodes, four emitters, no opponent, one hidden seed on the node fed by N1's relay
// reading. Each node's load is the sum of K on its edges; at most γ/4 when the pulses fire, it damps.
// Emitters take a firing slot 1..4 (phase = slot × 2π/4). Tuned: its edges × 0.5. Mistuned (seeded):
// × 1.5. Two emitters on one edge: opposite slots cancel it (both tuned), otherwise it × 1.5. Strain
// is λmax of the coupling Laplacian, computed exactly, against the calm line γ/2. γ is shown re-measured
// (8). Win: all six damped. Any node that amplifies loses the drill.
// Added in the refine pass: Read the dossier (DESIGN 11 hint: relay-fed nodes are drawn dotted once
// the player has looked at the dossier), so the relay node is found by reading, not shown. The
// trigger lights the nodes one by one. After two lost drills, Joren's margin sketch offers a hint.
// Drawn with the game's art (api.art): the emitter and seed tokens on the map and in the tray, the
// dossier tab, Pell's-book token where her copy vouches for a Book I number (phase 1 of the accepted
// development: she copied every number, the relay's included), Joren's plate beside his sketch.
// Phase 2 (DEEP_DIVE section 3): three stages. Teach: the drill with full information (the relay node
// and its seed are drawn from the start). Test: Veylor's hidden move: once two emitters are out he
// overwrites the figure under the first one, and only a re-read dossier shows it; a witness token on a
// node bars seeds from it; the honest pencil (doubt) turns the projected Strain into a band. Twist:
// six of the Peak's nodes on Veylor's table; when the third emitter goes down the damping is
// re-measured, the calm line drops from 4 to 3, every mark from 2 to 1.5, and nodes that were safe
// turn amber together. Layer link 1: full bars ruled at the Excision Desk (Journal Audit, twist) show
// as ■ on those nodes here, their figures struck out.
import { runStages } from "./_stages.js";
const P = "lira-calyx-node-board-";
const INK = "#2e2a24", SEAL = "#b3212b", VIOLET = "#5a3f7a", GREEN = "#2f6b3f", PAPER = "#efe7d3";
const N = 4, AMBER = "#c8913a";
const NODES_H = [
  { n: "H1", name: "Siren", x: 130, y: 112, seed: true, relay: "N1", lx: 0, ly: -42, how: "flood-siren baseline, taken from the relay beacon at N1" },
  { n: "H2", name: "Water lifts", x: 300, y: 86, lx: 0, ly: -42, how: "lift-cable gauge, read by hand with Joren" },
  { n: "H3", name: "Rope bridge", x: 474, y: 132, lx: 0, ly: -42, how: "strider count on the bridge, by hand with Pell" },
  { n: "H4", name: "Schoolroom", x: 118, y: 300, lx: 0, ly: 50, how: "photodiode on the schoolroom wall, by hand" },
  { n: "H5", name: "Market", x: 300, y: 248, lx: 0, ly: 54, how: "spore density in the market awnings, by hand" },
  { n: "H6", name: "Bench", x: 482, y: 322, lx: 0, ly: 50, how: "river glow from your own bench, by hand" },
];
const EDGES_H = [[0, 1, 1.5], [1, 2, 1], [0, 3, 1], [0, 4, 1.5], [1, 4, 3], [2, 4, 1.5], [2, 5, 1.5], [3, 4, 3], [4, 5, 3]];
// the twist: six of the twelve nodes, on Veylor's table under Peak 12
const NODES_P = [
  { n: "N7", name: "Singing ledge", x: 130, y: 112, lx: 0, ly: -42, how: "phase offset from Mara's storm-song, by hand" },
  { n: "N8", name: "High ledge", x: 300, y: 86, lx: 0, ly: -42, how: "phase offset from Mara's second breath, by hand" },
  { n: "N9", name: "Harvest terrace", x: 474, y: 132, lx: 0, ly: -42, how: "the harvest chant, with its rest restored, by hand" },
  { n: "N10", name: "Drowned terrace", x: 118, y: 300, seed: true, relay: "the relay river level", lx: 0, ly: 50, how: "river level at the sluice, taken from the relay the night the terrace drowned" },
  { n: "N11", name: "Hollin", x: 300, y: 248, lx: 0, ly: 54, how: "the drill you ran on Hollin's own six nodes, by hand" },
  { n: "N12", name: "Peak 12 shaft", x: 482, y: 322, lx: 0, ly: 50, how: "gravimeter at the shaft mouth, by hand" },
];
const EDGES_P = [[3, 4, 1], [4, 5, 1], [0, 3, 1], [1, 3, 1], [1, 4, 2], [1, 5, 1], [2, 5, 1], [0, 1, 2], [1, 2, 2]];
const STG = [
  { nodes: NODES_H, edges: EDGES_H, sheet: "HOLLIN TERRACE · RELIEF 1:25 000 · CONTOURS 50 m", title: "The Node Board: the drill", wit: [] },
  { nodes: NODES_H, edges: EDGES_H, sheet: "HOLLIN TERRACE · SECOND DRILL · CONTOURS 50 m", title: "The Node Board: his move", wit: ["pell"] },
  { nodes: NODES_P, edges: EDGES_P, sheet: "PEAK 12 · INNER RING, SIX OF TWELVE · 1:50 000", title: "The Node Board: the constant", wit: ["sluice"] },
];
const WIT = { pell: ["token-witness-pell", "Pell’s book"], sluice: ["token-witness-sluice", "the sluice log"], song: ["token-witness-song", "Mara’s song"], bars: ["token-witness-bars", "the bar cipher"] };
// which board node each line of the Excision Desk page names (Journal Audit, twist)
export const DESK_NODE = [1, 4, 2, 5];

function effective(EDGES, em, seeded) {
  return EDGES.map(([a, b, k]) => {
    const ea = em[a] != null, eb = em[b] != null;
    const tuned = (i) => !seeded.has(i);
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
function loads(EDGES, K) { const l = [0, 0, 0, 0, 0, 0]; EDGES.forEach(([a, b], i) => { l[a] += K[i]; l[b] += K[i]; }); return l; }
function lambdaMax(EDGES, K) {
  const n = 6, A = Array.from({ length: n }, () => Array(n).fill(0));
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

function mountStage(root, api, stage) {
  {
    const off = [];
    const S = STG[stage], NODES = S.nodes, EDGES = S.edges;
    let GAMMA = 8;
    const MARKV = () => GAMMA / 4, CALMV = () => GAMMA / 2;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const A = api.art || { has: () => false, url: () => "" };
    const pic = (id, cls = "", alt = "") => (A.has(id) ? `<img class="${cls}" src="${A.url(id)}" alt="${alt}" draggable="false">` : "");
    root.style.background = "#d9d2c0";
    const losses = api.store.get("losses", 0);
    const st = { em: {}, order: [], wit: {}, doubt: new Set(), sel: null, slot: 1, over: false, started: false, revealed: false, read: new Set(), lit: null, beats: {}, moved: null, dropped: false, reread: false };
    // layer link 1: the bars ruled at the Excision Desk
    const desk = api.shared.get("desk", null);
    const barred = new Set(stage >= 1 && desk && Array.isArray(desk.bars) ? desk.bars.map((k) => DESK_NODE[k]).filter((i) => i != null) : []);
    // witness tokens: the stage's own, plus the ones earned in Storm-Song Cipher
    const tokens = S.wit.slice();
    if (stage >= 1 && api.shared.get("song", false) && !tokens.includes("song")) tokens.push("song");
    if (stage >= 1 && api.shared.get("bars_read", false)) tokens.push("bars");
    const seededNow = () => {
      const s = new Set();
      NODES.forEach((n, i) => { if (n.seed) s.add(i); });
      if (st.moved != null) s.add(st.moved);
      Object.keys(st.wit).forEach((i) => s.delete(+i));
      return s;
    };
    // what the pencil projects before the trigger: the drill (teach) knows its seed; later only the truth does
    const pencil = (worst) => {
      const s = new Set();
      if (stage === 0) NODES.forEach((n, i) => { if (n.seed) s.add(i); });
      if (worst) st.doubt.forEach((i) => s.add(i));
      Object.keys(st.wit).forEach((i) => s.delete(+i));
      return s;
    };
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;background:#d9d2c0;color:${INK};font-family:Georgia,serif}
      .${P}sheet{max-width:1200px;margin:10px auto;background:${PAPER};padding:12px 14px;box-shadow:0 4px 14px rgba(0,0,0,.2);display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:12px}
      @media (max-width:760px){.${P}sheet{grid-template-columns:1fr}}
      .${P}strain{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;font:700 12px Helvetica,Arial,sans-serif;letter-spacing:.08em}
      .${P}meter{position:relative;height:22px;border:1.5px solid ${INK};background:#fff}
      .${P}meter i{position:absolute;left:0;top:0;bottom:0;background:repeating-linear-gradient(135deg,${SEAL} 0 6px,#cf4b54 6px 12px)}
      .${P}meter i.ok{background:repeating-linear-gradient(135deg,${GREEN} 0 6px,#4d8a5c 6px 12px)}
      .${P}meter u{position:absolute;top:3px;bottom:3px;background:repeating-linear-gradient(90deg,rgba(46,42,36,.55) 0 2px,transparent 2px 5px);border-right:2px solid ${INK}}
      .${P}meter b{position:absolute;top:-4px;bottom:-4px;width:2px;background:${INK};transition:left 1.4s cubic-bezier(.5,0,.2,1)}
      .${P}meter span{position:absolute;top:24px;font:400 12px Helvetica,Arial,sans-serif;transform:translateX(-50%);white-space:nowrap;transition:left 1.4s cubic-bezier(.5,0,.2,1)}
      @media (prefers-reduced-motion:reduce){.${P}meter b,.${P}meter span{transition:none}}
      .${P}meter i{transition:width .5s}
      .${P}strain{margin-bottom:10px}
      .${P}map svg{width:100%;max-width:max(320px,calc((100vh - 240px) * 1.43));margin:0 auto;height:auto;display:block;border:1.5px solid ${INK};touch-action:manipulation}
      .${P}map svg .nd{cursor:pointer}
      .${P}map svg .nd:focus{outline:none}.${P}map svg .nd:focus .fr{stroke:${VIOLET};stroke-width:3}
      .${P}side h3{font:700 12px Helvetica,Arial,sans-serif;letter-spacing:.1em;margin:4px 0 6px}
      .${P}wheel{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
      .${P}wrap button{font:700 14px Helvetica,Arial,sans-serif;color:${INK};background:#fff;border:1.5px solid ${INK};padding:8px;min-height:44px;cursor:pointer}
      .${P}wrap button:hover:not(:disabled){background:#f3eee2;box-shadow:0 0 0 2px rgba(90,63,122,.25)}
      .${P}wrap button.dos{background:#f7f2e4;border-style:dashed}
      .${P}wrap button[hidden]{display:none}
      .${P}map svg .nd:hover .fr{stroke:${VIOLET}}
      .${P}flash{animation:${P}fl .6s}@keyframes ${P}fl{30%{background:#fff4b8}}
      .${P}wrap button.sel{background:${VIOLET};color:#fff;border-color:${VIOLET}}
      .${P}wrap button:disabled{opacity:.4;cursor:default}
      .${P}wrap button.trig{background:${INK};color:#fff;width:100%;letter-spacing:.12em;margin-top:8px}
      .${P}info{font:15px/1.4 Georgia,serif;min-height:5.5em;border-top:1px solid rgba(46,42,36,.3);padding-top:6px;margin-top:8px}
      .${P}info.v{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:#3b2618}
      .${P}tray{display:flex;gap:6px;margin:4px 0 8px;align-items:center;flex-wrap:wrap}.${P}tray i{width:18px;height:18px;transform:rotate(45deg);border:1.5px solid ${INK}}.${P}tray i.f{background:#25c2a8}
      .${P}eq{grid-column:1/-1;font:italic 17px 'IM Fell English',Georgia,serif;display:flex;flex-wrap:wrap;gap:6px 24px;color:#3b2618}
      .${P}legend{font:13px Helvetica,Arial,sans-serif;line-height:1.7}
      .${P}two{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(217,210,192,.88);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(480px,100%);background:${PAPER};border:3px double ${INK};padding:0;box-shadow:0 6px 18px rgba(0,0,0,.2);
        background-image:repeating-radial-gradient(circle at 80% 20%,transparent 0 14px,rgba(46,42,36,.07) 14px 15px)}
      .${P}card .cart{border-bottom:1.5px solid ${INK};padding:10px 16px;font:700 12px Helvetica,Arial,sans-serif;letter-spacing:.16em;display:flex;justify-content:space-between;background:rgba(239,231,211,.9)}
      .${P}card .in{padding:12px 16px 16px;background:rgba(239,231,211,.85)}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:0 0 4px}
      .${P}card .goal{font:15px/1.4 Georgia,serif;margin:0 0 10px}
      .${P}card dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 12px;font:14px/1.35 Helvetica,Arial,sans-serif}
      .${P}card dt{font-weight:700}
      .${P}card label{display:flex;gap:8px;align-items:center;font:14px Georgia,serif;margin:0 0 10px}
      .${P}card button{background:${INK}!important;color:#fff!important;padding:10px 22px!important;letter-spacing:.12em}
      .${P}tray img{width:26px;height:26px}.${P}tray img.u{opacity:.25;filter:grayscale(1)}
      .${P}wrap button.dos img,.${P}wrap button.wb img{height:26px;width:auto;vertical-align:middle;margin:-4px 8px -2px 0}
      .${P}info img{float:left;width:54px;height:auto;margin:2px 8px 2px 0}.${P}info img.fig{border:1px solid ${INK}}
    </style>
    <div class="${P}sheet">
      <div class="${P}strain"><span>STRAIN</span><div class="${P}meter" aria-live="polite"><i></i><u hidden></u><b></b><span></span></div><span class="val"></span></div>
      <div class="${P}map"><svg viewBox="0 0 600 420" aria-label="The network on the relief map"></svg></div>
      <div class="${P}side">
        <h3>EMITTERS</h3><div class="${P}tray"></div>
        <h3>FIRING SLOT · φ = slot × 2π/4</h3>
        <div class="${P}wheel">${[1, 2, 3, 4].map((s) => `<button type="button" data-s="${s}">${s}<br><small>${["90°", "180°", "270°", "360°"][s - 1]}</small></button>`).join("")}</div>
        <div class="${P}two"><button type="button" data-a="place">PLACE</button><button type="button" data-a="remove">REMOVE</button></div>
        <button type="button" class="dos" data-a="dossier" style="width:100%;margin-top:6px">${pic("tab-dossier")}READ THE DOSSIER (D)</button>
        <div class="${P}two"><button type="button" class="wb" data-a="witness" ${tokens.length ? "" : "hidden"}>WITNESS (W)</button><button type="button" data-a="doubt" ${stage ? "" : "hidden"}>DOUBT (P)</button></div>
        <button type="button" class="trig" data-a="trigger">TRIGGER</button>
        <div class="${P}info" aria-live="polite">Select a node.</div>
        <div class="${P}legend">◯ damped (load ≤ γ/4) · ✶ amplifies<br>line weight = K · dashed = cancelled<br>dotted node = fed by a relay reading${stage ? " (once read)<br>? = doubted in pencil · ■ = struck out" : ""}</div>
      </div>
      <div class="${P}eq"><span>ẍᵢ + γẋᵢ + ωᵢ²xᵢ = Σⱼ Kᵢⱼ (xⱼ − xᵢ)</span><span>λ<sub>max</sub>(L) &lt; γ/2</span><span class="gm" style="font-size:14px"></span></div>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const svg = $("svg"), info = $("." + P + "info");
    const say = (t, v, art) => { info.textContent = t; if (art) info.insertAdjacentHTML("afterbegin", pic(art, /^fig/.test(art) ? "fig" : "")); info.classList.toggle("v", !!v); info.classList.remove(P + "flash"); void info.offsetWidth; info.classList.add(P + "flash"); };
    const bg = relief(300, 210);
    let ac = null;
    const rise = () => { // every node's tone rising at once
      try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; }
      if (!ac) return;
      NODES.forEach((_, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = "sine"; o.frequency.setValueAtTime(110 * (1 + i * 0.25), t); o.frequency.exponentialRampToValueAtTime(110 * (1 + i * 0.25) * 1.5, t + 1.6);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.03, t + 0.2); g.gain.linearRampToValueAtTime(0, t + 1.7); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.8); });
    };

    const star = (x, y, r) => { let d = ""; for (let i = 0; i < 16; i++) { const a = Math.PI / 8 * i, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; } return d + "Z"; };
    const draw = () => {
      const truth = st.revealed, MARK = MARKV(), CALM = CALMV();
      const K = effective(EDGES, st.em, truth ? seededNow() : pencil(false)), L = loads(EDGES, K), lam = lambdaMax(EDGES, K);
      const lamHi = !truth && st.doubt.size ? lambdaMax(EDGES, effective(EDGES, st.em, pencil(true))) : lam;
      const narrow = svg.clientWidth && svg.clientWidth < 520, fk = narrow ? Math.min(1.7, 560 / svg.clientWidth) : 1;
      let s = `<image href="${bg}" x="0" y="0" width="600" height="420" preserveAspectRatio="none"/>`;
      s += `<text x="12" y="410" font-size="13" font-family="Helvetica,Arial,sans-serif" fill="${INK}" opacity=".8">${S.sheet}</text>`;
      EDGES.forEach(([a, b, k0], i) => {
        const A = NODES[a], B = NODES[b], k = K[i];
        s += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${k === 0 ? "#7a6f60" : k > k0 ? SEAL : INK}" stroke-width="${k === 0 ? 1.5 : 1 + k * 1.6}" ${k === 0 ? 'stroke-dasharray="5 5"' : ""} stroke-linecap="round" opacity="${k === 0 ? 0.7 : 0.88}"/>`;
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        s += `<g transform="translate(${mx},${my}) scale(${fk})"><rect x="-21" y="-10" width="42" height="19" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width=".8" opacity=".94"/><text y="4" text-anchor="middle" font-size="12" font-family="Helvetica,Arial,sans-serif" fill="${k === 0 ? "#7a6f60" : k > k0 ? SEAL : INK}">${narrow ? "" : "K "}${+k.toFixed(2)}</text></g>`;
      });
      NODES.forEach((nd, i) => {
        const ld = L[i], ok = ld <= MARK + 1e-9, sel = st.sel === i, em = st.em[i], black = barred.has(i) && !truth;
        const amber = st.dropped && !ok && ld <= 2 + 1e-9, tone = ok ? GREEN : amber ? AMBER : SEAL;
        if (st.lit && !st.lit.has(i)) { s += `<g class="nd" data-i="${i}"><circle cx="${nd.x}" cy="${nd.y}" r="16" fill="#fff" stroke="${INK}" stroke-width="2.5"/></g>`; return; }
        const dotted = nd.relay && (stage === 0 || st.read.has(i)) && !truth;
        const frac = Math.min(1, ld / (MARK * 2)), r = 19, circ = 2 * Math.PI * (r + 6);
        s += `<g class="nd" data-i="${i}" tabindex="0" role="button" aria-label="${nd.n} ${nd.name}, ${black ? "figure struck out" : `load ${ld.toFixed(2)}`}${em ? `, emitter slot ${em}` : ""}${st.wit[i] ? `, witness: ${WIT[st.wit[i]][1]}` : ""}${st.doubt.has(i) ? ", doubted" : ""}">`;
        s += `<circle cx="${nd.x}" cy="${nd.y}" r="34" fill="transparent"/>`;
        if (sel) s += `<circle cx="${nd.x}" cy="${nd.y}" r="31" fill="none" stroke="${VIOLET}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
        s += `<circle cx="${nd.x}" cy="${nd.y}" r="${r + 6}" fill="none" stroke="rgba(46,42,36,.18)" stroke-width="5"/>`;
        if (!black) s += `<circle cx="${nd.x}" cy="${nd.y}" r="${r + 6}" fill="none" stroke="${tone}" stroke-width="5" stroke-dasharray="${circ * frac} ${circ}" transform="rotate(-90 ${nd.x} ${nd.y})"/>`;
        s += `<line x1="${nd.x}" y1="${nd.y + r + 2}" x2="${nd.x}" y2="${nd.y + r + 10}" stroke="${INK}" stroke-width="2"/>`;
        if (truth && !ok) s += `<path d="${star(nd.x, nd.y, r)}" fill="${SEAL}" stroke="#fff" stroke-width="1.5"/>`;
        else s += `<circle class="fr" cx="${nd.x}" cy="${nd.y}" r="${r - 3}" fill="${black ? "#141414" : "#fff"}" stroke="${truth ? GREEN : INK}" stroke-width="${truth ? 6 : 2.5}" ${dotted ? 'stroke-dasharray="2 3"' : ""}/>`;
        const sd = truth && seededNow().has(i);
        if (sd && ok && A.has("token-seed")) s += `<image href="${A.url("token-seed")}" x="${nd.x - 20}" y="${nd.y - 20}" width="40" height="40"/>`;
        if (em && A.has("token-emitter")) s += `<image href="${A.url("token-emitter")}" x="${nd.x - 19}" y="${nd.y - 19}" width="38" height="38"/><circle cx="${nd.x + 15}" cy="${nd.y - 15}" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><text x="${nd.x + 15}" y="${nd.y - 11}" text-anchor="middle" font-size="12" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${INK}">${em}</text>`;
        else if (em) s += `<path d="M${nd.x},${nd.y - 10} L${nd.x + 10},${nd.y} L${nd.x},${nd.y + 10} L${nd.x - 10},${nd.y}Z" fill="#25c2a8" stroke="${INK}"/><text x="${nd.x}" y="${nd.y + 4}" text-anchor="middle" font-size="11" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${INK}">${em}</text>`;
        if (st.wit[i]) s += A.has(WIT[st.wit[i]][0]) ? `<image href="${A.url(WIT[st.wit[i]][0])}" x="${nd.x - 34}" y="${nd.y - 34}" width="26" height="26"/>` : `<rect x="${nd.x - 32}" y="${nd.y - 32}" width="16" height="20" fill="${PAPER}" stroke="${INK}"/>`;
        if (st.doubt.has(i) && !truth) s += `<text x="${nd.x + 26}" y="${nd.y + 16}" font-size="24" font-style="italic" font-family="Georgia,serif" fill="#6f6a62">?</text>`;
        if (truth && (nd.seed || st.moved === i)) s += `<text x="${nd.x}" y="${nd.y + 50}" text-anchor="middle" font-size="11" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${SEAL}">${st.wit[i] ? "SEED, WITNESSED" : "SEED"}</text>`;
        const ty = nd.y + nd.ly * (narrow ? 1.12 : 1), up = nd.ly < 0;
        const ldT = black ? "■■" : `${+ld.toFixed(2)}`;
        const t1 = narrow ? `${nd.n} · ${ldT}` : `${nd.n} ${nd.name}`;
        s += `<text x="${nd.x + nd.lx}" y="${up ? ty - (narrow ? 0 : 14) : ty}" text-anchor="middle" font-size="${14 * fk}" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${narrow ? (black ? INK : tone) : INK}" paint-order="stroke" stroke="${PAPER}" stroke-width="4">${t1}</text>`;
        if (!narrow) s += `<text x="${nd.x + nd.lx}" y="${up ? ty + 2 : ty + 16}" text-anchor="middle" font-size="13" font-weight="700" font-family="Helvetica,Arial,sans-serif" fill="${black ? INK : tone}" paint-order="stroke" stroke="${PAPER}" stroke-width="4">load ${ldT} / ${+MARK.toFixed(2)}${dotted ? ` · relay` : ""}</text>`;
        s += `</g>`;
      });
      svg.innerHTML = s;
      // strain bar: projected (or true, after the trigger) against the calm line
      const max = 16, pct = (v) => Math.min(100, (v / max) * 100);
      const bar = $("." + P + "meter i"); bar.style.width = pct(lam) + "%"; bar.className = lam < CALM ? "ok" : "";
      const band = $("." + P + "meter u"); band.hidden = !(lamHi > lam + 1e-6); band.style.left = pct(lam) + "%"; band.style.width = Math.max(0, pct(lamHi) - pct(lam)) + "%";
      $("." + P + "meter b").style.left = pct(CALM) + "%";
      $("." + P + "meter span").style.left = pct(CALM) + "%"; $("." + P + "meter span").textContent = `calm line γ/2 = ${+CALM.toFixed(2)}`;
      $("." + P + "strain .val").textContent = `λmax ${lam.toFixed(2)}${lamHi > lam + 1e-6 ? `–${lamHi.toFixed(2)}` : ""}${truth ? "" : " (pencil)"}`;
      $("." + P + "eq .gm").textContent = `γ = ${GAMMA}${st.dropped ? ", re-measured mid-match" : stage === 2 ? ", as the relay has it" : ", re-measured"} · ${stage === 2 ? "Peak 12, inner ring" : "drill: Hollin's network"}`;
      const left = N - Object.keys(st.em).length, used = new Set(Object.values(st.wit));
      $("." + P + "tray").innerHTML = Array.from({ length: N }, (_, i) => pic("token-emitter", i < left ? "" : "u") || `<i class="${i < left ? "f" : ""}"></i>`).join("") + `<span style="font:12px Helvetica,Arial,sans-serif;margin-left:6px">${left} left</span>` +
        tokens.map((t) => pic(WIT[t][0], used.has(t) ? "u" : "", WIT[t][1])).join("");
      el.querySelectorAll("[data-s]").forEach((b) => b.classList.toggle("sel", +b.dataset.s === st.slot));
      $("[data-a=trigger]").disabled = Object.keys(st.em).length < N || st.over;
      $("[data-a=dossier]").disabled = st.sel == null || st.over;
      $("[data-a=witness]").disabled = st.sel == null || st.over; $("[data-a=doubt]").disabled = st.sel == null || st.over;
      const free = tokens.filter((t) => !used.has(t));
      $("[data-a=witness]").innerHTML = `${free.length ? pic(WIT[free[0]][0]) : ""}WITNESS (${free.length})`;
      return { L, lam, MARK };
    };
    const describe = (i) => {
      const nd = NODES[i], { L, MARK } = draw();
      if (barred.has(i)) { say(`${nd.n} ${nd.name}: its figure is under a black bar. The springs on it are still drawn: add their K yourself, against a mark of ${+MARK.toFixed(2)}.${st.em[i] ? ` Emitter in slot ${st.em[i]}.` : ""}`); return; }
      say(`${nd.n} ${nd.name}: load ${+L[i].toFixed(2)} against its mark of ${+MARK.toFixed(2)}.${st.read.has(i) && nd.relay ? ` Its ω comes from ${/^N\d/.test(nd.relay) ? "the relay reading of " + nd.relay : nd.relay}, never checked by hand.` : st.read.has(i) ? (st.moved === i ? " Overwritten." : " Read by hand.") : " Dossier unread."}${st.em[i] ? ` Emitter in slot ${st.em[i]}.` : ""}${st.wit[i] ? ` Witness: ${WIT[st.wit[i]][1]}.` : ""}`);
    };
    const dossier = () => {
      if (st.over || st.sel == null) { say("Select a node first."); return; }
      const nd = NODES[st.sel], i = st.sel; st.read.add(i); if (st.moved != null) st.reread = true; draw();
      if (barred.has(i)) { say(`Dossier, ${nd.n} ${nd.name}: one ruled black bar, blue under the black, where the figure was. You know the hand. ${st.moved === i ? "Under the bar's end, a seven shows, uncrossed." : "Whatever it said, it was hers."}`, true, "token-witness-bars"); return; }
      if (st.moved === i) { say(`Dossier, ${nd.n} ${nd.name}: ${nd.how}. But the seven is not crossed, and the ink is flatter than it was an hour ago. This figure has been gone over since you first leaned on it. A witness would hold it.`, true, "token-seed"); return; }
      if (stage === 2) { say(`Dossier, ${nd.n} ${nd.name}: ${nd.how}.${nd.relay ? " Relay. Joren’s sluice log has the same level, in his own hand, the night he opened the gates. Nobody ever checked it." : " Hand, ok."}`, true, nd.relay ? "token-witness-sluice" : "tab-dossier"); return; }
      say(`Dossier, ${nd.n} ${nd.name}: ${nd.how}.${nd.relay ? " Relay. Lira wrote it in her smaller hand. Nobody has ever checked a relay number by hand. Pell’s book has it the same: DOCTOR SAYS, and then the relay’s number. A copy is only as right as the day it copies." : ` Hand, ok.${nd.n === "H3" ? " Pell’s book has it too: DOCTOR 17. ME 18." : " Pell’s book has the same figure, in capitals."}`}`, true, "token-witness-pell");
    };
    const timers = []; const later = (f, ms) => timers.push(setTimeout(f, ms));
    const place = () => {
      if (st.over || st.sel == null) { say("Select a node first."); return; }
      if (st.em[st.sel] == null && Object.keys(st.em).length >= N) { say("All four emitters are placed. Remove one first."); return; }
      if (st.em[st.sel] == null) st.order.push(st.sel);
      st.em[st.sel] = st.slot; describe(st.sel);
      const n = Object.keys(st.em).length;
      if (stage === 1 && n === 2 && st.moved == null) {
        st.moved = st.order.find((i) => !NODES[i].seed && st.em[i] != null); if (st.moved == null) st.moved = st.order.find((i) => !NODES[i].seed);
        st.read.delete(st.moved);
        later(() => say("Across the sheet, a number changes. You did not see which: only a pen lifting. Veylor moves where you lean first. Read the dossiers again.", true, "token-seed"), 700);
        return;
      }
      if (stage === 2 && n === 3 && !st.dropped) {
        st.dropped = true; GAMMA = 6; rise(); draw();
        later(() => say("The calm line drops. The damping, re-measured: 6, not 8. Every mark falls from 2 to 1.5, and nodes that were safe turn amber together. Veylor, across the table: “I read your model years before you wrote it.” Move what must move.", true, "token-seed"), 300);
        return;
      }
      if (n === 2 && !st.beats.two && stage === 0) { st.beats.two = 1; later(() => say("Below the map, Pell runs the drill list house to house. The terrace has heard the word “drill” before; it has never heard it said this quietly.", true), 1800); }
      if (n === 4 && !st.beats.four) { st.beats.four = 1; later(() => say(`All four emitters out. The pencil Strain reads ${lambdaMax(EDGES, effective(EDGES, st.em, pencil(false))).toFixed(2)} against the calm line of ${+CALMV().toFixed(2)}. It is only as honest as the readings under it. Trigger when you trust them.`, true), 900); }
    };
    const remove = () => { if (st.over || st.sel == null) return; delete st.em[st.sel]; st.order = st.order.filter((i) => i !== st.sel); describe(st.sel); };
    const witness = () => {
      if (st.over || st.sel == null || !tokens.length) return;
      if (st.wit[st.sel]) { const t = st.wit[st.sel]; delete st.wit[st.sel]; draw(); say(`You take ${WIT[t][1]} back off ${NODES[st.sel].n}.`); return; }
      const free = tokens.filter((t) => !Object.values(st.wit).includes(t));
      if (!free.length) { say("Every witness is already on the map. Select its node and press Witness to lift it."); return; }
      st.wit[st.sel] = free[0]; draw();
      say(`${WIT[free[0]][1][0].toUpperCase() + WIT[free[0]][1].slice(1)} on ${NODES[st.sel].n} ${NODES[st.sel].name}: a second hand vouches for this number. No seed holds on it this round.`, true, WIT[free[0]][0]);
    };
    const doubt = () => {
      if (st.over || st.sel == null || !stage) return;
      if (st.doubt.has(st.sel)) st.doubt.delete(st.sel); else st.doubt.add(st.sel);
      const { lam } = draw();
      say(st.doubt.has(st.sel) ? `A pencil question mark on ${NODES[st.sel].n}. The Strain is now a band: ${lam.toFixed(2)} if the number is honest, wider if it is not.` : `You rub the question mark off ${NODES[st.sel].n}.`, true);
    };
    const trigger = () => {
      if (st.over || Object.keys(st.em).length < N) return;
      st.revealed = true; st.over = true; st.lit = new Set();
      say("The pulses fire, staggered by slot. The seeds show. Node by node, the mountain answers.", true);
      const order = [0, 1, 2, 3, 4, 5];
      order.forEach((i, k) => later(() => { st.lit.add(i); draw(); }, api.reducedMotion ? 0 : 350 * (k + 1)));
      later(() => {
        st.lit = null;
        const { L, lam, MARK } = draw();
        const amp = NODES.filter((_, i) => L[i] > MARK + 1e-9);
        const sd = [...seededNow()], raw = NODES.findIndex((n) => n.seed);
        const names = amp.map((n) => n.n + " " + n.name).join(", ");
        if (!amp.length) {
          api.store.set("losses", 0);
          const text = stage === 0 ? `All six nodes damp; Strain ${lam.toFixed(2)}, under the calm line. Hollin's drill holds, and the siren on H1 wails once and stops. The seed sat where no emitter went. It is the one complete calm this mountain will give you.`
            : stage === 1 ? `All six nodes damp; Strain ${lam.toFixed(2)}. He went over ${NODES[st.moved] ? NODES[st.moved].n : "a figure"} while you were placing the second emitter${st.wit[st.moved] ? `, and ${WIT[st.wit[st.moved]][1]} held it: a child's capitals against a forger's seven` : ", and you had already stopped leaning on it"}. A number is safe while two hands keep it.`
            : `All six damp at the lower line; Strain ${lam.toFixed(2)} against 3. The constant was never yours: it came up the relay with everything else, and you measured it again at his table with his eyes on you. Veylor nods, once, as a man does who has been checked.`;
          api.end({ outcome: "win", text });
        } else {
          api.store.set("losses", losses + 1);
          const why = stage === 2 && !amp.some((n, k) => L[NODES.indexOf(n)] > 2 + 1e-9) ? "They were safe against a mark of 2. The mark is 1.5 now." : sd.some((i) => st.em[i] != null) ? `The emitter on ${NODES[sd.find((i) => st.em[i] != null)].n} was mistuned: the figure under it was not yours.` : "Some nodes damp; others amplify.";
          api.end({ outcome: "lose", text: `${names} amplif${amp.length > 1 ? "y" : "ies"}; Strain ${lam.toFixed(2)}. ${why} ${stage === 2 ? "Under Peak 12 that is not a drill." : "It is only a drill. On the night it is not, those houses shake."}` });
        }
        void raw;
      }, api.reducedMotion ? 50 : 350 * 7 + 300);
    };
    on(svg, "click", (e) => { const g = e.target.closest(".nd"); if (!g || st.over || !st.started) return; st.sel = +g.dataset.i; describe(st.sel); });
    on(svg, "keydown", (e) => { const g = e.target.closest(".nd"); if (!g || st.over) return; if (e.key === "Enter" || e.key === " ") { st.sel = +g.dataset.i; describe(st.sel); svg.querySelector(`.nd[data-i="${st.sel}"]`).focus(); e.preventDefault(); } });
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      const k = e.key.toLowerCase();
      if (k === "d") { dossier(); return; }
      if (k === "w") { witness(); return; }
      if (k === "p") { doubt(); return; }
      if (e.key >= "1" && e.key <= "4") { st.slot = +e.key; place(); if (st.sel != null) svg.querySelector(`.nd[data-i="${st.sel}"]`)?.focus(); }
      else if (e.key === "Delete" || e.key === "Backspace") remove();
      else if (k === "t") trigger();
    });
    el.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => { st.slot = +b.dataset.s; if (st.sel != null && st.em[st.sel] != null) place(); else draw(); }));
    on($("[data-a=place]"), "click", place); on($("[data-a=remove]"), "click", remove); on($("[data-a=trigger]"), "click", trigger); on($("[data-a=dossier]"), "click", dossier);
    on($("[data-a=witness]"), "click", witness); on($("[data-a=doubt]"), "click", doubt);
    const ro = new ResizeObserver(() => draw()); ro.observe(svg);
    draw();

    const HOW = [
      [`Bring every node’s load to 2 or less with four emitters, then Trigger. This drill hides nothing: H1 is fed by a relay number, and an emitter there is mistuned.`, "Spread the map"],
      [`The same drill, and an opponent. Once two emitters are out, Veylor goes over one figure in secret. Re-read the dossiers to find it; a witness holds a number against him.`, "Spread the map again"],
      [`Six of the Peak’s twelve nodes, at his table. Your marks stand on γ = 8, a number that came up the relay. It will not stay where you put it.`, "Sit down at his table"],
    ][stage];
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="cart"><span>${stage === 2 ? "PEAK 12" : "HOLLIN TERRACE"}</span><span>${["TEACH", "TEST", "TWIST"][stage]}</span></div><div class="in">
      <h2>${S.title}</h2>
      <p class="goal">${HOW[0]}</p>
      <dl><dt>select</dt><dd>tap a node (Tab, Enter): its load and its mark</dd>
      <dt>place</dt><dd>pick a slot 1–4, then place (or press 1–4). Tuned: its springs × ½</dd>
      <dt>pairs</dt><dd>two on one spring: slots 2 apart cancel it; otherwise × 1.5</dd>
      <dt>D</dt><dd>read the dossier: where the node’s number came from</dd>
      ${stage ? `<dt>W</dt><dd>lay a witness on the node: no seed holds there</dd><dt>P</dt><dd>pencil a doubt: the Strain becomes a band</dd>` : ""}</dl>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle" checked> Joren’s margin sketch: a hint for the heaviest node</label>` : ""}
      <button type="button">${HOW[1]}</button></div></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const g = intro.querySelector(".gentle");
      intro.remove(); st.started = true; draw();
      say(stage === 0 ? "Book IV. Hollin Terrace is cracking under synchronized storms, and the coalition runs a drill on its six nodes before anyone goes near the core. Select a node to begin."
        : stage === 1 ? "The drill again, by lamplight, and this time someone is playing against you. Pell’s book lies by the map: one witness. Select a node to begin."
        : "Book IV, the core. Veylor has laid the inner ring out on his table. “Show me,” he says. Joren’s sluice log is in your coat: one witness. Select a node to begin.", true);
      if (stage >= 1 && desk && desk.played) api.linkNote(barred.size ? `Because you ruled ${barred.size} full bar${barred.size > 1 ? "s" : ""} at the Excision Desk in Journal Audit, ${[...barred].map((i) => NODES[i].n).join(", ")} ${barred.size > 1 ? "are" : "is"} struck out on this sheet: ■ where the figure was.` : "Because you cut only words at the Excision Desk in Journal Audit, every node on this sheet still shows its figure.");
      if (stage >= 1 && tokens.length > S.wit.length) api.linkNote(`Because you ${tokens.includes("bars") ? "read the bars" : "walked Mara’s song"} in Storm-Song Cipher, ${tokens.length - S.wit.length > 1 ? "two more witnesses lie" : "one more witness lies"} by the map.`);
      if (g && g.checked) later(() => say(stage === 2 ? "Joren's sketch in the margin: the High ledge carries the heavy springs here. Put it opposite the emitters round it, and keep off the drowned terrace." : "Joren's sketch in the margin: the Market carries three heavy springs. Put the Market opposite the emitters around it, and keep those emitters in step with each other.", true, "fig-joren"), 6000);
    });
    sb.focus();
    if (window.__ezTest) window.__ezTest[api.key] = { st, stage, NODES, EDGES };
    return { unmount() { off.forEach((f) => f()); timers.forEach(clearTimeout); ro.disconnect(); try { ac && ac.close(); } catch {} } };
  }
}

export default {
  mount(root, api) {
    return runStages(root, api, { names: ["The drill", "His hidden move", "The constant"], colors: { bg: "#2e2a24", fg: "#efe7d3", accent: "#c8913a", paper: PAPER, ink: INK }, mount: mountStage });
  },
};

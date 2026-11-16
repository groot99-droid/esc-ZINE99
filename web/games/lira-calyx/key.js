// The Key (1D, Iron-gall botanical plate). DESIGN.md section 11, cut to b1-key-1: six specimens from
// the terrace collection, one anomaly (a juvenile Ember Wolf found at 2 640 m, when the key's name
// says below 2 000 m). Measure the trait each couplet asks for (stopwatch on the glow, rule, altimeter
// tag), follow it to a name, and either name the specimen or key the anomaly by writing a new couplet.
// Two misclassified specimens lose the plate.
// Added in the refine pass: from the second specimen, Pell (the terrace child of DESIGN 4, who keeps
// "her own wrong but earnest tally") offers her count of the glow, three times: instant, but not
// always right. The plate stamps each name as it is settled. After two lost plates, the key shows
// the measure each couplet uses from the start.
// Phase 1 of the accepted development (DESIGN "Accepted development (2026-11-15)"): every couplet
// shows whose hand it is in (print, or Lira's pencil), and the plate ends with the Flyleaf: one more
// drawer, in the Cinder Reach archive of Book II, holding the key's first printing, initialled S.V.,
// with the couplet the player wrote already pencilled in it by a third hand. Drawn with the game's
// art (api.art): the key's pages, the wolf plate, Pell's page, the dial faces.
// Phase 2 (DEEP_DIVE section 3): three stages. Teach (Book I): three jars, the last the wolf that
// breaks the key. Test (Book III): low-gravity specimens that drift on the plate, and three breaks,
// each on a different measure. Twist (the Flyleaf, Cinder Reach): reverse keying. His pencil has left
// three leaves blank for species that do not exist yet; the player chooses the measures that would
// have to be true to arrive there, and the plate draws what the Second Genesis selects for.
// Layer link 3: the wolf couplet written here (or not) changes what the climbs draw.
import { runStages } from "./_stages.js";
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
const SPECS_ALL = [
  { id: 1, kind: "frond", glow: 2.2, len: 58, alt: 2300, name: "Glassleaf", label: "Frond, terrace edge" },
  { id: 2, kind: "fern", glow: 3.1, len: 28, alt: 1700, name: "Ash-fern", label: "Fern, river stair", pell: 3.0 },
  { id: 3, kind: "strand", glow: 5.0, len: 44, alt: 2100, name: "Spore-Weaver strand", label: "Thread, valley web", pell: 3.5 },
  { id: 4, kind: "track", glow: 7.2, len: 74, alt: 2640, name: "Ember Wolf", anomaly: true, label: "Track cast, upper bridge", pell: 7.0 },
  { id: 5, kind: "moss", glow: 1.6, len: 22, alt: 2450, name: "Spire-moss", label: "Moss, schoolroom wall", pell: 1.5 },
  { id: 6, kind: "plate", glow: 4.6, len: 92, alt: 2200, name: "Ridgeback Strider", label: "Dorsal plate, bridge", pell: 3.8 },
];
const WOLF_FIX = { trait: "alt", thr: 2000, newName: "Ember Wolf, upland form (new)" };
const SPECS_T = [
  { id: 1, kind: "moss", glow: 1.8, len: 24, alt: 3900, name: "Spire-moss", label: "Moss, storm-singing ledge", pell: 2.0, drift: true },
  { id: 2, kind: "frond", glow: 2.0, len: 56, alt: 4200, name: "Glassleaf", anomaly: true, fix: { trait: "alt", thr: 3000, newName: "Glassleaf, high form (new)" }, label: "Frond, low-gravity pocket", pell: 2.0, drift: true },
  { id: 3, kind: "plate", glow: 4.4, len: 64, alt: 2300, name: "Ridgeback Strider", anomaly: true, fix: { trait: "len", thr: 70, newName: "Ridgeback Strider, dwarf form (new)" }, label: "Dorsal plate, Kade’s report", pell: 4.5, drift: true },
  { id: 4, kind: "strand", glow: 6.6, len: 44, alt: 2900, name: "Spore-Weaver strand", anomaly: true, fix: { trait: "glow", thr: 6, newName: "Spore-Weaver strand, slow form (new)" }, label: "Thread, harvest terrace", pell: 6.5, drift: true },
];
const STG = [
  { specs: [SPECS_ALL[0], SPECS_ALL[1], { ...SPECS_ALL[3], id: 3, fix: WOLF_FIX }], limit: 3, plate: "PLATE XIV · THE TERRACE COLLECTION" },
  { specs: SPECS_T, limit: 2, plate: "PLATE XXXI · THE HIGH PEAKS, AND KADE’S REPORTS" },
  { specs: [SPECS_ALL[0]], limit: 3, plate: "THE FLYLEAF · KEY, MID-SLOPES, FIRST PRINTING" },
];
// the twist: his blank leaves, and the measures on offer
const OPTS = { glow: [1.5, 3, 5, 7.5], len: [25, 50, 80, 105], alt: [1200, 2400, 3200, 3800] };
const BLANKS = [
  { id: "x", at: 7, label: "7a", hint: "a hunter, large, slow-glowing, above the line" },
  { id: "y", at: 8, label: "8a", hint: "a moss for the highest ledges" },
  { id: "z", at: 9, label: "9a", hint: "a strider that keeps to the Peaks" },
];

function mountStage(root, api, stage) {
  {
    const SPECS = STG[stage].specs;
    const off = []; let raf = 0;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const A = api.art || { has: () => false, url: () => "" };
    const pic = (id, cls = "", alt = "") => (A.has(id) ? `<img class="${cls}" src="${A.url(id)}" alt="${alt}" draggable="false">` : "");
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
      .${P}wrap button:hover:not(:disabled){background:rgba(59,38,24,.1)}
      .${P}wrap button:active:not(:disabled){transform:translateY(1px)}
      .${P}wrap button.pell{border-style:dashed;color:#5b4a3a}
      .${P}wrap button.pell[hidden]{display:none}
      .${P}taps{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle}.${P}taps i{width:9px;height:9px;border:1.2px solid ${INK};border-radius:50%}.${P}taps i.f{background:${TEAL}}
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
      .${P}log{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:#5b4a3a;margin-top:8px;min-height:2.8em}
      .${P}log.v{color:#2f4c86}
      .${P}stamp{transition:opacity .4s}
      .${P}tally{font:13px 'Courier Prime',monospace;letter-spacing:.06em;margin:4px 0 8px}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(216,203,168,.88);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(460px,100%);background:${PAPER};border:1.5px solid ${INK};outline:1px solid ${INK};outline-offset:-7px;padding:20px 22px;text-align:center}
      .${P}card .pl{font:13px 'IM Fell English',Georgia,serif;letter-spacing:.3em}
      .${P}card h3{font:400 30px/1.05 'IM Fell English',Georgia,serif;margin:2px 0 6px}
      .${P}card .goal{font:italic 17px/1.35 'IM Fell English',Georgia,serif;margin:0 0 12px}
      .${P}card ol{list-style:none;padding:0;margin:0 0 14px;text-align:left;font:15px/1.4 Georgia,serif}
      .${P}card li{display:grid;grid-template-columns:2.6em 1fr;padding:4px 0;border-bottom:1px dotted rgba(59,38,24,.45)}
      .${P}card li b{font:400 15px 'IM Fell English',Georgia,serif}
      .${P}card label{display:flex;gap:8px;justify-content:center;font:italic 15px Georgia,serif;margin:0 0 10px;color:${PENCIL}}
      .${P}card button{background:${INK};color:${PAPER};padding:10px 22px;font-size:17px}
      .${P}card button:hover{background:${SEAL}!important}
      .${P}plate h2 img{height:34px;width:auto;vertical-align:middle;margin-right:10px}
      .${P}kit button img{height:26px;width:26px;vertical-align:middle;margin:-4px 6px -2px -4px;border-radius:50%}
      .${P}hd{display:inline-block;font:700 10px 'Courier Prime',monospace;letter-spacing:.08em;border:1px solid currentColor;padding:0 4px;margin-left:6px;vertical-align:1px;font-style:normal;white-space:nowrap}
      .${P}hd.p{color:${PENCIL};border-style:dashed}
      .${P}kp{display:flex;gap:10px;align-items:center;margin:0 0 8px;padding:0!important;border:0!important;text-align:left;width:100%;min-height:0!important;font:13px/1.4 'Courier Prime',monospace!important}
      .${P}kp img{width:58px;height:auto;border:1px solid ${INK};box-shadow:2px 2px 0 rgba(59,38,24,.25);flex:0 0 auto}
      .${P}found{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin:0 0 8px}.${P}found img{height:120px;width:auto;border:1px solid ${INK}}
      .${P}found span{flex:1 1 140px;font:italic 14px/1.4 Georgia,serif;color:#5b4a3a}
      .${P}over{position:absolute;inset:0;display:grid;place-items:center;background:rgba(40,30,20,.82);z-index:6;padding:12px;overflow:auto}
      .${P}fly{width:min(900px,100%);max-height:100%;overflow:auto;background:${PAPER};border:1.5px solid ${INK};padding:14px 16px;display:flex;flex-wrap:wrap;gap:14px;box-shadow:0 8px 26px rgba(0,0,0,.45)}
      .${P}fly .im{flex:0 1 300px;min-width:170px;max-width:min(300px,62vw);margin:0 auto}.${P}fly .im img{display:block;width:100%;height:auto;box-shadow:2px 3px 0 rgba(59,38,24,.3)}
      .${P}fly .im .fb{aspect-ratio:8/11;border:1px solid ${INK};display:grid;place-items:center;padding:16px;font:italic 18px/1.6 Georgia,serif;color:${PENCIL};text-align:center}
      .${P}fly .tx{flex:1 1 300px;min-width:0;font:15px/1.45 Georgia,serif}
      .${P}fly .ch{font:700 12px 'Courier Prime',monospace;letter-spacing:.16em;color:${SEAL}}
      .${P}fly h3{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:2px 0 8px}
      .${P}fly p{margin:0 0 8px}.${P}fly .said{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:#2f4c86;min-height:3em}
      .${P}fly .his{font:italic 16px/1.4 Georgia,serif;color:${PENCIL};border-left:3px solid ${PENCIL};padding-left:10px}
      .${P}fly button.done{opacity:.55}
      .${P}drift{animation:${P}dr 5s ease-in-out infinite}@keyframes ${P}dr{50%{transform:translate(5px,-7px)}}
      @media (prefers-reduced-motion:reduce){.${P}drift{animation:none}}
      .${P}opt{display:grid;grid-template-columns:5.5em 1fr;gap:6px 8px;align-items:center;margin:6px 0}
      .${P}opt b{font-weight:400;font-style:italic}
      .${P}cp.his{color:#4d5b6e;font-style:italic}.${P}cp.tgt{outline:2px dashed ${SEAL};outline-offset:1px;background:rgba(179,33,43,.06)}
      .${P}cp.got{background:rgba(47,107,63,.12)}
      .${P}hd.h{color:#4d5b6e;border-style:dotted}
      .${P}zoom{max-width:min(520px,100%);max-height:100%;overflow:auto;background:${PAPER};padding:10px;border:1.5px solid ${INK}}.${P}zoom img{display:block;width:100%;height:auto;margin-bottom:8px}
    </style>
    <div class="${P}plate"><h2>${pic("tab-specimens")}${STG[stage].plate}</h2>
      <section class="${P}left" aria-label="Specimen card">
        <div class="${P}tally"></div>
        <svg viewBox="0 0 400 270" aria-label="Specimen drawing with rule"></svg>
        <div class="${P}kit">
          <button type="button" data-t="tap">${pic("dial-clock")}Stopwatch: tap at each glow</button>
          <button type="button" data-t="rule">Read the rule</button>
          <button type="button" data-t="tag">${pic("dial-altimeter")}Read the altimeter tag</button>
          <button type="button" class="pell" data-t="pell" hidden>Pell’s tally</button>
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
    const log = (t, voice) => { const l = $("." + P + "log"); l.textContent = t; l.className = P + "log" + (voice ? " v" : ""); };
    const losses = api.store.get("losses", 0);
    st.pellLeft = 3; st.helped = losses >= 2;

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
      d += `<g class="${s.drift && !api.reducedMotion ? P + "drift" : ""}">${g.join("")}</g>`;
      // rule
      const RY = 226;
      d += `<rect x="${X0 - 6}" y="${RY}" width="${110 * MM + 12}" height="22" fill="#e7d6a8" stroke="${INK}"/>`;
      for (let mm = 0; mm <= 110; mm++) { const x = X0 + mm * MM, h = mm % 10 === 0 ? 10 : mm % 5 === 0 ? 7 : 4; d += `<line x1="${x}" x2="${x}" y1="${RY}" y2="${RY + h}" stroke="${INK}" stroke-width=".6"/>`; if (mm % 10 === 0 && (mm % 20 === 0 || mm === 110)) d += `<text x="${x}" y="${RY + 21}" font-size="11" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">${mm}</text>`; }
      d += `<line x1="${X0}" x2="${X0}" y1="${CY - 50}" y2="${RY}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 3"/>`;
      d += `<g class="${P}jaw" tabindex="0" role="slider" aria-label="Rule jaw, millimetres" style="cursor:ew-resize"><rect class="${P}jhit" x="-14" y="${CY - 60}" width="28" height="${RY - CY + 86}" fill="transparent"/><line x1="0" x2="0" y1="${CY - 56}" y2="${RY + 22}" stroke="${SEAL}" stroke-width="1.6"/><path d="M-7,${RY + 24} L0,${RY + 14} L7,${RY + 24}Z" fill="${SEAL}"/></g>`;
      d += `<text x="390" y="22" text-anchor="end" font-size="15" font-style="italic" fill="${INK}" font-family="IM Fell English,Georgia,serif">fig. ${s.id}. ${s.label}</text>`;
      d += `<g class="${P}tag"><rect x="306" y="146" width="80" height="42" fill="#f3ead0" stroke="${INK}"/><circle cx="314" cy="167" r="3" fill="none" stroke="${INK}"/><text x="350" y="162" font-size="10" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">ALT TAG</text><text x="350" y="180" font-size="13" text-anchor="middle" fill="${INK}" font-family="Courier Prime,monospace">${st.m.alt != null ? fmt("alt", s.alt) : "· · ·"}</text></g>
        <text x="${X0 + st.jaw * MM}" y="${RY - 6}" class="${P}jawv" font-size="12" text-anchor="middle" fill="${SEAL}" font-family="Courier Prime,monospace">${st.jaw} mm</text>
        <g class="${P}stamp" opacity="0"><rect x="120" y="70" width="170" height="44" fill="none" stroke="${SEAL}" stroke-width="3" transform="rotate(-8 205 92)"/><text x="205" y="100" text-anchor="middle" font-size="22" fill="${SEAL}" font-family="Courier Prime,monospace" font-weight="700" transform="rotate(-8 205 92)" letter-spacing="3"></text></g>`;
      svg.innerHTML = d;
      placeJaw();
    };
    const placeJaw = () => { const j = svg.querySelector("." + P + "jaw"); if (j) { j.setAttribute("transform", `translate(${X0 + st.jaw * MM},0)`); j.setAttribute("aria-valuenow", st.jaw); }
      const v = svg.querySelector("." + P + "jawv"); if (v) { v.setAttribute("x", X0 + st.jaw * MM); v.textContent = `${st.jaw} mm`; } };
    const stamp = (txt, ok) => { const g = svg.querySelector("." + P + "stamp"); if (!g) return; g.querySelector("text").textContent = txt; g.querySelectorAll("rect,text").forEach((n) => { n.setAttribute(n.tagName === "text" ? "fill" : "stroke", ok ? INK : SEAL); }); g.setAttribute("opacity", 1); };
    const svgX = (e) => { const r = svg.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 400; };
    let drag = false;
    on(svg, "pointerdown", (e) => { if (!st.started || st.over) return; const x = svgX(e); if (Math.abs(x - (X0 + st.jaw * MM)) < 30 || e.target.closest("." + P + "jaw")) { drag = true; try { svg.setPointerCapture(e.pointerId); } catch {} } });
    on(svg, "pointermove", (e) => { if (!drag) return; st.jaw = Math.max(0, Math.min(110, Math.round((svgX(e) - X0) / MM * 2) / 2)); placeJaw(); });
    on(svg, "pointerup", () => { drag = false; });
    on(svg, "keydown", (e) => { if (!e.target.closest("." + P + "jaw")) return; if (e.key === "ArrowLeft") st.jaw = Math.max(0, st.jaw - (e.shiftKey ? 0.5 : 1)); else if (e.key === "ArrowRight") st.jaw = Math.min(110, st.jaw + (e.shiftKey ? 0.5 : 1)); else return; e.preventDefault(); placeJaw(); });

    // glow: flashes once per period (opacity only)
    const loop = (now) => {
      const h = svg.querySelector("." + P + "halo");
      if (h && st.started && stage < 2) { const per = spec().glow * 1000, ph = ((now - st.t0) % per) / per; h.setAttribute("opacity", ph < 0.12 ? 1 - ph / 0.12 * 0.3 : 0.12); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ---- measuring kit
    const renderMeas = () => {
      const s = spec(), m = st.m;
      $("." + P + "meas").innerHTML = ["glow", "len", "alt"].map((t) => `<b>${TRAIT[t]}</b><span>${m[t] != null ? fmt(t, m[t]) + (t === "glow" && st.pellTold ? " (Pell’s count)" : "") : t === "glow" && st.taps.length ? `tapping <span class="${P}taps">${[0, 1, 2, 3].map((k) => `<i class="${k < st.taps.length ? "f" : ""}"></i>`).join("")}</span>` : "not measured"}</span>`).join("");
      $("." + P + "tally").textContent = `SPECIMEN ${st.i + 1} OF ${SPECS.length} · NAMED ${st.named} · KEYED NEW ${st.keyedNew} · MISCLASSIFIED ${st.misclassified}`;
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
          st.m.glow = Math.round(iv * 10) / 10; st.taps = []; st.pellTold = false;
          log(`Three glow intervals: ${fmt("glow", st.m.glow)}.`);
        } else log(`Tap ${st.taps.length} of 4: tap again as it glows.`);
      }
      if (t === "rule") { st.m.len = st.jaw; log(st.jaw === 0 ? "Drag the red jaw along the rule to the specimen's tip first." : `Rule read at ${fmt("len", st.jaw)}.`); if (st.jaw === 0) delete st.m.len; }
      if (t === "tag") { st.m.alt = s.alt; log(`Altimeter tag: ${fmt("alt", s.alt)}.`); drawSpec(); }
      if (t === "pell" && st.pellLeft > 0 && s.pell != null) {
        st.pellLeft--; st.m.glow = s.pell; st.pellTold = true;
        log(`Pell, counting on her fingers: “${s.pell.toFixed(1)} seconds, I promise.” She has ${st.pellLeft} count${st.pellLeft === 1 ? "" : "s"} left in her today.`, true);
        pellBtn.innerHTML = `${pic("token-witness-pell")}Pell’s tally (${st.pellLeft})`; pellBtn.disabled = st.pellLeft <= 0;
      }
      renderMeas(); renderKey();
    };
    el.querySelectorAll("[data-t]").forEach((b) => on(b, "click", () => tool(b.dataset.t)));

    // ---- the key
    const keyEl = $("." + P + "key"), act = $("." + P + "act");
    const nameText = (n) => typeof n === "number" ? `${n}` : n;
    function renderKey() {
      const pg = st.keyedNew ? "key-page-her-pencil" : "key-page-print";
      keyEl.innerHTML = A.has(pg) ? `<button type="button" class="${P}kp" aria-label="Look at the key's page">${pic(pg)}<span>THE KEY · Mid-Slopes edition<br>Each couplet is marked with its hand: <span class="${P}hd">PRINT</span> <span class="${P}hd p">HER PENCIL</span></span></button>` : `<div class="${P}tally">THE KEY · each couplet is marked with its hand: PRINT, or HER PENCIL</div>`;
      const kp = keyEl.querySelector("." + P + "kp"); if (kp) on(kp, "click", () => zoom(pg, st.keyedNew ? "The key's page, with your couplet in pencil in its margin. Who printed the rest, the page does not say." : "The key as printed. No author on the page; the title leaf is missing from the terrace copy."));
      for (const c of KEY) {
        const lit = st.cp === c.id && !st.anomaly && !st.atName;
        const row = document.createElement("div"); row.className = P + "cp" + (lit ? " lit" : "") + (c.pencil ? " pencil" : "");
        const hd = `<span class="${P}hd${c.pencil ? " p" : ""}">${c.pencil ? "HER PENCIL" : "PRINT"}</span>`;
        for (const side of ["a", "b"]) {
          const br = c[side];
          const lab = `${c.id}${side}.`, dest = typeof br.go === "number" ? br.go : br.go;
          if (lit) {
            const b = document.createElement("button"); b.type = "button"; b.className = P + "go";
            b.innerHTML = `<span>${lab}</span><span>${br.txt} ……${side === "a" ? hd : ""}</span><span>${nameText(dest)}</span>`;
            b.disabled = st.m[c.t] == null;
            on(b, "click", () => choose(c, side));
            row.appendChild(b);
          } else row.insertAdjacentHTML("beforeend", `<span>${lab}</span><span>${br.txt} ……${side === "a" ? hd : ""}</span><span style="text-align:right">${nameText(dest)}</span>`);
        }
        if (lit && st.m[c.t] == null) row.insertAdjacentHTML("beforeend", `<span class="h">Measure ${TRAIT[c.t].toLowerCase()} first.</span>`);
        if (lit && (st.misses >= 2 || st.helped)) row.insertAdjacentHTML("beforeend", `<span class="h">${TRAIT[c.t]}: ${fmt(c.t, spec()[c.t])} (the measure to use)</span>`);
        keyEl.appendChild(row);
      }
    }
    const choose = (c, side) => {
      if (st.over) return;
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
        const k = b.dataset.n; if (st.over) return;
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
      on(w, "click", () => { if (st.over) return; const s = spec();
        const fix = s.fix || WOLF_FIX, ok = a.trait === fix.trait && a.thr === fix.thr && a.at === "leaf";
        if (!ok) {
          a.tries++;
          log(a.tries >= 2 || stage === 0 ? `Lira's note: ${TRAIT[fix.trait].toLowerCase()} is ${fmt(fix.trait, s[fix.trait])} here, and the description stops at ${fmt(fix.trait, fix.thr)}. Separate there, just before the name.` : "That couplet does not separate it from the name it reached. Try again.");
          return;
        }
        const id = KEY.length + 1, T2 = fix.trait, hi = s[T2] >= fix.thr, old = st.atName;
        const word = T2 === "alt" ? ["Found below", "Found", "or above"] : T2 === "len" ? ["Length under", "Length", "or more"] : ["Glow period under", "Glow period", "or more"];
        st.leaf.c[st.leaf.side].go = id;
        KEY.push({ id, t: T2, pencil: true, a: { txt: `${word[0]} ${fmt(T2, fix.thr)}`, go: hi ? old : fix.newName }, b: { txt: `${word[1]} ${fmt(T2, fix.thr)} ${word[2]}`, go: hi ? fix.newName : old }, test: (v) => (v < fix.thr ? "a" : "b") });
        NAMES[fix.newName] = NAMES[fix.newName] || { ...NAMES[old], text: "Keyed in pencil by Lira." };
        st.keyedNew++; stamp("KEYED NEW", true);
        const wolf = fix === WOLF_FIX;
        log(wolf ? "Couplet written in pencil. The juvenile is keyed as new: an Ember Wolf, too high. Lira underlines the altitude twice." : `Couplet ${id} written in pencil: ${fix.newName.replace(" (new)", "")}. ${st.keyedNew === 3 ? "Three breaks in one plate. A key that breaks this often is describing a country that has moved." : "The key is one branch longer, and the branch is hers."}`, true);
        renderKey();
        const found = wolf ? pic("fig-wolf", "", "Ember Wolf, juvenile, 2 600 m") + pic("pell-page-5", "", "Pell's page: WOLF BABY ONE. 2 600 M TOO HIGH") : "";
        act.innerHTML = found ? `<div class="${P}found">${found}<span>Pell copies it into her own book that evening, in capitals: 2 600 M. TOO HIGH.</span></div>` : "";
        later(next, found ? (api.reducedMotion ? 1800 : 3600) : 1600);
      });
    };
    const settle = (ok, name) => {
      if (ok) { st.named++; log(`${name}: named.`); stamp("NAMED", true); }
      else {
        st.misclassified++; stamp("MISCLASSIFIED", false);
        const s = spec();
        log(s.anomaly && name === s.name ? `${name}? ${TRAIT[(s.fix || WOLF_FIX).trait]} ${fmt((s.fix || WOLF_FIX).trait, s[(s.fix || WOLF_FIX).trait])}: outside the description. Lira writes the name in, and it sits there wrong.` : `${name}: logged misclassified. ${st.pellTold ? "Pell’s count was off; she looks at her fingers and goes quiet." : "It was not that."}`);
      }
      if (st.misclassified >= STG[stage].limit) { st.over = true; renderMeas(); act.innerHTML = ""; api.store.set("losses", losses + 1); if (stage === 0) api.shared.set("wolf", "misclassified"); later(() => api.end({ outcome: "lose", text: `${stage === 0 ? "Every jar" : "Two specimens"} misclassified. The collection goes into the journal unverified (${st.named} named, ${st.keyedNew} keyed new), and Pell copies the wrong names into her own book in her careful capitals.` }), 900); return; }
      later(next, 900);
    };
    const timers = []; const later = (f, ms) => timers.push(setTimeout(f, ms));
    const next = () => {
      st.i++; st.cp = 1; st.m = {}; st.taps = []; st.atName = null; st.anomaly = null; st.path = []; st.jaw = 0; act.innerHTML = "";
      if (st.i >= SPECS.length) {
        st.over = true; st.i = SPECS.length - 1; api.store.set("losses", 0);
        const breaks = SPECS.filter((x) => x.anomaly).length, clean = st.misclassified === 0 && st.keyedNew === breaks;
        if (stage === 0) api.shared.set("wolf", st.keyedNew ? "keyed" : "misclassified");
        const text = stage === 0 ? `Three jars keyed: ${st.named} named, ${st.keyedNew} keyed as new${st.misclassified ? `, ${st.misclassified} misclassified` : ""}. ${st.keyedNew ? "The wolf now has its own couplet in Lira's pencil, and the key is one branch truer than it was this morning. Pell asks why it came up so high. Lira says she does not know yet, and writes that down too." : "The wolf went in under the old name. Nothing on the page says the wolves are climbing."}`
          : `Four specimens keyed: ${st.named} named, ${st.keyedNew} of ${breaks} breaks mended in pencil${st.misclassified ? `, ${st.misclassified} misclassified` : ""}. ${clean ? "The key broke three times in one plate, on altitude, on length and on the glow itself, and each time she wrote the branch it lacked. Three is not an anomaly. Three is a direction." : "Not every break was mended; the plate goes into Book III with a name on it that the specimen does not fit."}`;
        api.end({ outcome: clean ? "win" : "done", text });
        return;
      }
      st.t0 = performance.now(); st.pellTold = false; drawSpec(); renderMeas(); renderKey();
      if (stage === 0 && st.i === 1) { pellBtn.hidden = false; log("Pell drags a stool to the bench. “I can count glows faster than you. Ask me.” She means it. Her numbers are not always right.", true); }
      else if (stage === 0 && st.i === 2) log("A track cast from the upper bridge, still damp. Joren brought it down this morning, wrapped in his scarf. Follow the key to its name, then look at the tag.", true);
      else if (stage === 1 && st.i === 1) log("A frond from a low-gravity pocket. It will not lie still on the plate; nothing from up there does.", true);
      else if (stage === 1 && st.i === 2) log("One of the Lowland mutation reports Kade forwarded, with the plate itself wrapped in oilcloth.", true);
      else if (stage === 1 && st.i === 3) log("A web thread from Joren’s harvest terrace. Count its glow twice, or ask Pell’s tally: it is in no hurry.", true);
    };

    // ---- overlays: a page looked at closely, and the Flyleaf (Book II, Cinder Reach)
    let over = null;
    const closeOver = () => { if (over) { over.remove(); over = null; } };
    const zoom = (id, cap) => {
      closeOver(); over = document.createElement("div"); over.className = P + "over";
      over.innerHTML = `<div class="${P}zoom" role="dialog" aria-label="The key's page">${pic(id, "", cap)}<p style="font:italic 15px/1.4 Georgia,serif;margin:0 0 8px">${cap}</p><button type="button">Back to the bench</button></div>`;
      el.appendChild(over); on(over, "click", (e) => { if (e.target === over || e.target.closest("button")) closeOver(); }); over.querySelector("button").focus();
    };
    // ---- the twist. First the Flyleaf (phase 1's drawer, now the way in), then reverse keying.
    const wolfKeyed = api.shared.get("wolf", null) === "keyed";
    const flyleaf = (then) => {
      closeOver(); over = document.createElement("div"); over.className = P + "over";
      const fl = { read: new Set(), tries: 0, done: false };
      const mine = wolfKeyed ? "6b. Found 2 000 m or above …… Ember Wolf, upland form (new)" : null;
      const draw = (stg) => {
        const tx = over.querySelector(".tx");
        if (stg === "door") {
          tx.innerHTML = `<div class="ch">BOOK II · CINDER REACH ARCHIVE</div><h3>One more drawer</h3>
            <p>Two thousand metres below Hollin, in the archive at Cinder Reach, the drawer under the specimen bench is not on the index. The label says only: <i>Key, Mid-Slopes. First printing.</i></p>
            <p>You have used this key since your first morning on the terrace.</p>
            <div class="${P}row"><button type="button" data-f="open">Open the drawer</button><button type="button" data-f="leave">Leave it shut</button></div>`;
          over.querySelector(".im").innerHTML = pic(wolfKeyed ? "key-page-her-pencil" : "key-page-print", "", "Your copy of the key") || `<div class="fb">Your copy of the key.</div>`;
        } else if (stg === "leaf") {
          over.querySelector(".im").innerHTML = pic("key-flyleaf", "", "The flyleaf of the key's first printing") || `<div class="fb">CINDER REACH · FIRST PRINTING<br>S.V.<br>2b. Found above 2 000 m: not yet. Leave room.</div>`;
          const all = fl.read.size === 3;
          tx.innerHTML = `<div class="ch">THE FLYLEAF</div><h3>The key, first printing</h3>
            <p>The title leaf your terrace copy never had. Read it as you would a specimen.</p>
            <div class="${P}row">${[["stamp", "The stamp"], ["init", "The initials"], ["pencil", "The pencil"]].map(([k, l]) => `<button type="button" data-r="${k}" class="${fl.read.has(k) ? "done" : ""}">${l}</button>`).join("")}</div>
            <p class="said" aria-live="polite">${fl.said || ""}</p>
            ${all ? `<div class="${P}row"><button type="button" data-f="lay">${mine ? "Lay your couplet beside it" : "Lay your key beside it"}</button></div>` : ""}`;
        } else if (stg === "lay") {
          tx.innerHTML = `<div class="ch">THE FLYLEAF</div><h3>Whose hand?</h3>
            ${mine ? `<p><span class="${P}hd p">HER PENCIL</span> ${mine}</p>` : `<p>Your copy has no couplet for it: the wolf went in under the old name.</p>`}
            <p class="his">2b. Found above 2 000 m: not yet. Leave room.</p>
            <p>${mine ? "The same cut, at the same altitude, on a leaf printed before you ever climbed to Hollin." : "A cut at 2 000 m that your key never made, on a leaf printed before you ever climbed to Hollin."} Mark the hand that wrote it.</p>
            <div class="${P}row"><button type="button" data-h="print">Print</button><button type="button" data-h="hers">Her pencil</button><button type="button" data-h="his">A third hand: his pencil</button></div>
            <p class="said" aria-live="polite">${fl.said || ""}</p>`;
        } else {
          tx.innerHTML = `<div class="ch">THE FLYLEAF</div><h3><span class="${P}hd h" style="font-size:13px">HIS PENCIL</span></h3>
            <p class="his">2b. Found above 2 000 m: not yet. Leave room.</p>
            <p class="said">Upright, precise, patient. Not print, and not mine. Whoever S.V. is wrote the key I have trusted since the first morning, and left room in it for an animal that had not climbed yet.</p>
            <p>Below it he has pencilled three more couplets, and each ends in a name left blank. A key is read from the measure to the name. These must be read the other way.</p>
            <div class="${P}row"><button type="button" data-f="close">Turn the leaf over</button></div>`;
        }
        tx.querySelectorAll("[data-f]").forEach((b) => on(b, "click", () => {
          const k = b.dataset.f;
          if (k === "open") { api.shared.set("flyleaf", true); draw("leaf"); }
          else if (k === "lay") { fl.said = ""; draw("lay"); }
          else if (k === "leave") { closeOver(); st.over = true; api.end({ outcome: "done", text: "At Cinder Reach one drawer under the bench stays shut, and the key stays a printed thing with no author. Whatever was pencilled on its first leaf waits for another reader." }); }
          else { closeOver(); then(); }
        }));
        tx.querySelectorAll("[data-r]").forEach((b) => on(b, "click", () => {
          const k = b.dataset.r; fl.read.add(k);
          fl.said = k === "stamp" ? "CINDER REACH · FIRST PRINTING. The archive's own stamp, in the blue the Continuum used before it was the Continuum." : k === "init" ? "S.V., in pencil, where an owner signs. Nobody on the terrace ever said who wrote the key." : "Below the initials, pencilled couplets for the blank end of the key. 2b. Found above 2 000 m: not yet. Leave room.";
          draw("leaf");
        }));
        tx.querySelectorAll("[data-h]").forEach((b) => on(b, "click", () => {
          const k = b.dataset.h;
          if (k === "his") { fl.done = true; draw("known"); return; }
          fl.tries++; fl.said = k === "print" ? "Print does not smudge under a thumb. This is graphite." : "My pencil slants right and crosses its sevens. This one stands upright, and I was not here.";
          draw("lay");
        }));
        const f = tx.querySelector("button"); if (f) f.focus();
      };
      over.innerHTML = `<div class="${P}fly" role="dialog" aria-label="The Flyleaf"><div class="im"></div><div class="tx"></div></div>`;
      el.appendChild(over); draw("door");
    };

    // reverse keying: from his blank leaf back to the measures that would have to be true
    const rv = { i: 0, pick: {}, got: [], misses: 0, said: "" };
    const KEYR = [
      { id: 1, t: "glow", a: ["Glow period under 4 s", 2], b: ["Glow period 4 s or more", 4], test: (v) => v < 4 },
      { id: 2, t: "len", a: ["Length over 40 mm", "Glassleaf"], b: ["Length 40 mm or less", 3], test: (v) => v > 40 },
      { id: 3, t: "alt", a: ["Found below 2 000 m", "Ash-fern"], b: ["Found 2 000 m or above", 8], test: (v) => v < 2000 },
      { id: 4, t: "len", a: ["Length over 60 mm", 5], b: ["Length 60 mm or less", "Spore-Weaver strand"], test: (v) => v > 60 },
      { id: 5, t: "glow", a: ["Glow period 6 s or more", 6], b: ["Glow period under 6 s", 9], test: (v) => v >= 6 },
      { id: 6, t: "alt", hand: wolfKeyed ? "p" : "h", a: ["Found below 2 000 m", "Ember Wolf"], b: ["Found 2 000 m or above", 7], test: (v) => v < 2000 },
      { id: 7, t: "len", hand: "h", a: ["Length 100 mm or more", "x"], b: ["Length under 100 mm", "Ember Wolf, upland form"], test: (v) => v >= 100 },
      { id: 8, t: "alt", hand: "h", a: ["Found 3 500 m or above", "y"], b: ["Found below 3 500 m", "Spire-moss"], test: (v) => v >= 3500 },
      { id: 9, t: "alt", hand: "h", a: ["Found 3 000 m or above", "z"], b: ["Found below 3 000 m", "Ridgeback Strider"], test: (v) => v >= 3000 },
    ];
    const follow = (m) => { let c = 1; const path = []; for (;;) { const k = KEYR.find((x) => x.id === c), side = k.test(m[k.t]) ? "a" : "b"; path.push(k.id + side); const go = k[side][1]; if (typeof go === "number") c = go; else return { leaf: go, path }; } };
    const isBlank = (x) => BLANKS.some((b) => b.id === x);
    const renderRev = (path = []) => {
      const tgt = BLANKS[rv.i];
      keyEl.innerHTML = `<div class="${P}tally">HIS LEAF · hands: <span class="${P}hd">PRINT</span> <span class="${P}hd p">HER PENCIL</span> <span class="${P}hd h">HIS PENCIL</span></div>`;
      for (const c of KEYR) {
        const row = document.createElement("div");
        const hasT = tgt && (c.a[1] === tgt.id || c.b[1] === tgt.id), hasG = [c.a[1], c.b[1]].some((x) => rv.got.some((g) => g.id === x));
        row.className = P + "cp" + (c.hand === "h" ? " his" : c.hand === "p" ? " pencil" : "") + (hasT ? " tgt" : hasG ? " got" : "");
        const hd = `<span class="${P}hd${c.hand ? " " + c.hand : ""}">${c.hand === "h" ? "HIS PENCIL" : c.hand === "p" ? "HER PENCIL" : "PRINT"}</span>`;
        for (const side of ["a", "b"]) {
          const go = c[side][1], lit = path.includes(c.id + side);
          const nm = isBlank(go) ? (rv.got.some((g) => g.id === go) ? "drawn" : "not yet") : go;
          row.insertAdjacentHTML("beforeend", `<span style="${lit ? "font-weight:700" : ""}">${c.id}${side}.</span><span style="${lit ? "text-decoration:underline" : ""}">${c[side][0]} ……${side === "a" ? hd : ""}</span><span style="text-align:right">${nm}</span>`);
        }
        keyEl.appendChild(row);
      }
      if (!tgt) { act.innerHTML = ""; return; }
      const row = (t) => `<b>${TRAIT[t]}</b><div class="${P}row" style="margin:0">${OPTS[t].map((v) => `<button type="button" data-o="${t}:${v}" class="${rv.pick[t] === v ? "sel" : ""}" aria-pressed="${rv.pick[t] === v}">${fmt(t, v)}</button>`).join("")}</div>`;
      const ready = ["glow", "len", "alt"].every((t) => rv.pick[t] != null);
      act.innerHTML = `<div class="${P}box"><p>Leaf <b>${tgt.label}</b>, in his pencil: <i>not yet. Leave room.</i> ${rv.i === 0 ? "Choose the measures a specimen would need for the key to end there." : `(${tgt.hint})`}</p>
        <div class="${P}opt">${row("glow")}${row("len")}${row("alt")}</div>
        <div class="${P}row"><button type="button" data-go="1" ${ready ? "" : "disabled"}>Follow the key with these</button></div>
        <p class="said" style="font:italic 15px/1.4 Georgia,serif;margin:6px 0 0;min-height:2.8em" aria-live="polite">${rv.said}</p></div>`;
      act.querySelectorAll("[data-o]").forEach((b) => on(b, "click", () => { const [t, v] = b.dataset.o.split(":"); rv.pick[t] = +v; rv.said = ""; renderRev(); act.querySelector(`[data-o="${b.dataset.o}"]`)?.focus(); }));
      on(act.querySelector("[data-go]"), "click", () => {
        if (st.over) return;
        const r = follow(rv.pick);
        if (r.leaf === tgt.id) {
          rv.got.push({ id: tgt.id, ...rv.pick }); rv.i++; rv.pick = {}; rv.said = "";
          log(["It keys out at his blank leaf. Lira draws what the measures describe, lightly, the way she draws anything she has not seen: a wolf the size of a strider, glowing slow, above the line.", "A second leaf filled. A moss for ledges where nothing grows yet.", "The third. A strider that never comes down."][rv.got.length - 1], true);
          drawRev(); renderRev(r.path);
          if (rv.i >= BLANKS.length) {
            st.over = true; api.store.set("losses", 0);
            later(() => api.end({ outcome: "win", text: `Three blank leaves, three drawings, every one of them above ${fmt("alt", Math.min(...rv.got.map((g) => g.alt)) < 3000 ? 2000 : 3000)}. Read backwards, the key is not a description of the mountain. It is an order placed with it: higher, larger, slower, and room left for each. She had written it herself in Book I and not known whose sentence she was finishing: “Life is not choosing upward. It is being chosen.”${rv.misses ? "" : " Not one false start on his page."}` }), api.reducedMotion ? 600 : 2200);
          }
          return;
        }
        rv.misses++;
        rv.said = isBlank(r.leaf) ? "Those measures reach a blank leaf, but not this one." : `Those measures key out at ${r.leaf}: something that already exists. (${r.path.join(" → ")})`;
        if (rv.misses >= STG[2].limit) { st.over = true; api.store.set("losses", losses + 1); later(() => api.end({ outcome: "lose", text: `Three sets of measures, and each time the key led back to a creature already on the plate. ${rv.got.length} of his three blank leaves drawn. The flyleaf goes back in its drawer, and what he left room for stays a line of pencil.` }), 700); }
        renderRev(r.path);
      });
    };
    // the plate: an altitude ladder with every named form on it, and the three drawn as they are found
    const drawRev = () => {
      const yA = (m) => 246 - m / 4000 * 214, known = [["Ash-fern", 1000], ["Ember Wolf", 1200], ["Glassleaf", 2250], ["Spore-Weaver strand", 2500], ["Ridgeback Strider", 2250], ["Spire-moss", 2800]];
      let d = `<rect x="4" y="4" width="392" height="262" fill="none" stroke="${INK}" stroke-width=".8"/><line x1="60" x2="60" y1="${yA(4000)}" y2="${yA(0)}" stroke="${INK}" stroke-width="1.2"/>`;
      for (let m = 0; m <= 4000; m += 1000) d += `<line x1="54" x2="60" y1="${yA(m)}" y2="${yA(m)}" stroke="${INK}"/><text x="50" y="${yA(m) + 4}" font-size="10" text-anchor="end" fill="${INK}" font-family="Courier Prime,monospace">${m ? m / 1000 + " 000" : "0"}</text>`;
      d += `<line x1="60" x2="392" y1="${yA(2000)}" y2="${yA(2000)}" stroke="${PENCIL}" stroke-dasharray="3 4"/><text x="388" y="${yA(2000) + 12}" font-size="10" text-anchor="end" font-style="italic" fill="${PENCIL}">2 000 m: the line his pencil drew</text>`;
      known.forEach(([n, m], k) => { d += `<circle cx="${76 + k * 9}" cy="${yA(m)}" r="2.6" fill="${INK}"/><text x="${86 + k * 9}" y="${yA(m) + 3}" font-size="9" font-style="italic" fill="${INK}" opacity=".75">${k === 0 || k === 5 ? n : ""}</text>`; });
      rv.got.forEach((g, k) => {
        const x = 150 + k * 82, y = yA(g.alt), w = 14 + g.len * 0.42, h = 8 + g.len * 0.12;
        d += `<ellipse cx="${x}" cy="${y}" rx="${w / 2 + 14}" ry="${h / 2 + 12}" fill="${TEAL}" opacity="${0.1 + 0.02 * g.glow}"/>`;
        d += g.id === "y" ? [...Array(7)].map((_, j) => `<path d="M${x - 18 + j * 6},${y + 6} q-2,-${8 + (j % 3) * 4} 1,-${14 + (j % 3) * 5}" fill="none" stroke="${PENCIL}" stroke-width="1.2" stroke-dasharray="3 2"/>`).join("")
          : `<path d="M${x - w / 2},${y} C${x - w / 4},${y - h} ${x + w / 4},${y - h} ${x + w / 2},${y} C${x + w / 4},${y + h * 0.7} ${x - w / 4},${y + h * 0.7} ${x - w / 2},${y}Z" fill="rgba(125,122,116,.12)" stroke="${PENCIL}" stroke-width="1.3" stroke-dasharray="4 2"/>` +
            (g.id === "x" ? `<path d="M${x + w / 2},${y} l9,-7 l-2,8 M${x - w / 2},${y} l-12,4" fill="none" stroke="${PENCIL}" stroke-width="1.3"/>` : [...Array(5)].map((_, j) => `<path d="M${x - w / 3 + j * w / 6},${y - h * 0.7} l2,-6" stroke="${PENCIL}" stroke-width="1.2"/>`).join(""));
        d += `<text x="${x}" y="${y - h - 14}" font-size="10" text-anchor="middle" font-style="italic" fill="${PENCIL}">${BLANKS.find((b) => b.id === g.id).label}: ${fmt("glow", g.glow)}, ${fmt("len", g.len)}</text><line x1="60" x2="${x - w / 2 - 14}" y1="${y}" y2="${y}" stroke="${PENCIL}" stroke-width=".6"/>`;
      });
      d += `<text x="390" y="22" text-anchor="end" font-size="15" font-style="italic" fill="${INK}" font-family="IM Fell English,Georgia,serif">fig. 0. Not yet</text>`;
      svg.innerHTML = d; svg.setAttribute("aria-label", "An altitude ladder with the forms the key names, and the ones it leaves room for");
    };

    const pellBtn = el.querySelector("[data-t=pell]"); const pellIco = pic("token-witness-pell"); pellBtn.innerHTML = `${pellIco}Pell’s tally (3)`;
    st.jaw = 0;
    if (stage === 2) { $("." + P + "kit").hidden = true; $("." + P + "meas").hidden = true; $("." + P + "tally").textContent = "HIS THREE BLANK LEAVES"; drawRev(); renderRev(); }
    else { drawSpec(); renderMeas(); renderKey(); if (stage === 1) pellBtn.hidden = false; }
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="pl">${["PLATE XIV", "PLATE XXXI", "THE FLYLEAF"][stage]}</div><h3>${["The Key", "The Key breaks", "The Key, read backwards"][stage]}</h3>
      <p class="goal">${["Name three specimens from the terrace by following the key, couplet by couplet. The last one will not fit.", "Four specimens from the Peaks and the Lowlands. Three of them break the key, each on a different measure: write the couplet it lacks.", "Open the drawer at Cinder Reach. Then, for each leaf his pencil left blank, choose the measures that lead there."][stage]}</p>
      ${stage === 2 ? `<ol><li><b>hand</b><span>Read the flyleaf: stamp, initials, pencil. Say whose hand.</span></li>
      <li><b>pick</b><span>One glow period, one length, one altitude</span></li>
      <li><b>follow</b><span>The key is walked from couplet 1 with your measures</span></li>
      <li><b>3</b><span>Three false starts and the leaf is put away</span></li></ol>` : `<ol><li><b>T</b><span>Stopwatch: tap four times, once at each glow</span></li>
      <li><b>R</b><span>Drag the red jaw to the specimen’s tip, then read the rule</span></li>
      <li><b>G</b><span>Read the altimeter tag</span></li>
      <li><b>1a/1b</b><span>Choose the branch your measure fits</span></li>
      <li><b>${stage ? "break" : "hands"}</b><span>${stage ? "At a name that does not fit: Anomaly, then the measure, the threshold, and where the couplet goes" : "Each couplet is marked print or pencil. Notice whose."}</span></li></ol>`}
      ${losses >= 2 && stage < 2 ? `<label><input type="checkbox" class="gentle" checked> Lira’s annotated key: show the measure each couplet uses</label>` : ""}
      <button type="button">${["Open the collection", "Open the next plate", "Go down to Cinder Reach"][stage]}</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const g = intro.querySelector(".gentle"); st.helped = !!(g && g.checked);
      intro.remove(); st.started = true; st.t0 = performance.now();
      if (stage === 2) { flyleaf(() => { log("The flyleaf, turned over. Three couplets in his pencil, each ending in a blank. Begin with 7a.", true); renderRev(); const f = act.querySelector("[data-o]"); if (f) f.focus(); }); return; }
      renderKey();
      log(stage === 0 ? "Book I, Hollin Terrace. Three jars on the bench from this week's walks, and Pell watching from the doorway." : "Book III. Specimens from the low-gravity ledges, and the Lowland mutation reports Kade forwarded. Two misclassified and the plate goes in unverified.", true);
    });
    sb.focus();
    on(window, "keydown", (e) => { if (stage === 2 || !st.started || st.over || e.target.closest("input")) return; const k = e.key.toLowerCase(); if (k === "t") { tool("tap"); e.preventDefault(); } else if (k === "r") tool("rule"); else if (k === "g") tool("tag"); else if (k === "p" && !pellBtn.hidden) tool("pell"); });
    if (window.__ezTest) window.__ezTest[api.key] = { st, spec, rv, stage };
    return { unmount() { cancelAnimationFrame(raf); off.forEach((f) => f()); timers.forEach(clearTimeout); } };
  }
}

export default {
  mount(root, api) {
    return runStages(root, api, { names: ["The terrace jars", "Three breaks", "The Flyleaf"], colors: { bg: "#3b2618", fg: "#ebe0c4", accent: "#c8913a", paper: PAPER, ink: INK }, mount: mountStage });
  },
};

// The long puzzle of Lira Calyx (phase 3, DEEP_DIVE section 3): the twelve surgical bars. One per stage,
// across the four books; each is ruled to a length, with blue under the black, and set on a line.
// Measured with the bar gauge (in the mode that holds it), read on the staff (a bar's line is its pitch,
// 14 mm of it one rest) and plotted before the descent (Storm-Song Cipher, from the ledger): walked from
// the core under Peak 12, the twelve end at the north shaft. The ledger, a journal page reachable from
// every mode's stage strip, shows what has been gathered. Shared keys (api.shared):
//   bars    {n: mm}      the bars measured this run
//   finale  {ending, run} the route solved and the choice made (read by loading.js finale())
//   runs    count of finished runs; a later run changes the modes (again())
// Also read here: flyleaf (The Key), gamma (The Assay twist), which open the ending Errata.
const P = "lira-calyx-bars-";
const INK = "#3b2618", PAPER = "#f1e8d2", SEAL = "#b3212b", ARCH = "#3c5a8c", BLACK = "#141414", PENCIL = "#7d7a74";

// pos: the staff position the bar sits on (0 the drone line, 1 the space above, ... 6 the top line).
export const BARS = [
  { n: 1, mm: 28, pos: 1, mode: "key", stage: 0, where: "Book I · The Key: the terrace jars", log: "D 41" },
  { n: 2, mm: 14, pos: 2, mode: "assay", stage: 0, where: "Book I · The Assay: the bark", log: "D 44" },
  { n: 3, mm: 41, pos: 0, mode: "cross-section-climb", stage: 0, where: "Book I · the climb to the ridge", log: "D 52" },
  { n: 4, mm: 28, pos: 4, mode: "under-the-lens", stage: 0, where: "Book I · Under the lens: the lattice", log: "D 58" },
  { n: 5, mm: 41, pos: 1, mode: "assay", stage: 1, where: "Book II · The Assay: the well", log: "D 120" },
  { n: 6, mm: 14, pos: 6, mode: "under-the-lens", stage: 1, where: "Book II · Under the lens: their lab", log: "D 131" },
  { n: 7, mm: 41, pos: 3, mode: "journal-audit", stage: 0, brief: true, where: "Book II · the brief, Appendix C, line 1 (Journal Audit: gauge it; Storm-Song Cipher: read it)", log: "D 146" },
  { n: 8, mm: 28, pos: 0, mode: "storm-song-cipher", stage: 2, brief: true, where: "Book II · the brief, line 3 (Storm-Song Cipher: the fourth song)", log: "D 146" },
  { n: 9, mm: 14, pos: 5, mode: "storm-song-cipher", stage: 2, brief: true, where: "Book II · the brief, line 4 (Storm-Song Cipher: the fourth song)", log: "D 146" },
  { n: 10, mm: 41, pos: 2, mode: "storm-song-cipher", stage: 2, brief: true, where: "Book II · the brief, line 5 (Storm-Song Cipher: the fourth song)", log: "D 146" },
  { n: 11, mm: 28, pos: 0, mode: "cross-section-climb", stage: 1, where: "Book III · the climb on the Peaks", log: "D 186" },
  { n: 12, mm: 28, pos: 1, mode: "journal-audit", stage: 1, where: "Book III · Journal Audit: the stolen log", log: "D 202" },
];
// the bars the ledger's own gauge measures (the others have a gauge in their mode already)
const SLIP = new Set([1, 2, 3, 4, 5, 6, 11]);
export const rests = (mm) => Math.max(1, Math.round(mm / 14));

export const got = (api) => { const b = api.shared.get("bars", null); return b && typeof b === "object" ? b : {}; };
export const record = (api, n, mm) => { const b = { ...got(api) }; if (b[n]) return false; b[n] = mm; api.shared.set("bars", b); return true; };
export const runs = (api) => Math.max(0, api.shared.get("runs", 0) | 0);
export const again = (api) => runs(api) >= 1;
export const slipFor = (key, stage) => BARS.find((b) => SLIP.has(b.n) && b.mode === key && b.stage === stage) || null;

// the route: walked forwards from the core, a note's bearing is 30 degrees a step, a rest 100 m
export function walk(legs) {
  let x = 0, y = 0; const pts = [[0, 0]];
  for (const [p, r] of legs) for (let k = 0; k < r; k++) { x += Math.sin(p * Math.PI / 6); y += Math.cos(p * Math.PI / 6); pts.push([x, y]); }
  return pts;
}
export const TRUE_LEGS = BARS.map((b) => [b.pos, rests(b.mm)]);

// An ending card laid behind a result: the generated card from keyart.json, darkened, with its lettering.
export function cardBehind(root, api, id) {
  const src = api.keyart ? api.keyart("ending-" + id) : "";
  const A = api.art;
  const lt = A && A.has && A.has("lettering-" + id) ? A.url("lettering-" + id) : "";
  if (!src && !lt) return null;
  const d = document.createElement("div");
  d.className = P + "card";
  d.setAttribute("aria-hidden", "true");
  d.innerHTML = `<style>.${P}card{position:absolute;inset:0;z-index:15;background:#0d0e10 center/cover no-repeat;pointer-events:none}
    .${P}card::after{content:"";position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.25) 55%,rgba(0,0,0,.78))}
    .${P}card img{position:absolute;left:50%;top:14px;transform:translateX(-50%);width:min(560px,calc(100% - 32px));height:auto;box-shadow:0 4px 16px rgba(0,0,0,.45);z-index:1}</style>${lt ? `<img alt="" src="${lt}">` : ""}`;
  if (src) d.style.backgroundImage = `url("${src}")`;
  root.appendChild(d);
  return d;
}

// The ledger: a button in the stage strip and the page it opens.
export function ledger(root, api, ctx) {
  const off = [];
  const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
  const A = api.art || { has: () => false, url: () => "" };
  const style = document.createElement("style");
  style.textContent = `
    .${P}btn{flex:0 0 auto!important;min-width:0;border:0;border-left:1px solid rgba(128,128,128,.5)!important;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;cursor:pointer;padding:0 10px!important;opacity:1!important;display:flex;align-items:center;gap:6px}
    .${P}btn i{display:inline-block;width:18px;height:6px;background:${BLACK};box-shadow:0 1.5px 0 ${ARCH},0 -1.5px 0 ${ARCH};outline:1px solid rgba(241,232,210,.6)}
    .${P}btn.here{animation:${P}glow 1.4s steps(2) infinite}
    .${P}btn.here::after{content:"·1 HERE";font-size:11px;color:#ffd37a}
    @keyframes ${P}glow{50%{background:rgba(255,211,122,.18)}}
    @media (prefers-reduced-motion:reduce){.${P}btn.here{animation:none}}
    .${P}over{position:absolute;inset:34px 0 0 0;z-index:30;display:grid;place-items:start center;background:rgba(10,10,10,.74);padding:12px;overflow:auto}
    .${P}pg{position:relative;width:min(640px,100%);background:${PAPER};color:${INK};border:2px solid ${INK};padding:14px 14px 16px;box-shadow:5px 5px 0 rgba(0,0,0,.35);font:15px/1.4 Georgia,serif}
    .${P}pg::before{content:"";position:absolute;inset:0;background:var(--lp) center top/100% auto no-repeat;opacity:.18;pointer-events:none}
    .${P}pg > *{position:relative}
    .${P}pg h3{font:italic 400 24px/1.1 'IM Fell English',Georgia,serif;margin:0 0 2px}
    .${P}pg .k{font:700 12px 'Courier Prime',monospace;letter-spacing:.12em;opacity:.8}
    .${P}pg p{margin:6px 0 10px}
    .${P}rows{list-style:none;margin:8px 0 10px;padding:0;border-top:1px solid rgba(59,38,24,.3)}
    .${P}rows li{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:2px 8px;align-items:center;border-bottom:1px solid rgba(59,38,24,.2);padding:5px 2px;min-height:36px}
    .${P}rows li b{font:700 14px 'Courier Prime',monospace;color:${SEAL}}
    .${P}rows li .w{font:13px/1.3 Georgia,serif;min-width:0}
    .${P}rows li .w small{display:block;color:${ARCH};font:italic 13px 'IM Fell English',Georgia,serif;transform:skewX(-12deg);transform-origin:left}
    .${P}rows li .v{font:700 12px 'Courier Prime',monospace;color:${ARCH};white-space:nowrap;display:flex;align-items:center;gap:6px}
    .${P}rows li .v.no{color:${PENCIL};font-weight:400}
    .${P}rows li.cur{background:rgba(255,211,122,.22)}
    .${P}b{display:inline-block;height:7px;background:${BLACK};box-shadow:0 1.5px 0 ${ARCH};vertical-align:middle}
    .${P}pg button{font:700 14px 'Courier Prime',monospace;letter-spacing:.06em;min-height:44px;padding:8px 14px;cursor:pointer;border:1.5px solid ${INK};background:transparent;color:${INK};margin:4px 6px 0 0}
    .${P}pg button.go{background:${INK};color:${PAPER}}
    .${P}pg button:disabled{opacity:.4;cursor:default}
    .${P}pg button:hover:not(:disabled),.${P}pg button:focus-visible{outline:2px solid ${SEAL};outline-offset:2px}
    .${P}gauge{border:1.5px dashed ${ARCH};background:rgba(60,90,140,.06);padding:10px;margin:8px 0}
    .${P}gauge .two{display:flex;flex-wrap:wrap;gap:8px}
    .${P}gauge .two button{flex:1 1 140px;margin:0;padding:6px;background:#f6efdc;display:flex;flex-direction:column;align-items:stretch;gap:4px}
    .${P}gauge .two img{display:block;width:100%;height:34px;object-fit:fill;mix-blend-mode:multiply}
    .${P}gauge svg{display:block;width:100%;height:auto;max-width:360px;touch-action:manipulation}
    .${P}gauge label{display:grid;grid-template-columns:76px minmax(0,1fr) 54px;gap:6px;align-items:center;font:12px 'Courier Prime',monospace}
    .${P}gauge input[type=range]{width:100%;accent-color:${ARCH};min-height:30px}
    .${P}say{font:italic 16px/1.4 'IM Fell English',Georgia,serif;min-height:1.4em;color:${INK}}
    .${P}say.bad{color:${SEAL}}
    .${P}route .strips{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
    .${P}route .sp{border:1px solid rgba(59,38,24,.35);background:#f6efdc;padding:4px}
    .${P}route .sp.bad{border-color:${SEAL};box-shadow:0 0 0 2px rgba(179,33,43,.3)}
    .${P}route .sp svg{display:block;width:100%;height:auto;cursor:pointer}
    .${P}route .ctl{display:grid;grid-template-columns:auto 1fr auto;gap:2px 4px;align-items:center;font:12px 'Courier Prime',monospace}
    .${P}route .ctl button{min-height:32px;padding:0 8px;margin:0;font-size:13px}
    .${P}route .ctl span{text-align:center}
    .${P}route .map svg{display:block;width:100%;height:auto;max-height:52vh;background:#f1e8d0;border:1px solid ${INK};margin:8px 0}
    .${P}choice{border:2px solid ${INK};padding:10px;margin:8px 0;background:#f6efdc}
    .${P}choice small{display:block;font:13px/1.35 Georgia,serif;color:${PENCIL};margin:2px 0 6px}
  `;
  root.appendChild(style);
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = P + "btn";
  btn.title = "The twelve bars: the ledger";
  ctx.strip.appendChild(btn);
  let over = null, stageNow = 0, onKey = null;
  const isOpen = () => !!over;

  const count = () => Object.keys(got(api)).length;
  const refreshBtn = () => {
    const c = count(), s = slipFor(api.key, stageNow);
    btn.innerHTML = `<i></i>${c}/12`;
    btn.setAttribute("aria-label", `The twelve bars: ${c} of 12 measured${s && !got(api)[s.n] ? ". There is a ruled bar on this page" : ""}`);
    btn.classList.toggle("here", !!(s && !got(api)[s.n]));
  };
  const barSvg = (mm, k = 2.2) => `<span class="${P}b" style="width:${Math.round(mm * k)}px"></span>`;

  const close = () => {
    if (!over) return;
    over.remove(); over = null;
    if (onKey) { window.removeEventListener("keydown", onKey, true); onKey = null; }
    refreshBtn(); btn.focus();
  };
  const open = () => {
    if (over) { close(); return; }
    over = document.createElement("div"); over.className = P + "over";
    root.appendChild(over);
    // keys typed in the ledger stay in it (the jaws and buttons still get theirs); keys typed elsewhere
    // while it is open are kept from the mode underneath
    onKey = (e) => { if (!over) return; if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; } if (!over.contains(e.target)) e.stopPropagation(); };
    window.addEventListener("keydown", onKey, true);
    over.addEventListener("keydown", (e) => e.stopPropagation());
    on(over, "click", (e) => { if (e.target === over) close(); });
    page();
  };
  on(btn, "click", open);

  // ---- the ledger page
  const page = () => {
    const B = got(api), c = count(), s = slipFor(api.key, stageNow), cipher = api.key === "storm-song-cipher";
    const fin = api.shared.get("finale", null), two = again(api);
    over.innerHTML = `<div class="${P}pg" role="dialog" aria-label="The twelve bars" style="--lp:url('${A.has("bar-ledger") ? A.url("bar-ledger") : ""}')">
      <div class="k">THE LEDGER · ${c} OF 12 MEASURED${two ? ` · READING ${runs(api) + 1}` : ""}</div>
      <h3>Twelve bars, ruled. What for?</h3>
      <p>Every surgical bar in the four books: ruled to a length, blue under the black, set on a line. Brushed bars are only ink and are not here.</p>
      ${s && !B[s.n] ? `<div class="${P}gauge" data-g></div>` : ""}
      <ol class="${P}rows">${BARS.map((b) => `<li class="${s && s.n === b.n ? "cur" : ""}"><b>${b.n}</b><span class="w">${b.where}${two ? `<small>desk log, ${b.log}: ruled</small>` : ""}</span>
        <span class="v ${B[b.n] ? "" : "no"}">${B[b.n] ? `${barSvg(B[b.n])} ${B[b.n]} mm` : "not yet"}</span></li>`).join("")}</ol>
      <div data-r></div>
      <button type="button" class="go" data-x>Back to the page</button></div>`;
    over.querySelector("[data-x]").addEventListener("click", close);
    const r = over.querySelector("[data-r]");
    if (fin && fin.ending) r.innerHTML = `<p class="${P}say">Read once already: the route ends at the north shaft. ${fin.ending === "errata" ? "She published the correction, unsigned." : "She left it for the hand that ruled it."} Twelve bars wait to be measured again.</p>`;
    if (c >= 12) {
      if (cipher) { r.innerHTML += `<p>All twelve. Lay them under the staff: a bar's line is its note, 14 mm of it one rest. Walk them from the core.</p><button type="button" class="go" data-route>Lay the twelve under the staff</button>`; r.querySelector("[data-route]").addEventListener("click", route); }
      else r.innerHTML += `<p class="${P}say">All twelve measured. They read on the staff: open Storm-Song Cipher and lay them under it.</p>`;
    } else if (!fin) r.innerHTML += `<p class="${P}say">${12 - c} still to find. ${s && !B[s.n] ? "One of them is on this page." : "None waits on this page."}</p>`;
    const g = over.querySelector("[data-g]");
    if (g) gauge(g, s);
    const f = over.querySelector("[data-g] button, [data-route], [data-x]"); if (f) f.focus();
  };

  // ---- the gauge: pick the ruled bar, then set the jaws on its two ends
  const gauge = (g, b) => {
    const ruledFirst = b.n % 2 === 0;
    const o = 4 + (b.n * 3) % 9; // where the bar starts on the rule, in mm
    const K = 5, W = 74 * K + 20; // px per mm on the gauge
    g.innerHTML = `<div class="k">ON THIS PAGE: TWO BLACK BARS</div><p class="${P}say" aria-live="polite">Which of them was ruled? Brushed bars are only ink.</p>
      <div class="two">${[ruledFirst, !ruledFirst].map((ruled, i) => `<button type="button" data-pick="${ruled ? "s" : "c"}" aria-label="Bar ${i + 1}">${A.has(ruled ? "bar-surgical" : "bar-clumsy") ? `<img alt="" src="${A.url(ruled ? "bar-surgical" : "bar-clumsy")}">` : `<span class="${P}b" style="width:100%;height:16px;${ruled ? "" : "box-shadow:none;border-radius:40% 10% 60% 20%"}"></span>`}<span>bar ${i + 1}</span></button>`).join("")}</div>`;
    const say = (t, bad) => { const p = g.querySelector("." + P + "say"); p.textContent = t; p.classList.toggle("bad", !!bad); };
    g.querySelectorAll("[data-pick]").forEach((q) => q.addEventListener("click", () => {
      if (q.dataset.pick === "c") { say("Brushed: a wide wet stroke with brush hairs in it, and nothing under the black but paper. It lies on no line. Only ink.", true); return; }
      let L = 0, R = 70;
      g.innerHTML = `<div class="k">THE BAR GAUGE · RULED, BLUE UNDER THE BLACK</div>
        <svg viewBox="0 0 ${W} 86" role="img" aria-label="The bar on the gauge"></svg>
        <label>LEFT JAW<input type="range" min="0" max="70" step="0.5" value="0" data-j="L" aria-label="Left jaw, millimetres"><span data-v="L"></span></label>
        <label>RIGHT JAW<input type="range" min="0" max="70" step="0.5" value="70" data-j="R" aria-label="Right jaw, millimetres"><span data-v="R"></span></label>
        <p class="${P}say" aria-live="polite">Close the jaws on the bar's two ends. The reading is the gap between them.</p>
        <button type="button" class="go" data-rec>Write the length down</button>`;
      const svg = g.querySelector("svg");
      const draw = () => {
        let s = `<rect x="0" y="0" width="${W}" height="86" fill="#f6efdc"/>`;
        s += `<rect x="${10 + o * K - 6}" y="23" width="${b.mm * K + 12}" height="1.4" fill="${ARCH}"/><rect x="${10 + o * K - 6}" y="40.6" width="${b.mm * K + 12}" height="1.4" fill="${ARCH}"/>`;
        s += `<rect x="${10 + o * K}" y="25" width="${b.mm * K}" height="15" fill="${BLACK}"/>`;
        for (let k = 0; k < 9; k++) { const yy = 26 + k * 1.6; s += `<path d="M${10 + o * K},${yy}l-${1 + (k * 7) % 4},${(k % 3) - 1}M${10 + (o + b.mm) * K},${yy}l${1 + (k * 5) % 4},${(k % 3) - 1}" stroke="${BLACK}" stroke-width=".8"/>`; }
        s += `<rect x="10" y="52" width="${70 * K}" height="22" fill="#d9dde0" stroke="${INK}" stroke-width=".8"/>`;
        for (let m = 0; m <= 70; m++) { const x = 10 + m * K, h = m % 10 === 0 ? 12 : m % 5 === 0 ? 8 : 5; s += `<line x1="${x}" x2="${x}" y1="52" y2="${52 + h}" stroke="${INK}" stroke-width="${m % 10 ? .6 : 1}"/>`; if (m % 10 === 0) s += `<text x="${x}" y="83" font-size="9" text-anchor="middle" font-family="Courier Prime,monospace" fill="${INK}">${m}</text>`; }
        for (const [v, c] of [[L, SEAL], [R, SEAL]]) s += `<path d="M${10 + v * K},10 V76" stroke="${c}" stroke-width="1.6"/><path d="M${10 + v * K - 5},6 h10 l-5,7z" fill="${c}"/>`;
        svg.innerHTML = s;
        g.querySelector("[data-v=L]").textContent = L.toFixed(1); g.querySelector("[data-v=R]").textContent = R.toFixed(1);
      };
      g.querySelectorAll("[data-j]").forEach((inp) => inp.addEventListener("input", () => { if (inp.dataset.j === "L") L = +inp.value; else R = +inp.value; draw(); }));
      g.querySelector("[data-rec]").addEventListener("click", () => {
        const gap = R - L;
        if (Math.abs(L - o) > 1 || Math.abs(R - (o + b.mm)) > 1) { say(`The jaws read ${gap.toFixed(1)} mm, but ${Math.abs(L - o) > 1 ? "the left" : "the right"} jaw is not on the bar's end. Look at where the black stops.`, true); return; }
        const mm = Math.round(gap);
        record(api, b.n, b.mm); refreshBtn();
        say(`${mm} mm, and the same at both edges. Bar ${b.n} of 12, in the ledger.`);
        setTimeout(() => { if (over) page(); }, api.reducedMotion ? 300 : 1200);
      });
      draw(); g.querySelector("[data-j=L]").focus();
    }));
  };

  // ---- the route: the twelve under the staff, walked from the core
  const route = () => {
    const B = got(api), mine = BARS.map(() => [3, 1]);
    let tries = 0, solved = false;
    const yPos = (p) => 52 - p * 6;
    over.innerHTML = `<div class="${P}pg ${P}route" role="dialog" aria-label="The twelve bars under the staff">
      <div class="k">STORM-SONG CIPHER · THE TWELVE BARS · BEFORE THE DESCENT</div>
      <h3>Lay them under the staff</h3>
      <p>Each strip is one bar, slid under the red staff. Tap the line or space it sits on for its note (or use ▲ ▼); set its rests by its length, 14 mm a rest. Then walk it, as a song this time, forwards from the core under Peak 12.</p>
      <div class="strips"></div>
      <div class="map"><svg viewBox="0 0 100 100"></svg></div>
      <p class="${P}say" aria-live="polite"></p>
      <div data-c></div>
      <button type="button" class="go" data-walk>Walk it from the core</button><button type="button" data-back>Back to the ledger</button></div>`;
    const strips = over.querySelector(".strips"), say = (t, bad) => { const p = over.querySelector("." + P + "say"); p.textContent = t; p.classList.toggle("bad", !!bad); };
    let bad = -1;
    const drawStrips = () => {
      strips.innerHTML = BARS.map((b, i) => {
        const [p, r] = mine[i], mm = B[b.n] || b.mm, w = Math.min(70, mm * 1.55);
        let s = `<svg viewBox="0 0 160 64" data-i="${i}" aria-label="Bar ${b.n}, ${mm} millimetres">`;
        s += `<rect x="0" y="0" width="160" height="64" fill="#f4efe2"/>`;
        for (const q of [0, 2, 4, 6]) s += `<line x1="4" x2="156" y1="${yPos(q)}" y2="${yPos(q)}" stroke="${SEAL}" stroke-width="1"/>`;
        const y = yPos(b.pos);
        s += `<rect x="8" y="${y + 3}" width="${w + 6}" height="1" fill="${ARCH}"/><rect x="10" y="${y - 3}" width="${w}" height="6" fill="${BLACK}"/>`;
        s += `<rect x="${w + 26}" y="${yPos(p) - 4}" width="9" height="8" fill="${INK}" opacity=".85"/><rect x="${w + 34}" y="${yPos(p) - 4}" width="1.6" height="12" fill="${INK}"/>`;
        for (let k = 0; k < r; k++) s += `<rect x="${w + 44 + k * 9}" y="${yPos(6) + 2}" width="2.4" height="12" fill="${INK}"/>`;
        s += `<text x="6" y="62" font-size="8" font-family="Courier Prime,monospace" fill="${ARCH}">${b.n} · ${mm} mm</text></svg>`;
        return `<div class="sp ${i === bad ? "bad" : ""}">${s}<div class="ctl"><button type="button" data-p="${i}" data-d="-1" aria-label="Bar ${b.n} note down">▼</button><span>note ${p}</span><button type="button" data-p="${i}" data-d="1" aria-label="Bar ${b.n} note up">▲</button>
          <button type="button" data-q="${i}" data-d="-1" aria-label="Bar ${b.n} one rest fewer">−</button><span>${r} rest${r > 1 ? "s" : ""}</span><button type="button" data-q="${i}" data-d="1" aria-label="Bar ${b.n} one rest more">+</button></div></div>`;
      }).join("");
    };
    on(strips, "click", (e) => {
      if (solved) return;
      const pb = e.target.closest("[data-p]"), qb = e.target.closest("[data-q]");
      if (pb) { const i = +pb.dataset.p; mine[i][0] = Math.max(0, Math.min(6, mine[i][0] + +pb.dataset.d)); drawStrips(); strips.querySelector(`[data-p="${i}"][data-d="${pb.dataset.d}"]`).focus(); return; }
      if (qb) { const i = +qb.dataset.q; mine[i][1] = Math.max(1, Math.min(4, mine[i][1] + +qb.dataset.d)); drawStrips(); strips.querySelector(`[data-q="${i}"][data-d="${qb.dataset.d}"]`).focus(); return; }
      const sv = e.target.closest("svg[data-i]"); if (!sv) return;
      const i = +sv.dataset.i, rr = sv.getBoundingClientRect(), y = (e.clientY - rr.top) / rr.height * 64;
      mine[i][0] = Math.max(0, Math.min(6, Math.round((52 - y) / 6))); drawStrips();
    });
    const truth = walk(TRUE_LEGS);
    const xs = truth.map((p) => p[0]), ys = truth.map((p) => p[1]);
    const minX = Math.floor(Math.min(...xs)) - 3, maxX = Math.ceil(Math.max(...xs)) + 3, minY = Math.floor(Math.min(...ys)) - 3, maxY = Math.ceil(Math.max(...ys)) + 3;
    const U = 100 / Math.max(maxX - minX, maxY - minY), mx = (x) => (x - minX) * U, my = (y) => (maxY - y) * U;
    const mapSvg = over.querySelector(".map svg");
    mapSvg.setAttribute("viewBox", `0 0 ${(maxX - minX) * U} ${(maxY - minY) * U}`);
    const drawMap = (pts, ok) => {
      const Wm = (maxX - minX) * U, Hm = (maxY - minY) * U;
      let s = A.has("peak-map") ? `<image href="${A.url("peak-map")}" x="0" y="0" width="${Wm}" height="${Hm}" preserveAspectRatio="xMidYMid slice" opacity=".5"/>` : "";
      for (let i = 0; i <= maxX - minX; i++) s += `<line x1="${i * U}" x2="${i * U}" y1="0" y2="${Hm}" stroke="#bfae8a" stroke-width=".25"/>`;
      for (let j = 0; j <= maxY - minY; j++) s += `<line y1="${j * U}" y2="${j * U}" x1="0" x2="${Wm}" stroke="#bfae8a" stroke-width=".25"/>`;
      s += `<circle cx="${mx(0)}" cy="${my(0)}" r="${U * 0.5}" fill="${SEAL}" opacity=".8"/><text x="${mx(0) + U * 0.8}" y="${my(0) + 1.5}" font-size="3.6" fill="${INK}" font-style="italic">the core, Peak 12</text>`;
      s += `<text x="${Wm - 2}" y="5" font-size="4.5" text-anchor="end" fill="${INK}">N ↑</text>`;
      if (pts) {
        s += `<polyline points="${pts.map((p) => `${mx(p[0])},${my(p[1])}`).join(" ")}" fill="none" stroke="${ok ? INK : SEAL}" stroke-width=".9" stroke-dasharray="${ok ? "" : "2 1.4"}"/>`;
        const e = pts[pts.length - 1];
        s += ok ? `<rect x="${mx(e[0]) - U * 0.6}" y="${my(e[1]) - U * 0.6}" width="${U * 1.2}" height="${U * 1.2}" fill="rgba(47,107,63,.25)" stroke="#2f6b3f" stroke-width=".8"/><text x="${mx(e[0]) - U}" y="${my(e[1]) - U}" font-size="4.2" font-weight="700" text-anchor="end" fill="#2f6b3f">the north shaft ✓</text>`
          : `<circle cx="${mx(e[0])}" cy="${my(e[1])}" r="${U * 0.5}" fill="none" stroke="${SEAL}" stroke-width=".8"/><text x="${mx(e[0]) + U * 0.8}" y="${my(e[1]) + 1}" font-size="3.8" font-weight="700" fill="${SEAL}">solid rock</text>`;
      }
      mapSvg.innerHTML = s;
    };
    drawStrips(); drawMap(null);
    say("Twelve strips on the bench. The four from the brief you have read already: you know how a ruled bar sings.");
    over.querySelector("[data-back]").addEventListener("click", page);
    over.querySelector("[data-walk]").addEventListener("click", () => {
      if (solved) return;
      const pts = walk(mine), wrong = mine.findIndex((m, i) => m[0] !== TRUE_LEGS[i][0] || m[1] !== TRUE_LEGS[i][1]);
      if (wrong < 0) { solved = true; bad = -1; drawStrips(); drawMap(pts, true); choose(); return; }
      tries++;
      bad = tries >= 2 ? wrong : -1; drawStrips(); drawMap(pts, false);
      say(tries >= 2 ? `The walk ends in solid rock. Lira's pencil stops at bar ${wrong + 1}: from there on the path is not the one anyone ruled. Check its line, and its length.` : "The walk ends in solid rock, where the survey shows no shaft. Somewhere a bar is read wrong.", true);
    });
    // the choice the solved route offers: which ending it earns
    const choose = () => {
      const fl = !!api.shared.get("flyleaf", false), gm = !!api.shared.get("gamma", false), ok = fl && gm;
      say("The pencil walks out of the core, north and east, twelve legs, and stops at a shaft the survey never drew. Whoever ruled these bars drew her a way out of the mountain, one book at a time.");
      const c = over.querySelector("[data-c]");
      over.querySelector("[data-walk]").hidden = true;
      c.innerHTML = `<div class="${P}choice"><div class="k">THE ROUTE IS HERS NOW. WHAT DOES SHE DO WITH IT?</div>
        <button type="button" class="go" data-e="archivist-in-time">Leave the route in the margin, for the hand that ruled it</button><small>The follower will know where to wait. The pulses still fire.</small>
        ${ok && A.has("errata-sheet") ? `<img alt="The correction, unsigned" src="${A.url("errata-sheet")}" style="float:right;width:min(110px,28%);height:auto;margin:0 0 6px 10px;box-shadow:2px 2px 0 rgba(0,0,0,.25)">` : ""}<button type="button" class="go" data-e="errata" ${ok ? "" : "disabled"}>Withdraw the schedule. Publish the correction, unsigned</button><small>${ok ? "She measured the damping herself, and she knows whose key she has been using." : `Not yet: ${!gm ? "she has not measured the damping herself (The Assay, the fragment: pulse it)" : ""}${!gm && !fl ? "; and " : ""}${!fl ? "she does not know whose key she has been using (The Key, the flyleaf)" : ""}.`}</small></div>`;
      c.querySelectorAll("[data-e]").forEach((q) => q.addEventListener("click", () => {
        const ending = q.dataset.e, n = runs(api) + 1;
        api.shared.set("finale", { ending, run: n });
        api.shared.set("runs", n);
        api.shared.set("bars", {});
        const text = ending === "errata" ? FINALE.errata.text : FINALE["archivist-in-time"].text;
        close();
        if (ctx.card) ctx.card(ending); else cardBehind(root, api, ending);
        ctx.end({ outcome: "win", text: `${FINALE[ending].title}. ${text} The book is closed. Keep going, and it opens at Book I again, with what you know now.` });
      }));
      c.querySelector("[data-e]").focus();
    };
  };

  refreshBtn();
  return {
    btn,
    isOpen,
    stage(s) { stageNow = s; if (over) close(); refreshBtn(); },
    refresh: refreshBtn,
    unmount() { close(); off.forEach((f) => f()); btn.remove(); style.remove(); },
  };
}

// The finale's words, shared with loading.js (written for the game; not the author's text, except the
// archivist's line "You are one of us now.", which is the source's).
export const FINALE = {
  errata: {
    title: "Errata",
    text: "Twelve bars ruled by a clerk across four books walk from the core to the north shaft, and Lira walks them out alive. She does not fire: she withdraws her schedule and pins the correction to her own model on the relay mast at Hollin, unsigned, the damping 6 and not 8, the key his and not hers. The storms take the terraces on the mountain's own period, Hollin among them, emptied on the siren baseline she set the first morning; the Continuum is not wounded, and her name is on nothing. A hundred settlements start measuring again.",
  },
  "archivist-in-time": {
    title: "The Archivist in Time",
    text: "The twelve bars were a route, and the hand that ruled them was waiting at its end: at the north shaft a lamp that is not hers comes through the dust, and the archivist pulls her through before the tunnels seal. To reach her they broke cover and lost the vault, and only six of the twelve bars can ever be lifted from the books. She lives in hiding with her name on the cover, the Continuum hunts them both, and every terrace that was not held falls. “You are one of us now.”",
  },
};

// Missing Campsites / Reconcile (1D, topographic survey print).
//
// DESIGN.md section 11, Reconcile, at reconcile_2 (day 2 morning, after erasure step 2): rows 1 to
// 24 against four sources. Ground: stamps from the walks (1–11 not here, 12 here, 13–15 not
// walked, 16–24 here). Map: still prints 7–24 (paper lags the land). Legend: lists 7–24, a blank
// band at its bottom where six lines were. Photos: the site 7 photo shows a clearing; file numbers
// skip. Set each row Here, Gone or Unknown and, if you like, write one detail Tam saw there. When the
// map or legend disagrees with a Gone note, "Correct your note to match." is offered (accepted +1).
// Then the forecast: mark where the loss will reach by noon and by dark (12–15 by noon, 16–19 by
// dark; right within one site). Rows 1–3 come already written from day 1. There is no fail state;
// wrong rows are written wrong and hold wrong, so it ends with a scored "done".

const GREEN = "#2f6b3a", GRAPH = "#4a4a4c", CREAM = "#f1ead6", BROWN = "#9b6a3c", RED = "#9c3b30";

const GROUND = (n) => (n <= 11 ? "not here" : n === 12 ? "here" : n <= 15 ? "not walked" : "here");
const MAP = (n) => n >= 7;
const LEGEND = (n) => n >= 7;
const PHOTOS = { 4: "IMG_0004 · a clearing", 7: "IMG_0007 · a clearing, needles undisturbed", 12: "IMG_0011 · table, fire ring, the creek bend", 16: "IMG_0014 · the tall cedar", 17: "IMG_0015 · a bike against the table", 21: "IMG_0019 · the split boulder" };
const TRUTH = (n) => (n <= 11 ? "Gone" : n <= 15 && n >= 13 ? "Unknown" : "Here");
const LEG_WHAT = ["tent pad", "table", "fire ring"];
const DETAILS = (n) => {
  if (n <= 11) return ["needles undisturbed", "no fire ring", "no post, no ruts"];
  if (n >= 13 && n <= 15) return [];
  return {
    12: ["the creek bend", "trail register by the post"], 16: ["the tall cedar", "a cooler left open"],
    17: ["a bike, onions", "a tent pitched crooked"], 18: ["table by the creek", "three chairs"],
    19: ["a hammock", "a radio on low"], 20: ["the van", "our tarp"], 21: ["the split boulder", "Mum's site"],
    22: ["the shared fire ring", "Dell's cooler"], 23: ["June's tent", "the washing line"], 24: ["Inés's tripod", "the last post"],
  }[n];
};
// Agnes's postcard lines (DESIGN.md section 12; added for the game). After step 2, 7 and 9 are gone.
const POSTCARD = [
  { k: "7", text: null }, { k: "9", text: null },
  { k: "12", text: "Site 12. The creek bend. Cold enough to keep the milk." },
  { k: "16", text: "Site 16. The tall cedar. You fell out of it once, and laughed." },
  { k: "heron", text: "The heron sign. Wave at it on the way in. We always did." },
  { k: "21", text: "Site 21. The split boulder. You slept in the crack of it." },
];

const P = "missing-campsites-reconcile-";
const CSS = `
.${P}wrap{position:absolute;inset:0;background:${CREAM};color:#222;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;padding:14px;box-sizing:border-box;overflow:auto;font-family:'IBM Plex Mono',ui-monospace,monospace;background-image:repeating-linear-gradient(90deg,rgba(120,90,40,.035) 0 1px,transparent 1px 5px)}
.${P}left{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}map{background:#f6f0dc;border:2.5px solid #3b3426;width:100%;height:auto;display:block;touch-action:manipulation}
.${P}legend{border:2px solid ${GREEN};color:${GREEN};padding:8px 10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 12px;font-size:12px}
.${P}legend h4{grid-column:1/-1;margin:0 0 4px;letter-spacing:.3em;font-size:13px}
.${P}legend span{height:19px;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
.${P}legend span i{width:10px;height:10px;background:${GREEN};display:inline-block;flex:none}
.${P}right{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}panel{background:#fbf8ee;border:1.5px solid #b9b09a;padding:10px}
.${P}chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.${P}chip{border:1.2px solid ${GREEN};border-radius:14px;padding:5px 9px;font-size:11px;color:${GREEN};background:#fff;min-height:30px}
.${P}chip b{display:block;font-size:10px;letter-spacing:.12em}
.${P}chip.pulse{animation:${P}pulse 1s 2}
@keyframes ${P}pulse{50%{background:#f4d9a8}}
.${P}acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.${P}acts button,.${P}fc button,.${P}card button{font:600 12px 'IBM Plex Mono',monospace;border:1.5px solid ${GRAPH};background:#fff;color:#222;padding:7px 10px;cursor:pointer;min-height:34px}
.${P}acts button.on{background:${GRAPH};color:#fff}
.${P}acts .det{font-family:Caveat,'Segoe Print',cursive;font-size:17px;font-weight:500;border-style:dashed}
.${P}accept{font-family:'Zilla Slab',Georgia,serif!important;border-color:${GREEN}!important;color:${GREEN}!important}
.${P}book{background:#fbf8ee;border:1.5px solid #b9b09a;flex:1;min-height:220px;overflow:auto;position:relative}
.${P}book table{width:100%;border-collapse:collapse;font-size:12px}
.${P}book th{position:sticky;top:0;background:#fbf8ee;color:${GREEN};text-align:left;padding:5px 4px;font-size:11px;border-bottom:1px solid ${GREEN}}
.${P}book td{border-bottom:1px solid #a9c3cf;padding:3px 4px;height:22px}
.${P}book td.h{font-family:Caveat,'Segoe Print',cursive;font-size:18px;color:${GRAPH};line-height:1}
.${P}book tr{cursor:pointer}
.${P}book tr.sel td{background:#fff3df;outline:0}
.${P}book tr.sel td:first-child{box-shadow:inset 3px 0 ${RED}}
.${P}book tr.arrow td:first-child::before{content:"→ ";color:${RED}}
.${P}card{background:#fff;border:1px solid #d4c9ad;padding:8px 10px;font-family:Caveat,'Segoe Print',cursive;font-size:16px;color:#6a4a2a;line-height:1.15}
.${P}card div{display:flex;gap:8px;align-items:center;justify-content:space-between;margin:3px 0}
.${P}card .groove{color:#cfc6b3;letter-spacing:.2em}
.${P}card button{font-size:10px;min-height:26px;padding:3px 7px}
.${P}fc{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px}
.${P}fc button.on{outline:3px solid ${GRAPH}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(241,234,214,.92);z-index:4;padding:16px}
.${P}intro div{max-width:470px;background:#fbf8ee;border:2px solid ${GREEN};padding:18px 22px}
.${P}intro h2{margin:0 0 8px;font:700 24px 'Zilla Slab',Georgia,serif;color:${GREEN}}
.${P}intro p{margin:0 0 8px;font-size:13px;line-height:1.5}
.${P}intro button{font:600 14px 'IBM Plex Mono',monospace;background:${GREEN};color:#fff;border:0;padding:10px 20px;cursor:pointer}
@media (max-width:760px){.${P}wrap{grid-template-columns:1fr}.${P}legend{grid-template-columns:repeat(2,minmax(0,1fr))}.${P}book{min-height:300px}}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}left"><svg class="${P}map" viewBox="0 0 700 440" role="img" aria-label="The paper map of Hollin Creek"></svg>
        <div class="${P}legend"><h4>LEGEND</h4></div>
        <div class="${P}panel ${P}fc"><b>FORECAST</b><span class="fcmsg">Set every row first.</span></div></div>
      <div class="${P}right">
        <div class="${P}panel"><div class="${P}title" style="font-size:12px;margin-bottom:6px"></div><div class="${P}chips"></div><div class="${P}acts"></div></div>
        <div class="${P}book"><table><thead><tr><th>#</th><th>Seen</th><th>Map</th><th>Leg.</th><th>Note</th></tr></thead><tbody></tbody></table></div>
        <div class="${P}card" aria-label="Agnes's postcard"></div>
      </div>
      <div class="${P}intro"><div><h2>Reconcile</h2>
        <p>Day 2, morning. Compare each site's row against the ground, the map, the legend and the photos, then set it <b>Here</b>, <b>Gone</b> or <b>Unknown</b> (not walked). Keys: ↑ ↓, then H, G, U.</p>
        <p>What you write holds, even when it is wrong. Then mark on the map where the loss will reach by noon, and by dark.</p>
        <button type="button">Start</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}map`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const timers = [];

    // ---- the survey print ----
    const hgt = (x, y) => [[220, 150, 110, 1], [500, 300, 100, 0.7], [470, 100, 80, 0.45], [120, 360, 90, -0.35]]
      .reduce((v, [px, py, s, a]) => v + a * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s)), 0) + 0.06 * Math.sin(x / 47) * Math.cos(y / 61);
    // contour lines by marching squares, cheap and exact enough for a print
    const step = 10;
    for (let li = 0; li < 22; li++) {
      const lev = -0.3 + li * 0.065;
      let d = "";
      for (let y = 0; y < 440; y += step) for (let x = 0; x < 700; x += step) {
        const c = [hgt(x, y), hgt(x + step, y), hgt(x + step, y + step), hgt(x, y + step)];
        const pts = [];
        const e = (a, b, ax, ay, bx, by) => { if ((c[a] - lev) * (c[b] - lev) < 0) { const t = (lev - c[a]) / (c[b] - c[a]); pts.push([ax + (bx - ax) * t, ay + (by - ay) * t]); } };
        e(0, 1, x, y, x + step, y); e(1, 2, x + step, y, x + step, y + step); e(2, 3, x + step, y + step, x, y + step); e(3, 0, x, y + step, x, y);
        if (pts.length >= 2) d += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
      }
      if (d) mk("path", { d, fill: "none", stroke: BROWN, "stroke-width": li % 5 === 0 ? 1.8 : 0.8, opacity: 0.8, "stroke-linecap": "round" });
    }
    mk("path", { d: "M0 400 C80 360 150 410 230 430 S330 440 360 440", fill: "none", stroke: "#3d7fa6", "stroke-width": 3 });
    const CX = 360, CY = 215, RX = 255, RY = 150;
    const sitePos = (n) => { const a = (150 + (n - 0.5) * 15) * Math.PI / 180; return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a }; };
    let road = "";
    for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2; road += `${k ? "L" : "M"}${(CX + RX * Math.cos(a)).toFixed(1)} ${(CY + RY * Math.sin(a)).toFixed(1)}`; }
    mk("path", { d: road + "Z", fill: "none", stroke: "#222", "stroke-width": 9 });
    mk("path", { d: road + "Z", fill: "none", stroke: "#f6f0dc", "stroke-width": 5 });
    const ent = sitePos(0.4);
    mk("path", { d: `M0 420 Q60 380 ${ent.x} ${ent.y}`, fill: "none", stroke: "#222", "stroke-width": 9 });
    mk("path", { d: `M0 420 Q60 380 ${ent.x} ${ent.y}`, fill: "none", stroke: "#f6f0dc", "stroke-width": 5 });
    mk("rect", { x: 10, y: 400, width: 22, height: 16, fill: RED });
    mk("path", { d: "M660 26 L670 66 L660 58 L650 66 Z", fill: "#222" });
    const nt = mk("text", { x: 653, y: 86, "font-size": 15, "font-family": "Georgia,serif" }); nt.textContent = "N";
    for (let k = 0; k < 4; k++) mk("rect", { x: 520 + k * 28, y: 412, width: 28, height: 6, fill: k % 2 ? "#f6f0dc" : "#222", stroke: "#222" });
    const ttl = mk("text", { x: 22, y: 34, "font-size": 18, "font-weight": 700, "letter-spacing": 4, fill: "#222", "font-family": "'Zilla Slab',Georgia,serif" });
    ttl.textContent = "HOLLIN CREEK";
    const fcLayer = mk("g", {});
    const squares = {};
    for (let n = 1; n <= 24; n++) {
      const s = sitePos(n);
      const sx = s.x + (s.x - CX) * 0.13, sy = s.y + (s.y - CY) * 0.17;
      const g = mk("g", { style: "cursor:pointer" });
      mk("rect", { x: sx - 14, y: sy - 14, width: 28, height: 28, fill: "transparent" }, g);   // hit area
      if (MAP(n)) {
        mk("rect", { x: sx - 8, y: sy - 8, width: 16, height: 16, fill: "#222" }, g);
        const t = mk("text", { x: sx + (s.x >= CX ? 12 : -12), y: sy + 5, "text-anchor": s.x >= CX ? "start" : "end", "font-size": 13, "font-family": "sans-serif", fill: "#222" }, g);
        t.textContent = n;
      }
      g.addEventListener("click", () => forecastAt(n));
      squares[n] = { x: sx, y: sy, g };
    }

    // ---- legend: entries 7–24, the box keeps its height ----
    const lg = $(`.${P}legend`);
    for (let n = 7; n <= 24; n++) { const s = document.createElement("span"); s.innerHTML = `<i></i><b>${n}</b> ${LEG_WHAT[n % 3]}`; lg.appendChild(s); }
    for (let k = 0; k < 6; k++) lg.appendChild(document.createElement("span"));

    // ---- notebook ----
    const rows = {};
    for (let n = 1; n <= 24; n++) rows[n] = { status: n <= 3 ? "Gone" : null, note: n <= 3 ? "needles undisturbed" : "", accepted: false };
    const tbody = $("tbody");
    const trs = {};
    for (let n = 1; n <= 24; n++) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${n}</td><td class="h"></td><td>${MAP(n) ? "■" : "–"}</td><td style="color:${GREEN}">${LEGEND(n) ? "■" : "–"}</td><td class="h"></td>`;
      tr.addEventListener("click", () => select(n));
      tbody.appendChild(tr);
      trs[n] = tr;
    }
    let sel = 4, accepted = 0, copied = new Set(), phase = "rows", fcMode = "noon", fc = { noon: null, dark: null }, idle = 0, over = false;

    function paintRow(n) {
      const r = rows[n], td = trs[n].children;
      td[1].textContent = r.status || "";
      td[4].textContent = r.note;
    }
    function select(n) {
      sel = n; idle = 0;
      Object.values(trs).forEach((t) => t.classList.remove("sel", "arrow"));
      trs[n].classList.add("sel");
      trs[n].scrollIntoView?.({ block: "nearest" });
      $(`.${P}title`).textContent = `Site ${n}${n <= 3 ? " · written on day 1" : ""}`;
      const chips = $(`.${P}chips`);
      chips.innerHTML = "";
      const src = [["GROUND", GROUND(n)], ["MAP", MAP(n) ? "printed square" : "nothing printed"], ["LEGEND", LEGEND(n) ? `■ ${n} ${LEG_WHAT[n % 3]}` : "no entry"], ["PHOTOS", PHOTOS[n] || "none"]];
      src.forEach(([h, v]) => { const c = document.createElement("div"); c.className = P + "chip"; c.innerHTML = `<b>${h}</b>`; c.appendChild(document.createTextNode(v)); chips.appendChild(c); });
      const acts = $(`.${P}acts`);
      acts.innerHTML = "";
      for (const s of ["Here", "Gone", "Unknown"]) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = s;
        if (rows[n].status === s) b.classList.add("on");
        b.addEventListener("click", () => setStatus(n, s));
        acts.appendChild(b);
      }
      if (rows[n].status && rows[n].status !== "Unknown") for (const d of DETAILS(n)) {
        const b = document.createElement("button"); b.type = "button"; b.className = "det"; b.textContent = d;
        b.addEventListener("click", () => { rows[n].note = d; paintRow(n); select(n); });
        acts.appendChild(b);
      }
      if (rows[n].status === "Gone" && (MAP(n) || LEGEND(n))) {
        const b = document.createElement("button"); b.type = "button"; b.className = P + "accept";
        b.textContent = "Correct your note to match.";
        b.addEventListener("click", () => { rows[n].status = "Here"; rows[n].note = ""; rows[n].accepted = true; accepted++; paintRow(n); select(n); check(); });
        acts.appendChild(b);
      }
    }
    function setStatus(n, s) {
      if (phase !== "rows" && phase !== "forecast") return;
      rows[n].status = s;
      if (s === "Unknown") rows[n].note = "not walked";
      else if (rows[n].note === "not walked") rows[n].note = "";
      paintRow(n);
      select(n);
      check();
    }
    function check() {
      const left = Object.keys(rows).filter((n) => !rows[n].status);
      if (!left.length && phase === "rows") {
        phase = "forecast";
        drawForecastUI();
      }
    }

    // ---- forecast ----
    function drawForecastUI() {
      const f = $(`.${P}fc`);
      f.innerHTML = "<b>FORECAST</b>";
      const msg = document.createElement("span"); msg.textContent = "Tap the map where the loss reaches";
      f.appendChild(msg);
      for (const m of ["noon", "dark"]) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = `by ${m}${fc[m] ? ": " + fc[m] : ""}`;
        if (fcMode === m) b.classList.add("on");
        b.addEventListener("click", () => { fcMode = m; drawForecastUI(); });
        f.appendChild(b);
      }
      const w = document.createElement("button"); w.type = "button"; w.textContent = "Write it in the notebook";
      w.disabled = !(fc.noon && fc.dark);
      w.addEventListener("click", finish);
      f.appendChild(w);
    }
    function forecastAt(n) {
      if (phase !== "forecast") { if (phase === "rows") select(n); return; }
      fc[fcMode] = n;
      fcLayer.innerHTML = "";
      for (const m of ["noon", "dark"]) {
        if (!fc[m]) continue;
        const s = squares[fc[m]];
        mk("path", { d: `M${CX} ${CY} L${s.x} ${s.y}`, stroke: GRAPH, "stroke-width": 3.5, "stroke-linecap": "round", fill: "none" }, fcLayer);
        const t = mk("text", { x: (CX + s.x) / 2 + 6, y: (CY + s.y) / 2 - 6, "font-size": 20, "font-style": "italic", fill: GRAPH, "font-family": "Caveat,cursive" }, fcLayer);
        t.textContent = `by ${m}`;
      }
      if (fcMode === "noon" && !fc.dark) fcMode = "dark";
      drawForecastUI();
    }

    // ---- postcard in the margin ----
    const card = $(`.${P}card`);
    card.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;color:#888">AGNES'S POSTCARD</div>`;
    for (const line of POSTCARD) {
      const d = document.createElement("div");
      if (!line.text) { d.innerHTML = `<span class="groove">— — — — — — — —</span>`; card.appendChild(d); continue; }
      const s = document.createElement("span"); s.textContent = line.text; d.appendChild(s);
      const b = document.createElement("button"); b.type = "button"; b.textContent = "Copy";
      b.addEventListener("click", () => { copied.add(line.k); b.textContent = "Copied"; b.disabled = true; });
      d.appendChild(b); card.appendChild(d);
    }

    function finish() {
      if (over) return;
      over = true; phase = "done";
      let right = 0;
      for (let n = 4; n <= 24; n++) if (rows[n].status === TRUTH(n)) right++;
      const noonOk = Math.abs(fc.noon - 15) <= 1, darkOk = Math.abs(fc.dark - 19) <= 1;
      const fr = noonOk && darkOk;
      api.store.set("last", { right, accepted, forecast_right: fr, mother_lines_kept: copied.size });
      api.end({
        outcome: "done",
        text: `${right} of 21 rows agree with what happened. ${accepted ? `You corrected ${accepted} note${accepted > 1 ? "s" : ""} to match the paper. ` : ""}` +
          `Forecast ${fr ? "right: 12–15 by noon, 16–19 by dark." : `off (it reached 15 by noon and 19 by dark).`} ` +
          `${copied.size ? `${copied.size} of Mum's lines copied; they hold.` : "None of Mum's lines copied."}`,
      });
    }

    // ---- keys and hints ----
    const kd = (e) => {
      if (over || $(`.${P}intro`)) return;
      const k = e.key.toLowerCase();
      if (k === "arrowdown") { e.preventDefault(); select(Math.min(24, sel + 1)); }
      else if (k === "arrowup") { e.preventDefault(); select(Math.max(1, sel - 1)); }
      else if (k === "h") setStatus(sel, "Here");
      else if (k === "g") setStatus(sel, "Gone");
      else if (k === "u") setStatus(sel, "Unknown");
    };
    window.addEventListener("keydown", kd);
    const bump = () => { idle = 0; };
    wrap.addEventListener("pointerdown", bump);
    const hint = setInterval(() => {
      if (over || $(`.${P}intro`)) return;
      idle++;
      if (idle === 45) {   // the source that disagrees with the others pulses once
        const chips = [...wrap.querySelectorAll(`.${P}chip`)];
        const groundSays = GROUND(sel) === "here";
        if (MAP(sel) !== groundSays && chips[0]) chips[0].classList.add("pulse");
      }
      if (idle === 90) {
        const next = Object.keys(rows).find((n) => !rows[n].status);
        if (next) trs[next].classList.add("arrow");
      }
    }, 1000);

    for (let n = 1; n <= 24; n++) paintRow(n);
    select(4);
    const go = $(`.${P}intro button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); select(4); });
    go.focus();

    return {
      unmount() {
        over = true;
        clearInterval(hint);
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", kd);
      },
    };
  },
};

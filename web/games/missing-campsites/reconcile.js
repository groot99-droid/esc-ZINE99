// Missing Campsites / Reconcile (1D, topographic survey print).
//
// DESIGN.md section 11, Reconcile, at reconcile_2 (day 2 morning, after erasure step 2): rows 1 to
// 24 against four sources. Ground: stamps from the walks (1–11 not here, 12 here, 13–15 not
// walked, 16–24 here). Map: still prints 7–24 (paper lags the land). Legend: lists 7–24, a blank
// band at its bottom where six lines were. Photos: the site 7 photo shows a clearing; file numbers
// skip. Set each row Here, Gone or Unknown and write one detail Tam saw there. When the map or
// legend disagrees with a Gone note, "Correct your note to match." is offered (accepted +1).
// Then the forecast: mark where the loss will reach by noon and by dark (12–15 by noon, 16–19 by
// dark; right within one site). Rows 1–3 come already written from day 1.
//
// Actions (the refine pass), from DESIGN.md sections 11 and 12:
//   Set      Here / Gone / Unknown (H, G, U) on the selected row (↑ ↓ or click).
//   Write    one detail Tam saw (1–3), which makes the row a line in Tam's hand.
//   Tilt     hold F (or the button): the low torch shows the grooves of lost lines in the legend's
//            blank band and on the postcard. Noting the grooves writes a line of its own.
//   Accept   "Correct your note to match." rubs a Gone note out to agree with the paper.
//   Copy     a postcard line into the notebook, where it holds.
//   Forecast tap the map twice: noon, then dark.
// The Photos source arrives halfway (Inés brings the camera); tilt unlocks after the first Gone.
// No fail state: a good page (17 rows right, the forecast right) is a win; anything else is done.
// Every narrative line in TEXT is written for the game (listed for approval), not quoted; the
// postcard lines are DESIGN.md section 12's own.

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
// Agnes's postcard lines (DESIGN.md section 12). After step 2, 7 and 9 are gone: grooves only.
const POSTCARD = [
  { k: "7", text: null }, { k: "9", text: null },
  { k: "12", text: "Site 12. The creek bend. Cold enough to keep the milk." },
  { k: "16", text: "Site 16. The tall cedar. You fell out of it once, and laughed." },
  { k: "heron", text: "The heron sign. Wave at it on the way in. We always did." },
  { k: "21", text: "Site 21. The split boulder. You slept in the crack of it." },
];

const TEXT = {
  sheet: "Sheet 2 · Day 2 · morning",
  goal: "Set every site's row against what the paper claims, then forecast where the loss will reach.",
  rule: "What you write holds, even when it is wrong. What the paper prints does not.",
  open: "Morning at the camp table. The map is still warm from the sun. Start at row 4: rows 1 to 3 you wrote yesterday.",
  tilt: "Your torch is still in your jacket. Hold F to tilt the page under it: lost lines leave grooves.",
  grooves: "Six grooves in the legend's blank band, pressed by type that is not there now.",
  photos: "Inés sits down with the camera. \"I took the whole loop yesterday. Look.\" The file numbers skip.",
  accept: "You rub the line out. The paper looks surer than you feel.",
  forecast: "Every row is set. Now the pencil line: where will it reach by noon, and by dark? Tap the map.",
  dell: "Dell, over your shoulder: \"Noon's an hour off. Where does that put it?\"",
  groovesLine: "the legend had six lines more",
  copy: "copied into the notebook. In your hand, it holds.",
  end: {
    rows: (right) => `${right} of 21 rows agree with what happened.`,
    accepted: (n) => `You corrected ${n} note${n > 1 ? "s" : ""} to match the paper, and the paper will not thank you.`,
    fcRight: "The forecast is right: 12 to 15 by noon, 16 to 19 by dark. It moves the way you drew it.",
    fcWrong: "The forecast is off: it reached 15 by noon and 19 by dark, faster than your pencil.",
    copied: (n) => `${n} of Mum's lines copied; they hold.`,
    noCopy: "None of Mum's lines copied.",
    grooves: "One line notes the legend's grooves, so the six missing entries are in your hand too.",
    winLead: "A page that holds.",
    doneLead: "The page is written. Some of it holds, some of it is wrong and holds anyway.",
  },
};

const P = "missing-campsites-reconcile-";
const CSS = `
.${P}wrap{position:absolute;inset:0;background:${CREAM};color:#222;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:14px;padding:14px;box-sizing:border-box;overflow:auto;font-family:'IBM Plex Mono',ui-monospace,monospace;background-image:repeating-linear-gradient(90deg,rgba(120,90,40,.035) 0 1px,transparent 1px 5px),radial-gradient(rgba(120,90,40,.05) 1px,transparent 1.4px);background-size:auto,6px 6px}
.${P}left{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}map{background:#f6f0dc;border:2.5px solid #3b3426;outline:1px solid #3b3426;outline-offset:3px;width:100%;height:auto;display:block;touch-action:manipulation}
.${P}map .sq{cursor:pointer}
.${P}map .sq:hover .hl{stroke:${RED};stroke-width:2.5}
.${P}tilt .${P}map{filter:contrast(1.08) brightness(.93)}
.${P}legend{border:2px solid ${GREEN};color:${GREEN};padding:8px 10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 12px;font-size:14px;position:relative}
.${P}legend h4{grid-column:1/-1;margin:0 0 4px;letter-spacing:.3em;font-size:14px;display:flex;justify-content:space-between}
.${P}legend span{height:22px;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
.${P}legend span i{width:11px;height:11px;background:${GREEN};display:inline-block;flex:none}
.${P}legend span.gv{color:transparent;letter-spacing:.3em;transition:color .25s}
.${P}tilt .${P}legend span.gv{color:rgba(60,50,30,.5);text-shadow:0 1px 0 rgba(255,255,255,.7)}
.${P}legend .note{font:600 13px 'IBM Plex Mono',monospace;color:${GREEN};border:1.5px solid ${GREEN};background:#fff;padding:3px 8px;cursor:pointer;letter-spacing:0}
.${P}legend .note[hidden]{display:none}
.${P}right{min-width:0;display:flex;flex-direction:column;gap:10px}
.${P}panel{background:#fbf8ee;border:1.5px solid #b9b09a;padding:10px}
.${P}title{font-size:15px;font-weight:600;margin-bottom:6px;display:flex;justify-content:space-between;gap:8px}
.${P}title small{font-size:12px;font-weight:400;color:${GRAPH}}
.${P}chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.${P}chip{border:1.5px solid ${GREEN};border-radius:14px;padding:5px 10px;font-size:14px;color:#24402a;background:#fff;min-height:34px;line-height:1.25}
.${P}chip b{display:block;font-size:12px;letter-spacing:.12em;color:${GREEN}}
.${P}chip.off{opacity:.45;border-style:dashed}
.${P}chip.pulse{animation:${P}pulse 1s 2}
@keyframes ${P}pulse{50%{background:#f4d9a8}}
.${P}acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.${P}acts button,.${P}fc button,.${P}card button,.${P}tb{font:600 14px 'IBM Plex Mono',monospace;border:1.5px solid ${GRAPH};background:#fff;color:#222;padding:7px 11px;cursor:pointer;min-height:38px}
.${P}acts button:hover,.${P}fc button:hover,.${P}tb:hover{border-color:${RED}}
.${P}acts button.on{background:${GRAPH};color:#fff}
.${P}acts .det{font-family:Caveat,'Segoe Print',cursive;font-size:19px;font-weight:600;border-style:dashed}
.${P}acts .det.on{background:#fff3df;color:#222;border-style:solid;border-color:${RED}}
.${P}acts .accept{font-family:'Zilla Slab',Georgia,serif;border-color:${GREEN};color:${GREEN};flex-basis:100%}
.${P}tb.on{background:#3a2a14;color:#ffd9a0}
.${P}book{background:#fbf8ee;border:1.5px solid #b9b09a;flex:1;min-height:240px;overflow:auto;position:relative}
.${P}book table{width:100%;border-collapse:collapse;font-size:14px}
.${P}book th{position:sticky;top:0;background:#fbf8ee;color:${GREEN};text-align:left;padding:5px 4px;font-size:12px;border-bottom:1.5px solid ${GREEN};z-index:1}
.${P}book td{border-bottom:1px solid #a9c3cf;padding:2px 4px;height:26px}
.${P}book td.h{font-family:Caveat,'Segoe Print',cursive;font-size:20px;color:#3a3a3c;line-height:1}
.${P}book tr{cursor:pointer}
.${P}book tr:hover td{background:#fff8ea}
.${P}book tr.sel td{background:#fff0d6}
.${P}book tr.sel td:first-child{box-shadow:inset 4px 0 ${RED}}
.${P}book tr.arrow td:first-child::before{content:"→ ";color:${RED}}
.${P}book tr.ink td.h{animation:${P}ink .7s}
@keyframes ${P}ink{0%{color:${RED};text-shadow:0 0 6px rgba(156,59,48,.4)}}
.${P}card{background:#fff;border:1px solid #d4c9ad;padding:8px 10px;font-family:Caveat,'Segoe Print',cursive;font-size:18px;color:#6a4a2a;line-height:1.15;box-shadow:2px 3px 0 rgba(0,0,0,.08);transform:rotate(-.6deg)}
.${P}card>b{display:block;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#6b6b6b}
.${P}card div{display:flex;gap:8px;align-items:center;justify-content:space-between;margin:3px 0}
.${P}card .groove{color:transparent;letter-spacing:.2em;transition:color .25s}
.${P}tilt .${P}card .groove{color:#b7ab92}
.${P}card button{font-size:12px;min-height:30px;padding:3px 8px}
.${P}fc{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}
.${P}fc button.on{outline:3px solid ${RED}}
.${P}fc button:disabled{opacity:.4;cursor:default}
.${P}say{font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.15;color:#2a2a2c;border-left:4px solid ${RED};padding:2px 10px;min-height:24px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(241,234,214,.93);z-index:4;padding:16px;overflow:auto}
.${P}plate{max-width:480px;width:100%;box-sizing:border-box;background:#fbf8ee;border:3px double ${GREEN};padding:18px 22px;color:#222;position:relative;
  background-image:repeating-radial-gradient(circle at 115% -10%,transparent 0 22px,rgba(155,106,60,.16) 22px 23.5px)}
.${P}plate .sheet{font-size:12px;letter-spacing:.2em;color:${GREEN};text-transform:uppercase;border-bottom:1.5px solid ${GREEN};padding-bottom:4px}
.${P}plate h2{margin:8px 0 4px;font:700 32px 'Zilla Slab',Georgia,serif;color:${GREEN};letter-spacing:.06em;text-transform:uppercase}
.${P}plate .goal{font-size:16px;line-height:1.4;margin:0 0 8px}
.${P}plate .rule{font-family:Caveat,'Segoe Print',cursive;font-size:21px;margin:0 0 10px;color:#3a3a3c}
.${P}plate table{border-collapse:collapse;font-size:14px;margin:0 0 12px;width:100%}
.${P}plate td{border-top:1px solid #b9b09a;padding:5px 6px 5px 0;vertical-align:top}
.${P}plate td:first-child{color:${GREEN};font-weight:600;white-space:nowrap}
.${P}plate kbd{font:600 13px 'IBM Plex Mono',monospace;border:1px solid ${GREEN};padding:0 4px;background:#fff}
.${P}plate .scale{display:flex;margin:0 0 12px}.${P}plate .scale i{width:30px;height:6px;border:1px solid #222}.${P}plate .scale i:nth-child(odd){background:#222}
.${P}plate button{font:600 15px 'IBM Plex Mono',monospace;background:${GREEN};color:#fff;border:0;padding:11px 22px;cursor:pointer}
.${P}plate button:focus-visible{outline:3px solid ${RED};outline-offset:3px}
@media (max-width:760px){.${P}wrap{grid-template-columns:1fr;padding:10px}.${P}right{order:-1}.${P}legend{grid-template-columns:repeat(2,minmax(0,1fr))}.${P}book{min-height:280px;max-height:52vh}.${P}chips{grid-template-columns:1fr 1fr}.${P}chip{font-size:13px}}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}left"><svg class="${P}map" viewBox="0 0 700 440" role="img" aria-label="The paper map of Hollin Creek"></svg>
        <div class="${P}legend"><h4><span>LEGEND</span><button type="button" class="note" hidden>Note the grooves</button></h4></div>
        <div class="${P}panel ${P}fc"><b>FORECAST</b><span class="fcmsg">Set every row first.</span></div>
        <div class="${P}card" aria-label="Agnes's postcard"></div></div>
      <div class="${P}right">
        <div class="${P}panel"><div class="${P}title"><span class="st"></span><small class="prog"></small></div><div class="${P}chips"></div><div class="${P}acts"></div></div>
        <div class="${P}say" aria-live="polite"></div>
        <div class="${P}book"><table><thead><tr><th>#</th><th>Seen</th><th>Map</th><th>Leg.</th><th>Note</th></tr></thead><tbody></tbody></table></div>
        <div><button type="button" class="${P}tb" hidden>Tilt to the torch (hold F)</button></div>
      </div>
      <div class="${P}intro"><div class="${P}plate"><div class="sheet"></div><h2>Reconcile</h2>
        <p class="goal"></p><p class="rule"></p>
        <table><tr><td>Pick a row</td><td>click it, or <kbd>↑</kbd> <kbd>↓</kbd></td></tr>
          <tr><td>Set it</td><td>Here <kbd>H</kbd> · Gone <kbd>G</kbd> · Unknown <kbd>U</kbd> (not walked)</td></tr>
          <tr><td>Write it</td><td>tap a detail you saw, or <kbd>1</kbd>–<kbd>3</kbd></td></tr></table>
        <div class="scale"><i></i><i></i><i></i><i></i></div>
        <button type="button">Open the map</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".sheet").textContent = TEXT.sheet; $(`.${P}plate .goal`).textContent = TEXT.goal; $(`.${P}plate .rule`).textContent = TEXT.rule;
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}map`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const sayEl = $(`.${P}say`);
    const say = (t) => { sayEl.textContent = t; };
    const said = new Set();
    const beat = (k, t) => { if (said.has(k)) return false; said.add(k); say(t); return true; };

    // ---- the survey print ----
    const hgt = (x, y) => [[220, 150, 110, 1], [500, 300, 100, 0.7], [470, 100, 80, 0.45], [120, 360, 90, -0.35]]
      .reduce((v, [px, py, s, a]) => v + a * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * s * s)), 0) + 0.06 * Math.sin(x / 47) * Math.cos(y / 61);
    const step = 10;
    for (let li = 0; li < 22; li++) {          // contour lines by marching squares
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
    const ttl = mk("text", { x: 22, y: 34, "font-size": 20, "font-weight": 700, "letter-spacing": 4, fill: "#222", "font-family": "'Zilla Slab',Georgia,serif" });
    ttl.textContent = "HOLLIN CREEK";
    const fcLayer = mk("g", {});
    const selRing = mk("circle", { r: 17, fill: "none", stroke: RED, "stroke-width": 3, "stroke-dasharray": "5 3", visibility: "hidden", "pointer-events": "none" });
    const squares = {};
    for (let n = 1; n <= 24; n++) {
      const s = sitePos(n);
      const sx = s.x + (s.x - CX) * 0.13, sy = s.y + (s.y - CY) * 0.17;
      const g = mk("g", { class: "sq" });
      mk("rect", { class: "hl", x: sx - 14, y: sy - 14, width: 28, height: 28, fill: "transparent", stroke: "none" }, g);   // hit area
      if (MAP(n)) {
        mk("rect", { x: sx - 8, y: sy - 8, width: 16, height: 16, fill: "#222" }, g);
        const t = mk("text", { x: sx + (s.x >= CX ? 13 : -13), y: sy + 6, "text-anchor": s.x >= CX ? "start" : "end", "font-size": 16, "font-family": "'IBM Plex Mono',monospace", fill: "#222" }, g);
        t.textContent = n;
      }
      g.addEventListener("click", () => forecastAt(n));
      squares[n] = { x: sx, y: sy, g };
    }

    // ---- legend: entries 7–24, the box keeps its height; six grooves in the blank band ----
    const lg = $(`.${P}legend`);
    for (let n = 7; n <= 24; n++) { const s = document.createElement("span"); s.innerHTML = `<i></i><b>${n}</b> ${LEG_WHAT[n % 3]}`; lg.appendChild(s); }
    for (let k = 0; k < 6; k++) { const s = document.createElement("span"); s.className = "gv"; s.textContent = "▪ ~~ ~~~~~~"; lg.appendChild(s); }

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
    let photos = false, tiltOk = false, grooveLine = false;

    function paintRow(n, fresh) {
      const r = rows[n], td = trs[n].children;
      td[1].textContent = r.status || "";
      td[4].textContent = r.note;
      if (fresh && !api.reducedMotion) { trs[n].classList.remove("ink"); void trs[n].offsetWidth; trs[n].classList.add("ink"); }
    }
    const setCount = () => Object.values(rows).filter((r) => r.status).length;
    function select(n) {
      sel = n; idle = 0;
      Object.values(trs).forEach((t) => t.classList.remove("sel", "arrow"));
      trs[n].classList.add("sel");
      trs[n].scrollIntoView?.({ block: "nearest" });
      selRing.setAttribute("cx", squares[n].x); selRing.setAttribute("cy", squares[n].y); selRing.setAttribute("visibility", "visible");
      $(".st").textContent = `Site ${n}${n <= 3 ? " · written on day 1" : ""}`;
      $(".prog").textContent = `rows set ${setCount()}/24`;
      const chips = $(`.${P}chips`);
      chips.innerHTML = "";
      const src = [["GROUND", GROUND(n)], ["MAP", MAP(n) ? "printed square" : "nothing printed"], ["LEGEND", LEGEND(n) ? `■ ${n} ${LEG_WHAT[n % 3]}` : "no entry"], ["PHOTOS", photos ? (PHOTOS[n] || "none") : "not yet"]];
      src.forEach(([h, v], i) => { const c = document.createElement("div"); c.className = P + "chip" + (i === 3 && !photos ? " off" : ""); c.innerHTML = `<b>${h}</b>`; c.appendChild(document.createTextNode(v)); chips.appendChild(c); });
      const acts = $(`.${P}acts`);
      acts.innerHTML = "";
      [["Here", "H"], ["Gone", "G"], ["Unknown", "U"]].forEach(([s, k]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = `${s} (${k})`;
        if (rows[n].status === s) b.classList.add("on");
        b.addEventListener("click", () => setStatus(n, s));
        acts.appendChild(b);
      });
      if (rows[n].status && rows[n].status !== "Unknown") DETAILS(n).forEach((d, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "det" + (rows[n].note === d ? " on" : ""); b.textContent = `${i + 1} · ${d}`;
        b.addEventListener("click", () => writeDetail(n, i));
        acts.appendChild(b);
      });
      if (rows[n].status === "Gone" && (MAP(n) || LEGEND(n))) {
        const b = document.createElement("button"); b.type = "button"; b.className = "accept";
        b.textContent = "Correct your note to match.";
        b.addEventListener("click", () => { rows[n].status = "Here"; rows[n].note = ""; rows[n].accepted = true; accepted++; paintRow(n, true); say(TEXT.accept); select(n); check(); });
        acts.appendChild(b);
      }
    }
    function writeDetail(n, i) {
      const d = DETAILS(n)[i];
      if (!d || !rows[n].status || rows[n].status === "Unknown") return;
      rows[n].note = d; paintRow(n, true);
      select(nextUnset(n) || n);
    }
    function nextUnset(from) { for (let k = 1; k <= 24; k++) { const m = ((from + k - 1) % 24) + 1; if (!rows[m].status) return m; } return null; }
    function setStatus(n, s) {
      if (phase === "done") return;
      rows[n].status = s;
      if (s === "Unknown") rows[n].note = "not walked";
      else if (rows[n].note === "not walked") rows[n].note = "";
      paintRow(n, true);
      if (s === "Gone" && !tiltOk) { tiltOk = true; $(`.${P}tb`).hidden = false; beat("tilt", TEXT.tilt); }
      if (!photos && setCount() >= 11) { photos = true; beat("photos", TEXT.photos); }
      select(s === "Unknown" ? (nextUnset(n) || n) : n);
      check();
    }
    function check() {
      const left = Object.keys(rows).filter((n) => !rows[n].status);
      if (!left.length && phase === "rows") {
        phase = "forecast";
        say(TEXT.forecast);
        drawForecastUI();
        svg.scrollIntoView?.({ block: "nearest", behavior: api.reducedMotion ? "auto" : "smooth" });
      }
    }

    // ---- forecast ----
    function drawForecastUI() {
      const f = $(`.${P}fc`);
      f.innerHTML = "<b>FORECAST</b>";
      const msg = document.createElement("span"); msg.textContent = `Tap the map: by ${fcMode}`;
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
        mk("circle", { cx: s.x, cy: s.y, r: 13, fill: "none", stroke: GRAPH, "stroke-width": 2.5 }, fcLayer);
        const t = mk("text", { x: (CX + s.x) / 2 + 6, y: (CY + s.y) / 2 - 6, "font-size": 24, fill: GRAPH, "font-family": "Caveat,cursive", "font-weight": 700 }, fcLayer);
        t.textContent = `by ${m}`;
      }
      if (fcMode === "noon" && !fc.dark) { fcMode = "dark"; beat("dell", TEXT.dell); }
      drawForecastUI();
    }

    // ---- postcard in the margin ----
    const card = $(`.${P}card`);
    card.innerHTML = `<b>AGNES'S POSTCARD</b>`;
    for (const line of POSTCARD) {
      const d = document.createElement("div");
      if (!line.text) { d.innerHTML = `<span class="groove">— — — — — — — — —</span>`; card.appendChild(d); continue; }
      const s = document.createElement("span"); s.textContent = line.text; d.appendChild(s);
      const b = document.createElement("button"); b.type = "button"; b.textContent = "Copy";
      b.addEventListener("click", () => { copied.add(line.k); b.textContent = "Copied"; b.disabled = true; say(`${line.text.split(".")[0]}: ${TEXT.copy}`); });
      d.appendChild(b); card.appendChild(d);
    }

    // ---- tilt to the torch ----
    const noteBtn = $(".note");
    const tiltOn = () => { if (!tiltOk || over) return; wrap.classList.add(P + "tilt"); $(`.${P}tb`).classList.add("on"); if (!grooveLine) noteBtn.hidden = false; };
    const tiltOff = () => { wrap.classList.remove(P + "tilt"); $(`.${P}tb`).classList.remove("on"); };
    const tb = $(`.${P}tb`);
    tb.addEventListener("pointerdown", (e) => { e.preventDefault(); tiltOn(); });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) tb.addEventListener(ev, tiltOff);
    noteBtn.addEventListener("click", () => { grooveLine = true; noteBtn.hidden = true; say(`${TEXT.grooves} Notebook: "${TEXT.groovesLine}."`); });

    function finish() {
      if (over) return;
      over = true; phase = "done";
      let right = 0;
      for (let n = 4; n <= 24; n++) if (rows[n].status === TRUTH(n)) right++;
      const fr = Math.abs(fc.noon - 15) <= 1 && Math.abs(fc.dark - 19) <= 1;
      const good = right >= 17 && fr;
      api.store.set("last", { right, accepted, forecast_right: fr, mother_lines_kept: copied.size, grooves: grooveLine });
      const E = TEXT.end;
      api.end({
        outcome: good ? "win" : "done",
        text: [good ? E.winLead : E.doneLead, E.rows(right), accepted ? E.accepted(accepted) : "", fr ? E.fcRight : E.fcWrong,
          copied.size ? E.copied(copied.size) : E.noCopy, grooveLine ? E.grooves : ""].filter(Boolean).join(" "),
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
      else if (/^[1-3]$/.test(k)) writeDetail(sel, +k - 1);
      else if (k === "f" && !e.repeat) tiltOn();
    };
    const ku = (e) => { if (e.key.toLowerCase() === "f") tiltOff(); };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const bump = () => { idle = 0; };
    wrap.addEventListener("pointerdown", bump);
    const hint = setInterval(() => {
      if (over || $(`.${P}intro`)) return;
      idle++;
      if (idle === 45) {   // the source that disagrees with the others pulses once
        const chips = [...wrap.querySelectorAll(`.${P}chip`)];
        if (MAP(sel) !== (GROUND(sel) === "here") && chips[0]) chips[0].classList.add("pulse");
      }
      if (idle === 90) {
        const next = nextUnset(sel);
        if (next) trs[next].classList.add("arrow");
      }
    }, 1000);

    for (let n = 1; n <= 24; n++) paintRow(n);
    select(4);
    const go = $(`.${P}plate button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); select(4); say(TEXT.open); });
    go.focus();

    return {
      unmount() {
        over = true;
        clearInterval(hint);
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  },
};

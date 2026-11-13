// Behind the Peephole / The Mosaic (1D, link board). Style: cork-board collage, pinned cards and
// pulled thread. One morning: the night-three board (`n3_mosaic`, 6 lengths), with the pins,
// links and questions of games/behind-the-peephole/data/truth.json (mosaic) up to night three, and
// the clue cards those links rest on (data/beats.json). Cut: links do not persist to later nights.
// Actions: SPOOL (choose the kind of link), THREAD (pin to pin; costs a length), READ (a card's clue
// slips, in the reading panel) and the PENCIL RINGS (the design's hint: a ring round a pin with an
// unused true link). Phases: the first threads; new cards go up as true links open them; the last
// lengths.

const TYPES = [
  { id: "met", name: "met", col: "#b8322a", dash: "", key: "1" },
  { id: "works_for", name: "works for", col: "#2f5fb0", dash: "14 8", key: "2" },
  { id: "family", name: "family", col: "#e2bd3c", dash: "", dbl: true, key: "3" },
  { id: "after", name: "after", col: "#f6f1e4", dash: "2 7", key: "4" },
];
const GUESTS = [
  { id: "r401", name: "401", clues: ["Red clay on his collar and knees.", "A laminated pass on a lanyard: \"BH\".", "A photograph on the desk, face up, then face down: 403's guest at her own door."] },
  { id: "r402", name: "402", clues: ["An orchid in her buttonhole.", "Presses the orchid in the hotel directory."] },
  { id: "r403", name: "403", clues: ["Red clay on her boots and on the white gloves: the same red as 401's collar.", "A brass tag, \"BH-0611\", set on the sill.", "A flat hard case under the bed, where there was nothing last night."] },
  { id: "r404", name: "404", clues: ["A photocopied page, read under the lamp with a magnifier."] },
  { id: "r405", name: "405", clues: ["A spool of cable.", "Dials the room phone: \"Ruthie, it's—\""] },
  { id: "r406", name: "406", clues: ["The room phone rings; she answers, hears a voice, hangs up."] },
];
const OTHERS = [
  { id: "bonded_house", name: "THE BONDED HOUSE", about: "A bonded warehouse on the river embankment, red clay underfoot. The city's traces card puts the clay there." },
  { id: "case", name: "THE CASE", hidden: true, about: "A flat hard case under 403's bed." },
  { id: "drost", name: "DROST", hidden: true, about: "The name behind the Bonded House." },
  { id: "photograph", name: "THE PHOTOGRAPH", about: "Seen on 401's desk: 403's guest at her own door." },
  { id: "gala", name: "THE GALA", about: "The Assembly Rooms gala, rehearsing this week." },
  { id: "stranger", name: "THE STRANGER", about: "Whoever knocks at 2:14." },
  { id: "you", name: "YOU", about: "The night auditor, fourth floor." },
];
const ROWS = [
  "401 · N1 · THE BONDED HOUSE", "402 · N1 · THE GLASSHOUSE", "403 · N1 · THE FISH MARKET",
  "404 · N2 · PHOTOCOPY · RECEIVED", "402 · N2 · ORCHID · HANDED OVER", "405 · N2 · CABLE SPOOL · ERASED",
  "403 · N2 · CRATE TAG · STOLE", "401 · N2 · SECURITY PASS · BRIEFED",
];
const LINKS = [
  { a: "r402", b: "r404", type: "met", q: "What did she give him?" },
  { a: "r403", b: "bonded_house", type: "after", q: "What did she take?", adds: "case" },
  { a: "r401", b: "bonded_house", type: "works_for", q: "Who is he guarding it for?", adds: "drost" },
  { a: "r403", b: "case", type: "after", q: "Who wants it back?" },
  { a: "r405", b: "r406", type: "family", q: "Why did she call?" },
  { a: "r401", b: "r403", type: "after", q: "What will he do?" },
  { a: "r405", b: "bonded_house", type: "works_for", q: "What did she erase?" },
];
const LENGTHS = 6;
const pairKey = (a, b) => [a, b].sort().join("|");
const NOTES = {
  open: "The morning after night three. The cork board in the office, under the green lamp: six lives you know only by what they carry home, and six lengths of thread.",
  taut: "It pulls taut. A question goes up, and questions are how you learn where to look tonight.",
  slack: "Slack. The thread hangs between two lives that never touched, as far as you know.",
  case: "A new card goes up: THE CASE. Something came home with 403 that was not there the night before.",
  drost: "A name goes up that the hotel never says aloud: DROST.",
  last: "Two lengths left on the spools, and the light in the office is turning grey.",
};

function wrapText(text, n) {
  const out = []; let line = "";
  for (const w of text.split(" ")) { if ((line + " " + w).trim().length > n) { out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line);
  return out;
}

export default {
  mount(root, api) {
    const P = "behind-the-peephole-mosaic-";
    const NS = "http://www.w3.org/2000/svg";
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:#3a2716;display:grid;grid-template-columns:minmax(0,1fr) 290px;grid-template-rows:auto minmax(0,1fr);overflow:hidden;touch-action:none;user-select:none;font:14px/1.4 "Courier New",monospace;color:#1c1a17}
    .${P}qs{grid-column:1 / -1;display:flex;gap:8px;overflow-x:auto;padding:8px 10px;min-height:46px;background:#5a3e22;align-items:center;box-shadow:inset 0 -2px 0 #2a1a0c}
    .${P}qs .q{flex:none;background:#fbf6e8;padding:6px 12px 6px 22px;font:italic 15px Georgia,serif;position:relative;transform:rotate(-1deg);box-shadow:2px 3px 0 #0005}
    .${P}qs .q::before{content:"";position:absolute;left:7px;top:50%;width:9px;height:9px;margin-top:-5px;border-radius:50%;background:#a3302a}
    .${P}qs .q.fresh{animation:${P}pin .5s ease-out}
    @keyframes ${P}pin{0%{transform:translateY(-30px) rotate(-6deg);opacity:0}100%{transform:rotate(-1deg);opacity:1}}
    .${P}qs .none{color:#f4ecd6;opacity:.8;font-size:14px;letter-spacing:.06em}
    .${P}board{position:relative;min-height:0}
    .${P}board svg{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pin{cursor:pointer}
    .${P}pin:focus{outline:none}
    .${P}pin:focus .${P}card,.${P}pin:hover .${P}card{stroke:#f6cf86;stroke-width:4}
    .${P}side{background:#2a1a0c;color:#f4ecd6;padding:10px;overflow:auto;display:flex;flex-direction:column;gap:10px;border-left:2px solid #1a0f06;min-height:0}
    .${P}side>*{flex:none}
    .${P}spools{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .${P}sp{display:flex;align-items:center;gap:8px;font:700 13px "Courier New",monospace;letter-spacing:.04em;color:#1c1a17;background:#e9dcc0;border:2px solid transparent;padding:6px 8px;min-height:44px;cursor:pointer;text-align:left}
    .${P}sp:hover,.${P}sp:focus-visible{border-color:#f6cf86;outline:none}
    .${P}sp.on{background:#f6cf86;border-color:#1c1a17;box-shadow:inset 0 0 0 2px #fff6}
    .${P}sp svg{flex:none}
    .${P}len{display:flex;align-items:center;gap:6px;font:700 14px "Courier New",monospace;letter-spacing:.08em}
    .${P}len i{display:inline-block;width:18px;height:6px;border-radius:3px;background:#b8322a}
    .${P}len i.gone{background:#6a5440}
    .${P}read{background:#f4ecd6;color:#1c1a17;padding:9px 10px 10px;box-shadow:3px 4px 0 #0006;min-height:120px}
    .${P}read h3{margin:0 0 6px;font:700 15px "Courier New",monospace;letter-spacing:.06em;border-bottom:1px solid #a3302a;padding-bottom:3px}
    .${P}read p{margin:0 0 6px;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:15px;line-height:1.3}
    .${P}read p.t{font-family:"Courier New",monospace;font-size:14px}
    .${P}read small{display:block;font-size:12px;color:#5a4a30}
    .${P}msg{font:italic 15px/1.35 Georgia,serif;color:#f6cf86;min-height:2.6em}
    .${P}msg.bad{color:#ffb3a0}
    .${P}story{font:italic 14px/1.4 Georgia,serif;color:#e9dcc0;border-left:3px solid #b8913f;padding-left:8px}
    .${P}row{display:flex;gap:6px;flex-wrap:wrap}
    .${P}btn{font:700 13px "Courier New",monospace;letter-spacing:.08em;padding:8px 12px;border:2px solid #1c1a17;background:#e0a24a;color:#1c1a17;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#f6cf86;outline:none}
    .${P}btn.ghost{background:#e9dcc0}
    .${P}btn[hidden]{display:none}
    .${P}btn.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px #f6cf86}}
    .${P}rows{display:none;font-size:13px;color:#2a3a8c}
    .${P}rows div{background:#efe6cf;padding:3px 6px;margin:3px 0}
    @media (max-width:760px){
      .${P}wrap{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) 40%}
      .${P}board{overflow-y:auto;touch-action:pan-y}
      .${P}board svg{position:static;height:auto}
      .${P}side{border-left:0;border-top:2px solid #1a0f06;padding:8px}
      .${P}spools{grid-template-columns:repeat(4,1fr)}
      .${P}sp{flex-direction:column;gap:2px;padding:4px;font-size:12px;text-align:center}
      .${P}read{min-height:0}
      .${P}rows{display:block}
    }
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(30,18,8,.86);padding:12px;z-index:3;overflow:auto}
    .${P}note{max-width:500px;width:100%;box-sizing:border-box;background:#f4ecd6;color:#1c1a17;padding:24px 22px 18px;font:14px/1.5 "Courier New",monospace;box-shadow:5px 7px 0 #0007;transform:rotate(-1deg);position:relative}
    .${P}note::before{content:"";position:absolute;left:50%;top:-8px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#e05a4a,#8a2018);box-shadow:1px 2px 2px #0006}
    .${P}note::after{content:"";position:absolute;right:-10px;top:30px;width:70px;height:22px;background:rgba(240,230,190,.7);transform:rotate(30deg)}
    .${P}note h2{margin:0 0 6px;font:700 22px "Courier New",monospace;letter-spacing:.1em}
    .${P}note .goal{font-weight:700;margin:0 0 6px}
    .${P}note .open{font:italic 15px/1.4 Georgia,serif;margin:0 0 10px}
    .${P}note ul{list-style:none;padding:0;margin:0 0 12px;display:grid;gap:5px}
    .${P}note li b{display:inline-block;min-width:6.5em;letter-spacing:.06em}
    .${P}note .ft{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    `;
    root.appendChild(st);
    const wrapEl = document.createElement("div");
    wrapEl.className = P + "wrap";
    root.appendChild(wrapEl);
    wrapEl.innerHTML = `<div class="${P}qs" aria-live="polite"><span class="none">QUESTIONS PIN HERE WHEN A THREAD PULLS TAUT</span></div>
      <div class="${P}board"></div>
      <div class="${P}side">
        <div class="${P}spools" role="radiogroup" aria-label="Thread"></div>
        <div class="${P}len"></div>
        <div class="${P}msg" aria-live="polite"></div>
        <div class="${P}read"><h3>READ A CARD</h3><small>Hover or tap a pinned card to read its clue cards here.</small></div>
        <div class="${P}story"></div>
        <div class="${P}rows"></div>
        <div class="${P}row"><button type="button" class="${P}btn ghost" data-act="rings" hidden>PENCIL RINGS · ON</button><button type="button" class="${P}btn" data-act="done">LEAVE THE BOARD</button></div>
      </div>`;
    const board = wrapEl.querySelector("." + P + "board"), qsEl = wrapEl.querySelector("." + P + "qs"), spoolsEl = wrapEl.querySelector("." + P + "spools");
    const lenEl = wrapEl.querySelector("." + P + "len"), msgEl = wrapEl.querySelector("." + P + "msg"), readEl = wrapEl.querySelector("." + P + "read"), storyEl = wrapEl.querySelector("." + P + "story");
    const ringsBtn = wrapEl.querySelector('[data-act="rings"]'), doneBtn = wrapEl.querySelector('[data-act="done"]');
    wrapEl.querySelector("." + P + "rows").innerHTML = "<b>STAMPED ROWS</b>" + ROWS.map((r) => `<div>${r}</div>`).join("");
    storyEl.textContent = NOTES.open;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "application");
    svg.setAttribute("aria-label", "Cork board. Drag a thread from one pinned card to another.");
    board.appendChild(svg);
    const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };

    let spool = 0, lengths = LENGTHS, threads = [], revealed = new Set(), questions = [], over = false, rings = true, slackN = 0;
    let drag = null, kbFrom = null, portrait = false, pos = {}, VB = [1200, 900], fresh = null;
    const listeners = [], timers = [], told = new Set();
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const say = (m, bad) => { msgEl.textContent = m; msgEl.classList.toggle("bad", !!bad); };
    const tell = (m) => { storyEl.textContent = m; };

    TYPES.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "sp"; b.dataset.spool = i; b.setAttribute("role", "radio");
      b.innerHTML = `<svg width="34" height="16" viewBox="0 0 34 16"><path d="M2 8 H32" stroke="${t.col}" stroke-width="${t.dbl ? 7 : 4}" stroke-dasharray="${t.dash || "none"}" stroke-linecap="round"/>${t.dbl ? '<path d="M2 8 H32" stroke="#5a3e22" stroke-width="2"/>' : ""}</svg><span>${t.key} ${t.name.toUpperCase()}</span>`;
      spoolsEl.appendChild(b);
    });
    function paintSide() {
      spoolsEl.querySelectorAll("button").forEach((b, i) => { b.classList.toggle("on", i === spool); b.setAttribute("aria-checked", i === spool); });
      lenEl.innerHTML = `LENGTHS ${lengths}/${LENGTHS} ` + Array.from({ length: LENGTHS }, (_, i) => `<i class="${i < lengths ? "" : "gone"}" style="background:${i < lengths ? TYPES[spool].col : ""}"></i>`).join("");
      ringsBtn.textContent = `PENCIL RINGS · ${rings ? "ON" : "OFF"}`;
    }
    function paintQs() {
      qsEl.innerHTML = questions.length ? "" : `<span class="none">QUESTIONS PIN HERE WHEN A THREAD PULLS TAUT</span>`;
      questions.forEach((q) => { const d = document.createElement("span"); d.className = "q" + (q === fresh && !RM ? " fresh" : ""); d.textContent = q; qsEl.appendChild(d); });
    }
    function readCard(id) {
      const g = GUESTS.find((x) => x.id === id), o = OTHERS.find((x) => x.id === id);
      readEl.innerHTML = "";
      const h = document.createElement("h3"); h.textContent = g ? `ROOM ${g.name}` : o.name; readEl.appendChild(h);
      if (g) g.clues.forEach((c) => { const p = document.createElement("p"); p.textContent = "· " + c; readEl.appendChild(p); });
      else { const p = document.createElement("p"); p.className = "t"; p.textContent = o.about; readEl.appendChild(p); }
      const links = threads.filter((t) => t.a === id || t.b === id);
      if (links.length) { const s = document.createElement("small"); s.textContent = "Threads: " + links.map((t) => `${t.taut ? "taut" : "slack"} ${TYPES.find((x) => x.id === t.type).name} to ${label(t.a === id ? t.b : t.a)}`).join("; "); readEl.appendChild(s); }
    }
    const label = (id) => { const g = GUESTS.find((x) => x.id === id); return g ? g.name : OTHERS.find((x) => x.id === id).name.replace(/^THE /, "").toLowerCase(); };

    function computeLayout() {
      const w = board.clientWidth || 1000, h = board.clientHeight || 700;
      portrait = w < 640 || w / h < 0.95;
      pos = {};
      const others = OTHERS.filter((o) => !o.hidden || revealed.has(o.id));
      if (!portrait) {
        VB = [1200, 900];
        const n = others.length, cw = Math.min(150, 1120 / n);
        others.forEach((o, i) => { pos[o.id] = { x: 600 - (n - 1) * cw / 2 + i * cw, y: 150, w: cw - 16, h: 66 }; });
        GUESTS.forEach((g, i) => { pos[g.id] = { x: 115 + i * 194, y: 430, w: 150, h: 170, guest: true }; });
        pos.rows = { x: 40, y: 712, cols: 2, cw: 560, rh: 42 };
      } else {
        VB = [800, Math.max(900, Math.min(1300, 800 * h / w))];
        others.forEach((o, i) => { pos[o.id] = { x: 140 + (i % 3) * 260, y: 90 + Math.floor(i / 3) * 112, w: 236, h: 88, big: true }; });
        const gy0 = 90 + Math.ceil(others.length / 3) * 112 + 150;
        GUESTS.forEach((g, i) => { pos[g.id] = { x: 140 + (i % 3) * 260, y: gy0 + Math.floor(i / 3) * 330, w: 220, h: 230, guest: true, big: true }; });
        VB[1] = Math.max(VB[1], gy0 + 330 + 160);
        pos.rows = null;
      }
      svg.setAttribute("viewBox", `0 0 ${VB[0]} ${VB[1]}`);
    }
    const pinPt = (id) => ({ x: pos[id].x, y: pos[id].y - (pos[id].guest ? pos[id].h / 2 + 4 : pos[id].h / 2 - 6) });

    function threadPath(a, b, taut) {
      if (taut) return `M${a.x},${a.y} L${b.x},${b.y}`;
      const mx = (a.x + b.x) / 2, my = Math.max(a.y, b.y) + 60 + Math.hypot(b.x - a.x, b.y - a.y) * 0.18;
      return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    }
    function drawThread(g, a, b, type, taut, extra = {}) {
      const t = TYPES.find((x) => x.id === type);
      const d = threadPath(a, b, taut);
      const w = portrait ? 6 : 3.6;
      if (t.dbl) {
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": w * 2.2, opacity: taut ? 1 : 0.8, ...extra }, g);
        el("path", { d, fill: "none", stroke: "#5a3e22", "stroke-width": w * 0.7, ...extra }, g);
      } else {
        el("path", { d, fill: "none", stroke: "#0006", "stroke-width": w + 1, transform: "translate(2 3)", ...extra }, g);
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": w, "stroke-dasharray": t.dash, "stroke-linecap": "round", opacity: taut ? 1 : 0.85, ...extra }, g);
      }
    }

    function render() {
      computeLayout();
      svg.innerHTML = "";
      const defs = el("defs", {}, svg);
      const pat = el("pattern", { id: P + "cork", width: 60, height: 60, patternUnits: "userSpaceOnUse" }, defs);
      el("rect", { width: 60, height: 60, fill: "#b07a45" }, pat);
      const rng = api.rng(7);
      for (let i = 0; i < 40; i++) el("circle", { cx: rng() * 60, cy: rng() * 60, r: 0.6 + rng() * 1.6, fill: rng() < 0.5 ? "#7a4a24" : "#d29a5e", opacity: 0.7 }, pat);
      el("rect", { x: 0, y: 0, width: VB[0], height: VB[1], fill: "#5a3e22" }, svg);
      el("rect", { x: 12, y: 12, width: VB[0] - 24, height: VB[1] - 24, fill: `url(#${P}cork)` }, svg);
      // old pin holes and a coffee ring, for wear
      for (let i = 0; i < 30; i++) el("circle", { cx: 30 + rng() * (VB[0] - 60), cy: 30 + rng() * (VB[1] - 60), r: 1.6, fill: "#3a2716", opacity: 0.6 }, svg);
      el("circle", { cx: VB[0] * 0.86, cy: VB[1] * 0.9, r: 46, fill: "none", stroke: "#6a4220", "stroke-width": 5, opacity: 0.25 }, svg);
      if (pos.rows) {
        const rh = el("text", { x: pos.rows.x, y: pos.rows.y - 12, "font-family": "Courier New,monospace", "font-size": 18, "font-weight": 700, fill: "#2a1a0c" }, svg);
        rh.textContent = "STAMPED STATEMENT ROWS";
        ROWS.forEach((r, i) => {
          const x = pos.rows.x + (i % pos.rows.cols) * pos.rows.cw, y = pos.rows.y + Math.floor(i / pos.rows.cols) * pos.rows.rh;
          el("rect", { x, y, width: pos.rows.cw - 12, height: pos.rows.rh - 8, fill: "#efe6cf", stroke: "#b8a77f", transform: `rotate(${(i % 2) ? 0.6 : -0.5} ${x} ${y})` }, svg);
          const t = el("text", { x: x + 10, y: y + 24, "font-family": "Courier New,monospace", "font-size": 19, fill: "#2a3a8c" }, svg);
          t.textContent = r;
        });
      }
      const under = el("g", {}, svg);
      const cards = el("g", {}, svg);
      const over_ = el("g", {}, svg);
      for (const th of threads) if (!th.taut) drawThread(under, pinPt(th.a), pinPt(th.b), th.type, false);

      const unused = new Map();
      if (rings) for (const L of LINKS) {
        if (!pos[L.a] || !pos[L.b]) continue;
        if (threads.some((t) => t.taut && pairKey(t.a, t.b) === pairKey(L.a, L.b))) continue;
        unused.set(L.a, L.type); unused.set(L.b, L.type);
      }
      const all = [...OTHERS.filter((o) => pos[o.id]), ...GUESTS];
      all.forEach((o, i) => {
        const p = pos[o.id];
        const g = el("g", { class: P + "pin", "data-pin": o.id, tabindex: 0, role: "button", "aria-label": `Pin: ${p.guest ? "Room " + o.name : o.name}`, transform: `rotate(${((i * 37) % 7) - 3} ${p.x} ${p.y})` }, cards);
        if (p.guest) {
          const top = p.y - p.h / 2;
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: top, width: p.w, height: p.h, fill: "#f4f1ea", stroke: "#cfc6b0", "stroke-width": 1.5 }, g);
          el("rect", { x: p.x - p.w / 2 + 10, y: top + 10, width: p.w - 20, height: p.h * 0.6, fill: "#2b3540" }, g);
          const hc = top + 10 + p.h * 0.3;
          el("circle", { cx: p.x, cy: hc - p.h * 0.06, r: p.w * 0.12, fill: "#14181c" }, g);
          el("path", { d: `M${p.x - p.w * 0.26},${top + 10 + p.h * 0.6} Q${p.x - p.w * 0.22},${hc + p.h * 0.08} ${p.x},${hc + p.h * 0.06} Q${p.x + p.w * 0.22},${hc + p.h * 0.08} ${p.x + p.w * 0.26},${top + 10 + p.h * 0.6}Z`, fill: "#14181c" }, g);
          const t = el("text", { x: p.x, y: top + p.h - (p.big ? 22 : 18), "text-anchor": "middle", "font-family": "Georgia,serif", "font-weight": 700, "font-size": p.big ? 44 : 28, fill: "#1c1a17" }, g);
          t.textContent = o.name;
          // the clue slips, typed and pinned under the photo
          const sw = p.w + 10, sh = p.big ? 54 : 40;
          el("rect", { x: p.x - sw / 2, y: top + p.h + 6, width: sw, height: sh, fill: "#fbf6e8", stroke: "#c9bc98" }, g);
          for (let k = 0; k < 2; k++) el("line", { x1: p.x - sw / 2 + 8, x2: p.x + sw / 2 - 8 - k * 30, y1: top + p.h + 16 + k * 8, y2: top + p.h + 16 + k * 8, stroke: "#2a3a8c", opacity: 0.25, "stroke-width": 2 }, g);
          const ct = el("text", { x: p.x, y: top + p.h + sh - (p.big ? 10 : 8), "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": p.big ? 26 : 16, fill: "#2a3a8c" }, g);
          ct.textContent = `${o.clues.length} CARD${o.clues.length === 1 ? "" : "S"} · READ`;
        } else {
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, fill: o.id === fresh ? "#fff7d6" : "#efe6cf", stroke: "#b8a77f", "stroke-width": 1.5 }, g);
          el("line", { x1: p.x - p.w / 2, x2: p.x + p.w / 2, y1: p.y - p.h / 2 + 18, y2: p.y - p.h / 2 + 18, stroke: "#a3302a", opacity: 0.5 }, g);
          const fs = p.big ? 28 : 17;
          const lines = wrapText(o.name, Math.max(6, Math.floor(p.w / (fs * 0.62))));
          lines.forEach((l, k) => { const t = el("text", { x: p.x, y: p.y + 12 + (k - (lines.length - 1) / 2) * (fs + 2), "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": fs, fill: "#1c1a17" }, g); t.textContent = l; });
        }
        const pp = pinPt(o.id), pr = p.big ? 14 : 9;
        if (unused.has(o.id)) el("circle", { cx: pp.x, cy: pp.y, r: pr * 2.1, fill: "none", stroke: gentle ? TYPES.find((t) => t.id === unused.get(o.id)).col : "#3a3a3a", "stroke-width": gentle ? 3 : 1.6, "stroke-dasharray": "5 4", opacity: 0.85 }, g);
        const sel = (drag && drag.from === o.id) || kbFrom === o.id;
        el("circle", { cx: pp.x + 1.5, cy: pp.y + 2.5, r: pr, fill: "#0005" }, g);
        el("circle", { cx: pp.x, cy: pp.y, r: sel ? pr * 1.3 : pr, fill: sel ? "#f6cf86" : "#b8913f", stroke: "#3b2a0e", "stroke-width": 1.5 }, g);
      });
      for (const th of threads) if (th.taut) drawThread(over_, pinPt(th.a), pinPt(th.b), th.type, true, { "pointer-events": "none" });
      if (drag && drag.pt) {
        const a = pinPt(drag.from), t = TYPES[spool];
        const over = pinAt(drag.pt);
        el("line", { x1: a.x, y1: a.y, x2: drag.pt.x, y2: drag.pt.y, stroke: t.col, "stroke-width": portrait ? 6 : 3.5, "stroke-dasharray": t.dash || "none", "pointer-events": "none" }, svg);
        if (over && over !== drag.from) { const q = pinPt(over); el("circle", { cx: q.x, cy: q.y, r: portrait ? 26 : 16, fill: "none", stroke: "#f6cf86", "stroke-width": 3, "pointer-events": "none" }, svg); }
      }
      paintSide();
    }

    function link(a, b) {
      if (over || a === b) return;
      if (lengths <= 0) return;
      if (threads.some((t) => pairKey(t.a, t.b) === pairKey(a, b))) { say("A thread already runs between those two.", true); render(); return; }
      const type = TYPES[spool].id;
      const L = LINKS.find((l) => pairKey(l.a, l.b) === pairKey(a, b) && l.type === type);
      lengths--;
      threads.push({ a, b, type, taut: !!L });
      if (L) {
        questions.push(L.q); fresh = L.q;
        if (L.adds) { revealed.add(L.adds); fresh = L.adds; }
        say(`Taut. “${L.q}” pins to the top.${L.adds ? " A new card goes up." : ""}`);
        if (L.adds === "case") tell(NOTES.case);
        else if (L.adds === "drost") tell(NOTES.drost);
        else if (!told.has("taut")) { told.add("taut"); tell(NOTES.taut); }
        paintQs(); fresh = L.adds || null;
      } else {
        slackN++;
        say(`Slack: ${label(a)} and ${label(b)} as "${TYPES[spool].name}". One length gone.`, true);
        if (!told.has("slack")) { told.add("slack"); tell(NOTES.slack); }
      }
      if (slackN >= 1 && ringsBtn.hidden) { ringsBtn.hidden = false; ringsBtn.classList.add("new"); timers.push(setTimeout(() => ringsBtn.classList.remove("new"), 3200)); }
      if (lengths === 2) tell(NOTES.last);
      render();
      if (lengths <= 0) finish();
    }
    function finish() {
      if (over) return;
      over = true;
      const taut = threads.filter((t) => t.taut).length;
      api.store.set("best", Math.max(api.store.get("best", 0), taut));
      const outcome = taut >= 5 ? "win" : taut >= 3 ? "done" : "lose";
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      timers.push(setTimeout(() => api.end({
        outcome,
        text: `${taut} of ${threads.length} threads pulled taut; ${questions.length} question${questions.length === 1 ? "" : "s"} pinned for tonight. ` +
          (taut >= 5 ? "“Their stories overlap. Their secrets rhyme. Their patterns converge.” You can see it on the cork now, and you can see how little of it is yours to know."
            : taut >= 3 ? "Some of it holds. The rest hangs slack until another night's evidence comes home."
              : "Mostly slack thread, and few questions to carry into the night. Read the cards before you tie on: the clay, the tag, the phone."),
      }), 1100));
    }

    function svgPt(e) {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(m.inverse());
      return { x: q.x, y: q.y };
    }
    function pinAt(pt) {
      let best = null, bd = 1e9;
      for (const id in pos) {
        const p = pos[id]; if (!p || p.w == null) continue;
        const top = p.y - p.h / 2 - 22, bot = p.y + p.h / 2 + (p.guest ? 64 : 6);
        if (pt.x >= p.x - p.w / 2 - 8 && pt.x <= p.x + p.w / 2 + 8 && pt.y >= top && pt.y <= bot) {
          const d = Math.hypot(pt.x - p.x, pt.y - p.y); if (d < bd) { bd = d; best = id; }
        }
      }
      return best;
    }
    on(spoolsEl, "click", (e) => { const b = e.target.closest("[data-spool]"); if (!b || over) return; spool = +b.dataset.spool; render(); });
    on(ringsBtn, "click", () => { rings = !rings; render(); });
    on(doneBtn, "click", () => { if (!over) finish(); });
    on(svg, "pointerdown", (e) => {
      if (over) return;
      const id = pinAt(svgPt(e));
      if (!id) { if (kbFrom) { kbFrom = null; say(""); render(); } return; }
      readCard(id);
      if (kbFrom && kbFrom !== id) { const f = kbFrom; kbFrom = null; link(f, id); return; }
      drag = { from: id, pt: null, moved: false };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      render();
    });
    let hoverId = null;
    on(svg, "pointermove", (e) => {
      const pt = svgPt(e);
      if (!drag) { const id = pinAt(pt); if (id && id !== hoverId) { hoverId = id; readCard(id); } return; }
      drag.pt = pt; drag.moved = true; render();
    });
    on(svg, "pointerup", (e) => {
      if (!drag) return;
      const from = drag.from, moved = drag.moved;
      drag = null;
      const id = pinAt(svgPt(e));
      if (id && id !== from) { link(from, id); return; }
      if (!moved) { kbFrom = from === kbFrom ? null : from; say(kbFrom ? `Thread tied on at ${label(from)}. Tap the card it runs to.` : ""); render(); return; }
      render();
    });
    on(svg, "focusin", (e) => { const g = e.target.closest && e.target.closest("[data-pin]"); if (g) readCard(g.dataset.pin); });
    on(svg, "keydown", (e) => {
      if (over) return;
      const g = e.target.closest && e.target.closest("[data-pin]");
      if ((e.key === "Enter" || e.key === " ") && g) {
        e.preventDefault();
        const id = g.dataset.pin;
        if (!kbFrom) { kbFrom = id; say(`Thread tied on at ${label(id)}. Tab to the card it runs to and press Enter.`); render(); }
        else if (kbFrom === id) { kbFrom = null; say(""); render(); }
        else { const f = kbFrom; kbFrom = null; link(f, id); }
        const again = svg.querySelector(`[data-pin="${id}"]`); if (again) again.focus();
      }
    });
    on(window, "keydown", (e) => {
      if (over || wrapEl.querySelector("." + P + "intro")) return;
      if (/^[1-4]$/.test(e.key)) { spool = +e.key - 1; render(); }
      if ((e.key === "r" || e.key === "R") && !ringsBtn.hidden) { rings = !rings; render(); }
      if (e.key === "Escape") { kbFrom = null; drag = null; say(""); render(); }
    });
    const ro = new ResizeObserver(() => render());
    ro.observe(board);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}note"><h2>THE MOSAIC · NIGHT 3</h2>
      <p class="goal">Pull at least five threads taut with six lengths.</p>
      <p class="open"></p>
      <ul>
        <li><b>SPOOL</b> keys 1–4 or tap: <span style="color:#b8322a;font-weight:700">met</span>, <span style="color:#2f5fb0;font-weight:700">works for</span>, <span style="color:#a8862a;font-weight:700">family</span>, <b style="min-width:0">after</b>.</li>
        <li><b>THREAD</b> drag one pin to another, or tap one then the other.</li>
        <li><b>READ</b> hover or tap a card: its clue cards show at the side.</li>
      </ul>
      <div class="ft">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> rings drawn in the colour of the thread they want</label>` : "<span>A true link pulls taut; a wrong one hangs slack.</span>"}<button type="button" class="${P}btn">TO THE BOARD</button></div></div>`;
    intro.querySelector(".open").textContent = NOTES.open;
    wrapEl.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); render(); });
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); render(); });
    render();
    sb.focus();

    return {
      unmount() {
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
  },
};

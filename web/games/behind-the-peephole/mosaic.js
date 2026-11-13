// Behind the Peephole / The Mosaic (1D, link board). Style: cork-board collage, pinned cards and
// pulled thread. One morning: the night-three board (`n3_mosaic`, 6 lengths), with the pins,
// links and questions of games/behind-the-peephole/data/truth.json (mosaic) up to night three, and
// the clue cards those links rest on (data/beats.json). Cut: links do not persist to later nights.

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
  { id: "bonded_house", name: "THE BONDED HOUSE" },
  { id: "case", name: "THE CASE", hidden: true },
  { id: "drost", name: "DROST", hidden: true },
  { id: "photograph", name: "THE PHOTOGRAPH" },
  { id: "gala", name: "THE GALA" },
  { id: "stranger", name: "THE STRANGER" },
  { id: "you", name: "YOU" },
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

function wrap(text, n) {
  const out = []; let line = "";
  for (const w of text.split(" ")) { if ((line + " " + w).trim().length > n) { out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line);
  return out;
}

export default {
  mount(root, api) {
    const P = "behind-the-peephole-mosaic-";
    const NS = "http://www.w3.org/2000/svg";
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:#3a2716;display:grid;place-items:center;overflow:hidden;touch-action:none;user-select:none}
    .${P}wrap svg{width:100%;height:100%;display:block}
    .${P}pin{cursor:crosshair}
    .${P}pin:focus{outline:none}
    .${P}pin:focus .${P}card{stroke:#f6cf86;stroke-width:3}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(30,18,8,.82);padding:16px;z-index:3}
    .${P}intro div{max-width:520px;background:#f4ecd6;color:#1c1a17;padding:20px 22px;font:14px/1.5 "Courier New",monospace;box-shadow:4px 6px 0 #0006;transform:rotate(-1deg)}
    .${P}intro h2{margin:0 0 8px;font:700 22px "Courier New",monospace;letter-spacing:.1em}
    .${P}btn{font:700 13px "Courier New",monospace;letter-spacing:.1em;padding:8px 14px;border:2px solid #1c1a17;background:#e0a24a;cursor:pointer;min-height:38px}
    `;
    root.appendChild(st);
    const wrapEl = document.createElement("div");
    wrapEl.className = P + "wrap";
    root.appendChild(wrapEl);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "application");
    svg.setAttribute("aria-label", "Cork board. Drag a thread from one pinned card to another.");
    wrapEl.appendChild(svg);
    const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };

    let spool = 0, lengths = LENGTHS, threads = [], revealed = new Set(), questions = [], over = false, rings = true;
    let drag = null, kbFrom = null, portrait = false, pos = {}, VB = [1200, 900];
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    function computeLayout() {
      const w = wrapEl.clientWidth || 1200, h = wrapEl.clientHeight || 900;
      portrait = w / h < 0.95;
      pos = {};
      const others = OTHERS.filter((o) => !o.hidden || revealed.has(o.id));
      if (!portrait) {
        VB = [1200, 900];
        others.forEach((o, i) => { pos[o.id] = { x: 90 + i * 150, y: 230, w: 130, h: 62 }; });
        GUESTS.forEach((g, i) => { pos[g.id] = { x: 95 + i * 168, y: 420, w: 132, h: 150, guest: true }; });
        pos.spools = { x: 1120, y: 360, dx: 0, dy: 70 };
        pos.rows = { x: 40, y: 790, cols: 4, cw: 278, rh: 40 };
        pos.q = { x: 30, y: 36, cols: 6, cw: 192, rh: 70 };
      } else {
        VB = [800, 1300];
        others.forEach((o, i) => { pos[o.id] = { x: 110 + (i % 4) * 193, y: 220 + Math.floor(i / 4) * 92, w: 170, h: 62 }; });
        GUESTS.forEach((g, i) => { pos[g.id] = { x: 140 + (i % 3) * 260, y: 520 + Math.floor(i / 3) * 330, w: 170, h: 150, guest: true }; });
        pos.spools = { x: 130, y: 420, dx: 180, dy: 0 };
        pos.rows = { x: 30, y: 1150, cols: 2, cw: 375, rh: 36 };
        pos.q = { x: 20, y: 20, cols: 4, cw: 190, rh: 66 };
      }
      svg.setAttribute("viewBox", `0 0 ${VB[0]} ${VB[1]}`);
    }
    const pinPt = (id) => ({ x: pos[id].x, y: pos[id].y - (pos[id].guest ? 72 : 28) });

    function threadPath(a, b, taut) {
      if (taut) return `M${a.x},${a.y} L${b.x},${b.y}`;
      const mx = (a.x + b.x) / 2, my = Math.max(a.y, b.y) + 60 + Math.hypot(b.x - a.x, b.y - a.y) * 0.18;
      return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    }
    function drawThread(g, a, b, type, taut, extra = {}) {
      const t = TYPES.find((x) => x.id === type);
      const d = threadPath(a, b, taut);
      if (t.dbl) {
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": 7, opacity: taut ? 1 : 0.8, ...extra }, g);
        el("path", { d, fill: "none", stroke: "#5a3e22", "stroke-width": 2.2, ...extra }, g);
      } else {
        el("path", { d, fill: "none", stroke: "#0006", "stroke-width": 4, transform: "translate(2 3)", ...extra }, g);
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": 3.2, "stroke-dasharray": t.dash, "stroke-linecap": "round", opacity: taut ? 1 : 0.85, ...extra }, g);
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
      // question cards
      questions.forEach((q, i) => {
        const x = pos.q.x + (i % pos.q.cols) * pos.q.cw, y = pos.q.y + Math.floor(i / pos.q.cols) * pos.q.rh;
        const g = el("g", { transform: `rotate(${(i % 3) - 1} ${x + 90} ${y + 28})` }, svg);
        el("rect", { x, y, width: pos.q.cw - 14, height: 54, fill: "#fbf6e8", stroke: "#c9bc98" }, g);
        wrap(q, 22).slice(0, 2).forEach((l, k) => { const t = el("text", { x: x + 10, y: y + 22 + k * 18, "font-family": "Georgia,serif", "font-style": "italic", "font-size": 15, fill: "#1c1a17" }, g); t.textContent = l; });
        el("circle", { cx: x + (pos.q.cw - 14) / 2, cy: y + 4, r: 6, fill: "#a3302a", stroke: "#3a0f0c" }, g);
      });
      if (!questions.length) {
        const t = el("text", { x: pos.q.x + 10, y: pos.q.y + 30, "font-family": "Courier New,monospace", "font-size": 16, fill: "#3a2716", opacity: 0.75 }, svg);
        t.textContent = "QUESTIONS PIN HERE WHEN A THREAD PULLS TAUT";
      }
      // stamped statement rows
      const rowsHead = el("text", { x: pos.rows.x, y: pos.rows.y - 12, "font-family": "Courier New,monospace", "font-size": 14, "font-weight": 700, fill: "#2a1a0c" }, svg);
      rowsHead.textContent = "STAMPED STATEMENT ROWS";
      ROWS.forEach((r, i) => {
        const x = pos.rows.x + (i % pos.rows.cols) * pos.rows.cw, y = pos.rows.y + Math.floor(i / pos.rows.cols) * pos.rows.rh;
        el("rect", { x, y, width: pos.rows.cw - 12, height: pos.rows.rh - 8, fill: "#efe6cf", stroke: "#b8a77f", transform: `rotate(${(i % 2) ? 0.6 : -0.5} ${x} ${y})` }, svg);
        const t = el("text", { x: x + 8, y: y + 20, "font-family": "Courier New,monospace", "font-size": 13, fill: "#2a3a8c" }, svg);
        t.textContent = r;
      });
      // spools
      TYPES.forEach((t, i) => {
        const x = pos.spools.x + i * pos.spools.dx, y = pos.spools.y + i * pos.spools.dy;
        const g = el("g", { class: P + "spool", "data-spool": i, style: "cursor:pointer", tabindex: 0, role: "button", "aria-label": `Thread: ${t.name}` }, svg);
        if (i === spool) el("rect", { x: x - 52, y: y - 26, width: 104, height: 54, fill: "#f6cf86", opacity: 0.5, rx: 6 }, g);
        el("rect", { x: x - 44, y: y - 18, width: 26, height: 36, fill: "#7a5530", rx: 3 }, g);
        el("rect", { x: x - 42, y: y - 12, width: 22, height: 24, fill: t.col }, g);
        if (t.dash) for (let k = 0; k < 4; k++) el("line", { x1: x - 42, x2: x - 20, y1: y - 9 + k * 6, y2: y - 9 + k * 6, stroke: "#0004", "stroke-dasharray": "3 3" }, g);
        const tx = el("text", { x: x - 12, y: y + 5, "font-family": "Courier New,monospace", "font-size": 14, "font-weight": 700, fill: "#1c1a17" }, g);
        tx.textContent = `${t.key} ${t.name.toUpperCase()}`;
      });
      const lenT = el("text", { x: portrait ? 30 : pos.spools.x - 52, y: portrait ? pos.spools.y + 56 : pos.spools.y - 52, "font-family": "Courier New,monospace", "font-size": 16, "font-weight": 700, fill: "#1c1a17" }, svg);
      lenT.textContent = `LENGTHS: ${lengths}`;
      const ringT = el("text", { x: portrait ? 330 : pos.spools.x - 52, y: portrait ? pos.spools.y + 56 : pos.spools.y + 4 * 70 - 10, "font-family": "Courier New,monospace", "font-size": 13, fill: "#1c1a17", style: "cursor:pointer", "data-act": "rings", tabindex: 0, role: "button" }, svg);
      ringT.textContent = `[${rings ? "x" : " "}] PENCIL RINGS`;
      const doneT = el("text", { x: portrait ? 560 : pos.spools.x - 52, y: portrait ? pos.spools.y + 56 : pos.spools.y + 4 * 70 + 18, "font-family": "Courier New,monospace", "font-size": 13, "font-weight": 700, fill: "#a3302a", style: "cursor:pointer", "data-act": "done", tabindex: 0, role: "button" }, svg);
      doneT.textContent = "[ LEAVE THE BOARD ]";

      // slack threads under the cards, taut ones over
      const under = el("g", {}, svg);
      const cards = el("g", {}, svg);
      const over_ = el("g", {}, svg);
      for (const th of threads) drawThread(th.taut ? over_ : under, pinPt(th.a), pinPt(th.b), th.type, th.taut);

      const unused = new Set();
      if (rings) for (const L of LINKS) {
        if (!pos[L.a] || !pos[L.b]) continue;
        if (threads.some((t) => t.taut && pairKey(t.a, t.b) === pairKey(L.a, L.b))) continue;
        unused.add(L.a); unused.add(L.b);
      }
      const all = [...OTHERS.filter((o) => pos[o.id]), ...GUESTS];
      all.forEach((o, i) => {
        const p = pos[o.id];
        const g = el("g", { class: P + "pin", "data-pin": o.id, tabindex: 0, role: "button", "aria-label": `Pin: ${o.guest || p.guest ? "Room " + o.name : o.name}`, transform: `rotate(${((i * 37) % 7) - 3} ${p.x} ${p.y})` }, cards);
        if (p.guest) {
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: p.y - 70, width: p.w, height: p.h, fill: "#f4f1ea", stroke: "#cfc6b0" }, g);
          el("rect", { x: p.x - p.w / 2 + 9, y: p.y - 60, width: p.w - 18, height: p.h - 48, fill: "#2b3540" }, g);
          el("circle", { cx: p.x, cy: p.y - 18, r: 17, fill: "#14181c" }, g);
          el("path", { d: `M${p.x - 38},${p.y + 32} Q${p.x - 34},${p.y + 2} ${p.x},${p.y} Q${p.x + 34},${p.y + 2} ${p.x + 38},${p.y + 32}Z`, fill: "#14181c" }, g);
          const t = el("text", { x: p.x, y: p.y + 68, "text-anchor": "middle", "font-family": "Georgia,serif", "font-weight": 700, "font-size": 24, fill: "#1c1a17" }, g);
          t.textContent = o.name;
          // the clue cards caught for this guest, typed on a slip under the photo
          const lines = o.clues.flatMap((c) => wrap(c, portrait ? 26 : 21).map((l, k) => (k ? "  " : "· ") + l));
          const sh = 10 + lines.length * 13;
          el("rect", { x: p.x - p.w / 2 - 6, y: p.y + 86, width: p.w + 12, height: sh, fill: "#fbf6e8", stroke: "#c9bc98" }, g);
          lines.forEach((l, k) => { const tt = el("text", { x: p.x - p.w / 2, y: p.y + 99 + k * 13, "font-family": "Courier New,monospace", "font-size": portrait ? 11.5 : 10, fill: "#2a3a8c" }, g); tt.textContent = l; });
        } else {
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, fill: "#efe6cf", stroke: "#b8a77f" }, g);
          el("line", { x1: p.x - p.w / 2, x2: p.x + p.w / 2, y1: p.y - p.h / 2 + 18, y2: p.y - p.h / 2 + 18, stroke: "#a3302a", opacity: 0.5 }, g);
          const lines = wrap(o.name, 14);
          lines.forEach((l, k) => { const t = el("text", { x: p.x, y: p.y + 12 + (k - (lines.length - 1) / 2) * 16, "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": 15, fill: "#1c1a17" }, g); t.textContent = l; });
        }
        const pp = pinPt(o.id);
        if (unused.has(o.id)) el("circle", { cx: pp.x, cy: pp.y, r: 17, fill: "none", stroke: "#3a3a3a", "stroke-width": 1.2, "stroke-dasharray": "4 3", opacity: 0.8 }, g);
        const sel = (drag && drag.from === o.id) || kbFrom === o.id;
        el("circle", { cx: pp.x + 1.5, cy: pp.y + 2.5, r: 8, fill: "#0005" }, g);
        el("circle", { cx: pp.x, cy: pp.y, r: sel ? 10 : 8, fill: sel ? "#f6cf86" : "#b8913f", stroke: "#3b2a0e", "stroke-width": 1.5 }, g);
      });
      for (const th of threads) if (th.taut) drawThread(over_, pinPt(th.a), pinPt(th.b), th.type, true, { "pointer-events": "none" });
      if (drag && drag.pt) {
        const a = pinPt(drag.from);
        el("line", { x1: a.x, y1: a.y, x2: drag.pt.x, y2: drag.pt.y, stroke: TYPES[spool].col, "stroke-width": 3, "stroke-dasharray": TYPES[spool].dash || "none", "pointer-events": "none" }, svg);
      }
      if (msg) {
        const w = Math.min(VB[0] - 40, msg.length * 9.2 + 30);
        el("rect", { x: VB[0] / 2 - w / 2, y: VB[1] - 48, width: w, height: 30, fill: "#1c1a17", opacity: 0.85 }, svg);
        const t = el("text", { x: VB[0] / 2, y: VB[1] - 28, "text-anchor": "middle", "font-family": "Courier New,monospace", "font-size": 15, fill: "#f6cf86" }, svg);
        t.textContent = msg;
      }
    }

    let msg = "";
    function say(m) { msg = m; render(); }

    function link(a, b) {
      if (over || a === b) return;
      if (lengths <= 0) return;
      if (threads.some((t) => pairKey(t.a, t.b) === pairKey(a, b))) { say("A thread already runs between those two."); return; }
      const type = TYPES[spool].id;
      const L = LINKS.find((l) => pairKey(l.a, l.b) === pairKey(a, b) && l.type === type);
      lengths--;
      threads.push({ a, b, type, taut: !!L });
      if (L) {
        questions.push(L.q);
        if (L.adds) revealed.add(L.adds);
        say(`Taut. A question pins to the top: “${L.q}”${L.adds ? " A new card goes up." : ""}`);
      } else say("The thread hangs slack. One length gone.");
      if (lengths <= 0) finish();
    }
    function finish() {
      if (over) return;
      over = true;
      const taut = threads.filter((t) => t.taut).length;
      api.store.set("best", Math.max(api.store.get("best", 0), taut));
      timers.push(setTimeout(() => api.end({
        outcome: taut >= 5 ? "win" : taut >= 3 ? "done" : "lose",
        text: `${taut} of ${threads.length} threads pulled taut; ${questions.length} question${questions.length === 1 ? "" : "s"} pinned for tonight. ` +
          (taut >= 5 ? "Their stories overlap. You can see it on the cork now." : taut >= 3 ? "Some of it holds. The rest hangs slack until another night's evidence." : "Mostly slack thread. You will have to watch more closely."),
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
        const top = p.guest ? p.y - 92 : p.y - p.h / 2 - 18, bot = p.guest ? p.y + 80 : p.y + p.h / 2 + 4;
        if (pt.x >= p.x - p.w / 2 - 6 && pt.x <= p.x + p.w / 2 + 6 && pt.y >= top && pt.y <= bot) {
          const d = Math.hypot(pt.x - p.x, pt.y - p.y); if (d < bd) { bd = d; best = id; }
        }
      }
      return best;
    }
    on(svg, "pointerdown", (e) => {
      if (over) return;
      const s = e.target.closest("[data-spool]");
      if (s) { spool = +s.dataset.spool; render(); return; }
      const a = e.target.closest("[data-act]");
      if (a) { if (a.dataset.act === "rings") { rings = !rings; render(); } else finish(); return; }
      const id = pinAt(svgPt(e));
      if (!id) return;
      if (kbFrom && kbFrom !== id) { const f = kbFrom; kbFrom = null; link(f, id); return; }
      drag = { from: id, pt: null, moved: false };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      render();
    });
    on(svg, "pointermove", (e) => { if (!drag) return; drag.pt = svgPt(e); drag.moved = true; render(); });
    on(svg, "pointerup", (e) => {
      if (!drag) return;
      const from = drag.from, moved = drag.moved;
      drag = null;
      const id = pinAt(svgPt(e));
      if (id && id !== from) { link(from, id); return; }
      if (!moved) { kbFrom = from; say("Thread tied on. Tap the card it runs to."); return; }
      render();
    });
    on(svg, "keydown", (e) => {
      if (over) return;
      const g = e.target.closest && e.target.closest("[data-pin],[data-spool],[data-act]");
      if ((e.key === "Enter" || e.key === " ") && g) {
        e.preventDefault();
        if (g.dataset.spool != null) { spool = +g.dataset.spool; render(); return; }
        if (g.dataset.act) { if (g.dataset.act === "rings") { rings = !rings; render(); } else finish(); return; }
        const id = g.dataset.pin;
        if (!kbFrom) { kbFrom = id; say("Thread tied on. Tab to the card it runs to and press Enter."); }
        else if (kbFrom === id) { kbFrom = null; say(""); }
        else { const f = kbFrom; kbFrom = null; link(f, id); }
        const again = svg.querySelector(`[data-pin="${id}"]`); if (again) again.focus();
      }
    });
    on(window, "keydown", (e) => {
      if (over || wrapEl.querySelector("." + P + "intro")) return;
      if (/^[1-4]$/.test(e.key)) { spool = +e.key - 1; render(); }
      if (e.key === "Escape") { kbFrom = null; drag = null; say(""); }
    });
    const ro = new ResizeObserver(() => render());
    ro.observe(wrapEl);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>THE MOSAIC · NIGHT 3</h2><p>Pick a spool: <b style="color:#b8322a">met</b>, <b style="color:#2f5fb0">works for</b>, <b style="color:#a8862a">family</b>, <b>after</b>. Drag a thread from one pinned card to another (or tap one, then the other). Each thread costs one of ${LENGTHS} lengths.</p><p>A true link pulls taut and pins a question. A wrong one hangs slack. Read the clue slips under each guest.</p><button type="button" class="${P}btn">START</button></div>`;
    wrapEl.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => intro.remove());
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

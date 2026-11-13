// WrymWretch · Star Chart (1D, Gilded star atlas). DESIGN.md section 11, Star Chart.
// One page: s_chart_priory. Three constellations (the Stag, the Gale Harp, the First Light), their
// stars and fragments from data/star_chart.json. Drag star to star to lay a line (again to lift
// it); Name it checks every fragment and the line count. A wrong attempt dims one fragment for
// 10 s; after three on one constellation the strongest fragment is underlined. Seraphyne's Glimpse
// ghosts one correct line for 3 s, once. When all three are named, the lines move on their own
// into the Sigil of Izladar. The prototype adds a loss: six wrong attempts and dawn takes the sky.
// Quoted on the win, verbatim as DESIGN.md section 3 quotes it:
//   "The Sigil of Izladar." creative-writing/vault/02_Novels/02_WrymWretch.md, line 87 (WW 87)

const LAPIS = "#1d2f6e", DEEP = "#070c24", GOLD = "#e3b74a", GOLDHI = "#fff2b0", PAPER = "#efe2c4", INKBROWN = "#3b2a14";

const CONST = [
  { id: "stag", name: "The Stag",
    stars: [["st1", 30, 40, 1], ["st2", 26, 48, 3], ["st3", 22, 55, 3], ["st4", 17, 63, 3], ["st5", 12, 70, 3], ["st6", 35, 33, 3], ["st7", 42, 26, 3]],
    lines: [["st1", "st2"], ["st2", "st3"], ["st3", "st4"], ["st4", "st5"], ["st1", "st6"], ["st6", "st7"]],
    fragments: ["The Stag's antlers are five stars climbing to the left", "From the root of the antlers, two stars run down and to the right"] },
  { id: "gale_harp", name: "The Gale Harp",
    stars: [["gh1", 50, 85, 1], ["gh2", 60.2, 80.1, 3], ["gh3", 62.7, 69.1, 3], ["gh4", 55.6, 60.3, 3], ["gh5", 44.4, 60.3, 3], ["gh6", 37.3, 69.1, 3], ["gh7", 39.8, 80.1, 3]],
    lines: [["gh1", "gh2"], ["gh2", "gh3"], ["gh3", "gh4"], ["gh4", "gh5"], ["gh5", "gh6"], ["gh6", "gh7"], ["gh7", "gh1"]],
    fragments: ["No line of the Harp crosses another", "The Harp is one frame: every star of it holds two lines", "Seven strings, no more"] },
  { id: "first_light", name: "The First Light",
    stars: [["fl1", 78, 40, 1], ["fl2", 72, 48, 3], ["fl3", 84, 48, 3], ["fl4", 70, 33, 3], ["fl5", 86, 33, 3], ["fl6", 78, 53, 3]],
    lines: [["fl1", "fl2"], ["fl1", "fl3"], ["fl1", "fl4"], ["fl1", "fl5"], ["fl1", "fl6"]],
    fragments: ["The First Light's brightest star touches all the others", "Nothing joins the outer lights to one another"] },
];
const DIM = [["dim1", 74, 26.2, 4], ["dim2", 24.9, 65.2, 4], ["dim3", 62.9, 25.7, 4], ["dim4", 10, 83.4, 4], ["dim5", 7.9, 41, 4], ["dim6", 28.4, 10.2, 4]];
const SIGIL = [["st5", "gh6"], ["gh6", "gh3"], ["gh3", "fl6"], ["fl6", "fl1"], ["fl1", "st7"], ["st7", "st5"], ["gh1", "st1"]];
const DAWN = 6;

const CSS = `
.wrymwretch-star-chart-root{position:absolute;inset:0;display:flex;background:radial-gradient(ellipse at 40% 45%,${LAPIS} 0%,#16255a 55%,${DEEP} 100%);color:${GOLD};font-family:'Cormorant Garamond',Georgia,serif;overflow:auto}
.wrymwretch-star-chart-page{flex:1;display:flex;gap:14px;padding:12px;min-height:100%;box-sizing:border-box;border:3px double ${GOLD};margin:8px;border-radius:2px}
.wrymwretch-star-chart-field{flex:2 1 0;min-width:0;display:flex;flex-direction:column}
.wrymwretch-star-chart-name{font:700 clamp(22px,4vw,40px) 'Cinzel',Georgia,serif;letter-spacing:.32em;margin:4px 6px 6px;white-space:nowrap;overflow:hidden}
.wrymwretch-star-chart-name span{color:rgba(227,183,74,.28);transition:color .6s}
.wrymwretch-star-chart-name span.lit{color:${GOLD};text-shadow:0 0 10px rgba(255,242,176,.45)}
.wrymwretch-star-chart-field svg{flex:1;width:100%;min-height:260px;touch-action:none;display:block}
.wrymwretch-star-chart-star{cursor:pointer;outline:none}
.wrymwretch-star-chart-star:focus-visible .wrymwretch-star-chart-ring{stroke:${GOLDHI};stroke-width:.5}
.wrymwretch-star-chart-side{flex:1 1 0;min-width:230px;max-width:380px;display:flex;flex-direction:column;gap:12px;padding-top:6px}
.wrymwretch-star-chart-strip{background:${PAPER};color:${INKBROWN};font-style:italic;font-size:17px;line-height:1.3;padding:14px 16px 16px;clip-path:polygon(0 6%,4% 0,12% 5%,22% 1%,35% 6%,48% 0,61% 4%,73% 0,86% 5%,100% 1%,98% 52%,100% 96%,88% 100%,76% 95%,62% 100%,49% 94%,35% 100%,22% 95%,9% 100%,0 94%,2% 48%);transition:opacity .4s,filter .4s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.wrymwretch-star-chart-strip.dim{opacity:.33;filter:grayscale(1)}
.wrymwretch-star-chart-strip.strong{text-decoration:underline;text-decoration-color:#a42a1c;text-underline-offset:3px}
.wrymwretch-star-chart-note{font-size:14px;color:rgba(227,183,74,.8);min-height:1.3em}
.wrymwretch-star-chart-row{display:flex;flex-wrap:wrap;gap:8px}
.wrymwretch-star-chart-btn{font:700 14px 'Cinzel',Georgia,serif;letter-spacing:.14em;color:${GOLD};background:rgba(7,12,36,.5);border:1.5px solid ${GOLD};padding:9px 14px;cursor:pointer;min-height:42px}
.wrymwretch-star-chart-btn:hover:not(:disabled){background:rgba(227,183,74,.18)}
.wrymwretch-star-chart-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-star-chart-dawn{font-size:13px;letter-spacing:.12em;text-transform:uppercase}
.wrymwretch-star-chart-dawn b{display:inline-block;margin-left:3px;color:${GOLD}}
.wrymwretch-star-chart-dawn b.out{color:rgba(227,183,74,.2)}
.wrymwretch-star-chart-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(7,12,36,.72);padding:16px;z-index:3}
.wrymwretch-star-chart-card{max-width:440px;background:${PAPER};color:${INKBROWN};padding:20px 22px;font-size:17px;line-height:1.4;border:3px double #a87618}
.wrymwretch-star-chart-card h2{font:700 22px 'Cinzel',Georgia,serif;letter-spacing:.12em;margin:0 0 8px}
.wrymwretch-star-chart-card p{margin:0 0 10px}
.wrymwretch-star-chart-card button{font:700 15px 'Cinzel',Georgia,serif;letter-spacing:.12em;padding:9px 22px;background:${LAPIS};color:${GOLD};border:1.5px solid #a87618;cursor:pointer}
@media (max-width:720px){.wrymwretch-star-chart-page{flex-direction:column}.wrymwretch-star-chart-side{max-width:none}.wrymwretch-star-chart-field svg{min-height:300px}}
`;

const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-star-chart-root";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="wrymwretch-star-chart-page">
        <div class="wrymwretch-star-chart-field"><div class="wrymwretch-star-chart-name" aria-live="polite"></div>
          <svg viewBox="-2 -2 104 104" preserveAspectRatio="xMidYMid meet" role="application" aria-label="Star field"></svg></div>
        <div class="wrymwretch-star-chart-side">
          <div data-frags style="display:flex;flex-direction:column;gap:12px"></div>
          <div class="wrymwretch-star-chart-note" aria-live="polite"></div>
          <div class="wrymwretch-star-chart-row">
            <button type="button" class="wrymwretch-star-chart-btn" data-name>Name it</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-glimpse>Glimpse</button>
            <button type="button" class="wrymwretch-star-chart-btn" data-clear>Clear</button>
          </div>
          <div class="wrymwretch-star-chart-dawn"></div>
        </div>
      </div>
      <div class="wrymwretch-star-chart-intro"><div class="wrymwretch-star-chart-card">
        <h2>Star Chart · the Priory</h2>
        <p>The sky has lost three constellations. Drag from star to star to lay a line (or tap one star, then another); do it again to lift it.</p>
        <p>When every fragment on the torn strips holds, press <b>Name it</b>. Six wrong namings and dawn takes the sky.</p>
        <button type="button" data-start>Start</button></div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg"), nameEl = wrap.querySelector(".wrymwretch-star-chart-name");
    const fragsEl = wrap.querySelector("[data-frags]"), noteEl = wrap.querySelector(".wrymwretch-star-chart-note");
    const dawnEl = wrap.querySelector(".wrymwretch-star-chart-dawn");
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    const stars = {};
    CONST.forEach((c) => c.stars.forEach(([id, x, y, m]) => (stars[id] = { id, x, y: 100 - y, m, c: c.id })));
    DIM.forEach(([id, x, y, m]) => (stars[id] = { id, x, y: 100 - y, m, c: null }));

    const st = { ci: 0, lines: new Set(), solved: new Set(), wrong: 0, wrongHere: 0, glimpse: true, sel: null, over: false, dim: new Map() };

    // ---- the page: lapis, gold dust, graticule ------------------------------------------------
    const defs = mk("defs", {}, svg);
    defs.innerHTML = `<radialGradient id="wwsc-glow"><stop offset="0" stop-color="${GOLDHI}" stop-opacity=".9"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
      <linearGradient id="wwsc-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".35" stop-color="#e3b74a"/><stop offset=".6" stop-color="#a87618"/><stop offset="1" stop-color="#f3d27a"/></linearGradient>`;
    mk("clipPath", { id: "wwsc-clip" }, defs).innerHTML = '<rect x="-1.5" y="-1.5" width="103" height="103"/>';
    const base = mk("g", { "clip-path": "url(#wwsc-clip)" }, svg);
    const r = api.rng(85);
    for (let i = 0; i < 260; i++) mk("circle", { cx: (r() * 104 - 2).toFixed(2), cy: (r() * 104 - 2).toFixed(2), r: (0.08 + r() * 0.22).toFixed(2), fill: GOLD, opacity: (0.2 + r() * 0.5).toFixed(2) }, base);
    for (let k = 0; k < 4; k++) mk("circle", { cx: 30, cy: 150, r: 70 + k * 18, fill: "none", stroke: GOLD, "stroke-width": 0.15, opacity: 0.45 }, base);
    for (let k = 0; k < 7; k++) mk("line", { x1: 30, y1: 150, x2: -20 + k * 24, y2: -2, stroke: GOLD, "stroke-width": 0.12, opacity: 0.35 }, base);
    mk("rect", { x: -1.5, y: -1.5, width: 103, height: 103, fill: "none", stroke: GOLD, "stroke-width": 0.4 }, base);
    const gLines = mk("g", {}, svg), gGhost = mk("g", {}, svg), gTemp = mk("g", {}, svg), gStars = mk("g", {}, svg);
    const temp = mk("line", { stroke: GOLDHI, "stroke-width": 0.35, "stroke-dasharray": "1 1", opacity: 0 }, gTemp);

    for (const s of Object.values(stars)) {
      const g = mk("g", { class: "wrymwretch-star-chart-star", tabindex: 0, role: "button", "aria-label": `star ${s.id}`, "data-id": s.id }, gStars);
      const rad = s.m === 1 ? 1.25 : s.m === 3 ? 0.85 : 0.6;
      mk("circle", { cx: s.x, cy: s.y, r: 3.4, fill: "transparent" }, g);
      mk("circle", { cx: s.x, cy: s.y, r: rad * 2.6, fill: "url(#wwsc-glow)" }, g);
      s.ring = mk("circle", { class: "wrymwretch-star-chart-ring", cx: s.x, cy: s.y, r: rad + 0.9, fill: "none", stroke: "transparent", "stroke-width": 0.3 }, g);
      mk("path", { d: `M${s.x},${s.y - rad * 1.8} L${s.x + rad * 0.4},${s.y - rad * 0.4} L${s.x + rad * 1.8},${s.y} L${s.x + rad * 0.4},${s.y + rad * 0.4} L${s.x},${s.y + rad * 1.8} L${s.x - rad * 0.4},${s.y + rad * 0.4} L${s.x - rad * 1.8},${s.y} L${s.x - rad * 0.4},${s.y - rad * 0.4}Z`, fill: GOLDHI }, g);
      s.el = g;
    }

    // ---- state rendering ----------------------------------------------------------------------
    const cur = () => CONST[st.ci];
    const solKeys = (c) => new Set(c.lines.map(([a, b]) => key(a, b)));
    function drawLines() {
      gLines.innerHTML = "";
      const sol = st.ci < CONST.length ? solKeys(cur()) : new Set();
      for (const k of st.solved) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: "url(#wwsc-leaf)", "stroke-width": 0.9, "stroke-linecap": "round" }, gLines); }
      for (const k of st.lines) { const [a, b] = k.split("|"); mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: GOLDHI, "stroke-width": 0.4, "stroke-dasharray": sol.has(k) ? "none" : "none", opacity: 0.85 }, gLines); }
      Object.values(stars).forEach((s) => s.ring.setAttribute("stroke", st.sel === s.id ? GOLDHI : "transparent"));
      // the name fills in as correct lines are laid
      if (st.ci < CONST.length) {
        let good = 0; for (const k of st.lines) if (sol.has(k)) good++;
        const bad = st.lines.size - good;
        const ratio = Math.max(0, (good - bad) / sol.size);
        const name = cur().name.toUpperCase();
        const n = Math.round(ratio * name.replace(/ /g, "").length);
        let i = 0;
        nameEl.innerHTML = "";
        for (const ch of name) { const sp = document.createElement("span"); sp.textContent = ch; if (ch !== " ") { if (i < n) sp.className = "lit"; i++; } nameEl.appendChild(sp); }
      }
    }
    function drawFrags() {
      fragsEl.innerHTML = "";
      if (st.ci >= CONST.length) return;
      cur().fragments.forEach((t, i) => {
        const d = document.createElement("div");
        d.className = "wrymwretch-star-chart-strip" + (st.dim.has(i) ? " dim" : "") + (st.wrongHere >= 3 && i === 0 ? " strong" : "");
        d.textContent = t;
        fragsEl.appendChild(d);
      });
    }
    function drawDawn() {
      dawnEl.innerHTML = "Before dawn " + Array.from({ length: DAWN }, (_, i) => `<b class="${i < st.wrong ? "out" : ""}">✦</b>`).join("");
      wrap.querySelector("[data-glimpse]").disabled = !st.glimpse || st.over;
    }
    const all = () => { drawLines(); drawFrags(); drawDawn(); };

    function toggle(a, b) {
      if (a === b || st.over) return;
      const k = key(a, b);
      if (st.solved.has(k)) return;
      st.lines.has(k) ? st.lines.delete(k) : st.lines.add(k);
      drawLines();
    }
    function nameIt() {
      if (st.over || st.ci >= CONST.length) return;
      const sol = solKeys(cur());
      const ok = st.lines.size === sol.size && [...st.lines].every((k) => sol.has(k));
      if (ok) {
        st.lines.forEach((k) => st.solved.add(k)); st.lines.clear();
        noteEl.textContent = `${cur().name} is gilded and recorded.`;
        st.ci++; st.wrongHere = 0; st.dim.clear(); st.sel = null;
        if (st.ci >= CONST.length) return sigil();
        all();
        return;
      }
      st.wrong++; st.wrongHere++;
      const frs = cur().fragments; const i = Math.floor(api.rng()() * frs.length);
      st.dim.set(i, true); later(() => { st.dim.delete(i); drawFrags(); }, 10000);
      noteEl.textContent = st.lines.size !== sol.size ? `Not yet: the sky does not hold it. (${st.lines.size} line${st.lines.size === 1 ? "" : "s"} laid.)` : "Not yet: a fragment does not hold.";
      if (st.wrong >= DAWN) {
        st.over = true; all();
        later(() => api.end({ outcome: "lose", text: `Dawn comes up over the Priory. ${st.solved.size ? CONST.slice(0, st.ci).map((c) => c.name).join(" and ") + " kept; the rest" : "The three constellations"} fade with the night.` }), 600);
        return;
      }
      all();
    }
    function glimpse() {
      if (!st.glimpse || st.over || st.ci >= CONST.length) return;
      const miss = cur().lines.map(([a, b]) => key(a, b)).find((k) => !st.lines.has(k));
      if (!miss) return;
      st.glimpse = false; drawDawn();
      const [a, b] = miss.split("|");
      const l = mk("line", { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y, stroke: GOLDHI, "stroke-width": 0.8, opacity: 0.55, "stroke-dasharray": "0.6 0.8" }, gGhost);
      noteEl.textContent = "Seraphyne's Glimpse: one true line, for three seconds.";
      later(() => l.remove(), 3000);
    }
    // the scripted end: the named lines move on their own into the Sigil
    function sigil() {
      st.over = true; nameEl.innerHTML = ""; fragsEl.innerHTML = "";
      const title = "THE SIGIL OF IZLADAR";
      [...title].forEach((ch) => { const sp = document.createElement("span"); sp.textContent = ch; sp.className = "lit"; nameEl.appendChild(sp); });
      noteEl.textContent = "All three are named. Then the lines move on their own.";
      drawDawn();
      const old = [...gLines.children];
      SIGIL.forEach(([a, b], i) => {
        const src = old[i % old.length];
        const l = mk("line", { x1: src.getAttribute("x1"), y1: src.getAttribute("y1"), x2: src.getAttribute("x2"), y2: src.getAttribute("y2"), stroke: "#d6dbe8", "stroke-width": 0.7, "stroke-linecap": "round" }, gGhost);
        const to = { x1: stars[a].x, y1: stars[a].y, x2: stars[b].x, y2: stars[b].y };
        if (api.reducedMotion) { for (const k in to) l.setAttribute(k, to[k]); return; }
        l.style.transition = "all 2.2s ease-in-out";
        later(() => { for (const k in to) l.setAttribute(k, to[k]); }, 300 + i * 120);
      });
      later(() => old.forEach((o) => o.setAttribute("opacity", "0.25")), 300);
      later(() => api.end({ outcome: "win", text: `Three constellations gilded and recorded, ${st.wrong} wrong naming${st.wrong === 1 ? "" : "s"}. The lines gather into “The Sigil of Izladar.”` }), api.reducedMotion ? 800 : 3600);
    }

    // ---- input --------------------------------------------------------------------------------
    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; };
    const nearest = (p) => { let best = null, bd = 4; for (const s of Object.values(stars)) { const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; best = s.id; } } return best; };
    let drag = null;
    const down = (e) => {
      if (st.over) return;
      const id = nearest(pt(e)); if (!id) return;
      e.preventDefault();
      drag = { from: id, moved: false };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!drag) return;
      const p = pt(e), s = stars[drag.from];
      if (Math.hypot(p.x - s.x, p.y - s.y) > 2.5) drag.moved = true;
      temp.setAttribute("x1", s.x); temp.setAttribute("y1", s.y); temp.setAttribute("x2", p.x); temp.setAttribute("y2", p.y);
      temp.setAttribute("opacity", drag.moved ? 1 : 0);
    };
    const up = (e) => {
      if (!drag) return;
      temp.setAttribute("opacity", 0);
      const id = nearest(pt(e));
      if (drag.moved) { if (id && id !== drag.from) toggle(drag.from, id); st.sel = null; }
      else if (st.sel && st.sel !== drag.from) { toggle(st.sel, drag.from); st.sel = null; }
      else st.sel = st.sel === drag.from ? null : drag.from;
      drag = null; drawLines();
    };
    svg.addEventListener("pointerdown", down); svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", () => { drag = null; temp.setAttribute("opacity", 0); });
    const kd = (e) => {
      const g = e.target.closest && e.target.closest(".wrymwretch-star-chart-star");
      if (!g || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      const id = g.dataset.id;
      if (st.sel && st.sel !== id) { toggle(st.sel, id); st.sel = null; } else st.sel = st.sel === id ? null : id;
      drawLines();
    };
    svg.addEventListener("keydown", kd);
    wrap.querySelector("[data-name]").addEventListener("click", nameIt);
    wrap.querySelector("[data-glimpse]").addEventListener("click", glimpse);
    wrap.querySelector("[data-clear]").addEventListener("click", () => { if (st.over) return; st.lines.clear(); st.sel = null; drawLines(); });
    const intro = wrap.querySelector(".wrymwretch-star-chart-intro");
    const sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => { intro.remove(); noteEl.textContent = "Begin with the Stag."; });
    sb.focus();
    all();

    return { unmount() { st.over = true; timers.forEach(clearTimeout); timers.clear(); wrap.remove(); } };
  },
};

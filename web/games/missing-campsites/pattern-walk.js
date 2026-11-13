// Missing Campsites / The pattern walk (2D, op-art geometric).
//
// DESIGN.md section 10, mode B, cut to pattern_walk_1: glyphs 19 down to 12, eight junctions, on
// the other side. Every lost site stands rebuilt in trees: a ringed tree for the post, four for the
// table's corners, a circle for the fire ring, a square for the tent pad with a tree inside for
// each person who slept there. At each junction two to four glyphs are in view; one is the next
// site. Tam's Sites page shows the row for that site; a written detail is carried in the true
// glyph's trees. A blank row is a guess. Stepping onto a wrong glyph: the screen goes white, Tam
// stands on the last true glyph, drift +1. Reaching glyph 12 ends the walk; with drift 4 or more
// the car is already at the booth window (DESIGN says 6 over the full walk; this half uses 4).
// Cut: the free walk between junctions is a chosen step; Marisol and pattern_key are left out.

const NS = "http://www.w3.org/2000/svg";
const INK = "#111", PEARL = "#ecebe6", GREEN = "#2e6a5c", DEEP = "#0f3a33";

// Tam's Sites page for 19 to 12. Row 17 is DESIGN.md's own example; the rest are this prototype's.
const ROWS = [
  { n: 19, text: "two of them, a hammock slung between two trees", want: { persons: 2, hammock: true } },
  { n: 18, text: "table down by the creek side, three people", want: { persons: 3, table: -1 } },
  { n: 17, text: "bike, onions, a tent pitched crooked", want: { wheel: true, crooked: true } },
  { n: 16, text: "the tall cedar", want: { cedar: true } },
  { n: 15, text: "", want: {} },
  { n: 14, text: "fire ring built double, one person", want: { double: true, persons: 1 } },
  { n: 13, text: "", want: {} },
  { n: 12, text: "the creek bend; four slept here", want: { persons: 4 } },
];
const COUNTS = [3, 2, 3, 3, 3, 4, 3, 4];
const DRIFT_LOSE = 4;

const CSS = `
.missing-campsites-pattern-walk-wrap{position:absolute;inset:0;background:${PEARL};color:${INK};display:flex;font-family:'IBM Plex Mono',ui-monospace,monospace;overflow:hidden}
.missing-campsites-pattern-walk-field{flex:1;min-width:0;position:relative}
.missing-campsites-pattern-walk-field svg{position:absolute;inset:0;width:100%;height:100%}
.missing-campsites-pattern-walk-side{width:min(260px,32vw);border-left:2px solid ${INK};background:#f7f3e8;padding:12px;box-sizing:border-box;overflow:auto}
.missing-campsites-pattern-walk-side h3{margin:0 0 8px;font-size:13px;letter-spacing:.18em}
.missing-campsites-pattern-walk-row{font-family:Caveat,'Segoe Print',cursive;font-size:19px;line-height:1.1;padding:5px 4px;border-bottom:1px solid #9bb4ad;color:#555}
.missing-campsites-pattern-walk-row b{font-family:'IBM Plex Mono',monospace;font-size:12px;margin-right:6px;color:${INK}}
.missing-campsites-pattern-walk-row.now{background:#fff;outline:2px solid ${INK};color:${INK}}
.missing-campsites-pattern-walk-row.done{text-decoration:line-through;opacity:.5}
.missing-campsites-pattern-walk-row i{color:#999}
.missing-campsites-pattern-walk-drift{margin-top:10px;font-size:13px;letter-spacing:.1em}
.missing-campsites-pattern-walk-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .12s}
.missing-campsites-pattern-walk-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(236,235,230,.9);z-index:4;padding:16px}
.missing-campsites-pattern-walk-intro div{max-width:460px;border:3px solid ${INK};background:#fff;padding:20px 22px}
.missing-campsites-pattern-walk-intro h2{margin:0 0 8px;font:700 24px 'Zilla Slab',Georgia,serif}
.missing-campsites-pattern-walk-intro p{margin:0 0 8px;font-size:13px;line-height:1.5}
.missing-campsites-pattern-walk-intro button{font:600 14px 'IBM Plex Mono',monospace;background:${INK};color:${PEARL};border:0;padding:10px 20px;cursor:pointer;margin-top:6px}
.missing-campsites-pattern-walk-wrap g[role=button]{cursor:pointer;outline:none}
.missing-campsites-pattern-walk-wrap g[role=button]:focus .ring,.missing-campsites-pattern-walk-wrap g[role=button]:hover .ring{stroke:${INK};stroke-width:4}
@media (max-width:640px){.missing-campsites-pattern-walk-wrap{flex-direction:column}.missing-campsites-pattern-walk-side{width:auto;border-left:0;border-top:2px solid ${INK};order:2;padding:8px 12px}.missing-campsites-pattern-walk-side h3{display:none}.missing-campsites-pattern-walk-row:not(.now){display:none}.missing-campsites-pattern-walk-drift{margin-top:4px}}
`;

export default {
  mount(root, api) {
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = "missing-campsites-pattern-walk-wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="missing-campsites-pattern-walk-field"><svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" aria-label="Glyphs of trees"></svg><div class="missing-campsites-pattern-walk-flash"></div></div>
      <div class="missing-campsites-pattern-walk-side"><h3>SITES</h3><div class="rows"></div><div class="missing-campsites-pattern-walk-drift">DRIFT 0</div></div>
      <div class="missing-campsites-pattern-walk-intro"><div><h2>The pattern walk</h2>
        <p>The other side. Every lost site stands rebuilt in trees, in order, 19 down to 12. At each junction one glyph is the next site; the others are built the same with different details.</p>
        <p>Your Sites page shows the row you wrote for it. Find that detail in the trees and step there (click, tap, or 1–4). A wrong step and the ground forgets it: drift +1. Reach 12 with drift under ${DRIFT_LOSE}.</p>
        <button type="button">Start</button></div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg");
    const flash = wrap.querySelector(".missing-campsites-pattern-walk-flash");
    const rowsEl = wrap.querySelector(".rows");
    const driftEl = wrap.querySelector(".missing-campsites-pattern-walk-drift");
    const timers = [];
    let raf = 0, j = 0, drift = 0, busy = true, over = false, cands = [], focusIdx = 0;

    const el = (tag, a = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };

    // The op-art ground: exactly spaced dots whose size breathes in rows.
    const defs = el("defs");
    const pat = el("pattern", { id: "mc-pw-dots", width: 22, height: 22, patternUnits: "userSpaceOnUse" }, defs);
    el("circle", { cx: 11, cy: 11, r: 3.2, fill: "#b9b8b2" }, pat);
    el("rect", { width: 1000, height: 1100, fill: "url(#mc-pw-dots)" });
    for (let y = 11; y < 1100; y += 44) for (let x = 11; x < 1000; x += 44) el("circle", { cx: x, cy: y, r: 1.4 + 1.2 * Math.abs(Math.sin(x / 140 + y / 90)), fill: "#9d9c96" });
    const layer = el("g");

    ROWS.forEach((r) => {
      const d = document.createElement("div");
      d.className = "missing-campsites-pattern-walk-row";
      d.innerHTML = `<b>${r.n}</b>`;
      if (r.text) d.appendChild(document.createTextNode(r.text));
      else { const i = document.createElement("i"); i.textContent = "(unwritten)"; d.appendChild(i); }
      rowsEl.appendChild(d);
    });

    function baseSpec() {
      return { persons: 1 + Math.floor(rng() * 4), hammock: false, table: rng() < 0.5 ? -1 : 1, wheel: false, crooked: false, cedar: false, double: false };
    }
    function trueSpec(row) { const s = baseSpec(); return Object.assign(s, row.want); }
    function decoyFrom(t, row, k) {
      const s = { ...t };
      const keys = Object.keys(row.want);
      const flip = (key) => {
        if (key === "persons") { let v; do v = 1 + Math.floor(rng() * 4); while (v === t.persons); s.persons = v; }
        else if (key === "table") s.table = -t.table;
        else s[key] = !t[key];
      };
      if (keys.length) {
        // differ in one noted detail; share the others, so the written row breaks the tie
        flip(keys[k % keys.length]);
        const free = ["persons", "table"].filter((key) => !keys.includes(key));
        if (free.length && rng() < 0.4) flip(free[Math.floor(rng() * free.length)]);
      } else {
        const opts = ["persons", "table", "hammock", "wheel", "crooked", "cedar", "double"];
        flip(opts[Math.floor(rng() * opts.length)]);
        if (rng() < 0.5) flip(opts[Math.floor(rng() * opts.length)]);
        if (Object.keys(s).every((key) => s[key] === t[key])) s.persons = (t.persons % 4) + 1;
      }
      // a blank row's truth must not be pinned by a stray detail: keep decoys plausible
      return s;
    }

    function tree(g, x, y, r, filled) {
      if (filled) { el("circle", { cx: x, cy: y, r, fill: INK }, g); return; }
      el("circle", { cx: x, cy: y, r, fill: "none", stroke: GREEN, "stroke-width": r * 0.38 }, g);
      el("circle", { cx: x, cy: y, r: r * 0.35, fill: DEEP }, g);
    }
    function glyph(parent, cx, cy, s, spec, label) {
      const g = el("g", { transform: `translate(${cx} ${cy}) scale(${s})` }, parent);
      el("circle", { class: "ring", cx: 0, cy: 0, r: 118, fill: "#f4f3ef", stroke: "#c9c8c2", "stroke-width": 2 }, g);
      // the post: a target of rings
      [16, 11, 6].forEach((r, i) => el("circle", { cx: -62, cy: -18, r, fill: "none", stroke: i === 1 ? INK : GREEN, "stroke-width": 3.4 }, g));
      el("circle", { cx: -62, cy: -18, r: 2.5, fill: INK }, g);
      // the table's corners
      const tx = spec.table < 0 ? -40 : 18;
      [[0, 0], [34, 0], [0, 20], [34, 20]].forEach(([a, b]) => tree(g, tx + a, -78 + b, 6));
      // the fire ring
      for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; tree(g, 48 + Math.cos(a) * 26, 22 + Math.sin(a) * 26, 5); }
      if (spec.double) for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + 0.2; tree(g, 48 + Math.cos(a) * 13, 22 + Math.sin(a) * 13, 3.6); }
      // the tent pad, square or crooked, with a tree for each sleeper
      const pad = el("g", { transform: `translate(-26 48) rotate(${spec.crooked ? 24 : 0})` }, g);
      for (let k = 0; k < 5; k++) for (const [a, b] of [[k, 0], [k, 4], [0, k], [4, k]]) el("circle", { cx: -24 + a * 12, cy: -24 + b * 12, r: 3, fill: "none", stroke: GREEN, "stroke-width": 1.8 }, pad);
      const spots = [[-7, -7], [7, 7], [7, -7], [-7, 7]];
      for (let k = 0; k < spec.persons; k++) el("circle", { cx: spots[k][0], cy: spots[k][1], r: 5, fill: INK }, pad);
      if (spec.wheel) { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; el("circle", { cx: -86 + Math.cos(a) * 15, cy: 40 + Math.sin(a) * 15, r: 2.8, fill: GREEN }, g); } el("circle", { cx: -86, cy: 40, r: 3, fill: INK }, g); }
      if (spec.cedar) { el("circle", { cx: 70, cy: -50, r: 22, fill: "none", stroke: INK, "stroke-width": 3 }, g); el("circle", { cx: 70, cy: -50, r: 14, fill: INK }, g); }
      if (spec.hammock) { tree(g, 6, -38, 7, true); tree(g, 52, -42, 7, true); el("path", { d: "M6 -38 Q29 -24 52 -42", fill: "none", stroke: INK, "stroke-width": 2, "stroke-dasharray": "2 4" }, g); }
      if (label != null) { const t = el("text", { x: 0, y: 112, "text-anchor": "middle", "font-size": 22, "font-weight": 700, "font-family": "IBM Plex Mono, monospace", fill: INK }, g); t.textContent = label; }
      return g;
    }

    function dotsPath(x1, y1, x2, y2, black) {
      const d = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(d / 24);
      for (let k = 1; k < n; k++) {
        const t = k / n;
        el("circle", { cx: x1 + (x2 - x1) * t, cy: y1 + (y2 - y1) * t, r: black ? 5 : 3.2 + 2 * (k % 2), fill: black ? INK : "none", stroke: INK, "stroke-width": 1.6 }, layer);
      }
    }

    const HERE = { x: 500, y: 600 };
    let hereSpec = null, hereLabel = "20";
    function layout() {
      layer.innerHTML = "";
      cands = [];
      const row = ROWS[j];
      const n = COUNTS[j];
      const t = trueSpec(row);
      const specs = [t];
      for (let k = 0; k < n - 1; k++) specs.push(decoyFrom(t, row, k));
      for (let k = specs.length - 1; k > 0; k--) { const r = Math.floor(rng() * (k + 1)); [specs[k], specs[r]] = [specs[r], specs[k]]; }
      // landscape: one row of glyphs; portrait (a phone): two columns, so each glyph reads larger
      const fr = svg.getBoundingClientRect();
      const portrait = fr.width > 0 && fr.width < fr.height * 0.95;
      let pts, sc;
      if (portrait) {
        svg.setAttribute("viewBox", "0 0 560 1000");
        HERE.x = 280; HERE.y = 900;
        pts = { 2: [[140, 300], [420, 300]], 3: [[140, 190], [420, 190], [280, 500]], 4: [[140, 160], [420, 160], [140, 470], [420, 470]] }[n];
        sc = 1;
      } else {
        svg.setAttribute("viewBox", "0 0 1000 700");
        HERE.x = 500; HERE.y = 600;
        pts = { 2: [300, 700], 3: [190, 500, 810], 4: [130, 377, 623, 870] }[n].map((x, i) => [x, i % 2 ? 230 : 200]);
        sc = n === 4 ? 0.88 : 1;
      }
            pts.forEach(([x, y]) => dotsPath(HERE.x, HERE.y, x, y, false));
      // where Tam stands: the last true glyph (or the five sites' edge)
      if (hereSpec) glyph(layer, HERE.x, HERE.y + 10, 0.62, hereSpec, hereLabel);
      else { el("rect", { x: HERE.x - 70, y: HERE.y - 40, width: 140, height: 90, fill: "#fff", stroke: INK, "stroke-width": 3 }, layer); const tt = el("text", { x: HERE.x, y: HERE.y + 12, "text-anchor": "middle", "font-size": 20, "font-weight": 700, fill: INK }, layer); tt.textContent = "20–24"; }
      pts.forEach(([x, y], i) => {
        const g = glyph(layer, x, y, sc, specs[i], String(i + 1));
        g.setAttribute("role", "button"); g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", `Glyph ${i + 1}`);
        const c = { g, x, y, spec: specs[i], ok: specs[i] === t };
        g.addEventListener("click", () => choose(c));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(c); } });
        cands.push(c);
      });
      const tam = el("circle", { cx: HERE.x, cy: HERE.y, r: 11, fill: INK, stroke: PEARL, "stroke-width": 3 }, layer);
      cands.tam = tam;
      [...rowsEl.children].forEach((d, i) => { d.classList.toggle("now", i === j); d.classList.toggle("done", i < j); });
      rowsEl.children[j].scrollIntoView?.({ block: "nearest" });
      focusIdx = 0;
      busy = false;
    }

    function walk(to, back, done) {
      const tam = cands.tam;
      const dur = api.reducedMotion ? 1 : 700;
      const t0 = performance.now();
      const stepF = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        tam.setAttribute("cx", HERE.x + (to.x - HERE.x) * e);
        tam.setAttribute("cy", HERE.y + (to.y - HERE.y) * e);
        if (k < 1) raf = requestAnimationFrame(stepF); else done();
      };
      raf = requestAnimationFrame(stepF);
    }

    function choose(c) {
      if (busy || over) return;
      busy = true;
      walk(c, false, () => {
        if (c.ok) {
          hereSpec = c.spec; hereLabel = String(ROWS[j].n);
          j++;
          if (j >= ROWS.length) return finish();
          timers.push(setTimeout(layout, api.reducedMotion ? 0 : 200));
        } else {
          drift++;
          driftEl.textContent = `DRIFT ${drift}`;
          flash.style.opacity = "1";
          timers.push(setTimeout(() => { flash.style.opacity = "0"; cands.tam.setAttribute("cx", HERE.x); cands.tam.setAttribute("cy", HERE.y); c.g.setAttribute("opacity", "0.25"); c.g.removeAttribute("tabindex"); c.dead = true; busy = false; }, 500));
        }
      });
    }

    function finish() {
      over = true;
      [...rowsEl.children].forEach((d) => d.classList.add("done"));
      if (drift < DRIFT_LOSE) api.end({ outcome: "win", text: `Glyph 12, and the path runs on toward 11. Drift ${drift}: the ground forgot ${drift === 1 ? "one step" : drift + " steps"}, and you are still ahead of the car.` });
      else api.end({ outcome: "lose", text: `Glyph 12, drift ${drift}. Too many steps forgotten: by the time you reach the booth, the car is already at the window.` });
    }

    const kd = (e) => {
      if (busy || over) return;
      const live = cands.filter((c) => !c.dead);
      if (/^[1-4]$/.test(e.key)) { const c = cands[+e.key - 1]; if (c && !c.dead) choose(c); }
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        focusIdx = (focusIdx + (e.key === "ArrowRight" ? 1 : live.length - 1)) % live.length;
        live[focusIdx].g.focus();
      }
    };
    window.addEventListener("keydown", kd);
    const go = wrap.querySelector(".missing-campsites-pattern-walk-intro button");
    go.addEventListener("click", () => { wrap.querySelector(".missing-campsites-pattern-walk-intro").remove(); layout(); });
    go.focus();
    // draw the first junction behind the intro so the field reads at once
    layout(); busy = true;

    return {
      unmount() {
        over = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", kd);
      },
    };
  },
};

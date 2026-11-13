// A Journey Into the Heartstream, 1D game: The Carving (DESIGN.md section 11, `g1_carving`).
// Scrimshaw: scratched black lines on ivory bone. One carving cut from `s1_carve_gift`: a tool for
// your recipient, 24 strokes, three knots, a soft timer (a lamp burning down). Solo: you are the one
// who laughs, so you carve for the one who argues (the ring laughs -> argues -> dreams -> fears).

const C = { ink: "#1a1410", ivory: "#f3e9d2", paper: "#efe3c8", slab: "#cdbb98", red: "#7A1020", gold: "#F2B544" };
const BW = 36, BH = 108;          // the blank, in mm (grain runs along its length)
const MAXLEN = BH / 3;            // a stroke is a drag of up to a third of the blank's length
const FORMS = {
  hook: { name: "Hook", effect: "Climb: one extra hold of reach. Heart: grip drains 1 less per beat.", rough: "Climb reach only",
    in: (x, y) => (Math.abs(x - 22) <= 7 && y >= 26 && y <= 104) || (() => { const d = Math.hypot(x - 14, y - 26); return d >= 2 && d <= 15 && (y <= 26 || x <= 10) && y <= 44; })() },
  awl: { name: "Awl", effect: "Chart: reveals every patrol at one junction per chart.", rough: "One branch per chart",
    in: (x, y) => y >= 8 && y <= 102 && Math.abs(x - 18) <= (y < 62 ? 3 + ((y - 8) / 54) * 5.5 : y < 70 ? 8.5 : 11) },
  comb: { name: "Comb", effect: "River: tendrils do not sting its holder.", rough: "Sting lasts 1 beat",
    in: (x, y) => x >= 5 && x <= 31 && ((y >= 64 && y <= 100) || (y >= 14 && y < 64 && ((x - 5) % 7.33) < 3.7)) },
  scraper: { name: "Scraper", effect: "River 3D: on-beat strokes count double against eddies.", rough: "×1.5",
    in: (x, y) => (y >= 12 && y <= 50 && Math.abs(x - 18) <= 14 - (y - 12) * 0.12) || (y > 50 && y <= 102 && Math.abs(x - 18) <= 6) },
  flute: { name: "Flute", effect: "Whole raft: after each calm, the good window widens by 10 ms for 30 s.", rough: "5 ms",
    in: (x, y) => y >= 6 && y <= 102 && Math.abs(x - 18) <= 7 },
};
const inBlank = (x, y) => { const rx = BW / 2, cy = Math.min(Math.max(y, rx), BH - rx); return Math.hypot((x - rx) / rx, (y - cy) / rx * 1.0) <= 1; };

export default {
  mount(root, api) {
    const P = "heartstream-carving-";
    const rng = api.rng();
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = [];
    const STROKES = 24, TIME = 240;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${C.paper};color:${C.ink};font-family:var(--g-display);display:grid;grid-template-columns:minmax(150px,1fr) minmax(220px,2.2fr) minmax(150px,1fr);gap:10px;padding:14px;box-sizing:border-box;
  background-image:repeating-linear-gradient(-45deg,rgba(26,20,16,.05) 0 1px,transparent 1px 7px)}
.${P}wrap *{box-sizing:border-box}
.${P}side{display:flex;flex-direction:column;gap:12px;border:1.5px solid ${C.ink};padding:12px;background:rgba(239,227,200,.92);min-width:0}
.${P}h{font-size:13px;letter-spacing:.2em;text-transform:uppercase;margin:0}
.${P}mark{display:flex;align-items:center;gap:10px;font-style:italic}
.${P}forms{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px}
.${P}forms button,.${P}btn{font:600 15px var(--g-display);color:${C.ink};background:${C.ivory};border:1.5px solid ${C.ink};padding:6px;cursor:pointer;min-height:40px}
.${P}forms button[aria-pressed=true]{background:${C.ink};color:${C.ivory}}
.${P}forms button:disabled{opacity:.45;cursor:default}
.${P}eff{font-size:14px;line-height:1.3;min-height:3.6em;font-style:italic}
.${P}notches{font-family:monospace;font-size:18px;letter-spacing:1px;word-break:break-all;line-height:1.1}
.${P}notches i{font-style:normal;opacity:.25}
.${P}stage{position:relative;min-height:320px;border:1.5px solid ${C.ink};background:#e4d6b8}
.${P}stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
.${P}lamp{height:90px;display:flex;justify-content:center}
.${P}done{background:${C.ink}!important;color:${C.ivory}!important;font-size:18px!important;letter-spacing:.2em}
.${P}say{font-size:15px;font-style:italic;min-height:2.6em;line-height:1.3}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,227,200,.82);z-index:5}
.${P}card{max-width:520px;background:${C.ivory};border:2px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:4px;padding:20px 22px}
.${P}card h2{font-size:32px;margin:0 0 8px;font-weight:500}
.${P}card p{margin:0 0 10px;line-height:1.4;font-size:17px}
@media (max-width:760px){.${P}wrap{grid-template-columns:1fr;grid-auto-rows:auto}.${P}stage{min-height:min(62vh,520px);order:-1}.${P}lamp{height:60px}}
`;
    wrap.appendChild(css);
    const left = document.createElement("div"); left.className = P + "side";
    left.innerHTML = `<p class="${P}h">For</p><div class="${P}mark"><svg width="54" height="54" viewBox="-30 -30 60 60" aria-hidden="true"><circle r="22" fill="none" stroke="${C.ink}" stroke-width="2"/><path d="M-11,12 L0,-13 L11,12 M-6,2 L6,2" fill="none" stroke="${C.red}" stroke-width="3"/></svg><span>the one who argues<br>his mark</span></div>
<p class="${P}h">Form</p><div class="${P}forms"></div><div class="${P}eff">Pick a form for his tool.</div><p class="${P}h">Strokes</p><div class="${P}notches"></div>`;
    const stage = document.createElement("div"); stage.className = P + "stage";
    const cv = document.createElement("canvas"); cv.setAttribute("aria-label", "The bone blank. Drag to carve a stroke."); cv.tabIndex = 0;
    stage.appendChild(cv);
    const right = document.createElement("div"); right.className = P + "side";
    right.innerHTML = `<p class="${P}h">The gift</p><div class="${P}say">“Carve for him.”</div>
<button type="button" class="${P}btn" data-a="elder">The elder's old tool</button>
<button type="button" class="${P}btn" data-a="mark">Cut his mark (3 strokes)</button>
<div class="${P}lamp"><svg viewBox="0 0 60 90" height="100%" aria-hidden="true"><path class="${P}flame" d="M30,10 C22,28 24,40 30,46 C36,40 38,28 30,10Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/><rect class="${P}oil" x="14" y="56" width="32" height="20" fill="${C.red}" opacity=".5"/><path d="M8,52 h44 l-6,28 h-32z" fill="none" stroke="${C.ink}" stroke-width="2"/></svg></div>
<button type="button" class="${P}btn ${P}done" data-a="done">DONE</button>`;
    wrap.append(left, stage, right);
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The Carving</h2>
<p>Make a tool for your brother from a bone blank, in 24 strokes. Pick a form, then <b>drag straight cuts</b> to take away bone outside its faint outline. Click a cut's start and end, or use the arrow keys and Space.</p>
<p>With the grain a stroke costs 1; across it, 2. A knot splits wide if you cut through it. A true copy of the form gives his tool its full effect; a poor one is still a gift.</p>
<button type="button" class="${P}btn ${P}done">Start</button></div>`;
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");
    const say = right.querySelector("." + P + "say"), eff = left.querySelector("." + P + "eff"), notches = left.querySelector("." + P + "notches");
    const oil = right.querySelector("." + P + "oil"), flame = right.querySelector("." + P + "flame");

    // ---- the blank ------------------------------------------------------------------------------
    const RES = 2; // cells per mm
    const GW = BW * RES, GH = BH * RES;
    const mat = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) mat[j * GW + i] = inBlank((i + 0.5) / RES, (j + 0.5) / RES) ? 1 : 0;
    const knots = [];
    while (knots.length < 3) {
      const k = { x: 4 + rng() * (BW - 8), y: 14 + rng() * (BH - 40), r: 2.2 };
      if (knots.every((o) => Math.hypot(o.x - k.x, o.y - k.y) > 18)) knots.push(k);
    }
    const grain = Array.from({ length: 16 }, (_, i) => ({ x: (i + 0.5) * BW / 16 + (rng() - 0.5), ph: rng() * 6, k: 0.05 + rng() * 0.06 }));
    const st = { started: false, over: false, form: null, formMask: null, left: STROKES, cuts: [], marked: false, tracing: null,
      drag: null, cursor: { x: BW / 2, y: BH / 2 }, kbStart: null, elderT: 0, hintT: 0, idle: 0, time: TIME, used: 0 };

    function setForm(key) {
      if (st.cuts.length) return;
      st.form = key;
      st.formMask = new Uint8Array(GW * GH);
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) st.formMask[j * GW + i] = mat[j * GW + i] && FORMS[key].in((i + 0.5) / RES, (j + 0.5) / RES) ? 1 : 0;
      formsEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
      eff.textContent = `${FORMS[key].name}: ${FORMS[key].effect}`;
      draw();
    }
    const formsEl = left.querySelector("." + P + "forms");
    for (const k of Object.keys(FORMS)) {
      const b = document.createElement("button"); b.type = "button"; b.dataset.k = k; b.textContent = FORMS[k].name; b.setAttribute("aria-pressed", "false");
      on(b, "click", () => setForm(k)); formsEl.appendChild(b);
    }
    function quality() {
      if (!st.formMask) return 0;
      let inter = 0, uni = 0;
      for (let n = 0; n < mat.length; n++) { const a = mat[n], b = st.formMask[n]; if (a && b) inter++; if (a || b) uni++; }
      return uni ? inter / uni : 0;
    }
    function renderNotches() {
      notches.innerHTML = "V".repeat(Math.max(0, st.left)) + `<i>${"\\".repeat(STROKES - Math.max(0, st.left))}</i>`;
    }

    // ---- geometry -------------------------------------------------------------------------------
    let scale = 4, ox = 0, oy = 0, W = 0, H = 0, dpr = 1;
    function layout() {
      const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      scale = Math.min((H - 30) / BH, (W - 30) / BW); ox = (W - BW * scale) / 2; oy = (H - BH * scale) / 2; draw();
    }
    const ro = new ResizeObserver(layout); ro.observe(stage);
    const toMm = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale }; };
    function clampSeg(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      return L > MAXLEN ? { x: a.x + (dx / L) * MAXLEN, y: a.y + (dy / L) * MAXLEN } : b;
    }
    const segDist = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return Math.hypot(px - a.x - t * dx, py - a.y - t * dy); };
    const costOf = (a, b) => { const ang = Math.abs(Math.atan2(b.x - a.x, b.y - a.y) * 180 / Math.PI); const off = Math.min(ang, 180 - ang); return off <= 20 ? 1 : 2; };
    const knotHit = (a, b) => knots.some((k) => segDist(k.x, k.y, a, b) <= k.r);

    function cut(a, b0) {
      const b = clampSeg(a, b0);
      if (Math.hypot(b.x - a.x, b.y - a.y) < 2) return;
      if (!st.form) { say.textContent = "Pick a form first."; return; }
      const cost = costOf(a, b);
      if (cost > st.left) { say.textContent = "Not enough strokes for a cut across the grain."; return; }
      const split = knotHit(a, b), half = split ? 6 : 2;
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
        const n = j * GW + i; if (!mat[n]) continue;
        if (segDist((i + 0.5) / RES, (j + 0.5) / RES, a, b) <= half) mat[n] = 0;
      }
      st.left -= cost; st.cuts.push({ a, b, half, split }); st.idle = 0;
      formsEl.querySelectorAll("button").forEach((x) => { x.disabled = x.dataset.k !== st.form; });
      const q = Math.round(quality() * 100);
      say.textContent = split ? "The knot split: the sliver came away three times as wide." : cost === 2 ? "Across the grain: two strokes." : `With the grain. The likeness stands at ${q}%.`;
      renderNotches(); draw();
      if (st.left <= 0) finish();
    }
    function traceMark(path) {
      // the mark's three points at the grip end; the trace must pass near all of them
      const pts = markPts();
      const ok = pts.every((p) => path.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 3.5));
      st.tracing = null;
      if (!ok) { say.textContent = "Trace his sign through all three points at the grip end."; draw(); return; }
      st.marked = true; st.left -= 3; renderNotches();
      right.querySelector('[data-a="mark"]').disabled = true;
      say.textContent = "His mark is cut into the grip."; draw();
      if (st.left <= 0) finish();
    }
    const markPts = () => [{ x: BW / 2 - 4, y: BH - 6 }, { x: BW / 2, y: BH - 16 }, { x: BW / 2 + 4, y: BH - 6 }];

    // ---- input ----------------------------------------------------------------------------------
    on(cv, "pointerdown", (e) => {
      if (!st.started || st.over) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      const p = toMm(e);
      st.drag = { a: p, b: p, path: [p] };
      draw();
    });
    on(cv, "pointermove", (e) => {
      const p = toMm(e); st.cursor = p;
      if (!st.drag) return;
      st.drag.b = p; st.drag.path.push(p); draw();
    });
    const release = () => {
      if (!st.drag) return;
      const d = st.drag; st.drag = null;
      if (st.tracing) traceMark(d.path); else cut(d.a, d.b);
    };
    on(cv, "pointerup", release); on(cv, "pointercancel", () => { st.drag = null; draw(); });
    on(cv, "keydown", (e) => {
      if (!st.started || st.over) return;
      const step = e.shiftKey ? 5 : 1.5, c = st.cursor;
      if (e.key === "ArrowLeft") c.x -= step; else if (e.key === "ArrowRight") c.x += step;
      else if (e.key === "ArrowUp") c.y -= step; else if (e.key === "ArrowDown") c.y += step;
      else if (e.key === " " || e.key === "Enter") {
        if (!st.kbStart) st.kbStart = { ...c };
        else { const a = st.kbStart; st.kbStart = null; if (st.tracing) traceMark([a, { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }, { ...c }, ...markPts()]); else cut(a, { ...c }); }
      } else if (e.key === "Escape") st.kbStart = null;
      else return;
      e.preventDefault();
      c.x = Math.max(-2, Math.min(BW + 2, c.x)); c.y = Math.max(-2, Math.min(BH + 2, c.y));
      draw();
    });
    on(right, "click", (e) => {
      const a = e.target.closest("button"); if (!a || !st.started || st.over) return;
      if (a.dataset.a === "elder") { if (!st.form) { say.textContent = "Pick a form first."; return; } st.elderT = 2000; say.textContent = "The elder's own old tool: the form, as it should be."; draw(); }
      if (a.dataset.a === "mark") { if (st.left < 3) { say.textContent = "Not enough strokes left for his mark."; return; } st.tracing = true; say.textContent = "Trace his sign once, through the three points at the grip end."; draw(); }
      if (a.dataset.a === "done") finish();
    });
    on(intro.querySelector("button"), "click", () => { intro.remove(); st.started = true; left.querySelector("button").focus(); last = performance.now(); });

    // ---- the lamp (soft timer) and the idle hint ------------------------------------------------
    let last = performance.now();
    timers.push(setInterval(() => {
      if (!st.started || st.over) return;
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      st.time -= dt; st.idle += dt;
      const f = Math.max(0, st.time / TIME);
      oil.setAttribute("height", String(20 * f)); oil.setAttribute("y", String(56 + 20 * (1 - f)));
      flame.setAttribute("transform", `translate(30 46) scale(${0.4 + 0.6 * f}) translate(-30 -46)`);
      if (st.elderT > 0) { st.elderT -= dt * 1000; if (st.elderT <= 0) draw(); }
      if (st.idle > 60 && st.form && st.hintT <= 0) { st.hintT = 3000; st.idle = 0; say.textContent = "The bone still to come away glows faintly."; draw(); }
      if (st.hintT > 0) { st.hintT -= dt * 1000; if (st.hintT <= 0) draw(); }
      if (st.time <= 0) { say.textContent = "The lamp is out."; finish(); }
    }, 200));

    function finish() {
      if (st.over) return;
      if (!st.form) { say.textContent = "Pick a form first."; if (st.time > 0) return; setForm("flute"); }
      st.over = true; draw();
      const q = Math.round(quality() * 100), F = FORMS[st.form];
      const word = q >= 80 ? "true" : q >= 60 ? "rough" : "keepsake";
      const what = word === "true" ? F.effect : word === "rough" ? `${F.rough}.` : "No effect; it rides with him to the last frame all the same.";
      api.end({ outcome: word === "true" ? "win" : "done",
        text: `A ${F.name.toLowerCase()}, ${word} (${q}% likeness), ${STROKES - st.left} strokes${st.marked ? ", his mark cut in the grip" : ""}. ${what}` });
    }

    // ---- drawing (scrimshaw) --------------------------------------------------------------------
    function draw() {
      if (!W) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#e4d6b8"; g.fillRect(0, 0, W, H);
      // slab hatching
      g.strokeStyle = "rgba(26,20,16,.12)"; g.lineWidth = 1; g.beginPath();
      for (let x = -H; x < W; x += 9) { g.moveTo(x, H); g.lineTo(x + H, 0); } g.stroke();
      g.save(); g.translate(ox, oy); g.scale(scale, scale);
      // the bone: every cell still present
      const cs = 1 / RES;
      g.fillStyle = C.ivory;
      for (let j = 0; j < GH; j++) { let run = -1; for (let i = 0; i <= GW; i++) { const v = i < GW && mat[j * GW + i]; if (v && run < 0) run = i; if (!v && run >= 0) { g.fillRect(run * cs, j * cs, (i - run) * cs + 0.02, cs + 0.02); run = -1; } } }
      // grain, scratched, clipped to the bone left
      g.save();
      g.beginPath();
      for (let j = 0; j < GH; j++) { let run = -1; for (let i = 0; i <= GW; i++) { const v = i < GW && mat[j * GW + i]; if (v && run < 0) run = i; if (!v && run >= 0) { g.rect(run * cs, j * cs, (i - run) * cs + 0.02, cs + 0.02); run = -1; } } }
      g.clip();
      g.strokeStyle = C.ink; g.lineWidth = 0.18; g.globalAlpha = 0.55;
      for (const l of grain) { g.beginPath(); for (let y = 0; y <= BH; y += 2) { const x = l.x + Math.sin(y * l.k + l.ph) * 0.9; y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.globalAlpha = 1;
      for (const k of knots) { for (let r = 0.6; r <= k.r + 1.6; r += 0.7) { g.beginPath(); g.ellipse(k.x, k.y, r * 0.8, r * 1.3, 0, 0, 7); g.lineWidth = 0.22; g.stroke(); } }
      if (st.hintT > 0 && st.formMask) {
        g.fillStyle = "rgba(122,16,32,.22)";
        for (let n = 0; n < mat.length; n++) if (mat[n] && !st.formMask[n]) g.fillRect((n % GW) * cs, Math.floor(n / GW) * cs, cs, cs);
      }
      g.restore();
      // the blank's original edge, faint
      g.strokeStyle = C.ink; g.lineWidth = 0.35; g.globalAlpha = 0.35;
      g.beginPath(); g.moveTo(0, BW / 2); g.arc(BW / 2, BW / 2, BW / 2, Math.PI, 0); g.lineTo(BW, BH - BW / 2); g.arc(BW / 2, BH - BW / 2, BW / 2, 0, Math.PI); g.closePath(); g.stroke();
      g.globalAlpha = 1;
      // the cuts: two scratched edges per sliver
      g.strokeStyle = C.ink; g.lineWidth = 0.3;
      for (const c of st.cuts) {
        const dx = c.b.x - c.a.x, dy = c.b.y - c.a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * c.half, ny = dx / L * c.half;
        g.beginPath(); g.moveTo(c.a.x + nx, c.a.y + ny); g.lineTo(c.b.x + nx, c.b.y + ny); g.moveTo(c.a.x - nx, c.a.y - ny); g.lineTo(c.b.x - nx, c.b.y - ny); g.stroke();
      }
      // the form's outline: dotted, bold while the elder's tool is shown
      if (st.formMask) {
        g.strokeStyle = st.elderT > 0 ? C.red : C.ink; g.lineWidth = st.elderT > 0 ? 0.6 : 0.3; g.globalAlpha = st.elderT > 0 ? 1 : 0.6;
        g.setLineDash(st.elderT > 0 ? [] : [0.8, 0.8]); g.beginPath();
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
          const v = st.formMask[j * GW + i]; if (!v) continue;
          if (i + 1 >= GW || !st.formMask[j * GW + i + 1]) { g.moveTo((i + 1) * cs, j * cs); g.lineTo((i + 1) * cs, (j + 1) * cs); }
          if (i === 0 || !st.formMask[j * GW + i - 1]) { g.moveTo(i * cs, j * cs); g.lineTo(i * cs, (j + 1) * cs); }
          if (j + 1 >= GH || !st.formMask[(j + 1) * GW + i]) { g.moveTo(i * cs, (j + 1) * cs); g.lineTo((i + 1) * cs, (j + 1) * cs); }
          if (j === 0 || !st.formMask[(j - 1) * GW + i]) { g.moveTo(i * cs, j * cs); g.lineTo((i + 1) * cs, j * cs); }
        }
        g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      }
      // his mark: dotted guide while tracing, scratched once cut
      const mp = markPts();
      if (st.tracing || st.marked) {
        g.strokeStyle = st.marked ? C.red : C.ink; g.lineWidth = st.marked ? 0.7 : 0.35; g.setLineDash(st.marked ? [] : [0.8, 0.8]);
        g.beginPath(); g.moveTo(mp[0].x, mp[0].y); g.lineTo(mp[1].x, mp[1].y); g.lineTo(mp[2].x, mp[2].y); g.moveTo(mp[0].x + 1.4, mp[0].y - 4); g.lineTo(mp[2].x - 1.4, mp[2].y - 4); g.stroke(); g.setLineDash([]);
        if (st.tracing) for (const p of mp) { g.beginPath(); g.arc(p.x, p.y, 1.2, 0, 7); g.fillStyle = C.red; g.fill(); }
      }
      // the chisel's line while dragging (or from the keyboard start)
      const a = st.drag ? st.drag.a : st.kbStart, b0 = st.drag ? st.drag.b : st.kbStart ? st.cursor : null;
      if (a && b0 && !st.tracing) {
        const b = clampSeg(a, b0), cost = costOf(a, b), split = knotHit(a, b);
        g.strokeStyle = split ? C.red : C.ink; g.lineWidth = 0.5; g.setLineDash([1.2, 0.8]);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.setLineDash([]);
        g.fillStyle = split ? C.red : C.ink; g.font = "3.4px Georgia"; g.fillText(`${cost === 1 ? "with the grain · 1" : "across · 2"}${split ? " · knot!" : ""}`, b.x + 1.5, b.y - 1.5);
      } else if (st.tracing && st.drag) {
        g.strokeStyle = C.red; g.lineWidth = 0.4; g.beginPath(); st.drag.path.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
      }
      if (document.activeElement === cv) { const c = st.cursor; g.strokeStyle = C.red; g.lineWidth = 0.3; g.beginPath(); g.moveTo(c.x - 2, c.y); g.lineTo(c.x + 2, c.y); g.moveTo(c.x, c.y - 2); g.lineTo(c.x, c.y + 2); g.stroke(); }
      g.restore();
      g.fillStyle = C.ink; g.font = "italic 14px Georgia"; g.textAlign = "left";
      g.fillText(st.form ? `likeness ${Math.round(quality() * 100)}%  ·  true at 80` : "pick a form", 10, 20);
    }
    renderNotches(); layout();

    return {
      unmount() {
        timers.forEach(clearInterval); ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        wrap.remove();
      },
    };
  },
};

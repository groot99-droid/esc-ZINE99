// The Stuffed Ones: Stitchwork (1D, crafting), drawn as a cross-stitch pattern chart.
//
// DESIGN.md section 11 "Stitchwork", appearance 3 (`c12_stitch_mend`): a whip stitch on a torn
// seam, 10 stitches, 60 seconds of dawn before Mabel arrives. Each stitch is three inputs: press at
// the entry point (in), drag to the exit point (out), hold to pull and let go while the tension
// needle is in the green band. Accuracy: within 6 px perfect, within 14 px good (scaled to the
// chart), otherwise off. Tension: in band good, under loose, over tears (redo, 2 s lost).
// Score per stitch: perfect and in band 1.0, good 0.7, loose 0.4, off 0.2. Seam quality: Strong
// 85 percent or more, Fair 60-84, Poor under 60.
//
// Actions: Stitch (in, out, pull); Steady, from section 12's tremors (from the fourth stitch the
// pack's pulse beats through the thread; a Steady inside its window holds the needle, a missed
// beat drifts the next point or jerks the pull); Unpick (twice, 3 s each) takes out the last stitch
// to sew it again. Phases: calm (stitches 1-3), the pulse (4-6), dawn (7-10 or under 25 s): the
// pull runs faster. Narrative lines are written for the game (listed in the refine additions).
const PRE = "stuffed-ones-stitchwork-";
const C = { moss: "#7d8a5a", mossL: "#a3ad83", rust: "#a5553a", rustL: "#c98a6e", sky: "#8fa9bf", cream: "#efe5cf", bone: "#f6f1e4",
  ink: "#2a211b", paper: "#f4efe3", amber: "#e39a2d", red: "#b8322a", night: "#56627a", band: "#8e9f68", green: "#4f6b2c" };
const COLS = 40, ROWS = 28, TEAR = 14, N = 10;
const POINTS = Array.from({ length: N }, (_, i) => ({ inX: Math.round(4 + 3.4 * i), inY: TEAR - 3, outX: Math.round(5.6 + 3.4 * i), outY: TEAR + 3 }));
const BAND = [0.56, 0.76];
const PULSE_EVERY = 4, PULSE_WIN = 0.9, UNPICKS = 2;

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}
function hash(x, y) { let h = (x * 374761393 + y * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return (h & 0xffff) / 65536; }

export default {
  mount(root, api) {
    const K = kit();
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    const grid = `background-color:${C.bone};background-image:linear-gradient(rgba(42,33,27,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(42,33,27,.09) 1px,transparent 1px),linear-gradient(rgba(42,33,27,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(42,33,27,.22) 1px,transparent 1px);background-size:12px 12px,12px 12px,120px 120px,120px 120px`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.paper};color:${C.ink};font-family:Karla,Arial,sans-serif;overflow:hidden;touch-action:none;outline:none}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
.${PRE}acts{position:absolute;display:flex;gap:8px;z-index:2}
.${PRE}acts button{font:600 14px Karla,Arial,sans-serif;background:${C.bone};color:${C.ink};border:1.5px solid ${C.ink};padding:8px 12px;min-height:42px;cursor:pointer;display:flex;align-items:center;gap:8px}
.${PRE}acts button i{font:600 12px ui-monospace,Menlo,monospace;font-style:normal;border:1px solid ${C.ink};padding:1px 5px;background:${C.paper}}
.${PRE}acts button:hover:not(:disabled){background:${C.cream}}
.${PRE}acts button:disabled{opacity:.4;cursor:not-allowed}
.${PRE}acts button[hidden]{display:none}
.${PRE}acts button.${PRE}hot{background:${C.red};color:${C.bone};border-color:${C.red}}
.${PRE}beat{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);width:min(520px,calc(100% - 32px));box-sizing:border-box;${grid};border:1.5px solid ${C.ink};box-shadow:3px 3px 0 ${C.moss};padding:10px 14px 10px 44px;font:15px/1.4 Karla,Arial,sans-serif;z-index:3;transition:opacity .4s;pointer-events:none}
.${PRE}beat::before{content:"";position:absolute;left:12px;top:12px;width:18px;height:18px;background:${C.red};box-shadow:inset 0 0 0 3px ${C.bone}}
.${PRE}beat b{font:400 17px 'IM Fell English',Georgia,serif;display:block;margin-bottom:2px}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(244,239,227,.72);z-index:4;padding:16px;overflow:auto}
.${PRE}card{width:min(470px,100%);${grid};border:2px solid ${C.ink};box-shadow:5px 5px 0 ${C.moss};padding:0 0 16px;position:relative}
.${PRE}card header{display:flex;justify-content:space-between;font:600 12px ui-monospace,Menlo,monospace;letter-spacing:.08em;background:${C.ink};color:${C.bone};padding:7px 14px}
.${PRE}card h2{margin:14px 18px 2px;font:400 34px/1 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}goal{margin:6px 18px 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}key{margin:0 18px;border-top:1.5px solid ${C.ink};border-bottom:1.5px solid ${C.ink};padding:6px 0}
.${PRE}key div{display:grid;grid-template-columns:26px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:4px 0}
.${PRE}key span.${PRE}sym{width:20px;height:20px;border:1.5px solid ${C.ink};display:grid;place-items:center;font:700 12px ui-monospace,monospace}
.${PRE}key kbd{font:600 12px ui-monospace,Menlo,monospace;border:1px solid ${C.ink};padding:1px 6px;background:${C.bone}}
.${PRE}key em{grid-column:2/4;font:italic 14px 'IM Fell English',Georgia,serif;opacity:.8;margin-top:-4px}
.${PRE}choose{display:flex;flex-wrap:wrap;gap:8px;margin:14px 18px 0}
.${PRE}choose button{font:600 15px Karla,Arial,sans-serif;background:${C.ink};color:${C.bone};border:0;padding:10px 16px;cursor:pointer;min-height:44px}
.${PRE}choose button+button{background:${C.bone};color:${C.ink};box-shadow:inset 0 0 0 1.5px ${C.ink}}
.${PRE}choose button:focus-visible{outline:3px solid ${C.red};outline-offset:2px}
.${PRE}card label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin:12px 18px 0}
.${PRE}card .${PRE}kind{margin:10px 18px 0;font:italic 14px 'IM Fell English',Georgia,serif;color:${C.red}}
</style><canvas aria-label="A cross-stitch chart of a torn seam with numbered entry points"></canvas>
<div class="${PRE}acts"><button type="button" data-a="steady" hidden>Steady <i>S</i></button><button type="button" data-a="unpick" hidden>Unpick <i>U</i></button></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const acts = wrap.querySelector("." + PRE + "acts");
    const steadyBtn = acts.querySelector('[data-a="steady"]'), unpickBtn = acts.querySelector('[data-a="unpick"]');
    const beatEl = wrap.querySelector("." + PRE + "beat");

    let started = false, over = false, whose = "lila", speed = 1, gentle = false;
    let timeLeft = 60, idle = 0, lockT = 0;
    let idx = 0, phase = "in", inAcc = null, outAcc = null, tension = 0, pulling = false;
    let ptr = null;
    let pulseT = 0, pulseOn = false, pulseLive = false, steadied = false, drift = [0, 0], drifts = 0, steadies = 0;
    let unpicks = UNPICKS, dawnSaid = false, mabelSaid = false;
    const scores = [], pops = [];
    let L = null, vx = 0, beatTimer = 0;

    // ---- narrative beats --------------------------------------------------------------------
    function beat(title, text, ms = 4200) {
      beatEl.innerHTML = "";
      const b = document.createElement("b"); b.textContent = title; beatEl.appendChild(b);
      beatEl.appendChild(document.createTextNode(text));
      beatEl.style.opacity = 1;
      clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 720;
      let c, gx, gy, VC, R0, R1, px, py, pw, ph;
      if (wide) {
        VC = COLS; R0 = 0; R1 = ROWS;
        const pnl = Math.min(300, W * 0.3);
        const avW = W - pnl - 70, avH = H - 140;
        c = Math.max(6, Math.min(avW / COLS, avH / ROWS));
        gx = 44 + (avW - c * COLS) / 2; gy = 86;
        px = W - pnl - 14; py = 86; pw = pnl; ph = H - 100;
      } else {
        VC = 18; R0 = 7; R1 = 21;
        c = Math.max(10, Math.min((W - 52) / VC, (H - 330) / (R1 - R0)));
        gx = 36 + (W - 52 - c * VC) / 2; gy = 112;
        px = 14; py = gy + (R1 - R0) * c + 16; pw = W - 28; ph = H - py - 66;
      }
      L = { W, H, wide, c, gx, gy, VC, R0, R1, px, py, pw, ph };
      acts.style.left = wide ? px + "px" : "14px";
      acts.style.right = wide ? "auto" : "14px";
      acts.style.bottom = "14px";
      acts.style.justifyContent = wide ? "flex-start" : "center";
      if (!wide) vx = Math.max(0, Math.min(COLS - VC, POINTS[Math.min(idx, N - 1)].inX - 5));
    }
    const toScr = (x, y) => [L.gx + (x - vx) * L.c, L.gy + (y - L.R0) * L.c];

    // ---- the chart --------------------------------------------------------------------------
    function cellSym(x, y) {
      const torn = Math.abs(y + 0.5 - TEAR) < 1.1 + hash(x, 99) * 1.2;
      if (torn) return "torn";
      if (y < TEAR) { if (y >= TEAR - 2) return "lining"; return (x % 8 < 2 && y % 6 < 2) ? "rust" : "moss"; }
      if (y <= TEAR + 1) return "lining";
      return (x + y) % 5 === 0 ? "sky" : "rust";
    }
    function drawCell(sx, sy, kind, c, x, y) {
      const fill = { moss: C.mossL, rust: C.rustL, sky: C.rustL, lining: C.cream, torn: "#fbf8f1" }[kind];
      g.fillStyle = fill; g.fillRect(sx, sy, c, c);
      if (c < 7) return;
      g.strokeStyle = "rgba(42,33,27,.55)"; g.fillStyle = "rgba(42,33,27,.55)"; g.lineWidth = 1;
      const m = c * 0.28;
      if (kind === "moss") { g.beginPath(); g.moveTo(sx + m, sy + m); g.lineTo(sx + c - m, sy + c - m); g.moveTo(sx + c - m, sy + m); g.lineTo(sx + m, sy + c - m); g.stroke(); }
      else if (kind === "rust") { g.beginPath(); g.arc(sx + c / 2, sy + c / 2, c * 0.13, 0, 7); g.fill(); }
      else if (kind === "sky") { g.fillStyle = C.sky; g.beginPath(); g.moveTo(sx + c / 2, sy + m); g.lineTo(sx + c - m, sy + c - m); g.lineTo(sx + m, sy + c - m); g.closePath(); g.fill(); }
      else if (kind === "lining") { g.beginPath(); g.moveTo(sx + c - m, sy + m); g.lineTo(sx + m, sy + c - m); g.stroke(); }
      else if (kind === "torn" && hash(x, y) < 0.35) { g.fillStyle = "rgba(107,74,50,.7)"; g.beginPath(); g.moveTo(sx + c / 2, sy + m); g.lineTo(sx + c - m, sy + c / 2); g.lineTo(sx + c / 2, sy + c - m); g.lineTo(sx + m, sy + c / 2); g.closePath(); g.fill(); }
    }
    function stitchLine(a, b, w, col) {
      g.strokeStyle = "rgba(42,33,27,.6)"; g.lineWidth = w + 2.2; g.lineCap = "round";
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    }
    function marker(p, n, style, pulse, hover) {
      const r = Math.max(9, L.c * 0.6);
      if (pulse) { g.strokeStyle = C.red; g.lineWidth = 2; g.globalAlpha = 0.7; g.beginPath(); g.arc(p[0], p[1], r + 4 + pulse * 10, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (hover) { g.strokeStyle = C.green; g.lineWidth = 3; g.beginPath(); g.arc(p[0], p[1], r + 5, 0, 7); g.stroke(); }
      g.fillStyle = style === "in" ? C.ink : C.bone; g.strokeStyle = style === "in" ? C.red : C.ink; g.lineWidth = 2;
      if (style === "out") g.setLineDash([3, 2]);
      g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
      g.fillStyle = style === "in" ? C.bone : C.ink; g.font = `700 ${Math.round(r * 1.05)}px ui-monospace,Menlo,monospace`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(n, p[0], p[1] + 0.5);
    }
    const target = (which) => { const p = POINTS[idx]; return which === "in" ? [p.inX + drift[0], p.inY + drift[1]] : [p.outX + drift[0], p.outY + drift[1]]; };

    function draw(now) {
      if (!L) layout();
      const { W, H, c, VC, R0, R1, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const total = 60 * speed, dawn = Math.max(0, Math.min(1, 1 - timeLeft / total));
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      // dawn growing over the paper: night blue-grey to warm light as Mabel nears
      const gr = g.createLinearGradient(0, 0, W, 0);
      gr.addColorStop(0, `rgba(86,98,122,${0.35 * (1 - dawn)})`); gr.addColorStop(1, `rgba(227,154,45,${0.36 * dawn})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // the dawn bar along the top: the pressure, always in view
      const bx = 14, bw = W - 28, by = 14, bh = 30;
      g.fillStyle = C.bone; g.fillRect(bx, by, bw, bh); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(bx, by, bw, bh);
      const cells = Math.floor(bw / 12);
      for (let k = 0; k < cells; k++) {
        const f = k / cells; if (f > dawn) break;
        g.fillStyle = f > 0.75 ? C.red : f > 0.45 ? C.amber : C.night; g.fillRect(bx + 2 + k * 12, by + 4, 10, bh - 8);
      }
      const secs = Math.max(0, Math.ceil(timeLeft));
      const warn = timeLeft < 15 * speed;
      g.font = `700 ${warn ? 16 : 14}px Karla,Arial,sans-serif`; g.textBaseline = "middle"; g.textAlign = "right";
      const lbl = `Mabel at the door in ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      const lw = g.measureText(lbl).width + 16;
      g.fillStyle = warn && !api.reducedMotion && Math.floor(now / 400) % 2 ? C.red : C.ink; g.fillRect(bx + bw - lw - 2, by + 2, lw, bh - 4);
      g.fillStyle = C.bone; g.fillText(lbl, bx + bw - 10, by + bh / 2 + 1);
      g.textAlign = "left"; g.font = "600 13px ui-monospace,Menlo,monospace";
      if (bw - lw > 170) { const tw2 = g.measureText("NIGHT → DAWN").width + 12; g.fillStyle = C.bone; g.fillRect(bx + 4, by + 5, tw2, bh - 10); g.fillStyle = C.ink; g.fillText("NIGHT → DAWN", bx + 10, by + bh / 2 + 1); }

      // grid cells in view
      g.save(); g.beginPath(); g.rect(L.gx, L.gy, VC * c, (R1 - R0) * c); g.clip();
      const x0 = Math.floor(vx), x1 = Math.min(COLS, Math.ceil(vx + VC));
      for (let y = R0; y < R1; y++) for (let x = x0; x < x1; x++) { const [sx, sy] = toScr(x, y); drawCell(sx, sy, cellSym(x, y), c, x, y); }
      // the open tear: a ragged dark gap the stitches close
      g.fillStyle = "rgba(74,50,34,.85)";
      g.beginPath();
      const open = (x) => 1 - Math.min(1, Math.max(0, scores.length * 3.4 + 4 - x) / 3) * 0.85;
      for (let x = 0; x <= COLS; x++) { const [sx, sy] = toScr(x, TEAR + 0.5 - (0.35 + hash(x, 7) * 0.5) * open(x)); x ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
      for (let x = COLS; x >= 0; x--) { const fill = 1 - open(x); const [sx, sy] = toScr(x, TEAR + 0.5 + (0.35 + hash(x, 11) * 0.5) * (1 - fill)); g.lineTo(sx, sy); }
      g.closePath(); g.fill();
      // the Aida grid, bold every 10
      g.lineWidth = 1;
      for (let x = x0; x <= x1; x++) { const [sx] = toScr(x, 0); g.strokeStyle = x % 10 === 0 ? "rgba(42,33,27,.85)" : "rgba(42,33,27,.18)"; g.beginPath(); g.moveTo(sx + 0.5, L.gy); g.lineTo(sx + 0.5, L.gy + (R1 - R0) * c); g.stroke(); }
      for (let y = R0; y <= R1; y++) { const [, sy] = toScr(0, y); g.strokeStyle = y % 10 === 0 ? "rgba(42,33,27,.85)" : "rgba(42,33,27,.18)"; g.beginPath(); g.moveTo(L.gx, sy + 0.5); g.lineTo(L.gx + VC * c, sy + 0.5); g.stroke(); }
      // done stitches
      for (let i = 0; i < scores.length; i++) {
        const p = POINTS[i], s = scores[i];
        stitchLine(toScr(p.inX, p.inY), toScr(p.outX, p.outY), Math.max(2.5, c * 0.32), s >= 0.7 ? C.bone : "#d9cfb8");
        if (s < 0.7) { const [mx, my] = toScr((p.inX + p.outX) / 2, (p.inY + p.outY) / 2); g.fillStyle = C.red; g.font = `700 ${Math.max(12, c * 0.7)}px ui-monospace,monospace`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s === 0.4 ? "~" : "?", mx + c * 0.8, my); }
        const q = POINTS[i + 1];
        if (q && i < scores.length - 1) { g.strokeStyle = "rgba(246,241,228,.5)"; g.lineWidth = 1.2; g.setLineDash([3, 3]); const a = toScr(p.outX, p.outY), b = toScr(q.inX, q.inY); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + c, (a[1] + b[1]) / 2, b[0], b[1]); g.stroke(); g.setLineDash([]); }
      }
      // the working stitch
      if (!over && idx < N && started) {
        const A = toScr(...target("in")), B = toScr(...target("out"));
        const pulse = idle > 8 ? (api.reducedMotion ? 0.4 : (now / 600) % 1) : 0;
        const nearIn = ptr && Math.hypot(ptr[0] - A[0], ptr[1] - A[1]) <= tol().good;
        const nearOut = ptr && Math.hypot(ptr[0] - B[0], ptr[1] - B[1]) <= tol().good;
        if (drift[0] || drift[1]) { const [ox, oy] = toScr(POINTS[idx].inX, POINTS[idx].inY); g.strokeStyle = "rgba(184,50,42,.6)"; g.setLineDash([2, 3]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(ox, oy); g.lineTo(A[0], A[1]); g.stroke(); g.setLineDash([]); }
        if (phase === "in") { marker(B, idx + 1, "out", 0, false); marker(A, idx + 1, "in", pulse, nearIn); }
        else if (phase === "drag") { marker(B, idx + 1, "out", pulse, nearOut); if (ptr) stitchLine(A, ptr, Math.max(2, c * 0.22), C.bone); marker(A, idx + 1, "in", 0, false); }
        else if (phase === "pull") {
          const sag = (1 - tension) * c * 1.4;
          g.strokeStyle = C.bone; g.lineWidth = Math.max(2, c * 0.24); g.lineCap = "round";
          g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo((A[0] + B[0]) / 2 + sag, (A[1] + B[1]) / 2 + sag * 0.3, B[0], B[1]); g.stroke();
        }
      }
      // the pulse: a ring that beats through the whole chart
      if (pulseOn) { g.strokeStyle = steadied ? C.green : C.red; g.lineWidth = steadied ? 6 : 4; g.globalAlpha = 0.55; g.strokeRect(L.gx + 2, L.gy + 2, VC * c - 4, (R1 - R0) * c - 4); g.globalAlpha = 1; }
      g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(L.gx, L.gy, VC * c, (R1 - R0) * c);
      // margin counts
      g.fillStyle = C.ink; g.font = "12px ui-monospace,Menlo,monospace"; g.textAlign = "center"; g.textBaseline = "bottom";
      for (let x = Math.ceil(vx / 10) * 10; x <= vx + VC; x += 10) g.fillText(String(x), L.gx + (x - vx) * c, L.gy - 4);
      g.textAlign = "right"; g.textBaseline = "middle";
      for (let y = Math.ceil(R0 / 10) * 10; y <= R1; y += 10) g.fillText(String(y), L.gx - 6, L.gy + (y - R0) * c);
      g.fillStyle = C.red; g.fillText("▶", L.gx - 6, L.gy + (TEAR + 0.5 - R0) * c);
      if (!wide && vx > 0.5) { g.fillStyle = C.ink; g.textAlign = "left"; g.fillText("◀", L.gx + 4, L.gy - 10); }
      drawPanel(now);
      // flourishes
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1300;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 26;
        g.globalAlpha = 1 - a * a; g.font = "700 16px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        const w = g.measureText(p.text).width + 14;
        g.fillStyle = C.bone; g.fillRect(p.x - w / 2, p.y - rise - 12, w, 24); g.strokeStyle = p.col; g.lineWidth = 2; g.strokeRect(p.x - w / 2, p.y - rise - 12, w, 24);
        g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise + 1);
        g.globalAlpha = 1;
      }
      K.frame(draw);
    }

    function drawPanel(now) {
      const { px, py, pw, wide } = L;
      let y = py + 4;
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = C.ink;
      const head = (t) => { g.font = "700 12px ui-monospace,Menlo,monospace"; g.fillStyle = C.ink; g.fillText(t, px, y); g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(px, y + 5); g.lineTo(px + pw, y + 5); g.stroke(); y += 22; };
      if (wide) {
        head("KEY");
        [["moss", "moss felt"], ["rust", "rust felt"], ["lining", "cream lining"], ["torn", "torn edge"]].forEach(([k, name]) => {
          drawCell(px, y - 12, k, 16, 0, 0); g.strokeStyle = C.ink; g.strokeRect(px, y - 12, 16, 16);
          g.fillStyle = C.ink; g.font = "13px ui-monospace,Menlo,monospace"; g.fillText(name, px + 24, y + 1); y += 21;
        });
        y += 8;
      }
      head(`STITCH · ${whose === "lila" ? "LILA'S SEAM" : "YOUR SEAM"}`);
      g.font = "700 26px ui-monospace,Menlo,monospace"; g.fillText(`${Math.min(idx, N)}/${N}`, px, y + 8);
      const bx = px + (wide ? 100 : 96);
      for (let i = 0; i < N; i++) {
        const x = bx + (i % 5) * 18, yy = y - 16 + Math.floor(i / 5) * 18;
        g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(x, yy, 14, 14);
        if (i < scores.length) { g.fillStyle = scores[i] >= 1 ? C.green : scores[i] >= 0.7 ? C.ink : scores[i] >= 0.4 ? C.amber : C.red; g.fillRect(x + 2, yy + 2, 10, 10); }
        else if (i === idx) { g.strokeStyle = C.red; g.lineWidth = 2; g.strokeRect(x - 1, yy - 1, 16, 16); }
      }
      if (!wide) { g.font = "13px Karla,Arial,sans-serif"; g.fillStyle = C.ink; g.fillText(`quality ${quality()}%`, bx + 100, y + 2); }
      else { y += 34; g.font = "14px Karla,Arial,sans-serif"; g.fillText(`Seam so far: ${quality()}% · ${grade(quality())}`, px, y - 6); }
      y += wide ? 20 : 34;
      head("TENSION");
      const tw = Math.min(pw, 280), th = 20;
      const inBand = tension >= BAND[0] && tension <= BAND[1];
      g.fillStyle = C.bone; g.fillRect(px, y - 10, tw, th);
      g.fillStyle = pulling && inBand ? C.green : C.band; g.fillRect(px + tw * BAND[0], y - 10, tw * (BAND[1] - BAND[0]), th);
      g.save(); g.beginPath(); g.rect(px + tw * 0.9, y - 10, tw * 0.1, th); g.clip();
      g.strokeStyle = C.red; g.lineWidth = 1; for (let k = -20; k < 40; k += 4) { g.beginPath(); g.moveTo(px + tw * 0.9 + k, y + 10); g.lineTo(px + tw * 0.9 + k + 20, y - 10); g.stroke(); }
      g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(px, y - 10, tw, th);
      const nx = px + tw * Math.min(1, tension);
      g.fillStyle = inBand ? C.green : tension > BAND[1] ? C.red : C.ink;
      g.beginPath(); g.moveTo(nx - 6, y - 19); g.lineTo(nx + 6, y - 19); g.lineTo(nx, y - 10); g.closePath(); g.fill();
      g.fillRect(nx - 1.5, y - 10, 3, th);
      g.font = "13px Karla,Arial,sans-serif"; g.fillStyle = C.ink; g.fillText("loose", px, y + 26); g.textAlign = "center"; g.fillText("let go here", px + tw * (BAND[0] + BAND[1]) / 2, y + 26); g.textAlign = "right"; g.fillStyle = C.red; g.fillText("tear", px + tw, y + 26); g.textAlign = "left";
      y += 52;
      // the next move, in words
      g.fillStyle = C.ink; g.font = "600 15px Karla,Arial,sans-serif";
      const step = lockT > 0 ? "The thread tore. Rethreading…" : phase === "in" ? "① Press the dark point (in)" : phase === "drag" ? "② Drag to the dashed point (out)" : pulling ? "③ Pulling… let go in the green" : "③ Hold to pull the thread";
      if (started && !over) g.fillText(step, px, y);
      y += 22;
      if (drifts + steadies > 0 && wide) { g.font = "13px Karla,Arial,sans-serif"; g.fillStyle = "rgba(42,33,27,.8)"; g.fillText(`pulse: ${steadies} steadied, ${drifts} slipped`, px, y); }
    }

    // ---- scoring ------------------------------------------------------------------------------
    const quality = () => Math.round(scores.reduce((a, b) => a + b, 0) / N * 100);
    const grade = (q) => (q >= 85 ? "Strong" : q >= 60 ? "Fair" : "Poor");

    // ---- the three inputs ----------------------------------------------------------------
    const tol = () => ({ perfect: Math.max(6, L.c * 0.45), good: Math.max(14, L.c * 1.0) });
    function acc(pt, gx, gy) {
      const [sx, sy] = toScr(gx, gy), d = Math.hypot(pt[0] - sx, pt[1] - sy), t = tol();
      return d <= t.perfect ? "perfect" : d <= t.good ? "good" : "off";
    }
    function pressIn(pt) {
      if (phase !== "in" || lockT > 0) return;
      const [tx, ty] = target("in");
      inAcc = pt ? acc(pt, tx, ty) : "good";
      if (pt && inAcc === "off") { const [sx, sy] = toScr(tx, ty); if (Math.hypot(pt[0] - sx, pt[1] - sy) > L.c * 4) { inAcc = null; return; } }
      const [sx, sy] = toScr(tx, ty);
      if (pt) pop(inAcc === "perfect" ? "in: perfect" : inAcc === "good" ? "in: good" : "in: off the point", sx, sy - 26, inAcc === "off" ? C.red : C.green);
      phase = "drag"; idle = 0; ptr = pt || [sx, sy];
    }
    function releaseOut(pt) {
      if (phase !== "drag") return;
      const [tx, ty] = target("out");
      outAcc = pt ? acc(pt, tx, ty) : "good";
      const [sx, sy] = toScr(tx, ty);
      if (pt) pop(outAcc === "perfect" ? "out: perfect" : outAcc === "good" ? "out: good" : "out: off", sx, sy + 26, outAcc === "off" ? C.red : C.green);
      phase = "pull"; tension = 0; idle = 0;
    }
    function startPull() { if (phase === "pull" && !pulling && lockT <= 0) { pulling = true; tension = 0; } }
    function endPull() {
      if (!pulling) return;
      pulling = false;
      const t = tension;
      if (t > BAND[1]) { tear(); return; }
      const loose = t < BAND[0];
      let s;
      if (inAcc === "off" || outAcc === "off") s = 0.2;
      else if (loose) s = 0.4;
      else if (inAcc === "perfect" && outAcc === "perfect") s = 1.0;
      else s = 0.7;
      scores.push(s);
      const [mx, my] = toScr((POINTS[idx].inX + POINTS[idx].outX) / 2, TEAR);
      pop(s === 1 ? "perfect stitch" : s === 0.7 ? "good stitch" : s === 0.4 ? "loose" : "off the point", mx, my - L.c * 2, s >= 0.7 ? C.green : C.red);
      idx++; phase = "in"; tension = 0; idle = 0; drift = [0, 0];
      if (s < 0.7 && unpicks > 0) unpickBtn.classList.add(PRE + "hot");
      else unpickBtn.classList.remove(PRE + "hot");
      progressBeats();
      if (!L.wide) layout();
      if (idx >= N) finish();
      syncButtons();
    }
    function tear() {
      pulling = false; tension = 0; phase = "in"; lockT = 2; drift = [0, 0];
      const [mx, my] = toScr((POINTS[idx].inX + POINTS[idx].outX) / 2, TEAR);
      pop("too tight: torn", mx, my - L.c * 2, C.red);
    }
    function unpick() {
      if (!started || over || unpicks <= 0 || !scores.length || pulling || phase !== "in") return;
      unpicks--; scores.pop(); idx--; timeLeft -= 3; phase = "in"; drift = [0, 0];
      const [mx, my] = toScr((POINTS[idx].inX + POINTS[idx].outX) / 2, TEAR);
      pop("unpicked: −3 s", mx, my - L.c * 2, C.amber);
      unpickBtn.classList.remove(PRE + "hot");
      if (!L.wide) layout();
      syncButtons();
    }
    function steady() {
      if (!started || over || !pulseLive) return;
      if (pulseOn && !steadied) { steadied = true; steadies++; pop("steady", L.gx + 60, L.gy + 18, C.green); }
      else if (!pulseOn) pop("between beats", L.gx + 80, L.gy + 18, C.amber);
    }
    function syncButtons() {
      steadyBtn.hidden = !pulseLive;
      unpickBtn.hidden = idx < 1 && unpicks === UNPICKS;
      unpickBtn.disabled = unpicks <= 0 || !scores.length;
      unpickBtn.querySelector("i").textContent = `U · ${unpicks}`;
    }
    function progressBeats() {
      if (idx === 3 && !pulseLive) {
        pulseLive = true; pulseT = 1.2;
        beat("The pulse", "Across the room the pack's one heartbeat comes down the thread. When the chart flashes red, press Steady (S) or the needle slips.", 5200);
      }
      if (idx === 6 && !dawnSaid) { dawnSaid = true; beat("Grey at the window", "The first birds would be singing, if the forest let them. The thread pulls faster in the cold."); }
    }
    function finish() {
      over = true;
      const q = quality(), gr = grade(q);
      const best = api.store.get("best", 0); if (q > best) api.store.set("best", q);
      api.store.set("losses", 0);
      const lila = whose === "lila";
      const effect = gr === "Poor"
        ? (lila ? "Lila's seam is closed, barely; the hunger will find the gaps." : "Your seam is closed, barely; nothing more will fit in it.")
        : (lila ? "Lila's hunger will rise more slowly now. She does not say thank you; she cannot. She is very still." : "Your seam can hold one more memory. You choose not to think about which.");
      const text = `${gr} seam, ${q} percent, with ${Math.max(0, Math.ceil(timeLeft))} s of dark to spare. ${effect}${gr !== "Poor" && steadies >= 3 ? " The pulse never once got into your hands." : ""}`;
      K.after(600, () => api.end({ outcome: gr === "Poor" ? "done" : "win", text }));
    }
    function lose() {
      over = true; pulling = false;
      api.store.set("losses", losses + 1);
      api.end({ outcome: "lose", text: `Mabel's key turns in the lock. You go still with the needle in the cloth, ${idx} of ${N} stitches in. The seam stays open, and she will see it when she dusts.` });
    }

    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      cv.setPointerCapture(e.pointerId);
      ptr = pt(e);
      if (phase === "in") pressIn(pt(e));
      else if (phase === "pull") startPull();
    });
    K.on(cv, "pointermove", (e) => { ptr = pt(e); });
    K.on(cv, "pointerup", (e) => {
      if (!started || over) return;
      if (phase === "drag") releaseOut(pt(e));
      else if (pulling) endPull();
    });
    K.on(cv, "pointercancel", () => { if (pulling) endPull(); });
    K.on(cv, "pointerleave", () => { if (phase !== "drag") ptr = null; });
    // keyboard: Enter snaps to the point (counts as good); hold Space to pull; S steadies; U unpicks
    K.on(wrap, "keydown", (e) => {
      if (!started || over || e.repeat) return;
      if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      const k = e.key.toLowerCase();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (phase === "in") pressIn(null);
        else if (phase === "drag") releaseOut(null);
        else if (phase === "pull") startPull();
      } else if (k === "s") steady();
      else if (k === "u") unpick();
    });
    K.on(wrap, "keyup", (e) => { if ((e.key === " " || e.key === "Enter") && pulling) { e.preventDefault(); endPull(); } });
    K.on(steadyBtn, "pointerdown", (e) => { e.preventDefault(); steady(); });
    K.on(steadyBtn, "click", (e) => { if (e.detail === 0) steady(); });
    K.on(unpickBtn, "click", () => { unpick(); wrap.focus(); });

    let prev = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        timeLeft -= dt; idle += dt;
        if (lockT > 0) lockT -= dt;
        const late = idx >= 6 || timeLeft < 25 * speed;
        if (pulling) { tension += dt * 0.62 * (late ? 1.25 : 1) / speed; if (tension >= 1) tear(); }
        if (pulseLive) {
          pulseT -= dt / speed;
          if (pulseT <= 0 && !pulseOn) { pulseOn = true; steadied = false; pulseT = (gentle ? PULSE_WIN * 1.7 : PULSE_WIN) * speed; }
          else if (pulseOn && pulseT <= 0) {
            pulseOn = false; pulseT = PULSE_EVERY * speed;
            if (!steadied) {
              drifts++;
              if (pulling) { tension = Math.min(1.02, tension + 0.1); pop("the pulse jerks the thread", L.gx + L.VC * L.c / 2, L.gy + 18, C.red); if (tension >= 1) tear(); }
              else if (phase !== "pull") { drift = [drift[0] + (drifts % 2 ? 1 : -1), drift[1] + (drifts % 3 === 0 ? 1 : 0)]; drift[0] = Math.max(-2, Math.min(2, drift[0])); pop("the needle slips", L.gx + L.VC * L.c / 2, L.gy + 18, C.red); }
            }
          }
        }
        if (timeLeft < 20 * speed && !mabelSaid) { mabelSaid = true; beat("Gravel on the path", "Someone humming, coming up to the porch with a sewing tin."); }
        if (timeLeft <= 0) lose();
      }
      tickRaf = requestAnimationFrame(tick);
    }
    let tickRaf = requestAnimationFrame(tick);

    // ---- how to play: a pattern card ----------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play Stitchwork">
      <header><span>PATTERN No. 12</span><span>WHIP STITCH · 10 ST.</span></header>
      <h2>Stitchwork</h2>
      <p class="${PRE}goal">The second night, before dawn. A seam split while the pack slept. Close it in ten stitches before Mabel comes with her sewing tin.</p>
      <div class="${PRE}key">
        <div><span class="${PRE}sym" style="background:${C.ink};color:${C.bone}">1</span><span>Press the dark point: <b>in</b></span><kbd>Enter</kbd></div>
        <div><span class="${PRE}sym">1</span><span>Drag to the dashed point: <b>out</b></span><kbd>Enter</kbd></div>
        <div><span class="${PRE}sym" style="background:${C.band}">⟋</span><span>Hold to <b>pull</b>, let go in the green</span><kbd>hold Space</kbd></div>
        <div><em>Too tight tears the thread. More stitches unlock as you sew.</em></div>
      </div>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>Two seams left open. Gentle thread is ticked for you: more time, a slower pull, a wider beat.</p>
      <label><input type="checkbox" ${losses >= 2 ? "checked" : ""}> Gentle thread (twice the time, slower pull)</label>
      <div class="${PRE}choose"><button type="button" data-w="lila">Mend Lila's seam</button><button type="button" data-w="me">Mend your own</button></div>
    </div>`;
    wrap.appendChild(intro);
    intro.querySelectorAll("button").forEach((b) => K.on(b, "click", () => {
      whose = b.dataset.w; gentle = intro.querySelector("input").checked; speed = gentle ? 2 : 1; timeLeft = 60 * speed;
      intro.remove(); started = true; wrap.focus();
      beat(whose === "lila" ? "Lila's seam" : "Your own seam", whose === "lila" ? "She was the hungriest, so hers split first. She lies open on the shelf beside you and does not move." : "It opened along your side while you held still. Something warm is close to coming out.", 4600);
      syncButtons();
    }));
    intro.querySelector("button").focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

// The Stuffed Ones: Stitchwork (1D, crafting), drawn as a cross-stitch pattern chart.
//
// DESIGN.md section 11 "Stitchwork", appearance 3 (`c12_stitch_mend`): a whip stitch on a torn
// seam, 10 stitches, 60 seconds of dawn before Mabel arrives. Each stitch is three inputs: press at
// the entry point (in), drag to the exit point (out), hold to pull and let go while the tension
// needle is in the green band. Accuracy: within 6 px perfect, within 14 px good (scaled to the
// chart), otherwise off. Tension: in band good, under loose, over tears (redo, 2 s lost).
// Score per stitch: perfect and in band 1.0, good 0.7, loose 0.4, off 0.2. Seam quality: Strong
// 85 percent or more, Fair 60-84, Poor under 60.
const PRE = "stuffed-ones-stitchwork-";
const C = { moss: "#7d8a5a", mossL: "#a3ad83", rust: "#a5553a", rustL: "#c98a6e", sky: "#8fa9bf", cream: "#efe5cf", bone: "#f6f1e4",
  ink: "#2a211b", paper: "#f4efe3", amber: "#e39a2d", red: "#b8322a", night: "#56627a", band: "#8e9f68" };
const COLS = 40, ROWS = 28, TEAR = 14, N = 10;
const POINTS = Array.from({ length: N }, (_, i) => ({ inX: 4 + 3.4 * i, inY: TEAR - 3, outX: 5.6 + 3.4 * i, outY: TEAR + 3 }));
POINTS.forEach((p) => { p.inX = Math.round(p.inX); p.outX = Math.round(p.outX); });
const BAND = [0.56, 0.76];

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
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.paper};color:${C.ink};font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;overflow:hidden;touch-action:none;outline:none}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(244,239,227,.8);z-index:3;padding:16px}
.${PRE}intro div{max-width:470px;background:${C.bone};border:1px solid ${C.ink};padding:18px 20px;box-shadow:3px 3px 0 ${C.moss}}
.${PRE}intro h2{margin:0 0 8px;font:400 28px 'IM Fell English',Georgia,serif}
.${PRE}intro p{margin:0 0 8px;font:13px/1.5 Karla,Arial,sans-serif}
.${PRE}intro button{font:600 13px Karla,Arial,sans-serif;background:${C.ink};color:${C.bone};border:0;padding:9px 14px;cursor:pointer;margin:6px 8px 0 0}
.${PRE}intro label{font:12px Karla,Arial,sans-serif;display:flex;gap:6px;align-items:center;margin-top:8px}
</style><canvas aria-label="A cross-stitch chart of a torn seam with numbered entry points"></canvas>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");

    let started = false, over = false, whose = "lila", speed = 1;
    let timeLeft = 60, idle = 0, lockT = 0;
    let idx = 0, phase = "in", inAcc = null, outAcc = null, tension = 0, pulling = false;
    let ptr = null, last = "", lastT = 0;
    const scores = [];
    let L = null;

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 720;
      const panel = wide ? { w: Math.min(280, W * 0.3), h: H } : { w: W, h: 190 };
      const avW = wide ? W - panel.w - 40 : W - 24, avH = wide ? H - 40 : H - panel.h - 34;
      const c = Math.max(6, Math.min((avW - 30) / COLS, (avH - 24) / ROWS));
      const gx = wide ? 20 + 26 + (avW - 30 - c * COLS) / 2 : 12 + 24 + (avW - 30 - c * COLS) / 2;
      const gy = 20 + 18;
      const px = wide ? W - panel.w - 12 : 12, py = wide ? 20 : gy + ROWS * c + 18;
      L = { W, H, wide, c, gx, gy, px, py, pw: wide ? panel.w : W - 24, ph: wide ? H - 40 : H - py - 8 };
    }
    const toScr = (x, y) => [L.gx + x * L.c, L.gy + y * L.c];

    // ---- the chart --------------------------------------------------------------------------
    function cellSym(x, y) {
      const torn = Math.abs(y + 0.5 - TEAR) < 1.1 + hash(x, 99) * 1.2;
      if (torn) return "torn";
      if (y < TEAR) {
        if (y >= TEAR - 2) return "lining";
        const m = (x % 8 < 2 && y % 6 < 2);
        return m ? "rust" : "moss";
      }
      if (y <= TEAR + 1) return "lining";
      return (x + y) % 5 === 0 ? "sky" : "rust";
    }
    function drawCell(x, y, kind, c) {
      const [sx, sy] = toScr(x, y);
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
    function marker(p, n, style, pulse) {
      const r = Math.max(7, L.c * 0.55);
      if (pulse) { g.strokeStyle = C.red; g.lineWidth = 1.5; g.globalAlpha = 0.6; g.beginPath(); g.arc(p[0], p[1], r + 4 + pulse * 8, 0, 7); g.stroke(); g.globalAlpha = 1; }
      g.fillStyle = style === "in" ? C.ink : C.bone; g.strokeStyle = style === "in" ? C.red : C.ink; g.lineWidth = 2;
      if (style === "out") g.setLineDash([3, 2]);
      g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
      g.fillStyle = style === "in" ? C.bone : C.ink; g.font = `600 ${Math.round(r * 1.1)}px 'JetBrains Mono',monospace`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(n, p[0], p[1] + 0.5);
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, c } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // dawn growing over the paper: night blue-grey to warm light as Mabel nears
      const dawn = 1 - timeLeft / (60 * speed);
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      const gr = g.createLinearGradient(0, 0, W, 0);
      gr.addColorStop(0, `rgba(86,98,122,${0.35 * (1 - dawn)})`); gr.addColorStop(1, `rgba(227,154,45,${0.32 * dawn})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // grid cells
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) drawCell(x, y, cellSym(x, y), c);
      // the open tear itself: a ragged dark gap the stitches must close
      g.fillStyle = "rgba(74,50,34,.85)";
      g.beginPath();
      const open = (x) => 1 - Math.min(1, Math.max(0, scores.length * 3.4 + 4 - x) / 3) * 0.85;
      for (let x = 0; x <= COLS; x++) { const [sx, sy] = toScr(x, TEAR + 0.5 - (0.35 + hash(x, 7) * 0.5) * open(x)); x ? g.lineTo(sx, sy) : g.moveTo(sx, sy); }
      for (let x = COLS; x >= 0; x--) { const fill = 1 - open(x); const [sx, sy] = toScr(x, TEAR + 0.5 + (0.35 + hash(x, 11) * 0.5) * (1 - fill)); g.lineTo(sx, sy); }
      g.closePath(); g.fill();
      // the Aida grid, bold every 10
      g.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) { const [sx] = toScr(x, 0); g.strokeStyle = x % 10 === 0 ? "rgba(42,33,27,.85)" : "rgba(42,33,27,.18)"; g.beginPath(); g.moveTo(sx + 0.5, L.gy); g.lineTo(sx + 0.5, L.gy + ROWS * c); g.stroke(); }
      for (let y = 0; y <= ROWS; y++) { const [, sy] = toScr(0, y); g.strokeStyle = y % 10 === 0 ? "rgba(42,33,27,.85)" : "rgba(42,33,27,.18)"; g.beginPath(); g.moveTo(L.gx, sy + 0.5); g.lineTo(L.gx + COLS * c, sy + 0.5); g.stroke(); }
      g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(L.gx, L.gy, COLS * c, ROWS * c);
      // margin counts
      g.fillStyle = C.ink; g.font = "10px 'JetBrains Mono',monospace"; g.textAlign = "center"; g.textBaseline = "bottom";
      for (let x = 0; x <= COLS; x += 10) g.fillText(String(x), L.gx + x * c, L.gy - 4);
      g.textAlign = "right"; g.textBaseline = "middle";
      for (let y = 0; y <= ROWS; y += 10) g.fillText(String(y), L.gx - 5, L.gy + y * c);
      g.fillText("▶", L.gx - 5, L.gy + (TEAR + 0.5) * c);
      // done stitches
      for (let i = 0; i < scores.length; i++) {
        const p = POINTS[i];
        stitchLine(toScr(p.inX, p.inY), toScr(p.outX, p.outY), Math.max(2.5, c * 0.32), scores[i] >= 0.7 ? C.bone : "#d9cfb8");
        if (i < scores.length - 1 || idx > i) { const q = POINTS[i + 1]; if (q) { g.strokeStyle = "rgba(246,241,228,.5)"; g.lineWidth = 1.2; g.setLineDash([3, 3]); const a = toScr(p.outX, p.outY), b = toScr(q.inX, q.inY); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + c, (a[1] + b[1]) / 2, b[0], b[1]); g.stroke(); g.setLineDash([]); } }
      }
      // the working stitch
      if (!over && idx < N) {
        const p = POINTS[idx], A = toScr(p.inX, p.inY), B = toScr(p.outX, p.outY);
        const pulse = idle > 8 && !api.reducedMotion ? (now / 600) % 1 : idle > 8 ? 0.4 : 0;
        if (phase === "in") { marker(B, idx + 1, "out", 0); marker(A, idx + 1, "in", pulse); }
        else if (phase === "drag") {
          marker(B, idx + 1, "out", pulse);
          if (ptr) { stitchLine(A, ptr, Math.max(2, c * 0.22), C.bone); }
        } else if (phase === "pull") {
          const sag = (1 - tension) * c * 1.4;
          g.strokeStyle = C.bone; g.lineWidth = Math.max(2, c * 0.24); g.lineCap = "round";
          g.beginPath(); g.moveTo(A[0], A[1]); g.quadraticCurveTo((A[0] + B[0]) / 2 + sag, (A[1] + B[1]) / 2 + sag * 0.3, B[0], B[1]); g.stroke();
          g.fillStyle = C.ink; g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top";
          g.fillText(pulling ? "pulling… let go in the band" : "hold to pull", B[0], B[1] + c);
        }
      }
      drawPanel(now);
      K.frame(draw);
    }

    function drawPanel(now) {
      const { px, py, pw, wide } = L;
      let y = py;
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = C.ink;
      const head = (t) => { g.font = "600 11px 'JetBrains Mono',monospace"; g.fillText(t, px, y); g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(px, y + 5); g.lineTo(px + pw, y + 5); g.stroke(); y += 20; };
      if (wide) {
        head("KEY");
        const keys = [["moss", "moss felt"], ["rust", "rust felt"], ["lining", "cream lining"], ["sky", "sky check"], ["torn", "torn edge"]];
        keys.forEach(([k, name]) => {
          const c0 = L.c; const save = [L.gx, L.gy, L.c];
          L.gx = px; L.gy = y - 11; L.c = 14; drawCell(0, 0, k, 14); g.strokeStyle = C.ink; g.strokeRect(px, y - 11, 14, 14);
          [L.gx, L.gy, L.c] = save; L.c = c0;
          g.fillStyle = C.ink; g.font = "11px 'JetBrains Mono',monospace"; g.fillText(name, px + 22, y);
          y += 19;
        });
        g.strokeStyle = C.ink; g.strokeRect(px, y - 8, 14, 4); g.fillText("seam (bone thread)", px + 22, y - 2); y += 26;
      }
      head("STITCH");
      g.font = "400 30px 'IM Fell English',Georgia,serif"; g.fillText(`${Math.min(idx, N)} / ${N}`, px, y + 8);
      const bx = px + 110;
      for (let i = 0; i < N; i++) {
        const x = bx + (i % 5) * 16, yy = y - 14 + Math.floor(i / 5) * 16;
        g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(x, yy, 12, 12);
        if (i < scores.length) { g.fillStyle = scores[i] >= 0.7 ? C.ink : scores[i] >= 0.4 ? C.moss : C.rust; g.fillRect(x + 2, yy + 2, 8, 8); }
      }
      y += 36;
      head("TENSION");
      const tw = Math.min(pw, 240), th = 16;
      g.fillStyle = C.bone; g.fillRect(px, y - 8, tw, th);
      g.fillStyle = C.band; g.fillRect(px + tw * BAND[0], y - 8, tw * (BAND[1] - BAND[0]), th);
      g.save(); g.beginPath(); g.rect(px + tw * 0.9, y - 8, tw * 0.1, th); g.clip();
      g.strokeStyle = C.red; g.lineWidth = 1; for (let k = -20; k < 40; k += 4) { g.beginPath(); g.moveTo(px + tw * 0.9 + k, y + 8); g.lineTo(px + tw * 0.9 + k + 16, y - 8); g.stroke(); }
      g.restore();
      g.strokeStyle = C.ink; g.strokeRect(px, y - 8, tw, th);
      const nx = px + tw * Math.min(1, tension);
      g.fillStyle = C.ink; g.beginPath(); g.moveTo(nx - 5, y - 15); g.lineTo(nx + 5, y - 15); g.lineTo(nx, y - 7); g.closePath(); g.fill();
      g.fillRect(nx - 1, y - 8, 2, th);
      g.font = "10px 'JetBrains Mono',monospace"; g.fillText("loose", px, y + 22); g.textAlign = "center"; g.fillText("pull", px + tw * (BAND[0] + BAND[1]) / 2, y + 22); g.textAlign = "right"; g.fillStyle = C.red; g.fillText("tear", px + tw, y + 22); g.textAlign = "left";
      y += 44;
      g.fillStyle = C.ink; g.font = "12px Karla,Arial,sans-serif";
      const secs = Math.max(0, Math.ceil(timeLeft));
      const warn = timeLeft < 15 * speed;
      g.fillStyle = warn ? C.red : C.ink;
      g.fillText(`Dawn: Mabel arrives in 0:${String(secs).padStart(2, "0")}`, px, y); y += 18;
      g.fillStyle = C.ink;
      const step = phase === "in" ? "1  press the dark point (in)" : phase === "drag" ? "2  drag to the dashed point (out)" : "3  hold, let go in the band (pull)";
      g.fillText(`Whip stitch, ${whose === "lila" ? "Lila's torn seam" : "your own torn seam"}`, px, y); y += 17;
      g.fillText(lockT > 0 ? "The thread tore. Rethreading…" : step, px, y); y += 17;
      if (last && now - lastT < 2500) { g.fillStyle = C.rust; g.font = "600 12px Karla,Arial,sans-serif"; g.fillText(last, px, y); }
    }

    // ---- the three inputs ----------------------------------------------------------------
    const tol = () => ({ perfect: Math.max(6, L.c * 0.45), good: Math.max(14, L.c * 1.0) });
    function acc(pt, gx, gy) {
      const [sx, sy] = toScr(gx, gy), d = Math.hypot(pt[0] - sx, pt[1] - sy), t = tol();
      return d <= t.perfect ? "perfect" : d <= t.good ? "good" : "off";
    }
    function pressIn(pt) {
      if (phase !== "in" || lockT > 0) return;
      const p = POINTS[idx];
      inAcc = pt ? acc(pt, p.inX, p.inY) : "good";
      if (pt && inAcc === "off") { const [sx, sy] = toScr(p.inX, p.inY); if (Math.hypot(pt[0] - sx, pt[1] - sy) > L.c * 4) { inAcc = null; return; } }
      phase = "drag"; idle = 0; ptr = pt || toScr(p.inX, p.inY);
    }
    function releaseOut(pt) {
      if (phase !== "drag") return;
      const p = POINTS[idx];
      outAcc = pt ? acc(pt, p.outX, p.outY) : "good";
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
      last = s === 1 ? "perfect, in band" : s === 0.7 ? "good, in band" : s === 0.4 ? "loose" : "off the point";
      lastT = performance.now();
      idx++; phase = "in"; tension = 0; idle = 0;
      if (idx >= N) finish();
    }
    function tear() {
      pulling = false; tension = 0; phase = "in"; lockT = 2; last = "too tight: the thread tore"; lastT = performance.now();
    }
    function finish() {
      over = true;
      const q = Math.round(scores.reduce((a, b) => a + b, 0) / N * 100);
      const grade = q >= 85 ? "Strong" : q >= 60 ? "Fair" : "Poor";
      const effect = whose === "lila" ? (grade === "Poor" ? "Lila's seam is closed, barely." : "Lila's hunger will rise more slowly.") : (grade === "Poor" ? "Your seam is closed, barely." : "Your seam holds one more memory.");
      const best = api.store.get("best", 0); if (q > best) api.store.set("best", q);
      K.after(500, () => api.end({ outcome: grade === "Poor" ? "done" : "win", text: `${grade} seam, ${q} percent, with ${Math.ceil(timeLeft)} s of dark left. ${effect}` }));
    }
    function lose() {
      over = true; pulling = false;
      api.end({ outcome: "lose", text: `Light at the window, Mabel's tin on the porch. ${idx} of ${N} stitches; the seam stays open.` });
    }

    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      cv.setPointerCapture(e.pointerId);
      if (phase === "in") pressIn(pt(e));
      else if (phase === "pull") startPull();
    });
    K.on(cv, "pointermove", (e) => { if (phase === "drag") ptr = pt(e); });
    K.on(cv, "pointerup", (e) => {
      if (!started || over) return;
      if (phase === "drag") releaseOut(pt(e));
      else if (pulling) endPull();
    });
    K.on(cv, "pointercancel", () => { if (pulling) endPull(); });
    // keyboard and gamepad-style assist: Enter snaps to the point (counts as good); hold Space to pull
    K.on(wrap, "keydown", (e) => {
      if (!started || over || e.repeat) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (phase === "in") pressIn(null);
        else if (phase === "drag") releaseOut(null);
        else if (phase === "pull") startPull();
      }
    });
    K.on(wrap, "keyup", (e) => { if ((e.key === " " || e.key === "Enter") && pulling) { e.preventDefault(); endPull(); } });

    let prev = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        timeLeft -= dt; idle += dt;
        if (lockT > 0) lockT -= dt;
        if (pulling) { tension += dt * 0.62 / speed; if (tension >= 1) tear(); }
        if (timeLeft <= 0) lose();
      }
      tickRaf = requestAnimationFrame(tick);
    }
    let tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>Stitchwork</h2>
      <p>A seam tore in the night. Mend it with a whip stitch before the light comes and Mabel with it: ten stitches, sixty seconds.</p>
      <p>Each stitch is three moves: <b>press</b> the dark point (in), <b>drag</b> to the dashed point (out), <b>hold</b> to pull and let go while the needle is in the green band. Too tight tears the thread. Keys: Enter, Enter, hold Space.</p>
      <button type="button" data-w="lila">Mend Lila's seam</button><button type="button" data-w="me">Mend your own</button>
      <label><input type="checkbox"> Half speed (more time, slower pull)</label></div>`;
    wrap.appendChild(intro);
    intro.querySelectorAll("button").forEach((b) => K.on(b, "click", () => {
      whose = b.dataset.w; speed = intro.querySelector("input").checked ? 2 : 1; timeLeft = 60 * speed;
      intro.remove(); started = true; wrap.focus();
    }));
    intro.querySelector("button").focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

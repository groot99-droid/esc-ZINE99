// WrymWretch · Forgetting run (2D, Graphite sketch being erased). DESIGN.md section 10, Mode B.
// One sequence: s_run_outpost, Thalen running for the outpost gates (tutorial: 3 touchstones,
// edge at 4.0 m/s, +10% each checkpoint). Ahead the path is faint outline; hold Recall to make the
// next 6 m solid for 3 s (Focus, 10 a second held). Touchstones refill +30. The blank-paper edge
// follows. Caught or fallen: back to the last checkpoint. The prototype adds a loss: the fourth
// time, the outpost is forgotten.

const PAPER = "#f1e8d6", BLANK = "#f8f3e8", GRAPHITE = "#45464a", LEAD = "#2c2d30", FAINT = "#9a958a", LAMP = "#f6d27a";
const LEN = 400, VIEW_H = 14, RUN = 6, GRAV = 30, JUMP = 11.2, EDGE0 = 4.0;

const CSS = `
.wrymwretch-forgetting-run-root{position:absolute;inset:0;background:${PAPER};overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.wrymwretch-forgetting-run-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wrymwretch-forgetting-run-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;padding:10px 12px;pointer-events:none}
.wrymwretch-forgetting-run-pad div{display:flex;gap:8px;pointer-events:auto}
.wrymwretch-forgetting-run-pad button{font:600 14px ui-monospace,Menlo,monospace;min-width:52px;min-height:46px;padding:4px 10px;color:${LEAD};background:rgba(248,243,232,.85);border:1.5px solid ${GRAPHITE};border-radius:2px;cursor:pointer;touch-action:none}
.wrymwretch-forgetting-run-pad button.on{background:${GRAPHITE};color:${BLANK}}
.wrymwretch-forgetting-run-intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(241,232,214,.8)}
.wrymwretch-forgetting-run-card{max-width:440px;background:${BLANK};border:1.5px solid ${GRAPHITE};padding:20px 22px;color:${LEAD};font:16px/1.45 Georgia,serif;box-shadow:3px 4px 0 rgba(69,70,74,.2)}
.wrymwretch-forgetting-run-card h2{font:400 22px ui-monospace,Menlo,monospace;margin:0 0 8px;letter-spacing:.04em}
.wrymwretch-forgetting-run-card p{margin:0 0 10px}
.wrymwretch-forgetting-run-card kbd{font:600 12px ui-monospace,monospace;border:1px solid ${GRAPHITE};padding:0 4px}
.wrymwretch-forgetting-run-card button{font:600 15px ui-monospace,Menlo,monospace;padding:8px 22px;background:${GRAPHITE};color:${BLANK};border:0;cursor:pointer}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-forgetting-run-root";
    wrap.innerHTML = `<style>${CSS}</style><canvas></canvas>
      <div class="wrymwretch-forgetting-run-pad">
        <div><button type="button" data-k="left" aria-label="Left">◀</button><button type="button" data-k="right" aria-label="Right">▶</button></div>
        <div><button type="button" data-k="recall">RECALL</button><button type="button" data-k="jump">JUMP</button></div>
      </div>
      <div class="wrymwretch-forgetting-run-intro"><div class="wrymwretch-forgetting-run-card">
        <h2>Forgetting run · the outpost</h2>
        <p>Run for the outpost gates before the blank page catches you. <kbd>A</kbd>/<kbd>D</kbd> move, <kbd>W</kbd> or <kbd>Space</kbd> jump.</p>
        <p>Faint outlined ground is not yet remembered: hold <kbd>Shift</kbd> (Recall) to draw the next 6 m solid for 3 s. It spends Focus; lit lanterns (touchstones) give it back. Caught or fallen four times, the outpost is forgotten.</p>
        <button type="button" data-start>Start</button></div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const intro = wrap.querySelector(".wrymwretch-forgetting-run-intro");
    const rm = api.reducedMotion;

    // ---- the level --------------------------------------------------------------------------
    const R = api.rng("wrymwretch/forgetting-run/outpost");
    const segs = [{ x0: -20, x1: 14, y: 10, kind: "solid", t: 0 }];
    const CPS = [100, 200, 300];
    let x = 14, y = 10;
    while (x < LEN + 10) {
      const gap = x < 30 ? 1.2 : 0.8 + R() * 1.9;
      x += gap;
      y = Math.max(7.5, Math.min(11.5, y + (R() - 0.5) * 2.4));
      const len = 4 + R() * 6;
      const cp = CPS.find((c) => c >= x - 2 && c < x + len + 2);
      const kind = x > LEN - 4 ? "solid" : cp ? "solid" : x < 26 ? "solid" : R() < 0.62 ? "outline" : "solid";
      segs.push({ x0: x, x1: x + len, y, kind, t: 0 });
      x += len;
    }
    const last = segs[segs.length - 1]; last.x1 = Math.max(last.x1, LEN + 12);
    const checkpoints = [{ x: 2, y: 10 }].concat(CPS.map((c) => { const sg = segs.find((s) => s.x1 > c && s.kind === "solid" && s.x0 >= c - 6) || segs[1]; return { x: sg.x0 + 1, y: sg.y }; }));
    const touch = [80, 170, 270].map((c) => { const sg = segs.find((s) => s.kind === "solid" && s.x0 > c); return { x: (sg.x0 + sg.x1) / 2, y: sg.y, lit: true }; });
    const trees = []; for (let k = 0; k < 90; k++) trees.push({ x: k * 6 + R() * 5, h: 1.4 + R() * 1.6, y: 6 + R() * 1.5 });

    // ---- state ------------------------------------------------------------------------------
    const s = { x: 2, y: 10, vx: 0, vy: 0, ground: true, focus: 100, edge: -8, edgeV: EDGE0, cp: 0, setbacks: 0, firstCatch: false,
      note: "", noteT: 0, recalling: false, wasRecalling: false, t: 0, running: false, over: false, face: 1 };
    const keys = { left: false, right: false, recall: false, jump: false };
    let W = 1, H = 1, scale = 1, dpr = 1, oy = 0;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, wrap.clientWidth); H = Math.max(1, wrap.clientHeight); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); scale = Math.min(H / VIEW_H, W / 22); oy = H - VIEW_H * scale; draw(); };
    const camX = () => s.x - (W * 0.36) / scale;
    const sx = (wx) => (wx - camX()) * scale, sy = (wy) => wy * scale + oy;
    const solid = (sg) => sg.kind === "solid" || sg.t > 0;

    function setback(caught) {
      s.setbacks++;
      if (caught && !s.firstCatch) { s.firstCatch = true; s.note = "Caught by the edge: Cedarheart memory −3"; s.noteT = 3; }
      else { s.note = caught ? "Caught. Back to the last checkpoint." : "Fell into the unremembered. Back to the last checkpoint."; s.noteT = 2.5; }
      if (s.setbacks >= 4) return finish(false);
      const c = checkpoints[s.cp];
      s.x = c.x; s.y = c.y; s.vx = 0; s.vy = 0; s.ground = true; s.edge = c.x - 12;
      segs.forEach((sg) => (sg.t = 0));
    }
    function finish(win) {
      if (s.over) return;
      s.over = true; s.running = false;
      api.end(win
        ? { outcome: "win", text: `The outpost gates ink in. Thalen is through, ${s.setbacks ? `after ${s.setbacks} setback${s.setbacks > 1 ? "s" : ""}` : "untouched by the edge"}, with ${Math.round(s.focus)} Focus left.` }
        : { outcome: "lose", text: "The blank page closes over the path a fourth time. The outpost is forgotten, and the run with it." });
    }

    function step(dt) {
      s.t += dt; s.noteT = Math.max(0, s.noteT - dt);
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) s.face = dir;
      s.vx += (dir * RUN - s.vx) * Math.min(1, (s.ground ? 12 : 5) * dt);
      if (keys.jump && s.ground) { s.vy = -JUMP; s.ground = false; }
      keys.jump = false;
      // recall
      s.recalling = keys.recall && s.focus > 0;
      if (s.recalling) {
        if (!s.wasRecalling) s.focus -= 4;
        s.focus = Math.max(0, s.focus - 10 * dt);
        for (const sg of segs) if (sg.kind === "outline" && sg.x1 > s.x - 0.5 && sg.x0 < s.x + 6) sg.t = 3;
      }
      s.wasRecalling = s.recalling;
      for (const sg of segs) if (sg.t > 0) sg.t = Math.max(0, sg.t - dt);
      // movement and landing
      const prevY = s.y;
      s.vy += GRAV * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      s.ground = false;
      for (const sg of segs) {
        if (!solid(sg) || s.x < sg.x0 - 0.2 || s.x > sg.x1 + 0.2) continue;
        if (s.vy >= 0 && prevY <= sg.y + 0.05 && s.y >= sg.y) { s.y = sg.y; s.vy = 0; s.ground = true; }
      }
      // touchstones
      for (const ts of touch) if (ts.lit && Math.abs(s.x - ts.x) < 0.9 && Math.abs(s.y - ts.y) < 1.5) { ts.lit = false; s.focus = Math.min(100, s.focus + 30); s.note = "Touchstone: Focus +30"; s.noteT = 2; }
      // checkpoints speed the edge up by 10% each
      for (let i = checkpoints.length - 1; i > s.cp; i--) if (s.x >= checkpoints[i].x) { s.cp = i; s.edgeV *= 1.1; s.note = "Checkpoint. The edge quickens."; s.noteT = 2; break; }
      s.edge += s.edgeV * dt;
      if (s.edge > s.x - 0.3) return setback(true);
      if (s.y > VIEW_H + 2) return setback(false);
      if (s.x >= LEN) finish(true);
    }

    // ---- drawing ----------------------------------------------------------------------------
    const grain = document.createElement("canvas"); grain.width = grain.height = 128;
    { const gg = grain.getContext("2d"); const r = api.rng(9); gg.fillStyle = PAPER; gg.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) { gg.fillStyle = `rgba(69,70,74,${0.03 + r() * 0.07})`; gg.fillRect(r() * 128, r() * 128, 1, 1 + r() * 2); } }
    let pattern = null;

    function hatch(x0, y0, w, h, alpha, gap = 6) {
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      g.strokeStyle = `rgba(69,70,74,${alpha})`; g.lineWidth = 1;
      g.beginPath();
      for (let k = -h; k < w; k += gap) { g.moveTo(x0 + k, y0 + h); g.lineTo(x0 + k + h, y0); }
      g.stroke();
      g.strokeStyle = `rgba(44,45,48,${alpha * 0.6})`;
      g.beginPath();
      for (let k = 0; k < w + h; k += gap * 1.7) { g.moveTo(x0 + k, y0); g.lineTo(x0 + k - h * 0.7, y0 + h); }
      g.stroke(); g.restore();
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      pattern = pattern || g.createPattern(grain, "repeat");
      g.fillStyle = pattern; g.fillRect(0, 0, W, H);
      // background pines, light pencil, parallax
      g.strokeStyle = "rgba(69,70,74,.32)"; g.lineWidth = 1.2;
      const cam = camX();
      for (const tr of trees) {
        const px = (tr.x - cam * 0.5) * scale; if (px < -30 || px > W + 30) continue;
        const by = sy(tr.y), th = tr.h * scale;
        g.beginPath(); g.moveTo(px, by); g.lineTo(px, by - th);
        for (let k = 1; k <= 3; k++) { const yy = by - th * k / 4; g.moveTo(px - th * 0.16 * (4 - k) / 2, yy + th * 0.12); g.lineTo(px, yy - th * 0.06); g.lineTo(px + th * 0.16 * (4 - k) / 2, yy + th * 0.12); }
        g.stroke();
      }
      // the far gates, inking in as Thalen nears them
      const prog = Math.max(0, Math.min(1, s.x / LEN));
      const gx = sx(LEN + 2), gy = sy(last.y);
      if (gx < W + 200) {
        const gw = 3.6 * scale, gh = 5 * scale;
        g.strokeStyle = GRAPHITE; g.setLineDash(prog < 0.98 ? [6, 5] : []); g.lineWidth = 1.5;
        g.strokeRect(gx, gy - gh, gw, gh); g.strokeRect(gx - 0.5 * scale, gy - gh - 0.6 * scale, gw + scale, 0.6 * scale);
        g.setLineDash([]);
        hatch(gx, gy - gh, gw, gh, 0.75 * prog, 5);
        g.fillStyle = `rgba(122,86,52,${0.55 * prog})`; g.fillRect(gx + gw * 0.3, gy - gh * 0.62, gw * 0.4, gh * 0.62);
      }
      // ground: remembered = dense graphite; recalled = lighter graphite; unremembered = faint outline
      for (const sg of segs) {
        const x0 = sx(sg.x0), x1 = sx(sg.x1); if (x1 < -10 || x0 > W + 10) continue;
        const top = sy(sg.y), depth = H - top;
        if (sg.kind === "solid") {
          g.fillStyle = "rgba(217,210,194,.9)"; g.fillRect(x0, top, x1 - x0, depth);
          hatch(x0, top, x1 - x0, depth, 0.55, 5);
          g.strokeStyle = LEAD; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke();
          g.lineWidth = 1; g.beginPath(); g.moveTo(x0, top); g.lineTo(x0, H); g.moveTo(x1, top); g.lineTo(x1, H); g.stroke();
        } else {
          if (sg.t > 0) {
            const a = Math.min(1, sg.t / 0.8);
            g.fillStyle = `rgba(217,210,194,${0.7 * a})`; g.fillRect(x0, top, x1 - x0, depth);
            hatch(x0, top, x1 - x0, depth, 0.4 * a, 7);
            g.strokeStyle = `rgba(44,45,48,${a})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke();
          }
          g.strokeStyle = FAINT; g.lineWidth = 1; g.setLineDash([5, 6]);
          g.strokeRect(x0, top, x1 - x0, Math.min(depth, 1.6 * scale)); g.setLineDash([]);
        }
      }
      // touchstones: lit lanterns
      for (const ts of touch) {
        const px = sx(ts.x), py = sy(ts.y) - 1.4 * scale; if (px < -40 || px > W + 40) continue;
        if (ts.lit) { const rg = g.createRadialGradient(px, py, 2, px, py, 1.6 * scale); rg.addColorStop(0, "rgba(246,210,122,.65)"); rg.addColorStop(1, "rgba(246,210,122,0)"); g.fillStyle = rg; g.fillRect(px - 2 * scale, py - 2 * scale, 4 * scale, 4 * scale); }
        g.strokeStyle = GRAPHITE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py + 0.5 * scale); g.lineTo(px, sy(ts.y)); g.stroke();
        g.fillStyle = ts.lit ? LAMP : BLANK; g.strokeRect(px - 0.25 * scale, py - 0.5 * scale, 0.5 * scale, 0.9 * scale); g.fillRect(px - 0.24 * scale, py - 0.49 * scale, 0.48 * scale, 0.88 * scale);
        if (ts.lit) { g.fillStyle = "#c98a2a"; g.beginPath(); g.ellipse(px, py, 0.08 * scale, 0.22 * scale, 0, 0, 7); g.fill(); }
      }
      // checkpoint posts
      checkpoints.slice(1).forEach((c, i) => { const px = sx(c.x - 1); if (px < -20 || px > W + 20) return; g.strokeStyle = i < s.cp ? LEAD : FAINT; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, sy(c.y)); g.lineTo(px, sy(c.y) - 2 * scale); g.lineTo(px + 0.8 * scale, sy(c.y) - 1.7 * scale); g.lineTo(px, sy(c.y) - 1.4 * scale); g.stroke(); });
      // the runner: a quick pencil figure
      {
        const px = sx(s.x), py = sy(s.y), u = scale;
        const ph = s.ground && Math.abs(s.vx) > 0.5 && !rm ? Math.sin(s.t * 14) : s.ground ? 0 : 0.6;
        g.strokeStyle = LEAD; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath();
        const hip = [px, py - 0.9 * u], neck = [px + 0.12 * u * s.face, py - 1.6 * u];
        g.moveTo(hip[0], hip[1]); g.lineTo(px + 0.4 * u * ph, py); g.moveTo(hip[0], hip[1]); g.lineTo(px - 0.4 * u * ph, py);
        g.moveTo(hip[0], hip[1]); g.lineTo(neck[0], neck[1]);
        g.moveTo(neck[0], neck[1] + 0.15 * u); g.lineTo(neck[0] - 0.4 * u * ph, neck[1] + 0.55 * u);
        g.moveTo(neck[0], neck[1] + 0.15 * u); g.lineTo(neck[0] + 0.45 * u * s.face, neck[1] + 0.2 * u - 0.2 * u * ph);
        g.stroke();
        g.beginPath(); g.arc(neck[0] + 0.05 * u * s.face, neck[1] - 0.25 * u, 0.22 * u, 0, 7); g.stroke();
        // the bow on his back
        g.lineWidth = 1.2; g.beginPath(); g.arc(neck[0] - 0.25 * u * s.face, neck[1] + 0.35 * u, 0.45 * u, -1.2, 1.2); g.stroke();
        if (s.recalling) { g.strokeStyle = "rgba(69,70,74,.5)"; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(px, py - 1.2 * u); g.lineTo(px + 6 * u, py - 1.2 * u); g.stroke(); g.setLineDash([]); }
      }
      // the edge: blank paper erasing what is behind, crumbs at its ragged line
      const ex = sx(s.edge);
      if (ex > -20) {
        const rr = api.rng(Math.floor(s.edge * 2));
        g.fillStyle = BLANK; g.beginPath(); g.moveTo(-5, -5);
        const pts = [];
        for (let yy = -5; yy <= H + 10; yy += 14) pts.push([ex + (rr() - 0.5) * 16, yy]);
        pts.forEach(([a, b]) => g.lineTo(a, b));
        g.lineTo(-5, H + 10); g.closePath(); g.fill();
        g.strokeStyle = "#b9b1a0"; g.lineWidth = 1.4; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
        g.fillStyle = "#cfc6b3";
        for (let k = 0; k < 26; k++) { const cx = ex + 4 + rr() * 26, cy = rr() * H; g.fillRect(cx, cy, 2 + rr() * 3, 2 + rr() * 3); }
      }
      // HUD
      g.font = "12px ui-monospace, Menlo, monospace"; g.fillStyle = LEAD;
      g.fillText("FOCUS", 16, 26);
      g.strokeStyle = GRAPHITE; g.lineWidth = 1; g.strokeRect(66, 16, 150, 12);
      hatch(66, 16, 150 * s.focus / 100, 12, 0.9, 3);
      g.fillStyle = LEAD; g.fillText(`GATES ${Math.round(prog * 100)}%`, 232, 26);
      g.fillText(`SETBACKS ${s.setbacks}/4`, 16, 46);
      g.fillStyle = "rgba(44,45,48,.7)"; g.fillText("hold RECALL: the next 6 m stay drawn for 3 s", 16, 64);
      if (s.noteT > 0) { g.fillStyle = `rgba(44,45,48,${Math.min(1, s.noteT)})`; g.font = "italic 16px Georgia, serif"; g.fillText(s.note, 16, 88); }
    }

    let raf = 0, lastT = 0;
    function frame(now) {
      const dt = Math.min(0.04, (now - lastT) / 1000 || 0); lastT = now;
      if (s.running) step(dt);
      draw();
      if (!s.over) raf = requestAnimationFrame(frame);
    }

    // ---- input ------------------------------------------------------------------------------
    const map = (k) => (k === "a" || k === "arrowleft" ? "left" : k === "d" || k === "arrowright" ? "right" : k === "shift" || k === "r" ? "recall" : k === "w" || k === " " || k === "arrowup" ? "jump" : null);
    const kd = (e) => { const m = map(e.key.toLowerCase()); if (!m) return; e.preventDefault(); if (m === "jump") { if (!e.repeat) keys.jump = true; } else keys[m] = true; };
    const ku = (e) => { const m = map(e.key.toLowerCase()); if (m && m !== "jump") keys[m] = false; };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    const pad = wrap.querySelector(".wrymwretch-forgetting-run-pad");
    const pd = (e) => { const b = e.target.closest("button"); if (!b) return; e.preventDefault(); keys[b.dataset.k] = true; b.classList.add("on"); };
    const pu = () => { keys.left = keys.right = keys.recall = false; pad.querySelectorAll(".on").forEach((b) => b.classList.remove("on")); };
    pad.addEventListener("pointerdown", pd);
    addEventListener("pointerup", pu); addEventListener("pointercancel", pu);

    const startBtn = wrap.querySelector("[data-start]");
    startBtn.addEventListener("click", () => { intro.remove(); s.running = true; lastT = performance.now(); });
    startBtn.focus();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro ? ro.observe(wrap) : addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        s.over = true; cancelAnimationFrame(raf);
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        removeEventListener("pointerup", pu); removeEventListener("pointercancel", pu);
        ro ? ro.disconnect() : removeEventListener("resize", resize);
        wrap.remove();
      },
    };
  },
};

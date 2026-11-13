// WrymWretch · Twin flight (2D, Ink-wash scroll). DESIGN.md section 10, Mode A.
// One sequence: Aeris on Aetherius over the Galewing Peaks. Aetherius is fast, flies highest and
// rides thermals; flaps are weak and wind is everything. Gift: turn the wind (draw a current).
// Rider: Aeris sings and the confused gusts calm for 3 s. Three scale hits per checkpoint; a fourth
// sends the pair back to the last checkpoint. The prototype adds a loss: sent back three times,
// the road is lost.

const INK = "#1c1b1a", PAPER = "#efe6d1", WASH = "#3a3936", SEAL = "#a42a1c", CURRENT = "#4a7fb0";
const COURSE = 1500;          // metres to the far peak
const CHECKS = [0, 375, 750, 1125];
const VIEW_H = 30;            // metres of sky on screen

const CSS = `
.wrymwretch-twin-flight-root{position:absolute;inset:0;background:${PAPER};overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.wrymwretch-twin-flight-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wrymwretch-twin-flight-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:8px;padding:10px 12px;pointer-events:none}
.wrymwretch-twin-flight-pad div{display:flex;gap:8px;pointer-events:auto}
.wrymwretch-twin-flight-pad button{font:600 14px 'Cormorant Garamond',Georgia,serif;letter-spacing:.06em;min-width:52px;min-height:46px;padding:4px 10px;color:${INK};background:rgba(239,230,209,.82);border:2px solid ${INK};border-radius:3px;cursor:pointer;touch-action:none}
.wrymwretch-twin-flight-pad button.on{background:${INK};color:${PAPER}}
.wrymwretch-twin-flight-pad button:disabled{opacity:.4}
.wrymwretch-twin-flight-intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,230,209,.78)}
.wrymwretch-twin-flight-card{max-width:440px;background:${PAPER};border:2px solid ${INK};padding:20px 22px;color:${INK};font:17px/1.4 'Cormorant Garamond',Georgia,serif;box-shadow:6px 6px 0 rgba(28,27,26,.25)}
.wrymwretch-twin-flight-card h2{font:700 24px 'Cinzel',Georgia,serif;margin:0 0 8px;letter-spacing:.05em}
.wrymwretch-twin-flight-card p{margin:0 0 10px}
.wrymwretch-twin-flight-card kbd{font:600 13px ui-monospace,monospace;border:1px solid ${INK};padding:0 4px;border-radius:2px}
.wrymwretch-twin-flight-card button{font:700 16px 'Cinzel',Georgia,serif;padding:8px 22px;background:${SEAL};color:${PAPER};border:0;cursor:pointer;margin-top:4px}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-twin-flight-root";
    wrap.innerHTML = `<style>${CSS}</style><canvas></canvas>
      <div class="wrymwretch-twin-flight-pad">
        <div><button type="button" data-k="up" aria-label="Pitch up">▲</button><button type="button" data-k="down" aria-label="Pitch down">▼</button></div>
        <div><button type="button" data-k="song">Song</button><button type="button" data-k="gift">Wind</button><button type="button" data-k="wing">Wing</button></div>
      </div>
      <div class="wrymwretch-twin-flight-intro"><div class="wrymwretch-twin-flight-card">
        <h2>Twin flight · Aetherius</h2>
        <p>Fly Aeris and Aetherius to the far peak. <kbd>W</kbd>/<kbd>S</kbd> pitch, <kbd>Space</kbd> beats the wings (uses stamina; gliding wins it back).</p>
        <p><kbd>E</kbd> or drag across the sky: turn the wind into a current that carries you. <kbd>Q</kbd>: Aeris sings and the gusts calm for 3 s. Four hits between seals sends you back; sent back three times, the road is lost.</p>
        <button type="button" data-start>Start</button></div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const g = cv.getContext("2d");
    const intro = wrap.querySelector(".wrymwretch-twin-flight-intro");
    const btnGift = wrap.querySelector('[data-k="gift"]'), btnSong = wrap.querySelector('[data-k="song"]');
    const rm = api.reducedMotion;

    // ---- the course -------------------------------------------------------------------------
    const R = api.rng("wrymwretch/twin-flight/galewing");
    const peaks = [], rigs = [], gusts = [], thermals = [];
    for (let x = 70; x < COURSE - 60; x += 34 + R() * 22) {
      const t = R();
      if (t < 0.45) peaks.push({ x, w: 10 + R() * 8, h: 8 + R() * 9 + x / COURSE * 3 });
      else if (t < 0.8) rigs.push({ x, len: 7 + R() * 7 + x / COURSE * 2 });
      else { const h = 7 + R() * 6; peaks.push({ x, w: 10 + R() * 6, h }); rigs.push({ x: x + 4, len: Math.min(9, 20 - h) }); }
    }
    for (let x = 160; x < COURSE - 80; x += 130 + R() * 70) gusts.push({ x, w: 26 + R() * 10, phase: R() * 6, dir: R() < 0.5 ? 1 : -1 });
    for (let x = 110; x < COURSE - 60; x += 100 + R() * 60) thermals.push({ x, w: 9 + R() * 4 });
    const ridge = (k, seed) => { const a = [R() * 6, R() * 6, R() * 6]; return (x) => Math.sin(x * 0.011 * k + a[0]) * 0.5 + Math.sin(x * 0.027 * k + a[1]) * 0.3 + Math.sin(x * 0.061 * k + a[2]) * 0.2 + seed * 0; };
    const ridges = [ridge(1, 0), ridge(1.4, 1), ridge(2, 2)];

    // ---- state ------------------------------------------------------------------------------
    const s = {
      x: 0, y: 12, vy: 0, speed: 14, stamina: 100, lastBeat: -9, hits: 0, resets: 0, cp: 0,
      inv: 0, calm: 0, songCd: 0, giftCd: 0, flap: 0, t: 0, trail: [], currents: [], drawing: null, running: false, over: false,
    };
    const keys = { up: false, down: false };
    let W = 1, H = 1, scale = 1, dpr = 1, oy = 0;

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, wrap.clientWidth); H = Math.max(1, wrap.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      scale = Math.min(H / VIEW_H, W / 42); oy = H - VIEW_H * scale;
      draw();
    }
    const camX = () => s.x - (W * 0.28) / scale;
    const sx = (x) => (x - camX()) * scale, sy = (y) => y * scale + oy;

    // ---- actions ----------------------------------------------------------------------------
    function beat() {
      if (!s.running || s.stamina < 15) return;
      s.stamina -= 15; s.vy = Math.min(s.vy, 0) - 5.5; s.lastBeat = s.t; s.flap = 1;
    }
    function song() {
      if (!s.running || s.songCd > 0) return;
      s.calm = 3; s.songCd = 8;
    }
    function gift() {
      if (!s.running || s.giftCd > 0) return;
      const ang = -0.45;
      s.currents.push({ pts: [[s.x + 1, s.y], [s.x + 1 + Math.cos(ang) * 22, s.y + Math.sin(ang) * 22]], ttl: 4 });
      s.giftCd = 5;
    }
    function hit() {
      if (s.inv > 0) return;
      s.hits++; s.inv = 1.3; s.vy = -4;
      if (s.hits > 3) {
        s.resets++;
        if (s.resets >= 3) return finish(false);
        s.x = CHECKS[s.cp]; s.y = 12; s.vy = 0; s.hits = 0; s.stamina = 100; s.inv = 2; s.trail = []; s.currents = [];
      }
    }
    function finish(win) {
      if (s.over) return;
      s.over = true; s.running = false;
      api.end(win
        ? { outcome: "win", text: `Aetherius rides the last thermal over the far peak. ${s.resets ? `Turned back ${s.resets} time${s.resets > 1 ? "s" : ""}, ` : ""}${s.hits} scale hit${s.hits === 1 ? "" : "s"} since the last seal.` }
        : { outcome: "lose", text: "Sent back a third time, the pair loses the road between the sky-cities. The scroll rolls shut." });
    }

    // ---- simulation -------------------------------------------------------------------------
    function step(dt) {
      s.t += dt;
      s.inv = Math.max(0, s.inv - dt); s.calm = Math.max(0, s.calm - dt);
      s.songCd = Math.max(0, s.songCd - dt); s.giftCd = Math.max(0, s.giftCd - dt);
      s.flap = Math.max(0, s.flap - dt * 2.5);
      if (s.t - s.lastBeat > 0.35) s.stamina = Math.min(100, s.stamina + 20 * dt);
      const target = keys.up ? -6 : keys.down ? 9 : 2.4;
      s.vy += (target - s.vy) * Math.min(1, 3.2 * dt);
      // thermals lift; gusts push up or down and reverse every 3 s
      for (const th of thermals) if (Math.abs(s.x - th.x) < th.w / 2) s.vy -= 11 * dt;
      for (const gu of gusts) {
        if (Math.abs(s.x - gu.x) < gu.w / 2 && s.calm <= 0) s.vy += gustDir(gu) * 14 * dt;
      }
      // currents carry the pair along their line
      let carried = 0;
      for (const c of s.currents) {
        c.ttl -= dt;
        for (let i = 0; i + 1 < c.pts.length; i++) {
          const [ax, ay] = c.pts[i], [bx, by] = c.pts[i + 1];
          const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
          const u = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.y - ay) * dy) / L2));
          const px = ax + dx * u, py = ay + dy * u;
          if (Math.hypot(s.x - px, s.y - py) < 2.2) {
            const L = Math.sqrt(L2);
            s.vy += ((dy / L) * 12 - s.vy) * Math.min(1, 5 * dt);
            carried = Math.max(carried, Math.max(0, dx / L) * 7);
          }
        }
      }
      s.currents = s.currents.filter((c) => c.ttl > 0);
      // speed rises with dives
      const tgtSpeed = 14 + Math.max(0, s.vy) * 0.7 - Math.max(0, -s.vy) * 0.3 + carried;
      s.speed += (tgtSpeed - s.speed) * Math.min(1, 1.5 * dt);
      s.x += s.speed * dt;
      s.y += s.vy * dt;
      if (s.y < 0.8) { s.y = 0.8; s.vy = Math.max(0, s.vy); }
      if (s.y > VIEW_H - 1) { s.y = VIEW_H - 1.5; hit(); }
      // collisions
      for (const p of peaks) {
        if (Math.abs(s.x - p.x) < p.w / 2) {
          const top = VIEW_H - p.h * (1 - Math.abs(s.x - p.x) / (p.w / 2));
          if (s.y + 0.6 > top) hit();
        }
      }
      for (const r of rigs) if (Math.abs(s.x - r.x) < 0.9 && s.y - 0.5 < r.len) hit();
      for (let i = CHECKS.length - 1; i > s.cp; i--) if (s.x >= CHECKS[i]) { s.cp = i; s.hits = 0; break; }
      s.trail.unshift([s.x, s.y]);
      if (s.trail.length > 40) s.trail.length = 40;
      if (s.x >= COURSE) finish(true);
    }
    const gustDir = (gu) => (Math.floor((s.t + gu.phase) / 3) % 2 === 0 ? gu.dir : -gu.dir);

    // ---- drawing ----------------------------------------------------------------------------
    function brush(pts, w0, w1, color, alpha = 1) {
      if (pts.length < 2) return;
      const left = [], right = [];
      for (let i = 0; i < pts.length; i++) {
        const [x, y] = pts[i], [nx, ny] = pts[Math.min(pts.length - 1, i + 1)], [px, py] = pts[Math.max(0, i - 1)];
        let dx = nx - px, dy = ny - py; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
        const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
        left.push([x - dy * w, y + dx * w]); right.push([x + dy * w, y - dx * w]);
      }
      g.globalAlpha = alpha; g.fillStyle = color; g.beginPath();
      left.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
      g.closePath(); g.fill(); g.globalAlpha = 1;
    }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#e7e1d3"); sky.addColorStop(0.6, PAPER); sky.addColorStop(1, "#e3dccb");
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      // far washes: three ridges fading into mist
      const cam = camX();
      [[0.12, 0.62, 0.16], [0.3, 0.72, 0.24], [0.55, 0.83, 0.34]].forEach(([par, base, a], li) => {
        const fn = ridges[li];
        const grad = g.createLinearGradient(0, H * (base - 0.25), 0, H);
        grad.addColorStop(0, `rgba(42,41,40,${a})`); grad.addColorStop(0.55, `rgba(42,41,40,${a * 0.35})`); grad.addColorStop(1, "rgba(239,230,209,0)");
        g.fillStyle = grad; g.beginPath(); g.moveTo(0, H);
        for (let px = 0; px <= W + 8; px += 8) {
          const wx = cam * par + px / scale;
          g.lineTo(px, H * base - fn(wx * 8) * H * (0.1 + li * 0.03));
        }
        g.lineTo(W, H); g.closePath(); g.fill();
        // mist band over each ridge
        const m = g.createLinearGradient(0, H * base - 10, 0, H * base + 40);
        m.addColorStop(0, "rgba(239,230,209,0)"); m.addColorStop(0.5, "rgba(239,230,209,.75)"); m.addColorStop(1, "rgba(239,230,209,0)");
        g.fillStyle = m; g.fillRect(0, H * base - 10, W, 50);
      });
      const vis = (x, w) => sx(x + w) > -40 && sx(x - w) < W + 40;
      // thermals: warm washes rising
      for (const th of thermals) if (vis(th.x, th.w)) {
        const x0 = sx(th.x - th.w / 2), x1 = sx(th.x + th.w / 2);
        const gr = g.createLinearGradient(x0, 0, x1, 0);
        gr.addColorStop(0, "rgba(215,154,43,0)"); gr.addColorStop(0.5, "rgba(215,154,43,.13)"); gr.addColorStop(1, "rgba(215,154,43,0)");
        g.fillStyle = gr; g.fillRect(x0, 0, x1 - x0, H);
        g.strokeStyle = "rgba(120,90,40,.35)"; g.lineWidth = 1.4;
        for (let k = 0; k < 4; k++) {
          const yy = ((H - ((s.t * (rm ? 0 : 40) + k * H / 4) % H)));
          g.beginPath(); g.moveTo(sx(th.x) - 8, yy + 14); g.quadraticCurveTo(sx(th.x) + 6, yy + 6, sx(th.x) - 2, yy - 6); g.stroke();
        }
      }
      // gusts: dry-brush strokes, chevrons show which way they push now
      for (const gu of gusts) if (vis(gu.x, gu.w)) {
        const d = gustDir(gu), calm = s.calm > 0;
        const x0 = sx(gu.x - gu.w / 2), x1 = sx(gu.x + gu.w / 2);
        g.globalAlpha = calm ? 0.18 : 0.55;
        for (let k = 0; k < 9; k++) {
          const yy = oy + (H - oy) * (0.08 + k * 0.1) + Math.sin(s.t * 2 + k) * (rm ? 0 : 4);
          brush([[x0, yy], [(x0 + x1) / 2, yy + d * 6], [x1, yy + d * 12]], 3, 0.5, WASH, calm ? 0.25 : 0.5);
        }
        g.globalAlpha = 1;
        g.strokeStyle = calm ? "rgba(28,27,26,.25)" : INK; g.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) {
          const cx = (x0 + x1) / 2, cy = oy + (H - oy) * (0.25 + k * 0.25);
          g.beginPath(); g.moveTo(cx - 10, cy - d * 6); g.lineTo(cx, cy + d * 4); g.lineTo(cx + 10, cy - d * 6); g.stroke();
        }
      }
      // peaks: the only hard ink
      for (const p of peaks) if (vis(p.x, p.w)) {
        const bx = sx(p.x), hw = (p.w / 2) * scale, top = sy(VIEW_H - p.h);
        g.fillStyle = INK; g.beginPath(); g.moveTo(bx - hw, H);
        g.lineTo(bx - hw * 0.45, top + (H - top) * 0.35); g.lineTo(bx - hw * 0.1, top + 4); g.lineTo(bx, top);
        g.lineTo(bx + hw * 0.2, top + 8); g.lineTo(bx + hw * 0.55, top + (H - top) * 0.45); g.lineTo(bx + hw, H); g.closePath(); g.fill();
        g.fillStyle = "rgba(239,230,209,.25)";
        g.beginPath(); g.moveTo(bx, top + 6); g.lineTo(bx + hw * 0.18, top + (H - top) * 0.5); g.lineTo(bx + hw * 0.05, top + (H - top) * 0.5); g.closePath(); g.fill();
        // a wind-bent pine on the summit
        brush([[bx, top], [bx + 3, top - 14], [bx + 9, top - 22]], 4, 1, INK);
        brush([[bx - 8, top - 14], [bx + 14, top - 17]], 3, 1, INK);
      }
      // torn sail rigging hanging from the sky-city above
      for (const r of rigs) if (vis(r.x, 2)) {
        const x = sx(r.x), y1 = sy(r.len);
        g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, oy); g.lineTo(x + Math.sin(s.t * 1.5 + r.x) * (rm ? 0 : 3), y1); g.stroke();
        g.fillStyle = "rgba(28,27,26,.78)";
        const fy = (f) => oy + (y1 - oy) * f;
        g.beginPath(); g.moveTo(x, fy(0.3)); g.lineTo(x + 16, fy(0.42)); g.lineTo(x + 7, fy(0.55)); g.lineTo(x + 13, fy(0.7)); g.lineTo(x, fy(0.78)); g.closePath(); g.fill();
        g.fillRect(x - 6, oy, 12, 6);
      }
      // currents
      for (const c of s.currents.concat(s.drawing ? [s.drawing] : [])) {
        const a = Math.min(1, (c.ttl ?? 4) / 1.2);
        g.strokeStyle = CURRENT; g.globalAlpha = 0.85 * a; g.lineCap = "round";
        for (let k = -1; k <= 1; k++) {
          g.lineWidth = k ? 1.5 : 3; g.setLineDash(k ? [10, 8] : []); g.lineDashOffset = rm ? 0 : -s.t * 40;
          g.beginPath(); c.pts.forEach(([x, y], i) => (i ? g.lineTo(sx(x), sy(y) + k * 7) : g.moveTo(sx(x), sy(y) + k * 7))); g.stroke();
        }
        g.setLineDash([]);
        const e = c.pts[c.pts.length - 1];
        g.lineWidth = 2; g.beginPath(); g.arc(sx(e[0]), sy(e[1]), 9, 0, Math.PI * 1.6); g.stroke();
        g.globalAlpha = 1;
      }
      // the dragon: a few strokes; the rider's blue scarf
      if (s.trail.length > 2 && !(s.inv > 0 && Math.floor(s.t * 12) % 2 === 0)) {
        const body = s.trail.filter((_, i) => i % 2 === 0).slice(0, 14).map(([x, y], i) => [sx(x) - i * 5, sy(y) + Math.sin(s.t * 6 - i * 0.6) * (rm ? 0 : 2)]);
        brush(body, 13, 1.5, INK);
        const [hx, hy] = body[0];
        g.fillStyle = INK; g.beginPath(); g.moveTo(hx + 18, hy + 1); g.lineTo(hx - 2, hy - 6); g.lineTo(hx - 2, hy + 6); g.closePath(); g.fill();
        g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hx + 4, hy - 4); g.quadraticCurveTo(hx - 6, hy - 18, hx - 18, hy - 16); g.stroke();
        g.fillStyle = PAPER; g.beginPath(); g.arc(hx + 7, hy - 1, 1.6, 0, 7); g.fill();
        const wb = body[3] || body[1];
        const lift = rm ? 0.5 : 0.5 + Math.sin(s.t * 5) * 0.25 + s.flap * 0.6;
        brush([[wb[0], wb[1]], [wb[0] - 14, wb[1] - 26 * lift], [wb[0] - 34, wb[1] - 40 * lift]], 7, 1, INK);
        brush([[wb[0] + 4, wb[1]], [wb[0] - 8, wb[1] - 18 * lift], [wb[0] - 22, wb[1] - 30 * lift]], 4, 1, "#3a3936", 0.75);
        const rb = body[2] || body[1];
        g.fillStyle = INK; g.beginPath(); g.arc(rb[0] + 2, rb[1] - 9, 3, 0, 7); g.fill();
        g.fillRect(rb[0] + 1, rb[1] - 7, 3, 6);
        brush([[rb[0] + 1, rb[1] - 7], [rb[0] - 9, rb[1] - 9], [rb[0] - 20, rb[1] - 5 + Math.sin(s.t * 9) * (rm ? 0 : 3)]], 3, 1, CURRENT);
      }
      // HUD: the ribbon with the far peak; scale hits; stamina; the seal
      const rx0 = 16, rx1 = Math.max(rx0 + 60, W - 70), ry = 26;
      g.strokeStyle = WASH; g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx0, ry); g.lineTo(rx1, ry); g.stroke();
      const pos = rx0 + (rx1 - rx0) * Math.min(1, s.x / COURSE);
      g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(rx0, ry); g.lineTo(pos, ry); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.moveTo(rx1, ry + 2); g.lineTo(rx1 + 14, ry - 16); g.lineTo(rx1 + 22, ry - 8); g.lineTo(rx1 + 30, ry - 20); g.lineTo(rx1 + 44, ry + 2); g.closePath(); g.fill();
      CHECKS.slice(1).forEach((c, i) => { const x = rx0 + (rx1 - rx0) * c / COURSE; g.fillStyle = i < s.cp ? SEAL : "rgba(164,42,28,.35)"; g.fillRect(x - 3, ry - 8, 6, 6); });
      for (let i = 0; i < 3; i++) {
        g.beginPath(); g.arc(28 + i * 26, 54, 9, 0, 7); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
        if (i < s.hits) { g.fillStyle = SEAL; g.fill(); }
      }
      g.fillStyle = WASH; g.font = "600 11px Georgia, serif"; g.fillText("SCALE HITS", 16, 78);
      g.strokeStyle = "rgba(58,57,54,.5)"; g.lineWidth = 1; g.strokeRect(16, 86, 140, 10);
      brush([[16, 91], [16 + 140 * s.stamina / 100, 91]], 9, 5, INK);
      g.fillStyle = WASH; g.fillText("STAMINA", 16, 110);
      g.fillText(`TURNED BACK ${s.resets}/3`, 16, 126);
      if (s.calm > 0) { g.fillStyle = CURRENT; g.fillText("Aeris sings: the gusts are calm", 16, 142); }
      g.fillStyle = SEAL; g.fillRect(W - 54, H - 112, 40, 40);
      g.strokeStyle = PAPER; g.lineWidth = 3; g.beginPath();
      g.moveTo(W - 46, H - 104); g.lineTo(W - 22, H - 104); g.moveTo(W - 34, H - 104); g.lineTo(W - 34, H - 80);
      g.moveTo(W - 45, H - 92); g.lineTo(W - 23, H - 92); g.moveTo(W - 44, H - 80); g.lineTo(W - 24, H - 80); g.stroke();
      btnGift.disabled = s.giftCd > 0; btnSong.disabled = s.songCd > 0;
    }

    // ---- loop -------------------------------------------------------------------------------
    let raf = 0, last = 0;
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      if (s.running) step(dt);
      draw();
      if (!s.over) raf = requestAnimationFrame(frame);
    }

    // ---- input ------------------------------------------------------------------------------
    const onKey = (e, down) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.up = down;
      else if (k === "s" || k === "arrowdown") keys.down = down;
      else if (down && (k === " " || k === "a")) beat();
      else if (down && k === "e") gift();
      else if (down && k === "q") song();
      else return;
      e.preventDefault();
    };
    const kd = (e) => { if (!e.repeat || e.key.toLowerCase() === "w" || e.key.toLowerCase() === "s") onKey(e, true); };
    const ku = (e) => onKey(e, false);
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    const pad = wrap.querySelector(".wrymwretch-twin-flight-pad");
    const padDown = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      e.preventDefault();
      const k = b.dataset.k;
      if (k === "up" || k === "down") { keys[k] = true; b.classList.add("on"); }
      else if (k === "wing") beat(); else if (k === "gift") gift(); else if (k === "song") song();
    };
    const padUp = () => { keys.up = keys.down = false; pad.querySelectorAll(".on").forEach((b) => b.classList.remove("on")); };
    pad.addEventListener("pointerdown", padDown);
    addEventListener("pointerup", padUp); addEventListener("pointercancel", padUp);
    // drag across the sky to draw a current
    const world = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale + camX(), (e.clientY - r.top - oy) / scale]; };
    const cvDown = (e) => {
      if (!s.running || s.giftCd > 0) return;
      s.drawing = { pts: [world(e)], ttl: 4 }; cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    };
    const cvMove = (e) => {
      if (!s.drawing) return;
      const p = world(e), q = s.drawing.pts[s.drawing.pts.length - 1];
      let len = 0; for (let i = 1; i < s.drawing.pts.length; i++) len += Math.hypot(s.drawing.pts[i][0] - s.drawing.pts[i - 1][0], s.drawing.pts[i][1] - s.drawing.pts[i - 1][1]);
      if (len < 26 && Math.hypot(p[0] - q[0], p[1] - q[1]) > 1.2) s.drawing.pts.push(p);
    };
    const cvUp = () => {
      if (!s.drawing) return;
      if (s.drawing.pts.length > 1) { s.currents.push(s.drawing); s.giftCd = 5; }
      s.drawing = null;
    };
    cv.addEventListener("pointerdown", cvDown); cv.addEventListener("pointermove", cvMove);
    cv.addEventListener("pointerup", cvUp); cv.addEventListener("pointercancel", cvUp);

    wrap.querySelector("[data-start]").addEventListener("click", () => { intro.remove(); s.running = true; last = performance.now(); });
    wrap.querySelector("[data-start]").focus();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro ? ro.observe(wrap) : addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        s.over = true;
        cancelAnimationFrame(raf);
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        removeEventListener("pointerup", padUp); removeEventListener("pointercancel", padUp);
        ro ? ro.disconnect() : removeEventListener("resize", resize);
        wrap.remove();
      },
    };
  },
};

// Project: Man Eater — Silhouette halls (2D, scroll). Graphic style: shadow puppetry.
// DESIGN.md section 10, Mode A, cut to one sequence (n4_halls: bunk to the officers' wing, two guards).
// Black cut-outs on a lit cream sheet. A guard's flashlight that holds Fisk's body OR his shadow for
// 1.5 s raises the alarm; the shadow is his height x 1.6 and falls ahead of him when the moonlight is
// behind. Crouching shortens it by 40%. An eater (change 33+) can climb to the pipes at 2.7 m.

const P = { ink: "#1B1D1F", cream: "#D9D2BF", snow: "#EEF1F2", print: "#7C8C99" };
const CEIL = 4.57, PIPE_Y = 2.7, LEN = 112, DOOR_X = 107;
const WINDOWS = [4, 16, 28, 40, 52, 64, 76, 88, 100];
const PIPES = [[18, 37], [56, 80], [86, 101]];
const POOLS = [[30, 2.4], [67, 2.4], [95, 2.2]];
const DRAINS = [13, 47, 73, 90];
const ALCOVES = [[9, 1.3], [23, 1.3], [34, 1.3], [45, 1.3], [52, 1.3], [61, 1.3], [70, 1.3], [83, 1.3], [98, 1.3]];
const JUNCTIONS = [2, 42, 78];
const GUARDS = [
  { a: 25, b: 44, x: 40, dir: -1 },
  { a: 58, b: 88, x: 62, dir: 1 },
];

export default {
  mount(root, api) {
    const K = "man-eater-silhouette-halls-";
    const reduce = api.reducedMotion;
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;background:${P.ink};color:${P.cream};font-family:'Courier Prime','Courier New',monospace;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .${K}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,29,31,.82);z-index:3;padding:16px}
      .${K}panel{max-width:560px;background:${P.cream};color:${P.ink};padding:22px 22px 18px;box-shadow:0 20px 50px rgba(0,0,0,.6)}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:28px;letter-spacing:.06em;text-transform:uppercase}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      .${K}panel .${K}keys{font-size:12.5px;color:#4a4a44}
      .${K}row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
      .${K}row button,.${K}pad button{font:inherit;font-weight:700;background:${P.ink};color:${P.cream};border:0;padding:11px 14px;cursor:pointer;letter-spacing:.04em}
      .${K}row button:focus-visible,.${K}pad button:focus-visible{outline:3px solid #D9A441;outline-offset:2px}
      .${K}row button small{display:block;font-weight:400;opacity:.75;font-size:11.5px}
      .${K}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:8px;padding:10px 12px;z-index:2;pointer-events:none}
      .${K}pad div{display:flex;gap:8px;pointer-events:auto}
      .${K}pad button{min-width:54px;min-height:48px;background:rgba(27,29,31,.78);border:1px solid rgba(217,210,191,.45);font-size:13px;touch-action:none}
      .${K}pad button.on{background:${P.cream};color:${P.ink}}
      @media (pointer:fine) and (min-width:900px){.${K}pad{opacity:.55}}
      @media (max-width:520px){.${K}pad{padding:8px;gap:6px}.${K}pad div{gap:4px}.${K}pad button{min-width:44px;padding:6px 6px;font-size:11.5px}}
    </style>
    <canvas aria-label="Side view of a tall hall at night, drawn as shadow puppetry"></canvas>
    <div class="${K}pad" aria-hidden="false">
      <div><button data-k="left" aria-label="Walk west">◀</button><button data-k="right" aria-label="Walk east">▶</button></div>
      <div><button data-k="down" aria-label="Crouch (hold)">Crouch</button><button data-k="up" aria-label="Climb or drop">Climb</button><button data-k="listen" aria-label="Listen (hold)">Listen</button><button data-k="act" aria-label="Open door">Open</button></div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <h2>Silhouette halls</h2>
      <p>Night 4. Walk from the bunk to the officers' wing door at the east end. Guards' flashlights catch your body <b>or your shadow</b>; 1.5 seconds held in the light and you are walked back.</p>
      <p>Crouch to shorten the shadow; crouched in a door alcove, you and your shadow are out of the light. An eater is tall enough to climb to the pipes, but his shadow is longer and the call behind him slows him.</p>
      <p class="${K}keys">Arrows or A/D walk · S crouch · W climb or drop · hold Space to listen · E opens the door. Two retries from the last junction.</p>
      <div class="${K}row">
        <button data-c="8">Start as a refuser<small>change 8 · 1.91 m · no climbing</small></button>
        <button data-c="52">Start as an eater<small>change 52 · 2.61 m · climbs, longer shadow</small></button>
      </div>
    </div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const intro = wrap.querySelector("." + K + "intro");

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const ro = new ResizeObserver(resize);

    // ---- state
    let change = 8, heightM = 1.91, strength = 54;
    let s = null; // run state
    let running = false, over = false, raf = 0, last = 0;
    const keys = { left: false, right: false, down: false, listen: false };
    const timeouts = [];

    function newRun(c) {
      change = c;
      heightM = 1.78 + 0.016 * change;
      strength = 50 + 0.5 * change;
      s = {
        x: 2, onPipe: false, facing: 1, step: 0, warmth: 100, retries: 2, checkpoint: 2,
        guards: GUARDS.map((g) => ({ ...g, seen: 0, pause: 0, paused: false, pausePt: g.a + rng() * (g.b - g.a), step: 0 })),
        listen: 0, drainOn: -1, msg: "", msgT: 0, flash: 0, t: 0,
      };
    }
    function resetToCheckpoint() {
      s.x = s.checkpoint; s.onPipe = false; s.drainOn = -1;
      s.guards = GUARDS.map((g) => ({ ...g, seen: 0, pause: 0, paused: false, pausePt: g.a + rng() * (g.b - g.a), step: 0 }));
    }
    const say = (m, t = 3) => { s.msg = m; s.msgT = t; };

    // ---- geometry helpers
    const crouched = () => keys.down && !s.onPipe;
    const pipeAt = (x) => PIPES.some(([a, b]) => x >= a && x <= b);
    const alcoveAt = (x) => ALCOVES.some(([a, w]) => x >= a && x <= a + w);
    const poolAt = (x) => POOLS.some(([a, w]) => x >= a && x <= a + w);
    const nearestWindow = (x) => WINDOWS.reduce((b, w) => (Math.abs(w - x) < Math.abs(b - x) ? w : b), WINDOWS[0]);
    function bodyBase() { return s.onPipe ? PIPE_Y + 0.08 : 0; }
    function bodyH() { return s.onPipe ? heightM * 0.45 : crouched() ? heightM * 0.6 : heightM; }
    function shadowGeom() {
      // moonlight from the window nearest him, high on the wall: the shadow falls away from it
      const wx = nearestWindow(s.x);
      let dx = (s.x - wx) * 0.9;
      dx = Math.max(-3.6, Math.min(3.6, dx));
      if (Math.abs(dx) < 0.4) dx = 0.4 * Math.sign(dx || 1);
      const len = Math.min(CEIL - bodyBase(), heightM * 1.6 * (crouched() ? 0.6 : 1) * (s.onPipe ? 0.6 : 1));
      return { foot: s.x + dx * 0.25, top: s.x + dx, base: bodyBase(), len };
    }
    function inCone(g, px, py) {
      const lx = g.x + g.dir * 0.35, ly = 1.3;
      const vx = px - lx, vy = py - ly;
      const d = Math.hypot(vx, vy);
      if (d > 10 || d < 0.05 || vx * g.dir <= 0) return false;
      const ang = Math.atan2(vy, Math.abs(vx));
      return Math.abs(ang - -0.14) < 0.28;
    }

    // ---- update
    function update(dt) {
      s.t += dt;
      if (s.msgT > 0) s.msgT -= dt;
      if (s.flash > 0) s.flash -= dt;
      // movement
      let v = 0;
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) {
        let sp = s.onPipe ? 0.6 : crouched() ? 0.6 : 1.4 + 0.008 * strength;
        if (change >= 40 && dir > 0) sp *= 0.7; // walking away from the call, which is behind him
        v = dir * sp;
        s.facing = dir;
      }
      let nx = Math.max(0.5, Math.min(LEN - 1, s.x + v * dt));
      if (s.onPipe && !pipeAt(nx)) { s.onPipe = false; say("You drop from the pipe."); }
      s.x = nx;
      s.step += Math.abs(v) * dt * 2.2;
      // checkpoints
      for (const j of JUNCTIONS) if (s.x >= j && j > s.checkpoint) { s.checkpoint = j; say("Hall junction. Retries resume here.", 2.2); }
      // drains
      const di = DRAINS.findIndex((d) => Math.abs(d - s.x) < 0.45);
      if (!s.onPipe && di >= 0 && di !== s.drainOn) { s.warmth -= 10; s.flash = 0.4; say("A floor drain. Cold comes up through it. Warmth −10."); }
      s.drainOn = s.onPipe ? -1 : di;
      // warmth drain in the halls: 12 − change/10 per minute
      s.warmth -= ((12 - change / 10) / 60) * dt;
      if (s.listen > 0) s.listen -= dt;
      if (keys.listen) s.listen = 2;
      // guards
      const sh = shadowGeom();
      // crouched in a door recess, body and shadow both fall on the door, out of the hall's light
      const hidden = alcoveAt(s.x) && crouched();
      const base = bodyBase(), bh = bodyH();
      const bodyPts = hidden ? [] : [[s.x, base + bh * 0.92], [s.x, base + bh * 0.55], [s.x, base + bh * 0.15]];
      const shPts = hidden ? [] : [0.25, 0.5, 0.75, 1].map((f) => [sh.foot + (sh.top - sh.foot) * f, sh.base + sh.len * f]);
      for (const g of s.guards) {
        if (g.pause > 0) { g.pause -= dt; }
        else {
          g.x += g.dir * 1.1 * dt; g.step += 1.1 * dt * 2.2;
          if (!g.paused && Math.abs(g.x - g.pausePt) < 0.1) { g.paused = true; g.pause = 2 + rng() * 2; }
          if (g.x > g.b) { g.x = g.b; g.dir = -1; g.paused = false; g.pausePt = g.a + rng() * (g.b - g.a); }
          if (g.x < g.a) { g.x = g.a; g.dir = 1; g.paused = false; g.pausePt = g.a + rng() * (g.b - g.a); }
        }
        let hit = false, by = "";
        if (bodyPts.some(([px, py]) => inCone(g, px, py))) { hit = true; by = "body"; }
        else if (shPts.some(([px, py]) => inCone(g, px, py))) { hit = true; by = "shadow"; }
        else if (!s.onPipe && poolAt(s.x) && (s.x - g.x) * g.dir > 0 && Math.abs(s.x - g.x) < 14) { hit = true; by = "pool"; }
        if (hit) { g.seen += dt; g.by = by; } else g.seen = Math.max(0, g.seen - dt * 0.6);
        if (g.seen >= 1.5) return caught(g.by === "shadow" ? "He saw your shadow first." : g.by === "pool" ? "You stood in the light from a door pane." : "The flashlight held you.");
      }
      if (s.warmth <= 0) return caught("The cold took your legs.");
      // the door
      if (s.x >= DOOR_X - 1.2 && s.msgT <= 0) say("The officers' wing door. Press E (or Open).", 1);
    }
    function caught(why) {
      if (s.retries > 0) {
        s.retries--;
        say(`${why} Retry from the junction (${s.retries} left).`, 3.5);
        s.flash = 0.6;
        resetToCheckpoint();
        return;
      }
      finish(false, `${why} Two orderlies walk Fisk back to the bunk. Suspicion +20; the curfew break is logged as seen.`);
    }
    function finish(win, text) {
      if (over) return;
      over = true; running = false;
      cancelAnimationFrame(raf);
      draw();
      api.end({ outcome: win ? "win" : "lose", text });
    }
    function act() {
      if (!running) return;
      if (s.x >= DOOR_X - 1.2 && !s.onPipe) {
        finish(true, `The officers' wing. You reached the door with ${Math.round(s.warmth)} warmth and ${s.retries} retries left. ${change >= 33 ? "You came most of the way above the light." : "You came the whole way on the floor, short and slow."}`);
      }
    }
    function climb() {
      if (!running) return;
      if (s.onPipe) { s.onPipe = false; say("You drop to the floor."); return; }
      if (!pipeAt(s.x)) { say("No pipe overhead here."); return; }
      if (heightM < 2.3) { say("The pipes are at 2.7 m. You cannot reach them. You are not tall enough yet."); return; }
      s.onPipe = true; say("You pull yourself up onto the pipes, out of the light.");
    }

    // ---- drawing
    function fig(x, base, h, stride, color, opts = {}) {
      // a cut-out walking man (after pictographs/make.py _fig), feet at (x, base), height h px
      const k = h / 180, st = reduce ? 0 : stride, face = opts.face || 1;
      ctx.fillStyle = color;
      const poly = (pts) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(x + a * face, base - b) : ctx.moveTo(x + a * face, base - b))); ctx.closePath(); ctx.fill(); };
      const crouch = opts.crouch ? 0.62 : 1;
      const Y = (v) => v * k * crouch;
      poly([[-27 * k, Y(152)], [27 * k, Y(152)], [20 * k, Y(86)], [-20 * k, Y(86)]]);
      poly([[-9 * k + 4 * k, Y(160)], [9 * k + 4 * k, Y(160)], [9 * k + 4 * k, Y(148)], [-9 * k + 4 * k, Y(148)]]);
      for (const sg of [-1, 1]) {
        const a = st * sg;
        const hip = [8 * k * sg * 0.4, Y(90)];
        const knee = [hip[0] + Math.sin(a) * 45 * k + (opts.crouch ? 14 * k : 0), Y(48)];
        const foot = [knee[0] + Math.sin(a * 0.6) * 40 * k - (opts.crouch ? 10 * k : 0), 0];
        poly([[hip[0] - 13 * k, hip[1]], [hip[0] + 13 * k, hip[1]], [knee[0] + 11 * k, knee[1]], [foot[0] + 20 * k, foot[1]], [foot[0] - 9 * k, foot[1]], [knee[0] - 11 * k, knee[1]]]);
      }
      for (const sg of [-1, 1]) {
        const a = -st * sg * 0.8 + (opts.arm && sg === 1 ? -1.3 : 0);
        const sh = [18 * k * sg * 0.6, Y(145)];
        const el = [sh[0] + Math.sin(a) * 30 * k, Y(145) - Math.cos(a) * 30 * k];
        const hd = [el[0] + Math.sin(a) * 28 * k, el[1] - Math.cos(a) * 28 * k];
        poly([[sh[0] - 10 * k, sh[1]], [sh[0] + 10 * k, sh[1]], [el[0] + 8 * k, el[1]], [hd[0] + 7 * k, hd[1]], [hd[0] - 7 * k, hd[1]], [el[0] - 8 * k, el[1]]]);
      }
      ctx.beginPath(); ctx.arc(x + 4 * k * face, base - Y(168), 18 * k, 0, Math.PI * 2); ctx.fill();
      if (opts.cap) { ctx.fillRect(x - 20 * k + 4 * k * face, base - Y(182), 40 * k, 7 * k); }
    }

    function draw() {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
      if (!s) newRun(8);
      const hudH = 48, padH = 72, capH = 46;
      const avail = H - hudH - padH - capH - 16;
      const scale = Math.min(avail / (CEIL + 0.45), W / Math.max(13, Math.min(19, W / 60)));
      const floorY = hudH + 8 + (avail - (CEIL + 0.45) * scale) / 2 + (CEIL + 0.2) * scale;
      const viewM = W / scale;
      let camX = s.x - viewM * 0.38;
      camX = Math.max(0, Math.min(LEN - viewM, camX));
      const sx = (m) => (m - camX) * scale;
      const sy = (m) => floorY - m * scale;
      // the sheet: cream, moonlit high up by the windows
      const top = sy(CEIL);
      ctx.fillStyle = "#b8b1a0"; ctx.fillRect(0, top, W, floorY - top);
      for (const w of WINDOWS) {
        const cx = sx(w);
        if (cx < -scale * 6 || cx > W + scale * 6) continue;
        const g = ctx.createRadialGradient(cx, sy(3.5), 4, cx, sy(2.2), scale * 5.5);
        g.addColorStop(0, "rgba(238,241,242,.95)"); g.addColorStop(0.45, "rgba(217,210,191,.75)"); g.addColorStop(1, "rgba(217,210,191,0)");
        ctx.fillStyle = g; ctx.fillRect(cx - scale * 6, top, scale * 12, floorY - top);
        ctx.fillStyle = "rgba(238,241,242,.95)";
        ctx.fillRect(cx - scale * 0.45, sy(3.85), scale * 0.9, scale * 0.65);
        ctx.strokeStyle = "rgba(27,29,31,.35)"; ctx.lineWidth = 1;
        ctx.strokeRect(cx - scale * 0.45, sy(3.85), scale * 0.9, scale * 0.65);
      }
      // alcoves and doors (two handles: the high steel lever and the later brass knob)
      for (const [a, w] of ALCOVES) {
        const x0 = sx(a); if (x0 > W || x0 + w * scale < 0) continue;
        ctx.fillStyle = "rgba(27,29,31,.22)"; ctx.fillRect(x0, sy(3.2), w * scale, 3.2 * scale);
        ctx.strokeStyle = "rgba(27,29,31,.55)"; ctx.lineWidth = 2; ctx.strokeRect(x0 + 3, sy(3.1), w * scale - 6, 3.1 * scale);
        ctx.fillStyle = P.ink; ctx.fillRect(x0 + w * scale - 12, sy(2.4), 8, 3); ctx.beginPath(); ctx.arc(x0 + w * scale - 10, sy(1.1), 3, 0, 7); ctx.fill();
      }
      // the target door
      { const x0 = sx(DOOR_X - 0.6); ctx.fillStyle = "rgba(27,29,31,.75)"; ctx.fillRect(x0, sy(3.6), 1.3 * scale, 3.6 * scale);
        ctx.fillStyle = P.cream; ctx.font = `700 ${Math.max(9, scale * 0.16)}px 'Stardos Stencil',monospace`; ctx.textAlign = "center";
        ctx.fillText("OFFICERS", x0 + 0.65 * scale, sy(2.9)); ctx.fillText("WING", x0 + 0.65 * scale, sy(2.65)); ctx.textAlign = "start"; }
      // pipes
      for (const [a, b] of PIPES) {
        ctx.fillStyle = P.ink; ctx.fillRect(sx(a), sy(PIPE_Y + 0.07), (b - a) * scale, Math.max(4, scale * 0.12));
        for (let m = a; m <= b; m += 2.5) ctx.fillRect(sx(m) - 2, sy(PIPE_Y + 0.25), 4, scale * 0.25);
      }
      // floor, pools, drains
      ctx.fillStyle = "#2a2c2e"; ctx.fillRect(0, floorY, W, H - floorY);
      for (const [a, w] of POOLS) {
        const cx = sx(a + w / 2);
        const g = ctx.createRadialGradient(cx, floorY, 2, cx, floorY, w * scale * 0.7);
        g.addColorStop(0, "rgba(238,241,242,.85)"); g.addColorStop(1, "rgba(238,241,242,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, floorY + 4, w * scale * 0.7, 9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(238,241,242,.5)"; ctx.fillRect(cx - scale * 0.25, sy(2.3), scale * 0.5, scale * 0.45);
      }
      for (const d of DRAINS) { const cx = sx(d); ctx.fillStyle = P.print; for (let i = -3; i <= 3; i++) ctx.fillRect(cx + i * 4 - 1, floorY + 2, 2, 6); }
      // guards' cones (behind the figures), then shadows, then cut-outs
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, floorY - top + 3); ctx.clip();
      for (const g of s.guards) {
        const lx = sx(g.x + g.dir * 0.35), ly = sy(1.3), len = 10 * scale;
        const a0 = 0.14 - 0.28, a1 = 0.14 + 0.28; // downward aim in screen space
        const gr = ctx.createLinearGradient(lx, ly, lx + g.dir * len, ly);
        const hot = g.seen > 0 ? 0.95 : 0.8;
        gr.addColorStop(0, `rgba(238,241,242,${hot})`); gr.addColorStop(1, "rgba(238,241,242,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(lx, ly);
        ctx.lineTo(lx + g.dir * Math.cos(a0) * len, ly + Math.sin(a0) * len);
        ctx.lineTo(lx + g.dir * Math.cos(a1) * len, ly + Math.sin(a1) * len); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // Fisk's shadow: the second, taller body on the sheet
      const sh = shadowGeom();
      ctx.save();
      if (!reduce) ctx.filter = "blur(3px)";
      const fh = heightM * scale * (crouched() ? 1 : 1);
      ctx.translate(sx(sh.foot), sy(sh.base));
      ctx.transform(1, 0, -((sh.top - sh.foot) * scale) / (sh.len * scale), 1, 0, 0);
      ctx.globalAlpha = 0.42;
      fig(0, 0, sh.len * scale * (crouched() ? 1 / 0.62 : 1), Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing });
      ctx.restore();
      for (const g of s.guards) {
        const gs = Math.max(-3, Math.min(3, (g.x - nearestWindow(g.x)) * 0.9));
        ctx.save(); if (!reduce) ctx.filter = "blur(3px)"; ctx.globalAlpha = 0.3;
        ctx.translate(sx(g.x + gs * 0.25), floorY); ctx.transform(1, 0, -(gs * 0.75) / (1.8 * 1.6), 1, 0, 0);
        fig(0, 0, 1.8 * 1.6 * scale, Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true }); ctx.restore();
      }
      // the cut-outs
      for (const g of s.guards) {
        fig(sx(g.x), floorY, 1.8 * scale, g.pause > 0 ? 0 : Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true });
        if (g.seen > 0.05) {
          const r = 10 + 10 * Math.min(1, g.seen / 1.5);
          ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(g.x), sy(2.25), r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, g.seen / 1.5)); ctx.stroke();
          ctx.fillStyle = P.ink; ctx.font = "700 14px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText("?", sx(g.x), sy(2.25) + 5); ctx.textAlign = "start";
        }
      }
      if (s.onPipe) {
        ctx.save(); ctx.translate(sx(s.x), sy(PIPE_Y + 0.08)); fig(0, 0, heightM * scale * 0.75, Math.sin(s.step) * 0.3, P.ink, { crouch: true, face: s.facing }); ctx.restore();
      } else {
        fig(sx(s.x), floorY, fh, Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing });
      }
      // listening: footfalls as marks on the floor line, even off the sheet
      if (s.listen > 0) {
        ctx.fillStyle = P.snow; ctx.font = "12px 'Courier Prime',monospace";
        for (const [gi, g] of s.guards.entries()) {
          const gx = sx(g.x);
          const cx = Math.max(14, Math.min(W - 14, gx));
          for (let i = 0; i < 3; i++) ctx.fillRect(cx - g.dir * i * 9 - 3, floorY + 3 + (i % 2) * 4, 6, 3);
          if (gx < 0 || gx > W) { ctx.textAlign = gx < 0 ? "left" : "right"; ctx.fillStyle = P.ink; ctx.fillText(`${gx < 0 ? "◀ " : ""}${Math.round(Math.abs(g.x - s.x))} m${gx > W ? " ▶" : ""}`, gx < 0 ? 8 : W - 8, floorY - 8 - gi * 16); ctx.fillStyle = P.snow; ctx.textAlign = "start"; }
        }
      }
      // cold flash
      if (s.flash > 0) { ctx.fillStyle = `rgba(124,140,153,${Math.min(0.45, s.flash)})`; ctx.fillRect(0, top, W, floorY - top); }
      // proscenium frame
      ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, top); ctx.fillRect(0, floorY + Math.max(14, scale * 0.35), W, H);
      // HUD: the hall as drawn on Floor Plan
      const sx0 = 14, sw = W - 28;
      ctx.strokeStyle = "rgba(217,210,191,.55)"; ctx.lineWidth = 1; ctx.strokeRect(sx0, 10, sw, 12);
      for (const j of JUNCTIONS) { ctx.fillStyle = "rgba(217,210,191,.55)"; ctx.fillRect(sx0 + (j / LEN) * sw, 8, 1, 16); }
      ctx.fillStyle = "#D9A441"; ctx.fillRect(sx0 + (DOOR_X / LEN) * sw - 3, 8, 6, 16);
      ctx.fillStyle = P.cream; ctx.fillRect(sx0 + (s.x / LEN) * sw - 2, 12, 4, 8);
      ctx.font = "11px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.8)";
      ctx.fillText(`BUNK`, sx0, 36); ctx.textAlign = "right"; ctx.fillText(`OFFICERS' WING`, sx0 + sw, 36); ctx.textAlign = "start";
      // breath line = warmth
      const bw = Math.max(0, s.warmth) / 100 * Math.min(160, W * 0.3);
      ctx.fillStyle = P.snow; ctx.fillRect(W / 2 - bw / 2, 32, bw, 2);
      // caption band
      const cy = H - padH - capH + 14;
      ctx.fillStyle = P.cream; ctx.font = `${W < 480 ? 11 : 13}px 'Courier Prime',monospace`;
      const cap = s.msgT > 0 ? s.msg : `NIGHT 4 / BUNK TO OFFICERS' WING / CHANGE ${change} · ${heightM.toFixed(2)} M · SHADOW ${(Math.min(CEIL, heightM * 1.6 * (crouched() ? 0.6 : 1))).toFixed(1)} M`;
      ctx.fillText(cap.toUpperCase(), 16, cy, W - 32);
      ctx.fillStyle = "rgba(217,210,191,.6)"; ctx.font = "11px 'Courier Prime',monospace";
      ctx.fillText(`warmth ${Math.max(0, Math.round(s.warmth))} · retries ${s.retries}${change >= 40 ? " · the call is behind you: east is 30% slower" : ""}`, 16, cy + 18, W - 32);
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      update(dt);
      if (running) draw();
      if (running) raf = requestAnimationFrame(frame);
    }
    function start(c) {
      newRun(c);
      intro.remove();
      running = true; over = false; last = performance.now();
      say(c >= 33 ? "Your shadow reaches high up the sheet. The pipes are within reach." : "Short and slow. Use the alcoves.", 3);
      raf = requestAnimationFrame(frame);
      cv.focus?.();
    }

    // ---- input
    const keymap = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowDown: "down", s: "down", S: "down", " ": "listen", l: "listen", L: "listen" };
    const onKey = (e) => {
      if (!running) return;
      const k = keymap[e.key];
      if (k) { keys[k] = e.type === "keydown"; e.preventDefault(); return; }
      if (e.type !== "keydown") return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { climb(); e.preventDefault(); }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") { act(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const padBtns = [...wrap.querySelectorAll("." + K + "pad button")];
    const padDown = (e) => {
      const k = e.currentTarget.dataset.k; e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ok */ }
      if (k === "up") return climb();
      if (k === "act") return act();
      keys[k] = true; e.currentTarget.classList.add("on");
    };
    const padUp = (e) => { const k = e.currentTarget.dataset.k; if (k in keys) keys[k] = false; e.currentTarget.classList.remove("on"); };
    for (const b of padBtns) { b.addEventListener("pointerdown", padDown); b.addEventListener("pointerup", padUp); b.addEventListener("pointercancel", padUp); b.addEventListener("lostpointercapture", padUp); }
    const blur = () => { for (const k in keys) keys[k] = false; };
    window.addEventListener("blur", blur);
    for (const b of intro.querySelectorAll("button[data-c]")) b.addEventListener("click", () => start(+b.dataset.c));

    ro.observe(wrap);
    resize();
    timeouts.push(setTimeout(() => intro.querySelector("button")?.focus(), 30));

    return {
      unmount() {
        running = false; over = true;
        cancelAnimationFrame(raf);
        timeouts.forEach(clearTimeout);
        ro.disconnect();
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup", onKey);
        window.removeEventListener("blur", blur);
        for (const b of padBtns) { b.removeEventListener("pointerdown", padDown); b.removeEventListener("pointerup", padUp); b.removeEventListener("pointercancel", padUp); b.removeEventListener("lostpointercapture", padUp); }
        wrap.remove();
      },
    };
  },
};

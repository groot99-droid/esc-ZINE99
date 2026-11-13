// The Lord of the Sea: The Deep (2D, deep-sea naturalist lithograph).
// One dive cut from DESIGN.md section 10, after `d-first-dive`: down 80 m to the sunken tender,
// free the strongbox from the hull (hold Grip), carry it up (carrying halves speed; stirred
// currents help). No air: the pull, a soft timer shown as the plate's edges darkening. At zero the
// deep keeps him and the dive is lost. Hazards: a dredge chain that sweeps (contact pushes him
// back), a Company net (slows to 20% until cut by gripping and pulling), a cold current at 40-55 m.
// Stir: draw a circle (or hold E) and a 10 m ribbon of current runs the way the circle last turned.
// Three phases: the descent (net, chain, cold current), the tender (grip three seconds while the hull
// settles), and the ascent, when the Company drops a second net across the way up and the dredge
// sweeps faster. Beats and the Voice Beside lines are written for the game (refine additions list).

const PLATE = "#0B1424", INKBLUE = "#1F2E4A", FOAM = "#E8F2EE", PAPER = "#F4F1E8", GOLD = "#E7A93B", GREEN = "#2F6B5E", VIOLET = "#4B3F63", RED = "#8C2B2B";
const WORLD_W = 150, FLOOR = 92, WRECK_X = 112, WRECK_Y = 85;
const PULL_BASE = 120;               // seconds: the later dives' 120 (DESIGN.md section 10), so a browser dive can be finished
const FREE_S = 3;               // seconds of grip to work the strongbox free
const BEATS = [
  { id: "light", y: 20, voice: true, text: "The light thinned to blue. He did not reach for air; there was none he needed." },
  { id: "dark", y: 60, text: "Below sixty metres only what glows gives light, and what he stirs." },
  { id: "voice", y: 75, voice: true, text: "The deep knew him. It wanted to keep us, gently, the way it keeps everything." },
];
const STIR_SPEED = 3;           // Current tier: 3 m/s, carries a person

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-deep-";
    const reduce = api.reducedMotion;
    const gentle = (+api.store.get("losses", 0) || 0) >= 2;
    const PULL = gentle ? 150 : PULL_BASE;
    root.innerHTML = `
    <style>
      .${P}wrap { position:absolute; inset:0; background:${PLATE}; color:${FOAM}; font-family:'IM Fell English',Georgia,serif; overflow:hidden; touch-action:none; user-select:none; }
      .${P}wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .${P}pad { position:absolute; right:12px; bottom:12px; display:flex; gap:8px; }
      .${P}pad button { font:inherit; font-size:16px; color:${FOAM}; background:rgba(11,20,36,.7); border:1px solid ${FOAM}; border-radius:50%; width:64px; height:64px; cursor:pointer; touch-action:none; }
      .${P}pad button.on { background:${FOAM}; color:${PLATE}; }
      .${P}pad button .cd { position:absolute; left:0; bottom:0; height:4px; background:${GOLD}; border-radius:2px; }
      .${P}pad button { position:relative; overflow:hidden; }
      .${P}pad button[hidden] { display:none; }
      .${P}cap { position:absolute; left:50%; top:96px; transform:translateX(-50%); width:min(560px,calc(100% - 90px)); box-sizing:border-box; text-align:center; padding:8px 14px;
        background:rgba(11,20,36,.86); border:1px solid rgba(232,242,238,.5); font-size:16px; line-height:1.35; color:${FOAM}; pointer-events:none; opacity:0; transition:opacity .5s; }
      .${P}cap.show { opacity:1; }
      .${P}cap.voice { font-style:italic; color:#7FE0C2; border-color:#7FE0C2; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(5,9,15,.8); padding:14px; z-index:3; overflow:auto; }
      .${P}label { position:relative; max-width:520px; box-sizing:border-box; margin:8px; background:#ece6d6; color:#1b2230; padding:18px 22px 16px; border:1px solid #9a8f74;
        box-shadow:0 0 0 6px #0b1424, 0 0 0 7px rgba(232,242,238,.45), 0 12px 30px rgba(0,0,0,.6);
        background-image: radial-gradient(rgba(60,50,30,.10) 1px, transparent 1.3px); background-size:5px 5px; }
      .${P}label .cap2 { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.18em; font-size:13px; display:flex; justify-content:space-between; border-bottom:1px solid #1b2230; padding-bottom:4px; }
      .${P}label h2 { font-weight:400; font-size:clamp(26px,5vw,32px); margin:8px 0 2px; font-style:italic; }
      .${P}label .goal { font-size:17px; line-height:1.35; margin:0 0 8px; }
      .${P}label .open { font-size:15px; line-height:1.4; margin:0 0 10px; color:#3d4659; }
      .${P}figs { list-style:none; margin:0 0 10px; padding:8px 0 0; border-top:1px solid rgba(27,34,48,.4); display:grid; gap:6px; font-size:15px; line-height:1.3; }
      .${P}figs li { display:grid; grid-template-columns:58px minmax(0,1fr); gap:8px; }
      .${P}figs b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.06em; color:${VIOLET}; }
      .${P}figs kbd { font-family:inherit; border:1px solid #1b2230; padding:0 4px; font-size:14px; }
      .${P}label .gentle { font-style:italic; color:${GREEN}; font-size:15px; margin:0 0 8px; }
      .${P}label button { font:inherit; font-size:18px; padding:8px 26px; background:#1b2230; color:#ece6d6; border:0; cursor:pointer; }
      .${P}label button:hover, .${P}label button:focus-visible { background:${VIOLET}; }
      @media (max-width:520px) { .${P}label { padding:14px; } .${P}cap { top:96px; width:calc(100% - 70px); font-size:15px; left:auto; right:12px; transform:none; } .${P}pad button { width:58px; height:58px; } }
    </style>
    <div class="${P}wrap">
      <canvas aria-label="The Deep: a diver in a dark plate, glowing specimens, a wreck far below"></canvas>
      <div class="${P}cap" aria-live="polite"></div>
      <div class="${P}pad"><button type="button" data-k="kick" aria-label="Kick (Space)">Kick<span class="cd"></span></button><button type="button" data-k="grip" hidden aria-label="Grip (hold Shift)">Grip</button></div>
      <div class="${P}how" role="dialog" aria-label="How to play">
        <div class="${P}label">
          <div class="cap2"><span>PLATE IV</span><span>CHAPTER III</span><span>THE DEEP</span></div>
          <h2>Down to the tender</h2>
          <p class="goal">Swim down 80 m to the sunken tender, work its strongbox free, and carry it up before the pull closes the edges.</p>
          <p class="open">The Company's tender went down off Home Reach with Tidewater's harbour book locked in its strongbox. Whatever binds that harbour is written there. Alexi goes over the side with no breath to hold.</p>
          ${gentle ? `<p class="gentle">The deep is slower to close this time: the pull runs 150 seconds.</p>` : ""}
          <ul class="${P}figs">
            <li><b>Fig. 1</b><span><b>Swim</b>: <kbd>WASD</kbd> or arrows, or press and drag toward where you want to go.</span></li>
            <li><b>Fig. 2</b><span><b>Kick</b>: <kbd>Space</kbd> or the Kick button. A burst of speed, then two seconds to recover.</span></li>
            <li><b>Fig. 3</b><span><b>Stir</b>: draw a circle (or hold <kbd>E</kbd> with a direction). A current runs the way the circle last turned, and carries him.</span></li>
          </ul>
          <button type="button">Dive</button>
        </div>
      </div>
    </div>`;
    const wrap = root.querySelector("." + P + "wrap");
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const how = wrap.querySelector("." + P + "how");
    const rng = api.rng("deep");
    const capEl = wrap.querySelector("." + P + "cap");
    const kickBtn = wrap.querySelector('[data-k="kick"]'), gripBtn = wrap.querySelector('[data-k="grip"]');
    const losses = +api.store.get("losses", 0) || 0;
    let capT = 0;
    function caption(text, voice, sec = 6) { capEl.textContent = text; capEl.classList.toggle("voice", !!voice); capEl.classList.add("show"); capT = sec; }
    const fired = new Set();
    let flashT = 0, flashCol = RED, rings = [];

    const d = { x: 12, y: 1, vx: 0, vy: 0, face: 1, kick: 0, cool: 0, grip: false, carry: false, free: 0, pull: PULL, net: 0, cut: 0, msg: "", msgT: 0, hit: 0 };
    let t = 0, running = false, over = false, chainT = 0;
    let currents = [];
    const nets = [{ x0: 46, x1: 66, y0: 24, y1: 33, cut: false }];
    let sweep = 0.35;
    const chain = { ax: 80, len: 64 };
    const cold = { y0: 40, y1: 55, v: -2.2 };
    const specimens = [];
    const COLS = [GOLD, FOAM, "#9C8FC0", "#5FB39E"];
    for (let i = 0; i < 26; i++) specimens.push({ x: rng() * WORLD_W, y: 8 + rng() * (FLOOR - 12), r: 0.6 + rng() * 1.3, c: COLS[i % 4], ph: rng() * 6, spines: 8 + Math.floor(rng() * 10), fig: i + 1 });
    const motes = []; for (let i = 0; i < 220; i++) motes.push({ x: rng() * WORLD_W, y: rng() * FLOOR, s: rng() });
    const floorAt = (x) => FLOOR - 3 * Math.sin(x * 0.11) - 2 * Math.sin(x * 0.037 + 1) - (Math.abs(x - WRECK_X) < 14 ? 0 : 0);
    function say(m, s = 2.4) { d.msg = m; d.msgT = s; }

    // ---- input ----
    const keys = {};
    const held = { kick: false, grip: false };
    const stir = { on: false, angle: 0, pts: [], cx: 0, cy: 0, last: null, dirs: [], key: false, keyT: 0 };
    let swimTo = null;
    function spawnCurrent(x, y, dx, dy) {
      const m = Math.hypot(dx, dy) || 1;
      currents.push({ x, y, dx: dx / m, dy: dy / m, len: 10, age: 0, life: 7 });
      rings.push({ x, y, age: 0 });
      say("A current, " + ["up", "down", "left", "right"][Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 0 : 1) : (dx < 0 ? 2 : 3)]);
    }
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "e", " ", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      if (k === " " && running) kickNow();
      if (k === "e" && running && !keys.e) { stir.key = true; stir.keyT = 0; }
      keys[k] = true;
    };
    const ku = (e) => {
      const k = e.key.toLowerCase(); keys[k] = false;
      if (k === "e" && stir.key) {
        if (stir.keyT >= 0.6) { let [ix, iy] = inputDir(); if (!ix && !iy) iy = -1; spawnCurrent(d.x - ix * 4, d.y - iy * 4, ix, iy); }
        stir.key = false;
      }
    };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    function kickNow() { if (d.cool <= 0) { d.kick = 1; d.cool = 2; } }
    function inputDir() {
      let ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
      let iy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
      return [ix, iy];
    }

    let W = 0, Hh = 0, dpr = 1, ppm = 10, camX = 0, camY = 0;
    const sx = (x) => (x - camX) * ppm + W / 2, sy = (y) => (y - camY) * ppm + Hh / 2;
    const wxp = (px) => (px - W / 2) / ppm + camX, wyp = (py) => (py - Hh / 2) / ppm + camY;
    function ptr(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    const pd = (e) => {
      if (!running) return;
      const [px, py] = ptr(e); cv.setPointerCapture?.(e.pointerId);
      stir.on = true; stir.angle = 0; stir.pts = [[px, py]]; stir.cx = px; stir.cy = py; stir.last = null; stir.dirs = [];
      swimTo = [px, py]; e.preventDefault();
    };
    const pm = (e) => {
      if (!stir.on) return;
      const [px, py] = ptr(e);
      const prev = stir.pts[stir.pts.length - 1];
      stir.pts.push([px, py]); if (stir.pts.length > 90) stir.pts.shift();
      stir.dirs.push([px - prev[0], py - prev[1]]); if (stir.dirs.length > 12) stir.dirs.shift();
      const n = stir.pts.length;
      stir.cx += (px - stir.cx) / Math.min(n, 25); stir.cy += (py - stir.cy) / Math.min(n, 25);
      const dx = px - stir.cx, dy = py - stir.cy;
      swimTo = Math.abs(stir.angle) > Math.PI ? null : [px, py];
      if (dx * dx + dy * dy < 49) return;
      const a = Math.atan2(dy, dx);
      if (stir.last != null) { let q = a - stir.last; if (q > Math.PI) q -= 2 * Math.PI; if (q < -Math.PI) q += 2 * Math.PI; stir.angle += q; }
      stir.last = a;
      if (Math.abs(stir.angle) >= Math.PI * 2) {
        const v = stir.dirs.reduce((s, q) => [s[0] + q[0], s[1] + q[1]], [0, 0]);
        spawnCurrent(wxp(stir.cx), wyp(stir.cy), v[0], v[1]);
        stir.angle = 0; stir.pts = [[px, py]];
      }
    };
    const pu = () => { stir.on = false; swimTo = null; };
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm);
    cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    for (const b of wrap.querySelectorAll("." + P + "pad button")) {
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); if (b.dataset.k === "kick") kickNow(); else held.grip = true; b.classList.add("on"); });
      const up = () => { if (b.dataset.k === "grip") held.grip = false; b.classList.remove("on"); };
      b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up); b.addEventListener("pointercancel", up);
    }

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = wrap.clientWidth; Hh = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      ppm = Math.max(7, Math.min(16, Math.min(W, Hh * 1.4) / 46));
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // ---- simulation ----
    function chainPos(k) { // k in 0..1 along the chain
      const a = Math.sin(chainT) * 0.55;
      return [chain.ax + Math.sin(a) * chain.len * k, -2 + Math.cos(a) * chain.len * k];
    }
    function step(dt) {
      t += dt; chainT += dt * sweep;
      if (d.msgT > 0) d.msgT -= dt;
      if (capT > 0) { capT -= dt; if (capT <= 0) capEl.classList.remove("show"); }
      if (flashT > 0) flashT = Math.max(0, flashT - dt * 1.5);
      rings.forEach((r) => (r.age += dt)); rings = rings.filter((r) => r.age < 1);
      for (const b of BEATS) if (!fired.has(b.id) && !d.carry && d.y >= b.y) { fired.add(b.id); caption(b.text, b.voice); }
      if (!d.carry && d.pull < PULL * 0.35 && !fired.has("late")) { fired.add("late"); caption("The edges are closing. Kick, and ride a current if you stir one.", false, 4); }
      d.pull -= dt;
      if (d.pull <= 0) { finish(false); return; }
      if (d.cool > 0) d.cool -= dt;
      if (d.kick > 0) d.kick -= dt;
      if (stir.key) stir.keyT += dt;
      d.grip = !!(keys.shift || keys.g || held.grip);
      let [ix, iy] = inputDir();
      if (swimTo) { const tx = wxp(swimTo[0]) - d.x, ty = wyp(swimTo[1]) - d.y, m = Math.hypot(tx, ty); if (m > 0.8) { ix = tx / m; iy = ty / m; } }
      const im = Math.hypot(ix, iy); if (im > 1) { ix /= im; iy /= im; }
      if (ix) d.face = Math.sign(ix);
      let top = d.kick > 0 ? 6 : 3;
      if (d.carry) top *= 0.5;
      const inNet = nets.find((n) => !n.cut && d.x > n.x0 && d.x < n.x1 && d.y > n.y0 && d.y < n.y1);
      if (inNet) {
        top *= 0.2;
        if (d.grip && im > 0) { d.cut += dt; if (d.cut > 1) { inNet.cut = true; d.cut = 0; say("The net parts."); flashT = 0.6; flashCol = GREEN; rings.push({ x: d.x, y: d.y, age: 0 }); } }
        if (!d.net) { say("Caught in a Company net: hold Grip and swim to tear it."); if (!fired.has("grip")) { fired.add("grip"); gripBtn.hidden = false; caption("A Company net. Fig. 4, Grip: hold Shift (or the Grip button) and swim against it to tear it open.", false, 7); } }
        d.net = 1;
      } else { d.net = 0; d.cut = 0; }
      const k = Math.min(1, dt / 0.3);
      d.vx += (ix * top - d.vx) * k; d.vy += (iy * top - d.vy) * k;
      // drift: currents, cold current, a slow sink when still
      let ex = 0, ey = 0;
      if (d.y > cold.y0 && d.y < cold.y1) ex += cold.v;
      for (const c of currents) {
        const rx = d.x - c.x, ry = d.y - c.y, along = rx * c.dx + ry * c.dy, perp = Math.abs(rx * -c.dy + ry * c.dx);
        if (along > -1 && along < c.len && perp < 2.6) { const f = Math.min(1, (c.life - c.age) / 1.5) * STIR_SPEED; ex += c.dx * f; ey += c.dy * f; }
      }
      if (im === 0) ey += 0.25;
      d.x += (d.vx + ex) * dt; d.y += (d.vy + ey) * dt;
      d.x = Math.max(1, Math.min(WORLD_W - 1, d.x));
      d.y = Math.max(0.5, Math.min(floorAt(d.x) - 1, d.y));
      // chain
      if (d.hit > 0) d.hit -= dt;
      for (let i = 1; i <= 14; i++) {
        const [cx, cy] = chainPos(i / 14);
        if (Math.hypot(d.x - cx, d.y - cy) < 1.6 && d.hit <= 0) {
          const dir = Math.sign(d.x - cx) || 1; d.x += dir * 5; d.vx = dir * 3; d.hit = 1.2; say("The dredge chain sweeps him back."); flashT = 0.8; flashCol = RED; break;
        }
      }
      currents.forEach((c) => (c.age += dt)); currents = currents.filter((c) => c.age < c.life);
      // the strongbox
      const near = Math.hypot(d.x - WRECK_X, d.y - (WRECK_Y + 2)) < 4.5;
      if (!d.carry && near && !fired.has("tender")) { fired.add("tender"); gripBtn.hidden = false; caption("The strongbox, wedged in the tender's ribs, the Company's mark on its lid. Hold Grip to work it free.", false, 6); }
      if (!d.carry && near && d.grip) {
        d.free += dt;
        if (d.free >= FREE_S / 2 && !fired.has("settle")) { fired.add("settle"); say("The hull groans and settles."); flashT = 0.5; flashCol = GOLD; }
        if (d.free >= FREE_S) {
          d.carry = true; flashT = 0.8; flashCol = GOLD; rings.push({ x: d.x, y: d.y, age: 0 });
          // the turn: up above, the Company has heard the dredge strike something, and drops a second net
          nets.push({ x0: Math.max(4, Math.min(WORLD_W - 26, d.x - 14)), x1: Math.max(26, Math.min(WORLD_W - 4, d.x + 8)), y0: 13, y1: 20, cut: false, late: true });
          sweep = 0.55;
          caption("Free. Above, a second net comes down across the way up, and the dredge swings faster. Carrying halves your speed: stir currents upward.", false, 7);
        }
      }
      else if (!d.carry) d.free = Math.max(0, d.free - dt);
      if (d.carry && d.y < 30 && !fired.has("near")) { fired.add("near"); caption("Thirty metres. The light comes back to his hands, and the box is lighter than it was.", true, 5); }
      if (d.carry && d.y < 2.2) finish(true);
    }
    const netsCut = () => nets.filter((n) => n.cut).length;
    function finish(won) {
      if (over) return; over = true; running = false;
      const left = Math.max(0, Math.round(d.pull));
      api.store.set("losses", won ? 0 : losses + 1);
      if (won) api.end({ outcome: "win", text: `The strongbox breaks the surface with ${left} s of the pull to spare${netsCut() ? `, and ${netsCut()} Company net${netsCut() === 1 ? "" : "s"} torn on the way` : ""}. Swollen, not locked: the harbour book of Tidewater is inside, and the princess is already reaching for it.` });
      else api.end({ outcome: "lose", text: d.carry ? "The strongbox was free, but the deep kept him. He settles gently to the floor beside it, and the dive will have to be made again from the last mark." : "The edges close before he reaches the tender. The deep keeps him a while, gently, and the dive will have to be made again." });
    }

    // ---- drawing ----
    function radiolarian(x, y, r, col, spines, ph, glow) {
      if (glow) {
        const gr = g.createRadialGradient(x, y, 0, x, y, r * 4);
        gr.addColorStop(0, col + "AA"); gr.addColorStop(1, col + "00");
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, 7); g.fill();
      }
      g.strokeStyle = col; g.lineWidth = 1;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      g.beginPath(); g.arc(x, y, r * 0.55, 0, 7); g.stroke();
      g.beginPath();
      for (let i = 0; i < spines; i++) { const a = ph + (i / spines) * Math.PI * 2; g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r * 1.9, y + Math.sin(a) * r * 1.9); }
      g.lineWidth = 0.6; g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r * 0.18, 0, 7); g.fill();
    }
    function drawDiver() {
      const x = sx(d.x), y = sy(d.y), k = ppm / 10;
      const ang = Math.atan2(d.vy, Math.abs(d.vx) + 0.001) * 0.8;
      g.save(); g.translate(x, y); g.scale(d.face * k, k); g.rotate(ang);
      g.strokeStyle = FOAM; g.lineWidth = 2.4; g.lineCap = "round";
      const sw = Math.sin(t * (d.kick > 0 ? 14 : 7)) * 6;
      g.beginPath(); g.moveTo(-6, 0); g.lineTo(12, -1); // torso
      g.moveTo(-6, 0); g.lineTo(-20, 3 + sw * 0.6); g.moveTo(-6, 0); g.lineTo(-20, -3 - sw * 0.6); // legs
      g.moveTo(10, -1); g.lineTo(22, -8 + sw * 0.4); g.moveTo(10, -1); g.lineTo(21, 6 - sw * 0.4); // arms
      g.stroke();
      g.fillStyle = FOAM; g.beginPath(); g.arc(16, -2, 3.6, 0, 7); g.fill();
      if (d.carry) { g.fillStyle = GOLD; g.strokeStyle = PLATE; g.lineWidth = 1; g.fillRect(18, 2, 11, 8); g.strokeRect(18, 2, 11, 8); g.beginPath(); g.moveTo(18, 6); g.lineTo(29, 6); g.stroke(); }
      g.restore();
    }
    function draw() {
      camX = Math.max(W / 2 / ppm, Math.min(WORLD_W - W / 2 / ppm, d.x));
      camY = Math.max(Hh / 2 / ppm - 6, Math.min(FLOOR + 6 - Hh / 2 / ppm, d.y));
      // light bands, sampled per strip
      const bands = (y) => (y < 0 ? "#3a5a78" : y < 20 ? "#26405e" : y < 60 ? "#15253c" : y < 150 ? "#0b1424" : "#060b14");
      for (let py = 0; py < Hh; py += 8) { g.fillStyle = bands(wyp(py)); g.fillRect(0, py, W, 8); }
      // smooth the band edges
      const sky = sy(0);
      if (sky > 0) { g.fillStyle = "#c9d6d2"; g.fillRect(0, 0, W, sky); }
      // engraved lines: white, thinning with depth
      g.strokeStyle = FOAM;
      for (let wy = 0; wy < FLOOR; wy += 1.6 + wy * 0.06) {
        const py = sy(wy); if (py < -4 || py > Hh + 4) continue;
        g.globalAlpha = Math.max(0.1, 0.26 - wy * 0.002); g.lineWidth = Math.max(0.3, 1 - wy * 0.009);
        g.beginPath();
        for (let px = 0; px <= W; px += 10) { const y = py + Math.sin(px * 0.02 + wy + t * 0.4) * (wy < 4 ? 3 : 1); px ? g.lineTo(px, y) : g.moveTo(px, y); }
        g.stroke();
      }
      g.globalAlpha = 1;
      // surface
      g.strokeStyle = FOAM; g.lineWidth = 1.6; g.beginPath();
      for (let px = 0; px <= W; px += 6) { const y = sky + Math.sin(px * 0.03 + t) * 3; px ? g.lineTo(px, y) : g.moveTo(px, y); } g.stroke();
      // light shafts in the bright band
      g.save(); g.globalAlpha = 0.06; g.fillStyle = FOAM;
      for (let i = 0; i < 5; i++) { const x0 = sx(15 + i * 30 + Math.sin(t * 0.2 + i) * 3); g.beginPath(); g.moveTo(x0, sky); g.lineTo(x0 + 30, sky); g.lineTo(x0 + 130, sy(55)); g.lineTo(x0 + 60, sy(55)); g.fill(); }
      g.restore();
      // motes (stipple)
      g.fillStyle = FOAM;
      for (const m of motes) { const px = sx(m.x), py = sy(m.y); if (px < 0 || px > W || py < 0 || py > Hh) continue; g.globalAlpha = 0.15 + m.s * 0.25 * Math.max(0.2, 1 - m.y / 90); g.fillRect(px, py, 1.2, 1.2); }
      g.globalAlpha = 1;
      // cold current band
      const cy0 = sy(cold.y0), cy1 = sy(cold.y1);
      g.strokeStyle = "#9fb8d6"; g.globalAlpha = 0.28; g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const y = cy0 + ((cy1 - cy0) * (i + 0.5)) / 9; g.setLineDash([10, 14]); g.lineDashOffset = (t * 2.2 * ppm) % 24; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.setLineDash([]); g.globalAlpha = 1;
      if (cy1 > 0 && cy0 < Hh) { g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.fillStyle = "#9fb8d6"; g.textAlign = "left"; g.fillText("← cold current", 14 + 34, cy0 + 16); }
      // pilings and the dredge
      g.strokeStyle = FOAM; g.globalAlpha = 0.5; g.lineWidth = 1;
      for (const px of [70, 74, 88, 92]) { const x = sx(px); g.strokeRect(x - 0.8 * ppm, sy(-4), 1.6 * ppm, (34) * ppm); for (let y = 0; y < 34; y += 1.3) { g.beginPath(); g.moveTo(x - 0.6 * ppm, sy(y)); g.lineTo(x + 0.6 * ppm, sy(y + 0.6)); g.stroke(); } }
      g.globalAlpha = 1;
      g.strokeStyle = FOAM; g.lineWidth = 1.6;
      for (let i = 0; i < 14; i++) { const [ax, ay] = chainPos(i / 14), [bx, by] = chainPos((i + 1) / 14); g.beginPath(); g.ellipse(sx((ax + bx) / 2), sy((ay + by) / 2), 0.9 * ppm, 0.45 * ppm, Math.atan2(by - ay, bx - ax), 0, 7); g.stroke(); }
      const [hx, hy] = chainPos(1); g.beginPath(); g.moveTo(sx(hx), sy(hy)); g.lineTo(sx(hx) - ppm * 1.2, sy(hy) + ppm * 1.4); g.moveTo(sx(hx), sy(hy)); g.lineTo(sx(hx) + ppm * 1.2, sy(hy) + ppm * 1.4); g.stroke();
      // the net
      for (const n of nets) if (!n.cut) {
        g.strokeStyle = PAPER; g.globalAlpha = 0.5; g.lineWidth = 0.8;
        g.beginPath();
        for (let x = n.x0; x <= n.x1; x += 1.4) { g.moveTo(sx(x), sy(n.y0)); g.lineTo(sx(x + 2), sy(n.y1)); g.moveTo(sx(x + 2), sy(n.y0)); g.lineTo(sx(x), sy(n.y1)); }
        g.stroke(); g.globalAlpha = 0.8; g.strokeRect(sx(n.x0), sy(n.y0), (n.x1 - n.x0) * ppm, (n.y1 - n.y0) * ppm); g.globalAlpha = 1;
      }
      // floor
      g.fillStyle = "#05090f"; g.strokeStyle = FOAM; g.lineWidth = 1; g.beginPath(); g.moveTo(0, Hh);
      for (let px = 0; px <= W + 6; px += 6) g.lineTo(px, sy(floorAt(wxp(px))));
      g.lineTo(W, Hh); g.closePath(); g.fill(); g.globalAlpha = 0.4; g.stroke(); g.globalAlpha = 1;
      // the sunken tender
      const tx = sx(WRECK_X), ty = sy(WRECK_Y);
      g.save(); g.translate(tx, ty); g.rotate(-0.18); g.strokeStyle = FOAM; g.lineWidth = 1.2; g.globalAlpha = 0.85;
      g.beginPath(); g.moveTo(-10 * ppm, -1 * ppm); g.quadraticCurveTo(-8 * ppm, 5 * ppm, 0, 5.5 * ppm); g.quadraticCurveTo(9 * ppm, 5 * ppm, 11 * ppm, -2 * ppm); g.stroke();
      for (let i = -9; i < 10; i += 1.2) { g.beginPath(); g.moveTo(i * ppm, -0.5 * ppm); g.lineTo(i * ppm + 0.4 * ppm, 4.6 * ppm - Math.abs(i) * 0.25 * ppm); g.lineWidth = 0.5; g.stroke(); }
      g.lineWidth = 1.4; g.beginPath(); g.moveTo(2 * ppm, 0); g.lineTo(5 * ppm, -9 * ppm); g.stroke();
      g.restore();
      if (!d.carry) {
        const bx = sx(WRECK_X), by = sy(WRECK_Y + 2);
        g.strokeStyle = PAPER; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); g.lineWidth = 1.2; g.beginPath(); g.arc(bx, by, 3.2 * ppm, 0, 7); g.stroke(); g.globalAlpha = 1;
        g.fillStyle = GOLD; g.strokeStyle = PLATE; g.fillRect(bx - 0.9 * ppm, by - 0.6 * ppm, 1.8 * ppm, 1.2 * ppm); g.strokeRect(bx - 0.9 * ppm, by - 0.6 * ppm, 1.8 * ppm, 1.2 * ppm);
        if (d.free > 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 4 * ppm, -Math.PI / 2, -Math.PI / 2 + (d.free / FREE_S) * Math.PI * 2); g.stroke(); }
      } else if (d.y > 4) {
        g.strokeStyle = PAPER; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); g.lineWidth = 1.2; g.beginPath(); g.ellipse(sx(d.x), sy(0.5), 6 * ppm, 1.4 * ppm, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      }
      // specimens: the light the deep has
      for (const sp of specimens) {
        const px = sx(sp.x + Math.sin(t * 0.3 + sp.ph) * 1.5), py = sy(sp.y + Math.cos(t * 0.25 + sp.ph) * 1); if (px < -60 || px > W + 60 || py < -60 || py > Hh + 60) continue;
        radiolarian(px, py, sp.r * ppm, sp.c, sp.spines, sp.ph + t * 0.1, sp.y > 18);
        g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.fillStyle = sp.c; g.globalAlpha = 0.6; g.textAlign = "left"; g.fillText("Fig. " + sp.fig, px + sp.r * ppm * 2, py + sp.r * ppm * 2); g.globalAlpha = 1;
      }
      // stirred currents glow
      for (const c of currents) {
        const al = Math.min(1, (c.life - c.age) / 1.5);
        const x0 = sx(c.x), y0 = sy(c.y), x1 = sx(c.x + c.dx * c.len), y1 = sy(c.y + c.dy * c.len);
        g.save(); g.globalAlpha = 0.85 * al; g.strokeStyle = "#7FE0C2"; g.shadowColor = "#7FE0C2"; g.shadowBlur = 14; g.lineWidth = 3;
        const nx = -c.dy * ppm * 1.2, ny = c.dx * ppm * 1.2;
        for (const o of [-1, 0, 1]) { g.beginPath(); g.moveTo(x0 + nx * o, y0 + ny * o); g.bezierCurveTo((x0 * 2 + x1) / 3 + nx * (o + 0.6), (y0 * 2 + y1) / 3 + ny * (o + 0.6), (x0 + x1 * 2) / 3 + nx * (o - 0.6), (y0 + y1 * 2) / 3 + ny * (o - 0.6), x1 + nx * o, y1 + ny * o); g.lineWidth = o ? 1.2 : 3; g.stroke(); }
        g.fillStyle = "#7FE0C2"; g.beginPath(); g.moveTo(x1 + c.dx * 10, y1 + c.dy * 10); g.lineTo(x1 - c.dy * 6, y1 + c.dx * 6); g.lineTo(x1 + c.dy * 6, y1 - c.dx * 6); g.fill();
        g.restore();
      }
      drawDiver();
      // darkness: visibility shrinks with depth, and the pull closes the edges
      const vis = Math.max(110, Math.min(W, Hh) * (0.9 - Math.min(0.55, d.y / 140)));
      const pullK = 1 - d.pull / PULL;
      const gr = g.createRadialGradient(sx(d.x), sy(d.y), vis * (0.5 - pullK * 0.35), sx(d.x), sy(d.y), vis * (1.3 - pullK * 0.75) + 20);
      gr.addColorStop(0, "rgba(3,6,12,0)"); gr.addColorStop(1, `rgba(3,6,12,${(0.4 + pullK * 0.6).toFixed(2)})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      // stir spiral
      if (stir.on && stir.pts.length > 2 && Math.abs(stir.angle) > 0.8) {
        g.strokeStyle = "#7FE0C2"; g.globalAlpha = 0.7; g.lineWidth = 1.4; g.beginPath(); stir.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.globalAlpha = 1;
      }
      if (stir.key) { g.strokeStyle = "#7FE0C2"; g.lineWidth = 2; g.beginPath(); g.arc(sx(d.x), sy(d.y), 26, -Math.PI / 2, -Math.PI / 2 + Math.min(1, stir.keyT / 0.6) * Math.PI * 2); g.stroke(); }
      // margins: depth gauge, plate caption, pull
      const gx = 22, g0 = 40, g1 = Hh - 50;
      g.strokeStyle = FOAM; g.globalAlpha = 0.8; g.lineWidth = 1; g.beginPath(); g.moveTo(gx, g0); g.lineTo(gx, g1); g.stroke();
      g.font = "12px 'IM Fell English',Georgia,serif"; g.fillStyle = FOAM; g.textAlign = "left";
      for (let m = 0; m <= 100; m += 20) { const y = g0 + ((g1 - g0) * m) / 100; g.beginPath(); g.moveTo(gx - 4, y); g.lineTo(gx + 4, y); g.stroke(); g.fillText(m + " m", gx + 7, y + 3); }
      const yy = g0 + ((g1 - g0) * Math.min(100, d.y)) / 100; g.fillStyle = GOLD; g.beginPath(); g.moveTo(gx - 2, yy); g.lineTo(gx - 12, yy - 6); g.lineTo(gx - 12, yy + 6); g.fill();
      const yw = g0 + ((g1 - g0) * WRECK_Y) / 100; g.strokeStyle = PAPER; g.beginPath(); g.arc(gx, yw, 4, 0, 7); g.stroke();
      g.globalAlpha = 1;
      { const bw = Math.min(W - 70, 290); g.fillStyle = "rgba(11,20,36,.84)"; g.fillRect(W - 16 - bw - 8, 8, bw + 16, 76); g.strokeStyle = FOAM; g.globalAlpha = 0.35; g.strokeRect(W - 16 - bw - 7.5, 8.5, bw + 15, 75); g.globalAlpha = 1; }
      g.font = "14px 'IM Fell English SC',Georgia,serif"; g.fillStyle = FOAM; g.textAlign = "right";
      g.fillText(`PLATE IV. THE DEEP · ${Math.round(d.y)} m`, W - 16, 26);
      g.font = "italic 15px 'IM Fell English',Georgia,serif";
      g.fillText(d.carry ? "Carry it up to the light" : d.free > 0 ? `Working it free… ${Math.min(FREE_S, d.free).toFixed(1)} / ${FREE_S} s` : d.net ? "Grip and swim to tear the net" : "Down to the pale ring", W - 16, 45);
      // the pull: a ruled gauge under the caption, and the closing line along the top
      g.fillStyle = pullK > 0.75 ? RED : FOAM; g.globalAlpha = 0.8; g.fillRect(0, 0, W * (d.pull / PULL), 4); g.globalAlpha = 1;
      { const pw = Math.min(260, W - 90), px0 = W - 16 - pw, py0 = 66;
        g.font = "13px 'IM Fell English SC',Georgia,serif"; g.textAlign = "left"; g.fillStyle = pullK > 0.65 ? "#e7a0a0" : FOAM; g.fillText("THE PULL", px0, py0 - 4);
        g.textAlign = "right"; g.fillText(`${Math.ceil(d.pull)} s`, W - 16, py0 - 4);
        g.strokeStyle = FOAM; g.globalAlpha = 0.8; g.strokeRect(px0 + 0.5, py0 + 0.5, pw, 9); g.globalAlpha = 1;
        g.fillStyle = pullK > 0.65 ? RED : "#7FE0C2"; g.fillRect(px0 + 2, py0 + 2, (pw - 3) * (d.pull / PULL), 6);
        if (pullK > 0.65 && !reduce) { g.globalAlpha = 0.25 + 0.25 * Math.sin(t * 6); g.strokeStyle = RED; g.lineWidth = 10; g.strokeRect(0, 0, W, Hh); g.globalAlpha = 1; g.lineWidth = 1; } }
      for (const r of rings) { if (reduce) break; g.strokeStyle = "#7FE0C2"; g.globalAlpha = 1 - r.age; g.lineWidth = 1.4; g.beginPath(); g.arc(sx(r.x), sy(r.y), 8 + r.age * 50, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (flashT > 0) { g.strokeStyle = flashCol; g.globalAlpha = Math.min(1, flashT) * 0.6; g.lineWidth = reduce ? 6 : 16; g.strokeRect(0, 0, W, Hh); g.globalAlpha = 1; g.lineWidth = 1; }
      if (kickBtn) { const cd = kickBtn.firstElementChild; if (cd) cd.style.width = (d.cool > 0 ? (1 - d.cool / 2) * 100 : 100) + "%"; }
      if (d.msgT > 0) { g.font = `italic ${Math.max(16, Math.min(22, W / 45))}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.fillStyle = FOAM; g.globalAlpha = Math.min(1, d.msgT); g.fillText(d.msg, W / 2, Math.max(70, Hh * 0.16)); g.globalAlpha = 1; }
      g.strokeStyle = FOAM; g.globalAlpha = 0.35; g.strokeRect(5.5, 5.5, W - 11, Hh - 11); g.globalAlpha = 1;
    }

    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) step(dt); else if (!reduce && !over) t += dt * 0.5;
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const b = how.querySelector("button");
    b.addEventListener("click", () => { how.remove(); running = true; last = performance.now(); caption("Down. The pale ring far below marks the tender.", false, 4); });
    b.focus();
    return {
      unmount() {
        cancelAnimationFrame(raf); ro.disconnect();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        running = false;
      },
    };
  },
};

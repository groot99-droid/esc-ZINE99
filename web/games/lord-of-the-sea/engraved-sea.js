// The Lord of the Sea: The Engraved Sea (2D, copperplate engraving).
// One sequence cut from DESIGN.md section 10, after `e-spice-chase`: run 1.2 nm to the Spice
// Mouth with a revenue cutter behind. The verb is the stir: draw circles on the sea (or hold E / Q)
// to raise a crest at the reticle (one circle Ripple, one more per tier, up to Squall here) or to
// flatten one. Surf the faces you raise, put crests under the cutter, lay fog to break its sight,
// stand the tide over the reef (a crest raised on it stays there). Broadside to a face steeper than 35 degrees for 1.5 s: capsize,
// back to the last buoy. A grapnel held 4 s: caught, and the run ends.

const INK = "#1F2E4A", PAPER = "#F4F1E8", RED = "#8C2B2B", GOLD = "#E7A93B", GREEN = "#2F6B5E", BROWN = "#6B4A2B";
const LENGTH = 2200;            // metres to the port (about 1.2 nm)
const NM = 1852;
const V = 1.6;                  // drawn vertical exaggeration; steepness is read from the drawing
const STEEP = Math.tan((35 * Math.PI) / 180);
const TIERS = [
  { name: "Ripple", h: 0.5, sigma: 6 },
  { name: "Swell", h: 1.5, sigma: 5.5 },
  { name: "Current", h: 2.5, sigma: 5 },
  { name: "Fog", fog: true },
  { name: "Squall", h: 4, sigma: 4.5 },
];
const MAX_TIER = TIERS.length - 1;
const ROCKS = [700, 1520];     // the reef: needs 0.6 m of water over it to pass
const BUOYS = [0, 450, 900, 1350, 1800];
const LIGHT_X = 1150;

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-engraved-sea-";
    const reduce = api.reducedMotion;
    root.innerHTML = `
    <style>
      .${P}wrap { position:absolute; inset:0; background:${PAPER}; color:${INK}; font-family:'IM Fell English',Georgia,serif; overflow:hidden; touch-action:none; user-select:none; }
      .${P}wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .${P}pad { position:absolute; left:0; right:0; bottom:0; display:flex; gap:6px; justify-content:center; flex-wrap:wrap; padding:8px 10px 10px; pointer-events:none; }
      .${P}pad button { pointer-events:auto; font:inherit; font-size:15px; color:${INK}; background:rgba(244,241,232,.92); border:1.5px solid ${INK}; padding:8px 12px; min-width:58px; cursor:pointer; touch-action:none; }
      .${P}pad button.on { background:${INK}; color:${PAPER}; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(244,241,232,.82); padding:16px; z-index:3; }
      .${P}how div { max-width:520px; border:1.5px solid ${INK}; outline:4px double ${INK}; outline-offset:4px; background:${PAPER}; padding:20px 22px; }
      .${P}how h2 { font-weight:400; font-size:28px; margin:0 0 8px; }
      .${P}how p { margin:0 0 10px; font-size:16px; line-height:1.4; }
      .${P}how kbd { font-family:inherit; border:1px solid ${INK}; padding:0 4px; font-size:13px; }
      .${P}how button { font:inherit; font-size:18px; padding:8px 22px; background:${INK}; color:${PAPER}; border:0; cursor:pointer; margin-top:6px; }
    </style>
    <div class="${P}wrap">
      <canvas aria-label="The Engraved Sea: a side-on engraved sea with your boat, the reef and a revenue cutter"></canvas>
      <div class="${P}pad" aria-label="Sail controls">
        <button type="button" data-k="trimDown" aria-label="Spill wind">Spill</button>
        <button type="button" data-k="trimUp" aria-label="Full sail">Full</button>
        <button type="button" data-k="climb" aria-label="Helm: climb the face">Climb</button>
        <button type="button" data-k="run" aria-label="Helm: run the trough">Run</button>
      </div>
      <div class="${P}how" role="dialog" aria-label="How to play">
        <div>
          <h2>The Engraved Sea</h2>
          <p>Run 1.2 miles to the Spice Mouth with a revenue cutter behind. <b>Stir</b>: draw circles on the sea, clockwise to raise a crest at that spot (one circle a ripple, more circles a bigger sea, four lays fog), counter-clockwise to flatten. Keys: <kbd>E</kbd>/<kbd>Q</kbd> stir at the reticle, <kbd>&larr;</kbd><kbd>&rarr;</kbd> move it.</p>
          <p>Surf the faces you raise. <kbd>W</kbd> climb a rising face, <kbd>S</kbd> run a falling one, or go over. <kbd>A</kbd>/<kbd>D</kbd> trim. Stir on the reef itself to stand the tide over it. Keep out of the lighthouse beam. A grapnel held four seconds ends the run.</p>
          <button type="button">Make sail</button>
        </div>
      </div>
    </div>`;
    const wrap = root.querySelector("." + P + "wrap");
    const cv = wrap.querySelector("canvas");
    const g = cv.getContext("2d");
    const how = wrap.querySelector("." + P + "how");
    const rng = api.rng("engraved-sea");

    // ---- world state ----
    const base = [
      { a: 0.38, L: 47, c: 6.5, p: rng() * 6 },
      { a: 0.24, L: 23, c: 4.5, p: rng() * 6 },
      { a: 0.14, L: 12, c: 3.2, p: rng() * 6 },
      { a: 0.1, L: 71, c: 9, p: rng() * 6 },
    ];
    let t = 0, running = false, over = false;
    const s = {
      x: 0, v: 7, trim: 0.8, helm: 0, broad: 0, capsized: 0, checkpoint: 0,
      notice: 30, msg: "", msgT: 0, caught: 0, best: 0,
    };
    let crests = [], fogs = [], calms = [], cutters = [], sprays = [];
    function resetCutters() { cutters = [{ x: s.x - 130, v: 8, stall: 0, grap: 0 }]; if (s.second) cutters.push({ x: s.x - 200, v: 8, stall: 0, grap: 0 }); }
    resetCutters();

    function baseH(x) {
      let h = 0;
      for (const w of base) h += w.a * Math.sin(((x - w.c * t) / w.L) * Math.PI * 2 + w.p);
      for (const c of calms) { const d = Math.abs(x - c.x); if (d < c.r) h *= 0.25 + 0.75 * (d / c.r); }
      return h;
    }
    function H(x) {
      let h = baseH(x);
      for (const c of crests) { const d = x - c.x; h += c.h * Math.exp(-(d * d) / (2 * c.sigma * c.sigma)); }
      return h;
    }
    const slope = (x) => ((H(x + 0.5) - H(x - 0.5)) / 1) * V; // drawn slope, rising ahead positive
    const inFog = (x) => fogs.some((f) => Math.abs(x - f.x) < f.w / 2);

    function say(m, sec = 2.4) { s.msg = m; s.msgT = sec; }

    // ---- stirring ----
    const stir = { on: false, angle: 0, pts: [], cx: 0, cy: 0, last: null, worldX: 0, key: 0 };
    let reticleOff = -14; // keyboard reticle, metres from the boat
    function applyStir(worldX, angle) {
      const circles = Math.floor(Math.abs(angle) / (Math.PI * 2));
      if (circles < 1) return;
      worldX = Math.max(s.x - 40, Math.min(s.x + 40, worldX));
      if (angle > 0) {
        const tier = Math.min(MAX_TIER, circles - 1), T = TIERS[tier];
        if (T.fog) { fogs.push({ x: worldX, w: 80, life: 16, age: 0 }); say("Fog. The cutter loses you in it."); }
        else {
          const reef = ROCKS.find((r) => Math.abs(r - worldX) < 14);
          if (reef != null) { crests.push({ x: reef, h: T.h, h0: T.h, sigma: T.sigma + 2, age: 0, life: 12, v: 0 }); say(T.name + " over the reef: the tide stands on it a while"); }
          else { crests.push({ x: worldX, h: T.h, h0: T.h, sigma: T.sigma, age: 0, life: 15, v: 9 }); say(T.name + " raised" + (tier === MAX_TIER ? ": mind your own sea" : "")); }
        }
        for (let i = 0; i < 12; i++) sprays.push({ x: worldX + (rng() - 0.5) * 10, y: 0, vx: (rng() - 0.5) * 4, vy: 3 + rng() * 4, life: 1 });
      } else {
        crests = crests.filter((c) => Math.abs(c.x - worldX) > 18);
        calms.push({ x: worldX, r: 22, life: 7 });
        say("Stilled");
      }
    }

    // ---- input ----
    const keys = {};
    const held = { trimUp: false, trimDown: false, climb: false, run: false };
    const onKey = (e, down) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "q", "e", "arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(k)) e.preventDefault();
      if (!running) return;
      if ((k === "e" || k === "q") && down && !keys[k]) { stir.on = true; stir.key = k === "e" ? 1 : -1; stir.angle = 0; stir.pts = []; }
      if ((k === "e" || k === "q") && !down && stir.key) { applyStir(s.x + reticleOff, stir.angle); stir.on = false; stir.key = 0; }
      keys[k] = down;
    };
    const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
    addEventListener("keydown", kd); addEventListener("keyup", ku);

    let W = 0, Hh = 0, dpr = 1, ppm = 8, boatSX = 0, seaY = 0;
    const toWorldX = (px) => s.x + (px - boatSX) / ppm;
    let hoverPx = null;
    function ptr(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    const pd = (e) => {
      if (!running) return;
      const [px, py] = ptr(e);
      if (py < Hh * 0.2) return;
      cv.setPointerCapture?.(e.pointerId);
      stir.on = true; stir.key = 0; stir.angle = 0; stir.pts = [[px, py]]; stir.cx = px; stir.cy = py; stir.last = null;
      stir.worldX = toWorldX(px);
      e.preventDefault();
    };
    const pm = (e) => {
      const [px, py] = ptr(e);
      hoverPx = px;
      if (!stir.on || stir.key) return;
      stir.pts.push([px, py]);
      if (stir.pts.length > 120) stir.pts.shift();
      const n = stir.pts.length;
      stir.cx += (px - stir.cx) / Math.min(n, 30); stir.cy += (py - stir.cy) / Math.min(n, 30);
      const dx = px - stir.cx, dy = py - stir.cy;
      if (dx * dx + dy * dy < 64) return;
      const a = Math.atan2(dy, dx);
      if (stir.last != null) { let d = a - stir.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; stir.angle += d; }
      stir.last = a;
    };
    const pu = () => { if (stir.on && !stir.key) { applyStir(stir.worldX, stir.angle); stir.on = false; } };
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm);
    cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    const btns = [...wrap.querySelectorAll("." + P + "pad button")];
    const bdn = (e) => { const k = e.currentTarget.dataset.k; held[k] = true; e.currentTarget.classList.add("on"); e.preventDefault(); };
    const bup = (e) => { const k = e.currentTarget.dataset.k; held[k] = false; e.currentTarget.classList.remove("on"); };
    for (const b of btns) { b.addEventListener("pointerdown", bdn); b.addEventListener("pointerup", bup); b.addEventListener("pointerleave", bup); b.addEventListener("pointercancel", bup); }

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = wrap.clientWidth; Hh = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      ppm = Math.max(4.2, Math.min(11, W / 120));
      boatSX = W * 0.36;
      seaY = Hh * 0.56;
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // ---- simulation ----
    function capsize(why) {
      s.capsized = 1.6; s.broad = 0;
      const cp = BUOYS.filter((b) => b <= s.x - 5).pop() || 0;
      say(why + " Back to the buoy.", 2.6);
      s.pendingCp = cp;
    }
    function step(dt) {
      t += dt;
      if (s.msgT > 0) s.msgT -= dt;
      crests.forEach((c) => { c.age += dt; c.x += c.v * dt; c.h = c.h0 * Math.max(0, 1 - (c.age / c.life) ** 2); });
      crests = crests.filter((c) => c.age < c.life);
      fogs.forEach((f) => { f.age += dt; f.x += 2.5 * dt; }); fogs = fogs.filter((f) => f.age < f.life);
      calms.forEach((c) => (c.life -= dt)); calms = calms.filter((c) => c.life > 0);
      sprays.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 9 * dt; p.life -= dt * 0.9; }); sprays = sprays.filter((p) => p.life > 0);
      if (stir.on && stir.key) stir.angle += stir.key * (Math.PI * 2 / 0.55) * dt;
      if (keys["arrowleft"]) reticleOff = Math.max(-40, reticleOff - 30 * dt);
      if (keys["arrowright"]) reticleOff = Math.min(40, reticleOff + 30 * dt);

      if (s.capsized > 0) {
        s.capsized -= dt;
        if (s.capsized <= 0) { s.x = s.pendingCp; s.v = 5; crests = []; fogs = []; resetCutters(); }
        return;
      }
      // sail
      if (keys["d"] || held.trimUp) s.trim = Math.min(1, s.trim + 0.6 * dt);
      if (keys["a"] || held.trimDown) s.trim = Math.max(0.3, s.trim - 0.6 * dt);
      s.helm = (keys["w"] || keys["arrowup"] || held.climb) ? 1 : (keys["s"] || keys["arrowdown"] || held.run) ? -1 : 0;
      const sl = slope(s.x);
      let target = 8.2 * s.trim;
      if (sl < 0) target *= 1 + Math.min(0.6, -sl * (s.helm === -1 ? 1.6 : 1.1));          // surf
      else target *= 1 - Math.min(0.55, sl * (s.helm === 1 ? 0.45 : 0.9));                 // climb
      s.v += (target - s.v) * Math.min(1, dt * 1.8);
      s.x += s.v * dt;
      // broadside
      const steep = Math.abs(sl) > STEEP;
      const matched = (sl > 0 && s.helm === 1) || (sl < 0 && s.helm === -1);
      if (steep && !matched) { s.broad += dt; if (s.broad > 1.5) { capsize("Broadside to the face: over she goes."); return; } }
      else s.broad = Math.max(0, s.broad - dt * 2);
      // reef
      for (const r of ROCKS) {
        if (s.x > r - 2 && s.x < r + 2 && H(r) < 0.6 && !s.rockHit) { s.rockHit = r; capsize("Struck the reef: not enough water over it."); return; }
      }
      if (s.rockHit && Math.abs(s.x - s.rockHit) > 10) s.rockHit = 0;
      // lighthouse beam
      const beamOn = (t % 7) < 3.2;
      if (beamOn && Math.abs(s.x - LIGHT_X) < 70 && !inFog(s.x)) {
        s.notice = Math.min(100, s.notice + 2 * dt);
      }
      if (s.notice >= 50 && !s.second) { s.second = true; cutters.push({ x: s.x - 180, v: 7, stall: 0, grap: 0 }); say("Notice 50: a second cutter puts out.", 3); }
      // cutters
      let grapMax = 0;
      for (const c of cutters) {
        const csl = slope(c.x);
        if (c.stall > 0) c.stall -= dt;
        else if (Math.abs(csl) > STEEP) { c.stall = 2.5; say("The cutter broaches on your crest."); }
        const blind = inFog(c.x) || inFog(s.x);
        let cv2 = 9.3;
        if (csl > 0) cv2 *= 1 - Math.min(0.6, csl * 1.2);
        if (blind) cv2 *= 0.55;
        if (c.stall > 0) cv2 = 1.5;
        c.v += (cv2 - c.v) * Math.min(1, dt * 1.5);
        c.x += c.v * dt;
        if (c.x > s.x - 4) c.x = s.x - 4;
        const gap = s.x - c.x;
        if (gap < 25 && !blind && c.stall <= 0) c.grap += dt; else c.grap = Math.max(0, c.grap - dt * 1.5);
        grapMax = Math.max(grapMax, c.grap);
      }
      s.grap = grapMax;
      if (grapMax >= 4) { finish(false); return; }
      if (s.x >= LENGTH) finish(true);
    }

    function finish(won) {
      if (over) return;
      over = true; running = false;
      const secs = Math.round(t);
      if (won) api.end({ outcome: "win", text: `Into the Spice Mouth in ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}, the cutter still beating up behind. Notice ${Math.round(s.notice)}.` });
      else api.end({ outcome: "lose", text: `Grapnel fast: the cutter has you, ${((LENGTH - s.x) / NM).toFixed(2)} nm short. Caught: notice +10, and the run ends here.` });
    }

    // ---- drawing ----
    const wx = (x) => boatSX + (x - s.x) * ppm;
    const wy = (h) => seaY - h * ppm * V;
    function hatch(x0, y0, x1, y1, gap, ang, alpha) {
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      g.strokeStyle = INK; g.globalAlpha = alpha; g.lineWidth = 0.6; g.beginPath();
      const d = (x1 - x0) + (y1 - y0);
      for (let k = -d; k < d; k += gap) { g.moveTo(x0 + k, y0); g.lineTo(x0 + k + (y1 - y0) * Math.tan(ang), y1); }
      g.stroke(); g.restore();
    }
    function drawBoat(x, cutter, alpha = 1) {
      const sx = wx(x), h = H(x), sy = wy(h), a = Math.atan(-slope(x) / 1) * 0.9;
      const k = ppm / 8;
      g.save(); g.globalAlpha = alpha; g.translate(sx, sy); g.rotate(a); g.scale(k, k);
      g.lineWidth = 1.4; g.strokeStyle = INK; g.fillStyle = PAPER;
      if (!cutter) {
        g.beginPath(); g.moveTo(-26, -6); g.quadraticCurveTo(-22, 6, 0, 7); g.quadraticCurveTo(22, 6, 30, -8); g.closePath(); g.fill(); g.stroke();
        for (let i = -20; i < 26; i += 4) { g.beginPath(); g.moveTo(i, -5); g.lineTo(i + 3, 5); g.lineWidth = 0.5; g.stroke(); }
        g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -62); g.stroke();
        g.beginPath(); g.moveTo(2, -60); g.quadraticCurveTo(14 + s.trim * 10, -34, 2, -10); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
        g.beginPath(); g.moveTo(-2, -56); g.quadraticCurveTo(-16 - s.trim * 6, -30, -24, -10); g.lineTo(-2, -10); g.closePath(); g.fill(); g.stroke();
        g.lineWidth = 0.4; for (let i = -54; i < -12; i += 3) { g.beginPath(); g.moveTo(3, i); g.lineTo(6 + s.trim * 7 * Math.sin(((i + 60) / 50) * Math.PI), i); g.stroke(); }
        g.fillStyle = GOLD; g.beginPath(); g.moveTo(0, -62); g.lineTo(9, -59); g.lineTo(0, -56); g.fill();
      } else {
        g.beginPath(); g.moveTo(-40, -8); g.lineTo(-36, 8); g.quadraticCurveTo(0, 12, 34, 8); g.lineTo(44, -10); g.closePath(); g.fillStyle = INK; g.fill();
        g.strokeStyle = PAPER; g.lineWidth = 0.6; for (let i = -30; i < 34; i += 8) { g.strokeRect(i, -4, 3, 3); }
        g.strokeStyle = INK; g.lineWidth = 1.6;
        for (const m of [-14, 12]) { g.beginPath(); g.moveTo(m, -8); g.lineTo(m, -78); g.stroke(); }
        g.fillStyle = PAPER; g.lineWidth = 1;
        for (const m of [-14, 12]) for (let j = 0; j < 3; j++) { const y = -72 + j * 20; g.beginPath(); g.moveTo(m - 13 + j, y); g.lineTo(m + 13 - j, y); g.lineTo(m + 15 - j, y + 16); g.lineTo(m - 15 + j, y + 16); g.closePath(); g.fill(); g.stroke(); }
        g.fillStyle = RED; g.beginPath(); g.moveTo(12, -78); g.lineTo(28, -74); g.lineTo(12, -70); g.fill();
        g.beginPath(); g.moveTo(44, -10); g.lineTo(62, -24); g.stroke();
      }
      g.restore();
    }

    function draw() {
      g.fillStyle = PAPER; g.fillRect(0, 0, W, Hh);
      const top = Hh * 0.09, coastTop = top + 6, coastBot = Hh * 0.17;
      // chart strip
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(10.5, 8.5, W - 21, top - 6);
      const cx0 = 26, cx1 = W - 40, cy = 8 + (top - 6) * 0.62;
      g.setLineDash([3, 4]); g.beginPath(); g.moveTo(cx0, cy); g.lineTo(cx1, cy); g.stroke(); g.setLineDash([]);
      g.beginPath(); for (let i = 0; i <= 60; i++) { const x = cx0 + ((cx1 - cx0) * i) / 60; const y = 8 + (top - 6) * (0.32 + 0.12 * Math.sin(i * 0.7) * Math.cos(i * 0.23)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      const pinX = cx0 + (cx1 - cx0) * Math.min(1, s.x / LENGTH);
      g.fillStyle = RED; g.beginPath(); g.arc(pinX, cy - 7, 4, 0, 7); g.fill(); g.beginPath(); g.moveTo(pinX, cy - 3); g.lineTo(pinX, cy + 3); g.strokeStyle = RED; g.stroke();
      g.strokeStyle = INK; g.beginPath(); g.arc(cx1 + 10, cy, 6, 0, 7); g.stroke(); g.beginPath(); g.arc(cx1 + 10, cy, 1.5, 0, 7); g.fillStyle = INK; g.fill();
      g.font = `italic ${Math.max(11, Math.min(14, W / 70))}px 'IM Fell English',Georgia,serif`; g.fillStyle = INK;
      g.textAlign = "left"; g.fillText(`${(Math.min(s.x, LENGTH) / NM).toFixed(2)} nm of ${(LENGTH / NM).toFixed(1)}`, 18, 8 + (top - 6) * 0.92);
      g.textAlign = "right"; g.fillText("SPICE MOUTH", cx1 - 6, 8 + (top - 6) * 0.92);
      // coast strip: moorings lift as crests roll on
      g.save(); g.beginPath(); g.rect(10, coastTop, W - 20, coastBot - coastTop); g.clip();
      g.strokeStyle = INK; g.beginPath(); g.moveTo(10, coastBot - 2); g.lineTo(W - 10, coastBot - 2); g.stroke();
      const swell = crests.reduce((a, c) => a + c.h, 0);
      for (let i = 0; i < Math.ceil(W / 46) + 1; i++) {
        const x = ((i * 46 - (s.x * 0.6) % 46) + 46) % (W + 46) - 10;
        const bob = Math.sin(t * 1.4 + i) * (1 + swell * 1.2);
        if (i % 4 === 1) { g.fillStyle = INK; g.fillRect(x, coastBot - 14, 10, 12); g.beginPath(); g.moveTo(x - 1, coastBot - 14); g.lineTo(x + 5, coastBot - 20); g.lineTo(x + 11, coastBot - 14); g.fill(); }
        else { g.beginPath(); g.moveTo(x, coastBot - 5 + bob); g.quadraticCurveTo(x + 6, coastBot - 1 + bob, x + 12, coastBot - 5 + bob); g.moveTo(x + 6, coastBot - 4 + bob); g.lineTo(x + 6, coastBot - 16 + bob); g.stroke(); }
      }
      g.restore();
      // sky hatching and clouds
      hatch(10, coastBot + 2, W - 10, seaY + 4, 7, 0.9, 0.12);
      for (let i = 0; i < 5; i++) {
        const x = ((i * 260 - s.x * 0.35 * ppm * 0.3) % (W + 300) + W + 300) % (W + 300) - 150, y = coastBot + 30 + (i % 3) * 22;
        g.fillStyle = PAPER; g.strokeStyle = INK; g.lineWidth = 1;
        g.beginPath(); for (let j = 0; j < 5; j++) g.arc(x + j * 22, y + (j % 2) * 4, 16 + (j % 3) * 4, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
      }
      // lighthouse and beam
      const lx = wx(LIGHT_X);
      if (lx > -200 && lx < W + 200) {
        const ly = coastBot + 6;
        if ((t % 7) < 3.2) {
          g.save(); g.globalAlpha = 0.28; g.fillStyle = GOLD;
          g.beginPath(); g.moveTo(lx, ly + 8); g.lineTo(lx - 70 * ppm, seaY); g.lineTo(lx + 70 * ppm, seaY); g.closePath();
          g.globalAlpha = 0.14; g.fill(); g.restore();
          hatch(lx - 70 * ppm, seaY - 26, lx + 70 * ppm, seaY + 2, 5, -0.6, 0.35);
        }
        g.fillStyle = PAPER; g.strokeStyle = INK; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(lx - 6, ly + 34); g.lineTo(lx - 3, ly + 6); g.lineTo(lx + 3, ly + 6); g.lineTo(lx + 6, ly + 34); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = GOLD; g.fillRect(lx - 3, ly + 1, 6, 5); g.strokeRect(lx - 3, ly + 1, 6, 5);
        for (let k = 0; k < 3; k++) { g.fillStyle = RED; g.fillRect(lx - 4.5 + k * 0.5, ly + 12 + k * 8, 9 - k, 3); }
      }
      // sea: engraved lines following the surface
      const step = 4;
      const xs = []; for (let px = -step; px <= W + step; px += step) xs.push(px);
      const hs = xs.map((px) => H(s.x + (px - boatSX) / ppm));
      for (let L = 0; L < 46; L++) {
        const depth = L * (6 + L * 0.35);
        const damp = Math.exp(-L * 0.09);
        g.beginPath();
        for (let i = 0; i < xs.length; i++) { const y = seaY - hs[i] * ppm * V * damp + depth; i ? g.lineTo(xs[i], y) : g.moveTo(xs[i], y); }
        g.strokeStyle = INK; g.lineWidth = L === 0 ? 1.6 : Math.max(0.35, 1.1 - L * 0.02); g.stroke();
        if (L < 10) { // burin swelling on steep faces
          g.lineWidth = 2.2 - L * 0.15;
          g.beginPath();
          for (let i = 1; i < xs.length; i++) {
            const sl = Math.abs(hs[i] - hs[i - 1]) / (step / ppm) * V;
            if (sl > 0.32) { g.moveTo(xs[i - 1], seaY - hs[i - 1] * ppm * V * damp + depth); g.lineTo(xs[i], seaY - hs[i] * ppm * V * damp + depth); }
          }
          g.stroke();
        }
      }
      // fog banks
      for (const f of fogs) {
        const fx = wx(f.x), fw = f.w * ppm, al = Math.min(1, (f.life - f.age) / 3);
        g.save(); g.globalAlpha = 0.85 * al; g.fillStyle = PAPER;
        g.beginPath(); g.ellipse(fx, seaY - 18, fw / 2, 46, 0, 0, 7); g.fill();
        g.globalAlpha = 0.6 * al; g.strokeStyle = INK; g.lineWidth = 0.6;
        for (let k = -4; k <= 4; k++) { g.setLineDash([2, 5]); g.beginPath(); g.ellipse(fx, seaY - 18 + k * 7, fw / 2 * (1 - Math.abs(k) * 0.09), 4, 0, Math.PI, 0); g.stroke(); }
        g.setLineDash([]); g.restore();
      }
      // reef
      for (const r of ROCKS) {
        const rx = wx(r); if (rx < -60 || rx > W + 60) continue;
        const ry = wy(0.9);
        g.fillStyle = BROWN; g.strokeStyle = INK; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(rx - 4 * ppm, seaY + 26); g.lineTo(rx - 2.4 * ppm, ry + 6); g.lineTo(rx - 0.5 * ppm, ry); g.lineTo(rx + 1.3 * ppm, ry + 4); g.lineTo(rx + 4.2 * ppm, seaY + 26); g.closePath(); g.fill(); g.stroke();
        hatch(rx - 4 * ppm, ry, rx + 4 * ppm, seaY + 26, 3.5, 0.3, 0.7);
        if (Math.abs(r - s.x) < 90) {
          const over = H(r);
          g.fillStyle = over >= 0.6 ? GREEN : RED; g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.textAlign = "center";
          g.fillText(`${over.toFixed(1)} m over the reef`, rx, ry - 14);
        }
      }
      // buoys
      for (const b of BUOYS.slice(1)) {
        const bx = wx(b); if (bx < -20 || bx > W + 20) continue;
        const by = wy(H(b));
        g.fillStyle = RED; g.strokeStyle = INK; g.beginPath(); g.moveTo(bx - 5, by); g.lineTo(bx, by - 16); g.lineTo(bx + 5, by); g.closePath(); g.fill(); g.stroke();
      }
      // port
      const px = wx(LENGTH);
      if (px < W + 80) { g.strokeStyle = INK; g.lineWidth = 1.2; for (let k = 0; k < 6; k++) { g.strokeRect(px + k * 26, seaY - 40 - (k % 3) * 14, 22, 40 + (k % 3) * 14); } g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "left"; g.fillText("Spice Mouth", px, seaY - 80); }
      // cutters and boat
      for (const c of cutters) if (wx(c.x) > -120) drawBoat(c.x, true, inFog(c.x) ? 0.35 : 1);
      if (s.capsized > 0) {
        g.save(); g.translate(boatSX, wy(H(s.x))); g.rotate(Math.PI * 0.55 * Math.min(1, (1.6 - s.capsized) * 2)); g.translate(-boatSX, -wy(H(s.x))); drawBoat(s.x, false); g.restore();
      } else drawBoat(s.x, false);
      // grapnel line
      for (const c of cutters) if (c.grap > 0) {
        g.strokeStyle = RED; g.lineWidth = 1.4; g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(wx(c.x) + 40 * ppm / 8, wy(H(c.x)) - 20); g.quadraticCurveTo((wx(c.x) + boatSX) / 2, wy(H(s.x)) - 40, boatSX - 18, wy(H(s.x)) - 4); g.stroke(); g.setLineDash([]);
      }
      // spray
      g.fillStyle = INK; for (const p of sprays) { g.globalAlpha = p.life; g.fillRect(wx(p.x), wy(H(p.x) + p.y), 2, 2); } g.globalAlpha = 1;
      // reticle and stir spiral
      const rX = stir.on ? (stir.key ? s.x + reticleOff : stir.worldX) : (hoverPx != null ? toWorldX(hoverPx) : s.x + reticleOff);
      const rc = Math.max(s.x - 40, Math.min(s.x + 40, rX));
      const rsx = wx(rc), rsy = wy(H(rc));
      g.strokeStyle = RED; g.lineWidth = 1.2; g.beginPath(); g.arc(rsx, rsy, 14, 0, 7); g.moveTo(rsx - 20, rsy); g.lineTo(rsx + 20, rsy); g.moveTo(rsx, rsy - 20); g.lineTo(rsx, rsy + 20); g.stroke();
      if (stir.on) {
        const circles = Math.floor(Math.abs(stir.angle) / (Math.PI * 2));
        g.strokeStyle = stir.angle >= 0 ? RED : INK;
        for (let k = 0; k < circles; k++) { g.beginPath(); g.arc(rsx, rsy, 20 + k * 7, 0, 7); g.stroke(); }
        if (!stir.key && stir.pts.length > 1) { g.globalAlpha = 0.6; g.beginPath(); stir.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.globalAlpha = 1; }
        g.font = "italic 16px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "center";
        const lbl = circles < 1 ? "circle…" : stir.angle > 0 ? TIERS[Math.min(MAX_TIER, circles - 1)].name : "Still";
        g.fillText(lbl, rsx, rsy - 30 - circles * 7);
      }
      // margins: compass rose, scale bar, meters
      const rx0 = W - 52, ry0 = Hh - 92;
      g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.arc(rx0, ry0, 26, 0, 7); g.stroke();
      g.fillStyle = INK; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; g.beginPath(); g.moveTo(rx0 + Math.cos(a) * 30, ry0 + Math.sin(a) * 30); g.lineTo(rx0 + Math.cos(a + 0.5) * 6, ry0 + Math.sin(a + 0.5) * 6); g.lineTo(rx0 + Math.cos(a - 0.5) * 6, ry0 + Math.sin(a - 0.5) * 6); g.fill(); }
      const sbx = 18, sby = Hh - 66;
      for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? PAPER : INK; g.fillRect(sbx + k * 10 * ppm / 2, sby, 10 * ppm / 2, 5); } g.strokeRect(sbx, sby, 25 * ppm, 5);
      g.font = "11px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "left"; g.fillText("25 metres", sbx, sby + 17);
      // status line
      g.font = `${Math.max(13, Math.min(16, W / 60))}px 'IM Fell English',Georgia,serif`;
      const cut = cutters.reduce((m, c) => Math.min(m, s.x - c.x), 1e9);
      const items = [
        `trim ${Math.round(s.trim * 100)}%`,
        `helm ${s.helm === 1 ? "climb" : s.helm === -1 ? "run" : "steady"}`,
        `${s.v.toFixed(1)} m/s`,
        `cutter ${Math.max(0, cut).toFixed(0)} m`,
        `notice ${Math.round(s.notice)}`,
      ];
      const line = items.join("  ·  ");
      g.textAlign = "left"; g.fillStyle = PAPER; g.fillRect(12, coastBot + 4, g.measureText(line).width + 12, 22); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(12.5, coastBot + 4.5, g.measureText(line).width + 11, 21);
      g.fillStyle = INK; g.fillText(line, 18, coastBot + 20);
      for (const c of cutters) if (wx(c.x) < 10) { const y = wy(H(s.x)) - 40; g.fillStyle = RED; g.beginPath(); g.moveTo(10, y); g.lineTo(22, y - 7); g.lineTo(22, y + 7); g.fill(); g.textAlign = "left"; g.fillText(`cutter ${Math.round(s.x - c.x)} m`, 26, y + 5); }
      if (s.broad > 0.05) { g.fillStyle = RED; g.fillText(`broadside ${s.broad.toFixed(1)} / 1.5 s: ${slope(s.x) > 0 ? "climb (W)" : "run (S)"}`, 18, coastBot + 46); }
      if (s.grap > 0) { g.fillStyle = RED; g.fillText(`grapnel ${s.grap.toFixed(1)} / 4 s`, 18, coastBot + 66); }
      if (s.msgT > 0) { g.font = `italic ${Math.max(16, Math.min(22, W / 45))}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.fillStyle = INK; g.globalAlpha = Math.min(1, s.msgT); g.fillText(s.msg, W / 2, seaY - Math.min(140, Hh * 0.2)); g.globalAlpha = 1; }
      // plate border
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(4.5, 4.5, W - 9, Hh - 9);
    }

    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) step(dt);
      else if (!reduce && !over) t += dt * 0.5;
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const startBtn = how.querySelector("button");
    const start = () => { how.remove(); running = true; last = performance.now(); say("Stir behind you and surf the face.", 3); };
    startBtn.addEventListener("click", start);
    startBtn.focus();

    return {
      unmount() {
        cancelAnimationFrame(raf);
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        ro.disconnect();
        running = false;
      },
    };
  },
};

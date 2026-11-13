// People of the Bark — Crack runner (2D, pixel art).
// DESIGN.md 10, Mode A, cut to one spring run (c2_run): Highridge down the Long Crack to Lowridge,
// three segments, one dawn tremor. Move, jump, cling (3 s stamina), roll under dust, brace through
// the tremor. A fall into the dark is caught by lichen lower down and costs 8 seconds. Arrive
// before the limit to win; arrive late and the run is lost (morale −3).
// Cut to fit: limit 2:45 instead of 5:00; hazards are spring's (drip, dust, spikes, lichen, rain bead).

const PIX16 = ["#1b120c", "#2e2016", "#4a3324", "#5a3d2b", "#7a5a40", "#7d6c5a", "#a8977f", "#8fa37a",
  "#c4d65a", "#d9902a", "#f0c050", "#e8742a", "#b8402a", "#efe2c4", "#c9b99a", "#fff6dc"];
const T = 8;                 // tile size in logical pixels
const BODY = 10;             // one body-length in pixels (Mossa is ~10 px tall)
const RUN = 6 * BODY;        // 6 body-lengths per second
const GRAV = 720;
const JUMP = Math.sqrt(2 * GRAV * 2.6 * BODY); // 2.5 body-lengths high, a little slack
const LIMIT = 165;           // seconds
const TREMOR_AT = 42;        // seconds into the run
const SEGS = 3, SEG_W = 140, COLS = SEGS * SEG_W + 8, ROWS = 46;

function rngFrom(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function buildLevel() {
  const r = rngFrom(20261113);
  const ground = new Array(COLS).fill(14);
  const pit = new Array(COLS).fill(false);
  const haz = { spikes: [], lichen: [], drips: [], dust: [], walls: [] };
  let g = 14, x = 0;
  const flat = (n) => { for (let i = 0; i < n && x < COLS; i++) ground[x++] = g; };
  flat(9);
  while (x < COLS - 8) {
    const seg = Math.min(SEGS - 1, Math.floor(x / SEG_W));
    flat(4 + Math.floor(r() * 4));
    const roll = r();
    if (roll < 0.42 || g < 12) { g = Math.min(ROWS - 6, g + 2 + Math.floor(r() * 3)); }           // drop
    else if (roll < 0.56) { g = Math.max(8, g - 1 - Math.floor(r() * 2)); }                        // step up
    else if (roll < 0.82) {                                                                         // gap
      const w = 2 + Math.floor(r() * 2);
      for (let i = 0; i < w && x < COLS; i++) { pit[x] = true; ground[x++] = 99; }
      g = Math.min(ROWS - 6, g + Math.floor(r() * 2));
    } else if (seg >= 1 && g > 22) { g -= 4; haz.walls.push(x); }                                  // tall wall: cling
    else { g = Math.min(ROWS - 6, g + 3); }
  }
  while (x < COLS) ground[x++] = g;
  // never drop more than the level allows near the end
  const ceil = ground.map((_, i) => {
    let m = 99;
    for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < COLS && !pit[j]) m = Math.min(m, ground[j]); }
    return m - 7 - Math.floor(r() * 2);
  });
  // hazards on flat, non-edge columns
  const okCol = (i) => i > 10 && i < COLS - 8 && [-2, -1, 0, 1, 2].every((k) => !pit[i + k] && ground[i + k] === ground[i]);
  const plan = [
    { spikes: 4, drips: 4, lichen: 2, dust: 1 },
    { spikes: 4, drips: 4, lichen: 3, dust: 4 },
    { spikes: 6, drips: 4, lichen: 3, dust: 4 },
  ];
  const used = new Set();
  for (let s = 0; s < SEGS; s++) {
    for (const kind of ["spikes", "drips", "lichen", "dust"]) {
      for (let n = 0; n < plan[s][kind]; n++) {
        for (let tries = 0; tries < 40; tries++) {
          const c = s * SEG_W + 4 + Math.floor(r() * (SEG_W - 8));
          if (!okCol(c) || used.has(c) || used.has(c - 1) || used.has(c + 1) || used.has(c - 2) || used.has(c + 2)) continue;
          if (haz.walls.some((w) => Math.abs(w - c) < 3)) continue;
          used.add(c); haz[kind].push(c); break;
        }
      }
    }
  }
  // a lichen tuft at the foot of every tall wall, as the source of a second way up
  for (const w of haz.walls) if (!pit[w - 2]) haz.lichen.push(w - 2);
  return { ground, ceil, pit, haz };
}

export default {
  mount(root, api) {
    const P = "people-of-the-bark-crack-runner-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    let raf = 0;
    const timers = [];

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;background:#1b120c;overflow:hidden;font-family:'Silkscreen',ui-monospace,monospace;color:#efe2c4;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}cv{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);image-rendering:pixelated;image-rendering:crisp-edges}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.86);z-index:5;padding:16px}
.${P}card{max-width:460px;border:4px solid #7a5a40;background:#2e2016;padding:18px 20px;box-shadow:0 0 0 4px #1b120c, 0 0 0 8px #4a3324}
.${P}card h2{margin:0 0 8px;font-size:18px;color:#f0c050;font-weight:400;letter-spacing:.06em}
.${P}card p{margin:0 0 10px;font-size:12px;line-height:1.6;color:#efe2c4}
.${P}card p b{color:#c4d65a;font-weight:400}
.${P}btn{font:inherit;font-size:13px;color:#1b120c;background:#f0c050;border:0;padding:8px 16px;cursor:pointer;box-shadow:0 4px 0 #d9902a}
.${P}btn:focus-visible{outline:3px solid #c4d65a;outline-offset:2px}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:none;justify-content:space-between;padding:10px;gap:8px;z-index:3;pointer-events:none}
.${P}pad.${P}show{display:flex}
.${P}grp{display:flex;gap:8px;pointer-events:auto}
.${P}k{width:54px;height:54px;border:3px solid #7a5a40;background:rgba(46,32,22,.82);color:#efe2c4;font:inherit;font-size:10px;display:grid;place-items:center;touch-action:none}
.${P}k.${P}on{background:#d9902a;color:#1b120c}
.${P}msg{position:absolute;left:50%;top:22%;transform:translateX(-50%);font-size:12px;color:#f0c050;text-shadow:2px 2px 0 #1b120c;pointer-events:none;text-align:center;z-index:2;white-space:nowrap}
@media (pointer:coarse){.${P}pad{display:flex}}
</style>
<canvas class="${P}cv"></canvas>
<div class="${P}msg"></div>
<div class="${P}pad"><div class="${P}grp"><button class="${P}k" data-k="left">◀</button><button class="${P}k" data-k="right">▶</button><button class="${P}k" data-k="brace">BRACE</button></div>
<div class="${P}grp"><button class="${P}k" data-k="roll">ROLL</button><button class="${P}k" data-k="cling">CLING</button><button class="${P}k" data-k="jump">JUMP</button></div></div>
<div class="${P}intro"><div class="${P}card">
<h2>CRACK RUNNER · SPRING</h2>
<p>Run Mossa down the Long Crack from Highridge to Lowridge before <b>${Math.floor(LIMIT / 60)}:${String(LIMIT % 60).padStart(2, "0")}</b>. <b>A/D</b> move, <b>Space</b> jump, hold <b>Shift</b> on a wall to cling (jump again to climb), <b>C</b> roll under falling dust.</p>
<p>A tremor is due at dawn. When <b>BRACE</b> lights, hold <b>S</b> on solid bark, or she is thrown down a ledge.</p>
<button class="${P}btn" type="button">Start the run</button></div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("." + P + "cv");
    const g = cv.getContext("2d");
    const msgEl = wrap.querySelector("." + P + "msg");
    const intro = wrap.querySelector("." + P + "intro");

    const L = buildLevel();
    const { ground, ceil, pit, haz } = L;
    const LVW = COLS * T, LVH = ROWS * T;

    // ---- logical screen size follows the aspect ratio ----
    let LW = 240, LH = 144;
    function fit() {
      const r = wrap.getBoundingClientRect();
      const aspect = Math.max(0.6, r.width / Math.max(1, r.height));
      LH = r.width < 520 ? 120 : 144;
      LW = Math.max(150, Math.min(320, Math.round(LH * aspect)));
      cv.width = LW; cv.height = LH;
      const sc = Math.min(r.width / LW, r.height / LH);
      cv.style.width = Math.floor(LW * sc) + "px";
      cv.style.height = Math.floor(LH * sc) + "px";
      g.imageSmoothingEnabled = false;
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);

    // ---- the bark, painted once ----
    const bark = document.createElement("canvas");
    bark.width = LVW; bark.height = LVH;
    (function paint() {
      const bg = bark.getContext("2d");
      const img = bg.createImageData(LVW, LVH);
      const rgb = PIX16.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      const r = rngFrom(77);
      const ridge = Array.from({ length: LVW }, () => [2, 3, 3, 4][Math.floor(r() * 4)]);
      for (let py = 0; py < LVH; py++) {
        for (let px = 0; px < LVW; px++) {
          const c = Math.floor(px / T), row = py / T;
          let col;
          const gr = ground[c], ce = ceil[c];
          if (row >= gr && !pit[c]) {
            const d = py - gr * T;
            col = d === 0 ? 6 : d === 1 ? 4 : ridge[px];
            if (d > 1 && px % 9 === 0) col = 1;
            if (d > 1 && (px + py) % 2 === 0 && r() < 0.16) col = Math.max(1, col - 1);
          } else if (row < ce + 1) {
            const d = (ce + 1) * T - py;
            col = d === 1 ? 5 : ridge[px];
            if (d > 1 && px % 7 === 0) col = 1;
            if ((px + py) % 2 === 0 && r() < 0.16) col = Math.max(1, col - 1);
          } else {
            col = ((px % 11 === 0) && ((py >> 2) % 3 !== 0)) ? 1 : 0;
            if ((px + py) % 2 === 0 && r() < 0.05) col = 1;
          }
          const k = (py * LVW + px) * 4, v = rgb[col];
          img.data[k] = v[0]; img.data[k + 1] = v[1]; img.data[k + 2] = v[2]; img.data[k + 3] = 255;
        }
      }
      bg.putImageData(img, 0, 0);
      const px = (x, y, w, h, c) => { bg.fillStyle = PIX16[c]; bg.fillRect(x, y, w, h); };
      // Highridge: lantern-lit doors at the start; Lowridge: lichen farms at the end
      for (let i = 0; i < 3; i++) { const x = 6 + i * 16, y = ground[1] * T - 14; px(x, y, 8, 14, 1); px(x + 2, y + 3, 4, 5, 11); px(x + 3, y + 4, 2, 2, 10); }
      const ex = (COLS - 6) * T, ey = ground[COLS - 6] * T;
      for (let i = 0; i < 4; i++) { px(ex + i * 8, ey - 3, 6, 3, 7); px(ex + i * 8 + 1, ey - 5, 4, 2, 8); }
      px(ex + 34, ey - 16, 9, 16, 1); px(ex + 36, ey - 12, 5, 6, 8);
      // segment checkpoints: carved posts
      for (let s = 1; s < SEGS; s++) { let c = s * SEG_W; while (pit[c]) c++; px(c * T + 2, ground[c] * T - 10, 3, 10, 6); px(c * T + 1, ground[c] * T - 12, 5, 3, 10); }
    })();

    // ---- state ----
    const keys = { left: false, right: false, jump: false, cling: false, roll: false, brace: false };
    const S = {
      started: false, over: false, t: 0, penalty: 0,
      x: 3 * T, y: ground[3] * T - 9, vx: 0, vy: 0, w: 6, h: 9, onGround: true, face: 1,
      stamina: 1, clinging: false, rollT: 0, rollCd: 0, stun: 0, sticky: 0, knock: 0, inv: 0, fallFrom: null,
      checkpoint: 3, tremorDone: false, braced: null, shake: 0, dustT: 0, jumpHeld: false,
      beads: [], beadClock: 3, msg: "", msgT: 0, anim: 0,
    };
    const solid = (tx, ty) => {
      if (tx < 0 || tx >= COLS) return true;
      if (ty <= ceil[tx]) return true;
      return !pit[tx] && ty >= ground[tx];
    };
    const say = (m, t = 1.6) => { S.msg = m; S.msgT = t; };
    function boxHits(x, y, w, h) {
      const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
      for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) if (solid(tx, ty)) return true;
      return false;
    }
    function respawn() {
      // caught by lichen below the gap, she climbs back to the last ledge she stood on
      let c = Math.max(S.checkpoint, S.safe || 3); while (pit[c]) c--;
      S.x = c * T + 1; S.y = ground[c] * T - S.h; S.vx = 0; S.vy = 0; S.fallFrom = null; S.stun = 0.4;
      S.penalty += 8; say("CAUGHT BY LICHEN  −8 S", 2);
    }

    // ---- input ----
    const KEYMAP = { KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right", Space: "jump", KeyW: "jump", ArrowUp: "jump",
      ShiftLeft: "cling", ShiftRight: "cling", KeyC: "roll", KeyS: "brace", ArrowDown: "brace" };
    on(window, "keydown", (e) => {
      const k = KEYMAP[e.code]; if (!k || !S.started) return;
      e.preventDefault(); keys[k] = true;
    });
    on(window, "keyup", (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
    on(window, "blur", () => { for (const k in keys) keys[k] = false; });
    wrap.querySelectorAll("." + P + "k").forEach((b) => {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); keys[k] = true; b.classList.add(P + "on"); try { b.setPointerCapture(e.pointerId); } catch { /* */ } };
      const up = () => { keys[k] = false; b.classList.remove(P + "on"); };
      on(b, "pointerdown", down); on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
    });
    const startBtn = intro.querySelector("button");
    on(startBtn, "click", () => { intro.remove(); S.started = true; last = performance.now(); });
    startBtn.focus();

    // ---- simulation ----
    function update(dt) {
      S.t += dt; S.anim += dt;
      if (S.msgT > 0) S.msgT -= dt;
      S.rollCd = Math.max(0, S.rollCd - dt); S.inv = Math.max(0, S.inv - dt); S.sticky = Math.max(0, S.sticky - dt);
      S.dustT = Math.max(0, S.dustT - dt); S.shake = Math.max(0, S.shake - dt);
      const elapsed = S.t + S.penalty;

      // tremor
      if (!S.tremorDone && S.t >= TREMOR_AT) {
        S.tremorDone = true; S.shake = 0.7;
        const braced = keys.brace && S.onGround;
        S.braced = braced;
        if (braced) say("BRACED. SHE STAYS ON HER FEET", 2.2);
        else {
          say("THE TREMOR THROWS HER DOWN", 2.2);
          S.stun = 1; S.dustT = 4; S.vy = -120; S.vx = RUN * 1.2; S.knock = 0.5; S.onGround = false;
        }
      }

      if (S.stun > 0) S.stun -= dt;
      const canAct = S.stun <= 0;
      let speed = RUN * (S.sticky > 0 ? 0.5 : 1);
      // roll
      if (canAct && keys.roll && S.rollCd <= 0 && S.onGround) { S.rollT = 0.38; S.rollCd = 0.9; keys.roll = false; }
      if (S.rollT > 0) { S.rollT -= dt; speed *= 1.9; }
      const rolling = S.rollT > 0;
      const bracing = keys.brace && S.onGround && canAct;
      let dir = 0;
      if (canAct && !bracing) { if (keys.left) dir -= 1; if (keys.right) dir += 1; }
      if (rolling && dir === 0) dir = S.face;
      if (dir) S.face = dir;
      if (S.knock > 0) S.knock -= dt;
      else S.vx = dir * speed;

      // cling
      const wallL = boxHits(S.x - 1, S.y + 2, 1, S.h - 4), wallR = boxHits(S.x + S.w, S.y + 2, 1, S.h - 4);
      S.clinging = canAct && !S.onGround && keys.cling && (wallL || wallR) && S.stamina > 0;
      if (S.clinging) { S.stamina = Math.max(0, S.stamina - dt / 3); S.vy = Math.min(S.vy, 8); S.fallFrom = S.y; }
      // jump (edge-triggered)
      if (keys.jump && !S.jumpHeld && canAct && (S.onGround || S.clinging)) {
        S.vy = -JUMP; S.onGround = false; S.fallFrom = S.y;
        if (S.clinging) { S.clinging = false; }
      }
      S.jumpHeld = keys.jump;
      if (!S.clinging) S.vy = Math.min(420, S.vy + GRAV * dt);

      // move x
      const h = rolling ? 5 : 9;
      if (h !== S.h) { if (h > S.h && boxHits(S.x, S.y - (h - S.h), S.w, h)) { /* stay low under a ceiling */ } else { S.y += S.h - h; S.h = h; } }
      let nx = S.x + S.vx * dt;
      if (!boxHits(nx, S.y, S.w, S.h)) S.x = nx;
      else if (S.onGround && !boxHits(nx, S.y - 2, S.w, S.h)) { S.x = nx; S.y -= 2; } // small lip
      else S.vx = 0;
      // dust sheets: only a roll passes under
      for (const c of haz.dust) {
        const dx0 = c * T, dx1 = dx0 + 2 * T;
        if (S.x + S.w > dx0 && S.x < dx1 && !rolling) {
          S.x = S.face > 0 ? dx0 - S.w : dx1; if (S.msgT <= 0) say("DUST. ROLL UNDER IT (C)", 1.2);
        }
      }
      // move y
      let ny = S.y + S.vy * dt;
      const wasGround = S.onGround;
      if (!boxHits(S.x, ny, S.w, S.h)) { S.y = ny; S.onGround = false; }
      else {
        if (S.vy > 0) {
          S.y = Math.floor((ny + S.h) / T) * T - S.h; S.onGround = true;
          if (S.fallFrom != null && S.y - S.fallFrom > 6 * BODY) { S.stun = 1; say("A LONG DROP. STUNNED", 1.2); }
          S.fallFrom = null;
        } else { S.y = Math.ceil(ny / T) * T; }
        S.vy = 0;
      }
      if (!S.onGround && wasGround && S.vy >= 0 && S.fallFrom == null) S.fallFrom = S.y;
      if (S.onGround) { S.stamina = 1; const sc = Math.floor((S.x + S.w / 2) / T); if (!pit[sc] && !pit[sc + 1] && !pit[sc - 1]) S.safe = sc; }
      if (S.y > LVH + 20) respawn();

      const col = Math.floor((S.x + S.w / 2) / T);
      // checkpoints
      const seg = Math.floor(col / SEG_W);
      if (seg > 0 && seg * SEG_W > S.checkpoint && col >= seg * SEG_W) { S.checkpoint = seg * SEG_W; say(`SEGMENT ${seg + 1}/${SEGS}`, 1.4); }
      // spikes
      if (S.inv <= 0) for (const c of haz.spikes) {
        const sx = c * T + 1, sy = ground[c] * T - 4;
        if (S.x + S.w > sx && S.x < sx + 6 && S.y + S.h > sy) { S.vx = -S.face * 80; S.knock = 0.25; S.vy = -130; S.onGround = false; S.inv = 1.3; say("SPLINTERS", 0.8); }
      }
      // lichen tufts bounce
      if (S.onGround) for (const c of haz.lichen) {
        if (col === c) { S.vy = -JUMP * 1.32; S.onGround = false; S.fallFrom = S.y; }
      }
      // sap drips
      for (const c of haz.drips) {
        const period = 1.7, ph = ((S.t + c * 0.37) % period) / period;
        const top = (ceil[c] + 1) * T, bot = ground[c] * T;
        const dy = top + ph * (bot - top);
        const dx = c * T + 3;
        if (S.x < dx + 2 && S.x + S.w > dx && S.y < dy + 3 && S.y + S.h > dy && S.sticky <= 0) { S.sticky = 2; say("STICKY SAP: SLOWED", 1); }
      }
      // rain beads roll down the groove toward her (segment 1 is spring rain)
      S.beadClock -= dt;
      if (S.beadClock <= 0 && col < SEG_W - 4) {
        S.beadClock = 4 + Math.random() * 2.5;
        const bc = Math.min(COLS - 2, col + Math.floor(LW / T * 0.6));
        if (!pit[bc]) S.beads.push({ x: bc * T, y: ground[bc] * T - 6, vx: -55 });
      }
      for (const b of S.beads) {
        b.x += b.vx * dt;
        const bc = Math.floor((b.x + 3) / T);
        if (bc < 0 || pit[bc]) { b.dead = true; continue; }
        const gy = ground[bc] * T - 6;
        b.y += Math.min(4, Math.max(-60 * dt, gy - b.y)); if (gy < b.y - 3) b.vx = -b.vx; // turns back at a step up
        if (S.inv <= 0 && !rolling && S.x < b.x + 6 && S.x + S.w > b.x && S.y < b.y + 6 && S.y + S.h > b.y) {
          if (S.vy > 40 && S.y + S.h < b.y + 4) { S.vy = -JUMP * 0.8; }
          else { S.vx = b.vx * 2.6; S.knock = 0.35; S.inv = 0.6; say("SWEPT BY A RAIN BEAD", 0.9); }
        }
      }
      S.beads = S.beads.filter((b) => !b.dead && Math.abs(b.x - S.x) < 400);

      // finish
      if (col >= COLS - 5) finish(elapsed);
    }

    function finish(elapsed) {
      if (S.over) return;
      S.over = true;
      const m = Math.floor(elapsed / 60), s = String(Math.floor(elapsed % 60)).padStart(2, "0");
      const brace = S.braced ? " She braced through the tremor." : " The tremor threw her down.";
      api.store.set("best", Math.min(api.store.get("best", 9999), elapsed));
      if (elapsed <= LIMIT) api.end({ outcome: "win", text: `Mossa reaches Lowridge in ${m}:${s}, on time. The reading arrives before the rumour does. On time +1.${brace}` });
      else api.end({ outcome: "lose", text: `Mossa reaches Lowridge in ${m}:${s}, after the limit of ${Math.floor(LIMIT / 60)}:${String(LIMIT % 60).padStart(2, "0")}. The reading arrives late; morale −3.${brace}` });
    }

    // ---- drawing ----
    function sprite(x, y) {
      const px = (dx, dy, c) => { g.fillStyle = PIX16[c]; g.fillRect(x + dx, y + dy, 1, 1); };
      const f = S.face;
      const X = (dx) => (f > 0 ? dx : 5 - dx);
      if (S.rollT > 0) {
        const rows = [".hhh..", "hbbbbr", "hbbbbr", ".bbbr."];
        rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== ".") px(X(i), 9 - rows.length + j, ch === "h" ? 14 : ch === "r" ? 12 : 5); }));
        return;
      }
      const run = S.onGround && Math.abs(S.vx) > 5 ? Math.floor(S.anim * 10) % 2 : 0;
      const legs = S.onGround ? (run ? ".l..l." : "..ll..") : ".l...l";
      const rows = ["..hh..", ".hhhh.", "..hh..", "rrrrb.", ".bbbb.", ".bbbb.", ".b..b.", legs, legs];
      rows.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === ".") return;
        px(X(i), j, ch === "h" ? 14 : ch === "r" ? 12 : ch === "l" ? 2 : 5);
      }));
      // the long scarf streams behind her
      const tail = S.onGround && !run ? 1 : 3;
      for (let k = 1; k <= tail; k++) px(X(-k), 3 + (k > 1 ? 1 : 0) + (run && k === 3 ? 1 : 0), 12);
      if (S.sticky > 0) { px(X(1), 8, 9); px(X(4), 8, 9); }
      if (S.stun > 0 && Math.floor(S.anim * 8) % 2) { px(X(1), -2, 10); px(X(4), -3, 10); }
    }

    function draw() {
      const shake = S.shake > 0 && !api.reducedMotion ? Math.round(Math.sin(S.t * 70) * 2) : 0;
      let cx = Math.round(S.x - LW * 0.4), cy = Math.round(S.y - LH * 0.55);
      cx = Math.max(0, Math.min(LVW - LW, cx)); cy = Math.max(0, Math.min(LVH - LH, cy));
      g.fillStyle = PIX16[0]; g.fillRect(0, 0, LW, LH);
      g.drawImage(bark, cx - shake, cy, LW, LH, 0, 0, LW, LH);
      g.save(); g.translate(-cx + shake, -cy);
      const px = (x, y, w, h, c) => { g.fillStyle = PIX16[c]; g.fillRect(x, y, w, h); };
      // spikes
      for (const c of haz.spikes) { const x = c * T, y = ground[c] * T; px(x + 1, y - 2, 6, 2, 6); px(x + 2, y - 4, 1, 2, 14); px(x + 5, y - 4, 1, 2, 14); px(x + 3, y - 5, 2, 3, 15); }
      // lichen tufts
      for (const c of haz.lichen) { const x = c * T, y = ground[c] * T; px(x, y - 3, 8, 3, 7); px(x + 1, y - 5, 2, 2, 8); px(x + 5, y - 5, 2, 2, 8); px(x + 3, y - 4, 2, 1, 8); }
      // sap drips
      for (const c of haz.drips) {
        const top = (ceil[c] + 1) * T, bot = ground[c] * T, ph = ((S.t + c * 0.37) % 1.7) / 1.7;
        px(c * T + 2, top, 4, 2, 9); px(c * T + 3, top + 2, 2, 1, 10);
        const dy = top + ph * (bot - top); px(c * T + 3, dy, 2, 3, 10); px(c * T + 3, dy + 2, 2, 1, 9);
        px(c * T + 1, bot - 1, 6, 1, 9);
      }
      // dust sheets: dithered falling columns
      for (const c of haz.dust) {
        const top = (ceil[c] + 1) * T, bot = ground[c] * T - 6, off = Math.floor(S.t * 30);
        for (let y = top; y < bot; y++) for (let x = 0; x < 16; x++) if (((x + y + off) & 1) === 0 && ((x * 7 + y + off) % 5 !== 0)) px(c * T + x, y, 1, 1, ((y + off) % 9 === 0) ? 15 : 14);
      }
      // rain beads
      for (const b of S.beads) { px(b.x + 1, b.y, 4, 6, 6); px(b.x, b.y + 1, 6, 4, 6); px(b.x + 1, b.y + 1, 2, 2, 15); }
      // Mossa
      sprite(Math.round(S.x), Math.round(S.y) - (9 - S.h > 0 ? 0 : 0));
      // stamina ring while clinging
      if (S.clinging || (S.stamina < 1 && !S.onGround)) {
        g.strokeStyle = PIX16[8]; g.lineWidth = 1;
        g.beginPath(); g.arc(Math.round(S.x + 3) + 0.5, Math.round(S.y + 4) + 0.5, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * S.stamina); g.stroke();
      }
      g.restore();

      // dust after an unbraced tremor
      if (S.dustT > 0) {
        const off = Math.floor(S.t * 20);
        for (let y = 12; y < LH; y += 1) for (let x = (y + off) & 1; x < LW; x += 2) if ((x * 13 + y * 7 + off) % 3 === 0) px(x, y, 1, 1, 14);
      }
      // HUD: the route strip
      px(0, 0, LW, 11, 1); px(0, 11, LW, 1, 4);
      const sx0 = 6, sx1 = LW - 6;
      for (let x = sx0; x < sx1; x += 3) px(x, 5, 2, 1, 6);
      px(sx0 - 2, 2, 4, 7, 11); px(sx1 - 2, 2, 4, 7, 7);
      for (let s = 1; s < SEGS; s++) px(Math.round(sx0 + (sx1 - sx0) * s / SEGS), 3, 1, 5, 5);
      const prog = Math.min(1, S.x / ((COLS - 5) * T));
      const mx = Math.round(sx0 + (sx1 - sx0) * prog);
      px(mx - 1, 2, 3, 7, 12); px(mx, 3, 1, 1, 14);
      // tremor mark: where she will be if she keeps par
      if (!S.tremorDone) { const tm = Math.round(sx0 + (sx1 - sx0) * Math.min(1, prog + (TREMOR_AT - S.t) / 130)); px(tm - 1, 2, 3, 2, 10); px(tm - 2, 4, 5, 1, 11); px(tm - 1, 5, 3, 3, 10); }
      g.font = "8px Silkscreen, monospace"; g.textBaseline = "top";
      const el = S.t + S.penalty, left = Math.max(0, LIMIT - el);
      const tm = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}`;
      g.fillStyle = PIX16[0]; g.fillRect(2, LH - 11, 82, 10);
      g.fillStyle = left < 20 ? PIX16[11] : PIX16[10];
      g.fillText(`SEG ${Math.min(SEGS, Math.floor(S.x / T / SEG_W) + 1)}/${SEGS} ${tm}`, 4, LH - 10);
      // brace marker, 3 s early (the forecast was right)
      if (!S.tremorDone && TREMOR_AT - S.t <= 3) {
        const blink = api.reducedMotion || Math.floor(S.t * 6) % 2 === 0;
        g.fillStyle = PIX16[0]; g.fillRect(LW - 46, 14, 44, 11);
        g.fillStyle = blink ? PIX16[11] : PIX16[9]; g.fillText("BRACE", LW - 42, 16);
      }
      if (S.sticky > 0) { g.fillStyle = PIX16[9]; g.fillText("STICKY", LW - 40, LH - 10); }
    }

    // ---- loop ----
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (S.started && !S.over) update(dt);
      draw();
      msgEl.textContent = S.msgT > 0 ? S.msg : "";
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return {
      unmount() {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        offs.forEach((f) => f());
        ro.disconnect();
        wrap.remove();
      },
    };
  },
};

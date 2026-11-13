// WrymWretch · Twin flight (2D, Ink-wash scroll). DESIGN.md section 10, Mode A; scene s_flight_aetherius
// (chapter 2, section 8): sky-sail descent; the confused winds tear the sail; Aeris falls; Aetherius
// catches her; the flight pauses on WW 145 and 149; then thermals and "silver trails across the sky".
//
// Three phases on one scroll:
//   I   The sail. Aeris alone on a sky-sail: pitch only, and her song (Q) calms the gusts for 3 s.
//   II  The fall. At the first seal the sail tears; Aeris falls for 6 s and the player flies
//       Aetherius under her (catch her before the 6 s run out, or he catches her late, at a cost).
//   III Aetherius. Fast, high, thermals; flaps are weak (Space, 15 stamina, gliding refills 20 a
//       second); the gift turns the wind (E, or drag across the sky) into a current that carries the
//       pair. In the last quarter the gusts strengthen and the silver trails begin.
// Three scale hits per checkpoint; a fourth sends the pair back to the last checkpoint. The prototype
// adds a loss: sent back three times, the road is lost. After two losses in a row a gentler wind is
// offered (kept in api.store).
//
// Quoted, verbatim as DESIGN.md sections 3 and 8 quote them:
//   "We were born together, Aeris. You are the breath I cannot take. I am the thought you cannot
//    speak." (WW 145)   "Our bond was dormant too long." (WW 149)   "silver trails across the sky" (WW 155)
//   creative-writing/vault/02_Novels/02_WrymWretch.md

const INK = "#1c1b1a", PAPER = "#efe6d1", WASH = "#3a3936", SEAL = "#a42a1c", CURRENT = "#4a7fb0", SILVER = "#9aa3ad";
const COURSE = 1500;          // metres to the far peak
const CHECKS = [0, 375, 750, 1125];
const TEAR = 340;             // where the sail tears
const VIEW_H = 30;            // metres of sky on screen

const CSS = `
.wrymwretch-twin-flight-root{position:absolute;inset:0;background:${PAPER};overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-twin-flight-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wrymwretch-twin-flight-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:8px;padding:10px 12px;pointer-events:none}
.wrymwretch-twin-flight-pad div{display:flex;gap:8px;pointer-events:auto}
.wrymwretch-twin-flight-pad button{font:700 15px 'Cormorant Garamond',Georgia,serif;letter-spacing:.04em;min-width:54px;min-height:48px;padding:4px 10px;color:${INK};background:rgba(239,230,209,.9);border:2px solid ${INK};border-radius:3px;cursor:pointer;touch-action:none;transition:background .15s,color .15s,transform .1s;position:relative}
.wrymwretch-twin-flight-pad button:hover:not(:disabled){background:#fff8e6}
.wrymwretch-twin-flight-pad button.on,.wrymwretch-twin-flight-pad button:active:not(:disabled){background:${INK};color:${PAPER};transform:translateY(1px)}
.wrymwretch-twin-flight-pad button:disabled{opacity:.38;cursor:default}
.wrymwretch-twin-flight-pad button[hidden]{display:none}
.wrymwretch-twin-flight-pad button small{position:absolute;top:-9px;right:-6px;font:700 11px ui-monospace,monospace;background:${PAPER};border:1.5px solid ${INK};border-radius:2px;padding:0 3px}
.wrymwretch-twin-flight-beat{position:absolute;top:84px;left:16px;right:16px;margin:0 auto;max-width:560px;box-sizing:border-box;background:${PAPER};color:${INK};border-top:5px solid ${WASH};border-bottom:5px solid ${WASH};padding:10px 18px 10px 58px;font-size:17px;line-height:1.35;box-shadow:0 6px 18px rgba(28,27,26,.18);opacity:0;transition:opacity .6s;pointer-events:none}
.wrymwretch-twin-flight-beat.on{opacity:1}
.wrymwretch-twin-flight-beat::before{content:"";position:absolute;left:14px;top:12px;width:28px;height:28px;background:${SEAL};box-shadow:inset 0 0 0 3px ${SEAL},inset 0 0 0 5px rgba(239,230,209,.7)}
.wrymwretch-twin-flight-beat cite{display:block;font:600 13px 'Cormorant Garamond',Georgia,serif;font-style:normal;letter-spacing:.08em;color:${WASH};margin-top:3px}
.wrymwretch-twin-flight-beat q{font-style:italic}
@media (max-width:600px){.wrymwretch-twin-flight-beat{top:auto;bottom:72px;left:12px;right:12px;font-size:16px}}
.wrymwretch-twin-flight-intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,230,209,.72);overflow:auto}
.wrymwretch-twin-flight-scroll{position:relative;width:min(430px,100%);box-sizing:border-box}
.wrymwretch-twin-flight-rod{height:16px;margin:0 -14px;background:linear-gradient(#5a3a22,#2b1a10 60%,#5a3a22);border-radius:8px;box-shadow:0 2px 3px rgba(0,0,0,.3)}
.wrymwretch-twin-flight-sheet{background:linear-gradient(90deg,rgba(58,57,54,.08),transparent 8%,transparent 92%,rgba(58,57,54,.08)),${PAPER};border-left:1px solid #cfc3a8;border-right:1px solid #cfc3a8;padding:18px 22px 16px;color:${INK};position:relative}
.wrymwretch-twin-flight-sheet h2{font:700 25px 'Cinzel',Georgia,serif;margin:0;letter-spacing:.05em;padding-right:44px}
.wrymwretch-twin-flight-sheet .seal{position:absolute;right:20px;top:18px;width:34px;height:34px;background:${SEAL};color:${PAPER};font:700 13px 'Cinzel',serif;display:grid;place-items:center;line-height:1}
.wrymwretch-twin-flight-sheet .goal{font-size:18px;font-style:italic;margin:6px 0 12px;line-height:1.3}
.wrymwretch-twin-flight-keys{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;align-items:center;font-size:16px;margin:0 0 12px;padding:10px 0;border-top:1px solid rgba(28,27,26,.25);border-bottom:1px solid rgba(28,27,26,.25)}
.wrymwretch-twin-flight-keys kbd{font:700 13px ui-monospace,monospace;border:1.5px solid ${INK};padding:1px 6px;border-radius:2px;background:#fffaf0;white-space:nowrap}
.wrymwretch-twin-flight-sheet .more{font-size:15px;color:${WASH};margin:0 0 12px}
.wrymwretch-twin-flight-sheet .gentle{font-size:15px;color:${SEAL};margin:0 0 12px}
.wrymwretch-twin-flight-sheet button{font:700 16px 'Cinzel',Georgia,serif;padding:9px 26px;background:${SEAL};color:${PAPER};border:0;cursor:pointer;min-height:44px}
.wrymwretch-twin-flight-sheet button:hover{background:#7f1f14}
`;

export default {
  mount(root, api) {
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-twin-flight-root";
    wrap.innerHTML = `<style>${CSS}</style><canvas></canvas>
      <div class="wrymwretch-twin-flight-pad">
        <div><button type="button" data-k="up" aria-label="Pitch up">▲</button><button type="button" data-k="down" aria-label="Pitch down">▼</button></div>
        <div><button type="button" data-k="song">Song<small>Q</small></button><button type="button" data-k="gift" hidden>Wind<small>E</small></button><button type="button" data-k="wing" hidden>Wing<small>␣</small></button></div>
      </div>
      <div class="wrymwretch-twin-flight-beat" aria-live="polite"></div>
      <div class="wrymwretch-twin-flight-intro"><div class="wrymwretch-twin-flight-scroll">
        <div class="wrymwretch-twin-flight-rod"></div>
        <div class="wrymwretch-twin-flight-sheet">
          <div class="seal" aria-hidden="true">AG</div>
          <h2>Twin flight</h2>
          <p class="goal">Bring Aeris down from the sky-cities to the far peak.</p>
          <div class="wrymwretch-twin-flight-keys">
            <span><kbd>W</kbd> <kbd>S</kbd> or ▲ ▼</span><span>tilt the sail up or down</span>
            <span><kbd>Q</kbd> or Song</span><span>Aeris sings: the gusts calm for 3 s</span>
            <span>ink peaks, rigging</span><span>avoid them: four hits between seals sends you back</span>
          </div>
          <p class="more">The sky has more in store; new controls appear on the scroll when they are yours.</p>
          ${gentle ? `<p class="gentle">The wind is gentler this time: five hits between seals, softer gusts.</p>` : ""}
          <button type="button" data-start>Unroll</button>
        </div>
        <div class="wrymwretch-twin-flight-rod"></div>
      </div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const g = cv.getContext("2d");
    const intro = wrap.querySelector(".wrymwretch-twin-flight-intro");
    const beatEl = wrap.querySelector(".wrymwretch-twin-flight-beat");
    const btn = (k) => wrap.querySelector(`[data-k="${k}"]`);
    const rm = api.reducedMotion;
    const HITS = gentle ? 5 : 3, GUST = gentle ? 0.6 : 1;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    // ---- the course -------------------------------------------------------------------------
    const R = api.rng("wrymwretch/twin-flight/galewing");
    const peaks = [], rigs = [], gusts = [], thermals = [];
    for (let x = 70; x < COURSE - 60; x += 34 + R() * 22) {
      if (Math.abs(x - TEAR) < 50) continue;          // a clear sky for the fall
      const t = R();
      if (t < 0.45) peaks.push({ x, w: 10 + R() * 8, h: 8 + R() * 9 + x / COURSE * 3 });
      else if (t < 0.8) rigs.push({ x, len: 7 + R() * 7 + x / COURSE * 2 });
      else { const h = 7 + R() * 6; peaks.push({ x, w: 10 + R() * 6, h }); rigs.push({ x: x + 4, len: Math.min(9, 20 - h) }); }
    }
    for (let x = 160; x < COURSE - 80; x += (x > CHECKS[3] ? 90 : 130) + R() * 70) gusts.push({ x, w: 26 + R() * 10, phase: R() * 6, dir: R() < 0.5 ? 1 : -1 });
    for (let x = 110; x < COURSE - 60; x += 100 + R() * 60) thermals.push({ x, w: 9 + R() * 4 });
    const ridge = (k) => { const a = [R() * 6, R() * 6, R() * 6]; return (x) => Math.sin(x * 0.011 * k + a[0]) * 0.5 + Math.sin(x * 0.027 * k + a[1]) * 0.3 + Math.sin(x * 0.061 * k + a[2]) * 0.2; };
    const ridges = [ridge(1), ridge(1.4), ridge(2)];

    // ---- state ------------------------------------------------------------------------------
    const s = {
      phase: "sail", x: 0, y: 9, vy: 0, speed: 9, stamina: 100, lastBeat: -9, hits: 0, resets: 0, cp: 0, totalHits: 0,
      inv: 0, calm: 0, songCd: 0, giftCd: 0, flap: 0, t: 0, trail: [], silver: [], currents: [], drawing: null, running: false, over: false,
      rider: null, fallT: 0, caught: "", flash: 0, stamp: 0, songs: 0, currentsUsed: 0, beats: new Set(),
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

    // ---- narrative beats --------------------------------------------------------------------
    let beatT = null;
    function beat(html, ms = 5200) {
      beatEl.innerHTML = html; beatEl.classList.add("on");
      if (beatT) { clearTimeout(beatT); timers.delete(beatT); }
      beatT = setTimeout(() => { timers.delete(beatT); beatEl.classList.remove("on"); }, ms); timers.add(beatT);
    }
    const once = (id, html, ms) => { if (s.beats.has(id)) return; s.beats.add(id); beat(html, ms); };

    // ---- actions ----------------------------------------------------------------------------
    const dragon = () => s.phase !== "sail";
    function beat_() {
      if (!s.running || !dragon() || s.stamina < 15) { if (s.running && dragon()) s.flash = Math.max(s.flash, 0.15); return; }
      s.stamina -= 15; s.vy = Math.min(s.vy, 0) - 5.5; s.lastBeat = s.t; s.flap = 1;
    }
    function song() {
      if (!s.running || s.songCd > 0) return;
      s.calm = 3; s.songCd = 8; s.songs++;
    }
    function gift() {
      if (!s.running || s.phase !== "dragon" && s.phase !== "trails" || s.giftCd > 0) return;
      const ang = -0.45;
      s.currents.push({ pts: [[s.x + 1, s.y], [s.x + 1 + Math.cos(ang) * 22, s.y + Math.sin(ang) * 22]], ttl: 4 });
      s.giftCd = 5; s.currentsUsed++;
    }
    function hit() {
      if (s.inv > 0 || s.phase === "fall") return;
      s.hits++; s.totalHits++; s.inv = 1.3; s.vy = -4; s.flash = 1;
      if (s.hits > HITS) {
        s.resets++;
        if (s.resets >= 3) return finish(false);
        s.x = CHECKS[s.cp] + 2; s.y = 10; s.vy = 0; s.hits = 0; s.stamina = 100; s.inv = 2; s.trail = []; s.currents = [];
        beat(`The scroll rolls back to the last seal. <cite>Turned back ${s.resets} of 3</cite>`, 3200);
      }
    }
    function tear() {
      s.phase = "fall"; s.fallT = 6;
      s.rider = { x: s.x, y: s.y, vy: -1 };
      s.y = Math.max(3, s.y - 5); s.vy = 0; s.speed = 15; s.x = s.rider.x - 7; s.stamina = 100; s.hits = 0;
      btn("wing").hidden = false;
      beat(`The confused winds tear the sail. Aeris falls, and something vast and pale dives out of the cloud beneath the sky-cities. <cite>Fly under her: <b>Space</b> or Wing beats, <b>S</b> dives</cite>`, 6000);
    }
    function catchHer(late) {
      s.phase = "dragon"; s.caught = late ? "late" : "clean"; s.rider = null;
      if (late) { s.hits = Math.min(HITS, s.hits + 1); s.totalHits++; s.flash = 0.8; }
      s.stamp = 1;
      btn("gift").hidden = false;
      beat(`${late ? "He reaches her only at the last, and her shoulder strikes his scales." : "She lands on his neck as if she had always ridden there."} Aetherius speaks into her mind: <q>We were born together, Aeris. You are the breath I cannot take. I am the thought you cannot speak.</q> <cite>WW 145 · then <b>E</b> or drag across the sky: turn the wind</cite>`, 8000);
      later(() => { if (!s.over) beat(`<q>Our bond was dormant too long.</q> <cite>WW 149 · thermals lift; flaps are weak, wind is everything</cite>`, 5000); }, 8400);
    }
    function finish(win) {
      if (s.over) return;
      s.over = true; s.running = false;
      api.store.set("losses", win ? 0 : losses + 1);
      later(() => api.end(win
        ? { outcome: "win", text: `Aetherius rides the last thermal over the far peak with Aeris on his neck${s.caught === "late" ? ", her shoulder still bruised from the late catch" : ""}. ${s.resets ? `Turned back ${s.resets} time${s.resets > 1 ? "s" : ""}, ` : "Never turned back, "}${s.totalHits} scale hit${s.totalHits === 1 ? "" : "s"} on the way down${s.songs ? `; she sang ${s.songs} time${s.songs > 1 ? "s" : ""}` : ""}. The help her people sent her for is below.` }
        : { outcome: "lose", text: `Sent back a third time, ${dragon() ? "the pair loses" : "Aeris loses"} the road between the sky-cities in the cloud, ${s.cp ? `${s.cp} seal${s.cp > 1 ? "s" : ""} short` : "before the first seal"} of the far peak. The scroll rolls shut.${losses + 1 >= 2 ? " Next time the wind will be gentler." : ""}` }), 450);
    }

    // ---- simulation -------------------------------------------------------------------------
    const gustDir = (gu) => (Math.floor((s.t + gu.phase) / 3) % 2 === 0 ? gu.dir : -gu.dir);
    function step(dt) {
      s.t += dt;
      s.inv = Math.max(0, s.inv - dt); s.calm = Math.max(0, s.calm - dt);
      s.songCd = Math.max(0, s.songCd - dt); s.giftCd = Math.max(0, s.giftCd - dt);
      s.flap = Math.max(0, s.flap - dt * 2.5); s.flash = Math.max(0, s.flash - dt * 1.6); s.stamp = Math.max(0, s.stamp - dt * 0.6);
      if (s.t - s.lastBeat > 0.35) s.stamina = Math.min(100, s.stamina + 20 * dt);
      const sail = s.phase === "sail";
      const target = sail ? (keys.up ? -2.5 : keys.down ? 7 : 2.2) : keys.up ? -6 : keys.down ? 9 : 2.4;
      s.vy += (target - s.vy) * Math.min(1, 3.2 * dt);
      for (const th of thermals) if (Math.abs(s.x - th.x) < th.w / 2) s.vy -= (sail ? 9 : 11) * dt;
      const gustF = (s.phase === "trails" ? 19 : 14) * GUST * (sail ? 1.1 : 1);
      for (const gu of gusts) if (Math.abs(s.x - gu.x) < gu.w / 2 && s.calm <= 0) s.vy += gustDir(gu) * gustF * dt;
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
      const base = sail ? 9 : 14;
      const tgtSpeed = base + Math.max(0, s.vy) * (sail ? 0.3 : 0.7) - Math.max(0, -s.vy) * 0.3 + carried;
      s.speed += (tgtSpeed - s.speed) * Math.min(1, 1.5 * dt);
      s.x += s.speed * dt;
      s.y += s.vy * dt;
      if (s.y < 0.8) { s.y = 0.8; s.vy = Math.max(0, s.vy); }
      if (s.y > VIEW_H - 1) { s.y = VIEW_H - 1.5; hit(); }
      // the fall: the rider drops; the dragon must get under her
      if (s.phase === "fall") {
        const r = s.rider;
        s.fallT -= dt;
        r.vy = Math.min(7, r.vy + 6 * dt); r.y = Math.min(VIEW_H - 3, r.y + r.vy * dt); r.x += 11.5 * dt;
        if (Math.hypot(s.x - r.x, s.y - r.y) < 4) catchHer(false);
        else if (s.fallT <= 0) { s.x = r.x - 0.5; s.y = r.y + 1; catchHer(true); }
      } else {
        for (const p of peaks) if (Math.abs(s.x - p.x) < p.w / 2) {
          const top = VIEW_H - p.h * (1 - Math.abs(s.x - p.x) / (p.w / 2));
          if (s.y + 0.6 > top) hit();
        }
        for (const r of rigs) if (Math.abs(s.x - r.x) < 0.9 && s.y - 0.5 < r.len) hit();
      }
      if (s.over) return;
      for (let i = CHECKS.length - 1; i > s.cp; i--) if (s.x >= CHECKS[i]) {
        s.cp = i; s.hits = 0; s.stamp = 1;
        if (i === 2) once("cp2", `The second seal. Below the cloud the Galewing Peaks stand in ink, and the air smells of rain. <cite>Halfway down</cite>`, 4200);
        if (i === 3) { s.phase = "trails"; once("trails", `The cloud breaks. Thermals rise off the peaks, and behind the pair the wind leaves <q>silver trails across the sky</q>. <cite>WW 155 · the gusts are stronger now: sing through them</cite>`, 6500); }
        break;
      }
      if (s.phase === "sail" && s.x >= TEAR) tear();
      if (s.phase === "sail" && s.x > 120) once("gust", `The winds are confused: the brush strokes push one way, then the other. <cite>Sing (<b>Q</b>) as you enter one</cite>`, 4500);
      s.trail.unshift([s.x, s.y]);
      if (s.trail.length > 40) s.trail.length = 40;
      if (s.phase === "trails" && !rm) { s.silver.push([s.x - 2, s.y, 2.2]); }
      s.silver.forEach((p) => (p[2] -= dt)); s.silver = s.silver.filter((p) => p[2] > 0);
      if (s.x >= COURSE) finish(true);
    }

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
    function rider(x, y, falling) {
      g.fillStyle = INK; g.beginPath(); g.arc(x, y - 9, 3.2, 0, 7); g.fill();
      g.strokeStyle = INK; g.lineWidth = 2.6; g.lineCap = "round"; g.beginPath();
      g.moveTo(x, y - 6); g.lineTo(x, y + 4);
      if (falling) { g.moveTo(x, y - 4); g.lineTo(x - 7, y - 11); g.moveTo(x, y - 4); g.lineTo(x + 7, y - 12); g.moveTo(x, y + 4); g.lineTo(x - 5, y + 11); g.moveTo(x, y + 4); g.lineTo(x + 6, y + 10); }
      else { g.moveTo(x, y - 4); g.lineTo(x + 6, y - 14); g.moveTo(x, y + 4); g.lineTo(x - 4, y + 11); g.moveTo(x, y + 4); g.lineTo(x + 4, y + 11); }
      g.stroke();
      brush([[x, y - 7], [x - 10, y - 9 + (falling ? -6 : 0)], [x - 21, y - 5 + Math.sin(s.t * 9) * (rm ? 0 : 3)]], 3, 1, CURRENT);
    }
    function sailShape(x, y, torn) {
      g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 6, y - 13); g.lineTo(x - 2, y - 36); g.moveTo(x - 6, y - 13); g.lineTo(x - 26, y - 30); g.stroke();
      g.fillStyle = "rgba(239,230,209,.92)"; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 34, y - 28); g.quadraticCurveTo(x - 10, y - 50, x + 14, y - 38); g.lineTo(x + 2, y - 32);
      if (torn) { g.lineTo(x - 8, y - 22); g.lineTo(x - 14, y - 34); }
      g.quadraticCurveTo(x - 14, y - 28, x - 34, y - 28); g.closePath(); g.fill(); g.stroke();
      brush([[x - 30, y - 30], [x - 10, y - 44], [x + 10, y - 38]], 2.4, 0.6, WASH, 0.6);
    }
    function dragonShape() {
      if (s.trail.length < 3 || (s.inv > 0 && Math.floor(s.t * 12) % 2 === 0)) return;
      const body = s.trail.filter((_, i) => i % 2 === 0).slice(0, 14).map(([x, y], i) => [sx(x) - i * 5, sy(y) + Math.sin(s.t * 6 - i * 0.6) * (rm ? 0 : 2)]);
      brush(body, 13, 1.5, INK);
      const [hx, hy] = body[0];
      g.fillStyle = INK; g.beginPath(); g.moveTo(hx + 18, hy + 1); g.lineTo(hx - 2, hy - 6); g.lineTo(hx - 2, hy + 6); g.closePath(); g.fill();
      g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(hx + 4, hy - 4); g.quadraticCurveTo(hx - 6, hy - 18, hx - 18, hy - 16); g.stroke();
      g.fillStyle = PAPER; g.beginPath(); g.arc(hx + 7, hy - 1, 1.6, 0, 7); g.fill();
      // the glowing runes along his side once he has come for her
      g.fillStyle = "rgba(74,127,176,.85)";
      for (let i = 2; i < Math.min(9, body.length); i += 2) g.fillRect(body[i][0] - 1.5, body[i][1] - 1.5, 3, 3);
      const wb = body[3] || body[1];
      const lift = rm ? 0.5 : 0.5 + Math.sin(s.t * 5) * 0.25 + s.flap * 0.6;
      brush([[wb[0], wb[1]], [wb[0] - 14, wb[1] - 26 * lift], [wb[0] - 34, wb[1] - 40 * lift]], 7, 1, INK);
      brush([[wb[0] + 4, wb[1]], [wb[0] - 8, wb[1] - 18 * lift], [wb[0] - 22, wb[1] - 30 * lift]], 4, 1, WASH, 0.75);
      if (s.phase !== "fall") { const rb = body[2] || body[1]; rider(rb[0] + 2, rb[1] - 3, false); }
    }
    function plate(x, y, w, h) { g.fillStyle = "rgba(239,230,209,.88)"; g.fillRect(x, y, w, h); g.strokeStyle = "rgba(28,27,26,.35)"; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, s.phase === "sail" ? "#dcd8cf" : "#e7e1d3"); sky.addColorStop(0.6, PAPER); sky.addColorStop(1, "#e3dccb");
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      // paper fibre
      g.strokeStyle = "rgba(58,57,54,.06)"; g.lineWidth = 1;
      for (let i = 0; i < 70; i++) { const fx = ((i * 197 + 31) % 1000) / 1000 * W, fy = ((i * 389 + 77) % 1000) / 1000 * H, L = 20 + (i * 53) % 70; g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + L / 2, fy + ((i % 5) - 2), fx + L, fy + ((i % 3) - 1) * 2); g.stroke(); }
      const cam = camX();
      [[0.12, 0.62, 0.16], [0.3, 0.72, 0.24], [0.55, 0.83, 0.34]].forEach(([par, base, a], li) => {
        const fn = ridges[li];
        const grad = g.createLinearGradient(0, H * (base - 0.25), 0, H);
        grad.addColorStop(0, `rgba(42,41,40,${a})`); grad.addColorStop(0.55, `rgba(42,41,40,${a * 0.35})`); grad.addColorStop(1, "rgba(239,230,209,0)");
        g.fillStyle = grad; g.beginPath(); g.moveTo(0, H);
        for (let px = 0; px <= W + 8; px += 8) g.lineTo(px, H * base - fn((cam * par + px / scale) * 8) * H * (0.1 + li * 0.03));
        g.lineTo(W, H); g.closePath(); g.fill();
        const m = g.createLinearGradient(0, H * base - 10, 0, H * base + 40);
        m.addColorStop(0, "rgba(239,230,209,0)"); m.addColorStop(0.5, "rgba(239,230,209,.75)"); m.addColorStop(1, "rgba(239,230,209,0)");
        g.fillStyle = m; g.fillRect(0, H * base - 10, W, 50);
      });
      // in the sail phase the sky-cities hang above, in faint wash
      if (s.x < TEAR + 120) {
        g.fillStyle = "rgba(58,57,54,.16)";
        for (let k = 0; k < 4; k++) { const cx = sx(40 + k * 95) - cam * 0.2, by = Math.max(14, oy + 4); g.beginPath(); g.ellipse(cx, by, 64, 16, 0, 0, Math.PI); g.fill(); for (let t = -2; t <= 2; t++) g.fillRect(cx + t * 20 - 4, by - 26 - Math.abs(t) * -6 - (t === 0 ? 14 : 0), 8, 26 + (t === 0 ? 14 : 0)); g.beginPath(); g.moveTo(cx, by + 16); g.lineTo(cx - 10, by + 40); g.lineTo(cx + 10, by + 40); g.closePath(); g.fill(); }
      }
      const vis = (x, w) => sx(x + w) > -40 && sx(x - w) < W + 40;
      for (const th of thermals) if (vis(th.x, th.w)) {
        const x0 = sx(th.x - th.w / 2), x1 = sx(th.x + th.w / 2);
        const gr = g.createLinearGradient(x0, 0, x1, 0);
        gr.addColorStop(0, "rgba(215,154,43,0)"); gr.addColorStop(0.5, "rgba(215,154,43,.16)"); gr.addColorStop(1, "rgba(215,154,43,0)");
        g.fillStyle = gr; g.fillRect(x0, 0, x1 - x0, H);
        g.strokeStyle = "rgba(120,90,40,.4)"; g.lineWidth = 1.4;
        for (let k = 0; k < 4; k++) {
          const yy = H - ((s.t * (rm ? 0 : 40) + k * H / 4) % H);
          g.beginPath(); g.moveTo(sx(th.x) - 8, yy + 14); g.quadraticCurveTo(sx(th.x) + 6, yy + 6, sx(th.x) - 2, yy - 6); g.stroke();
        }
      }
      for (const gu of gusts) if (vis(gu.x, gu.w)) {
        const d = gustDir(gu), calm = s.calm > 0;
        const x0 = sx(gu.x - gu.w / 2), x1 = sx(gu.x + gu.w / 2);
        for (let k = 0; k < 9; k++) {
          const yy = oy + (H - oy) * (0.08 + k * 0.1) + Math.sin(s.t * 2 + k) * (rm ? 0 : 4);
          brush([[x0, yy], [(x0 + x1) / 2, yy + d * 6], [x1, yy + d * 12]], 3, 0.5, calm ? SILVER : WASH, calm ? 0.2 : s.phase === "trails" ? 0.6 : 0.45);
        }
        g.strokeStyle = calm ? "rgba(28,27,26,.25)" : INK; g.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) {
          const cx = (x0 + x1) / 2, cy = oy + (H - oy) * (0.25 + k * 0.25);
          g.beginPath(); g.moveTo(cx - 10, cy - d * 6); g.lineTo(cx, cy + d * 4); g.lineTo(cx + 10, cy - d * 6); g.stroke();
        }
      }
      for (const p of peaks) if (vis(p.x, p.w)) {
        const bx = sx(p.x), hw = (p.w / 2) * scale, top = sy(VIEW_H - p.h);
        g.fillStyle = INK; g.beginPath(); g.moveTo(bx - hw, H);
        g.lineTo(bx - hw * 0.45, top + (H - top) * 0.35); g.lineTo(bx - hw * 0.1, top + 4); g.lineTo(bx, top);
        g.lineTo(bx + hw * 0.2, top + 8); g.lineTo(bx + hw * 0.55, top + (H - top) * 0.45); g.lineTo(bx + hw, H); g.closePath(); g.fill();
        g.fillStyle = "rgba(239,230,209,.25)";
        g.beginPath(); g.moveTo(bx, top + 6); g.lineTo(bx + hw * 0.18, top + (H - top) * 0.5); g.lineTo(bx + hw * 0.05, top + (H - top) * 0.5); g.closePath(); g.fill();
        brush([[bx, top], [bx + 3, top - 14], [bx + 9, top - 22]], 4, 1, INK);
        brush([[bx - 8, top - 14], [bx + 14, top - 17]], 3, 1, INK);
      }
      for (const r of rigs) if (vis(r.x, 2)) {
        const x = sx(r.x), y1 = sy(r.len);
        g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, oy); g.lineTo(x + Math.sin(s.t * 1.5 + r.x) * (rm ? 0 : 3), y1); g.stroke();
        g.fillStyle = "rgba(28,27,26,.78)";
        const fy = (f) => oy + (y1 - oy) * f;
        g.beginPath(); g.moveTo(x, fy(0.3)); g.lineTo(x + 16, fy(0.42)); g.lineTo(x + 7, fy(0.55)); g.lineTo(x + 13, fy(0.7)); g.lineTo(x, fy(0.78)); g.closePath(); g.fill();
        g.fillRect(x - 6, oy, 12, 6);
      }
      // silver trails (phase III)
      for (const [x, y, life] of s.silver) { g.fillStyle = `rgba(154,163,173,${Math.min(0.7, life / 2.2)})`; g.fillRect(sx(x) - 30, sy(y) + 4, 3, 1.6); }
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
      // the travellers
      if (s.phase === "sail") {
        const x = sx(s.x), y = sy(s.y) + Math.sin(s.t * 3) * (rm ? 0 : 1.5);
        if (!(s.inv > 0 && Math.floor(s.t * 12) % 2 === 0)) { sailShape(x, y, false); rider(x, y, false); }
      } else {
        dragonShape();
        if (s.phase === "fall" && s.rider) {
          const x = sx(s.rider.x), y = sy(s.rider.y);
          rider(x, y, true);
          g.save(); g.translate(x - 30, y - 40 + (6 - s.fallT) * -6); g.rotate(-0.5 + s.t); sailShape(0, 0, true); g.restore();
          // where to be: a faint ring of wash under her, and the seconds left
          g.strokeStyle = "rgba(164,42,28,.7)"; g.lineWidth = 2; g.setLineDash([4, 5]); g.beginPath(); g.arc(x, y + 12, 3.2 * scale, 0, 7); g.stroke(); g.setLineDash([]);
          g.fillStyle = SEAL; g.font = "700 16px 'Cormorant Garamond', Georgia, serif"; g.textAlign = "center"; g.fillText(`catch her · ${Math.max(0, s.fallT).toFixed(1)} s`, x, y - 22); g.textAlign = "left";
        }
      }
      // mistake: a wash of red ink at the edges; seal: a red stamp in the middle of the sky
      if (s.flash > 0) {
        const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7);
        vg.addColorStop(0, "rgba(164,42,28,0)"); vg.addColorStop(1, `rgba(164,42,28,${0.45 * s.flash})`);
        g.fillStyle = vg; g.fillRect(0, 0, W, H);
      }
      if (s.stamp > 0 && !rm) {
        const k = 1 + (1 - s.stamp) * 0.25, a = Math.min(1, s.stamp * 1.4) * 0.8, cx = W / 2, cy = H * 0.42;
        g.save(); g.translate(cx, cy); g.scale(k, k); g.rotate(-0.08); g.globalAlpha = a;
        g.fillStyle = SEAL; g.fillRect(-34, -34, 68, 68);
        g.strokeStyle = PAPER; g.lineWidth = 4; g.beginPath(); g.moveTo(-20, -20); g.lineTo(20, -20); g.moveTo(0, -20); g.lineTo(0, 20); g.moveTo(-18, 0); g.lineTo(18, 0); g.moveTo(-20, 20); g.lineTo(20, 20); g.stroke();
        g.restore(); g.globalAlpha = 1;
      }
      // HUD: the ribbon with the far peak, on a paper plate; hits; stamina; turned back
      const rx0 = 16, rx1 = Math.max(rx0 + 60, W - 70), ry = 24;
      plate(8, 6, W - 16, 32);
      g.strokeStyle = WASH; g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx0, ry); g.lineTo(rx1, ry); g.stroke();
      const pos = rx0 + (rx1 - rx0) * Math.min(1, s.x / COURSE);
      g.strokeStyle = INK; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(rx0, ry); g.lineTo(pos, ry); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.moveTo(rx1, ry + 6); g.lineTo(rx1 + 14, ry - 10); g.lineTo(rx1 + 22, ry - 3); g.lineTo(rx1 + 30, ry - 14); g.lineTo(rx1 + 44, ry + 6); g.closePath(); g.fill();
      const tx = rx0 + (rx1 - rx0) * TEAR / COURSE; g.strokeStyle = "rgba(74,127,176,.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ry - 7); g.lineTo(tx, ry + 7); g.stroke();
      CHECKS.slice(1).forEach((c, i) => { const x = rx0 + (rx1 - rx0) * c / COURSE; g.fillStyle = i < s.cp ? SEAL : "rgba(164,42,28,.38)"; g.fillRect(x - 5, ry - 5, 10, 10); });
      const hy = 44, low = s.stamina < 30;
      plate(8, hy, 214, dragon() ? 92 : 70);
      g.font = "700 12.5px Cinzel, Georgia, serif"; g.fillStyle = INK;
      g.fillText("SCALE HITS", 18, hy + 18);
      for (let i = 0; i < HITS; i++) { g.beginPath(); g.arc(122 + i * 17, hy + 13, 6.5, 0, 7); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); if (i < s.hits) { g.fillStyle = SEAL; g.fill(); } }
      g.fillStyle = INK; g.fillText(`TURNED BACK ${s.resets} / 3`, 18, hy + 40);
      g.fillText(s.phase === "sail" ? "ON THE SAIL" : s.phase === "fall" ? "SHE FALLS" : "AETHERIUS", 18, hy + 61);
      if (s.calm > 0) { g.fillStyle = CURRENT; g.fillText("· singing", 112, hy + 61); }
      if (dragon()) {
        g.fillStyle = low ? SEAL : INK; g.fillText("STAMINA", 18, hy + 82);
        g.strokeStyle = "rgba(58,57,54,.5)"; g.lineWidth = 1; g.strokeRect(84, hy + 73, 96, 10);
        brush([[84, hy + 78], [84 + 96 * s.stamina / 100, hy + 78]], 9, 5, low ? SEAL : INK);
      }
      btn("gift").disabled = s.giftCd > 0 || !s.running; btn("song").disabled = s.songCd > 0 || !s.running; btn("wing").disabled = s.stamina < 15 || !s.running;
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
      else if (down && (k === " " || k === "a")) beat_();
      else if (down && k === "e") gift();
      else if (down && k === "q") song();
      else return;
      if (intro.isConnected && !down) return;
      e.preventDefault();
    };
    const kd = (e) => { if (intro.isConnected) return; if (!e.repeat || e.key.toLowerCase() === "w" || e.key.toLowerCase() === "s") onKey(e, true); };
    const ku = (e) => onKey(e, false);
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    const pad = wrap.querySelector(".wrymwretch-twin-flight-pad");
    const padDown = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      e.preventDefault();
      const k = b.dataset.k;
      if (k === "up" || k === "down") { keys[k] = true; b.classList.add("on"); }
      else if (k === "wing") beat_(); else if (k === "gift") gift(); else if (k === "song") song();
    };
    const padUp = () => { keys.up = keys.down = false; pad.querySelectorAll(".on").forEach((b) => b.classList.remove("on")); };
    pad.addEventListener("pointerdown", padDown);
    addEventListener("pointerup", padUp); addEventListener("pointercancel", padUp);
    const world = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale + camX(), (e.clientY - r.top - oy) / scale]; };
    const cvDown = (e) => {
      if (!s.running || s.giftCd > 0 || (s.phase !== "dragon" && s.phase !== "trails")) return;
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
      if (s.drawing.pts.length > 1) { s.currents.push(s.drawing); s.giftCd = 5; s.currentsUsed++; }
      s.drawing = null;
    };
    cv.addEventListener("pointerdown", cvDown); cv.addEventListener("pointermove", cvMove);
    cv.addEventListener("pointerup", cvUp); cv.addEventListener("pointercancel", cvUp);

    const startBtn = wrap.querySelector("[data-start]");
    startBtn.addEventListener("click", () => {
      intro.remove(); s.running = true; last = performance.now();
      beat(`Aeris Galewing steps off the edge of the sky-city on a sky-sail. Her people sent her down to seek aid; the road below is cloud and confused wind. <cite>Tilt with <b>W</b>/<b>S</b> · keep clear of ink</cite>`, 6000);
    });
    startBtn.focus();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro ? ro.observe(wrap) : addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        s.over = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        removeEventListener("pointerup", padUp); removeEventListener("pointercancel", padUp);
        ro ? ro.disconnect() : removeEventListener("resize", resize);
        wrap.remove();
      },
    };
  },
};

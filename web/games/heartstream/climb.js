// A Journey Into the Heartstream, 2D mode B: the climb (DESIGN.md section 10, `m2_climb`).
// Cave painting: ochre and charcoal figures on rock, hand stencils, holds as dabs of red ochre.
// One shaft cut from `s2_climb_1` and `s2_climb_2` together: 50 m, four ledges too high for one,
// 68 bpm rising to 76 in the hot upper section, where the firm window narrows from 120 to 90 ms.
// The player climbs beside one companion brother; the other two climb ahead.

const C = { char: "#1d1612", ochre: "#a4532a", red: "#b3202e", deep: "#7A1020", gold: "#F2B544", bone: "#E8DCC4",
  rock: "#d8c3a2", blue: "#2F5D8C" };

export default {
  mount(root, api) {
    const P = "heartstream-climb-";
    const rng = api.rng();
    const TOP = 50, LEDGES = [{ y: 10, kind: "pull" }, { y: 20, kind: "brace" }, { y: 30, kind: "pull" }, { y: 40, kind: "brace" }];
    const HEAT = 32, BUDGET = 170;
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:#cdb795;font-family:var(--g-body);color:${C.char};user-select:none;-webkit-user-select:none;touch-action:none}
.${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;gap:8px;justify-content:center;padding:10px;background:linear-gradient(0deg,rgba(29,22,18,.55),rgba(29,22,18,0))}
.${P}pad button{font:700 15px var(--g-body);color:${C.bone};background:${C.ochre};border:3px solid ${C.char};border-radius:18px 14px 20px 12px;padding:12px 18px;min-width:120px;cursor:pointer;touch-action:none}
.${P}pad button[aria-pressed=true]{background:${C.char}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(29,22,18,.45)}
.${P}card{max-width:520px;background:#e6d2b0;border:3px solid ${C.char};border-radius:26px 18px 30px 16px;padding:20px 22px}
.${P}card h2{font-family:var(--g-display);font-size:30px;margin:0 0 8px;color:${C.deep}}
.${P}card p{margin:0 0 10px;line-height:1.4}
.${P}card button{font:700 16px var(--g-body);background:${C.red};color:${C.bone};border:3px solid ${C.char};border-radius:14px;padding:10px 24px;cursor:pointer}
`;
    const cv = document.createElement("canvas");
    const pad = document.createElement("div"); pad.className = P + "pad";
    const bGrab = document.createElement("button"); bGrab.type = "button"; bGrab.textContent = "Grab / Pull";
    const bBrace = document.createElement("button"); bBrace.type = "button"; bBrace.textContent = "Brace (hold)"; bBrace.setAttribute("aria-pressed", "false");
    pad.append(bGrab, bBrace);
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The climb</h2>
<p>The holds tighten on the heartbeat. <b>Grab on the beat</b> (Space, or the button) and the hold is firm; off the beat it is slick and you slide down one.</p>
<p>Some ledges are too high for one. Climb your brother's shoulders and <b>Pull</b> him up on three beats, or <b>hold Brace</b> (B) and be his step. Reach the light before the count runs out.</p>
<button type="button">Start</button></div>`;
    wrap.append(css, cv, pad, intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");

    let W = 0, H = 0, dpr = 1;
    const resize = () => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // rock texture: a stippled, cracked tile drawn once
    const tile = document.createElement("canvas"); tile.width = 256; tile.height = 256;
    { const t = tile.getContext("2d");
      for (let i = 0; i < 900; i++) { t.fillStyle = `rgba(91,70,54,${0.15 + rng() * 0.3})`; t.beginPath(); t.arc(rng() * 256, rng() * 256, 0.5 + rng() * 1.6, 0, 7); t.fill(); }
      for (let i = 0; i < 5; i++) { t.strokeStyle = "rgba(91,70,54,.35)"; t.lineWidth = 1; t.beginPath(); let x = rng() * 256, y = rng() * 256; t.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (rng() - 0.5) * 50; y += rng() * 30; t.lineTo(x, y); } t.stroke(); } }
    const pattern = g.createPattern(tile, "repeat");
    const stencils = Array.from({ length: 14 }, (_, i) => ({ y: 3 + i * 3.8 + rng() * 2, side: i % 2 ? 1 : -1, rot: (rng() - 0.5) * 0.8, red: rng() < 0.65, s: 0.7 + rng() * 0.4 }));

    const st = { started: false, over: false, me: 0, mate: 0, ahead: 4, phase: "climb", ledge: -1, sub: 0, lifts: 0, slips: 0,
      firm: 0, beatsLeft: BUDGET, brace: false, msg: "", msgT: 0, flash: 0, cam: 0, lastPress: -1 };
    let t0 = 0, nextBeat = 0, raf = 0, audio = null, lastNow = performance.now();
    const presses = [];
    const bpmAt = (y) => (y < 25 ? 68 : 72 + 4 * Math.min(1, (y - 25) / 20));
    // Beats are generated one at a time so the tempo can rise with height.
    let beatTimes = [];
    const say = (m) => { st.msg = m; st.msgT = 2000; };
    const windowMs = () => (st.me >= HEAT ? 90 : 120);

    function thump() {
      if (!audio) return;
      const t = audio.currentTime;
      [[0, 60], [0.15, 48]].forEach(([dt, f]) => {
        const o = audio.createOscillator(), v = audio.createGain();
        o.frequency.setValueAtTime(f * 1.5, t + dt); o.frequency.exponentialRampToValueAtTime(f, t + dt + 0.12);
        v.gain.setValueAtTime(0.0001, t + dt); v.gain.exponentialRampToValueAtTime(0.25 + st.me / TOP * 0.3, t + dt + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.2);
        o.connect(v).connect(audio.destination); o.start(t + dt); o.stop(t + dt + 0.25);
      });
    }
    const ledgeAt = (i) => LEDGES[i];

    // ---- one press: judged against the nearest beat --------------------------------------------
    function press() {
      if (!st.started || st.over) return;
      const now = performance.now();
      let k = 0, best = Infinity;
      for (let i = Math.max(0, nextBeat - 2); i < beatTimes.length; i++) { const d = Math.abs(now - beatTimes[i]); if (d < best) { best = d; k = i; } }
      if (k === st.lastPress) return; // one action per beat
      st.lastPress = k;
      const ok = best <= windowMs();
      presses.push({ t: now, on: ok });
      if (st.phase === "climb") {
        if (ok) {
          let target = Math.min(TOP, st.me + 1);
          const L = LEDGES.find((l) => st.me < l.y && target >= l.y);
          if (L) target = L.y;
          st.me = target; st.firm++;
          if (L) { st.phase = L.kind === "pull" ? "shoulders" : "brace"; st.ledge = LEDGES.indexOf(L); st.sub = 0;
            say(L.kind === "pull" ? "Too high for one. He braces: grab on the beat to climb his shoulders." : "Too high for one. Hold Brace and be his step."); }
        } else {
          const floor = Math.max(0, ...LEDGES.filter((l) => l.y + 2.4 <= st.me).map((l) => l.y + 2.4));
          st.me = Math.max(floor, st.me - 1); st.slips++; say("Slick. Grab on the beat.");
        }
      } else if (st.phase === "shoulders") {
        if (st.mate < ledgeAt(st.ledge).y) say("Wait for him to reach the foot of the ledge.");
        else if (ok) { st.sub++; if (st.sub === 1) say("On his shoulders. Again, on the beat."); else { st.me = ledgeAt(st.ledge).y + 2.4; st.phase = "pull"; st.sub = 0; say("Reach down. Pull on three beats."); } }
        else say("Slick. Wait for the beat.");
      } else if (st.phase === "pull") {
        if (ok) { st.sub++; if (st.sub >= 3) { st.mate = ledgeAt(st.ledge).y + 2.4; st.lifts++; st.phase = "climb"; say("Lifted. Climb on."); } else say(`Pull ${st.sub} of 3.`); }
        else { st.sub = Math.max(0, st.sub - 1); say("His hand slips. Pull on the beat."); }
      } else if (st.phase === "take") {
        if (ok) { st.phase = "pulled"; st.sub = 0; say("He has your hand. Hold on."); }
        else say("Take his hand on the beat.");
      }
    }
    function onBeat(k) {
      thump(); st.flash = 1; st.beatsLeft--;
      // the companion
      const L = st.ledge >= 0 ? ledgeAt(st.ledge) : null;
      if (st.phase === "climb") {
        if (st.mate < st.me + 0.5 && rng() < 0.9) st.mate = Math.min(st.me + 0.6, st.mate + 1);
        const cap = LEDGES.find((l) => l.y > st.mate - 0.01 && l.y <= st.me + 1);
        if (cap && st.mate > cap.y && st.mate < cap.y + 2.4 && st.me < cap.y + 2.4) st.mate = cap.y;
      } else if (L) {
        if (st.mate < L.y) st.mate = Math.min(L.y, st.mate + 1);
        if (st.phase === "brace" && st.mate >= L.y) {
          if (st.brace) { if (rng() < 0.9) { st.sub++; if (st.sub === 1) say("He is on your shoulders. Keep bracing."); if (st.sub >= 2) { st.mate = L.y + 2.4; st.phase = "take"; st.sub = 0; say("He reaches down. Grab his hand on the beat."); } } }
          else if (st.sub > 0) { st.sub = 0; say("You stood up too soon. He slides back. Hold Brace."); }
        } else if (st.phase === "pulled") {
          if (rng() < 0.9) { st.sub++; if (st.sub >= 3) { st.me = L.y + 2.4; st.lifts++; st.phase = "climb"; say("Up. Climb on."); } }
        }
      }
      st.ahead += ((Math.min(TOP, Math.max(st.me, st.mate) + 5) - st.ahead) * 0.25);
      if (st.me >= TOP && st.mate >= TOP - 1) return finish(true);
      if (st.me >= TOP) st.mate = Math.min(TOP, st.mate + 1);
      if (st.beatsLeft <= 0) return finish(false);
    }
    function finish(win) {
      if (st.over) return; st.over = true;
      const sync = Math.min(70, 50 + 3 * st.lifts);
      api.end(win
        ? { outcome: "win", text: `Into the light at the top of the shaft. ${st.lifts} lifts made together; the raft's sync starts at ${sync}.` }
        : { outcome: "lose", text: `The count ran out ${Math.max(1, Math.round(TOP - st.me))} m below the light. Nobody falls in the shaft; a slip only costs height. Grab on the beat and try again.` });
    }

    const setBrace = (v) => { st.brace = v; bBrace.setAttribute("aria-pressed", String(v)); };
    on(bGrab, "pointerdown", (e) => { e.preventDefault(); press(); });
    on(bBrace, "pointerdown", (e) => { e.preventDefault(); setBrace(true); });
    on(bBrace, "pointerup", () => setBrace(false)); on(bBrace, "pointercancel", () => setBrace(false)); on(bBrace, "pointerleave", () => setBrace(false));
    on(cv, "pointerdown", (e) => { e.preventDefault(); press(); });
    on(window, "keydown", (e) => {
      if (!st.started) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } return; }
      if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") { e.preventDefault(); if (!e.repeat) press(); }
      if (e.key.toLowerCase() === "b" || e.key === "ArrowDown" || e.key.toLowerCase() === "s") { e.preventDefault(); setBrace(true); }
    });
    on(window, "keyup", (e) => { if (e.key.toLowerCase() === "b" || e.key === "ArrowDown" || e.key.toLowerCase() === "s") setBrace(false); });
    on(intro.querySelector("button"), "click", () => start());

    function start() {
      if (st.started) return;
      intro.remove();
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      st.started = true; t0 = performance.now() + 700; beatTimes = [t0];
      say("Grab on the beat.");
      bGrab.focus();
    }

    // ---- drawing --------------------------------------------------------------------------------
    function figure(x, y, pose, col, s, me) {
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5 * s; g.lineCap = "round"; g.lineJoin = "round";
      const hy = y - 50 * s;
      g.beginPath(); g.arc(x, hy - 9 * s, 8 * s, 0, 7); g.fill();
      g.beginPath();
      if (pose === "brace") {            // squat, hands up to take a foot
        g.moveTo(x, hy); g.lineTo(x, y - 24 * s); g.moveTo(x, y - 24 * s); g.lineTo(x - 14 * s, y - 12 * s); g.lineTo(x - 12 * s, y);
        g.moveTo(x, y - 24 * s); g.lineTo(x + 14 * s, y - 12 * s); g.lineTo(x + 12 * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x - 18 * s, hy - 10 * s); g.moveTo(x, hy + 6 * s); g.lineTo(x + 18 * s, hy - 10 * s);
      } else if (pose === "reach") {     // kneeling at the edge, arm down
        g.moveTo(x, hy); g.lineTo(x - 6 * s, y - 16 * s); g.lineTo(x - 22 * s, y); g.moveTo(x - 6 * s, y - 16 * s); g.lineTo(x + 8 * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x + 16 * s, hy + 26 * s); g.lineTo(x + 20 * s, y + 18 * s);
      } else {                           // climbing: one arm high, legs bent
        const a = pose === "climb2" ? -1 : 1;
        g.moveTo(x, hy); g.lineTo(x, y - 20 * s); g.lineTo(x - 12 * a * s, y - 8 * s); g.lineTo(x - 8 * a * s, y + 4 * s);
        g.moveTo(x, y - 20 * s); g.lineTo(x + 12 * a * s, y - 12 * s); g.lineTo(x + 14 * a * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x + 14 * a * s, hy - 20 * s); g.moveTo(x, hy + 6 * s); g.lineTo(x - 16 * a * s, hy + 14 * s);
      }
      g.stroke();
      if (me) { g.fillStyle = C.char; g.font = `700 ${12}px sans-serif`; g.textAlign = "center"; g.fillText("YOU", x, hy - 24 * s); }
    }
    function stencil(x, y, s, rot, red) {
      const grad = g.createRadialGradient(x, y, 0, x, y, 60 * s);
      grad.addColorStop(0, red ? "rgba(179,32,46,.55)" : "rgba(29,22,18,.55)"); grad.addColorStop(1, "rgba(179,32,46,0)");
      g.fillStyle = grad; g.beginPath(); g.arc(x, y, 60 * s, 0, 7); g.fill();
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * 0.55, s * 0.55); g.fillStyle = "#e3cdaa";
      g.beginPath(); g.ellipse(0, 8, 26, 30, 0, 0, 7); g.fill();
      [[-30, 52, -38], [-13, 72, -12], [4, 76, 2], [20, 68, 14], [36, 40, 52]].forEach(([bx, ln, ang]) => {
        g.save(); g.translate(bx * 0.75, Math.abs(bx) < 30 ? -12 : 6); g.rotate((ang * Math.PI) / 180); g.beginPath(); g.ellipse(0, -ln / 2, 7, ln / 2 + 4, 0, 0, 7); g.fill(); g.restore();
      });
      g.restore();
    }
    function draw(now) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const PX = Math.max(34, H / 12);
      const low = Math.min(st.me, st.mate);
      const camT = low * PX - H * 0.32;
      st.cam += (camT - st.cam) * 0.12;
      const sy = (m) => H - (m * PX - st.cam);
      const prog = Math.min(1, st.me / TOP);
      // rock, tinted from cold blue at the bottom to warm red near the heart
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `rgb(${233},${195 - prog * 40},${154 - prog * 50})`); bg.addColorStop(0.5, "#d8c3a2"); bg.addColorStop(1, `rgb(${169 + prog * 40},${180 - prog * 40},${189 - prog * 70})`);
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.save(); g.translate(0, st.cam % 256); g.fillStyle = pattern; g.fillRect(0, -256, W, H + 512); g.restore();
      // the light at the top grows as you near it
      const lr = W * (0.25 + 0.5 * prog);
      const lg = g.createRadialGradient(W / 2, Math.min(sy(TOP + 2), 0) - 20, 0, W / 2, Math.min(sy(TOP + 2), 0) - 20, lr);
      lg.addColorStop(0, "rgba(255,243,208,.95)"); lg.addColorStop(0.5, "rgba(242,181,68,.55)"); lg.addColorStop(1, "rgba(224,96,58,0)");
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      const sw = Math.min(W * 0.5, 420), sxL = W / 2 - sw / 2, sxR = W / 2 + sw / 2;
      // hand stencils on the outer rock
      for (const h of stencils) { const y = sy(h.y); if (y < -80 || y > H + 80) continue; stencil(h.side < 0 ? sxL - Math.max(50, (sxL) * 0.5) : sxR + Math.max(50, (W - sxR) * 0.5), y, h.s, h.rot, h.red); }
      // the shaft walls: wobbling charcoal lines
      g.strokeStyle = C.char; g.lineWidth = 4;
      [sxL, sxR].forEach((x0, side) => { g.beginPath(); for (let y = -20; y <= H + 20; y += 20) { const m = (H - y + st.cam) / PX; const x = x0 + Math.sin(m * 1.3 + side * 2) * 10 + Math.sin(m * 3.1) * 4; y === -20 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
      // holds: paired ochre dabs that tighten on the beat
      const pulse = st.flash;
      for (let m = 1; m <= TOP; m++) {
        const y = sy(m); if (y < -20 || y > H + 20) continue;
        if (LEDGES.some((l) => m > l.y && m < l.y + 2.4)) continue;
        for (const [dx, off] of [[-40, 0], [40, 0.5]]) {
          const x = W / 2 + dx + Math.sin(m * 2.7 + off) * 14, r = 4.5 * (1 - 0.3 * pulse);
          g.fillStyle = m <= st.me ? "rgba(122,16,32,.55)" : C.red;
          g.beginPath(); g.arc(x - 5, y, r, 0, 7); g.arc(x + 5, y + 1, r, 0, 7); g.fill();
        }
      }
      // ledges: thick charcoal bands
      for (const [i, l] of LEDGES.entries()) {
        const y = sy(l.y + 2.4); if (y < -40 || y > H + 60) continue;
        g.fillStyle = "rgba(91,70,54,.25)"; g.fillRect(sxL, y, sw, 2.4 * PX);
        g.strokeStyle = C.char; g.lineWidth = 9; g.beginPath(); g.moveTo(sxL - 10, y); for (let x = sxL; x <= sxR + 10; x += 30) g.lineTo(x, y + Math.sin(x * 0.07 + i) * 3); g.stroke();
      }
      // the other two brothers, ahead, in charcoal
      figure(W / 2 - 10, sy(st.ahead), Math.floor(now / 700) % 2 ? "climb" : "climb2", C.char, 0.75, false);
      figure(W / 2 + 30, sy(Math.min(TOP, st.ahead + 1.6)), Math.floor(now / 800) % 2 ? "climb2" : "climb", "#3a2a20", 0.75, false);
      // you and your brother
      const L = st.ledge >= 0 ? ledgeAt(st.ledge) : null;
      const xMe = W / 2 - 40, xMate = W / 2 + 40;
      let meX = xMe, meY = sy(st.me), matePose = Math.floor(st.mate) % 2 ? "climb" : "climb2", mePose = Math.floor(st.me) % 2 ? "climb" : "climb2", mateX = xMate, mateY = sy(st.mate);
      if (L && st.phase === "shoulders") { matePose = "brace"; mateX = W / 2; mateY = sy(L.y); meX = W / 2; meY = sy(L.y + 0.75 * (st.sub + 1)); }
      if (L && st.phase === "pull") { matePose = "climb"; mateX = W / 2 + 16; mateY = sy(L.y + (st.sub / 3) * 2.2); mePose = "reach"; meX = W / 2 - 6; meY = sy(L.y + 2.4); }
      if (L && st.phase === "brace") { mePose = "brace"; meX = W / 2; meY = sy(L.y); matePose = "climb"; mateX = W / 2 + (st.sub ? 0 : 40); mateY = sy(st.sub ? L.y + 1.2 : st.mate); }
      if (L && (st.phase === "take" || st.phase === "pulled")) { matePose = "reach"; mateX = W / 2 - 6; mateY = sy(L.y + 2.4); mePose = "climb"; meX = W / 2 + 16; meY = sy(L.y + (st.phase === "pulled" ? (st.sub / 3) * 2.2 : 0)); }
      figure(mateX, mateY, matePose, C.ochre, 1, false);
      figure(meX, meY, mePose, C.red, 1, true);
      // heat shimmer along the top edge in the upper section
      if (st.me >= HEAT - 4) {
        g.strokeStyle = "rgba(224,96,58,.35)"; g.lineWidth = 2;
        for (let i = 0; i < 4; i++) { g.beginPath(); for (let x = 0; x <= W; x += 12) { const y = 10 + i * 9 + Math.sin(x * 0.05 + now / (api.reducedMotion ? 1e9 : 160) + i) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      }
      // tally of lifts, cut like the pictograph's strokes
      g.fillStyle = C.char; g.font = "700 12px sans-serif"; g.textAlign = "left";
      g.fillText("LIFTS", 18, 34);
      g.strokeStyle = C.char; g.lineWidth = 4; for (let i = 0; i < st.lifts; i++) { g.beginPath(); g.moveTo(66 + i * 10, 22); g.lineTo(64 + i * 10, 40); g.stroke(); }
      // the count: a row of charcoal heart-ticks burning down
      g.fillText(`HEARTBEATS LEFT ${Math.max(0, st.beatsLeft)}`, 18, 58);
      g.fillText(`${Math.max(0, Math.round(TOP - st.me))} m to the light`, 18, 76);
      if (st.me >= HEAT) { g.fillStyle = C.red; g.fillText("HEAT: the firm window narrows", 18, 94); }
      // beat lane
      const lw = Math.min(340, W - 40), lx = (W - lw) / 2, ly = H - 86, hitX = lx + 46, span = 3000, ppm = (lw - 60) / span;
      g.fillStyle = "rgba(29,22,18,.45)"; g.beginPath(); g.roundRect ? g.roundRect(lx, ly - 14, lw, 28, 14) : g.rect(lx, ly - 14, lw, 28); g.fill();
      g.strokeStyle = C.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(hitX, ly - 14); g.lineTo(hitX, ly + 14); g.stroke();
      for (const t of beatTimes) { const x = hitX + (t - now) * ppm; if (x < lx || x > lx + lw) continue; g.fillStyle = C.red; g.beginPath(); g.arc(x - 3, ly, 5, 0, 7); g.arc(x + 4, ly + 1, 5, 0, 7); g.fill(); }
      for (const p of presses) { const x = hitX + (p.t - now) * ppm; if (x < lx) continue; g.fillStyle = p.on ? C.gold : "#777"; g.fillRect(x - 2, ly - 12, 4, 9); }
      while (presses.length && presses[0].t < now - 2000) presses.shift();
      if (st.msgT > 0 && st.msg) {
        g.globalAlpha = Math.min(1, st.msgT / 400);
        g.font = `700 ${W < 500 ? 14 : 18}px sans-serif`; g.textAlign = "center";
        const tw = g.measureText(st.msg).width + 24; g.fillStyle = "rgba(230,210,176,.92)"; g.fillRect(W / 2 - tw / 2, 104, tw, 30);
        g.fillStyle = C.char; g.fillText(st.msg, W / 2, 125); g.globalAlpha = 1;
      }
    }
    function frame(now) {
      const dt = Math.min(60, now - lastNow); lastNow = now;
      if (st.started && !st.over) {
        while (beatTimes.length - nextBeat < 6) { const last = beatTimes[beatTimes.length - 1]; beatTimes.push(last + 60000 / bpmAt(st.me)); }
        while (!st.over && now >= beatTimes[nextBeat]) { onBeat(nextBeat); nextBeat++; }
        if (beatTimes.length > 40) { const cut = beatTimes.length - 30; beatTimes = beatTimes.slice(cut); nextBeat -= cut; st.lastPress -= cut; }
      }
      st.flash = Math.max(0, st.flash - dt / 250); st.msgT = Math.max(0, st.msgT - dt);
      draw(now);
      if (!st.over) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        cancelAnimationFrame(raf); ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

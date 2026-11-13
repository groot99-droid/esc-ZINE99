// A Journey Into the Heartstream, 2D mode A: the river section (DESIGN.md section 10, `m2_river`).
// Woodblock wave print: keyed crests along the surface line, flat carved bands below it.
// One stretch, cut from `s2_river_2`: 240 m at 76 bpm, folds, swells, tendrils, cell predators and one
// immune beast with three eye-openings. The player is the stern brother; three companions row with him.
//
// Line shown at the start, verbatim (DESIGN.md section 3, "The river"):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "It is not a tube. / It is a river."

const C = { key: "#2a0a10", deep: "#7A1020", river: "#B3202E", hi: "#E0603A", gold: "#F2B544", bone: "#E8DCC4",
  marrow: "#1E3557", marrow2: "#2F5D8C", glow: "#7FB2E0", peach: "#f0b08a" };

export default {
  mount(root, api) {
    const P = "heartstream-river-section-";
    const rng = api.rng();
    const BPM = 76, PERIOD = 60000 / BPM, GOOD = 120, LEN = 240, CURRENT = 1.0;
    const PATROL = [86, 206];
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.deep};font-family:var(--g-body);color:${C.bone};user-select:none;-webkit-user-select:none;touch-action:none}
.${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:8px 10px 10px;background:linear-gradient(0deg,rgba(42,10,16,.85),rgba(42,10,16,0))}
.${P}pad button{font:700 14px var(--g-body);color:${C.key};background:${C.bone};border:3px solid ${C.key};border-radius:4px;padding:10px 12px;min-width:64px;cursor:pointer;touch-action:none}
.${P}pad button.${P}row{background:${C.gold};min-width:110px}
.${P}pad button[aria-pressed=true]{background:${C.glow}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(42,10,16,.6)}
.${P}card{max-width:520px;background:${C.bone};color:${C.key};border:4px solid ${C.key};padding:20px 22px;box-shadow:8px 8px 0 ${C.key}}
.${P}card h2{font-family:var(--g-display);font-size:30px;margin:0 0 8px}
.${P}card p{margin:0 0 10px;line-height:1.4}
.${P}card q{font-family:var(--g-display);font-style:italic;font-size:20px;display:block;margin-bottom:10px;color:${C.deep}}
.${P}card button{font:700 16px var(--g-body);background:${C.river};color:${C.bone};border:3px solid ${C.key};padding:10px 22px;cursor:pointer}
`;
    const cv = document.createElement("canvas");
    const pad = document.createElement("div");
    pad.className = P + "pad";
    const mk = (label, cls, title) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.title = title; if (cls) b.className = cls; pad.appendChild(b); return b; };
    const bBow = mk("◀ Bow", "", "Trim toward the bow (Left / A)");
    const bRow = mk("Row", P + "row", "Row on the beat (Space / tap)");
    const bStern = mk("Stern ▶", "", "Trim toward the stern (Right / D)");
    const bLift = mk("Lift", "", "Hold to raise your oar (Up / W)");
    const bHush = mk("Hush", "", "Hold to crouch and ship your oar (Down / S)");
    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The river section</h2><q>It is not a tube. It is a river.</q>
<p><b>Row on the beat</b> (Space or the Row button). <b>Trim</b> to the bow to pass under valve folds, to the stern to ride over swells.</p>
<p><b>Lift</b> your oar when a tendril glows beneath you. When the beast's eye opens, <b>Hush</b> and keep still. Reach the heart.</p>
<button type="button">Start</button></div>`;
    wrap.append(css, cv, pad, intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");

    // ---- state ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    const resize = () => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    const folds = [30, 70, 128, 182].map((x) => ({ x, hit: false, done: false }));
    const swells = [50, 104, 160, 222].map((x) => ({ x, hit: false, done: false }));
    const tendrils = [24, 58, 92, 118, 150, 196, 230].map((x) => ({ x, done: false }));
    const preds = [40, 88, 140, 170, 210].map((x) => ({ x, d: 4 + rng() * 7, home: 4 + rng() * 7, hunt: false, gone: false, ph: rng() * 6 }));
    const eyes = [112, 150, 188].map((x) => ({ x, state: "wait", t: 0 }));
    const st = { started: false, over: false, x: 0, speed: CURRENT, trim: 0, pitch: 0, lift: false, hush: false,
      stun: 0, stop: 0, surge: 0, sync: 56, notice: 0, rowBeats: 0, onBeats: 0, flash: 0, jolt: 0, eye: 0, msg: "", msgT: 0 };
    const beats = new Map(); // beat index -> { player: "on"|"off"|null, comp: [bool x3], active }
    let t0 = 0, lastNow = 0, nextBeat = 0, nextEval = 0, raf = 0, audio = null;
    const strokes = []; // recent stroke marks for the beat lane: { k, on }

    const say = (m) => { st.msg = m; st.msgT = 2200; };
    const beatTime = (k) => t0 + k * PERIOD;
    const inPatrol = () => st.x >= PATROL[0] && st.x <= PATROL[1];
    const eyeOpen = () => eyes.some((e) => e.state === "open");
    const playerActive = () => st.stun <= 0 && !st.hush && !st.lift;

    // ---- sound: a soft lub-dub on the beat, a low drone on the eye's tell ------------------------
    function thump(strong) {
      if (!audio) return;
      const t = audio.currentTime;
      [[0, 58], [0.16, 46]].forEach(([dt, f]) => {
        const o = audio.createOscillator(), v = audio.createGain();
        o.frequency.setValueAtTime(f * 1.6, t + dt); o.frequency.exponentialRampToValueAtTime(f, t + dt + 0.12);
        v.gain.setValueAtTime(0.0001, t + dt); v.gain.exponentialRampToValueAtTime(strong ? 0.5 : 0.3, t + dt + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.2);
        o.connect(v).connect(audio.destination); o.start(t + dt); o.stop(t + dt + 0.25);
      });
    }
    function drone() {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.type = "sawtooth"; o.frequency.value = 38;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.08, t + 0.3); v.gain.exponentialRampToValueAtTime(0.0001, t + 2 * PERIOD / 1000);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 2 * PERIOD / 1000 + 0.1);
    }

    // ---- input ----------------------------------------------------------------------------------
    function row() {
      if (!st.started || st.over) return;
      if (st.stun > 0) { say("Stunned: you cannot row."); return; }
      if (st.hush || st.lift) return;
      const now = performance.now();
      const k = Math.round((now - t0) / PERIOD);
      const off = now - beatTime(k);
      const ok = Math.abs(off) <= GOOD;
      const b = beats.get(k) || { player: null, comp: null };
      if (b.player) return; // one stroke per beat
      b.player = ok ? "on" : "off"; beats.set(k, b);
      strokes.push({ k, on: ok, t: now });
      if (!ok) {
        // splash: cell predators drift toward it
        preds.forEach((p) => { if (!p.gone && Math.abs(p.x - st.x) < 18) p.hunt = true; });
        if (inPatrol()) st.notice += 4;
        if (st.sync <= 30) st.notice += inPatrol() ? 2 : 0;
      }
      if (eyeOpen()) { st.notice += 8; say("The eye is open. Hush."); }
    }
    const setTrim = (d) => { if (!st.over) st.trim = Math.max(-1, Math.min(1, st.trim + d)); };
    const hold = (btn, key) => {
      const down = (e) => { e.preventDefault(); st[key] = true; btn.setAttribute("aria-pressed", "true"); };
      const up = () => { st[key] = false; btn.setAttribute("aria-pressed", "false"); };
      on(btn, "pointerdown", down); on(btn, "pointerup", up); on(btn, "pointercancel", up); on(btn, "pointerleave", up);
    };
    hold(bLift, "lift"); hold(bHush, "hush");
    on(bRow, "pointerdown", (e) => { e.preventDefault(); row(); });
    on(bBow, "click", () => setTrim(-1));
    on(bStern, "click", () => setTrim(1));
    on(cv, "pointerdown", (e) => { e.preventDefault(); row(); });
    on(window, "keydown", (e) => {
      if (!st.started) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } return; }
      const k = e.key.toLowerCase();
      if (k === " " || k === "j") { e.preventDefault(); if (!e.repeat) row(); }
      else if (k === "arrowleft" || k === "a") { e.preventDefault(); if (!e.repeat) setTrim(-1); }
      else if (k === "arrowright" || k === "d") { e.preventDefault(); if (!e.repeat) setTrim(1); }
      else if (k === "arrowup" || k === "w") { e.preventDefault(); st.lift = true; }
      else if (k === "arrowdown" || k === "s") { e.preventDefault(); st.hush = true; }
    });
    on(window, "keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") st.lift = false;
      if (k === "arrowdown" || k === "s") st.hush = false;
    });
    on(intro.querySelector("button"), "click", () => start());

    function start() {
      if (st.started) return;
      intro.remove();
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      st.started = true;
      t0 = performance.now() + 600; nextBeat = 0; nextEval = 0; lastNow = performance.now();
      say("Row on the beat.");
      bRow.focus();
    }

    // ---- the beat -------------------------------------------------------------------------------
    function onBeat(k) {
      thump(false);
      st.flash = 1;
      if (st.stun > 0) st.stun--;
      if (st.stop > 0) st.stop--;
      const b = beats.get(k) || { player: null };
      // companions: on the beat at 90%; they lift for tendrils and hush on the eye's tell
      const hushing = eyes.some((e) => e.state === "tell" || e.state === "open");
      b.comp = [0, 1, 2].map(() => (hushing ? null : rng() < 0.9));
      b.active = playerActive() && !hushing;
      beats.set(k, b);
      // the beast's eye
      for (const e of eyes) {
        if (e.state === "tell" || e.state === "open") {
          e.t--;
          if (e.t <= 0) {
            if (e.state === "tell") { e.state = "open"; e.t = 4; say("The eye is open."); }
            else { e.state = "done"; say("The eye closes."); }
          }
        }
      }
    }
    function evalBeat(k) {
      const b = beats.get(k);
      if (!b || !b.comp) return;
      const comp = b.comp.filter((c) => c !== null);
      const compOn = comp.filter(Boolean).length;
      const pOn = b.player === "on" ? 1 : 0;
      const rowers = comp.length + (b.active ? 1 : 0);
      const onCount = compOn + pOn;
      if (rowers > 0) {
        if (onCount === rowers) st.sync += 3; else if (onCount >= rowers / 2) st.sync += 1; else st.sync -= 2;
        st.sync = Math.max(0, Math.min(100, st.sync));
      }
      if (b.active) { st.rowBeats++; if (pOn) st.onBeats++; }
      let v = CURRENT + 0.15 * onCount;
      if (st.sync >= 70) v *= 1.25;
      if (onCount === 4) { st.surge = 1000; say("Together."); thump(true); }
      st.speed = v;
    }

    // ---- simulation -----------------------------------------------------------------------------
    function step(dt, now) {
      while (now >= beatTime(nextBeat)) { onBeat(nextBeat); nextBeat++; }
      while (now >= beatTime(nextEval) + GOOD + 10) { evalBeat(nextEval); nextEval++; }
      const s = dt / 1000;
      st.flash = Math.max(0, st.flash - s * 4);
      st.surge = Math.max(0, st.surge - dt);
      st.msgT = Math.max(0, st.msgT - dt);
      st.jolt = Math.max(0, st.jolt - s * 3);
      st.pitch += (st.trim * 0.6 - st.pitch) * Math.min(1, s * 5);
      const v = st.stop > 0 ? 0 : st.speed + (st.surge > 0 ? 0.4 : 0);
      st.x += v * s;
      // folds and swells, met at the bow (raft spans x-3..x+3)
      for (const f of folds) if (!f.done && st.x + 2.5 >= f.x) {
        f.done = true;
        if (st.pitch > -0.3) { f.hit = true; st.stop = 2; st.jolt = 1; say("Struck a fold. Trim to the bow."); thump(true); }
      }
      for (const w of swells) if (!w.done && st.x + 2.5 >= w.x) {
        w.done = true;
        if (st.pitch < 0.3) { w.hit = true; st.stop = 2; st.jolt = 1; say("The swell stops you. Trim to the stern."); thump(true); }
      }
      // tendrils rise as the raft nears; at the surface they sting an oar left down
      for (const t of tendrils) if (!t.done && st.x >= t.x) {
        t.done = true;
        if (!st.lift && !st.hush) { st.stun = 2; say("Stung. Lift your oar when a tendril glows."); }
      }
      // predators drift; hunting ones close on the hull
      for (const p of preds) {
        if (p.gone) continue;
        p.ph += s;
        if (p.hunt) {
          const dx = st.x - p.x;
          p.x += Math.sign(dx) * Math.min(Math.abs(dx), 3.2 * s) + st.speed * s * 0.9;
          p.d = Math.max(0.6, p.d - 2.2 * s);
          if (Math.abs(st.x - p.x) < 2.2 && p.d <= 0.8) {
            p.gone = true; st.stun = 2; st.jolt = 0.6;
            if (inPatrol()) st.notice += 5;
            say("A cell bumped the hull. Off-beat strokes splash.");
          }
        } else p.d = p.home + Math.sin(p.ph) * 0.6;
        if (p.x < st.x - 25) p.gone = true;
      }
      // the beast: eye-openings start with a 2-beat tell
      for (const e of eyes) if (e.state === "wait" && st.x >= e.x) { e.state = "tell"; e.t = 2; drone(); say("A low drone: the eye is about to open."); }
      if (inPatrol() || eyeOpen()) {
        if (eyeOpen() && !st.hush) st.notice += 15 * s;
        if (st.hush) st.notice -= 6 * s;
      } else if (st.hush) st.notice -= 6 * s;
      st.notice = Math.max(0, st.notice);
      st.eye += ((eyeOpen() ? 1 : eyes.some((e) => e.state === "tell") ? 0.3 : 0) - st.eye) * Math.min(1, s * 4);
      if (st.notice >= 100) return finish(false);
      if (st.x >= LEN) return finish(true);
    }

    function finish(win) {
      st.over = true;
      const inTime = st.rowBeats ? Math.round((100 * st.onBeats) / st.rowBeats) : 0;
      api.end(win
        ? { outcome: "win", text: `The raft reaches the narrows. You kept time on ${inTime}% of your rowing beats; the raft's sync is ${Math.round(st.sync)}.` }
        : { outcome: "lose", text: "The beast's eye found you. You are lifted into it in one movement, without a struggle; your seat stays empty. Taken by the river." });
    }

    // ---- drawing (woodblock) --------------------------------------------------------------------
    function crest(x, y, s, fill) {
      // one keyed crest: a curling claw of foam over the line
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + 10 * s, y - 16 * s, x + 30 * s, y - 22 * s, x + 40 * s, y - 10 * s);
      g.bezierCurveTo(x + 34 * s, y - 14 * s, x + 26 * s, y - 10 * s, x + 30 * s, y - 4 * s);
      g.bezierCurveTo(x + 36 * s, y + 2 * s, x + 44 * s, y - 2 * s, x + 48 * s, y);
      g.closePath();
      g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.key; g.stroke();
    }
    function draw(now) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const SURF = Math.round(H * 0.35), PX = Math.max(26, W / 30), RX = W * 0.3;
      const sx = (x) => RX + (x - st.x) * PX;
      const jy = st.jolt * Math.sin(now / 30) * 4;
      // sky: the artery interior in flat bands
      const bands = [[0, "#4a0812"], [0.3, C.deep], [0.62, C.river], [0.86, "#d4704f"]];
      bands.forEach(([f, c], i) => { g.fillStyle = c; const y0 = SURF * f, y1 = i < 3 ? SURF * bands[i + 1][0] : SURF; g.fillRect(0, y0, W, y1 - y0 + 1); });
      // artery wall: low carved folds along the top, scrolling slowly
      g.fillStyle = "#3d0610"; g.strokeStyle = C.key; g.lineWidth = 3;
      g.beginPath(); g.moveTo(0, 0);
      for (let i = -1; i < W / 90 + 2; i++) {
        const x = i * 90 - ((st.x * PX * 0.35) % 90);
        g.quadraticCurveTo(x + 45, SURF * 0.16 + (i % 2) * 8, x + 90, 0);
      }
      g.lineTo(W, 0); g.closePath(); g.fill(); g.stroke();
      // valve folds hanging to the surface
      for (const f of folds) {
        const x = sx(f.x); if (x < -120 || x > W + 120) continue;
        const bottom = SURF - 26;
        g.beginPath(); g.moveTo(x - 60, 0);
        g.bezierCurveTo(x - 60, bottom * 0.6, x - 30, bottom, x, bottom);
        g.bezierCurveTo(x + 30, bottom, x + 60, bottom * 0.6, x + 60, 0); g.closePath();
        g.fillStyle = f.hit ? "#5a0b17" : "#8f2233"; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
        g.lineWidth = 2; g.strokeStyle = "rgba(240,176,138,.55)";
        for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x - 50 + k * 25, 10); g.quadraticCurveTo(x - 50 + k * 25 + 4, bottom * 0.6, x - 30 + k * 15, bottom - 14); g.stroke(); }
        if (!f.done && x > RX) { g.fillStyle = C.bone; g.font = "700 12px sans-serif"; g.textAlign = "center"; g.fillText("BOW DOWN", x, bottom + 16); }
      }
      // the water: flat carved bands, with carved wave lines between them
      const water = [[SURF, C.river], [SURF + (H - SURF) * 0.3, "#981a28"], [SURF + (H - SURF) * 0.58, C.deep], [SURF + (H - SURF) * 0.8, "#5a0b17"]];
      water.forEach(([y, c], i) => {
        g.fillStyle = c; g.fillRect(0, y, W, (i < 3 ? water[i + 1][0] : H) - y + 1);
        if (i) {
          g.strokeStyle = "rgba(240,176,138,.35)"; g.lineWidth = 2; g.beginPath();
          for (let x = -((st.x * PX * (0.6 + i * 0.1)) % 70) - 70; x < W + 70; x += 70) { g.moveTo(x, y); g.quadraticCurveTo(x + 17, y - 7, x + 35, y); g.quadraticCurveTo(x + 52, y + 7, x + 70, y); }
          g.stroke();
        }
      });
      // swells: a raised hump in the surface
      for (const w of swells) {
        const x = sx(w.x); if (x < -140 || x > W + 140) continue;
        g.beginPath(); g.moveTo(x - 90, SURF); g.quadraticCurveTo(x, SURF - 44, x + 90, SURF); g.closePath();
        g.fillStyle = C.river; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
        for (let k = -2; k <= 1; k++) crest(x + k * 34, SURF - 30 + Math.abs(k + 0.5) * 9, 0.7, C.bone);
        if (!w.done && x > RX) { g.fillStyle = C.bone; g.font = "700 12px sans-serif"; g.textAlign = "center"; g.fillText("STERN DOWN", x, SURF - 54); }
      }
      // keyed crests along the surface line
      const cs = Math.max(0.6, Math.min(1.1, W / 1200));
      for (let x = -((st.x * PX) % (60 * cs)) - 60 * cs; x < W + 60; x += 60 * cs) crest(x, SURF, cs, C.bone);
      g.strokeStyle = C.key; g.lineWidth = 3; g.beginPath(); g.moveTo(0, SURF); g.lineTo(W, SURF); g.stroke();
      // the immune beast below, its single slow eye
      if (st.x > PATROL[0] - 20 && st.x < PATROL[1] + 20) {
        const bx = W * 0.55 + Math.sin(now / 2400) * W * 0.08, by = H + 30;
        g.beginPath(); g.ellipse(bx, by, Math.min(W * 0.42, 520), (H - SURF) * 0.42, 0, Math.PI, 0); g.closePath();
        g.fillStyle = "#3d0610"; g.fill(); g.lineWidth = 4; g.strokeStyle = C.key; g.stroke();
        g.strokeStyle = "#6a1020"; g.lineWidth = 3;
        for (let i = 0; i < 6; i++) { const x = bx - 200 + i * 80; g.beginPath(); g.moveTo(x, by - (H - SURF) * 0.28); g.quadraticCurveTo(x + 30, by - (H - SURF) * 0.34, x + 60, by - (H - SURF) * 0.28); g.stroke(); }
        const ey = by - (H - SURF) * 0.3, open = st.eye;
        g.beginPath(); g.ellipse(bx, ey, 46, 4 + 20 * open, 0, 0, Math.PI * 2);
        g.fillStyle = open > 0.6 ? C.gold : "#9a6a2a"; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
        g.beginPath(); g.ellipse(bx, ey, 6, 3 + 16 * open, 0, 0, Math.PI * 2); g.fillStyle = C.key; g.fill();
      }
      // tendrils rising on their tell
      for (const t of tendrils) {
        if (t.done && st.x - t.x > 6) continue;
        const x = sx(t.x); if (x < -40 || x > W + 40) continue;
        const ahead = t.x - st.x, rise = Math.max(0, Math.min(1, 1 - ahead / 9));
        const tipY = H - (H - SURF) * (0.12 + 0.88 * rise);
        g.strokeStyle = C.bone; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 20, H);
        g.bezierCurveTo(x - 20, H - (H - tipY) * 0.4, x + 22, tipY + (H - tipY) * 0.3, x, tipY); g.stroke();
        const glow = ahead < 6 ? 0.5 + 0.5 * Math.sin(now / 90) : 0.2;
        g.beginPath(); g.arc(x, tipY, 5 + 4 * glow, 0, Math.PI * 2); g.fillStyle = `rgba(255,236,200,${0.5 + glow * 0.5})`; g.fill();
      }
      // cell predators: glassy lanterns with chevrons
      for (const p of preds) {
        if (p.gone) continue;
        const x = sx(p.x), y = SURF + p.d * (H - SURF) / 13; if (x < -40 || x > W + 40) continue;
        g.beginPath(); g.ellipse(x, y, 20, 14, 0, 0, Math.PI * 2); g.fillStyle = p.hunt ? "rgba(255,190,170,.75)" : "rgba(255,210,200,.45)"; g.fill();
        g.lineWidth = 2; g.strokeStyle = C.key; g.stroke();
        g.beginPath(); g.arc(x - 3, y - 2, 5, 0, Math.PI * 2); g.fillStyle = C.deep; g.fill();
        g.beginPath(); g.moveTo(x + 26, y - 5); g.lineTo(x + 20, y); g.lineTo(x + 26, y + 5); g.strokeStyle = C.bone; g.stroke();
      }
      // the raft: ivory tissue, warmer as sync rises; four brothers, the stern one is you
      const rx = RX, ry = SURF + jy, tilt = st.pitch * 0.12;
      g.save(); g.translate(rx, ry); g.rotate(tilt);
      const warm = Math.max(0, (st.sync - 40) / 60);
      g.beginPath(); g.moveTo(-110, -8); g.quadraticCurveTo(0, 18, 120, -12); g.lineTo(108, -24); g.lineTo(-100, -20); g.closePath();
      g.fillStyle = st.surge > 0 ? "#fff1c8" : `rgb(${232},${220 - warm * 40},${196 - warm * 70})`; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
      const seats = [80, 30, -20, -70];
      seats.forEach((bx, i) => {
        const me = i === 3, b = beats.get(nextBeat - 1);
        const crouch = me ? st.hush : eyes.some((e) => e.state === "tell" || e.state === "open");
        const stunned = me && st.stun > 0;
        const hgt = crouch ? 26 : 46;
        g.fillStyle = me ? "#6a5a8a" : C.marrow2; g.strokeStyle = me ? C.gold : C.key; g.lineWidth = me ? 3 : 2;
        g.fillRect(bx - 7, -22 - hgt, 14, hgt); g.strokeRect(bx - 7, -22 - hgt, 14, hgt);
        g.beginPath(); g.arc(bx, -30 - hgt, 10, 0, Math.PI * 2); g.fill(); g.stroke();
        // the oar: down in the water, lifted high, or shipped
        g.strokeStyle = me && stunned ? "#999" : C.bone; g.lineWidth = 4; g.beginPath();
        const lifted = me ? st.lift : false;
        const stroke = b && (me ? b.player === "on" : b.comp && b.comp[i]) ? st.flash * 14 : 0;
        if (crouch) { g.moveTo(bx - 30, -26); g.lineTo(bx + 30, -30); }
        else if (lifted) { g.moveTo(bx, -40); g.lineTo(bx + 40, -110); }
        else { g.moveTo(bx + 4, -40); g.lineTo(bx - 34 - stroke, 46); }
        g.stroke();
        if (me) { g.fillStyle = C.gold; g.font = "700 12px sans-serif"; g.textAlign = "center"; g.fillText(stunned ? "STUNNED" : "YOU", bx, -52 - hgt); }
      });
      g.restore();
      // HUD: the vessel line along the top edge, the raft's glyph moving toward a small heart
      const vx0 = 20, vx1 = W - 50, vy = 16;
      g.strokeStyle = C.bone; g.lineWidth = 2; g.beginPath(); g.moveTo(vx0, vy); g.lineTo(vx1, vy); g.stroke();
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(vx0 + (vx1 - vx0) * PATROL[0] / LEN, vy - 2, (vx1 - vx0) * (PATROL[1] - PATROL[0]) / LEN, 4);
      const gx = vx0 + (vx1 - vx0) * Math.min(1, st.x / LEN);
      g.fillStyle = C.bone; g.beginPath(); g.moveTo(gx - 9, vy - 4); g.lineTo(gx + 9, vy - 4); g.lineTo(gx + 6, vy + 4); g.lineTo(gx - 6, vy + 4); g.fill();
      const hs = 1 + st.flash * 0.25; g.save(); g.translate(vx1 + 18, vy + 1); g.scale(hs, hs);
      g.fillStyle = C.gold; g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -8, -12, 0, -5); g.bezierCurveTo(8, -12, 14, -2, 0, 8); g.fill(); g.restore();
      // notice: the beast's attention, shown only on a patrol stretch
      if (inPatrol() || st.notice > 0) {
        const nx = W - 150, ny = 40;
        g.fillStyle = "rgba(42,10,16,.75)"; g.fillRect(nx - 10, ny - 4, 150, 30);
        g.fillStyle = C.bone; g.font = "700 11px sans-serif"; g.textAlign = "left"; g.fillText("NOTICE", nx, ny + 15);
        g.strokeStyle = C.bone; g.strokeRect(nx + 52, ny + 5, 80, 12);
        g.fillStyle = st.notice > 70 ? C.gold : C.hi; g.fillRect(nx + 52, ny + 5, 80 * Math.min(1, st.notice / 100), 12);
      }
      // the beat lane: marks slide left into the line; your strokes show above it
      const lw = Math.min(360, W - 40), lx = (W - lw) / 2, ly = H - 92, hitX = lx + 50, pxPerMs = (lw - 60) / (PERIOD * 4);
      g.fillStyle = "rgba(42,10,16,.6)"; g.fillRect(lx, ly - 14, lw, 28);
      g.strokeStyle = C.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(hitX, ly - 14); g.lineTo(hitX, ly + 14); g.stroke();
      if (st.started) {
        for (let k = nextBeat - 1; k < nextBeat + 5; k++) {
          const x = hitX + (beatTime(k) - now) * pxPerMs; if (x < lx || x > lx + lw) continue;
          g.fillStyle = C.bone; g.beginPath(); g.arc(x, ly, 6, 0, Math.PI * 2); g.fill();
        }
        for (const s of strokes) {
          const x = hitX + (s.t - now) * pxPerMs; if (x < lx) continue;
          g.fillStyle = s.on ? C.gold : "#888"; g.fillRect(x - 2, ly - 12, 4, 10);
        }
        while (strokes.length && strokes[0].t < now - PERIOD * 2) strokes.shift();
      }
      if (st.msgT > 0) {
        g.globalAlpha = Math.min(1, st.msgT / 400); g.fillStyle = C.bone; g.font = `700 ${W < 500 ? 14 : 17}px sans-serif`; g.textAlign = "center";
        g.fillText(st.msg, W / 2, SURF + 40); g.globalAlpha = 1;
      }
    }

    function frame(now) {
      const dt = Math.min(60, now - lastNow); lastNow = now;
      if (st.started && !st.over) step(dt, now);
      draw(now);
      if (!st.over) raf = requestAnimationFrame(frame);
    }
    lastNow = performance.now();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

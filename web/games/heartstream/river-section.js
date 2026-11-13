// A Journey Into the Heartstream, 2D mode A: the river section (DESIGN.md section 10, `m2_river`).
// Woodblock wave print: keyed crests along the surface line, flat carved bands below it.
// One stretch built from `s2_river_1` to `s2_river_3` (chapter 6 into 7), 250 m in three reaches:
//   open water (76 bpm): valve folds, swells, tendrils, cell predators;
//   the patrol (76 bpm): one immune beast and three eye-openings;
//   the narrows (rising to 86 bpm): folds and swells close together, the current faster.
// The player is the stern brother; three companions row with him. Actions unlock as the river
// brings them: Row, then Trim, then Lift, then Hush.
//
// Lines shown, verbatim (DESIGN.md section 3):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "It is not a tube. / It is a river."
//   "immune creatures watch from the shadows"
//   "The river grows narrower. / The current grows faster. / The heart draws near."
// The companions' "Down." and "Hush." are the one who fears's lines from DESIGN.md section 6.

import { howTo, Legend, Beats, Streak, flourish, disposeKit } from "./_kit.js";

const C = { key: "#2a0a10", deep: "#7A1020", river: "#B3202E", hi: "#E0603A", gold: "#F2B544", bone: "#E8DCC4",
  marrow: "#1E3557", marrow2: "#2F5D8C", glow: "#7FB2E0", peach: "#f0b08a" };

export default {
  mount(root, api) {
    const P = "heartstream-river-section-";
    const rng = api.rng();
    const RM = api.reducedMotion;
    const streak = new Streak(api);
    const LEN = 250, CURRENT = 1.0;
    const PATROL = [86, 182], NARROWS = 186;
    let GOOD = 120;
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.deep};font-family:var(--g-body);color:${C.bone};user-select:none;-webkit-user-select:none;touch-action:none}
.${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:8px 10px 10px;background:linear-gradient(0deg,rgba(42,10,16,.9),rgba(42,10,16,0))}
.${P}pad button{font:700 15px var(--g-body);color:${C.key};background:${C.bone};border:3px solid ${C.key};border-radius:3px;padding:10px 12px;min-width:66px;min-height:46px;cursor:pointer;touch-action:none;box-shadow:3px 3px 0 ${C.key};transition:transform .06s}
.${P}pad button:hover{background:#fff6e2}
.${P}pad button:active,.${P}pad button[aria-pressed=true]{transform:translate(2px,2px);box-shadow:1px 1px 0 ${C.key}}
.${P}pad button.${P}row{background:${C.gold};min-width:112px}
.${P}pad button[aria-pressed=true]{background:${C.glow}}
.${P}pad button[hidden]{display:none}
.${P}pad button small{display:block;font-size:12px;font-weight:400;opacity:.8}
.${P}legend{position:absolute;left:12px;top:30px;margin:0;padding:6px 10px;list-style:none;background:rgba(42,10,16,.78);border:2px solid ${C.key};font-size:13px;line-height:1.55;max-width:min(260px,46vw)}
.${P}legend b{color:${C.gold};letter-spacing:.06em}
.${P}legend li.${P}new{color:#fff;animation:${P}glow 1.2s ease-in-out 2}
@keyframes ${P}glow{50%{background:${C.river}}}
.${P}beat{position:absolute;left:50%;top:30px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:10px 16px;background:${C.bone};color:${C.key};border:3px solid ${C.key};box-shadow:5px 5px 0 ${C.key};font-family:var(--g-display);font-size:19px;line-height:1.3;text-align:center;white-space:pre-line}
.${P}beat b{font-family:var(--g-body);font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${C.deep};display:block}
.${P}beat.${P}in{animation:${P}drop .35s ease-out}
@keyframes ${P}drop{from{transform:translate(-50%,-14px);opacity:0}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(42,10,16,.62);overflow:auto;z-index:4}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:${C.bone};color:${C.key};border:4px solid ${C.key};padding:46px 22px 20px;box-shadow:8px 8px 0 ${C.key};
  background-image:repeating-linear-gradient(0deg,rgba(42,10,16,.045) 0 2px,transparent 2px 9px),linear-gradient(${C.bone},${C.bone})}
.${P}card::before{content:"";position:absolute;left:0;right:0;top:0;height:34px;border-bottom:4px solid ${C.key};background:${C.river} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='34'%3E%3Cpath d='M0 30 C8 14 26 8 38 20 C32 16 26 20 30 26 C36 32 46 28 60 30' fill='%23E8DCC4' stroke='%232a0a10' stroke-width='2.5'/%3E%3C/svg%3E") repeat-x left bottom}
.${P}kick{position:absolute;right:14px;top:46px;writing-mode:vertical-rl;background:${C.river};color:${C.bone};border:3px solid ${C.key};padding:8px 4px;font:700 13px var(--g-body);letter-spacing:.2em;text-transform:uppercase}
.${P}card h2{font-family:var(--g-display);font-size:32px;margin:0 40px 6px 0;line-height:1.05}
.${P}q{font-family:var(--g-display);font-style:italic;font-size:21px;margin:0 40px 10px 0;color:${C.deep};white-space:pre-line}
.${P}scene{margin:0 40px 10px 0;font-size:15px;line-height:1.45}
.${P}goal{margin:0 0 10px;font-size:16px;line-height:1.4;padding:8px 10px;background:${C.key};color:${C.bone}}
.${P}goal b{color:${C.gold};text-transform:uppercase;letter-spacing:.12em;font-size:13px;margin-right:6px}
.${P}keys{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:6px}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:2px 10px;align-items:baseline;font-size:15px}
.${P}kv{background:${C.gold};border:2px solid ${C.key};padding:2px 6px;text-align:center;font-size:14px}
.${P}kc{font-weight:700}
.${P}kw{grid-column:2;font-size:14px;opacity:.85}
.${P}extra{font-size:14px;margin:0 0 12px}
.${P}extra label{display:flex;gap:8px;align-items:center;cursor:pointer;padding:6px 8px;border:2px dashed ${C.deep}}
.${P}start{font:700 17px var(--g-body);background:${C.river};color:${C.bone};border:3px solid ${C.key};padding:10px 28px;cursor:pointer;box-shadow:4px 4px 0 ${C.key}}
.${P}start:hover{background:${C.hi}}
.${P}shake{animation:${P}shk .35s}
@keyframes ${P}shk{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@media (max-width:560px){.${P}legend{display:none}.${P}beat{font-size:17px;top:28px}.${P}pad button{min-width:58px;padding:8px 8px}.${P}pad button.${P}row{min-width:92px}.${P}card{padding-top:44px}.${P}keys li{grid-template-columns:78px 1fr}}
`;
    const cv = document.createElement("canvas");
    const pad = document.createElement("div");
    pad.className = P + "pad";
    const mk = (label, sub, cls, title) => { const b = document.createElement("button"); b.type = "button"; b.innerHTML = `${label}<small>${sub}</small>`; b.title = title; if (cls) b.className = cls; pad.appendChild(b); return b; };
    const bBow = mk("◀ Bow", "A / ←", "", "Trim toward the bow (Left / A)");
    const bRow = mk("Row", "Space", P + "row", "Row on the beat (Space / tap the river)");
    const bStern = mk("Stern ▶", "D / →", "", "Trim toward the stern (Right / D)");
    const bLift = mk("Lift", "hold W / ↑", "", "Hold to raise your oar (Up / W)");
    const bHush = mk("Hush", "hold S / ↓", "", "Hold to crouch and ship your oar (Down / S)");
    [bBow, bStern, bLift, bHush].forEach((b) => { b.hidden = true; });
    const gentleOffer = streak.losses >= 2;
    const intro = howTo(P, {
      kicker: "Chapter six",
      title: "The river section",
      quote: "It is not a tube.\nIt is a river.",
      scene: "The shaft is behind you. You sit at the stern of the living raft, your three brothers ahead of you, and the heart is somewhere downstream.",
      goal: "Row the raft to the heart without being noticed by what swims below.",
      keys: [["Row", "Space · tap the river · Row", "on the beat, with your brothers"]],
      extra: `<p style="margin:0 0 8px">Other strokes come as the river brings them.</p>${gentleOffer ? `<label><input type="checkbox" class="${P}gentle"> Gentle Current: the beat window widens to ±200 ms</label>` : ""}`,
    });
    wrap.append(css, cv, pad);
    const legend = new Legend(P, wrap);
    const beats = new Beats(P, wrap, RM);
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");

    // ---- state ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    const resize = () => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    const folds = [22, 70, 128, 172, 196, 222, 240].map((x) => ({ x, hit: false, done: false }));
    const swells = [50, 104, 160, 208, 231].map((x) => ({ x, hit: false, done: false }));
    const tendrils = [40, 62, 92, 118, 150, 190, 214, 236].map((x) => ({ x, done: false }));
    const preds = [34, 80, 140, 166, 202, 228].map((x) => ({ x, d: 4 + rng() * 7, home: 4 + rng() * 7, hunt: false, gone: false, ph: rng() * 6 }));
    const eyes = [108, 136, 164].map((x) => ({ x, state: "wait", t: 0 }));
    const st = { started: false, over: false, x: 0, speed: CURRENT, trim: 0, pitch: 0, lift: false, hush: false,
      stun: 0, stop: 0, surge: 0, sync: 56, notice: 0, maxNotice: 0, rowBeats: 0, onBeats: 0, flash: 0, jolt: 0, eye: 0, msg: "", msgT: 0,
      hits: 0, stings: 0, bumps: 0, surges: 0, lastPhase: "" };
    const beatLog = new Map(); // beat index -> { player: "on"|"off"|null, comp: [bool x3], active }
    let beatTimes = [], nextBeat = 0, nextEval = 0, lastNow = 0, raf = 0, audio = null;
    const strokes = []; // recent stroke marks: { t, on }
    const fx = [];      // flourishes on the canvas: { kind, x, y, t }

    const bpm = () => (st.x < NARROWS ? 76 : 76 + 10 * Math.min(1, (st.x - NARROWS) / 44));
    const say = (m) => { st.msg = m; st.msgT = 2200; };
    const inPatrol = () => st.x >= PATROL[0] && st.x <= PATROL[1];
    const eyeOpen = () => eyes.some((e) => e.state === "open");
    const eyeTell = () => eyes.some((e) => e.state === "tell");
    const playerActive = () => st.stun <= 0 && !st.hush && !st.lift;
    const nearestBeat = (now) => { let k = Math.max(0, nextBeat - 2), best = Infinity, bi = k; for (let i = k; i < beatTimes.length; i++) { const d = Math.abs(now - beatTimes[i]); if (d < best) { best = d; bi = i; } } return [bi, now - beatTimes[bi]]; };

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
    function splash() {
      if (!audio) return;
      const t = audio.currentTime, n = audio.createBufferSource(), b = audio.createBuffer(1, audio.sampleRate * 0.2, audio.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const v = audio.createGain(); v.gain.value = 0.12; n.buffer = b; n.connect(v).connect(audio.destination); n.start(t);
    }
    function drone() {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain(), dur = 2 * 60 / bpm();
      o.type = "sawtooth"; o.frequency.value = 38;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.08, t + 0.3); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + dur + 0.1);
    }

    // ---- unlocking actions as the river brings them ---------------------------------------------
    function unlock(key) {
      if (key === "trim" && legend.add("trim", "Trim", "A/D · ←/→ · Bow/Stern", true)) {
        bBow.hidden = false; bStern.hidden = false;
        beats.show("A valve fold hangs low ahead. Trim to the bow to pass under it; trim to the stern to ride a swell.", 5200, "trim", "New stroke · Trim");
      }
      if (key === "lift" && legend.add("lift", "Lift", "hold W · ↑ · Lift", true)) {
        bLift.hidden = false;
        beats.show("“Down.” Something glows below the raft. Hold Lift until the tendril has risen and gone.", 5200, "lift", "The one who fears · New stroke · Lift");
      }
      if (key === "hush" && legend.add("hush", "Hush", "hold S · ↓ · Hush", true)) {
        bHush.hidden = false;
        beats.show("immune creatures watch from the shadows\n“Hush.” When the drone sounds, hold Hush and keep still until the eye closes.", 6400, "hush", "The patrol · New stroke · Hush");
      }
    }

    // ---- input ----------------------------------------------------------------------------------
    function row() {
      if (!st.started || st.over) return;
      if (st.stun > 0) { say("Stunned: you cannot row."); flourish(bRow, P + "shake", RM, 360); return; }
      if (st.hush || st.lift) return;
      const now = performance.now();
      const [k, off] = nearestBeat(now);
      const ok = Math.abs(off) <= GOOD;
      const b = beatLog.get(k) || { player: null, comp: null };
      if (b.player) return; // one stroke per beat
      b.player = ok ? "on" : "off"; beatLog.set(k, b);
      strokes.push({ t: now, on: ok });
      fx.push({ kind: ok ? "ring" : "splash", t: now });
      if (!ok) {
        splash();
        // splash: cell predators drift toward it
        preds.forEach((p) => { if (!p.gone && Math.abs(p.x - st.x) < 18) p.hunt = true; });
        if (inPatrol()) st.notice += 4;
        if (st.sync <= 30 && inPatrol()) st.notice += 2;
        say(off < 0 ? "Early: a splash." : "Late: a splash.");
      }
      if (eyeOpen()) { st.notice += 8; say("The eye is open. Hush."); }
    }
    const setTrim = (d) => { if (!st.over && st.started) { st.trim = Math.max(-1, Math.min(1, st.trim + d)); } };
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
      else if (k === "arrowup" || k === "w") { e.preventDefault(); st.lift = true; bLift.setAttribute("aria-pressed", "true"); }
      else if (k === "arrowdown" || k === "s") { e.preventDefault(); st.hush = true; bHush.setAttribute("aria-pressed", "true"); }
    });
    on(window, "keyup", (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") { st.lift = false; bLift.setAttribute("aria-pressed", "false"); }
      if (k === "arrowdown" || k === "s") { st.hush = false; bHush.setAttribute("aria-pressed", "false"); }
    });
    on(intro.querySelector("." + P + "start"), "click", () => start());

    function start() {
      if (st.started) return;
      const gc = intro.querySelector("." + P + "gentle");
      if (gc && gc.checked) GOOD = 200;
      intro.remove();
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      st.started = true;
      beatTimes = [performance.now() + 700]; nextBeat = 0; nextEval = 0; lastNow = performance.now();
      legend.add("row", "Row", "Space · tap · Row");
      beats.show("The raft answers when all four oars fall on the heartbeat. Row when the bead reaches the line.", 4600, "open", "Open water");
      bRow.focus();
    }

    // ---- the beat -------------------------------------------------------------------------------
    function onBeat(k) {
      thump(false);
      st.flash = 1;
      if (st.stun > 0) st.stun--;
      if (st.stop > 0) st.stop--;
      const b = beatLog.get(k) || { player: null };
      // companions: on the beat at about 90%; they lift for tendrils and hush on the eye's tell
      const hushing = eyeTell() || eyeOpen();
      b.comp = [0, 1, 2].map(() => (hushing ? null : rng() < 0.9));
      b.active = playerActive() && !hushing;
      beatLog.set(k, b);
      for (const e of eyes) {
        if (e.state === "tell" || e.state === "open") {
          e.t--;
          if (e.t <= 0) {
            if (e.state === "tell") { e.state = "open"; e.t = 4; say("The eye is open."); }
            else { e.state = "done"; say("The eye closes. Row on."); }
          }
        }
      }
    }
    function evalBeat(k) {
      const b = beatLog.get(k);
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
      let v = CURRENT + 0.15 * onCount + (st.x >= NARROWS ? 0.3 : 0);
      if (st.sync >= 70) v *= 1.25;
      if (onCount === 4) { st.surge = 1000; st.surges++; say("Together."); thump(true); fx.push({ kind: "surge", t: performance.now() }); }
      st.speed = v;
      beatLog.delete(k - 8);
    }

    // ---- simulation -----------------------------------------------------------------------------
    function step(dt, now) {
      while (beatTimes.length - nextBeat < 8) beatTimes.push(beatTimes[beatTimes.length - 1] + 60000 / bpm());
      while (now >= beatTimes[nextBeat]) { onBeat(nextBeat); nextBeat++; }
      while (nextEval < nextBeat && now >= beatTimes[nextEval] + GOOD + 10) { evalBeat(nextEval); nextEval++; }
      const s = dt / 1000;
      st.flash = Math.max(0, st.flash - s * 4);
      st.surge = Math.max(0, st.surge - dt);
      st.msgT = Math.max(0, st.msgT - dt);
      st.jolt = Math.max(0, st.jolt - s * 3);
      st.pitch += (st.trim * 0.6 - st.pitch) * Math.min(1, s * 5);
      const v = st.stop > 0 ? 0 : st.speed + (st.surge > 0 ? 0.4 : 0);
      st.x += v * s;
      // what the river brings next
      if (st.x >= 10) unlock("trim");
      if (st.x >= 30) unlock("lift");
      if (st.x >= PATROL[0] - 4) unlock("hush");
      if (st.x >= NARROWS - 2 && beats.show("The river grows narrower.\nThe current grows faster.\nThe heart draws near.", 6000, "narrows", "The narrows")) st.lastPhase = "narrows";
      if (st.x >= PATROL[1] + 1 && st.x < NARROWS - 2) beats.show("The beast sinks out of sight behind you. The water warms.", 3600, "pastpatrol");
      // folds and swells, met at the bow (raft spans x-3..x+3)
      for (const f of folds) if (!f.done && st.x + 2.5 >= f.x) {
        f.done = true;
        if (st.pitch > -0.3) { f.hit = true; st.hits++; st.stop = 2; st.jolt = 1; say("Struck a fold. Trim to the bow."); thump(true); flourish(wrap, P + "shake", RM, 360); }
        else { say("Under the fold."); fx.push({ kind: "pass", t: now }); }
      }
      for (const w of swells) if (!w.done && st.x + 2.5 >= w.x) {
        w.done = true;
        if (st.pitch < 0.3) { w.hit = true; st.hits++; st.stop = 2; st.jolt = 1; say("The swell stops you. Trim to the stern."); thump(true); flourish(wrap, P + "shake", RM, 360); }
        else { say("Over the swell."); fx.push({ kind: "pass", t: now }); }
      }
      for (const t of tendrils) if (!t.done && st.x >= t.x) {
        t.done = true;
        if (!st.lift && !st.hush) { st.stun = 2; st.stings++; say("Stung: two beats without your oar."); fx.push({ kind: "sting", t: now }); }
        else { say("It rises past your lifted oar."); fx.push({ kind: "pass", t: now }); }
      }
      for (const p of preds) {
        if (p.gone) continue;
        p.ph += s;
        if (p.hunt) {
          const dx = st.x - p.x;
          p.x += Math.sign(dx) * Math.min(Math.abs(dx), 3.2 * s) + st.speed * s * 0.9;
          p.d = Math.max(0.6, p.d - 2.2 * s);
          if (Math.abs(st.x - p.x) < 2.2 && p.d <= 0.8) {
            p.gone = true; st.stun = 2; st.jolt = 0.6; st.bumps++;
            if (inPatrol()) st.notice += 5;
            say("A cell bumped the hull. Off-beat strokes splash.");
            flourish(wrap, P + "shake", RM, 360);
          }
        } else p.d = p.home + Math.sin(p.ph) * 0.6;
        if (p.x < st.x - 25) p.gone = true;
      }
      for (const e of eyes) if (e.state === "wait" && st.x >= e.x) { e.state = "tell"; e.t = 2; drone(); say("A low drone: the eye is about to open. Hush."); }
      if (eyeOpen() && !st.hush) st.notice += 15 * s;
      if (st.hush && !eyeTell() && !eyeOpen() && !inPatrol()) st.notice -= 6 * s;
      else if (st.hush) st.notice -= (st.x > 150 ? 4 : 6) * s;
      st.notice = Math.max(0, st.notice);
      st.maxNotice = Math.max(st.maxNotice, st.notice);
      if (st.notice >= 60) beats.show("The eye turns toward the stern. Toward you.", 3200, "n60");
      st.eye += ((eyeOpen() ? 1 : eyeTell() ? 0.3 : 0) - st.eye) * Math.min(1, s * 4);
      if (st.notice >= 100) return finish(false);
      if (st.x >= LEN) return finish(true);
    }

    function finish(win) {
      st.over = true;
      streak.record(win ? "win" : "lose");
      const inTime = st.rowBeats ? Math.round((100 * st.onBeats) / st.rowBeats) : 0;
      let text;
      if (win) {
        const how = inTime >= 85 ? "You kept the heart's time on " + inTime + "% of your strokes, and the raft ran warm under all four of you."
          : inTime >= 60 ? "You kept time on " + inTime + "% of your strokes; the raft forgave the rest."
          : "Your oar found the beat on only " + inTime + "% of strokes; your brothers carried the time for you.";
        const scar = st.maxNotice >= 60 ? " The eye had turned your way once, and turned back." : st.hits ? ` The folds stopped you ${st.hits} time${st.hits > 1 ? "s" : ""}.` : " Not a fold touched the bow.";
        text = `Out of the narrows, still four. ${how}${scar}`;
      } else {
        text = "The eye found the stern. You are lifted into the beast in one movement, without a struggle, and your seat stays empty. Your brothers row on with three. Taken by the river.";
      }
      api.end({ outcome: win ? "win" : "lose", text: text + (!win && streak.losses >= 2 ? " (Gentle Current is offered on the next start.)" : "") });
    }

    // ---- drawing (woodblock) --------------------------------------------------------------------
    function crest(x, y, s, fill) {
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + 10 * s, y - 16 * s, x + 30 * s, y - 22 * s, x + 40 * s, y - 10 * s);
      g.bezierCurveTo(x + 34 * s, y - 14 * s, x + 26 * s, y - 10 * s, x + 30 * s, y - 4 * s);
      g.bezierCurveTo(x + 36 * s, y + 2 * s, x + 44 * s, y - 2 * s, x + 48 * s, y);
      g.closePath();
      g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = C.key; g.stroke();
    }
    function label(text, x, y, bg = C.key, fg = C.bone) {
      g.font = "700 14px sans-serif"; g.textAlign = "center";
      const w = g.measureText(text).width + 14;
      g.fillStyle = bg; g.fillRect(x - w / 2, y - 15, w, 21); g.strokeStyle = C.key; g.lineWidth = 2; g.strokeRect(x - w / 2, y - 15, w, 21);
      g.fillStyle = fg; g.fillText(text, x, y);
    }
    // the woodblock grain: fine horizontal gouges, drawn once into a pattern
    const grainTile = document.createElement("canvas"); grainTile.width = 240; grainTile.height = 120;
    { const t = grainTile.getContext("2d"); t.strokeStyle = "rgba(42,10,16,.16)"; t.lineWidth = 1;
      for (let i = 0; i < 26; i++) { const y = rng() * 120, x = rng() * 240, l = 30 + rng() * 90; t.beginPath(); t.moveTo(x, y); t.quadraticCurveTo(x + l / 2, y + (rng() - 0.5) * 3, x + l, y); t.stroke(); } }
    const grain = g.createPattern(grainTile, "repeat");

    function draw(now) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const SURF = Math.round(H * 0.35), PX = Math.max(26, W / 30), RX = Math.max(130, W * 0.3);
      const sx = (x) => RX + (x - st.x) * PX;
      const jy = st.jolt * Math.sin(now / 30) * 4;
      const narrows = Math.max(0, Math.min(1, (st.x - NARROWS + 10) / 30));
      // sky: the artery interior in flat bands; the walls close in at the narrows
      const bands = [[0, "#4a0812"], [0.3, C.deep], [0.62, C.river], [0.86, "#d4704f"]];
      bands.forEach(([f, c], i) => { g.fillStyle = c; const y0 = SURF * f, y1 = i < 3 ? SURF * bands[i + 1][0] : SURF; g.fillRect(0, y0, W, y1 - y0 + 1); });
      g.fillStyle = "#3d0610"; g.strokeStyle = C.key; g.lineWidth = 3;
      g.beginPath(); g.moveTo(0, 0);
      const wallDepth = SURF * (0.16 + 0.18 * narrows);
      for (let i = -1; i < W / 90 + 2; i++) {
        const x = i * 90 - ((st.x * PX * 0.35) % 90);
        g.quadraticCurveTo(x + 45, wallDepth + (i % 2) * 8, x + 90, 0);
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
        if (!f.done && x > RX && legend.has("trim")) label("◀ BOW DOWN", x, bottom + 22, st.pitch < -0.3 ? C.gold : C.bone, C.key);
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
      g.save(); g.translate(-((st.x * PX * 0.5) % 240), 0); g.fillStyle = grain; g.fillRect(0, 0, W + 240, H); g.restore();
      // swells: a raised hump in the surface
      for (const w of swells) {
        const x = sx(w.x); if (x < -140 || x > W + 140) continue;
        g.beginPath(); g.moveTo(x - 90, SURF); g.quadraticCurveTo(x, SURF - 44, x + 90, SURF); g.closePath();
        g.fillStyle = C.river; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
        for (let k = -2; k <= 1; k++) crest(x + k * 34, SURF - 30 + Math.abs(k + 0.5) * 9, 0.7, C.bone);
        if (!w.done && x > RX && legend.has("trim")) label("STERN DOWN ▶", x, SURF - 60, st.pitch > 0.3 ? C.gold : C.bone, C.key);
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
        if (eyeTell() && !RM) { g.strokeStyle = `rgba(242,181,68,${0.4 + 0.4 * Math.sin(now / 80)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(bx, ey, 60, 26, 0, 0, Math.PI * 2); g.stroke(); }
        g.beginPath(); g.ellipse(bx, ey, 46, 4 + 20 * open, 0, 0, Math.PI * 2);
        g.fillStyle = open > 0.6 ? C.gold : "#9a6a2a"; g.fill(); g.lineWidth = 3; g.strokeStyle = C.key; g.stroke();
        g.beginPath(); g.ellipse(bx, ey, 6, 3 + 16 * open, 0, 0, Math.PI * 2); g.fillStyle = C.key; g.fill();
        if (eyeOpen() || eyeTell()) label(eyeOpen() ? (st.hush ? "THE EYE IS OPEN · STILL" : "THE EYE IS OPEN · HUSH!") : "A DRONE · HUSH NOW", bx, ey - 40, eyeOpen() && !st.hush ? C.gold : C.bone, C.key);
      }
      // tendrils rising on their tell
      for (const t of tendrils) {
        if (t.done && st.x - t.x > 6) continue;
        const x = sx(t.x); if (x < -40 || x > W + 40) continue;
        const ahead = t.x - st.x, rise = Math.max(0, Math.min(1, 1 - ahead / 9));
        const tipY = H - (H - SURF) * (0.12 + 0.88 * rise);
        g.strokeStyle = C.bone; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + 20, H);
        g.bezierCurveTo(x - 20, H - (H - tipY) * 0.4, x + 22, tipY + (H - tipY) * 0.3, x, tipY); g.stroke();
        const glow = ahead < 6 ? 0.5 + 0.5 * Math.sin(now / 90) : 0.2;
        g.beginPath(); g.arc(x, tipY, 5 + 5 * glow, 0, Math.PI * 2); g.fillStyle = `rgba(255,236,200,${0.5 + glow * 0.5})`; g.fill();
        if (!t.done && ahead < 7 && ahead > 0 && legend.has("lift")) label(st.lift ? "OAR UP" : "LIFT ▲", x, tipY - 18, st.lift ? C.gold : C.bone, C.key);
      }
      // cell predators: glassy lanterns with chevrons
      for (const p of preds) {
        if (p.gone) continue;
        const x = sx(p.x), y = SURF + p.d * (H - SURF) / 13; if (x < -40 || x > W + 40) continue;
        g.beginPath(); g.ellipse(x, y, 20, 14, 0, 0, Math.PI * 2); g.fillStyle = p.hunt ? "rgba(255,190,170,.85)" : "rgba(255,210,200,.45)"; g.fill();
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
      const lastB = beatLog.get(nextBeat - 1);
      seats.forEach((bx, i) => {
        const me = i === 3;
        const crouch = me ? st.hush : eyeTell() || eyeOpen();
        const stunned = me && st.stun > 0;
        const hgt = crouch ? 26 : 46;
        g.fillStyle = me ? "#6a5a8a" : C.marrow2; g.strokeStyle = me ? C.gold : C.key; g.lineWidth = me ? 3 : 2;
        g.fillRect(bx - 7, -22 - hgt, 14, hgt); g.strokeRect(bx - 7, -22 - hgt, 14, hgt);
        g.beginPath(); g.arc(bx, -30 - hgt, 10, 0, Math.PI * 2); g.fill(); g.stroke();
        g.strokeStyle = me && stunned ? "#999" : C.bone; g.lineWidth = 4; g.beginPath();
        const lifted = me ? st.lift : false;
        const stroke = lastB && (me ? lastB.player === "on" : lastB.comp && lastB.comp[i]) ? st.flash * 14 : 0;
        if (crouch) { g.moveTo(bx - 30, -26); g.lineTo(bx + 30, -30); }
        else if (lifted) { g.moveTo(bx, -40); g.lineTo(bx + 40, -110); }
        else { g.moveTo(bx + 4, -40); g.lineTo(bx - 34 - stroke, 46); }
        g.stroke();
        if (me) { g.fillStyle = stunned ? C.bone : C.gold; g.font = "700 13px sans-serif"; g.textAlign = "center"; g.fillText(stunned ? "STUNG" : "YOU", bx, -52 - hgt); }
      });
      // flourishes at your oar: a gold ring on the beat, a splash off it
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], a = (now - f.t) / 600; if (a > 1) { fx.splice(i, 1); continue; }
        const r = RM ? 18 : 10 + a * 34;
        if (f.kind === "ring") { g.strokeStyle = `rgba(242,181,68,${1 - a})`; g.lineWidth = 4; g.beginPath(); g.ellipse(-104, 46, r * 1.4, r * 0.5, 0, 0, 7); g.stroke(); }
        else if (f.kind === "splash") { g.fillStyle = `rgba(232,220,196,${1 - a})`; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(-104 + (k - 2.5) * 9, 40 - (RM ? 12 : Math.sin(a * Math.PI) * 30) * (1 - Math.abs(k - 2.5) / 4), 3.5, 0, 7); g.fill(); } }
        else if (f.kind === "surge") { g.strokeStyle = `rgba(255,241,200,${1 - a})`; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -6, 130 + a * 40, 26 + a * 10, 0, 0, 7); g.stroke(); }
        else if (f.kind === "sting") { g.strokeStyle = `rgba(255,236,200,${1 - a})`; g.lineWidth = 3; for (let k = 0; k < 5; k++) { const an = k * 1.25; g.beginPath(); g.moveTo(-70, -60); g.lineTo(-70 + Math.cos(an) * r, -60 + Math.sin(an) * r); g.stroke(); } }
      }
      // trim gauge under the raft
      g.restore();
      if (legend.has("trim")) {
        const gx = rx, gy = ry + 34;
        g.fillStyle = "rgba(42,10,16,.75)"; g.fillRect(gx - 70, gy - 2, 140, 22);
        g.font = "700 12px sans-serif"; g.textAlign = "center"; g.fillStyle = C.bone;
        g.fillText("BOW", gx - 48, gy + 14); g.fillText("STERN", gx + 44, gy + 14);
        g.fillStyle = C.gold; g.beginPath(); g.arc(gx + st.trim * 12, gy + 9, 6, 0, 7); g.fill();
      }
      // HUD: the vessel line along the top edge, the raft's glyph moving toward a small heart
      const vx0 = 20, vx1 = W - 50, vy = 16;
      g.fillStyle = "rgba(42,10,16,.6)"; g.fillRect(0, 0, W, 30);
      g.strokeStyle = C.bone; g.lineWidth = 2; g.beginPath(); g.moveTo(vx0, vy); g.lineTo(vx1, vy); g.stroke();
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(vx0 + (vx1 - vx0) * PATROL[0] / LEN, vy - 3, (vx1 - vx0) * (PATROL[1] - PATROL[0]) / LEN, 6);
      g.fillStyle = C.hi; g.fillRect(vx0 + (vx1 - vx0) * NARROWS / LEN, vy - 1, (vx1 - vx0) * (LEN - NARROWS) / LEN, 3);
      const gx = vx0 + (vx1 - vx0) * Math.min(1, st.x / LEN);
      g.fillStyle = C.bone; g.beginPath(); g.moveTo(gx - 9, vy - 5); g.lineTo(gx + 9, vy - 5); g.lineTo(gx + 6, vy + 5); g.lineTo(gx - 6, vy + 5); g.fill();
      const hs = 1 + st.flash * 0.25; g.save(); g.translate(vx1 + 18, vy + 1); g.scale(hs, hs);
      g.fillStyle = C.gold; g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-14, -2, -8, -12, 0, -5); g.bezierCurveTo(8, -12, 14, -2, 0, 8); g.fill(); g.restore();
      // the eye's notice: shown from the patrol on, a carved bar that reddens and shakes as it rises
      if (st.x >= PATROL[0] - 6 || st.notice > 0) {
        const nw = Math.min(200, W * 0.4), nx = W - nw - 14, ny = 40, f = Math.min(1, st.notice / 100);
        const sh = !RM && f > 0.6 ? Math.sin(now / 40) * 2 * f : 0;
        g.fillStyle = "rgba(42,10,16,.85)"; g.fillRect(nx - 8 + sh, ny - 4, nw + 16, 40);
        g.fillStyle = C.bone; g.font = "700 13px sans-serif"; g.textAlign = "left"; g.fillText("THE EYE'S NOTICE", nx + sh, ny + 11);
        g.strokeStyle = C.bone; g.lineWidth = 2; g.strokeRect(nx + sh, ny + 17, nw, 12);
        g.fillStyle = f > 0.6 ? C.gold : C.hi; g.fillRect(nx + sh, ny + 17, nw * f, 12);
        for (let k = 1; k < 4; k++) { g.fillStyle = C.key; g.fillRect(nx + sh + nw * k / 4 - 1, ny + 17, 2, 12); }
      }
      // the beat lane: beads slide left into the line; your strokes show above it
      const lw = Math.min(400, W - 32), lx = (W - lw) / 2, ly = H - 96, hitX = lx + 54, pxPerMs = (lw - 64) / 3200;
      g.fillStyle = "rgba(42,10,16,.75)"; g.fillRect(lx, ly - 17, lw, 34); g.strokeStyle = C.key; g.lineWidth = 2; g.strokeRect(lx, ly - 17, lw, 34);
      const goodPx = GOOD * pxPerMs;
      g.fillStyle = "rgba(242,181,68,.22)"; g.fillRect(hitX - goodPx, ly - 15, goodPx * 2, 30);
      g.strokeStyle = C.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(hitX, ly - 17); g.lineTo(hitX, ly + 17); g.stroke();
      if (st.started) {
        for (let k = Math.max(0, nextBeat - 1); k < beatTimes.length; k++) {
          const x = hitX + (beatTimes[k] - now) * pxPerMs; if (x < lx + 4 || x > lx + lw - 4) continue;
          g.fillStyle = C.bone; g.beginPath(); g.arc(x, ly, 7, 0, Math.PI * 2); g.fill();
        }
        for (const s of strokes) {
          const x = hitX + (s.t - now) * pxPerMs; if (x < lx) continue;
          g.fillStyle = s.on ? C.gold : "#9a8a86"; g.fillRect(x - 3, ly - 15, 6, 12);
        }
        while (strokes.length && strokes[0].t < now - 2400) strokes.shift();
        const last = strokes[strokes.length - 1];
        if (last && now - last.t < 500) { g.font = "700 13px sans-serif"; g.textAlign = "left"; g.fillStyle = last.on ? C.gold : C.bone; g.textAlign = "center"; g.fillText(last.on ? "ON THE BEAT" : "SPLASH", hitX, ly - 24); }
      }
      if (st.msgT > 0) {
        g.globalAlpha = Math.min(1, st.msgT / 400); g.font = `700 ${W < 500 ? 15 : 17}px sans-serif`; g.textAlign = "center";
        const tw = g.measureText(st.msg).width + 22;
        g.fillStyle = "rgba(42,10,16,.8)"; g.fillRect(W / 2 - tw / 2, SURF + 22, tw, 28);
        g.fillStyle = C.bone; g.fillText(st.msg, W / 2, SURF + 42); g.globalAlpha = 1;
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
    // read-only view of the state for the scripted play-tests (nothing in the page reads it)

    return {
      unmount() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

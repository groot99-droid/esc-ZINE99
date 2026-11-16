// Behind the Peephole / Lockwork (1D, lock picking). Style: patent exploded view: numbered parts
// pulled apart along dotted axes, fine line shading, on cream paper. One lock: the stair door
// (`n3_stair_lock`, DESIGN.md section 11): pin tumbler, 5 pins, 2 spool pins, tension band 35-55,
// three spare picks, each overset after the second breaks a pick. The world clock runs at 10x and
// is only shown (the night-three lock has no visitor); the 20-second binding-pin hint is kept.
// Actions: TENSION (the wrench), LIFT (the hook), FEEL (read the pin under the hook: binding, set,
// loose, or a spool) and the RAKE from the tool roll (DESIGN.md section 11 names it): fast and
// risky, two strokes. Phases: plain pins, then the spools' false set, then the last pin.
// Art (games/behind-the-peephole/art): the patent plates. Lock plate FIG. 2 (the stair door) heads
// the opening card, hangs in the margin of a wide sheet as the reference figure, and comes up behind
// the result; the other four plates are the tool roll on the opening card. The live lock is still
// drawn by this code, because every part of it moves; sheet and figure numbers follow the plates.

// Phase 2 (2026-11-16): the ladder. TEACH is the drawer (FIG. 1: three plain pins, a wide band, and no
// way to lose: an overset only costs the reset). TEST is the stair door as before, now with the clock
// running to Lew's tea at 01:00 and the bell board upstairs: while a bell rings, three seconds, the
// click and the feel are masked. TWIST is lost property (FIG. 3, DESIGN.md section 11, `n4_lost_property`):
// a wafer lock, not picked but matched. Lifting is no use; the lock only says how many wafers a key
// fits, never which. Its set-piece is Dora's round: when her lamp is on the keyhole, do nothing.
// (DEEP_DIVE's own twist, the lever lock on your door, is phase 3 and waits for docs/COLLECTION.md.)
// Opening lost property is written to api.shared ("lostProperty"): the Mosaic gains the green rhyme
// spool and Dora stops at the cabinet in the corridor race.
import { staged } from "./_stages.js";

const LOCKS = [
  { n: 3, order: [1, 0, 2], spool: [], shear: [0.5, 0.36, 0.62], band: [25, 70], jam: 80, fig: "FIG. 1  ·  the desk drawer", sheet: "Sheet 1 of 5", plate: "lock-drawer", clock: 23 * 60 + 5,
    goal: "Set all three pins on the shear line S. Nothing breaks tonight.",
    open: "Night one, 23:05. The desk drawer in the office holds your log and a worn deck of cards. Nobody gave you its key. Three pins, and all the time you want." },
  { n: 5, order: [2, 4, 0, 3, 1], spool: [4, 1], shear: [0.46, 0.62, 0.38, 0.7, 0.54], band: [35, 55], jam: 70, fig: "FIG. 2  ·  the stair door", sheet: "Sheet 2 of 5", plate: "lock-stair", clock: 35, limit: 150,
    goal: "Set all five pins before Lew's tea at 01:00, and before your picks run out.",
    open: "Night three, 00:35. The stair door at the far end of the passage, locked from your side. Lew said only: \"Stair door's locked from your side. Someone's idea.\" He brings the tea at one. The bell board rings through the wall." },
];
let N = 5, ORDER = [], SPOOL = new Set(), SHEAR = [], BAND = [35, 55], JAM = 70;
const DROP = 20, SPOOL_EASE = [30, 35];
const LIFT_SPEED = 0.26;
const NOTES = {
  open: "Night three, 00:50. The stair door at the far end of the passage, locked from your side. Lew said only: \"Stair door's locked from your side. Someone's idea.\"",
  first: "Click. One of five. The brass is colder than the passage.",
  spool: "A false set. The plug gives, and lies to you. Ease off and lift again.",
  rakeUnlock: "The rake is in the roll: a stroke across every pin at once. Fast, and it does not care which pin it oversets.",
  chute: "Somewhere below the door, a steel box takes a page with a soft knock. Something has gone down the chute tonight already.",
  last: "One pin left. Your hand is steadier than it was on night one.",
};

const P = "behind-the-peephole-lockwork-";
export default staged(P, ["the drawer", "the stair door, bells", "lost property"], function play(root, api, stage) {
    if (stage.stage === 2) return wafer(root, api, stage);
    const LK = LOCKS[stage.stage], teach = stage.stage === 0;
    N = LK.n; ORDER = LK.order; SPOOL = new Set(LK.spool); SHEAR = LK.shear; BAND = LK.band; JAM = LK.jam;
    const C = { paper: "#efe6cf", ink: "#1c1a17", faint: "#6f6650", brass: "#b8913f", brassL: "#e3c47a", steel: "#6f7c80", ev: "#a3302a", amber: "#e0a24a", blue: "#2a3a8c" };
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const rnd = api.rng();
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;font-family:Georgia,'Cormorant Garamond',serif;color:${C.ink};touch-action:none;user-select:none}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}pad{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:0 10px}
    .${P}b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.05em;background:#fbf6e8;color:${C.ink};border:1.5px solid ${C.ink};min-width:48px;min-height:44px;padding:6px 10px;cursor:pointer;touch-action:none;transition:background .12s}
    .${P}b:hover,.${P}b:focus-visible{background:#f3e3b8;outline:none}
    .${P}b:active,.${P}b.on{background:${C.brassL}}
    .${P}b[hidden]{display:none}
    .${P}b[disabled]{opacity:.4}
    .${P}b.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px ${C.ev}}}
    .${P}cap{position:absolute;left:50%;transform:translateX(-50%);width:min(640px,calc(100% - 28px));text-align:center;font-size:16px;line-height:1.35;pointer-events:none}
    .${P}cap i{display:block}
    .${P}cap .story{color:${C.blue};font-size:15px;margin-top:4px}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,230,207,.94);padding:12px;z-index:3;overflow:auto}
    .${P}patent{max-width:540px;width:100%;border:1.5px solid ${C.ink};padding:18px 20px 16px;background:#fbf6e8;font-size:15px;line-height:1.45;position:relative;box-shadow:inset 0 0 0 5px #fbf6e8,inset 0 0 0 6px ${C.ink}}
    .${P}patent .no{font:12px 'IBM Plex Mono',monospace;letter-spacing:.14em;display:flex;justify-content:space-between}
    .${P}patent h2{margin:8px 0 2px;font-style:italic;font-weight:400;font-size:28px;text-align:center}
    .${P}patent .goal{text-align:center;margin:0 0 8px}
    .${P}patent .open{font-size:14px;color:${C.blue};margin:0 0 10px}
    .${P}patent ol{margin:0 0 10px;padding-left:0;list-style:none;display:grid;gap:4px}
    .${P}patent li{display:grid;grid-template-columns:2.2em 6.2em 1fr;gap:6px;align-items:baseline}
    .${P}patent li span:first-child{font-style:italic}
    .${P}patent li b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.06em}
    .${P}patent kbd{font:12px 'IBM Plex Mono',monospace;border:1px solid ${C.faint};padding:0 4px;background:#fff}
    .${P}patent .fig{display:block;width:100%;height:auto;max-height:230px;object-fit:contain;border:1px solid ${C.ink};margin:6px 0 8px;background:#e4dccb}
    .${P}roll{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:0 0 10px}
    .${P}roll figure{margin:0;font:11px 'IBM Plex Mono',monospace;text-align:center;letter-spacing:.04em;line-height:1.25}
    .${P}roll img{display:block;width:100%;height:auto;border:1px solid ${C.faint};margin-bottom:2px}
    .${P}roll .now img{border:2px solid ${C.ev}}
    .${P}roll .later{opacity:.55}
    .${P}plate{position:absolute;inset:0;z-index:2;display:grid;place-items:center;background:rgba(239,230,207,.82);padding:14px 14px 150px;pointer-events:none;opacity:0;transition:opacity .7s}
    .${P}plate.in{opacity:1}
    .${P}plate img{max-width:min(760px,100%);max-height:100%;border:1.5px solid ${C.ink};box-shadow:6px 6px 0 rgba(28,26,23,.14)}
    @media (max-height:700px),(max-width:560px){.${P}patent .fig{max-height:120px}}
    .${P}patent .ft{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;border-top:1px solid ${C.ink};padding-top:10px}
    `;
    root.appendChild(st);
    const art = api.art || { has: () => false, url: () => "", img: () => Promise.resolve(null) };
    let plateCv = null, disposed = false;
    art.img(LK.plate).then((im) => { if (!im || disposed) return; const c = document.createElement("canvas"); c.width = 480; c.height = 320; try { c.getContext("2d").drawImage(im, 0, 0, 480, 320); plateCv = c; } catch { /* keep the list */ } });
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.appendChild(wrap);
    const cv = document.createElement("canvas");
    wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const cap = document.createElement("div");
    cap.className = P + "cap";
    cap.setAttribute("aria-live", "polite");
    cap.innerHTML = `<i></i><div class="story"></div>`;
    wrap.appendChild(cap);
    const capMsg = cap.querySelector("i"), capStory = cap.querySelector(".story");
    const pad = document.createElement("div");
    pad.className = P + "pad";
    pad.innerHTML = ["◀:left", "▶:right", "LIFT ↑:lift", "TENSION −:tdown", "TENSION +:tup", "FEEL · F:feel:1", "RAKE · R:rake:1"].map((s) => { const [l, a, h] = s.split(":"); return `<button type="button" class="${P}b" data-a="${a}"${h ? " hidden" : ""}>${l}</button>`; }).join("");
    wrap.appendChild(pad);
    const btn = (a) => pad.querySelector(`[data-a="${a}"]`);

    // ---- state
    const WINW = () => (gentle ? 0.12 : 0.09);
    let tension = 0, cur = 0, picks = teach ? 9 : gentle ? 4 : 3, oversets = 0, over = false, started = false, rakes = 2;
    const pins = Array.from({ length: N }, () => ({ h: 0, set: false, over: false, spool: false, fx: 0, bad: 0 }));
    let plugTurn = 0, lifting = false, tUp = false, tDown = false, lastProgress = performance.now(), msgT = 0, turning = 0, feltAny = false;
    const t0 = performance.now();
    let tStart = t0, bell = 0, bellNo = 0, nextBell = 7;
    const listeners = [], timers = [], told = new Set();
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const say = (m) => { capMsg.textContent = m; msgT = performance.now(); };
    const tell = (m) => { capStory.textContent = m; };
    const unlocked = new Set();
    function unlock(a, text) { if (unlocked.has(a)) return; unlocked.add(a); const b = btn(a); b.hidden = false; b.classList.add("new"); timers.push(setTimeout(() => b.classList.remove("new"), 3200)); if (text) tell(text); layoutCap(); }

    const binding = () => ORDER.find((i) => !pins[i].set);
    const setCount = () => pins.filter((p) => p.set).length;
    function progressBeats() {
      const n = setCount();
      if (n >= 1 && !told.has("first")) { told.add("first"); tell(NOTES.first); }
      if (teach) { if (n === 2 && !told.has("last")) { told.add("last"); tell("One pin left. Lew is still on the stair, going down."); } return; }
      if (n >= 2) unlock("rake", NOTES.rakeUnlock);
      if (n >= 3 && !told.has("chute")) { told.add("chute"); tell(NOTES.chute); }
      if (n === 4 && !told.has("last")) { told.add("last"); tell(NOTES.last); }
    }

    function dropAll() {
      let any = false;
      pins.forEach((p) => { if (p.set || p.over || p.spool) any = true; p.set = false; p.over = false; p.spool = false; });
      plugTurn = 0;
      if (any) say("Tension let go: every pin drops back. The plug is home.");
    }
    function setPin(i, how) {
      const p = pins[i];
      p.set = true; p.spool = false; p.fx = performance.now(); plugTurn = setCount(); lastProgress = performance.now();
      say(how || `Click. Pin ${i + 1} sets; the plug turns 1°.`);
      progressBeats();
    }
    function release() {
      const p = pins[cur], b = binding();
      lifting = false;
      if (over || p.set || p.over || cur !== b) return;
      const s = SHEAR[cur];
      const inWin = p.h >= s && p.h <= s + WINW();
      if (!inWin) return;
      if (p.spool) {
        if (tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1]) setPin(cur, `Pin ${cur + 1} slips past its spool and sets. Bring the tension back into the band.`);
        else say("The spool pushes back. Ease the tension to 30–35 first.");
        return;
      }
      if (tension >= BAND[0] && tension <= BAND[1]) {
        if (SPOOL.has(cur)) {
          p.spool = true; plugTurn = setCount() + 5; lastProgress = performance.now(); p.fx = performance.now();
          say(`A false set: the plug gives 5° and pin ${cur + 1} pushes back. Ease the tension to 30–35 and lift it again.`);
          if (!told.has("spool")) { told.add("spool"); tell(NOTES.spool); }
        } else setPin(cur);
      } else say(tension < BAND[0] ? "It reached the line, but the plug had no tension to catch it." : "Too much tension: it would not catch.");
    }
    function overset(i) {
      const p = pins[i];
      p.over = true; p.bad = performance.now(); oversets++;
      if (teach) { say(`Pin ${i + 1} pushed past the shear line: overset. Let the tension go (under 20) to reset. Nothing breaks on this one.`); return; }
      if (oversets > 2) {
        picks--;
        say(picks > 0 ? `Overset, and the hook snaps. ${picks} spare pick${picks === 1 ? "" : "s"} left. Let the tension go to reset.` : "Overset. The last pick snaps in the keyway.");
        if (picks <= 0) lose();
      } else say(`Pin ${i + 1} pushed past the shear line: overset. Let the tension go (under 20) to reset. ${2 - oversets === 0 ? "The next overset breaks a pick." : ""}`);
    }
    function feel() {
      if (!started || over) return;
      feltAny = true;
      const p = pins[cur], b = binding();
      if (bell) { say("The bell is ringing. Under it, every pin feels the same."); return; }
      if (tension < DROP) { say("No tension on the plug: every pin feels the same."); return; }
      if (p.set) say(`Pin ${cur + 1}: set. It sits on the shear line.`);
      else if (p.over) say(`Pin ${cur + 1}: dead. Overset; let the tension go.`);
      else if (cur === b && (SPOOL.has(cur))) say(`Pin ${cur + 1}: stiff, with a give in it. It binds, and it is a spool.`);
      else if (cur === b) say(`Pin ${cur + 1}: stiff. This one binds.`);
      else say(`Pin ${cur + 1}: springy. Not this one yet.`);
    }
    function rake() {
      if (!started || over || !unlocked.has("rake") || rakes <= 0) return;
      rakes--; btn("rake").textContent = `RAKE · R (${rakes})`; btn("rake").disabled = rakes <= 0;
      if (tension < BAND[0] || tension > BAND[1]) { say("The rake skates across the pins. Nothing catches outside the band."); return; }
      let n = 0;
      for (let k = 0; k < N; k++) {
        const i = binding();
        if (i == null) break;
        const p = pins[i];
        if (p.over) break;
        if (SPOOL.has(i) && !p.spool) { p.spool = true; p.h = SHEAR[i] - 0.18; plugTurn = setCount() + 5; say(`${n ? n + " set under the rake, then " : ""}a false set at pin ${i + 1}: a spool.`); if (!told.has("spool")) { told.add("spool"); tell(NOTES.spool); } return; }
        if (p.spool) break;
        if (rnd() < 0.55) { p.set = true; p.fx = performance.now(); n++; plugTurn = setCount(); lastProgress = performance.now(); continue; }
        if (rnd() < 0.5) { p.h = SHEAR[i] + WINW() + 0.08; overset(i); return; }
        break;
      }
      say(n ? `The rake sets ${n} pin${n === 1 ? "" : "s"} in one stroke.` : "The rake rattles across. Nothing sets.");
      progressBeats();
      if (setCount() === N) win();
    }
    function lose() {
      over = true;
      api.store.set("lossStreak", streak + 1);
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: "The last pick snaps in the keyway. The stair door stays locked tonight; it will be there again on night six, with one pick restored, and whatever goes down the chute goes down without you seeing where." }), 1100));
    }
    function win() {
      if (over) return;
      over = true; turning = performance.now();
      api.store.set("opened", true); api.store.set("lossStreak", 0);
      say(teach ? "All three set. The plug turns." : "All five set. The plug turns.");
      if (art.has(LK.plate)) { // the plate, as filed: behind the result
        const pl = document.createElement("div"); pl.className = P + "plate";
        pl.innerHTML = `<img alt="Lock plate, ${LK.fig}" src="${art.url(LK.plate)}">`;
        wrap.appendChild(pl); timers.push(setTimeout(() => pl.classList.add("in"), RM ? 0 : 500));
      }
      const neat = oversets === 0 ? "Not one overset: a locksmith's opening." : `${oversets} overset${oversets === 1 ? "" : "s"} on the way.`;
      timers.push(setTimeout(() => api.end({ outcome: "win", text: teach ? `The drawer slides open on the logbook and a worn deck of cards, the hotel's rose on their backs. ${neat} The next lock has spools in it, a clock on it, and a bell board ringing through the wall.` : `The plug turns and the stair door opens on the back stair, and the chute's steel box below it. Whoever empties it comes up this way. ${picks} spare pick${picks === 1 ? "" : "s"} left. ${neat}` }), 1600));
    }

    function step(dt) {
      if (!started || over) return;
      if (LK.limit) {
        const el = (performance.now() - tStart) / 1000;
        if (el >= (gentle ? LK.limit + 50 : LK.limit)) { over = true; api.store.set("lossStreak", streak + 1); say("One o'clock. Lew's tray is on the stair."); timers.push(setTimeout(() => api.end({ outcome: "lose", text: `One o'clock, and Lew is on the stair with the tea. You are back at the desk before he knocks, with ${setCount()} of 5 pins set and the stair door still locked. Feel for the binding pin, and work between the bells.` }), 900)); return; }
        if (!bell && el >= nextBell) { bell = performance.now(); bellNo = 1 + Math.floor(rnd() * 6); nextBell = el + 11 + rnd() * 4; if (!told.has("bell")) { told.add("bell"); tell("A bell on the board upstairs, through the wall. While it rings you cannot hear the pin click or feel it bind."); } }
        if (bell && performance.now() - bell > 3000) bell = 0;
      }
      if (tUp) tension = Math.min(100, tension + 30 * dt);
      if (tDown) tension = Math.max(0, tension - 30 * dt);
      if (tension < DROP) { if (pins.some((p) => p.set || p.over || p.spool)) dropAll(); }
      const b = binding();
      pins.forEach((p, i) => {
        if (p.set) { p.h = Math.max(0, p.h - 2 * dt); return; }
        if (p.over) { p.h = SHEAR[i] + WINW() + 0.08; return; }
        if (i === cur && lifting) {
          let max = 1;
          if (i === b && tension > JAM) { max = 0.12; if (p.h >= max - 0.01 && performance.now() - msgT > 1500) say("Too much tension: the pins are jammed."); }
          if (p.spool && tension > SPOOL_EASE[1]) max = SHEAR[i] - 0.06;
          p.h = Math.min(max, p.h + LIFT_SPEED * dt);
          if (i === b && !p.spool && tension >= BAND[0] && tension <= JAM && p.h > SHEAR[i] + WINW()) overset(i);
          if (i === b && p.spool && tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1] && p.h > SHEAR[i] + WINW()) overset(i);
        } else {
          const rest = p.spool ? SHEAR[i] - 0.18 : 0;
          p.h = Math.max(rest, p.h - 1.3 * dt);
        }
      });
      if (!unlocked.has("feel") && performance.now() - t0 > 0 && (performance.now() - lastProgress > 9000 || setCount() >= 1)) unlock("feel", "Feel (F): touch the pin under the hook. Under tension, the binding pin is the stiff one.");
      if (setCount() === N && tension >= BAND[0] - 5) win();
    }

    // ---- drawing
    let W = 0, H = 0, G = {};
    const grain = document.createElement("canvas");
    function layoutCap() {
      const padH = pad.getBoundingClientRect().height || 50;
      cap.style.bottom = padH + 18 + "px";
    }
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutCap();
      const narrow = W < 560;
      const padH = pad.getBoundingClientRect().height || 50;
      const bottom = H - padH - (narrow ? 110 : 90);
      const gx = narrow ? 40 : Math.max(48, W * 0.06);
      const L = gx + (narrow ? 50 : 96), R = W - (narrow ? 34 : Math.max(W * 0.16, 200));
      const top = narrow ? 122 : 120;
      const rp = Math.min((bottom - top) * 0.13, (R - L) * 0.11, 60);
      const T = rp * 1.25;
      // vertical stack: cap strip, shell, plug: centre it in the space between the title and the caption
      const stackTop = top + 40, stackH = T * 3.05 + rp * 2.4;
      const cy = stackTop + Math.max(0, (bottom - stackTop - stackH) / 2) + T * 3.05 + rp;
      G = { gx, L, R, cy, rp, shear: cy - rp, T, gTop: top + 10, gBot: bottom, narrow };
      G.xs = Array.from({ length: N }, (_, i) => L + (R - L) * (0.5 + (i - (N - 1) / 2) * 0.16));
      G.pw = Math.min(26, (R - L) * 0.07);
      wrap.dataset.gauge = `${gx},${G.gTop},${G.gBot}`;
      // paper grain, drawn once
      grain.width = cv.width; grain.height = cv.height;
      const g = grain.getContext("2d"), rr = api.rng(3);
      g.fillStyle = C.paper; g.fillRect(0, 0, grain.width, grain.height);
      for (let i = 0; i < (W * H) / 260; i++) { g.fillStyle = rr() < 0.5 ? "rgba(120,100,60,.08)" : "rgba(255,255,255,.25)"; g.fillRect(rr() * grain.width, rr() * grain.height, 1 + rr() * 2 * dpr, 1 + rr() * 2 * dpr); }
      const v = g.createRadialGradient(grain.width / 2, grain.height / 2, grain.height * 0.3, grain.width / 2, grain.height / 2, grain.width * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(120,90,40,.16)");
      g.fillStyle = v; g.fillRect(0, 0, grain.width, grain.height);
    }
    const line = (x1, y1, x2, y2, w = 1, c = C.ink, dash) => { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
    function hatch(x, y, w, h, gap = 6, c = C.faint) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      for (let k = -h; k < w; k += gap) line(x + k, y + h, x + k + h, y, 0.6, c);
      ctx.restore();
    }
    function label(n, x, y, tx, ty) {
      ctx.beginPath(); ctx.lineWidth = 0.7; ctx.strokeStyle = C.ink;
      ctx.moveTo(x, y); ctx.quadraticCurveTo((x + tx) / 2, y, tx, ty); ctx.stroke();
      ctx.font = `italic ${G.narrow ? 13 : 14}px Georgia,serif`; ctx.fillStyle = C.ink;
      ctx.fillText(String(n), tx + (tx > x ? 3 : -18), ty + 4);
    }
    function drawPin(x, top, len, w, kind, spool, tint) {
      ctx.fillStyle = tint || "#fbf6e8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1;
      ctx.beginPath();
      if (kind === "key") { ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, top + len - w * 0.5); ctx.lineTo(x, top + len); ctx.lineTo(x - w / 2, top + len - w * 0.5); ctx.closePath(); }
      else if (spool) { const n = w * 0.28; ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, top + len * 0.25); ctx.lineTo(x + w / 2 - n, top + len * 0.35); ctx.lineTo(x + w / 2 - n, top + len * 0.65); ctx.lineTo(x + w / 2, top + len * 0.75); ctx.lineTo(x + w / 2, top + len); ctx.lineTo(x - w / 2, top + len); ctx.lineTo(x - w / 2, top + len * 0.75); ctx.lineTo(x - w / 2 + n, top + len * 0.65); ctx.lineTo(x - w / 2 + n, top + len * 0.35); ctx.lineTo(x - w / 2, top + len * 0.25); ctx.closePath(); }
      else ctx.rect(x - w / 2, top, w, len);
      ctx.fill(); ctx.stroke();
      for (let k = 1; k <= 3; k++) line(x + w / 2 - k * w * 0.11, top + 3, x + w / 2 - k * w * 0.11, top + len - (kind === "key" ? w * 0.5 : 3), 0.5, C.faint);
    }
    function spring(x, y1, y2, w) {
      ctx.beginPath(); ctx.lineWidth = 0.9; ctx.strokeStyle = C.ink;
      const n = 9; ctx.moveTo(x, y1);
      for (let k = 1; k <= n; k++) ctx.lineTo(x + (k % 2 ? w / 2 : -w / 2), y1 + (y2 - y1) * k / n);
      ctx.lineTo(x, y2); ctx.stroke();
    }

    let hoverPin = -1;
    function render(now) {
      const { gx, L, R, cy, rp, shear, T, gTop, gBot, xs, pw } = G;
      ctx.drawImage(grain, 0, 0, W, H);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.lineWidth = 0.6; ctx.strokeRect(12, 12, W - 24, H - 24);
      ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.font = `13px Georgia,serif`; ctx.fillText(LK.sheet, W / 2, 30);
      ctx.font = `italic ${G.narrow ? 20 : 26}px Georgia,serif`; ctx.fillText(LK.fig, W / 2, G.narrow ? 76 : 70);
      if (bell) { ctx.font = "600 15px 'IBM Plex Mono',monospace"; ctx.fillStyle = C.ev; const sw = RM ? 0 : Math.sin(now / 70) * 4; ctx.fillText(`BELL · 40${bellNo} · ${"●".repeat(bellNo)}`, W / 2 + sw, G.narrow ? 116 : 112); ctx.fillStyle = C.ink; }
      ctx.font = "italic 13px Georgia,serif"; ctx.fillText("Inventor: the night clerk", W / 2, G.narrow ? 96 : 92);
      ctx.textAlign = "left";
      const gm = Math.floor(((now - t0) / 1000) * 10 / 60);
      const gm0 = LK.clock + (started ? Math.floor(((now - tStart) / 1000) * 10 / 60) : 0);
      const hh = Math.floor(gm0 / 60) % 24, mm = gm0 % 60;
      ctx.font = "13px 'IBM Plex Mono',monospace";
      ctx.fillText(`◷ ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, 22, 32);
      ctx.textAlign = "right";
      ctx.fillText(teach ? "PICKS · no limit" : `PICKS ${picks}`, W - 22, 32);
      for (let k = 0; k < (teach ? 0 : Math.max(3, picks)); k++) {
        const x = W - 30 - k * 16;
        ctx.globalAlpha = k < picks ? 1 : 0.18;
        line(x, 42, x, 66, 1.3); ctx.beginPath(); ctx.arc(x - 4, 42, 4, 0, Math.PI, true); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = G.narrow ? "left" : "right";
      ctx.fillText(teach ? `OVERSETS ${oversets}` : `OVERSETS ${oversets} (2 free)`, G.narrow ? 22 : W - 22, G.narrow ? 52 : 84);
      ctx.textAlign = "left";

      // tension gauge (26), with the band hatched
      const gy = (v) => gBot - (gBot - gTop) * v / 100;
      const inBand = tension >= BAND[0] && tension <= BAND[1];
      const spoolEase = pins.some((p) => p.spool);
      ctx.fillStyle = "#fbf6e8"; ctx.fillRect(gx - 9, gTop, 18, gBot - gTop);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(gx - 9, gTop, 18, gBot - gTop);
      hatch(gx - 9, gy(BAND[1]), 18, gy(BAND[0]) - gy(BAND[1]), 4, C.ink);
      if (spoolEase) { ctx.fillStyle = "rgba(42,58,140,.25)"; ctx.fillRect(gx - 9, gy(SPOOL_EASE[1]), 18, gy(SPOOL_EASE[0]) - gy(SPOOL_EASE[1])); }
      ctx.font = "12px 'IBM Plex Mono',monospace"; ctx.fillStyle = C.ink;
      for (const v of [0, 20, BAND[0], BAND[1], JAM, 100]) { line(gx + 9, gy(v), gx + 15, gy(v), 0.8); ctx.fillText(String(v), gx + 17, gy(v) + 4); }
      ctx.fillStyle = tension > JAM ? C.ev : inBand ? C.amber : tension < DROP ? C.faint : C.brass;
      ctx.fillRect(gx - 7, gy(tension), 14, gBot - gy(tension));
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(gx - 11, gy(tension)); ctx.lineTo(gx - 22, gy(tension) - 7); ctx.lineTo(gx - 22, gy(tension) + 7); ctx.fill();
      ctx.font = "600 12px 'IBM Plex Mono',monospace";
      ctx.textAlign = "right"; ctx.fillText(String(Math.round(tension)), gx - 12, gy(tension) - 10 < gTop ? gy(tension) + 24 : gy(tension) - 11); ctx.textAlign = "left";
      label(26, gx, gTop, gx + 30, gTop - 12);

      // shell (10)
      const shellTop = shear - T * 2.3;
      const ang = (plugTurn + (over && turning ? Math.min(90, (now - turning) / 12) : 0)) * Math.PI / 180;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.strokeRect(L, shellTop, R - L, shear - shellTop);
      hatch(L, shellTop, R - L, shear - shellTop, 7);
      xs.forEach((x) => { ctx.fillStyle = C.paper; ctx.fillRect(x - pw / 2 - 3, shellTop, pw + 6, shear - shellTop); line(x - pw / 2 - 3, shellTop, x - pw / 2 - 3, shear, 0.8); line(x + pw / 2 + 3, shellTop, x + pw / 2 + 3, shear, 0.8); });
      const capY = shellTop - T * 0.75;
      ctx.strokeRect(L + 6, capY - 12, R - L - 12, 12); hatch(L + 6, capY - 12, R - L - 12, 12, 5);
      xs.forEach((x) => line(x, capY, x, shellTop, 0.7, C.ink, [2, 4]));
      label(10, L, shellTop + 10, L - 30, shellTop - 8);

      // plug (20)
      const off = Math.sin(ang) * rp * 0.7;
      ctx.fillStyle = "#f7f0dc"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(L, cy, rp * 0.28, rp, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L, cy - rp); ctx.lineTo(R, cy - rp); ctx.lineTo(R, cy + rp); ctx.lineTo(L, cy + rp); ctx.fill();
      line(L, cy - rp, R, cy - rp, 1.3); line(L, cy + rp, R, cy + rp, 1.3);
      ctx.beginPath(); ctx.ellipse(R, cy, rp * 0.28, rp, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      for (let k = 0; k < 7; k++) { const yy = cy - rp + rp * 2 * (k + 0.5) / 7 + off * (1 - Math.abs(k - 3) / 4) * 0.4; line(L + 4, yy, R - 4, yy, 0.45, C.faint); }
      ctx.fillStyle = "#e6dcc2"; ctx.fillRect(L + 8, cy + rp * 0.15, R - L - 16, rp * 0.45);
      line(L + 8, cy + rp * 0.15, R - 8, cy + rp * 0.15, 0.7); line(L + 8, cy + rp * 0.6, R - 8, cy + rp * 0.6, 0.7);
      label(20, L + 20, cy + rp, L - 6, cy + rp + 26);
      if (plugTurn) { ctx.font = "italic 14px Georgia,serif"; ctx.fillStyle = C.ink; ctx.fillText(`${plugTurn}°`, R + 16, cy + 4); }
      line(L - 20, shear, R + 30, shear, 1, C.ink, [10, 4, 2, 4]);
      ctx.font = "italic 16px Georgia,serif"; ctx.fillStyle = C.ink; ctx.fillText("S", R + 34, shear + 5);

      // pins
      const b = binding();
      const keyLen = rp * 0.95;
      const hintOn = !over && (gentle || now - lastProgress > 20000);
      xs.forEach((x, i) => {
        const p = pins[i];
        const keyTop = shear + (SHEAR[i] - p.h) * T;
        let drvBot = p.set ? shear - 1 : keyTop - 1;
        const drvLen = T * 0.62;
        const sprTop = shellTop + 4;
        if (i === cur) { ctx.fillStyle = "rgba(42,58,140,.08)"; ctx.fillRect(x - pw * 0.9, capY - 30, pw * 1.8, cy + rp - capY + 30); }
        else if (i === hoverPin) { ctx.fillStyle = "rgba(42,58,140,.05)"; ctx.fillRect(x - pw * 0.9, capY - 30, pw * 1.8, cy + rp - capY + 30); }
        if (i === b && hintOn) { ctx.fillStyle = "rgba(224,162,74,.32)"; ctx.fillRect(x - pw, shear - T * 1.6, pw * 2, T * 2.2 + keyLen * 0.4); }
        // the moment of the click: a binding pin at its window under the right tension
        const ready = !bell && i === b && lifting && i === cur && p.h >= SHEAR[i] && p.h <= SHEAR[i] + WINW() && ((p.spool && tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1]) || (!p.spool && inBand));
        if (ready) { ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.strokeRect(x - pw * 0.8, shear - 6, pw * 1.6, 12); }
        const setK = p.fx ? Math.max(0, 1 - (now - p.fx) / 700) : 0;
        const badK = p.bad ? Math.max(0, 1 - (now - p.bad) / 600) : 0;
        const shake = badK && !RM ? Math.sin(now / 25) * 3 * badK : 0;
        spring(x + shake, sprTop, drvBot - drvLen, pw * 0.8);
        drawPin(x + shake, drvBot - drvLen, drvLen, pw, "drv", SPOOL.has(i) && (p.spool || p.set || told.has("spool")), setK ? `rgba(224,162,74,${0.3 + setK * 0.6})` : p.over ? "#f1d2c8" : null);
        drawPin(x + shake, Math.max(keyTop, shear - T * 0.8), keyLen, pw * 0.92, "key", false, p.set ? "#efe0b2" : null);
        if (setK && !RM) { ctx.strokeStyle = `rgba(184,145,63,${setK})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, shear, pw * (1.2 + (1 - setK) * 1.4), 0, 7); ctx.stroke(); }
        if (p.set) { ctx.fillStyle = C.ink; ctx.font = "600 13px 'IBM Plex Mono',monospace"; ctx.textAlign = "center"; ctx.fillText("✓", x, shear - drvLen - T * 0.3); ctx.textAlign = "left"; }
        if (p.over) { ctx.font = "bold 14px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("over", x, cy + rp + 20); ctx.textAlign = "left"; }
        if (p.spool) { ctx.font = "italic 13px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("false set", x, cy + rp + 20); ctx.textAlign = "left"; }
        line(x, sprTop - 6, x, capY + 2, 0.6, C.ink, [1, 4]);
        ctx.font = `${i === cur ? 600 : 400} 14px 'IBM Plex Mono',monospace`; ctx.fillStyle = i === cur ? C.blue : C.ink; ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, capY - 18);
        ctx.textAlign = "left";
      });
      label(12, xs[0], shellTop + T * 0.4, xs[0] - pw * 2.2, shellTop + T * 0.2);
      label(told.has("spool") ? 16 : 14, xs[Math.min(1, N - 1)], shear - T * 0.9, xs[1] + pw * 1.6, shear - T * 1.3);
      label(18, xs[N - 1], shear + rp * 0.2, xs[N - 1] + pw * 1.8, shear + rp * 0.9);

      // hook pick (22)
      const tipX = xs[cur], tipY = Math.min(cy + rp * 0.55, shear + (SHEAR[cur] - pins[cur].h) * T + keyLen + 2);
      const handleY = cy + rp * 0.4;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(W - 16, handleY + 4); ctx.lineTo(R + 10, handleY + 2); ctx.lineTo(tipX + 14, handleY); ctx.quadraticCurveTo(tipX + 4, handleY, tipX, tipY); ctx.stroke();
      ctx.fillStyle = "#fbf6e8"; ctx.fillRect(R + 20, handleY - 4, Math.max(10, W - R - 36), 12); ctx.strokeRect(R + 20, handleY - 4, Math.max(10, W - R - 36), 12);
      label(22, R + 40, handleY + 8, R + 50, handleY + 34);
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(L + 10, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 1.8); ctx.lineTo(L - 24, cy + rp * 1.8 + tension * 0.25); ctx.stroke();
      label(24, L - 6, cy + rp * 1.4, L + 26, cy + rp * 2.0);
      // parts list, on a wide sheet
      if (!G.narrow && W > 900) {
        const lx = W - Math.max(W * 0.16, 200) + 40, ly = 130;
        ctx.font = "italic 14px Georgia,serif"; ctx.fillStyle = C.ink;
        [["10", "shell"], ["12", "springs"], ["14", "drivers"], ["16", "spool driver"], ["18", "key pins"], ["20", "plug"], ["22", "hook"], ["24", "wrench"], ["26", "tension"]].forEach(([n, s], i) => ctx.fillText(`${n}  ${s}`, lx, ly + i * 19));
        if (plateCv) { // the plate as filed, for reference
          const pw2 = Math.min(190, W - lx - 22), ph2 = pw2 * 2 / 3, py2 = ly + 9 * 19 + 10;
          if (py2 + ph2 < gBot - 60) { ctx.drawImage(plateCv, lx, py2, pw2, ph2); ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; ctx.strokeRect(lx, py2, pw2, ph2); ctx.font = "italic 12px Georgia,serif"; ctx.fillText("as filed", lx, py2 + ph2 + 15); }
        }
      }
      if (now - msgT > 7000 && capMsg.textContent && !over) capMsg.textContent = "";
    }

    let raf = 0, last = performance.now();
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      step(dt); render(now);
      raf = requestAnimationFrame(loop);
    };

    // ---- input
    const move = (d) => { if (over) return; release(); cur = Math.max(0, Math.min(N - 1, cur + d)); };
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); if (!e.repeat) move(-1); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); if (!e.repeat) move(1); }
      else if (k === "ArrowUp" || k === " ") { e.preventDefault(); lifting = true; }
      else if (k === "w" || k === "W") tUp = true;
      else if (k === "s" || k === "S" || k === "ArrowDown") { e.preventDefault(); tDown = true; }
      else if ((k === "f" || k === "F") && unlocked.has("feel") && !e.repeat) feel();
      else if ((k === "r" || k === "R") && !e.repeat) rake();
      else if (/^[1-5]$/.test(k) && +k <= N) { release(); cur = +k - 1; }
    });
    on(window, "keyup", (e) => {
      const k = e.key;
      if (k === "ArrowUp" || k === " ") release();
      if (k === "w" || k === "W") tUp = false;
      if (k === "s" || k === "S" || k === "ArrowDown") tDown = false;
    });
    pad.querySelectorAll("button").forEach((b) => {
      const a = b.dataset.a;
      on(b, "pointerdown", (e) => {
        e.preventDefault(); if (!started || over) return; b.classList.add("on");
        if (a === "left") move(-1); if (a === "right") move(1);
        if (a === "lift") lifting = true; if (a === "tup") tUp = true; if (a === "tdown") tDown = true;
        if (a === "feel") feel(); if (a === "rake") rake();
      });
      const up = () => { b.classList.remove("on"); if (a === "lift" && lifting) release(); if (a === "tup") tUp = false; if (a === "tdown") tDown = false; };
      on(b, "pointerup", up); on(b, "pointerleave", up); on(b, "pointercancel", up);
    });
    let ptr = null;
    const nearestPin = (x) => { let bi = 0, bd = 1e9; G.xs.forEach((px, i) => { if (Math.abs(px - x) < bd) { bd = Math.abs(px - x); bi = i; } }); return bi; };
    on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      cv.setPointerCapture(e.pointerId);
      if (x < G.gx + 34) { ptr = { kind: "gauge" }; tension = Math.max(0, Math.min(100, 100 * (G.gBot - y) / (G.gBot - G.gTop))); return; }
      const bi = nearestPin(x);
      if (bi !== cur) { release(); cur = bi; }
      ptr = { kind: "pick", y0: y };
      lifting = false;
    });
    on(cv, "pointermove", (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      hoverPin = x > G.gx + 34 && x < G.R + 20 ? nearestPin(x) : -1;
      cv.style.cursor = x < G.gx + 34 ? "ns-resize" : hoverPin >= 0 ? "pointer" : "default";
      if (!ptr || over) return;
      if (ptr.kind === "gauge") tension = Math.max(0, Math.min(100, 100 * (G.gBot - y) / (G.gBot - G.gTop)));
      else lifting = ptr.y0 - y > 6;
    });
    const pup = () => { if (ptr && ptr.kind === "pick") release(); ptr = null; };
    on(cv, "pointerup", pup); on(cv, "pointercancel", pup);
    on(cv, "wheel", (e) => { if (!started || over) return; e.preventDefault(); tension = Math.max(0, Math.min(100, tension - Math.sign(e.deltaY) * 3)); }, { passive: false });

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    resize();

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}patent">
      <div class="no"><span>PAT. No. 4·0·3</span><span>${LK.sheet.toUpperCase()}</span></div>
      <h2>Lockwork · ${LK.fig.split("·")[1].trim()}</h2>
      ${art.has(LK.plate) ? `<img class="fig" alt="${LK.fig}" src="${art.url(LK.plate)}">` : ""}
      <p class="goal">${LK.goal}</p>
      <p class="open"></p>
      <ol>
        <li><span>24</span><b>TENSION</b><span><kbd>W</kbd>/<kbd>S</kbd>, the wheel, or drag the gauge: hold it in the hatched band, ${BAND[0]}–${BAND[1]}.</span></li>
        <li><span>22</span><b>HOOK</b><span><kbd>←</kbd><kbd>→</kbd> or tap a pin.</span></li>
        <li><span>18</span><b>LIFT</b><span>hold <kbd>↑</kbd> or drag up; let go as the pin meets <i>S</i> and the line glows.</span></li>
      </ol>
      ${["lock-drawer", "lock-stair", "lock-wafer", "lock-safe", "lock-lever"].every((id) => art.has(id)) ? `<div class="${P}roll">${[["lock-drawer", "FIG. 1", teach ? "tonight" : "night 1 ✓", teach ? "now" : ""], ["lock-stair", "FIG. 2", teach ? "night 3" : "tonight", teach ? "later" : "now"], ["lock-wafer", "FIG. 3", "night 4", "later"], ["lock-safe", "FIG. 4", "night 6", "later"], ["lock-lever", "FIG. 5", "night 7", "later"]].map(([id, f, n, c]) => `<figure class="${c}"><img alt="" src="${art.url(id)}">${f}<br>${n}</figure>`).join("")}</div>` : ""}
      <div class="ft">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> a fourth pick, a wider line, the binding pin shown</label>` : `<span>Only the binding pin will set. Lift past <i>S</i> and it oversets.</span>`}<button type="button" class="${P}b">START</button></div></div>`;
    intro.querySelector(".open").textContent = LK.open;
    intro.querySelector("ol").after(stage.row(P + "b"));
    wrap.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); picks = teach ? 9 : gentle ? 4 : 3; });
    const sb = [...intro.querySelectorAll("button")].pop();
    on(sb, "click", () => { intro.remove(); started = true; tStart = lastProgress = performance.now(); say("Bring the tension up into the hatched band first."); });
    raf = requestAnimationFrame(loop);
    sb.focus();

    return {
      unmount() {
        disposed = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
});

// ---- TWIST: lost property. A wafer lock: matched, not picked (DESIGN.md section 11).
const W_CODE = [2, 4, 1, 3, 2];
const W_KEYS = [[1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [3, 3, 3, 3, 3], [4, 1, 4, 1, 1], [3, 1, 3, 1, 1], [3, 2, 2, 3, 2], [1, 4, 1, 1, 1], [1, 3, 3, 1, 1]];
const LEFT_THINGS = ["a rook", "a child's mitten", "a dry orchid", "a chess clock", "a press card", "a paper boat gone brown"];
function wafer(root, api, stage) {
  const C = { paper: "#efe6cf", ink: "#1c1a17", faint: "#6f6650", brass: "#b8913f", brassL: "#e3c47a", ev: "#a3302a", amber: "#e0a24a", blue: "#2a3a8c" };
  const RM = api.reducedMotion, art = api.art || { has: () => false, url: () => "" };
  const shared = api.shared || { get: (k, d) => d, set() {} };
  const streak = api.store.get("lossStreak", 0);
  let gentle = api.store.get("gentle", false);
  const st = document.createElement("style");
  st.textContent = `
  .${P}w{position:absolute;inset:0;overflow:auto;background:${C.paper};color:${C.ink};font:15px/1.4 Georgia,serif;box-shadow:inset 0 0 0 8px ${C.paper},inset 0 0 0 9px ${C.ink}}
  .${P}w .in{max-width:980px;margin:0 auto;padding:22px 18px 30px}
  .${P}w .hd{display:flex;justify-content:space-between;gap:8px;font:13px 'IBM Plex Mono',monospace;letter-spacing:.08em}
  .${P}w h2{margin:6px 0 2px;font:italic 400 26px Georgia,serif;text-align:center}
  .${P}w .cap{text-align:center;min-height:2.8em;margin:4px auto 8px;max-width:640px}
  .${P}w .cap .story{display:block;color:${C.blue};font-size:14px}
  .${P}w .g{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px}
  @media (max-width:720px){.${P}w .g{grid-template-columns:minmax(0,1fr)}.${P}w h2{font-size:21px}}
  .${P}w h3{margin:0 0 6px;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.12em}
  .${P}ring{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .${P}key{font:600 13px 'IBM Plex Mono',monospace;background:#fbf6e8;color:${C.ink};border:1.5px solid ${C.ink};min-height:58px;padding:4px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}
  .${P}key:hover,.${P}key:focus-visible{background:#f3e3b8;outline:none}
  .${P}key.on{background:${C.brassL};box-shadow:0 0 0 2px ${C.ink}}
  .${P}key.used{opacity:.5}
  .${P}key.warm{box-shadow:0 0 0 3px ${C.amber}}
  .${P}key svg{display:block}
  .${P}blank{display:flex;gap:6px;align-items:flex-end;margin:10px 0 8px;flex-wrap:wrap}
  .${P}blank .wf{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 13px 'IBM Plex Mono',monospace}
  .${P}blank button{min-width:44px;min-height:34px;font:600 14px 'IBM Plex Mono',monospace;background:#fbf6e8;border:1.5px solid ${C.ink};cursor:pointer;color:${C.ink}}
  .${P}blank .d{min-height:44px;font-size:18px;background:#fff}
  .${P}blank .wf.cur .d{box-shadow:0 0 0 2px ${C.blue}}
  .${P}w table{border-collapse:collapse;font:13px 'IBM Plex Mono',monospace;width:100%}
  .${P}w td,.${P}w th{border:1px solid ${C.faint};padding:3px 6px;text-align:center}
  .${P}w td.c{font-weight:700;color:${C.ev}}
  .${P}pg td{cursor:pointer;min-width:34px;height:30px;user-select:none}
  .${P}lamp{position:sticky;top:0;z-index:3;text-align:center;font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.1em;padding:6px;min-height:1.4em;border:1.5px solid transparent}
  .${P}lamp.warn{color:${C.ev};border-color:${C.ev};background:#fbf6e8}
  .${P}lamp.on{background:${C.amber};color:#1c1a17;border-color:${C.ink}}
  .${P}w.lit .g{filter:brightness(1.12) sepia(.5)}
  .${P}w .fig{display:block;width:100%;max-height:150px;object-fit:contain;border:1px solid ${C.ink};background:#e4dccb;margin:0 0 8px}
  .${P}cab{border:1.5px solid ${C.ink};background:#fbf6e8;padding:12px 14px;margin-top:12px}
  .${P}cab ul{margin:6px 0;padding-left:1.2em;columns:2}
  .${P}intro2{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,230,207,.95);padding:12px;z-index:5;overflow:auto}
  .${P}intro2 .c{max-width:540px;width:100%;box-sizing:border-box;border:1.5px solid ${C.ink};padding:18px 20px 16px;background:#fbf6e8;box-shadow:inset 0 0 0 5px #fbf6e8,inset 0 0 0 6px ${C.ink}}
  .${P}intro2 .b,.${P}w .b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.05em;background:#fbf6e8;color:${C.ink};border:1.5px solid ${C.ink};min-height:44px;padding:6px 10px;cursor:pointer}
  .${P}intro2 .b:disabled{opacity:.4}
  .${P}w .b.go{background:${C.brassL}}`;
  root.appendChild(st);
  const w = document.createElement("div"); w.className = P + "w"; root.appendChild(w);
  const depths = (k) => `<svg width="50" height="20" viewBox="0 0 50 20" aria-hidden="true">${k.map((d, i) => `<rect x="${2 + i * 10}" y="${2}" width="7" height="${3 + d * 3.5}" fill="${C.brass}" stroke="${C.ink}" stroke-width=".8"/>`).join("")}</svg>`;
  w.innerHTML = `<div class="in"><div class="hd"><span data-clock>◷ 00:40</span><span>Sheet 3 of 5</span><span data-left></span></div>
    <h2>FIG. 3 · lost property</h2>
    <div class="${P}lamp" data-lamp aria-live="assertive"></div>
    <p class="cap" aria-live="polite"><i data-msg></i><span class="story" data-story></span></p>
    <div class="g"><div>
      ${art.has("lock-wafer") ? `<img class="fig" alt="FIG. 3: a five-wafer cabinet lock, exploded" src="${art.url("lock-wafer")}">` : ""}
      <h3>THE RING · EIGHT JIGGLERS</h3><div class="${P}ring" role="group" aria-label="Jiggler keys"></div>
      <h3 style="margin-top:12px">THE BLANK AND THE FILE · ONE DEPTH PER WAFER</h3>
      <div class="${P}blank"></div>
      <button type="button" class="b go" data-insert>INSERT AND ROCK · ENTER</button>
    </div><div>
      <h3>THE RECORD · HOW MANY WAFERS EACH KEY FITS</h3>
      <table data-log><tr><th>key</th><th>cuts</th><th>clicks</th></tr></table>
      <h3 style="margin-top:12px">PENCIL · STRIKE OUT A DEPTH (tap)</h3>
      <table class="${P}pg" data-pg></table>
      <div data-cab></div>
    </div></div></div>`;
  const $ = (q) => w.querySelector(q);
  const ring = $("." + P + "ring"), blankEl = $("." + P + "blank"), logEl = $("[data-log]"), msg = $("[data-msg]"), story = $("[data-story]"), lampEl = $("[data-lamp]"), pg = $("[data-pg]");
  const listeners = [], timers = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
  let sel = 0, blank = [1, 1, 1, 1, 1], bcur = 0, left = gentle ? 12 : 10, over = false, started = false, strikes = 0, lastIns = performance.now();
  const used = new Set(), tries = [];
  let lamp = "off", lampAt = 0, nextLamp = 0, raf = 0, t0 = performance.now();
  const say = (m) => { msg.textContent = m; }, tell = (m) => { story.textContent = m; };
  W_KEYS.forEach((k, i) => { const b = document.createElement("button"); b.type = "button"; b.className = P + "key"; b.dataset.k = i; b.innerHTML = `${depths(k)}<span>${i + 1} · ${k.join("")}</span>`; b.setAttribute("aria-label", `Jiggler ${i + 1}, cuts ${k.join(" ")}`); ring.appendChild(b); });
  const pgMarks = Array.from({ length: 4 }, () => [0, 0, 0, 0, 0]);
  function paint() {
    ring.querySelectorAll("button").forEach((b, i) => { b.classList.toggle("on", sel === i); b.classList.toggle("used", used.has(i)); b.classList.toggle("warm", !over && started && sel !== i && !used.has(i) && i === W_KEYS.findIndex((_, j) => !used.has(j)) && (gentle || performance.now() - lastIns > 20000)); });
    blankEl.innerHTML = blank.map((d, i) => `<span class="wf${sel === "b" && bcur === i ? " cur" : ""}"><button type="button" data-up="${i}" aria-label="Wafer ${i + 1} deeper">▲</button><button type="button" class="d" data-w="${i}" aria-label="Wafer ${i + 1}, depth ${d}">${d}</button><button type="button" data-dn="${i}" aria-label="Wafer ${i + 1} shallower">▼</button></span>`).join("") + `<button type="button" class="${P}key${sel === "b" ? " on" : ""}" data-k="b" style="min-width:86px">${depths(blank)}<span>B · blank</span></button>`;
    $("[data-left]").textContent = `INSERTIONS ${left}`;
    pg.innerHTML = `<tr><th></th>${[1, 2, 3, 4, 5].map((n) => `<th>w${n}</th>`).join("")}</tr>` + pgMarks.map((r, d) => `<tr><th>${d + 1}</th>${r.map((v, i) => `<td data-d="${d}" data-i="${i}" aria-label="wafer ${i + 1} depth ${d + 1}: ${v === 1 ? "struck out" : v === 2 ? "ringed" : "open"}">${v === 1 ? "✕" : v === 2 ? "○" : ""}</td>`).join("")}</tr>`).join("");
  }
  function noise() {
    if (lamp !== "on" || over) return false;
    strikes++; say(strikes >= 2 ? "The wheels stop. The lamp comes back to the keyhole and stays on it." : "Metal on metal, under her lamp. The wheels stop a moment, then go on. Once more and she will come and look.");
    if (strikes >= 2) { over = true; api.store.set("lossStreak", streak + 1); timers.push(setTimeout(() => api.end({ outcome: "lose", text: "Dora's lamp found the keyhole with your hand at it. She says nothing, and tells Lew. The cabinet stays shut tonight. When her lamp is on the lock, keep your hands still until it passes." }), 1200)); }
    return true;
  }
  function insert() {
    if (over || !started) return;
    if (noise()) return;
    if (sel !== "b" && used.has(sel)) { say(`Jiggler ${sel + 1} is already in the record.`); return; }
    const key = sel === "b" ? blank.slice() : W_KEYS[sel];
    if (left <= 0) return;
    left--; lastIns = performance.now();
    const n = key.filter((d, i) => d === W_CODE[i]).length;
    if (sel !== "b") used.add(sel);
    tries.push({ key, n });
    const tr = document.createElement("tr"); tr.innerHTML = `<td>${sel === "b" ? "blank" : sel + 1}</td><td data-cuts>${key.join(" ")}</td><td class="c" data-clicks>${n}</td>`; logEl.appendChild(tr);
    say(n === 5 ? "Five clicks. The key turns." : `${n === 0 ? "No click at all" : n === 1 ? "One click" : n + " clicks"}: ${n === 0 ? "not one wafer sits at these depths. That is worth as much as a click." : `${n} of five wafers sit${n === 1 ? "s" : ""} right, and the lock does not say which.`}`);
    if (tries.length === 1) tell("In a pin lock you felt for the one pin that bound. This lock gives a number and nothing else.");
    if (n === 5) { win(); return; }
    paint();
    if (left <= 0) { over = true; api.store.set("lossStreak", streak + 1); timers.push(setTimeout(() => api.end({ outcome: "lose", text: `Ten insertions, and the cabinet has not turned. It is nearly one, and Dora's round takes the passage until half past. The record you kept is still true: ${tries.length} keys and their clicks. Strike out depths in pencil, and cut the blank from what is left.` }), 900)); }
  }
  function win() {
    over = true; api.store.set("opened", true); api.store.set("lossStreak", 0);
    shared.set("lostProperty", true);
    lampEl.className = P + "lamp"; lampEl.textContent = "";
    $("[data-cab]").innerHTML = `<div class="${P}cab"><h3>THE CABINET, OPEN</h3>Bottom drawer: a night log in another hand. Beside it, six left things, each with a paper tag:<ul>${LEFT_THINGS.map((t) => `<li>${t}</li>`).join("")}</ul>
      <svg viewBox="0 0 300 70" width="100%" role="img" aria-label="Chalk ticks inside the door, in seven columns: six headed with room numbers, the seventh bare"><rect width="300" height="70" fill="#3a2716"/>${[0, 1, 2, 3, 4, 5, 6].map((c) => `<text x="${22 + c * 40}" y="16" font-family="monospace" font-size="10" fill="#e9e2cf" text-anchor="middle" opacity=".8">${c < 6 ? 401 + c : ""}</text>` + Array.from({ length: [5, 6, 4, 6, 5, 3, 5][c] }, (_, k) => `<path d="M${14 + c * 40 + k * 4} 26 l1.5 30" stroke="#e9e2cf" stroke-width="2" opacity=".85"/>`).join("")).join("")}</svg>
      <i>Chalk, inside the door, where only whoever opens it reads it: ticks in seven columns. Six are headed with a room. The seventh has no number.</i></div>`;
    paint();
    const cab = $("[data-cab]"); if (cab.scrollIntoView) cab.scrollIntoView({ block: "end", behavior: RM ? "auto" : "smooth" });
    timers.push(setTimeout(() => api.end({ outcome: "win", text: `Five clicks, and lost property opens with ${left} insertion${left === 1 ? "" : "s"} to spare${strikes ? ", one of them heard" : ""}. In the bottom drawer, last season's log, in a careful hand. Six left things with paper tags. And inside the door, Dora's chalk: seven columns of ticks, and the seventh has no room number. A green spool of thread has rolled to the back of the shelf.` }), RM ? 1800 : 3600));
  }
  on(w, "click", (e) => {
    if (over || !started) return;
    const t = e.target.closest("button,td"); if (!t) return;
    if (t.dataset.d != null) { const d = +t.dataset.d, i = +t.dataset.i; pgMarks[d][i] = (pgMarks[d][i] + 1) % 3; paint(); return; }
    if (t.dataset.insert != null) { insert(); return; }
    if (noise()) return;
    if (t.dataset.k != null) { sel = t.dataset.k === "b" ? "b" : +t.dataset.k; paint(); }
    else if (t.dataset.up != null || t.dataset.w != null) { const i = +(t.dataset.up ?? t.dataset.w); blank[i] = blank[i] % 4 + 1; sel = "b"; bcur = i; paint(); }
    else if (t.dataset.dn != null) { const i = +t.dataset.dn; blank[i] = (blank[i] + 2) % 4 + 1; sel = "b"; bcur = i; paint(); }
  });
  on(window, "keydown", (e) => {
    if (over || !started) return;
    const k = e.key;
    if (!/^[1-8]$|^b$|^B$|^Arrow|^Enter$|^ $/.test(k)) return;
    e.preventDefault();
    if (k === "Enter" || k === " ") { insert(); return; }
    if (noise()) return;
    if (/^[1-8]$/.test(k)) sel = +k - 1;
    else if (k === "b" || k === "B") sel = "b";
    else if (sel === "b") { if (k === "ArrowLeft") bcur = (bcur + 4) % 5; if (k === "ArrowRight") bcur = (bcur + 1) % 5; if (k === "ArrowUp") blank[bcur] = blank[bcur] % 4 + 1; if (k === "ArrowDown") blank[bcur] = (blank[bcur] + 2) % 4 + 1; }
    paint();
  });
  const rnd = api.rng(33);
  const tick = (now) => {
    if (started && !over) {
      const el = (now - t0) / 1000, gm = 40 + Math.floor(el * 10 / 60);
      $("[data-clock]").textContent = `◷ 00:${String(Math.min(59, gm)).padStart(2, "0")}`;
      if (lamp === "off" && el >= nextLamp) { lamp = "warn"; lampAt = now; lampEl.className = P + "lamp warn"; lampEl.textContent = "WHEELS ON THE BOARDS · her lamp is coming · hands still"; }
      else if (lamp === "warn" && now - lampAt > (gentle ? 2000 : 1300)) { lamp = "on"; lampAt = now; lampEl.className = P + "lamp on"; lampEl.textContent = "DORA'S LAMP IS ON THE KEYHOLE · DO NOTHING"; w.classList.add("lit"); if (!w.dataset.told) { w.dataset.told = 1; tell("Everything the other locks taught you says keep working. Tonight the right move is no move."); } }
      else if (lamp === "on" && now - lampAt > 2600) { lamp = "off"; nextLamp = el + 9 + rnd() * 4; lampEl.className = P + "lamp"; lampEl.textContent = ""; w.classList.remove("lit"); }
      if (!gentle && now - lastIns > 20000) paint(), lastIns = now - 19000;
    }
    raf = requestAnimationFrame(tick);
  };
  paint();
  const intro = document.createElement("div"); intro.className = P + "intro2";
  intro.innerHTML = `<div class="c"><div class="hd" style="display:flex;justify-content:space-between;font:12px 'IBM Plex Mono',monospace;letter-spacing:.14em"><span>PAT. No. 4·0·3</span><span>SHEET 3 OF 5</span></div>
    <h2 style="margin:8px 0 2px;font:italic 400 26px Georgia,serif;text-align:center">Lockwork · lost property</h2>
    <p style="text-align:center;margin:0 0 8px">Find the key that fits all five wafers, in ten insertions.</p>
    <p style="font-size:14px;color:${C.blue};margin:0 0 10px">Night four, 00:40. A tall cabinet in the passage, between 403 and 404, where Dora leaves what guests forget. This lock is not picked: nothing in it lifts. A key either fits a wafer or does not, and the lock only tells you how many.</p>
    <ol style="margin:0 0 10px;padding-left:1.3em;display:grid;gap:4px">
      <li><b>INSERT</b> a jiggler (keys 1–8, then Enter): the clicks say how many of its five cuts are right.</li>
      <li><b>CUT</b> the blank (B, arrows, or ▲▼) and insert it. Five clicks open the cabinet.</li>
      <li><b>THE LAMP</b>: when Dora's lamp is on the keyhole, touch nothing until it passes.</li>
    </ol><div data-row></div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;border-top:1px solid ${C.ink};padding-top:10px;margin-top:8px">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> twelve insertions, a slower lamp, the next key warmed</label>` : "<span>The lock never says which wafer.</span>"}<button type="button" class="b" data-start>START</button></div></div>`;
  intro.querySelector("[data-row]").appendChild(stage.row("b"));
  w.appendChild(intro);
  const gb = intro.querySelector("input");
  if (gb) on(gb, "change", () => { gentle = gb.checked; api.store.set("gentle", gentle); left = gentle ? 12 : 10; paint(); });
  const sb = intro.querySelector("[data-start]");
  on(sb, "click", () => { intro.remove(); started = true; t0 = lastIns = performance.now(); nextLamp = 12; say("Choose a key from the ring and insert it."); paint(); });
  raf = requestAnimationFrame(tick);
  sb.focus();
  return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o); root.innerHTML = ""; } };
}

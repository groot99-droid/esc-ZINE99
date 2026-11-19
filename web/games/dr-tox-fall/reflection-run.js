// Dr. Tox: Fall, 2D mode B: Reflection run (DESIGN.md section 10, `m2_reflection_run`).
// Silkscreen pop-art repeats: flat colour blocks, the same figure printed again in off-register frames,
// one repeat that does not match. Cally walks the floor line left to right; her reflection walks in the
// glass below it, upside down, 0.3 s behind. Real scrolling, three parallax layers (0.3, 0.6, 1.2).
//
// Two halls, as the design's two sequences, each cut to a few minutes:
//   1  s2_reflect_1  to a staged meeting, one refusal (a door plate stamped RCC).
//   2  s2_reflect_2  to the balcony, three refusals (a clean-air column's plate, a mural of a painted sky,
//                    a loop of string on a cleaner's trolley), closer together, guests drifting in both worlds.
//
// Rules (DESIGN.md section 10): both must reach the end of the hall. Some doors open only from a switch in
// the glass the reflection can stand on. Cameras are objectives, not threats: the handler's cue asks her to be
// in a camera's view, still, at a set moment; a missed cue costs 2 match points in the next Persona. At a
// refusal the reflection stops and turns its back: hold Force for two seconds (it is dragged on; cally.forced
// +1, cally.crack -5, no bond loss) or stop with it for three seconds (it walks on by itself; cally.crack +10;
// in the second hall cally.bond_aegis -3). A refusal is never explained. There is no failure: a missed cue and
// the refusals are the record, so the hall always ends in "done".
//
// Shared flags (data/flags.json): writes cally.refusals, cally.forced, cally.crack, cally.bond_aegis (hall 2).
// Added for the module, not in flags.json: cally.missed_cues (a counter; Persona may read it for its -2 each).
//
// Art (api.art, ASSET_MAP.md "Reflection run"): the three glass layers, Cally wait/walk, the reflection walk and
// refuse poses, Aegis, the camera cue, door, switch, frames, the refusal props and the Force and Stop prompts.
// Every id falls back to flat colour drawn here when the bundle lacks it.
//
// Lines: the quote and the end sentences are DESIGN.md's (Scene 3 as section 10 quotes it); the hall names,
// the on-screen instructions and the end records are added for the module.

const P = "dtf-rr-";
const PAPER = "#F3EBD8", INK = "#1C1B2E", MAG = "#E5338A", CYAN = "#1FB5D6", YEL = "#F5C518", ORG = "#F26B3A";
const TINTS = [MAG, CYAN, YEL, ORG];
const HW = 540, FLOOR = 270, FW = 240;
const QUOTE = "I'm told I'm very good at being watched.";
const SPEED = 170, LAG = 0.3, FORCE_T = 2, STAY_T = 3, DWELL = 0.5, POSE = 0.8, CUE_T = 7;

const HALLS = [
  {
    id: "s2_reflect_1", n: 1, title: "To a staged meeting", chapter: "Chapter six · seventy-two hours", len: 3300, guests: 0,
    scene: "A meeting arranged to look like chance. The hall is glass, and so is the floor under it.",
    goal: "Walk the hall to the end, with your reflection. Be watched when the handler asks.",
    cams: [600, 2700],
    doors: [{ sw: 1000, x: 1240 }, { sw: 2200, x: 2440 }],
    refusals: [{ x: 1750, kind: "door-rcc" }],
  },
  {
    id: "s2_reflect_2", n: 2, title: "To the balcony", chapter: "Chapter ten · the gala", len: 4800, guests: 6,
    scene: "The gala hall. Guests move in both worlds. The refusals come closer together.",
    goal: "Walk the hall to the balcony, with your reflection. Be watched when the handler asks.",
    cams: [500, 1900, 3200, 4450],
    doors: [{ sw: 900, x: 1140 }, { sw: 2250, x: 2490 }, { sw: 3950, x: 4190 }],
    refusals: [{ x: 1500, kind: "column" }, { x: 2850, kind: "mural" }, { x: 3600, kind: "string" }],
  },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, img: () => Promise.resolve(null) };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let raf = 0, dead = false, mode = "intro", hallIx = 0;

    // ---- DOM -------------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${PAPER};color:${INK};font-family:"Arial Narrow","Helvetica Neue",Arial,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}stage{position:relative;flex:1;min-height:0;background:${INK}}
.${P}stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}cap{position:absolute;left:8px;top:8px;max-width:calc(100% - 16px);background:${PAPER};border:3px solid ${INK};box-shadow:3px 3px 0 ${MAG};padding:4px 10px;font:700 13px/1.25 Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;pointer-events:none}
.${P}hint{position:absolute;left:8px;right:8px;bottom:8px;margin:auto;max-width:520px;background:${YEL};border:3px solid ${INK};box-shadow:3px 3px 0 ${INK};padding:6px 10px;font:700 14px/1.25 Arial,sans-serif;text-align:center;pointer-events:none}
.${P}hint[hidden],.${P}cap[hidden]{display:none}
.${P}pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;padding:6px 8px 8px;background:${PAPER};border-top:3px solid ${INK}}
.${P}pad button{flex:1 1 0;max-width:170px;min-height:50px;font:800 15px Arial,sans-serif;text-transform:uppercase;color:${INK};background:${CYAN};border:3px solid ${INK};box-shadow:3px 3px 0 ${INK};cursor:pointer;touch-action:none;padding:2px 4px}
.${P}pad button small{display:block;font:400 10px Arial,sans-serif;opacity:.8;text-transform:none}
.${P}pad button[data-b=force]{background:${ORG}}
.${P}pad button[data-b=wait]{background:${YEL}}
.${P}pad button.down{background:${INK};color:${PAPER};box-shadow:none;transform:translate(2px,2px)}
.${P}pad button:focus-visible,.${P}ov button:focus-visible{outline:3px solid ${MAG};outline-offset:2px}
.${P}ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(28,27,46,.6);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}card{max-width:600px;width:100%;box-sizing:border-box;margin:auto;background:${PAPER};border:4px solid ${INK};box-shadow:7px 7px 0 ${MAG},11px 11px 0 ${CYAN};padding:16px 18px}
.${P}kick{font:800 12px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${MAG}}
.${P}card h2{margin:2px 0 6px;font:900 32px/1 Impact,"Arial Narrow",sans-serif;text-transform:uppercase;letter-spacing:.02em;text-shadow:3px 3px 0 ${YEL}}
.${P}q{margin:0 0 8px;padding-left:10px;border-left:6px solid ${CYAN};font-style:italic;font-size:16px}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font-size:14px}
.${P}keys li{display:grid;grid-template-columns:78px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${PAPER};font:800 11px Arial,sans-serif;padding:2px 6px;text-transform:uppercase;text-align:center}
.${P}pages{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 10px}
.${P}pages button{font:800 14px Arial,sans-serif;text-transform:uppercase;text-align:left;padding:8px;background:${PAPER};color:${INK};border:3px solid ${INK};cursor:pointer;min-height:54px}
.${P}pages button small{display:block;font-weight:400;text-transform:none;font-size:11px;margin-top:2px}
.${P}pages button[aria-pressed=true]{background:${INK};color:${PAPER}}
.${P}go{font:900 18px Arial,sans-serif;text-transform:uppercase;background:${MAG};color:#fff;border:3px solid ${INK};box-shadow:3px 3px 0 ${INK};padding:10px 28px;cursor:pointer}
@media (max-width:640px){.${P}pad button{font-size:13px;min-height:52px}.${P}pad button small{display:none}.${P}card{padding:12px}.${P}card h2{font-size:26px}.${P}pages{grid-template-columns:1fr}.${P}cap{font-size:11px}.${P}keys li{grid-template-columns:64px 1fr}}
`;
    const stageEl = document.createElement("div");
    stageEl.className = P + "stage";
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "A glass hall. Cally walks the floor line; her reflection walks upside down in the glass below.");
    const capEl = document.createElement("div"); capEl.className = P + "cap"; capEl.setAttribute("aria-live", "polite");
    const hintEl = document.createElement("div"); hintEl.className = P + "hint"; hintEl.hidden = true; hintEl.setAttribute("aria-live", "polite");
    const ov = document.createElement("div"); ov.className = P + "ov";
    stageEl.append(cv, capEl, hintEl, ov);
    const pad = document.createElement("div");
    pad.className = P + "pad";
    pad.innerHTML = `<button type="button" data-b="left" aria-label="Walk left (A, left arrow)">◀<small>back</small></button>
      <button type="button" data-b="wait" aria-label="Wait (S, down arrow)">Wait<small>S</small></button>
      <button type="button" data-b="force" aria-label="Force, hold (F or Space)">Force<small>hold F</small></button>
      <button type="button" data-b="right" aria-label="Walk right (D, right arrow)">▶<small>D</small></button>`;
    wrap.append(css, stageEl, pad);
    root.appendChild(wrap);
    const g = cv.getContext("2d");

    // ---- art -------------------------------------------------------------------------------------------
    const IMG = {};
    const ids = ["glass-far", "glass-mid", "glass-near", "aegis", "cally-wait", "cally-walk", "reflect-refuse", "reflect-walk", "camera-cue",
      "column-rcc", "door", "door-rcc", "force", "frame", "frame-printed", "mural-sky", "stop", "switch", "trolley-string"].map((s) => "reflection-run-" + s);
    const artReady = Promise.all(ids.map((id) => (art.has && art.has(id) ? art.img(id) : Promise.resolve(null))
      .then((im) => { if (im) IMG[id] = im; }).catch(() => {})));
    const RAST = {};
    let K = 1, VW = 900, PW = 0, PH = 0, dpr = 1;
    function raster(id, w, h) {
      const im = IMG["reflection-run-" + id];
      if (!im) return null;
      const key = id + "@" + Math.round(w) + "x" + Math.round(h);
      if (RAST[key]) return RAST[key];
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
      try { c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); } catch { return null; }
      return (RAST[key] = c);
    }
    // draw sprite `id` with its world box (x, y, w, h); returns false when the art is missing
    function spr(id, x, y, w, h, alpha) {
      const r = raster(id, w * K, h * K);
      if (!r) return false;
      if (alpha != null) g.globalAlpha = alpha;
      g.drawImage(r, (x - (S ? S.cam : 0)) * K, y * K, w * K, h * K);
      if (alpha != null) g.globalAlpha = 1;
      return true;
    }
    function layout() {
      const r = stageEl.getBoundingClientRect();
      PW = Math.max(1, Math.round(r.width)); PH = Math.max(1, Math.round(r.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(PW * dpr); cv.height = Math.round(PH * dpr);
      K = (PH * dpr) / HW; VW = (PW * dpr) / K;
      for (const k in RAST) delete RAST[k];
    }
    const ro = new ResizeObserver(layout);
    ro.observe(stageEl);
    layout();

    // ---- state -----------------------------------------------------------------------------------------
    const keys = { left: false, right: false, wait: false, force: false };
    let S = null, hall = HALLS[0], capTimer = 0;
    function caption(t, ms) {
      capEl.textContent = t; capEl.hidden = !t;
      clearTimeout(capTimer);
      if (t && ms) capTimer = setTimeout(() => { capEl.hidden = true; }, ms);
    }
    function startHall() {
      hall = HALLS[hallIx];
      const rng = api.rng ? api.rng(hall.id) : Math.random;
      S = {
        t: 0, x: 90, rx: 90, hist: [], moving: false, face: 1, walkT: 0, cam: 0,
        catching: false, doorOpen: hall.doors.map(() => false), dwell: hall.doors.map(() => 0),
        cues: hall.cams.map(() => ({ live: false, t: 0, pose: 0, done: false, ok: false })),
        ref: hall.refusals.map(() => ({ state: "wait", mark: false })), act: -1, forceT: 0, stayT: 0,
        forced: 0, stopped: 0, missed: 0, met: 0, printed: new Set(), flash: 0, ending: false,
        guests: Array.from({ length: hall.guests }, (_, i) => ({ x: (i + 1) * (hall.len / (hall.guests + 1)) + (rng() - 0.5) * 200, v: (rng() < 0.5 ? -1 : 1) * (30 + rng() * 30), lower: i % 2 === 1, hue: i % 4 })),
      };
      mode = "play";
      ov.hidden = true;
      caption(hall.title, 2600);
      hintEl.hidden = true;
    }

    // ---- input -----------------------------------------------------------------------------------------
    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowDown: "wait", s: "wait", S: "wait", f: "force", F: "force", " ": "force" };
    on(window, "keydown", (e) => {
      if (mode !== "play") return;
      const k = KEYMAP[e.key];
      if (!k || e.ctrlKey || e.metaKey || e.altKey) return;
      keys[k] = true; setDown(k, true); e.preventDefault();
    });
    on(window, "keyup", (e) => { const k = KEYMAP[e.key]; if (k) { keys[k] = false; setDown(k, false); } });
    on(window, "blur", () => { for (const k in keys) { keys[k] = false; setDown(k, false); } });
    function setDown(k, v) { const b = pad.querySelector(`[data-b=${k}]`); if (b) b.classList.toggle("down", v); }
    pad.querySelectorAll("button").forEach((b) => {
      const k = b.dataset.b;
      on(b, "pointerdown", (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {} keys[k] = true; setDown(k, true); });
      const up = () => { keys[k] = false; setDown(k, false); };
      on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
    });

    // ---- the hall --------------------------------------------------------------------------------------
    function reflTarget() {
      const want = S.t - LAG;
      let x = S.hist.length ? S.hist[0].x : S.x;
      for (let i = 0; i < S.hist.length; i++) { if (S.hist[i].t <= want) x = S.hist[i].x; else break; }
      while (S.hist.length > 2 && S.hist[1].t <= want) S.hist.shift();
      return x;
    }
    function resolveRefusal(how) {
      const i = S.act, r = hall.refusals[i];
      S.act = -1; S.forceT = 0; S.stayT = 0;
      S.ref[i].state = "done"; S.catching = true;
      const crack = shared.get("cally.crack", 20);
      shared.set("cally.refusals", (shared.get("cally.refusals", 0) | 0) + 1);
      if (how === "force") {
        S.forced++; S.ref[i].mark = false;
        shared.set("cally.forced", (shared.get("cally.forced", 0) | 0) + 1);
        shared.set("cally.crack", clamp(crack - 5, 0, 100));
        caption("Forced on.", 1800);
      } else {
        S.stopped++; S.ref[i].mark = true;
        shared.set("cally.crack", clamp(crack + 10, 0, 100));
        if (hall.n === 2) shared.set("cally.bond_aegis", Math.max(0, (+shared.get("cally.bond_aegis", 0) || 0) - 3));
        caption("It walks on by itself.", 1800);
      }
      hintEl.hidden = true;
      void r;
    }
    function update(dt) {
      S.t += dt;
      const L = hall.len;
      // refusal in progress?
      const active = S.act >= 0;
      let dir = 0;
      if (!keys.wait && !keys.force) dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (active && keys.force) dir = 0;
      let nx = S.x + dir * SPEED * dt;
      nx = clamp(nx, 60, L);
      // doors hold her until the glass lets them
      for (let i = 0; i < hall.doors.length; i++) if (!S.doorOpen[i] && nx > hall.doors[i].x - 34 && S.x <= hall.doors[i].x - 34) { nx = hall.doors[i].x - 34; if (dir > 0 && !S.told) { S.told = true; caption("This door will not open from here. Look in the glass.", 3200); } }
      if (active) nx = Math.min(nx, S.rx + 170);
      S.moving = Math.abs(nx - S.x) > 0.01;
      if (dir) S.face = dir;
      S.x = nx;
      S.hist.push({ t: S.t, x: S.x });
      // the reflection
      if (!active) {
        const tgt = reflTarget();
        if (S.catching) { S.rx = Math.min(tgt, S.rx + 260 * dt); if (S.rx >= tgt - 0.5) S.catching = false; }
        else S.rx = tgt;
        for (let i = 0; i < hall.refusals.length; i++) {
          const f = S.ref[i];
          if (f.state === "wait" && S.rx >= hall.refusals[i].x) {
            f.state = "on"; S.act = i; S.rx = hall.refusals[i].x; S.forceT = 0; S.stayT = 0;
            hintEl.hidden = false;
            hintEl.innerHTML = "Hold <b>FORCE</b> (F) for two seconds, or <b>STAY</b>: stand still for three.";
            break;
          }
        }
      } else {
        const idle = !keys.force && !S.moving && !keys.left && !keys.right;
        if (keys.force) { S.forceT += dt; S.stayT = 0; } else { S.forceT = Math.max(0, S.forceT - 2 * dt); }
        if (idle) S.stayT += dt; else if (!keys.force) S.stayT = 0;
        if (S.forceT >= FORCE_T) resolveRefusal("force");
        else if (S.stayT >= STAY_T) resolveRefusal("stay");
      }
      // switches: the reflection has to stand on one
      for (let i = 0; i < hall.doors.length; i++) {
        if (S.doorOpen[i]) continue;
        if (Math.abs(S.rx - hall.doors[i].sw) < 55 && !S.moving) S.dwell[i] += dt; else if (Math.abs(S.rx - hall.doors[i].sw) >= 55) S.dwell[i] = Math.max(0, S.dwell[i] - dt);
        if (S.dwell[i] >= DWELL) { S.doorOpen[i] = true; caption("A door opens in the glass.", 1600); S.flash = 0.4; }
      }
      // cues
      hall.cams.forEach((cx, i) => {
        const c = S.cues[i];
        if (c.done) return;
        if (!c.live && S.x > cx - 520) { c.live = true; c.t = CUE_T; caption("The handler's cue. Be in the camera's view, and still.", 2600); }
        if (!c.live) return;
        c.t -= dt;
        if (Math.abs(S.x - cx) < 110 && !S.moving) c.pose += dt; else c.pose = Math.max(0, c.pose - dt);
        if (c.pose >= POSE) { c.done = true; c.ok = true; S.met++; S.flash = 0.5; caption("Watched.", 1400); }
        else if (c.t <= 0 || S.x > cx + 150) { c.done = true; c.ok = false; S.missed++; caption("Missed. It is on the record.", 1800); }
      });
      // frames print as she passes them; a frame the reflection stopped at stays unprinted
      const fi = Math.floor(S.x / FW);
      for (let i = 0; i < fi; i++) S.printed.add(i);
      S.flash = Math.max(0, S.flash - dt);
      // the end
      if (!S.ending && S.x >= L - 2 && S.rx >= L - 90 && S.act < 0) finish();
      if (!S.ending && S.x >= L - 2 && S.rx < L - 90 && S.act < 0) { S.catching = true; }
      S.cam += ((S.x - VW * 0.38) - S.cam) * Math.min(1, dt * 6);
      S.cam = clamp(S.cam, -VW * 0.2, L + 200 - VW * 0.6);
      if (S.moving) S.walkT += dt;
      for (const q of S.guests) { q.x += q.v * dt; if (q.x < 200 || q.x > L - 100) q.v = -q.v; }
    }
    function finish() {
      S.ending = true; mode = "over";
      store.set("done" + hall.n, true);
      shared.set("cally.missed_cues", (shared.get("cally.missed_cues", 0) | 0) + S.missed);
      const rec = `Cues met ${S.met} of ${hall.cams.length}; missed ${S.missed}. Refusals ${S.forced + S.stopped}: forced ${S.forced}, stopped with ${S.stopped}.`;
      const head = hall.n === 1
        ? "The glass hall ended at a meeting arranged to look like chance."
        : "The glass hall ended at the balcony, and she had a reflection to bring to it.";
      keysOff();
      later(() => { if (!dead) api.end({ outcome: "done", text: `${head} ${rec} A refusal is never explained.` }); }, RM ? 150 : 900);
    }
    function keysOff() { for (const k in keys) { keys[k] = false; setDown(k, false); } }

    // ---- drawing ---------------------------------------------------------------------------------------
    function tile(id, par) {
      const r = raster(id, 1920 * K, HW * K);
      const off = (S.cam * par) % 1920;
      if (r) { for (let i = -1; i < 2; i++) { const x = (i * 1920 - off) * K; if (x < cv.width && x + 1920 * K > 0) g.drawImage(r, x, 0); } return; }
      // fallback: flat panes
      for (let i = -1; i < 3; i++) {
        const bx = (i * 480 - (off % 480)) * K;
        g.fillStyle = TINTS[((Math.floor(off / 480) + i) % 4 + 4) % 4]; g.globalAlpha = id.indexOf("far") > -1 ? 0.35 : 0.15;
        g.fillRect(bx + 10 * K, 20 * K, 460 * K, (FLOOR - 20) * K);
        g.globalAlpha = 1;
      }
    }
    function wx(x) { return (x - S.cam) * K; }
    function figure(x, mirrored, pose, h) {
      // upright figure, feet at the floor line; the mirrored art is drawn already inverted: top edge on the line
      const w = h * 0.625;
      if (!mirrored) {
        if (!spr(pose, x - w / 2, FLOOR - h, w, h)) { g.fillStyle = INK; g.fillRect(wx(x - w / 4), (FLOOR - h) * K, (w / 2) * K, h * K); }
      } else if (!spr(pose, x - w / 2, FLOOR, w, h)) { g.fillStyle = CYAN; g.globalAlpha = 0.7; g.fillRect(wx(x - w / 4), FLOOR * K, (w / 2) * K, h * K); g.globalAlpha = 1; }
    }
    function draw() {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = PAPER; g.fillRect(0, 0, cv.width, cv.height);
      if (!S) { tile("reflection-run-glass-far".slice(15), 0); return; }
      tile("glass-far", 0.3); tile("glass-mid", 0.6);
      // the repeats: one frame per 240 units
      const f0 = Math.max(0, Math.floor(S.cam / FW)), f1 = Math.min(Math.ceil(hall.len / FW), Math.ceil((S.cam + VW) / FW));
      for (let i = f0; i <= f1; i++) {
        const fx = i * FW, printed = S.printed.has(i) && !frameRefused(i);
        const jx = ((i * 7) % 3 - 1) * 5;
        if (printed) {
          g.globalAlpha = 0.3; g.fillStyle = TINTS[i % 4]; g.fillRect(wx(fx + jx + 6), 6 * K, (FW - 12) * K, (HW - 12) * K); g.globalAlpha = 1;
          if (!spr("frame-printed", fx + jx, 0, FW, HW, 0.5)) { g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(wx(fx + jx + 6), 6 * K, (FW - 12) * K, (HW - 12) * K); }
          // the same figure, printed again, off register
          spr("cally-walk", fx + 60 - jx * 2, FLOOR - 120, 75, 120, 0.22);
        } else if (!spr("frame", fx, 0, FW, HW, frameRefused(i) ? 0.95 : 0.55)) { g.strokeStyle = INK; g.setLineDash([8 * K, 6 * K]); g.strokeRect(wx(fx + 6), 6 * K, (FW - 12) * K, (HW - 12) * K); g.setLineDash([]); }
      }
      // floor line
      g.fillStyle = INK; g.fillRect(0, (FLOOR - 2) * K, cv.width, 4 * K);
      // glass world tint under the floor
      g.fillStyle = CYAN; g.globalAlpha = 0.1; g.fillRect(0, FLOOR * K, cv.width, (HW - FLOOR) * K); g.globalAlpha = 1;
      tile("glass-near", 1.2); // the foreground glass: kept behind the figures so they always read
      // props and doors in her hall
      hall.doors.forEach((d, i) => {
        const open = S.doorOpen[i];
        if (!spr("door", d.x - 54, FLOOR - 200, 108, 200, open ? 0.25 : 1)) { g.fillStyle = INK; g.globalAlpha = open ? 0.25 : 1; g.fillRect(wx(d.x - 40), (FLOOR - 190) * K, 80 * K, 190 * K); g.globalAlpha = 1; }
        // the switch in the glass
        const lit = open || S.dwell[i] > 0;
        if (!spr("switch", d.sw - 25, FLOOR + 2, 50, 70, lit ? 1 : 0.7)) { g.fillStyle = lit ? YEL : INK; g.fillRect(wx(d.sw - 12), (FLOOR + 6) * K, 24 * K, 40 * K); }
        if (S.dwell[i] > 0 && !open) { g.fillStyle = YEL; g.fillRect(wx(d.sw - 25), (FLOOR + 78) * K, 50 * (S.dwell[i] / DWELL) * K, 6 * K); }
      });
      hall.refusals.forEach((r) => {
        const x = r.x + 44;
        if (r.kind === "door-rcc") {
          spr("door", x - 54, FLOOR - 200, 108, 200); spr("door-rcc", x - 55, FLOOR - 150, 110, 55);
        } else if (r.kind === "column") spr("column-rcc", x - 40, FLOOR - 200, 73, 200);
        else if (r.kind === "mural") spr("mural-sky", x - 110, FLOOR - 190, 220, 137);
        else spr("trolley-string", x - 60, FLOOR - 100, 120, 100);
      });
      hall.cams.forEach((cx, i) => {
        const c = S.cues[i];
        g.fillStyle = YEL; g.globalAlpha = c.live && !c.done ? 0.28 : 0.12;
        g.beginPath(); g.moveTo(wx(cx), 60 * K); g.lineTo(wx(cx - 110), FLOOR * K); g.lineTo(wx(cx + 110), FLOOR * K); g.closePath(); g.fill(); g.globalAlpha = 1;
        spr("camera-cue", cx - 34, 20, 68, 68, c.done && !c.ok ? 0.4 : 1) || (g.fillStyle = INK, g.fillRect(wx(cx - 24), 30 * K, 48 * K, 36 * K));
      });
      // guests drift in both worlds (hall 2)
      for (const q of S.guests) {
        g.fillStyle = TINTS[q.hue]; g.globalAlpha = 0.55;
        const gx = wx(q.x);
        if (!q.lower) g.fillRect(gx - 14 * K, (FLOOR - 110) * K, 28 * K, 110 * K); else g.fillRect(gx - 14 * K, FLOOR * K, 28 * K, 110 * K);
        g.globalAlpha = 1; g.beginPath(); g.arc(gx, (q.lower ? FLOOR + 118 : FLOOR - 118) * K, 10 * K, 0, 7); g.fill();
      }
      // Aegis across the glass, at the end
      if (S.x > hall.len - 900) spr("aegis", hall.len + 40 - 70, FLOOR - 170, 128, 170);
      // figures
      const bob = RM || !S.moving ? 0 : Math.round(Math.abs(Math.sin(S.walkT * 9)) * 3);
      const stepA = Math.floor(S.walkT * 5) % 2 === 0;
      const act = S.act >= 0;
      const posC = S.moving && stepA ? "cally-walk" : S.moving ? "cally-walk" : "cally-wait";
      g.save();
      if (S.face < 0) { g.translate(wx(S.x) * 2, 0); g.scale(-1, 1); }
      figure(S.x, false, S.moving && !stepA ? "cally-wait" : posC, 150); // Cally
      g.restore();
      void bob;
      // the reflection
      const rpose = act ? "reflect-refuse" : "reflect-walk";
      const rmove = !act && (S.moving || S.catching);
      g.save();
      if (S.face < 0 && !act) { g.translate(wx(S.rx) * 2, 0); g.scale(-1, 1); }
      g.translate(0, rmove && !RM ? Math.sin(S.walkT * 9 + 1) * 2 * K : 0);
      figure(S.rx, true, rpose, 150);
      g.restore();
      // refusal prompts
      if (act) {
        const x = S.rx + 110;
        spr("force", x - 40 - 60, FLOOR + 40, 80, 80, 1) || (g.fillStyle = ORG, g.fillRect(wx(x - 100), (FLOOR + 40) * K, 80 * K, 80 * K));
        spr("stop", x + 30, FLOOR + 40, 80, 80, 1) || (g.fillStyle = CYAN, g.fillRect(wx(x + 30), (FLOOR + 40) * K, 80 * K, 80 * K));
        g.fillStyle = INK; g.fillRect(wx(x - 100), (FLOOR + 124) * K, 80 * K, 8 * K); g.fillRect(wx(x + 30), (FLOOR + 124) * K, 80 * K, 8 * K);
        g.fillStyle = ORG; g.fillRect(wx(x - 100), (FLOOR + 124) * K, 80 * clamp(S.forceT / FORCE_T, 0, 1) * K, 8 * K);
        g.fillStyle = CYAN; g.fillRect(wx(x + 30), (FLOOR + 124) * K, 80 * clamp(S.stayT / STAY_T, 0, 1) * K, 8 * K);
      }
      // cue ring
      const live = S.cues.findIndex((c) => c.live && !c.done);
      if (live >= 0) {
        const c = S.cues[live], cx = cv.width - 56 * K, cy = 56 * K;
        spr("camera-cue", (cx / K) - 36 + S.cam, 20, 72, 72);
        g.lineWidth = 7 * K; g.strokeStyle = INK; g.beginPath(); g.arc(cx, cy, 46 * K, 0, 7); g.stroke();
        g.strokeStyle = MAG; g.beginPath(); g.arc(cx, cy, 46 * K, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(c.t / CUE_T, 0, 1)); g.stroke();
        g.strokeStyle = CYAN; g.beginPath(); g.arc(cx, cy, 36 * K, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(c.pose / POSE, 0, 1)); g.stroke();
      }
      if (S.flash > 0 && !RM) { g.fillStyle = YEL; g.globalAlpha = S.flash * 0.35; g.fillRect(0, 0, cv.width, cv.height); g.globalAlpha = 1; }
      // progress strip along the bottom: the repeats filling with colour
      const n = Math.ceil(hall.len / FW);
      for (let i = 0; i < n; i++) {
        g.fillStyle = S.printed.has(i) && !frameRefused(i) ? TINTS[i % 4] : PAPER;
        g.globalAlpha = 0.9; g.fillRect((i / n) * cv.width, cv.height - 7 * K, (cv.width / n) - 2 * K, 5 * K);
      }
      g.globalAlpha = 1;
    }
    function frameRefused(i) {
      if (!S) return false;
      return hall.refusals.some((r, k) => S.ref[k].mark && Math.floor(r.x / FW) === i);
    }

    let last = 0;
    function frame(ts) {
      if (dead) return;
      const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
      last = ts;
      if (S && mode === "play") update(dt);
      else if (S && S.ending) { S.t += dt; S.cam += 0; }
      draw();
      raf = requestAnimationFrame(frame);
    }

    // ---- the how-to card -------------------------------------------------------------------------------
    function intro() {
      mode = "intro"; keysOff(); S = null;
      const cards = HALLS.map((h, i) => `<button type="button" data-p="${i}" aria-pressed="${i === hallIx}">${h.n}. ${esc(h.title)}<small>${esc(h.chapter)}${store.get("done" + h.n, false) ? " · played" : ""}</small></button>`).join("");
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-label="Reflection run: how to play">
        <div class="${P}kick" data-k></div>
        <h2>Reflection run</h2>
        <blockquote class="${P}q">“${esc(QUOTE)}”</blockquote>
        <div class="${P}pages" role="group" aria-label="Choose a hall">${cards}</div>
        <p data-scene></p>
        <p><b>Goal.</b> <span data-goal></span></p>
        <ul class="${P}keys">
          <li><b>Move</b><span>D · → · ▶ walks right. Your reflection follows a third of a second behind.</span></li>
          <li><b>Wait</b><span>S · ↓ · Wait, or just let go. Some doors open only when your reflection stands still on a switch in the glass.</span></li>
          <li><b>Cue</b><span>When the camera icon rings, stand still in its yellow view until the inner ring fills. A missed cue is kept on the record.</span></li>
          <li><b>Force</b><span>Hold F · Space · Force. If the reflection stops and turns away, hold for two seconds to drag it on, or stay still for three and it walks on alone.</span></li>
        </ul>
        <button type="button" class="${P}go">Start</button></div>`;
      ov.hidden = false;
      const sync = () => {
        const h = HALLS[hallIx];
        ov.querySelector("[data-k]").textContent = h.chapter;
        ov.querySelector("[data-scene]").textContent = h.scene;
        ov.querySelector("[data-goal]").textContent = h.goal;
        ov.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === hallIx)));
      };
      ov.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { hallIx = +b.dataset.p; sync(); }));
      ov.querySelector("." + P + "go").addEventListener("click", startHall);
      sync();
      ov.querySelector("." + P + "go").focus({ preventScroll: true });
      hall = HALLS[hallIx];
      S = { t: 0, x: 90, rx: 90, hist: [], cam: -VW * 0.1, walkT: 0, face: 1, moving: false, act: -1, forceT: 0, stayT: 0, doorOpen: hall.doors.map(() => false), dwell: hall.doors.map(() => 0), cues: hall.cams.map(() => ({ live: false, t: 0, pose: 0, done: false, ok: false })), ref: hall.refusals.map(() => ({ state: "wait", mark: false })), printed: new Set(), guests: [], flash: 0, catching: false };
    }
    caption("", 0);
    intro();
    artReady.then(() => { if (!dead) for (const k in RAST) delete RAST[k]; });
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        dead = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        timers.forEach(clearTimeout); timers.clear();
        clearTimeout(capTimer);
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const k in RAST) delete RAST[k];
        wrap.remove();
      },
    };
  },
};

// Project: Man Eater — Silhouette halls (2D, scroll). Graphic style: shadow puppetry.
// DESIGN.md section 10, Mode A, cut to one sequence (n4_halls: bunk to the officers' wing, two guards,
// and the 22:30 check that walks every hall once). Black cut-outs on a lit cream sheet. A guard's
// flashlight that holds Fisk's body OR his shadow for 1.5 s raises the alarm; the shadow is his height
// x 1.6 and falls away from the nearest window. Crouching shortens it by 40%. An eater (change 33+)
// can climb to the pipes at 2.7 m. Listening (stand still) shows every guard's footfalls for 2 s.
// The side doors ("interact to open a door") are added for this page: two unlocked rooms to slip into.
//
// Actions: walk, crouch (and hide in an alcove), listen, slip through a side door (2), climb (eater).
// Beats: the opening, the drains, the 22:30 check, the call under the floor, the roster.
// The one quotation is DESIGN.md section 3, beat 6, line 30, verbatim and cited.

const P = { ink: "#1B1D1F", cream: "#D9D2BF", snow: "#EEF1F2", print: "#7C8C99" };
const CEIL = 4.57, PIPE_Y = 2.7, LEN = 112, DOOR_X = 107;
const WINDOWS = [4, 16, 28, 40, 52, 64, 76, 88, 100];
const PIPES = [[18, 37], [56, 80], [86, 101]];
const POOLS = [[30, 2.4], [67, 2.4], [95, 2.2]];
const DRAINS = [13, 47, 73, 90];
const ALCOVES = [[9, 1.3], [23, 1.3], [34, 1.3], [45, 1.3], [52, 1.3], [61, 1.3], [70, 1.3], [83, 1.3], [98, 1.3]];
const SIDE_DOORS = [23, 52, 83]; // alcoves whose door is unlocked tonight
const JUNCTIONS = [2, 42, 78];
const GUARDS = [
  { a: 25, b: 44, x: 40, dir: -1 },
  { a: 58, b: 88, x: 62, dir: 1 },
];
const CHECK_AT = 40; // passing here starts the 22:30 check from the east end
const CALL_LINE = "“Low melodic groaning, almost flute-like”";

export default {
  mount(root, api) {
    const K = "man-eater-silhouette-halls-";
    const reduce = api.reducedMotion;
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    // a cut-out man and his taller shadow, for the playbill
    const puppet = (x, h, o) => `<g transform="translate(${x} 92) scale(${h / 180})" opacity="${o}"><path d="M-27-152H27L20-86H-20Z M-14-90 2-90-6-48 4 0-12 0-14-48Z M6-90 20-90 22-48 30 0 14 0 10-48Z M-26-148-14-148-22-100-30-88-38-92Z M14-148 26-148 34-100 38-88 30-86Z"/><circle cx="4" cy="-168" r="18"/></g>`;
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;background:${P.ink};color:${P.cream};font-family:'Courier Prime','Courier New',monospace;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .${K}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,29,31,.86);z-index:3;padding:16px;overflow:auto}
      .${K}bill{position:relative;width:min(520px,100%);box-sizing:border-box;color:${P.ink};padding:30px 24px 20px;background:radial-gradient(ellipse at 50% 30%,${P.snow} 0%,${P.cream} 55%,#b8b1a0 100%);box-shadow:0 0 0 10px ${P.ink},0 24px 60px rgba(0,0,0,.7)}
      .${K}bill::before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:radial-gradient(circle at 50% 0,${P.ink} 10px,transparent 11px) 0 0/24px 16px repeat-x}
      .${K}bill::after{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(27,29,31,.07) 1px,transparent 1.2px);background-size:5px 5px;mix-blend-mode:multiply}
      .${K}kick{margin:0;font-size:12px;letter-spacing:.24em;text-transform:uppercase}
      .${K}bill h2{margin:4px 0 6px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(28px,7vw,38px);line-height:1;letter-spacing:.04em;text-transform:uppercase}
      .${K}goal{margin:0 0 10px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 12px;font-size:14px;line-height:1.45;font-style:italic}
      .${K}puppets{position:absolute;right:18px;bottom:22px;width:84px;height:100px;fill:${P.ink}}
      .${K}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 12px;font-size:14px;line-height:1.3;position:relative;z-index:1}
      .${K}key dt{font-weight:700;white-space:nowrap}
      .${K}key dt span{display:inline-block;background:${P.ink};color:${P.cream};padding:1px 6px;margin-right:3px;font-size:13px}
      .${K}key dd{margin:0}
      .${K}rule{margin:0 0 4px;font-size:14px;line-height:1.4;border-top:1.5px solid ${P.ink};padding-top:8px}
      .${K}row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;position:relative;z-index:1}
      .${K}row button,.${K}pad button{font:inherit;font-weight:700;background:${P.ink};color:${P.cream};border:0;padding:11px 14px;cursor:pointer;letter-spacing:.04em;font-size:15px}
      .${K}row button:hover{background:#34373a}
      .${K}row button:focus-visible,.${K}pad button:focus-visible{outline:3px solid #D9A441;outline-offset:2px}
      .${K}row button small{display:block;font-weight:400;opacity:.85;font-size:12px}
      .${K}row label{display:flex;gap:8px;align-items:center;font-size:14px;flex-basis:100%}
      .${K}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:8px;padding:10px 12px;z-index:2;pointer-events:none}
      .${K}pad div{display:flex;gap:8px;pointer-events:auto}
      .${K}pad button{min-width:54px;min-height:50px;background:rgba(27,29,31,.82);border:1px solid rgba(217,210,191,.5);font-size:14px;touch-action:none;transition:background .1s,color .1s,opacity .3s}
      .${K}pad button:hover{background:rgba(217,210,191,.18)}
      .${K}pad button.on{background:${P.cream};color:${P.ink}}
      .${K}pad button[hidden]{display:none}
      .${K}pad button.new{animation:${K}new 1s ease-in-out 3}
      @keyframes ${K}new{50%{background:${P.cream};color:${P.ink}}}
      @media (pointer:fine) and (min-width:900px){.${K}pad{opacity:.7}}
      @media (max-width:520px){.${K}pad{padding:8px;gap:6px}.${K}pad div{gap:4px}.${K}pad button{min-width:46px;padding:6px 7px;font-size:13px}.${K}puppets{display:none}}
    </style>
    <canvas aria-label="Side view of a tall hall at night, drawn as shadow puppetry"></canvas>
    <div class="${K}pad">
      <div><button data-k="left" aria-label="Walk west">◀</button><button data-k="right" aria-label="Walk east">▶</button></div>
      <div><button data-k="down" aria-label="Crouch (hold)">Crouch</button><button data-k="listen" aria-label="Listen (hold)" hidden>Listen</button><button data-k="act" aria-label="Side door" hidden>Door</button><button data-k="up" aria-label="Climb or drop" hidden>Climb</button></div>
    </div>
    <div class="${K}intro"><div class="${K}bill">
      <svg class="${K}puppets" viewBox="0 0 84 100" aria-hidden="true">${puppet(54, 150, 0.35)}${puppet(30, 90, 1)}</svg>
      <p class="${K}kick">Shadow theatre · Night 4 · 22:10</p>
      <h2>Silhouette halls</h2>
      <p class="${K}goal">Reach the officers' wing door at the east end of the hall.</p>
      <p class="${K}beat">Jax counted the chairs at supper. The transfer roster is kept in the officers' wing, and nobody has said where Pell and Duarte went.</p>
      <dl class="${K}key">
        <dt><span>◀ ▶</span> or A D</dt><dd>walk the hall</dd>
        <dt><span>S</span> Crouch</dt><dd>shorten your shadow; crouch in a door alcove to leave the light</dd>
      </dl>
      <p class="${K}rule">A flashlight that holds your body <b>or your shadow</b> for 1.5 s raises the alarm. More actions come as you go.</p>
      <div class="${K}row">
        <button data-c="8">Start as a refuser<small>change 8 · 1.91 m · no climbing</small></button>
        <button data-c="52">Start as an eater<small>change 52 · 2.61 m · climbs, longer shadow</small></button>
        ${losses >= 2 ? `<label><input type="checkbox" data-easy checked> Slower alarm (2.4 s) and a third retry, after two walks back</label>` : ""}
      </div>
    </div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const intro = wrap.querySelector("." + K + "intro");
    const padOf = (k) => wrap.querySelector(`.${K}pad [data-k="${k}"]`);

    let W = 0, H = 0, dpr = 1, grain = null;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!grain) makeGrain();
      draw();
    };
    const ro = new ResizeObserver(resize);
    // the sheet's weave: a small tile of fibre and slub, drawn once
    function makeGrain() {
      const g = document.createElement("canvas"); g.width = 128; g.height = 128;
      const c = g.getContext("2d"), rnd = api.rng(11);
      for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(27,29,31,${0.02 + rnd() * 0.05})`; c.fillRect(rnd() * 128, rnd() * 128, 1 + rnd() * 2, 1); }
      for (let y = 0; y < 128; y += 3) { c.fillStyle = "rgba(27,29,31,.025)"; c.fillRect(0, y, 128, 1); }
      grain = ctx.createPattern(g, "repeat");
    }

    // ---- state
    let change = 8, heightM = 1.91, strength = 54, alarmT = 1.5;
    let s = null;
    let running = false, over = false, raf = 0, last = 0;
    const keys = { left: false, right: false, down: false, listen: false };
    const timeouts = [];
    const unlocked = { listen: false, act: false, up: false };

    function newRun(c, easy) {
      change = c;
      heightM = 1.78 + 0.016 * change;
      strength = 50 + 0.5 * change;
      alarmT = easy ? 2.4 : 1.5;
      s = {
        x: 2, onPipe: false, facing: 1, step: 0, warmth: 100, retries: easy ? 3 : 2, checkpoint: 2,
        guards: GUARDS.map(freshGuard), check: null, checkDone: false,
        listen: 0, drainOn: -1, msg: "", msgT: 0, flash: 0, shake: 0, t: 0, clock: 22 * 60 + 10,
        doors: 2, inRoom: null, roomT: 0, beats: {}, seenMax: 0, cleared: 0, banner: "", bannerT: 0, climbed: false, drainT: {},
      };
    }
    const freshGuard = (g) => ({ ...g, seen: 0, pause: 0, paused: false, pausePt: g.a + rng() * (g.b - g.a), step: 0 });
    function resetToCheckpoint() {
      s.x = s.checkpoint; s.onPipe = false; s.drainOn = -1; s.inRoom = null;
      s.warmth = Math.max(s.warmth, 50); // a walk back to the junction, and a minute against the radiator
      s.guards = GUARDS.map(freshGuard);
      if (s.check) s.check = { x: Math.min(LEN - 2, s.x + 26), dir: -1, seen: 0, step: 0, a: 0, b: LEN, pause: 0 };
    }
    const say = (m, t = 3.5) => { s.msg = m; s.msgT = t; };
    const banner = (m, t = 2) => { s.banner = m; s.bannerT = t; };
    const beat = (id, m, t = 5.5) => { if (s.beats[id]) return false; s.beats[id] = true; say(m, t); return true; };
    function unlock(k, line) {
      if (unlocked[k]) return;
      unlocked[k] = true;
      const b = padOf(k); b.hidden = false; if (!reduce) b.classList.add("new");
      say(line, 5);
    }

    // ---- geometry helpers
    const crouched = () => keys.down && !s.onPipe && !s.inRoom;
    const pipeAt = (x) => PIPES.some(([a, b]) => x >= a && x <= b);
    const alcoveAt = (x) => ALCOVES.find(([a, w]) => x >= a - 0.2 && x <= a + w + 0.2);
    const sideDoorAt = (x) => { const al = alcoveAt(x); return al && SIDE_DOORS.includes(al[0]) ? al[0] : null; };
    const poolAt = (x) => POOLS.some(([a, w]) => x >= a && x <= a + w);
    const nearestWindow = (x) => WINDOWS.reduce((b, w) => (Math.abs(w - x) < Math.abs(b - x) ? w : b), WINDOWS[0]);
    function bodyBase() { return s.onPipe ? PIPE_Y + 0.08 : 0; }
    function bodyH() { return s.onPipe ? heightM * 0.45 : crouched() ? heightM * 0.6 : heightM; }
    function shadowGeom() {
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
    const allGuards = () => (s.check ? [...s.guards, s.check] : s.guards);

    // ---- update
    function update(dt) {
      s.t += dt; s.clock += dt * 0.25; // a page minute is four seconds of hall time
      if (s.msgT > 0) s.msgT -= dt;
      if (s.bannerT > 0) s.bannerT -= dt;
      if (s.flash > 0) s.flash -= dt;
      if (s.shake > 0) s.shake -= dt;
      if (s.t > 7 && !unlocked.listen) unlock("listen", "NEW · Listen (hold Space): stand still, and the guards' footfalls show on the floor line, even beyond the sheet.");
      // inside a side room: hidden, cold, and the room's sleeper stirs
      if (s.inRoom != null) {
        s.roomT += dt;
        s.warmth -= ((12 - change / 10) / 60) * dt * 1.5;
        if (s.roomT > 8) { leaveRoom(); say("Someone turns over in the dark room. You step back out before he wakes."); }
      } else {
        let v = 0;
        const dir = keys.listen ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        if (dir) {
          let sp = s.onPipe ? 0.6 : crouched() ? 0.6 : 1.4 + 0.008 * strength;
          if (change >= 40 && dir > 0) sp *= 0.7; // walking away from the call, which is behind him
          v = dir * sp;
          s.facing = dir;
        }
        const nx = Math.max(0.5, Math.min(LEN - 1, s.x + v * dt));
        if (s.onPipe && !pipeAt(nx)) { s.onPipe = false; say("The pipe ends. You drop to the floor."); }
        s.x = nx;
        s.step += Math.abs(v) * dt * 2.2;
      }
      // unlocks by place
      if (!unlocked.act && sideDoorAt(s.x) != null) unlock("act", "NEW · Door (E): this side door is unlocked. Slip into the dark room until the light passes. Two doors tonight.");
      if (!unlocked.up && change >= 33 && pipeAt(s.x)) unlock("up", "NEW · Climb (W): the pipes run at 2.7 m. You are tall enough now. Up there the light passes under you.");
      // checkpoints
      for (const j of JUNCTIONS) if (s.x >= j && j > s.checkpoint) { s.checkpoint = j; s.cleared++; banner(`JUNCTION ${s.cleared} · RETRIES RESUME HERE`); }
      // drains
      const di = DRAINS.findIndex((d) => Math.abs(d - s.x) < 0.45);
      if (!s.onPipe && !s.inRoom && di >= 0 && di !== s.drainOn && s.t - (s.drainT[di] ?? -99) > 10) {
        s.drainT[di] = s.t;
        s.warmth -= 10; s.flash = 0.4;
        if (!beat("drain", "A floor drain. The cold comes up through the grating, from below the floor, not from outside. Warmth −10.")) say("A floor drain. Warmth −10.");
      }
      s.drainOn = s.onPipe ? -1 : di;
      s.warmth -= ((12 - change / 10) / 60) * dt;
      if (s.listen > 0) s.listen -= dt;
      if (keys.listen && unlocked.listen) s.listen = 2;
      // the 22:30 check: a third guard walks the whole hall once, east to west
      if (!s.check && !s.checkDone && s.x >= CHECK_AT) {
        s.check = { x: LEN - 1, dir: -1, seen: 0, step: 0, a: 0, b: LEN, pause: 0, check: true };
        s.clock = Math.max(s.clock, 22 * 60 + 30);
        say("22:30. Keys at the east end: the check. One guard walks the whole hall, once, toward you. Get off the floor or out of the light.", 6);
        banner("22:30 · THE CHECK");
      }
      if (s.x >= 78 && !s.beats.call) beat("call", `Under the floor, the sound again: ${CALL_LINE} (line 30). It is behind you now, west and down.`, 6);
      // guards
      const sh = shadowGeom();
      const al = alcoveAt(s.x);
      const hidden = s.inRoom != null || (al && crouched());
      const base = bodyBase(), bh = bodyH();
      const bodyPts = hidden ? [] : [[s.x, base + bh * 0.92], [s.x, base + bh * 0.55], [s.x, base + bh * 0.15]];
      const shPts = hidden ? [] : [0.25, 0.5, 0.75, 1].map((f) => [sh.foot + (sh.top - sh.foot) * f, sh.base + sh.len * f]);
      let worst = 0;
      for (const g of allGuards()) {
        if (g.check) {
          g.x += g.dir * 1.25 * dt; g.step += 1.25 * dt * 2.2;
          if (g.x < 1) { s.check = null; s.checkDone = true; banner("THE CHECK HAS PASSED"); say("The check's footsteps go round the corner at the bunk end. The hall is yours again."); continue; }
        } else if (g.pause > 0) { g.pause -= dt; }
        else {
          g.x += g.dir * 1.1 * dt; g.step += 1.1 * dt * 2.2;
          if (!g.paused && Math.abs(g.x - g.pausePt) < 0.1) { g.paused = true; g.pause = 2 + rng() * 2; }
          if (g.x > g.b) { g.x = g.b; g.dir = -1; g.paused = false; g.pausePt = g.a + rng() * (g.b - g.a); }
          if (g.x < g.a) { g.x = g.a; g.dir = 1; g.paused = false; g.pausePt = g.a + rng() * (g.b - g.a); }
        }
        let hit = false, by = "";
        if (bodyPts.some(([px, py]) => inCone(g, px, py))) { hit = true; by = "body"; }
        else if (shPts.some(([px, py]) => inCone(g, px, py))) { hit = true; by = "shadow"; }
        else if (!hidden && !s.onPipe && poolAt(s.x) && (s.x - g.x) * g.dir > 0 && Math.abs(s.x - g.x) < 14) { hit = true; by = "pool"; }
        if (hit) { g.seen += dt; g.by = by; } else g.seen = Math.max(0, g.seen - dt * 0.6);
        worst = Math.max(worst, g.seen / alarmT);
        if (g.seen >= alarmT) return caught(g.by === "shadow" ? (g.check ? "The check's flashlight found your shadow on the wall before it found you." : "He saw your shadow first.") : g.by === "pool" ? "You stood in the light from a door pane." : "The flashlight held you.");
      }
      s.alarm = worst; s.seenMax = Math.max(s.seenMax, worst);
      if (s.warmth <= 0) return caught("The cold took your legs.");
      if (s.x >= DOOR_X - 2 && !s.onPipe && !s.beats.door) beat("door", "The officers' wing door. Two handles: the high steel lever, and the brass knob below it. Press E (Door).", 4);
    }
    function caught(why) {
      s.shake = reduce ? 0 : 0.5; s.flash = 0.7;
      if (s.retries > 0) {
        s.retries--;
        say(`${why} You are back at the last junction (${s.retries} ${s.retries === 1 ? "retry" : "retries"} left).`, 4.5);
        banner("SEEN · BACK TO THE JUNCTION");
        resetToCheckpoint();
        return;
      }
      api.store.set("losses", losses + 1);
      finish(false, `${why} Two orderlies walk Fisk back to the bunk and do not say a word on the way. Suspicion +20; the curfew break is logged as seen, and the roster stays in a room you have not been in.`);
    }
    function finish(win, text) {
      if (over) return;
      over = true; running = false;
      cancelAnimationFrame(raf);
      draw();
      api.end({ outcome: win ? "win" : "lose", text });
    }
    function enterRoom(d) {
      if (s.doors <= 0) { say("This door is locked. The other side doors are spent for tonight."); return; }
      s.doors--; s.inRoom = d; s.roomT = 0; s.x = d + 0.65; s.onPipe = false;
      say(`Inside. A dark bunk room; someone breathes slowly by the wall. Wait for the light to pass, then E to step out (${s.doors} door${s.doors === 1 ? "" : "s"} left).`, 5);
    }
    function leaveRoom() { s.inRoom = null; }
    function act() {
      if (!running) return;
      if (s.inRoom != null) { leaveRoom(); say("You step back into the hall."); return; }
      if (s.x >= DOOR_X - 2 && !s.onPipe) {
        api.store.set("losses", 0);
        const how = s.climbed ? "You came most of the way above the light, along the pipes, with the shadow ahead of you on the ceiling." : "You came the whole way on the floor, short and slow, and the shadow never reached the light.";
        return finish(true, `The brass knob turns. On the duty desk the transfer roster lies open: the empty chairs by seat number, each with a date and the same word typed beside it, “transferred”. ${how} Warmth ${Math.round(s.warmth)}.`);
      }
      const d = sideDoorAt(s.x);
      if (d != null && !s.onPipe) return enterRoom(d);
      if (alcoveAt(s.x)) say("This door is locked. Crouch in the alcove instead.");
      else say("No door here.");
    }
    function climb() {
      if (!running || s.inRoom != null) return;
      if (s.onPipe) { s.onPipe = false; say("You drop to the floor."); return; }
      if (!pipeAt(s.x)) { say("No pipe overhead here."); return; }
      if (heightM < 2.3) { say("The pipes are at 2.7 m. You cannot reach them. You are not tall enough yet."); return; }
      s.onPipe = true; s.climbed = true;
      if (!beat("pipe", "You pull yourself up onto the pipes. From here your shadow lies along the ceiling, longer than you are.")) say("Up on the pipes.");
    }

    // ---- drawing
    function fig(x, base, h, stride, color, opts = {}) {
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
      // the puppet's rod, as in a shadow theatre: a thin stick from the hand to below the stage
      if (opts.rod) { ctx.fillRect(x + 16 * k * face, base - Y(95), 1.5, Y(95) + 30); }
    }
    function wrapText(text, maxW) {
      const words = text.split(" "), lines = [];
      let line = "";
      for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
      if (line) lines.push(line);
      return lines;
    }
    const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;

    function draw() {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
      if (!s) newRun(8);
      const narrow = W < 560;
      const hudH = 82, padH = 78, capH = narrow ? 86 : 74;
      const avail = H - hudH - padH - capH;
      const viewMeters = Math.max(6, Math.min(14, W / 70));
      const scale = Math.max(30, Math.min(avail / (CEIL + 0.45), W / viewMeters));
      const sheetTop = hudH + Math.max(6, (avail - (CEIL + 0.45) * scale) / 2);
      const floorY = sheetTop + (CEIL + 0.25) * scale;
      const viewM = W / scale;
      let camX = s.x - viewM * 0.38;
      camX = Math.max(0, Math.min(LEN - viewM, camX));
      ctx.save();
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * s.shake, 0);
      const sx = (m) => (m - camX) * scale;
      const sy = (m) => floorY - m * scale;
      const top = sy(CEIL);
      // the sheet: cream, moonlit high up by the windows, with its weave
      ctx.fillStyle = "#b3ac9b"; ctx.fillRect(0, top, W, floorY - top);
      for (const w of WINDOWS) {
        const cx = sx(w);
        if (cx < -scale * 6 || cx > W + scale * 6) continue;
        const g = ctx.createRadialGradient(cx, sy(3.5), 4, cx, sy(2.2), scale * 5.5);
        g.addColorStop(0, "rgba(238,241,242,.95)"); g.addColorStop(0.45, "rgba(217,210,191,.78)"); g.addColorStop(1, "rgba(217,210,191,0)");
        ctx.fillStyle = g; ctx.fillRect(cx - scale * 6, top, scale * 12, floorY - top);
        ctx.fillStyle = "rgba(238,241,242,.95)";
        ctx.fillRect(cx - scale * 0.45, sy(3.85), scale * 0.9, scale * 0.65);
        ctx.strokeStyle = "rgba(27,29,31,.45)"; ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - scale * 0.45, sy(3.85), scale * 0.9, scale * 0.65);
        ctx.beginPath(); ctx.moveTo(cx, sy(3.85)); ctx.lineTo(cx, sy(3.2)); ctx.stroke();
      }
      if (grain) { ctx.fillStyle = grain; ctx.fillRect(0, top, W, floorY - top); }
      // alcoves and doors (the high steel lever and the later brass knob); unlocked side doors marked ajar
      for (const [a, w] of ALCOVES) {
        const x0 = sx(a); if (x0 > W || x0 + w * scale < 0) continue;
        const side = SIDE_DOORS.includes(a);
        const open = s.inRoom === a;
        ctx.fillStyle = "rgba(27,29,31,.24)"; ctx.fillRect(x0, sy(3.2), w * scale, 3.2 * scale);
        ctx.strokeStyle = "rgba(27,29,31,.6)"; ctx.lineWidth = 2; ctx.strokeRect(x0 + 3, sy(3.1), w * scale - 6, 3.1 * scale);
        if (open) { ctx.fillStyle = P.ink; ctx.fillRect(x0 + 3, sy(3.1), w * scale - 6, 3.1 * scale); }
        else if (side && unlocked.act && s.doors > 0) { ctx.fillStyle = P.ink; ctx.fillRect(x0 + w * scale - 9, sy(3.1), 4, 3.1 * scale); }
        ctx.fillStyle = P.ink; ctx.fillRect(x0 + w * scale - 12, sy(2.4), 8, 3); ctx.beginPath(); ctx.arc(x0 + w * scale - 10, sy(1.1), 3, 0, 7); ctx.fill();
      }
      // the target door
      { const x0 = sx(DOOR_X - 0.6); ctx.fillStyle = "rgba(27,29,31,.8)"; ctx.fillRect(x0, sy(3.6), 1.3 * scale, 3.6 * scale);
        ctx.fillStyle = P.cream; ctx.font = `700 ${Math.max(12, scale * 0.17)}px 'Stardos Stencil','Courier Prime',monospace`; ctx.textAlign = "center";
        ctx.fillText("OFFICERS", x0 + 0.65 * scale, sy(2.9)); ctx.fillText("WING", x0 + 0.65 * scale, sy(2.6)); ctx.textAlign = "start"; }
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
      for (const d of DRAINS) { const cx = sx(d); ctx.fillStyle = P.print; for (let i = -3; i <= 3; i++) ctx.fillRect(cx + i * 4 - 1, floorY + 2, 2, 7); }
      // guards' cones
      ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, floorY - top + 3); ctx.clip();
      for (const g of allGuards()) {
        const lx = sx(g.x + g.dir * 0.35), ly = sy(1.3), len = 10 * scale;
        const a0 = 0.14 - 0.28, a1 = 0.14 + 0.28;
        const gr = ctx.createLinearGradient(lx, ly, lx + g.dir * len, ly);
        const hot = g.seen > 0 ? 0.97 : 0.8;
        gr.addColorStop(0, `rgba(238,241,242,${hot})`); gr.addColorStop(1, "rgba(238,241,242,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(lx, ly);
        ctx.lineTo(lx + g.dir * Math.cos(a0) * len, ly + Math.sin(a0) * len);
        ctx.lineTo(lx + g.dir * Math.cos(a1) * len, ly + Math.sin(a1) * len); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // Fisk's shadow: the second, taller body on the sheet
      if (s.inRoom == null) {
        const sh = shadowGeom();
        ctx.save();
        if (!reduce) ctx.filter = "blur(3px)";
        ctx.translate(sx(sh.foot), sy(sh.base));
        ctx.transform(1, 0, -((sh.top - sh.foot) * scale) / (sh.len * scale), 1, 0, 0);
        ctx.globalAlpha = s.alarm > 0.05 ? 0.6 : 0.45;
        fig(0, 0, sh.len * scale * (crouched() ? 1 / 0.62 : 1), Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing });
        ctx.restore();
      }
      for (const g of allGuards()) {
        const gs = Math.max(-3, Math.min(3, (g.x - nearestWindow(g.x)) * 0.9));
        ctx.save(); if (!reduce) ctx.filter = "blur(3px)"; ctx.globalAlpha = 0.3;
        ctx.translate(sx(g.x + gs * 0.25), floorY); ctx.transform(1, 0, -(gs * 0.75) / (1.8 * 1.6), 1, 0, 0);
        fig(0, 0, 1.8 * 1.6 * scale, Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true }); ctx.restore();
      }
      // the cut-outs, on their rods
      for (const g of allGuards()) {
        fig(sx(g.x), floorY, 1.8 * scale, g.pause > 0 ? 0 : Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true, rod: true });
        if (g.seen > 0.05) {
          const f = Math.min(1, g.seen / alarmT);
          ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx(g.x), sy(2.3), 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
          ctx.fillStyle = P.ink; ctx.font = "700 18px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText(f > 0.66 ? "!" : "?", sx(g.x), sy(2.3) + 6); ctx.textAlign = "start";
        }
      }
      if (s.inRoom == null) {
        if (s.onPipe) { ctx.save(); ctx.translate(sx(s.x), sy(PIPE_Y + 0.08)); fig(0, 0, heightM * scale * 0.75, Math.sin(s.step) * 0.3, P.ink, { crouch: true, face: s.facing }); ctx.restore(); }
        else fig(sx(s.x), floorY, heightM * scale, Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing, rod: true });
        // a hidden marker: the alcove swallows him
        if (alcoveAt(s.x) && crouched()) { ctx.strokeStyle = P.ink; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.strokeRect(sx(alcoveAt(s.x)[0]) + 1, sy(3.2), 1.3 * scale - 2, 3.2 * scale); ctx.setLineDash([]); }
      }
      // listening: footfalls on the floor line, even off the sheet
      if (s.listen > 0) {
        ctx.font = "700 13px 'Courier Prime',monospace";
        for (const [gi, g] of allGuards().entries()) {
          const gx = sx(g.x);
          const cx = Math.max(14, Math.min(W - 14, gx));
          ctx.fillStyle = P.snow;
          for (let i = 0; i < 3; i++) ctx.fillRect(cx - g.dir * i * 10 - 3, floorY + 3 + (i % 2) * 4, 7, 3);
          if (gx < 0 || gx > W) {
            const txt = `${gx < 0 ? "◀ " : ""}${g.check ? "CHECK " : ""}${Math.round(Math.abs(g.x - s.x))} m ${g.dir * (s.x - g.x) > 0 ? "coming" : "going"}${gx > W ? " ▶" : ""}`;
            ctx.textAlign = gx < 0 ? "left" : "right";
            const tw = ctx.measureText(txt).width;
            ctx.fillStyle = "rgba(238,241,242,.9)"; ctx.fillRect(gx < 0 ? 6 : W - 10 - tw, floorY - 30 - gi * 22, tw + 6, 19);
            ctx.fillStyle = P.ink; ctx.fillText(txt, gx < 0 ? 9 : W - 7, floorY - 16 - gi * 22); ctx.textAlign = "start";
          }
        }
      }
      // inside a side room: the sheet goes dark, only the door's crack of light
      if (s.inRoom != null) {
        ctx.fillStyle = "rgba(27,29,31,.82)"; ctx.fillRect(0, top, W, floorY - top);
        const dx = sx(s.inRoom + 1.2);
        ctx.fillStyle = "rgba(238,241,242,.55)"; ctx.fillRect(dx, sy(3.1), 3, 3.1 * scale);
        ctx.fillStyle = P.cream; ctx.font = "700 14px 'Courier Prime',monospace"; ctx.textAlign = "center";
        ctx.fillText(`IN THE DARK ROOM · ${Math.max(0, Math.ceil(8 - s.roomT))} s`, W / 2, sy(2.3)); ctx.textAlign = "start";
      }
      // cold flash, alarm vignette
      if (s.flash > 0) { ctx.fillStyle = `rgba(124,140,153,${Math.min(0.45, s.flash)})`; ctx.fillRect(0, top, W, floorY - top); }
      if (s.alarm > 0.05) {
        const vg = ctx.createRadialGradient(W / 2, (top + floorY) / 2, Math.min(W, floorY - top) * 0.3, W / 2, (top + floorY) / 2, W * 0.7);
        vg.addColorStop(0, "rgba(238,241,242,0)"); vg.addColorStop(1, `rgba(238,241,242,${0.55 * s.alarm})`);
        ctx.fillStyle = vg; ctx.fillRect(0, top, W, floorY - top);
      }
      // proscenium: black frame, a scalloped valance hanging over the sheet's top
      ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, top); ctx.fillRect(0, floorY + Math.max(14, scale * 0.3), W, H);
      const sc = 22;
      for (let x = (-camX * scale * 0.5) % sc - sc; x < W + sc; x += sc) { ctx.beginPath(); ctx.arc(x + sc / 2, top, sc / 2, 0, Math.PI); ctx.fill(); }
      ctx.restore();
      // ---- HUD: the hall as drawn on Floor Plan
      const sx0 = 14, sw = W - 28;
      ctx.strokeStyle = "rgba(217,210,191,.6)"; ctx.lineWidth = 1; ctx.strokeRect(sx0, 10, sw, 12);
      for (const j of JUNCTIONS) { ctx.fillStyle = j <= s.checkpoint ? P.cream : "rgba(217,210,191,.5)"; ctx.fillRect(sx0 + (j / LEN) * sw - 1, 7, 2, 18); }
      ctx.fillStyle = "#D9A441"; ctx.fillRect(sx0 + (DOOR_X / LEN) * sw - 3, 7, 6, 18);
      ctx.fillStyle = P.cream; ctx.fillRect(sx0 + 1, 13, Math.max(0, (s.x / LEN) * sw - 2), 6);
      if (s.check) { ctx.fillStyle = P.snow; ctx.beginPath(); ctx.arc(sx0 + (s.check.x / LEN) * sw, 16, 5, 0, 7); ctx.fill(); }
      ctx.font = "12px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.85)";
      ctx.fillText("BUNK", sx0, 38); ctx.textAlign = "right"; ctx.fillText("OFFICERS' WING", sx0 + sw, 38); ctx.textAlign = "start";
      // meters: warmth (a line of breath), light (the alarm), the clock, doors, retries
      const mY = 60, colW = Math.min(170, (W - 28) / (narrow ? 3 : 5));
      const meter = (i, label, v, val) => {
        const x = sx0 + i * (colW + (narrow ? 0 : 6));
        ctx.font = "12px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.85)"; ctx.fillText(label, x, mY);
        if (v != null) { ctx.fillStyle = "rgba(217,210,191,.2)"; ctx.fillRect(x, mY + 6, colW - 14, 5); ctx.fillStyle = label === "LIGHT" && v > 0.6 ? P.snow : P.cream; ctx.fillRect(x, mY + 6, (colW - 14) * Math.max(0, Math.min(1, v)), 5); }
        if (val) { ctx.font = "700 13px 'Courier Prime',monospace"; ctx.fillStyle = P.cream; ctx.textAlign = "right"; ctx.fillText(val, x + colW - 14, mY); ctx.textAlign = "start"; }
      };
      meter(0, "WARMTH", Math.max(0, s.warmth) / 100, String(Math.max(0, Math.round(s.warmth))));
      meter(1, "LIGHT", s.alarm || 0, s.alarm > 0.05 ? (s.alarm > 0.66 ? "!!" : "?") : "dark");
      meter(2, "CLOCK", null, hhmm(s.clock));
      if (!narrow) { meter(3, "DOORS", null, String(s.doors)); meter(4, "RETRIES", null, String(s.retries)); }
      // banner: a cut-out card dropped from the flies
      if (s.bannerT > 0) {
        ctx.font = `700 ${narrow ? 14 : 17}px 'Stardos Stencil','Courier Prime',monospace`;
        const tw = ctx.measureText(s.banner).width + 28, y = top + 18 - (reduce ? 0 : Math.max(0, s.bannerT - 1.7) * 60);
        ctx.fillStyle = P.ink; ctx.fillRect(W / 2 - tw / 2, y, tw, 30);
        ctx.fillStyle = P.cream; ctx.textAlign = "center"; ctx.fillText(s.banner, W / 2, y + 21); ctx.textAlign = "start";
      }
      // caption under the sheet
      const cy = floorY + Math.max(14, scale * 0.3) + 24;
      ctx.fillStyle = P.cream; ctx.font = `${narrow ? 14 : 15}px 'Courier Prime',monospace`;
      const cap = s.msgT > 0 ? s.msg : `Night 4 · bunk to the officers' wing · change ${change}, ${heightM.toFixed(2)} m, shadow ${(Math.min(CEIL, heightM * 1.6 * (crouched() ? 0.6 : 1))).toFixed(1)} m${crouched() ? " (crouched)" : ""}`;
      const lines = wrapText(cap, W - 32).slice(0, 3);
      lines.forEach((l, i) => ctx.fillText(l, 16, cy + i * 19));
      if (narrow) { ctx.fillStyle = "rgba(217,210,191,.8)"; ctx.font = "12px 'Courier Prime',monospace"; ctx.fillText(`doors ${s.doors} · retries ${s.retries}${change >= 40 ? " · east is 30% slower" : ""}`, 16, cy + lines.length * 19 + 2); }
      else if (change >= 40) { ctx.fillStyle = "rgba(217,210,191,.8)"; ctx.font = "12px 'Courier Prime',monospace"; ctx.fillText("The call is behind you: walking east is 30% slower.", 16, cy + lines.length * 19 + 2); }
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      update(dt);
      if (running) draw();
      if (running) raf = requestAnimationFrame(frame);
    }
    function start(c) {
      const easy = !!intro.querySelector("[data-easy]")?.checked;
      newRun(c, easy);
      intro.remove();
      running = true; over = false; last = performance.now();
      say(c >= 33 ? "Your shadow already reaches high up the sheet. Keep it out of the flashlights." : "Short and slow. The alcoves are your cover: crouch in one when a light comes.", 4);
      raf = requestAnimationFrame(frame);
    }

    // ---- input
    const keymap = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowDown: "down", s: "down", S: "down", " ": "listen", l: "listen", L: "listen" };
    const onKey = (e) => {
      if (!running) return;
      const k = keymap[e.key];
      if (k) { keys[k] = e.type === "keydown"; const b = padOf(k); if (b) b.classList.toggle("on", keys[k]); e.preventDefault(); return; }
      if (e.type !== "keydown") return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { if (unlocked.up || change >= 33) climb(); e.preventDefault(); }
      if (e.key === "e" || e.key === "E" || e.key === "Enter") { act(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const padBtns = [...wrap.querySelectorAll("." + K + "pad button")];
    const padDown = (e) => {
      const k = e.currentTarget.dataset.k; e.preventDefault();
      if (!running) return;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ok */ }
      e.currentTarget.classList.remove("new");
      if (k === "up") return climb();
      if (k === "act") return act();
      keys[k] = true; e.currentTarget.classList.add("on");
    };
    const padUp = (e) => { const k = e.currentTarget.dataset.k; if (k in keys) keys[k] = false; e.currentTarget.classList.remove("on"); };
    for (const b of padBtns) { b.addEventListener("pointerdown", padDown); b.addEventListener("pointerup", padUp); b.addEventListener("pointercancel", padUp); b.addEventListener("lostpointercapture", padUp); }
    const blur = () => { for (const k in keys) keys[k] = false; padBtns.forEach((b) => b.classList.remove("on")); };
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

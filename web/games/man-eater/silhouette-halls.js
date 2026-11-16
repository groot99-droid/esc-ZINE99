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
// Art (api.art): the cut-outs (Fisk at his height, the stoop for a crouch, the guard) slide and rock
// on their rods as shadow puppets do; each is rasterised once per size with its baked shadow removed,
// and a blurred copy is the cast shadow. The night-4 backdrop is the officers' wing end of the hall.
//
// Phase 2 (the ladder; DEEP_DIVE.md section 3, DESIGN.md section 10, Mode A). Three stages:
//   teach, night 2 (n2_halls): bunk to the latrine, one guard; light, shadow, crouch. Three retries.
//   test, night 4 (n4_halls): the sequence above, and the stoop: behind a hung laundry sheet a
//     silhouette held at 1.9 m or less reads as an orderly.
//   twist, night 6 (n6_halls): Jax walks with you. Shadow cover: anyone standing inside Fisk's shadow
//     is not seen by a cone, so crouching, the alcove and the pipes (the safe moves) leave Jax in the
//     light. It ends in the set piece, "He Ran": at change 68 the sentry at the stair sees only a
//     ceiling-high shadow, drops his flashlight and backs away for 20 seconds.
// Layer links (api.shared): the pipes inked on Floor Plan's elevation put the pipe route on the strip;
// the void stamped there marks the stair.
import { artKit, bareCutout, ladder } from "./kit.js";

const NAMES = { 1: "Night 2 · light, shadow, crouch", 2: "Night 4 · the pipes, the sheet", 3: "Night 6 · Jax, in your shadow" };
const HALLS = {
  1: { night: 2, clock: 22 * 60 + 5, len: 62, door: 57, label: ["LATRINE"], to: "the latrine", windows: [4, 16, 28, 40, 52], pipes: [], pools: [[36, 2.2]], drains: [24], alcoves: [9, 19, 27, 34, 45], sideDoors: [27], junctions: [2, 30],
    guards: [{ a: 20, b: 44, x: 36, dir: -1 }], checkAt: 0, sheets: [], change: 14, alarm: 2.0, retries: 3, doors: 1, card: "clock-night-2", bg: "halls-night-2", bgPx: 1300 },
  2: { night: 4, clock: 22 * 60 + 10, len: 112, door: 107, label: ["OFFICERS", "WING"], to: "the officers' wing", windows: [4, 16, 28, 40, 52, 64, 76, 88, 100], pipes: [[18, 37], [56, 80], [86, 101]], pools: [[30, 2.4], [67, 2.4], [95, 2.2]], drains: [13, 47, 73, 90],
    alcoves: [9, 23, 34, 45, 52, 61, 70, 83, 98], sideDoors: [23, 52, 83], junctions: [2, 42, 78], guards: [{ a: 25, b: 44, x: 40, dir: -1 }, { a: 58, b: 88, x: 62, dir: 1 }], checkAt: 40, sheets: [[47.8, 3]], alarm: 1.5, retries: 2, doors: 2, card: "clock-night-4", bg: "halls-night-4", bgPx: 1132 },
  3: { night: 6, clock: 22 * 60 + 40, len: 100, door: 95, label: ["STAIR"], to: "the stair", windows: [4, 16, 28, 40, 52, 64, 76, 88], pipes: [[26, 52]], pools: [], drains: [12, 60, 70], alcoves: [9, 20, 34.5, 45, 57, 66], sideDoors: [20], junctions: [2, 56, 72],
    guards: [{ a: 26, b: 54, x: 30, dir: 1 }], sentry: 90, checkAt: 0, sheets: [[30, 3.2], [39.5, 3.2], [49, 3.2]], change: 68, alarm: 1.5, retries: 2, doors: 1, card: "clock-night-6", bg: "", bgPx: 0 },
};

const P = { ink: "#1B1D1F", cream: "#D9D2BF", snow: "#EEF1F2", print: "#7C8C99" };
const CEIL = 4.57, PIPE_Y = 2.7;
const CALL_LINE = "“Low melodic groaning, almost flute-like”";

export default {
  mount(root, api) {
    const lad = ladder(api, NAMES);
    let cur = null;
    const go = (n) => { if (cur) cur.unmount(); cur = run(n); };
    go(lad.reached());
    return { unmount() { if (cur) cur.unmount(); cur = null; lad.dispose(); } };

    function run(stage) {
    const HC = HALLS[stage], twist = stage === 3, shared = api.shared;
    const LEN = HC.len, DOOR_X = HC.door, WINDOWS = HC.windows, PIPES = HC.pipes, POOLS = HC.pools, DRAINS = HC.drains, ALCOVES = HC.alcoves.map((a) => [a, 1.3]);
    const SIDE_DOORS = HC.sideDoors, JUNCTIONS = HC.junctions, GUARDS = HC.guards, CHECK_AT = HC.checkAt, SHEETS = HC.sheets;
    const pipeRoute = !!shared.get("fp_heights", false) && PIPES.length > 0, stairDrawn = !!shared.get("fp_void", false);
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
      .${K}heights{display:flex;align-items:flex-end;gap:2px;height:74px;margin:0 0 8px;border-bottom:2px solid ${P.ink};position:relative;z-index:1}
      .${K}heights img{height:100%;width:auto;opacity:.35}
      .${K}heights img.pick{opacity:1}
      .${K}heights .tl{height:auto;width:min(46%,170px);margin-left:auto;opacity:1;align-self:center}
      .${K}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;gap:8px;padding:10px 12px;z-index:2;pointer-events:none}
      .${K}pad div{display:flex;gap:8px;pointer-events:auto}
      .${K}pad button{min-width:54px;min-height:50px;background:rgba(27,29,31,.82);border:1px solid rgba(217,210,191,.5);font-size:14px;touch-action:none;transition:background .1s,color .1s,opacity .3s}
      .${K}pad button:hover{background:rgba(217,210,191,.18)}
      .${K}pad button.on{background:${P.cream};color:${P.ink}}
      .${K}pad button[hidden]{display:none}
      .${K}pad button.new{animation:${K}new 1s ease-in-out 3}
      @keyframes ${K}new{50%{background:${P.cream};color:${P.ink}}}
      .${K}bill .new{border-left:4px solid ${P.ink};padding-left:8px;margin:0 0 10px;font-size:14px;line-height:1.4;position:relative;z-index:1}
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
      <p class="${K}kick">Shadow theatre · Night ${HC.night} · ${String(Math.floor(HC.clock / 60)).padStart(2, "0")}:${String(HC.clock % 60).padStart(2, "0")}</p>
      <h2>Silhouette halls</h2>
      ${stage === 1 ? `<p class="${K}goal">Reach the latrine door at the east end of the hall.</p>
      <p class="${K}beat">Night 2. The first bunkmate walked out at ten last night and Sam says he was transferred. You broke rule two to see where a man goes. One guard walks this hall.</p>`
      : stage === 2 ? `<p class="${K}goal">Reach the officers' wing door at the east end of the hall.</p>
      <p class="${K}beat">Jax counted the chairs at supper. The transfer roster is kept in the officers' wing, and nobody has said where Pell and Duarte went.</p>
      <p class="new"><b>New tonight.</b> Laundry is hung across the hall. Behind a sheet, a silhouette held at 1.9 m or less reads as an orderly.</p>`
      : `<p class="${K}goal">Bring Jax to the stair by the cold store, at the east end of the hall.</p>
      <p class="${K}beat">Night 6. You are 2.87 m, and your shadow reaches the ceiling. Jax is 1.80 m and has no shadow to speak of. He walks where yours falls.</p>
      <p class="new"><b>Turned over.</b> Anyone standing inside your shadow is not seen by a light. Crouch, slip into an alcove or climb to the pipes, and your shadow leaves him: Jax stands in the hall alone. Stay tall. Stoop only behind a sheet.</p>`}
      <dl class="${K}key">
        <dt><span>◀ ▶</span> or A D</dt><dd>walk the hall</dd>
        <dt><span>S</span> Crouch</dt><dd>shorten your shadow; crouch in a door alcove to leave the light</dd>
      </dl>
      <div class="${K}heights" aria-hidden="true"></div>
      <p class="${K}rule">A flashlight that holds your body <b>or your shadow</b>${twist ? ", <b>or Jax outside it</b>," : ""} for ${HC.alarm} s raises the alarm. More actions come as you go.</p>
      <div class="${K}row" data-row>
        ${stage === 2 ? `<button data-c="8">Start as a refuser<small>change 8 · 1.91 m · no climbing</small></button>
        <button data-c="52">Start as an eater<small>change 52 · 2.61 m · climbs, longer shadow</small></button>` : `<button data-c="${HC.change}">${twist ? "Go out, with Jax" : "Go out"}<small>change ${HC.change} · ${(1.78 + 0.016 * HC.change).toFixed(2)} m${twist ? " · shadow to the ceiling" : " · no climbing"}</small></button>`}
        ${losses >= 2 ? `<label><input type="checkbox" data-easy checked> Slower alarm (2.4 s) and a third retry, after two walks back</label>` : ""}
      </div>
    </div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const intro = wrap.querySelector("." + K + "intro");
    const padOf = (k) => wrap.querySelector(`.${K}pad [data-k="${k}"]`);

    // ---- art
    const kit = artKit(api);
    const FISK_H = [178, 218, 258, 298, 338], ASSET_PPM = 208, BG_PPM = 700 / 4.57, BG_X = HC.bg ? DOOR_X - 0.6 - HC.bgPx / (700 / 4.57) : 1e9;
    const STOOP_TOP = 1.23; // metres, the stooped cut-out's height as drawn
    let A = null, artScale = 0, artFor = "";
    {
      const hs = intro.querySelector("." + K + "heights");
      for (const h of FISK_H) { if (!kit.has("cutout-fisk-" + h)) continue; const im = kit.img("cutout-fisk-" + h, 60, "", (stage === 2 ? h === 178 || h === 258 : h === (twist ? 298 : 178)) ? "pick" : ""); im.style.height = (h / 338) * 100 + "%"; hs.appendChild(im); }
      if (kit.has("cutout-flashlight")) hs.appendChild(kit.img("cutout-flashlight", 170, "", "tl"));
      if (hs.children.length) wrap.querySelector("." + K + "puppets")?.remove(); else hs.remove();
      kit.dressIntro(intro, intro.querySelector("." + K + "bill"), HC.card);
      lad.picker(intro.querySelector("." + K + "bill"), intro.querySelector("[data-row]"), stage, go, P.ink, P.cream);
    }
    const nearH = () => FISK_H.reduce((b, h) => (Math.abs(h - heightM * 100) < Math.abs(b - heightM * 100) ? h : b), FISK_H[0]);
    async function prepArt(scale) {
      const key = scale.toFixed(1) + "/" + heightM.toFixed(2);
      if (key === artFor) return;
      artFor = key;
      const ha = nearH(), kf = (scale / ASSET_PPM) * ((heightM * 100) / ha), kg = scale / ASSET_PPM, ks = (scale / ASSET_PPM) * ((0.6 * heightM) / STOOP_TOP);
      const o = { edit: bareCutout, key: "bare" };
      const [jax, ran, sheet, torch] = await Promise.all([
        twist ? kit.canvas("cutout-jax", 520 * kg, o) : null, twist ? kit.canvas("cutout-guard-ran", 520 * kg, o) : null,
        SHEETS.length ? kit.canvas("cutout-sheet", Math.max(40, SHEETS[0][1] * scale)) : null, twist ? kit.canvas("cutout-flashlight", 2.2 * scale) : null,
      ]);
      const [fisk, fiskS, stoop, stoopS, guard, guardS, bg, breath, ...frost] = await Promise.all([
        kit.canvas("cutout-fisk-" + ha, 520 * kf, o), kit.canvas("cutout-fisk-" + ha, 520 * kf, { ...o, blur: 3 }),
        kit.canvas("cutout-fisk-stoop", 520 * ks, o), kit.canvas("cutout-fisk-stoop", 520 * ks, { ...o, blur: 3 }),
        kit.canvas("cutout-guard", 520 * kg, o), kit.canvas("cutout-guard", 520 * kg, { ...o, blur: 3 }),
        HC.bg ? kit.canvas(HC.bg, (1600 / BG_PPM) * scale) : null, kit.canvas("breath-line", 156),
        ...[1, 2, 3, 4].map((n) => kit.canvas("frost-corner-" + n, Math.max(120, scale * 1.6))),
      ]);
      if (key !== artFor) return;
      A = { fisk, fiskS, stoop, stoopS, guard, guardS, bg, breath, frost, kf, kg, ks, jax, ran, sheet, torch };
      artScale = scale;
      if (!running) draw();
    }
    // a cut-out on its rod: anchored at its feet, rocked a little as it slides
    function puppetAt(c, x, base, face, ax, tilt = 0, sy = 1) {
      ctx.save(); ctx.translate(x, base); if (tilt) ctx.rotate(tilt); ctx.scale(face, sy);
      ctx.drawImage(c, -ax * c.width, -(760 / 800) * c.height);
      ctx.restore();
    }

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
      alarmT = easy ? 2.4 : HC.alarm;
      s = {
        x: 2, onPipe: false, facing: 1, step: 0, warmth: 100, retries: easy ? HC.retries + 1 : HC.retries, checkpoint: 2,
        guards: GUARDS.map(freshGuard), check: null, checkDone: !CHECK_AT, sentry: HC.sentry ? freshSentry() : null, jx: 1.2, jaxOut: false, heRan: false,
        listen: 0, drainOn: -1, msg: "", msgT: 0, flash: 0, shake: 0, t: 0, clock: HC.clock,
        doors: HC.doors, inRoom: null, roomT: 0, beats: {}, seenMax: 0, cleared: 0, banner: "", bannerT: 0, climbed: false, drainT: {},
      };
    }
    const freshGuard = (g) => ({ ...g, seen: 0, pause: 0, paused: false, pausePt: g.a + rng() * (g.b - g.a), step: 0 });
    const freshSentry = () => ({ x: HC.sentry, dir: -1, seen: 0, pause: 1, step: 0, sentry: true, ran: 0, shadowT: 0 });
    function resetToCheckpoint() {
      s.x = s.checkpoint; s.onPipe = false; s.drainOn = -1; s.inRoom = null; s.jx = s.x - 0.8;
      if (s.sentry && !(s.sentry.ran > 0)) s.sentry = freshSentry();
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
    const sheetAt = (x) => SHEETS.some(([a, w]) => x >= a && x <= a + w);
    // the stoop: behind a hung sheet, a silhouette held at 1.9 m or less reads as an orderly
    const stooped = () => !s.onPipe && s.inRoom == null && sheetAt(s.x) && bodyH() <= 1.92;
    // shadow cover: Jax is inside Fisk's shadow only while Fisk stands
    const covers = () => !crouched() && !s.onPipe && s.inRoom == null;
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
    const allGuards = () => [...s.guards, ...(s.check ? [s.check] : []), ...(s.sentry ? [s.sentry] : [])];
    function heRan(g) {
      g.ran = 20; g.shadowT = 0; g.seen = 0; g.dropX = g.x - 0.35; s.heRan = true;
      banner("HE RAN", 3);
      beat("ran", "A shadow the height of the hall comes round onto the sheet, and no man under it yet. His flashlight hits the floor. He backs away from it with his hands up. He has been told what throws a shadow like that. Twenty seconds.", 8);
    }

    // ---- update
    function update(dt) {
      s.t += dt; s.clock += dt * 0.25; // a page minute is four seconds of hall time
      if (s.msgT > 0) s.msgT -= dt;
      if (s.bannerT > 0) s.bannerT -= dt;
      if (s.flash > 0) s.flash -= dt;
      if (s.shake > 0) s.shake -= dt;
      if (twist && !s.beats.jax && s.t > 3) beat("jax", "Jax keeps to where your shadow falls. While you stand, no light sees him. Crouch, and he is a man in a lit hall.", 6);
      if (SHEETS.length && sheetAt(s.x) && !s.beats.sheet) beat("sheet", `NEW · A sheet hung across the hall. Behind it a silhouette of 1.9 m or less reads as an orderly. You are ${heightM.toFixed(2)} m: ${heightM <= 1.92 ? "walk through as you are" : "stoop (crouch) and the light passes over you"}.`, 7);
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
      if (!unlocked.act && sideDoorAt(s.x) != null) unlock("act", `NEW · Door (E): this side door is unlocked. Slip into the dark room until the light passes${twist ? ", both of you" : ""}. ${HC.doors === 1 ? "One door" : "Two doors"} tonight.`);
      if (!unlocked.up && change >= 33 && pipeAt(s.x)) unlock("up", twist ? "Climb (W): the pipes are in reach. Your shadow goes up with you." : "NEW · Climb (W): the pipes run at 2.7 m. You are tall enough now. Up there the light passes under you.");
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
      if (stage === 2 && s.x >= 78 && !s.beats.call) beat("call", `Under the floor, the sound again: ${CALL_LINE} (line 30). It is behind you now, west and down.`, 6);
      // guards
      const sh = shadowGeom();
      const al = alcoveAt(s.x);
      const hidden = s.inRoom != null || (al && crouched()) || stooped();
      // Jax: a step into the shadow's side, kept up with Fisk
      let jaxPts = [];
      if (twist) {
        const side = Math.sign(sh.top - s.x) || 1, tx = s.inRoom != null ? s.x : s.x + side * 0.85;
        s.jx += Math.max(-3.2 * dt, Math.min(3.2 * dt, tx - s.jx));
        s.jaxOut = s.inRoom == null && !covers() && !sheetAt(s.jx);
        if (s.jaxOut) jaxPts = [[s.jx, 1.6], [s.jx, 0.9], [s.jx, 0.3]];
      }
      const base = bodyBase(), bh = bodyH();
      const bodyPts = hidden ? [] : [[s.x, base + bh * 0.92], [s.x, base + bh * 0.55], [s.x, base + bh * 0.15]];
      const shPts = hidden ? [] : [0.25, 0.5, 0.75, 1].map((f) => [sh.foot + (sh.top - sh.foot) * f, sh.base + sh.len * f]);
      let worst = 0;
      for (const g of allGuards()) {
        if (g.sentry) {
          if (g.ran > 0) {
            g.ran -= dt; g.step += dt * 3;
            if (g.ran > 15) g.x = Math.min(LEN - 0.6, g.x + 1.5 * dt); else if (g.ran < 4) g.x = Math.max(HC.sentry, g.x - 1.6 * dt);
            if (g.ran <= 0) { g.x = HC.sentry; say("He has come back for his flashlight."); }
            continue;
          }
          // the set piece: he sees the shadow before any man. Bodies he sees at 10 m; a shadow that tall, further
          const lamp = g.x - 0.35;
          if (covers() && !hidden && sh.top > s.x && sh.len >= CEIL - 0.05 && lamp - sh.top <= 14 && lamp - s.x > 10) { g.shadowT += dt; if (g.shadowT >= 0.6) { heRan(g); continue; } }
          else g.shadowT = Math.max(0, g.shadowT - dt);
        } else if (g.check) {
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
        else if (jaxPts.some(([px, py]) => inCone(g, px, py))) { hit = true; by = "jax"; }
        if (hit) { g.seen += dt; g.by = by; } else g.seen = Math.max(0, g.seen - dt * 0.6);
        worst = Math.max(worst, g.seen / alarmT);
        if (g.seen >= alarmT) return caught(g.by === "shadow" ? (g.check ? "The check's flashlight found your shadow on the wall before it found you." : "He saw your shadow first.") : g.by === "pool" ? "You stood in the light from a door pane." : g.by === "jax" ? "The light found Jax, standing in the hall outside your shadow." : "The flashlight held you.");
      }
      s.alarm = worst; s.seenMax = Math.max(s.seenMax, worst);
      if (s.warmth <= 0) return caught("The cold took your legs.");
      if (s.x >= DOOR_X - 2 && !s.onPipe && !s.beats.door) beat("door", twist ? (stairDrawn ? "The stair door, where your plan said it had to be. Press E (Door)." : "A panel in the wall beside the cold store, colder than the wall. Press E (Door).") : stage === 1 ? "The latrine door. Press E (Door)." : "The officers' wing door. Two handles: the high steel lever, and the brass knob below it. Press E (Door).", 4);
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
      finish(false, `${why} Two orderlies walk Fisk back to the bunk and do not say a word on the way. Suspicion +20; the curfew break is logged as seen${twist ? ", and Jax is walked the other way" : stage === 1 ? ", and where a man goes at ten stays a thing Sam told you" : ", and the roster stays in a room you have not been in"}.`);
    }
    function finish(win, text) {
      if (over) return;
      over = true; running = false;
      cancelAnimationFrame(raf);
      draw();
      lad.conclude(wrap, kit, stage, win ? { card: "halls-night-" + HC.night, caption: `NIGHT ${HC.night} · ${HC.to.toUpperCase()}` } : { card: "rules-card", stamp: "stamp-hold", caption: `NIGHT ${HC.night} · WALKED BACK TO THE BUNK` }, { outcome: win ? "win" : "lose", text }, go);
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
        if (stage === 1) return finish(true, `The latrine, tiled and unlit. By the floor drain there is a wet print 40 cm long, and it freezes white while you look at it. Nobody on this base has a foot that size. You came the whole way on the floor, and the shadow never reached the light. Warmth ${Math.round(s.warmth)}.`);
        if (twist) {
          if (Math.abs(s.jx - s.x) > 3) { say("Jax is not with you yet."); return; }
          return finish(true, `${stairDrawn ? "The stair door is where your plan said it had to be" : "The panel gives; there is a stair behind it that is on no sheet"}, and the cold comes up it. Jax goes down first, inside your shadow the whole way. ${s.heRan ? "Behind you a flashlight lies on the floor, still lit. The guard saw a shadow as high as the hall and ran from it: they have been told what is kept here, and what it looks like coming." : "The sentry never saw the shadow come."} Warmth ${Math.round(s.warmth)}.`);
        }
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
      if (twist) { say("Up on the pipes. Your shadow went up with you. Jax is standing in the hall below, alone."); return; }
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
      prepArt(scale);
      const art = A && Math.abs(artScale - scale) < 0.5 ? A : null;
      for (const w of WINDOWS) {
        const cx = sx(w);
        if (cx < -scale * 6 || cx > W + scale * 6) continue;
        if (art && art.bg && w > BG_X) continue;
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
      // the officers' wing end of the hall, from the night-4 backdrop
      if (art && art.bg && sx(BG_X) < W) {
        const kb = scale / BG_PPM;
        ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, floorY - top); ctx.clip();
        ctx.drawImage(art.bg, sx(BG_X), floorY - 760 * kb);
        ctx.fillStyle = "rgba(27,29,31,.8)"; ctx.fillRect(sx(BG_X) + art.bg.width - 1, top, W, floorY - top);
        ctx.restore();
      }
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
      if (!(art && art.bg)) { const x0 = sx(DOOR_X - 0.6); ctx.fillStyle = "rgba(27,29,31,.8)"; ctx.fillRect(x0, sy(3.6), 1.3 * scale, 3.6 * scale);
        ctx.fillStyle = P.cream; ctx.font = `700 ${Math.max(12, scale * 0.17)}px 'Stardos Stencil','Courier Prime',monospace`; ctx.textAlign = "center";
        HC.label.forEach((t, i) => ctx.fillText(t, x0 + 0.65 * scale, sy(2.9 - i * 0.3))); ctx.textAlign = "start"; }
      // laundry sheets hung across the hall
      for (const [a, w] of SHEETS) {
        const x0 = sx(a); if (x0 > W || x0 + w * scale < 0) continue;
        ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - 0.4 * scale, sy(2.62)); ctx.quadraticCurveTo(x0 + (w * scale) / 2, sy(2.48), x0 + (w + 0.4) * scale, sy(2.62)); ctx.stroke();
        ctx.fillStyle = "rgba(238,241,242,.78)"; ctx.fillRect(x0, sy(2.55), w * scale, 2.25 * scale);
        ctx.strokeStyle = "rgba(27,29,31,.35)"; ctx.lineWidth = 1; ctx.strokeRect(x0, sy(2.55), w * scale, 2.25 * scale);
        ctx.fillStyle = "rgba(143,135,111,.28)"; for (let fx = 0.3; fx < w; fx += 0.55) ctx.fillRect(x0 + fx * scale, sy(2.55), 0.1 * scale, 2.25 * scale);
        // the 1.9 m line an orderly's head keeps under
        ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(27,29,31,.55)"; ctx.beginPath(); ctx.moveTo(x0, sy(1.9)); ctx.lineTo(x0 + w * scale, sy(1.9)); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(27,29,31,.7)"; ctx.font = "12px 'Courier Prime',monospace"; ctx.fillText("1.9 m", x0 + 4, sy(1.9) - 4);
      }
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
        if (g.sentry && g.ran > 0) { // the dropped flashlight, shining along the floor
          const fx = sx(g.dropX);
          const gr = ctx.createLinearGradient(fx, 0, fx - 4 * scale, 0); gr.addColorStop(0, "rgba(238,241,242,.75)"); gr.addColorStop(1, "rgba(238,241,242,0)");
          ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(fx, floorY - 4); ctx.lineTo(fx - 4 * scale, floorY - 0.5 * scale); ctx.lineTo(fx - 4 * scale, floorY); ctx.closePath(); ctx.fill();
          ctx.fillStyle = P.ink; ctx.fillRect(fx - 2, floorY - 6, 0.3 * scale, 5);
          continue;
        }
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
        const low = crouched() || s.onPipe, sc = art && (low ? art.stoopS : art.fiskS);
        if (sc) { ctx.filter = "none"; puppetAt(sc, 0, 0, s.facing, low ? 120 / 520 : 170 / 520, 0, (sh.len * scale) / ((low ? 0.6 : 1) * heightM * scale)); }
        else fig(0, 0, sh.len * scale * (crouched() ? 1 / 0.62 : 1), Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing });
        ctx.restore();
      }
      for (const g of allGuards()) {
        const gs = Math.max(-3, Math.min(3, (g.x - nearestWindow(g.x)) * 0.9));
        ctx.save(); if (!reduce && !(art && art.guardS)) ctx.filter = "blur(3px)"; ctx.globalAlpha = 0.3;
        ctx.translate(sx(g.x + gs * 0.25), floorY); ctx.transform(1, 0, -(gs * 0.75) / (1.8 * 1.6), 1, 0, 0);
        if (art && art.guardS) puppetAt(art.guardS, 0, 0, g.dir, 150 / 520, 0, 1.6);
        else fig(0, 0, 1.8 * 1.6 * scale, Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true });
        ctx.restore();
      }
      // the cut-outs, on their rods
      for (const g of allGuards()) {
        const rock = reduce || g.pause > 0 ? 0 : Math.sin(g.step) * 0.035;
        if (g.sentry && g.ran > 0 && art && art.ran) { ctx.fillStyle = P.ink; ctx.fillRect(sx(g.x) - 1, floorY - scale * 0.9, 1.5, scale * 0.9 + 30); puppetAt(art.ran, sx(g.x), floorY, -1, 190 / 520, rock); ctx.fillStyle = P.ink; ctx.font = "700 13px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText(`${Math.ceil(g.ran)} s`, sx(g.x), sy(2.3)); ctx.textAlign = "start"; continue; }
        if (g.sentry && g.shadowT > 0.05) { ctx.fillStyle = P.ink; ctx.font = "700 18px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText("…", sx(g.x), sy(2.3) + 6); ctx.textAlign = "start"; }
        if (art && art.guard) { ctx.fillStyle = P.ink; ctx.fillRect(sx(g.x) - 1, floorY - scale * 0.9, 1.5, scale * 0.9 + 30); puppetAt(art.guard, sx(g.x), floorY, g.dir, 150 / 520, rock * g.dir); }
        else fig(sx(g.x), floorY, 1.8 * scale, g.pause > 0 ? 0 : Math.sin(g.step) * 0.5, P.ink, { face: g.dir, cap: true, arm: true, rod: true });
        if (g.seen > 0.05) {
          const f = Math.min(1, g.seen / alarmT);
          ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx(g.x), sy(2.3), 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke();
          ctx.fillStyle = P.ink; ctx.font = "700 18px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText(f > 0.66 ? "!" : "?", sx(g.x), sy(2.3) + 6); ctx.textAlign = "start";
        }
      }
      if (twist && s.inRoom == null) { // Jax, a head shorter than the pipes, in the shadow or out of it
        const jx = sx(s.jx);
        if (art && art.jax) { ctx.fillStyle = P.ink; ctx.fillRect(jx - 1, floorY - scale * 0.8, 1.5, scale * 0.8 + 30); puppetAt(art.jax, jx, floorY, s.facing, 150 / 520, reduce ? 0 : Math.sin(s.step * 1.3) * 0.03); }
        else fig(jx, floorY, 1.8 * scale, Math.sin(s.step * 1.3) * 0.5, P.ink, { face: s.facing, rod: true });
        ctx.font = "700 12px 'Courier Prime',monospace"; ctx.textAlign = "center";
        const lbl = s.jaxOut ? "JAX · OUT OF YOUR SHADOW" : "JAX", tw = ctx.measureText(lbl).width + 8;
        ctx.fillStyle = s.jaxOut ? P.snow : "rgba(27,29,31,.75)"; ctx.fillRect(jx - tw / 2, sy(2.05) - 13, tw, 17);
        ctx.fillStyle = s.jaxOut ? P.ink : P.cream; ctx.fillText(lbl, jx, sy(2.05)); ctx.textAlign = "start";
        if (s.jaxOut) { ctx.strokeStyle = P.snow; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.strokeRect(jx - 0.4 * scale, sy(1.9), 0.8 * scale, 1.9 * scale); ctx.setLineDash([]); }
      }
      if (s.inRoom == null) {
        const rock = reduce ? 0 : Math.sin(s.step) * 0.04 * s.facing;
        if (s.onPipe && art && art.stoop) puppetAt(art.stoop, sx(s.x), sy(PIPE_Y + 0.08), s.facing, 120 / 520, rock, 0.75);
        else if (s.onPipe) { ctx.save(); ctx.translate(sx(s.x), sy(PIPE_Y + 0.08)); fig(0, 0, heightM * scale * 0.75, Math.sin(s.step) * 0.3, P.ink, { crouch: true, face: s.facing }); ctx.restore(); }
        else if (art && (crouched() ? art.stoop : art.fisk)) { ctx.fillStyle = P.ink; ctx.fillRect(sx(s.x) - 1, floorY - scale * 0.8, 1.5, scale * 0.8 + 30); puppetAt(crouched() ? art.stoop : art.fisk, sx(s.x), floorY, s.facing, crouched() ? 120 / 520 : 170 / 520, rock); }
        else fig(sx(s.x), floorY, heightM * scale, Math.sin(s.step) * 0.5, P.ink, { crouch: crouched(), face: s.facing, rod: true });
        // a hidden marker: the alcove swallows him
        if (stooped()) { ctx.fillStyle = "rgba(27,29,31,.8)"; ctx.font = "700 12px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText("READS AS AN ORDERLY", sx(s.x), sy(2.75)); ctx.textAlign = "start"; }
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
      // frost grows from the sheet's corners as the warmth goes
      if (art && art.frost) {
        const f = art.frost[s.warmth > 75 ? 0 : s.warmth > 50 ? 1 : s.warmth > 25 ? 2 : 3];
        if (f) { ctx.drawImage(f, 0, top); ctx.save(); ctx.translate(W, top); ctx.scale(-1, 1); ctx.drawImage(f, 0, 0); ctx.restore(); }
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
      if (!twist || stairDrawn) { ctx.fillStyle = "#D9A441"; ctx.fillRect(sx0 + (DOOR_X / LEN) * sw - 3, 7, 6, 18); }
      // the pipe route, pencilled on the strip once Floor Plan's elevation has the pipes at 2.7 m
      if (pipeRoute) { ctx.fillStyle = "#f0dfa6"; for (const [a, b] of PIPES) { ctx.fillRect(sx0 + (a / LEN) * sw, 4, ((b - a) / LEN) * sw, 3); ctx.fillRect(sx0 + (a / LEN) * sw, 4, 2, 7); ctx.fillRect(sx0 + (b / LEN) * sw - 2, 4, 2, 7); } }
      for (const [a, w] of SHEETS) { ctx.fillStyle = "rgba(238,241,242,.8)"; ctx.fillRect(sx0 + (a / LEN) * sw, 11, Math.max(3, (w / LEN) * sw), 10); }
      if (s.sentry && !(s.sentry.ran > 0)) { ctx.fillStyle = P.snow; ctx.fillRect(sx0 + (s.sentry.x / LEN) * sw - 2, 9, 4, 14); }
      ctx.fillStyle = P.cream; ctx.fillRect(sx0 + 1, 13, Math.max(0, (s.x / LEN) * sw - 2), 6);
      if (s.check) { ctx.fillStyle = P.snow; ctx.beginPath(); ctx.arc(sx0 + (s.check.x / LEN) * sw, 16, 5, 0, 7); ctx.fill(); }
      ctx.font = "12px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.85)";
      ctx.fillText("BUNK" + (pipeRoute ? " · pipes at 2.7 m, from your elevation" : ""), sx0, 38); ctx.textAlign = "right"; ctx.fillText(twist ? (stairDrawn ? "COLD STORE · THE STAIR, FROM YOUR PLAN" : "COLD STORE") : HC.to.toUpperCase(), sx0 + sw, 38); ctx.textAlign = "start";
      // meters: warmth (a line of breath), light (the alarm), the clock, doors, retries
      const mY = 60, colW = Math.min(170, (W - 28) / (narrow ? 3 : 5));
      const meter = (i, label, v, val) => {
        const x = sx0 + i * (colW + (narrow ? 0 : 6));
        ctx.font = "12px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.85)"; ctx.fillText(label, x, mY);
        if (v != null && label === "WARMTH" && A && A.breath) {
          // warmth is a line of breath, as long as it lasts
          const bw = colW - 14, bh = (bw * A.breath.height) / A.breath.width, vv = Math.max(0, Math.min(1, v));
          ctx.globalAlpha = 0.25; ctx.drawImage(A.breath, x, mY + 2, bw, bh); ctx.globalAlpha = 1;
          ctx.save(); ctx.beginPath(); ctx.rect(x, mY, bw * vv, bh + 6); ctx.clip(); ctx.drawImage(A.breath, x, mY + 2, bw, bh); ctx.restore();
        } else if (v != null) { ctx.fillStyle = "rgba(217,210,191,.2)"; ctx.fillRect(x, mY + 6, colW - 14, 5); ctx.fillStyle = label === "LIGHT" && v > 0.6 ? P.snow : P.cream; ctx.fillRect(x, mY + 6, (colW - 14) * Math.max(0, Math.min(1, v)), 5); }
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
      const cap = s.msgT > 0 ? s.msg : `Night ${HC.night} · bunk to ${HC.to} · change ${change}, ${heightM.toFixed(2)} m, shadow ${(Math.min(CEIL, heightM * 1.6 * (crouched() ? 0.6 : 1))).toFixed(1)} m${crouched() ? " (crouched)" : ""}`;
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
      say(twist ? "Jax is a step behind you, in your shadow. Keep him there." : c >= 33 ? "Your shadow already reaches high up the sheet. Keep it out of the flashlights." : "Short and slow. The alcoves are your cover: crouch in one when a light comes.", 4);
      if (pipeRoute) { lad.note(wrap, "because you inked the pipes at 2.7 m on Floor Plan's elevation, the pipe route is pencilled on your strip and you know where to climb."); if (change >= 33) { unlocked.up = true; padOf("up").hidden = false; } }
      if (twist && stairDrawn) lad.note(wrap, "because you stamped the void on Floor Plan, the stair is marked at the east end of your strip.");
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
        ro.disconnect(); kit.dispose();
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup", onKey);
        window.removeEventListener("blur", blur);
        for (const b of padBtns) { b.removeEventListener("pointerdown", padDown); b.removeEventListener("pointerup", padUp); b.removeEventListener("pointercancel", padUp); b.removeEventListener("lostpointercapture", padUp); }
        wrap.remove();
      },
    };
    }
  },
};

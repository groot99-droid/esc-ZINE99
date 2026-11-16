// The Stuffed Ones: Dollhouse cutaway (2D, scroll), drawn as a Victorian dollhouse catalogue
// lithograph.
//
// DESIGN.md section 10 "Mode A", sequence `c10_dollhouse_sound` (night 1, the Sound game). The
// cabin cut open from the front, every room at once. Point to a destination and the selected toy
// walks there at 0.6 m/s while Still is released; holding Still freezes it. Each guest has a sight
// cone, 70 degrees wide and 4 m long. Asleep, a cone opens for 2-4 s at random; a light sleeper's
// (Wes, lamp on) more often; Ana reads awake until 01:00. A toy that moves inside an open cone is
// seen: a slip (dread +15 to that guest, +5 to the others, one memory). Standing still in a cone is
// safe. Creaking stairs: passing the third step opens the cone of any guest within 4 m toward it.
// Tools (Sound): Thump, Drag, Squeak, and Three taps (both toys at one door). The night runs 23:00
// to 05:00; bedroom doors stand open, so an eye sees along its whole floor. Cut to fit: one night of
// about three minutes, cone timings compressed to match, the cellar drawn but not walked.
//
// Actions: Walk (tap a room; arrows), Hold still (hold Space or the button), Switch toy (Tab), the
// four Sound tools (1-4), and Steady (S), from section 12's tremors: from hunger 75 a pulse comes
// every 4 s and wants a Steady inside its window, or the toy shakes (hunger +4; a guest who sees it:
// dread +5 and their eye turns toward it). Phases: Ana reads in the parlour until 01:00; deep sleep;
// from 03:00 Wes sleeps lighter. The hall light hazard (section 10) follows Three taps at a bedroom
// door: the guest gets up and the hall and landing are lit for a while. Guests get used to a noise:
// each sound frightens a little less than the last. Narrative lines other than the quoted source
// lines (ch 17 and ch 26, as DESIGN.md sections 3 and 6 quote them) are written for the game.
//
// Phase 1 (DESIGN.md "Accepted development", 2026-11-15): night two, the cupboard start for Proximity
// (`c12_dollhouse_proximity`). A guest has shut the pack in the linen cupboard and wedged a chair.
// The heap: press on three beats of the shared pulse and the chair goes over; Noor comes out under
// the hall light and you hold the whole heap still while she says the source's lines (ch 29, as
// DESIGN.md section 3 quotes them). Then Proximity from 03:00: Settle each toy at a marked spot,
// unseen, before 05:00. The cabin is the game's lithograph plate (api.art), and the rooms, stair and
// doors sit where the plate draws them; the old ruled drawing stays as the fallback.
//
// Phase 2 (DESIGN.md section 21, built 2026-11-16): three stages. Teach: the involuntary climb
// (`b8_dollhouse_climb`): the hunger walks the cat to a bedroom door and the only input is Still.
// Test: the Sound night with two mirrors, each bouncing one sleeper's sight once (the hall mirror
// throws Ana's onto the stair, the landing mirror Wes's onto the landing behind the banister). Twist:
// the cupboard. Where every other night says hold still, the heap must move, on the beat; then
// Proximity, in which Lila walks on her own ("She didn't want to.", ch 21, as DEEP_DIVE.md quotes
// it) and is held only by a cat beside her holding Still for two, at twice the hunger. Two layer
// links are read here (api.shared): "Lila's hum" kept in Stuffing stops her walking, and the guest
// made It in Parlour is the one who wedged the chair and comes out under the hall light. The
// collection thread's guest object sits on a wall at the cut in the twist's night.
import { artKit, FACE } from "./art-kit.js";
import { runStages, stagePicker, linkNote } from "./stages.js";
const PRE = "stuffed-ones-dollhouse-cutaway-";
const C = { paper: "#efe4c9", ink: "#2a211b", cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", moss: "#7d8a5a", rust: "#a5553a",
  sky: "#8fa9bf", cream: "#efe5cf", bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", night: "#56627a", nightL: "#7f8ca3", rose: "#c9a7b0" };
const W_M = 12, FLOOR = 3, CELLAR = 2.2, ROOF = 2.6;
const ROOMS = [
  { id: "bedA", name: "BEDROOM", x0: 0, x1: 4, lvl: 1, wall: "#aeb6c6", sprig: "#e6dcc6" },
  { id: "landing", name: "LANDING & SHELF", x0: 4, x1: 8, lvl: 1, wall: "#b9b2a6", sprig: "#8fa9bf" },
  { id: "bedB", name: "BEDROOM", x0: 8, x1: 12, lvl: 1, wall: "#b7a9b4", sprig: "#efe5cf" },
  { id: "parlour", name: "PARLOUR", x0: 0, x1: 4, lvl: 0, wall: "#a9b39c", sprig: "#efe5cf" },
  { id: "hall", name: "HALL", x0: 4, x1: 8, lvl: 0, wall: "#b6a796", sprig: "#7d8a5a" },
  { id: "kitchen", name: "KITCHEN", x0: 8, x1: 12, lvl: 0, wall: "#a8b4bf", sprig: "#efe5cf" },
];
let STAIR = { x0: 4.5, x1: 7.4 };            // ground at x0, landing at x1
let DOORS = [{ x: 4, lvl: 1, room: "bedA" }, { x: 8, lvl: 1, room: "bedB" }, { x: 4, lvl: 0, room: "parlour" }];
let HALL = [4, 8];
// Where the lithograph plate (art/src/90_backdrops.py, 1600 x 900) puts the same things: the house
// runs x 250..1350 for 12 m, the floors are at y 662 and 432 (230 px for 3 m).
const PLATE = { src: [190, 36, 1220, 800], x0: 60, wide: 1100, ground: 626, floor: 230 };
const PLATE_GEOM = {
  STAIR: { x0: 5.87, x1: 7.6 }, HALL: [3.9, 7.85],
  DOORS: [{ x: 4.25, lvl: 1, room: "bedA" }, { x: 7.6, lvl: 1, room: "bedB" }, { x: 4.9, lvl: 0, room: "parlour" }],
  guests: { noor: [0.8, 0.6, 0.15], wes: [10.0, 0.6, Math.PI - 0.15], ana: [3.0, 0.75, 0.1] }, toys: [5.0, 9.4],
};
// Proximity: where a toy may settle to be found in the morning (plate positions).
const SETTLE = [{ name: "the kitchen sink", x: 9.64, lvl: 0 }, { name: "Wes's bedside", x: 9.2, lvl: 1 }, { name: "Noor's door", x: 4.3, lvl: 1 }, { name: "Noor's bedside", x: 2.7, lvl: 1 }];
const HEAP_BEAT = 1.6, HEAP_WIN = 0.3, HEAP_LOOK = 9, HEAP_GRACE = 2.6;
const HEAP_LINES = ["Okay, seriously, who keeps moving these?", "This isn't funny.", "I swear I locked that door."];
const GUESTS = [
  // eye position (m), facing (radians, 0 = right), room
  { id: "noor", name: "Noor", room: "bedA", ex: 1.3, ey: FLOOR + 0.75, face: 0.15, sleep: [10, 20], awakeUntil: 0 },
  { id: "wes", name: "Wes", room: "bedB", ex: 10.7, ey: FLOOR + 0.75, face: Math.PI - 0.15, sleep: [5, 11], awakeUntil: 0, lamp: true },
  { id: "ana", name: "Ana", room: "parlour", ex: 1.4, ey: 0.85, face: 0.1, sleep: [9, 18], awakeUntil: 2 * 30 },
];
const TOOLS = [
  { id: "thump", name: "Thump", dread: 4, range: 6, floors: 0, hunger: 3 },
  { id: "drag", name: "Drag", dread: 5, range: 6, floors: 1, hunger: 3 },
  { id: "squeak", name: "Squeak", dread: 6, range: 4, floors: 0, hunger: 3 },
  { id: "taps", name: "Three taps", dread: 8, range: 0, floors: 0, hunger: 5 },
];
const NIGHTS = [180, 130, 240], TARGETS = [35, 30, 35], LILA_SPEED = 0.34;
const BLURBS = ["The climb: the toy walks itself. You can only hold still.", "The Sound night, with two mirrors.", "The linen cupboard: here you must move. Then Lila walks."];
// a mirror bounces one sleeper's open eye once: onto the stair, or along a stretch of floor
const MIRRORS = [
  { x: 5.3, lvl: 0, guest: "ana", stair: true, stages: [1] },
  { x: 6.75, lvl: 1, guest: "wes", x0: 4.2, x1: 6.1, stages: [1, 2] },
];
const KNOCK = { x: 3.95, lvl: 1, h: 1.55 };
const NIGHT = 180, CONE = (70 * Math.PI) / 180, REACH = 4, SPEED = 0.6, HABIT = 0.9, TARGET = 35, LIGHT = 10, PULSE_EVERY = 4, PULSE_WIN = 0.6;

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

export default { mount(root, api) { return runStages(root, api, run, BLURBS); } };

function run(root, api, flow) {
  {
    const stg = flow.stage, NIGHT = NIGHTS[stg], TARGET = TARGETS[stg];
    const mirrors = MIRRORS.filter((m) => m.stages.includes(stg));
    const itId = stg === 2 ? flow.S.get("it", "") : "", hum = stg === 2 && flow.S.get("lila_hum", false) === true;
    let linkT = null;
    const K = kit();
    const rng = api.rng();
    const A = artKit(api), ART = A.has("dollhouse-night");
    if (ART) { STAIR = PLATE_GEOM.STAIR; DOORS = PLATE_GEOM.DOORS; HALL = PLATE_GEOM.HALL; }
    else { STAIR = { x0: 4.5, x1: 7.4 }; DOORS = [{ x: 4, lvl: 1, room: "bedA" }, { x: 8, lvl: 1, room: "bedB" }, { x: 4, lvl: 0, room: "parlour" }]; HALL = [4, 8]; }
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;touch-action:none;outline:none;font-family:'IM Fell English',Georgia,serif;color:${C.ink}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}bar{position:absolute;left:0;right:0;bottom:8px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:0 10px;z-index:2}
.${PRE}bar button{font:600 13px Karla,Arial,sans-serif;background:${C.bone};color:${C.ink};border:1px solid ${C.ink};box-shadow:2px 2px 0 ${C.ink};padding:7px 11px;cursor:pointer;min-height:38px;letter-spacing:.02em}
.${PRE}bar button:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.${PRE}bar .${PRE}still{background:${C.ink};color:${C.bone};min-width:110px;text-transform:uppercase;letter-spacing:.12em}
.${PRE}bar .${PRE}still[aria-pressed=true]{background:${C.red};border-color:${C.red}}
.${PRE}bar .${PRE}steady{background:${C.amber};border-color:${C.ink}}
.${PRE}bar .${PRE}steady[hidden]{display:none}
.${PRE}bar .${PRE}steady.${PRE}beat-on{background:${C.red};color:${C.bone}}
.${PRE}bar button:hover:not(:disabled){background:#fff}
.${PRE}bar .${PRE}still:hover:not(:disabled){background:${C.ink}}
.${PRE}bar .${PRE}still[aria-pressed=true]:hover:not(:disabled){background:${C.red}}
.${PRE}bar button kbd{font:600 11px ui-monospace,Menlo,monospace;opacity:.7;margin-left:5px}
.${PRE}cap{position:absolute;left:50%;transform:translateX(-50%);top:62px;width:min(500px,calc(100% - 32px));box-sizing:border-box;background:${C.bone};border:3px double ${C.ink};padding:10px 16px 12px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none;text-align:center}
.${PRE}cap b{display:block;font:400 13px 'IM Fell English',Georgia,serif;letter-spacing:.18em;text-transform:uppercase;margin-bottom:2px}
.${PRE}cap q{quotes:none;display:block;font:italic 19px 'IM Fell English',Georgia,serif}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,228,201,.82);z-index:4;padding:16px;overflow:auto}
.${PRE}plate{width:min(500px,100%);box-sizing:border-box;background:${C.bone};border:1px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:4px;padding:16px 24px 20px;box-shadow:0 0 0 9px ${C.paper},0 0 0 10px ${C.ink}}
.${PRE}plate header{display:flex;justify-content:space-between;font:italic 13px 'IM Fell English',Georgia,serif;border-bottom:3px double ${C.ink};padding-bottom:6px}
.${PRE}plate h2{margin:10px 0 2px;font:400 34px 'IM Fell English',Georgia,serif;font-variant:small-caps;letter-spacing:.02em;text-align:center}
.${PRE}plate .${PRE}goal{margin:6px 0 12px;font:15px/1.45 Karla,Arial,sans-serif;text-align:center}
.${PRE}plate dl{margin:0;border-top:1px solid ${C.ink};border-bottom:1px solid ${C.ink};padding:6px 0}
.${PRE}plate dl div{display:flex;align-items:baseline;gap:6px;font:15px Karla,Arial,sans-serif;padding:3px 0}
.${PRE}plate dt{font:italic 17px 'IM Fell English',Georgia,serif;white-space:nowrap}
.${PRE}plate dd{margin:0;flex:1;display:flex;gap:6px;align-items:baseline}
.${PRE}plate dd::before{content:"";flex:1;border-bottom:1.5px dotted ${C.ink};min-width:16px;order:0}
.${PRE}plate dd span{order:1;text-align:right}
.${PRE}plate .${PRE}more{font:italic 14px 'IM Fell English',Georgia,serif;margin:8px 0 0;text-align:center;opacity:.85}
.${PRE}plate button{display:block;margin:14px auto 0;font:600 16px Karla,Arial,sans-serif;background:${C.ink};color:${C.bone};border:0;padding:11px 28px;cursor:pointer;min-height:46px}
.${PRE}plate button:focus-visible{outline:3px solid ${C.red};outline-offset:2px}
.${PRE}plate label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin-top:8px;justify-content:center}
.${PRE}plate canvas{position:static;width:auto;height:auto;margin:0 auto}
.${PRE}plate .${PRE}pic{border:1px solid ${C.ink};margin:8px auto 0}
.${PRE}plate button.${PRE}alt{background:${C.bone};color:${C.ink};box-shadow:inset 0 0 0 1.5px ${C.ink};margin-top:8px}
.${PRE}bar button[hidden]{display:none}
.${PRE}bar .${PRE}push,.${PRE}bar .${PRE}push:hover:not(:disabled){background:${C.red};color:${C.bone};border-color:${C.red};min-width:120px}
.${PRE}plate .${PRE}kind{margin:10px 0 0;font:italic 15px 'IM Fell English',Georgia,serif;color:${C.red};text-align:center}
</style><canvas aria-label="The cabin cut open from the front at night, every room at once"></canvas>
<div class="${PRE}bar">
  <button type="button" class="${PRE}still" aria-pressed="false">Hold still<kbd>Space</kbd></button>
  ${TOOLS.map((t, i) => `<button type="button" data-tool="${t.id}">${t.name}<kbd>${i + 1}</kbd></button>`).join("")}
  <button type="button" data-a="switch">Switch toy<kbd>Tab</kbd></button>
  <button type="button" class="${PRE}steady" hidden>Steady<kbd>S</kbd></button>
  <button type="button" class="${PRE}push" hidden>Push<kbd>Enter</kbd></button>
  <button type="button" data-a="settle" hidden>Settle<kbd>1</kbd></button>
</div>
<div class="${PRE}cap" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const stillBtn = wrap.querySelector("." + PRE + "still");
    const toolBtns = [...wrap.querySelectorAll("button[data-tool]")];
    const pushBtn = wrap.querySelector("." + PRE + "push"), settleBtn = wrap.querySelector('button[data-a="settle"]'), switchBtn = wrap.querySelector('button[data-a="switch"]');
    const steadyBtn = wrap.querySelector("." + PRE + "steady"), capEl = wrap.querySelector("." + PRE + "cap");
    const losses = api.store.get("losses", 0);
    let capTimer = 0;
    function cap(title, text, quote, ms = 5000) {
      capEl.innerHTML = ""; const b = document.createElement("b"); b.textContent = title; capEl.appendChild(b);
      if (quote) { const q = document.createElement("q"); q.textContent = quote; capEl.appendChild(q); }
      if (text) capEl.appendChild(document.createTextNode(text));
      capEl.style.opacity = 1; clearTimeout(capTimer); capTimer = K.after(ms, () => (capEl.style.opacity = 0));
    }

    // state
    const toys = [
      { name: "You", kind: "cat", col: C.amber, x: 6.2, lvl: 1, sx: 0, plan: [], moved: false, grace: 0, creaked: false },
      { name: "Jamie", kind: "bear", col: "#c2925f", x: 9.4, lvl: 0, plan: [], moved: false, grace: 0, creaked: false },
    ];
    if (ART) { toys[0].x = PLATE_GEOM.toys[0]; toys[1].x = PLATE_GEOM.toys[1]; }
    toys.forEach((t) => (t.y = t.lvl * FLOOR));
    toys[0].face = "medallion-narrator"; toys[1].face = "medallion-jamie";
    if (stg === 0) { toys.pop(); toys[0].x = 9.4; toys[0].lvl = 0; toys[0].y = 0; }
    const guests = GUESTS.map((gd) => ({ ...gd, ...(ART ? { ex: PLATE_GEOM.guests[gd.id][0], ey: (gd.ey > FLOOR ? FLOOR : 0) + PLATE_GEOM.guests[gd.id][1], face: PLATE_GEOM.guests[gd.id][2] } : {}), dread: 0, open: 0, warn: 0, next: gd.sleep[0] + rng() * (gd.sleep[1] - gd.sleep[0]), look: gd.face, lookAt: null }));
    // the guest who shut the pack in the cupboard: the one made It in Parlour, or Noor
    const gIt = guests.find((gu) => gu.id === itId) || guests[0];
    let sel = 0, still = false, stillToggle = false, started = false, over = false, speed = 1, t = 0;
    let memories = 6, hunger = stg === 0 ? 40 : 60, slips = 0, cooldown = 0, msg = "", msgT = 0, flash = 0, pack = 0;
    let lightBy = null, lightT = 0, pulseT = 2, pulseOn = false, steadied = false, tremor = false, shakes = 0, shakeT = 0, gentle = false;
    let saidAna = false, saidVoice = false, saidHunger = false, saidThree = false, saidLight = false;
    // night two: the heap in the cupboard, then Proximity
    let variant = "sound", stage = "night", heapT = 0, pushes = 0, misses = 0, beatUsed = -1, foundT = 0, heapLine = -1, heapSteady = 0, settled = 0;
    let climbed = false;
    function knockRect() { const [x, y] = S(KNOCK.x, KNOCK.lvl * FLOOR + KNOCK.h), w = Math.max(20, 0.4 * L.k), h2 = w * 250 / 180; return { x: x - w / 2, y: y - h2 / 2, w, h: h2 }; }
    function knock() { try { if (api.thread) api.thread.found(); } catch { /* storage off */ } capEl.style.opacity = 0; msg = "Three knocks in the wall. Three back, a little lower. None of us had hands for it."; msgT = performance.now() + 2600; }
    const pops = [];
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }
    let L = null, plate = null;
    const roomOf = (x, lvl) => ROOMS.find((r) => r.lvl === lvl && x >= r.x0 && x <= r.x1);
    const clock = () => { const m = 23 * 60 + (t / (NIGHT * speed)) * 360; const h = Math.floor(m / 60) % 24; return `${String(h).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`; };

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 860;
      const cards = wide ? { w: Math.min(190, W * 0.17) } : { h: 64 };
      const top = 54, bottom = W < 560 ? 104 : 60;
      const availW = (wide ? W - cards.w - 40 : W - 24), availH = H - top - bottom - (wide ? 0 : cards.h + 8) - 26;
      const totalH = CELLAR + FLOOR * 2 + ROOF;
      let k = Math.max(10, Math.min(availW / (W_M + 1.4), availH / totalH)), ky = k;
      let ox = (wide ? 20 : 12) + (availW - W_M * k) / 2;
      let base = top + ROOF * k + FLOOR * 2 * k + (availH - totalH * k) / 2 + 8;
      let pr = null;
      if (ART) {
        const sc = Math.min(availW / PLATE.src[2], availH / PLATE.src[3]);
        pr = { x: (wide ? 20 : 12) + (availW - PLATE.src[2] * sc) / 2, y: top + 14 + (availH - PLATE.src[3] * sc) / 2, w: PLATE.src[2] * sc, h: PLATE.src[3] * sc };
        k = PLATE.wide * sc / W_M; ky = PLATE.floor * sc / FLOOR; ox = pr.x + PLATE.x0 * sc; base = pr.y + PLATE.ground * sc;
      }
      L = { W, H, wide, k, ky, ox, base, top, cards, bottom, pr, availW, availH };
      plate = null; A.flush();
    }
    const S = (x, y) => [L.ox + x * L.k, L.base - y * L.ky];

    // ---- the plate: rooms, wallpaper at the cut edge, furniture -----------------------------
    function paperGrain(x, w, h) {
      x.fillStyle = C.paper; x.fillRect(0, 0, w, h);
      for (let i = 0; i < (w * h) / 60; i++) { x.fillStyle = Math.random() < 0.5 ? "rgba(107,74,50,.05)" : "rgba(255,255,255,.12)"; x.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2); }
    }
    function sprigs(x, rx, ry, rw, rh, ground, sprig, s) {
      x.fillStyle = ground; x.fillRect(rx, ry, rw, rh);
      x.fillStyle = sprig; x.globalAlpha = 0.55;
      for (let yy = ry + s / 4; yy < ry + rh; yy += s) for (let xx = rx + s / 4 + ((Math.floor((yy - ry) / s) % 2) * s) / 2; xx < rx + rw; xx += s) { x.beginPath(); x.arc(xx, yy, 1.4, 0, 7); x.fill(); x.beginPath(); x.arc(xx - 2.4, yy, 0.9, 0, 7); x.arc(xx + 2.4, yy, 0.9, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }
    function buildPlate() {
      const { W, H, k } = L;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d");
      paperGrain(x, W, H);
      const P = (mx, my) => [L.ox + mx * k, L.base - my * k];
      // ground line and earth
      const [gx0, gy0] = P(-0.6, 0), [gx1] = P(W_M + 0.6, 0);
      x.fillStyle = "#d8c9a6"; x.fillRect(gx0 - 10, gy0, gx1 - gx0 + 20, CELLAR * k + 10);
      x.strokeStyle = "rgba(42,33,27,.25)"; for (let i = 0; i < 60; i++) { const ex = gx0 + ((i * 37) % (gx1 - gx0)), ey = gy0 + 6 + ((i * 53) % (CELLAR * k)); x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex + 6, ey + 2); x.stroke(); }
      // cellar
      const [cx0, cy0] = P(0.3, -0.25), [cx1, cy1] = P(W_M - 0.3, -CELLAR + 0.25);
      x.fillStyle = "#8a93a6"; x.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      x.strokeStyle = C.ink; x.lineWidth = 1.2; x.strokeRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      for (let i = 0; i < 6; i++) { const [bx, by] = P(1 + i * 1.9, -CELLAR + 0.25); x.fillStyle = i % 2 ? C.cedar : "#c8c3b0"; const w = (i % 2 ? 0.9 : 0.45) * k, h = (i % 2 ? 0.8 : 0.6) * k; x.fillRect(bx, by - h, w, h); x.strokeRect(bx, by - h, w, h); if (i % 2) { x.beginPath(); x.moveTo(bx, by - h); x.lineTo(bx + w, by); x.stroke(); } }
      x.fillStyle = C.ink; x.font = `${Math.max(12, k * 0.22)}px 'IM Fell English',Georgia,serif`; x.fillText("CELLAR", cx0 + 6, cy0 + 15);
      // rooms
      ROOMS.forEach((r) => {
        const [rx, ry] = P(r.x0, (r.lvl + 1) * FLOOR), [rx2, ry2] = P(r.x1, r.lvl * FLOOR);
        sprigs(x, rx, ry, rx2 - rx, ry2 - ry, r.wall, r.sprig, Math.max(10, k * 0.42));
        // night wash, blue-grey without black
        x.fillStyle = "rgba(86,98,122,.28)"; x.fillRect(rx, ry, rx2 - rx, ry2 - ry);
        x.font = `${Math.max(12, k * 0.21)}px 'IM Fell English',Georgia,serif`; x.textBaseline = "top";
        const nm = W < 560 && r.id === "landing" ? "LANDING" : r.name;
        const nw = x.measureText(nm).width + 8; x.fillStyle = "rgba(246,241,228,.85)"; x.fillRect(rx + 3, ry + 3, nw, Math.max(15, k * 0.26));
        x.fillStyle = C.ink; x.fillText(nm, rx + 7, ry + 5);
      });
      // floors and walls at the cut: wood with the wallpaper shown at the edge
      x.strokeStyle = C.ink; x.lineWidth = 1.4;
      for (let lvl = 0; lvl <= 2; lvl++) {
        const [fx0, fy] = P(-0.15, lvl * FLOOR), [fx1] = P(W_M + 0.15, lvl * FLOOR);
        x.fillStyle = C.cedar; x.fillRect(fx0, fy - 3, fx1 - fx0, 7); x.strokeRect(fx0, fy - 3, fx1 - fx0, 7);
      }
      [0, 4, 8, 12].forEach((wx) => {
        for (let lvl = 0; lvl < 2; lvl++) {
          const [px, py] = P(wx, (lvl + 1) * FLOOR), [, py2] = P(wx, lvl * FLOOR);
          const outer = wx === 0 || wx === 12;
          const door = !outer;
          const doorTop = L.base - (lvl * FLOOR + 2.1) * k;
          x.fillStyle = C.cedarD; x.fillRect(px - 3, py, 6, (door ? doorTop : py2) - py);
          x.fillStyle = "#c9a7b0"; x.fillRect(px - 1, py, 2, (door ? doorTop : py2) - py); // wallpaper at the cut edge
          x.strokeRect(px - 3, py, 6, (door ? doorTop : py2) - py);
        }
      });
      // roof with shingles and a round window
      const [r0x, r0y] = P(-0.7, 2 * FLOOR), [r1x] = P(W_M + 0.7, 2 * FLOOR), [rpx, rpy] = P(W_M / 2, 2 * FLOOR + ROOF);
      x.fillStyle = "#c9a184"; x.beginPath(); x.moveTo(r0x, r0y); x.lineTo(rpx, rpy); x.lineTo(r1x, r0y); x.closePath(); x.fill();
      x.save(); x.clip(); x.strokeStyle = "rgba(42,33,27,.35)"; x.lineWidth = 1;
      for (let yy = rpy; yy < r0y; yy += Math.max(5, k * 0.18)) { x.beginPath(); x.moveTo(r0x, yy); x.lineTo(r1x, yy); x.stroke(); for (let xx = r0x + ((yy / 7) % 2) * 6; xx < r1x; xx += 12) { x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy + 5); x.stroke(); } }
      x.restore(); x.strokeStyle = C.ink; x.lineWidth = 1.4; x.beginPath(); x.moveTo(r0x, r0y); x.lineTo(rpx, rpy); x.lineTo(r1x, r0y); x.closePath(); x.stroke();
      const [wx, wy] = P(W_M / 2, 2 * FLOOR + ROOF * 0.42); x.fillStyle = "#e9c98a"; x.beginPath(); x.arc(wx, wy, k * 0.32, 0, 7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(wx - k * 0.32, wy); x.lineTo(wx + k * 0.32, wy); x.moveTo(wx, wy - k * 0.32); x.lineTo(wx, wy + k * 0.32); x.stroke();
      // stairs in the hall
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const a = P(STAIR.x0 + (STAIR.x1 - STAIR.x0) * i / steps, FLOOR * (i + 1) / steps), b = P(STAIR.x1, 0);
        x.fillStyle = i === 2 ? "#a77b55" : "#b8916b"; x.fillRect(a[0], a[1], b[0] - a[0], (FLOOR * k) / steps); x.strokeRect(a[0], a[1], b[0] - a[0], (FLOOR * k) / steps);
      }
      // furniture: beds, couch, shelf, counter
      const furn = (mx, my, mw, mh, col) => { const [fx, fy] = P(mx, my + mh); x.fillStyle = col; x.fillRect(fx, fy, mw * k, mh * k); x.strokeRect(fx, fy, mw * k, mh * k); };
      furn(0.3, FLOOR, 2.6, 0.55, "#e5d3d9"); furn(0.3, FLOOR + 0.55, 0.35, 0.6, C.cedar);
      furn(9.1, FLOOR, 2.6, 0.55, "#d9dfe5"); furn(11.35, FLOOR + 0.55, 0.35, 0.6, C.cedar);
      furn(0.3, 0, 2.6, 0.5, C.moss); furn(0.3, 0.5, 0.3, 0.4, C.moss);
      furn(4.4, FLOOR + 1.3, 3.2, 0.1, C.cedar); // the landing shelf
      furn(8.6, 0, 2.2, 0.95, "#c8c3b0"); furn(11.0, 0, 0.7, 1.4, C.cedar);
      // Wes's lamp, on
      const [lx, ly] = P(11.55, FLOOR + 1.3); const lg = x.createRadialGradient(lx, ly, 2, lx, ly, k * 1.4); lg.addColorStop(0, "rgba(233,201,138,.75)"); lg.addColorStop(1, "rgba(233,201,138,0)"); x.fillStyle = lg; x.beginPath(); x.arc(lx, ly, k * 1.4, 0, 7); x.fill();
      x.fillStyle = "#e9c98a"; x.beginPath(); x.moveTo(lx - 6, ly); x.lineTo(lx + 6, ly); x.lineTo(lx + 4, ly - 8); x.lineTo(lx - 4, ly - 8); x.closePath(); x.fill(); x.stroke();
      // plate border and caption
      x.strokeStyle = C.ink; x.lineWidth = 1; x.strokeRect(6, 6, W - 12, H - 12); x.strokeRect(10, 10, W - 20, H - 20);
      x.font = `italic ${W < 560 ? 13 : 15}px 'IM Fell English',Georgia,serif`; x.fillStyle = C.ink; x.textBaseline = "alphabetic";
      const [, capY] = P(0, -CELLAR - 0.1);
      x.fillText(W < 560 ? "Plate III. THE CABIN IN SECTION, BY NIGHT." : "Plate III. THE CABIN IN SECTION, BY NIGHT. Move while no eye is open.", L.ox, Math.min(H - L.bottom - 4, capY + 18));
      return c;
    }

    // ---- drawing the live parts -------------------------------------------------------------
    function toy(x, y, s, body, glow, selected, kind = "cat", face) {
      const d = Math.max(22, Math.round(30 * s));
      if (face && A.sprite(face, d, d, FACE)) {
        if (glow) { const gr = g.createRadialGradient(x, y - d / 2, 1, x, y - d / 2, d * 1.1); gr.addColorStop(0, "rgba(227,154,45,.7)"); gr.addColorStop(1, "rgba(227,154,45,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y - d / 2, d * 1.1, 0, 7); g.fill(); }
        if (selected) { g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([3, 2]); g.beginPath(); g.arc(x, y - 12 * s, 24 * s, 0, 7); g.stroke(); g.setLineDash([]); }
        A.draw(g, face, x - d / 2, y - d, d, d, FACE);
        g.strokeStyle = C.ink; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y - d / 2, d / 2, 0, 7); g.stroke();
        return;
      }
      if (glow) { const gr = g.createRadialGradient(x, y - 10 * s, 1, x, y - 10 * s, 30 * s); gr.addColorStop(0, "rgba(227,154,45,.7)"); gr.addColorStop(1, "rgba(227,154,45,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y - 10 * s, 30 * s, 0, 7); g.fill(); }
      if (selected) { g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([3, 2]); g.beginPath(); g.arc(x, y - 12 * s, 24 * s, 0, 7); g.stroke(); g.setLineDash([]); }
      g.fillStyle = body; g.strokeStyle = C.ink; g.lineWidth = 1.3;
      g.beginPath(); g.ellipse(x, y - 8 * s, 9 * s, 9 * s, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.arc(x, y - 21 * s, 8 * s, 0, 7); g.fill(); g.stroke();
      [-5, 5].forEach((dx) => { g.beginPath(); if (kind === "bear") g.arc(x + dx * 1.1 * s, y - 27 * s, 3.4 * s, 0, 7); else { g.moveTo(x + dx * s - 3 * s, y - 26 * s); g.lineTo(x + dx * s, y - 33 * s); g.lineTo(x + dx * s + 3 * s, y - 26 * s); } g.fill(); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(x + dx * 0.55 * s, y - 22 * s, 1.4 * s, 0, 7); g.fill(); g.fillStyle = body; });
    }
    function sleeper(gu, s) {
      const [x, y] = S(gu.ex, gu.ey);
      g.fillStyle = C.dust; g.strokeStyle = C.ink; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, 7 * s, 0, 7); g.fill(); g.stroke();
      // eye: a closed line or an open dot
      const dir = Math.cos(gu.look) > 0 ? 1 : -1;
      if (gu.open > 0) { g.fillStyle = C.ink; g.beginPath(); g.arc(x + dir * 3 * s, y - 1 * s, 1.6 * s, 0, 7); g.fill(); }
      else { g.beginPath(); g.moveTo(x + dir * 1 * s, y - 1 * s); g.lineTo(x + dir * 5 * s, y - 1 * s); g.stroke(); }
    }
    function cone(gu, now) {
      const r = ROOMS.find((q) => q.id === gu.room);
      const [ex, ey] = S(gu.ex, gu.ey);
      const [rx0, ry0] = S(0, (r.lvl + 1) * FLOOR), [rx1, ry1] = S(W_M, r.lvl * FLOOR);
      g.save(); g.beginPath(); g.rect(rx0, ry0, rx1 - rx0, ry1 - ry0); g.clip();
      const a0 = -gu.look - CONE / 2, a1 = -gu.look + CONE / 2, R = REACH * L.k;
      g.translate(ex, ey); g.scale(1, L.ky / L.k); g.translate(-ex, -ey);
      g.beginPath(); g.moveTo(ex, ey); g.arc(ex, ey, R, a0, a1); g.closePath();
      if (gu.open > 0) {
        const gr = g.createRadialGradient(ex, ey, 2, ex, ey, R); gr.addColorStop(0, "rgba(246,236,190,.75)"); gr.addColorStop(1, "rgba(246,236,190,.12)");
        g.fillStyle = gr; g.fill();
        g.save(); g.clip(); g.strokeStyle = "rgba(42,33,27,.18)"; g.lineWidth = 1; for (let k2 = -R; k2 < R * 2; k2 += 6) { g.beginPath(); g.moveTo(ex + k2, ey - R); g.lineTo(ex + k2 - R, ey + R); g.stroke(); } g.restore();
        g.strokeStyle = "rgba(42,33,27,.6)"; g.lineWidth = 1; g.stroke();
      } else if (gu.warn > 0) {
        g.strokeStyle = `rgba(184,50,42,${api.reducedMotion ? 0.7 : 0.4 + 0.4 * Math.sin(now / 60)})`; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
      }
      g.restore();
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, k, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stage !== "night") { drawHeap(now); drawPops(now); K.frame(draw); return; }
      if (ART) {
        g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
        A.draw(g, "dollhouse-night", L.pr.x, L.pr.y, L.pr.w, L.pr.h, { src: PLATE.src, key: "house" });
        g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(6, 6, W - 12, H - 12); g.strokeRect(10, 10, W - 20, H - 20);
      } else {
        if (!plate) plate = buildPlate();
        g.drawImage(plate, 0, 0, W, H);
      }
      const s = Math.max(0.55, k / 46);
      // Proximity: the marked spots, as small stitched crosses on the floor
      if (variant === "cupboard") SETTLE.forEach((sp) => {
        const [x, y] = S(sp.x, sp.lvl * FLOOR), taken = toys.some((ty) => ty.settled === sp), r = Math.max(6, 9 * s);
        g.strokeStyle = taken ? C.ink : C.red; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - r, y - r * 2); g.lineTo(x + r, y); g.moveTo(x + r, y - r * 2); g.lineTo(x - r, y); g.stroke();
        g.setLineDash([3, 3]); g.lineWidth = 1.2; g.beginPath(); g.arc(x, y - r, r * 1.9, 0, 7); g.stroke(); g.setLineDash([]);
      });
      if (lightT > 0) {
        const [lx0, ly0] = S(HALL[0], 2 * FLOOR), [lx1, ly1] = S(HALL[1], 0);
        g.fillStyle = `rgba(246,226,160,${0.28 + 0.12 * Math.min(1, lightT)})`; g.fillRect(lx0, ly0, lx1 - lx0, ly1 - ly0);
        g.strokeStyle = C.amber; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(lx0 + 2, ly0 + 2, lx1 - lx0 - 4, ly1 - ly0 - 4); g.setLineDash([]);
        g.fillStyle = C.ink; g.font = "700 13px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top"; g.fillText(`HALL LIGHT ON · ${Math.ceil(lightT)} s`, (lx0 + lx1) / 2, ly0 + 22);
      }
      // mirrors: a gilt oval on the wall; when a sleeper's open eye falls on it, the place it shows
      mirrors.forEach((m) => {
        const [mx, my] = S(m.x, m.lvl * FLOOR + 1.25), rw = Math.max(5, 7 * s), rh = Math.max(8, 11 * s), on = lit(m);
        if (on) {
          const a = m.stair ? S(STAIR.x0, 0.1) : S(m.x0, m.lvl * FLOOR + 0.05), b = m.stair ? S(STAIR.x1, FLOOR - 0.1) : S(m.x1, m.lvl * FLOOR + 0.05), top = m.stair ? 0.9 : 1.0;
          g.fillStyle = "rgba(246,236,190,.42)"; g.strokeStyle = "rgba(42,33,27,.55)"; g.lineWidth = 1;
          g.beginPath(); g.moveTo(mx, my); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); if (m.stair) { g.lineTo(b[0], b[1] - top * L.ky); g.lineTo(a[0], a[1] - top * L.ky); } g.closePath(); g.fill(); g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
          g.font = "700 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "bottom"; const lbl = `IN THE MIRROR: ${on.name.toUpperCase()}`, tw = g.measureText(lbl).width + 8, lx = (a[0] + b[0]) / 2, ly = Math.min(a[1], b[1]) - (m.stair ? 4 : 1.15 * L.ky);
          g.fillStyle = C.red; g.fillRect(lx - tw / 2, ly - 16, tw, 16); g.fillStyle = C.bone; g.fillText(lbl, lx, ly - 2);
        }
        g.fillStyle = on ? "#f6ecbe" : "#aab4c4"; g.strokeStyle = "#8a6a2c"; g.lineWidth = Math.max(2, 2.6 * s);
        g.beginPath(); g.ellipse(mx, my, rw, rh, 0, 0, 7); g.fill(); g.stroke();
        g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 1; g.beginPath(); g.moveTo(mx - rw * 0.4, my - rh * 0.1); g.lineTo(mx + rw * 0.1, my - rh * 0.6); g.stroke();
      });
      // on the wall at the cut, between the bedroom and the landing
      if (stg === 2) { const kr = knockRect(); A.draw(g, "thread-guest", kr.x, kr.y, kr.w, kr.h, { src: [150, 96, 180, 250], key: "knock" }); }
      guests.forEach((gu) => cone(gu, now));
      guests.forEach((gu) => sleeper(gu, s));
      // toys and their walk paths
      toys.forEach((ty, i) => {
        if (ty.plan.length && i === sel) {
          g.strokeStyle = C.red; g.lineWidth = 1.2; g.setLineDash([2, 4]); g.beginPath();
          let [px, py] = S(ty.x, ty.y + 0.05); g.moveTo(px, py);
          ty.plan.forEach((w) => { const [qx, qy] = S(w.x, w.y + 0.05); g.lineTo(qx, qy); });
          g.stroke(); g.setLineDash([]);
          const end = ty.plan[ty.plan.length - 1], [qx, qy] = S(end.x, end.y); g.fillStyle = C.red; g.fillRect(qx - 3, qy - 3, 6, 6);
        }
        let [x, y] = S(ty.x, ty.y);
        if (i === 0 && shakeT > 0 && !api.reducedMotion) x += Math.sin(now / 30) * 3 * shakeT;
        toy(x, y, s, ty.col, i === 0, i === sel && !ty.settled, ty.kind, ty.face);
        if (ty.auto && !ty.settled) {
          const txt = hum ? "LILA · humming, staying" : ty.wait > 0 ? "LILA" : ty.heldToo ? "LILA · HELD WITH YOU" : "LILA · WALKING";
          g.font = "700 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "bottom"; const tw = g.measureText(txt).width + 8;
          g.fillStyle = ty.heldToo || hum || ty.wait > 0 ? C.bone : C.red; g.strokeStyle = C.ink; g.lineWidth = 1; g.fillRect(x - tw / 2, y - 34 * s - 18, tw, 16); g.strokeRect(x - tw / 2, y - 34 * s - 18, tw, 16);
          g.fillStyle = ty.heldToo || hum || ty.wait > 0 ? C.ink : C.bone; g.fillText(txt, x, y - 34 * s - 4);
          if (!hum && guests.some((gu) => sees(gu, ty.x, ty.y)) && !ty.heldToo && ty.plan.length) { g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 12 * s, 28 * s, 0, 7); g.stroke(); }
          return;
        }
        if (ty.settled) { g.font = "700 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "bottom"; const tw = g.measureText("SETTLED").width + 8; g.fillStyle = C.ink; g.fillRect(x - tw / 2, y - 34 * s - 16, tw, 16); g.fillStyle = C.bone; g.fillText("SETTLED", x, y - 34 * s - 2); return; }
        if (i === sel && still) { const d = Math.max(48, 66 * s); A.draw(g, "ui-hold-still-ring", x - d / 2, y - 14 * s - d / 2, d, d, { src: [10, 10, 300, 300], round: true, key: "ring" }); toy(x, y, s, ty.col, i === 0, false, ty.kind, ty.face); }
        if (i === 0 && pulseOn && !steadied) A.draw(g, "ui-steady-mark", x - 54, y - 34 * s - 56, 108, 36);
        const exposed = guests.some((gu) => sees(gu, ty.x, ty.y)) || (lightT > 0 && ty.x > HALL[0] && ty.x < HALL[1]);
        if (exposed) { g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 12 * s, 28 * s, 0, 7); g.stroke(); }
        if (i === sel && (still || exposed)) {
          const txt = still ? "HOLDING STILL" : "IN SIGHT: DON'T MOVE";
          g.font = "700 12px Karla,Arial,sans-serif"; const tw = g.measureText(txt).width + 12;
          g.fillStyle = still ? C.bone : C.red; g.strokeStyle = C.ink; g.lineWidth = 1; g.fillRect(x + 12 * s, y - 34 * s - 8, tw, 18); g.strokeRect(x + 12 * s, y - 34 * s - 8, tw, 18);
          g.fillStyle = still ? C.ink : C.bone; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(txt, x + 12 * s + 6, y - 34 * s + 1);
        }
      });
      // door marks for Three taps
      DOORS.forEach((d) => { const [x, y] = S(d.x, d.lvl * FLOOR + 1.0); const both = toys.every((ty) => ty.lvl === d.lvl && Math.abs(ty.x - d.x) < 0.8 && !ty.plan.length); g.fillStyle = both ? C.red : "rgba(42,33,27,.35)"; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); });
      // night clock along the top
      const cx0 = 34, cx1 = (wide ? W - L.cards.w - 40 : W - 24), cy = 30;
      g.strokeStyle = C.night; g.lineWidth = 2; g.beginPath(); g.moveTo(cx0, cy); g.lineTo(cx1, cy); g.stroke();
      g.fillStyle = C.ink; g.font = "12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "bottom";
      for (let h = 0; h <= 6; h++) { const x = cx0 + (cx1 - cx0) * h / 6; g.fillRect(x - 0.5, cy - 4, 1, 8); if (W > 420 || h % 2 === 0) g.fillText(`${String((23 + h) % 24).padStart(2, "0")}:00`, x, cy - 6); }
      const p = Math.min(1, t / (NIGHT * speed)), mx = cx0 + (cx1 - cx0) * p;
      g.fillStyle = C.amber; g.beginPath(); g.moveTo(mx - 6, cy + 12); g.lineTo(mx + 6, cy + 12); g.lineTo(mx, cy + 3); g.closePath(); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke();
      // status line
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = "700 14px Karla,Arial,sans-serif"; g.fillStyle = C.ink;
      const avg = guests.reduce((a, gu) => a + gu.dread, 0) / guests.length;
      let sx0 = cx0;
      const seg = (txt, col) => { g.fillStyle = col || C.ink; g.fillText(txt, sx0, cy + 28); sx0 += g.measureText(txt).width + 14; };
      seg(clock()); seg(`${toys[sel].name === "You" ? "the cat" : toys[sel].name}`);
      seg(`memories ${"●".repeat(Math.max(0, memories))}${"○".repeat(Math.max(0, 6 - memories))}`, memories <= 2 ? C.red : C.ink);
      if (W >= 560) seg(`hunger ${Math.round(hunger)}${hunger >= 75 ? " · trembling" : ""}`, hunger >= 75 ? C.red : C.ink);
      if (variant === "climb") seg(`to the door ${Math.max(0, toys[0].plan.reduce((a, w, k) => a + Math.hypot(w.x - (k ? toys[0].plan[k - 1].x : toys[0].x), w.y - (k ? toys[0].plan[k - 1].y : toys[0].y)), 0)).toFixed(1)} m`);
      else if (variant === "cupboard") seg(`settled ${settled}/2`, settled >= 2 ? "#4f6b2c" : C.ink);
      else seg(`dread ${Math.floor(avg)}/${TARGET}`, avg >= TARGET ? "#4f6b2c" : C.ink);
      if (W < 560) { sx0 = cx0; g.font = "700 13px Karla,Arial,sans-serif"; g.fillStyle = hunger >= 75 ? C.red : C.ink; g.fillText(`hunger ${Math.round(hunger)}${hunger >= 75 ? " · trembling: Steady on the beat" : ""}`, cx0, cy + 46); }
      if (pulseOn) { g.fillStyle = steadied ? "#4f6b2c" : C.red; g.beginPath(); g.arc(cx1 - 8, cy + 23, 8, 0, 7); g.fill(); }
      // guest cards
      guests.forEach((gu, i) => {
        let x, y, w, h;
        if (wide && A.has("ui-guest-card")) {
          h = Math.min((H - L.bottom - 50) / 3 - 8, L.cards.w * 1.4); w = h / 1.4; x = W - 20 - (L.cards.w + w) / 2; y = 44 + i * (h + 8);
          const u = w / 300;
          g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 3, y + 4, w, h);
          if (A.draw(g, "ui-guest-card", x, y, w, h)) {
            // in the oval: the sleeper's eye; on the tag: the name; up the side: dread, stitch by stitch
            const cx = x + 132 * u, cy = y + 172 * u, er = 34 * u;
            g.strokeStyle = C.bone; g.fillStyle = C.bone; g.lineWidth = Math.max(1.5, 3 * u); g.lineCap = "round";
            if (gu.open > 0) { g.beginPath(); g.ellipse(cx, cy, er, er * 0.55, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, er * 0.3, 0, 7); g.fill(); }
            else { g.beginPath(); g.arc(cx, cy - er * 0.4, er, 0.25, Math.PI - 0.25); g.stroke(); if (gu.warn > 0) { g.strokeStyle = C.amber; g.beginPath(); g.arc(cx, cy - er * 0.4, er * 1.3, 0.5, Math.PI - 0.5); g.stroke(); } }
            g.lineCap = "butt";
            g.textAlign = "center"; g.textBaseline = "middle"; g.font = `${Math.max(12, Math.round(13 * u * 1.9))}px Karla,Arial,sans-serif`; g.fillStyle = gu.open > 0 ? "#f3b3a6" : C.bone;
            g.fillText(gu.open > 0 ? "eyes open" : gu.warn > 0 ? "stirring" : t < gu.awakeUntil * speed ? "reading" : gu.lamp ? "asleep, lamp on" : "asleep", cx, cy + 64 * u, 170 * u);
            g.fillStyle = C.ink; g.font = `italic ${Math.max(13, Math.round(24 * u))}px 'IM Fell English',Georgia,serif`; g.fillText(gu.name, x + 132 * u, y + 368 * u);
            for (let q = 0; q < 20; q++) if (q < gu.dread / 5) { g.fillStyle = q >= 13 ? C.red : C.rust; g.fillRect(x + 249 * u, y + (331 - q * 14) * u, 20 * u, 8 * u); }
            g.font = "700 12px Karla,Arial,sans-serif"; g.fillStyle = C.ink; g.fillText(String(Math.round(gu.dread)), x + 259 * u, y + 356 * u);
            return;
          }
        }
        if (wide) { w = L.cards.w; h = 84; x = W - w - 20; y = 44 + i * (h + 12); }
        else { w = (W - 24 - 16) / 3; h = L.cards.h; x = 12 + i * (w + 8); y = H - L.bottom - h - 4; }
        g.fillStyle = C.bone; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(x, y, w, h); g.strokeRect(x + 3, y + 3, w - 6, h - 6);
        if (i === 0 && wide) { g.font = "12px Georgia,serif"; g.fillStyle = C.ink; g.textAlign = "left"; g.fillText("GUESTS", x, y - 6); }
        const pr = Math.min(16, h * 0.24);
        g.fillStyle = C.dust; g.beginPath(); g.ellipse(x + 10 + pr, y + h / 2, pr, pr * 1.2, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = C.night; g.beginPath(); g.arc(x + 10 + pr, y + h / 2 - pr * 0.25, pr * 0.42, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 10 + pr, y + h / 2 + pr * 0.75, pr * 0.7, pr * 0.42, 0, Math.PI, 0); g.fill();
        g.fillStyle = C.ink; g.textAlign = "left"; g.font = `italic ${wide ? 14 : 12}px 'IM Fell English',Georgia,serif`;
        const tx = x + 16 + pr * 2;
        g.fillText(gu.name, tx, y + (wide ? 22 : 18));
        g.font = `${wide ? 13 : 12}px Karla,Arial,sans-serif`; g.fillStyle = gu.open > 0 ? C.red : C.ink;
        g.fillText(gu.open > 0 ? "eyes open" : gu.warn > 0 ? "stirring" : t < gu.awakeUntil * speed ? "reading" : wide ? (gu.lamp ? "asleep, lamp on" : "asleep") : "asleep", tx, y + (wide ? 38 : 32));
        const bw = x + w - 10 - tx, bh = wide ? 14 : 10, by = y + h - bh - 10;
        g.fillStyle = C.cream; g.fillRect(tx, by, bw, bh); g.strokeStyle = C.ink; g.strokeRect(tx, by, bw, bh);
        g.save(); g.beginPath(); g.rect(tx, by, bw * Math.min(1, gu.dread / 60), bh); g.clip();
        g.strokeStyle = C.red; for (let q = -20; q < bw; q += 4) { g.beginPath(); g.moveTo(tx + q, by + bh); g.lineTo(tx + q + bh, by); g.stroke(); }
        g.restore();
        const mk = tx + bw * TARGET / 60; g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(mk, by - 3); g.lineTo(mk, by + bh + 3); g.stroke(); g.lineWidth = 1;
        if (wide) { g.font = "700 13px Karla,Arial,sans-serif"; g.fillStyle = C.ink; g.textAlign = "right"; g.fillText(`${Math.round(gu.dread)}`, x + w - 10, y + 22); g.textAlign = "left"; }
      });
      if (flash > 0) { g.fillStyle = `rgba(184,50,42,${flash * 0.25})`; g.fillRect(0, 0, W, H); }
      if (msg && now - msgT < 2600) {
        g.font = "700 15px Karla,Arial,sans-serif"; const w = Math.min(W - 24, g.measureText(msg).width + 26);
        const my = L.base - 2 * FLOOR * L.ky - 46;
        g.fillStyle = C.bone; g.strokeStyle = C.ink; g.lineWidth = 1; g.fillRect(W / 2 - w / 2, my, w, 32); g.strokeRect(W / 2 - w / 2, my, w, 32); g.strokeRect(W / 2 - w / 2 + 3, my + 3, w - 6, 26);
        g.fillStyle = C.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(msg, W / 2, my + 16, w - 16);
      }
      drawPops(now);
      K.frame(draw);
    }
    function drawPops(now) {
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1500;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 28;
        g.globalAlpha = 1 - a * a; g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.lineWidth = 4; g.strokeStyle = C.bone; g.strokeText(p.text, p.x, p.y - rise); g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise); g.globalAlpha = 1;
      }
    }

    // ---- night two: the heap in the linen cupboard --------------------------------------------
    function heapRect() {
      // on a narrow screen the plate is cropped to the cupboard, the chair and the lamp
      const { W, H, bottom } = L, src = W < 560 ? [430, 80, 1140, 780] : [0, 0, 1600, 900];
      const aw = W - 24, ah = H - 50 - bottom - 8, sc = Math.min(aw / src[2], ah / src[3]);
      return { x: 12 + (aw - src[2] * sc) / 2, y: 46 + (ah - src[3] * sc) / 2, w: src[2] * sc, h: src[3] * sc, sc, src };
    }
    function drawHeap(now) {
      const { W, H } = L, R = heapRect(), X = (px) => R.x + (px - R.src[0]) * R.sc, Y = (py) => R.y + (py - R.src[1]) * R.sc;
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      if (!A.draw(g, "dollhouse-cupboard", R.x, R.y, R.w, R.h, { src: R.src, key: "heap" + R.src[0] })) {
        g.fillStyle = "#9aa3b5"; g.fillRect(R.x, R.y, R.w, R.h); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.strokeRect(R.x, R.y, R.w, R.h);
        g.fillStyle = "#55607a"; g.fillRect(X(520), Y(190), R.sc * 420, R.sc * 550); g.strokeRect(X(520), Y(190), R.sc * 420, R.sc * 550);
        g.fillStyle = C.amber; [[612, 666], [680, 636], [734, 644], [782, 674], [838, 692]].forEach(([ex, ey]) => { g.beginPath(); g.arc(X(ex), Y(ey), 3, 0, 7); g.arc(X(ex + 15), Y(ey), 3, 0, 7); g.fill(); });
      }
      const hx = X(730), hy = Y(660), beat = (heapT / (HEAP_BEAT * speed)) % 1, near = Math.min(beat, 1 - beat) * HEAP_BEAT * speed;
      // the shared pulse, beating on the heap
      if (stage === "heap") {
        const swell = api.reducedMotion ? (near < HEAP_WIN ? 1 : 0) : Math.max(0, 1 - near / 0.5);
        const d = Math.max(90, R.sc * 300) * (0.8 + 0.3 * swell);
        g.globalAlpha = 0.55 + 0.45 * swell;
        if (!A.draw(g, "ui-pulse-ring", hx - d / 2, hy - d / 2, d, d, { round: true, key: "pulse" })) { g.strokeStyle = C.amber; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy, d / 2, 0, 7); g.stroke(); }
        g.globalAlpha = 1;
        // the door: how far it has been pressed
        g.fillStyle = C.ink; g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        const lbl = `press on the beat  ${"●".repeat(pushes)}${"○".repeat(3 - pushes)}`, lw = g.measureText(lbl).width + 20;
        g.fillStyle = C.bone; g.fillRect(hx - lw / 2, Y(150) - 14, lw, 28); g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(hx - lw / 2, Y(150) - 14, lw, 28);
        g.fillStyle = near < HEAP_WIN * (gentle ? 1.6 : 1) ? C.red : C.ink; g.fillText(lbl, hx, Y(150) + 1);
      } else {
        // Noor under the hall light, and her eye on the heap
        const nx = X(1230), ny = Y(740), u = R.sc * 1.55, looking = foundT >= HEAP_GRACE;
        if (looking) { g.fillStyle = "rgba(246,236,190,.34)"; g.beginPath(); g.moveTo(nx, ny - 150 * u); g.lineTo(X(540), Y(520)); g.lineTo(X(540), Y(760)); g.closePath(); g.fill(); g.strokeStyle = "rgba(42,33,27,.5)"; g.lineWidth = 1; g.stroke(); }
        g.fillStyle = "#4d5a74"; g.strokeStyle = C.ink; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(nx - 26 * u, ny); g.lineTo(nx - 18 * u, ny - 120 * u); g.lineTo(nx + 18 * u, ny - 120 * u); g.lineTo(nx + 26 * u, ny); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = C.dust; g.beginPath(); g.arc(nx, ny - 142 * u, 20 * u, 0, 7); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.beginPath(); g.arc(nx - 9 * u, ny - 144 * u, 2.6 * u, 0, 7); g.fill();
        g.font = "700 13px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "bottom"; g.fillText(gIt.name, nx, ny - 168 * u);
        if (still) { const d = Math.max(110, R.sc * 330); g.globalAlpha = 0.8; A.draw(g, "ui-hold-still-ring", X(1048) - d / 2, Y(690) - d / 2, d, d, { src: [10, 10, 300, 300], round: true, key: "ring" }); g.globalAlpha = 1; }
        // five toys in a pile on the landing floor, where the door let them fall
        ["medallion-dani", "medallion-marcus", "medallion-lila", "medallion-jamie", "medallion-narrator"].forEach((id, k) => {
          const d = Math.max(26, R.sc * 92), tx = X(960 + k * 44) + (k % 2 ? 6 : -4), ty = Y(730) - (k % 2) * d * 0.45 - (k === 4 ? d * 0.2 : 0);
          let sx = 0; if (k === 4 && shakeT > 0 && !api.reducedMotion) sx = Math.sin(now / 30) * 3 * shakeT;
          if (!A.draw(g, id, tx - d / 2 + sx, ty - d, d, d, FACE)) { g.fillStyle = k === 4 ? C.amber : "#c2925f"; g.beginPath(); g.arc(tx + sx, ty - d / 2, d / 2, 0, 7); g.fill(); g.stroke(); }
        });
        if (pulseOn && !steadied) A.draw(g, "ui-steady-mark", X(1048) - 72, Y(560) - 24, 144, 48);
        const left = Math.max(0, HEAP_GRACE + HEAP_LOOK - foundT);
        g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        const lbl = !looking ? "every eye opens: HOLD STILL" : still ? `holding all five still · ${Math.ceil(left)} s` : "YOU ARE MOVING", lw = g.measureText(lbl).width + 20;
        g.fillStyle = !looking || still ? C.bone : C.red; g.fillRect(X(1048) - lw / 2, Y(150) - 14, lw, 28); g.strokeStyle = C.ink; g.strokeRect(X(1048) - lw / 2, Y(150) - 14, lw, 28);
        g.fillStyle = !looking || still ? C.ink : C.bone; g.fillText(lbl, X(1048), Y(150) + 1);
      }
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = "700 14px Karla,Arial,sans-serif"; g.fillStyle = memories <= 2 ? C.red : C.ink;
      g.fillText(`night two · the linen cupboard · memories ${"●".repeat(Math.max(0, memories))}${"○".repeat(Math.max(0, 6 - memories))}`, 16, 30, W - 32);
      if (flash > 0) { g.fillStyle = `rgba(184,50,42,${flash * 0.25})`; g.fillRect(0, 0, W, H); }
    }
    function push() {
      if (!started || over || stage !== "heap") return;
      const period = HEAP_BEAT * speed, n = Math.round(heapT / period), near = Math.abs(heapT - n * period), R = heapRect();
      if (near <= HEAP_WIN * (gentle ? 1.6 : 1) && n !== beatUsed && n > 0) {
        beatUsed = n; pushes++;
        pop(["the door gives", "the chair shifts", "the chair goes over"][pushes - 1], R.x + (940 - R.src[0]) * R.sc, R.y + (520 - R.src[1]) * R.sc, C.red);
        if (pushes >= 3) {
          stage = "found"; foundT = 0; heapLine = -1; heapSteady = 0; pushBtn.hidden = true; stillBtn.hidden = false; steadyBtn.hidden = false;
          cap("The chair goes over", "The door swings. Five toys spill onto the landing in a heap, touching, for the first time since the change. A bedroom door opens. Hold still (Space), all of you.", null, 5200);
        }
      } else {
        misses++; hunger += 3;
        pop("out of step: the door only rattles", R.x + (760 - R.src[0]) * R.sc, R.y + (470 - R.src[1]) * R.sc, C.ink);
        if (misses % 3 === 0) { memories--; flash = 1; say("The rattling wakes the hunger: it lurches in the dark. One memory goes."); if (memories <= 0) lose(); }
      }
    }
    function updateHeap(dt) {
      heapT += dt;
      if (flash > 0) flash = Math.max(0, flash - dt * 1.5);
      if (shakeT > 0) shakeT = Math.max(0, shakeT - dt * 2);
      if (stage !== "found") return;
      foundT += dt / speed;
      const look = foundT - HEAP_GRACE;
      if (look < 0) return;
      const line = Math.min(2, Math.floor(look / 3));
      if (line !== heapLine) { heapLine = line; cap(line === 2 ? `${gIt.name}, under the hall light` : gIt.name, "", HEAP_LINES[line], 2900); }
      // one beat of the hunger while she looks: Steady, or the heap shivers
      if (!heapSteady && look >= 4.2) { heapSteady = 1; pulseOn = true; steadied = false; pulseT = (gentle ? PULSE_WIN * 2 : PULSE_WIN) + 0.5; steadyBtn.classList.add(PRE + "beat-on"); }
      if (pulseOn) { pulseT -= dt / speed; if (pulseT <= 0) { pulseOn = false; steadyBtn.classList.remove(PRE + "beat-on"); if (!steadied) { shakeT = 1; shakes++; gIt.dread += 5; say(`The cat shivers in the pile. ${gIt.name} takes a step back.`); } } }
      if (!still && toys[0].grace <= 0) {
        memories--; slips++; flash = 1; gIt.dread += 15; toys[0].grace = 2.5; foundT = Math.max(HEAP_GRACE, foundT - 2);
        say(`You moved while ${gIt.name} was looking. A slip: one memory goes.`);
        if (memories <= 0) { lose(); return; }
      }
      toys[0].grace = Math.max(0, toys[0].grace - dt);
      if (look >= HEAP_LOOK) startProximity();
    }
    function startProximity() {
      stage = "night"; pulseOn = false; steadyBtn.classList.remove(PRE + "beat-on");
      t = NIGHT * speed * 4 / 6; pack = 4; saidAna = true; saidThree = true;
      guests.forEach((gu) => { gu.awakeUntil = 0; gu.open = 0; gu.warn = 0; gu.next = (6 + rng() * 6) * speed; });
      gIt.sleep = [4, 8];
      toys.push({ name: "Lila", kind: "rabbit", col: "#d9cdbf", x: ART ? 5.85 : 6.1, lvl: 1, plan: [], moved: false, grace: 0, creaked: false, face: "medallion-lila", auto: true, wait: hum ? 0 : 11 });
      toys[0].x = ART ? 4.95 : 5.2; toys[1].x = ART ? 5.4 : 5.6; toys.forEach((ty) => { ty.lvl = 1; ty.y = FLOOR; ty.plan = []; ty.grace = 1; });
      lightT = 6 * speed; lightBy = gIt;
      settleBtn.hidden = false; switchBtn.hidden = false;
      cap("03:00 · Proximity", `${gIt.name} puts nobody back, and goes to bed with the light on; it will go out. Then walk each toy to a red cross and Settle (1): somewhere to be found in the morning. Mind the mirror by the banister: it shows Wes the landing.`, null, 8000);
      if (hum) K.after(8400, () => { if (!over) linkT = linkNote(wrap, api, "Because you kept “Lila's hum” through a packing in Stuffing, Lila does not walk tonight. She stays where the door let her fall, three notes under her breath.", 9000); });
    }
    function settle() {
      if (!started || over || stage !== "night" || variant !== "cupboard") return;
      const ty = toys[sel];
      if (ty.settled) { say("Already settled. Switch toy (Tab)."); return; }
      if (ty.plan.length && !still) { say("Stop first: hold still, then settle."); return; }
      const sp = SETTLE.find((q) => q.lvl === ty.lvl && Math.abs(q.x - ty.x) < 0.6 && !toys.some((o) => o.settled === q));
      if (!sp) { say("Not here. Settle at a red cross: a sink, a bed, a door."); return; }
      const seer = guests.find((gu) => sees(gu, ty.x, ty.y)) || (lightT > 0 && ty.x > HALL[0] && ty.x < HALL[1] ? lightBy : null);
      if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw ${sel === 0 ? "the cat" : "Jamie"} sit down.`); ty.grace = 2; if (over) return; }
      ty.settled = sp; ty.plan = []; settled++; hunger = Math.max(0, hunger - 8);
      const [x, y] = S(ty.x, ty.y); pop("settled · −8 hunger", x, y - 50, "#4f6b2c");
      say(`${sel === 0 ? "The cat" : "Jamie"} settles by ${sp.name}.`);
      if (settled >= 2) K.after(900, finish); else sel = toys.findIndex((o) => !o.settled && !o.auto);
    }

    // ---- simulation -----------------------------------------------------------------------
    function say(m) { msg = m; msgT = performance.now(); }
    function inCone(gu, x, y) {
      if (gu.open <= 0) return false;
      const r = ROOMS.find((q) => q.id === gu.room);
      if (y < r.lvl * FLOOR - 0.01 || y >= (r.lvl + 1) * FLOOR - 0.01) return false; // doors stand open: an eye sees along its floor
      const dx = x - gu.ex, dy = (y + 0.3) - gu.ey, d = Math.hypot(dx, dy);
      if (d > REACH) return false;
      let a = Math.atan2(dy, dx) - gu.look; a = Math.atan2(Math.sin(a), Math.cos(a));
      return Math.abs(a) <= CONE / 2;
    }
    // a mirror the sleeper's open eye falls on shows them one more place
    const inCover = (m, x, y) => (m.stair ? y > 0.12 && y < FLOOR - 0.12 : Math.abs(y - m.lvl * FLOOR) < 0.1 && x >= m.x0 && x <= m.x1);
    const lit = (m) => { const gu = guests.find((q) => q.id === m.guest); return gu && gu.open > 0 && inCone(gu, m.x, m.lvl * FLOOR + 0.7) ? gu : null; };
    function sees(gu, x, y) { return inCone(gu, x, y) || mirrors.some((m) => m.guest === gu.id && lit(m) && inCover(m, x, y)); }
    function plan(ty, tx, tlvl) {
      tx = Math.max(0.35, Math.min(W_M - 0.35, tx));
      const out = [];
      let lvl = ty.lvl;
      if (tlvl !== lvl) {
        const fromX = lvl === 0 ? STAIR.x0 : STAIR.x1, toX = tlvl === 0 ? STAIR.x0 : STAIR.x1;
        out.push({ x: fromX, y: lvl * FLOOR, lvl });
        out.push({ x: toX, y: tlvl * FLOOR, lvl: tlvl, stair: true });
        lvl = tlvl;
      }
      out.push({ x: tx, y: lvl * FLOOR, lvl });
      ty.plan = out; ty.creaked = false;
    }
    function slip(gu, why) {
      slips++; memories--; flash = 1;
      guests.forEach((o) => (o.dread = Math.min(100, o.dread + (o === gu ? 15 : 5))));
      say(`${why} A slip: one memory goes.`);
      const [x, y] = S(gu.ex, gu.ey); pop("seen · −1 memory", x, y - 20, C.red);
      if (memories <= 0) lose();
    }
    // a guest gets used to the same night noises: each sound frightens a little less than the last
    function scare(gu, v) {
      const add = v * Math.pow(HABIT, gu.heard || 0);
      gu.dread = Math.min(100, gu.dread + add); gu.heard = (gu.heard || 0) + 1;
      const [x, y] = S(gu.ex, gu.ey); pop(`+${add.toFixed(1)}`, x, y - 18, C.red);
      if (!saidVoice && gu.dread >= 12) { saidVoice = true; cap("From the bedrooms", "Ana, then Wes, half asleep:", "“Did you hear that?” / “Probably the house settling.”", 5000); }
    }
    function act(tool) {
      if (!started || over || cooldown > 0) return;
      const ty = toys[sel];
      if (ty.plan.length && !still) { say("Stop first: hold still, then act."); return; }
      if (tool.id === "taps") {
        const door = DOORS.find((d) => toys.every((o) => o.lvl === d.lvl && Math.abs(o.x - d.x) < 0.8));
        if (!door) { say("Three taps needs both toys at one door."); return; }
        guests.filter((gu) => gu.room === door.room).forEach((gu) => { scare(gu, tool.dread); gu.lookAt = door; gu.warn = 0.6; gu.open = Math.max(gu.open, 0); });
        say(`Three taps at the ${door.room === "parlour" ? "parlour" : "bedroom"} door.`);
        const up = guests.find((gu) => gu.room === door.room && door.lvl === 1);
        if (up) {
          lightT = LIGHT * speed; lightBy = up;
          if (!saidLight) { saidLight = true; cap("The hall light", `${up.name} gets up to look. The switch clicks: the hall and the landing are lit. Nothing in them may move until it goes off.`, null, 5500); }
        }
      } else {
        let hit = 0;
        guests.forEach((gu) => {
          const gl = gu.ey > FLOOR ? 1 : 0;
          if (Math.abs(gl - ty.lvl) > tool.floors) return;
          if (Math.hypot(gu.ex - ty.x, gu.ey - ty.y - 0.4) <= tool.range) { scare(gu, tool.dread); hit++; }
        });
        say(hit ? `${tool.name}: ${hit} guest${hit > 1 ? "s" : ""} heard it.` : `${tool.name}: nobody near enough to hear.`);
      }
      hunger = Math.max(0, hunger - tool.hunger); cooldown = 2;
      toolBtns.forEach((b) => (b.disabled = true));
      // an action is a movement: inside an open cone it is seen
      const seer = guests.find((gu) => sees(gu, ty.x, ty.y));
      if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw the ${ty.name === "You" ? "cat" : "bear"} move.`); ty.grace = 2; }
    }
    function steady() {
      if (!started || over || (!tremor && stage !== "found")) return;
      if (pulseOn && !steadied) { steadied = true; const [x, y] = S(toys[0].x, toys[0].y); pop("steady", x, y - 50, "#4f6b2c"); }
    }
    function update(dt) {
      t += dt;
      if (cooldown > 0) { cooldown -= dt; if (cooldown <= 0) toolBtns.forEach((b) => (b.disabled = false)); }
      if (shakeT > 0) shakeT = Math.max(0, shakeT - dt * 2);
      // the hall light: whoever got up is looking down the hall and the landing
      if (lightT > 0) {
        lightT -= dt;
        toys.forEach((ty, i) => { if (ty.moved && ty.x > HALL[0] && ty.x < HALL[1] && ty.grace <= 0) { slip(lightBy || guests[0], `In the hall light, ${lightBy ? lightBy.name : "someone"} sees ${i === 0 ? "the cat" : "Jamie"} move.`); ty.grace = 2.5; } });
        if (lightT <= 0) say("Click. The hall goes dark again.");
      }
      // phases of the night
      if (!saidAna && t >= GUESTS[2].awakeUntil * speed) { saidAna = true; cap("01:00", "Ana's book closes on her finger. The parlour lamp goes out; the parlour eye is shut, for now.", null, 4500); }
      if (!saidThree && t >= NIGHT * speed * 4 / 6) { saidThree = true; guests[1].sleep = [3, 6]; cap("03:00", "Wes turns over and over. The lamp is still on; he sleeps lighter now, and his eye opens more often.", null, 4500); }
      // tremors from 75 hunger: a pulse every 4 s wants a Steady
      tremor = hunger >= 75;
      steadyBtn.hidden = !tremor;
      if (variant === "cupboard" && tremor && !saidHunger) saidHunger = true;
      if (tremor) {
        if (!saidHunger) { saidHunger = true; cap("The hunger", "Ruth's whisper, from the day you woke:", "“The hunger. Don't fight it. It's what keeps you alive.”", 5500); }
        pulseT -= dt / speed;
        if (!pulseOn && pulseT <= 0) { pulseOn = true; steadied = false; pulseT = (gentle ? PULSE_WIN * 2 : PULSE_WIN) * speed; steadyBtn.classList.add(PRE + "beat-on"); }
        else if (pulseOn && pulseT <= 0) {
          pulseOn = false; pulseT = PULSE_EVERY * speed; steadyBtn.classList.remove(PRE + "beat-on");
          if (!steadied) {
            shakes++; shakeT = 1; hunger += 4;
            const ty = toys[0], [x, y] = S(ty.x, ty.y); pop("you shake", x, y - 50, C.red);
            const seer = guests.find((gu) => sees(gu, ty.x, ty.y));
            if (seer) { seer.dread = Math.min(100, seer.dread + 5); seer.lookAt = { x: ty.x, lvl: ty.lvl }; seer.open = Math.max(seer.open, 1.5); seer.look = Math.atan2(ty.lvl * FLOOR + 0.6 - seer.ey, ty.x - seer.ex); say(`${seer.name} saw something shiver on the shelf.`); }
          }
        }
      } else { pulseOn = false; steadyBtn.classList.remove(PRE + "beat-on"); }
      if (flash > 0) flash = Math.max(0, flash - dt * 1.5);
      hunger += dt / 2 / speed;
      // the pack's own rhythm: the friends play Sound by themselves (+6 to every guest across the night)
      const pk = Math.min(6, (t / (NIGHT * speed)) * 6); guests.forEach((gu) => (gu.dread += pk - pack)); pack = pk;
      // guests' eyes
      guests.forEach((gu) => {
        const awake = t < gu.awakeUntil * speed;
        if (awake) { gu.open = 1; gu.look = gu.face + Math.sin(t * 0.9 / speed) * 0.55; return; }
        if (gu.open > 0) { gu.open -= dt / speed; gu.look += (Math.sin(t * 1.3) * 0.5 * dt); if (gu.open <= 0) { gu.lookAt = null; gu.look = gu.face; gu.next = (gu.sleep[0] + rng() * (gu.sleep[1] - gu.sleep[0])) * speed; } return; }
        if (gu.warn > 0) {
          gu.warn -= dt / speed;
          if (gu.warn <= 0) {
            gu.open = 2 + rng() * 2;
            if (gu.lookAt) { const tx = gu.lookAt.x - gu.ex, ty2 = (gu.lookAt.lvl * FLOOR + 0.6) - gu.ey; gu.look = Math.atan2(ty2, tx); }
            else gu.look = gu.face + (rng() - 0.5) * 0.6;
          }
          return;
        }
        gu.next -= dt;
        if (gu.next <= 0) gu.warn = 0.8;
      });
      // toys walk while Still is released
      const holding = still;
      toys.forEach((ty, i) => {
        ty.grace = Math.max(0, ty.grace - dt);
        ty.moved = false;
        if (ty.settled) return;
        if (ty.auto) { lilaWalks(ty, dt, holding); return; }
        if (i === sel && holding) return;
        if (i !== sel && !ty.plan.length) return;
        if (i !== sel && holding) return; // the pulse: the pack holds together
        if (!ty.plan.length) return;
        const w = ty.plan[0];
        const dx = w.x - ty.x, dy = w.y - ty.y, d = Math.hypot(dx, dy);
        const step = (SPEED / speed) * dt * (w.stair ? 1.6 : 1);
        if (d <= step) { ty.x = w.x; ty.y = w.y; ty.lvl = w.lvl; ty.plan.shift(); }
        else { ty.x += dx / d * step; ty.y += dy / d * step; }
        ty.moved = true;
        // creaking third step
        if (w.stair && !ty.creaked) {
          const f = Math.min(ty.y, FLOOR - ty.y) / FLOOR;
          if (ty.y > 0.25 && ty.y < 1.05 && f < 0.35) {
            ty.creaked = true;
            guests.forEach((gu) => { if (Math.hypot(gu.ex - ty.x, gu.ey - ty.y) <= 4 && gu.open <= 0) { gu.lookAt = { x: ty.x, lvl: 0 }; gu.warn = 0.4; say(`The third step creaks. ${gu.name} stirs.`); } });
          }
        }
        const seer = guests.find((gu) => sees(gu, ty.x, ty.y));
        if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw ${i === 0 ? "the cat" : "Jamie"} move.`); ty.grace = 2.5; }
      });
      // the hunger: tremor, then a lurch at 100
      if (hunger >= 100) {
        const ty = toys[0];
        memories -= 2; hunger = 55; flash = 1;
        const seer = guests.find((gu) => sees(gu, ty.x, ty.y));
        say("The hunger lurches you: two memories go.");
        { const [x, y] = S(ty.x, ty.y); pop("lurch · −2 memories", x, y - 50, C.red); }
        if (seer) slip(seer, `${seer.name} saw the lurch.`);
        if (memories <= 0) lose();
      }
      if (!over && variant === "climb" && !toys[0].plan.length && !climbed) { climbed = true; K.after(900, finish); }
      if (!over && t >= NIGHT * speed) finish();
    }
    // Lila walks: once in the night she climbs down on her own, whatever the eyes are doing. A cat
    // beside her, holding Still, holds her too, and the hunger runs double while it does.
    function lilaWalks(ty, dt, holding) {
      if (hum) return;
      if (ty.wait > 0) {
        ty.wait -= dt / speed;
        if (ty.wait <= 0) {
          plan(ty, SETTLE[1].x, 1);
          cap("Lila walks", "Lila gets up from where the door let her fall and starts along the landing toward Wes's room, on her own. Bring the cat beside her and hold Still to hold her too; the hunger runs double for two.", "She didn't want to.", 8000);
        }
        return;
      }
      if (!ty.plan.length) { if (!ty.settled) { ty.settled = SETTLE[1]; say("Lila climbs up beside Wes's pillow, and is still."); } return; }
      const cat = toys[0];
      ty.heldToo = holding && cat.lvl === ty.lvl && Math.abs(cat.y - ty.y) < 0.2 && Math.abs(cat.x - ty.x) < 0.9;
      if (ty.heldToo) { hunger += dt / 2 / speed; return; }
      const w = ty.plan[0], dx = w.x - ty.x, step = (LILA_SPEED / speed) * dt;
      if (Math.abs(dx) <= step) { ty.x = w.x; ty.plan.shift(); } else ty.x += Math.sign(dx) * step;
      ty.moved = true;
      const seer = guests.find((gu) => sees(gu, ty.x, ty.y));
      if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw Lila walking.`); ty.grace = 3; }
    }
    function finish() {
      if (over) return;
      over = true; if (linkT) linkT.remove();
      if (variant === "climb") {
        api.store.set("losses", 0);
        const there = !toys[0].plan.length;
        flow.done({ outcome: there ? "win" : "done", text: there
          ? `The cat stands at the bedroom door, and you did not walk it there. ${slips ? `${slips} slip${slips === 1 ? "" : "s"} on the way; ` : "Nobody saw it move; "}${memories} memor${memories === 1 ? "y" : "ies"} left. All you could do was stop. “…I didn't fight it.”`
          : `05:00. Grey at the windows, and the cat is still on the way. The hunger will walk it again tomorrow night. ${slips} slip${slips === 1 ? "" : "s"}.` });
        return;
      }
      if (variant === "cupboard") {
        api.store.set("losses", 0);
        const where = toys.filter((ty) => ty.settled).map((ty) => `${ty.name === "You" ? "the cat" : ty.name} by ${ty.settled.name}`).join(", ");
        const text = settled >= 2
          ? `05:00. The chair lies on its side on the landing and nobody has picked it up. In the morning they will find ${where}. ${gIt.name} will say it again, quieter: “I swear I locked that door.” ${slips} slip${slips === 1 ? "" : "s"}, ${memories} memor${memories === 1 ? "y" : "ies"} left.`
          : `05:00. Grey at the windows${where ? `, and only ${where}` : ", and no toy where it means to be found"}. They will set the chair upright and tell each other the door was never locked. ${slips} slip${slips === 1 ? "" : "s"}, ${memories} memor${memories === 1 ? "y" : "ies"} left.`;
        A.finale(wrap, "dollhouse-day").then(() => flow.done({ outcome: settled >= 2 ? "win" : "done", text }));
        return;
      }
      const avg = guests.reduce((a, gu) => a + gu.dread, 0) / guests.length;
      const won = avg >= TARGET && memories > 0;
      api.store.set("losses", 0);
      const most = guests.reduce((a, b) => (a.dread > b.dread ? a : b));
      const tail = won
        ? ` At breakfast ${most.name} will ask who was up in the night, and nobody will say it was them.`
        : " They will sleep late and laugh about the old cabin over coffee. The pack plays again tomorrow night.";
      A.finale(wrap, "dollhouse-day").then(() => flow.done({ outcome: won ? "win" : "done", text: `05:00. Grey at the windows; the pack is back on the shelf. Dread ${Math.floor(avg)} on average, ${TARGET} needed (${guests.map((gu) => `${gu.name} ${Math.round(gu.dread)}`).join(", ")}). ${slips} slip${slips === 1 ? "" : "s"}, ${memories} memor${memories === 1 ? "y" : "ies"} left.${tail}` }));
    }
    function lose() { if (over) return; over = true; if (linkT) linkT.remove(); api.store.set("losses", losses + 1); flow.done({ outcome: "lose", text: `${variant === "cupboard" && stage !== "night" ? "Night two, on the landing" : clock()}. One slip too many, one lurch too hard: nothing is left of you to hold still with. In the morning a cat plush lies on the landing floor, and someone puts it back on the shelf without a word. ${slips} slip${slips === 1 ? "" : "s"}.` }); }

    // ---- input -------------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      if (stage === "heap") { push(); return; }
      if (stage !== "night") return;
      const [px, py] = pt(e);
      if (flow.stage === 2) { const kr = knockRect(), pad = Math.max(0, (30 - kr.w) / 2); if (px >= kr.x - pad && px <= kr.x + kr.w + pad && py >= kr.y - 4 && py <= kr.y + kr.h + 4) { knock(); return; } }
      if (variant === "climb") { say("It is not you who is walking. All you can do is hold still."); return; }
      const mx = (px - L.ox) / L.k, my = (L.base - py) / L.ky;
      const ti = toys.findIndex((ty) => !ty.auto && Math.abs(ty.x - mx) < 0.5 && my > ty.y - 0.2 && my < ty.y + 1.0);
      if (ti >= 0) { sel = ti; return; }
      if (toys[sel].settled) { say("Settled toys stay where they are. Switch toy (Tab)."); return; }
      if (mx < -0.3 || mx > W_M + 0.3 || my < 0 || my > 2 * FLOOR) return;
      plan(toys[sel], mx, my >= FLOOR ? 1 : 0);
    });
    function setStill(v) { still = v; stillBtn.setAttribute("aria-pressed", String(v)); }
    K.on(stillBtn, "pointerdown", (e) => { e.preventDefault(); if (stillToggle) setStill(!still); else setStill(true); });
    K.on(stillBtn, "pointerup", () => { if (!stillToggle) setStill(false); });
    K.on(stillBtn, "pointerleave", () => { if (!stillToggle && still) setStill(false); });
    K.on(stillBtn, "click", (e) => { if (e.detail === 0) setStill(!still); }); // keyboard activation toggles
    toolBtns.forEach((b) => K.on(b, "click", () => { act(TOOLS.find((x) => x.id === b.dataset.tool)); wrap.focus(); }));
    const cycle = () => { for (let q = 1; q <= toys.length; q++) { const j = (sel + q) % toys.length; if (!toys[j].settled && !toys[j].auto) { sel = j; return; } } };
    K.on(wrap.querySelector('button[data-a="switch"]'), "click", () => { cycle(); wrap.focus(); });
    K.on(pushBtn, "click", () => { push(); wrap.focus(); });
    K.on(settleBtn, "click", () => { settle(); wrap.focus(); });
    K.on(steadyBtn, "pointerdown", (e) => { e.preventDefault(); steady(); });
    K.on(steadyBtn, "click", (e) => { if (e.detail === 0) steady(); });
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      if (e.key === " " && !e.repeat) { e.preventDefault(); if (stillToggle) setStill(!still); else setStill(true); }
      else if (stage === "heap") { if (e.key === "Enter" || e.key === "p" || e.key === "P") { e.preventDefault(); push(); } }
      else if (e.key === "s" || e.key === "S") steady();
      else if (stage !== "night" || variant === "climb") return;
      else if ((e.key === "k" || e.key === "K") && flow.stage === 2) knock();
      else if (e.key === "Tab") { e.preventDefault(); cycle(); }
      else if (variant === "cupboard") { if (e.key === "1" || e.key === "Enter") settle(); else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { const ty = toys[sel]; if (!ty.settled) plan(ty, ty.x + (e.key === "ArrowLeft" ? -1 : 1), ty.lvl); } else if (e.key === "ArrowUp" || e.key === "ArrowDown") { const ty = toys[sel]; if (!ty.settled) plan(ty, e.key === "ArrowUp" ? STAIR.x1 + 0.4 : STAIR.x0 - 0.4, e.key === "ArrowUp" ? 1 : 0); } }
      else if (["1", "2", "3", "4"].includes(e.key)) act(TOOLS[+e.key - 1]);
      else if (e.key === "s" || e.key === "S") steady();
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { const ty = toys[sel]; plan(ty, ty.x + (e.key === "ArrowLeft" ? -1 : 1), ty.lvl); }
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") { const ty = toys[sel]; plan(ty, e.key === "ArrowUp" ? STAIR.x1 + 0.4 : STAIR.x0 - 0.4, e.key === "ArrowUp" ? 1 : 0); }
    });
    K.on(wrap, "keyup", (e) => { if (e.key === " " && !stillToggle) { e.preventDefault(); setStill(false); } });
    K.on(window, "blur", () => { if (!stillToggle) setStill(false); });

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) { if (stage === "night") update(dt); else updateHeap(dt); }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const CARD = [
      { no: "No. 8 · Giving in", goal: "The hunt group's first night. The hunger has had enough of holding you on the shelf: it walks the cat across the cabin to a bedroom door, and you are not the one walking. All you can do is stop it while an eye is open.", rows: [["Hold still", "hold Space or the button"], ["Let go", "and it walks on"]], more: "Still in an open eye is safe; moving in one is a slip, and a slip costs a memory. An eye that is about to open shows a red dashed cone.", go: "Let it begin", pic: "chapter-08" },
      { no: "No. 10 · The Sound game", goal: `The first night of the hunt. Noor, Wes and Ana are asleep; Ana still reads in the parlour. Join the pack's Sound game: frighten them to ${TARGET} dread on average by 05:00 without being seen to move.`, rows: [["Walk", "tap a room · arrows"], ["Hold still", "hold Space or the button"], ["Thump, Drag, Squeak", "1 · 2 · 3, when near"], ["Mirrors", "an open eye on one sees one more place"]], more: "The hall mirror shows Ana the stair. The mirror by the banister shows Wes the landing, where the shelf is.", go: "Night one: the Sound game", pic: "chapter-10" },
      { no: "No. 12 · The linen cupboard", goal: "Night two. After the morning's moved toys, one of them shut every toy in the linen cupboard and wedged a chair under the knob. Five of you in the dark, on one pulse. Every other night the rule was to hold still. Here the door only opens if you move.", rows: [["Push", "Enter or tap, on the beat"], ["Hold still", "hold Space, all five of you"], ["Then Settle", "1, at a red cross"]], more: "After the cupboard the night runs on from 03:00, and Lila does not stay where she is put.", go: "Night two: the linen cupboard", pic: "chapter-12" },
    ][stg];
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}plate" role="dialog" aria-label="How to play Dollhouse cutaway">
      <header><span>Plate III.</span><span>${CARD.no}</span></header>
      <h2>Dollhouse Cutaway</h2>
      <p class="${PRE}goal">${CARD.goal}</p>
      <dl>${CARD.rows.map(([a, b]) => `<div><dt>${a}</dt><dd><span>${b}</span></dd></div>`).join("")}</dl>
      <p class="${PRE}more">${CARD.more}</p>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>Two nights lost. The slower night is ticked for you.</p>
      <label><input type="checkbox" data-o="half" ${losses >= 2 ? "checked" : ""}> Slower night (clock, cones and tremors at half speed)</label>
      <label><input type="checkbox" data-o="toggle"> Still toggles instead of hold</label>
      <div class="${PRE}pickhost"></div>
      <button type="button" data-start>${CARD.go}</button>
    </div>`;
    wrap.appendChild(intro);
    {
      const plateEl = intro.querySelector("." + PRE + "plate"), h2 = intro.querySelector("h2");
      const cw = Math.min(450, wrap.clientWidth - 82);
      const pic = A.picture(CARD.pic, cw, { alt: "" });
      if (pic) { pic.className = PRE + "pic"; plateEl.insertBefore(pic, h2); }
      const ttl = A.word("Dollhouse cutaway", 34);
      if (ttl) { ttl.style.justifyContent = "center"; ttl.style.margin = "10px 0 4px"; h2.textContent = ""; h2.appendChild(ttl); }
      stagePicker(intro.querySelector("." + PRE + "pickhost"), api, stg, BLURBS, (n) => flow.pick(n));
    }
    const sb = intro.querySelector("button[data-start]");
    K.on(sb, "click", () => {
      stillToggle = intro.querySelector('[data-o="toggle"]').checked; speed = intro.querySelector('[data-o="half"]').checked ? 2 : 1; gentle = speed === 2;
      intro.remove(); started = true; wrap.focus();
      if (flow.stage === 2) {
        variant = "cupboard"; stage = "heap"; hunger = 50;
        toolBtns.forEach((b) => (b.hidden = true)); switchBtn.hidden = true; stillBtn.hidden = true; pushBtn.hidden = false;
        cap("Night two", `${gIt.name} shut every toy in the linen cupboard and wedged a chair under the knob. Five of you, in the dark, on one pulse. Press the door on the beat (Enter, or tap): three times.`, null, 8000);
        if (itId && gIt.id === itId) K.after(1200, () => { if (!over) linkT = linkNote(wrap, api, `Because you put ${gIt.name}'s peg beside the peg that is nobody's in Parlour, ${gIt.name} is It: it was ${gIt.name} who wedged the chair, and ${gIt.name} who will come out.`, 9000); });
        return;
      }
      guests.forEach((gu) => (gu.next *= speed));
      if (flow.stage === 0) {
        variant = "climb"; guests[2].awakeUntil = 0; saidAna = true; saidThree = true;
        toolBtns.forEach((b) => (b.hidden = true)); switchBtn.hidden = true;
        plan(toys[0], DOORS[0].x + 0.1, 1);
        cap("The climb", "The cat gets down off the kitchen shelf on its own and starts for the stairs. Hold Still when a red cone warns that an eye is opening; let go, and it walks on.", null, 7000);
        return;
      }
      guests[2].awakeUntil = 45;
      cap("23:00", "The cat on the landing shelf, Jamie the bear in the kitchen. Two mirrors tonight: while Ana reads, the hall mirror shows her the stair; when Wes's eye opens, the one by the banister shows him the landing. Act between his glances.", null, 8000);
    });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); A.dispose(); ro.disconnect(); if (linkT) linkT.remove(); wrap.remove(); } };
  }
}

// Dr. Tox: Rise, 2D mode B: Barrier escort (DESIGN.md section 10, `m2_barrier_escort`; chapter 8).
// Franco-Belgian ligne claire: even clear outlines, flat colour, no hatching, no shadow; the hard-light
// walls are clean bars.
//
// Aegis runs beside a transport that scrolls through the supply corridor of the lower ring at a fixed
// pace. He draws straight hard-light walls (press, drag, release) on the corridor floor: 2 Load a metre,
// Load from canister clouds (+20 each). Debris thrown from the barricades bounces off the walls; a crew
// that a wall keeps from its building site cannot rebuild ahead of the transport. Three stops at a
// standing barricade and the escort restarts (the loss). Every wall pens someone: when walls, or a wall
// and the corridor's own walls, close a space with a person in it, a white tag with their name appears
// on the bar, and they say the one thing they want. The HUD shows only Load and the distance.
// The leash: stand still beside a penned person for two seconds and the program answers (a flinch,
// +10 Load). Then the escort out (`s2_barrier_2`): the page reversed, the walls still standing; a tap
// drops a pen wall and lets a crew into the road, about four seconds each. There is no failure going
// out: a late transport is logged (the win).
//
// Quoted, verbatim, from DESIGN.md: the containment action (bible Part VIII, Scene 2 VI) and the other
// hero's lines "New," "They finally sent the amber-lit one down from the Spire. I wondered when."
// and "Try to keep up, hero,". Names from DESIGN.md section 6: Nell Okafor, Tomas Reyes, Ruth Abara.
// Written for this module (listed for the author): the five further penned names and every want spoken
// through a wall, the on-screen instructions, the onomatopoeia.
//
// Flags written through api.shared (data/flags.json): other_hero.met, load, barrier.penned,
// barrier.penned_names, barrier.transport_through, barrier.released, reese.flinches.

const P = "dtr-be-";
const C = {
  ink: "#1b1b1b", paper: "#f4f1e6", floor: "#c9d3d1", seam: "#9fb0ae", lane: "#d9e2e0", ledge: "#7d8988",
  teal: "#5E7375", gray: "#8A9A99", light: "#C4CDCB", amber: "#D99A2B", gold: "#F2C14E", pale: "#f6e2a8",
  glow: "#fff6dc", white: "#ffffff", door: "#2b3536", rust: "#a46a4a", red: "#9a5a5a",
};
const L = 9000, DEPTH = 300, LANE0 = 110, LANE1 = 190, LANEY = 150;
const CELL = 20, ROWS = DEPTH / CELL, COLS = Math.ceil(L / CELL) + 1, PEN_REACH = 60; // cells either side (1200 units)
const MAXLEN = 320, REACH = 460, METRE = 40, WALL_H = 115, PH = 150;
const SPEED_IN = 50, SPEED_OUT = 140, STOP_WAIT = 4, DROP_WAIT = 4;

// The penned. The first three are DESIGN.md's (section 6); the rest and every line are written for the game.
const PEOPLE = [
  { id: "nell", name: "Nell Okafor", kind: "insurgent", home: 1560, side: "back", want: "That's my brother's water drum, out there in your road. I want it back." },
  { id: "tomas", name: "Tomas Reyes", kind: "bystander", home: 2620, side: "front", want: "My mother's medicine is on the other side. The curfew is at six." },
  { id: "ruth", name: "Ruth Abara", kind: "bystander", home: 3540, side: "back", want: "He won't stop coughing. Let me take him somewhere he can breathe." },
  { id: "boy", name: "Ruth Abara's boy", kind: "child", follow: "ruth", home: 3580, side: "back", want: "" },
  { id: "sami", name: "Sami Ferrer", kind: "bystander", home: 4300, side: "front", want: "I came down for bread. That's all. Bread." },
  { id: "odile", name: "Odile Mensah", kind: "insurgent", home: 5080, side: "back", want: "My shift on the upper ring starts in an hour. Let me go up." },
  { id: "ada", name: "Ada Quint", kind: "bystander", home: 5900, side: "front", want: "My daughter is in the stalls. I can see her from here." },
  { id: "lou", name: "Lou Brandt", kind: "insurgent", home: 6700, side: "back", want: "We only want the water through. The same water you're guarding." },
  { id: "pavel", name: "Pavel Ruiz", kind: "bystander", home: 7620, side: "front", want: "I live there. That door. The one behind your light." },
];
// Two barricades in the first third, four in the middle (DESIGN.md, difficulty curve).
const SITES = [{ x: 1750, side: "back" }, { x: 2750, side: "front" }, { x: 3650, side: "back" },
  { x: 4420, side: "front" }, { x: 5200, side: "back" }, { x: 6000, side: "front" }];
const THROWERS = [{ x: 2250, y: 272 }, { x: 4900, y: 28 }, { x: 6650, y: 28 }, { x: 7250, y: 272 }, { x: 7950, y: 28 }];
const CLOUDS = [{ x: 900, y: 235 }, { x: 2450, y: 60 }, { x: 4750, y: 240 }, { x: 6900, y: 250 }, { x: 8300, y: 60 }];
const IDS = ["aegis", "aegis-absorb", "bystander", "child", "crew", "insurgent", "other-hero", "far", "mid", "near",
  "barricade", "canister", "cloud", "debris", "distance-bar", "emitter", "load-gauge", "name-tag", "transport", "wall", "wall-cap"]
  .map((s) => "barrier-escort-" + s).concat(["hud-word-hope"]);

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function segInt(ax, ay, bx, by, cx, cy, dx, dy) {
  const r1 = bx - ax, r2 = by - ay, s1 = dx - cx, s2 = dy - cy, den = r1 * s2 - r2 * s1;
  if (Math.abs(den) < 1e-9) return false;
  const t = ((cx - ax) * s2 - (cy - ay) * s1) / den, u = ((cx - ax) * r2 - (cy - ay) * r1) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
function nearestOn(w, x, y) {
  const dx = w.x2 - w.x1, dy = w.y2 - w.y1, l2 = dx * dx + dy * dy || 1;
  const t = clamp(((x - w.x1) * dx + (y - w.y1) * dy) / l2, 0, 1);
  const px = w.x1 + t * dx, py = w.y1 + t * dy;
  return { x: px, y: py, d: Math.hypot(x - px, y - py) };
}

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const rng = api.rng ? api.rng() : Math.random;
    const art = api.art || { has: () => false, img: () => Promise.resolve(null), url: () => "" };
    const has = (id) => { try { return art.has(id); } catch { return false; } };
    const url = (id) => (has(id) ? art.url(id) : "");
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = [];
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    // ---------- DOM ----------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    const body = "var(--g-body, 'Helvetica Neue', Arial, sans-serif)";
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.floor};color:${C.ink};font-family:${body};user-select:none;-webkit-user-select:none}
.${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;display:block}
.${P}hud{position:absolute;left:10px;right:10px;top:8px;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;pointer-events:none}
.${P}dist{position:relative;width:min(460px,100%);aspect-ratio:640/60;background:${C.paper} center/100% 100% no-repeat;border:2px solid ${C.ink};border-radius:6px;box-sizing:border-box}
.${P}dist .${P}mk{position:absolute;top:22%;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:${C.gold};border:2px solid ${C.ink};box-sizing:border-box;transition:left .2s linear}
.${P}dist .${P}stop{position:absolute;top:8%;font:700 13px ${body};margin-left:-5px;color:${C.ink}}
.${P}load{position:relative;width:min(260px,62%);aspect-ratio:320/60;background:center/100% 100% no-repeat}
.${P}load.${P}nofr{background:${C.paper};border:2px solid ${C.ink};border-radius:20px;box-sizing:border-box}
.${P}load i{position:absolute;left:26%;top:27%;height:51%;width:0;max-width:71%;background:${C.gold};mix-blend-mode:multiply;border-radius:0 12px 12px 0;transition:width .25s}
.${P}load b{position:absolute;right:-2px;top:50%;transform:translate(100%,-50%);font:700 13px ${body};padding-left:6px}
.${P}load.${P}low i{background:${C.amber}}
.${P}load.${P}pulse{animation:${P}pl .5s}
@keyframes ${P}pl{50%{transform:scale(1.06)}}
.${P}tags{position:absolute;left:10px;right:10px;top:var(--tagtop,64px);display:flex;flex-wrap:wrap;gap:4px 6px;pointer-events:none}
.${P}tag{position:relative;width:118px;height:39px;background:center/100% 100% no-repeat;font:700 11px ${body};line-height:1.1;display:flex;align-items:center;justify-content:center;text-align:center;padding:9px 10px 2px 16px;box-sizing:border-box;animation:${P}tin .5s ease-out}
.${P}tag.${P}plain{background:${C.white};border:2px solid ${C.ink};border-radius:6px}
.${P}tag.${P}gone{opacity:.25;text-decoration:line-through}
@keyframes ${P}tin{from{transform:translateY(-14px);opacity:0}}
.${P}msg{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);max-width:calc(100% - 24px);background:${C.pale};border:2px solid ${C.ink};padding:6px 12px;font:700 14px ${body};text-align:center;pointer-events:none;opacity:0;transition:opacity .25s}
.${P}msg.${P}show{opacity:1}
.${P}keys{position:absolute;left:0;right:0;bottom:0;padding:6px 10px;background:${C.paper};border-top:2px solid ${C.ink};font:12px ${body};text-align:center;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${P}keys b{font-weight:700}
.${P}over{position:absolute;inset:0;display:grid;place-items:center;padding:14px;background:rgba(43,53,54,.55);overflow:auto;z-index:5}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:${C.paper};border:3px solid ${C.ink};padding:18px 20px 16px;box-shadow:6px 6px 0 ${C.ink}}
.${P}kick{font:700 12px ${body};letter-spacing:.18em;text-transform:uppercase;color:${C.teal}}
.${P}card h2{font:800 30px var(--g-display, ${body});margin:2px 0 8px;text-transform:uppercase;letter-spacing:.02em}
.${P}ins{position:absolute;right:16px;top:14px;width:96px;height:auto}
.${P}q{margin:0 0 10px;padding:6px 10px;background:${C.pale};border:2px solid ${C.ink};font-size:15px;line-height:1.35}
.${P}q cite{display:block;font-size:12px;font-style:normal;margin-top:3px;color:${C.teal}}
.${P}p{margin:0 0 10px;font-size:15px;line-height:1.42}
.${P}ks{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:7px}
.${P}ks li{display:grid;grid-template-columns:78px 1fr;gap:0 10px;font-size:14px;line-height:1.35}
.${P}ks li span:first-child{background:${C.ink};color:${C.paper};font-weight:700;text-align:center;padding:2px 4px;align-self:start}
.${P}go{font:800 17px ${body};text-transform:uppercase;background:${C.gold};color:${C.ink};border:3px solid ${C.ink};padding:9px 26px;cursor:pointer;box-shadow:3px 3px 0 ${C.ink}}
.${P}go:hover,.${P}go:focus-visible{background:${C.amber};outline:none}
.${P}go:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ${C.ink}}
@media (max-width:620px){.${P}card h2{font-size:24px}.${P}ins{position:static;display:block;width:70px;margin-bottom:6px}.${P}ks li{grid-template-columns:64px 1fr;font-size:13px}.${P}p{font-size:14px}.${P}tag{width:100px;height:33px;font-size:10px;padding:7px 6px 1px 12px}.${P}keys{font-size:11px;white-space:normal}.${P}msg{bottom:58px;font-size:13px}}
@media (prefers-reduced-motion: reduce){.${P}tag,.${P}load.${P}pulse{animation:none}}
`;
    const cv = document.createElement("canvas");
    const hud = document.createElement("div"); hud.className = P + "hud";
    const dist = document.createElement("div"); dist.className = P + "dist";
    if (has("barrier-escort-distance-bar")) dist.style.backgroundImage = `url("${url("barrier-escort-distance-bar")}")`;
    const mk = document.createElement("span"); mk.className = P + "mk"; dist.appendChild(mk);
    dist.setAttribute("role", "img"); dist.setAttribute("aria-label", "The transport's distance");
    const load = document.createElement("div"); load.className = P + "load";
    if (has("barrier-escort-load-gauge")) load.style.backgroundImage = `url("${url("barrier-escort-load-gauge")}")`;
    else { load.classList.add(P + "nofr"); }
    const loadFill = document.createElement("i"); const loadNum = document.createElement("b");
    load.append(loadFill, loadNum);
    hud.append(dist, load);
    const tags = document.createElement("div"); tags.className = P + "tags"; tags.setAttribute("aria-live", "polite");
    const msg = document.createElement("div"); msg.className = P + "msg"; msg.setAttribute("role", "status");
    const keys = document.createElement("div"); keys.className = P + "keys";
    wrap.append(css, cv, hud, tags, msg, keys);
    root.appendChild(wrap);
    const g = cv.getContext("2d");
    const FF = getComputedStyle(wrap).fontFamily || "Arial, sans-serif";

    function card({ kick, title, quote, cite, paras, list, button }, done) {
      const over = document.createElement("div"); over.className = P + "over";
      const c = document.createElement("div"); c.className = P + "card";
      c.setAttribute("role", "dialog"); c.setAttribute("aria-label", title);
      if (has("hud-word-hope")) { const im = document.createElement("img"); im.className = P + "ins"; im.alt = ""; im.src = url("hud-word-hope"); c.appendChild(im); }
      const k = document.createElement("div"); k.className = P + "kick"; k.textContent = kick;
      const h = document.createElement("h2"); h.textContent = title;
      c.append(k, h);
      if (quote) { const q = document.createElement("blockquote"); q.className = P + "q"; q.textContent = quote; const ci = document.createElement("cite"); ci.textContent = cite; q.appendChild(ci); c.appendChild(q); }
      for (const t of paras || []) { const p = document.createElement("p"); p.className = P + "p"; p.textContent = t; c.appendChild(p); }
      if (list) {
        const ul = document.createElement("ul"); ul.className = P + "ks";
        for (const [a, b] of list) { const li = document.createElement("li"); const s1 = document.createElement("span"); s1.textContent = a; const s2 = document.createElement("span"); s2.textContent = b; li.append(s1, s2); ul.appendChild(li); }
        c.appendChild(ul);
      }
      const go = document.createElement("button"); go.type = "button"; go.className = P + "go"; go.textContent = button;
      go.addEventListener("click", () => { over.remove(); done(); });
      c.appendChild(go); over.appendChild(c); wrap.appendChild(over);
      later(() => go.focus(), 30);
      return over;
    }

    // ---------- art ----------
    const imgs = {};
    let artReady = false;
    Promise.all(IDS.map((id) => (has(id) ? art.img(id).then((im) => { if (im) imgs[id] = im; }) : null)))
      .catch(() => {}).then(() => { artReady = true; baked.clear(); });
    const baked = new Map();
    function bake(id, w, h) {
      const im = imgs[id];
      if (!im) return null;
      w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
      const key = id + "@" + w + "x" + h;
      let c = baked.get(key);
      if (c) return c;
      if (baked.size > 400) baked.clear();
      c = document.createElement("canvas");
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      baked.set(key, c);
      return c;
    }

    // ---------- geometry ----------
    let PHK = PH, W = 0, H = 0, dpr = 1, k = 1, q = 0.7, yBack = 300, yFront = 500, viewW = 1000;
    function resize() {
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      k = clamp(Math.min(W / 950, H / 700), 0.45, 1.15);
      q = clamp(0.55 * H / W + 0.2, 0.7, 1.6);
      const bandH = DEPTH * k * q;
      const hudH = (hud.offsetHeight || 40) + 8;
      tags.style.setProperty("--tagtop", hudH + 10 + "px");
      const keysH = keys.offsetHeight || 28;
      if (W < 700) { // portrait: a deeper floor, larger figures
        const yb = Math.max(H * 0.38, hudH + 140 * k);
        q = clamp((H - keysH - 50 - yb) / (DEPTH * k), 0.7, 2.2);
      }
      PHK = PH * k * (W < 700 ? 1.3 : 1);
      const bandH2 = DEPTH * k * q;
      yBack = clamp(W < 700 ? Math.max(H * 0.38, hudH + 140 * k) : H * 0.44, hudH + 150 * k, H - keysH - bandH2 - 40 * k);
      yFront = yBack + bandH2;
      viewW = W / k;
      baked.clear();
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
    const camRatio = () => (W < 700 ? 0.18 : 0.32);
    const sx = (wx) => (wx - camX) * k;
    const sy = (wy) => yBack + wy * k * q;
    const toWorld = (px, py) => ({ x: px / k + camX, y: (py - yBack) / (k * q) });

    // ---------- state ----------
    let phase = "intro"; // intro, in, between, out, over
    let camX = 0, time = 0;
    let load0 = 40;
    const st = {
      load: load0, flinches: 0, stops: 0, released: 0, late: 0, dropWait: 0,
      tr: { x: 420, stall: 0, wait: 0, dir: 1, dents: 0, waitKind: "" },
      aegis: { x: 520, y: 235, tx: null, ty: null, stillT: 0, lastX: 520, lastY: 235, absorbT: 0, absorbShow: 0, face: 1 },
      hero: { x: 900, y: 150, said: 0 },
    };
    let walls = [];
    let wallId = 0;
    const people = PEOPLE.map((p) => ({ ...p, x: p.home + (rng() - 0.5) * 120, y: p.side === "back" ? 40 + rng() * 50 : 210 + rng() * 60,
      tx: null, ty: null, pause: rng() * 2, penned: false, everPenned: false, spoke: 0, flinched: false, released: false, leaving: 0, alpha: 1, tag: null }));
    const byId = Object.fromEntries(people.map((p) => [p.id, p]));
    const sites = SITES.map((s) => ({ ...s, active: false, built: false, gone: false, stopped: false, door: { x: s.x - 170, y: s.side === "back" ? 0 : DEPTH }, crew: null }));
    const throwers = THROWERS.map((t) => ({ ...t, next: 1 + rng() * 2, n: 0 }));
    let clouds = CLOUDS.map((c) => ({ ...c, life: 1e9, t: 0, a: 0 }));
    let debris = [];
    let balloons = [];
    let pops = []; // onomatopoeia and sparks
    const pennedLog = []; // {name, want} in order
    let flinchFx = 0, flinchGhostX = 0, coolFx = 0, shake = 0;
    let preview = null; // {x1,y1,x2,y2,ok,why}
    let anchor = null;  // keyboard wall start
    let penWalls = new Set();
    let ending = false, dropping = false;

    // ---------- the pen grid ----------
    const grid = new Uint8Array(ROWS * COLS);
    const seen = new Int32Array(ROWS * COLS);
    let stamp = 0;
    const queue = new Int32Array(ROWS * (2 * PEN_REACH + 3));
    function mark(x, y) {
      const c = Math.floor(x / CELL), r = Math.floor(y / CELL);
      if (c >= 0 && c < COLS && r >= 0 && r < ROWS) grid[r * COLS + c] = 1;
    }
    function rebuildGrid(skip) {
      grid.fill(0);
      for (const w of walls) {
        if (w === skip) continue;
        const n = Math.ceil(w.len / 4) + 1;
        for (let i = 0; i <= n; i++) mark(w.x1 + (w.x2 - w.x1) * i / n, w.y1 + (w.y2 - w.y1) * i / n);
      }
      for (const s of sites) if (s.built && !s.gone) for (let x = s.x - 110; x <= s.x + 110; x += CELL / 2) for (let y = LANE0; y <= LANE1; y += CELL / 2) mark(x, y);
    }
    function isPenned(x, y) {
      let c0 = clamp(Math.floor(x / CELL), 0, COLS - 1), r0 = clamp(Math.floor(y / CELL), 0, ROWS - 1);
      if (grid[r0 * COLS + c0]) { // standing on a line: look one cell around
        let found = false;
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = c0 + dc, r = r0 + dr; if (c >= 0 && c < COLS && r >= 0 && r < ROWS && !grid[r * COLS + c]) { c0 = c; r0 = r; found = true; break; } }
        if (!found) return true;
      }
      stamp++;
      let head = 0, tail = 0;
      queue[tail++] = r0 * COLS + c0; seen[r0 * COLS + c0] = stamp;
      while (head < tail) {
        const i = queue[head++], r = (i / COLS) | 0, c = i - r * COLS;
        if (c <= c0 - PEN_REACH || c >= c0 + PEN_REACH || c <= 0 || c >= COLS - 1) return false;
        if (c + 1 < COLS) { const j = i + 1; if (!grid[j] && seen[j] !== stamp) { seen[j] = stamp; queue[tail++] = j; } }
        if (c > 0) { const j = i - 1; if (!grid[j] && seen[j] !== stamp) { seen[j] = stamp; queue[tail++] = j; } }
        if (r + 1 < ROWS) { const j = i + COLS; if (!grid[j] && seen[j] !== stamp) { seen[j] = stamp; queue[tail++] = j; } }
        if (r > 0) { const j = i - COLS; if (!grid[j] && seen[j] !== stamp) { seen[j] = stamp; queue[tail++] = j; } }
      }
      return true;
    }
    const active = (p) => !p.released && p.alpha > 0.05;
    function computePenWalls() {
      penWalls = new Set();
      const pennedNow = people.filter((p) => p.penned && active(p));
      for (const w of walls) {
        rebuildGrid(w);
        if (pennedNow.some((p) => !isPenned(p.x, p.y))) penWalls.add(w);
      }
      rebuildGrid();
    }
    let penTimer = 0;
    function updatePens(force) {
      penTimer -= force ? 1e9 : 0;
      for (const p of people) {
        if (!active(p) || p.leaving) continue;
        const was = p.penned;
        const now = walls.length ? isPenned(p.x, p.y) : false;
        p.penHits = now ? (p.penHits || 0) + 1 : 0;
        // a pen counts once it holds for two checks; going out, only the pens already made count
        p.penned = now && (was || (p.penHits >= 2 && (phase !== "out" || p.everPenned)));
        if (p.penned && !was) onPenned(p);
        if (!p.penned && was) onFreed(p);
      }
    }
    function onPenned(p) {
      if (!p.everPenned) {
        p.everPenned = true;
        pennedLog.push({ name: p.name, want: p.want });
        addTag(p);
        if (p.want) later(() => { if (p.penned) say(p, p.want, 5.5); }, 700);
      } else if (p.tag) p.tag.classList.remove(P + "gone");
    }
    function onFreed(p) {
      if (phase === "out" && p.everPenned && dropping) {
        p.released = true; p.leaving = 1; p.tx = p.x + (rng() < 0.5 ? -400 : 400); p.ty = p.side === "back" ? 0 : DEPTH;
        if (p.tag) p.tag.classList.add(P + "gone");
      } else if (p.tag) p.tag.classList.add(P + "gone");
    }
    function addTag(p) {
      const t = document.createElement("div"); t.className = P + "tag";
      if (has("barrier-escort-name-tag")) t.style.backgroundImage = `url("${url("barrier-escort-name-tag")}")`; else t.classList.add(P + "plain");
      t.textContent = p.name;
      tags.appendChild(t); p.tag = t;
    }

    // ---------- walls ----------
    function snap(x, y, ignore) {
      y = clamp(y, 0, DEPTH);
      if (y < 34) y = 0; else if (y > DEPTH - 34) y = DEPTH;
      let best = null;
      for (const w of walls) {
        if (w === ignore) continue;
        for (const e of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) { const d = Math.hypot(e.x - x, e.y - y); if (d < 30 && (!best || d < best.d)) best = { x: e.x, y: e.y, d: d - 6 }; }
        const n = nearestOn(w, x, y);
        if (n.d < 24 && (!best || n.d < best.d)) best = n;
      }
      return best ? { x: best.x, y: best.y } : { x, y };
    }
    function shapeWall(x1, y1, x2, y2) {
      const a = snap(x1, y1);
      let bx = x2, by = clamp(y2, 0, DEPTH);
      let len = Math.hypot(bx - a.x, by - a.y);
      if (len > MAXLEN) { bx = a.x + (bx - a.x) * MAXLEN / len; by = a.y + (by - a.y) * MAXLEN / len; }
      const b = snap(bx, by);
      len = Math.hypot(b.x - a.x, b.y - a.y);
      const cost = Math.ceil(len / METRE * 2);
      const ae = st.aegis;
      let why = "";
      if (len < 36) why = "short";
      else if (Math.hypot(a.x - ae.x, a.y - ae.y) > REACH || Math.hypot(b.x - ae.x, b.y - ae.y) > REACH) why = "Too far from Aegis. Walk closer.";
      else if (cost > st.load) why = `Not enough Load: that wall takes ${cost}.`;
      return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, len, cost, ok: !why, why };
    }
    function placeWall(s) {
      if (!s.ok) { if (s.why !== "short") toast(s.why); return false; }
      const w = { id: ++wallId, x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, len: s.len, born: time };
      walls.push(w);
      setLoad(st.load - s.cost);
      rebuildGrid(); updatePens();
      pops.push({ x: (w.x1 + w.x2) / 2, y: Math.min(w.y1, w.y2), z: WALL_H, t: 0, text: "VMMM", life: 0.7 });
      // light coming down beside a crew at work: they leave the boards
      for (const st2 of sites) {
        const c = st2.crew;
        if (c && (c.state === "build" || c.state === "walk") && Math.min(nearestOn(w, c.x, c.y).d, c.state === "build" ? nearestOn(w, st2.x, LANEY).d : 1e9) < 90) {
          c.state = "retreat"; c.tx = st2.door.x; c.ty = st2.door.y;
          pops.push({ x: c.x, y: c.y, z: PH, t: 0, text: "TCH.", life: 1.2 });
          toast("The light comes down beside the crew. They leave the boards.", 2.4);
        }
      }
      return true;
    }
    function dropWall(w) {
      if (phase !== "out" || !w) return;
      const before = people.filter((p) => p.penned && active(p)).length;
      walls = walls.filter((x) => x !== w);
      rebuildGrid(); dropping = true; updatePens(); dropping = false;
      const after = people.filter((p) => p.penned && active(p)).length;
      if (before > after) { st.released += 1; }
      st.tr.wait += DROP_WAIT; st.tr.waitKind = "gap"; st.late += DROP_WAIT;
      pops.push({ x: (w.x1 + w.x2) / 2, y: Math.min(w.y1, w.y2), z: 60, t: 0, text: "FFT", life: 0.8 });
      toast(before > after ? "The wall goes down. A crew takes the gap." : "The wall goes down. Nobody was behind it; a crew takes the gap.");
      computePenWalls();
    }
    function setLoad(v) {
      const old = st.load;
      st.load = clamp(Math.round(v), 0, 100);
      loadFill.style.width = (st.load * 0.71) + "%";
      loadNum.textContent = String(st.load);
      load.classList.toggle(P + "low", st.load < 16);
      load.setAttribute("aria-label", "Load " + st.load);
      if (st.load > old && !RM) { load.classList.remove(P + "pulse"); void load.offsetWidth; load.classList.add(P + "pulse"); }
    }
    setLoad(load0);

    let toastT = 0;
    function toast(t, s = 2.4) { msg.textContent = t; msg.classList.add(P + "show"); toastT = s; }
    function say(who, text, life = 4) { balloons = balloons.filter((b) => b.who !== who); balloons.push({ who, text, t: 0, life }); }

    // ---------- input ----------
    const held = new Set();
    let ptr = null; // {id, sx, sy, moved}
    on(cv, "pointerdown", (e) => {
      if (phase !== "in" && phase !== "out") return;
      cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      const r = cv.getBoundingClientRect();
      ptr = { id: e.pointerId, sx: e.clientX - r.left, sy: e.clientY - r.top, moved: false };
      e.preventDefault();
    });
    on(cv, "pointermove", (e) => {
      if (!ptr || e.pointerId !== ptr.id) return;
      const r = cv.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
      if (!ptr.moved && Math.hypot(px - ptr.sx, py - ptr.sy) > 14 && phase === "in") ptr.moved = true;
      if (ptr.moved) {
        const a = toWorld(ptr.sx, ptr.sy), b = toWorld(px, py);
        preview = shapeWall(a.x, a.y, b.x, b.y);
      }
    });
    const endPtr = (e) => {
      if (!ptr || e.pointerId !== ptr.id) return;
      const r = cv.getBoundingClientRect(); const px = e.clientX - r.left, py = e.clientY - r.top;
      if (ptr.moved) {
        if (e.type === "pointerup" && Math.hypot(px - ptr.sx, py - ptr.sy) > 14) { const a = toWorld(ptr.sx, ptr.sy), b = toWorld(px, py); placeWall(shapeWall(a.x, a.y, b.x, b.y)); }
      } else if (e.type === "pointerup") {
        const w = toWorld(px, py);
        if (phase === "out") {
          let best = null, bd = 26 / k;
          for (const wl of walls) {
            // hit the bar on screen: its floor line or its raised top
            const n = nearestOn(wl, w.x, w.y);
            const d2 = Math.min(n.d, distToRaised(wl, px, py));
            if (d2 < bd) { best = wl; bd = d2; }
          }
          if (best) { dropWall(best); ptr = null; preview = null; return; }
        }
        st.aegis.tx = w.x; st.aegis.ty = clamp(w.y, 0, DEPTH);
      }
      ptr = null; preview = null;
    };
    function distToRaised(wl, px, py) { // screen distance to the wall's band, in world units
      const ax = sx(wl.x1), ay = sy(wl.y1) - WALL_H * k * 0.5, bx = sx(wl.x2), by = sy(wl.y2) - WALL_H * k * 0.5;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)) / k - WALL_H * 0.35;
    }
    on(cv, "pointerup", endPtr); on(cv, "pointercancel", endPtr);
    const MOVE = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1], A: [-1, 0], D: [1, 0], W: [0, -1], S: [0, 1] };
    on(window, "keydown", (e) => {
      if (phase !== "in" && phase !== "out") return;
      if (e.target && e.target.tagName === "BUTTON") return;
      const key = e.key;
      if (MOVE[key] && !(phase === "out" && (key === "d" || key === "D") && false)) { held.add(key); st.aegis.tx = null; e.preventDefault(); }
      if (key === " " || key === "Enter") {
        e.preventDefault();
        if (phase === "out") { dropNearest(); return; }
        if (!anchor) { const s = snap(st.aegis.x, st.aegis.y); anchor = s; preview = shapeWall(anchor.x, anchor.y, anchor.x, anchor.y); toast("Wall: walk to the other end, then Space again.", 2); }
        else { placeWall(shapeWall(anchor.x, anchor.y, st.aegis.x, st.aegis.y)); anchor = null; preview = null; }
      }
      if (key === "x" || key === "X") { e.preventDefault(); if (phase === "out") dropNearest(); }
      if (key === "Escape") { anchor = null; preview = null; }
    });
    on(window, "keyup", (e) => { held.delete(e.key); });
    on(window, "blur", () => held.clear());
    function dropNearest() {
      const ae = st.aegis;
      let best = null, bd = REACH;
      for (const w of walls) { const n = nearestOn(w, ae.x, ae.y); const d = n.d - (penWalls.has(w) ? 120 : 0); if (n.d < REACH && d < bd) { bd = d; best = w; } }
      if (best) dropWall(best); else toast("No wall within reach.");
    }

    // ---------- the run ----------
    function startIn() {
      phase = "in"; time = 0;
      keys.innerHTML = "<b>Move</b> arrows · WASD · tap the floor &nbsp; <b>Wall</b> drag across the floor · Space, walk, Space &nbsp; <b>Absorb</b> stand in a cloud";
      resize();
      later(() => toast("Walk Aegis into the cloud ahead to take on Load.", 3), 900);
    }
    function finishIn() {
      phase = "between";
      held.clear(); anchor = null; preview = null; ptr = null;
      shared.set("barrier.transport_through", true);
      shared.set("barrier.penned", pennedLog.length);
      shared.set("barrier.penned_names", pennedLog.slice());
      shared.set("load", st.load);
      writeFlinches();
      const n = people.filter((p) => p.penned && active(p)).length;
      card({
        kick: "Chapter VIII · going out", title: "Escort out",
        paras: ["The transport is loaded and going back the way it came. Your walls are still standing.",
          n ? `${n === 1 ? "One person is" : n + " people are"} behind them. Their names are on the bar.` : "Nobody is behind them."],
        list: [["Drop", "Tap a wall · or stand near one and press Space. It goes down; anyone behind it walks out."],
          ["Cost", "Every wall you drop opens a gap a crew can use: the transport loses about four seconds."],
          ["Late", "There is no failure going out. A late transport is logged."]],
        button: "Take it out",
      }, startOut);
    }
    function startOut() {
      phase = "out";
      st.tr.x = L - 420; st.tr.dir = -1; st.tr.stall = 0; st.tr.wait = 0;
      st.aegis.x = L - 520; st.aegis.y = 235; st.aegis.tx = null;
      debris = []; clouds = []; balloons = [];
      for (const s of sites) { s.gone = true; s.crew = null; }
      for (const p of people) if (!p.penned) { p.x = clamp(p.x, 100, L - 100); }
      rebuildGrid(); computePenWalls();
      keys.innerHTML = "<b>Move</b> arrows · WASD · tap the floor &nbsp; <b>Drop a wall</b> tap it · Space beside it";
      st.hero.said = 3;
      resize();
    }
    function writeFlinches() {
      const mine = store.get("flinchesGiven", 0);
      const total = Math.max(0, shared.get("reese.flinches", 0) - mine) + st.flinches;
      shared.set("reese.flinches", total);
      store.set("flinchesGiven", st.flinches);
    }
    function finishOut() {
      if (ending) return; ending = true;
      shared.set("barrier.released", st.released);
      writeFlinches();
      say(st.hero, "Try to keep up, hero,", 2.4);
      later(() => {
        phase = "over";
        const kept = people.filter((p) => p.everPenned && !p.released && p.penned).map((p) => p.name);
        const out = people.filter((p) => p.everPenned && p.released).map((p) => p.name);
        const lines = ["The transport is out of the lower ring; its ramp closes."];
        if (kept.length) lines.push("Still behind your walls: " + kept.join(", ") + ".");
        if (out.length) lines.push("Walked out when the light went down: " + out.join(", ") + ".");
        if (!kept.length && !out.length) lines.push("Your walls closed on nobody.");
        lines.push(st.late > 0 ? `Logged: the transport was ${Math.round(st.late)} seconds late.` : "Logged: the transport was on time.");
        api.end({ outcome: "win", text: lines.join(" ") });
      }, RM ? 900 : 1900);
    }
    function lose() {
      if (ending) return; ending = true;
      phase = "over";
      shared.set("other_hero.met", true);
      writeFlinches();
      later(() => api.end({ outcome: "lose", text: "Three stops at standing barricades. The convoy is called back, and the escort restarts." }), RM ? 300 : 1200);
    }

    // ---------- update ----------
    function moveBlocked(x0, y0, x1, y1) {
      for (const w of walls) {
        if (segInt(x0, y0, x1, y1, w.x1, w.y1, w.x2, w.y2)) return w;
        if (nearestOn(w, x1, y1).d < 7 && nearestOn(w, x0, y0).d >= 7) return w;
      }
      return null;
    }
    function updateAegis(dt) {
      const ae = st.aegis;
      let mx = 0, my = 0;
      for (const kk of held) if (MOVE[kk]) { mx += MOVE[kk][0]; my += MOVE[kk][1]; }
      const sp = 240;
      if (mx || my) { const l = Math.hypot(mx, my); ae.x += mx / l * sp * dt; ae.y += my / l * sp * dt * 0.8; }
      else if (ae.tx != null) {
        const dx = ae.tx - ae.x, dy = ae.ty - ae.y, d = Math.hypot(dx, dy);
        if (d < 4) ae.tx = null; else { const s = Math.min(d, sp * dt); ae.x += dx / d * s; ae.y += dy / d * s; }
      }
      if (mx) ae.face = mx > 0 ? 1 : -1; else if (ae.tx != null) ae.face = ae.tx > ae.x ? 1 : -1;
      ae.y = clamp(ae.y, 0, DEPTH);
      ae.x = clamp(ae.x, camX + 40, camX + viewW - 40);
      if (anchor) preview = shapeWall(anchor.x, anchor.y, ae.x, ae.y);
      // stillness, for the leash
      const moved = Math.hypot(ae.x - ae.lastX, ae.y - ae.lastY);
      ae.lastX = ae.x; ae.lastY = ae.y;
      ae.stillT = moved < 0.4 ? ae.stillT + dt : 0;
      if (ae.stillT > 2) {
        const p = people.find((pp) => pp.penned && active(pp) && !pp.flinched && Math.hypot(pp.x - ae.x, (pp.y - ae.y) * 1.2) < 130);
        if (p) { p.flinched = true; flinch(); }
      }
      // absorb
      ae.absorbShow = Math.max(0, ae.absorbShow - dt);
      let inCloud = null;
      for (const c of clouds) if (c.a > 0.6 && Math.hypot((c.x - ae.x) / 110, (c.y - ae.y) / 70) < 1) inCloud = c;
      if (inCloud) { ae.absorbT += dt; ae.absorbShow = 0.5; if (ae.absorbT > 0.7) { clouds = clouds.filter((c) => c !== inCloud); ae.absorbT = 0; setLoad(st.load + 20); toast("Absorbed. +20 Load.", 1.4); ae.absorbShow = 0.9; } }
      else ae.absorbT = 0;
    }
    function flinch() {
      st.flinches += 1;
      setLoad(st.load + 10);
      flinchFx = 1.6; coolFx = 1; flinchGhostX = 0;
    }
    function updateTransport(dt) {
      const tr = st.tr;
      if (tr.wait > 0) { tr.wait -= dt; if (tr.wait <= 0) { tr.wait = 0; tr.waitKind = ""; } return; }
      if (tr.stall > 0) { tr.stall -= dt; if (phase === "out") st.late += dt; return; }
      if (phase === "in") {
        const front = tr.x + 200;
        const s = sites.find((ss) => ss.built && !ss.gone && front >= ss.x - 120 && tr.x < ss.x);
        if (s) {
          s.gone = true; st.stops += 1;
          tr.wait = STOP_WAIT; tr.waitKind = "stop";
          const m = document.createElement("span"); m.className = P + "stop"; m.textContent = "✕";
          m.style.left = (100 * (60 + 550 * (s.x - 420) / (L - 840)) / 640) + "%"; dist.appendChild(m);
          shake = 0.4;
          pops.push({ x: s.x, y: LANEY, z: 120, t: 0, text: "SKREE", life: 1 });
          if (st.stops >= 3) { toast("Third stop."); lose(); return; }
          toast(`The transport stops at a standing barricade. ${st.stops === 1 ? "One stop." : "Two stops. A third and the escort restarts."}`, 3.2);
          later(() => { rebuildGrid(); updatePens(); }, STOP_WAIT * 1000);
          return;
        }
        tr.x += SPEED_IN * dt;
        if (tr.x >= L - 380) finishIn();
      } else if (phase === "out") {
        tr.x -= SPEED_OUT * dt;
        if (tr.x <= 420) { tr.x = 420; finishOut(); }
      }
    }
    function updatePeople(dt) {
      const tr = st.tr;
      for (const p of people) {
        if (!active(p)) continue;
        if (p.leaving) {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
          if (d > 3) { p.x += dx / d * 55 * dt; p.y += dy / d * 55 * dt; }
          p.leaving += dt; if (p.leaving > 3) p.alpha = Math.max(0, p.alpha - dt);
          continue;
        }
        if (p.follow) { const f = byId[p.follow]; if (f && active(f)) { p.tx = f.x + 34; p.ty = clamp(f.y + 8, 0, DEPTH); } }
        const nearTr = Math.abs(p.x - tr.x) < 480;
        if (p.tx == null) p.pause -= dt;
        if (p.tx == null && p.pause <= 0 && !p.follow) {
          const base = p.penned ? p.x : p.home;
          p.tx = base + (rng() - 0.5) * (p.penned ? 160 : 420);
          const sideBack = nearTr ? p.y < LANEY : p.side === "back";
          p.ty = sideBack ? 10 + rng() * 90 : 210 + rng() * 80;
        }
        if (nearTr && p.y > LANE0 - 6 && p.y < LANE1 + 6) { p.ty = p.y < LANEY ? LANE0 - 30 : LANE1 + 30; if (p.tx == null) p.tx = p.x; }
        if (p.tx != null) {
          const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
          if (d < 3) { p.tx = p.follow ? p.tx : null; p.pause = 1 + rng() * 3; continue; }
          const s = Math.min(d, (p.kind === "child" ? 40 : 30) * dt);
          const nx = p.x + dx / d * s, ny = p.y + dy / d * s;
          if (moveBlocked(p.x, p.y, nx, ny)) { if (!p.follow) { p.tx = null; p.pause = 0.6 + rng(); } continue; }
          p.x = nx; p.y = clamp(ny, 0, DEPTH);
        }
      }
      // a penned person says it again when the transport passes going out
      if (phase === "out") for (const p of people) if (p.penned && active(p) && p.want && p.spoke < 1 && Math.abs(p.x - tr.x) < 380) { p.spoke = 1; say(p, p.want, 4.5); }
    }
    function updateSites(dt) {
      const tr = st.tr;
      for (const s of sites) {
        if (s.gone || s.built) continue;
        if (!s.active && s.x - tr.x < Math.min(1000, viewW * (1 - camRatio()) + 260)) {
          s.active = true;
          s.crew = { x: s.door.x, y: s.door.y, tx: s.x, ty: LANEY, state: "walk", blockT: 0, buildT: 0, detours: 0, a: 1 };
          toast("A crew is coming out to build ahead.", 2);
        }
        const c = s.crew;
        if (!c) continue;
        if (c.state === "walk") {
          const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
          if (d < 6) {
            if (c.tx === s.x && c.ty === LANEY) { c.state = "build"; }
            else { c.tx = s.x; c.ty = LANEY; }
            continue;
          }
          const sp = 40 * dt, nx = c.x + dx / d * Math.min(d, sp), ny = c.y + dy / d * Math.min(d, sp);
          const w = moveBlocked(c.x, c.y, nx, ny);
          if (w) {
            c.blockT += dt;
            if (c.blockT > 0.5 && c.detours < 2) {
              // go round the end that is not on the corridor's own wall, if there is one
              const ends = [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }].filter((e) => e.y > 2 && e.y < DEPTH - 2 && !walls.some((o) => o !== w && nearestOn(o, e.x, e.y).d < 3));
              if (ends.length) {
                ends.sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y));
                const e = ends[0], wx = w.x2 - w.x1, wy = w.y2 - w.y1, wl = Math.hypot(wx, wy) || 1;
                const sgn = (e.x === w.x2 && e.y === w.y2) ? 1 : -1;
                c.tx = clamp(e.x + sgn * wx / wl * 40, 0, L); c.ty = clamp(e.y + sgn * wy / wl * 40, 0, DEPTH);
                c.detours++; c.blockT = 0;
              } else c.detours = 9;
            }
            if (c.blockT > 2.2) {
              c.state = "retreat"; c.tx = s.door.x; c.ty = s.door.y;
              pops.push({ x: c.x, y: c.y, z: PH, t: 0, text: "TCH.", life: 1.2 });
              toast("The crew can't reach the road. They go back in.", 2.4);
            }
          } else { c.x = nx; c.y = ny; c.blockT = 0; }
        } else if (c.state === "build") {
          c.buildT += dt;
          if (c.buildT > 5) { s.built = true; c.state = "retreat"; c.tx = s.door.x; c.ty = s.door.y; rebuildGrid(); updatePens(); toast("A barricade stands in the road.", 2.2); }
        } else if (c.state === "retreat") {
          const dx = c.tx - c.x, dy = c.ty - c.y, d = Math.hypot(dx, dy);
          if (d > 4) { const sp = 60 * dt; const nx = c.x + dx / d * Math.min(d, sp), ny = c.y + dy / d * Math.min(d, sp); if (!moveBlocked(c.x, c.y, nx, ny)) { c.x = nx; c.y = ny; } else c.a -= dt * 0.5; }
          else c.a -= dt * 1.5;
          if (c.a <= 0) s.crew = null;
        }
      }
    }
    function updateThrowers(dt) {
      const tr = st.tr;
      for (const t of throwers) {
        if (phase !== "in") continue;
        const rel = t.x - tr.x;
        if (rel > 950 || rel < -250) continue;
        t.next -= dt;
        if (t.next > 0) continue;
        t.next = 2.1 + rng() * 1.1; t.n++;
        const T = 1.3, canister = t.n % 4 === 2;
        const aimX = tr.x + (tr.wait > 0 || tr.stall > 0 ? 0 : SPEED_IN * T) + (rng() - 0.5) * 220;
        const aimY = canister ? (t.y < LANEY ? 70 + rng() * 30 : 210 + rng() * 40) : LANEY + (rng() - 0.5) * 60;
        debris.push({ x: t.x, y: t.y, vx: (aimX - t.x) / T, vy: (aimY - t.y) / T, z: 70, vz: 300 * T / 2 + 10, canister, bounced: false, rest: 0, rot: rng() * 6, heroChecked: false });
      }
    }
    function updateDebris(dt) {
      const G = 300, tr = st.tr, ae = st.aegis, hero = st.hero;
      for (const d of debris) {
        if (d.rest > 0) { d.rest += dt; continue; }
        const ox = d.x, oy = d.y;
        d.x += d.vx * dt; d.y += d.vy * dt; d.vz -= G * dt; d.z += d.vz * dt; d.rot += dt * 5;
        if (d.y < 0 || d.y > DEPTH) { d.vy = -d.vy * 0.5; d.y = clamp(d.y, 0, DEPTH); }
        if (!d.bounced && d.z < WALL_H) for (const w of walls) {
          if (segInt(ox, oy, d.x, d.y, w.x1, w.y1, w.x2, w.y2)) {
            const wx = w.x2 - w.x1, wy = w.y2 - w.y1, wl = Math.hypot(wx, wy) || 1, nx = -wy / wl, ny = wx / wl;
            const dot = d.vx * nx + d.vy * ny;
            d.vx = (d.vx - 2 * dot * nx) * 0.45; d.vy = (d.vy - 2 * dot * ny) * 0.45;
            d.x = ox; d.y = oy; d.bounced = true;
            pops.push({ x: d.x, y: d.y, z: d.z, t: 0, text: "TING", life: 0.6 });
            break;
          }
        }
        if (!d.bounced && !d.canister && Math.hypot(d.x - ae.x, (d.y - ae.y) * 1.3) < 46 && d.z < PH) {
          d.vx = -d.vx * 0.35; d.vy = -d.vy * 0.35; d.bounced = true;
          pops.push({ x: d.x, y: d.y, z: d.z, t: 0, text: "BAP", life: 0.5 });
        }
        if (!d.heroChecked && !d.bounced && Math.hypot(d.x - hero.x, d.y - hero.y) < 120) {
          d.heroChecked = true;
          if (rng() < 0.4) { d.vx = -d.vx * 0.5; d.vy *= -0.5; d.bounced = true; pops.push({ x: d.x, y: d.y, z: d.z, t: 0, text: "SWAT", life: 0.6 }); }
        }
        if (d.z <= 0) {
          d.z = 0;
          if (d.canister) { clouds.push({ x: d.x, y: clamp(d.y, 20, DEPTH - 20), life: 10, t: 0, a: 0 }); d.rest = 99; pops.push({ x: d.x, y: d.y, z: 20, t: 0, text: "PFFF", life: 0.8 }); continue; }
          const onTr = phase === "in" && !d.bounced && d.x > tr.x - 200 && d.x < tr.x + 195 && d.y > LANE0 - 10 && d.y < LANE1 + 10;
          if (onTr) {
            tr.stall = Math.max(tr.stall, 1.0); tr.dents++; shake = 0.25;
            pops.push({ x: d.x, y: LANEY, z: 120, t: 0, text: "BONG", life: 0.8 });
            d.rest = 99;
          } else { d.rest = 0.01; d.vx = d.vy = 0; }
        }
      }
      debris = debris.filter((d) => d.rest < 3 && d.x > camX - 400 && d.x < camX + viewW + 1200);
    }
    function updateClouds(dt) {
      for (const c of clouds) { c.t += dt; c.a = Math.min(1, c.t / 0.6); if (c.life < 1e8 && c.t > c.life) c.a -= (c.t - c.life); }
      clouds = clouds.filter((c) => c.a > -0.1 || c.t < c.life);
      clouds = clouds.filter((c) => !(c.life < 1e8 && c.t > c.life + 1));
    }
    function updateHero(dt) {
      const h = st.hero, tr = st.tr;
      const ahead = phase === "out" ? -1 : 1;
      const tx = tr.x + ahead * (520 + 160 * Math.sin(time * 0.55)), ty = 150 + 125 * Math.sin(time * 0.37 + 1);
      const lag = phase === "out" ? 1.5 : 1.2;
      h.x += (tx - h.x) * Math.min(1, dt * lag); h.y += (ty - h.y) * Math.min(1, dt * lag);
      h.face = tx > h.x ? 1 : -1;
      if (phase === "in") {
        if (h.said === 0 && time > 2.5) { h.said = 1; say(h, "New,", 2.2); shared.set("other_hero.met", true); }
        else if (h.said === 1 && time > 5.2) { h.said = 2; say(h, "They finally sent the amber-lit one down from the Spire. I wondered when.", 4.6); }
      }
    }
    function update(dt) {
      time += dt;
      updateAegis(dt);
      updateTransport(dt);
      if (phase !== "in" && phase !== "out") return;
      const tr = st.tr;
      const target = phase === "out" ? tr.x - viewW * (W < 700 ? 0.74 : 0.66) : tr.x - viewW * camRatio();
      camX = clamp(target, 0, L - viewW);
      updateHero(dt);
      updatePeople(dt);
      if (phase === "in") { updateSites(dt); updateThrowers(dt); }
      updateDebris(dt);
      updateClouds(dt);
      penTimer -= dt;
      if (penTimer <= 0) { penTimer = 0.3; updatePens(); if (phase === "out") computePenWalls(); }
      // distance bar
      const p = phase === "out" ? (L - 420 - tr.x) / (L - 840) : (tr.x - 420) / (L - 840);
      mk.style.left = (100 * (60 + 550 * clamp(p, 0, 1)) / 640) + "%";
    }

    // ---------- draw ----------
    function sprite(id, x, y, h, flip, alpha, fb) {
      const info = { "barrier-escort-crew": 1, "barrier-escort-transport": 640 / 300, "barrier-escort-barricade": 360 / 220, "barrier-escort-canister": 100 / 160, "barrier-escort-cloud": 1.5, "barrier-escort-debris": 1.2, "barrier-escort-emitter": 200 / 240 }[id] || 200 / 320;
      const hh = Math.round(h / 4) * 4 || 4, ww = hh * info;
      const c = artReady ? bake(id, ww, hh) : null;
      if (alpha != null && alpha < 1) g.globalAlpha = Math.max(0, alpha);
      if (c) {
        if (flip) { g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(c, -ww / 2, y - hh, ww, hh); g.restore(); }
        else g.drawImage(c, x - ww / 2, y - hh, ww, hh);
      } else fb && fb(x, y, ww, hh);
      g.globalAlpha = 1;
    }
    const box = (col) => (x, y, w, h) => { g.fillStyle = col; g.strokeStyle = C.ink; g.lineWidth = 2; g.fillRect(x - w * 0.3, y - h, w * 0.6, h); g.strokeRect(x - w * 0.3, y - h, w * 0.6, h); };
    function layer(id, factor, top, h) {
      const im = imgs[id];
      const w = h * 1920 / 540;
      const c = im ? bake(id, w, h) : null;
      if (!c) return false;
      let off = -((camX * k * factor) % w);
      if (off > 0) off -= w;
      for (let x = off; x < W; x += w - 0.5) g.drawImage(c, x, top, w, h);
      return true;
    }
    function balloon(text, x, y) {
      g.font = `700 ${Math.round(clamp(13 * k + 2, 12, 15))}px ${FF}`;
      const maxW = Math.min(250, W * 0.62);
      const words = text.split(" "), lines = [];
      let line = "";
      for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
      lines.push(line);
      const lh = 17, bw = Math.max(...lines.map((l) => g.measureText(l).width)) + 18, bh = lines.length * lh + 10;
      let bx = clamp(x - bw / 2, 6, W - bw - 6), by = Math.max(6, y - bh - 14);
      g.fillStyle = C.white; g.strokeStyle = C.ink; g.lineWidth = 2;
      g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, 10) : g.rect(bx, by, bw, bh); g.fill(); g.stroke();
      const tx = clamp(x, bx + 14, bx + bw - 14);
      g.beginPath(); g.moveTo(tx - 7, by + bh - 1); g.lineTo(tx, by + bh + 11); g.lineTo(tx + 7, by + bh - 1); g.fill();
      g.beginPath(); g.moveTo(tx - 7, by + bh); g.lineTo(tx, by + bh + 11); g.lineTo(tx + 7, by + bh); g.stroke();
      g.fillStyle = C.ink; g.textBaseline = "top"; g.textAlign = "left";
      lines.forEach((l, i) => g.fillText(l, bx + 9, by + 6 + i * lh));
    }
    function drawWall(w, pv) {
      const ax = sx(w.x1), ay = sy(w.y1), bx = sx(w.x2), by = sy(w.y2), h = WALL_H * k;
      const age = pv ? 1 : clamp((time - w.born) / 0.25, 0, 1);
      const hh = h * (RM ? 1 : age);
      g.lineJoin = "round";
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx, by - hh); g.lineTo(ax, ay - hh); g.closePath();
      g.fillStyle = pv ? (w.ok ? "rgba(246,226,168,.45)" : "rgba(154,90,90,.35)") : "rgba(246,226,168,.62)";
      g.fill();
      g.strokeStyle = C.ink; g.lineWidth = pv ? 1.5 : 2.5;
      if (pv) g.setLineDash([7, 5]);
      g.stroke(); g.setLineDash([]);
      if (!pv) {
        // clean bars: the base, the top rail and the two posts, each a flat pale-gold bar in an even outline
        const bar = (x1, y1, x2, y2, wd) => {
          g.lineCap = "round";
          g.strokeStyle = C.ink; g.lineWidth = wd + 4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
          g.strokeStyle = C.pale; g.lineWidth = wd; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
          g.strokeStyle = C.glow; g.lineWidth = Math.max(1, wd * 0.3); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        };
        const bw = Math.max(5, 9 * k);
        bar(ax, ay, ax, ay - hh, bw); bar(bx, by, bx, by - hh, bw);
        bar(ax, ay, bx, by, bw); bar(ax, ay - hh, bx, by - hh, bw);
        g.lineCap = "butt";
        const cs = 26 * k;
        for (const [px, py] of [[ax, ay - hh], [bx, by - hh]]) {
          const c = artReady ? bake("barrier-escort-wall-cap", cs, cs) : null;
          if (c) g.drawImage(c, px - cs / 2, py - cs / 2, cs, cs);
          else { g.fillStyle = C.pale; g.beginPath(); g.arc(px, py, cs / 2.4, 0, 7); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke(); }
        }
        if (phase === "out" && penWalls.has(w)) { // a pen wall: a small white tag hung on its cap
          const px = (ax + bx) / 2, py = (ay + by) / 2 - hh;
          g.strokeStyle = C.ink; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 10); g.stroke();
          g.fillStyle = C.white; g.fillRect(px - 16, py - 24, 32, 14); g.strokeRect(px - 16, py - 24, 32, 14);
          g.fillStyle = C.ink; g.font = `700 9px ${FF}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TAP", px, py - 17);
        }
      } else if (!w.ok && w.why && w.why !== "short") {
        g.fillStyle = C.red; g.font = `700 12px ${FF}`; g.textAlign = "center"; g.textBaseline = "bottom";
        g.fillText(w.why.split(":")[0].replace(". Walk closer.", ""), (ax + bx) / 2, Math.min(ay, by) - hh - 4);
      } else if (w.ok) {
        g.fillStyle = C.ink; g.font = `700 12px ${FF}`; g.textAlign = "center"; g.textBaseline = "bottom";
        g.fillText(`${(w.len / METRE).toFixed(1)} m · ${w.cost} Load`, (ax + bx) / 2, Math.min(ay, by) - hh - 4);
      }
    }
    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      let shx = 0, shy = 0;
      if (shake > 0 && !RM) { shx = (Math.random() - 0.5) * 6 * shake; shy = (Math.random() - 0.5) * 4 * shake; }
      g.setTransform(dpr, 0, 0, dpr, shx * dpr, shy * dpr);
      // far: the deck, the city through the gap
      g.fillStyle = "#dfe6e4"; g.fillRect(-10, -10, W + 20, yBack + 20);
      const farH = Math.max(yBack / 0.7, 200);
      if (!layer("barrier-escort-far", 0.3, yBack - farH * 0.7, farH)) {
        g.fillStyle = "#a9bbba"; for (let i = 0; i < 12; i++) { const x = ((i * 190 - camX * k * 0.3) % (W + 200) + W + 200) % (W + 200) - 100; g.fillRect(x, yBack * 0.35, 90, yBack * 0.65); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x, yBack * 0.35, 90, yBack * 0.65); }
      }
      // mid: the stalls on the corridor's back wall
      const midH = Math.min(yBack * 0.95, 330 * k + 60);
      g.fillStyle = C.light; g.fillRect(0, yBack - midH * 0.42, W, midH * 0.42);
      layer("barrier-escort-mid", 0.6, yBack - midH * 0.86, midH);
      // floor
      g.fillStyle = C.floor; g.fillRect(0, yBack, W, yFront - yBack);
      g.fillStyle = C.lane; g.fillRect(0, sy(LANE0), W, sy(LANE1) - sy(LANE0));
      g.strokeStyle = C.seam; g.lineWidth = 1.5;
      for (let wx = Math.floor(camX / 240) * 240; wx < camX + viewW + 240; wx += 240) { g.beginPath(); g.moveTo(sx(wx), yBack); g.lineTo(sx(wx) - 30 * k, yFront); g.stroke(); }
      g.strokeStyle = C.ink; g.lineWidth = 1.5; g.setLineDash([16, 12]);
      for (const ly of [LANE0, LANE1]) { g.beginPath(); g.moveTo(0, sy(ly)); g.lineTo(W, sy(ly)); g.stroke(); }
      g.setLineDash([]);
      g.lineWidth = 3; g.beginPath(); g.moveTo(0, yBack); g.lineTo(W, yBack); g.stroke();
      // the ledge below the front edge
      g.fillStyle = C.ledge; g.fillRect(0, yFront, W, H - yFront);
      g.beginPath(); g.moveTo(0, yFront); g.lineTo(W, yFront); g.stroke();
      // doors in the back wall and stairs at the front
      for (const s of sites) {
        const dx = sx(s.door.x);
        if (dx < -80 || dx > W + 80) continue;
        if (s.side === "back") { const dh = 105 * k, dw = 58 * k; g.fillStyle = C.door; g.fillRect(dx - dw / 2, yBack - dh, dw, dh); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.strokeRect(dx - dw / 2, yBack - dh, dw, dh); }
        else { const dw = 70 * k; g.fillStyle = C.door; g.fillRect(dx - dw / 2, yFront, dw, 16 * k); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.strokeRect(dx - dw / 2, yFront, dw, 16 * k); }
      }
      // clouds on the floor
      for (const c of clouds) {
        const x = sx(c.x), y = sy(c.y);
        if (x < -200 || x > W + 200) continue;
        sprite("barrier-escort-cloud", x, y + 30 * k * q, 140 * k, false, clamp(c.a, 0, 1) * 0.9, (X, Y, w, h) => { g.fillStyle = "rgba(207,216,200,.8)"; g.beginPath(); g.ellipse(X, Y - h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke(); });
      }
      // depth-sorted things
      const things = [];
      const tr = st.tr;
      for (const w of walls) things.push({ y: Math.max(w.y1, w.y2), f: () => drawWall(w, false) });
      if (preview && preview.len > 4) things.push({ y: Math.max(preview.y1, preview.y2) + 0.1, f: () => drawWall(preview, true) });
      things.push({ y: LANEY + 30, f: () => {
        const x = sx(tr.x), y = sy(LANEY + 32) + (RM || tr.wait > 0 || tr.stall > 0 ? 0 : Math.sin(time * 9) * 1);
        sprite("barrier-escort-transport", x, y, 190 * k, tr.dir < 0, 1, (X, Y, w, h) => { g.fillStyle = "#7d8988"; g.fillRect(X - w / 2, Y - h, w, h * 0.8); g.strokeStyle = C.ink; g.lineWidth = 2.5; g.strokeRect(X - w / 2, Y - h, w, h * 0.8); });
        if (tr.dir < 0 && imgs["barrier-escort-transport"]) { // going out the drawing is turned: set the plate's letters right again
          const hh = Math.round(190 * k / 4) * 4, ww = hh * 640 / 300, l = x - ww / 2 + 520 / 640 * ww, t = y - hh + 190 / 300 * hh;
          g.fillStyle = C.light; g.strokeStyle = C.ink; g.lineWidth = 1.5;
          g.fillRect(l, t, 90 / 640 * ww, 30 / 300 * hh); g.strokeRect(l, t, 90 / 640 * ww, 30 / 300 * hh);
          g.fillStyle = C.ink; g.font = `700 ${Math.max(7, Math.round(12.6 / 300 * hh))}px ${FF}`; g.textAlign = "center"; g.textBaseline = "middle";
          g.fillText("RCC", l + 45 / 640 * ww, t + 15 / 300 * hh);
        }
        if (tr.wait > 0 && tr.waitKind === "gap") { // a crew uses the gap
          const gx = sx(tr.x + tr.dir * 270);
          sprite("barrier-escort-barricade", gx, sy(LANEY + 20), 90 * k, false, 1, box(C.rust));
          sprite("barrier-escort-crew", gx + 50 * k, sy(LANEY + 10), PHK * 0.95, tr.dir > 0, 1, box("#8a7a5e"));
        }
      } });
      for (const s of sites) {
        if (s.built && !s.gone) things.push({ y: LANEY + 1, f: () => sprite("barrier-escort-barricade", sx(s.x), sy(LANEY + 34), 150 * k, false, 1, box(C.rust)) });
        if (s.crew && !(s.built && s.crew.state === "build")) {
          const c = s.crew;
          things.push({ y: c.y, f: () => {
            const x = sx(c.x), y = sy(c.y);
            if (c.state === "build") sprite("barrier-escort-barricade", sx(s.x), sy(LANEY + 34), 150 * k * clamp(c.buildT / 5, 0.15, 1), false, 0.85, box(C.rust));
            sprite("barrier-escort-crew", x, y, PHK * dscale(c.y), c.tx < c.x, c.a, box("#8a7a5e"));
          } });
        }
      }
      if (phase === "in") for (const t of throwers) {
        const x = sx(t.x);
        if (x < -200 || x > W + 200) continue;
        things.push({ y: t.y, f: () => {
          sprite("barrier-escort-crew", x + 10 * k, sy(t.y) - 4, PHK * dscale(t.y) * 0.95, true, 1, box("#8a7a5e"));
          sprite("barrier-escort-barricade", x, sy(t.y) + 6, 130 * k * dscale(t.y), false, 1, box(C.rust));
        } });
      }
      for (const p of people) {
        if (!active(p)) continue;
        const x = sx(p.x);
        if (x < -100 || x > W + 100) continue;
        const id = p.kind === "child" ? "barrier-escort-child" : p.kind === "insurgent" ? "barrier-escort-insurgent" : "barrier-escort-bystander";
        things.push({ y: p.y, f: () => sprite(id, x, sy(p.y), PHK * dscale(p.y), p.tx != null && p.tx < p.x, p.alpha, box(p.kind === "insurgent" ? "#7d8f7a" : C.rust)) });
      }
      const ae = st.aegis;
      things.push({ y: ae.y + 0.2, f: () => {
        const x = sx(ae.x), y = sy(ae.y);
        if (anchor) { g.strokeStyle = C.amber; g.lineWidth = 2; g.beginPath(); g.arc(sx(anchor.x), sy(anchor.y), 9, 0, 7); g.stroke(); }
        g.strokeStyle = "rgba(217,154,43,.5)"; g.lineWidth = 1.5; g.setLineDash([4, 6]);
        g.beginPath(); g.ellipse(x, y, REACH * k, REACH * k * q, 0, 0, 7); g.stroke(); g.setLineDash([]);
        sprite(ae.absorbShow > 0 ? "barrier-escort-aegis-absorb" : "barrier-escort-aegis", x, y, PHK * dscale(ae.y) * 1.04, ae.face < 0, 1, box(C.pale));
      } });
      const h = st.hero;
      things.push({ y: h.y, f: () => sprite("barrier-escort-other-hero", sx(h.x), sy(h.y), PHK * dscale(h.y), h.face < 0, 1, box(C.door)) });
      for (const d of debris) {
        things.push({ y: d.y + 0.3, f: () => {
          const x = sx(d.x), y = sy(d.y);
          if (x < -60 || x > W + 60) return;
          if (d.z > 2) { g.fillStyle = "rgba(43,53,54,.25)"; g.beginPath(); g.ellipse(x, y, 16 * k, 5 * k, 0, 0, 7); g.fill(); }
          g.save(); g.translate(x, y - d.z * k); if (!RM) g.rotate(d.canister ? 0 : d.rot);
          sprite(d.canister ? "barrier-escort-canister" : "barrier-escort-debris", 0, (d.canister ? 26 : 20) * k, (d.canister ? 52 : 42) * k, false, d.rest > 1.5 ? 3 - d.rest : 1, box("#b9c6c4"));
          g.restore();
        } });
      }
      // emitters at the two gates
      for (const ex of [260, L - 260]) { const x = sx(ex); if (x > -120 && x < W + 120) things.push({ y: -1, f: () => sprite("barrier-escort-emitter", x, yBack + 6, 104 * k, false, 1, box(C.teal)) }); }
      things.sort((a, b) => a.y - b.y);
      for (const t of things) t.f();
      // near: pillars and the railing, the foreground
      const nearH = Math.max(H - yBack + 120 * k, 260 * k);
      const nearTop = H - nearH * 0.97;
      g.save(); g.beginPath(); g.rect(0, yFront - 8, W, H); g.clip();
      layer("barrier-escort-near", 1.2, nearTop, nearH);
      g.restore();
      g.save(); g.globalAlpha = 0.3; g.beginPath(); g.rect(0, 0, W, yFront - 8); g.clip();
      layer("barrier-escort-near", 1.2, nearTop, nearH);
      g.restore();
      // onomatopoeia
      g.textAlign = "center"; g.textBaseline = "middle";
      for (const p of pops) {
        const a = 1 - p.t / p.life;
        if (a <= 0) continue;
        g.globalAlpha = a;
        g.font = `800 ${Math.round(15 + 7 * k)}px ${FF}`;
        const x = sx(p.x), y = sy(p.y) - p.z * k - (RM ? 0 : p.t * 22);
        g.lineWidth = 4; g.strokeStyle = C.white; g.strokeText(p.text, x, y);
        g.fillStyle = p.text === "VMMM" ? C.amber : C.ink; g.fillText(p.text, x, y);
        g.globalAlpha = 1;
      }
      // balloons
      for (const b of balloons) {
        const who = b.who;
        const x = sx(who.x), y = sy(who.y) - PHK * dscale(who.y) - 4;
        if (x < -40 || x > W + 40) continue;
        balloon(b.text, x, y);
      }
      // the leash: edges whiten, a chalk figure's ghost crosses the page, the warmth cools
      if (coolFx > 0) { g.fillStyle = `rgba(94,115,117,${0.35 * coolFx})`; g.fillRect(0, 0, W, H); }
      if (flinchFx > 0) {
        const a = clamp(flinchFx / 1.6, 0, 1);
        const grd = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
        grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(1, `rgba(255,255,255,${0.9 * a})`);
        g.fillStyle = grd; g.fillRect(0, 0, W, H);
        chalkGhost(RM ? W * 0.5 : -80 + (W + 160) * flinchGhostX, H * 0.42, Math.min(160, H * 0.25), a);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function chalkGhost(x, y, s, a) {
      g.save(); g.globalAlpha = a * 0.85; g.strokeStyle = C.white; g.lineCap = "round"; g.lineWidth = 4;
      const j = (n) => Math.sin(n * 12.9898 + Math.floor(time * 8)) * 2;
      const L2 = (x1, y1, x2, y2, n) => { g.beginPath(); g.moveTo(x + x1 * s + j(n), y + y1 * s + j(n + 1)); g.lineTo(x + x2 * s + j(n + 2), y + y2 * s + j(n + 3)); g.stroke(); };
      g.beginPath(); g.arc(x, y - 0.38 * s, 0.13 * s, 0, 7); g.stroke();
      L2(0, -0.25, 0, 0.18, 1); L2(0, -0.12, -0.24, 0.06, 2); L2(0, -0.12, 0.26, -0.02, 3); L2(0, 0.18, -0.16, 0.5, 4); L2(0, 0.18, 0.18, 0.5, 5);
      g.restore();
    }
    const dscale = (y) => 0.88 + 0.2 * (y / DEPTH);

    // ---------- loop ----------
    let raf = 0, last = performance.now();
    const frames = [];
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t0 = performance.now();
      if (phase === "in" || phase === "out") update(dt);
      else if (phase === "over") { time += dt; }
      for (const b of balloons) b.t += dt;
      balloons = balloons.filter((b) => b.t < b.life);
      for (const p of pops) p.t += dt;
      pops = pops.filter((p) => p.t < p.life);
      if (toastT > 0) { toastT -= dt; if (toastT <= 0) msg.classList.remove(P + "show"); }
      if (flinchFx > 0) { flinchFx -= dt; flinchGhostX += dt / 1.6; }
      if (coolFx > 0) coolFx -= dt;
      if (shake > 0) shake -= dt;
      draw();
      frames.push(performance.now() - t0); if (frames.length > 300) frames.shift();
    }
    raf = requestAnimationFrame(frame);
    // read-only view of the state, for the play test
    Object.defineProperty(wrap, "_be", { value: () => ({ phase, k, q, yBack, camX, W, H, load: st.load, stops: st.stops, tr: { ...st.tr }, aegis: { x: st.aegis.x, y: st.aegis.y },
      sites: sites.map((s) => ({ x: s.x, side: s.side, active: s.active, built: s.built, gone: s.gone, crew: s.crew && { x: s.crew.x, y: s.crew.y, state: s.crew.state } })),
      clouds: clouds.map((c) => ({ x: c.x, y: c.y, a: c.a })), walls: walls.map((w) => ({ x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2, pen: penWalls.has(w) })),
      penned: people.filter((p) => p.penned && active(p)).map((p) => p.name), flinches: st.flinches, released: st.released, late: st.late,
      frameMs: frames.reduce((a, b) => a + b, 0) / (frames.length || 1) }) });

    // ---------- open on the how-to ----------
    card({
      kick: "Chapter VIII · Containment Action", title: "Barrier escort",
      quote: "“a containment action against Insurgent elements holding a supply corridor on the city's lower ring”",
      cite: "Part VIII, Scene 2 VI",
      paras: ["Bring the transport through the supply corridor. Crews come out of the doors to build barricades in its road; others throw from behind the barricades already standing."],
      list: [["Move", "Arrows or WASD · tap the floor."],
        ["Wall", "Press, drag, release across the floor: a straight bar of hard light, 2 Load a metre, within the ring around Aegis. Keys: Space at one end, walk, Space at the other."],
        ["Absorb", "Stand in a canister cloud: +20 Load."],
        ["Road", "The transport passes through your walls. Nothing else does: not debris, not a crew, not anyone."],
        ["Stops", "Three stops at a standing barricade and the escort restarts."]],
      button: "Begin the escort",
    }, startIn);
    keys.textContent = "";

    return {
      unmount() {
        cancelAnimationFrame(raf);
        for (const id of timers) clearTimeout(id);
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        ro.disconnect();
        baked.clear();
        wrap.remove();
      },
    };
  },
};

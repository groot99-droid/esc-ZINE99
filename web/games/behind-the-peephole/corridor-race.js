// Behind the Peephole / Corridor race (2D, scroll). Style: architect's technical section: the
// passage as a dimensioned long section, technical pen on cream, dry-transfer lettering.
// One stretch of night two (`n2_shift_race`, DESIGN.md section 10): 01:00 to 02:15, the returns of
// 401, 405 and 406 (games/behind-the-peephole/data/beats.json), the loose boards, the light-well
// windows, the pipe run and Dora's trolley. Be at each door when it opens.
// Actions: MOVE (walk, run, crawl), the PIPE RUN (up and down), HOP (clears a board) and the ROSE
// (Interact at an occupied door: a glimpse for the log, at the price of that guest's unease).
// Phases: Dora's round (01:00 to 01:30) with 401's return, then two bells inside a quarter hour,
// ten metres apart. Cut: no full push-in to the lens; the stranger and the blackout belong to
// other nights.
// Art (games/behind-the-peephole/art): the passage long section is the backdrop (passage-lit, drawn
// at 47 px to the metre from x = 96, floor at y = 300); the watcher and Dora are the scale-figure
// sprites, keyed out of their paper; the bell board strip rings with each bell; chapter card two
// opens the sheet. The pipe run and the loose boards follow the drawing: 16 to 38 m, 38 to 42 m.

// Phase 2 (2026-11-16): the ladder. TEACH: one bell, the long run and the loose boards, nothing else
// awake. TEST: the stretch above, with the BELL WIRES (T at an occupied door: one tug a room, the guest
// goes to the main door and off the bathroom window; they feel it, +10) and Dora's PARKED TROLLEY left
// in the passage after her round (walk into it to push it at 0.6 m/s; behind it the light well cannot
// see you; it will not pass the cabinet at 33 m). TWIST: night five, the blackout (`n5_blackout`,
// `n5_linen_count`): the hazards change places. The windows are dark and harmless, the pipe run rings,
// and Dora stands counting at the open cabinet: move only while she counts aloud. Then the seventh coin.
// Layer link (api.shared "lostProperty", set by Lockwork): Dora stops at the cabinet on her round and
// leaves the trolley there, so the floor is shut at 33 m and the pipe run is the way past.
import { staged } from "./_stages.js";
import { mark } from "./_seventh.js";
// Phase 3 (2026-11-16): night two (TEST) starts as you leave the office, and the bare seventh pull on
// the bell board rings once with no bulb lit; staying on the floor to the last bell gives the third mark
// of the seventh row (api.shared "seventh"). The bell board is drawn on a phone too, and a phone shows
// six metres of passage, not eight, so the figures are larger.

const LEN = 64;
const DOORS = { r401: 8, r402: 16, r403: 28, r404: 36, r405: 46, r406: 56 };
const GLIMPSE = {
  r402: "Presses the orchid in the hotel directory.",
  r404: "A miniature into the sink; \"401\" on the notepad.",
  r401: "Irons tomorrow's shirt.",
  r405: "Chess by phone: \"Nf3.\"",
  r406: "Boat three on the sill.",
};
const WINDOWS = [18, 26], BOARDS = [38, 42], LEDGE = [16, 38], LEDGE_H = 0.6, CABINET = 33;
const ALCOVES = [12, 50];
const MIN = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
// Threshold and glimpse lines are the clue texts of night two in beats.json.
const RUNS = [
  { night: 2, start: "01:40", end: "02:00", spm: 1.5, inAt: ["r404", "r402", "r401", "r406"], returns: [{ room: "r405", bell: "01:45", door: "01:57", line: "Grease under her nails again." }],
    goal: "One bell. Be at 405 when its door opens. Run the long stretch; walk the loose boards.", sheet: "SHEET 3 / 7", go: "START · 01:40",
    open: "Night two, 01:40. Dora has gone down in the lift and one guest is still out. Forty-six metres to her door, and four loose boards on the way." },
  { night: 2, start: "01:00", end: "02:15", spm: 1.5, inAt: ["r404", "r402"], dora: true, windows: true,
    returns: [{ room: "r401", bell: "01:15", door: "01:27", line: "A suit, not his kit." }, { room: "r405", bell: "01:45", door: "01:57", line: "Grease under her nails again." }, { room: "r406", bell: "02:00", door: "02:12", line: "A coil of blue rope." }],
    goal: "Be at each door as it opens: 401, 405, 406. Dora must not see you twice.", sheet: "SHEET 4 / 7", go: "START · 01:00",
    open: "Night two, 01:00. Dora's trolley is at the stair end and three guests are still out. The bell will tell you who, and when." },
  { night: 5, start: "01:50", end: "02:22", spm: 2.4, inAt: ["r401", "r402", "r403", "r404", "r405", "r406"], dark: true,
    returns: [{ room: "r406", bell: "01:51", door: "02:14", line: "A knock at her main door: two quick, one slow. You were at the rose." }],
    goal: "Lights out. Be at 406 for the knock at 2:14. Pass Dora only while she counts aloud.", sheet: "SHEET 6 / 7", go: "START · 01:50",
    open: "Night five, 01:50. The passage circuit trips. Six coins of light ahead, one at each rose, and a candle at the open cabinet where Dora is counting what the guests left. Tonight the knock is at 406." },
];
const NOTES = {
  open: "Night two, 01:00. Dora's trolley is at the stair end and three guests are still out. The bell will tell you who, and when.",
  dora: "Wheels at the stair end: Dora, with the linen. She doesn't speak to you. She tells Lew.",
  doraGone: "The trolley goes down in the service lift. The passage is yours again.",
  first: "There. The door opens on someone who doesn't know you were waiting.",
  two: "Two bells inside a quarter hour, ten metres apart. Choose your floor.",
};

const P = "behind-the-peephole-corridor-race-";
export default staged(P, ["the boards", "two bells, Dora, the wires", "the blackout"], function play(root, api, stage) {
    const RUN = RUNS[stage.stage], RETURNS = RUN.returns, IN_AT_START = RUN.inAt, START = MIN(RUN.start), END = MIN(RUN.end), SPM = RUN.spm, DARK = !!RUN.dark;
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const LOSTP = stage.stage === 1 && !!shared.get("lostProperty", false);
    const C = DARK ? { paper: "#0b0a09", ink: "#d9cfb4", faint: "#6b6350", ev: "#e8825a", amber: "#e0a24a", amberL: "#f6cf86", brass: "#b8913f", river: "#6f7c80", bottle: "#1f3d2c", blue: "#9db0e8" }
      : { paper: "#efe6cf", ink: "#1c1a17", faint: "#7a705a", ev: "#a3302a", amber: "#e0a24a", amberL: "#f6cf86", brass: "#b8913f", river: "#6f7c80", bottle: "#1f3d2c", blue: "#2a3a8c" };
    const PANEL = DARK ? "#171512" : "#fbf6e8";
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;touch-action:none;user-select:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:${C.ink}}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}pad{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:0 10px}
    .${P}b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.06em;background:${PANEL};color:${C.ink};border:1.4px solid ${C.ink};min-width:50px;min-height:44px;padding:4px 10px;cursor:pointer;touch-action:none;transition:background .12s}
    .${P}b:hover,.${P}b:focus-visible{background:${DARK ? "#2a251d" : "#f3e3b8"};outline:none}
    .${P}b.on{background:${C.ink};color:${C.paper}}
    .${P}b[hidden]{display:none}
    .${P}b.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px ${C.ev}}}
    .${P}block{position:absolute;left:14px;right:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;border:1.4px solid ${C.ink};background:${DARK ? "rgba(23,21,18,.92)" : "rgba(251,246,232,.92)"};font-size:13px;line-height:1.35}
    .${P}block .n{padding:6px 10px;border-right:1.4px solid ${C.ink};min-height:5.4em}
    .${P}block .n p{margin:0}
    .${P}block .n p:first-child{color:${C.ev};font-weight:600}
    .${P}block .n p.story{color:${C.blue};font-style:italic;font-weight:400}
    .${P}block .t{padding:6px 10px;white-space:nowrap}
    .${P}block .t b{display:block;font-size:14px;letter-spacing:.08em}
    @media (max-width:640px){.${P}block{grid-template-columns:1fr}.${P}block .n{min-height:5.6em}.${P}block .n{border-right:0;border-top:1.4px solid ${C.ink};order:2}.${P}block .t{white-space:normal}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;color:${C.ink};background:${DARK ? "rgba(11,10,9,.94)" : "rgba(239,230,207,.94)"};z-index:3;padding:12px;overflow:auto}
    .${P}sheet{max-width:560px;width:100%;border:1.6px solid ${C.ink};background:${PANEL} repeating-linear-gradient(0deg,transparent 0 23px,rgba(42,58,140,.07) 23px 24px);font-size:14px;line-height:1.45;box-shadow:6px 6px 0 rgba(28,26,23,.12)}
    .${P}sheet .hd{display:flex;justify-content:space-between;gap:8px;border-bottom:1.4px solid ${C.ink};padding:8px 12px;font-weight:600;letter-spacing:.12em;font-size:13px}
    .${P}sheet h2{margin:0;padding:12px 12px 4px;font-size:22px;letter-spacing:.18em}
    .${P}sheet .goal{margin:0;padding:0 12px 8px;font-weight:600}
    .${P}sheet .open{margin:0;padding:0 12px 10px;color:${C.blue};font-style:italic}
    .${P}sheet table{width:calc(100% - 24px);margin:0 12px 10px;border-collapse:collapse}
    .${P}sheet td{border:1px solid ${C.ink};padding:5px 8px;vertical-align:top}
    .${P}sheet td:first-child{font-weight:600;white-space:nowrap;width:1%}
    .${P}sheet kbd{font:inherit;border:1px solid ${C.faint};padding:0 4px;background:#fff;color:#1c1a17}
    .${P}sheet .ft{display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1.4px solid ${C.ink};padding:8px 12px}
    .${P}sheet label{font-size:13px}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div"); wrap.className = P + "wrap"; root.appendChild(wrap);
    const cv = document.createElement("canvas"); wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const block = document.createElement("div"); block.className = P + "block"; 
    block.innerHTML = `<div class="n"></div><div class="t"></div>`; wrap.appendChild(block);
    const blockN = block.querySelector(".n"), blockT = block.querySelector(".t");
    const pad = document.createElement("div"); pad.className = P + "pad";
    pad.innerHTML = ["◀:left", "▶:right", "RUN:run", "CRAWL:crawl", "▲ PIPE:up:1", "▼ DOWN:down:1", "HOP:hop:1", "ROSE · E:rose:1", "WIRE · T:wire:1"].map((s) => { const [l, a, h] = s.split(":"); return `<button type="button" class="${P}b" data-a="${a}"${h ? " hidden" : ""}>${l}</button>`; }).join("");
    wrap.appendChild(pad);
    const btn = (a) => pad.querySelector(`[data-a="${a}"]`);

    // ---- the art: the long section as the backdrop, the scale figures keyed out of their paper
    const art = api.art || { has: () => false, url: () => "", img: () => Promise.resolve(null) };
    const A = {};
    let disposed = false;
    const PX = 47, AX0 = 96, AFL = 300, BGK = 1.5;
    async function raster(id, w, h, key) {
      const im = await art.img(id); if (!im || disposed) return null;
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d", key ? { willReadFrequently: true } : undefined);
      try {
        g.drawImage(im, 0, 0, w, h);
        if (key) { // paper to nothing, ink stays: alpha from darkness
          const d = g.getImageData(0, 0, w, h), q = d.data;
          for (let i = 0; i < q.length; i += 4) { const l = (q[i] * 0.3 + q[i + 1] * 0.59 + q[i + 2] * 0.11); const a = Math.max(0, Math.min(1, (222 - l) / 120)); q[i + 3] = Math.round(a * 255); if (DARK) { q[i] = 217; q[i + 1] = 207; q[i + 2] = 180; } }
          g.putImageData(d, 0, 0);
        }
      } catch { return null; }
      return (A[id] = c);
    }
    (async () => {
      const bgc = await raster(DARK ? "passage-blackout" : "passage-lit", 3200 * BGK, 520 * BGK); if (bgc) A["passage-lit"] = bgc;
      if (DARK) await raster("sprite-seventh-coin", 480, 360);
      await Promise.all([raster("sprite-watcher", 840, 360, true), raster("sprite-dora-trolley", 640, 360, true), raster("ui-bell-strip", 480, 150)]);
      if (!disposed) resize();
    })();

    // ---- state
    let game = 0, started = false, over = false;
    const me = { x: 1, level: 0, dir: 1, hop: 0, crawl: false, run: false, phase: 0, moving: 0 };
    const susp = { r401: 0, r402: 0, r403: 0, r404: 0, r405: 0, r406: 0 };
    const blind = new Set();
    const caught = new Set(), missed = new Set(), glimpsed = new Set();
    let seenByStaff = 0, maidSeeing = false, rungBells = new Set(), bellFlash = null;
    const seenAt = new Set(); let lastBoard = -1;
    // phase 2: the wires, the parked trolley, the blackout
    const wired = {}, wireUntil = {}; let trolley = null, heardThis = false, coin = null, coinAsk = 0, saidDora = false, creaks = 0;
    const CYC = () => 3.6 + (gentle ? 1.4 : 2.0), listening = () => DARK && started && (game * SPM) % CYC() >= 3.6;
    const notes = [];
    const fx = []; // flourishes: {kind, x, t}
    let left = false, right = false, runHeld = false, runToggle = false, crawlToggle = false, downHeld = false, roseHeld = false, roseT = 0;
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    let story = "";
    const note = (s) => { notes.unshift(s); notes.length = Math.min(notes.length, 2); paintBlock(); };
    const tell = (s) => { story = s; paintBlock(); };
    const unlocked = new Set();
    function unlock(a, text) { if (unlocked.has(a)) return; unlocked.add(a); const b = btn(a); if (b) { b.hidden = false; b.classList.add("new"); timers.push(setTimeout(() => b.classList.remove("new"), 3200)); } if (a === "up") { btn("down").hidden = false; } if (text) tell(text); }

    const T = () => START + game;
    const occupied = (r, t) => IN_AT_START.includes(r) || RETURNS.some((x) => x.room === r && t >= MIN(x.door));
    const atWindow = (r, t) => RUN.windows && occupied(r, t) && !((wireUntil[r] || 0) > t) && ((Math.floor(t) + { r401: 1, r402: 3, r403: 5, r404: 7, r405: 9, r406: 4 }[r]) % 10) === 0;
    // Dora's round, 01:00 to 01:30; with lost property opened she stops two minutes at the cabinet
    const maidPos = (t) => {
      if (DARK) return CABINET + 0.9;
      if (!RUN.dora || t < START || t >= START + 30) return null;
      const d = 0.9 * SPM, m = t - START, tc = (64 - (CABINET + 1)) / d;
      if (!LOSTP || m < tc) return 64 - d * m;
      return CABINET + 1;
    };
    const inAlcove = () => me.level === 0 && ALCOVES.some((a) => Math.abs(me.x - a) < 0.7);
    const doorHere = () => { for (const r in DOORS) if (Math.abs(me.x - DOORS[r]) < 0.8 && me.level === 0) return r; return null; };
    const sight = () => (gentle ? 4 : 6);

    function step(dt) {
      if (!started || over) return;
      game += dt / SPM;
      const t = T();
      if (t >= END) { finish(); return; }
      if (stage.stage === 1) {
        if (!unlocked.has("dora") && t >= START + 1) { unlocked.add("dora"); tell(LOSTP ? "Because you opened lost property in Lockwork, Dora's round ends at the cabinet tonight, and her trolley stays against it." : NOTES.dora); }
        if (!unlocked.has("doraGone") && t >= START + 30) { unlocked.add("doraGone"); trolley = { x: LOSTP ? CABINET - 0.9 : maidPos(START + 29.99) - 0.4 }; tell(LOSTP ? "Dora goes down in the lift. Her trolley stays against the cabinet: the floor is shut at 33 m. The pipe run goes over." : "Dora goes down in the lift and leaves the trolley in the passage. Walk into it to push it: behind it, the light well cannot see you."); }
        if (!unlocked.has("two") && t >= MIN("02:00")) { unlocked.add("two"); tell(NOTES.two); }
        if (t >= START + 4) unlock("rose", "Between bells, an occupied rose is a glimpse for the log: hold E at its door. They feel it.");
        if (t >= START + 8) unlock("wire", "The 1926 bell wires run over the pipes. At an occupied door, T tugs its wire: the guest goes to the main door, off the bathroom window. One tug a room; they feel it.");
      }
      if (!DARK && me.x > 11 && stage.stage > 0) unlock("up", "The pipe run, +0.60 under the light-well windows: nobody sees you up there. ▲ / W.");
      if (DARK && me.x > 11) unlock("up", "");
      if (me.x > 32 || stage.stage === 0 && me.x > 20) unlock("hop", DARK ? "" : "Loose boards ahead, the four from 38 m. Walk them, or hop one: Space.");
      if (DARK) stepDark(dt, t);
      // bells
      for (const r of RETURNS) {
        if (!rungBells.has(r.room) && t >= MIN(r.bell)) { rungBells.add(r.room); bellFlash = { room: r.room, t: performance.now() }; note(DARK ? `THE KNOCK IS DUE AT ${r.room.slice(1)} · ${r.door}` : `BELL ${r.room.slice(1)} · ${"●".repeat(+r.room.slice(3))} · door opens ${r.door}`); }
        if (!caught.has(r.room) && !missed.has(r.room) && t >= MIN(r.door)) {
          if (Math.abs(me.x - DOORS[r.room]) < 1.2 && me.level === 0 && !blind.has(r.room)) {
            caught.add(r.room); note(`${r.room.slice(1)} · THRESHOLD CAUGHT: ${r.line}`);
            fx.push({ kind: "ok", x: DOORS[r.room], t: performance.now() });
            if (caught.size === 1) tell(NOTES.first);
          } else { missed.add(r.room); note(`${r.room.slice(1)} · THE DOOR OPENED WITHOUT YOU`); fx.push({ kind: "miss", x: DOORS[r.room], t: performance.now() }); }
        }
      }
      // movement
      const run = runHeld || runToggle;
      const crawl = me.level === 0 && (crawlToggle || downHeld);
      me.crawl = crawl; me.run = run && !crawl;
      const sp = roseHeld ? 0 : crawl ? 0.8 : me.run ? 4.0 : 1.6;
      let vx = 0;
      if (me.hop > 0) { me.hop -= dt; vx = me.dir * 1.2 / 0.35; if (me.hop <= 0) me.hop = 0; }
      else if (left && !right) { vx = -sp; me.dir = -1; } else if (right && !left) { vx = sp; me.dir = 1; }
      let nx = me.x + vx * dt;
      const mp = maidPos(t);
      if (mp != null && !DARK && me.level === 0 && me.hop === 0) {
        if (me.x <= mp - 1 && nx > mp - 1) nx = mp - 1;
        if (me.x >= mp + 0.8 && nx < mp + 0.8) nx = mp + 0.8;
      }
      if (trolley && me.level === 0 && me.hop === 0) { // push it: 0.6 m/s, and never past the cabinet
        const push = (to) => { const lim = trolley.x < CABINET ? [0.9, CABINET - 0.8] : [CABINET + 0.8, LEN - 0.9]; return Math.max(lim[0], Math.min(lim[1], to)); };
        if (me.x <= trolley.x - 0.7 && nx > trolley.x - 0.7) { const tx = push(trolley.x + Math.min(nx - (trolley.x - 0.7), 0.6 * dt)); nx = tx - 0.7; trolley.x = tx; trolley.pushed = true; }
        else if (me.x >= trolley.x + 0.7 && nx < trolley.x + 0.7) { const tx = push(trolley.x - Math.min(trolley.x + 0.7 - nx, 0.6 * dt)); nx = tx + 0.7; trolley.x = tx; trolley.pushed = true; }
      }
      nx = Math.max(0.4, Math.min(LEN - 0.4, nx));
      me.moving = Math.abs(nx - me.x) / Math.max(dt, 1e-3);
      me.x = nx;
      me.phase += me.moving * dt * 3;
      if (me.level === 1 && (me.x < LEDGE[0] || me.x > LEDGE[1])) { me.level = 0; note("OFF THE END OF THE PIPE RUN"); }
      // the boards
      const bi = me.x >= BOARDS[0] && me.x < BOARDS[1] ? Math.floor(me.x - BOARDS[0]) : -1;
      if (bi !== lastBoard) {
        if (bi >= 0 && me.level === 0 && me.hop === 0 && me.run && me.moving > 2 && !(trolley && Math.abs(trolley.x - me.x) < 1.2)) {
          creaks++;
          if (DARK) heard("A BOARD CREAKS IN THE DARK");
          note("CREAK · +25 TO EVERY OCCUPIED ROOM WITHIN 12 m");
          fx.push({ kind: "creak", x: me.x, t: performance.now() });
          for (const r in DOORS) if (occupied(r, t) && Math.abs(DOORS[r] - me.x) <= 12) bump(r, 25);
        }
        lastBoard = bi;
      }
      // the light-well windows
      if (me.level === 0 && !me.crawl && me.x >= WINDOWS[0] && me.x <= WINDOWS[1] && !(trolley && Math.abs(trolley.x - me.x) < 1.3)) {
        for (const r in DOORS) if (atWindow(r, t) && !seenAt.has(r + Math.floor(t))) { seenAt.add(r + Math.floor(t)); bump(r, 30); note(`SEEN ACROSS THE LIGHT WELL BY ${r.slice(1)} · +30`); fx.push({ kind: "seen", x: me.x, t: performance.now() }); }
      }
      // the maid
      const sees = mp != null && !DARK && me.level === 0 && !inAlcove() && me.x < mp && mp - me.x <= sight();
      if (sees && !maidSeeing) { seenByStaff++; note(`DORA SEES YOU · SEEN BY STAFF ${seenByStaff} OF 2`); fx.push({ kind: "seen", x: me.x, t: performance.now() }); }
      maidSeeing = sees;
      // the rose: a glimpse for the log
      const d = doorHere();
      if (roseHeld && d && occupied(d, t) && !blind.has(d) && !glimpsed.has(d)) {
        roseT += dt; susp[d] = Math.min(100, susp[d] + 6 * dt);
        if (susp[d] >= 70) bump(d, 0);
        if (roseT >= 1.5) { glimpsed.add(d); roseT = 0; note(`${d.slice(1)} · GLIMPSE: ${GLIMPSE[d]}`); fx.push({ kind: "ok", x: DOORS[d], t: performance.now() }); }
      } else roseT = 0;
      for (const r in susp) if (!(roseHeld && d === r)) susp[r] = Math.max(0, susp[r] - dt);
      paintBlock();
    }
    function heard(why) {
      if (heardThis || over) return; heardThis = true; seenByStaff++;
      note(`${why} · DORA STOPS COUNTING · HEARD ${seenByStaff} OF 2`); fx.push({ kind: "seen", x: me.x, t: performance.now() });
      if (seenByStaff >= 2) finish();
    }
    // the blackout: move only while she counts aloud; the pipes ring; then the seventh coin
    function stepDark(dt, t) {
      const near = Math.abs(me.x - CABINET) <= 10;
      if (!listening()) heardThis = false;
      else if (near && (me.moving > 0.15 || me.hop > 0)) heard("A STEP WHILE SHE LISTENS");
      if (me.level === 1) { me.level = 0; heardThis = false; heard("THE PIPES RING UNDER YOUR WEIGHT"); tell("In the light the pipe run was the quiet road. In the dark it rings."); }
      if (!saidDora && Math.abs(me.x - CABINET) < 7) { saidDora = true; tell("Dora, to the open cabinet, not to you: \"Somebody has to count what they leave.\""); }
      if (caught.size && !coin) {
        if (!coinAsk) { coinAsk = performance.now(); tell("The knock, the feet going away. Behind you the passage is six coins of light, all the way back. Turn round."); }
        if ((left && !right) || me.dir === -1) { coin = performance.now(); over = true; timers.push(setTimeout(() => { over = false; finish(); }, RM ? 3200 : 4600)); }
        else if (performance.now() - coinAsk > 14000) finish();
      }
    }
    function tug() {
      if (!started || over || !unlocked.has("wire")) return;
      const d = doorHere(), t = T();
      if (!d || !occupied(d, t)) { note("NO OCCUPIED DOOR HERE TO TUG"); return; }
      if (wired[d]) { note(`${d.slice(1)} · THAT WIRE HAS BEEN TUGGED TONIGHT`); return; }
      wired[d] = true; wireUntil[d] = t + 6; bump(d, 10);
      note(`${d.slice(1)} · WIRE TUGGED · A BELL INSIDE · AT THE MAIN DOOR, OFF THE WINDOW · +10`); fx.push({ kind: "ok", x: DOORS[d], t: performance.now() });
    }
    function bump(r, v) {
      susp[r] = Math.min(100, susp[r] + v);
      if (susp[r] >= 70 && !blind.has(r)) { blind.add(r); note(`${r.slice(1)} COVERS THE ROSE FOR THE NIGHT`); }
    }
    function finish() {
      if (over) return;
      over = true;
      const n = caught.size, g = glimpsed.size, need = RETURNS.length;
      const marks = RETURNS.map((r) => r.room.slice(1) + (caught.has(r.room) ? " ●" : " ○")).join(", ");
      let outcome, text;
      if (stage.stage === 0) {
        outcome = n === 1 ? "win" : "lose";
        text = n === 1 ? `405's door opened and you were at the rose: “${RETURNS[0].line}” ${creaks ? `The boards spoke ${creaks === 1 ? "once" : creaks + " times"} on the way; walk them next time.` : "The boards never spoke."} Next: two bells ten metres apart, and Dora between you and them.`
          : "The bell rang and 405's door opened on an empty passage. Run the long stretch, walk the four boards from 38 m, and stand at the rose before the ring runs out.";
      } else if (DARK) {
        outcome = seenByStaff >= 2 || !n ? "lose" : coin ? "win" : "done";
        text = seenByStaff >= 2 ? "Dora stopped counting twice. The second time she lifted the candle and looked down the passage, and you were in it. Move while she counts aloud; when she stops to listen, be still. And keep off the pipes."
          : !n ? "2:14, and the knock came at 406 with nobody at its rose. Run the far stretches, and take the ten metres either side of Dora a count at a time."
            : coin ? `You passed Dora at arm's length, on her own counting, and were at 406 for the knock${seenByStaff ? " (heard once)" : ""}. Then you turned round. Six coins of light back down the passage, and a seventh at the far end: the lens in your own door, lit from inside. Something crossed it.`
              : "You were at 406 for the knock, and stood facing the stair until Lew reset the circuit. Whatever was behind you in the dark, you did not turn to count it.";
      } else {
        const lose = seenByStaff >= 2 || n <= 1;
        outcome = lose ? "lose" : n === need && blind.size === 0 ? "win" : "done";
        if (seenByStaff >= 2) text = `Dora saw you twice and told Lew, and Lew told Wren. His next call keeps you on the line: tomorrow's shift starts at 23:15. Thresholds: ${marks}.`;
        else if (n <= 1) text = `The bells rang and the doors opened without you. Thresholds: ${marks}. Run the long stretches, walk the boards, and stand at the rose before it opens.`;
        else if (outcome === "win") text = `Every door, on time, and nobody felt the passage. Thresholds: ${marks}; ${g} glimpse${g === 1 ? "" : "s"} besides.${Object.keys(wired).length ? ` ${Object.keys(wired).length} wire${Object.keys(wired).length === 1 ? "" : "s"} tugged.` : ""}${trolley && trolley.pushed ? " Dora will find her trolley moved." : ""}`;
        else text = `Thresholds: ${marks}; ${g} glimpse${g === 1 ? "" : "s"}.${blind.size ? ` But ${[...blind].map((r) => r.slice(1)).join(" and ")} covered the rose: someone behind that door now knows the dark has an eye in it.` : " One door opened on an empty passage."}`;
        if (stage.stage === 1 && outcome !== "lose") { mark(shared, "bell"); text += " And one more thing, from the start of the night: as you left the office the bare seventh pull on the bell board rang once, and no bulb lit. Nobody was due. The board rings for the office too."; }
      }
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      api.store.set("best", Math.max(api.store.get("best", 0), n));
      timers.push(setTimeout(() => api.end({ outcome, text }), 500));
    }

    // ---- drawing
    let W = 0, H = 0, S = 40, view = 14, camX = 0, gy = 0, narrow = false;
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      narrow = W < 640;
      const padH = pad.getBoundingClientRect().height || 50;
      const blockH = block.getBoundingClientRect().height || 60;
      block.style.bottom = padH + 16 + "px";
      const blockTop = H - padH - 16 - blockH;
      S = Math.min(narrow ? W / 6 : W / 14, (blockTop - 90 - 80) / 3.6);
      S = Math.max(14, S);
      view = W / S;
      const secH = 3.3 * S + 70;
      const top = 82, avail = blockTop - 10 - top;
      gy = top + Math.max(0, (avail - secH) / 2) + 3.3 * S;
      if (A["passage-lit"]) gy = Math.min(top + Math.max(0, avail - secH) + 3.3 * S, Math.max(gy, 76 + 4.4 * S));
    }
    let lastBlock = "";
    function paintBlock() {
      const t = T(), hh = Math.floor(t / 60) % 24, mm = Math.floor(t % 60);
      const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      const tgt = RETURNS.find((r) => rungBells.has(r.room) && !caught.has(r.room) && !missed.has(r.room));
      const due = tgt ? `${tgt.room.slice(1)} OPENS ${tgt.door} · IN ${Math.max(0, Math.ceil(MIN(tgt.door) - t))} MIN` : "NO BELL YET";
      const lines = notes.length ? notes : [DARK ? "MOVE WHILE SHE COUNTS. BE STILL WHEN SHE LISTENS." : "BE AT EACH DOOR WHEN IT OPENS. WALK THE BOARDS."];
      const key = lines.join("|") + story + clock + due + caught.size + seenByStaff + (DARK ? listening() : "");
      if (key === lastBlock) return;
      lastBlock = key;
      blockN.innerHTML = "";
      lines.forEach((s, i) => { const p = document.createElement("p"); p.textContent = s; if (i || !notes.length) p.style.color = C.ink, p.style.fontWeight = 400; blockN.appendChild(p); });
      if (story) { const p = document.createElement("p"); p.className = "story"; p.textContent = story; blockN.appendChild(p); }
      blockT.innerHTML = `<b>SECTION B-B · ${clock}</b>${due}<br>CAUGHT ${caught.size}/${RETURNS.length}${DARK ? ` · HEARD ${seenByStaff}/2` : stage.stage ? ` · STAFF ${seenByStaff}/2` : ""}`;
    }
    const L = (x1, y1, x2, y2, w = 1, c = C.ink, dash) => { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
    function hatch(x, y, w, h, gap = 6, c = C.faint) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      for (let k = -h; k < w; k += gap) L(x + k, y + h, x + k + h, y, 0.6, c);
      ctx.restore();
    }
    const txt = (s, x, y, size = 12, align = "left", c = C.ink, bold = false) => { ctx.font = `${bold ? 600 : 400} ${size}px 'IBM Plex Mono',monospace`; ctx.fillStyle = c; ctx.textAlign = align; ctx.fillText(s, x, y); ctx.textAlign = "left"; };
    function dim(x1, x2, y, label) {
      L(x1, y, x2, y, 0.8);
      for (const x of [x1, x2]) { L(x - 4, y + 4, x + 4, y - 4, 1.4); L(x, y - 8, x, y + 8, 0.5, C.faint); }
      if (Math.abs(x2 - x1) > label.length * 7) txt(label, (x1 + x2) / 2, y - 4, 11, "center");
    }
    const sx = (m) => (m - camX) * S;
    const sy = (h) => gy - h * S;

    function figure(x, h, pose) {
      const sp = A["sprite-watcher"];
      if (sp) {
        // crops of the sheet: walk, run, crawl (ground line at y = 300, 120 px to the metre)
        const cr = pose === "crawl" ? [585, 190, 200, 114, 105] : pose === "run" && me.moving > 2 ? [318, 88, 188, 216, 102] : [96, 92, 90, 212, 44];
        const k = S / 120, X = sx(x), Y = sy(h), bob = RM || me.moving < 0.1 ? 0 : Math.abs(Math.sin(me.phase * 2)) * 2.5 * k;
        ctx.save(); ctx.translate(X, Y - bob); ctx.scale(me.dir * k, k);
        ctx.drawImage(sp, cr[0], cr[1], cr[2], cr[3], -cr[4], -(300 - cr[1]) , cr[2], cr[3]);
        ctx.restore();
        txt("YOU", X, Y + Math.max(13, 0.38 * S), 12, "center", C.ink, true);
        return;
      }
      ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(2, S / 22); ctx.lineCap = "round";
      const X = sx(x), Y = sy(h), k = S / 46;
      const sw = Math.sin(me.phase * 2) * (me.moving > 0.1 ? 1 : 0);
      ctx.beginPath();
      if (pose === "crawl") {
        ctx.arc(X + me.dir * 24 * k, Y - 18 * k, 6 * k, 0, 7);
        ctx.moveTo(X - me.dir * 16 * k, Y - 14 * k); ctx.lineTo(X + me.dir * 18 * k, Y - 16 * k);
        ctx.moveTo(X - me.dir * 16 * k, Y - 14 * k); ctx.lineTo(X - me.dir * (22 + sw * 4) * k, Y);
        ctx.moveTo(X + me.dir * 14 * k, Y - 16 * k); ctx.lineTo(X + me.dir * (16 - sw * 4) * k, Y);
        ctx.stroke();
      } else {
        const lean = pose === "run" ? me.dir * 8 * k : 0, hh = 74 * k, hip = 34 * k;
        const a = 0.35 + 0.65 * Math.abs(sw);
        ctx.moveTo(X + lean * 0.8, Y - hh + 8 * k); ctx.lineTo(X, Y - hip);
        ctx.moveTo(X, Y - hip); ctx.lineTo(X + (sw >= 0 ? 1 : -1) * a * 13 * k, Y);
        ctx.moveTo(X, Y - hip); ctx.lineTo(X - (sw >= 0 ? 1 : -1) * a * 13 * k, Y);
        const sh = Y - 56 * k;
        if (pose === "rose") { ctx.moveTo(X + lean * 0.6, sh); ctx.lineTo(X + me.dir * 12 * k, Y - 64 * k); }
        else { ctx.moveTo(X + lean * 0.6, sh); ctx.lineTo(X + lean * 0.6 - (sw || 0.4) * 14 * k, Y - 36 * k); ctx.moveTo(X + lean * 0.6, sh); ctx.lineTo(X + lean * 0.6 + (sw || 0.4) * 14 * k, Y - 36 * k); }
        ctx.stroke();
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X + lean, Y - hh, 7 * k, 0, 7); ctx.fill();
      }
      ctx.lineCap = "butt";
      txt("YOU", X, Y + Math.max(13, 0.38 * S), 12, "center", C.ink, true);
    }

    function render(now) {
      const t = T();
      const lead = me.moving > 0.2 ? me.dir * 2 : 0;
      const target = me.x + lead - view / 2;
      const k = RM ? 1 : 0.08;
      camX += (Math.max(-0.5, Math.min(LEN + 0.5 - view, target)) - camX) * k;
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      // paper: faint drafting grid and a little tooth
      ctx.strokeStyle = DARK ? "rgba(157,176,232,.05)" : "rgba(42,58,140,.06)"; ctx.lineWidth = 1;
      for (let x = (-camX * S) % 20; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(6, 6, W - 12, H - 12);

      // key plan, 1:400
      const kx = 20, kw = W - 40, ky = 22, km = (m) => kx + kw * m / LEN;
      txt("KEY PLAN 1:400", kx, ky + 2, 12, "left", C.ink, true);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(kx, ky + 10, kw, 16);
      hatch(km(BOARDS[0]), ky + 10, km(BOARDS[1]) - km(BOARDS[0]), 16, 3, C.ink);
      ctx.fillStyle = "rgba(111,124,128,.3)"; ctx.fillRect(km(WINDOWS[0]), ky + 10, km(WINDOWS[1]) - km(WINDOWS[0]), 16);
      const tgt = RETURNS.find((r) => rungBells.has(r.room) && !caught.has(r.room) && !missed.has(r.room));
      for (const r in DOORS) {
        L(km(DOORS[r]), ky + 10, km(DOORS[r]), ky + 30, 0.8);
        const isT = tgt && tgt.room === r;
        txt(r.slice(1), km(DOORS[r]), ky + 44, 12, "center", isT ? C.ev : C.ink, isT || caught.has(r));
        if (caught.has(r)) txt("✓", km(DOORS[r]) + 17, ky + 44, 12, "left", C.ev, true);
      }
      if (!narrow) { txt("OFFICE", kx, ky + 44, 12); txt("STAIR", kx + kw, ky + 44, 12, "right"); }
      ctx.strokeStyle = C.ev; ctx.setLineDash([4, 3]); ctx.strokeRect(km(camX), ky + 6, km(camX + view) - km(camX), 24); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(km(me.x), ky + 18, 4.5, 0, 7); ctx.fill();
      const mp = maidPos(t);
      if (mp != null) { ctx.fillStyle = C.ev; ctx.fillRect(km(mp) - 4, ky + 12, 8, 12); }

      // the section
      const bg = A["passage-lit"], roseH = bg ? 1.55 : 1.6;
      const ceil = sy(3.0), slab = (bg ? 0.68 : 0.3) * S;
      if (bg) {
        // the drawing, from just above its soffit labels to the underside of the floor slab
        const z = S / PX, sy0 = AFL - 3 * PX - 64, sy1 = AFL + 32;
        let x0 = AX0 + camX * PX, x1 = x0 + W / z; x0 = Math.max(30, x0); x1 = Math.min(3200 - 30, x1);
        if (x1 > x0) ctx.drawImage(bg, x0 * BGK, sy0 * BGK, (x1 - x0) * BGK, (sy1 - sy0) * BGK, sx(0) + (x0 - AX0) * z, gy - (AFL - sy0) * z, (x1 - x0) * z, (sy1 - sy0) * z);
      }
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      if (!bg) {
      ctx.strokeRect(sx(0), ceil - slab, LEN * S, slab); hatch(sx(0), ceil - slab, LEN * S, slab, 7);
      ctx.strokeRect(sx(0), gy, LEN * S, slab); hatch(sx(0), gy, LEN * S, slab, 7);
      txt("+3.00 SOFFIT", Math.min(W - 16, sx(LEN)) - 4, ceil - slab - 5, 11, "right");
      txt("±0.00 FFL", 14, gy + slab + 14, 11);
      hatch(sx(-1), ceil - slab, S, gy + slab - ceil + slab, 4, C.ink); txt("OFFICE", sx(0) + 6, ceil + 16, 12);
      hatch(sx(LEN), ceil - slab, S, gy + slab - ceil + slab, 4, C.ink); txt("STAIR", sx(LEN) - 6, ceil + 16, 12, "right");
      L(sx(0), sy(1.0), sx(LEN), sy(1.0), 0.6, C.faint);
      } else txt("±0.00 FFL", 14, gy + slab + 14, 11);
      // light-well windows, and the bathroom windows lit across the well
      if (!bg) {
      ctx.fillStyle = "rgba(111,124,128,.18)"; ctx.fillRect(sx(WINDOWS[0]), sy(2.6), (WINDOWS[1] - WINDOWS[0]) * S, 1.0 * S);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(sx(WINDOWS[0]), sy(2.6), (WINDOWS[1] - WINDOWS[0]) * S, 1.0 * S);
      for (let m = WINDOWS[0]; m <= WINDOWS[1]; m += 2) L(sx(m), sy(2.6), sx(m), sy(1.6), 0.8);
      txt("LIGHT WELL 18–26 m · CRAWL OR PIPE RUN", sx((WINDOWS[0] + WINDOWS[1]) / 2), sy(2.6) - 6, 11, "center");
      } else if (stage.stage) txt(DARK ? "DARK: NOBODY SEES ACROSS THE WELL · THE PIPES RING" : "CRAWL OR PIPE RUN", sx((WINDOWS[0] + WINDOWS[1]) / 2), sy(1.12), 11, "center", C.ev);
      const lit = Object.keys(DOORS).filter((r) => atWindow(r, t));
      lit.forEach((r, i) => { const x = sx(WINDOWS[0] + 1 + i * 2.6); ctx.fillStyle = C.amber; ctx.fillRect(x, sy(2.45), 0.7 * S, 0.5 * S); ctx.strokeRect(x, sy(2.45), 0.7 * S, 0.5 * S); txt(r.slice(1), x + 0.35 * S, sy(1.75), 12, "center", C.ev, true); });
      // the danger zone below the windows when a window is lit
      if (lit.length) { ctx.fillStyle = "rgba(163,48,42,.08)"; ctx.fillRect(sx(WINDOWS[0]), sy(1.6), (WINDOWS[1] - WINDOWS[0]) * S, 1.1 * S); }
      // pipe run
      if (!bg) {
      L(sx(LEDGE[0]), sy(LEDGE_H), sx(LEDGE[1]), sy(LEDGE_H), 2.2);
      L(sx(LEDGE[0]), sy(0.42), sx(LEDGE[1]), sy(0.42), 0.8); L(sx(LEDGE[0]), sy(0.3), sx(LEDGE[1]), sy(0.3), 0.8);
      for (let m = LEDGE[0]; m <= LEDGE[1]; m += 3) L(sx(m), sy(LEDGE_H), sx(m), sy(0), 0.6, C.faint);
      txt("PIPE RUN +0.60", sx(LEDGE[0]) + 4, sy(LEDGE_H) - 5, 11);
      // loose boards
      hatch(sx(BOARDS[0]), gy - 5, (BOARDS[1] - BOARDS[0]) * S, 10, 3, C.ev);
      for (let b = BOARDS[0]; b <= BOARDS[1]; b++) L(sx(b), gy - 7, sx(b), gy + 5, 1, C.ev);
      // alcoves
      for (const a of ALCOVES) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(sx(a - 0.7), sy(2.2), 1.4 * S, 2.2 * S); ctx.setLineDash([]); txt("ALCOVE", sx(a), sy(2.2) - 5, 11, "center"); }
      } else {
        // the loose boards in evidence red over the drawing; the alcoves named as cover
        ctx.fillStyle = "rgba(163,48,42,.16)"; ctx.fillRect(sx(BOARDS[0]), gy - 7, (BOARDS[1] - BOARDS[0]) * S, 9);
        for (const a of ALCOVES) txt("HIDE", sx(a), sy(0.2), 11, "center", C.ev, true);
      }
      // doors with their roses
      const here = doorHere();
      for (const r in DOORS) {
        const x = sx(DOORS[r] - 0.45);
        if (!bg) {
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x, sy(2.1), 0.9 * S, 2.1 * S);
          ctx.strokeRect(x + 0.1 * S, sy(2.0), 0.7 * S, 0.8 * S); ctx.strokeRect(x + 0.1 * S, sy(1.0), 0.7 * S, 0.9 * S);
          txt(r.slice(1), sx(DOORS[r]), sy(2.1) - 7, Math.max(14, S * 0.3), "center", C.ink, true);
        }
        const occ = occupied(r, t), isT = tgt && tgt.room === r;
        const rr = Math.max(5, S * 0.1);
        ctx.beginPath(); ctx.arc(sx(DOORS[r]), sy(roseH), rr, 0, 7);
        ctx.fillStyle = blind.has(r) ? C.ink : isT ? C.amberL : occ ? C.amber : C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
        if (isT) { const pul = RM ? 0.5 : Math.abs(Math.sin(now / 220)); ctx.beginPath(); ctx.arc(sx(DOORS[r]), sy(roseH), rr + 4 + 5 * pul, 0, 7); ctx.strokeStyle = C.amber; ctx.lineWidth = 2; ctx.stroke(); }
        if (occ) {
          // unease, as a pencilled gauge on the door, with the 70 mark
          const gw = 0.7 * S;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 0.8; ctx.strokeRect(x + 0.1 * S, sy(0.3), gw, 7);
          ctx.fillStyle = susp[r] >= 40 ? C.ev : C.faint; ctx.fillRect(x + 0.1 * S, sy(0.3), gw * susp[r] / 100, 7);
          L(x + 0.1 * S + gw * 0.7, sy(0.3) - 2, x + 0.1 * S + gw * 0.7, sy(0.3) + 9, 1, C.ev);
        }
        if (here === r && occ && !blind.has(r) && !glimpsed.has(r) && unlocked.has("rose") && !RETURNS.some((q) => q.room === r && t < MIN(q.door))) {
          txt("E · ROSE", sx(DOORS[r]), sy(2.1) - 7 - Math.max(16, S * 0.32) - (bg ? S * 0.34 : 0), 12, "center", C.ev, true);
          if (roseT > 0) { ctx.strokeStyle = C.ev; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(DOORS[r]), sy(roseH), rr + 8, -Math.PI / 2, -Math.PI / 2 + (roseT / 1.5) * Math.PI * 2); ctx.stroke(); }
        }
        if (glimpsed.has(r)) txt("◉", sx(DOORS[r]) + 0.62 * S, sy(1.6) + 4, 12, "left", C.blue, true);
      }
      if (DARK) for (const r in DOORS) { const x = sx(DOORS[r]); const gl = ctx.createRadialGradient(x, sy(roseH), 1, x, sy(roseH), 0.9 * S); gl.addColorStop(0, "rgba(246,207,134,.75)"); gl.addColorStop(1, "rgba(224,162,74,0)"); ctx.fillStyle = gl; ctx.fillRect(x - S, sy(roseH) - S, 2 * S, 2 * S); ctx.fillStyle = "rgba(224,162,74,.25)"; ctx.beginPath(); ctx.ellipse(x, gy - 2, 0.5 * S, 4, 0, 0, 7); ctx.fill(); }
      // the countdown over the target door
      if (tgt) {
        const x = sx(DOORS[tgt.room]), left_ = Math.max(0, MIN(tgt.door) - t);
        ctx.beginPath(); ctx.arc(x, sy(2.75), 15, 0, 7); ctx.fillStyle = PANEL; ctx.fill(); ctx.strokeStyle = C.ev; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, sy(2.75)); ctx.arc(x, sy(2.75), 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - left_ / 12)); ctx.closePath(); ctx.fillStyle = "rgba(163,48,42,.25)"; ctx.fill();
        txt(String(Math.ceil(left_)), x, sy(2.75) + 5, 13, "center", C.ev, true);
        // off-screen: an arrow at the edge
        if (x < 0 || x > W) { const ex = x < 0 ? 22 : W - 22; txt(x < 0 ? "◀ " + tgt.room.slice(1) : tgt.room.slice(1) + " ▶", ex, sy(1.6), 14, x < 0 ? "left" : "right", C.ev, true); }
      }
      // dimension chain along the floor
      const dy = gy + slab + 26;
      const marks = [0, 8, 16, 28, 36, 46, 56, 64];
      for (let i = 0; i < marks.length - 1; i++) dim(sx(marks[i]), sx(marks[i + 1]), dy, `${(marks[i + 1] - marks[i]) * 1000}`);
      dim(sx(BOARDS[0]), sx(BOARDS[1]), dy + 26, "LOOSE BOARDS 38–41");
      // Dora's trolley and her view
      if (trolley) { // the parked trolley: a box on wheels, in section
        const x = sx(trolley.x);
        ctx.fillStyle = PANEL; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4; ctx.fillRect(x - 0.45 * S, sy(1.05), 0.9 * S, 0.93 * S); ctx.strokeRect(x - 0.45 * S, sy(1.05), 0.9 * S, 0.93 * S);
        hatch(x - 0.45 * S, sy(1.05), 0.9 * S, 0.25 * S, 4, C.ink); L(x - 0.45 * S, sy(0.55), x + 0.45 * S, sy(0.55), 0.8);
        ctx.beginPath(); ctx.arc(x - 0.3 * S, sy(0.07), 0.07 * S, 0, 7); ctx.arc(x + 0.3 * S, sy(0.07), 0.07 * S, 0, 7); ctx.stroke();
        txt("TROLLEY · PUSH 0.6 m/s", x, sy(1.05) - 6, 11, "center", C.ev, true);
      }
      if (stage.stage) { if (LOSTP || DARK) { txt("OPEN", sx(CABINET), sy(2.45), 12, "center", C.ev, true); ctx.strokeStyle = C.ev; ctx.lineWidth = 1.4; ctx.strokeRect(sx(CABINET - 0.5), sy(2.3), S, 2.3 * S); L(sx(CABINET - 0.5), sy(2.3), sx(CABINET - 0.95), sy(2.15), 1.4, C.ev); L(sx(CABINET - 0.95), sy(2.15), sx(CABINET - 0.95), sy(0.1), 1.4, C.ev); L(sx(CABINET - 0.95), sy(0.1), sx(CABINET - 0.5), sy(0), 1.4, C.ev); } }
      if (mp != null) {
        const x = sx(mp), reach = sight();
        if (DARK) {
          const lis = listening(), ph = (game * SPM) % CYC();
          const gl = ctx.createRadialGradient(x - 0.4 * S, sy(1.3), 2, x - 0.4 * S, sy(1.3), 2.6 * S); gl.addColorStop(0, "rgba(246,207,134,.5)"); gl.addColorStop(1, "rgba(246,207,134,0)"); ctx.fillStyle = gl; ctx.fillRect(x - 3 * S, sy(3), 6 * S, 3.2 * S);
          ctx.strokeStyle = lis ? C.ev : C.faint; ctx.lineWidth = lis ? 2.5 : 1; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(sx(CABINET - 10), sy(-0.12)); ctx.lineTo(sx(CABINET + 10), sy(-0.12)); ctx.stroke(); ctx.setLineDash([]);
          for (const e of [CABINET - 10, CABINET + 10]) L(sx(e), sy(0.5), sx(e), sy(-0.2), lis ? 2.5 : 1, lis ? C.ev : C.faint);
          txt(lis ? "SHE LISTENS · BE STILL" : "SHE COUNTS · MOVE", sx(CABINET), sy(-0.12) + 16, 12, "center", lis ? C.ev : C.ink, true);
          txt(lis ? "…" : ["one", "one, two", "one, two, three", "one, two, three, four"][Math.min(3, Math.floor(ph / 0.9))], x, sy(2.75), 15, "center", lis ? C.ev : C.amberL, true);
        } else {
        ctx.fillStyle = "rgba(163,48,42,.12)"; ctx.beginPath(); ctx.moveTo(x - 0.4 * S, sy(1.6)); ctx.lineTo(x - reach * S, sy(2.4)); ctx.lineTo(x - reach * S, sy(0)); ctx.lineTo(x - 0.4 * S, sy(0)); ctx.fill();
        L(x - reach * S, sy(2.4), x - reach * S, sy(0), 1, C.ev, [4, 3]);
        txt(`DORA'S VIEW ${reach} m`, x - reach * S / 2, sy(2.4) - 6, 11, "center", C.ev);
        }
        const ds = A["sprite-dora-trolley"];
        if (ds) {
          // the sheet's trolley and figure, ground line at y = 296, Dora 1.65 m tall; the trolley's centre is hers to push
          const k = 1.65 * S / 214;
          ctx.drawImage(ds, 28, 50, 470, 252, x - (205 - 28) * k, gy - (296 - 50) * k, 470 * k, 252 * k);
          if (!DARK) txt("DORA →W", x + 0.3 * S, gy - 252 * k + 2, 12, "center", C.ev, true);
        } else {
        ctx.strokeStyle = C.ev; ctx.lineWidth = 1.4; ctx.strokeRect(x - 0.4 * S, sy(1.0), 1.1 * S, 0.9 * S);
        ctx.beginPath(); ctx.arc(x - 0.25 * S, sy(0.06), 0.06 * S + 2, 0, 7); ctx.arc(x + 0.55 * S, sy(0.06), 0.06 * S + 2, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 1.0 * S, sy(1.72), 0.12 * S, 0, 7); ctx.moveTo(x + 1.0 * S, sy(1.6)); ctx.lineTo(x + 1.0 * S, sy(0.8)); ctx.lineTo(x + 0.8 * S, sy(0)); ctx.moveTo(x + 1.0 * S, sy(0.8)); ctx.lineTo(x + 1.2 * S, sy(0)); ctx.moveTo(x + 1.0 * S, sy(1.4)); ctx.lineTo(x + 0.7 * S, sy(1.0)); ctx.stroke();
        txt("DORA →W", x + 0.3 * S, sy(1.0) - 6, 12, "center", C.ev, true);
        }
      }
      // the watcher
      const h = me.level ? LEDGE_H : me.hop > 0 ? 0.25 * Math.sin(Math.PI * (1 - me.hop / 0.35)) : 0;
      figure(me.x, h, me.crawl ? "crawl" : roseHeld && here ? "rose" : me.run && me.moving > 2 ? "run" : "walk");
      if (me.moving > 0.2) { const a = sx(me.x) + me.dir * S * 0.5, b = a + me.dir * S * 2; L(a, sy(1.25), b, sy(1.25), 0.8, C.ink, [5, 4]); txt(`${me.crawl ? "CRAWL 0.8" : me.run ? "RUN 4.0" : "WALK 1.6"} m/s`, (a + b) / 2, sy(1.25) - 6, 11, "center"); }
      // flourishes
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], k2 = Math.max(0, (now - f.t) / 900);
        if (k2 >= 1) { fx.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = 1 - k2;
        const X = sx(f.x);
        if (f.kind === "creak") { for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(X, gy, (RM ? 0.5 : k2) * S * 3 + j * 10, Math.PI, 0); ctx.strokeStyle = C.ev; ctx.lineWidth = 1.5; ctx.stroke(); } txt("CREAK", X, gy - S * 1.2, 16, "center", C.ev, true); }
        else if (f.kind === "seen") { txt("SEEN", X, sy(2.2) - (RM ? 0 : k2 * 20), 16, "center", C.ev, true); }
        else if (f.kind === "ok") { ctx.strokeStyle = C.ev; ctx.lineWidth = 3; ctx.strokeRect(X - 0.6 * S, sy(2.3), 1.2 * S, 2.3 * S); txt("✓", X, sy(2.4), 22, "center", C.ev, true); }
        else if (f.kind === "miss") { txt("✕", X, sy(2.4), 22, "center", C.ink, true); }
        ctx.restore();
      }
      if (coin) { // the set-piece: the seventh coin, in your own door
        const k2 = Math.min(1, (now - coin) / (RM ? 1 : 1200)), cw = Math.min(W - 32, 520), chh = cw * 0.75, x0 = (W - cw) / 2, y0 = Math.max(70, gy - 3.3 * S - 10);
        ctx.save(); ctx.globalAlpha = k2; ctx.fillStyle = "#050505"; ctx.fillRect(0, 56, W, H);
        for (let i = 0; i < 7; i++) { const cxx = x0 + cw * (0.96 - i * 0.135), rr2 = 5 + i * 1.6; if (i < 6) { ctx.fillStyle = C.amberL; ctx.globalAlpha = k2 * (0.9 - i * 0.08); ctx.beginPath(); ctx.arc(cxx, y0 - 16, rr2, 0, 7); ctx.fill(); } }
        ctx.globalAlpha = k2;
        if (A["sprite-seventh-coin"]) ctx.drawImage(A["sprite-seventh-coin"], x0, y0, cw, chh); else { ctx.fillStyle = C.amberL; ctx.beginPath(); ctx.arc(W / 2, y0 + chh * 0.4, 16, 0, 7); ctx.fill(); }
        txt("SEVEN.", W / 2, y0 + chh + 26, 20, "center", C.amberL, true); txt("The last coin is in your own door.", W / 2, y0 + chh + 48, 14, "center", C.ink);
        ctx.restore();
      }
      if (bellFlash && now - bellFlash.t < 2600) {
        const n = +bellFlash.room.slice(3);
        const bs = A["ui-bell-strip"];
        if (bs && !DARK) {
          // the office bell board: six pulls and a bare seventh; the ringing pull swings
          const bw = Math.min(300, W - 24), bh = bw * 150 / 480, bx = W / 2 - bw / 2, byy = ky + 96, kk = (now - bellFlash.t) / 2600;
          ctx.save(); ctx.globalAlpha = kk > 0.8 ? (1 - kk) * 5 : 1; ctx.drawImage(bs, bx, byy, bw, bh);
          const px = bx + bw * (0.115 + (n - 1) * 0.128);
          ctx.strokeStyle = C.amberL; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(px, byy + bh * 0.42, 13 + (RM ? 0 : 4 * Math.abs(Math.sin(now / 90))), 0, 7); ctx.stroke(); ctx.restore();
        }
        txt(DARK ? "THE KNOCK IS DUE AT 406 · 2:14" : `BELL · ${bellFlash.room.slice(1)}`, W / 2, ky + 74, 18, "center", C.ev, true);
        for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(W / 2 - (n - 1) * 10 + i * 20, ky + 88, 6, 0, 7); ctx.fillStyle = (now - bellFlash.t) / 300 > i ? C.ev : "transparent"; ctx.fill(); ctx.strokeStyle = C.ev; ctx.lineWidth = 1.2; ctx.stroke(); }
      }
    }

    let raf = 0, last = performance.now();
    const loop = (now) => { const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; step(dt); render(now); raf = requestAnimationFrame(loop); };

    // ---- input
    const up = () => { if (!unlocked.has("up")) return; if (me.level === 0 && me.x >= LEDGE[0] && me.x <= LEDGE[1] && me.hop === 0) { me.level = 1; note("UP ONTO THE PIPE RUN"); } else if (me.level === 0) note("NO PIPE RUN HERE: IT RUNS 16–38 m"); };
    const down = () => { if (me.level === 1) { me.level = 0; return true; } return false; };
    const hop = () => { if (!unlocked.has("hop")) return; if (me.hop === 0 && !me.crawl) { me.hop = 0.35; } };
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { left = true; e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { right = true; e.preventDefault(); }
      else if (k === "Shift") runHeld = true;
      else if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); up(); }
      else if (k === "ArrowDown" || k === "s" || k === "S" || k === "c" || k === "C") { e.preventDefault(); if (!e.repeat && !down()) downHeld = true; }
      else if (k === " ") { e.preventDefault(); hop(); }
      else if ((k === "e" || k === "E") && unlocked.has("rose")) roseHeld = true;
      else if ((k === "t" || k === "T") && !e.repeat) tug();
    });
    on(window, "keyup", (e) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") left = false;
      if (k === "ArrowRight" || k === "d" || k === "D") right = false;
      if (k === "Shift") runHeld = false;
      if (k === "ArrowDown" || k === "s" || k === "S" || k === "c" || k === "C") downHeld = false;
      if (k === "e" || k === "E") roseHeld = false;
    });
    pad.querySelectorAll("button").forEach((b) => {
      const a = b.dataset.a;
      on(b, "pointerdown", (e) => {
        e.preventDefault(); if (!started || over) return;
        if (a === "left") { left = true; b.classList.add("on"); }
        if (a === "right") { right = true; b.classList.add("on"); }
        if (a === "rose") { roseHeld = true; b.classList.add("on"); }
        if (a === "run") { runToggle = !runToggle; if (runToggle) crawlToggle = false; }
        if (a === "crawl") { crawlToggle = !crawlToggle; if (crawlToggle) runToggle = false; }
        if (a === "up") up();
        if (a === "down") down();
        if (a === "hop") hop();
        if (a === "wire") tug();
        btn("run").classList.toggle("on", runToggle);
        btn("crawl").classList.toggle("on", crawlToggle);
      });
      const rel = () => { if (a === "left") { left = false; b.classList.remove("on"); } if (a === "right") { right = false; b.classList.remove("on"); } if (a === "rose") { roseHeld = false; b.classList.remove("on"); } };
      on(b, "pointerup", rel); on(b, "pointerleave", rel); on(b, "pointercancel", rel);
    });
    on(window, "blur", () => { left = right = runHeld = downHeld = roseHeld = false; });

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap); ro.observe(pad); ro.observe(block);
    paintBlock();
    resize();
    camX = 0;

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}sheet">
      ${art.has("chapter-n" + RUN.night) ? `<img alt="Night ${RUN.night}" src="${art.url("chapter-n" + RUN.night)}" style="display:block;width:100%;height:92px;object-fit:cover;object-position:0 0;border-bottom:1.4px solid ${C.ink}">` : ""}
      <div class="hd"><span>SECTION B-B · SERVICE PASSAGE 4F</span><span>${RUN.sheet}</span></div>
      <h2>CORRIDOR RACE</h2>
      <p class="goal">${RUN.goal}</p>
      <p class="open"></p>
      <table>
        <tr><td>MOVE</td><td><kbd>←</kbd><kbd>→</kbd> or ◀ ▶ · walk 1.6 m/s</td></tr>
        <tr><td>RUN</td><td>hold <kbd>Shift</kbd> or RUN · 4.0 m/s, but the boards creak</td></tr>
        ${DARK ? "<tr><td>DORA</td><td>counts aloud, then listens. Within 10 m of her, move only on the count.</td></tr>" : stage.stage ? "<tr><td>CRAWL</td><td>hold <kbd>↓</kbd> or CRAWL · under the light-well windows</td></tr>" : "<tr><td>HOP</td><td><kbd>Space</kbd> clears one board at a run</td></tr>"}
      </table>
      <div class="ft">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> Dora half-blind (4 m)</label>` : `<span>More tools are drawn in as you reach them.</span>`}<button type="button" class="${P}b">${RUN.go}</button></div></div>`;
    intro.querySelector(".open").textContent = RUN.open;
    intro.querySelector("table").after(stage.row(P + "b"));
    wrap.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); });
    const sb = [...intro.querySelectorAll("button")].pop();
    on(sb, "click", () => { intro.remove(); started = true; last = performance.now(); resize(); });
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
}, { vii: "right:12px;bottom:10px" });

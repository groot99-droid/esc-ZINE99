// Behind the Peephole / Corridor race (2D, scroll). Style: architect's technical section: the
// passage as a dimensioned long section, technical pen on cream, dry-transfer lettering.
// One stretch of night two (`n2_shift_race`, DESIGN.md section 10): 01:00 to 02:15, the returns of
// 401, 405 and 406 (games/behind-the-peephole/data/beats.json), the loose boards, the light-well
// windows, the pipe run and Dora's trolley. Be at each door when it opens. Cut: no push-in to the
// lens (arriving in time is the threshold beat); the stranger and the blackout belong to other nights.

const LEN = 64;
const DOORS = { r401: 8, r402: 16, r403: 28, r404: 36, r405: 46, r406: 56 };
const RETURNS = [
  { room: "r401", bell: "01:15", door: "01:27" },
  { room: "r405", bell: "01:45", door: "01:57" },
  { room: "r406", bell: "02:00", door: "02:12" },
];
const IN_AT_START = ["r404", "r402"];
const WINDOWS = [18, 26], BOARDS = [38, 41], LEDGE = [15, 37], LEDGE_H = 0.6;
const ALCOVES = [12, 50];
const MIN = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
const START = MIN("01:00"), END = MIN("02:15");
const SPM = 1.5; // real seconds per game minute (40x)

export default {
  mount(root, api) {
    const P = "behind-the-peephole-corridor-race-";
    const C = { paper: "#efe6cf", ink: "#1c1a17", faint: "#8a8068", ev: "#a3302a", amber: "#e0a24a", amberL: "#f6cf86", brass: "#b8913f", river: "#6f7c80", bottle: "#1f3d2c" };
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;touch-action:none;user-select:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:${C.ink}}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}pad{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:0 10px}
    .${P}b{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.08em;background:#fbf6e8;color:${C.ink};border:1.4px solid ${C.ink};min-width:50px;min-height:44px;padding:4px 10px;cursor:pointer;touch-action:none}
    .${P}b.on{background:${C.ink};color:${C.paper}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,230,207,.93);z-index:3;padding:16px}
    .${P}intro div{max-width:540px;border:1.5px solid ${C.ink};padding:18px 20px;background:#fbf6e8;font-size:13.5px;line-height:1.55}
    .${P}intro h2{margin:0 0 8px;font-size:18px;letter-spacing:.14em}
    .${P}intro kbd{border:1px solid ${C.faint};padding:0 4px}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div"); wrap.className = P + "wrap"; root.appendChild(wrap);
    const cv = document.createElement("canvas"); wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const pad = document.createElement("div"); pad.className = P + "pad";
    pad.innerHTML = ["◀:left", "▶:right", "RUN:run", "CRAWL:crawl", "▲ UP:up", "▼ DOWN:down", "HOP:hop"].map((s) => { const [l, a] = s.split(":"); return `<button type="button" class="${P}b" data-a="${a}">${l}</button>`; }).join("");
    wrap.appendChild(pad);

    // ---- state
    let game = 0, started = false, over = false;
    const me = { x: 1, level: 0, dir: 1, hop: 0, hopFrom: 0, crawl: false, run: false, phase: 0, moving: 0 };
    const susp = { r401: 0, r402: 0, r403: 0, r404: 0, r405: 0, r406: 0 };
    const blind = new Set();
    const caught = new Set(), missed = new Set();
    let seenByStaff = 0, maidSeeing = false, rungBells = new Set(), bellFlash = null;
    const creaked = new Set(); let lastBoard = -1;
    const notes = []; // recent events, shown in the title block
    let left = false, right = false, runHeld = false, runToggle = false, crawlToggle = false, downHeld = false;
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const note = (s) => { notes.unshift({ s, t: performance.now() }); notes.length = Math.min(notes.length, 3); };

    const T = () => START + game;
    const occupied = (r, t) => IN_AT_START.includes(r) || RETURNS.some((x) => x.room === r && t >= MIN(x.door));
    const atWindow = (r, t) => occupied(r, t) && ((Math.floor(t) + { r401: 1, r402: 3, r403: 5, r404: 7, r405: 9, r406: 4 }[r]) % 10) === 0;
    const maidPos = (t) => (t >= MIN("01:00") && t < MIN("01:30") ? 64 - 0.9 * (t - MIN("01:00")) * SPM : null);
    const inAlcove = () => me.level === 0 && ALCOVES.some((a) => Math.abs(me.x - a) < 0.7);

    function step(dt) {
      if (!started || over) return;
      game += dt / SPM;
      const t = T();
      if (t >= END) { finish(); return; }
      // bells
      for (const r of RETURNS) {
        if (!rungBells.has(r.room) && t >= MIN(r.bell)) { rungBells.add(r.room); bellFlash = { room: r.room, t: performance.now() }; note(`BELL · ${r.room.slice(1)} · ${"●".repeat(+r.room.slice(3))}  door opens ${r.door}`); }
        if (!caught.has(r.room) && !missed.has(r.room) && t >= MIN(r.door)) {
          if (Math.abs(me.x - DOORS[r.room]) < 1.2 && me.level === 0 && !blind.has(r.room)) { caught.add(r.room); note(`${r.room.slice(1)}: AT THE ROSE AS THE DOOR OPENS · THRESHOLD CAUGHT`); }
          else { missed.add(r.room); note(`${r.room.slice(1)}: THE DOOR OPENED WITHOUT YOU`); }
        }
      }
      // movement
      const run = runHeld || runToggle;
      const crawl = me.level === 0 && (crawlToggle || downHeld);
      me.crawl = crawl; me.run = run && !crawl;
      const sp = crawl ? 0.8 : me.run ? 4.0 : 1.6;
      let vx = 0;
      if (me.hop > 0) {
        me.hop -= dt;
        vx = me.dir * 1.2 / 0.35;
        if (me.hop <= 0) me.hop = 0;
      } else {
        if (left && !right) { vx = -sp; me.dir = -1; } else if (right && !left) { vx = sp; me.dir = 1; }
      }
      let nx = me.x + vx * dt;
      // the trolley blocks the floor
      const mp = maidPos(t);
      if (mp != null && me.level === 0 && me.hop === 0) {
        if (me.x <= mp - 1 && nx > mp - 1) nx = mp - 1;
        if (me.x >= mp + 0.8 && nx < mp + 0.8) nx = mp + 0.8;
      }
      nx = Math.max(0.4, Math.min(LEN - 0.4, nx));
      me.moving = Math.abs(nx - me.x) / Math.max(dt, 1e-3);
      me.x = nx;
      me.phase += me.moving * dt * 3;
      if (me.level === 1 && (me.x < LEDGE[0] || me.x > LEDGE[1])) { me.level = 0; note("OFF THE END OF THE PIPE RUN"); }
      // the boards: running over one creaks
      const bi = me.x >= BOARDS[0] && me.x < BOARDS[1] ? Math.floor(me.x - BOARDS[0]) : -1;
      if (bi !== lastBoard) {
        if (bi >= 0 && me.level === 0 && me.hop === 0 && me.run && me.moving > 2) {
          note("CREAK · +25 TO EVERY OCCUPIED ROOM WITHIN 12 m");
          for (const r in DOORS) if (occupied(r, t) && Math.abs(DOORS[r] - me.x) <= 12) bump(r, 25);
        }
        lastBoard = bi;
      }
      // the light-well windows: upright on the floor is seen by a guest at their bathroom window
      if (me.level === 0 && !me.crawl && me.x >= WINDOWS[0] && me.x <= WINDOWS[1]) {
        for (const r in DOORS) if (atWindow(r, t) && !creaked.has(r + Math.floor(t))) { creaked.add(r + Math.floor(t)); bump(r, 30); note(`SEEN ACROSS THE LIGHT WELL BY ${r.slice(1)} · +30`); }
      }
      // the maid: 6 m, same level, facing west, not in an alcove
      const sees = mp != null && me.level === 0 && !inAlcove() && me.x < mp && mp - me.x <= 6;
      if (sees && !maidSeeing) { seenByStaff++; note(`DORA SEES YOU · SEEN BY STAFF ${seenByStaff}`); }
      maidSeeing = sees;
      // suspicion falls when nothing happens
      for (const r in susp) susp[r] = Math.max(0, susp[r] - dt);
    }
    function bump(r, v) {
      susp[r] = Math.min(100, susp[r] + v);
      if (susp[r] >= 70 && !blind.has(r)) { blind.add(r); note(`${r.slice(1)} COVERS THE ROSE FOR THE NIGHT`); }
    }
    function finish() {
      if (over) return;
      over = true;
      const n = caught.size;
      const lose = seenByStaff >= 2 || n <= 1;
      const outcome = lose ? "lose" : n === 3 && blind.size === 0 ? "win" : "done";
      let text = `Thresholds caught: ${n} of 3 (${RETURNS.map((r) => r.room.slice(1) + (caught.has(r.room) ? " ●" : " ○")).join(", ")}). Seen by staff: ${seenByStaff}.`;
      if (blind.size) text += ` Roses covered: ${[...blind].map((r) => r.slice(1)).join(", ")}.`;
      if (seenByStaff >= 2) text += " Wren's next call keeps you on the line: tomorrow's shift starts at 23:15.";
      else if (outcome === "win") text += " Every door, on time, and nobody felt the passage.";
      api.store.set("best", Math.max(api.store.get("best", 0), n));
      timers.push(setTimeout(() => api.end({ outcome, text }), 500));
    }

    // ---- drawing
    let W = 0, H = 0, S = 40, view = 14, camX = 0, gy = 0;
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(W < 640 ? W / 10 : W / 14, (H - 250) / 4.2);
      S = Math.max(14, S);
      view = W / S;
      gy = 96 + 3.6 * S; // floor line, screen y
    }
    const L = (x1, y1, x2, y2, w = 1, c = C.ink, dash) => { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
    function hatch(x, y, w, h, gap = 6, c = C.faint) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      for (let k = -h; k < w; k += gap) L(x + k, y + h, x + k + h, y, 0.6, c);
      ctx.restore();
    }
    const txt = (s, x, y, size = 11, align = "left", c = C.ink, bold = false) => { ctx.font = `${bold ? 600 : 400} ${size}px 'IBM Plex Mono',monospace`; ctx.fillStyle = c; ctx.textAlign = align; ctx.fillText(s, x, y); ctx.textAlign = "left"; };
    function dim(x1, x2, y, label) {
      L(x1, y, x2, y, 0.8);
      for (const x of [x1, x2]) { L(x - 4, y + 4, x + 4, y - 4, 1.4); L(x, y - 8, x, y + 8, 0.5, C.faint); }
      txt(label, (x1 + x2) / 2, y - 4, 10, "center");
    }
    const sx = (m) => (m - camX) * S;
    const sy = (h) => gy - h * S;

    function figure(x, h, pose) {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.2; ctx.lineCap = "round";
      const X = sx(x), Y = sy(h), k = S / 40;
      const sw = Math.sin(me.phase * 2) * (me.moving > 0.1 ? 1 : 0);
      ctx.beginPath();
      if (pose === "crawl") {
        ctx.arc(X + me.dir * 22 * k, Y - 16 * k, 5 * k, 0, 7);
        ctx.moveTo(X - me.dir * 16 * k, Y - 14 * k); ctx.lineTo(X + me.dir * 16 * k, Y - 15 * k);
        ctx.moveTo(X - me.dir * 16 * k, Y - 14 * k); ctx.lineTo(X - me.dir * (20 + sw * 4) * k, Y);
        ctx.moveTo(X + me.dir * 12 * k, Y - 15 * k); ctx.lineTo(X + me.dir * (14 - sw * 4) * k, Y);
      } else {
        const lean = pose === "run" ? me.dir * 8 * k : 0, hh = 70 * k;
        ctx.arc(X + lean, Y - hh, 6 * k, 0, 7);
        ctx.moveTo(X + lean * 0.8, Y - hh + 7 * k); ctx.lineTo(X, Y - 30 * k);
        ctx.moveTo(X, Y - 30 * k); ctx.lineTo(X + sw * 12 * k, Y);
        ctx.moveTo(X, Y - 30 * k); ctx.lineTo(X - sw * 12 * k, Y);
        ctx.moveTo(X + lean * 0.6, Y - 52 * k); ctx.lineTo(X + lean * 0.6 - sw * 14 * k, Y - 36 * k);
        ctx.moveTo(X + lean * 0.6, Y - 52 * k); ctx.lineTo(X + lean * 0.6 + sw * 14 * k, Y - 36 * k);
      }
      ctx.stroke(); ctx.lineCap = "butt";
      if (pose !== "crawl") { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(X + (pose === "run" ? me.dir * 8 * k : 0), Y - 70 * k, 6 * k, 0, 7); ctx.fill(); }
      txt("YOU", X, Y + 14, 9, "center", C.ink, true);
    }

    function render(now) {
      const t = T();
      const lead = me.moving > 0.2 ? me.dir * 2 : 0;
      const target = me.x + lead - view / 2;
      camX += (Math.max(-0.5, Math.min(LEN + 0.5 - view, target)) - camX) * 0.08;
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(6, 6, W - 12, H - 12);

      // key plan, 1:400
      const kx = 20, kw = W - 40, ky = 22, km = (m) => kx + kw * m / LEN;
      txt("KEY PLAN 1:400", kx, ky, 10);
      ctx.strokeRect(kx, ky + 8, kw, 14);
      hatch(km(BOARDS[0]), ky + 8, km(BOARDS[1]) - km(BOARDS[0]), 14, 3, C.ink);
      ctx.fillStyle = "rgba(111,124,128,.25)"; ctx.fillRect(km(WINDOWS[0]), ky + 8, km(WINDOWS[1]) - km(WINDOWS[0]), 14);
      for (const r in DOORS) { L(km(DOORS[r]), ky + 8, km(DOORS[r]), ky + 26, 0.8); txt(r.slice(1), km(DOORS[r]), ky + 36, 9, "center"); }
      txt("OFFICE", kx, ky + 36, 9); txt("STAIR", kx + kw, ky + 36, 9, "right");
      ctx.strokeStyle = C.ev; ctx.setLineDash([4, 3]); ctx.strokeRect(km(camX), ky + 4, km(camX + view) - km(camX), 22); ctx.setLineDash([]);
      txt("VIEW", km(camX + view / 2), ky + 2, 9, "center", C.ev);
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(km(me.x), ky + 15, 3.5, 0, 7); ctx.fill();
      const mp = maidPos(t);
      if (mp != null) { ctx.fillStyle = C.ev; ctx.fillRect(km(mp) - 3, ky + 11, 6, 8); }

      // the section
      const ceil = sy(3.0), slab = 0.3 * S;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.strokeRect(sx(0), ceil - slab, LEN * S, slab); hatch(sx(0), ceil - slab, LEN * S, slab, 7);
      ctx.strokeRect(sx(0), gy, LEN * S, slab); hatch(sx(0), gy, LEN * S, slab, 7);
      txt("+3.00 SOFFIT", Math.min(W - 16, sx(LEN)) - 4, ceil - slab - 4, 9, "right");
      txt("±0.00 FFL", 14, gy - 4, 9);
      // end walls: office and stair
      ctx.fillStyle = C.paper;
      hatch(sx(-1), ceil - slab, S, gy + slab - ceil + slab, 4, C.ink); txt("OFFICE", sx(0) + 6, ceil + 16, 10);
      hatch(sx(LEN), ceil - slab, S, gy + slab - ceil + slab, 4, C.ink); txt("STAIR", sx(LEN) - 6, ceil + 16, 10, "right");
      // dado rail
      L(sx(0), sy(1.0), sx(LEN), sy(1.0), 0.6, C.faint); txt("+1.00 DADO", Math.max(14, sx(0) + 4), sy(1.0) - 3, 8, "left", C.faint);
      // light-well windows and who stands at a bathroom window across the well
      ctx.fillStyle = "rgba(111,124,128,.18)"; ctx.fillRect(sx(WINDOWS[0]), sy(2.6), (WINDOWS[1] - WINDOWS[0]) * S, 1.0 * S);
      ctx.strokeRect(sx(WINDOWS[0]), sy(2.6), (WINDOWS[1] - WINDOWS[0]) * S, 1.0 * S);
      for (let m = WINDOWS[0]; m <= WINDOWS[1]; m += 2) L(sx(m), sy(2.6), sx(m), sy(1.6), 0.8);
      txt("LIGHT WELL 18–26 m", sx((WINDOWS[0] + WINDOWS[1]) / 2), sy(2.6) - 5, 9, "center");
      const lit = Object.keys(DOORS).filter((r) => atWindow(r, t));
      lit.forEach((r, i) => { const x = sx(WINDOWS[0] + 1 + i * 2.6); ctx.fillStyle = C.amber; ctx.fillRect(x, sy(2.45), 0.7 * S, 0.5 * S); txt(r.slice(1), x + 0.35 * S, sy(1.75), 9, "center"); });
      // pipe run ledge
      L(sx(LEDGE[0]), sy(LEDGE_H), sx(LEDGE[1]), sy(LEDGE_H), 2.2);
      L(sx(LEDGE[0]), sy(0.42), sx(LEDGE[1]), sy(0.42), 0.8); L(sx(LEDGE[0]), sy(0.3), sx(LEDGE[1]), sy(0.3), 0.8);
      txt("PIPE RUN +0.60", sx(LEDGE[0]) + 4, sy(LEDGE_H) - 4, 9);
      // loose boards
      hatch(sx(BOARDS[0]), gy - 4, (BOARDS[1] - BOARDS[0]) * S, 8, 3, C.ink);
      for (let b = BOARDS[0]; b <= BOARDS[1]; b++) L(sx(b), gy - 6, sx(b), gy + 4, 1);
      // alcoves
      for (const a of ALCOVES) { ctx.setLineDash([3, 3]); ctx.strokeStyle = C.ink; ctx.strokeRect(sx(a - 0.7), sy(2.2), 1.4 * S, 2.2 * S); ctx.setLineDash([]); txt("ALCOVE", sx(a), sy(2.2) - 4, 8, "center"); }
      // doors with their roses
      const tgt = RETURNS.find((r) => rungBells.has(r.room) && !caught.has(r.room) && !missed.has(r.room));
      for (const r in DOORS) {
        const x = sx(DOORS[r] - 0.45);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(x, sy(2.1), 0.9 * S, 2.1 * S);
        ctx.strokeRect(x + 0.1 * S, sy(2.0), 0.7 * S, 0.8 * S); ctx.strokeRect(x + 0.1 * S, sy(1.0), 0.7 * S, 0.9 * S);
        txt(r.slice(1), sx(DOORS[r]), sy(2.1) - 6, Math.max(10, S * 0.28), "center", C.ink, true);
        const occ = occupied(r, t), isT = tgt && tgt.room === r;
        const rr = Math.max(4, S * 0.09);
        ctx.beginPath(); ctx.arc(sx(DOORS[r]), sy(1.6), rr, 0, 7);
        ctx.fillStyle = blind.has(r) ? C.ink : isT ? C.amberL : occ ? C.amber : C.paper; ctx.fill(); ctx.strokeStyle = C.ink; ctx.stroke();
        if (isT && !api.reducedMotion) { ctx.beginPath(); ctx.arc(sx(DOORS[r]), sy(1.6), rr + 4 + 4 * Math.abs(Math.sin(now / 220)), 0, 7); ctx.strokeStyle = C.amber; ctx.stroke(); }
        // unease, as a pencilled gauge on the door
        if (occ) { ctx.strokeStyle = C.faint; ctx.strokeRect(x + 0.1 * S, sy(0.25), 0.7 * S, 5); ctx.fillStyle = susp[r] >= 40 ? C.ev : C.faint; ctx.fillRect(x + 0.1 * S, sy(0.25), 0.7 * S * susp[r] / 100, 5); }
      }
      // dimension chain along the floor
      const dy = gy + slab + 18;
      const marks = [0, 8, 16, 28, 36, 46, 56, 64];
      for (let i = 0; i < marks.length - 1; i++) dim(sx(marks[i]), sx(marks[i + 1]), dy, `${(marks[i + 1] - marks[i]) * 1000}`);
      dim(sx(BOARDS[0]), sx(BOARDS[1]), dy + 24, "LOOSE BOARDS 38–41 m");
      // Dora's trolley
      if (mp != null) {
        const x = sx(mp);
        ctx.strokeStyle = C.ev; ctx.lineWidth = 1.4; ctx.strokeRect(x - 0.4 * S, sy(1.0), 1.1 * S, 0.9 * S);
        ctx.beginPath(); ctx.arc(x - 0.25 * S, sy(0.06), 0.06 * S + 2, 0, 7); ctx.arc(x + 0.55 * S, sy(0.06), 0.06 * S + 2, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 1.0 * S, sy(1.72), 0.12 * S, 0, 7); ctx.moveTo(x + 1.0 * S, sy(1.6)); ctx.lineTo(x + 1.0 * S, sy(0.8)); ctx.lineTo(x + 0.8 * S, sy(0)); ctx.moveTo(x + 1.0 * S, sy(0.8)); ctx.lineTo(x + 1.2 * S, sy(0)); ctx.moveTo(x + 1.0 * S, sy(1.4)); ctx.lineTo(x + 0.7 * S, sy(1.0)); ctx.stroke();
        ctx.fillStyle = "rgba(163,48,42,.08)"; ctx.beginPath(); ctx.moveTo(x - 0.4 * S, sy(1.6)); ctx.lineTo(x - 6.4 * S, sy(2.4)); ctx.lineTo(x - 6.4 * S, sy(0)); ctx.lineTo(x - 0.4 * S, sy(0)); ctx.fill();
        txt("DORA · 0.9 m/s →W", x, sy(1.0) - 6, 9, "center", C.ev);
      }
      // the watcher
      const h = me.level ? LEDGE_H : me.hop > 0 ? 0.25 * Math.sin(Math.PI * (1 - me.hop / 0.35)) : 0;
      figure(me.x, h, me.crawl ? "crawl" : me.run && me.moving > 2 ? "run" : "walk");
      if (me.moving > 0.2) { const a = sx(me.x) + me.dir * S * 0.5, b = a + me.dir * S * 2; L(a, sy(1.2), b, sy(1.2), 0.8, C.ink, [5, 4]); txt(`${me.crawl ? "CRAWL 0.8" : me.run ? "RUN 4.0" : "WALK 1.6"} m/s`, (a + b) / 2, sy(1.2) - 5, 9, "center"); }
      // A marker above the target door
      if (tgt) { const x = sx(DOORS[tgt.room]); ctx.beginPath(); ctx.arc(x, sy(2.75), 11, 0, 7); ctx.strokeStyle = C.ev; ctx.lineWidth = 1.2; ctx.stroke(); txt("A", x, sy(2.75) + 4, 11, "center", C.ev, true); }

      // title block
      const narrow = W < 640;
      const by = narrow ? dy + 44 : Math.max(dy + 40, H - 120), bh = narrow ? 76 : 52;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(14, by, W - 28, bh);
      const split = narrow ? W - 14 : Math.max(W * 0.62, W - 300);
      const hh = Math.floor(t / 60) % 24, mm = Math.floor(t % 60);
      const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      if (narrow) {
        L(14, by + 24, W - 14, by + 24, 1);
        txt(`B-B · ${clock} · CAUGHT ${caught.size}/3 · STAFF ${seenByStaff}/2`, 22, by + 16, 10, "left", C.ink, true);
      } else {
        L(split, by, split, by + bh, 1);
        txt(`SECTION B-B · SERVICE PASSAGE 4F · ${clock}`, split + 8, by + 18, 11, "left", C.ink, true);
        txt(`SEEN BY STAFF ${seenByStaff}/2 · CAUGHT ${caught.size}/3`, split + 8, by + 36, 10);
      }
      const ns = notes.length ? notes : [{ s: "BE AT EACH DOOR WHEN IT OPENS. WALK THE BOARDS." }];
      const ny = narrow ? by + 42 : by + 18;
      ns.slice(0, 2).forEach((n, i) => { ctx.save(); ctx.beginPath(); ctx.rect(16, by, split - 20, bh); ctx.clip(); txt(n.s, 22, ny + i * 18, narrow ? 8.5 : 10.5, "left", i === 0 && notes.length ? C.ev : C.ink); ctx.restore(); });
      if (bellFlash && now - bellFlash.t < 2600) {
        const n = +bellFlash.room.slice(3);
        txt(`BELL ${bellFlash.room.slice(1)}`, W / 2, 80, 16, "center", C.ev, true);
        for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(W / 2 - (n - 1) * 9 + i * 18, 92, 5, 0, 7); ctx.fillStyle = (now - bellFlash.t) / 300 > i ? C.ev : "transparent"; ctx.fill(); ctx.strokeStyle = C.ev; ctx.stroke(); }
      }
    }

    let raf = 0, last = performance.now();
    const loop = (now) => { const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; step(dt); render(now); raf = requestAnimationFrame(loop); };

    // ---- input
    const up = () => { if (me.level === 0 && me.x >= LEDGE[0] && me.x <= LEDGE[1] && me.hop === 0) { me.level = 1; note("UP ONTO THE PIPE RUN"); } };
    const down = () => { if (me.level === 1) { me.level = 0; return true; } return false; };
    const hop = () => { if (me.hop === 0 && !me.crawl) { me.hop = 0.35; } };
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { left = true; e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { right = true; e.preventDefault(); }
      else if (k === "Shift") runHeld = true;
      else if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); up(); }
      else if (k === "ArrowDown" || k === "s" || k === "S" || k === "c" || k === "C") { e.preventDefault(); if (!e.repeat && !down()) downHeld = true; }
      else if (k === " ") { e.preventDefault(); hop(); }
    });
    on(window, "keyup", (e) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") left = false;
      if (k === "ArrowRight" || k === "d" || k === "D") right = false;
      if (k === "Shift") runHeld = false;
      if (k === "ArrowDown" || k === "s" || k === "S" || k === "c" || k === "C") downHeld = false;
    });
    pad.querySelectorAll("button").forEach((b) => {
      const a = b.dataset.a;
      on(b, "pointerdown", (e) => {
        e.preventDefault(); if (!started || over) return;
        if (a === "left") { left = true; b.classList.add("on"); }
        if (a === "right") { right = true; b.classList.add("on"); }
        if (a === "run") { runToggle = !runToggle; if (runToggle) crawlToggle = false; }
        if (a === "crawl") { crawlToggle = !crawlToggle; if (crawlToggle) runToggle = false; }
        if (a === "up") up();
        if (a === "down") down();
        if (a === "hop") hop();
        pad.querySelector('[data-a="run"]').classList.toggle("on", runToggle);
        pad.querySelector('[data-a="crawl"]').classList.toggle("on", crawlToggle);
      });
      const rel = () => { if (a === "left") { left = false; b.classList.remove("on"); } if (a === "right") { right = false; b.classList.remove("on"); } };
      on(b, "pointerup", rel); on(b, "pointerleave", rel); on(b, "pointercancel", rel);
    });
    on(window, "blur", () => { left = right = runHeld = downHeld = false; });

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    resize();
    camX = 0;

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>CORRIDOR RACE · NIGHT 2 · 01:00</h2>
      <p>The bell rings a room's number; that door opens twelve minutes later. Be standing at it when it opens. Tonight: 401, 405 and 406.</p>
      <p>Running over the loose boards (38–41 m) creaks: walk, crawl or hop them. Upright under the light well, a guest at a bathroom window sees you: crawl, or take the pipe run. Keep 6 m from Dora's trolley, or wait in an alcove. Seen twice and Wren hears of it.</p>
      <p><kbd>←</kbd><kbd>→</kbd> move · hold <kbd>Shift</kbd> run · hold <kbd>↓</kbd> crawl · <kbd>↑</kbd> pipe run · <kbd>Space</kbd> hop</p>
      <button type="button" class="${P}b">START</button></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); started = true; last = performance.now(); });
    raf = requestAnimationFrame(loop);
    sb.focus();

    return {
      unmount() {
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
  },
};

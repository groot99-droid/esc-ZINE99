// The Stuffed Ones: Labyrinth from above (2D, scroll), drawn as a woven tapestry.
//
// DESIGN.md section 10 "Mode B": the labyrinth from directly above, its walls woven like
// wallpaper seen edge-on, carpet corridors a darker weave, the floor reddening toward the centre.
// You move one of the pack at a time (your cat, or Lila through the pulse) and herd three guests
// inward. Rules kept: a guest flees from any toy they see moving within 5 m, at 1.2 times a toy's
// speed, by the most open corridor; a toy within 1 m makes a guest freeze for 8 s ("we didn't
// pounce"), and three freezes cost one memory; loop doors set a guest back to its ring's start;
// a guest looped back twice, or frozen 20 s in all, restarts from its ring's entrance. Twitch moves
// nothing but is seen. Cut to fit: one maze holding the outer ring (one loop door) and the inner
// ring (two loop doors and rooms of broken toys that block sight); restarts apply to the guest
// alone; a dawn limit and running out of memories are the ways to lose.
const PRE = "stuffed-ones-labyrinth-";
const C = { moss: "#7d8a5a", mossD: "#56623d", rust: "#a5553a", cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", cream: "#efe5cf",
  bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", sky: "#8fa9bf", night: "#56627a", nightL: "#7f8ca3", ink: "#2a211b" };
const N = 15;
// Map legend: '#' wall, '.' carpet, 'L' loop door, 'x' broken toys (blocks sight), 'E' entrance
const depth = (x, y) => Math.min(x, y, N - 1 - x, N - 1 - y);
// Built ring by ring: walls at depth 0, 2 and 4, carpet corridors at depth 1 and 3, the centre at 5+.
const MAP = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (depth(x, y) % 2 === 0 && depth(x, y) < 5 ? "#" : ".")));
MAP[0][7] = "E";           // the way in from the basement
MAP[7][2] = ".";           // the outer ring's side opening into the inner ring
MAP[7][10] = ".";          // the inner ring's opening to the centre
MAP[8][1] = "L";           // outer ring: one loop door, just past the opening
MAP[11][7] = "#";          // the inner ring is a horseshoe: its lower arm is a dead end
MAP[8][11] = "L"; MAP[11][5] = "L"; // inner ring: two loop doors, past the opening and down the dead arm
MAP[3][6] = "x"; MAP[11][9] = "x";  // rooms of broken toys that block sight
const ringOf = (x, y) => { const d = depth(x, y); return d >= 5 || (x === 10 && y === 7) ? 2 : d >= 3 || (x === 2 && y === 7) ? 1 : 0; };
const START = [
  { guests: [[4, 1], [2, 1], [1, 3]], toys: [[7, 1], [1, 10]] },
  { guests: [[3, 4], [3, 5], [3, 6]], toys: [[2, 7], [11, 9]] },
];
const TOY_SPEED = 2.6, GUEST_SPEED = TOY_SPEED * 1.2, SEE = 5, LIMIT = 300;

function kit() {
  const offs = []; let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.cedarD};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif;color:${C.bone}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}btns{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:10px;z-index:2;padding:0 12px}
.${PRE}btns button{font:600 14px Karla,Arial,sans-serif;background:${C.cedar};color:${C.bone};border:2px solid ${C.amber};padding:8px 16px;cursor:pointer;min-height:42px;box-shadow:inset 0 0 0 3px ${C.cedar},inset 0 0 0 4px rgba(246,241,228,.35)}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.6);z-index:3;padding:16px}
.${PRE}intro div{max-width:480px;background:${C.cream};color:${C.ink};border:6px solid ${C.rust};outline:3px dashed ${C.amber};outline-offset:-10px;padding:20px 22px}
.${PRE}intro h2{margin:0 0 8px;font:400 30px 'IM Fell English',Georgia,serif}
.${PRE}intro p{margin:0 0 8px;font-size:14px;line-height:1.45}
.${PRE}intro button{font:600 15px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:0;padding:9px 22px;cursor:pointer;margin-top:6px}
.${PRE}intro label{font-size:12px;display:flex;gap:6px;align-items:center;margin-top:8px}
</style><canvas aria-label="The labyrinth from above, woven like a tapestry"></canvas>
<div class="${PRE}btns"><button type="button" data-a="switch">Switch toy (Tab)</button><button type="button" data-a="twitch">Twitch (T)</button></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");

    const open = (x, y) => x >= 0 && y >= 0 && x < N && y < N && MAP[y][x] !== "#";
    const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    function bfs(fx, fy, blocked) {
      const dist = Array.from({ length: N }, () => Array(N).fill(Infinity));
      const q = [[fx, fy]]; dist[fy][fx] = 0;
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of NB) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && dist[ny][nx] === Infinity && !(blocked && blocked(nx, ny))) { dist[ny][nx] = dist[y][x] + 1; q.push([nx, ny]); } } }
      return dist;
    }
    function sees(ax, ay, bx, by) {
      const d = Math.hypot(ax - bx, ay - by); if (d > SEE) return false;
      const steps = Math.ceil(d * 4);
      for (let i = 1; i < steps; i++) {
        const fx = ax + (bx - ax) * i / steps, fy = ay + (by - ay) * i / steps;
        const clear = (x, y) => (x === ax && y === ay) || (x === bx && y === by) || (open(x, y) && MAP[y][x] !== "x");
        // a line grazing a corner sees past it if either cell it touches is clear
        if (!clear(Math.round(fx - 1e-6), Math.round(fy - 1e-6)) && !clear(Math.round(fx + 1e-6), Math.round(fy + 1e-6))) return false;
      }
      return true;
    }

    // entities: x,y is the cell; px,py the drawn position moving toward it
    const toys = [
      { name: "You", kind: "cat", col: C.amber, x: 0, y: 0, px: 0, py: 0, path: [], still: 9, step: 0 },
      { name: "Lila", kind: "rabbit", col: C.cream, x: 0, y: 0, px: 0, py: 0, path: [], still: 9, step: 0 },
    ];
    const guests = [
      { name: "Noor", col: C.sky, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, step: 0, done: false },
      { name: "Wes", col: C.nightL, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, step: 0, done: false },
      { name: "Ana", col: C.rust, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, step: 0, done: false },
    ];
    let sel = 0, memories = 3, freezes = 0, t = 0, speed = 1, started = false, over = false, msg = "", msgT = 0, held = null;
    let L = null, tex = null;

    function place(e, x, y) { e.x = x; e.y = y; e.px = x; e.py = y; }
    function setRing(r, onlyGuest) {
      const s = START[r];
      if (onlyGuest) { const i = guests.indexOf(onlyGuest); place(onlyGuest, ...s.guests[i]); return; }
      guests.forEach((gu, i) => { place(gu, ...s.guests[i]); gu.ring = r; });
      toys.forEach((ty, i) => { place(ty, ...s.toys[i]); ty.path = []; });
    }
    setRing(0);

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const hud = 44, bottom = 66;
      const cell = Math.max(10, Math.floor(Math.min((W - 24) / N, (H - hud - bottom - 16) / N)));
      const size = cell * N;
      L = { W, H, cell, ox: Math.floor((W - size) / 2), oy: hud + Math.floor((H - hud - bottom - size) / 2), size, hud };
      tex = null;
    }

    // ---- the woven texture ------------------------------------------------------------------
    function weave(x, cx, cy, s, base, threadLight, threadDark) {
      x.fillStyle = base; x.fillRect(cx, cy, s, s);
      const k = Math.max(2, Math.floor(s / 8));
      for (let i = 0; i < s; i += k) for (let j = 0; j < s; j += k) {
        const over = ((i / k) + (j / k)) % 2 === 0;
        x.fillStyle = over ? threadLight : threadDark;
        if (over) x.fillRect(cx + i, cy + j + 1, k - 1, k - 2); else x.fillRect(cx + i + 1, cy + j, k - 2, k - 1);
      }
    }
    const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
    function warmFloor(d) { const t = Math.min(1, d / 6); return t < 0.5 ? mix(C.mossD, C.amber, t * 2 * 0.8) : mix(mix(C.mossD, C.amber, 0.8), C.red, (t - 0.5) * 2); }
    function buildTex() {
      const c = document.createElement("canvas"); c.width = L.size; c.height = L.size;
      const x = c.getContext("2d"), s = L.cell;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const m = MAP[j][i], cx = i * s, cy = j * s;
        if (m === "#") {
          weave(x, cx, cy, s, C.dust, "#f6efdf", "#c9b994");
          // wallpaper sprigs seen edge-on
          x.fillStyle = (i + j) % 2 === 0 ? C.rust : C.moss; x.fillRect(cx + s * 0.4, cy + s * 0.4, s * 0.2, s * 0.2);
        } else {
          const base = warmFloor(depth(i, j));
          weave(x, cx, cy, s, base, mix(base, C.bone, 0.28), mix(base, C.ink, 0.38));
          if (m === "x") { // broken toys: a heap of felt scraps
            x.fillStyle = C.cream; x.fillRect(cx + s * 0.15, cy + s * 0.2, s * 0.35, s * 0.3);
            x.fillStyle = C.sky; x.fillRect(cx + s * 0.45, cy + s * 0.45, s * 0.35, s * 0.3);
            x.fillStyle = C.cedar; x.fillRect(cx + s * 0.25, cy + s * 0.55, s * 0.2, s * 0.25);
          }
          if (m === "L") { // a loop door: a bone-thread arch with a turning arrow
            x.strokeStyle = C.bone; x.lineWidth = Math.max(1.5, s / 12);
            x.beginPath(); x.arc(cx + s / 2, cy + s / 2, s * 0.3, 0.3, Math.PI * 1.7); x.stroke();
            x.fillStyle = C.bone; x.beginPath(); x.moveTo(cx + s * 0.78, cy + s * 0.3); x.lineTo(cx + s * 0.9, cy + s * 0.55); x.lineTo(cx + s * 0.62, cy + s * 0.5); x.fill();
          }
        }
      }
      // fringe along the bottom and top
      return c;
    }

    // a small woven sprite on a 5 x 6 grid
    function sprite(cx, cy, s, rows, cols) {
      const u = s / 6;
      rows.forEach((r, j) => r.split("").forEach((ch, i) => { if (ch === ".") return; g.fillStyle = cols[ch]; g.fillRect(cx - 2.5 * u + i * u, cy - 3 * u + j * u, u + 0.4, u + 0.4); }));
    }
    const CAT = ["c...c", "ccccc", "cecec", "ccccc", ".ccc.", ".c.c."];
    const RAB = ["r...r", "r...r", "rrrrr", "rerer", ".rrr.", ".r.r."];
    const GUEST = [".hhh.", ".fff.", "bbbbb", ".bbb.", ".bbb.", ".l.l."];

    function draw(now) {
      if (!L) layout();
      const { W, H, cell: s, ox, oy, size } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.cedarD; g.fillRect(0, 0, W, H);
      if (!tex) tex = buildTex();
      // border: an amber and rust woven frame with fringe
      g.fillStyle = C.amber; g.fillRect(ox - 8, oy - 8, size + 16, size + 16);
      g.fillStyle = C.rust; for (let k = 0; k < size + 16; k += 8) { g.fillRect(ox - 8 + k, oy - 8, 4, 4); g.fillRect(ox - 8 + k + 4, oy + size + 4, 4, 4); }
      g.fillStyle = C.cream; for (let k = 0; k < size; k += 5) g.fillRect(ox + k, oy + size + 8, 2, 8);
      g.drawImage(tex, ox, oy);
      // the centre reddens thread by thread as the herd comes in
      const warmth = guests.reduce((a, gu) => a + (gu.done ? 3 : gu.ring + depth(gu.x, gu.y) / 6), 0) / (guests.length * 3);
      g.fillStyle = C.red;
      const threads = Math.floor(warmth * 40);
      for (let k = 0; k < threads; k++) { const yy = oy + 5 * s + ((k * 7) % (5 * s)); g.fillRect(ox + 5 * s, yy, 5 * s, 1.5); }
      const at = (e) => [ox + e.px * s + s / 2, oy + e.py * s + s / 2];
      // guests
      guests.forEach((gu) => {
        if (gu.done && gu.fade >= 1) return;
        let [x, y] = at(gu);
        const twin = guests.find((o) => o !== gu && !o.done && o.x === gu.x && o.y === gu.y);
        if (twin && !gu.done) x += (guests.indexOf(gu) ? 0.18 : -0.18) * s;
        g.globalAlpha = gu.done ? 1 - gu.fade : 1;
        sprite(x, y, s * 0.92, GUEST, { h: C.cedar, f: C.dust, b: gu.col, l: C.night });
        if (gu.freeze > 0) { g.strokeStyle = C.bone; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y, s * 0.62, 0, 7); g.stroke(); g.setLineDash([]); }
        if (gu.scared > 0 && !api.reducedMotion) { g.strokeStyle = "rgba(246,241,228,.6)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, s * 0.75 + (now / 60) % 6, 0, 7); g.stroke(); }
        g.globalAlpha = 1;
        g.fillStyle = C.bone; g.font = `600 ${Math.max(9, s * 0.32)}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "bottom";
        if (!gu.done) g.fillText(gu.name, x, y - s * 0.5);
      });
      // toys, the selected one ringed with its sight range
      toys.forEach((ty, i) => {
        const [x, y] = at(ty);
        if (i === sel) {
          g.strokeStyle = "rgba(227,154,45,.9)"; g.lineWidth = 2; g.setLineDash([4, 4]);
          g.beginPath(); g.arc(x, y, s * 0.7, 0, 7); g.stroke(); g.setLineDash([]);
          if (ty.path.length) { g.strokeStyle = "rgba(246,241,228,.7)"; g.lineWidth = 2; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(x, y); ty.path.forEach(([px, py]) => g.lineTo(ox + px * s + s / 2, oy + py * s + s / 2)); g.stroke(); g.setLineDash([]); }
        }
        sprite(x, y, s * 0.8, ty.kind === "cat" ? CAT : RAB, { c: C.amber, r: C.cream, e: C.ink });
      });
      // HUD: ring counter, warmth bar, memories, clock
      const hy = 14;
      g.textBaseline = "middle"; g.textAlign = "left"; g.font = "600 12px Karla,Arial,sans-serif";
      const herdRing = Math.min(...guests.map((gu) => (gu.done ? 2 : gu.ring)));
      ["OUTER", "INNER", "CENTRE"].forEach((r, i) => { g.fillStyle = i === herdRing ? C.amber : "rgba(246,241,228,.45)"; g.fillText(r, 14 + i * 64, hy + 6); });
      const bw = Math.min(180, W - 420);
      if (bw > 60) {
        g.fillStyle = "rgba(246,241,228,.5)"; g.fillText("WARMTH", 220, hy + 6);
        for (let k = 0; k < 20; k++) { g.fillStyle = k / 20 < warmth ? (k > 14 ? C.red : C.amber) : "rgba(246,241,228,.2)"; g.fillRect(286 + k * (bw / 20), hy, bw / 20 - 2, 12); }
      }
      g.textAlign = "right"; g.fillStyle = C.bone;
      const left = Math.max(0, LIMIT * speed - t);
      g.fillText(`memories ${"●".repeat(memories)}${"○".repeat(Math.max(0, 3 - memories))}   ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")} to dawn`, W - 14, W < 560 ? hy + 24 : hy + 6);
      g.textAlign = "left"; g.fillStyle = "rgba(246,241,228,.7)"; g.font = "12px Karla,Arial,sans-serif";
      g.fillText(`${W < 560 ? "" : "leading: "}${toys[sel].name} · freezes ${freezes % 3}/3`, 14, hy + 24);
      if (msg && now - msgT < 2600) {
        g.font = "600 14px Karla,Arial,sans-serif"; const w = g.measureText(msg).width + 24;
        g.fillStyle = "rgba(42,33,27,.85)"; g.fillRect(W / 2 - w / 2, oy + size / 2 - 16, w, 32);
        g.fillStyle = C.bone; g.textAlign = "center"; g.fillText(msg, W / 2, oy + size / 2);
      }
      K.frame(draw);
    }

    // ---- simulation ------------------------------------------------------------------------
    function say(m) { msg = m; msgT = performance.now(); }
    // toys slip between a guest's feet (and freeze them doing it); guests never step over a toy,
    // and frightened guests shove past each other
    const occupied = (x, y, except) => toys.some((o) => o !== except && o.x === x && o.y === y);
    function stepEntity(e, dt, spd) {
      const dx = e.x - e.px, dy = e.y - e.py, d = Math.hypot(dx, dy);
      if (d < 1e-3) { e.px = e.x; e.py = e.y; return true; }
      const m = Math.min(d, spd * dt); e.px += dx / d * m; e.py += dy / d * m;
      return false;
    }
    function moving(ty) { return ty.still < 0.35; }
    function freezeGuest(gu) {
      gu.freeze = 8; gu.immune = 10; freezes++;
      say(`${gu.name} freezes. We didn't pounce.`);
      if (freezes % 3 === 0) { memories--; say("Three freezes: the hunger lunged. One memory gone."); if (memories <= 0) lose("The hunger lunged one time too many. Nothing of you is left to herd with."); }
    }
    function restart(gu, why) {
      say(`${gu.name} ${why}. Back to the ring's entrance.`);
      gu.loops = 0; gu.frozenTotal = 0; gu.freeze = 0; gu.immune = 2;
      setRing(gu.ring, gu);
    }

    function update(dt) {
      t += dt;
      if (t >= LIMIT * speed) { lose("Grey light through the boards. The guests find the stairs on their own."); return; }
      // toys follow their paths
      toys.forEach((ty) => {
        ty.still += dt;
        const arrived = stepEntity(ty, dt, TOY_SPEED / speed);
        if (arrived && ty.path.length) {
          const [nx, ny] = ty.path[0];
          if (!occupied(nx, ny, ty)) { ty.path.shift(); ty.x = nx; ty.y = ny; ty.still = 0; }
          else ty.path = [];
        } else if (!arrived) ty.still = 0;
      });
      // guests
      guests.forEach((gu) => {
        if (gu.done) { gu.fade = Math.min(1, (gu.fade || 0) + dt); return; }
        const arrived = stepEntity(gu, dt, GUEST_SPEED / speed);
        if (gu.immune > 0) gu.immune -= dt;
        if (gu.freeze > 0) {
          gu.freeze -= dt; gu.frozenTotal += dt;
          if (gu.frozenTotal >= 20) restart(gu, "stood frozen too long");
          return;
        }
        // within 1 m of a toy: freeze
        if (gu.immune <= 0 && toys.some((ty) => Math.abs(ty.x - gu.x) + Math.abs(ty.y - gu.y) <= 1)) { freezeGuest(gu); return; }
        const scarer = toys.find((ty) => moving(ty) && sees(gu.x, gu.y, ty.x, ty.y));
        if (gu.hesitate > 0) { gu.hesitate -= dt; return; }
        if (scarer) gu.scared = 0.6; else gu.scared = Math.max(0, gu.scared - dt);
        if (!arrived || gu.scared <= 0) return;
        const from = scarer || toys.reduce((a, b) => (Math.hypot(a.x - gu.x, a.y - gu.y) < Math.hypot(b.x - gu.x, b.y - gu.y) ? a : b));
        const dist = bfs(from.x, from.y);
        const here = dist[gu.y][gu.x];
        let best = null, score = -Infinity;
        for (const [dx, dy] of NB) {
          const nx = gu.x + dx, ny = gu.y + dy;
          if (!open(nx, ny) || occupied(nx, ny, gu)) continue;
          if (toys.some((ty) => Math.abs(ty.x - nx) + Math.abs(ty.y - ny) <= 1)) continue; // they won't brush past a toy
          if (dist[ny][nx] <= here) continue;
          const openness = NB.filter(([ax, ay]) => open(nx + ax, ny + ay)).length;
          const sc = dist[ny][nx] * 10 + openness + rng() * 0.5;
          if (sc > score) { score = sc; best = [nx, ny]; }
        }
        if (!best) return;
        gu.x = best[0]; gu.y = best[1];
        const cellK = MAP[gu.y][gu.x];
        const r = ringOf(gu.x, gu.y);
        if (r > gu.ring) { gu.ring = r; gu.loops = 0; gu.frozenTotal = 0; if (r === 1) say(`${gu.name} is in the inner ring.`); }
        if (r === 2 && depth(gu.x, gu.y) >= 5) { gu.done = true; gu.fade = 0; say(`${gu.name} reaches the centre.`); if (guests.every((x) => x.done)) win(); return; }
        // at a junction they stop and look round before running on
        if (NB.filter(([ax, ay]) => open(gu.x + ax, gu.y + ay)).length >= 3) { gu.scared = 0; gu.hesitate = 0.9 * speed; }
        if (cellK === "L") {
          gu.loops++;
          if (gu.loops >= 2) restart(gu, "looped back twice");
          else { say(`A door that leads back: ${gu.name} is where the ring began.`); setRing(gu.ring, gu); }
        }
      });
    }
    function win() {
      over = true;
      const best = api.store.get("best", null); if (best === null || t < best) api.store.set("best", Math.round(t));
      api.end({ outcome: "win", text: `All three guests went down to the centre in ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}, with ${memories} memor${memories === 1 ? "y" : "ies"} left. The warmth rises through the floor.` });
    }
    function lose(text) { if (over) return; over = true; api.end({ outcome: "lose", text }); }

    // ---- input -------------------------------------------------------------------------------
    function goTo(x, y) {
      const ty = toys[sel];
      const dist = bfs(x, y, (cx, cy) => occupied(cx, cy, ty) && !(cx === ty.x && cy === ty.y));
      if (dist[ty.y][ty.x] === Infinity) { say("No way through from here."); return; }
      const path = []; let cx = ty.x, cy = ty.y;
      while (!(cx === x && cy === y)) { let nx = cx, ny = cy; for (const [dx, dy] of NB) { const ax = cx + dx, ay = cy + dy; if (open(ax, ay) && dist[ay][ax] < dist[ny][nx]) { nx = ax; ny = ay; } } if (nx === cx && ny === cy) break; path.push([nx, ny]); cx = nx; cy = ny; }
      ty.path = path;
    }
    function nudge(dx, dy) { const ty = toys[sel]; const nx = ty.x + dx, ny = ty.y + dy; if (open(nx, ny) && !occupied(nx, ny, ty)) ty.path = [[nx, ny]]; }
    function swap() { sel = (sel + 1) % toys.length; }
    function twitch() { toys[sel].still = 0; }
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const [x, y] = pt(e), cx = Math.floor((x - L.ox) / L.cell), cy = Math.floor((y - L.oy) / L.cell);
      if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const ti = toys.findIndex((ty) => ty.x === cx && ty.y === cy);
      if (ti >= 0) { sel = ti; return; }
      if (open(cx, cy)) goTo(cx, cy);
    });
    const DIR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (DIR[k]) { held = DIR[k]; nudge(...held); e.preventDefault(); }
      else if (k === "Tab" || k === "q") { swap(); e.preventDefault(); }
      else if (k === "t") twitch();
    });
    K.on(wrap, "keyup", (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (DIR[k]) held = null; });
    wrap.querySelectorAll("button[data-a]").forEach((b) => K.on(b, "click", () => { if (!started || over) return; b.dataset.a === "switch" ? swap() : twitch(); wrap.focus(); }));

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        if (held && !toys[sel].path.length && Math.hypot(toys[sel].x - toys[sel].px, toys[sel].y - toys[sel].py) < 0.05) nudge(...held);
        update(dt);
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>Labyrinth from above</h2>
      <p>Herd the three guests through the rings to the warm centre. A guest runs from any toy they see moving nearby, and runs a little faster than you. Come within a metre and they freeze; three freezes cost a memory.</p>
      <p>Doors marked with a turning thread lead back to where the ring began: guests will not pass close to a toy, so stand Lila beyond a door to turn them. Tap a cell (or arrows) to move, Tab to switch. You can slip past a guest's feet, but they freeze.</p>
      <button type="button">Start</button>
      <label><input type="checkbox"> Half speed</label></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => { speed = intro.querySelector("input").checked ? 2 : 1; intro.remove(); started = true; wrap.focus(); });
    sb.focus();

    cv._probe = () => ({ toys: toys.map((t) => [t.x, t.y]), guests: guests.map((gu) => [gu.x, gu.y, gu.ring, gu.done, gu.freeze > 0, +gu.scared.toFixed(2), +gu.immune.toFixed(1)]), sel, cell: L.cell, ox: L.ox, oy: L.oy, memories, t });
    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

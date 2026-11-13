// The Stuffed Ones: Labyrinth from above (2D, scroll), drawn as a woven tapestry.
//
// DESIGN.md section 10 "Mode B" (`c14_labyrinth_outer`, `c14_labyrinth_inner`): the labyrinth from
// directly above, its walls woven like wallpaper seen edge-on, carpet corridors a darker weave, the
// floor reddening toward the centre. You move one of the pack at a time and herd three guests
// inward. Rules kept: a guest flees from any toy they see moving within 5 m, at 1.2 times a toy's
// speed; a toy within 1 m makes a guest freeze for 8 s ("we didn't pounce"), and three freezes cost
// one memory; loop doors set a guest back to its ring's start; a guest looped back twice, or frozen
// 20 s in all, restarts from its ring's entrance. Cut to fit: one maze holding the outer ring (one
// loop door) and the inner ring (two loop doors and rooms of broken toys that block sight).
//
// Actions: Move (tap a cell, arrows). Switch toy (Tab or Q: the pulse). Twitch (T): seen, not a step,
// so it turns a guest without closing on them. Step (S): "A step forward" (DESIGN.md chapter 14):
// a guest who sees it from as far as 7 m runs, but it costs hunger. Hold (hold Space): the whole
// pack holds still, and nothing it does frightens anyone. Hunger rises (section 12): +1 per 3 s,
// a guest herded into the centre -15, and at 100 a lurch that costs a memory. Where corridors tie,
// guests take the one that runs warmer and deeper ("The deeper we went, the warmer the air
// became."). Phases: the outer ring with Lila; the inner ring, where Jamie joins at the far loop
// door; the centre. Narrative lines other than quotations are written for the game.
const PRE = "stuffed-ones-labyrinth-";
const C = { moss: "#7d8a5a", mossD: "#56623d", rust: "#a5553a", cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", cream: "#efe5cf",
  bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", sky: "#8fa9bf", night: "#56627a", nightL: "#7f8ca3", ink: "#2a211b", bear: "#c2925f" };
const N = 15;
// Map legend: '#' wall, '.' carpet, 'L' loop door, 'x' broken toys (blocks sight), 'E' entrance
const depth = (x, y) => Math.min(x, y, N - 1 - x, N - 1 - y);
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
const TOY_SPEED = 2.6, GUEST_SPEED = TOY_SPEED * 1.2, SEE = 5, STEP_SEE = 7, LIMIT = 300;
const HUNGER_RATE = 1 / 3, STEP_COST = 12, TWITCH_COST = 2;

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    const weaveCss = (a, b) => `background-color:${a};background-image:repeating-linear-gradient(90deg,${b} 0 3px,transparent 3px 6px),repeating-linear-gradient(0deg,rgba(0,0,0,.08) 0 3px,transparent 3px 6px)`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.cedarD};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif;color:${C.bone}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}btns{position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:center;flex-wrap:wrap;gap:8px;z-index:2;padding:0 10px}
.${PRE}btns button{font:600 14px Karla,Arial,sans-serif;${weaveCss(C.cedar, "rgba(255,255,255,.05)")};color:${C.bone};border:2px solid ${C.amber};padding:7px 12px;cursor:pointer;min-height:44px;box-shadow:inset 0 0 0 3px ${C.cedar},inset 0 0 0 4px rgba(246,241,228,.35)}
.${PRE}btns button i{font:600 12px ui-monospace,Menlo,monospace;font-style:normal;opacity:.8;margin-left:4px}
.${PRE}btns button:hover{filter:brightness(1.15)}
.${PRE}btns button[hidden]{display:none}
.${PRE}btns button[aria-pressed=true]{background:${C.amber};color:${C.ink}}
.${PRE}btns button.${PRE}new{animation:${PRE}glow 1s ease-in-out 3 alternate}
@keyframes ${PRE}glow{to{box-shadow:inset 0 0 0 3px ${C.cedar},0 0 0 4px ${C.amber}}}
.${PRE}beat{position:absolute;left:50%;transform:translateX(-50%);top:62px;width:min(480px,calc(100% - 32px));box-sizing:border-box;${weaveCss(C.cream, "rgba(165,85,58,.08)")};color:${C.ink};border:5px solid ${C.rust};outline:2px dashed ${C.amber};outline-offset:-10px;padding:14px 18px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none}
.${PRE}beat b{font:400 19px 'IM Fell English',Georgia,serif;display:block}
.${PRE}beat q{font:italic 17px 'IM Fell English',Georgia,serif}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.62);z-index:4;padding:16px;overflow:auto}
.${PRE}card{width:min(480px,100%);box-sizing:border-box;${weaveCss(C.cream, "rgba(165,85,58,.07)")};color:${C.ink};border:8px solid ${C.rust};outline:3px dashed ${C.amber};outline-offset:-14px;padding:24px 26px 30px;position:relative}
.${PRE}card::after{content:"";position:absolute;left:4px;right:4px;bottom:-20px;height:12px;background:repeating-linear-gradient(90deg,${C.cream} 0 2px,transparent 2px 6px)}
.${PRE}card h2{margin:0 0 4px;font:400 32px 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}q{margin:0 0 8px;font:italic 16px/1.4 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}goal{margin:0 0 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}legend{border-top:3px solid ${C.amber};padding-top:6px}
.${PRE}legend div{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:4px 0}
.${PRE}legend i{width:22px;height:22px;display:block}
.${PRE}legend kbd{font:600 12px ui-monospace,Menlo,monospace;border:1px solid ${C.rust};padding:1px 6px;background:${C.bone}}
.${PRE}card button{font:600 16px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:0;padding:11px 24px;cursor:pointer;margin-top:14px;min-height:46px}
.${PRE}card button:focus-visible{outline:3px solid ${C.ink};outline-offset:2px}
.${PRE}card label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin-top:12px}
.${PRE}card .${PRE}kind{margin:10px 0 0;font:italic 15px 'IM Fell English',Georgia,serif;color:${C.red}}
</style><canvas aria-label="The labyrinth from above, woven like a tapestry"></canvas>
<div class="${PRE}btns"><button type="button" data-a="switch">Switch toy<i>Tab</i></button><button type="button" data-a="twitch" hidden>Twitch<i>T</i></button><button type="button" data-a="step" hidden>Step<i>S</i></button><button type="button" data-a="hold" aria-pressed="false" hidden>Hold still<i>Space</i></button></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const btn = (a) => wrap.querySelector(`button[data-a="${a}"]`);
    const beatEl = wrap.querySelector("." + PRE + "beat");

    const open = (x, y) => x >= 0 && y >= 0 && x < N && y < N && MAP[y][x] !== "#";
    const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    function bfs(fx, fy, blocked) {
      const dist = Array.from({ length: N }, () => Array(N).fill(Infinity));
      const q = [[fx, fy]]; dist[fy][fx] = 0;
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of NB) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && dist[ny][nx] === Infinity && !(blocked && blocked(nx, ny))) { dist[ny][nx] = dist[y][x] + 1; q.push([nx, ny]); } } }
      return dist;
    }
    function sees(ax, ay, bx, by, range = SEE) {
      const d = Math.hypot(ax - bx, ay - by); if (d > range) return false;
      const steps = Math.ceil(d * 4);
      for (let i = 1; i < steps; i++) {
        const fx = ax + (bx - ax) * i / steps, fy = ay + (by - ay) * i / steps;
        const clear = (x, y) => (x === ax && y === ay) || (x === bx && y === by) || (open(x, y) && MAP[y][x] !== "x");
        if (!clear(Math.round(fx - 1e-6), Math.round(fy - 1e-6)) && !clear(Math.round(fx + 1e-6), Math.round(fy + 1e-6))) return false;
      }
      return true;
    }

    const toys = [
      { name: "You", kind: "cat", x: 0, y: 0, px: 0, py: 0, path: [], still: 9, active: true },
      { name: "Lila", kind: "rabbit", x: 0, y: 0, px: 0, py: 0, path: [], still: 9, active: true },
      { name: "Jamie", kind: "bear", x: 11, y: 9, px: 11, py: 9, path: [], still: 9, active: false },
    ];
    const guests = [
      { name: "Noor", col: C.sky, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, done: false },
      { name: "Wes", col: C.nightL, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, done: false },
      { name: "Ana", col: C.rust, x: 0, y: 0, px: 0, py: 0, ring: 0, freeze: 0, immune: 0, frozenTotal: 0, loops: 0, scared: 0, done: false },
    ];
    let sel = 0, memories = 3, freezes = 0, t = 0, speed = 1, started = false, over = false, msg = "", msgT = 0, msgCol = C.bone, held = null;
    let hunger = 40, holding = false, stepT = 0, lurches = 0, steps = 0, twitches = 0, loopSaid = false, innerSaid = false, centreSaid = false, unlocked = 1;
    const pops = [];
    let L = null, tex = null, hoverCell = null, beatTimer = 0;
    const live = () => toys.filter((ty) => ty.active);

    function beat(title, text, quote, ms = 5000) {
      beatEl.innerHTML = ""; const b = document.createElement("b"); b.textContent = title; beatEl.appendChild(b);
      if (quote) { const q = document.createElement("q"); q.textContent = quote; beatEl.appendChild(q); if (text) beatEl.appendChild(document.createTextNode(" ")); }
      if (text) beatEl.appendChild(document.createTextNode(text));
      beatEl.style.opacity = 1; clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function place(e, x, y) { e.x = x; e.y = y; e.px = x; e.py = y; }
    function setRing(r, onlyGuest) {
      const s = START[r];
      if (onlyGuest) { const i = guests.indexOf(onlyGuest); place(onlyGuest, ...s.guests[i]); return; }
      guests.forEach((gu, i) => { place(gu, ...s.guests[i]); gu.ring = r; });
      toys.slice(0, 2).forEach((ty, i) => { place(ty, ...s.toys[i]); ty.path = []; });
    }
    setRing(0);

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const hud = W < 560 ? 84 : 50, bottom = W < 560 ? 112 : 64;
      const cell = Math.max(10, Math.floor(Math.min((W - 28) / N, (H - hud - bottom - 20) / N)));
      const size = cell * N;
      L = { W, H, cell, ox: Math.floor((W - size) / 2), oy: hud + Math.floor((H - hud - bottom - size) / 2), size, hud };
      beatEl.style.top = (L.oy + 8) + "px";
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
          x.fillStyle = (i + j) % 2 === 0 ? C.rust : C.moss; x.fillRect(cx + s * 0.4, cy + s * 0.4, s * 0.2, s * 0.2);
        } else {
          const base = warmFloor(depth(i, j));
          weave(x, cx, cy, s, base, mix(base, C.bone, 0.28), mix(base, C.ink, 0.38));
          if (m === "x") {
            x.fillStyle = C.cream; x.fillRect(cx + s * 0.15, cy + s * 0.2, s * 0.35, s * 0.3);
            x.fillStyle = C.sky; x.fillRect(cx + s * 0.45, cy + s * 0.45, s * 0.35, s * 0.3);
            x.fillStyle = C.cedar; x.fillRect(cx + s * 0.25, cy + s * 0.55, s * 0.2, s * 0.25);
          }
          if (m === "L") {
            x.strokeStyle = C.bone; x.lineWidth = Math.max(1.5, s / 12);
            x.beginPath(); x.arc(cx + s / 2, cy + s / 2, s * 0.3, 0.3, Math.PI * 1.7); x.stroke();
            x.fillStyle = C.bone; x.beginPath(); x.moveTo(cx + s * 0.78, cy + s * 0.3); x.lineTo(cx + s * 0.9, cy + s * 0.55); x.lineTo(cx + s * 0.62, cy + s * 0.5); x.fill();
          }
        }
      }
      return c;
    }
    function sprite(cx, cy, s, rows, cols) {
      const u = s / 6;
      rows.forEach((r, j) => r.split("").forEach((ch, i) => { if (ch === ".") return; g.fillStyle = cols[ch]; g.fillRect(cx - 2.5 * u + i * u, cy - 3 * u + j * u, u + 0.4, u + 0.4); }));
    }
    const CAT = ["c...c", "ccccc", "cecec", "ccccc", ".ccc.", ".c.c."];
    const RAB = ["r...r", "r...r", "rrrrr", "rerer", ".rrr.", ".r.r."];
    const BEAR = ["b...b", "bbbbb", "bebeb", "bbbbb", "bbbbb", ".b.b."];
    const GUEST = [".hhh.", ".fff.", "bbbbb", ".bbb.", ".bbb.", ".l.l."];

    function draw(now) {
      if (!L) layout();
      const { W, H, cell: s, ox, oy, size } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.cedarD; g.fillRect(0, 0, W, H);
      if (!tex) tex = buildTex();
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
      // the hover cell and the planned path
      if (hoverCell && open(hoverCell[0], hoverCell[1]) && started && !over) { g.strokeStyle = "rgba(246,241,228,.9)"; g.lineWidth = 2; g.strokeRect(ox + hoverCell[0] * s + 1, oy + hoverCell[1] * s + 1, s - 2, s - 2); }
      // the sight of the selected toy, so the player can read who will see it move
      const ty0 = toys[sel];
      if (!holding && started && !over) {
        guests.forEach((gu) => { if (gu.done || gu.freeze > 0) return; if (sees(gu.x, gu.y, ty0.x, ty0.y, stepT > 0 ? STEP_SEE : SEE)) { const [gx, gy] = at(gu), [tx, ty] = at(ty0); g.strokeStyle = "rgba(246,241,228,.35)"; g.lineWidth = 1.5; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(gx, gy); g.lineTo(tx, ty); g.stroke(); g.setLineDash([]); } });
      }
      // guests
      guests.forEach((gu) => {
        if (gu.done && gu.fade >= 1) return;
        let [x, y] = at(gu);
        const twin = guests.find((o) => o !== gu && !o.done && o.x === gu.x && o.y === gu.y);
        if (twin && !gu.done) x += (guests.indexOf(gu) ? 0.18 : -0.18) * s;
        g.globalAlpha = gu.done ? 1 - gu.fade : 1;
        sprite(x, y, s * 0.92, GUEST, { h: C.cedar, f: C.dust, b: gu.col, l: C.night });
        if (gu.freeze > 0) { g.strokeStyle = C.bone; g.lineWidth = 2.5; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y, s * 0.62, 0, 7); g.stroke(); g.setLineDash([]);
          g.fillStyle = C.bone; g.font = `700 ${Math.max(12, s * 0.34)}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.fillText(`${Math.ceil(gu.freeze)}`, x, y + s * 0.5); }
        if (gu.scared > 0 && !api.reducedMotion) { g.strokeStyle = "rgba(246,241,228,.6)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, s * 0.75 + (now / 60) % 6, 0, 7); g.stroke(); }
        g.globalAlpha = 1;
        if (!gu.done) {
          g.font = `700 ${Math.max(12, s * 0.34)}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "bottom";
          const w = g.measureText(gu.name).width + 6; g.fillStyle = "rgba(42,33,27,.75)"; g.fillRect(x - w / 2, y - s * 0.5 - 15, w, 15);
          g.fillStyle = C.bone; g.fillText(gu.name, x, y - s * 0.5);
        }
      });
      // toys
      toys.forEach((ty, i) => {
        if (!ty.active) return;
        const [x, y] = at(ty);
        if (i === sel) {
          g.strokeStyle = holding ? C.bone : "rgba(227,154,45,.95)"; g.lineWidth = 2.5; g.setLineDash(holding ? [] : [4, 4]);
          g.beginPath(); g.arc(x, y, s * 0.72, 0, 7); g.stroke(); g.setLineDash([]);
          if (ty.path.length) { g.strokeStyle = "rgba(246,241,228,.75)"; g.lineWidth = 2; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(x, y); ty.path.forEach(([px, py]) => g.lineTo(ox + px * s + s / 2, oy + py * s + s / 2)); g.stroke(); g.setLineDash([]); const e = ty.path[ty.path.length - 1]; g.fillStyle = C.amber; g.fillRect(ox + e[0] * s + s * 0.35, oy + e[1] * s + s * 0.35, s * 0.3, s * 0.3); }
          if (stepT > 0) { g.strokeStyle = C.red; g.lineWidth = 2; g.globalAlpha = stepT; g.beginPath(); g.arc(x, y, s * (0.8 + (1 - stepT) * 2.5), 0, 7); g.stroke(); g.globalAlpha = 1; }
        }
        sprite(x, y, s * 0.8, ty.kind === "cat" ? CAT : ty.kind === "bear" ? BEAR : RAB, { c: C.amber, r: C.cream, b: C.bear, e: C.ink });
      });
      if (holding) { g.strokeStyle = C.bone; g.lineWidth = 4; g.globalAlpha = 0.5; g.strokeRect(ox - 4, oy - 4, size + 8, size + 8); g.globalAlpha = 1; }
      drawHud(now);
      if (msg && now - msgT < 2600) {
        g.font = "700 15px Karla,Arial,sans-serif"; const w = Math.min(W - 24, g.measureText(msg).width + 26);
        g.fillStyle = "rgba(42,33,27,.9)"; g.fillRect(W / 2 - w / 2, oy + size - 48, w, 34);
        g.fillStyle = msgCol; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(msg, W / 2, oy + size - 31, w - 14);
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1400;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 26;
        g.globalAlpha = 1 - a * a; g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.lineWidth = 4; g.strokeStyle = C.ink; g.strokeText(p.text, p.x, p.y - rise); g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise); g.globalAlpha = 1;
      }
      K.frame(draw);
    }
    function drawHud(now) {
      const { W } = L, narrow = W < 560;
      const hy = 16;
      g.textBaseline = "middle"; g.textAlign = "left"; g.font = "700 13px Karla,Arial,sans-serif";
      const herdRing = Math.min(...guests.map((gu) => (gu.done ? 2 : gu.ring)));
      const inCentre = guests.filter((gu) => gu.done).length;
      ["OUTER", "INNER", `CENTRE ${inCentre}/3`].forEach((r, i) => { g.fillStyle = i === herdRing ? C.amber : "rgba(246,241,228,.55)"; g.fillText(r, 14 + i * 66, hy); });
      // hunger: a woven bar that reddens
      const hx = narrow ? 14 : 250, hyy = narrow ? hy + 24 : hy, hw = narrow ? 110 : Math.min(160, W - 560);
      if (hw > 60) {
        g.fillStyle = "rgba(246,241,228,.8)"; g.fillText("HUNGER", hx, hyy);
        const bx = hx + 66;
        for (let k = 0; k < 20; k++) { const on = k / 20 < hunger / 100; g.fillStyle = on ? (k >= 15 ? C.red : C.amber) : "rgba(246,241,228,.18)"; g.fillRect(bx + k * (hw / 20), hyy - 6, hw / 20 - 2, 12); }
        if (hunger >= 75 && !api.reducedMotion && Math.floor(now / 300) % 2) { g.strokeStyle = C.red; g.lineWidth = 2; g.strokeRect(bx - 3, hyy - 9, hw + 4, 18); }
      }
      g.textAlign = "right"; g.fillStyle = C.bone; g.font = "700 14px Karla,Arial,sans-serif";
      const left = Math.max(0, LIMIT * speed - t);
      const dawn = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")} to dawn`;
      g.fillStyle = left < 60 * speed ? C.amber : C.bone; g.fillText(dawn, W - 14, hy);
      g.fillStyle = C.bone; g.font = "700 14px Karla,Arial,sans-serif";
      const mem = `memories ${"●".repeat(Math.max(0, memories))}${"○".repeat(Math.max(0, 3 - memories))}`;
      g.fillText(mem, W - 14, hy + 24);
      g.textAlign = "left"; g.font = "13px Karla,Arial,sans-serif"; g.fillStyle = "rgba(246,241,228,.85)";
      g.fillText(`leading ${toys[sel].name} · freezes ${freezes % 3}/3`, 14, narrow ? hy + 48 : hy + 24);
    }

    // ---- simulation ------------------------------------------------------------------------
    function say(m, col = C.bone) { msg = m; msgT = performance.now(); msgCol = col; }
    function pop(text, e, col) { pops.push({ text, x: L.ox + e.px * L.cell + L.cell / 2, y: L.oy + e.py * L.cell - 6, col, t0: performance.now() }); }
    const occupied = (x, y, except) => toys.some((o) => o.active && o !== except && o.x === x && o.y === y);
    function stepEntity(e, dt, spd) {
      const dx = e.x - e.px, dy = e.y - e.py, d = Math.hypot(dx, dy);
      if (d < 1e-3) { e.px = e.x; e.py = e.y; return true; }
      const m = Math.min(d, spd * dt); e.px += dx / d * m; e.py += dy / d * m;
      return false;
    }
    function moving(ty) { return !holding && ty.still < 0.35; }
    function loseMemory(why) {
      memories--; say(why, C.amber);
      if (memories <= 0) lose("The hunger lunged one time too many. Nothing of you is left to herd with; the rhythm breaks, and the ring begins again from its entrance without you.");
    }
    function freezeGuest(gu) {
      gu.freeze = 8; gu.immune = 10; freezes++;
      pop("froze", gu, C.bone);
      say(`${gu.name} freezes. We didn't pounce.`);
      if (freezes % 3 === 0) loseMemory("Three freezes: the hunger lunged. One memory gone.");
    }
    function restart(gu, why) {
      say(`${gu.name} ${why}. Back to the ring's entrance.`, C.amber);
      gu.loops = 0; gu.frozenTotal = 0; gu.freeze = 0; gu.immune = 2;
      setRing(gu.ring, gu);
    }
    function update(dt) {
      t += dt;
      if (t >= LIMIT * speed) { lose("Grey light comes through the boards. The herd scattered and the rhythm broke; the ring begins again from its entrance."); return; }
      if (stepT > 0) stepT = Math.max(0, stepT - dt / 1.5);
      hunger += HUNGER_RATE * dt / speed;
      if (hunger >= 100) {
        lurches++; hunger = 55;
        const ty = toys[0]; ty.still = 0;
        pop("lurch", ty, C.red);
        loseMemory("The hunger lurches you forward. One memory gone.");
        if (over) return;
      }
      toys.forEach((ty) => {
        if (!ty.active) return;
        ty.still += dt;
        if (holding) { stepEntity(ty, dt, TOY_SPEED / speed); return; }
        const arrived = stepEntity(ty, dt, TOY_SPEED / speed);
        if (arrived && ty.path.length) {
          const [nx, ny] = ty.path[0];
          if (!occupied(nx, ny, ty)) { ty.path.shift(); ty.x = nx; ty.y = ny; ty.still = 0; }
          else ty.path = [];
        } else if (!arrived) ty.still = 0;
      });
      guests.forEach((gu) => {
        if (gu.done) { gu.fade = Math.min(1, (gu.fade || 0) + dt); return; }
        const arrived = stepEntity(gu, dt, GUEST_SPEED / speed);
        if (gu.immune > 0) gu.immune -= dt;
        if (gu.freeze > 0) {
          gu.freeze -= dt; gu.frozenTotal += dt;
          if (gu.frozenTotal >= 20) restart(gu, "stood frozen too long");
          return;
        }
        if (gu.immune <= 0 && live().some((ty) => Math.abs(ty.x - gu.x) + Math.abs(ty.y - gu.y) <= 1)) { freezeGuest(gu); return; }
        const scarer = live().find((ty) => moving(ty) && sees(gu.x, gu.y, ty.x, ty.y, ty === toys[sel] && stepT > 0 ? STEP_SEE : SEE));
        if (gu.hesitate > 0) { gu.hesitate -= dt; return; }
        if (scarer) gu.scared = 0.6; else gu.scared = Math.max(0, gu.scared - dt);
        if (!arrived || gu.scared <= 0) return;
        const from = scarer || live().reduce((a, b) => (Math.hypot(a.x - gu.x, a.y - gu.y) < Math.hypot(b.x - gu.x, b.y - gu.y) ? a : b));
        const dist = bfs(from.x, from.y);
        const here = dist[gu.y][gu.x];
        let best = null, score = -Infinity;
        for (const [dx, dy] of NB) {
          const nx = gu.x + dx, ny = gu.y + dy;
          if (!open(nx, ny) || occupied(nx, ny, gu)) continue;
          if (live().some((ty) => Math.abs(ty.x - nx) + Math.abs(ty.y - ny) <= 1)) continue;
          if (dist[ny][nx] <= here) continue;
          const openness = NB.filter(([ax, ay]) => open(nx + ax, ny + ay)).length;
          // where corridors tie, the warmer, deeper one draws them
          const sc = dist[ny][nx] * 10 + openness + Math.min(5, depth(nx, ny)) * 1.6 + rng() * 0.5;
          if (sc > score) { score = sc; best = [nx, ny]; }
        }
        if (!best) return;
        gu.x = best[0]; gu.y = best[1];
        const cellK = MAP[gu.y][gu.x];
        const r = ringOf(gu.x, gu.y);
        if (r > gu.ring) { gu.ring = r; gu.loops = 0; gu.frozenTotal = 0; if (r === 1) { pop("inner ring", gu, C.amber); enterInner(gu); } }
        if (r === 2 && depth(gu.x, gu.y) >= 5) {
          gu.done = true; gu.fade = 0; hunger = Math.max(0, hunger - 15); pop("−15 hunger", gu, C.amber);
          say(`${gu.name} reaches the centre.`, C.amber);
          if (!centreSaid) { centreSaid = true; beat("The centre", `${gu.name} stops in the warm room and does not turn round.`, "The deeper we went, the warmer the air became.", 5000); }
          if (guests.every((x) => x.done)) win();
          return;
        }
        if (NB.filter(([ax, ay]) => open(gu.x + ax, gu.y + ay)).length >= 3) { gu.scared = 0; gu.hesitate = 0.9 * speed; }
        if (cellK === "L") {
          gu.loops++;
          if (!loopSaid) { loopSaid = true; beat("A door that leads back", `${gu.name} steps through and is where the ring began.`, "Doors that led back to where we started.", 4500); }
          if (gu.loops >= 2) restart(gu, "looped back twice");
          else { say(`A door that leads back: ${gu.name} is where the ring began.`, C.amber); setRing(gu.ring, gu); }
        }
      });
    }
    function enterInner(gu) {
      if (innerSaid) return;
      innerSaid = true;
      toys[2].active = true; place(toys[2], 11, 9);
      unlock(3);
      beat("Jamie", `${gu.name} is in the inner ring. Behind you, Jamie has come down through the trapdoor; he stands below the far loop door and will hold there until you lead him. Step (S) is yours now: a step forward, seen from far off, and hungry work.`, null, 7000);
    }
    function unlock(n) {
      if (n <= unlocked) return;
      unlocked = n;
      if (n >= 2) { btn("twitch").hidden = false; btn("hold").hidden = false; }
      if (n >= 3) { const b = btn("step"); b.hidden = false; b.classList.add(PRE + "new"); }
    }
    function end(kind, text) { if (over) return; over = true; holding = false; api.store.set("losses", kind === "lose" ? losses + 1 : 0); api.end({ outcome: kind, text }); }
    function win() {
      const best = api.store.get("best", null); if (best === null || t < best) api.store.set("best", Math.round(t));
      end("win", `All three went down to the centre in ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}, with ${memories} memor${memories === 1 ? "y" : "ies"} left${lurches ? "" : " and no lurch"}. The warmth rises through the floor. We were the hunters.`);
    }
    function lose(text) { end("lose", text); }

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
    function swap() { const n = toys.length; for (let k = 1; k <= n; k++) { const j = (sel + k) % n; if (toys[j].active) { sel = j; break; } } pop(toys[sel].name, toys[sel], C.amber); }
    function twitch() { if (holding) return; toys[sel].still = 0; twitches++; hunger += TWITCH_COST; pop("twitch", toys[sel], C.bone); }
    function step() {
      if (holding || unlocked < 3) return;
      toys[sel].still = 0; stepT = 1; steps++; hunger += STEP_COST; pop(`step · +${STEP_COST} hunger`, toys[sel], C.red);
    }
    function setHold(v) { holding = v && started && !over; btn("hold").setAttribute("aria-pressed", String(holding)); }
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    const cellOf = (x, y) => [Math.floor((x - L.ox) / L.cell), Math.floor((y - L.oy) / L.cell)];
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const [cx, cy] = cellOf(...pt(e));
      if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const ti = toys.findIndex((ty) => ty.active && ty.x === cx && ty.y === cy);
      if (ti >= 0) { sel = ti; pop(toys[sel].name, toys[sel], C.amber); return; }
      if (open(cx, cy)) goTo(cx, cy); else say("A woven wall.");
    });
    K.on(cv, "pointermove", (e) => { const c = cellOf(...pt(e)); hoverCell = c[0] >= 0 && c[1] >= 0 && c[0] < N && c[1] < N ? c : null; });
    K.on(cv, "pointerleave", () => (hoverCell = null));
    const DIR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], a: [-1, 0], d: [1, 0] };
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === " ") { e.preventDefault(); if (!e.repeat) setHold(true); return; }
      if (e.repeat && !DIR[k]) return;
      if (DIR[k]) { held = DIR[k]; nudge(...held); e.preventDefault(); }
      else if (k === "Tab" || k === "q") { swap(); e.preventDefault(); }
      else if (k === "t") twitch();
      else if (k === "s") step();
    });
    K.on(wrap, "keyup", (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (DIR[k]) held = null; if (k === " ") setHold(false); });
    K.on(window, "blur", () => setHold(false));
    K.on(btn("switch"), "click", () => { if (started && !over) swap(); wrap.focus(); });
    K.on(btn("twitch"), "click", () => { if (started && !over) twitch(); wrap.focus(); });
    K.on(btn("step"), "click", () => { if (started && !over) step(); wrap.focus(); });
    const hb = btn("hold");
    K.on(hb, "pointerdown", (e) => { e.preventDefault(); setHold(true); });
    K.on(hb, "pointerup", () => setHold(false));
    K.on(hb, "pointerleave", () => { if (holding) setHold(false); });
    K.on(hb, "click", (e) => { if (e.detail === 0) setHold(!holding); });

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        if (held && !holding && !toys[sel].path.length && Math.hypot(toys[sel].x - toys[sel].px, toys[sel].y - toys[sel].py) < 0.05) nudge(...held);
        update(dt);
        if (unlocked < 2 && t > 12 * speed) { unlock(2); beat("Twitch, and hold", "A twitch is seen without a step: it turns a guest without closing on them (T). And when you need nothing to move at all, the whole pack holds still (hold Space)."); }
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play Labyrinth from above">
      <h2>Labyrinth from above</h2>
      <p class="${PRE}q">“The trapdoor opened on its own.”</p>
      <p class="${PRE}goal">The third night, the Chase. You are the cat; Lila is with you. Herd Noor, Wes and Ana through two rings to the warm centre before dawn.</p>
      <div class="${PRE}legend">
        <div><i style="background:${C.amber}"></i><span>Move: tap a cell; guests run from a toy they see moving</span><kbd>arrows</kbd></div>
        <div><i style="background:${C.cream}"></i><span>Switch toy: stand Lila past a loop door to turn them</span><kbd>Tab</kbd></div>
        <div><i style="background:${C.bone};border:2px dashed ${C.ink};box-sizing:border-box"></i><span>Never closer than a step: they freeze, and three freezes cost a memory</span><span></span></div>
      </div>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>The herd scattered twice. A slower night is ticked for you.</p>
      <label><input type="checkbox" ${losses >= 2 ? "checked" : ""}> Slower night (half speed)</label>
      <button type="button">Go down</button>
    </div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => {
      speed = intro.querySelector("input").checked ? 2 : 1; intro.remove(); started = true; wrap.focus();
      beat("The outer ring", "Come at them from behind, never too close. The door with the turning thread, down the left side, leads back.", "We didn't rush. We didn't pounce. / We herded them.", 6000);
    });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

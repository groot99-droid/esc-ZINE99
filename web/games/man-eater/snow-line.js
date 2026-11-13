// Project: Man Eater — Snow line (2D, scroll, seen from above). Graphic style: aerial reconnaissance photo.
// DESIGN.md section 10, Mode B, cut to one sequence (n3_snow: barracks door to the kennel shed,
// one lamp patrol and the searchlight, plus a drift). His footprints stay: sharp for 90 s, then the
// wind fills them over 30 s. A patrol that crosses a sharp print follows the trail at 1.5 m/s.
// Holding "step in prints" walks in prints already there, 40% slower, and leaves none.

const P = { ink: "#1B1D1F", cream: "#D9D2BF", snow: "#EEF1F2", print: "#7C8C99" };
const WW = 64, WH = 44;
const CHANGE = 24, STRENGTH = 50 + 0.5 * CHANGE;
const SPEED = 1.2 + 0.006 * STRENGTH; // m/s
const STRIDE = (75 + 0.7 * CHANGE) / 100;
const PRINT = (30 + (CHANGE / 80) * 10) / 100;
const START = { x: 11, y: 38.4 };
const GOAL = { x: 54, y: 9.2 };
const BLOCKS = [ // x, y, w, h (metres), label
  [2, 40, 20, 4, "BARRACKS"], [26, 25, 10, 6, "MESS"], [6, 15, 8, 6, "STORE"], [48, 2, 12, 6, "KENNEL SHED"], [44, 33, 8, 5, "LATRINE"],
];
const DRIFT = { x: 40, y: 15, rx: 8, ry: 4.5 };
const LIGHT = { cx: 32, cy: 21, rx: 20, ry: 11, r: 6, period: 20 };
const ROUTE = [[42, 12], [22, 11], [4, 12], [4, 29], [42, 29]];

export default {
  mount(root, api) {
    const K = "man-eater-snow-line-";
    const reduce = api.reducedMotion;
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;background:#0e0f10;color:${P.cream};font-family:'Courier Prime','Courier New',monospace;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .${K}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(14,15,16,.8);z-index:3;padding:16px}
      .${K}panel{max-width:540px;background:${P.snow};color:${P.ink};padding:22px;box-shadow:0 20px 50px rgba(0,0,0,.6);border:10px solid #111}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:28px;letter-spacing:.06em;text-transform:uppercase}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      .${K}panel small{display:block;font-size:12.5px;color:#4a4f52;margin-bottom:12px}
      .${K}wrap button{font:inherit;font-weight:700;background:${P.ink};color:${P.snow};border:0;padding:11px 16px;cursor:pointer;letter-spacing:.04em}
      .${K}wrap button:focus-visible{outline:3px solid #D9A441;outline-offset:2px}
      .${K}step{position:absolute;right:12px;bottom:12px;z-index:2;min-height:48px;background:rgba(27,29,31,.8)!important;border:1px solid rgba(238,241,242,.5)!important}
      .${K}step[aria-pressed=true]{background:${P.snow}!important;color:${P.ink}!important}
    </style>
    <canvas tabindex="0" aria-label="An overhead photograph of the yard at night; your footprints stay in the snow"></canvas>
    <button class="${K}step" type="button" aria-pressed="false">Step in prints</button>
    <div class="${K}intro"><div class="${K}panel">
      <h2>Snow line</h2>
      <p>Night 3. Cross the yard from the barracks to the kennel shed at the top right. <b>Your footprints stay.</b> A lamp patrol that finds a fresh print follows it to you; the searchlight raises the alarm after one second inside it.</p>
      <p>Step in prints that are already there to leave no new ones, 40% slower. Prints stay sharp for 90 seconds, then the wind fills them. The shadow beside a building hides you from the searchlight.</p>
      <small>Arrows or WASD to move, hold Shift to step in prints. Or press and hold on the photo to walk toward that point. Two retries from the last cover.</small>
      <button type="button" data-start>Start</button>
    </div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const intro = wrap.querySelector("." + K + "intro");
    const stepBtn = wrap.querySelector("." + K + "step");

    let W = 0, H = 0, dpr = 1, view = { x: 0, y: 0, s: 10 };
    let base = null, grain = null;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const film = 34;
      const s = Math.min((W - 24) / WW, (H - film * 2 - 16) / WH);
      view = { s, x: (W - WW * s) / 2, y: (H - WH * s) / 2 };
      makeBase();
      draw();
    };
    const ro = new ResizeObserver(resize);

    // a mottled, grainy print of the snow at this size, made once per resize
    function makeBase() {
      const w = Math.max(2, Math.round(WW * view.s)), h = Math.max(2, Math.round(WH * view.s));
      base = document.createElement("canvas"); base.width = w; base.height = h;
      const b = base.getContext("2d");
      const rnd = api.rng(7);
      b.fillStyle = "#c7cbcd"; b.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const x = rnd() * w, y = rnd() * h, r = (0.6 + rnd() * 3) * view.s;
        const g = b.createRadialGradient(x, y, 0, x, y, r);
        const lite = rnd() > 0.45;
        g.addColorStop(0, lite ? "rgba(238,241,242,.55)" : "rgba(124,140,153,.28)"); g.addColorStop(1, "rgba(238,241,242,0)");
        b.fillStyle = g; b.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // wind streaks
      b.strokeStyle = "rgba(238,241,242,.35)"; b.lineWidth = 1;
      for (let i = 0; i < 90; i++) { const x = rnd() * w, y = rnd() * h, l = (2 + rnd() * 6) * view.s; b.beginPath(); b.moveTo(x, y); b.lineTo(x + l, y - l * 0.12); b.stroke(); }
      // trees beyond the fence along the top
      b.fillStyle = "rgba(27,29,31,.8)";
      for (let i = 0; i < 60; i++) { const x = rnd() * w * 0.7, y = rnd() * view.s * 1.2; b.beginPath(); b.arc(x, y, (0.2 + rnd() * 0.5) * view.s, 0, 7); b.fill(); }
      grain = document.createElement("canvas"); grain.width = 160; grain.height = 160;
      const gctx = grain.getContext("2d"); const id = gctx.createImageData(160, 160);
      for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 34; }
      gctx.putImageData(id, 0, 0);
    }

    // ---- state
    let s = null, running = false, over = false, raf = 0, last = 0;
    const keys = { up: false, down: false, left: false, right: false, step: false };
    let pointer = null; // world point to walk toward
    let stepToggle = false;

    function newRun() {
      s = {
        x: START.x, y: START.y, prints: [], dist: 0, left: true, t: 0, warmth: 100,
        retries: 2, cover: { ...START }, lightT: 0, lightIn: 0, seen: 0, msg: "", msgT: 0, frame: 47,
        patrol: freshPatrol(),
      };
    }
    function freshPatrol() { return { x: ROUTE[0][0], y: ROUTE[0][1], wp: 1, mode: "route", follow: -1, ang: 0, lost: 0 }; }
    const say = (m, t = 3) => { s.msg = m; s.msgT = t; };

    const inBlock = (x, y, pad = 0.35) => BLOCKS.some(([bx, by, bw, bh]) => x > bx - pad && x < bx + bw + pad && y > by - pad && y < by + bh + pad);
    const inCover = (x, y) => BLOCKS.some(([bx, by, bw]) => x > bx - 0.4 && x < bx + bw + 0.4 && y > by - 2.2 && y < by);
    const inDrift = (x, y) => ((x - DRIFT.x) / DRIFT.rx) ** 2 + ((y - DRIFT.y) / DRIFT.ry) ** 2 < 1;
    const lightPos = (t) => { const a = (t / LIGHT.period) * Math.PI * 2; return { x: LIGHT.cx + Math.cos(a) * LIGHT.rx, y: LIGHT.cy + Math.sin(a * 2) * LIGHT.ry * 0.6 + Math.sin(a) * LIGHT.ry * 0.4 }; };
    const sharpLife = (p) => (p.deep ? 180 : 90), fillLife = (p) => (p.deep ? 60 : 30);
    const isSharp = (p) => p.age < sharpLife(p);

    function update(dt) {
      s.t += dt; s.lightT += dt;
      if (s.msgT > 0) s.msgT -= dt;
      if (!reduce && Math.floor(s.t / 3) + 47 !== s.frame) s.frame = Math.floor(s.t / 3) + 47;
      // movement
      let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (pointer) { const vx = pointer.x - s.x, vy = pointer.y - s.y, d = Math.hypot(vx, vy); if (d > 0.3) { dx = vx / d; dy = vy / d; } }
      const m = Math.hypot(dx, dy);
      const stepping = keys.step || stepToggle;
      if (m > 0) {
        dx /= m; dy /= m;
        let sp = SPEED * (inDrift(s.x, s.y) ? 0.5 : 1) * (stepping ? 0.6 : 1);
        const nx = Math.max(0.5, Math.min(WW - 0.5, s.x + dx * sp * dt)), ny = Math.max(1.2, Math.min(WH - 0.5, s.y + dy * sp * dt));
        if (!inBlock(nx, ny)) { s.dist += Math.hypot(nx - s.x, ny - s.y); s.x = nx; s.y = ny; }
        else if (!inBlock(nx, s.y)) { s.x = nx; } else if (!inBlock(s.x, ny)) { s.y = ny; }
        s.ang = Math.atan2(dy, dx);
        if (s.dist >= STRIDE) {
          s.dist = 0; s.left = !s.left;
          const inOld = stepping && s.prints.some((p) => Math.hypot(p.x - s.x, p.y - s.y) < 0.6);
          if (!inOld) s.prints.push({ x: s.x, y: s.y, ang: s.ang, left: s.left, age: 0, deep: inDrift(s.x, s.y), id: s.prints.length ? s.prints[s.prints.length - 1].id + 1 : 0 });
        }
      }
      for (const p of s.prints) p.age += dt;
      s.prints = s.prints.filter((p) => p.age < sharpLife(p) + fillLife(p));
      s.warmth -= ((8 - CHANGE / 12.5) / 60) * dt;
      if (inCover(s.x, s.y) && Math.hypot(s.cover.x - s.x, s.cover.y - s.y) > 3) { s.cover = { x: s.x, y: s.y }; say("Cover. The searchlight cannot see you here.", 2); }
      // searchlight
      const L = lightPos(s.lightT);
      if (Math.hypot(L.x - s.x, L.y - s.y) < LIGHT.r && !inCover(s.x, s.y)) { s.lightIn += dt; if (s.lightIn >= 1) return caught("The searchlight held you."); }
      else s.lightIn = 0;
      // patrol
      const pt = s.patrol;
      let tx, ty, sp = 1.1;
      if (pt.mode === "follow") {
        const next = s.prints.find((p) => p.id > pt.follow && isSharp(p));
        const target = s.prints.find((p) => p.id === pt.follow + 1);
        let hold = false;
        if (!target || !isSharp(target)) {
          // the trail is filled, or broken where he stepped in old prints: the wind wins
          if (next && Math.hypot(next.x - pt.x, next.y - pt.y) < 4) { pt.follow = next.id - 1; pt.lost = 0; }
          else if (!next && (pt.lost += dt) < 4) { hold = true; }
          else { pt.mode = "route"; pt.lost = 0; say("The patrol lost the trail.", 2.5); }
        }
        if (pt.mode === "follow" && !hold) { const tg = s.prints.find((p) => p.id === pt.follow + 1); tx = tg.x; ty = tg.y; sp = 1.5; pt.lost = 0; if (Math.hypot(tx - pt.x, ty - pt.y) < 0.3) pt.follow++; }
        if (hold) pt.ang += dt * 1.6; // sweeps the lamp round where the trail ends
      }
      if (pt.mode === "route") {
        [tx, ty] = ROUTE[pt.wp];
        if (Math.hypot(tx - pt.x, ty - pt.y) < 0.3) pt.wp = (pt.wp + 1) % ROUTE.length;
        const hit = s.prints.find((p) => isSharp(p) && Math.hypot(p.x - pt.x, p.y - pt.y) < 0.7);
        if (hit) { pt.mode = "follow"; pt.follow = hit.id; say("The patrol found a fresh print. It is following your trail.", 3); }
      }
      if (tx != null) {
        const vx = tx - pt.x, vy = ty - pt.y, d = Math.hypot(vx, vy);
        if (d > 0.01) { const st = Math.min(d, sp * dt); pt.x += (vx / d) * st; pt.y += (vy / d) * st; pt.ang = Math.atan2(vy, vx); }
      }
      // the lamp: a cone ahead of the patrol
      const vx = s.x - pt.x, vy = s.y - pt.y, d = Math.hypot(vx, vy);
      let da = Math.atan2(vy, vx) - pt.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      const lit = d < 7 && Math.abs(da) < 0.36;
      if (lit || d < 1.2) { s.seen += dt; if (s.seen > 0.6) return caught("The patrol's lamp found you."); } else s.seen = Math.max(0, s.seen - dt);
      if (s.warmth <= 0) return caught("The cold stopped you.");
      if (Math.hypot(GOAL.x - s.x, GOAL.y - s.y) < 1.6) finish(true);
    }
    function caught(why) {
      if (s.retries > 0) {
        s.retries--;
        s.x = s.cover.x; s.y = s.cover.y; s.patrol = freshPatrol(); s.seen = 0; s.lightIn = 0; s.lightT += 7;
        s.prints = s.prints.filter((p) => p.age > 60); // only old prints are left in the photo
        say(`${why} Back to the last cover (${s.retries} retries left).`, 3.5);
        pointer = null;
        return;
      }
      finish(false, `${why} Fisk is walked back to the bunk. Suspicion +25; the curfew break is logged as seen.`);
    }
    function finish(win, text) {
      if (over) return;
      over = true; running = false; cancelAnimationFrame(raf); draw();
      const sharp = s.prints.filter(isSharp).length;
      api.end({ outcome: win ? "win" : "lose", text: win ? `The kennel shed, with no dogs. Inside, the first bunkmate's boots, laces still tied. Behind you ${sharp} sharp prints lead here from the barracks door.` : text });
    }

    // ---- drawing
    const X = (m) => view.x + m * view.s, Y = (m) => view.y + m * view.s;
    function footprint(p) {
      const sz = PRINT * view.s * 1.7; // drawn larger than life so a print reads on the photo
      const off = (p.left ? 1 : -1) * 0.12 * view.s;
      const life = sharpLife(p);
      const fill = p.age < life ? 1 : Math.max(0, 1 - (p.age - life) / fillLife(p));
      const sharp = p.age < life;
      ctx.save();
      ctx.translate(X(p.x) - Math.sin(p.ang) * off, Y(p.y) + Math.cos(p.ang) * off);
      ctx.rotate(p.ang + Math.PI / 2);
      ctx.globalAlpha = 0.25 + 0.75 * fill;
      ctx.fillStyle = sharp ? "#3f4a52" : P.print;
      ctx.beginPath(); ctx.ellipse(0, -sz * 0.18, Math.max(1.2, sz * 0.2), Math.max(1.6, sz * 0.32), 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, sz * 0.32, Math.max(1, sz * 0.15), Math.max(1, sz * 0.16), 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    function draw() {
      if (!W || !H || !base) return;
      if (!s) newRun();
      ctx.fillStyle = "#0e0f10"; ctx.fillRect(0, 0, W, H);
      // film edges with sprocket holes and frame numbers
      ctx.fillStyle = "#1e2022";
      const hole = Math.max(8, Math.min(16, W / 60));
      for (let x = 6; x < W; x += hole * 2) { ctx.fillRect(x, 8, hole, hole * 0.7); ctx.fillRect(x, H - 8 - hole * 0.7, hole, hole * 0.7); }
      ctx.drawImage(base, view.x, view.y);
      // drift
      ctx.fillStyle = "rgba(238,241,242,.45)"; ctx.beginPath(); ctx.ellipse(X(DRIFT.x), Y(DRIFT.y), DRIFT.rx * view.s, DRIFT.ry * view.s, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(124,140,153,.6)"; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
      // fence along the top, with posts
      ctx.strokeStyle = "rgba(27,29,31,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(WW), Y(0.6)); ctx.stroke();
      for (let m = 1; m < WW; m += 3) { ctx.fillStyle = P.ink; ctx.fillRect(X(m) - 1.5, Y(1 - m / WW * 0.4) - 1.5, 3, 3); }
      // prints
      for (const p of s.prints) footprint(p);
      // buildings, seen from above with a cast side
      for (const [bx, by, bw, bh, label] of BLOCKS) {
        const dd = 0.9 * view.s;
        // cover: the building's own shadow on the snow, hatched as an interpreter marks it
        ctx.save(); ctx.beginPath(); ctx.rect(X(bx) - 2, Y(by) - 2.2 * view.s, bw * view.s + 4, 2.2 * view.s); ctx.clip();
        ctx.fillStyle = "rgba(27,29,31,.16)"; ctx.fill();
        ctx.strokeStyle = "rgba(27,29,31,.35)"; ctx.lineWidth = 1; ctx.beginPath();
        for (let hx = X(bx) - 2.2 * view.s; hx < X(bx + bw) + 4; hx += 6) { ctx.moveTo(hx, Y(by)); ctx.lineTo(hx + 2.2 * view.s, Y(by) - 2.2 * view.s); }
        ctx.stroke(); ctx.restore();
        ctx.fillStyle = "#5b6064"; ctx.beginPath(); ctx.moveTo(X(bx + bw), Y(by)); ctx.lineTo(X(bx + bw) + dd, Y(by) + dd); ctx.lineTo(X(bx + bw) + dd, Y(by + bh) + dd); ctx.lineTo(X(bx) + dd, Y(by + bh) + dd); ctx.lineTo(X(bx), Y(by + bh)); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#8f9599"; ctx.fillRect(X(bx), Y(by), bw * view.s, bh * view.s);
        ctx.strokeStyle = "rgba(27,29,31,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(bx), Y(by + bh / 2)); ctx.lineTo(X(bx + bw), Y(by + bh / 2)); ctx.stroke();
        ctx.fillStyle = "rgba(27,29,31,.8)"; ctx.font = `700 ${Math.max(8, view.s * 0.75)}px 'Courier Prime',monospace`; ctx.textAlign = "center";
        ctx.fillText(label, X(bx + bw / 2), Y(by + bh / 2) - 3, bw * view.s - 4); ctx.textAlign = "start";
      }
      // the goal mark, as an interpreter's grease-pencil circle
      ctx.strokeStyle = "#1B1D1F"; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.arc(X(GOAL.x), Y(GOAL.y), 1.6 * view.s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      // searchlight
      const L = lightPos(s.lightT);
      const g = ctx.createRadialGradient(X(L.x), Y(L.y), 0, X(L.x), Y(L.y), LIGHT.r * view.s);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.75, "rgba(250,250,248,.7)"); g.addColorStop(1, "rgba(250,250,248,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(L.x), Y(L.y), LIGHT.r * view.s, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(27,29,31,.35)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(27,29,31,.6)"; ctx.font = "10px 'Courier Prime',monospace"; ctx.textAlign = "center"; ctx.fillText("SEARCHLIGHT", X(L.x), Y(L.y) + 3); ctx.textAlign = "start";
      // patrol and its lamp
      const pt = s.patrol;
      ctx.save(); ctx.translate(X(pt.x), Y(pt.y)); ctx.rotate(pt.ang);
      const cg = ctx.createLinearGradient(0, 0, 7 * view.s, 0); cg.addColorStop(0, "rgba(217,210,191,.95)"); cg.addColorStop(1, "rgba(217,210,191,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 7 * view.s, -0.36, 0.36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(27,29,31,.45)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y), Math.max(4, 0.42 * view.s), 0, 7); ctx.fill();
      ctx.fillStyle = P.snow; ctx.beginPath(); ctx.arc(X(pt.x) + Math.cos(pt.ang) * 0.42 * view.s, Y(pt.y) + Math.sin(pt.ang) * 0.42 * view.s, 2.2, 0, 7); ctx.fill();
      if (pt.mode === "follow") { ctx.fillStyle = P.ink; ctx.font = "700 11px 'Courier Prime',monospace"; ctx.fillText("FOLLOWING", X(pt.x) + 8, Y(pt.y) - 8); }
      // Fisk: a dark dot with a breath plume
      const br = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(s.t * 2.4);
      ctx.fillStyle = `rgba(238,241,242,${0.35 + 0.35 * br})`;
      ctx.beginPath(); ctx.ellipse(X(s.x) + Math.cos((s.ang || -1.57)) * 0.7 * view.s, Y(s.y) + Math.sin(s.ang || -1.57) * 0.7 * view.s, (0.35 + 0.25 * br) * view.s, 0.3 * view.s, s.ang || 0, 0, 7); ctx.fill();
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), Math.max(4, 0.38 * view.s), 0, 7); ctx.fill();
      if (s.lightIn > 0 || s.seen > 0) { ctx.strokeStyle = "#9b2f22"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), 0.9 * view.s, 0, 7); ctx.stroke(); }
      // grain
      if (grain) { ctx.save(); ctx.globalAlpha = 0.9; const ox = reduce ? 0 : (s.frame * 37) % 160, oy = reduce ? 0 : (s.frame * 53) % 160;
        ctx.beginPath(); ctx.rect(view.x, view.y, WW * view.s, WH * view.s); ctx.clip();
        for (let x = view.x - ox; x < view.x + WW * view.s; x += 160) for (let y = view.y - oy; y < view.y + WH * view.s; y += 160) ctx.drawImage(grain, x, y);
        ctx.restore(); }
      // grid ticks
      ctx.strokeStyle = "rgba(27,29,31,.55)"; ctx.lineWidth = 1;
      for (let mx = 8; mx < WW; mx += 8) for (let my = 8; my < WH; my += 8) { ctx.beginPath(); ctx.moveTo(X(mx) - 4, Y(my)); ctx.lineTo(X(mx) + 4, Y(my)); ctx.moveTo(X(mx), Y(my) - 4); ctx.lineTo(X(mx), Y(my) + 4); ctx.stroke(); }
      // photo labels
      ctx.font = `${W < 480 ? 9 : 11}px 'Courier Prime',monospace`; ctx.fillStyle = P.ink;
      ctx.fillText(`N3 2247H YARD 1:600 · RETRIES ${s.retries}`, view.x + 6, view.y + WH * view.s - 6);
      ctx.fillStyle = P.cream; ctx.textAlign = "center";
      ctx.fillText(`FRAME ${String(s.frame).padStart(3, "0")}`, W * 0.25, H - 8 - hole - 4);
      ctx.fillText(`FRAME ${String(s.frame + 1).padStart(3, "0")}`, W * 0.75, H - 8 - hole - 4);
      ctx.textAlign = "start";
      // warmth: a thin line of breath along the top edge
      const bw = Math.max(0, s.warmth) / 100 * Math.min(180, W * 0.3);
      ctx.fillStyle = P.snow; ctx.fillRect(W / 2 - bw / 2, view.y - 6, bw, 2);
      if (s.msgT > 0) {
        ctx.font = `700 ${W < 480 ? 11 : 13}px 'Courier Prime',monospace`;
        const tw = Math.min(W - 24, ctx.measureText(s.msg).width + 20);
        ctx.fillStyle = "rgba(27,29,31,.85)"; ctx.fillRect(W / 2 - tw / 2, view.y + 10, tw, 26);
        ctx.fillStyle = P.snow; ctx.textAlign = "center"; ctx.fillText(s.msg, W / 2, view.y + 28, tw - 12); ctx.textAlign = "start";
      }
    }
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      update(dt);
      if (running) { draw(); raf = requestAnimationFrame(frame); }
    }

    // ---- input
    const km = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", Shift: "step" };
    const onKey = (e) => { if (!running) return; const k = km[e.key]; if (!k) return; keys[k] = e.type === "keydown"; e.preventDefault(); if (k !== "step") pointer = null; };
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    const toWorld = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - view.x) / view.s, y: (e.clientY - r.top - view.y) / view.s }; };
    let ptrId = null;
    const pd = (e) => { if (!running) return; ptrId = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } pointer = toWorld(e); e.preventDefault(); };
    const pm = (e) => { if (e.pointerId === ptrId && pointer) pointer = toWorld(e); };
    const pu = (e) => { if (e.pointerId === ptrId) { pointer = null; ptrId = null; } };
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm); cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    const toggle = () => { stepToggle = !stepToggle; stepBtn.setAttribute("aria-pressed", String(stepToggle)); };
    stepBtn.addEventListener("click", toggle);
    const blur = () => { for (const k in keys) keys[k] = false; pointer = null; };
    window.addEventListener("blur", blur);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { newRun(); intro.remove(); running = true; last = performance.now(); raf = requestAnimationFrame(frame); cv.focus(); };
    startBtn.addEventListener("click", start);

    ro.observe(wrap); resize();
    const t0 = setTimeout(() => startBtn.focus(), 30);

    return {
      unmount() {
        running = false; over = true; cancelAnimationFrame(raf); clearTimeout(t0); ro.disconnect();
        window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); window.removeEventListener("blur", blur);
        cv.removeEventListener("pointerdown", pd); cv.removeEventListener("pointermove", pm); cv.removeEventListener("pointerup", pu); cv.removeEventListener("pointercancel", pu);
        stepBtn.removeEventListener("click", toggle); startBtn.removeEventListener("click", start);
        wrap.remove();
      },
    };
  },
};

// Project: Man Eater — Snow line (2D, scroll, seen from above). Graphic style: aerial reconnaissance photo.
// DESIGN.md section 10, Mode B, cut to one sequence (n3_snow: barracks door to the kennel shed,
// one lamp patrol and the searchlight, plus a drift). His footprints stay: sharp for 90 s, then the
// wind fills them over 30 s. A patrol that crosses a sharp print follows the trail at 1.5 m/s.
// Holding "step in prints" walks in prints already there, 40% slower, and leaves none.
//
// Actions: walk; step in prints (the design's); lie flat in the snow (added: three times, the
// searchlight passes over, the cold bites four times faster); open the shed door (the design's interact).
// Phases: the yard; the wind gets up past the mess (prints fill twice as fast, the searchlight's loop
// tightens); the kennel run. Beats: the opening, the trail found, the wind, the mess window, the boots.

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
const FLATS = 3, FLAT_MAX = 5;

export default {
  mount(root, api) {
    const K = "man-eater-snow-line-";
    const reduce = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;background:#0e0f10;color:${P.cream};font-family:'Courier Prime','Courier New',monospace;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .${K}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(14,15,16,.84);z-index:3;padding:16px;overflow:auto}
      .${K}mount{width:min(540px,100%);box-sizing:border-box;background:#111;padding:22px 16px;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.7)}
      .${K}mount::before,.${K}mount::after{content:"";position:absolute;left:8px;right:8px;height:10px;background:repeating-linear-gradient(90deg,#2a2d30 0 12px,transparent 12px 22px)}
      .${K}mount::before{top:6px}.${K}mount::after{bottom:6px}
      .${K}card{background:${P.snow};color:${P.ink};padding:16px 18px 14px;background-image:repeating-linear-gradient(0deg,transparent 0 23px,rgba(124,140,153,.25) 23px 24px)}
      .${K}tag{display:flex;justify-content:space-between;gap:8px;font-size:12px;letter-spacing:.14em;border-bottom:2px solid ${P.ink};padding-bottom:6px;margin-bottom:8px;flex-wrap:wrap}
      .${K}card h2{margin:0 0 4px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(28px,7vw,36px);letter-spacing:.06em;text-transform:uppercase;line-height:1}
      .${K}goal{margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 10px;font-size:14px;line-height:1.45;font-style:italic}
      .${K}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 10px;font-size:14px;line-height:1.3}
      .${K}key dt{font-weight:700;white-space:nowrap;color:#9b2f22}
      .${K}key dd{margin:0}
      .${K}note{margin:0 0 12px;font-size:14px;line-height:1.4}
      .${K}wrap button{font:inherit;font-weight:700;background:${P.ink};color:${P.snow};border:0;padding:11px 16px;cursor:pointer;letter-spacing:.04em;font-size:15px}
      .${K}wrap button:hover{filter:brightness(1.25)}
      .${K}wrap button:focus-visible{outline:3px solid #D9A441;outline-offset:2px}
      .${K}acts{position:absolute;right:10px;bottom:10px;z-index:2;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100% - 20px)}
      .${K}acts button{min-height:48px;background:rgba(27,29,31,.86);border:1px solid rgba(238,241,242,.55);transition:background .1s,opacity .3s}
      .${K}acts button[aria-pressed=true]{background:${P.snow};color:${P.ink}}
      .${K}acts button[hidden]{display:none}
      .${K}acts button[disabled]{opacity:.4;cursor:not-allowed}
      .${K}acts button.new{animation:${K}new 1s ease-in-out 3}
      @keyframes ${K}new{50%{background:${P.snow};color:${P.ink}}}
      @media (max-width:520px){.${K}acts button{padding:8px 10px;font-size:14px}}
    </style>
    <canvas tabindex="0" aria-label="An overhead photograph of the yard at night; your footprints stay in the snow"></canvas>
    <div class="${K}acts">
      <button class="${K}flat" type="button" hidden>Lie flat · ${FLATS}</button>
      <button class="${K}step" type="button" aria-pressed="false" hidden>Step in prints</button>
      <button class="${K}open" type="button" hidden>Open the shed</button>
    </div>
    <div class="${K}intro"><div class="${K}mount"><div class="${K}card">
      <div class="${K}tag"><span>SORTIE N3 · 22:47 H</span><span>YARD 1:600</span><span>FRAME 047</span></div>
      <h2>Snow line</h2>
      <p class="${K}goal">Cross the yard to the kennel shed, top right, without being followed there.</p>
      <p class="${K}beat">Night 3. The first bunkmate was “transferred”. Transferred men take their boots. If his are still on the base, someone lied.</p>
      <dl class="${K}key">
        <dt>Arrows · WASD</dt><dd>walk, or press and hold on the photo to walk toward that point</dd>
        <dt>Your prints</dt><dd>stay. A lamp patrol that finds a sharp one follows it</dd>
      </dl>
      <p class="${K}note">The searchlight raises the alarm after one second inside it. The hatched shadow beside a building is cover. More moves come as you need them.</p>
      ${losses >= 2 ? `<p class="${K}note"><label><input type="checkbox" data-easy checked> Story assist: prints fill in 60 s and a fourth chance to lie flat</label></p>` : ""}
      <button type="button" data-start>Go out</button>
    </div></div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const intro = wrap.querySelector("." + K + "intro");
    const stepBtn = wrap.querySelector("." + K + "step"), flatBtn = wrap.querySelector("." + K + "flat"), openBtn = wrap.querySelector("." + K + "open");

    let W = 0, H = 0, dpr = 1, view = { x: 0, y: 0, s: 10, fit: true };
    let base = null, grain = null, lastS = 0;
    const TOP = 58; let BOT = 92; // film margin above (meters) and below (caption; taller on a phone, above the buttons)
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      BOT = W < 560 ? 150 : 92;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fitS = Math.min((W - 24) / WW, (H - TOP - BOT) / WH);
      const s = Math.max(fitS, Math.min(14, (H - TOP - BOT) / WH));
      view.s = s; view.fit = WW * s <= W - 20;
      if (Math.abs(s - lastS) > 0.01) { lastS = s; makeBase(); }
      place();
      draw();
    };
    const ro = new ResizeObserver(resize);
    // the camera: the whole print when it fits, else a window that follows Fisk
    function place() {
      const pw = WW * view.s, ph = WH * view.s;
      const fx = s ? s.x : START.x, fy = s ? s.y : START.y;
      view.x = view.fit ? (W - pw) / 2 : Math.max(W - 10 - pw, Math.min(10, W / 2 - fx * view.s));
      view.y = ph <= H - TOP - BOT ? TOP + (H - TOP - BOT - ph) / 2 : Math.max(H - BOT - ph, Math.min(TOP, (H - BOT + TOP) / 2 - fy * view.s));
    }

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
      b.strokeStyle = "rgba(238,241,242,.35)"; b.lineWidth = 1;
      for (let i = 0; i < 90; i++) { const x = rnd() * w, y = rnd() * h, l = (2 + rnd() * 6) * view.s; b.beginPath(); b.moveTo(x, y); b.lineTo(x + l, y - l * 0.12); b.stroke(); }
      // vehicle ruts along the service road, older than tonight
      b.strokeStyle = "rgba(124,140,153,.35)"; b.lineWidth = Math.max(1, view.s * 0.18);
      for (const o of [-0.7, 0.7]) { b.beginPath(); b.moveTo(0, (23 + o) * view.s); b.bezierCurveTo(w * 0.3, (22 + o) * view.s, w * 0.6, (24 + o) * view.s, w, (21 + o) * view.s); b.stroke(); }
      b.fillStyle = "rgba(27,29,31,.8)";
      for (let i = 0; i < 60; i++) { const x = rnd() * w * 0.7, y = rnd() * view.s * 1.2; b.beginPath(); b.arc(x, y, (0.2 + rnd() * 0.5) * view.s, 0, 7); b.fill(); }
      // vignetting of an aerial lens
      const vg = b.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
      vg.addColorStop(0, "rgba(27,29,31,0)"); vg.addColorStop(1, "rgba(27,29,31,.28)");
      b.fillStyle = vg; b.fillRect(0, 0, w, h);
      grain = document.createElement("canvas"); grain.width = 160; grain.height = 160;
      const gctx = grain.getContext("2d"); const id = gctx.createImageData(160, 160);
      for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 34; }
      gctx.putImageData(id, 0, 0);
    }

    // ---- state
    let s = null, running = false, over = false, raf = 0, last = 0, easy = false;
    const keys = { up: false, down: false, left: false, right: false, step: false };
    let pointer = null;
    let stepToggle = false;
    const unlocked = { step: false, flat: false };

    function newRun() {
      s = {
        x: START.x, y: START.y, prints: [], dist: 0, left: true, t: 0, warmth: 100,
        retries: 2, cover: { ...START }, lightT: 0, lightIn: 0, seen: 0, msg: "", msgT: 0, frame: 47,
        patrol: freshPatrol(), flats: easy ? FLATS + 1 : FLATS, flat: 0, windy: false, beats: {}, mark: null, markT: 0, caughtN: 0,
      };
    }
    function freshPatrol() { return { x: ROUTE[0][0], y: ROUTE[0][1], wp: 1, mode: "route", follow: -1, ang: 0, lost: 0 }; }
    const say = (m, t = 4) => { s.msg = m; s.msgT = t; };
    const beat = (id, m, t = 5.5) => { if (s.beats[id]) return false; s.beats[id] = true; say(m, t); return true; };
    const markAt = (x, y, label) => { s.mark = { x, y, label }; s.markT = 2.2; };
    function unlock(k, btn, line) {
      if (unlocked[k]) return;
      unlocked[k] = true; btn.hidden = false; if (!reduce) btn.classList.add("new");
      say(line, 6);
    }

    const inBlock = (x, y, pad = 0.35) => BLOCKS.some(([bx, by, bw, bh]) => x > bx - pad && x < bx + bw + pad && y > by - pad && y < by + bh + pad);
    const inCover = (x, y) => BLOCKS.some(([bx, by, bw]) => x > bx - 0.4 && x < bx + bw + 0.4 && y > by - 2.2 && y < by);
    const inDrift = (x, y) => ((x - DRIFT.x) / DRIFT.rx) ** 2 + ((y - DRIFT.y) / DRIFT.ry) ** 2 < 1;
    const period = () => (s.windy ? 15 : LIGHT.period);
    const lightPos = (t) => { const a = (t / period()) * Math.PI * 2; return { x: LIGHT.cx + Math.cos(a) * LIGHT.rx, y: LIGHT.cy + Math.sin(a * 2) * LIGHT.ry * 0.6 + Math.sin(a) * LIGHT.ry * 0.4 }; };
    const windK = () => (s && s.windy ? 0.5 : 1) * (easy ? 0.66 : 1);
    const sharpLife = (p) => (p.deep ? 180 : 90) * windK(), fillLife = (p) => (p.deep ? 60 : 30) * windK();
    const isSharp = (p) => p.age < sharpLife(p);
    const atDoor = () => Math.hypot(GOAL.x - s.x, GOAL.y - s.y) < 2.2;

    function update(dt) {
      s.t += dt;
      if (s.msgT > 0) s.msgT -= dt;
      if (s.markT > 0) s.markT -= dt;
      if (!reduce) s.frame = Math.floor(s.t / 3) + 47;
      // lying flat: still, unseen by the searchlight, colder
      if (s.flat > 0) { s.flat -= dt; if (s.flat <= 0) { say("You get up out of the snow, stiff."); flatBtn.setAttribute("aria-pressed", "false"); } }
      s.lightT += dt;
      let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (pointer) { const vx = pointer.x - s.x, vy = pointer.y - s.y, d = Math.hypot(vx, vy); if (d > 0.3) { dx = vx / d; dy = vy / d; } }
      const m = Math.hypot(dx, dy);
      const stepping = (keys.step || stepToggle) && unlocked.step;
      if (m > 0 && s.flat <= 0) {
        dx /= m; dy /= m;
        const sp = SPEED * (inDrift(s.x, s.y) ? 0.5 : 1) * (stepping ? 0.6 : 1);
        const nx = Math.max(0.5, Math.min(WW - 0.5, s.x + dx * sp * dt)), ny = Math.max(1.2, Math.min(WH - 0.5, s.y + dy * sp * dt));
        if (!inBlock(nx, ny)) { s.dist += Math.hypot(nx - s.x, ny - s.y); s.x = nx; s.y = ny; }
        else if (!inBlock(nx, s.y)) { s.x = nx; } else if (!inBlock(s.x, ny)) { s.y = ny; }
        s.ang = Math.atan2(dy, dx);
        if (s.dist >= STRIDE) {
          s.dist = 0; s.left = !s.left;
          const inOld = stepping && s.prints.some((p) => Math.hypot(p.x - s.x, p.y - s.y) < 0.6);
          if (!inOld) s.prints.push({ x: s.x, y: s.y, ang: s.ang, left: s.left, age: 0, deep: inDrift(s.x, s.y), id: s.prints.length ? s.prints[s.prints.length - 1].id + 1 : 0 });
          if (inDrift(s.x, s.y)) beat("drift", "A drift. Half speed, and the prints you leave here are deep: they last twice as long.", 4.5);
        }
      }
      for (const p of s.prints) p.age += dt;
      s.prints = s.prints.filter((p) => p.age < sharpLife(p) + fillLife(p));
      s.warmth -= ((8 - CHANGE / 12.5) / 60) * dt * (s.flat > 0 ? 4 : 1);
      if (inCover(s.x, s.y) && Math.hypot(s.cover.x - s.x, s.cover.y - s.y) > 3) { s.cover = { x: s.x, y: s.y }; if (!beat("cover", "Cover: the hatched shadow beside a building. The searchlight cannot see you here, and a retry starts from here.")) say("Cover.", 1.6); }
      // phases and beats
      if (s.t > 6 && !unlocked.step) unlock("step", stepBtn, "NEW · Step in prints (hold Shift, or the button): walk only in prints already there. 40% slower, and you leave none for the patrol.");
      const L = lightPos(s.lightT);
      if (!unlocked.flat && Math.hypot(L.x - s.x, L.y - s.y) < LIGHT.r + 6) unlock("flat", flatBtn, `NEW · Lie flat (F, or the button): ${s.flats} times tonight. The searchlight passes over you; the cold bites four times as fast.`);
      if (!s.windy && s.y < 25) { s.windy = true; markAt(s.x, s.y, "WIND"); say("The wind gets up from the trees. Your prints fill twice as fast now, and the tower crew quickens the searchlight's loop.", 6); }
      if (s.x > 24 && s.x < 38 && s.y > 30.5 && s.y < 34) beat("mess", "Through the mess window: the chairs are up on the tables for the night, all but one. Nobody has pushed Pell's back in.", 6);
      if (s.y < 13 && s.x > 40) beat("run", "The dog run. The snow inside the wire is smooth: nothing has walked in it all winter.", 5);
      if (atDoor()) { if (openBtn.hidden) { openBtn.hidden = false; if (!reduce) openBtn.classList.add("new"); } beat("door", "The kennel shed door. Press E, or Open the shed.", 4); }
      else openBtn.hidden = true;
      // searchlight
      if (Math.hypot(L.x - s.x, L.y - s.y) < LIGHT.r && !inCover(s.x, s.y) && s.flat <= 0) { s.lightIn += dt; if (s.lightIn >= 1) return caught("The searchlight held you."); }
      else s.lightIn = Math.max(0, s.lightIn - dt * 2);
      // patrol
      const pt = s.patrol;
      let tx, ty, sp = 1.1;
      if (pt.mode === "follow") {
        const next = s.prints.find((p) => p.id > pt.follow && isSharp(p));
        const target = s.prints.find((p) => p.id === pt.follow + 1);
        let hold = false;
        if (!target || !isSharp(target)) {
          if (next && Math.hypot(next.x - pt.x, next.y - pt.y) < 4) { pt.follow = next.id - 1; pt.lost = 0; }
          else if (!next && (pt.lost += dt) < 4) { hold = true; }
          else { pt.mode = "route"; pt.lost = 0; say("The patrol lost the trail. The wind has your prints.", 3); markAt(pt.x, pt.y, "LOST"); }
        }
        if (pt.mode === "follow" && !hold) { const tg = s.prints.find((p) => p.id === pt.follow + 1); tx = tg.x; ty = tg.y; sp = 1.5; pt.lost = 0; if (Math.hypot(tx - pt.x, ty - pt.y) < 0.3) pt.follow++; }
        if (hold) pt.ang += dt * 1.6;
      }
      if (pt.mode === "route") {
        [tx, ty] = ROUTE[pt.wp];
        if (Math.hypot(tx - pt.x, ty - pt.y) < 0.3) pt.wp = (pt.wp + 1) % ROUTE.length;
        const hit = s.prints.find((p) => isSharp(p) && Math.hypot(p.x - pt.x, p.y - pt.y) < 0.7);
        if (hit) {
          pt.mode = "follow"; pt.follow = hit.id; markAt(pt.x, pt.y, "FOLLOWING");
          if (!beat("found", "The patrol's lamp dips to the snow and stays there. It has found your trail, and it is walking it toward you.", 5)) say("The patrol found a fresh print. It is following your trail.", 3);
        }
      }
      if (tx != null) {
        const vx = tx - pt.x, vy = ty - pt.y, d = Math.hypot(vx, vy);
        if (d > 0.01) { const st = Math.min(d, sp * dt); pt.x += (vx / d) * st; pt.y += (vy / d) * st; pt.ang = Math.atan2(vy, vx); }
      }
      const vx = s.x - pt.x, vy = s.y - pt.y, d = Math.hypot(vx, vy);
      let da = Math.atan2(vy, vx) - pt.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
      const lit = d < (s.flat > 0 ? 3 : 7) && Math.abs(da) < 0.36;
      if (lit || d < 1.2) { s.seen += dt; if (s.seen > 0.6) return caught("The patrol's lamp found you."); } else s.seen = Math.max(0, s.seen - dt);
      if (s.warmth <= 0) return caught("The cold stopped you.");
      if (!view.fit || WH * view.s > H - TOP - BOT) place();
    }
    function caught(why) {
      s.caughtN++;
      if (s.retries > 0) {
        s.retries--;
        s.x = s.cover.x; s.y = s.cover.y; s.warmth = Math.max(s.warmth, 50); s.patrol = freshPatrol(); s.seen = 0; s.lightIn = 0; s.lightT += 7; s.flat = 0;
        s.prints = s.prints.filter((p) => p.age > 60);
        say(`${why} Back to the last cover (${s.retries} ${s.retries === 1 ? "retry" : "retries"} left). Only the old prints are left in this frame.`, 5);
        markAt(s.x, s.y, "RETRY");
        pointer = null;
        return;
      }
      api.store.set("losses", losses + 1);
      finish(false, `${why} Fisk is walked back to the bunk past his own prints, which no one bothers to fill. Suspicion +25; the curfew break is logged as seen. The shed stays shut, and “transferred” stays a word.`);
    }
    function openShed() {
      if (!running || !atDoor()) return;
      api.store.set("losses", 0);
      const sharp = s.prints.filter(isSharp).length;
      const trail = sharp > 12 ? `Behind you ${sharp} sharp prints lead here from the barracks door; by morning someone will have read them.` : sharp ? `Behind you only ${sharp} sharp prints are left for anyone to read.` : "Behind you the wind has filled every print. Nobody can say you were here.";
      finish(true, `The kennel shed, with no dogs. On a shelf by the door, the first bunkmate's boots, laces still tied, the way he kept them so he could step straight into them. Transferred men take their boots. ${trail}`);
    }
    function finish(win, text) {
      if (over) return;
      over = true; running = false; cancelAnimationFrame(raf); draw();
      api.end({ outcome: win ? "win" : "lose", text });
    }
    function lieFlat() {
      if (!running || !unlocked.flat) return;
      if (s.flat > 0) { s.flat = 0; flatBtn.setAttribute("aria-pressed", "false"); say("You get up."); return; }
      if (s.flats <= 0) { say("You have nothing left to lie in the snow with. Your coat is soaked through."); return; }
      s.flats--; s.flat = FLAT_MAX; pointer = null;
      flatBtn.textContent = `Lie flat · ${s.flats}`; flatBtn.setAttribute("aria-pressed", "true");
      if (!s.flats) flatBtn.disabled = true;
      say(`Flat in the snow, face down. The light slides over a white shape among white shapes. Up in ${FLAT_MAX} s, or press F.`, 3.5);
    }

    // ---- drawing
    const X = (m) => view.x + m * view.s, Y = (m) => view.y + m * view.s;
    function footprint(p) {
      const sz = PRINT * view.s * 1.7;
      const off = (p.left ? 1 : -1) * 0.12 * view.s;
      const life = sharpLife(p);
      const fill = p.age < life ? 1 : Math.max(0, 1 - (p.age - life) / fillLife(p));
      const sharp = p.age < life;
      ctx.save();
      ctx.translate(X(p.x) - Math.sin(p.ang) * off, Y(p.y) + Math.cos(p.ang) * off);
      ctx.rotate(p.ang + Math.PI / 2);
      ctx.globalAlpha = 0.25 + 0.75 * fill;
      ctx.fillStyle = sharp ? "#3a444b" : P.print;
      ctx.beginPath(); ctx.ellipse(0, -sz * 0.18, Math.max(1.6, sz * 0.2), Math.max(2, sz * 0.32), 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, sz * 0.32, Math.max(1.3, sz * 0.15), Math.max(1.3, sz * 0.16), 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    function wrapText(text, maxW) {
      const words = text.split(" "), lines = []; let line = "";
      for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
      if (line) lines.push(line); return lines;
    }
    function draw() {
      if (!W || !H || !base) return;
      if (!s) newRun();
      const narrow = W < 560;
      ctx.fillStyle = "#0e0f10"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#1e2022";
      const hole = Math.max(8, Math.min(16, W / 60));
      for (let x = 6; x < W; x += hole * 2) { ctx.fillRect(x, 6, hole, hole * 0.7); ctx.fillRect(x, H - 6 - hole * 0.7, hole, hole * 0.7); }
      ctx.save(); ctx.beginPath(); ctx.rect(0, TOP - 4, W, H - TOP - BOT + 8); ctx.clip();
      ctx.drawImage(base, view.x, view.y);
      ctx.fillStyle = "rgba(238,241,242,.45)"; ctx.beginPath(); ctx.ellipse(X(DRIFT.x), Y(DRIFT.y), DRIFT.rx * view.s, DRIFT.ry * view.s, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(124,140,153,.6)"; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(27,29,31,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(WW), Y(0.6)); ctx.stroke();
      for (let m = 1; m < WW; m += 3) { ctx.fillStyle = P.ink; ctx.fillRect(X(m) - 1.5, Y(1 - m / WW * 0.4) - 1.5, 3, 3); }
      // the empty dog run beside the shed
      ctx.strokeStyle = "rgba(27,29,31,.5)"; ctx.setLineDash([2, 3]); ctx.strokeRect(X(40), Y(3), 7 * view.s, 8 * view.s); ctx.setLineDash([]);
      for (const p of s.prints) footprint(p);
      for (const [bx, by, bw, bh, label] of BLOCKS) {
        const dd = 0.9 * view.s;
        ctx.save(); ctx.beginPath(); ctx.rect(X(bx) - 2, Y(by) - 2.2 * view.s, bw * view.s + 4, 2.2 * view.s); ctx.clip();
        ctx.fillStyle = "rgba(27,29,31,.18)"; ctx.fill();
        ctx.strokeStyle = "rgba(27,29,31,.4)"; ctx.lineWidth = 1; ctx.beginPath();
        for (let hx = X(bx) - 2.2 * view.s; hx < X(bx + bw) + 4; hx += 6) { ctx.moveTo(hx, Y(by)); ctx.lineTo(hx + 2.2 * view.s, Y(by) - 2.2 * view.s); }
        ctx.stroke(); ctx.restore();
        ctx.fillStyle = "#5b6064"; ctx.beginPath(); ctx.moveTo(X(bx + bw), Y(by)); ctx.lineTo(X(bx + bw) + dd, Y(by) + dd); ctx.lineTo(X(bx + bw) + dd, Y(by + bh) + dd); ctx.lineTo(X(bx) + dd, Y(by + bh) + dd); ctx.lineTo(X(bx), Y(by + bh)); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#8f9599"; ctx.fillRect(X(bx), Y(by), bw * view.s, bh * view.s);
        ctx.strokeStyle = "rgba(27,29,31,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(bx), Y(by + bh / 2)); ctx.lineTo(X(bx + bw), Y(by + bh / 2)); ctx.stroke();
        ctx.fillStyle = "rgba(27,29,31,.88)"; ctx.font = `700 ${Math.max(12, view.s * 0.75)}px 'Courier Prime',monospace`; ctx.textAlign = "center";
        ctx.fillText(label, X(bx + bw / 2), Y(by + bh / 2) - 4, bw * view.s - 4); ctx.textAlign = "start";
      }
      // the goal: an interpreter's grease-pencil ring and arrow
      ctx.strokeStyle = "#9b2f22"; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.arc(X(GOAL.x), Y(GOAL.y), 1.8 * view.s, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#9b2f22"; ctx.font = "700 13px 'Courier Prime',monospace"; ctx.fillText("DOOR", X(GOAL.x) + 2 * view.s, Y(GOAL.y) + 4);
      // searchlight, with a ring that closes as it holds him
      const L = lightPos(s.lightT);
      const g = ctx.createRadialGradient(X(L.x), Y(L.y), 0, X(L.x), Y(L.y), LIGHT.r * view.s);
      g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.75, "rgba(250,250,248,.7)"); g.addColorStop(1, "rgba(250,250,248,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X(L.x), Y(L.y), LIGHT.r * view.s, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(27,29,31,.4)"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
      // patrol and its lamp
      const pt = s.patrol;
      ctx.save(); ctx.translate(X(pt.x), Y(pt.y)); ctx.rotate(pt.ang);
      const cg = ctx.createLinearGradient(0, 0, 7 * view.s, 0); cg.addColorStop(0, "rgba(217,210,191,.95)"); cg.addColorStop(1, "rgba(217,210,191,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 7 * view.s, -0.36, 0.36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = pt.mode === "follow" ? "rgba(155,47,34,.8)" : "rgba(27,29,31,.45)"; ctx.lineWidth = pt.mode === "follow" ? 2 : 1; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y), Math.max(5, 0.42 * view.s), 0, 7); ctx.fill();
      ctx.fillStyle = P.snow; ctx.beginPath(); ctx.arc(X(pt.x) + Math.cos(pt.ang) * 0.42 * view.s, Y(pt.y) + Math.sin(pt.ang) * 0.42 * view.s, 2.2, 0, 7); ctx.fill();
      // Fisk: a dark dot with a breath plume (a long smudge when flat)
      const br = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(s.t * 2.4);
      if (s.flat > 0) {
        ctx.fillStyle = "rgba(27,29,31,.55)"; ctx.beginPath(); ctx.ellipse(X(s.x), Y(s.y), 0.9 * view.s, 0.35 * view.s, s.ang || 0, 0, 7); ctx.fill();
      } else {
        ctx.fillStyle = `rgba(238,241,242,${0.35 + 0.35 * br})`;
        ctx.beginPath(); ctx.ellipse(X(s.x) + Math.cos((s.ang || -1.57)) * 0.7 * view.s, Y(s.y) + Math.sin(s.ang || -1.57) * 0.7 * view.s, (0.35 + 0.25 * br) * view.s, 0.3 * view.s, s.ang || 0, 0, 7); ctx.fill();
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), Math.max(5, 0.4 * view.s), 0, 7); ctx.fill();
      }
      if (inCover(s.x, s.y)) { ctx.strokeStyle = P.ink; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), 1.1 * view.s, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      const danger = Math.max(s.lightIn, s.seen / 0.6);
      if (danger > 0) { ctx.strokeStyle = "#9b2f22"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(s.x), Y(s.y), 1.1 * view.s + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, danger)); ctx.stroke(); }
      // grain
      if (grain) { ctx.save(); ctx.globalAlpha = 0.9; const ox = reduce ? 0 : (s.frame * 37) % 160, oy = reduce ? 0 : (s.frame * 53) % 160;
        ctx.beginPath(); ctx.rect(view.x, view.y, WW * view.s, WH * view.s); ctx.clip();
        for (let x = view.x - ox; x < view.x + WW * view.s; x += 160) for (let y = view.y - oy; y < view.y + WH * view.s; y += 160) ctx.drawImage(grain, x, y);
        ctx.restore(); }
      ctx.strokeStyle = "rgba(27,29,31,.55)"; ctx.lineWidth = 1;
      for (let mx = 8; mx < WW; mx += 8) for (let my = 8; my < WH; my += 8) { ctx.beginPath(); ctx.moveTo(X(mx) - 4, Y(my)); ctx.lineTo(X(mx) + 4, Y(my)); ctx.moveTo(X(mx), Y(my) - 4); ctx.lineTo(X(mx), Y(my) + 4); ctx.stroke(); }
      // interpreter's grease-pencil marks for events
      if (s.mark && s.markT > 0) {
        ctx.globalAlpha = Math.min(1, s.markT);
        ctx.strokeStyle = "#9b2f22"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X(s.mark.x), Y(s.mark.y), 2.2 * view.s * (reduce ? 1 : 1 + (2.2 - s.markT) * 0.15), 0, 7); ctx.stroke();
        ctx.fillStyle = "#9b2f22"; ctx.font = "700 14px 'Courier Prime',monospace"; ctx.fillText(s.mark.label, X(s.mark.x) + 2.4 * view.s, Y(s.mark.y) - 6);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      // ---- top margin: meters printed on the film edge
      const mY = 30, cols = narrow ? 3 : 5, cw = (W - 28) / cols;
      const meter = (i, label, v, val, hot) => {
        const x = 14 + i * cw;
        ctx.font = "12px 'Courier Prime',monospace"; ctx.fillStyle = "rgba(217,210,191,.85)"; ctx.fillText(label, x, mY);
        ctx.font = "700 13px 'Courier Prime',monospace"; ctx.fillStyle = hot ? P.snow : P.cream; ctx.textAlign = "right"; ctx.fillText(val, x + cw - 26, mY); ctx.textAlign = "start";
        if (v != null) { ctx.fillStyle = "rgba(217,210,191,.2)"; ctx.fillRect(x, mY + 6, cw - 26, 5); ctx.fillStyle = hot ? P.snow : P.cream; ctx.fillRect(x, mY + 6, (cw - 26) * Math.max(0, Math.min(1, v)), 5); }
      };
      meter(0, "BREATH", Math.max(0, s.warmth) / 100, String(Math.max(0, Math.round(s.warmth))), s.flat > 0);
      meter(1, "SEEN", Math.min(1, danger), danger > 0 ? "!" : "no", danger > 0);
      meter(2, "PATROL", null, s.patrol.mode === "follow" ? "TRAILING" : "route", s.patrol.mode === "follow");
      if (!narrow) { meter(3, "WIND", null, s.windy ? "rising" : "still"); meter(4, "RETRIES", null, String(s.retries)); }
      // ---- bottom margin: the interpreter's typed caption
      const cy = H - BOT + 22;
      ctx.font = `${narrow ? 14 : 15}px 'Courier Prime',monospace`; ctx.fillStyle = P.cream;
      const cap = s.msgT > 0 ? s.msg : `Frame ${String(s.frame).padStart(3, "0")} · N3 22:47 H · yard 1:600 · ${s.prints.filter(isSharp).length} sharp prints on the print${narrow ? ` · retries ${s.retries}` : ""}`;
      const lines = wrapText(cap, W - 32 - (narrow ? 0 : 340)).slice(0, 3);
      lines.forEach((l, i) => ctx.fillText(l, 16, cy + i * 19));
    }
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      update(dt);
      if (running) { draw(); raf = requestAnimationFrame(frame); }
    }

    // ---- input
    const km = { ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", Shift: "step" };
    const onKey = (e) => {
      if (!running) return;
      if (e.type === "keydown" && (e.key === "f" || e.key === "F")) { lieFlat(); e.preventDefault(); return; }
      if (e.type === "keydown" && (e.key === "e" || e.key === "E" || e.key === "Enter")) { openShed(); e.preventDefault(); return; }
      const k = km[e.key]; if (!k) return;
      keys[k] = e.type === "keydown"; e.preventDefault(); if (k !== "step") pointer = null;
      if (k === "step") stepBtn.setAttribute("aria-pressed", String(keys.step || stepToggle));
    };
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    const toWorld = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - view.x) / view.s, y: (e.clientY - r.top - view.y) / view.s }; };
    let ptrId = null;
    const pd = (e) => { if (!running) return; ptrId = e.pointerId; try { cv.setPointerCapture(e.pointerId); } catch { /* ok */ } pointer = toWorld(e); e.preventDefault(); };
    const pm = (e) => { if (e.pointerId === ptrId && pointer) pointer = toWorld(e); };
    const pu = (e) => { if (e.pointerId === ptrId) { pointer = null; ptrId = null; } };
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm); cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    const toggle = () => { stepToggle = !stepToggle; stepBtn.classList.remove("new"); stepBtn.setAttribute("aria-pressed", String(stepToggle)); };
    const flatClick = () => { flatBtn.classList.remove("new"); lieFlat(); };
    stepBtn.addEventListener("click", toggle); flatBtn.addEventListener("click", flatClick); openBtn.addEventListener("click", openShed);
    const blur = () => { for (const k in keys) keys[k] = false; pointer = null; };
    window.addEventListener("blur", blur);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => {
      easy = !!intro.querySelector("[data-easy]")?.checked;
      newRun(); intro.remove(); running = true; last = performance.now();
      say("The barracks door shuts behind you. Every step you take from here is written in the snow.", 4.5);
      raf = requestAnimationFrame(frame); cv.focus();
    };
    startBtn.addEventListener("click", start);

    ro.observe(wrap); resize();
    const t0 = setTimeout(() => startBtn.focus(), 30);

    return {
      unmount() {
        running = false; over = true; cancelAnimationFrame(raf); clearTimeout(t0); ro.disconnect();
        window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); window.removeEventListener("blur", blur);
        cv.removeEventListener("pointerdown", pd); cv.removeEventListener("pointermove", pm); cv.removeEventListener("pointerup", pu); cv.removeEventListener("pointercancel", pu);
        stepBtn.removeEventListener("click", toggle); flatBtn.removeEventListener("click", flatClick); openBtn.removeEventListener("click", openShed); startBtn.removeEventListener("click", start);
        wrap.remove();
      },
    };
  },
};

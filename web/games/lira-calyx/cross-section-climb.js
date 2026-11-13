// Cross-section climb (2D, Geological survey section). DESIGN.md section 10, Mode A, cut to one
// sequence modelled on b3-climb: 2 800 to 4 600 m, a camp halfway where Mara hands over her
// rebreather (gear tier 1 to 2), storm fronts with a 3 s warning, storm rock, low gravity above
// 4 000 m. The design has no game over; here a third black-out ends the climb so it can be lost.
const P = "lira-calyx-cross-section-climb-";
const INK = "#3b2618", PAPER = "#f1e8d2", SEAL = "#b3212b", CYAN = "#3fc4d0", VIOLET = "#5a3f7a", SLATE = "#56606a";
const LW = 640, ALT0 = 2800, ALT1 = 4600, S = 1.55; // logical px per metre of altitude
const WORLD_H = (ALT1 - ALT0) * S, TOP = 60, BASE = TOP + WORLD_H;
const yOf = (alt) => BASE - (alt - ALT0) * S;
const altOf = (y) => ALT0 + (BASE - y) / S;

export default {
  mount(root, api) {
    const off = [], timers = [];
    let raf = 0, alive = true;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = PAPER;
    const style = document.createElement("style");
    style.textContent = `
      .${P}wrap{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
      .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .${P}pad{position:absolute;bottom:12px;display:flex;gap:8px;z-index:3}
      .${P}pad.l{left:12px}.${P}pad.r{right:12px}
      .${P}pad button{font:700 13px 'Courier Prime',monospace;color:${INK};background:rgba(241,232,210,.88);border:1.5px solid ${INK};
        min-width:56px;height:52px;border-radius:4px;touch-action:none;cursor:pointer;letter-spacing:.06em}
      .${P}pad button.on{background:${INK};color:${PAPER}}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(241,232,210,.82);z-index:5;padding:16px}
      .${P}card{max-width:460px;background:${PAPER};border:1.5px solid ${INK};padding:18px 20px;box-shadow:4px 4px 0 rgba(59,38,24,.25);color:${INK}}
      .${P}card h2{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px}
      .${P}card p{margin:0 0 10px;font:15px/1.45 Georgia,serif}
      .${P}card kbd{font:700 12px 'Courier Prime',monospace;border:1px solid ${INK};padding:0 4px;border-radius:3px}
      .${P}card button{font:700 14px 'Courier Prime',monospace;background:${INK};color:${PAPER};border:0;padding:10px 20px;cursor:pointer;letter-spacing:.1em}
    `;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const cv = document.createElement("canvas");
    wrap.append(style, cv);
    const padL = document.createElement("div"); padL.className = P + "pad l";
    const padR = document.createElement("div"); padR.className = P + "pad r";
    const mk = (pad, label, key) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.dataset.k = key; b.setAttribute("aria-label", key); pad.appendChild(b); return b; };
    const btns = [mk(padL, "◀", "left"), mk(padL, "▶", "right"), mk(padR, "ANCHOR", "anchor"), mk(padR, "JUMP", "jump")];
    wrap.append(padL, padR);
    root.appendChild(wrap);
    const ctx = cv.getContext("2d");

    // ---- strata patterns (after the pictograph's survey hatching)
    const pat = (bg, draw, size = 16) => {
      const c = document.createElement("canvas"); c.width = c.height = size;
      const g = c.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, size, size); g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 1; draw(g, size);
      return ctx.createPattern(c, "repeat");
    };
    const PATS = [
      ["Moss terrace", pat("#7c8a6a", (g) => { g.beginPath(); g.moveTo(0, 4); g.lineTo(16, 4); g.moveTo(0, 12); g.lineTo(16, 12); g.moveTo(8, 4); g.lineTo(8, 12); g.moveTo(4, 0); g.lineTo(4, 4); g.moveTo(12, 12); g.lineTo(12, 16); g.stroke(); })],
      ["Slate", pat("#8d969c", (g) => { g.lineWidth = 1.4; g.beginPath(); g.moveTo(1, 5); g.lineTo(8, 5); g.moveTo(10, 13); g.lineTo(15, 13); g.stroke(); })],
      ["Rust breccia", pat("#b56a3f", (g) => { g.beginPath(); g.moveTo(3, 3); g.lineTo(7, 7); g.moveTo(7, 3); g.lineTo(3, 7); g.moveTo(11, 11); g.lineTo(15, 15); g.moveTo(15, 11); g.lineTo(11, 15); g.stroke(); })],
      ["Ochre sandstone", pat("#c8913a", (g) => { g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 10); g.lineTo(10, 0); g.stroke(); }, 10)],
      ["Crystal vein", pat("#6e7f8f", (g) => { g.strokeStyle = "#b9d8ea"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 8); g.quadraticCurveTo(4, 3, 8, 8); g.quadraticCurveTo(12, 13, 16, 8); g.stroke(); })],
      ["Ice schist", pat("#9aa9ae", (g) => { g.lineWidth = 0.9; g.beginPath(); g.moveTo(8, 2); g.lineTo(13, 8); g.lineTo(8, 14); g.lineTo(3, 8); g.closePath(); g.stroke(); })],
    ];
    const BAND = 118;

    // ---- the section: ledges, anchors, storm rock, camps
    const rng = api.rng();
    const ledges = [{ x: 48, w: LW - 48, y: BASE, camp: "Base camp", anchor: null, rock: false }];
    let y = BASE, cx = 300;
    const MID = 3700;
    let midDone = false;
    while (y > yOf(ALT1) + 70) {
      y -= 62 + rng() * 16;
      const alt = altOf(y);
      if (!midDone && alt >= MID) {
        midDone = true;
        ledges.push({ x: 140, w: 380, y, camp: "Mara's camp", anchor: 470, rock: false });
        cx = 330; continue;
      }
      cx = Math.max(110, Math.min(LW - 80, cx + (rng() < 0.5 ? -1 : 1) * (60 + rng() * 100)));
      const w = 74 + rng() * 54;
      const L = { x: Math.max(56, cx - w / 2), w, y, camp: null, anchor: null, rock: false };
      if (alt > 3450 && rng() < 0.28 && !ledges[ledges.length - 1].rock) L.rock = true;
      else if (rng() < 0.42) L.anchor = L.x + 14 + rng() * (L.w - 28);
      ledges.push(L);
    }
    ledges.push({ x: 160, w: 340, y: yOf(ALT1), camp: "Summit camp, 4 600 m", anchor: 200, rock: false, goal: true });
    ledges.forEach((L, i) => { L.i = i; L.state = 0; L.t = 0; });

    // ---- state
    const pl = { x: 300, y: BASE, vx: 0, vy: 0, ground: ledges[0], anchored: false, fallFrom: BASE, face: 1, walk: 0 };
    const st = { air: 100, tier: 1, camp: 0, blackouts: 0, best: ALT0, time: 0, msg: "", msgT: 0, storm: { next: 9, warn: 0, x: null, hit: false }, route: [[pl.x, pl.y]], started: false, over: false };
    const keys = { left: false, right: false, jump: false, anchor: false };
    const say = (m, t = 3.2) => { st.msg = m; st.msgT = t; };

    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "jump", w: "jump", W: "jump", " ": "jump", ArrowDown: "anchor", s: "anchor", S: "anchor", Shift: "anchor" };
    on(window, "keydown", (e) => { const k = KEYMAP[e.key]; if (k && st.started) { keys[k] = true; e.preventDefault(); } });
    on(window, "keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
    btns.forEach((b) => {
      const k = b.dataset.k;
      on(b, "pointerdown", (e) => { e.preventDefault(); keys[k] = true; b.classList.add("on"); try { b.setPointerCapture(e.pointerId); } catch {} });
      const up = () => { keys[k] = false; b.classList.remove("on"); };
      on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
    });

    // ---- sizing
    let W = 0, H = 0, dpr = 1, sc = 1, ox = 0, camY = BASE - 400;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      sc = Math.min(W / LW, H / 500);
      ox = (W - LW * sc) / 2;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);

    // ---- helpers
    const lowG = () => altOf(pl.y) >= 4000;
    const drainRate = (alt) => (alt < 2000 ? 0 : alt < 3200 ? 1 : 2.5) / (1 + 0.25 * st.tier);
    const ledgeBelow = () => {
      let best = 0;
      for (const L of ledges) if (L.y >= pl.y - 1 && (best === 0 || L.y < ledges[best].y) && L.state !== 2) best = L.i;
      return best;
    };
    const placeOn = (L) => { pl.x = L.x + L.w / 2; pl.y = L.y; pl.vx = pl.vy = 0; pl.ground = L; pl.fallFrom = L.y; pl.anchored = false; };
    const blackout = (why) => {
      st.blackouts++;
      if (st.blackouts >= 3) { finish(false, why); return; }
      const camp = ledges[st.camp];
      placeOn(camp); st.air = 100; st.time += 25;
      say(`${why} Black-out ${st.blackouts} of 3: you wake at ${camp.camp.toLowerCase()}, 25 s lost.`, 4.5);
    };
    const finish = (won, why) => {
      if (st.over) return;
      st.over = true;
      const mins = Math.floor(st.time / 60), secs = Math.round(st.time % 60);
      const t = `${mins}:${String(secs).padStart(2, "0")}`;
      api.end(won
        ? { outcome: "win", text: `Summit camp, 4 600 m, in ${t} with ${st.blackouts} black-out${st.blackouts === 1 ? "" : "s"}. The dotted route stays in the journal as a page.` }
        : { outcome: "lose", text: `${why} Third black-out at ${Math.round(st.best).toLocaleString("en")} m: Mara calls the climb off. The route ends in a broken line.` });
    };

    // ---- physics
    const update = (dt) => {
      st.time += dt;
      const g = lowG() ? 750 : 1500, maxFall = lowG() ? 330 : 660;
      // anchor
      const near = pl.ground && pl.ground.anchor != null && Math.abs(pl.ground.anchor - pl.x) < 30;
      pl.anchored = keys.anchor && !!pl.ground && near;
      if (keys.anchor && pl.ground && !near && pl.ground.anchor == null && st.msgT <= 0) say("No anchor point on this ledge. Rings are marked ○.", 1.6);
      // move
      const want = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      pl.vx = pl.anchored ? 0 : want * 190;
      if (want) pl.face = want;
      if (keys.jump && pl.ground && !pl.anchored) { pl.vy = -545; pl.ground = null; pl.fallFrom = pl.y; keys.jump = keys.jump && false; }
      if (!pl.ground) pl.vy = Math.min(maxFall, pl.vy + g * dt);
      const ny = pl.y + pl.vy * dt;
      pl.x = Math.max(56, Math.min(LW - 8, pl.x + pl.vx * dt));
      pl.walk += Math.abs(pl.vx) * dt;
      if (pl.ground) {
        if (pl.x < pl.ground.x - 4 || pl.x > pl.ground.x + pl.ground.w + 4 || pl.ground.state === 2) { pl.ground = null; pl.fallFrom = pl.y; pl.vy = 0; }
      } else {
        if (pl.vy < 0) pl.fallFrom = Math.min(pl.fallFrom, ny);
        let landed = null;
        if (pl.vy >= 0) for (const L of ledges) {
          if (L.state === 2) continue;
          if (pl.y <= L.y + 0.5 && ny >= L.y && pl.x >= L.x - 4 && pl.x <= L.x + L.w + 4) { if (!landed || L.y < landed.y) landed = L; }
        }
        if (landed) {
          pl.y = landed.y; pl.vy = 0; pl.ground = landed;
          if (landed.y < st.route[st.route.length - 1][1] - 1) st.route.push([pl.x, landed.y]);
          const drop = landed.y - pl.fallFrom;
          if (drop > 320) { blackout("A long fall."); return; }
          if (landed.rock && landed.state === 0) { landed.state = 1; landed.t = 1.4; say("Storm rock: it flashes twice, then bursts.", 2); }
          if (landed.camp && landed.i > st.camp) {
            st.camp = landed.i; st.air = 100;
            if (landed.goal) { finish(true); return; }
            if (st.tier < 2) { st.tier = 2; say("Mara's camp. Air refilled. She hands you her rebreather: gear tier 2, air lasts 50% longer.", 5); }
          } else if (landed.camp) st.air = 100;
        } else pl.y = ny;
      }
      if (pl.ground && pl.ground.camp) st.air = 100;
      st.best = Math.max(st.best, altOf(pl.y));
      // storm rock
      for (const L of ledges) {
        if (L.state === 1) { L.t -= dt; if (L.t <= 0) { L.state = 2; L.t = 4.5; } }
        else if (L.state === 2) { L.t -= dt; if (L.t <= 0) { L.state = 0; } }
      }
      // air
      st.air -= drainRate(altOf(pl.y)) * dt;
      if (st.air <= 0) { st.air = 0; blackout("Your air runs out."); return; }
      // weather
      const sm = st.storm;
      if (sm.x == null) {
        sm.next -= dt;
        if (sm.next <= 3 && sm.warn === 0) { sm.warn = 1; say("The page edge darkens: storm front in 3 s. Anchor!", 3); }
        if (sm.next <= 0) { sm.x = -260; sm.hit = false; sm.warn = 0; }
      } else {
        sm.x += 520 * dt;
        if (!sm.hit && sm.x + 120 > pl.x && sm.x - 120 < pl.x) {
          sm.hit = true;
          if (pl.anchored) say("Clipped on. The front passes over you.", 2);
          else {
            const tgt = Math.max(0, ledgeBelow() - 2);
            placeOn(ledges[tgt]);
            say("Unanchored in the front: knocked back two ledges.", 2.6);
          }
        }
        if (sm.x > LW + 300) { sm.x = null; sm.next = 20 + rng() * 20; }
      }
      st.msgT -= dt;
    };

    // ---- drawing
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      const viewH = H / sc;
      const target = pl.y - viewH * (W < 600 ? 0.5 : 0.62);
      camY += (target - camY) * 0.12;
      camY = Math.max(TOP - 80, Math.min(BASE + 70 - viewH, camY));
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, -dpr * sc * camY);
      ctx.save(); ctx.beginPath(); ctx.rect(40, camY - 200, LW - 40, viewH + 400); ctx.clip();
      // strata bands, dipping right
      const y0 = camY - 120, y1 = camY + viewH + 140;
      const kStart = Math.floor((y0 - 200) / BAND) - 1, kEnd = Math.ceil((y1 + 200) / BAND) + 1;
      const edge = (k, x) => k * BAND - x * 0.16 + 12 * Math.sin(x / 70 + k * 1.7) + 5 * Math.sin(x / 23 + k);
      for (let k = kStart; k <= kEnd; k++) {
        const pidx = ((k % PATS.length) + PATS.length) % PATS.length;
        ctx.beginPath();
        for (let x = 40; x <= LW + 20; x += 20) ctx.lineTo(x, edge(k, x) + 200);
        for (let x = LW + 20; x >= 40; x -= 20) ctx.lineTo(x, edge(k + 1, x) + 200);
        ctx.closePath();
        ctx.globalAlpha = 0.5; ctx.fillStyle = PATS[pidx][1]; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath();
        for (let x = 40; x <= LW + 20; x += 20) ctx.lineTo(x, edge(k, x) + 200);
        ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
      }
      // altitude grid
      ctx.font = "9px 'Courier Prime', monospace";
      for (let a = 2800; a <= 4600; a += 100) {
        const yy = yOf(a); if (yy < y0 || yy > y1) continue;
        ctx.strokeStyle = SLATE; ctx.globalAlpha = 0.45; ctx.lineWidth = 0.6; ctx.setLineDash([2, 6]);
        ctx.beginPath(); ctx.moveTo(48, yy); ctx.lineTo(LW, yy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
      // low gravity
      const lg = yOf(4000);
      if (lg > y0) {
        ctx.fillStyle = "rgba(90,63,122,0.10)"; ctx.fillRect(48, TOP - 100, LW - 48, lg - TOP + 100);
        ctx.strokeStyle = VIOLET; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(48, lg); ctx.lineTo(LW, lg); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = VIOLET; ctx.fillText("4 000 m  LOW GRAVITY: JUMP ×2, FALL ×½", 60, lg - 5);
        for (let i = 0; i < 40; i++) {
          const sx = 60 + ((i * 97) % 570), sy = lg - 20 - ((i * 53) % (lg - TOP));
          const tw = api.reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(now / 400 + i);
          ctx.globalAlpha = 0.25 + 0.4 * tw; ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // ledges
      for (const L of ledges) {
        if (L.y < y0 - 40 || L.y > y1 + 40) continue;
        if (L.state === 2) { ctx.strokeStyle = INK; ctx.setLineDash([3, 4]); ctx.strokeRect(L.x, L.y, L.w, 10); ctx.setLineDash([]); continue; }
        const flash = L.state === 1 && Math.floor(L.t * 3) % 2 === 0;
        ctx.fillStyle = L.rock ? (flash ? "#e8c9c9" : "#a59bb3") : "#f6efdc";
        ctx.fillRect(L.x, L.y, L.w, L.camp ? 14 : 10);
        ctx.strokeStyle = flash ? SEAL : INK; ctx.lineWidth = 1.5; ctx.strokeRect(L.x, L.y, L.w, L.camp ? 14 : 10);
        if (L.rock) { ctx.beginPath(); ctx.moveTo(L.x + L.w * 0.3, L.y); ctx.lineTo(L.x + L.w * 0.4, L.y + 6); ctx.lineTo(L.x + L.w * 0.34, L.y + 10); ctx.moveTo(L.x + L.w * 0.7, L.y); ctx.lineTo(L.x + L.w * 0.62, L.y + 10); ctx.lineWidth = 1; ctx.stroke(); }
        if (L.anchor != null) { ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(L.anchor, L.y); ctx.lineTo(L.anchor, L.y - 7); ctx.stroke(); ctx.beginPath(); ctx.arc(L.anchor, L.y - 11, 4, 0, 7); ctx.stroke(); }
        if (L.camp) {
          const tx = L.x + 26; ctx.fillStyle = L.goal ? SEAL : "#c8913a";
          ctx.beginPath(); ctx.moveTo(tx, L.y); ctx.lineTo(tx + 14, L.y - 20); ctx.lineTo(tx + 28, L.y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(tx + 14, L.y - 20); ctx.lineTo(tx + 14, L.y - 34); ctx.stroke(); ctx.fillStyle = SEAL; ctx.beginPath(); ctx.moveTo(tx + 14, L.y - 34); ctx.lineTo(tx + 25, L.y - 30); ctx.lineTo(tx + 14, L.y - 26); ctx.fill();
          ctx.fillStyle = INK; ctx.font = "italic 11px 'IM Fell English', Georgia, serif"; ctx.fillText(L.camp, tx + 34, L.y - 6);
        }
      }
      // dotted route in journal ink
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.setLineDash([0.5, 6]);
      ctx.beginPath(); st.route.forEach(([x, yy], i) => (i ? ctx.lineTo(x, yy - 3) : ctx.moveTo(x, yy - 3))); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = "butt";
      // Lira
      const fx = pl.x, fy = pl.y, sw = pl.ground && pl.vx ? Math.sin(pl.walk / 9) * 6 : 0;
      if (pl.anchored) { ctx.strokeStyle = SEAL; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(fx, fy - 24); ctx.lineTo(pl.ground.anchor, pl.ground.y - 11); ctx.stroke(); }
      ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(fx, fy - 16); ctx.lineTo(fx - 5 + sw * 0.6, fy); ctx.moveTo(fx, fy - 16); ctx.lineTo(fx + 5 - sw * 0.6, fy);
      ctx.moveTo(fx, fy - 16); ctx.lineTo(fx, fy - 32);
      ctx.moveTo(fx, fy - 29); ctx.lineTo(fx + pl.face * 9, fy - (pl.ground ? 21 : 38)); ctx.stroke();
      ctx.fillStyle = "#c8913a"; ctx.fillRect(fx - pl.face * 9 - 4, fy - 32, 8, 13); ctx.strokeRect(fx - pl.face * 9 - 4, fy - 32, 8, 13);
      ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(fx, fy - 38, 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineCap = "butt";
      // storm front
      const sm = st.storm;
      if (sm.x != null) {
        ctx.fillStyle = "rgba(60,64,72,0.55)"; ctx.fillRect(sm.x - 120, camY - 20, 240, viewH + 40);
        ctx.strokeStyle = "rgba(242,244,245,0.85)"; ctx.lineWidth = 1.4;
        for (let i = 0; i < 14; i++) { const yy = camY + 20 + i * (viewH / 14); ctx.beginPath(); ctx.moveTo(sm.x - 100, yy); ctx.lineTo(sm.x + 70, yy); ctx.lineTo(sm.x + 58, yy - 5); ctx.moveTo(sm.x + 70, yy); ctx.lineTo(sm.x + 58, yy + 5); ctx.stroke(); }
      }
      ctx.restore();
      // ---- screen space: scale, gauges, warning
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (sm.x == null && sm.next < 3) {
        const a = Math.min(1, (3 - sm.next) / 3) * 0.7;
        const gr = ctx.createLinearGradient(0, 0, W * 0.35, 0); gr.addColorStop(0, `rgba(20,20,20,${a})`); gr.addColorStop(1, "rgba(20,20,20,0)");
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W * 0.35, H);
      }
      // altitude scale on the left edge
      const sx = 10, sTop = 82, sBot = H - 80, sH = Math.max(40, sBot - sTop);
      ctx.fillStyle = "rgba(246,239,220,.9)"; ctx.fillRect(sx, sTop, 14, sH); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(sx, sTop, 14, sH);
      const fr = (st.best - ALT0) / (ALT1 - ALT0);
      ctx.fillStyle = CYAN; ctx.fillRect(sx + 1, sTop + sH * (1 - fr), 12, sH * fr);
      ctx.font = "10px 'Courier Prime', monospace"; ctx.fillStyle = INK;
      for (let a = ALT0; a <= ALT1; a += 300) { const yy = sTop + sH * (1 - (a - ALT0) / (ALT1 - ALT0)); ctx.beginPath(); ctx.moveTo(sx + 14, yy); ctx.lineTo(sx + 20, yy); ctx.stroke(); if (sH > 160) ctx.fillText(`${(a / 1000).toFixed(1)}k`, sx + 22, yy + 3); }
      for (const L of ledges) if (L.camp) { const yy = sTop + sH * (1 - (altOf(L.y) - ALT0) / (ALT1 - ALT0)); ctx.fillStyle = L.goal ? SEAL : "#c8913a"; ctx.beginPath(); ctx.moveTo(sx - 2, yy); ctx.lineTo(sx + 7, yy - 9); ctx.lineTo(sx + 16, yy); ctx.fill(); }
      const cur = sTop + sH * (1 - (altOf(pl.y) - ALT0) / (ALT1 - ALT0)); ctx.fillStyle = SEAL; ctx.beginPath(); ctx.moveTo(sx - 6, cur - 5); ctx.lineTo(sx, cur); ctx.lineTo(sx - 6, cur + 5); ctx.fill();
      // breath gauge, on a paper slip
      ctx.fillStyle = "rgba(241,232,210,.92)"; ctx.fillRect(40, 6, Math.min(W - 50, 470), 58); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(40, 6, Math.min(W - 50, 470), 58);
      const gx = 48, gy = 12, seg = 10, sw2 = Math.max(9, Math.min(18, (W - 200) / 12));
      ctx.font = "700 11px 'Courier Prime', monospace";
      ctx.fillStyle = INK; ctx.fillText("AIR", gx, gy + 12);
      for (let i = 0; i < seg; i++) {
        const x = gx + 30 + i * sw2; ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x, gy + 2, sw2 - 2, 12);
        const f = Math.max(0, Math.min(1, st.air / 10 - i)); ctx.fillStyle = st.air < 25 ? SEAL : CYAN; ctx.fillRect(x + 1, gy + 3, (sw2 - 4) * f, 10);
      }
      ctx.fillStyle = INK;
      const rate = drainRate(altOf(pl.y));
      ctx.fillText(`${Math.ceil(st.air)}  −${rate.toFixed(1)}/s  GEAR ${st.tier}`, gx + 34 + seg * sw2, gy + 12, Math.max(60, Math.min(W - 50, 470) - (34 + seg * sw2)));
      ctx.fillText(`${Math.round(altOf(pl.y)).toLocaleString("en").replace(",", " ")} m   BLACK-OUTS ${"●".repeat(st.blackouts)}${"○".repeat(3 - st.blackouts)}${pl.anchored ? "   ANCHORED" : ""}`, gx, gy + 32);
      if (st.msgT > 0 && st.msg) {
        ctx.font = "italic 15px 'IM Fell English', Georgia, serif";
        const tw = Math.min(W - 60, ctx.measureText(st.msg).width + 20);
        ctx.fillStyle = "rgba(246,239,220,.94)"; ctx.fillRect(W / 2 - tw / 2, 72, tw, 26); ctx.strokeStyle = INK; ctx.strokeRect(W / 2 - tw / 2, 72, tw, 26);
        ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText(st.msg, W / 2, 90, W - 70); ctx.textAlign = "left";
      }
      ctx.font = "10px 'Courier Prime', monospace"; ctx.fillStyle = INK; ctx.globalAlpha = 0.75;
      ctx.fillText("SECTION A–A′  BOOK III CLIMB  2 800 TO 4 600 m  ROUTE IN JOURNAL INK", 48, 58, Math.min(W - 60, 460)); ctx.globalAlpha = 1;
    };

    let last = 0;
    const loop = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (st.started && !st.over) update(dt);
      draw(now);
      if (!st.over) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ---- how to play
    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>Cross-section climb</h2>
      <p>Climb the section from 2 800 m to the summit camp at 4 600 m. <kbd>←</kbd><kbd>→</kbd> move, <kbd>↑</kbd> or <kbd>Space</kbd> jump, hold <kbd>↓</kbd> to anchor at a ring ○.</p>
      <p>When the page edge darkens a storm front is 3 s away: anchor, or be knocked back two ledges. Air drains above 2 000 m and faster above 3 200 m; camps refill it. Three black-outs end the climb.</p>
      <button type="button">Start the climb</button></div>`;
    wrap.appendChild(intro);
    const startBtn = intro.querySelector("button");
    on(startBtn, "click", () => { intro.remove(); st.started = true; say("Base camp, 2 800 m. Mara's camp is at 3 700 m.", 3); });
    startBtn.focus();

    return {
      unmount() {
        alive = false; cancelAnimationFrame(raf); ro.disconnect();
        off.forEach((f) => f()); timers.forEach(clearTimeout);
      },
    };
  },
};

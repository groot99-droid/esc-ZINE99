// Under the lens (2D, False-colour micrograph). DESIGN.md section 10, Mode B, cut to one slide
// modelled on b1-lens-1: three magnifications (100x, 400x, 1 600x), each a checkpoint that captures a
// plate. Only the focus plane is solid (false teal); the blurred planes (magenta) pass through.
// Charge pulses on the focus plane cost one of three steadiness points; above AFU 0.7 (violet tint)
// pulses double. Added to make the ring fill by play: lattice cells drift on the three planes and
// must be captured on their own plane (4 per magnification). Three drifts lose the slide.
const P = "lira-calyx-under-the-lens-";
const TEAL = "#25c2a8", MAG = "#d6409f", VIO = "#5a3f7a", BLACK = "#06080a", ICE = "#b9d8ea";
const STAGES = [
  { mag: "×100", afu: 0.42, pulse: 0.9, wig: 0.10, plate: "Plate 1: filaments laid over a lattice." },
  { mag: "×400", afu: 0.61, pulse: 0.75, wig: 0.15, plate: "Plate 2: the lattice repeats, every cell the same." },
  { mag: "×1 600", afu: 0.78, pulse: 0.62, wig: 0.2, plate: "Plate 3: a pattern too regular to be natural." },
];
const NEED = 4, PLANES = ["upper", "middle", "lower"];

export default {
  mount(root, api) {
    const off = [];
    let raf = 0, alive = true;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = BLACK;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;color:${ICE};font-family:'Courier Prime',monospace}
      .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
      .${P}focus{position:absolute;right:12px;bottom:12px;display:flex;gap:8px;z-index:3}
      .${P}focus button{font:700 13px 'Courier Prime',monospace;color:${TEAL};background:rgba(6,8,10,.8);border:1.5px solid ${TEAL};height:46px;min-width:92px;cursor:pointer;letter-spacing:.05em}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(6,8,10,.8);z-index:5;padding:16px}
      .${P}card{max-width:470px;border:1.5px solid ${TEAL};padding:18px 20px;background:#0b1013}
      .${P}card h2{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px;color:#f2f4f5}
      .${P}card p{margin:0 0 10px;font:14px/1.5 'Courier Prime',monospace}
      .${P}card b.t{color:${TEAL}}.${P}card b.m{color:${MAG}}
      .${P}card button{font:700 14px 'Courier Prime',monospace;background:${TEAL};color:${BLACK};border:0;padding:10px 20px;cursor:pointer;letter-spacing:.1em}
    </style><canvas></canvas><div class="${P}focus"><button type="button" data-d="-1">FOCUS ▲</button><button type="button" data-d="1">FOCUS ▼</button></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), ctx = cv.getContext("2d");
    const rng = api.rng();

    // false-colour background texture: magenta and dark teal blobs, pre-rendered once
    const tex = document.createElement("canvas"); tex.width = tex.height = 512;
    { const g = tex.getContext("2d"); g.fillStyle = "#14101a"; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 140; i++) {
        const x = rng() * 512, y = rng() * 512, r = 20 + rng() * 70, m = rng() < 0.6;
        for (const [dx, dy] of [[0, 0], [512, 0], [-512, 0], [0, 512], [0, -512]]) {
          const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
          gr.addColorStop(0, m ? "rgba(214,64,159,0.30)" : "rgba(37,194,168,0.16)"); gr.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r);
        }
      }
      for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(255,255,255,${rng() * 0.07})`; g.fillRect(rng() * 512, rng() * 512, 1.5, 1.5); } }

    // ---- state
    const st = { stage: 0, got: 0, total: 0, steady: 3, drifts: 0, focus: 1, refocus: 0, inv: 0, flow: 0, t: 0,
      fils: [], pulses: [], frags: [], pt: { x: 0, y: 0.55 }, aim: null, msg: "", msgT: 0, started: false, over: false, pause: 0, shake: 0 };
    const say = (m, t = 3) => { st.msg = m; st.msgT = t; };
    const setupStage = () => {
      const S = STAGES[st.stage];
      st.fils = [];
      for (let i = 0; i < 9; i++) st.fils.push({ plane: i % 3, x0: -0.85 + (i / 8) * 1.7 + (rng() - 0.5) * 0.12, amp: 0.05 + rng() * S.wig, fr: 2.2 + rng() * 2.5, ph: rng() * 6.3 });
      st.pulses = []; st.frags = []; st.got = 0; st.steady = 3; st.inv = 1; st.pt = { x: 0, y: 0.55 };
      st.nextPulse = 1; st.nextFrag = 1.2;
    };
    const fx = (f, y) => f.x0 + f.amp * Math.sin(f.fr * (y - st.flow) + f.ph);

    // ---- sizing / layout
    let W = 0, H = 0, dpr = 1, L = { cx: 0, cy: 0, r: 100, hx: 0, hy: 0, side: true };
    const resize = () => {
      const r = wrap.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      if (W > H * 1.2) { L.r = Math.min(H * 0.44, W * 0.34); L.cx = Math.max(L.r + 20, W * 0.42); L.cy = H / 2; L.side = true; L.hx = L.cx + L.r + 34; L.hy = H / 2 - L.r + 10; }
      else { L.r = Math.min(W * 0.44, H * 0.31); L.cx = W / 2; L.cy = L.r + 24; L.side = false; L.hx = 16; L.hy = L.cy + L.r + 30; }
    };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrap);

    // ---- input
    const keys = {};
    const changeFocus = (d) => {
      if (!st.started || st.over) return;
      const n = Math.max(0, Math.min(2, st.focus + d)); if (n === st.focus) return;
      st.focus = n; st.refocus = 0.25;
    };
    on(window, "keydown", (e) => {
      if (!st.started) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) { keys[e.key] = true; st.aim = null; e.preventDefault(); }
      if (e.key === "q" || e.key === "Q" || e.key === "PageUp") changeFocus(-1);
      if (e.key === "e" || e.key === "E" || e.key === "PageDown") changeFocus(1);
      if (e.key >= "1" && e.key <= "3") { const n = +e.key - 1; if (n !== st.focus) { st.focus = n; st.refocus = 0.25; } }
    });
    on(window, "keyup", (e) => { keys[e.key] = false; });
    const toLens = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - L.cx) / L.r, y: (e.clientY - r.top - L.cy) / L.r }; };
    on(cv, "pointermove", (e) => { if (st.started) st.aim = toLens(e); });
    on(cv, "pointerdown", (e) => { if (st.started) { st.aim = toLens(e); try { cv.setPointerCapture(e.pointerId); } catch {} } });
    on(cv, "wheel", (e) => { e.preventDefault(); changeFocus(e.deltaY > 0 ? 1 : -1); }, { passive: false });
    wrap.querySelectorAll(`.${P}focus button`).forEach((b) => on(b, "click", () => changeFocus(+b.dataset.d)));

    // ---- update
    const drift = () => {
      st.drifts++;
      if (st.drifts >= 3) { st.over = true; api.end({ outcome: "lose", text: `The slide drifts a third time at ${STAGES[st.stage].mag}. ${st.total} lattice cell${st.total === 1 ? "" : "s"} recorded; the plate is lost.` }); return; }
      setupStage(); st.pause = 1.6;
      say(`Steadiness gone: the slide drifts. Back to the ${STAGES[st.stage].mag} checkpoint (${3 - st.drifts} drift${3 - st.drifts === 1 ? "" : "s"} left).`, 3.5);
    };
    const update = (dt) => {
      st.t += dt; st.msgT -= dt; st.refocus = Math.max(0, st.refocus - dt); st.inv = Math.max(0, st.inv - dt); st.shake = Math.max(0, st.shake - dt);
      if (st.pause > 0) { st.pause -= dt; return; }
      const S = STAGES[st.stage], hot = S.afu > 0.7;
      st.flow += dt * 0.32;
      // steer
      const sp = 1.1 * dt;
      if (keys.ArrowLeft) st.pt.x -= sp; if (keys.ArrowRight) st.pt.x += sp; if (keys.ArrowUp) st.pt.y -= sp; if (keys.ArrowDown) st.pt.y += sp;
      if (st.aim) { st.pt.x += (st.aim.x - st.pt.x) * Math.min(1, dt * 9); st.pt.y += (st.aim.y - st.pt.y) * Math.min(1, dt * 9); }
      const d = Math.hypot(st.pt.x, st.pt.y); if (d > 0.9) { st.pt.x *= 0.9 / d; st.pt.y *= 0.9 / d; }
      // pulses
      st.nextPulse -= dt * (hot ? 2 : 1);
      if (st.nextPulse <= 0) { st.nextPulse = S.pulse * (0.6 + rng() * 0.8); st.pulses.push({ f: st.fils[Math.floor(rng() * st.fils.length)], y: -1.1, v: 0.55 + rng() * 0.45 + st.stage * 0.12 }); }
      for (const p of st.pulses) p.y += p.v * dt;
      st.pulses = st.pulses.filter((p) => p.y < 1.15);
      if (st.inv <= 0 && st.refocus <= 0) for (const p of st.pulses) {
        if (p.f.plane !== st.focus) continue;
        if (Math.hypot(fx(p.f, p.y) - st.pt.x, p.y - st.pt.y) < 0.07) {
          st.steady--; st.inv = 1.2; st.shake = api.reducedMotion ? 0 : 0.3;
          say(st.steady > 0 ? `A charge pulse on the focus plane: steadiness ${st.steady} of 3.` : "", 2);
          if (st.steady <= 0) { drift(); return; }
          break;
        }
      }
      // lattice cells
      st.nextFrag -= dt;
      if (st.nextFrag <= 0 && st.frags.length < 2) { st.nextFrag = 2.4 + rng() * 1.6; let pl = Math.floor(rng() * 3); if (pl === st.focus && rng() < 0.6) pl = (pl + 1 + Math.floor(rng() * 2)) % 3; const onPl = st.fils.filter((f) => f.plane === pl); st.frags.push({ f: onPl[Math.floor(rng() * onPl.length)], y: -1.1, plane: pl, v: 0.2 + rng() * 0.08 }); }
      for (const f of st.frags) { f.y += f.v * dt; f.x = fx(f.f, f.y); }
      for (const f of st.frags) {
        if (f.plane === st.focus && st.refocus <= 0 && Math.hypot(f.x - st.pt.x, f.y - st.pt.y) < 0.1) {
          f.done = true; st.got++; st.total++;
          if (st.got >= NEED) {
            const plate = S.plate;
            if (st.stage === 2) { st.over = true; api.end({ outcome: "win", text: `Three plates captured into the journal as evidence. ${plate} (${st.drifts} drift${st.drifts === 1 ? "" : "s"})` }); return; }
            st.stage++; setupStage(); st.pause = 2.2;
            say(`Checkpoint. ${plate} Magnification steps up to ${STAGES[st.stage].mag}.${STAGES[st.stage].afu > 0.7 ? " AFU above 0.7: pulses double." : ""}`, 4.5);
          } else say(`Lattice cell recorded (${st.got} of ${NEED}).`, 1.4);
          break;
        }
      }
      st.frags = st.frags.filter((f) => !f.done && f.y < 1.15);
    };

    // ---- draw
    const hexPath = (x, y, r) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); };
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
      const S = STAGES[st.stage], R = L.r;
      const shx = st.shake > 0 ? (Math.random() - 0.5) * 8 : 0, shy = st.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
      const cx = L.cx + shx, cy = L.cy + shy;
      const X = (u) => cx + u * R, Y = (v) => cy + v * R;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      // texture scrolls with the flow; scale by magnification
      const ts = [1.0, 1.6, 2.4][st.stage] * R / 256, off = ((st.flow * R * 0.9) % (512 * ts));
      for (let ty = -1; ty <= Math.ceil(2 * R / (512 * ts)) + 1; ty++) for (let tx = -1; tx <= Math.ceil(2 * R / (512 * ts)) + 1; tx++)
        ctx.drawImage(tex, cx - R + tx * 512 * ts, cy - R + ty * 512 * ts + off - 512 * ts, 512 * ts + 1, 512 * ts + 1);
      if (S.afu > 0.7) { ctx.fillStyle = "rgba(120,70,200,0.18)"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
      // faint lattice underneath
      ctx.strokeStyle = "rgba(185,216,234,0.10)"; ctx.lineWidth = 1;
      const hr = R * [0.16, 0.11, 0.075][st.stage], hy2 = hr * 1.5, hw = hr * Math.sqrt(3), loff = (st.flow * R * 0.9) % (hy2 * 2);
      for (let j = -2; j * hy2 < 2 * R + hy2 * 2; j++) for (let i = -1; i * hw < 2 * R + hw; i++) hexPath(cx - R + i * hw + (j % 2 ? hw / 2 : 0), cy - R + j * hy2 + loff, hr), ctx.stroke();
      // filaments: blurred planes first, then the solid focus plane
      const blur = st.refocus > 0;
      const order = [0, 1, 2].sort((a, b) => Math.abs(b - st.focus) - Math.abs(a - st.focus));
      for (const plane of order) {
        const dist = Math.abs(plane - st.focus), solid = dist === 0 && !blur;
        for (const f of st.fils) {
          if (f.plane !== plane) continue;
          const path = () => { ctx.beginPath(); for (let v = -1.05; v <= 1.05; v += 0.04) ctx.lineTo(X(fx(f, v)), Y(v)); };
          if (solid) {
            path(); ctx.strokeStyle = "rgba(37,194,168,0.25)"; ctx.lineWidth = R * 0.05; ctx.stroke();
            path(); ctx.strokeStyle = TEAL; ctx.lineWidth = R * 0.016; ctx.stroke();
            path(); ctx.strokeStyle = "rgba(220,255,248,0.7)"; ctx.lineWidth = R * 0.005; ctx.stroke();
          } else {
            path(); ctx.strokeStyle = `rgba(214,64,159,${dist === 2 ? 0.12 : 0.2})`; ctx.lineWidth = R * (dist === 2 ? 0.09 : 0.06); ctx.stroke();
            path(); ctx.strokeStyle = `rgba(214,64,159,${dist === 2 ? 0.18 : 0.3})`; ctx.lineWidth = R * 0.02; ctx.stroke();
          }
        }
      }
      // lattice cells to capture
      for (const f of st.frags) {
        const solid = f.plane === st.focus && !blur;
        const r = R * 0.06, x = X(f.x), y = Y(f.y);
        if (solid) { hexPath(x, y, r); ctx.fillStyle = "rgba(37,194,168,0.25)"; ctx.fill(); ctx.strokeStyle = "#e9fffb"; ctx.lineWidth = 2; ctx.stroke(); hexPath(x, y, r * 0.5); ctx.stroke(); }
        else { hexPath(x, y, r * 1.3); ctx.fillStyle = "rgba(214,64,159,0.15)"; ctx.fill(); ctx.strokeStyle = "rgba(214,64,159,0.45)"; ctx.lineWidth = 4; ctx.stroke();
          ctx.fillStyle = "rgba(242,244,245,0.6)"; ctx.font = `700 ${Math.max(10, R * 0.04)}px 'Courier Prime',monospace`; ctx.textAlign = "center"; ctx.fillText(PLANES[f.plane][0].toUpperCase(), x, y + 4); ctx.textAlign = "left"; }
      }
      // pulses
      for (const p of st.pulses) {
        const x = X(fx(p.f, p.y)), y = Y(p.y), solid = p.f.plane === st.focus && !blur;
        if (solid) { ctx.fillStyle = "rgba(255,120,210,0.35)"; ctx.beginPath(); ctx.arc(x, y, R * 0.045, 0, 7); ctx.fill(); ctx.fillStyle = "#ffe4f6"; ctx.beginPath(); ctx.arc(x, y, R * 0.018, 0, 7); ctx.fill(); }
        else { ctx.fillStyle = "rgba(214,64,159,0.25)"; ctx.beginPath(); ctx.arc(x, y, R * 0.04, 0, 7); ctx.fill(); }
      }
      // focus point reticle
      const px = X(st.pt.x), py = Y(st.pt.y), blink = st.inv > 0 && Math.floor(now / 100) % 2;
      ctx.strokeStyle = blink ? MAG : "#f2f4f5"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(px, py, R * 0.05, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - R * 0.09, py); ctx.lineTo(px - R * 0.025, py); ctx.moveTo(px + R * 0.025, py); ctx.lineTo(px + R * 0.09, py);
      ctx.moveTo(px, py - R * 0.09); ctx.lineTo(px, py - R * 0.025); ctx.moveTo(px, py + R * 0.025); ctx.lineTo(px, py + R * 0.09); ctx.stroke();
      ctx.restore();
      // lens ring and progress
      ctx.strokeStyle = "#20282c"; ctx.lineWidth = R * 0.07; ctx.beginPath(); ctx.arc(cx, cy, R + R * 0.035, 0, 7); ctx.stroke();
      const prog = st.total / (NEED * 3);
      ctx.strokeStyle = TEAL; ctx.lineWidth = R * 0.03; ctx.beginPath(); ctx.arc(cx, cy, R + R * 0.035, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); ctx.stroke();
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k + 1) / 3 * Math.PI * 2; ctx.fillStyle = BLACK; ctx.strokeStyle = k < st.stage ? TEAL : MAG; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R * 1.035), cy + Math.sin(a) * (R * 1.035), R * 0.03, 0, 7); ctx.fill(); ctx.stroke(); }
      // HUD
      let hx = L.hx, hy = L.hy;
      const line = (txt, size, col, gap = 8) => { ctx.font = `${size}px 'Courier Prime',monospace`; ctx.fillStyle = col; ctx.fillText(txt, hx, hy + size); hy += size + gap; };
      if (L.side) {
        line("B1-LENS FRAGMENT", 12, ICE, 18);
        line(S.mag, 38, "#f2f4f5", 4); line(`MAG ${st.stage + 1} / 3`, 12, ICE, 18);
        line("FOCUS PLANE", 12, ICE, 6);
        PLANES.forEach((p, i) => { const sel = i === st.focus; ctx.strokeStyle = sel ? TEAL : MAG; ctx.lineWidth = 1.2; ctx.strokeRect(hx, hy, 132, 18); if (sel) { ctx.fillStyle = TEAL; ctx.fillRect(hx, hy, 132, 18); } ctx.fillStyle = sel ? BLACK : MAG; ctx.font = "12px 'Courier Prime',monospace"; ctx.fillText(`${p} ${sel ? (blur ? "focusing" : "SOLID") : "blur"}`, hx + 6, hy + 13); hy += 22; });
        hy += 12; line("STEADINESS", 12, ICE, 6);
        for (let i = 0; i < 3; i++) { const x = hx + 10 + i * 26, y = hy + 10; ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.fillStyle = "#f2f4f5"; ctx.strokeStyle = "#f2f4f5"; ctx.lineWidth = 1.5; i < st.steady ? ctx.fill() : ctx.stroke(); }
        hy += 30;
        line(`CELLS ${st.got} / ${NEED}  DRIFTS ${st.drifts} / 3`, 12, ICE, 10);
        line(`AFU ${S.afu.toFixed(2)}${S.afu > 0.7 ? "  PULSES ×2" : ""}`, 15, S.afu > 0.7 ? "#b48cff" : MAG, 14);
        ctx.fillStyle = "#f2f4f5"; ctx.fillRect(hx, hy, 60, 3); line("", 4, ICE, 4); line(`${[100, 25, 6][st.stage]} µm`, 11, ICE);
      } else {
        line(`${S.mag}  MAG ${st.stage + 1}/3   FOCUS ${PLANES[st.focus].toUpperCase()} ${blur ? "…" : "SOLID"}`, 13, "#f2f4f5", 6);
        line(`STEADY ${"◆".repeat(st.steady)}${"◇".repeat(3 - st.steady)}  CELLS ${st.got}/${NEED}  DRIFTS ${st.drifts}/3`, 13, ICE, 6);
        line(`AFU ${S.afu.toFixed(2)}${S.afu > 0.7 ? "  PULSES ×2" : ""}`, 13, S.afu > 0.7 ? "#b48cff" : MAG, 6);
      }
      if (st.msgT > 0 && st.msg) {
        ctx.font = "13px 'Courier Prime',monospace"; const tw = Math.min(W - 24, ctx.measureText(st.msg).width + 20);
        const my = L.side ? H - 76 : Math.min(H - 110, hy + 8);
        ctx.fillStyle = "rgba(6,8,10,.88)"; ctx.fillRect(W / 2 - tw / 2, my, tw, 26); ctx.strokeStyle = TEAL; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - tw / 2, my, tw, 26);
        ctx.fillStyle = "#f2f4f5"; ctx.textAlign = "center"; ctx.fillText(st.msg, W / 2, my + 17, W - 40); ctx.textAlign = "left";
      }
      ctx.font = "11px 'Courier Prime',monospace"; ctx.fillStyle = ICE; ctx.fillText("FLOW ↓", 16, H - 18);
    };

    let last = 0;
    const loop = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (st.started && !st.over) update(dt);
      draw(now);
      if (!st.over) raf = requestAnimationFrame(loop);
    };
    setupStage();
    raf = requestAnimationFrame(loop);

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>Under the lens</h2>
      <p>Steer the focus point (mouse, touch or arrow keys) as the fragment's filaments flow toward you. Only the <b class="t">teal</b> focus plane is solid: its charge pulses cost a steadiness point. <b class="m">Magenta</b> planes pass through.</p>
      <p>Change focus (wheel, Q / E, or the buttons) to reach lattice cells on other planes. Capture four at each magnification; lose all three points and the slide drifts back. A third drift loses the slide.</p>
      <button type="button">Place the slide</button></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); st.started = true; say("×100. Capture four lattice cells.", 2.5); });
    sb.focus();
    return { unmount() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); off.forEach((f) => f()); } };
  },
};

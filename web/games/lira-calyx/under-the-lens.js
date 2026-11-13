// Under the lens (2D, False-colour micrograph). DESIGN.md section 10, Mode B, cut to one slide
// modelled on b1-lens-1: three magnifications (100x, 400x, 1 600x), each a checkpoint that captures a
// plate. Only the focus plane is solid (false teal); the blurred planes (magenta) pass through.
// Charge pulses on the focus plane cost one of three steadiness points; above AFU 0.7 (violet tint)
// pulses double. Added to make the ring fill by play: lattice cells drift on the three planes and
// must be captured on their own plane (5, 6, 7 per magnification). Three drifts lose the slide.
// Actions: steer; change focus plane; from x400, hold your breath (slows the flow and the pulses for
// up to 3 s, then refills); and capture a cell by touching it on its own plane. Phases: x100 teaches;
// x400 adds charge bursts (three pulses down one filament after a flicker); x1 600 is above AFU 0.7.
const P = "lira-calyx-under-the-lens-";
const TEAL = "#25c2a8", MAG = "#d6409f", VIO = "#5a3f7a", BLACK = "#06080a", ICE = "#b9d8ea";
const STAGES = [
  { mag: "×100", afu: 0.42, pulse: 0.9, wig: 0.10, plate: "Plate 1: filaments laid over a lattice." },
  { mag: "×400", afu: 0.61, pulse: 0.75, wig: 0.15, plate: "Plate 2: the lattice repeats, every cell the same." },
  { mag: "×1 600", afu: 0.78, pulse: 0.62, wig: 0.2, plate: "Plate 3: a pattern too regular to be natural." },
];
const NEEDS = [5, 6, 7], PLANES = ["upper", "middle", "lower"];

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
      .${P}focus button{font:700 14px 'Courier Prime',monospace;color:${TEAL};background:rgba(6,8,10,.85);border:1.5px solid ${TEAL};height:50px;min-width:92px;cursor:pointer;letter-spacing:.05em;touch-action:none}
      .${P}focus button:hover{background:rgba(37,194,168,.18)}
      .${P}focus button.hold{color:${ICE};border-color:${ICE}}.${P}focus button.hold.on{background:${ICE};color:${BLACK}}
      .${P}focus button[hidden]{display:none}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(6,8,10,.82);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(440px,100%);background:#0b1013;color:${ICE};display:grid;grid-template-columns:110px 1fr;border:1.5px solid #39434a;box-shadow:0 0 0 6px #14191c}
      .${P}card .disc{background:radial-gradient(circle at 50% 50%,#1d2b2f 0 34%,${TEAL} 35% 37%,#14101a 38% 70%,${MAG} 71% 72%,#06080a 73%);border-right:1.5px solid #39434a;
        display:grid;place-items:end center;padding-bottom:12px;font:700 13px 'Courier Prime',monospace;color:#f2f4f5}
      .${P}card .in{padding:14px 16px}
      .${P}card .lab{font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:${ICE};opacity:.85}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:4px 0 6px;color:#f2f4f5}
      .${P}card .goal{font:15px/1.4 'Courier Prime',monospace;margin:0 0 10px;color:#f2f4f5}
      .${P}card dl{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;margin:0 0 12px;font:14px/1.35 'Courier Prime',monospace}
      .${P}card dt{color:${TEAL};font-weight:700}
      .${P}card b.t{color:${TEAL}}.${P}card b.m{color:${MAG}}
      .${P}card label{display:flex;gap:8px;align-items:center;font:14px 'Courier Prime',monospace;margin:0 0 10px;color:#b48cff}
      .${P}card button{font:700 15px 'Courier Prime',monospace;background:${TEAL};color:${BLACK};border:0;padding:11px 22px;cursor:pointer;letter-spacing:.1em}
      .${P}card button:hover,.${P}card button:focus-visible{background:#f2f4f5}
      @media (max-width:520px){.${P}card{grid-template-columns:1fr}.${P}card .disc{height:90px;border-right:0;border-bottom:1.5px solid #39434a}}
    </style><canvas></canvas><div class="${P}focus"><button type="button" class="hold" data-h="1" hidden>HOLD BREATH</button><button type="button" data-d="-1">FOCUS ▲</button><button type="button" data-d="1">FOCUS ▼</button></div>`;
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
    const losses = api.store.get("losses", 0);
    const st = { stage: 0, got: 0, total: 0, steady: 3, drifts: 0, focus: 1, refocus: 0, inv: 0, flow: 0, t: 0, breath: 1, holding: false, gentle: false,
      fils: [], pulses: [], frags: [], bursts: [], pops: [], pt: { x: 0, y: 0.55 }, aim: null, msg: "", msgT: 0, voice: false, started: false, over: false, pause: 0, shake: 0, hurt: 0, beats: {}, nextBurst: 9 };
    const say = (m, t = 3, voice = false) => { st.msg = m; st.msgT = t; st.voice = voice; };
    const NEED = () => NEEDS[st.stage];
    const holdBtn = wrap.querySelector("[data-h]");
    const setupStage = () => {
      const S = STAGES[st.stage];
      st.fils = [];
      for (let i = 0; i < 9; i++) st.fils.push({ plane: i % 3, x0: -0.85 + (i / 8) * 1.7 + (rng() - 0.5) * 0.12, amp: 0.05 + rng() * S.wig, fr: 2.2 + rng() * 2.5, ph: rng() * 6.3 });
      st.pulses = []; st.frags = []; st.got = 0; st.steady = 3; st.inv = 1; st.pt = { x: 0, y: 0.55 };
      st.nextPulse = 1; st.nextFrag = 1.2; st.bursts = []; st.nextBurst = 7;
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
      if (e.key === " " || e.key === "Shift") { keys.hold = true; e.preventDefault(); }
    });
    on(window, "keyup", (e) => { keys[e.key] = false; if (e.key === " " || e.key === "Shift") keys.hold = false; });
    on(holdBtn, "pointerdown", (e) => { e.preventDefault(); keys.hold = true; holdBtn.classList.add("on"); try { holdBtn.setPointerCapture(e.pointerId); } catch {} });
    const holdUp = () => { keys.hold = false; holdBtn.classList.remove("on"); };
    on(holdBtn, "pointerup", holdUp); on(holdBtn, "pointercancel", holdUp); on(holdBtn, "lostpointercapture", holdUp);
    const toLens = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - L.cx) / L.r, y: (e.clientY - r.top - L.cy) / L.r }; };
    on(cv, "pointermove", (e) => { if (st.started) st.aim = toLens(e); });
    on(cv, "pointerdown", (e) => { if (st.started) { st.aim = toLens(e); try { cv.setPointerCapture(e.pointerId); } catch {} } });
    on(cv, "wheel", (e) => { e.preventDefault(); changeFocus(e.deltaY > 0 ? 1 : -1); }, { passive: false });
    wrap.querySelectorAll(`.${P}focus button`).forEach((b) => on(b, "click", () => changeFocus(+b.dataset.d)));

    // ---- update
    const drift = () => {
      st.drifts++;
      if (st.drifts >= 3) { st.over = true; api.store.set("losses", losses + 1); api.end({ outcome: "lose", text: `The slide drifts a third time at ${STAGES[st.stage].mag} and the fragment slips out of the clip. ${st.total} lattice cell${st.total === 1 ? "" : "s"} recorded, ${st.stage} plate${st.stage === 1 ? "" : "s"} kept; whatever lies under the filaments stays unproven for now.` }); return; }
      setupStage(); st.pause = 1.6;
      say(`Steadiness gone: the slide drifts. Back to the ${STAGES[st.stage].mag} checkpoint (${3 - st.drifts} drift${3 - st.drifts === 1 ? "" : "s"} left).`, 3.5);
    };
    const update = (dt) => {
      st.t += dt; st.msgT -= dt; st.refocus = Math.max(0, st.refocus - dt); st.inv = Math.max(0, st.inv - dt); st.shake = Math.max(0, st.shake - dt); st.hurt = Math.max(0, st.hurt - dt);
      st.pops = st.pops.filter((p) => (p.t -= dt) > 0);
      if (st.pause > 0) { st.pause -= dt; return; }
      const S = STAGES[st.stage], hot = S.afu > 0.7;
      // hold breath (from x400): slows everything to 35% while the breath lasts
      st.holding = st.stage >= 1 && keys.hold && st.breath > 0;
      if (st.holding) st.breath = Math.max(0, st.breath - dt / 3); else st.breath = Math.min(1, st.breath + dt / 7);
      const slow = st.holding ? 0.35 : 1;
      const gdt = dt * slow * (st.gentle ? 0.8 : 1);
      st.flow += gdt * 0.32;
      // steer
      const sp = 1.1 * dt;
      if (keys.ArrowLeft) st.pt.x -= sp; if (keys.ArrowRight) st.pt.x += sp; if (keys.ArrowUp) st.pt.y -= sp; if (keys.ArrowDown) st.pt.y += sp;
      if (st.aim) { st.pt.x += (st.aim.x - st.pt.x) * Math.min(1, dt * 9); st.pt.y += (st.aim.y - st.pt.y) * Math.min(1, dt * 9); }
      const d = Math.hypot(st.pt.x, st.pt.y); if (d > 0.9) { st.pt.x *= 0.9 / d; st.pt.y *= 0.9 / d; }
      // pulses
      st.nextPulse -= gdt * (hot ? 2 : 1);
      if (st.nextPulse <= 0) { st.nextPulse = S.pulse * (0.6 + rng() * 0.8); st.pulses.push({ f: st.fils[Math.floor(rng() * st.fils.length)], y: -1.1, v: 0.55 + rng() * 0.45 + st.stage * 0.12 }); }
      // charge bursts (from x400): a filament flickers for 1.5 s, then three pulses run down it close together
      if (st.stage >= 1) {
        st.nextBurst -= gdt;
        if (st.nextBurst <= 0) {
          st.nextBurst = 9 + rng() * 5;
          const onFocus = st.fils.filter((f) => f.plane === st.focus);
          st.bursts.push({ f: (rng() < 0.7 ? onFocus : st.fils)[Math.floor(rng() * (rng() < 0.7 ? onFocus : st.fils).length)] || st.fils[0], t: 1.5 });
          if (!st.beats.burst) { st.beats.burst = 1; say("A filament flickers: a charge burst is coming down it. Steer clear, change plane, or hold your breath.", 4.5, true); }
        }
        for (const b of st.bursts) { b.t -= gdt; if (b.t <= 0 && !b.fired) { b.fired = true; for (let k = 0; k < 3; k++) st.pulses.push({ f: b.f, y: -1.1 - k * 0.16, v: 0.95 }); } }
        st.bursts = st.bursts.filter((b) => !b.fired);
      }
      for (const p of st.pulses) p.y += p.v * gdt;
      st.pulses = st.pulses.filter((p) => p.y < 1.15);
      if (st.inv <= 0 && st.refocus <= 0) for (const p of st.pulses) {
        if (p.f.plane !== st.focus) continue;
        if (Math.hypot(fx(p.f, p.y) - st.pt.x, p.y - st.pt.y) < 0.07) {
          st.steady--; st.inv = 1.2; st.shake = api.reducedMotion ? 0 : 0.3; st.hurt = 0.5;
          say(st.steady > 0 ? `A charge pulse on the focus plane: steadiness ${st.steady} of 3.` : "", 2);
          if (st.steady <= 0) { drift(); return; }
          break;
        }
      }
      // lattice cells
      st.nextFrag -= gdt;
      if (st.nextFrag <= 0 && st.frags.length < 2) { st.nextFrag = 2.4 + rng() * 1.6; let pl = Math.floor(rng() * 3); if (pl === st.focus && rng() < 0.6) pl = (pl + 1 + Math.floor(rng() * 2)) % 3; const onPl = st.fils.filter((f) => f.plane === pl); st.frags.push({ f: onPl[Math.floor(rng() * onPl.length)], y: -1.1, plane: pl, v: 0.2 + rng() * 0.08 }); }
      for (const f of st.frags) { f.y += f.v * gdt; f.x = fx(f.f, f.y); }
      for (const f of st.frags) {
        if (f.plane === st.focus && st.refocus <= 0 && Math.hypot(f.x - st.pt.x, f.y - st.pt.y) < 0.1) {
          f.done = true; st.got++; st.total++; st.pops.push({ x: f.x, y: f.y, t: 0.6 });
          if (st.got >= NEED()) {
            const plate = S.plate;
            if (st.stage === 2) { st.over = true; api.store.set("losses", 0); api.end({ outcome: "win", text: `Three plates go into the journal as evidence, ${st.drifts ? `after ${st.drifts} drift${st.drifts === 1 ? "" : "s"}` : "without a single drift"}. Under the living filaments sits a lattice that repeats to the cell: a pattern too regular to be natural. Lira writes the word “made” and does not cross it out.` }); return; }
            st.stage++; setupStage(); st.pause = 2.4;
            const extra = st.stage === 1 ? " Hold your breath (Space or HOLD) to slow the flow for three seconds." : " AFU above 0.7: pulses double, the field tints violet.";
            say(`Plate captured. ${plate} Magnification ${STAGES[st.stage].mag}.${extra}`, 5.5, true);
            if (st.stage === 1) holdBtn.hidden = false;
          } else {
            say(`Lattice cell recorded (${st.got} of ${NEED()}).`, 1.4);
            if (st.stage === 0 && st.got === 2 && !st.beats.joren) { st.beats.joren = 1; say("Joren, over your shoulder: “Bark doesn’t grow in hexagons, Doctor.” You say nothing yet. You count.", 4.5, true); }
            if (st.stage === 2 && st.got === 3 && !st.beats.reg) { st.beats.reg = 1; say("Every cell the same width to the micron. Nothing that grows keeps time like this.", 4, true); }
          }
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
      // charge bursts: the filament flickers before it fires
      for (const b of st.bursts) {
        const on2 = api.reducedMotion ? true : Math.floor(now / 90) % 2 === 0;
        if (!on2) continue;
        ctx.beginPath(); for (let v = -1.05; v <= 1.05; v += 0.04) ctx.lineTo(X(fx(b.f, v)), Y(v));
        ctx.strokeStyle = b.f.plane === st.focus ? "rgba(255,228,246,0.9)" : "rgba(214,64,159,0.5)"; ctx.lineWidth = R * 0.012; ctx.setLineDash([R * 0.03, R * 0.03]); ctx.stroke(); ctx.setLineDash([]);
      }
      // captured cells: a ring that opens out
      for (const p of st.pops) { const k = 1 - p.t / 0.6; ctx.strokeStyle = `rgba(233,255,251,${1 - k})`; ctx.lineWidth = 3; hexPath(X(p.x), Y(p.y), R * (0.06 + k * (api.reducedMotion ? 0 : 0.12))); ctx.stroke(); }
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
      if (st.holding) { ctx.fillStyle = "rgba(185,216,234,0.10)"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
      if (st.hurt > 0) { ctx.fillStyle = `rgba(214,64,159,${st.hurt * 0.6})`; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
      ctx.restore();
      // lens ring and progress
      ctx.strokeStyle = "#20282c"; ctx.lineWidth = R * 0.07; ctx.beginPath(); ctx.arc(cx, cy, R + R * 0.035, 0, 7); ctx.stroke();
      const prog = st.total / (NEEDS[0] + NEEDS[1] + NEEDS[2]);
      ctx.strokeStyle = TEAL; ctx.lineWidth = R * 0.03; ctx.beginPath(); ctx.arc(cx, cy, R + R * 0.035, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); ctx.stroke();
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k + 1) / 3 * Math.PI * 2; ctx.fillStyle = BLACK; ctx.strokeStyle = k < st.stage ? TEAL : MAG; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (R * 1.035), cy + Math.sin(a) * (R * 1.035), R * 0.03, 0, 7); ctx.fill(); ctx.stroke(); }
      // HUD
      let hx = L.hx, hy = L.hy;
      const line = (txt, size, col, gap = 8) => { ctx.font = `${size}px 'Courier Prime',monospace`; ctx.fillStyle = col; ctx.fillText(txt, hx, hy + size); hy += size + gap; };
      if (L.side) {
        line("B1-LENS · OUTPOST FRAGMENT", 13, ICE, 16);
        line(S.mag, 40, "#f2f4f5", 4); line(`MAG ${st.stage + 1} / 3`, 13, ICE, 16);
        line("FOCUS PLANE  (Q / E, 1–3)", 13, ICE, 6);
        PLANES.forEach((p, i) => { const sel = i === st.focus; ctx.strokeStyle = sel ? TEAL : MAG; ctx.lineWidth = 1.2; ctx.strokeRect(hx, hy, 170, 22); if (sel) { ctx.fillStyle = TEAL; ctx.fillRect(hx, hy, 170, 22); } ctx.fillStyle = sel ? BLACK : "#f08acb"; ctx.font = "14px 'Courier Prime',monospace"; ctx.fillText(`${i + 1} ${p} ${sel ? (blur ? "focusing…" : "SOLID") : "blur"}`, hx + 6, hy + 16); hy += 26; });
        hy += 10; line("STEADINESS", 13, ICE, 6);
        for (let i = 0; i < 3; i++) { const x = hx + 10 + i * 26, y = hy + 10; ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 9, y); ctx.closePath(); ctx.fillStyle = "#f2f4f5"; ctx.strokeStyle = "#f2f4f5"; ctx.lineWidth = 1.5; i < st.steady ? ctx.fill() : ctx.stroke(); }
        hy += 30;
        line(`CELLS ${st.got} / ${NEED()}  DRIFTS ${st.drifts} / 3`, 14, ICE, 10);
        line(`AFU ${S.afu.toFixed(2)}${S.afu > 0.7 ? "  PULSES ×2" : ""}`, 15, S.afu > 0.7 ? "#b48cff" : "#f08acb", 12);
        if (st.stage >= 1) { line(`BREATH (Space)${st.holding ? "  HELD" : ""}`, 13, ICE, 4); ctx.strokeStyle = ICE; ctx.lineWidth = 1; ctx.strokeRect(hx, hy, 170, 10); ctx.fillStyle = st.breath < 0.25 ? MAG : ICE; ctx.fillRect(hx + 1, hy + 1, 168 * st.breath, 8); hy += 20; }
        ctx.fillStyle = "#f2f4f5"; ctx.fillRect(hx, hy, 60, 3); line("", 4, ICE, 4); line(`${[100, 25, 6][st.stage]} µm`, 13, ICE);
      } else {
        line(`${S.mag}  MAG ${st.stage + 1}/3   FOCUS ${PLANES[st.focus].toUpperCase()} ${blur ? "…" : "SOLID"}`, 13, "#f2f4f5", 6);
        line(`STEADY ${"◆".repeat(st.steady)}${"◇".repeat(3 - st.steady)}  CELLS ${st.got}/${NEED()}  DRIFT ${st.drifts}/3`, 13, ICE, 6);
        line(`AFU ${S.afu.toFixed(2)}${S.afu > 0.7 ? "  PULSES ×2" : ""}${st.stage >= 1 ? `   BREATH ${"▮".repeat(Math.ceil(st.breath * 5))}${"▯".repeat(5 - Math.ceil(st.breath * 5))}` : ""}`, 13, S.afu > 0.7 ? "#b48cff" : "#f08acb", 6);
      }
      if (st.msgT > 0 && st.msg) {
        // wrapped caption in the micrograph's data-bar style
        ctx.font = st.voice ? "italic 16px 'IM Fell English',Georgia,serif" : "15px 'Courier Prime',monospace";
        const maxW = Math.min(W - 24, L.side ? 620 : W - 24), words = st.msg.split(" "), lines = [];
        let ln = ""; for (const w of words) { const t = ln ? ln + " " + w : w; if (ctx.measureText(t).width > maxW - 24 && ln) { lines.push(ln); ln = w; } else ln = t; } lines.push(ln);
        const bh = lines.length * 20 + 12, tw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 24);
        const my = L.side ? H - 70 - bh : Math.min(H - 76 - bh, hy + 6);
        const bx = L.side ? Math.max(12, Math.min(W - tw - 12, L.cx - tw / 2)) : W / 2 - tw / 2;
        ctx.fillStyle = "rgba(6,8,10,.92)"; ctx.fillRect(bx, my, tw, bh); ctx.strokeStyle = st.voice ? ICE : TEAL; ctx.lineWidth = 1; ctx.strokeRect(bx, my, tw, bh);
        if (st.voice) { ctx.fillStyle = TEAL; ctx.fillRect(bx, my, 4, bh); }
        ctx.fillStyle = "#f2f4f5"; lines.forEach((l, i) => ctx.fillText(l, bx + 12, my + 21 + i * 20));
      }
      ctx.font = "13px 'Courier Prime',monospace"; ctx.fillStyle = ICE; ctx.fillText("FLOW ↓", 16, H - 18);
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
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="disc">×100</div><div class="in">
      <div class="lab">SLIDE B1 · FALSE COLOUR</div><h2>Under the lens</h2>
      <p class="goal">Capture the lattice cells at three magnifications without losing the slide.</p>
      <dl><dt>steer</dt><dd>mouse, touch or arrows</dd><dt>focus</dt><dd>wheel, Q / E or the buttons</dd>
      <dt>rule</dt><dd><b class="t">Teal</b> is solid: touch its cells, dodge its pulses. <b class="m">Magenta</b> passes through.</dd></dl>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle"> Steadier hands: the flow runs 20% slower</label>` : ""}
      <button type="button">Place the slide</button></div></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { const g = intro.querySelector(".gentle"); st.gentle = !!(g && g.checked); intro.remove(); st.started = true; say("Book I. The fragment from the storm-struck outpost, threaded with micro‑filaments, clipped under the lens. ×100: capture five lattice cells.", 5.5, true); });
    sb.focus();
    if (window.__ezTest) window.__ezTest[api.key] = { st, keys };
    return { unmount() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); off.forEach((f) => f()); if (window.__ezTest) delete window.__ezTest[api.key]; } };
  },
};

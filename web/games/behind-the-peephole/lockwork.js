// Behind the Peephole / Lockwork (1D, lock picking). Style: patent exploded view: numbered parts
// pulled apart along dotted axes, fine line shading, on cream paper. One lock: the stair door
// (`n3_stair_lock`, DESIGN.md section 11): pin tumbler, 5 pins, 2 spool pins, tension band 35-55,
// three spare picks, each overset after the second breaks a pick. The world clock runs at 10x and
// is only shown (the night-three lock has no visitor); the 20-second binding-pin hint is kept.

const N = 5;
const ORDER = [2, 4, 0, 3, 1];            // binding order (pin indices), fixed for this lock
const SPOOL = new Set([4, 1]);            // pins 5 and 2 are spool pins
const SHEAR = [0.46, 0.62, 0.38, 0.7, 0.54]; // lift (0..1) at which each key pin meets the shear line
const WIN = 0.075;                         // width of the set window
const BAND = [35, 55], DROP = 20, JAM = 70, SPOOL_EASE = [30, 35];

export default {
  mount(root, api) {
    const P = "behind-the-peephole-lockwork-";
    const C = { paper: "#efe6cf", ink: "#1c1a17", faint: "#6f6650", brass: "#b8913f", brassL: "#e3c47a", steel: "#6f7c80", ev: "#a3302a", amber: "#e0a24a" };
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;font-family:Georgia,'Cormorant Garamond',serif;color:${C.ink};touch-action:none;user-select:none}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}pad{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding:0 12px}
    .${P}b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.06em;background:#fbf6e8;color:${C.ink};border:1.5px solid ${C.ink};min-width:52px;min-height:44px;padding:6px 12px;cursor:pointer;touch-action:none}
    .${P}b:active,.${P}b.on{background:${C.brassL}}
    .${P}msg{position:absolute;left:16px;right:16px;bottom:66px;text-align:center;font-style:italic;font-size:15px;min-height:1.3em;pointer-events:none}
    @media (max-width:560px){.${P}msg{bottom:118px;font-size:13px}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,230,207,.92);padding:16px;z-index:3}
    .${P}intro div{max-width:520px;border:1.5px solid ${C.ink};padding:20px 22px;background:#fbf6e8;font-size:15px;line-height:1.5}
    .${P}intro h2{margin:0 0 6px;font-style:italic;font-size:26px}
    .${P}intro kbd{font:12px 'IBM Plex Mono',monospace;border:1px solid ${C.faint};padding:0 4px}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.appendChild(wrap);
    const cv = document.createElement("canvas");
    wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const msgEl = document.createElement("div");
    msgEl.className = P + "msg";
    msgEl.setAttribute("aria-live", "polite");
    wrap.appendChild(msgEl);
    const pad = document.createElement("div");
    pad.className = P + "pad";
    pad.innerHTML = ["◀:left", "▶:right", "LIFT:lift", "TENSION −:tdown", "TENSION +:tup"].map((s) => { const [l, a] = s.split(":"); return `<button type="button" class="${P}b" data-a="${a}">${l}</button>`; }).join("");
    wrap.appendChild(pad);

    // ---- state
    let tension = 0, cur = 0, picks = 3, oversets = 0, over = false, started = false;
    const pins = Array.from({ length: N }, () => ({ h: 0, set: false, over: false, spool: false }));
    let plugTurn = 0, lifting = false, tUp = false, tDown = false, lastProgress = performance.now(), msgT = 0, turning = 0;
    const t0 = performance.now();
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const say = (m) => { msgEl.textContent = m; msgT = performance.now(); };

    const binding = () => ORDER.find((i) => !pins[i].set);
    const setCount = () => pins.filter((p) => p.set).length;

    function dropAll() {
      let any = false;
      pins.forEach((p) => { if (p.set || p.over || p.spool) any = true; p.set = false; p.over = false; p.spool = false; });
      plugTurn = 0;
      if (any) say("Tension let go: every pin drops back. The plug is home.");
    }
    function release() {
      // lifting stops: a binding pin in its window, under the right tension, sets (or false-sets)
      const p = pins[cur], b = binding();
      lifting = false;
      if (over || p.set || p.over || cur !== b) return;
      const s = SHEAR[cur];
      const inWin = p.h >= s && p.h <= s + WIN;
      if (!inWin) return;
      if (p.spool) {
        if (tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1]) {
          p.spool = false; p.set = true; plugTurn = setCount(); lastProgress = performance.now();
          say(`Pin ${cur + 1} sets past its spool. Bring the tension back into the band.`);
        }
        return;
      }
      if (tension >= BAND[0] && tension <= BAND[1]) {
        if (SPOOL.has(cur)) {
          p.spool = true; plugTurn = setCount() + 5; lastProgress = performance.now();
          say(`A false set: the plug gives 5° and pin ${cur + 1} pushes back. Ease the tension to 30–35 and lift it again.`);
        } else {
          p.set = true; plugTurn = setCount(); lastProgress = performance.now();
          say(`Click. Pin ${cur + 1} sets; the plug turns 1°.`);
        }
      }
    }
    function overset(i) {
      const p = pins[i];
      p.over = true; oversets++;
      if (oversets > 2) {
        picks--;
        say(picks > 0 ? `Overset, and the hook snaps. ${picks} spare pick${picks === 1 ? "" : "s"} left. Release the tension to reset.` : "Overset. The last pick snaps in the keyway.");
        if (picks <= 0) lose();
      } else say(`Pin ${i + 1} pushed past the shear line: overset. Let the tension go (under 20) to reset.`);
    }
    function lose() {
      over = true;
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: "Out of picks. The stair door stays locked tonight; it will be there again on night six, with one pick restored." }), 900));
    }
    function win() {
      over = true; turning = performance.now();
      api.store.set("opened", true);
      say("All five set. The plug turns.");
      timers.push(setTimeout(() => api.end({ outcome: "win", text: `The stair door opens on the back stair, and the chute's steel box below. ${picks} spare pick${picks === 1 ? "" : "s"} left, ${oversets} overset${oversets === 1 ? "" : "s"}.` }), 1500));
    }

    function step(dt) {
      if (!started || over) return;
      if (tUp) tension = Math.min(100, tension + 38 * dt);
      if (tDown) tension = Math.max(0, tension - 38 * dt);
      if (tension < DROP) { if (pins.some((p) => p.set || p.over || p.spool)) dropAll(); }
      const b = binding();
      pins.forEach((p, i) => {
        if (p.set) { p.h = Math.max(0, p.h - 2 * dt); return; }
        if (p.over) { p.h = SHEAR[i] + WIN + 0.08; return; }
        if (i === cur && lifting) {
          let max = 1;
          if (i === b && tension > JAM) { max = 0.12; if (p.h >= max - 0.01 && performance.now() - msgT > 1500) say("Too much tension: the pins are jammed."); }
          if (p.spool && tension > SPOOL_EASE[1]) max = SHEAR[i] - 0.06;
          p.h = Math.min(max, p.h + 0.34 * dt);
          if (i === b && !p.spool && tension >= BAND[0] && tension <= JAM && p.h > SHEAR[i] + WIN) overset(i);
          if (i === b && p.spool && tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1] && p.h > SHEAR[i] + WIN) overset(i);
        } else {
          const rest = p.spool ? SHEAR[i] - 0.18 : 0;
          p.h = Math.max(rest, p.h - 1.3 * dt);
        }
      });
      if (setCount() === N && tension >= BAND[0] - 5) win();
    }

    // ---- drawing
    let W = 0, H = 0, G = {};
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = W < 560;
      const gx = narrow ? 26 : Math.max(46, W * 0.06);
      const L = gx + (narrow ? 44 : 90), R = W - (narrow ? 40 : W * 0.14);
      const cy = H * (narrow ? 0.6 : 0.6);
      const rp = Math.min(H * 0.085, (R - L) * 0.11, 60);
      G = { gx, L, R, cy, rp, shear: cy - rp, T: rp * 1.25, gTop: H * 0.2, gBot: H * 0.8 - 30, narrow };
      G.xs = Array.from({ length: N }, (_, i) => L + (R - L) * (0.16 + i * 0.16));
      G.pw = Math.min(26, (R - L) * 0.07);
    }
    const line = (x1, y1, x2, y2, w = 1, c = C.ink, dash) => { ctx.beginPath(); ctx.setLineDash(dash || []); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]); };
    function hatch(x, y, w, h, gap = 6, c = C.faint) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      for (let k = -h; k < w; k += gap) line(x + k, y + h, x + k + h, y, 0.6, c);
      ctx.restore();
    }
    function label(n, x, y, tx, ty) {
      ctx.beginPath(); ctx.lineWidth = 0.7; ctx.strokeStyle = C.ink;
      ctx.moveTo(x, y); ctx.quadraticCurveTo((x + tx) / 2, y, tx, ty); ctx.stroke();
      ctx.font = `italic ${G.narrow ? 11 : 13}px Georgia,serif`; ctx.fillStyle = C.ink;
      ctx.fillText(String(n), tx + (tx > x ? 3 : -16), ty + 4);
    }
    function drawPin(x, top, len, w, kind, spool) {
      // a pin as a steel cylinder in side view, fine line shading
      ctx.fillStyle = "#fbf6e8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1;
      ctx.beginPath();
      if (kind === "key") { ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, top + len - w * 0.5); ctx.lineTo(x, top + len); ctx.lineTo(x - w / 2, top + len - w * 0.5); ctx.closePath(); }
      else if (spool) { const n = w * 0.28; ctx.moveTo(x - w / 2, top); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w / 2, top + len * 0.25); ctx.lineTo(x + w / 2 - n, top + len * 0.35); ctx.lineTo(x + w / 2 - n, top + len * 0.65); ctx.lineTo(x + w / 2, top + len * 0.75); ctx.lineTo(x + w / 2, top + len); ctx.lineTo(x - w / 2, top + len); ctx.lineTo(x - w / 2, top + len * 0.75); ctx.lineTo(x - w / 2 + n, top + len * 0.65); ctx.lineTo(x - w / 2 + n, top + len * 0.35); ctx.lineTo(x - w / 2, top + len * 0.25); ctx.closePath(); }
      else ctx.rect(x - w / 2, top, w, len);
      ctx.fill(); ctx.stroke();
      for (let k = 1; k <= 3; k++) line(x + w / 2 - k * w * 0.11, top + 3, x + w / 2 - k * w * 0.11, top + len - (kind === "key" ? w * 0.5 : 3), 0.5, C.faint);
    }
    function spring(x, y1, y2, w) {
      ctx.beginPath(); ctx.lineWidth = 0.9; ctx.strokeStyle = C.ink;
      const n = 9; ctx.moveTo(x, y1);
      for (let k = 1; k <= n; k++) ctx.lineTo(x + (k % 2 ? w / 2 : -w / 2), y1 + (y2 - y1) * k / n);
      ctx.lineTo(x, y2); ctx.stroke();
    }

    function render(now) {
      const { gx, L, R, cy, rp, shear, T, gTop, gBot, xs, pw } = G;
      ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
      // sheet border and title block
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.font = `${G.narrow ? 11 : 13}px Georgia,serif`; ctx.fillText("Sheet 2 of 4", W / 2, 26);
      ctx.font = `italic ${G.narrow ? 18 : 24}px Georgia,serif`; ctx.fillText("FIG. 3  ·  the stair door", W / 2, G.narrow ? 76 : 80);
      ctx.textAlign = "left";
      const gm = Math.floor(((now - t0) / 1000) * 10 / 60);
      const hh = (0 + Math.floor((50 + gm) / 60)) % 24, mm = (50 + gm) % 60;
      ctx.font = "12px 'IBM Plex Mono',monospace";
      ctx.fillText(`◷ ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, 20, 30);
      ctx.textAlign = "right";
      ctx.fillText(`picks remaining: ${picks}`, W - 20, 30);
      for (let k = 0; k < 3; k++) {
        const x = W - 30 - k * 16;
        ctx.globalAlpha = k < picks ? 1 : 0.18;
        line(x, 38, x, 62, 1.3); ctx.beginPath(); ctx.arc(x - 4, 38, 4, 0, Math.PI, true); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = "left";

      // tension gauge (26), with the band hatched
      const gy = (v) => gBot - (gBot - gTop) * v / 100;
      ctx.strokeRect(gx - 8, gTop, 16, gBot - gTop);
      hatch(gx - 8, gy(BAND[1]), 16, gy(BAND[0]) - gy(BAND[1]), 4, C.ink);
      ctx.font = "10px 'IBM Plex Mono',monospace";
      for (const v of [0, 20, 35, 55, 70, 100]) { line(gx + 8, gy(v), gx + 14, gy(v), 0.8); ctx.fillText(String(v), gx + 16, gy(v) + 3); }
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(gx - 10, gy(tension)); ctx.lineTo(gx - 20, gy(tension) - 6); ctx.lineTo(gx - 20, gy(tension) + 6); ctx.fill();
      ctx.fillStyle = tension > JAM ? C.ev : C.brass; ctx.fillRect(gx - 6, gy(tension), 12, gBot - gy(tension));
      ctx.fillStyle = C.ink;
      label(26, gx, gTop, gx + 30, gTop - 16);

      // shell (10): the housing above the shear line, bored for five chambers, exploded upward
      const shellTop = shear - T * 2.3;
      const ang = (plugTurn + (over && turning ? Math.min(90, (now - turning) / 12) : 0)) * Math.PI / 180;
      ctx.strokeRect(L, shellTop, R - L, shear - shellTop);
      hatch(L, shellTop, R - L, shear - shellTop, 7);
      xs.forEach((x) => { ctx.fillStyle = C.paper; ctx.fillRect(x - pw / 2 - 3, shellTop, pw + 6, shear - shellTop); line(x - pw / 2 - 3, shellTop, x - pw / 2 - 3, shear, 0.8); line(x + pw / 2 + 3, shellTop, x + pw / 2 + 3, shear, 0.8); });
      // cap strip pulled off along dotted axes
      const capY = shellTop - T * 0.75;
      ctx.strokeRect(L + 6, capY - 12, R - L - 12, 12); hatch(L + 6, capY - 12, R - L - 12, 12, 5);
      xs.forEach((x) => line(x, capY, x, shellTop, 0.7, C.ink, [2, 4]));
      label(10, L, shellTop + 10, L - 30, shellTop - 8);

      // plug (20): cylinder in side view, rotating slightly as pins set
      const off = Math.sin(ang) * rp * 0.7;
      ctx.fillStyle = "#f7f0dc"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(L, cy, rp * 0.28, rp, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L, cy - rp); ctx.lineTo(R, cy - rp); ctx.lineTo(R, cy + rp); ctx.lineTo(L, cy + rp); ctx.fill();
      line(L, cy - rp, R, cy - rp, 1.3); line(L, cy + rp, R, cy + rp, 1.3);
      ctx.beginPath(); ctx.ellipse(R, cy, rp * 0.28, rp, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      for (let k = 0; k < 7; k++) { const yy = cy - rp + rp * 2 * (k + 0.5) / 7 + off * (1 - Math.abs(k - 3) / 4) * 0.4; line(L + 4, yy, R - 4, yy, 0.45, C.faint); }
      // keyway
      ctx.fillStyle = "#e6dcc2"; ctx.fillRect(L + 8, cy + rp * 0.15, R - L - 16, rp * 0.45);
      line(L + 8, cy + rp * 0.15, R - 8, cy + rp * 0.15, 0.7); line(L + 8, cy + rp * 0.6, R - 8, cy + rp * 0.6, 0.7);
      label(20, L + 20, cy + rp, L - 6, cy + rp + 26);
      if (plugTurn) { ctx.font = "italic 13px Georgia,serif"; ctx.fillStyle = C.ink; ctx.fillText(`${plugTurn}°`, R + 14, cy + 4); }
      // shear line S
      line(L - 20, shear, R + 30, shear, 1, C.ink, [10, 4, 2, 4]);
      ctx.font = "italic 14px Georgia,serif"; ctx.fillText("S", R + 34, shear + 5);

      // pins: key pins (18), drivers (14) or spools (16), springs (12)
      const b = binding();
      const keyLen = rp * 0.95;
      xs.forEach((x, i) => {
        const p = pins[i];
        const keyTop = shear + (SHEAR[i] - p.h) * T;
        let drvBot = p.set ? shear - 1 : keyTop - 1;
        if (p.over) drvBot = keyTop - 1;
        const drvLen = T * 0.62;
        const sprTop = shellTop + 4;
        // hint: the binding pin glows faintly after 20 s without progress
        if (i === b && now - lastProgress > 20000 && !over) {
          ctx.fillStyle = "rgba(224,162,74,.35)"; ctx.fillRect(x - pw, shear - T * 1.6, pw * 2, T * 2.2 + keyLen * 0.4);
        }
        spring(x, sprTop, drvBot - drvLen, pw * 0.8);
        drawPin(x, drvBot - drvLen, drvLen, pw, "drv", SPOOL.has(i));
        drawPin(x, Math.max(keyTop, shear - T * 0.8), keyLen, pw * 0.92, "key");
        if (p.set) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, shear - drvLen - 14 - T * 0.2, 2.5, 0, 7); ctx.fill(); }
        if (p.over) { ctx.font = "bold 13px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("over", x, shear + rp + 18); ctx.textAlign = "left"; }
        if (p.spool) { ctx.font = "italic 12px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("false set", x, shear + rp + 18); ctx.textAlign = "left"; }
        // dotted axis and part number
        line(x, sprTop - 6, x, capY + 2, 0.6, C.ink, [1, 4]);
        ctx.font = `${G.narrow ? 10 : 12}px 'IBM Plex Mono',monospace`; ctx.fillStyle = C.ink; ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, capY - 18);
        ctx.textAlign = "left";
      });
      label(12, xs[0], shellTop + T * 0.4, xs[0] - pw * 2.2, shellTop + T * 0.2);
      label(SPOOL.has(1) ? 16 : 14, xs[1], shear - T * 0.9, xs[1] + pw * 1.6, shear - T * 1.3);
      label(18, xs[N - 1], shear + rp * 0.2, xs[N - 1] + pw * 1.8, shear + rp * 0.9);

      // hook pick (22) from the right, its tip under the current pin
      const tipX = xs[cur], tipY = Math.min(cy + rp * 0.55, shear + (SHEAR[cur] - pins[cur].h) * T + keyLen + 2);
      const handleY = cy + rp * 0.4;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(W - 14, handleY + 4); ctx.lineTo(R + 10, handleY + 2); ctx.lineTo(tipX + 14, handleY); ctx.quadraticCurveTo(tipX + 4, handleY, tipX, tipY); ctx.stroke();
      ctx.fillStyle = "#fbf6e8"; ctx.fillRect(R + 20, handleY - 4, Math.max(10, W - R - 30), 12); ctx.strokeRect(R + 20, handleY - 4, Math.max(10, W - R - 30), 12);
      label(22, R + 40, handleY + 8, R + 50, handleY + 34);
      // tension wrench (24)
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(L + 10, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 1.8); ctx.lineTo(L - 24, cy + rp * 1.8 + tension * 0.25); ctx.stroke();
      label(24, L - 6, cy + rp * 1.4, L + 26, cy + rp * 2.0);
      if (now - msgT > 6000 && msgEl.textContent && !over) msgEl.textContent = "";
    }

    let raf = 0, last = performance.now();
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      step(dt); render(now);
      raf = requestAnimationFrame(loop);
    };

    // ---- input
    const move = (d) => { if (over) return; release(); cur = Math.max(0, Math.min(N - 1, cur + d)); };
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); if (!e.repeat) move(-1); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); if (!e.repeat) move(1); }
      else if (k === "ArrowUp" || k === " ") { e.preventDefault(); lifting = true; }
      else if (k === "w" || k === "W") tUp = true;
      else if (k === "s" || k === "S" || k === "ArrowDown") { e.preventDefault(); tDown = true; }
    });
    on(window, "keyup", (e) => {
      const k = e.key;
      if (k === "ArrowUp" || k === " ") release();
      if (k === "w" || k === "W") tUp = false;
      if (k === "s" || k === "S" || k === "ArrowDown") tDown = false;
    });
    // pad buttons (hold)
    pad.querySelectorAll("button").forEach((b) => {
      const a = b.dataset.a;
      on(b, "pointerdown", (e) => {
        e.preventDefault(); if (!started || over) return; b.classList.add("on");
        if (a === "left") move(-1); if (a === "right") move(1);
        if (a === "lift") lifting = true; if (a === "tup") tUp = true; if (a === "tdown") tDown = true;
      });
      const up = () => { b.classList.remove("on"); if (a === "lift") release(); if (a === "tup") tUp = false; if (a === "tdown") tDown = false; };
      on(b, "pointerup", up); on(b, "pointerleave", up); on(b, "pointercancel", up);
    });
    // pointer on the drawing: the gauge sets tension; over the lock, x picks a pin and dragging up lifts
    let ptr = null;
    on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      cv.setPointerCapture(e.pointerId);
      if (x < G.gx + 30) { ptr = { kind: "gauge" }; tension = Math.max(0, Math.min(100, 100 * (G.gBot - y) / (G.gBot - G.gTop))); return; }
      let bi = 0, bd = 1e9; G.xs.forEach((px, i) => { if (Math.abs(px - x) < bd) { bd = Math.abs(px - x); bi = i; } });
      if (bi !== cur) { release(); cur = bi; }
      ptr = { kind: "pick", y0: y, h0: pins[cur].h };
      lifting = false;
    });
    on(cv, "pointermove", (e) => {
      if (!ptr || over) return;
      const r = cv.getBoundingClientRect(), y = e.clientY - r.top;
      if (ptr.kind === "gauge") tension = Math.max(0, Math.min(100, 100 * (G.gBot - y) / (G.gBot - G.gTop)));
      else lifting = ptr.y0 - y > 6;
    });
    const pup = () => { if (ptr && ptr.kind === "pick") release(); ptr = null; };
    on(cv, "pointerup", pup); on(cv, "pointercancel", pup);
    on(cv, "wheel", (e) => { if (!started || over) return; e.preventDefault(); tension = Math.max(0, Math.min(100, tension - Math.sign(e.deltaY) * 3)); }, { passive: false });

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    resize();

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>Lockwork · the stair door</h2>
      <p>Hold the tension in the hatched band (35–55) and lift the pins one by one. Only the binding pin will set: release it just as it meets the shear line <i>S</i>. Lift too far and it oversets; let the tension go under 20 to reset. Pins 2 and 5 may be spools: ease to 30–35 to pass them.</p>
      <p><kbd>W</kbd>/<kbd>S</kbd> or the gauge: tension. <kbd>←</kbd><kbd>→</kbd>: move the hook. Hold <kbd>↑</kbd> or drag up: lift. Three spare picks.</p>
      <button type="button" class="${P}b">START</button></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); started = true; lastProgress = performance.now(); say("Bring the tension up into the band first."); });
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

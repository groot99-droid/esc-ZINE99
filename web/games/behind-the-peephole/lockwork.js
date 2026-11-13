// Behind the Peephole / Lockwork (1D, lock picking). Style: patent exploded view: numbered parts
// pulled apart along dotted axes, fine line shading, on cream paper. One lock: the stair door
// (`n3_stair_lock`, DESIGN.md section 11): pin tumbler, 5 pins, 2 spool pins, tension band 35-55,
// three spare picks, each overset after the second breaks a pick. The world clock runs at 10x and
// is only shown (the night-three lock has no visitor); the 20-second binding-pin hint is kept.
// Actions: TENSION (the wrench), LIFT (the hook), FEEL (read the pin under the hook: binding, set,
// loose, or a spool) and the RAKE from the tool roll (DESIGN.md section 11 names it): fast and
// risky, two strokes. Phases: plain pins, then the spools' false set, then the last pin.

const N = 5;
const ORDER = [2, 4, 0, 3, 1];            // binding order (pin indices), fixed for this lock
const SPOOL = new Set([4, 1]);            // pins 5 and 2 are spool pins
const SHEAR = [0.46, 0.62, 0.38, 0.7, 0.54]; // lift (0..1) at which each key pin meets the shear line
const BAND = [35, 55], DROP = 20, JAM = 70, SPOOL_EASE = [30, 35];
const LIFT_SPEED = 0.26;
const NOTES = {
  open: "Night three, 00:50. The stair door at the far end of the passage, locked from your side. Lew said only: \"Stair door's locked from your side. Someone's idea.\"",
  first: "Click. One of five. The brass is colder than the passage.",
  spool: "A false set. The plug gives, and lies to you. Ease off and lift again.",
  rakeUnlock: "The rake is in the roll: a stroke across every pin at once. Fast, and it does not care which pin it oversets.",
  chute: "Somewhere below the door, a steel box takes a page with a soft knock. Something has gone down the chute tonight already.",
  last: "One pin left. Your hand is steadier than it was on night one.",
};

export default {
  mount(root, api) {
    const P = "behind-the-peephole-lockwork-";
    const C = { paper: "#efe6cf", ink: "#1c1a17", faint: "#6f6650", brass: "#b8913f", brassL: "#e3c47a", steel: "#6f7c80", ev: "#a3302a", amber: "#e0a24a", blue: "#2a3a8c" };
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const rnd = api.rng();
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;font-family:Georgia,'Cormorant Garamond',serif;color:${C.ink};touch-action:none;user-select:none}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}pad{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;flex-wrap:wrap;gap:6px;padding:0 10px}
    .${P}b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.05em;background:#fbf6e8;color:${C.ink};border:1.5px solid ${C.ink};min-width:48px;min-height:44px;padding:6px 10px;cursor:pointer;touch-action:none;transition:background .12s}
    .${P}b:hover,.${P}b:focus-visible{background:#f3e3b8;outline:none}
    .${P}b:active,.${P}b.on{background:${C.brassL}}
    .${P}b[hidden]{display:none}
    .${P}b[disabled]{opacity:.4}
    .${P}b.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px ${C.ev}}}
    .${P}cap{position:absolute;left:50%;transform:translateX(-50%);width:min(640px,calc(100% - 28px));text-align:center;font-size:16px;line-height:1.35;pointer-events:none}
    .${P}cap i{display:block}
    .${P}cap .story{color:${C.blue};font-size:15px;margin-top:4px}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,230,207,.94);padding:12px;z-index:3;overflow:auto}
    .${P}patent{max-width:540px;width:100%;border:1.5px solid ${C.ink};padding:18px 20px 16px;background:#fbf6e8;font-size:15px;line-height:1.45;position:relative;box-shadow:inset 0 0 0 5px #fbf6e8,inset 0 0 0 6px ${C.ink}}
    .${P}patent .no{font:12px 'IBM Plex Mono',monospace;letter-spacing:.14em;display:flex;justify-content:space-between}
    .${P}patent h2{margin:8px 0 2px;font-style:italic;font-weight:400;font-size:28px;text-align:center}
    .${P}patent .goal{text-align:center;margin:0 0 8px}
    .${P}patent .open{font-size:14px;color:${C.blue};margin:0 0 10px}
    .${P}patent ol{margin:0 0 10px;padding-left:0;list-style:none;display:grid;gap:4px}
    .${P}patent li{display:grid;grid-template-columns:2.2em 6.2em 1fr;gap:6px;align-items:baseline}
    .${P}patent li span:first-child{font-style:italic}
    .${P}patent li b{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.06em}
    .${P}patent kbd{font:12px 'IBM Plex Mono',monospace;border:1px solid ${C.faint};padding:0 4px;background:#fff}
    .${P}patent .ft{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;border-top:1px solid ${C.ink};padding-top:10px}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.appendChild(wrap);
    const cv = document.createElement("canvas");
    wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const cap = document.createElement("div");
    cap.className = P + "cap";
    cap.setAttribute("aria-live", "polite");
    cap.innerHTML = `<i></i><div class="story"></div>`;
    wrap.appendChild(cap);
    const capMsg = cap.querySelector("i"), capStory = cap.querySelector(".story");
    const pad = document.createElement("div");
    pad.className = P + "pad";
    pad.innerHTML = ["◀:left", "▶:right", "LIFT ↑:lift", "TENSION −:tdown", "TENSION +:tup", "FEEL · F:feel:1", "RAKE · R:rake:1"].map((s) => { const [l, a, h] = s.split(":"); return `<button type="button" class="${P}b" data-a="${a}"${h ? " hidden" : ""}>${l}</button>`; }).join("");
    wrap.appendChild(pad);
    const btn = (a) => pad.querySelector(`[data-a="${a}"]`);

    // ---- state
    const WINW = () => (gentle ? 0.12 : 0.09);
    let tension = 0, cur = 0, picks = gentle ? 4 : 3, oversets = 0, over = false, started = false, rakes = 2;
    const pins = Array.from({ length: N }, () => ({ h: 0, set: false, over: false, spool: false, fx: 0, bad: 0 }));
    let plugTurn = 0, lifting = false, tUp = false, tDown = false, lastProgress = performance.now(), msgT = 0, turning = 0, feltAny = false;
    const t0 = performance.now();
    const listeners = [], timers = [], told = new Set();
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const say = (m) => { capMsg.textContent = m; msgT = performance.now(); };
    const tell = (m) => { capStory.textContent = m; };
    const unlocked = new Set();
    function unlock(a, text) { if (unlocked.has(a)) return; unlocked.add(a); const b = btn(a); b.hidden = false; b.classList.add("new"); timers.push(setTimeout(() => b.classList.remove("new"), 3200)); if (text) tell(text); layoutCap(); }

    const binding = () => ORDER.find((i) => !pins[i].set);
    const setCount = () => pins.filter((p) => p.set).length;
    function progressBeats() {
      const n = setCount();
      if (n >= 1 && !told.has("first")) { told.add("first"); tell(NOTES.first); }
      if (n >= 2) unlock("rake", NOTES.rakeUnlock);
      if (n >= 3 && !told.has("chute")) { told.add("chute"); tell(NOTES.chute); }
      if (n === 4 && !told.has("last")) { told.add("last"); tell(NOTES.last); }
    }

    function dropAll() {
      let any = false;
      pins.forEach((p) => { if (p.set || p.over || p.spool) any = true; p.set = false; p.over = false; p.spool = false; });
      plugTurn = 0;
      if (any) say("Tension let go: every pin drops back. The plug is home.");
    }
    function setPin(i, how) {
      const p = pins[i];
      p.set = true; p.spool = false; p.fx = performance.now(); plugTurn = setCount(); lastProgress = performance.now();
      say(how || `Click. Pin ${i + 1} sets; the plug turns 1°.`);
      progressBeats();
    }
    function release() {
      const p = pins[cur], b = binding();
      lifting = false;
      if (over || p.set || p.over || cur !== b) return;
      const s = SHEAR[cur];
      const inWin = p.h >= s && p.h <= s + WINW();
      if (!inWin) return;
      if (p.spool) {
        if (tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1]) setPin(cur, `Pin ${cur + 1} slips past its spool and sets. Bring the tension back into the band.`);
        else say("The spool pushes back. Ease the tension to 30–35 first.");
        return;
      }
      if (tension >= BAND[0] && tension <= BAND[1]) {
        if (SPOOL.has(cur)) {
          p.spool = true; plugTurn = setCount() + 5; lastProgress = performance.now(); p.fx = performance.now();
          say(`A false set: the plug gives 5° and pin ${cur + 1} pushes back. Ease the tension to 30–35 and lift it again.`);
          if (!told.has("spool")) { told.add("spool"); tell(NOTES.spool); }
        } else setPin(cur);
      } else say(tension < BAND[0] ? "It reached the line, but the plug had no tension to catch it." : "Too much tension: it would not catch.");
    }
    function overset(i) {
      const p = pins[i];
      p.over = true; p.bad = performance.now(); oversets++;
      if (oversets > 2) {
        picks--;
        say(picks > 0 ? `Overset, and the hook snaps. ${picks} spare pick${picks === 1 ? "" : "s"} left. Let the tension go to reset.` : "Overset. The last pick snaps in the keyway.");
        if (picks <= 0) lose();
      } else say(`Pin ${i + 1} pushed past the shear line: overset. Let the tension go (under 20) to reset. ${2 - oversets === 0 ? "The next overset breaks a pick." : ""}`);
    }
    function feel() {
      if (!started || over) return;
      feltAny = true;
      const p = pins[cur], b = binding();
      if (tension < DROP) { say("No tension on the plug: every pin feels the same."); return; }
      if (p.set) say(`Pin ${cur + 1}: set. It sits on the shear line.`);
      else if (p.over) say(`Pin ${cur + 1}: dead. Overset; let the tension go.`);
      else if (cur === b && (SPOOL.has(cur))) say(`Pin ${cur + 1}: stiff, with a give in it. It binds, and it is a spool.`);
      else if (cur === b) say(`Pin ${cur + 1}: stiff. This one binds.`);
      else say(`Pin ${cur + 1}: springy. Not this one yet.`);
    }
    function rake() {
      if (!started || over || !unlocked.has("rake") || rakes <= 0) return;
      rakes--; btn("rake").textContent = `RAKE · R (${rakes})`; btn("rake").disabled = rakes <= 0;
      if (tension < BAND[0] || tension > BAND[1]) { say("The rake skates across the pins. Nothing catches outside the band."); return; }
      let n = 0;
      for (let k = 0; k < N; k++) {
        const i = binding();
        if (i == null) break;
        const p = pins[i];
        if (p.over) break;
        if (SPOOL.has(i) && !p.spool) { p.spool = true; p.h = SHEAR[i] - 0.18; plugTurn = setCount() + 5; say(`${n ? n + " set under the rake, then " : ""}a false set at pin ${i + 1}: a spool.`); if (!told.has("spool")) { told.add("spool"); tell(NOTES.spool); } return; }
        if (p.spool) break;
        if (rnd() < 0.55) { p.set = true; p.fx = performance.now(); n++; plugTurn = setCount(); lastProgress = performance.now(); continue; }
        if (rnd() < 0.5) { p.h = SHEAR[i] + WINW() + 0.08; overset(i); return; }
        break;
      }
      say(n ? `The rake sets ${n} pin${n === 1 ? "" : "s"} in one stroke.` : "The rake rattles across. Nothing sets.");
      progressBeats();
      if (setCount() === N) win();
    }
    function lose() {
      over = true;
      api.store.set("lossStreak", streak + 1);
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: "The last pick snaps in the keyway. The stair door stays locked tonight; it will be there again on night six, with one pick restored, and whatever goes down the chute goes down without you seeing where." }), 1100));
    }
    function win() {
      if (over) return;
      over = true; turning = performance.now();
      api.store.set("opened", true); api.store.set("lossStreak", 0);
      say("All five set. The plug turns.");
      const neat = oversets === 0 ? "Not one overset: a locksmith's opening." : `${oversets} overset${oversets === 1 ? "" : "s"} on the way.`;
      timers.push(setTimeout(() => api.end({ outcome: "win", text: `The plug turns and the stair door opens on the back stair, and the chute's steel box below it. Whoever empties it comes up this way. ${picks} spare pick${picks === 1 ? "" : "s"} left. ${neat}` }), 1600));
    }

    function step(dt) {
      if (!started || over) return;
      if (tUp) tension = Math.min(100, tension + 30 * dt);
      if (tDown) tension = Math.max(0, tension - 30 * dt);
      if (tension < DROP) { if (pins.some((p) => p.set || p.over || p.spool)) dropAll(); }
      const b = binding();
      pins.forEach((p, i) => {
        if (p.set) { p.h = Math.max(0, p.h - 2 * dt); return; }
        if (p.over) { p.h = SHEAR[i] + WINW() + 0.08; return; }
        if (i === cur && lifting) {
          let max = 1;
          if (i === b && tension > JAM) { max = 0.12; if (p.h >= max - 0.01 && performance.now() - msgT > 1500) say("Too much tension: the pins are jammed."); }
          if (p.spool && tension > SPOOL_EASE[1]) max = SHEAR[i] - 0.06;
          p.h = Math.min(max, p.h + LIFT_SPEED * dt);
          if (i === b && !p.spool && tension >= BAND[0] && tension <= JAM && p.h > SHEAR[i] + WINW()) overset(i);
          if (i === b && p.spool && tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1] && p.h > SHEAR[i] + WINW()) overset(i);
        } else {
          const rest = p.spool ? SHEAR[i] - 0.18 : 0;
          p.h = Math.max(rest, p.h - 1.3 * dt);
        }
      });
      if (!unlocked.has("feel") && performance.now() - t0 > 0 && (performance.now() - lastProgress > 9000 || setCount() >= 1)) unlock("feel", "Feel (F): touch the pin under the hook. Under tension, the binding pin is the stiff one.");
      if (setCount() === N && tension >= BAND[0] - 5) win();
    }

    // ---- drawing
    let W = 0, H = 0, G = {};
    const grain = document.createElement("canvas");
    function layoutCap() {
      const padH = pad.getBoundingClientRect().height || 50;
      cap.style.bottom = padH + 18 + "px";
    }
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutCap();
      const narrow = W < 560;
      const padH = pad.getBoundingClientRect().height || 50;
      const bottom = H - padH - (narrow ? 110 : 90);
      const gx = narrow ? 40 : Math.max(48, W * 0.06);
      const L = gx + (narrow ? 50 : 96), R = W - (narrow ? 34 : Math.max(W * 0.16, 200));
      const top = narrow ? 122 : 120;
      const rp = Math.min((bottom - top) * 0.13, (R - L) * 0.11, 60);
      const T = rp * 1.25;
      // vertical stack: cap strip, shell, plug: centre it in the space between the title and the caption
      const stackTop = top + 40, stackH = T * 3.05 + rp * 2.4;
      const cy = stackTop + Math.max(0, (bottom - stackTop - stackH) / 2) + T * 3.05 + rp;
      G = { gx, L, R, cy, rp, shear: cy - rp, T, gTop: top + 10, gBot: bottom, narrow };
      G.xs = Array.from({ length: N }, (_, i) => L + (R - L) * (0.16 + i * 0.16));
      G.pw = Math.min(26, (R - L) * 0.07);
      wrap.dataset.gauge = `${gx},${G.gTop},${G.gBot}`;
      // paper grain, drawn once
      grain.width = cv.width; grain.height = cv.height;
      const g = grain.getContext("2d"), rr = api.rng(3);
      g.fillStyle = C.paper; g.fillRect(0, 0, grain.width, grain.height);
      for (let i = 0; i < (W * H) / 260; i++) { g.fillStyle = rr() < 0.5 ? "rgba(120,100,60,.08)" : "rgba(255,255,255,.25)"; g.fillRect(rr() * grain.width, rr() * grain.height, 1 + rr() * 2 * dpr, 1 + rr() * 2 * dpr); }
      const v = g.createRadialGradient(grain.width / 2, grain.height / 2, grain.height * 0.3, grain.width / 2, grain.height / 2, grain.width * 0.75);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(120,90,40,.16)");
      g.fillStyle = v; g.fillRect(0, 0, grain.width, grain.height);
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
      ctx.font = `italic ${G.narrow ? 13 : 14}px Georgia,serif`; ctx.fillStyle = C.ink;
      ctx.fillText(String(n), tx + (tx > x ? 3 : -18), ty + 4);
    }
    function drawPin(x, top, len, w, kind, spool, tint) {
      ctx.fillStyle = tint || "#fbf6e8"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1;
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

    let hoverPin = -1;
    function render(now) {
      const { gx, L, R, cy, rp, shear, T, gTop, gBot, xs, pw } = G;
      ctx.drawImage(grain, 0, 0, W, H);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.lineWidth = 0.6; ctx.strokeRect(12, 12, W - 24, H - 24);
      ctx.fillStyle = C.ink; ctx.textAlign = "center";
      ctx.font = `13px Georgia,serif`; ctx.fillText("Sheet 2 of 4", W / 2, 30);
      ctx.font = `italic ${G.narrow ? 20 : 26}px Georgia,serif`; ctx.fillText("FIG. 3  ·  the stair door", W / 2, G.narrow ? 76 : 70);
      ctx.font = "italic 13px Georgia,serif"; ctx.fillText("Inventor: the night clerk", W / 2, G.narrow ? 96 : 92);
      ctx.textAlign = "left";
      const gm = Math.floor(((now - t0) / 1000) * 10 / 60);
      const hh = Math.floor((50 + gm) / 60) % 24, mm = (50 + gm) % 60;
      ctx.font = "13px 'IBM Plex Mono',monospace";
      ctx.fillText(`◷ ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, 22, 32);
      ctx.textAlign = "right";
      ctx.fillText(`PICKS ${picks}`, W - 22, 32);
      for (let k = 0; k < Math.max(3, picks); k++) {
        const x = W - 30 - k * 16;
        ctx.globalAlpha = k < picks ? 1 : 0.18;
        line(x, 42, x, 66, 1.3); ctx.beginPath(); ctx.arc(x - 4, 42, 4, 0, Math.PI, true); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = G.narrow ? "left" : "right";
      ctx.fillText(`OVERSETS ${oversets} (2 free)`, G.narrow ? 22 : W - 22, G.narrow ? 52 : 84);
      ctx.textAlign = "left";

      // tension gauge (26), with the band hatched
      const gy = (v) => gBot - (gBot - gTop) * v / 100;
      const inBand = tension >= BAND[0] && tension <= BAND[1];
      const spoolEase = pins.some((p) => p.spool);
      ctx.fillStyle = "#fbf6e8"; ctx.fillRect(gx - 9, gTop, 18, gBot - gTop);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(gx - 9, gTop, 18, gBot - gTop);
      hatch(gx - 9, gy(BAND[1]), 18, gy(BAND[0]) - gy(BAND[1]), 4, C.ink);
      if (spoolEase) { ctx.fillStyle = "rgba(42,58,140,.25)"; ctx.fillRect(gx - 9, gy(SPOOL_EASE[1]), 18, gy(SPOOL_EASE[0]) - gy(SPOOL_EASE[1])); }
      ctx.font = "12px 'IBM Plex Mono',monospace"; ctx.fillStyle = C.ink;
      for (const v of [0, 20, 35, 55, 70, 100]) { line(gx + 9, gy(v), gx + 15, gy(v), 0.8); ctx.fillText(String(v), gx + 17, gy(v) + 4); }
      ctx.fillStyle = tension > JAM ? C.ev : inBand ? C.amber : tension < DROP ? C.faint : C.brass;
      ctx.fillRect(gx - 7, gy(tension), 14, gBot - gy(tension));
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(gx - 11, gy(tension)); ctx.lineTo(gx - 22, gy(tension) - 7); ctx.lineTo(gx - 22, gy(tension) + 7); ctx.fill();
      ctx.font = "600 12px 'IBM Plex Mono',monospace";
      ctx.textAlign = "right"; ctx.fillText(String(Math.round(tension)), gx - 12, gy(tension) - 10 < gTop ? gy(tension) + 24 : gy(tension) - 11); ctx.textAlign = "left";
      label(26, gx, gTop, gx + 30, gTop - 12);

      // shell (10)
      const shellTop = shear - T * 2.3;
      const ang = (plugTurn + (over && turning ? Math.min(90, (now - turning) / 12) : 0)) * Math.PI / 180;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
      ctx.strokeRect(L, shellTop, R - L, shear - shellTop);
      hatch(L, shellTop, R - L, shear - shellTop, 7);
      xs.forEach((x) => { ctx.fillStyle = C.paper; ctx.fillRect(x - pw / 2 - 3, shellTop, pw + 6, shear - shellTop); line(x - pw / 2 - 3, shellTop, x - pw / 2 - 3, shear, 0.8); line(x + pw / 2 + 3, shellTop, x + pw / 2 + 3, shear, 0.8); });
      const capY = shellTop - T * 0.75;
      ctx.strokeRect(L + 6, capY - 12, R - L - 12, 12); hatch(L + 6, capY - 12, R - L - 12, 12, 5);
      xs.forEach((x) => line(x, capY, x, shellTop, 0.7, C.ink, [2, 4]));
      label(10, L, shellTop + 10, L - 30, shellTop - 8);

      // plug (20)
      const off = Math.sin(ang) * rp * 0.7;
      ctx.fillStyle = "#f7f0dc"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.ellipse(L, cy, rp * 0.28, rp, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L, cy - rp); ctx.lineTo(R, cy - rp); ctx.lineTo(R, cy + rp); ctx.lineTo(L, cy + rp); ctx.fill();
      line(L, cy - rp, R, cy - rp, 1.3); line(L, cy + rp, R, cy + rp, 1.3);
      ctx.beginPath(); ctx.ellipse(R, cy, rp * 0.28, rp, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      for (let k = 0; k < 7; k++) { const yy = cy - rp + rp * 2 * (k + 0.5) / 7 + off * (1 - Math.abs(k - 3) / 4) * 0.4; line(L + 4, yy, R - 4, yy, 0.45, C.faint); }
      ctx.fillStyle = "#e6dcc2"; ctx.fillRect(L + 8, cy + rp * 0.15, R - L - 16, rp * 0.45);
      line(L + 8, cy + rp * 0.15, R - 8, cy + rp * 0.15, 0.7); line(L + 8, cy + rp * 0.6, R - 8, cy + rp * 0.6, 0.7);
      label(20, L + 20, cy + rp, L - 6, cy + rp + 26);
      if (plugTurn) { ctx.font = "italic 14px Georgia,serif"; ctx.fillStyle = C.ink; ctx.fillText(`${plugTurn}°`, R + 16, cy + 4); }
      line(L - 20, shear, R + 30, shear, 1, C.ink, [10, 4, 2, 4]);
      ctx.font = "italic 16px Georgia,serif"; ctx.fillStyle = C.ink; ctx.fillText("S", R + 34, shear + 5);

      // pins
      const b = binding();
      const keyLen = rp * 0.95;
      const hintOn = !over && (gentle || now - lastProgress > 20000);
      xs.forEach((x, i) => {
        const p = pins[i];
        const keyTop = shear + (SHEAR[i] - p.h) * T;
        let drvBot = p.set ? shear - 1 : keyTop - 1;
        const drvLen = T * 0.62;
        const sprTop = shellTop + 4;
        if (i === cur) { ctx.fillStyle = "rgba(42,58,140,.08)"; ctx.fillRect(x - pw * 0.9, capY - 30, pw * 1.8, cy + rp - capY + 30); }
        else if (i === hoverPin) { ctx.fillStyle = "rgba(42,58,140,.05)"; ctx.fillRect(x - pw * 0.9, capY - 30, pw * 1.8, cy + rp - capY + 30); }
        if (i === b && hintOn) { ctx.fillStyle = "rgba(224,162,74,.32)"; ctx.fillRect(x - pw, shear - T * 1.6, pw * 2, T * 2.2 + keyLen * 0.4); }
        // the moment of the click: a binding pin at its window under the right tension
        const ready = i === b && lifting && i === cur && p.h >= SHEAR[i] && p.h <= SHEAR[i] + WINW() && ((p.spool && tension >= SPOOL_EASE[0] && tension <= SPOOL_EASE[1]) || (!p.spool && inBand));
        if (ready) { ctx.strokeStyle = C.amber; ctx.lineWidth = 4; ctx.strokeRect(x - pw * 0.8, shear - 6, pw * 1.6, 12); }
        const setK = p.fx ? Math.max(0, 1 - (now - p.fx) / 700) : 0;
        const badK = p.bad ? Math.max(0, 1 - (now - p.bad) / 600) : 0;
        const shake = badK && !RM ? Math.sin(now / 25) * 3 * badK : 0;
        spring(x + shake, sprTop, drvBot - drvLen, pw * 0.8);
        drawPin(x + shake, drvBot - drvLen, drvLen, pw, "drv", SPOOL.has(i) && (p.spool || p.set || told.has("spool")), setK ? `rgba(224,162,74,${0.3 + setK * 0.6})` : p.over ? "#f1d2c8" : null);
        drawPin(x + shake, Math.max(keyTop, shear - T * 0.8), keyLen, pw * 0.92, "key", false, p.set ? "#efe0b2" : null);
        if (setK && !RM) { ctx.strokeStyle = `rgba(184,145,63,${setK})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, shear, pw * (1.2 + (1 - setK) * 1.4), 0, 7); ctx.stroke(); }
        if (p.set) { ctx.fillStyle = C.ink; ctx.font = "600 13px 'IBM Plex Mono',monospace"; ctx.textAlign = "center"; ctx.fillText("✓", x, shear - drvLen - T * 0.3); ctx.textAlign = "left"; }
        if (p.over) { ctx.font = "bold 14px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("over", x, cy + rp + 20); ctx.textAlign = "left"; }
        if (p.spool) { ctx.font = "italic 13px Georgia,serif"; ctx.fillStyle = C.ev; ctx.textAlign = "center"; ctx.fillText("false set", x, cy + rp + 20); ctx.textAlign = "left"; }
        line(x, sprTop - 6, x, capY + 2, 0.6, C.ink, [1, 4]);
        ctx.font = `${i === cur ? 600 : 400} 14px 'IBM Plex Mono',monospace`; ctx.fillStyle = i === cur ? C.blue : C.ink; ctx.textAlign = "center";
        ctx.fillText(String(i + 1), x, capY - 18);
        ctx.textAlign = "left";
      });
      label(12, xs[0], shellTop + T * 0.4, xs[0] - pw * 2.2, shellTop + T * 0.2);
      label(told.has("spool") ? 16 : 14, xs[1], shear - T * 0.9, xs[1] + pw * 1.6, shear - T * 1.3);
      label(18, xs[N - 1], shear + rp * 0.2, xs[N - 1] + pw * 1.8, shear + rp * 0.9);

      // hook pick (22)
      const tipX = xs[cur], tipY = Math.min(cy + rp * 0.55, shear + (SHEAR[cur] - pins[cur].h) * T + keyLen + 2);
      const handleY = cy + rp * 0.4;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(W - 16, handleY + 4); ctx.lineTo(R + 10, handleY + 2); ctx.lineTo(tipX + 14, handleY); ctx.quadraticCurveTo(tipX + 4, handleY, tipX, tipY); ctx.stroke();
      ctx.fillStyle = "#fbf6e8"; ctx.fillRect(R + 20, handleY - 4, Math.max(10, W - R - 36), 12); ctx.strokeRect(R + 20, handleY - 4, Math.max(10, W - R - 36), 12);
      label(22, R + 40, handleY + 8, R + 50, handleY + 34);
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(L + 10, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 0.55); ctx.lineTo(L - 6, cy + rp * 1.8); ctx.lineTo(L - 24, cy + rp * 1.8 + tension * 0.25); ctx.stroke();
      label(24, L - 6, cy + rp * 1.4, L + 26, cy + rp * 2.0);
      // parts list, on a wide sheet
      if (!G.narrow && W > 900) {
        const lx = W - Math.max(W * 0.16, 200) + 40, ly = 130;
        ctx.font = "italic 14px Georgia,serif"; ctx.fillStyle = C.ink;
        [["10", "shell"], ["12", "springs"], ["14", "drivers"], ["16", "spool driver"], ["18", "key pins"], ["20", "plug"], ["22", "hook"], ["24", "wrench"], ["26", "tension"]].forEach(([n, s], i) => ctx.fillText(`${n}  ${s}`, lx, ly + i * 19));
      }
      if (now - msgT > 7000 && capMsg.textContent && !over) capMsg.textContent = "";
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
      else if ((k === "f" || k === "F") && unlocked.has("feel") && !e.repeat) feel();
      else if ((k === "r" || k === "R") && !e.repeat) rake();
      else if (/^[1-5]$/.test(k)) { release(); cur = +k - 1; }
    });
    on(window, "keyup", (e) => {
      const k = e.key;
      if (k === "ArrowUp" || k === " ") release();
      if (k === "w" || k === "W") tUp = false;
      if (k === "s" || k === "S" || k === "ArrowDown") tDown = false;
    });
    pad.querySelectorAll("button").forEach((b) => {
      const a = b.dataset.a;
      on(b, "pointerdown", (e) => {
        e.preventDefault(); if (!started || over) return; b.classList.add("on");
        if (a === "left") move(-1); if (a === "right") move(1);
        if (a === "lift") lifting = true; if (a === "tup") tUp = true; if (a === "tdown") tDown = true;
        if (a === "feel") feel(); if (a === "rake") rake();
      });
      const up = () => { b.classList.remove("on"); if (a === "lift" && lifting) release(); if (a === "tup") tUp = false; if (a === "tdown") tDown = false; };
      on(b, "pointerup", up); on(b, "pointerleave", up); on(b, "pointercancel", up);
    });
    let ptr = null;
    const nearestPin = (x) => { let bi = 0, bd = 1e9; G.xs.forEach((px, i) => { if (Math.abs(px - x) < bd) { bd = Math.abs(px - x); bi = i; } }); return bi; };
    on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      cv.setPointerCapture(e.pointerId);
      if (x < G.gx + 34) { ptr = { kind: "gauge" }; tension = Math.max(0, Math.min(100, 100 * (G.gBot - y) / (G.gBot - G.gTop))); return; }
      const bi = nearestPin(x);
      if (bi !== cur) { release(); cur = bi; }
      ptr = { kind: "pick", y0: y };
      lifting = false;
    });
    on(cv, "pointermove", (e) => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      hoverPin = x > G.gx + 34 && x < G.R + 20 ? nearestPin(x) : -1;
      cv.style.cursor = x < G.gx + 34 ? "ns-resize" : hoverPin >= 0 ? "pointer" : "default";
      if (!ptr || over) return;
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
    intro.innerHTML = `<div class="${P}patent">
      <div class="no"><span>PAT. No. 4·0·3</span><span>SHEET 2 OF 4</span></div>
      <h2>Lockwork · the stair door</h2>
      <p class="goal">Set all five pins on the shear line <i>S</i> before your picks run out.</p>
      <p class="open"></p>
      <ol>
        <li><span>24</span><b>TENSION</b><span><kbd>W</kbd>/<kbd>S</kbd>, the wheel, or drag the gauge: hold it in the hatched band, 35–55.</span></li>
        <li><span>22</span><b>HOOK</b><span><kbd>←</kbd><kbd>→</kbd> or tap a pin.</span></li>
        <li><span>18</span><b>LIFT</b><span>hold <kbd>↑</kbd> or drag up; let go as the pin meets <i>S</i> and the line glows.</span></li>
      </ol>
      <div class="ft">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> a fourth pick, a wider line, the binding pin shown</label>` : `<span>Only the binding pin will set. Lift past <i>S</i> and it oversets.</span>`}<button type="button" class="${P}b">START</button></div></div>`;
    intro.querySelector(".open").textContent = NOTES.open;
    wrap.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); picks = gentle ? 4 : 3; });
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); started = true; lastProgress = performance.now(); say("Bring the tension up into the hatched band first."); });
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

// Behind the Peephole / The eye at the hole, night seven: your own rose (phase 3, built 2026-11-16).
// Offered by the eye once the tenth line is stamped (./_seventh.js). Scene `n7_own_lens`: 2:14, the
// knock at your own door, two quick and one slow. The lens in your door was fitted backwards, for
// someone outside to look in; put your eye to it and you are as close as you will ever be to whoever
// is looking. Tilt to keep their eye inside the dotted ring and HOLD STILL until the ring closes,
// through the knocks and the key; or STEP BACK (Esc), or OPEN THE DOOR (O). The choice ends the shift.
// Art: lens-own-door, eye-at-own-rose, ui-catch-ring, and the ending's card behind the result.
import { finishShift, ENDINGS, endingBackdrop, runOf } from "./_seventh.js";

export function ownLens(root, api) {
  const shared = api.shared, art = api.art || { has: () => false, img: () => Promise.resolve(null) }, RM = api.reducedMotion;
  const P = "behind-the-peephole-ownlens-";
  const st = document.createElement("style");
  st.textContent = `
  .${P}w{position:absolute;inset:0;background:#050403;overflow:hidden;touch-action:none;user-select:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:#efe6cf}
  .${P}w canvas{position:absolute;inset:0;width:100%;height:100%}
  .${P}note{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:min(760px,calc(100% - 120px));text-align:center;font:italic 500 19px/1.3 'Cormorant Garamond',Georgia,serif;color:#f6cf86;text-shadow:0 1px 6px #000;pointer-events:none}
  .${P}sub{position:absolute;left:12px;right:12px;bottom:84px;text-align:center;font-size:15px;color:#f6cf86;text-shadow:0 1px 4px #000;pointer-events:none}
  @media (max-width:560px){.${P}sub{bottom:140px}}
  .${P}hud{position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
  .${P}b{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#f6cf86;background:rgba(11,9,7,.85);border:1px solid #b8913f;min-height:46px;padding:6px 12px;cursor:pointer}
  .${P}b:focus-visible,.${P}b:hover{background:#3b2a12;outline:none;box-shadow:0 0 0 2px #e0a24a}
  .${P}b.on{background:#b8913f;color:#1c1a17}
  .${P}intro{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:12px;overflow:auto;background:radial-gradient(circle,rgba(60,38,18,.75),rgba(5,4,3,.97) 70%)}
  .${P}card{max-width:520px;text-align:center;font:15px/1.5 'IBM Plex Mono',monospace;color:#fff4dc}
  .${P}card h2{font:700 30px/1.1 'Cormorant Garamond',Georgia,serif;margin:6px 0;color:#fff0c8}
  .${P}card p{margin:8px 0}
  .${P}card .g{font:italic 18px/1.3 'Cormorant Garamond',Georgia,serif}
  `;
  const w = document.createElement("div"); w.className = P + "w";
  const cv = document.createElement("canvas"); const ctx = cv.getContext("2d");
  const note = document.createElement("div"); note.className = P + "note";
  const sub = document.createElement("div"); sub.className = P + "sub"; sub.setAttribute("aria-live", "polite");
  const hud = document.createElement("div"); hud.className = P + "hud";
  hud.innerHTML = `<button type="button" class="${P}b" data-a="hold">HOLD STILL · SPACE</button><button type="button" class="${P}b" data-a="back">STEP BACK · ESC</button><button type="button" class="${P}b" data-a="open">OPEN THE DOOR · O</button>`;
  w.append(cv, note, sub, hud); root.append(st, w);
  const A = {};
  let disposed = false;
  Promise.all(["lens-own-door", "eye-at-own-rose", "ui-catch-ring-closed"].map(async (id) => { const im = await art.img(id); if (im && !disposed) A[id] = im; }));

  const timers = [], listeners = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
  let started = false, over = false, t0 = 0, last = 0, raf = 0;
  let view = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, keys = {}, holding = false, prog = 0, jolt = 0, knocks = 0;
  let W = 0, H = 0, R = 100;
  const eyeAt = (t) => RM ? { x: 0.18, y: -0.08 } : { x: 0.18 + 0.16 * Math.sin(t * 0.37), y: -0.08 + 0.1 * Math.sin(t * 0.53 + 1) };
  const NEED = 7;
  function resize() { const r = w.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R = Math.min(W * 0.46, (H - 150) * 0.46); }
  const ro = new ResizeObserver(resize); ro.observe(w); resize();
  function say(s) { note.textContent = s; }
  function end(choice) {
    if (over) return; over = true;
    const r = runOf(shared);
    const id = finishShift(shared, choice);
    const e = ENDINGS[id];
    const lead = choice === "held" ? "You kept your eye at your own rose until the ring closed. Whoever was outside saw the dark and did not step back either." : choice === "opened" ? "You turned the key from the inside and opened the door." : "You stepped back from your own door, as the job taught you, and sat at the desk until the feet went away.";
    endingBackdrop(root, api, id);
    say("");
    timers.push(setTimeout(() => api.end({ outcome: id === "the_sitter" ? "win" : "done", text: `${lead} ${e.title}. ${e.text}${r.word ? "" : ""} The shift is over; the next one is the second shift.` }), RM ? 300 : 900));
  }
  function step(dt, t) {
    const sp = 0.9 * dt;
    if (keys.ArrowLeft) aim.x -= sp; if (keys.ArrowRight) aim.x += sp; if (keys.ArrowUp) aim.y -= sp; if (keys.ArrowDown) aim.y += sp;
    aim.x = Math.max(-0.6, Math.min(0.6, aim.x)); aim.y = Math.max(-0.6, Math.min(0.6, aim.y));
    const k = RM ? 1 : Math.min(1, dt * 6);
    view.x += (aim.x - view.x) * k; view.y += (aim.y - view.y) * k;
    if (jolt > 0) jolt = Math.max(0, jolt - dt);
    const e = eyeAt(t);
    const on = t > 3 && Math.hypot(e.x - view.x, e.y - view.y) < 0.14;
    if (t > 3 && !said.eye) { said.eye = 1; say("An eye, on the other side of your own lens. It does not blink. Keep it inside the ring, and hold still."); }
    if (on && holding && jolt <= 0) prog += dt; else prog = Math.max(0, prog - dt * 0.5);
    for (const [at, s] of [[1.2, "[a knock: two quick, one slow]"], [6, "[the same knock, closer to the glass]"], [10, "[a key, in the lock under the rose]"]]) {
      if (t > at && knocks < at) { knocks = at; sub.textContent = s; if (at > 2) { jolt = RM ? 0 : 0.6; if (!RM) { aim.x += 0.12; aim.y -= 0.05; } } }
    }
    if (prog >= NEED) end("held");
    else if (t > 50) { say("The feet go away down the passage. You never decided; the desk decided for you."); end("stepped"); }
  }
  const said = {};
  function draw(t) {
    ctx.fillStyle = "#050403"; ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = (H - 70) / 2 + 10;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
    const S = R * 2.6, ox = cx - S / 2 - view.x * R * 1.4, oy = cy - S / 2 - view.y * R * 1.4;
    if (A["lens-own-door"]) ctx.drawImage(A["lens-own-door"], ox, oy, S, S); else { ctx.fillStyle = "#2a1a10"; ctx.fillRect(ox, oy, S, S); }
    if (t > 3) {
      const e = eyeAt(t), ex = cx + (e.x - view.x) * R * 1.4, ey = cy + (e.y - view.y) * R * 1.4, ew = R * 1.1;
      ctx.globalAlpha = Math.min(1, (t - 3) / (RM ? 0.01 : 1.2));
      if (A["eye-at-own-rose"]) ctx.drawImage(A["eye-at-own-rose"], ex - ew / 2, ey - ew / 3, ew, ew * 2 / 3); else { ctx.fillStyle = "#efe6d6"; ctx.beginPath(); ctx.ellipse(ex, ey, ew / 3, ew / 7, 0, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.8)"); ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.restore();
    ctx.strokeStyle = "#b8913f"; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, 7); ctx.stroke();
    ctx.setLineDash([3, 9]); ctx.strokeStyle = "rgba(246,207,134,.7)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R * 0.2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#2a1a0c"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R + 20, 0, 7); ctx.stroke();
    if (prog > 0) { ctx.strokeStyle = prog >= NEED ? "#f6cf86" : "#e0a24a"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(cx, cy, R + 20, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(1, prog / NEED)); ctx.stroke(); }
    if (cy + R + 48 < H - 120) { ctx.fillStyle = "#d8b060"; ctx.font = "13px 'IBM Plex Mono',monospace"; ctx.textAlign = "center"; ctx.fillText(`02:${String(14 + Math.floor(t / 6)).padStart(2, "0")} · YOUR OWN DOOR`, cx, cy + R + 44); ctx.textAlign = "left"; }
  }
  const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; if (started && !over) { const t = (now - t0) / 1000; step(dt, t); draw(t); } raf = requestAnimationFrame(loop); };
  // input: the pointer tilts the view; holding a button or Space holds still
  on(w, "pointermove", (e) => { if (!started || over || e.target.closest("button")) return; const r = w.getBoundingClientRect(); aim.x = ((e.clientX - r.left) / r.width - 0.5) * 1.2; aim.y = ((e.clientY - r.top) / r.height - 0.5) * 1.2; });
  on(w, "pointerdown", (e) => { if (!started || over || e.target.closest("button")) return; holding = true; });
  on(window, "pointerup", () => { holding = false; hud.querySelector('[data-a="hold"]').classList.remove("on"); });
  const holdB = hud.querySelector('[data-a="hold"]');
  on(holdB, "pointerdown", (e) => { e.preventDefault(); if (started && !over) { holding = true; holdB.classList.add("on"); } });
  on(hud.querySelector('[data-a="back"]'), "click", () => { if (started) end("stepped"); });
  on(hud.querySelector('[data-a="open"]'), "click", () => { if (started) end("opened"); });
  on(window, "keydown", (e) => {
    if (!started || over) return;
    if (e.key.startsWith("Arrow")) { keys[e.key] = true; e.preventDefault(); }
    else if (e.key === " ") { holding = true; holdB.classList.add("on"); e.preventDefault(); }
    else if (e.key === "Escape") end("stepped");
    else if (e.key === "o" || e.key === "O") end("opened");
  });
  on(window, "keyup", (e) => { keys[e.key] = false; if (e.key === " ") { holding = false; holdB.classList.remove("on"); } });
  const intro = document.createElement("div"); intro.className = P + "intro";
  intro.innerHTML = `<div class="${P}card">${art.has("chapter-n7") ? `<img alt="Night Seven" src="${art.url("chapter-n7")}" style="width:100%;height:auto">` : ""}<h2>Your own rose</h2>
    <p class="g">Night seven, 2:14. The knock is at your door this time, and the rose in it is lit from outside.</p>
    <p>TILT: move, drag or arrow keys · HOLD STILL: Space, or press and hold · STEP BACK: Esc · OPEN THE DOOR: O</p>
    <p>Whatever you choose ends the shift.</p>
    <button type="button" class="${P}b" data-go>PUT YOUR EYE TO IT</button></div>`;
  w.appendChild(intro);
  const go = intro.querySelector("[data-go]");
  on(go, "click", () => { intro.remove(); started = true; t0 = last = performance.now(); say("Night seven, 2:14. A knock at your own door."); });
  go.focus();
  raf = requestAnimationFrame((n) => { last = n; loop(n); });
  return { unmount() { disposed = true; cancelAnimationFrame(raf); ro.disconnect(); timers.forEach(clearTimeout); for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o); root.innerHTML = ""; } };
}

export const ownLensExtra = { title: "your own rose, at 2:14", ready: (api) => { const r = runOf(api.shared); return !!r.solved && !r.lens; }, play: ownLens };

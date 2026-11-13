// Project: Man Eater — The Tray (1D, portioning). Graphic style: Isotype pictograms.
// DESIGN.md section 11.2, cut to one meal: d5_tray. Six pieces, the pill, the broth, Jax beside you,
// the orderly's gaze resting on Fisk for 4 s of every 8, 90 seconds of page time. Each piece can be
// eaten, pocketed in the napkin (holds three), passed to Jax, or left. Hunger 70+ makes pieces creep
// toward the mouth. Effects per item from the table in 11.2. Counted icons in rows are the tally.

const P = { ink: "#1B1D1F", paper: "#ece6d8", steel: "#8A8F93", tray: "#c9ccce", meat: "#5A4F5E", red: "#b4432f", green: "#5E7363", sodium: "#D9A441" };
const PIECES = 6, GAZE_ON = 4, CYCLE = 8, MEAL = 90;

const ICON = {
  piece: `<path d="M-16 8L-12-10Q0-16 14-9L16 9Z"/>`,
  pill: `<rect x="-15" y="-7" width="30" height="14" rx="7"/>`,
  eye: `<path d="M-18 0Q0-14 18 0Q0 14-18 0Z"/><circle r="5" fill="${P.paper}"/>`,
  napkin: `<path d="M-16-14H16L-16 14Z"/>`,
  mouth: `<path d="M-18-4Q0 16 18-4Z"/>`,
  man: `<circle cy="-34" r="8"/><path d="M-10-24H10L8-2H-8Z"/><rect x="-8" y="-2" width="6" height="20"/><rect x="2" y="-2" width="6" height="20"/>`,
  bowl: `<circle r="15"/><circle r="10" fill="${P.sodium}"/>`,
};
const svg = (name, fill, size = 28, extra = "") => `<svg width="${name === "man" ? size * 0.62 : size}" height="${size}" viewBox="${name === "man" ? "-12.5 -43 25 62" : "-20 -20 40 40"}" ${extra} aria-hidden="true"><g fill="${fill}">${ICON[name]}</g></svg>`;

export default {
  mount(root, api) {
    const K = "man-eater-tray-";
    const reduce = api.reducedMotion;
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;overflow-x:hidden;background:${P.paper};color:${P.ink};font-family:'Courier Prime','Courier New',monospace;user-select:none;-webkit-user-select:none}
      .${K}wrap::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 calc(30px + var(--h,0) * 60px) rgba(180,67,47,calc(var(--h,0) * .35));animation:${K}pulse var(--pr,3s) ease-in-out infinite}
      @keyframes ${K}pulse{0%,100%{opacity:.35}50%{opacity:1}}
      .${K}page{max-width:880px;margin:0 auto;padding:14px 16px 24px;display:grid;gap:10px;position:relative}
      .${K}shadow{position:absolute;left:0;right:0;top:0;height:46px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(27,29,31,.0) 0%,rgba(27,29,31,.28) var(--sx,0%),transparent calc(var(--sx,0%) + var(--sw,10%)))}
      .${K}row{display:grid;grid-template-columns:96px 1fr auto;align-items:center;gap:10px;min-height:44px;border-bottom:1px solid rgba(27,29,31,.12)}
      .${K}row h5{margin:0;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:13px;letter-spacing:.16em}
      .${K}row .n{font-size:12px;opacity:.75;white-space:nowrap}
      .${K}icons{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-end;min-height:34px}
      .${K}slot{opacity:.28}
      .${K}eyes{flex-wrap:nowrap;gap:2px}.${K}eyes svg{width:min(30px,6.4vw);height:auto}.${K}icons{min-width:0}.${K}eyes .on{outline:2px solid ${P.red};outline-offset:1px}
      .${K}eyes svg{transition:opacity .2s}
      .${K}drop{border-radius:4px;transition:background .15s}
      .${K}drop.hot,.${K}drop.can{background:rgba(217,164,65,.22)}
      .${K}tray{position:relative;background:${P.tray};border:3px solid ${P.steel};border-radius:10px;padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;box-shadow:inset 0 2px 0 rgba(255,255,255,.5)}
      .${K}tray h5{position:absolute;left:12px;top:6px;margin:0;font-family:'Stardos Stencil',monospace;letter-spacing:.16em;font-size:12px}
      .${K}slab{display:flex;gap:6px;flex-wrap:wrap;min-height:70px;align-items:center;padding-top:10px;position:relative;touch-action:none}
      .${K}whole{width:min(100%,360px);height:56px;background:${P.meat};border-radius:10px 14px 6px 8px;cursor:ew-resize;position:relative;touch-action:none}
      .${K}whole::after{content:"drag the knife across";position:absolute;inset:0;display:grid;place-items:center;color:${P.paper};font-size:12px;letter-spacing:.1em;opacity:.8}
      .${K}knife{position:absolute;top:-6px;width:6px;height:70px;background:${P.ink};border-radius:3px;left:0;pointer-events:none}
      .${K}item{background:none;border:0;padding:2px;cursor:grab;touch-action:none;position:relative;border-radius:6px;font:inherit;color:inherit}
      .${K}item:focus-visible,.${K}item.sel{outline:3px solid ${P.sodium};outline-offset:1px}
      .${K}item[data-kind=piece]{transform:translateY(calc(var(--d,0) * 26px))}
      .${K}item small{display:block;font-size:10px}
      .${K}side{display:flex;gap:10px;align-items:center}
      .${K}clock{width:64px;height:64px}
      .${K}bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:44px}
      .${K}bar button,.${K}intro button{font:inherit;font-weight:700;background:${P.ink};color:${P.paper};border:0;min-height:42px;padding:8px 12px;cursor:pointer}
      .${K}bar button[aria-pressed=true]{background:${P.red}}
      .${K}bar button:focus-visible,.${K}intro button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}msg{font-size:13.5px;flex:1 1 200px;min-width:0}
      .${K}mouth{border:2px dashed ${P.red};border-radius:30px 30px 60px 60px;text-align:center;padding:10px;font-family:'Stardos Stencil',monospace;letter-spacing:.2em;color:${P.red}}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(236,230,216,.92);z-index:5;padding:16px}
      .${K}panel{max-width:560px;border:2px solid ${P.ink};padding:22px;background:${P.paper}}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil',monospace;font-size:30px;letter-spacing:.08em;text-transform:uppercase}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      .${K}ghost{position:fixed;pointer-events:none;z-index:9;transform:translate(-50%,-50%)}
      @media (max-width:560px){.${K}row{grid-template-columns:70px minmax(0,1fr)}.${K}row .n{grid-column:2}.${K}tray{grid-template-columns:1fr}}
    </style>
    <div class="${K}page">
      <div class="${K}shadow"></div>
      <div class="${K}row"><h5>GAZE</h5><div class="${K}icons ${K}eyes"></div><span class="n ${K}gazeN">${GAZE_ON} s of ${CYCLE} on you</span></div>
      <div class="${K}tray"><h5>TRAY · DAY 5</h5><div class="${K}slab"></div><div class="${K}side"><div class="${K}extras"></div><svg class="${K}clock" viewBox="-34 -34 68 68" aria-label="Time left"><circle r="28" fill="none" stroke="${P.steel}" stroke-width="6" opacity=".35"/><circle class="${K}ring" r="28" fill="none" stroke="${P.ink}" stroke-width="6" stroke-dasharray="175.9" stroke-dashoffset="0" transform="rotate(-90)"/><text class="${K}secs" y="5" text-anchor="middle" font-size="14" font-family="Courier Prime,monospace" fill="${P.ink}">90</text></svg></div></div>
      <div class="${K}bar"><span class="${K}msg" aria-live="polite">Cut the slab first.</span><button type="button" class="${K}cheek" aria-pressed="false">Cheek (C)</button></div>
      <div class="${K}row ${K}drop" data-drop="mouth"><h5>TO MOUTH</h5><div class="${K}icons" data-c="mouth"></div><span class="n">eaten · E</span></div>
      <div class="${K}row ${K}drop" data-drop="napkin"><h5>NAPKIN</h5><div class="${K}icons" data-c="napkin"></div><span class="n">of 3 · N</span></div>
      <div class="${K}row ${K}drop" data-drop="jax"><h5>TO JAX</h5><div class="${K}icons" data-c="jax"></div><span class="n">passed · J</span></div>
      <div class="${K}row"><h5>LEFT</h5><div class="${K}icons" data-c="left"></div><span class="n">+5 suspicion each</span></div>
      <div class="${K}row"><h5>SEEN</h5><div class="${K}icons" data-c="seen"></div><span class="n">+20 each; twice and he stops at your tray</span></div>
      <div class="${K}row"><h5>FISK</h5><div class="${K}icons" data-c="fisk"></div><span class="n ${K}chg">change +0</span></div>
      <div class="${K}mouth ${K}drop" data-drop="mouth">▼ MOUTH ▼</div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <h2>The Tray</h2>
      <p>Day 5, noon, 90 seconds. Cut the ration, then drag each piece to <b>your mouth</b>, <b>the napkin</b> (holds three) or <b>Jax's tray</b>, or leave it. The orderly's gaze rests on you 4 seconds of every 8: pocketing or passing while he looks is seen.</p>
      <p>Each piece eaten makes you taller and quiets hunger for now, and takes a little of your mind. You are hungry: pieces creep toward your mouth. Touch one to push it back. Hold C (or Cheek) while the pill goes in to keep it in your cheek, then spit it into the napkin when he looks away.</p>
      <p style="font-size:12.5px">Tap a piece, then a row, also works; keys E, N, J send the selected piece.</p>
      <button type="button" data-start>Sit down</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const slab = $("slab"), extras = $("extras"), msgEl = $("msg"), cheekBtn = $("cheek"), eyesEl = $("eyes"), intro = $("intro");
    const col = (c) => wrap.querySelector(`[data-c=${c}]`);

    // ---- state
    const st = { cut: false, t: 0, change: 0, hunger: 74, clarity: 70, strength: 77, susp: 0, seen: 0, pills: 0, eaten: 0, napkin: [], jax: 0, cheeked: false, pillIn: true, broth: true, spat: false, breaks: 0 };
    const pieces = []; // {id, el, drift}
    let running = false, over = false, raf = 0, last = 0, cheekHeld = false, sel = null;
    const timers = [];
    const say = (m) => { msgEl.textContent = m; };
    const gazeOn = () => (st.t % CYCLE) >= CYCLE - GAZE_ON;

    function renderEyes() {
      const sec = Math.floor(st.t % CYCLE);
      eyesEl.innerHTML = Array.from({ length: CYCLE }, (_, i) => {
        const on = i >= CYCLE - GAZE_ON;
        const now = i === sec;
        return `<span class="${on ? "on" : ""}" style="opacity:${now ? 1 : 0.3}">${svg("eye", now && on ? P.red : P.ink, 30)}</span>`;
      }).join("");
      const sh = $("shadow");
      // the orderly's long shadow crosses the top of the page and lengthens before it rests on you
      const ph = (st.t % CYCLE) / CYCLE;
      sh.style.setProperty("--sx", `${Math.round(ph * 100)}%`);
      sh.style.setProperty("--sw", gazeOn() ? "40%" : ph > 0.4 ? "22%" : "10%");
    }
    function renderTally() {
      const slots = (n, of, icon, fill) => Array.from({ length: of }, (_, i) => (i < n ? svg(icon, fill, 26) : `<span class="${K}slot">${svg(icon, P.ink, 26)}</span>`)).join("");
      col("mouth").innerHTML = slots(st.eaten, PIECES, "piece", P.red) + (st.pills ? svg("pill", P.red, 26) : "");
      col("napkin").innerHTML = slots(st.napkin.length, 3, "napkin", P.meat);
      col("jax").innerHTML = slots(st.jax, PIECES, "piece", P.green);
      const left = pieces.length + (st.pillIn && !st.cheeked ? 0 : 0);
      col("left").innerHTML = slots(left, PIECES, "piece", P.steel);
      col("seen").innerHTML = slots(st.seen, 2, "eye", P.red);
      // one more man for every point the body has moved, each a little taller
      const men = [svg("man", P.ink, 34)];
      for (let i = 1; i <= Math.ceil(st.change / 2); i++) men.push(svg("man", P.ink, 34 + i * 3));
      col("fisk").innerHTML = men.join("");
      $("chg").textContent = `change +${st.change}`;
      wrap.style.setProperty("--h", Math.max(0, (st.hunger - 40) / 60).toFixed(2));
      wrap.style.setProperty("--pr", `${Math.max(0.8, 4 - (st.hunger - 40) / 15)}s`);
    }
    function renderExtras() {
      extras.innerHTML = "";
      if (st.pillIn) extras.appendChild(item("pill", st.cheeked ? "in cheek" : "pill"));
      if (st.broth) extras.appendChild(item("broth", "broth"));
      if (st.cheeked && !st.pillIn) { /* nothing */ }
    }
    function item(kind, label, id) {
      const b = document.createElement("button");
      b.type = "button"; b.className = K + "item"; b.dataset.kind = kind; if (id != null) b.dataset.id = id;
      b.innerHTML = (kind === "piece" ? svg("piece", P.meat, 46) : kind === "pill" ? svg("pill", st.cheeked ? P.red : "#fff", 40, `style="filter:drop-shadow(0 0 1px ${P.ink})"`) : svg("bowl", P.steel, 42)) + `<small>${label}</small>`;
      b.setAttribute("aria-label", kind === "piece" ? "Ration piece" : kind === "pill" ? (st.cheeked ? "The pill, held in your cheek" : "The pill") : "Broth (tap to drink)");
      b.addEventListener("pointerdown", startDrag);
      b.addEventListener("click", () => tapItem(b));
      return b;
    }

    // ---- cutting
    function makeWhole() {
      slab.innerHTML = `<div class="${K}whole" role="button" tabindex="0" aria-label="The ration slab: drag across it, or press Enter, to cut it"><div class="${K}knife"></div></div>`;
      const w = slab.firstElementChild, knife = w.querySelector("." + K + "knife");
      let x0 = null;
      const down = (e) => { if (!running) return; x0 = e.clientX; try { w.setPointerCapture(e.pointerId); } catch { /* ok */ } };
      const move = (e) => { if (x0 == null) return; const r = w.getBoundingClientRect(); knife.style.left = Math.max(0, Math.min(r.width - 6, e.clientX - r.left)) + "px"; if (Math.abs(e.clientX - x0) > r.width * 0.55) { x0 = null; cut(); } };
      const up = () => { x0 = null; };
      w.addEventListener("pointerdown", down); w.addEventListener("pointermove", move); w.addEventListener("pointerup", up);
      w.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (running) cut(); } });
    }
    function cut() {
      if (st.cut) return;
      st.cut = true;
      slab.innerHTML = "";
      for (let i = 0; i < PIECES; i++) { const el = item("piece", "piece", i); slab.appendChild(el); pieces.push({ id: i, el, drift: -i * 0.18 }); }
      say("Cut into six. Eat, pocket, pass or leave each one.");
      renderTally();
      pieces[0].el.focus();
    }

    // ---- moving things
    function removePiece(id) { const i = pieces.findIndex((p) => p.id === id); if (i >= 0) { pieces[i].el.remove(); pieces.splice(i, 1); } }
    function seenAct(what) {
      st.seen++; st.susp += 20;
      say(`Seen: ${what}. The orderly writes on the clipboard. Suspicion +20.`);
      if (st.seen >= 2) { renderTally(); finish(); return true; }
      return false;
    }
    function send(kind, id, to) {
      if (!running) return;
      if (kind === "broth") { if (to === "mouth") { st.broth = false; st.hunger -= 3; say("Broth. Hunger −3."); renderExtras(); renderTally(); } return; }
      if (kind === "pill") {
        if (to === "mouth" && !st.cheeked) {
          if (cheekHeld) { st.cheeked = true; say("In your cheek. Spit it into the napkin when he looks away."); }
          else { st.pillIn = false; st.pills++; st.change += 3; st.clarity -= 3; say("Swallowed. Change +3, clarity −3."); }
        } else if (to === "napkin" && st.cheeked) {
          if (st.napkin.length >= 3) return say("The napkin is full.");
          st.pillIn = false; st.cheeked = false; st.napkin.push("pill"); st.spat = true;
          if (gazeOn()) { st.breaks++; if (seenAct("you spat the pill (rule one, seen)")) return; }
          else say("Spat into the napkin. He did not see.");
        } else if (to === "napkin") return say("The pill has to go in your mouth first. Cheek it, then spit it.");
        else if (to === "jax") return say("Jax shakes his head at the pill.");
        renderExtras(); renderTally(); return;
      }
      // a piece
      if (to === "mouth") {
        removePiece(id); st.eaten++; st.change += 2; st.hunger -= 6; st.clarity -= 2; st.strength += 1;
        say(st.eaten === 1 ? "“He didn't enjoy the taste, but he wanted more.” Change +2, hunger −6." : `Eaten. Change +2, hunger −6, clarity −2.`);
      } else if (to === "napkin") {
        if (st.napkin.length >= 3) return say("The napkin holds three.");
        removePiece(id); st.napkin.push("piece");
        if (gazeOn()) { if (seenAct("pocketing")) return; } else say("Pocketed. He was looking the other way.");
      } else if (to === "jax") {
        removePiece(id); st.jax++;
        if (gazeOn()) { if (seenAct("passing to Jax")) return; } else say("Jax eats it, or hides it. Your tray looks clean. Trust +5.");
      }
      renderTally();
      if (!pieces.length && !st.pillIn && !st.cheeked) finishSoon();
    }
    function finishSoon() { say("The tray is clear."); timers.push(setTimeout(finish, 900)); }

    // tap: select, then a row; or keys
    function tapItem(b) {
      if (!running || b._dragged) { b._dragged = false; return; }
      const kind = b.dataset.kind, id = b.dataset.id == null ? null : +b.dataset.id;
      if (kind === "broth") return send("broth", null, "mouth");
      if (kind === "piece") { const p = pieces.find((q) => q.id === id); if (p) p.drift = Math.min(p.drift, 0); }
      wrap.querySelectorAll("." + K + "item.sel").forEach((x) => x.classList.remove("sel"));
      sel = { kind, id }; b.classList.add("sel");
      wrap.querySelectorAll("." + K + "drop").forEach((d) => d.classList.add("can"));
      say(kind === "pill" ? (st.cheeked ? "The pill is in your cheek. Napkin (N) when he looks away." : "The pill: mouth (E) to swallow, or hold C and E to cheek it.") : "Pushed back. Now mouth (E), napkin (N) or Jax (J).");
    }
    const clearSel = () => { sel = null; wrap.querySelectorAll("." + K + "item.sel").forEach((x) => x.classList.remove("sel")); wrap.querySelectorAll("." + K + "drop").forEach((d) => d.classList.remove("can")); };
    const onDropClick = (e) => { if (!sel) return; const to = e.currentTarget.dataset.drop; const s2 = sel; clearSel(); send(s2.kind, s2.id, to); };
    const drops = [...wrap.querySelectorAll("." + K + "drop")];
    drops.forEach((d) => d.addEventListener("click", onDropClick));

    // drag with a ghost
    let drag = null;
    function startDrag(e) {
      if (!running) return;
      const b = e.currentTarget;
      if (b.dataset.kind === "broth") return;
      drag = { b, x: e.clientX, y: e.clientY, ghost: null, id: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch { /* ok */ }
      b.addEventListener("pointermove", moveDrag); b.addEventListener("pointerup", endDrag); b.addEventListener("pointercancel", endDrag);
    }
    function moveDrag(e) {
      if (!drag) return;
      if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.ghost = document.createElement("div"); drag.ghost.className = K + "ghost"; drag.ghost.innerHTML = drag.b.querySelector("svg").outerHTML; wrap.appendChild(drag.ghost);
        if (drag.b.dataset.kind === "piece") { const p = pieces.find((q) => q.id === +drag.b.dataset.id); if (p) p.drift = 0; }
      }
      if (drag.ghost) {
        drag.ghost.style.left = e.clientX + "px"; drag.ghost.style.top = e.clientY + "px";
        const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-drop]");
        drops.forEach((d) => d.classList.toggle("hot", d === t));
      }
    }
    function endDrag(e) {
      if (!drag) return;
      const { b, ghost } = drag; drag = null;
      b.removeEventListener("pointermove", moveDrag); b.removeEventListener("pointerup", endDrag); b.removeEventListener("pointercancel", endDrag);
      drops.forEach((d) => d.classList.remove("hot"));
      if (!ghost) return;
      ghost.remove(); b._dragged = true;
      const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-drop]");
      if (t) send(b.dataset.kind, b.dataset.id == null ? null : +b.dataset.id, t.dataset.drop);
    }

    // ---- the clock
    function tick(now) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const was = gazeOn();
      st.t += dt;
      if (gazeOn() !== was) say(gazeOn() ? "He is looking at you." : "He looks away.");
      // hunger pulls: at 70 or more, pieces creep toward the mouth
      if (st.cut && st.hunger >= 70) {
        for (const p of pieces.slice()) {
          p.drift += dt / 22;
          p.el.style.setProperty("--d", Math.max(0, p.drift).toFixed(3));
          if (p.drift >= 1) { send("piece", p.id, "mouth"); say("A piece was in your mouth before you decided. Change +2."); if (!running) return; }
        }
      } else for (const p of pieces) p.el.style.setProperty("--d", "0");
      const left = Math.max(0, MEAL - st.t);
      wrap.querySelector("." + K + "ring").setAttribute("stroke-dashoffset", (175.9 * (1 - left / MEAL)).toFixed(1));
      wrap.querySelector("." + K + "secs").textContent = Math.ceil(left);
      renderEyes();
      if (left <= 0) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish() {
      if (over) return;
      over = true; running = false; cancelAnimationFrame(raf);
      const leftN = pieces.length;
      st.susp += leftN * 5;
      if (st.cheeked) { st.pills++; st.change += 3; st.clarity -= 3; st.cheeked = false; }
      renderTally();
      const ledger = `Eaten ${st.eaten}, napkin ${st.napkin.length}, to Jax ${st.jax}, left ${leftN}. Pill ${st.pills ? "swallowed" : st.spat ? "cheeked and spat" : "left in its cup"}. Change +${st.change}, hunger ${st.hunger}, clarity ${st.clarity}, strength ${st.strength}, suspicion +${st.susp}.`;
      if (st.seen >= 2) return api.end({ outcome: "lose", text: `The orderly stops at your tray and does not move on. ${ledger}` });
      api.end({ outcome: "done", text: `The tray is collected${leftN ? `; ${leftN} piece${leftN > 1 ? "s" : ""} left, and the orderly writes on the clipboard` : ""}. ${ledger} ${st.eaten === 0 ? "Logged as refused." : `Logged as a ration of ${st.eaten}.`}` });
    }

    // ---- keys and the cheek
    const setCheek = (v) => { cheekHeld = v; cheekBtn.setAttribute("aria-pressed", String(v)); };
    const onKey = (e) => {
      if (!running) return;
      if (e.key === "c" || e.key === "C") { setCheek(e.type === "keydown"); return; }
      if (e.type !== "keydown" || !sel) return;
      const to = { e: "mouth", E: "mouth", n: "napkin", N: "napkin", j: "jax", J: "jax" }[e.key];
      if (to) { e.preventDefault(); const s2 = sel; clearSel(); send(s2.kind, s2.id, to); }
    };
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    const cheekDown = (e) => { e.preventDefault(); setCheek(!cheekHeld); };
    cheekBtn.addEventListener("click", cheekDown);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); running = true; last = performance.now(); say("Cut the slab: drag the knife across it."); raf = requestAnimationFrame(tick); wrap.querySelector("." + K + "whole")?.focus(); };
    startBtn.addEventListener("click", start);

    makeWhole(); renderExtras(); renderTally(); renderEyes();
    timers.push(setTimeout(() => startBtn.focus(), 30));

    return {
      unmount() {
        running = false; over = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
        window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey);
        wrap.remove();
      },
    };
  },
};

// A Journey Into the Heartstream, 1D game: Marrow-Song (DESIGN.md section 11, `g1_song`).
// Bead-string notation: beads on strands, height as pitch. One verse cut from `s1_song_1`: eight
// slots, three phrases per brother. Solo: each companion has already set one phrase; you place yours,
// and at Sing the companions fill any slot left empty, each taking the smoothest join on his left.

const SEATS = [
  { name: "you, the one who laughs", short: "You", col: "#7FB2E0", wave: "sine" },
  { name: "the one who argues", short: "Argues", col: "#E8DCC4", wave: "triangle" },
  { name: "the one who dreams", short: "Dreams", col: "#E0603A", wave: "square" },
  { name: "the one who fears", short: "Fears", col: "#F2B544", wave: "sawtooth" },
];
const SLOTS = 8;
const PITCH = [0, 196, 220, 262, 294, 330];

function joinKind(a, b) { const d = Math.abs(a.notes[3] - b.notes[0]); return d <= 1 ? "smooth" : d === 2 ? "rough" : "break"; }
function harmony(slots) {
  let smooth = 0, breaks = 0, calls = 0;
  for (let i = 0; i < SLOTS - 1; i++) {
    const a = slots[i], b = slots[i + 1]; if (!a || !b) continue;
    const k = joinKind(a, b); if (k === "smooth") smooth++; if (k === "break") breaks++;
    if (a.accent !== b.accent) calls++;
  }
  return Math.max(0, Math.min(100, 50 + 6 * smooth - 8 * breaks + 3 * calls));
}
// Companions fill empty slots left to right, each picking the phrase that joins best with its left.
function companionFill(slots, phrases) {
  const out = slots.slice(), used = new Set(out.filter(Boolean).map((p) => p.id));
  for (let i = 0; i < SLOTS; i++) {
    if (out[i]) continue;
    let best = null, bv = -1e9;
    for (const p of phrases) {
      if (p.seat === 0 || used.has(p.id)) continue;
      let v = 0;
      if (i > 0 && out[i - 1]) { const k = joinKind(out[i - 1], p); v += k === "smooth" ? 6 : k === "break" ? -8 : 0; if (out[i - 1].accent !== p.accent) v += 3; }
      if (v > bv) { bv = v; best = p; }
    }
    if (best) { out[i] = best; used.add(best.id); }
  }
  return out;
}

export default {
  mount(root, api) {
    const P = "heartstream-marrow-song-";
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const rng = api.rng();

    // ---- a verse that rewards care: generated until the best arrangement sings true ------------
    let phrases, fixed, solution;
    for (let tries = 0; tries < 400; tries++) {
      phrases = [];
      for (let s = 0; s < 4; s++) for (let k = 0; k < 3; k++) {
        const n = [1 + Math.floor(rng() * 5)];
        for (let j = 1; j < 4; j++) n.push(Math.max(1, Math.min(5, n[j - 1] + Math.floor(rng() * 5) - 2)));
        phrases.push({ id: `${s}-${k}`, seat: s, notes: n, accent: rng() < 0.5 ? 1 : 3 });
      }
      fixed = Array(SLOTS).fill(null);
      const spots = [1, 3, 4, 6].sort(() => rng() - 0.5).slice(0, 3);
      [1, 2, 3].forEach((s, i) => { fixed[spots[i]] = phrases.find((p) => p.seat === s); });
      const free = fixed.map((p, i) => (p ? -1 : i)).filter((i) => i >= 0);
      const mine = phrases.filter((p) => p.seat === 0);
      let best = -1, bestSlots = null, sum = 0, n = 0;
      const rec = (slots, left) => {
        const filled = slots.filter((p) => p && p.seat === 0).length;
        if (filled) { const h = harmony(companionFill(slots, phrases)); sum += h; n++; if (h > best) { best = h; bestSlots = slots.slice(); } }
        for (const p of left) for (const i of free) if (!slots[i]) { slots[i] = p; rec(slots, left.filter((q) => q !== p)); slots[i] = null; }
      };
      rec(fixed.slice(), mine);
      if (best >= 84 && sum / n < 66) { solution = bestSlots; break; }
      solution = bestSlots;
    }

    const st = { started: false, over: false, slots: fixed.slice(), sel: null, time: 240, ghost: null, playing: null };

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 30%,#2F5D8C 0,#1E3557 55%,#0d1a30 100%);color:#E8DCC4;font-family:var(--g-body);padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px}
.${P}top{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}
.${P}top h2{font-family:var(--g-display);font-weight:500;font-size:clamp(20px,3vw,28px);letter-spacing:.12em;margin:0;flex:1 1 auto;text-transform:uppercase}
.${P}hbar{display:flex;align-items:center;gap:8px;font-size:12px;letter-spacing:.2em}
.${P}hbar span{display:block;width:140px;height:12px;border-radius:6px;border:1px solid #7FB2E0;overflow:hidden}
.${P}hbar i{display:block;height:100%;background:#7ed38a;transition:width .3s}
.${P}btn{font:700 14px var(--g-body);color:#0b1424;background:#E8DCC4;border:0;border-radius:16px;padding:9px 16px;cursor:pointer;min-height:38px}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}sing{background:#F2B544}
.${P}scroll{flex:1 1 300px;min-height:220px;max-height:420px;overflow-x:auto;overflow-y:hidden;display:flex}
.${P}mem{width:100%;min-width:680px;height:100%}
.${P}mem g[role=button]{cursor:pointer;outline:none}
.${P}mem g[role=button]:focus rect.${P}hit{stroke:#F2B544;stroke-width:3}
.${P}trays{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.${P}tray{border:1.5px solid;border-radius:14px;padding:8px;background:rgba(11,20,36,.55);min-width:0}
.${P}tray h3{font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin:0 0 6px;font-weight:700}
.${P}tray .${P}ph{display:flex;gap:6px;flex-wrap:wrap}
.${P}phr{background:none;border:1.5px solid transparent;border-radius:10px;padding:2px;cursor:grab;touch-action:none}
.${P}phr[aria-pressed=true]{border-color:#F2B544;background:rgba(242,181,68,.15)}
.${P}phr:disabled{opacity:.6;cursor:default}
.${P}say{min-height:1.4em;font-style:italic;color:#c9d8ec}
.${P}drag{position:fixed;pointer-events:none;z-index:50;opacity:.85}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(13,26,48,.82);z-index:5}
.${P}card{max-width:520px;background:#11203a;border:1.5px solid #7FB2E0;border-radius:18px;padding:20px 22px}
.${P}card h2{font-family:var(--g-display);font-weight:500;font-size:30px;margin:0 0 8px}
.${P}card p{margin:0 0 10px;line-height:1.45}
`;
    wrap.appendChild(css);
    const top = document.createElement("div"); top.className = P + "top";
    top.innerHTML = `<h2>Marrow-Song · verse one</h2><div class="${P}hbar">HARMONY <span><i></i></span><b></b></div>
<button type="button" class="${P}btn" data-a="hint">Ask the one who dreams</button><button type="button" class="${P}btn" data-a="listen">Listen</button><button type="button" class="${P}btn ${P}sing" data-a="sing" disabled>Sing</button>`;
    const NS = "http://www.w3.org/2000/svg";
    const mem = document.createElementNS(NS, "svg"); mem.setAttribute("class", P + "mem"); mem.setAttribute("viewBox", "0 0 1000 300"); mem.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const say = document.createElement("div"); say.className = P + "say"; say.textContent = "“Sing it whole.” Every seat needs a phrase in the verse.";
    const trays = document.createElement("div"); trays.className = P + "trays";
    const scroller = document.createElement("div"); scroller.className = P + "scroll"; scroller.appendChild(mem);
    wrap.append(top, scroller, say, trays);
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>Marrow-Song</h2>
<p>Each bead is a note; higher is higher. <b>Place your three phrases</b> (blue) in the empty slots of the membrane: drag them, or tap a phrase and then a slot.</p>
<p>Where one phrase ends and the next begins, a step of 0 or 1 is <b>smooth</b>, 3 or more <b>breaks</b>. Alternating accents make <b>rowing calls</b>. Press Sing when you are ready; your brothers fill what is left. Harmony 75 or more sings true.</p>
<button type="button" class="${P}btn ${P}sing">Start</button></div>`;
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const singBtn = top.querySelector('[data-a="sing"]');

    // ---- sound ----------------------------------------------------------------------------------
    let audio = null;
    function note(seat, h, at, accent) {
      if (!audio) return;
      const o = audio.createOscillator(), v = audio.createGain(), f = audio.createBiquadFilter();
      o.type = SEATS[seat].wave; o.frequency.value = PITCH[h]; f.type = "lowpass"; f.frequency.value = 1200;
      const t = audio.currentTime + at, peak = accent ? 0.22 : 0.12;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(peak, t + 0.03); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(f).connect(v).connect(audio.destination); o.start(t); o.stop(t + 0.45);
    }
    const BEAT = 0.42;
    function playPhrase(p, at = 0) { p.notes.forEach((h, j) => note(p.seat, h, at + j * BEAT, j + 1 === p.accent)); }
    function listen(slots, then) {
      if (st.playing) return;
      const t0 = performance.now();
      slots.forEach((p, i) => p && playPhrase(p, i * 4 * BEAT));
      const tick = () => {
        const beat = (performance.now() - t0) / 1000 / BEAT;
        st.playing.head = beat; drawMem();
        if (beat >= SLOTS * 4) { st.playing = null; drawMem(); if (then) then(); return; }
        st.playing.raf = requestAnimationFrame(tick);
      };
      st.playing = { head: 0, raf: requestAnimationFrame(tick) };
    }

    // ---- drawing --------------------------------------------------------------------------------
    const SX = 40, SW = 115, Y = (h) => 250 - h * 38;
    function beadsSvg(p, x, w, ghost) {
      const col = SEATS[p.seat].col, step = w / 4;
      let s = `<polyline points="${p.notes.map((h, j) => `${x + step * (j + 0.5)},${Y(h)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2" opacity="${ghost ? 0.4 : 0.8}"/>`;
      p.notes.forEach((h, j) => {
        const cx = x + step * (j + 0.5), r = j + 1 === p.accent ? 11 : 8;
        s += `<circle cx="${cx}" cy="${Y(h)}" r="${r}" fill="${col}" stroke="#0b1424" stroke-width="2" opacity="${ghost ? 0.45 : 1}"/>`;
        if (!ghost) s += `<circle cx="${cx - r * 0.35}" cy="${Y(h) - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".6"/>`;
      });
      return s;
    }
    function drawMem() {
      let s = `<rect x="20" y="20" width="960" height="260" rx="40" fill="#fff" opacity=".05" stroke="#7FB2E0" stroke-opacity=".35"/>`;
      for (let h = 1; h <= 5; h++) s += `<line x1="30" x2="970" y1="${Y(h)}" y2="${Y(h)}" stroke="#7FB2E0" stroke-opacity=".18"/><text x="26" y="${Y(h) + 4}" font-size="11" fill="#7FB2E0" text-anchor="end" opacity=".6">${h}</text>`;
      for (let i = 0; i < SLOTS; i++) {
        const x = SX + i * SW, p = st.slots[i];
        s += `<g role="button" tabindex="0" data-slot="${i}" aria-label="Slot ${i + 1}${p ? ", " + SEATS[p.seat].short : ", empty"}">`;
        s += `<rect class="${P}hit" x="${x + 3}" y="40" width="${SW - 6}" height="230" rx="22" fill="${p ? "rgba(255,255,255,.03)" : st.sel ? "rgba(242,181,68,.10)" : "rgba(255,255,255,.06)"}" stroke="#7FB2E0" stroke-opacity=".3" stroke-dasharray="${p ? "" : "6 6"}"/>`;
        if (p) s += beadsSvg(p, x + 6, SW - 12, false);
        else if (st.ghost && st.ghost.slot === i) s += beadsSvg(st.ghost.p, x + 6, SW - 12, true);
        s += `<text x="${x + SW / 2}" y="290" font-size="11" text-anchor="middle" fill="#7FB2E0" opacity=".7">${p ? SEATS[p.seat].short.toUpperCase() : i + 1}</text></g>`;
      }
      for (let i = 0; i < SLOTS - 1; i++) {
        const a = st.slots[i], b = st.slots[i + 1]; if (!a || !b) continue;
        const k = joinKind(a, b), col = k === "smooth" ? "#7ed38a" : k === "rough" ? "#f0a640" : "#8c8c8c";
        const x1 = SX + i * SW + 6 + (SW - 12) * 7 / 8, x2 = SX + (i + 1) * SW + 6 + (SW - 12) / 8;
        s += `<line x1="${x1}" y1="${Y(a.notes[3])}" x2="${x2}" y2="${Y(b.notes[0])}" stroke="${col}" stroke-width="4" ${k === "break" ? 'stroke-dasharray="4 6"' : ""}/>`;
        if (a.accent !== b.accent) s += `<text x="${SX + (i + 1) * SW}" y="34" font-size="12" text-anchor="middle" fill="#F2B544">≈</text>`;
      }
      if (st.playing) { const x = SX + 6 + st.playing.head * (SW / 4); s += `<line x1="${x}" x2="${x}" y1="30" y2="275" stroke="#7FB2E0" stroke-width="4" opacity=".8"/>`; }
      mem.innerHTML = s;
      const h = harmony(st.slots);
      top.querySelector("i").style.width = h + "%";
      top.querySelector("i").style.background = h >= 75 ? "#7ed38a" : h <= 40 ? "#8c8c8c" : "#f0a640";
      top.querySelector("b").textContent = String(h);
      singBtn.disabled = !st.slots.some((p) => p && p.seat === 0) || st.over;
    }
    function drawTrays() {
      const fa = document.activeElement, keep = fa && trays.contains(fa) && fa.dataset ? fa.dataset.id : null;
      trays.innerHTML = "";
      SEATS.forEach((seat, s) => {
        const t = document.createElement("div"); t.className = P + "tray"; t.style.borderColor = seat.col;
        t.innerHTML = `<h3 style="color:${seat.col}">${seat.name}</h3><div class="${P}ph"></div>`;
        for (const p of phrases.filter((q) => q.seat === s)) {
          const placed = st.slots.includes(p);
          const b = document.createElement("button"); b.type = "button"; b.className = P + "phr"; b.dataset.id = p.id;
          b.setAttribute("aria-pressed", String(st.sel === p)); b.setAttribute("aria-label", `Phrase ${p.notes.join(" ")}, accent on beat ${p.accent}`);
          b.disabled = s !== 0 || placed || st.over;
          b.innerHTML = `<svg width="92" height="64" viewBox="0 0 92 64"><g transform="translate(0,-${0})">${beadsSvg(p, 2, 88, placed && s === 0).replace(/cy="(\d+(\.\d+)?)"/g, (m, v) => `cy="${(+v - 50) * 0.24 + 12}"`).replace(/points="([^"]+)"/, (m, pts) => `points="${pts.split(" ").map((xy) => { const [x, y] = xy.split(","); return `${x},${(+y - 50) * 0.24 + 12}`; }).join(" ")}"`)}</g></svg>`;
          t.querySelector("." + P + "ph").appendChild(b);
        }
        trays.appendChild(t);
      });
      if (keep) { const b = trays.querySelector(`[data-id="${keep}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
    }
    const redraw = () => { drawMem(); drawTrays(); };

    // ---- placing --------------------------------------------------------------------------------
    function place(p, i) {
      if (st.over || !p || p.seat !== 0) return;
      const cur = st.slots[i];
      if (cur && cur.seat !== 0) { say.textContent = "That slot holds a brother's phrase. You can only move your own."; return; }
      const old = st.slots.indexOf(p); if (old >= 0) st.slots[old] = null;
      st.slots[i] = p; st.sel = null; st.ghost = null;
      const parts = [];
      if (i > 0 && st.slots[i - 1]) parts.push(`in: ${joinKind(st.slots[i - 1], p)}`);
      if (i < SLOTS - 1 && st.slots[i + 1]) parts.push(`out: ${joinKind(p, st.slots[i + 1])}`);
      say.textContent = parts.length ? `Joins ${parts.join(", ")}.` : "Placed.";
      playPhrase(p);
      redraw();
    }
    on(trays, "click", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      const p = phrases.find((q) => q.id === b.dataset.id);
      st.sel = st.sel === p ? null : p; playPhrase(p); redraw();
    });
    on(mem, "click", (e) => {
      const g = e.target.closest("[data-slot]"); if (!g || dragMoved) return;
      const i = +g.dataset.slot, cur = st.slots[i];
      if (st.sel) place(st.sel, i);
      else if (cur && cur.seat === 0) { st.slots[i] = null; say.textContent = "Taken back to your tray."; redraw(); }
      else if (cur) playPhrase(cur);
    });
    on(mem, "keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.slot != null) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); const i = e.target.dataset.slot; setTimeout(() => { const n = mem.querySelector(`[data-slot="${i}"]`); n && n.focus(); }, 0); } });
    // drag a phrase from the tray to a slot
    let drag = null, dragMoved = false;
    on(trays, "pointerdown", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      drag = { p: phrases.find((q) => q.id === b.dataset.id), x: e.clientX, y: e.clientY, el: null }; dragMoved = false;
    });
    on(window, "pointermove", (e) => {
      if (!drag) return;
      if (!drag.el && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.el = document.createElement("div"); drag.el.className = P + "drag";
        drag.el.innerHTML = trays.querySelector(`[data-id="${drag.p.id}"]`).innerHTML; wrap.appendChild(drag.el); dragMoved = true;
      }
      if (drag.el) { drag.el.style.left = e.clientX - 46 + "px"; drag.el.style.top = e.clientY - 32 + "px"; }
    });
    on(window, "pointerup", (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.el) {
        d.el.remove();
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const g = hit && hit.closest && hit.closest("[data-slot]");
        if (g) place(d.p, +g.dataset.slot);
        setTimeout(() => { dragMoved = false; }, 0);
      }
    });
    on(top, "click", (e) => {
      const b = e.target.closest("button"); if (!b || st.over) return;
      if (b.dataset.a === "listen") listen(st.slots);
      if (b.dataset.a === "hint") {
        const p = solution.find((q, i) => q && q.seat === 0 && st.slots[i] !== q && !st.slots[i]);
        if (!p) { say.textContent = "The one who dreams hums along: he has nothing to add."; return; }
        const i = solution.indexOf(p); st.ghost = { p, slot: i }; st.sel = p;
        say.textContent = `The one who dreams hums a placement: slot ${i + 1}. Tap the slot to accept.`; redraw();
      }
      if (b.dataset.a === "sing") sing();
    });
    function sing() {
      if (st.over) return;
      if (st.playing) { cancelAnimationFrame(st.playing.raf); st.playing = null; }
      st.slots = companionFill(st.slots, phrases); st.over = true; st.sel = null; st.ghost = null; redraw();
      say.textContent = "Your brothers fill the empty slots, and the four of you sing it whole.";
      const finish = () => {
        const h = harmony(st.slots);
        const mine = st.slots.filter((p) => p && p.seat === 0).length;
        api.end(h >= 75 ? { outcome: "win", text: `Harmony ${h}. The song sings true: on the river it will be the rowing chant, and every brother's good window widens by 15 ms. ${mine} of its phrases are yours.` }
          : h <= 40 ? { outcome: "lose", text: `Harmony ${h}. The verse breaks in too many places; on the river every brother's window narrows by 10 ms.` }
          : { outcome: "done", text: `Harmony ${h}. A song the raft can row to, though not a true one (75 or more).` });
      };
      if (audio && !api.reducedMotion) listen(st.slots, finish); else finish();
    }
    on(intro.querySelector("button"), "click", () => {
      intro.remove(); st.started = true;
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      const f = trays.querySelector("button:not(:disabled)"); f && f.focus();
    });
    timers.push(setInterval(() => {
      if (!st.started || st.over) return;
      st.time -= 1;
      if (st.time === 30) say.textContent = "The soft timer is nearly out; your brothers will fill the verse.";
      if (st.time <= 0) { if (!st.slots.some((p) => p && p.seat === 0)) { const p = phrases.find((q) => q.seat === 0); const i = st.slots.indexOf(null); st.slots[i] = p; } sing(); }
    }, 1000));
    redraw();

    return {
      unmount() {
        timers.forEach(clearInterval);
        if (st.playing) cancelAnimationFrame(st.playing.raf);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

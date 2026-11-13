// WrymWretch · The Slipping Glyph (1D, Illuminated initials). DESIGN.md section 11.
// One page: s_glyph_monolith (4 rows of 4 glyphs, slip delay 1.5 s; the fourth row has no stable
// part and cannot be read). A glyph left out of the focus circle for 1.5 s changes its unstable
// parts; its stable part never changes. A row's four stable parts make one rune from the key.
// A wrong rune reshuffles which parts are stable in that row; three wrong runes and the monolith
// devours (loss). Read the three readable rows to win. Aquatica's Purify holds one row still for
// 5 s, once. Rows, answers and the rune key come from data/glyph_pages.json.
// Cut for the prototype: the in-game notebook whose sketches blur after 5 seconds.
//
// Quoted on the win, verbatim as DESIGN.md section 3 quotes it:
//   "She surfaced screaming." creative-writing/vault/02_Novels/02_WrymWretch.md, line 73 (WW 73)

const PARCH = "#efe6d1", INK = "#3b2a14", GILT = "#d4a72c", GILTHI = "#f3d27a", RED = "#a42a1c", VINE = "#4f6b2e", BONE = "#f3eee2";
const TILE_BG = ["#1f4f7b", "#5b3a7a", "#8b2a20", "#3f5f2a"];
const TYPES = ["crown", "stem", "foot", "mark"];
const VARIANTS = 6;

const RUNES = [
  [1, 1, 1, 1], [1, 1, 2, 3], [1, 1, 3, 2], [1, 2, 1, 3], [1, 2, 2, 2], [1, 2, 3, 1],
  [1, 3, 1, 2], [1, 3, 2, 1], [1, 3, 3, 3], [2, 1, 1, 3], [2, 1, 2, 2], [2, 1, 3, 1],
].map(([c, s, f, m], i) => ({ id: i + 1, parts: { crown: c, stem: s, foot: f, mark: m } }));
const ROWS = [
  { answer: 4, stable: ["stem", "crown", "mark", "foot"] },
  { answer: 9, stable: ["stem", "mark", "crown", "foot"] },
  { answer: 2, stable: ["stem", "mark", "crown", "foot"] },
  { answer: null, stable: [null, null, null, null] },
];
const SLIP = 1.5, WRONG_TO_DEVOUR = 3;

// part drawings in a 100 x 100 box
const PART = {
  crown: ["M30,30 Q50,4 70,30", "M30,30 L50,12 L70,30", "M36,32 Q30,16 40,10 M64,32 Q70,16 60,10", "M30,26 H70 M50,18 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M28,26 Q39,12 50,26 T72,26", "M50,32 V12 M36,30 V16 M64,30 V16"],
  stem: ["M50,32 V68", "M45,32 V68 M55,32 V68", "M50,32 C34,42 66,58 50,68", "M50,32 V68 M38,50 H62", "M50,32 L41,41 L59,50 L41,59 L50,68", "M50,32 V44 M50,48 V52 M50,56 V68"],
  foot: ["M32,72 H68", "M34,70 Q50,94 66,70", "M50,68 L34,88 M50,68 L66,88", "M50,68 V82 Q50,92 38,86", "M50,72 m-8,8 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "M50,70 L38,88 H62 Z"],
  mark: ["M80,50 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0", "M74,44 L86,56 M86,44 L74,56", "M20,43 L12,56 H28 Z", "M80,42 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 M80,58 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M20,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", "M72,52 L78,58 L88,42"],
};
const glyphPaths = (p, color, w) => TYPES.map((t) => `<path d="${PART[t][p[t] - 1]}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");

const CSS = `
.wrymwretch-slipping-glyph-root{position:absolute;inset:0;overflow:auto;background:#2a2019;color:${INK};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-slipping-glyph-page{margin:8px;min-height:calc(100% - 16px);box-sizing:border-box;background:${PARCH};border:16px solid ${VINE};border-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23efe6d1'/%3E%3Cpath d='M0,24 Q12,8 24,24 T48,24' fill='none' stroke='%234f6b2e' stroke-width='3'/%3E%3Cpath d='M12,15 q5,-6 10,-2 q-5,5 -10,2z M36,33 q-5,6 -10,2 q5,-5 10,-2z' fill='%234f6b2e'/%3E%3Ccircle cx='24' cy='24' r='3' fill='%23d4a72c'/%3E%3Ccircle cx='6' cy='18' r='2' fill='%23a42a1c'/%3E%3C/svg%3E") 16 round;outline:2px solid ${RED};outline-offset:-4px;padding:18px 16px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"key surface slots" "foot foot foot";gap:14px 18px;align-items:start;box-shadow:0 0 0 3px ${GILT}}
.wrymwretch-slipping-glyph-h{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.24em;color:${RED};margin:0 0 8px}
.wrymwretch-slipping-glyph-key{grid-area:key;background:${PARCH};padding:4px}
.wrymwretch-slipping-glyph-keys{display:grid;grid-template-columns:repeat(2,44px);gap:6px}
.wrymwretch-slipping-glyph-rune{width:44px;height:44px;padding:2px;background:#f8f1df;border:1.5px solid ${INK};cursor:pointer;border-radius:2px}
.wrymwretch-slipping-glyph-rune:hover,.wrymwretch-slipping-glyph-rune:focus-visible{border-color:${RED};background:#fff6dc;outline:none}
.wrymwretch-slipping-glyph-rune svg,.wrymwretch-slipping-glyph-tile svg{width:100%;height:100%;display:block}
.wrymwretch-slipping-glyph-surface{grid-area:surface;position:relative;background:#4a4237;padding:10px;border-radius:2px;box-shadow:inset 0 0 30px rgba(0,0,0,.6);touch-action:none;justify-self:center;width:min(100%,560px);outline:none}
.wrymwretch-slipping-glyph-surface:focus-visible{box-shadow:inset 0 0 30px rgba(0,0,0,.6),0 0 0 3px ${GILTHI}}
.wrymwretch-slipping-glyph-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.wrymwretch-slipping-glyph-tile{aspect-ratio:1;border:3px solid ${GILT};border-radius:3px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35);transition:filter .3s,opacity .3s;opacity:.8;filter:saturate(.75) blur(.5px)}
.wrymwretch-slipping-glyph-tile.focus{opacity:1;filter:none}
.wrymwretch-slipping-glyph-tile.read{opacity:.9;filter:none;border-color:${GILTHI}}
.wrymwretch-slipping-glyph-dark{position:absolute;inset:0;pointer-events:none;border-radius:2px}
.wrymwretch-slipping-glyph-ring{position:absolute;pointer-events:none;border:3px solid ${GILTHI};border-radius:50%;box-shadow:0 0 18px rgba(243,210,122,.7),inset 0 0 12px rgba(243,210,122,.4);transform:translate(-50%,-50%)}
.wrymwretch-slipping-glyph-slots{grid-area:slots;display:flex;flex-direction:column;gap:8px;padding:4px}
.wrymwretch-slipping-glyph-slot{width:56px;height:56px;padding:3px;background:#f8f1df;border:2px dashed ${RED};cursor:pointer;font:700 22px 'Cinzel',Georgia,serif;color:${RED}}
.wrymwretch-slipping-glyph-slot.sel{border-style:solid;background:#fff0c4;box-shadow:0 0 0 3px ${GILTHI}}
.wrymwretch-slipping-glyph-slot.done{border:2px solid ${INK};cursor:default}
.wrymwretch-slipping-glyph-slot.void{opacity:.45;cursor:default;font-size:12px;font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-slipping-glyph-foot{grid-area:foot;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;font-size:16px}
.wrymwretch-slipping-glyph-foot i{flex:1 1 260px}
.wrymwretch-slipping-glyph-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.12em;background:${INK};color:${PARCH};border:0;padding:9px 14px;cursor:pointer;min-height:40px}
.wrymwretch-slipping-glyph-btn:disabled{opacity:.35}
.wrymwretch-slipping-glyph-dev b{color:${RED};font-size:18px;margin-left:2px}
.wrymwretch-slipping-glyph-dev b.off{color:rgba(164,42,28,.2)}
.wrymwretch-slipping-glyph-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,32,25,.7);padding:16px;z-index:3}
.wrymwretch-slipping-glyph-card{max-width:450px;background:${PARCH};padding:20px 22px;border:3px solid ${GILT};outline:2px solid ${RED};outline-offset:-8px;font-size:17px;line-height:1.4}
.wrymwretch-slipping-glyph-card h2{font:700 21px 'Cinzel',Georgia,serif;margin:0 0 8px;color:${RED}}
.wrymwretch-slipping-glyph-card p{margin:0 0 10px}
@media (max-width:640px){.wrymwretch-slipping-glyph-page{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"surface slots" "key key" "foot foot";padding:16px 12px}.wrymwretch-slipping-glyph-keys{grid-template-columns:repeat(6,44px)}.wrymwretch-slipping-glyph-slot{width:46px;height:46px}}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-slipping-glyph-root";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="wrymwretch-slipping-glyph-page">
        <div class="wrymwretch-slipping-glyph-key"><div class="wrymwretch-slipping-glyph-h">KEY</div><div class="wrymwretch-slipping-glyph-keys"></div></div>
        <div class="wrymwretch-slipping-glyph-surface" tabindex="0" aria-label="The monolith. Arrow keys move the focus circle.">
          <div class="wrymwretch-slipping-glyph-grid"></div><div class="wrymwretch-slipping-glyph-dark"></div><div class="wrymwretch-slipping-glyph-ring"></div></div>
        <div class="wrymwretch-slipping-glyph-slots"><div class="wrymwretch-slipping-glyph-h">ROWS</div></div>
        <div class="wrymwretch-slipping-glyph-foot"><i aria-live="polite">Watch what stays.</i>
          <span class="wrymwretch-slipping-glyph-dev"></span>
          <button type="button" class="wrymwretch-slipping-glyph-btn" data-purify>Purify a row</button></div>
      </div>
      <div class="wrymwretch-slipping-glyph-intro"><div class="wrymwretch-slipping-glyph-card">
        <h2>The Slipping Glyph · the monolith</h2>
        <p>Hold a glyph in the gilt circle and it keeps still. Look away for more than a moment and its parts slip, all but one. The part that stays is the true one.</p>
        <p>Each row's four true parts (one crown, stem, foot and mark) make a rune from the key. Pick a row's slot, then its rune. Three wrong runes and the monolith devours the page.</p>
        <button type="button" class="wrymwretch-slipping-glyph-btn" data-start>Start</button></div></div>`;
    root.appendChild(wrap);
    const grid = wrap.querySelector(".wrymwretch-slipping-glyph-grid"), surface = wrap.querySelector(".wrymwretch-slipping-glyph-surface");
    const dark = wrap.querySelector(".wrymwretch-slipping-glyph-dark"), ring = wrap.querySelector(".wrymwretch-slipping-glyph-ring");
    const slotsEl = wrap.querySelector(".wrymwretch-slipping-glyph-slots"), keysEl = wrap.querySelector(".wrymwretch-slipping-glyph-keys");
    const note = wrap.querySelector(".wrymwretch-slipping-glyph-foot i"), devEl = wrap.querySelector(".wrymwretch-slipping-glyph-dev");
    const purifyBtn = wrap.querySelector("[data-purify]");

    const st = { running: false, over: false, focus: 5, sel: null, wrong: 0, read: [false, false, false, false], purify: true, still: -1, stillT: 0, fx: 0.375, fy: 0.375 };
    const reroll = (cur) => { let v; do v = 1 + Math.floor(R() * VARIANTS); while (v === cur); return v; };
    // each glyph: parts, stable type, time away from focus
    const glyphs = [];
    ROWS.forEach((row, ri) => {
      for (let ci = 0; ci < 4; ci++) {
        const stable = row.stable[ci];
        const parts = {};
        TYPES.forEach((t) => (parts[t] = 1 + Math.floor(R() * VARIANTS)));
        if (stable) parts[stable] = RUNES[row.answer - 1].parts[stable];
        const el = document.createElement("div");
        el.className = "wrymwretch-slipping-glyph-tile";
        el.style.background = `radial-gradient(circle at 50% 40%, ${TILE_BG[(ri + ci) % 4]}, #120e0a 130%)`;
        grid.appendChild(el);
        glyphs.push({ ri, ci, stable, parts, away: 0, el });
      }
    });
    const paint = (gl) => { gl.el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" fill="none" stroke="${GILT}" stroke-width="1.2" stroke-dasharray="2 3"/>${glyphPaths(gl.parts, BONE, 6.5)}${glyphPaths(gl.parts, "rgba(0,0,0,.25)", 1)}</svg>`; };
    glyphs.forEach(paint);

    RUNES.forEach((ru) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wrymwretch-slipping-glyph-rune"; b.setAttribute("aria-label", "rune " + ru.id);
      b.innerHTML = `<svg viewBox="0 0 100 100">${glyphPaths(ru.parts, INK, 7)}</svg>`;
      b.addEventListener("click", () => choose(ru.id));
      keysEl.appendChild(b);
    });
    const slots = ROWS.map((row, ri) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wrymwretch-slipping-glyph-slot" + (row.answer ? "" : " void");
      b.textContent = row.answer ? "?" : "will not hold";
      b.setAttribute("aria-label", row.answer ? `row ${ri + 1} slot` : `row ${ri + 1}: unreadable`);
      b.addEventListener("click", () => {
        if (!row.answer || st.read[ri] || st.over) { if (!row.answer) note.textContent = "Nothing in this row stays. It cannot be held."; return; }
        st.sel = ri; slots.forEach((s, i) => s.classList.toggle("sel", i === ri));
        note.textContent = `Row ${ri + 1}: now choose its rune from the key.`;
      });
      slotsEl.appendChild(b);
      return b;
    });
    const drawDev = () => { devEl.innerHTML = "Devour " + Array.from({ length: WRONG_TO_DEVOUR }, (_, i) => `<b class="${i < st.wrong ? "" : "off"}">●</b>`).join(""); };
    drawDev();

    function choose(id) {
      if (st.over || !st.running) return;
      if (st.sel == null) { note.textContent = "Pick a row's slot first, on the right."; return; }
      const ri = st.sel, row = ROWS[ri];
      if (id === row.answer) {
        st.read[ri] = true;
        const s = slots[ri]; s.classList.remove("sel"); s.classList.add("done");
        s.innerHTML = `<svg viewBox="0 0 100 100">${glyphPaths(RUNES[id - 1].parts, INK, 7)}</svg>`;
        glyphs.filter((g) => g.ri === ri).forEach((g) => { TYPES.forEach((t) => (g.parts[t] = RUNES[id - 1].parts[t])); g.el.classList.add("read"); paint(g); });
        st.sel = null;
        note.textContent = `Row ${ri + 1} read.`;
        if (st.read.filter(Boolean).length === 3) {
          st.over = true;
          note.textContent = "Three rows held. The fourth has nothing that stays.";
          later(() => api.end({ outcome: "win", text: `Three rows read from the monolith${st.wrong ? `, ${st.wrong} wrong` : ""}. The fourth row slides away like the rest. The surface devours, and “She surfaced screaming.”` }), 900);
        }
        return;
      }
      st.wrong++; drawDev();
      if (st.wrong >= WRONG_TO_DEVOUR) {
        st.over = true;
        note.textContent = "The surface devours.";
        grid.style.transition = "filter 1.2s, opacity 1.2s"; grid.style.filter = "blur(6px)"; grid.style.opacity = ".2";
        later(() => api.end({ outcome: "lose", text: "Three wrong runes. The monolith devours what was read, and the meaning slides away. Tidecaller memory −3." }), 1300);
        return;
      }
      // the row reshuffles which part is stable
      const perm = TYPES.slice().sort(() => R() - 0.5);
      glyphs.filter((g) => g.ri === ri).forEach((g, i) => { g.stable = perm[i]; g.parts[g.stable] = RUNES[row.answer - 1].parts[g.stable]; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); });
      note.textContent = `Not that rune. Row ${ri + 1} shifts: a different part of each glyph holds now.`;
    }

    // ---- focus ------------------------------------------------------------------------------
    function placeRing() {
      const gb = grid.getBoundingClientRect(), sb = surface.getBoundingClientRect();
      const tile = glyphs[0].el.getBoundingClientRect().width || 60;
      const x = gb.left - sb.left + st.fx * gb.width, y = gb.top - sb.top + st.fy * gb.height;
      const d = tile * 1.15;
      ring.style.left = x + "px"; ring.style.top = y + "px"; ring.style.width = ring.style.height = d + "px";
      dark.style.background = `radial-gradient(circle ${d / 2 + 6}px at ${x}px ${y}px, transparent 0, transparent ${d / 2}px, rgba(10,8,6,.42) ${d / 2 + 14}px)`;
      // which glyph is held
      let best = -1, bd = Infinity;
      glyphs.forEach((g, i) => { const r = g.el.getBoundingClientRect(); const cx = r.left + r.width / 2 - gb.left, cy = r.top + r.height / 2 - gb.top; const dd = Math.hypot(cx - st.fx * gb.width, cy - st.fy * gb.height); if (dd < bd) { bd = dd; best = i; } });
      st.focus = bd < tile * 0.6 ? best : -1;
      glyphs.forEach((g, i) => g.el.classList.toggle("focus", i === st.focus));
    }
    const setFromPointer = (e) => { const gb = grid.getBoundingClientRect(); st.fx = Math.max(0, Math.min(1, (e.clientX - gb.left) / gb.width)); st.fy = Math.max(0, Math.min(1, (e.clientY - gb.top) / gb.height)); placeRing(); };
    surface.addEventListener("pointermove", setFromPointer);
    surface.addEventListener("pointerdown", (e) => { setFromPointer(e); surface.setPointerCapture && surface.setPointerCapture(e.pointerId); });
    surface.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return; e.preventDefault();
      const i = st.focus >= 0 ? st.focus : 5;
      const ci = Math.max(0, Math.min(3, glyphs[i].ci + d[0])), ri = Math.max(0, Math.min(3, glyphs[i].ri + d[1]));
      st.fx = (ci + 0.5) / 4; st.fy = (ri + 0.5) / 4; placeRing();
    });
    purifyBtn.addEventListener("click", () => {
      if (!st.purify || st.over || !st.running) return;
      const ri = st.sel != null ? st.sel : st.focus >= 0 ? glyphs[st.focus].ri : 0;
      st.purify = false; purifyBtn.disabled = true; st.still = ri; st.stillT = 5;
      note.textContent = `Aquatica's Purify: row ${ri + 1} holds still for five seconds.`;
    });

    // ---- the slip ---------------------------------------------------------------------------
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (st.running && !st.over) {
        st.stillT = Math.max(0, st.stillT - dt); if (st.stillT === 0) st.still = -1;
        glyphs.forEach((g, i) => {
          if (st.read[g.ri] || i === st.focus || g.ri === st.still) { g.away = 0; return; }
          g.away += dt;
          if (g.away > SLIP) { g.away = 0; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); }
        });
      }
      raf = requestAnimationFrame(frame);
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(placeRing) : null;
    ro && ro.observe(surface);
    const intro = wrap.querySelector(".wrymwretch-slipping-glyph-intro"), sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => { intro.remove(); st.running = true; surface.focus(); placeRing(); });
    sb.focus();
    requestAnimationFrame(placeRing);
    raf = requestAnimationFrame(frame);

    return { unmount() { st.over = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro && ro.disconnect(); wrap.remove(); } };
  },
};

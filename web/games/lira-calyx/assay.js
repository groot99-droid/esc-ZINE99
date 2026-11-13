// The Assay (1D, Oscilloscope trace). DESIGN.md section 11, cut to one bench modelled on
// b2-assay-2: five candidate compositions, a sample mass of 6. Tests spend mass: a reagent
// suppresses one named peak (1), a band filter isolates a 100 nm window at fine resolution (1), a
// pulse raises AFU in the cell and shifts the aetheric lattice peak (2). Measure with the cursor and
// vernier; a reading within ±2 nm is precise. Win: the right composition and one precise reading.
// A wrong conclusion allows one re-run with a fresh sample; a second wrong one loses.
// Added in the refine pass: Ratio (DESIGN 11, b2-assay-2: "read two peaks and compare their heights"),
// unlocked by the first precise reading; with two precise peaks it reads the isotope ratio, which adds
// the seeding evidence to a win. Readings leave flags on the trace. After two lost assays, a fresh
// sample of 7 mass is offered.
const P = "lira-calyx-assay-";
const GREEN = "#7dff9a", DIM = "#2f6b3f", PANEL = "#26292b", SCREEN = "#071a0e", PAPER = "#efe4cb", INK = "#3b2618", SEAL = "#b3212b";
const COMP = {
  silicate: { nm: 452, label: "bark silicate", vial: "#c8913a" },
  lattice: { nm: 512, label: "aetheric lattice", vial: "#3fc4d0", pulse: 530 },
  protein: { nm: 518, label: "spore protein", vial: "#7d7a74" },
  resin: { nm: 548, label: "fungal resin", vial: "#5a3f7a" },
  salt: { nm: 606, label: "storm-rock salt", vial: "#25c2a8" },
  oxide: { nm: 640, label: "iron oxide", vial: "#9c4a25" },
  glass: { nm: 690, label: "slag glass", vial: "#e7dcc3" },
};
const REAGENTS = [["R1 silicate wash", "silicate"], ["R2 protein fix", "protein"], ["R3 resin solvent", "resin"], ["R4 salt chelate", "salt"], ["R5 oxide reducer", "oxide"], ["R6 glass etch", "glass"]];
const CANDS = [
  { id: "A", name: "Bark silicate", parts: ["silicate", "resin", "glass"] },
  { id: "B", name: "Aetheric lattice", parts: ["silicate", "lattice", "salt"] },
  { id: "C", name: "Fungal resin", parts: ["silicate", "protein", "salt"] },
  { id: "D", name: "Storm-rock salt", parts: ["protein", "salt", "oxide"] },
  { id: "E", name: "Slag glass", parts: ["silicate", "resin", "oxide"] },
];
const L0 = 400, L1 = 800;

export default {
  mount(root, api) {
    const off = [];
    let raf = 0;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = "#1b1d1e";
    const el = document.createElement("div");
    el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;overflow:auto;color:${GREEN};font-family:'Courier Prime',monospace;background:#1b1d1e}
      .${P}spread{display:flex;flex-wrap:wrap;gap:14px;padding:14px;max-width:1300px;margin:0 auto;align-items:flex-start}
      .${P}bench{flex:1.5 1 420px;min-width:0;background:${PANEL};border:2px solid #3a3e41;border-radius:10px;padding:12px;box-shadow:inset 0 0 0 4px #1f2224}
      .${P}scope{position:relative;background:${SCREEN};border:3px solid #111;border-radius:8px;overflow:hidden}
      .${P}scope canvas{display:block;width:100%;touch-action:none;cursor:ew-resize}
      .${P}row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}
      .${P}wrap button{font:700 14px 'Courier Prime',monospace;color:${GREEN};background:#1a1d1f;border:1.5px solid ${DIM};padding:8px 12px;cursor:pointer;border-radius:3px;min-height:44px}
      .${P}wrap button:hover:not(:disabled){border-color:${GREEN};background:#203126;box-shadow:0 0 8px rgba(125,255,154,.25)}
      .${P}wrap button:active:not(:disabled){transform:translateY(1px)}
      .${P}wrap button[hidden]{display:none}
      .${P}wrap button.ratio{color:#b48cff;border-color:#5a3f7a}
      .${P}wrap button:disabled{opacity:.35;cursor:default}
      .${P}wrap button.amber{color:#ffcf6b;border-color:#8a6a2a}
      .${P}vial{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:80px;font-size:13px!important}
      .${P}vial i{display:block;width:16px;height:40px;border:1.5px solid #9aa;border-radius:0 0 8px 8px;border-top:4px solid #9aa}
      .${P}vial.used i{opacity:.3}
      .${P}vial.hint{outline:3px solid #ffcf6b;outline-offset:2px;animation:${P}blink 1s steps(2) infinite}
      @keyframes ${P}blink{50%{outline-color:transparent}}
      .${P}vial.drop i{animation:${P}tilt .6s}
      @keyframes ${P}tilt{40%{transform:rotate(-35deg)}}
      .${P}bench.bad{animation:${P}shake .4s}.${P}page.bad{animation:${P}shake .4s}
      @keyframes ${P}shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
      .${P}lab{font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:#9fb8a6;display:flex;flex-wrap:wrap;gap:2px 12px;justify-content:space-between;margin:0 2px 6px}
      .${P}page{flex:1 1 300px;min-width:0;background:${PAPER};color:${INK};padding:16px 18px;border-radius:2px;box-shadow:4px 4px 0 rgba(0,0,0,.35);font-family:Georgia,serif}
      .${P}page h3{font:400 20px 'IM Fell English',Georgia,serif;margin:0 0 6px}
      .${P}cand{display:block;width:100%;text-align:left;background:transparent!important;color:${INK}!important;border:0!important;border-bottom:1px dotted rgba(59,38,24,.4)!important;font:14px Georgia,serif!important;padding:6px 2px!important;min-height:36px}
      .${P}cand b{font-family:'Courier Prime',monospace}
      .${P}cand small{display:block;font:13px 'Courier Prime',monospace;opacity:.85}
      .${P}cand:hover{background:rgba(59,38,24,.07)!important}
      .${P}cand.x{text-decoration:line-through;text-decoration-color:${SEAL};text-decoration-thickness:2px;opacity:.55}
      .${P}mass{display:flex;gap:6px;margin:6px 0 12px}.${P}mass i{width:14px;height:14px;border-radius:50%;border:1.5px solid ${INK}}.${P}mass i.f{background:${INK}}
      .${P}notes{font:italic 16px/1.45 'IM Fell English',Georgia,serif;min-height:120px;border-top:1px solid rgba(59,38,24,.3);padding-top:8px}
      .${P}notes p{margin:0 0 4px}.${P}notes .r{color:${SEAL}}.${P}notes .v{color:#2f4c86}
      .${P}notes p:last-child{animation:${P}ink .8s}
      @keyframes ${P}ink{from{opacity:0;transform:translateX(-6px)}}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,12,12,.82);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(470px,100%);background:${PANEL};border:2px solid #3a3e41;border-radius:10px;padding:10px;box-shadow:inset 0 0 0 4px #1f2224}
      .${P}card .scr{background:${SCREEN};border:3px solid #111;border-radius:8px;padding:14px 16px;
        background-image:linear-gradient(rgba(125,255,154,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(125,255,154,.08) 1px,transparent 1px);background-size:100% 25%,12.5% 100%}
      .${P}card .ch{font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:#9fb8a6}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:4px 0 6px;color:#f2f4f5;text-shadow:0 0 8px rgba(125,255,154,.35)}
      .${P}card .goal{margin:0 0 10px;font:15px/1.45 'Courier Prime',monospace;color:${GREEN}}
      .${P}card dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0;font:14px/1.35 'Courier Prime',monospace;color:#d6f5de}
      .${P}card dt{color:#ffcf6b;font-weight:700}
      .${P}card .knobs{display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}
      .${P}card .knobs i{width:30px;height:30px;border-radius:50%;background:radial-gradient(#555,#222);border:2px solid #111;position:relative}
      .${P}card .knobs i::after{content:"";position:absolute;left:50%;top:3px;width:2px;height:10px;background:#ddd}
      .${P}card label{display:flex;gap:8px;align-items:center;font:14px 'Courier Prime',monospace;color:#ffcf6b;margin-top:10px}
      .${P}card button.go{margin-left:auto;background:${GREEN};color:#071a0e;border:0}
    </style>
    <div class="${P}spread">
      <section class="${P}bench" aria-label="Bench">
        <div class="${P}lab"><span>CH1 · SPECTRUM 400–800 nm</span><span class="${P}cuv">CUVETTE: WELL N5</span></div>
        <div class="${P}scope"><canvas tabindex="0" aria-label="Spectrum. Drag or use arrow keys to move the cursor; Enter records."></canvas></div>
        <div class="${P}row"><button type="button" data-a="filter" title="F">BAND FILTER (1)</button><button type="button" data-a="clear">FULL BAND</button><button type="button" data-a="pulse" title="P">PULSE (2)</button>
          <button type="button" class="ratio" data-a="ratio" hidden>RATIO</button>
          <span style="flex:1"></span><button type="button" data-a="record" title="Enter">RECORD</button><button type="button" class="amber" data-a="conclude">CONCLUDE</button></div>
        <div class="${P}row ${P}rack" aria-label="Reagent rack"></div>
      </section>
      <section class="${P}page" aria-label="Reference card and notes">
        <h3>Reference card: well sample, N5</h3>
        <div class="${P}cands"></div>
        <h3 style="margin-top:12px">Sample mass</h3><div class="${P}mass"></div>
        <h3>Notes</h3><div class="${P}notes" aria-live="polite"></div>
      </section>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const cv = $("canvas"), g = cv.getContext("2d");
    const rng = api.rng();

    let st;
    const fresh = (rerun) => {
      st = { sample: CANDS[Math.floor(rng() * CANDS.length)], mass: MASS, used: new Set(), filter: null, pulse: false, cursor: 560, struck: new Set(),
        precise: false, readings: 0, wrongStrikes: 0, hint: null, rerun: !!rerun, failed: st ? st.failed : 0, over: false, noise: Array.from({ length: 401 }, () => rng() - 0.5),
        flags: [], precisePeaks: new Set(), ratio: null, beats: st ? st.beats : {}, pop: null };
    };
    const losses = api.store.get("losses", 0);
    let MASS = 6;
    fresh(false);
    const notes = $("." + P + "notes");
    const note = (t, red) => { const p = document.createElement("p"); p.textContent = t; if (red) p.className = red === "v" ? "v" : "r"; notes.appendChild(p); while (notes.children.length > 9) notes.firstChild.remove(); };
    const shake = (sel) => { if (api.reducedMotion) return; const n = el.querySelector(sel); n.classList.remove("bad"); void n.offsetWidth; n.classList.add("bad"); };
    const pop = (txt, col) => { st.pop = { txt, col, t: performance.now() }; drawScope(); };

    // ---- reference card and rack
    const cands = $("." + P + "cands");
    const renderCands = () => {
      cands.innerHTML = "";
      for (const c of CANDS) {
        const b = document.createElement("button"); b.type = "button"; b.className = P + "cand" + (st.struck.has(c.id) ? " x" : "");
        b.innerHTML = `<b>${c.id}</b> ${c.name}<small>${c.parts.map((p) => `${COMP[p].label} ${COMP[p].nm}${COMP[p].pulse ? "→" + COMP[p].pulse : ""}`).join(" · ")}</small>`;
        b.setAttribute("aria-pressed", st.struck.has(c.id));
        b.title = "Strike or restore this candidate";
        on(b, "click", () => {
          if (st.over) return;
          if (st.struck.has(c.id)) st.struck.delete(c.id);
          else { st.struck.add(c.id); if (c === st.sample) { st.wrongStrikes++; if (st.wrongStrikes === 2) giveHint(); } }
          renderCands();
        });
        cands.appendChild(b);
      }
    };
    const rack = $("." + P + "rack");
    const renderRack = () => {
      rack.innerHTML = "";
      REAGENTS.forEach(([name, comp], i) => {
        const b = document.createElement("button"); b.type = "button";
        b.className = P + "vial" + (st.used.has(comp) ? " used" : "") + (st.hint === comp ? " hint" : "");
        b.innerHTML = `<i style="background:${COMP[comp].vial}"></i>${name.split(" ").slice(0, 2).join(" ")}`;
        b.title = `${name}: suppresses the ${COMP[comp].label} peak at ${COMP[comp].nm} nm (cost 1)`;
        b.setAttribute("aria-label", b.title);
        b.disabled = st.used.has(comp) || st.mass < 1 || st.over;
        on(b, "click", () => {
          if (st.mass < 1 || st.used.has(comp)) return;
          st.mass--; st.used.add(comp); if (st.hint === comp) st.hint = null;
          const present = st.sample.parts.includes(comp);
          note(`${name}: ${present ? `the ${COMP[comp].nm} peak drops. ${COMP[comp].label} is present.` : "nothing changes."}`);
          pop(present ? `▼ ${COMP[comp].nm} nm suppressed` : "no change", present ? "#ffcf6b" : "#9fb8a6");
          if (!st.beats.r1) { st.beats.r1 = 1; note("Strike every card the result rules out. A drop proves a compound is there; no change proves it is not.", "v"); }
          sync(); const vb = rack.children[i]; if (vb && !api.reducedMotion) vb.classList.add("drop");
        });
        rack.appendChild(b);
      });
    };
    const giveHint = () => {
      const remaining = CANDS.filter((c) => !st.struck.has(c.id) || c === st.sample);
      const best = REAGENTS.map(([, c]) => c).filter((c) => !st.used.has(c)).sort((a, b) => {
        const split = (c) => { const n = remaining.filter((r) => r.parts.includes(c)).length; return Math.abs(n - remaining.length / 2); };
        return split(a) - split(b);
      })[0];
      if (best) { st.hint = best; note(`Struck the wrong one twice. Try the ${COMP[best].label} reagent.`, true); renderRack(); }
    };
    const massEl = $("." + P + "mass");
    const sync = () => {
      massEl.innerHTML = Array.from({ length: MASS }, (_, i) => `<i class="${i < st.mass ? "f" : ""}"></i>`).join("");
      massEl.setAttribute("aria-label", `${st.mass} of ${MASS} mass left`);
      el.querySelector('[data-a="ratio"]').disabled = st.over || st.precisePeaks.size < 2 || !!st.ratio;
      if (st.mass <= 2 && !st.beats.kade && !st.over) { st.beats.kade = 1; note("Kade raps twice on the archive door: a patrol on the Cinder road. Spend what is left with care.", "v"); }
      el.querySelector('[data-a="filter"]').disabled = st.mass < 1 || st.over;
      el.querySelector('[data-a="pulse"]').disabled = st.mass < 2 || st.pulse || st.over;
      el.querySelector('[data-a="clear"]').disabled = !st.filter || st.over;
      renderRack(); drawScope();
    };

    // ---- the spectrum
    const peaks = () => st.sample.parts.map((p) => ({ comp: p, nm: st.pulse && COMP[p].pulse ? COMP[p].pulse : COMP[p].nm, a: st.used.has(p) ? 0.07 : 0.8 + (p.length % 3) * 0.08 }));
    const signal = (l) => {
      let v = 0;
      const inWin = st.filter != null && Math.abs(l - st.filter) <= 50;
      const sig = inWin ? 3.4 : 17;
      for (const pk of peaks()) v += pk.a * Math.exp(-((l - pk.nm) ** 2) / (2 * sig * sig));
      v += st.noise[Math.round(l - L0)] * 0.03;
      if (st.filter != null && !inWin) v *= 0.12;
      return v;
    };
    let CW = 600, CH = 300, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      CW = Math.max(260, cv.parentElement.clientWidth); CH = Math.round(Math.min(340, Math.max(220, CW * 0.5)));
      cv.width = CW * dpr; cv.height = CH * dpr; cv.style.height = CH + "px"; drawScope();
    };
    const pad = { l: 12, r: 12, t: 14, b: 66 };
    const xOf = (l) => pad.l + (l - L0) / (L1 - L0) * (CW - pad.l - pad.r);
    const lOf = (x) => L0 + (x - pad.l) / (CW - pad.l - pad.r) * (L1 - L0);
    function drawScope() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = SCREEN; g.fillRect(0, 0, CW, CH);
      const top = pad.t, bot = CH - pad.b, ph = bot - top;
      // graticule
      g.strokeStyle = "rgba(125,255,154,0.13)"; g.lineWidth = 1;
      for (let i = 0; i <= 8; i++) { const x = xOf(L0 + i * 50); g.beginPath(); g.moveTo(x, top); g.lineTo(x, bot); g.stroke(); }
      for (let j = 0; j <= 6; j++) { const y = top + j * ph / 6; g.beginPath(); g.moveTo(pad.l, y); g.lineTo(CW - pad.r, y); g.stroke(); }
      if (st.filter != null) { g.fillStyle = "rgba(125,255,154,0.07)"; g.fillRect(xOf(st.filter - 50), top, xOf(st.filter + 50) - xOf(st.filter - 50), ph);
        g.fillStyle = GREEN; g.font = "11px 'Courier Prime',monospace"; g.fillText(`FILTER ${Math.round(st.filter - 50)}–${Math.round(st.filter + 50)}`, xOf(st.filter - 50) + 4, top + 12); }
      // trace with phosphor glow
      const tr = () => { g.beginPath(); for (let x = pad.l; x <= CW - pad.r; x += 1) { const y = bot - signal(lOf(x)) * ph * 0.95; x === pad.l ? g.moveTo(x, y) : g.lineTo(x, y); } };
      g.lineJoin = "round";
      tr(); g.strokeStyle = "rgba(125,255,154,0.18)"; g.lineWidth = 6; g.stroke();
      tr(); g.strokeStyle = GREEN; g.lineWidth = 1.6; g.stroke();
      // cursor
      const cx = xOf(st.cursor);
      g.strokeStyle = "#e8fff0"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, top); g.lineTo(cx, bot); g.stroke();
      g.beginPath(); g.arc(cx, bot - signal(st.cursor) * ph * 0.95, 5, 0, 7); g.stroke();
      const fine = st.filter != null && Math.abs(st.cursor - st.filter) <= 50;
      const txt = `λ ${st.cursor.toFixed(1)} nm  ${fine ? "± 2 FINE" : "± 8 COARSE"}`;
      g.font = "13px 'Courier Prime',monospace"; const tw = g.measureText(txt).width + 14;
      const bx = Math.min(CW - pad.r - tw, Math.max(pad.l, cx + 8));
      g.fillStyle = "rgba(7,26,14,.9)"; g.fillRect(bx, top + 18, tw, 22); g.strokeStyle = GREEN; g.strokeRect(bx, top + 18, tw, 22);
      g.fillStyle = GREEN; g.fillText(txt, bx + 7, top + 34);
      if (st.pulse) { g.fillStyle = "#b48cff"; g.font = "13px 'Courier Prime',monospace"; g.fillText("AFU 0.74 PULSED", CW - pad.r - 140, top + 14); }
      // recorded readings stay as flags on the trace
      for (const f of st.flags) { const x = xOf(f.l); g.strokeStyle = f.ok ? "#ffcf6b" : "rgba(159,184,166,.6)"; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, bot); g.lineTo(x, top + 46); g.stroke(); g.setLineDash([]);
        g.fillStyle = f.ok ? "#ffcf6b" : "#9fb8a6"; g.beginPath(); g.moveTo(x, top + 46); g.lineTo(x + 9, top + 50); g.lineTo(x, top + 54); g.fill(); }
      if (st.pop) { const age = (performance.now() - st.pop.t) / 1400; if (age < 1) { g.globalAlpha = 1 - age; g.fillStyle = st.pop.col; g.font = "700 16px 'Courier Prime',monospace"; g.textAlign = "center"; g.fillText(st.pop.txt, CW / 2, top + ph * 0.42 - (api.reducedMotion ? 0 : age * 18)); g.textAlign = "left"; g.globalAlpha = 1; cancelAnimationFrame(raf); raf = requestAnimationFrame(drawScope); } else st.pop = null; }
      // wavelength scale and vernier
      g.fillStyle = "#9fb8a6"; g.font = "12px 'Courier Prime',monospace"; g.textAlign = "center";
      for (let l = L0; l <= L1; l += 50) g.fillText(String(l), xOf(l), bot + 13);
      const vy = bot + 22;
      g.fillStyle = "#101512"; g.fillRect(pad.l, vy, CW - pad.l - pad.r, 34); g.strokeStyle = DIM; g.strokeRect(pad.l, vy, CW - pad.l - pad.r, 34);
      g.strokeStyle = "#9fb8a6";
      for (let l = L0; l <= L1; l += 5) { const x = xOf(l), h = l % 50 === 0 ? 12 : l % 10 === 0 ? 8 : 4; g.beginPath(); g.moveTo(x, vy); g.lineTo(x, vy + h); g.stroke(); }
      // vernier: 10 divisions spanning 9 main units (of 1 nm, magnified around the cursor)
      g.strokeStyle = "#ffcf6b"; const unit = (xOf(L0 + 10) - xOf(L0)) * 0.9;
      const base = xOf(st.cursor);
      for (let k = 0; k <= 10; k++) { const x = base + k * unit * 0.9 / 0.9 * 0.9; g.beginPath(); g.moveTo(x, vy + 34); g.lineTo(x, vy + (k % 5 ? 24 : 18)); g.stroke(); }
      g.fillStyle = "#ffcf6b"; g.font = "13px 'Courier Prime',monospace"; g.fillText(`${Math.floor(st.cursor)} + 0.${Math.round((st.cursor % 1) * 10) % 10}`, Math.min(CW - 50, base + unit * 5), vy + 16);
      g.textAlign = "left";
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv.parentElement);

    // cursor input
    const setCursor = (e) => { const r = cv.getBoundingClientRect(); st.cursor = Math.max(L0, Math.min(L1, Math.round(lOf(e.clientX - r.left) * 10) / 10)); drawScope(); };
    let dragging = false;
    on(cv, "pointerdown", (e) => { if (st.over) return; dragging = true; try { cv.setPointerCapture(e.pointerId); } catch {} setCursor(e); });
    on(cv, "pointermove", (e) => { if (dragging) setCursor(e); });
    on(cv, "pointerup", () => { dragging = false; });
    on(cv, "keydown", (e) => {
      const d = e.shiftKey ? 0.1 : 1;
      if (e.key === "ArrowLeft") st.cursor = Math.max(L0, +(st.cursor - d).toFixed(1));
      else if (e.key === "ArrowRight") st.cursor = Math.min(L1, +(st.cursor + d).toFixed(1));
      else if (e.key === "Enter") { act("record"); } else if (e.key === "f" || e.key === "F") act("filter"); else if (e.key === "p" || e.key === "P") act("pulse"); else return;
      e.preventDefault(); drawScope();
    });

    // ---- actions
    const act = (a) => {
      if (st.over) return;
      if (a === "filter" && st.mass >= 1) { st.mass--; st.filter = Math.max(L0 + 50, Math.min(L1 - 50, Math.round(st.cursor))); note(`Band filter ${st.filter - 50}–${st.filter + 50} nm: the peaks there sharpen.`); pop("FILTER IN: ±2 nm FINE", GREEN); }
      if (a === "clear") { st.filter = null; }
      if (a === "pulse" && st.mass >= 2 && !st.pulse) { st.mass -= 2; st.pulse = true; const has = st.sample.parts.includes("lattice"); note(`Pulse: AFU up. ${has ? "A peak walks from 512 to 530. Lattice." : "Nothing walks. No lattice."}`); pop(has ? "512 → 530 nm" : "nothing walks", "#b48cff"); }
      if (a === "ratio" && st.precisePeaks.size >= 2 && !st.ratio) {
        const [p1, p2] = [...st.precisePeaks].map((c) => COMP[c]);
        st.ratio = (0.58 + rng() * 0.08).toFixed(2);
        note(`Ratio of the ${p1.nm} and ${p2.nm} lines: 1 : ${st.ratio}. Well water from the Lowlands runs close to 1 : 1. Something was put down this well.`, "v");
        pop(`1 : ${st.ratio}`, "#b48cff");
      }
      if (a === "record") {
        st.readings++;
        const fine = st.filter != null && Math.abs(st.cursor - st.filter) <= 50;
        const vis = peaks().filter((p) => p.a > 0.3);
        const near = vis.sort((x, y) => Math.abs(x.nm - st.cursor) - Math.abs(y.nm - st.cursor))[0];
        const dist = near ? Math.abs(near.nm - st.cursor) : 99;
        const ok = fine && dist <= 2;
        st.flags.push({ l: st.cursor, ok }); if (st.flags.length > 8) st.flags.shift();
        if (ok) {
          st.precise = true; st.precisePeaks.add(near.comp); note(`Read ${st.cursor.toFixed(1)} nm, peak. Precise.`); pop("PRECISE ±2", "#ffcf6b");
          if (!st.beats.ratio) { st.beats.ratio = 1; el.querySelector('[data-a="ratio"]').hidden = false; note("Now the ratio: a second precise peak, then RATIO compares their heights. Isotopes keep their proportions unless someone changes them.", "v"); }
        }
        else if (fine) { note(`Read ${st.cursor.toFixed(1)} nm: ${dist < 12 ? "beside the peak, not on it." : "no peak here."}`); pop(dist < 12 ? "BESIDE THE PEAK" : "NO PEAK", "#9fb8a6"); }
        else { note(`Read ${st.cursor.toFixed(1)} nm, coarse. The full band is too wide to call it.`); pop("COARSE ±8: FILTER FIRST", "#9fb8a6"); }
      }
      if (a === "conclude") {
        const left = CANDS.filter((c) => !st.struck.has(c.id));
        if (left.length !== 1) { note(`Strike candidates until one remains (${left.length} left).`, true); shake("." + P + "page"); return; }
        const pick = left[0];
        if (pick === st.sample && st.precise) {
          st.over = true; sync(); api.store.set("losses", 0);
          const seed = st.ratio ? ` The isotope lines stand at 1 : ${st.ratio}: evidence of deep‑earth seeding, in her own hand, at a bench nobody else touched.` : " The ratio was never read; what the well water says about its own origin stays in the cuvette.";
          api.end({ outcome: "win", text: `${pick.name}. Entry N5: hand, ok, with ${MASS - st.mass} of ${MASS} mass spent${st.rerun ? " on the re-run" : ""}.${seed}` }); return;
        }
        const why = pick !== st.sample ? `Not ${pick.name.toLowerCase()}: the sample was ${st.sample.name.toLowerCase()}.` : "Right composition, but no precise peak reading to stand on.";
        shake("." + P + "bench");
        if (st.rerun) { st.over = true; sync(); api.store.set("losses", losses + 1); api.end({ outcome: "lose", text: `${why} Entry N5 logged as error, unverified. Kade pours the last of the flask back into the dust; the well will have to be read some other way.` }); return; }
        note(`${why} Logged error. One re-run: Kade unstoppers a second flask. Fresh sample, the card restored.`, true);
        fresh(true); renderCands(); el.querySelector('[data-a="ratio"]').hidden = true; st.beats.ratio = 0;
      }
      sync();
    };
    el.querySelectorAll("[data-a]").forEach((b) => on(b, "click", () => act(b.dataset.a)));
    renderCands(); sync();

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="scr">
      <div class="ch">CH1 · BENCH SET-UP · CINDER REACH</div><h2>The Assay</h2>
      <p class="goal">Name the well sample: strike the card down to one, with one precise peak reading.</p>
      <dl><dt>vial</dt><dd>a reagent drops one named peak (1 mass)</dd><dt>drag</dt><dd>move the cursor (← → on the trace)</dd>
      <dt>filter</dt><dd>sharpens 100 nm round the cursor (1)</dd><dt>record</dt><dd>±2 nm inside the filter is precise</dd></dl></div>
      <div class="knobs"><i></i><i></i><span style="font:13px 'Courier Prime',monospace;color:#9fb8a6">Pulse and ratio unlock on the bench.</span>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle"> Kade’s bigger flask: 7 mass</label>` : ""}
      <button type="button" class="go">Load the cuvette</button></div></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const gb = intro.querySelector(".gentle"); if (gb && gb.checked) { MASS = 7; st.mass = 7; }
      intro.remove(); cv.focus(); sync();
      note("Book II, Cinder Reach. Kade carried this up from the Lowland well in a lead flask; the relay figure for N5 is on the Continuum's board, and you do not trust it.", "v");
      note("Five compositions on the card. Start with a vial.");
    });
    sb.focus();
    if (window.__ezTest) window.__ezTest[api.key] = { get st() { return st; }, CANDS, COMP };
    return { unmount() { cancelAnimationFrame(raf); ro.disconnect(); off.forEach((f) => f()); } };
  },
};

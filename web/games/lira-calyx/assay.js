// The Assay (1D, Oscilloscope trace). DESIGN.md section 11, cut to one bench modelled on
// b2-assay-2: five candidate compositions, a sample mass of 6. Tests spend mass: a reagent
// suppresses one named peak (1), a band filter isolates a 100 nm window at fine resolution (1), a
// pulse raises AFU in the cell and shifts the aetheric lattice peak (2). Measure with the cursor and
// vernier; a reading within ±2 nm is precise. Win: the right composition and one precise reading.
// A wrong conclusion allows one re-run with a fresh sample; a second wrong one loses.
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
      .${P}wrap button{font:700 12px 'Courier Prime',monospace;color:${GREEN};background:#1a1d1f;border:1.5px solid ${DIM};padding:8px 10px;cursor:pointer;border-radius:3px;min-height:40px}
      .${P}wrap button:hover:not(:disabled){border-color:${GREEN}}
      .${P}wrap button:disabled{opacity:.35;cursor:default}
      .${P}wrap button.amber{color:#ffcf6b;border-color:#8a6a2a}
      .${P}vial{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:74px;font-size:11px!important}
      .${P}vial i{display:block;width:16px;height:40px;border:1.5px solid #9aa;border-radius:0 0 8px 8px;border-top:4px solid #9aa}
      .${P}vial.used i{opacity:.3}
      .${P}vial.hint{outline:2px solid ${SEAL};outline-offset:2px;border-radius:50%}
      .${P}page{flex:1 1 300px;min-width:0;background:${PAPER};color:${INK};padding:16px 18px;border-radius:2px;box-shadow:4px 4px 0 rgba(0,0,0,.35);font-family:Georgia,serif}
      .${P}page h3{font:400 20px 'IM Fell English',Georgia,serif;margin:0 0 6px}
      .${P}cand{display:block;width:100%;text-align:left;background:transparent!important;color:${INK}!important;border:0!important;border-bottom:1px dotted rgba(59,38,24,.4)!important;font:14px Georgia,serif!important;padding:6px 2px!important;min-height:36px}
      .${P}cand b{font-family:'Courier Prime',monospace}
      .${P}cand small{display:block;font:12px 'Courier Prime',monospace;opacity:.8}
      .${P}cand.x{text-decoration:line-through;text-decoration-color:${SEAL};text-decoration-thickness:2px;opacity:.55}
      .${P}mass{display:flex;gap:6px;margin:6px 0 12px}.${P}mass i{width:14px;height:14px;border-radius:50%;border:1.5px solid ${INK}}.${P}mass i.f{background:${INK}}
      .${P}notes{font:italic 15px/1.45 'IM Fell English',Georgia,serif;min-height:120px;border-top:1px solid rgba(59,38,24,.3);padding-top:8px}
      .${P}notes p{margin:0 0 4px}.${P}notes .r{color:${SEAL}}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,12,12,.8);z-index:5;padding:16px}
      .${P}card{max-width:480px;background:${PANEL};border:1.5px solid ${GREEN};padding:18px 20px}
      .${P}card h2{font:400 26px/1.1 'IM Fell English',Georgia,serif;margin:0 0 8px;color:#f2f4f5}
      .${P}card p{margin:0 0 10px;font:14px/1.5 'Courier Prime',monospace}
    </style>
    <div class="${P}spread">
      <section class="${P}bench" aria-label="Bench">
        <div class="${P}scope"><canvas tabindex="0" aria-label="Spectrum. Drag or use arrow keys to move the cursor."></canvas></div>
        <div class="${P}row"><button type="button" data-a="filter">BAND FILTER AT CURSOR (1)</button><button type="button" data-a="clear">FULL BAND</button><button type="button" data-a="pulse">PULSE (2)</button>
          <span style="flex:1"></span><button type="button" data-a="record">RECORD</button><button type="button" class="amber" data-a="conclude">CONCLUDE</button></div>
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
      st = { sample: CANDS[Math.floor(rng() * CANDS.length)], mass: 6, used: new Set(), filter: null, pulse: false, cursor: 560, struck: new Set(),
        precise: false, readings: 0, wrongStrikes: 0, hint: null, rerun: !!rerun, failed: st ? st.failed : 0, over: false, noise: Array.from({ length: 401 }, () => rng() - 0.5) };
    };
    fresh(false);
    const notes = $("." + P + "notes");
    const note = (t, red) => { const p = document.createElement("p"); p.textContent = t; if (red) p.className = "r"; notes.appendChild(p); while (notes.children.length > 9) notes.firstChild.remove(); };

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
          sync();
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
      massEl.innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < st.mass ? "f" : ""}"></i>`).join("");
      massEl.setAttribute("aria-label", `${st.mass} of 6 mass left`);
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
      if (st.pulse) { g.fillStyle = "#b48cff"; g.fillText("AFU 0.74 PULSED", CW - pad.r - 130, top + 12); }
      // wavelength scale and vernier
      g.fillStyle = "#9fb8a6"; g.font = "10px 'Courier Prime',monospace"; g.textAlign = "center";
      for (let l = L0; l <= L1; l += 50) g.fillText(String(l), xOf(l), bot + 13);
      const vy = bot + 22;
      g.fillStyle = "#101512"; g.fillRect(pad.l, vy, CW - pad.l - pad.r, 34); g.strokeStyle = DIM; g.strokeRect(pad.l, vy, CW - pad.l - pad.r, 34);
      g.strokeStyle = "#9fb8a6";
      for (let l = L0; l <= L1; l += 5) { const x = xOf(l), h = l % 50 === 0 ? 12 : l % 10 === 0 ? 8 : 4; g.beginPath(); g.moveTo(x, vy); g.lineTo(x, vy + h); g.stroke(); }
      // vernier: 10 divisions spanning 9 main units (of 1 nm, magnified around the cursor)
      g.strokeStyle = "#ffcf6b"; const unit = (xOf(L0 + 10) - xOf(L0)) * 0.9;
      const base = xOf(st.cursor);
      for (let k = 0; k <= 10; k++) { const x = base + k * unit * 0.9 / 0.9 * 0.9; g.beginPath(); g.moveTo(x, vy + 34); g.lineTo(x, vy + (k % 5 ? 24 : 18)); g.stroke(); }
      g.fillStyle = "#ffcf6b"; g.fillText(`${Math.floor(st.cursor)} + 0.${Math.round((st.cursor % 1) * 10) % 10}`, Math.min(CW - 50, base + unit * 5), vy + 16);
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
      else if (e.key === "Enter") { act("record"); } else return;
      e.preventDefault(); drawScope();
    });

    // ---- actions
    const act = (a) => {
      if (st.over) return;
      if (a === "filter" && st.mass >= 1) { st.mass--; st.filter = Math.max(L0 + 50, Math.min(L1 - 50, Math.round(st.cursor))); note(`Band filter ${st.filter - 50}–${st.filter + 50} nm: the peaks there sharpen.`); }
      if (a === "clear") { st.filter = null; }
      if (a === "pulse" && st.mass >= 2 && !st.pulse) { st.mass -= 2; st.pulse = true; const has = st.sample.parts.includes("lattice"); note(`Pulse: AFU up. ${has ? "A peak walks from 512 to 530. Lattice." : "Nothing walks. No lattice."}`); }
      if (a === "record") {
        st.readings++;
        const fine = st.filter != null && Math.abs(st.cursor - st.filter) <= 50;
        const vis = peaks().filter((p) => p.a > 0.3);
        const near = vis.sort((x, y) => Math.abs(x.nm - st.cursor) - Math.abs(y.nm - st.cursor))[0];
        const dist = near ? Math.abs(near.nm - st.cursor) : 99;
        if (fine && dist <= 2) { st.precise = true; note(`Read ${st.cursor.toFixed(1)} nm, peak. Precise.`); }
        else if (fine) note(`Read ${st.cursor.toFixed(1)} nm: ${dist < 12 ? "beside the peak, not on it." : "no peak here."}`);
        else note(`Read ${st.cursor.toFixed(1)} nm, coarse. The full band is too wide to call it.`);
      }
      if (a === "conclude") {
        const left = CANDS.filter((c) => !st.struck.has(c.id));
        if (left.length !== 1) { note(`Strike candidates until one remains (${left.length} left).`, true); return; }
        const pick = left[0];
        if (pick === st.sample && st.precise) { st.over = true; sync(); api.end({ outcome: "win", text: `${pick.name}. Entry N5: hand, ok, with ${6 - st.mass} of 6 mass spent${st.rerun ? " on the re-run" : ""}.` }); return; }
        const why = pick !== st.sample ? `Not ${pick.name.toLowerCase()}: the sample was ${st.sample.name.toLowerCase()}.` : "Right composition, but no precise peak reading to stand on.";
        if (st.rerun) { st.over = true; sync(); api.end({ outcome: "lose", text: `${why} Entry N5 logged as error, unverified.` }); return; }
        note(`${why} Logged error. One re-run, fresh sample.`, true);
        fresh(true); renderCands();
      }
      sync();
    };
    el.querySelectorAll("[data-a]").forEach((b) => on(b, "click", () => act(b.dataset.a)));
    renderCands(); sync();
    note("A well sample from N5. Five compositions on the card.");

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The Assay</h2>
      <p>Identify the sample by elimination: strike candidates on the card until one remains, then Conclude. Tests spend mass: a reagent suppresses one named peak (1), the band filter sharpens 100 nm around the cursor (1), a pulse walks the lattice peak (2).</p>
      <p>Drag the cursor onto a peak and Record. Only a reading inside the filter, within ±2 nm, is precise, and you need one.</p>
      <button type="button">Load the cuvette</button></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button"); sb.style.cssText = `background:${GREEN};color:#071a0e;border:0;padding:10px 20px`;
    on(sb, "click", () => { intro.remove(); cv.focus(); });
    sb.focus();
    return { unmount() { cancelAnimationFrame(raf); ro.disconnect(); off.forEach((f) => f()); } };
  },
};

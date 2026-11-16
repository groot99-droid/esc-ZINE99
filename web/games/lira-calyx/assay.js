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
// Drawn with the game's art (api.art): the six reagent vials on the rack, the cuvette and the
// standard on the bench, the scope on the how-to card, dial faces on the filter and pulse controls.
// Phase 2 (DEEP_DIVE section 3): three stages. Teach (Book I, the bark baseline): eliminate with
// reagents, with room to fail. Test (Book II, the well): the composition and a ratio from two precise
// peaks; the standard and the blank run arrive and find nothing wrong. Twist (Book IV, the fragment):
// the bench reads 4 nm high (the standard shows it), iron oxide was left in the cell (the blank shows
// it), and one line of the Continuum's reference card is false; the card is doubted line by line.
// Set-piece: the pulse makes the scope draw Pattern α. Layer link 2: cores drilled on the climb
// (Cross-section climb, test) add true lines in her own hand to this card.
import { runStages } from "./_stages.js";
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
const C4 = [CANDS[0], CANDS[2], { id: "D", name: "Storm-rock salt", parts: ["protein", "salt", "oxide"] }, CANDS[4]];
const C2 = [
  { id: "A", name: "Dormant bark", parts: ["silicate", "resin", "glass"] },
  { id: "B", name: "Aetheric lattice, clean", parts: ["silicate", "lattice", "salt"] },
  { id: "C", name: "Fungal resin", parts: ["silicate", "protein", "salt"] },
  { id: "D", name: "Lattice in iron slag", parts: ["silicate", "lattice", "salt", "oxide"] },
];
const STG = [
  { cands: C4, sample: "A", mass: 5, reruns: 2, cuv: "CUVETTE: TERRACE BARK", card: "Reference card: terrace bark", entry: "the bark baseline", shift: 0 },
  { cands: CANDS, sample: null, mass: 6, reruns: 1, cuv: "CUVETTE: WELL N5", card: "Reference card: well sample, N5", entry: "N5", shift: 0 },
  { cands: C2, sample: "B", mass: 7, reruns: 1, cuv: "CUVETTE: THE FRAGMENT", card: "Reference card, Continuum edition", entry: "the fragment", shift: 4, dirt: "oxide", falseLine: ["salt", 596] },
];
const CORE_LINES = [["salt", "core, 3 950 m: storm-rock salt 606. By hand."], ["lattice", "core, 4 300 m: lattice 512, walks to 530 under a pulse. By hand."]];

function mountStage(root, api, stage) {
  {
    const off = [], timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const S = STG[stage], CANDS = S.cands;
    const cores = stage >= 1 ? Math.max(0, Math.min(2, api.shared.get("cores", 0) | 0)) : 0;
    let raf = 0;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const A = api.art || { has: () => false, url: () => "" };
    const pic = (id, cls = "", alt = "") => (A.has(id) ? `<img class="${cls}" src="${A.url(id)}" alt="${alt}" draggable="false">` : "");
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
      .${P}card .sc{display:block;width:100%;height:110px;object-fit:cover;object-position:50% 38%;border-radius:8px 8px 0 0;margin-bottom:-4px}
      .${P}vial img{display:block;height:84px;width:auto;border-radius:3px}.${P}vial.used img{opacity:.35;filter:grayscale(.6)}
      .${P}vial.drop img{animation:${P}tilt .6s}
      .${P}vial.art{padding:4px 6px 6px!important;min-width:62px}
      .${P}wrap button.di img{height:24px;width:24px;border-radius:50%;vertical-align:middle;margin:-4px 6px -2px -2px}
      .${P}bits{display:flex;gap:8px;align-items:flex-end;margin-left:auto}.${P}bits img{height:84px;width:auto;border-radius:3px;border:1px solid #3a3e41}
      .${P}page h3 img{height:26px;width:auto;vertical-align:middle;margin-right:8px}
      .${P}std{float:right;width:74px;height:auto;margin:0 0 6px 10px;border:1px solid rgba(59,38,24,.5);border-radius:2px}
      .${P}lines{margin:0 0 8px}
      .${P}lines button{display:flex;gap:8px;justify-content:space-between;width:100%;text-align:left;background:transparent!important;color:${INK}!important;border:0!important;border-bottom:1px solid rgba(59,38,24,.25)!important;font:13px 'Courier Prime',monospace!important;padding:4px 2px!important;min-height:32px!important;border-radius:0!important}
      .${P}lines button:hover{background:rgba(59,38,24,.07)!important}
      .${P}lines button.q{color:${SEAL}!important;text-decoration:line-through;text-decoration-thickness:1.5px}
      .${P}lines button.q::after{content:"doubted";text-decoration:none;display:inline-block;font-style:italic}
      .${P}lines p{margin:3px 0;font:italic 15px/1.3 'IM Fell English',Georgia,serif;color:#2f4c86;border-left:3px solid #2f4c86;padding-left:8px}
      .${P}lines .cap{font:700 11px 'Courier Prime',monospace;letter-spacing:.1em;opacity:.7;margin:0 0 2px}
      @media (max-width:640px){.${P}vial img{height:62px}.${P}bits img{height:62px}.${P}vial.art{min-width:0;flex:1 1 30%}}
    </style>
    <div class="${P}spread">
      <section class="${P}bench" aria-label="Bench">
        <div class="${P}lab"><span>CH1 · SPECTRUM 400–800 nm</span><span class="${P}cuv">${S.cuv}</span></div>
        <div class="${P}scope"><canvas tabindex="0" aria-label="Spectrum. Drag or use arrow keys to move the cursor; Enter records."></canvas></div>
        <div class="${P}row"><button type="button" class="di" data-a="filter" title="F">${pic("dial-sampling")}BAND FILTER (1)</button><button type="button" data-a="clear">FULL BAND</button><button type="button" class="di" data-a="pulse" title="P">${pic("dial-afu")}PULSE (2)</button>
          <button type="button" data-a="standard" title="S" ${stage ? "" : "hidden"}>STANDARD (1)</button><button type="button" data-a="blank" title="B" ${stage ? "" : "hidden"}>BLANK RUN (1)</button>
          <button type="button" class="ratio" data-a="ratio" hidden>RATIO</button>
          <span style="flex:1"></span><button type="button" data-a="record" title="Enter">RECORD</button><button type="button" class="amber" data-a="conclude">CONCLUDE</button></div>
        <div class="${P}row ${P}rack" aria-label="Reagent rack"></div>
      </section>
      <section class="${P}page" aria-label="Reference card and notes">
        <h3>${S.card}</h3>
        <div class="${P}lines"></div>
        <div class="${P}cands"></div>
        <h3 style="margin-top:12px">Sample mass</h3><div class="${P}mass"></div>
        <h3>${pic("tab-hypotheses")}Notes</h3><div class="${P}notes" aria-live="polite"></div>
      </section>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const cv = $("canvas"), g = cv.getContext("2d");
    const rng = api.rng();

    let st;
    const fresh = (rerun) => {
      st = { sample: S.sample ? CANDS.find((c) => c.id === S.sample) : CANDS[Math.floor(rng() * CANDS.length)], std: st ? st.std : false, blank: st ? st.blank : false, doubt: st ? st.doubt : null, alpha: 0, reruns: st ? st.reruns : 0, mass: MASS, used: new Set(), filter: null, pulse: false, cursor: 560, struck: new Set(),
        precise: false, readings: 0, wrongStrikes: 0, hint: null, rerun: !!rerun, failed: st ? st.failed : 0, over: false, noise: Array.from({ length: 401 }, () => rng() - 0.5),
        flags: [], precisePeaks: new Set(), ratio: null, beats: st ? st.beats : {}, pop: null };
    };
    const losses = api.store.get("losses", 0);
    let MASS = S.mass;
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
        b.innerHTML = `<b>${c.id}</b> ${c.name}<small>${c.parts.map((p) => (stage === 2 ? COMP[p].label : `${COMP[p].label} ${COMP[p].nm}${COMP[p].pulse ? "→" + COMP[p].pulse : ""}`)).join(" · ")}</small>`;
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
    // the card's lines (twist: the Continuum's edition, one of them false) and the core lines in her hand
    const linesEl = $("." + P + "lines");
    const cardNm = (c) => (S.falseLine && S.falseLine[0] === c ? S.falseLine[1] : COMP[c].nm);
    const renderLines = () => {
      let h = "";
      if (stage === 2) {
        h += `<p class="cap" style="border:0;padding:0;color:${INK};font-style:normal">PRINTED LINES · tap one to doubt it</p>`;
        h += Object.keys(COMP).map((c) => `<button type="button" data-ln="${c}" class="${st.doubt === c ? "q" : ""}" aria-pressed="${st.doubt === c}"><span>${COMP[c].label}</span><span>${cardNm(c)}${COMP[c].pulse ? " → " + COMP[c].pulse : ""} nm</span></button>`).join("");
      }
      if (cores) h += CORE_LINES.slice(0, cores).map(([, t]) => `<p>${t}</p>`).join("");
      linesEl.innerHTML = h;
      linesEl.querySelectorAll("[data-ln]").forEach((b) => on(b, "click", () => { if (st.over) return; st.doubt = st.doubt === b.dataset.ln ? null : b.dataset.ln; renderLines(); if (st.doubt) note(`A pencil line through “${COMP[st.doubt].label} ${cardNm(st.doubt)}” on the printed card. If the card is wrong there, say so when you conclude.`, "v"); }));
    };
    const rack = $("." + P + "rack");
    const renderRack = () => {
      rack.innerHTML = "";
      REAGENTS.forEach(([name, comp], i) => {
        const b = document.createElement("button"); b.type = "button";
        b.className = P + "vial" + (st.used.has(comp) ? " used" : "") + (st.hint === comp ? " hint" : "");
        const va = pic(`assay-vial-r${i + 1}`);
        if (va) b.classList.add("art");
        b.innerHTML = `${va || `<i style="background:${COMP[comp].vial}"></i>`}${name.split(" ").slice(0, 2).join(" ")}`;
        b.title = `${name}: suppresses the ${COMP[comp].label} peak at ${COMP[comp].nm} nm (cost 1)`;
        b.setAttribute("aria-label", b.title);
        b.disabled = st.used.has(comp) || st.mass < 1 || st.over;
        on(b, "click", () => {
          if (st.mass < 1 || st.used.has(comp)) return;
          st.mass--; st.used.add(comp); if (st.hint === comp) st.hint = null;
          const present = st.sample.parts.includes(comp) || S.dirt === comp;
          note(`${name}: ${present ? `the ${COMP[comp].nm + S.shift} peak drops. ${COMP[comp].label} is ${S.dirt === comp ? "in the cell" : "present"}.` : "nothing changes."}`);
          pop(present ? `▼ ${COMP[comp].nm + S.shift} nm suppressed` : "no change", present ? "#ffcf6b" : "#9fb8a6");
          if (!st.beats.r1) { st.beats.r1 = 1; note("Strike every card the result rules out. A drop proves a compound is there; no change proves it is not.", "v"); }
          sync(); const vb = rack.children[i]; if (vb && !api.reducedMotion) vb.classList.add("drop");
        });
        rack.appendChild(b);
      });
      const bits = pic("assay-standard", "", "The standard: Book I bark, 452 nm") + pic("assay-cuvette", "", "The cuvette");
      if (bits) rack.insertAdjacentHTML("beforeend", `<span class="${P}bits">${bits}</span>`);
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
      el.querySelector('[data-a="standard"]').disabled = st.mass < 1 || st.std || st.over;
      el.querySelector('[data-a="blank"]').disabled = st.mass < 1 || st.blank || st.over;
      renderRack(); drawScope();
    };

    // ---- the spectrum
    const peaks = () => st.sample.parts.concat(S.dirt && !st.sample.parts.includes(S.dirt) ? [S.dirt] : []).map((p) => ({ comp: p, dirt: p === S.dirt && !st.sample.parts.includes(p),
      nm: (st.pulse && COMP[p].pulse ? COMP[p].pulse : COMP[p].nm) + S.shift, a: st.used.has(p) ? 0.07 : (0.8 + (p.length % 3) * 0.08) * (p === S.dirt && !st.sample.parts.includes(p) ? (st.blank ? 0.32 : 0.7) : 1) }));
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
      const txt = `λ ${st.cursor.toFixed(1)} nm${st.std && S.shift ? ` (true ${(st.cursor - S.shift).toFixed(1)})` : ""}  ${fine ? "± 2 FINE" : "± 8 COARSE"}`;
      g.font = "13px 'Courier Prime',monospace"; const tw = g.measureText(txt).width + 14;
      const bx = Math.min(CW - pad.r - tw, Math.max(pad.l, cx + 8));
      g.fillStyle = "rgba(7,26,14,.9)"; g.fillRect(bx, top + 18, tw, 22); g.strokeStyle = GREEN; g.strokeRect(bx, top + 18, tw, 22);
      g.fillStyle = GREEN; g.fillText(txt, bx + 7, top + 34);
      if (st.pulse) { g.fillStyle = "#b48cff"; g.font = "13px 'Courier Prime',monospace"; g.fillText("AFU 0.74 PULSED", CW - pad.r - 140, top + 14); }
      if (st.blank && S.dirt) { g.fillStyle = "#9fb8a6"; g.font = "12px 'Courier Prime',monospace"; g.textAlign = "center"; g.fillText("on the bench", xOf(COMP[S.dirt].nm + S.shift), bot - ph * 0.36); g.textAlign = "left"; }
      // the set-piece: under the pulse the scope draws Pattern α, three arrivals of one travelling wave
      if (st.alpha) {
        const age = (performance.now() - st.alpha) / 1000, k = api.reducedMotion ? 1 : Math.min(1, age / 2.2);
        g.save(); g.strokeStyle = "#b48cff"; g.lineWidth = 1.6; g.globalAlpha = age > 6 ? Math.max(0.35, 1 - (age - 6) / 3) : 1;
        for (let r = 0; r < 3; r++) { const y0 = top + ph * (0.2 + r * 0.2); g.beginPath();
          for (let x = pad.l; x <= pad.l + (CW - pad.l - pad.r) * k; x += 2) { const u = (x - pad.l) / (CW - pad.l - pad.r), env = Math.exp(-(((u - 0.22 - r * 0.26) / 0.09) ** 2)); const y = y0 - env * ph * 0.13 * Math.cos((u - 0.22 - r * 0.26) * 70); x === pad.l ? g.moveTo(x, y) : g.lineTo(x, y); }
          g.stroke(); }
        g.fillStyle = "#b48cff"; g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.fillText("Pattern α", pad.l + 8, top + ph * 0.12);
        g.restore();
        if (!api.reducedMotion && age < 9) { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawScope); }
      }
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
      else if (e.key === "Enter") { act("record"); } else if (e.key === "f" || e.key === "F") act("filter"); else if (e.key === "p" || e.key === "P") act("pulse");
      else if (stage && (e.key === "s" || e.key === "S")) act("standard"); else if (stage && (e.key === "b" || e.key === "B")) act("blank"); else return;
      e.preventDefault(); drawScope();
    });

    // ---- actions
    const act = (a) => {
      if (st.over) return;
      if (a === "filter" && st.mass >= 1) { st.mass--; st.filter = Math.max(L0 + 50, Math.min(L1 - 50, Math.round(st.cursor))); note(`Band filter ${st.filter - 50}–${st.filter + 50} nm: the peaks there sharpen.`); pop("FILTER IN: ±2 nm FINE", GREEN); }
      if (a === "clear") { st.filter = null; }
      if (a === "pulse" && st.mass >= 2 && !st.pulse) { st.mass -= 2; st.pulse = true; const has = st.sample.parts.includes("lattice"); note(`Pulse: AFU up. ${has ? `A peak walks from ${512 + S.shift} to ${530 + S.shift}. Lattice.` : "Nothing walks. No lattice."}`); pop(has ? `${512 + S.shift} → ${530 + S.shift} nm` : "nothing walks", "#b48cff");
        if (stage === 2 && has) { st.alpha = performance.now(); api.shared.set("ringdown", true); later(() => { if (!st.over) note("The trace does not settle. It rings down in three arrivals, evenly spaced, and the scope has drawn the sketch from the third night before you can: Pattern α. The journal falls open at that page by itself.", "v"); }, api.reducedMotion ? 300 : 2400); } }
      if (a === "standard" && st.mass >= 1 && !st.std) { st.mass--; st.std = true;
        note(S.shift ? `Standard: your own Book I bark, in the cell. Its 452 line reads ${452 + S.shift}. Everything on this bench sits ${S.shift} nm high; the cursor now shows the true figure beside the read one.` : "Standard: your own Book I bark, in the cell. Its line reads 452.0. This bench is true.", S.shift ? "v" : undefined);
        pop(S.shift ? `STANDARD 452 READS ${452 + S.shift}` : "STANDARD 452.0: TRUE", "#ffcf6b"); }
      if (a === "blank" && st.mass >= 1 && !st.blank) { st.mass--; st.blank = true;
        note(S.dirt ? `Blank run, an empty cell: a peak at ${COMP[S.dirt].nm + S.shift} all the same. ${COMP[S.dirt].label[0].toUpperCase() + COMP[S.dirt].label.slice(1)}, left on the bench before you sat down. It is not in the sample.` : "Blank run, an empty cell: a flat line. Nothing on this bench but the bench.", S.dirt ? "v" : undefined);
        pop(S.dirt ? `BLANK: ${COMP[S.dirt].nm + S.shift} nm IS THE BENCH` : "BLANK: FLAT", "#ffcf6b"); }
      if (a === "ratio" && st.precisePeaks.size >= 2 && !st.ratio) {
        const [p1, p2] = [...st.precisePeaks].map((c) => COMP[c]);
        st.ratio = (0.58 + rng() * 0.08).toFixed(2);
        note(`Ratio of the ${p1.nm} and ${p2.nm} lines: 1 : ${st.ratio}. Well water from the Lowlands runs close to 1 : 1. Something was put down this well.`, "v");
        pop(`1 : ${st.ratio}`, "#b48cff");
      }
      if (a === "record") {
        st.readings++;
        const fine = st.filter != null && Math.abs(st.cursor - st.filter) <= 50;
        const vis = peaks().filter((p) => p.a > 0.2);
        const near = vis.sort((x, y) => Math.abs(x.nm - st.cursor) - Math.abs(y.nm - st.cursor))[0];
        const dist = near ? Math.abs(near.nm - st.cursor) : 99;
        const ok = fine && dist <= 2;
        st.flags.push({ l: st.cursor, ok }); if (st.flags.length > 8) st.flags.shift();
        if (ok) {
          st.precise = true; st.precisePeaks.add(near.comp); pop("PRECISE ±2", "#ffcf6b");
          const tru = st.cursor - (st.std ? S.shift : 0), printed = cardNm(near.comp === "lattice" && st.pulse ? "lattice" : near.comp), want = near.comp === "lattice" && st.pulse ? COMP.lattice.pulse : printed;
          note(`Read ${st.cursor.toFixed(1)} nm, peak. Precise.${stage === 2 ? ` ${st.std ? `True ${tru.toFixed(1)}. ` : ""}The printed card has ${COMP[near.comp].label} at ${want}${Math.abs(tru - want) > 2.5 ? (st.std ? ": the card is wrong, not the bench." : ": off. The bench, or the card?") : ": it agrees."}` : ""}`, stage === 2 && st.std && Math.abs(tru - want) > 2.5 ? "v" : undefined);
          if (stage === 1 && !st.beats.ratio) { st.beats.ratio = 1; el.querySelector('[data-a="ratio"]').hidden = false; note("Now the ratio: a second precise peak, then RATIO compares their heights. Isotopes keep their proportions unless someone changes them.", "v"); }
        }
        else if (fine) { note(`Read ${st.cursor.toFixed(1)} nm: ${dist < 12 ? "beside the peak, not on it." : "no peak here."}`); pop(dist < 12 ? "BESIDE THE PEAK" : "NO PEAK", "#9fb8a6"); }
        else { note(`Read ${st.cursor.toFixed(1)} nm, coarse. The full band is too wide to call it.`); pop("COARSE ±8: FILTER FIRST", "#9fb8a6"); }
      }
      if (a === "conclude") {
        const left = CANDS.filter((c) => !st.struck.has(c.id));
        if (left.length !== 1) { note(`Strike candidates until one remains (${left.length} left).`, true); shake("." + P + "page"); return; }
        const pick = left[0];
        if (pick === st.sample && stage === 0) {
          st.over = true; sync(); api.store.set("losses", 0);
          api.end({ outcome: "win", text: `${pick.name}. The baseline for crystalline bark goes into Book I in her own ink, with ${MASS - st.mass} of ${MASS} mass spent${st.rerun ? " after a re-run" : ""}: a 452 line she will carry to every bench after this one, as a standard.` }); return;
        }
        if (pick === st.sample && stage === 2) {
          st.over = true; sync(); api.store.set("losses", 0);
          const right = st.doubt === S.falseLine[0];
          const tail = right ? ` And one printed line is struck through in pencil: storm-rock salt is at 606, not 596. The Continuum's card was set wrong on purpose, for anyone who read a card before a peak.${cores ? " Your own core said so before the scope did." : ""}` : st.doubt ? ` But the line you doubted on the printed card was a true one; the false one is still there for the next reader.` : " The printed card goes back in its sleeve undoubted, one false line and all.";
          const ring = st.alpha ? " Pulsed, the fragment rang down in the shape of Pattern α. The thing in the valley and the thing in the cell keep the same time." : "";
          api.end({ outcome: right ? "win" : "done", text: `${pick.name}: no iron in it, whatever the bench said. Entry: hand, ok, ${MASS - st.mass} of ${MASS} mass.${tail}${ring}` }); return;
        }
        if (pick === st.sample && st.precise) {
          st.over = true; sync(); api.store.set("losses", 0);
          const seed = st.ratio ? ` The isotope lines stand at 1 : ${st.ratio}: evidence of deep‑earth seeding, in her own hand, at a bench nobody else touched.` : " The ratio was never read; what the well water says about its own origin stays in the cuvette.";
          api.end({ outcome: st.ratio ? "win" : "done", text: `${pick.name}. Entry N5: hand, ok, with ${MASS - st.mass} of ${MASS} mass spent${st.rerun ? " on the re-run" : ""}.${seed}` }); return;
        }
        const why = pick !== st.sample ? `Not ${pick.name.toLowerCase()}: the sample was ${st.sample.name.toLowerCase()}.${stage === 2 && pick.parts.includes("oxide") ? " The iron was on the bench, not in the fragment." : ""}` : "Right composition, but no precise peak reading to stand on.";
        shake("." + P + "bench");
        st.reruns++;
        if (st.reruns > S.reruns) { st.over = true; sync(); api.store.set("losses", losses + 1); api.end({ outcome: "lose", text: `${why} Entry for ${S.entry} logged as error, unverified. ${stage === 1 ? "Kade pours the last of the flask back into the dust; the well will have to be read some other way." : stage === 0 ? "The bark goes back in its jar; the baseline will have to wait for another morning." : "There is no more of the fragment to spend."}` }); return; }
        note(`${why} Logged error. ${S.reruns - st.reruns + 1 > 1 ? "A re-run" : "One re-run"}: a fresh sample, the card restored.`, true);
        fresh(true); renderCands(); renderLines(); el.querySelector('[data-a="ratio"]').hidden = true; st.beats.ratio = 0;
      }
      sync();
    };
    el.querySelectorAll("[data-a]").forEach((b) => on(b, "click", () => act(b.dataset.a)));
    renderCands(); renderLines(); sync();

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play">${pic("assay-scope", "sc")}<div class="scr">
      <div class="ch">CH1 · BENCH SET-UP · ${["HOLLIN TERRACE", "CINDER REACH", "HOLLIN, BOOK IV"][stage]}</div><h2>${["The Assay: the bark", "The Assay: the well", "The Assay: the fragment"][stage]}</h2>
      <p class="goal">${["Name the terrace bark: strike the card down to one. A wrong call costs a re-run, nothing more.", "Name the well sample with one precise peak, then read the ratio of two.", "Name the fragment. This bench and this card are the Continuum’s. Check both before you trust either."][stage]}</p>
      <dl><dt>vial</dt><dd>a reagent drops one named peak (1 mass)</dd><dt>drag</dt><dd>move the cursor (← → on the trace)</dd>
      <dt>filter</dt><dd>sharpens 100 nm round the cursor (1)</dd><dt>record</dt><dd>±2 nm inside the filter is precise</dd>
      ${stage ? `<dt>standard</dt><dd>your Book I bark: does 452 read 452? (1)</dd><dt>blank</dt><dd>an empty cell: what was here before you (1)</dd>` : ""}
      ${stage === 2 ? `<dt>card</dt><dd>tap a printed line to doubt it</dd>` : ""}</dl></div>
      <div class="knobs"><i></i><i></i><span style="font:13px 'Courier Prime',monospace;color:#9fb8a6">${stage === 0 ? "Strike a card by tapping it." : "Pulse and ratio unlock on the bench."}</span>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle"> Kade’s bigger flask: one more mass</label>` : ""}
      <button type="button" class="go">Load the cuvette</button></div></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const gb = intro.querySelector(".gentle"); if (gb && gb.checked) { MASS = S.mass + 1; st.mass = MASS; }
      intro.remove(); cv.focus(); sync();
      note(["Book I, Hollin Terrace. A sliver of crystalline bark from the terrace edge, and four things it might be. Pell holds the lamp.", "Book II, Cinder Reach. Kade carried this up from the Lowland well in a lead flask; the relay figure for N5 is on the Continuum's board, and you do not trust it.", "Book IV. The fragment, at a borrowed bench, with the Continuum's printed card beside it. Margin note 7 is still in your head: measure what you were given."][stage], "v");
      note(`${["Four", "Five", "Four"][stage]} compositions on the card. Start with a vial${stage === 2 ? ", or with the standard" : ""}.`);
      if (cores) api.linkNote(`Because you drilled ${cores === 1 ? "a core" : "two cores"} on the climb (Cross-section climb), ${cores === 1 ? "one true line" : "two true lines"} in your own hand ${cores === 1 ? "sits" : "sit"} on this reference card.`);
    });
    sb.focus();
    if (window.__ezTest) window.__ezTest[api.key] = { get st() { return st; }, CANDS, COMP, stage };
    return { unmount() { cancelAnimationFrame(raf); ro.disconnect(); off.forEach((f) => f()); timers.forEach(clearTimeout); } };
  }
}

export default {
  mount(root, api) {
    return runStages(root, api, { names: ["The bark", "The well", "The fragment"], colors: { bg: "#111314", fg: "#7dff9a", accent: "#ffcf6b", paper: PAPER, ink: INK }, mount: mountStage });
  },
};

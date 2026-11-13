// Behind the Peephole / Night Patience (1D, solitaire). Style: art deco playing cards, gold on
// green baize, one card from another deck. The deal is `n3_patience` from
// games/behind-the-peephole/data/deals.json (3 passes, proven winnable), with slipped cards 3 and 4
// (DESIGN.md section 11). The clock runs at 10x and is only shown; it ends nothing.

const DEAL = {
  columns: [["8S"], ["3C", "AS"], ["JD", "7H", "QC"], ["KH", "JS", "TD", "4D"], ["7S", "AH", "6D", "KS", "QS"], ["JH", "TH", "4H", "KC", "5C", "3D"]],
  stock: ["8H", "9D", "9C", "4C", "6C", "QH", "5S", "9H", "7C", "6H", "2S", "JC", "3S", "TC", "3H", "4S", "7D", "2D", "6S", "AC", "QD", "2C", "8C", "5D", "5H", "9S", "TS", "2H", "AD", "KD", "8D"],
  passes: 3,
  slipA: { no: 3, text: "Past 404 the boards talk. Walk them.", at: 8 },
  slipB: { no: 4, text: "The chute doesn't go to a manager." },
};
const RANKS = "A23456789TJQK";
const SUITS = { S: "♠", H: "♥", D: "♦", C: "♣" };
const rank = (c) => RANKS.indexOf(c[0]) + 1;
const red = (c) => c[1] === "H" || c[1] === "D";
const label = (c) => (c[0] === "T" ? "10" : c[0]) + SUITS[c[1]];

const FAN = (col) => `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'><g fill='none' stroke='${col}' stroke-width='1.3'>` +
  [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI * (0.12 + i * 0.127); return `<line x1='30' y1='38' x2='${(30 - 26 * Math.cos(a)).toFixed(1)}' y2='${(38 - 26 * Math.sin(a)).toFixed(1)}'/>`; }).join("") +
  `<path d='M8 38 A22 22 0 0 1 52 38'/><path d='M15 38 A15 15 0 0 1 45 38'/><path d='M22 38 h16 v-4 h-4 v-4 h-8 v4 h-4z'/></g></svg>`)}")`;
const SUN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 70'><rect x='4' y='4' width='42' height='62' fill='none' stroke='#b8913f' stroke-width='1.2'/>` +
  `<rect x='8' y='8' width='34' height='54' fill='none' stroke='#b8913f' stroke-width='.6'/><g stroke='#e3c47a' stroke-width='.8'>` +
  Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i / 12); return `<line x1='25' y1='52' x2='${(25 - 15 * Math.cos(a)).toFixed(1)}' y2='${(52 - 15 * Math.sin(a)).toFixed(1)}'/>`; }).join("") +
  `</g><path d='M15 52 h20 v-3 h-3 v-3 h-14 v3 h-3z M18 22 h14 l-7 -8z' fill='#b8913f'/></svg>`)}")`;

export default {
  mount(root, api) {
    const P = "behind-the-peephole-night-patience-";
    const st = document.createElement("style");
    st.textContent = `
    .${P}felt{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#2f5a40,#1f3d2c 55%,#13271c);font-family:'Cormorant Garamond',Georgia,serif;color:#e3c47a;user-select:none;touch-action:manipulation}
    .${P}felt::before{content:"";position:absolute;inset:8px;border:1px solid rgba(184,145,63,.5);outline:1px solid rgba(184,145,63,.25);outline-offset:4px;pointer-events:none}
    .${P}card{position:absolute;border-radius:6px;box-sizing:border-box;cursor:pointer;transition:left .16s,top .16s}
    .${P}face{background:#f4ecd6;border:1.5px solid #b8913f;box-shadow:inset 0 0 0 3px #f4ecd6,inset 0 0 0 4px rgba(184,145,63,.6),0 2px 3px #0006;color:#1c1a17}
    .${P}face.r{color:#a3302a}
    .${P}face .c{position:absolute;left:7%;top:4%;font-weight:700;line-height:.9;font-size:var(--fs)}
    .${P}face .m{position:absolute;left:15%;right:15%;top:30%;height:34%;background-repeat:no-repeat;background-position:center;background-size:contain}
    .${P}face .s{position:absolute;right:0;left:0;bottom:8%;text-align:center;font-size:calc(var(--fs)*1.5)}
    .${P}back{background:#1f3d2c ${SUN} center/88% 92% no-repeat;border:1.5px solid #b8913f;box-shadow:0 2px 3px #0006}
    .${P}slot{position:absolute;border:1.5px dashed rgba(184,145,63,.55);border-radius:6px;box-sizing:border-box;display:grid;place-items:center;font-size:calc(var(--fs)*1.4);color:rgba(227,196,122,.55)}
    .${P}sel{outline:3px solid #f6cf86;outline-offset:1px}
    .${P}pulse{animation:${P}p 1s ease-in-out infinite}
    @keyframes ${P}p{50%{outline:3px solid #f6cf86;outline-offset:3px}}
    .${P}plate{position:absolute;background:#b8913f;color:#1c1a17;font:600 11px 'IBM Plex Mono',monospace;text-align:center;border-radius:2px;padding:1px 0}
    .${P}hud{position:absolute;font:12px 'IBM Plex Mono',monospace;letter-spacing:.12em;color:#e3c47a;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .${P}btn{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:#e3c47a;background:rgba(19,39,28,.8);border:1px solid #b8913f;padding:7px 10px;cursor:pointer;min-height:36px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#2f5a40}
    .${P}btn[disabled]{opacity:.4}
    .${P}slip{overflow:hidden;background:#fbfbf7;border:1.5px solid #6b3a2a;color:#2a1a10;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:calc(var(--fs)*.5);line-height:1.1;padding:7%;transform:rotate(4deg);display:flex;align-items:center;text-align:center}
    .${P}big{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,20,14,.7);z-index:10}
    .${P}big div{width:min(300px,70vw);aspect-ratio:5/7;background:#fbfbf7;border:2px solid #6b3a2a;border-radius:10px;box-shadow:0 10px 40px #000;display:grid;place-items:center;padding:28px;box-sizing:border-box;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;color:#2a1a10;font-size:clamp(20px,4vw,26px);text-align:center;transform:rotate(-3deg)}
    .${P}big small{display:block;font:12px 'IBM Plex Mono',monospace;color:#6b3a2a;margin-top:14px}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;z-index:12;background:rgba(10,20,14,.82);padding:16px}
    .${P}intro div{max-width:500px;border:1px solid #b8913f;background:#13271c;padding:20px 22px;font:14px/1.55 'IBM Plex Mono',monospace;color:#efe6cf}
    .${P}intro h2{font-family:'Cormorant Garamond',Georgia,serif;color:#f6cf86;font-size:30px;margin:0 0 8px}
    .${P}clock{position:absolute;font:600 13px 'IBM Plex Mono',monospace;color:#e3c47a;letter-spacing:.14em}
    `;
    root.appendChild(st);
    const felt = document.createElement("div");
    felt.className = P + "felt";
    root.appendChild(felt);

    // ---- state
    const cols = DEAL.columns.map((c) => c.map((card, i) => ({ c: card, up: i === c.length - 1 })));
    let stock = DEAL.stock.slice(), waste = [], found = { S: [], H: [], D: [], C: [] }, spike = [];
    let pass = 1, turnsThisPass = 0, peeked = false, peekShow = false, hints = 3, sel = null, over = false;
    let slipAShown = false, slipBShown = false, modal = null, pulse = null, lastAct = performance.now();
    let moves = 0;
    const t0 = performance.now();
    const timers = [], listeners = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    // ---- rules
    const fits = (card, dst) => dst.length === 0 ? rank(card) === 13 : (() => { const t = dst[dst.length - 1]; return t.up && rank(t.c) === rank(card) + 1 && red(t.c) !== red(card); })();
    const toFound = (card) => found[card[1]].length === rank(card) - 1;
    function flipTops() {
      cols.forEach((col, i) => {
        if (col.length && !col[col.length - 1].up) {
          col[col.length - 1].up = true;
          if (i === 5 && col.length === 1 && !slipBShown) { slipBShown = true; showSlip(DEAL.slipB); }
        }
      });
    }
    function legalMoves() {
      const out = [];
      const w = waste[waste.length - 1];
      if (w) {
        if (toFound(w.c)) out.push({ from: "w", to: "F" });
        cols.forEach((d, j) => { if (fits(w.c, d)) out.push({ from: "w", to: j }); });
      }
      cols.forEach((col, i) => {
        if (!col.length) return;
        const top = col[col.length - 1];
        if (toFound(top.c)) out.push({ from: i, idx: col.length - 1, to: "F" });
        const first = col.findIndex((x) => x.up);
        for (let k = first; k < col.length; k++) {
          cols.forEach((d, j) => {
            if (j === i || !fits(col[k].c, d)) return;
            if (k === 0 && d.length === 0) return; // king to empty from empty: pointless
            out.push({ from: i, idx: k, to: j });
          });
        }
      });
      return out;
    }
    const canDraw = () => stock.length > 0 || (waste.length > 0 && pass < DEAL.passes);

    function draw() {
      if (over || modal) return;
      if (stock.length === 0) {
        if (waste.length && pass < DEAL.passes) { stock = waste.map((x) => x.c); waste = []; pass++; turnsThisPass = 0; peeked = false; peekShow = false; }
        act(); return;
      }
      turnsThisPass++;
      peekShow = false;
      if (pass === 1 && turnsThisPass === DEAL.slipA.at && !slipAShown) { slipAShown = true; showSlip(DEAL.slipA); }
      waste.push({ c: stock.shift(), up: true });
      act();
    }
    function moveTo(src, dst) {
      // src: {from:'w'} or {from:i, idx}
      let cards;
      if (src.from === "w") { const w = waste[waste.length - 1]; if (!w) return false; cards = [w]; }
      else { const col = cols[src.from]; if (!col[src.idx] || !col[src.idx].up) return false; cards = col.slice(src.idx); }
      if (dst === "F") {
        if (cards.length !== 1 || !toFound(cards[0].c)) return false;
        found[cards[0].c[1]].push(cards[0].c);
      } else {
        if (!fits(cards[0].c, cols[dst])) return false;
        cols[dst].push(...cards);
      }
      if (src.from === "w") waste.pop(); else cols[src.from].splice(src.idx);
      moves++;
      flipTops();
      return true;
    }
    function act() {
      sel = null; pulse = null; lastAct = performance.now();
      // auto-finish when every card is face up and the stock is empty
      if (!stock.length && !waste.length && cols.every((c) => c.every((x) => x.up))) {
        let any = true;
        while (any) { any = false; cols.forEach((c, i) => { if (c.length && toFound(c[c.length - 1].c)) { moveTo({ from: i, idx: c.length - 1 }, "F"); any = true; } }); }
      }
      layout();
      checkEnd();
    }
    function checkEnd() {
      if (over || modal) return;
      const n = Object.values(found).reduce((a, f) => a + f.length, 0);
      if (n === 52) {
        over = true;
        api.store.set("wins", api.store.get("wins", 0) + 1);
        later(() => api.end({ outcome: "win", text: `All fifty-two home in ${moves} moves. On the spike: ${spike.length} card${spike.length === 1 ? "" : "s"} from another deck, in a hand you don't know.` }), 700);
      } else if (!canDraw() && !legalMoves().length) {
        over = true;
        later(() => api.end({ outcome: "lose", text: `The passes are spent and nothing moves: ${n} of 52 home. On the spike: ${spike.length} slipped card${spike.length === 1 ? "" : "s"}. The first bell will ring soon.` }), 700);
      }
    }
    function showSlip(s) {
      spike.push(s);
      modal = document.createElement("div");
      modal.className = P + "big";
      modal.innerHTML = `<div><span></span><small>CARD ${s.no} · FROM ANOTHER DECK · TO THE SPIKE</small></div>`;
      modal.querySelector("span").textContent = s.text;
      felt.appendChild(modal);
      later(() => { if (modal) { modal.remove(); modal = null; layout(); checkEnd(); } }, api.reducedMotion ? 2200 : 3000);
    }

    // ---- input
    function clickCard(where, i, idx) {
      if (over || modal) return;
      if (where === "stock") { draw(); return; }
      if (where === "found") { if (sel) { if (moveTo(sel, "F")) act(); else { sel = null; layout(); } } return; }
      if (where === "waste") {
        if (sel && sel.from === "w") { if (moveTo(sel, "F")) act(); else { sel = null; layout(); } return; }
        if (waste.length) { sel = { from: "w" }; layout(); }
        return;
      }
      if (where === "col") {
        const col = cols[i];
        if (sel) {
          if (sel.from === i) {
            // tapping the selection again: try the foundation
            if (sel.idx === col.length - 1 && moveTo(sel, "F")) { act(); return; }
            sel = null; layout(); return;
          }
          if (tryInto(sel, i)) { act(); return; }
        }
        if (idx != null && col[idx] && col[idx].up) { sel = { from: i, idx }; layout(); }
        else { sel = null; layout(); }
      }
    }
    function tryInto(s, j) {
      if (s.from === "w") return moveTo(s, j);
      const col = cols[s.from];
      // try the selected card first, then any card of the run that fits
      if (moveTo(s, j)) return true;
      for (let k = col.findIndex((x) => x.up); k < col.length; k++) if (moveTo({ from: s.from, idx: k }, j)) return true;
      return false;
    }
    function doPeek() { if (over || modal || peeked || !stock.length) return; peeked = true; peekShow = true; lastAct = performance.now(); layout(); }
    function doHint() {
      if (over || modal || hints <= 0) return;
      hints--; pulse = legalMoves()[0] || (canDraw() ? { from: "stock" } : null); lastAct = performance.now(); layout();
    }

    // ---- layout
    let geo = null;
    function layout() {
      felt.querySelectorAll(`.${P}card,.${P}slot,.${P}plate`).forEach((e) => e.remove());
      const W = felt.clientWidth, H = felt.clientHeight;
      const gap = Math.max(6, Math.min(16, W * 0.012));
      let cw = Math.min(104, (W - 32 - 6 * gap) / 7, (H - 120) / 4.4);
      cw = Math.max(40, cw);
      const ch = cw * 1.4;
      const left = (W - (7 * cw + 6 * gap)) / 2;
      const x = (slot) => left + slot * (cw + gap);
      const yTop = 22, yCols = yTop + ch + 34;
      geo = { cw, ch, x };
      felt.style.setProperty("--fs", Math.max(11, cw * 0.2) + "px");
      const mk = (cls, l, t, attrs = {}) => {
        const d = document.createElement("div");
        d.className = cls; d.style.left = l + "px"; d.style.top = t + "px"; d.style.width = cw + "px"; d.style.height = ch + "px";
        for (const k in attrs) d.dataset[k] = attrs[k];
        felt.appendChild(d); return d;
      };
      const face = (card, l, t, attrs) => {
        const d = mk(`${P}card ${P}face${red(card) ? " r" : ""}`, l, t, attrs);
        d.innerHTML = `<span class="c">${label(card).replace(/(.)$/, "<br>$1")}</span><span class="m" style="background-image:${FAN(red(card) ? "#a3302a" : "#b8913f")}"></span><span class="s">${SUITS[card[1]]}</span>`;
        d.setAttribute("aria-label", label(card));
        return d;
      };
      const isPulse = (m) => pulse && Object.keys(m).every((k) => pulse[k] === m[k]);
      // stock
      if (stock.length) { const b = mk(`${P}card ${P}back`, x(0), yTop, { w: "stock" }); if (pulse && pulse.from === "stock") b.classList.add(P + "pulse"); }
      else { const s = mk(`${P}slot`, x(0), yTop, { w: "stock" }); s.textContent = pass < DEAL.passes && waste.length ? "↺" : "×"; s.style.cursor = "pointer"; }
      // waste
      if (waste.length) {
        if (waste.length > 1) face(waste[waste.length - 2].c, x(1), yTop, { w: "waste" });
        const d = face(waste[waste.length - 1].c, x(1), yTop, { w: "waste" });
        if (sel && sel.from === "w") d.classList.add(P + "sel");
        if (pulse && pulse.from === "w") d.classList.add(P + "pulse");
      } else mk(`${P}slot`, x(1), yTop, { w: "waste" });
      if (peekShow && stock.length) { const d = face(stock[0], x(0) + cw * 0.18, yTop + ch * 0.32, { w: "stock" }); d.style.opacity = 0.85; d.style.transform = "rotate(-6deg)"; }
      // spike: the slipped cards
      const sp = mk(`${P}slot`, x(2), yTop, { w: "spike" }); sp.textContent = "⟟"; sp.title = "The spike";
      spike.forEach((s, i) => { const d = mk(`${P}card ${P}slip`, x(2) + i * 4, yTop + i * 6, { w: "spike", n: i }); d.textContent = s.text; });
      // foundations
      ["S", "H", "D", "C"].forEach((s, i) => {
        const f = found[s];
        if (f.length) face(f[f.length - 1], x(3 + i), yTop, { w: "found" });
        else { const sl = mk(`${P}slot`, x(3 + i), yTop, { w: "found" }); sl.textContent = SUITS[s]; }
      });
      // columns
      const avail = H - yCols - 70;
      cols.forEach((col, i) => {
        const pl = document.createElement("div");
        pl.className = P + "plate"; pl.textContent = "40" + (i + 1);
        pl.style.left = x(i) + cw * 0.25 + "px"; pl.style.width = cw * 0.5 + "px"; pl.style.top = yCols - 20 + "px";
        felt.appendChild(pl);
        if (!col.length) { mk(`${P}slot`, x(i), yCols, { w: "col", i, idx: "" }).textContent = "K"; return; }
        let dDown = ch * 0.16, dUp = ch * 0.27;
        const need = col.reduce((a, c, k) => a + (k === col.length - 1 ? 0 : c.up ? dUp : dDown), 0);
        if (need > avail - ch && need > 0) { const f = Math.max(0.3, (avail - ch) / need); dDown *= f; dUp *= f; }
        let y = yCols;
        col.forEach((c, k) => {
          const d = c.up ? face(c.c, x(i), y, { w: "col", i, idx: k }) : mk(`${P}card ${P}back`, x(i), y, { w: "col", i, idx: k });
          if (sel && sel.from === i && k >= sel.idx) d.classList.add(P + "sel");
          if (isPulse({ from: i, idx: k })) d.classList.add(P + "pulse");
          y += c.up ? dUp : dDown;
        });
      });
      hud.style.left = x(6) + "px"; hud.style.top = yCols + "px"; hud.style.width = cw + "px";
      if (W < 640) { hud.style.left = "16px"; hud.style.top = "auto"; hud.style.bottom = "12px"; hud.style.width = "auto"; hud.style.right = "16px"; }
      else hud.style.bottom = "auto";
      passEl.textContent = `PASS ${pass}/${DEAL.passes}`;
      hintBtn.textContent = `HINT ${hints}`; hintBtn.disabled = hints <= 0;
      peekBtn.disabled = peeked || !stock.length;
    }

    const hud = document.createElement("div");
    hud.className = P + "hud";
    hud.innerHTML = `<span class="pass"></span><button type="button" class="${P}btn" data-b="peek">PEEK</button><button type="button" class="${P}btn" data-b="hint">HINT</button><button type="button" class="${P}btn" data-b="fold">FOLD</button>`;
    felt.appendChild(hud);
    const passEl = hud.querySelector(".pass"), peekBtn = hud.querySelector('[data-b="peek"]'), hintBtn = hud.querySelector('[data-b="hint"]');
    const clock = document.createElement("div");
    clock.className = P + "clock";
    clock.style.right = "22px"; clock.style.top = "14px";
    felt.appendChild(clock);

    on(peekBtn, "click", doPeek);
    on(hintBtn, "click", doHint);
    on(hud.querySelector('[data-b="fold"]'), "click", () => {
      if (over) return;
      over = true;
      const n = Object.values(found).reduce((a, f) => a + f.length, 0);
      api.end({ outcome: "done", text: `You fold at ${n} of 52. The deal stays as it was until 05:00. The spike holds ${spike.length} slipped card${spike.length === 1 ? "" : "s"}.` });
    });
    on(felt, "pointerdown", (e) => {
      const d = e.target.closest(`.${P}card,.${P}slot`);
      if (!d || !felt.contains(d) || d.closest(`.${P}hud`)) return;
      const w = d.dataset.w;
      if (w === "spike") { if (spike.length) { const s = spike[spike.length - 1]; const m = document.createElement("div"); m.className = P + "big"; m.innerHTML = `<div><span></span><small>THE SPIKE · TAP TO CLOSE</small></div>`; m.querySelector("span").textContent = spike.map((x) => x.text).join(" / "); on(m, "pointerdown", () => m.remove()); felt.appendChild(m); void s; } return; }
      clickCard(w, d.dataset.i != null ? +d.dataset.i : null, d.dataset.idx !== "" && d.dataset.idx != null ? +d.dataset.idx : null);
    });
    on(window, "keydown", (e) => {
      if (felt.querySelector(`.${P}intro`) || over) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "d") { e.preventDefault(); draw(); }
      else if (k === "w") clickCard("waste");
      else if (k === "f") clickCard("found");
      else if (k === "p") doPeek();
      else if (k === "h") doHint();
      else if (k === "escape") { sel = null; layout(); }
      else if (/^[1-6]$/.test(k)) {
        const i = +k - 1, col = cols[i];
        if (sel) { clickCard("col", i, null); return; }
        const first = col.findIndex((x) => x.up);
        if (first >= 0) clickCard("col", i, first);
      }
    });
    const ro = new ResizeObserver(() => layout());
    ro.observe(felt);

    let raf = 0;
    const tick = (now) => {
      const gm = Math.floor(((now - t0) / 1000) * 10 / 60); // 10x
      const h = (23 + Math.floor(gm / 60)) % 24, m = gm % 60;
      clock.textContent = `◷ ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!over && !modal && !pulse && now - lastAct > 20000) { const lm = legalMoves()[0]; pulse = lm || (canDraw() ? { from: "stock" } : null); layout(); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>Night Patience</h2><p>Build down the six columns in alternating colours; build up the foundations by suit, Ace to King. Only a King fills an empty column. Turn the stock one card at a time: three passes, and one peek per pass.</p><p>Tap a card, then where it goes; tap it again to send it home. Keys: Space draws, 1–6 pick a column, W the waste, F home, P peek, H hint.</p><p>Someone keeps slipping cards into this deck.</p><button type="button" class="${P}btn">START</button></div>`;
    felt.appendChild(intro);
    const startBtn = intro.querySelector("button");
    on(startBtn, "click", () => { intro.remove(); lastAct = performance.now(); layout(); });
    layout();
    startBtn.focus();

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

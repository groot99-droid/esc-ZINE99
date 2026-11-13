// A Journey Into the Heartstream, 1D game: Bone Counters (DESIGN.md section 11, `g1_counters`).
// Linocut: bold carved black on cream, gouge marks in the pits, red for the beat.
// One round cut from `s1_counters_1` (60 bpm, the capture hollow glows when hovered). Solo: you play
// the companion who will carve for you, the one who argues. Board indices run anticlockwise:
// 0-4 your row (left to right), 5 your keep (right), 6-10 his row (right to left), 11 his keep (left).

const C = { ink: "#15100c", cream: "#efe4cc", red: "#B3202E", gold: "#F2B544" };
const BPM = 60, PERIOD = 60000 / BPM, GOOD = 120;

export default {
  mount(root, api) {
    const P = "heartstream-bone-counters-";
    const rng = api.rng();
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    const board = Array(12).fill(3); board[5] = 0; board[11] = 0;
    const st = { started: false, over: false, turn: 0, who: 0, phase: "pick", hover: -1, sel: 2, rung: {}, sow: null,
      drops: [], myDrops: 0, myOn: 0, msg: "", lastBeat: -1 };
    let t0 = 0, raf = 0, audio = null;

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.cream};color:${C.ink};font-family:var(--g-display);display:flex;flex-direction:column;align-items:center;padding:10px;box-sizing:border-box;user-select:none;-webkit-user-select:none}
.${P}head{width:100%;max-width:1100px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 18px}
.${P}head h2{margin:0;font-size:clamp(22px,3.4vw,38px);letter-spacing:.14em;font-weight:700}
.${P}head span{color:${C.red};font-style:italic;font-size:18px}
.${P}msg{width:100%;max-width:1100px;font-size:17px;min-height:1.5em;font-style:italic}
.${P}wrap svg.${P}board{width:100%;max-width:1100px;flex:1 1 auto;min-height:0;touch-action:manipulation}
.${P}hol{cursor:pointer;outline:none}
.${P}hol:focus .${P}pit{stroke:${C.red};stroke-width:6}
.${P}bar{display:flex;gap:10px;align-items:center;justify-content:center;padding:6px}
.${P}drop{font:700 18px var(--g-display);letter-spacing:.2em;background:${C.ink};color:${C.cream};border:0;padding:14px 34px;cursor:pointer;min-width:180px;touch-action:manipulation}
.${P}drop:disabled{opacity:.35}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,228,204,.85);z-index:5}
.${P}card{max-width:540px;background:${C.cream};border:6px solid ${C.ink};padding:20px 22px;box-shadow:10px 10px 0 ${C.ink}}
.${P}card h2{font-size:30px;margin:0 0 8px;letter-spacing:.1em}
.${P}card p{margin:0 0 10px;line-height:1.4;font-size:17px}
`;
    wrap.appendChild(css);
    const head = document.createElement("div"); head.className = P + "head";
    head.innerHTML = `<h2>BONE COUNTERS</h2><span>sow on the beat</span>`;
    const msg = document.createElement("div"); msg.className = P + "msg";
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", P + "board"); svg.setAttribute("viewBox", "0 0 1200 760"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const bar = document.createElement("div"); bar.className = P + "bar";
    const dropBtn = document.createElement("button"); dropBtn.type = "button"; dropBtn.className = P + "drop"; dropBtn.textContent = "DROP"; dropBtn.disabled = true;
    bar.appendChild(dropBtn);
    wrap.append(head, msg, svg, bar);
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>Bone Counters</h2><p>“Sow with the heart.”</p>
<p><b>Pick one of your hollows</b> (the bottom row). Its counters are sown one by one, anticlockwise, into the next hollows and your keep on the right. Each falls on a heartbeat: <b>tap Drop</b> (Space, or tap the board) as it falls.</p>
<p>Last counter in your keep: go again. In an empty hollow of yours: take it and the hollow opposite. On the beat into a hollow that then holds three: it rings, and nobody may sow from it next turn. Most in the keep wins the round.</p>
<button type="button" class="${P}drop">START</button></div>`;
    wrap.appendChild(intro);
    root.appendChild(wrap);

    // ---- the block: drawn once ------------------------------------------------------------------
    const POS = [];
    for (let i = 0; i < 5; i++) POS[i] = [300 + i * 150, 480];
    POS[5] = [1060, 390];
    for (let j = 6; j <= 10; j++) POS[j] = [300 + (10 - j) * 150, 300];
    POS[11] = [140, 390];
    let s = `<defs><filter id="${P}rough"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs><g filter="url(#${P}rough)">`;
    s += `<rect x="40" y="150" width="1120" height="480" rx="110" fill="${C.ink}"/>`;
    for (let k = 0; k < 110; k++) {
      const a = (k / 110) * Math.PI * 2, cx = 600 + 560 * Math.cos(a), cy = 390 + 240 * Math.sin(a), ln = 14 + rng() * 26;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx - Math.cos(a) * ln}" y2="${cy - Math.sin(a) * ln * 0.6}" stroke="${C.cream}" stroke-width="3" stroke-linecap="round"/>`;
    }
    POS.forEach(([cx, cy], i) => {
      const keep = i === 5 || i === 11, rx = keep ? 60 : 58, ry = keep ? 150 : 52;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.cream}"/>`;
      for (let m = 0; m < (keep ? 14 : 8); m++) {
        const a = rng() * Math.PI * 2, rr = 0.3 + rng() * 0.55, x = cx + rx * rr * Math.cos(a), y = cy + ry * rr * Math.sin(a);
        s += `<path d="M${x - 9},${y} q9,${(rng() - 0.5) * 12} 18,0" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`;
      }
    });
    s += `</g><g class="${P}dyn"></g>`;
    svg.innerHTML = s;
    const dyn = svg.querySelector("." + P + "dyn");
    const spots = (n, i) => Array.from({ length: n }, (_, k) => {
      if (i === 5 || i === 11) return [POS[i][0] + ((k % 3) - 1) * 24, POS[i][1] - 120 + Math.floor(k / 3) * 22];
      const a = k * 2.4, r = 8 + 7 * Math.sqrt(k); return [POS[i][0] + r * Math.cos(a), POS[i][1] + r * Math.sin(a) * 0.9];
    });

    // ---- rules ----------------------------------------------------------------------------------
    const mine = (who, i) => (who === 0 ? i >= 0 && i <= 4 : i >= 6 && i <= 10);
    const keepOf = (who) => (who === 0 ? 5 : 11);
    const isRung = (i) => st.rung[i] != null && st.rung[i] >= st.turn;
    const legal = (who) => [0, 1, 2, 3, 4].map((k) => (who === 0 ? k : 6 + k)).filter((i) => board[i] > 0 && !isRung(i));
    function simulate(i, who) { // where the last counter lands, and whether it captures
      let n = board[i], j = i; const skip = who === 0 ? 11 : 5;
      while (n > 0) { j = (j + 1) % 12; if (j === skip) continue; n--; }
      return { last: j, cap: mine(who, j) && (j === i ? false : board[j] === 0) && board[10 - j] > 0 };
    }
    function startSow(i, who) {
      const n = board[i]; board[i] = 0;
      const now = performance.now(), k = Math.ceil((now - t0) / PERIOD + 0.15);
      st.sow = { who, from: i, left: n, at: i, nextBeat: k, judged: [], taps: [] };
      st.phase = "sow";
      dropBtn.disabled = who !== 0;
      say(who === 0 ? "Tap Drop as each counter falls." : "He sows. Watch the beat.");
      render();
    }
    function dropOne() {
      const sw = st.sow; const skip = sw.who === 0 ? 11 : 5;
      do { sw.at = (sw.at + 1) % 12; } while (sw.at === skip);
      board[sw.at]++; sw.left--;
      const k = sw.nextBeat; sw.nextBeat++;
      sw.pending = { k, at: sw.at, last: sw.left === 0 };
      if (sw.who === 1) sw.pending.on = rng() < 0.9;
      render();
    }
    function judge() { // after the window closes on a drop
      const sw = st.sow, p = sw.pending; sw.pending = null;
      let onBeat = p.on;
      if (sw.who === 0) { onBeat = sw.taps.some((t) => Math.abs(t - (t0 + p.k * PERIOD)) <= GOOD); st.myDrops++; if (onBeat) st.myOn++; }
      st.drops.push({ who: sw.who, on: onBeat }); if (st.drops.length > 14) st.drops.shift();
      chime(onBeat);
      if (p.last) endSow(p.at, onBeat);
      render();
    }
    function endSow(j, onBeat) {
      const who = st.sow.who; st.sow = null; dropBtn.disabled = true;
      let again = false, note = "";
      if (j === keepOf(who)) { again = true; note = who === 0 ? "Into your keep: go again." : "Into his keep: he goes again."; }
      else if (mine(who, j) && board[j] === 1 && board[10 - j] > 0) {
        const got = board[j] + board[10 - j]; board[keepOf(who)] += got; board[j] = 0; board[10 - j] = 0;
        note = who === 0 ? `Captured ${got}.` : `He captures ${got}.`;
      }
      if (onBeat && j !== 5 && j !== 11 && board[j] === 3) { st.rung[j] = st.turn + 2; note += " The hollow rings: no one sows from it next turn."; }
      // the round ends when a row is empty
      const rowA = [0, 1, 2, 3, 4].reduce((a, i) => a + board[i], 0), rowB = [6, 7, 8, 9, 10].reduce((a, i) => a + board[i], 0);
      if (!rowA || !rowB) {
        for (let i = 0; i < 5; i++) { board[5] += board[i]; board[i] = 0; board[11] += board[6 + i]; board[6 + i] = 0; }
        render(); return finish();
      }
      st.turn++;
      if (!again) st.who = 1 - who;
      if (!legal(st.who).length) st.who = 1 - st.who; // every hollow rung: pass
      st.phase = "pick";
      say((note ? note + " " : "") + (st.who === 0 ? "Your turn: pick a hollow." : ""));
      render();
      if (st.who === 1) companionTurn();
    }
    let compTimer = 0;
    function companionTurn() {
      compTimer = setTimeout(() => {
        if (st.over) return;
        const opts = legal(1); if (!opts.length) return;
        const caps = opts.filter((i) => simulate(i, 1).cap);
        const keeps = opts.filter((i) => simulate(i, 1).last === 11);
        const pick = keeps[0] ?? caps[0] ?? opts[Math.floor(rng() * opts.length)];
        startSow(pick, 1);
      }, 900);
    }
    function finish() {
      st.over = true; render();
      const a = board[5], b = board[11], share = st.myDrops ? Math.round((100 * st.myOn) / st.myDrops) : 0;
      const tail = ` You dropped ${share}% of your counters on the beat${share >= 70 ? ": that brother keeps good time on the river (+15 ms)." : share <= 40 ? ": on the river your window narrows (−10 ms)." : "."}`;
      api.end(a > b ? { outcome: "win", text: `You take the round, ${a} to ${b}.${tail}` }
        : a < b ? { outcome: "lose", text: `He takes the round, ${b} to ${a}.${tail}` }
        : { outcome: "done", text: `An even round, ${a} each.${tail}` });
    }

    // ---- sound ----------------------------------------------------------------------------------
    function chime(onBeat) {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.type = onBeat ? "sine" : "triangle"; o.frequency.value = onBeat ? 880 : 140;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(onBeat ? 0.25 : 0.3, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + (onBeat ? 0.9 : 0.15));
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 1);
    }
    function thump() {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.1);
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.18, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 0.2);
    }

    // ---- drawing --------------------------------------------------------------------------------
    const say = (m) => { st.msg = m; msg.textContent = m; };
    function render() {
      let d = "";
      const showCap = st.phase === "pick" && st.who === 0 && st.hover >= 0 && board[st.hover] > 0 && !isRung(st.hover) && simulate(st.hover, 0).cap;
      POS.forEach(([cx, cy], i) => {
        const keep = i === 5 || i === 11;
        const pickable = !st.over && st.phase === "pick" && st.who === 0 && i <= 4 && board[i] > 0 && !isRung(i);
        d += `<g class="${P}hol" data-i="${i}" ${i <= 4 ? `tabindex="0" role="button" aria-label="Hollow ${i + 1}, ${board[i]} counters${isRung(i) ? ", rung" : ""}"` : ""}>`;
        d += `<ellipse class="${P}pit" cx="${cx}" cy="${cy}" rx="${keep ? 64 : 62}" ry="${keep ? 154 : 56}" fill="transparent" stroke="${pickable && (st.hover === i || st.sel === i) ? C.gold : "none"}" stroke-width="5"/>`;
        if (isRung(i)) d += `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="64" fill="none" stroke="${C.red}" stroke-width="8"/><ellipse cx="${cx}" cy="${cy}" rx="82" ry="76" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 8"/>`;
        if (showCap && (i === st.hover || i === 10 - simulate(st.hover, 0).last || i === simulate(st.hover, 0).last)) d += `<ellipse cx="${cx}" cy="${cy}" rx="66" ry="60" fill="${C.gold}" opacity=".35"/>`;
        spots(board[i], i).forEach(([x, y], k) => {
          const piece = i === 5 && k === 0;
          d += `<ellipse cx="${x}" cy="${y}" rx="${piece ? 19 : 15}" ry="${piece ? 14 : 11}" fill="${piece ? C.red : C.ink}" transform="rotate(${((k * 37) % 60) - 30} ${x} ${y})"/><path d="M${x - 6},${y - 3} q6,-4 12,0" fill="none" stroke="${C.cream}" stroke-width="2"/>`;
        });
        d += `<text x="${cx}" y="${keep ? cy + 182 : i <= 4 ? cy + 84 : cy - 70}" text-anchor="middle" font-size="22" font-weight="700" fill="${keep ? C.ink : C.cream}">${board[i]}</text></g>`;
      });
      if (st.sow && st.sow.pending) { const [x, y] = POS[st.sow.pending.at]; d += `<ellipse cx="${x}" cy="${y}" rx="70" ry="64" fill="none" stroke="${C.red}" stroke-width="5" opacity=".9"/>`; }
      d += `<text x="1060" y="200" text-anchor="middle" font-size="16" font-weight="700" fill="${C.cream}">YOUR KEEP</text><text x="140" y="200" text-anchor="middle" font-size="16" font-weight="700" fill="${C.cream}">HIS KEEP</text>`;
      // the beat row: heartbeat cuts, dull ones faded
      st.drops.forEach((b, i) => {
        const x = 70 + i * 76, col = b.who === 0 ? C.ink : "#6b5a48";
        d += `<path d="M${x},710 l14,0 l8,-28 l10,48 l8,-20 l14,0" fill="none" stroke="${b.on ? (b.who === 0 ? C.red : col) : col}" stroke-width="${b.on ? 6 : 4}" stroke-linejoin="round" opacity="${b.on ? 1 : 0.3}"/>`;
      });
      d += `<text x="40" y="742" font-size="15" font-style="italic" fill="${C.ink}">${st.myDrops ? `on the beat: ${Math.round((100 * st.myOn) / st.myDrops)}% of your drops` : "your drops will show here; red rang on the beat"}</text>`;
      dyn.innerHTML = d;
    }

    // ---- input ----------------------------------------------------------------------------------
    function tap() {
      if (!st.sow || st.sow.who !== 0) return;
      st.sow.taps.push(performance.now());
    }
    function choose(i) {
      if (st.over || !st.started || st.phase !== "pick" || st.who !== 0) return;
      if (i > 4 || !board[i]) return;
      if (isRung(i)) { say("That hollow is rung: no sowing from it this turn."); return; }
      startSow(i, 0);
    }
    on(svg, "pointerdown", (e) => {
      if (st.sow) { e.preventDefault(); tap(); return; }
      const h = e.target.closest("." + P + "hol"); if (h) choose(+h.dataset.i);
    });
    on(svg, "pointermove", (e) => { const h = e.target.closest("." + P + "hol"); const i = h ? +h.dataset.i : -1; if (i !== st.hover) { st.hover = i; render(); } });
    on(dropBtn, "pointerdown", (e) => { e.preventDefault(); tap(); });
    on(window, "keydown", (e) => {
      if (!st.started) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } return; }
      if (e.key === " " || e.key.toLowerCase() === "j") { e.preventDefault(); if (e.repeat) return; if (st.sow) tap(); else choose(st.sel); return; }
      if (st.phase !== "pick" || st.who !== 0) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault(); const d = e.key === "ArrowLeft" ? -1 : 1;
        st.sel = (st.sel + d + 5) % 5; st.hover = st.sel; render();
      } else if (e.key === "Enter") { e.preventDefault(); choose(st.sel); }
    });
    function begin() {
      if (st.started) return;
      intro.remove(); st.started = true;
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      t0 = performance.now();
      say("Your turn: pick a hollow in the bottom row.");
      render();
    }
    on(intro.querySelector("button"), "click", begin);

    function frame(now) {
      if (st.started && !st.over) {
        const k = Math.floor((now - t0) / PERIOD);
        if (k !== st.lastBeat) { st.lastBeat = k; thump(); }
        const sw = st.sow;
        if (sw) {
          if (!sw.pending && sw.left > 0 && now >= t0 + sw.nextBeat * PERIOD) dropOne();
          if (sw.pending && now >= t0 + sw.pending.k * PERIOD + GOOD + 20) judge();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    render();

    return {
      unmount() {
        cancelAnimationFrame(raf); clearTimeout(compTimer);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

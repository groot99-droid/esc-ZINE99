// A Journey Into the Heartstream, 1D game: Marrow-Song (DESIGN.md section 11, `g1_song`).
// Bead-string notation: beads on strands, height as pitch, the last bead home.
// Two verses, as the design has them:
//   verse one (`s1_song_1`, chapter 3, the singing hollow): eight slots, three phrases per brother;
//     each companion has set one phrase, you place yours, and at Sing they fill any slot left empty;
//   the heart verse (`s1_song_2`, chapter 7, a calm pool on the river): four slots, one phrase per
//     brother, starting within 1 of verse one's last height and ending on height 1, "home". Here the
//     brothers hand you their phrases to order.
//
// Actions: Place (drag, or tap a phrase then a slot); Take back (tap your placed phrase); Listen
// (the whole verse with a play-head); Ask the one who dreams (two ghosted suggestions per verse).
//
// Lines shown, verbatim (DESIGN.md section 3):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "Their society is calm, cold, and ceremonial. Everything they do prepares them for the moment they will leave the bones forever."
//   "The young men laugh, argue, dream, and fear — all the emotions of early adulthood, amplified by the knowledge that this is the last time they will ever be together."
// "Sing it whole." is the elders' line from DESIGN.md section 6.

import { howTo, Beats, flourish, disposeKit } from "./_kit.js";

const SEATS = [
  { name: "you, the one who laughs", short: "You", col: "#7FB2E0", wave: "sine" },
  { name: "the one who argues", short: "Argues", col: "#E8DCC4", wave: "triangle" },
  { name: "the one who dreams", short: "Dreams", col: "#E0603A", wave: "square" },
  { name: "the one who fears", short: "Fears", col: "#F2B544", wave: "sawtooth" },
];
const PITCH = [0, 196, 220, 262, 294, 330];
const SOCIETY = "Their society is calm, cold, and ceremonial. Everything they do prepares them for the moment they will leave the bones forever.";
const BROTHERS = "The young men laugh, argue, dream, and fear — all the emotions of early adulthood, amplified by the knowledge that this is the last time they will ever be together.";

function joinKind(a, b) { const d = Math.abs(a.notes[3] - b.notes[0]); return d <= 1 ? "smooth" : d === 2 ? "rough" : "break"; }
function score(slots) {
  let smooth = 0, breaks = 0, calls = 0;
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i], b = slots[i + 1]; if (!a || !b) continue;
    const k = joinKind(a, b); if (k === "smooth") smooth++; if (k === "break") breaks++;
    if (a.accent !== b.accent) calls++;
  }
  return { smooth, breaks, calls, h: Math.max(0, Math.min(100, 50 + 6 * smooth - 8 * breaks + 3 * calls)) };
}
const harmony = (slots) => score(slots).h;
function companionFill(slots, phrases) {
  const out = slots.slice(), used = new Set(out.filter(Boolean).map((p) => p.id));
  for (let i = 0; i < out.length; i++) {
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
    const RM = api.reducedMotion;
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const rng = api.rng();
    const randPhrase = (id, seat, first) => {
      const n = [first ?? 1 + Math.floor(rng() * 5)];
      for (let j = 1; j < 4; j++) n.push(Math.max(1, Math.min(5, n[j - 1] + Math.floor(rng() * 5) - 2)));
      return { id, seat, notes: n, accent: rng() < 0.5 ? 1 : 3 };
    };

    // ---- verse one: generated until the best arrangement sings true and a careless one does not --
    let phrases, fixed, solution;
    for (let tries = 0; tries < 400; tries++) {
      phrases = [];
      for (let s = 0; s < 4; s++) for (let k = 0; k < 3; k++) phrases.push(randPhrase(`${s}-${k}`, s));
      fixed = Array(8).fill(null);
      const spots = [1, 3, 4, 6].sort(() => rng() - 0.5).slice(0, 3);
      [1, 2, 3].forEach((s, i) => { fixed[spots[i]] = phrases.find((p) => p.seat === s); });
      const free = fixed.map((p, i) => (p ? -1 : i)).filter((i) => i >= 0);
      const mine = phrases.filter((p) => p.seat === 0);
      let best = -1, bestSlots = null, sum = 0, n = 0;
      const rec = (slots, left) => {
        if (slots.some((p) => p && p.seat === 0)) { const h = harmony(companionFill(slots, phrases)); sum += h; n++; if (h > best) { best = h; bestSlots = slots.slice(); } }
        for (const p of left) for (const i of free) if (!slots[i]) { slots[i] = p; rec(slots, left.filter((q) => q !== p)); slots[i] = null; }
      };
      rec(fixed.slice(), mine);
      solution = bestSlots;
      if (best >= 84 && sum / n < 66) break;
    }

    // ---- the heart verse: built from a chain that sings home, then a decoy for each brother ------
    function makeHeart(lastHeight) {
      for (let tries = 0; tries < 2000; tries++) {
        const chain = [], order = [0, 1, 2, 3].sort(() => rng() - 0.5);
        let start = Math.max(1, Math.min(5, lastHeight + Math.floor(rng() * 3) - 1));
        let acc = rng() < 0.5 ? 1 : 3;
        for (let i = 0; i < 4; i++) {
          const p = randPhrase(`h${order[i]}a`, order[i], start); p.accent = acc; acc = acc === 1 ? 3 : 1;
          chain.push(p); start = Math.max(1, Math.min(5, p.notes[3] + Math.floor(rng() * 3) - 1));
        }
        if (chain[3].notes[3] !== 1) continue;
        if (chain.some((p, i) => i && joinKind(chain[i - 1], p) !== "smooth")) continue;
        const decoys = [0, 1, 2, 3].map((s) => randPhrase(`h${s}b`, s));
        if (decoys.filter((d) => d.notes[3] === 1).length > 1) continue;
        return { chain, all: [...chain, ...decoys].sort((a, b) => a.seat - b.seat || (a.id < b.id ? -1 : 1)) };
      }
      const chain = [0, 1, 2, 3].map((s, i) => ({ id: `h${s}a`, seat: s, notes: [lastHeight, 2, 2, i === 3 ? 1 : 2], accent: i % 2 ? 3 : 1 }));
      return { chain, all: chain };
    }

    const st = { started: false, over: false, verse: 1, slots: fixed.slice(), sel: null, time: 180, ghost: null, playing: null, hints: 2,
      v1: null, v1h: 0, lastHeight: 0, heart: null, kb: 0 };
    const nSlots = () => (st.verse === 1 ? 8 : 4);
    const pool = () => (st.verse === 1 ? phrases : st.heart.all);
    const movable = (p) => p && (st.verse === 2 || p.seat === 0);

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    const strand = (y, c) => `linear-gradient(transparent ${y - 1}px,${c} ${y - 1}px ${y + 1}px,transparent ${y + 1}px)`;
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 30%,#2F5D8C 0,#1E3557 55%,#0d1a30 100%);color:#E8DCC4;font-family:var(--g-body);padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}
.${P}top{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}
.${P}top h2{font-family:var(--g-display);font-weight:500;font-size:clamp(20px,3vw,28px);letter-spacing:.12em;margin:0;flex:1 1 auto;text-transform:uppercase}
.${P}hbar{display:flex;align-items:center;gap:8px;font-size:13px;letter-spacing:.16em}
.${P}hbar span{display:block;width:140px;height:14px;border-radius:7px;border:1px solid #7FB2E0;overflow:hidden;position:relative}
.${P}hbar span::after{content:"";position:absolute;left:75%;top:0;bottom:0;width:2px;background:#E8DCC4}
.${P}hbar i{display:block;height:100%;background:#7ed38a;transition:width .3s}
.${P}hbar b{font-size:16px;min-width:2ch}
.${P}timer{font-size:14px;letter-spacing:.08em;color:#c9d8ec}
.${P}btn{font:700 15px var(--g-body);color:#0b1424;background:#E8DCC4;border:0;border-radius:18px;padding:9px 16px;cursor:pointer;min-height:42px;transition:transform .1s}
.${P}btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 0 2px #7FB2E0}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}sing{background:#F2B544}
.${P}scroll{flex:1 1 280px;min-height:220px;display:flex}
.${P}mem{width:100%;height:100%;max-height:440px}
.${P}mem g[role=button]{cursor:pointer;outline:none}
.${P}mem g[role=button]:hover rect.${P}hit{stroke-opacity:.8}
.${P}mem g[role=button]:focus rect.${P}hit{stroke:#F2B544;stroke-width:3;stroke-opacity:1}
.${P}trays{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.${P}tray{border:1.5px solid;border-radius:14px;padding:8px;background:rgba(11,20,36,.55);min-width:0}
.${P}tray h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;font-weight:700}
.${P}tray .${P}ph{display:flex;gap:6px;flex-wrap:wrap}
.${P}phr{background:none;border:1.5px solid rgba(127,178,224,.25);border-radius:10px;padding:2px;cursor:grab;touch-action:none}
.${P}phr:hover:not(:disabled){border-color:#7FB2E0}
.${P}phr[aria-pressed=true]{border-color:#F2B544;background:rgba(242,181,68,.18);box-shadow:0 0 12px rgba(242,181,68,.4)}
.${P}phr:disabled{opacity:.45;cursor:default}
.${P}say{min-height:1.4em;font-size:16px;font-style:italic;color:#dbe6f4}
.${P}legend{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;color:#c9d8ec}
.${P}legend b{color:#E8DCC4}
.${P}drag{position:fixed;pointer-events:none;z-index:50;opacity:.9}
.${P}beat{position:absolute;left:50%;top:70px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:12px 18px;background:rgba(11,20,36,.94);border:1.5px solid #7FB2E0;border-radius:22px;font-family:var(--g-display);font-size:19px;line-height:1.35;text-align:center;z-index:6;box-shadow:0 8px 30px rgba(0,0,0,.4)}
.${P}beat b{display:block;font-family:var(--g-body);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#F2B544}
.${P}beat.${P}in{animation:${P}up .5s ease-out}
@keyframes ${P}up{from{opacity:0;transform:translate(-50%,10px)}}
.${P}ok{animation:${P}okk .6s}
@keyframes ${P}okk{40%{filter:drop-shadow(0 0 10px #7ed38a)}}
.${P}bad{animation:${P}bd .45s}
@keyframes ${P}bd{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(13,26,48,.84);z-index:8;overflow:auto}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:#11203a;border:1.5px solid #7FB2E0;border-radius:22px;padding:34px 24px 20px;
  background-image:${strand(14, "rgba(127,178,224,.5)")},radial-gradient(circle at 10% 14px,#7FB2E0 5px,transparent 6px),radial-gradient(circle at 18% 14px,#E8DCC4 5px,transparent 6px),radial-gradient(circle at 26% 14px,#E0603A 6px,transparent 7px),radial-gradient(circle at 34% 14px,#F2B544 5px,transparent 6px),radial-gradient(circle at 90% 14px,#7FB2E0 7px,transparent 8px)}
.${P}kick{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#7FB2E0}
.${P}card h2{font-family:var(--g-display);font-weight:500;font-size:34px;margin:2px 0 6px}
.${P}q{font-family:var(--g-display);font-style:italic;font-size:18px;line-height:1.35;margin:0 0 10px;color:#c9d8ec}
.${P}scene{margin:0 0 10px;font-size:15px;line-height:1.45}
.${P}goal{margin:0 0 12px;font-size:16px;line-height:1.4}
.${P}goal b{color:#F2B544;font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin-right:6px}
.${P}keys{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px}
.${P}keys li{display:grid;grid-template-columns:22px 92px 1fr;gap:0 8px;font-size:15px;align-items:baseline}
.${P}keys li::before{content:"";width:14px;height:14px;border-radius:50%;background:#7FB2E0;box-shadow:inset -3px -3px 0 rgba(0,0,0,.25);align-self:center}
.${P}keys li:nth-child(2)::before{background:#7ed38a}.${P}keys li:nth-child(3)::before{background:#F2B544}
.${P}kv{font-weight:700}
.${P}kw{grid-column:3;font-size:14px;color:#c9d8ec}
.${P}extra{font-size:14px;color:#c9d8ec;margin:0 0 12px}
.${P}start{font:700 16px var(--g-body);color:#0b1424;background:#F2B544;border:0;border-radius:18px;padding:10px 26px;cursor:pointer}
@media (max-width:640px){.${P}scroll{flex:0 0 auto;min-height:0}.${P}mem{height:auto;max-height:none}.${P}hbar span{width:100px}.${P}top h2{flex-basis:100%}.${P}beat{top:110px;font-size:17px}.${P}trays{grid-template-columns:1fr 1fr}.${P}tray h3{font-size:12px}.${P}keys li{grid-template-columns:20px 76px 1fr}}
`;
    wrap.appendChild(css);
    const top = document.createElement("div"); top.className = P + "top";
    top.innerHTML = `<h2></h2><div class="${P}hbar">HARMONY <span><i></i></span><b></b></div><span class="${P}timer"></span>
<button type="button" class="${P}btn" data-a="hint">Ask the one who dreams (2)</button><button type="button" class="${P}btn" data-a="listen">Listen</button><button type="button" class="${P}btn ${P}sing" data-a="sing" disabled>Sing</button>`;
    const NS = "http://www.w3.org/2000/svg";
    const mem = document.createElementNS(NS, "svg"); mem.setAttribute("class", P + "mem"); mem.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const say = document.createElement("div"); say.className = P + "say"; say.setAttribute("aria-live", "polite");
    const legendEl = document.createElement("ul"); legendEl.className = P + "legend";
    legendEl.innerHTML = `<li><b>Place</b> drag · tap phrase then slot · Enter</li><li><b>Take back</b> tap your phrase in the verse</li><li><b>Listen</b> hear the verse</li><li><b>Ask</b> the one who dreams suggests</li>`;
    const trays = document.createElement("div"); trays.className = P + "trays";
    const scroller = document.createElement("div"); scroller.className = P + "scroll"; scroller.appendChild(mem);
    wrap.append(top, scroller, say, trays, legendEl);
    const beats = new Beats(P, wrap, RM);
    const intro = howTo(P, {
      kicker: "Chapter three · the singing hollow",
      title: "Marrow-Song",
      quote: `“${SOCIETY}”`,
      scene: "The four of you have found your phrases in the hollow. Tonight the elders want one song from four throats. It will be the rowing chant, and it will be sung back at the heart.",
      goal: "Set your phrases into the verse so it sings true: harmony 75 or more.",
      keys: [["Place", "drag, or tap a phrase then a slot", "higher bead, higher note; your phrases are blue"],
        ["Join", "end to start: a step of 0 or 1 is smooth", "a step of 3 or more breaks the song"],
        ["Call", "neighbours with alternating accents", "the big bead is the accent; each change is a rowing call"]],
      extra: "Press Sing when you are ready; your brothers fill what is left.",
    });
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const singBtn = top.querySelector('[data-a="sing"]'), hintBtn = top.querySelector('[data-a="hint"]'), timerEl = top.querySelector("." + P + "timer");

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
      const t0 = performance.now(), n = slots.length;
      slots.forEach((p, i) => p && playPhrase(p, i * 4 * BEAT));
      const tick = () => {
        const beat = (performance.now() - t0) / 1000 / BEAT;
        st.playing.head = beat; drawMem();
        if (beat >= n * 4) { st.playing = null; drawMem(); if (then) then(); return; }
        st.playing.raf = requestAnimationFrame(tick);
      };
      st.playing = { head: 0, raf: requestAnimationFrame(tick) };
    }

    // ---- layout: one row of slots when wide, two rows when narrow --------------------------------
    const SW = 115;
    let narrow = false;
    const geom = () => {
      const n = nSlots(), cols = narrow && n === 8 ? 4 : n, rows = Math.ceil(n / cols);
      return { n, cols, rows, w: 60 + cols * SW, h: rows * 280 + 20 };
    };
    const slotXY = (i) => { const G = geom(); return { x: 40 + (i % G.cols) * SW, y: Math.floor(i / G.cols) * 280 }; };
    const Y = (h, oy) => oy + 250 - h * 38;
    function beadsSvg(p, x, w, oy, ghost) {
      const col = SEATS[p.seat].col, step = w / 4;
      let s = `<polyline points="${p.notes.map((h, j) => `${x + step * (j + 0.5)},${Y(h, oy)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2" opacity="${ghost ? 0.4 : 0.8}"/>`;
      p.notes.forEach((h, j) => {
        const cx = x + step * (j + 0.5), r = j + 1 === p.accent ? 12 : 8;
        s += `<circle cx="${cx}" cy="${Y(h, oy)}" r="${r}" fill="${col}" stroke="#0b1424" stroke-width="2" opacity="${ghost ? 0.45 : 1}" ${ghost ? 'stroke-dasharray="3 3"' : ""}/>`;
        if (!ghost) s += `<circle cx="${cx - r * 0.35}" cy="${Y(h, oy) - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".6"/>`;
      });
      return s;
    }
    function drawMem() {
      const G = geom();
      mem.setAttribute("viewBox", `0 0 ${G.w} ${G.h}`);
      let s = "";
      for (let r = 0; r < G.rows; r++) {
        const oy = r * 280;
        s += `<rect x="20" y="${oy + 20}" width="${G.w - 40}" height="260" rx="40" fill="#fff" opacity=".05" stroke="#7FB2E0" stroke-opacity=".35"/>`;
        for (let h = 1; h <= 5; h++) s += `<line x1="30" x2="${G.w - 30}" y1="${Y(h, oy)}" y2="${Y(h, oy)}" stroke="#7FB2E0" stroke-opacity="${h === 1 && st.verse === 2 ? 0.6 : 0.18}"/><text x="30" y="${Y(h, oy) + 5}" font-size="14" fill="#7FB2E0" text-anchor="end" opacity=".75">${h}</text>`;
      }
      if (st.verse === 2) {
        const a = slotXY(0), z = slotXY(3);
        s += `<rect x="${a.x + 8}" y="${Y(Math.min(5, st.lastHeight + 1), a.y) - 14}" width="${(SW - 12) / 4 - 4}" height="${(Math.min(5, st.lastHeight + 1) - Math.max(1, st.lastHeight - 1)) * 38 + 28}" rx="12" fill="#7ed38a" opacity=".14" stroke="#7ed38a" stroke-opacity=".6" stroke-dasharray="4 4"/>`;
        s += `<text x="${a.x + 4}" y="${a.y + 34}" font-size="14" fill="#7ed38a">start near ${st.lastHeight}</text>`;
        s += `<circle cx="${z.x + 6 + (SW - 12) * 7 / 8}" cy="${Y(1, z.y)}" r="17" fill="none" stroke="#F2B544" stroke-width="2" stroke-dasharray="4 4"/><text x="${z.x + SW - 4}" y="${z.y + 34}" font-size="14" fill="#F2B544" text-anchor="end">home</text>`;
      }
      for (let i = 0; i < G.n; i++) {
        const { x, y: oy } = slotXY(i), p = st.slots[i];
        const fixedHere = p && !movable(p);
        s += `<g role="button" tabindex="0" data-slot="${i}" aria-label="Slot ${i + 1}${p ? ", " + SEATS[p.seat].short + " " + p.notes.join(" ") : ", empty"}">`;
        s += `<rect class="${P}hit" x="${x + 3}" y="${oy + 40}" width="${SW - 6}" height="230" rx="22" fill="${p ? "rgba(255,255,255,.03)" : st.sel ? "rgba(242,181,68,.12)" : "rgba(255,255,255,.06)"}" stroke="${st.sel && !fixedHere ? "#F2B544" : "#7FB2E0"}" stroke-opacity="${st.sel && !fixedHere ? 0.7 : 0.3}" stroke-dasharray="${p ? "" : "6 6"}"/>`;
        if (p) s += beadsSvg(p, x + 6, SW - 12, oy, false);
        else if (st.ghost && st.ghost.slot === i) s += beadsSvg(st.ghost.p, x + 6, SW - 12, oy, true);
        s += `<text x="${x + SW / 2}" y="${oy + 292 - 8}" font-size="14" text-anchor="middle" fill="${p ? SEATS[p.seat].col : "#7FB2E0"}" opacity=".9">${p ? SEATS[p.seat].short.toUpperCase() : i + 1}</text></g>`;
      }
      for (let i = 0; i < G.n - 1; i++) {
        const a = st.slots[i], b = st.slots[i + 1]; if (!a || !b) continue;
        const k = joinKind(a, b), col = k === "smooth" ? "#7ed38a" : k === "rough" ? "#f0a640" : "#9a9a9a";
        const pa = slotXY(i), pb = slotXY(i + 1);
        const x1 = pa.x + 6 + (SW - 12) * 7 / 8, x2 = pb.x + 6 + (SW - 12) / 8, y1 = Y(a.notes[3], pa.y), y2 = Y(b.notes[0], pb.y);
        const dash = k === "break" ? 'stroke-dasharray="4 6"' : "";
        if (pa.y === pb.y) s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" ${dash}/>`;
        else s += `<line x1="${x1}" y1="${y1}" x2="${G.w - 22}" y2="${y1}" stroke="${col}" stroke-width="5" ${dash}/><line x1="22" y1="${y2}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" ${dash}/>`;
        if (a.accent !== b.accent) s += `<text x="${pa.y === pb.y ? pb.x : G.w - 34}" y="${pa.y + 36}" font-size="18" text-anchor="middle" fill="#F2B544">≈</text>`;
      }
      if (st.playing) { const i = Math.min(G.n - 1, Math.floor(st.playing.head / 4)), p0 = slotXY(i), x = p0.x + 6 + (st.playing.head - i * 4) * ((SW - 12) / 4); s += `<line x1="${x}" x2="${x}" y1="${p0.y + 30}" y2="${p0.y + 275}" stroke="#7FB2E0" stroke-width="4" opacity=".85"/>`; }
      mem.innerHTML = s;
      const sc = score(st.slots), h = sc.h;
      top.querySelector("i").style.width = h + "%";
      top.querySelector("i").style.background = h >= 75 ? "#7ed38a" : h <= 40 ? "#9a9a9a" : "#f0a640";
      top.querySelector("b").textContent = String(h);
      singBtn.disabled = !canSing() || st.over;
      hintBtn.textContent = `Ask the one who dreams (${st.hints})`;
      hintBtn.disabled = st.hints <= 0 || st.over;
      top.querySelector("h2").textContent = st.verse === 1 ? "Marrow-Song · verse one" : "Marrow-Song · the heart verse";
    }
    function canSing() {
      if (st.verse === 1) return st.slots.some((p) => p && p.seat === 0);
      return st.slots.every(Boolean) && new Set(st.slots.map((p) => p.seat)).size === 4 && Math.abs(st.slots[0].notes[0] - st.lastHeight) <= 1 && st.slots[3].notes[3] === 1;
    }
    function drawTrays() {
      const fa = document.activeElement, keep = fa && trays.contains(fa) && fa.dataset ? fa.dataset.id : null;
      trays.innerHTML = "";
      SEATS.forEach((seat, s) => {
        const t = document.createElement("div"); t.className = P + "tray"; t.style.borderColor = seat.col;
        t.innerHTML = `<h3 style="color:${seat.col}">${seat.name}</h3><div class="${P}ph"></div>`;
        for (const p of pool().filter((q) => q.seat === s)) {
          const placed = st.slots.includes(p);
          const b = document.createElement("button"); b.type = "button"; b.className = P + "phr"; b.dataset.id = p.id;
          b.setAttribute("aria-pressed", String(st.sel === p)); b.setAttribute("aria-label", `Phrase ${p.notes.join(" ")}, accent on beat ${p.accent}${placed ? ", placed" : ""}`);
          b.disabled = !movable(p) || placed || st.over;
          const mini = (v) => (v - 50) * 0.24 + 12;
          b.innerHTML = `<svg width="96" height="64" viewBox="0 0 92 64">${beadsSvg(p, 2, 88, 0, placed).replace(/cy="(\d+(\.\d+)?)"/g, (m, v) => `cy="${mini(+v)}"`).replace(/points="([^"]+)"/, (m, pts) => `points="${pts.split(" ").map((xy) => { const [x, y] = xy.split(","); return `${x},${mini(+y)}`; }).join(" ")}"`)}</svg>`;
          t.querySelector("." + P + "ph").appendChild(b);
        }
        trays.appendChild(t);
      });
      if (keep) { const b = trays.querySelector(`[data-id="${keep}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
    }
    const redraw = () => { drawMem(); drawTrays(); };

    // ---- placing --------------------------------------------------------------------------------
    function place(p, i) {
      if (st.over || !movable(p)) return;
      const cur = st.slots[i];
      if (cur && !movable(cur)) { say.textContent = "That slot holds a brother's phrase. You can only move your own."; flourish(mem, P + "bad", RM, 450); return; }
      const old = st.slots.indexOf(p);
      if (old >= 0) st.slots[old] = cur && st.verse === 2 ? cur : null; else if (cur && st.verse === 2) { /* displaced back to its tray */ }
      st.slots[i] = p; st.sel = null; st.ghost = null;
      const parts = [];
      let bad = false, good = false;
      if (i > 0 && st.slots[i - 1]) { const k = joinKind(st.slots[i - 1], p); parts.push(`in: ${k}`); bad ||= k === "break"; good ||= k === "smooth"; }
      if (i < nSlots() - 1 && st.slots[i + 1]) { const k = joinKind(p, st.slots[i + 1]); parts.push(`out: ${k}`); bad ||= k === "break"; good ||= k === "smooth"; }
      say.textContent = parts.length ? `Joins ${parts.join(", ")}.` : "Placed.";
      if (bad) flourish(mem, P + "bad", RM, 450); else if (good) flourish(mem, P + "ok", RM, 600);
      playPhrase(p);
      redraw();
      if (st.verse === 1 && harmony(st.slots) >= 75) beats.show("The verse holds. You can hear the oars in it already.", 3400, "true1");
      if (st.verse === 2 && canSing()) beats.show("It comes home. Low, on the first note any of you ever learned.", 3600, "home");
    }
    function takeBack(i) {
      const cur = st.slots[i]; if (!movable(cur)) return;
      st.slots[i] = null; say.textContent = "Taken back to the tray."; redraw();
    }
    on(trays, "click", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      const p = pool().find((q) => q.id === b.dataset.id);
      st.sel = st.sel === p ? null : p; if (st.sel) say.textContent = "Now tap a slot in the verse."; playPhrase(p); redraw();
    });
    on(mem, "click", (e) => {
      const g = e.target.closest("[data-slot]"); if (!g || dragMoved || !st.started) return;
      const i = +g.dataset.slot, cur = st.slots[i];
      if (st.sel) place(st.sel, i);
      else if (movable(cur)) takeBack(i);
      else if (cur) playPhrase(cur);
    });
    on(mem, "keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.slot != null) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); const i = e.target.dataset.slot; setTimeout(() => { const n = mem.querySelector(`[data-slot="${i}"]`); n && n.focus(); }, 0); } });
    let drag = null, dragMoved = false;
    on(trays, "pointerdown", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      drag = { p: pool().find((q) => q.id === b.dataset.id), x: e.clientX, y: e.clientY, el: null }; dragMoved = false;
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
        timers.push(setTimeout(() => { dragMoved = false; }, 0));
      }
    });
    on(top, "click", (e) => {
      const b = e.target.closest("button"); if (!b || st.over || !st.started) return;
      if (b.dataset.a === "listen") listen(st.slots.slice());
      if (b.dataset.a === "hint") hint();
      if (b.dataset.a === "sing") sing();
    });
    function hint() {
      if (st.hints <= 0) return;
      const target = st.verse === 1 ? solution : st.heart.chain;
      let i = target.findIndex((q, k) => q && movable(q) && st.slots[k] !== q && !st.slots[k] && !st.slots.includes(q));
      if (i < 0) i = target.findIndex((q, k) => q && movable(q) && st.slots[k] !== q);
      if (i < 0) { say.textContent = "The one who dreams hums along: he has nothing to add."; return; }
      st.hints--;
      const p = target[i]; st.ghost = { p, slot: i }; st.sel = p;
      if (st.slots.includes(p)) st.slots[st.slots.indexOf(p)] = null;
      say.textContent = `The one who dreams hums a placement for slot ${i + 1}. Tap the slot to accept.`; redraw();
      beats.show("He hums it once, low, and looks at the slot.", 2600, null, "The one who dreams");
    }

    // ---- singing --------------------------------------------------------------------------------
    function sing() {
      if (st.over || !canSing()) return;
      if (st.playing) { cancelAnimationFrame(st.playing.raf); st.playing = null; }
      if (st.verse === 1) {
        st.slots = companionFill(st.slots, phrases); st.sel = null; st.ghost = null;
        st.v1 = st.slots.slice(); st.v1h = harmony(st.slots); st.lastHeight = st.v1[7].notes[3];
        say.textContent = "Your brothers fill the empty slots, and the four of you sing it whole.";
        st.over = true; redraw();
        const next = () => {
          if (st.v1h <= 40) return finish();
          st.over = false; st.verse = 2; st.heart = makeHeart(st.lastHeight); st.slots = [null, null, null, null]; st.time = 120; st.hints = 2;
          say.textContent = `Verse one: harmony ${st.v1h}. Now the heart verse: start near ${st.lastHeight}, end home on 1.`;
          beats.show(BROTHERS, 7000, "brothers", "Days later · a calm pool on the river");
          timers.push(setTimeout(() => beats.show("The heart verse: one phrase from each of you, in an order you choose. It must begin near where verse one ended, and end home, on the lowest bead.", 6000, "heart2", "The heart verse"), RM ? 0 : 7200));
          redraw();
        };
        if (audio && !RM) listen(st.slots, next); else timers.push(setTimeout(next, 900));
      } else {
        st.over = true; redraw();
        say.textContent = "The four of you sing it, quietly, so the river will not hear.";
        if (audio && !RM) listen(st.slots, finish); else finish();
      }
    }
    function finish() {
      st.over = true;
      const h1 = st.v1h, sc2 = st.verse === 2 ? score(st.slots) : null;
      if (h1 <= 40) {
        api.end({ outcome: "lose", text: `Verse one: harmony ${h1}. It breaks in too many places to row to; on the river every brother's window will narrow by 10 ms. There is no heart verse to sing.` });
        return;
      }
      const home = sc2 && sc2.breaks === 0 && sc2.h >= 68;
      const v1word = h1 >= 75 ? "true" : "rough";
      const mine = st.v1.filter((p) => p && p.seat === 0).length;
      const t1 = h1 >= 75 ? `Verse one sings true (${h1}): on the river every brother's window widens by 15 ms.` : `Verse one is a song you can row to (${h1}), though not a true one.`;
      const t2 = (st.auto ? " The pool ran out before you chose, and your brothers set the heart verse themselves." : "") + (home ? ` The heart verse comes home without a stumble (${sc2.h}); its last note falls on the sixteenth beat.` : ` The heart verse comes home, though it stumbles on the way (${sc2.h}).`);
      api.end({ outcome: v1word === "true" && home && !st.auto ? "win" : "done", text: `${t1}${t2} ${mine === 1 ? "One of verse one's phrases is" : `${mine} of verse one's phrases are`} yours.` });
    }

    on(intro.querySelector("." + P + "start"), "click", () => {
      intro.remove(); st.started = true;
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      beats.show("“Sing it whole.”", 2600, "elder", "The elder");
      say.textContent = "Tap one of your blue phrases, then an empty slot.";
      const f = trays.querySelector("button:not(:disabled)"); f && f.focus();
    });
    on(wrap, "keydown", (e) => {
      if (!st.started || st.over) return;
      const k = e.key.toLowerCase();
      if (k === "l") listen(st.slots.slice()); else if (k === "h") hint(); else if (k === "s" && !singBtn.disabled) sing();
    });
    timers.push(setInterval(() => {
      if (!st.started || st.over) return;
      st.time -= 1;
      timerEl.textContent = `${Math.floor(st.time / 60)}:${String(st.time % 60).padStart(2, "0")}`;
      if (st.time === 30) beats.show(st.verse === 1 ? "The soft timer is nearly out; your brothers will fill the verse." : "The pool is ending. The current takes the raft again soon.", 3200);
      if (st.time <= 0) {
        if (st.verse === 1) { if (!st.slots.some((p) => p && p.seat === 0)) { const p = phrases.find((q) => q.seat === 0); const i = st.slots.indexOf(null); st.slots[i] = p; } }
        else { st.slots = st.heart.chain.slice(); st.auto = true; }
        sing();
      }
    }, 1000));
    const mq = matchMedia("(max-width: 640px)");
    const onMq = () => { narrow = mq.matches; drawMem(); };
    on(mq, "change", onMq); narrow = mq.matches;
    redraw();
    timerEl.textContent = "3:00";

    return {
      unmount() {
        timers.forEach((id) => { clearInterval(id); clearTimeout(id); });
        if (st.playing) cancelAnimationFrame(st.playing.raf);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  },
};

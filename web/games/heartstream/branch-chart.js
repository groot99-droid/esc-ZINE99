// A Journey Into the Heartstream, 1D game: The Branch Chart (DESIGN.md section 11, `g1_chart`).
// Red-ink anatomical plate: fine red vessels branching on vellum from a glowing point, the raft.
// Both charts back to back: `s1_chart_1` (2 junctions of 3 branches, 30 s) then `s1_chart_2`, the
// delta (3 junctions of 3, 3 and 4 branches, 20 s, one or two patrols). Solo: you are the one who
// laughs and carry the awl (true); the others vote by temperament (DESIGN.md section 12): the one who
// argues takes the strongest current, the one who dreams a calm pool or the widest, and the one who
// fears feels one patrol at each junction (it is marked for everyone) and sets his piece on a patrol-free
// branch; the other two keep off the vessel he has marked.
//
// Actions: Vote (set your piece on a branch); Listen (hold on a branch three seconds: a pulse off
// the heart's beat means a beast, right seven times in ten); the Awl (once per chart: every patrol at
// this junction); Let the current decide (close the vote now; the raft is moving).
//
// Phase 1 of the accepted development (DESIGN.md "Accepted development (2026-11-15)", DEEP_DIVE.md
// sections 2 and 3): the Fourth Branch. At the last fork the fourth way is drawn in another hand's
// ink and has no current. Nobody votes for it unless you listen to it (no pulse at all, not even the
// heart's): then the one who dreams sets his piece beside yours, and two pieces can carry it. It leads
// to the backwater and the Finished Board, which you look over and leave; the raft comes back to the
// fork with less time. Its lines are written for the game, not the author's text.
//
// Art (api.art): the two plates (the whole chart, small), the eight branch glyphs, the four counter
// pieces as votes, the four seat portraits, chapter cards 6 and 8, and the Finished Board. Each falls
// back to the mode's own drawing when the id is missing.
//
// Lines shown, verbatim (DESIGN.md section 3):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "branching vessels split like river deltas"
//   "The river grows narrower. / The current grows faster. / The heart draws near."
//   "The body simply moves them on."

import { howTo, Beats, Streak, flourish, disposeKit, artUrl, artImg, pngUrl, plate, endCard } from "./_kit.js";

const GREY = "#8C7A78"; // the backwater's ink, used nowhere else
const PIECES = ["ring", "notch", "spiral", "wave"], TEMPERS = ["laughs", "argues", "dreams", "fears"];
const C = { red: "#9e1b24", faint: "#c98a7e", vellum: "#f1e4c6", ink: "#3a2a20", bone: "#E8DCC4", glow: "#E0603A", gold: "#F2B544" };
const SEATS = [
  { name: "You", col: "#2F5D8C" },
  { name: "Argues", col: "#8a4a5a" },
  { name: "Dreams", col: "#6a5a8a" },
  { name: "Fears", col: "#1E3557" },
];
const JUNCTIONS = [{ chart: 1, n: 3, time: 30 }, { chart: 1, n: 3, time: 30 }, { chart: 2, n: 3, time: 20 }, { chart: 2, n: 3, time: 20 }, { chart: 2, n: 4, time: 20, back: true }];

export default {
  mount(root, api) {
    const P = "heartstream-branch-chart-";
    const rng = api.rng();
    const RM = api.reducedMotion;
    const streak = new Streak(api);
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const gentle = streak.losses >= 2; // after two losses: listening is always right

    // ---- the vessels ahead ----------------------------------------------------------------------
    function makeJunction(def, idx) {
      for (;;) {
        const bs = Array.from({ length: def.back ? def.n - 1 : def.n }, (_, i) => ({ id: "abcd"[i], current: 1 + Math.floor(rng() * 3), tendrils: Math.floor(rng() * 4),
          width: ["wide", "normal", "narrow"][Math.floor(rng() * 3)], calm: rng() < 0.3, patrol: false, heard: null, felt: false }));
        const np = def.chart === 1 ? 1 : 1 + (rng() < 0.6 ? 1 : 0);
        const order = bs.map((_, i) => i).sort(() => rng() - 0.5);
        order.slice(0, np).forEach((i) => { bs[i].patrol = true; });
        // the strongest current should not always be safe, or the tie-break would decide for you
        const strong = Math.max(...bs.map((b) => b.current));
        if (bs.some((b) => !b.patrol) && (idx < 1 || bs.some((b) => b.patrol && b.current === strong))) {
          bs[order[0]].felt = true; // the one who fears feels one patrol
          // the Fourth Branch: another hand's ink, no current, nothing in it
          if (def.back) bs.push({ id: "d", current: 0, tendrils: 0, width: "normal", calm: false, patrol: false, heard: null, felt: false, back: true });
          return { ...def, idx, branches: bs };
        }
      }
    }
    const route = JUNCTIONS.map(makeJunction);
    if (!route.slice(2).some((j) => j.branches.some((b) => b.calm))) { const j = route[2 + Math.floor(rng() * 3)]; j.branches.find((b) => !b.patrol).calm = true; }

    const st = { started: false, over: false, j: 0, time: 0, votes: [null, null, null, null], awl: { 1: false, 2: false }, revealed: false,
      holding: null, phase: "vote", taken: [], sweep: null, listened: 0, awlUsed: 0, backHeard: false, sawBoard: false, looked: {} };
    // the art, rasterised once (the SVG below is rebuilt many times a second)
    const png = {};
    const want = [["chart-plate-vi", 480, 330], ["chart-plate-vii", 480, 330], ...PIECES.map((m) => ["counter-" + m, 96, 96]),
      ...["calm-pool", "current-1", "current-2", "current-3", "listen", "narrow", "patrol", "tendrils"].map((k) => ["glyph-" + k, 96, 96])];
    want.forEach(([id, w, h]) => pngUrl(api, id, w, h).then((u) => { png[id] = u; if (st.started && !st.over) draw(); }));

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.vellum};color:${C.ink};font-family:var(--g-display);display:flex;flex-direction:column;padding:10px;box-sizing:border-box;user-select:none;-webkit-user-select:none;
  background-image:radial-gradient(ellipse at 30% 20%,rgba(200,168,116,.22),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(200,168,116,.18),transparent 55%)}
.${P}top{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.${P}top h2{margin:0;font-size:clamp(18px,2.6vw,26px);letter-spacing:.24em;color:${C.red};font-weight:500;flex:1 1 auto}
.${P}btn{font:600 15px var(--g-display);color:${C.red};background:rgba(241,228,198,.9);border:1.5px solid ${C.red};padding:7px 12px;cursor:pointer;min-height:42px}
.${P}btn:hover:not(:disabled){background:#fff5dc}
.${P}btn[aria-pressed=true]{background:${C.red};color:${C.vellum}}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}btn[hidden]{display:none}
.${P}btn small{font-size:13px;opacity:.8}
.${P}say{font-style:italic;min-height:1.4em;font-size:17px;margin:4px 0}
.${P}wrap svg{flex:1 1 auto;min-height:0;width:100%;touch-action:none}
.${P}br{cursor:pointer;outline:none}
.${P}dark{animation:${P}dk .6s}
@keyframes ${P}dk{40%{filter:brightness(.7) sepia(.4)}}
.${P}caps{list-style:none;margin:2px 0 0;padding:0;font-size:14px;font-style:italic;color:${C.red};line-height:1.35}
.${P}caps[hidden]{display:none}
.${P}br:hover .${P}hit{stroke-opacity:.18}
.${P}br:focus .${P}hit{stroke:${C.gold};stroke-opacity:.45}
.${P}beat{position:absolute;left:50%;top:70px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:12px 18px;background:${C.vellum};border:1.5px solid ${C.red};outline:1px solid ${C.red};outline-offset:4px;font-size:19px;line-height:1.35;text-align:center;font-style:italic;color:${C.ink};white-space:pre-line;z-index:6}
.${P}beat b{display:block;font-style:normal;font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:${C.red};font-family:var(--g-body)}
.${P}beat.${P}in{animation:${P}ink .6s}
@keyframes ${P}ink{from{opacity:0;filter:blur(2px)}}
.${P}legend{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 16px;font-size:15px;color:${C.ink}}
.${P}legend b{color:${C.red};font-weight:600}
.${P}legend li.${P}new{animation:${P}hl 1.2s 2}
@keyframes ${P}hl{50%{background:rgba(242,181,68,.5)}}
.${P}who{display:flex;gap:4px;align-items:center}
.${P}who img{height:42px;width:auto;border:1.5px solid ${C.red}}
.${P}caps img{height:22px;width:22px;vertical-align:middle;margin-right:2px}
.${P}back{position:absolute;inset:0;z-index:7;background:#2c2526;color:#e9e0d8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;box-sizing:border-box;overflow:auto}
.${P}back .${P}fb{position:relative;max-width:min(100%,900px);flex:0 1 auto}
.${P}back .${P}fb img{display:block;width:100%;height:auto}
.${P}back .${P}fb button{position:absolute;background:rgba(140,122,120,.12);border:2px dashed ${GREY};cursor:pointer;padding:0;font:600 13px var(--g-body);color:#3a3032}
.${P}back .${P}fb button:hover,.${P}back .${P}fb button:focus-visible{background:rgba(242,181,68,.3);outline:3px solid ${C.gold}}
.${P}back .${P}fb button[data-seen]{border-style:solid;background:transparent}
.${P}back p{margin:0;max-width:640px;text-align:center;font-size:18px;line-height:1.4;font-style:italic;min-height:2.8em}
.${P}back .${P}go{font:600 16px var(--g-display);color:#2c2526;background:#e9e0d8;border:0;padding:10px 22px;cursor:pointer;min-height:44px}
.${P}back .${P}go:disabled{opacity:.4;cursor:default}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(241,228,198,.88);z-index:8;overflow:auto}
.${P}card{position:relative;max-width:580px;width:100%;box-sizing:border-box;background:${C.vellum};border:1.5px solid ${C.red};outline:1px solid ${C.red};outline-offset:5px;padding:22px 24px 20px}
.${P}card::after{content:"";position:absolute;right:16px;top:18px;width:90px;height:70px;opacity:.5;background:
  linear-gradient(20deg,transparent 48%,${C.red} 49% 51%,transparent 52%),linear-gradient(-20deg,transparent 48%,${C.red} 49% 51%,transparent 52%),linear-gradient(0deg,transparent 49%,${C.red} 49.5% 50.5%,transparent 51%)}
.${P}kick{font:600 12px var(--g-body);letter-spacing:.26em;text-transform:uppercase;color:${C.red}}
.${P}card h2{font-size:32px;margin:2px 0 6px;font-weight:500;color:${C.red};letter-spacing:.06em}
.${P}q{font-style:italic;font-size:19px;margin:0 0 10px;color:${C.red}}
.${P}scene{margin:0 0 10px;font-size:16px;line-height:1.45}
.${P}goal{margin:0 0 12px;font-size:17px;line-height:1.4;border-top:1px solid ${C.red};border-bottom:1px solid ${C.red};padding:6px 0}
.${P}goal b{font:600 12px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:${C.red};margin-right:6px}
.${P}keys{list-style:none;margin:0 0 12px;padding:0;display:grid;gap:7px;counter-reset:fig}
.${P}keys li{display:grid;grid-template-columns:76px 1fr;gap:0 10px;font-size:16px;align-items:baseline;counter-increment:fig}
.${P}kv{font-style:italic;color:${C.red}}
.${P}kv::before{content:"Fig. " counter(fig) ". ";font-size:12px;font-style:normal}
.${P}kc{font-weight:600}
.${P}kw{grid-column:2;font-size:15px;font-style:italic}
.${P}extra{font-size:15px;margin:0 0 12px;font-style:italic}
.${P}start{font:600 17px var(--g-display);color:${C.vellum};background:${C.red};border:0;padding:10px 26px;cursor:pointer;letter-spacing:.1em}
@media (max-width:640px){.${P}who img{height:30px}.${P}back p{font-size:16px}.${P}btn{font-size:14px;padding:6px 8px}.${P}beat{top:96px;font-size:17px}.${P}legend{font-size:13px}.${P}keys li{grid-template-columns:70px 1fr}}
`;
    wrap.appendChild(css);
    const top = document.createElement("div"); top.className = P + "top";
    top.innerHTML = `<h2></h2><button type="button" class="${P}btn" data-a="listen" aria-pressed="false" hidden>Listen <small>hold L / hold a branch</small></button><button type="button" class="${P}btn" data-a="awl" hidden>The awl <small>A · once a chart</small></button><button type="button" class="${P}btn" data-a="go" hidden>Let the current decide <small>Enter</small></button>`;
    const say = document.createElement("div"); say.className = P + "say"; say.setAttribute("aria-live", "polite");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const legendEl = document.createElement("ul"); legendEl.className = P + "legend";
    const capsEl = document.createElement("ul"); capsEl.className = P + "caps"; capsEl.hidden = true;
    wrap.append(top, say, svg, capsEl, legendEl);
    const beats = new Beats(P, wrap, RM);
    const intro = howTo(P, {
      kicker: "Chapter six · plate V",
      title: "The Branch Chart",
      quote: "“branching vessels split like river deltas”",
      scene: "The raft drifts toward the first fork. The four of you spread the chart on the tissue and each takes out his counter piece. Something patrols some of these vessels; the chart does not say which.",
      goal: "Choose a way through five junctions to the heart that keeps the raft away from the beasts.",
      keys: [["Vote", "tap a branch · 1–4 · Enter on a focused branch", "most pieces win; a tie goes to the strongest current"],
        ["Read", "arrows, ticks, width, rings", "current, tendrils, narrowness, a calm pool"]],
      extra: `Other ways of knowing come as you need them.${gentle ? " After two hard routes, your listening is sure this time." : ""}`,
    });
    plate(api, intro, P, { card: "chapter-6", numeral: "numeral-6", at: "50% 70%" });
    { // the four at the chart, half turned: the red has reached their wrists
      const who = document.createElement("div"); who.className = P + "who";
      TEMPERS.forEach((t) => { const im = artImg(api, `seat-${t}-turning`, "", "the one who " + t); if (im) who.appendChild(im); });
      if (who.children.length) top.insertBefore(who, top.querySelector("button"));
    }
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const h2 = top.querySelector("h2"), bListen = top.querySelector('[data-a="listen"]'), bAwl = top.querySelector('[data-a="awl"]'), bGo = top.querySelector('[data-a="go"]');
    const legend = { items: new Set(), add(k, v, c, fresh) { if (this.items.has(k)) return false; this.items.add(k); const li = document.createElement("li"); li.innerHTML = `<b></b> <span></span>`; li.querySelector("b").textContent = v; li.querySelector("span").textContent = c; legendEl.appendChild(li); if (fresh) flourish(li, P + "new", RM, 2400); return true; } };

    // ---- geometry: drawn wide, or turned to run down the page when narrow ----------------------
    let narrow = false, VW = 1200, VH = 700, F = 1;
    const T = (x, y) => (narrow ? [y, 30 + x * 0.92] : [x, y]);
    const RX = 90, RY = 350, JX = 400, JY = 350;
    const ends = (n) => Array.from({ length: n }, (_, i) => [940, n === 4 ? 110 + i * 160 : 150 + i * 200]);
    const ctrl = (i, n) => { const [ex, ey] = ends(n)[i]; return [[JX, JY], [JX + 180, JY], [ex - 300, ey], [ex, ey]]; };
    const branchD = (i, n) => { const q = ctrl(i, n).map(([x, y]) => T(x, y)); return `M${q[0]} C${q[1]} ${q[2]} ${q[3]}`; };
    const Wd = { wide: 20, normal: 12, narrow: 6 };
    const pt = (i, n, t) => { const c = ctrl(i, n), u = 1 - t; const x = u * u * u * c[0][0] + 3 * u * u * t * c[1][0] + 3 * u * t * t * c[2][0] + t * t * t * c[3][0]; const y = u * u * u * c[0][1] + 3 * u * u * t * c[1][1] + 3 * u * t * t * c[2][1] + t * t * t * c[3][1]; return T(x, y); };
    const dir = (i, n, t) => { const a = pt(i, n, t), b = pt(i, n, Math.min(1, t + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    function twigs(x, y, ang, len, depth, seed) {
      if (depth === 0 || len < 8) return "";
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      let s = `<path d="M${x.toFixed(1)},${y.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${C.faint}" stroke-width="${depth * 0.5}" fill="none"/>`;
      const r = Math.sin(seed * 12.9898 + depth * 78.233) * 0.5 + 0.5;
      s += twigs(x2, y2, ang - 0.35 - r * 0.3, len * 0.72, depth - 1, seed + 1.3) + twigs(x2, y2, ang + 0.3 + r * 0.3, len * 0.68, depth - 1, seed + 2.7);
      return s;
    }
    const txt = (x, y, s, size, extra = "") => `<text x="${x}" y="${y}" font-size="${size * F}" ${extra}>${s}</text>`;

    // ---- drawing --------------------------------------------------------------------------------
    function draw() {
      if (!route[st.j]) return;
      const J = route[st.j], n = J.branches.length;
      h2.textContent = `PLATE ${J.chart === 1 ? "V" : "VI"} · junction ${st.j + 1} of ${route.length}`;
      svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
      let s = `<rect x="14" y="14" width="${VW - 28}" height="${VH - 28}" fill="none" stroke="${C.red}" stroke-width="2"/><rect x="24" y="24" width="${VW - 48}" height="${VH - 48}" fill="none" stroke="${C.red}" stroke-width=".8"/>`;
      const [rx, ry] = T(RX, RY), [jx, jy] = T(JX, JY);
      s += `<defs><radialGradient id="${P}g"><stop offset="0" stop-color="${C.glow}" stop-opacity=".85"/><stop offset="1" stop-color="${C.glow}" stop-opacity="0"/></radialGradient></defs>`;
      const glowR = 60 + (RM ? 0 : 8 * Math.sin(performance.now() / 160));
      s += `<circle cx="${rx}" cy="${ry}" r="${glowR}" fill="url(#${P}g)"/><path d="M${rx},${ry} L${jx},${jy}" stroke="${C.red}" stroke-width="26" stroke-linecap="round"/><path d="M${rx},${ry} L${jx},${jy}" stroke="${C.vellum}" stroke-width="20" stroke-linecap="round"/>`;
      s += `<circle cx="${rx}" cy="${ry}" r="9" fill="#fff6dc" stroke="${C.red}" stroke-width="2"/>` + txt(rx + 16, ry + (narrow ? 8 : 36), "the raft", 15, `font-style="italic" fill="${C.red}"`);
      J.branches.forEach((b, i) => {
        const d = branchD(i, n), w = Wd[b.width], [ex, ey] = pt(i, n, 1), chosen = st.sweep && st.sweep.win === i, dim = st.sweep && !chosen;
        const ink = b.back ? GREY : C.red;
        const swept = st.sweep && st.sweep.tied && st.sweep.tied.includes(i);
        s += `<g class="${P}br" data-b="${i}" tabindex="0" role="button" aria-label="${b.back ? "Branch d, drawn in another hand's ink: no current" : `Branch ${b.id}: current ${b.current}, tendrils ${b.tendrils}, ${b.width}${b.calm ? ", calm pool" : ""}${b.felt ? ", the one who fears feels a beast" : ""}`}" opacity="${dim ? 0.35 : 1}">`;
        s += `<path class="${P}hit" d="${d}" stroke="${C.gold}" stroke-opacity="0" stroke-width="${narrow ? 90 : 70}" fill="none"/>`;
        s += b.back ? `<path d="${d}" stroke="${GREY}" stroke-width="${w + 3}" fill="none" stroke-linecap="round" stroke-dasharray="14 5 3 5"/><path d="${d}" stroke="${chosen ? "#d9cfc8" : C.vellum}" stroke-width="${Math.max(1, w - 3)}" fill="none" stroke-linecap="round"/>`
          : `<path d="${d}" stroke="${C.red}" stroke-width="${w + 5}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${chosen ? "#ffd9b0" : C.vellum}" stroke-width="${Math.max(1, w - 1)}" fill="none" stroke-linecap="round"/>`;
        if (swept && !RM) s += `<path d="${d}" stroke="${C.glow}" stroke-width="${w + 9}" fill="none" stroke-dasharray="30 900" stroke-dashoffset="${-((performance.now() / 3) % 930)}" stroke-linecap="round"/>`;
        if (b.back) s += `<ellipse cx="${ex + (narrow ? 0 : 34)}" cy="${ey + (narrow ? 34 : 0)}" rx="${narrow ? 30 : 36}" ry="${narrow ? 34 : 26}" fill="none" stroke="${GREY}" stroke-width="3" stroke-dasharray="14 5 3 5"/>`;
        else s += twigs(ex, ey, dir(i, n, 0.99) + (i - (n - 1) / 2) * 0.12, 60, 4, i + st.j * 7);
        for (let k = 0; k < b.current; k++) { const [x, y] = pt(i, n, 0.36 + k * 0.07), a = dir(i, n, 0.36 + k * 0.07); s += `<path d="M-8,-9 L4,0 L-8,9" transform="translate(${x} ${y}) rotate(${(a * 180) / Math.PI})" stroke="${C.red}" stroke-width="2.8" fill="none"/>`; }
        for (let k = 0; k < b.tendrils; k++) { const [x, y] = pt(i, n, 0.62 + k * 0.06); s += `<path d="M${x},${y - w / 2 - 2} q-4,-10 3,-16" stroke="${C.ink}" stroke-width="2" fill="none"/>`; }
        if (b.calm) { const [x, y] = pt(i, n, 0.86); s += `<circle cx="${x}" cy="${y - 26}" r="12" fill="none" stroke="${C.red}" stroke-width="1.8"/><circle cx="${x}" cy="${y - 26}" r="5" fill="none" stroke="${C.red}" stroke-width="1"/>`; }
        s += txt(narrow ? ex - 8 : ex + 18, narrow ? ey + 56 : ey + 8, b.id, 24, `font-style="italic" fill="${ink}"`);
        // the branch's glyphs (art), in a row past its end; narrow screens show them in the caption list instead
        const tiles = glyphsOf(b);
        if (!narrow) tiles.forEach((id, k) => { if (png[id]) s += `<image href="${png[id]}" x="${ex + 52 + k * 44}" y="${ey - 22}" width="42" height="42"/>`; });
        const mx = narrow ? ex - 4 : ex - 40, my = narrow ? ey - 46 : ey - 30;
        if (b.patrol && (st.revealed || (st.sweep && chosen))) s += !narrow && png["glyph-patrol"] ? "" : eye(mx, my);
        else if (st.revealed) s += txt(mx - 18, my + 6, "clear", 14, `fill="${C.ink}" font-style="italic"`);
        if (b.felt && !st.revealed && !(st.sweep && chosen)) s += `<g opacity=".85">${eye(mx, my, true)}</g>` + txt(mx - 40, my - 20, "Fears feels it", 13, `fill="${C.ink}" font-style="italic"`);
        if (b.heard) s += txt(narrow ? ex - 60 : ex - 150, narrow ? ey - 80 : ey + 36, b.heard === "none" ? "no pulse at all" : b.heard === "off" ? "a pulse off the beat" : "only the heart", 15, `font-style="italic" fill="${b.heard === "none" ? GREY : b.heard === "off" ? C.red : C.ink}"`);
        if (st.holding && st.holding.b === i) { const f = Math.min(1, (performance.now() - st.holding.t) / 3000), cx = narrow ? ex : ex - 60, cy = narrow ? ey - 100 : ey; s += `<circle cx="${cx}" cy="${cy}" r="24" fill="${C.vellum}" stroke="${C.faint}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="${C.red}" stroke-width="4" stroke-dasharray="${(f * 151).toFixed(1)} 200" transform="rotate(-90 ${cx} ${cy})"/>`; }
        s += `</g>`;
      });
      const counts = {};
      st.votes.forEach((v, seat) => {
        let x, y;
        if (v == null) { [x, y] = narrow ? [470 + seat * 54, VH - 150] : [470 + seat * 54, 630]; }
        else { const k = (counts[v] = (counts[v] || 0) + 1) - 1; [x, y] = pt(v, n, 0.26 + k * 0.08); y -= 22; }
        s += piece(x, y, seat);
      });
      // the timer: a pulse line that shortens
      const f = Math.max(0, st.time / J.time), len = (narrow ? 300 : 380) * f, [tx, ty] = narrow ? [60, VH - 150] : [60, 640];
      s += `<path d="M${tx},${ty} ${pulse(tx, ty, len)}" stroke="${f < 0.3 ? C.glow : C.red}" stroke-width="${f < 0.3 ? 3 : 2}" fill="none"/><circle cx="${tx + len}" cy="${ty}" r="5" fill="${C.red}"/>`;
      s += txt(tx, ty + 30, `${Math.ceil(Math.max(0, st.time))} s · the raft is moving`, 14, `font-style="italic" fill="${C.ink}"`);
      // captions, plate style
      const cap = J.branches.map((b) => (b.back ? "Fig. d  in another hand's ink; no current; no name" : `Fig. ${b.id}  ${["", "slow", "steady", "strong"][b.current]} current; ${b.tendrils ? b.tendrils + " tendril" + (b.tendrils > 1 ? "s" : "") : "no tendrils"}; ${b.width}${b.calm ? "; calm pool" : ""}`));
      const list = narrow || n === 4; // four branches leave no room on the plate: the captions go under it
      if (!list) cap.forEach((t, i) => { s += txt(1150, 590 + i * 22 - (n - 3) * 22, t, 15, `text-anchor="end" font-style="italic" fill="${J.branches[i].back ? GREY : C.red}"`); });
      capsEl.hidden = !list; if (list) { const k = cap.join("|") + J.branches.map((b) => glyphsOf(b).join(",")).join("|"); if (capsEl.dataset.k !== k) { capsEl.dataset.k = k; capsEl.innerHTML = ""; cap.forEach((t, i) => { const li = document.createElement("li"); glyphsOf(J.branches[i]).forEach((id) => { const im = artImg(api, id); if (im) li.appendChild(im); }); li.appendChild(document.createTextNode(" " + t)); if (J.branches[i].back) li.style.color = GREY; capsEl.appendChild(li); }); } }
      // the whole chart, small: the plate this junction is on
      { const pid = J.chart === 1 ? "chart-plate-vi" : "chart-plate-vii";
        if (png[pid]) { const [px, py, pw] = narrow ? [468, 150, 212] : [40, 424, 250]; s += `<image href="${png[pid]}" x="${px}" y="${py}" width="${pw}" height="${pw * 0.6875}"/><rect x="${px}" y="${py}" width="${pw}" height="${pw * 0.6875}" fill="none" stroke="${C.red}" stroke-width="1.5"/>`; } }
      st.taken.forEach((t, i) => { s += txt(40, (narrow ? 70 : 60) + i * 24 * F, `${i + 1}. ${t.id}${t.patrol ? " · patrol" : ""}${t.calm ? " · calm" : ""}`, 15, `fill="${t.patrol ? C.red : C.ink}" font-style="italic"`); });
      const fb = document.activeElement && document.activeElement.closest && document.activeElement.closest("." + P + "br");
      const keep = fb && svg.contains(fb) ? fb.dataset.b : null;
      svg.innerHTML = s;
      if (keep != null) { const g = svg.querySelector(`[data-b="${keep}"]`); g && g.focus({ preventScroll: true }); }
      bAwl.disabled = st.awl[J.chart] || st.phase !== "vote";
      bListen.disabled = st.phase !== "vote";
      bGo.disabled = st.phase !== "vote" || st.votes[0] == null;
    }
    const pulse = (x0, y, len) => { let d = "", x = x0; while (x < x0 + len - 40) { d += `L${x + 14},${y} L${x + 20},${y - 18} L${x + 26},${y + 12} L${x + 30},${y} `; x += 40; } return d + `L${x0 + len},${y}`; };
    const eye = (x, y, ghost) => `<path d="M${x - 18},${y} Q${x},${y - 13} ${x + 18},${y} Q${x},${y + 13} ${x - 18},${y}Z" fill="${ghost ? "none" : C.gold}" stroke="${C.ink}" stroke-width="1.8" ${ghost ? 'stroke-dasharray="3 3"' : ""}/><circle cx="${x}" cy="${y}" r="4.5" fill="${C.ink}"/>`;
    const glyphsOf = (b) => {
      if (b.back) return b.heard ? ["glyph-listen"] : [];
      const g = ["glyph-current-" + b.current];
      if (b.tendrils) g.push("glyph-tendrils"); if (b.width === "narrow") g.push("glyph-narrow"); if (b.calm) g.push("glyph-calm-pool");
      if (b.heard) g.push("glyph-listen");
      if (b.patrol && (st.revealed || (st.sweep && st.sweep.win === route[st.j].branches.indexOf(b)))) g.push("glyph-patrol");
      return g;
    };
    const piece = (x, y, seat) => png["counter-" + PIECES[seat]]
      ? `<g><clipPath id="${P}pc${seat}"><circle cx="${x}" cy="${y - 2}" r="19"/></clipPath><image href="${png["counter-" + PIECES[seat]]}" x="${x - 22}" y="${y - 24}" width="44" height="44" clip-path="url(#${P}pc${seat})"/><circle cx="${x}" cy="${y - 2}" r="19" fill="none" stroke="${seat === 0 ? C.gold : SEATS[seat].col}" stroke-width="${seat === 0 ? 4 : 3}"/>${txt(x, y + 36, SEATS[seat].name.toLowerCase(), 13, `text-anchor="middle" fill="${C.ink}"`)}</g>`
      : `<g><path d="M${x - 15},${y + 16} Q${x - 18},${y - 18} ${x},${y - 22} Q${x + 18},${y - 18} ${x + 15},${y + 16}Z" fill="${C.bone}" stroke="${seat === 0 ? C.red : C.ink}" stroke-width="${seat === 0 ? 3 : 2.2}"/><circle cx="${x}" cy="${y - 4}" r="6" fill="${SEATS[seat].col}"/>${txt(x, y + 36, SEATS[seat].name.toLowerCase(), 13, `text-anchor="middle" fill="${C.ink}"`)}</g>`;

    // ---- the companions vote by temperament -----------------------------------------------------
    function companions() {
      const J = route[st.j], bs = J.branches;
      // Nobody sets his piece on the vessel the one who fears has marked, and he himself stands on a
      // patrol-free branch (DESIGN.md sections 11 and 12). Before this the three could carry the raft into
      // a patrol against any one vote.
      const open = (b) => !b.felt && !b.back, first = bs.findIndex(open);
      const strongest = () => bs.reduce((a, b, i) => (open(b) && b.current > bs[a].current ? i : a), first);
      const fear = () => { const free = bs.map((b, i) => (b.patrol || b.back ? -1 : i)).filter((i) => i >= 0); return free[Math.floor(rng() * free.length)]; };
      const dream = () => { if (st.backHeard && !st.sawBoard) { const k = bs.findIndex((b) => b.back); if (k >= 0) return k; } const calm = bs.findIndex((b) => b.calm && open(b)); return calm >= 0 ? calm : bs.reduce((a, b, i) => (open(b) && Wd[b.width] > Wd[bs[a].width] ? i : a), first); };
      const T0 = J.time * 1000;
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[3] = fear(); say.textContent = "The one who fears sets his piece first, away from the vessel he feels."; draw();
        if (legend.add("listen", "Listen", "hold L on a focused branch · hold a branch after pressing Listen", true)) { bListen.hidden = false; beats.show("He only feels one. Hold your ear to a branch for three seconds: a beast's pulse is off the heart's beat. You will be right seven times in ten.", 5600, "listen", "New · Listen"); } } }, Math.min(2500, T0 * 0.1));
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[2] = dream(); draw(); } }, T0 * 0.25);
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[1] = strongest(); draw(); } }, T0 * 0.4);
    }

    // ---- a junction -----------------------------------------------------------------------------
    function openJunction() {
      const J = route[st.j];
      st.votes = [null, null, null, null]; st.revealed = false; st.sweep = null; st.phase = "vote"; st.time = J.time; st.listenMode = false; bListen.setAttribute("aria-pressed", "false");
      if (st.j === 1 && legend.add("awl", "The awl", "A · once a chart", true)) { bAwl.hidden = false; beats.show("The awl you were given has a point that finds what hides. Once on each chart it shows every patrol at a junction.", 5200, "awl", "New · The awl"); }
      if (st.j === 2) beats.show("The river grows narrower.\nThe current grows faster.\nThe heart draws near.", 6200, "delta", "Plate VI · the delta");
      if (st.j === 4 && !st.sawBoard) beats.show("Four ways at the last fork, and only twenty heartbeats to choose. The fourth is drawn in another ink, by another hand. It has no arrows.", 5200, "four");
      say.textContent = st.j === 2 ? "The delta: twenty seconds a junction, and some forks hide two beasts." : `Junction ${st.j + 1}. The raft keeps moving while the page is open.`;
      companions(); draw();
    }
    function decide() {
      if (st.phase !== "vote") return;
      st.phase = "sweep"; st.holding = null;
      const J = route[st.j], bs = J.branches, tally = bs.map(() => 0);
      st.votes.forEach((v) => { if (v != null) tally[v]++; });
      const topV = Math.max(...tally), tied = tally.map((t, i) => (t === topV ? i : -1)).filter((i) => i >= 0);
      let win = tied[0], tie = tied.length > 1;
      if (tie) { const mx = Math.max(...tied.map((i) => bs[i].current)); const strong = tied.filter((i) => bs[i].current === mx); win = strong[Math.floor(rng() * strong.length)]; }
      st.sweep = { win, tied: tie ? tied : null };
      const b = bs[win];
      if (b.back) {
        say.textContent = "Branch d. The water slows, and then it does not move at all.";
        draw(); animate();
        return later(backwater, RM ? 900 : 2200);
      }
      st.taken.push({ id: b.id, patrol: b.patrol, calm: b.calm, current: b.current, tendrils: b.tendrils, narrow: b.width === "narrow", mine: st.votes[0] === win, tie });
      if (tie) beats.show("The body simply moves them on.", 3200, null, "A tie · the strongest current takes it");
      say.textContent = `Branch ${b.id}${b.patrol ? ": a beast patrols it." : ": no patrol."}${b.calm ? " A calm pool." : ""}`;
      if (b.patrol) flourish(svg, P + "dark", RM, 600);
      if (b.patrol && st.taken.filter((t) => t.patrol).length === 1) later(() => beats.show("Below the raft, something long turns its eye up toward the tissue. Everyone stops talking.", 4200, "firstpatrol"), 900);
      if (b.calm) later(() => beats.show("A calm pool. For a minute nobody rows, and you make the others laugh.", 4000, "calm"), 900);
      draw(); animate();
      later(() => { st.j++; if (st.j >= route.length) finish(); else openJunction(); }, RM ? 1800 : 2900);
    }
    // ---- phase 1: the backwater and the Finished Board -------------------------------------------
    let backEl = null;
    const LOOKS = { left: "A keep, heaped. Fifteen counters, and fifteen cuts in the rim beside it: somebody counted.",
      right: "The other keep, heaped the same. Both keeps are full. Nobody is here to say who won.",
      gifts: "Four gifts in a row, dry and grey: a hook, an awl, a comb, a flute. Nobody took them along." };
    function backwater() {
      st.phase = "back"; st.sawBoard = true; cancelAnimationFrame(araf);
      backEl = document.createElement("div"); backEl.className = P + "back"; backEl.setAttribute("role", "dialog"); backEl.setAttribute("aria-label", "The backwater: the Finished Board");
      const url = artUrl(api, "counters-finished-board");
      backEl.innerHTML = `<div class="${P}fb">${url ? `<img alt="An old raft, grey. On it a board with every hollow empty and both keeps full, and four gifts in a row." src="${url}">` : `<div style="aspect-ratio:16/9;width:min(100vw,900px);background:#e3d9d2"></div>`}
<button type="button" data-l="left" style="left:9%;top:20%;width:12.5%;height:46%" aria-label="Look at the left keep"></button>
<button type="button" data-l="right" style="left:78.5%;top:20%;width:12.5%;height:46%" aria-label="Look at the right keep"></button>
<button type="button" data-l="gifts" style="left:27%;top:78%;width:46%;height:14%" aria-label="Look at the four gifts"></button></div>
<p aria-live="polite">A backwater with no current. An old raft is moored here, grey, and nobody is on it. Look at what they left: the two keeps, and the row beside the board.</p>
<button type="button" class="${P}go" disabled>Row back to the fork <small>Enter</small></button>`;
      wrap.appendChild(backEl);
      on(backEl, "click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.l) lookAt(b.dataset.l); else if (!b.disabled) leaveBack();
      });
      backEl.querySelector("button").focus();
    }
    function lookAt(k) {
      if (!backEl) return;
      st.looked[k] = true; backEl.querySelector(`[data-l="${k}"]`).setAttribute("data-seen", "1");
      const all = Object.keys(LOOKS).every((x) => st.looked[x]);
      backEl.querySelector("p").textContent = LOOKS[k] + (all ? " They stopped here to stay together, and played to the end. The body moved them on anyway." : "");
      if (all) { const go = backEl.querySelector("." + P + "go"); go.disabled = false; go.focus(); }
    }
    function leaveBack() {
      if (!backEl) return;
      backEl.remove(); backEl = null;
      // back at the fork: the fourth branch is gone from the choice, and the detour has cost time
      const J = route[st.j]; J.branches = J.branches.filter((b) => !b.back); J.time = 12;
      beats.show("Nobody speaks. The oars find the current again, and the fork is in front of you, three ways wide.", 4600, "backout", "Out of the backwater");
      openJunction();
      const g = svg.querySelector("." + P + "br"); g && g.focus();
    }
    let araf = 0;
    function animate() { cancelAnimationFrame(araf); if (RM) return; const tick = () => { if (st.phase !== "sweep") return; draw(); araf = requestAnimationFrame(tick); }; araf = requestAnimationFrame(tick); }
    function finish() {
      st.over = true; st.phase = "done"; cancelAnimationFrame(araf);
      const t = st.taken, patrols = t.filter((x) => x.patrol).length, calms = t.filter((x) => x.calm).length;
      const tend = t.reduce((a, x) => a + [0, 2, 4, 6][x.tendrils], 0), secs = t.reduce((a, x) => a + [0, 20, 0, -20][x.current], 0), folds = t.filter((x) => x.narrow).length * 2;
      const outcome = patrols === 0 ? "win" : patrols >= 2 ? "lose" : "done";
      streak.record(outcome);
      const sum = `Route ${t.map((x) => x.id).join("–")}: ${calms} calm pool${calms === 1 ? "" : "s"}, ${tend} tendrils, ${folds} extra folds, ${secs > 0 ? "+" : ""}${secs} s on the river.`;
      const yours = t.filter((x) => x.mine).length;
      const lead = outcome === "win" ? `A way to the heart with no beast in it. Your piece stood on ${yours} of the five branches taken.`
        : outcome === "lose" ? `The route runs through ${patrols} patrols. On the river the eyes will open over the raft again and again, and somebody will be noticed.`
        : "One beast on the way. The raft will have to hush, and hold still, and hope.";
      const board = st.sawBoard ? " You have seen the only finished game in the world, and you know why no one finishes: an unfinished game is a group still playing, somewhere." : "";
      endCard(wrap, api, outcome === "win" ? "chapter-8" : "chart-plate-vii", outcome === "win" ? { numeral: "numeral-8" } : { numeral: "numeral-7" });
      api.end({ outcome, text: `${lead} ${sum}${board}` });
    }

    // ---- input ----------------------------------------------------------------------------------
    function vote(i) { if (st.phase !== "vote" || !st.started) return; st.votes[0] = i; say.textContent = `Your piece stands on branch ${route[st.j].branches[i].id}.`;
      if (legend.add("go", "Let the current decide", "Enter · close the vote now", true)) { bGo.hidden = false; } draw(); }
    function startListen(i) {
      if (st.phase !== "vote") return;
      const b = route[st.j].branches[i];
      if (b.heard) { say.textContent = `You have listened to ${b.id} already.`; return; }
      st.holding = { b: i, t: performance.now() };
      say.textContent = `Listening to ${b.id}… hold still.`; draw();
    }
    function stopListen() { if (st.holding) { st.holding = null; say.textContent = "You let go too soon. Hold for three seconds."; draw(); } }
    let downAt = null;
    on(svg, "pointerdown", (e) => {
      const g = e.target.closest("." + P + "br");
      if (!st.started || st.phase !== "vote" || !g) return;
      e.preventDefault();
      if (st.listenMode) { startListen(+g.dataset.b); return; }
      downAt = { b: +g.dataset.b, t: performance.now() };
      vote(+g.dataset.b);
    });
    on(svg, "pointerup", () => { downAt = null; if (st.holding) stopListen(); });
    on(svg, "pointerleave", () => { downAt = null; if (st.holding) stopListen(); });
    on(top, "click", (e) => {
      const b = e.target.closest("button"); if (!b || !st.started) return;
      if (b.dataset.a === "listen") { st.listenMode = !st.listenMode; bListen.setAttribute("aria-pressed", String(st.listenMode)); say.textContent = st.listenMode ? "Now hold a branch for three seconds to hear what swims in it." : ""; }
      if (b.dataset.a === "awl") useAwl();
      if (b.dataset.a === "go") decide();
    });
    function useAwl() { const J = route[st.j]; if (st.awl[J.chart] || st.phase !== "vote" || bAwl.hidden) return; st.awl[J.chart] = true; st.revealed = true; st.awlUsed++; say.textContent = "The awl's point finds every patrol at this junction."; draw(); }
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      if (st.phase === "back") { const k = e.key.toLowerCase(); if (k === "enter" && backEl && !backEl.querySelector("." + P + "go").disabled) { e.preventDefault(); leaveBack(); } else if (/^[1-3]$/.test(k)) lookAt(Object.keys(LOOKS)[+k - 1]); return; }
      const n = route[st.j] ? route[st.j].branches.length : 0;
      const d = parseInt(e.key, 10);
      if (d >= 1 && d <= n) { vote(d - 1); const g = svg.querySelector(`[data-b="${d - 1}"]`); g && g.focus({ preventScroll: true }); return; }
      const f = document.activeElement && document.activeElement.closest && document.activeElement.closest("." + P + "br");
      const k = e.key.toLowerCase();
      if ((k === " ") && f) { e.preventDefault(); vote(+f.dataset.b); }
      else if (k === "enter" && f && st.votes[0] !== +f.dataset.b) { e.preventDefault(); vote(+f.dataset.b); }
      else if (k === "enter" && st.votes[0] != null && !bGo.hidden) { e.preventDefault(); decide(); }
      if (k === "l" && !e.repeat && !bListen.hidden) { const tgt = f ? +f.dataset.b : st.votes[0]; if (tgt != null) startListen(tgt); }
      if (k === "a" && !bAwl.hidden) useAwl();
    });
    on(window, "keyup", (e) => { if (e.key.toLowerCase() === "l") stopListen(); });
    on(intro.querySelector("." + P + "start"), "click", () => {
      intro.remove(); st.started = true; last = performance.now();
      legend.add("vote", "Vote", "tap a branch · 1–4");
      openJunction();
      const g = svg.querySelector("." + P + "br"); g && g.focus();
    });

    // ---- clock ----------------------------------------------------------------------------------
    let last = performance.now();
    timers.push(setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      if (!st.started || st.over || st.phase !== "vote") return;
      st.time -= dt;
      if (st.holding && now - st.holding.t >= 3000) {
        const b = route[st.j].branches[st.holding.b];
        const truth = b.patrol ? "off" : "on", heard = b.back ? "none" : gentle || rng() < 0.7 ? truth : truth === "off" ? "on" : "off";
        b.heard = heard; st.holding = null; st.listened++;
        say.textContent = heard === "none" ? "In d, nothing. No pulse at all, not even the heart's." : heard === "off" ? `In ${b.id}, a pulse off the heart's beat.` : `In ${b.id}, only the heart.`;
        if (b.back) { st.backHeard = true; st.votes[2] = route[st.j].branches.indexOf(b); beats.show("You tell them: nothing beats in it. The one who dreams lifts his piece and sets it on the grey line, beside where yours would stand.", 4600, "backheard", "The fourth branch"); }
      }
      if (st.time <= 0) { if (st.votes[0] == null) say.textContent = "Your piece stayed in your hand."; decide(); return; }
      draw();
    }, 100));
    const relayout = () => {
      const nn = wrap.clientWidth < 640 && wrap.clientHeight > wrap.clientWidth;
      narrow = nn; VW = narrow ? 700 : 1200; VH = narrow ? 1110 : 700; F = narrow ? 1.9 : 1; draw();
    };
    const ro = new ResizeObserver(relayout); ro.observe(wrap); relayout();

    return {
      unmount() {
        cancelAnimationFrame(araf);
        timers.forEach((id) => { clearInterval(id); clearTimeout(id); });
        ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        wrap.remove();
      },
    };
  },
};

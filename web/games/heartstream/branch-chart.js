// A Journey Into the Heartstream, 1D game: The Branch Chart (DESIGN.md section 11, `g1_chart`).
// Red-ink anatomical plate: fine red vessels branching on vellum from a glowing point, the raft.
// Both charts back to back: `s1_chart_1` (2 junctions of 3 branches, 30 s) then `s1_chart_2`
// (3 junctions of 3, 3 and 4 branches, 20 s). Solo: you are the one who laughs and carry the awl
// (true); the one who argues, the one who dreams and the one who fears vote by their temperaments.
//
// The tie-break line, verbatim (DESIGN.md section 3, "No goodbye", and section 11):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "The body simply moves them on."

const C = { red: "#9e1b24", faint: "#c98a7e", vellum: "#f1e4c6", ink: "#3a2a20", bone: "#E8DCC4", glow: "#E0603A", gold: "#F2B544" };
const SEATS = [
  { name: "You", col: "#2F5D8C" },
  { name: "Argues", col: "#8a4a5a" },
  { name: "Dreams", col: "#6a5a8a" },
  { name: "Fears", col: "#1E3557" },
];
const JUNCTIONS = [{ chart: 1, n: 3, time: 30 }, { chart: 1, n: 3, time: 30 }, { chart: 2, n: 3, time: 20 }, { chart: 2, n: 3, time: 20 }, { chart: 2, n: 4, time: 20 }];

export default {
  mount(root, api) {
    const P = "heartstream-branch-chart-";
    const rng = api.rng();
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    // ---- the vessels ahead ----------------------------------------------------------------------
    function makeJunction(def, idx) {
      for (;;) {
        const bs = Array.from({ length: def.n }, (_, i) => ({ id: "abcd"[i], current: 1 + Math.floor(rng() * 3), tendrils: Math.floor(rng() * 4),
          width: ["wide", "normal", "narrow"][Math.floor(rng() * 3)], calm: rng() < 0.3, patrol: false, heard: null }));
        const np = def.chart === 1 ? 1 : 1 + (rng() < 0.5 ? 1 : 0);
        const order = bs.map((_, i) => i).sort(() => rng() - 0.5);
        order.slice(0, np).forEach((i) => { bs[i].patrol = true; });
        if (bs.some((b) => !b.patrol)) return { ...def, idx, branches: bs };
      }
    }
    const route = JUNCTIONS.map(makeJunction);
    // at least one calm pool across the delta junctions, on a patrol-free branch
    if (!route.slice(2).some((j) => j.branches.some((b) => b.calm))) { const j = route[2 + Math.floor(rng() * 3)]; j.branches.find((b) => !b.patrol).calm = true; }

    const st = { started: false, over: false, j: 0, time: 0, votes: [null, null, null, null], awl: { 1: false, 2: false }, revealed: false,
      listen: false, holding: null, phase: "vote", taken: [], sweep: null, focus: 0 };

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.vellum};color:${C.ink};font-family:var(--g-display);display:flex;flex-direction:column;padding:10px;box-sizing:border-box;user-select:none;-webkit-user-select:none;
  background-image:radial-gradient(ellipse at 30% 20%,rgba(200,168,116,.22),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(200,168,116,.18),transparent 55%)}
.${P}top{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center}
.${P}top h2{margin:0;font-size:clamp(18px,2.6vw,26px);letter-spacing:.3em;color:${C.red};font-weight:500;flex:1 1 auto}
.${P}btn{font:600 15px var(--g-display);color:${C.red};background:transparent;border:1.5px solid ${C.red};padding:7px 12px;cursor:pointer;min-height:38px}
.${P}btn[aria-pressed=true]{background:${C.red};color:${C.vellum}}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}say{font-style:italic;min-height:1.4em;font-size:16px;margin:4px 0}
.${P}wrap svg{flex:1 1 auto;min-height:0;width:100%;touch-action:none}
.${P}br{cursor:pointer;outline:none}
.${P}br:focus .${P}hit{stroke:${C.gold};stroke-opacity:.8}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(241,228,198,.86);z-index:5}
.${P}card{max-width:540px;background:${C.vellum};border:1.5px solid ${C.red};outline:1px solid ${C.red};outline-offset:5px;padding:20px 22px}
.${P}card h2{font-size:28px;margin:0 0 8px;font-weight:500;color:${C.red};letter-spacing:.06em}
.${P}card p{margin:0 0 10px;line-height:1.45;font-size:17px}
`;
    wrap.appendChild(css);
    const top = document.createElement("div"); top.className = P + "top";
    top.innerHTML = `<h2></h2><button type="button" class="${P}btn" data-a="listen" aria-pressed="false">Listen (hold on a branch)</button><button type="button" class="${P}btn" data-a="awl">Awl: reveal this junction</button><button type="button" class="${P}btn" data-a="go">Let the current decide</button>`;
    const say = document.createElement("div"); say.className = P + "say";
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 1200 700"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    wrap.append(top, say, svg);
    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card"><h2>The Branch Chart</h2>
<p>The vessels ahead split at each junction. Each branch shows its current (arrows), tendrils (ticks), width, and a ring if it has a calm pool. <b>Patrols are hidden.</b></p>
<p><b>Place your piece</b> on a branch: tap it, or drag your piece. Find the beasts by <b>listening</b> (hold on a branch for three seconds; right seven times in ten) or with your <b>awl</b> (once per chart). Most votes wins; a tie goes to the strongest current. Five junctions to the heart: avoid the patrols.</p>
<button type="button" class="${P}btn">Start</button></div>`;
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const h2 = top.querySelector("h2"), bListen = top.querySelector('[data-a="listen"]'), bAwl = top.querySelector('[data-a="awl"]'), bGo = top.querySelector('[data-a="go"]');

    // ---- geometry of a junction -----------------------------------------------------------------
    const RX = 90, RY = 350, JX = 400, JY = 350;
    const ends = (n) => Array.from({ length: n }, (_, i) => [940, n === 4 ? 110 + i * 160 : 150 + i * 200]);
    const branchD = (i, n) => { const [ex, ey] = ends(n)[i]; return `M${JX},${JY} C${JX + 180},${JY} ${ex - 300},${ey} ${ex},${ey}`; };
    const W = { wide: 20, normal: 12, narrow: 6 };
    const pt = (i, n, t) => { const [ex, ey] = ends(n)[i]; const x = [JX, JX + 180, ex - 300, ex], y = [JY, JY, ey, ey];
      const u = 1 - t; return [u * u * u * x[0] + 3 * u * u * t * x[1] + 3 * u * t * t * x[2] + t * t * t * x[3], u * u * u * y[0] + 3 * u * u * t * y[1] + 3 * u * t * t * y[2] + t * t * t * y[3]]; };
    function twigs(x, y, ang, len, depth, seed) {
      if (depth === 0 || len < 8) return "";
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      let s = `<path d="M${x.toFixed(1)},${y.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${C.faint}" stroke-width="${depth * 0.5}" fill="none"/>`;
      const r = Math.sin(seed * 12.9898 + depth * 78.233) * 0.5 + 0.5;
      s += twigs(x2, y2, ang - 0.35 - r * 0.3, len * 0.72, depth - 1, seed + 1.3) + twigs(x2, y2, ang + 0.3 + r * 0.3, len * 0.68, depth - 1, seed + 2.7);
      return s;
    }

    // ---- drawing --------------------------------------------------------------------------------
    function draw() {
      const J = route[st.j], n = J.branches.length;
      h2.textContent = `PLATE ${J.chart === 1 ? "V" : "VI"} · junction ${st.j + 1} of ${route.length}`;
      let s = `<rect x="14" y="14" width="1172" height="672" fill="none" stroke="${C.red}" stroke-width="2"/><rect x="24" y="24" width="1152" height="652" fill="none" stroke="${C.red}" stroke-width=".8"/>`;
      // the raft's glowing point and the trunk
      s += `<defs><radialGradient id="${P}g"><stop offset="0" stop-color="${C.glow}" stop-opacity=".85"/><stop offset="1" stop-color="${C.glow}" stop-opacity="0"/></radialGradient></defs>`;
      s += `<circle cx="${RX}" cy="${RY}" r="60" fill="url(#${P}g)"/><path d="M${RX},${RY} L${JX},${JY}" stroke="${C.red}" stroke-width="26" stroke-linecap="round"/><path d="M${RX},${RY} L${JX},${JY}" stroke="${C.vellum}" stroke-width="20" stroke-linecap="round"/>`;
      s += `<circle cx="${RX}" cy="${RY}" r="9" fill="#fff6dc" stroke="${C.red}" stroke-width="2"/><text x="${RX - 6}" y="${RY + 34}" font-size="15" font-style="italic" fill="${C.red}">the raft</text>`;
      J.branches.forEach((b, i) => {
        const d = branchD(i, n), w = W[b.width], [ex, ey] = ends(n)[i], chosen = st.sweep && st.sweep.win === i, dim = st.sweep && !chosen;
        s += `<g class="${P}br" data-b="${i}" tabindex="0" role="button" aria-label="Branch ${b.id}: current ${b.current}, tendrils ${b.tendrils}, ${b.width}${b.calm ? ", calm pool" : ""}" opacity="${dim ? 0.35 : 1}">`;
        s += `<path class="${P}hit" d="${d}" stroke="${C.gold}" stroke-opacity="0" stroke-width="70" fill="none"/>`;
        s += `<path d="${d}" stroke="${C.red}" stroke-width="${w + 5}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${chosen ? "#ffd9b0" : C.vellum}" stroke-width="${Math.max(1, w - 1)}" fill="none" stroke-linecap="round"/>`;
        s += twigs(ex, ey, -0.1 + (i - (n - 1) / 2) * 0.12, 60, 4, i + st.j * 7);
        // current arrows along the vessel
        for (let k = 0; k < b.current; k++) { const [x, y] = pt(i, n, 0.36 + k * 0.07); s += `<path d="M${x - 7},${y - 8} L${x + 3},${y} L${x - 7},${y + 8}" stroke="${C.red}" stroke-width="2.5" fill="none"/>`; }
        // tendril ticks
        for (let k = 0; k < b.tendrils; k++) { const [x, y] = pt(i, n, 0.62 + k * 0.06); s += `<path d="M${x},${y - w / 2 - 2} q-4,-10 3,-16" stroke="${C.ink}" stroke-width="1.6" fill="none"/>`; }
        // calm pool ring
        if (b.calm) { const [x, y] = pt(i, n, 0.86); s += `<circle cx="${x}" cy="${y - 26}" r="11" fill="none" stroke="${C.red}" stroke-width="1.6"/><circle cx="${x}" cy="${y - 26}" r="5" fill="none" stroke="${C.red}" stroke-width="1"/>`; }
        // label
        s += `<text x="${ex + 18}" y="${ey + 6}" font-size="22" font-style="italic" fill="${C.red}">${b.id}</text>`;
        // what is known of the patrol
        if (b.patrol && (st.revealed || (st.sweep && chosen))) s += eye(ex - 40, ey - 30, true);
        else if (st.revealed) s += `<text x="${ex - 54}" y="${ey - 22}" font-size="13" fill="${C.ink}" font-style="italic">clear</text>`;
        if (b.heard) s += `<text x="${ex - 120}" y="${ey + 34}" font-size="14" font-style="italic" fill="${b.heard === "off" ? C.red : C.ink}">${b.heard === "off" ? "a pulse off the beat" : "only the heart"}</text>`;
        if (st.holding && st.holding.b === i) { const f = Math.min(1, (performance.now() - st.holding.t) / 3000); s += `<circle cx="${ex - 60}" cy="${ey}" r="22" fill="none" stroke="${C.faint}" stroke-width="3"/><circle cx="${ex - 60}" cy="${ey}" r="22" fill="none" stroke="${C.red}" stroke-width="3" stroke-dasharray="${(f * 138).toFixed(1)} 200" transform="rotate(-90 ${ex - 60} ${ey})"/>`; }
        s += `</g>`;
      });
      // votes standing on branches; unplaced pieces wait along the bottom edge
      const counts = {};
      st.votes.forEach((v, seat) => {
        let x, y;
        if (v == null) { x = 470 + seat * 54; y = 640; }
        else { const k = (counts[v] = (counts[v] || 0) + 1) - 1; [x, y] = pt(v, n, 0.3 + k * 0.08); y -= 22; }
        s += piece(x, y, seat);
      });
      s += `<text x="470" y="680" font-size="12" fill="${C.ink}" opacity=".7">pieces: ${SEATS.map((q) => q.name).join(" · ")}</text>`;
      // the timer: a pulse line that shortens
      const f = Math.max(0, st.time / J.time), len = 380 * f;
      s += `<path d="M60,640 ${pulse(60, 640, len)}" stroke="${C.red}" stroke-width="2" fill="none"/><circle cx="${60 + len}" cy="640" r="4" fill="${C.red}"/>`;
      // captions, plate style
      const cap = J.branches.map((b) => `Fig. ${b.id}  ${["", "slow", "steady", "strong"][b.current]} current; ${b.tendrils ? b.tendrils + " tendril" + (b.tendrils > 1 ? "s" : "") : "no tendrils"}; ${b.width}${b.calm ? "; calm pool" : ""}`);
      cap.forEach((t, i) => { s += `<text x="1150" y="${590 + i * 20 - (n - 3) * 20}" font-size="14" text-anchor="end" font-style="italic" fill="${C.red}">${t}</text>`; });
      // the route so far
      st.taken.forEach((t, i) => { s += `<text x="40" y="${60 + i * 22}" font-size="14" fill="${t.patrol ? C.red : C.ink}" font-style="italic">${i + 1}. ${t.id}${t.patrol ? " · patrol" : ""}${t.calm ? " · calm" : ""}</text>`; });
      const fb = document.activeElement && document.activeElement.closest && document.activeElement.closest("." + P + "br");
      const keep = fb && svg.contains(fb) ? fb.dataset.b : null;
      svg.innerHTML = s;
      if (keep != null) { const g = svg.querySelector(`[data-b="${keep}"]`); g && g.focus({ preventScroll: true }); }
      bAwl.disabled = st.awl[J.chart] || st.phase !== "vote";
      bListen.disabled = st.phase !== "vote";
      bGo.disabled = st.phase !== "vote" || st.votes[0] == null;
    }
    const pulse = (x0, y, len) => { let d = "", x = x0; while (x < x0 + len - 40) { d += `L${x + 14},${y} L${x + 20},${y - 18} L${x + 26},${y + 12} L${x + 30},${y} `; x += 40; } return d + `L${x0 + len},${y}`; };
    const eye = (x, y) => `<path d="M${x - 16},${y} Q${x},${y - 12} ${x + 16},${y} Q${x},${y + 12} ${x - 16},${y}Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="4" fill="${C.ink}"/>`;
    const piece = (x, y, seat) => `<g><path d="M${x - 15},${y + 16} Q${x - 18},${y - 18} ${x},${y - 22} Q${x + 18},${y - 18} ${x + 15},${y + 16}Z" fill="${C.bone}" stroke="${C.ink}" stroke-width="2.2"/><circle cx="${x}" cy="${y - 4}" r="6" fill="${SEATS[seat].col}"/>${seat === 0 ? `<text x="${x}" y="${y + 34}" font-size="12" text-anchor="middle" fill="${C.ink}">you</text>` : ""}</g>`;

    // ---- the companions vote by temperament -----------------------------------------------------
    function companions() {
      const J = route[st.j], bs = J.branches;
      const strongest = () => bs.reduce((a, b, i) => (b.current > bs[a].current ? i : a), 0);
      const fear = () => { const free = bs.map((b, i) => (b.patrol ? -1 : i)).filter((i) => i >= 0); return free[Math.floor(rng() * free.length)]; };
      const dream = () => { const calm = bs.findIndex((b) => b.calm); return calm >= 0 ? calm : bs.reduce((a, b, i) => (W[b.width] > W[bs[a].width] ? i : a), 0); };
      const T = J.time * 1000;
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[3] = fear(); say.textContent = "The one who fears sets his piece first: he feels a branch without a beast."; draw(); } }, Math.min(2500, T * 0.1));
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[2] = dream(); draw(); } }, T * 0.25);
      later(() => { if (st.phase === "vote" && st.j === J.idx) { st.votes[1] = strongest(); draw(); } }, T * 0.4);
    }

    // ---- a junction -----------------------------------------------------------------------------
    function openJunction() {
      const J = route[st.j];
      st.votes = [null, null, null, null]; st.revealed = false; st.sweep = null; st.phase = "vote"; st.time = J.time;
      say.textContent = st.j === 2 ? "The second chart: the delta. The river grows narrower; twenty seconds a junction." : `Junction ${st.j + 1}. The raft keeps moving while the page is open.`;
      companions(); draw();
    }
    function decide() {
      if (st.phase !== "vote") return;
      st.phase = "sweep";
      const J = route[st.j], bs = J.branches, tally = bs.map(() => 0);
      st.votes.forEach((v) => { if (v != null) tally[v]++; });
      const top = Math.max(...tally), tied = tally.map((t, i) => (t === top ? i : -1)).filter((i) => i >= 0);
      let win = tied[0], tie = tied.length > 1;
      if (tie) { const mx = Math.max(...tied.map((i) => bs[i].current)); const strong = tied.filter((i) => bs[i].current === mx); win = strong[Math.floor(rng() * strong.length)]; }
      st.sweep = { win };
      const b = bs[win];
      st.taken.push({ id: b.id, patrol: b.patrol, calm: b.calm, current: b.current, tendrils: b.tendrils, narrow: b.width === "narrow" });
      say.textContent = (tie ? "A tie. The current sweeps across the tied branches: the body simply moves them on. " : "") +
        `Branch ${b.id}${b.patrol ? ": a beast patrols it." : ": no patrol."}${b.calm ? " A calm pool." : ""}`;
      draw();
      later(() => { st.j++; if (st.j >= route.length) finish(); else openJunction(); }, api.reducedMotion ? 1600 : 2600);
    }
    function finish() {
      st.over = true;
      const t = st.taken, patrols = t.filter((x) => x.patrol).length, calms = t.filter((x) => x.calm).length;
      const tend = t.reduce((a, x) => a + [0, 2, 4, 6][x.tendrils], 0), secs = t.reduce((a, x) => a + [0, 20, 0, -20][x.current], 0), folds = t.filter((x) => x.narrow).length * 2;
      const sum = `Route ${t.map((x) => x.id).join("-")}: ${patrols} patrol${patrols === 1 ? "" : "s"} (${patrols} beast${patrols === 1 ? "" : "s"}, ${patrols * 2} eye-openings), ${calms} calm pool${calms === 1 ? "" : "s"}, ${tend} tendrils, ${folds} extra folds, ${secs > 0 ? "+" : ""}${secs} s on the river.`;
      api.end(patrols === 0 ? { outcome: "win", text: `A safe way to the heart. ${sum}` }
        : patrols >= 2 ? { outcome: "lose", text: `The route runs through the beasts. ${sum} Somebody will be noticed.` }
        : { outcome: "done", text: `One beast on the way. ${sum}` });
    }

    // ---- input ----------------------------------------------------------------------------------
    function vote(i) { if (st.phase !== "vote" || !st.started) return; st.votes[0] = i; say.textContent = `Your piece stands on branch ${route[st.j].branches[i].id}.`; draw(); }
    function startListen(i) {
      if (st.phase !== "vote") return;
      const b = route[st.j].branches[i];
      if (b.heard) { say.textContent = `You have listened to ${b.id} already.`; return; }
      st.holding = { b: i, t: performance.now() };
      say.textContent = `Listening to ${b.id}…`;
    }
    function stopListen() { if (st.holding) { st.holding = null; say.textContent = "You let go too soon. Hold for three seconds."; draw(); } }
    let drag = null;
    on(svg, "pointerdown", (e) => {
      const g = e.target.closest("." + P + "br");
      if (!st.started || st.phase !== "vote") return;
      if (st.listen && g) { e.preventDefault(); startListen(+g.dataset.b); return; }
      if (g) { vote(+g.dataset.b); return; }
      drag = { on: true };
    });
    on(svg, "pointerup", (e) => {
      if (st.holding) { stopListen(); return; }
      if (drag) { drag = null; const el = document.elementFromPoint(e.clientX, e.clientY); const g = el && el.closest && el.closest("." + P + "br"); if (g) vote(+g.dataset.b); }
    });
    on(svg, "pointerleave", () => { if (st.holding) stopListen(); });
    on(top, "click", (e) => {
      const b = e.target.closest("button"); if (!b || !st.started) return;
      if (b.dataset.a === "listen") { st.listen = !st.listen; bListen.setAttribute("aria-pressed", String(st.listen)); say.textContent = st.listen ? "Hold on a branch for three seconds to hear what swims in it." : ""; }
      if (b.dataset.a === "awl") { const J = route[st.j]; st.awl[J.chart] = true; st.revealed = true; say.textContent = "The awl's point finds every patrol at this junction."; draw(); }
      if (b.dataset.a === "go") decide();
    });
    on(window, "keydown", (e) => {
      if (!st.started) return;
      const n = route[st.j] ? route[st.j].branches.length : 0;
      const d = parseInt(e.key, 10);
      if (d >= 1 && d <= n) { vote(d - 1); return; }
      const f = document.activeElement && document.activeElement.closest && document.activeElement.closest("." + P + "br");
      if ((e.key === "Enter" || e.key === " ") && f) { e.preventDefault(); vote(+f.dataset.b); }
      if (e.key.toLowerCase() === "l" && f && !e.repeat) startListen(+f.dataset.b);
    });
    on(window, "keyup", (e) => { if (e.key.toLowerCase() === "l") stopListen(); });
    on(intro.querySelector("button"), "click", () => { intro.remove(); st.started = true; last = performance.now(); openJunction(); const g = svg.querySelector("." + P + "br"); g && g.focus(); });

    // ---- clock ----------------------------------------------------------------------------------
    let last = performance.now();
    timers.push(setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      if (!st.started || st.over || st.phase !== "vote") return;
      st.time -= dt;
      if (st.holding && now - st.holding.t >= 3000) {
        const b = route[st.j].branches[st.holding.b];
        const truth = b.patrol ? "off" : "on", heard = rng() < 0.7 ? truth : truth === "off" ? "on" : "off";
        b.heard = heard; st.holding = null;
        say.textContent = heard === "off" ? `In ${b.id}, a pulse off the heart's beat.` : `In ${b.id}, only the heart.`;
      }
      if (st.time <= 0) { if (st.votes[0] == null) say.textContent = "Your piece stayed in your hand."; decide(); return; }
      draw();
    }, 100));
    draw();

    return {
      unmount() {
        timers.forEach((id) => { clearInterval(id); clearTimeout(id); });
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        wrap.remove();
      },
    };
  },
};

// The Endless Temple / Living illustration (2D, scroll). Style: Picture-book pen and watercolour.
// DESIGN.md section 10, Mode A, sequence s2_li_c4a: torrent waves at mid-morning, heat introduced,
// 600 m of the sand sea on Zorlop-leaf shoes. Section 12: the tea holding (tea_hold, pov, sips).
//
// Lean back to brake (A / Left), lean forward (D / Right), pump down the face of a wave (hold Space
// / Up), release the pump at a crest to jump. A breaking lip (a wave over 5 m) swallows a rider
// slower than 4 m/s: mash dig to get out, and lose 10 m. Three swallows send you back to the last
// page-turn checkpoint (every 150 m). Prickle bushes cost 3 m/s; the sun builds heat, dune shade
// cools it. The tea drains with each page beat; as it fades the narrator slips from "I" to "he",
// input lags and the written line takes the reins. Hold S to sip (two sips). Win: reach 600 m.
// Lose: the tea runs out and the page closes.

const LEN = 600, CHECK = 150;
// Source line for the swallow, verbatim (DESIGN.md section 3 beat 20):
// creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md
// The opening caption is DESIGN.md section 3 beat 24, verbatim, from the same file.
const START_LINE = "He then tied the leaves about his feet and began his journey again.";
const SWALLOW_LINE = "The sand washed forward like a crashing wave of water. He braced himself as the surge of sand swallowed him.";
// DESIGN.md section 3 beats 19 and 22, verbatim, from the same file.
const MOON_LINE = "The sand looked like shining sheets of silver dotted with splendid purple vines sprawled across the ground like thick webs. Small prickle bushes were scattered across the sand sea.";
const DANGER_LINE = "If he was not careful, he could be swallowed too deep to dig out and die.";
// Narration written for the game (not quotations).
const LINES = {
  noon: "Noon. The sun stands straight over the sand sea, and the dunes throw only a little shade. Lean back in it to cool.",
  heat: "The heat swims in {my} eyes.",
  sipNew: "The tea is thinning: \u201cI\u201d is becoming \u201che\u201d. Hold Sip to drink.",
  jumpOK: "{I} let go at the crest.",
  prickle: "Prickles. {I} lose{s} {my} pace.",
  web: "The vines catch the leaves.",
  page: "The page turns. {m} m.",
  ride: "{I} ride{s} the face of the wave.",
  dug: "Dug out, ten metres back.",
  checkpoint: "Three times under. The page turns back to the last checkpoint.",
  sip: "A long green hand brings the cup into the page.",
  empty: "The cup is empty now.",
  winI: "Six hundred metres of torrent waves, and the page turns with Xandri still saying \u201cI\u201d: the tea held at {tea}.",
  winHe: "Six hundred metres, and the page turns, but the tea is down to {tea}: by the end it was \u201che\u201d who reached the moonlit vines, and the written line that steered.",
  lose: "The tea is gone at {x} m, {phase}. The lines thin to nothing, and the page closes on Xandri mid-stride.",
  gentle: "The cup is fuller this time, with a third sip in it.",
};
const PHASES = [{ at: 0, name: "mid-morning" }, { at: 200, name: "noon" }, { at: 400, name: "dusk on the vine sea" }];

export default {
  mount(root, api) {
    const P = "endless-temple-living-illustration-";
    const rng = api.rng("et-li-c4a");
    const losses = api.store.get("lossStreak", 0);
    const gentle = losses >= 2;
    const C = { page: "#f1e6cc", ink: "#2b1d12", ochre: "#c98a3a", sand: "#e0b56e", sky: "#b9cbd6", bruise: "#6e4a78", sage: "#8fa07a", honey: "#d4a23a", table: "#3a2a1d", silver: "#c9ccd3" };
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:hidden;background:${C.table};touch-action:none;user-select:none;-webkit-user-select:none}
    .${P}root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:10px 12px 12px;gap:8px;pointer-events:none}
    .${P}pad button{pointer-events:auto;font:600 15px 'EB Garamond',Georgia,serif;color:${C.ink};background:rgba(241,230,204,.86);border:2px solid ${C.ink};border-radius:40px;min-width:64px;min-height:56px;padding:0 14px;touch-action:none}
    .${P}pad button.${P}on{background:${C.honey}}
    .${P}pad .${P}big{min-width:110px;min-height:72px;font-size:17px}
    .${P}grp{display:flex;gap:8px}
    @media (hover:hover) and (pointer:fine){.${P}pad{opacity:.75}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(43,29,18,.6);z-index:5;padding:16px;overflow:auto}
    .${P}plate{max-width:440px;background:${C.page};color:${C.ink};padding:16px 18px 20px;border:1.5px solid ${C.ink};box-shadow:6px 8px 0 rgba(0,0,0,.35);font-family:'EB Garamond',Georgia,serif;transform:rotate(-.6deg);
      background-image:radial-gradient(circle at 20% 15%,rgba(185,203,214,.55),transparent 40%),radial-gradient(circle at 80% 85%,rgba(224,181,110,.5),transparent 45%)}
    .${P}plate svg{display:block;width:100%;height:auto;margin-bottom:8px}
    .${P}plate small{display:block;font-style:italic;font-size:14px;text-align:center;margin-bottom:6px}
    .${P}plate h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:0;font-size:28px;text-align:center}
    .${P}plate .${P}goal{margin:6px 0 10px;font-size:17px;text-align:center}
    .${P}plate ul{list-style:none;padding:0;margin:0 0 14px;font-size:16px}
    .${P}plate li{display:flex;gap:10px;align-items:baseline;margin:6px 0}
    .${P}plate kbd{flex:none;min-width:86px;text-align:center;font:600 14px 'EB Garamond',Georgia,serif;border:1.5px solid ${C.ink};border-radius:14px;padding:1px 8px;background:rgba(212,162,58,.35)}
    .${P}plate button{display:block;margin:0 auto;font:inherit;font-size:18px;padding:8px 28px;border:2px solid ${C.ink};background:${C.honey};cursor:pointer;border-radius:22px}
    .${P}plate button:hover,.${P}plate button:focus-visible{background:#e8bb55;outline:2px solid ${C.ink};outline-offset:2px}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `<canvas aria-label="A storybook page: Xandri rides the sand waves left to right."></canvas>
      <div class="${P}pad">
        <div class="${P}grp"><button type="button" data-k="back">◀ Lean back</button><button type="button" data-k="fwd">Lean ▶</button></div>
        <div class="${P}grp"><button type="button" data-k="sip">Sip</button><button type="button" class="${P}big" data-k="pump">Pump / Dig</button></div>
      </div>`;
    root.append(css, el);
    const cv = el.querySelector("canvas");
    const g = cv.getContext("2d");

    // ---- paper texture, made once ------------------------------------------------------------
    const paper = document.createElement("canvas");
    paper.width = 256; paper.height = 256;
    {
      const p = paper.getContext("2d");
      p.fillStyle = C.page; p.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) { p.fillStyle = `rgba(90,61,39,${(rng() * 0.07).toFixed(3)})`; p.fillRect(rng() * 256, rng() * 256, 1 + rng() * 1.5, 1 + rng() * 1.5); }
    }
    const paperPat = g.createPattern(paper, "repeat");
    // stable ink wobble
    const wob = (x, k = 1) => Math.sin(x * 0.9 + k) * 0.06 + Math.sin(x * 2.3 + k * 3) * 0.035;

    // ---- world ---------------------------------------------------------------------------------
    const prickles = [], webs = [], shades = [];
    for (let x = 40; x < LEN - 20; x += 32 + rng() * 34) prickles.push({ x, hit: false });
    for (const x of [430, 470, 515, 560]) webs.push({ x, hit: false });
    for (let x = 70; x < 400; x += 55 + rng() * 25) shades.push([x, x + 9 + rng() * 5]);
    const base = (x) => 1.6 + 1.1 * Math.sin(x / 23) + 0.6 * Math.sin(x / 9.7 + 1);
    let waves = [];
    const WF = 6, WB = 14, CW = 7.2; // front width, back width, wave speed m/s
    function waveH(w) { const a = w.age; return a < 7 ? 2 + 4 * Math.min(1, a / 6) : Math.max(0, 6 - (a - 7) * 2.5); }
    function hAt(x) {
      let h = base(x);
      for (const w of waves) {
        const u = x - w.x, H = waveH(w);
        if (u >= 0 && u < WF) h += H * 0.5 * (1 + Math.cos((Math.PI * u) / WF));
        else if (u < 0 && u > -WB) h += H * 0.5 * (1 + Math.cos((Math.PI * u) / WB));
      }
      return h;
    }
    const slopeAt = (x) => (hAt(x + 0.3) - hAt(x - 0.3)) / 0.6;

    // ---- state ---------------------------------------------------------------------------------
    const S = {
      x: 4, v: 4, y: 0, vy: 0, air: false, tea: gentle ? 85 : 70, sips: gentle ? 3 : 2, phase: 0, fx: [], sipToldNew: false, cooled: 0, heat: 0, hot: 0, swallows: 0, check: 0,
      swallowed: null, snag: 0, beat: 50, t: 0, nextWave: 0.2, sipHold: 0, caption: "", capT: 0, done: false, started: false,
      maxX: 0, inputQ: [],
    };
    const keys = { back: false, fwd: false, pump: false, sip: false };
    let digPresses = 0;
    function say(t, secs = 3) { S.caption = t; S.capT = secs; }
    // voice: first person while the tea holds, third as it fades
    function V(t) {
      const I = band() === 0;
      return t.replace(/\{I\}/g, I ? "I" : "He").replace(/\{s\}/g, I ? "" : "s").replace(/\{my\}/g, I ? "my" : "his");
    }
    function fx(kind) { if (!api.reducedMotion) S.fx.push({ kind, x: S.x, y: S.air ? S.y : hAt(S.x), t: 0 }); }

    // ---- input ---------------------------------------------------------------------------------
    const KEYMAP = { a: "back", arrowleft: "back", d: "fwd", arrowright: "fwd", " ": "pump", w: "pump", arrowup: "pump", s: "sip", arrowdown: "sip", e: "dig" };
    const onDown = (e) => {
      const k = KEYMAP[e.key.toLowerCase()];
      if (!k || !S.started) return;
      e.preventDefault();
      if (k === "dig" || (k === "pump" && S.swallowed)) { if (!e.repeat) digPresses++; if (k === "dig") return; }
      keys[k] = true;
    };
    const onUp = (e) => { const k = KEYMAP[e.key.toLowerCase()]; if (k && k !== "dig") keys[k] = false; };
    addEventListener("keydown", onDown); addEventListener("keyup", onUp);
    const btns = [...el.querySelectorAll("[data-k]")];
    const ptr = [];
    for (const b of btns) {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); if (!S.started) return; keys[k] = true; b.classList.add(P + "on"); if (k === "pump" && S.swallowed) digPresses++; };
      const up = (e) => { e.preventDefault(); keys[k] = false; b.classList.remove(P + "on"); };
      b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("pointerleave", up);
      ptr.push([b, down, up]);
    }

    // ---- update --------------------------------------------------------------------------------
    function band() { return S.tea >= 60 ? 0 : S.tea >= 30 ? 1 : S.tea > 0 ? 2 : 3; }
    function update(dt) {
      S.t += dt;
      if (S.capT > 0) S.capT -= dt;
      // waves spawn behind the rider every 4 to 7 s and roll right
      S.nextWave -= dt;
      if (S.nextWave <= 0) { waves.push({ x: S.x - 22 - rng() * 6, age: 0 }); S.nextWave = 4 + rng() * 3; }
      for (const w of waves) { w.age += dt; w.x += CW * dt; }
      waves = waves.filter((w) => waveH(w) > 0.05 && w.x < S.x + 80);

      // tea: idle drain, sip
      S.tea -= dt / 8;
      if (keys.sip && S.sips > 0 && S.tea < 100) {
        S.sipHold += dt;
        if (S.sipHold >= 1.5) { S.sips--; S.tea = Math.min(100, S.tea + 25); S.sipHold = 0; keys.sip = false; fx("sip"); say(S.sips ? LINES.sip : LINES.empty); }
      } else S.sipHold = 0;

      if (S.swallowed) {
        const sw = S.swallowed;
        sw.t += dt;
        sw.p += digPresses * 0.13 + dt * 0.25; digPresses = 0;
        if (sw.t >= 2 && sw.p >= 1) {
          S.swallowed = null; S.swallows++;
          if (S.swallows >= 3) { S.x = S.check + 2; S.swallows = 0; waves = []; S.nextWave = 2; say(LINES.checkpoint, 3.5); }
          else { S.x = Math.max(0, S.x - 10); say(S.swallows === 2 ? DANGER_LINE : LINES.dug, S.swallows === 2 ? 4 : 2); }
          S.v = 2; S.air = false;
        }
        return;
      }
      digPresses = 0;

      // input with lag and written-line authority as the tea fades
      const b = band();
      const lag = b === 0 ? 0 : b === 1 ? 0.15 : 0.35;
      S.inputQ.push({ t: S.t, back: keys.back, fwd: keys.fwd, pump: keys.pump });
      while (S.inputQ.length > 1 && S.inputQ[1].t <= S.t - lag) S.inputQ.shift();
      const inp = S.inputQ[0];
      const auth = b === 0 ? 1 : b === 1 ? 1 - 0.3 * (60 - S.tea) / 30 : S.tea < 10 ? 0 : 0.35;
      const slope = slopeAt(S.x);
      const auto = { pump: slope < -0.05, back: false, fwd: false };
      const use = (k) => (rng() < auth ? inp[k] : auto[k]);
      const pump = use("pump"), back = use("back"), fwd = use("fwd");

      const hHere = hAt(S.x);
      if (!S.air) {
        let a = -0.15 * S.v;
        if (slope < -0.05) a += 1.2 + (pump ? 2.5 : 0);
        if (slope > 0.05) a -= 2;
        if (back) a -= 3;
        if (fwd) a += 0.6;
        S.v = Math.max(1.5, Math.min(12, S.v + a * dt));
        if (S.hot > 0) S.v = Math.min(6, S.v);
        if (S.snag > 0) { S.snag -= dt; S.v = 0.3; }
        // jump: release the pump at a crest
        if (S.wasPump && !pump && Math.abs(slope) < 0.18 && hHere - base(S.x) > 1.5 && S.v > 4.5) {
          S.air = true; S.y = hHere; S.vy = 3 + S.v * 0.35; fx("jump"); say(V(LINES.jumpOK).replace("He let ", "He lets "), 1.6);
        }
        S.y = hHere;
      } else {
        S.vy -= 12 * dt; S.y += S.vy * dt;
        if (S.y <= hAt(S.x)) { S.air = false; S.y = hAt(S.x); fx("land"); }
      }
      S.wasPump = pump;
      S.x += S.v * dt;

      // hazards
      for (const p of prickles) if (!p.hit && !S.air && Math.abs(S.x - p.x) < 0.8) { p.hit = true; S.v = Math.max(1.5, S.v - 3); fx("hit"); say(V(LINES.prickle), 1.6); }
      for (const w of webs) if (!w.hit && !S.air && Math.abs(S.x - w.x) < 0.8) { w.hit = true; S.snag = 1; fx("hit"); say(LINES.web, 1.4); }
      if (S.x > CHECK * (Math.floor(S.check / CHECK) + 1) && S.x < LEN) { S.check = Math.floor(S.x / CHECK) * CHECK; S.pageFlash = 0.6; if (!S.capT || S.capT < 1) say(LINES.page.replace("{m}", S.check), 1.6); for (const p of prickles) if (p.x > S.check) p.hit = false; }
      // phases
      const ph = S.x >= PHASES[2].at ? 2 : S.x >= PHASES[1].at ? 1 : 0;
      if (ph !== S.phase) { S.phase = ph; say(ph === 1 ? LINES.noon : MOON_LINE, 5); if (ph === 2) { S.heat = 0; S.hot = 0; } }
      if (b >= 1 && !S.sipToldNew && S.sips > 0 && S.capT < 0.5) { S.sipToldNew = true; say(LINES.sipNew, 3.5); }

      // swallowed by a breaking lip
      for (const w of waves) {
        const u = S.x - w.x;
        if (waveH(w) > 5 && !S.air && u > -1 && u < 2.5 && S.v < 3.6) {
          S.swallowed = { t: 0, p: 0 }; digPresses = 0; S.totalSwallows = (S.totalSwallows || 0) + 1; fx("hit");
          say(SWALLOW_LINE, 3.6);
          return;
        }
      }

      // heat: sun by day, dune shade cools
      const shade = shades.some(([a, c]) => S.x > a && S.x < c);
      const sun = S.phase === 0 ? 3 : S.phase === 1 ? 6 : -10;
      S.heat = Math.max(0, Math.min(100, S.heat + (shade ? -12 : sun) * dt));
      if (shade && S.heat > 0 && S.v < 3) S.cooled += dt;
      if (S.hot > 0) { S.hot -= dt; if (S.hot <= 0) S.heat = 60; }
      else if (S.heat >= 100) { S.hot = 5; fx("hit"); say(V(LINES.heat), 2); }

      // page beats drain the tea
      if (S.x >= S.beat) { S.beat += 50; S.tea -= 5; }
      S.maxX = Math.max(S.maxX, S.x);
      if (S.capT <= 0 && S.v > 7.5 && !S.air && rng() < 0.02) say(V(LINES.ride), 1.8);
      if (S.pageFlash > 0) S.pageFlash -= dt;
      for (const f of S.fx) f.t += dt;
      S.fx = S.fx.filter((f) => f.t < 0.8);

      if (S.x >= LEN) finish(true);
      else if (S.tea <= 0) { S.tea = 0; finish(false); }
    }
    function finish(win) {
      if (S.done) return;
      S.done = true;
      api.store.set("lossStreak", win ? 0 : losses + 1);
      const tea = Math.max(0, Math.round(S.tea));
      const sw = S.totalSwallows ? ` The sand had him ${S.totalSwallows} time${S.totalSwallows > 1 ? "s" : ""}.` : " The sand never had him.";
      timers.push(setTimeout(() => api.end(win
        ? { outcome: "win", text: (tea >= 60 ? LINES.winI : LINES.winHe).replace("{tea}", tea) + sw }
        : { outcome: "lose", text: LINES.lose.replace("{x}", Math.round(S.x)).replace("{phase}", PHASES[S.phase].name) + (S.sips ? ` ${S.sips === 1 ? "One sip was" : S.sips + " sips were"} still in the cup.` : "") }), api.reducedMotion ? 100 : 700));
    }

    // ---- draw ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    function inkLine(pts, w, col, k) {
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + wob(x * 0.05, k) * 6) : g.moveTo(x, y))); g.stroke();
    }
    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.table; g.fillRect(0, 0, W, H);
      const b = band();
      // the page: margins widen as the tea fades
      const zoom = b === 0 ? 1 : b === 1 ? 0.9 : 0.8;
      const mx = W * (1 - zoom) / 2 + 10, my = H * (1 - zoom) / 2 + 8;
      const pw = W - mx * 2, ph = H - my * 2 - Math.min(90, H * 0.12);
      // page edges stacked at the right, and the shadow
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(mx + 8, my + 8, pw, ph);
      for (let i = 4; i > 0; i--) { g.fillStyle = i % 2 ? "#e2d4b0" : "#cfbf98"; g.fillRect(mx + i * 2.5, my + i * 1.5, pw, ph); }
      g.save();
      g.beginPath(); g.rect(mx, my, pw, ph); g.clip();
      g.fillStyle = paperPat; g.fillRect(mx, my, pw, ph);
      const thin = b >= 2;
      const inkC = thin ? "rgba(90,90,90,.75)" : C.ink;
      const inkW = thin ? 0.9 : 1.8;
      const washA = thin ? 0.25 : 0.55;
      const s = Math.max(12, Math.min(26, pw / 34)); // px per metre
      const camX = S.x - (pw * 0.32) / s;
      const groundY = my + ph * 0.86;
      const X = (x) => mx + (x - camX) * s, Y = (h) => groundY - h * s;
      // sky wash and sun
      const dusk = S.phase === 2;
      g.globalAlpha = washA; g.fillStyle = dusk ? "#8d86a8" : S.phase === 1 ? "#cfd6c8" : C.sky; g.fillRect(mx, my, pw, ph * 0.5);
      if (dusk) { g.globalAlpha = washA * 0.6; g.fillStyle = C.bruise; g.fillRect(mx, my, pw, ph * 0.22); }
      const sx = mx + pw * 0.82, sy = my + ph * (dusk ? 0.2 : 0.18);
      if (!dusk) {
        g.globalAlpha = washA * (0.3 + S.heat / 140); g.fillStyle = C.honey;
        g.beginPath(); g.arc(sx, sy, 28 + S.heat * 0.14 + S.phase * 6, 0, 7); g.fill();
        g.globalAlpha = 1; g.strokeStyle = inkC; g.lineWidth = inkW * 0.7;
        g.beginPath(); g.arc(sx, sy, 24, 0, 7); g.stroke();
        for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + S.t * 0.05; const r0 = 32, r1 = 42 + (i % 2) * 6 + S.phase * 6; g.beginPath(); g.moveTo(sx + r0 * Math.cos(a), sy + r0 * Math.sin(a)); g.lineTo(sx + r1 * Math.cos(a), sy + r1 * Math.sin(a)); g.stroke(); }
      } else {
        g.globalAlpha = 0.9; g.fillStyle = C.silver; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.fill();
        g.globalAlpha = 1; g.strokeStyle = inkC; g.lineWidth = inkW * 0.7; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.stroke();
        g.fillStyle = "#f6f2e6"; for (let i = 0; i < 18; i++) g.fillRect(mx + ((i * 97) % 1000) / 1000 * pw, my + 30 + ((i * 53) % 100) / 100 * ph * 0.3, 1.6, 1.6);
      }
      g.globalAlpha = 1;
      // far dunes (parallax wash)
      g.globalAlpha = washA * 0.6; g.fillStyle = C.ochre;
      g.beginPath(); g.moveTo(mx, groundY);
      for (let px = 0; px <= pw + 8; px += 8) { const wx = camX * 0.35 + px / s; g.lineTo(mx + px, groundY - s * (5 + 2 * Math.sin(wx / 17) + Math.sin(wx / 6.1))); }
      g.lineTo(mx + pw, groundY + 40); g.lineTo(mx, groundY + 40); g.fill(); g.globalAlpha = 1;
      // the tall dunes that cast the shade: a back wash behind each shade zone
      for (const [a, c] of shades) {
        if (X(c + 10) < mx || X(a - 10) > mx + pw) continue;
        const mid = (a + c) / 2, half = (c - a) / 2 + 9;
        g.globalAlpha = washA * 0.9; g.fillStyle = C.ochre; g.beginPath(); g.moveTo(X(mid - half), groundY);
        for (let t = 0; t <= 1.0001; t += 0.05) { const xx = mid - half + t * 2 * half; g.lineTo(X(xx), Y(base(xx) + 8 * Math.sin(Math.PI * t) ** 1.5)); }
        g.lineTo(X(mid + half), groundY + 40); g.lineTo(X(mid - half), groundY + 40); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW * 0.7; g.beginPath();
        for (let t = 0; t <= 1.0001; t += 0.05) { const xx = mid - half + t * 2 * half; const yy = Y(base(xx) + 8 * Math.sin(Math.PI * t) ** 1.5); t ? g.lineTo(X(xx), yy) : g.moveTo(X(xx), yy); }
        g.stroke();
      }
      // the ground: two watercolour washes with a pooled edge, then the ink line
      const pts = [];
      for (let px = -8; px <= pw + 8; px += 5) { const wx = camX + px / s; pts.push([mx + px, Y(hAt(wx))]); }
      for (const [off, col, a] of (S.phase === 2 ? [[3, C.silver, washA * 1.2], [-2, "#a59cb8", washA * 0.6]] : [[3, C.sand, washA], [-2, C.ochre, washA * 0.6]])) {
        g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1] + off);
        for (const [x, y] of pts) g.lineTo(x, y + off + wob(x * 0.03, 2) * 5);
        g.lineTo(mx + pw + 8, my + ph); g.lineTo(mx - 8, my + ph); g.fill();
      }
      g.globalAlpha = 1;
      for (const [a, c] of shades) {
        if (X(c) < mx || X(a) > mx + pw) continue;
        g.save(); g.beginPath(); g.moveTo(X(a), Y(hAt(a)));
        for (let xx = a; xx <= c; xx += 0.5) g.lineTo(X(xx), Y(hAt(xx)));
        g.lineTo(X(c), my + ph); g.lineTo(X(a), my + ph); g.closePath();
        g.globalAlpha = washA * 0.7; g.fillStyle = C.bruise; g.fill(); g.clip(); g.globalAlpha = 1;
        g.strokeStyle = thin ? "rgba(110,74,120,.35)" : "rgba(110,74,120,.75)"; g.lineWidth = 0.8;
        for (let hx = X(a) - 40; hx < X(c); hx += 7) { g.beginPath(); g.moveTo(hx, my + ph); g.lineTo(hx + 40, groundY - 6 * s); g.stroke(); }
        g.restore();
        g.fillStyle = inkC; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("dune shade", X(a), Y(hAt(a)) - 8);
      }
      inkLine(pts, inkW, inkC, 1);
      // breaking lips: an ink curl with spray
      for (const w of waves) {
        const Hh = waveH(w);
        if (Hh < 4) continue;
        const cx = X(w.x), cy = Y(hAt(w.x));
        const curl = Math.min(1, (Hh - 4) / 2) * s * 1.6;
        g.strokeStyle = inkC; g.lineWidth = inkW * 1.1;
        g.beginPath(); g.moveTo(cx - s, cy + 4); g.quadraticCurveTo(cx + curl * 0.6, cy - curl * 0.9, cx + curl * 1.4, cy + curl * 0.4); g.stroke();
        if (Hh > 5) {
          g.globalAlpha = washA; g.fillStyle = C.ochre; g.beginPath(); g.moveTo(cx - s, cy + 4); g.quadraticCurveTo(cx + curl * 0.6, cy - curl * 0.9, cx + curl * 1.4, cy + curl * 0.4); g.lineTo(cx + curl, cy + curl); g.fill(); g.globalAlpha = 1;
          g.fillStyle = inkC;
          for (let i = 0; i < 14; i++) { const t = (i * 37 + Math.floor(S.t * 10)) % 23; g.fillRect(cx + curl * 1.2 + (t % 7) * 3, cy + curl * 0.3 + (t % 5) * 4 - 6, 1.5, 1.5); }
          g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("breaking", cx - 14, cy - curl - 8);
        }
      }
      // prickles and webs
      for (const p of prickles) {
        const x = X(p.x); if (x < mx - 20 || x > mx + pw + 20) continue;
        const y = Y(hAt(p.x));
        g.globalAlpha = washA; g.fillStyle = C.sage; g.beginPath(); g.ellipse(x, y - 6, 12, 8, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW * 0.6;
        for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + Math.cos(a) * 15, y - 4 + Math.sin(a) * 12); g.stroke(); }
      }
      for (const w of webs) {
        const x = X(w.x); if (x < mx - 30 || x > mx + pw + 30) continue;
        const y = Y(hAt(w.x));
        g.strokeStyle = thin ? "rgba(110,74,120,.5)" : C.bruise; g.lineWidth = inkW * 0.8;
        for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 18); g.stroke(); }
        for (const r of [8, 15, 21]) { g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.stroke(); }
      }
      // the rider
      const rx = X(S.x), ry = Y(S.air ? S.y : hAt(S.x));
      const slope = S.air ? 0 : slopeAt(S.x);
      const lean = (keys.back ? -0.35 : keys.fwd ? 0.25 : 0) + Math.atan(-slope) * 0.4;
      g.save(); g.translate(rx, ry); g.rotate(Math.atan(-slope) * 0.7);
      g.globalAlpha = washA + 0.2; g.fillStyle = "#6f8f3a"; g.beginPath(); g.ellipse(0, -2, 18, 5, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = inkC; g.lineWidth = inkW; g.beginPath(); g.ellipse(0, -2, 18, 5, 0, 0, 7); g.stroke();
      g.rotate(lean);
      const crouch = keys.pump && !S.air ? 6 : 0;
      g.beginPath(); g.moveTo(-7, -4); g.lineTo(-2, -18 + crouch); g.lineTo(0, -34 + crouch); g.moveTo(7, -4); g.lineTo(3, -18 + crouch); g.lineTo(0, -34 + crouch);
      g.moveTo(0, -34 + crouch); g.lineTo(2, -50 + crouch); g.moveTo(1, -46 + crouch); g.lineTo(-14, -38 + crouch); g.moveTo(1, -46 + crouch); g.lineTo(16, -52 + crouch); g.stroke();
      g.globalAlpha = washA + 0.2; g.fillStyle = "#8a5a3a"; g.beginPath(); g.ellipse(-6, -40 + crouch, 6, 9, -0.3, 0, 7); g.fill(); g.globalAlpha = 1; // the patched pack
      g.fillStyle = C.page; g.beginPath(); g.arc(3, -57 + crouch, 7, 0, 7); g.fill(); g.stroke();
      g.restore();
      if (S.swallowed) {
        g.globalAlpha = 0.8; g.fillStyle = C.sand; g.beginPath(); g.ellipse(rx, ry - 20, 34, 30, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = inkC; g.lineWidth = inkW; g.beginPath(); g.ellipse(rx, ry - 20, 34, 30, 0, 0, 7); g.stroke();
        g.fillStyle = C.ink; g.font = "600 17px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        g.fillText("Dig! Tap Pump / Dig fast (E)", rx, ry - 64);
        g.fillStyle = C.honey; g.fillRect(rx - 40, ry - 56, 80 * Math.min(1, S.swallowed.p), 6); g.strokeRect(rx - 40, ry - 56, 80, 6); g.textAlign = "left";
      }
      // flourishes: ink splash on a jump, a puff on landing, a red blot on a hit, a green ring on a sip
      for (const f of S.fx) {
        const fxX = X(f.x), fyY = Y(f.y), k = f.t / 0.8;
        g.globalAlpha = 1 - k;
        if (f.kind === "jump") { g.strokeStyle = C.ink; g.lineWidth = 1.5; for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; g.beginPath(); g.moveTo(fxX + Math.cos(a) * 10, fyY + Math.sin(a) * 6); g.lineTo(fxX + Math.cos(a) * (14 + k * 26), fyY + Math.sin(a) * (8 + k * 18)); g.stroke(); } }
        else if (f.kind === "land") { g.fillStyle = S.phase === 2 ? C.silver : C.ochre; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(fxX + (i - 4) * 5 * (1 + k), fyY - k * 10 - (i % 3) * 3, 2.2, 0, 7); g.fill(); } }
        else if (f.kind === "hit") { g.fillStyle = "rgba(168,67,44,.55)"; g.beginPath(); g.arc(X(S.x), Y(S.air ? S.y : hAt(S.x)) - 28, 18 + k * 30, 0, 7); g.fill(); }
        else if (f.kind === "sip") { g.strokeStyle = C.sage; g.lineWidth = 4; g.beginPath(); g.arc(mx + 46, my + ph - 52, 30 + k * 40, 0, 7); g.stroke(); }
      }
      g.globalAlpha = 1;
      if (S.pageFlash > 0 && !api.reducedMotion) {
        const k = S.pageFlash / 0.6, cw = pw * 0.25 * k;
        g.fillStyle = "rgba(255,250,235,.85)"; g.beginPath(); g.moveTo(mx + pw, my); g.lineTo(mx + pw - cw, my); g.quadraticCurveTo(mx + pw - cw * 0.4, my + ph * 0.5, mx + pw, my + ph); g.fill();
        g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke();
      }
      if (S.hot > 0) {
        // the heat blurs the page: a honey haze and a shimmer drawn in ink
        g.fillStyle = "rgba(212,162,58,.28)"; g.fillRect(mx, my, pw, ph);
        g.strokeStyle = "rgba(43,29,18,.25)"; g.lineWidth = 1;
        for (let k = 0; k < 6; k++) {
          const yy = my + ph * (0.35 + k * 0.08);
          g.beginPath(); for (let xx = 0; xx <= pw; xx += 12) { const v = yy + Math.sin(xx * 0.05 + S.t * (api.reducedMotion ? 0 : 6) + k) * 3; xx ? g.lineTo(mx + xx, v) : g.moveTo(mx + xx, v); } g.stroke();
        }
      }
      // the top margin: the map that draws itself, on a band of clean paper
      const my0 = my + 16, mlx = mx + 20, mlw = Math.max(120, pw - 130);
      const bandH = pw < 520 ? 72 : 54;
      g.fillStyle = "rgba(241,230,204,.92)"; g.fillRect(mx, my, pw, bandH);
      g.strokeStyle = "rgba(43,29,18,.35)"; g.beginPath(); g.moveTo(mx, my + bandH); g.lineTo(mx + pw, my + bandH); g.stroke();
      g.strokeStyle = C.ink; g.lineWidth = 1.6; g.beginPath();
      const prog = Math.min(1, S.maxX / LEN);
      for (let i = 0; i <= 60 * prog; i++) { const t = i / 60; const x = mlx + t * mlw, y = my0 + 6 + Math.sin(t * 19) * 3; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      g.setLineDash([3, 4]); g.lineWidth = 1; g.beginPath(); g.moveTo(mlx + prog * mlw, my0 + 6); g.lineTo(mlx + mlw, my0 + 6); g.stroke(); g.setLineDash([]);
      for (let c = CHECK; c < LEN; c += CHECK) { g.beginPath(); g.moveTo(mlx + (c / LEN) * mlw, my0); g.lineTo(mlx + (c / LEN) * mlw, my0 + 12); g.stroke(); }
      for (const P2 of PHASES.slice(1)) { g.fillStyle = C.bruise; g.beginPath(); g.arc(mlx + (P2.at / LEN) * mlw, my0 + 6, 3, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(mlx + mlw, my0 + 14); g.lineTo(mlx + mlw, my0 - 10); g.stroke();
      g.fillStyle = C.ochre; g.beginPath(); g.moveTo(mlx + mlw, my0 - 10); g.lineTo(mlx + mlw + 12, my0 - 6); g.lineTo(mlx + mlw, my0 - 2); g.fill();
      g.fillStyle = C.ink; g.font = "italic 14px 'EB Garamond',Georgia,serif"; g.fillText("the mark", mlx + mlw + 16, my0 + 2);
      g.font = "600 14px 'EB Garamond',Georgia,serif";
      g.fillText(`${Math.floor(S.x)} m · ${PHASES[S.phase].name}`, mlx, my0 + 30);
      const tw0 = g.measureText(`${Math.floor(S.x)} m · ${PHASES[S.phase].name}`).width;
      let hx = mlx + tw0 + 22, hy = my0 + 30;
      if (hx + 190 > mx + pw) { hx = mlx; hy = my0 + 50; }   // narrow page: heat on its own line
      if (S.phase < 2) {
        g.fillText("heat", hx, hy);
        g.strokeRect(hx + 34, hy - 10, 80, 11); g.fillStyle = S.hot > 0 || S.heat > 80 ? "#a8432c" : C.honey; g.fillRect(hx + 34, hy - 10, 0.8 * S.heat, 11);
        if (S.hot > 0) { g.fillStyle = "#a8432c"; g.fillText("too hot", hx + 120, hy); }
      }
      g.fillStyle = C.ink;
      const swText = `under ${S.swallows}/3`, swW = g.measureText(swText).width;
      const swx = mx + pw - swW - 16, swy = (hy === my0 + 30 && swx < hx + 190 && S.phase < 2) || swx < mlx + tw0 + 16 ? my0 + 50 : my0 + 30;
      g.fillText(swText, swx, swy);
      // page number
      g.fillText(`~ ${47 + Math.floor(S.x / CHECK)} ~`, mx + pw / 2 - 14, my + ph - 10);
      g.restore();

      // the cup vignette, bottom-left of the page
      const cx = mx + 46, cy = my + ph - 52;
      g.fillStyle = "rgba(241,230,204,.9)"; g.strokeStyle = C.ink; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(cx - 24, cy - 24); g.lineTo(cx - 18, cy + 18); g.quadraticCurveTo(cx, cy + 26, cx + 18, cy + 18); g.lineTo(cx + 24, cy - 24); g.closePath(); g.fill(); g.stroke();
      const lvl = Math.max(0, Math.min(1, S.tea / 100));
      g.save(); g.clip(); g.fillStyle = C.sage; g.fillRect(cx - 26, cy + 24 - lvl * 48, 52, 48); g.restore();
      g.beginPath(); g.moveTo(cx - 24, cy - 24); g.lineTo(cx - 18, cy + 18); g.quadraticCurveTo(cx, cy + 26, cx + 18, cy + 18); g.lineTo(cx + 24, cy - 24); g.stroke();
      g.beginPath(); g.arc(cx + 28, cy - 4, 9, -1.4, 1.4); g.stroke();
      if (S.sipHold > 0) { g.strokeStyle = C.honey; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 34, -1.57, -1.57 + (S.sipHold / 1.5) * 6.283); g.stroke(); }
      g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(cx - 34, cy + 30, 150, 20);
      g.fillStyle = b >= 1 ? "#7a2f1e" : C.ink; g.font = "600 14px 'EB Garamond',Georgia,serif";
      g.fillText(`tea ${Math.round(S.tea)} · “${["I", "he", "he", "—"][b]}”${b === 2 ? " (thin)" : ""}`, cx - 30, cy + 45);
      if (b >= 1 && S.sips > 0 && !S.done) { g.fillStyle = "rgba(241,230,204,.9)"; g.fillRect(cx + 40, cy - 26, 196, 22); g.fillStyle = C.ink; g.fillText(`hold Sip (S): ${S.sips} sip${S.sips > 1 ? "s" : ""} left`, cx + 44, cy - 10); }
      // caption, bottom centre
      if (S.capT > 0 && S.caption) {
        g.font = "italic 17px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        const maxW = Math.max(160, Math.min(pw - 40, 620));
        const words = S.caption.split(" "), lines = []; let line = "";
        for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
        lines.push(line);
        const cyc = my + (pw < 520 ? 96 : 78);
        g.fillStyle = "rgba(241,230,204,.93)"; g.fillRect(mx + pw / 2 - maxW / 2 - 10, cyc - 18, maxW + 20, lines.length * 21 + 10);
        g.strokeStyle = "rgba(43,29,18,.4)"; g.lineWidth = 1; g.strokeRect(mx + pw / 2 - maxW / 2 - 10, cyc - 18, maxW + 20, lines.length * 21 + 10);
        g.fillStyle = C.ink; lines.forEach((l, i) => g.fillText(l, mx + pw / 2, cyc + i * 21));
        g.textAlign = "left";
      }
    }

    let raf = 0, last = performance.now(), last2 = performance.now();
    function loop(now) {
      last = now;
      const real = Math.min(0.25, (now - last2) / 1000); last2 = now;
      if (S.started && !S.done) { let r = real; while (r > 1e-4 && !S.done) { const st = Math.min(0.03, r); update(st); r -= st; } }
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}plate" role="dialog" aria-label="How to play">
      <svg viewBox="0 0 400 90" aria-hidden="true"><rect x="1" y="1" width="398" height="88" fill="none" stroke="${C.ink}"/>
        <path d="M0 70 C60 66 90 30 130 34 C160 37 170 60 200 62 C250 66 280 28 330 36 C360 40 380 58 400 60 L400 90 L0 90Z" fill="${C.sand}" opacity=".7"/>
        <path d="M0 70 C60 66 90 30 130 34 C160 37 170 60 200 62 C250 66 280 28 330 36 C360 40 380 58 400 60" fill="none" stroke="${C.ink}" stroke-width="1.6"/>
        <path d="M118 36 l4 -14 l3 -12 M120 22 l-10 6 M121 20 l10 -4" stroke="${C.ink}" stroke-width="1.6" fill="none"/><circle cx="125" cy="6" r="4" fill="${C.page}" stroke="${C.ink}"/>
        <circle cx="350" cy="18" r="10" fill="${C.honey}" opacity=".6" stroke="${C.ink}"/></svg>
      <small>Plate IV. The torrent waves, mid-morning.</small>
      <h2>Living illustration</h2>
      <p class="${P}goal"><b>Goal:</b> ride Xandri 600 m across the sand sea before the tea runs out.</p>
      <ul>
        <li><kbd>Pump · Space</kbd><span>Hold down a wave's face to gain speed. Let go at a crest to jump.</span></li>
        <li><kbd>Jump</kbd><span>Clears prickle bushes and, later, vine webs.</span></li>
      </ul>
      <p style="font-size:15px;margin:0 0 12px;font-style:italic">Slow under a breaking lip, and the sand swallows you. More controls arrive as the day turns.${gentle ? " " + LINES.gentle : ""}</p>
      <button type="button">Begin the page</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); S.started = true; last = last2 = performance.now(); say(START_LINE, 3.5); });
    intro.querySelector("button").focus();

    return {
      unmount() {
        cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect();
        removeEventListener("keydown", onDown); removeEventListener("keyup", onUp);
        for (const [b, d, u] of ptr) { b.removeEventListener("pointerdown", d); b.removeEventListener("pointerup", u); b.removeEventListener("pointercancel", u); b.removeEventListener("pointerleave", u); }
      },
    };
  },
};

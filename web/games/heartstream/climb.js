// A Journey Into the Heartstream, 2D mode B: the climb (DESIGN.md section 10, `m2_climb`).
// Cave painting: ochre and charcoal figures on rock, hand stencils, holds as dabs of red ochre.
// One shaft cut from `s2_climb_1` and `s2_climb_2` together: 56 m, four ledges too high for one,
// 68 bpm rising to 76 in the hot upper section, where the firm window narrows from 120 to 90 ms and
// the holds pulse slicker. The player climbs beside the one who dreams; the other two climb ahead.
//
// Actions, unlocked as the shaft brings them:
//   Grab   on the beat: up one hold (firm); off the beat the hold is slick and you slide to the one below.
//   Pull   at a ledge, on his shoulders and reaching down: three on-beat pulls lift him.
//   Brace  hold: be his step at a ledge; in the heat, cling through a beat when the holds glisten.
//   Reach  a long reach for the hold beyond: on the beat's heart (±60 ms) it gains two holds; a near
//          miss gains one; a miss slides you two.
//
// Art (api.art): the far and near planes of both climb sequences (the painted back wall of the shaft and
// its side walls with their hand stencils, rasterised once per size; the middle planes carry painted
// ledges and holds that would read as real ones, so they stay out), the four seat portraits in the
// count, chapter cards 5 and 6. The mode's own rock, walls and stencils remain as the fallback.
//
// Line shown, verbatim (DESIGN.md section 3, "The ascent"):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "A narrow shaft opens in the bone — a vertical tunnel lined with soft, living tissue. The Blue‑Born climb, feeling the temperature rise, feeling the pulse grow louder."
// "Look up." is the one who dreams's line from DESIGN.md section 6.

import { howTo, Legend, Beats, Streak, flourish, disposeKit, artImg, raster, plate, endCard, ladder, stagePicker, revealMark, secondRun, marks, introNote } from "./_kit.js";
//
// Phase 2 (DEEP_DIVE.md section 3, built 2026-11-16): a ladder of three pitches.
//   Teach  the foot of the shaft: grab on the beat. The count is long; nobody loses height for good.
//   Test   brace and pull at two ledges; the breathing wall (every fourth beat the shaft narrows: level with
//          your brother you chimney through, alone you are squeezed down a hold); old stencils (an earlier
//          group's hand in the rock is always firm, and using it leaves yours beside it); the heat.
//   Twist  the last ledge leaves the last brother with nobody under him: pulling does not reach, and the
//          first one up climbs back down to be the step. It ends in the set-piece, The Stencil Wall: a
//          gallery of hands in rows of four, some rows with three; all four press a bare row on one beat.
// Lines written for the game: the stage cards, the beats of the last ledge and the wall.

const C = { char: "#1d1612", ochre: "#a4532a", red: "#b3202e", deep: "#7A1020", gold: "#F2B544", bone: "#E8DCC4",
  rock: "#d8c3a2", blue: "#2F5D8C" };
const QUOTE = "A narrow shaft opens in the bone — a vertical tunnel lined with soft, living tissue. The Blue‑Born climb, feeling the temperature rise, feeling the pulse grow louder.";

const STAGE = [
  { top: 24, ledges: [], heat: 1e9, budget: 110, reachAt: 1e9, bpm: [66, 66], breathe: false, stencils: [] },
  { top: 38, ledges: [{ y: 9, kind: "pull" }, { y: 20, kind: "brace" }, { y: 31, kind: "pull" }], heat: 30, budget: 190, reachAt: 4, bpm: [68, 72], breathe: true, stencils: [6, 15, 18, 26, 36] },
  { top: 27, ledges: [{ y: 6, kind: "brace" }, { y: 18, kind: "last" }], heat: 0, budget: 170, reachAt: 0, bpm: [72, 76], breathe: true, stencils: [4, 12, 24], wall: true },
];

export default ladder(run, {
  theme: { bg: "#e6d2b0", fg: "#1d1612", accent: "#b3202e", ink: "#E8DCC4" },
  next: [null, "Next: two ledges too high for one, a wall that breathes in on every fourth beat, and old hands in the rock that always hold.",
    "Next: the hot upper shaft, a last ledge taller than the others, and the gallery above it."],
});

function run(root, api, ctl) {
  {
    const SG = ctl.stage, CF = STAGE[SG];
    const P = "heartstream-climb-";
    const rng = api.rng();
    const RM = api.reducedMotion;
    const streak = new Streak(api);
    const TOP = CF.top, LEDGES = CF.ledges;
    const HEAT = CF.heat, BUDGET = CF.budget, REACH_AT = CF.reachAt, STENCILS = CF.stencils;
    let GENTLE = false;
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    const rockBg = `radial-gradient(circle at 20% 30%,rgba(91,70,54,.18) 0 2px,transparent 3px),radial-gradient(circle at 70% 60%,rgba(91,70,54,.14) 0 1.5px,transparent 2.5px),linear-gradient(170deg,#e6d2b0,#d5bd96)`;
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:#cdb795;font-family:var(--g-body);color:${C.char};user-select:none;-webkit-user-select:none;touch-action:none}
.${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:10px;background:linear-gradient(0deg,rgba(29,22,18,.6),rgba(29,22,18,0))}
.${P}pad button{font:700 16px var(--g-body);color:${C.bone};background:${C.ochre};border:3px solid ${C.char};border-radius:18px 14px 20px 12px;padding:10px 16px;min-width:104px;min-height:50px;cursor:pointer;touch-action:none;transition:transform .08s}
.${P}pad button small{display:block;font-size:12px;font-weight:400;opacity:.85}
.${P}pad button:hover{background:#b9653a}
.${P}pad button[aria-pressed=true]{background:${C.char};transform:scale(.96)}
.${P}pad button[hidden]{display:none}
.${P}pad button.${P}reach{background:${C.red}}
.${P}hud{position:absolute;left:10px;top:10px;padding:8px 12px;background:rgba(230,210,176,.9);border:2px solid ${C.char};border-radius:14px 10px 16px 8px;font-size:14px;line-height:1.5;min-width:170px}
.${P}hud b{font-size:12px;letter-spacing:.12em}
.${P}hud .${P}bar{height:10px;border:2px solid ${C.char};border-radius:6px;margin:2px 0 4px;overflow:hidden;background:#efe0c3}
.${P}hud .${P}bar i{display:block;height:100%;background:${C.red};transition:width .3s}
.${P}hud .${P}heat{color:${C.red};font-weight:700}
.${P}crew{display:flex;gap:3px;margin-top:4px}
.${P}crew img{height:40px;width:auto;border:1.5px solid ${C.char}}
.${P}crew img:first-child{border:2px solid ${C.red}}
.${P}legend{position:absolute;right:10px;top:10px;margin:0;padding:8px 12px;list-style:none;background:rgba(230,210,176,.9);border:2px solid ${C.char};border-radius:16px 10px 14px 12px;font-size:14px;line-height:1.55;max-width:240px}
.${P}legend b{color:${C.deep}}
.${P}legend li::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:${C.red};margin-right:6px;box-shadow:5px 1px 0 ${C.red}}
.${P}legend li.${P}new{animation:${P}glow 1.2s ease-in-out 2}
@keyframes ${P}glow{50%{background:rgba(242,181,68,.6)}}
.${P}beat{position:absolute;left:50%;top:120px;transform:translateX(-50%);width:min(520px,calc(100% - 24px));box-sizing:border-box;padding:12px 18px;background:rgba(230,210,176,.95);border:3px solid ${C.char};border-radius:28px 18px 32px 14px;font-family:var(--g-display);font-size:19px;line-height:1.3;text-align:center}
.${P}beat b{display:block;font-family:var(--g-body);font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${C.deep}}
.${P}beat.${P}in{animation:${P}fade .5s ease-out}
@keyframes ${P}fade{from{opacity:0;transform:translate(-50%,8px)}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(29,22,18,.5);overflow:auto;z-index:4}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:${rockBg};background-size:23px 23px,31px 31px,auto;border:3px solid ${C.char};border-radius:30px 20px 34px 18px;padding:22px 24px 20px;overflow:hidden}
.${P}card::after{content:"";position:absolute;right:-18px;bottom:-24px;width:150px;height:170px;opacity:.38;pointer-events:none;
  background:radial-gradient(ellipse 34px 40px at 50% 62%,${C.red} 60%,transparent 62%),radial-gradient(ellipse 9px 34px at 22% 30%,${C.red} 60%,transparent 62%),radial-gradient(ellipse 9px 42px at 38% 20%,${C.red} 60%,transparent 62%),radial-gradient(ellipse 9px 44px at 54% 17%,${C.red} 60%,transparent 62%),radial-gradient(ellipse 9px 40px at 70% 22%,${C.red} 60%,transparent 62%),radial-gradient(ellipse 9px 26px at 86% 50%,${C.red} 60%,transparent 62%);filter:blur(1.5px)}
.${P}kick{font:700 13px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:${C.ochre}}
.${P}card h2{font-family:var(--g-display);font-size:34px;margin:2px 0 6px;color:${C.char}}
.${P}q{font-family:var(--g-display);font-style:italic;font-size:17px;line-height:1.35;margin:0 0 10px;padding-left:12px;border-left:4px solid ${C.ochre}}
.${P}scene{margin:0 0 10px;font-size:15px;line-height:1.45}
.${P}goal{margin:0 0 10px;font-size:16px;line-height:1.4}
.${P}goal b{display:inline-block;background:${C.char};color:${C.bone};padding:1px 8px;border-radius:8px 4px 10px 4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin-right:6px}
.${P}keys{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:7px;position:relative;z-index:1}
.${P}keys li{display:grid;grid-template-columns:86px 1fr;gap:0 10px;font-size:15px;align-items:baseline}
.${P}kv{background:${C.ochre};color:${C.bone};padding:2px 8px;border-radius:12px 8px 14px 6px;text-align:center}
.${P}kc{font-weight:700}
.${P}kw{grid-column:2;font-size:14px;opacity:.85}
.${P}extra{font-size:14px;margin:0 0 12px;position:relative;z-index:1}
.${P}extra label{display:flex;gap:8px;align-items:center;cursor:pointer;padding:6px 8px;border:2px dashed ${C.ochre};border-radius:12px}
.${P}start{position:relative;z-index:1;font:700 17px var(--g-body);background:${C.red};color:${C.bone};border:3px solid ${C.char};border-radius:16px 10px 18px 12px;padding:10px 28px;cursor:pointer}
.${P}start:hover{background:${C.deep}}
.${P}shake{animation:${P}shk .3s}
@keyframes ${P}shk{30%{transform:translateY(3px)}70%{transform:translateY(-2px)}}
@media (max-width:620px){.${P}crew img{height:28px}.${P}legend{display:none}.${P}hud{font-size:13px;min-width:140px}.${P}beat{top:110px;font-size:17px}.${P}pad button{min-width:80px;padding:8px 10px}}
`;
    const cv = document.createElement("canvas");
    const pad = document.createElement("div"); pad.className = P + "pad";
    const mkb = (html, cls) => { const b = document.createElement("button"); b.type = "button"; b.innerHTML = html; if (cls) b.className = cls; pad.appendChild(b); return b; };
    const bGrab = mkb("Grab<small>Space · ↑</small>");
    const bReach = mkb("Reach<small>R · Shift</small>", P + "reach");
    const bBrace = mkb("Brace<small>hold B · ↓</small>");
    bBrace.setAttribute("aria-pressed", "false");
    bReach.hidden = true; bBrace.hidden = true;
    const hud = document.createElement("div"); hud.className = P + "hud";
    hud.innerHTML = `<b>HEARTBEATS LEFT</b> <span data-h="beats"></span><div class="${P}bar"><i></i></div><span data-h="m"></span><br><span data-h="lifts"></span><div class="${P}heat" data-h="heat" hidden>HEAT · holds slicker</div>`;
    const offer = streak.losses >= 2;
    const gentleBox = offer ? `<label><input type="checkbox" class="${P}gentle"> Gentle Current: the beat window widens to ±200 ms</label>` : "";
    const intro = howTo(P, [{
      kicker: "Chapter five · the shaft",
      title: "The climb",
      quote: `“${QUOTE}”`,
      scene: "You climb beside the one who dreams. The one who argues and the one who fears are already above you, small against the rock.",
      goal: "Climb the first pitch on the heart's beat. The count is long here: learn the hold.",
      keys: [["Grab", "Space · ↑ · Grab · tap the rock", "on the beat the hold is firm; off it, you slide down one"]],
      extra: `<p style="margin:0 0 8px">More moves come in the pitches above.</p>${gentleBox}`,
    }, {
      kicker: "Chapter five · the ledges",
      title: "Brace and pull",
      scene: "Two ledges are too high for one. Between them the shaft breathes: on every fourth beat it draws in.",
      goal: "Reach the top of the pitch with your brother before the heartbeats run out.",
      keys: [["Pull", "Grab, on the beat", "on his shoulders, then three pulls lift him"], ["Brace", "hold B · ↓ · Brace", "be his step; in the heat, cling when the holds glisten"],
        ["Reach", "R · Shift · Reach", "two holds, dead on the beat; a miss slides you two"], ["Breathing", "stay level with him", "when the wall draws in, two chimney through; one alone is squeezed down"],
        ["Old hands", "any Grab", "a hand stencilled in the rock is always firm, and yours stays beside it"]],
      extra: gentleBox,
    }, {
      kicker: "Chapter five · the last ledge",
      title: "The last ledge",
      scene: "The two ahead are over the top. The last ledge is taller than the others, and after it there is a gallery.",
      goal: "Get both of you over the last ledge, and put your hands on the wall with the others.",
      keys: [["The step", "hold Brace", "if pulling does not reach him, the one who is up climbs back down"], ["The wall", "Grab on the count of four", "all four press a bare row on one beat"]],
      extra: gentleBox,
    }][SG]);
    stagePicker(P, intro, ctl);
    // a later crossing: your group's hands from the last one are on the Stencil Wall
    const lastX = secondRun(api) ? marks(api).last() : null;
    if (lastX && SG === 2) introNote(P, intro, "The wall, this time", "Somewhere on the Stencil Wall is a row of four hands you know. You pressed it, last crossing.");
    plate(api, intro, P, { card: "chapter-5", numeral: "numeral-5", css: "border-radius:18px 12px 20px 10px;border:3px solid #1d1612", at: "50% 30%" });
    { // the four in the shaft: you, the one beside you, the two ahead
      const crew = document.createElement("div"); crew.className = P + "crew";
      ["laughs", "dreams", "argues", "fears"].forEach((t) => { const im = artImg(api, `seat-${t}-turning`, "", "the one who " + t); if (im) crew.appendChild(im); });
      if (crew.children.length) hud.appendChild(crew);
    }
    wrap.append(css, cv, hud, pad);
    const legend = new Legend(P, wrap);
    const beats = new Beats(P, wrap, RM);
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");
    const H$ = (k) => hud.querySelector(`[data-h="${k}"]`);

    let W = 0, H = 0, dpr = 1;
    const resize = () => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    const ro = new ResizeObserver(() => { resize(); kick(); }); ro.observe(wrap); resize();
    // ---- the art: the shaft's back wall (far) and side walls (near), rasterised once per size ----
    const shaftW = () => Math.min(W * 0.56, 420);
    const A = { far: [null, null], near: [null, null], nw: 0, nh: 0 };
    let artJob = 0, artTimer = 0;
    async function loadPlanes() {
      const job = ++artJob, nw = Math.round(shaftW() / 0.72), nh = Math.round(nw * 16 / 9);
      if (!nw || (A.nw === nw && A.far[0])) return;
      const far = [], near = [];
      for (let n = 0; n < 2; n++) {
        far[n] = await raster(api, `climb-${n + 1}-far`, nw, nh); if (job !== artJob) return;
        near[n] = await raster(api, `climb-${n + 1}-near`, nw, nh); if (job !== artJob) return;
      }
      A.far = far; A.near = near; A.nw = nw; A.nh = nh;
    }
    function kick() { clearTimeout(artTimer); artTimer = setTimeout(loadPlanes, 180); }
    loadPlanes();

    // rock texture: a stippled, cracked tile drawn once
    const tile = document.createElement("canvas"); tile.width = 256; tile.height = 256;
    { const t = tile.getContext("2d");
      for (let i = 0; i < 900; i++) { t.fillStyle = `rgba(91,70,54,${0.15 + rng() * 0.3})`; t.beginPath(); t.arc(rng() * 256, rng() * 256, 0.5 + rng() * 1.6, 0, 7); t.fill(); }
      for (let i = 0; i < 5; i++) { t.strokeStyle = "rgba(91,70,54,.35)"; t.lineWidth = 1; t.beginPath(); let x = rng() * 256, y = rng() * 256; t.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (rng() - 0.5) * 50; y += rng() * 30; t.lineTo(x, y); } t.stroke(); } }
    const pattern = g.createPattern(tile, "repeat");
    const stencils = Array.from({ length: 14 }, (_, i) => ({ y: 3 + i * 3.8 + rng() * 2, side: i % 2 ? 1 : -1, rot: (rng() - 0.5) * 0.8, red: rng() < 0.65, s: 0.7 + rng() * 0.4 }));

    const st = { started: false, over: false, me: 0, mate: 0, ahead: 4, phase: "climb", ledge: -1, sub: 0, lifts: 0, slips: 0, reaches: 0, clings: 0,
      firm: 0, beatsLeft: BUDGET, brace: false, msg: "", msgT: 0, flash: 0, cam: 0, lastPress: -1, slickNext: false, slickNow: false, bad: 0, good: 0,
      n: 0, narrow: 0, chimneys: 0, squeezes: 0, prints: [], shortTries: 0, row: 1, wallLit: 0, wallMiss: 0, stepped: false };
    const narrowsOn = (n) => CF.breathe && n > 4 && n % 4 === 0;      // the breathing wall: every fourth beat
    const wall = { img: null };
    let nextBeat = 0, raf = 0, audio = null, lastNow = performance.now();
    const presses = [], fx = [];
    const bpmAt = (y) => CF.bpm[0] + (CF.bpm[1] - CF.bpm[0]) * Math.min(1, y / TOP);
    let beatTimes = [];
    const say = (m) => { st.msg = m; st.msgT = 2000; };
    const windowMs = () => (GENTLE ? 200 : st.me >= HEAT ? 90 : 120);
    const perfectMs = () => (GENTLE ? 110 : 60);

    function thump(slick) {
      if (!audio) return;
      const t = audio.currentTime;
      [[0, 60], [0.15, 48]].forEach(([dt, f]) => {
        const o = audio.createOscillator(), v = audio.createGain();
        o.frequency.setValueAtTime(f * 1.5, t + dt); o.frequency.exponentialRampToValueAtTime(f, t + dt + 0.12);
        v.gain.setValueAtTime(0.0001, t + dt); v.gain.exponentialRampToValueAtTime(0.25 + st.me / TOP * 0.3, t + dt + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.2);
        o.connect(v).connect(audio.destination); o.start(t + dt); o.stop(t + dt + 0.25);
      });
      if (slick) { const o = audio.createOscillator(), v = audio.createGain(); o.type = "triangle"; o.frequency.value = 1200; v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.05, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 0.32); }
    }
    const ledgeAt = (i) => LEDGES[i];
    const floorOf = (y) => Math.max(0, ...LEDGES.filter((l) => l.y + 2.4 <= y).map((l) => l.y + 2.4));

    // ---- unlocks --------------------------------------------------------------------------------
    const timers = [];
    function unlock(k, quiet) {
      if (quiet) { if (k === "brace" && legend.add("brace", "Brace", "hold B · ↓ · Brace", true)) bBrace.hidden = false; return; }
      if (k === "pull" && legend.add("pull", "Pull", "Space · Grab, on the beat", true))
        beats.show("Too high for one. He braces at the foot; climb his shoulders on the beat, then reach down and pull him up on three beats.", 5600, "pull", "The first ledge · New · Pull");
      if (k === "reach" && legend.add("reach", "Reach", "R · Shift · Reach", true)) {
        bReach.hidden = false;
        beats.show("“Look up.” The holds spread wider here. Reach for the one beyond: dead on the beat it gains two holds, but a miss slides you two.", 6000, "reach", "The one who dreams · New · Reach");
      }
      if (k === "brace" && legend.add("brace", "Brace", "hold B · ↓ · Brace", true)) {
        bBrace.hidden = false;
        beats.show("Your turn to be the step. Hold Brace at the foot of the ledge while he climbs you, then take his hand on the beat.", 5600, "brace", "The second ledge · New · Brace");
      }
      if (k === "heat") {
        H$("heat").hidden = false;
        legend.add("cling", "Cling", "hold Brace when the holds glisten", true);
        beats.show("The rock is warm now and the pulse is loud. When the holds glisten white, the next beat is slick for everyone: hold Brace and cling through it.", 6400, "heat", "The upper shaft · New · Cling");
      }
    }

    // ---- one press: judged against the nearest beat --------------------------------------------
    function press(kind) {
      if (!st.started || st.over) return;
      const now = performance.now();
      let k = 0, best = Infinity;
      for (let i = Math.max(0, nextBeat - 2); i < beatTimes.length; i++) { const d = Math.abs(now - beatTimes[i]); if (d < best) { best = d; k = i; } }
      if (k === st.lastPress) return; // one action per beat
      st.lastPress = k;
      const ok = best <= windowMs(), perfect = best <= perfectMs();
      const slickBeat = k === nextBeat - 1 ? st.slickNow : k === nextBeat ? st.slickNext : false;
      presses.push({ t: now, on: ok });
      if (st.phase === "wall") return pressWall(k, ok);
      if (st.phase === "lit") return;
      if (ok) st.good++; else st.bad++;
      if (st.phase === "climb") {
        if (kind === "reach" && !legend.has("reach")) kind = "grab";
        const old = kind === "grab" && STENCILS.includes(Math.floor(st.me) + 1);   // an old hand in the rock: always firm
        if (old && !(ok && !slickBeat)) say("An old hand in the rock: firm, on the beat or off it.");
        if (old && !st.prints.includes(Math.floor(st.me) + 1)) { st.prints.push(Math.floor(st.me) + 1); beats.show("An earlier group's hand, blown in red on the rock. The hold under it is always firm. Your own hand is beside it now.", 4600, "stencil", "Old stencils"); }
        if (old || (ok && !slickBeat)) {
          const gain = kind === "reach" ? (perfect ? 2 : 1) : 1;
          let target = Math.min(TOP, st.me + gain);
          const L = LEDGES.find((l) => st.me < l.y && target >= l.y);
          if (L) target = L.y;
          st.me = target; st.firm++;
          fx.push({ kind: gain === 2 ? "reach" : "firm", t: now });
          if (kind === "reach") { st.reaches++; say(gain === 2 ? "A long reach. Two holds." : "Short of the far hold: one."); }
          if (L) {
            st.phase = L.kind === "brace" ? "brace" : "shoulders"; st.ledge = LEDGES.indexOf(L); st.sub = 0;
            if (L.kind === "pull") { unlock("pull"); say("Too high for one. Grab on the beat to climb his shoulders."); }
            else if (L.kind === "last") { legend.add("pull", "Pull", "Space · Grab, on the beat"); say("The last ledge. Grab on the beat to climb his shoulders."); beats.show("The last ledge, and the tallest. He braces at its foot without being asked.", 3600, "last0", "The last ledge"); }
            else { unlock("brace"); say("Too high for one. Hold Brace and be his step."); }
          }
        } else {
          const drop = kind === "reach" ? 2 : 1;
          st.me = Math.max(floorOf(st.me), st.me - drop); st.slips++;
          fx.push({ kind: "slip", t: now }); flourish(wrap, P + "shake", RM, 300);
          say(slickBeat ? "The hold glistened: slick. Cling on those beats." : best < 0 ? "Early: the hold is slick." : "Late: the hold is slick.");
        }
      } else if (st.phase === "shoulders") {
        if (st.mate < ledgeAt(st.ledge).y) say("Wait for him to reach the foot of the ledge.");
        else if (ok) { st.sub++; fx.push({ kind: "firm", t: now }); if (st.sub === 1) say("On his shoulders. Again, on the beat."); else { st.me = ledgeAt(st.ledge).y + 2.4; st.phase = ledgeAt(st.ledge).kind === "last" ? "short" : "pull"; st.sub = 0; say("Over the edge. Reach down: pull on three beats."); } }
        else { fx.push({ kind: "slip", t: now }); say("Slick. Wait for the beat."); }
      } else if (st.phase === "pull") {
        if (ok) { st.sub++; fx.push({ kind: "firm", t: now }); if (st.sub >= 3) { st.mate = ledgeAt(st.ledge).y + 2.4; st.lifts++; st.phase = "climb"; say("Lifted. Climb on."); fx.push({ kind: "lift", t: now }); } else say(`Pull ${st.sub} of 3.`); }
        else { st.sub = Math.max(0, st.sub - 1); fx.push({ kind: "slip", t: now }); say("His hand slips. Pull on the beat."); }
      } else if (st.phase === "short") {
        // the twist: the safe move (pull) is wrong here. His hand does not reach, and nobody is under him.
        st.shortTries++; fx.push({ kind: "slip", t: now });
        say("Your hand does not reach his. Nobody is under him.");
        unlock("brace", true);
        beats.show("He was your step, and there is nobody to be his. The two above cannot reach either. The one who is up has to climb back down: hold Brace.", 6200, "short", "Pulling does not reach");
      } else if (st.phase === "take") {
        if (ok) { st.phase = "pulled"; st.sub = 0; fx.push({ kind: "firm", t: now }); say("He has your hand. Hold on."); }
        else say("Take his hand on the beat.");
      } else if (st.phase === "brace") say("Hold Brace: he climbs you.");
    }
    function pressWall(k, ok) {
      if (st.row === 0) { say("That gap is somebody's. He stayed. Take the bare row."); return; }
      const count = ((k - st.wallK) % 4 + 4) % 4;
      if (ok && count === 3) {
        st.phase = "lit"; st.wallLit = performance.now(); st.good++;
        say("Four hands, one beat.");
        beats.show("Four hands on the bare row, on one beat, and the whole wall lights: every group that ever climbed, in rows of four. Some rows have three.", 5600, "lit", "The Stencil Wall");
        // phase 3: the second of the Four Marks, in the gap of the row of three
        timers.push(setTimeout(() => { if (st.over) return; revealMark(root, api, "wall", "As the light reaches the row of three you see what is in its gap. Not a hand: a spiral, scratched with a tool rather than blown, at the height of the fourth of five notches cut down the gap's edge. His brothers cut it for him. That gap is somebody's, and he stayed.", () => finish(true)); }, RM ? 1400 : 4200));
      } else { st.wallMiss++; st.bad++; say(count === 3 ? "Three hands, and yours a moment after. The wall stays dark." : "Not yet. They press on the fourth beat: count with them."); flourish(wrap, P + "shake", RM, 300); }
    }
    function enterWall() {
      st.phase = "wall"; st.wallK = nextBeat + 1; st.row = 1; setBrace(false);
      bReach.hidden = true; bBrace.hidden = true; bGrab.innerHTML = "Press<small>Space · on four</small>";
      legend.add("press", "Press", "Space · tap the bare row, on the fourth beat", true);
      beats.show("Above the last ledge the shaft opens into a gallery. Hundreds of hands, in rows of four. One row is bare. The others are already standing at it: press your hand with theirs, on the fourth beat.", 7000, "wall", "The Stencil Wall");
      raster(api, "climb-stencil-wall", 1600, 900, "fill").then((c) => { wall.img = c; });
      if (lastX) timers.push(setTimeout(() => beats.show("High on the wall, a row of four you know: your own hands, from the last crossing, already dry. Somebody else's group will walk past them.", 6000, "ownrow", "Your row"), RM ? 0 : 7200));
    }
    function onBeat() {
      thump(st.slickNext); st.flash = 1; st.beatsLeft--; st.n++;
      if (st.phase === "wall" || st.phase === "lit") { if (st.beatsLeft <= 0 && st.phase === "wall") return finish(false); return; }
      st.slickNow = st.slickNext;
      // the breathing wall: on every fourth beat the shaft draws in
      if (narrowsOn(st.n) && st.phase === "climb" && st.me >= 2) {
        if (Math.abs(st.me - st.mate) <= 1.25) { st.chimneys++; fx.push({ kind: "cling", t: performance.now() }); say("Back to back with him: you chimney through."); }
        else { st.me = Math.max(floorOf(st.me), st.me - 1); st.squeezes++; st.slips++; fx.push({ kind: "slip", t: performance.now() }); flourish(wrap, P + "shake", RM, 300); say(st.me > st.mate ? "Alone in the narrowing: squeezed down a hold. Wait for him." : "Alone in the narrowing: squeezed down a hold. Keep up with him."); }
      }
      if (CF.breathe && narrowsOn(st.n + 1) && st.phase === "climb") beats.show("The shaft breathes. On every fourth beat the walls draw in: two on opposite walls chimney through; one alone is squeezed down a hold. Stay level with him.", 5800, "breathe", "The breathing wall");
      // in the heat, some beats are slick; they glisten one beat ahead
      st.slickNext = st.me >= HEAT && st.phase === "climb" && !st.slickNow && !narrowsOn(st.n + 1) && rng() < 0.3;
      if (st.slickNow && st.phase === "climb") {
        if (st.brace) { st.clings++; fx.push({ kind: "cling", t: performance.now() }); say("You cling through the slick beat."); }
        else { st.me = Math.max(floorOf(st.me), st.me - 1); st.slips++; fx.push({ kind: "slip", t: performance.now() }); flourish(wrap, P + "shake", RM, 300); say("The hold went slick under you. Brace when they glisten."); }
      }
      const L = st.ledge >= 0 ? ledgeAt(st.ledge) : null;
      if (st.phase === "climb") {
        if (st.mate < st.me + 0.5 && rng() < 0.9) st.mate = Math.min(st.me + 0.6, st.mate + 1);
        const cap = LEDGES.find((l) => l.y > st.mate - 0.01 && l.y <= st.me + 1);
        if (cap && st.mate > cap.y && st.mate < cap.y + 2.4 && st.me < cap.y + 2.4) st.mate = cap.y;
      } else if (L) {
        if (st.mate < L.y) st.mate = Math.min(L.y, st.mate + 1);
        if (st.phase === "short" && st.brace) { st.me = L.y; st.phase = "brace"; st.sub = 0; st.stepped = true; say("You climb back down and set your shoulders under him."); beats.show("You come back down the ledge you had just won, and set your back against the rock. He looks at you, and climbs.", 4600, "stepdown", "The step"); }
        if (st.phase === "brace" && st.mate >= L.y) {
          if (st.brace) { if (rng() < 0.9) { st.sub++; if (st.sub === 1) say("He is on your shoulders. Keep bracing."); if (st.sub >= 2) { st.mate = L.y + 2.4; st.phase = "take"; st.sub = 0; say("He reaches down. Grab his hand on the beat."); } } }
          else if (st.sub > 0) { st.sub = 0; say("You stood up too soon. He slides back. Hold Brace."); }
        } else if (st.phase === "pulled") {
          if (rng() < 0.9) { st.sub++; if (st.sub >= 3) { st.me = L.y + 2.4; st.lifts++; st.phase = "climb"; say("Up. Climb on."); fx.push({ kind: "lift", t: performance.now() }); } }
        }
      }
      st.ahead += ((Math.min(TOP, Math.max(st.me, st.mate) + 5) - st.ahead) * 0.25);
      if (st.me >= REACH_AT && SG === 1) unlock("reach");
      if (st.me >= HEAT && SG === 1) unlock("heat");
      if (st.me >= TOP - 6) beats.show("Light above, red and gold. The pulse is loud enough to feel in your teeth.", 4200, "light");
      if (st.beatsLeft === 30) beats.show("Thirty heartbeats left. The light is still above you.", 3600, "low");
      if (st.me >= TOP && st.mate >= TOP - 1) return CF.wall ? enterWall() : finish(true);
      if (st.me >= TOP) st.mate = Math.min(TOP, st.mate + 1);
      if (st.beatsLeft <= 0) return finish(false);
    }
    function finish(win) {
      if (st.over) return; st.over = true;
      streak.record(win ? "win" : "lose");
      const sync = Math.min(70, 50 + 3 * st.lifts + (SG === 2 && win ? Math.max(0, 8 - 4 * st.wallMiss) : 0));
      const acc = st.good + st.bad ? Math.round((100 * st.good) / (st.good + st.bad)) : 0;
      const winText = SG === 0 ? `The first pitch is under you, and the one who dreams is beside you. ${acc}% of your grabs were firm, ${st.slips} slip${st.slips === 1 ? "" : "s"}. The heart keeps its own time: you have begun to wait for it.`
        : SG === 1 ? `Over both ledges, the one who dreams beside you. ${st.lifts} lift${st.lifts === 1 ? "" : "s"} made together, ${acc}% of your grabs firm${st.chimneys ? `, ${st.chimneys} narrowing${st.chimneys === 1 ? "" : "s"} chimneyed through back to back` : ""}${st.squeezes ? `, squeezed down ${st.squeezes} time${st.squeezes === 1 ? "" : "s"}` : ""}${st.prints.length ? `; your hand is beside ${st.prints.length} old one${st.prints.length === 1 ? "" : "s"} in the rock` : ""}.`
        : `The wall lights under four hands. Rows of four, as far as the light reaches, and here and there a row of three. ${st.stepped ? "You climbed back down to be his step; nobody had to ask twice." : ""} ${st.wallMiss ? `The press took ${st.wallMiss + 1} tries;` : "You pressed with them the first time;"} the raft's sync will start at ${sync}.`;
      ctl.end(win
        ? { outcome: "win", text: winText }
        : { outcome: "lose", text: st.phase === "wall" ? `The count ran out with three hands on the wall and yours not among them. The heart keeps its own time: wait for the fourth beat.` : `The count ran out ${Math.max(1, Math.round(TOP - st.me))} m below the ${SG === 2 ? "gallery" : "light"}. Nobody falls in the shaft; ${st.slips} slip${st.slips === 1 ? "" : "s"} cost you the height. The heart keeps its own time: wait for it.${streak.losses >= 2 ? " (Gentle Current is offered on the next start.)" : ""}` },
        () => endCard(wrap, api, win ? (SG === 2 ? "climb-stencil-wall" : "chapter-6") : "chapter-5", win && SG === 2 ? {} : { numeral: win ? "numeral-6" : "numeral-5" }));
    }

    const setBrace = (v) => { st.brace = v; bBrace.setAttribute("aria-pressed", String(v)); };
    on(bGrab, "pointerdown", (e) => { e.preventDefault(); press("grab"); });
    on(bReach, "pointerdown", (e) => { e.preventDefault(); press("reach"); });
    on(bBrace, "pointerdown", (e) => { e.preventDefault(); setBrace(true); });
    on(bBrace, "pointerup", () => setBrace(false)); on(bBrace, "pointercancel", () => setBrace(false)); on(bBrace, "pointerleave", () => setBrace(false));
    on(cv, "pointerdown", (e) => {
      e.preventDefault();
      if (st.phase === "wall") { const r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height; st.row = y < 0.36 ? 0 : 1; if (st.row === 0) { say("That gap is somebody's. He stayed. Take the bare row."); return; } }
      press("grab");
    });
    on(window, "keydown", (e) => {
      if (!st.started) { if (e.target && e.target.dataset && e.target.dataset.stage) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); } return; }
      const k = e.key.toLowerCase();
      if (st.phase === "wall" && (k === "arrowup" || k === "arrowdown")) { e.preventDefault(); st.row = k === "arrowup" ? 0 : 1; say(st.row === 0 ? "The row of three, and its gap." : "The bare row."); return; }
      if (k === " " || k === "arrowup" || k === "w") { e.preventDefault(); if (!e.repeat) press("grab"); }
      else if (k === "r" || k === "shift") { e.preventDefault(); if (!e.repeat) press("reach"); }
      else if (k === "b" || k === "arrowdown" || k === "s") { e.preventDefault(); setBrace(true); }
    });
    on(window, "keyup", (e) => { const k = e.key.toLowerCase(); if (k === "b" || k === "arrowdown" || k === "s") setBrace(false); });
    on(intro.querySelector("." + P + "start"), "click", () => start());

    function start() {
      if (st.started) return;
      const gc = intro.querySelector("." + P + "gentle"); if (gc && gc.checked) GENTLE = true;
      intro.remove();
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      st.started = true; beatTimes = [performance.now() + 700];
      legend.add("grab", "Grab", "Space · ↑ · tap");
      if (SG === 0) beats.show("The holds tighten on the heartbeat. Grab as the dab reaches the line.", 4000, "open", "The lower shaft");
      if (SG === 2) { legend.add("reach", "Reach", "R · Shift · Reach"); bReach.hidden = false; legend.add("brace", "Brace", "hold B · ↓ · Brace"); bBrace.hidden = false; H$("heat").hidden = false; legend.add("cling", "Cling", "hold Brace when the holds glisten"); beats.show("The rock is hot here. Everything the shaft has taught you still holds. Almost everything.", 4200, "open", "The upper shaft"); }
      bGrab.focus();
    }

    // ---- drawing --------------------------------------------------------------------------------
    function figure(x, y, pose, col, s, me) {
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 5 * s; g.lineCap = "round"; g.lineJoin = "round";
      const hy = y - 50 * s;
      g.beginPath(); g.arc(x, hy - 9 * s, 8 * s, 0, 7); g.fill();
      g.beginPath();
      if (pose === "brace") {
        g.moveTo(x, hy); g.lineTo(x, y - 24 * s); g.moveTo(x, y - 24 * s); g.lineTo(x - 14 * s, y - 12 * s); g.lineTo(x - 12 * s, y);
        g.moveTo(x, y - 24 * s); g.lineTo(x + 14 * s, y - 12 * s); g.lineTo(x + 12 * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x - 18 * s, hy - 10 * s); g.moveTo(x, hy + 6 * s); g.lineTo(x + 18 * s, hy - 10 * s);
      } else if (pose === "reach") {
        g.moveTo(x, hy); g.lineTo(x - 6 * s, y - 16 * s); g.lineTo(x - 22 * s, y); g.moveTo(x - 6 * s, y - 16 * s); g.lineTo(x + 8 * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x + 16 * s, hy + 26 * s); g.lineTo(x + 20 * s, y + 18 * s);
      } else if (pose === "cling") {
        g.moveTo(x, hy); g.lineTo(x, y - 18 * s); g.lineTo(x - 10 * s, y - 6 * s); g.lineTo(x - 6 * s, y + 2 * s);
        g.moveTo(x, y - 18 * s); g.lineTo(x + 10 * s, y - 6 * s); g.lineTo(x + 6 * s, y + 2 * s);
        g.moveTo(x, hy + 6 * s); g.lineTo(x - 14 * s, hy - 6 * s); g.moveTo(x, hy + 6 * s); g.lineTo(x + 14 * s, hy - 6 * s);
      } else {
        const a = pose === "climb2" ? -1 : 1;
        g.moveTo(x, hy); g.lineTo(x, y - 20 * s); g.lineTo(x - 12 * a * s, y - 8 * s); g.lineTo(x - 8 * a * s, y + 4 * s);
        g.moveTo(x, y - 20 * s); g.lineTo(x + 12 * a * s, y - 12 * s); g.lineTo(x + 14 * a * s, y);
        g.moveTo(x, hy + 6 * s); g.lineTo(x + 14 * a * s, hy - 20 * s); g.moveTo(x, hy + 6 * s); g.lineTo(x - 16 * a * s, hy + 14 * s);
      }
      g.stroke();
      if (me) {
        g.font = "700 14px sans-serif"; g.textAlign = "center";
        const tw = g.measureText("YOU").width + 10; g.fillStyle = "rgba(230,210,176,.85)"; g.fillRect(x - tw / 2, hy - 40 * s, tw, 18);
        g.fillStyle = C.char; g.fillText("YOU", x, hy - 26 * s);
      }
    }
    function stencil(x, y, s, rot, red) {
      const grad = g.createRadialGradient(x, y, 0, x, y, 60 * s);
      grad.addColorStop(0, red ? "rgba(179,32,46,.55)" : "rgba(29,22,18,.55)"); grad.addColorStop(1, "rgba(179,32,46,0)");
      g.fillStyle = grad; g.beginPath(); g.arc(x, y, 60 * s, 0, 7); g.fill();
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * 0.55, s * 0.55); g.fillStyle = "#e3cdaa";
      g.beginPath(); g.ellipse(0, 8, 26, 30, 0, 0, 7); g.fill();
      [[-30, 52, -38], [-13, 72, -12], [4, 76, 2], [20, 68, 14], [36, 40, 52]].forEach(([bx, ln, ang]) => {
        g.save(); g.translate(bx * 0.75, Math.abs(bx) < 30 ? -12 : 6); g.rotate((ang * Math.PI) / 180); g.beginPath(); g.ellipse(0, -ln / 2, 7, ln / 2 + 4, 0, 0, 7); g.fill(); g.restore();
      });
      g.restore();
    }
    function drawWall(now) {
      // The Stencil Wall: the gallery plate, a row of three with its gap, and the bare row the four press
      g.fillStyle = "#cdb795"; g.fillRect(0, 0, W, H);
      if (wall.img) { const k = Math.max(W / 1600, H / 900), w = 1600 * k, h = 900 * k; g.drawImage(wall.img, (W - w) / 2, (H - h) / 2, w, h); g.fillStyle = "rgba(29,22,18,.38)"; g.fillRect(0, 0, W, H); }
      const lit = st.phase === "lit", a = lit ? Math.min(1, (now - st.wallLit) / 900) : 0;
      if (lit) { g.fillStyle = `rgba(255,236,190,${0.34 * a})`; g.fillRect(0, 0, W, H); }
      const rowW = Math.min(W - 24, 520), x0 = (W - rowW) / 2, hs = Math.max(0.62, Math.min(1, rowW / 520));
      const rows = [H * 0.24, H * 0.5];
      rows.forEach((y, r) => {
        g.fillStyle = "rgba(230,210,176,.9)"; g.strokeStyle = st.row === r ? C.red : C.char; g.lineWidth = st.row === r ? 4 : 2;
        g.beginPath(); g.roundRect ? g.roundRect(x0, y - 52 * hs, rowW, 104 * hs, 18) : g.rect(x0, y - 52 * hs, rowW, 104 * hs); g.fill(); g.stroke();
        for (let i = 0; i < 4; i++) {
          const x = x0 + rowW * (i + 0.5) / 4;
          if (r === 0) { if (i === 2) { g.setLineDash([5, 6]); g.strokeStyle = "rgba(29,22,18,.5)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30 * hs, 0, 7); g.stroke(); g.setLineDash([]); } else stencil(x, y + 8 * hs, hs * 0.95, (i - 1.5) * 0.12, i !== 1); }
          else if (lit) { g.globalAlpha = a; stencil(x, y + 8 * hs, hs * 0.95, (i - 1.5) * 0.1, true); g.globalAlpha = 1; }
          else { g.setLineDash([3, 5]); g.strokeStyle = "rgba(164,83,42,.7)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 30 * hs, 0, 7); g.stroke(); g.setLineDash([]); }
        }
        g.font = "700 13px sans-serif"; g.textAlign = "left"; g.fillStyle = C.char;
        g.fillText(r === 0 ? "a row of three" : lit ? "your row" : "the bare row", x0 + 10, y - 58 * hs);
      });
      // a later crossing: the last crossing's row, high on the wall
      if (lastX) {
        const ry = Math.max(30, rows[0] - 112 * hs), rw = Math.min(rowW * 0.62, 320), rx0 = (W - rw) / 2, gap = lastX.hands === 3;
        g.fillStyle = "rgba(230,210,176,.92)"; g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.rect(rx0, ry - 26 * hs, rw, 52 * hs); g.fill(); g.stroke();
        for (let i = 0; i < 4; i++) if (!(gap && i === 3)) stencil(rx0 + rw * (i + 0.5) / 4, ry + 4 * hs, hs * 0.48, (i - 1.5) * 0.1, i % 2 === 0);
        g.font = "700 12px sans-serif"; g.textAlign = "left"; g.fillStyle = C.char; g.fillText("your row, last crossing", rx0 + 6, ry - 30 * hs);
      }
      // the four at the wall
      const fy = rows[1] + 52 * hs + Math.min(150, H * 0.2);
      for (let i = 0; i < 4; i++) figure(x0 + rowW * (i + 0.5) / 4, fy, "reach", i === 3 ? C.red : i === 2 ? C.ochre : C.char, 0.9, i === 3);
      if (!lit) {
        const k = nextBeat - 1, count = ((k - st.wallK) % 4 + 4) % 4, words = ["ONE", "TWO", "THREE", "PRESS"];
        g.font = `700 ${W < 500 ? 20 : 26}px sans-serif`; g.textAlign = "center";
        words.forEach((w, i) => { g.fillStyle = i === count ? (i === 3 ? C.red : C.char) : "rgba(29,22,18,.35)"; g.fillText(w, W / 2 + (i - 1.5) * (W < 500 ? 78 : 104), rows[1] - 70 * hs - 14); });
      }
    }
    function draw(now) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (st.phase === "wall" || st.phase === "lit") { drawWall(now); return drawLane(now); }
      const PX = Math.max(34, H / 12);
      const low = Math.min(st.me, st.mate);
      const camT = low * PX - H * 0.32;
      st.cam += (camT - st.cam) * (RM ? 1 : 0.12);
      const sy = (m) => H - (m * PX - st.cam);
      const prog = Math.min(1, st.me / TOP);
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `rgb(${233},${195 - prog * 40},${154 - prog * 50})`); bg.addColorStop(0.5, "#d8c3a2"); bg.addColorStop(1, `rgb(${169 + prog * 40},${180 - prog * 40},${189 - prog * 70})`);
      const sw = shaftW(), sxL = W / 2 - sw / 2, sxR = W / 2 + sw / 2;
      const useArt = A.far[0] && A.far[1] && A.near[0] && A.near[1] && Math.abs(A.nw - Math.round(sw / 0.72)) < 3;
      if (useArt) {
        // Both planes are laid from the foot of the shaft to its top and scroll at their own rates, so the
        // foot shows the cool end of plane 1 and the top the warm end of plane 2.
        const nw = A.nw, nh = A.nh, x0 = Math.round(W / 2 - nw / 2), camMax = Math.max(1, TOP * PX - H * 0.32), camNow = Math.max(0, st.cam);
        g.fillStyle = "#2f241f"; g.fillRect(0, 0, W, H);
        const offF = camNow * Math.max(0, (2 * nh - H) / camMax);
        for (let n = 0; n < 2; n++) { const y = H - (n + 1) * nh + offF; if (y < H && y + nh > 0) g.drawImage(A.far[n], x0 + 3, y, nw - 6, nh + 1); }
        // near: [1 whole] [1 mirrored, without its haze] [2 mirrored, without its shimmer] [2 whole]
        const parts = [[0, 0, 1, false], [0, 0, 0.78, true], [1, 0.2, 1, true], [1, 0, 1, false]];
        const total = parts.reduce((a, q) => a + (q[2] - q[1]) * nh, 0), offN = camNow * Math.max(0, (total - H) / camMax);
        let yb = H + offN;
        for (const [n, a0, a1, flip] of parts) {
          const hh = (a1 - a0) * nh, y = yb - hh; yb = y;
          if (y > H || y + hh < 0) continue;
          const c = A.near[n];
          g.save(); if (flip) { g.translate(x0 + nw, 0); g.scale(-1, 1); } else g.translate(x0, 0);
          g.drawImage(c, 0, a0 * c.height, c.width, (a1 - a0) * c.height, 0, y, nw, hh + 1); g.restore();
        }
        g.fillStyle = "#2f241f"; g.fillRect(x0 - 1, 0, 4, H); g.fillRect(x0 + nw - 3, 0, 4, H); // the planes' own edges
      } else {
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.save(); g.translate(0, st.cam % 256); g.fillStyle = pattern; g.fillRect(0, -256, W, H + 512); g.restore();
      }
      const lr = W * (0.25 + 0.5 * prog);
      const lg = g.createRadialGradient(W / 2, Math.min(sy(TOP + 2), 0) - 20, 0, W / 2, Math.min(sy(TOP + 2), 0) - 20, lr);
      lg.addColorStop(0, "rgba(255,243,208,.95)"); lg.addColorStop(0.5, "rgba(242,181,68,.55)"); lg.addColorStop(1, "rgba(224,96,58,0)");
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      if (!useArt) {
      for (const h of stencils) { const y = sy(h.y); if (y < -80 || y > H + 80) continue; stencil(h.side < 0 ? sxL - Math.max(50, (sxL) * 0.5) : sxR + Math.max(50, (W - sxR) * 0.5), y, h.s, h.rot, h.red); }
      g.strokeStyle = C.char; g.lineWidth = 4;
      [sxL, sxR].forEach((x0, side) => { g.beginPath(); for (let y = -20; y <= H + 20; y += 20) { const m = (H - y + st.cam) / PX; const x = x0 + Math.sin(m * 1.3 + side * 2) * 10 + Math.sin(m * 3.1) * 4; y === -20 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
      }
      // holds: paired ochre dabs that tighten on the beat; they glisten white before a slick beat
      const pulse = st.flash, glisten = st.slickNext && st.phase === "climb";
      for (let m = 1; m <= TOP; m++) {
        const y = sy(m); if (y < -20 || y > H + 20) continue;
        if (LEDGES.some((l) => m > l.y && m < l.y + 2.4)) continue;
        const next = m === Math.floor(st.me) + 1 && st.phase === "climb";
        for (const [dx, off] of [[-40, 0], [40, 0.5]]) {
          const x = W / 2 + dx + Math.sin(m * 2.7 + off) * 14, r = (next ? 6 : 4.5) * (1 - 0.3 * pulse);
          g.fillStyle = m <= st.me ? "rgba(122,16,32,.55)" : glisten && m > st.me ? "#fff3dc" : C.red;
          g.beginPath(); g.arc(x - 5, y, r, 0, 7); g.arc(x + 5, y + 1, r, 0, 7); g.fill();
          if (next && dx < 0) { g.strokeStyle = glisten ? "#fff" : C.gold; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, 14 + 4 * pulse, 0, 7); g.stroke(); }
        }
        if (STENCILS.includes(m)) { // an old hand beside the hold; yours beside it once you have used it
          stencil(W / 2 - 96, y - 4, 0.55, -0.3, true);
          if (st.prints.includes(m)) stencil(W / 2 + 96, y - 4, 0.55, 0.3, false);
        }
      }
      // the breathing wall: the shaft draws in on every fourth beat (it shows one beat ahead)
      { const soon = CF.breathe && st.phase === "climb" && narrowsOn(st.n + 1), nowIn = CF.breathe && narrowsOn(st.n) && st.flash > 0.05;
        st.narrow += ((soon ? 1 : nowIn ? 0.6 : 0) - st.narrow) * (RM ? 1 : 0.14);
        if (st.narrow > 0.02) {
          const d = 34 * st.narrow;
          g.fillStyle = "rgba(47,36,31,.82)"; g.fillRect(sxL - 6, 0, d + 6, H); g.fillRect(sxR - d, 0, d + 6, H);
          if (soon) { g.font = "700 13px sans-serif"; g.textAlign = "center"; const t = Math.abs(st.me - st.mate) <= 1.25 ? "THE WALL DRAWS IN · LEVEL WITH HIM" : "THE WALL DRAWS IN · NOT LEVEL"; const tw = g.measureText(t).width + 14;
            g.fillStyle = Math.abs(st.me - st.mate) <= 1.25 ? "rgba(230,210,176,.95)" : C.gold; g.fillRect(W / 2 - tw / 2, 96, tw, 22); g.fillStyle = C.char; g.fillText(t, W / 2, 112); }
        }
      }
      for (const [i, l] of LEDGES.entries()) {
        const y = sy(l.y + 2.4); if (y < -40 || y > H + 60) continue;
        g.fillStyle = "rgba(91,70,54,.25)"; g.fillRect(sxL, y, sw, 2.4 * PX);
        g.strokeStyle = C.char; g.lineWidth = 9; g.beginPath(); g.moveTo(sxL - 10, y); for (let x = sxL; x <= sxR + 10; x += 30) g.lineTo(x, y + Math.sin(x * 0.07 + i) * 3); g.stroke();
      }
      figure(W / 2 - 10, sy(st.ahead), Math.floor(now / 700) % 2 ? "climb" : "climb2", C.char, 0.75, false);
      figure(W / 2 + 30, sy(Math.min(TOP, st.ahead + 1.6)), Math.floor(now / 800) % 2 ? "climb2" : "climb", "#3a2a20", 0.75, false);
      const L = st.ledge >= 0 ? ledgeAt(st.ledge) : null;
      const xMe = W / 2 - 40, xMate = W / 2 + 40;
      let meX = xMe, meY = sy(st.me), matePose = Math.floor(st.mate) % 2 ? "climb" : "climb2", mePose = st.brace && st.phase === "climb" ? "cling" : Math.floor(st.me) % 2 ? "climb" : "climb2", mateX = xMate, mateY = sy(st.mate);
      if (L && st.phase === "shoulders") { matePose = "brace"; mateX = W / 2; mateY = sy(L.y); meX = W / 2; meY = sy(L.y + 0.75 * (st.sub + 1)); }
      if (L && st.phase === "short") { matePose = "climb"; mateX = W / 2 + 16; mateY = sy(L.y); mePose = "reach"; meX = W / 2 - 6; meY = sy(L.y + 2.4); }
      if (L && st.phase === "pull") { matePose = "climb"; mateX = W / 2 + 16; mateY = sy(L.y + (st.sub / 3) * 2.2); mePose = "reach"; meX = W / 2 - 6; meY = sy(L.y + 2.4); }
      if (L && st.phase === "brace") { mePose = "brace"; meX = W / 2; meY = sy(L.y); matePose = "climb"; mateX = W / 2 + (st.sub ? 0 : 40); mateY = sy(st.sub ? L.y + 1.2 : st.mate); }
      if (L && (st.phase === "take" || st.phase === "pulled")) { matePose = "reach"; mateX = W / 2 - 6; mateY = sy(L.y + 2.4); mePose = "climb"; meX = W / 2 + 16; meY = sy(L.y + (st.phase === "pulled" ? (st.sub / 3) * 2.2 : 0)); }
      figure(mateX, mateY, matePose, C.ochre, 1, false);
      figure(meX, meY, mePose, C.red, 1, true);
      // flourishes: ochre dust on a firm grab, a smear on a slip, a hand print on a lift
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], a = (now - f.t) / 650; if (a > 1) { fx.splice(i, 1); continue; }
        const r = RM ? 22 : 10 + a * 30;
        if (f.kind === "firm" || f.kind === "reach") { g.strokeStyle = `rgba(242,181,68,${1 - a})`; g.lineWidth = f.kind === "reach" ? 5 : 3; g.beginPath(); g.arc(meX, meY - 60, r, 0, 7); g.stroke(); }
        else if (f.kind === "slip") { g.strokeStyle = `rgba(29,22,18,${0.7 * (1 - a)})`; g.lineWidth = 4; for (const d of [-8, 0, 8]) { g.beginPath(); g.moveTo(meX + d, meY - 70); g.lineTo(meX + d, meY - 70 + (RM ? 30 : 10 + a * 40)); g.stroke(); } }
        else if (f.kind === "cling") { g.strokeStyle = `rgba(255,255,255,${1 - a})`; g.lineWidth = 3; g.beginPath(); g.arc(meX, meY - 30, r, 0, 7); g.stroke(); }
        else if (f.kind === "lift") { g.globalAlpha = 1 - a; stencil(meX + 60, meY - 40, 0.8, 0.2, true); g.globalAlpha = 1; }
      }
      if (st.me >= HEAT - 4) {
        g.strokeStyle = "rgba(224,96,58,.35)"; g.lineWidth = 2;
        for (let i = 0; i < 4; i++) { g.beginPath(); for (let x = 0; x <= W; x += 12) { const y = 10 + i * 9 + Math.sin(x * 0.05 + (RM ? 0 : now / 160) + i) * 3; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      }
      drawLane(now);
    }
    function drawLane(now) {
      const wallOn = st.phase === "wall" || st.phase === "lit";
      // beat lane: dabs slide into the line; glistening ones are slick
      const lw = Math.min(380, W - 32), lx = (W - lw) / 2, ly = H - 100, hitX = lx + 50, span = 3000, ppm = (lw - 64) / span;
      g.fillStyle = "rgba(29,22,18,.6)"; g.beginPath(); g.roundRect ? g.roundRect(lx, ly - 17, lw, 34, 16) : g.rect(lx, ly - 17, lw, 34); g.fill();
      const wpx = windowMs() * ppm; g.fillStyle = "rgba(242,181,68,.25)"; g.fillRect(hitX - wpx, ly - 15, wpx * 2, 30);
      g.strokeStyle = C.gold; g.lineWidth = 3; g.beginPath(); g.moveTo(hitX, ly - 17); g.lineTo(hitX, ly + 17); g.stroke();
      for (let k = Math.max(0, nextBeat - 1); k < beatTimes.length; k++) {
        const t = beatTimes[k], x = hitX + (t - now) * ppm; if (x < lx + 6 || x > lx + lw - 6) continue;
        const slick = (k === nextBeat && st.slickNext) || (k === nextBeat - 1 && st.slickNow);
        const four = wallOn && ((k - st.wallK) % 4 + 4) % 4 === 3, big = four ? 9 : 6;
        g.fillStyle = four ? C.gold : slick ? "#fff3dc" : wallOn ? "rgba(179,32,46,.55)" : C.red; g.beginPath(); g.arc(x - 4, ly, big, 0, 7); g.arc(x + 4, ly + 1, big, 0, 7); g.fill();
      }
      for (const p of presses) { const x = hitX + (p.t - now) * ppm; if (x < lx) continue; g.fillStyle = p.on ? C.gold : "#9a8a7a"; g.fillRect(x - 3, ly - 15, 6, 11); }
      while (presses.length && presses[0].t < now - 2000) presses.shift();
      if (st.msgT > 0 && st.msg) {
        g.globalAlpha = Math.min(1, st.msgT / 400);
        g.font = `700 ${W < 500 ? 15 : 18}px sans-serif`; g.textAlign = "center";
        const tw = g.measureText(st.msg).width + 24; g.fillStyle = "rgba(230,210,176,.95)"; g.fillRect(W / 2 - tw / 2, ly - 64, tw, 30);
        g.fillStyle = C.char; g.fillText(st.msg, W / 2, ly - 43); g.globalAlpha = 1;
      }
    }
    let hudKey = "";
    function drawHud() {
      const key = `${st.beatsLeft}|${Math.round(st.me)}|${st.lifts}`;
      if (key === hudKey) return; hudKey = key;
      H$("beats").textContent = String(Math.max(0, st.beatsLeft));
      hud.querySelector("i").style.width = `${(100 * Math.max(0, st.beatsLeft)) / BUDGET}%`;
      H$("m").textContent = `${Math.max(0, Math.round(TOP - st.me))} m to the light`;
      H$("lifts").textContent = `Lifts together: ${"|".repeat(st.lifts) || "none yet"}`;
    }
    function frame(now) {
      const dt = Math.min(60, now - lastNow); lastNow = now;
      if (st.started && !st.over) {
        while (beatTimes.length - nextBeat < 6) { const last = beatTimes[beatTimes.length - 1]; beatTimes.push(last + 60000 / bpmAt(st.me)); }
        while (!st.over && now >= beatTimes[nextBeat]) { onBeat(); nextBeat++; }
        if (beatTimes.length > 40) { const cut = beatTimes.length - 30; beatTimes = beatTimes.slice(cut); nextBeat -= cut; st.lastPress -= cut; }
      }
      st.flash = Math.max(0, st.flash - dt / 250); st.msgT = Math.max(0, st.msgT - dt);
      draw(now); drawHud();
      if (!st.over) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        cancelAnimationFrame(raf); ro.disconnect(); artJob++; clearTimeout(artTimer);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        timers.forEach(clearTimeout);
        beats.dispose(); disposeKit();
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  }
}

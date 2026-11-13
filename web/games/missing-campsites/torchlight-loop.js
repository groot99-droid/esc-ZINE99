// Missing Campsites / Torchlight loop (2D, charcoal chiaroscuro).
//
// DESIGN.md section 10, mode A, cut to one sequence: torch_loop_2, the carrying run at day 2 dusk.
// Posts 19 to 16 stand south of the five sites. Each goes at its time (16 at 40 s, 17 at 70 s,
// 18 at 140 s, 19 at 170 s) the first moment it is outside the torch circle. Hold E for 2 s at a
// post to pull it; one post slows Tam to x0.6, two to x0.45. Walking into the five sites sets
// carried posts in free slots. Battery drains 25 a minute walking, 10 standing; at 0 June comes
// with a lantern and walks Tam home. Dell calls everyone to the van at the end of the run.
//
// Actions (the refine pass): walk; pull a post (hold E); raise the torch (hold Space: the circle
// widens to keep a post lit from further off, at three times the drain); tick a post in the Tally
// (T: evidence that holds even if the post does not); swap in the spare batteries (B, once: three
// seconds standing still). Raise, tick and swap unlock as the run goes, each with a beat.
// Outcomes: three or four posts held (win); fewer, but three or more ticked in the Tally (done: the
// pencil keeps them); otherwise lose. After two losses in a row the posts go 25 s later.
// Every narrative line in TEXT is written for the game (listed for approval), not quoted.

const PPM = 24;                       // pixels per metre in the pre-drawn ground
const WX0 = -9, WX1 = 11, WY0 = -7, WY1 = 62;
const TORCH_R = 1.75;                 // the circle is 3.5 m across
const RAISE_K = 1.85;                 // raised, the circle reaches further
const SPEED = 1.4;
const RUN_S = 205;                    // Dell calls at the van
const POSTS = [
  { n: 19, y: 14, due: 170 }, { n: 18, y: 26, due: 140 },
  { n: 17, y: 38, due: 70 }, { n: 16, y: 50, due: 40 },
];
const DX0 = -24, DX1 = 26, DY0 = -16, DY1 = 72;   // the charcoal reaches past any screen
const roadX = (y) => 2.1 * Math.sin(y / 8.5);
const PFX = "missing-campsites-torchlight-loop-";

const TEXT = {
  when: "Day 2 · dusk · the carrying run",
  goal: "Carry three of posts 16 to 19 into the five sites before Dell calls the van.",
  warn: "A post goes the first moment no light is on it. Sixteen is furthest. It will go first.",
  gentle: "A gentler run: the posts hold on twenty-five seconds longer.",
  open: "Dusk. The five sites behind you, the road ahead. Sixteen is furthest.",
  firstPull: "Heavy. The post comes up with a clod of the road still on it.",
  raise: "Rafe, on the walkie: \"Point it up the road. Further. There.\" Hold Space to raise the torch.",
  tick: "Your pencil is in your pocket. T ticks a post in the Tally, and the Tally does not forget.",
  swap: "The torch is yellowing. You packed spare batteries: B swaps them, if you stand still.",
  gap: "The gravel narrows here by a hand's width. Nothing else to see.",
  slotted: "Set in a slot at the five sites. It stands straighter than the road ever let it.",
  dell: "Dell, on the walkie: \"Van at half past. Whatever you're doing, do it now.\"",
  lowBat: "The torch browns at the edges.",
  dark: "The torch shrinks to almost nothing.",
  full: "Two is the most you can carry.",
  swapping: "You stop and thumb the batteries out in the dark.",
  swapped: "Fresh batteries. The circle whitens and opens.",
  end: {
    june: "The torch dies. June's walkie crackles, and she comes down the road with a lantern and walks you home.",
    van: "Dell calls everyone to the van.",
    win: (held) => `${held} posts stand in the slots at the five sites, and the road behind them is forest floor. Whatever crosses tonight, they cross with it.`,
    done: (held, ticks) => `${held ? `Only ${held} post${held === 1 ? "" : "s"} made it` : "No post made it"} into the slots, but your Tally holds ${ticks} ticks in pencil. The counter disagrees with you. The pencil does not.`,
    lose: (held) => `${held ? `Only ${held} post${held === 1 ? "" : "s"} made it` : "No post made it"} into the slots. The rest went while nobody was looking, and nothing in your notebook says they were ever there.`,
  },
};

const CSS = (p) => `
.${PFX}wrap{position:absolute;inset:0;overflow:hidden;background:#141518;touch-action:none;user-select:none;-webkit-user-select:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:#e9e2d2}
.${PFX}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block;outline:none}
.${PFX}hud{position:absolute;top:10px;left:10px;background:rgba(11,12,15,.84);padding:8px 12px 9px;font-size:clamp(16px,2.4vw,20px);letter-spacing:.06em;box-shadow:0 0 0 1px rgba(233,226,210,.18);max-width:calc(100% - 120px);box-sizing:border-box}
.${PFX}hud small{display:block;font-size:13px;opacity:.92;letter-spacing:.06em;margin-top:3px}
.${PFX}bat{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:12px;letter-spacing:.12em}
.${PFX}bat span{display:block;height:8px;background:#3a3c42;width:120px;max-width:30vw;overflow:hidden}
.${PFX}bat i{display:block;height:100%;background:${p.accent || "#ffb35c"};transition:background .4s}
.${PFX}bat.low i{background:#e0563c}
.${PFX}bat.low{color:#ff9a7f;animation:${PFX}blink 1s steps(2) infinite}
.${PFX}bat.raised i{background:#fff0c8}
@keyframes ${PFX}blink{50%{opacity:.55}}
.${PFX}carry{display:flex;gap:5px;margin-top:6px;align-items:center;font-size:12px;letter-spacing:.12em}
.${PFX}carry em{display:inline-block;width:14px;height:14px;border:1.5px solid #8a5a3b;font-style:normal}
.${PFX}carry em.on{background:#8a5a3b;border-color:#e0b48a}
.${PFX}tally{position:absolute;top:10px;right:10px;width:84px;background:#e8e1cf;color:#3c3c3e;padding:8px 8px 10px;font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.05;box-sizing:border-box;box-shadow:0 4px 14px rgba(0,0,0,.6);background-image:repeating-linear-gradient(180deg,transparent 0 21px,rgba(80,110,140,.25) 21px 22px)}
.${PFX}tally b{display:block;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;margin-bottom:4px;color:#2b2a27}
.${PFX}tally .slot{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.04em;margin-top:6px;border-top:1px solid #9a948a;padding-top:4px;color:#2b2a27}
.${PFX}tally .new{animation:${PFX}ink .6s}
@keyframes ${PFX}ink{0%{color:#c0392b;transform:scale(1.4)}100%{color:inherit;transform:none}}
.${PFX}sketch{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:min(560px,calc(100% - 20px));height:58px;background:#e8e1cf;box-shadow:0 4px 14px rgba(0,0,0,.6)}
.${PFX}btns{position:absolute;right:10px;bottom:80px;display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.${PFX}btns button{font:600 14px 'IBM Plex Mono',monospace;color:#e9e2d2;background:rgba(20,21,24,.9);border:1.5px solid #e9e2d2;padding:11px 12px;min-width:118px;cursor:pointer;touch-action:none;text-align:left}
.${PFX}btns button[hidden]{display:none}
.${PFX}btns button:hover{border-color:${p.accent || "#ffb35c"};color:#fff}
.${PFX}btns button.on{background:#3a2a14;border-color:${p.accent || "#ffb35c"};color:${p.accent || "#ffb35c"}}
.${PFX}btns button.ready{border-color:${p.accent || "#ffb35c"};box-shadow:0 0 0 3px rgba(255,179,92,.3)}
.${PFX}btns button:disabled{opacity:.45;cursor:default}
.${PFX}btns button.fresh{animation:${PFX}fresh 1.2s 2}
@keyframes ${PFX}fresh{50%{box-shadow:0 0 0 6px rgba(255,179,92,.45)}}
.${PFX}btns button:focus-visible{outline:2px solid ${p.accent || "#ffb35c"};outline-offset:2px}
.${PFX}msg{position:absolute;left:50%;top:15%;transform:translateX(-50%);font-family:Caveat,'Segoe Print',cursive;font-size:clamp(22px,3.4vw,30px);line-height:1.15;color:#f6e7c8;text-shadow:0 1px 6px #000,0 0 2px #000;text-align:center;pointer-events:none;width:min(600px,84%)}
.${PFX}msg.bad{color:#ffb09c}
.${PFX}msg.shake{animation:${PFX}shake .35s}
@keyframes ${PFX}shake{25%{margin-left:-8px}75%{margin-left:8px}}
.${PFX}intro{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(60% 60% at 50% 50%,rgba(60,40,18,.55),rgba(8,9,11,.95));z-index:5;padding:16px;overflow:auto}
.${PFX}card{max-width:450px;width:100%;box-sizing:border-box;background:#1c1d21;color:#e9e2d2;padding:22px 24px 20px;
  background-image:radial-gradient(120% 70% at 50% 0%,rgba(255,179,92,.22),transparent 60%),repeating-linear-gradient(-28deg,rgba(255,255,255,.035) 0 2px,transparent 2px 9px);
  box-shadow:0 0 0 2px #0b0c0f,0 0 0 4px rgba(233,226,210,.25),0 20px 60px #000}
.${PFX}card h2{margin:0;font:700 30px 'Zilla Slab',Georgia,serif;color:${p.accent || "#ffb35c"};text-shadow:0 0 18px rgba(255,179,92,.45)}
.${PFX}card .when{font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;margin:2px 0 12px}
.${PFX}card .goal{font-size:16px;line-height:1.4;margin:0 0 14px;padding-left:12px;border-left:3px solid ${p.accent || "#ffb35c"}}
.${PFX}card dl{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:0 0 14px;font-size:14px;line-height:1.35}
.${PFX}card dt{color:${p.accent || "#ffb35c"};font-weight:600}
.${PFX}card dd{margin:0}
.${PFX}card kbd{font:600 13px 'IBM Plex Mono',monospace;border:1px solid #8b857a;padding:0 5px;border-radius:3px;background:#2a2b30}
.${PFX}card .warn{font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.15;color:#f6e7c8;margin:0 0 14px}
.${PFX}card .gentle{font-size:14px;color:#cfe3b0;margin:0 0 12px}
.${PFX}card button{font:600 15px 'IBM Plex Mono',monospace;background:${p.accent || "#ffb35c"};color:#1a1206;border:0;padding:11px 24px;cursor:pointer}
.${PFX}card button:hover,.${PFX}card button:focus-visible{outline:2px solid #fff;outline-offset:2px}
@media (max-width:520px){.${PFX}hud{font-size:15px;padding:6px 9px}.${PFX}tally{width:70px;font-size:19px}.${PFX}btns{bottom:76px}.${PFX}btns button{min-width:104px;padding:11px 9px;font-size:13px}.${PFX}msg{top:26%}}
`;

function drawGround(rng) {
  const c = document.createElement("canvas");
  c.width = (WX1 - WX0) * PPM; c.height = (WY1 - WY0) * PPM;
  const g = c.getContext("2d");
  const X = (x) => (x - WX0) * PPM, Y = (y) => (y - WY0) * PPM;
  g.fillStyle = "#5b4a33"; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 9000; i++) {                // needles and duff
    g.fillStyle = rng() < 0.5 ? "rgba(122,98,67,.6)" : "rgba(58,44,28,.55)";
    const x = rng() * c.width, y = rng() * c.height, a = rng() * Math.PI;
    g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-4, -0.6, 8 + rng() * 6, 1.3); g.restore();
  }
  for (let y = WY0; y < WY1; y += 0.25) {          // the gravel road, 3 m wide
    g.fillStyle = "#a49478";
    g.fillRect(X(roadX(y) - 1.5), Y(y), 3 * PPM, 0.3 * PPM);
  }
  for (let i = 0; i < 7000; i++) {
    const y = WY0 + rng() * (WY1 - WY0), x = roadX(y) + (rng() - 0.5) * 2.9;
    g.fillStyle = rng() < 0.5 ? "rgba(216,204,176,.8)" : "rgba(120,108,88,.7)";
    g.beginPath(); g.arc(X(x), Y(y), 0.6 + rng() * 1.6, 0, 7); g.fill();
  }
  g.fillStyle = "rgba(179,165,133,.7)";            // the five sites: a trodden clearing at the north end
  g.beginPath(); g.ellipse(X(1), Y(-2.5), 7.5 * PPM, 3.6 * PPM, 0, 0, 7); g.fill();
  return c;
}

function drawDark(rng) {                           // the charcoal field outside the light
  const c = document.createElement("canvas");
  c.width = (DX1 - DX0) * 16; c.height = (DY1 - DY0) * 16;
  const g = c.getContext("2d");
  g.fillStyle = "#141518"; g.fillRect(0, 0, c.width, c.height);
  g.lineCap = "round";
  for (let i = 0; i < 2600; i++) {                 // smudged grey charcoal, nothing to read in it
    const v = 40 + rng() * 26;
    g.strokeStyle = `rgba(${v},${v + 1},${v + 4},${0.05 + rng() * 0.1})`;
    g.lineWidth = 1 + rng() * 5;
    const x = rng() * c.width, y = rng() * c.height, a = -0.5 + rng() * 0.4, l = 14 + rng() * 55;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l * 0.5, y + l * a - 6, x + l, y + l * a); g.stroke();
  }
  return c;
}

export default {
  mount(root, api) {
    const p = api.palette || {};
    const rng = api.rng("hollin-torch");
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = PFX + "wrap";
    wrap.innerHTML = `<style>${CSS(p)}</style><canvas tabindex="-1" aria-label="Top-down view of the loop road by torchlight"></canvas>
      <div class="${PFX}hud"><span class="c">POSTS: 9</span><small class="k">19:05 · dusk</small>
        <div class="${PFX}bat"><b>TORCH</b><span><i></i></span><em class="pct" style="font-style:normal">100</em></div>
        <div class="${PFX}carry"><b>CARRY</b><em></em><em></em></div></div>
      <div class="${PFX}tally"><b>TALLY</b><span class="t"></span><div class="slot"></div></div>
      <svg class="${PFX}sketch" viewBox="0 0 560 58" aria-hidden="true"></svg>
      <div class="${PFX}btns">
        <button type="button" class="raise" hidden>Raise (Space)</button>
        <button type="button" class="swap" hidden>Batteries (B)</button>
        <button type="button" class="tick" hidden>Tick (T)</button>
        <button type="button" class="pull">Pull (hold E)</button></div>
      <div class="${PFX}msg" aria-live="polite"></div>
      <div class="${PFX}intro"><div class="${PFX}card"><h2>Torchlight loop</h2><div class="when"></div>
        <p class="goal"></p><p class="warn"></p>
        <dl><dt>Walk</dt><dd><kbd>WASD</kbd> or arrows, or hold a finger where you want to go</dd>
          <dt>Pull</dt><dd>at a post, hold <kbd>E</kbd> or Pull for two seconds; carry two at most</dd>
          <dt>Set</dt><dd>walk back into the five sites; carried posts go into the slots</dd></dl>
        <p class="gentle" hidden></p>
        <button type="button" class="go">Start the run</button></div></div>`;
    root.appendChild(wrap);
    const canvas = wrap.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when; $(".goal").textContent = TEXT.goal; $(".warn").textContent = TEXT.warn;
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const msgEl = $(`.${PFX}msg`);
    const ground = drawGround(rng), dark = drawDark(rng);
    const btn = { pull: $(".pull"), tick: $(".tick"), raise: $(".raise"), swap: $(".swap") };

    const st = {
      x: roadX(1), y: 1, t: 0, battery: 100, carried: [], slotted: [], running: false, over: false,
      pullT: 0, pulling: false, raising: false, keys: new Set(), ptr: null, msgT: 0, ticked: new Set(), juneT: -1, flick: 0,
      swapT: -1, swapsLeft: 1, unlocked: { tick: false, raise: false, swap: false }, beats: new Set(), fx: [],
    };
    const posts = POSTS.map((o) => ({ ...o, due: o.due + (gentle ? 25 : 0), x: roadX(o.y) + 2.5, gone: false, pulled: false, gapSeen: false }));
    let W = 0, H = 0, S = 40, dpr = 1, raf = 0, last = 0;

    function say(text, secs = 3, bad = false) {
      msgEl.textContent = text; st.msgT = secs;
      msgEl.classList.toggle("bad", bad);
      if (bad && !api.reducedMotion) { msgEl.classList.remove("shake"); void msgEl.offsetWidth; msgEl.classList.add("shake"); }
    }
    function beat(key, text, secs = 4) { if (st.beats.has(key)) return false; st.beats.add(key); say(text, secs); return true; }
    function unlock(k, text) {
      if (st.unlocked[k]) return;
      st.unlocked[k] = true;
      btn[k].hidden = false;
      if (!api.reducedMotion) btn[k].classList.add("fresh");
      beat("u-" + k, text, 5);
    }
    function fx(x, y, color) { st.fx.push({ x, y, t: 0, color }); }

    function resize() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      S = Math.max(26, Math.min(70, Math.min(W, H) / 11.5));
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // Tam's pencil sketch of the road: it never loses anything.
    const sk = $(`.${PFX}sketch`);
    const NS = "http://www.w3.org/2000/svg";
    const sv = (tag, a) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); sk.appendChild(n); return n; };
    sv("path", { d: "M24 22 Q150 15 280 22 T536 22", fill: "none", stroke: "#4a4a4c", "stroke-width": 1.8 });
    const skX = (y) => 30 + (y + 3) / 56 * 500;
    sv("rect", { x: skX(-2) - 16, y: 14, width: 32, height: 16, fill: "none", stroke: "#2f6b3a", "stroke-width": 1.6 });
    const t5 = sv("text", { x: skX(-2), y: 50, "text-anchor": "middle", "font-size": 15, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 }); t5.textContent = "20–24";
    const skMarks = {};
    POSTS.forEach((o) => {
      const m = sv("rect", { x: skX(o.y) - 5, y: 17, width: 10, height: 10, fill: "none", stroke: "#4a4a4c", "stroke-width": 1.5 });
      const t = sv("text", { x: skX(o.y), y: 50, "text-anchor": "middle", "font-size": 16, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 });
      t.textContent = o.n;
      skMarks[o.n] = m;
    });
    const skDot = sv("circle", { r: 6, cy: 22, fill: p.accent || "#ffb35c", stroke: "#3a2a10", "stroke-width": 1.8 });

    const near = () => posts.find((q) => !q.gone && !q.pulled && Math.hypot(q.x - st.x, q.y - st.y) < 1.7);
    function existing() { return 5 + posts.filter((q) => !q.gone).length; }
    function hud() {
      $(".c").textContent = `POSTS: ${existing()}`;
      const mins = 5 + Math.floor(st.t / RUN_S * 25);      // the run compresses dusk to 19:05–19:30
      $(".k").textContent = `19:${String(Math.min(30, mins)).padStart(2, "0")} · van at 19:30`;
      const b = Math.max(0, st.battery);
      $(`.${PFX}bat i`).style.width = b + "%";
      $(".pct").textContent = String(Math.round(b));
      $(`.${PFX}bat`).classList.toggle("low", b < 25);
      $(`.${PFX}bat`).classList.toggle("raised", st.raising && b > 0);
      wrap.querySelectorAll(`.${PFX}carry em`).forEach((e, i) => e.classList.toggle("on", i < st.carried.length));
      skDot.setAttribute("cx", skX(Math.max(-3, Math.min(53, st.y))));
      for (const o of posts) {
        skMarks[o.n].setAttribute("fill", st.slotted.includes(o.n) ? "#2f6b3a" : o.pulled ? "#8a5a3b" : st.ticked.has(o.n) ? "#a9a291" : "none");
      }
      const q = near();
      btn.pull.classList.toggle("ready", !!q && st.carried.length < 2);
      btn.tick.classList.toggle("ready", !!q && !st.ticked.has(q.n));
      btn.pull.classList.toggle("on", st.pulling);
      btn.raise.classList.toggle("on", st.raising);
      btn.swap.disabled = st.swapsLeft <= 0 || st.swapT >= 0;
      btn.swap.textContent = st.swapT >= 0 ? `Swapping… ${Math.ceil(st.swapT)}` : st.swapsLeft ? "Batteries (B)" : "No spares";
    }
    function paintTally(fresh) {
      const tl = [...st.ticked].sort((a, b) => b - a).map((n) => `<div class="${n === fresh ? "new" : ""}">${n} |</div>`).join("");
      $(".t").innerHTML = tl || "&nbsp;";
      $(".slot").textContent = `slots ${st.slotted.length}/10`;
    }

    function tick() {
      if (!st.unlocked.tick) return;
      const q = near();
      if (!q) { say("No post in the light to tick.", 1.4, true); return; }
      if (st.ticked.has(q.n)) { say(`Post ${q.n} is already in the Tally.`, 1.4); return; }
      st.ticked.add(q.n); paintTally(q.n); say(`Post ${q.n}: ticked in pencil.`, 1.6); fx(q.x, q.y, "#e8e1cf"); hud();
    }
    function swap() {
      if (!st.running || !st.unlocked.swap || st.swapsLeft <= 0 || st.swapT >= 0 || st.battery <= 0) return;
      st.swapT = 3; st.swapsLeft--; say(TEXT.swapping, 2.5);
    }

    function finish(reason) {
      if (st.over) return;
      st.over = true; st.running = false;
      const held = st.slotted.length + (reason === "june" ? st.carried.length : 0);
      const ticks = st.ticked.size;
      const lead = TEXT.end[reason] + " ";
      let outcome;
      if (held >= 3) { outcome = "win"; api.end({ outcome, text: lead + TEXT.end.win(held) }); }
      else if (ticks >= 3) { outcome = "done"; api.end({ outcome, text: lead + TEXT.end.done(held, ticks) }); }
      else { outcome = "lose"; api.end({ outcome, text: lead + TEXT.end.lose(held) }); }
      api.store.set("losses", outcome === "lose" ? losses + 1 : 0);
    }

    function step(dt) {
      st.t += dt;
      let mx = 0, my = 0;
      const k = st.keys;
      if (k.has("a") || k.has("arrowleft")) mx -= 1;
      if (k.has("d") || k.has("arrowright")) mx += 1;
      if (k.has("w") || k.has("arrowup")) my -= 1;
      if (k.has("s") || k.has("arrowdown")) my += 1;
      if (!mx && !my && st.ptr) {
        const wx = st.x + (st.ptr.x - W / 2) / S, wy = st.y + (st.ptr.y - H / 2) / S;
        const dx = wx - st.x, dy = wy - st.y, d = Math.hypot(dx, dy);
        if (d > 0.25) { mx = dx / d; my = dy / d; }
      }
      const moving = (mx || my) && !st.pulling && st.swapT < 0;
      if (moving) {
        const d = Math.hypot(mx, my);
        const mult = st.carried.length === 2 ? 0.45 : st.carried.length === 1 ? 0.6 : 1;
        st.x += mx / d * SPEED * mult * dt; st.y += my / d * SPEED * mult * dt;
        st.x = Math.max(roadX(st.y) - 6, Math.min(roadX(st.y) + 6, st.x));
        st.y = Math.max(-5, Math.min(57, st.y));
        if (st.y > 56.5) say("Past 16 the road is only forest floor now.", 2);
      }
      const raised = st.raising && st.unlocked.raise && st.battery > 0;
      st.battery -= ((moving ? 25 : 10) / 60) * (raised ? 3 : 1) * dt;
      if (st.swapT >= 0) {                               // swapping: three seconds standing still
        st.swapT -= dt;
        if (st.swapT < 0) { st.battery = Math.min(100, Math.max(0, st.battery) + 50); say(TEXT.swapped, 2); fx(st.x, st.y, "#fff0c8"); }
      }
      const q = near();
      if (st.pulling && q && st.carried.length < 2) {
        st.pullT += dt;
        if (st.pullT >= 2) {
          q.pulled = true; st.carried.push(q.n); st.pullT = 0; st.pulling = false;
          fx(q.x, q.y, p.accent || "#ffb35c");
          if (!beat("pull", TEXT.firstPull, 3)) say(`Post ${q.n} comes out of the ground.`, 2);
        }
      } else {
        if (st.pulling && st.carried.length >= 2 && st.msgT <= 0) say(TEXT.full, 1.5, true);
        st.pullT = 0;
      }
      if (st.y < 2.5 && st.carried.length) {             // set posts into the slots at the five sites
        st.slotted.push(...st.carried);
        fx(st.x, -3.2, "#9fd18a");
        if (!beat("slot", TEXT.slotted, 3.5)) say(`Post${st.carried.length > 1 ? "s" : ""} ${st.carried.join(" and ")} set in a slot.`, 2.4);
        st.carried = [];
        paintTally();
      }
      const R = TORCH_R * (raised ? RAISE_K : 1);        // erasure: only outside the light, never seen
      for (const o of posts) {
        if (!o.gone && !o.pulled && st.t >= o.due && Math.hypot(o.x - st.x, o.y - st.y) > R) o.gone = true;
        if (o.gone && !o.gapSeen && Math.abs(o.y - st.y) < 1.2) { o.gapSeen = true; beat("gap", TEXT.gap, 3.5); }
      }
      if (st.t > 9) unlock("raise", TEXT.raise);         // unlocks and beats as the run goes
      if (q && !st.unlocked.tick) unlock("tick", TEXT.tick);
      if (st.battery < 55) unlock("swap", TEXT.swap);
      if (st.t > RUN_S - 35) beat("dell", TEXT.dell, 4);
      if (st.battery < 20 && st.battery > 0) beat("low", TEXT.lowBat, 2.5);
      if (st.msgT > 0) { st.msgT -= dt; if (st.msgT <= 0) msgEl.textContent = ""; }
      if (st.battery <= 0 && st.juneT < 0 && st.swapT < 0) { st.battery = 0; st.juneT = 2.5; say(TEXT.dark, 3, true); }
      if (st.juneT >= 0) { st.juneT -= dt; if (st.juneT <= 0) finish("june"); }
      const left = posts.filter((o) => !o.gone && !o.pulled).length;
      if (st.t >= RUN_S || (left === 0 && st.carried.length === 0)) finish("van");
      st.fx = st.fx.filter((f) => (f.t += dt) < 0.9);
    }

    function draw() {
      const c = ctx;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ox = W / 2 - st.x * S, oy = H / 2 - st.y * S;
      const wx = (x) => ox + x * S, wy = (y) => oy + y * S;
      c.fillStyle = "#141518"; c.fillRect(0, 0, W, H);
      c.drawImage(dark, wx(DX0), wy(DY0), (DX1 - DX0) * S, (DY1 - DY0) * S);
      const raised = st.raising && st.unlocked.raise && st.battery > 0;
      const R = (st.battery <= 0 ? 0.5 : TORCH_R * (raised ? RAISE_K : 1)) * S * (1 + st.flick);
      const cx = W / 2, cy = H / 2;
      c.save();
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
      c.drawImage(ground, wx(WX0), wy(WY0), (WX1 - WX0) * S, (WY1 - WY0) * S);
      for (const o of posts) {
        if (o.gone) {                                    // the road narrows a hand's width here
          c.fillStyle = "#5b4a33"; c.fillRect(wx(roadX(o.y) + 1.25), wy(o.y - 1.6), 0.3 * S, 3.2 * S);
          continue;
        }
        c.fillStyle = "rgba(203,189,158,.85)";
        c.beginPath(); c.ellipse(wx(o.x + 1.3), wy(o.y + 0.3), 1.9 * S, 1.3 * S, 0, 0, 7); c.fill();
        c.strokeStyle = "#77706a"; c.lineWidth = 0.22 * S; c.setLineDash([0.3 * S, 0.12 * S]);
        c.beginPath(); c.arc(wx(o.x + 2.1), wy(o.y + 0.7), 0.5 * S, 0, 7); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#2b2420"; c.beginPath(); c.arc(wx(o.x + 2.1), wy(o.y + 0.7), 0.38 * S, 0, 7); c.fill();
        if (!o.pulled) {
          c.fillStyle = "#8a5a3b"; c.strokeStyle = "#4a2e1c"; c.lineWidth = 2;
          c.fillRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.strokeRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.55 * S)}px 'IBM Plex Mono', monospace`;
          c.fillText(String(o.n), wx(o.x) - 0.45 * S, wy(o.y) - 0.45 * S);
          if (st.ticked.has(o.n)) { c.strokeStyle = "#e8e1cf"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx(o.x) + 0.4 * S, wy(o.y) - 0.1 * S); c.lineTo(wx(o.x) + 0.55 * S, wy(o.y) + 0.1 * S); c.lineTo(wx(o.x) + 0.85 * S, wy(o.y) - 0.35 * S); c.stroke(); }
        } else {
          c.fillStyle = "#2b2420"; c.beginPath(); c.arc(wx(o.x), wy(o.y), 0.2 * S, 0, 7); c.fill();
        }
      }
      for (let i = 0; i < 10; i++) {                     // the slots at the five sites
        const sx = -3.4 + i * 0.95, sy = -3.2;
        const filled = st.slotted[i];
        c.strokeStyle = "#3a2c1c"; c.lineWidth = 1.5;
        c.strokeRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S);
        if (filled) {
          c.fillStyle = "#8a5a3b"; c.fillRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.4 * S)}px 'IBM Plex Mono', monospace`;
          c.fillText(String(filled), wx(sx) - 0.24 * S, wy(sy) + 0.14 * S);
        }
      }
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, R);  // amber light, 3000 K, into charcoal
      gr.addColorStop(0, raised ? "rgba(255,248,226,.34)" : "rgba(255,240,200,.30)"); gr.addColorStop(0.5, "rgba(255,179,92,.14)");
      gr.addColorStop(0.82, `rgba(90,44,12,${0.32 + (st.battery < 25 ? 0.2 : 0)})`); gr.addColorStop(1, "rgba(20,21,24,.92)");
      c.fillStyle = gr; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      c.restore();
      const hg = c.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.35);   // smudged halo
      hg.addColorStop(0, "rgba(20,21,24,.0)"); hg.addColorStop(0.3, "rgba(20,21,24,.75)"); hg.addColorStop(1, "rgba(20,21,24,0)");
      c.fillStyle = hg; c.beginPath(); c.arc(cx, cy, R * 1.35, 0, 7); c.fill();
      for (const f of st.fx) {                            // flourish: a ring opening where something was done
        const k = api.reducedMotion ? 0.5 : f.t / 0.9;
        c.strokeStyle = f.color; c.globalAlpha = 1 - k; c.lineWidth = 3;
        c.beginPath(); c.arc(wx(f.x), wy(f.y), (0.4 + k * 1.4) * S, 0, 7); c.stroke(); c.globalAlpha = 1;
      }
      c.fillStyle = "#2a3346"; c.beginPath(); c.ellipse(cx, cy + 0.06 * S, 0.34 * S, 0.24 * S, 0, 0, 7); c.fill();   // Tam
      c.fillStyle = "#3b2b22"; c.beginPath(); c.arc(cx, cy, 0.17 * S, 0, 7); c.fill();
      st.carried.forEach((n, i) => { c.fillStyle = "#8a5a3b"; c.fillRect(cx - 0.55 * S + i * 0.75 * S, cy + 0.35 * S, 0.35 * S, 0.35 * S); });
      const q = near();
      if (q && st.running && st.pullT <= 0 && st.carried.length < 2) {   // a prompt, in the light
        c.font = `600 ${Math.max(13, Math.round(0.36 * S))}px 'IBM Plex Mono', monospace`;
        const txt = `hold E · post ${q.n}`, tw = c.measureText(txt).width;
        c.fillStyle = "rgba(11,12,15,.78)"; c.fillRect(cx - tw / 2 - 6, cy - 1.15 * S - 17, tw + 12, 23);
        c.fillStyle = "#f6e7c8"; c.textAlign = "center"; c.fillText(txt, cx, cy - 1.15 * S); c.textAlign = "start";
      }
      if (st.pullT > 0) {
        c.strokeStyle = p.accent || "#ffb35c"; c.lineWidth = 5;
        c.beginPath(); c.arc(cx, cy, 0.7 * S, -Math.PI / 2, -Math.PI / 2 + st.pullT / 2 * Math.PI * 2); c.stroke();
      }
      if (st.swapT >= 0) {
        c.strokeStyle = "#fff0c8"; c.lineWidth = 4;
        c.beginPath(); c.arc(cx, cy, 0.85 * S, -Math.PI / 2, -Math.PI / 2 + (1 - st.swapT / 3) * Math.PI * 2); c.stroke();
      }
      if (st.battery <= 0) {                              // June's lantern on the road
        const t = Math.max(0, st.juneT) / 2.5;
        c.fillStyle = "rgba(255,190,110,.6)"; c.beginPath(); c.arc(cx, cy - (1 + t * 3) * S, 0.45 * S, 0, 7); c.fill();
      }
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (st.running) {
        step(dt);
        st.flick = api.reducedMotion ? 0 : (Math.sin(now / 90) * 0.006 + Math.sin(now / 37) * 0.004);
        hud();
      }
      draw();
      if (!st.over) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // input: keyboard, pointer on the ground, and a button per action
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(k)) { st.keys.add(k); if (st.running) e.preventDefault(); }
      if (!st.running) return;
      if (k === "e") st.pulling = true;
      if (k === " ") { e.preventDefault(); st.raising = true; }
      if (k === "t" && !e.repeat) tick();
      if (k === "b" && !e.repeat) swap();
    };
    const ku = (e) => { const k = e.key.toLowerCase(); st.keys.delete(k); if (k === "e") st.pulling = false; if (k === " ") st.raising = false; };
    const blur = () => { st.keys.clear(); st.pulling = false; st.raising = false; };
    const pd = (e) => { if (!st.running) return; canvas.setPointerCapture?.(e.pointerId); const r = canvas.getBoundingClientRect(); st.ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pm = (e) => { if (!st.ptr) return; const r = canvas.getBoundingClientRect(); st.ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pu = () => { st.ptr = null; };
    const hold = (b, on, off) => {
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); if (st.running) on(); });
      for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, off);
    };
    hold(btn.pull, () => { st.pulling = true; }, () => { st.pulling = false; });
    hold(btn.raise, () => { st.raising = true; }, () => { st.raising = false; });
    btn.tick.addEventListener("click", () => st.running && tick());
    btn.swap.addEventListener("click", swap);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("blur", blur);
    canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu);
    $(".go").addEventListener("click", () => {
      $(`.${PFX}intro`).remove();
      st.running = true; last = 0;
      say(TEXT.open, 4);
      canvas.focus?.();
    });
    $(".go").focus();
    paintTally(); hud();

    return {
      unmount() {
        st.over = true; st.running = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("blur", blur);
      },
    };
  },
};

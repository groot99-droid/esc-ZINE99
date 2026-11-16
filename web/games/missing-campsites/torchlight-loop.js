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
//
// Art (api.art): Tam (walking, one post, two posts), the posts, June with her lantern, the van at the
// five sites and Dell's chalk on the free slots are the game's sprites, each rasterised once into an
// offscreen canvas at the size it is drawn and again only on resize. The walkie dial marks a line that
// comes over the walkie, the pencil tick heads the Tally, chapter 4's card and Tam's top-down figure
// open the run, and the result stands over the figure that fits how it ended. The charcoal ground is
// still drawn here; the flat shapes are the fallback for any sprite that is missing.

// Phase 2 (2026-11-16): the ladder. Three stages, each a sequence of DESIGN.md section 10:
//   1 Teach  torch_loop_1's last stretch: tick posts 7 to 4 on the way to the payphone bulb. No carrying.
//   2 Test   torch_loop_2, the carrying run, with borrowed light: the Ashbys' lantern holds 17 until it
//            goes out, so the route is planned round it. Link (supper to the run): each friend whose
//            packet was the card's own at supper 1 (Foil Supper, stage 1) stands on the road with a
//            lantern and holds one post.
//   3 Twist  torch_loop_3. Nothing is left to save and the batteries are nearly flat. The new control
//            is the off switch (F): walk dark by the pencil strip, and past post 24, where there is no
//            ground, wait in the dark for the set-piece: one small square of light, a window. Tick it.

//
// Phase 3 (2026-11-16, DESIGN.md section 20a):
//   Teach   the walk to the payphone is the whole of torch_loop_1's last stretch, posts 11 to 4. A tick
//           writes what stood at the post beside it (the List, items 4 to 11: details Tam wrote).
//   Flash   Inés's camera (C): three times a run, its flash holds the nearest post for three seconds,
//           lit or not. Teach and test.
//   Short   in the carrying run the printed loop on the HUD loses 35 m for every site that goes; only
//   road    the pencil strip keeps the true length.
//   The List always one button away (L).
//   Second  (api.shared "runs" > 0): the walkie's first line comes over channel two a half-second
//   run     before Rafe says it.

import { pic, chapterCard, resultCard, raster, ladder, stageTabs, linkNote, listButton, sharedList, LIST, runsDone } from "./kit.js";

const PPM = 24;                       // pixels per metre in the pre-drawn ground
const WX0 = -9, WX1 = 11, WY0 = -7, WY1 = 62;
const TORCH_R = 1.75;                 // the circle is 3.5 m across
const RAISE_K = 1.85;                 // raised, the circle reaches further
const SPEED = 1.4;
const NAMES = ["Ticking", "The carrying run", "The off switch"];
const STAGE = {
  1: { run: 100, base: 8, battery: 100, posts: [{ n: 11, y: 4, due: 1e9 }, { n: 10, y: 8.5, due: 1e9 }, { n: 9, y: 13, due: 1e9 }, { n: 8, y: 17.5, due: 1e9 },
    { n: 7, y: 22, due: 1e9 }, { n: 6, y: 27, due: 70 }, { n: 5, y: 32, due: 58 }, { n: 4, y: 37, due: 46 }] },
  2: { run: 150, base: 5, battery: 100, posts: [{ n: 19, y: 11, due: 135 }, { n: 18, y: 20, due: 110 }, { n: 17, y: 29, due: 100, lantern: true }, { n: 16, y: 38, due: 36 }] },
  3: { run: 110, base: 0, battery: 10, posts: [{ n: 20, y: 4, due: 1e9 }, { n: 21, y: 12, due: 1e9 }, { n: 22, y: 20, due: 1e9 }, { n: 23, y: 28, due: 1e9 }, { n: 24, y: 36, due: 1e9 }] },
};
const EDGE_Y = 41;                    // stage 3: past post 24 there is no ground
const PHONE_Y = 44;                   // stage 1: the payphone bulb
const DX0 = -24, DX1 = 26, DY0 = -16, DY1 = 72;   // the charcoal reaches past any screen
const roadX = (y) => 2.1 * Math.sin(y / 8.5);
const PFX = "missing-campsites-torchlight-loop-";

const TEXT = {
  when: ["Night 1 · the walk down to the payphone", "Day 2 · dusk · the carrying run", "Night 2 · the circle of five"],
  goal: ["Tick five of posts 11 to 4 in your Tally before you reach the payphone, and write what stands at each.", "Carry three of posts 16 to 19 into the five sites before Dell calls the van.", "Find what is past post 24 before the torch dies."],
  warn: ["A post goes the first moment no light is on it. What is ticked in pencil stays ticked.", "A post goes the first moment no light is on it. Sixteen is furthest. It will go first. The Ashbys' lantern is still lit at 17.", "The batteries are nearly flat, and there is nothing left out here to keep lit. The torch has an off switch."],
  gentle: ["A gentler walk: the posts hold on twenty-five seconds longer.", "A gentler run: the posts hold on twenty-five seconds longer.", "A gentler night: the torch has a little more in it."],
  open: ["Dark. The bulb over the payphone is the one light ahead. Eleven down to four.", "Dusk. The five sites behind you, the road ahead. Sixteen is furthest.", "The road you carried from is forest floor now. Twenty to twenty-four stand in their slots. The torch is browning already."],
  phone: "The payphone. One bulb, and moths. Behind you the road is shorter than it was.",
  lantern: "The Ashbys' lantern is lit on the table at 17. While it burns, 17 holds without you.",
  lanternOut: "At 17 the Ashbys' lantern goes out. Nobody is seen putting it out.",
  friend: (who, n) => `${who} stands at ${n} with a lantern. That one holds.`,
  off: "Off. The posts stay where they are. They are yours now; they do not need the light.",
  offHint: "The torch will not last to 24. F switches it off; your pencil strip still knows where you are.",
  darkNothing: "Dark. Your eyes open up, and there is nothing here to open them for.",
  edge: "Past 24 the torch shows no ground at all. Not dark ground. None.",
  window: "Where there is no ground: one small square of light. A window, lit. Waiting. (T: put it in the Tally.)",
  glare: "With the torch on there is only the edge. The square is gone.",
  noWindow: "Nothing to tick here.",
  firstPull: "Heavy. The post comes up with a clod of the road still on it.",
  raise: "Rafe, on the walkie: \"Point it up the road. Further. There.\" Hold Space to raise the torch.",
  raiseAgain: "On the walkie, a half-second before Rafe says it: \"Point it up the road. Further. There.\" Then Rafe, saying it. Hold Space to raise the torch.",
  flash: "Inés, on the walkie: \"Take the camera. The flash holds a thing while it's lit.\" C: three flashes.",
  flashed: (n) => `Flash. Post ${n} stands white for three seconds, whoever is looking.`,
  noFlash: "No flashes left.",
  shortRoad: "The map's loop on your HUD is 35 m shorter. Your pencil strip is not.",
  wrote: (n, what) => `Post ${n}: ticked. Beside it, in pencil: ${what}. (The List, ${n}.)`,
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
    t1win: (n) => `${n} ticks in your Tally by the time you reach the payphone. On the walk back the gravel narrows three times, and the counter on the map says thirteen. Your pencil says what it said.`,
    t1lose: (n) => `${n ? `Only ${n} tick${n === 1 ? "" : "s"}` : "No ticks"} in your Tally. On the walk back the gravel narrows three times, and you could not say what stood there.`,
    t3win: "A window, lit, where there is no ground. You tick it in the Tally under 24, and walk back to the five by the pencil strip, in the dark, without needing to see.",
    t3time: "Dell calls you back to the fire. Whatever is past 24, you did not see it.",
    t3june: "The torch dies at the edge with its light on. June's walkie crackles, and she comes with a lantern and walks you back. By lantern there is only the edge.",
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
.${PFX}msg .dial{width:44px;height:44px;vertical-align:middle;margin-right:8px;border-radius:50%;box-shadow:0 0 0 1px rgba(233,226,210,.4)}
.${PFX}tally .tk{display:block;width:100%;height:38px;object-fit:cover;object-position:50% 62%;margin-bottom:4px}
.${PFX}card .fig{float:right;width:96px;height:96px;margin:0 0 8px 12px;border-radius:50%;box-shadow:0 0 0 2px rgba(233,226,210,.25)}
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

function drawGround(rng, stage) {
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
  if (stage === 2) {
    g.fillStyle = "rgba(179,165,133,.7)";          // the five sites: a trodden clearing at the north end
    g.beginPath(); g.ellipse(X(1), Y(-2.5), 7.5 * PPM, 3.6 * PPM, 0, 0, 7); g.fill();
  }
  if (stage === 3) {                               // the edge of nothing: flat, even, no gravel, no needles, no grain
    g.fillStyle = "#0b0c0e"; g.fillRect(0, Y(EDGE_Y), c.width, c.height - Y(EDGE_Y));
    for (let x = 0; x < c.width; x += 5) { g.fillStyle = "#5b4a33"; g.fillRect(x, Y(EDGE_Y) - 2 - rng() * 5, 5, 8); }
    g.fillStyle = "#0b0c0e"; g.fillRect(0, Y(EDGE_Y) + 3, c.width, 6);
  }
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

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage], RUN_S = CFG.run, POSTS = CFG.posts;
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
        <button type="button" class="off" hidden>Torch off (F)</button>
        <button type="button" class="flash" hidden>Flash (C) ·3</button>
        <button type="button" class="pull">Pull (hold E)</button></div>
      <div class="${PFX}msg" aria-live="polite"></div>
      <div class="${PFX}intro"><div class="${PFX}card"><h2>Torchlight loop</h2><div class="when"></div>
        <p class="goal"></p><p class="warn"></p>
        <dl><dt>Walk</dt><dd><kbd>WASD</kbd> or arrows, or hold a finger where you want to go</dd>
          ${stage === 1 ? `<dt>Tick</dt><dd>at a post, press <kbd>T</kbd> or Tick: it goes in the Tally, in pencil</dd>
          <dt>Light</dt><dd>hold <kbd>Space</kbd> to raise the torch and reach a post from further off</dd>
          <dt>Flash</dt><dd><kbd>C</kbd>: Inés's camera holds the nearest post for three seconds, three times</dd>`
    : stage === 2 ? `<dt>Pull</dt><dd>at a post, hold <kbd>E</kbd> or Pull for two seconds; carry two at most</dd>
          <dt>Set</dt><dd>walk back into the five sites; carried posts go into the slots</dd>
          <dt>Flash</dt><dd><kbd>C</kbd>: Inés's camera holds the nearest post for three seconds, three times</dd>`
    : `<dt>Torch</dt><dd><kbd>F</kbd> or the button switches it off and on; off, it does not drain</dd>
          <dt>Strip</dt><dd>the pencil strip at the bottom shows where you are, light or no light</dd>
          <dt>Tick</dt><dd><kbd>T</kbd> puts what you find in the Tally</dd>`}</dl>
        <p class="gentle" hidden></p>
        <button type="button" class="go">Start the run</button></div></div>`;
    root.appendChild(wrap);
    const canvas = wrap.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when[stage - 1]; $(".goal").textContent = TEXT.goal[stage - 1]; $(".warn").textContent = TEXT.warn[stage - 1];
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle[stage - 1]; }
    stageTabs(api, $(".go"));
    const msgEl = $(`.${PFX}msg`);
    const art = api.art;
    chapterCard(art, ["chapter-2", "chapter-4", "chapter-5"][stage - 1], $(`.${PFX}card`));
    { const fig = pic(art, "topdown-tam-walk", "fig", ""); if (fig) $(`.${PFX}card .goal`).before(fig);
      const tk = pic(art, "tick", "tk", ""); if (tk) $(`.${PFX}tally b`).after(tk); }
    const dial = pic(art, "walkie-dial", "dial", "");
    // sprites: id -> size in metres; rasterised at the drawn size, again only when the scale changes
    const SPR = { "sprite-tam-walk": 2.2, "sprite-tam-carry-one": 2.2, "sprite-tam-carry-two": 2.2, "sprite-june-lantern": 2.2, "sprite-post": 1.3, "sprite-van": 5.2, "slot-chalk": 0.62 };
    const spr = {};
    let sprS = 0, sprGen = 0;
    function buildSprites() {
      if (!art || !art.has) return;
      const gen = ++sprGen, scale = S * dpr;
      sprS = scale;
      for (const id of Object.keys(SPR)) raster(art, id, SPR[id] * scale).then((c) => { if (c && gen === sprGen) spr[id] = c; });
    }
    function blit(c, id, x, y, rot = 0) {
      const im = spr[id];
      if (!im) return false;
      const d = SPR[id] * S;
      if (rot) { c.save(); c.translate(x, y); c.rotate(rot); c.drawImage(im, -d / 2, -d / 2, d, d); c.restore(); }
      else c.drawImage(im, x - d / 2, y - d / 2, d, d);
      return true;
    }
    const ground = drawGround(rng, stage), dark = drawDark(rng);
    const btn = { pull: $(".pull"), tick: $(".tick"), raise: $(".raise"), swap: $(".swap"), off: $(".off"), flash: $(".flash") };
    const shList = sharedList(api), again = runsDone(api) > 0;
    const listB = listButton(wrap, api, { where: "left:10px;bottom:76px" });
    if (stage !== 2) btn.pull.hidden = true;
    if (stage === 3) btn.off.hidden = false;
    if (stage !== 2) wrap.querySelector(`.${PFX}carry`).hidden = true;

    const st = {
      x: roadX(1), y: 1, t: 0, battery: 100, carried: [], slotted: [], running: false, over: false,
      off: false, offT: 0, windowSeen: false, windowTicked: false, winT: -1,
      heading: Math.PI / 2, pullT: 0, pulling: false, raising: false, keys: new Set(), ptr: null, msgT: 0, ticked: new Set(), juneT: -1, flick: 0,
      swapT: -1, swapsLeft: stage === 2 ? 1 : 0, flashes: stage === 3 ? 0 : 3, flashT: 0, lost: 0, unlocked: { tick: stage !== 2, raise: false, swap: false, flash: false }, beats: new Set(), fx: [],
    };
    st.battery = CFG.battery + (gentle && stage === 3 ? 5 : 0);
    if (stage !== 2) btn.tick.hidden = false;
    const posts = POSTS.map((o) => ({ ...o, due: o.due + (gentle ? 25 : 0), x: roadX(o.y) + 2.5, gone: false, pulled: false, gapSeen: false }));
    // Link, supper to the run: friends fed the card's own packet at supper 1 hold a post each by lantern.
    const friends = stage === 2 ? ((api.shared && api.shared.get("supper1_threes", [])) || []).filter((n) => typeof n === "string").slice(0, 2) : [];
    friends.forEach((who, i) => { const o = posts[i]; o.friend = who; o.due = 1e9; });
    if (friends.length) linkNote(wrap, `Because ${friends.join(" and ")} ate the card's own packet at supper 1 in Foil Supper, ${friends.length > 1 ? "they stand" : friends[0] + " stands"} on the road with a lantern: ${friends.map((_, i) => "post " + posts[i].n).join(" and ")} hold${friends.length > 1 ? "" : "s"} without you.`, { float: true });
    let W = 0, H = 0, S = 40, dpr = 1, raf = 0, last = 0;

    function say(text, secs = 3, bad = false) {
      msgEl.textContent = text; st.msgT = secs;
      if (dial && /on the walkie/.test(text)) msgEl.prepend(dial);
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
      if (Math.abs(S * dpr - sprS) > 0.5) buildSprites();
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // Tam's pencil sketch of the road: it never loses anything.
    const sk = $(`.${PFX}sketch`);
    const NS = "http://www.w3.org/2000/svg";
    const sv = (tag, a) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); sk.appendChild(n); return n; };
    sv("path", { d: "M24 22 Q150 15 280 22 T536 22", fill: "none", stroke: "#4a4a4c", "stroke-width": 1.8 });
    const skX = (y) => 30 + (y + 3) / 50 * 500;
    if (stage !== 3) {
      sv("rect", { x: skX(-2) - 16, y: 14, width: 32, height: 16, fill: "none", stroke: "#2f6b3a", "stroke-width": 1.6 });
      const t5 = sv("text", { x: skX(-2), y: 50, "text-anchor": "middle", "font-size": 15, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 }); t5.textContent = stage === 1 ? "12" : "20–24";
    } else {
      sv("path", { d: `M${skX(EDGE_Y)} 8 V36`, stroke: "#4a4a4c", "stroke-width": 1.5, "stroke-dasharray": "3 3" });
      const te = sv("text", { x: skX(EDGE_Y) + 26, y: 50, "text-anchor": "middle", "font-size": 15, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 }); te.textContent = "edge";
    }
    if (stage === 1) { const tp = sv("text", { x: skX(PHONE_Y), y: 50, "text-anchor": "middle", "font-size": 15, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 }); tp.textContent = "phone"; sv("circle", { cx: skX(PHONE_Y), cy: 22, r: 4, fill: "none", stroke: "#4a4a4c", "stroke-width": 1.5 }); }
    const skWin = sv("rect", { x: skX(EDGE_Y) + 20, y: 17, width: 9, height: 9, fill: "#c9a862", stroke: "#3a2a10", "stroke-width": 1.5, visibility: "hidden" });
    const skMarks = {};
    POSTS.forEach((o) => {
      const m = sv("rect", { x: skX(o.y) - 5, y: 17, width: 10, height: 10, fill: "none", stroke: "#4a4a4c", "stroke-width": 1.5 });
      const t = sv("text", { x: skX(o.y), y: 50, "text-anchor": "middle", "font-size": 16, fill: "#2b2a27", "font-family": "Caveat, cursive", "font-weight": 700 });
      t.textContent = o.n;
      skMarks[o.n] = m;
    });
    const skDot = sv("circle", { r: 6, cy: 22, fill: p.accent || "#ffb35c", stroke: "#3a2a10", "stroke-width": 1.8 });

    const near = () => posts.find((q) => !q.gone && !q.pulled && Math.hypot(q.x - st.x, q.y - st.y) < 1.7);
    function existing() { return CFG.base + posts.filter((q) => !q.gone).length; }
    function hud() {
      $(".c").textContent = `POSTS: ${existing()}`;
      const mins = 5 + Math.floor(st.t / RUN_S * 25);      // the run compresses dusk to 19:05–19:30
      $(".k").textContent = stage === 1 ? `night 1 · ${Math.max(0, Math.ceil(RUN_S - st.t))} s to the payphone` : stage === 3 ? `night 2 · Dell calls in ${Math.max(0, Math.ceil(RUN_S - st.t))} s` : `19:${String(Math.min(30, mins)).padStart(2, "0")} · van at 19:30`;
      btn.off.textContent = st.off ? "Torch on (F)" : "Torch off (F)"; btn.off.classList.toggle("on", st.off);
      btn.flash.textContent = `Flash (C) ·${st.flashes}`; btn.flash.disabled = st.flashes <= 0;
      if (stage === 2) $(".c").textContent = `POSTS: ${existing()} · LOOP ${35 * existing()} m`;
      skWin.setAttribute("visibility", st.windowTicked ? "visible" : "hidden");
      const b = Math.max(0, st.battery);
      $(`.${PFX}bat i`).style.width = b + "%";
      $(".pct").textContent = String(Math.round(b));
      $(`.${PFX}bat`).classList.toggle("low", b < 25);
      $(`.${PFX}bat`).classList.toggle("raised", st.raising && b > 0);
      wrap.querySelectorAll(`.${PFX}carry em`).forEach((e, i) => e.classList.toggle("on", i < st.carried.length));
      skDot.setAttribute("cx", skX(Math.max(-3, Math.min(47, st.y))));
      for (const o of posts) {
        skMarks[o.n].setAttribute("fill", st.slotted.includes(o.n) ? "#2f6b3a" : o.pulled ? "#8a5a3b" : st.ticked.has(o.n) ? "#a9a291" : "none");
      }
      const q = near();
      btn.pull.classList.toggle("ready", !!q && st.carried.length < 2);
      btn.tick.classList.toggle("ready", stage === 3 ? st.windowSeen && !st.windowTicked : !!q && !st.ticked.has(q.n));
      btn.pull.classList.toggle("on", st.pulling);
      btn.raise.classList.toggle("on", st.raising);
      btn.swap.disabled = st.swapsLeft <= 0 || st.swapT >= 0;
      btn.swap.textContent = st.swapT >= 0 ? `Swapping… ${Math.ceil(st.swapT)}` : st.swapsLeft ? "Batteries (B)" : "No spares";
    }
    function paintTally(fresh) {
      const tl = [...st.ticked].sort((a, b) => b - a).map((n) => `<div class="${n === fresh ? "new" : ""}">${n} |</div>`).join("");
      $(".t").innerHTML = tl || "&nbsp;";
      if (st.windowTicked) $(".t").innerHTML = `<div class="new">a window, lit</div>`;
      $(".slot").textContent = stage === 1 ? `ticks ${st.ticked.size}/8` : stage === 3 ? "past 24:" + (st.windowTicked ? " ✓" : " ?") : `slots ${st.slotted.length}/10`;
    }

    function tick() {
      if (!st.unlocked.tick) return;
      if (stage === 3) {
        if (!st.windowSeen || !st.off) { say(TEXT.noWindow, 1.4, true); return; }
        if (st.windowTicked) return;
        st.windowTicked = true; st.winT = 2.6; paintTally(); hud(); say("A window, lit: ticked in pencil.", 2.4);
        return;
      }
      const q = near();
      if (!q) { say("No post in the light to tick.", 1.4, true); return; }
      if (st.ticked.has(q.n)) { say(`Post ${q.n} is already in the Tally.`, 1.4); return; }
      st.ticked.add(q.n); paintTally(q.n); fx(q.x, q.y, "#e8e1cf");
      if (q.n <= 19) { shList.add(q.n); listB.refresh(); say(TEXT.wrote(q.n, LIST[q.n]), 2.6); } else say(`Post ${q.n}: ticked in pencil.`, 1.6);
      hud();
    }
    function flash() {
      if (!st.running || stage === 3) return;
      if (st.flashes <= 0) { say(TEXT.noFlash, 1.4, true); return; }
      const q = posts.filter((o) => !o.gone && !o.pulled && Math.hypot(o.x - st.x, o.y - st.y) < 7)
        .sort((a, b) => Math.hypot(a.x - st.x, a.y - st.y) - Math.hypot(b.x - st.x, b.y - st.y))[0];
      st.flashes--; st.flashT = 0.35;
      if (q) { q.heldUntil = st.t + 3; fx(q.x, q.y, "#ffffff"); say(TEXT.flashed(q.n), 2.4); } else say("Flash. Nothing in reach to hold.", 1.6);
      hud();
    }
    function swap() {
      if (!st.running || !st.unlocked.swap || st.swapsLeft <= 0 || st.swapT >= 0 || st.battery <= 0) return;
      st.swapT = 3; st.swapsLeft--; say(TEXT.swapping, 2.5);
    }

    function finish(reason) {
      if (st.over) return;
      st.over = true; st.running = false;
      const ticks = st.ticked.size;
      if (stage === 1) {
        const ok = ticks >= 5;
        resultCard(wrap, art, { cards: ["topdown-tam-walk"], lost: ok ? Math.max(0, 8 - ticks) : 3, reducedMotion: api.reducedMotion });
        api.store.set("losses", ok ? 0 : losses + 1);
        api.end({ outcome: ok ? "win" : "lose", text: (reason === "june" ? TEXT.end.june + " " : "") + (ok ? TEXT.end.t1win(ticks) : TEXT.end.t1lose(ticks)), next: "The carrying run: now the posts can be pulled." });
        return;
      }
      if (stage === 3) {
        const ok = reason === "window";
        resultCard(wrap, art, { cards: [ok ? "thread-own" : reason === "june" ? "topdown-june-lantern" : "night-2"], lost: ok ? 0 : 5, reducedMotion: api.reducedMotion });
        api.store.set("losses", ok ? 0 : losses + 1);
        if (ok && api.shared) api.shared.set("window_seen", true);
        api.end({ outcome: ok ? "win" : "lose", text: ok ? TEXT.end.t3win : reason === "june" ? TEXT.end.t3june : TEXT.end.t3time });
        return;
      }
      const lit = posts.filter((o) => o.friend && !o.pulled).length;      // posts a friend's lantern held to the end
      const held = st.slotted.length + lit + (reason === "june" ? st.carried.length : 0);
      const lead = TEXT.end[reason] + " ";
      const outcome = held >= 3 ? "win" : ticks >= 3 ? "done" : "lose";
      resultCard(wrap, art, {
        cards: [reason === "june" ? "topdown-june-lantern" : outcome === "win" ? "topdown-tam-carry-two" : outcome === "done" ? "topdown-tam-carry-one" : "topdown-van"],
        lost: Math.max(0, 4 - held) + (outcome === "lose" ? 1 : 0), reducedMotion: api.reducedMotion,
      });
      if (outcome === "win") api.end({ outcome, text: lead + TEXT.end.win(held) + (lit ? ` ${lit === 1 ? "One of them was" : `${lit} of them were`} held by a friend's lantern and carried in at the call.` : ""), next: "Night 2: nothing left to carry, and a torch with an off switch." });
      else if (outcome === "done") api.end({ outcome, text: lead + TEXT.end.done(held, ticks) });
      else api.end({ outcome, text: lead + TEXT.end.lose(held) });
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
        st.heading = Math.atan2(my, mx);
        st.x = Math.max(roadX(st.y) - 6, Math.min(roadX(st.y) + 6, st.x));
        const maxY = stage === 3 ? EDGE_Y + 1.2 : stage === 1 ? PHONE_Y : 45;
        st.y = Math.max(-5, Math.min(maxY, st.y));
        if (stage === 2 && st.y > 44.5) say("Past 16 the road is only forest floor now.", 2);
        if (stage === 3 && st.y > EDGE_Y - 0.5 && !st.off) beat("edge", TEXT.edge, 4);
      }
      const raised = st.raising && st.unlocked.raise && st.battery > 0 && !st.off;
      if (!st.off) st.battery -= ((moving ? 25 : 10) / 60) * (raised ? 3 : 1) * dt;
      if (stage === 3) {                                  // the off switch, and what the dark holds past 24
        if (st.off) {
          st.offT += dt;
          const there = st.y >= EDGE_Y - 1.5;
          if (st.offT >= 2.5 && there && !st.windowSeen) { st.windowSeen = true; say(TEXT.window, 7); }
          if (st.offT >= 3.2 && !there && !moving) beat("darkNothing", TEXT.darkNothing, 3.5);
        } else { st.offT = 0; if (st.windowSeen && !st.windowTicked) { st.windowSeen = false; say(TEXT.glare, 3); } }
        if (st.battery < 6 && !st.off) beat("offHint", TEXT.offHint, 5);
        if (st.winT >= 0) { st.winT -= dt; if (st.winT < 0) { finish("window"); return; } }
      }
      if (stage === 1 && st.y >= PHONE_Y - 0.6) { say(TEXT.phone, 3); finish("phone"); return; }
      for (const o of posts) {                             // borrowed light
        if (o.lantern && !o.lanternOut && st.t >= o.due) { o.lanternOut = true; if (!o.pulled) say(TEXT.lanternOut, 3.5); }
        if (o.lantern && !o.lanternOut && Math.abs(o.y - st.y) < 4) beat("lantern", TEXT.lantern, 4.5);
        if (o.friend && !o.pulled && Math.abs(o.y - st.y) < 3) beat("friend" + o.n, TEXT.friend(o.friend, o.n), 3.5);
      }
      if (st.swapT >= 0) {                               // swapping: three seconds standing still
        st.swapT -= dt;
        if (st.swapT < 0) { st.battery = Math.min(100, Math.max(0, st.battery) + 50); say(TEXT.swapped, 2); fx(st.x, st.y, "#fff0c8"); }
      }
      const q = near();
      if (stage === 2 && st.pulling && q && st.carried.length < 2) {
        st.pullT += dt;
        if (st.pullT >= 2) {
          q.pulled = true; st.carried.push(q.n); st.pullT = 0; st.pulling = false;
          fx(q.x, q.y, p.accent || "#ffb35c");
          if (!beat("pull", TEXT.firstPull, 3)) say(`Post ${q.n} comes out of the ground.`, 2);
        }
      } else {
        if (stage === 2 && st.pulling && st.carried.length >= 2 && st.msgT <= 0) say(TEXT.full, 1.5, true);
        st.pullT = 0;
      }
      if (stage === 2 && st.y < 2.5 && st.carried.length) {             // set posts into the slots at the five sites
        st.slotted.push(...st.carried);
        fx(st.x, -3.2, "#9fd18a");
        if (!beat("slot", TEXT.slotted, 3.5)) say(`Post${st.carried.length > 1 ? "s" : ""} ${st.carried.join(" and ")} set in a slot.`, 2.4);
        st.carried = [];
        paintTally();
      }
      const R = st.off ? 0 : TORCH_R * (raised ? RAISE_K : 1);        // erasure: only outside the light, never seen
      for (const o of posts) {
        if (!o.gone && !o.pulled && st.t >= o.due && !(o.heldUntil > st.t) && Math.hypot(o.x - st.x, o.y - st.y) > R) {
          o.gone = true;
          if (stage === 2) { st.lost++; beat("short", TEXT.shortRoad, 4); }
        }
        if (o.gone && !o.gapSeen && Math.abs(o.y - st.y) < 1.2) { o.gapSeen = true; beat("gap", TEXT.gap, 3.5); }
      }
      if (st.t > 9) unlock("raise", again ? TEXT.raiseAgain : TEXT.raise);
      if (stage !== 3 && st.t > (stage === 1 ? 4 : 14)) unlock("flash", TEXT.flash);
      if (st.flashT > 0) st.flashT -= dt;         // unlocks and beats as the run goes
      if (q && !st.unlocked.tick) unlock("tick", TEXT.tick);
      if (stage === 2 && st.battery < 55) unlock("swap", TEXT.swap);
      if (stage === 2 && st.t > RUN_S - 35) beat("dell", TEXT.dell, 4);
      if (st.battery < 20 && st.battery > 0) beat("low", TEXT.lowBat, 2.5);
      if (st.msgT > 0) { st.msgT -= dt; if (st.msgT <= 0) msgEl.textContent = ""; }
      if (st.battery <= 0 && st.juneT < 0 && st.swapT < 0 && !st.off && st.winT < 0) { st.battery = 0; st.juneT = 2.5; say(TEXT.dark, 3, true); }
      if (st.juneT >= 0) { st.juneT -= dt; if (st.juneT <= 0) finish("june"); }
      const left = posts.filter((o) => !o.gone && !o.pulled).length;
      if (st.t >= RUN_S || (stage === 2 && left === 0 && st.carried.length === 0)) finish("van");
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
      const glow = (x, y, r, a = 0.5) => {                 // a light that is not Tam's: a lantern, a bulb
        const g2 = c.createRadialGradient(x, y, 0, x, y, r);
        g2.addColorStop(0, `rgba(255,214,150,${a})`); g2.addColorStop(0.4, `rgba(242,165,65,${a * 0.45})`); g2.addColorStop(1, "rgba(242,165,65,0)");
        c.fillStyle = g2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      };
      for (const o of posts) {
        if (o.pulled || o.gone) continue;
        if ((o.lantern && !o.lanternOut) || o.friend) {    // borrowed light shows from far off, and shows its post
          c.save(); c.beginPath(); c.arc(wx(o.x + 0.9), wy(o.y + 0.2), 1.5 * S, 0, 7); c.clip();
          c.drawImage(ground, wx(WX0), wy(WY0), (WX1 - WX0) * S, (WY1 - WY0) * S);
          if (!blit(c, "sprite-post", wx(o.x), wy(o.y))) { c.fillStyle = "#8a5a3b"; c.fillRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S); }
          if (o.friend) { if (!blit(c, "sprite-june-lantern", wx(o.x + 1.2), wy(o.y + 0.3), Math.PI)) { c.fillStyle = "#2a3346"; c.beginPath(); c.arc(wx(o.x + 1.2), wy(o.y + 0.3), 0.3 * S, 0, 7); c.fill(); } }
          else { c.fillStyle = "#3a2c1c"; c.fillRect(wx(o.x + 1.0), wy(o.y - 0.1), 0.8 * S, 0.5 * S); c.fillStyle = "#ffd696"; c.beginPath(); c.arc(wx(o.x + 1.4), wy(o.y + 0.15), 0.14 * S, 0, 7); c.fill(); }
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.55 * S)}px 'IBM Plex Mono', monospace`; c.fillText(String(o.n), wx(o.x) - 0.45 * S, wy(o.y) - 0.45 * S);
          c.restore();
          glow(wx(o.x + 0.9), wy(o.y + 0.2), 1.9 * S, 0.42);
        }
      }
      if (stage === 1) { glow(wx(roadX(PHONE_Y) - 2.2), wy(PHONE_Y + 0.6), 1.1 * S, 0.7); c.fillStyle = "#fff0c8"; c.beginPath(); c.arc(wx(roadX(PHONE_Y) - 2.2), wy(PHONE_Y + 0.6), 0.09 * S, 0, 7); c.fill(); }
      if (st.off) {                                        // the torch is off: Tam, the dark, and past 24 the window
        c.fillStyle = "rgba(233,226,210,.16)"; c.beginPath(); c.arc(cx, cy, 0.2 * S, 0, 7); c.fill();
        if (st.windowSeen) {
          const k = api.reducedMotion ? 1 : Math.min(1, (st.offT - 2.5) / 1.6);
          const wxp = cx + Math.min(W * 0.2, 2.2 * S), wyp = cy + Math.min(H * 0.3, 4.2 * S), ws = Math.max(9, 0.26 * S);
          c.globalAlpha = k; glow(wxp, wyp, ws * 2.6, 0.35);
          c.fillStyle = "#f2a541"; c.fillRect(wxp - ws / 2, wyp - ws / 2, ws, ws);
          c.fillStyle = "#ffe2a0"; c.fillRect(wxp - ws / 2 + 1.5, wyp - ws / 2 + 1.5, ws - 3, ws * 0.45);
          c.strokeStyle = "#2a1608"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(wxp, wyp - ws / 2); c.lineTo(wxp, wyp + ws / 2); c.stroke();
          c.globalAlpha = 1;
        }
        return;
      }
      c.save();
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
      c.drawImage(ground, wx(WX0), wy(WY0), (WX1 - WX0) * S, (WY1 - WY0) * S);
      for (const o of posts) {
        if (o.friend && !o.pulled) continue;             // drawn above, in the lantern's own light
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
          if (!blit(c, "sprite-post", wx(o.x), wy(o.y))) {
            c.fillStyle = "#8a5a3b"; c.strokeStyle = "#4a2e1c"; c.lineWidth = 2;
            c.fillRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
            c.strokeRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
          }
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.55 * S)}px 'IBM Plex Mono', monospace`;
          c.fillText(String(o.n), wx(o.x) - 0.45 * S, wy(o.y) - 0.45 * S);
          if (st.ticked.has(o.n)) { c.strokeStyle = "#e8e1cf"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx(o.x) + 0.4 * S, wy(o.y) - 0.1 * S); c.lineTo(wx(o.x) + 0.55 * S, wy(o.y) + 0.1 * S); c.lineTo(wx(o.x) + 0.85 * S, wy(o.y) - 0.35 * S); c.stroke(); }
        } else {
          c.fillStyle = "#2b2420"; c.beginPath(); c.arc(wx(o.x), wy(o.y), 0.2 * S, 0, 7); c.fill();
        }
      }
      if (stage === 2) blit(c, "sprite-van", wx(6.2), wy(-4.6), -0.38);     // the van, parked at site 20
      for (let i = 0; i < (stage === 2 ? 10 : 0); i++) { // the slots at the five sites
        const sx = -3.4 + i * 0.95, sy = -3.2;
        const filled = st.slotted[i];
        if (filled ? !blit(c, "sprite-post", wx(sx), wy(sy)) : !blit(c, "slot-chalk", wx(sx), wy(sy))) {
          c.strokeStyle = "#3a2c1c"; c.lineWidth = 1.5;
          c.strokeRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S);
          if (filled) { c.fillStyle = "#8a5a3b"; c.fillRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S); }
        }
        if (filled) {
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
      const tamId = ["sprite-tam-walk", "sprite-tam-carry-one", "sprite-tam-carry-two"][st.carried.length];
      if (!blit(c, tamId, cx, cy, st.heading)) {          // Tam (the flat shapes, if the sprite is missing)
        c.fillStyle = "#2a3346"; c.beginPath(); c.ellipse(cx, cy + 0.06 * S, 0.34 * S, 0.24 * S, 0, 0, 7); c.fill();
        c.fillStyle = "#3b2b22"; c.beginPath(); c.arc(cx, cy, 0.17 * S, 0, 7); c.fill();
        st.carried.forEach((n, i) => { c.fillStyle = "#8a5a3b"; c.fillRect(cx - 0.55 * S + i * 0.75 * S, cy + 0.35 * S, 0.35 * S, 0.35 * S); });
      }
      const q = near();
      if (q && st.running && st.pullT <= 0 && st.carried.length < 2 && stage !== 3 && !(stage === 1 && st.ticked.has(q.n))) {   // a prompt, in the light
        c.font = `600 ${Math.max(13, Math.round(0.36 * S))}px 'IBM Plex Mono', monospace`;
        const txt = stage === 1 ? `T · tick post ${q.n}` : `hold E · post ${q.n}`, tw = c.measureText(txt).width;
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
      if (st.flashT > 0 && !api.reducedMotion) { c.fillStyle = `rgba(255,255,255,${(st.flashT / 0.35) * 0.55})`; c.fillRect(0, 0, W, H); }
      if (st.battery <= 0) {                              // June's lantern on the road
        const t = Math.max(0, st.juneT) / 2.5;
        if (!blit(c, "sprite-june-lantern", cx, cy - (1.2 + t * 3) * S, Math.PI / 2)) { c.fillStyle = "rgba(255,190,110,.6)"; c.beginPath(); c.arc(cx, cy - (1 + t * 3) * S, 0.45 * S, 0, 7); c.fill(); }
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
      if (k === "f" && !e.repeat) toggleOff();
      if (k === "b" && !e.repeat) swap();
      if (k === "c" && !e.repeat) flash();
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
    btn.flash.addEventListener("click", flash);
    function toggleOff() {
      if (!st.running || stage !== 3 || st.battery <= 0 || st.winT >= 0) return;
      st.off = !st.off; st.offT = 0;
      if (st.off) beat("off", TEXT.off, 4);
      hud();
    }
    btn.off.addEventListener("click", toggleOff);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("blur", blur);
    canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu);
    $(".go").addEventListener("click", () => {
      $(`.${PFX}intro`).remove();
      st.running = true; last = 0;
      say(TEXT.open[stage - 1], 4);
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
        listB.destroy();
      },
    };
  }
}

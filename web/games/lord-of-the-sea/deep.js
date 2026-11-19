// The Lord of the Sea: The Deep (2D, deep-sea naturalist lithograph).
// One dive cut from DESIGN.md section 10, after `d-first-dive`: down 80 m to the sunken tender,
// free the strongbox from the hull (hold Grip), carry it up (carrying halves speed; stirred
// currents help). No air: the pull, a soft timer shown as the plate's edges darkening. At zero the
// deep keeps him and the dive is lost. Hazards: a dredge chain that sweeps (contact pushes him
// back), a Company net (slows to 20% until cut by gripping and pulling), a cold current at 40-55 m.
// Stir: draw a circle (or hold E) and a 10 m ribbon of current runs the way the circle last turned.
// Three phases: the descent (net, chain, cold current), the tender (grip three seconds while the hull
// settles), and the ascent, when the Company drops a second net across the way up and the dredge
// sweeps faster. Beats and the Voice Beside lines are written for the game (refine additions list).
// Phase 1 (accepted 2026-11-15): the strongbox holds more than the harbour book. When it breaks the surface it is
// opened on deck: under the book lies chit No. 3, sea-swollen, its pledge run to a blur. One stir of seawater
// (a circle on the chit, or E) raises the ink: "an anchor's hold".
// Art pass: the light bands are the game's four plates, cross-faded by depth behind the play; the swimmer, the
// strongbox and the twelve glowing specimens are the game's art, each rasterised once (api.art).
import { pic, raster, endCard, chapterStrip, circleGesture } from "./_art.js";
import { ladder, note, flag, setFlag, gainChit } from "./_ladder.js";

const PLATE = "#0B1424", INKBLUE = "#1F2E4A", FOAM = "#E8F2EE", PAPER = "#F4F1E8", GOLD = "#E7A93B", GREEN = "#2F6B5E", VIOLET = "#4B3F63", RED = "#8C2B2B";
let WORLD_W = 150, FLOOR = 92, WRECK_X = 112, WRECK_Y = 85;   // FLOOR is set by the stage
const PULL_BASE = 120;               // seconds: the later dives' 120 (DESIGN.md section 10), so a browser dive can be finished
const FREE_S = 3;               // seconds of grip to work the strongbox free
const BEATS_TEACH = [
  { id: "light", y: 20, voice: true, text: "The light thinned to blue. He did not reach for air; there was none he needed." },
  { id: "dark", y: 60, text: "Below sixty metres only what glows gives light, and what he stirs." },
  { id: "voice", y: 75, voice: true, text: "The deep knew him. It wanted to keep us, gently, the way it keeps everything." },
];
const STIR_SPEED = 3;           // Current tier: 3 m/s, carries a person

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder. Teach is the dive above. Test is the trench off the
// Pearl Banks, where light is a cost: below 60 m he sees three metres, a stir lights eight for three seconds, the
// dredge chains swing toward light, and a Company sounding lead drops on a six-second beat with a net behind it.
// Chit No. 5 lies in the floor's dark. Twist is The Standing Fleet at 140 m: the pull stops, the bells are rung by
// pushing a current through them, and the one with an air meter is the diver in his arms.
const BEATS_TEST = [
  { id: "bank", y: 22, text: "Past Ide's bank the floor falls away. The Company's survey boat is sounding the trench above him, on the beat." },
  { id: "dark", y: 60, text: "Sixty metres. From here he sees an arm's length. A stir lights eight metres for three seconds, and the dredge chains swing toward any light." },
  { id: "voice", y: 100, voice: true, text: "We had paid for drink with a slack water once. It was down here somewhere, still slack." },
];
const BEATS_TWIST = [
  { id: "fleet", y: 104, voice: true, text: "Here the pull stopped. Every ship the old sea took stood upright on the floor, in rows: the sea's side of the ledger." },
];
const SHIPS = ["Mary Dunnock", "Tern", "Patience", "Three Sisters", "Halcyon", "Lantern Maid", "Kettle's Pride", "The Asking"];
const LADDER = {
  title: "The Deep", kicker: "2D · NATURALIST LITHOGRAPH · THREE DIVES",
  stages: {
    teach: { name: "Down to the Tender", where: "Chapter III, off Home Reach: swim, kick, carry.", line: "Swim, kick, carry." },
    test: { name: "The Trench", where: "Chapter IV, off the Pearl Banks: light is a cost, and a chit lies in the dark.", line: "The trench off the Pearl Banks, where light is a cost." },
    twist: { name: "The Standing Fleet", where: "Chapter IV, 140 metres: the pull stops, and the air is hers.", line: "At 140 metres the pull stops. The air that runs out is not his." },
  },
};

export default { mount(root, api) { return ladder(root, api, LADDER, (r, a) => game.mount(r, a)); } };

const game = {
  mount(root, api) {
    const P = "lord-of-the-sea-deep-";
    const reduce = api.reducedMotion;
    const gentle = (+api.store.get("losses", 0) || 0) >= 2;
    const stage = api.stage || "teach", trench = stage === "test", fleet = stage === "twist";
    FLOOR = trench ? 134 : fleet ? 150 : 92;
    const TOP = fleet ? 100 : 0.5, GMAX = fleet || trench ? 160 : 100;
    const BEATS = trench ? BEATS_TEST : fleet ? BEATS_TWIST : BEATS_TEACH;
    const PULL = trench ? (gentle ? 175 : 140) : gentle ? 150 : PULL_BASE;
    const AIR = gentle ? 55 : 36;
    // layer links (api.shared)
    const fate = flag(api, "charter.tidewater", "");
    const backplot = fleet && !!flag(api, "backplot.good");
    root.innerHTML = `
    <style>
      .${P}wrap { position:absolute; inset:0; background:${PLATE}; color:${FOAM}; font-family:'IM Fell English',Georgia,serif; overflow:hidden; touch-action:none; user-select:none; }
      .${P}wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .${P}pad { position:absolute; right:12px; bottom:12px; display:flex; gap:8px; }
      .${P}pad button { font:inherit; font-size:16px; color:${FOAM}; background:rgba(11,20,36,.7); border:1px solid ${FOAM}; border-radius:50%; width:64px; height:64px; cursor:pointer; touch-action:none; }
      .${P}pad button.on { background:${FOAM}; color:${PLATE}; }
      .${P}pad button .cd { position:absolute; left:0; bottom:0; height:4px; background:${GOLD}; border-radius:2px; }
      .${P}pad button { position:relative; overflow:hidden; }
      .${P}pad button[hidden] { display:none; }
      .${P}cap { position:absolute; left:50%; top:96px; transform:translateX(-50%); width:min(560px,calc(100% - 90px)); box-sizing:border-box; text-align:center; padding:8px 14px;
        background:rgba(11,20,36,.86); border:1px solid rgba(232,242,238,.5); font-size:16px; line-height:1.35; color:${FOAM}; pointer-events:none; opacity:0; transition:opacity .5s; }
      .${P}cap.show { opacity:1; }
      .${P}cap.voice { font-style:italic; color:#7FE0C2; border-color:#7FE0C2; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(5,9,15,.8); padding:14px; z-index:3; overflow:auto; }
      .${P}label { position:relative; max-width:520px; box-sizing:border-box; margin:8px; background:#ece6d6; color:#1b2230; padding:18px 22px 16px; border:1px solid #9a8f74;
        box-shadow:0 0 0 6px #0b1424, 0 0 0 7px rgba(232,242,238,.45), 0 12px 30px rgba(0,0,0,.6);
        background-image: radial-gradient(rgba(60,50,30,.10) 1px, transparent 1.3px); background-size:5px 5px; }
      .${P}label .cap2 { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.18em; font-size:13px; display:flex; justify-content:space-between; border-bottom:1px solid #1b2230; padding-bottom:4px; }
      .${P}label h2 { font-weight:400; font-size:clamp(26px,5vw,32px); margin:8px 0 2px; font-style:italic; }
      .${P}label .goal { font-size:17px; line-height:1.35; margin:0 0 8px; }
      .${P}label .open { font-size:15px; line-height:1.4; margin:0 0 10px; color:#3d4659; }
      .${P}figs { list-style:none; margin:0 0 10px; padding:8px 0 0; border-top:1px solid rgba(27,34,48,.4); display:grid; gap:6px; font-size:15px; line-height:1.3; }
      .${P}figs li { display:grid; grid-template-columns:58px minmax(0,1fr); gap:8px; }
      .${P}figs b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.06em; color:${VIOLET}; }
      .${P}figs kbd { font-family:inherit; border:1px solid #1b2230; padding:0 4px; font-size:14px; }
      .${P}label .gentle { font-style:italic; color:${GREEN}; font-size:15px; margin:0 0 8px; }
      .${P}label button { font:inherit; font-size:18px; padding:8px 26px; background:#1b2230; color:#ece6d6; border:0; cursor:pointer; }
      .${P}label button:hover, .${P}label button:focus-visible { background:${VIOLET}; }
      .${P}box { position:absolute; inset:0; z-index:4; display:grid; place-items:center; background:rgba(5,9,15,.86); padding:12px; overflow:auto; }
      .${P}box .in { max-width:620px; width:100%; box-sizing:border-box; background:#ece6d6; color:#1b2230; border:1px solid #9a8f74; padding:16px 20px; display:grid; gap:10px; box-shadow:0 12px 30px rgba(0,0,0,.6);
        background-image: radial-gradient(rgba(60,50,30,.10) 1px, transparent 1.3px); background-size:5px 5px; }
      .${P}box h2 { font-weight:400; font-style:italic; font-size:clamp(22px,4.6vw,28px); margin:0; }
      .${P}box p { margin:0; font-size:16px; line-height:1.4; }
      .${P}box p.v { font-style:italic; color:${GREEN}; }
      .${P}box .row { display:grid; grid-template-columns:110px minmax(0,1fr); gap:12px; align-items:center; }
      .${P}box .row img { width:110px; height:auto; }
      .${P}box .chit { position:relative; justify-self:center; width:min(100%,400px); cursor:grab; border:1px dashed #1b2230; }
      .${P}box .chit img { width:100%; height:auto; display:block; }
      .${P}box .chit .ring { position:absolute; inset:0; display:grid; place-items:center; pointer-events:none; }
      .${P}box .chit .ring svg { width:46%; height:auto; opacity:.8; }
      .${P}box button { justify-self:start; font:inherit; font-size:17px; padding:7px 20px; background:#1b2230; color:#ece6d6; border:0; cursor:pointer; }
      .${P}box button:hover, .${P}box button:focus-visible { background:${VIOLET}; }
      @media (max-width:520px) { .${P}label { padding:14px; } .${P}box .row { grid-template-columns:72px minmax(0,1fr); } .${P}box .row img { width:72px; } .${P}cap { top:96px; width:calc(100% - 70px); font-size:15px; left:auto; right:12px; transform:none; } .${P}pad button { width:58px; height:58px; } }
    </style>
    <div class="${P}wrap">
      <canvas aria-label="The Deep: a diver in a dark plate, glowing specimens, a wreck far below"></canvas>
      <div class="${P}cap" aria-live="polite"></div>
      <div class="${P}pad"><button type="button" data-k="kick" aria-label="Kick (Space)">Kick<span class="cd"></span></button><button type="button" data-k="grip" hidden aria-label="Grip (hold Shift)">Grip</button></div>
      <div class="${P}how" role="dialog" aria-label="How to play">
        <div class="${P}label">
          ${chapterStrip(api.art, trench || fleet ? 5 : 4, trench || fleet ? "Chapter V: The Open Chart" : "Chapter IV: What Is Left of the Old Sea")}
          <div class="cap2"><span>PLATE ${trench ? "V" : fleet ? "VI" : "IV"}</span><span>CHAPTER ${trench || fleet ? "IV" : "III"}</span><span>THE DEEP</span></div>
          ${pic(api.art, "swimmer", "Alexi swimming, drawn in white line on blue-black", `style="float:right;width:min(38%,170px);height:auto;margin:6px 0 6px 12px;border:1px solid #1b2230"`)}
          <h2>${trench ? "The trench" : fleet ? "The Standing Fleet" : "Down to the tender"}</h2>
          <p class="goal">${trench ? "Find the chit on the trench floor, 130 m down, and bring it back up to sixty metres before the pull closes the edges."
            : fleet ? "Find the flagship, the Halcyon, among the standing hulls. Ide is in her ribs. Carry her up her crew's line before her air is gone."
            : "Swim down 80 m to the sunken tender, work its strongbox free, and carry it up before the pull closes the edges."}</p>
          <p class="open">${trench ? "Off the Pearl Banks the floor drops out of the light. One of his own chits went down here, years since. Below sixty metres he sees an arm's length; the paper answers a stir's glow from twenty-five metres off, and so does the Company's dredge."
            : fleet ? "A hundred and forty metres. The divers' compact was cut into the Halcyon's ballast stone, and Ide went down for the rubbing before he could stop her. Here the pull stops: he could stay for ever. She cannot."
            : "The Company's tender went down off Home Reach with Tidewater's harbour book locked in its strongbox. Whatever binds that harbour is written there. Alexi goes over the side with no breath to hold."}</p>
          ${gentle ? `<p class="gentle">${fleet ? "Her crew sent her down on a deeper breath this time: fifty-five seconds of air." : trench ? "The deep is slower to close this time: the pull runs 175 seconds." : "The deep is slower to close this time: the pull runs 150 seconds."}</p>` : ""}
          <ul class="${P}figs">
            ${trench ? `<li><b>Fig. 1</b><span><b>Stir</b> (draw a circle, or hold <kbd>E</kbd> with a direction): below 60 m it lights eight metres for three seconds. The chit shines back. The <b>chains swing toward the light</b>.</span></li>
            <li><b>Fig. 2</b><span><b>The lead</b> drops every six seconds where you were a second ago. Keep moving: touch it and a net follows it down.</span></li>
            <li><b>Fig. 3</b><span><b>Grip</b> (<kbd>Shift</kbd>) a second and a half to lift the chit; <kbd>WASD</kbd> swim, <kbd>Space</kbd> kick.</span></li>`
            : fleet ? `<li><b>Fig. 1</b><span><b>Ring a bell</b>: stir a current <i>through</i> it (draw a circle beside it, or hold <kbd>E</kbd> with a direction). The hull shows its ribs for three seconds, and its name for good.</span></li>
            <li><b>Fig. 2</b><span><b>Grip</b> (<kbd>Shift</kbd>) two seconds to take Ide in his arms. From then <b>her air</b> runs: ${AIR} seconds.</span></li>
            <li><b>Fig. 3</b><span><b>Carry</b> her up the line above the flagship. Carrying halves his speed; a current stirred upward does not tire.</span></li>`
            : `<li><b>Fig. 1</b><span><b>Swim</b>: <kbd>WASD</kbd> or arrows, or press and drag toward where you want to go.</span></li>
            <li><b>Fig. 2</b><span><b>Kick</b>: <kbd>Space</kbd> or the Kick button. A burst of speed, then two seconds to recover.</span></li>
            <li><b>Fig. 3</b><span><b>Stir</b>: draw a circle (or hold <kbd>E</kbd> with a direction). A current runs the way the circle last turned, and carries him.</span></li>`}
          </ul>
          <button type="button">Dive</button>
        </div>
      </div>
    </div>`;
    const wrap = root.querySelector("." + P + "wrap");
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const how = wrap.querySelector("." + P + "how");
    const rng = api.rng("deep");
    const capEl = wrap.querySelector("." + P + "cap");
    const kickBtn = wrap.querySelector('[data-k="kick"]'), gripBtn = wrap.querySelector('[data-k="grip"]');
    const losses = +api.store.get("losses", 0) || 0;
    const art = api.art;
    // art, rasterised once at the size it is drawn; rebuilt when the plate is resized
    const A = { bands: [], spec: [], swim: null, kick: null, box: null, key: "", hulls: [], carry: null, chit: null };
    let prepTimer = 0, dead = false;
    async function prep() {
      if (dead || !W || !Hh) return;
      const key = W + "x" + Hh;
      if (A.key === key) return;
      A.key = key;
      const bw = Math.ceil(W * 1.12), bh = Math.ceil(Hh * 1.12);
      const bands = await Promise.all([1, 2, 3, 4].map((i) => raster(art, "deep-band-" + i, bw, bh, { src: [130, 24, 1440, 826] })));
      if (dead || A.key !== key) return;
      A.bands = bands;
      if (!A.spec.length) {
        const ids = art.list("backdrops").filter((id) => id.startsWith("specimen-")).sort();
        A.spec = (await Promise.all(ids.map((id) => raster(art, id, 128, 128, { src: [56, 46, 248, 248], key: true })))).filter(Boolean);
      }
      const sw = Math.round(ppm * 7.2 * dpr);
      A.swim = await raster(art, "sprite-swimmer", sw, sw / 2);
      A.kick = await raster(art, "sprite-swimmer-kick", sw, sw / 2);
      A.box = await raster(art, "sprite-strongbox", Math.round(ppm * 3 * dpr), Math.round(ppm * 2.25 * dpr));
      if (fleet) {
        A.carry = await raster(art, "sprite-swimmer-carry", sw, sw / 2);
        const hw = Math.round(ppm * 12.2 * dpr);
        const hs = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map((i) => raster(art, "fleet-hull-" + i, hw, Math.round(hw * 680 / 520), { key: true })));
        if (dead || A.key !== key) return;
        A.hulls = hs;
      }
      if (trench) A.chit = await raster(art, "chit-5-trench", Math.round(ppm * 3.4 * dpr), Math.round(ppm * 2.2 * dpr));
    }
    let capT = 0;
    function caption(text, voice, sec = 6) { capEl.textContent = text; capEl.classList.toggle("voice", !!voice); capEl.classList.add("show"); capT = sec; }
    const fired = new Set();
    let flashT = 0, flashCol = RED, rings = [];

    const d = { x: 12, y: fleet ? 104 : 1, vx: 0, vy: 0, face: 1, kick: 0, cool: 0, grip: false, carry: false, free: 0, pull: PULL, net: 0, cut: 0, msg: "", msgT: 0, hit: 0 };
    let t = 0, running = false, over = false, chainT = 0;
    let currents = [];
    const nets = fleet ? [] : [{ x0: 46, x1: 66, y0: 24, y1: 33, cut: false }];
    let sweep = 0.35;
    const chains = trench ? [{ ax: 50, hook: true, hx: 50, hy: 106, chase: 0, ph: 0 }, { ax: 104, hook: true, hx: 104, hy: 106, chase: 0, ph: 2.2 }] : fleet ? [] : [{ ax: 80, len: 64, a: 0, ph: 0 }];
    const cold = fleet ? { y0: -9, y1: -8, v: 0 } : { y0: 40, y1: 55, v: -2.2 };
    // link: a charter's fate redraws this plate. Struck: the Company's gear is abandoned where it hung.
    if (stage === "teach" && fate === "strike") nets.push({ x0: 18, x1: 38, y0: 50, y1: 57, cut: false, old: true }, { x0: 88, x1: 108, y0: 64, y1: 71, cut: false, old: true });
    // the trench (test)
    let glow = 0, notice = 0, leadT = 4, lead = null, lit = 0;
    // the standing fleet (twist)
    const rng2 = api.rng();                                       // a different fleet each dive
    const flagI = 3 + Math.floor(rng2() * 5);                    // which hull is the flagship: found by her bell
    const order = SHIPS.filter((n) => n !== "Halcyon"); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng2() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const hulls = fleet ? Array.from({ length: 8 }, (_, i) => ({ i, x: 16 + i * 17, name: i === flagI ? "Halcyon" : order.pop(), rung: false, show: 0 })) : [];
    const lineX = fleet ? hulls[flagI].x : 0;
    if (fleet) { nets.push({ x0: lineX - 10, x1: lineX + 8, y0: 121, y1: 127, cut: false, old: true }, { x0: 40, x1: 56, y0: 112, y1: 119, cut: false, old: true }); if (backplot) d.x = Math.max(4, lineX - 14); }
    let air = AIR, named = [];
    const specimens = [];
    const COLS = [GOLD, FOAM, "#9C8FC0", "#5FB39E"];
    for (let i = 0; i < 26; i++) specimens.push({ x: rng() * WORLD_W, y: 8 + rng() * (FLOOR - 12), r: 0.6 + rng() * 1.3, c: COLS[i % 4], ph: rng() * 6, spines: 8 + Math.floor(rng() * 10), fig: i + 1 });
    const motes = []; for (let i = 0; i < 220; i++) motes.push({ x: rng() * WORLD_W, y: rng() * FLOOR, s: rng() });
    const floorAt = (x) => (fleet ? FLOOR - 0.6 * Math.sin(x * 0.2) : FLOOR - 3 * Math.sin(x * 0.11) - 2 * Math.sin(x * 0.037 + 1));
    const bellAt = (h) => [h.x - 3.4, floorAt(h.x) - 13.2];
    let chitX = 20; if (trench) { let best = -1; for (let x = 20; x <= 132; x += 1) { if (Math.abs(x - 50) < 12 || Math.abs(x - 104) < 12) continue; const f = floorAt(x); if (f > best) { best = f; chitX = x; } } }
    const chitY = () => floorAt(chitX) - 1.3;
    function say(m, s = 2.4) { d.msg = m; d.msgT = s; }

    // ---- input ----
    const keys = {};
    const held = { kick: false, grip: false };
    const stir = { on: false, angle: 0, pts: [], cx: 0, cy: 0, last: null, dirs: [], key: false, keyT: 0 };
    let swimTo = null;
    function spawnCurrent(x, y, dx, dy) {
      const m = Math.hypot(dx, dy) || 1;
      const cur = { x, y, dx: dx / m, dy: dy / m, len: 10, age: 0, life: 7 };
      currents.push(cur);
      rings.push({ x, y, age: 0 });
      if (trench && d.y > 60) { glow = 3; lit++; for (const c of chains) c.chase = 4.6; if (!fired.has("glow")) { fired.add("glow"); caption("Light, for three seconds. Somewhere the chains have felt it and are already swinging this way.", false, 5); } }
      for (const h of hulls) { const [bx, by] = bellAt(h), rx = bx - cur.x, ry = by - cur.y, along = rx * cur.dx + ry * cur.dy, perp = Math.abs(rx * -cur.dy + ry * cur.dx); if (along > -1.5 && along < cur.len + 1 && perp < 3) ring(h); }
      say("A current, " + ["up", "down", "left", "right"][Math.abs(dy) > Math.abs(dx) ? (dy < 0 ? 0 : 1) : (dx < 0 ? 2 : 3)]);
    }
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "e", " ", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      if (k === " " && running) kickNow();
      if (k === "e" && running && !keys.e) { stir.key = true; stir.keyT = 0; }
      keys[k] = true;
    };
    const ku = (e) => {
      const k = e.key.toLowerCase(); keys[k] = false;
      if (k === "e" && stir.key) {
        if (stir.keyT >= 0.6) { let [ix, iy] = inputDir(); if (!ix && !iy) iy = -1; spawnCurrent(d.x - ix * 4, d.y - iy * 4, ix, iy); }
        stir.key = false;
      }
    };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    function kickNow() { if (d.cool <= 0) { d.kick = 1; d.cool = 2; } }
    function inputDir() {
      let ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
      let iy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
      return [ix, iy];
    }

    let W = 0, Hh = 0, dpr = 1, ppm = 10, camX = 0, camY = 0;
    const sx = (x) => (x - camX) * ppm + W / 2, sy = (y) => (y - camY) * ppm + Hh / 2;
    const wxp = (px) => (px - W / 2) / ppm + camX, wyp = (py) => (py - Hh / 2) / ppm + camY;
    function ptr(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    const pd = (e) => {
      if (!running) return;
      const [px, py] = ptr(e); cv.setPointerCapture?.(e.pointerId);
      stir.on = true; stir.angle = 0; stir.pts = [[px, py]]; stir.cx = px; stir.cy = py; stir.last = null; stir.dirs = [];
      swimTo = [px, py]; e.preventDefault();
    };
    const pm = (e) => {
      if (!stir.on) return;
      const [px, py] = ptr(e);
      const prev = stir.pts[stir.pts.length - 1];
      stir.pts.push([px, py]); if (stir.pts.length > 90) stir.pts.shift();
      stir.dirs.push([px - prev[0], py - prev[1]]); if (stir.dirs.length > 12) stir.dirs.shift();
      const n = stir.pts.length;
      stir.cx += (px - stir.cx) / Math.min(n, 25); stir.cy += (py - stir.cy) / Math.min(n, 25);
      const dx = px - stir.cx, dy = py - stir.cy;
      swimTo = Math.abs(stir.angle) > Math.PI ? null : [px, py];
      if (dx * dx + dy * dy < 49) return;
      const a = Math.atan2(dy, dx);
      if (stir.last != null) { let q = a - stir.last; if (q > Math.PI) q -= 2 * Math.PI; if (q < -Math.PI) q += 2 * Math.PI; stir.angle += q; }
      stir.last = a;
      if (Math.abs(stir.angle) >= Math.PI * 2) {
        const v = stir.dirs.reduce((s, q) => [s[0] + q[0], s[1] + q[1]], [0, 0]);
        spawnCurrent(wxp(stir.cx), wyp(stir.cy), v[0], v[1]);
        stir.angle = 0; stir.pts = [[px, py]];
      }
    };
    const pu = () => { stir.on = false; swimTo = null; };
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm);
    cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    for (const b of wrap.querySelectorAll("." + P + "pad button")) {
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); if (b.dataset.k === "kick") kickNow(); else held.grip = true; b.classList.add("on"); });
      const up = () => { if (b.dataset.k === "grip") held.grip = false; b.classList.remove("on"); };
      b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up); b.addEventListener("pointercancel", up);
    }

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = wrap.clientWidth; Hh = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      ppm = Math.max(7, Math.min(16, Math.min(W, Hh * 1.4) / 46));
      clearTimeout(prepTimer); prepTimer = setTimeout(prep, A.key ? 260 : 0);
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // ---- simulation ----
    // k in 0..1 along the chain. The first dive's chain swings from its anchor; the trench's two are hooks on a long scope.
    const chainPos = (c, k) => (c.hook ? [c.ax + (c.hx - c.ax) * k + Math.sin(k * Math.PI) * (c.hx - c.ax) * 0.12, -2 + (c.hy + 2) * k] : [c.ax + Math.sin(c.a) * c.len * k, -2 + Math.cos(c.a) * c.len * k]);
    function ring(h) {
      h.show = 3; flashT = 0.5; flashCol = GOLD; rings.push({ x: bellAt(h)[0], y: bellAt(h)[1], age: 0 });
      if (!h.rung) {
        h.rung = true; named.push(h.name);
        const all = flag(api, "bells", []); if (Array.isArray(all) && !all.includes(h.name)) setFlag(api, "bells", all.concat([h.name]));
      }
      caption(h.i === flagI ? "The bell says HALCYON. The flagship. In her ribs, low down, a diver's lamp is still burning." : `The bell says ${h.name.toUpperCase()}. Her ribs stand open for a moment, and there is no one in them.`, false, 5);
    }
    function step(dt) {
      t += dt; chainT += dt * sweep;
      if (glow > 0) glow -= dt;
      for (const c of chains) {
        if (!c.hook) { c.a = Math.sin(chainT) * 0.55; continue; }
        if (c.chase > 0) c.chase -= dt;
        const tx = c.chase > 0 ? d.x : c.ax + Math.sin(chainT * 0.8 + c.ph) * 20, ty = c.chase > 0 ? d.y : 106;   // toward the light, while it remembers it
        const mx = tx - c.hx, my = ty - c.hy, mm = Math.hypot(mx, my), sp = (c.chase > 0 ? 5.2 : 3) * dt;
        if (mm > sp) { c.hx += (mx / mm) * sp; c.hy += (my / mm) * sp; } else { c.hx = tx; c.hy = ty; }
      }
      for (const h of hulls) if (h.show > 0) h.show -= dt;
      if (trench) { // the sounding lead, on the beat
        leadT -= dt;
        if (leadT <= 0 && !lead && d.y > 24) { lead = { x: d.x + d.vx * 0.3, y: 0, wait: 1.1, hit: false }; leadT = 6; }
        if (lead) {
          if (lead.wait > 0) lead.wait -= dt; else lead.y += 30 * dt;
          if (!lead.hit && lead.wait <= 0 && Math.abs(d.x - lead.x) < 1.5 && Math.abs(d.y - lead.y) < 2.4) {
            lead.hit = true; notice += 5; flashT = 0.8; flashCol = RED;
            nets.push({ x0: Math.max(2, d.x - 9), x1: Math.min(WORLD_W - 2, d.x + 9), y0: d.y - 4, y1: d.y + 5, cut: false });
            caption("The lead touches him. Up above a clerk writes a depth that cannot be right, and a net follows the line down. Notice +5.", false, 6);
          }
          if (lead.y > floorAt(lead.x)) lead = null;
        }
      }
      if (d.msgT > 0) d.msgT -= dt;
      if (capT > 0) { capT -= dt; if (capT <= 0) capEl.classList.remove("show"); }
      if (flashT > 0) flashT = Math.max(0, flashT - dt * 1.5);
      rings.forEach((r) => (r.age += dt)); rings = rings.filter((r) => r.age < 1);
      for (const b of BEATS) if (!fired.has(b.id) && !d.carry && d.y >= b.y) { fired.add(b.id); caption(b.text, b.voice); }
      if (!d.carry && d.pull < PULL * 0.35 && !fired.has("late")) { fired.add("late"); caption("The edges are closing. Kick, and ride a current if you stir one.", false, 4); }
      if (!fleet) d.pull -= dt;
      if (d.pull <= 0) { finish(false); return; }
      if (fleet && d.carry) { air -= dt; if (air <= 0) { finish(false); return; } if (air < AIR * 0.4 && !fired.has("air")) { fired.add("air"); caption("Her hand has stopped holding his sleeve. Up: stir the water upward and ride it.", false, 4); } }
      if (d.cool > 0) d.cool -= dt;
      if (d.kick > 0) d.kick -= dt;
      if (stir.key) stir.keyT += dt;
      d.grip = !!(keys.shift || keys.g || held.grip);
      let [ix, iy] = inputDir();
      if (swimTo) { const tx = wxp(swimTo[0]) - d.x, ty = wyp(swimTo[1]) - d.y, m = Math.hypot(tx, ty); if (m > 0.8) { ix = tx / m; iy = ty / m; } }
      const im = Math.hypot(ix, iy); if (im > 1) { ix /= im; iy /= im; }
      if (ix) d.face = Math.sign(ix);
      let top = d.kick > 0 ? 6 : 3;
      if (d.carry) top *= 0.5;
      const inNet = nets.find((n) => !n.cut && d.x > n.x0 && d.x < n.x1 && d.y > n.y0 && d.y < n.y1);
      if (inNet) {
        top *= 0.2;
        if (d.grip && im > 0) { d.cut += dt; if (d.cut > 1) { inNet.cut = true; d.cut = 0; say("The net parts."); flashT = 0.6; flashCol = GREEN; rings.push({ x: d.x, y: d.y, age: 0 }); } }
        if (!d.net) { say("Caught in a Company net: hold Grip and swim to tear it."); if (!fired.has("grip")) { fired.add("grip"); gripBtn.hidden = false; caption("A Company net. Fig. 4, Grip: hold Shift (or the Grip button) and swim against it to tear it open.", false, 7); } }
        d.net = 1;
      } else { d.net = 0; d.cut = 0; }
      const k = Math.min(1, dt / 0.3);
      d.vx += (ix * top - d.vx) * k; d.vy += (iy * top - d.vy) * k;
      // drift: currents, cold current, a slow sink when still
      let ex = 0, ey = 0;
      if (d.y > cold.y0 && d.y < cold.y1) ex += cold.v;
      for (const c of currents) {
        const rx = d.x - c.x, ry = d.y - c.y, along = rx * c.dx + ry * c.dy, perp = Math.abs(rx * -c.dy + ry * c.dx);
        if (along > -1 && along < c.len && perp < 2.6) { const f = Math.min(1, (c.life - c.age) / 1.5) * STIR_SPEED; ex += c.dx * f; ey += c.dy * f; }
      }
      if (im === 0) ey += 0.25;
      d.x += (d.vx + ex) * dt; d.y += (d.vy + ey) * dt;
      d.x = Math.max(1, Math.min(WORLD_W - 1, d.x));
      d.y = Math.max(TOP, Math.min(floorAt(d.x) - 1, d.y));
      // chain
      if (d.hit > 0) d.hit -= dt;
      for (const ch of chains) for (let i = ch.hook ? 21 : 1; i <= 26; i++) {
        const [cx, cy] = chainPos(ch, i / 26);
        if (Math.hypot(d.x - cx, d.y - cy) < 1.6 && d.hit <= 0) {
          const dir = Math.sign(d.x - cx) || 1; d.x += dir * 5; d.vx = dir * 3; d.hit = 1.2; say("The dredge chain sweeps him back."); flashT = 0.8; flashCol = RED; break;
        }
      }
      if (trench) { // chit No. 5, in the floor's dark
        const nearC = Math.hypot(d.x - chitX, d.y - chitY()) < 3.6;
        if (!d.carry && nearC && !fired.has("chit")) { fired.add("chit"); gripBtn.hidden = false; caption("A chandler's slip, flat on the silt under its own salt bloom. Hold Grip to lift it.", false, 5); }
        if (!d.carry && nearC && d.grip) { d.free += dt; if (d.free >= 1.5) { d.carry = true; flashT = 0.8; flashCol = GOLD; rings.push({ x: d.x, y: d.y, age: 0 }); caption("He has it. Up to sixty metres, where the light begins; the paper weighs nothing.", false, 5); } }
        else if (!d.carry) d.free = Math.max(0, d.free - dt);
        if (d.carry && d.y < 60) finish(true);
        return;
      }
      if (fleet) { // Ide, in the flagship's ribs
        const ix = hulls[flagI].x + 1.5, iy = floorAt(ix) - 3;
        const nearI = Math.hypot(d.x - ix, d.y - iy) < 4.2;
        if (!d.carry && nearI && !fired.has("ide")) { fired.add("ide"); gripBtn.hidden = false; caption("Ide, wedged in the Halcyon's ribs with the rubbing folded in her teeth and her lamp guttering. Hold Grip to take her.", false, 6); }
        if (!d.carry && nearI && d.grip) { d.free += dt; if (d.free >= 2) { d.carry = true; air = AIR; flashT = 0.8; flashCol = GOLD; rings.push({ x: d.x, y: d.y, age: 0 }); caption(`She is in his arms, and the only clock down here has started: her air, ${AIR} seconds. Up the line above the flagship. An old net hangs across it.`, false, 7); } }
        else if (!d.carry) d.free = Math.max(0, d.free - dt);
        if (d.carry && d.y < 103 && Math.abs(d.x - lineX) < 9) finish(true);
        return;
      }
      currents.forEach((c) => (c.age += dt)); currents = currents.filter((c) => c.age < c.life);
      // the strongbox
      const near = Math.hypot(d.x - WRECK_X, d.y - (WRECK_Y + 2)) < 4.5;
      if (!d.carry && near && !fired.has("tender")) { fired.add("tender"); gripBtn.hidden = false; caption("The strongbox, wedged in the tender's ribs, the Company's mark on its lid. Hold Grip to work it free.", false, 6); }
      if (!d.carry && near && d.grip) {
        d.free += dt;
        if (d.free >= FREE_S / 2 && !fired.has("settle")) { fired.add("settle"); say("The hull groans and settles."); flashT = 0.5; flashCol = GOLD; }
        if (d.free >= FREE_S) {
          d.carry = true; flashT = 0.8; flashCol = GOLD; rings.push({ x: d.x, y: d.y, age: 0 });
          // the turn: up above, the Company has heard the dredge strike something, and drops a second net
          nets.push({ x0: Math.max(4, Math.min(WORLD_W - 26, d.x - 14)), x1: Math.max(26, Math.min(WORLD_W - 4, d.x + 8)), y0: 13, y1: 20, cut: false, late: true });
          sweep = 0.55;
          caption("Free. Above, a second net comes down across the way up, and the dredge swings faster. Carrying halves your speed: stir currents upward.", false, 7);
        }
      }
      else if (!d.carry) d.free = Math.max(0, d.free - dt);
      if (d.carry && d.y < 30 && !fired.has("near")) { fired.add("near"); caption("Thirty metres. The light comes back to his hands, and the box is lighter than it was.", true, 5); }
      if (d.carry && d.y < 2.2) finish(true);
    }
    const netsCut = () => nets.filter((n) => n.cut).length;
    function finish(won) {
      if (over) return; over = true; running = false;
      const left = Math.max(0, Math.round(d.pull));
      api.store.set("losses", won ? 0 : losses + 1);
      if (trench) {
        if (won) { gainChit(api, 5); endCard(root, art, "chit-5-trench", "CHIT No. 5 · A SLACK WATER", "#05090f"); api.end({ outcome: "win", text: `Chit No. 5 comes up into the light with ${left} s of the pull to spare: “a slack water. Pays next tide.” Signed with a clockwise spiral, stamped with the Company's leaf. He lit the trench ${lit} time${lit === 1 ? "" : "s"} to find it${notice ? `, and the survey boat's lead found him: notice +${notice}` : ""}. The fifth of eight.` }); }
        else { endCard(root, art, "deep-band-4", "BELOW 150 METRES · ONLY WHAT GLOWS", "#05090f"); api.end({ outcome: "lose", text: d.carry ? "The chit was in his hand, but the trench kept him below the light. The dive will have to be made again." : "The edges close in the dark of the trench. A stir shows the chit from twenty-five metres off; the chains only reach where the light has been." }); }
        return;
      }
      if (fleet) {
        if (won) { endCard(root, art, "carried-person", "THE STANDING FLEET · UP THE LINE", "#05090f"); api.end({ outcome: "win", text: `Ide goes up her crew's line with ${Math.max(0, Math.round(air))} s of air left, the rubbing of the compact stone still folded in her teeth. Below, the fleet stands as it stood. ${named.length ? `He rang ${named.length} bell${named.length === 1 ? "" : "s"} and read ${named.length === 1 ? "a name" : "their names"}: ${named.join(", ")}. A name that has been read can be answered for.` : "He rang no bell but hers was not needed: he found her by her lamp."}` }); }
        else { endCard(root, art, "deep-band-4", "140 METRES · THE SEA'S SIDE OF THE LEDGER", "#05090f"); api.end({ outcome: "lose", text: "Her air is gone before the line. The divers' chorus take her from his arms at the top and work on her in silence; the Tide Reckoning will say whether it was enough. He could have stayed down for ever, and that was never the question." }); }
        return;
      }
      if (won) openBox(`The strongbox breaks the surface with ${left} s of the pull to spare${netsCut() ? `, and ${netsCut()} Company net${netsCut() === 1 ? "" : "s"} torn on the way` : ""}. Swollen, not locked: the harbour book of Tidewater is inside, and the princess is already reaching for it.`);
      else endCard(root, art, "deep-band-4", "BELOW 150 METRES · ONLY WHAT GLOWS", "#05090f"), api.end({ outcome: "lose", text: d.carry ? "The strongbox was free, but the deep kept him. He settles gently to the floor beside it, and the dive will have to be made again from the last mark." : "The edges close before he reaches the tender. The deep keeps him a while, gently, and the dive will have to be made again." });
    }

    // ---- the strongbox on deck: chit No. 3 ----
    let box = null, ungest = null, boxKey = null;
    function openBox(winText) {
      box = document.createElement("div");
      box.className = P + "box"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "The strongbox, opened on deck");
      const stage = (raised) => {
        box.innerHTML = `<div class="in">
          <h2>The strongbox, on deck</h2>
          ${pic(art, "rule-wild", "", `style="width:100%;height:auto;display:block"`)}
          <div class="row">${pic(art, "sprite-strongbox", "") || "<span></span>"}<p>Swollen, not locked. On top, the harbour book of Tidewater. Under it, flat against the lid, a chandler's slip the sea has had for years${raised ? "." : ": No. 3. The pledge has run to a blur."}</p></div>
          <div class="chit" data-chit="1" aria-label="${raised ? "Chit No. 3: an anchor's hold" : "Chit No. 3, its pledge unreadable. Draw a circle on it to stir a drop of seawater onto it."}">${pic(art, raised ? "chit-3-strongbox-raised" : "chit-3-strongbox", "") || `<div style="padding:26px;text-align:center">Chit No. 3${raised ? ": “an anchor's hold”" : " (unreadable)"}</div>`}
            ${raised ? "" : `<span class="ring"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 30 C32 26 37 28 36 33 C35 39 26 40 23 34 C19 26 27 17 36 19 C47 22 49 37 41 44 C31 52 14 46 13 32 C12 20 22 10 34 10" fill="none" stroke="#3C7A6A" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/></svg></span>`}</div>
          ${raised ? `<p>The salt lets go of the ink. <b>No. 3.</b> <i>An anchor's hold. Pays next tide.</i> Signed with a clockwise spiral, and stamped, later, with the Company's leaf.</p>
            <p class="v">The hand was his. The deep had only been minding it.</p>
            <button type="button" data-b="shut">Shut the box</button>`
          : `<p>Seawater took the ink, and seawater will give it back. <b>Stir</b> one drop onto the chit: draw a circle on it, or press <b>E</b>.</p>
            <button type="button" data-b="stir">Stir a drop onto it (E)</button>`}
        </div>`;
        if (ungest) { ungest(); ungest = null; }
        const go = () => stage(true);
        if (!raised) { ungest = circleGesture(box.querySelector("[data-chit]"), go); box.querySelector("[data-b=stir]").addEventListener("click", go); }
        else box.querySelector("[data-b=shut]").addEventListener("click", () => { closeBox(); gainChit(api, 3); api.end({ outcome: "win", text: winText + " And chit No. 3, “an anchor's hold”: the third of eight." }); });
        box.querySelector("button").focus();
        boxRaised = raised;
      };
      let boxRaised = false;
      boxKey = (e) => { if ((e.key === "e" || e.key === "E") && box && !boxRaised) stage(true); };
      addEventListener("keydown", boxKey);
      wrap.appendChild(box);
      stage(false);
    }
    function closeBox() { if (ungest) { ungest(); ungest = null; } if (boxKey) { removeEventListener("keydown", boxKey); boxKey = null; } if (box) { box.remove(); box = null; } }

    // ---- drawing ----
    function radiolarian(x, y, r, col, spines, ph, glow) {
      if (glow) {
        const gr = g.createRadialGradient(x, y, 0, x, y, r * 4);
        gr.addColorStop(0, col + "AA"); gr.addColorStop(1, col + "00");
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 4, 0, 7); g.fill();
      }
      g.strokeStyle = col; g.lineWidth = 1;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      g.beginPath(); g.arc(x, y, r * 0.55, 0, 7); g.stroke();
      g.beginPath();
      for (let i = 0; i < spines; i++) { const a = ph + (i / spines) * Math.PI * 2; g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r * 1.9, y + Math.sin(a) * r * 1.9); }
      g.lineWidth = 0.6; g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r * 0.18, 0, 7); g.fill();
    }
    function drawDiver() {
      const x = sx(d.x), y = sy(d.y), k = ppm / 10;
      const ang = Math.atan2(d.vy, Math.abs(d.vx) + 0.001) * 0.8;
      if (A.swim) { // the game's swimmer, glide and kick
        const moving = Math.hypot(d.vx, d.vy) > 0.6;
        const im = fleet && d.carry && A.carry ? A.carry : (d.kick > 0 || (moving && (t * (d.carry ? 1.6 : 2.4)) % 1 < 0.45)) && A.kick ? A.kick : A.swim;
        const wpx = ppm * 7.2, hpx = wpx / 2;
        g.save(); g.translate(x, y); g.scale(d.face, 1); g.rotate(ang);
        g.drawImage(im, -wpx * (140 / 300), -hpx * (70 / 150), wpx, hpx);
        if (d.carry && stage === "teach") { if (A.box) g.drawImage(A.box, ppm * 0.4, ppm * 0.3, ppm * 2.4, ppm * 1.8); else { g.fillStyle = GOLD; g.fillRect(ppm * 0.6, ppm * 0.3, ppm * 1.4, ppm); } }
        if (d.carry && trench) { g.fillStyle = PAPER; g.fillRect(ppm * 1.6, -ppm * 0.2, ppm * 1.1, ppm * 0.7); }
        g.restore();
        return;
      }
      g.save(); g.translate(x, y); g.scale(d.face * k, k); g.rotate(ang);
      g.strokeStyle = FOAM; g.lineWidth = 2.4; g.lineCap = "round";
      const sw = Math.sin(t * (d.kick > 0 ? 14 : 7)) * 6;
      g.beginPath(); g.moveTo(-6, 0); g.lineTo(12, -1); // torso
      g.moveTo(-6, 0); g.lineTo(-20, 3 + sw * 0.6); g.moveTo(-6, 0); g.lineTo(-20, -3 - sw * 0.6); // legs
      g.moveTo(10, -1); g.lineTo(22, -8 + sw * 0.4); g.moveTo(10, -1); g.lineTo(21, 6 - sw * 0.4); // arms
      g.stroke();
      g.fillStyle = FOAM; g.beginPath(); g.arc(16, -2, 3.6, 0, 7); g.fill();
      if (d.carry) { g.fillStyle = GOLD; g.strokeStyle = PLATE; g.lineWidth = 1; g.fillRect(18, 2, 11, 8); g.strokeRect(18, 2, 11, 8); g.beginPath(); g.moveTo(18, 6); g.lineTo(29, 6); g.stroke(); }
      g.restore();
    }
    function draw() {
      camX = Math.max(W / 2 / ppm, Math.min(WORLD_W - W / 2 / ppm, d.x));
      camY = Math.max(Hh / 2 / ppm - 6, Math.min(FLOOR + 6 - Hh / 2 / ppm, d.y));
      // light bands, sampled per strip
      const bands = (y) => (y < 0 ? "#3a5a78" : y < 20 ? "#26405e" : y < 60 ? "#15253c" : y < 150 ? "#0b1424" : "#060b14");
      const sky = sy(0);
      const plates = A.bands.length === 4 && A.bands.every(Boolean);
      if (plates) { // the four plates, cross-faded by depth, drifting a little against the play
        const sm = (a, b, v) => { const u = Math.max(0, Math.min(1, (v - a) / (b - a))); return u * u * (3 - 2 * u); };
        const k12 = sm(13, 27, d.y), k23 = sm(50, 66, d.y), k34 = sm(84, 96, d.y) * 0.5;
        const ox = -(camX / WORLD_W) * W * 0.12, oy = -(Math.min(1, d.y / FLOOR)) * Hh * 0.12;
        const ks = [1, k12, k23, k34];
        let base = 0; for (let i = 1; i < 4; i++) if (ks[i] > 0.99) base = i;      // nothing under an opaque plate is drawn
        for (let i = base; i < 4; i++) if (i === base || ks[i] > 0.01) { g.globalAlpha = i === base ? 1 : ks[i]; g.drawImage(A.bands[i], ox, oy); }
        g.globalAlpha = 1;
        g.fillStyle = "rgba(6,12,24,.3)"; g.fillRect(0, 0, W, Hh);                 // the plate recedes; what can touch him is drawn over it, brighter
      } else for (let py = 0; py < Hh; py += 8) { g.fillStyle = bands(wyp(py)); g.fillRect(0, py, W, 8); }
      // above the surface
      if (sky > 0) { g.fillStyle = "#c9d6d2"; g.fillRect(0, 0, W, sky); }
      // engraved lines: white, thinning with depth
      g.strokeStyle = FOAM;
      for (let wy = 0; !plates && wy < FLOOR; wy += 1.6 + wy * 0.06) {
        const py = sy(wy); if (py < -4 || py > Hh + 4) continue;
        g.globalAlpha = Math.max(0.1, 0.26 - wy * 0.002); g.lineWidth = Math.max(0.3, 1 - wy * 0.009);
        g.beginPath();
        for (let px = 0; px <= W; px += 10) { const y = py + Math.sin(px * 0.02 + wy + t * 0.4) * (wy < 4 ? 3 : 1); px ? g.lineTo(px, y) : g.moveTo(px, y); }
        g.stroke();
      }
      g.globalAlpha = 1;
      // surface
      g.strokeStyle = FOAM; g.lineWidth = 1.6; g.beginPath();
      for (let px = 0; px <= W; px += 6) { const y = sky + Math.sin(px * 0.03 + t) * 3; px ? g.lineTo(px, y) : g.moveTo(px, y); } g.stroke();
      // light shafts in the bright band
      g.save(); g.globalAlpha = 0.06; g.fillStyle = FOAM;
      for (let i = 0; i < 5; i++) { const x0 = sx(15 + i * 30 + Math.sin(t * 0.2 + i) * 3); g.beginPath(); g.moveTo(x0, sky); g.lineTo(x0 + 30, sky); g.lineTo(x0 + 130, sy(55)); g.lineTo(x0 + 60, sy(55)); g.fill(); }
      g.restore();
      // motes (stipple)
      g.fillStyle = FOAM;
      for (const m of motes) { const px = sx(m.x), py = sy(m.y); if (px < 0 || px > W || py < 0 || py > Hh) continue; g.globalAlpha = 0.15 + m.s * 0.25 * Math.max(0.2, 1 - m.y / 90); g.fillRect(px, py, 1.2, 1.2); }
      g.globalAlpha = 1;
      // cold current band
      const cy0 = sy(cold.y0), cy1 = sy(cold.y1);
      g.strokeStyle = "#9fb8d6"; g.globalAlpha = 0.28; g.lineWidth = 1;
      for (let i = 0; i < 9; i++) { const y = cy0 + ((cy1 - cy0) * (i + 0.5)) / 9; g.setLineDash([10, 14]); g.lineDashOffset = (t * 2.2 * ppm) % 24; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.setLineDash([]); g.globalAlpha = 1;
      if (cy1 > 0 && cy0 < Hh) { g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.fillStyle = "#9fb8d6"; g.textAlign = "left"; g.fillText("← cold current", 14 + 34, cy0 + 16); }
      // pilings and the dredge
      g.strokeStyle = FOAM; g.globalAlpha = 0.5; g.lineWidth = 1;
      for (const px of stage === "teach" ? [70, 74, 88, 92] : []) { const x = sx(px); g.strokeRect(x - 0.8 * ppm, sy(-4), 1.6 * ppm, (34) * ppm); for (let y = 0; y < 34; y += 1.3) { g.beginPath(); g.moveTo(x - 0.6 * ppm, sy(y)); g.lineTo(x + 0.6 * ppm, sy(y + 0.6)); g.stroke(); } }
      g.globalAlpha = 1;
      g.strokeStyle = FOAM; g.lineWidth = 1.6;
      for (const ch of chains) {
        const n = ch.hook ? Math.round(Math.hypot(ch.hx - ch.ax, ch.hy + 2) / 4.6) : Math.round(ch.len / 4.6);
        for (let i = 0; i < n; i++) { const [ax, ay] = chainPos(ch, i / n), [bx, by] = chainPos(ch, (i + 1) / n); if (sy(by) < -20 || sy(ay) > Hh + 20) continue; g.beginPath(); g.ellipse(sx((ax + bx) / 2), sy((ay + by) / 2), 0.9 * ppm, 0.45 * ppm, Math.atan2(by - ay, bx - ax), 0, 7); g.stroke(); }
        const [hx, hy] = chainPos(ch, 1); g.beginPath(); g.moveTo(sx(hx), sy(hy)); g.lineTo(sx(hx) - ppm * 1.2, sy(hy) + ppm * 1.4); g.moveTo(sx(hx), sy(hy)); g.lineTo(sx(hx) + ppm * 1.2, sy(hy) + ppm * 1.4); g.stroke();
      }
      if (lead) { // the Company's sounding lead and its line
        const lx = sx(lead.x);
        g.strokeStyle = PAPER; g.globalAlpha = 0.75; g.lineWidth = 1; g.setLineDash(lead.wait > 0 ? [3, 6] : []); g.beginPath(); g.moveTo(lx, sy(Math.max(0, camY - Hh / ppm))); g.lineTo(lx, lead.wait > 0 ? Hh : sy(lead.y)); g.stroke(); g.setLineDash([]);
        if (lead.wait <= 0) { g.fillStyle = PAPER; g.beginPath(); g.moveTo(lx - 0.5 * ppm, sy(lead.y) - 1.6 * ppm); g.lineTo(lx + 0.5 * ppm, sy(lead.y) - 1.6 * ppm); g.lineTo(lx + 0.75 * ppm, sy(lead.y)); g.lineTo(lx - 0.75 * ppm, sy(lead.y)); g.fill(); }
        g.globalAlpha = 1;
      }
      // the net
      for (const n of nets) if (!n.cut) {
        g.strokeStyle = PAPER; g.globalAlpha = 0.5; g.lineWidth = 0.8;
        g.beginPath();
        for (let x = n.x0; x <= n.x1; x += 1.4) { g.moveTo(sx(x), sy(n.y0)); g.lineTo(sx(x + 2), sy(n.y1)); g.moveTo(sx(x + 2), sy(n.y0)); g.lineTo(sx(x), sy(n.y1)); }
        g.stroke(); g.globalAlpha = 0.8; if (n.old) g.setLineDash([7, 5]); g.strokeRect(sx(n.x0), sy(n.y0), (n.x1 - n.x0) * ppm, (n.y1 - n.y0) * ppm); g.setLineDash([]); g.globalAlpha = 1;
        if (n.old) { g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.fillStyle = PAPER; g.globalAlpha = 0.7; g.textAlign = "left"; g.fillText("an abandoned net", sx(n.x0) + 4, sy(n.y0) - 5); g.globalAlpha = 1; }
      }
      // floor
      g.fillStyle = "#05090f"; g.strokeStyle = FOAM; g.lineWidth = 1; g.beginPath(); g.moveTo(0, Hh);
      for (let px = 0; px <= W + 6; px += 6) g.lineTo(px, sy(floorAt(wxp(px))));
      g.lineTo(W, Hh); g.closePath(); g.fill(); g.globalAlpha = 0.4; g.stroke(); g.globalAlpha = 1;
      // the standing fleet (twist): eight hulls upright on the floor, a bell at each bow, a line above the flagship
      for (const h of hulls) {
        const hx = sx(h.x), fy = sy(floorAt(h.x)), wpx = 12.2 * ppm, hpx = wpx * 680 / 520;
        if (hx < -wpx || hx > W + wpx) continue;
        const im = A.hulls[h.i];
        if (im) { g.globalAlpha = h.show > 0 ? 1 : 0.78; g.drawImage(im, hx - wpx / 2, fy - hpx + 0.4 * ppm, wpx, hpx); g.globalAlpha = 1; }
        else { g.strokeStyle = FOAM; g.globalAlpha = 0.7; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx - 3.6 * ppm, fy - 9 * ppm); g.quadraticCurveTo(hx - 3 * ppm, fy - 1 * ppm, hx, fy); g.quadraticCurveTo(hx + 3 * ppm, fy - 1 * ppm, hx + 3.6 * ppm, fy - 9 * ppm); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(hx, fy - 9 * ppm); g.lineTo(hx, fy - 15.5 * ppm); g.stroke(); g.globalAlpha = 1; }
        if (h.show > 0) { // the ring draws her ribs
          g.strokeStyle = GOLD; g.globalAlpha = Math.min(1, h.show) * 0.8; g.lineWidth = 1;
          for (let k = 0; k < 7; k++) { const yy = fy - (1.2 + k * 1.15) * ppm, ww = (1.4 + k * 0.32) * ppm; g.beginPath(); g.moveTo(hx - ww, yy); g.quadraticCurveTo(hx, yy + 0.7 * ppm, hx + ww, yy); g.stroke(); }
          g.globalAlpha = 1;
        }
        const [bx, by] = bellAt(h), bsx = sx(bx), bsy = sy(by), sw = h.show > 0 ? Math.sin(t * 16) * 0.3 : 0;
        g.save(); g.translate(bsx, bsy - 0.9 * ppm); g.rotate(sw); g.strokeStyle = h.rung ? GOLD : PAPER; g.fillStyle = "#0b1424"; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(-0.7 * ppm, 1.3 * ppm); g.quadraticCurveTo(-0.6 * ppm, 0, 0, 0); g.quadraticCurveTo(0.6 * ppm, 0, 0.7 * ppm, 1.3 * ppm); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 1.5 * ppm, 0.16 * ppm, 0, 7); g.stroke(); g.restore();
        g.textAlign = "center";
        if (h.rung) { g.font = `${Math.max(12, ppm * 1.05)}px 'IM Fell English SC',Georgia,serif`; g.fillStyle = h.i === flagI ? GOLD : PAPER; g.fillText(h.name.toUpperCase(), hx, fy + 1.7 * ppm); }
        else { g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.fillStyle = PAPER; g.globalAlpha = 0.6; g.fillText("bell", bsx, bsy - 1.4 * ppm); g.globalAlpha = 1; }
        if (h.i === flagI && !d.carry && (h.show > 0 || Math.hypot(d.x - h.x, d.y - (floorAt(h.x) - 3)) < 9)) { // Ide's lamp, low in the ribs
          const ix = sx(h.x + 1.5), iy = sy(floorAt(h.x + 1.5) - 3);
          const gr = g.createRadialGradient(ix, iy, 0, ix, iy, 2.6 * ppm); gr.addColorStop(0, "rgba(231,169,59,.9)"); gr.addColorStop(1, "rgba(231,169,59,0)"); g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, 2.6 * ppm, 0, 7); g.fill();
          g.strokeStyle = PAPER; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); g.lineWidth = 1.2; g.beginPath(); g.arc(ix, iy, 3.2 * ppm, 0, 7); g.stroke(); g.globalAlpha = 1;
          if (d.free > 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(ix, iy, 4 * ppm, -Math.PI / 2, -Math.PI / 2 + (d.free / 2) * Math.PI * 2); g.stroke(); }
        }
      }
      if (fleet) { // her crew's line
        const lx = sx(lineX), rewritten = fate === "rewrite";
        if (rewritten) { const gr = g.createLinearGradient(lx - 3 * ppm, 0, lx + 3 * ppm, 0); gr.addColorStop(0, "rgba(231,169,59,0)"); gr.addColorStop(0.5, "rgba(231,169,59,.22)"); gr.addColorStop(1, "rgba(231,169,59,0)"); g.fillStyle = gr; g.fillRect(lx - 3 * ppm, 0, 6 * ppm, sy(FLOOR - 16)); }
        if (d.carry || rewritten) { g.strokeStyle = d.carry ? GOLD : PAPER; g.globalAlpha = 0.8; g.lineWidth = 1.4; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, sy(FLOOR - 16)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
          g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.fillStyle = GOLD; g.textAlign = "left"; g.fillText("her crew's line", lx + 8, Math.max(100, sy(104))); }
      }
      // the chit in the trench (test): it answers a stir's glow
      if (trench && !d.carry) {
        const cx2 = sx(chitX), cy2 = sy(chitY());
        if (A.chit) g.drawImage(A.chit, cx2 - 1.7 * ppm, cy2 - 1.1 * ppm, 3.4 * ppm, 2.2 * ppm); else { g.fillStyle = PAPER; g.fillRect(cx2 - ppm, cy2 - 0.6 * ppm, 2 * ppm, 1.2 * ppm); }
        if (d.free > 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(cx2, cy2, 3 * ppm, -Math.PI / 2, -Math.PI / 2 + (d.free / 1.5) * Math.PI * 2); g.stroke(); }
      }
      // the sunken tender
      const tx = sx(WRECK_X), ty = sy(WRECK_Y);
      if (stage !== "teach") { /* no tender here */ } else {
      g.save(); g.translate(tx, ty); g.rotate(-0.18); g.strokeStyle = FOAM; g.lineWidth = 1.2; g.globalAlpha = 0.85;
      g.beginPath(); g.moveTo(-10 * ppm, -1 * ppm); g.quadraticCurveTo(-8 * ppm, 5 * ppm, 0, 5.5 * ppm); g.quadraticCurveTo(9 * ppm, 5 * ppm, 11 * ppm, -2 * ppm); g.stroke();
      for (let i = -9; i < 10; i += 1.2) { g.beginPath(); g.moveTo(i * ppm, -0.5 * ppm); g.lineTo(i * ppm + 0.4 * ppm, 4.6 * ppm - Math.abs(i) * 0.25 * ppm); g.lineWidth = 0.5; g.stroke(); }
      g.lineWidth = 1.4; g.beginPath(); g.moveTo(2 * ppm, 0); g.lineTo(5 * ppm, -9 * ppm); g.stroke();
      g.restore();
      if (!d.carry) {
        const bx = sx(WRECK_X), by = sy(WRECK_Y + 2);
        g.strokeStyle = PAPER; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); g.lineWidth = 1.2; g.beginPath(); g.arc(bx, by, 3.2 * ppm, 0, 7); g.stroke(); g.globalAlpha = 1;
        if (A.box) g.drawImage(A.box, bx - 1.5 * ppm, by - 1.3 * ppm, 3 * ppm, 2.25 * ppm);
        else { g.fillStyle = GOLD; g.strokeStyle = PLATE; g.fillRect(bx - 0.9 * ppm, by - 0.6 * ppm, 1.8 * ppm, 1.2 * ppm); g.strokeRect(bx - 0.9 * ppm, by - 0.6 * ppm, 1.8 * ppm, 1.2 * ppm); }
        if (d.free > 0) { g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 4 * ppm, -Math.PI / 2, -Math.PI / 2 + (d.free / FREE_S) * Math.PI * 2); g.stroke(); }
      } else if (d.y > 4) {
        g.strokeStyle = PAPER; g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); g.lineWidth = 1.2; g.beginPath(); g.ellipse(sx(d.x), sy(0.5), 6 * ppm, 1.4 * ppm, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      }
      }
      // specimens: the light the deep has
      for (const sp of specimens) {
        const px = sx(sp.x + Math.sin(t * 0.3 + sp.ph) * 1.5), py = sy(sp.y + Math.cos(t * 0.25 + sp.ph) * 1); if (px < -60 || px > W + 60 || py < -60 || py > Hh + 60) continue;
        const sa = A.spec.length ? A.spec[(sp.fig - 1) % A.spec.length] : null;
        if (sa) { const z = sp.r * ppm * 5.4; g.globalAlpha = sp.y > 18 ? 1 : 0.7; g.drawImage(sa, px - z / 2, py - z / 2, z, z); g.globalAlpha = 1; }
        else radiolarian(px, py, sp.r * ppm, sp.c, sp.spines, sp.ph + t * 0.1, sp.y > 18);
        g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.fillStyle = sp.c; g.globalAlpha = 0.6; g.textAlign = "left"; g.fillText("Fig. " + sp.fig, px + sp.r * ppm * 2, py + sp.r * ppm * 2); g.globalAlpha = 1;
      }
      // stirred currents glow
      for (const c of currents) {
        const al = Math.min(1, (c.life - c.age) / 1.5);
        const x0 = sx(c.x), y0 = sy(c.y), x1 = sx(c.x + c.dx * c.len), y1 = sy(c.y + c.dy * c.len);
        g.save(); g.globalAlpha = 0.85 * al; g.strokeStyle = "#7FE0C2"; g.shadowColor = "#7FE0C2"; g.shadowBlur = 14; g.lineWidth = 3;
        const nx = -c.dy * ppm * 1.2, ny = c.dx * ppm * 1.2;
        for (const o of [-1, 0, 1]) { g.beginPath(); g.moveTo(x0 + nx * o, y0 + ny * o); g.bezierCurveTo((x0 * 2 + x1) / 3 + nx * (o + 0.6), (y0 * 2 + y1) / 3 + ny * (o + 0.6), (x0 + x1 * 2) / 3 + nx * (o - 0.6), (y0 + y1 * 2) / 3 + ny * (o - 0.6), x1 + nx * o, y1 + ny * o); g.lineWidth = o ? 1.2 : 3; g.stroke(); }
        g.fillStyle = "#7FE0C2"; g.beginPath(); g.moveTo(x1 + c.dx * 10, y1 + c.dy * 10); g.lineTo(x1 - c.dy * 6, y1 + c.dx * 6); g.lineTo(x1 + c.dy * 6, y1 - c.dx * 6); g.fill();
        g.restore();
      }
      drawDiver();
      // darkness: visibility shrinks with depth, and the pull closes the edges
      const vis = Math.max(110, Math.min(W, Hh) * (0.9 - Math.min(0.55, d.y / 140)));
      const pullK = 1 - d.pull / PULL;
      const gr = g.createRadialGradient(sx(d.x), sy(d.y), vis * (0.5 - pullK * 0.35), sx(d.x), sy(d.y), vis * (1.3 - pullK * 0.75) + 20);
      gr.addColorStop(0, "rgba(3,6,12,0)"); gr.addColorStop(1, `rgba(3,6,12,${(0.4 + pullK * 0.6).toFixed(2)})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      if (trench && d.y > 52) { // the dark of the trench: an arm's length, or a stir's eight metres
        const k = Math.min(1, (d.y - 52) / 10), rad = (glow > 0 ? 8 + Math.min(1, glow) * 1 : 3.4) * ppm;
        const dk = g.createRadialGradient(sx(d.x), sy(d.y), rad * 0.72, sx(d.x), sy(d.y), rad * 1.25);
        dk.addColorStop(0, "rgba(2,4,9,0)"); dk.addColorStop(1, `rgba(2,4,9,${(0.97 * k).toFixed(2)})`);
        g.fillStyle = dk; g.fillRect(0, 0, W, Hh);
        if (glow > 0 && !d.carry) { // the chit's salt bloom shines back from up to 25 m
          const dist = Math.hypot(chitX - d.x, chitY() - d.y);
          if (dist < 25) { const cx2 = sx(chitX), cy2 = sy(chitY()); g.strokeStyle = PAPER; g.globalAlpha = Math.min(1, glow) * 0.9; g.lineWidth = 1.6; g.beginPath(); g.arc(cx2, cy2, 3.2 * ppm, 0, 7); g.stroke(); g.fillStyle = PAPER; g.beginPath(); g.arc(cx2, cy2, 0.35 * ppm, 0, 7); g.fill(); g.globalAlpha = 1; }
          else { g.font = "italic 14px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.fillStyle = PAPER; g.globalAlpha = Math.min(1, glow) * 0.8; g.fillText("nothing shines back within twenty-five metres", sx(d.x), sy(d.y) + rad + 18); g.globalAlpha = 1; }
        }
      }
      // stir spiral
      if (stir.on && stir.pts.length > 2 && Math.abs(stir.angle) > 0.8) {
        g.strokeStyle = "#7FE0C2"; g.globalAlpha = 0.7; g.lineWidth = 1.4; g.beginPath(); stir.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.globalAlpha = 1;
      }
      if (stir.key) { g.strokeStyle = "#7FE0C2"; g.lineWidth = 2; g.beginPath(); g.arc(sx(d.x), sy(d.y), 26, -Math.PI / 2, -Math.PI / 2 + Math.min(1, stir.keyT / 0.6) * Math.PI * 2); g.stroke(); }
      // margins: depth gauge, plate caption, pull
      const gx = 22, g0 = 40, g1 = Hh - 50;
      g.strokeStyle = FOAM; g.globalAlpha = 0.8; g.lineWidth = 1; g.beginPath(); g.moveTo(gx, g0); g.lineTo(gx, g1); g.stroke();
      g.font = "12px 'IM Fell English',Georgia,serif"; g.fillStyle = FOAM; g.textAlign = "left";
      for (let m = 0; m <= GMAX; m += GMAX / 5) { const y = g0 + ((g1 - g0) * m) / GMAX; g.beginPath(); g.moveTo(gx - 4, y); g.lineTo(gx + 4, y); g.stroke(); g.fillText(m + " m", gx + 7, y + 3); }
      const yy = g0 + ((g1 - g0) * Math.min(GMAX, d.y)) / GMAX; g.fillStyle = GOLD; g.beginPath(); g.moveTo(gx - 2, yy); g.lineTo(gx - 12, yy - 6); g.lineTo(gx - 12, yy + 6); g.fill();
      const yw = g0 + ((g1 - g0) * (trench ? (d.carry ? 60 : chitY()) : fleet ? (d.carry ? 102 : FLOOR - 3) : WRECK_Y)) / GMAX; g.strokeStyle = PAPER; g.beginPath(); g.arc(gx, yw, 4, 0, 7); g.stroke();
      g.globalAlpha = 1;
      { const bw = Math.min(W - 70, 290); g.fillStyle = "rgba(11,20,36,.84)"; g.fillRect(W - 16 - bw - 8, 8, bw + 16, 76); g.strokeStyle = FOAM; g.globalAlpha = 0.35; g.strokeRect(W - 16 - bw - 7.5, 8.5, bw + 15, 75); g.globalAlpha = 1; }
      g.font = "14px 'IM Fell English SC',Georgia,serif"; g.fillStyle = FOAM; g.textAlign = "right";
      g.fillText(`PLATE ${trench ? "V" : fleet ? "VI" : "IV"}. THE DEEP · ${Math.round(d.y)} m`, W - 16, 26);
      g.font = "italic 15px 'IM Fell English',Georgia,serif";
      g.fillText(d.net ? "Grip and swim to tear the net" : trench ? (d.carry ? "Up to sixty metres, where the light begins" : glow > 0 ? `Lit: ${glow.toFixed(1)} s · the chains are coming` : "Stir for light; the chit shines back") : fleet ? (d.carry ? "Up her crew's line, above the flagship" : `Bells read: ${named.length} of 8 · find the Halcyon`)
        : d.carry ? "Carry it up to the light" : d.free > 0 ? `Working it free… ${Math.min(FREE_S, d.free).toFixed(1)} / ${FREE_S} s` : "Down to the pale ring", W - 16, 45);
      // the pull: a ruled gauge under the caption, and the closing line along the top
      g.fillStyle = pullK > 0.75 ? RED : FOAM; g.globalAlpha = 0.8; g.fillRect(0, 0, W * (d.pull / PULL), 4); g.globalAlpha = 1;
      if (fleet) { const pw = Math.min(260, W - 90), px0 = W - 16 - pw, py0 = 66, ak = air / AIR, low = d.carry && ak < 0.4;
        g.font = "13px 'IM Fell English SC',Georgia,serif"; g.textAlign = "left"; g.fillStyle = low ? "#e7a0a0" : FOAM; g.fillText(d.carry ? "HER AIR" : "THE PULL HAS STOPPED", px0, py0 - 4);
        if (d.carry) { g.textAlign = "right"; g.fillText(`${Math.ceil(air)} s`, W - 16, py0 - 4); g.strokeStyle = FOAM; g.globalAlpha = 0.8; g.strokeRect(px0 + 0.5, py0 + 0.5, pw, 9); g.globalAlpha = 1; g.fillStyle = low ? RED : GOLD; g.fillRect(px0 + 2, py0 + 2, (pw - 3) * Math.max(0, ak), 6); }
        else { g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.fillStyle = FOAM; g.globalAlpha = 0.75; g.fillText("no clock runs until she is in his arms", px0, py0 + 10); g.globalAlpha = 1; }
      } else
      { const pw = Math.min(260, W - 90), px0 = W - 16 - pw, py0 = 66;
        g.font = "13px 'IM Fell English SC',Georgia,serif"; g.textAlign = "left"; g.fillStyle = pullK > 0.65 ? "#e7a0a0" : FOAM; g.fillText("THE PULL", px0, py0 - 4);
        g.textAlign = "right"; g.fillText(`${Math.ceil(d.pull)} s`, W - 16, py0 - 4);
        g.strokeStyle = FOAM; g.globalAlpha = 0.8; g.strokeRect(px0 + 0.5, py0 + 0.5, pw, 9); g.globalAlpha = 1;
        g.fillStyle = pullK > 0.65 ? RED : "#7FE0C2"; g.fillRect(px0 + 2, py0 + 2, (pw - 3) * (d.pull / PULL), 6);
        if (pullK > 0.65 && !reduce) { g.globalAlpha = 0.25 + 0.25 * Math.sin(t * 6); g.strokeStyle = RED; g.lineWidth = 10; g.strokeRect(0, 0, W, Hh); g.globalAlpha = 1; g.lineWidth = 1; } }
      for (const r of rings) { if (reduce) break; g.strokeStyle = "#7FE0C2"; g.globalAlpha = 1 - r.age; g.lineWidth = 1.4; g.beginPath(); g.arc(sx(r.x), sy(r.y), 8 + r.age * 50, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (flashT > 0) { g.strokeStyle = flashCol; g.globalAlpha = Math.min(1, flashT) * 0.6; g.lineWidth = reduce ? 6 : 16; g.strokeRect(0, 0, W, Hh); g.globalAlpha = 1; g.lineWidth = 1; }
      if (kickBtn) { const cd = kickBtn.firstElementChild; if (cd) cd.style.width = (d.cool > 0 ? (1 - d.cool / 2) * 100 : 100) + "%"; }
      if (d.msgT > 0) { g.font = `italic ${Math.max(16, Math.min(22, W / 45))}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.fillStyle = FOAM; g.globalAlpha = Math.min(1, d.msgT); g.fillText(d.msg, W / 2, Math.max(70, Hh * 0.16)); g.globalAlpha = 1; }
      g.strokeStyle = FOAM; g.globalAlpha = 0.35; g.strokeRect(5.5, 5.5, W - 11, Hh - 11); g.globalAlpha = 1;
    }

    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) step(dt); else if (!reduce && !over) t += dt * 0.5;
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const b = how.querySelector("button");
    let unnote = null;
    b.addEventListener("click", () => {
      how.remove(); running = true; last = performance.now();
      caption(trench ? "Down, past the bank. Keep moving: the lead drops where you were." : fleet ? "The hulls stand in a row to the right. Stir a current through a bell to read her name." : "Down. The pale ring far below marks the tender.", false, 5);
      const why = stage === "teach" && fate === "strike" ? "Because you struck the harbour dues in The Charter, the Company's gear hangs abandoned here: two old nets across the way down."
        : fleet && backplot ? "Because your back-plot in Dead Reckoning was good, the dive starts above her: the flagship is the hull below you."
        : fleet && fate === "rewrite" ? "Because you had the harbour dues rewritten in The Charter, the lights stay: a beam marks her crew's line from the start." : "";
      if (why) unnote = note(wrap, why);
    });
    b.focus();
    return {
      unmount() {
        cancelAnimationFrame(raf); ro.disconnect(); dead = true; clearTimeout(prepTimer); closeBox(); if (unnote) unnote();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        running = false;
      },
    };
  },
};

// The Lord of the Sea: The Engraved Sea (2D, copperplate engraving).
// One sequence cut from DESIGN.md section 10, after `e-spice-chase` (chapter 4): run 1.2 nm to the
// Spice Mouth with a revenue cutter behind. The verb is the stir: draw circles on the sea (or hold
// E / Q) to raise a crest at the reticle (one circle Ripple, one more per tier, up to Squall here) or
// to flatten one. Four circles lay fog, which breaks a cutter's sight. Surf the faces you raise, put
// crests under the cutter, stand the tide over the reef (a crest raised on it stays there).
// Broadside to a face steeper than 35 degrees for 1.5 s: capsize, back to the last buoy. A grapnel
// held 4 s: caught, and the run ends. Once a sequence the crew can be called to sing (section 12,
// "Song surge"): for twelve seconds every stir counts one tier higher. Lighthouse beams raise notice;
// at 50 a second cutter puts out. The coast strip shows the moorings lift as each crest rolls on.
// Narrative beats (opening, captions, the Voice Beside) are written for the game; see the
// refine pass's additions list.
// Phase 1 (accepted 2026-11-15): the account rendered. When the run ends, win or caught, the Tide Reckoning sheet
// for the Spice Mouth is written line by line from what the run did (crests that rolled on to the coast, notice,
// the pay lighter if six or more reached the moorings), and it comes back countersigned: a green tick and a T.
// Turn it over and the Lord of Tea's own account shows, "The Sea, Dr."; strike his tick out, or let it stand.
// Art pass: the boat, the cutter, the coast strip with its moored skiffs, the sky and the rose ring are the game's
// art, each rasterised once at the size it is drawn (api.art); the sea itself stays the module's own burin lines.
import { pic, raster, endCard, chapterStrip } from "./_art.js";
import { ladder, note, flag, gainChit } from "./_ladder.js";

const INK = "#1F2E4A", PAPER = "#F4F1E8", RED = "#8C2B2B", GOLD = "#E7A93B", GREEN = "#2F6B5E", BROWN = "#6B4A2B";
let LENGTH = 2200;              // metres to the port (about 1.2 nm); set by the stage
const NM = 1852;
const V = 1.6;                  // drawn vertical exaggeration; steepness is read from the drawing
const STEEP = Math.tan((35 * Math.PI) / 180);
const TIERS = [
  { name: "Ripple", h: 0.5, sigma: 6 },
  { name: "Swell", h: 1.5, sigma: 5.5 },
  { name: "Current", h: 2.5, sigma: 5 },
  { name: "Fog", fog: true },
  { name: "Squall", h: 4, sigma: 4.5 },
];
let MAX_TIER = TIERS.length - 1;
let ROCKS = [700, 1520];       // the reef: needs 0.6 m of water over it to pass
let BUOYS = [0, 450, 900, 1350, 1800];
let LIGHT_X = 1150;
const SONG_S = 12;

// Beats: where on the run, the line, and whether the Voice Beside speaks it (sea-ink green italic).
const BEATS_TEST = [
  { at: 140, text: "The reef runs a hand under the water a cable ahead. Stir on it, clockwise, and the tide stands over it." },
  { at: 220, text: "The Gullwife crew are aboard. Once this run, call them to sing (Sing, or C): for twelve seconds every stir runs one tier higher.", unlock: "sing" },
  { at: 400, voice: true, text: "The water rose where he asked it. Along the shore the moorings lifted, and no one on the quay knew why." },
  { at: 500, text: "The Strait light swings ahead. Its beam is the Company's eye: lay fog with four circles, or keep out of it.", unlock: "fog" },
  { at: 745, text: "The second reef, and past it the Spice Mouth, where the dock-singers sing for no one yet." },
  { at: 1020, voice: true, text: "Behind us the sea kept every crest he had raised, and carried them toward the land." },
];

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder. Teach is `e-cutter-heave-to`: a ripple and a
// convoy's lee. Test is the Spice Mouth run above, where the sea now answers back (every crest returns off the
// coast, the cutter pours oil, a crest under a buoy rings it and turns the cutter). Twist is The Glass, in
// `e-blockade-run`: a sleeping fleet, the king's oarsmen humming, and the stir turned over (raise nothing).
const BEATS_TEACH = [
  { at: 40, text: "The Company lane, flat as a plate. Draw one circle just astern: a Ripple is all the water gives here, and it is enough to ride." },
  { at: 120, text: "Tuck in under the convoy ship's stern. In her lee the cutter cannot pick one small sail out of the line." },
  { at: 300, text: "The ship ahead hauls her wind and turns out of line. The next is a hundred metres on: ripple after ripple, and get under her." },
  { at: 470, voice: true, text: "It used to come when he called. Now it came the way a cat does: a little, and when it pleased." },
];
const BEATS_TWIST = [
  { at: 30, text: "The blockade lies asleep at anchor. Still the water, counter-clockwise: every ripple you put down is a hull that does not stir." },
  { at: 160, text: "Forward, the king's oarsmen hum the hymn under their breath. Every bar raises a ripple off the bow. Put each one down." },
  { at: 300, voice: true, text: "He had spent a lifetime making it move. Nobody had ever asked him to make it lie still." },
  { at: 450, text: "The last hulls, and the sea-gate beyond them. Spill wind as you pass: a wash wakes a watch as surely as a wave." },
];
const STAGES = {
  teach: { length: 640, rocks: [], buoys: [0, 320], light: -9999, maxTier: 0, beats: BEATS_TEACH, port: "THE ANCHORAGE", swell: 0.45 },
  test: { length: 1150, rocks: [380, 800], buoys: [0, 230, 460, 690, 920], light: 600, maxTier: TIERS.length - 1, beats: BEATS_TEST, port: "SPICE MOUTH", swell: 1 },
  twist: { length: 600, rocks: [], buoys: [0, 200, 400], light: -9999, maxTier: 1, beats: BEATS_TWIST, port: "THE SEA-GATE", swell: 0.4 },
};
const FLEET = [120, 240, 360, 470, 550];   // The Glass: where the sleeping hulls lie
const LADDER = {
  title: "The Engraved Sea", kicker: "2D · COPPERPLATE · THREE PLATES",
  stages: {
    teach: { name: "The Lee", where: "Chapter II, the Company lane: only a ripple, and a convoy to hide behind.", line: "A cutter you cannot fight, and a convoy to hide in." },
    test: { name: "The Sea Answers Back", where: "Chapter IV, off the Spice Mouth: every crest you raise comes back.", line: "The chase off the Spice Mouth, where the sea answers back." },
    twist: { name: "The Glass", where: "Chapter V, the blockade: iron the sea flat and ghost through a sleeping fleet.", line: "The blockade, asleep at anchor. Raise nothing." },
  },
};

export default { mount(root, api) { return ladder(root, api, LADDER, (r, a) => game.mount(r, a)); } };

const game = {
  mount(root, api) {
    const P = "lord-of-the-sea-engraved-sea-";
    const stage = api.stage || "test", C = STAGES[stage];
    const teach = stage === "teach", glass = stage === "twist";
    LENGTH = C.length; ROCKS = C.rocks; BUOYS = C.buoys; LIGHT_X = C.light; MAX_TIER = C.maxTier;
    const BEATS = C.beats;
    // layer links (api.shared): a crew won at dice is a call here; a charter's fate redraws the plate
    const fate = flag(api, "charter.tidewater", "");
    const lampBlack = teach && fate === "strike", litLane = teach && fate === "rewrite";
    const kettle = stage === "test" && !!flag(api, "crew.kettle"), wenna = stage === "test" && !!flag(api, "crew.wenna");
    const reduce = api.reducedMotion;
    const losses = +api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    root.innerHTML = `
    <style>
      .${P}wrap { position:absolute; inset:0; background:${PAPER}; color:${INK}; font-family:'IM Fell English',Georgia,serif; overflow:hidden; touch-action:none; user-select:none; }
      .${P}wrap canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
      .${P}pad { position:absolute; left:0; right:0; bottom:0; display:flex; gap:6px; justify-content:center; flex-wrap:wrap; padding:8px 10px 10px; pointer-events:none; }
      .${P}pad button { pointer-events:auto; font:inherit; font-size:16px; color:${INK}; background:rgba(244,241,232,.94); border:1.5px solid ${INK}; padding:8px 12px; min-width:60px; cursor:pointer; touch-action:none; }
      .${P}pad button:hover { background:#e9e3d2; }
      .${P}pad button.on { background:${INK}; color:${PAPER}; }
      .${P}pad button.sing { border-color:${GREEN}; color:${GREEN}; font-style:italic; }
      .${P}pad button.sing.on { background:${GREEN}; color:${PAPER}; }
      .${P}pad button[hidden] { display:none; }
      .${P}pad button:disabled { opacity:.4; cursor:default; }
      .${P}cap { position:absolute; left:50%; top:24%; transform:translateX(-50%); width:min(620px,calc(100% - 32px)); box-sizing:border-box; text-align:center;
        background:${PAPER}; border:1px solid ${INK}; outline:1px solid ${INK}; outline-offset:3px; padding:8px 14px; font-size:16px; line-height:1.35; pointer-events:none;
        opacity:0; transition:opacity .5s; }
      .${P}cap.show { opacity:1; }
      .${P}cap.voice { font-style:italic; color:${GREEN}; border-color:${GREEN}; outline-color:${GREEN}; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(244,241,232,.84); padding:14px; z-index:3; overflow:auto; }
      .${P}plate { position:relative; max-width:560px; box-sizing:border-box; background:${PAPER}; border:1.5px solid ${INK}; outline:5px double ${INK}; outline-offset:5px; padding:18px 22px 16px; margin:10px; }
      .${P}plate::before { content:""; position:absolute; inset:6px; border:1px solid ${INK}; opacity:.5; pointer-events:none;
        background: repeating-linear-gradient(135deg, transparent 0 5px, rgba(31,46,74,.08) 5px 6px) top left/60px 60px no-repeat, repeating-linear-gradient(135deg, transparent 0 5px, rgba(31,46,74,.08) 5px 6px) bottom right/60px 60px no-repeat; }
      .${P}kick { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.2em; font-size:13px; color:${RED}; text-align:center; }
      .${P}plate h2 { font-weight:400; font-size:clamp(26px,5vw,34px); margin:2px 0 6px; text-align:center; letter-spacing:.01em; }
      .${P}goal { font-size:17px; line-height:1.35; margin:0 0 8px; text-align:center; }
      .${P}open { font-style:italic; font-size:15px; line-height:1.4; margin:0 0 10px; color:#3b4660; text-align:center; }
      .${P}key { width:100%; border-collapse:collapse; font-size:15px; margin:0 0 10px; }
      .${P}key td { padding:5px 4px; border-top:1px solid rgba(31,46,74,.35); vertical-align:top; }
      .${P}key td:first-child { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.08em; white-space:nowrap; width:1%; padding-right:10px; color:${RED}; }
      .${P}key kbd { font-family:inherit; border:1px solid ${INK}; padding:0 4px; font-size:14px; white-space:nowrap; }
      .${P}gentle { font-size:15px; color:${GREEN}; margin:0 0 8px; text-align:center; font-style:italic; }
      .${P}plate button { display:block; margin:4px auto 0; font:inherit; font-size:18px; padding:8px 26px; background:${INK}; color:${PAPER}; border:0; cursor:pointer; }
      .${P}plate button:hover, .${P}plate button:focus-visible { background:${RED}; }
      .${P}figs { display:flex; gap:6px; justify-content:center; margin:0 0 8px; }
      .${P}figs img { width:31%; max-width:150px; height:auto; border:1px solid rgba(31,46,74,.4); }
      .${P}key td img { display:block; width:34px; height:34px; margin:0 auto 2px; border-radius:50%; }
      .${P}acct { position:absolute; inset:0; z-index:4; display:grid; place-items:center; background:rgba(31,46,74,.82); padding:12px; overflow:auto; }
      .${P}sheet { position:relative; max-width:600px; width:100%; box-sizing:border-box; background:#fbfaf3; color:${INK}; border:1px solid ${INK}; padding:16px 22px 16px; box-shadow:0 12px 34px rgba(0,0,0,.5);
        background-image:linear-gradient(rgba(31,46,74,.10) 1px, transparent 1px); background-size:100% 26px; background-position:0 62px; }
      .${P}sheet h2 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.2em; font-size:clamp(20px,4.6vw,26px); margin:0; text-align:center; }
      .${P}sheet .sub { text-align:center; font-style:italic; font-size:15px; margin:0 0 4px; color:${BROWN}; }
      .${P}sheet .rule { display:block; width:100%; height:auto; margin:0 0 6px; }
      .${P}sheet table { width:100%; border-collapse:collapse; font-size:16px; line-height:26px; }
      .${P}sheet td { padding:0 4px; vertical-align:top; }
      .${P}sheet td:last-child { text-align:right; white-space:nowrap; font-family:'IM Fell English SC',Georgia,serif; color:${RED}; }
      .${P}sheet tr { opacity:0; transition:opacity .5s; }
      .${P}sheet tr.in { opacity:1; }
      .${P}sheet .toll { display:grid; grid-template-columns:120px minmax(0,1fr); gap:12px; align-items:center; margin:8px 0 0; padding:8px; background:#fbfaf3; border:1px solid ${RED}; font-size:15px; line-height:1.35; opacity:0; transition:opacity .5s; }
      .${P}sheet .toll.in { opacity:1; }
      .${P}sheet .toll img { width:120px; height:auto; display:block; }
      .${P}sheet .seal { display:block; width:min(100%,300px); height:auto; margin:4px 0 0 auto; }
      .${P}sheet .cs { display:block; margin:8px 0 0 auto; width:min(40%,170px); opacity:0; transform:scale(1.5) rotate(-8deg); transition:opacity .25s, transform .25s; pointer-events:none; }
      .${P}sheet .cs.in { opacity:.92; transform:none; }
      .${P}sheet .cs img { width:100%; height:auto; display:block; }
      .${P}sheet .cs .fb { border:2px solid #2E7A46; color:#2E7A46; padding:6px 10px; font-size:22px; text-align:center; background:#fbfaf3; }
      .${P}sheet .after { margin-top:10px; padding-top:8px; border-top:1px solid ${INK}; background:#fbfaf3; display:grid; gap:8px; font-size:16px; line-height:1.4; position:relative; }
      .${P}sheet .after p { margin:0; } .${P}sheet .after p.v { font-style:italic; color:${GREEN}; }
      .${P}sheet .after img.book { width:100%; height:auto; display:block; border:1px solid ${INK}; }
      .${P}sheet .btns { display:flex; flex-wrap:wrap; gap:8px; }
      .${P}sheet button { font:inherit; font-size:16px; padding:6px 16px; background:${INK}; color:${PAPER}; border:1px solid ${INK}; cursor:pointer; }
      .${P}sheet button.alt { background:#fbfaf3; color:${INK}; }
      .${P}sheet button:hover, .${P}sheet button:focus-visible { background:${RED}; color:${PAPER}; }
      @media (prefers-reduced-motion: reduce) { .${P}sheet tr, .${P}sheet .toll, .${P}sheet .cs { transition:none; } }
      @media (max-width:520px) { .${P}plate { padding:14px 14px 12px; } .${P}sheet { padding:12px 12px; } .${P}sheet table { font-size:15px; } .${P}sheet .toll { grid-template-columns:88px minmax(0,1fr); } .${P}sheet .toll img { width:88px; } .${P}key td:first-child { white-space:normal; } .${P}cap { top:30%; font-size:15px; } }
    </style>
    <div class="${P}wrap">
      <canvas aria-label="The Engraved Sea: a side-on engraved sea with your boat, the reef and a revenue cutter"></canvas>
      <div class="${P}cap" aria-live="polite"></div>
      <div class="${P}pad" aria-label="Sail controls">
        <button type="button" data-k="trimDown" aria-label="Spill wind (A)">Spill</button>
        <button type="button" data-k="trimUp" aria-label="Full sail (D)">Full</button>
        <button type="button" data-k="climb" aria-label="Helm: climb the face (W)">Climb</button>
        <button type="button" data-k="run" aria-label="Helm: run the trough (S)">Run</button>
        <button type="button" class="sing" data-sing="1" hidden aria-label="Call the crew to sing (C)">Sing</button>
        <button type="button" class="sing" data-kettle="1" hidden aria-label="Call the Kettle crew: the reef stands covered (K)">Kettle</button>
      </div>
      <div class="${P}how" role="dialog" aria-label="How to play">
        <div class="${P}plate">
          ${chapterStrip(api.art, teach ? 3 : glass ? 6 : 5, teach ? "Chapter III: The Ordered Sea" : glass ? "Chapter VI: Debts and Halls" : "Chapter V: The Open Chart")}
          <div class="${P}kick">${teach ? "PLATE I · CHAPTER II · THE COMPANY LANE" : glass ? "PLATE III · CHAPTER V · THE BLOCKADE" : "PLATE II · CHAPTER IV · OFF THE SPICE MOUTH"}</div>
          <h2>${teach ? "The Lee" : glass ? "The Glass" : "The Sea Answers Back"}</h2>
          <p class="${P}goal">${teach ? "Reach the anchorage, a third of a mile on. You cannot fight the cutter here: hide in the convoy's lee."
            : glass ? "Ghost through the sleeping fleet to the sea-gate. If the fleet's wake reaches 100, the watch is up and the run is over."
            : "Reach the Spice Mouth, six cables on, before a revenue cutter's grapnel holds you four seconds."}</p>
          <p class="${P}open">${teach ? "Ordered water answers him with a ripple and nothing more. A revenue cutter has put out astern, faster than he can ever sail; ahead, a Company convoy keeps its stations."
            : glass ? "The king's payment is aboard, and a blockade lies at anchor across the halls. Here every crest is a shout. The oarsmen hum the hymn under their breath, and even that raises the water."
            : "The Company has had word of a boat that makes its own weather. Alexi has the tiller, a following sea, and a cutter two cables astern. Out here the sea answers back."}</p>
          ${gentle ? `<p class="${P}gentle">${glass ? "A gentler watch: the oarsmen hum slower this time." : "A gentler sea: the cutter starts further back this time."}</p>` : ""}
          ${api.art.has("boat-surf") ? `<div class="${P}figs">${pic(api.art, "boat-surf", "The boat, surfing a face")}${pic(api.art, "cutter", "A revenue cutter")}${pic(api.art, "boat-capsized", "The boat, capsized")}</div>` : ""}
          <table class="${P}key">
            ${glass ? `<tr><td>${pic(api.art, "stir-spiral-counter", "")}Still</td><td>Draw a <b>counter-clockwise</b> circle on a ripple, or hold <kbd>Q</kbd> with the reticle on it (<kbd>&larr;</kbd><kbd>&rarr;</kbd>). This is the whole of the run.</td></tr>
            <tr><td>${pic(api.art, "stir-spiral-clockwise", "")}Raise</td><td>Don't. A crest raised among sleeping hulls wakes them: +35.</td></tr>
            <tr><td>Sail</td><td><b>Spill</b> wind (<kbd>A</kbd>) to creep past a hull: full sail within 20 m of one throws a wash. <b>Full</b> (<kbd>D</kbd>) between them.</td></tr>`
            : teach ? `<tr><td>${pic(api.art, "stir-spiral-clockwise", "")}Ripple</td><td>Draw a clockwise circle just astern, or hold <kbd>E</kbd>. One Ripple; ride its face for a third more speed.</td></tr>
            <tr><td>The lee</td><td>Close under a convoy ship's stern (the dotted bracket). She tows you at her pace and the cutter loses you.</td></tr>
            <tr><td>Sail</td><td><kbd>A</kbd>/<kbd>D</kbd> or <b>Spill</b>/<b>Full</b> trim the sail; <kbd>&larr;</kbd><kbd>&rarr;</kbd> move the reticle. Spill to drop out of a lee.</td></tr>`
            : `<tr><td>${pic(api.art, "stir-spiral-clockwise", "")}Raise</td><td>Draw a clockwise circle on the sea, or hold <kbd>E</kbd>. More circles, a bigger crest. Each crest comes back off the coast twenty seconds on, from ahead, at half height.</td></tr>
            <tr><td>${pic(api.art, "stir-spiral-counter", "")}Still</td><td>A counter-clockwise circle, or hold <kbd>Q</kbd>, flattens the sea there. Oiled water will not be stirred at all.</td></tr>
            <tr><td>Helm</td><td><b>Climb</b> a rising face, <b>Run</b> a falling one (<kbd>W</kbd>/<kbd>S</kbd>), or go over. <kbd>A</kbd>/<kbd>D</kbd> trim; <kbd>&larr;</kbd><kbd>&rarr;</kbd> move the reticle. A crest under a buoy rings its bell: the cutter turns for it.</td></tr>`}
          </table>
          <button type="button">${glass ? "Cast off, quietly" : "Make sail"}</button>
        </div>
      </div>
    </div>`;
    const wrap = root.querySelector("." + P + "wrap");
    const cv = wrap.querySelector("canvas");
    const g = cv.getContext("2d");
    const how = wrap.querySelector("." + P + "how");
    const capEl = wrap.querySelector("." + P + "cap");
    const singBtn = wrap.querySelector("[data-sing]");
    const rng = api.rng("engraved-sea");
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };

    // ---- world state ----
    const base = [
      { a: 0.38 * C.swell, L: 47, c: 6.5, p: rng() * 6 },
      { a: 0.24 * C.swell, L: 23, c: 4.5, p: rng() * 6 },
      { a: 0.14 * C.swell, L: 12, c: 3.2, p: rng() * 6 },
      { a: 0.1 * C.swell, L: 71, c: 9, p: rng() * 6 },
    ];
    // teach: the convoy. test: what the sea sends back. twist: the sleeping fleet and the hum.
    const convoy = teach ? [{ x: 55, v: 6.2 }, { x: 155, v: 6.2 }, { x: 255, v: 6.2 }, { x: 355, v: 6.2 }] : [];
    let returns = [], oils = [], rung = new Set(), oilCool = 12, ferryHits = 0, bellsRung = 0, returned = 0;
    const HUM_S = gentle ? 8.5 : 6.5;
    let humT = 3, hums = 0, stilled = 0;
    const ferryAt = (tt) => (tt % 34) > 22;          // Wenna's ferry is mid-harbour for twelve seconds in every thirty-four
    const kettleBtn = wrap.querySelector("[data-kettle]");
    let t = 0, running = false, over = false;
    const s = {
      x: 0, v: 7, trim: 0.8, helm: 0, broad: 0, capsized: 0, checkpoint: 0,
      notice: 30, msg: "", msgT: 0, caught: 0, best: 0, song: 0, sung: false, sent: 0, capsizes: 0, broaches: 0,
      flash: 0, flashCol: RED, shake: 0, unlocked: { sing: false, fog: false }, beat: 0,
    };
    let crests = [], fogs = [], calms = [], cutters = [], sprays = [], rings = [];
    const startGap = teach ? (gentle ? 150 : 82) : gentle ? 220 : 130;
    function resetCutters() { cutters = glass ? [] : [{ x: s.x - startGap, v: 8, stall: 0, grap: 0 }]; if (s.second) cutters.push({ x: s.x - startGap - 70, v: 8, stall: 0, grap: 0 }); }
    s.wake = 0; s.lee = false; s.kettle = false;
    resetCutters();

    function baseH(x) {
      let h = 0;
      for (const w of base) h += w.a * Math.sin(((x - w.c * t) / w.L) * Math.PI * 2 + w.p);
      for (const c of calms) { const d = Math.abs(x - c.x); if (d < c.r) h *= 0.25 + 0.75 * (d / c.r); }
      return h;
    }
    function H(x) {
      let h = baseH(x);
      for (const c of crests) { const d = x - c.x; h += c.h * Math.exp(-(d * d) / (2 * c.sigma * c.sigma)); }
      return h;
    }
    const slope = (x) => ((H(x + 0.5) - H(x - 0.5)) / 1) * V; // drawn slope, rising ahead positive
    const inFog = (x) => fogs.some((f) => Math.abs(x - f.x) < f.w / 2);

    function say(m, sec = 2.4) { s.msg = m; s.msgT = sec; }
    let capTimer = 0;
    function caption(text, voice, sec = 6) {
      capEl.textContent = text;
      capEl.classList.toggle("voice", !!voice);
      capEl.classList.add("show");
      capTimer = sec;
    }
    function flash(col, k = 1) { s.flash = k; s.flashCol = col; if (!reduce) s.shake = 0.35 * k; }

    // ---- stirring ----
    const stir = { on: false, angle: 0, pts: [], cx: 0, cy: 0, last: null, worldX: 0, key: 0 };
    let reticleOff = teach ? -7 : glass ? 24 : -14; // keyboard reticle, metres from the boat
    const tierFor = (circles) => Math.min(MAX_TIER, circles - 1 + (s.song > 0 ? 1 : 0));
    function applyStir(worldX, angle) {
      const circles = Math.floor(Math.abs(angle) / (Math.PI * 2) + 0.14);   // a circle drawn a little short still counts
      if (circles < 1) { if (Math.abs(angle) > 1) say("Not a full circle: the water does not answer.", 1.6); return; }
      worldX = Math.max(s.x - 40, Math.min(s.x + 40, worldX));
      const oil = oils.find((o) => Math.abs(worldX - o.x) < o.w / 2);
      if (oil) { say(`Oil on the water: it will not answer for ${Math.ceil(oil.life)} s.`, 2); flash(BROWN, 0.4); return; }
      if (angle > 0 && glass) {
        s.wake = Math.min(100, s.wake + 35); crests.push({ x: worldX, h: 0.9, h0: 0.9, sigma: 6, age: 0, life: 6, v: 0 });
        rings.push({ x: worldX, age: 0, col: RED }); flash(RED, 0.7);
        say("A crest, here? The nearest hull turns over in its sleep.", 2.6); return;
      }
      if (angle > 0) {
        const tier = tierFor(circles), T = TIERS[tier];
        if (T.fog) { fogs.push({ x: worldX, w: 80, life: 16, age: 0 }); say("Fog. The cutter loses you in it."); if (!s.unlocked.fog) { s.unlocked.fog = true; } }
        else {
          const reef = ROCKS.find((r) => Math.abs(r - worldX) < 14);
          if (reef != null) { crests.push({ x: reef, h: T.h, h0: T.h, sigma: T.sigma + 2, age: 0, life: 12, v: 0 }); say(T.name + " over the reef: the tide stands on it a while"); }
          else { crests.push({ x: worldX, h: T.h, h0: T.h, sigma: T.sigma, age: 0, life: 15, v: 9 }); say(T.name + " raised" + (tier === MAX_TIER && !teach ? ": mind your own sea" : teach ? ": ride its face" : "")); }
          if (tier >= 1) { s.sent++; if (wenna && ferryAt(t)) { ferryHits++; say("Raised with the ferry mid-harbour: she ships it green.", 2.6); }
            if (stage === "test" && reef == null) returns.push({ at: t + 20, h: T.h / 2, sigma: T.sigma }); }
        }
        for (let i = 0; i < 14; i++) sprays.push({ x: worldX + (rng() - 0.5) * 10, y: 0, vx: (rng() - 0.5) * 4, vy: 3 + rng() * 4, life: 1 });
        rings.push({ x: worldX, age: 0, col: T.fog ? INK : GREEN });
      } else {
        const before = crests.length;
        crests = crests.filter((c) => Math.abs(c.x - worldX) > 18);
        if (glass && before > crests.length) { stilled += before - crests.length; }
        calms.push({ x: worldX, r: 22, life: 7 });
        rings.push({ x: worldX, age: 0, col: INK });
        say("Stilled");
      }
    }
    function sing() {
      if (!running || s.sung || !s.unlocked.sing) return;
      s.sung = true; s.song = SONG_S; singBtn.disabled = true; singBtn.classList.add("on");
      caption("The Gullwife crew sing, off-key and loud. For a while the sea answers more than he asks.", false, 5);
      flash(GREEN, 0.6);
    }

    // ---- input ----
    const keys = {};
    const held = { trimUp: false, trimDown: false, climb: false, run: false };
    const onKey = (e, down) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "q", "e", "c", "arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(k)) e.preventDefault();
      if (!running) return;
      if ((k === "e" || k === "q") && down && !keys[k]) { stir.on = true; stir.key = k === "e" ? 1 : -1; stir.angle = 0; stir.pts = []; }
      if ((k === "e" || k === "q") && !down && stir.key) { applyStir(s.x + reticleOff, stir.angle); stir.on = false; stir.key = 0; }
      if (k === "c" && down) sing();
      if (k === "k" && down) callKettle();
      keys[k] = down;
    };
    const kd = (e) => onKey(e, true), ku = (e) => onKey(e, false);
    addEventListener("keydown", kd); addEventListener("keyup", ku);

    let W = 0, Hh = 0, dpr = 1, ppm = 8, boatSX = 0, seaY = 0;
    const toWorldX = (px) => s.x + (px - boatSX) / ppm;
    let hoverPx = null;
    function ptr(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    const pd = (e) => {
      if (!running) return;
      const [px, py] = ptr(e);
      if (py < Hh * 0.2) return;
      cv.setPointerCapture?.(e.pointerId);
      stir.on = true; stir.key = 0; stir.angle = 0; stir.pts = [[px, py]]; stir.cx = px; stir.cy = py; stir.last = null;
      stir.worldX = toWorldX(px);
      e.preventDefault();
    };
    const pm = (e) => {
      const [px, py] = ptr(e);
      hoverPx = px;
      if (!stir.on || stir.key) return;
      stir.pts.push([px, py]);
      if (stir.pts.length > 120) stir.pts.shift();
      const n = stir.pts.length;
      stir.cx += (px - stir.cx) / Math.min(n, 30); stir.cy += (py - stir.cy) / Math.min(n, 30);
      const dx = px - stir.cx, dy = py - stir.cy;
      if (dx * dx + dy * dy < 64) return;
      const a = Math.atan2(dy, dx);
      if (stir.last != null) { let d = a - stir.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; stir.angle += d; }
      stir.last = a;
    };
    const pu = () => { if (stir.on && !stir.key) { applyStir(stir.worldX, stir.angle); stir.on = false; } };
    const noMenu = (e) => e.preventDefault();
    cv.addEventListener("pointerdown", pd); cv.addEventListener("pointermove", pm);
    cv.addEventListener("pointerup", pu); cv.addEventListener("pointercancel", pu);
    cv.addEventListener("contextmenu", noMenu);
    const btns = [...wrap.querySelectorAll("." + P + "pad button[data-k]")];
    const bdn = (e) => { const k = e.currentTarget.dataset.k; held[k] = true; e.currentTarget.classList.add("on"); e.preventDefault(); };
    const bup = (e) => { const k = e.currentTarget.dataset.k; held[k] = false; e.currentTarget.classList.remove("on"); };
    for (const b of btns) { b.addEventListener("pointerdown", bdn); b.addEventListener("pointerup", bup); b.addEventListener("pointerleave", bup); b.addEventListener("pointercancel", bup); }
    singBtn.addEventListener("click", sing);
    function callKettle() {
      if (!running || !kettle || s.kettle) return;
      s.kettle = true; kettleBtn.disabled = true; kettleBtn.classList.add("on");
      caption("The Kettle crew strike up from the reef, badly and all together. The tide stands over both reefs and stays there.", false, 6); flash(GREEN, 0.6);
    }
    kettleBtn.addEventListener("click", callKettle);

    function resize() {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = wrap.clientWidth; Hh = wrap.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      ppm = Math.max(4.2, Math.min(11, W / 120));
      boatSX = W * 0.36;
      seaY = Hh * 0.56;
    }
    // art, rasterised once at the size it is drawn; rebuilt when the plate is resized
    const art = api.art;
    const A = { key: "" };
    let prepTimer = 0, dead = false;
    // the plate's sky is 1512 x 208; take the part of it with the plate's own proportions, keeping the sun in view
    const skySrc = (aspect) => (aspect >= 1512 / 208 ? [44, 122 + (208 - 1512 / aspect) / 2, 1512, 1512 / aspect] : [Math.max(44, Math.min(44 + 1512 - 208 * aspect, 250 - 208 * aspect * 0.3)), 122, 208 * aspect, 208]);
    async function prep() {
      if (dead || !W || !Hh) return;
      const key = W + "x" + Hh;
      if (A.key === key) return;
      A.key = key;
      const k = ppm / 8, top = Hh * 0.09, bandH = Hh * 0.17 - top - 6, skyH = Hh * 0.56 + 4 - (Hh * 0.17 + 2);
      const got = {
        boat: await raster(art, "sprite-boat-full", 92 * k * dpr, 95 * k * dpr),
        spill: await raster(art, "sprite-boat-spill", 92 * k * dpr, 95 * k * dpr),
        cutter: await raster(art, "sprite-cutter", 138 * k * dpr, 109 * k * dpr),
        rose: await raster(art, "rose-ring", 84 * dpr, 84 * dpr, { round: true }),
        coast: await raster(art, teach ? "coast-lanes" : glass ? "coast-halls" : "coast-spice", bandH * (1556 / 168) * dpr, bandH * dpr, { src: [22, 16, 1556, 168] }),
        sky: await raster(art, "sea-plate", (W - 20) * dpr, skyH * dpr, { src: skySrc((W - 20) / skyH) }),
        skiff: await raster(art, "sprite-skiff", bandH * 0.62 * (150 / 140) * dpr, bandH * 0.62 * dpr),
        ferry: await raster(art, "sprite-ferry", bandH * 0.5 * (260 / 110) * dpr, bandH * 0.5 * dpr),
      };
      if (dead || A.key !== key) return;
      Object.assign(A, got, { k, bandH });
    }
    const ro = new ResizeObserver(() => { resize(); clearTimeout(prepTimer); prepTimer = setTimeout(prep, A.key ? 260 : 0); }); ro.observe(wrap); resize(); prep();

    // ---- simulation ----
    function capsize(why) {
      s.capsized = 1.6; s.broad = 0; s.capsizes++;
      const cp = BUOYS.filter((b) => b <= s.x - 5).pop() || 0;
      say(why + " Back to the buoy.", 2.6);
      flash(RED, 1);
      s.pendingCp = cp;
    }
    function beats() {
      while (s.beat < BEATS.length && s.x >= BEATS[s.beat].at) {
        const b = BEATS[s.beat++];
        caption(b.text, b.voice, b.unlock ? 8 : 6);
        if (b.unlock === "sing") { s.unlocked.sing = true; singBtn.hidden = false; }
        if (b.unlock === "fog") s.unlocked.fog = true;
      }
    }
    function step(dt) {
      t += dt;
      if (s.msgT > 0) s.msgT -= dt;
      if (capTimer > 0) { capTimer -= dt; if (capTimer <= 0) capEl.classList.remove("show"); }
      if (s.flash > 0) s.flash = Math.max(0, s.flash - dt * 1.6);
      if (s.shake > 0) s.shake = Math.max(0, s.shake - dt);
      if (s.song > 0) { s.song -= dt; if (s.song <= 0) { singBtn.classList.remove("on"); say("The song ends. The sea goes back to its own size.", 2.4); } }
      crests.forEach((c) => { c.age += dt; c.x += c.v * dt; c.h = c.h0 * Math.max(0, 1 - (c.age / c.life) ** 2); });
      crests = crests.filter((c) => c.age < c.life);
      fogs.forEach((f) => { f.age += dt; f.x += 2.5 * dt; }); fogs = fogs.filter((f) => f.age < f.life);
      calms.forEach((c) => (c.life -= dt)); calms = calms.filter((c) => c.life > 0);
      sprays.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 9 * dt; p.life -= dt * 0.9; }); sprays = sprays.filter((p) => p.life > 0);
      rings.forEach((r) => (r.age += dt)); rings = rings.filter((r) => r.age < 1);
      if (stir.on && stir.key) stir.angle += stir.key * (Math.PI * 2 / 0.55) * dt;
      if (keys["arrowleft"]) reticleOff = Math.max(-40, reticleOff - 30 * dt);
      if (keys["arrowright"]) reticleOff = Math.min(40, reticleOff + 30 * dt);

      if (s.capsized > 0) {
        s.capsized -= dt;
        if (s.capsized <= 0) { s.x = s.pendingCp; s.v = 5; crests = []; fogs = []; returns = []; resetCutters(); }
        return;
      }
      beats();
      // ---- the ladder's own weather ----
      if (teach) {
        for (const c of convoy) { c.x += c.v * dt; if (c.gone) c.v = Math.max(2.5, c.v - dt * 1.5); }
        if (s.x >= 300 && !s.hauled) { s.hauled = true; const c = convoy.find((q) => !q.gone && s.x > q.x - 60 && s.x < q.x + 10) || convoy[0]; c.gone = true; }
      }
      if (stage === "test") {
        for (const r of returns) if (!r.warned && t > r.at - 3) { r.warned = true; say("A swell is coming back off the coast, from ahead.", 2.6); }
        for (const r of returns.filter((q) => t >= q.at)) { crests.push({ x: s.x + 75, h: r.h, h0: r.h, sigma: r.sigma + 1, age: 0, life: 15, v: -8, back: true }); returned++; }
        returns = returns.filter((q) => t < q.at);
        if (returned === 1 && !s.saidReturn) { s.saidReturn = true; caption("The first crest he raised has been to the coast and back. It comes in over the bow at half its height: climb it, or still it.", false, 6); }
        oilCool -= dt;
        for (const c of cutters) if (oilCool <= 0 && s.x - c.x < 75 && s.x - c.x > 20 && c.stall <= 0 && s.x > 270) {
          oilCool = 26; oils.push({ x: (c.x + s.x) / 2 + 6, w: 64, life: 10 });
          caption("The cutter pours lamp oil over her bow. For ten seconds that patch of sea will not be stirred, up or down.", false, 5); flash(BROWN, 0.5);
        }
        oils.forEach((o) => (o.life -= dt)); oils = oils.filter((o) => o.life > 0);
        for (const b of BUOYS.slice(1)) if (!rung.has(b) && crests.some((c) => !c.back && c.h >= 1 && Math.abs(c.x - b) < 5)) {
          rung.add(b); bellsRung++;
          for (const c of cutters) if (c.x < b + 30) { c.stall = Math.max(c.stall, 4); c.belled = true; }
          rings.push({ x: b, age: 0, col: GOLD });
          caption("A crest under the buoy rings its bell off the beat. Every cutter turns for the bell. Once per buoy.", false, 5); flash(GOLD, 0.5);
        }
      }
      if (glass) {
        humT -= dt;
        if (humT <= 0 && s.x < LENGTH - 60) { humT = HUM_S; hums++; crests.push({ x: s.x + 24, h: 0.7, h0: 0.7, sigma: 5, age: 0, life: 40, v: 0, hum: true }); if (!reduce) rings.push({ x: s.x + 24, age: 0, col: GREEN }); }
        const live = crests.filter((c) => c.hum && c.h > 0.15).length;
        const near = FLEET.find((f) => Math.abs(f - s.x) < 20);
        const wash = near != null && s.v > 6.2;
        if (live) s.wake = Math.min(100, s.wake + live * 8 * dt);
        else if (!wash) s.wake = Math.max(0, s.wake - 2.2 * dt);
        if (wash) { s.wake = Math.min(100, s.wake + 11 * dt); if (!s.washMsg || t - s.washMsg > 4) { s.washMsg = t; say("Full sail past a hull: her cable creaks. Spill wind.", 2); } }
        if (s.wake >= 100) { finish(false); return; }
      }
      // sail
      if (keys["d"] || held.trimUp) s.trim = Math.min(1, s.trim + 0.6 * dt);
      if (keys["a"] || held.trimDown) s.trim = Math.max(0.3, s.trim - 0.6 * dt);
      s.helm = (keys["w"] || keys["arrowup"] || held.climb) ? 1 : (keys["s"] || keys["arrowdown"] || held.run) ? -1 : 0;
      const sl = slope(s.x);
      let target = 8.2 * s.trim;
      if (sl < 0) target *= 1 + Math.min(0.6, -sl * (s.helm === -1 ? 1.6 : 1.1) * (teach ? 3.2 : 1));          // surf
      const lee = teach ? convoy.find((c) => !c.gone && s.x > c.x - 30 && s.x < c.x + 6) : null;
      s.lee = !!lee && s.trim >= 0.5;
      if (s.lee) target = lee.v + (lee.x - 13 - s.x) * 0.35;                                // towed in her lee
      if (s.lee && !s.leeSaid) { s.leeSaid = true; say("In her lee. The cutter has lost you.", 2.6); flash(GREEN, 0.4); }
      else target *= 1 - Math.min(0.55, sl * (s.helm === 1 ? 0.45 : 0.9));                 // climb
      s.v += (target - s.v) * Math.min(1, dt * 1.8);
      s.x += s.v * dt;
      // broadside
      const steep = Math.abs(sl) > STEEP;
      const matched = (sl > 0 && s.helm === 1) || (sl < 0 && s.helm === -1);
      if (steep && !matched) { s.broad += dt; if (s.broad > 1.5) { capsize("Broadside to the face: over she goes."); return; } }
      else s.broad = Math.max(0, s.broad - dt * 2);
      // reef
      for (const r of ROCKS) {
        if (s.x > r - 2 && s.x < r + 2 && H(r) < 0.6 && !s.rockHit && !s.kettle) { s.rockHit = r; capsize("Struck the reef: not enough water over it."); return; }
      }
      if (s.rockHit && Math.abs(s.x - s.rockHit) > 10) s.rockHit = 0;
      // lighthouse beam
      const beamOn = (t % 7) < 3.2;
      if (beamOn && Math.abs(s.x - LIGHT_X) < 70 && !inFog(s.x)) {
        s.notice = Math.min(100, s.notice + 2 * dt);
      }
      if (s.notice >= 50 && !s.second) {
        s.second = true; cutters.push({ x: s.x - 180, v: 7, stall: 0, grap: 0 });
        caption("Notice 50. A second cutter puts out from under the light.", false, 5); flash(RED, 0.5);
      }
      // cutters
      let grapMax = 0;
      for (const c of cutters) {
        const csl = slope(c.x);
        if (c.stall > 0) c.stall -= dt;
        else if (Math.abs(csl) > STEEP) { c.stall = 2.5; s.broaches++; say("The cutter broaches on your crest."); rings.push({ x: c.x, age: 0, col: GREEN }); }
        const blind = inFog(c.x) || inFog(s.x) || s.lee;
        let cv2 = teach ? 11.6 : 9.3;
        if (csl > 0) cv2 *= 1 - Math.min(0.6, csl * 1.2);
        if (blind) cv2 *= 0.55;
        if (c.stall > 0) cv2 = 1.5;
        c.v += (cv2 - c.v) * Math.min(1, dt * 1.5);
        c.x += c.v * dt;
        if (c.x > s.x - 4) c.x = s.x - 4;
        const gap = s.x - c.x;
        if (gap < 25 && !blind && c.stall <= 0) c.grap += dt; else c.grap = Math.max(0, c.grap - dt * 1.5);
        grapMax = Math.max(grapMax, c.grap);
      }
      if (grapMax > 0 && s.grap === 0) flash(RED, 0.5);
      s.grap = grapMax;
      if (grapMax >= 4) { finish(false); return; }
      if (s.x >= LENGTH) finish(true);
    }
    const mmss = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    function finishStage(won) { // teach and twist end without a reckoning sheet
      const time = mmss(Math.round(t));
      if (teach) {
        if (won) { endCard(root, art, "convoy", "THE COMPANY LANE · IN THE CONVOY'S LEE"); api.end({ outcome: "win", text: `Into the anchorage in ${time}, one small sail among the Company's, and the cutter still hunting the empty lane astern. He raised nothing bigger than a ripple, because nothing bigger would come. Notice ${Math.round(s.notice)}.` }); }
        else { endCard(root, art, "cutter", "HEAVE TO"); api.end({ outcome: "lose", text: "The grapnel bites and holds. In ordered water there is no crest to put under her bow: the only place the cutter cannot see is under a convoy ship's stern. Caught, notice +10." }); }
      } else if (won) { setGlass(); const fresh = gainChit(api, 7); endCard(root, art, art.has("chit-7-mirror-gallery") ? "chit-7-mirror-gallery" : "sea-plate", "THE GALLERY OF GLASS · CHIT No. 7"); api.end({ outcome: "win", text: `Through the blockade in ${time}, on water he ironed flat with his own hands: ${stilled} ripple${stilled === 1 ? "" : "s"} put down, the fleet's wake at ${Math.round(s.wake)} of 100. The king's payment reaches the sea-gate, and the oarsmen finish the hymn out loud on the far side. Up through the gallery of mirrors he cannot stop, and he hits her again, as on the beach: a second paper falls out of her sleeve between them. The writ, Alexi principal debtor, her father's house surety. Beside it on the glass lies chit No. 7, “a shipmate's word”, readable only in the mirror. She picks up the writ and goes.${fresh ? " The seventh of eight." : ""}` }); }
      else { endCard(root, art, "cutter", "THE WATCH IS UP"); api.end({ outcome: "lose", text: `A lantern is unhooded on the nearest hull, then another, down the whole line. The fleet is awake ${((LENGTH - s.x) / NM).toFixed(2)} nm short of the sea-gate, and the payment is delayed. Still every ripple the oarsmen raise, raise none of your own, and spill wind past each hull.` }); }
    }
    function setGlass() { try { api.shared.set("glass.run", true); } catch { /* no storage */ } }

    function finish(won) {
      if (over) return;
      over = true; running = false;
      api.store.set("losses", won ? 0 : losses + 1);
      if (stage !== "test") { later(() => finishStage(won), reduce ? 100 : 700); return; }
      const secs = Math.round(t);
      const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      const sent = s.sent ? ` ${s.sent} crest${s.sent === 1 ? "" : "s"} rolled on to the moorings along the coast; the Tide Reckoning will count ${s.sent === 1 ? "it" : "them"}.` : " He raised almost nothing on the way, and the coast barely felt him pass.";
      const result = won ? { outcome: "win", text: `Into the Spice Mouth in ${time}, the cutter still beating up behind.${sent} Notice ${Math.round(s.notice)}.` }
        : { outcome: "lose", text: `The grapnel bites and holds: the cutter has him ${((LENGTH - s.x) / NM).toFixed(2)} nm short of the Spice Mouth. Caught, notice +10. Next time put a crest under her bow, or lay fog between you.` };
      later(() => account(won, result), reduce ? 100 : 900);
    }

    // ---- the account rendered: the Tide Reckoning sheet, countersigned ----
    let acct = null;
    function account(won, result) {
      if (dead) return;
      const wreck = s.sent >= 6;
      const notice = Math.round(Math.min(100, s.notice + (won ? 0 : 10)));
      const rows = [
        ["Crests raised that rolled on to the coast", String(s.sent)],
        ["Moorings lifted at the Spice Mouth", s.sent ? `${s.sent * 3} boats` : "none"],
        ["Revenue cutters broached on a crest", String(s.broaches)],
        ["The boat capsized, and righted", String(s.capsizes)],
        ["Crests that came back off the coast", String(returned)],
        ["Buoy bells rung off the beat", String(bellsRung)],
        ...(wenna ? [["Raised with the ferry mid-harbour", ferryHits ? `${ferryHits}: she shipped water` : "none: timed round her"]] : []),
        [won ? "Made the Spice Mouth" : "Taken by the cutter: a fine entered", won ? "arrived" : "notice +10"],
        ["Notice", `${notice} of 100`],
      ];
      acct = document.createElement("div");
      acct.className = P + "acct"; acct.setAttribute("role", "dialog"); acct.setAttribute("aria-label", "Tide Reckoning: the account rendered");
      acct.innerHTML = `<div class="${P}sheet">
        <h2>TIDE RECKONING</h2><p class="sub">The Spice Mouth: what this run adds to its line</p>
        ${pic(art, "rule-order", "", `class="rule"`)}
        <table>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</table>
        ${pic(art, "notice-seal", "The Company's seal darkens with notice: pale at 0, red at 30 and 50, black at 70", `class="seal"`)}
        <div class="toll">${wreck ? (pic(art, "toll-wreck-lighter", "The pay lighter, adrift") || "<span></span>") + `<span><b>Wreck.</b> The pay lighter, loaded with the week's pay: lifted off her mooring by the sixth crest and lost on the bar. No one was aboard. The dock is not paid this week.</span>`
          : `<span style="grid-column:1/-1"><b>The toll.</b> No wreck, and no one lost. ${s.sent ? `The moorings held, this time: six crests would have had the pay lighter.` : `He raised almost nothing, and the coast barely felt him pass.`}</span>`}</div>
        <div class="cs" aria-hidden="true">${pic(art, "countersign", "") || `<div class="fb">✓ T.</div>`}</div>
        <div class="after" hidden></div>
      </div>`;
      wrap.appendChild(acct);
      const els = [...acct.querySelectorAll("tr"), acct.querySelector(".toll")];
      const after = acct.querySelector(".after"), cs = acct.querySelector(".cs");
      const step = reduce ? 0 : 480;
      els.forEach((el, i) => later(() => el.classList.add("in"), 200 + i * step));
      const show = (stage, pick) => {
        after.hidden = false;
        if (stage === 0) after.innerHTML = `<p>The sheet is his own count, in his own hand. It comes back before the ink is dry, and it has been somewhere first: in the corner, in green, a tick and a <b>T</b>.</p>
          <div class="btns"><button type="button" data-k="turn">Turn the sheet over</button></div>`;
        if (stage === 1) after.innerHTML = `${pic(art, "wreck-book-account", "A ledger spread headed ‘The Sea, Dr.’ on the left and ‘Cr.’ on the right", `class="book"`)}
          <p>On the back, a copy of a ledger page in a small exact hand, headed <i>The Sea, Dr.</i> Every line of this sheet is already entered there. <i>“Examined and entered. T.”</i></p>
          <p class="v">Someone had been keeping our score, and keeping it better than we did.</p>
          <div class="btns"><button type="button" data-k="strike">Strike his tick out</button><button type="button" class="alt" data-k="stand">Let it stand</button></div>`;
        if (stage === 2) after.innerHTML = `<p>${pick === "strike" ? "He draws one line through the tick. Under it, already, in the same green: <i>“Noted.”</i>" : "He lets it stand. It is, as far as he can tell, correct, and that is the worst of it."}</p>
          <p>From the first Tide Reckoning on, every sheet comes back countersigned. The Lord of Tea is keeping the account.</p>
          <div class="btns"><button type="button" data-k="close">Close the account</button></div>`;
        after.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
          const k = b.dataset.k;
          if (k === "turn") show(1); else if (k === "strike" || k === "stand") show(2, k);
          else { acct.remove(); acct = null; endCard(root, art, "tide-reckoning-sheet", "TIDE RECKONING · EXAMINED AND ENTERED"); api.end({ ...result, text: result.text + " The reckoning came back countersigned: the Lord of Tea is keeping the account." }); }
        }));
        after.querySelector("button").focus();
        after.scrollIntoView?.({ block: "nearest" });
      };
      later(() => { cs.classList.add("in"); if (!reduce) flash(GREEN, 0.4); }, 400 + els.length * step);
      later(() => show(0), 900 + els.length * step);
    }

    // ---- drawing ----
    const wx = (x) => boatSX + (x - s.x) * ppm;
    const wy = (h) => seaY - h * ppm * V;
    function hatch(x0, y0, x1, y1, gap, ang, alpha) {
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
      g.strokeStyle = INK; g.globalAlpha = alpha; g.lineWidth = 0.6; g.beginPath();
      const d = (x1 - x0) + (y1 - y0);
      for (let k = -d; k < d; k += gap) { g.moveTo(x0 + k, y0); g.lineTo(x0 + k + (y1 - y0) * Math.tan(ang), y1); }
      g.stroke(); g.restore();
    }
    function drawBoat(x, cutter, alpha = 1) {
      const sx = wx(x), h = H(x), sy = wy(h), a = Math.atan(-slope(x) / 1) * 0.9;
      const k = ppm / 8;
      const im = cutter ? A.cutter : s.trim < 0.5 ? A.spill || A.boat : A.boat;
      if (im && A.k === k) { // the game's vessels, set on the module's own sea
        g.save(); g.globalAlpha = alpha; g.translate(sx, sy); g.rotate(a);
        if (cutter) g.drawImage(im, -138 * k * (176 / 380), -109 * k * (268 / 300), 138 * k, 109 * k);
        else {
          g.drawImage(im, -92 * k * 0.5, -95 * k * (276 / 310), 92 * k, 95 * k);
          if (s.song > 0) { g.scale(k, k); g.fillStyle = GREEN; g.strokeStyle = GREEN; g.lineWidth = 1;
            for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1, nx = -14 + i * 10, ny = -22 - ph * 44; g.globalAlpha = alpha * (1 - ph); g.beginPath(); g.ellipse(nx, ny, 2.6, 2, -0.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(nx + 2.4, ny); g.lineTo(nx + 2.4, ny - 9); g.stroke(); } }
        }
        g.restore();
        return;
      }
      g.save(); g.globalAlpha = alpha; g.translate(sx, sy); g.rotate(a); g.scale(k, k);
      g.lineWidth = 1.4; g.strokeStyle = INK; g.fillStyle = PAPER;
      if (!cutter) {
        g.beginPath(); g.moveTo(-26, -6); g.quadraticCurveTo(-22, 6, 0, 7); g.quadraticCurveTo(22, 6, 30, -8); g.closePath(); g.fill(); g.stroke();
        for (let i = -20; i < 26; i += 4) { g.beginPath(); g.moveTo(i, -5); g.lineTo(i + 3, 5); g.lineWidth = 0.5; g.stroke(); }
        g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -62); g.stroke();
        g.beginPath(); g.moveTo(2, -60); g.quadraticCurveTo(14 + s.trim * 10, -34, 2, -10); g.closePath(); g.fill(); g.lineWidth = 1.2; g.stroke();
        g.beginPath(); g.moveTo(-2, -56); g.quadraticCurveTo(-16 - s.trim * 6, -30, -24, -10); g.lineTo(-2, -10); g.closePath(); g.fill(); g.stroke();
        g.lineWidth = 0.4; for (let i = -54; i < -12; i += 3) { g.beginPath(); g.moveTo(3, i); g.lineTo(6 + s.trim * 7 * Math.sin(((i + 60) / 50) * Math.PI), i); g.stroke(); }
        g.fillStyle = s.song > 0 ? GREEN : GOLD; g.beginPath(); g.moveTo(0, -62); g.lineTo(9, -59); g.lineTo(0, -56); g.fill();
        if (s.song > 0) { // the crew singing: little engraved notes rising from the deck
          g.fillStyle = GREEN; g.strokeStyle = GREEN; g.lineWidth = 1;
          for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1, nx = -14 + i * 10, ny = -14 - ph * 40; g.globalAlpha = alpha * (1 - ph); g.beginPath(); g.ellipse(nx, ny, 2.6, 2, -0.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(nx + 2.4, ny); g.lineTo(nx + 2.4, ny - 9); g.stroke(); }
          g.globalAlpha = alpha;
        }
      } else {
        g.beginPath(); g.moveTo(-40, -8); g.lineTo(-36, 8); g.quadraticCurveTo(0, 12, 34, 8); g.lineTo(44, -10); g.closePath(); g.fillStyle = INK; g.fill();
        g.strokeStyle = PAPER; g.lineWidth = 0.6; for (let i = -30; i < 34; i += 8) { g.strokeRect(i, -4, 3, 3); }
        g.strokeStyle = INK; g.lineWidth = 1.6;
        for (const m of [-14, 12]) { g.beginPath(); g.moveTo(m, -8); g.lineTo(m, -78); g.stroke(); }
        g.fillStyle = PAPER; g.lineWidth = 1;
        for (const m of [-14, 12]) for (let j = 0; j < 3; j++) { const y = -72 + j * 20; g.beginPath(); g.moveTo(m - 13 + j, y); g.lineTo(m + 13 - j, y); g.lineTo(m + 15 - j, y + 16); g.lineTo(m - 15 + j, y + 16); g.closePath(); g.fill(); g.stroke(); }
        g.fillStyle = RED; g.beginPath(); g.moveTo(12, -78); g.lineTo(28, -74); g.lineTo(12, -70); g.fill();
        g.beginPath(); g.moveTo(44, -10); g.lineTo(62, -24); g.stroke();
      }
      g.restore();
    }
    // an engraved gauge: label, ruled bar, a value; `k` 0..1 filled, `warn` turns it red
    function gauge(x, y, w, label, k, txt, col) {
      g.font = "13px 'IM Fell English SC',Georgia,serif"; g.textAlign = "left"; g.fillStyle = INK;
      g.fillText(label, x, y - 4);
      g.fillStyle = PAPER; g.fillRect(x, y, w, 10); g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w, 10);
      g.save(); g.beginPath(); g.rect(x + 1, y + 1, (w - 1) * Math.max(0, Math.min(1, k)), 9); g.clip();
      g.fillStyle = col; g.fillRect(x, y, w, 10);
      g.strokeStyle = PAPER; g.globalAlpha = 0.5; g.lineWidth = 1; g.beginPath(); for (let i = -10; i < w; i += 4) { g.moveTo(x + i, y + 11); g.lineTo(x + i + 10, y); } g.stroke();
      g.restore();
      g.font = "14px 'IM Fell English',Georgia,serif"; g.fillStyle = col === PAPER ? INK : col; g.textAlign = "left";
      g.fillText(txt, x + w + 8, y + 10);
    }

    function draw() {
      g.save();
      if (s.shake > 0) g.translate((Math.random() - 0.5) * 10 * s.shake, (Math.random() - 0.5) * 6 * s.shake);
      g.fillStyle = PAPER; g.fillRect(-10, -10, W + 20, Hh + 20);
      const top = Hh * 0.09, coastTop = top + 6, coastBot = Hh * 0.17;
      // chart strip
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(10.5, 8.5, W - 21, top - 6);
      const cx0 = 26, cx1 = W - 40, cy = 8 + (top - 6) * 0.62;
      g.setLineDash([3, 4]); g.beginPath(); g.moveTo(cx0, cy); g.lineTo(cx1, cy); g.stroke(); g.setLineDash([]);
      g.beginPath(); for (let i = 0; i <= 60; i++) { const x = cx0 + ((cx1 - cx0) * i) / 60; const y = 8 + (top - 6) * (0.32 + 0.12 * Math.sin(i * 0.7) * Math.cos(i * 0.23)); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      const pinX = cx0 + (cx1 - cx0) * Math.min(1, s.x / LENGTH);
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx0, cy); g.lineTo(pinX, cy); g.stroke(); g.lineWidth = 1;
      for (const r of ROCKS) { const rx = cx0 + (cx1 - cx0) * (r / LENGTH); g.fillStyle = BROWN; g.beginPath(); g.moveTo(rx - 4, cy + 4); g.lineTo(rx, cy - 3); g.lineTo(rx + 4, cy + 4); g.fill(); }
      g.fillStyle = RED; g.beginPath(); g.arc(pinX, cy - 7, 4, 0, 7); g.fill(); g.beginPath(); g.moveTo(pinX, cy - 3); g.lineTo(pinX, cy + 3); g.strokeStyle = RED; g.stroke();
      g.strokeStyle = INK; g.beginPath(); g.arc(cx1 + 10, cy, 6, 0, 7); g.stroke(); g.beginPath(); g.arc(cx1 + 10, cy, 1.5, 0, 7); g.fillStyle = INK; g.fill();
      g.font = `italic ${Math.max(12, Math.min(14, W / 70))}px 'IM Fell English',Georgia,serif`; g.fillStyle = INK;
      g.textAlign = "left"; g.fillText(`${(Math.min(s.x, LENGTH) / NM).toFixed(2)} nm of ${(LENGTH / NM).toFixed(1)}`, 18, 8 + (top - 6) * 0.95);
      g.textAlign = "right"; g.fillText(C.port, cx1 - 6, 8 + (top - 6) * 0.95);
      if (glass) for (const f of FLEET) { const fx = cx0 + (cx1 - cx0) * (f / LENGTH); g.fillStyle = INK; g.fillRect(fx - 3, cy - 3, 6, 3); g.fillRect(fx - 0.5, cy - 9, 1, 6); }
      // coast strip: moorings lift as crests roll on
      g.save(); g.beginPath(); g.rect(10, coastTop, W - 20, coastBot - coastTop); g.clip();
      g.strokeStyle = INK; g.beginPath(); g.moveTo(10, coastBot - 2); g.lineTo(W - 10, coastBot - 2); g.stroke();
      const swell = crests.reduce((a, c) => a + c.h, 0);
      if (A.coast) { // the Spice Mouth strip, drifting past, with skiffs and a ferry at its moorings
        const cw = A.coast.width / dpr, bh = coastBot - coastTop;
        for (let x = -((s.x * 0.6) % cw); x < W; x += cw) g.drawImage(A.coast, x, coastTop, cw, bh);
        for (let i = 0; i < Math.ceil(W / 92) + 1; i++) {
          const x = ((i * 92 - (s.x * 1.1) % 92) + 92) % (W + 92) - 30;
          const bob = Math.sin(t * 1.4 + i) * (0.6 + swell * 1.1);
          const im = i % 5 === 2 ? A.ferry : A.skiff;
          if (im) g.drawImage(im, x, coastBot - 3 - im.height / dpr * 0.82 + bob, im.width / dpr, im.height / dpr);
        }
        if (swell > 1.5) { g.fillStyle = GREEN; g.globalAlpha = 0.12; g.fillRect(10, coastBot - 9, W - 20, 8); g.globalAlpha = 1; }
        if (wenna) { // Wenna's crew: the ferry's crossing is called along the coast strip
          const on = ferryAt(t), left = on ? 34 - (t % 34) : 22 - (t % 34);
          const lbl = on ? `FERRY MID-HARBOUR · ${Math.ceil(left)} s` : `ferry at the quay · crosses in ${Math.ceil(left)} s`;
          g.font = "13px 'IM Fell English SC',Georgia,serif"; g.textAlign = "right"; const tw = g.measureText(lbl).width + 12;
          g.fillStyle = on ? RED : PAPER; g.fillRect(W - 14 - tw, coastTop + 2, tw, 17); g.strokeStyle = on ? RED : GREEN; g.strokeRect(W - 13.5 - tw, coastTop + 2.5, tw - 1, 16);
          g.fillStyle = on ? PAPER : GREEN; g.fillText(lbl, W - 20, coastTop + 15);
        }
      } else for (let i = 0; i < Math.ceil(W / 46) + 1; i++) {
        const x = ((i * 46 - (s.x * 0.6) % 46) + 46) % (W + 46) - 10;
        const bob = Math.sin(t * 1.4 + i) * (1 + swell * 1.2);
        g.strokeStyle = swell > 1.5 ? GREEN : INK;
        if (i % 4 === 1) { g.fillStyle = INK; g.fillRect(x, coastBot - 14, 10, 12); g.beginPath(); g.moveTo(x - 1, coastBot - 14); g.lineTo(x + 5, coastBot - 20); g.lineTo(x + 11, coastBot - 14); g.fill(); }
        else { g.beginPath(); g.moveTo(x, coastBot - 5 + bob); g.quadraticCurveTo(x + 6, coastBot - 1 + bob, x + 12, coastBot - 5 + bob); g.moveTo(x + 6, coastBot - 4 + bob); g.lineTo(x + 6, coastBot - 16 + bob); g.stroke(); }
      }
      g.restore();
      // sky hatching and clouds
      if (A.sky) g.drawImage(A.sky, 10, coastBot + 2, W - 20, seaY + 4 - (coastBot + 2));
      else hatch(10, coastBot + 2, W - 10, seaY + 4, 7, 0.9, 0.12);
      for (let i = 0; !A.sky && i < 5; i++) {
        const x = ((i * 260 - s.x * 0.35 * ppm * 0.3) % (W + 300) + W + 300) % (W + 300) - 150, y = coastBot + 70 + (i % 3) * 22;
        g.fillStyle = PAPER; g.strokeStyle = INK; g.lineWidth = 1;
        g.beginPath(); for (let j = 0; j < 5; j++) g.arc(x + j * 22, y + (j % 2) * 4, 16 + (j % 3) * 4, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
      }
      // lighthouse and beam
      const lx = wx(LIGHT_X);
      if (lx > -200 && lx < W + 200) {
        const ly = coastBot + 6;
        if ((t % 7) < 3.2) {
          g.save(); g.fillStyle = GOLD;
          g.beginPath(); g.moveTo(lx, ly + 8); g.lineTo(lx - 70 * ppm, seaY); g.lineTo(lx + 70 * ppm, seaY); g.closePath();
          g.globalAlpha = 0.16; g.fill(); g.restore();
          hatch(lx - 70 * ppm, seaY - 26, lx + 70 * ppm, seaY + 2, 5, -0.6, 0.35);
        }
        g.fillStyle = PAPER; g.strokeStyle = INK; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(lx - 6, ly + 34); g.lineTo(lx - 3, ly + 6); g.lineTo(lx + 3, ly + 6); g.lineTo(lx + 6, ly + 34); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = GOLD; g.fillRect(lx - 3, ly + 1, 6, 5); g.strokeRect(lx - 3, ly + 1, 6, 5);
        for (let k = 0; k < 3; k++) { g.fillStyle = RED; g.fillRect(lx - 4.5 + k * 0.5, ly + 12 + k * 8, 9 - k, 3); }
      }
      // sea: engraved lines following the surface
      const step = 4;
      const xs = []; for (let px = -step; px <= W + step; px += step) xs.push(px);
      const hs = xs.map((px) => H(s.x + (px - boatSX) / ppm));
      for (let L = 0; L < 46; L++) {
        const depth = L * (6 + L * 0.35);
        const damp = Math.exp(-L * 0.09);
        g.beginPath();
        for (let i = 0; i < xs.length; i++) { const y = seaY - hs[i] * ppm * V * damp + depth; i ? g.lineTo(xs[i], y) : g.moveTo(xs[i], y); }
        g.strokeStyle = INK; g.lineWidth = L === 0 ? 1.6 : Math.max(0.35, 1.1 - L * 0.02); g.stroke();
        if (L < 10) { // burin swelling on steep faces
          g.lineWidth = 2.2 - L * 0.15;
          g.beginPath();
          for (let i = 1; i < xs.length; i++) {
            const sl = Math.abs(hs[i] - hs[i - 1]) / (step / ppm) * V;
            if (sl > 0.32) { g.moveTo(xs[i - 1], seaY - hs[i - 1] * ppm * V * damp + depth); g.lineTo(xs[i], seaY - hs[i] * ppm * V * damp + depth); }
          }
          g.stroke();
        }
      }
      // fog banks
      for (const f of fogs) {
        const fx = wx(f.x), fw = f.w * ppm, al = Math.min(1, (f.life - f.age) / 3);
        g.save(); g.globalAlpha = 0.85 * al; g.fillStyle = PAPER;
        g.beginPath(); g.ellipse(fx, seaY - 18, fw / 2, 46, 0, 0, 7); g.fill();
        g.globalAlpha = 0.6 * al; g.strokeStyle = INK; g.lineWidth = 0.6;
        for (let k = -4; k <= 4; k++) { g.setLineDash([2, 5]); g.beginPath(); g.ellipse(fx, seaY - 18 + k * 7, fw / 2 * (1 - Math.abs(k) * 0.09), 4, 0, Math.PI, 0); g.stroke(); }
        g.setLineDash([]); g.restore();
      }
      // reef
      for (const r of ROCKS) {
        const rx = wx(r); if (rx < -60 || rx > W + 60) continue;
        const ry = wy(0.9);
        g.fillStyle = BROWN; g.strokeStyle = INK; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(rx - 4 * ppm, seaY + 26); g.lineTo(rx - 2.4 * ppm, ry + 6); g.lineTo(rx - 0.5 * ppm, ry); g.lineTo(rx + 1.3 * ppm, ry + 4); g.lineTo(rx + 4.2 * ppm, seaY + 26); g.closePath(); g.fill(); g.stroke();
        hatch(rx - 4 * ppm, ry, rx + 4 * ppm, seaY + 26, 3.5, 0.3, 0.7);
        if (Math.abs(r - s.x) < 90 && r > s.x - 10) {
          const over = H(r), ok = over >= 0.6;
          g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.textAlign = "center";
          const lbl = s.kettle ? "the Kettle crew hold the tide over it" : ok ? `${over.toFixed(1)} m over the reef: clear` : `${over.toFixed(1)} m over the reef: stir on it`;
          if (s.kettle) { g.fillStyle = GREEN; g.globalAlpha = 0.25; g.fillRect(rx - 5 * ppm, seaY - 6, 10 * ppm, 30); g.globalAlpha = 1; }
          const tw = g.measureText(lbl).width + 12;
          g.fillStyle = PAPER; g.fillRect(rx - tw / 2, ry - 34, tw, 22); g.strokeStyle = ok || s.kettle ? GREEN : RED; g.strokeRect(rx - tw / 2 + 0.5, ry - 33.5, tw - 1, 21);
          g.fillStyle = ok || s.kettle ? GREEN : RED; g.fillText(lbl, rx, ry - 18);
        }
      }
      // buoys
      for (const b of BUOYS.slice(1)) {
        const bx = wx(b); if (bx < -20 || bx > W + 20) continue;
        const by = wy(H(b));
        g.fillStyle = RED; g.strokeStyle = INK; g.beginPath(); g.moveTo(bx - 5, by); g.lineTo(bx, by - 16); g.lineTo(bx + 5, by); g.closePath(); g.fill(); g.stroke();
        if (stage === "test") { g.strokeStyle = rung.has(b) ? "rgba(31,46,74,.35)" : INK; g.lineWidth = 1; g.beginPath(); g.arc(bx, by - 20, 4, Math.PI, 0); g.lineTo(bx + 5, by - 17); g.lineTo(bx - 5, by - 17); g.closePath(); g.stroke(); }
      }
      // teach: the lane's small buoys (dark if the dues were struck, burning if they were rewritten)
      if (teach && !lampBlack) for (let b = 80; b < LENGTH; b += 80) {
        const bx = wx(b); if (bx < -20 || bx > W + 20) continue; const by = wy(H(b));
        g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 3, by); g.lineTo(bx, by - 9); g.lineTo(bx + 3, by); g.closePath(); g.stroke();
        if (litLane) { g.fillStyle = GOLD; g.beginPath(); g.arc(bx, by - 12, 3, 0, 7); g.fill(); g.globalAlpha = 0.25; g.beginPath(); g.arc(bx, by - 12, 9, 0, 7); g.fill(); g.globalAlpha = 1; }
      }
      // teach: the convoy, and the lee under each stern
      for (const c of convoy) {
        const sx = wx(c.x); if (sx < -200 || sx > W + 200) continue;
        const k = ppm / 8, sy = wy(H(c.x));
        g.save(); g.translate(sx, sy); g.scale(k, k); g.globalAlpha = c.gone ? 0.45 : 1;
        g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(-64, -14); g.lineTo(-58, 10); g.quadraticCurveTo(0, 16, 56, 10); g.lineTo(72, -16); g.closePath(); g.fill();
        g.strokeStyle = PAPER; g.lineWidth = 0.7; for (let i = -50; i < 56; i += 9) g.strokeRect(i, -7, 4, 4);
        g.strokeStyle = INK; g.fillStyle = PAPER;
        for (const m of [-34, 2, 36]) { g.lineWidth = 1.8; g.beginPath(); g.moveTo(m, -14); g.lineTo(m, -118); g.stroke(); g.lineWidth = 1;
          for (let j = 0; j < 3; j++) { const y = -112 + j * 30; g.beginPath(); g.moveTo(m - 17 + j, y); g.lineTo(m + 17 - j, y); g.lineTo(m + 20 - j, y + 25); g.lineTo(m - 20 + j, y + 25); g.closePath(); g.fill(); g.stroke(); } }
        g.fillStyle = BROWN; g.beginPath(); g.moveTo(2, -118); g.lineTo(22, -113); g.lineTo(2, -108); g.fill();
        if (lampBlack || litLane) { g.fillStyle = GOLD; g.beginPath(); g.arc(-62, -22, 3.2, 0, 7); g.fill(); }
        g.restore();
        if (!c.gone) { // the lee: a dotted bracket astern
          const x0 = wx(c.x - 30), x1 = wx(c.x + 6), y = sy + 16;
          g.strokeStyle = s.lee ? GREEN : INK; g.lineWidth = s.lee ? 2 : 1; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x0, y - 8); g.lineTo(x0, y); g.lineTo(x1, y); g.lineTo(x1, y - 8); g.stroke(); g.setLineDash([]);
          g.font = "italic 14px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.fillStyle = s.lee ? GREEN : INK; g.fillText(s.lee ? "in her lee" : "her lee", (x0 + x1) / 2, y + 15);
        } else if (sx > 0 && sx < W) { g.font = "italic 14px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.fillStyle = INK; g.fillText("hauling out of line", sx, sy + 30); }
      }
      // test: oil on the water, and what is coming back
      for (const o of oils) {
        const x0 = wx(o.x - o.w / 2), x1 = wx(o.x + o.w / 2);
        g.save(); g.globalAlpha = Math.min(0.5, o.life / 3); g.fillStyle = BROWN;
        g.beginPath(); for (let px = x0; px <= x1; px += 6) { const y = wy(H(s.x + (px - boatSX) / ppm)); px === x0 ? g.moveTo(px, y) : g.lineTo(px, y); }
        for (let px = x1; px >= x0; px -= 6) g.lineTo(px, wy(H(s.x + (px - boatSX) / ppm)) + 9); g.closePath(); g.fill(); g.restore();
        g.font = "italic 14px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.fillStyle = BROWN; g.fillText(`oil · ${Math.ceil(o.life)} s`, (x0 + x1) / 2, wy(H(o.x)) + 26);
      }
      for (const c of crests) if (c.back && c.h > 0.2 && c.x > s.x + 4) { const x = wx(c.x), y = wy(H(c.x)) - 12; if (x > W + 30) continue; g.fillStyle = INK; g.beginPath(); g.moveTo(x - 9, y - 10); g.lineTo(x + 3, y - 15); g.lineTo(x + 3, y - 5); g.fill(); g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.textAlign = "left"; g.fillText("coming back", x + 7, y - 6); }
      // twist: the sleeping fleet, and the hum's ripples
      if (glass) {
        for (const f of FLEET) {
          const fx = wx(f); if (fx < -160 || fx > W + 160) continue;
          const awake = s.wake / 100;
          drawBoat(f, true, 0.85);
          const ly = wy(H(f)) - 96 * ppm / 8;
          g.fillStyle = awake > 0.6 ? GOLD : INK; g.globalAlpha = 0.35 + awake * 0.65; g.beginPath(); g.arc(fx + 2, ly, 3 + awake * 3, 0, 7); g.fill(); g.globalAlpha = 1;
          if (Math.abs(f - s.x) < 20) { g.font = "italic 14px 'IM Fell English',Georgia,serif"; g.textAlign = "center"; g.fillStyle = s.v > 6.2 ? RED : INK; g.fillText(s.v > 6.2 ? "spill wind: your wash is on her cable" : "creeping past", fx, wy(H(f)) + 34); }
        }
        for (const c of crests) if (c.hum && c.h > 0.15) {
          const x = wx(c.x), y = wy(H(c.x));
          g.strokeStyle = GREEN; g.fillStyle = GREEN; g.lineWidth = 1.4;
          g.beginPath(); g.ellipse(x, y - 22, 4, 3, -0.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + 3.6, y - 22); g.lineTo(x + 3.6, y - 38); g.lineTo(x + 10, y - 35); g.stroke();
          g.setLineDash([2, 3]); g.beginPath(); g.arc(x, y, 16, 0, 7); g.stroke(); g.setLineDash([]);
        }
      }
      // port
      const px = wx(LENGTH);
      if (px < W + 80) { g.strokeStyle = INK; g.lineWidth = 1.2; for (let k = 0; k < 6; k++) { g.strokeRect(px + k * 26, seaY - 40 - (k % 3) * 14, 22, 40 + (k % 3) * 14); } g.font = "italic 16px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "left"; g.fillText(teach ? "The anchorage" : glass ? "The sea-gate" : "Spice Mouth", px, seaY - 80); }
      // cutters and boat
      for (const c of cutters) if (wx(c.x) > -120) drawBoat(c.x, true, inFog(c.x) ? 0.35 : 1);
      if (s.capsized > 0) {
        g.save(); g.translate(boatSX, wy(H(s.x))); g.rotate(Math.PI * 0.55 * Math.min(1, (1.6 - s.capsized) * 2)); g.translate(-boatSX, -wy(H(s.x))); drawBoat(s.x, false); g.restore();
      } else drawBoat(s.x, false);
      // grapnel line
      for (const c of cutters) if (c.grap > 0) {
        g.strokeStyle = RED; g.lineWidth = 1.4; g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(wx(c.x) + 40 * ppm / 8, wy(H(c.x)) - 20); g.quadraticCurveTo((wx(c.x) + boatSX) / 2, wy(H(s.x)) - 40, boatSX - 18, wy(H(s.x)) - 4); g.stroke(); g.setLineDash([]);
      }
      // spray and stir rings (the flourish)
      g.fillStyle = INK; for (const p of sprays) { g.globalAlpha = Math.max(0, p.life); g.fillRect(wx(p.x), wy(H(p.x) + p.y), 2, 2); } g.globalAlpha = 1;
      if (!reduce) for (const r of rings) { g.strokeStyle = r.col; g.globalAlpha = 1 - r.age; g.lineWidth = 1.6; const x = wx(r.x), y = wy(H(r.x)); for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x, y, 10 + r.age * 70 + k * 8, (10 + r.age * 70 + k * 8) * 0.3, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; }
      // reticle and stir spiral
      const rX = stir.on ? (stir.key ? s.x + reticleOff : stir.worldX) : (hoverPx != null ? toWorldX(hoverPx) : s.x + reticleOff);
      const rc = Math.max(s.x - 40, Math.min(s.x + 40, rX));
      const rsx = wx(rc), rsy = wy(H(rc));
      g.strokeStyle = RED; g.lineWidth = 1.2; g.beginPath(); g.arc(rsx, rsy, 14, 0, 7); g.moveTo(rsx - 20, rsy); g.lineTo(rsx + 20, rsy); g.moveTo(rsx, rsy - 20); g.lineTo(rsx, rsy + 20); g.stroke();
      if (stir.on) {
        const circles = Math.floor(Math.abs(stir.angle) / (Math.PI * 2));
        const frac = (Math.abs(stir.angle) / (Math.PI * 2)) % 1;
        g.strokeStyle = stir.angle >= 0 ? RED : INK;
        for (let k = 0; k < circles; k++) { g.lineWidth = 1.4; g.beginPath(); g.arc(rsx, rsy, 20 + k * 7, 0, 7); g.stroke(); }
        g.lineWidth = 2.4; g.beginPath(); g.arc(rsx, rsy, 20 + circles * 7, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2 * Math.sign(stir.angle || 1), stir.angle < 0); g.stroke();
        if (!stir.key && stir.pts.length > 1) { g.globalAlpha = 0.6; g.lineWidth = 1.2; g.beginPath(); stir.pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.globalAlpha = 1; }
        g.font = "italic 17px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "center";
        const lbl = circles < 1 ? "circle…" : stir.angle > 0 ? TIERS[tierFor(circles)].name + (s.song > 0 ? " (sung)" : "") : "Still";
        g.fillStyle = PAPER; const lw = g.measureText(lbl).width + 10; g.fillRect(rsx - lw / 2, rsy - 47 - circles * 7, lw, 22);
        g.fillStyle = stir.angle >= 0 ? RED : INK; g.fillText(lbl, rsx, rsy - 31 - circles * 7);
      }
      // margins: compass rose, scale bar
      const rx0 = W - 52, ry0 = Hh - 100;
      if (A.rose) { g.drawImage(A.rose, rx0 - 38, ry0 - 38, 76, 76); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(rx0, ry0, 38, 0, 7); g.stroke(); }
      else { g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.arc(rx0, ry0, 26, 0, 7); g.stroke(); }
      g.fillStyle = INK; for (let k = 0; !A.rose && k < 4; k++) { const a = k * Math.PI / 2; g.beginPath(); g.moveTo(rx0 + Math.cos(a) * 30, ry0 + Math.sin(a) * 30); g.lineTo(rx0 + Math.cos(a + 0.5) * 6, ry0 + Math.sin(a + 0.5) * 6); g.lineTo(rx0 + Math.cos(a - 0.5) * 6, ry0 + Math.sin(a - 0.5) * 6); g.fill(); }
      const sbx = 18, sby = Hh - 84;
      for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? PAPER : INK; g.fillRect(sbx + k * 10 * ppm / 2, sby, 10 * ppm / 2, 5); } g.strokeRect(sbx, sby, 25 * ppm, 5);
      g.font = "12px 'IM Fell English',Georgia,serif"; g.fillStyle = INK; g.textAlign = "left"; g.fillText("25 metres", sbx, sby + 18);
      // instruments: cutter distance, grapnel, notice, song, sail
      const cut = cutters.reduce((m, c) => Math.min(m, s.x - c.x), 1e9);
      const iy = coastBot + 22, gw = Math.max(70, Math.min(140, W * 0.12)), col = gw + 190, stack = W < 3 * col + 40;
      const panelW = stack ? Math.min(W - 24, gw + 230) : col * 3;
      g.fillStyle = "rgba(244,241,232,.92)"; g.fillRect(12, coastBot + 4, panelW, stack ? 98 : 42); g.strokeStyle = INK; g.lineWidth = 0.8; g.strokeRect(12.5, coastBot + 4.5, panelW - 1, stack ? 97 : 41);
      const danger = cut < 45 || s.grap > 0;
      const gx = stack ? [20, 20, 20] : [20, 20 + col, 20 + 2 * col];
      const gy = stack ? [iy, iy + 30, iy + 60] : [iy, iy, iy];
      if (glass) gauge(gx[0], gy[0], gw, "THE FLEET'S WAKE", s.wake / 100, `${Math.round(s.wake)} of 100`, s.wake >= 60 ? RED : INK);
      else gauge(gx[0], gy[0], gw, "CUTTER ASTERN", 1 - Math.min(1, Math.max(0, cut) / 150), s.grap > 0 ? `grapnel ${s.grap.toFixed(1)} / 4 s` : s.lee ? `${Math.max(0, cut).toFixed(0)} m · she has lost you` : `${Math.max(0, cut).toFixed(0)} m`, danger ? RED : s.lee ? GREEN : INK);
      if (glass) gauge(gx[1], gy[1], gw, "THE HYMN", 1 - Math.max(0, humT) / HUM_S, `next bar ${Math.max(0, humT).toFixed(0)} s · ${stilled} put down`, GREEN);
      else if (teach) gauge(gx[1], gy[1], gw, "THE LEE", s.lee ? 1 : 0, s.lee ? "hidden under her stern" : "in plain sight", s.lee ? GREEN : RED);
      else gauge(gx[1], gy[1], gw, "NOTICE", s.notice / 100, `${Math.round(s.notice)}${s.notice < 50 ? " · 50 brings a 2nd cutter" : " · two cutters"}`, s.notice >= 50 ? RED : BROWN);
      if (s.song > 0) gauge(gx[2], gy[2], gw, "THE SONG", s.song / SONG_S, `${s.song.toFixed(0)} s`, GREEN);
      else gauge(gx[2], gy[2], gw, "SAIL", s.trim, `${Math.round(s.trim * 100)}% · ${s.v.toFixed(1)} m/s · ${s.helm === 1 ? "climb" : s.helm === -1 ? "run" : "steady"}`, INK);
      g.font = "15px 'IM Fell English',Georgia,serif";
      for (const c of cutters) if (wx(c.x) < 10) { const y = wy(H(s.x)) - 40; g.fillStyle = RED; g.beginPath(); g.moveTo(10, y); g.lineTo(22, y - 7); g.lineTo(22, y + 7); g.fill(); g.textAlign = "left"; g.fillText(`cutter ${Math.round(s.x - c.x)} m`, 26, y + 5); }
      if (s.broad > 0.05) {
        const by = wy(H(s.x)) - 92; g.font = "italic 17px 'IM Fell English',Georgia,serif"; g.textAlign = "center";
        const lbl = `Broadside ${s.broad.toFixed(1)} / 1.5 s: ${slope(s.x) > 0 ? "Climb (W)" : "Run (S)"}!`;
        const lw = g.measureText(lbl).width + 14; g.fillStyle = PAPER; g.fillRect(boatSX - lw / 2, by - 17, lw, 24); g.strokeStyle = RED; g.strokeRect(boatSX - lw / 2 + 0.5, by - 16.5, lw - 1, 23);
        g.fillStyle = RED; g.fillText(lbl, boatSX, by);
      }
      if (s.msgT > 0) { g.font = `italic ${Math.max(17, Math.min(22, W / 45))}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.fillStyle = INK; g.globalAlpha = Math.min(1, s.msgT); g.fillText(s.msg, W / 2, seaY + 54); g.globalAlpha = 1; }
      g.restore();
      // flash: a red (or green) wash over the plate border
      if (s.flash > 0 && !reduce) { g.strokeStyle = s.flashCol; g.globalAlpha = s.flash * 0.7; g.lineWidth = 18; g.strokeRect(0, 0, W, Hh); g.globalAlpha = 1; }
      else if (s.flash > 0) { g.strokeStyle = s.flashCol; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, Hh - 6); }
      // plate border
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(4.5, 4.5, W - 9, Hh - 9);
      // link: the dues were struck, so this plate is cut in lamp-black (the whole plate, drawn once, turned over)
      if (lampBlack) { g.globalCompositeOperation = "difference"; g.fillStyle = "#e9e4d6"; g.fillRect(0, 0, W, Hh); g.globalCompositeOperation = "source-over"; }
    }

    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (running) step(dt);
      else if (!reduce && !over) t += dt * 0.5;
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    const startBtn = how.querySelector("button");
    let unnote = null;
    const start = () => {
      how.remove(); running = true; last = performance.now();
      caption(teach ? "Full sail for the convoy ship ahead, and a ripple astern to ride." : glass ? "Quietly. Counter-clockwise on every ripple; raise nothing." : "Stir behind the boat and surf the face you raise. Keep the cutter off your quarter.", false, 5);
      if (kettle) { kettleBtn.hidden = false; }
      const why = lampBlack ? "Because you struck the harbour dues in The Charter, Tidewater's plate is cut in lamp-black: the lane buoys are dark, and the only light is the foam you raise."
        : litLane ? "Because you had the harbour dues rewritten in The Charter, Tidewater's lights stay: the lane buoys burn, and each convoy ship's lee is marked."
        : kettle && wenna ? "Because you won Wenna's crew and the Kettle crew at Liar's Tide: the ferry's crossings show on the coast strip, and Kettle (K) stands the tide over both reefs."
        : kettle ? "Because you won the Kettle crew at the Flooding Table in Liar's Tide: call Kettle (K) and the tide stands over both reefs."
        : wenna ? "Because you won Wenna's crew at Liar's Tide: the ferry's crossings show on the coast strip, so a crest can be timed round her." : "";
      if (why) unnote = note(wrap, why);
    };
    startBtn.addEventListener("click", start);
    startBtn.focus();

    return {
      unmount() {
        cancelAnimationFrame(raf); dead = true; clearTimeout(prepTimer); if (acct) acct.remove(); if (unnote) unnote();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        cv.removeEventListener("pointerdown", pd); cv.removeEventListener("pointermove", pm);
        cv.removeEventListener("pointerup", pu); cv.removeEventListener("pointercancel", pu); cv.removeEventListener("contextmenu", noMenu);
        timers.forEach(clearTimeout); timers.clear();
        ro.disconnect();
        running = false; over = true;
      },
    };
  },
};

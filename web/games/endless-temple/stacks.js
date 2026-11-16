// The Endless Temple / The stacks (2D, scroll). Style: Impossible-architecture line drawing.
// DESIGN.md section 10, Mode B, sequence s2_stacks_c5: five junctions, rolling ladders, the call
// as falling drops (drawn as gold motes: the only colour on the page). Side-on through shelves
// that do not end, toward the weather book that is calling.
//
// Walk (A/D or arrows). At a junction take a ladder up (W/Up), a hatch down (S/Down) or walk on.
// Where the motes thicken is the right way: it lengthens the bookmark ribbon. The wrong way thins
// them, and the aisle bends back to the last junction. Rolling ladders: press E (Grab) to ride,
// push with D, E again to step off. Falling books cast a shadow a second before they land; a hit
// staggers you, and a hit on a ladder drops you back to the landing. No failure is fatal: the run
// is scored by time and wrong turns.
// Art (api.art): the twelve shelf bays as the backdrop (each rasterised once), the Elaris sprite,
// the bookmark ribbon, the mote sprites as the call's badge, a climb glyph, the chapter heading.
// The old line drawing stays as the fallback while the art loads, or if it is missing.
// Phase 2 (DEEP_DIVE.md section 3, The stacks): three visits, a ladder.
//   Teach (s2_stacks_c3): follow the motes: sand, three junctions, few falling books.
//   Test (s2_stacks_c5): false trails and rolling ladders: rain, four junctions; some drops cling to
//     a wrong way until Elaris stands and Listens.
//   Twist (s2_stacks_c7): keep the shelves from changing. Unwatched shelves turn over every few
//     seconds and the call moves; a wrong turn from an unpinned aisle costs a length of ribbon, and
//     the third ends the visit. Reading lamps: three wicks; a lit lamp (F) pins its aisle, which is
//     never rebuilt. Maudric's ribbons: an old bookmark at some junctions marks a quicker way, past
//     the books he read; it counts as a linger (api.shared `walked`: the boy in the sand book walks
//     further). The set-piece: the last aisle runs past the reading chair; Elaris is sitting in it
//     with the cup, and the player walks past behind him.
// The design's "no failure is fatal" holds: a lost visit puts Elaris back at the door of the stacks.

const BASE_JUNCTIONS = 3;
const EXITS = ["up", "down", "on"];
// Narration written for the game (not quotations).
const LINES = {
  open: "Rain is falling somewhere in the stacks, where no rain should be. The weather book of Hollin is calling, and Elaris goes to find it.",
  first: "Follow the grains. Where they thicken, the way is right.",
  listen: "The drops are harder to read here. Stand and Listen (hold L), and they gather into one stream.",
  ladders: "Rolling ladders on the rails. Grab one (E) and push: it outruns the falling books.",
  wander: "The keeper's mind wanders, and the shelves go on: two more junctions have grown ahead.",
  right: "The call thickens. Junction {n} of {N} behind you.",
  wrong: "The call thins out here.",
  bend: "The aisle bends back. The same junction again; the shelves go on.",
  near: "The motes gather ahead. The calling book is close.",
  hit: "A book falls on you. You stagger.",
  winClean: "{book}, found by its own {call}: {N} junctions in {t}, with no wrong turn. {tail}",
  win: "{book}, found: {N} junctions in {t}, with {w} wrong turn{ws} and {h} falling book{hs}. The shelves behind him have already rearranged themselves.",
  // phase 2
  open0: "Sand is drifting through the stacks, a grain at a time, toward a shelf that is kept clasped. Elaris goes after it.",
  open2: "Ink is running along the shelf edges, and the stacks will not keep still tonight. Elaris takes three wicks for the reading lamps and goes in.",
  decoy: "Some of the drops cling to the wrong shelves here. Stand and Listen (hold L): only the true stream gathers.",
  lampHow: "The shelves here turn over when nobody is looking, and the call moves with them. Light a reading lamp (F): a lit aisle is never rebuilt.",
  lamp: "A reading lamp, lit. This aisle will stay as it is. Wicks left: {n}.",
  noWick: "No wick left for a lamp.",
  turnOver: "The shelves turn over. The call comes from another way now.",
  wrongPinned: "The flecks thin out here. But the lamp is lit: the aisle will be as he left it.",
  wrongLoose: "The flecks thin out, and behind him the shelves rebuild: a length of the ribbon is gone. ({n} of 3.)",
  ribbon: "An old green bookmark hangs at this way: the last keeper's. It is quicker, past the books he read, and two junctions go by at once. Something in the cup is the heavier for it.",
  ribbonLink: "Because you took the old keeper's ribbon, the boy in the sand book will have walked further: the living illustration starts on tired feet.",
  chair: "The aisle runs past the reading chair. A keeper sits in it with a cup, his back to the shelves. It is himself. He does not look up, and Elaris walks by behind him.",
  lost: "The shelves have turned over once too often, and the ink has dried on their edges. Elaris finds himself at the door of the stacks again, with {w} wick{ws} in his pocket and the road book still somewhere inside.",
  stop: "{text} He leaves the stacks by the way he came, and the deeper shelves keep their books for another night.",
};
const STG = [
  { name: "Teach: follow the motes", scene: "s2_stacks_c3", J: 3, mote: "sand", book: "The clasped shelf", call: "sand", tail: "Sand lies along the clasp like a drawn line.", open: "open0", ladders: false, bookGap: 16, decoy: 0, rebuild: 0, wicks: 0 },
  { name: "Test: false trails and rolling ladders", scene: "s2_stacks_c5", J: 4, mote: "rain", book: "The weather book of Hollin", call: "rain", tail: "Its pages are damp under Elaris's long green hand.", open: "open", ladders: true, bookGap: 8, decoy: 0.38, rebuild: 0, wicks: 0 },
  { name: "Twist: keep the shelves from changing", scene: "s2_stacks_c7", J: 4, mote: "ink", book: "The road book", call: "ink", tail: "The lamps he lit are still burning behind him.", open: "open2", ladders: true, bookGap: 9, decoy: 0, rebuild: 9, wicks: 3 },
];

export default {
  mount(root, api) {
    const P = "endless-temple-stacks-";
    const rng = api.rng("et-stacks-c5");
    const C = { paper: "#efe8d6", ink: "#2a2a2a", faint: "rgba(42,42,42,.35)", gold: "#d4a23a", goldHi: "#f0c45a", sage: "#8fa07a" };
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", img: async () => null };
    const pic = (id, alt = "") => (art.has(id) ? `<img src="${art.url(id)}" alt="${alt}" draggable="false">` : "");
    const spr = {};
    let alive = true;
    async function prep(id, w, h) {
      const im = await art.img(id);
      if (!im || !alive) return;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(im, 0, 0, w, h);
      spr[id] = c;
    }
    const TILE_IDS = ["plain", "calling", "ladder-up", "ladder-down", "arch", "ceiling", "lamp", "ribbon", "sand-drift", "frost", "chair"];
    for (const t of TILE_IDS) prep("stacks-" + t, 512, 512);
    prep("sprite-elaris", 288, 360);
    for (const r of ["ribbon-empty", "ribbon-grown", "ribbon-end"]) prep(r, 300, 60);
    for (const m of ["mote-rain", "mote-frost", "mote-sand", "mote-ink"]) prep(m, 96, 96);
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    let stage = 0;
    const stg = () => STG[stage];
    prep("glyph-climb", 88, 88);
    const TILE_K = 400 / 336;          // a tile's shelves run from y=4 to the floor line at y=340 of 400
    const BAY = 4.6 * TILE_K;          // so one bay is this many metres wide
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:hidden;background:${C.paper};touch-action:none;user-select:none;-webkit-user-select:none}
    .${P}root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:10px 12px 12px;pointer-events:none;gap:8px}
    .${P}pad{flex-wrap:wrap}
    .${P}pad div{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    @media (max-width:520px){.${P}pad button{min-width:50px;min-height:52px;font-size:14px}.${P}pad{gap:6px;padding:6px 8px 10px}.${P}pad div{gap:6px}}
    .${P}pad button{pointer-events:auto;font:600 15px 'EB Garamond',Georgia,serif;color:${C.ink};background:rgba(239,232,214,.9);border:1px solid ${C.ink};min-width:56px;min-height:56px;border-radius:4px;touch-action:none}
    .${P}pad button.${P}on{background:${C.goldHi}}
    @media (hover:hover) and (pointer:fine){.${P}pad{opacity:.7}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,232,214,.82);z-index:5;padding:16px;overflow:auto}
    .${P}pad button[hidden]{display:none}
    .${P}card{max-width:440px;background:${C.paper};color:${C.ink};padding:18px 22px 22px;border:1px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:5px;font-family:'EB Garamond',Georgia,serif;font-size:16px;
      background-image:repeating-linear-gradient(90deg,transparent 0 23px,rgba(42,42,42,.06) 23px 24px)}
    .${P}card svg{display:block;width:100%;height:auto;margin-bottom:6px}
    .${P}card h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:0;font-size:28px;text-align:center}
    .${P}goal{margin:4px 0 12px;font-size:17px;text-align:center}
    .${P}card dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 16px}
    .${P}card dt{font-weight:600;border-bottom:1px solid ${C.ink};white-space:nowrap}
    .${P}card dd{margin:0}
    .${P}card button{display:block;margin:0 auto;font:inherit;font-size:18px;padding:8px 26px;border:1px solid ${C.ink};background:${C.goldHi};cursor:pointer}
    .${P}card button:hover,.${P}card button:focus-visible{background:#ffd877;outline:2px solid ${C.ink};outline-offset:2px}
    .${P}card img.${P}head{display:block;width:100%;height:auto;margin-bottom:8px}
    .${P}legend{display:flex;gap:8px;align-items:center;justify-content:center;margin:0 0 12px;font-size:14px;font-style:italic;flex-wrap:wrap}
    .${P}legend img{width:34px;height:34px;border:1px solid ${C.ink};border-radius:50%}
    .${P}legend span{display:inline-flex;align-items:center;gap:4px}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 12px}
    .${P}card .${P}start button{display:inline-block;margin:0;font-size:14px;padding:5px 10px;background:transparent;min-height:38px}
    .${P}card .${P}start button[aria-pressed=true]{background:${C.ink};color:${C.paper}}
    .${P}card .${P}row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
    .${P}card .${P}row button{margin:0}
    .${P}card .${P}row button.${P}alt{background:transparent}
    .${P}endc{position:absolute;inset:0;z-index:6;display:grid;place-items:center;background:rgba(239,232,214,.88);padding:16px 16px 150px;box-sizing:border-box;overflow:auto}
    .${P}endc figure{margin:0;max-width:360px;text-align:center;color:${C.ink};font-family:'IM Fell English',Georgia,serif;font-size:22px}
    .${P}endc img{width:min(320px,70vw);height:auto;border:1px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:4px;margin-bottom:10px}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `<canvas aria-label="Side-on shelves that do not end; a stream of gold motes drifts toward the calling book."></canvas>
      <div class="${P}pad"><div><button type="button" data-k="left">◀</button><button type="button" data-k="right">▶</button></div>
      <div><button type="button" data-k="lamp" hidden>Lamp</button><button type="button" data-k="listen" hidden>Listen</button><button type="button" data-k="grab">Grab</button><button type="button" data-k="down">▼</button><button type="button" data-k="up">▲</button></div></div>`;
    root.append(css, el);
    const cv = el.querySelector("canvas");
    const listenBtn = el.querySelector('[data-k="listen"]');
    const lampBtn = el.querySelector('[data-k="lamp"]');
    const g = cv.getContext("2d");

    // ---- segments ------------------------------------------------------------------------------
    // a segment is an aisle; it ends in a junction (three exits), a bend back (after a wrong turn),
    // or the calling book (after the last junction)
    let answers = Array.from({ length: 8 }, () => EXITS[Math.floor(rng() * 3)]);
    function makeSeg(kind) {
      const G = stg();
      const L = (G.rebuild ? 40 : 52) + Math.floor(rng() * (G.rebuild ? 14 : 28));
      const seg = { kind, L, seed: Math.floor(rng() * 1e6), books: [], ladders: [], pinned: false, lampX: 0, decoy: null, ribbonExit: null };
      if (kind !== "book") for (let x = 8; x < L - 12; x += G.bookGap + rng() * 8) seg.books.push({ x, t: -1, state: "wait", trig: x - 4 - rng() * 3 });
      if (G.ladders && kind !== "book" && rng() < 0.9) seg.ladders.push({ x: 4 + rng() * 6, v: 0, rail: [2, L - 14] });
      if (kind === "junction") {
        const wrongs = EXITS.filter((e) => e !== answers[S0.ribbon]);
        if (G.decoy) seg.decoy = wrongs[Math.floor(rng() * 2)];
        // Maudric's ribbons: at the second and third junctions of the twist, an old bookmark at a way that is not the call's
        if (G.rebuild && (S0.ribbon === 1 || S0.ribbon === 2)) seg.ribbonExit = wrongs[Math.floor(rng() * 2)];
      }
      return seg;
    }
    const S0 = { ribbon: 0 };
    const S = {
      ribbon: 0, wrong: 0, hits: 0, t: 0, started: false, done: false, J: BASE_JUNCTIONS, wandered: false, still: 0, listening: false, flash: 0, flashKind: "", listenOn: false,
      wicks: 0, loose: 0, rebuildT: 0, keepPin: false, ribbons: 0, chairSaid: false, turns: 0,
      seg: makeSeg("junction"), x: 1.5, v: 0, facing: 1, climb: null, stagger: 0, riding: null, runT: 0,
      motes: [], msg: "", msgT: 0, fade: 0,
    };
    const keys = { left: false, right: false, up: false, down: false, listen: false, lamp: false };
    function say(t, s = 2.4) { S.msg = t; S.msgT = s; }
    const exitX = (seg) => ({ up: seg.L - 2 * BAY, down: seg.L - BAY, on: seg.L });

    function enter(kind) { S0.ribbon = S.ribbon; S.seg = makeSeg(kind); S.x = 1.5; S.v = 0; S.riding = null; S.motes = []; S.fade = 1; S.rebuildT = stg().rebuild; }
    // a visit begins: one rung of the ladder
    function startStage(i) {
      stage = i;
      const G = stg();
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, i));
      answers = Array.from({ length: 8 }, () => EXITS[Math.floor(rng() * 3)]);
      Object.assign(S, { ribbon: 0, wrong: 0, hits: 0, t: 0, done: false, J: G.J, wandered: false, listening: false, flash: 0, listenOn: i >= 1, wicks: G.wicks, loose: 0, keepPin: false, ribbons: 0, chairSaid: false, turns: 0, climb: null, stagger: 0, facing: 1, runT: 0 });
      for (const k of Object.keys(keys)) keys[k] = false;
      listenBtn.hidden = !S.listenOn; lampBtn.hidden = !G.rebuild;
      enter("junction");
      S.started = true; last = performance.now();
      say(LINES[G.open] + " " + (i === 0 ? LINES.first : i === 1 ? LINES.decoy : LINES.lampHow), 6.5);
    }
    function lamp() {
      const seg = S.seg;
      if (!stg().rebuild || seg.kind !== "junction" || seg.pinned || S.climb || S.done) return;
      if (S.wicks <= 0) { say(LINES.noWick, 1.6); return; }
      S.wicks--; seg.pinned = true; seg.lampX = S.x;
      say(LINES.lamp.replace("{n}", S.wicks), 3);
    }
    function lose() {
      if (S.done) return;
      S.done = true;
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: LINES.lost.replace("{w}", S.wicks).replace("{ws}", S.wicks === 1 ? "" : "s") }), api.reducedMotion ? 100 : 700));
    }
    function flash(kind) { S.flash = api.reducedMotion ? 0 : 0.9; S.flashKind = kind; }
    function takeExit(ex) {
      const seg = S.seg;
      if (seg.kind === "junction") {
        const byRibbon = seg.ribbonExit === ex && ex !== answers[S.ribbon];
        if (ex === answers[S.ribbon] || byRibbon) {
          S.ribbon = Math.min(S.J, S.ribbon + (byRibbon ? 2 : 1)); flash("right");
          if (byRibbon) { S.ribbons++; shared.set("walked", (shared.get("walked", 0) | 0) + 1); }
          if (S.ribbon >= S.J) { enter("book"); say(LINES.near, 3); }
          else {
            enter("junction");
            if (S.ribbon === 1 && stage === 1) say(LINES.ladders, 4.5);
            else if (S.ribbon === 2 && !S.listenOn) { S.listenOn = true; listenBtn.hidden = false; say(LINES.listen, 5); }
            else say(LINES.right.replace("{n}", S.ribbon).replace("{N}", S.J));
          }
          if (byRibbon) say(LINES.ribbon + " " + LINES.ribbonLink, 8);
        } else if (stg().rebuild) {
          S.wrong++; flash("wrong");
          if (seg.pinned) { S.keepPin = true; enter("bend"); say(LINES.wrongPinned, 3.5); }
          else {
            S.loose++; S.ribbon = Math.max(0, S.ribbon - 1);
            if (S.loose >= 3) { lose(); return; }
            enter("bend"); say(LINES.wrongLoose.replace("{n}", S.loose), 4);
          }
        } else {
          S.wrong++; flash("wrong"); enter("bend");
          if (S.wrong >= 2 && !S.wandered) { S.wandered = true; S.J += 2; say(LINES.wrong + " " + LINES.wander, 5); }
          else say(LINES.wrong);
          if (!S.listenOn) { S.listenOn = true; listenBtn.hidden = false; timers.push(setTimeout(() => say(LINES.listen, 5), 2600)); }
        }
      } else if (seg.kind === "bend") {
        enter("junction");
        if (S.keepPin) { S.keepPin = false; S.seg.pinned = true; S.seg.lampX = 3; }
        say(LINES.bend);
      }
    }

    // ---- input ---------------------------------------------------------------------------------
    const KM = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down", e: "grab", " ": "grab", l: "listen", q: "listen", f: "lamp" };
    function grab() {
      if (S.climb || S.stagger > 0) return;
      if (S.riding) { S.v = S.riding.v; S.riding = null; say("Off the ladder.", 1); return; }
      const l = S.seg.ladders.find((l) => Math.abs(l.x - S.x) < 1.2);
      if (l) { S.riding = l; l.v = Math.max(1.5, Math.abs(S.v)); say("Riding the rolling ladder. Push with ▶.", 1.6); }
    }
    const onDown = (e) => { const k = KM[e.key.toLowerCase()]; if (!k || !S.started || S.done || (k === "listen" && !S.listenOn)) return; e.preventDefault(); if (k === "grab") { if (!e.repeat) grab(); } else if (k === "lamp") { if (!e.repeat) lamp(); } else keys[k] = true; };
    const onUp = (e) => { const k = KM[e.key.toLowerCase()]; if (k && k !== "grab") keys[k] = false; };
    addEventListener("keydown", onDown); addEventListener("keyup", onUp);
    const ptr = [];
    for (const b of el.querySelectorAll("[data-k]")) {
      if (!b.dataset.k) continue;
      const k = b.dataset.k;
      const d = (e) => { e.preventDefault(); if (!S.started || S.done) return; b.classList.add(P + "on"); if (k === "grab") grab(); else if (k === "lamp") lamp(); else keys[k] = true; };
      const u = (e) => { e.preventDefault(); b.classList.remove(P + "on"); if (k !== "grab") keys[k] = false; };
      b.addEventListener("pointerdown", d); b.addEventListener("pointerup", u); b.addEventListener("pointercancel", u); b.addEventListener("pointerleave", u);
      ptr.push([b, d, u]);
    }

    // ---- update --------------------------------------------------------------------------------
    function update(dt) {
      S.t += dt;
      if (S.msgT > 0) S.msgT -= dt;
      if (S.fade > 0) S.fade = Math.max(0, S.fade - dt * 2);
      const seg = S.seg, ex = exitX(seg);

      if (S.climb) {
        S.climb.t += dt;
        if (S.climb.fall) { if (S.climb.t > 0.8) { S.climb = null; say("Down to the landing.", 1.4); } }
        else if (S.climb.t > 1.1) { const d = S.climb.dir; S.climb = null; takeExit(d); }
      } else if (S.stagger > 0) {
        S.stagger -= dt; S.v *= 0.9;
      } else if (S.riding) {
        const l = S.riding;
        if (keys.right) l.v = Math.min(5, l.v + 2.2 * dt);
        else if (keys.left) l.v = Math.max(1.5, l.v - 3 * dt);
        else l.v = Math.max(1.5, l.v - 0.25 * dt);
        l.x += l.v * dt;
        if (l.x >= l.rail[1]) { l.x = l.rail[1]; S.v = 0; S.riding = null; say("The rail ends. You step down.", 1.2); }
        S.x = l.x;
      } else {
        const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        if (dir) { S.runT += dt; S.facing = dir; } else S.runT = 0;
        const target = dir * (S.runT > 0.9 ? 3.6 : 2.2);
        S.v += (target - S.v) * Math.min(1, dt * 8);
        S.x = Math.max(0.5, S.x + S.v * dt);
        // exits
        if (seg.kind === "junction") {
          if (keys.up && Math.abs(S.x - ex.up) < 0.8) { S.climb = { dir: "up", t: 0 }; S.x = ex.up; }
          else if (keys.down && Math.abs(S.x - ex.down) < 0.8) { S.climb = { dir: "down", t: 0 }; S.x = ex.down; }
          else if (S.x > ex.on + 0.5) takeExit("on");
        } else if (seg.kind === "bend") {
          if (S.x > seg.L + 0.5) takeExit("on");
        } else if (seg.kind === "book" && S.x > seg.L - 3) finish();
      }
      S.listening = keys.listen && S.listenOn && !S.climb && !S.riding;
      if (S.listening) { S.v *= 0.8; }
      if (S.flash > 0) S.flash -= dt;
      // the twist: shelves nobody is watching turn over, and the call moves with them
      if (stg().rebuild && seg.kind === "junction" && !seg.pinned && !S.climb) {
        S.rebuildT -= dt;
        if (S.rebuildT <= 0) {
          S.rebuildT = stg().rebuild;
          const others = EXITS.filter((e) => e !== answers[S.ribbon]);
          answers[S.ribbon] = others[Math.floor(rng() * 2)];
          seg.seed = Math.floor(rng() * 1e6); S.motes = []; S.turns++;
          flash("turn"); say(LINES.turnOver, 2.4);
        }
      }
      if (seg.kind === "book" && stg().rebuild && !S.chairSaid && S.x > seg.L * 0.4 - 4) { S.chairSaid = true; say(LINES.chair, 7); }
      // rolling ladders drift on their own a little
      for (const l of seg.ladders) if (l !== S.riding) { l.x = Math.min(l.rail[1], Math.max(l.rail[0], l.x + Math.sin(S.t * 0.7 + l.rail[0]) * 0.1 * dt)); }

      // falling books: a shadow, a second, the fall
      for (const b of seg.books) {
        if (b.state === "wait" && S.x > b.trig) { b.state = "shadow"; b.t = 0; }
        else if (b.state === "shadow") { b.t += dt; if (b.t >= 1) { b.state = "fall"; b.t = 0; } }
        else if (b.state === "fall") {
          b.t += dt;
          if (b.t >= 0.25) {
            b.state = "down";
            if (Math.abs(S.x - b.x) < 0.7 && !(S.riding && S.riding.v > 3.5)) {
              S.hits++;
              if (S.climb && !S.climb.fall) { S.climb = { fall: true, t: 0 }; flash("hit"); }
              else { S.stagger = 1.1; S.riding = null; flash("hit"); say(LINES.hit, 1.4); }
            }
          }
        }
      }

      // motes: thick toward the right exit, thin and drifting back after a wrong turn
      const right = seg.kind === "junction" ? answers[S.ribbon] : seg.kind === "book" ? "book" : null;
      const rate = right ? (S.listening ? 60 : 22) : 5;
      let n = rate * dt; while (n > 0) { if (rng() < n) spawnMote(right); n -= 1; }
      for (let i = S.motes.length - 1; i >= 0; i--) {
        const m = S.motes[i]; m.life -= dt;
        const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy) || 1;
        const pull = S.listening ? 6 : 2.4, wob = S.listening ? 0.05 : 0.3;
        m.vx += (dx / d) * pull * dt + Math.sin(S.t * 2 + m.ph) * wob * dt; m.vy += (dy / d) * pull * dt + Math.cos(S.t * 1.7 + m.ph) * wob * dt;
        m.vx *= 0.97; m.vy *= 0.97; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.life <= 0 || d < 0.3) S.motes.splice(i, 1);
      }
    }
    function spawnMote(right) {
      const seg = S.seg, ex = exitX(seg);
      if (seg.decoy && right && !S.listening && rng() < stg().decoy) right = seg.decoy;
      const tight = S.listening && right;
      const x = tight ? S.x + rng() * 1.5 : S.x - 8 + rng() * 14;
      const y = tight ? 1.2 + rng() * 0.8 : 0.4 + rng() * 2.6;
      let tx, ty;
      if (right === "up") { tx = ex.up; ty = 6; } else if (right === "down") { tx = ex.down; ty = -2.5; }
      else if (right === "on") { tx = ex.on + 6; ty = 1.5; } else if (right === "book") { tx = seg.L - 1; ty = 1.4; }
      else { tx = S.x - 14; ty = 1 + rng(); }
      S.motes.push({ x, y, vx: 0, vy: 0, tx, ty, life: 4 + rng() * 2, ph: rng() * 6 });
    }
    function finish() {
      if (S.done) return;
      S.done = true;
      const G = stg();
      const secs = Math.round(S.t);
      const t = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      let text = (S.wrong ? LINES.win : LINES.winClean).replace("{book}", G.book).replace("{call}", G.call).replace("{tail}", G.tail).replace("{N}", S.J).replace("{t}", t).replace("{w}", S.wrong).replace("{ws}", S.wrong === 1 ? "" : "s").replace("{h}", S.hits).replace("{hs}", S.hits === 1 ? "" : "s");
      if (G.rebuild) text += ` ${3 - S.wicks} lamp${3 - S.wicks === 1 ? "" : "s"} lit; the shelves turned over ${S.turns} time${S.turns === 1 ? "" : "s"}.` + (S.ribbons ? " He took the old keeper's ribbon, and passed himself in the reading chair without a word." : " He passed himself in the reading chair without a word.");
      const endCard = () => {
        if (!art.has("stacks-calling")) return;
        const c = document.createElement("div");
        c.className = P + "endc";
        c.innerHTML = `<figure>${pic(G.rebuild ? "stacks-chair" : "stacks-calling", "The calling book, glowing in its alcove.")}<div></div></figure>`;
        c.querySelector("div").textContent = G.rebuild ? "The reading chair, passed" : "The calling book";
        el.appendChild(c);
      };
      timers.push(setTimeout(() => {
        if (stage >= STG.length - 1) { endCard(); api.end({ outcome: "win", text }); return; }
        const c = document.createElement("div");
        c.className = P + "intro";
        c.innerHTML = `<div class="${P}card" role="dialog" aria-label="The book is found"><h2>${G.book}</h2><p class="${P}goal"></p><p style="margin:0 0 14px;text-align:center;font-style:italic"></p>
          <div class="${P}row"><button type="button" data-a="go">Go deeper</button><button type="button" class="${P}alt" data-a="stop">Stop here</button></div></div>`;
        c.querySelector("." + P + "goal").textContent = text;
        c.querySelectorAll("p")[1].textContent = `Next, ${STG[stage + 1].name.toLowerCase()}.`;
        el.appendChild(c);
        c.querySelector('[data-a="go"]').addEventListener("click", () => { c.remove(); startStage(stage + 1); });
        c.querySelector('[data-a="stop"]').addEventListener("click", () => { c.remove(); endCard(); api.end({ outcome: "win", text: LINES.stop.replace("{text}", text) }); });
        c.querySelector('[data-a="go"]').focus();
      }, api.reducedMotion ? 100 : 600));
    }

    // ---- draw ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);
    const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

    function line(x1, y1, x2, y2) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      const s = Math.max(24, Math.min(80, (H * 0.5) / 4.6)); // px per metre
      const floorY = H * 0.68, ceilY = floorY - 4.6 * s;
      const camX = S.x - (W * 0.38) / s;
      const X = (x) => (x - camX) * s, Y = (y) => floorY - y * s;
      const seg = S.seg, ex = exitX(seg);
      g.lineWidth = 1; g.strokeStyle = C.ink; g.lineCap = "butt";

      // bays: each with its own vanishing point, above or below, so no single perspective is true.
      // The galleries above and below are drawn too, fainter: the shelves go on in every direction.
      const useArt = !!spr["stacks-plain"];
      if (useArt) {
        // the shelf bays, as drawn: one tile per bay, the galleries above and below fainter
        const T = (floorY - ceilY) * TILE_K, top = ceilY - (4 / 400) * T;
        const tile = (id, x, y, a) => { const c = spr["stacks-" + id] || spr["stacks-plain"]; if (x > W || x + T < 0) return; g.globalAlpha = a; g.drawImage(c, Math.round(x), Math.round(y), Math.ceil(T) + 1, Math.ceil(T) + 1); };
        const kindOf = (i, lv) => {
          const h = hash(i * 7 + lv * 13, seg.seed % 997);
          if (seg.kind === "bend" && lv === 0 && (i + 0.5) * BAY > seg.L * 0.45) return "frost";
          if (i === 0 && lv === 0) return "lamp";
          return h < 0.14 ? "ceiling" : h < 0.26 && lv <= 0 ? "sand-drift" : "plain";
        };
        const i0 = Math.floor(camX / BAY) - 1, i1 = Math.ceil((camX + W / s) / BAY);
        for (const lv of [1, -1, 0]) for (let i = i0; i <= i1; i++) tile(kindOf(i, lv), X(i * BAY), top - lv * T, lv ? 0.3 : 1);
        g.globalAlpha = 1;
        if (seg.kind === "junction") {
          if (seg.pinned) tile("lamp", X(Math.floor(seg.lampX / BAY) * BAY), top, 1);
          tile("ladder-up", X(ex.up) - 0.5125 * T, top, 1);
          tile("ladder-down", X(ex.down) - 0.525 * T, top, 1);
          tile("arch", X(ex.on + 0.9) - 0.5125 * T, top, 1);
        } else if (seg.kind === "book") {
          tile("calling", X(seg.L - 1) - 0.5 * T, top, 1);
        }
        g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 1.4;
        line(0, floorY, W, floorY); line(0, ceilY, W, ceilY);
      }
      const bayW = 3;
      const first = Math.floor(camX / bayW) - 1, last = Math.ceil((camX + W / s) / bayW) + 1;
      const levH = floorY - ceilY + 22;
      for (let lv = -2; lv <= 2 && !useArt; lv++) {
        const off = lv * levH;
        const fY = floorY - off, cY = ceilY - off;
        if (fY < -10 || cY > H + 10) continue;
        const main = lv === 0;
        g.globalAlpha = main ? 1 : 0.26;
        for (let i = first; i <= last; i++) {
          const x0 = X(i * bayW), x1 = X((i + 1) * bayW);
          const up = (((i + lv) % 2) + 2) % 2 === 0;
          const vpx = (x0 + x1) / 2 + (hash(i, seg.seed + lv) - 0.5) * s, vpy = up ? cY - 3 * s : fY + 3 * s;
          const k = 0.22;
          const ix0 = x0 + (vpx - x0) * k, ix1 = x1 + (vpx - x1) * k;
          const iy0 = cY + (vpy - cY) * k, iy1 = fY + (vpy - fY) * k;
          g.strokeStyle = C.ink;
          g.strokeRect(x0, cY, x1 - x0, fY - cY);
          g.strokeStyle = C.faint;
          line(x0, cY, ix0, iy0); line(x1, cY, ix1, iy0); line(x0, fY, ix0, iy1); line(x1, fY, ix1, iy1);
          g.strokeRect(ix0, iy0, ix1 - ix0, iy1 - iy0);
          for (let sh = 1; sh < 8; sh++) {
            const fy = fY - (sh / 8) * (fY - cY), by = iy1 - (sh / 8) * (iy1 - iy0);
            g.strokeStyle = C.ink; line(x0, fy, x1, fy);
            g.strokeStyle = C.faint; line(x0, fy, ix0, by); line(x1, fy, ix1, by);
            g.strokeStyle = C.ink;
            const n = 9 + Math.floor(hash(i + lv * 7, sh) * 7);
            for (let b = 0; b < n; b++) {
              if (hash(i * 3 + b, sh + lv) < 0.12) continue;
              const bx = x0 + 3 + ((x1 - x0 - 6) * b) / n, bh = (0.45 + hash(b, i + sh) * 0.5) * ((fY - cY) / 8);
              line(bx, fy, bx + (hash(b, sh) < 0.1 ? 4 : 0), fy - bh);
            }
          }
        }
        if (!main) { line(0, fY + 6, W, fY + 6); line(0, cY - 6, W, cY - 6); }
      }
      g.globalAlpha = 1;
      if (!useArt) {
      g.fillStyle = "rgba(239,232,214,.5)"; g.fillRect(0, floorY + 7, W, 16); g.fillRect(0, ceilY - 23, W, 16);
      // the floor, the gallery above and the gallery below (cut views)
      g.strokeStyle = C.ink;
      line(0, floorY, W, floorY); line(0, floorY + 6, W, floorY + 6);
      line(0, ceilY, W, ceilY); line(0, ceilY - 6, W, ceilY - 6);
      for (let x = Math.floor(camX); x < camX + W / s + 1; x++) { line(X(x), ceilY - 6, X(x), ceilY - 22); line(X(x), floorY + 6, X(x) - 6, floorY + 20); }
      line(0, ceilY - 22, W, ceilY - 22);
      }

      // exits
      g.lineWidth = 1.2;
      const lab = (t, x, y) => { g.font = "italic 16px 'EB Garamond',Georgia,serif"; const w = g.measureText(t).width; g.fillStyle = "rgba(239,232,214,.92)"; g.fillRect(x - 4, y - 14, w + 8, 19); g.fillStyle = C.ink; g.fillText(t, x, y); };
      if (useArt) {
        if (seg.kind === "junction") { lab("up", X(ex.up) - 8, ceilY + 18); lab("down", X(ex.down) - 16, floorY - 8); lab("on", X(ex.on + 0.9) - 8, ceilY + 1.0 * s); }
        else if (seg.kind === "bend") { const ox = X(seg.L); g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, floorY); g.bezierCurveTo(ox + 2 * s, floorY - 1 * s, ox + 2 * s, ceilY + s, ox - 0.5 * s, ceilY + 0.5 * s); g.stroke(); lab("the aisle bends back", ox - 2.2 * s, ceilY + 0.3 * s); }
        else if (seg.kind === "book") lab(stg().book.toLowerCase(), X(seg.L - 1) - 0.9 * s, ceilY + 2.2 * s);
      } else if (seg.kind === "junction") {
        // ladder up through the ceiling
        const ux = X(ex.up);
        g.fillStyle = C.paper; g.fillRect(ux - 16, ceilY - 24, 32, 30);
        line(ux - 12, floorY, ux - 12, ceilY - 30); line(ux + 12, floorY, ux + 12, ceilY - 30);
        for (let r = floorY - 10; r > ceilY - 30; r -= 14) line(ux - 12, r, ux + 12, r);
        // hatch down through the floor
        const dx = X(ex.down);
        g.fillStyle = C.paper; g.fillRect(dx - 18, floorY - 1, 36, 9);
        g.strokeRect(dx - 18, floorY - 1, 36, 9);
        line(dx - 11, floorY - 14, dx - 11, floorY + 40); line(dx + 11, floorY - 14, dx + 11, floorY + 40);
        for (let r = floorY - 6; r < floorY + 40; r += 12) line(dx - 11, r, dx + 11, r);
        // the aisle on: an arch
        const ox = X(ex.on);
        g.beginPath(); g.moveTo(ox, floorY); g.lineTo(ox, ceilY + 1.2 * s); g.arc(ox + 0.9 * s, ceilY + 1.2 * s, 0.9 * s, Math.PI, 0); g.lineTo(ox + 1.8 * s, floorY); g.stroke();
        g.font = "italic 16px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink;
        g.fillText("up", ux - 8, ceilY - 30); g.fillText("down", dx - 14, floorY + 54); g.fillText("on", ox + 0.6 * s, ceilY + 1.2 * s - 6);
      } else if (seg.kind === "bend") {
        const ox = X(seg.L);
        g.beginPath(); g.moveTo(ox, floorY); g.bezierCurveTo(ox + 2 * s, floorY - 1 * s, ox + 2 * s, ceilY + s, ox - 0.5 * s, ceilY + 0.5 * s); g.stroke();
        g.font = "italic 16px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink; g.fillText("the aisle bends back", ox - 2.2 * s, ceilY + 0.3 * s);
      } else if (seg.kind === "book") {
        const bx = X(seg.L - 1);
        line(bx, floorY, bx, floorY - 1.1 * s); line(bx - 0.5 * s, floorY, bx + 0.5 * s, floorY);
        g.beginPath(); g.moveTo(bx - 0.6 * s, floorY - 1.1 * s); g.lineTo(bx + 0.6 * s, floorY - 1.3 * s); g.lineTo(bx + 0.6 * s, floorY - 1.0 * s); g.lineTo(bx - 0.6 * s, floorY - 0.85 * s); g.closePath();
        g.fillStyle = C.goldHi; g.fill(); g.stroke();
        g.font = "italic 16px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink; g.fillText("the calling book", bx - 0.9 * s, floorY - 1.6 * s);
      }
      // Maudric's ribbon: an old green bookmark hanging at one way of the junction
      if (seg.kind === "junction" && seg.ribbonExit) {
        const rx0 = X(seg.ribbonExit === "on" ? ex.on + 0.9 : ex[seg.ribbonExit]) + 0.55 * s, ry0 = ceilY + 0.5 * s;
        g.fillStyle = "#6f8f68"; g.strokeStyle = C.ink; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(rx0 - 7, ry0); g.lineTo(rx0 + 7, ry0); g.lineTo(rx0 + 7, ry0 + 1.5 * s); g.lineTo(rx0, ry0 + 1.5 * s - 9); g.lineTo(rx0 - 7, ry0 + 1.5 * s); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.arc(rx0, ry0 - 3, 4, 0, 7); g.stroke();
        lab("an old bookmark", rx0 + 12, ry0 + 0.8 * s);
      }
      if (seg.pinned && !useArt) { const lx0 = X(seg.lampX); g.fillStyle = "rgba(240,196,90,.35)"; g.beginPath(); g.arc(lx0, floorY - 1.6 * s, 0.9 * s, 0, 7); g.fill(); g.strokeStyle = C.ink; g.strokeRect(lx0 - 6, floorY - 1.7 * s, 12, 14); }
      g.lineWidth = 1;
      // rolling ladders on their rail
      for (const l of seg.ladders) {
        if (useArt) {   // a paper backing, so the moving ladder reads over the drawn shelves
          const lx0 = X(l.x);
          g.strokeStyle = C.paper; g.lineWidth = 7; line(lx0, ceilY + 0.3 * s, lx0 + 0.7 * s, floorY - 4); line(lx0 + 0.45 * s, ceilY + 0.3 * s, lx0 + 1.15 * s, floorY - 4);
          g.strokeStyle = C.ink; g.lineWidth = 1.8;
        }
        line(X(l.rail[0]), ceilY + 0.3 * s, X(l.rail[1]), ceilY + 0.3 * s);
        const lx = X(l.x);
        line(lx, ceilY + 0.3 * s, lx + 0.7 * s, floorY - 4); line(lx + 0.45 * s, ceilY + 0.3 * s, lx + 1.15 * s, floorY - 4);
        for (let r = 1; r < 9; r++) { const t = r / 9; line(lx + t * 0.7 * s, ceilY + 0.3 * s + t * (floorY - ceilY - 0.3 * s), lx + 0.45 * s + t * 0.7 * s, ceilY + 0.3 * s + t * (floorY - ceilY - 0.3 * s)); }
        g.beginPath(); g.arc(lx + 0.7 * s, floorY - 2, 3, 0, 7); g.arc(lx + 1.15 * s, floorY - 2, 3, 0, 7); g.stroke();
        g.lineWidth = 1;
      }
      // falling books: shadow first, then the book
      for (const b of seg.books) {
        const bx = X(b.x);
        if (b.state === "shadow") { if (useArt) { g.fillStyle = "rgba(42,42,42,.28)"; g.beginPath(); g.ellipse(bx, floorY - 2, 0.35 * s * (0.4 + b.t), 4, 0, 0, 7); g.fill(); } g.strokeStyle = C.ink; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(bx, floorY - 2, 0.35 * s * (0.4 + b.t), 4, 0, 0, 7); g.stroke(); g.setLineDash([]); }
        if (b.state === "fall" || b.state === "down") {
          const y = b.state === "fall" ? ceilY + (floorY - 10 - ceilY) * (b.t / 0.25) : floorY - 8;
          g.strokeStyle = C.ink; g.save(); g.translate(bx, y); g.rotate(b.state === "down" ? 0.1 : b.t * 4); if (useArt) { g.fillStyle = "#c58b3a"; g.fillRect(-12, -6, 24, 12); g.lineWidth = 1.5; } g.strokeRect(-12, -6, 24, 12); line(-9, -6, -9, 6); g.restore(); g.lineWidth = 1;
        }
      }
      // Elaris: a tall thin figure in a monk's robe, in the same single line
      let ey = floorY, ex2 = X(S.x);
      if (S.riding) ey = floorY - 0.9 * s;
      if (S.climb && !S.climb.fall) ey = floorY + (S.climb.dir === "up" ? -1 : 1) * S.climb.t * 2.4 * s;
      if (S.climb && S.climb.fall) ey = floorY - (0.8 - S.climb.t) * 2 * s;
      g.strokeStyle = C.ink; g.lineWidth = 1.2;
      const hgt = 2.4 * s, sway = S.stagger > 0 ? Math.sin(S.t * 20) * 4 : 0;
      const es = spr["sprite-elaris"];
      if (es) {
        const ih = hgt * (600 / 526), iw = ih * 0.8;
        const bob = Math.abs(S.v) > 0.2 && !S.climb && !S.riding ? Math.abs(Math.sin(S.x * 3)) * 0.03 * s : 0;
        g.save(); g.translate(ex2, ey - bob); if (S.stagger > 0) g.rotate(Math.sin(S.t * 20) * 0.08); g.scale(S.facing < 0 ? -1 : 1, 1);
        g.drawImage(es, -iw * 0.52, -ih * 0.943, iw, ih);
        g.restore();
      } else {
      g.beginPath(); g.moveTo(ex2 - 0.3 * s, ey); g.lineTo(ex2 - 0.12 * s + sway, ey - hgt * 0.78); g.lineTo(ex2 + 0.12 * s + sway, ey - hgt * 0.78); g.lineTo(ex2 + 0.3 * s, ey); g.closePath(); g.stroke();
      g.beginPath(); g.arc(ex2 + sway, ey - hgt * 0.86, 0.13 * s, 0, 7); g.stroke();
      const step = Math.sin(S.x * 3) * (Math.abs(S.v) > 0.2 ? 0.1 * s : 0);
      line(ex2 - 0.1 * s + sway, ey - hgt * 0.66, ex2 + S.facing * 0.32 * s + step, ey - hgt * 0.42);
      }
      g.lineWidth = 1;
      // the set-piece: the reading chair in the last aisle of the twist, drawn over Elaris, who walks past behind it
      if (seg.kind === "book" && stg().rebuild) {
        const cxm = seg.L * 0.4;
        if (useArt && spr["stacks-chair"]) { const T2 = (floorY - ceilY) * TILE_K; g.drawImage(spr["stacks-chair"], Math.round(X(cxm)), Math.round(ceilY - (4 / 400) * T2), Math.ceil(T2) + 1, Math.ceil(T2) + 1); }
        else { const bx = X(cxm + 2); g.fillStyle = C.paper; g.fillRect(bx - 0.8 * s, floorY - 2.2 * s, 1.6 * s, 2.2 * s); g.strokeStyle = C.ink; g.strokeRect(bx - 0.8 * s, floorY - 2.2 * s, 1.6 * s, 2.2 * s); g.beginPath(); g.arc(bx, floorY - 1.7 * s, 0.25 * s, 0, 7); g.stroke(); }
      }
      // motes: the only colour (grains for the sand book, drops for the weather book, flecks for the road book)
      const moteKind = stg().mote;
      for (const m of S.motes) {
        const mx = X(m.x), my = Y(m.y);
        if (mx < -10 || mx > W + 10) continue;
        g.fillStyle = m.life < 1 ? `rgba(196,140,30,${m.life.toFixed(2)})` : "#c48c1e";
        g.beginPath();
        if (moteKind === "sand") g.arc(mx, my, 3.4, 0, 7);
        else if (moteKind === "ink") { g.moveTo(mx - 6, my); g.lineTo(mx, my - 3.5); g.lineTo(mx + 6, my); g.lineTo(mx, my + 3.5); g.closePath(); }
        else { g.moveTo(mx, my - 8); g.quadraticCurveTo(mx + 5.5, my + 1.5, mx, my + 4.5); g.quadraticCurveTo(mx - 5.5, my + 1.5, mx, my - 8); }
        g.fill();
      }
      // listening: a dotted gold thread from Elaris to the way the drops go
      if (S.listening) {
        const right = seg.kind === "junction" ? answers[S.ribbon] : seg.kind === "book" ? "book" : null;
        if (right) {
          const tx = right === "up" ? X(ex.up) : right === "down" ? X(ex.down) : right === "on" ? X(ex.on + 1) : X(seg.L - 1);
          const ty = right === "up" ? ceilY - 20 : right === "down" ? floorY + 30 : floorY - 1.5 * s;
          g.strokeStyle = C.gold; g.lineWidth = 2.5; g.setLineDash([2, 6]); g.beginPath(); g.moveTo(X(S.x), floorY - 1.4 * s); g.quadraticCurveTo((X(S.x) + tx) / 2, floorY - 3.4 * s, tx, ty); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
        }
      }
      // flourishes: gold wash on a right turn, grey on a wrong one, a smudge on a hit
      if (S.flash > 0) {
        const a = Math.min(1, S.flash) * 0.35;
        g.fillStyle = S.flashKind === "right" ? `rgba(240,196,90,${a})` : S.flashKind === "wrong" ? `rgba(90,90,90,${a})` : S.flashKind === "turn" ? `rgba(60,70,90,${a * 1.3})` : `rgba(160,60,40,${a})`;
        g.fillRect(0, 0, W, H);
      }
      // the rebuild fade
      if (S.fade > 0) { g.fillStyle = `rgba(239,232,214,${S.fade.toFixed(2)})`; g.fillRect(0, 0, W, H); }

      // the bookmark ribbon across the top
      const rw = Math.min(W - 32, 560), rx = 16, ry = 12;
      g.fillStyle = "rgba(239,232,214,.96)"; g.fillRect(rx - 8, ry - 6, rw + 16, 50);
      g.strokeStyle = C.ink; g.strokeRect(rx - 8, ry - 6, rw + 16, 50);
      if (spr["ribbon-grown"] && spr["ribbon-empty"] && spr["ribbon-end"]) {
        // the bookmark ribbon, as drawn: a grown length per junction passed, its end at the last one
        const cw = rw / S.J;
        for (let j = 0; j < S.J; j++) g.drawImage(spr[j < S.ribbon - 1 ? "ribbon-grown" : j === S.ribbon - 1 ? "ribbon-end" : "ribbon-empty"], 0, 12, 300, 36, rx + cw * j, ry - 2, cw, 18);
        g.strokeStyle = C.ink; g.strokeRect(rx, ry - 2, rw, 18);
      } else {
      g.strokeRect(rx, ry, rw, 14);
      for (let j = 0; j < S.J; j++) {
        const x = rx + (rw / S.J) * j;
        if (j < S.ribbon) { g.fillStyle = C.gold; g.fillRect(x + 2, ry + 2, rw / S.J - 4, 10); }
        if (j) line(x, ry, x, ry + 14);
      }
      }
      // the call's badge: rain while the weather book calls, frost where nothing does
      const badge = spr[seg.kind === "bend" ? "mote-frost" : "mote-" + stg().mote];
      if (badge && W >= 700) { g.drawImage(badge, rx + rw + 16, ry - 6, 50, 50); g.strokeStyle = C.ink; g.strokeRect(rx + rw + 16, ry - 6, 50, 50); g.fillStyle = "rgba(239,232,214,.96)"; g.fillRect(rx + rw + 70, ry + 8, 150, 22); g.fillStyle = C.ink; g.font = "italic 15px 'EB Garamond',Georgia,serif"; g.fillText(seg.kind === "bend" ? "nothing calls here" : "the call: " + stg().call, rx + rw + 76, ry + 24); }
      g.fillStyle = C.ink; g.font = "600 15px 'EB Garamond',Georgia,serif";
      g.fillText(`junction ${Math.min(S.ribbon + 1, S.J)} of ${S.J}   ·   wrong turns ${S.wrong}   ·   ${Math.floor(S.t / 60)}:${String(Math.floor(S.t % 60)).padStart(2, "0")}`, rx, ry + 34);
      // the twist's two meters: the wicks, and how long the unwatched shelves will hold
      if (stg().rebuild) {
        const hold = seg.kind !== "junction" ? "" : seg.pinned ? "pinned by lamplight" : `the shelves hold ${Math.max(0, Math.ceil(S.rebuildT))} s`;
        const tx = `wicks ${"|".repeat(S.wicks) || "none"}${hold ? "   ·   " + hold : ""}   ·   ribbon lost ${S.loose} of 3`;
        g.font = "600 15px 'EB Garamond',Georgia,serif"; const tw = g.measureText(tx).width;
        g.fillStyle = "rgba(239,232,214,.96)"; g.fillRect(rx - 8, ry + 46, tw + 16, 24); g.strokeStyle = C.ink; g.strokeRect(rx - 8, ry + 46, tw + 16, 24);
        g.fillStyle = C.ink; g.fillText(tx, rx, ry + 63);
        if (seg.kind === "junction" && !seg.pinned) { g.fillStyle = S.rebuildT < 3 ? "#a3271a" : C.gold; g.fillRect(rx - 8, ry + 70, (tw + 16) * Math.max(0, S.rebuildT / stg().rebuild), 4); }
      }
      // prompt near an exit or ladder
      let prompt = "";
      if (!S.climb && seg.kind === "junction") {
        if (Math.abs(S.x - ex.up) < 0.8) prompt = "▲ climb up";
        else if (Math.abs(S.x - ex.down) < 0.8) prompt = "▼ climb down";
      }
      if (!S.riding && seg.ladders.some((l) => Math.abs(l.x - S.x) < 1.2)) prompt = prompt || "Grab (E) the rolling ladder";
      if (S.riding) prompt = "riding: push ▶, Grab to step off";
      if (prompt) { g.font = "italic 16px 'EB Garamond',Georgia,serif"; const pw2 = g.measureText(prompt).width; const px2 = Math.max(8, Math.min(W - pw2 - 8, X(S.x) - 40)); g.fillStyle = "rgba(239,232,214,.9)"; g.fillRect(px2 - 4, Y(2.9) - 15, pw2 + 8, 21); g.fillStyle = C.ink; g.fillText(prompt, px2, Y(2.9)); if (spr["glyph-climb"] && prompt.includes("climb")) g.drawImage(spr["glyph-climb"], Math.max(4, px2 - 48), Y(2.9) - 30, 40, 40); }
      if (S.msgT > 0) {
        g.font = "italic 17px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        const maxW = Math.min(W - 32, 640), words = S.msg.split(" "), lines = []; let ln = "";
        for (const w of words) { const t = ln ? ln + " " + w : w; if (g.measureText(t).width > maxW && ln) { lines.push(ln); ln = w; } else ln = t; }
        lines.push(ln);
        const top = floorY + 40;
        g.fillStyle = "rgba(239,232,214,.95)"; g.fillRect(W / 2 - maxW / 2 - 10, top, maxW + 20, lines.length * 22 + 12);
        g.strokeStyle = C.ink; g.strokeRect(W / 2 - maxW / 2 - 10, top, maxW + 20, lines.length * 22 + 12);
        g.fillStyle = C.ink; lines.forEach((l, i) => g.fillText(l, W / 2, top + 22 + i * 22)); g.textAlign = "left";
      }
    }

    let raf = 0, last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (S.started && !S.done) update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play">
      ${art.has("heading-c5") ? `<img class="${P}head" src="${art.url("heading-c5")}" alt="">` : ""}
      <svg viewBox="0 0 400 70" aria-hidden="true" ${art.has("heading-c5") ? 'style="display:none"' : ""}><g fill="none" stroke="${C.ink}" stroke-width="1">
        <path d="M0 60 H400 M0 10 H400 M40 10 L60 30 H340 L360 10 M60 30 V60 M340 30 V60 M120 30 V60 M200 30 V60 M280 30 V60"/>
        <path d="M70 30 v-8 M80 30 v-12 M90 30 v-9 M150 30 v-10 M160 30 v-7 M220 30 v-11 M300 30 v-9"/>
        <path d="M372 10 V60 M388 10 V60 M372 20 H388 M372 30 H388 M372 40 H388 M372 50 H388"/></g>
        <g fill="${C.gold}">${[60, 100, 140, 180, 220, 260, 300, 330, 350, 365].map((x, i) => `<circle cx="${x}" cy="${46 - i * 3.6}" r="${1.5 + i * 0.2}"/>`).join("")}</g></svg>
      <h2>The stacks</h2>
      <p class="${P}goal"><b>Goal:</b> follow the motes to the calling book. Three visits: teach, test, twist. You can stop after any of them.</p>
      <dl>
        <dt>◀ ▶ · A D</dt><dd>Walk. Keep going to run.</dd>
        <dt>▲ ▼ · W S</dt><dd>At a junction: the ladder up, the hatch down, or walk on.</dd>
        <dt>shadow</dt><dd>A book's shadow means it falls in a second.</dd>
      </dl>
      ${art.has("mote-rain") ? `<p class="${P}legend"><span>${pic("mote-rain")}this book calls in rain</span><span>${pic("mote-sand")}${pic("mote-ink")}others in sand or ink</span><span>${pic("mote-frost")}frost: nothing calls</span></p>` : ""}
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${STG.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.name.split(":")[0]}</button>`).join("")}</div>` : ""}
      <button type="button" class="${P}go">Into the stacks</button></div>`;
    el.appendChild(intro);
    let startAt = 0;
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { startAt = +b.dataset.s; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); }));
    intro.querySelector("." + P + "go").addEventListener("click", () => { intro.remove(); startStage(startAt); });
    intro.querySelector("." + P + "go").focus();

    return {
      unmount() {
        alive = false;
        cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect();
        removeEventListener("keydown", onDown); removeEventListener("keyup", onUp);
        for (const [b, d, u] of ptr) { b.removeEventListener("pointerdown", d); b.removeEventListener("pointerup", u); b.removeEventListener("pointercancel", u); b.removeEventListener("pointerleave", u); }
      },
    };
  },
};

// WrymWretch · Forgetting run (2D, Graphite sketch being erased). DESIGN.md section 10, Mode B;
// scene s_run_outpost (chapter 1, section 8): Thalen runs to the outpost as the forest erases behind.
// Tutorial numbers: 3 touchstones, edge at 4.0 m/s, +10% each checkpoint.
//
// Ahead the path is faint outline; hold or tap Recall to make the next 6 m solid for 3 s (Focus, 10 a
// second held, 3 to start). Touchstones (lit lanterns) refill +30; standing on remembered ground
// gives back 5 a second (added for fairness). The blank-paper edge follows.
// Caught or fallen: back to the last checkpoint (the first catch costs Cedarheart memory -3).
// Three stretches, one per checkpoint:
//   I   The groves. Remembered ground, then the first outlines: Recall.
//   II  The greying moss. Grey ground crumbles a moment after Thalen lands on it; Recall holds it.
//   III The stag. The edge quickens; Dash (spend 15 Focus for a burst) unlocks to outrun it.
// The prototype adds a loss: the fourth setback, the outpost is forgotten. After two losses in a row
// the edge is slowed by 30% (the design's own accessibility option), kept in api.store.
//
// Quoted, verbatim as DESIGN.md section 3 quotes them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "into dust that didn’t even remember how to be soil" (WW 33)
//   "The forest is… forgetting," he managed. "Something is making it forget." (WW 39)
//
// Art (games/wrymwretch/art): the run's own sketch set, taken apart by layer: its hill and firs scroll
// behind the path, its palisade gates stand at the end and ink in as Thalen nears them; the West seal
// carries Cedarheart's memory in the HUD; chapter card 1 behind the how-to; the Record behind the
// result. Without the art the mode draws its own firs and gate, as before.

import { raster, opening } from "./_art.js";
import { staged } from "./_stages.js";

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder.
//   I   Teach, to the outpost gates (s_run_outpost): Recall an outline. As above, on a shorter path.
//   II  Test, the surface light (s_run_surface): Lunessa climbs for the surface as the blank comes on.
//       False outlines (new): a real outline throws a shadow under its line; a false one throws none.
//       Recalling a false one burns 8 Focus and holds nothing, so the gap under it has to be jumped.
//   III Twist, the bone bridge (s_run_bone_bridge): someone else has to cross what you remember. Ilvarra
//       follows and stands only on ground that is solid when she reaches it, so the old safe move
//       (Recall just enough for yourself and run) now leaves her behind for the edge. Recall reaches
//       8 m behind as well as 6 m ahead. Set-piece: halfway over she stops, drawn in outline. The curse
//       has taken why she is running. Stand by her and hold Recall: you Recall a person.
//       Names become ground (layer link 1): each name kept in Concentration's ward is a lit lantern on
//       the bridge with that name on it; a name lost leaves its stretch dark (no lantern, and the
//       outline there is not drawn until it is Recalled).
const LADDER = [
  { key: "outpost", name: "To the outpost gates", sub: "Recall an outline.", len: 240, cps: [80, 160], touch: [60, 130, 205], edge: 4.0, seal: "west", realm: "CEDARHEART", art: "run-outpost", chapter: "chapter-01", hero: "Thalen", goal: "GATES" },
  { key: "surface", name: "The surface light", sub: "Climb as the blank rises; not every outline is true.", len: 240, cps: [80, 160], touch: [55, 125, 200], edge: 3.6, seal: "east", realm: "TIDECALLER", art: "run-surface", chapter: "chapter-04", hero: "Lunessa", goal: "SURFACE" },
  { key: "bridge", name: "The bone bridge", sub: "Someone else has to cross what you remember.", len: 250, cps: [85, 170], touch: [60, 150, 215], edge: 3.3, seal: "wrymreach", realm: "THE BRIDGE", art: "run-bone-bridge", chapter: "chapter-09", hero: "Thalen", goal: "FAR SIDE" },
];
const WARD = ["Maerith", "Illeth", "Corvane", "Dovra", "Hesk", "Ansel"];

const PAPER = "#f1e8d6", BLANK = "#f8f3e8", GRAPHITE = "#45464a", LEAD = "#2c2d30", FAINT = "#8f8a7e", LAMP = "#f6d27a", MOSS = "#8c8f86";
const VIEW_H = 14, RUN = 6, DASH = 10.5, GRAV = 30, JUMP = 11.2, EDGE0 = 4.0;

const CSS = `
.wrymwretch-forgetting-run-root{position:absolute;inset:0;background:${PAPER};overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Georgia,serif}
.wrymwretch-forgetting-run-root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.wrymwretch-forgetting-run-pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;padding:10px 12px;pointer-events:none}
.wrymwretch-forgetting-run-pad div{display:flex;gap:8px;pointer-events:auto}
.wrymwretch-forgetting-run-pad button{font:700 14px ui-monospace,Menlo,monospace;min-width:54px;min-height:48px;padding:4px 10px;color:${LEAD};background:rgba(248,243,232,.92);border:1.5px solid ${GRAPHITE};border-radius:2px;cursor:pointer;touch-action:none;transition:background .12s,color .12s}
.wrymwretch-forgetting-run-pad button:hover:not(:disabled){background:#fff}
.wrymwretch-forgetting-run-pad button.on{background:${GRAPHITE};color:${BLANK}}
.wrymwretch-forgetting-run-pad button:disabled{opacity:.38}
.wrymwretch-forgetting-run-pad button[hidden]{display:none}
.wrymwretch-forgetting-run-note{position:absolute;right:16px;top:14px;width:min(360px,calc(100% - 32px));box-sizing:border-box;background:${BLANK};color:${LEAD};padding:12px 16px 12px 18px;font:italic 17px/1.35 Georgia,serif;border-left:3px solid ${GRAPHITE};box-shadow:2px 3px 0 rgba(69,70,74,.18);transform:rotate(-.6deg);opacity:0;transition:opacity .5s;pointer-events:none}
.wrymwretch-forgetting-run-note.on{opacity:1}
.wrymwretch-forgetting-run-note small{display:block;font:600 13px ui-monospace,Menlo,monospace;font-style:normal;margin-top:5px;color:${GRAPHITE}}
.wrymwretch-forgetting-run-intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(241,232,214,.78);overflow:auto}
.wrymwretch-forgetting-run-page{position:relative;width:min(440px,100%);box-sizing:border-box;background:repeating-linear-gradient(${BLANK} 0 29px,#dfe3e6 29px 30px);border:1.5px solid ${GRAPHITE};padding:22px 22px 18px 46px;color:${LEAD};box-shadow:4px 5px 0 rgba(69,70,74,.2)}
.wrymwretch-forgetting-run-page::before{content:"";position:absolute;left:14px;top:14px;bottom:14px;width:12px;background:radial-gradient(circle,${PAPER} 0 4px,${GRAPHITE} 4.5px 6px,transparent 6.5px) 0 0/12px 26px repeat-y}
.wrymwretch-forgetting-run-page h2{font:700 22px ui-monospace,Menlo,monospace;margin:0;letter-spacing:.04em;text-transform:uppercase}
.wrymwretch-forgetting-run-page .goal{font:italic 18px/1.3 Georgia,serif;margin:6px 0 12px}
.wrymwretch-forgetting-run-keys{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;font-size:16px;margin:0 0 12px}
.wrymwretch-forgetting-run-keys kbd{font:700 13px ui-monospace,monospace;border:1.5px solid ${GRAPHITE};padding:1px 6px;background:#fff;white-space:nowrap}
.wrymwretch-forgetting-run-page .more{font-size:15px;color:${GRAPHITE};margin:0 0 12px}
.wrymwretch-forgetting-run-page .gentle{font-size:15px;margin:0 0 12px;text-decoration:underline wavy ${FAINT}}
.wrymwretch-forgetting-run-page button{font:700 15px ui-monospace,Menlo,monospace;padding:10px 24px;background:${GRAPHITE};color:${BLANK};border:0;cursor:pointer;min-height:44px}
.wrymwretch-forgetting-run-page button:hover{background:${LEAD}}
@media (max-width:520px){.wrymwretch-forgetting-run-note{top:112px;right:10px;width:calc(100% - 20px);font-size:16px}}
`;

function play(root, api, ctx) {
    const ST = ctx.stage, CFG = LADDER[ST], LEN = CFG.len, CLIMB = ST === 1, ESCORT = ST === 2;
    const ward = ESCORT ? (api.shared && api.shared.get("ward", null)) : null;   // { kept: [names], lost: [names] } from Concentration I
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-forgetting-run-root";
    wrap.innerHTML = `<style>${CSS}</style><canvas></canvas>
      <div class="wrymwretch-forgetting-run-pad">
        <div><button type="button" data-k="left" aria-label="Left">◀</button><button type="button" data-k="right" aria-label="Right">▶</button></div>
        <div><button type="button" data-k="dash" hidden>DASH</button><button type="button" data-k="recall">RECALL</button><button type="button" data-k="jump">JUMP</button></div>
      </div>
      <div class="wrymwretch-forgetting-run-note" aria-live="polite"></div>
      <div class="wrymwretch-forgetting-run-intro"><div class="wrymwretch-forgetting-run-page">
        <h2>Forgetting run</h2>
        <div data-tabs></div>
        ${[`<p class="goal">Get Thalen to the outpost gates before the blank page catches him.</p>
        <div class="wrymwretch-forgetting-run-keys">
          <span><kbd>A</kbd> <kbd>D</kbd> ◀ ▶</span><span>run</span>
          <span><kbd>W</kbd> <kbd>Space</kbd></span><span>jump the gaps</span>
          <span><kbd>Shift</kbd> RECALL</span><span>faint outline turns solid for 3 s; costs Focus. A tap is enough</span>
        </div>
        <p class="more">Lanterns and remembered ground give Focus back. One more trick unlocks on the way.</p>`,
        `<p class="goal">Bring Lunessa up from the monolith to the surface light.</p>
        <div class="wrymwretch-forgetting-run-keys">
          <span>a true outline</span><span>throws a shadow under its line: Recall it and it holds</span>
          <span>a false outline</span><span>new: no shadow. Recall burns 8 Focus on it and holds nothing. Jump what it covers</span>
          <span><kbd>X</kbd> DASH</span><span>a burst for 15 Focus, from the start</span>
        </div>
        <p class="more">The way goes up. Air bubbles give Focus back, as lanterns did.</p>`,
        `<p class="goal">Cross the bone bridge with Ilvarra, last of the Wyrmguard.</p>
        <div class="wrymwretch-forgetting-run-keys">
          <span>Ilvarra</span><span>turned over: she follows, and stands only on ground that is solid when she reaches it</span>
          <span><kbd>Shift</kbd> RECALL</span><span>now holds 8 m behind you as well. Do not outrun her: the edge takes whoever is last</span>
          <span>the far side</span><span>opens only when both of you are there</span>
        </div>
        <p class="more">The lanterns on the bridge are the names somebody kept.</p>`][ST]}
        ${gentle ? `<p class="gentle">The edge is slower this time (by a third).</p>` : ""}
        <button type="button" data-start>Run</button></div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const intro = wrap.querySelector(".wrymwretch-forgetting-run-intro");
    const noteEl = wrap.querySelector(".wrymwretch-forgetting-run-note");
    const dashBtn = wrap.querySelector('[data-k="dash"]');
    const rm = api.reducedMotion;
    const EDGE_K = gentle ? 0.7 : 1;
    const timers = new Set();
    const A = { far: null, gate: null, seal: null };
    let dead = false;
    raster(api.art, CFG.art, { w: 1280, strip: [".plate", ".fore", ".gate", ".label"] }).then((c) => { if (!dead) A.far = c; });
    if (ST === 0) raster(api.art, "run-outpost", { w: 1600, strip: [".plate", ".far", ".fore"] }).then((c) => { if (!dead) A.gate = c; });
    raster(api.art, "ui-seal-" + CFG.seal, { w: 96, strip: [".plate"] }).then((c) => { if (!dead) A.seal = c; });

    // ---- the level --------------------------------------------------------------------------
    const R = api.rng("wrymwretch/forgetting-run/" + CFG.key);
    const segs = [{ x0: -20, x1: 14, y: 10, kind: "solid", t: 0 }];
    const CPS = CFG.cps;
    let x = 14, y = 10;
    while (x < LEN + 10) {
      let gap = x < 30 ? 1.2 : 0.8 + R() * 1.1;
      // II: a false outline lies over a wider gap; it has to be jumped
      if (CLIMB && x > 40 && x < LEN - 24 && R() < 0.24 && !CPS.some((c) => Math.abs(c - x) < 14)) { gap = 2.1; segs.push({ x0: x + 0.05, x1: x + gap - 0.05, y, kind: "false", t: 0, crumble: -1, gone: false, burned: 0 }); }
      x += gap;
      y = CLIMB ? y - (x < 30 ? 0 : -0.3 + R() * 1.3) : Math.max(7.5, Math.min(11.5, y + (R() - 0.5) * 2.4));
      let len = 6 + R() * 5;
      const cp = CPS.find((c) => c >= x - 2 && c < x + len + 2);
      const roll = R();
      let kind = x > LEN - 4 ? "solid" : cp ? "solid" : x < 26 ? "solid" : roll < (ESCORT ? 0.5 : 0.62) ? "outline" : "solid";
      if (!ST && kind === "solid" && x > CPS[0] + 6 && x < LEN - 6 && !cp && roll > 0.8) kind = "grey";
      if (!ST && kind === "outline" && x > CPS[0] + 6 && x < CPS[1] && roll < 0.2) kind = "grey";
      if (ESCORT && x < 133 && x + len > 124) { kind = "solid"; len = Math.max(len, 12); }   // where she stops: remembered ground
      segs.push({ x0: x, x1: x + len, y, kind, t: 0, crumble: -1, gone: false });
      x += len;
    }
    const last = segs[segs.length - 1]; last.x1 = Math.max(last.x1, LEN + 12);
    const checkpoints = [{ x: 2, y: 10 }].concat(CPS.map((c) => { const sg = segs.find((q) => q.x1 > c && q.kind === "solid" && q.x0 >= c - 6) || segs[1]; return { x: sg.x0 + 1, y: sg.y }; }));
    // III with the ward played: six lantern posts, one per name; a kept name is lit, a lost one leaves its stretch dark
    const posts = ward ? WARD.map((name, i) => ({ c: 28 + i * 36, name, kept: (ward.kept || []).includes(name) })) : CFG.touch.map((c) => ({ c, name: "", kept: true }));
    const touch = posts.filter((p) => p.kept).map((p) => { const sg = segs.find((q) => q.kind === "solid" && q.x0 > p.c) || last; return { x: (sg.x0 + sg.x1) / 2, y: sg.y, lit: true, glow: 0, name: p.name }; });
    const darkPosts = posts.filter((p) => !p.kept);
    for (const p of darkPosts) for (const sg of segs) if (sg.kind === "outline" && (sg.x0 + sg.x1) / 2 > p.c - 6 && (sg.x0 + sg.x1) / 2 < p.c + 30) sg.dark = true;
    const trees = []; for (let k = 0; k < 90; k++) trees.push({ x: k * 6 + R() * 5, h: 1.4 + R() * 1.6, y: 6 + R() * 1.5 });
    const firstOutline = segs.find((q) => q.kind === "outline");

    // ---- state ------------------------------------------------------------------------------
    const il = ESCORT ? { x: -1.5, y: 10, lost: false, found: false, hold: 0, hop: null, wait: 0, t: 0 } : null;   // Ilvarra
    const s = { camY: 0, falses: 0, x: 2, y: 10, vx: 0, vy: 0, ground: null, focus: 100, edge: ESCORT ? -18 : -8, edgeV: CFG.edge * EDGE_K, dashOn0: ST > 0, cp: 0, setbacks: 0, firstCatch: false,
      recalling: false, wasRecalling: false, t: 0, running: false, over: false, face: 1, dash: 0, dashCd: 0, dashOn: false,
      smudge: 0, tick: 0, recalls: 0, dashes: 0, lamps: 0, beats: new Set(), stag: null };
    const keys = { left: false, right: false, recall: false, jump: false, dash: false };
    let W = 1, H = 1, scale = 1, dpr = 1, oy = 0;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, wrap.clientWidth); H = Math.max(1, wrap.clientHeight); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); scale = Math.min(H / VIEW_H, W / 22); oy = (H - VIEW_H * scale) * 0.55; draw(); };
    const camX = () => s.x - (W * 0.36) / scale;
    const sx = (wx) => (wx - camX()) * scale, sy = (wy) => (wy - s.camY) * scale + oy;
    const solid = (sg) => !sg.gone && (sg.kind === "solid" || sg.kind === "grey" || sg.t > 0);

    let noteT = null;
    function note(html, ms = 4500) {
      noteEl.innerHTML = html; noteEl.classList.add("on");
      if (noteT) { clearTimeout(noteT); timers.delete(noteT); }
      noteT = setTimeout(() => { timers.delete(noteT); noteEl.classList.remove("on"); }, ms); timers.add(noteT);
    }
    const once = (id, html, ms) => { if (s.beats.has(id)) return; s.beats.add(id); note(html, ms); };

    function setback(caught, quiet) {
      s.setbacks++; s.smudge = 1;
      if (s.setbacks >= 4) return finish(false);
      if (quiet) { /* the caller has said why */ }
      else if (caught && !s.firstCatch) { s.firstCatch = true; note(`The white closes over his heels. Cedarheart memory −3. <small>back to the last post · ${4 - s.setbacks} left</small>`, 3600); }
      else note(caught ? `Caught. Back to the last post. <small>${4 - s.setbacks} setback${4 - s.setbacks === 1 ? "" : "s"} left</small>` : `He falls through ground that was never remembered. <small>back to the last post · ${4 - s.setbacks} left</small>`, 3200);
      const c = checkpoints[s.cp];
      s.x = c.x; s.y = c.y; s.vx = 0; s.vy = 0; s.ground = null; s.edge = c.x - (ESCORT ? 17 : 12); s.dash = 0;
      if (CLIMB) s.camY = s.y - 9.5;
      if (il) { il.x = c.x - 0.7; il.y = c.y; il.hop = null; il.hold = 0; }
      s.focus = Math.max(s.focus, 50);
      segs.forEach((sg) => { sg.t = 0; sg.crumble = -1; sg.gone = false; });
    }
    function finish(win) {
      if (s.over) return;
      s.over = true; s.running = false;
      api.store.set("losses", win ? 0 : losses + 1);
      const pct = Math.round(Math.min(1, s.x / LEN) * 100), again = losses + 1 >= 2 ? " Next time the edge will come slower." : "";
      if (CLIMB) return ctx.done(wrap, { win, record: { realm: "east", title: "Forgetting run II: the surface light", sub: "Tidecaller page · chapter 4, The Monolith", divider: 2, lines: [
        win ? "The surface, reached. What she read on the monolith came up with her." : { t: `The surface light: lost, ${pct}% of the way up.`, kind: "lost" },
        `False outlines trusted: ${s.falses}. Air found: ${s.lamps} of ${touch.length}. Setbacks: ${s.setbacks} of 4.`,
        s.firstCatch ? { t: "Tidecaller memory −3: the blank caught her once.", kind: "lost" } : "Tidecaller memory untouched by the blank." ] },
        text: win ? `Lunessa breaks the surface into grey light, ${s.setbacks ? `after ${s.setbacks} setback${s.setbacks > 1 ? "s" : ""}` : "untouched by the blank"}${s.falses ? `, having spent Focus on ${s.falses} outline${s.falses > 1 ? "s" : ""} that held nothing` : ", and not one false outline trusted"}. Behind her the water has no depth any more, only white.`
          : `The blank closes over the climb a fourth time, ${pct}% of the way to the light. What Lunessa read at the monolith stays under it.${again}` });
      if (ESCORT) { const names = touch.filter((t) => t.name).map((t) => t.name), dark = darkPosts.map((p) => p.name);
        return ctx.done(wrap, { win, record: { realm: "wrymreach", title: "Forgetting run III: the bone bridge", sub: "The Rim · chapter 9, The Last Witness", divider: 2, lines: [
        win ? "The far side of the bone bridge, reached by two." : { t: `The far side: not reached. ${pct}% of the bridge was crossed.`, kind: "lost" },
        il.found ? "Halfway over, Ilvarra forgot why she was running. She was Recalled, as a ledge is." : { t: "Ilvarra, in outline on the bridge: not Recalled.", kind: "lost" },
        ...names.map((n) => ({ t: `${n}'s lantern stood on the bridge.`, kind: "link" })),
        ...dark.map((n) => ({ t: `${n}: no lantern. That stretch was dark.`, kind: "lost" })),
        ward ? { t: `Lanterns: ${names.length} of 6.`, note: "Names become ground: each name kept in the ward (Concentration I) is a lit lantern here." } : { t: "The ward was never visited: the bridge had only its three plain lanterns.", note: "Names become ground: keep the ward's names in Concentration and their lanterns stand here." },
        `Setbacks: ${s.setbacks} of 4.` ] },
        text: win ? `Thalen and Ilvarra step off the last rib together${s.setbacks ? `, after ${s.setbacks} setback${s.setbacks > 1 ? "s" : ""}` : ""}. Halfway over she had stopped, not knowing why she ran, and he held her in mind until she did.${names.length ? ` ${names.length} lantern${names.length > 1 ? "s" : ""} with a kept name lit the way${dark.length ? `; ${dark.join(" and ")} left ${dark.length > 1 ? "their stretches" : "a stretch"} dark` : ""}.` : ""} She does not thank him. She says the name of her dragon, to see whether it is still there.`
          : `The blank takes the bridge a fourth time, ${pct}% of the way over${il.lost ? ", with Ilvarra still standing in outline where she stopped" : ""}. The Remnants will not need their list for her.${again}` }); }
      ctx.done(wrap, { win, record: { realm: "west", title: "Forgetting run I: to the outpost gates", sub: "Cedarheart page · chapter 1, The Forest Is Forgetting", divider: 2, lines: [
        win ? "The outpost gates, reached and inked in. The rangers will hear what Thalen saw." : { t: `The outpost gates: forgotten, ${Math.round(Math.min(1, s.x / LEN) * 100)}% of the way there.`, kind: "lost" },
        `Touchstones lit: ${s.lamps} of 3. Setbacks: ${s.setbacks} of 4.`,
        s.firstCatch ? { t: "Cedarheart memory −3: the edge caught him once.", kind: "lost" } : "Cedarheart's memory untouched by the edge.",
      ] }, text: (win
        ? { outcome: "win", text: `The outpost gates ink in and Thalen is through, ${s.setbacks ? `after ${s.setbacks} setback${s.setbacks > 1 ? "s" : ""}` : "untouched by the edge"}, with ${Math.round(s.focus)} Focus left. The rangers look up. “The forest is… forgetting,” he managed. “Something is making it forget.” (WW 39)` }
        : { outcome: "lose", text: `The blank page closes over the path a fourth time, ${Math.round(Math.min(1, s.x / LEN) * 100)}% of the way to the gates. The outpost never hears what Thalen saw at the split tree.${losses + 1 >= 2 ? " Next time the edge will come slower." : ""}` }).text });
    }

    // III: Ilvarra. She walks behind, hops a gap when the far ledge is solid, and waits when it is not.
    function escort(dt) {
      il.t += dt;
      if (il.hop) { il.hop.u += dt / il.hop.d; const u = Math.min(1, il.hop.u); il.x = il.hop.x0 + (il.hop.x1 - il.hop.x0) * u; il.y = il.hop.y0 + (il.hop.y1 - il.hop.y0) * u - Math.sin(u * Math.PI) * 0.9; if (u >= 1) il.hop = null; return; }
      const on = segs.find((q) => il.x >= q.x0 - 0.3 && il.x <= q.x1 + 0.3 && q.kind !== "false");
      if (on && !solid(on)) { note(`The ledge under Ilvarra was only ever held in your mind, and you let it go. <small>back to the last post · ${Math.max(0, 3 - s.setbacks)} left</small>`, 3600); return setback(false, true); }
      if (on) il.y = on.y;
      if (!il.found && !il.lost && il.x > 126) {
        il.lost = true;
        note(`Halfway over, Ilvarra stops. The curse has taken why she is running. She stands in outline, like a ledge the bridge has half forgotten. <small>go back to her and hold Shift / RECALL</small>`, 9000);
      }
      if (il.lost) {
        if (s.recalling && Math.abs(s.x - il.x) < 3.2) { il.hold += dt; if (il.hold >= 1.3) { il.lost = false; il.found = true; note(`You Recall a person. Line by line she inks back in: the grey braid, the wyrm crest, the reason. <q>The list,</q> she says. <q>They are behind us.</q> <small>she follows again</small>`, 7000); } }
        else il.hold = Math.max(0, il.hold - dt * 0.5);
        return;
      }
      const want = s.x - 2.4;
      if (want <= il.x + 0.05) return;
      const nx = Math.min(want, il.x + 5.8 * dt);
      if (on && nx > on.x1) {
        const nxt = segs.find((q) => q.x0 > on.x1 - 0.01 && q.kind !== "false");
        if (nxt && solid(nxt) && (nxt.kind === "solid" || nxt.t > 0.5) && s.x > nxt.x0 + 0.6) il.hop = { x0: il.x, x1: nxt.x0 + 0.5, y0: il.y, y1: nxt.y, u: 0, d: 0.34 };
        else { il.x = on.x1; il.wait += dt; if (nxt && !solid(nxt) && s.x > nxt.x1) once("wait", `Ilvarra stops at the end of the remembered ground. The ledge ahead of her is outline again. <small>Recall reaches 8 m behind you: hold it for her</small>`, 5200); }
      } else il.x = nx;
    }

    function step(dt) {
      s.t += dt; s.smudge = Math.max(0, s.smudge - dt * 1.4); s.tick = Math.max(0, s.tick - dt);
      s.dash = Math.max(0, s.dash - dt); s.dashCd = Math.max(0, s.dashCd - dt);
      touch.forEach((t) => (t.glow = Math.max(0, t.glow - dt)));
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) s.face = dir;
      if (s.dashOn0 && !s.dashOn) { s.dashOn = true; dashBtn.hidden = false; }
      if (CLIMB) s.camY += (s.y - 9.5 - s.camY) * Math.min(1, 4 * dt);
      for (const sg of segs) if (sg.burned > 0) sg.burned = Math.max(0, sg.burned - dt);
      if (keys.dash && s.dashOn && s.dashCd <= 0 && s.focus >= 15) { s.focus -= 15; s.dash = 1.1; s.dashCd = 2.5; s.dashes++; }
      keys.dash = false;
      const speed = s.dash > 0 ? DASH : RUN;
      const want = s.dash > 0 ? s.face * speed : dir * speed;
      s.vx += (want - s.vx) * Math.min(1, (s.ground ? 12 : 5) * dt);
      // a jump pressed a moment early, or a moment after the ledge ends, still counts
      if (keys.jump) s.jumpBuf = 0.14; else s.jumpBuf = Math.max(0, (s.jumpBuf || 0) - dt);
      s.coyote = s.ground ? 0.14 : Math.max(0, (s.coyote || 0) - dt);
      if (s.jumpBuf > 0 && (s.ground || s.coyote > 0) && s.vy >= 0) { s.vy = -JUMP; s.ground = null; s.coyote = 0; s.jumpBuf = 0; }
      keys.jump = false;
      s.recalling = keys.recall && s.focus > 0;
      if (s.recalling) {
        if (!s.wasRecalling) { s.focus = Math.max(0, s.focus - 3); s.recalls++; }
        s.focus = Math.max(0, s.focus - 10 * dt);
        for (const sg of segs) if ((sg.kind === "outline" || sg.kind === "grey") && sg.x1 > s.x - (ESCORT ? 8 : 0.5) && sg.x0 < s.x + 6) { sg.t = 3; if (sg.kind === "grey") { sg.crumble = -1; sg.gone = false; } }
        for (const sg of segs) if (sg.kind === "false" && !s.wasRecalling && sg.x1 > s.x - 0.5 && sg.x0 < s.x + 6 && sg.burned <= 0) { sg.burned = 2.2; s.focus = Math.max(0, s.focus - 8); s.falses++; once("false", `That outline throws no shadow. Lunessa reaches for it and there is nothing to remember: the stone was never there. <small>Focus −8 · jump what a false outline covers</small>`, 5600); }
      }
      s.wasRecalling = s.recalling;
      // remembered ground steadies him: Focus comes back slowly while he stands on it
      if (!s.recalling && s.ground && s.ground.kind === "solid") s.focus = Math.min(100, s.focus + 5 * dt);
      for (const sg of segs) if (sg.t > 0) sg.t = Math.max(0, sg.t - dt);
      // grey moss crumbles under his feet unless it is held by Recall
      for (const sg of segs) if (sg.kind === "grey" && sg.crumble >= 0 && sg.t <= 0) { sg.crumble += dt; if (sg.crumble > 0.9) sg.gone = true; }
      const prevY = s.y;
      s.vy += GRAV * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      s.ground = null;
      for (const sg of segs) {
        if (!solid(sg) || s.x < sg.x0 - 0.2 || s.x > sg.x1 + 0.2) continue;
        if (s.vy >= 0 && prevY <= sg.y + 0.05 && s.y >= sg.y) { s.y = sg.y; s.vy = 0; s.ground = sg; if (sg.kind === "grey" && sg.crumble < 0 && sg.t <= 0) sg.crumble = 0; }
      }
      for (const ts of touch) if (ts.lit && Math.abs(s.x - ts.x) < 0.9 && Math.abs(s.y - ts.y) < 1.5) {
        ts.lit = false; ts.glow = 1.2; s.lamps++; s.focus = Math.min(100, s.focus + 30);
        note(ts.name ? `${ts.name}'s lantern, with the name tied to it on a slip. Somebody kept it. <small>Focus +30</small>` : CLIMB ? "A pocket of air under a ledge, silver as a coin. <small>Focus +30</small>" : ESCORT ? "A lantern on a rib of the bridge. <small>Focus +30</small>" : ["A ranger's lantern, still lit. He remembers lighting it. <small>Focus +30</small>", "The lantern at the old ford. <small>Focus +30</small>", "The last lantern before the gates. <small>Focus +30</small>"][s.lamps - 1] || "Focus +30", 2600);
      }
      for (let i = checkpoints.length - 1; i > s.cp; i--) if (s.x >= checkpoints[i].x) {
        s.cp = i; s.edgeV *= 1.1; s.tick = 1.2;
        if (ST) { if (i === 1) note(CLIMB ? `The water is the colour of the page now. Above, the light has a shape. <small>the blank comes faster</small>` : `The first third of the bridge. Wind comes up through the ribs. <small>the edge comes faster</small>`, 4200); break; }
        if (i === 1) note(`Past the split tree the moss is grey, crumbling <q>into dust that didn’t even remember how to be soil</q>. <small>WW 33 · grey ground gives way after a moment; Recall holds it</small>`, 6500);
        if (i === 2) { s.dashOn = true; dashBtn.hidden = false; s.stag = { x: s.x + 10 }; note(`A stag with silver antlers breaks from the pines ahead and runs where the ground still holds. The edge quickens. <small>new: X or DASH, a burst for 15 Focus</small>`, 6500); }
        if (i === 3) note(`Smoke from the outpost chimneys, drawn in two strokes. <small>the edge is fastest now</small>`, 3500);
        break;
      }
      if (!ST && firstOutline && s.x > firstOutline.x0 - 9) once("outline", `The path ahead is only outline: the forest has half forgotten it. <small>hold or tap Shift / RECALL just before a faint ledge</small>`, 5200);
      if (s.stag) { const tgt = segs.find((q) => q.x0 > s.x + 8 && solid(q)); s.stag.x += Math.max(0, (tgt ? tgt.x0 + 1 : s.x + 10) - s.stag.x) * Math.min(1, 3 * dt); s.stag.y = (segs.find((q) => s.stag.x >= q.x0 && s.stag.x <= q.x1) || { y: 9 }).y; }
      s.edge += s.edgeV * dt * (il && il.lost ? 0.3 : 1);
      if (il) { escort(dt); if (s.over) return; if (s.edge > il.x - 0.3) { note(`The white closes over Ilvarra. <small>back to the last post · ${Math.max(0, 3 - s.setbacks)} left</small>`, 3400); return setback(true, true); } }
      if (s.edge > s.x - 0.3) return setback(true);
      if (s.y > s.camY + VIEW_H + 2) return setback(false);
      if (s.x >= LEN) { if (il && il.x < LEN - 9) { s.x = LEN - 0.05; s.vx = 0; once("gate", `The far side will not ink in for one. <small>Ilvarra is still on the bridge: go back, and hold the path for her</small>`, 5000); } else finish(true); }
    }

    // ---- drawing ----------------------------------------------------------------------------
    const grain = document.createElement("canvas"); grain.width = grain.height = 128;
    { const gg = grain.getContext("2d"); const r = api.rng(9); gg.fillStyle = PAPER; gg.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i++) { gg.fillStyle = `rgba(69,70,74,${0.03 + r() * 0.07})`; gg.fillRect(r() * 128, r() * 128, 1, 1 + r() * 2); } }
    let pattern = null;

    function hatch(x0, y0, w, h, alpha, gap = 6, rgb = "69,70,74") {
      if (w <= 0) return;
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      g.strokeStyle = `rgba(${rgb},${alpha})`; g.lineWidth = 1;
      g.beginPath();
      for (let k = -h; k < w; k += gap) { g.moveTo(x0 + k, y0 + h); g.lineTo(x0 + k + h, y0); }
      g.stroke();
      g.strokeStyle = `rgba(44,45,48,${alpha * 0.6})`;
      g.beginPath();
      for (let k = 0; k < w + h; k += gap * 1.7) { g.moveTo(x0 + k, y0); g.lineTo(x0 + k - h * 0.7, y0 + h); }
      g.stroke(); g.restore();
    }
    function plate(x, y, w, h) { g.fillStyle = "rgba(248,243,232,.9)"; g.fillRect(x, y, w, h); g.strokeStyle = "rgba(69,70,74,.45)"; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }

    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      pattern = pattern || g.createPattern(grain, "repeat");
      g.fillStyle = pattern; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(69,70,74,.32)"; g.lineWidth = 1.2;
      const cam = camX();
      if (A.far) {   // the sketch set's hill and firs, scrolling at half speed (mirrored tile by tile)
        const bh = Math.max(H * 0.9, 14 * scale), bw = bh * 16 / 9, top = 10 * scale + oy - bh * 0.72;
        const off = (((cam * scale * 0.5) % (bw * 2)) + bw * 2) % (bw * 2);
        g.globalAlpha = ST ? 0.3 : 0.85;
        for (let k = 0; k * bw - off < W; k++) {
          const x = Math.round(k * bw - off), wk = Math.round((k + 1) * bw - off) - x; if (x + wk < 0) continue;
          const iw = A.far.width, ih = A.far.height, m = 4;
          if (k % 2) { g.save(); g.translate(x + wk, 0); g.scale(-1, 1); g.drawImage(A.far, m, 0, iw - 2 * m, ih, 0, top, wk, bh); g.restore(); }
          else g.drawImage(A.far, m, 0, iw - 2 * m, ih, x, top, wk, bh);
        }
        g.globalAlpha = 1;
      }
      for (const tr of A.far ? [] : trees) {
        const px = (tr.x - cam * 0.5) * scale; if (px < -30 || px > W + 30) continue;
        const by = sy(tr.y), th = tr.h * scale;
        g.strokeStyle = tr.x * 2 > CPS[0] * 1.1 && tr.x * 2 < CPS[1] * 1.1 ? "rgba(140,143,134,.4)" : "rgba(69,70,74,.32)";
        g.beginPath(); g.moveTo(px, by); g.lineTo(px, by - th);
        for (let k = 1; k <= 3; k++) { const yy = by - th * k / 4; g.moveTo(px - th * 0.16 * (4 - k) / 2, yy + th * 0.12); g.lineTo(px, yy - th * 0.06); g.lineTo(px + th * 0.16 * (4 - k) / 2, yy + th * 0.12); }
        g.stroke();
      }
      const prog = Math.max(0, Math.min(1, s.x / LEN));
      const gx = sx(LEN + 2), gy = sy(last.y);
      if (gx < W + 400 && A.gate) {   // the palisade gates from the sketch set, inking in with the distance left
        const k = (5.6 * scale) / 360;
        g.globalAlpha = 0.22 + 0.78 * prog * prog;
        g.drawImage(A.gate, gx + 1.8 * scale - 1478 * k, gy - 620 * k, 1600 * k, 900 * k);
        g.globalAlpha = 1;
      } else if (gx < W + 200) {
        const gw = 3.6 * scale, gh = 5 * scale;
        g.strokeStyle = GRAPHITE; g.setLineDash(prog < 0.98 ? [6, 5] : []); g.lineWidth = 1.5;
        g.strokeRect(gx, gy - gh, gw, gh); g.strokeRect(gx - 0.5 * scale, gy - gh - 0.6 * scale, gw + scale, 0.6 * scale);
        g.setLineDash([]);
        hatch(gx, gy - gh, gw, gh, 0.75 * prog, 5);
        g.fillStyle = `rgba(122,86,52,${0.55 * prog})`; g.fillRect(gx + gw * 0.3, gy - gh * 0.62, gw * 0.4, gh * 0.62);
      }
      for (const sg of segs) {
        const x0 = sx(sg.x0), x1 = sx(sg.x1); if (x1 < -10 || x0 > W + 10) continue;
        const top = sy(sg.y), depth = H - top;
        if (sg.kind === "solid") {
          g.fillStyle = "rgba(217,210,194,.9)"; g.fillRect(x0, top, x1 - x0, depth);
          hatch(x0, top, x1 - x0, depth, 0.55, 5);
          g.strokeStyle = LEAD; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke();
          g.lineWidth = 1; g.beginPath(); g.moveTo(x0, top); g.lineTo(x0, H); g.moveTo(x1, top); g.lineTo(x1, H); g.stroke();
        } else if (sg.kind === "grey") {
          if (sg.gone) { g.strokeStyle = "rgba(143,138,126,.45)"; g.setLineDash([2, 7]); g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke(); g.setLineDash([]); continue; }
          const shake = sg.crumble > 0 && !rm ? Math.sin(s.t * 60) * 1.5 * sg.crumble : 0;
          const held = sg.t > 0;
          g.fillStyle = held ? "rgba(217,210,194,.9)" : "rgba(226,222,212,.9)"; g.fillRect(x0 + shake, top, x1 - x0, depth);
          hatch(x0 + shake, top, x1 - x0, depth, held ? 0.45 : 0.28, 4, "140,143,134");
          g.strokeStyle = held ? LEAD : MOSS; g.lineWidth = 2; g.setLineDash(held ? [] : [9, 3]); g.beginPath(); g.moveTo(x0 + shake, top); g.lineTo(x1 + shake, top); g.stroke(); g.setLineDash([]);
          if (sg.crumble > 0) { g.fillStyle = MOSS; for (let k = 0; k < 10; k++) g.fillRect(x0 + ((k * 37) % (x1 - x0 || 1)), top + 6 + sg.crumble * 30 * ((k % 3) + 1), 2, 2); }
        } else if (sg.kind === "false") {   // no shadow under it; and when reached for, nothing
          g.strokeStyle = FAINT; g.lineWidth = 1.2; g.setLineDash([5, 6]);
          g.strokeRect(x0, top, x1 - x0, Math.min(depth, 1.6 * scale)); g.setLineDash([]);
          if (sg.burned > 0) { g.globalAlpha = Math.min(1, sg.burned); g.strokeStyle = "#8b2a20"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top + 1.2 * scale); g.moveTo(x1, top); g.lineTo(x0, top + 1.2 * scale); g.stroke(); g.font = "italic 15px Georgia, serif"; g.fillStyle = "#8b2a20"; g.fillText("nothing there", x0, top - 8); g.globalAlpha = 1; }
        } else {
          if (sg.dark && sg.t <= 0) continue;   // a dark stretch: no name was kept to light it
          hatch(x0 + 3, top + 1.6 * scale + 2, x1 - x0 - 6, 0.45 * scale, 0.5, 3);   // a true outline throws a shadow
          if (sg.t > 0) {
            const a = Math.min(1, sg.t / 0.8);
            g.fillStyle = `rgba(217,210,194,${0.7 * a})`; g.fillRect(x0, top, x1 - x0, depth);
            hatch(x0, top, x1 - x0, depth, 0.4 * a, 7);
            g.strokeStyle = `rgba(44,45,48,${a})`; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke();
          }
          g.strokeStyle = FAINT; g.lineWidth = 1.2; g.setLineDash([5, 6]);
          g.strokeRect(x0, top, x1 - x0, Math.min(depth, 1.6 * scale)); g.setLineDash([]);
        }
      }
      for (const ts of touch) {
        const px = sx(ts.x), py = sy(ts.y) - 1.4 * scale; if (px < -40 || px > W + 40) continue;
        if (ts.lit) { const rg = g.createRadialGradient(px, py, 2, px, py, 1.6 * scale); rg.addColorStop(0, "rgba(246,210,122,.65)"); rg.addColorStop(1, "rgba(246,210,122,0)"); g.fillStyle = rg; g.fillRect(px - 2 * scale, py - 2 * scale, 4 * scale, 4 * scale); }
        if (ts.glow > 0) { g.strokeStyle = `rgba(201,138,42,${ts.glow / 1.2})`; g.lineWidth = 3; g.beginPath(); g.arc(px, py, (2.6 - ts.glow) * scale, 0, 7); g.stroke(); }
        g.strokeStyle = GRAPHITE; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py + 0.5 * scale); g.lineTo(px, sy(ts.y)); g.stroke();
        g.fillStyle = ts.lit ? LAMP : BLANK; g.strokeRect(px - 0.25 * scale, py - 0.5 * scale, 0.5 * scale, 0.9 * scale); g.fillRect(px - 0.24 * scale, py - 0.49 * scale, 0.48 * scale, 0.88 * scale);
        if (ts.lit) { g.fillStyle = "#c98a2a"; g.beginPath(); g.ellipse(px, py, 0.08 * scale, 0.22 * scale, 0, 0, 7); g.fill(); }
        if (ts.name) { g.font = "italic 700 15px Georgia, serif"; g.textAlign = "center"; g.fillStyle = ts.lit ? LEAD : FAINT; g.fillText(ts.name, px, py - 0.85 * scale); g.textAlign = "left"; }
      }
      for (const p of darkPosts) { const px = sx(p.c + 12); if (px < -80 || px > W + 80) continue; g.font = "italic 14px Georgia, serif"; g.textAlign = "center"; g.fillStyle = "rgba(143,138,126,.85)"; g.fillText(`${p.name}: no lantern`, px, oy + 3.2 * scale); g.textAlign = "left"; }
      if (il) {   // Ilvarra: inked, or in outline when the curse has taken why she runs
        const px = sx(il.x), py = sy(il.y), u = scale, moving = !il.lost && (il.hop || s.x - 2.4 > il.x + 0.1), ph = moving && !rm ? Math.sin(il.t * 13) : 0;
        g.lineCap = "round"; g.lineWidth = il.lost ? 1.4 : 2.2; g.strokeStyle = il.lost ? FAINT : LEAD; g.setLineDash(il.lost ? [4, 5] : []);
        g.beginPath(); g.moveTo(px, py - 0.95 * u); g.lineTo(px + 0.36 * u * ph, py); g.moveTo(px, py - 0.95 * u); g.lineTo(px - 0.36 * u * ph, py);
        g.moveTo(px, py - 0.95 * u); g.lineTo(px + 0.08 * u, py - 1.7 * u);
        g.moveTo(px + 0.08 * u, py - 1.5 * u); g.lineTo(px + 0.45 * u, py - 1.15 * u + 0.15 * u * ph); g.stroke();
        g.beginPath(); g.arc(px + 0.12 * u, py - 1.95 * u, 0.22 * u, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(px - 0.05 * u, py - 1.75 * u); g.quadraticCurveTo(px - 0.55 * u, py - 1.2 * u, px - 0.42 * u, py - 0.25 * u); g.lineTo(px + 0.1 * u, py - 0.6 * u); g.stroke();   // her cloak
        g.setLineDash([]);
        if (il.lost) { g.strokeStyle = GRAPHITE; g.lineWidth = 3; g.beginPath(); g.arc(px, py - 1 * u, 1.5 * u, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, il.hold / 1.3)); g.stroke(); g.font = "italic 15px Georgia, serif"; g.fillStyle = LEAD; g.textAlign = "center"; g.fillText("Ilvarra, in outline", px, py - 2.75 * u); g.textAlign = "left"; }
      }
      checkpoints.slice(1).forEach((c, i) => { const px = sx(c.x - 1); if (px < -20 || px > W + 20) return; g.strokeStyle = i < s.cp ? LEAD : FAINT; g.lineWidth = 1.8; g.beginPath(); g.moveTo(px, sy(c.y)); g.lineTo(px, sy(c.y) - 2 * scale); g.lineTo(px + 0.8 * scale, sy(c.y) - 1.7 * scale); g.lineTo(px, sy(c.y) - 1.4 * scale); g.stroke(); if (i < s.cp) { g.beginPath(); g.moveTo(px - 6, sy(c.y) - 2.3 * scale); g.lineTo(px - 1, sy(c.y) - 2.1 * scale + 5); g.lineTo(px + 9, sy(c.y) - 2.6 * scale - 4); g.stroke(); } });
      // the stag, in a few silvery strokes
      if (s.stag) {
        const px = sx(s.stag.x), py = sy(s.stag.y), u = scale * 0.9, ph = rm ? 0 : Math.sin(s.t * 10);
        g.strokeStyle = "rgba(110,118,128,.9)"; g.lineWidth = 2; g.lineCap = "round"; g.beginPath();
        g.moveTo(px - 0.7 * u, py - 0.9 * u); g.lineTo(px + 0.7 * u, py - 1 * u);
        g.moveTo(px - 0.6 * u, py - 0.9 * u); g.lineTo(px - 0.6 * u - 0.3 * u * ph, py); g.moveTo(px + 0.6 * u, py - 1 * u); g.lineTo(px + 0.6 * u + 0.3 * u * ph, py);
        g.moveTo(px + 0.7 * u, py - 1 * u); g.lineTo(px + 1 * u, py - 1.6 * u); g.lineTo(px + 1.3 * u, py - 1.5 * u);
        g.moveTo(px + 1 * u, py - 1.6 * u); g.lineTo(px + 0.8 * u, py - 2.3 * u); g.lineTo(px + 0.6 * u, py - 2.5 * u); g.moveTo(px + 0.9 * u, py - 2 * u); g.lineTo(px + 1.3 * u, py - 2.4 * u);
        g.stroke();
      }
      {
        const px = sx(s.x), py = sy(s.y), u = scale;
        const ph = s.ground && Math.abs(s.vx) > 0.5 && !rm ? Math.sin(s.t * (s.dash > 0 ? 20 : 14)) : s.ground ? 0 : 0.6;
        if (s.dash > 0 && !rm) { g.strokeStyle = "rgba(69,70,74,.35)"; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(px - (1 + k * 0.4) * u * s.face, py - (0.4 + k * 0.35) * u); g.lineTo(px - (2.4 + k * 0.4) * u * s.face, py - (0.4 + k * 0.35) * u); g.stroke(); } }
        g.strokeStyle = LEAD; g.lineWidth = 2.2; g.lineCap = "round"; g.beginPath();
        const hip = [px, py - 0.9 * u], neck = [px + 0.12 * u * s.face, py - 1.6 * u];
        g.moveTo(hip[0], hip[1]); g.lineTo(px + 0.4 * u * ph, py); g.moveTo(hip[0], hip[1]); g.lineTo(px - 0.4 * u * ph, py);
        g.moveTo(hip[0], hip[1]); g.lineTo(neck[0], neck[1]);
        g.moveTo(neck[0], neck[1] + 0.15 * u); g.lineTo(neck[0] - 0.4 * u * ph, neck[1] + 0.55 * u);
        g.moveTo(neck[0], neck[1] + 0.15 * u); g.lineTo(neck[0] + 0.45 * u * s.face, neck[1] + 0.2 * u - 0.2 * u * ph);
        g.stroke();
        g.beginPath(); g.arc(neck[0] + 0.05 * u * s.face, neck[1] - 0.25 * u, 0.22 * u, 0, 7); g.stroke();
        g.lineWidth = 1.2; g.beginPath(); g.arc(neck[0] - 0.25 * u * s.face, neck[1] + 0.35 * u, 0.45 * u, -1.2, 1.2); g.stroke();
        if (s.recalling) {
          g.strokeStyle = "rgba(69,70,74,.55)"; g.setLineDash([3, 4]); g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(px, py - 1.2 * u); g.lineTo(px + 6 * u, py - 1.2 * u); g.stroke();
          g.beginPath(); g.moveTo(px + 6 * u, py - 2 * u); g.lineTo(px + 6 * u, py + 0.5 * u); g.stroke(); g.setLineDash([]);
        }
      }
      const ex = sx(s.edge);
      if (ex > -20) {
        const rr = api.rng(Math.floor(s.edge * 2));
        g.fillStyle = BLANK; g.beginPath(); g.moveTo(-5, -5);
        const pts = [];
        for (let yy = -5; yy <= H + 10; yy += 14) pts.push([ex + (rr() - 0.5) * 16, yy]);
        pts.forEach(([a, b]) => g.lineTo(a, b));
        g.lineTo(-5, H + 10); g.closePath(); g.fill();
        g.strokeStyle = "#b9b1a0"; g.lineWidth = 1.4; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
        g.fillStyle = "#cfc6b3";
        for (let k = 0; k < 26; k++) { const cx = ex + 4 + rr() * 26, cy = rr() * H; g.fillRect(cx, cy, 2 + rr() * 3, 2 + rr() * 3); }
      }
      if (s.smudge > 0) { g.fillStyle = `rgba(69,70,74,${0.22 * s.smudge})`; g.fillRect(0, 0, W, H); }
      // HUD on a scrap of paper: Focus, the edge behind him, the gates ahead, setbacks
      const gapM = Math.max(0, s.x - s.edge), close = gapM < 4;
      plate(10, 10, 262, 92);
      g.font = "700 13px ui-monospace, Menlo, monospace"; g.fillStyle = LEAD;
      g.fillText("FOCUS", 20, 30);
      g.strokeStyle = GRAPHITE; g.lineWidth = 1; g.strokeRect(84, 20, 140, 13);
      hatch(84, 20, 140 * s.focus / 100, 13, s.focus < 20 ? 0.5 + 0.4 * Math.abs(Math.sin(s.t * 6)) : 0.95, 3);
      g.fillText(String(Math.round(s.focus)), 232, 31);
      g.fillStyle = close ? "#8b2a20" : LEAD; g.fillText("EDGE", 20, 53);
      g.strokeStyle = GRAPHITE; g.strokeRect(84, 43, 140, 13);
      g.fillStyle = close ? "rgba(139,42,32,.75)" : "rgba(69,70,74,.55)"; g.fillRect(84, 43, 140 * Math.max(0, 1 - gapM / 16), 13);
      g.fillStyle = close ? "#8b2a20" : LEAD; g.fillText(`${gapM.toFixed(0)} m`, 232, 54);
      g.fillStyle = LEAD; g.fillText(`${CFG.goal} ${Math.round(prog * 100)}%`, 20, 76);
      g.fillText("SETBACKS", 140, 76);
      for (let i = 0; i < 4; i++) { g.strokeRect(220 + i * 12, 67, 9, 9); if (i < s.setbacks) { g.beginPath(); g.moveTo(220 + i * 12, 67); g.lineTo(229 + i * 12, 76); g.moveTo(229 + i * 12, 67); g.lineTo(220 + i * 12, 76); g.stroke(); } }
      g.fillStyle = "rgba(44,45,48,.8)"; g.font = "600 12px ui-monospace, Menlo, monospace";
      g.fillText(s.recalling ? (ESCORT ? "RECALLING: 8 m behind, 6 m ahead" : "RECALLING: the next 6 m hold") : il && il.lost ? "SHE HAS STOPPED: Recall her" : s.dashOn ? (s.dashCd > 0 ? "dash recovering" : "X / DASH: a burst, 15 Focus") : "SHIFT / RECALL: hold the path", 20, 94);
      if (A.seal && W > 430) {   // Cedarheart's seal: whole until the edge first catches him
        g.globalAlpha = s.firstCatch ? 0.45 : 1; g.drawImage(A.seal, 280, 12, 50, 50); g.globalAlpha = 1;
        g.font = "700 12px ui-monospace, Menlo, monospace"; g.fillStyle = s.firstCatch ? "#8b2a20" : LEAD;
        g.fillText(s.firstCatch && !ESCORT ? CFG.realm + " −3" : CFG.realm, 280, 76);
      }
      if (s.tick > 0) { g.globalAlpha = Math.min(1, s.tick); g.font = "italic 22px Georgia, serif"; g.fillStyle = LEAD; g.fillText("✓ post", sx(s.x) - 20, sy(s.y) - 2.8 * scale); g.globalAlpha = 1; }
    }

    let raf = 0, lastT = 0;
    function frame(now) {
      const dt = Math.min(0.04, (now - lastT) / 1000 || 0); lastT = now;
      if (s.running) step(dt);
      draw();
      if (!s.over) raf = requestAnimationFrame(frame);
    }

    // ---- input ------------------------------------------------------------------------------
    const map = (k) => (k === "a" || k === "arrowleft" ? "left" : k === "d" || k === "arrowright" ? "right" : k === "shift" || k === "r" ? "recall" : k === "w" || k === " " || k === "arrowup" ? "jump" : k === "x" || k === "k" ? "dash" : null);
    const kd = (e) => { if (intro.isConnected) return; const m = map(e.key.toLowerCase()); if (!m) return; e.preventDefault(); if (m === "jump" || m === "dash") { if (!e.repeat) keys[m] = true; } else keys[m] = true; };
    const ku = (e) => { const m = map(e.key.toLowerCase()); if (m && m !== "jump" && m !== "dash") keys[m] = false; };
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    const pad = wrap.querySelector(".wrymwretch-forgetting-run-pad");
    const pd = (e) => { const b = e.target.closest("button"); if (!b) return; e.preventDefault(); keys[b.dataset.k] = true; b.classList.add("on"); };
    const pu = () => { keys.left = keys.right = keys.recall = false; pad.querySelectorAll(".on").forEach((b) => b.classList.remove("on")); };
    pad.addEventListener("pointerdown", pd);
    addEventListener("pointerup", pu); addEventListener("pointercancel", pu);

    const startBtn = wrap.querySelector("[data-start]");
    startBtn.addEventListener("click", () => {
      intro.remove(); s.running = true; lastT = performance.now();
      if (CLIMB) note(`Lunessa Tidecaller kicks up from the monolith with three rows held in her head. Below her the sea is going blank, and it is rising. <small>run and jump upward · look under each outline for its shadow</small>`, 6500);
      else if (ESCORT) {
        note(`Dawn, and the Remnants have their list back. Ilvarra's name is on it, and the only way off the Rim is the bridge of wyrm ribs. <small>she follows · hold the path for two</small>`, 6500);
        if (ward) { const k = (ward.kept || []).filter((n) => WARD.includes(n)), l = WARD.filter((n) => !k.includes(n));
          ctx.link(wrap, k.length ? `Because you kept <b>${k.join(", ")}</b> in Concentration, ${k.length > 1 ? "their lanterns stand" : "that lantern stands"} on the bridge.${l.length ? ` ${l.join(" and ")} ${l.length > 1 ? "were" : "was"} lost: ${l.length > 1 ? "those stretches are" : "that stretch is"} dark.` : ""}` : `Because no name was kept in Concentration's ward, the bridge has no lantern at all.`); }
      }
      else note(`Thalen Cedarheart has seen the moss grey at the split tree. Behind him the western groves are going blank, and the outpost has to hear it from him. <small>run right · the white edge follows</small>`, 6000);
    });
    ctx.picker(wrap.querySelector("[data-tabs]"));
    startBtn.focus();
    opening(api.art, intro, CFG.chapter);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro ? ro.observe(wrap) : addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        s.over = true; dead = true; cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        removeEventListener("pointerup", pu); removeEventListener("pointercancel", pu);
        ro ? ro.disconnect() : removeEventListener("resize", resize);
        wrap.remove();
      },
    };
}

export default staged({ stages: LADDER }, play);

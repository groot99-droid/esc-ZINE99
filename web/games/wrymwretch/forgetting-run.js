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

const PAPER = "#f1e8d6", BLANK = "#f8f3e8", GRAPHITE = "#45464a", LEAD = "#2c2d30", FAINT = "#8f8a7e", LAMP = "#f6d27a", MOSS = "#8c8f86";
const LEN = 400, VIEW_H = 14, RUN = 6, DASH = 10.5, GRAV = 30, JUMP = 11.2, EDGE0 = 4.0;

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

export default {
  mount(root, api) {
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
        <p class="goal">Get Thalen to the outpost gates before the blank page catches him.</p>
        <div class="wrymwretch-forgetting-run-keys">
          <span><kbd>A</kbd> <kbd>D</kbd> ◀ ▶</span><span>run</span>
          <span><kbd>W</kbd> <kbd>Space</kbd></span><span>jump the gaps</span>
          <span><kbd>Shift</kbd> RECALL</span><span>faint outline turns solid for 3 s; costs Focus</span>
        </div>
        <p class="more">Lanterns and remembered ground give Focus back. One more trick unlocks on the way.</p>
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

    // ---- the level --------------------------------------------------------------------------
    const R = api.rng("wrymwretch/forgetting-run/outpost");
    const segs = [{ x0: -20, x1: 14, y: 10, kind: "solid", t: 0 }];
    const CPS = [100, 200, 300];
    let x = 14, y = 10;
    while (x < LEN + 10) {
      const gap = x < 30 ? 1.2 : 0.8 + R() * 1.9;
      x += gap;
      y = Math.max(7.5, Math.min(11.5, y + (R() - 0.5) * 2.4));
      const len = 4 + R() * 6;
      const cp = CPS.find((c) => c >= x - 2 && c < x + len + 2);
      const roll = R();
      let kind = x > LEN - 4 ? "solid" : cp ? "solid" : x < 26 ? "solid" : roll < 0.62 ? "outline" : "solid";
      if (kind === "solid" && x > CPS[0] + 6 && x < LEN - 6 && !cp && roll > 0.8) kind = "grey";
      if (kind === "outline" && x > CPS[0] + 6 && x < CPS[1] && roll < 0.2) kind = "grey";
      segs.push({ x0: x, x1: x + len, y, kind, t: 0, crumble: -1, gone: false });
      x += len;
    }
    const last = segs[segs.length - 1]; last.x1 = Math.max(last.x1, LEN + 12);
    const checkpoints = [{ x: 2, y: 10 }].concat(CPS.map((c) => { const sg = segs.find((q) => q.x1 > c && q.kind === "solid" && q.x0 >= c - 6) || segs[1]; return { x: sg.x0 + 1, y: sg.y }; }));
    const touch = [80, 170, 270].map((c) => { const sg = segs.find((q) => q.kind === "solid" && q.x0 > c); return { x: (sg.x0 + sg.x1) / 2, y: sg.y, lit: true, glow: 0 }; });
    const trees = []; for (let k = 0; k < 90; k++) trees.push({ x: k * 6 + R() * 5, h: 1.4 + R() * 1.6, y: 6 + R() * 1.5 });
    const firstOutline = segs.find((q) => q.kind === "outline");

    // ---- state ------------------------------------------------------------------------------
    const s = { x: 2, y: 10, vx: 0, vy: 0, ground: null, focus: 100, edge: -8, edgeV: EDGE0 * EDGE_K, cp: 0, setbacks: 0, firstCatch: false,
      recalling: false, wasRecalling: false, t: 0, running: false, over: false, face: 1, dash: 0, dashCd: 0, dashOn: false,
      smudge: 0, tick: 0, recalls: 0, dashes: 0, lamps: 0, beats: new Set(), stag: null };
    const keys = { left: false, right: false, recall: false, jump: false, dash: false };
    let W = 1, H = 1, scale = 1, dpr = 1, oy = 0;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = Math.max(1, wrap.clientWidth); H = Math.max(1, wrap.clientHeight); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); scale = Math.min(H / VIEW_H, W / 22); oy = (H - VIEW_H * scale) * 0.55; draw(); };
    const camX = () => s.x - (W * 0.36) / scale;
    const sx = (wx) => (wx - camX()) * scale, sy = (wy) => wy * scale + oy;
    const solid = (sg) => !sg.gone && (sg.kind === "solid" || sg.kind === "grey" || sg.t > 0);

    let noteT = null;
    function note(html, ms = 4500) {
      noteEl.innerHTML = html; noteEl.classList.add("on");
      if (noteT) { clearTimeout(noteT); timers.delete(noteT); }
      noteT = setTimeout(() => { timers.delete(noteT); noteEl.classList.remove("on"); }, ms); timers.add(noteT);
    }
    const once = (id, html, ms) => { if (s.beats.has(id)) return; s.beats.add(id); note(html, ms); };

    function setback(caught) {
      s.setbacks++; s.smudge = 1;
      if (s.setbacks >= 4) return finish(false);
      if (caught && !s.firstCatch) { s.firstCatch = true; note(`The white closes over his heels. Cedarheart memory −3. <small>back to the last post · ${4 - s.setbacks} left</small>`, 3600); }
      else note(caught ? `Caught. Back to the last post. <small>${4 - s.setbacks} setback${4 - s.setbacks === 1 ? "" : "s"} left</small>` : `He falls through ground that was never remembered. <small>back to the last post · ${4 - s.setbacks} left</small>`, 3200);
      const c = checkpoints[s.cp];
      s.x = c.x; s.y = c.y; s.vx = 0; s.vy = 0; s.ground = null; s.edge = c.x - 12; s.dash = 0;
      s.focus = Math.max(s.focus, 50);
      segs.forEach((sg) => { sg.t = 0; sg.crumble = -1; sg.gone = false; });
    }
    function finish(win) {
      if (s.over) return;
      s.over = true; s.running = false;
      api.store.set("losses", win ? 0 : losses + 1);
      api.end(win
        ? { outcome: "win", text: `The outpost gates ink in and Thalen is through, ${s.setbacks ? `after ${s.setbacks} setback${s.setbacks > 1 ? "s" : ""}` : "untouched by the edge"}, with ${Math.round(s.focus)} Focus left. The rangers look up. “The forest is… forgetting,” he managed. “Something is making it forget.” (WW 39)` }
        : { outcome: "lose", text: `The blank page closes over the path a fourth time, ${Math.round(Math.min(1, s.x / LEN) * 100)}% of the way to the gates. The outpost never hears what Thalen saw at the split tree.${losses + 1 >= 2 ? " Next time the edge will come slower." : ""}` });
    }

    function step(dt) {
      s.t += dt; s.smudge = Math.max(0, s.smudge - dt * 1.4); s.tick = Math.max(0, s.tick - dt);
      s.dash = Math.max(0, s.dash - dt); s.dashCd = Math.max(0, s.dashCd - dt);
      touch.forEach((t) => (t.glow = Math.max(0, t.glow - dt)));
      const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (dir) s.face = dir;
      if (keys.dash && s.dashOn && s.dashCd <= 0 && s.focus >= 15) { s.focus -= 15; s.dash = 1.1; s.dashCd = 2.5; s.dashes++; }
      keys.dash = false;
      const speed = s.dash > 0 ? DASH : RUN;
      const want = s.dash > 0 ? s.face * speed : dir * speed;
      s.vx += (want - s.vx) * Math.min(1, (s.ground ? 12 : 5) * dt);
      if (keys.jump && s.ground) { s.vy = -JUMP; s.ground = null; }
      keys.jump = false;
      s.recalling = keys.recall && s.focus > 0;
      if (s.recalling) {
        if (!s.wasRecalling) { s.focus = Math.max(0, s.focus - 3); s.recalls++; }
        s.focus = Math.max(0, s.focus - 10 * dt);
        for (const sg of segs) if ((sg.kind === "outline" || sg.kind === "grey") && sg.x1 > s.x - 0.5 && sg.x0 < s.x + 6) { sg.t = 3; if (sg.kind === "grey") { sg.crumble = -1; sg.gone = false; } }
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
        note(["A ranger's lantern, still lit. He remembers lighting it. <small>Focus +30</small>", "The lantern at the old ford. <small>Focus +30</small>", "The last lantern before the gates. <small>Focus +30</small>"][s.lamps - 1] || "Focus +30", 2600);
      }
      for (let i = checkpoints.length - 1; i > s.cp; i--) if (s.x >= checkpoints[i].x) {
        s.cp = i; s.edgeV *= 1.1; s.tick = 1.2;
        if (i === 1) note(`Past the split tree the moss is grey, crumbling <q>into dust that didn’t even remember how to be soil</q>. <small>WW 33 · grey ground gives way after a moment; Recall holds it</small>`, 6500);
        if (i === 2) { s.dashOn = true; dashBtn.hidden = false; s.stag = { x: s.x + 10 }; note(`A stag with silver antlers breaks from the pines ahead and runs where the ground still holds. The edge quickens. <small>new: X or DASH, a burst for 15 Focus</small>`, 6500); }
        if (i === 3) note(`Smoke from the outpost chimneys, drawn in two strokes. <small>the edge is fastest now</small>`, 3500);
        break;
      }
      if (firstOutline && s.x > firstOutline.x0 - 9) once("outline", `The path ahead is only outline: the forest has half forgotten it. <small>hold or tap Shift / RECALL just before a faint ledge</small>`, 5200);
      if (s.stag) { const tgt = segs.find((q) => q.x0 > s.x + 8 && solid(q)); s.stag.x += Math.max(0, (tgt ? tgt.x0 + 1 : s.x + 10) - s.stag.x) * Math.min(1, 3 * dt); s.stag.y = (segs.find((q) => s.stag.x >= q.x0 && s.stag.x <= q.x1) || { y: 9 }).y; }
      s.edge += s.edgeV * dt;
      if (s.edge > s.x - 0.3) return setback(true);
      if (s.y > VIEW_H + 2) return setback(false);
      if (s.x >= LEN) finish(true);
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
      for (const tr of trees) {
        const px = (tr.x - cam * 0.5) * scale; if (px < -30 || px > W + 30) continue;
        const by = sy(tr.y), th = tr.h * scale;
        g.strokeStyle = tr.x * 2 > CPS[0] * 1.1 && tr.x * 2 < CPS[1] * 1.1 ? "rgba(140,143,134,.4)" : "rgba(69,70,74,.32)";
        g.beginPath(); g.moveTo(px, by); g.lineTo(px, by - th);
        for (let k = 1; k <= 3; k++) { const yy = by - th * k / 4; g.moveTo(px - th * 0.16 * (4 - k) / 2, yy + th * 0.12); g.lineTo(px, yy - th * 0.06); g.lineTo(px + th * 0.16 * (4 - k) / 2, yy + th * 0.12); }
        g.stroke();
      }
      const prog = Math.max(0, Math.min(1, s.x / LEN));
      const gx = sx(LEN + 2), gy = sy(last.y);
      if (gx < W + 200) {
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
        } else {
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
      g.fillStyle = LEAD; g.fillText(`GATES ${Math.round(prog * 100)}%`, 20, 76);
      g.fillText("SETBACKS", 140, 76);
      for (let i = 0; i < 4; i++) { g.strokeRect(220 + i * 12, 67, 9, 9); if (i < s.setbacks) { g.beginPath(); g.moveTo(220 + i * 12, 67); g.lineTo(229 + i * 12, 76); g.moveTo(229 + i * 12, 67); g.lineTo(220 + i * 12, 76); g.stroke(); } }
      g.fillStyle = "rgba(44,45,48,.8)"; g.font = "600 12px ui-monospace, Menlo, monospace";
      g.fillText(s.recalling ? "RECALLING: the next 6 m hold" : s.dashOn ? (s.dashCd > 0 ? "dash recovering" : "X / DASH: a burst, 15 Focus") : "SHIFT / RECALL: hold the path", 20, 94);
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
      note(`Thalen Cedarheart has seen the moss grey at the split tree. Behind him the western groves are going blank, and the outpost has to hear it from him. <small>run right · the white edge follows</small>`, 6000);
    });
    startBtn.focus();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro ? ro.observe(wrap) : addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        s.over = true; cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear();
        removeEventListener("keydown", kd); removeEventListener("keyup", ku);
        removeEventListener("pointerup", pu); removeEventListener("pointercancel", pu);
        ro ? ro.disconnect() : removeEventListener("resize", resize);
        wrap.remove();
      },
    };
  },
};

// The Stuffed Ones: Stuffing (1D, allocation), drawn as a dressmaker's tissue pattern.
//
// DESIGN.md section 11 "Stuffing" and section 12 "Memory tokens" / "Hunger". One packing before
// a night: your body laid open as six pattern pieces with slot hollows, memory tokens in a tray.
// Pack tokens into slots; an empty slot is warm (+15 percent hunger each). Tonight's two games
// (Scent needs a warm Chest slot, Proximity a warm Arm slot) may be joined or held. Close plays the
// night: tray tokens unravel, each joined game takes one memory from its seam, each lurch takes two
// from the warmest seam, and a cost with nothing to take moves on Head, Chest, Arms, Legs. The gold
// (bound) slot never pays. No failure: the result is a scored "done".
const PRE = "stuffed-ones-stuffing-";
const C = { cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", moss: "#7d8a5a", rust: "#a5553a", sky: "#8fa9bf",
  cream: "#efe5cf", bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", ink: "#2a211b", gold: "#c9a227", rose: "#c07a8e" };

// Token names are the design's memory tokens (section 12); colour by whose memory it is.
const TOKENS = [
  ["My name", "you"], ["The drive up", "you"], ["My hands", "you"],
  ["Jamie's question", "jamie"], ["Jamie's bad postcard", "jamie"],
  ["Lila's hum", "lila"], ["Lila's mushroom photo", "lila"],
  ["Marcus's strap", "marcus"], ["Marcus's paper map", "marcus"],
  ["The chili", "dani"], ["Dani names the toys", "dani"],
];
const WHO = { you: [C.cream, "Y"], jamie: [C.sky, "J"], lila: [C.rose, "L"], marcus: [C.moss, "M"], dani: [C.amber, "D"] };

// Pattern pieces in a 680 x 420 pattern space. Cost order: Head, Chest, Arms, Legs.
const SEAMS = [
  { id: "head", name: "HEAD", seam: 1, pts: [[160, 62], [172, 22], [208, 48], [252, 48], [288, 22], [300, 62], [306, 118], [272, 160], [188, 160], [154, 118]], slots: [[205, 108], [255, 108]], grain: [[230, 70], [230, 150]] },
  { id: "chest", name: "CHEST", seam: 2, pts: [[150, 188], [310, 188], [332, 258], [322, 382], [138, 382], [128, 258]], slots: [[180, 300], [230, 300], [280, 300]], bound: 2, grain: [[230, 205], [230, 370]] },
  { id: "larm", name: "LEFT ARM", seam: 3, pts: [[28, 178], [96, 168], [112, 262], [102, 392], [44, 398], [22, 282]], slots: [[66, 252], [66, 332]], grain: [[48, 200], [48, 380]] },
  { id: "rarm", name: "RIGHT ARM", seam: 4, pts: [[358, 178], [426, 168], [442, 262], [432, 392], [374, 398], [352, 282]], slots: [[396, 252], [396, 332]], grain: [[378, 200], [378, 380]] },
  { id: "lleg", name: "LEFT LEG", seam: 5, pts: [[478, 58], [562, 58], [566, 180], [578, 302], [468, 302], [474, 180]], slots: [[520, 140], [520, 232]], grain: [[492, 75], [492, 290]] },
  { id: "rleg", name: "RIGHT LEG", seam: 6, pts: [[590, 58], [672, 58], [674, 180], [680, 302], [584, 302], [586, 180]], slots: [[630, 182]], grain: [[606, 75], [606, 290]] },
];
const GAMES = [
  { id: "scent", name: "Scent", needs: ["chest"], needName: "CHEST" },
  { id: "proximity", name: "Proximity", needs: ["larm", "rarm"], needName: "an ARM" },
];

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:#5a3f2b;color:${C.ink};font-family:Karla,Arial,sans-serif;overflow:hidden;touch-action:none}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}panel{position:absolute;background:${C.cream};border:1px solid ${C.ink};box-shadow:3px 4px 0 rgba(0,0,0,.25);padding:10px 12px;font-size:13px;line-height:1.35;overflow:auto;box-sizing:border-box}
.${PRE}panel h3{margin:0 0 4px;font:600 12px Karla,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.${PRE}panel .${PRE}rate{font:400 30px 'IM Fell English',Georgia,serif;color:${C.red};line-height:1}
.${PRE}panel .${PRE}row{display:flex;align-items:center;gap:8px;margin:5px 0;flex-wrap:wrap}
.${PRE}panel button{font:600 12px Karla,Arial,sans-serif;border:1px solid ${C.ink};background:${C.bone};color:${C.ink};padding:5px 10px;cursor:pointer;min-height:30px}
.${PRE}panel button[aria-pressed=true]{background:${C.ink};color:${C.bone}}
.${PRE}panel button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}panel .${PRE}close{background:${C.red};color:${C.bone};border-color:${C.red};width:100%;margin-top:8px;font-size:14px;min-height:38px}
.${PRE}panel small{opacity:.75}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.55);z-index:5;padding:16px}
.${PRE}intro div{max-width:460px;background:rgba(246,241,228,.95);border:1px dashed ${C.ink};padding:20px 22px;box-shadow:4px 5px 0 rgba(0,0,0,.3)}
.${PRE}intro h2{margin:0 0 8px;font:400 30px 'IM Fell English',Georgia,serif}
.${PRE}intro p{margin:0 0 8px;font-size:14px;line-height:1.45}
.${PRE}intro button{font:600 15px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:0;padding:9px 22px;cursor:pointer;margin-top:6px}
.${PRE}log{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100% - 32px));background:rgba(246,241,228,.96);border:1px dashed ${C.ink};padding:14px 18px;font-size:14px;line-height:1.5;z-index:4;max-height:70%;overflow:auto}
.${PRE}log p{margin:0 0 4px}
</style><canvas aria-label="Your body laid open as a sewing pattern, with memory tokens in a tray"></canvas>
<div class="${PRE}panel" aria-live="polite"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const panel = wrap.querySelector("." + PRE + "panel");

    // state
    const tokens = TOKENS.map(([name, who], i) => ({ i, name, who, slot: null, lost: false, fade: 0 }));
    const slots = [];
    SEAMS.forEach((s, si) => s.slots.forEach((p, k) => slots.push({ seam: si, k, x: p[0], y: p[1], bound: s.bound === k, token: null })));
    const join = { scent: true, proximity: true };
    let kbUsed = false, started = false, closing = false, dragging = null, hover = null, cursor = 0, held = null;
    let L = null; // layout

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const wide = W >= 760;
      let pat, tray, pan;
      if (wide) {
        const pw = Math.min(310, Math.max(250, W * 0.27));
        const th = 128;
        pan = { x: W - pw - 14, y: 14, w: pw, h: H - th - 34 };
        tray = { x: 14, y: H - th - 12, w: W - 28, h: th };
        pat = { x: 14, y: 14, w: W - pw - 42, h: H - th - 40 };
      } else {
        const per = Math.max(3, Math.floor((W - 28) / 92));
        const th = 28 + Math.ceil(TOKENS.length / per) * 64;
        const ph = 232;
        tray = { x: 10, y: H - th - 8, w: W - 20, h: th };
        pan = { x: 10, y: tray.y - ph - 8, w: W - 20, h: ph };
        pat = { x: 10, y: 8, w: W - 20, h: pan.y - 16 };
      }
      const s = Math.max(0.2, Math.min(pat.w / 690, pat.h / 410));
      const ox = pat.x + (pat.w - 690 * s) / 2 + 5 * s, oy = pat.y + (pat.h - 410 * s) / 2 - 10 * s;
      L = { W, H, wide, pat, tray, pan, s, ox, oy };
      panel.style.left = pan.x + "px"; panel.style.top = pan.y + "px"; panel.style.width = pan.w + "px"; panel.style.height = pan.h + "px";
      // tray positions
      const per = Math.max(3, Math.floor((tray.w - 16) / 92));
      let n = 0;
      const rr = wide ? 22 : 19;
      tokens.forEach((t) => {
        if (t.slot !== null || t.lost) return;
        const row = Math.floor(n / per), col = n % per;
        t.tx = tray.x + 16 + col * ((tray.w - 32) / per) + (tray.w - 32) / per / 2;
        t.ty = tray.y + 44 + row * (wide ? 74 : 64);
        t.r = rr;
        n++;
      });
      slots.forEach((sl) => { sl.sx = L.ox + sl.x * s; sl.sy = L.oy + sl.y * s; sl.r = Math.max(13, 19 * s); });
      tokens.forEach((t) => { if (t.slot !== null) { const sl = slots[t.slot]; t.tx = sl.sx; t.ty = sl.sy; t.r = sl.r - 2; } });
    }

    // ---- the night, worked out from the packing --------------------------------------------
    function warmIn(si) { return slots.filter((s) => s.seam === si && s.token === null).length; }
    function canPlay(game) { return game.needs.some((id) => warmIn(SEAMS.findIndex((s) => s.id === id)) > 0); }
    function simulate() {
      const fill = slots.map((s) => s.token);
      const events = [];
      const lostTray = tokens.filter((t) => t.slot === null).map((t) => t.i);
      lostTray.forEach((i) => events.push({ kind: "tray", token: i, text: `${TOKENS[i][0]} is left in the tray. It unravels.` }));
      const w = slots.filter((s) => s.token === null).length;
      function take(si, why) {
        for (let step = 0; step < SEAMS.length; step++) {
          const sj = (si + step) % SEAMS.length;
          const idx = slots.findIndex((s, k) => s.seam === sj && !s.bound && fill[k] !== null);
          if (idx >= 0) {
            const tk = fill[idx]; fill[idx] = null;
            events.push({ kind: "cost", token: tk, text: `${why}: ${TOKENS[tk][0]} goes from the ${SEAMS[sj].name.toLowerCase()}${step ? " (its own seam was empty)" : ""}.` });
            return;
          }
        }
        events.push({ kind: "none", text: `${why}: nothing left to take.` });
      }
      let joined = 0;
      GAMES.forEach((gm) => {
        if (join[gm.id] && canPlay(gm)) {
          joined++;
          // the seam that plays it: the needed seam with the most warmth
          let best = -1, bw = -1;
          gm.needs.forEach((id) => { const si = SEAMS.findIndex((s) => s.id === id); if (warmIn(si) > bw) { bw = warmIn(si); best = si; } });
          take(best, `${gm.name}, joined`);
        } else {
          events.push({ kind: "hold", text: `${gm.name}: you hold. The hunger is not fed.` });
        }
      });
      const hunger = 58 + 50 * (1 + 0.15 * w) - 20 * joined;
      const lurches = hunger >= 100 ? 1 + Math.floor((hunger - 100) / 45) : 0;
      let warmest = 0, ww = -1;
      SEAMS.forEach((s, si) => { if (warmIn(si) > ww) { ww = warmIn(si); warmest = si; } });
      for (let k = 0; k < lurches; k++) { take(warmest, `Lurch at 100, the ${SEAMS[warmest].name.toLowerCase()} jerks`); take(warmest, "The same lurch"); }
      const kept = fill.filter((x) => x !== null).length;
      return { w, joined, hunger: Math.round(hunger), lurches, warmest, events, kept, fill };
    }

    function renderPanel() {
      const r = simulate();
      const gameRows = GAMES.map((gm) => {
        const ok = canPlay(gm);
        if (!ok) join[gm.id] = join[gm.id] && ok;
        return `<div class="${PRE}row"><b style="min-width:76px">${gm.name}</b>
          <button type="button" data-g="${gm.id}" data-v="1" aria-pressed="${!!join[gm.id]}" ${ok ? "" : "disabled"}>Join</button>
          <button type="button" data-g="${gm.id}" data-v="0" aria-pressed="${!join[gm.id]}">Hold</button>
          <small>${ok ? `needs a warm slot in ${gm.needName}` : `no warm slot in ${gm.needName}`}</small></div>`;
      }).join("");
      const sel = held !== null ? `<div class="${PRE}row"><small>Holding: <b>${TOKENS[held][0]}</b></small></div>` : "";
      panel.innerHTML = `<h3>Tonight: night 2</h3>${gameRows}
        <div class="${PRE}row" style="justify-content:space-between;align-items:flex-end"><div><h3 style="margin:6px 0 0">Hunger rate</h3><span class="${PRE}rate">+${r.w * 15}%</span> <small>${r.w} warm</small></div>
        <div style="text-align:right"><small>by dawn</small><br><b>${r.hunger}</b> <small>/ 100</small></div></div>
        <div class="${PRE}row"><small>${r.lurches ? `<b style="color:${C.red}">${r.lurches} lurch${r.lurches > 1 ? "es" : ""}</b>: two memories each from the ${SEAMS[r.warmest].name.toLowerCase()} (the warmest)` : "No lurch tonight at this packing."}</small></div>
        <div class="${PRE}row"><small>Kept by morning: <b>${r.kept}</b> of ${TOKENS.length}. The Warning needs 5.</small></div>${sel}
        <button type="button" class="${PRE}close">Close the seams</button>`;
      panel.querySelectorAll("button[data-g]").forEach((b) => b.addEventListener("click", () => { join[b.dataset.g] = b.dataset.v === "1"; renderPanel(); }));
      panel.querySelector("." + PRE + "close").addEventListener("click", closeSeams);
    }

    // ---- drawing --------------------------------------------------------------------------
    function smooth(pts) {
      g.beginPath();
      const n = pts.length;
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      let m = mid(pts[n - 1], pts[0]);
      g.moveTo(m[0], m[1]);
      for (let i = 0; i < n; i++) { const p = pts[i], q = mid(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
      g.closePath();
    }
    function inset(pts, d) {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      return pts.map((p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] - dx / l * d, p[1] - dy / l * d]; });
    }
    function arrow(x1, y1, x2, y2) {
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      [[x1, y1, 1], [x2, y2, -1]].forEach(([x, y, d]) => { g.beginPath(); g.moveTo(x - 4, y + 7 * d); g.lineTo(x, y); g.lineTo(x + 4, y + 7 * d); g.stroke(); });
    }
    function drawToken(t, x, y, r, alpha = 1) {
      const [col, letter] = WHO[t.who];
      g.save(); g.globalAlpha = alpha;
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.arc(x + 1.5, y + 2, r, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = C.bone; g.lineWidth = 1.4; g.setLineDash([2.5, 2]); g.beginPath(); g.arc(x, y, r - 3.5, 0, 7); g.stroke(); g.setLineDash([]);
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      g.fillStyle = C.ink; g.font = `italic ${Math.round(r * 0.95)}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(letter, x, y + 1);
      g.restore();
    }
    function label(text, x, y, max, size) {
      g.font = `${size}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "top";
      const words = text.split(" "); let line = "", yy = y;
      for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, yy); line = w; yy += size + 1; } else line = t; }
      g.fillText(line, x, yy);
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, s, ox, oy, tray } = L;
      const dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // cutting table
      g.fillStyle = "#5a3f2b"; g.fillRect(0, 0, W, H);
      g.globalAlpha = 0.08; g.fillStyle = "#000";
      for (let y = 0; y < H; y += 7) g.fillRect(0, y, W, 1);
      g.globalAlpha = 1;
      const r = simulate();
      const pulse = api.reducedMotion ? 0.6 : 0.5 + 0.5 * Math.sin(now / 420);
      // pieces
      SEAMS.forEach((sm, si) => {
        g.save(); g.translate(ox, oy); g.scale(s, s);
        g.fillStyle = "rgba(0,0,0,.18)"; g.save(); g.translate(4, 5); smooth(sm.pts); g.fill(); g.restore();
        g.fillStyle = "rgba(239,229,207,.86)"; smooth(sm.pts); g.fill();
        // tissue crinkle
        g.save(); smooth(sm.pts); g.clip();
        g.strokeStyle = "rgba(120,90,60,.10)"; g.lineWidth = 1;
        for (let k = -400; k < 700; k += 23) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 160, 420); g.stroke(); }
        // warm glow through the tissue for each empty slot
        slots.forEach((sl) => { if (sl.seam !== si || sl.token !== null) return;
          const gr = g.createRadialGradient(sl.x, sl.y, 2, sl.x, sl.y, 46);
          gr.addColorStop(0, `rgba(227,154,45,${0.55 + 0.25 * pulse})`); gr.addColorStop(0.5, `rgba(184,50,42,${0.22 + 0.1 * pulse})`); gr.addColorStop(1, "rgba(184,50,42,0)");
          g.fillStyle = gr; g.fillRect(sl.x - 50, sl.y - 50, 100, 100); });
        g.restore();
        g.strokeStyle = C.ink; g.lineWidth = 1.2; smooth(sm.pts); g.stroke();
        g.setLineDash([6, 4]); g.lineWidth = 1; g.strokeStyle = "rgba(42,33,27,.8)"; smooth(inset(sm.pts, 9)); g.stroke(); g.setLineDash([]);
        // notches
        g.fillStyle = C.ink;
        [0, Math.floor(sm.pts.length / 2)].forEach((k) => { const a = sm.pts[k], b = sm.pts[(k + 1) % sm.pts.length];
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; g.beginPath(); g.moveTo(mx - 4, my); g.lineTo(mx + 4, my); g.lineTo(mx, my + (my < 200 ? 6 : -6)); g.closePath(); g.fill(); });
        g.strokeStyle = "rgba(42,33,27,.7)"; g.lineWidth = 1; arrow(sm.grain[0][0], sm.grain[0][1], sm.grain[1][0], sm.grain[1][1]);
        g.fillStyle = C.ink; g.font = "600 11px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic";
        const top = Math.min(...sm.pts.map((p) => p[1])), cx = sm.slots.reduce((a, p) => a + p[0], 0) / sm.slots.length;
        g.fillText(sm.name, cx, top + 26);
        g.font = "8.5px Karla,Arial,sans-serif"; g.fillText(`CUT 2 · SEAM ${sm.seam}`, cx, top + 37);
        if (si === r.warmest && r.lurches) { g.fillStyle = C.red; g.font = "600 9px Karla,Arial,sans-serif"; g.fillText("LURCH HITS HERE", cx, Math.max(...sm.pts.map((p) => p[1])) - 12); }
        g.restore();
      });
      // slot hollows
      slots.forEach((sl, k) => {
        g.strokeStyle = sl.bound ? C.gold : C.ink; g.lineWidth = sl.bound ? 2.6 : 1.2;
        g.setLineDash(sl.bound ? [] : [3, 2.5]);
        g.fillStyle = sl.token === null ? "rgba(90,50,30,.15)" : "rgba(0,0,0,0)";
        g.beginPath(); g.arc(sl.sx, sl.sy, sl.r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
        const focus = (held !== null || dragging) && hover === "s" + k;
        const kb = kbUsed && kbTargets()[cursor] === "s" + k;
        if (focus || kb) { g.strokeStyle = C.bone; g.lineWidth = 2.5; g.beginPath(); g.arc(sl.sx, sl.sy, sl.r + 5, 0, 7); g.stroke(); }
        if (sl.bound && sl.token === null) { g.fillStyle = C.gold; g.font = "600 8px Karla,Arial,sans-serif"; g.textAlign = "center"; g.fillText("BOUND", sl.sx, sl.sy + sl.r + 9); }
      });
      // tray
      g.fillStyle = "rgba(42,33,27,.55)"; g.fillRect(tray.x, tray.y, tray.w, tray.h);
      g.strokeStyle = "rgba(246,241,228,.6)"; g.setLineDash([5, 4]); g.strokeRect(tray.x + 4, tray.y + 4, tray.w - 8, tray.h - 8); g.setLineDash([]);
      g.fillStyle = C.bone; g.font = "600 10px Karla,Arial,sans-serif"; g.textAlign = "left"; g.textBaseline = "top";
      g.fillText("TRAY: unpacked memories unravel when you close", tray.x + 12, tray.y + 10);
      if (L.wide) { g.textAlign = "right"; g.fillText("PATTERN No. 6 · ONE BODY, SIX SEAMS", tray.x + tray.w - 12, tray.y + 10); }
      // tokens
      tokens.forEach((t) => {
        if (t.lost && t.fadeStart) t.fade = Math.min(1, (now - t.fadeStart) / (api.reducedMotion ? 1 : 800));
        if (t.lost && t.fade >= 1) return;
        if (dragging && dragging.t === t) return;
        const a = t.lost ? 1 - t.fade : 1;
        drawToken(t, t.tx, t.ty, t.r, a);
        g.fillStyle = t.slot === null ? C.bone : C.ink; g.globalAlpha = a;
        if (t.slot === null) label(t.name, t.tx, t.ty + t.r + 3, 86, 10.5);
        else if (s > 0.85) label(t.name, t.tx, t.ty + t.r + 2, 70 * s, 8.5);
        g.globalAlpha = 1;
        const kb = kbUsed && kbTargets()[cursor] === "t" + t.i;
        if (held === t.i || kb || (!dragging && held === null && hover === "t" + t.i)) {
          g.strokeStyle = held === t.i ? C.amber : C.bone; g.lineWidth = 2.5; g.beginPath(); g.arc(t.tx, t.ty, t.r + 5, 0, 7); g.stroke();
        }
      });
      if (dragging) drawToken(dragging.t, dragging.x, dragging.y, 24);
      K.frame(draw);
    }

    // ---- input ----------------------------------------------------------------------------
    function hit(x, y) {
      for (const t of tokens) if (!t.lost && Math.hypot(t.tx - x, t.ty - y) <= t.r + 6) return "t" + t.i;
      for (let k = 0; k < slots.length; k++) if (Math.hypot(slots[k].sx - x, slots[k].sy - y) <= slots[k].r + 10) return "s" + k;
      return null;
    }
    function place(ti, k) {
      const t = tokens[ti];
      if (k === null) { if (t.slot !== null) slots[t.slot].token = null; t.slot = null; }
      else {
        const sl = slots[k];
        if (sl.token !== null && sl.token !== ti) { const other = tokens[sl.token]; other.slot = t.slot; if (t.slot !== null) slots[t.slot].token = other.i; }
        else if (t.slot !== null) slots[t.slot].token = null;
        sl.token = ti; t.slot = k;
      }
      layout(); renderPanel();
    }
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || closing) return;
      const [x, y] = pt(e), h = hit(x, y);
      if (h && h[0] === "t") { const t = tokens[+h.slice(1)]; dragging = { t, x, y, moved: false, sx: x, sy: y }; cv.setPointerCapture(e.pointerId); }
      else if (h && h[0] === "s" && held !== null) { place(held, +h.slice(1)); held = null; renderPanel(); }
    });
    K.on(cv, "pointermove", (e) => {
      const [x, y] = pt(e);
      hover = hit(x, y);
      if (dragging) { dragging.x = x; dragging.y = y; if (Math.hypot(x - dragging.sx, y - dragging.sy) > 6) dragging.moved = true; }
    });
    K.on(cv, "pointerup", (e) => {
      if (!dragging) return;
      const [x, y] = pt(e), d = dragging; dragging = null;
      if (!d.moved) { held = held === d.t.i ? null : d.t.i; renderPanel(); return; }
      let best = null, bd = 1e9;
      slots.forEach((sl, k) => { const dd = Math.hypot(sl.sx - x, sl.sy - y); if (dd < bd && dd < sl.r + 22) { bd = dd; best = k; } });
      place(d.t.i, best); held = null; renderPanel();
    });
    // keyboard: arrows move a cursor over tokens and slots; Enter picks up and puts down; Backspace sends to tray
    function kbTargets() {
      return held === null ? tokens.filter((t) => !t.lost).sort((a, b) => (a.slot === null ? 0 : 1) - (b.slot === null ? 0 : 1)).map((t) => "t" + t.i) : slots.map((_, k) => "s" + k);
    }
    K.on(wrap, "keydown", (e) => {
      if (!started || closing) return;
      kbUsed = true;
      const list = kbTargets();
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { cursor = (cursor + 1) % list.length; e.preventDefault(); }
      else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { cursor = (cursor - 1 + list.length) % list.length; e.preventDefault(); }
      else if (e.key === "Enter" || e.key === " ") {
        if (e.target.tagName === "BUTTON") return;
        e.preventDefault();
        const id = list[cursor];
        if (held === null && id && id[0] === "t") { held = +id.slice(1); cursor = 0; }
        else if (held !== null && id) { place(held, +id.slice(1)); held = null; cursor = 0; }
        renderPanel();
      } else if ((e.key === "Backspace" || e.key === "Delete") && held !== null) { place(held, null); held = null; cursor = 0; renderPanel(); }
      else if (e.key === "Escape") { held = null; renderPanel(); }
    });
    wrap.tabIndex = 0;

    // ---- closing the seams plays the night ------------------------------------------------
    function closeSeams() {
      if (closing) return;
      closing = true; held = null;
      const r = simulate();
      panel.querySelectorAll("button").forEach((b) => (b.disabled = true));
      const log = document.createElement("div");
      log.className = PRE + "log";
      log.innerHTML = `<p><b>The seams close. The night runs.</b></p>`;
      wrap.appendChild(log);
      const step = api.reducedMotion ? 250 : 900;
      r.events.forEach((ev, k) => K.after(step * (k + 1), () => {
        const p = document.createElement("p"); p.textContent = ev.text; log.appendChild(p); log.scrollTop = 1e6;
        if (ev.token !== undefined) {
          const t = tokens[ev.token]; t.lost = true;
          if (t.slot !== null) { slots[t.slot].token = null; t.slot = null; }
          t.fadeStart = performance.now();
        }
      }));
      K.after(step * (r.events.length + 2), () => {
        const kept = tokens.filter((t) => !t.lost).map((t) => t.name);
        const best = api.store.get("best", 0);
        if (r.kept > best) api.store.set("best", r.kept);
        const warn = r.kept >= 5 ? "Enough is left of you for the Warning." : "Too little is left of you for the Warning.";
        api.end({ outcome: "done", text: `Kept ${r.kept} of ${TOKENS.length}: ${kept.join(", ") || "nothing"}. ${warn} ${r.joined ? `You joined ${r.joined} game${r.joined > 1 ? "s" : ""}.` : "You held through both games."}` });
      });
    }

    // ---- intro ----------------------------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>Stuffing</h2>
      <p>What you pack is what you keep. Drag memories from the tray into the hollows of your seams (or tap one, then a hollow; arrows and Enter work too).</p>
      <p>An empty slot is warm: the hunger lives there, and each adds 15 percent. Tonight's games need warmth in their seam. Whatever is left in the tray unravels when you close.</p>
      <button type="button">Start</button></div>`;
    wrap.appendChild(intro);
    const startBtn = intro.querySelector("button");
    K.on(startBtn, "click", () => { intro.remove(); started = true; wrap.focus(); });
    startBtn.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    layout(); renderPanel(); K.frame(draw);
    return { unmount() { K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

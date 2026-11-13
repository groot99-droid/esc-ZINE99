// The Stuffed Ones: The Hand-Sewn Book (1D, translation), drawn as blackwork embroidery on linen.
//
// DESIGN.md section 11 "The Hand-Sewn Book", appearance 3 (`a5_book_3`): the world runs, 180
// seconds with the toys closing in (a ring of glows tightening at the page's edge). Three spreads
// in rising difficulty, as the design's difficulty table: S1 four strips and one rule, S3 six strips
// and two rules, S5 eight slots, three rules and one decoy strip that fits no slot. Each strip's
// thread colour is its role (red an act, black a thing, white who) and a slot takes only its
// colour. The order rules arrive one per spread here: a needle glyph comes before a thread glyph
// (directly before: the needle leads its thread); a knot glyph ends a line; a glyph doubled means
// "many" (it follows the glyph it repeats). When every slot holds a strip legally, the spread pulls
// taut and its translation appears in the journal hand.
//
// Actions: Place a strip (drag, or tap then tap; arrows and Enter). Read the walls (from spread III;
// R): turn to the glyphs stitched into the ritual room's walls to learn the names of this spread's
// glyphs, while the glows creep 8 seconds closer. Mabel's sampler (from spread V; H, twice): the
// design's one solved line, shown here as one strip set in its place. Outcomes: all three read (win),
// one or two read (done), none (lose).
//
// Translations are the spread table's lines, verbatim from the vault:
// creative-writing/vault/02_Novels/01_The_Stuffed_Ones.md (ch 11 and ch 12; DESIGN.md sections 3, 11).
// The opening quotes ch 11 as DESIGN.md section 3 item 12 does; Marcus's line is DESIGN.md
// section 6's (added). Other narrative lines are written for the game (refine additions list).
const PRE = "stuffed-ones-hand-sewn-book-";
const C = { linen: "#e3d6bb", linenD: "#cdbd9c", silk: "#1d1712", red: "#b8322a", white: "#f6f1e4", black: "#1d1712",
  cedar: "#6b4a32", cedarD: "#3d2a1d", amber: "#e39a2d", ink: "#2a211b", moss: "#4f6b2c" };

// Glyphs on a 4 x 4 counted grid: [x1, y1, x2, y2] segments of black silk.
const GLYPHS = {
  needle: { name: "needle", segs: [[2, 0, 2, 4], [1, 1, 2, 0], [3, 1, 2, 0], [1.5, 3, 2.5, 3]] },
  thread: { name: "thread", segs: [[0, 2, 1, 1], [1, 1, 2, 3], [2, 3, 3, 1], [3, 1, 4, 2]] },
  knot: { name: "knot", segs: [[1, 1, 3, 1], [3, 1, 3, 3], [3, 3, 1, 3], [1, 3, 1, 1], [1, 1, 3, 3], [3, 1, 1, 3], [2, 0, 2, 1], [2, 3, 2, 4]] },
  hand: { name: "hand", segs: [[0, 4, 4, 4], [1, 4, 1, 1], [2, 4, 2, 0], [3, 4, 3, 1], [4, 4, 4, 2]] },
  mouth: { name: "mouth", segs: [[0, 1, 2, 3], [2, 3, 4, 1], [0, 1, 4, 1], [1, 2, 3, 2]] },
  cloth: { name: "cloth", segs: [[0, 0, 4, 0], [0, 0, 0, 4], [0, 4, 4, 4], [4, 0, 4, 4], [0, 2, 4, 2], [2, 0, 2, 4]] },
  they: { name: "they", segs: [[0, 4, 1, 0], [1, 0, 2, 4], [2, 4, 3, 0], [3, 0, 4, 4]] },
};
const RULES = [
  { id: "needle", text: "a needle comes right before its thread" },
  { id: "knot", text: "a knot ends the line" },
  { id: "many", text: "doubled means many: it follows what it repeats" },
];
const SPREADS = [
  { no: "I", title: "Summoned", rules: 1, slots: ["white", "red", "red", "black"],
    strips: [["they", "white"], ["needle", "red"], ["thread", "red"], ["cloth", "black"]],
    text: ["They weren't made.", "They were summoned."] },
  { no: "III", title: "Fed", rules: 2, slots: ["white", "red", "red", "black", "red", "black"],
    strips: [["hand", "white"], ["needle", "red"], ["thread", "red"], ["mouth", "red"], ["cloth", "black"], ["knot", "black"]],
    text: ["how to feed it"] },
  { no: "V", title: "The filling", rules: 3, slots: ["white", "white", "red", "black", "black", "red", "red", "black"],
    strips: [["hand", "white"], ["hand", "white", true], ["mouth", "red"], ["needle", "red"], ["thread", "red"], ["cloth", "black"], ["cloth", "black", true], ["knot", "black"], ["knot", "black", true]],
    text: ["We were the next filling.", "The ritual had already begun the moment we stepped inside."] },
];
const WALL_COST = 8, SAMPLER = 2;

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

// Rule check over a filled-or-partial row: returns a Set of violated rule ids and the bad slots.
function violations(row, nRules) {
  const bad = new Set(), at = new Set();
  const n = row.length;
  row.forEach((s, i) => {
    if (!s) return;
    if (nRules >= 1) {
      if (s.glyph === "needle" && !s.doubled) { const nx = row[i + 1]; if (i === n - 1 || (nx && !(nx.glyph === "thread" && !nx.doubled))) { bad.add("needle"); at.add(i); } }
      if (s.glyph === "thread" && !s.doubled) { const pv = row[i - 1]; if (i === 0 || (pv && !(pv.glyph === "needle" && !pv.doubled))) { bad.add("needle"); at.add(i); } }
    }
    if (nRules >= 2 && s.glyph === "knot" && !s.doubled && i !== n - 1) { bad.add("knot"); at.add(i); }
    if (nRules >= 3 && s.doubled) { const pv = row[i - 1]; if (i === 0 || (pv && !(pv.glyph === s.glyph && !pv.doubled))) { bad.add("many"); at.add(i); } }
  });
  return { bad, at };
}

export default {
  mount(root, api) {
    const K = kit();
    const rng = api.rng("stuffed-ones/book");
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    const linenCss = `background-color:${C.linen};background-image:repeating-linear-gradient(0deg,rgba(120,95,60,.11) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(120,95,60,.11) 0 1px,transparent 1px 3px)`;
    const zig = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M0 6 L3 2 L6 6 L9 2 L12 6' fill='none' stroke='%231d1712' stroke-width='1.4'/%3E%3C/svg%3E")`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.cedarD};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}acts{position:absolute;display:flex;gap:8px;z-index:2;flex-wrap:wrap;justify-content:flex-end}
.${PRE}acts button{font:600 14px Karla,Arial,sans-serif;${linenCss};color:${C.ink};border:2px solid ${C.silk};outline:1px dashed ${C.silk};outline-offset:-6px;padding:9px 14px;min-height:44px;cursor:pointer}
.${PRE}acts button small{font:12px Karla,Arial,sans-serif;opacity:.8;margin-left:4px}
.${PRE}acts button:hover:not(:disabled){outline-style:solid}
.${PRE}acts button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}acts button[hidden]{display:none}
.${PRE}beat{position:absolute;left:50%;transform:translateX(-50%);bottom:76px;width:min(500px,calc(100% - 32px));box-sizing:border-box;${linenCss};color:${C.ink};border:2px solid ${C.silk};padding:16px 18px 12px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none;box-shadow:0 6px 18px rgba(0,0,0,.45)}
.${PRE}beat::before{content:"";position:absolute;left:8px;right:8px;top:4px;height:8px;background:${zig} repeat-x}
.${PRE}beat b{font:italic 400 18px 'IM Fell English',Georgia,serif;display:block}
.${PRE}beat q{font:italic 17px 'IM Fell English',Georgia,serif;quotes:"“" "”"}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(29,23,18,.66);z-index:4;padding:16px;overflow:auto}
.${PRE}card{width:min(480px,100%);${linenCss};color:${C.ink};border:3px solid ${C.silk};padding:26px 24px 20px;position:relative}
.${PRE}card::before,.${PRE}card::after{content:"";position:absolute;left:10px;right:10px;height:8px;background:${zig} repeat-x}
.${PRE}card::before{top:8px}.${PRE}card::after{bottom:8px}
.${PRE}card h2{margin:0;font:400 34px/1.05 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}q{margin:8px 0 6px;font:italic 16px/1.4 'IM Fell English',Georgia,serif;opacity:.88}
.${PRE}card .${PRE}goal{margin:0 0 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}legend{border-top:1.5px dashed ${C.silk};border-bottom:1.5px dashed ${C.silk};padding:6px 0}
.${PRE}legend div{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:4px 0}
.${PRE}legend i{display:block;height:6px;border-radius:3px}
.${PRE}legend kbd{font:600 12px ui-monospace,Menlo,monospace;border:1px solid ${C.silk};padding:1px 6px;background:${C.white}}
.${PRE}card button{font:600 15px Karla,Arial,sans-serif;background:${C.silk};color:${C.linen};border:0;padding:11px 24px;cursor:pointer;margin-top:14px;min-height:44px}
.${PRE}card button:focus-visible{outline:3px solid ${C.red};outline-offset:2px}
.${PRE}card label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin-top:10px}
.${PRE}card .${PRE}kind{margin:10px 0 0;font:italic 15px 'IM Fell English',Georgia,serif;color:${C.red}}
</style><canvas aria-label="An open hand-sewn book: loose glyph strips on the left page, coloured slots on the right"></canvas>
<div class="${PRE}acts"><button type="button" data-a="walls" hidden>Read the walls <small>R · −${WALL_COST} s</small></button><button type="button" data-a="sampler" hidden>Mabel's sampler <small>H · ×${SAMPLER}</small></button></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const acts = wrap.querySelector("." + PRE + "acts"), beatEl = wrap.querySelector("." + PRE + "beat");
    const wallsBtn = acts.querySelector('[data-a="walls"]'), sampBtn = acts.querySelector('[data-a="sampler"]');

    let started = false, over = false, speed = 1, total = 180, left = 180, idle = 0;
    let tautStart = 0, si = 0, strips = [], row = [], taut = 0, read = [];
    const named = new Set(["they", "needle", "thread", "cloth"]);
    let kbUsed = false, drag = null, held = null, cursor = 0, msg = "", msgT = 0, msgCol = C.red, shakeSlot = -1, shakeT = 0, hintPair = null;
    let samplers = SAMPLER, wallsUsed = 0, lastViol = 0, creep = 0, marcusSaid = false, edgeSaid = false, hover = null;
    const pops = [];
    let L = null, beatTimer = 0;

    function beat(title, text, quote, ms = 5000) {
      beatEl.innerHTML = "";
      const b = document.createElement("b"); b.textContent = title; beatEl.appendChild(b);
      if (quote) { const q = document.createElement("q"); q.textContent = quote; beatEl.appendChild(q); if (text) beatEl.appendChild(document.createTextNode(" ")); }
      if (text) beatEl.appendChild(document.createTextNode(text));
      beatEl.style.opacity = 1;
      clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function say(m, col = C.red) { msg = m; msgT = performance.now(); msgCol = col; }
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }

    function loadSpread(k) {
      const sp = SPREADS[k];
      row = sp.slots.map(() => null);
      strips = sp.strips.map(([glyph, colour, doubled], i) => ({ i, glyph, colour, doubled: !!doubled, slot: null, rx: rng(), ry: rng(), rot: (rng() - 0.5) * 0.3 }));
      for (let i = strips.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [strips[i].rx, strips[j].rx] = [strips[j].rx, strips[i].rx]; }
      taut = 0; tautStart = 0; held = null; cursor = 0; idle = 0; hintPair = null;
      layout(); syncButtons();
    }

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 760;
      const pad = 14;
      const book = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 - (wide ? 0 : 58) };
      let lp, rp;
      if (wide) { const half = book.w / 2; lp = { x: book.x, y: book.y, w: half, h: book.h }; rp = { x: book.x + half, y: book.y, w: half, h: book.h }; }
      else { const hh = Math.min(book.h * 0.52, 400); rp = { x: book.x, y: book.y, w: book.w, h: hh }; lp = { x: book.x, y: book.y + hh, w: book.w, h: book.h - hh }; }
      const sp = SPREADS[si];
      const n = sp.slots.length;
      const sz = Math.max(36, Math.min(84, (rp.w - 40) / n - 6, rp.h * 0.2));
      const gap = Math.min(12, sz * 0.16);
      const rowW = n * sz + (n - 1) * gap;
      const slotY = rp.y + Math.max(wide ? 120 : 128, rp.h * 0.26);
      const slotPos = sp.slots.map((_, k) => ({ x: rp.x + (rp.w - rowW) / 2 + k * (sz + gap), y: slotY }));
      const cols = Math.max(2, Math.min(Math.floor((lp.w - 40) / (sz * 1.3)), Math.ceil(Math.sqrt(strips.length * lp.w / Math.max(1, lp.h)))));
      const rows = Math.ceil(strips.length / cols);
      const cw = (lp.w - 40) / cols, ch = (lp.h - 70) / rows;
      const order = [...strips].sort((a, b) => a.rx - b.rx);
      order.forEach((s, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        s.hx = lp.x + 20 + c * cw + (cw - sz) / 2 + (s.ry - 0.5) * Math.max(0, cw - sz) * 0.6;
        s.hy = lp.y + 34 + r * ch + (ch - sz - 16) / 2 + ((s.rx * 7 % 1) - 0.5) * Math.max(0, ch - sz - 16) * 0.5;
      });
      L = { W, H, wide, book, lp, rp, sz, slotPos };
      strips.forEach((s) => { if (s.slot !== null) { s.x = slotPos[s.slot].x; s.y = slotPos[s.slot].y; } else { s.x = s.hx; s.y = s.hy; } });
      if (wide) { acts.style.right = (W - rp.x - rp.w + 18) + "px"; acts.style.bottom = "30px"; acts.style.left = "auto"; }
      else { acts.style.right = "14px"; acts.style.left = "14px"; acts.style.bottom = "10px"; acts.style.justifyContent = "center"; }
    }

    // ---- drawing ---------------------------------------------------------------------------
    function glyph(name, x, y, size, col = C.silk, lw) {
      const u = size / 4;
      g.strokeStyle = col; g.lineWidth = lw || Math.max(1.6, size / 14); g.lineCap = "square";
      g.beginPath();
      GLYPHS[name].segs.forEach(([a, b, c, d]) => { g.moveTo(x + a * u, y + b * u); g.lineTo(x + c * u, y + d * u); });
      g.stroke();
      g.fillStyle = "rgba(29,23,18,.25)";
      for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) g.fillRect(x + i * u - 0.6, y + j * u - 0.6, 1.2, 1.2);
    }
    function border(x, y, w, h, colour, dashed = true, lw = 2.2) {
      const col = colour === "red" ? C.red : colour === "white" ? C.white : C.black;
      if (colour === "white") { g.strokeStyle = "rgba(29,23,18,.55)"; g.lineWidth = lw + 2; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); }
      g.strokeStyle = col; g.lineWidth = lw; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); g.setLineDash([]);
    }
    function drawStrip(s, x, y, sz, lift) {
      g.save();
      if (s.slot === null && !lift) { g.translate(x + sz / 2, y + sz / 2); g.rotate(s.rot); g.translate(-x - sz / 2, -y - sz / 2); }
      g.fillStyle = lift ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.18)"; g.fillRect(x + (lift ? 7 : 3), y + (lift ? 9 : 4), sz, sz);
      g.fillStyle = "#ece2cb"; g.fillRect(x, y, sz, sz);
      border(x + 3, y + 3, sz - 6, sz - 6, s.colour, true, 2.4);
      if (s.doubled) { const q = sz * 0.36; glyph(s.glyph, x + sz * 0.1, y + (sz - q) / 2, q); glyph(s.glyph, x + sz * 0.54, y + (sz - q) / 2, q); }
      else { const q = sz * 0.56; glyph(s.glyph, x + (sz - q) / 2, y + (sz - q) / 2, q); }
      g.restore();
      if (named.has(s.glyph) && !lift) {
        g.fillStyle = C.ink; g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top";
        g.fillText(s.doubled ? `many ${s.glyph}s` : s.glyph, x + sz / 2, y + sz + 4);
      }
    }
    function linen(x, y, w, h) {
      g.fillStyle = C.linen; g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(120,95,60,.10)";
      for (let k = 0; k < w; k += 3) g.fillRect(x + k, y, 1, h);
      for (let k = 0; k < h; k += 3) g.fillRect(x, y + k, w, 1);
    }
    function edgeBand(x, y, w) {
      g.strokeStyle = C.silk; g.lineWidth = 1.4; g.beginPath();
      for (let k = 0; k <= w - 16; k += 8) { g.moveTo(x + 8 + k, y); g.lineTo(x + 12 + k, y - 4); g.lineTo(x + 16 + k, y); }
      g.stroke();
    }
    function wrapText(t, x, y, max, lh) {
      const words = t.split(" "); let line = "";
      for (const w of words) { const s = line ? line + " " + w : w; if (g.measureText(s).width > max && line) { g.fillText(line, x, y); line = w; y += lh; } else line = s; }
      g.fillText(line, x, y);
      return y;
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, lp, rp, sz, slotPos, book, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.cedarD; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(book.x + 6, book.y + 8, book.w, book.h);
      linen(lp.x, lp.y, lp.w, lp.h); linen(rp.x, rp.y, rp.w, rp.h);
      const gr = wide ? g.createLinearGradient(rp.x - 24, 0, rp.x + 24, 0) : g.createLinearGradient(0, lp.y - 18, 0, lp.y + 18);
      gr.addColorStop(0, "rgba(60,40,25,0)"); gr.addColorStop(0.5, "rgba(60,40,25,.35)"); gr.addColorStop(1, "rgba(60,40,25,0)");
      g.fillStyle = gr; if (wide) g.fillRect(rp.x - 24, book.y, 48, book.h); else g.fillRect(book.x, lp.y - 18, book.w, 36);
      [lp, rp].forEach((p) => { edgeBand(p.x, p.y + 18, p.w); edgeBand(p.x, p.y + p.h - 12, p.w); });
      const sp = SPREADS[si];
      // right page: header with the spread and the time
      g.fillStyle = C.ink; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.font = `italic ${Math.round(Math.min(28, rp.w / 16))}px 'IM Fell English',Georgia,serif`;
      g.fillText(`Spread ${sp.no} · ${sp.title}`, rp.x + 22, rp.y + 52);
      // the glows' distance, as a stitched bar: the pressure, always shown
      const frac = Math.max(0, left / total);
      const tbx = rp.x + 22, tby = rp.y + 66, tbw = Math.min(rp.w - 44, 360);
      g.strokeStyle = C.silk; g.lineWidth = 1.2; g.strokeRect(tbx, tby, tbw, 12);
      const cells = Math.floor((tbw - 4) / 8);
      for (let k = 0; k < cells; k++) { if (k / cells > frac) break; g.fillStyle = frac < 0.2 ? C.red : C.silk; g.fillRect(tbx + 2 + k * 8, tby + 2, 6, 8); }
      g.font = `700 ${left < 30 * speed ? 15 : 14}px Karla,Arial,sans-serif`; g.fillStyle = left < 30 * speed ? C.red : C.ink; g.textAlign = "left";
      g.fillText(rp.w > 520 ? `${Math.ceil(left)} s before the glows reach the page · spread ${si + 1} of ${SPREADS.length}` : `${Math.ceil(left)} s to the glows · spread ${si + 1} of ${SPREADS.length}`, tbx, tby + 30);
      // glossary, top right on wide pages
      if (wide && rp.w > 560) {
        const gl = Object.keys(GLYPHS).filter((k) => strips.some((s) => s.glyph === k) || read.length);
        g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.fillStyle = C.ink;
        const gs = 18, gx0 = rp.x + rp.w - 22 - gl.length * 52;
        g.textAlign = "left"; g.fillText("glossary", gx0, rp.y + 34); g.textAlign = "center";
        gl.forEach((k, i) => { const x = gx0 + i * 52 + 10; glyph(k, x, rp.y + 40, gs, C.silk, 1.4); g.fillText(named.has(k) ? k : "?", x + gs / 2, rp.y + 74); });
      }
      const { bad, at } = violations(row, sp.rules);
      // slots
      const shake = shakeT > 0 && !api.reducedMotion ? Math.sin(now / 25) * 5 * shakeT : 0;
      const target = drag ? slotAt(drag.x, drag.y, 20) : -1;
      slotPos.forEach((p, k) => {
        const sx = p.x + (k === shakeSlot ? shake : 0);
        const fits = drag && sp.slots[k] === drag.s.colour;
        g.fillStyle = drag && k === target ? (fits ? "rgba(79,107,44,.25)" : "rgba(184,50,42,.2)") : "rgba(255,255,255,.18)"; g.fillRect(sx, p.y, sz, sz);
        border(sx, p.y, sz, sz, sp.slots[k], !taut, at.has(k) ? 4 : 2.6);
        if (at.has(k)) { g.fillStyle = C.red; g.font = "700 18px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("×", sx + sz / 2, p.y - 6); }
        const focus = kbUsed && held !== null && kbList()[cursor] === "s" + k;
        if (focus || (hintPair && hintPair[1] === k)) { g.strokeStyle = C.amber; g.lineWidth = 3; g.strokeRect(sx - 5, p.y - 5, sz + 10, sz + 10); }
      });
      // rules
      let y = slotPos[0].y + sz + 44;
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = `italic 16px 'IM Fell English',Georgia,serif`;
      RULES.slice(0, sp.rules).forEach((r) => {
        const broken = bad.has(r.id);
        g.fillStyle = broken ? C.red : C.ink;
        g.fillText(`${broken ? "×" : "·"}  ${r.text}`, rp.x + 26, y); y += 22;
      });
      g.font = "14px Karla,Arial,sans-serif"; g.fillStyle = C.ink;
      g.fillStyle = C.red; g.fillText("red", rp.x + 26, y + 4); let xx = rp.x + 26 + g.measureText("red").width;
      g.fillStyle = C.ink; const rest = ": an act · black: a thing · white: who"; g.fillText(rest, xx, y + 4);
      y += 12;
      // translation in the journal hand
      if (taut > 0) {
        g.globalAlpha = Math.min(1, taut);
        g.fillStyle = C.ink; g.font = `italic ${Math.round(Math.min(26, rp.w / 18))}px 'IM Fell English',Georgia,serif`;
        let ty = Math.max(y + 36, Math.min(rp.y + rp.h - 30 - sp.text.length * 32, y + 80));
        sp.text.forEach((t, i) => { g.fillStyle = i ? "rgba(42,33,27,.78)" : C.ink; ty = wrapText(t, rp.x + 30, ty, rp.w - 60, 28) + 32; });
        g.globalAlpha = 1;
      }
      if (msg && now - msgT < 2600) { g.fillStyle = msgCol; g.textAlign = "center"; g.font = "600 15px Karla,Arial,sans-serif"; g.fillText(msg, rp.x + rp.w / 2, slotPos[0].y - 26); }
      // left page
      g.fillStyle = "rgba(42,33,27,.85)"; g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.fillText("loose strips", lp.x + 22, lp.y + lp.h - 22);
      strips.forEach((s) => {
        if (drag && drag.s === s) return;
        drawStrip(s, s.x, s.y, sz);
        const kb = kbUsed && held === null && kbList()[cursor] === "t" + s.i;
        const hov = hover === s && held === null && !drag && !taut;
        if (held === s.i || kb || hov || (hintPair && hintPair[0] === s.i)) { g.strokeStyle = held === s.i ? C.red : hov ? C.ink : C.amber; g.lineWidth = held === s.i ? 3 : 2; g.strokeRect(s.x - 5, s.y - 5, sz + 10, sz + 10); }
      });
      if (drag) drawStrip(drag.s, drag.x - sz / 2, drag.y - sz / 2, sz, true);
      // the toys closing in: a ring of warm glows tightening at the page edge
      const t = Math.min(1, 1 - left / total + creep);
      const inset = 4 + t * Math.min(W, H) * 0.26;
      const n = 22;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (api.reducedMotion ? 0 : now / 9000);
        const rx = W / 2 - inset, ry = H / 2 - inset;
        const gx = W / 2 + Math.cos(a) * rx * 1.05, gy = H / 2 + Math.sin(a) * ry * 1.05;
        const rr = 16 + t * 26;
        const rg = g.createRadialGradient(gx, gy, 1, gx, gy, rr);
        rg.addColorStop(0, `rgba(227,154,45,${0.55 + t * 0.35})`); rg.addColorStop(1, "rgba(227,154,45,0)");
        g.fillStyle = rg; g.beginPath(); g.arc(gx, gy, rr, 0, 7); g.fill();
      }
      creep = Math.max(0, creep - 0.0008);
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1400;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 24;
        g.globalAlpha = 1 - a * a; g.font = "700 15px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise); g.globalAlpha = 1;
      }
      K.frame(draw);
    }

    // ---- placing ---------------------------------------------------------------------------
    function put(s, k) {
      const sp = SPREADS[si];
      if (k === null) { if (s.slot !== null) row[s.slot] = null; s.slot = null; layout(); return; }
      if (sp.slots[k] !== s.colour) {
        say(`That slot is sewn in ${sp.slots[k]}: it takes only ${sp.slots[k]} thread.`); shakeSlot = k; shakeT = 1;
        return;
      }
      const occ = row[k];
      if (occ && occ !== s) { occ.slot = s.slot; if (s.slot !== null) row[s.slot] = occ; }
      else if (s.slot !== null) row[s.slot] = null;
      row[k] = s; s.slot = k; idle = 0; hintPair = null;
      layout();
      const v = violations(row, sp.rules);
      if (v.at.has(k)) { say("It sits, but a rule is broken."); }
      else pop("set", L.slotPos[k].x + L.sz / 2, L.slotPos[k].y - 10, C.moss);
      check();
    }
    function check() {
      const sp = SPREADS[si];
      if (row.some((x) => !x)) return;
      if (violations(row, sp.rules).bad.size) return;
      taut = 0.01; read.push(sp.no);
      tautStart = performance.now();
      say("The spread pulls taut.", C.moss);
      K.after(api.reducedMotion ? 2200 : 3600, () => {
        if (over) return;
        if (si + 1 < SPREADS.length) { si++; loadSpread(si); spreadBeat(); }
        else win();
      });
    }
    function spreadBeat() {
      if (si === 1) beat("New glyphs", "A hand, a mouth, a knot: you don't know these yet. The walls are covered in them. Read the walls (R) to learn their names, but the glows come on while your back is turned.", null, 6500);
      if (si === 2) beat("In your pocket", "Mabel's sampler from the parlour wall: one line already solved in her small, even stitches. Use it (H) to set a strip, twice. One strip on this page fits no line at all.", null, 6500);
    }
    function solution() {
      const sp = SPREADS[si];
      const out = [];
      const used = new Set();
      const tryAt = (k) => {
        if (k === sp.slots.length) return violations(out, sp.rules).bad.size === 0;
        for (const s of strips) {
          if (used.has(s) || s.colour !== sp.slots[k]) continue;
          out[k] = s; used.add(s);
          if (!violations(out.slice(0, k + 1).concat(Array(sp.slots.length - k - 1).fill(null)), sp.rules).bad.size && tryAt(k + 1)) return true;
          used.delete(s); out[k] = null;
        }
        return false;
      };
      tryAt(0);
      return out;
    }
    function readWalls() {
      if (!started || over || taut || si < 1) return;
      const unknown = [...new Set(strips.map((s) => s.glyph))].filter((k) => !named.has(k));
      if (!unknown.length) { say("You already know every glyph on this page.", C.ink); return; }
      unknown.forEach((k) => named.add(k));
      left -= WALL_COST; creep = Math.min(0.25, creep + 0.05); wallsUsed++;
      say(`The walls: ${unknown.join(", ")}.`, C.moss);
      pop(`−${WALL_COST} s`, L.rp.x + L.rp.w / 2, L.rp.y + 110, C.red);
      syncButtons();
    }
    function useSampler() {
      if (!started || over || taut || si < 2 || samplers <= 0) return;
      const sol = solution();
      const k = sol.findIndex((s, k2) => s && row[k2] !== s);
      if (k < 0) return;
      samplers--;
      const s = sol[k];
      if (row[k] && row[k] !== s) { const o = row[k]; o.slot = null; row[k] = null; }
      if (s.slot !== null) row[s.slot] = null;
      s.slot = null; put(s, k);
      say("Mabel's even stitches show you where it goes.", C.moss);
      syncButtons();
    }
    function syncButtons() {
      wallsBtn.hidden = si < 1; sampBtn.hidden = si < 2;
      const unknown = strips.some((s) => !named.has(s.glyph));
      wallsBtn.disabled = !unknown || !!taut;
      sampBtn.disabled = samplers <= 0 || !!taut;
      sampBtn.querySelector("small").textContent = `H · ×${samplers}`;
    }
    function outcome(kind, text) {
      over = true;
      api.store.set("losses", kind === "lose" ? losses + 1 : 0);
      api.end({ outcome: kind, text });
    }
    function win() {
      const best = api.store.get("best", 0); if (left > best) api.store.set("best", Math.round(left));
      outcome("win", `All three spreads read, with ${Math.ceil(left)} s to spare${wallsUsed ? "" : ", and never once turning your back on the glows"}. You know how to bind, how to feed it, and what the filling is: “The ritual had already begun the moment we stepped inside.”`);
    }
    function lose() {
      const unread = SPREADS.filter((s) => !read.includes(s.no)).map((s) => s.no).join(" and ");
      if (read.length) outcome("done", `The glows close over the margins and the page goes warm under your hands. You read spread ${read.join(" and ")}; spread ${unread} stays unread. What it says, you will learn the other way.`);
      else outcome("lose", "The glows close over the margins before a single line pulls taut. The book stays shut to you, and something soft leans against your ankle and waits.");
    }

    // ---- input -----------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    function stripAt(x, y) { for (let k = strips.length - 1; k >= 0; k--) { const s = strips[k]; if (x >= s.x - 4 && x <= s.x + L.sz + 4 && y >= s.y - 4 && y <= s.y + L.sz + 4) return s; } return null; }
    function slotAt(x, y, slack = 6) { return L.slotPos.findIndex((p) => x >= p.x - slack && x <= p.x + L.sz + slack && y >= p.y - slack && y <= p.y + L.sz + slack); }
    K.on(cv, "pointerdown", (e) => {
      if (!started || over || taut) return;
      const [x, y] = pt(e), s = stripAt(x, y);
      if (s) { drag = { s, x, y, sx: x, sy: y, moved: false }; cv.setPointerCapture(e.pointerId); return; }
      const k = slotAt(x, y);
      if (k >= 0 && held !== null) { put(strips[held], k); held = null; }
    });
    K.on(cv, "pointermove", (e) => {
      const [x, y] = pt(e);
      hover = stripAt(x, y);
      cv.style.cursor = drag ? "grabbing" : hover ? "grab" : "default";
      if (!drag) return; drag.x = x; drag.y = y; if (Math.hypot(x - drag.sx, y - drag.sy) > 6) drag.moved = true;
    });
    K.on(cv, "pointerup", (e) => {
      if (!drag) return;
      const [x, y] = pt(e), d = drag; drag = null;
      if (!d.moved) {
        if (d.s.slot !== null && held === null) { put(d.s, null); return; }
        held = held === d.s.i ? null : d.s.i; return;
      }
      const k = slotAt(x, y, 20);
      put(d.s, k >= 0 ? k : null); held = null;
    });
    function kbList() {
      return held === null ? [...strips].sort((a, b) => (a.slot === null ? 0 : 1) - (b.slot === null ? 0 : 1) || a.hx - b.hx).map((s) => "t" + s.i) : L.slotPos.map((_, k) => "s" + k);
    }
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key.toLowerCase();
      if (k === "r") { readWalls(); return; }
      if (k === "h") { useSampler(); return; }
      if (taut) return;
      if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      kbUsed = true;
      const list = kbList();
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { cursor = (cursor + 1) % list.length; e.preventDefault(); }
      else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { cursor = (cursor - 1 + list.length) % list.length; e.preventDefault(); }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = list[cursor];
        if (held === null) { held = +id.slice(1); cursor = 0; }
        else { put(strips[held], +id.slice(1)); held = null; cursor = 0; }
      } else if ((e.key === "Backspace" || e.key === "Delete") && held !== null) { put(strips[held], null); held = null; cursor = 0; }
      else if (e.key === "Escape") held = null;
    });
    K.on(wallsBtn, "click", () => { readWalls(); wrap.focus(); });
    K.on(sampBtn, "click", () => { useSampler(); wrap.focus(); });

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        if (!taut) { left -= dt; idle += dt; }
        if (tautStart) taut = Math.max(0.01, Math.min(1, (now - tautStart) / (api.reducedMotion ? 1 : 900)));
        if (shakeT > 0) shakeT = Math.max(0, shakeT - dt * 2.5);
        if (idle > 30 && !hintPair) {
          const sol = solution();
          const k = sol.findIndex((s, k2) => s && row[k2] !== s);
          if (k >= 0) hintPair = [sol[k].i, k];
        }
        if (!marcusSaid && left < total * 0.5) { marcusSaid = true; beat("Marcus, from the doorway", "He has his back to you, watching the glows.", "There's always a way out. You just haven't drawn it yet.", 5000); }
        if (!edgeSaid && left < 30 * speed) { edgeSaid = true; beat("The edge of the page", "The glows are at the margins now. Something soft leans against your ankle, and waits.", null, 4500); }
        if (left <= 0) lose();
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    // ---- how to play: a linen sampler -------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play The Hand-Sewn Book">
      <h2>The Hand-Sewn Book</h2>
      <p class="${PRE}q">“Symbols stitched into the walls. / A circle of torn fabric skins. / A book made of hand-sewn pages.”</p>
      <p class="${PRE}goal">Under the cabin, the third night. Your friends hold the doorway. Read three spreads before the glows reach the page.</p>
      <div class="${PRE}legend">
        <div><i style="background:${C.red}"></i><span>Drag a strip into a slot sewn in its colour</span><kbd>arrows · Enter</kbd></div>
        <div><i style="background:${C.silk}"></i><span>Keep the rules under the slots</span><kbd>× = broken</kbd></div>
        <div><i style="background:${C.white};box-shadow:0 0 0 1px ${C.silk}"></i><span>Tap a set strip to take it back</span><kbd>Delete</kbd></div>
      </div>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>The glows took you twice. Slow glows are ticked for you.</p>
      <label><input type="checkbox" ${losses >= 2 ? "checked" : ""}> Slow glows (twice the time)</label>
      <button type="button">Open the book</button>
    </div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => {
      speed = intro.querySelector("input").checked ? 2 : 1; total = left = 180 * speed; intro.remove(); started = true; wrap.focus();
      beat("Spread I", "Four strips. Red thread is an act, black a thing, white who. The glossary names what Mabel's sampler taught you.", null, 4500);
    });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    loadSpread(0); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

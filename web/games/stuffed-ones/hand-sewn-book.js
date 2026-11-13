// The Stuffed Ones: The Hand-Sewn Book (1D, translation), drawn as blackwork embroidery on linen.
//
// DESIGN.md section 11 "The Hand-Sewn Book", appearance 3 (`a5_book_3`): the world runs, 180
// seconds with the toys closing in (a ring of glows tightening at the page's edge). Three spreads
// in rising difficulty, as the design's difficulty table: S1 four strips and one rule, S3 six strips
// and two rules, S5 eight strips, three rules and one decoy that fits no slot. Each strip's thread
// colour is its role (red an act, black a thing, white who) and a slot takes only its colour. The
// order rules arrive one per two spreads: a needle glyph comes before a thread glyph (here, directly
// before: the needle leads its thread); a knot glyph ends a line; a glyph doubled means "many" (it
// follows the glyph it repeats). When every strip is placed legally, the spread pulls taut and its
// translation appears in the journal hand.
//
// Translations are the spread table's lines, verbatim from the vault:
// creative-writing/vault/02_Novels/01_The_Stuffed_Ones.md (ch 11 and ch 12; DESIGN.md sections 3, 11).
const PRE = "stuffed-ones-hand-sewn-book-";
const C = { linen: "#e3d6bb", linenD: "#cdbd9c", silk: "#1d1712", red: "#b8322a", white: "#f6f1e4", black: "#1d1712",
  cedar: "#6b4a32", cedarD: "#3d2a1d", amber: "#e39a2d", ink: "#2a211b", moss: "#7d8a5a" };

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
  { id: "needle", text: "a needle comes before its thread" },
  { id: "knot", text: "a knot ends a line" },
  { id: "many", text: "doubled means many: it follows what it repeats" },
];
// strips: [glyph, colour, doubled]
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
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.cedarD};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(29,23,18,.6);z-index:3;padding:16px}
.${PRE}intro div{max-width:470px;background:${C.linen};color:${C.ink};border:2px solid ${C.silk};padding:18px 20px;outline:1px dashed ${C.silk};outline-offset:-8px}
.${PRE}intro h2{margin:0 0 8px;font:400 30px 'IM Fell English',Georgia,serif}
.${PRE}intro p{margin:0 0 8px;font-size:14px;line-height:1.45}
.${PRE}intro b.r{color:${C.red}}
.${PRE}intro button{font:600 14px Karla,Arial,sans-serif;background:${C.silk};color:${C.linen};border:0;padding:9px 20px;cursor:pointer;margin-top:6px}
.${PRE}intro label{font-size:12px;display:flex;gap:6px;align-items:center;margin-top:8px}
</style><canvas aria-label="An open hand-sewn book: loose glyph strips on the left page, coloured slots on the right"></canvas>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");

    let started = false, over = false, speed = 1, total = 180, left = 180, idle = 0;
    let tautStart = 0, si = 0, strips = [], row = [], taut = 0, read = [], seen = new Set();
    let kbUsed = false, drag = null, held = null, cursor = 0, msg = "", msgT = 0, shakeSlot = -1, shakeT = 0, hintPair = null;
    let L = null;

    function loadSpread(k) {
      const sp = SPREADS[k];
      row = sp.slots.map(() => null);
      strips = sp.strips.map(([glyph, colour, doubled], i) => ({ i, glyph, colour, doubled: !!doubled, slot: null, rx: rng(), ry: rng(), rot: (rng() - 0.5) * 0.3 }));
      // scramble the order on the left page
      for (let i = strips.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [strips[i].rx, strips[j].rx] = [strips[j].rx, strips[i].rx]; }
      strips.forEach((s) => seen.add(s.glyph));
      taut = 0; tautStart = 0; held = null; cursor = 0; idle = 0; hintPair = null;
      layout();
    }

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 760;
      const pad = 14;
      const book = { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };
      let lp, rp;
      if (wide) { const half = book.w / 2; lp = { x: book.x, y: book.y, w: half, h: book.h }; rp = { x: book.x + half, y: book.y, w: half, h: book.h }; }
      else { const hh = book.h * 0.54; rp = { x: book.x, y: book.y, w: book.w, h: hh }; lp = { x: book.x, y: book.y + hh, w: book.w, h: book.h - hh }; }
      const sp = SPREADS[si];
      const n = sp.slots.length;
      const sz = Math.max(34, Math.min(84, (rp.w - 48) / n - 8, rp.h * 0.2));
      const gap = Math.min(12, sz * 0.18);
      const rowW = n * sz + (n - 1) * gap;
      const slotY = rp.y + Math.max(70, rp.h * 0.3);
      const slotPos = sp.slots.map((_, k) => ({ x: rp.x + (rp.w - rowW) / 2 + k * (sz + gap), y: slotY }));
      // left-page scatter: a loose grid with jitter
      const cols = Math.max(2, Math.min(Math.floor((lp.w - 40) / (sz * 1.25)), Math.ceil(Math.sqrt(strips.length * lp.w / Math.max(1, lp.h)))));
      const rows = Math.ceil(strips.length / cols);
      const cw = (lp.w - 40) / cols, ch = (lp.h - 80) / rows;
      const order = [...strips].sort((a, b) => a.rx - b.rx);
      order.forEach((s, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        s.hx = lp.x + 20 + c * cw + (cw - sz) / 2 + (s.ry - 0.5) * Math.max(0, cw - sz) * 0.6;
        s.hy = lp.y + 40 + r * ch + (ch - sz) / 2 + ((s.rx * 7 % 1) - 0.5) * Math.max(0, ch - sz) * 0.6;
      });
      L = { W, H, wide, book, lp, rp, sz, slotPos };
      strips.forEach((s) => { if (s.slot !== null) { s.x = slotPos[s.slot].x; s.y = slotPos[s.slot].y; } else { s.x = s.hx; s.y = s.hy; } });
    }

    // ---- drawing ---------------------------------------------------------------------------
    function glyph(name, x, y, size, col = C.silk, lw) {
      const u = size / 4;
      g.strokeStyle = col; g.lineWidth = lw || Math.max(1.6, size / 14); g.lineCap = "square";
      g.beginPath();
      GLYPHS[name].segs.forEach(([a, b, c, d]) => { g.moveTo(x + a * u, y + b * u); g.lineTo(x + c * u, y + d * u); });
      g.stroke();
      // counted-thread holes
      g.fillStyle = "rgba(29,23,18,.25)";
      for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) g.fillRect(x + i * u - 0.6, y + j * u - 0.6, 1.2, 1.2);
    }
    function border(x, y, w, h, colour, dashed = true, lw = 2.2) {
      const col = colour === "red" ? C.red : colour === "white" ? C.white : C.black;
      if (colour === "white") { g.strokeStyle = "rgba(29,23,18,.5)"; g.lineWidth = lw + 2; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); }
      g.strokeStyle = col; g.lineWidth = lw; g.setLineDash(dashed ? [5, 3] : []); g.strokeRect(x, y, w, h); g.setLineDash([]);
    }
    function drawStrip(s, x, y, sz, lift) {
      g.save();
      if (s.slot === null && !lift) { g.translate(x + sz / 2, y + sz / 2); g.rotate(s.rot); g.translate(-x - sz / 2, -y - sz / 2); }
      g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x + 3, y + 4, sz, sz);
      g.fillStyle = "#ece2cb"; g.fillRect(x, y, sz, sz);
      border(x + 3, y + 3, sz - 6, sz - 6, s.colour, true, 2);
      if (s.doubled) { const q = sz * 0.36; glyph(s.glyph, x + sz * 0.1, y + (sz - q) / 2, q); glyph(s.glyph, x + sz * 0.54, y + (sz - q) / 2, q); }
      else { const q = sz * 0.56; glyph(s.glyph, x + (sz - q) / 2, y + (sz - q) / 2, q); }
      g.restore();
    }
    function linen(x, y, w, h) {
      g.fillStyle = C.linen; g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(120,95,60,.10)";
      for (let k = 0; k < w; k += 3) g.fillRect(x + k, y, 1, h);
      for (let k = 0; k < h; k += 3) g.fillRect(x, y + k, w, 1);
    }
    function edgeBand(x, y, w) {
      // blackwork border: a running zigzag
      g.strokeStyle = C.silk; g.lineWidth = 1.4; g.beginPath();
      for (let k = 0; k <= w - 16; k += 8) { g.moveTo(x + 8 + k, y); g.lineTo(x + 12 + k, y - 4); g.lineTo(x + 16 + k, y); }
      g.stroke();
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, lp, rp, sz, slotPos, book, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.cedarD; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(book.x + 6, book.y + 8, book.w, book.h);
      linen(lp.x, lp.y, lp.w, lp.h); linen(rp.x, rp.y, rp.w, rp.h);
      // gutter
      const gr = wide ? g.createLinearGradient(rp.x - 24, 0, rp.x + 24, 0) : g.createLinearGradient(0, lp.y - 18, 0, lp.y + 18);
      gr.addColorStop(0, "rgba(60,40,25,0)"); gr.addColorStop(0.5, "rgba(60,40,25,.35)"); gr.addColorStop(1, "rgba(60,40,25,0)");
      g.fillStyle = gr; if (wide) g.fillRect(rp.x - 24, book.y, 48, book.h); else g.fillRect(book.x, lp.y - 18, book.w, 36);
      [lp, rp].forEach((p) => { edgeBand(p.x, p.y + 18, p.w); edgeBand(p.x, p.y + p.h - 12, p.w); });
      const sp = SPREADS[si];
      // right page: title, slots, rules, translation, glossary
      g.fillStyle = C.ink; g.textAlign = "left"; g.textBaseline = "alphabetic";
      g.font = `italic ${Math.round(Math.min(26, rp.w / 18))}px 'IM Fell English',Georgia,serif`;
      g.fillText(`Spread ${sp.no}`, rp.x + 22, rp.y + 52);
      // glossary, top right
      const gl = [...seen];
      g.font = "10px Karla,Arial,sans-serif"; g.textAlign = "right"; g.fillStyle = "rgba(42,33,27,.7)";
      g.fillText("glossary", rp.x + rp.w - 20, rp.y + 34);
      const gs = Math.min(14, (rp.w * 0.45) / gl.length - 6);
      gl.forEach((k, i) => { const x = rp.x + rp.w - 20 - (gl.length - i) * (gs + 7); glyph(k, x, rp.y + 40, gs, C.silk, 1.2); });
      const { bad, at } = violations(row, sp.rules);
      // slots
      const shake = shakeT > 0 ? Math.sin(now / 25) * 4 * shakeT : 0;
      slotPos.forEach((p, k) => {
        const sx = p.x + (k === shakeSlot ? shake : 0);
        g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(sx, p.y, sz, sz);
        const sag = taut ? 0 : 1;
        border(sx, p.y, sz, sz, sp.slots[k], sag === 1, at.has(k) ? 3.5 : 2.4);
        if (at.has(k)) { g.fillStyle = C.red; g.font = "600 14px Karla,Arial,sans-serif"; g.textAlign = "center"; g.fillText("×", sx + sz / 2, p.y + sz + 16); }
        const focus = kbUsed && held !== null && kbList()[cursor] === "s" + k;
        if (focus || (hintPair && hintPair[1] === k)) { g.strokeStyle = C.amber; g.lineWidth = 2; g.strokeRect(sx - 5, p.y - 5, sz + 10, sz + 10); }
      });
      // rules
      let y = slotPos[0].y + sz + 42;
      g.textAlign = "left"; g.font = `italic ${Math.round(Math.min(15, rp.w / 30))}px 'IM Fell English',Georgia,serif`;
      RULES.slice(0, sp.rules).forEach((r) => {
        const broken = bad.has(r.id);
        g.fillStyle = broken ? C.red : "rgba(42,33,27,.85)";
        g.fillText(`${broken ? "×" : "·"}  ${r.text}`, rp.x + 30, y); y += 20;
      });
      // thread key
      g.font = "11px Karla,Arial,sans-serif"; g.fillStyle = "rgba(42,33,27,.75)";
      g.fillText("red thread: an act · black: a thing · white: who", rp.x + 30, y + 4);
      // translation in the journal hand
      if (taut > 0) {
        g.globalAlpha = Math.min(1, taut);
        g.fillStyle = C.ink; g.font = `italic ${Math.round(Math.min(24, rp.w / 20))}px 'IM Fell English',Georgia,serif`;
        let ty = Math.max(y + 40, rp.y + rp.h - 26 - sp.text.length * 30);
        sp.text.forEach((t, i) => { g.fillStyle = i ? "rgba(42,33,27,.7)" : C.ink; wrapText(t, rp.x + 30, ty, rp.w - 60, 28); ty += 30; });
        g.globalAlpha = 1;
      }
      // left page
      g.fillStyle = "rgba(42,33,27,.7)"; g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.textAlign = "left";
      g.fillText("loose strips", lp.x + 22, lp.y + lp.h - 22);
      strips.forEach((s) => {
        if (drag && drag.s === s) return;
        drawStrip(s, s.x, s.y, sz);
        const kb = kbUsed && held === null && kbList()[cursor] === "t" + s.i;
        if (held === s.i || kb || (hintPair && hintPair[0] === s.i)) { g.strokeStyle = held === s.i ? C.red : C.amber; g.lineWidth = 2; g.strokeRect(s.x - 5, s.y - 5, sz + 10, sz + 10); }
      });
      if (drag) drawStrip(drag.s, drag.x - sz / 2, drag.y - sz / 2, sz, true);
      // the toys closing in: a ring of warm glows tightening at the page edge
      const t = 1 - left / total;
      const inset = 4 + t * Math.min(W, H) * 0.28;
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
      // time and messages
      g.fillStyle = left < 30 ? C.red : C.ink; g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = "right";
      g.fillText(`${Math.ceil(left)} s · spread ${si + 1} of ${SPREADS.length}`, rp.x + rp.w - 20, rp.y + rp.h - 22);
      if (msg && now - msgT < 2200) { g.fillStyle = C.red; g.textAlign = "center"; g.font = "600 13px Karla,Arial,sans-serif"; g.fillText(msg, rp.x + rp.w / 2, slotPos[0].y - 14); }
      K.frame(draw);
    }
    function wrapText(t, x, y, max, lh) {
      const words = t.split(" "); let line = "";
      for (const w of words) { const s = line ? line + " " + w : w; if (g.measureText(s).width > max && line) { g.fillText(line, x, y); line = w; y += lh; } else line = s; }
      g.fillText(line, x, y);
    }

    // ---- placing ---------------------------------------------------------------------------
    function put(s, k) {
      const sp = SPREADS[si];
      if (k === null) { if (s.slot !== null) row[s.slot] = null; s.slot = null; layout(); return; }
      if (sp.slots[k] !== s.colour) {
        msg = `That slot is sewn in ${sp.slots[k]}; it takes only ${sp.slots[k]} thread.`; msgT = performance.now(); shakeSlot = k; shakeT = 1;
        return;
      }
      const occ = row[k];
      if (occ && occ !== s) { occ.slot = s.slot; if (s.slot !== null) row[s.slot] = occ; }
      else if (s.slot !== null) row[s.slot] = null;
      row[k] = s; s.slot = k; idle = 0; hintPair = null;
      layout();
      check();
    }
    function check() {
      const sp = SPREADS[si];
      if (row.some((x) => !x)) return;
      if (violations(row, sp.rules).bad.size) return;
      taut = 0.01; read.push(sp.no);
      tautStart = performance.now();
      K.after(api.reducedMotion ? 1800 : 3200, () => {
        if (over) return;
        if (si + 1 < SPREADS.length) { si++; loadSpread(si); }
        else win();
      });
    }
    function solution() {
      // the one legal order, for hints: try strips per slot by brute force
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
    function win() {
      over = true;
      const best = api.store.get("best", 0); if (left > best) api.store.set("best", Math.round(left));
      api.end({ outcome: "win", text: `All three spreads read, with ${Math.ceil(left)} s to spare. The book has taught you to bind, to feed, and what the filling is.` });
    }
    function lose() {
      over = true;
      const unread = SPREADS.filter((s) => !read.includes(s.no)).map((s) => s.no).join(", ");
      api.end({ outcome: "lose", text: `The glows close on the page. ${read.length ? `Read: spread ${read.join(", ")}.` : "Nothing read."} Spread ${unread} stays unread.` });
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
    K.on(cv, "pointermove", (e) => { if (!drag) return; const [x, y] = pt(e); drag.x = x; drag.y = y; if (Math.hypot(x - drag.sx, y - drag.sy) > 6) drag.moved = true; });
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
      if (!started || over || taut) return;
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
        if (left <= 0) lose();
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>The Hand-Sewn Book</h2>
      <p>Translate three spreads before the toys close in. Drag each loose strip from the left page into a slot (or tap the strip, then the slot). A slot takes only its thread: <b class="r">red</b> an act, <b>black</b> a thing, white who.</p>
      <p>The rules under the slots must all hold. When they do, the spread pulls taut and you can read it.</p>
      <button type="button">Start</button>
      <label><input type="checkbox"> Half speed (twice the time)</label></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => { speed = intro.querySelector("input").checked ? 2 : 1; total = left = 180 * speed; intro.remove(); started = true; wrap.focus(); });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    cv._probe = () => ({ si, sz: L.sz, slots: L.slotPos, strips: strips.map((s) => ({ x: s.x, y: s.y, glyph: s.glyph, colour: s.colour, doubled: s.doubled, slot: s.slot })) });
    loadSpread(0); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

// The Stuffed Ones: Parlour (1D, board game tampering), drawn as felt appliqué.
//
// DESIGN.md section 11 "Parlour", appearance 1 (`c11_parlour_1`): 90 seconds while the guests are
// on the hike, one guest on the porch who may come in after 60 seconds if you are loud, at most
// three tampers. You never play the counting game: you move the guests' pegs while they are away.
// Tampers: Nudge (owner +6 dread, blame +2), Swap (both +4, blame +8), Knot (owner +8), Hearth
// (all +10, blame +12), Personal: a peg put on the symbol that is its owner's (owner +15, blame 0).
// While blame is 50 or more, half the dread of non-personal tampers becomes blame. Leave and be
// back at your spot before anyone enters (the climb takes 4 s); footsteps grow louder in three
// steps first. A guest who enters while you are on the table: a slip, and the visit ends.
// Guests are Group B (DESIGN.md section 6). The Notes strip records only what was watched.
//
// Actions: Move a peg (drag; or 1-3, Enter, arrows, Enter). Undo the last tamper (before you touch
// another peg). Hold still (hold Space or the button): twice the porch guest looks in through the
// window ("We stayed still when they looked"); a toy caught moving on the table is noticed, which is
// noise, blame +4 (section 12, Movement noticed) and an early return. Leave: the four-second climb.
// Narrative lines other than the quoted ones are written for the game (refine additions list).
const PRE = "stuffed-ones-parlour-";
const C = { moss: "#6f7d4f", mossD: "#55623a", cream: "#efe5cf", bone: "#f6f1e4", rust: "#a5553a", sky: "#8fa9bf", night: "#3f4b63",
  amber: "#e39a2d", red: "#b8322a", cedar: "#6b4a32", ink: "#2a211b", rose: "#c07a8e", ochre: "#c9a24a", plum: "#8a6a86" };
const N = 30;
const SYM = ["door", "cup", "tree", "bird", "lamp", "moon", "two", "knot", "key", "tree", "bird", "cup", "lamp", "moon", "two", "knot",
  "key", "bird", "door", "lamp", "tree", "cup", "knot", "moon", "two", "key", "lamp", "bird", "cup", "hearth"];
const SYM_COL = { door: C.cedar, cup: C.sky, tree: C.moss, bird: C.rose, lamp: C.ochre, moon: C.plum, two: C.rust, knot: C.ink, key: C.ochre, hearth: C.red };
// The guests' game so far: each word moves one space per syllable; a Knot sends you back three.
const GUESTS = [
  { id: "noor", name: "Noor", col: C.sky, personal: "door", words: [["kettle", 2], ["window", 2], ["lantern", 2], ["porcupine", 3], ["river", 2]] },
  { id: "wes", name: "Wes", col: "#9aa86f", personal: "lamp", words: [["boots", 1], ["campfire", 2], ["thunder", 2], ["owl", 1], ["canoe", 2], ["mud", 1]] },
  { id: "ana", name: "Ana", col: C.rust, personal: "two", words: [["sunrise", 2], ["blanket", 2], ["pine", 1], ["marshmallow", 3], ["firefly", 3], ["stars", 1], ["creek", 1]] },
];
GUESTS.forEach((gu) => { let p = 0; gu.trail = gu.words.map(([w, n]) => { p = Math.min(N - 1, p + n); if (SYM[p] === "knot") p = Math.max(0, p - 3); return [w, n, p]; }); gu.sheet = p; });
// What you watched from the shelf (c09). It never interprets. Ana's quoted words are verbatim from
// creative-writing/vault/02_Novels/01_The_Stuffed_Ones.md (ch 25; DESIGN.md section 6, Group B).
const NOTES = [
  "Noor locked her door, then went down to try the front door twice.",
  "Wes keeps a lamp on in his room all night. He switched it off when Ana knocked.",
  "Ana lifted Lila to sit beside a bear “so she isn’t alone”.",
];
const TIME = 90, CLIMB = 4, LIMIT = 3, WARN = 2, WATCH = 4;

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
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    const feltCss = (col) => `background-color:${col};background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.5px),radial-gradient(rgba(0,0,0,.08) 1px,transparent 1.5px);background-size:5px 5px,7px 7px;background-position:0 0,2px 3px`;
    const btnFelt = (col) => `radial-gradient(circle at 38% 38%,${C.ink} 0 1.6px,transparent 2.2px),radial-gradient(circle at 62% 38%,${C.ink} 0 1.6px,transparent 2.2px),radial-gradient(circle at 38% 62%,${C.ink} 0 1.6px,transparent 2.2px),radial-gradient(circle at 62% 62%,${C.ink} 0 1.6px,transparent 2.2px),${col}`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.moss};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif;color:${C.ink}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}btns{position:absolute;right:12px;bottom:12px;display:flex;gap:8px;z-index:2;flex-wrap:wrap;justify-content:flex-end}
.${PRE}btns button{font:600 15px Karla,Arial,sans-serif;border:2px dashed ${C.bone};outline:3px solid ${C.cedar};background:${C.cedar};color:${C.bone};padding:8px 14px;border-radius:16px;cursor:pointer;min-height:44px}
.${PRE}btns button:hover:not(:disabled){filter:brightness(1.12)}
.${PRE}btns button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}btns button[hidden]{display:none}
.${PRE}btns button.${PRE}leave{background:${C.red};outline-color:${C.red}}
.${PRE}btns button.${PRE}still{background:${C.night};outline-color:${C.night}}
.${PRE}btns button.${PRE}still[aria-pressed=true]{background:${C.amber};outline-color:${C.amber};color:${C.ink};border-color:${C.ink}}
.${PRE}btns button.${PRE}urgent{animation:${PRE}throb 0.6s ease-in-out infinite alternate}
@keyframes ${PRE}throb{to{filter:brightness(1.35)}}
.${PRE}beat{position:absolute;left:50%;transform:translateX(-50%);top:14px;width:min(460px,calc(100% - 32px));box-sizing:border-box;${feltCss(C.cream)};border:3px dashed ${C.rust};outline:5px solid ${C.cream};border-radius:20px;padding:12px 16px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none;box-shadow:0 8px 0 rgba(0,0,0,.18)}
.${PRE}beat b{font:400 19px 'IM Fell English',Georgia,serif;display:block}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.5);z-index:4;padding:16px;overflow:auto}
.${PRE}card{width:min(480px,100%);box-sizing:border-box;${feltCss(C.cream)};border:3px dashed ${C.rust};outline:7px solid ${C.cream};border-radius:26px;padding:0 22px 20px;position:relative;box-shadow:0 12px 0 rgba(0,0,0,.2)}
.${PRE}card h2{margin:-4px -10px 10px;display:inline-block;${feltCss(C.rust)};color:${C.bone};font:400 32px 'IM Fell English',Georgia,serif;padding:8px 22px 10px;border-radius:0 0 18px 18px;border:2px dashed ${C.bone};border-top:0}
.${PRE}card .${PRE}goal{margin:4px 0 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}legend div{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:5px 0}
.${PRE}legend i{width:24px;height:24px;border-radius:50%;display:block;box-shadow:1px 2px 0 rgba(0,0,0,.3)}
.${PRE}legend kbd{font:600 12px ui-monospace,Menlo,monospace;background:${C.bone};border:1.5px dashed ${C.cedar};border-radius:8px;padding:2px 7px}
.${PRE}card button{font:600 16px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:2px dashed ${C.bone};outline:3px solid ${C.red};border-radius:16px;padding:10px 26px;cursor:pointer;margin-top:14px;min-height:46px}
.${PRE}card button:focus-visible{outline-color:${C.ink}}
.${PRE}card label{font:14px Karla,Arial,sans-serif;display:flex;gap:8px;align-items:center;margin-top:12px}
.${PRE}card .${PRE}kind{margin:10px 0 0;font:italic 15px 'IM Fell English',Georgia,serif;color:${C.red}}
</style><canvas aria-label="The counting game's felt board seen from above, with the guests' button pegs"></canvas>
<div class="${PRE}btns"><button type="button" class="${PRE}still" aria-pressed="false" hidden>Hold still</button><button type="button" class="${PRE}undo" disabled>Undo</button><button type="button" class="${PRE}leave" disabled>Leave</button></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const undoBtn = wrap.querySelector("." + PRE + "undo"), leaveBtn = wrap.querySelector("." + PRE + "leave"), stillBtn = wrap.querySelector("." + PRE + "still");
    const beatEl = wrap.querySelector("." + PRE + "beat");

    const pegs = GUESTS.map((gu) => ({ gu, at: gu.sheet }));
    const dread = { noor: 0, wes: 0, ana: 0 };
    let blame = 34, hunger = 70, tampers = [], noise = 0, personal = 0, seenCount = 0;
    let started = false, over = false, speed = 1, t = 0, climbing = -1, early = null, lastMsg = "", msgT = 0, msgCol = C.bone;
    let drag = null, kbPeg = -1, kbSpace = -1, kbUsed = false, kbSel = 0, hoverPeg = null, still = false;
    let watchSeen = false, watches = [], watchI = 0, watchState = "none", watchT = 0, stepSaid = 0, personalSaid = false, firstSaid = false;
    const pops = [];
    let L = null, felt = null, beatTimer = 0;

    function beat(title, text, ms = 4500) {
      beatEl.innerHTML = ""; const b = document.createElement("b"); b.textContent = title; beatEl.append(b, document.createTextNode(text));
      beatEl.style.opacity = 1; clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function say(m, col = C.bone) { lastMsg = m; msgT = performance.now(); msgCol = col; }
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }

    function spiral() {
      const pts = [], turns = 2.35, steps = 2000, path = [];
      for (let i = 0; i <= steps; i++) { const u = i / steps, th = u * turns * Math.PI * 2, r = 1 - u * 0.86; path.push([Math.cos(th - Math.PI / 2) * r, Math.sin(th - Math.PI / 2) * r]); }
      const len = [0]; for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
      const total = len[len.length - 1] * 0.985;
      let j = 0;
      for (let k = 0; k < N - 1; k++) { const want = total * k / (N - 2) * 0.93; while (len[j] < want) j++; pts.push(path[j]); }
      pts.push([0, 0]);
      return pts;
    }
    const SPOTS = spiral();

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 820;
      let board, sheet, door, notes;
      if (wide) {
        const sw = Math.min(220, W * 0.18), dw = Math.min(130, W * 0.1);
        sheet = { x: 16, y: 16, w: sw, h: H - 136 };
        door = { x: W - 16 - dw, y: 16, w: dw, h: H - 136 };
        notes = { x: 16, y: H - 106, w: W - 32 - 330, h: 92 };
        const bw = door.x - (sheet.x + sheet.w) - 24, bh = H - 136;
        const R = Math.min(bw, bh) / 2;
        board = { cx: sheet.x + sheet.w + 12 + bw / 2, cy: 16 + bh / 2, R };
      } else {
        const R = Math.min(W - 20, (H - 300) * 0.98) / 2;
        board = { cx: W / 2, cy: 8 + R, R };
        const y0 = board.cy + R + 8;
        door = { x: 10, y: y0, w: W - 20, h: 48 };
        sheet = { x: 10, y: y0 + 54, w: W - 20, h: 62 };
        notes = { x: 10, y: y0 + 122, w: W - 20, h: Math.max(76, H - (y0 + 122) - 64) };
      }
      L = { W, H, wide, board, sheet, door, notes, sr: board.R * 0.068 };
      felt = null;
    }
    const spot = (i) => [L.board.cx + SPOTS[i][0] * L.board.R * 0.86, L.board.cy + SPOTS[i][1] * L.board.R * 0.86];

    // ---- felt drawing ----------------------------------------------------------------------
    function feltTex(W, H) {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d"); x.fillStyle = C.moss; x.fillRect(0, 0, W, H);
      for (let i = 0; i < (W * H) / 40; i++) { x.fillStyle = rng() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.07)"; const a = rng() * 6.28, l = 2 + rng() * 5, px = rng() * W, py = rng() * H; x.fillRect(px, py, Math.cos(a) * l + 1, Math.sin(a) * l + 1); }
      return c;
    }
    function blanket(cx, cy, r, col = C.bone, n) {
      n = n || Math.max(10, Math.round(r * 1.1));
      g.strokeStyle = col; g.lineWidth = Math.max(1, r / 22);
      g.beginPath(); g.arc(cx, cy, r - r * 0.06, 0, 7); g.stroke();
      g.beginPath();
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; g.moveTo(cx + Math.cos(a) * (r - r * 0.06), cy + Math.sin(a) * (r - r * 0.06)); g.lineTo(cx + Math.cos(a) * (r - r * 0.2), cy + Math.sin(a) * (r - r * 0.2)); }
      g.stroke();
    }
    function feltCircle(cx, cy, r, col) {
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.arc(cx + Math.min(5, r * 0.08), cy + Math.min(7, r * 0.12), r, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
      blanket(cx, cy, r);
    }
    function symbol(s, cx, cy, r) {
      const u = r * 0.5; g.fillStyle = C.bone; g.strokeStyle = C.bone; g.lineWidth = Math.max(1.2, r / 9);
      g.beginPath();
      switch (s) {
        case "door": g.moveTo(cx - u * 0.6, cy + u); g.lineTo(cx - u * 0.6, cy - u * 0.2); g.arc(cx, cy - u * 0.2, u * 0.6, Math.PI, 0); g.lineTo(cx + u * 0.6, cy + u); g.closePath(); g.fill(); g.fillStyle = C.ink; g.beginPath(); g.arc(cx + u * 0.3, cy + u * 0.3, u * 0.1, 0, 7); g.fill(); break;
        case "lamp": g.arc(cx, cy - u * 0.25, u * 0.55, 0, 7); g.fill(); g.fillRect(cx - u * 0.25, cy + u * 0.3, u * 0.5, u * 0.5); g.fillRect(cx - u * 0.55, cy + u * 0.8, u * 1.1, u * 0.2); break;
        case "two": g.arc(cx - u * 0.45, cy, u * 0.38, 0, 7); g.fill(); g.beginPath(); g.arc(cx + u * 0.45, cy, u * 0.38, 0, 7); g.fill(); break;
        case "bird": g.ellipse(cx, cy, u * 0.65, u * 0.4, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx + u * 0.5, cy); g.lineTo(cx + u * 1.0, cy - u * 0.45); g.lineTo(cx + u * 1.0, cy + u * 0.3); g.fill(); g.beginPath(); g.arc(cx - u * 0.6, cy - u * 0.3, u * 0.3, 0, 7); g.fill(); break;
        case "tree": g.moveTo(cx, cy - u); g.lineTo(cx + u * 0.75, cy + u * 0.4); g.lineTo(cx - u * 0.75, cy + u * 0.4); g.closePath(); g.fill(); g.fillRect(cx - u * 0.15, cy + u * 0.4, u * 0.3, u * 0.55); break;
        case "knot": g.ellipse(cx - u * 0.4, cy, u * 0.42, u * 0.6, 0, 0, 7); g.moveTo(cx + u * 0.82, cy); g.ellipse(cx + u * 0.4, cy, u * 0.42, u * 0.6, 0, 0, 7); g.stroke(); break;
        case "cup": g.moveTo(cx - u * 0.6, cy - u * 0.5); g.lineTo(cx + u * 0.6, cy - u * 0.5); g.lineTo(cx + u * 0.4, cy + u * 0.6); g.lineTo(cx - u * 0.4, cy + u * 0.6); g.closePath(); g.fill(); g.beginPath(); g.arc(cx + u * 0.7, cy, u * 0.25, -1.4, 1.4); g.stroke(); break;
        case "moon": g.arc(cx, cy, u * 0.7, 0, 7); g.fill(); g.fillStyle = SYM_COL.moon; g.beginPath(); g.arc(cx + u * 0.35, cy - u * 0.15, u * 0.6, 0, 7); g.fill(); break;
        case "key": g.arc(cx - u * 0.45, cy, u * 0.35, 0, 7); g.fill(); g.fillRect(cx - u * 0.2, cy - u * 0.1, u * 1.1, u * 0.2); g.fillRect(cx + u * 0.6, cy, u * 0.15, u * 0.35); break;
        case "hearth": g.moveTo(cx, cy - u * 1.1); g.quadraticCurveTo(cx + u * 0.9, cy - u * 0.1, cx + u * 0.5, cy + u * 0.7); g.lineTo(cx - u * 0.5, cy + u * 0.7); g.quadraticCurveTo(cx - u * 0.9, cy - u * 0.1, cx, cy - u * 1.1); g.fill(); g.fillStyle = C.amber; g.beginPath(); g.ellipse(cx, cy + u * 0.25, u * 0.25, u * 0.4, 0, 0, 7); g.fill(); break;
      }
    }
    function button(cx, cy, r, col, label) {
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.arc(cx + 2, cy + 3, r, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
      g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r * 0.78, 0, 7); g.stroke();
      const h = r * 0.28;
      g.fillStyle = C.ink;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { g.beginPath(); g.arc(cx + a * h, cy + b * h, r * 0.11, 0, 7); g.fill(); });
      g.strokeStyle = C.bone; g.lineWidth = Math.max(1, r * 0.08);
      g.beginPath(); g.moveTo(cx - h, cy - h); g.lineTo(cx + h, cy + h); g.moveTo(cx + h, cy - h); g.lineTo(cx - h, cy + h); g.stroke();
      if (label) {
        g.font = "700 13px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top";
        const w = g.measureText(label).width + 10;
        g.fillStyle = "rgba(42,33,27,.82)"; g.fillRect(cx - w / 2, cy + r + 2, w, 17);
        g.fillStyle = C.bone; g.fillText(label, cx, cy + r + 4);
      }
    }
    function paw(cx, cy, r) {
      g.fillStyle = C.amber; g.strokeStyle = C.cedar; g.lineWidth = 2;
      g.beginPath(); g.ellipse(cx + r * 0.9, cy + r * 1.2, r * 0.9, r * 1.6, -0.7, 0, 7); g.fill();
      g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#c98a6e"; [[0.3, 0.5], [0.9, 0.2], [1.4, 0.6]].forEach(([a, b]) => { g.beginPath(); g.arc(cx + a * r, cy + b * r + r * 0.4, r * 0.22, 0, 7); g.fill(); });
    }
    function card(x, y, w, h, col = C.cream) {
      g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 3, y + 4, w, h);
      g.fillStyle = col; g.fillRect(x, y, w, h);
      g.strokeStyle = C.rust; g.lineWidth = 1.4; g.setLineDash([4, 3]); g.strokeRect(x + 5, y + 5, w - 10, h - 10); g.setLineDash([]);
    }
    function wrapText(t, x, y, max, lh) {
      const words = t.split(" "); let line = "";
      for (const w of words) { const s = line ? line + " " + w : w; if (g.measureText(s).width > max && line) { g.fillText(line, x, y); line = w; y += lh; } else line = s; }
      g.fillText(line, x, y); return y + lh;
    }
    // what a move to space `to` would be, for the preview while dragging
    function kindOf(peg, to) {
      if (to === peg.at) return null;
      if (pegs.find((q) => q !== peg && q.at === to)) return "swap";
      return to === N - 1 ? "hearth" : SYM[to] === peg.gu.personal ? "personal" : SYM[to] === "knot" ? "knot" : "nudge";
    }
    const KIND_LABEL = { nudge: "nudge", swap: "swap", knot: "knot", hearth: "hearth", personal: "theirs" };

    function draw(now) {
      if (!L) layout();
      const { W, H, board, sheet, door, notes, sr, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!felt) felt = feltTex(Math.ceil(W), Math.ceil(H));
      g.drawImage(felt, 0, 0);
      // the embroidered cloth board
      feltCircle(board.cx, board.cy, board.R, C.cream);
      g.strokeStyle = "rgba(107,74,50,.5)"; g.lineWidth = 1.5; g.setLineDash([5, 5]); g.beginPath();
      SPOTS.forEach((_, i) => { const [x, y] = spot(i); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
      const active = drag ? drag.peg : kbPeg >= 0 ? pegs[kbPeg] : null;
      const hotI = drag ? drag.hover : kbPeg >= 0 ? kbSpace : -1;
      SPOTS.forEach((_, i) => {
        const [x, y] = spot(i), r = i === N - 1 ? sr * 1.7 : sr;
        feltCircle(x, y, r, SYM_COL[SYM[i]]);
        symbol(SYM[i], x, y, r);
        if (active && i === hotI) {
          const k = kindOf(active, i), ok = k && tampers.length < LIMIT;
          g.strokeStyle = ok ? C.amber : C.red; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r + 6, 0, 7); g.stroke();
          if (k) {
            g.font = "700 14px Karla,Arial,sans-serif"; const txt = ok ? KIND_LABEL[k] : "limit"; const w = g.measureText(txt).width + 14;
            g.fillStyle = ok ? (k === "personal" ? C.red : C.ink) : C.red; g.fillRect(x - w / 2, y - r - 30, w, 22);
            g.fillStyle = C.bone; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, x, y - r - 19);
          }
        }
      });
      g.fillStyle = C.ink; g.font = `italic ${Math.max(14, sr * 0.8)}px 'IM Fell English',Georgia,serif`; g.textAlign = "right"; g.textBaseline = "middle";
      const d0 = spot(0); g.fillText("Door", d0[0] - sr - 6, d0[1]);
      // pegs: where the scoresheet says they should be, then the pegs themselves
      pegs.forEach((p) => { if (p.at !== p.gu.sheet) { const [x, y] = spot(p.gu.sheet); g.strokeStyle = p.gu.col; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y - sr * 0.35, sr * 0.62, 0, 7); g.stroke(); g.setLineDash([]); } });
      pegs.forEach((p, k) => {
        if (drag && drag.peg === p) return;
        const [x, y] = spot(p.at), same = pegs.filter((q) => q.at === p.at), j = same.indexOf(p);
        const off = same.length > 1 ? (j - (same.length - 1) / 2) * sr * 0.9 : 0;
        const lift = hoverPeg === p && !drag ? 3 : 0;
        button(x + off, y - sr * 0.35 - lift, sr * 0.62, p.gu.col, p.gu.name);
        if ((kbUsed && kbPeg < 0 && k === kbSel) || lift) { g.strokeStyle = C.amber; g.lineWidth = 3; g.beginPath(); g.arc(x + off, y - sr * 0.35 - lift, sr * 0.62 + 5, 0, 7); g.stroke(); }
      });
      if (drag) { paw(drag.x, drag.y, sr * 0.9); button(drag.x, drag.y, sr * 0.7, drag.peg.gu.col, drag.peg.gu.name); }
      // scoresheet
      card(sheet.x, sheet.y, sheet.w, sheet.h);
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = C.ink;
      if (wide) {
        g.font = "italic 20px 'IM Fell English',Georgia,serif"; g.fillText("Scores", sheet.x + 14, sheet.y + 30);
        let y = sheet.y + 54;
        GUESTS.forEach((gu, i) => {
          g.fillStyle = gu.col; g.fillRect(sheet.x + 14, y - 11, 12, 12); g.fillStyle = C.ink; g.font = "700 14px Karla,Arial,sans-serif"; g.fillText(gu.name, sheet.x + 32, y);
          const moved = pegs[i].at !== gu.sheet;
          g.textAlign = "right"; g.font = "600 13px Karla,Arial,sans-serif"; g.fillStyle = moved ? C.red : C.ink; g.fillText(moved ? `now ${pegs[i].at + 1}` : "", sheet.x + sheet.w - 14, y); g.textAlign = "left";
          y += 18; g.font = "13px Karla,Arial,sans-serif";
          gu.trail.forEach(([w, n, pos]) => { g.fillStyle = "rgba(42,33,27,.85)"; g.fillText(w, sheet.x + 18, y); g.textAlign = "right"; g.fillText(String(pos + 1), sheet.x + sheet.w - 14, y); g.textAlign = "left"; y += 16; });
          g.strokeStyle = "rgba(165,85,58,.5)"; g.beginPath(); g.moveTo(sheet.x + 14, y - 8); g.lineTo(sheet.x + sheet.w - 14, y - 8); g.stroke(); y += 8;
        });
      } else {
        GUESTS.forEach((gu, i) => {
          const x = sheet.x + 12 + i * (sheet.w - 24) / 3, moved = pegs[i].at !== gu.sheet;
          g.fillStyle = gu.col; g.fillRect(x, sheet.y + 14, 11, 11); g.fillStyle = C.ink; g.font = "700 14px Karla,Arial,sans-serif"; g.fillText(gu.name, x + 15, sheet.y + 25);
          g.font = "13px Karla,Arial,sans-serif"; g.fillStyle = moved ? C.red : C.ink; g.fillText(moved ? `sheet ${gu.sheet + 1} → ${pegs[i].at + 1}` : `space ${gu.sheet + 1}`, x, sheet.y + 46);
        });
      }
      // tampers left: three felt buttons
      const tx = wide ? sheet.x + 14 : notes.x + notes.w - 96, ty = wide ? sheet.y + sheet.h - 24 : notes.y + 22;
      g.fillStyle = C.ink; g.font = "italic 15px 'IM Fell English',Georgia,serif"; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillText("tampers", tx, ty - 16);
      for (let k = 0; k < LIMIT; k++) { const used = k < tampers.length; button(tx + 12 + k * 28, ty, 11, used ? C.red : C.cream); }
      // doorway strip: footsteps in three steps, the window, and the time
      const step = footStep();
      g.fillStyle = C.night; g.fillRect(door.x, door.y, door.w, door.h);
      g.strokeStyle = C.bone; g.setLineDash([4, 3]); g.lineWidth = 1.2; g.strokeRect(door.x + 4, door.y + 4, door.w - 8, door.h - 8); g.setLineDash([]);
      g.fillStyle = C.bone; g.font = "italic 16px 'IM Fell English',Georgia,serif"; g.textAlign = "left";
      g.fillText("doorway", door.x + 12, door.y + (wide ? 26 : 20));
      for (let k = 0; k < 3; k++) {
        const on = step > k;
        const fx = wide ? door.x + door.w / 2 : door.x + 100 + k * (door.w - 220) / 3, fy = wide ? door.y + 150 + k * (door.h - 240) / 3 : door.y + door.h / 2;
        const sc = (0.6 + k * 0.3) * (wide ? 1.2 : 0.7);
        g.globalAlpha = on ? 1 : 0.18; g.fillStyle = on ? C.amber : C.bone;
        [[-6, 0], [6, 10]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(fx + dx * sc, fy + dy * sc, 5 * sc, 9 * sc, 0, 0, 7); g.fill(); });
        g.globalAlpha = 1;
      }
      // the window: Wes on the porch, looking in
      const wx = wide ? door.x + door.w / 2 : door.x + door.w - 92, wy = wide ? door.y + 72 : door.y + door.h / 2, ws = wide ? 30 : 17;
      const look = watchState === "watch", warn = watchState === "warn";
      g.fillStyle = look ? "#e9c98a" : warn ? "#7f8ca3" : "#2c3547"; g.fillRect(wx - ws, wy - ws * 0.8, ws * 2, ws * 1.6);
      g.strokeStyle = C.bone; g.lineWidth = 2; g.strokeRect(wx - ws, wy - ws * 0.8, ws * 2, ws * 1.6);
      g.beginPath(); g.moveTo(wx, wy - ws * 0.8); g.lineTo(wx, wy + ws * 0.8); g.moveTo(wx - ws, wy); g.lineTo(wx + ws, wy); g.stroke();
      if (look || warn) { g.fillStyle = look ? "rgba(42,33,27,.85)" : "rgba(42,33,27,.4)"; g.beginPath(); g.arc(wx, wy - ws * 0.1, ws * 0.42, 0, 7); g.fill(); g.fillRect(wx - ws * 0.6, wy + ws * 0.25, ws * 1.2, ws * 0.55); }
      if (wide) { g.fillStyle = C.bone; g.font = "13px Karla,Arial,sans-serif"; g.textAlign = "center"; g.fillText(look ? "looking in" : warn ? "at the glass" : "porch", wx, wy + ws + 18); }
      const left = Math.max(0, arrival() - t);
      g.fillStyle = C.bone; g.font = "700 14px Karla,Arial,sans-serif"; g.textAlign = wide ? "center" : "right";
      const stateTxt = step >= 3 ? "at the door!" : step === 2 ? "on the steps" : step === 1 ? "voices outside" : "quiet";
      if (wide) { g.fillStyle = step ? C.amber : C.bone; g.fillText(stateTxt, door.x + door.w / 2, door.y + door.h - 40); g.fillStyle = C.bone; g.font = "700 22px Karla,Arial,sans-serif"; g.fillText(`${Math.ceil(left)} s`, door.x + door.w / 2, door.y + door.h - 16); }
      else { g.fillStyle = step ? C.amber : C.bone; g.fillText(`${stateTxt} · ${Math.ceil(left)} s`, door.x + door.w - 128, door.y + 30); }
      // notes strip
      card(notes.x, notes.y, notes.w, notes.h);
      g.fillStyle = C.ink; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = "italic 15px 'IM Fell English',Georgia,serif";
      g.fillText("what you watched from the shelf:", notes.x + 14, notes.y + 22);
      g.font = "14px Karla,Arial,sans-serif";
      let ny = notes.y + 41;
      const maxW = notes.w - 28 - (wide ? 0 : 0);
      NOTES.forEach((n) => { ny = wrapText(n, notes.x + 14, ny, wide ? maxW : maxW, 17); });
      // climbing back, the hunger, messages
      if (climbing >= 0) {
        const p = Math.min(1, climbing / CLIMB);
        g.fillStyle = "rgba(42,33,27,.75)"; g.fillRect(board.cx - 130, board.cy - 28, 260, 56);
        g.fillStyle = C.amber; g.fillRect(board.cx - 116, board.cy + 8, 232 * p, 10);
        g.fillStyle = C.bone; g.textAlign = "center"; g.font = "700 15px Karla,Arial,sans-serif"; g.fillText("climbing back to the shelf…", board.cx, board.cy - 6);
      }
      if (still) {
        g.strokeStyle = C.amber; g.lineWidth = 6; g.globalAlpha = 0.7; g.beginPath(); g.arc(board.cx, board.cy, board.R + 4, 0, 7); g.stroke(); g.globalAlpha = 1;
      }
      if (look && !still) { g.fillStyle = `rgba(233,201,138,${api.reducedMotion ? 0.18 : 0.12 + 0.08 * Math.sin(now / 90)})`; g.fillRect(0, 0, W, H); }
      if (lastMsg && now - msgT < 2600) {
        g.font = "700 15px Karla,Arial,sans-serif"; const w = Math.min(board.R * 1.9, g.measureText(lastMsg).width + 28);
        g.fillStyle = "rgba(42,33,27,.88)"; g.fillRect(board.cx - w / 2, board.cy + board.R * 0.5, w, 32);
        g.fillStyle = msgCol; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lastMsg, board.cx, board.cy + board.R * 0.5 + 16, w - 16);
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1500;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 30;
        g.globalAlpha = 1 - a * a; g.font = "700 16px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.lineWidth = 4; g.strokeStyle = C.ink; g.strokeText(p.text, p.x, p.y - rise); g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise);
        g.globalAlpha = 1;
      }
      K.frame(draw);
    }

    // ---- the clock, the footsteps and the window ---------------------------------------------
    function arrival() { const all = TIME * speed; return early !== null ? Math.min(all, early) : all; }
    function footStep() { const a = arrival(), lead = 12 * speed; if (t < a - lead) return 0; return Math.min(3, 1 + Math.floor((t - (a - lead)) / (4 * speed))); }

    // ---- tampering ---------------------------------------------------------------------------
    function addDread(id, v, personalOne) {
      if (!personalOne && blame >= 50) { const half = v / 2; dread[id] += half; blame += half; } else dread[id] += v;
    }
    function apply(kind, owner, other) {
      if (kind === "nudge") { addDread(owner, 6); blame += 2; }
      if (kind === "swap") { addDread(owner, 4); addDread(other, 4); blame += 8; }
      if (kind === "knot") addDread(owner, 8);
      if (kind === "hearth") { GUESTS.forEach((gu) => addDread(gu.id, 10)); blame += 12; }
      if (kind === "personal") { dread[owner] += 15; personal++; }
      hunger = Math.max(0, hunger - 5);
      noise += kind === "swap" || kind === "hearth" ? 2 : 1;
    }
    function move(peg, to) {
      if (over || climbing >= 0 || still) return;
      if (to === peg.at) return;
      if (tampers.length >= LIMIT) { say("Three tampers is all a visit allows. Leave.", C.amber); return; }
      const snap = { pegs: pegs.map((p) => p.at), dread: { ...dread }, blame, hunger, noise, personal };
      const occ = pegs.find((q) => q !== peg && q.at === to);
      let kind;
      if (occ) { kind = "swap"; occ.at = peg.at; peg.at = to; apply(kind, peg.gu.id, occ.gu.id); }
      else { peg.at = to; kind = kindOf({ gu: peg.gu, at: -1 }, to); apply(kind, peg.gu.id); }
      tampers.push({ kind, snap, who: peg.gu.name });
      undoBtn.disabled = false;
      const [x, y] = spot(to);
      const dv = { nudge: 6, swap: 4, knot: 8, hearth: 10, personal: 15 }[kind];
      pop(`${KIND_LABEL[kind]} · +${dv} dread`, x, y - L.sr * 1.6, kind === "personal" ? C.amber : C.bone);
      say({ nudge: `${peg.gu.name}'s peg nudged off the scoresheet.`, swap: `${peg.gu.name} and ${occ ? occ.gu.name : ""} swapped.`, knot: `${peg.gu.name}'s peg on a Knot it never landed on.`, hearth: `${peg.gu.name}'s peg on the Hearth.`, personal: `${peg.gu.name}'s peg on the ${SYM[to]}.` }[kind]);
      if (!firstSaid) { firstSaid = true; beat("The first peg", "It is still warm from their hands. Somewhere on the trail they are laughing about something else."); }
      if (kind === "personal" && !personalSaid) { personalSaid = true; beat("You know where this one belongs", "Nobody wrote it down. You watched, and you remembered. That is the worst of it."); }
      if (watchState === "watch") seen();
    }
    function undo() {
      if (climbing >= 0 || over) return;
      const last = tampers.pop(); if (!last) return;
      last.snap.pegs.forEach((a, i) => (pegs[i].at = a)); Object.assign(dread, last.snap.dread);
      ({ blame, hunger, noise, personal } = last.snap);
      undoBtn.disabled = true; say("Put back, as if nothing happened.");
    }
    function setStill(v) {
      if (over || climbing >= 0) v = false;
      if (!v && still && watchState === "watch") seen();
      still = v; stillBtn.setAttribute("aria-pressed", String(v));
      if (v) drag = null;
    }
    function seen() {
      if (watchSeen) return;
      watchSeen = true; seenCount++; noise += 3; blame += 4;
      const at = t + 10 * speed;
      early = early === null ? at : Math.min(early, at);
      say("Wes saw something move on the table. He is coming in.", C.amber);
      beat("At the window", "A shape in the glass, a hand cupped against the light. Then the porch boards creak toward the door.");
    }
    function leave() { if (over || climbing >= 0) return; setStill(false); climbing = 0; undoBtn.disabled = true; leaveBtn.disabled = true; stillBtn.disabled = true; drag = null; }
    function finishWith(kind, text) { over = true; api.store.set("losses", kind === "lose" ? losses + 1 : 0); api.end({ outcome: kind, text }); }
    function caught(who) {
      dread[who.id] += 15; blame = Math.max(0, blame - 10);
      finishWith("lose", `${who.name} comes in while you are still on the table. A slip: one memory goes. For a moment ${who.name} stares at the cat by the board; then a laugh, too loud, and you are carried back to the shelf by hand. ${tampers.length ? `${tampers.length} tamper${tampers.length === 1 ? "" : "s"} left behind.` : ""}`);
    }
    function safe() {
      const sum = Math.round(dread.noor + dread.wes + dread.ana);
      const parts = GUESTS.map((gu) => `${gu.name} +${Math.round(dread[gu.id])}`).join(", ");
      const mine = GUESTS.filter((gu, i) => SYM[pegs[i].at] === gu.personal && pegs[i].at !== gu.sheet).map((gu) => gu.name);
      if (!tampers.length) { finishWith("done", "Back on the shelf having touched nothing. The pegs are where the guests left them, and the hunger has not been fed."); return; }
      const won = sum >= 15 || personal > 0;
      let tail;
      if (mine.length) tail = ` When they sit down tonight, ${mine.join(" and ")} will find their own symbol under their peg, and say nothing about it to the others.`;
      else if (blame >= 50) tail = " Tonight they will argue about who moved the pegs. Nobody will think of the shelf.";
      else tail = " Someone will say the board got knocked. Nobody will quite believe it.";
      finishWith(won ? "win" : "done", `Back on the shelf before the door opens. Dread: ${parts}; blame ${Math.round(blame)}.${tail}${seenCount ? " Wes keeps glancing at the window." : ""}`);
    }

    // ---- input -------------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    function nearestSpace(x, y, max) { let best = -1, bd = 1e9; SPOTS.forEach((_, i) => { const [sx, sy] = spot(i), d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = i; } }); return bd <= max ? best : -1; }
    function pegAt(x, y) { return pegs.find((p) => { const [sx, sy] = spot(p.at); return Math.hypot(sx - x, sy - y + L.sr * 0.35) < L.sr * 1.1; }); }
    K.on(cv, "pointerdown", (e) => {
      if (!started || over || climbing >= 0) return;
      if (still) { say("You are holding still. Let go first.", C.amber); return; }
      const [x, y] = pt(e), p = pegAt(x, y);
      if (p) { drag = { peg: p, x, y, hover: p.at }; cv.setPointerCapture(e.pointerId); if (watchState === "watch") seen(); }
    });
    K.on(cv, "pointermove", (e) => {
      const [x, y] = pt(e);
      hoverPeg = !drag && started ? pegAt(x, y) || null : null;
      cv.style.cursor = drag ? "grabbing" : hoverPeg ? "grab" : "default";
      if (!drag) return; drag.x = x; drag.y = y; drag.hover = nearestSpace(x, y, L.sr * 1.4);
    });
    K.on(cv, "pointerup", (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      const [x, y] = pt(e), to = nearestSpace(x, y, L.sr * 1.4);
      if (to >= 0) move(d.peg, to);
    });
    K.on(wrap, "keydown", (e) => {
      if (!started || over || climbing >= 0) return;
      const k = e.key;
      if (k === " ") { e.preventDefault(); if (!e.repeat) setStill(true); return; }
      if (e.target.tagName === "BUTTON" && k === "Enter") return;
      kbUsed = true;
      if (["1", "2", "3"].includes(k)) { kbSel = +k - 1; kbPeg = -1; }
      else if (kbPeg < 0 && ["ArrowRight", "ArrowDown"].includes(k)) { kbSel = (kbSel + 1) % 3; e.preventDefault(); }
      else if (kbPeg < 0 && ["ArrowLeft", "ArrowUp"].includes(k)) { kbSel = (kbSel + 2) % 3; e.preventDefault(); }
      else if (kbPeg >= 0 && ["ArrowRight", "ArrowDown"].includes(k)) { kbSpace = Math.min(N - 1, kbSpace + 1); e.preventDefault(); }
      else if (kbPeg >= 0 && ["ArrowLeft", "ArrowUp"].includes(k)) { kbSpace = Math.max(0, kbSpace - 1); e.preventDefault(); }
      else if (k === "Enter") {
        e.preventDefault();
        if (still) return;
        if (kbPeg < 0) { kbPeg = kbSel; kbSpace = pegs[kbSel].at; if (watchState === "watch") seen(); }
        else { move(pegs[kbPeg], kbSpace); kbPeg = -1; }
      } else if (k === "Escape") kbPeg = -1;
      else if (k === "u" || k === "U") undo();
      else if (k === "l" || k === "L") leave();
    });
    K.on(wrap, "keyup", (e) => { if (e.key === " ") { e.preventDefault(); setStill(false); } });
    K.on(stillBtn, "pointerdown", (e) => { e.preventDefault(); setStill(true); });
    K.on(stillBtn, "pointerup", () => setStill(false));
    K.on(stillBtn, "pointerleave", () => { if (still) setStill(false); });
    K.on(stillBtn, "click", (e) => { if (e.detail === 0) setStill(!still); });
    K.on(window, "blur", () => setStill(false));
    K.on(undoBtn, "click", () => { undo(); wrap.focus(); });
    K.on(leaveBtn, "click", leave);

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        t += dt;
        // the window: Wes looks in twice; a warning shadow, then a look
        const w = watches[watchI];
        if (w !== undefined) {
          if (watchState === "none" && t >= w) { watchState = "warn"; watchT = WARN * speed; stillBtn.hidden = false; stillBtn.classList.add(PRE + "urgent"); if (watchI === 0) beat("A shadow at the window", "Wes, on the porch with his camera, cups a hand to the glass. Hold still (Space, or hold the button) until he looks away."); }
          else if (watchState === "warn") { watchT -= dt; if (watchT <= 0) { watchState = "watch"; watchT = WATCH * speed; watchSeen = false; if (!still || drag) seen(); } }
          else if (watchState === "watch") { watchT -= dt; if (watchT <= 0) { watchState = "none"; watchI++; stillBtn.classList.remove(PRE + "urgent"); if (!over) say("He looks away.", C.bone); } }
        }
        // the porch guest after 60 s, if you have been loud
        if (early === null && t >= 60 * speed && noise >= 3) early = t + (12 + rng() * 10) * speed;
        const st = footStep();
        if (st >= 1 && stepSaid < 1) { stepSaid = 1; beat("Voices on the trail", "The hike is coming back early, or right on time. Leave now and the climb takes four seconds.", 3800); }
        if (climbing >= 0) { climbing += dt / speed; if (climbing >= CLIMB) { safe(); } }
        if (!over && t >= arrival()) caught(early !== null && early < TIME * speed ? GUESTS[1] : GUESTS[0]);
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    // ---- how to play: a felt banner ------------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play Parlour">
      <h2>Parlour</h2>
      <p class="${PRE}goal">Day two, late morning. The guests are out on the hike; their counting game lies mid-play on the table. Move their pegs so the wrongness finds each of them, and be back on the shelf before anyone walks in.</p>
      <div class="${PRE}legend">
        <div><i style="background:${btnFelt(C.sky)}"></i><span>Drag a peg to any space</span><kbd>1–3 · Enter · arrows</kbd></div>
        <div><i style="background:${btnFelt(C.cream)}"></i><span>Undo the last tamper</span><kbd>U</kbd></div>
        <div><i style="background:${btnFelt(C.red)}"></i><span>Leave: the climb takes four seconds</span><kbd>L</kbd></div>
      </div>
      <p class="${PRE}kind" ${losses >= 2 ? "" : "hidden"}>Caught twice. A slower hike is ticked for you.</p>
      <label><input type="checkbox" ${losses >= 2 ? "checked" : ""}> Slower hike (twice the time)</label>
      <button type="button">Climb down</button>
    </div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => {
      speed = intro.querySelector("input").checked ? 2 : 1;
      watches = [(18 + rng() * 8) * speed, (48 + rng() * 8) * speed];
      intro.remove(); started = true; leaveBtn.disabled = false; wrap.focus();
      beat("Three tampers", "Read your notes along the bottom. The pegs are big felt buttons; the spaces are stitched symbols. Pick what each of them will find.", 5000);
    });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    // a read-only probe for automated play tests
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

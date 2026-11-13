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
const TIME = 90, CLIMB = 4, LIMIT = 3;

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.moss};overflow:hidden;touch-action:none;outline:none;font-family:Karla,Arial,sans-serif;color:${C.ink}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}btns{position:absolute;right:12px;bottom:12px;display:flex;gap:8px;z-index:2}
.${PRE}btns button{font:600 14px Karla,Arial,sans-serif;border:2px dashed ${C.bone};outline:3px solid ${C.cedar};background:${C.cedar};color:${C.bone};padding:8px 16px;border-radius:14px;cursor:pointer;min-height:40px}
.${PRE}btns button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}btns button.${PRE}leave{background:${C.red};outline-color:${C.red}}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.5);z-index:3;padding:16px}
.${PRE}intro div{max-width:480px;background:${C.cream};border:3px dashed ${C.rust};outline:6px solid ${C.cream};padding:18px 22px;border-radius:22px}
.${PRE}intro h2{margin:0 0 8px;font:400 30px 'IM Fell English',Georgia,serif}
.${PRE}intro p{margin:0 0 8px;font-size:14px;line-height:1.45}
.${PRE}intro button{font:600 15px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:0;border-radius:14px;padding:9px 22px;cursor:pointer;margin-top:6px}
.${PRE}intro label{font-size:12px;display:flex;gap:6px;align-items:center;margin-top:8px}
</style><canvas aria-label="The counting game's felt board seen from above, with the guests' button pegs"></canvas>
<div class="${PRE}btns"><button type="button" class="${PRE}undo" disabled>Undo</button><button type="button" class="${PRE}leave" disabled>Leave</button></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const undoBtn = wrap.querySelector("." + PRE + "undo"), leaveBtn = wrap.querySelector("." + PRE + "leave");

    const pegs = GUESTS.map((gu) => ({ gu, at: gu.sheet }));
    const dread = { noor: 0, wes: 0, ana: 0 };
    let blame = 34, hunger = 70, tampers = [], noise = 0, personal = 0;
    let started = false, over = false, speed = 1, t = 0, climbing = -1, early = null, lastMsg = "", msgT = 0;
    let drag = null, kbPeg = -1, kbSpace = -1, kbUsed = false;
    let L = null, felt = null;

    function spiral() {
      // 30 spaces at equal arc length on a spiral from the Door (outside) to the Hearth (centre)
      const pts = [], turns = 2.35, steps = 2000;
      const path = [];
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
        sheet = { x: 16, y: 16, w: Math.min(200, W * 0.17), h: H - 120 };
        door = { x: W - 16 - Math.min(110, W * 0.09), y: 16, w: Math.min(110, W * 0.09), h: H - 120 };
        notes = { x: 16, y: H - 92, w: W - 32 - 200, h: 76 };
        const bw = door.x - (sheet.x + sheet.w) - 24, bh = H - 120;
        const R = Math.min(bw, bh) / 2;
        board = { cx: sheet.x + sheet.w + 12 + bw / 2, cy: 16 + bh / 2, R };
      } else {
        const R = Math.min(W - 20, H * 0.52) / 2;
        board = { cx: W / 2, cy: 10 + R, R };
        const y0 = board.cy + R + 10;
        door = { x: 10, y: y0, w: W - 20, h: 46 };
        sheet = { x: 10, y: y0 + 54, w: W - 20, h: Math.max(60, H - (y0 + 54) - 136) };
        notes = { x: 10, y: H - 128, w: W - 20, h: 66 };
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
      if (label) { g.fillStyle = C.bone; g.font = `600 ${Math.max(10, r * 0.6)}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.fillText(label, cx, cy + r + 2); }
    }
    function paw(cx, cy, r) {
      g.fillStyle = C.amber; g.strokeStyle = C.cedar; g.lineWidth = 2;
      g.beginPath(); g.ellipse(cx + r * 0.9, cy + r * 1.2, r * 0.9, r * 1.6, -0.7, 0, 7); g.fill();
      g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#c98a6e"; [[0.3, 0.5], [0.9, 0.2], [1.4, 0.6]].forEach(([a, b]) => { g.beginPath(); g.arc(cx + a * r, cy + b * r + r * 0.4, r * 0.22, 0, 7); g.fill(); });
    }
    function card(x, y, w, h) {
      g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 3, y + 4, w, h);
      g.fillStyle = C.cream; g.fillRect(x, y, w, h);
      g.strokeStyle = C.rust; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.strokeRect(x + 5, y + 5, w - 10, h - 10); g.setLineDash([]);
    }

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
      SPOTS.forEach((_, i) => {
        const [x, y] = spot(i), r = i === N - 1 ? sr * 1.7 : sr;
        feltCircle(x, y, r, SYM_COL[SYM[i]]);
        symbol(SYM[i], x, y, r);
        if (drag || kbPeg >= 0) {
          const hot = (drag && drag.hover === i) || (kbPeg >= 0 && kbSpace === i);
          if (hot) { g.strokeStyle = C.amber; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r + 5, 0, 7); g.stroke(); }
        }
      });
      g.fillStyle = C.ink; g.font = `italic ${Math.max(11, sr * 0.7)}px 'IM Fell English',Georgia,serif`; g.textAlign = "right"; g.textBaseline = "middle";
      const d0 = spot(0); g.fillText("Door", d0[0] - sr - 6, d0[1]);
      // pegs (buttons), offset when sharing a space
      pegs.forEach((p, k) => {
        if (drag && drag.peg === p) return;
        const [x, y] = spot(p.at), same = pegs.filter((q) => q.at === p.at), j = same.indexOf(p);
        const off = same.length > 1 ? (j - (same.length - 1) / 2) * sr * 0.9 : 0;
        button(x + off, y - sr * 0.35, sr * 0.62, p.gu.col, p.gu.name);
        if (kbUsed && kbPeg < 0 && k === kbSel) { g.strokeStyle = C.amber; g.lineWidth = 3; g.beginPath(); g.arc(x + off, y - sr * 0.35, sr * 0.62 + 5, 0, 7); g.stroke(); }
      });
      if (drag) { paw(drag.x, drag.y, sr * 0.9); button(drag.x, drag.y, sr * 0.7, drag.peg.gu.col, drag.peg.gu.name); }
      // scoresheet
      card(sheet.x, sheet.y, sheet.w, sheet.h);
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = C.ink;
      g.font = "italic 17px 'IM Fell English',Georgia,serif"; g.fillText("Scores", sheet.x + 12, sheet.y + 26);
      if (wide) {
        let y = sheet.y + 46;
        GUESTS.forEach((gu) => {
          g.fillStyle = gu.col; g.fillRect(sheet.x + 12, y - 9, 10, 10); g.fillStyle = C.ink; g.font = "600 12px Karla,Arial,sans-serif"; g.fillText(gu.name, sheet.x + 28, y); y += 15;
          g.font = "11px Karla,Arial,sans-serif";
          gu.trail.forEach(([w, n, pos]) => { g.fillStyle = "rgba(42,33,27,.75)"; g.fillText(w, sheet.x + 16, y); g.textAlign = "right"; g.fillText(String(pos + 1), sheet.x + sheet.w - 14, y); g.textAlign = "left"; y += 13; });
          g.strokeStyle = "rgba(165,85,58,.5)"; g.beginPath(); g.moveTo(sheet.x + 12, y - 6); g.lineTo(sheet.x + sheet.w - 12, y - 6); g.stroke(); y += 8;
        });
      } else {
        g.font = "12px Karla,Arial,sans-serif";
        GUESTS.forEach((gu, i) => { const x = sheet.x + 12 + i * (sheet.w - 24) / 3; g.fillStyle = gu.col; g.fillRect(x, sheet.y + 36, 10, 10); g.fillStyle = C.ink; g.fillText(`${gu.name}: space ${gu.sheet + 1}`, x + 14, sheet.y + 46); g.fillStyle = "rgba(42,33,27,.7)"; g.fillText(`last: ${gu.trail[gu.trail.length - 1][0]}`, x + 14, sheet.y + 60); });
      }
      // tampers left: three felt buttons
      const tx = wide ? sheet.x + 12 : sheet.x + sheet.w - 90, ty = wide ? sheet.y + sheet.h - 22 : sheet.y + 40;
      g.fillStyle = C.ink; g.font = "italic 12px 'IM Fell English',Georgia,serif"; g.fillText("tampers", tx, ty - 16);
      for (let k = 0; k < LIMIT; k++) { const used = k < tampers.length; button(tx + 10 + k * 26, ty, 10, used ? C.red : C.cream); }
      // doorway strip: footsteps in three steps
      const step = footStep();
      g.fillStyle = C.night; g.fillRect(door.x, door.y, door.w, door.h);
      g.strokeStyle = C.bone; g.setLineDash([4, 3]); g.lineWidth = 1.2; g.strokeRect(door.x + 4, door.y + 4, door.w - 8, door.h - 8); g.setLineDash([]);
      g.fillStyle = C.bone; g.font = "italic 13px 'IM Fell English',Georgia,serif"; g.textAlign = "left";
      g.fillText("doorway", door.x + 10, door.y + (wide ? 22 : 17));
      for (let k = 0; k < 3; k++) {
        const on = step > k;
        const fx = wide ? door.x + door.w / 2 : door.x + 90 + k * (door.w - 110) / 3, fy = wide ? door.y + 60 + k * (door.h - 100) / 3 : door.y + door.h / 2;
        const sc = (0.6 + k * 0.25) * (wide ? 1 : 0.7);
        g.globalAlpha = on ? 1 : 0.18; g.fillStyle = C.bone;
        [[-6, 0], [6, 10]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(fx + dx * sc, fy + dy * sc, 5 * sc, 9 * sc, 0, 0, 7); g.fill(); });
        g.globalAlpha = 1;
      }
      const left = Math.max(0, TIME * speed - t);
      g.fillStyle = C.bone; g.font = "600 12px Karla,Arial,sans-serif"; g.textAlign = wide ? "center" : "right";
      const stateTxt = step >= 3 ? "at the door" : step === 2 ? "on the steps" : step === 1 ? "on the porch" : "quiet";
      if (wide) { g.fillText(stateTxt, door.x + door.w / 2, door.y + door.h - 34); g.fillText(`${Math.ceil(left)} s`, door.x + door.w / 2, door.y + door.h - 16); }
      else g.fillText(`${stateTxt} · ${Math.ceil(left)} s`, door.x + door.w - 10, door.y + 17);
      // notes strip
      card(notes.x, notes.y, notes.w, notes.h);
      g.fillStyle = C.ink; g.textAlign = "left"; g.font = "italic 12px 'IM Fell English',Georgia,serif";
      g.fillText("notes:", notes.x + 12, notes.y + 20);
      g.font = `${notes.w < 500 ? 10.5 : 12}px Karla,Arial,sans-serif`;
      NOTES.forEach((n, i) => g.fillText(n, notes.x + (notes.w < 500 ? 12 : 60), notes.y + (notes.w < 500 ? 32 : 20) + i * (notes.w < 500 ? 12 : 17), notes.w - 70));
      // climbing back, messages
      if (climbing >= 0) {
        const p = Math.min(1, climbing / CLIMB);
        g.fillStyle = "rgba(42,33,27,.6)"; g.fillRect(board.cx - 110, board.cy - 22, 220, 44);
        g.fillStyle = C.amber; g.fillRect(board.cx - 100, board.cy + 6, 200 * p, 8);
        g.fillStyle = C.bone; g.textAlign = "center"; g.font = "600 13px Karla,Arial,sans-serif"; g.fillText("climbing back to the shelf…", board.cx, board.cy - 4);
      }
      if (lastMsg && now - msgT < 2600) {
        g.font = "600 14px Karla,Arial,sans-serif"; const w = g.measureText(lastMsg).width + 24;
        g.fillStyle = "rgba(42,33,27,.82)"; g.fillRect(board.cx - w / 2, board.cy + board.R * 0.55, w, 28);
        g.fillStyle = C.bone; g.textAlign = "center"; g.fillText(lastMsg, board.cx, board.cy + board.R * 0.55 + 19);
      }
      K.frame(draw);
    }

    // ---- the clock and the footsteps ---------------------------------------------------------
    // Everyone returns at 90 s (footsteps from 78). The porch guest may come early after 60 s if loud.
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
      if (over || climbing >= 0) return;
      if (to === peg.at) return;
      if (tampers.length >= LIMIT) { say("Three tampers is all a visit allows. Leave."); return; }
      const snap = { pegs: pegs.map((p) => p.at), dread: { ...dread }, blame, hunger, noise, personal };
      const occ = pegs.find((q) => q !== peg && q.at === to);
      let kind;
      if (occ) { kind = "swap"; occ.at = peg.at; peg.at = to; apply(kind, peg.gu.id, occ.gu.id); }
      else {
        peg.at = to;
        kind = to === N - 1 ? "hearth" : SYM[to] === peg.gu.personal ? "personal" : SYM[to] === "knot" ? "knot" : "nudge";
        apply(kind, peg.gu.id);
      }
      tampers.push({ kind, snap, who: peg.gu.name });
      undoBtn.disabled = false;
      say({ nudge: `${peg.gu.name}'s peg nudged off the scoresheet.`, swap: `${peg.gu.name} and ${occ ? occ.gu.name : ""} swapped.`, knot: `${peg.gu.name}'s peg on a Knot it never landed on.`, hearth: `${peg.gu.name}'s peg on the Hearth.`, personal: `${peg.gu.name}'s peg on the ${SYM[to]}.` }[kind]);
    }
    function undo() {
      const last = tampers.pop(); if (!last || climbing >= 0) return;
      last.snap.pegs.forEach((a, i) => (pegs[i].at = a)); Object.assign(dread, last.snap.dread);
      ({ blame, hunger, noise, personal } = last.snap);
      undoBtn.disabled = true; say("Put back.");
    }
    function say(m) { lastMsg = m; msgT = performance.now(); }
    function leave() { if (over || climbing >= 0) return; climbing = 0; undoBtn.disabled = true; leaveBtn.disabled = true; drag = null; }
    function caught(who) {
      over = true;
      dread[who.id] += 15; blame = Math.max(0, blame - 10);
      api.end({ outcome: "lose", text: `${who.name} comes in while you are on the table. A slip: one memory goes, and the visit ends. ${tampers.length} tamper${tampers.length === 1 ? "" : "s"} left behind.` });
    }
    function safe() {
      over = true;
      const sum = Math.round(dread.noor + dread.wes + dread.ana);
      const parts = GUESTS.map((gu) => `${gu.name} +${Math.round(dread[gu.id])}`).join(", ");
      const won = sum >= 15 || personal > 0;
      api.end({ outcome: won ? "win" : "done", text: `Back on the shelf before the door opens. Dread: ${parts}; blame ${Math.round(blame)}.${personal ? ` ${personal} of them will find their own symbol under their peg.` : tampers.length ? "" : " You touched nothing."}` });
    }

    // ---- input -------------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    function nearestSpace(x, y, max) { let best = -1, bd = 1e9; SPOTS.forEach((_, i) => { const [sx, sy] = spot(i), d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = i; } }); return bd <= max ? best : -1; }
    function pegAt(x, y) { return pegs.find((p) => { const [sx, sy] = spot(p.at); return Math.hypot(sx - x, sy - y + L.sr * 0.35) < L.sr * 1.1; }); }
    K.on(cv, "pointerdown", (e) => {
      if (!started || over || climbing >= 0) return;
      const [x, y] = pt(e), p = pegAt(x, y);
      if (p) { drag = { peg: p, x, y, hover: p.at }; cv.setPointerCapture(e.pointerId); }
    });
    K.on(cv, "pointermove", (e) => { if (!drag) return; const [x, y] = pt(e); drag.x = x; drag.y = y; drag.hover = nearestSpace(x, y, L.sr * 1.4); });
    K.on(cv, "pointerup", (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      const [x, y] = pt(e), to = nearestSpace(x, y, L.sr * 1.4);
      if (to >= 0) move(d.peg, to);
    });
    // keyboard: Tab-free: 1/2/3 or arrows pick a peg, Enter lifts it, arrows walk the spiral, Enter sets it down
    let kbSel = 0;
    K.on(wrap, "keydown", (e) => {
      if (!started || over || climbing >= 0) return;
      if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      kbUsed = true;
      const k = e.key;
      if (["1", "2", "3"].includes(k)) { kbSel = +k - 1; kbPeg = -1; }
      else if (kbPeg < 0 && ["ArrowRight", "ArrowDown"].includes(k)) { kbSel = (kbSel + 1) % 3; e.preventDefault(); }
      else if (kbPeg < 0 && ["ArrowLeft", "ArrowUp"].includes(k)) { kbSel = (kbSel + 2) % 3; e.preventDefault(); }
      else if (kbPeg >= 0 && ["ArrowRight", "ArrowDown"].includes(k)) { kbSpace = Math.min(N - 1, kbSpace + 1); e.preventDefault(); }
      else if (kbPeg >= 0 && ["ArrowLeft", "ArrowUp"].includes(k)) { kbSpace = Math.max(0, kbSpace - 1); e.preventDefault(); }
      else if (k === "Enter" || k === " ") {
        e.preventDefault();
        if (kbPeg < 0) { kbPeg = kbSel; kbSpace = pegs[kbSel].at; }
        else { move(pegs[kbPeg], kbSpace); kbPeg = -1; }
      } else if (k === "Escape") kbPeg = -1;
      else if (k === "u" || k === "U") undo();
      else if (k === "l" || k === "L") leave();
    });
    K.on(undoBtn, "click", undo);
    K.on(leaveBtn, "click", leave);

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) {
        t += dt;
        // the porch guest: after 60 s, if you have been loud, comes in at a random moment
        if (early === null && t >= 60 * speed && noise >= 3) early = t + (12 + rng() * 10) * speed;
        if (climbing >= 0) { climbing += dt / speed; if (climbing >= CLIMB) { safe(); } }
        if (!over && t >= arrival()) {
          if (climbing >= 0 && climbing < CLIMB) caught(early !== null && early < TIME * speed ? GUESTS[1] : GUESTS[0]);
          else if (climbing < 0) caught(early !== null && early < TIME * speed ? GUESTS[1] : GUESTS[0]);
        }
      }
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>Parlour</h2>
      <p>The guests are out on the hike. You never play their counting game: you move their button pegs, and the wrongness you leave is aimed at what you learned about them (read your notes).</p>
      <p>Drag a peg to any space (keys: 1-3, Enter, arrows). Three tampers at most. Watch the doorway: footsteps come in three steps, and the climb back takes four seconds. Press <b>Leave</b> in time.</p>
      <button type="button">Start</button>
      <label><input type="checkbox"> Half speed</label></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => { speed = intro.querySelector("input").checked ? 2 : 1; intro.remove(); started = true; leaveBtn.disabled = false; wrap.focus(); });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

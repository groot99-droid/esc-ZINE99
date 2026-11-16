// The Endless Temple / The Clasps (1D, mechanical puzzle). Style: Clockwork cutaway.
// DESIGN.md section 11, The Clasps, played as three clasps in one sitting, each built differently:
//   g_clasp_c3b  lever bank: five levers; pressing one flips it and its neighbours; all must lie flat.
//   g_clasp_c5   strap fold: six straps; a strap lifts only when no other strap lies across it; then the hasp.
//   g_clasp_c7   gear train: place gears on a 5 x 4 peg board so the knob drives the latch clockwise.
//                To make parity solvable on a square board, two large gears also mesh corner to corner.
// Each clasp opens a book holding a fragment of the past (DESIGN.md section 5, "The past, in slots":
// F3, F4, F5). The fragment texts are the design's own proposals, marked there as replaceable.
// There is no failure (reset is free); the clasps are scored in moves against par. The hint sigil
// glows after 90 seconds on a clasp and shows one correct next move; after another 60 it can be
// pressed again.
// Accepted development, phase 1 (DESIGN.md "Accepted development (2026-11-15)"): sand in the works.
// The sand book leaks onto the same table. Each 20 points of sand_leak blocks one lever pivot,
// buckle or peg until it is brushed out, and brushing is a move (tap the sanded part once to brush
// it, again to work it). Between clasps Elaris may sweep the table: swept sand does not reach the
// next clasp. Art (api.art): the keeper's cutaway plates of the clasps, chapter headings, glyphs.

// Phase 2 (DEEP_DIVE.md section 3, The Clasps): the sitting is a ladder.
//   Teach: one mechanism (the lever bank).
//   Test: compound mechanisms (the strap fold, then the gear train) with sand in the works and warm
//     brass: the gear train's bolt slides only while the cup sits on the cover, and the tea cools a
//     little with every move it sits there.
//   Twist: close one. The black book (g_clasp_c8) has to be shut, not opened: the straps go back down
//     lowest first. The set-piece: three straps are stiff with frost, the candle that melts them is
//     the only light, each melt shortens it, and the last gear is set by its click. If the candle
//     goes out while frost still holds a strap, the sitting is lost.
// Layer links (api.shared): drifts left on the pantry table in Tea Blending are the sand in these
// works; a table swept between clasps puts a spoon of gutter sand in the pantry's ninth jar.
// The collection thread: a stopped clock sits in the twist's picture, unremarked.
// Narration written for the game (not quotations). Fragment texts below are DESIGN.md's (section 5).
const LINES = {
  open: "The temple keeps some books shut. Elaris carries three of them to the reading table, each clasped a different way.",
  lever: "A slim book from the third gallery, its clasp a bank of five brass levers.",
  strap: "A ruling bound in leather: six straps folded across the cover, one over another.",
  gear: "The last book's clasp is a gear train. The knob turns one way; the latch must turn the other way round to open.",
  frag3: "Inside, a folded letter from another reader.",
  frag4: "Inside, the Wardens of the Shelves' ruling.",
  frag5: "Inside, Keeper Maudric's petition.",
  endPar: "Three clasps, three pages of the past, and hardly a wasted move. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.",
  endOver: "Three clasps open at last, the table scattered with brass. Elaris lays the letter, the ruling and the petition side by side, and reads them in order.",
  sand1: "The sand book lies open on the same table, and a little of its sand has got into the works.",
  sandN: "The table was not swept: the sand has drifted into {n} places in the works.",
  sandNone: "The table is swept, and the works are clean.",
  brushed: "<b>Sand in the works.</b> Elaris brushes it out of {what}: a move. Now it will answer.",
  swept: "Swept. The pan goes into the ninth jar in the pantry.",
  endSand: " Sand cost him {n} move{s} with the brush.",
  // phase 2
  linkClean: "Because you left the pantry table swept in Tea Blending, the works are clean.",
  linkSand: "Because {n} of sand {v} left on the pantry table in Tea Blending, sand has got into {m} of the works.",
  linkJar: "The pan goes into the ninth jar: a spoon of gutter sand is waiting in Tea Blending.",
  cupOn: "The cup goes on the cover. The brass under it begins to warm.",
  cupOff: "He lifts the cup off the cover.",
  cupCold: "The tea has gone cold on the cover. He fetches a fresh cup: three moves.",
  boltCold: "<b>The latch turns clockwise</b>, but the bolt is cold brass and will not slide. It moves only while something warm sits on the cover: set the cup there (C).",
  black: "The black book from the unlit shelf, open since he read it. This clasp has to be closed, not opened: the straps go back down, lowest first, and the cold has stiffened three of them.",
  blackHelp: "Tap a strap (A to E) to lay it down, once every strap that lies under it is down. A frosted strap must be melted first (tap it: the candle shortens) and freezes again in three moves. Then set the gear by its click (G) and close the hasp (H).",
  melt: "The candle licks the frost off strap {id}. It will bend for three moves. The candle is shorter: {n} left.",
  refrost: " The frost creeps back over strap {id}.",
  under: "Strap {id} will not lie flat: {ids} must go under it first.",
  laid: "Strap {id} lies flat. {n} to go.",
  allDown: "Every strap is down, and they cover the works. The last gear has to be set by its click (G), then the hasp (H).",
  click: "Click.",
  clack: "A duller click. Something has dropped home.",
  gearEarly: "The gear will not turn while a strap still stands in its way.",
  haspNo: "The hasp will not seat. The gear is not home yet: listen for the duller click.",
  haspEarly: "The hasp will not reach while a strap still stands.",
  closed: "<b>The hasp seats.</b> The black book is shut.",
  blackFound: "The cover is cold under his hand.",
  blackText: "It is closed by someone who knows what is in it. The candle is shorter, and the Lantern Country is as dark as it was.",
  endTwist: "A letter, a ruling and a petition read; and one book shut again with what was left of a candle. Elaris carries the black book back to the unlit shelf.",
  loseCandle: "The candle is out, and the frost still holds strap {id}. In the dark the black book stays open on the table, and the cold comes up out of it.",
  thread: "A clock on the wall behind the table says fourteen past two. It does not say of which day.",
  stopTeach: "One clasp open, one page of the past: the letter. Two more books lie clasped on the table, and a fourth waits on the unlit shelf.",
  stopTest: "Three clasps, three pages of the past: the letter, the ruling and the petition, laid side by side. The black book is still open on the unlit shelf.",
};
const LADDER = ["Teach: one mechanism", "Test: compound mechanisms", "Twist: close one"];
// which parts the sand reaches first, in order (DESIGN.md: one per 20 points of sand_leak)
const JAM_LEVERS = [2, 0, 4], JAM_STRAPS = ["E", "B", "D"], JAM_PEGS = ["2,1", "3,2", "1,1"];
const PLATE = { lever: "clasp-c3b-lever-bank", strap: "clasp-c5-strap-fold", gear: "clasp-c7-gear-train", black: "clasp-c8-black-book" };
const HEADING = { lever: "heading-c3", strap: "heading-c5", gear: "heading-c7", black: "heading-c8" };
const FRAG = {
  F3: "He read the Lantern Country as its narrator for a season, and would not set the cup down. While he stayed, its story could not end, and its lamps burned down one by one. “They are all in the dark now.”",
  F4: "The sentence: to be shelved inside the dark book, reading forever into a world with no light.",
  F5: "“Let him keep them all, since he could not keep one.” Maudric asked for this as he was dying.",
};

// ---- lever bank (c3b) ----
const LEVERS0 = [1, 0, 1, 0, 1];      // three raised; par 3 (press 1, 3, 5 or 2, 3, 4)
// ---- strap fold (c5): centre lines in board units, z = layer order (higher lies on top) ----
const STRAPS = [
  { id: "A", a: [40, 120], b: [560, 120], z: 5, col: "#7a4a2a" },
  { id: "B", a: [40, 310], b: [560, 310], z: 2, col: "#6a3a22" },
  { id: "C", a: [170, 30], b: [170, 410], z: 3, col: "#8a5634" },
  { id: "D", a: [430, 30], b: [430, 410], z: 6, col: "#5e3420" },
  { id: "E", a: [60, 50], b: [540, 390], z: 4, col: "#94603a" },
  { id: "F", a: [540, 50], b: [300, 410], z: 1, col: "#70402a" },
];
function segX(p, q, r, s) {
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  if (!d) return false;
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
  return t > 0 && t < 1 && u > 0 && u < 1;
}
const CROSS = STRAPS.map((s) => STRAPS.filter((o) => o !== s && segX(s.a, s.b, o.a, o.b)).map((o) => o.id));
// ---- the black book (c8): five straps to lay back down, lowest first; three are frosted ----
const BSTR = STRAPS.filter((s) => s.id !== "F");
const BCROSS = Object.fromEntries(BSTR.map((s) => [s.id, BSTR.filter((o) => o !== s && segX(s.a, s.b, o.a, o.b)).map((o) => o.id)]));
const FROST0 = ["B", "E", "D"], CANDLE0 = 5, GEAR_HOME = 4, MELT_MOVES = 3;
// ---- gear train (c7) ----
const COLS = 5, ROWS = 4, SP = 100;
const RAD = { 1: 32, 2: 44, 3: 62 };
const KNOB = { x: 0, y: 1, s: 2 }, LATCH = { x: 4, y: 2, s: 2 };
const TRAY = [1, 1, 2, 2, 3, 3];
const SOLUTION = [{ x: 1, y: 1, s: 1 }, { x: 2, y: 1, s: 3 }, { x: 3, y: 2, s: 3 }];

const STAGES = [
  { key: "lever", name: "The lever bank", scene: "g_clasp_c3b", par: 3, intro: LINES.lever, frag: "F3", found: LINES.frag3,
    help: "Press a lever (tap, or 1 to 5). It flips, and so do its neighbours. Lay all five flat." },
  { key: "strap", name: "The strap fold", scene: "g_clasp_c5", par: 7, intro: LINES.strap, frag: "F4", found: LINES.frag4,
    help: "Lift a strap (tap, or A to F) only when nothing lies across it. Then open the hasp (H)." },
  { key: "gear", name: "The gear train", scene: "g_clasp_c7", par: 5, intro: LINES.gear, frag: "F5", found: LINES.frag5,
    help: "Pick a tray gear (1, 2, 3), then a peg (arrows, Enter). Set the cup on the cover (C): the bolt slides only on warm brass. Turn the knob (T) to test. Side by side, gears turn opposite ways; two large gears also mesh corner to corner." },
  { key: "black", name: "The black book", scene: "g_clasp_c8", par: 13, intro: LINES.black, frag: null, found: LINES.blackFound, help: LINES.blackHelp },
];
const RUNG = [0, 1, 1, 2];            // which rung of the ladder each clasp belongs to
const FIRST_OF = [0, 1, 3];           // the first clasp of each rung

function gearPath(r, rot = 0) {
  const n = Math.max(8, Math.round(r / 5.2)), depth = 8, pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = rot + (2 * Math.PI * i) / n, st = (2 * Math.PI) / n;
    for (const [t, rr] of [[0, r - depth / 2], [0.18, r + depth / 2], [0.5, r + depth / 2], [0.68, r - depth / 2]]) {
      const a = a0 + t * st; pts.push(`${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`);
    }
  }
  return "M" + pts.join(" L") + "Z";
}
const pop = (m) => { let c = 0; while (m) { c += m & 1; m >>= 1; } return c; };
function analyse(gears) {
  const all = [KNOB, LATCH, ...gears];
  const adj = all.map(() => []);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const dx = Math.abs(all[i].x - all[j].x), dy = Math.abs(all[i].y - all[j].y);
    const big = all[i].s === 3 && all[j].s === 3;
    if ((dx + dy === 1 && !big) || (dx === 1 && dy === 1 && big)) { adj[i].push(j); adj[j].push(i); }
  }
  const dir = new Array(all.length).fill(0); dir[0] = 1;
  const st = [0]; let jam = false;
  while (st.length) {
    const i = st.pop();
    for (const j of adj[i]) { if (!dir[j]) { dir[j] = -dir[i]; st.push(j); } else if (dir[j] === dir[i]) jam = true; }
  }
  return { all, adj, dir, jam, latch: dir[1] };
}
function blocked(gears, x, y, s) {
  if ((x === KNOB.x && y === KNOB.y) || (x === LATCH.x && y === LATCH.y)) return "That peg holds a fixed gear.";
  if (s === 3) for (const g of [KNOB, LATCH, ...gears]) if (g.s === 3 && Math.abs(g.x - x) + Math.abs(g.y - y) === 1) return "Two large gears side by side would grind.";
  return null;
}

export default {
  mount(root, api) {
    const P = "endless-temple-clasps-";
    const M = { brass: "#c9973a", brassD: "#8a6224", brassL: "#e8c36a", copper: "#b8643a", copperD: "#7a3f22", steel: "#a9adb2", steelD: "#6d7176", leather: "#3b2216", plate: "#4a3524", verd: "#7fb79c", cream: "#f3ead2", red: "#e0644a" };
    const COLORS = { 1: [M.steel, M.steelD], 2: [M.brass, M.brassD], 3: [M.copper, M.copperD] };
    const rm = api.reducedMotion;
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const pic = (id, cls, alt = "") => (art.has(id) ? `<img class="${P}${cls}" src="${art.url(id)}" alt="${alt}" draggable="false">` : "");
    let raf = 0;
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const thread = api.thread || { found() {}, isFound: () => false };
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:repeating-linear-gradient(0deg,#2e1a10 0 3px,#33201a 3px 6px);color:${M.cream};font-family:'EB Garamond',Georgia,serif;display:flex;flex-direction:column;align-items:center;padding:10px 12px 120px;box-sizing:border-box;font-size:16px}
    .${P}top{display:flex;justify-content:space-between;align-items:center;width:100%;max-width:900px;gap:8px;flex-wrap:wrap}
    .${P}btn{font:inherit;font-size:15px;color:${M.cream};background:${M.plate};border:1.5px solid ${M.brass};border-radius:4px;padding:7px 14px;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#6a4a30;outline:2px solid ${M.brassL};outline-offset:1px}
    .${P}btn:disabled{opacity:.4;cursor:not-allowed}
    .${P}btn[hidden]{display:none}
    .${P}stage{flex:1;min-width:150px;text-align:center}
    .${P}stage b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:20px;color:${M.brassL}}
    .${P}stage span{font-size:14px;font-variant:small-caps;letter-spacing:.12em;opacity:.9}
    .${P}moves{font-family:ui-monospace,Menlo,monospace;font-size:15px;border:1.5px solid ${M.brass};padding:7px 12px;background:#1d120b;color:${M.brassL};text-align:right;line-height:1.15}
    .${P}moves small{display:block;font-size:12px;color:${M.cream};opacity:.8}
    .${P}moves.${P}over{color:${M.red}}
    .${P}top,.${P}beat,.${P}msg{flex:none}
    .${P}beat{max-width:900px;width:100%;margin:8px 0 2px;font-style:italic;font-size:16px;color:#e7d6b3;text-align:center;min-height:1.4em}
    .${P}svg{flex:none;width:100%;max-width:900px;max-height:calc(100vh - 300px);min-height:240px;height:auto;touch-action:manipulation;user-select:none}
    .${P}msg{max-width:900px;text-align:center;min-height:2.8em;margin:4px 0;font-size:16px;line-height:1.35}
    .${P}msg b{color:${M.brassL}}
    .${P}msg.${P}bad{color:#ffb39f}
    .${P}frag{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,4,.6);z-index:4;padding:16px}
    .${P}frag div{max-width:440px;background:#efe3c4;color:#2f1d10;padding:20px 22px;font-size:17px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.6);transform:rotate(-1deg);border:1px solid #8a6224}
    .${P}frag small{display:block;font-variant:small-caps;letter-spacing:.12em;font-size:14px;color:#7a5a2a;margin-bottom:6px}
    .${P}frag p{margin:0 0 12px}
    .${P}frag img.${P}plateimg{display:block;width:100%;height:auto;margin:0 0 8px;border-radius:2px}
    .${P}frag img.${P}chap{display:block;width:100%;height:auto;margin:0 0 8px;border-radius:2px}
    .${P}frag .${P}btn{margin:0 6px 6px 0;color:${M.cream}}
    .${P}thumb{flex:none;height:46px;width:auto;border:1.5px solid ${M.brass};border-radius:3px;display:block}
    .${P}stagewrap{flex:1;min-width:150px;display:flex;gap:10px;align-items:center;justify-content:center}
    .${P}btn img{width:26px;height:26px;vertical-align:middle;margin:-4px 6px -2px -4px}
    .${P}strip{display:flex;gap:6px;margin:0 0 10px}
    .${P}strip img{flex:1;min-width:0;width:33%;height:auto;border:1px solid ${M.brassD};border-radius:3px}
    .${P}endc{position:absolute;inset:0;z-index:6;display:grid;place-items:center;background:rgba(15,8,4,.82);padding:16px 16px 150px;box-sizing:border-box;overflow:auto}
    .${P}endc figure{margin:0;max-width:520px;text-align:center;color:${M.cream}}
    .${P}endc img{width:100%;height:auto;border:2px solid ${M.brass};border-radius:4px}
    .${P}endc figcaption{font-family:'IM Fell English',Georgia,serif;font-size:22px;margin-top:8px;color:${M.brassL}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,8,4,.75);z-index:5;padding:16px;overflow:auto}
    .${P}plate{max-width:440px;padding:20px 22px;border:2px solid ${M.brass};background:linear-gradient(160deg,#5a4330,#3e2c1d);border-radius:8px;position:relative;box-shadow:inset 0 0 0 5px #3e2c1d,inset 0 0 0 6px ${M.brassD},0 18px 40px rgba(0,0,0,.6)}
    .${P}plate::before,.${P}plate::after{content:"";position:absolute;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,${M.brassL},${M.brassD});top:10px;left:10px;box-shadow:calc(100% + 0px) 0 0 0 transparent}
    .${P}plate::after{left:auto;right:10px}
    .${P}plate h2{margin:0 0 4px;font-family:'IM Fell English',Georgia,serif;font-weight:400;color:${M.brassL};font-size:28px;text-align:center}
    .${P}plate .${P}goal{text-align:center;margin:0 0 12px;font-size:17px}
    .${P}plate dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 14px;font-size:16px}
    .${P}plate dt{font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#1d120b;background:${M.brass};padding:1px 8px;border-radius:3px;align-self:start;text-align:center}
    .${P}plate dd{margin:0}
    .${P}plate .${P}go{display:block;margin:0 auto}
    .${P}link{max-width:900px;width:100%;margin:2px 0;font-size:15px;font-style:italic;color:${M.brassL};text-align:center;flex:none}
    .${P}link[hidden]{display:none}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 12px}
    .${P}start button{font:inherit;font-size:14px;color:${M.cream};background:transparent;border:1.5px solid ${M.brass};border-radius:4px;padding:5px 10px;cursor:pointer;min-height:38px}
    .${P}start button[aria-pressed=true]{background:${M.brass};color:#1d120b}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}top"><button type="button" class="${P}btn ${P}reset" title="Reset (R)">↺ Reset lever</button>
        <div class="${P}stagewrap"><img class="${P}thumb" alt="" hidden><div class="${P}stage"><b></b><span></span></div></div>
        <button type="button" class="${P}btn ${P}cup" title="The cup on the cover (C)" hidden>Cup on the cover</button>
        <button type="button" class="${P}btn ${P}turn" title="Turn the knob (T)" hidden>${pic("glyph-wind", "g")}Turn the knob ↻</button>
        <span class="${P}moves">MOVES 00<small>par 3</small></span></div>
      <p class="${P}beat" aria-live="polite"></p><p class="${P}link" hidden></p>
      <svg class="${P}svg" viewBox="-40 -30 660 600" role="application" aria-label="The clasp mechanism"></svg>
      <p class="${P}msg" aria-live="polite"></p>`;
    root.append(css, el);
    const svg = el.querySelector("svg");
    const msg = el.querySelector("." + P + "msg");
    const beat = el.querySelector("." + P + "beat");
    const turnBtn = el.querySelector("." + P + "turn");
    const ox = 60, oy = 40;
    const px = (x) => ox + x * SP, py = (y) => oy + y * SP;

    let si = 0, stage = STAGES[0], over = false, busy = false, moves = 0, totalMoves = 0;
    let stageStart = performance.now(), hintLevel = 0, lastHintAt = performance.now(), flash = null;
    // lever state
    let levers = LEVERS0.slice(), levCur = 0, changed = [];
    // strap state
    let lifted = new Set(), blockedBy = null, shake = null, hasp = false, strapCur = 0;
    // gear state
    let gears = [], tray = TRAY.slice(), sel = null, turning = false, cursor = { x: 1, y: 1 }, rot = 0, spin = null, t0 = performance.now();
    // sand in the works
    let leak = 20, jam = new Set(), jam0 = 0, brushMoves = 0;
    // layer link: the drifts left on the pantry table in Tea Blending are the sand in these works
    let linkNote = "";
    const table = shared.get("tea_table", null);
    if (shared.get("tea_played", false) && table && typeof table.drifts === "number") {
      const d = Math.max(0, Math.min(3, table.drifts | 0));
      leak = d * 20;
      linkNote = d === 0 ? LINES.linkClean : LINES.linkSand.replace("{n}", ["", "one drift", "two drifts", "three drifts"][d]).replace("{v}", d === 1 ? "was" : "were").replace("{m}", ["", "one", "two", "three"][d]);
    }
    // warm brass (the gear train)
    let cupOn = false, warmth = 0;
    // the black book
    let bDown = new Set(), bFrost = new Set(FROST0), bMelt = {}, candle = CANDLE0, bGear = 1, bHeard = "", lost = false;
    const linkEl = el.querySelector("." + P + "link");
    const cupBtn = el.querySelector("." + P + "cup");
    const par = () => stage.par + jam0;
    function brush(key, what) {
      jam.delete(key); bump(); brushMoves++;
      say(LINES.brushed.replace("{what}", what));
      draw();
    }
    const grit = (x, y, r = 16) => `<g pointer-events="none">${Array.from({ length: 14 }, (_, k) => `<circle cx="${(x + Math.cos(k * 2.4) * r * (0.25 + (k % 5) / 6)).toFixed(1)}" cy="${(y + Math.sin(k * 2.4) * r * (0.25 + (k % 4) / 5)).toFixed(1)}" r="${2 + (k % 3)}" fill="${k % 2 ? "#e6dcc0" : "#c9b98c"}" stroke="#6b5a34" stroke-width=".6"/>`).join("")}</g>`;

    function say(t, bad) { msg.innerHTML = t; msg.classList.toggle(P + "bad", !!bad); }
    const sigilLit = () => !over && !busy && performance.now() - lastHintAt > (hintLevel === 0 ? 90000 : 60000);

    function setStage(i) {
      si = i; stage = STAGES[i]; moves = 0; over = false; busy = false; hintLevel = 0; lastHintAt = performance.now(); stageStart = performance.now();
      levers = LEVERS0.slice(); changed = []; lifted = new Set(); hasp = false; blockedBy = null; gears = []; tray = TRAY.slice(); sel = null;
      cupOn = false; warmth = 0; cupBtn.hidden = stage.key !== "gear"; cupBtn.textContent = "Cup on the cover";
      bDown = new Set(); bFrost = new Set(FROST0); bMelt = {}; candle = CANDLE0; bGear = 1; bHeard = ""; strapCur = 0;
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, RUNG[i]));
      linkEl.hidden = !linkNote || i > 0 && !linkShown; linkEl.textContent = linkNote; linkShown = false;
      jam0 = stage.key === "black" ? 0 : Math.max(0, Math.min(3, Math.floor(leak / 20)));
      jam = new Set((stage.key === "lever" ? JAM_LEVERS.map((k) => "l" + k) : stage.key === "strap" ? JAM_STRAPS.map((k) => "s" + k) : JAM_PEGS.map((k) => "p" + k)).slice(0, jam0));
      el.querySelector("." + P + "stage b").textContent = stage.name;
      el.querySelector("." + P + "stage span").textContent = `${LADDER[RUNG[i]]} · clasp ${i + 1} of ${STAGES.length}`;
      const th = el.querySelector("." + P + "thumb");
      if (art.has(PLATE[stage.key])) { th.src = art.url(PLATE[stage.key]); th.hidden = false; } else th.hidden = true;
      turnBtn.hidden = stage.key !== "gear";
      beat.textContent = stage.key === "black" ? stage.intro : stage.intro + " " + (jam0 === 0 ? LINES.sandNone : jam0 === 1 ? LINES.sand1 : LINES.sandN.replace("{n}", ["", "one", "two", "three"][jam0]));
      say(stage.help);
      draw();
    }
    let linkShown = true, startBoard = 0;
    function bump() {
      moves++; totalMoves++;
      if (stage.key === "gear" && cupOn && warmth > 0) { warmth--; if (warmth === 0) cupBtn.textContent = "Fetch a fresh cup"; }
    }
    // warm brass: the cup on the cover
    function toggleCup() {
      if (over || busy || turning || stage.key !== "gear") return;
      if (cupOn && warmth <= 0) { moves += 3; totalMoves += 3; warmth = 6; say(LINES.cupCold); }
      else if (cupOn) { cupOn = false; say(LINES.cupOff); }
      else { cupOn = true; if (warmth <= 0) warmth = 6; moves++; totalMoves++; say(LINES.cupOn); }
      cupBtn.textContent = cupOn ? (warmth > 0 ? "Lift the cup" : "Fetch a fresh cup") : "Cup on the cover";
      draw();
    }
    // ---- the black book: lay the straps back down, lowest first --------------------------------
    const bCanLay = (st) => BCROSS[st.id].every((id) => { const o = BSTR.find((x) => x.id === id); return o.z > st.z || bDown.has(id); });
    function bMove(skip) {
      bump();
      let extra = "";
      for (const id of Object.keys(bMelt)) {
        if (id === skip) continue;
        if (--bMelt[id] <= 0) { delete bMelt[id]; if (!bDown.has(id)) { bFrost.add(id); extra += LINES.refrost.replace("{id}", id); } }
      }
      return extra;
    }
    function bCheckLost() {
      if (candle > 0 || !bFrost.size || over) return false;
      over = true; busy = true; lost = true;
      const id = [...bFrost][0];
      say(LINES.loseCandle.replace("{id}", id), true); draw();
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: LINES.loseCandle.replace("{id}", id) + ` (${bDown.size} of ${BSTR.length} straps were down.)` }), rm ? 200 : 1200));
      return true;
    }
    function bStrap(id) {
      if (over || busy) return;
      const st = BSTR.find((x) => x.id === id); if (!st) return;
      strapCur = BSTR.indexOf(st);
      if (bDown.has(id)) { say(`Strap ${id} is already down.`); draw(); return; }
      if (bFrost.has(id)) {
        bFrost.delete(id); candle--; const extra = bMove(id); bMelt[id] = MELT_MOVES;
        say(LINES.melt.replace("{id}", id).replace("{n}", candle) + extra); draw(); bCheckLost(); return;
      }
      if (!bCanLay(st)) {
        const ids = BCROSS[id].filter((o) => !bDown.has(o) && BSTR.find((x) => x.id === o).z < st.z);
        blockedBy = { ids, until: performance.now() + 1200 }; shake = { id, until: performance.now() + (rm ? 0 : 400) };
        const extra = bMove();
        say(LINES.under.replace("{id}", id).replace("{ids}", ids.join(" and ")) + extra, true); draw(); bCheckLost(); return;
      }
      bDown.add(id); delete bMelt[id];
      const extra = bMove();
      say((bDown.size === BSTR.length ? LINES.allDown : LINES.laid.replace("{id}", id).replace("{n}", BSTR.length - bDown.size)) + extra);
      draw(); bCheckLost();
    }
    function bTurnGear() {
      if (over || busy) return;
      if (bDown.size < BSTR.length) { say(LINES.gearEarly, true); draw(); return; }
      bGear = (bGear + 1) % 6; bump();
      bHeard = bGear === GEAR_HOME ? "clack" : "click";
      say(bGear === GEAR_HOME ? LINES.clack : LINES.click); draw();
    }
    function bHasp() {
      if (over || busy) return;
      if (bDown.size < BSTR.length) { const extra = bMove(); say(LINES.haspEarly + extra, true); draw(); bCheckLost(); return; }
      bump();
      if (bGear !== GEAR_HOME) { say(LINES.haspNo, true); draw(); return; }
      hasp = true; say(LINES.closed); solve(); draw();
    }
    function drawBlack() {
      const h = hintLevel > 0 && !over ? hint() : null;
      const now = performance.now();
      let s = `<rect x="0" y="10" width="600" height="420" rx="8" fill="#0e1622" stroke="#05080d" stroke-width="3"/><rect x="0" y="10" width="600" height="420" rx="8" fill="url(#${P}hide)"/>
        <text x="300" y="420" text-anchor="middle" font-size="18" fill="#c9ced6">close it: lowest strap first</text>`;
      const all = bDown.size === BSTR.length;
      // the gear, set by its click, and the hasp
      s += `<g data-bgear="1" style="cursor:pointer" role="button" aria-label="The last gear" transform="translate(392 220)"><circle r="40" fill="transparent"/><g transform="rotate(${bGear * 60})"><path d="${gearPath(26)}" fill="${all ? "#3a3f48" : M.steel}" stroke="${M.steelD}" stroke-width="2"/></g><circle r="6" fill="#05080d"/>
        ${bHeard ? `<text y="-40" text-anchor="middle" font-size="18" fill="${M.cream}">${bHeard === "clack" ? "clack" : "click"}</text>` : ""}</g>
        <g data-bhasp="1" style="cursor:pointer" role="button" aria-label="The hasp"><rect x="262" y="190" width="76" height="60" rx="10" fill="${hasp ? M.verd : M.brassD}" stroke="${M.brass}" stroke-width="3"/>
        <circle cx="300" cy="220" r="12" fill="#05080d"/><rect x="296" y="220" width="8" height="18" fill="#05080d"/>${all && !hasp ? `<rect x="254" y="182" width="92" height="76" rx="14" fill="none" stroke="#ffe08a" stroke-width="2" stroke-dasharray="4 5"/>` : ""}</g>`;
      for (const st of BSTR.slice().sort((a, b) => a.z - b.z)) {
        const i = BSTR.indexOf(st), down = bDown.has(st.id), fr = bFrost.has(st.id), ml = bMelt[st.id];
        const sh = shake && shake.id === st.id && now < shake.until ? Math.sin(now / 25) * 5 : 0;
        const blk = blockedBy && blockedBy.ids.includes(st.id) && now < blockedBy.until;
        const ang = Math.atan2(st.b[1] - st.a[1], st.b[0] - st.a[0]), len = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]);
        const mx = (st.a[0] + st.b[0]) / 2, my = (st.a[1] + st.b[1]) / 2, hot = i === strapCur && !over;
        s += `<g data-strap="${st.id}" style="cursor:pointer" role="button" aria-label="Strap ${st.id}${down ? ", down" : fr ? ", standing, frosted" : ", standing"}" transform="translate(${mx + sh} ${my}) rotate(${(ang * 180) / Math.PI})" ${down ? 'pointer-events="none"' : ""}>
          <rect x="${-len / 2}" y="-24" width="${len}" height="48" fill="transparent"/>
          <rect x="${-len / 2}" y="-18" width="${len}" height="36" rx="4" fill="${down ? "#2b2f3a" : "none"}" fill-opacity="${down ? 1 : 0}" stroke="${blk ? M.red : down ? "#05080d" : fr ? "#dfe8f2" : "#8a93a3"}" stroke-width="${blk ? 4 : 2}" ${down ? "" : `stroke-dasharray="${fr ? "3 4" : "9 7"}"`}/>
          ${down ? `<line x1="${-len / 2 + 8}" y1="-11" x2="${len / 2 - 8}" y2="-11" stroke="#7d8696" stroke-dasharray="7 6" stroke-width="1.5"/><line x1="${-len / 2 + 8}" y1="11" x2="${len / 2 - 8}" y2="11" stroke="#7d8696" stroke-dasharray="7 6" stroke-width="1.5"/>` : ""}
          ${fr ? Array.from({ length: 16 }, (_, k) => `<path d="M${(-len / 2 + 60 + k * (len - 90) / 16).toFixed(0)} ${(k % 3 - 1) * 9} l4 -4 m-4 4 l-4 -4 m4 4 l0 6" stroke="#eef4fb" stroke-width="1.6" fill="none"/>`).join("") : ""}
          ${hot ? `<rect x="${-len / 2 - 4}" y="-24" width="${len + 8}" height="48" fill="none" stroke="${M.cream}" stroke-dasharray="6 5"/>` : ""}
          ${h && h.strap === st.id ? `<rect x="${-len / 2 - 6}" y="-27" width="${len + 12}" height="54" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>` : ""}
          <g transform="translate(${-len / 2 + 34} 0) rotate(${(-ang * 180) / Math.PI})"><circle r="15" fill="#05080d" stroke="${down ? M.steelD : M.brass}" stroke-width="2"/><text y="7" text-anchor="middle" font-size="20" fill="${M.brassL}">${st.id}</text>
          ${fr ? `<text x="20" y="-18" font-size="16" fill="#eef4fb">frost</text>` : ml ? `<text x="20" y="-18" font-size="16" fill="${M.brassL}">melted: ${ml}</text>` : down ? `<text x="20" y="-18" font-size="16" fill="#9aa3b3">down</text>` : ""}</g></g>`;
      }
      if (h && h.hasp) s += `<rect x="248" y="176" width="104" height="88" rx="16" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>`;
      if (h && h.gear) s += `<circle cx="392" cy="220" r="40" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>`;
      // the candle is the light: the board darkens as it shortens
      const dim = [0.62, 0.5, 0.38, 0.26, 0.13, 0][Math.max(0, Math.min(5, candle))];
      s += `<rect x="-30" y="-22" width="644" height="500" fill="#000" opacity="${dim}" pointer-events="none"/>`;
      // the table edge below the book: the candle, and what else is on the wall behind it
      const ch = 12 + candle * 11;
      s += `<g transform="translate(40 560)" pointer-events="none"><ellipse cx="0" cy="0" rx="26" ry="7" fill="${M.brassD}"/><rect x="-9" y="${-ch}" width="18" height="${ch}" fill="#efe6cf" stroke="#8a7a55"/>
        ${candle > 0 ? `<path d="M0 ${-ch - 22} q9 12 0 20 q-9 -8 0 -20Z" fill="#f0b23a" stroke="#a8641e"/><circle cx="0" cy="${-ch - 8}" r="${26 + candle * 5}" fill="#f0b23a" opacity=".12"/>` : `<path d="M0 ${-ch} v-8" stroke="#333" stroke-width="2"/>`}</g>
        <text x="78" y="548" font-size="18" fill="${M.cream}">candle: ${candle} of ${CANDLE0}</text>`;
      if (art.has("thread-guest")) s += `<g data-thread="1" role="img" aria-label="A clock on the wall"><image href="${art.url("thread-guest")}" x="436" y="482" width="84" height="84" preserveAspectRatio="xMidYMid slice"/><rect x="436" y="482" width="84" height="84" fill="none" stroke="${M.brassD}" stroke-width="1.5"/></g>`;
      return s;
    }

    // ---- hint for the current clasp ----
    function hint() {
      if (stage.key === "lever") {
        // press any raised lever whose press reduces the raised count most, or the middle
        // the smallest set of presses that lays every lever flat (brute force over 32 sets)
        const sets = Array.from({ length: 31 }, (_, k) => k + 1).sort((a, b) => pop(a) - pop(b));
        for (const m of sets) {
          const s = levers.slice();
          for (let k = 0; k < 5; k++) if (m >> k & 1) for (const j of [k - 1, k, k + 1]) if (j >= 0 && j < 5) s[j] ^= 1;
          if (s.every((v) => !v)) { for (let k = 0; k < 5; k++) if (m >> k & 1) return { lever: k }; }
        }
        return null;
      }
      if (stage.key === "strap") {
        const s = STRAPS.find((s) => !lifted.has(s.id) && canLift(s));
        return s ? { strap: s.id } : { hasp: true };
      }
      if (stage.key === "black") {
        const s = BSTR.slice().sort((a, b) => a.z - b.z).find((s) => !bDown.has(s.id));
        return s ? { strap: s.id } : bGear !== GEAR_HOME ? { gear: true } : { hasp: true };
      }
      for (const g of gears) if (!SOLUTION.some((s) => s.x === g.x && s.y === g.y && s.s === g.s)) return { remove: g };
      const next = SOLUTION.find((s) => !gears.some((g) => g.x === s.x && g.y === s.y));
      return next ? { place: next } : !cupOn || warmth <= 0 ? { cup: true } : { turn: true };
    }

    // ---- drawing ----
    function frame() {
      return `<defs><pattern id="${P}grain" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="rgba(0,0,0,.18)" stroke-width="1"/></pattern>
          <pattern id="${P}hide" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="rgba(0,0,0,.22)"/><circle cx="6" cy="7" r=".7" fill="rgba(255,220,180,.08)"/></pattern>
          <marker id="${P}ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="${M.verd}"/></marker></defs>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="${M.leather}" stroke="#1a0d07" stroke-width="3"/>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="url(#${P}hide)"/>
        <path d="M-30 -20 L600 -24 L612 470 L-34 476 Z" fill="none" stroke="${M.brass}" stroke-width="1.2" stroke-dasharray="6 5" transform="scale(.985) translate(4 4)"/>`;
    }
    function sigil() {
      const lit = sigilLit();
      return `<g data-hint="1" style="cursor:pointer" transform="translate(568 438)" role="button" aria-label="Hint sigil"><circle r="28" fill="${lit ? "#e8c35a" : "#3a2a1a"}" stroke="${M.brass}" stroke-width="2"/>
        <path d="M0 -17 L4 -4 L17 0 L4 4 L0 17 L-4 4 L-17 0 L-4 -4Z" fill="${lit ? "#fff6d0" : M.brass}"/>
        ${lit && !rm ? `<circle r="28" fill="none" stroke="#ffe08a" stroke-width="3"><animate attributeName="r" values="28;40;28" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>` : ""}</g>
        <text x="568" y="488" text-anchor="middle" font-size="18" fill="${M.cream}" opacity=".85">hint</text>`;
    }
    function drawLevers() {
      const h = hintLevel > 0 && !over ? hint() : null;
      let s = `<rect x="20" y="40" width="560" height="380" rx="14" fill="${M.plate}" stroke="${M.brassD}" stroke-width="3"/>
        <rect x="20" y="40" width="560" height="380" rx="14" fill="url(#${P}grain)"/>
        <rect x="60" y="244" width="480" height="12" rx="6" fill="${M.brassD}"/><text x="40" y="200" font-size="18" fill="${M.cream}" opacity=".7" text-anchor="middle" transform="rotate(-90 40 200)">raised</text><text x="40" y="310" font-size="18" fill="${M.cream}" opacity=".7" text-anchor="middle" transform="rotate(-90 40 310)">flat</text>
        <text x="300" y="90" text-anchor="middle" font-size="22" fill="${M.cream}">lay all five flat</text>`;
      levers.forEach((up, i) => {
        const x = 110 + i * 95, y = 250;
        const ang = up ? 0 : 180;
        const hot = i === levCur && !over;
        const ch = changed.includes(i) && flash && performance.now() < flash;
        s += `<g data-lever="${i}" style="cursor:pointer" role="button" aria-label="Lever ${i + 1}, ${up ? "raised" : "flat"}">
          <rect x="${x - 44}" y="130" width="88" height="270" fill="transparent"/>
          <g transform="translate(${x} ${y}) rotate(${ang})">
            <rect x="-8" y="-100" width="16" height="100" rx="5" fill="${up ? M.copper : M.brass}" stroke="${up ? M.copperD : M.brassD}" stroke-width="2"/>
            <circle cx="0" cy="-100" r="16" fill="${up ? M.copper : M.brassL}" stroke="${up ? M.copperD : M.brassD}" stroke-width="2"/>
          </g>
          <circle cx="${x}" cy="${y}" r="13" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/>
          ${ch ? `<circle cx="${x}" cy="${y}" r="30" fill="none" stroke="${M.brassL}" stroke-width="3" opacity=".8"/>` : ""}
          ${hot ? `<rect x="${x - 42}" y="132" width="84" height="266" fill="none" stroke="${M.cream}" stroke-dasharray="5 5" opacity=".7"/>` : ""}
          ${h && h.lever === i ? `<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="8 6"/>` : ""}
          ${jam.has("l" + i) ? grit(x, y, 26) + `<text x="${x}" y="${y - 34}" text-anchor="middle" font-size="18" fill="#e6dcc0">sand</text>` : ""}
          <text x="${x}" y="384" text-anchor="middle" font-size="22" fill="${M.cream}">${i + 1}</text>
          <text x="${x}" y="408" text-anchor="middle" font-size="18" fill="${up ? "#ffb39f" : M.verd}">${up ? "raised" : "flat"}</text></g>`;
      });
      const open = over ? 90 : 0;
      s += `<rect x="${250 + open}" y="430" width="100" height="34" rx="5" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/><text x="${300 + open}" y="454" text-anchor="middle" font-size="18" fill="#222">CATCH</text>`;
      return s;
    }
    function canLift(st) { return !STRAPS.some((o) => !lifted.has(o.id) && o.z > st.z && CROSS[STRAPS.indexOf(st)].includes(o.id)); }
    function drawStraps() {
      const h = hintLevel > 0 && !over ? hint() : null;
      const now = performance.now();
      let s = `<rect x="0" y="10" width="600" height="420" rx="8" fill="#5a3826" stroke="#2a160c" stroke-width="3"/><rect x="0" y="10" width="600" height="420" rx="8" fill="url(#${P}hide)"/>`;
      // the hasp in the middle
      const all = lifted.size === STRAPS.length;
      s += `<g data-hasp="1" style="cursor:${all ? "pointer" : "default"}" role="button" aria-label="The hasp"><rect x="262" y="190" width="76" height="60" rx="10" fill="${hasp ? M.verd : M.brass}" stroke="${M.brassD}" stroke-width="3"/>
        <circle cx="300" cy="220" r="12" fill="#1d120b"/><rect x="296" y="220" width="8" height="18" fill="#1d120b"/>
        ${all && !hasp ? `<rect x="254" y="182" width="92" height="76" rx="14" fill="none" stroke="#ffe08a" stroke-width="3"/>` : ""}</g>`;
      const order = STRAPS.slice().sort((a, b) => a.z - b.z);
      for (const st of order) {
        const i = STRAPS.indexOf(st);
        const up = lifted.has(st.id);
        const sh = shake && shake.id === st.id && now < shake.until ? Math.sin(now / 25) * 5 : 0;
        const blk = blockedBy && blockedBy.ids.includes(st.id) && now < blockedBy.until;
        const ang = Math.atan2(st.b[1] - st.a[1], st.b[0] - st.a[0]);
        const len = Math.hypot(st.b[0] - st.a[0], st.b[1] - st.a[1]);
        const mx = (st.a[0] + st.b[0]) / 2, my = (st.a[1] + st.b[1]) / 2;
        const hot = i === strapCur && !over;
        s += `<g data-strap="${st.id}" style="cursor:pointer" role="button" aria-label="Strap ${st.id}${up ? ", lifted" : ""}" transform="translate(${mx + sh} ${my}) rotate(${(ang * 180) / Math.PI})" opacity="${up ? 0.22 : 1}" ${up ? 'pointer-events="none"' : ""}>
          <rect x="${-len / 2}" y="-24" width="${len}" height="48" fill="transparent"/>
          <rect x="${-len / 2}" y="-18" width="${len}" height="36" rx="4" fill="${st.col}" stroke="${blk ? M.red : "#2a160c"}" stroke-width="${blk ? 4 : 2}"/>
          <line x1="${-len / 2 + 8}" y1="-11" x2="${len / 2 - 8}" y2="-11" stroke="#d9b98a" stroke-dasharray="7 6" stroke-width="1.5" opacity=".8"/>
          <line x1="${-len / 2 + 8}" y1="11" x2="${len / 2 - 8}" y2="11" stroke="#d9b98a" stroke-dasharray="7 6" stroke-width="1.5" opacity=".8"/>
          <rect x="${len / 2 - 30}" y="-22" width="24" height="44" rx="3" fill="none" stroke="${M.brass}" stroke-width="4"/>
          ${hot ? `<rect x="${-len / 2 - 4}" y="-24" width="${len + 8}" height="48" fill="none" stroke="${M.cream}" stroke-dasharray="6 5"/>` : ""}
          ${h && h.strap === st.id ? `<rect x="${-len / 2 - 6}" y="-27" width="${len + 12}" height="54" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>` : ""}
          ${jam.has("s" + st.id) && !up ? grit(len / 2 - 18, 0, 22) : ""}
          <g transform="translate(${-len / 2 + 34} 0) rotate(${(-ang * 180) / Math.PI})"><circle r="15" fill="#1d120b" stroke="${M.brass}" stroke-width="2"/><text y="7" text-anchor="middle" font-size="20" fill="${M.brassL}">${st.id}</text></g></g>`;
      }
      if (h && h.hasp) s += `<rect x="248" y="176" width="104" height="88" rx="16" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="10 6"/>`;
      return s;
    }
    function drawGears() {
      const now = performance.now();
      const A = analyse(gears);
      const spinning = spin && now < spin.until;
      const ang = (i) => (spinning && A.dir[i] && !spin.jam ? A.dir[i] * rot * (2 / A.all[i].s) : (spinning && spin.jam && !rm ? Math.sin(now / 30) * 0.03 : 0));
      let s = `<rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="${M.plate}" stroke="${M.brassD}" stroke-width="3"/>
        <rect x="${ox - 60}" y="${oy - 55}" width="${(COLS - 1) * SP + 120}" height="${(ROWS - 1) * SP + 110}" rx="10" fill="url(#${P}grain)"/>`;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const hov = cursor.x === x && cursor.y === y;
        s += `<circle data-peg="${x},${y}" cx="${px(x)}" cy="${py(y)}" r="30" fill="${hov && sel != null ? "rgba(232,195,90,.18)" : "transparent"}" style="cursor:pointer"/>
              <circle cx="${px(x)}" cy="${py(y)}" r="6" fill="#d8d2c4" stroke="#1d120b" pointer-events="none"/>${jam.has(`p${x},${y}`) ? grit(px(x), py(y), 20) : ""}`;
      }
      const boltOpen = over ? 70 : 0;
      s += `<rect x="${px(3) + 10 + boltOpen}" y="${py(2) + 44}" width="${SP + 40}" height="12" fill="${M.brass}" stroke="${M.brassD}"/>
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${px(3) + 14 + boltOpen + i * 11}" y="${py(2) + 38}" width="6" height="6" fill="${M.brass}"/>`).join("")}
        <rect x="${px(4) + 64 + boltOpen}" y="${py(2) + 24}" width="64" height="48" rx="4" fill="${M.steel}" stroke="${M.steelD}" stroke-width="2"/>
        <text x="${px(4) + 96 + boltOpen}" y="${py(2) + 55}" font-size="18" text-anchor="middle" fill="#222">BOLT</text>
        <path d="M${px(4) + 36} ${py(2) - 90} h40" stroke="${M.verd}" stroke-width="4" marker-end="url(#${P}ah)"/>
        <text x="${px(4) - 4}" y="${py(2) - 104}" font-size="20" text-anchor="start" fill="${M.verd}">needs ↻</text>`;
      for (let i = 0; i < A.all.length; i++) for (const j of A.adj[i]) if (j > i) {
        const a = A.all[i], b = A.all[j];
        s += `<circle cx="${(px(a.x) + px(b.x)) / 2}" cy="${(py(a.y) + py(b.y)) / 2}" r="5" fill="${A.jam ? M.red : M.verd}" pointer-events="none"/>`;
      }
      A.all.forEach((g, i) => {
        const [c, d] = i === 0 ? [M.brass, M.brassD] : i === 1 ? [M.steel, M.steelD] : COLORS[g.s];
        const r = RAD[g.s];
        const fixed = i < 2;
        s += `<g transform="translate(${px(g.x)} ${py(g.y)})" ${fixed ? "" : `data-gear="${i - 2}" style="cursor:pointer"`}>
          <g transform="rotate(${(ang(i) * 180) / Math.PI})">
            <path d="${gearPath(r)}" fill="${c}" stroke="${d}" stroke-width="2"/>
            <circle r="${r * 0.62}" fill="none" stroke="${d}" stroke-width="2"/>
            ${[0, 1, 2, 3].map((k) => `<circle cx="${(r * 0.38 * Math.cos((k * Math.PI) / 2)).toFixed(1)}" cy="${(r * 0.38 * Math.sin((k * Math.PI) / 2)).toFixed(1)}" r="${r * 0.12}" fill="${d}"/>`).join("")}
          </g><circle r="7" fill="#1d120b" stroke="${M.cream}" stroke-width="1.5"/></g>`;
        if (A.dir[i] && !A.jam && (spinning || !fixed || i === 1)) {
          const cw = A.dir[i] === 1, rr = r + 14, a0 = cw ? -2.4 : -0.6, a1 = cw ? -0.6 : -2.4;
          const col = i === 1 ? (cw ? M.verd : M.red) : M.verd;
          s += `<path d="M${(px(g.x) + rr * Math.cos(a0)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a0)).toFixed(1)} A${rr} ${rr} 0 0 ${cw ? 1 : 0} ${(px(g.x) + rr * Math.cos(a1)).toFixed(1)} ${(py(g.y) + rr * Math.sin(a1)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="4" opacity=".9" pointer-events="none" marker-end="url(#${P}ah)"/>`;
        }
      });
      const ka = spinning ? rot * 2 / KNOB.s : 0;
      s += `<g transform="translate(${px(0)} ${py(1)}) rotate(${(ka * 180) / Math.PI})" pointer-events="none"><rect x="-4" y="-4" width="52" height="8" rx="3" fill="${M.steel}"/><circle cx="50" r="9" fill="#5a2f1c"/></g>
        <text x="${px(0)}" y="${py(1) + 78}" text-anchor="middle" font-size="20" fill="${M.cream}">knob ↻</text>
        <text x="${px(4)}" y="${py(2) - 60}" text-anchor="middle" font-size="20" fill="${M.cream}">latch</text>`;
      if (!over) s += `<rect x="${px(cursor.x) - 30}" y="${py(cursor.y) - 30}" width="60" height="60" fill="none" stroke="${M.cream}" stroke-dasharray="5 5" opacity=".75" pointer-events="none"/>`;
      const h = hintLevel > 0 && !over ? hint() : null;
      // warm brass: the cup on the cover, above the bolt; its steam is how warm it still is
      s += `<g data-cup="1" style="cursor:pointer" role="button" aria-label="The cup, ${cupOn ? "on the cover" : "off the cover"}" transform="translate(${px(4) + 96} ${py(0) + 20})"><circle r="40" fill="transparent"/>
        ${cupOn ? `<circle r="30" fill="#efe6cf" stroke="${M.brassD}" stroke-width="3"/><circle r="21" fill="${warmth > 0 ? "#9a6a2c" : "#5c5346"}"/><path d="M28 -6 q16 6 0 14" fill="none" stroke="#efe6cf" stroke-width="6"/>
          ${Array.from({ length: Math.min(3, Math.ceil(warmth / 2)) }, (_, k) => `<path d="M${-12 + k * 12} -34 q-6 -9 0 -18 q6 -9 0 -18" fill="none" stroke="${M.cream}" stroke-width="2" opacity=".8"/>`).join("")}`
        : `<circle r="30" fill="none" stroke="${M.cream}" stroke-width="2" stroke-dasharray="5 6" opacity=".7"/>`}
        <text y="56" text-anchor="middle" font-size="17" fill="${M.cream}">${cupOn ? (warmth > 0 ? `warm: ${warmth}` : "cold") : "cup here"}</text>
        ${h && h.cup ? `<circle r="44" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="8 6"/>` : ""}</g>`;
      if (h && h.place) s += `<circle cx="${px(h.place.x)}" cy="${py(h.place.y)}" r="${RAD[h.place.s]}" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="8 6" pointer-events="none"/><text x="${px(h.place.x)}" y="${py(h.place.y) + 6}" text-anchor="middle" font-size="18" fill="#ffe08a" pointer-events="none">${["", "small", "medium", "large"][h.place.s]}</text>`;
      if (h && h.remove) s += `<circle cx="${px(h.remove.x)}" cy="${py(h.remove.y)}" r="${RAD[h.remove.s] + 8}" fill="none" stroke="#ff8a6a" stroke-width="4" stroke-dasharray="8 6" pointer-events="none"/>`;
      s += `<rect x="-10" y="474" width="530" height="96" rx="8" fill="#1d120b" stroke="${M.brass}" stroke-width="1.5"/>`;
      tray.forEach((sz, i) => {
        const cx = 36 + i * 82, cy = 510, r = RAD[sz] * 0.55;
        const [c, d] = COLORS[sz];
        s += `<g data-tray="${i}" style="cursor:pointer" transform="translate(${cx} ${cy})" role="button" aria-label="${["", "small", "medium", "large"][sz]} gear"><circle r="38" fill="${sel === i ? "rgba(232,195,90,.3)" : "transparent"}" stroke="${sel === i ? "#ffe08a" : "none"}" stroke-width="3"/>
          <path d="${gearPath(r)}" fill="${c}" stroke="${d}" stroke-width="1.5"/><circle r="4" fill="#1d120b"/>
          <text y="50" font-size="17" text-anchor="middle" fill="${M.cream}">${sz === 1 ? "small" : sz === 2 ? "medium" : "large"}</text></g>`;
      });
      return s;
    }
    function draw() {
      let s = frame();
      s += stage.key === "lever" ? drawLevers() : stage.key === "strap" ? drawStraps() : stage.key === "black" ? drawBlack() : drawGears();
      s += sigil();
      // on a narrow screen the board shrinks; grow its lettering so it stays legible
      const F = Math.max(1, Math.min(1.7, 600 / Math.max(300, svg.getBoundingClientRect().width || 600)));
      if (F > 1.05) s = s.replace(/font-size="(\d+)"/g, (m, n) => `font-size="${Math.round(n * F)}"`);
      svg.innerHTML = s;
      const mv = el.querySelector("." + P + "moves");
      mv.innerHTML = `MOVES ${String(moves).padStart(2, "0")}<small>par ${par()}${jam0 ? " (sand +" + jam0 + ")" : ""}</small>`;
      mv.classList.toggle(P + "over", moves > par());
    }

    // ---- actions ----
    function pressLever(i) {
      if (over || busy) return;
      levCur = i;
      if (jam.has("l" + i)) { brush("l" + i, `lever ${i + 1}'s pivot`); return; }
      changed = [i - 1, i, i + 1].filter((j) => j >= 0 && j < 5);
      for (const j of changed) levers[j] ^= 1;
      flash = performance.now() + (rm ? 0 : 450);
      bump();
      const up = levers.filter(Boolean).length;
      say(up ? `Lever ${i + 1} flips${changed.length > 1 ? `, and ${changed.filter((j) => j !== i).map((j) => j + 1).join(" and ")} with it` : ""}. ${up} still raised.` : "<b>All five lie flat.</b> The catch slides back.");
      if (!up) solve();
      draw();
    }
    function liftStrap(id) {
      if (over || busy) return;
      const st = STRAPS.find((s) => s.id === id);
      strapCur = STRAPS.indexOf(st);
      if (lifted.has(id)) { say(`Strap ${id} is already lifted.`); draw(); return; }
      if (jam.has("s" + id) && canLift(st)) { brush("s" + id, `strap ${id}'s buckle`); return; }
      bump();
      if (!canLift(st)) {
        const ids = STRAPS.filter((o) => !lifted.has(o.id) && o.z > st.z && CROSS[strapCur].includes(o.id)).map((o) => o.id);
        blockedBy = { ids, until: performance.now() + 1200 };
        shake = { id, until: performance.now() + (rm ? 0 : 400) };
        say(`Strap ${id} will not lift: ${ids.join(" and ")} ${ids.length > 1 ? "lie" : "lies"} across it.`, true);
      } else {
        lifted.add(id);
        say(lifted.size === STRAPS.length ? "Every strap is lifted. <b>Open the hasp</b> (tap it, or H)." : `Strap ${id} folds back. ${STRAPS.length - lifted.size} to go.`);
      }
      draw();
    }
    function openHasp() {
      if (over || busy) return;
      if (lifted.size < STRAPS.length) { say("The hasp will not move while a strap still holds it.", true); bump(); draw(); return; }
      bump(); hasp = true; say("<b>The hasp springs.</b> The ruling falls open."); solve(); draw();
    }
    function placeAt(x, y) {
      if (over || busy || turning) return;
      cursor = { x, y };
      const i = gears.findIndex((g) => g.x === x && g.y === y);
      if (i >= 0) { tray.push(gears[i].s); tray.sort(); gears.splice(i, 1); bump(); sel = null; say("Gear returned to the tray."); draw(); return; }
      if (sel == null) { say("Choose a gear from the tray first (or press 1, 2 or 3).", true); draw(); return; }
      const s = tray[sel];
      const why = blocked(gears, x, y, s);
      if (why) { say(why, true); draw(); return; }
      if (jam.has(`p${x},${y}`)) { brush(`p${x},${y}`, "that peg"); return; }
      gears.push({ x, y, s }); tray.splice(sel, 1); bump();
      sel = tray.length ? Math.min(sel, tray.length - 1) : null;
      const A = analyse(gears);
      say(A.jam ? "<b>The train would lock:</b> two meshed gears are forced the same way." : A.latch ? `The knob reaches the latch. It would turn <b>${A.latch === 1 ? "clockwise" : "counter-clockwise"}</b>.` : "Placed. The train does not reach the latch yet.", A.jam);
      draw();
    }
    function turn() {
      if (over || busy || turning || stage.key !== "gear") return;
      const A = analyse(gears);
      turning = true;
      spin = { until: performance.now() + (rm ? 300 : 1600), jam: A.jam };
      let text, bad = true;
      if (A.jam) text = "<b>The train locks.</b> Somewhere two meshed gears are forced the same way; look for a closed loop.";
      else if (!A.latch) text = "The knob spins freely. The train does not reach the latch.";
      else if (A.latch === -1) text = "<b>The latch turns counter-clockwise</b> and drives the bolt into its stop. Count the meshes: an even number turns it your way.";
      else if (!cupOn || warmth <= 0) text = LINES.boltCold;
      else { text = "<b>The latch turns clockwise.</b> The rack draws the warm bolt back."; bad = false; }
      const opens = !bad;
      say(text, bad);
      bump();
      timers.push(setTimeout(() => {
        turning = false; spin = null; rot = 0;
        if (opens) solve();
        draw();
      }, rm ? 300 : 1600));
    }
    function reset() {
      if (over || busy || turning) return;
      levers = LEVERS0.slice(); lifted = new Set(); hasp = false; gears = []; tray = TRAY.slice(); sel = null; moves = 0;
      if (stage.key === "black") { bDown = new Set(); bGear = 1; bHeard = ""; say("Reset. The straps stand open again. The frost and the candle are as they are."); draw(); return; }
      say("Reset. The clasp is as it was."); draw();
    }
    function useHint() {
      if (!sigilLit()) { say(`The sigil is not yet lit. Keep working; it warms in ${Math.ceil(((hintLevel === 0 ? 90000 : 60000) - (performance.now() - lastHintAt)) / 1000)} s.`); return; }
      hintLevel++; lastHintAt = performance.now();
      say("The sigil marks a move.");
      draw();
    }
    function solve() {
      over = true; busy = true;
      const secs = Math.round((performance.now() - stageStart) / 1000);
      timers.push(setTimeout(() => {
        const f = document.createElement("div");
        f.className = P + "frag";
        const more = si + 1 < STAGES.length;
        const rungEnds = more && RUNG[si + 1] !== RUNG[si];
        const nextBlack = more && STAGES[si + 1].key === "black";
        leak += 20;   // the sand book has gone on leaking while he worked
        f.innerHTML = `<div role="dialog" aria-label="Found">${pic(HEADING[stage.key], "chap")}<small>${stage.name} · ${stage.key === "black" ? "closed" : "open"} in ${moves} move${moves === 1 ? "" : "s"} (par ${par()}), ${secs} s</small><p><i></i></p><p></p>
          ${more ? `${nextBlack ? "" : `<p class="${P}sandp" style="font-size:15px">More sand has run from the sand book onto the table.</p><button type="button" class="${P}btn" data-a="sweep">${pic("glyph-sweep", "g")}Sweep the table, then the next clasp</button>`}<button type="button" class="${P}btn" data-a="next">${nextBlack ? "Fetch the black book" : "Next clasp"}</button>${rungEnds ? `<button type="button" class="${P}btn" data-a="stop">Stop here</button>` : ""}` : `<button type="button" class="${P}btn" data-a="next">Close the books</button>`}</div>`;
        f.querySelector("i").textContent = stage.found;
        f.querySelectorAll("p")[1].textContent = stage.frag ? FRAG[stage.frag] : LINES.blackText;
        if (rungEnds) { const n = document.createElement("p"); n.style.fontSize = "15px"; n.textContent = `Next, ${LADDER[RUNG[si + 1]].toLowerCase()}.`; f.querySelector("div").insertBefore(n, f.querySelector("button")); }
        root.appendChild(f);
        const bs = [...f.querySelectorAll("button")];
        bs[0].focus();
        const done = STAGES.slice(startBoard, si + 1);
        const parAll = () => done.reduce((a, s) => a + s.par, 0) + brushMoves;
        const endText = (lead) => `${lead} (${totalMoves} moves; par ${parAll()}.)${brushMoves ? LINES.endSand.replace("{n}", brushMoves).replace("{s}", brushMoves === 1 ? "" : "s") : ""}`;
        for (const b of bs) b.addEventListener("click", () => {
          f.remove();
          if (b.dataset.a === "sweep") {
            leak = Math.max(0, leak - 40);
            shared.set("jar_sand", Math.min(2, (shared.get("jar_sand", 0) | 0) + 1));
            linkNote = LINES.linkJar; linkShown = true;
          }
          if (b.dataset.a === "stop") { api.end({ outcome: "win", text: endText(RUNG[si] === 0 ? LINES.stopTeach : LINES.stopTest) }); return; }
          if (more) { setStage(si + 1); if (b.dataset.a === "sweep") say(LINES.swept + " " + stage.help); }
          else {
            const p = parAll();
            const lead = stage.key === "black" ? LINES.endTwist : totalMoves <= p + 4 ? LINES.endPar : LINES.endOver;
            if (art.has("clasp-closing-clasp")) {
              const c = document.createElement("div");
              c.className = P + "endc";
              c.innerHTML = `<figure>${pic("clasp-closing-clasp", "x", "A clasp being closed over a book that is still open.")}<figcaption>The books are closed again, one clasp at a time.</figcaption></figure>`;
              root.appendChild(c);
            }
            api.end({ outcome: "win", text: endText(lead) + (candle < CANDLE0 ? ` ${candle} of the candle was left.` : "") });
          }
        });
      }, rm ? 200 : 1100));
    }

    svg.addEventListener("click", (e) => {
      if (intro.isConnected) return;
      const t = e.target.closest("[data-peg],[data-gear],[data-tray],[data-hint],[data-lever],[data-strap],[data-hasp],[data-cup],[data-bgear],[data-bhasp],[data-thread]");
      if (!t) return;
      if (t.dataset.thread) { thread.found(); say(LINES.thread); return; }
      if (t.dataset.hint) { useHint(); return; }
      if (t.dataset.cup) { toggleCup(); return; }
      if (t.dataset.bgear) { bTurnGear(); return; }
      if (t.dataset.bhasp) { bHasp(); return; }
      if (t.dataset.strap && stage.key === "black") { bStrap(t.dataset.strap); return; }
      if (t.dataset.lever != null) { pressLever(+t.dataset.lever); return; }
      if (t.dataset.strap) { liftStrap(t.dataset.strap); return; }
      if (t.dataset.hasp) { openHasp(); return; }
      if (t.dataset.tray != null) { if (!over) { sel = +t.dataset.tray; say(`A ${["", "small", "medium", "large"][tray[sel]]} gear in hand. Now a peg.`); draw(); } return; }
      const g = t.dataset.gear != null ? gears[+t.dataset.gear] : null;
      const [x, y] = g ? [g.x, g.y] : t.dataset.peg.split(",").map(Number);
      placeAt(x, y);
    });
    svg.addEventListener("pointermove", (e) => {
      if (stage.key !== "gear" || over) return;
      const t = e.target.closest("[data-peg]");
      if (t) { const [x, y] = t.dataset.peg.split(",").map(Number); if (x !== cursor.x || y !== cursor.y) { cursor = { x, y }; draw(); } }
    });
    turnBtn.addEventListener("click", turn);
    cupBtn.addEventListener("click", toggleCup);
    el.querySelector("." + P + "reset").addEventListener("click", reset);
    const onKey = (e) => {
      if (intro.isConnected || over || busy) return;
      if (e.target && e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      const kl = k.toLowerCase();
      if (kl === "r") { reset(); e.preventDefault(); return; }
      if (kl === "?" || kl === "h" && stage.key !== "strap" && stage.key !== "black") { useHint(); e.preventDefault(); return; }
      if (stage.key === "black") {
        const idx = "abcde".indexOf(kl);
        if (idx >= 0 && kl.length === 1) bStrap(BSTR[idx].id);
        else if (kl === "g") bTurnGear();
        else if (kl === "h") bHasp();
        else if (k === "ArrowLeft" || k === "ArrowUp") { strapCur = (strapCur + BSTR.length - 1) % BSTR.length; draw(); }
        else if (k === "ArrowRight" || k === "ArrowDown") { strapCur = (strapCur + 1) % BSTR.length; draw(); }
        else if (k === "Enter" || k === " ") { bDown.size === BSTR.length ? (bGear === GEAR_HOME ? bHasp() : bTurnGear()) : bStrap(BSTR[strapCur].id); }
        else return;
        e.preventDefault(); return;
      }
      if (stage.key === "lever") {
        if (k >= "1" && k <= "5") pressLever(+k - 1);
        else if (k === "ArrowLeft") { levCur = Math.max(0, levCur - 1); draw(); }
        else if (k === "ArrowRight") { levCur = Math.min(4, levCur + 1); draw(); }
        else if (k === "Enter" || k === " ") pressLever(levCur);
        else return;
      } else if (stage.key === "strap") {
        const idx = "abcdef".indexOf(kl);
        if (idx >= 0 && kl.length === 1) liftStrap(STRAPS[idx].id);
        else if (kl === "h") openHasp();
        else if (k === "ArrowLeft" || k === "ArrowUp") { strapCur = (strapCur + 5) % 6; draw(); }
        else if (k === "ArrowRight" || k === "ArrowDown") { strapCur = (strapCur + 1) % 6; draw(); }
        else if (k === "Enter" || k === " ") { lifted.size === STRAPS.length ? openHasp() : liftStrap(STRAPS[strapCur].id); }
        else return;
      } else {
        if (k === "ArrowLeft") cursor.x = Math.max(0, cursor.x - 1);
        else if (k === "ArrowRight") cursor.x = Math.min(COLS - 1, cursor.x + 1);
        else if (k === "ArrowUp") cursor.y = Math.max(0, cursor.y - 1);
        else if (k === "ArrowDown") cursor.y = Math.min(ROWS - 1, cursor.y + 1);
        else if (k === "1" || k === "2" || k === "3") { const i = tray.indexOf(+k); if (i >= 0) { sel = i; say(`A ${["", "small", "medium", "large"][+k]} gear in hand.`); } else say("None of that size left in the tray.", true); }
        else if (k === "Enter" || k === " ") { placeAt(cursor.x, cursor.y); e.preventDefault(); return; }
        else if (kl === "t") { turn(); return; }
        else if (kl === "c") { toggleCup(); e.preventDefault(); return; }
        else return;
        draw();
      }
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    let lastSigil = false;
    function loop(now) {
      const dt = (now - t0) / 1000; t0 = now;
      const sig = sigilLit();
      const anim = spin || (flash && now < flash + 50) || (shake && now < shake.until + 50) || (blockedBy && now < blockedBy.until + 50);
      if (spin) rot += dt * 2.4;
      if (anim || sig !== lastSigil) draw();
      lastSigil = sig;
      raf = requestAnimationFrame(loop);
    }

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}plate" role="dialog" aria-label="How to play">
      <h2>The Clasps</h2>
      ${art.has(PLATE.lever) ? `<div class="${P}strip">${pic(PLATE.lever, "x")}${pic(PLATE.strap, "x")}${pic(PLATE.gear, "x")}</div>` : ""}
      <p class="${P}goal">${LINES.open}<br><b>Goal:</b> open all three, near par.</p>
      <dl>
        <dt>tap</dt><dd>Work the clasp: press a lever, lift a strap, place a gear.</dd>
        <dt>R</dt><dd>The reset lever puts a clasp back. It is free.</dd>
        <dt>sand</dt><dd>A sanded part must be brushed first: tap it once (a move), then work it. Sweep between clasps.</dd>
        <dt>✦</dt><dd>The hint sigil warms after 90 s and marks one move.</dd>
        <dt>ladder</dt><dd>Teach, test, twist: one clasp, two compound ones, and one to close. You can stop between them.</dd>
      </dl>
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${LADDER.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.split(":")[0]}</button>`).join("")}</div>` : ""}
      <button type="button" class="${P}btn ${P}go">Open the first book</button></div>`;
    el.appendChild(intro);
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { startBoard = FIRST_OF[+b.dataset.s]; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); }));
    intro.querySelector("." + P + "go").addEventListener("click", () => { intro.remove(); linkShown = true; setStage(startBoard); });
    intro.querySelector("." + P + "go").focus();

    setStage(0);
    raf = requestAnimationFrame(loop);
    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener("keydown", onKey); } };
  },
};

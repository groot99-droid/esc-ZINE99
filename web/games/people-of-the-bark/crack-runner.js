// People of the Bark — Crack runner (2D, pixel art).
// DESIGN.md 10, Mode A, cut to one spring run (c2_run): Highridge down the Long Crack to Lowridge,
// three segments, one dawn tremor. Move, jump, cling (3 s stamina), roll under dust, brace through
// the tremor. A fall into the dark is caught by lichen lower down and costs 8 seconds. Arrive
// before the limit to win; arrive late and the run is lost (morale −3).
// Cut to fit: limit 2:45 instead of 5:00; hazards are spring's (drip, dust, spikes, lichen, rain bead).
// The run has three phases: segment 1 is spring rain (beads roll up the groove at her); segment 2 has
// the tremor and the tall walls, so brace and cling are introduced there; segment 3 is the dust the
// tremor shook loose, so rolling matters most at the end. Each action is introduced when first needed.
// After two late runs, the limit is 3:25 and the brace marker shows 5 s early.

// Art (api.art): Mossa, the people on the ledges and the hazards are read from their pixel sheets once
// (the canvas runs at two device pixels to a world pixel so a 20 x 26 sprite fits her 6 x 9 body); the
// spring backdrop is the far wall seen through the crack. Each falls back to the old hand-set pixels.
import * as kit from "./_art.js";
import * as ladder from "./_ladder.js";
import * as book from "./_pulse.js";

// Phase 2: the run is a ladder of three (DEEP_DIVE.md 3). Teach, spring: paper floors, each with a tick
// mark; one holds one footfall. Test, summer: sap falls that end on three ledges, one of them paper, picked
// while sliding. Twist, Against the Tide: winter, dark, all Lowridge coming up the crack; the ticks are out,
// she listens for them (hold brace), the crowd cannot be rolled through, and at each wide gap Pell's lantern
// is dropped to the crowd and passed across below her. A Gallery Plug poured in the Sap Kitchen makes one
// site's paper floors solid (api.shared "plug_site"); a whole Pulse map (Tremor Scroll) keeps every tick lit.
const SITES = [["stair", "the Tapper's Stair"], ["ledges", "the Middle Ledges"], ["gate", "Lowridge Gate"]];
const CHALK = "#b9c2c4";

const PIX16 = ["#1b120c", "#2e2016", "#4a3324", "#5a3d2b", "#7a5a40", "#7d6c5a", "#a8977f", "#8fa37a",
  "#c4d65a", "#d9902a", "#f0c050", "#e8742a", "#b8402a", "#efe2c4", "#c9b99a", "#fff6dc"];
const T = 8;
const BODY = 10;
const RUN = 6 * BODY;
const GRAV = 720;
const JUMP = Math.sqrt(2 * GRAV * 2.6 * BODY);
const TREMOR_AT = 30;
const SEGS = 2, SEG_W = 130, COLS = SEGS * SEG_W + 8, ROWS = 46;
const Z = 2;   // device pixels to a world pixel
const MOSSA = { run: [0, 1, 2, 3], jump: 4, cling: 5, roll: 6, brace: 7, slide: 8, stun: 9, idle: 14, count: 15 };
const CROWD = { elder: 2, child: 3, priest: 4, tapper: 5, pass: 6, cook: 14, wait: 15 };
const HAZ = { drip: 0, dust: 2, spikes: 3, lichen: 4, bead: 6, brace: 11 };
const STAGE_SEED = [20261113, 20261116, 20261121];

function rngFrom(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function buildLevel(stage) {
  const r = rngFrom(STAGE_SEED[stage]);
  const ground = new Array(COLS).fill(14);
  const pit = new Array(COLS).fill(false);
  const haz = { spikes: [], lichen: [], drips: [], dust: [], walls: [] };
  // phase 2: thin ledges (plats), paper among them; sap falls that end in a fork; the crowd; the tide gaps
  const plats = [], forks = [], crowd = [], gaps = [], keep = new Set(), roof = {};
  let g = 14, x = 0;
  const flat = (n) => { for (let i = 0; i < n && x < COLS; i++) ground[x++] = g; };
  const hold = (n) => { for (let i = 0; i < n && x < COLS; i++) { keep.add(x); ground[x++] = g; } };
  // the features of each stage, by the column they start near
  const FEATS = [
    [[30, "paper"], [64, "paper"], [98, "paper"], [140, "paper"], [182, "paper"], [224, "paper"]],
    [[26, "paper"], [52, "fork", 1], [96, "fork", 0], [134, "paper"], [156, "wall"], [176, "fork", 2], [214, "fork", 1], [240, "paper"]],
    [[24, "crowd"], [42, "paper"], [64, "gap"], [88, "paper"], [108, "crowd"], [128, "gap"], [150, "paper"], [170, "crowd"], [190, "gap"], [212, "paper"], [236, "paper"]],
  ][stage].slice();
  function feature(f) {
    const kind = f[1];
    if (g < 13) g = 13;
    hold(kind === "gap" ? 8 : 4);
    if (kind === "paper") {
      const c0 = x; for (let i = 0; i < 3; i++) { keep.add(x); ground[x++] = g + 2; }
      plats.push({ c0, c1: c0 + 3, row: g, paper: true, broken: false, stood: 0, heard: 0 });
      hold(3);
    } else if (kind === "fork") {
      const s0 = x; hold(8);
      const c0 = x; for (let i = 0; i < 5; i++) { keep.add(x); roof[x] = g - 3; ground[x++] = g + 5; }
      const rows = [g - 3, g, g + 3];
      const ps = rows.map((row, i) => { const p = { c0, c1: c0 + 5, row, paper: i === f[2], broken: false, stood: 0, heard: 0, fork: true }; plats.push(p); return p; });
      forks.push({ s0, c0, rows, ps, lane: 1, done: false });
      g += 3; hold(2); g -= 2; hold(4);
    } else if (kind === "wall") {
      keep.delete(x - 2); haz.lichen.push(x - 2); g -= 4; haz.walls.push(x); hold(4);
    } else if (kind === "crowd") {
      crowd.push({ c: x, n: 3 }); hold(3); hold(3);
    } else if (kind === "gap") {
      const c0 = x; for (let i = 0; i < 4; i++) { pit[x] = true; keep.add(x); ground[x++] = 99; }
      gaps.push({ c0, c1: c0 + 4 }); hold(4);
    }
  }
  flat(9);
  while (x < COLS - 8) {
    const seg = Math.min(SEGS - 1, Math.floor(x / SEG_W));
    if (FEATS.length && x >= FEATS[0][0]) { feature(FEATS.shift()); continue; }
    flat(4 + Math.floor(r() * 4));
    const roll = r();
    if (roll < 0.42 || g < 12) { g = Math.min(ROWS - 14, g + 2 + Math.floor(r() * 3)); }
    else if (roll < 0.56) { g = Math.max(8, g - 1 - Math.floor(r() * 2)); }
    else if (roll < 0.82 && stage < 2) {
      const w = 2 + Math.floor(r() * 2);
      for (let i = 0; i < w && x < COLS; i++) { pit[x] = true; ground[x++] = 99; }
      g = Math.min(ROWS - 14, g + Math.floor(r() * 2));
    } else if (stage === 1 && seg >= 1 && g > 22) { g -= 4; haz.walls.push(x); }
    else { g = Math.min(ROWS - 14, g + (stage === 2 ? 1 : 3)); }
  }
  while (x < COLS) ground[x++] = g;
  const ceil = ground.map((_, i) => {
    let m = 99;
    for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < COLS && !pit[j]) m = Math.min(m, roof[j] != null ? roof[j] : ground[j]); }
    return m - 7 - Math.floor(r() * 2);
  });
  const okCol = (i) => i > 10 && i < COLS - 8 && [-2, -1, 0, 1, 2].every((k) => !pit[i + k] && !keep.has(i + k) && ground[i + k] === ground[i]);
  // segment 1 is rain and drips; segment 2 walls and the tremor; segment 3 the dust it shook loose
  const plan = [
    [{ spikes: 2, drips: 3, lichen: 2, dust: 0 }, { spikes: 3, drips: 2, lichen: 2, dust: 0 }],
    [{ spikes: 2, drips: 4, lichen: 2, dust: 2 }, { spikes: 3, drips: 3, lichen: 2, dust: 3 }],
    [{ spikes: 1, drips: 0, lichen: 1, dust: 1 }, { spikes: 2, drips: 0, lichen: 1, dust: 2 }],
  ][stage];
  const used = new Set();
  for (let s = 0; s < SEGS; s++) {
    for (const kind of ["spikes", "drips", "lichen", "dust"]) {
      for (let n = 0; n < plan[s][kind]; n++) {
        for (let tries = 0; tries < 40; tries++) {
          const c = s * SEG_W + 4 + Math.floor(r() * (SEG_W - 8));
          if (!okCol(c) || used.has(c) || used.has(c - 1) || used.has(c + 1) || used.has(c - 2) || used.has(c + 2)) continue;
          if (haz.walls.some((w) => Math.abs(w - c) < 3)) continue;
          used.add(c); haz[kind].push(c); break;
        }
      }
    }
  }
  for (const w of haz.walls) if (!pit[w - 2] && !keep.has(w - 2) && !haz.lichen.includes(w - 2)) haz.lichen.push(w - 2);
  // the three sites of the Long Crack: a Gallery Plug poured at one makes its paper floors solid
  plats.forEach((p) => { p.site = SITES[Math.min(2, Math.floor(p.c0 / (COLS / 3)))][0]; });
  return { ground, ceil, pit, haz, plats, forks, crowd, gaps };
}

const SPEC = { title: "Crack runner", chip: "left:auto;right:6px;bottom:auto;top:30px", stages: [
  { name: "Spring, and paper floors", blurb: "The rule alone: a ledge with a tick mark holds one footfall." },
  { name: "Summer, the sap falls", blurb: "Each fall ends on three ledges and one of them is paper. Pick while sliding." },
  { name: "Against the Tide", blurb: "Winter, in the dark. The tick marks are out, and all Lowridge is coming up the crack." },
] };
const STAGE_ART = [["chapter-2-spring", "runner-backdrop-spring", "HIGHRIDGE ▸ THE LONG CRACK ▸ LOWRIDGE · SPRING DAWN"],
  ["chapter-3-summer", "runner-backdrop-sap-flow", "HIGHRIDGE ▸ THE SAP FALLS ▸ LOWRIDGE · SUMMER NOON"],
  ["chapter-5-winter", "runner-backdrop-frost-crowd", "HIGHRIDGE ▸ DOWN THE LONG CRACK · DEEP WINTER, NIGHT"]];

export default {
  mount(root, api) { return ladder.run(root, api, SPEC, play); },
};

function play(root, api, stage) {
  {
    const P = "people-of-the-bark-crack-runner-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    let raf = 0;
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const LIMIT = [100, 110, 150][stage] + (gentle ? 40 : 0);
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const plugSite = shared.get("plug_site", "");
    const mapWhole = !!shared.get("pulse_map_whole", false);
    const dark = stage === 2;
    const WARN = gentle ? 5 : 3;
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;background:#1b120c;overflow:hidden;font-family:'Silkscreen',ui-monospace,monospace;color:#efe2c4;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}cv{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);image-rendering:pixelated;image-rendering:crisp-edges}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.88);z-index:5;padding:16px;overflow:auto}
.${P}tix{max-width:520px;width:100%;box-sizing:border-box;border:4px solid #7a5a40;background:#2e2016;padding:18px 20px;box-shadow:0 0 0 4px #1b120c,0 0 0 8px #4a3324,8px 8px 0 8px #0d0805;position:relative}
.${P}tix::after{content:"";position:absolute;right:-4px;top:30%;width:12px;height:24px;background:#1b120c;border:4px solid #7a5a40;border-right:0}
.${P}tix h2{margin:0;font-size:22px;color:#f0c050;font-weight:400;letter-spacing:.04em;line-height:1.2}
.${P}tix .${P}route{font-size:13px;color:#c4d65a;margin:6px 0 10px;letter-spacing:.06em}
.${P}tix .${P}lede{font:italic 17px/1.4 'Cormorant Garamond',Georgia,serif;color:#e9d6ae;margin:0 0 10px}
.${P}tix .${P}goal{font:16px/1.4 ui-monospace,monospace;color:#efe2c4;margin:0 0 12px;border-top:2px dashed #5a3d2b;padding-top:10px}
.${P}tix .${P}goal b{color:#f0c050;font-weight:400}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:8px 12px;font:15px/1.3 ui-monospace,monospace;margin:0 0 14px;align-items:center}
.${P}key kbd{font:13px 'Silkscreen',monospace;color:#1b120c;background:#c9b99a;padding:3px 7px;box-shadow:0 3px 0 #7a5a40;white-space:nowrap;justify-self:start}
.${P}btn{font:inherit;font-size:15px;color:#1b120c;background:#f0c050;border:0;padding:9px 18px;cursor:pointer;box-shadow:0 4px 0 #d9902a}
.${P}btn:focus-visible{outline:3px solid #c4d65a;outline-offset:3px}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:none;justify-content:space-between;padding:10px;gap:8px;z-index:3;pointer-events:none}
.${P}pad.${P}show{display:flex}
.${P}grp{display:flex;gap:8px;pointer-events:auto;flex-wrap:wrap;max-width:50%}
.${P}grp+.${P}grp{justify-content:flex-end}
.${P}k{width:58px;height:58px;border:3px solid #7a5a40;background:rgba(46,32,22,.85);color:#efe2c4;font:inherit;font-size:12px;display:grid;place-items:center;touch-action:none}
.${P}k[hidden]{display:none}
.${P}k.${P}on{background:#d9902a;color:#1b120c}
.${P}msg{position:absolute;left:50%;top:18%;transform:translateX(-50%);font-size:16px;color:#f0c050;text-shadow:2px 2px 0 #1b120c,-2px 2px 0 #1b120c;pointer-events:none;text-align:center;z-index:2;max-width:92%}
.${P}msg.${P}bad{color:#ff9b7a}
.${P}beat{position:absolute;left:12px;top:56px;max-width:min(380px,calc(100% - 24px));font:italic 17px/1.35 'Cormorant Garamond',Georgia,serif;color:#efe2c4;background:rgba(27,18,12,.85);border:2px solid #5a3d2b;padding:6px 10px;pointer-events:none;transition:opacity .4s;z-index:2}
.${P}beat b{font:12px 'Silkscreen',monospace;font-style:normal;color:#c4d65a;display:block;letter-spacing:.06em}
.${P}toast{position:absolute;right:12px;top:56px;font-size:13px;line-height:1.5;background:#2e2016;border:3px solid #c4d65a;padding:6px 10px;color:#efe2c4;z-index:3;pointer-events:none;transition:opacity .4s;max-width:46%}
.${P}toast kbd{font:inherit;color:#1b120c;background:#c4d65a;padding:0 5px}
.${P}hit{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 6px #b8402a;opacity:0;transition:opacity .2s;z-index:1}
@media (pointer:coarse){.${P}pad{display:flex}.${P}msg{top:14%}}
@media (max-width:560px){.${P}msg{top:30%;font-size:14px}.${P}beat{top:auto;bottom:146px;left:10px;right:10px;max-width:none;font-size:16px}.${P}toast{top:48px;right:8px;max-width:70%}}
</style>
<canvas class="${P}cv"></canvas>
<div class="${P}hit"></div>
<div class="${P}beat" aria-live="polite"></div>
<div class="${P}toast" aria-live="polite"></div>
<div class="${P}msg" aria-live="polite"></div>
<div class="${P}pad"><div class="${P}grp"><button class="${P}k" data-k="left">◀</button><button class="${P}k" data-k="right">▶</button><button class="${P}k" data-k="brace" hidden>${["BRACE", "LOW ▼", "LISTEN"][stage]}</button><button class="${P}k" data-k="lantern" ${stage === 2 ? "" : "hidden"}>LAMP</button></div>
<div class="${P}grp"><button class="${P}k" data-k="roll">ROLL</button><button class="${P}k" data-k="cling" hidden>CLING</button><button class="${P}k" data-k="jump">JUMP</button></div></div>
<div class="${P}intro"><div class="${P}tix" role="dialog" aria-label="How to play">
${kit.chapter(api.art, STAGE_ART[stage][0])}
<div style="display:flex;gap:10px;align-items:center;margin-top:10px">${kit.mark(api.art, "mossa", "Mossa, the messenger")}<h2>CRACK RUNNER</h2></div>
<div class="${P}route">${STAGE_ART[stage][2]}</div>
<p class="${P}lede">${["You are Mossa, the fastest runner in Highridge. The Knot has read the night's omen, and Lowridge must hear it from you before it hears the rumour.",
  "Summer, and the sap is running. The falls are the fast way down, and every one of them ends in a choice.",
  "Deep winter. The lowest street of Lowridge has settled into a gallery, and a city is walking up the Long Crack carrying its doors. Mossa is the only one going down, with Pell's lantern."][stage]}</p>
<p class="${P}goal">${["Reach Lowridge before <b>" + fmt(LIMIT) + "</b>. A ledge with a <b>tick mark</b> is a paper floor over a gallery: it holds one footfall. Jump it.",
  "Reach Lowridge before <b>" + fmt(LIMIT) + "</b>. Each sap fall carries her to three ledges; the ticked one is paper and costs 4 seconds. Pick while sliding.",
  "Reach the settled street before <b>" + fmt(LIMIT) + "</b>. In the dark the tick marks are out. Stand and <b>listen</b>: a paper floor mutters. Nobody rolls through a crowd."][stage]}</p>
<div class="${P}key"><kbd>A D · ◀ ▶</kbd><span>run</span><kbd>SPACE · W</kbd><span>jump (hop on lichen to fly high)</span><kbd>C</kbd><span>roll: a dash, low under falling dust</span>${stage === 1 ? "<kbd>W · S</kbd><span>on a sap fall: pick the high, middle or low ledge</span>" : ""}${stage === 2 ? "<kbd>S</kbd><span>hold still and listen for paper</span><kbd>F</kbd><span>at a wide gap: drop the lantern to the crowd, then jump</span>" : ""}</div>
<button class="${P}btn" type="button">Start the run</button></div></div>`;
    root.appendChild(wrap);
    kit.styles(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const cv = $("cv"), g = cv.getContext("2d"), msgEl = $("msg"), intro = $("intro"), beatEl = $("beat"), toastEl = $("toast"), hitEl = $("hit");

    const L = buildLevel(stage);
    const { ground, ceil, pit, haz, plats, forks, crowd, gaps } = L;
    let chalked = 0;
    plats.forEach((p) => {
      if (!p.paper) return;
      p.plugged = !!plugSite && p.site === plugSite;
      p.marked = !dark || mapWhole || (!p.plugged && chalked++ === 0);   // Sorrel chalked the one she knew
    });
    const platAt = (tx, ty) => { for (const p of plats) if (!p.broken && ty === p.row && tx >= p.c0 && tx < p.c1) return p; return null; };
    const LVW = COLS * T, LVH = ROWS * T;

    let LW = 200, LH = 112;
    function fit() {
      const r = wrap.getBoundingClientRect();
      const aspect = Math.max(0.45, r.width / Math.max(1, r.height));
      LH = r.width < 520 ? 150 : 100;
      LW = Math.max(80, Math.min(300, Math.round(LH * aspect)));
      cv.width = LW * Z; cv.height = LH * Z;
      const sc = Math.min(r.width / LW, r.height / LH);
      cv.style.width = Math.floor(LW * sc) + "px";
      cv.style.height = Math.floor(LH * sc) + "px";
      g.imageSmoothingEnabled = false;
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);

    // ---- the bark, painted once ----
    const bark = document.createElement("canvas");
    bark.width = LVW; bark.height = LVH;
    (function paint() {
      const bg = bark.getContext("2d");
      const img = bg.createImageData(LVW, LVH);
      const rgb = PIX16.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      const r = rngFrom(77);
      const ridge = Array.from({ length: LVW }, () => [2, 3, 3, 4][Math.floor(r() * 4)]);
      for (let py = 0; py < LVH; py++) {
        for (let px = 0; px < LVW; px++) {
          const c = Math.floor(px / T), row = py / T;
          let col, open = false;
          const gr = ground[c], ce = ceil[c];
          if (row >= gr && !pit[c]) {
            const d = py - gr * T;
            col = d === 0 ? 14 : d === 1 ? 6 : d === 2 ? 4 : ridge[px];
            if (d > 2 && px % 9 === 0) col = 1;
            if (d > 2 && (px + py) % 2 === 0 && r() < 0.16) col = Math.max(1, col - 1);
          } else if (row < ce + 1) {
            const d = (ce + 1) * T - py;
            col = d === 1 ? 5 : ridge[px];
            if (d > 1 && px % 7 === 0) col = 1;
            if ((px + py) % 2 === 0 && r() < 0.16) col = Math.max(1, col - 1);
          } else {
            col = ((px % 11 === 0) && ((py >> 2) % 3 !== 0)) ? 1 : 0;
            if ((px + py) % 2 === 0 && r() < 0.05) col = 1;
            open = true;
          }
          const k = (py * LVW + px) * 4, v = rgb[col];
          // the open crack is left see-through (a thin veil of dark), so the far wall can show behind it
          img.data[k] = v[0]; img.data[k + 1] = v[1]; img.data[k + 2] = v[2]; img.data[k + 3] = open ? (col ? 150 : 120) : 255;
        }
      }
      bg.putImageData(img, 0, 0);
      const px = (x, y, w, h, c) => { bg.fillStyle = PIX16[c]; bg.fillRect(x, y, w, h); };
      for (let i = 0; i < 3; i++) { const x = 6 + i * 16, y = ground[1] * T - 14; px(x, y, 8, 14, 1); px(x + 2, y + 3, 4, 5, 11); px(x + 3, y + 4, 2, 2, 10); }
      const ex = (COLS - 6) * T, ey = ground[COLS - 6] * T;
      for (let i = 0; i < 4; i++) { px(ex + i * 8, ey - 3, 6, 3, 7); px(ex + i * 8 + 1, ey - 5, 4, 2, 8); }
      px(ex + 34, ey - 16, 9, 16, 1); px(ex + 36, ey - 12, 5, 6, 8);
      for (let s = 1; s < SEGS; s++) { let c = s * SEG_W; while (pit[c]) c++; px(c * T + 2, ground[c] * T - 10, 3, 10, 6); px(c * T + 1, ground[c] * T - 12, 5, 3, 10); }
      // pits: a faint lichen glow far below, the catch that saves her
      for (let c = 0; c < COLS; c++) if (pit[c]) for (let y = LVH - 6; y < LVH; y += 2) px(c * T + ((y >> 1) % 3) * 2, y, 2, 1, 7);
      // sap falls: the amber run that carries her to the fork
      for (const f of forks) { const y = ground[f.s0] * T; px(f.s0 * T, y, 8 * T, 2, 10); for (let k = 0; k < 8 * T; k += 5) px(f.s0 * T + k, y + 2 + (k % 3), 3, 1, 9); }
    })();

    // ---- the art, read once ----
    const A = { mossa: null, crowd: null, haz: null, far: null, dust: null };
    let dead = false;
    (async () => {
      const art = api.art;
      if (!art) return;
      const [mossa, crowd, haz, far] = await Promise.all([
        kit.pixelSheet(art, "runner-sheet-mossa", { cols: 8, rows: 2, cw: 20, ch: 32, scale: 6 }),
        kit.pixelSheet(art, "runner-sheet-crowd", { cols: 8, rows: 2, cw: 20, ch: 32, scale: 6 }),
        kit.pixelSheet(art, "runner-sheet-hazards", { cols: 6, rows: 2, cw: 22, ch: 36, scale: 7 }),
        kit.raster(art, STAGE_ART[stage][1], 320, 180),
      ]);
      if (dead) return;
      A.mossa = mossa; A.crowd = crowd; A.haz = haz; A.far = far;
      if (haz && haz.frame(HAZ.dust)) { A.dust = document.createElement("canvas"); A.dust.width = 20; A.dust.height = 24; A.dust.getContext("2d").drawImage(haz.frame(HAZ.dust), 0, 1, 20, 24, 0, 0, 20, 24); }
    })();
    // the people standing on the ledges: who sees her off, the tapper at the checkpoint, Lowridge waiting
    const people = [];
    (function place() {
      const at = (c, who, flip) => { let k = c; while (pit[k] || pit[k + 1]) k++; people.push({ c: k, who, flip }); };
      at(0, "priest", false); at(1, "elder", false);
      at(SEG_W + 2, "tapper", true);
      at(2 * SEG_W + 3, "wait", true);
      at(COLS - 4, "pass", true); at(COLS - 3, "child", true); at(COLS - 1, "cook", true);
    })();

    // ---- state ----
    const keys = { left: false, right: false, jump: false, cling: false, roll: false, brace: false, lantern: false };
    const S = {
      started: false, over: false, t: 0, penalty: 0,
      x: 3 * T, y: ground[3] * T - 9, vx: 0, vy: 0, w: 6, h: 9, onGround: true, face: 1,
      stamina: 1, clinging: false, rollT: 0, rollCd: 0, stun: 0, sticky: 0, knock: 0, inv: 0, fallFrom: null,
      checkpoint: 3, tremorDone: false, braced: null, shake: 0, dustT: 0, jumpHeld: false,
      papers: 0, listen: 0, braceHeld: false, lanHeld: false, lan: { state: "held", x: 0, y: 0, t: 0, gap: null }, passes: 0, bumped: 0,
      beads: [], beadClock: 3, msg: "", msgT: 0, bad: false, anim: 0, falls: 0, hits: 0, puffs: [], unlocked: new Set(["left", "right", "jump", "roll"]),
    };
    const solid = (tx, ty) => {
      if (tx < 0 || tx >= COLS) return true;
      if (ty <= ceil[tx]) return true;
      if (platAt(tx, ty)) return true;
      return !pit[tx] && ty >= ground[tx];
    };
    const say = (m, t = 1.6, bad = false) => { S.msg = m; S.msgT = t; S.bad = bad; msgEl.classList.toggle(P + "bad", bad); };
    let beatT = 0, toastT = 0;
    const beat = (who, text, secs = 6) => { beatEl.innerHTML = `<b>${who}</b>${text}`; beatEl.style.opacity = "1"; beatT = secs; };
    const hurt = () => { if (api.reducedMotion) return; hitEl.style.opacity = "1"; later(() => (hitEl.style.opacity = "0"), 180); };
    function unlock(k, html) {
      if (S.unlocked.has(k)) return;
      S.unlocked.add(k);
      const b = wrap.querySelector(`.${P}k[data-k="${k}"]`); if (b) b.hidden = false;
      toastEl.innerHTML = html; toastEl.style.opacity = "1"; toastT = 5;
    }
    function boxHits(x, y, w, h) {
      const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
      for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) if (solid(tx, ty)) return true;
      return false;
    }
    function respawn() {
      let c = Math.max(S.checkpoint, S.safe || 3); while (pit[c]) c--;
      S.x = c * T + 1; S.y = ground[c] * T - S.h; S.vx = 0; S.vy = 0; S.fallFrom = null; S.stun = 0.4;
      S.penalty += 8; S.falls++; say(dark ? "THE CROWD HANDS HER BACK UP  −8 S" : "CAUGHT BY LICHEN  −8 S", 2, true); hurt();
      S.lan.state = "held";
      if (S.falls === 1 && dark) beat("Hands in the dark", "“Up you go, runner.” Nobody below asks where she is going. They can see which way.");
      else if (S.falls === 1) beat("Mossa", "“Not the Long Fall. Not today.” The lichen far below is soft, and slow to climb out of.");
    }

    // ---- input ----
    const KEYMAP = { KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right", Space: "jump", KeyW: "jump", ArrowUp: "jump",
      ShiftLeft: "cling", ShiftRight: "cling", KeyC: "roll", KeyS: "brace", ArrowDown: "brace", KeyF: "lantern" };
    on(window, "keydown", (e) => {
      const k = KEYMAP[e.code]; if (!k || !S.started || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault(); keys[k] = true;
    });
    on(window, "keyup", (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
    on(window, "blur", () => { for (const k in keys) keys[k] = false; });
    wrap.querySelectorAll("." + P + "k").forEach((b) => {
      const k = b.dataset.k;
      const down = (e) => { e.preventDefault(); keys[k] = true; b.classList.add(P + "on"); try { b.setPointerCapture(e.pointerId); } catch { /* */ } };
      const up = () => { keys[k] = false; b.classList.remove(P + "on"); };
      on(b, "pointerdown", down); on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
    });
    const startBtn = intro.querySelector("button");
    on(startBtn, "click", () => {
      intro.remove(); S.started = true; last = performance.now();
      if (stage === 0) beat("Mossa", "“If it shakes, I go faster. That's the rule.” Spring rain is running down the groove: jump the beads, or they sweep you back.");
      if (stage === 1) beat("Mossa", "“Tappers call it the fast road. Tappers also call it the short road, and they mean something else.”");
      if (stage === 2) beat("Mossa", "Pell's lantern, in her hand. Below, the whole of Lowridge is climbing toward her with its doors on its backs.", 7);
      if (stage > 0) { S.unlocked.add("brace"); const b = wrap.querySelector(`.${P}k[data-k="brace"]`); if (b) b.hidden = false; }
      const pl = plats.filter((p) => p.plugged).length;
      if (pl) later(() => { offNote = ladder.note(wrap, `Because you poured a Gallery Plug at ${SITES.find((q) => q[0] === plugSite)[1]} in the Sap Kitchen, ${pl === 1 ? "its paper floor is" : "its " + pl + " paper floors are"} solid on this run.`); }, 900);
      else if (dark && mapWhole) later(() => { offNote = ladder.note(wrap, "Because you kept the Pulse map whole on the Tremor Scroll, every paper floor stays marked in the dark."); }, 900);
    });
    startBtn.focus({ preventScroll: true });
    let offNote = null;
    if (stage !== 0) S.tremorDone = true;

    // ---- simulation ----
    function update(dt) {
      S.t += dt; S.anim += dt;
      if (S.msgT > 0) S.msgT -= dt;
      S.rollCd = Math.max(0, S.rollCd - dt); S.inv = Math.max(0, S.inv - dt); S.sticky = Math.max(0, S.sticky - dt);
      S.dustT = Math.max(0, S.dustT - dt); S.shake = Math.max(0, S.shake - dt);
      S.puffs.forEach((p) => (p.t -= dt)); S.puffs = S.puffs.filter((p) => p.t > 0);
      const elapsed = S.t + S.penalty;

      if (!S.tremorDone && TREMOR_AT - S.t <= WARN + 1.5) unlock("brace", `NEW · hold <kbd>S</kbd> BRACE on solid bark when the marker lights`);
      if (!S.tremorDone && S.t >= TREMOR_AT) {
        S.tremorDone = true; S.shake = 0.7;
        const braced = keys.brace && S.onGround;
        S.braced = braced;
        if (braced) { say("BRACED. SHE STAYS ON HER FEET", 2.2); S.puffs.push({ x: S.x + 3, y: S.y + 9, t: 0.6, c: 8 }); }
        else {
          say("THE TREMOR THROWS HER DOWN", 2.2, true); hurt();
          S.stun = 1; S.dustT = 4; S.vy = -120; S.vx = RUN * 1.2; S.knock = 0.5; S.onGround = false;
        }
        later(() => beat("Fenn's scroll would say", "dawn, east face, strength two. Dust is loose all down the crack now: roll under the sheets."), 2500);
      }

      if (S.stun > 0) S.stun -= dt;
      const canAct = S.stun <= 0;
      let speed = RUN * (S.sticky > 0 ? 0.5 : 1);
      // a sap fall carries her; she only picks the ledge
      let slide = null;
      for (const f of forks) if (!f.done && S.x + S.w / 2 >= f.s0 * T && S.x < f.c0 * T) slide = f;
      if (slide) {
        if (!slide.seen) { slide.seen = true; toastEl.innerHTML = `SAP FALL · <kbd>W</kbd> higher ledge · <kbd>S</kbd> lower ledge`; toastEl.style.opacity = "1"; toastT = 4; }
        if (keys.jump && !S.jumpHeld) slide.lane = Math.max(0, slide.lane - 1);
        if (keys.brace && !S.braceHeld) slide.lane = Math.min(2, slide.lane + 1);
      }
      // the crowd: slow to push through, and never rolled through
      let inCrowd = null;
      for (const q of crowd) { const x0 = q.c * T, y0 = ground[q.c] * T - 9; if (S.x + S.w > x0 + 1 && S.x < x0 + 2 * T - 1 && S.y + S.h > y0) inCrowd = q; }
      if (inCrowd) {
        if (S.rollT > 0) { S.rollT = 0; S.x = inCrowd.c * T - S.w; S.knock = 0.3; S.vx = -50; S.bumped++; say("NOBODY ROLLS THROUGH A CROWD", 1.4, true); hurt(); }
        else { speed *= 0.3; if (S.msgT <= 0) say("“MIND— SORRY— MIND.”", 0.9); }
      }
      // listening: stand still and the paper mutters
      if (dark && keys.brace && S.onGround && canAct) {
        S.listen += dt;
        if (S.listen > 0.3) for (const p of plats) if (p.paper && !p.broken && !p.plugged && Math.abs((p.c0 + 1.5) * T - S.x) < 130) { if (p.heard <= 0 && !S.heardOnce) { S.heardOnce = true; beat("Mossa", "She stops counting. Ahead, one ledge is ticking, the way Sorrel's wall did."); } p.heard = 5; }
      } else S.listen = 0;
      for (const p of plats) if (p.heard > 0) p.heard -= dt;
      // the lantern: dropped to the crowd at a wide gap, passed below her, taken back on the far side
      const lan = S.lan;
      if (dark) {
        if (keys.lantern && !S.lanHeld && lan.state === "held") {
          const gp = gaps.find((q) => q.c0 * T - (S.x + S.w) >= -2 && q.c0 * T - (S.x + S.w) < 44);
          if (gp && S.onGround) { lan.state = "pass"; lan.t = 0; lan.gap = gp; S.passes++; say("THE LANTERN GOES DOWN INTO THE CROWD", 1.6); if (S.passes === 1) beat("A voice below", "“Pell's lamp. Pass it on. Pass it on.” It goes hand to hand under her, the way he would have liked."); }
          else say("NO HANDS BELOW TO TAKE IT HERE", 1.2, true);
        }
        if (lan.state === "pass") {
          lan.t += dt; const k = Math.min(1, lan.t / 1.7), gp = lan.gap, gy = ground[gp.c0 - 1] * T;
          lan.x = (gp.c0 * T - 4) + k * ((gp.c1 * T + 6) - (gp.c0 * T - 4)); lan.y = gy + 12 - Math.abs(Math.sin(k * Math.PI * 4)) * 3 - (k > 0.85 ? (k - 0.85) / 0.15 * 20 : 0);
          if (k >= 1) { lan.state = "wait"; lan.x = gp.c1 * T + 6; lan.y = ground[gp.c1] * T - 8; }
        } else if (lan.state === "wait") {
          if (S.x + 3 > lan.x - 9 && S.onGround) { lan.state = "held"; say("THE LANTERN, BACK IN HER HAND", 1.2); }
        }
        if (lan.state === "held") {
          lan.x = S.x + 3 + S.face * 4; lan.y = S.y + 3;
          // nobody jumps a wide gap with a lamp in one hand
          const over = gaps.find((q) => S.x + S.w / 2 > q.c0 * T + 3 && S.x + S.w / 2 < q.c1 * T);
          if (over && !S.onGround) { S.knock = 0.4; S.vx = 0; S.vy = Math.max(S.vy, 160); if (S.msgT <= 0) say("TOO WIDE WITH A LAMP IN ONE HAND. DROP IT TO THEM (F)", 2.4, true); }
        } else if (!S.onGround) speed *= 1.3;   // both hands free
      }
      S.lanHeld = keys.lantern;
      const sliding = !!slide;
      if (sliding) speed = RUN * 1.7;
      if (canAct && keys.roll && S.rollCd <= 0 && S.onGround) { S.rollT = 0.38; S.rollCd = 0.9; keys.roll = false; }
      if (S.rollT > 0) { S.rollT -= dt; speed *= 1.9; }
      const rolling = S.rollT > 0;
      const bracing = keys.brace && S.onGround && canAct && S.unlocked.has("brace") && !sliding;
      let dir = 0;
      if (canAct && !bracing) { if (keys.left) dir -= 1; if (keys.right) dir += 1; }
      if (sliding) dir = 1;
      if (rolling && dir === 0) dir = S.face;
      if (dir) S.face = dir;
      if (S.knock > 0) S.knock -= dt;
      else S.vx = dir * speed;

      const wallL = boxHits(S.x - 1, S.y + 2, 1, S.h - 4), wallR = boxHits(S.x + S.w, S.y + 2, 1, S.h - 4);
      if (!S.onGround && (wallL || wallR) && S.x / T > SEG_W * 0.8) unlock("cling", `NEW · hold <kbd>SHIFT</kbd> CLING to a wall (3 s), then jump to climb`);
      S.clinging = canAct && !S.onGround && keys.cling && (wallL || wallR) && S.stamina > 0 && S.unlocked.has("cling");
      if (S.clinging) { S.stamina = Math.max(0, S.stamina - dt / 3); S.vy = Math.min(S.vy, 8); S.fallFrom = S.y; }
      if (keys.jump && !S.jumpHeld && canAct && !sliding && (S.onGround || S.clinging)) {
        S.vy = -JUMP; S.onGround = false; S.fallFrom = S.y;
        if (S.clinging) { S.clinging = false; }
      }
      S.jumpHeld = keys.jump; S.braceHeld = keys.brace;
      if (!S.clinging) S.vy = Math.min(420, S.vy + GRAV * dt);

      const h = rolling ? 5 : 9;
      if (h !== S.h) { if (h > S.h && boxHits(S.x, S.y - (h - S.h), S.w, h)) { /* stay low */ } else { S.y += S.h - h; S.h = h; } }
      let nx = S.x + S.vx * dt;
      if (!boxHits(nx, S.y, S.w, S.h)) S.x = nx;
      else if (S.onGround && !boxHits(nx, S.y - 2, S.w, S.h)) { S.x = nx; S.y -= 2; }
      else S.vx = 0;
      for (const c of haz.dust) {
        const dx0 = c * T, dx1 = dx0 + 2 * T;
        if (S.x + S.w > dx0 && S.x < dx1 && !rolling) {
          S.x = S.face > 0 ? dx0 - S.w : dx1; if (S.msgT <= 0) say("DUST. ROLL UNDER IT (C)", 1.2, true);
        }
      }
      let ny = S.y + S.vy * dt;
      const wasGround = S.onGround;
      if (!boxHits(S.x, ny, S.w, S.h)) { S.y = ny; S.onGround = false; }
      else {
        if (S.vy > 0) {
          S.y = Math.floor((ny + S.h) / T) * T - S.h; S.onGround = true;
          if (S.fallFrom != null && S.y - S.fallFrom > 6 * BODY) { S.stun = 1; say("A LONG DROP. STUNNED", 1.2, true); }
          S.fallFrom = null;
        } else { S.y = Math.ceil(ny / T) * T; }
        S.vy = 0;
      }
      if (!S.onGround && wasGround && S.vy >= 0 && S.fallFrom == null) S.fallFrom = S.y;
      if (S.onGround) { S.stamina = 1; const sc = Math.floor((S.x + S.w / 2) / T); if (!pit[sc] && !pit[sc + 1] && !pit[sc - 1]) S.safe = sc; }
      if (S.y > LVH + 20) respawn();
      // the fork at the foot of a sap fall: she lands on the ledge she picked
      if (slide && S.x + S.w >= slide.c0 * T) {
        slide.done = true; S.x = slide.c0 * T + 1; S.y = slide.rows[slide.lane] * T - S.h; S.vy = 0; S.onGround = true; S.fallFrom = null;
        for (let k = 0; k < 5; k++) S.puffs.push({ x: S.x + k * 2, y: S.y + S.h, t: 0.5, c: 10 });
        say(["THE HIGH LEDGE", "THE MIDDLE LEDGE", "THE LOW LEDGE"][slide.lane], 0.9);
      }
      // paper: one footfall
      if (S.onGround) {
        const fy = Math.round((S.y + S.h) / T);
        for (const p of plats) {
          if (p.broken || !p.paper || p.plugged || fy !== p.row || S.x + S.w <= p.c0 * T || S.x >= p.c1 * T) continue;
          p.stood += dt;
          if (p.stood > 0.2) {
            p.broken = true; S.papers++; S.onGround = false; S.stun = 0.35; S.fallFrom = null;
            if (stage > 0) S.penalty += 4;
            for (let k = 0; k < 8; k++) S.puffs.push({ x: p.c0 * T + k * 3, y: p.row * T + 2, t: 0.7, c: 15 });
            say(stage > 0 ? "PAPER. IT GOES  −4 S" : "PAPER. IT HELD ONE FOOTFALL", 1.6, true); hurt();
            if (S.papers === 1) beat("Mossa", stage === 2 ? "No mark on it. There was a mark on it in spring." : "Under the ledge there is no bark, only a long low room with ribbed walls. She does not look for long.");
          }
        }
      }

      const col = Math.floor((S.x + S.w / 2) / T);
      const seg = Math.floor(col / SEG_W);
      if (seg > 0 && seg * SEG_W > S.checkpoint && col >= seg * SEG_W) {
        S.checkpoint = seg * SEG_W; say(`SEGMENT ${seg + 1}/${SEGS} · CHECKPOINT`, 1.6);
        for (let k = 0; k < 6; k++) S.puffs.push({ x: S.x + 3 + (k - 3) * 3, y: S.y - 4 - (k % 2) * 3, t: 0.8, c: 10 });
        if (seg === 1) beat(...[["A tapper at the checkpoint", "“Paper's worse lower down. Don't ask me why. Ask Sorrel, she'll tell you whether you ask or not.”"],
          ["A tapper at the checkpoint", "“The walls get tall past here. Cling if you must, child, and climb.”"],
          ["Sorrel, going up", "“You're going the wrong way, runner.” She looks at the lantern. “No. You're not. Listen at the floors.”"]][stage]);
      }
      if (S.inv <= 0) for (const c of haz.spikes) {
        const sx = c * T + 1, sy = ground[c] * T - 4;
        if (S.x + S.w > sx && S.x < sx + 6 && S.y + S.h > sy) { S.vx = -S.face * 80; S.knock = 0.25; S.vy = -130; S.onGround = false; S.inv = 1.3; S.hits++; say("SPLINTERS", 0.8, true); hurt(); }
      }
      if (S.onGround) for (const c of haz.lichen) {
        if (col === c) { S.vy = -JUMP * 1.32; S.onGround = false; S.fallFrom = S.y; S.puffs.push({ x: c * T + 4, y: ground[c] * T - 4, t: 0.5, c: 8 }); }
      }
      for (const c of haz.drips) {
        const period = 1.7, ph = ((S.t + c * 0.37) % period) / period;
        const top = (ceil[c] + 1) * T, bot = ground[c] * T;
        const dy = top + ph * (bot - top);
        const dx = c * T + 3;
        if (S.x < dx + 2 && S.x + S.w > dx && S.y < dy + 3 && S.y + S.h > dy && S.sticky <= 0) { S.sticky = 2; say("STICKY SAP: SLOWED", 1, true); }
      }
      S.beadClock -= dt;
      if (S.beadClock <= 0 && stage === 0 && col < SEG_W - 4) {
        S.beadClock = 4 + Math.random() * 2.5;
        const bc = Math.min(COLS - 2, col + Math.floor(LW / T * 0.6));
        if (!pit[bc]) S.beads.push({ x: bc * T, y: ground[bc] * T - 6, vx: -55 });
      }
      for (const b of S.beads) {
        b.x += b.vx * dt;
        const bc = Math.floor((b.x + 3) / T);
        if (bc < 0 || pit[bc]) { b.dead = true; continue; }
        const gy = ground[bc] * T - 6;
        b.y += Math.min(4, Math.max(-60 * dt, gy - b.y)); if (gy < b.y - 3) b.vx = -b.vx;
        if (S.inv <= 0 && !rolling && S.x < b.x + 6 && S.x + S.w > b.x && S.y < b.y + 6 && S.y + S.h > b.y) {
          if (S.vy > 40 && S.y + S.h < b.y + 4) { S.vy = -JUMP * 0.8; say("BOUNCED OFF A RAIN BEAD", 0.8); }
          else { S.vx = b.vx * 2.6; S.knock = 0.35; S.inv = 0.6; S.hits++; say("SWEPT BY A RAIN BEAD", 0.9, true); hurt(); }
        }
      }
      S.beads = S.beads.filter((b) => !b.dead && Math.abs(b.x - S.x) < 400);
      if (col >= COLS - 5) finish(elapsed);
    }

    function finish(elapsed) {
      if (S.over) return;
      S.over = true;
      const brace = S.braced ? " She braced through the tremor and kept her feet." : " The tremor threw her down a ledge.";
      const cost = S.falls ? ` The lichen caught her ${S.falls === 1 ? "once" : S.falls + " times"}.` : "";
      api.store.set("best", Math.min(api.store.get("best", 9999), elapsed));
      const paper = S.papers ? ` ${S.papers === 1 ? "One paper floor" : S.papers + " paper floors"} went under her.` : stage === 2 ? " Not one paper floor went under her." : "";
      if (offNote) offNote();
      if (elapsed <= LIMIT) {
        api.store.set("losses", 0);
        if (stage === 0) {
          shared.set("sorrel_met", true);
          book.gather(root, api, "sorrel");   // phase 3: Sorrel's note for the Pulse map
          api.end({ outcome: "win", text: `Mossa reaches Lowridge in ${fmt(elapsed)}, on time, and gives the Knot's reading before the rumour does.${brace}${cost}${paper} A tapper forewoman called Sorrel hears her out, then puts Mossa's ear to a wall. Something in it is ticking. Mossa stops counting. “You Highridge lot hear the Trunk when it shouts. Down here it mutters.”` });
        } else if (stage === 1) {
          api.end({ outcome: "win", text: `Mossa comes off the last sap fall into Lowridge in ${fmt(elapsed)}, sticky to the knees and on time.${cost}${paper} “Three hundred and— never mind. I'm here.”` });
        } else {
          api.end({ outcome: "win", text: `Against the tide, in ${fmt(elapsed)}: Mossa reaches the street that settled.${cost}${paper} The lantern crossed ${S.passes} gap${S.passes === 1 ? "" : "s"} in other people's hands and came back each time. Above her a city is still climbing, carrying its doors. She holds Pell's light over the gallery where the street was, and listens, and does not count.` });
        }
      } else {
        api.store.set("losses", losses + 1);
        api.end({ outcome: "lose", text: stage === 2
          ? `Mossa reaches the settled street in ${fmt(elapsed)}, after the limit of ${fmt(LIMIT)}. The last of Lowridge has already gone up past her, and nobody is left to tell her who was in the street.${cost}${paper}${losses + 1 >= 2 ? " Next run she sets out earlier." : ""}`
          : `Mossa reaches Lowridge in ${fmt(elapsed)}, after the limit of ${fmt(LIMIT)}. The rumour got there first, and it was worse than the reading; morale −3.${stage === 0 ? brace : ""}${cost}${paper}${losses + 1 >= 2 ? " Next run the Knot will send her earlier: a longer limit." : ""}` });
      }
    }

    // ---- drawing ----
    // one sheet frame, drawn a device pixel to a sprite pixel, its foot at world (fx, fy)
    function stamp(sheet, n, fx, fy, flip, sy = 0, sh = 0) {
      const fr = sheet && sheet.frame(n); if (!fr) return false;
      const h = sh || fr.height - sy;
      g.save(); g.translate(fx, fy); if (flip) g.scale(-1, 1);
      g.drawImage(fr, 0, sy, fr.width, h, -9.5 / Z, -h / Z, fr.width / Z, h / Z);
      g.restore();
      return true;
    }
    function sprite(x, y) {
      const px = (dx, dy, c) => { g.fillStyle = PIX16[c]; g.fillRect(x + dx, y + dy, 1, 1); };
      const f = S.face;
      const X = (dx) => (f > 0 ? dx : 5 - dx);
      const blink = S.inv > 0 && Math.floor(S.anim * 14) % 2;
      if (blink) return;
      if (A.mossa) {
        const bracing = keys.brace && S.onGround && S.unlocked.has("brace");
        const moving = S.onGround && Math.abs(S.vx) > 5;
        const n = S.rollT > 0 ? MOSSA.roll : S.stun > 0 ? MOSSA.stun : bracing ? MOSSA.brace : S.clinging ? MOSSA.cling : !S.onGround ? MOSSA.jump
          : moving ? MOSSA.run[Math.floor(S.anim * 11) % 4] : S.over ? MOSSA.count : MOSSA.idle;
        if (stamp(A.mossa, n, x + 3, y + S.h, f < 0)) { if (S.sticky > 0) { px(X(1), S.h - 1, 9); px(X(4), S.h - 1, 9); } return; }
      }
      if (S.rollT > 0) {
        const rows = [".hhh..", "hbbbbr", "hbbbbr", ".bbbr."];
        rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== ".") px(X(i), 9 - rows.length + j, ch === "h" ? 14 : ch === "r" ? 12 : 5); }));
        return;
      }
      const bracing = keys.brace && S.onGround && S.unlocked.has("brace");
      const run = S.onGround && Math.abs(S.vx) > 5 ? Math.floor(S.anim * 10) % 2 : 0;
      const legs = bracing ? "l....l" : S.onGround ? (run ? ".l..l." : "..ll..") : ".l...l";
      const rows = bracing ? ["......", "..hh..", ".hhhh.", "rrrrb.", ".bbbb.", "bbbbbb", ".b..b.", legs, legs] : ["..hh..", ".hhhh.", "..hh..", "rrrrb.", ".bbbb.", ".bbbb.", ".b..b.", legs, legs];
      rows.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === ".") return;
        px(X(i), j, ch === "h" ? 14 : ch === "r" ? 12 : ch === "l" ? 2 : 5);
      }));
      const tail = S.onGround && !run ? 1 : 3;
      for (let k = 1; k <= tail; k++) px(X(-k), 3 + (k > 1 ? 1 : 0) + (run && k === 3 ? 1 : 0), 12);
      if (S.sticky > 0) { px(X(1), 8, 9); px(X(4), 8, 9); }
      if (S.stun > 0 && Math.floor(S.anim * 8) % 2) { px(X(1), -2, 10); px(X(4), -3, 10); }
    }

    let shade = null;
    // a tick mark: the chalk on a paper floor; `heard` is the same mark, sounding
    function tick(x, y, heard) {
      g.fillStyle = CHALK;
      g.fillRect(x - 4, y + 2, 2, 1); g.fillRect(x - 3, y + 3, 2, 2); g.fillRect(x - 1, y + 2, 2, 2); g.fillRect(x + 1, y, 2, 2); g.fillRect(x + 3, y - 2, 1, 2);
      if (heard) { const r = api.reducedMotion ? 6 : 4 + ((S.t * 8) % 6); g.strokeStyle = CHALK; g.lineWidth = 1; g.beginPath(); g.arc(x - 0.5, y + 1.5, r, Math.PI, 0); g.stroke(); }
    }
    function draw() {
      const shake = S.shake > 0 && !api.reducedMotion ? Math.round(Math.sin(S.t * 70) * 2) : 0;
      let cx = Math.round(S.x - LW * (LW < 120 ? 0.3 : 0.38)), cy = Math.round(S.y - LH * 0.55);
      cx = Math.max(0, Math.min(LVW - LW, cx)); cy = Math.max(0, Math.min(LVH - LH, cy));
      g.setTransform(Z, 0, 0, Z, 0, 0);
      g.imageSmoothingEnabled = false;
      g.fillStyle = PIX16[0]; g.fillRect(0, 0, LW, LH);
      // the far wall of the crack: the spring backdrop, a third as fast as the near wall
      if (A.far) {
        const k = Math.max(1, Math.ceil(LH / (A.far.height / Z))), fw = A.far.width / Z * k, fh = A.far.height / Z * k;
        const ox = -((cx * 0.35) % fw), oy = -Math.round((cy / Math.max(1, LVH - LH)) * Math.max(0, fh - LH));
        for (let x = ox; x < LW; x += fw) g.drawImage(A.far, Math.round(x), oy, fw, fh);
      }
      g.drawImage(bark, cx - shake, cy, LW, LH, 0, 0, LW, LH);
      g.save(); g.translate(-cx + shake, -cy);
      const px = (x, y, w, h, c) => { g.fillStyle = PIX16[c]; g.fillRect(x, y, w, h); };
      const seen = (c) => c * T > cx - 24 && c * T < cx + LW + 24;
      for (const q of people) if (seen(q.c) && A.crowd) stamp(A.crowd, CROWD[q.who], q.c * T + 4, ground[q.c] * T, q.flip);
      // the fork's lane marker, the ledges and the paper among them
      for (const f of forks) if (!f.done && seen(f.c0)) { const y = f.rows[f.lane] * T, ax = f.c0 * T - 8; px(ax, y - 5, 5, 3, 10); px(ax + 5, y - 6, 1, 5, 10); px(ax + 6, y - 5, 1, 3, 15); px(ax + 7, y - 4, 1, 1, 15); }
      for (const p of plats) {
        if (!seen(p.c0) && !seen(p.c1)) continue;
        const x = p.c0 * T, y = p.row * T, w = (p.c1 - p.c0) * T;
        if (p.broken) { px(x, y, 2, 2, 14); px(x + w - 2, y, 2, 2, 14); px(x + 3, y + 5, 2, 1, 6); px(x + w - 6, y + 7, 2, 1, 6); continue; }
        if (!p.paper) { px(x, y, w, 1, 14); px(x, y + 1, w, 2, 4); px(x, y + 3, w, 2, 3); px(x + 2, y + 5, w - 4, 1, 2); continue; }
        if (p.plugged) { px(x, y, w, 1, 10); px(x, y + 1, w, 3, 9); px(x, y + 4, w, 2, 5); for (let k = 3; k < w; k += 6) px(x + k, y + 2, 2, 1, 15); continue; }
        px(x, y, w, 1, 14); px(x, y + 1, w, 1, 6); px(x, y + 2, w, 2, 4); for (let k = 1; k < w; k += 4) px(x + k, y + 4, 2, 1, 6);
        if (p.marked) tick(x + (w >> 1), y);
      }
      for (const q of crowd) {
        if (!seen(q.c)) continue;
        const y = ground[q.c] * T, who = ["elder", "cook", "child", "priest", "tapper"];
        for (let k = 0; k < q.n; k++) { const fx = q.c * T + 2 + k * 6; if (!(A.crowd && stamp(A.crowd, CROWD[who[(q.c + k) % 5]], fx, y, true))) { px(fx - 2, y - 8, 4, 8, 5); px(fx - 1, y - 11, 3, 3, 14); } }
        px(q.c * T + 1, y - 14, 5, 1, 4); px(q.c * T + 1, y - 17, 5, 3, 2);   // a door, carried
      }
      // the tide in the gaps: heads and doors going up under her
      for (const q of gaps) {
        if (!seen(q.c0)) continue;
        const gy = ground[q.c0 - 1] * T + 16, off = api.reducedMotion ? 0 : Math.floor(S.t * 5);
        for (let k = 0; k < 6; k++) { const hx = q.c0 * T + ((k * 5 + off) % 26) - 1, hy = gy + (k % 3) * 5; px(hx, hy, 3, 3, 14); px(hx - 1, hy + 3, 5, 5, k % 2 ? 5 : 2); }
        px(q.c0 * T + 2, ground[q.c0 - 1] * T - 13, 1, 9, 6); px(q.c0 * T - 1, ground[q.c0 - 1] * T - 14, 4, 1, 6); px(q.c0 * T - 1, ground[q.c0 - 1] * T - 13, 1, 3, 11);  // the hook where a lamp is lowered
      }
      for (const c of haz.spikes) {
        if (!seen(c)) continue;
        const x = c * T, y = ground[c] * T;
        if (stamp(A.haz, HAZ.spikes, x + 4, y, false, 0, 25)) continue;
        px(x + 1, y - 2, 6, 2, 6); px(x + 2, y - 4, 1, 2, 15); px(x + 5, y - 4, 1, 2, 15); px(x + 3, y - 5, 2, 3, 15); px(x + 3, y - 6, 1, 1, 12);
      }
      for (const c of haz.lichen) {
        if (!seen(c)) continue;
        const x = c * T, y = ground[c] * T;
        if (stamp(A.haz, HAZ.lichen, x + 4, y, false, 0, 25)) continue;
        px(x, y - 3, 8, 3, 7); px(x + 1, y - 5, 2, 2, 8); px(x + 5, y - 5, 2, 2, 8); px(x + 3, y - 4, 2, 1, 8);
      }
      for (const c of haz.drips) {
        if (!seen(c)) continue;
        const top = (ceil[c] + 1) * T, bot = ground[c] * T, ph = ((S.t + c * 0.37) % 1.7) / 1.7;
        const fr = A.haz && A.haz.frame(HAZ.drip);
        if (fr) { g.drawImage(fr, 0, 1, 20, 12, c * T - 1, top, 10, 6); g.drawImage(fr, 0, 25, 20, 4, c * T - 1, bot - 2, 10, 2); }
        else { px(c * T + 2, top, 4, 2, 9); px(c * T + 3, top + 2, 2, 1, 10); px(c * T + 1, bot - 1, 6, 1, 9); }
        const dy = top + ph * (bot - top); px(c * T + 3, dy, 2, 3, 10); px(c * T + 3, dy + 2, 2, 1, 9); px(c * T + 3.5, dy + 0.5, 0.5, 1, 15);
      }
      for (const c of haz.dust) {
        if (!seen(c)) continue;
        const top = (ceil[c] + 1) * T, bot = ground[c] * T - 6, off = Math.floor(S.t * 30);
        if (A.dust) {
          // the dust sheet tile, falling: two columns of it, clipped to the gap she can roll under
          g.save(); g.beginPath(); g.rect(c * T, top, 16, bot - top); g.clip();
          const th = 12, o = (S.t * 26) % th;
          for (let y = top - th + o; y < bot; y += th) { g.drawImage(A.dust, c * T - 1, y, 10, th); g.drawImage(A.dust, c * T + 7, y + 3, 10, th); }
          g.restore();
        } else for (let y = top; y < bot; y++) for (let x = 0; x < 16; x++) if (((x + y + off) & 1) === 0 && ((x * 7 + y + off) % 5 !== 0)) px(c * T + x, y, 1, 1, ((y + off) % 9 === 0) ? 15 : 14);
        px(c * T, bot + 1, 16, 1, 9); // the gap at the floor she can roll through
      }
      for (const b of S.beads) {
        if (stamp(A.haz, HAZ.bead, b.x + 3.5, b.y + 6, false, 0, 25)) continue;
        px(b.x + 1, b.y, 4, 6, 6); px(b.x, b.y + 1, 6, 4, 6); px(b.x + 1, b.y + 1, 2, 2, 15);
      }
      for (const p of S.puffs) { const r = Math.round((1 - p.t) * 6); px(p.x - r, p.y, 1, 1, p.c); px(p.x + r, p.y, 1, 1, p.c); px(p.x, p.y - r, 1, 1, p.c); }
      sprite(Math.round(S.x), Math.round(S.y));
      if (dark) { const lx = Math.round(S.lan.x), ly = Math.round(S.lan.y); px(lx - 1, ly - 2, 3, 1, 4); px(lx - 2, ly - 1, 5, 4, 11); px(lx - 1, ly, 3, 2, 10); px(lx, ly, 1, 1, 15); }
      if (S.clinging || (S.stamina < 1 && !S.onGround)) {
        g.strokeStyle = PIX16[8]; g.lineWidth = 1;
        g.beginPath(); g.arc(Math.round(S.x + 3) + 0.5, Math.round(S.y + 4) + 0.5, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * S.stamina); g.stroke();
      }
      g.restore();
      if (dark) {
        // the dark, with the lantern's reach cut out of it (and a breath of sight round Mossa without it)
        if (!shade) { shade = document.createElement("canvas"); }
        if (shade.width !== LW || shade.height !== LH) { shade.width = LW; shade.height = LH; }
        const sg = shade.getContext("2d");
        sg.globalCompositeOperation = "source-over"; sg.clearRect(0, 0, LW, LH); sg.fillStyle = "rgba(9,7,12,.95)"; sg.fillRect(0, 0, LW, LH);
        sg.globalCompositeOperation = "destination-out";
        const hole = (x, y, r) => { const gr = sg.createRadialGradient(x, y, r * 0.35, x, y, r); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); sg.fillStyle = gr; sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.fill(); };
        const fl = api.reducedMotion ? 0 : Math.sin(S.t * 9) * 1.5;
        hole(S.lan.x - cx, S.lan.y - cy, (S.lan.state === "held" ? 46 : 30) + fl);
        if (S.lan.state !== "held") hole(S.x + 3 - cx, S.y + 4 - cy, 16);
        g.drawImage(shade, 0, 0);
        // what she has heard shows through the dark
        g.save(); g.translate(-cx, -cy);
        for (const p of plats) if (p.paper && !p.broken && !p.plugged && !p.marked && p.heard > 0) tick((p.c0 + 1.5) * T, p.row * T, true);
        g.restore();
      }

      if (S.dustT > 0) {
        const off = Math.floor(S.t * 20);
        for (let y = 12; y < LH; y += 1) for (let x = (y + off) & 1; x < LW; x += 2) if ((x * 13 + y * 7 + off) % 3 === 0) px(x, y, 1, 1, 14);
      }
      // HUD: the route strip, Highridge to Lowridge
      px(0, 0, LW, 12, 1); px(0, 12, LW, 1, 4);
      const sx0 = 7, sx1 = LW - 7;
      for (let x = sx0; x < sx1; x += 3) px(x, 6, 2, 1, 6);
      px(sx0 - 3, 2, 5, 8, 11); px(sx1 - 2, 2, 5, 8, 7);
      for (let s = 1; s < SEGS; s++) px(Math.round(sx0 + (sx1 - sx0) * s / SEGS), 3, 1, 6, 6);
      const prog = Math.min(1, S.x / ((COLS - 5) * T));
      const mx = Math.round(sx0 + (sx1 - sx0) * prog);
      px(mx - 1, 2, 3, 8, 12); px(mx, 3, 1, 1, 14);
      if (!S.tremorDone) { const tm = Math.round(sx0 + (sx1 - sx0) * Math.min(1, prog + (TREMOR_AT - S.t) / 140)); px(tm - 1, 2, 3, 2, 10); px(tm - 2, 4, 5, 1, 11); px(tm - 1, 5, 3, 4, 10); }
      // the clock
      g.font = "8px Silkscreen, monospace"; g.textBaseline = "top";
      const el = S.t + S.penalty, left = Math.max(0, LIMIT - el);
      const ky = LW < 130 ? 36 : LH - 12;   // on a phone the pad covers the foot of the picture
      g.fillStyle = PIX16[0]; g.fillRect(2, ky, 74, 11);
      g.fillStyle = left < 30 ? (Math.floor(S.t * 4) % 2 || api.reducedMotion ? PIX16[11] : PIX16[12]) : PIX16[10];
      g.fillText(`SEG ${Math.min(SEGS, Math.floor(S.x / T / SEG_W) + 1)}/${SEGS} ${fmt(left)}`, 4, ky + 1);
      // time bar under the strip: shrinks as the limit nears
      px(0, 13, Math.round(LW * left / LIMIT), 1, left < 30 ? 11 : 9);
      // brace marker, early (the forecast was right)
      if (!S.tremorDone && TREMOR_AT - S.t <= WARN) {
        const blink = api.reducedMotion || Math.floor(S.t * 6) % 2 === 0;
        const ok = keys.brace && S.onGround;
        g.fillStyle = PIX16[0]; g.fillRect(LW / 2 - 26, 17, 52, 15);
        g.fillStyle = ok ? PIX16[8] : blink ? PIX16[11] : PIX16[10]; g.fillText(ok ? "BRACED" : "BRACE S", LW / 2 - 22, 19);
        const bm = A.haz && A.haz.frame(HAZ.brace);
        if (bm && (blink || ok)) g.drawImage(bm, 0, 2, 20, 22, LW / 2 - 40, 17, 10, 11);
        px(LW / 2 - 24, 29, Math.round(48 * (TREMOR_AT - S.t) / WARN), 2, ok ? 8 : 11);
      }
      if (S.sticky > 0) { g.fillStyle = PIX16[0]; g.fillRect(LW - 38, LH - 12, 36, 11); g.fillStyle = PIX16[9]; g.fillText("STICKY", LW - 36, LH - 11); }
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (S.started && !S.over) update(dt);
      if (beatT > 0) { beatT -= dt; if (beatT <= 0) beatEl.style.opacity = "0"; }
      if (toastT > 0) { toastT -= dt; if (toastT <= 0) toastEl.style.opacity = "0"; }
      draw();
      msgEl.textContent = S.msgT > 0 ? S.msg : "";
      raf = requestAnimationFrame(loop);
    }
    beatEl.style.opacity = "0"; toastEl.style.opacity = "0";
    raf = requestAnimationFrame(loop);

    return {
      unmount() {
        dead = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        offs.forEach((f) => f());
        ro.disconnect();
        if (offNote) offNote();
        wrap.remove();
      },
    };
  }
}

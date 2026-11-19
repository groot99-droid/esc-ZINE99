// Dr. Tox: Fall, 1D game: Bloom (DESIGN.md section 11, `g1_bloom`; scenes s1_bloom_1 and s1_bloom_2).
// Four-colour Ben-Day newsprint: cyan, magenta, yellow and black dot screens on yellowed newsprint, a heavy keyline, the spread
// printed in rust dots (docs/graphic_styles.json). No other mode's style is used.
//
// Spread containment on a grid. Spores start on a few cells. Each tick the wind carries them from every spore cell to the
// downwind neighbour, and with a 30 percent chance to each crosswind neighbour. A spore cell shows level 1, 2, 3 and, a tick later,
// is MARKED: the people in it are changed (never killed on the page), named, and their names go to bloom.marked_names. Nothing
// here is gory; the marked are a dot screen and a line in the broadcast's crawl, "contained".
//   Page 1 (s1_bloom_1, Aegis, 9 x 7): ABSORB a spore cell (clears it; Load +15, at most 100) or raise a PANE on a cell edge
//     (Load -10, blocks spread across that edge for the page). A pane cannot be raised without the Load for it.
//   Page 2 (s1_bloom_2, Dr. Tox, 10 x 7, the settlement in the two east columns): CREWS (bloom.crews = following / 10, plus one per
//     Observer present) each cordon one cell (blocks spread into it) and can be moved once a tick. With the Observers: the Cauldron
//     burns one cell clear once; the Twins collapse a line once and the page shows their cost. At tick 6 the wind turns east; holding the
//     settlement then needs five cordons across the plain at once. With fewer than five crews it cannot be held, however well the
//     page is played: bloom.settlement_lost. That is deliberate (The Clinic's cost is built into the page).
// Finish: no spore cell left, or tick 12. Failure: none in the design. "win" is reported for a page contained (page 1: at most 12
// blocks marked; page 2: the settlement held), "done" for any other finish.
//
// Shared flags (data/flags.json): reads load, following, observers_choice, bloom.marked_names, bloom.cells_lost;
// writes load (page 1), bloom.cells_lost, bloom.marked_names, bloom.crews, bloom.settlement_lost (page 2), following (+5 if the
// settlement holds), rostova.seen.
//
// Art (games/dr-tox-fall/art/ASSET_MAP.md, "Bloom"): bloom-page, -masthead, -portrait-catalyst, -crew, -resident, -cell,
// -cell-absorbed, -cell-burned, -cell-marked, -cell-spore-1/2/3, -cordon, -pane, -tick, -twins-line, -wind, and the shared hud-load,
// hud-word-hope, hud-margin-calm. Every piece has a drawn fallback when api.art does not have it.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): the starting clouds, three actions a tick on page 1, a spore
// cell living three ticks before it marks, absorbed and burned cells staying clean, the piers that make the plain five blocks wide on
// page 2, the second release landing along the column before the piers at tick 6 (dashed on the page from tick 3), a cordon on a spore
// cell sealing it, the Twins' line as five edges along a row, the "at most 12 marked" bar for a win on page 1, the page-2 residents
// placed on the grid (the settlement's six and Kofi Mensah, from DESIGN.md section 6) and every caption line.

const P = "bl-";
const C = { ink: "#141414", paper: "#efe3b8", paper2: "#f6edcc", page: "#e4d5a3", cyan: "#2fa8d8", mag: "#d8336a", yel: "#e9c62e", rust: "#9C4A2A", ochre: "#C98F3B", red: "#c1272d", grey: "#5d584a" };
const QUOTE = "Releases engineered mutagens into population centers.";
const CITE = "Dr. Tox bible, Part VI, Rostova (Version A)";

const CS = 72, PAD = 24, TICKS = 12;
const WIN_MARKED = 12;                       // page 1: contained with at most this many blocks marked
const AP_MAX = 3;                            // page 1: actions a tick
const SEED_TICK = 6;                         // page 2: the wind turns east; the second release lands
const PAGES = [
  { n: 1, id: "s1_bloom_1", W: 9, H: 7, caption: "2229", chapter: "Chapter 3 · Containment", who: "Aegis",
    where: "The bloom district at first light. Cameras are already on the roofs.",
    windTurn: null,
    cloud: [[0, 1, 3], [0, 2, 3], [0, 3, 2], [0, 4, 2], [0, 5, 3], [1, 2, 1], [1, 3, 1], [1, 4, 1]],
    named: [
      { x: 3, y: 2, name: "Grace Mbeki", want: "her stall open by noon" },
      { x: 4, y: 4, name: "Faisal Noor", want: "to finish the night shift" },
      { x: 6, y: 1, name: "Tilde Aronsen", want: "the bus to come" },
      { x: 7, y: 5, name: "Sami Haddad", want: "his father's coughing to stop" },
    ] },
  { n: 2, id: "s1_bloom_2", W: 10, H: 7, caption: "2234", chapter: "Chapter 8 · Bloom", who: "Dr. Tox",
    where: "The haze drifting east across the plain. The settlement is in the two red columns.",
    windTurn: SEED_TICK,
    cloud: [[2, 0, 3], [1, 0, 2], [3, 0, 2], [2, 1, 1]],
    piers: [[5, 0], [6, 0], [7, 0], [5, 6], [6, 6], [7, 6]],
    seedCol: 4,
    named: [
      { x: 3, y: 3, name: "Kofi Mensah", want: "to see the river again" },
      { x: 8, y: 2, name: "Mercy Abiodun", want: "the settlement not to have to be afraid", settle: true },
      { x: 9, y: 1, name: "Marisol Quiroga", want: "her son's boots back from the State truck", settle: true },
      { x: 9, y: 3, name: "Yusuf Demir", want: "to be useful", settle: true },
      { x: 8, y: 4, name: "Dov Ashkenazi", want: "to fix the generator for good", settle: true },
      { x: 8, y: 5, name: "Petra Lind", want: "to be left alone", settle: true },
      { x: 9, y: 5, name: "Ren Sato", want: "to get home to his shift rota", settle: true },
    ] },
];
const WIND1 = "E";                           // page 1: the wind blows east throughout

const CSS = `
.${P}root{position:absolute;inset:0;display:flex;flex-direction:column;background:${C.page};color:${C.ink};font-family:var(--g-body,system-ui,sans-serif);overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.${P}mast{flex:none;height:clamp(40px,9vw,84px);background:${C.paper2} center/contain no-repeat;border-bottom:5px solid ${C.ink};position:relative;display:flex;align-items:center;justify-content:center}
.${P}mast b{font:900 clamp(18px,4.4vw,40px)/1 Georgia,'Times New Roman',serif;letter-spacing:.06em;text-transform:uppercase}
.${P}dateline{flex:none;display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline;padding:5px 14px;background:${C.ink};color:${C.paper2};font:700 12px/1.3 Georgia,serif;letter-spacing:.08em;text-transform:uppercase}
.${P}dateline span:last-child{font:400 13px/1.3 var(--g-body,system-ui,sans-serif);letter-spacing:0;text-transform:none;flex:1 1 220px}
.${P}main{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:12px 16px;padding:12px 14px;align-items:flex-start;justify-content:center;min-height:0}
.${P}left{flex:0 1 auto;max-width:100%;display:flex;flex-direction:column;gap:6px;min-width:0}
.${P}cwrap{position:relative;line-height:0}
.${P}cv{display:block;background:${C.paper};cursor:crosshair;outline:none;touch-action:manipulation}
.${P}cv:focus-visible{outline:3px solid ${C.mag};outline-offset:3px}
.${P}hint{min-height:2.6em;font:400 13px/1.3 var(--g-body,system-ui,sans-serif);color:#2a271e;max-width:760px}
.${P}hint b{font-family:Georgia,serif}
.${P}side{flex:1 1 280px;max-width:330px;min-width:250px;display:grid;gap:10px}
.${P}box{background:${C.paper2};border:4px solid ${C.ink};padding:8px 10px;box-shadow:4px 4px 0 ${C.ink}}
.${P}box h3{margin:0 0 4px;font:900 13px/1.2 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:${C.rust}}
.${P}row2{display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap}
.${P}tickbox{position:relative;width:150px;flex:none;line-height:0}
.${P}tickbox img,.${P}windbox img{width:100%;height:auto;display:block}
.${P}tickn{position:absolute;left:55%;top:11.6%;width:38%;height:46.6%;display:flex;align-items:center;justify-content:center;font:900 34px/1 Georgia,serif;color:${C.ink};background:rgba(255,255,255,.55)}
.${P}ticksq{position:absolute;left:8%;top:71.7%;width:84%;height:13.3%;display:flex;gap:7.5%}
.${P}ticksq i{flex:1;background:${C.rust};opacity:0}
.${P}ticksq i.on{opacity:.85}
.${P}tickfb{width:150px;height:90px;border:4px solid ${C.ink};background:${C.paper};display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 13px/1 Georgia,serif;letter-spacing:.14em}
.${P}tickfb b{font-size:34px;letter-spacing:0}
.${P}windbox{width:116px;flex:none;line-height:0;position:relative}
.${P}windbox .${P}warr{transition:transform .5s}
.${P}windfb{width:116px;height:70px;border:4px solid ${C.ink};background:${C.paper};font:900 28px/62px Georgia,serif;text-align:center}
.${P}portrait{width:120px;flex:none;line-height:0}
.${P}portrait img{width:100%;height:auto;display:block;border:3px solid ${C.ink}}
.${P}portfb{width:120px;height:160px;border:3px solid ${C.ink};background:${C.paper};display:flex;align-items:flex-end;justify-content:center;font:900 14px/1.2 Georgia,serif;letter-spacing:.14em;padding-bottom:6px;line-height:1.2}
.${P}gauge{position:relative;line-height:0;width:100%;max-width:300px}
.${P}gauge img{width:100%;height:auto;display:block}
.${P}gfill{position:absolute;left:14.58%;top:33.3%;height:33.3%;width:0;background:#F2C14E;border-radius:6px;max-width:82.5%}
.${P}gfb{height:22px;border:3px solid ${C.ink};background:${C.paper};position:relative;line-height:1}
.${P}gfb i{position:absolute;left:0;top:0;bottom:0;background:#F2C14E;width:0}
.${P}glab{font:700 13px/1.3 var(--g-body,system-ui,sans-serif);margin-top:4px}
.${P}pips{display:flex;gap:5px;margin:4px 0}
.${P}pips i{width:20px;height:20px;border:3px solid ${C.ink};background:${C.paper};border-radius:50%}
.${P}pips i.on{background:${C.yel}}
.${P}tline{font:900 13px/1.3 Georgia,serif;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
.${P}tools{display:flex;flex-wrap:wrap;gap:8px}
.${P}b{font:900 14px Georgia,serif;letter-spacing:.06em;text-transform:uppercase;color:${C.ink};background:${C.paper};border:3px solid ${C.ink};padding:8px 12px;min-height:46px;cursor:pointer;box-shadow:3px 3px 0 ${C.ink}}
.${P}b:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ${C.ink}}
.${P}b[aria-pressed=true]{background:${C.yel}}
.${P}b.${P}go{background:${C.cyan}}
.${P}b.${P}run{background:${C.paper2}}
.${P}b:focus-visible{outline:3px solid ${C.mag};outline-offset:2px}
.${P}b:disabled{opacity:.45;cursor:default}
.${P}crawl{max-height:170px;overflow:auto;font-size:13px;line-height:1.35;display:grid;gap:3px}
.${P}crawl div{border-bottom:1px dotted ${C.grey};padding-bottom:2px}
.${P}crawl em{color:${C.rust};font:900 11px Georgia,serif;letter-spacing:.12em;text-transform:uppercase;font-style:normal}
.${P}crawl small{display:block;color:#4a463a}
.${P}none{color:#4a463a;font-size:13px}
.${P}foot{flex:none;height:22px;background:center/100% 100% no-repeat}
.${P}intro{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:14px;box-sizing:border-box;overflow:auto;background:rgba(20,20,20,.72)}
.${P}card{max-width:640px;width:100%;margin:auto 0;background:${C.paper2};border:5px solid ${C.ink};outline:5px double ${C.paper2};box-shadow:8px 8px 0 ${C.ink};padding:14px 18px 18px;box-sizing:border-box}
.${P}kick{font:900 11px Georgia,serif;letter-spacing:.2em;text-transform:uppercase;color:${C.rust}}
.${P}card h2{margin:4px 0 8px;font:900 32px/1 Georgia,serif;letter-spacing:.01em;text-transform:uppercase}
.${P}card blockquote{margin:0 0 10px;padding:7px 12px;background:${C.paper};border-left:6px solid ${C.mag};font:italic 14px/1.35 Georgia,serif}
.${P}card blockquote cite{display:block;font:600 11px var(--g-body,sans-serif);letter-spacing:.08em;margin-top:4px;font-style:normal}
.${P}card ul{margin:0 0 8px;padding:0;list-style:none;display:grid;gap:5px}
.${P}card li{font-size:14px;line-height:1.35}
.${P}card li i{display:inline-block;min-width:74px;background:${C.ink};color:${C.paper2};padding:1px 6px;margin-right:6px;font:700 11px var(--g-body,sans-serif);letter-spacing:.1em;text-transform:uppercase;font-style:normal}
.${P}note{font-size:12px;color:#55524a;margin:0 0 6px}
.${P}pages{display:grid;gap:8px;margin-top:10px}
.${P}pages button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;font:inherit;color:${C.ink};background:${C.paper};border:4px solid ${C.ink};padding:8px 12px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink};min-height:48px}
.${P}pages button b{font:900 16px Georgia,serif;letter-spacing:.04em;text-transform:uppercase}
.${P}pages button span{font-size:13px;color:#4a463a}
.${P}pages button:focus-visible{outline:3px solid ${C.mag};outline-offset:3px}
.${P}pages button.${P}next{background:${C.yel}}
.${P}stamp{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(20,20,20,.5);pointer-events:none}
.${P}stamp span{transform:rotate(-7deg);border:6px solid ${C.red};color:${C.red};background:${C.paper2};padding:8px 22px;font:900 clamp(22px,6vw,40px)/1 Georgia,serif;letter-spacing:.06em;text-transform:uppercase;text-align:center}
@media (max-width:700px){
 .${P}side{max-width:none;flex-basis:100%}
 .${P}main{padding:8px 10px;gap:8px}
 .${P}card h2{font-size:26px}
 .${P}dateline span:last-child{display:none}
}
@media (prefers-reduced-motion:reduce){.${P}b:active{transform:none}.${P}windbox .${P}warr{transition:none}}
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const DIRS = { E: [1, 0], S: [0, 1], W: [-1, 0], N: [0, -1] };

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const has = (id) => { try { return !!(api.art && api.art.has(id)); } catch { return false; } };
    const url = (id) => (has(id) ? api.art.url(id) : "");
    const sget = (k, d) => { try { const v = api.shared.get(k, d); return v == null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { api.shared.set(k, v); } catch { /* storage off */ } };
    const mget = (k, d) => { try { const v = api.store.get(k, d); return v == null ? d : v; } catch { return d; } };
    const mset = (k, v) => { try { api.store.set(k, v); } catch { /* storage off */ } };
    let rnd; try { rnd = api.rng(); if (typeof rnd !== "function") rnd = Math.random; } catch { rnd = Math.random; }

    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    let raf = 0, alive = true, ro = null;
    const lastFrameMs = [];

    // ---- DOM ------------------------------------------------------------------------------------------------------
    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = P + "root";
    const pageArt = url("bloom-page");
    if (pageArt) wrap.style.backgroundImage = `url(${pageArt})`;
    wrap.style.backgroundSize = "cover";
    wrap.innerHTML = `
<div class="${P}mast" role="img" aria-label="The Morning Bulletin"><b class="${P}mastfb">The Morning Bulletin</b></div>
<div class="${P}dateline"><span class="${P}date"></span><span class="${P}where"></span></div>
<div class="${P}main">
  <div class="${P}left">
    <div class="${P}cwrap"><canvas class="${P}cv" tabindex="0" role="application" aria-label="The district grid. Arrow keys move the cursor, Enter acts on the cell, N advances the tick."></canvas></div>
    <div class="${P}hint" aria-live="polite"></div>
    <div class="${P}box"><div class="${P}tline"></div><div class="${P}tools" role="group" aria-label="Tools and tick"></div></div>
  </div>
  <div class="${P}side">
    <div class="${P}box"><div class="${P}row2">
      <div class="${P}tickbox"></div>
      <div class="${P}windbox"></div>
      <div class="${P}portrait"></div>
    </div></div>
    <div class="${P}box ${P}state"></div>
    <div class="${P}box"><h3>The crawl</h3><div class="${P}crawl" aria-live="polite"></div></div>
  </div>
</div>
<div class="${P}foot"></div>`;
    root.append(style, wrap);
    const $ = (s) => wrap.querySelector(s);
    const mastEl = $("." + P + "mast"), dateEl = $("." + P + "date"), whereEl = $("." + P + "where");
    const cv = $("." + P + "cv"), g2 = cv.getContext("2d"), hintEl = $("." + P + "hint");
    const tickBox = $("." + P + "tickbox"), windBox = $("." + P + "windbox"), portEl = $("." + P + "portrait");
    const datelineEl = $("." + P + "dateline"), toolsBox = $("." + P + "tline").parentNode, tlineEl = $("." + P + "tline"), stateEl = $("." + P + "state"), toolsEl = $("." + P + "tools"), crawlEl = $("." + P + "crawl"), footEl = $("." + P + "foot");
    if (has("bloom-masthead")) { mastEl.style.backgroundImage = `url(${url("bloom-masthead")})`; $("." + P + "mastfb").style.display = "none"; }

    // ---- art ---------------------------------------------------------------------------------------------------------
    const imgs = {};
    ["bloom-cell", "bloom-cell-absorbed", "bloom-cell-burned", "bloom-cell-marked", "bloom-cell-spore-1", "bloom-cell-spore-2", "bloom-cell-spore-3",
      "bloom-cordon", "bloom-pane", "bloom-crew", "bloom-resident", "bloom-twins-line", "bloom-source"].forEach((id) => {
      if (has(id)) api.art.img(id).then((im) => { if (alive && im) { imgs[id] = im; dirty = true; } }).catch(() => {});
    });

    // ---- state ---------------------------------------------------------------------------------------------------------
    let page = null, W = 9, H = 7, cells = [], edges = new Set(), twinRuns = [], crews = [], tick = 0, ap = AP_MAX, load = 0, wind = "E";
    let phase = "intro", tool = "absorb", carrying = -1, cauldronUsed = false, twinsUsed = false, settlementLost = false;
    let toolsKey = 0, tb = {}, cx = 0, cy = 0, hover = null, running = false, marked = [], firstSettle = -1;
    let fx = [], dirty = true, S = 1, DPR = 1, GW = 0, GH = 0, nCrews = 0, followingAtStart = 0, observers = true, windWarned = false;
    const idx = (x, y) => y * W + x;
    const cellAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? null : cells[idx(x, y)]);
    const say = (s) => { hintEl.textContent = s; };

    function edgeKey(ax, ay, bx, by) { return bx !== ax ? `${Math.min(ax, bx)},${ay},E` : `${ax},${Math.min(ay, by)},S`; }
    const blocked = (ax, ay, bx, by) => edges.has(edgeKey(ax, ay, bx, by));
    const canInfect = (c) => c && c.kind === "clean" && !c.cordon;

    function setup(i) {
      page = PAGES[i];
      W = page.W; H = page.H;
      cells = []; edges = new Set(); twinRuns = []; crews = []; fx = []; marked = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const h = ((x * 73856093) ^ (y * 19349663) ^ (page.n * 83492791)) >>> 0;
        cells.push({ x, y, kind: "clean", lvl: 0, cordon: false, pier: false, res: 1 + (h % 3), named: null, settle: page.n === 2 && x >= 8, born: 0 });
      }
      (page.piers || []).forEach(([x, y]) => { const c = cellAt(x, y); c.pier = true; c.res = 0; });
      page.named.forEach((nm) => { const c = cellAt(nm.x, nm.y); c.named = nm; c.res = Math.max(c.res, 1); });
      page.cloud.forEach(([x, y, l]) => { const c = cellAt(x, y); c.kind = "spore"; c.lvl = l; });
      tick = 0; ap = AP_MAX; wind = page.n === 1 ? WIND1 : "S"; settlementLost = false; firstSettle = -1; carrying = -1;
      cauldronUsed = false; twinsUsed = false; running = false; windWarned = false;
      cx = page.n === 1 ? 2 : 3; cy = 3;
      if (page.n === 1) {
        const l0 = Number(sget("load", 0)); load = clamp(Number.isFinite(l0) ? Math.round(l0) : 0, 0, 100);
        tool = "absorb"; nCrews = 0;
      } else {
        const f = sget("following", null);
        followingAtStart = f == null ? 60 : clamp(Number(f) || 0, 0, 100);      // an unplayed run: a typical Following
        observers = sget("observers_choice", "with_them") !== "left_them";
        nCrews = Math.floor(followingAtStart / 10) + (observers ? 3 : 0);
        for (let k = 0; k < nCrews; k++) crews.push({ at: -1, moved: false });
        tool = "cordon";
      }
    }

    // ---- the rules ---------------------------------------------------------------------------------------------------------
    const sporeCount = () => cells.reduce((n, c) => n + (c.kind === "spore" ? 1 : 0), 0);
    const markedCount = () => cells.reduce((n, c) => n + (c.kind === "marked" ? 1 : 0), 0);

    function markCell(c) {
      c.kind = "marked"; c.lvl = 0; c.born = performance.now();
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "mark" });
      if (c.named) marked.push({ name: c.named.name, want: c.named.want, settle: !!c.named.settle });
      if (c.settle && !settlementLost) { settlementLost = true; }
    }
    function infect(c) {
      c.kind = "spore"; c.lvl = 1; c.born = performance.now();
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "spore" });
      if (c.settle && !settlementLost) { settlementLost = true; firstSettle = tick; }
    }

    function resolveTick() {
      const [dx, dy] = DIRS[wind];
      const perp = dx ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
      const hit = new Set();
      const spores = cells.filter((c) => c.kind === "spore");
      for (const c of spores) {
        if (c.cordon) continue;                              // sheeting seals a spore cell it covers (added)
        const tries = [[dx, dy, 1], [perp[0][0], perp[0][1], 0.3], [perp[1][0], perp[1][1], 0.3]];
        for (const [ox, oy, pr] of tries) {
          const t = cellAt(c.x + ox, c.y + oy);
          if (!canInfect(t) || t.pier || blocked(c.x, c.y, t.x, t.y)) continue;
          if (pr >= 1 || rnd() < pr) hit.add(idx(t.x, t.y));
        }
      }
      for (const c of spores) { c.lvl++; if (c.lvl > 3) markCell(c); }
      hit.forEach((i) => infect(cells[i]));
      tick++;
      if (page.windTurn && tick === page.windTurn) {        // the wind turns east, the second release lands
        wind = "E";
        for (let y = 1; y <= 5; y++) { const t = cellAt(page.seedCol, y); if (canInfect(t)) infect(t); }
      }
      crews.forEach((cr) => { cr.moved = false; cr.lifted = false; });
      carrying = -1; ap = AP_MAX;
      dirty = true;
    }
    const seedPending = () => !!(page && page.windTurn && tick < page.windTurn);

    // ---- actions -------------------------------------------------------------------------------------------------------------
    const crewAt = (i) => crews.findIndex((cr) => cr.at === i);
    function actAbsorb(c) {
      if (ap <= 0) { say("No actions left this tick. Advance the tick."); return; }
      if (c.pier) return;
      if (c.kind === "marked") { say("Already changed. Absorbing cannot undo it."); return; }
      if (c.kind !== "spore") { say("Nothing on that block to absorb."); return; }
      c.kind = "absorbed"; c.lvl = 0; ap--; load = clamp(load + 15, 0, 100);
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "clear" });
      say(`Absorbed. The block is clear. Load ${load}.${c.named ? ` ${c.named.name} is untouched.` : ""}`);
      refresh();
    }
    function actPane(c, dir) {
      const [ox, oy] = DIRS[dir];
      const t = cellAt(c.x + ox, c.y + oy);
      if (!t) { say("That edge is the district's own boundary."); return; }
      if (ap <= 0) { say("No actions left this tick. Advance the tick."); return; }
      if (load < 10) { say(`A pane needs Load. You have ${load}; it costs 10. Absorb a spore block first.`); return; }
      if (blocked(c.x, c.y, t.x, t.y)) { say("There is already a pane on that edge."); return; }
      edges.add(edgeKey(c.x, c.y, t.x, t.y));
      ap--; load -= 10;
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "pane" });
      say(`Pane raised. Nothing spreads across that edge for the rest of the page. Load ${load}.`);
      refresh();
    }
    function actCordon(c) {
      if (c.pier) { say("A pier. Nothing spreads there; no crew is needed."); return; }
      const here = crewAt(idx(c.x, c.y));
      if (here >= 0) {                                     // pick the crew up, once a tick
        if (crews[here].moved) { say("That crew has moved this tick. It can move again after the tick."); return; }
        carrying = here; crews[here].at = -1; crews[here].lifted = true;
        say("Crew lifted. Tap the block to put it on."); refresh(); return;
      }
      if (c.kind === "marked" || c.kind === "burned" || c.kind === "absorbed") { say("Nothing to seal on that block."); return; }
      let k = carrying;
      if (k < 0) k = crews.findIndex((cr) => cr.at < 0 && !cr.lifted && !cr.moved);
      if (k < 0) { say(crews.every((cr) => cr.at >= 0) ? "Every crew is on a block. Tap one to lift it, then tap where it goes." : "No crew can move now. Wait for the next tick."); return; }
      crews[k].at = idx(c.x, c.y); crews[k].moved = true; crews[k].lifted = false; c.cordon = true; carrying = -1;
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "pane" });
      say(`Cordon laid. ${crews.filter((cr) => cr.at >= 0).length} of ${nCrews} crews are out.`);
      refresh();
    }
    function syncCordons() { cells.forEach((c) => { c.cordon = false; }); crews.forEach((cr) => { if (cr.at >= 0) cells[cr.at].cordon = true; }); }
    function actCauldron(c) {
      if (cauldronUsed) return;
      if (c.pier || c.kind === "marked") { say("Not there. He can burn a spore block or a clean one clear."); return; }
      c.kind = "burned"; c.lvl = 0; cauldronUsed = true; tool = "cordon";
      fx.push({ x: c.x, y: c.y, t: performance.now(), k: "clear" });
      say("The Cauldron burns the block clear, and empties himself doing it. He signs: once.");
      refresh();
    }
    function actTwins(c) {
      if (twinsUsed) return;
      const x0 = clamp(c.x - 2, 0, W - 5), y = c.y;
      if (y >= H - 1) { say("The line goes under a row. Choose a row above the last."); return; }
      for (let k = 0; k < 5; k++) edges.add(edgeKey(x0 + k, y, x0 + k, y + 1));
      twinRuns.push({ x: x0, y });
      twinsUsed = true; tool = "cordon";
      say("The Twins collapse a line of five edges. They pay \"weeks of agonizing regeneration\" (The Recoil). Once.");
      refresh();
    }

    function cellAction(x, y, dir) {
      if (phase !== "play" || running) return;
      const c = cellAt(x, y); if (!c) return;
      cx = x; cy = y;
      if (page.n === 1) {
        if (tool === "pane") { actPane(c, dir || "E"); } else actAbsorb(c);
      } else {
        if (tool === "cauldron") actCauldron(c);
        else if (tool === "twins") actTwins(c);
        else actCordon(c);
        syncCordons();
      }
      dirty = true;
    }

    function advance() {
      if (phase !== "play") return;
      syncCordons();
      resolveTick();
      refresh();
      const n = sporeCount();
      const pend = seedPending();
      if (tick === SEED_TICK - 3 && page.n === 2) say("The second release is marked in dashes. At tick 6 the wind turns east.");
      else if (page.n === 2 && tick === SEED_TICK - 1) say("Next tick the wind turns east and the second release lands along the dashed column.");
      else if (page.n === 2 && tick === SEED_TICK) say("The wind has turned east. The haze comes for the settlement.");
      else say(`Tick ${tick}. ${n} spore block${n === 1 ? "" : "s"} on the page, ${markedCount()} marked.`);
      if ((n === 0 && !pend) || tick >= TICKS) finish();
    }

    function runAuto() {
      if (phase !== "play") return;
      running = true; refresh();
      const step = () => {
        if (!alive || phase !== "play" || !running) return;
        advance();
        if (phase === "play" && running) later(step, RM ? 120 : 650);
      };
      later(step, 200);
    }
    function stopAuto() { running = false; refresh(); }

    // ---- finish -------------------------------------------------------------------------------------------------------------------
    function finish() {
      if (phase !== "play") return;
      phase = "final"; running = false;
      cells.filter((c) => c.kind === "spore").forEach(markCell);       // the page closes: the haze has them
      const nMarked = markedCount();
      const key = page.n;
      const names = marked.slice();
      mset("lost" + key, nMarked); mset("names" + key, names);
      const other = key === 1 ? 2 : 1;
      const lostSum = nMarked + (Number(mget("lost" + other, 0)) || 0);
      sset("bloom.cells_lost", lostSum);
      const prev = [].concat(mget("names" + other, []) || []);
      const all = key === 1 ? names.concat(prev) : prev.concat(names);
      sset("bloom.marked_names", all.map((n) => ({ name: n.name, want: n.want })));
      let outcome, text, stampText;
      const nameList = (arr) => arr.map((n) => `${n.name} (wants ${n.want})`).join("; ");
      if (key === 1) {
        sset("load", load);
        outcome = nMarked <= WIN_MARKED ? "win" : "done";
        stampText = outcome === "win" ? "Contained" : "Spread";
        text = `${outcome === "win" ? "Contained" : "The page closes with the haze still moving"}. ${nMarked} of ${W * H} blocks marked; Load ${load}. `
          + (names.length ? `Marked: ${nameList(names)}. The crawl will call each of them contained.` : "Nobody the page names was marked. The crawl will still say contained.");
      } else {
        const lost = settlementLost;
        sset("bloom.crews", nCrews);
        sset("bloom.settlement_lost", lost);
        const gave = !!mget("heldBonus", false);
        const fol = Number(sget("following", followingAtStart)) || 0;
        if (!lost && !gave) { sset("following", clamp(fol + 5, 0, 100)); mset("heldBonus", true); }
        else if (lost && gave) { sset("following", clamp(fol - 5, 0, 100)); mset("heldBonus", false); }
        outcome = lost ? "done" : "win";
        stampText = lost ? "The east front fell" : "The settlement holds";
        const sMarked = names.filter((n) => n.settle);
        text = lost
          ? `The haze reached the settlement${firstSettle >= 0 ? ` at tick ${firstSettle}` : ""}. ${nMarked} blocks marked. ${nCrews < 5 ? `He had ${nCrews} crew${nCrews === 1 ? "" : "s"}; the east front needs five, and the page cannot be held with fewer. ` : "Five cordons were not across the plain in time. "}`
            + (sMarked.length ? `In the settlement: ${nameList(sMarked)}.` : "")
          : `The east front holds: the plain between the piers is sealed and the settlement is not taken. ${nMarked} blocks marked elsewhere. Following +5.${names.length ? ` Marked: ${nameList(names)}.` : ""}`;
      }
      refresh();
      const st = document.createElement("div");
      st.className = P + "stamp"; st.innerHTML = `<span>${esc(stampText)}</span>`;
      wrap.appendChild(st);
      later(() => { if (alive) api.end({ outcome, text }); }, RM ? 0 : 900);
    }

    // ---- panel -----------------------------------------------------------------------------------------------------------------
    const tickImg = has("bloom-tick"), windImg = has("bloom-wind");
    tickBox.innerHTML = tickImg
      ? `<img alt="" src="${url("bloom-tick")}" draggable="false"><div class="${P}tickn"></div><div class="${P}ticksq">${"<i></i>".repeat(12)}</div>`
      : `<div class="${P}tickfb">TICK<b class="${P}tickn2"></b></div>`;
    windBox.innerHTML = windImg ? `<div class="${P}warr"><img alt="" src="${url("bloom-wind")}" draggable="false"></div>` : `<div class="${P}windfb"><span class="${P}warr" style="display:inline-block">&rarr;</span></div>`;
    const portId = "bloom-portrait-catalyst";
    portEl.innerHTML = has(portId) ? `<img alt="Newsprint portrait of Elena Rostova, captioned CATALYST" src="${url(portId)}" draggable="false">` : `<div class="${P}portfb">CATALYST</div>`;
    const tickN = () => tickBox.querySelector("." + P + "tickn") || tickBox.querySelector("." + P + "tickn2");
    const warr = windBox.querySelector("." + P + "warr");
    const mcalm = has("hud-margin-calm") ? url("hud-margin-calm") : "";

    function refresh() {
      tickN().textContent = String(tick);
      tickBox.querySelectorAll("." + P + "ticksq i").forEach((el, i) => el.classList.toggle("on", i < tick));
      warr.style.transform = `rotate(${wind === "S" ? 90 : 0}deg)`;
      windBox.setAttribute("aria-label", `Wind: blowing ${wind === "S" ? "south" : "east"}`);
      if (page) {
        dateEl.textContent = `${page.caption} · ${page.chapter} · ${page.who}`;
        whereEl.textContent = page.where;
      }
      const on = phase === "play" && !running;
      tlineEl.textContent = `Tick ${tick} of ${TICKS} · wind ${wind === "S" ? "south" : "east"}${page && page.n === 1 ? ` · ${ap} of ${AP_MAX} actions · Load ${load}` : ""}`;
      let html = "";
      if (page && page.n === 1) {
        const hope = has("hud-word-hope") ? `<img alt="HOPE" src="${url("hud-word-hope")}" style="width:96px;height:auto;display:block;flex:none" draggable="false">` : `<b style="font:900 18px Georgia,serif">HOPE</b>`;
        const gauge = has("hud-load")
          ? `<div class="${P}gauge"><img alt="" src="${url("hud-load")}" draggable="false"><div class="${P}gfill" style="width:${(load / 100) * 82.5}%"></div></div>`
          : `<div class="${P}gfb"><i style="width:${load}%"></i></div>`;
        html = `<h3>Aegis</h3><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${hope}<div style="flex:1 1 160px;min-width:150px">${gauge}<div class="${P}glab">Load ${load} of 100 · pane costs 10</div></div></div>
          <div class="${P}glab">Actions this tick</div><div class="${P}pips" role="img" aria-label="${ap} of ${AP_MAX} actions left">${Array.from({ length: AP_MAX }, (_, i) => `<i class="${i < ap ? "on" : ""}"></i>`).join("")}</div>`;
      } else if (page) {
        const out = crews.filter((c) => c.at >= 0).length, mv = crews.filter((c) => c.moved).length;
        html = `<h3>Dr. Tox</h3><div class="${P}glab">Crews: ${out} out of ${nCrews}${carrying >= 0 ? " · one lifted" : ""}</div>
          <div class="${P}glab">Moved this tick: ${mv} of ${nCrews}</div>
          <div class="${P}glab" style="color:${nCrews >= 5 ? "inherit" : C.red}">${nCrews >= 5 ? "Five cordons between the piers hold the east front." : `Fewer than five crews: the east front cannot be held.`}</div>
          <div class="${P}glab">Following ${followingAtStart}${observers ? " · the Observers are with him" : " · the Observers are not here"}</div>`;
      }
      stateEl.innerHTML = html;
      // tools: built once per page, then only their state changes (so focus survives a click)
      if (page && toolsKey !== page.n) {
        toolsKey = page.n; toolsEl.innerHTML = ""; tb = {};
        const mk = (key, label, fn, cls) => {
          const b = document.createElement("button");
          b.type = "button"; b.className = P + "b" + (cls ? " " + P + cls : ""); b.textContent = label;
          b.addEventListener("click", fn); toolsEl.appendChild(b); tb[key] = b;
        };
        if (page.n === 1) {
          mk("absorb", "Absorb", () => { tool = "absorb"; say("Absorb: tap a spore block. Clears it; Load +15."); refresh(); });
          mk("pane", "Pane", () => { tool = "pane"; say("Pane: tap near a block's edge, or drag from one block to the next. Costs 10 Load."); refresh(); });
        } else {
          mk("cordon", "Cordon", () => { tool = "cordon"; say("Cordon: tap a block to lay a crew on it; tap a crew to lift it; tap again to put it down."); refresh(); });
          if (observers) {
            mk("cauldron", "Cauldron", () => { tool = "cauldron"; say("Cauldron: tap one block to burn it clear. Once, and it empties him."); refresh(); });
            mk("twins", "Twins", () => { tool = "twins"; say("Twins: tap a block; a line of five edges collapses under its row. Once, at a cost."); refresh(); });
          }
        }
        mk("next", "Next tick", advance, "go");
        mk("run", "Let it run", () => (running ? stopAuto() : runAuto()), "run");
      }
      if (page) {
        for (const k of ["absorb", "pane", "cordon", "cauldron", "twins"]) {
          if (!tb[k]) continue;
          tb[k].setAttribute("aria-pressed", tool === k ? "true" : "false");
          tb[k].disabled = !on || (k === "cauldron" && cauldronUsed) || (k === "twins" && twinsUsed);
        }
        tb.next.disabled = !on;
        tb.run.textContent = running ? "Stop" : "Let it run";
        tb.run.disabled = phase !== "play";
      }
      // crawl
      crawlEl.innerHTML = "";
      if (!marked.length) { const d = document.createElement("div"); d.className = P + "none"; d.textContent = "Nothing on the wire yet."; crawlEl.appendChild(d); }
      marked.forEach((m) => {
        const d = document.createElement("div");
        d.innerHTML = `<em>Contained</em> ${esc(m.name)}<small>wanted ${esc(m.want)}</small>`;
        crawlEl.appendChild(d);
      });
      // Bloom 2 keeps Dr. Tox's amber margin line at the page foot
      footEl.style.display = page && page.n === 2 && mcalm ? "" : "none";
      if (mcalm) footEl.style.backgroundImage = `url(${mcalm})`;
      dirty = true;
    }

    // ---- the canvas --------------------------------------------------------------------------------------------------------------
    const bakeCache = {};
    function bake(id, w, h) {
      const im = imgs[id]; if (!im) return null;
      const pw = Math.max(1, Math.round(w * S * DPR)), ph = Math.max(1, Math.round(h * S * DPR));
      const key = `${id}|${pw}|${ph}`;
      if (bakeCache[key]) return bakeCache[key];
      const c = document.createElement("canvas"); c.width = pw; c.height = ph;
      try { c.getContext("2d").drawImage(im, 0, 0, pw, ph); } catch { return null; }
      return (bakeCache[key] = c);
    }
    const put = (g, id, x, y, w, h) => { const c = bake(id, w, h); if (c) { g.drawImage(c, x, y, w, h); return true; } return false; };

    function layout() {
      if (!page) { GW = 9 * CS + 2 * PAD; GH = 7 * CS + 2 * PAD; } else { GW = W * CS + 2 * PAD; GH = H * CS + 2 * PAD; }
      const rw = wrap.clientWidth || 360, rh = wrap.clientHeight || 640;
      const wide = rw >= 900;
      const availW = wide ? Math.max(300, rw - 28 - 16 - 330) : rw - 20;
      const availH = wide ? Math.max(260, rh - mastEl.offsetHeight - datelineEl.offsetHeight - toolsBox.offsetHeight - hintEl.offsetHeight - 40) : 1e9;
      S = clamp(Math.min(availW / GW, availH / GH), 0.3, 1.25);
      DPR = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.floor(GW * S), ch = Math.floor(GH * S);
      cv.style.width = cw + "px"; cv.style.height = ch + "px";
      const pw = Math.round(cw * DPR), ph = Math.round(ch * DPR);
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
      S = cw / GW;
      dirty = true;
    }

    const cellXY = (x, y) => [PAD + x * CS, PAD + y * CS];
    function dots(g, x, y, w, h, col, step, r, a) {
      g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = col; g.globalAlpha = a == null ? 1 : a;
      for (let yy = y + step / 2, row = 0; yy < y + h; yy += step, row++) for (let xx = x + (row % 2 ? step : step / 2); xx < x + w; xx += step) { g.beginPath(); g.arc(xx, yy, r, 0, 6.3); g.fill(); }
      g.restore();
    }
    function drawCell(g, c, t) {
      const [x, y] = cellXY(c.x, c.y);
      if (c.pier) {                                        // a pier: hatched, nothing passes (added)
        g.fillStyle = "#b9ae88"; g.fillRect(x, y, CS, CS);
        g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath();
        for (let k = -CS; k < CS; k += 12) { g.moveTo(x + k, y + CS); g.lineTo(x + k + CS, y); }
        g.stroke(); g.strokeRect(x + 1, y + 1, CS - 2, CS - 2);
        return;
      }
      const id = c.kind === "spore" ? "bloom-cell-spore-" + c.lvl : c.kind === "marked" ? "bloom-cell-marked" : c.kind === "absorbed" ? "bloom-cell-absorbed" : c.kind === "burned" ? "bloom-cell-burned" : "bloom-cell";
      let age = 1;
      if (!RM && c.born) age = clamp((t - c.born) / 420, 0, 1);
      if (!put(g, id, x, y, CS, CS)) {                     // fallback: a Ben-Day block
        g.fillStyle = C.paper2; g.fillRect(x, y, CS, CS);
        if (c.kind === "clean") dots(g, x, y, CS, CS, C.cyan, 9, 1.4, 0.7);
        else if (c.kind === "spore") { dots(g, x, y, CS, CS, C.rust, 8 - c.lvl, 1.6 + c.lvl * 0.5); dots(g, x, y, CS, CS, C.ochre, 9, 1.2, 0.8); }
        else if (c.kind === "marked") { dots(g, x, y, CS, CS, C.mag, 7, 2.2); dots(g, x, y, CS, CS, C.ink, 11, 1, 0.8); }
        else if (c.kind === "absorbed") dots(g, x, y, CS, CS, C.cyan, 6, 1.6, 0.9);
        else if (c.kind === "burned") { g.fillStyle = "#3a3328"; g.fillRect(x, y, CS, CS); dots(g, x, y, CS, CS, C.yel, 10, 1.4, 0.9); }
        g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, CS - 2, CS - 2);
      }
      if (c.kind === "spore" && age < 1) {                 // a new block pulses once
        g.save(); g.globalAlpha = 0.5 * (1 - age); g.strokeStyle = C.rust; g.lineWidth = 5;
        const o = 14 * (1 - age); g.strokeRect(x - o, y - o, CS + 2 * o, CS + 2 * o); g.restore();
      }
      if (c.kind !== "marked") {                           // residents, small printed figures
        const n = c.res, h = 24, w = 12;
        for (let k = 0; k < n; k++) {
          const rx = x + 12 + k * 16, ry = y + CS - h - 6;
          if (!put(g, "bloom-resident", rx, ry, w, h)) { g.fillStyle = C.ink; g.beginPath(); g.arc(rx + 6, ry + 5, 4, 0, 6.3); g.fill(); g.fillRect(rx + 3, ry + 9, 6, 13); }
        }
      }
      if (c.named) {                                       // the name tag
        g.fillStyle = "#fff"; g.strokeStyle = C.ink; g.lineWidth = 2; g.fillRect(x + 5, y + 5, 15, 15); g.strokeRect(x + 5, y + 5, 15, 15);
        g.fillStyle = C.ink; g.font = "900 11px Georgia,serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.named.name[0], x + 12.5, y + 13);
      }
      if (c.cordon) {
        if (!put(g, "bloom-cordon", x, y, CS, CS)) {
          g.fillStyle = C.ink; g.fillRect(x + 6, y + 30, CS - 12, 12); dots(g, x + 8, y + 32, CS - 16, 8, C.cyan, 5, 1.4);
          g.strokeStyle = C.ink; g.lineWidth = 3; g.setLineDash([8, 5]); g.strokeRect(x + 2, y + 2, CS - 4, CS - 4); g.setLineDash([]);
        }
        const h = 34, w = 17;
        if (!put(g, "bloom-crew", x + CS - w - 6, y + CS - h - 4, w, h)) { g.fillStyle = C.mag; g.fillRect(x + CS - 20, y + CS - 34, 12, 30); }
      }
    }
    function drawEdge(g, ax, ay, bx, by) {
      const horiz = bx !== ax;                              // an edge between (ax,ay) and (bx,by)
      const [x0, y0] = cellXY(Math.min(ax, bx), Math.min(ay, by));
      g.save();
      if (horiz) { g.translate(x0 + CS, y0 + CS / 2); g.rotate(Math.PI / 2); g.translate(-CS / 2, -7); }
      else g.translate(x0, y0 + CS - 7);
      if (!put(g, "bloom-pane", 0, 0, CS, 14)) {
        g.fillStyle = C.yel; g.fillRect(0, 0, CS, 14); g.fillStyle = "#fff6dc"; g.fillRect(0, 5, CS, 4); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(1, 1, CS - 2, 12);
      }
      g.restore();
    }

    function render(t) {
      g2.setTransform(1, 0, 0, 1, 0, 0);
      g2.clearRect(0, 0, cv.width, cv.height);
      g2.setTransform(S * DPR, 0, 0, S * DPR, 0, 0);
      g2.fillStyle = C.paper; g2.fillRect(0, 0, GW, GH);
      dots(g2, 0, 0, GW, GH, C.yel, 14, 1, 0.35);
      if (!page) return;
      for (const c of cells) drawCell(g2, c, t);
      // the second release, dashed on the page from tick 3
      if (page.windTurn && tick >= 3 && tick < page.windTurn) {
        g2.save(); g2.strokeStyle = C.rust; g2.lineWidth = 3; g2.setLineDash([7, 5]);
        for (let y = 1; y <= 5; y++) { const [x, yy] = cellXY(page.seedCol, y); g2.strokeRect(x + 5, yy + 5, CS - 10, CS - 10); }
        g2.setLineDash([]); g2.fillStyle = C.rust; g2.font = "900 11px Georgia,serif"; g2.textAlign = "center";
        const [lx, ly] = cellXY(page.seedCol, 0); g2.fillText("2nd RELEASE", lx + CS / 2, ly + CS / 2 + 4); g2.restore();
      }
      // panes and the Twins' line
      edges.forEach((k) => {
        const [x, y, d] = k.split(","); const ix = +x, iy = +y;
        if (twinRuns.some((r) => d === "S" && iy === r.y && ix >= r.x && ix < r.x + 5)) return;
        d === "E" ? drawEdge(g2, ix, iy, ix + 1, iy) : drawEdge(g2, ix, iy, ix, iy + 1);
      });
      twinRuns.forEach((r) => {
        const [x, y] = cellXY(r.x, r.y);
        const w = 5 * CS, h = (40 / 600) * w;
        g2.save(); g2.translate(x, y + CS - h / 2);
        if (!put(g2, "bloom-twins-line", 0, 0, w, h)) { g2.fillStyle = C.cyan; g2.fillRect(0, 0, w, 10); g2.strokeStyle = C.ink; g2.lineWidth = 3; g2.strokeRect(1, 1, w - 2, 8); }
        g2.restore();
      });
      // the grid's keyline, and the settlement's red edge
      g2.strokeStyle = C.ink; g2.lineWidth = 5; g2.strokeRect(PAD - 2, PAD - 2, W * CS + 4, H * CS + 4);
      if (page.n === 2) {
        const [sx, sy] = cellXY(8, 0);
        g2.strokeStyle = C.red; g2.lineWidth = 8; g2.strokeRect(sx + 4, sy + 4, 2 * CS - 8, H * CS - 8);
        g2.fillStyle = C.red; g2.font = "900 13px Georgia,serif"; g2.textAlign = "center"; g2.textBaseline = "alphabetic"; g2.fillText("SETTLEMENT", sx + CS, sy - 8);
      }
      // the cursor and, with the pane tool, the edge under it
      if (phase === "play") {
        const c0 = hover || { x: cx, y: cy };
        const [x, y] = cellXY(c0.x, c0.y);
        g2.save(); g2.strokeStyle = C.mag; g2.lineWidth = 4; g2.setLineDash([9, 5]); g2.strokeRect(x + 2, y + 2, CS - 4, CS - 4); g2.restore();
        if (page.n === 1 && tool === "pane" && hover && hover.dir) {
          const [ox, oy] = DIRS[hover.dir]; const o = cellAt(hover.x + ox, hover.y + oy);
          if (o) { g2.save(); g2.globalAlpha = 0.6; if (ox) drawEdge(g2, Math.min(hover.x, o.x), hover.y, Math.max(hover.x, o.x), hover.y); else drawEdge(g2, hover.x, Math.min(hover.y, o.y), hover.x, Math.max(hover.y, o.y)); g2.restore(); }
        }
      }
      // fx: ring bursts
      fx = fx.filter((f) => t - f.t < 500);
      if (!RM) fx.forEach((f) => {
        const a = (t - f.t) / 500; const [x, y] = cellXY(f.x, f.y);
        g2.save(); g2.globalAlpha = 1 - a; g2.lineWidth = 4;
        g2.strokeStyle = f.k === "mark" ? C.mag : f.k === "clear" ? C.cyan : f.k === "pane" ? C.yel : C.rust;
        g2.beginPath(); g2.arc(x + CS / 2, y + CS / 2, 10 + a * 40, 0, 6.3); g2.stroke(); g2.restore();
      });
    }

    // ---- pointer, keyboard -----------------------------------------------------------------------------------------------------------
    function toCell(ev) {
      const r = cv.getBoundingClientRect();
      const lx = (ev.clientX - r.left) / r.width * GW - PAD, ly = (ev.clientY - r.top) / r.height * GH - PAD;
      const x = Math.floor(lx / CS), y = Math.floor(ly / CS);
      if (x < 0 || y < 0 || x >= W || y >= H) return null;
      const fx2 = lx / CS - x, fy2 = ly / CS - y;
      const cand = [[fx2, "W"], [1 - fx2, "E"], [fy2, "N"], [1 - fy2, "S"]].filter(([, d]) => cellAt(x + DIRS[d][0], y + DIRS[d][1])).sort((a, b) => a[0] - b[0]);
      return { x, y, dir: cand.length ? cand[0][1] : "E" };
    }
    function describe(c) {
      if (!c) return "";
      const bits = [];
      if (c.pier) return "A pier. Nothing spreads onto it.";
      bits.push(c.kind === "spore" ? `spores, level ${c.lvl}` : c.kind === "marked" ? "marked" : c.kind === "absorbed" ? "absorbed, clear" : c.kind === "burned" ? "burned clear" : "clean");
      if (c.cordon) bits.push("cordoned");
      if (c.settle) bits.push("the settlement");
      if (c.named) bits.push(`${c.named.name}, who wants ${c.named.want}`);
      return `Block ${c.x + 1},${c.y + 1}: ${bits.join("; ")}.`;
    }
    let down = null;
    on(cv, "pointerdown", (e) => { if (phase !== "play") return; down = toCell(e); });
    on(cv, "pointermove", (e) => {
      if (phase !== "play" || e.pointerType === "touch") return;
      const h = toCell(e); hover = h; dirty = true;
      if (h && h.x === cx && h.y === cy) return;
      if (h) { cx = h.x; cy = h.y; }
    });
    on(cv, "pointerleave", () => { hover = null; dirty = true; });
    on(cv, "pointerup", (e) => {
      if (phase !== "play") return;
      const up = toCell(e);
      if (!up) { down = null; return; }
      cx = up.x; cy = up.y;
      if (page.n === 1 && tool === "pane" && down && (down.x !== up.x || down.y !== up.y)) {
        const dxx = up.x - down.x, dyy = up.y - down.y;
        if (Math.abs(dxx) + Math.abs(dyy) === 1) { cellAction(down.x, down.y, dxx === 1 ? "E" : dxx === -1 ? "W" : dyy === 1 ? "S" : "N"); down = null; return; }
      }
      if (down && (down.x === up.x && down.y === up.y)) cellAction(up.x, up.y, up.dir);
      else if (!down) cellAction(up.x, up.y, up.dir);
      else say(describe(cellAt(up.x, up.y)));
      down = null;
    });
    on(cv, "contextmenu", (e) => e.preventDefault());
    on(window, "keydown", (e) => {
      if (!alive || e.ctrlKey || e.metaKey || e.altKey || phase !== "play") return;
      const onCanvas = document.activeElement === cv;
      const k = e.key;
      if (k === "n" || k === "N" || k === ".") { if (!running) { advance(); e.preventDefault(); } return; }
      if (!onCanvas) return;
      const arrow = { ArrowLeft: "W", ArrowRight: "E", ArrowUp: "N", ArrowDown: "S" }[k];
      if (arrow) {
        if (e.shiftKey && page.n === 1) { if (!running) { const prev = tool; tool = "pane"; cellAction(cx, cy, arrow); tool = prev; } }
        else { cx = clamp(cx + DIRS[arrow][0], 0, W - 1); cy = clamp(cy + DIRS[arrow][1], 0, H - 1); hover = null; say(describe(cellAt(cx, cy))); dirty = true; }
        e.preventDefault();
      } else if (k === "Enter" || k === " ") {
        if (!running) cellAction(cx, cy, "E");
        e.preventDefault();
      } else if ((k === "p" || k === "P") && page.n === 1) { tool = tool === "pane" ? "absorb" : "pane"; say(tool === "pane" ? "Pane: Shift+arrow raises one on the cursor block's edge." : "Absorb."); refresh(); }
    });

    // ---- intro and start -------------------------------------------------------------------------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = P + "intro";
    const reached = clamp(mget("reached", 0) | 0, 0, 1);
    intro.innerHTML = `
<div class="${P}card" role="dialog" aria-label="How to play Bloom">
  <div class="${P}kick">Bloom · the morning paper</div>
  <h2>Hold the page</h2>
  <blockquote>${esc(QUOTE)}<cite>${esc(CITE)}</cite></blockquote>
  <ul>
    <li><i>The spread</i>Each tick the wind carries spores to the block downwind, and, one time in three or so, to each block beside it. A spore block shows level 1, 2, 3; after that it is marked: the people in it are changed, and the crawl names them as contained.</li>
    <li><i>Aegis</i>(page 1) Absorb a spore block: it clears, Load +15. Or raise a pane on an edge: Load &minus;10, and nothing crosses it. You get three actions a tick. A pane needs the Load for it.</li>
    <li><i>Dr. Tox</i>(page 2) Crews cordon one block each; each can move once a tick. At tick 6 the wind turns east and the second release lands: the plain between the piers is five blocks wide, and holding the settlement needs five cordons across it.</li>
    <li><i>Move</i>Tap a block (or drag from block to block for a pane). Keys: arrows move the cursor, Enter acts, Shift+arrow raises a pane, P swaps tools, N advances the tick.</li>
    <li><i>Finish</i>When no spore block is left, or at tick 12. There is no failing, only who is on the crawl.</li>
  </ul>
  <p class="${P}note">Ticks are an invented unit of wind. Nobody on the page dies: the marked are changed, named and wanted something.</p>
  <div class="${P}pages"></div>
</div>`;
    wrap.appendChild(intro);
    const pagesEl = intro.querySelector("." + P + "pages");
    PAGES.forEach((pg, i) => {
      const b = document.createElement("button");
      b.type = "button";
      if (i === reached) b.classList.add(P + "next");
      b.innerHTML = `<b>${pg.n}. ${i === 0 ? "A district, nine by seven" : "The settlement, ten by seven"} · ${esc(pg.caption)}</b><span>${esc(pg.chapter)}. ${i === 0 ? "As Aegis: absorb and pane, street by street." : "As Dr. Tox: crews and the east front."}</span>`;
      b.addEventListener("click", () => { intro.remove(); begin(i); });
      pagesEl.appendChild(b);
    });

    function begin(i) {
      setup(i);
      phase = "play";
      if (page.n === 1) sset("rostova.seen", true);                 // her portrait is on the page
      say(page.n === 1
        ? "Eight spore blocks at the west edge, the wind blowing east. Absorb them before the front runs: three actions a tick."
        : nCrews >= 5
          ? `He has ${nCrews} crews. The haze is blowing south; at tick 6 it turns east. Lay cordons, and keep five for the plain.`
          : `He has ${nCrews} crew${nCrews === 1 ? "" : "s"}. The east front needs five. Contain what you can; the page will not hold the settlement.`);
      layout(); refresh();
      later(() => { if (alive) cv.focus({ preventScroll: true }); }, 0);
    }

    // ---- the loop -----------------------------------------------------------------------------------------------------------------------------------
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const t0 = performance.now();
      if (dirty || fx.length || (!RM && cells.some((c) => c.born && now - c.born < 440))) {
        dirty = false;
        render(now);
      }
      lastFrameMs.push(performance.now() - t0);
      if (lastFrameMs.length > 600) lastFrameMs.shift();
    }

    if (typeof ResizeObserver === "function") { ro = new ResizeObserver(() => layout()); ro.observe(wrap); }
    else on(window, "resize", layout);
    dateEl.textContent = "The morning paper"; whereEl.textContent = "";
    refresh(); layout();
    later(() => { const b = pagesEl.querySelector("." + P + "next"); if (b && alive) b.focus({ preventScroll: true }); }, 0);
    raf = requestAnimationFrame(frame);

    // for the test harness
    wrap.__blFrame = () => (lastFrameMs.length ? lastFrameMs.reduce((a, b) => a + b, 0) / lastFrameMs.length : 0);
    wrap.__blState = () => ({
      imgs: Object.keys(imgs), phase, tick, ap, load, wind, tool, W, H, S, GW, GH, PAD, CS, crews: crews.map((c) => c.at), nCrews, settlementLost,
      cells: cells.map((c) => [c.kind, c.lvl, c.cordon ? 1 : 0, c.pier ? 1 : 0]), marked: marked.length,
    });

    return {
      unmount() {
        alive = false;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach((f) => f()); offs.length = 0;
        if (ro) { ro.disconnect(); ro = null; }
        wrap.remove(); style.remove();
      },
    };
  },
};

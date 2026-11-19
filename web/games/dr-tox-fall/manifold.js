// Dr. Tox: Fall, 1D game: The Manifold (DESIGN.md section 11, `g1_manifold`; scenes s1_manifold_1 and s1_manifold_2).
// Mail-order comic advert: a back-page coupon advert, numbered callouts, exclamation headlines, a dashed clip-out border
// around the device (docs/graphic_styles.json). No other mode's style is used.
//
// Flow routing. Each dart draws 24 beads of flow (an invented unit; nothing here measures a real substance) down the spine
// of the gauntlet. Six valves along it each have three settings (shut, half, open); a valve drops beads down its tube to a
// barrel, and the rest go on along the spine. Four barrels each want exactly 6 beads. Flow that finds no room is back-pressure:
// Pulse per dart = 6 + half the back-pressure, at most 14 (`manifold.dart_cost`; Rise's flat +12 is the starting position).
// Exact routing gives 6. Controls: tap a valve to cycle it (or press 1 to 6), Test draw animates one draw, Confirm routing
// finishes at any time. There is no failure: a poor routing costs Pulse all episode. The finish is always a confirmed routing;
// "win" is reported for the best routing this page allows, "done" for any other.
//
// Page 1 (s1_manifold_1, chapter 4): six valves, four barrels. Page 2 (s1_manifold_2, chapter 9): a fifth outlet at the end of
// the spine, capped. Route it (`manifold.resin_line`, `following` +10) and it takes up to 6 beads, with a standing drag of 6
// beads of back-pressure on every dart (+3 Pulse at best). Cap it and nothing changes.
//
// Shared flags (data/flags.json): reads pulse (not shown), manifold.dart_cost and following (page 2);
// writes manifold.dart_cost, manifold.resin_line, following.
//
// Art (games/dr-tox-fall/art/ASSET_MAP.md, "The Manifold"): manifold-advert, -headline-1, -headline-2, -gauntlet, -valve-shut,
// -valve-half, -valve-open, -barrel, -bead, -coupon, -backpressure, -burst, -outlet-capped, -outlet-open. Every piece has a
// drawn fallback when api.art does not have it.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): which valves feed which barrel (1 and 2 feed A, 3 feeds
// B, 4 and 5 feed C, 6 feeds D), each valve's bore (how many beads it drops at half and at open), the starting routing (a
// back-pressure of 12, Rise's +12), the 6-bead drag of a routed fifth outlet, the "win" for the best routing, the captions, and
// Mercy's line "What's in the blades?" (that line is an added line of DESIGN.md chapter 9).

const P = "mf-";
const C = { ink: "#141414", paper: "#f4ecd2", paper2: "#fbf4dc", gold: "#F2C14E", red: "#B3261E", blood: "#4A0F14", steel: "#dfe7e8", page: "#d9cfae", grey: "#6b6658" };
const QUOTE = "Micro-dart gauntlets — draw toxic plasma directly from a surgical shunt set into his wrist, fed by a clear line into a manifold along the gauntlet spine";
const CITE = "Dr. Tox bible, §4";

const SW = 1280, SH = 720;
const DRAW = 24, WANT = 6;
const GX = 140, GY = 190;                         // the gauntlet art (1000 x 260) is drawn at scale 1 here
const VX = [220, 330, 440, 550, 660, 770].map((x) => GX + x);
const SPY = GY + 150, TUBE_END = GY + 222;        // the spine's y, and the bottom of the drop tubes
const SPINE_FROM = GX + 18, SPINE_END = GX + 900; // the shunt, and the end of the spine
const OUT = [GX + 930, SPY];                      // the fifth outlet's socket
const BS = 0.85, BTOP = 428;                      // barrel scale (art 80 x 240) and where its top sits
const BARRELS = [
  { id: "A", x: 415, valves: [0, 1] }, { id: "B", x: 580, valves: [2] },
  { id: "C", x: 745, valves: [3, 4] }, { id: "D", x: 910, valves: [5] },
];
const BARREL_OF = []; BARRELS.forEach((b, bi) => b.valves.forEach((v) => { BARREL_OF[v] = bi; }));
// a valve's bore: beads it drops per draw at half and at open (added for the game)
const BORE = [[2, 4], [3, 6], [6, 12], [2, 4], [4, 8], [3, 6]];
const START = [0, 1, 1, 0, 0, 1];                // shut, half, half, shut, shut, half: back-pressure 12, Pulse 12
const SET_NAME = ["SHUT", "HALF", "OPEN"];
const DRAG = 6;                                   // standing back-pressure of a routed fifth outlet
const PAGES = [
  { n: 1, id: "s1_manifold_1", name: "Four barrels, six valves", caption: "2230", chapter: "Chapter 4 · The Gauntlet",
    where: "The workshop. The gauntlet is in the vise and the line is clear.", fifth: false, headline: "manifold-headline-1" },
  { n: 2, id: "s1_manifold_2", name: "A fifth outlet", caption: "2235", chapter: "Chapter 9 · Resin",
    where: "The cavern hall. Mercy asks, in the settlement's words: “What's in the blades?”", fifth: true, headline: "manifold-headline-2" },
];

const CSS = `
.${P}root{position:absolute;inset:0;display:flex;flex-direction:column;background:${C.page};color:${C.ink};font-family:var(--g-body,system-ui,sans-serif);overflow-x:hidden;overflow-y:auto;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.${P}top{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:8px 16px;background:${C.paper2};border-bottom:4px solid ${C.ink}}
.${P}date{background:${C.gold};border:3px solid ${C.ink};padding:2px 10px;font:700 15px/1.1 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.06em;white-space:nowrap;box-shadow:3px 3px 0 ${C.ink}}
.${P}where{flex:1 1 220px;min-width:0;font-size:13px;line-height:1.3;color:#3a372e}
.${P}rd{display:flex;gap:8px;flex:none}
.${P}rd span{border:3px dashed ${C.ink};background:${C.paper};padding:2px 8px;font:700 14px/1.2 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
.${P}rd b{color:${C.red}}
.${P}wrap{flex:none;position:relative;margin:0 auto;overflow:hidden}
.${P}stage{position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;transform-origin:0 0}
.${P}stage canvas{position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;display:block;pointer-events:none}
.${P}hit{position:absolute;width:80px;height:80px;border-radius:50%;cursor:pointer}
.${P}hit:hover{box-shadow:0 0 0 4px ${C.gold}}
.${P}hit.${P}sel{box-shadow:0 0 0 5px ${C.red}}
.${P}outhit{position:absolute;width:150px;height:90px;cursor:pointer;border-radius:8px}
.${P}outhit:hover{box-shadow:0 0 0 4px ${C.gold}}
.${P}num{position:absolute;display:flex;align-items:center;justify-content:center;font:700 52px/1 var(--g-display,'Oswald',Impact,sans-serif);color:${C.red};pointer-events:none}
.${P}bp{position:absolute;pointer-events:none;transform-origin:50% 50%}
.${P}bp img{display:block;width:100%;height:auto}
.${P}bp .${P}bpfb{width:100%;aspect-ratio:260/180;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center;font:700 22px var(--g-display,Impact,sans-serif);text-align:center;border:3px solid ${C.ink};border-radius:30%}
.${P}bptag{position:absolute;left:50%;bottom:-4px;transform:translateX(-50%);background:${C.paper2};border:3px solid ${C.ink};padding:0 8px;font:700 20px/1.2 var(--g-display,Impact,sans-serif);white-space:nowrap}
.${P}cry{position:absolute;pointer-events:none;display:flex;align-items:center;justify-content:center;font:700 34px/1 var(--g-display,Impact,sans-serif);color:${C.ink}}
.${P}cry img{position:absolute;inset:0;width:100%;height:100%}
.${P}cry span{position:relative}
.${P}pop{animation:${P}pop .35s ease-out}
@keyframes ${P}pop{0%{transform:scale(.4) rotate(-12deg)}70%{transform:scale(1.12) rotate(3deg)}100%{transform:scale(1) rotate(0)}}
.${P}ctl{flex:none;padding:10px 16px 14px;background:${C.paper2};border-top:4px solid ${C.ink};display:grid;gap:10px}
.${P}valves{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.${P}v{font:inherit;color:${C.ink};text-align:left;background:${C.paper};border:3px solid ${C.ink};border-radius:8px;padding:5px 8px;min-height:56px;cursor:pointer;display:flex;flex-direction:column;gap:1px;box-shadow:3px 3px 0 ${C.ink}}
.${P}v b{font:700 15px/1.1 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.05em;text-transform:uppercase}
.${P}v small{font-size:11px;line-height:1.25;color:#4a463a}
.${P}v:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ${C.ink}}
.${P}v.${P}s1{background:#f6e4a6}
.${P}v.${P}s2{background:${C.gold}}
.${P}v:focus-visible,.${P}b:focus-visible{outline:3px solid ${C.red};outline-offset:2px}
.${P}v:disabled,.${P}b:disabled{opacity:.5;cursor:default}
.${P}chips{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}
.${P}chip{border:3px solid ${C.ink};background:${C.paper};padding:1px 8px;font:700 13px/1.4 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.${P}chip.${P}full{background:${C.gold}}
.${P}chip.${P}over{background:${C.red};color:#fff}
.${P}status{flex:1 1 200px;min-width:0;font-size:13px;line-height:1.35;color:#3a372e}
.${P}row{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center}
.${P}b{font:700 15px var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.07em;text-transform:uppercase;color:${C.ink};background:${C.paper};border:3px solid ${C.ink};border-radius:8px;padding:8px 14px;min-height:48px;cursor:pointer;box-shadow:3px 3px 0 ${C.ink}}
.${P}b:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ${C.ink}}
.${P}b.${P}go{background:${C.gold}}
.${P}b.${P}red{background:${C.red};color:#fff}
.${P}intro{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:16px;box-sizing:border-box;overflow:auto;background:rgba(20,20,20,.74)}
.${P}card{max-width:620px;width:100%;margin:auto 0;background:${C.paper2};border:5px dashed ${C.ink};outline:6px solid ${C.paper2};box-shadow:8px 8px 0 ${C.ink};padding:16px 18px 18px;box-sizing:border-box}
.${P}kick{font:700 11px var(--g-body,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:${C.red}}
.${P}card h2{margin:4px 0 8px;font:700 34px/1 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.02em;text-transform:uppercase;color:${C.red}}
.${P}card blockquote{margin:0 0 10px;padding:8px 12px;background:${C.paper};border-left:6px solid ${C.ink};font:italic 14px/1.35 var(--g-body,serif)}
.${P}card blockquote cite{display:block;font:600 11px var(--g-body,sans-serif);letter-spacing:.08em;margin-top:4px;font-style:normal}
.${P}card ul{margin:0 0 10px;padding:0;list-style:none;display:grid;gap:5px}
.${P}card li{font-size:14px;line-height:1.35}
.${P}card li i{display:inline-block;min-width:84px;background:${C.ink};color:${C.paper2};padding:1px 6px;margin-right:6px;font:700 12px var(--g-body,sans-serif);letter-spacing:.1em;text-transform:uppercase;font-style:normal}
.${P}note{font-size:12px;color:#55524a;margin:0 0 6px}
.${P}pages{display:grid;gap:8px;margin-top:10px}
.${P}pages button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;font:inherit;color:${C.ink};background:${C.paper};border:4px solid ${C.ink};border-radius:10px;padding:8px 12px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink}}
.${P}pages button b{font:700 17px var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.${P}pages button span{font-size:13px;color:#4a463a}
.${P}pages button:focus-visible{outline:3px solid ${C.red};outline-offset:3px}
.${P}pages button.${P}next{background:${C.gold}}
.${P}stamp{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(20,20,20,.55);pointer-events:none}
.${P}stamp span{transform:rotate(-8deg);border:6px solid ${C.red};color:${C.red};background:${C.paper2};padding:8px 22px;font:700 40px/1 var(--g-display,Impact,sans-serif);letter-spacing:.06em;text-transform:uppercase}
@media (max-width:700px){
 .${P}top{padding:6px 12px;gap:4px 8px}
 .${P}where{display:none}
 .${P}ctl{padding:8px 12px 12px}
 .${P}valves{grid-template-columns:repeat(3,1fr)}
 .${P}card h2{font-size:27px}
}
@media (prefers-reduced-motion:reduce){.${P}pop{animation:none}.${P}v:active,.${P}b:active{transform:none}}
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// the physics of one draw: where 24 beads go. Pure, so the readout and the animation agree.
function sim(set, routed) {
  let flow = DRAW;
  const drops = [], into = [0, 0, 0, 0];
  for (let i = 0; i < 6; i++) {
    const cap = set[i] === 0 ? 0 : BORE[i][set[i] - 1];
    const d = Math.min(cap, flow);
    drops[i] = d; flow -= d; into[BARREL_OF[i]] += d;
  }
  const got = into.map((n) => Math.min(WANT, n));
  const spill = into.reduce((a, n) => a + Math.max(0, n - WANT), 0);
  let fifth = 0;
  if (routed) { fifth = Math.min(WANT, flow); flow -= fifth; }
  const leftover = flow;
  const bp = spill + leftover + (routed ? DRAG : 0);
  const cost = Math.min(14, 6 + Math.floor(bp / 2));
  return { drops, into, got, spill, fifth, leftover, bp, cost };
}
// the best Pulse per dart this page allows
const bestCost = (routed) => (routed ? 6 + Math.floor(DRAG / 2) : 6);

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const has = (id) => { try { return !!(api.art && api.art.has(id)); } catch { return false; } };
    const url = (id) => (has(id) ? api.art.url(id) : "");
    const sget = (k, d) => { try { const v = api.shared.get(k, d); return v == null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { api.shared.set(k, v); } catch { /* storage off */ } };
    const mget = (k, d) => { try { const v = api.store.get(k, d); return v == null ? d : v; } catch { return d; } };
    const mset = (k, v) => { try { api.store.set(k, v); } catch { /* storage off */ } };

    // ---- disposables ---------------------------------------------------------------------------------------
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    let raf = 0, alive = true, ro = null;
    const lastFrameMs = [];

    // ---- DOM -----------------------------------------------------------------------------------------------
    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = P + "root";
    wrap.innerHTML = `
<div class="${P}top"><div class="${P}date"></div><div class="${P}where"></div>
  <div class="${P}rd"><span>Pulse per dart <b class="${P}rcost">--</b></span><span>Back-pressure <b class="${P}rbp">--</b></span></div></div>
<div class="${P}wrap"><div class="${P}stage">
  <canvas class="${P}cbg" role="img" aria-label="A back-page advert for the gauntlet: six numbered valves along the spine, four barrels hanging below."></canvas>
  <canvas class="${P}cdy" aria-hidden="true"></canvas>
</div></div>
<div class="${P}ctl">
  <div class="${P}valves" role="group" aria-label="The six valves"></div>
  <div class="${P}chips" aria-label="The barrels"></div>
  <div class="${P}row">
    <button type="button" class="${P}b ${P}test">Test draw</button>
    <button type="button" class="${P}b ${P}outb" hidden></button>
    <button type="button" class="${P}b ${P}reset">Back to start</button>
    <button type="button" class="${P}b ${P}go ${P}confirm">Confirm routing</button>
    <div class="${P}status" aria-live="polite"></div>
  </div>
</div>`;
    root.append(style, wrap);
    const $ = (s) => wrap.querySelector(s);
    const dateEl = $("." + P + "date"), whereEl = $("." + P + "where");
    const rCost = $("." + P + "rcost"), rBp = $("." + P + "rbp");
    const wrapEl = $("." + P + "wrap"), stage = $("." + P + "stage");
    const cbg = $("." + P + "cbg"), cdy = $("." + P + "cdy");
    const gbg = cbg.getContext("2d"), gdy = cdy.getContext("2d");
    const valvesEl = $("." + P + "valves"), chipsEl = $("." + P + "chips"), statusEl = $("." + P + "status");
    const topEl = $("." + P + "top"), ctlEl = $("." + P + "ctl");
    const testB = $("." + P + "test"), outB = $("." + P + "outb"), resetB = $("." + P + "reset"), confirmB = $("." + P + "confirm");

    // ---- art ---------------------------------------------------------------------------------------------------
    const imgs = {};
    const want = ["manifold-advert", "manifold-headline-1", "manifold-headline-2", "manifold-gauntlet", "manifold-barrel", "manifold-bead",
      "manifold-coupon", "manifold-outlet-capped", "manifold-outlet-open", "manifold-valve-shut", "manifold-valve-half", "manifold-valve-open"];
    want.forEach((id) => { if (has(id)) api.art.img(id).then((im) => { if (alive && im) { imgs[id] = im; bgKey = ""; dirty = true; } }).catch(() => {}); });

    // ---- state -----------------------------------------------------------------------------------------------------
    let page = null, set = START.slice(), routed = false;
    let phase = "intro";                   // intro | idle | draw | done
    let levels = [0, 0, 0, 0], fifthLvl = 0, drawn = false;
    let beads = [], spawnT = 0, queue = [], clock = 0, arrived = [0, 0, 0, 0], bpSeen = 0, burstUntil = 0;
    let dirty = true, K = 1, DPR = 1, bgKey = "", bgCanvas = null, sel = 0;

    const R = () => sim(set, routed);
    const status = (s) => { statusEl.textContent = s; };

    // ---- the stage: drawn in stage units (1280 x 720), the canvases carry the scale ------------------------------
    function layout() {
      const w = wrap.clientWidth || 360, h = wrap.clientHeight || 640;
      const wide = w >= 700;
      const room = wide ? h - topEl.offsetHeight - ctlEl.offsetHeight : 1e9;
      K = clamp(Math.min(w / SW, room / SH), 0.2, 1.2);
      wrapEl.style.width = Math.round(SW * K) + "px";
      wrapEl.style.height = Math.round(SH * K) + "px";
      stage.style.transform = `scale(${K})`;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      const pw = Math.max(1, Math.round(SW * K * DPR)), ph = Math.max(1, Math.round(SH * K * DPR));
      if (cbg.width !== pw || cbg.height !== ph) { cbg.width = pw; cbg.height = ph; cdy.width = pw; cdy.height = ph; bgKey = ""; }
      dirty = true;
    }

    const bakeCache = {};
    function bake(id, w, h) {
      const im = imgs[id]; if (!im) return null;
      const pw = Math.max(1, Math.round(w * K * DPR)), ph = Math.max(1, Math.round(h * K * DPR));
      const key = `${id}|${pw}|${ph}`;
      if (bakeCache[key]) return bakeCache[key];
      const c = document.createElement("canvas"); c.width = pw; c.height = ph;
      try { c.getContext("2d").drawImage(im, 0, 0, pw, ph); } catch { return null; }
      return (bakeCache[key] = c);
    }
    function put(g, id, x, y, w, h) {   // drawn in stage units
      const c = bake(id, w, h);
      if (c) { g.drawImage(c, x, y, w, h); return true; }
      return false;
    }

    // the static layer: advert, headline, gauntlet, outlet, barrels, coupon; baked once per size, page and outlet state
    function paintBg() {
      const key = `${K}|${page && page.n}|${routed}|${Object.keys(imgs).length}`;
      if (key === bgKey && bgCanvas) return;
      bgKey = key;
      if (!bgCanvas) bgCanvas = document.createElement("canvas");
      bgCanvas.width = cbg.width; bgCanvas.height = cbg.height;
      const g = bgCanvas.getContext("2d");
      g.setTransform(K * DPR, 0, 0, K * DPR, 0, 0);
      g.clearRect(0, 0, SW, SH);
      if (!put(g, "manifold-advert", 0, 0, SW, SH)) {          // fallback: the page, its dashed border, the headline band
        g.fillStyle = C.paper; g.fillRect(0, 0, SW, SH);
        g.strokeStyle = C.ink; g.lineWidth = 5; g.setLineDash([18, 12]); g.strokeRect(18, 18, SW - 36, SH - 36); g.setLineDash([]);
        g.fillStyle = C.paper2; g.fillRect(43, 43, 1194, 122); g.strokeRect(43, 43, 1194, 122);
      }
      const hid = page ? page.headline : "manifold-headline-1";
      if (!put(g, hid, 140, 44, 1000, 120)) {
        g.fillStyle = C.red; g.font = "700 54px Impact, Oswald, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(page && page.n === 2 ? "NEW! NOW WITH A FIFTH OUTLET!" : "AMAZING! FOUR BARRELS FROM ONE LINE!", 640, 104);
      }
      if (!put(g, "manifold-gauntlet", GX, GY, 1000, 260)) {     // fallback: the spine and six sockets
        g.fillStyle = "#2a2a2a"; g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.roundRect(GX + 100, GY + 90, 790, 130, 40); g.fill(); g.stroke();
        g.strokeStyle = C.steel; g.lineWidth = 18; g.beginPath(); g.moveTo(SPINE_FROM, SPY); g.lineTo(SPINE_END, SPY); g.stroke();
        VX.forEach((x, i) => {
          g.fillStyle = C.gold; g.beginPath(); g.arc(x, GY + 50, 24, 0, 7); g.fill(); g.stroke();
          g.fillStyle = C.ink; g.font = "700 26px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), x, GY + 50);
          g.strokeStyle = C.steel; g.lineWidth = 10; g.beginPath(); g.moveTo(x, SPY + 30); g.lineTo(x, TUBE_END); g.stroke(); g.strokeStyle = C.ink; g.lineWidth = 5;
        });
      }
      if (page && page.fifth) {
        const oid = routed ? "manifold-outlet-open" : "manifold-outlet-capped";
        if (!put(g, oid, OUT[0] - 70, OUT[1] - 40, 140, 80)) {   // fallback: a stub and its word (the art carries its own)
          g.fillStyle = routed ? C.blood : "#3a3a3a"; g.strokeStyle = C.ink; g.lineWidth = 4; g.fillRect(OUT[0] - 50, OUT[1] - 14, 100, 28); g.strokeRect(OUT[0] - 50, OUT[1] - 14, 100, 28);
          g.fillStyle = routed ? C.red : C.ink; g.font = "700 18px Oswald, Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic";
          g.fillText(routed ? "ROUTED" : "CAPPED", OUT[0] + 5, OUT[1] + 62);
        }
      }
      BARRELS.forEach((b) => {
        const bx = b.x - 40 * BS;
        if (!put(g, "manifold-barrel", bx, BTOP, 80 * BS, 240 * BS)) {
          g.fillStyle = "#f5f8f8"; g.strokeStyle = C.ink; g.lineWidth = 3;
          g.fillRect(bx + 18 * BS, BTOP + 52 * BS, 44 * BS, 160 * BS); g.strokeRect(bx + 18 * BS, BTOP + 52 * BS, 44 * BS, 160 * BS);
          g.fillStyle = "#2a2a2a"; g.fillRect(bx + 14 * BS, BTOP + 30 * BS, 52 * BS, 22 * BS);
          for (let m = 0; m < 6; m++) { g.beginPath(); g.moveTo(bx + 18 * BS, BTOP + (186 - 26 * m) * BS); g.lineTo(bx + 30 * BS, BTOP + (186 - 26 * m) * BS); g.stroke(); }
        }
        // the barrel's letter, in a gold ring
        g.fillStyle = C.gold; g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.arc(b.x - 44, BTOP + 38, 14, 0, 7); g.fill(); g.stroke();
        g.fillStyle = C.ink; g.font = "700 18px Oswald, Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(b.id, b.x - 44, BTOP + 39);
      });
      if (!put(g, "manifold-coupon", COUP.x, COUP.y, COUP.w, COUP.h)) {
        g.fillStyle = C.paper2; g.strokeStyle = C.ink; g.lineWidth = 3; g.setLineDash([10, 6]); g.fillRect(COUP.x, COUP.y, COUP.w, COUP.h); g.strokeRect(COUP.x, COUP.y, COUP.w, COUP.h); g.setLineDash([]);
        g.fillStyle = C.ink; g.font = "700 24px Oswald, Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText("PULSE PER DART", COUP.x + COUP.w / 2, COUP.y + 34);
      }
    }
    // the coupon (art 360 x 200) drawn 290 wide in the lower right; its white box is where the number goes
    const COUP = { x: 962, y: 490, w: 290, h: (200 / 360) * 290 };
    const CS = COUP.w / 360;
    const NUMBOX = { x: COUP.x + 28 * CS, y: COUP.y + 62 * CS, w: 140 * CS, h: 80 * CS };

    // geometry of a bead's route
    function barrelTop(b) { return BTOP + 52 * BS; }
    function routeFor(dest) {
      const S = [SPINE_FROM, SPY];
      if (dest.type === "valve") {
        const vx = VX[dest.v], b = BARRELS[BARREL_OF[dest.v]];
        return [S, [vx, SPY], [vx, TUBE_END], [vx, TUBE_END + 8], [b.x, TUBE_END + 8], [b.x, BTOP], [b.x, barrelTop(b)]];
      }
      if (dest.type === "fifth") return [S, [SPINE_END, SPY], [OUT[0] + 10, OUT[1]], [OUT[0] + 52, OUT[1] + 4]];
      return [S, [SPINE_END, SPY]];
    }
    function withLen(pts) {
      let L = 0; const seg = [];
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
      return { pts, seg, L };
    }
    function at(route, s) {
      s = clamp(s, 0, route.L);
      for (let i = 0; i < route.seg.length; i++) {
        if (s <= route.seg[i] || i === route.seg.length - 1) {
          const f = route.seg[i] ? clamp(s / route.seg[i], 0, 1) : 0;
          const a = route.pts[i], b = route.pts[i + 1];
          return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        }
        s -= route.seg[i];
      }
      return route.pts[route.pts.length - 1];
    }

    // the dynamic layer: fills, live tubes, valves, beads
    function paintDy() {
      gdy.setTransform(1, 0, 0, 1, 0, 0);
      gdy.clearRect(0, 0, cdy.width, cdy.height);
      gdy.setTransform(K * DPR, 0, 0, K * DPR, 0, 0);
      const g = gdy, r = R();
      const live = phase === "draw";
      // the tubes from each drop to its barrel: steel, with a dark red core where flow goes
      for (let i = 0; i < 6; i++) {
        const vx = VX[i], b = BARRELS[BARREL_OF[i]];
        const open = r.drops[i] > 0;
        g.lineCap = "butt"; g.lineJoin = "round";
        g.strokeStyle = C.steel; g.lineWidth = 10;
        g.beginPath(); g.moveTo(vx, TUBE_END - 2); g.lineTo(vx, TUBE_END + 8); g.lineTo(b.x, TUBE_END + 8); g.lineTo(b.x, BTOP + 2); g.stroke();
        g.strokeStyle = C.ink; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(vx - 5, TUBE_END + 8); g.lineTo(b.x - 5, TUBE_END + 8); g.stroke();
        if (open) {
          g.strokeStyle = C.blood; g.lineWidth = 2 + Math.min(4, r.drops[i] / 3);
          g.beginPath(); g.moveTo(vx, TUBE_END - 2); g.lineTo(vx, TUBE_END + 8); g.lineTo(b.x, TUBE_END + 8); g.lineTo(b.x, BTOP + 2); g.stroke();
        }
      }
      // the fills inside the barrels: a dark red rect, six marks 26 apart
      BARRELS.forEach((b, bi) => {
        const L = live ? levels[bi] : (drawn ? levels[bi] : r.got[bi]);
        const bx = b.x - 40 * BS, ix = bx + 18 * BS, iw = 44 * BS, ibot = BTOP + 212 * BS, ih = 160 * BS;
        const h = ih * clamp(L, 0, WANT) / WANT;
        if (h > 0) {
          g.globalAlpha = live || drawn ? 0.95 : 0.62;
          g.fillStyle = C.blood; g.fillRect(ix, ibot - h, iw, h);
          g.fillStyle = "#7a1620"; g.fillRect(ix, ibot - h, iw, Math.min(4, h));
          g.globalAlpha = 1;
        }
        const over = !live && !drawn && r.into[bi] > WANT;
        if (over) { g.fillStyle = C.red; g.beginPath(); g.moveTo(b.x - 14, BTOP + 44 * BS); g.lineTo(b.x, BTOP + 28 * BS); g.lineTo(b.x + 14, BTOP + 44 * BS); g.closePath(); g.fill(); }
      });
      if (page && page.fifth && routed) {
        const L = live ? fifthLvl : (drawn ? fifthLvl : r.fifth);
        const w = 80 * clamp(L / WANT, 0, 1);
        if (w > 0) { g.fillStyle = C.blood; g.fillRect(OUT[0] - 40, OUT[1] + 66, w, 8); g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(OUT[0] - 40, OUT[1] + 66, 80, 8); }
      }
      // the valves, on the gauntlet's sockets, at the gauntlet's scale
      for (let i = 0; i < 6; i++) {
        const id = ["manifold-valve-shut", "manifold-valve-half", "manifold-valve-open"][set[i]];
        const x = VX[i] - 40, y = SPY - 34;
        if (!put(g, id, x, y, 80, 80)) {
          g.fillStyle = "#e9e3cf"; g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.arc(VX[i], SPY, 27, 0, 7); g.fill(); g.stroke();
          g.save(); g.translate(VX[i], SPY); g.rotate(set[i] === 2 ? 0 : set[i] === 1 ? Math.PI / 4 : Math.PI / 2);
          g.fillStyle = C.ink; g.fillRect(-23, -6, 46, 12); g.restore();
          g.fillStyle = C.ink; g.font = "700 11px sans-serif"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.fillText(SET_NAME[set[i]], VX[i], SPY + 43);
        }
      }
      // the beads
      const bim = bake("manifold-bead", 22, 22);
      for (const b of beads) {
        const [x, y] = at(b.route, b.s);
        g.globalAlpha = b.back ? clamp(1 - b.back / 80, 0, 1) : 1;
        if (b.back) {
          g.fillStyle = C.red; g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.stroke();
        } else if (bim) g.drawImage(bim, x - 11, y - 11, 22, 22);
        else { g.fillStyle = C.blood; g.strokeStyle = C.steel; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); g.stroke(); }
        g.globalAlpha = 1;
      }
    }

    // ---- DOM overlays inside the stage (the hit areas, the coupon number, the starburst, the cry) -------------------
    const hits = [];
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("div");
      h.className = P + "hit"; h.setAttribute("aria-hidden", "true");
      h.style.left = VX[i] - 40 + "px"; h.style.top = SPY - 34 + "px";
      h.addEventListener("click", () => cycle(i));
      stage.appendChild(h); hits.push(h);
    }
    const outHit = document.createElement("div");
    outHit.className = P + "outhit"; outHit.setAttribute("aria-hidden", "true");
    outHit.style.left = OUT[0] - 75 + "px"; outHit.style.top = OUT[1] - 45 + "px"; outHit.style.display = "none";
    outHit.addEventListener("click", () => toggleOutlet());
    stage.appendChild(outHit);
    const numEl = document.createElement("div");
    numEl.className = P + "num"; numEl.setAttribute("aria-hidden", "true");
    Object.assign(numEl.style, { left: NUMBOX.x + "px", top: NUMBOX.y + "px", width: NUMBOX.w + "px", height: NUMBOX.h + "px" });
    stage.appendChild(numEl);
    const bpEl = document.createElement("div");
    bpEl.className = P + "bp"; bpEl.setAttribute("aria-hidden", "true");
    Object.assign(bpEl.style, { left: "1075px", top: "188px", width: "160px", display: "none" });
    bpEl.innerHTML = (has("manifold-backpressure") ? `<img alt="" src="${url("manifold-backpressure")}" draggable="false">` : `<div class="${P}bpfb">BACK-<br>PRESSURE!</div>`) + `<div class="${P}bptag"></div>`;
    stage.appendChild(bpEl);
    const bpTag = bpEl.querySelector("." + P + "bptag");
    const cryEl = document.createElement("div");
    cryEl.className = P + "cry"; cryEl.setAttribute("aria-hidden", "true");
    Object.assign(cryEl.style, { left: "46px", top: "186px", width: "104px", height: "104px", display: "none" });
    cryEl.innerHTML = (has("manifold-burst") ? `<img alt="" src="${url("manifold-burst")}" draggable="false">` : "") + "<span></span>";
    stage.appendChild(cryEl);
    const cryTxt = cryEl.querySelector("span");

    // ---- the controls panel ------------------------------------------------------------------------------------------
    const vBtns = [];
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "v";
      b.addEventListener("click", () => cycle(i));
      b.addEventListener("focus", () => { sel = i; hits.forEach((h, j) => h.classList.toggle(P + "sel", j === i)); });
      b.addEventListener("blur", () => hits.forEach((h) => h.classList.remove(P + "sel")));
      valvesEl.appendChild(b); vBtns.push(b);
    }
    const chips = BARRELS.map(() => { const c = document.createElement("span"); c.className = P + "chip"; chipsEl.appendChild(c); return c; });
    const outChip = document.createElement("span"); outChip.className = P + "chip"; chipsEl.appendChild(outChip);

    function refresh() {
      const r = R();
      vBtns.forEach((b, i) => {
        const bi = BARREL_OF[i];
        b.className = `${P}v ${P}s${set[i]}`;
        b.innerHTML = `<b>${i + 1} · ${SET_NAME[set[i]]}</b><small>to barrel ${BARRELS[bi].id}: ${r.drops[i]} bead${r.drops[i] === 1 ? "" : "s"}<br>half ${BORE[i][0]} · open ${BORE[i][1]}</small>`;
        b.setAttribute("aria-label", `Valve ${i + 1}, ${SET_NAME[set[i]].toLowerCase()}. Drops ${r.drops[i]} beads to barrel ${BARRELS[bi].id}. Half ${BORE[i][0]}, open ${BORE[i][1]}. Press to change.`);
        b.disabled = phase !== "idle" && phase !== "done";
      });
      chips.forEach((c, bi) => {
        const n = r.into[bi];
        c.className = P + "chip" + (n === WANT ? " " + P + "full" : n > WANT ? " " + P + "over" : "");
        c.textContent = `${BARRELS[bi].id} ${n}/${WANT}${n === WANT ? " full" : n > WANT ? " over" : n === 0 ? " empty" : " short"}`;
      });
      outChip.style.display = page && page.fifth ? "" : "none";
      if (page && page.fifth) {
        outChip.className = P + "chip" + (routed ? " " + P + "full" : "");
        outChip.textContent = routed ? `Fifth outlet: routed, takes ${r.fifth}/${WANT}` : "Fifth outlet: capped";
      }
      rCost.textContent = String(r.cost);
      rBp.textContent = String(r.bp);
      numEl.textContent = String(r.cost);
      const showBp = r.bp > 0;
      bpEl.style.display = showBp ? "" : "none";
      bpTag.textContent = `${r.bp} bead${r.bp === 1 ? "" : "s"}`;
      testB.disabled = phase === "draw" || phase === "intro";
      confirmB.disabled = phase === "draw" || phase === "intro";
      resetB.disabled = phase === "draw" || phase === "intro";
      outB.hidden = !(page && page.fifth);
      outB.disabled = phase === "draw" || phase === "intro";
      if (page && page.fifth) outB.textContent = routed ? "Cap the fifth outlet" : "Route the fifth outlet";
      outHit.style.display = page && page.fifth ? "" : "none";
      dirty = true;
    }

    function cry(text) {
      cryTxt.textContent = text; cryEl.style.display = "";
      cryEl.classList.remove(P + "pop"); void cryEl.offsetWidth; if (!RM) cryEl.classList.add(P + "pop");
    }

    function changed() {       // any valve or outlet change: the last test draw no longer describes the routing
      drawn = false; cryEl.style.display = "none"; levels = [0, 0, 0, 0]; fifthLvl = 0;
      refresh();
      const r = R();
      status(r.bp === 0 ? "Exact routing: every bead reaches a barrel." : `${r.bp} bead${r.bp === 1 ? "" : "s"} of back-pressure: Pulse per dart ${r.cost}.`);
    }
    function cycle(i) {
      if (phase !== "idle" && phase !== "done") return;
      if (phase === "done") phase = "idle";
      set[i] = (set[i] + 1) % 3; sel = i;
      changed();
    }
    function toggleOutlet() {
      if (!page || !page.fifth || (phase !== "idle" && phase !== "done")) return;
      if (phase === "done") phase = "idle";
      routed = !routed; changed();
      status(routed ? `Routed. The line drags on every dart (${DRAG} beads of back-pressure), and it takes what reaches the end, up to ${WANT}. Pulse per dart ${R().cost}.` : "Capped. Nothing changes. Mercy's question stays unanswered.");
    }

    // ---- the test draw --------------------------------------------------------------------------------------------------
    function testDraw() {
      if (phase === "draw") return;
      const r = R();
      levels = [0, 0, 0, 0]; fifthLvl = 0; arrived = [0, 0, 0, 0]; bpSeen = 0; beads = []; cryEl.style.display = "none";
      if (RM) {                                   // reduced motion: no flight, the result at once
        levels = r.got.slice(); fifthLvl = r.fifth; drawn = true; phase = "idle";
        refresh(); finishDraw(r); return;
      }
      // beads leaving first go farthest: the end of the spine, the fifth outlet, then valve 6 back to valve 1
      queue = [];
      for (let k = 0; k < r.leftover; k++) queue.push({ type: "end" });
      for (let k = 0; k < r.fifth; k++) queue.push({ type: "fifth" });
      for (let v = 5; v >= 0; v--) for (let k = 0; k < r.drops[v]; k++) queue.push({ type: "valve", v });
      phase = "draw"; spawnT = 0; clock = 0; drawn = false;
      status("Drawing: 24 beads down the line.");
      refresh();
    }
    function spawn() {
      const dest = queue.shift();
      const route = withLen(routeFor(dest));
      beads.push({ dest, route, s: 0, back: 0, dir: 1, speed: 560 + Math.random() * 40 });
    }
    function arrive(b) {
      const d = b.dest;
      if (d.type === "valve") {
        const bi = BARREL_OF[d.v];
        if (arrived[bi] < WANT) { arrived[bi]++; levels[bi] = arrived[bi]; b.done = true; }
        else { b.dir = -1; b.back = 0.01; bpSeen++; }
      } else if (d.type === "fifth") { fifthLvl = Math.min(WANT, fifthLvl + 1); b.done = true; }
      else { b.dir = -1; b.back = 0.01; bpSeen++; }
    }
    function stepDraw(dt) {
      clock += dt; spawnT -= dt;
      while (queue.length && spawnT <= 0) { spawn(); spawnT += 0.075; }
      for (const b of beads) {
        if (b.done) continue;
        if (b.dir === 1) { b.s += b.speed * dt; if (b.s >= b.route.L) { b.s = b.route.L; arrive(b); } }
        else { b.s -= 200 * dt; b.back += 200 * dt; if (b.back >= 80) b.done = true; }
      }
      beads = beads.filter((b) => !b.done);
      if (!queue.length && !beads.length) {
        phase = "idle"; drawn = true;
        const r = R(); levels = r.got.slice(); fifthLvl = r.fifth;
        refresh(); finishDraw(r);
      }
      dirty = true;
    }
    function finishDraw(r) {
      cry(r.bp === 0 ? "EXACT!" : `+${r.cost}`);
      status(r.bp === 0
        ? `Test draw: all 24 beads reached a barrel. Pulse per dart ${r.cost}, the least it can be.`
        : `Test draw: ${DRAW - r.bp} of 24 beads placed${r.spill ? `, ${r.spill} spilled back from a full barrel` : ""}${r.leftover ? `, ${r.leftover} found no room at the end of the spine` : ""}${routed ? `, ${DRAG} dragged by the fifth outlet` : ""}. Pulse per dart ${r.cost}.`);
    }

    // ---- start, pages, finish --------------------------------------------------------------------------------------------
    const intro = document.createElement("div");
    intro.className = P + "intro";
    const reached = clamp(mget("reached", 0) | 0, 0, 1);
    intro.innerHTML = `
<div class="${P}card" role="dialog" aria-label="How to play The Manifold">
  <div class="${P}kick">The Manifold · a back-page advert</div>
  <h2>Route the flow!</h2>
  <blockquote>${esc(QUOTE)}<cite>${esc(CITE)}</cite></blockquote>
  <ul>
    <li><i>The draw</i>Each dart draws ${DRAW} beads of flow (an invented unit) down the spine.</li>
    <li><i>Valves</i>Tap a valve, or press 1 to 6, to turn it: shut, half, open. Each says how many beads it drops at half and at open. What a valve does not drop goes on along the spine.</li>
    <li><i>Barrels</i>Each barrel wants exactly ${WANT}. Valves 1 and 2 feed A, 3 feeds B, 4 and 5 feed C, 6 feeds D.</li>
    <li><i>Back-pressure</i>A bead that finds no room (a full barrel, a capped end) pushes back. Pulse per dart is 6 plus half the back-pressure, at most 14, on every dart, all episode.</li>
    <li><i>Finish</i>Test draw as often as you like; confirm the routing when you are satisfied. There is no failing, only what each dart costs.</li>
  </ul>
  <p class="${P}note">Beads are an invented unit. Nothing on this page measures, mixes or names a real substance, dose or route.</p>
  <div class="${P}pages"></div>
</div>`;
    wrap.appendChild(intro);
    const pagesEl = intro.querySelector("." + P + "pages");
    PAGES.forEach((pg, i) => {
      const b = document.createElement("button");
      b.type = "button";
      if (i === reached) b.classList.add(P + "next");
      b.innerHTML = `<b>${pg.n}. ${esc(pg.name)} · ${esc(pg.caption)}</b><span>${esc(pg.chapter)}. ${esc(i === 1 ? "A fifth outlet appears at the end of the spine, capped. Route it for the followers, or keep it capped." : "Six valves, four barrels, and a routing that costs twelve Pulse a dart to begin with.")}</span>`;
      b.addEventListener("click", () => { intro.remove(); begin(i); });
      pagesEl.appendChild(b);
    });

    function begin(i) {
      page = PAGES[i];
      const saved = mget("routing" + i, null);
      set = Array.isArray(saved) && saved.length === 6 && saved.every((x) => x === 0 || x === 1 || x === 2) ? saved.slice() : START.slice();
      routed = false; drawn = false; levels = [0, 0, 0, 0]; fifthLvl = 0; beads = []; queue = [];
      phase = "idle"; bgKey = "";
      dateEl.textContent = page.caption; whereEl.textContent = page.where;
      refresh();
      const last = sget("manifold.dart_cost", null);
      status(page.fifth
        ? `Mercy asks for what's in the blades. The fifth outlet sits capped at the end of the spine${typeof last === "number" ? `; your routing so far costs ${last} Pulse a dart` : ""}. Route it, or leave it.`
        : `Back-pressure ${R().bp}: the starting routing costs ${R().cost} Pulse a dart. Make it less.`);
      layout();
      later(() => { if (alive && vBtns[0]) vBtns[0].focus({ preventScroll: true }); }, 0);
    }

    function confirm() {
      if (phase !== "idle" && phase !== "done") return;
      const r = R();
      phase = "final"; refresh();
      mset("routing" + (page.n - 1), set.slice());
      mset("reached", Math.max(mget("reached", 0) | 0, Math.min(1, page.n)));
      sset("manifold.dart_cost", r.cost);
      let text;
      const win = r.cost === bestCost(routed);
      if (page.fifth) {
        const was = !!sget("manifold.resin_line", false);
        sset("manifold.resin_line", routed);
        if (routed && !was) sset("following", clamp((Number(sget("following", 0)) || 0) + 10, 0, 100));
        text = routed
          ? `The fifth outlet is routed. It takes up to ${WANT} beads for the followers and drags on every dart: ${r.bp} bead${r.bp === 1 ? "" : "s"} of back-pressure, ${r.cost} Pulse a dart. Following +10.`
          : `He leaves the fifth outlet capped. Nothing changes: ${r.cost} Pulse a dart, and Mercy's question stays unanswered.`;
      } else {
        text = r.bp === 0
          ? `Exact. All 24 beads reach a barrel and no bead pushes back: ${r.cost} Pulse a dart, for as long as he wears the gauntlet.`
          : `Confirmed. ${DRAW - r.bp} of 24 beads reach a barrel and ${r.bp} push back: ${r.cost} Pulse a dart, all episode. The first cots are being set up in the cavern hall.`;
      }
      if (page.n === 1 && r.bp === 0) text += " The first cots are being set up in the cavern hall.";
      const st = document.createElement("div");
      st.className = P + "stamp"; st.innerHTML = `<span>Order received!</span>`;
      wrap.appendChild(st);
      later(() => { if (alive) api.end({ outcome: win ? "win" : "done", text }); }, RM ? 0 : 600);
    }

    // ---- events --------------------------------------------------------------------------------------------------------
    testB.addEventListener("click", testDraw);
    outB.addEventListener("click", toggleOutlet);
    resetB.addEventListener("click", () => {
      if (phase === "draw" || phase === "intro") return;
      phase = "idle"; set = START.slice(); routed = false; changed();
      status(`Back to the start: back-pressure ${R().bp}, Pulse per dart ${R().cost}.`);
    });
    confirmB.addEventListener("click", confirm);
    on(window, "keydown", (e) => {
      if (!alive || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-6]$/.test(e.key) && (phase === "idle" || phase === "done")) { cycle(+e.key - 1); e.preventDefault(); }
      else if ((e.key === "t" || e.key === "T") && phase !== "intro" && document.activeElement && document.activeElement.tagName !== "BUTTON") { testDraw(); }
    });

    // ---- the loop ---------------------------------------------------------------------------------------------------------
    let last = 0;
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const t0 = performance.now();
      if (phase === "draw") stepDraw(dt);
      if (dirty) {
        dirty = false;
        gbg.setTransform(1, 0, 0, 1, 0, 0);
        paintBg();
        gbg.clearRect(0, 0, cbg.width, cbg.height);
        if (bgCanvas) gbg.drawImage(bgCanvas, 0, 0);
        paintDy();
      }
      lastFrameMs.push(performance.now() - t0);
      if (lastFrameMs.length > 600) lastFrameMs.shift();
    }

    if (typeof ResizeObserver === "function") { ro = new ResizeObserver(() => layout()); ro.observe(wrap); }
    else on(window, "resize", layout);
    dateEl.textContent = "Back page"; whereEl.textContent = "";
    refresh(); layout();
    later(() => { const b = pagesEl.querySelector("." + P + "next"); if (b && alive) b.focus({ preventScroll: true }); }, 0);
    raf = requestAnimationFrame(frame);

    // for the test harness
    wrap.__mfFrame = () => (lastFrameMs.length ? lastFrameMs.reduce((a, b) => a + b, 0) / lastFrameMs.length : 0);
    wrap.__mfState = () => ({ imgs: Object.keys(imgs), phase, set: set.slice(), routed, page: page && page.n, sim: R(), levels: levels.slice() });

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

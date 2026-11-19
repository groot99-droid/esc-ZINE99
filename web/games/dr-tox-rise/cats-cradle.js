// Dr. Tox: Rise, 1D game: Cat's Cradle (DESIGN.md section 11, `g1_cradle`).
// Chalk and poster paint on the painted sky: chalk string over Sky Room's flat blue and green walls,
// clinical white light. The memory register; nothing on this page shows harm.
//
// Four pages, as the design's appearances have them, each small:
//   1 Sky Room, aged four (`s1_cradle_1`): two hands (Reese, Cally), three moves, one figure. A win.
//   2 Sky Room, evening (`s1_cradle_2`): eight hands, two figures of six moves each. A win.
//   3 The night before (`s1_cradle_3`): at move four the page stops; hold the string through Cally's
//     telling; Rolan finishes the figure alone. Finishes as made.
//   4 The leash (`s1_cradle_leash`): the last figure the player made, three pairs of hands blank
//     chalk ghosts. It cannot be finished; each attempt is a flinch and the caption "Gratitude.".
//     The page ends when the player lets go: the loss.
//
// A move: tap a crossing, tap the fingers that take it, then Lift or Drop. The right child must take
// the right crossing: Cally takes what Reese offers; Carmy passes only to Cally; anyone else gives the
// X's to the hands they lie toward. Rolan grabs out of turn (let him: his bond +10, the figure slips
// one move back). A wrong child, crossing or lift tangles the string (that move undone). No failure.
//
// Writes (api.shared): cradle.figures_made, reese.bond_cally, reese.bond_carmy, reese.bond_rolan,
// reese.flinches, and cradle.last_figure (which figure the leash plays back).
// Art (api.art): cats-cradle-* only; every id falls back to the page's own chalk drawing.
// Written for the game (DESIGN.md section 21 lists the habits and "Gratitude."): the page titles,
// the how-to wording, the tangle lines, and the rule that the X's go to the hands they lie toward.

const P = "dtr-cradle-";
const C = { sky: "#7FA9D6", field: "#7FA65C", white: "#E9ECEA", chalk: "#F7F7F2", ink: "#22364d", amber: "#D99A2B", gold: "#F2C14E", dim: "#5E7375" };
const KIDS = {
  reese: { name: "Reese", chalk: "#F7F7F2", habit: "offers to Cally" },
  cally: { name: "Cally", chalk: "#F4E7A1", habit: "takes what Reese offers" },
  carmy: { name: "Carmy", chalk: "#F2C6C6", habit: "passes only to Cally" },
  rolan: { name: "Rolan", chalk: "#F3C999", habit: "grabs out of turn" },
};

// Figures in a 100 x 70 box; each is a list of strings [x1, y1, x2, y2].
const FIG = {
  cradle: { name: "The Cradle", segs: [[14, 20, 86, 20], [14, 50, 86, 50], [14, 20, 14, 50], [86, 20, 86, 50], [14, 20, 86, 50], [14, 50, 86, 20]] },
  "soldiers-bed": { name: "Soldier's Bed", segs: [[14, 14, 86, 14], [14, 56, 86, 56], [14, 14, 14, 56], [86, 14, 86, 56], [14, 35, 86, 35], [14, 14, 86, 56], [14, 56, 86, 14]] },
  candles: { name: "Candles", segs: [[14, 14, 86, 14], [14, 56, 86, 56], [14, 35, 86, 35], [14, 14, 14, 56], [38, 14, 38, 56], [62, 14, 62, 56], [86, 14, 86, 56]] },
  diamonds: { name: "Diamonds", segs: [[14, 35, 32, 14], [32, 14, 50, 35], [50, 35, 68, 14], [68, 14, 86, 35], [86, 35, 68, 56], [68, 56, 50, 35], [50, 35, 32, 56], [32, 56, 14, 35], [14, 35, 86, 35]] },
};

// Each figure's script: who starts holding, where the X's lie at each move, the lift/drop strip, and
// the moves at which Rolan grabs.
const U = "up", D = "down";
const SCRIPTS = {
  p1: { fig: "cradle", start: "reese", toward: ["cally", "reese", "cally"], strip: [U, D, U], grabs: [] },
  p2a: { fig: "soldiers-bed", start: "reese", toward: ["rolan", "carmy", "reese", "rolan", "reese", "carmy"], strip: [U, D, U, U, D, U], grabs: [1] },
  p2b: { fig: "diamonds", start: "cally", toward: ["rolan", "carmy", "rolan", "reese", "carmy", "carmy"], strip: [D, U, D, D, U, D], grabs: [3] },
  p3: { fig: "candles", start: "reese", toward: ["carmy", "carmy", "reese", "rolan", "rolan", "rolan"], strip: [U, D, U, D, U, D], grabs: [], stopAt: 3 },
};

const PAGES = [
  { title: "Sky Room, aged four", kids: ["reese", "cally"], scripts: ["p1"],
    scene: "A concrete room painted with a blue sky and green fields. The string is on Reese's hands; Cally sits across the mat.",
    goal: "Make The Cradle in three moves." },
  { title: "Sky Room, evening", kids: ["reese", "cally", "carmy", "rolan"], scripts: ["p2a", "p2b"],
    scene: "Eight to ten: the four of them, older and quieter, back at the painted wall. Eight hands and one string.",
    goal: "Make Soldier's Bed, then Diamonds: six moves each." },
  { title: "The night before", kids: ["reese", "cally", "carmy", "rolan"], scripts: ["p3"],
    scene: "A dormitory at night. Eight hands and a string. Mid-figure, Cally tells them.",
    goal: "Play until the page stops. Then hold the string through her telling." },
  { title: "The leash", kids: ["reese", "cally", "carmy", "rolan"], scripts: [],
    scene: "Years later, a mirror, a sentence said three times. The page pushes into a figure he knows, with three pairs of hands blank.",
    goal: "Try the last move. Let go when you are ready." },
];

const TELLING = [
  "Mid-figure, Cally tells them.",
  "“Cally discovered the final protocol — all groups would fight down to the last four. She told her cohort.”",
  "“Everyone was horrified except Rolan.” (bible, Part VI, Aegis)",
];
const HOLD_MS = 9000;
const SENTENCE = "You survived something terrible so you could protect people from it happening again.";

// Where each child sits, and where the X's lie when they lie toward that child.
const EDGE4 = { reese: "bottom", cally: "left", carmy: "top", rolan: "right" };
const EDGE2 = { reese: "bottom", cally: "top" };
const XAT = { bottom: [50, 63], top: [50, 7], left: [6, 35], right: [94, 35] };

function fallbackHand(color, ghost) {
  const dash = ghost ? ' stroke-dasharray="4 6"' : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><g fill="none" stroke="${color}" stroke-width="${ghost ? 5 : 9}" stroke-linecap="round"${dash}><path d="M70 180 C60 140 80 100 120 98 C160 100 178 140 165 180 C150 205 90 205 70 180Z" fill="${ghost ? "none" : color}" fill-opacity=".25"/><path d="M96 100 L92 30 M146 102 L150 30 M70 150 L34 116 M165 130 L190 92"/></g></svg>`;
}

export default {
  mount(root, api) {
    const art = api.art || { has: () => false, url: () => "", svg: () => "" };
    const RM = !!api.reducedMotion;
    const rng = api.rng ? api.rng() : Math.random;
    const listeners = [], timers = [];
    let raf = 0, dead = false;
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(id); return id; };
    const aUrl = (id) => (art.has && art.has(id) ? art.url(id) : "");
    const sh = {
      get(k, d) { try { const v = api.shared.get(k, d); return v == null ? d : v; } catch { return d; } },
      set(k, v) { try { api.shared.set(k, v); } catch { /* storage off */ } },
    };
    const st0 = {
      get(k, d) { try { const v = api.store.get(k, d); return v == null ? d : v; } catch { return d; } },
      set(k, v) { try { api.store.set(k, v); } catch { /* storage off */ } },
    };
    const bond = (k) => Math.max(0, Math.min(100, Number(sh.get("reese.bond_" + k, 0)) || 0));
    const addBond = (k, n) => sh.set("reese.bond_" + k, Math.min(100, bond(k) + n));

    // ---- styles ---------------------------------------------------------------------------------
    const sky = aUrl("cats-cradle-sky-wall"), mat = aUrl("cats-cradle-play-mat");
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;color:${C.ink};font-family:var(--g-body,system-ui,sans-serif);user-select:none;-webkit-user-select:none;
  background:${C.sky} ${sky ? `url("${sky}") center/cover no-repeat` : `linear-gradient(${C.sky} 0 62%,${C.field} 62% 92%,#C4CDCB 92%)`}}
.${P}wrap::before{content:"";position:absolute;inset:0;background:rgba(233,236,234,.22);pointer-events:none}
.${P}col{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:8px 10px 6px;box-sizing:border-box;gap:6px}
.${P}head{width:100%;max-width:980px;display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;justify-content:center}
.${P}target{position:relative;width:clamp(104px,min(18vw,24vh),190px);flex:none;border:3px solid ${C.chalk};box-shadow:4px 4px 0 rgba(34,54,77,.35);background:${C.sky};line-height:0}
.${P}target img,.${P}target svg{width:100%;height:auto;display:block}
.${P}info{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 180px;max-width:420px}
.${P}page{font:700 13px var(--g-body,system-ui);letter-spacing:.16em;text-transform:uppercase;color:${C.ink}}
.${P}figname{font:700 clamp(20px,3.2vw,30px) "Chalkboard SE","Segoe Print","Bradley Hand",cursive;color:${C.chalk};text-shadow:0 1px 0 rgba(34,54,77,.6),0 0 6px rgba(34,54,77,.25)}
.${P}strip{display:flex;gap:5px;flex-wrap:wrap}
.${P}pip{width:26px;height:26px;display:grid;place-items:center;border:2px dashed rgba(247,247,242,.8);border-radius:50%;font:700 15px system-ui;color:${C.chalk};background:rgba(34,54,77,.25)}
.${P}pip.${P}done{opacity:.4}
.${P}pip.${P}now{border-style:solid;border-color:${C.gold};background:rgba(34,54,77,.55);transform:scale(1.12)}
.${P}tangles{font:600 13px var(--g-body,system-ui);color:${C.ink}}
.${P}matbox{flex:1 1 auto;min-height:0;width:100%;container-type:size}
.${P}mat{--sd:clamp(54px,9vw,100px);--rw:clamp(58px,11vh,100px);position:relative;height:100%;width:100%;margin:0 auto;max-width:900px;display:grid;grid-template-columns:1fr var(--sd) min(calc(100cqw - 2 * var(--sd) - 20px),calc((100cqh - 2 * var(--rw) - 8px) * 1.5)) var(--sd) 1fr;grid-template-rows:var(--rw) minmax(0,1fr) var(--rw);gap:4px}
.${P}centre{grid-area:2/3;position:relative;min-height:0;border:3px solid rgba(247,247,242,.9);box-shadow:5px 5px 0 rgba(34,54,77,.3);
  background:${C.field} ${mat ? `url("${mat}") center/cover` : `repeating-conic-gradient(${C.field} 0 25%,${C.sky} 0 50%) 0 0/25% 33%`}}
.${P}centre::after{content:"";position:absolute;inset:0;background:rgba(34,54,77,.38);pointer-events:none}
.${P}centre svg{position:absolute;inset:0;width:100%;height:100%;z-index:1;touch-action:manipulation}
.${P}xing{cursor:pointer;outline:none}
.${P}xing .${P}ring{fill:rgba(34,54,77,.35);stroke:${C.chalk};stroke-width:.7;stroke-dasharray:2 1.2}
.${P}xing:hover .${P}ring,.${P}xing:focus .${P}ring{stroke:${C.gold};stroke-width:1}
.${P}xing.${P}sel .${P}ring{fill:rgba(242,193,78,.45);stroke:${C.gold};stroke-dasharray:none;stroke-width:1.1}
.${P}xing text{font:700 5px system-ui;fill:${C.chalk};text-anchor:middle;pointer-events:none}
.${P}kid{justify-self:center;align-self:center;display:flex;align-items:center;justify-content:center;gap:0;border:0;background:transparent;padding:2px;cursor:pointer;position:relative;min-width:44px;min-height:44px;border-radius:14px;transition:transform .25s;touch-action:manipulation;color:${C.chalk}}
.${P}kid img{width:clamp(46px,min(7vw,10vh),86px);height:auto;display:block;pointer-events:none}
.${P}kid.${P}v img{width:clamp(44px,min(8vw,10vh),86px)}
.${P}kid:focus-visible{outline:3px solid ${C.gold};outline-offset:2px}
.${P}kid.${P}sel{background:rgba(242,193,78,.42);box-shadow:0 0 0 3px ${C.gold}}
.${P}kid.${P}holding::after{content:"holding";position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);font:700 10px system-ui;letter-spacing:.14em;text-transform:uppercase;background:${C.ink};color:${C.chalk};padding:1px 5px;border-radius:3px}
.${P}kid.${P}off{opacity:.3}
.${P}kid[data-edge=top]{grid-area:1/3}.${P}kid[data-edge=bottom]{grid-area:3/3}
.${P}kid[data-edge=left]{grid-area:2/2;flex-direction:column}.${P}kid[data-edge=right]{grid-area:2/4;flex-direction:column}
.${P}kid.${P}grab[data-edge=right]{transform:translateX(-38%)}
.${P}kid .${P}k{position:absolute;top:2px;left:4px;font:700 11px system-ui;background:rgba(34,54,77,.6);color:${C.chalk};padding:0 4px;border-radius:3px}
.${P}speaker{position:absolute;left:10px;top:8px;width:clamp(40px,7vw,80px);opacity:.92;pointer-events:none}
.${P}bar{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;width:100%;max-width:820px}
.${P}btn{font:800 18px var(--g-body,system-ui);letter-spacing:.1em;text-transform:uppercase;color:${C.ink};background:${C.chalk};border:0;border-radius:6px;padding:10px 20px;min-height:48px;min-width:120px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink};touch-action:manipulation}
.${P}btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 ${C.ink}}
.${P}btn:disabled{opacity:.4;cursor:default;box-shadow:none}
.${P}btn.${P}warm{background:${C.gold}}
.${P}btn[hidden]{display:none}
.${P}msg{width:100%;max-width:820px;min-height:2.6em;text-align:center;font:600 16px/1.3 var(--g-body,system-ui);color:${C.ink};background:rgba(233,236,234,.82);border-radius:6px;padding:4px 10px;box-sizing:border-box}
.${P}names{display:flex;gap:4px 14px;justify-content:center;flex-wrap:wrap;max-width:820px;background:rgba(34,54,77,.5);border-radius:8px;padding:2px 12px}
.${P}name{display:flex;flex-direction:column;align-items:center;min-width:70px}
.${P}name img{height:clamp(26px,4.4vw,40px);width:auto;display:block}
.${P}name .${P}nf{font:700 20px "Chalkboard SE","Segoe Print",cursive;color:${C.chalk};text-shadow:0 1px 0 ${C.ink}}
.${P}name .${P}tally{font:700 13px monospace;letter-spacing:1px;color:${C.chalk};text-shadow:0 1px 0 ${C.ink};min-height:1em}
.${P}name.${P}blank .${P}nf{opacity:.45;letter-spacing:.3em}
.${P}grabbox{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;background:${C.white};border:3px solid ${C.ink};border-radius:8px;padding:10px 12px;text-align:center;box-shadow:6px 6px 0 rgba(34,54,77,.45);width:min(300px,86%)}
.${P}grabbox p{margin:0 0 8px;font:600 16px var(--g-body,system-ui)}
.${P}grabbox .${P}btn{min-width:110px;font-size:15px;padding:8px 12px;margin:3px}
.${P}hold{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;box-sizing:border-box;background:rgba(34,54,77,.72);color:${C.white};text-align:center}
.${P}hold p{margin:0;max-width:560px;font:500 clamp(17px,2.4vw,22px)/1.45 var(--g-body,system-ui);min-height:5em}
.${P}holdbtn{position:relative;width:min(240px,70vw);height:96px;border-radius:48px;border:3px solid ${C.chalk};background:rgba(247,247,242,.12);color:${C.chalk};font:800 18px system-ui;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;overflow:hidden;touch-action:none}
.${P}holdbtn i{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(247,247,242,.3)}
.${P}holdbtn span{position:relative}
.${P}holdbtn.${P}on{border-color:${C.gold}}
.${P}grat{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(420px,80%);z-index:5;pointer-events:none;opacity:0;transition:opacity .35s}
.${P}grat.${P}show{opacity:1}
.${P}grat img{width:100%;display:block}
.${P}grat b{display:block;background:${C.sky};border:3px solid ${C.chalk};color:${C.chalk};font:italic 700 34px Georgia,serif;padding:14px;text-align:center}
.${P}sentence{width:100%;max-width:820px;text-align:center;font:italic 15px/1.35 Georgia,serif;color:${C.ink};background:rgba(242,193,78,.55);padding:4px 10px;border-radius:4px;box-sizing:border-box}
.${P}shake{animation:${P}shk .45s}
@keyframes ${P}shk{20%{transform:translateX(-7px)}45%{transform:translateX(6px)}70%{transform:translateX(-3px)}}
.${P}tight path.${P}top{stroke-width:1.6}
.${P}intro{position:absolute;inset:0;z-index:10;display:grid;place-items:center;padding:12px;box-sizing:border-box;background:rgba(127,169,214,.6);overflow:auto}
.${P}card{width:100%;max-width:560px;box-sizing:border-box;background:${C.white};border:4px solid ${C.ink};border-radius:6px;box-shadow:8px 8px 0 rgba(34,54,77,.5);padding:14px 18px 16px}
.${P}card h2{margin:0 0 4px;font:700 28px "Chalkboard SE","Segoe Print","Bradley Hand",cursive;color:${C.ink}}
.${P}card .${P}kick{font:700 12px system-ui;letter-spacing:.2em;text-transform:uppercase;color:${C.dim}}
.${P}card p{margin:6px 0;font-size:15.5px;line-height:1.45}
.${P}card .${P}goal{border:2px solid ${C.ink};padding:6px 8px;border-radius:4px;background:#fff}
.${P}card ul{margin:6px 0 10px;padding-left:18px;font-size:14.5px;line-height:1.45}
.${P}pages{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}
.${P}pages button{font:600 14px system-ui;text-align:left;padding:8px 10px;border:2px solid ${C.ink};background:#fff;border-radius:5px;cursor:pointer;color:${C.ink};min-height:44px}
.${P}pages button[aria-pressed=true]{background:${C.sky};color:#fff;box-shadow:inset 0 0 0 2px ${C.chalk}}
@media (max-width:520px){.${P}speaker{display:none}.${P}mat{--sd:52px;--rw:60px}.${P}btn{min-width:96px;padding:8px 12px;font-size:16px}.${P}msg{font-size:14.5px}.${P}target{width:104px}.${P}card h2{font-size:23px}.${P}name{min-width:60px}}
@media (prefers-reduced-motion:reduce){.${P}kid,.${P}grat{transition:none}.${P}shake{animation:none}}
`;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.append(css, wrap);

    // ---- state ----------------------------------------------------------------------------------
    let pageIx = Math.max(0, Math.min(3, Number(st0.get("next", 0)) || 0));
    const S = { page: null, kids: [], edges: {}, scripts: [], si: 0, script: null, step: 0, t: 0, xing: -1, kid: null, markers: [],
      grabbed: {}, grabbing: false, tangles: 0, over: false, busy: false, flinches: 0, holdMs: 0, holding: false, phase: "play", takers: new Set() };
    let svg, gFig, pUnder, pTop, gMarks, headEls = {}, kidEls = {}, nameEls = {}, msgEl, liftBtn, dropBtn, goBtn, gratEl, colEl, centreEl, grabBox, holdEl;
    const wobble = Array.from({ length: 24 }, () => (rng() - 0.5) * 2.2);

    function holderAt(script, k) {
      let h = script.start;
      for (let i = 0; i < k; i++) h = takerFor(script, i, h);
      return h;
    }
    function takerFor(script, i, holder) {
      if (holder === "reese" || holder === "carmy") return "cally";
      return script.toward[i];
    }

    // ---- drawing --------------------------------------------------------------------------------
    function loosePt(x, y, k) {
      let a = Math.atan2((y - 35) / 21, (x - 50) / 36);
      if (Math.abs(x - 50) < 1 && Math.abs(y - 35) < 1) a = k * 1.3;
      return [50 + 27 * Math.cos(a), 35 + 11 * Math.sin(a)];
    }
    function shapeAt(fig, t, jit = 0) {
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return FIG[fig].segs.map((s, i) => {
        const a = loosePt(s[0], s[1], i), b = loosePt(s[2], s[3], i + 7);
        const j = () => (jit ? (rng() - 0.5) * jit : 0);
        return [a[0] + (s[0] - a[0]) * e + j(), a[1] + (s[1] - a[1]) * e + j(), b[0] + (s[2] - b[0]) * e + j(), b[1] + (s[3] - b[1]) * e + j()];
      });
    }
    function pathOf(segs, extra) {
      let d = "";
      segs.concat(extra || []).forEach((s, i) => {
        const mx = (s[0] + s[2]) / 2 + wobble[i % 24] * 0.6, my = (s[1] + s[3]) / 2 + wobble[(i + 5) % 24] * 0.6;
        d += `M${s[0].toFixed(1)} ${s[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${s[2].toFixed(1)} ${s[3].toFixed(1)}`;
      });
      return d;
    }
    function xStrands(segs, x, y) {
      // the X's: two strings pinched together at (x, y), running out to the four nearest corners
      const pts = [];
      segs.forEach((s) => { pts.push([s[0], s[1]]); pts.push([s[2], s[3]]); });
      const uniq = [];
      pts.forEach((p) => { if (!uniq.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 3)) uniq.push(p); });
      uniq.sort((a, b) => Math.hypot(a[0] - x, a[1] - y) - Math.hypot(b[0] - x, b[1] - y));
      const four = uniq.slice(0, 4).sort((a, b) => Math.atan2(a[1] - y, a[0] - x) - Math.atan2(b[1] - y, b[0] - x));
      if (four.length < 4) return [];
      // pair opposite corners so the two strings cross at the pinch
      return [[four[0][0], four[0][1], four[2][0], four[2][1]], [four[1][0], four[1][1], four[3][0], four[3][1]]]
        .map((s) => {
          // bend each string through the pinch point
          return [[s[0], s[1], x, y], [x, y, s[2], s[3]]];
        }).flat();
    }
    let lastSegs = [], xExtra = [];
    function drawFigure(segs, extra) {
      lastSegs = segs; xExtra = extra || [];
      const d = pathOf(segs, xExtra);
      pUnder.setAttribute("d", d);
      pTop.setAttribute("d", d);
    }

    function placeMarkers() {
      gMarks.textContent = "";
      S.markers = [];
      S.xing = -1;
      const scr = S.script;
      if (!scr || S.step >= scr.toward.length) { drawFigure(shapeAt(scr ? scr.fig : "cradle", 1)); return; }
      const holder = holderAt(scr, S.step);
      const toward = scr.toward[S.step];
      const edge = S.edges[toward] || "top";
      const [xx, xy] = XAT[edge];
      const segs = shapeAt(scr.fig, S.step / scr.toward.length);
      const extra = xStrands(segs, xx, xy);
      drawFigure(segs, extra);
      // decoys: a straight run of string and a finger loop, away from the X's
      const cands = [];
      segs.forEach((s) => {
        cands.push({ p: [(s[0] + s[2]) / 2, (s[1] + s[3]) / 2], kind: "straight" });
        cands.push({ p: [s[0], s[1]], kind: "loop" });
      });
      const far = (p, list) => list.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 15);
      const picked = [{ p: [xx, xy], kind: "x" }];
      for (const kind of ["straight", "loop"]) {
        const pool = cands.filter((c) => c.kind === kind && far(c.p, picked.map((m) => m.p)) && c.p[0] > 6 && c.p[0] < 94 && c.p[1] > 5 && c.p[1] < 65);
        if (pool.length) picked.push(pool[Math.floor(rng() * pool.length)]);
      }
      if (picked.length < 3) {
        const alt = cands.filter((c) => far(c.p, picked.map((m) => m.p)));
        while (picked.length < 3 && alt.length) picked.push(alt.splice(Math.floor(rng() * alt.length), 1)[0]);
      }
      // shuffle the letters
      for (let i = picked.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [picked[i], picked[j]] = [picked[j], picked[i]]; }
      picked.forEach((m, i) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", P + "xing");
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "button");
        const L = "ABC"[i];
        g.setAttribute("aria-label", `Crossing ${L}`);
        g.innerHTML = `<circle cx="${m.p[0]}" cy="${m.p[1]}" r="9" fill="transparent"/><circle class="${P}ring" cx="${m.p[0]}" cy="${m.p[1]}" r="4.4"/><text x="${m.p[0]}" y="${(m.p[1] - 5.6).toFixed(1)}">${L}</text>`;
        on(g, "click", () => pickXing(i));
        on(g, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); pickXing(i); } });
        gMarks.appendChild(g);
        S.markers.push({ ...m, el: g });
      });
      void holder;
    }

    function refreshHUD() {
      const scr = S.script;
      const strip = headEls.strip;
      strip.textContent = "";
      if (scr) {
        scr.strip.forEach((dir, i) => {
          const s = document.createElement("span");
          s.className = P + "pip" + (i < S.step ? " " + P + "done" : i === S.step && S.phase !== "rolan" ? " " + P + "now" : "");
          s.textContent = dir === U ? "↑" : "↓";
          s.title = dir === U ? "lift" : "drop";
          strip.appendChild(s);
        });
      }
      headEls.tangles.textContent = S.page === 3 ? `Flinches: ${S.flinches}` : `Tangles: ${S.tangles}`;
      const holder = scr && S.step < scr.toward.length ? holderAt(scr, S.step) : null;
      for (const k of Object.keys(kidEls)) {
        const el = kidEls[k];
        el.classList.toggle(P + "holding", holder === k && S.page !== 3);
        el.classList.toggle(P + "sel", S.kid === k);
      }
      S.markers.forEach((m, i) => m.el.classList.toggle(P + "sel", i === S.xing));
      for (const k of Object.keys(nameEls)) {
        const t = nameEls[k].querySelector("." + P + "tally");
        if (t) t.textContent = k === "reese" || S.page === 3 ? "" : "|".repeat(Math.round(bond(k) / 10));
      }
      const ready = S.xing >= 0 && S.kid && !S.busy && !S.grabbing && !S.over && S.phase === "play";
      liftBtn.disabled = dropBtn.disabled = !ready;
    }
    const say = (t) => { msgEl.textContent = t; };

    // ---- input ----------------------------------------------------------------------------------
    function pickXing(i) {
      if (S.over || S.busy || S.grabbing || S.phase !== "play" || i >= S.markers.length) return;
      S.xing = i;
      refreshHUD();
      if (!S.kid) say(S.page === 3 ? "Now whose fingers?" : "Now the fingers that take it.");
      else say("Lift or drop.");
    }
    function pickKid(k) {
      if (S.over || S.busy || S.grabbing || S.phase !== "play" || !kidEls[k]) return;
      S.kid = k;
      refreshHUD();
      if (S.xing < 0) say("Now the crossing they pinch.");
      else say("Lift or drop.");
    }

    function animateTo(fig, from, to, ms, done) {
      cancelAnimationFrame(raf);
      if (RM || ms <= 0) { drawFigure(shapeAt(fig, to)); done && done(); return; }
      const t0 = performance.now();
      const step = (now) => {
        if (dead) return;
        const k = Math.min(1, (now - t0) / ms);
        drawFigure(shapeAt(fig, from + (to - from) * k));
        if (k < 1) raf = requestAnimationFrame(step); else done && done();
      };
      raf = requestAnimationFrame(step);
    }
    function tangle(text) {
      S.tangles++;
      S.busy = true;
      say(text);
      const scr = S.script;
      const base = S.step / scr.toward.length;
      const keep = xExtra;
      if (RM) {
        drawFigure(shapeAt(scr.fig, base, 6), keep);
        later(() => { drawFigure(shapeAt(scr.fig, base), keep); S.busy = false; S.kid = null; S.xing = -1; refreshHUD(); }, 500);
      } else {
        cancelAnimationFrame(raf);
        const t0 = performance.now();
        const step = (now) => {
          if (dead) return;
          const k = Math.min(1, (now - t0) / 520);
          drawFigure(shapeAt(scr.fig, base, 9 * (1 - k)), keep);
          if (k < 1) raf = requestAnimationFrame(step);
          else { S.busy = false; S.kid = null; S.xing = -1; refreshHUD(); }
        };
        raf = requestAnimationFrame(step);
      }
      refreshHUD();
    }

    function commit(dir) {
      if (S.over || S.busy || S.grabbing || S.phase !== "play") return;
      if (S.xing < 0 || !S.kid) { say(S.xing < 0 ? "Tap a crossing first." : "Tap the fingers that take it."); return; }
      if (S.page === 3) { flinch(); return; }
      const scr = S.script;
      const holder = holderAt(scr, S.step);
      const right = takerFor(scr, S.step, holder);
      const m = S.markers[S.xing];
      if (m.kind !== "x") { tangle(m.kind === "loop" ? "That's a finger loop, not the X's. The string slips: tangled." : "That's a straight string, not the X's. Tangled."); return; }
      if (S.kid === holder) { tangle(`${KIDS[holder].name} is holding it. Somebody else has to take it.`); return; }
      if (S.kid !== right) {
        if (holder === "reese") tangle("Tangled. Cally takes what Reese offers.");
        else if (holder === "carmy") tangle("Tangled. Carmy passes only to Cally.");
        else tangle(`Tangled. The X's lie toward ${KIDS[right].name}'s hands.`);
        return;
      }
      if (dir !== scr.strip[S.step]) { tangle(`Tangled. The strip says ${scr.strip[S.step] === U ? "lift" : "drop"}.`); return; }
      // a good move
      if (right !== "reese") S.takers.add(right);
      S.busy = true;
      const from = S.step / scr.toward.length;
      S.step++;
      S.kid = null; S.xing = -1;
      gMarks.textContent = ""; S.markers = [];
      say(`${KIDS[right].name} takes it${dir === U ? " and lifts" : " and drops it over"}.`);
      refreshHUD();
      animateTo(scr.fig, from, S.step / scr.toward.length, 460, () => {
        S.busy = false;
        afterMove();
      });
    }

    function afterMove() {
      const scr = S.script;
      if (scr.stopAt != null && S.step === scr.stopAt) { startTelling(); return; }
      if (S.step >= scr.toward.length) { finishFigure(); return; }
      placeMarkers();
      refreshHUD();
      if (scr.grabs.includes(S.step) && !S.grabbed[S.si + ":" + S.step]) later(rolanGrabs, RM ? 200 : 650);
    }

    function rolanGrabs() {
      if (S.over || !kidEls.rolan) return;
      S.grabbed[S.si + ":" + S.step] = true;
      S.grabbing = true;
      kidEls.rolan.classList.add(P + "grab");
      grabBox = document.createElement("div");
      grabBox.className = P + "grabbox";
      grabBox.innerHTML = `<p>Rolan grabs for it, out of turn.</p>`;
      const yes = document.createElement("button"); yes.type = "button"; yes.className = P + "btn " + P + "warm"; yes.textContent = "Let him (Y)";
      const no = document.createElement("button"); no.type = "button"; no.className = P + "btn"; no.textContent = "Not now (N)";
      on(yes, "click", () => answerGrab(true));
      on(no, "click", () => answerGrab(false));
      grabBox.append(yes, no);
      centreEl.appendChild(grabBox);
      say("Rolan grabs for the string.");
      refreshHUD();
      yes.focus();
    }
    function answerGrab(let_) {
      if (!S.grabbing) return;
      S.grabbing = false;
      kidEls.rolan.classList.remove(P + "grab");
      if (grabBox) { grabBox.remove(); grabBox = null; }
      if (!let_) { say("Not now. Rolan sits back on his heels."); refreshHUD(); return; }
      addBond("rolan", 10);
      const scr = S.script;
      const from = S.step / scr.toward.length;
      S.step = Math.max(0, S.step - 1);
      S.busy = true;
      S.tangles++;
      say("Rolan grins and pulls; the figure slips one move back. Rolan's bond +10.");
      animateTo(scr.fig, from, S.step / scr.toward.length, 420, () => { S.busy = false; placeMarkers(); refreshHUD(); });
      refreshHUD();
    }

    function finishFigure() {
      const scr = S.script;
      gMarks.textContent = ""; S.markers = [];
      drawFigure(shapeAt(scr.fig, 1));
      if (!RM) { svg.classList.add(P + "tight"); later(() => svg && svg.classList.remove(P + "tight"), 900); }
      sh.set("cradle.figures_made", (Number(sh.get("cradle.figures_made", 0)) || 0) + 1);
      sh.set("cradle.last_figure", scr.fig);
      const names = [...S.takers].map((k) => { addBond(k, 10); return KIDS[k].name; });
      S.takers = new Set();
      say(`${FIG[scr.fig].name}. The string is pulled tight. ${names.length ? names.join(", ") + ": bond +10." : ""}`);
      refreshHUD();
      if (S.si + 1 < S.scripts.length) {
        S.busy = true;
        later(() => { S.busy = false; loadScript(S.si + 1); say("Again, a new figure. The string is on Cally's hands."); }, RM ? 900 : 1700);
        return;
      }
      S.over = true;
      st0.set("next", Math.min(3, S.page + 1));
      const text = S.page === 0
        ? `The Cradle, made by two pairs of hands. Tangles: ${S.tangles}.`
        : `Four pairs of hands finish a figure; the string is pulled tight. Tangles: ${S.tangles}. Figures made: ${sh.get("cradle.figures_made", 0)}.`;
      later(() => api.end({ outcome: "win", text }), RM ? 700 : 1300);
    }

    // ---- page 3: the telling --------------------------------------------------------------------
    function startTelling() {
      S.phase = "hold";
      refreshHUD();
      say("The page stops.");
      holdEl = document.createElement("div");
      holdEl.className = P + "hold";
      const p = document.createElement("p");
      p.textContent = TELLING[0];
      const b = document.createElement("button");
      b.type = "button";
      b.className = P + "holdbtn";
      b.innerHTML = `<i></i><span>Hold the string</span>`;
      const hint = document.createElement("small");
      hint.textContent = "Press and hold (or hold Space).";
      holdEl.append(p, b, hint);
      wrap.appendChild(holdEl);
      b.focus();
      const bar = b.querySelector("i");
      let last = 0;
      const down = (e) => { if (e) e.preventDefault(); if (S.phase !== "hold") return; S.holding = true; b.classList.add(P + "on"); last = performance.now(); tick(); };
      const up = () => { if (!S.holding) return; S.holding = false; b.classList.remove(P + "on"); if (S.phase === "hold") hint.textContent = "Hold the string. She is still telling them."; };
      const tick = () => {
        if (dead || !S.holding || S.phase !== "hold") return;
        const now = performance.now();
        S.holdMs += now - last; last = now;
        const k = Math.min(1, S.holdMs / HOLD_MS);
        bar.style.width = (k * 100).toFixed(1) + "%";
        p.textContent = TELLING[Math.min(TELLING.length - 1, Math.floor(k * TELLING.length * 0.999))];
        if (k >= 1) { S.holding = false; stringDrops(); return; }
        raf = requestAnimationFrame(tick);
      };
      on(b, "pointerdown", down);
      on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "pointerleave", up);
      on(b, "contextmenu", (e) => e.preventDefault());
      S.holdDown = down; S.holdUp = up;
    }
    function stringDrops() {
      S.phase = "rolan";
      if (holdEl) { holdEl.remove(); holdEl = null; }
      say("The string drops.");
      const scr = S.script;
      for (const k of Object.keys(kidEls)) kidEls[k].classList.toggle(P + "off", k !== "rolan");
      refreshHUD();
      const next = () => {
        if (dead) return;
        if (S.step >= scr.toward.length) {
          drawFigure(shapeAt(scr.fig, 1));
          say("Rolan finishes the figure alone.");
          S.over = true;
          st0.set("next", 3);
          later(() => api.end({ outcome: "done", text: "Rolan picks the string up and finishes the figure alone. Candles." }), RM ? 700 : 1400);
          return;
        }
        const from = S.step / scr.toward.length;
        S.step++;
        kidEls.rolan.classList.toggle(P + "sel");
        refreshHUD();
        animateTo(scr.fig, from, S.step / scr.toward.length, 600, () => later(next, RM ? 250 : 500));
      };
      later(() => { say("Rolan picks it up."); next(); }, RM ? 400 : 1300);
    }

    // ---- page 4: the leash ----------------------------------------------------------------------
    function flinch() {
      S.flinches++;
      sh.set("reese.flinches", (Number(sh.get("reese.flinches", 0)) || 0) + 1);
      S.kid = null; S.xing = -1;
      S.busy = true;
      say("A flinch. The figure will not close.");
      if (!RM) { colEl.classList.remove(P + "shake"); void colEl.offsetWidth; colEl.classList.add(P + "shake"); }
      gratEl.classList.add(P + "show");
      const scr = S.script;
      const base = S.step / scr.toward.length;
      const keep = xExtra;
      if (RM) drawFigure(shapeAt(scr.fig, base * 0.55), keep);
      else animateTo(scr.fig, base, base * 0.55, 300, () => {});
      later(() => {
        gratEl.classList.remove(P + "show");
        drawFigure(shapeAt(scr.fig, base), keep);
        S.busy = false;
        refreshHUD();
        say(S.flinches > 2 ? "It cannot be finished. Let go when you are ready." : "Try again, or let go.");
      }, RM ? 900 : 1500);
      refreshHUD();
    }
    function letGo() {
      if (S.over || S.page !== 3) return;
      S.over = true;
      S.busy = true;
      refreshHUD();
      animateTo(S.script.fig, S.step / S.script.toward.length, 0, 700, () => {});
      say("He lets go.");
      later(() => api.end({ outcome: "lose", text: `He lets go. The figure stays unfinished: three pairs of hands are blank chalk, and their names are gone. Flinches: ${S.flinches}.` }), RM ? 500 : 1100);
    }

    // ---- building a page ------------------------------------------------------------------------
    function loadScript(i) {
      S.si = i;
      S.script = SCRIPTS[S.scripts[i]];
      S.step = 0; S.kid = null; S.xing = -1; S.takers = new Set();
      setTarget(S.script.fig);
      placeMarkers();
      refreshHUD();
    }
    function setTarget(fig) {
      const id = "cats-cradle-figure-" + fig;
      const u = aUrl(id);
      headEls.target.innerHTML = u ? `<img alt="Target figure: ${FIG[fig].name}" src="${u}">`
        : `<svg viewBox="0 0 100 80" role="img" aria-label="Target figure: ${FIG[fig].name}"><rect width="100" height="80" fill="${C.sky}"/><rect y="62" width="100" height="18" fill="${C.field}"/><path d="${pathOf(FIG[fig].segs.map((s) => [s[0], s[1] * 0.8 + 2, s[2], s[3] * 0.8 + 2]))}" fill="none" stroke="${C.chalk}" stroke-width="1.6"/><text x="50" y="75" text-anchor="middle" font-size="7" font-weight="700" fill="${C.chalk}" font-family="system-ui">${FIG[fig].name.toUpperCase()}</text></svg>`;
      headEls.figname.textContent = FIG[fig].name;
    }

    function buildPage(p) {
      S.page = p;
      const pg = PAGES[p];
      S.kids = pg.kids;
      S.edges = pg.kids.length === 2 ? EDGE2 : EDGE4;
      wrap.textContent = "";
      kidEls = {}; nameEls = {};
      colEl = document.createElement("div");
      colEl.className = P + "col";
      wrap.appendChild(colEl);

      const head = document.createElement("div");
      head.className = P + "head";
      const target = document.createElement("div"); target.className = P + "target";
      const info = document.createElement("div"); info.className = P + "info";
      const pl = document.createElement("div"); pl.className = P + "page"; pl.textContent = `${p + 1} · ${pg.title}`;
      const fn = document.createElement("div"); fn.className = P + "figname";
      const strip = document.createElement("div"); strip.className = P + "strip"; strip.setAttribute("aria-label", "Lift and drop, in order");
      const tg = document.createElement("div"); tg.className = P + "tangles";
      info.append(pl, fn, strip, tg);
      head.append(target, info);
      colEl.appendChild(head);
      headEls = { target, figname: fn, strip, tangles: tg };

      if (p === 3) {
        const s = document.createElement("div");
        s.className = P + "sentence";
        s.textContent = `“${SENTENCE}”`;
        colEl.appendChild(s);
      }

      const matEl = document.createElement("div");
      matEl.className = P + "mat";
      centreEl = document.createElement("div");
      centreEl.className = P + "centre";
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 70");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("role", "group");
      svg.setAttribute("aria-label", "The string on the play mat");
      svg.innerHTML = `<defs><filter id="${P}chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.9"/></filter></defs>
<g id="${P}fig" filter="url(#${P}chalk)" fill="none" stroke-linecap="round"><path class="${P}under" stroke="rgba(247,247,242,.35)" stroke-width="2.4"/><path class="${P}top" stroke="${C.chalk}" stroke-width="1.05" stroke-dasharray="7 .9 3 .6" style="transition:stroke-width .3s"/></g><g class="${P}marks"></g>`;
      pUnder = svg.querySelector("." + P + "under");
      pTop = svg.querySelector("." + P + "top");
      gMarks = svg.querySelector("." + P + "marks");
      centreEl.appendChild(svg);
      matEl.appendChild(centreEl);

      S.kids.forEach((k, i) => {
        const edge = S.edges[k];
        const b = document.createElement("button");
        b.type = "button";
        b.className = P + "kid" + (edge === "left" || edge === "right" ? " " + P + "v" : "");
        b.dataset.edge = edge;
        const ghost = p === 3 && k !== "reese";
        b.setAttribute("aria-label", ghost ? `Blank hands (${i + 1})` : `${KIDS[k].name}'s fingers (${i + 1})`);
        const id = ghost ? "cats-cradle-hand-ghost" : "cats-cradle-hand-" + k;
        const u = aUrl(id) || URL.createObjectURL(new Blob([fallbackHand(KIDS[k].chalk, ghost)], { type: "image/svg+xml" }));
        if (!aUrl(id)) blobs.push(u);
        const rot = { bottom: 0, top: 180, left: 90, right: -90 }[edge];
        b.innerHTML = `<span class="${P}k">${i + 1}</span><img alt="" src="${u}" style="transform:rotate(${rot}deg)"><img alt="" src="${u}" style="transform:rotate(${rot}deg) scaleX(-1)">`;
        on(b, "click", () => pickKid(k));
        matEl.appendChild(b);
        kidEls[k] = b;
      });
      if (p < 2) {
        const spk = aUrl("cats-cradle-speaker");
        if (spk) { const im = document.createElement("img"); im.className = P + "speaker"; im.alt = ""; im.src = spk; wrap.appendChild(im); }
      }
      const matBox = document.createElement("div");
      matBox.className = P + "matbox";
      matBox.appendChild(matEl);
      colEl.appendChild(matBox);

      if (p === 3) {
        gratEl = document.createElement("div");
        gratEl.className = P + "grat";
        const g = aUrl("cats-cradle-gratitude");
        gratEl.innerHTML = g ? `<img alt="Gratitude." src="${g}">` : `<b>Gratitude.</b>`;
        centreEl.appendChild(gratEl);
      }

      msgEl = document.createElement("div");
      msgEl.className = P + "msg";
      msgEl.setAttribute("aria-live", "polite");
      const bar = document.createElement("div"); bar.className = P + "bar";
      liftBtn = document.createElement("button"); liftBtn.type = "button"; liftBtn.className = P + "btn"; liftBtn.textContent = "↑ Lift";
      dropBtn = document.createElement("button"); dropBtn.type = "button"; dropBtn.className = P + "btn"; dropBtn.textContent = "↓ Drop";
      goBtn = document.createElement("button"); goBtn.type = "button"; goBtn.className = P + "btn " + P + "warm"; goBtn.textContent = "Let go"; goBtn.hidden = p !== 3;
      on(liftBtn, "click", () => commit(U));
      on(dropBtn, "click", () => commit(D));
      on(goBtn, "click", letGo);
      bar.append(liftBtn, dropBtn, goBtn);
      colEl.append(msgEl, bar);

      const names = document.createElement("div");
      names.className = P + "names";
      S.kids.forEach((k) => {
        const n = document.createElement("div");
        const blank = p === 3 && k !== "reese";
        n.className = P + "name" + (blank ? " " + P + "blank" : "");
        const u = blank ? "" : aUrl("cats-cradle-name-" + k);
        n.innerHTML = u ? `<img alt="${KIDS[k].name}" src="${u}"><span class="${P}tally"></span>` : `<span class="${P}nf">${blank ? "— —" : KIDS[k].name}</span><span class="${P}tally"></span>`;
        if (blank) n.setAttribute("aria-label", "a name he does not keep");
        names.appendChild(n);
        nameEls[k] = n;
      });
      colEl.appendChild(names);

      if (p === 3) {
        const last = FIG[sh.get("cradle.last_figure", "")] ? sh.get("cradle.last_figure", "") : "cradle";
        const base = Object.values(SCRIPTS).find((s) => s.fig === last) || SCRIPTS.p1;
        S.script = { ...base, toward: base.toward.map(() => "cally"), grabs: [] };
        S.scripts = [];
        S.step = S.script.toward.length - 1;
        setTarget(last);
        placeMarkers();
        refreshHUD();
        say("A figure he knows. Tap a crossing, the fingers, then lift or drop.");
      } else {
        S.scripts = pg.scripts;
        loadScript(0);
        say(p === 0 ? "Reese holds the string. Tap the X's, then Cally's fingers, then lift." : p === 2 ? "Reese holds the string." : "Reese holds the string. Four of them round the mat.");
      }
    }
    const blobs = [];

    // ---- how-to card ----------------------------------------------------------------------------
    function showIntro() {
      const ov = document.createElement("div");
      ov.className = P + "intro";
      const card = document.createElement("div");
      card.className = P + "card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-label", "How to play Cat's Cradle");
      const render = () => {
        const pg = PAGES[pageIx];
        card.innerHTML = `<div class="${P}kick">Cat's Cradle · string figures · page ${pageIx + 1} of 4</div><h2>${pg.title}</h2>
<p>${pg.scene}</p><p class="${P}goal"><b>Goal.</b> ${pg.goal}</p>
<ul><li>Tap a <b>crossing</b> (A, B, C). Pinch the X's: the place where two strings cross.</li>
<li>Tap the <b>fingers</b> that take it (keys 1 to 4).</li>
<li><b>Lift</b> or <b>Drop</b> (arrow keys), as the strip under the figure says.</li>
${pageIx === 0 ? `<li>Cally takes what Reese offers.</li>` : pageIx === 3 ? `<li>It cannot be finished. Let go (G) ends the page.</li>` : `<li>Cally takes what Reese offers. Carmy passes only to Cally. Anyone else gives the X's to the hands they lie toward.</li>`}
${pageIx === 1 ? `<li>Rolan grabs out of turn. Let him (Y) and he is glad, but the figure slips a move back; or not now (N).</li><li>A finished figure brings every child whose hands made it closer to Reese.</li>` : ""}
${pageIx === 2 ? `<li>When the page stops, press and hold the string (or hold Space) until she has finished.</li>` : ""}
<li>A wrong child, crossing or lift tangles the string, and the move is undone. Nothing is lost.</li></ul>`;
        const pages = document.createElement("div");
        pages.className = P + "pages";
        PAGES.forEach((q, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = `${i + 1} · ${q.title}`;
          b.setAttribute("aria-pressed", String(i === pageIx));
          on(b, "click", () => { pageIx = i; buildPage(i); wrap.appendChild(ov); render(); });
          pages.appendChild(b);
        });
        const start = document.createElement("button");
        start.type = "button";
        start.className = P + "btn " + P + "warm";
        start.textContent = "Begin";
        on(start, "click", () => { ov.remove(); S.phase = "play"; buildPage(pageIx); });
        card.append(pages, start);
        start.focus();
      };
      ov.appendChild(card);
      wrap.appendChild(ov);
      S.phase = "intro";
      render();
    }

    // ---- keyboard -------------------------------------------------------------------------------
    on(window, "keydown", (e) => {
      if (dead || S.over) return;
      const k = e.key;
      if (S.phase === "hold") {
        if (k === " " || k === "Enter") { e.preventDefault(); if (!e.repeat && S.holdDown) S.holdDown(); }
        return;
      }
      if (S.phase !== "play") return;
      if (S.grabbing) {
        if (k === "y" || k === "Y") { e.preventDefault(); answerGrab(true); }
        else if (k === "n" || k === "N") { e.preventDefault(); answerGrab(false); }
        return;
      }
      const L = k.toLowerCase();
      if (L === "a" || L === "b" || L === "c") { pickXing("abc".indexOf(L)); e.preventDefault(); }
      else if (/^[1-4]$/.test(k) && S.kids[+k - 1]) { pickKid(S.kids[+k - 1]); e.preventDefault(); }
      else if (k === "ArrowUp" || L === "l") { commit(U); e.preventDefault(); }
      else if (k === "ArrowDown" || L === "d") { commit(D); e.preventDefault(); }
      else if (L === "g" && S.page === 3) { letGo(); e.preventDefault(); }
    });
    on(window, "keyup", (e) => {
      if (S.phase === "hold" && (e.key === " " || e.key === "Enter") && S.holdUp) S.holdUp();
    });

    // a quiet backdrop page under the card, so the mat is there behind it
    buildPage(pageIx);
    showIntro();

    return {
      unmount() {
        dead = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        blobs.forEach((u) => URL.revokeObjectURL(u));
        wrap.remove();
        css.remove();
      },
    };
  },
};

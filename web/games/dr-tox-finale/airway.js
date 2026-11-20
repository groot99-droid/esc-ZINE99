// Dr. Tox: Finale, 2D mode B: The airway (DESIGN.md section 10, `m2_airway`).
// Non-photo-blue pencil roughs: light blue construction pencil on bristol board, the ducts sketched
// loose; behind him the path is inked in black brush, and the page ahead (and the branch not taken)
// stays blue. A real side-scroll with parallax: Dr. Tox rides the airflow through the arcology's ducts.
//
// Two sequences, each cut to a couple of minutes:
//   s2_airway_1  the exhaust stack from the plinth up to the maintenance level (chapter 7). Wide ducts,
//                slow fans, four grilles on each of the two routes after one branch: the service stair
//                (straight on) or the riser the Ghost inked ahead of him (up), which reaches the hub.
//   s2_airway_2  the supply duct over the clinical suite (chapter 8). Narrow, fast, no branch, five
//                grilles and a name under every one (Imogen Hart's among them).
//
// Rules (DESIGN.md section 10 and section 12, Pulse): fans push him along; louvred dampers open and
// shut on a cycle and a shut one blocks him and his breath; he can grip (hold against the flow). His
// breath goes downstream as a plume. A grille in the duct floor opens on a room: if the plume stays over
// it, the people below are exposed (airway.exposed, name and want), they cough and leave the room, and
// nobody is harmed further. He keeps the plume off by holding his breath over a grille (Pulse +2 a
// second), by drawing the shroud closed (halves the plume; Pulse +1 every 2 seconds), or by gripping
// until a damper has turned the air. A fan run too fast carries him over a grille unless he grips.
// There is no failure on this page: exposures are the record. "win" is a clean pass (nobody exposed);
// "done" is every other finish. Pulse is capped just under the Self line, so he cannot hold his breath
// for ever; the Toxin State does not fire on this page.
//
// Shared flags (data/flags.json): reads pulse, self, amber, shroud.fitted, observers_choice; writes
// pulse, airway.exposed (the ledger, by name and want) and, added for the game, airway.route.
//
// Art (api.art, ASSET_MAP.md "The airway"): airway-{duct,fan,grille,branch}-{blue,inked}, damper-open/
// shut, ink-edge, plume, room, room-exposed, arrow-blue/inked, note-hold, note-not-taken, the four tox
// poses, stack/supply far and mid layers (parallax 0.3 and 0.6), and the shared hud-* icons. Every id
// falls back to a pencil line drawn here when the bundle lacks it.
//
// Text: the quote is DESIGN.md's (Story: The Finale). Names, wants, captions and end lines under the
// grilles are added for the game (the author approves or strikes them).

const P = "dtf-aw-";
const INK = "#141414", BLUE = "#8EC5E8", BLUE_D = "#4B88B0", PAPER = "#F7F5EF", PAPER2 = "#EEEAE0",
  WASH = "#9aa3a3", GREEN = "#7FD957", AMBER = "#D99A2B", SHROUD = "#5F6F5A";
const VH = 540;                       // the view is 540 tall at scale 1
const ROW0 = 320, ROWUP = 50;         // the centres of the two duct rows
const QUOTE = "flooding the city's life support";

// ---- the two sequences --------------------------------------------------------------------------------
const D = (o) => Object.assign({ t: "duct", row: -1 }, o);
const F = (o) => Object.assign({ t: "fan", row: -1 }, o);
const G = (names) => ({ t: "grille", row: -1, names });
const DM = () => ({ t: "duct", row: -1, damper: true });
const B = () => ({ t: "branch", row: -1 });

const LEVELS = [
  { id: "s2_airway_1", n: 1, chapter: "Chapter 7 · The Airway", title: "The exhaust stack from the plinth",
    stack: "stack", cs: 0.75, cw: 360, base: 40, fan: 105, nudge: 30, plume: 250, doseT: 0.8, period: 5.2, openT: 3.4,
    goal: "ride the exhaust up to the service door marked SUITE 12",
    scene: "The plinth gets only what the towers exhale, and the stack carries it up. The ducts are wide and the fans are slow. Maintenance staff work in the rooms under the grilles.",
    flavour: "2240. The plinth breathes what the towers exhale; he goes up with it.",
    main: [D({ start: true }), F(),
      G([["Odo Prentiss", "his shift to end"], ["Lian Cobb", "the vent noise to stop"]]), DM(),
      G([["Marit Esker", "to eat at a table"], ["Bram Oyelowo", "his boots dry"]]), F(), D(), B(),
      { split: [G([["Teodora Wick", "a quiet hour"], ["Hal Reddick", "the lift fixed"]]), F()] },
      { split: [DM(), G([["Ines Marlowe", "the night shift off"], ["Kasper Doyle", "a window, once"]])] },
      { split: [F(), DM()] },
      { split: [G([["Nuru Valdes", "her daughter's call answered"], ["Fenn Abara", "his name on the roster"]]), F()] },
      { split: [D(), G([["Dessa Thorn", "her badge to open the door"], ["Yul Mercer", "to go home"]])] },
      D({ join: true }), D({ end: true })],
    branch: 7, join: 13 },
  { id: "s2_airway_2", n: 2, chapter: "Chapter 8 · The Clinical Suite", title: "The supply duct over the suite",
    stack: "supply", cs: 0.65, cw: 312, base: 58, fan: 165, nudge: 40, plume: 270, doseT: 0.6, period: 4.2, openT: 2.4,
    goal: "ride the supply duct to the gallery outside the hub's glass",
    scene: "The duct is narrow and the fans are fast, and every grille has a name under it: the suite's patients, in their chairs.",
    flavour: "The supply duct over the suite. Every grille has a name under it.",
    main: [D({ start: true }), F(),
      G([["Imogen Hart", "to see the plain once"]]), DM(),
      G([["Aldous Venn", "to sleep without the chair"]]), F(),
      G([["Sela Mor", "to finish her shift and go up to her daughter"]]), DM(), F(),
      G([["Corin Ashby", "his window left open an inch"]]), D(),
      G([["Maren Voss", "her daughter's visit, kept"]]), F(), D({ end: true })],
    branch: null, join: null },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, img: () => Promise.resolve(null), url: () => "" };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let raf = 0, dead = false;

    // ---- flags read -----------------------------------------------------------------------------------
    const num = (k, d) => { const v = shared.get(k, d); return typeof v === "number" && isFinite(v) ? v : d; };
    const flags = {
      self: clamp(num("self", 80), 40, 100),
      amber: shared.get("amber", null),
      pulse: num("pulse", 20),
      shroud: shared.get("shroud.fitted", true) !== false,
      ghost: shared.get("observers_choice", "with_them") !== "left_them",
    };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${PAPER};color:${INK};font-family:"Courier New",Courier,monospace;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}top{flex:0 0 auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:5px 10px;border-bottom:2px solid ${BLUE};background:${PAPER2};font:700 12px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase}
.${P}top span{display:flex;align-items:center;gap:5px;white-space:nowrap}
.${P}top img{width:24px;height:24px;display:block}
.${P}top .${P}sp{flex:1}
.${P}panel{position:relative;flex:0 0 auto;width:100%;background:${PAPER};touch-action:none;cursor:pointer;overflow:hidden}
.${P}panel canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}log{flex:1 1 auto;min-height:34px;overflow:hidden;padding:5px 10px;background:${PAPER2};border-top:2px solid ${BLUE};font:700 13px/1.3 Georgia,serif}
.${P}log div{opacity:.55;font-weight:400;font-style:italic}
.${P}log div:first-child{opacity:1;font-weight:700;font-style:normal}
.${P}margin{position:relative;flex:0 0 auto;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px;background:${PAPER2};border-top:2px solid ${BLUE}}
.${P}margin b{font:700 12px "Courier New",monospace;letter-spacing:.1em;white-space:nowrap}
.${P}bar{position:relative;flex:1;height:24px;border:2px solid ${INK};background:${PAPER};overflow:hidden}
.${P}bar img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block}
.${P}bar .m{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:${AMBER};border:2px solid ${INK};box-sizing:border-box}
.${P}bar .u{position:absolute;left:0;bottom:0;height:5px;background:${AMBER};border-top:2px solid ${INK}}
.${P}bar .l{position:absolute;top:-2px;bottom:-2px;width:0;border-left:3px dashed ${INK}}
.${P}pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:6px 8px 8px;background:${PAPER2}}
.${P}pad button{font:700 14px "Courier New",monospace;color:${INK};background:${PAPER};border:2px solid ${INK};box-shadow:2px 2px 0 ${BLUE};min-width:52px;min-height:46px;padding:4px 8px;cursor:pointer;touch-action:none;text-transform:uppercase}
.${P}pad button small{display:block;font-size:10px;font-weight:400;opacity:.7;text-transform:none}
.${P}pad button.down,.${P}pad button[aria-pressed=true]{background:${INK};color:${PAPER}}
.${P}pad button[hidden]{display:none}
.${P}pad button:focus-visible,.${P}ov button:focus-visible{outline:3px solid ${BLUE_D};outline-offset:2px}
.${P}pad i{width:6px}
.${P}ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(20,20,20,.55);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}card{position:relative;max-width:640px;width:100%;box-sizing:border-box;margin:auto;background:${PAPER};border:3px solid ${INK};box-shadow:6px 6px 0 ${BLUE};padding:16px 18px;font-family:Georgia,"Times New Roman",serif;background-image:repeating-linear-gradient(0deg,transparent 0 23px,rgba(142,197,232,.35) 23px 24px)}
.${P}kick{font:700 12px "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase;color:${BLUE_D}}
.${P}card h2{margin:2px 0 6px;font:900 30px/1.05 Georgia,serif;text-transform:uppercase;letter-spacing:.02em}
.${P}q{margin:0 0 8px;padding-left:10px;border-left:6px solid ${BLUE};font-style:italic;font-size:16px}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font-size:14px}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${PAPER};font:700 12px "Courier New",monospace;padding:2px 6px;text-transform:uppercase;text-align:center}
.${P}seq{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 10px}
.${P}seq button{font:700 13px "Courier New",monospace;text-transform:uppercase;text-align:left;padding:8px;background:${PAPER};color:${INK};border:2px solid ${INK};cursor:pointer;min-height:56px}
.${P}seq button small{display:block;font-weight:400;text-transform:none;font-size:11px;margin-top:2px}
.${P}seq button[aria-pressed=true]{background:${INK};color:${PAPER}}
.${P}go{font:700 17px "Courier New",monospace;text-transform:uppercase;background:${INK};color:${PAPER};border:2px solid ${INK};padding:10px 26px;cursor:pointer}
@media (max-width:640px){.${P}pad{flex-wrap:nowrap;gap:4px;padding:6px}.${P}pad button{flex:1 1 0;min-width:0;padding:3px 1px;font-size:11px}.${P}pad button small{display:none}.${P}pad i{width:2px}
 .${P}card{padding:12px}.${P}card h2{font-size:24px}.${P}seq{grid-template-columns:1fr}.${P}keys li{grid-template-columns:78px 1fr}.${P}top{font-size:11px}}
`;
    const topEl = document.createElement("div"); topEl.className = P + "top";
    const panelEl = document.createElement("div"); panelEl.className = P + "panel";
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "The airway: Dr. Tox riding the airflow through a duct drawn in blue pencil, the path behind him inked in black, his breath a grey plume ahead of him, and rooms under the grilles in the duct floor");
    panelEl.append(cv);
    const logEl = document.createElement("div"); logEl.className = P + "log"; logEl.setAttribute("aria-live", "polite");
    const margin = document.createElement("div"); margin.className = P + "margin";
    const padEl = document.createElement("div"); padEl.className = P + "pad";
    const ov = document.createElement("div"); ov.className = P + "ov";
    wrap.append(css, topEl, panelEl, logEl, margin, padEl, ov);
    root.appendChild(wrap);
    const ctx = cv.getContext("2d");

    // ---- art ------------------------------------------------------------------------------------------
    const IMG = {};
    const hasArt = (id) => !!(art.has && art.has(id));
    const PIECES = ["duct", "fan", "grille", "branch"];
    const IDS = [].concat(
      PIECES.flatMap((t) => [`airway-${t}-blue`, `airway-${t}-inked`]),
      ["airway-damper-open", "airway-damper-shut", "airway-ink-edge", "airway-plume", "airway-room", "airway-room-exposed",
        "airway-arrow-blue", "airway-arrow-inked", "airway-note-hold", "airway-note-not-taken",
        "airway-tox", "airway-tox-breath", "airway-tox-grip", "airway-tox-shroud",
        "airway-stack-far", "airway-stack-mid", "airway-supply-far", "airway-supply-mid"]);
    const artReady = Promise.all(IDS.filter(hasArt).map((id) => Promise.resolve(art.img(id)).then((im) => { if (im) IMG[id] = im; }).catch(() => {})));
    const RAST = {}; // a decoded SVG drawn once into a bitmap at the size it is used, so frames only blit
    function ras(id, w, h) {
      const im = IMG[id]; if (!im) return null;
      const pw = Math.max(1, Math.round(w * sc * dpr)), ph = Math.max(1, Math.round(h * sc * dpr));
      const key = id + "|" + pw + "|" + ph;
      let c = RAST[key];
      if (!c) { c = document.createElement("canvas"); c.width = pw; c.height = ph; c.getContext("2d").drawImage(im, 0, 0, pw, ph); RAST[key] = c; }
      return c;
    }
    const icon = (id) => (hasArt(id) && art.url ? art.url(id) : "");

    // ---- state ----------------------------------------------------------------------------------------
    let lv = LEVELS[0], mode = "intro"; // intro | play | over
    let S = null, cells = [], grilles = [], dampers = [];
    const keys = { left: 0, right: 0, up: 0, down: 0, grip: 0, breath: 0 };
    const ptr = { on: false };
    let W = 800, H = 540, sc = 1, dpr = 1, camX = 0, camY = 0;
    let logLines = [];
    const rng = mulberry(4021);

    const pulseCap = () => flags.self - 3;
    const pulseFloor = () => (flags.amber === 0 ? 40 : 20);
    const fsz = (px) => px / sc; // a font size in world units that lands at about px on screen

    function say(t) {
      logLines.unshift(t);
      if (logLines.length > 2) logLines.length = 2;
      logEl.innerHTML = logLines.map((l) => `<div>${esc(l)}</div>`).join("");
    }

    // ---- the page -------------------------------------------------------------------------------------
    function build(level) {
      lv = level;
      cells = []; grilles = []; dampers = [];
      const cw = lv.cw, cs = lv.cs;
      const add = (c, i, row) => {
        const cell = Object.assign({}, c, { i, x: i * cw, row, y: row === 1 ? ROWUP : ROW0 });
        cells.push(cell);
        if (cell.t === "grille") {
          const g = { cell, row, x0: cell.x + 162 * cs, x1: cell.x + 326 * cs, names: cell.names, dose: 0, exposed: false, cough: 0, tag: 0, cy: cell.y };
          grilles.push(g); cell.g = g;
        }
        if (cell.damper) {
          const d = { cell, row, x: cell.x + cw * 0.5, off: (dampers.length * 1.7 + 0.8) % lv.period, open: true, left: 0 };
          dampers.push(d); cell.d = d;
        }
      };
      lv.main.forEach((c, i) => {
        if (c.split) { add(c.split[0], i, 0); add(c.split[1], i, 1); }
        else add(c, i, -1);
      });
      if (lv.join != null) { // the stub of the riser's last cell, above the join, where the drop shaft starts
        add({ t: "duct", stub: true }, lv.join, 1);
      }
      lv.endX = (lv.main.length - 1) * cw + cw * 0.55;
      lv.worldW = lv.main.length * cw;
      if (lv.branch != null) {
        lv.riseX0 = lv.branch * cw + 234; lv.riseX1 = lv.riseX0 + 58;
        lv.dropX0 = lv.join * cw + 130; lv.dropX1 = lv.dropX0 + 62;
        lv.latchX = lv.riseX0 - 24;
      }
      S = {
        t: 0, x: 120, v: 0, y: ROW0, pulse: 0, pl: 0, plTarget: 0, held: false, gasp: 0, closed: false, grip: false, blocked: false,
        pick: 0, taken: null, ink: 0, exposed: [], ending: 0, fade: 0, rest: false, shake: 0, hint: 0, last: "", plEnd: 0, seenSteps: 0,
      };
      const floor0 = pulseFloor();
      S.pulse = clamp(flags.pulse, floor0, Math.max(floor0, pulseCap() - 25));
      logLines = []; logEl.innerHTML = "";
      camX = 0; camY = 0;
      setCamera(true);
      updateHud(true);
    }

    // ---- geometry -------------------------------------------------------------------------------------
    // a cell is active for the player if it belongs to every route or to the route taken
    const activeCell = (c) => c.row === -1 || (S.taken == null ? c.row === 0 : c.row === S.taken);
    function flowAt(x) {
      for (const c of cells) {
        if (!activeCell(c) || c.stub) continue;
        if (x >= c.x && x < c.x + lv.cw) return c.t === "fan" ? lv.fan : lv.base;
      }
      return lv.base;
    }
    function yAt(x) {
      if (lv.branch == null || S.taken !== 1) return ROW0;
      const u = smooth((x - lv.riseX0) / (lv.riseX1 - lv.riseX0)), d = smooth((x - lv.dropX0) / (lv.dropX1 - lv.dropX0));
      return ROW0 + (ROWUP - ROW0) * u * (1 - d);
    }
    const toxH = () => 200 * lv.cs * 0.8;
    const floorOf = (cy) => cy + 80 * lv.cs;

    // ---- sim ------------------------------------------------------------------------------------------
    function maxPlume() { return lv.plume * (S.closed ? 0.5 : 1) * (flowAt(S.x) > lv.base + 10 ? 1.35 : 1); }
    function step(dt) {
      if (mode !== "play") return;
      S.t += dt;
      for (const d of dampers) { const ph = (S.t + d.off) % lv.period; d.open = ph < lv.openT; d.left = d.open ? lv.openT - ph : lv.period - ph; }
      if (lv.branch != null) { if (keys.up) S.pick = 1; else if (keys.down) S.pick = 0; }
      if (lv.branch != null && S.taken == null && S.x >= lv.latchX) {
        S.taken = S.pick;
        say(S.taken === 1 ? "The riser: a narrow shaft going up. The stair duct stays blue behind him." : "Straight on, by the service stair duct. The riser stays blue.");
      }
      const flow = flowAt(S.x);
      const ix = keys.right - keys.left;
      S.grip = !!(keys.grip || ptr.on);
      const target = S.grip ? 0 : flow + ix * lv.nudge;
      const k = S.grip ? 9 : (flow > lv.base + 10 ? 2.4 : 3.2);
      S.v += (target - S.v) * (1 - Math.exp(-k * dt));
      let nx = S.x + S.v * dt;
      // a shut damper is a wall for him and for his breath
      S.blocked = false;
      for (const d of dampers) {
        if (!activeCell(d.cell) || d.open) continue;
        const wall = d.x - 14;
        if (S.x <= wall && nx > wall) { nx = wall; S.v = 0; S.blocked = true; }
        else if (S.x > wall && S.x < d.x + 22 && nx < d.x + 22) nx = d.x + 22; // caught in it as it shuts: the air carries him through
      }
      S.x = clamp(nx, 40, lv.worldW);
      S.y = yAt(S.x);
      S.ink = Math.max(S.ink, S.x);

      // breath
      const cap = pulseCap();
      S.gasp = Math.max(0, S.gasp - dt);
      if (keys.breath && S.gasp <= 0 && S.pulse >= cap - 0.5) { S.gasp = 1.3; say("He has to breathe. Pulse is at the line; the page will not let him hold."); }
      S.held = !!keys.breath && S.gasp <= 0;
      if (flags.shroud === false) S.closed = false;
      const full = lv.plume * (flow > lv.base + 10 ? 1.35 : 1) * (S.closed ? 0.5 : 1);
      S.plTarget = S.held ? 0 : full;
      S.pl += (S.plTarget - S.pl) * Math.min(1, dt * (S.held ? 12 : 4.5));
      if (S.pl < 3) S.pl = S.held ? 0 : S.pl;
      // a shut damper ahead stops the plume
      S.plEnd = S.x + S.pl;
      let stopped = false;
      for (const d of dampers) if (activeCell(d.cell) && !d.open && d.x > S.x - 6 && d.x - 8 < S.plEnd) { S.plEnd = Math.min(S.plEnd, d.x - 8); stopped = true; }
      S.plStopped = stopped;

      // grilles
      let near = false;
      for (const g of grilles) {
        if (!activeCell(g.cell)) continue;
        g.cough = Math.max(0, g.cough - dt); g.tag = Math.max(0, g.tag - dt);
        if (g.exposed) continue;
        let reach = S.x + full + 40;
        for (const d of dampers) if (activeCell(d.cell) && !d.open && d.x > S.x && d.x < g.x0) reach = Math.min(reach, d.x);
        if (g.x1 > S.x && g.x0 < reach) near = true;
        const over = S.pl > 8 && S.plEnd > g.x0 + 6 && S.x < g.x1 - 6;
        if (over) {
          g.dose += dt / lv.doseT; g.tag = 2.5;
          if (g.dose >= 1) expose(g);
        } else g.dose = Math.max(0, g.dose - dt / 1.4);
      }
      // Pulse
      let rate = 0;
      if (S.held) rate += 2;
      if (S.closed) rate += 0.5;
      if (S.grip && !S.blocked && flow > lv.base + 10) rate += 1.5;
      S.rest = (S.grip || S.blocked) && !S.held && !S.closed && !near;
      if (S.rest) rate -= 2;
      S.pulse = clamp(S.pulse + rate * dt, pulseFloor(), cap);
      S.hint = near && !S.held && S.pl > 30 ? Math.min(1, S.hint + dt * 3) : Math.max(0, S.hint - dt * 3);
      S.shake = Math.max(0, S.shake - dt);
      if (S.fade > 0 || S.ending) { S.fade = Math.min(1, S.fade + dt / (RM ? 0.2 : 1.3)); }
      if (!S.ending && S.x >= lv.endX) finish();
    }
    function expose(g) {
      g.exposed = true; g.cough = 2.2; g.tag = 5;
      for (const [name, want] of g.names) S.exposed.push({ name, want });
      const who = g.names.map((n) => n[0]).join(" and ");
      say(`${who}, who ${g.names.length > 1 ? "want" : "wants"} ${g.names.map((n) => n[1]).join(" and ")}, ${g.names.length > 1 ? "cough" : "coughs"} and leave the room.`);
      if (!RM) S.shake = 0.25;
    }
    function shroudToggle() {
      if (mode !== "play") return;
      if (!flags.shroud) { say("The shroud is not fitted."); return; }
      S.closed = !S.closed;
      say(S.closed ? "Shroud drawn close. The plume halves; the trapped breath costs Pulse +1 every 2 seconds." : "Shroud open. The plume is full length again.");
    }

    // ---- finishing ------------------------------------------------------------------------------------
    function writeShared() {
      shared.set("pulse", Math.round(S.pulse));
      const led = shared.get("airway.exposed", []);
      const list = Array.isArray(led) ? led.slice() : [];
      for (const e of S.exposed) if (!list.some((x) => x && x.name === e.name)) list.push({ name: e.name, want: e.want });
      shared.set("airway.exposed", list);
      if (lv.branch != null) shared.set("airway.route", S.taken === 1 ? "riser" : "stair");
      store.set("done" + lv.n, true);
    }
    function finish() {
      if (mode === "over") return;
      mode = "over"; S.ending = 1;
      const n = S.exposed.length;
      const outcome = n === 0 ? "win" : "done";
      const names = n
        ? `Under the grilles: ${S.exposed.map((e) => `${e.name} (${e.want})`).join("; ")}. They coughed and left their rooms; nobody was harmed further.`
        : "Nobody under a grille breathed what he breathed.";
      let text;
      if (lv.n === 1) {
        const route = S.taken === 1 ? "He took the riser the Ghost had inked, toward the hub; the other duct fades out of the page." : S.taken === 0 ? "He went by the service stair duct; the riser fades out of the page." : "";
        text = `The service door marked SUITE 12. ${route} ${names}`;
      } else {
        text = `The duct opens onto a gallery outside a drum of glass, and on the other side of it, light. ${names}`;
      }
      writeShared();
      later(() => { if (!dead) api.end({ outcome, text: text.replace(/\s+/g, " ").trim() }); }, RM ? 250 : 1700);
    }

    // ---- drawing --------------------------------------------------------------------------------------
    function wob(x0, y0, x1, y1, a, n) {
      const steps = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / (n || 30)));
      ctx.moveTo(x0, y0);
      for (let i = 1; i <= steps; i++) { const u = i / steps, j = ((i * 7919) % 13 - 6) * 0.13 * a; ctx.lineTo(x0 + (x1 - x0) * u + j, y0 + (y1 - y0) * u + j); }
    }
    function piece(id, x, y, w, h, fb) {
      const im = IMG[id];
      if (im) ctx.drawImage(ras(id, w, h) || im, x, y, w, h);
      else if (fb) fb();
    }
    function fbCell(t, x, y, w, h, inked) {
      const s = h / 240; ctx.save();
      ctx.strokeStyle = inked ? INK : BLUE; ctx.lineWidth = (inked ? 6 : 2) * s;
      ctx.beginPath(); wob(x, y + 40 * s, x + w, y + 40 * s, 1.5, 30); wob(x, y + 200 * s, x + w, y + 200 * s, 1.5, 30); ctx.stroke();
      if (t === "fan") { ctx.beginPath(); ctx.arc(x + w / 2, y + 120 * s, 62 * s, 0, 7); ctx.stroke(); }
      else if (t === "grille") { ctx.beginPath(); for (let k = 0; k < 9; k++) { ctx.moveTo(x + (170 + k * 20) * s, y + 194 * s); ctx.lineTo(x + (170 + k * 20) * s, y + 214 * s); } ctx.stroke(); }
      else if (t === "branch") { ctx.beginPath(); ctx.moveTo(x + 299 * s, y + 120 * s); ctx.lineTo(x + 380 * s, y); ctx.stroke(); }
      ctx.restore();
    }
    // a duct cell: the blue rough, then its inked version over it as far as the page has been inked
    function drawCell(c, inkTo, alpha) {
      const cw = lv.cw, h = 240 * lv.cs, y = c.y - 120 * lv.cs, x = c.x;
      ctx.save(); ctx.globalAlpha = alpha;
      piece(`airway-${c.t}-blue`, x, y, cw, h, () => fbCell(c.t, x, y, cw, h, false));
      if (inkTo > x) {
        ctx.beginPath(); ctx.rect(x - 1, y - 4, Math.min(cw, inkTo - x) + 1, h + 8); ctx.clip();
        piece(`airway-${c.t}-inked`, x, y, cw, h, () => fbCell(c.t, x, y, cw, h, true));
      }
      ctx.restore();
    }
    function inkLimit(c) {
      if (c.row === -1) return S.ink;
      if (S.taken == null) return 0;
      return c.row === S.taken ? S.ink : 0;
    }
    function drawBackdrop(kind, factor, alpha) {
      const id = `airway-${lv.stack}-${kind}`, im = IMG[id];
      const th = VH + 30, tw = im ? Math.round(((im.naturalWidth || im.width) / (im.naturalHeight || im.height)) * th) : 1920;
      const off = (((camX * factor) % tw) + tw) % tw, vw = W / sc, y = Math.min(0, camY * factor * 0.5) - 4;
      ctx.save(); ctx.globalAlpha = alpha;
      for (let x = -off; x < vw; x += tw) {
        if (im) ctx.drawImage(ras(id, tw, th) || im, Math.round(x * sc) / sc, y, tw + 1, th);
        else { // fallback: loose pencil ribs
          ctx.strokeStyle = BLUE; ctx.lineWidth = 1.5;
          ctx.beginPath(); for (let r = 0; r < tw; r += 240) wob(x + r, y + 160, x + r, y + 400, 1, 40); ctx.stroke();
        }
      }
      ctx.restore();
    }
    function drawShafts() {
      if (lv.branch == null) return;
      const cs = lv.cs, yTop = ROWUP + 80 * cs;
      const taken = S.taken === 1;
      const shaft = (x0, x1, ink, yBot) => {
        ctx.save(); ctx.lineCap = "round";
        for (const pass of ink ? [0, 1] : [0]) {
          ctx.strokeStyle = pass ? INK : BLUE; ctx.lineWidth = pass ? 5 : 1.8;
          if (pass) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 8, yTop - 8, x1 - x0 + 16, (yBot - yTop) + 16); ctx.clip(); }
          ctx.beginPath(); wob(x0, yBot, x0, yTop, 1.4, 22); wob(x1, yBot, x1, yTop, 1.4, 22); ctx.stroke();
          if (pass) ctx.restore();
        }
        ctx.restore();
      };
      const risen = taken && S.x > lv.riseX0, dropped = taken && S.x > lv.dropX0;
      shaft(lv.riseX0 - 2, lv.riseX1 + 2, risen, ROW0 - 120 * cs);
      shaft(lv.dropX0 - 2, lv.dropX1 + 2, dropped, ROW0 - 80 * cs);
    }
    function drawRoom(g, camera) {
      const cs = lv.cs, rw = lv.n === 1 ? 200 : 168, rh = rw * 200 / 320;
      const cx = (g.x0 + g.x1) / 2, rx = cx - rw / 2, ry = g.cy + 96 * cs;
      const id = g.exposed ? "airway-room-exposed" : "airway-room";
      piece(id, rx, ry, rw, rh, () => {
        ctx.save(); ctx.strokeStyle = g.exposed ? INK : BLUE; ctx.lineWidth = 2; ctx.strokeRect(rx, ry, rw, rh);
        ctx.beginPath(); ctx.moveTo(rx, ry + rh * 0.7); ctx.lineTo(rx + rw, ry + rh * 0.7); ctx.stroke(); ctx.restore();
      });
      // the wash that falls through the grille as the dose builds
      if (g.dose > 0.02 && !g.exposed) {
        const gr = ctx.createLinearGradient(0, g.cy + 80 * cs, 0, ry + rh);
        gr.addColorStop(0, "rgba(120,130,130,.55)"); gr.addColorStop(1, "rgba(120,130,130,0)");
        ctx.save(); ctx.globalAlpha = Math.min(1, g.dose * 1.2); ctx.fillStyle = gr;
        ctx.fillRect(g.x0 + 6, g.cy + 88 * cs, g.x1 - g.x0 - 12, rh + 8); ctx.restore();
      }
      // the names, lettered at run time, on a paper tag at the top of the room
      const fs = fsz(11), fs2 = fsz(10.5), label = g.names.map((n) => n[0]).join(" · ");
      const two = g.tag > 0 || g.exposed;
      const line2 = g.exposed ? "coughs, and leaves the room" : "wants " + g.names.map((n) => n[1]).join(" / ");
      ctx.save(); ctx.textAlign = "center";
      ctx.font = `700 ${fs}px "Courier New",monospace`; let w1 = ctx.measureText(label).width;
      ctx.font = `italic ${fs2}px Georgia,serif`; const w2 = two ? ctx.measureText(line2).width : 0;
      const tw = Math.max(w1, w2) + 12 / sc, th = fs * 1.7 + (two ? fs2 * 1.3 : 0), ty = ry + 4;
      ctx.fillStyle = "rgba(247,245,239,.92)"; ctx.fillRect(cx - tw / 2, ty, tw, th);
      ctx.strokeStyle = g.exposed ? INK : BLUE; ctx.lineWidth = 1.2; ctx.strokeRect(cx - tw / 2, ty, tw, th);
      ctx.fillStyle = g.exposed ? INK : BLUE_D; ctx.font = `700 ${fs}px "Courier New",monospace`;
      ctx.fillText(label, cx, ty + fs * 1.2);
      if (two) { ctx.font = `italic ${fs2}px Georgia,serif`; ctx.fillStyle = INK; ctx.fillText(line2, cx, ty + fs * 1.2 + fs2 * 1.25); }
      if (g.cough > 0 && g.exposed) { ctx.font = `700 ${fsz(14)}px "Courier New",monospace`; ctx.fillStyle = INK; ctx.fillText("*hh*", cx + (RM ? 0 : Math.sin(g.cough * 30) * 4), ry + rh * 0.62); }
      ctx.restore();
    }
    function drawDamper(d, alpha) {
      const cs = lv.cs, ds = cs * 0.9, w = 180 * ds, h = 220 * ds, y = d.cell.y - 110 * ds;
      ctx.save(); ctx.globalAlpha = alpha;
      const id = d.open ? "airway-damper-open" : "airway-damper-shut";
      piece(id, d.x - w / 2, y, w, h, () => {
        ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath();
        if (d.open) for (let k = 0; k < 5; k++) { const yy = y + 28 * ds + k * 34 * ds; ctx.moveTo(d.x - 10, yy); ctx.lineTo(d.x + 10, yy + 32 * ds); }
        else for (let k = 0; k < 5; k++) { const yy = y + 40 * ds + k * 34 * ds; ctx.moveTo(d.x - 38 * ds, yy); ctx.lineTo(d.x + 38 * ds, yy); }
        ctx.stroke();
      });
      // a pencil timer above it: the time left in this state
      const bw = 56 * cs / 0.75, frac = d.left / (d.open ? lv.openT : lv.period - lv.openT), by = d.cell.y - 80 * cs - 14;
      ctx.fillStyle = BLUE; ctx.globalAlpha = alpha * 0.9; ctx.fillRect(d.x - bw / 2, by, bw * clamp(frac, 0, 1), 4);
      ctx.strokeStyle = d.open ? BLUE_D : INK; ctx.lineWidth = 1.2; ctx.strokeRect(d.x - bw / 2, by, bw, 4);
      ctx.restore();
    }
    function drawEndProps(c) {
      const cs = lv.cs, x = lv.endX, cy = c.y;
      ctx.save();
      if (lv.n === 1) { // the service door
        const dw = 54, dh = 120 * cs / 0.75 * 0.85, dy = floorOf(cy) - dh, x = lv.endX + 36;
        ctx.fillStyle = PAPER2; ctx.fillRect(x, dy, dw, dh);
        ctx.strokeStyle = S.ink > x - 80 ? INK : BLUE; ctx.lineWidth = S.ink > x - 80 ? 4 : 1.8; ctx.strokeRect(x, dy, dw, dh);
        ctx.fillStyle = INK; ctx.font = `700 ${fsz(10.5)}px "Courier New",monospace`; ctx.textAlign = "center";
        ctx.fillText("SUITE", x + dw / 2, dy + dh * 0.4); ctx.fillText("12", x + dw / 2, dy + dh * 0.4 + fsz(12));
      } else { // the gallery: the duct opens onto light
        const gr = ctx.createLinearGradient(x, 0, x + 260, 0);
        gr.addColorStop(0, "rgba(247,245,239,0)"); gr.addColorStop(1, "rgba(255,252,235,1)");
        ctx.fillStyle = gr; ctx.fillRect(x - 30, cy - 120 * cs, 330, 240 * cs);
        ctx.fillStyle = BLUE_D; ctx.font = `700 ${fsz(11)}px "Courier New",monospace`; ctx.textAlign = "left"; ctx.fillText("GALLERY", x + 20, cy - 4);
      }
      ctx.restore();
    }
    function drawFlow(c, alpha) { // pencil dashes riding the air, so the flow can be read at a glance
      const f = c.t === "fan" ? lv.fan : lv.base, cs = lv.cs;
      if (c.stub) return;
      ctx.save(); ctx.strokeStyle = BLUE; ctx.globalAlpha = alpha * 0.8; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.beginPath();
      const n = c.t === "fan" ? 5 : 3, span = lv.cw / n;
      for (let k = 0; k < n; k++) {
        const ph = RM ? k * 0.37 : ((S.t * f / span + k * 0.37) % 1);
        const x = c.x + ((k + ph) % n) * span, yy = c.y - 54 * cs + ((k * 37) % 5) * 20 * cs;
        ctx.moveTo(x, yy); ctx.lineTo(x + 16 + f * 0.12, yy);
      }
      ctx.stroke(); ctx.restore();
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.scale(sc, sc);
      if (S.shake > 0 && !RM) ctx.translate((rng() - 0.5) * 4, (rng() - 0.5) * 3);
      drawBackdrop("far", 0.3, 0.55);
      drawBackdrop("mid", 0.6, 0.32);
      ctx.translate(-camX, -camY);
      const vx0 = camX - 60, vx1 = camX + W / sc + 60;
      const fade = S.fade;
      const untaken = (c) => lv.branch != null && S.taken != null && c.row !== -1 && c.row !== S.taken;
      // cells: the route not taken last, so the taken route is drawn over it
      for (const pass of [1, 0]) for (const c of cells) {
        if (c.x + lv.cw < vx0 || c.x > vx1) continue;
        const nt = untaken(c);
        if ((pass === 1) !== nt) continue;
        let a = nt ? 1 - fade * 0.95 : 1, ink = inkLimit(c);
        if (flags.ghost && lv.n === 1 && c.row === 1) ink = Math.max(ink, c.x + lv.cw); // the Ghost inked the hub's duct ahead of him
        drawCell(c, ink, a);
        if (c.t === "duct" && !c.start && !c.end) drawFlow(c, a);
        if (c.t !== "duct" && c.t !== "branch") drawFlow(c, a);
        if (c.d) drawDamper(c.d, a);
        if (c.end) drawEndProps(c);
        if (nt && c.i === lv.branch + 2) {
          const nw = 150 * lv.cs / 0.75;
          piece("airway-note-not-taken", c.x + 30, c.y - 120 * lv.cs - 12, nw, nw * 60 / 240, () => { ctx.fillStyle = BLUE_D; ctx.font = `italic ${fsz(11)}px Georgia,serif`; ctx.fillText("not taken", c.x + 40, c.y - 120 * lv.cs); });
        }
      }
      drawShafts();
      // the Ghost's mark, on the riser it inked
      if (flags.ghost && lv.n === 1 && S.taken == null) {
        const bx = lv.branch * lv.cw;
        ctx.save(); ctx.font = `italic ${fsz(11.5)}px Georgia,serif`; ctx.fillStyle = INK; ctx.textAlign = "left";
        ctx.fillText("inked ahead: the Ghost's line (up)", bx + 14, ROW0 - 100 * lv.cs - 14); ctx.restore();
      }
      // start arrows
      const first = cells[0];
      piece(S.ink > 220 ? "airway-arrow-inked" : "airway-arrow-blue", 60, first.y - 120 * lv.cs + 30, 80, 60, null);
      // rooms under the grilles of the route he is on
      for (const g of grilles) { if (!activeCell(g.cell) || g.x1 < vx0 || g.x0 > vx1) continue; drawRoom(g); }
      // his breath, then him
      const ty = S.y, hh = toxH(), fy = floorOf(ty) - 2;
      if (S.pl > 6) {
        const len = Math.max(0, Math.min(S.pl, S.plEnd - S.x)), ph = len * 120 / 420 * 1.15;
        const px = S.x + 14, py = ty - 18 - ph / 2 + (RM ? 0 : Math.sin(S.t * 2.6) * 2);
        if (len > 6) {
          ctx.save(); ctx.globalAlpha = S.closed ? 0.8 : 1;
          ctx.beginPath(); ctx.rect(px - 4, ty - 80 * lv.cs, len + 8, 160 * lv.cs); ctx.clip();
          piece("airway-plume", px, py, len, ph, () => { const gg = ctx.createLinearGradient(px, 0, px + len, 0); gg.addColorStop(0, "rgba(154,163,163,.5)"); gg.addColorStop(1, "rgba(154,163,163,0)"); ctx.fillStyle = gg; ctx.fillRect(px, py, len, ph); });
          ctx.restore();
        }
      }
      // the inked edge at his position
      const ew = 120 * lv.cs, eh = 240 * lv.cs;
      piece("airway-ink-edge", S.x - ew + 22, ty - 120 * lv.cs, ew, eh, null);
      const pose = S.held ? "airway-tox-breath" : S.grip ? "airway-tox-grip" : S.closed ? "airway-tox-shroud" : "airway-tox";
      const tw = 160 * lv.cs * 0.8, bobY = RM || S.grip || S.blocked ? 0 : Math.sin(S.t * 5) * 1.5;
      piece(pose, S.x - tw / 2, fy - hh + bobY, tw, hh, () => { ctx.fillStyle = SHROUD; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.rect(S.x - 12, fy - hh * 0.85, 24, hh * 0.85); ctx.fill(); ctx.stroke(); });
      // the hold-breath note, when a grille lies in the plume's reach
      if (S.hint > 0 && mode === "play") {
        const nw = 230 * lv.cs / 0.75, nh = nw * 60 / 300;
        ctx.save(); ctx.globalAlpha = S.hint * (RM ? 1 : 0.65 + 0.35 * Math.sin(S.t * 6));
        piece("airway-note-hold", S.x - nw / 2 + 20, ty - 80 * lv.cs - nh - 22, nw, nh, () => { ctx.fillStyle = BLUE_D; ctx.font = `700 ${fsz(12)}px "Courier New",monospace`; ctx.textAlign = "center"; ctx.fillText("HOLD BREATH", S.x + 20, ty - 80 * lv.cs - 22); });
        ctx.restore();
      }
      ctx.restore();
    }

    // ---- HUD ------------------------------------------------------------------------------------------
    const hud = { bar: null, mask: null, img: null, mode: "" };
    function buildHud() {
      topEl.innerHTML = `<span><img data-i="hud-breath" alt="" aria-hidden="true">plume <b data-pl>open</b></span>
<span><img data-i="hud-pulse" data-pi alt="" aria-hidden="true">pulse <b data-pv>20</b> / <b data-line>77</b></span>
<span><img data-i="hud-shroud-open" data-sh alt="" aria-hidden="true"><b data-shroud>open</b></span>
<span class="${P}sp"></span><span>exposed <b data-exp>0</b></span>`;
      topEl.querySelectorAll("img").forEach((im) => { const u = icon(im.dataset.i); if (u) im.src = u; else im.style.display = "none"; });
      hud.pl = topEl.querySelector("[data-pl]"); hud.pv = topEl.querySelector("[data-pv]"); hud.line = topEl.querySelector("[data-line]");
      hud.shroud = topEl.querySelector("[data-shroud]"); hud.exp = topEl.querySelector("[data-exp]");
      hud.pi = topEl.querySelector("[data-pi]"); hud.sh = topEl.querySelector("[data-sh]");
      margin.innerHTML = `<b>PULSE</b><div class="${P}bar" role="meter" aria-label="Pulse" aria-valuemin="0" aria-valuemax="100"><img alt="" aria-hidden="true"><div class="u"></div><div class="m"></div><div class="l"></div></div><b>${flags.self}</b>`;
      hud.img = margin.querySelector("img"); hud.mask = margin.querySelector(".m"); hud.under = margin.querySelector(".u"); hud.mline = margin.querySelector(".l");
      hud.bar = margin.querySelector("." + P + "bar");
    }
    function updateHud(force) {
      if (!S) return;
      hud.pl.textContent = S.held ? "held" : S.closed ? "half" : S.pl > 6 ? "full" : "open";
      hud.pv.textContent = String(Math.round(S.pulse)); hud.line.textContent = String(pulseCap());
      hud.shroud.textContent = S.closed ? "closed" : "open";
      hud.exp.textContent = String(S.exposed.length);
      hud.bar.setAttribute("aria-valuenow", String(Math.round(S.pulse)));
      const frac = S.pulse / 100;
      hud.mask.style.left = (frac * 100) + "%"; hud.under.style.width = (frac * 100) + "%";
      hud.mline.style.left = flags.self + "%";
      const near = S.pulse >= flags.self - 14, at = S.pulse >= pulseCap() - 1.5;
      const m = at ? "hud-margin-green" : near ? "hud-margin-edge" : "hud-margin-calm";
      if (m !== hud.mode || force) { hud.mode = m; const u = icon(m); if (u) hud.img.src = u; hud.img.style.display = u ? "" : "none"; hud.bar.style.background = u ? PAPER : AMBER; }
      const pi = near ? "hud-pulse-edge" : "hud-pulse"; if (hud.pi.dataset.cur !== pi) { hud.pi.dataset.cur = pi; const u = icon(pi); if (u) hud.pi.src = u; }
      const si = S.closed ? "hud-shroud-closed" : "hud-shroud-open"; if (hud.sh.dataset.cur !== si) { hud.sh.dataset.cur = si; const u = icon(si); if (u) hud.sh.src = u; }
    }

    // ---- pad ------------------------------------------------------------------------------------------
    function buildPad() {
      const mk = (label, sub, key, hold, aria) => `<button type="button" data-b="${key}" ${hold ? 'data-hold="1"' : ""} aria-label="${esc(aria || label)}">${label}<small>${sub}</small></button>`;
      padEl.innerHTML = mk("◀", "A", "left", 1, "Push back") + mk("▶", "D", "right", 1, "Push on") + "<i></i>" +
        mk("Grip", "Space", "grip", 1, "Grip against the flow") + mk("Breath", "B", "breath", 1, "Hold breath") + mk("Shroud", "C", "shroud", 0) + "<i></i>" +
        mk("▲", "W", "up", 1, "Take the upper duct at the branch") + mk("▼", "S", "down", 1, "Stay on the lower duct at the branch");
      const hasBranch = lv.branch != null;
      padEl.querySelector('[data-b="up"]').hidden = !hasBranch; padEl.querySelector('[data-b="down"]').hidden = !hasBranch;
      const shB = padEl.querySelector('[data-b="shroud"]'); shB.setAttribute("aria-pressed", "false"); shB.disabled = !flags.shroud;
      padEl.querySelectorAll("button").forEach((b) => {
        const k = b.dataset.b;
        if (b.dataset.hold) {
          const dn = (e) => { e.preventDefault(); keys[k] = 1; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
          const up = () => { keys[k] = 0; b.classList.remove("down"); };
          on(b, "pointerdown", dn); on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
        } else on(b, "click", () => { shroudToggle(); syncPad(); });
      });
    }
    function syncPad() {
      const sb = padEl.querySelector('[data-b="shroud"]'); if (sb && S) sb.setAttribute("aria-pressed", String(!!S.closed));
      if (lv.branch != null && S) {
        const ub = padEl.querySelector('[data-b="up"]'), db = padEl.querySelector('[data-b="down"]');
        if (ub) ub.setAttribute("aria-pressed", String(S.pick === 1)); if (db) db.setAttribute("aria-pressed", String(S.pick === 0));
      }
    }

    // ---- input ----------------------------------------------------------------------------------------
    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
      " ": "grip", Spacebar: "grip", g: "grip", G: "grip", z: "grip", Z: "grip", b: "breath", B: "breath", x: "breath", X: "breath" };
    on(document, "keydown", (e) => {
      if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = KEYMAP[e.key];
      if (k) { keys[k] = 1; e.preventDefault(); syncPad(); return; }
      if (e.key === "c" || e.key === "C") { if (!e.repeat) shroudToggle(); syncPad(); }
    });
    on(document, "keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = 0; });
    const releaseAll = () => { keys.left = keys.right = keys.up = keys.down = keys.grip = keys.breath = 0; ptr.on = false; };
    on(window, "blur", releaseAll);
    on(panelEl, "pointerdown", (e) => { if (mode !== "play") return; ptr.on = true; try { panelEl.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    const pend = () => { ptr.on = false; };
    on(panelEl, "pointerup", pend); on(panelEl, "pointercancel", pend); on(panelEl, "lostpointercapture", pend);

    // ---- layout ---------------------------------------------------------------------------------------
    function layout() {
      const r = wrap.getBoundingClientRect();
      const ww = r.width || 800, hh = r.height || 600;
      const fixed = topEl.offsetHeight + margin.offsetHeight + padEl.offsetHeight + 44;
      sc = clamp(Math.min(ww / 500, (hh - fixed) / VH, 1.1), 0.4, 1.1);
      const ph = Math.round(VH * sc);
      panelEl.style.height = ph + "px";
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(ww); H = ph;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      for (const k in RAST) delete RAST[k];
    }
    function setCamera(snap) {
      if (!S) return;
      const viewW = W / sc;
      const target = clamp(S.x - viewW * 0.3, 0, Math.max(0, lv.worldW + 40 - viewW));
      const ty = -(ROW0 - S.y) * (40 / (ROW0 - ROWUP));
      camX = snap || RM ? target : camX + (target - camX) * 0.14;
      camY = snap || RM ? ty : camY + (ty - camY) * 0.12;
    }
    const ro = new ResizeObserver(() => { if (!dead) { layout(); if (S) setCamera(true); } });
    ro.observe(wrap);

    // ---- loop -----------------------------------------------------------------------------------------
    let last = 0, hudT = 0;
    function frame(ts) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts;
      if (S) {
        if (mode === "play") step(dt);
        else if (mode === "over") { S.fade = Math.min(1, S.fade + dt / (RM ? 0.2 : 1.3)); S.t += dt; S.pl = Math.max(0, S.pl - dt * 200); }
        setCamera(false);
        draw();
        hudT += dt; if (hudT > 0.1) { hudT = 0; updateHud(); syncPad(); }
      }
    }

    // ---- intro ----------------------------------------------------------------------------------------
    function intro() {
      mode = "intro";
      ov.hidden = false;
      let pick = 0;
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-modal="true" aria-label="How to play: The airway">
<div class="${P}kick" data-k></div><h2>The airway</h2>
<p class="${P}q">&ldquo;${esc(QUOTE)}&rdquo; <small>(Story: The Finale)</small></p>
<p data-scene></p>
<p>Your goal: <b data-goal></b>. The air carries him, and his breath goes downstream ahead of him as a grey plume. If the plume stays over a grille, the people in the room below are breathed on: they cough and leave, and nobody is harmed further. The path behind him is inked; what is ahead is still blue. <b>Win</b> is a clean pass, nobody breathed on; any other finish is a pass with names.
<ul class="${P}keys">
<li><b>Push</b><span>Left and Right (A, D) or the pad: a little with or against the air.</span></li>
<li><b>Grip</b><span>Space, or press and hold on the page: hold against the flow. A fan's air strains him (Pulse +1.5 a second); still in a clear duct, Pulse falls.</span></li>
<li><b>Breath</b><span>B (hold): no plume at all, Pulse +2 a second. At the Self line he has to breathe.</span></li>
<li><b>Shroud</b><span>C: closed halves the plume, Pulse +1 every 2 seconds.</span></li>
<li><b>Damper</b><span>A shut louvre blocks him and his breath. The bar above it counts the time to the change.</span></li>
<li data-branch><b>Branch</b><span>Up (W) takes the duct that rises; Down (S) or nothing stays straight on. The Ghost has inked one of them already.</span></li>
</ul>
<div class="${P}seq" role="group" aria-label="Sequence">${LEVELS.map((l, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">${esc(l.chapter)}<small>${esc(l.title)}</small></button>`).join("")}</div>
<button type="button" class="${P}go">Into the duct</button></div>`;
      const sync = () => {
        const l = LEVELS[pick];
        ov.querySelector("[data-k]").textContent = l.chapter + " · " + l.id;
        ov.querySelector("[data-scene]").textContent = l.scene;
        ov.querySelector("[data-goal]").textContent = l.goal;
        ov.querySelector("[data-branch]").style.display = l.branch != null ? "" : "none";
        ov.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === pick)));
      };
      ov.querySelectorAll("[data-s]").forEach((b) => on(b, "click", () => { pick = +b.dataset.s; sync(); }));
      on(ov.querySelector("." + P + "go"), "click", () => {
        ov.hidden = true; releaseAll(); build(LEVELS[pick]); buildPad(); layout(); setCamera(true); mode = "play";
        say(LEVELS[pick].flavour);
        updateHud(true); syncPad();
      });
      sync();
      ov.querySelector("." + P + "go").focus({ preventScroll: true });
    }

    buildHud();
    layout();
    build(LEVELS[0]);
    buildPad();
    mode = "intro";
    intro();
    wrap.__aw = { IMG, get S() { return S; }, get lv() { return lv; }, get grilles() { return grilles; }, get dampers() { return dampers; }, get mode() { return mode; }, flags, get sc() { return sc; } };
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        dead = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        timers.forEach(clearTimeout); timers.clear();
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const k in IMG) delete IMG[k];
        for (const k in RAST) delete RAST[k];
        wrap.remove();
      },
    };
  },
};

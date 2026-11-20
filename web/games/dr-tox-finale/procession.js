// Dr. Tox: Finale, 2D mode A: Procession (DESIGN.md section 10, `m2_procession`).
// Photocopied punk-zine collage: black toner on grey copy paper, cut-out marchers, ransom-note lettering,
// staples and tape. A real side-scroll with three parallax layers (0.3, 0.6, 1.2 of the camera), through a
// march that is itself moving left to right at walking pace. He walks faster than it; the page ends where
// the march does.
//
// Two sequences, each cut to a couple of minutes:
//   s2_procession_1  the road at dawn (chapter 5). A slow, kind march. The copier cart, banner poles, tract pages.
//                    Pulse is held five under the Self line (at the hold he doubles over for three seconds):
//                    the State's trigger is Procession 2's. At the front banner he chooses what to say.
//   s2_procession_2  the floodlit perimeter (chapter 6). Denser, quicker, frightened. Three floodlight masts
//                    (a dart blacks one out for twenty seconds), the shield line ahead. Pulse reaching Self fires
//                    the Toxin State (toxin_in_procession) and the page's corners go green. At the front he may
//                    step into the floodlights to draw the guns onto himself (march.drew_fire).
//
// Rules (DESIGN.md section 10 and 12): breath radius 1.0 m + Pulse/50 m, halved with the shroud closed. The
// march WANTS INTO the ring. Anyone inside it: Pulse +3 a second, and their name, want and one word appear
// (procession.touched). Nobody is harmed on the page. A raised hand stops followers within three metres, each
// with a chance of (100 - cult.doctrine) percent; it costs a second's stillness. Waiting with nobody in the ring:
// Pulse -2 a second, and the front pulls away. Shroud closed: +1 every 2 seconds (here +0.5 a second is the
// same figure). Carts and banner poles block; the copier cart drops tract pages that slow anyone who walks onto one.
// Reaching the front before the march reaches the end of the page sets march.front_reached. Being late is the
// cost, not a failure: the page finishes "done", and "win" is only the front.
//
// Shared flags (data/flags.json): reads pulse, amber, self, shroud.fitted, cult.doctrine, cult.turned_home;
// writes pulse, procession.touched, march.front_reached, march.choice, cult.turned_home, cult.doctrine (lead),
// and in Procession 2 march.drew_fire, march.hurt, toxin_in_procession, toxin_events, self, amber.
//
// Art (api.art, ASSET_MAP.md "Procession"): procession-road-/perimeter- far, mid, near; marchers, the four
// Tox poses, ring, name tag, banner, pole, cart, tract, masts, shield, arrow, strip, STOP., GO HOME.; shared
// hud-*. Every id falls back to a cut-paper shape drawn here when the bundle lacks it.
//
// Lines: the story line is Story: The Finale as DESIGN.md section 3 quotes it. Named people and wants are the
// bible's and DESIGN.md's "The cult" table. The other names, wants and words, the captions and the end lines
// are added for the game (the author approves or strikes them).

const P = "dtf-pr-";
const INK = "#16140f", PAPER = "#DAD6CB", PAPER2 = "#ECE9E0", TONER = "#2a2823", AMBER = "#D99A2B", GREEN = "#7FD957",
  RED = "#C93A3A", TAPE = "#E8DFB4";
const PPM = 88, VH = 540, FLOOR_TOP = 408, FLOOR_H = 84, DEPTH = 4, FIG_H = 150, BODY = 0.25, SOLID = 0.5;
const A = "procession-";

const QUOTE = "what he built starts moving without him";

// the bible's and DESIGN.md's people, with the want DESIGN.md gives each in the Finale
const NAMED = [
  ["Mercy Abiodun", "the settlement never to be afraid again", "Safe."],
  ["Petra Lind", "to be left alone", "Please."],
  ["Yusuf Demir", "to be useful", "Light."],
  ["Dov Ashkenazi", "the copier kept running", "Printed."],
  ["Lupe Andrade", "her hands steady enough to sew the banners", "Steady."],
  ["Kofi Mensah", "to see the river again", "River."],
  ["Teo Halloran", "to walk at the front", "Front."],
  ["Wren Halloran", "Teo to walk without a stick", "Closer."],
  ["Marisol Quiroga", "her son's boots back", "Boots."],
  ["Tomasz Wey", "to be the one who throws first", "First."],
];
// invented for the game: the rest of the march
const FOLK = [
  ["Ines Vukovic", "a bed for her mother"], ["Tobias Reyes", "his daughter's shoes, resoled"],
  ["Marguerite Aho", "water that isn't yellow"], ["Hakon Berg", "one hot meal, any meal"],
  ["Sunita Rao", "a letter read to her"], ["Jonah Pike", "to sit down"],
  ["Adaeze Mbeki", "bread for two"], ["Osei Lindqvist", "the lamp fixed"],
  ["Mirela Costa", "her dog let in"], ["Bartek Novak", "a blanket for the walk"],
  ["Lucia Faye", "a doctor who will look up"], ["Emeka Hart", "his wages, paid"],
  ["Greta Sloane", "her place kept"], ["Tomas Idowu", "news of his sister"],
  ["Yusra Haddad", "soap"], ["Walt Okonkwo", "his bucket back"],
  ["Cora Lindgren", "to be seen before dark"], ["Idris Marsh", "a quiet corner"],
  ["Noor Vasquez", "a note for the schoolroom"], ["Pavel Adeyemi", "his hands warm"],
  ["Rosalind Tran", "her mother's chair"], ["Beatrix Oyelaran", "the door to open"],
  ["Dario Lund", "his name on the list"], ["Hanne Sorensen", "a word with someone"],
  ["Jem Achterberg", "a drink for his brother"], ["Amara Delacroix", "a roof that holds"],
  ["Silas Petrov", "to get home by dark"], ["Wren Takahashi", "the road to end"],
  ["Odile Mensah", "her turn"], ["Gideon Pryce", "his father's coat"],
  ["Linnea Bright", "a clean cup"], ["Ravi Okoye", "morning, just once more"],
  ["Esme Calloway", "to be asked"], ["Dmitri Haas", "a straight road"],
  ["Fatou Lindqvist", "her sister beside her"], ["Anselm Roe", "the wind to drop"],
  ["Pilar Nwosu", "her son's name called"], ["Joaquin Pell", "work, any work"],
  ["Sabine Okafor", "the dust to settle"], ["Rufus Kane", "someone to say it was worth it"],
];
const WORDS = ["Holy.", "Closer.", "Please.", "Ours.", "Warm.", "Stay.", "Yours.", "Bless."];
// those who can be hurt at the perimeter, in order: five named, adults only
const HURTABLE = [["Marisol Quiroga", "her son's boots back"], ["Tomasz Wey", "to be the one who throws first"],
  ["Yusuf Demir", "to be useful"], ["Lupe Andrade", "her hands steady enough to sew the banners"], ["Kofi Mensah", "to see the river again"]];

const LEVELS = [
  { id: "s2_procession_1", n: 1, layer: "road", chapter: "Chapter 5 · Procession", title: "The road at dawn",
    L: 210, M: 1.0, head0: 44, people: 40, drift: 0.5, eager: 0.1, masts: 0, shield: false, cart: true, poles: 5,
    goal: "get from the rear of the march to the front banner before the march reaches the end of the road",
    scene: "Dawn, the plain road east of the camp. Banners of photocopied cut-outs. The march moves at walking pace and he is at its rear. They want into his ring.",
    flavour: "The march sets out. He is at its rear." },
  { id: "s2_procession_2", n: 2, layer: "perimeter", chapter: "Chapter 6 · The Perimeter", title: "The floodlit perimeter",
    L: 170, M: 1.05, head0: 38, people: 54, drift: 0.6, eager: 0.12, masts: 3, shield: true, cart: false, poles: 3,
    goal: "get to the front banner before the march reaches the shield line and the resin goes up at the glass",
    scene: "Night under the floodlights. The march as it was, less those who went home, frightened and dense. The shield line is ahead.",
    flavour: "The floodlights. The shield line is ahead." },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
      doctrine: clamp(num("cult.doctrine", 70), 0, 100),
      home: Math.max(0, Math.round(num("cult.turned_home", 0))),
    };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${PAPER};color:${INK};font-family:"Courier New",Courier,monospace;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}top{flex:0 0 auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:5px 10px;border-bottom:3px solid ${INK};background:${PAPER2};font:700 12px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase}
.${P}top span{display:flex;align-items:center;gap:5px;white-space:nowrap}
.${P}top img{width:22px;height:22px;display:block}
.${P}top .${P}sp{flex:1}
.${P}strip{position:relative;flex:0 0 auto;height:50px;background:${PAPER2};border-bottom:3px solid ${INK};overflow:hidden}
.${P}strip canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}panel{position:relative;flex:0 0 auto;width:100%;background:${PAPER};touch-action:none;cursor:crosshair;overflow:hidden}
.${P}panel canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}flash{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .35s}
.${P}flash.on{opacity:1;transition:none}
.${P}log{flex:1 1 auto;min-height:34px;overflow:hidden;padding:5px 10px;background:${PAPER2};border-top:3px solid ${INK};font:700 13px/1.3 Georgia,serif}
.${P}log div{opacity:.55;font-weight:400;font-style:italic}
.${P}log div:first-child{opacity:1;font-weight:700;font-style:normal}
.${P}margin{position:relative;flex:0 0 auto;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px;background:${PAPER2};border-top:2px solid ${INK}}
.${P}margin b{font:700 12px "Courier New",monospace;letter-spacing:.1em;white-space:nowrap}
.${P}bar{position:relative;flex:1;height:26px;border:2px solid ${INK};background:${PAPER};overflow:hidden}
.${P}bar img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block}
.${P}bar .m{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:${AMBER};border:2px solid ${INK};box-sizing:border-box}
.${P}bar .u{position:absolute;left:0;bottom:0;height:5px;background:${INK}}
.${P}bar .l{position:absolute;top:-2px;bottom:-2px;width:0;border-left:3px dashed ${INK}}
.${P}pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:6px 8px 8px;background:${PAPER2}}
.${P}pad button{font:700 14px "Courier New",monospace;color:${INK};background:${PAPER2};border:3px solid ${INK};box-shadow:2px 2px 0 ${INK};min-width:50px;min-height:46px;padding:4px 8px;cursor:pointer;touch-action:none;text-transform:uppercase}
.${P}pad button small{display:block;font-size:10px;font-weight:400;opacity:.7;text-transform:none}
.${P}pad button.down,.${P}pad button[aria-pressed=true]{background:${INK};color:${PAPER2}}
.${P}pad button[hidden]{display:none}
.${P}pad button:disabled{opacity:.4}
.${P}pad button:focus-visible,.${P}ov button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}pad i{width:6px}
.${P}ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(22,20,15,.62);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}card{position:relative;max-width:640px;width:100%;box-sizing:border-box;margin:auto;background:${PAPER2};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:18px 18px 16px;font-family:Georgia,"Times New Roman",serif;background-image:repeating-linear-gradient(135deg,transparent 0 5px,rgba(22,20,15,.045) 5px 6px)}
.${P}tape{position:absolute;top:-14px;left:22px;width:96px;transform:rotate(-4deg);pointer-events:none}
.${P}tape.r{left:auto;right:22px;transform:rotate(5deg)}
.${P}kick{font:700 12px "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase}
.${P}card h2{margin:2px 0 6px;font:900 30px/1.05 Georgia,serif;text-transform:uppercase;letter-spacing:.02em}
.${P}q{margin:0 0 8px;padding-left:10px;border-left:6px solid ${INK};font-style:italic;font-size:16px}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font-size:14px}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${PAPER2};font:700 12px "Courier New",monospace;padding:2px 6px;text-transform:uppercase;text-align:center}
.${P}seq{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 10px}
.${P}seq button,.${P}opts button{font:700 13px "Courier New",monospace;text-transform:uppercase;text-align:left;padding:8px;background:${PAPER2};color:${INK};border:3px solid ${INK};cursor:pointer;min-height:56px}
.${P}seq button small,.${P}opts button small{display:block;font-weight:400;text-transform:none;font-size:11px;margin-top:2px;font-family:Georgia,serif}
.${P}seq button[aria-pressed=true]{background:${INK};color:${PAPER2}}
.${P}opts{display:grid;gap:8px;margin:8px 0 4px}
.${P}opts button:hover{background:${INK};color:${PAPER2}}
.${P}go{position:sticky;bottom:4px;font:700 17px "Courier New",monospace;text-transform:uppercase;background:${INK};color:${PAPER2};border:3px solid ${INK};padding:10px 26px;cursor:pointer}
.${P}gh{display:block;height:44px;margin:4px 0 6px}
@media (max-width:640px){.${P}pad{flex-wrap:nowrap;gap:4px;padding:6px}.${P}pad button{flex:1 1 0;min-width:0;padding:3px 1px;font-size:11px}.${P}pad button small{display:none}.${P}pad i{width:2px}
 .${P}card{padding:14px 12px 12px}.${P}card h2{font-size:24px}.${P}seq{grid-template-columns:1fr}.${P}keys li{grid-template-columns:78px 1fr}.${P}top{font-size:11px;gap:6px}}
`;
    const topEl = document.createElement("div"); topEl.className = P + "top";
    const stripEl = document.createElement("div"); stripEl.className = P + "strip";
    const sv = document.createElement("canvas");
    sv.setAttribute("role", "img");
    sv.setAttribute("aria-label", "The march from above, as a column of cut-out heads, with Dr. Tox as a red tape arrow moving up it toward the front banner");
    stripEl.appendChild(sv);
    const panelEl = document.createElement("div"); panelEl.className = P + "panel";
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "The march: Dr. Tox among cut-out marchers, the white ring of his breath on the road, and the front banner ahead");
    const flashEl = document.createElement("div"); flashEl.className = P + "flash";
    panelEl.append(cv, flashEl);
    const logEl = document.createElement("div"); logEl.className = P + "log"; logEl.setAttribute("aria-live", "polite");
    const margin = document.createElement("div"); margin.className = P + "margin";
    const padEl = document.createElement("div"); padEl.className = P + "pad";
    const ov = document.createElement("div"); ov.className = P + "ov";
    wrap.append(css, topEl, stripEl, panelEl, logEl, margin, padEl, ov);
    root.appendChild(wrap);
    const ctx = cv.getContext("2d");
    const sctx = sv.getContext("2d");

    // ---- art ------------------------------------------------------------------------------------------
    const IMG = {};
    const hasArt = (id) => !!(art.has && art.has(id));
    const IDS = ["road", "perimeter"].flatMap((l) => ["far", "mid", "near"].map((k) => `${A}${l}-${k}`))
      .concat(["arrow", "cart", "front-banner", "go-home", "marcher-banner", "marcher-home", "marcher-jerrican", "marcher-reach",
        "marcher-stopped", "marcher-walk-a", "marcher-walk-b", "mast-dark", "mast-lit", "name-tag", "pole", "ring", "shield", "stop",
        "strip", "tox", "tox-dart", "tox-hand", "tox-open", "tract"].map((s) => A + s));
    const artReady = Promise.all(IDS.filter(hasArt).map((id) => Promise.resolve(art.img(id)).then((im) => { if (im) IMG[id] = im; }).catch(() => {})));
    const RAST = {}; // decoded SVG drawn once into a bitmap at the size it is used, so frames only blit
    function ras(id, w, h, phys) {
      const im = IMG[id]; if (!im) return null;
      const pw = Math.max(1, Math.round(phys ? w : w * dpr)), ph = Math.max(1, Math.round(phys ? h : h * dpr));
      const key = id + "|" + pw + "|" + ph;
      let c = RAST[key];
      if (!c) { c = document.createElement("canvas"); c.width = pw; c.height = ph; c.getContext("2d").drawImage(im, 0, 0, pw, ph); RAST[key] = c; }
      return c;
    }
    const nat = (id) => { const im = IMG[id]; return im ? [im.naturalWidth || im.width, im.naturalHeight || im.height] : null; };
    const icon = (id) => (hasArt(id) && art.url ? art.url(id) : "");

    // ---- state ----------------------------------------------------------------------------------------
    let lv = LEVELS[0], mode = "intro"; // intro | play | choice | over
    let S = null, PL = null, people = [], obst = [], tracts = [], masts = [], seq = 0;
    const keys = { left: 0, right: 0, up: 0, down: 0, hold: 0 };
    const ptr = { on: false, x: 0, y: 0 };
    let W = 800, H = 540, sc = 1, dpr = 1, camX = 0, SW = 800, SH = 50;
    let logLines = [];

    const floorY = (z) => (FLOOR_TOP + (z / DEPTH) * FLOOR_H) * sc;
    const worldX = (x) => (x - camX) * PPM * sc;
    const selfLine = () => flags.self;
    const pulseFloor = () => (flags.amber === 0 ? 40 : 20);
    const pulseCap = () => (lv.n === 2 ? selfLine() : Math.max(pulseFloor() + 2, selfLine() - 5));

    function say(t) {
      logLines.unshift(t);
      if (logLines.length > 2) logLines.length = 2;
      logEl.innerHTML = logLines.map((l) => `<div>${esc(l)}</div>`).join("");
    }

    // ---- the page -------------------------------------------------------------------------------------
    function build(level) {
      lv = level;
      S = {
        t: 0, pulse: 0, touched: [], front: false, closed: false, handT: 0, handCd: 0, dartT: 0, darts: 0, slowT: 0, bentT: 0,
        ending: 0, shake: 0, toxin: false, stopped: 0, tractT: 0, headX: level.head0, over: false, volley: 0, volleyDone: false,
        stopFx: 0, cap: 0, idle: 0, inRing: false, nearest: 99,
      };
      const rng = mulberry(9100 + level.n * 173 + (seq++ % 3));
      PL = { x: 0.9, z: DEPTH * 0.5, face: 1, bob: 0, moving: false };
      S.pulse = Math.max(pulseFloor(), Math.min(flags.pulse, pulseCap() - 30));
      people = []; obst = []; tracts = []; masts = [];
      const count = level.n === 2 ? Math.max(24, level.people - flags.home) : level.people;
      const named = level.n === 1
        ? ["Mercy Abiodun", "Petra Lind", "Yusuf Demir", "Dov Ashkenazi", "Lupe Andrade", "Kofi Mensah", "Teo Halloran"]
        : ["Mercy Abiodun", "Yusuf Demir", "Wren Halloran", "Teo Halloran", "Marisol Quiroga", "Tomasz Wey", "Lupe Andrade", "Kofi Mensah"];
      const pool = FOLK.slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const span = level.head0 - 3.2;
      let pi = 0;
      for (let i = 0; i < count; i++) {
        const sx = 3.4 + (i + 0.2 + rng() * 0.6) * (span / count);
        const z = 0.45 + rng() * (DEPTH - 0.9);
        let nm, want, word;
        if (i < named.length) {
          const nn = NAMED.find((n) => n[0] === named[i]);
          nm = nn[0]; want = nn[1]; word = nn[2];
        } else { const f = pool[pi++ % pool.length]; nm = f[0]; want = f[1]; word = WORDS[Math.floor(rng() * WORDS.length)]; }
        people.push({ name: nm, want, word, slot: sx, slotZ: z, x: sx, z, face: 1, ph: rng() * 6.28, st: "march", stT: 0,
          eager: rng() < level.eager + flags.doctrine / 500, kind: rng() < 0.18 ? "banner" : rng() < 0.12 ? "jerrican" : "walk",
          tagT: 0, touched: false, cough: 0, sep: 0, hold: 0, inT: 0, sat: 0 });
      }
      // shuffle the named ones through the column so they are not all at the rear
      people.sort((a, b) => a.slot - b.slot);
      for (const p of people) { if (p.name === "Petra Lind") p.kind = "home"; if (p.name === "Mercy Abiodun") p.kind = "banner"; }
      // the front banner is at S.headX. The copier cart rides in the column with Dov
      if (level.cart) {
        const dov = people.find((p) => p.name === "Dov Ashkenazi");
        if (dov) { dov.slot = level.head0 - 14; dov.x = dov.slot; dov.slotZ = 3.0; dov.z = 3.0; dov.cartNear = true; }
        S.cart = { x: level.head0 - 16.4, z: 3.0, drop: 4 };
      }
      const rp = mulberry(311 + level.n);
      for (let i = 0; i < level.poles; i++) obst.push({ x: 22 + (i + 0.2 + rp() * 0.6) * ((level.L - 40) / level.poles), z: 0.6 + rp() * (DEPTH - 1.2), r: 0.32, pole: true });
      if (level.masts) for (let i = 0; i < level.masts; i++) masts.push({ x: level.L - 46 + i * 20, dark: 0 });
      logLines = []; logEl.innerHTML = "";
      setCamera(true);
      updateHud(true);
    }

    // ---- sim ------------------------------------------------------------------------------------------
    function radius() { return (1.0 + S.pulse / 50) * (S.closed ? 0.5 : 1); }
    function push(o, r, e) { // push entity e out of a circle obstacle
      const dx = e.x - o.x, dz = e.z - o.z, d = Math.hypot(dx, dz), m = o.r + r;
      if (d < m && d > 0.0001) { e.x = o.x + (dx / d) * m; e.z = clamp(o.z + (dz / d) * m, 0.3, DEPTH - 0.3); }
      else if (d <= 0.0001) e.x += m;
    }
    function step(dt) {
      if (mode !== "play") return;
      S.t += dt;
      S.shake = Math.max(0, S.shake - dt); S.stopFx = Math.max(0, S.stopFx - dt);
      S.handT = Math.max(0, S.handT - dt); S.handCd = Math.max(0, S.handCd - dt); S.dartT = Math.max(0, S.dartT - dt);
      S.slowT = Math.max(0, S.slowT - dt); S.bentT = Math.max(0, S.bentT - dt);
      // the march
      if (S.headX < lv.L) S.headX = Math.min(lv.L, S.headX + lv.M * dt);
      const marching = S.headX < lv.L;
      // input
      let ix = keys.right - keys.left, iz = keys.down - keys.up;
      if (ptr.on) {
        const tx = camX + ptr.x / (PPM * sc), tz = clamp(((ptr.y / sc) - FLOOR_TOP) / (FLOOR_H / DEPTH), 0, DEPTH);
        const dx = tx - PL.x, dz = tz - PL.z, d = Math.hypot(dx, dz);
        if (d > 0.3) { ix = dx / d; iz = dz / d; } else { ix = 0; iz = 0; }
      }
      const still = S.handT > 0 || S.bentT > 0;
      const moving = !keys.hold && !still && (ix || iz);
      let sp = 1.7 * (S.closed ? 0.7 : 1) * (S.slowT > 0 ? 0.5 : 1);
      if (moving) {
        const m = Math.hypot(ix, iz) || 1;
        PL.x = clamp(PL.x + (ix / m) * sp * dt, 0.6, lv.L + 1.5);
        PL.z = clamp(PL.z + (iz / m) * sp * 0.7 * dt, 0.3, DEPTH - 0.3);
        if (ix) PL.face = ix > 0 ? 1 : -1;
        PL.bob += dt * 9;
      }
      PL.moving = !!moving;
      // solid things: bodies, poles, the cart
      for (const o of obst) push(o, 0.3, PL);
      if (S.cart) { for (let k = 0; k < 3; k++) push({ x: S.cart.x + k * 0.9, z: S.cart.z, r: 0.5 }, 0.3, PL); }
      for (const p of people) {
        const dx = PL.x - p.x, dz = PL.z - p.z, d = Math.hypot(dx, dz);
        if (d < SOLID && d > 0.001) { PL.x = p.x + (dx / d) * SOLID; PL.z = clamp(p.z + (dz / d) * SOLID, 0.3, DEPTH - 0.3); }
        else if (d <= 0.001) PL.x += SOLID;
      }
      if (S.cart) { S.cart.x += marching ? lv.M * dt : 0; S.cart.drop -= dt; if (S.cart.drop <= 0 && tracts.length < 6) { S.cart.drop = 9 + Math.random() * 4; tracts.push({ x: S.cart.x - 0.6, z: 0.6 + Math.random() * (DEPTH - 1.2), rot: (Math.random() - 0.5) * 1.2 }); } }
      for (let i = tracts.length - 1; i >= 0; i--) {
        const t = tracts[i];
        if (Math.hypot(t.x - PL.x, (t.z - PL.z) * 1.4) < 0.5) {
          tracts.splice(i, 1); S.slowT = 1.0; say("A tract page underfoot. He stops to read it: THE RING IS HOLY.");
        }
      }
      PL.x = clamp(PL.x, 0.6, lv.L + 1.5);
      if (PL.x > S.headX - 0.4 && !S.front) PL.x = Math.min(PL.x, S.headX + 0.2);
      S.stateWalk = moving ? 1 : 0;

      // the ring
      const R = radius();
      let inside = 0, nearest = 99;
      for (const p of people) {
        p.tagT = Math.max(0, p.tagT - dt); p.cough = Math.max(0, p.cough - dt); p.sep = Math.max(0, p.sep - dt);
        const dxp = PL.x - p.x, dzp = PL.z - p.z, dist = Math.hypot(dxp, dzp);
        // the march's slot moves with the march (the head stops at the end of the page)
        if (marching) p.slot += lv.M * dt;
        let vx = 0, vz = 0;
        if (p.st === "stopped") {
          p.stT -= dt;
          if (dist < 3.3) vx = -Math.sign(dxp || 1) * 1.3; // steps back
          if (p.stT <= 0) { p.st = "march"; }
        } else {
          p.sat = Math.max(0, p.sat - dt);
          const want = p.eager && p.sat <= 0 && dist < 6.2 && dist > SOLID * 0.9;
          if (want) { p.st = "want"; vx = (marching ? lv.M : 0) + Math.sign(dxp) * lv.drift; vz = Math.sign(dzp) * lv.drift * 0.7; if (Math.abs(dxp) < 0.3) vx = marching ? lv.M : 0; }
          else {
            p.st = "march";
            vx = (marching ? lv.M : 0) + clamp((p.slot - p.x) * 1.5, -1.5, 1.5);
            if (p.sat > 0 && dist < R + 0.9) vx = (marching ? lv.M : 0) - Math.sign(dxp || 1) * 2.6; // content, they back out of the ring
            vz = clamp((p.slotZ - p.z) * 1.2, -0.8, 0.8);
          }
        }
        p.x += vx * dt; p.z = clamp(p.z + vz * dt, 0.35, DEPTH - 0.35);
        if (Math.abs(vx) > 0.05) p.face = vx > 0 ? 1 : -1;
        p.hold = vx;
      }
      // marchers do not stack: a soft separation, and the poles and cart are solid to them too
      for (let i = 0; i < people.length; i++) {
        const a = people[i];
        for (let j = i + 1; j < people.length; j++) {
          const b = people[j], dx = b.x - a.x, dz = (b.z - a.z) * 1.3;
          if (dx > 0.62 || dx < -0.62) continue;
          const d = Math.hypot(dx, dz);
          if (d < 0.62 && d > 0.001) { const f = (0.62 - d) * 0.5; a.x -= (dx / d) * f; b.x += (dx / d) * f; a.z = clamp(a.z - (dz / d) * f * 0.6, 0.35, DEPTH - 0.35); b.z = clamp(b.z + (dz / d) * f * 0.6, 0.35, DEPTH - 0.35); }
        }
        for (const o of obst) push(o, 0.25, a);
        if (S.cart) for (let k = 0; k < 3; k++) push({ x: S.cart.x + k * 0.9, z: S.cart.z, r: 0.5 }, 0.25, a);
        // pushed out of the player's body (so he can shoulder through), and kept clear of the banner
        const dx = a.x - PL.x, dz = a.z - PL.z, d = Math.hypot(dx, dz);
        if (d < SOLID * 0.8 && d > 0.001) { a.x = PL.x + (dx / d) * SOLID * 0.8; a.z = clamp(PL.z + (dz / d) * SOLID * 0.8, 0.35, DEPTH - 0.35); }
        if (a.x > S.headX - 0.5) a.x = S.headX - 0.5;
        const edge = Math.hypot(a.x - PL.x, a.z - PL.z) - BODY - R;
        nearest = Math.min(nearest, edge);
        if (edge < 0 && a.eager) { // those who came in on purpose; the rest of the march only walks past
          inside++; a.inT += dt;
          if (!a.touched) touch(a);
          if (a.inT > 0.5) { a.sat = 14; a.inT = 0; } // having been in the ring, they are content a while and fall back to their place
        } else a.inT = 0;
      }
      S.nearest = nearest; S.inRing = inside > 0;
      // pulse
      if (inside > 0) S.pulse += 3 * dt;
      if (S.closed) S.pulse += 0.5 * dt;
      if (!moving && inside === 0) { S.pulse -= 2 * dt; S.idle += dt; } else S.idle = 0;
      // masts relight
      for (const m of masts) if (m.dark > 0) { m.dark -= dt; if (m.dark <= 0) { m.dark = 0; say("A mast comes back on."); } }
      S.pulse = clamp(S.pulse, pulseFloor(), 100);
      if (lv.n === 1) {
        const cap = pulseCap();
        if (S.pulse >= cap) { S.pulse = cap; if (S.bentT <= 0 && S.cap <= 0) { S.bentT = 3; S.cap = 5; S.capHits = (S.capHits || 0) + 1; say("Pulse at the hold, five under the line. He doubles over for three seconds."); flash(AMBER, 0.4); } }
        S.cap = Math.max(0, S.cap - dt);
      } else if (S.pulse >= selfLine() - 0.001) { finish("lose", "toxin"); return; }
      // the front and the end of the page
      if (!S.front && PL.x >= S.headX - 1.3) { reachFront(); return; }
      if (S.headX >= lv.L && !S.over) { S.endT = (S.endT || 0) + dt; if (S.endT > 0.8) { finish("done", "late"); return; } }
    }
    function touch(p) {
      p.touched = true; p.cough = 0.7; p.tagT = 4.6;
      S.touched.push({ name: p.name, want: p.want, word: p.word });
      S.shake = RM ? 0 : 0.18;
      say(`${p.name} wants into the ring. ${p.want.charAt(0).toUpperCase() + p.want.slice(1)}. "${p.word}"`);
      flash(TONER, 0.22);
    }
    function hand() {
      if (mode !== "play" || S.handCd > 0 || S.handT > 0) return;
      S.handT = 1.0; S.handCd = 2.0; S.stopFx = 1.0;
      const chance = (100 - flags.doctrine) / 100;
      let near = 0, ok = 0;
      for (const p of people) {
        if (Math.hypot(p.x - PL.x, p.z - PL.z) > 3 || p.st === "stopped") continue;
        near++;
        if (Math.random() < chance) { p.st = "stopped"; p.stT = 8; ok++; S.stopped++; }
      }
      if (!near) say("Hand up. Nobody close enough to stop. A second lost.");
      else say(`Hand up. "Stop." ${ok} of ${near} stop and step back; ${near - ok === 0 ? "none come on" : (near - ok) + " come on"}. (${Math.round(chance * 100)} percent each.)`);
    }
    function dart() {
      if (mode !== "play" || lv.n !== 2 || S.dartT > 0) return;
      let tgt = null, best = 99;
      for (const m of masts) { const dx = m.x - PL.x; if (m.dark <= 0 && dx > -3 && dx < 10 && Math.abs(dx) < best) { best = Math.abs(dx); tgt = m; } }
      S.dartT = 0.5;
      if (!tgt) { say("No lit mast within reach of a dart. No cost."); return; }
      tgt.dark = 20; S.darts++; S.pulse = Math.min(100, S.pulse + 12);
      say("Dart. A mast goes dark for twenty seconds: fewer of the march lit for the guns. Pulse +12.");
      flash(INK, 0.3);
    }
    function shroud() {
      if (mode !== "play") return;
      if (!flags.shroud) { say("The shroud is not fitted yet."); return; }
      S.closed = !S.closed; say(S.closed ? "Shroud drawn closed. Half the ring; the trapped breath adds Pulse." : "Shroud open.");
    }

    // ---- the front ------------------------------------------------------------------------------------
    function writeShared(extra) {
      shared.set("pulse", Math.round(S.pulse));
      const led = shared.get("procession.touched", []);
      const list = Array.isArray(led) ? led.slice() : [];
      for (const e of S.touched) list.push({ name: e.name, want: e.want, word: e.word });
      shared.set("procession.touched", list);
      shared.set("march.front_reached", !!S.front);
      store.set("done" + lv.n, true);
      if (extra) extra();
    }
    function reachFront() {
      S.front = true; mode = "choice";
      for (const k in keys) keys[k] = 0; ptr.on = false;
      ov.hidden = false;
      const gh = icon(A + "go-home");
      const marchSize = 70;
      if (lv.n === 1) {
        const turn = Math.round(marchSize * (100 - flags.doctrine) / 100) + 1;
        ov.innerHTML = `<div class="${P}card" role="dialog" aria-modal="true" aria-label="The front banner">
${tapes()}<div class="${P}kick">The front banner · march.choice</div><h2>The front</h2>
${gh ? `<img class="${P}gh" alt="GO HOME." src="${gh}">` : ""}
<p>He is at the head of the march, under the banner. Behind him they are still coming, wanting in. What does he say to them? (On the road this is the scene the 3D page, <i>s3_march_front</i>, plays: this stands in for it.)</p>
<div class="${P}opts">
<button type="button" data-c="home">&ldquo;Go home.&rdquo;<small>Some turn: about ${turn - 1} of ${marchSize}, set by the doctrine (${flags.doctrine}), and Petra Lind always.</small></button>
<button type="button" data-c="lead">Lead them<small>He takes the front and does not say what for. Doctrine +10.</small></button>
<button type="button" data-c="alone">Walk on alone at the front<small>He says nothing. Nothing changes.</small></button></div></div>`;
      } else {
        const lit = masts.filter((m) => m.dark <= 0).length;
        ov.innerHTML = `<div class="${P}card" role="dialog" aria-modal="true" aria-label="The front, before the volley">
${tapes()}<div class="${P}kick">The front banner · march.drew_fire</div><h2>The front</h2>
<p>He is at the head of the march. Ahead are the shield line and the glass. In a moment the march's middle will throw resin at it, and the guns will answer. ${lit === 3 ? "All three masts are lit." : (3 - lit) + " of the three masts are dark, so fewer of the march are lit for the guns."}</p>
<div class="${P}opts">
<button type="button" data-c="step">Step out into the floodlights<small>He draws the guns onto himself. Pulse +15. Fewer of the march are hurt.</small></button>
<button type="button" data-c="stay">Stay in the line<small>He stays with them. The guns take whom they take.</small></button></div></div>`;
      }
      ov.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => choose(b.dataset.c)));
      const f = ov.querySelector("[data-c]"); if (f) f.focus({ preventScroll: true });
    }
    function choose(c) {
      if (mode !== "choice") return;
      ov.hidden = true;
      if (lv.n === 1) {
        const marchSize = 70;
        const turn = c === "home" ? Math.round(marchSize * (100 - flags.doctrine) / 100) + 1 : 0;
        let text;
        if (c === "home") text = `"Go home." ${turn} turn back down the road, Petra Lind first. The rest come on, and the march goes down to the perimeter smaller.`;
        else if (c === "lead") text = "He takes the front and does not say what for. They take that to mean something. The doctrine grows by ten, and the march goes down to the perimeter as large as it was.";
        else text = "He walks on at the front, and says nothing. The march goes down to the perimeter as large as it was.";
        const t = S.touched.length;
        text += ` ${t ? t + " " + (t === 1 ? "person" : "people") + " stepped into his ring on purpose; nobody was harmed on the page." : "Nobody stepped into his ring."}`;
        writeShared(() => {
          shared.set("march.choice", c);
          shared.set("cult.turned_home", Math.round(num("cult.turned_home", 0)) + turn);
          if (c === "lead") shared.set("cult.doctrine", clamp(flags.doctrine + 10, 0, 100));
        });
        endWith("win", text);
      } else {
        if (c === "step") { S.pulse = Math.min(100, S.pulse + 15); S.drew = true; if (S.pulse >= selfLine() - 0.001) { finish("lose", "toxin"); return; } }
        volley(true);
      }
    }
    function volley(front) {
      const lit = masts.filter((m) => m.dark <= 0).length;
      let n = lit === 3 ? 5 : lit === 2 ? 4 : lit === 1 ? 3 : 2;
      if (S.drew) n = Math.max(1, n - 3);
      const hurt = HURTABLE.slice(0, n).map((h) => ({ name: h[0], want: h[1] }));
      S.hurt = hurt; S.volley = 1;
      const t = S.touched.length;
      let text = front
        ? (S.drew ? "He steps out of the line into the floodlights, and the guns turn on him. " : "He stays in the line. ")
        : "The march reached the shield line without him, and he is somewhere in the middle of it. ";
      text += "The march's middle throws its resin at the glass. ";
      text += `${hurt.length} of the march ${hurt.length === 1 ? "is" : "are"} hurt and carried out by their own: ${hurt.map((h) => `${h.name} (${h.want})`).join("; ")}. `;
      text += t ? `${t} stepped into his ring on purpose on the way.` : "Nobody stepped into his ring on the way.";
      writeShared(() => {
        shared.set("march.drew_fire", !!S.drew);
        const led = shared.get("march.hurt", []);
        const list = Array.isArray(led) ? led.slice() : [];
        for (const h of hurt) list.push({ name: h.name, want: h.want });
        shared.set("march.hurt", list);
      });
      endWith(front ? "win" : "done", text, RM ? 150 : 2600);
    }
    function endWith(outcome, text, delay) {
      mode = "over"; S.over = true;
      later(() => { if (!dead) api.end({ outcome, text }); }, delay != null ? delay : RM ? 150 : 700);
    }

    // ---- finishing ------------------------------------------------------------------------------------
    function flash(col, a) {
      if (RM) return;
      flashEl.style.background = `radial-gradient(ellipse at center,transparent 55%,${col} 130%)`;
      flashEl.style.opacity = String(a == null ? 0.5 : a);
      flashEl.classList.add("on");
      later(() => { flashEl.classList.remove("on"); flashEl.style.opacity = "0"; }, 90);
    }
    function finish(outcome, how) {
      if (mode === "over") return;
      const t = S.touched.length;
      const names = t ? `${t} ${t === 1 ? "person" : "people"} stepped into his ring on purpose; nobody was harmed on the page.` : "Nobody stepped into his ring.";
      let text;
      if (how === "toxin") {
        S.toxin = true;
        const firstTime = !store.get("toxin:" + lv.id, false);
        shared.set("toxin_in_procession", true);
        if (firstTime) {
          store.set("toxin:" + lv.id, true);
          const ev = shared.get("toxin_events", []);
          const list = Array.isArray(ev) ? ev.slice() : [];
          list.push({ chapter: "c6_perimeter", scene: lv.id, trigger: "pulse", reconstructed: false });
          shared.set("toxin_events", list);
          shared.set("self", Math.max(0, flags.self - 15));
          if (typeof flags.amber === "number") shared.set("amber", Math.max(0, flags.amber - 2));
        }
        text = `Pulse reached the line. The page's corners go green, and it cuts. Split Field follows. ${names}`;
        writeShared();
        mode = "over"; S.over = true; S.ending = 1;
        if (!RM) { flashEl.style.background = `radial-gradient(ellipse at center,transparent 35%,${GREEN} 140%)`; flashEl.style.opacity = "1"; flashEl.classList.add("on"); }
        later(() => { if (!dead) api.end({ outcome, text }); }, RM ? 150 : 900);
        return;
      }
      if (lv.n === 2) { S.over = false; mode = "play"; volley(false); return; }
      text = `The march reached the end of the road without him, and he is in the middle of it. Late is the cost: nobody turned to look at the front. ${names}`;
      writeShared();
      endWith(outcome, text);
    }

    // ---- drawing --------------------------------------------------------------------------------------
    function hatch(x, y, w, h, gap, ang, alpha) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.globalAlpha = alpha; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1, sc);
      ctx.beginPath();
      const d = Math.max(w, h) * 1.2;
      for (let i = -d; i < d; i += gap) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h * ang, y); }
      ctx.stroke(); ctx.restore();
    }
    function fallbackBackdrop(factor, kind) {
      const tile = 520 * sc * (factor < 0.5 ? 1.5 : 1);
      const off = (camX * PPM * sc * factor) % tile;
      ctx.save(); ctx.strokeStyle = INK;
      for (let x = -off; x < W + tile; x += tile) {
        if (kind === "far") hatch(x + tile * 0.1, 230 * sc, tile * 0.8, 120 * sc, 7 * sc, 0.3, 0.22);
        else if (kind === "mid") { ctx.fillStyle = TONER; ctx.beginPath(); ctx.moveTo(x + tile * 0.3, 380 * sc); ctx.lineTo(x + tile * 0.36, 330 * sc); ctx.lineTo(x + tile * 0.42, 380 * sc); ctx.fill(); }
        else { ctx.lineWidth = 3 * sc; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(x, 470 * sc); ctx.lineTo(x + 8 * sc, 540 * sc); ctx.stroke(); ctx.globalAlpha = 1; }
      }
      ctx.restore();
    }
    function drawLayer(kind, factor) {
      const id = `${A}${lv.layer}-${kind}`;
      const im = IMG[id];
      if (!im) { fallbackBackdrop(factor, kind); return; }
      const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      const th = Math.round(VH * sc), tw = Math.round((iw / ih) * th);
      const rc = ras(id, tw, th) || im;
      const off = (((camX * PPM * sc * factor) % tw) + tw) % tw;
      for (let x = -off; x < W; x += tw) ctx.drawImage(rc, Math.round(x), 0, tw + 1, th);
    }
    function figure(id, cx, fy, h, flip, rot) {
      const im = IMG[id];
      if (im) {
        const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, w = (iw / ih) * h;
        ctx.save(); ctx.translate(cx, fy); if (flip) ctx.scale(-1, 1);
        if (rot) ctx.rotate(rot);
        ctx.drawImage(ras(id, w, h) || im, -w / 2, -h, w, h); ctx.restore();
        return;
      }
      const w = h * 0.4;
      ctx.save(); ctx.translate(cx, fy); ctx.fillStyle = TONER; ctx.strokeStyle = PAPER2; ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w * 0.4, -h * 0.65); ctx.lineTo(w * 0.4, -h * 0.65); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -h * 0.8, h * 0.13, 0, 7); ctx.fill();
      ctx.restore();
    }
    function prop(id, cx, fy, h, fb) {
      const im = IMG[id];
      if (im) { const n = nat(id); const w = (n[0] / n[1]) * h; ctx.drawImage(ras(id, w, h) || im, cx - w / 2, fy - h, w, h); return w; }
      if (fb) fb(cx, fy, h);
      return h * 0.5;
    }
    function ellipsePath(cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2); }
    function drawRing(R) {
      const cx = worldX(PL.x), cy = floorY(PL.z);
      const rx = R * PPM * sc, ry = R * (FLOOR_H / DEPTH) * sc;
      const id = A + "ring", im = IMG[id];
      if (im) { const n = nat(id); ctx.drawImage(ras(id, n[0], n[1], true) || im, cx - rx, cy - ry * 1.08, rx * 2, ry * 2.16); }
      else { ctx.fillStyle = PAPER2; ellipsePath(cx, cy, rx, ry); ctx.fill(); ctx.setLineDash([8 * sc, 5 * sc]); ctx.strokeStyle = INK; ctx.lineWidth = 2 * sc; ctx.stroke(); ctx.setLineDash([]); }
    }
    let labelRects = [];
    function label(p, cx, top, alpha) {
      const fs = Math.max(11, 12 * sc);
      ctx.save(); ctx.globalAlpha = alpha;
      const l1 = p.name, l2 = "wants " + p.want, l3 = "“" + p.word + "”";
      ctx.font = `700 ${fs}px "Courier New",monospace`; const w1 = ctx.measureText(l1).width;
      ctx.font = `italic ${fs}px Georgia,serif`; const w2 = ctx.measureText(l2).width, w3 = ctx.measureText(l3).width;
      const bw = Math.max(w1, w2, w3) + 24, bh = fs * 4.5;
      const bx = clamp(cx - bw / 2, 4, W - bw - 4);
      let by = Math.max(4, top - bh);
      for (const r of labelRects) if (bx < r[0] + r[2] && bx + bw > r[0] && by < r[1] + r[3] && by + bh > r[1]) by = Math.max(4, r[1] - bh - 3);
      labelRects.push([bx, by, bw, bh]);
      const id = A + "name-tag", im = IMG[id];
      if (im) { const n = nat(id); ctx.drawImage(ras(id, bw, bh) || im, bx, by, bw, bh); void n; }
      else { ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh); }
      ctx.fillStyle = INK; ctx.textBaseline = "top";
      ctx.font = `700 ${fs}px "Courier New",monospace`; ctx.fillText(l1, bx + 11, by + 5);
      ctx.font = `italic ${fs}px Georgia,serif`; ctx.fillText(l2, bx + 11, by + 5 + fs * 1.2); ctx.fillText(l3, bx + 11, by + 5 + fs * 2.4);
      ctx.restore();
    }
    function ransom(id, text, cx, cy, w, fill) {
      const im = IMG[id];
      if (im) { const n = nat(id); const h = (n[1] / n[0]) * w; ctx.drawImage(ras(id, w, h) || im, cx - w / 2, cy - h / 2, w, h); return; }
      const fs = Math.max(16, w / 5);
      ctx.save(); ctx.font = `900 ${fs}px Georgia,serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 3; const tw = ctx.measureText(text).width + 14;
      ctx.fillRect(cx - tw / 2, cy - fs * 0.7, tw, fs * 1.4); ctx.strokeRect(cx - tw / 2, cy - fs * 0.7, tw, fs * 1.4);
      ctx.fillStyle = fill || INK; ctx.fillText(text, cx, cy); ctx.restore();
    }
    function drawBanner(fh) {
      const x = worldX(S.headX), fy = floorY(DEPTH * 0.5) + 10 * sc;
      if (x < -300 || x > W + 300) return;
      const id = A + "front-banner", im = IMG[id];
      if (im) { const n = nat(id), bw = 300 * sc, bh = (n[1] / n[0]) * bw; ctx.drawImage(ras(id, bw, bh) || im, x - bw * 0.5, fy - fh * 1.45 - bh * 0.5, bw, bh);
        ctx.fillStyle = INK; ctx.fillRect(x - bw * 0.46, fy - fh * 1.45, 4 * sc, fh * 1.45); ctx.fillRect(x + bw * 0.46 - 4 * sc, fy - fh * 1.45, 4 * sc, fh * 1.45); }
      else { ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.fillRect(x - 120 * sc, fy - fh * 1.7, 240 * sc, 56 * sc); ctx.strokeRect(x - 120 * sc, fy - fh * 1.7, 240 * sc, 56 * sc);
        ctx.fillStyle = INK; ctx.font = `900 ${18 * sc}px Georgia,serif`; ctx.textAlign = "center"; ctx.fillText("HE IS THE RING.", x, fy - fh * 1.7 + 34 * sc); ctx.textAlign = "start";
        ctx.fillRect(x - 118 * sc, fy - fh * 1.7, 4 * sc, fh * 1.7); ctx.fillRect(x + 114 * sc, fy - fh * 1.7, 4 * sc, fh * 1.7); }
    }
    function drawMasts() {
      for (const m of masts) {
        const x = worldX(m.x); if (x < -150 || x > W + 150) continue;
        const h = 300 * sc, fy = floorY(0.2);
        const id = A + (m.dark > 0 ? "mast-dark" : "mast-lit");
        prop(id, x, fy, h, (cx, y, hh) => { ctx.strokeStyle = INK; ctx.lineWidth = 4 * sc; ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y - hh); ctx.stroke(); ctx.fillStyle = m.dark > 0 ? TONER : PAPER2; ctx.fillRect(cx - 12 * sc, y - hh - 6 * sc, 24 * sc, 10 * sc); });
        if (m.dark > 0) { ctx.save(); ctx.font = `700 ${Math.max(11, 12 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText("dark " + Math.ceil(m.dark), x, fy - h - 8 * sc); ctx.restore(); }
      }
    }
    function drawShield() {
      if (!lv.shield) return;
      const fh = FIG_H * sc;
      for (let i = 0; i < 6; i++) {
        const x = worldX(lv.L + 3.2 + (i % 2) * 0.4), z = 0.25 + i * (DEPTH - 0.5) / 5;
        if (x < -150 || x > W + 150) continue;
        figure(A + "shield", x, floorY(z), fh, true);
      }
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.save();
      if (S.shake > 0) ctx.translate((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 3);
      drawLayer("far", 0.3);
      drawLayer("mid", 0.6);
      hatch(0, floorY(0) - 8 * sc, W, floorY(DEPTH) - floorY(0) + 18 * sc, 9 * sc, 0.25, 0.09);
      ctx.save(); ctx.globalAlpha = 0.55; drawLayer("near", 1.2); ctx.restore();
      drawMasts();
      drawShield();
      if (mode !== "intro") drawRing(radius());
      for (const t of tracts) { const x = worldX(t.x); if (x < -80 || x > W + 80) continue; ctx.save(); ctx.translate(x, floorY(t.z)); ctx.rotate(t.rot); const w = 60 * sc; const im = IMG[A + "tract"]; if (im) { const n = nat(A + "tract"); ctx.drawImage(im, -w / 2, -(n[1] / n[0]) * w * 0.7, w, (n[1] / n[0]) * w); } else { ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillRect(-w / 2, -w * 0.5, w, w * 0.65); ctx.strokeRect(-w / 2, -w * 0.5, w, w * 0.65); } ctx.restore(); }
      labelRects = [];
      const fh = FIG_H * sc;
      drawBanner(fh);
      const list = [];
      for (const p of people) list.push({ z: p.z, k: "p", o: p });
      for (const o of obst) list.push({ z: o.z, k: "o", o });
      if (S.cart) list.push({ z: S.cart.z + 0.05, k: "c", o: S.cart });
      list.push({ z: PL.z, k: "t", o: PL });
      list.sort((a, b) => a.z - b.z);
      for (const e of list) {
        if (e.k === "p") {
          const p = e.o, cx = worldX(p.x);
          if (cx < -120 || cx > W + 120) continue;
          const fy = floorY(p.z);
          const walk = Math.abs(p.hold) > 0.05 && !RM ? (Math.sin(S.t * 6 + p.ph) > 0 ? "walk-a" : "walk-b") : "walk-a";
          const id = A + "marcher-" + (p.st === "stopped" ? "stopped" : p.st === "want" && Math.hypot(p.x - PL.x, p.z - PL.z) < 3 ? "reach" : p.kind === "walk" ? walk : p.kind);
          const jolt = p.cough > 0 && !RM ? Math.sin(p.cough * 40) * 3 * sc : 0;
          const bob = !RM && Math.abs(p.hold) > 0.05 ? Math.abs(Math.sin(S.t * 6 + p.ph)) * 2 * sc : 0;
          figure(id, cx + jolt, fy - bob, fh, p.face < 0);
          if (p.cough > 0) { ctx.save(); ctx.font = `700 ${Math.max(12, 14 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText("*hh*", cx + p.face * 24 * sc, fy - fh * 0.85); ctx.restore(); }
          if (p.tagT > 0) label(p, cx, fy - fh - 12 * sc, Math.min(1, p.tagT));
        } else if (e.k === "o") {
          const x = worldX(e.o.x); if (x < -80 || x > W + 80) continue;
          prop(A + "pole", x, floorY(e.o.z), 130 * sc, (cx, y, hh) => { ctx.strokeStyle = INK; ctx.lineWidth = 3 * sc; ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y - hh); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, y - hh, 14 * sc, 0, 7); ctx.stroke(); });
        } else if (e.k === "c") {
          const x = worldX(e.o.x + 0.9); if (x < -200 || x > W + 200) continue;
          prop(A + "cart", x, floorY(e.o.z) + 4 * sc, 150 * sc, (cx, y, hh) => { ctx.fillStyle = TONER; ctx.fillRect(cx - 90 * sc, y - hh * 0.6, 180 * sc, hh * 0.5); ctx.fillStyle = PAPER2; ctx.fillRect(cx - 80 * sc, y - hh * 0.55, 90 * sc, 12 * sc); });
        } else {
          const cx = worldX(PL.x), fy = floorY(PL.z) - (RM || !PL.moving ? 0 : Math.abs(Math.sin(PL.bob)) * 3 * sc);
          const id = A + (S.handT > 0 ? "tox-hand" : S.dartT > 0.2 && lv.n === 2 ? "tox-dart" : S.closed ? "tox" : "tox-open");
          const bent = S.bentT > 0;
          figure(id, cx, fy, fh, PL.face < 0, bent ? 0.12 : 0);
          if (S.stopFx > 0) ransom(A + "stop", "STOP.", cx + PL.face * 20 * sc, fy - fh - 18 * sc, 150 * sc, RED);
          // the player's mark: an amber chevron over his head, so he is not lost in the march
          ctx.save(); ctx.fillStyle = AMBER; ctx.strokeStyle = INK; ctx.lineWidth = 2;
          const my = fy - fh - (S.inRing ? 18 : 8) * sc - (RM ? 0 : Math.sin(S.t * 5) * 2 * sc) - (S.stopFx > 0 ? 36 * sc : 0), mw = 9 * sc + 3;
          ctx.beginPath(); ctx.moveTo(cx - mw, my - mw); ctx.lineTo(cx + mw, my - mw); ctx.lineTo(cx, my); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
        }
      }
      // the front banner pointer, when it is off the page
      const bx = worldX(S.headX);
      if (mode === "play" && bx > W - 8) {
        ctx.save(); ctx.font = `700 ${Math.max(11, 12 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "right";
        const t = `FRONT ${Math.max(0, Math.round(S.headX - PL.x))} m ▶`, tw = ctx.measureText(t).width + 12;
        ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.fillRect(W - tw - 6, floorY(0) - 26 * sc, tw, 20 * sc); ctx.strokeRect(W - tw - 6, floorY(0) - 26 * sc, tw, 20 * sc);
        ctx.fillStyle = INK; ctx.fillText(t, W - 12, floorY(0) - 11 * sc); ctx.restore();
      }
      // the volley, when it goes up: resin as black dashes thrown from the middle of the march at the glass
      if (S.volley && !RM) {
        S.volley += 0.016;
        ctx.save(); ctx.fillStyle = INK;
        for (let i = 0; i < 26; i++) {
          const u = ((S.volley * 0.7 + i * 0.137) % 1);
          const x0 = W * (0.2 + (i % 7) * 0.06), x1 = W * 1.05, y = H * 0.7 - Math.sin(u * Math.PI) * H * (0.35 + (i % 5) * 0.05);
          ctx.globalAlpha = 0.85; ctx.fillRect(x0 + (x1 - x0) * u, y, 7 * sc, 5 * sc);
        }
        ctx.restore();
      }
      ctx.restore();
      if (S.ending && S.toxin) {
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.hypot(W, H) * 0.6);
        g.addColorStop(0, "rgba(127,217,87,0)"); g.addColorStop(1, "rgba(127,217,87,.8)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }
    function drawStrip() {
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.fillStyle = PAPER2; sctx.fillRect(0, 0, SW, SH);
      const sim = IMG[A + "strip"];
      if (sim) { sctx.globalAlpha = 0.3; sctx.drawImage(sim, 0, 0, SW, SH); sctx.globalAlpha = 1; }
      else { sctx.strokeStyle = INK; sctx.globalAlpha = 0.3; sctx.beginPath(); sctx.moveTo(0, SH / 2); sctx.lineTo(SW, SH / 2); sctx.stroke(); sctx.globalAlpha = 1; }
      if (!S) return;
      const pad = 26, x0 = pad, x1 = SW - pad, k = (x1 - x0) / (lv.L + 2), my = SH / 2;
      sctx.fillStyle = INK; sctx.font = `700 9px "Courier New"`; sctx.textAlign = "right"; sctx.fillText("END", SW - 3, 10);
      sctx.fillRect(x1 + 2, 6, 2, SH - 12);
      for (const p of people) {
        const x = x0 + p.x * k, y = my + (p.z / DEPTH - 0.5) * (SH * 0.5);
        sctx.beginPath(); sctx.arc(x, y, 3.2, 0, 7);
        if (p.st === "stopped") { sctx.strokeStyle = INK; sctx.lineWidth = 1.3; sctx.stroke(); } else { sctx.fillStyle = p.touched ? RED : INK; sctx.fill(); }
      }
      const hx = x0 + S.headX * k; sctx.fillStyle = INK; sctx.fillRect(hx, 5, 2, SH - 10); sctx.fillRect(hx - 5, 5, 8, 6);
      const an = IMG[A + "arrow"], aw = clamp(SW * 0.14, 64, 96), ax = x0 + PL.x * k;
      if (an) { const n = nat(A + "arrow"); const ah = (n[1] / n[0]) * aw; sctx.drawImage(an, ax - aw * 0.8, my - ah / 2, aw, ah); }
      else { sctx.fillStyle = RED; sctx.beginPath(); sctx.moveTo(ax - 24, my - 5); sctx.lineTo(ax, my - 5); sctx.lineTo(ax, my - 11); sctx.lineTo(ax + 12, my); sctx.lineTo(ax, my + 11); sctx.lineTo(ax, my + 5); sctx.lineTo(ax - 24, my + 5); sctx.fill(); }
    }

    // ---- HUD ------------------------------------------------------------------------------------------
    const hud = {};
    function buildHud() {
      topEl.innerHTML = `<span><img data-i="hud-breath" alt="" aria-hidden="true">ring <b data-ring>1.4</b> m</span>
<span><img data-i="hud-pulse" data-pi alt="" aria-hidden="true">pulse <b data-pv>20</b> / <b data-line>100</b></span>
<span><img data-i="hud-shroud-open" data-sh alt="" aria-hidden="true"><b data-shroud>open</b></span>
<span class="${P}sp"></span><span>stepped in <b data-exp>0</b></span><span>front <b data-front>0</b> m</span>`;
      topEl.querySelectorAll("img").forEach((im) => { const u = icon(im.dataset.i); if (u) im.src = u; else im.style.display = "none"; });
      hud.ring = topEl.querySelector("[data-ring]"); hud.pv = topEl.querySelector("[data-pv]"); hud.line = topEl.querySelector("[data-line]");
      hud.shroud = topEl.querySelector("[data-shroud]"); hud.exp = topEl.querySelector("[data-exp]"); hud.front = topEl.querySelector("[data-front]");
      hud.pi = topEl.querySelector("[data-pi]"); hud.sh = topEl.querySelector("[data-sh]");
      margin.innerHTML = `<b>PULSE</b><div class="${P}bar" role="meter" aria-label="Pulse" aria-valuemin="0" aria-valuemax="100"><img alt="" aria-hidden="true"><div class="u"></div><div class="m"></div><div class="l"></div></div><b data-ml>${selfLine()}</b>`;
      hud.img = margin.querySelector("img"); hud.mask = margin.querySelector(".m"); hud.under = margin.querySelector(".u"); hud.mline = margin.querySelector(".l");
      hud.bar = margin.querySelector("." + P + "bar"); hud.ml = margin.querySelector("[data-ml]");
    }
    function updateHud(force) {
      if (!S) return;
      hud.ring.textContent = radius().toFixed(1);
      hud.pv.textContent = String(Math.round(S.pulse)); hud.line.textContent = String(pulseCap());
      hud.exp.textContent = String(S.touched.length);
      hud.front.textContent = String(Math.max(0, Math.round(S.headX - PL.x)));
      hud.shroud.textContent = S.closed ? "closed" : "open";
      hud.bar.setAttribute("aria-valuenow", String(Math.round(S.pulse)));
      const frac = S.pulse / 100;
      hud.mask.style.left = (frac * 100) + "%"; hud.under.style.width = (frac * 100) + "%";
      hud.mline.style.left = pulseCap() + "%"; hud.ml.textContent = String(pulseCap());
      const near = S.pulse >= pulseCap() - 12, at = S.pulse >= pulseCap() - 1.5;
      const m = at ? "hud-margin-green" : near ? "hud-margin-edge" : "hud-margin-calm";
      if (m !== hud.mode || force) { hud.mode = m; const u = icon(m); if (u) hud.img.src = u; hud.img.style.display = u ? "" : "none"; }
      const pi = near ? "hud-pulse-edge" : "hud-pulse"; if (hud.pi.dataset.cur !== pi) { hud.pi.dataset.cur = pi; const u = icon(pi); if (u) hud.pi.src = u; }
      const si = S.closed ? "hud-shroud-closed" : "hud-shroud-open"; if (hud.sh.dataset.cur !== si) { hud.sh.dataset.cur = si; const u = icon(si); if (u) hud.sh.src = u; }
    }

    // ---- pad ------------------------------------------------------------------------------------------
    function buildPad() {
      const mk = (label, sub, key, hold) => `<button type="button" data-b="${key}" ${hold ? 'data-hold="1"' : ""} aria-label="${esc(key)}">${label}<small>${sub}</small></button>`;
      padEl.innerHTML = mk("◀", "A", "left", 1) + mk("▶", "D", "right", 1) + mk("▲", "W", "up", 1) + mk("▼", "S", "down", 1) + "<i></i>" +
        mk("Wait", "Z", "hold", 1) + mk("Hand", "Space", "hand") + mk("Shroud", "C", "shroud") + mk("Dart", "F", "dart");
      const dartB = padEl.querySelector('[data-b="dart"]'); dartB.hidden = lv.n !== 2;
      const shB = padEl.querySelector('[data-b="shroud"]'); shB.setAttribute("aria-pressed", "false"); shB.disabled = !flags.shroud;
      padEl.querySelectorAll("button").forEach((b) => {
        const k = b.dataset.b;
        if (b.dataset.hold) {
          const dn = (e) => { e.preventDefault(); keys[k] = 1; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
          const up = () => { keys[k] = 0; b.classList.remove("down"); };
          on(b, "pointerdown", dn); on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
        } else {
          on(b, "click", () => { if (k === "hand") hand(); else if (k === "shroud") shroud(); else if (k === "dart") dart(); syncPad(); });
        }
      });
    }
    function syncPad() {
      const sb = padEl.querySelector('[data-b="shroud"]'); if (sb && S) sb.setAttribute("aria-pressed", String(!!S.closed));
      const hb = padEl.querySelector('[data-b="hand"]'); if (hb && S) hb.classList.toggle("down", S.handT > 0);
    }

    // ---- input ----------------------------------------------------------------------------------------
    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", z: "hold", Z: "hold", ".": "hold" };
    on(document, "keydown", (e) => {
      if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = KEYMAP[e.key];
      if (k) { keys[k] = 1; e.preventDefault(); return; }
      if (e.key === " " || e.key === "Spacebar" || e.key === "h" || e.key === "H") { e.preventDefault(); if (!e.repeat) hand(); }
      else if (e.key === "c" || e.key === "C") { if (!e.repeat) shroud(); }
      else if (e.key === "f" || e.key === "F") { if (!e.repeat) dart(); }
      syncPad();
    });
    on(document, "keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = 0; });
    on(window, "blur", () => { keys.left = keys.right = keys.up = keys.down = keys.hold = 0; ptr.on = false; });
    const ptrPos = (e) => { const r = panelEl.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
    on(panelEl, "pointerdown", (e) => { if (mode !== "play") return; ptr.on = true; ptrPos(e); try { panelEl.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
    on(panelEl, "pointermove", (e) => { if (ptr.on) ptrPos(e); });
    const pend = () => { ptr.on = false; };
    on(panelEl, "pointerup", pend); on(panelEl, "pointercancel", pend); on(panelEl, "lostpointercapture", pend);

    // ---- layout ---------------------------------------------------------------------------------------
    function layout() {
      const r = wrap.getBoundingClientRect();
      const ww = r.width || 800, hh = r.height || 600;
      const fixed = topEl.offsetHeight + stripEl.offsetHeight + margin.offsetHeight + padEl.offsetHeight + 44;
      sc = clamp(Math.min(ww / 560, (hh - fixed) / VH, 1.1), 0.4, 1.1);
      const ph = Math.round(VH * sc);
      panelEl.style.height = ph + "px";
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(ww); H = ph;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      SW = Math.round(ww); SH = stripEl.offsetHeight || 50;
      sv.width = Math.round(SW * dpr); sv.height = Math.round(SH * dpr);
      for (const k in RAST) delete RAST[k];
    }
    function setCamera(snap) {
      const viewW = W / (PPM * sc);
      const target = clamp(PL.x - viewW * 0.26, 0, Math.max(0, lv.L + 5 - viewW));
      camX = snap || RM ? target : camX + (target - camX) * 0.12;
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
        setCamera(false);
        draw();
        hudT += dt; if (hudT > 0.1) { hudT = 0; updateHud(); syncPad(); drawStrip(); }
      }
    }

    // ---- intro ----------------------------------------------------------------------------------------
    const tapes = () => { const t = icon(A + "tape"); return t ? `<img class="${P}tape" alt="" aria-hidden="true" src="${t}"><img class="${P}tape r" alt="" aria-hidden="true" src="${t}">` : ""; };
    function intro() {
      mode = "intro";
      ov.hidden = false;
      let pick = 0;
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-modal="true" aria-label="How to play: Procession">${tapes()}
<div class="${P}kick" data-k></div><h2>Procession</h2>
<p class="${P}q">&ldquo;${esc(QUOTE)}&rdquo; <small>(Story: The Finale)</small></p>
<p data-scene></p>
<p>Your goal: <b data-goal></b>. The march moves on without waiting, and you are faster than it, but they <b>want into your ring</b>. The white ring on the road is his breath: anyone inside it says their name, what they want, and one word. Nobody is harmed on the page; each is a step toward the line. <b data-end></b> Being late is the cost, not a failure.</p>
<ul class="${P}keys">
<li><b>Move</b><span>Arrows or WASD, the pad, or press and hold on the page to walk toward the point. Bodies, poles and the cart are solid: find the gaps.</span></li>
<li><b>Wait</b><span>Z: stand still. With nobody in the ring, Pulse falls 2 a second, but the front pulls away.</span></li>
<li><b>Hand</b><span>Space or H: &ldquo;Stop.&rdquo; Those within three metres stop and step back, each with a chance of (100 &minus; doctrine) percent (now <span data-ch></span>). Costs a second's stillness.</span></li>
<li><b>Shroud</b><span>C: closed halves the ring, slows you, and the trapped breath adds Pulse.</span></li>
<li><b>Dart</b><span data-dart>F: Procession 2 only, at the floodlight masts. A mast goes dark for twenty seconds; Pulse +12.</span></li>
</ul>
<div class="${P}seq" role="group" aria-label="Sequence">${LEVELS.map((l, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">${esc(l.chapter)}<small>${esc(l.title)}</small></button>`).join("")}</div>
<button type="button" class="${P}go">Fall in at the rear</button></div>`;
      ov.querySelector("[data-ch]").textContent = Math.round(100 - flags.doctrine) + " percent";
      const sync = () => {
        const l = LEVELS[pick];
        ov.querySelector("[data-k]").textContent = l.chapter + " · " + l.id;
        ov.querySelector("[data-scene]").textContent = l.scene;
        ov.querySelector("[data-goal]").textContent = l.goal;
        ov.querySelector("[data-end]").textContent = l.n === 2
          ? `Here Pulse is not held: at the Self line (${selfLine()}) the page's corners go green and it cuts, and Split Field follows.`
          : `On the road the State's trigger is not in play: at the hold, five under the line (${pulseCap()}), he doubles over for three seconds.`;
        ov.querySelector("[data-dart]").style.opacity = l.n === 2 ? 1 : 0.45;
        ov.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === pick)));
      };
      ov.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { pick = +b.dataset.s; sync(); }));
      ov.querySelector("." + P + "go").addEventListener("click", () => {
        ov.hidden = true; build(LEVELS[pick]); buildPad(); layout(); setCamera(true); mode = "play";
        say(LEVELS[pick].flavour);
        updateHud(true); drawStrip();
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
    wrap.__pr = { IMG, get S() { return S; }, get PL() { return PL; }, get people() { return people; }, get lv() { return lv; }, get mode() { return mode; }, radius, flags, hand, choose };
    artReady.then(() => { if (S) drawStrip(); });
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

// Dr. Tox: Fall, 2D mode A: Crowd thread (DESIGN.md section 10, `m2_crowd_thread`).
// Underground comix crosshatch: dense pen hatching on cheap paper, lumpy figures packed shoulder to
// shoulder, his breath radius a ring of bare paper on the floor. A real side-scroll through a crowd.
//
// Two sequences, each cut to a couple of minutes:
//   s2_crowd_1  the relief hall queue (chapter 2). Two staff with sight cones. People step back at random.
//               Pulse is capped five below the Self line: at the cap he leaves by the side door (the loss).
//               The win is the shutter. Exposures are the cost, not a failure: each person he breathes on
//               becomes a card in the next Triage.
//   s2_crowd_2  the Spire's service corridor (Ama and Lev at the door, two guards) and the gala floor
//               (chapter 11). Guests never step back and every one is a witness; four security; darts.
//               Not capped: at the Self line the page's border goes green from the corners in and cuts
//               (toxin_at_gala), which is the loss. The win is the balcony door.
//
// Rules (DESIGN.md section 10): radius 1.0 m + Pulse/50 m, halved with the shroud closed. Turn sideways
// narrows the ring by a quarter for two seconds, then Pulse +3. A body inside the ring coughs once, shows
// name and want, and is written to crowd.exposures / crowd.exposed_names. Pulse +2 a second while anyone
// is within half a metre of the ring's edge, +1 every 2 seconds with the shroud closed, -2 a second
// waiting (standing still) in a gap. Being seen by staff closes the queue ahead for ten seconds. A dart
// drops a guard for twenty seconds and costs manifold.dart_cost Pulse (default 12).
//
// Shared flags (data/flags.json): reads pulse, amber, self, shroud.fitted, security_knows_face,
// barrier.released (Nell Okafor in the hall), manifold.dart_cost; writes pulse, crowd.exposures,
// crowd.exposed_names, and for the gala toxin_at_gala, toxin_events, self, amber.
//
// Art (api.art, ASSET_MAP.md "Crowd thread"): hall-/gala- far, mid, near layers at 0.3, 0.6, 1.2 of the
// camera; queue-1..4, guest, staff, security, kitchen-staff, the four Tox poses, ring, sight-cone, poster,
// shutter, service door; shared hud-*. Every id falls back to ink drawn here when the bundle lacks it.
//
// Lines: the story line is Part VI, Dr. Tox §2 as DESIGN.md section 2 quotes it. The queue's names and
// wants, the captions and the end lines are added for the game (the author approves or strikes them).

const P = "dtf-ct-";
const INK = "#17140f", PAPER = "#E7E0CD", PAPER2 = "#F2EDDD", AMBER = "#D99A2B", GREEN = "#7FD957",
  TEAL = "#5E7375", RUST = "#8B4A2B";
const PPM = 88;            // pixels per metre at scale 1 (a 1.7 m figure is 150 px)
const VH = 540;            // the view is 540 tall at scale 1
const FLOOR_TOP = 430, FLOOR_H = 76, DEPTH = 4; // the floor band, and its depth in metres
const FIG_H = 150, BODY = 0.25, SOLID = 0.5;

const QUOTE = "he is a walking biological hazard who cannot safely share a room.";

// invented for the game: the queue's names and the one want each says
const FOLK = [
  ["Ines Vukovic", "a bed for her mother tonight"], ["Tobias Reyes", "his daughter's shoes, resoled"],
  ["Marguerite Aho", "water that isn't yellow"], ["Dov Kessler", "the clinic to stay open past noon"],
  ["Pilar Nwosu", "her son's name called out"], ["Hakon Berg", "one hot meal, any meal"],
  ["Sunita Rao", "a letter read to her"], ["Jonah Pike", "to sit down"],
  ["Adaeze Mbeki", "bread for two"], ["Osei Lindqvist", "the lamp fixed"],
  ["Mirela Costa", "her dog let in"], ["Bartek Novak", "a blanket for the walk home"],
  ["Lucia Faye", "a doctor who will look up"], ["Emeka Hart", "his wages before the curfew"],
  ["Greta Sloane", "a place in the line, kept"], ["Tomas Idowu", "news of his sister"],
  ["Yusra Haddad", "soap"], ["Walt Okonkwo", "his bucket back"],
  ["Cora Lindgren", "to be seen before dark"], ["Idris Marsh", "a quiet corner"],
  ["Noor Vasquez", "a note for the schoolroom"], ["Pavel Adeyemi", "his hands warm"],
  ["Rosalind Tran", "her mother's chair"], ["Kofi Almeida", "a seat by the door"],
  ["Beatrix Oyelaran", "the shutter to lift"], ["Dario Lund", "his name on the list"],
  ["Hanne Sorensen", "a word with the staff"], ["Jem Achterberg", "a drink for his brother"],
  ["Amara Delacroix", "a roof that holds"], ["Silas Petrov", "to get home by dark"],
  ["Wren Takahashi", "the line to move"], ["Odile Mensah", "her turn"],
];
const GUESTS = [
  ["Cordelia Vance", "a glass she hasn't tasted"], ["Julian Roake", "the lift kept waiting"],
  ["Mireille Stahl", "a photograph taken"], ["Anton Bright", "the air to smell of nothing"],
  ["Philippa Gray", "her name said first"], ["Emil Corbett", "a quiet word with the host"],
  ["Sabine Ward", "to be near the window"], ["Rufus Kane", "the speech to end"],
  ["Delphine Moss", "her wrap fetched"], ["Casper Lowe", "somewhere to put the glass"],
  ["Ottoline Rey", "a name for the guest of honour"], ["Magnus Hale", "the music louder"],
];

// ---- the two sequences ----------------------------------------------------------------------------------
const LEVELS = [
  { id: "s2_crowd_1", n: 1, layer: "hall", title: "The relief hall", chapter: "Chapter 2 · Relief",
    L: 84, people: 22, staff: 2, guards: 0, gala: false, darts: false, goal: "get from the back of the queue to the shutter",
    scene: "A long queue, two staff, one shutter that comes down at noon. The queue is slow and patient and steps back at random.",
    flavour: "The queue is slow and patient, and it steps back." },
  { id: "s2_crowd_2", n: 2, layer: "gala", title: "The service corridor and the gala floor", chapter: "Chapter 11 · Clean Air",
    L: 96, people: 30, staff: 0, guards: 4, gala: true, darts: true, goal: "get from the service door to the balcony door",
    scene: "Ama and Lev open the service door. Two guards in the corridor, then the gala floor: guests who never step back, and every one of them sees.",
    flavour: "The gala is fast. It does not step back for anyone." },
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
      self: clamp(num("self", 100), 30, 100),
      amber: shared.get("amber", null),
      pulse: num("pulse", 20),
      shroud: shared.get("shroud.fitted", true) !== false,
      face: !!shared.get("security_knows_face", false),
      nell: num("barrier.released", 0) >= 1,
      dart: clamp(num("manifold.dart_cost", 12), 6, 14),
    };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${PAPER};color:${INK};font-family:"Courier New",Courier,monospace;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}top{flex:0 0 auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:5px 10px;border-bottom:3px solid ${INK};background:${PAPER2};font:700 12px "Courier New",monospace;letter-spacing:.06em;text-transform:uppercase}
.${P}top span{display:flex;align-items:center;gap:5px;white-space:nowrap}
.${P}top img{width:24px;height:24px;display:block}
.${P}top .${P}sp{flex:1}
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
.${P}bar .u{position:absolute;left:0;bottom:0;height:5px;background:${AMBER};border-top:2px solid ${INK}}
.${P}bar .l{position:absolute;top:-2px;bottom:-2px;width:0;border-left:3px dashed ${INK}}
.${P}bar .f{position:absolute;inset:0;background:linear-gradient(90deg,${AMBER} var(--w,0%),transparent var(--w,0%));opacity:.0}
.${P}pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:6px 8px 8px;background:${PAPER2}}
.${P}pad button{font:700 14px "Courier New",monospace;color:${INK};background:${PAPER2};border:3px solid ${INK};box-shadow:2px 2px 0 ${INK};min-width:50px;min-height:46px;padding:4px 8px;cursor:pointer;touch-action:none;text-transform:uppercase}
.${P}pad button small{display:block;font-size:10px;font-weight:400;opacity:.7;text-transform:none}
.${P}pad button.down,.${P}pad button[aria-pressed=true]{background:${INK};color:${PAPER2}}
.${P}pad button[hidden]{display:none}
.${P}pad button:focus-visible,.${P}ov button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}pad i{width:6px}
.${P}ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(23,20,15,.6);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}card{position:relative;max-width:640px;width:100%;box-sizing:border-box;margin:auto;background:${PAPER2};border:4px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:16px 18px;font-family:Georgia,"Times New Roman",serif;background-image:repeating-linear-gradient(135deg,transparent 0 5px,rgba(23,20,15,.05) 5px 6px)}
.${P}kick{font:700 12px "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase}
.${P}card h2{margin:2px 0 6px;font:900 30px/1.05 Georgia,serif;text-transform:uppercase;letter-spacing:.02em}
.${P}q{margin:0 0 8px;padding-left:10px;border-left:6px solid ${INK};font-style:italic;font-size:16px}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font-size:14px}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${PAPER2};font:700 12px "Courier New",monospace;padding:2px 6px;text-transform:uppercase;text-align:center}
.${P}seq{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 10px}
.${P}seq button{font:700 13px "Courier New",monospace;text-transform:uppercase;text-align:left;padding:8px;background:${PAPER2};color:${INK};border:3px solid ${INK};cursor:pointer;min-height:56px}
.${P}seq button small{display:block;font-weight:400;text-transform:none;font-size:11px;margin-top:2px}
.${P}seq button[aria-pressed=true]{background:${INK};color:${PAPER2}}
.${P}go{font:700 17px "Courier New",monospace;text-transform:uppercase;background:${INK};color:${PAPER2};border:3px solid ${INK};padding:10px 26px;cursor:pointer}
@media (max-width:640px){.${P}pad{flex-wrap:nowrap;gap:4px;padding:6px}.${P}pad button{flex:1 1 0;min-width:0;padding:3px 1px;font-size:11px}.${P}pad button small{display:none}.${P}pad i{width:2px}
 .${P}card{padding:12px}.${P}card h2{font-size:24px}.${P}seq{grid-template-columns:1fr}.${P}keys li{grid-template-columns:78px 1fr}.${P}top{font-size:11px}}
`;
    const topEl = document.createElement("div"); topEl.className = P + "top";
    const panelEl = document.createElement("div"); panelEl.className = P + "panel";
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "The crowd: Dr. Tox in the queue, the white ring of his breath on the floor, and the people around it");
    const flashEl = document.createElement("div"); flashEl.className = P + "flash";
    panelEl.append(cv, flashEl);
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
    const IDS = ["far", "mid", "near"].flatMap((k) => ["hall", "gala"].map((l) => `crowd-thread-${l}-${k}`))
      .concat(["guest", "kitchen-staff", "queue-1", "queue-2", "queue-3", "queue-4", "security", "staff", "tox-closed", "tox-dart",
        "tox-turn", "tox-walk", "poster", "ring", "service-door", "shutter", "sight-cone", "sign-suspended"].map((s) => "crowd-thread-" + s));
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
    let lv = LEVELS[0], mode = "intro"; // intro | play | over
    let S = null, PL = null, people = [], staff = [], seq = 0;
    const keys = { left: 0, right: 0, up: 0, down: 0, hold: 0 };
    const ptr = { on: false, x: 0, y: 0 };
    let W = 800, H = 540, sc = 1, dpr = 1, camX = 0;
    let logLines = [];

    const floorY = (z) => (FLOOR_TOP + (z / DEPTH) * FLOOR_H) * sc;
    const worldX = (x) => (x - camX) * PPM * sc;
    const selfLine = () => flags.self;
    const pulseCap = () => (lv.gala ? selfLine() : selfLine() - 5);
    const pulseFloor = () => (flags.amber === 0 ? 40 : 20);

    function say(t) {
      logLines.unshift(t);
      if (logLines.length > 2) logLines.length = 2;
      logEl.innerHTML = logLines.map((l) => `<div>${esc(l)}</div>`).join("");
    }

    // ---- the page -------------------------------------------------------------------------------------
    function build(level) {
      lv = level; S = {
        t: 0, pulse: 0, exposed: [], seenTimes: 0, gate: null, gateT: 0, turnT: 0, turnCd: 0, closed: false,
        dartT: 0, darts: 0, gateCd: 0, ending: 0, idle: 0, pressing: false, shake: 0, toxin: false, cuePoster: false,
      };
      const rng = mulberry(7000 + level.n * 131 + (seq++ % 3));
      PL = { x: 1.6, z: DEPTH * 0.5, face: 1, bob: 0, vx: 0 };
      const floor0 = pulseFloor();
      S.pulse = Math.max(floor0, Math.min(flags.pulse, pulseCap() - 30));
      people = []; staff = [];
      const pool = level.gala ? GUESTS : FOLK;
      let pi = Math.floor(rng() * pool.length);
      const startX = level.gala ? 18 : 8;
      const n = level.people;
      const span = level.L - 8 - startX;
      for (let i = 0; i < n; i++) {
        const bx = startX + (i + 0.3 + rng() * 0.5) * (span / n);
        const [name, want] = pool[pi++ % pool.length];
        const z = 0.45 + rng() * (DEPTH - 0.9);
        const t = level.gala ? "guest" : "queue-" + (1 + Math.floor(rng() * 4));
        people.push({
          name, want, type: t, bx, bz: z, x: bx, z, offX: 0, offZ: 0, tOffX: 0, tOffZ: 0, face: rng() < 0.5 ? 1 : -1,
          ph: rng() * 6.28, sw: 0.5 + rng() * 0.6, timer: 1 + rng() * 6, bend: 0, cough: 0, tagT: 0, exposed: false,
          stepT: 0, stepped: false, vx: level.gala ? (rng() < 0.5 ? -1 : 1) * (0.35 + rng() * 0.6) : 0, vz: 0, recog: level.face && rng() < 0.5, alert: 0,
        });
      }
      if (!level.gala && flags.nell) {
        // Nell Okafor, if Reese let her go in Rise (DESIGN.md: "Her brother's water drum, still")
        const k = people[Math.floor(people.length * 0.55)];
        k.name = "Nell Okafor"; k.want = "her brother's water drum, still"; k.type = "queue-3";
      }
      if (level.gala) {
        // the service door's two kitchen staff, who are on his side, and the corridor's guards
        people.push({ name: "Ama Owusu and Lev Brandt", want: "", type: "kitchen-staff", friend: true, bx: 3.2, bz: 1.0, x: 3.2, z: 1.0, offX: 0, offZ: 0, tOffX: 0, tOffZ: 0, face: -1, ph: 0, sw: 0.3, timer: 99, bend: 0, cough: 0, tagT: 0, vx: 0, vz: 0 });
      }
      const gx = level.gala ? [7.5, 12, 30, 52, 75] : [];
      for (let i = 0; i < level.guards; i++) {
        staff.push(mkStaff("security", gx[i] != null ? gx[i] : 40 + i * 14, 1 + (i % 3) * 0.9, i % 2 ? -1 : 1, 7 + rng() * 3, rng));
      }
      for (let i = 0; i < level.staff; i++) {
        const a = 16 + i * 34 + rng() * 6;
        staff.push(mkStaff("staff", a + 6, i ? 3.0 : 0.9, i ? -1 : 1, 6 + rng() * 3, rng, a, a + 22));
      }
      logLines = []; logEl.innerHTML = "";
      setCamera(true);
      updateHud(true);
    }
    function mkStaff(type, x, z, face, per, rng, a, b) {
      return { type, x, z, face, per, a: a != null ? a : x - 3, b: b != null ? b : x + 3, v: type === "staff" ? 0.55 : 0.3,
        t: rng() * per, away: 0, down: 0, seen: 0, bz: z };
    }

    // ---- sim ------------------------------------------------------------------------------------------
    function radius() {
      return (1.0 + S.pulse / 50) * (S.closed ? 0.5 : 1) * (S.turnT > 0 ? 0.75 : 1);
    }
    function step(dt) {
      if (mode !== "play") return;
      S.t += dt;
      // input
      let ix = keys.right - keys.left, iz = keys.down - keys.up;
      if (ptr.on) {
        const tx = camX + ptr.x / (PPM * sc), tz = clamp(((ptr.y / sc) - FLOOR_TOP) / (FLOOR_H / DEPTH), 0, DEPTH);
        const dx = tx - PL.x, dz = tz - PL.z, d = Math.hypot(dx, dz * 1.0);
        if (d > 0.3) { ix = dx / d; iz = dz / d; } else { ix = 0; iz = 0; }
      }
      const moving = !keys.hold && (ix || iz);
      let sp = 1.7 * (S.closed ? 0.7 : 1) * (S.turnT > 0 ? 0.7 : 1);
      if (moving) {
        const m = Math.hypot(ix, iz) || 1;
        let nx = PL.x + (ix / m) * sp * dt, nz = PL.z + (iz / m) * sp * 0.7 * dt;
        if (S.gate != null) nx = Math.min(nx, S.gate);
        PL.x = clamp(nx, 0.6, lv.L - 0.3); PL.z = clamp(nz, 0.3, DEPTH - 0.3);
        if (ix) PL.face = ix > 0 ? 1 : -1;
        PL.bob += dt * 9;
      }
      PL.moving = !!moving;
      // bodies are solid: a queue is a wall with gaps
      const bodies = people.filter((p) => !p.friend).concat(staff.filter((s) => s.down <= 0));
      for (const b of bodies) {
        const dx = PL.x - b.x, dz = (PL.z - b.z) * 1.0, d = Math.hypot(dx, dz);
        if (d < SOLID && d > 0.001) { PL.x = b.x + (dx / d) * SOLID; PL.z = clamp(b.z + (dz / d) * SOLID, 0.3, DEPTH - 0.3); }
        else if (d <= 0.001) PL.x += SOLID;
      }
      if (S.gate != null) PL.x = Math.min(PL.x, S.gate);
      // timers
      S.turnCd = Math.max(0, S.turnCd - dt); S.shake = Math.max(0, S.shake - dt); S.dartT = Math.max(0, S.dartT - dt);
      if (S.turnT > 0) { S.turnT -= dt; if (S.turnT <= 0) { S.turnT = 0; S.turnCd = 1.2; S.pulse += 3; say("Turned back. Pulse +3."); } }
      if (S.gate != null) { S.gateT -= dt; if (S.gateT <= 0) { S.gate = null; say("The queue ahead opens again."); } }

      const R = radius();
      // people
      let pressing = false, nearest = 99;
      for (const p of people) {
        p.timer -= dt; p.cough = Math.max(0, p.cough - dt); p.tagT = Math.max(0, p.tagT - dt); p.alert = Math.max(0, p.alert - dt);
        if (p.bend > 0) p.bend -= dt;
        const dxp = p.x - PL.x, dzp = p.z - PL.z, dist = Math.hypot(dxp, dzp);
        if (lv.gala) {
          if (!p.friend) {
            p.bx += p.vx * dt;
            if (p.bx < 16 || p.bx > lv.L - 4) { p.vx = -p.vx; p.bx = clamp(p.bx, 16, lv.L - 4); }
            p.face = p.vx > 0 ? 1 : -1;
            if (p.timer <= 0) { p.timer = 2 + Math.random() * 4; p.vz = (Math.random() - 0.5) * 0.5; }
            p.bz = clamp(p.bz + p.vz * dt, 0.45, DEPTH - 0.45);
          }
        } else if (!p.friend) {
          if (p.timer <= 0) {
            const r = Math.random();
            p.timer = 3 + Math.random() * 6;
            if (r < 0.45) p.tOffX = (Math.random() - 0.5) * 1.0;
            else if (r < 0.7) p.face = -p.face;
            else if (r < 0.85 && dist < 5) { p.bend = 2.2; p.tOffX = Math.sign(PL.x - p.x) * 0.45; } // reaching for a dropped bucket
            else p.tOffZ = (Math.random() - 0.5) * 0.7;
          }
          // step back from the ring (or from a face on a poster)
          const edge = dist - BODY - R;
          if ((edge < 0.35 && edge > -R) || (p.recog && dist < 3.4)) {
            if (!p.stepped || p.stepT <= 0) {
              if (p.recog && !p.alert) { p.alert = 1.4; }
              if (Math.random() < dt * (p.recog ? 3 : 0.8)) { p.stepped = true; p.stepT = 5; p.tOffX = Math.sign(dxp || 1) * 0.95; p.tOffZ = Math.sign(dzp || (Math.random() - 0.5)) * 0.45; }
            }
          }
          if (p.stepT > 0) p.stepT -= dt; else p.stepped = false;
          if (!p.stepped && dist > R + 1.8) { p.tOffX *= 1 - Math.min(1, dt * 0.15); p.tOffZ *= 1 - Math.min(1, dt * 0.15); }
        }
        const k = 1 - Math.exp(-dt * 2.2);
        p.offX += (p.tOffX - p.offX) * k; p.offZ += (p.tOffZ - p.offZ) * k;
        const sw = RM ? 0 : Math.sin(S.t * p.sw + p.ph) * 0.14;
        p.x = p.bx + p.offX + sw; p.z = clamp(p.bz + p.offZ, 0.35, DEPTH - 0.35);
        if (p.friend) continue;
        const d = Math.hypot(p.x - PL.x, p.z - PL.z) - BODY;
        const edge = d - R;
        nearest = Math.min(nearest, edge);
        if (edge < 0.5) pressing = true;
        if (edge < 0 && !p.exposed) expose(p);
      }
      // staff and security: sight cones, and the dart
      for (const s of staff) {
        s.t += dt;
        if (s.down > 0) { s.down -= dt; s.seen = 0; continue; }
        if (s.t > s.per) { s.t = 0; s.away = 1.1; s.face = -s.face; }
        if (s.away > 0) s.away -= dt;
        else { s.x += s.face * s.v * dt; if (s.x < s.a) { s.x = s.a; s.face = 1; } if (s.x > s.b) { s.x = s.b; s.face = -1; } }
        const dx = (PL.x - s.x) * s.face, dz = PL.z - s.z;
        const look = s.away <= 0 && dx > 0.2 && dx < 5.2 && Math.abs(dz) < 0.6 + dx * 0.26;
        s.seen = look ? s.seen + dt : 0;
        if (look && s.seen > 0.35 && S.gate == null && S.gateCd <= 0) {
          S.gate = PL.x + 0.9; S.gateT = lv.gala ? 8 : 10; S.seenTimes++; S.gateCd = S.gateT + 6;
          if (lv.gala) { S.pulse += 6; say("A guard has seen him. The way ahead is shut. Pulse +6."); }
          else say("Staff saw him. The queue ahead is closed for ten seconds.");
          flash(AMBER);
        }
      }
      S.gateCd = Math.max(0, (S.gateCd || 0) - dt);
      // pulse
      S.pressing = pressing;
      if (pressing) S.pulse += 2 * dt;
      if (S.closed) S.pulse += 0.5 * dt;
      if (!moving && !pressing && nearest > 0.5) { S.pulse -= 2 * dt; S.idle += dt; } else S.idle = 0;
      S.pulse = clamp(S.pulse, pulseFloor(), 100);
      if (!lv.gala && S.pulse >= pulseCap()) { S.pulse = pulseCap(); finish("lose", "side"); return; }
      if (lv.gala && S.pulse >= selfLine() - 0.001) { finish("lose", "toxin"); return; }
      if (PL.x >= lv.L - 1.2) finish("win");
    }
    function expose(p) {
      p.exposed = true; p.cough = 0.7; p.tagT = 4.2;
      S.exposed.push({ name: p.name, want: p.want });
      S.shake = RM ? 0 : 0.25;
      say(`${p.name}, who wants ${p.want}, coughs once. ${lv.gala ? "A witness." : "A card for the next Triage."}`);
      if (lv.gala) S.pulse += 3;
      flash(RUST, 0.3);
    }
    function dart() {
      if (mode !== "play" || !lv.darts) return;
      if (S.dartT > 0) return;
      let tgt = null, best = 99;
      for (const s of staff) {
        if (s.type !== "security" || s.down > 0) continue;
        const dx = (s.x - PL.x) * PL.face;
        if (dx > 0.4 && dx < 8.5 && Math.abs(s.z - PL.z) < 1.8 && dx < best) { best = dx; tgt = s; }
      }
      S.dartT = 0.5;
      if (!tgt) { say("Nothing in reach to dart. No cost."); return; }
      tgt.down = 20; S.darts++; S.pulse += flags.dart; S.dartFx = { x: tgt.x, z: tgt.z, t: 0.35 };
      say(`Dart. The guard sits down for twenty seconds. Pulse +${flags.dart}.`);
    }
    function turn() {
      if (mode !== "play" || S.turnT > 0 || S.turnCd > 0) return;
      S.turnT = 2; say("Sideways. The ring narrows for two seconds.");
    }
    function shroud() {
      if (mode !== "play") return;
      if (!flags.shroud) { say("The shroud is not fitted yet."); return; }
      S.closed = !S.closed; say(S.closed ? "Shroud drawn closed. Half the ring; the breath is trapped (+1 every 2 s)." : "Shroud open.");
    }

    // ---- finishing ------------------------------------------------------------------------------------
    function flash(col, a) {
      flashEl.style.background = `radial-gradient(ellipse at center,transparent 55%,${col} 130%)`;
      flashEl.style.opacity = String(a == null ? 0.55 : a);
      flashEl.classList.add("on");
      later(() => { flashEl.classList.remove("on"); flashEl.style.opacity = "0"; }, 90);
    }
    function writeShared() {
      shared.set("pulse", Math.round(S.pulse));
      shared.set("crowd.exposures", num("crowd.exposures", 0) + S.exposed.length);
      const led = shared.get("crowd.exposed_names", []);
      const list = Array.isArray(led) ? led.slice() : [];
      for (const e of S.exposed) list.push({ name: e.name, want: e.want });
      shared.set("crowd.exposed_names", list);
      store.set("done" + lv.n, true);
    }
    function finish(outcome, how) {
      if (mode === "over") return;
      mode = "over";
      const n = S.exposed.length;
      const names = n ? `${n} ${n === 1 ? "person" : "people"} breathed on; ${n === 1 ? "their card goes" : "their cards go"} in the next Triage.` : "Nobody was breathed on.";
      let text;
      if (lv.gala && how === "toxin") {
        S.toxin = true;
        const firstTime = !store.get("toxin:" + lv.id, false);
        shared.set("toxin_at_gala", true);
        if (firstTime) {
          store.set("toxin:" + lv.id, true);
          const ev = shared.get("toxin_events", []);
          const list = Array.isArray(ev) ? ev.slice() : [];
          list.push({ chapter: "c11_clean_air", scene: lv.id, trigger: "pulse", reconstructed: false });
          shared.set("toxin_events", list);
          shared.set("self", Math.max(0, flags.self - 15));
          if (typeof flags.amber === "number") shared.set("amber", Math.max(0, flags.amber - 2));
        }
        text = `Pulse reached the line. The page's border goes green from the corners in, and cuts. ${names}`;
      } else if (how === "side") {
        text = `Pulse at the cap, five under the line. He leaves by the side door, and the hall closes up behind him. ${names}`;
      } else if (lv.gala) {
        text = `The balcony door. ${n ? names + " Every one of them saw him." : "Nobody was breathed on, and the floor still looked."}`;
      } else {
        text = `The shutter. ${names}`;
      }
      writeShared();
      S.ending = 1;
      if (how === "toxin" && !RM) {
        flashEl.style.background = `radial-gradient(ellipse at center,transparent 35%,${GREEN} 140%)`;
        flashEl.style.opacity = "1"; flashEl.classList.add("on");
      }
      later(() => { if (!dead) api.end({ outcome, text }); }, RM ? 150 : 900);
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
      // a few pen-hatched columns and a lamp row when the layer art is missing
      const tile = 520 * sc * (factor < 0.5 ? 1.5 : 1);
      const off = (camX * PPM * sc * factor) % tile;
      ctx.save(); ctx.strokeStyle = INK;
      for (let x = -off; x < W + tile; x += tile) {
        if (kind === "far") { hatch(x + tile * 0.15, 40 * sc, tile * 0.7, 300 * sc, 6 * sc, 0.4, 0.28); }
        else if (kind === "mid") { hatch(x + tile * 0.1, 120 * sc, tile * 0.12, 300 * sc, 4 * sc, 0.5, 0.5); }
        else { ctx.lineWidth = 3 * sc; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 6 * sc, 70 * sc); ctx.stroke(); ctx.globalAlpha = 1; }
      }
      ctx.restore();
    }
    function drawLayer(kind, factor) {
      const id = `crowd-thread-${lv.layer}-${kind}`;
      const im = IMG[id];
      if (!im) { fallbackBackdrop(factor, kind); return; }
      const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      const th = Math.round(VH * sc), tw = Math.round((iw / ih) * th);
      const rc = ras(id, tw, th) || im;
      const off = (((camX * PPM * sc * factor) % tw) + tw) % tw;
      for (let x = -off; x < W; x += tw) ctx.drawImage(rc, Math.round(x), 0, tw + 1, th);
    }
    function figure(id, cx, fy, h, flip, a) {
      const im = IMG[id];
      if (im) {
        const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, w = (iw / ih) * h;
        ctx.save(); ctx.translate(cx, fy); if (flip) ctx.scale(-1, 1);
        if (a && a.rot) ctx.rotate(a.rot);
        if (a && a.squash) ctx.scale(1, a.squash);
        ctx.drawImage(ras(id, w, h) || im, -w / 2, -h, w, h); ctx.restore();
        return;
      }
      // fallback: a lumpy ink figure
      const w = h * 0.42;
      ctx.save(); ctx.translate(cx, fy); if (a && a.squash) ctx.scale(1, a.squash);
      ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 2.5 * sc;
      ctx.beginPath(); ctx.ellipse(0, -h * 0.4, w * 0.55, h * 0.4, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -h * 0.88, h * 0.13, 0, 7); ctx.fill(); ctx.stroke();
      ctx.restore();
      hatch(cx - w * 0.5, fy - h * 0.78, w, h * 0.76, 5 * sc, 0.6, 0.5);
    }
    function ellipsePath(cx, cy, rx, ry) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2); }
    function drawRing(R) {
      const cx = worldX(PL.x), cy = floorY(PL.z);
      const rx = R * PPM * sc, ry = R * (FLOOR_H / DEPTH) * sc;
      const im = IMG["crowd-thread-ring"];
      if (im) { const n = nat("crowd-thread-ring"); ctx.drawImage(ras("crowd-thread-ring", n[0], n[1], true) || im, cx - rx, cy - ry * 1.08, rx * 2, ry * 2.16); }
      else { ctx.fillStyle = PAPER2; ellipsePath(cx, cy, rx, ry); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2 * sc; ctx.stroke(); }
      // the pressure band, half a metre out
      ctx.save(); ctx.setLineDash([6 * sc, 7 * sc]); ctx.strokeStyle = INK; ctx.globalAlpha = S.pressing ? 0.85 : 0.35;
      ctx.lineWidth = (S.pressing ? 2.6 : 1.4) * sc;
      ellipsePath(cx, cy, rx + 0.5 * PPM * sc, ry + 0.5 * (FLOOR_H / DEPTH) * sc); ctx.stroke(); ctx.restore();
    }
    function drawCone(s) {
      const cx = worldX(s.x), cy = floorY(s.z), len = 5.2 * PPM * sc, hh = 1.9 * (FLOOR_H / DEPTH) * sc;
      const im = IMG["crowd-thread-sight-cone"];
      ctx.save(); ctx.globalAlpha = s.away > 0 ? 0.18 : 0.55;
      if (im) {
        ctx.translate(cx, cy); if (s.face < 0) ctx.scale(-1, 1);
        { const n = nat("crowd-thread-sight-cone"); ctx.drawImage(ras("crowd-thread-sight-cone", n[0], n[1], true) || im, 0, -hh, len, hh * 2); }
      } else {
        ctx.fillStyle = AMBER; ctx.globalAlpha *= 0.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + s.face * len, cy - hh); ctx.lineTo(cx + s.face * len, cy + hh); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    let labelRects = [];
    function label(text, sub, cx, top, alpha) {
      const fs = Math.max(11, 12 * sc);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.font = `700 ${fs}px "Courier New",monospace`;
      const w1 = ctx.measureText(text).width;
      ctx.font = `italic ${fs}px Georgia,serif`;
      const w2 = ctx.measureText(sub).width;
      const bw = Math.max(w1, w2) + 12, bh = fs * 2.5;
      const bx = clamp(cx - bw / 2, 4, W - bw - 4);
      let by = Math.max(4, top - bh);
      for (const r of labelRects) if (bx < r[0] + r[2] && bx + bw > r[0] && by < r[1] + r[3] && by + bh > r[1]) by = Math.max(4, r[1] - bh - 3);
      labelRects.push([bx, by, bw, bh]);
      ctx.fillStyle = PAPER2; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
      ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = INK; ctx.textBaseline = "top";
      ctx.font = `700 ${fs}px "Courier New",monospace`; ctx.fillText(text, bx + 6, by + 3);
      ctx.font = `italic ${fs}px Georgia,serif`; ctx.fillText(sub, bx + 6, by + 3 + fs * 1.2);
      ctx.restore();
    }
    function drawEndProps() {
      // the shutter (hall) or the balcony door (gala) at the end; the service door at the start of the gala
      const fh = FIG_H * sc * 1.3;
      if (!lv.gala) {
        const im = IMG["crowd-thread-shutter"], x = worldX(lv.L + 0.5), fy = floorY(DEPTH * 0.5) + 6 * sc;
        if (im) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; ctx.drawImage(im, x - (iw / ih) * fh * 0.5, fy - fh * 1.15, (iw / ih) * fh * 1.15, fh * 1.15); }
        else { ctx.fillStyle = PAPER2; ctx.fillRect(x - 40 * sc, fy - fh, 120 * sc, fh); hatch(x - 40 * sc, fy - fh, 120 * sc, fh, 5 * sc, 0.3, 0.7); }
        const sg = IMG["crowd-thread-sign-suspended"];
        if (sg) { const iw = sg.naturalWidth || sg.width, ih = sg.naturalHeight || sg.height, w = iw * 0.5 * sc; ctx.drawImage(sg, x - w * 0.5, fy - fh * 1.3 - 6 * sc, w, (ih / iw) * w); }
      } else {
        const im = IMG["crowd-thread-service-door"], fy = floorY(DEPTH * 0.5) + 6 * sc;
        const door = (x) => {
          if (im) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; ctx.drawImage(im, x - (iw / ih) * fh * 0.5, fy - fh, (iw / ih) * fh, fh); }
          else { ctx.fillStyle = PAPER2; ctx.fillRect(x - 30 * sc, fy - fh, 70 * sc, fh); hatch(x - 30 * sc, fy - fh, 70 * sc, fh, 5 * sc, 0.3, 0.7); }
        };
        door(worldX(0.9)); door(worldX(lv.L + 0.5));
        ctx.save(); ctx.font = `700 ${Math.max(10, 11 * sc)}px "Courier New",monospace`; ctx.fillStyle = INK; ctx.textAlign = "center";
        ctx.fillText("BALCONY", worldX(lv.L + 0.5), fy - fh - 6 * sc); ctx.restore();
      }
    }
    function drawGate() {
      if (S.gate == null) return;
      const x = worldX(S.gate + 0.35), y0 = floorY(0), y1 = floorY(DEPTH);
      ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 4 * sc;
      ctx.beginPath(); ctx.moveTo(x, y0 - 40 * sc); ctx.lineTo(x, y1); ctx.stroke();
      ctx.setLineDash([10 * sc, 6 * sc]); ctx.lineWidth = 6 * sc; ctx.strokeStyle = AMBER;
      ctx.beginPath(); ctx.moveTo(x, y0 - 40 * sc); ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
      const t = Math.ceil(S.gateT);
      ctx.save(); ctx.font = `700 ${Math.max(11, 13 * sc)}px "Courier New",monospace`; ctx.fillStyle = INK; ctx.textAlign = "center";
      ctx.fillText(`CLOSED ${t}`, x, y0 - 48 * sc); ctx.restore();
    }
    function drawPosters() {
      if (!lv.face) return;
      const im = IMG["crowd-thread-poster"], ph = 120 * sc;
      for (let w = 6; w < lv.L; w += 11) { // hung on the mid layer, so they ride at its parallax
        const px = (w - camX * 0.6) * PPM * sc;
        if (px < -120 || px > W + 120) continue;
        if (im) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; ctx.drawImage(im, px - ((iw / ih) * ph) / 2, 60 * sc, (iw / ih) * ph, ph); }
        else { ctx.fillStyle = PAPER2; ctx.fillRect(px - 36 * sc, 60 * sc, 72 * sc, ph); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(px - 36 * sc, 60 * sc, 72 * sc, ph); }
      }
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.save();
      if (S.shake > 0) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
      drawLayer("far", 0.3);
      drawLayer("mid", 0.6);
      drawPosters();
      // the floor: a little hatch under the feet
      hatch(0, floorY(0) - 8 * sc, W, floorY(DEPTH) - floorY(0) + 18 * sc, 9 * sc, 0.25, 0.1);
      ctx.save(); ctx.globalAlpha = 0.5; drawLayer("near", 1.2); ctx.restore(); // the foreground heads, kept behind the thread so he is never hidden
      drawEndProps();
      if (mode !== "intro") drawRing(radius());
      for (const s of staff) if (s.down <= 0 && !(s.type === "staff" && false)) drawCone(s);
      drawGate();
      // figures sorted by depth
      labelRects = [];
      const list = [];
      for (const p of people) list.push({ z: p.z, k: "p", o: p });
      for (const s of staff) list.push({ z: s.z, k: "s", o: s });
      list.push({ z: PL.z, k: "t", o: PL });
      list.sort((a, b) => a.z - b.z);
      const fh = FIG_H * sc;
      for (const e of list) {
        if (e.k === "p") {
          const p = e.o, cx = worldX(p.x);
          if (cx < -120 || cx > W + 120) continue;
          const fy = floorY(p.z);
          const bend = p.bend > 0 ? 0.84 : 1;
          const jolt = p.cough > 0 ? Math.sin(p.cough * 40) * 3 * sc : 0;
          figure("crowd-thread-" + p.type, cx + jolt, fy, fh * bend, p.face < 0, { squash: 1 });
          if (p.exposed) { ctx.fillStyle = RUST; ctx.fillRect(cx - 5 * sc, fy - fh - 8 * sc, 10 * sc, 4 * sc); }
          if (p.alert > 0) { ctx.save(); ctx.font = `700 ${16 * sc + 6}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText("!", cx, fy - fh - 12 * sc); ctx.restore(); }
          if (p.cough > 0) { ctx.save(); ctx.font = `700 ${Math.max(12, 14 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText(lv.gala ? "*hh!*" : "*hh*", cx + p.face * 24 * sc, fy - fh * 0.85); ctx.restore(); }
          if (p.tagT > 0 && !p.friend) label(p.name, p.want, cx, fy - fh - 14 * sc, Math.min(1, p.tagT));
          if (p.friend) { /* Ama and Lev */ }
        } else if (e.k === "s") {
          const s = e.o, cx = worldX(s.x);
          if (cx < -120 || cx > W + 120) continue;
          const fy = floorY(s.z);
          if (s.down > 0) {
            figure("crowd-thread-" + s.type, cx, fy, fh * 0.62, s.face < 0, { squash: 1 });
            ctx.save(); ctx.font = `700 ${Math.max(11, 13 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center";
            ctx.fillText(`down ${Math.ceil(s.down)}`, cx, fy - fh * 0.7); ctx.restore();
          } else figure("crowd-thread-" + s.type, cx, fy, fh, s.face < 0);
        } else {
          const cx = worldX(PL.x), fy = floorY(PL.z) - (RM || !PL.moving ? 0 : Math.abs(Math.sin(PL.bob)) * 3 * sc);
          const id = S.dartT > 0.2 && lv.darts ? "tox-dart" : S.turnT > 0 ? "tox-turn" : S.closed ? "tox-closed" : "tox-walk";
          figure("crowd-thread-" + id, cx, fy, fh, PL.face < 0);
          // the player's mark: an amber chevron over his head, so he is not lost in the queue
          ctx.save(); ctx.fillStyle = AMBER; ctx.strokeStyle = INK; ctx.lineWidth = 2;
          const my = fy - fh - (S.pressing ? 20 : 8) * sc - (RM ? 0 : Math.sin(S.t * 5) * 2 * sc), mw = 9 * sc + 3;
          ctx.beginPath(); ctx.moveTo(cx - mw, my - mw); ctx.lineTo(cx + mw, my - mw); ctx.lineTo(cx, my); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
          if (S.pressing && mode === "play") { ctx.save(); ctx.font = `700 ${Math.max(11, 12 * sc)}px "Courier New"`; ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.fillText("pressing", cx, fy - fh - 34 * sc); ctx.restore(); }
        }
      }
      if (S.dartFx && S.dartFx.t > 0) {
        const f = S.dartFx; ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5 * sc;
        ctx.beginPath(); ctx.moveTo(worldX(PL.x), floorY(PL.z) - fh * 0.55); ctx.lineTo(worldX(f.x), floorY(f.z) - fh * 0.6); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
      if (S.ending && S.toxin) { // the green from the corners in
        const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.hypot(W, H) * 0.6);
        g.addColorStop(0, "rgba(127,217,87,0)"); g.addColorStop(1, "rgba(127,217,87,.8)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }

    // ---- HUD ------------------------------------------------------------------------------------------
    const hud = { bar: null, mask: null, line: null, img: null, txt: null, exp: null, ring: null, ico: null, sh: null, mode: "" };
    function buildHud() {
      topEl.innerHTML = `<span><img data-i="hud-breath" alt="" aria-hidden="true">ring <b data-ring>1.4</b> m</span>
<span><img data-i="hud-pulse" data-pi alt="" aria-hidden="true">pulse <b data-pv>20</b> / <b data-line>100</b></span>
<span><img data-i="hud-shroud-open" data-sh alt="" aria-hidden="true"><b data-shroud>open</b></span>
<span class="${P}sp"></span><span>breathed on <b data-exp>0</b></span>`;
      topEl.querySelectorAll("img").forEach((im) => { const u = icon(im.dataset.i); if (u) im.src = u; else im.style.display = "none"; });
      hud.ring = topEl.querySelector("[data-ring]"); hud.pv = topEl.querySelector("[data-pv]"); hud.line = topEl.querySelector("[data-line]");
      hud.shroud = topEl.querySelector("[data-shroud]"); hud.exp = topEl.querySelector("[data-exp]");
      hud.pi = topEl.querySelector("[data-pi]"); hud.sh = topEl.querySelector("[data-sh]");
      margin.innerHTML = `<b>PULSE</b><div class="${P}bar" role="meter" aria-label="Pulse" aria-valuemin="0" aria-valuemax="100"><img alt="" aria-hidden="true"><div class="u"></div><div class="m"></div><div class="l"></div></div><b data-ml>${selfLine()}</b>`;
      hud.img = margin.querySelector("img"); hud.mask = margin.querySelector(".m"); hud.under = margin.querySelector(".u"); hud.mline = margin.querySelector(".l");
      hud.bar = margin.querySelector("." + P + "bar");
    }
    function updateHud(force) {
      if (!S) return;
      hud.ring.textContent = radius().toFixed(1);
      hud.pv.textContent = String(Math.round(S.pulse)); hud.line.textContent = String(lv.gala ? selfLine() : pulseCap());
      hud.exp.textContent = String(S.exposed.length);
      hud.shroud.textContent = S.closed ? "closed" : "open";
      hud.bar.setAttribute("aria-valuenow", String(Math.round(S.pulse)));
      const frac = S.pulse / 100;
      hud.mask.style.left = (frac * 100) + "%"; hud.under.style.width = (frac * 100) + "%";
      hud.mline.style.left = (selfLine()) + "%";
      const near = S.pulse >= selfLine() - 12, at = S.pulse >= pulseCap() - 1.5;
      const m = at ? "hud-margin-green" : near ? "hud-margin-edge" : "hud-margin-calm";
      if (m !== hud.mode || force) { hud.mode = m; const u = icon(m); if (u) hud.img.src = u; hud.img.style.display = u ? "" : "none"; hud.bar.style.background = u ? PAPER : AMBER; }
      const pi = near ? "hud-pulse-edge" : "hud-pulse"; if (hud.pi.dataset.cur !== pi) { hud.pi.dataset.cur = pi; const u = icon(pi); if (u) hud.pi.src = u; }
      const si = S.closed ? "hud-shroud-closed" : "hud-shroud-open"; if (hud.sh.dataset.cur !== si) { hud.sh.dataset.cur = si; const u = icon(si); if (u) hud.sh.src = u; }
    }

    // ---- pad ------------------------------------------------------------------------------------------
    function buildPad() {
      const mk = (label, sub, key, hold) => `<button type="button" data-b="${key}" ${hold ? 'data-hold="1"' : ""} aria-label="${esc(label)}">${label}<small>${sub}</small></button>`;
      padEl.innerHTML = mk("◀", "A", "left", 1) + mk("▶", "D", "right", 1) + mk("▲", "W", "up", 1) + mk("▼", "S", "down", 1) + "<i></i>" +
        mk("Hold", "Z", "hold", 1) + mk("Turn", "Space", "turn") + mk("Shroud", "C", "shroud") + mk("Dart", "F", "dart");
      const dartB = padEl.querySelector('[data-b="dart"]'); dartB.hidden = !lv.darts;
      const shB = padEl.querySelector('[data-b="shroud"]'); shB.setAttribute("aria-pressed", "false"); shB.disabled = !flags.shroud;
      padEl.querySelectorAll("button").forEach((b) => {
        const k = b.dataset.b;
        if (b.dataset.hold) {
          const dn = (e) => { e.preventDefault(); keys[k] = 1; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch (_) {} };
          const up = () => { keys[k] = 0; b.classList.remove("down"); };
          on(b, "pointerdown", dn); on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
        } else {
          on(b, "click", () => { if (k === "turn") turn(); else if (k === "shroud") shroud(); else if (k === "dart") dart(); syncPad(); });
        }
      });
    }
    function syncPad() {
      const sb = padEl.querySelector('[data-b="shroud"]'); if (sb && S) sb.setAttribute("aria-pressed", String(!!S.closed));
      const tb = padEl.querySelector('[data-b="turn"]'); if (tb && S) tb.classList.toggle("down", S.turnT > 0);
    }

    // ---- input ----------------------------------------------------------------------------------------
    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", z: "hold", Z: "hold", ".": "hold" };
    on(document, "keydown", (e) => {
      if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = KEYMAP[e.key];
      if (k) { keys[k] = 1; e.preventDefault(); return; }
      if (e.key === " " || e.key === "Spacebar" || e.key === "t" || e.key === "T") { e.preventDefault(); if (!e.repeat) turn(); }
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
      const fixed = topEl.offsetHeight + margin.offsetHeight + padEl.offsetHeight + 44;
      sc = clamp(Math.min(ww / 560, (hh - fixed) / VH, 1.1), 0.4, 1.1);
      const ph = Math.round(VH * sc);
      panelEl.style.height = ph + "px";
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.round(ww); H = ph;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      for (const k in RAST) delete RAST[k];
    }
    function setCamera(snap) {
      const viewW = W / (PPM * sc);
      const target = clamp(PL.x - viewW * 0.3, 0, Math.max(0, lv.L + 2.4 - viewW));
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
        if (S.dartFx) S.dartFx.t -= dt;
        if (mode === "play") step(dt);
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
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-modal="true" aria-label="How to play: Crowd thread">
<div class="${P}kick" data-k></div><h2>Crowd thread</h2>
<p class="${P}q">&ldquo;${esc(QUOTE)}&rdquo; <small>(Part VI, Dr. Tox §2)</small></p>
<p data-scene></p>
<p>Your goal: <b data-goal></b>. The white ring on the floor is his breath. Anyone whose body is in it coughs once, says their name and what they want, and becomes a card in the next Triage. Nobody is harmed further here: exposures are the cost, not a failure. Pulse climbs while people press the ring's edge (the dashed band) and falls only when you stand still in a gap. <b data-end></b></p>
<ul class="${P}keys">
<li><b>Move</b><span>Arrows or WASD, the pad, or press and hold on the page to walk toward the point. People are solid: find the gaps.</span></li>
<li><b>Hold</b><span>Z, or the Hold button: stand and wait. In a gap, Pulse falls 2 a second.</span></li>
<li><b>Turn</b><span>Space: sideways, ring a quarter smaller for two seconds, then Pulse +3.</span></li>
<li><b>Shroud</b><span>C: closed halves the ring, slows you, and the trapped breath adds Pulse.</span></li>
<li><b>Dart</b><span data-dart>F: chapter 11 only. Drops the guard in front for twenty seconds, costs Pulse.</span></li>
</ul>
<div class="${P}seq" role="group" aria-label="Sequence">${LEVELS.map((l, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}">${esc(l.chapter)}<small>${esc(l.title)}</small></button>`).join("")}</div>
<button type="button" class="${P}go">Join the queue</button></div>`;
      const sync = () => {
        const l = LEVELS[pick];
        ov.querySelector("[data-k]").textContent = l.chapter + " · " + l.id;
        ov.querySelector("[data-scene]").textContent = l.scene;
        ov.querySelector("[data-goal]").textContent = l.goal;
        ov.querySelector("[data-end]").textContent = l.gala
          ? `Here Pulse is not capped: at the Self line (${selfLine()}) the page's border goes green from the corners in, and cuts.`
          : `Pulse is capped five under the line (${selfLine() - 5}): at the cap he leaves by the side door.`;
        ov.querySelector("[data-dart]").style.opacity = l.darts ? 1 : 0.45;
        ov.querySelectorAll("[data-s]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.s === pick)));
      };
      ov.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { pick = +b.dataset.s; sync(); }));
      ov.querySelector("." + P + "go").addEventListener("click", () => {
        ov.hidden = true; build(LEVELS[pick]); buildPad(); layout(); setCamera(true); mode = "play";
        say(LEVELS[pick].flavour);
        updateHud(true);
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
    wrap.__ct = { IMG, get S() { return S; }, get PL() { return PL; }, get people() { return people; }, get staff() { return staff; }, get lv() { return lv; }, radius, flags };
    artReady.then(() => { /* images are read straight from IMG each frame */ });
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

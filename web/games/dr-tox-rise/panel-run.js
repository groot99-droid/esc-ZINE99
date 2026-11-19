// Dr. Tox: Rise, 2D mode A: Panel run (DESIGN.md section 10, `m2_panel_run`).
// Noir spotted-black brush ink: heavy blacks spotted across the panel, light as bare paper, white
// gutters that skip time. Alexander's break-ins across a comic page, one panel at a time.
//
// Three pages, as the design's three sequences, each cut to a few minutes:
//   1  s2_panel_1  a research floor. 6 panels. Teaches darts and gutters. Pulse is capped at 95: at the
//                  cap the page fails and he aborts out of the nearest exit (the loss). The win: the
//                  first RCC plate, and out through the loading bay.
//   2  s2_panel_2  a cold-storage depot. 8 panels. Adds the dog (smells, ignores cover). The last panel
//                  is scripted: the door closes, Pulse is driven to 100, the Toxin State, cut to black.
//                  Reaching 100 before the records room by your own darts and sprinting is the loss.
//   3  s2_panel_3  the escape through the bunker. 9 panels. With the Observers (each acts once, in a
//                  gutter, at the player's call, at a cost the player sees) or alone (two more guards,
//                  a shorter route to the stair's hatch). Pulse 100 here is the player's own: Green in
//                  the Archive (the loss); out under 100 is the win.
//
// Rules (DESIGN.md section 10 and section 12, Pulse): a dart +12 and drops a guard for the panel (a
// graze, never a kill); seen +8 and the guard comes; a guard's hand on him +15; seen three times in a
// panel restarts it at its gutter; sprinting +3 a second; still in cover -2 a second, to the floor.
// Floor 20, or 40 when Amber is 0. A gutter advances every guard's round by its caption's time.
//
// Shared flags (data/flags.json): reads window.slack (start Pulse 20 + (90 - slack) / 3), amber, self,
// observers_choice, security_knows_face; writes pulse, panel.darts_drawn, panel.seen, hunch (page 1),
// toxin_events, self and amber (each Toxin State), toxin_in_escape and observers_choice (page 3).
//
// Art (api.art, ASSET_MAP.md "Panel run"): the far, mid and near layers of each site at 0.3, 0.6 and
// 1.2 of the camera; Alexander's five poses; guard, dog, camera, crate, exit, ledge, frame, locker,
// plate, the Toxin State panel, the Observers, the gutter arrow and caption boxes; shared hud-amber.
// Every id falls back to ink drawn here when the bundle lacks it.
//
// Lines: the captions "Pulse 112. Hold." and "Three minutes later." are DESIGN.md section 6's; the
// story line is the Origin's as DESIGN.md section 10 quotes it; the end lines are DESIGN.md section 8's
// chapter endings. Panel names, the other gutter times and the Observers' cost lines are added.

const P = "dtr-pr-";
const INK = "#111111", PAPER = "#F1EEE4", LIGHT = "#F7F4EA", AMBER = "#D99A2B", AMBER2 = "#F2C14E",
  GREEN = "#7FD957", TEAL = "#5E7375", BLOOD = "#4A0F14";
const HW = 540, FLOOR = 470, UPPER = 262; // world units: the panel is 540 tall at every size

const QUOTE = "He begins breaking into privately owned and restricted facilities";

// ---- the three pages ------------------------------------------------------------------------------
// items: crate {x} · pillar {x} · ledge {x, x2} · guard {a, b, v, off} · cam {x, sw, per} · dog {a, b, v}
//        plate {x} · locker {x} · arlo {x} · wall {x} · hatch {x}; alone:true / with:true limit an item
// t: the gutter's time in seconds before this panel (a guard's round advances by it)
const PAGES = [
  {
    id: "s2_panel_1", n: 1, site: "research", title: "The research floor", chapter: "Chapter five · the first break-in",
    start: 2 * 3600 + 10 * 60, cap: 95,
    goal: "Cross the floor to the plate room, take a rubbing of the plate, and leave by the loading bay.",
    scene: "Twelve months of watching, then the first night inside. Two guards, a camera. His body is new to the discipline: at Pulse 95 he aborts.",
    cols: [
      [{ id: "r0", name: "Service door", w: 1350, t: 0, items: [{ t: "crate", x: 560 }, { t: "guard", a: 760, b: 1180, v: 46, off: 0 }, { t: "pillar", x: 1010 }] }],
      [{ id: "r1", name: "Glass labs", w: 1500, t: 180, items: [{ t: "pillar", x: 460 }, { t: "pillar", x: 930 }, { t: "guard", a: 320, b: 1250, v: 56, off: 4 }] },
        { id: "r2", name: "Ceiling run", w: 1500, t: 90, items: [{ t: "ledge", x: 300, x2: 1080 }, { t: "cam", x: 760, sw: 0.75, per: 7 }, { t: "crate", x: 1230 }] }],
      [{ id: "r3", name: "Sample store", w: 1500, t: 240, items: [{ t: "crate", x: 480 }, { t: "crate", x: 900 }, { t: "guard", a: 600, b: 1320, v: 52, off: 9 }] },
        { id: "r4", name: "Server aisle", w: 1500, t: 120, items: [{ t: "cam", x: 520, sw: 0.7, per: 6 }, { t: "pillar", x: 720 }, { t: "guard", a: 900, b: 1360, v: 50, off: 2 }] }],
      [{ id: "r5", name: "Plate room", w: 1350, t: 180, last: true, items: [{ t: "crate", x: 420 }, { t: "plate", x: 720 }, { t: "cam", x: 1020, sw: 0.6, per: 8 }] }],
    ],
  },
  {
    id: "s2_panel_2", n: 2, site: "depot", title: "The depot", chapter: "Chapter seven · the hunt",
    start: 1 * 3600 + 48 * 60, cap: 100, scripted: true,
    goal: "Reach the depot's records room. Keep Pulse under 100 until you are there.",
    scene: "Three rounds, and a dog handler who is not on the rota. The dog smells; cover does not hide you from it. Get above it.",
    cols: [
      [{ id: "d0", name: "Yard door", w: 1400, t: 0, items: [{ t: "crate", x: 500 }, { t: "guard", a: 700, b: 1250, v: 54, off: 0 }, { t: "pillar", x: 1060 }] }],
      [{ id: "d1", name: "Loading dock", w: 1500, t: 180, items: [{ t: "ledge", x: 260, x2: 980 }, { t: "dog", a: 320, b: 1180, v: 72 }, { t: "crate", x: 1150 }] },
        { id: "d2", name: "Cold aisle", w: 1500, t: 90, items: [{ t: "pillar", x: 500 }, { t: "pillar", x: 1000 }, { t: "guard", a: 340, b: 1340, v: 60, off: 6 }] },
        { id: "d3", name: "Freezer row", w: 1500, t: 240, items: [{ t: "crate", x: 440 }, { t: "crate", x: 860 }, { t: "cam", x: 660, sw: 0.7, per: 6 }, { t: "guard", a: 1000, b: 1360, v: 48, off: 3 }] }],
      [{ id: "d4", name: "Rota office", w: 1500, t: 120, items: [{ t: "crate", x: 300 }, { t: "guard", a: 420, b: 900, v: 50, off: 1 }, { t: "pillar", x: 1080 }, { t: "dog", a: 950, b: 1360, v: 70 }] },
        { id: "d5", name: "Mezzanine stair", w: 1500, t: 180, items: [{ t: "ledge", x: 300, x2: 1180 }, { t: "guard", a: 420, b: 1300, v: 58, off: 5 }, { t: "cam", x: 1300, sw: 0.6, per: 7 }] },
        { id: "d6", name: "Handler's corridor", w: 1500, t: 300, items: [{ t: "dog", a: 420, b: 1100, v: 84 }, { t: "guard", a: 620, b: 1320, v: 56, off: 7 }, { t: "crate", x: 1180 }] }],
      [{ id: "d7", name: "Records room", w: 1300, t: 120, last: true, items: [{ t: "locker", x: 880 }, { t: "arlo", x: 1060 }, { t: "dogstill", x: 1170 }] }],
    ],
  },
  {
    id: "s2_panel_3", n: 3, site: "snakehead", title: "The escape", chapter: "Chapter ten · the Observers",
    start: null, cap: 100, escape: true,
    goal: "Get out of the bunker with Pulse under 100.",
    scene: "Snakehead under alarm. The inner door of the four cells is open from inside.",
    cols: [
      [{ id: "s0", name: "The stair", w: 1400, t: 0, items: [{ t: "pillar", x: 500 }, { t: "guard", a: 640, b: 1220, v: 58, off: 0 }, { t: "crate", x: 920 }, { t: "guard", a: 980, b: 1320, v: 50, off: 3, face: true }] }],
      [{ id: "s1", name: "Tank hall", w: 1500, t: 60, items: [{ t: "ledge", x: 300, x2: 1020 }, { t: "guard", a: 380, b: 1320, v: 62, off: 2 }, { t: "guard", a: 1100, b: 1380, v: 44, off: 6, alone: true }] },
        { id: "s2", name: "Generator room", w: 1500, t: 120, items: [{ t: "crate", x: 450 }, { t: "crate", x: 950 }, { t: "cam", x: 700, sw: 0.7, per: 6 }, { t: "guard", a: 1020, b: 1360, v: 52, off: 4 }] }],
      [{ id: "s3", name: "Cell block", w: 1500, t: 90, items: [{ t: "pillar", x: 420 }, { t: "pillar", x: 900 }, { t: "guard", a: 300, b: 1300, v: 68, off: 1 }, { t: "guard", a: 620, b: 1120, v: 50, off: 8, alone: true }] },
        { id: "s4", name: "Pump gallery", w: 1500, t: 180, items: [{ t: "ledge", x: 500, x2: 1220 }, { t: "cam", x: 900, sw: 0.65, per: 7 }, { t: "guard", a: 300, b: 820, v: 54, off: 3 }] },
        { id: "s5", name: "Archive stacks", w: 1500, t: 120, items: [{ t: "crate", x: 400 }, { t: "crate", x: 800 }, { t: "crate", x: 1200 }, { t: "guard", a: 500, b: 1320, v: 60, off: 5 }] }],
      [{ id: "s6", name: "Bunker door", w: 1500, t: 60, with: true, items: [{ t: "pillar", x: 600 }, { t: "guard", a: 400, b: 1300, v: 66, off: 2 }, { t: "cam", x: 1100, sw: 0.6, per: 6 }] },
        { id: "s7", name: "Cable tunnel", w: 1500, t: 120, with: true, items: [{ t: "ledge", x: 300, x2: 1100 }, { t: "guard", a: 300, b: 1300, v: 60, off: 6 }] }],
      [{ id: "s8w", name: "The last wall", w: 1300, t: 60, last: true, with: true, items: [{ t: "crate", x: 420 }, { t: "guard", a: 520, b: 1000, v: 50, off: 2 }, { t: "wall", x: 1200 }] },
        { id: "s8a", name: "The stair's hatch", w: 1400, t: 90, last: true, alone: true, items: [{ t: "pillar", x: 420 }, { t: "guard", a: 520, b: 1150, v: 60, off: 1 }, { t: "ledge", x: 1000, x2: 1320 }, { t: "hatch", x: 1290 }] }],
    ],
  },
];

const NUM = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE"];
function laterCaption(sec) {
  if (sec === 90) return "NINETY SECONDS LATER.";
  return `${NUM[Math.round(sec / 60)] || Math.round(sec / 60)} MINUTE${sec === 60 ? "" : "S"} LATER.`;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hhmm = (s) => `${String(Math.floor(s / 3600) % 24).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}`;

const SPR = { // world sizes of the sprites
  "panel-run-alex-walk": [94, 150], "panel-run-alex-crouch": [94, 150], "panel-run-alex-cover": [94, 150], "panel-run-alex-dart": [94, 150],
  "panel-run-alex-climb": [94, 150], "panel-run-guard": [94, 150], "panel-run-dog": [150, 94], "panel-run-crate": [120, 98],
  "panel-run-camera": [120, 90], "panel-run-exit": [104, 166], "panel-run-locker": [110, 165], "panel-run-rcc-plate": [150, 64],
  "panel-run-ledge": [80, 32], "panel-run-split": [94, 150], "panel-run-cauldron": [94, 150], "panel-run-ghost": [94, 150],
  "panel-run-twins": [150, 150],
};

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, img: () => Promise.resolve(null) };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let raf = 0, dead = false;

    // ---- DOM -----------------------------------------------------------------------------------------
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${LIGHT};color:${INK};font-family:"Courier New",Courier,monospace;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}stage{position:relative;flex:1;min-height:0}
.${P}panel{position:absolute;background:${INK};touch-action:none;cursor:crosshair}
.${P}panel canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}cap{position:absolute;left:10px;top:10px;max-width:calc(100% - 120px);background:${LIGHT};border:3px solid ${INK};box-shadow:3px 3px 0 ${INK};padding:5px 10px;font:700 14px/1.3 "Courier New",monospace;text-transform:uppercase;letter-spacing:.04em;pointer-events:none}
.${P}cap s{text-decoration:line-through;text-decoration-thickness:3px;opacity:.75}
.${P}cap[hidden]{display:none}
.${P}seen{position:absolute;right:10px;top:10px;background:${LIGHT};border:3px solid ${INK};padding:3px 8px;font:700 13px "Courier New",monospace;pointer-events:none}
.${P}seen i{display:inline-block;width:12px;height:12px;border:2px solid ${INK};border-radius:50%;margin-left:4px;vertical-align:-2px}
.${P}seen i.on{background:${INK}}
.${P}margin{position:relative;height:40px;flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:0 10px;background:${LIGHT};border-top:2px solid ${INK}}
.${P}margin b{font:700 12px "Courier New",monospace;letter-spacing:.12em}
.${P}margin canvas{flex:1;height:28px;min-width:60px;background:${INK}}
.${P}amb{display:flex;gap:2px}
.${P}amb img,.${P}amb span{width:20px;height:20px;display:block}
.${P}amb span{border:2px solid ${INK};border-radius:4px;box-sizing:border-box}
.${P}amb span.on{background:${AMBER}}
.${P}pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:6px 8px 8px;background:${LIGHT}}
.${P}pad button{font:700 14px "Courier New",monospace;color:${INK};background:${LIGHT};border:3px solid ${INK};box-shadow:2px 2px 0 ${INK};min-width:52px;min-height:46px;padding:4px 8px;cursor:pointer;touch-action:none;text-transform:uppercase}
.${P}pad button small{display:block;font-size:10px;font-weight:400;opacity:.7;text-transform:none}
.${P}pad button[aria-pressed=true],.${P}pad button.down{background:${INK};color:${LIGHT}}
.${P}pad button.${P}dart{background:${BLOOD};color:${LIGHT}}
.${P}pad button:focus-visible,.${P}ov button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}ov{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(17,17,17,.55);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}card{position:relative;max-width:620px;width:100%;box-sizing:border-box;margin:auto;background:${LIGHT};border:4px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:16px 18px;font-family:Georgia,"Times New Roman",serif}
.${P}card::before{content:"";position:absolute;right:-4px;top:-4px;width:70px;height:46px;background:radial-gradient(circle at 30% 40%,${INK} 0 9px,transparent 10px),radial-gradient(circle at 70% 70%,${INK} 0 5px,transparent 6px),radial-gradient(circle at 80% 20%,${INK} 0 3px,transparent 4px)}
.${P}kick{font:700 12px "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase}
.${P}card h2{margin:2px 0 6px;font:900 30px/1.05 Georgia,serif;text-transform:uppercase;letter-spacing:.02em}
.${P}q{margin:0 0 8px;padding-left:10px;border-left:6px solid ${INK};font-style:italic;font-size:16px}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font-size:14px}
.${P}keys li{display:grid;grid-template-columns:84px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${LIGHT};font:700 12px "Courier New",monospace;padding:2px 6px;text-transform:uppercase;text-align:center}
.${P}pages{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}
.${P}pages button{font:700 13px "Courier New",monospace;text-transform:uppercase;text-align:left;padding:8px;background:${LIGHT};color:${INK};border:3px solid ${INK};cursor:pointer;min-height:56px}
.${P}pages button small{display:block;font-weight:400;text-transform:none;font-size:11px;margin-top:2px}
.${P}pages button[aria-pressed=true]{background:${INK};color:${LIGHT}}
.${P}obs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px;font-size:14px}
.${P}obs label{display:flex;gap:6px;align-items:center;border:2px dashed ${INK};padding:6px 8px;cursor:pointer}
.${P}go{font:700 17px "Courier New",monospace;text-transform:uppercase;background:${INK};color:${LIGHT};border:3px solid ${INK};padding:10px 26px;cursor:pointer}
.${P}gut{max-width:760px;width:100%;margin:auto;background:${LIGHT};border:4px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:12px}
.${P}gut h3{margin:0 0 8px;font:700 13px "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase}
.${P}sheet{display:flex;gap:8px;align-items:stretch;margin-bottom:10px;padding:8px;background:#fff;border:2px solid ${INK}}
.${P}col{flex:1;display:flex;flex-direction:column;gap:6px}
.${P}cell{flex:1;min-height:26px;border:3px solid ${INK};background:${LIGHT};font:700 10px "Courier New",monospace;display:flex;align-items:flex-end;padding:2px 3px;overflow:hidden;line-height:1.1}
.${P}cell.ink{background:${INK};color:${LIGHT};background-image:radial-gradient(circle at 30% 30%,${LIGHT} 0 2px,transparent 3px),radial-gradient(circle at 70% 60%,${LIGHT} 0 1.5px,transparent 2.5px);background-size:17px 13px,23px 19px}
.${P}cell.opt{background:${AMBER2};outline:2px dashed ${INK};outline-offset:1px}
.${P}cell.here{box-shadow:inset 0 0 0 3px ${AMBER}}
.${P}cell.off{opacity:.3}
.${P}choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}
.${P}choice{display:grid;grid-template-columns:44px 1fr;gap:4px 8px;text-align:left;align-items:center;background:${LIGHT};color:${INK};border:3px solid ${INK};box-shadow:3px 3px 0 ${INK};padding:8px;cursor:pointer;font-family:"Courier New",monospace}
.${P}choice:hover{background:#fff}
.${P}choice img{width:44px;height:auto;grid-row:span 3}
.${P}choice .k{font:700 11px "Courier New",monospace;letter-spacing:.1em}
.${P}choice .n{font:700 15px Georgia,serif;text-transform:uppercase}
.${P}choice .r{font-size:12px}
.${P}choice.mark{border-color:${TEAL};box-shadow:3px 3px 0 ${TEAL}}
.${P}choice.mark .k::after{content:" · the Ghost marked this one";color:${TEAL}}
.${P}help{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;align-items:center;font-size:12px}
.${P}help button{font:700 12px "Courier New",monospace;text-transform:uppercase;background:${LIGHT};color:${INK};border:2px solid ${INK};padding:6px 8px;cursor:pointer;display:flex;align-items:center;gap:6px}
.${P}help button img{height:28px}
.${P}help button[disabled]{opacity:.35;cursor:default}
.${P}help button.armed{background:${TEAL};color:${LIGHT}}
.${P}note{margin-top:8px;font:italic 14px Georgia,serif;min-height:1em}
@media (max-width:640px){.${P}pad{flex-wrap:nowrap;gap:4px;padding:6px}.${P}pad button{flex:1 1 0;min-width:0;padding:3px 1px;font-size:11px}.${P}pad button small{display:none}
 .${P}card{padding:12px}.${P}card h2{font-size:24px}.${P}pages{grid-template-columns:1fr}.${P}cap{font-size:12px}.${P}keys li{grid-template-columns:70px 1fr}}
@media (prefers-reduced-motion:no-preference){.${P}shake{animation:${P}shk .25s}}
@keyframes ${P}shk{30%{transform:translateX(4px)}70%{transform:translateX(-3px)}}
`;
    const stageEl = document.createElement("div"); stageEl.className = P + "stage";
    const panelEl = document.createElement("div"); panelEl.className = P + "panel";
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "The panel: Alexander, the room, the guards and their light");
    const capEl = document.createElement("div"); capEl.className = P + "cap"; capEl.setAttribute("aria-live", "polite");
    const seenEl = document.createElement("div"); seenEl.className = P + "seen"; seenEl.setAttribute("aria-label", "Times seen in this panel");
    panelEl.append(cv, capEl, seenEl);
    stageEl.appendChild(panelEl);
    const ov = document.createElement("div"); ov.className = P + "ov";
    stageEl.appendChild(ov);

    const margin = document.createElement("div"); margin.className = P + "margin";
    margin.innerHTML = `<b>PULSE</b>`;
    const mcv = document.createElement("canvas");
    mcv.setAttribute("aria-hidden", "true");
    const amb = document.createElement("div"); amb.className = P + "amb"; amb.setAttribute("aria-label", "Amber on hand");
    margin.append(mcv, amb);

    const pad = document.createElement("div"); pad.className = P + "pad";
    const mkb = (label, keyHint, cls) => { const b = document.createElement("button"); b.type = "button"; b.innerHTML = `${label}<small>${keyHint}</small>`; if (cls) b.className = cls; pad.appendChild(b); return b; };
    const bL = mkb("◀", "A ←"), bR = mkb("▶", "D →");
    const bCrouch = mkb("Crouch", "S ↓"), bCover = mkb("Cover", "C"), bClimb = mkb("Climb", "W ↑"), bSprint = mkb("Sprint", "Shift");
    const bDart = mkb("Dart", "hold F", P + "dart");
    bL.setAttribute("aria-label", "Move left"); bR.setAttribute("aria-label", "Move right");
    bCrouch.setAttribute("aria-pressed", "false"); bSprint.setAttribute("aria-pressed", "false");
    wrap.append(css, stageEl, margin, pad);
    root.appendChild(wrap);

    const g = cv.getContext("2d");
    const mg = mcv.getContext("2d");

    // ---- art ----------------------------------------------------------------------------------------
    const IMG = {};
    const want = new Set(["panel-run-alex-walk", "panel-run-alex-crouch", "panel-run-alex-cover", "panel-run-alex-dart", "panel-run-alex-climb",
      "panel-run-guard", "panel-run-dog", "panel-run-crate", "panel-run-camera", "panel-run-exit", "panel-run-locker", "panel-run-rcc-plate",
      "panel-run-ledge", "panel-run-frame", "panel-run-toxin-panel", "panel-run-split", "panel-run-cauldron", "panel-run-ghost", "panel-run-twins",
      "panel-run-dart"]);
    for (const s of ["research", "depot", "snakehead"]) for (const l of ["far", "mid", "near"]) want.add(`panel-run-${s}-${l}`);
    let artReady = Promise.all([...want].map((id) => (art.has && art.has(id) ? art.img(id) : Promise.resolve(null))
      .then((im) => { if (im) IMG[id] = im; }).catch(() => {})));
    const RAST = {}; // id -> canvas at the current scale
    let rastK = 0;
    function raster(id, w, h) {
      const im = IMG[id];
      if (!im) return null;
      const key = id + "@" + w + "x" + h;
      if (RAST[key]) return RAST[key];
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
      try { c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); } catch { return null; }
      return (RAST[key] = c);
    }
    function sprite(id) { const s = SPR[id]; return s ? raster(id, s[0] * K, s[1] * K) : null; }
    function layer(site, l) { return raster(`panel-run-${site}-${l}`, 1920 * K, HW * K); }

    // ---- layout -------------------------------------------------------------------------------------
    let K = 1;           // device pixels per world unit
    let VW = 960;        // visible world width
    let PW = 0, PH = 0, dpr = 1;
    function layout() {
      const r = stageEl.getBoundingClientRect();
      const pad = r.width < 500 ? 6 : 14;
      const aw = Math.max(100, r.width - pad * 2), ah = Math.max(100, r.height - pad * 2);
      let ph = ah, pw = aw;
      const asp = pw / ph;
      if (asp > 1100 / HW) pw = ph * 1100 / HW;
      if (asp < 400 / HW) ph = pw * HW / 400;
      PW = Math.floor(pw); PH = Math.floor(ph);
      panelEl.style.left = Math.round((r.width - PW) / 2) + "px";
      panelEl.style.top = Math.round((r.height - PH) / 2) + "px";
      panelEl.style.width = PW + "px"; panelEl.style.height = PH + "px";
      dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(PW * dpr); cv.height = Math.round(PH * dpr);
      VW = PW / PH * HW;
      const nk = PH * dpr / HW;
      if (Math.abs(nk - rastK) > 0.01) { for (const k in RAST) delete RAST[k]; rastK = nk; }
      K = nk;
      const mr = mcv.getBoundingClientRect();
      mcv.width = Math.max(1, Math.round(mr.width * dpr)); mcv.height = Math.max(1, Math.round(mr.height * dpr));
    }
    const ro = new ResizeObserver(() => { layout(); });
    ro.observe(stageEl); ro.observe(margin);
    layout();

    // ---- state ----------------------------------------------------------------------------------------
    const flags = {
      slack: shared.get("window.slack", null),
      amber: shared.get("amber", null),
      self: shared.get("self", 100),
      obs: shared.get("observers_choice", "undecided"),
      face: shared.get("security_knows_face", false),
    };
    let pageIx = clamp(store.get("page", 0) | 0, 0, 2);
    let withThem = flags.obs !== "left_them";
    let page = PAGES[pageIx];
    let mode = "intro"; // intro | play | gutter | toxin | over
    const S = {
      pulse: 20, floor: 20, clock: 0, col: 0, path: [], panel: null, ents: null,
      px: 80, py: FLOOR, face: 1, crouch: false, cover: null, climbing: 0, climbTo: FLOOR, sprint: false,
      aiming: false, aimX: null, aimY: null, aimT: 0, darts: [], seenPanel: 0, seenTotal: 0, dartsDrawn: 0,
      sus: 0, grace: 0, shake: 0, flash: 0, flashText: "", toxT: 0, toxTrigger: "", plate: false, wallOpen: 0,
      used: { ghost: false, split: false, cauldron: false }, armed: null, ghostMark: null, cauldronOn: null, said112: false,
      t: 0,
    };
    const keys = { left: false, right: false, crouch: false, sprint: false };
    let crouchToggle = false, sprintToggle = false;

    // ---- captions (Self strikes words, section 12) -----------------------------------------------
    function captionHTML(text) {
      const self = typeof flags.self === "number" ? flags.self : 100;
      const n = self < 70 ? 2 : self < 90 ? 1 : 0;
      const words = String(text).split(" ");
      const hit = new Set();
      if (n && words.length > 2) { hit.add(Math.floor(words.length / 2)); if (n > 1) hit.add(words.length - 2); }
      return words.map((w, i) => (hit.has(i) ? `<s>${esc(w)}</s>` : esc(w))).join(" ");
    }
    let capTimer = 0;
    function caption(text, ms = 3200) {
      capEl.innerHTML = captionHTML(text);
      capEl.hidden = false;
      clearTimeout(capTimer);
      if (ms) capTimer = later(() => { capEl.hidden = true; }, ms);
    }
    function renderSeen() {
      seenEl.innerHTML = "SEEN" + [0, 1, 2].map((i) => `<i class="${i < S.seenPanel ? "on" : ""}"></i>`).join("");
    }
    function renderAmber() {
      amb.innerHTML = "";
      if (typeof flags.amber !== "number") { amb.hidden = true; return; }
      amb.hidden = false;
      for (let i = 0; i < 6; i++) {
        const id = i < flags.amber ? "hud-amber" : "hud-amber-empty";
        if (art.has && art.has(id)) { const im = document.createElement("img"); im.alt = ""; im.src = art.url(id); amb.appendChild(im); }
        else { const s = document.createElement("span"); if (i < flags.amber) s.className = "on"; amb.appendChild(s); }
      }
    }

    // ---- pages and panels ----------------------------------------------------------------------------
    const colsOf = (pg) => pg.cols.map((c) => c.filter((p) => !(p.with && !withThem) && !(p.alone && withThem)))
      .filter((c) => c.length);
    function startPage() {
      page = PAGES[pageIx];
      store.set("page", pageIx);
      const amberZero = flags.amber === 0;
      S.floor = amberZero ? 40 : 20;
      const slack = typeof flags.slack === "number" ? clamp(flags.slack, 0, 90) : 90;
      S.pulse = Math.max(S.floor, Math.round(20 + (90 - slack) / 3));
      S.clock = 0; S.col = 0; S.path = []; S.seenTotal = 0; S.dartsDrawn = 0; S.plate = false; S.said112 = false;
      S.used = { ghost: false, split: false, cauldron: false }; S.armed = null; S.ghostMark = null; S.cauldronOn = null;
      if (page.escape && flags.obs === "undecided") shared.set("observers_choice", withThem ? "with_them" : "left_them");
      renderAmber();
      enterPanel(colsOf(page)[0][0]);
    }
    function enterPanel(pn) {
      S.panel = pn;
      S.path.push(pn.id);
      buildPanel();
      mode = "play";
      ov.hidden = true;
      const when = page.start != null ? hhmm(page.start + S.clock) + ". " : "";
      caption(when + pn.name + ".", 3400);
      if (pn.id === "r0") later(() => { if (S.panel === pn && mode === "play") caption("Three minutes later.", 2600); }, 3600);
      panelEl.focus && panelEl.focus({ preventScroll: true });
    }
    function buildPanel() {
      const pn = S.panel;
      const rng = api.rng ? api.rng(pn.id) : Math.random;
      const ents = { guards: [], cams: [], dogs: [], crates: [], pillars: [], ledges: [], blobs: [], obj: [] };
      for (const it of pn.items) {
        if (it.alone && withThem) continue;
        if (it.with && !withThem) continue;
        if (it.face && !flags.face) continue;
        if (it.t === "guard") {
          // place the guard on his round at the gutter's time
          const L = it.b - it.a, per = 2 * L / it.v + 2.4;
          let tt = ((S.clock + (it.off || 0) * 3) % per + per) % per;
          let x, f, pause = 0;
          if (tt < L / it.v) { x = it.a + tt * it.v; f = 1; }
          else if (tt < L / it.v + 1.2) { x = it.b; f = 1; pause = L / it.v + 1.2 - tt; }
          else if (tt < 2 * L / it.v + 1.2) { x = it.b - (tt - L / it.v - 1.2) * it.v; f = -1; }
          else { x = it.a; f = -1; pause = per - tt; }
          ents.guards.push({ a: it.a, b: it.b, v: it.v, x, f, pause, alert: 0, tx: x, down: false, bang: 0 });
        } else if (it.t === "arlo") ents.guards.push({ a: it.x, b: it.x, v: 0, x: it.x, f: -1, pause: 1e9, alert: 0, tx: it.x, down: false, bang: 0, still: true });
        else if (it.t === "cam") ents.cams.push({ x: it.x, sw: it.sw, per: it.per, ph: (S.clock % it.per) / it.per * Math.PI * 2, bang: 0 });
        else if (it.t === "dog") {
          const L = it.b - it.a, per = 2 * L / it.v; const tt = (S.clock * 0.7) % per;
          ents.dogs.push({ a: it.a, b: it.b, v: it.v, x: tt < L / it.v ? it.a + tt * it.v : it.b - (tt - L / it.v) * it.v, f: tt < L / it.v ? 1 : -1, bang: 0 });
        } else if (it.t === "dogstill") ents.dogs.push({ a: it.x, b: it.x, v: 0, x: it.x, f: -1, bang: 0, still: true });
        else if (it.t === "crate") ents.crates.push({ x: it.x });
        else if (it.t === "pillar") ents.pillars.push({ x: it.x });
        else if (it.t === "ledge") ents.ledges.push({ x: it.x, x2: it.x2 });
        else ents.obj.push({ ...it });
      }
      // the Cauldron cleared this doorway: the guard nearest the exit is gone
      if (S.cauldronOn === pn.id && ents.guards.length) {
        ents.guards.sort((p, q) => q.b - p.b); ents.guards.shift();
      }
      for (let i = 0; i < 16; i++) ents.blobs.push({ x: rng() * pn.w, y: 40 + rng() * 360, rx: 6 + rng() * 26, ry: 3 + rng() * 12, r: rng() * 3 });
      S.ents = ents;
      S.px = 70; S.py = FLOOR; S.face = 1; S.cover = null; S.climbing = 0; S.aiming = false; S.darts = [];
      S.seenPanel = 0; S.sus = 0; S.grace = 1.0; seenEl.hidden = false; S.wallOpen = 0; S.camX = 0;
      renderSeen();
    }
    function restartPanel(why) {
      flashMsg(why);
      buildPanel();
      caption(why, 2600);
    }
    function flashMsg(t) { S.flash = RM ? 0.6 : 0.9; S.flashText = t; }

    // ---- the gutter: choose the next panel -----------------------------------------------------------
    function threats(pn) {
      const c = { guard: 0, cam: 0, dog: 0, ledge: 0, cover: 0 };
      for (const it of pn.items) {
        if ((it.alone && withThem) || (it.with && !withThem) || (it.face && !flags.face)) continue;
        if (it.t === "guard" || it.t === "arlo") c.guard++; else if (it.t === "cam") c.cam++;
        else if (it.t === "dog" || it.t === "dogstill") c.dog++; else if (it.t === "ledge") c.ledge++;
        else if (it.t === "crate" || it.t === "pillar") c.cover++;
      }
      return c;
    }
    function routeNote(pn) {
      const c = threats(pn), o = [];
      if (c.guard) o.push(c.guard === 1 ? "a guard" : `${c.guard} guards`);
      if (c.cam) o.push("a camera");
      if (c.dog) o.push("the dog");
      if (c.ledge) o.push("a ledge");
      if (c.cover) o.push(c.cover === 1 ? "one piece of cover" : `${c.cover} pieces of cover`);
      return o.join(" · ") || "nothing seen";
    }
    function gutter() {
      const cols = colsOf(page);
      S.col++;
      const next = cols[S.col];
      if (!next) return;
      mode = "gutter";
      S.armed = null;
      const P2 = P;
      const cellHTML = cols.map((col, ci) => `<div class="${P2}col">${col.map((pn) => {
        const crossed = S.path.includes(pn.id);
        const cls = crossed ? "ink" : ci === S.col ? "opt" : ci < S.col ? "off" : "";
        return `<div class="${P2}cell ${cls}">${esc(pn.name)}</div>`;
      }).join("")}</div>`).join("");
      const arrow = art.has && art.has("panel-run-gutter-arrow") ? art.url("panel-run-gutter-arrow") : "";
      const obsRow = page.escape && withThem ? `<div class="${P2}help" role="group" aria-label="The Observers">
        <span>Call one, once a page:</span>
        ${[["ghost", "The Ghost", "marks the safest panel"], ["split", "The Split", "carries him over the next panel"], ["cauldron", "The Cauldron", "clears the next doorway"]].map(([k, n, w]) => {
          const id = "panel-run-" + k;
          const im = art.has && art.has(id) ? `<img alt="" src="${art.url(id)}">` : "";
          return `<button type="button" data-obs="${k}" ${S.used[k] ? "disabled" : ""} title="${esc(w)}">${im}${esc(n)}<small style="font-weight:400;text-transform:none">${esc(w)}</small></button>`;
        }).join("")}</div>` : "";
      ov.innerHTML = `<div class="${P2}gut" role="dialog" aria-label="The gutter: choose the next panel">
        <h3>${esc(page.title)} · the page so far</h3>
        <div class="${P2}sheet" aria-hidden="true">${cellHTML}</div>
        <h3>Choose the next panel</h3>
        <div class="${P2}choices">${next.map((pn, i) => `<button type="button" class="${P2}choice${S.ghostMark === pn.id ? " mark" : ""}" data-i="${i}">
          ${arrow ? `<img alt="" src="${arrow}">` : `<span style="grid-row:span 3;font-size:30px">➜</span>`}
          <span class="k">${i + 1} · ${esc(laterCaption(pn.t || 60))}</span><span class="n">${esc(pn.name)}</span><span class="r">${esc(routeNote(pn))}</span></button>`).join("")}</div>
        ${obsRow}<div class="${P2}note" aria-live="polite"></div></div>`;
      ov.hidden = false;
      const note = ov.querySelector("." + P2 + "note");
      ov.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => choose(next[+b.dataset.i])));
      ov.querySelectorAll("[data-obs]").forEach((b) => b.addEventListener("click", () => {
        const k = b.dataset.obs;
        if (S.used[k]) return;
        if (k === "ghost") {
          S.used.ghost = true;
          let best = next[0], bs = 1e9;
          for (const pn of next) { const c = threats(pn); const s = c.guard * 2 + c.cam + c.dog * 2 - c.ledge * 0.5; if (s < bs) { bs = s; best = pn; } }
          S.ghostMark = best.id;
          note.textContent = "The Ghost walks ahead, unseen, and comes back with one door marked.";
          b.disabled = true;
          ov.querySelectorAll("[data-i]").forEach((c) => c.classList.toggle("mark", next[+c.dataset.i].id === best.id));
        } else {
          S.armed = S.armed === k ? null : k;
          ov.querySelectorAll("[data-obs]").forEach((c) => c.classList.toggle("armed", c.dataset.obs === S.armed));
          note.textContent = S.armed === "split" ? "The Split is ready: choose the panel to be carried over." :
            S.armed === "cauldron" ? "The Cauldron is ready: choose the panel whose doorway to clear." : "";
        }
      }));
      const first = ov.querySelector("[data-i]");
      first && first.focus({ preventScroll: true });
    }
    function choose(pn) {
      S.clock += pn.t || 60;
      const armed = S.armed;
      S.armed = null;
      if (armed === "split" && !pn.last) {
        S.used.split = true;
        S.path.push(pn.id);
        caption("The Split carries him over, and sits down after.", 3000);
        flashMsg(laterCaption(pn.t || 60));
        later(() => { if (!dead) gutter(); }, RM ? 200 : 900);
        mode = "gutter";
        ov.hidden = true;
        return;
      }
      if (armed === "cauldron") { S.used.cauldron = true; S.cauldronOn = pn.id; }
      flashMsg(laterCaption(pn.t || 60));
      enterPanel(pn);
      if (armed === "cauldron") later(() => caption("The Cauldron clears the doorway, and is emptier for it.", 3200), 200);
    }

    // ---- the end of a page ------------------------------------------------------------------------
    function writeCommon() {
      shared.set("pulse", Math.round(S.pulse));
      shared.set("panel.darts_drawn", (shared.get("panel.darts_drawn", 0) | 0) + S.dartsDrawn);
      shared.set("panel.seen", (shared.get("panel.seen", 0) | 0) + S.seenTotal);
    }
    function finish(outcome, text) {
      if (mode === "over") return;
      mode = "over";
      writeCommon();
      ov.hidden = true;
      store.set("done" + page.n, true);
      later(() => { if (!dead) api.end({ outcome, text }); }, RM ? 100 : 500);
    }
    function toxinCost(trigger) {
      const firstTime = !store.get("toxin:" + page.id, false);
      const ev = shared.get("toxin_events", []);
      const list = Array.isArray(ev) ? ev : [];
      if (firstTime) {
        store.set("toxin:" + page.id, true);
        list.push({ chapter: page.n === 2 ? "c7_hunt" : "c10_observers", scene: page.id, trigger, reconstructed: false });
        shared.set("toxin_events", list);
        const self = typeof flags.self === "number" ? flags.self : 100;
        shared.set("self", Math.max(0, self - 15));
        if (typeof flags.amber === "number") shared.set("amber", Math.max(0, flags.amber - 2));
      }
    }
    function startToxin(trigger) {
      if (mode !== "play") return;
      mode = "toxin";
      S.pulse = 100; S.toxT = 0; S.toxTrigger = trigger; S.aiming = false;
      capEl.hidden = true; seenEl.hidden = true;
      toxinCost(trigger);
      if (page.escape) shared.set("toxin_in_escape", true);
    }
    function toxinDone() {
      if (S.toxTrigger === "scripted") {
        finish("done", "The records room. The door shut on him with the guard, Arlo Benn, and the dog; the panel went green and the page cut to black. “He reads the room afterward like evidence of a crime he did not witness.” The Aftermath page holds the rest.");
      } else if (page.escape) {
        finish("lose", "Pulse 100 in the escape. The panel went green from the corners and the State took the rest of the page off it. Green in the Archive: he wakes small in a wide red frame, and the Observers have seen what he is.");
      } else {
        finish("lose", "Pulse 100 before the records room. The panel went green and the State resolved the rest of the page off it. He will read the room afterward, and not remember.");
      }
    }
    function abort95() {
      if (mode !== "play") return;
      S.pulse = page.cap;
      finish("lose", "Pulse 95. Hold. He could not. The page fails, and he aborts out of the nearest exit: his body is new to the discipline. The plate stays on the wall for another night.");
    }
    function addPulse(d) {
      S.pulse = clamp(S.pulse + d, S.floor, 100);
      if (!S.said112 && S.pulse >= 70 && mode === "play") { S.said112 = true; caption("Pulse 112. Hold.", 2600); }
      if (mode !== "play") return;
      if (page.cap < 100 && S.pulse >= page.cap) abort95();
      else if (S.pulse >= 100) startToxin("pulse");
    }

    // ---- input ------------------------------------------------------------------------------------
    function nearPillar() { return S.ents.pillars.find((p) => Math.abs(p.x - S.px) < 60); }
    function ledgeAt() {
      for (const l of S.ents.ledges) { if (Math.abs(S.px - l.x) < 34) return [l, l.x]; if (Math.abs(S.px - l.x2) < 34) return [l, l.x2]; }
      return null;
    }
    function doCover() {
      if (mode !== "play" || S.py !== FLOOR || S.climbing) return;
      if (S.cover) { S.cover = null; return; }
      const p = nearPillar();
      if (!p) { caption("No wall here. Find a pillar.", 1600); return; }
      S.cover = p; S.px = p.x + (S.px < p.x ? -30 : 30); S.face = S.px < p.x ? 1 : -1;
    }
    function doClimb() {
      if (mode !== "play" || S.climbing) return;
      const la = ledgeAt();
      if (!la) { caption("Nothing to climb here. Find a marked edge.", 1600); return; }
      S.cover = null; S.px = la[1]; S.climbing = RM ? 0.01 : 0.45; S.climbTo = S.py === FLOOR ? UPPER : FLOOR; S.climbFrom = S.py;
    }
    function aimTarget() {
      // keyboard aim: the nearest awake guard on his level, in the way he faces, else straight ahead
      let best = null, bd = 1e9;
      for (const gd of S.ents.guards) {
        if (gd.down) continue;
        const dx = (gd.x - S.px) * S.face;
        if (dx > 20 && dx < 620 && S.py === FLOOR && dx < bd) { bd = dx; best = gd; }
      }
      if (!best) for (const gd of S.ents.guards) { if (gd.down) continue; const dx = Math.abs(gd.x - S.px); if (dx < 620 && dx < bd && S.py === FLOOR) { bd = dx; best = gd; } }
      return best ? [best.x, FLOOR - 90] : [S.px + S.face * 400, S.py - 90];
    }
    function startAim(fromPointer) {
      if (mode !== "play" || S.climbing) return;
      S.aiming = true; S.aimT = 0; S.cover = null; S.aimPtr = !!fromPointer;
      if (!fromPointer) { S.aimX = null; S.aimY = null; }
      bDart.classList.add("down");
    }
    function release(cancel) {
      if (!S.aiming) return;
      S.aiming = false; bDart.classList.remove("down");
      if (cancel || mode !== "play") return;
      const [tx, ty] = S.aimX != null ? [S.aimX, S.aimY] : aimTarget();
      const ox = S.px + S.face * 24, oy = S.py - 98;
      const dx = tx - ox, dy = ty - oy, d = Math.hypot(dx, dy) || 1;
      S.face = dx >= 0 ? 1 : -1;
      S.darts.push({ x: ox, y: oy, vx: dx / d * 1100, vy: dy / d * 1100, life: 1.1 });
      S.dartsDrawn++;
      addPulse(12);
    }
    const KEY = (e) => e.key.length === 1 ? e.key.toLowerCase() : e.key;
    on(window, "keydown", (e) => {
      if (mode === "gutter") {
        const n = +e.key;
        if (n >= 1 && n <= 3) { const b = ov.querySelector(`[data-i="${n - 1}"]`); if (b) { e.preventDefault(); b.click(); } }
        return;
      }
      if (mode !== "play") return;
      const k = KEY(e);
      let used = true;
      if (k === "ArrowLeft" || k === "a") keys.left = true;
      else if (k === "ArrowRight" || k === "d") keys.right = true;
      else if (k === "ArrowDown" || k === "s") { if (S.py === UPPER && ledgeAt()) { if (!e.repeat) doClimb(); } else keys.crouch = true; }
      else if (k === "ArrowUp" || k === "w") { if (!e.repeat) doClimb(); }
      else if (k === "Shift") keys.sprint = true;
      else if (k === "c" || k === "e") { if (!e.repeat) doCover(); }
      else if (k === "f" || k === " ") { if (!e.repeat) startAim(false); }
      else if (k === "Escape") release(true);
      else used = false;
      if (used) e.preventDefault();
    });
    on(window, "keyup", (e) => {
      const k = KEY(e);
      if (k === "ArrowLeft" || k === "a") keys.left = false;
      else if (k === "ArrowRight" || k === "d") keys.right = false;
      else if (k === "ArrowDown" || k === "s") keys.crouch = false;
      else if (k === "Shift") keys.sprint = false;
      else if (k === "f" || k === " ") release(false);
    });
    on(window, "blur", () => { keys.left = keys.right = keys.crouch = keys.sprint = false; release(true); });
    const hold = (b, k) => {
      on(b, "pointerdown", (e) => { e.preventDefault(); keys[k] = true; b.classList.add("down"); try { b.setPointerCapture(e.pointerId); } catch {} });
      const up = () => { keys[k] = false; b.classList.remove("down"); };
      on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
      on(b, "click", (e) => { if (e.detail === 0 && mode === "play") { S.face = k === "left" ? -1 : 1; S.px = clamp(S.px + S.face * 40, 30, S.panel.w - 30); } });
    };
    hold(bL, "left"); hold(bR, "right");
    on(bCrouch, "click", () => { crouchToggle = !crouchToggle; bCrouch.setAttribute("aria-pressed", String(crouchToggle)); });
    on(bSprint, "click", () => { sprintToggle = !sprintToggle; bSprint.setAttribute("aria-pressed", String(sprintToggle)); });
    on(bCover, "click", doCover);
    on(bClimb, "click", doClimb);
    on(bDart, "pointerdown", (e) => { e.preventDefault(); startAim(false); });
    on(bDart, "click", (e) => { if (e.detail === 0) { startAim(false); release(false); } });
    on(window, "pointerup", () => { if (S.aiming) release(S.aimPtr && S.aimT < 0.12); });
    function toWorld(e) {
      const r = cv.getBoundingClientRect();
      return [S.camX + (e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * HW];
    }
    on(cv, "pointerdown", (e) => { if (mode !== "play") return; e.preventDefault(); startAim(true); [S.aimX, S.aimY] = toWorld(e); });
    on(window, "pointermove", (e) => {
      if (!S.aiming) return;
      const r = cv.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) [S.aimX, S.aimY] = toWorld(e);
    });

    // ---- simulation -------------------------------------------------------------------------------
    function hidden() {
      if (S.cover) return true;
      if (S.crouchNow && S.py === FLOOR) return S.ents.crates.some((c) => Math.abs(c.x - S.px) < 58);
      return false;
    }
    function bodyY() { return S.py === FLOOR ? (S.crouchNow ? FLOOR - 40 : FLOOR - 80) : UPPER - 80; }
    function guardSees(gd) {
      if (gd.down || S.py !== FLOOR || S.climbing) return false;
      const dx = (S.px - gd.x) * gd.f;
      if (dx > 0 && dx < 62) return !hidden() || (S.crouchNow && !S.cover && dx < 40);
      const ox = gd.x + gd.f * 34, oy = FLOOR - 95, L = 330;
      const ddx = (S.px - ox) * gd.f;
      if (ddx <= 0 || ddx > L || hidden()) return false;
      const y = bodyY(), top = oy - 45 * ddx / L, bot = oy + (FLOOR - oy) * ddx / L;
      return y >= top && y <= bot + 4;
    }
    function camAngle(c) { return Math.sin(S.t * Math.PI * 2 / c.per + c.ph) * c.sw; }
    function camSees(c) {
      if (hidden() || S.climbing) return false;
      const dx = S.px - c.x, dy = bodyY() - 95;
      const d = Math.hypot(dx, dy);
      if (d > 430) return false;
      const a = Math.atan2(dx, dy);
      return Math.abs(a - camAngle(c)) < 0.2;
    }
    function seen(src) {
      if (S.grace > 0) return;
      S.grace = 1.6; S.sus = 0;
      S.seenPanel++; S.seenTotal++;
      renderSeen();
      src.bang = 1.1;
      S.shake = RM ? 0 : 0.25;
      // the nearest guard comes
      let gd = src.f !== undefined && S.ents.guards.includes(src) ? src : null;
      if (!gd) { let bd = 1e9; for (const q of S.ents.guards) if (!q.down && !q.still && Math.abs(q.x - S.px) < bd) { bd = Math.abs(q.x - S.px); gd = q; } }
      if (gd && !gd.still) { gd.alert = 3.4; gd.tx = S.px; }
      addPulse(8);
      if (mode === "play" && S.seenPanel >= 3) restartPanel("Seen three times. Back to the gutter.");
      else if (mode === "play") caption(S.seenPanel === 1 ? "Seen." : "Seen again.", 1400);
    }
    function step(dt) {
      S.t += dt;
      if (S.flash > 0) S.flash -= dt;
      if (S.shake > 0) S.shake -= dt;
      if (mode === "toxin") {
        S.toxT += dt;
        if (S.toxT > (RM ? 2.6 : 3.8)) { mode = "cut"; later(toxinDone, 50); }
        return;
      }
      if (mode === "script") {
        S.scriptT += dt;
        S.pulse = Math.min(100, S.scriptFrom + (100 - S.scriptFrom) * Math.min(1, S.scriptT / (RM ? 0.5 : 2.6)));
        if (S.pulse >= 100) { mode = "play"; startToxin("scripted"); }
        return;
      }
      if (mode !== "play") return;
      const pn = S.panel, E = S.ents;
      if (S.grace > 0) S.grace -= dt;
      S.crouchNow = keys.crouch || crouchToggle;
      const sprinting = keys.sprint || sprintToggle;
      // climbing
      if (S.climbing > 0) {
        S.climbing -= dt;
        if (S.climbing <= 0) { S.climbing = 0; S.py = S.climbTo; }
      }
      // move
      let mv = 0;
      if (!S.aiming && !S.climbing) mv = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (mv) {
        if (S.cover) S.cover = null;
        S.face = mv;
        const sp = S.crouchNow ? 72 : sprinting ? 240 : 140;
        let nx = S.px + mv * sp * dt;
        if (S.py === UPPER) { const l = E.ledges.find((q) => S.px >= q.x - 40 && S.px <= q.x2 + 40); if (l) nx = clamp(nx, l.x, l.x2); }
        S.px = clamp(nx, 30, pn.w - 30);
        if (sprinting && !S.crouchNow) addPulse(3 * dt);
      } else if (hidden()) {
        S.pulse = Math.max(S.floor, S.pulse - 2 * dt);
      }
      if (mode !== "play") return;
      if (S.aiming) S.aimT += dt;
      // guards
      for (const gd of E.guards) {
        if (gd.bang > 0) gd.bang -= dt;
        if (gd.down || gd.still) continue;
        if (gd.alert > 0) {
          gd.alert -= dt;
          if (S.py === FLOOR && !hidden() && Math.abs(S.px - gd.x) < 360) gd.tx = S.px;
          const d = gd.tx - gd.x;
          gd.f = d >= 0 ? 1 : -1;
          if (Math.abs(d) > 4) gd.x += gd.f * Math.min(Math.abs(d), 128 * dt);
          if (gd.alert <= 0) { gd.pause = 0.8; gd.f = gd.x - gd.a > gd.b - gd.x ? -1 : 1; }
        } else if (gd.pause > 0) {
          gd.pause -= dt;
          if (gd.pause <= 0) gd.f = gd.x >= gd.b - 1 ? -1 : gd.x <= gd.a + 1 ? 1 : gd.f;
        } else {
          gd.x += gd.f * gd.v * dt;
          if (gd.x >= gd.b) { gd.x = gd.b; gd.pause = 1.2; }
          if (gd.x <= gd.a) { gd.x = gd.a; gd.pause = 1.2; }
        }
      }
      for (const dg of E.dogs) {
        if (dg.bang > 0) dg.bang -= dt;
        if (dg.still) continue;
        dg.x += dg.f * dg.v * dt;
        if (dg.x >= dg.b) { dg.x = dg.b; dg.f = -1; }
        if (dg.x <= dg.a) { dg.x = dg.a; dg.f = 1; }
      }
      for (const c of E.cams) if (c.bang > 0) c.bang -= dt;
      // darts
      for (const d of S.darts) {
        d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 260 * dt; d.life -= dt;
        for (const gd of E.guards) {
          if (gd.down || d.life <= 0) continue;
          if (Math.abs(d.x - gd.x) < 26 && d.y > FLOOR - 150 && d.y < FLOOR) {
            gd.down = true; d.life = 0; gd.alert = 0;
            caption(gd.still ? "Graze. Down." : "Graze. Down for a gutter.", 1500);
          }
        }
        if (d.y > FLOOR) d.life = 0;
      }
      S.darts = S.darts.filter((d) => d.life > 0);
      // detection
      let src = null;
      for (const gd of E.guards) if (guardSees(gd)) { src = gd; break; }
      if (!src) for (const c of E.cams) if (camSees(c)) { src = c; break; }
      if (!src) for (const dg of E.dogs) if (S.py === FLOOR && !S.climbing && Math.abs(dg.x - S.px) < 130) { src = dg; break; }
      if (src) { S.sus += dt; if (S.sus > 0.45) seen(src); }
      else S.sus = Math.max(0, S.sus - dt * 0.8);
      if (mode !== "play") return;
      // a guard's hand on him
      for (const gd of E.guards) {
        if (gd.down || gd.still || gd.alert <= 0 || S.py !== FLOOR) continue;
        if (Math.abs(gd.x - S.px) < 30 && !S.cover) { addPulse(15); if (mode === "play") restartPanel("Hit. Back to the gutter."); return; }
      }
      // objects
      for (const o of E.obj) {
        if (o.t === "plate" && !S.plate && Math.abs(S.px - o.x) < 50 && S.py === FLOOR) {
          S.plate = true; caption("The plate. RCC. Rubbing taken.", 3200);
          shared.set("hunch", Math.max(shared.get("hunch", 0) | 0, 1));
        }
        if (o.t === "wall" && !S.wallOpen && S.px > o.x - 200) { S.wallOpen = 0.01; caption("The Twins open the last wall. The recoil puts them both on the floor.", 3600); }
      }
      if (S.wallOpen > 0 && S.wallOpen < 1) S.wallOpen = Math.min(1, S.wallOpen + dt * (RM ? 10 : 1.2));
      if (pn.id === "d7" && S.px > 520) {
        mode = "script"; S.scriptT = 0; S.scriptFrom = S.pulse; S.aiming = false;
        caption("The door shuts behind him. Arlo Benn. The dog.", 2600);
        return;
      }
      // the exit
      const exitX = pn.w - 70;
      const hatch = E.obj.find((o) => o.t === "hatch");
      if (hatch) {
        if (S.py === UPPER && S.px >= hatch.x - 20) finish("win", "Out through the stair's hatch, alone, with Pulse under 100. Behind him the inner door is sealed on the four cells. Fade to months later.");
        return;
      }
      if (S.px >= exitX && S.py === FLOOR) {
        if (pn.last) {
          if (page.n === 1) {
            if (!S.plate) { caption("Not without the plate.", 1500); S.px = exitX - 6; return; }
            finish("win", "Out through a loading bay at dawn with a rubbing of the plate in his pocket. The hardware still reads RCC. The hunch gets its first card on the pin board.");
          } else if (page.escape) {
            if (S.wallOpen < 1) { S.px = exitX - 6; return; }
            finish("win", "Daylight through the Twins' broken wall, Pulse under 100, the Observers with him. Fade to months later.");
          }
          return;
        }
        gutter();
      }
    }

    // ---- drawing ----------------------------------------------------------------------------------
    function drawLayer(site, l, f, alpha) {
      const c = layer(site, l);
      const tw = 1920 * K;
      g.globalAlpha = alpha;
      if (c) {
        let off = -((S.camX * f * K) % tw);
        for (let x = off; x < cv.width; x += tw) g.drawImage(c, x, 0);
      }
      g.globalAlpha = 1;
    }
    function drawSprite(id, x, flip, opts = {}) {
      const s = SPR[id];
      const c = sprite(id);
      const w = s[0], h = s[1];
      const y = (opts.y != null ? opts.y : FLOOR) - h;
      g.save();
      g.translate(x, 0);
      if (flip) g.scale(-1, 1);
      if (opts.rot) { g.translate(0, FLOOR - 14); g.rotate(opts.rot); g.translate(0, -(FLOOR - 14)); }
      if (opts.rim) { g.shadowColor = "rgba(247,244,234,.75)"; g.shadowBlur = 7 * dpr; }
      if (c) g.drawImage(c, -w / 2, y, w, h);
      else fallback(id, w, h, y);
      g.restore();
    }
    function fallback(id, w, h, y) {
      g.fillStyle = id.includes("alex") ? LIGHT : INK;
      g.strokeStyle = INK; g.lineWidth = 4;
      if (id.includes("crate")) { g.fillStyle = LIGHT; g.fillRect(-w / 2, y, w, h); g.strokeRect(-w / 2, y, w, h); g.beginPath(); g.moveTo(-w / 2, y); g.lineTo(w / 2, y + h); g.stroke(); return; }
      if (id.includes("dog")) { g.fillStyle = INK; g.beginPath(); g.ellipse(0, y + h * 0.5, w * 0.4, h * 0.22, 0, 0, 7); g.fill(); g.fillRect(-w * 0.3, y + h * 0.5, 8, h * 0.5); g.fillRect(w * 0.25, y + h * 0.5, 8, h * 0.5); return; }
      if (id.includes("exit") || id.includes("locker")) { g.fillStyle = INK; g.fillRect(-w / 2, y, w, h); g.fillStyle = LIGHT; g.fillRect(-w / 2 + 12, y + 12, w - 30, h - 12); return; }
      if (id.includes("plate")) { g.fillStyle = INK; g.fillRect(-w / 2, y, w, h); g.fillStyle = LIGHT; g.font = `700 ${h * 0.5}px Georgia`; g.textAlign = "center"; g.fillText("RCC", 0, y + h * 0.66); return; }
      if (id.includes("camera")) { g.fillStyle = INK; g.fillRect(-w / 2, y, w * 0.8, h * 0.35); return; }
      if (id.includes("ledge")) { g.fillStyle = INK; g.fillRect(-w / 2, y, w, h * 0.4); return; }
      // a figure
      g.beginPath(); g.arc(0, y + h * 0.1, w * 0.17, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.rect(-w * 0.22, y + h * 0.2, w * 0.44, h * 0.42); g.fill(); g.stroke();
      g.beginPath(); g.rect(-w * 0.2, y + h * 0.62, w * 0.15, h * 0.38); g.rect(w * 0.05, y + h * 0.62, w * 0.15, h * 0.38); g.fill(); g.stroke();
    }
    function bang(x, y) {
      g.fillStyle = LIGHT; g.strokeStyle = INK; g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 22 : 34; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8); }
      g.closePath(); g.fill(); g.stroke();
      g.fillStyle = INK; g.font = "900 34px Georgia"; g.textAlign = "center"; g.fillText("!", x, y + 12);
    }
    function draw() {
      const pn = S.panel;
      if (!pn) { g.fillStyle = INK; g.fillRect(0, 0, cv.width, cv.height); return; }
      const E = S.ents;
      const target = clamp(S.px - VW * (S.face > 0 ? 0.3 : 0.7), 0, Math.max(0, pn.w - VW));
      S.camX = RM ? target : S.camX + (target - S.camX) * 0.18;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = PAPER; g.fillRect(0, 0, cv.width, cv.height);
      if (mode === "cut") { g.fillStyle = "#000"; g.fillRect(0, 0, cv.width, cv.height); return; }
      if (mode === "toxin" && S.toxT > (RM ? 0.4 : 1.4)) {
        const sc = Math.max(cv.width / 960, cv.height / 540);
        const c = raster("panel-run-toxin-panel", 960 * sc, 540 * sc);
        if (c) g.drawImage(c, (cv.width - c.width) / 2, (cv.height - c.height) / 2);
        else { g.fillStyle = LIGHT; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = INK; g.beginPath(); g.ellipse(cv.width / 2, cv.height * 0.6, cv.width * 0.15, cv.height * 0.35, 0.2, 0, 7); g.fill(); g.fillStyle = GREEN; g.fillRect(cv.width / 2 - 20, cv.height * 0.35, 8, 6); g.fillRect(cv.width / 2 + 10, cv.height * 0.35, 8, 6); }
        greenBorder(1);
        if (S.toxT > (RM ? 2.0 : 3.1)) { g.fillStyle = "#000"; g.fillRect(0, 0, cv.width, cv.height); }
        return;
      }
      const site = page.site;
      drawLayer(site, "far", 0.3, 1);
      drawLayer(site, "mid", 0.6, 1);
      const sx = S.shake > 0 ? Math.sin(S.t * 90) * 5 * dpr : 0;
      g.setTransform(K, 0, 0, K, -S.camX * K + sx, 0);
      // the dark: ink washed over the room, with spotted blacks
      g.fillStyle = "rgba(14,14,14,.6)"; g.fillRect(S.camX - 10, 0, VW + 20, HW);
      g.fillStyle = INK;
      for (const b of E.blobs) { if (b.x < S.camX - 40 || b.x > S.camX + VW + 40) continue; g.beginPath(); g.ellipse(b.x, b.y, b.rx, b.ry, b.r, 0, 7); g.fill(); }
      // floor
      g.fillStyle = INK; g.fillRect(S.camX - 10, FLOOR, VW + 20, HW - FLOOR);
      g.strokeStyle = LIGHT; g.lineWidth = 3; g.beginPath(); g.moveTo(S.camX - 10, FLOOR + 2); g.lineTo(S.camX + VW + 10, FLOOR + 2); g.stroke();
      // catwalks and ledge marks
      for (const l of E.ledges) {
        g.fillStyle = INK; g.fillRect(l.x - 20, UPPER, l.x2 - l.x + 40, 16);
        g.strokeStyle = LIGHT; g.lineWidth = 2; g.beginPath(); g.moveTo(l.x - 20, UPPER + 1); g.lineTo(l.x2 + 20, UPPER + 1); g.stroke();
        for (const x of [l.x, l.x2]) {
          g.strokeStyle = AMBER; g.lineWidth = 3; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(x, UPPER + 16); g.lineTo(x, FLOOR); g.stroke(); g.setLineDash([]);
          drawSprite("panel-run-ledge", x, false, { y: UPPER + 18 });
        }
      }
      // pillars, crates, things
      for (const p of E.pillars) { g.fillStyle = INK; g.fillRect(p.x - 18, 0, 36, FLOOR); g.fillStyle = LIGHT; g.fillRect(p.x + 12, 30, 3, FLOOR - 60); }
      for (const o of E.obj) {
        if (o.t === "plate") { drawSprite("panel-run-rcc-plate", o.x, false, { y: 300 }); if (S.plate) { g.strokeStyle = AMBER; g.lineWidth = 4; g.strokeRect(o.x - 80, 230, 160, 76); } }
        if (o.t === "locker") drawSprite("panel-run-locker", o.x, false);
        if (o.t === "wall") {
          g.fillStyle = INK; g.fillRect(o.x - 40, 0, pn.w - o.x + 60, FLOOR);
          if (S.wallOpen > 0) { const h = (FLOOR - 120) * S.wallOpen; g.fillStyle = LIGHT; g.beginPath(); g.moveTo(o.x - 10, FLOOR); g.lineTo(o.x - 20, FLOOR - h * 0.6); g.lineTo(o.x + 10, FLOOR - h); g.lineTo(o.x + 60, FLOOR - h * 0.8); g.lineTo(o.x + 80, FLOOR); g.fill(); }
          drawSprite("panel-run-twins", o.x - 120, false, { rim: true });
        }
        if (o.t === "hatch") { g.fillStyle = LIGHT; g.fillRect(o.x - 30, UPPER - 150, 60, 14); g.strokeStyle = AMBER; g.lineWidth = 3; g.strokeRect(o.x - 34, UPPER - 154, 68, 22); }
      }
      if (!pn.last || page.n === 1) drawSprite("panel-run-exit", pn.w - 50, false);
      // light: torch cones and camera sweeps, bare paper in the dark
      g.save(); g.beginPath(); g.rect(S.camX - 10, 0, VW + 20, FLOOR); g.clip();
      g.fillStyle = "rgba(247,244,234,.86)";
      for (const gd of E.guards) {
        if (gd.down || gd.still) continue;
        const ox = gd.x + gd.f * 34, oy = FLOOR - 95, L = 330;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + gd.f * L, oy - 45); g.lineTo(ox + gd.f * L, FLOOR); g.closePath(); g.fill();
      }
      for (const c of E.cams) {
        const a = camAngle(c), L = 430;
        g.beginPath(); g.moveTo(c.x, 95);
        g.lineTo(c.x + Math.sin(a - 0.2) * L, 95 + Math.cos(a - 0.2) * L);
        g.lineTo(c.x + Math.sin(a + 0.2) * L, 95 + Math.cos(a + 0.2) * L);
        g.closePath(); g.fillStyle = "rgba(247,244,234,.62)"; g.fill();
      }
      g.restore();
      for (const c of E.cams) drawSprite("panel-run-camera", c.x + 30, camAngle(c) < 0, { y: 112 });
      for (const c of E.crates) drawSprite("panel-run-crate", c.x, false);
      // actors
      for (const dg of E.dogs) {
        drawSprite("panel-run-dog", dg.x, dg.f < 0, { rim: true });
        if (!RM && !dg.still) { g.strokeStyle = LIGHT; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = 40 + ((S.t * 60 + i * 30) % 90); g.globalAlpha = 1 - r / 130; g.beginPath(); g.arc(dg.x + dg.f * 60, FLOOR - 60, r, -0.6, 0.6); g.stroke(); } g.globalAlpha = 1; }
      }
      for (const gd of E.guards) drawSprite("panel-run-guard", gd.x, gd.f < 0, gd.down ? { rot: gd.f < 0 ? -Math.PI / 2 : Math.PI / 2, rim: true } : { rim: true });
      if (page.escape && withThem && S.used.split && pn.id === S.path[S.path.length - 1]) { /* the Split sits in the gutter, not here */ }
      // Alexander
      let id = "panel-run-alex-walk", ay = S.py;
      if (S.climbing) { id = "panel-run-alex-climb"; const k = 1 - S.climbing / 0.45; ay = S.climbFrom + (S.climbTo - S.climbFrom) * clamp(k, 0, 1); }
      else if (S.aiming) id = "panel-run-alex-dart";
      else if (S.cover) id = "panel-run-alex-cover";
      else if (S.crouchNow) id = "panel-run-alex-crouch";
      const bob = !RM && (keys.left || keys.right) && !S.aiming && !S.climbing ? Math.abs(Math.sin(S.t * 10)) * 4 : 0;
      drawSprite(id, S.px, S.face < 0, { y: ay - bob });
      if (hidden()) { g.strokeStyle = AMBER; g.lineWidth = 3; g.setLineDash([5, 6]); g.beginPath(); g.ellipse(S.px, ay - 70, 50, 82, 0, 0, 7); g.stroke(); g.setLineDash([]); }
      // suspicion: the white tick over his head fills
      if (S.sus > 0.05) { g.fillStyle = LIGHT; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(S.px, ay - 170, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, S.sus / 0.45)); g.lineTo(S.px, ay - 170); g.fill(); g.stroke(); }
      // aim line and darts
      if (S.aiming) {
        const [tx, ty] = S.aimX != null ? [S.aimX, S.aimY] : aimTarget();
        g.strokeStyle = BLOOD; g.lineWidth = 3; g.setLineDash([10, 8]);
        g.beginPath(); g.moveTo(S.px + S.face * 24, S.py - 98); g.lineTo(tx, ty); g.stroke(); g.setLineDash([]);
        g.strokeStyle = LIGHT; g.beginPath(); g.arc(tx, ty, 14, 0, 7); g.stroke();
      }
      for (const d of S.darts) {
        const c = sprite("panel-run-dart");
        g.save(); g.translate(d.x, d.y); g.rotate(Math.atan2(d.vy, d.vx));
        if (c) g.drawImage(c, -24, -7, 48, 14); else { g.fillStyle = BLOOD; g.fillRect(-20, -2, 40, 4); }
        g.restore();
      }
      for (const gd of E.guards) if (gd.bang > 0) bang(gd.x, FLOOR - 200);
      for (const dg of E.dogs) if (dg.bang > 0) bang(dg.x, FLOOR - 140);
      for (const c of E.cams) if (c.bang > 0) bang(c.x, 170);
      g.setTransform(1, 0, 0, 1, 0, 0);
      drawLayer(site, "near", 1.2, 0.4);
      // the frame
      const fr = raster("panel-run-frame", cv.width, cv.height);
      if (fr) g.drawImage(fr, 0, 0); else { g.strokeStyle = INK; g.lineWidth = 10 * dpr; g.strokeRect(0, 0, cv.width, cv.height); }
      if (mode === "script") greenBorder(Math.max(0, (S.pulse - 90) / 10));
      if (mode === "toxin") greenBorder(Math.min(1, S.toxT / (RM ? 0.01 : 1.2)));
      // a gutter's time, typed across the panel
      if (S.flash > 0) {
        const w = Math.min(cv.width * 0.8, 520 * dpr), h = 60 * dpr;
        g.globalAlpha = Math.min(1, S.flash * 2.5);
        g.fillStyle = LIGHT; g.strokeStyle = INK; g.lineWidth = 4 * dpr;
        g.fillRect((cv.width - w) / 2, cv.height * 0.42, w, h); g.strokeRect((cv.width - w) / 2, cv.height * 0.42, w, h);
        g.fillStyle = INK; g.font = `700 ${Math.round(Math.min(22, w / dpr / 22) * dpr)}px "Courier New",monospace`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(S.flashText.toUpperCase(), cv.width / 2, cv.height * 0.42 + h / 2);
        g.globalAlpha = 1; g.textBaseline = "alphabetic";
      }
    }
    // green from the corners in
    function greenBorder(p) {
      if (p <= 0) return;
      const w = cv.width, h = cv.height, t = 14 * dpr;
      g.fillStyle = GREEN;
      const lx = w / 2 * p, ly = h / 2 * p;
      g.fillRect(0, 0, lx, t); g.fillRect(w - lx, 0, lx, t); g.fillRect(0, h - t, lx, t); g.fillRect(w - lx, h - t, lx, t);
      g.fillRect(0, 0, t, ly); g.fillRect(0, h - ly, t, ly); g.fillRect(w - t, 0, t, ly); g.fillRect(w - t, h - ly, t, ly);
    }
    // the Pulse line in the bottom margin
    function drawMargin() {
      const w = mcv.width, h = mcv.height;
      if (!w || !h) return;
      mg.fillStyle = INK; mg.fillRect(0, 0, w, h);
      const p = S.pulse;
      const cap = page.cap;
      // the fill under the line
      mg.fillStyle = "rgba(217,154,43,.22)"; mg.fillRect(0, 0, w * p / 100, h);
      mg.fillStyle = cap < 100 ? AMBER2 : GREEN; mg.fillRect(w * cap / 100 - 1 * dpr, 0, 2 * dpr, h);
      const edge = p >= 70, full = p >= 100;
      const mid = h * 0.6, amp = h * (0.18 + p / 100 * 0.32);
      const rate = 0.6 + p / 100 * 1.6;
      const off = RM ? 0 : S.t * 80 * rate * dpr;
      mg.lineWidth = 2 * dpr; mg.strokeStyle = full ? GREEN : AMBER;
      mg.beginPath();
      const per = 70 * dpr / rate * 1.6;
      for (let x = 0; x <= w; x += 2 * dpr) {
        const u = ((x + off) % per) / per;
        let y = mid;
        if (u > 0.42 && u < 0.46) y = mid + amp * 0.3; else if (u >= 0.46 && u < 0.5) y = mid - amp; else if (u >= 0.5 && u < 0.54) y = mid + amp * 0.5;
        x === 0 ? mg.moveTo(x, y) : mg.lineTo(x, y);
      }
      mg.stroke();
      if (edge && !full) { // green spikes at the edge
        mg.strokeStyle = GREEN; mg.beginPath();
        for (let x = 0; x <= w; x += per * 3) { const xx = x - (off % (per * 3)) + per * 0.48; mg.moveTo(xx, mid); mg.lineTo(xx + 2 * dpr, mid - amp * 1.2); mg.lineTo(xx + 4 * dpr, mid); }
        mg.stroke();
      }
    }

    // ---- loop -----------------------------------------------------------------------------------
    let last = performance.now();
    let dataTick = 0;
    function frame(now) {
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (mode === "play" || mode === "toxin" || mode === "script") step(dt);
      else S.t += dt;
      draw();
      drawMargin();
      if ((dataTick += dt) > 0.2) {
        dataTick = 0;
        wrap.dataset.mode = mode; wrap.dataset.page = String(page.n); wrap.dataset.panel = S.panel ? S.panel.id : "";
        wrap.dataset.px = String(Math.round(S.px)); wrap.dataset.py = S.py === FLOOR ? "floor" : "upper"; wrap.dataset.pulse = String(Math.round(S.pulse));
        let ahead = "";
        if (S.ents && S.py === FLOOR) for (const gd of S.ents.guards) { const d = gd.x - S.px; if (!gd.down && d > 0 && (ahead === "" || d < ahead)) ahead = Math.round(d); }
        wrap.dataset.ahead = String(ahead);
        margin.setAttribute("aria-label", `Pulse line, ${S.pulse >= 100 ? "green" : S.pulse >= 70 ? "at the edge" : "calm"}`);
      }
      raf = requestAnimationFrame(frame);
    }

    // ---- the how-to card ------------------------------------------------------------------------
    function intro() {
      mode = "intro";
      const cards = PAGES.map((pg, i) => `<button type="button" data-p="${i}" aria-pressed="${i === pageIx}">${pg.n}. ${esc(pg.title)}<small>${esc(pg.chapter)}${store.get("done" + pg.n, false) ? " · played" : ""}</small></button>`).join("");
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-label="Panel run: how to play">
        <div class="${P}kick" data-k></div>
        <h2>Panel run</h2>
        <blockquote class="${P}q">“${esc(QUOTE)}”</blockquote>
        <div class="${P}pages" role="group" aria-label="Choose a page">${cards}</div>
        <p data-scene></p>
        <p><b>Goal.</b> <span data-goal></span></p>
        <ul class="${P}keys">
          <li><b>Move</b><span>A D · ← → · ◀ ▶. Shift or Sprint runs: +3 Pulse a second.</span></li>
          <li><b>Cover</b><span>C at a pillar, or crouch (S ↓) behind a crate. Still in cover, Pulse falls 2 a second.</span></li>
          <li><b>Climb</b><span>W ↑ at a dashed amber edge. Up there the torches and the dog do not reach; cameras do.</span></li>
          <li><b>Dart</b><span>Hold F or Space (or press on the panel and drag) to aim; release to throw. +12 Pulse. A graze: the guard is down until the next gutter.</span></li>
          <li><b>Gutter</b><span>The right edge opens the next choice. Each route jumps a different time, and every round moves on by it. Keys 1 to 3.</span></li>
          <li><b>Seen</b><span>+8 Pulse and the guard comes; his hand on you +15. Three times in a panel and it restarts at its gutter.</span></li>
        </ul>
        <div class="${P}obs" data-obs hidden>
          <label><input type="radio" name="${P}o" value="with" ${withThem ? "checked" : ""}> Go through with the Observers</label>
          <label><input type="radio" name="${P}o" value="alone" ${withThem ? "" : "checked"}> Take the stair alone and seal the door</label>
        </div>
        <button type="button" class="${P}go">Start</button></div>`;
      ov.hidden = false;
      const sync = () => {
        const pg = PAGES[pageIx];
        ov.querySelector("[data-k]").textContent = pg.chapter;
        ov.querySelector("[data-scene]").textContent = pg.scene;
        ov.querySelector("[data-goal]").textContent = pg.goal;
        ov.querySelectorAll("[data-p]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.p === pageIx)));
        const o = ov.querySelector("[data-obs]");
        o.hidden = !(pg.escape && flags.obs === "undecided");
      };
      ov.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { pageIx = +b.dataset.p; sync(); }));
      ov.querySelectorAll(`input[name="${P}o"]`).forEach((r) => r.addEventListener("change", () => { withThem = r.value === "with" ? r.checked : !r.checked; }));
      ov.querySelector("." + P + "go").addEventListener("click", () => { startPage(); });
      sync();
      ov.querySelector("." + P + "go").focus({ preventScroll: true });
    }

    renderSeen();
    capEl.hidden = true;
    intro();
    artReady.then(() => { if (!dead) { for (const k in RAST) delete RAST[k]; } });
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        dead = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        timers.forEach(clearTimeout); timers.clear();
        clearTimeout(capTimer);
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const k in RAST) delete RAST[k];
        wrap.remove();
      },
    };
  },
};

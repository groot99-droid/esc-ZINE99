// Project: Man Eater — Floor Plan (1D, drawing from memory). Graphic style: cyanotype blueprint.
// DESIGN.md section 11.4, cut to one page: the ground floor's east-west run of rooms, the stride
// trap and the void (days 4 and 6 combined). One square is 75 cm, Fisk's day-1 stride. Halls are
// drawn at their remembered paces; a changed Fisk walked later with a longer stride, so each must be
// converted (paces x that day's stride / 75) before the plan is closed against the outside wall.
// The void is placed where the halls do not close; correct within 2 squares. One retry.
//
// Actions: draw a room from a margin entry; convert it on the slide rule; close the plan (measure
// it against the wall); place the void stamp; and two one-time notes (the drains, the file), the
// design's hint lines for cold_from_below and files_read. Phases: drawing; the first close (a gap
// that may not be there); converting; the gap that is there, and the stamp.
// Art (api.art): the room stamps (in the pencilled entries and on the drawn rooms), the void stamp,
// the plan sheet (the how-to card and the ending), the day's chapter card.
//
// Phase 2 (the ladder; DEEP_DIVE.md section 3, DESIGN.md 11.4 rules 7 to 9). Three stages:
//   teach, day 2: three rooms against the west hall's 88 paces; the plan closes once the two rooms
//     paced on day 2 are converted. It cannot be lost.
//   test, day 4: the page above (the stride trap and the void), with ghost lines (three pencil rubs
//     raise the older plan under a drawn room) and knots to posts (Jax's knotted bootlace, converted
//     to metres, marks the gap in the fence).
//   twist, day 6: the sheet turned on its side, the hall in elevation. Turned over: lengths were
//     measured with Fisk's stride and corrected for the day; heights were measured against his own
//     head, and the sheet's day-1 scale is the wrong one. Four marks, then the set piece, "The First
//     Chart": the page draws the clearance of the occupant that fits, 338 cm. No figure is drawn here;
//     the finished strip (art: elevation-strip) closes the stage.
// Layer links (api.shared): the pipes inked at 2.7 m put the pipe route on the Silhouette halls strip;
// the marked gap is on the wire in Snow line's night 7.
import { artKit, ladder } from "./kit.js";

const NAMES = { 1: "Day 2 · stamps and paces", 2: "Day 4 · the stride trap", 3: "Day 6 · the sheet turned" };
const SETUP = {
  1: { rooms: ["bunk", "caf", "rec"], wall: { id: "wall", name: "WEST HALL", paces: 88, day: 1 }, day: 2 },
  2: { rooms: ["bunk", "caf", "rec", "inf", "cold"], wall: { id: "wall", name: "OUTSIDE WALL", paces: 120, day: 3 }, day: 4 },
};
const GHOST = {
  bunk: "Under the bunk hall, an older line in another hand: a bolt housing drawn on the hall side of every door. The bunk rooms' bolts were once on the outside.",
  cold: "Under the cold store, a stair symbol that someone scraped off the sheet: treads going down, to the east.",
};
const LACE = { knots: 17, gap: 11, paces: 4, day: 3 }; // Jax's bootlace: a knot a post, a double knot where the wire is loose
// The elevation (twist). Fisk's height by day is the Chart's height row; each mark was noted against his own head.
const TALL = { 1: 178, 2: 192, 3: 213, 4: 237, 5: 261, 6: 285 };
const DUTY = { 1: "arrival", 2: "paint", 3: "shovel", 4: "boilers", 5: "laundry", 6: "today" };
const MARKS = [
  { id: "lever", name: "LEVER", m: 2.4, day: 4, off: 3, note: "the steel lever: 3 cm over the top of my head, the day of the boilers" },
  { id: "pipes", name: "PIPES", m: 2.7, day: 6, off: -15, note: "the pipes: 15 cm under the top of my head, this morning" },
  { id: "windows", name: "WINDOWS", m: 3.5, day: 2, off: 158, note: "the window sills: 158 cm over my head, from the floor, the day I scraped paint" },
  { id: "claws", name: "CLAW MARKS", m: 3.6, taped: true, note: "the claw marks: taped from the ladder, the same day. 3.60 m" },
];

const P = { blue: "#1c3d6e", deep: "#142e55", line: "#eaf2ff", faint: "rgba(234,242,255,.16)", pencil: "#f0dfa6", red: "#ff9a7a" };
const STRIDE = { 1: 75, 2: 81, 3: 90, 4: 101 }; // cm, the Chart's stride row on days 1 to 4
const ALL_ROOMS = [
  { id: "bunk", name: "BUNK HALL", paces: 39, day: 1, art: "room-bunk" },
  { id: "caf", name: "CAFETERIA", paces: 27, day: 2, art: "room-cafeteria" },
  { id: "rec", name: "REC ROOM", paces: 18, day: 2, art: "room-rec-room" },
  { id: "inf", name: "INFIRMARY", paces: 16, day: 3, art: "room-infirmary" },
  { id: "cold", name: "COLD STORE", paces: 11, day: 4, art: "room-cold-store" },
];
const conv = (r) => (r.paces * STRIDE[r.day]) / 75;
const SQ = 6, X0 = 30, MAXSQ = 150;
const NOTES = {
  drains: { art: "room-boiler-room", label: "Listen at the drains", text: "Cold comes up through the drain at the end of the cold store, colder than the yard. Something under the east end is open to the ground." },
  file: { art: "room-sams-office", label: "Recall the file", text: "The project's file names a lower level under the east wing. No stair to it is drawn on any sheet in the file." },
};

export default {
  mount(root, api) {
    const lad = ladder(api, NAMES);
    let cur = null;
    const go = (n) => { if (cur) cur.unmount(); cur = run(n); };
    go(lad.reached());
    return { unmount() { if (cur) cur.unmount(); cur = null; lad.dispose(); } };

    function run(stage) {
    const sh = api.shared, twist = stage === 3, S = SETUP[Math.min(2, stage)];
    const ROOMS = ALL_ROOMS.filter((r) => S.rooms.includes(r.id)), WALL = S.wall;
    const TRUE_END = ROOMS.reduce((a, r) => a + conv(r), 0), TRUE_VOID = (TRUE_END + conv(WALL)) / 2;
    const K = "man-eater-floor-plan-";
    const reduce = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    const STYLE = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:${P.blue};background-image:radial-gradient(ellipse at 40% 30%,rgba(255,255,255,.08),transparent 60%),radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.4px),linear-gradient(${P.faint} 1px,transparent 1px),linear-gradient(90deg,${P.faint} 1px,transparent 1px);background-size:auto,5px 5px,24px 24px,24px 24px;color:${P.line};font-family:'Courier Prime','Courier New',monospace}
      .${K}page{max-width:1120px;margin:0 auto;padding:14px 16px 20px;display:grid;gap:12px}
      .${K}planbox{overflow-x:auto;border:2px solid ${P.line};background:rgba(20,46,85,.45)}
      .${K}plan{width:100%;min-width:740px;height:auto;display:block;touch-action:manipulation}
      .${K}cols{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:14px}
      .${K}box{border:1.5px solid rgba(234,242,255,.6);padding:10px 12px;background:rgba(20,46,85,.55)}
      .${K}box h4{margin:0 0 8px;font-size:13px;letter-spacing:.18em}
      .${K}entries{display:grid;gap:6px}
      .${K}wrap button{font:inherit;color:inherit;background:transparent;border:1.5px solid rgba(234,242,255,.7);padding:7px 10px;min-height:42px;cursor:pointer;text-align:left;font-size:15px;transition:background .12s}
      .${K}wrap button:hover:not([disabled]){background:rgba(234,242,255,.1)}
      .${K}wrap button:focus-visible{outline:3px solid ${P.pencil};outline-offset:2px}
      .${K}entries button{color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .${K}entries button[aria-pressed=true]{background:rgba(240,223,166,.16);border-color:${P.pencil};box-shadow:inset 4px 0 0 ${P.pencil}}
      .${K}entries button.used.ok{color:${P.line}}
      .${K}entries button .st{font-family:'Courier Prime',monospace;font-size:14px}
      .${K}rule{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
      .${K}rule button[aria-pressed=true]{background:${P.line};color:${P.deep};font-weight:700}
      .${K}acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .${K}acts button.go{background:${P.line};color:${P.deep};font-weight:700}
      .${K}acts button[disabled]{opacity:.35;cursor:not-allowed}
      .${K}acts button[hidden]{display:none}
      .${K}say{font-size:15px;min-height:2.8em;line-height:1.45;margin-top:8px;border-top:1px dashed rgba(234,242,255,.4);padding-top:8px}
      .${K}say.flash{animation:${K}flash .6s}
      @keyframes ${K}flash{0%{background:rgba(240,223,166,.25)}100%{background:transparent}}
      .${K}margin{margin:10px 0 0;font-size:14px;color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace;line-height:1.45}
      .${K}margin p{margin:0 0 6px}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,46,85,.92);z-index:5;padding:16px;overflow:auto}
      .${K}sheet{width:min(560px,100%);box-sizing:border-box;border:2px solid ${P.line};background:${P.blue};background-image:linear-gradient(${P.faint} 1px,transparent 1px),linear-gradient(90deg,${P.faint} 1px,transparent 1px);background-size:20px 20px;padding:18px 20px 0;position:relative}
      .${K}sheet h2{margin:0 0 6px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(28px,7vw,36px);letter-spacing:.08em;line-height:1}
      .${K}goal{margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 10px;font-size:14px;line-height:1.45;color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace}
      .${K}key{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 12px;font-size:14px;line-height:1.3}
      .${K}key dt{font-weight:700;white-space:nowrap}
      .${K}key dd{margin:0}
      .${K}tblock{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid ${P.line};margin:14px -20px 0;font-size:12px;letter-spacing:.1em}
      .${K}tblock div{padding:6px 8px;border-right:1px solid ${P.line}}
      .${K}tblock div:last-child{border-right:0}
      .${K}tblock b{display:block;font-size:13px;letter-spacing:.04em}
      .${K}entries button img,.${K}notes button img{width:38px;height:38px;flex:none;margin:-4px 0}
      .${K}entries button{align-items:center}
      .${K}entries button .nm{flex:1 1 auto}
      .${K}notes button{display:flex;gap:8px;align-items:center}
      .${K}sheetart{display:block;width:100%;height:auto;aspect-ratio:1200/800;margin:0 0 10px;border:1px solid ${P.line}}
      .${K}lace{display:flex;align-items:center;gap:0;overflow-x:auto;padding:10px 2px 6px;margin:6px 0;background:linear-gradient(${P.pencil},${P.pencil}) left 50%/100% 2px no-repeat}
      .${K}wrap .${K}lace button{flex:none;width:21px;min-height:40px;height:40px;padding:0;border:0;background:radial-gradient(circle at 50% 50%,${P.pencil} 0 4.5px,transparent 5.5px);cursor:pointer}
      .${K}wrap .${K}lace button.dbl{background:radial-gradient(circle at 50% 36%,${P.pencil} 0 4.5px,transparent 5.5px),radial-gradient(circle at 50% 64%,${P.pencil} 0 4.5px,transparent 5.5px)}
      .${K}wrap .${K}lace button[aria-pressed=true]{outline:2px solid ${P.line};outline-offset:-2px;background-color:rgba(234,242,255,.14)}
      .${K}new{border-left:4px solid ${P.red};padding-left:8px;margin:0 0 10px;font-size:14px;line-height:1.4}
      .${K}marks{display:grid;gap:6px}
      .${K}marks button{color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace;display:block;width:100%}
      .${K}marks button[aria-pressed=true]{background:rgba(240,223,166,.16);border-color:${P.pencil};box-shadow:inset 4px 0 0 ${P.pencil}}
      .${K}marks button.ok{color:${P.line};border-style:solid}
      .${K}marks button small{display:block;font-family:'Courier Prime',monospace;font-size:13px;color:${P.line}}
      @media (max-width:720px){.${K}cols{grid-template-columns:1fr}.${K}planbox{position:sticky;top:0;z-index:2;background:${P.deep}}}
    </style>`;
    if (twist) return runTwist(STYLE);
    wrap.innerHTML = STYLE + `
    <div class="${K}page">
      <div class="${K}planbox"><svg class="${K}plan" viewBox="0 0 ${X0 * 2 + MAXSQ * SQ} 230" role="img" aria-label="The ground floor plan, drawn from memory"></svg></div>
      <div class="${K}cols">
        <div class="${K}box"><h4>REMEMBERED PACES · IN PENCIL</h4><div class="${K}entries"></div>
          <div class="${K}margin"><p>cold here — behind the cold store, through the drains</p></div>
          <div class="${K}acts ${K}notes"></div>
          ${stage === 2 ? `<div class="${K}acts"><button type="button" data-rub>Rub the selected room · 3</button></div>` : ""}</div>
        <div class="${K}box"><h4>CONVERT · SLIDE RULE</h4>
          <div style="font-size:14px">paces × that day's stride ÷ 75 = squares</div>
          <div class="${K}rule" role="group" aria-label="Stride by day, from the Chart"></div>
          <div class="${K}acts"><button type="button" data-conv>Convert selected (C)</button><button type="button" data-raw>Back to raw</button></div>
          <div class="${K}acts"><button type="button" class="go" data-close>Close the plan (Enter)</button><button type="button" class="go" data-void hidden>Place the void stamp</button></div>
          <div class="${K}say" aria-live="polite"></div>
        </div>
      </div>
      ${stage === 2 ? `<div class="${K}box"><h4>JAX'S BOOTLACE · THE NORTH FENCE · KNOTS TO POSTS</h4>
        <div style="font-size:14px;line-height:1.4">He counted the posts from the gate on a bootlace: a knot a post, and a double knot where the wire is loose. In pencil beside it: <span style="color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace">post to post, ${LACE.paces} of my paces, shovelling, day ${LACE.day}</span>. Tap the knot, set that day's stride on the slide rule, and mark the gap in metres from the gate.</div>
        <div class="${K}lace" role="group" aria-label="The knotted bootlace, gate end first"></div>
        <div class="${K}acts"><button type="button" class="go" data-gap>Mark the gap</button><span class="${K}gapsay" style="font-size:15px;align-self:center" aria-live="polite"></span></div></div>` : ""}
    </div>
    <div class="${K}intro"><div class="${K}sheet">
      <h2>FLOOR PLAN</h2>
      <img class="${K}sheetart" alt="" hidden>
      ${stage === 1 ? `<p class="${K}goal">Draw three rooms from memory and make the plan close against the hall.</p>
      <p class="${K}beat">Day 2, the rec room table, after duty. On day 1 you walked the west hall end to end: 88 paces. Three rooms open off it. Draw them and see if they fit.</p>`
      : `<p class="${K}goal">Find where the halls do not close, and stamp the void there.</p>
      <p class="${K}beat">Day 4, the rec room table, after duty. On day 3 you paced the outside wall: 120 paces. Now draw the inside from memory and see if it fits.</p>
      <p class="${K}new"><b>New today.</b> Three pencil rubs raise whatever older plan lies under a room you have drawn. And Jax has left his bootlace on the table, knotted.</p>`}
      <dl class="${K}key">
        <dt>DRAW</dt><dd>click a pencilled entry to draw that room at its remembered paces</dd>
        <dt>CLOSE</dt><dd>measure the drawn rooms against the outside wall</dd>
      </dl>
      <p style="margin:0 0 12px;font-size:14px">One square is 75 cm, your stride on day 1. The slide rule comes when you need it.</p>
      <button type="button" data-start>Unroll the paper</button>
      <div class="${K}tblock"><div>SHEET<b>G-${stage}</b></div><div>SCALE<b>1 SQ = 75 CM</b></div><div>DRAWN<b>FISK, FROM MEMORY</b></div></div>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const plan = $("plan"), entries = $("entries"), ruleEl = $("rule"), sayEl = $("say"), intro = $("intro"), notesEl = $("notes"), marginEl = $("margin");
    const convBtn = wrap.querySelector("[data-conv]"), rawBtn = wrap.querySelector("[data-raw]"), closeBtn = wrap.querySelector("[data-close]"), voidBtn = wrap.querySelector("[data-void]");
    const ruleBox = ruleEl.parentElement;

    const kit = artKit(api);
    const stamp = {};
    for (const id of [...ROOMS.map((r) => r.art), "room-void", "room-boiler-room", "room-sams-office"]) kit.png(id, 76).then((u) => { if (u) { stamp[id] = u; if (ready) { render(); renderNotes(); } } });
    let ready = false;
    kit.dressIntro(intro, intro.querySelector("." + K + "sheet"), stage === 1 ? "chapter-3" : "chapter-5", "rgba(20,46,85,.72)");
    lad.picker(intro.querySelector("." + K + "sheet"), intro.querySelector("[data-start]"), stage, go, P.line, P.deep);
    kit.sock(root);
    kit.fill(wrap, "." + K + "sheetart", "plan-sheet", 520);
    const drawn = {};
    const wall = { len: WALL.paces, conv: null };
    let selected = null, stride = 1, closed = false, voidAt = null, tries = 0, over = false, closes = 0, ruleOpen = false, notesOpen = false, lastGap = null;
    const notesRead = {};
    const say = (m) => { sayEl.textContent = m; if (!reduce) { sayEl.classList.remove("flash"); void sayEl.offsetWidth; sayEl.classList.add("flash"); } };
    const order = () => ROOMS.filter((r) => drawn[r.id]);
    const totalDrawn = () => order().reduce((a, r) => a + drawn[r.id].len, 0);
    const rightConv = (r, d) => d.conv === r.day || (r.day === 1 && d.conv == null);
    let rubs = 3, knot = 0, gapAt = null;
    const rubBtn = wrap.querySelector("[data-rub]"), laceEl = $("lace"), gapSay = $("gapsay");

    function renderEntries() {
      entries.innerHTML = [...ROOMS, WALL].map((r) => {
        const isWall = r.id === "wall";
        const d = isWall ? wall : drawn[r.id];
        const state = d ? (d.conv ? `→ ${d.len.toFixed(1)} sq (D${d.conv} stride)` : `→ ${d.len} sq, raw`) : isWall ? "" : "not drawn";
        return `<button type="button" data-id="${r.id}" class="${d ? "used" : ""}${d && d.conv ? " ok" : ""}" aria-pressed="${selected === r.id}">${r.art && stamp[r.art] ? `<img alt="" src="${stamp[r.art]}">` : ""}<span class="nm">${r.name.toLowerCase()}: ${r.paces - 1} to ${r.paces + 1}</span><span class="st">paced day ${r.day} ${state}</span></button>`;
      }).join("");
      entries.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => pick(b.dataset.id)));
    }
    function renderRule() {
      ruleBox.style.opacity = ruleOpen ? "1" : ".45";
      convBtn.disabled = rawBtn.disabled = !ruleOpen;
      ruleEl.innerHTML = [1, 2, 3, 4].map((d) => `<button type="button" data-d="${d}" aria-pressed="${stride === d}" ${ruleOpen ? "" : "disabled"}>D${d} · ${STRIDE[d]} cm</button>`).join("");
      ruleEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { stride = +b.dataset.d; renderRule(); ruleEl.querySelector('[aria-pressed="true"]').focus(); }));
    }
    function renderNotes() {
      notesEl.innerHTML = notesOpen ? Object.entries(NOTES).map(([k, n]) => `<button type="button" data-note="${k}" ${notesRead[k] ? "disabled" : ""}>${stamp[n.art] ? `<img alt="" src="${stamp[n.art]}">` : ""}${n.label}${notesRead[k] ? " ✓" : ""}</button>`).join("") : "";
      notesEl.querySelectorAll("[data-note]").forEach((b) => b.addEventListener("click", () => readNote(b.dataset.note)));
      marginEl.innerHTML = `<p>cold here — behind the cold store, through the drains</p>` + Object.keys(notesRead).map((k) => `<p>· ${NOTES[k].text}</p>`).join("");
    }
    function renderPlan() {
      const X = (sq) => X0 + sq * SQ;
      const F = "font-family=\"Courier Prime,monospace\"";
      let s = `<defs><pattern id="${K}g" width="${SQ}" height="${SQ}" patternUnits="userSpaceOnUse" x="${X0}" y="0"><path d="M${SQ} 0H0V${SQ}" fill="none" stroke="${P.faint}" stroke-width=".6"/></pattern>
        <pattern id="${K}h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${P.line}" stroke-width="1.4" opacity=".6"/></pattern>
        <filter id="${K}w"><feTurbulence baseFrequency=".9" numOctaves="1" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter></defs>
        <rect x="${X0}" y="44" width="${MAXSQ * SQ}" height="136" fill="url(#${K}g)"/>`;
      for (let q = 0; q <= MAXSQ; q += 10) s += `<line x1="${X(q)}" x2="${X(q)}" y1="44" y2="180" stroke="${P.line}" stroke-opacity="${q % 50 === 0 ? 0.35 : 0.16}"/>${q % 50 === 0 ? `<text x="${X(q)}" y="194" fill="${P.line}" font-size="13" text-anchor="middle" ${F} opacity=".7">${q}</text>` : ""}`;
      const wx = X(wall.len);
      s += `<line x1="${X(0)}" x2="${wx}" y1="28" y2="28" stroke="${P.line}" stroke-width="2"/><line x1="${X(0)}" x2="${X(0)}" y1="20" y2="36" stroke="${P.line}" stroke-width="2"/><line x1="${wx}" x2="${wx}" y1="20" y2="36" stroke="${P.line}" stroke-width="2"/>
        <text x="${Math.min((X(0) + wx) / 2, X(MAXSQ) - 260)}" y="18" fill="${P.line}" font-size="15" text-anchor="middle" ${F}>${WALL.name}: ${WALL.paces} PACES, DAY ${WALL.day}${wall.conv ? ` = ${wall.len.toFixed(1)} SQ` : " (RAW)"}</text>`;
      let at = 0;
      for (const r of order()) {
        const d = drawn[r.id];
        const sel = selected === r.id;
        const ink = d.conv != null || r.day === 1;
        s += `<g data-room="${r.id}" style="cursor:pointer"><rect x="${X(at)}" y="76" width="${d.len * SQ}" height="84" fill="${sel ? "rgba(240,223,166,.14)" : "transparent"}" stroke="${sel ? P.pencil : ink ? P.line : P.pencil}" stroke-width="${sel ? 3.2 : 2.4}" ${ink ? `filter="url(#${K}w)"` : `stroke-dasharray="7 4"`}/>
          ${stamp[r.art] ? `<image href="${stamp[r.art]}" x="${X(at + d.len / 2) - 23}" y="79" width="46" height="46" opacity="${ink ? 1 : 0.7}"/>` : ""}
          <text x="${X(at + d.len / 2)}" y="${stamp[r.art] ? 139 : 114}" fill="${P.line}" font-size="${d.len < 18 ? 12 : stamp[r.art] ? 13 : 15}" text-anchor="middle" ${F}>${d.len < 15 ? r.name.split(" ")[0] : r.name}</text>
          <text x="${X(at + d.len / 2)}" y="${stamp[r.art] ? 154 : 134}" fill="${d.conv ? P.line : P.pencil}" font-size="13" text-anchor="middle" ${F}>${d.conv ? d.len.toFixed(1) : d.len + " raw"}</text>
          ${d.ghost ? `<rect x="${X(at) + 5}" y="81" width="${Math.max(4, d.len * SQ - 10)}" height="74" fill="none" stroke="${P.pencil}" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="2 4"/>${GHOST[r.id] ? (r.id === "bunk" ? Array.from({ length: 4 }, (_, i) => `<rect x="${X(at + (d.len * (i + 0.5)) / 4) - 4}" y="157" width="8" height="5" fill="${P.pencil}" opacity=".85"/>`).join("") : `<path d="M${X(at + d.len) - 26} 84h20M${X(at + d.len) - 26} 90h20M${X(at + d.len) - 26} 96h20M${X(at + d.len) - 26} 102h20" stroke="${P.pencil}" stroke-width="1.4" opacity=".85"/>`) : ""}` : ""}</g>`;
        at += d.len;
      }
      if (at > 0) s += `<line x1="${X(0)}" x2="${X(at)}" y1="168" y2="168" stroke="${P.line}" stroke-width="2"/>`;
      if (closed) {
        const gap = wall.len - at;
        if (Math.abs(gap) >= 3) {
          s += `<rect x="${X(Math.min(at, wall.len))}" y="76" width="${Math.abs(gap) * SQ}" height="84" fill="url(#${K}h)" stroke="${P.line}" stroke-dasharray="5 4"/>
            <text x="${X(Math.min(at, wall.len) + Math.abs(gap) / 2)}" y="68" fill="${P.pencil}" font-size="15" font-weight="700" text-anchor="middle" ${F}>${gap.toFixed(1)} SQ ?</text>`;
        } else s += `<text x="${X(at)}" y="68" fill="${P.line}" font-size="15" text-anchor="end" ${F}>CLOSES ✓</text>`;
      }
      if (losses >= 2 && closed) s += `<text x="${X(TRUE_END) + 4}" y="176" fill="${P.red}" font-size="13" ${F}>↑ cold here</text>`;
      if (voidAt != null) {
        s += (stamp["room-void"] ? `<g transform="translate(${X(voidAt)},118)"><image href="${stamp["room-void"]}" x="-36" y="-36" width="72" height="72" transform="rotate(-6)"/><rect x="-37" y="-37" width="74" height="74" fill="none" stroke="${P.red}" stroke-width="2.5" transform="rotate(-6)"/></g>` : `<g transform="translate(${X(voidAt)},118)"><rect x="-30" y="-16" width="60" height="32" fill="${P.deep}" stroke="${P.red}" stroke-width="3" transform="rotate(-8)"/><text y="6" fill="${P.red}" font-size="16" font-weight="700" text-anchor="middle" ${F} transform="rotate(-8)">VOID</text></g>`) + `
          <line x1="${X(voidAt)}" x2="${X(voidAt)}" y1="160" y2="176" stroke="${P.red}" stroke-width="2"/><text x="${X(voidAt)}" y="214" fill="${P.red}" font-size="13" text-anchor="middle" ${F}>sq ${voidAt}</text>`;
      }
      s += `<g transform="translate(${X0 + MAXSQ * SQ - 26},212)"><path d="M0-14L4 0L0 14L-4 0Z" fill="${P.line}"/><text y="-17" fill="${P.line}" font-size="12" text-anchor="middle" ${F}>N</text></g>
        <g transform="translate(${X0},206)"><rect width="${10 * SQ}" height="5" fill="${P.line}"/><rect x="${10 * SQ}" width="${10 * SQ}" height="5" fill="none" stroke="${P.line}"/><text x="${20 * SQ + 8}" y="7" fill="${P.line}" font-size="13" ${F}>20 SQ = 15 M</text></g>
        <text x="${X0 + 280}" y="222" fill="${P.line}" font-size="13" ${F}>FLOOR PLAN / GROUND / DRAWN FROM MEMORY / WEST ← → EAST</text>`;
      plan.innerHTML = s;
      plan.querySelectorAll("[data-room]").forEach((g) => g.addEventListener("click", () => pick(g.dataset.room)));
    }
    const render = () => { renderEntries(); renderPlan(); };

    function openRule(line) {
      if (ruleOpen) return;
      ruleOpen = true; renderRule();
      if (!reduce) ruleBox.animate?.([{ boxShadow: `0 0 0 4px ${P.pencil}` }, { boxShadow: "0 0 0 0 transparent" }], { duration: 1200 });
      say(line);
    }
    function pick(id) {
      if (over) return;
      if (id !== "wall" && !drawn[id]) {
        const r = ROOMS.find((x) => x.id === id);
        drawn[id] = { len: r.paces, conv: null };
        closed = false; voidBtn.hidden = true; voidAt = null;
        selected = id; render();
        if (r.day > 1 && !ruleOpen) return openRule(`The ${r.name.toLowerCase()} was paced on day ${r.day}. You were taller on day ${r.day}, and your stride was longer. NEW · The slide rule: select a room, set the stride of the day it was paced, Convert.`);
        return say(r.day === 1 ? `The bunk hall: ${r.paces} paces, walked on day 1, before anything changed. Drawn at ${r.paces} squares.` : `${r.name.toLowerCase()} drawn at ${r.paces} squares, as paced on day ${r.day}.`);
      }
      selected = id; render();
      say(`Selected: ${(id === "wall" ? WALL : ROOMS.find((x) => x.id === id)).name.toLowerCase()}. ${ruleOpen ? "Set the stride for the day it was paced, then Convert." : ""}`);
    }
    function convert(raw) {
      if (over || !ruleOpen) return;
      if (!selected) return say("Select a room or the outside wall first.");
      const r = selected === "wall" ? WALL : ROOMS.find((x) => x.id === selected);
      const d = selected === "wall" ? wall : drawn[selected];
      if (raw) { d.len = r.paces; d.conv = null; say(`${r.name.toLowerCase()} back to ${r.paces} raw paces.`); }
      else {
        d.len = Math.round(((r.paces * STRIDE[stride]) / 75) * 10) / 10; d.conv = stride;
        say(`${r.paces} × ${STRIDE[stride]} ÷ 75 = ${d.len.toFixed(1)} squares.${stride !== r.day ? ` That was not your stride on day ${r.day}.` : ""}`);
      }
      closed = false; voidAt = null; voidBtn.hidden = true;
      render();
    }
    function closePlan() {
      if (over) return;
      if (order().length < ROOMS.length) return say(`Draw every room first: ${ROOMS.length - order().length} still to draw.`);
      closed = true; closes++;
      const gap = wall.len - totalDrawn();
      voidAt = null;
      const allRight = ROOMS.every((r) => rightConv(r, drawn[r.id])) && rightConv(WALL, wall);
      if (stage === 1) {
        render();
        if (Math.abs(gap) < 3 && allRight) {
          over = true; api.store.set("losses", 0);
          return lad.conclude(wrap, kit, stage, { card: "plan-sheet", caption: "SHEET G-1 · THE PLAN CLOSES" }, { outcome: "win", text: `The plan closes: ${totalDrawn().toFixed(1)} squares of rooms against ${wall.len.toFixed(1)} of hall. Two of the three were paced a day later, by a man with a longer stride, and had to be made day-1 squares before anything fitted. The building did not change. You did.` }, go);
        }
        if (!ruleOpen) openRule("NEW · The slide rule: select a room, set the stride of the day it was paced, Convert.");
        return say(Math.abs(gap) < 3 ? "It closes, but a length on it was converted at the wrong day's stride. Check each room against the day it was paced." : `The plan does not close: ${totalDrawn().toFixed(1)} squares of rooms against ${wall.len.toFixed(1)} of hall. The hall was walked on day 1. Two of these rooms were paced on day 2, when your stride was 81 cm, not 75.`);
      }
      if (!notesOpen) { notesOpen = true; renderNotes(); }
      if (Math.abs(gap) < 3) say(`The plan closes: ${totalDrawn().toFixed(1)} of ${wall.len.toFixed(1)} squares.`);
      else if (!allRight) {
        say(`The plan does not close: ${totalDrawn().toFixed(1)} squares of rooms against ${wall.len.toFixed(1)}, a gap of ${gap.toFixed(1)}. But you were growing while you paced it, and some of these were never converted. A gap can be the stride's and not the building's.`);
        if (!ruleOpen) openRule("NEW · The slide rule: convert each length at the stride of the day you paced it, the wall too.");
      } else say(`Converted, every length at its own day's stride, it still does not close. ${gap.toFixed(1)} squares of the base that no hall reaches, east of the cold store. Tap the plan to set the void stamp, or use the button, then place it.`);
      lastGap = gap;
      voidBtn.hidden = false;
      render();
    }
    function readNote(k) {
      if (notesRead[k] || over) return;
      notesRead[k] = true; renderNotes();
      say(NOTES[k].text);
    }
    const onPlanTap = (e) => {
      if (!closed || over || e.target.closest("[data-room]")) return;
      const pt = plan.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const m = plan.getScreenCTM(); if (!m) return;
      const loc = pt.matrixTransform(m.inverse());
      voidAt = Math.max(0, Math.min(MAXSQ, Math.round((loc.x - X0) / SQ)));
      say(`Void stamp at square ${voidAt}. ← → nudge it. Place it when you are sure.`);
      renderPlan();
    };
    plan.addEventListener("click", onPlanTap);
    const onKey = (e) => {
      if (over || intro.isConnected) return;
      if (closed && voidAt != null && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { voidAt = Math.max(0, Math.min(MAXSQ, voidAt + (e.key === "ArrowRight" ? 1 : -1))); renderPlan(); say(`Void stamp at square ${voidAt}.`); e.preventDefault(); return; }
      if ((e.key === "c" || e.key === "C") && ruleOpen) { convert(false); e.preventDefault(); }
      if (/^[1-4]$/.test(e.key) && ruleOpen) { stride = +e.key; renderRule(); e.preventDefault(); }
      if (e.key === "Enter" && document.activeElement === document.body) { closePlan(); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    function placeVoid() {
      if (over) return;
      if (voidAt == null) {
        voidAt = Math.round((totalDrawn() + wall.len) / 2);
        say(`Void stamp at square ${voidAt}. ← → nudge it; press Place again to commit.`);
        return renderPlan();
      }
      const off = Math.abs(voidAt - TRUE_VOID);
      if (off <= 2) {
        over = true;
        api.store.set("losses", 0); sh.set("fp_void", true);
        const notes = Object.keys(notesRead).length;
        return lad.conclude(wrap, kit, stage, { card: "plan-sheet", stamp: "room-void", caption: "SHEET G-2 · VOID LOCATED" }, { outcome: "win", text: `The void is behind the cold store: about ${(conv(WALL) - TRUE_END).toFixed(0)} squares of the base that no hall reaches, and the cold comes up from it. Void located${notes ? ", and the drains and the file agree with the paper" : ""}. The halls never measured what they should; you did.${gapAt ? ` And the gap in the north fence is marked: ${gapAt.toFixed(1)} m from the gate.` : ""}${rubs < 3 ? " The older lines stay where the pencil raised them." : ""}` }, go);
      }
      tries++;
      if (tries < 2) {
        const unconverted = order().some((r) => !rightConv(r, drawn[r.id])) || !rightConv(WALL, wall);
        say(`Off by about ${off.toFixed(0)} squares. ${unconverted ? "Something on the plan was paced on a later day and never converted at that day's stride." : "Look again at where the drawn rooms end and the wall goes on."} One retry.`);
        voidAt = null; return renderPlan();
      }
      over = true;
      api.store.set("losses", losses + 1);
      lad.conclude(wrap, kit, stage, { card: "plan-sheet", stamp: "stamp-hold", caption: "SHEET G-2 · SAVED AS IT STANDS" }, { outcome: "lose", text: `The void stamp is ${off.toFixed(0)} squares out. The plan is saved as it stands, and on night 6 the stair is not where you look. A changed Fisk takes longer strides; the gap you drew was not the gap that is there.` }, go);
    }
    // ghost lines (test): three rubs raise the older plan under a drawn room
    function rub() {
      if (over) return;
      if (!selected || selected === "wall" || !drawn[selected]) return say("Select a room you have drawn, then rub it with the side of the pencil.");
      if (drawn[selected].ghost) return say("You have rubbed that one already.");
      if (rubs <= 0) return say("The pencil is down to the wood. Three rubs is all it had.");
      rubs--; drawn[selected].ghost = true;
      rubBtn.textContent = `Rub the selected room · ${rubs}`; if (!rubs) rubBtn.disabled = true;
      const r = ROOMS.find((x) => x.id === selected);
      const line = GHOST[selected] || `Under the ${r.name.toLowerCase()}, nothing but an older grid. Whoever drew this base first drew this room the same.`;
      if (GHOST[selected]) { const p = document.createElement("p"); p.textContent = "· " + line; marginEl.appendChild(p); ghostNotes.push(line); }
      say(line); renderPlan();
    }
    const ghostNotes = [];
    if (rubBtn) rubBtn.addEventListener("click", rub);
    // knots to posts (test): the bootlace, converted, marks the gap in the fence
    if (laceEl) {
      for (let i = 1; i <= LACE.knots; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.dataset.knot = i; b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", `Knot ${i}${i === LACE.gap ? ", a double knot" : ""}`);
        if (i === LACE.gap) b.className = "dbl";
        b.addEventListener("click", () => { knot = i; laceEl.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); gapSay.textContent = `Knot ${i}: post ${i} from the gate, ${i - 1} gaps along.`; });
        laceEl.appendChild(b);
      }
      wrap.querySelector("[data-gap]").addEventListener("click", () => {
        if (over) return;
        if (!knot) { gapSay.textContent = "Tap the knot that marks the loose wire first."; return; }
        if (!ruleOpen) { ruleOpen = true; renderRule(); }
        const m = ((knot - 1) * LACE.paces * STRIDE[stride]) / 100;
        if (knot === LACE.gap && stride === LACE.day) {
          gapAt = m; sh.set("fp_gap", m);
          gapSay.textContent = `${knot - 1} gaps × ${LACE.paces} paces × ${STRIDE[stride]} cm = ${m.toFixed(1)} m from the gate. Marked on the sheet's north edge.`;
          const p = document.createElement("p"); p.textContent = `· north fence: loose wire ${m.toFixed(1)} m from the gate (Jax's knots, my day-${LACE.day} paces)`; marginEl.appendChild(p);
        } else gapSay.textContent = `${knot - 1} gaps × ${LACE.paces} paces × ${STRIDE[stride]} cm = ${m.toFixed(1)} m. ${knot !== LACE.gap ? "That knot is a single one: a post, not the gap." : `Those were day-${LACE.day} paces, and the slide rule is set to day ${stride}.`} Not marked.`;
      });
    }
    convBtn.addEventListener("click", () => convert(false));
    rawBtn.addEventListener("click", () => convert(true));
    closeBtn.addEventListener("click", closePlan);
    voidBtn.addEventListener("click", placeVoid);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); say("Start with the bunk hall: click its pencilled entry."); entries.querySelector("button")?.focus(); };
    startBtn.addEventListener("click", start);
    renderRule(); renderNotes(); render(); ready = true;
    const t0 = setTimeout(() => startBtn.focus(), 30);

    return {
      unmount() {
        over = true; clearTimeout(t0);
        window.removeEventListener("keydown", onKey);
        plan.removeEventListener("click", onPlanTap);
        kit.dispose();
        wrap.remove();
      },
    };

    // ---- the twist: the sheet turned, the hall in elevation
    function runTwist(STYLE) {
      const PX = 62, FLOOR = 320, VW = 980, CEIL = 4.57;
      const Y = (m) => FLOOR - m * PX;
      wrap.innerHTML = STYLE + `
      <div class="${K}page">
        <div class="${K}planbox"><svg class="${K}plan" viewBox="0 0 ${VW} 372" role="img" aria-label="The bunk hall in elevation, floor to a ceiling at 4.57 metres"></svg></div>
        <div class="${K}cols">
          <div class="${K}box"><h4>NOTED AGAINST MY OWN HEAD · IN PENCIL</h4><div class="${K}marks"></div></div>
          <div class="${K}box"><h4>MY HEIGHT THAT DAY · FROM THE CHART</h4>
            <div style="font-size:14px">height that day + the note = the mark, from the floor</div>
            <div class="${K}rule" role="group" aria-label="Fisk's height by day"></div>
            <div class="${K}acts"><button type="button" class="go" data-ink>Ink the mark (Enter)</button></div>
            <div class="${K}say" aria-live="polite"></div>
          </div>
        </div>
      </div>
      <div class="${K}intro"><div class="${K}sheet">
        <h2>FLOOR PLAN</h2>
        <p class="${K}goal">Turn the sheet on its side and draw the hall in elevation: four marks, each at its height from the floor.</p>
        <p class="${K}beat">Day 6. Every hall is 4.57 m high, and nobody has said why. You never had a tape. You had your own head, and it was not in the same place two days running.</p>
        <p class="${K}new"><b>Turned over.</b> On the plan you corrected your stride for the day and the building stayed still. The sheet is ruled for the man who arrived, 178 cm, and for heights that is the wrong man: each note was made against your head on the day you made it.</p>
        <dl class="${K}key">
          <dt>MARK</dt><dd>pick a pencilled note, then the day it was made</dd>
          <dt>INK</dt><dd>commit the mark at that height. Three wrong lines and the strip is saved as it stands</dd>
        </dl>
        <button type="button" data-start>Turn the sheet</button>
        <div class="${K}tblock"><div>SHEET<b>G-3</b></div><div>SCALE<b>1 SQ = 75 CM</b></div><div>DRAWN<b>FISK, FROM MEMORY</b></div></div>
      </div></div>`;
      root.appendChild(wrap);
      const $ = (c) => wrap.querySelector("." + K + c);
      const plan = $("plan"), marksEl = $("marks"), ruleEl = $("rule"), sayEl = $("say"), intro = $("intro"), inkBtn = wrap.querySelector("[data-ink]");
      const kit = artKit(api);
      kit.dressIntro(intro, intro.querySelector("." + K + "sheet"), "chapter-7", "rgba(20,46,85,.72)");
      lad.picker(intro.querySelector("." + K + "sheet"), intro.querySelector("[data-start]"), stage, go, P.line, P.deep);
      kit.sock(root);
      const losses = api.store.get("losses", 0);
      const state = {}; // mark id -> { day, inked }
      let sel = MARKS[0].id, wrong = 0, over = false, done = false;
      const say = (m) => { sayEl.textContent = m; if (!reduce) { sayEl.classList.remove("flash"); void sayEl.offsetWidth; sayEl.classList.add("flash"); } };
      const at = (mk) => (mk.taped ? (state[mk.id]?.day ? mk.m : null) : state[mk.id]?.day ? (TALL[state[mk.id].day] + mk.off) / 100 : null);
      const F = "font-family=\"Courier Prime,monospace\"";
      function renderPlan() {
        let s = `<rect x="0" y="0" width="${VW}" height="372" fill="rgba(20,46,85,.45)"/>`;
        for (let m = 0; m <= 4.5; m += 0.5) s += `<line x1="64" x2="${VW - 20}" y1="${Y(m)}" y2="${Y(m)}" stroke="${P.line}" stroke-opacity="${m % 1 === 0 ? 0.3 : 0.14}"/><text x="56" y="${Y(m) + 4}" fill="${P.line}" font-size="12" text-anchor="end" opacity=".8" ${F}>${m.toFixed(1)}</text>`;
        s += `<line x1="64" x2="${VW - 20}" y1="${FLOOR}" y2="${FLOOR}" stroke="${P.line}" stroke-width="3"/><line x1="64" x2="${VW - 20}" y1="${Y(CEIL)}" y2="${Y(CEIL)}" stroke="${P.line}" stroke-width="3"/>
          <text x="${VW - 24}" y="${Y(CEIL) - 6}" fill="${P.line}" font-size="13" text-anchor="end" ${F}>CEILING 4.57 M</text>
          <rect x="120" y="${Y(4.2)}" width="${1.1 * PX}" height="${4.2 * PX}" fill="none" stroke="${P.line}" stroke-width="2"/><circle cx="${120 + 1.1 * PX - 9}" cy="${Y(1.1)}" r="4" fill="none" stroke="${P.line}" stroke-width="1.6"/><text x="${120 + 0.55 * PX}" y="${FLOOR + 18}" fill="${P.line}" font-size="12" text-anchor="middle" opacity=".8" ${F}>DOOR · knob 1.1</text>
          <line x1="250" x2="270" y1="${Y(1.78)}" y2="${Y(1.78)}" stroke="${P.pencil}" stroke-width="2"/><text x="276" y="${Y(1.78) + 4}" fill="${P.pencil}" font-size="12" ${F}>my head, day 1 · 178</text>
          <line x1="250" x2="270" y1="${Y(2.85)}" y2="${Y(2.85)}" stroke="${P.pencil}" stroke-width="2"/><text x="276" y="${Y(2.85) + 4}" fill="${P.pencil}" font-size="12" ${F}>my head, today · 285</text>`;
        const XS = { lever: [120, 120 + 1.1 * PX], pipes: [330, VW - 30], windows: [600, 720], claws: [420, 510] };
        for (const mk of MARKS) {
          const h = at(mk), st = state[mk.id] || {};
          if (h == null) continue;
          const [x0, x1] = XS[mk.id], y = Y(h), ink = st.inked, c = ink ? P.line : P.pencil;
          if (mk.id === "lever") s += `<rect x="${x1 - 22}" y="${y - 3}" width="18" height="6" fill="${c}"/>`;
          if (mk.id === "pipes") s += `<rect x="${x0}" y="${y - 4}" width="${x1 - x0}" height="7" fill="${c}" opacity="${ink ? 0.95 : 0.6}"/>`;
          if (mk.id === "windows") s += `<rect x="${x0}" y="${y - 0.65 * PX}" width="${x1 - x0}" height="${0.65 * PX}" fill="none" stroke="${c}" stroke-width="2"/><line x1="${(x0 + x1) / 2}" x2="${(x0 + x1) / 2}" y1="${y - 0.65 * PX}" y2="${y}" stroke="${c}"/>`;
          if (mk.id === "claws") for (let i = 0; i < 4; i++) s += `<line x1="${x0 + 14 + i * 12}" x2="${x0 + 4 + i * 12}" y1="${y}" y2="${y + 44}" stroke="${c}" stroke-width="2.2"/>`;
          s += `<line x1="64" x2="${VW - 20}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="${ink ? 1.6 : 1.2}" ${ink ? "" : `stroke-dasharray="6 5"`} opacity="${ink ? 0.9 : 0.75}"/>
            <text x="${mk.id === "pipes" ? 800 : mk.id === "claws" ? x0 - 8 : x1 + 8}" y="${mk.id === "claws" ? y - 7 : mk.id === "windows" ? y - 22 : mk.id === "pipes" ? y + 20 : y + 5}" fill="${c}" font-size="14" font-weight="700" ${mk.id === "pipes" || mk.id === "claws" ? `text-anchor="end"` : ""} ${F}>${mk.name} ${h.toFixed(2)} M${ink ? "" : " ?"}</text>`;
        }
        if (done) {
          // the set piece, "The First Chart": the clearance the four marks were drawn round. A dimension, not a figure.
          s += `<rect x="840" y="${Y(3.38)}" width="${0.7 * PX}" height="${3.38 * PX}" fill="rgba(234,242,255,.06)" stroke="${P.red}" stroke-width="2" stroke-dasharray="8 5"/>
            <line x1="${840 + 0.7 * PX + 10}" x2="${840 + 0.7 * PX + 10}" y1="${Y(3.38)}" y2="${FLOOR}" stroke="${P.red}" stroke-width="1.6"/><path d="M${840 + 0.7 * PX + 5} ${Y(3.38)}h10M${840 + 0.7 * PX + 5} ${FLOOR}h10" stroke="${P.red}" stroke-width="1.6"/>
            <text x="832" y="${Y(1.4)}" fill="${P.red}" font-size="14" font-weight="700" text-anchor="end" ${F}>OCCUPANT</text><text x="832" y="${Y(1.4) + 18}" fill="${P.red}" font-size="14" font-weight="700" text-anchor="end" ${F}>338 CM</text>`;
        }
        s += `<text x="68" y="362" fill="${P.line}" font-size="13" ${F}>ELEVATION / BUNK HALL / DRAWN FROM MEMORY / THE SHEET TURNED</text>`;
        plan.innerHTML = s;
      }
      function renderMarks() {
        marksEl.innerHTML = "";
        for (const mk of MARKS) {
          const st = state[mk.id] || {}, h = at(mk);
          const b = document.createElement("button");
          b.type = "button"; b.dataset.mark = mk.id; b.setAttribute("aria-pressed", String(sel === mk.id));
          if (st.inked) b.className = "ok";
          b.innerHTML = `${mk.note}<small>${st.inked ? `inked at ${h.toFixed(2)} m ✓` : h != null ? `pencilled at ${h.toFixed(2)} m` : "not drawn"}</small>`;
          b.addEventListener("click", () => { sel = mk.id; renderMarks(); renderRule(); });
          marksEl.appendChild(b);
        }
      }
      function renderRule() {
        const mk = MARKS.find((m) => m.id === sel), st = state[sel] || {};
        ruleEl.innerHTML = mk.taped ? `<button type="button" data-d="9" aria-pressed="${!!st.day}" ${st.inked ? "disabled" : ""}>As taped · 3.60 m</button>`
          : [1, 2, 3, 4, 5, 6].map((d) => `<button type="button" data-d="${d}" aria-pressed="${st.day === d}" ${st.inked ? "disabled" : ""}>D${d} · ${TALL[d]} cm<br><span style="font-size:12px;opacity:.8">${DUTY[d]}</span></button>`).join("");
        ruleEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
          if (over) return;
          state[sel] = { ...(state[sel] || {}), day: +b.dataset.d };
          renderPlan(); renderMarks(); renderRule();
          const h = at(mk);
          say(mk.taped ? "The one height you took with a tape: 3.60 m." : `${TALL[+b.dataset.d]} ${mk.off < 0 ? "−" : "+"} ${Math.abs(mk.off)} = ${(h * 100).toFixed(0)} cm from the floor. Ink it if that is the day.`);
          ruleEl.querySelector('[aria-pressed="true"]')?.focus();
        }));
        inkBtn.disabled = !!st.inked;
      }
      function ink() {
        if (over || intro.isConnected) return;
        const mk = MARKS.find((m) => m.id === sel), st = state[sel] || {}, h = at(mk);
        if (st.inked) return;
        if (h == null) return say("Pick the day the note was made first.");
        if (Math.abs(h - mk.m) > 0.045) {
          wrong++;
          const max = 3 + (losses >= 2 ? 1 : 0);
          if (wrong >= max) { over = true; api.store.set("losses", losses + 1); return lad.conclude(wrap, kit, stage, { card: "plan-sheet", stamp: "stamp-hold", caption: "SHEET G-3 · SAVED AS IT STANDS" }, { outcome: "lose", text: `Three lines inked where nothing is. The strip is saved as it stands: a hall drawn for the man who arrived, with a lever he could not reach. The heights were taken against a head that kept moving, and you ruled them for one that stood still.` }, go); }
          state[sel] = {}; renderPlan(); renderMarks(); renderRule();
          return say(`At ${h.toFixed(2)} m the line meets nothing you remember. ${st.day === 1 ? "That is the man who arrived. You were not that tall on the day you noted it." : "That was not the day."} ${max - wrong} wrong ${max - wrong === 1 ? "line" : "lines"} left.`);
        }
        state[sel] = { ...st, inked: true };
        if (mk.id === "pipes") sh.set("fp_heights", true);
        const next = MARKS.find((m) => !(state[m.id] || {}).inked);
        say(`${mk.name} inked at ${mk.m.toFixed(1)} m.${mk.id === "pipes" ? " A route above the light, if you can reach it." : ""}`);
        if (next) { sel = next.id; renderPlan(); renderMarks(); renderRule(); return; }
        done = true; over = true; api.store.set("losses", 0);
        renderPlan(); renderMarks(); renderRule();
        try { const box = plan.parentElement; box.scrollLeft = box.scrollWidth; wrap.scrollTop = 0; } catch { /* ok */ }
        say("Lever 2.4. Pipes 2.7. Windows 3.5. Claw marks 3.6. The page draws what the four of them were drawn round.");
        timer = setTimeout(() => lad.conclude(wrap, kit, stage, { card: "elevation-strip", caption: "SHEET G-3 · THE FIRST CHART" }, { outcome: "win", text: "The lever at 2.4 m is at a hand. The pipes at 2.7 m are a rail. The windows at 3.5 m are at the eyes, and the marks at 3.6 m are where hands rest on a wall. The hall was drawn round an occupant 338 cm tall: the last number on the printed target curve. It was the first chart, and it was made before you came. The pipes are on your strip now." }, go), reduce ? 400 : 2400);
      }
      let timer = 0;
      inkBtn.addEventListener("click", ink);
      const onKey = (e) => { if (e.key === "Enter" && !intro.isConnected && (document.activeElement === document.body || ruleEl.contains(document.activeElement))) { ink(); e.preventDefault(); } };
      window.addEventListener("keydown", onKey);
      const startBtn = intro.querySelector("[data-start]");
      startBtn.addEventListener("click", () => { intro.remove(); say("Start with the lever: which day did you stand under it?"); marksEl.querySelector("button")?.focus(); });
      renderPlan(); renderMarks(); renderRule();
      const t0 = setTimeout(() => startBtn.focus(), 30);
      return { unmount() { over = true; clearTimeout(t0); clearTimeout(timer); window.removeEventListener("keydown", onKey); kit.dispose(); wrap.remove(); } };
    }
    }
  },
};

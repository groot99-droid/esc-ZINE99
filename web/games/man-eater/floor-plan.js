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

const P = { blue: "#1c3d6e", deep: "#142e55", line: "#eaf2ff", faint: "rgba(234,242,255,.16)", pencil: "#f0dfa6", red: "#ff9a7a" };
const STRIDE = { 1: 75, 2: 81, 3: 90, 4: 101 }; // cm, the Chart's stride row on days 1 to 4
const ROOMS = [
  { id: "bunk", name: "BUNK HALL", paces: 39, day: 1 },
  { id: "caf", name: "CAFETERIA", paces: 27, day: 2 },
  { id: "rec", name: "REC ROOM", paces: 18, day: 2 },
  { id: "inf", name: "INFIRMARY", paces: 16, day: 3 },
  { id: "cold", name: "COLD STORE", paces: 11, day: 4 },
];
const WALL = { id: "wall", name: "OUTSIDE WALL", paces: 120, day: 3 };
const conv = (r) => (r.paces * STRIDE[r.day]) / 75;
const TRUE_END = ROOMS.reduce((a, r) => a + conv(r), 0);
const TRUE_VOID = (TRUE_END + conv(WALL)) / 2;
const SQ = 6, X0 = 30, MAXSQ = 150;
const NOTES = {
  drains: { label: "Listen at the drains", text: "Cold comes up through the drain at the end of the cold store, colder than the yard. Something under the east end is open to the ground." },
  file: { label: "Recall the file", text: "The project's file names a lower level under the east wing. No stair to it is drawn on any sheet in the file." },
};

export default {
  mount(root, api) {
    const K = "man-eater-floor-plan-";
    const reduce = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
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
      @media (max-width:720px){.${K}cols{grid-template-columns:1fr}.${K}planbox{position:sticky;top:0;z-index:2;background:${P.deep}}}
    </style>
    <div class="${K}page">
      <div class="${K}planbox"><svg class="${K}plan" viewBox="0 0 ${X0 * 2 + MAXSQ * SQ} 230" role="img" aria-label="The ground floor plan, drawn from memory"></svg></div>
      <div class="${K}cols">
        <div class="${K}box"><h4>REMEMBERED PACES · IN PENCIL</h4><div class="${K}entries"></div>
          <div class="${K}margin"><p>cold here — behind the cold store, through the drains</p></div>
          <div class="${K}acts ${K}notes"></div></div>
        <div class="${K}box"><h4>CONVERT · SLIDE RULE</h4>
          <div style="font-size:14px">paces × that day's stride ÷ 75 = squares</div>
          <div class="${K}rule" role="group" aria-label="Stride by day, from the Chart"></div>
          <div class="${K}acts"><button type="button" data-conv>Convert selected (C)</button><button type="button" data-raw>Back to raw</button></div>
          <div class="${K}acts"><button type="button" class="go" data-close>Close the plan (Enter)</button><button type="button" class="go" data-void hidden>Place the void stamp</button></div>
          <div class="${K}say" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <div class="${K}intro"><div class="${K}sheet">
      <h2>FLOOR PLAN</h2>
      <p class="${K}goal">Find where the halls do not close, and stamp the void there.</p>
      <p class="${K}beat">Day 4, the rec room table, after duty. On day 3 you paced the outside wall: 120 paces. Now draw the inside from memory and see if it fits.</p>
      <dl class="${K}key">
        <dt>DRAW</dt><dd>click a pencilled entry to draw that room at its remembered paces</dd>
        <dt>CLOSE</dt><dd>measure the drawn rooms against the outside wall</dd>
      </dl>
      <p style="margin:0 0 12px;font-size:14px">One square is 75 cm, your stride on day 1. The slide rule comes when you need it.</p>
      <button type="button" data-start>Unroll the paper</button>
      <div class="${K}tblock"><div>SHEET<b>G-1</b></div><div>SCALE<b>1 SQ = 75 CM</b></div><div>DRAWN<b>FISK, FROM MEMORY</b></div></div>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const plan = $("plan"), entries = $("entries"), ruleEl = $("rule"), sayEl = $("say"), intro = $("intro"), notesEl = $("notes"), marginEl = $("margin");
    const convBtn = wrap.querySelector("[data-conv]"), rawBtn = wrap.querySelector("[data-raw]"), closeBtn = wrap.querySelector("[data-close]"), voidBtn = wrap.querySelector("[data-void]");
    const ruleBox = ruleEl.parentElement;

    const drawn = {};
    const wall = { len: WALL.paces, conv: null };
    let selected = null, stride = 1, closed = false, voidAt = null, tries = 0, over = false, closes = 0, ruleOpen = false, notesOpen = false, lastGap = null;
    const notesRead = {};
    const say = (m) => { sayEl.textContent = m; if (!reduce) { sayEl.classList.remove("flash"); void sayEl.offsetWidth; sayEl.classList.add("flash"); } };
    const order = () => ROOMS.filter((r) => drawn[r.id]);
    const totalDrawn = () => order().reduce((a, r) => a + drawn[r.id].len, 0);
    const rightConv = (r, d) => d.conv === r.day || (r.day === 1 && d.conv == null);

    function renderEntries() {
      entries.innerHTML = [...ROOMS, WALL].map((r) => {
        const isWall = r.id === "wall";
        const d = isWall ? wall : drawn[r.id];
        const state = d ? (d.conv ? `→ ${d.len.toFixed(1)} sq (D${d.conv} stride)` : `→ ${d.len} sq, raw`) : isWall ? "" : "not drawn";
        return `<button type="button" data-id="${r.id}" class="${d ? "used" : ""}${d && d.conv ? " ok" : ""}" aria-pressed="${selected === r.id}"><span>${r.name.toLowerCase()}: ${r.paces - 1} to ${r.paces + 1}</span><span class="st">paced day ${r.day} ${state}</span></button>`;
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
      notesEl.innerHTML = notesOpen ? Object.entries(NOTES).map(([k, n]) => `<button type="button" data-note="${k}" ${notesRead[k] ? "disabled" : ""}>${n.label}${notesRead[k] ? " ✓" : ""}</button>`).join("") : "";
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
        <text x="${Math.min((X(0) + wx) / 2, X(MAXSQ) - 260)}" y="18" fill="${P.line}" font-size="15" text-anchor="middle" ${F}>OUTSIDE WALL: ${WALL.paces} PACES, DAY 3${wall.conv ? ` = ${wall.len.toFixed(1)} SQ` : " (RAW)"}</text>`;
      let at = 0;
      for (const r of order()) {
        const d = drawn[r.id];
        const sel = selected === r.id;
        const ink = d.conv != null || r.day === 1;
        s += `<g data-room="${r.id}" style="cursor:pointer"><rect x="${X(at)}" y="76" width="${d.len * SQ}" height="84" fill="${sel ? "rgba(240,223,166,.14)" : "transparent"}" stroke="${sel ? P.pencil : ink ? P.line : P.pencil}" stroke-width="${sel ? 3.2 : 2.4}" ${ink ? `filter="url(#${K}w)"` : `stroke-dasharray="7 4"`}/>
          <text x="${X(at + d.len / 2)}" y="114" fill="${P.line}" font-size="${d.len < 18 ? 12 : 15}" text-anchor="middle" ${F}>${d.len < 15 ? r.name.split(" ")[0] : r.name}</text>
          <text x="${X(at + d.len / 2)}" y="134" fill="${d.conv ? P.line : P.pencil}" font-size="13" text-anchor="middle" ${F}>${d.conv ? d.len.toFixed(1) : d.len + " raw"}</text></g>`;
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
        s += `<g transform="translate(${X(voidAt)},118)"><rect x="-30" y="-16" width="60" height="32" fill="${P.deep}" stroke="${P.red}" stroke-width="3" transform="rotate(-8)"/><text y="6" fill="${P.red}" font-size="16" font-weight="700" text-anchor="middle" ${F} transform="rotate(-8)">VOID</text></g>
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
      const allRight = ROOMS.every((r) => rightConv(r, drawn[r.id])) && wall.conv === WALL.day;
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
        api.store.set("losses", 0);
        const notes = Object.keys(notesRead).length;
        return api.end({ outcome: "win", text: `The void is behind the cold store: about ${(conv(WALL) - TRUE_END).toFixed(0)} squares of the base that no hall reaches, and the cold comes up from it. Void located${notes ? ", and the drains and the file agree with the paper" : ""}. The halls never measured what they should; you did.` });
      }
      tries++;
      if (tries < 2) {
        const unconverted = order().some((r) => !rightConv(r, drawn[r.id])) || wall.conv !== WALL.day;
        say(`Off by about ${off.toFixed(0)} squares. ${unconverted ? "Something on the plan was paced on a later day and never converted at that day's stride." : "Look again at where the drawn rooms end and the wall goes on."} One retry.`);
        voidAt = null; return renderPlan();
      }
      over = true;
      api.store.set("losses", losses + 1);
      api.end({ outcome: "lose", text: `The void stamp is ${off.toFixed(0)} squares out. The plan is saved as it stands, and on night 6 the stair is not where you look. A changed Fisk takes longer strides; the gap you drew was not the gap that is there.` });
    }
    convBtn.addEventListener("click", () => convert(false));
    rawBtn.addEventListener("click", () => convert(true));
    closeBtn.addEventListener("click", closePlan);
    voidBtn.addEventListener("click", placeVoid);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); say("Start with the bunk hall: click its pencilled entry."); entries.querySelector("button")?.focus(); };
    startBtn.addEventListener("click", start);
    renderRule(); renderNotes(); render();
    const t0 = setTimeout(() => startBtn.focus(), 30);

    return {
      unmount() {
        over = true; clearTimeout(t0);
        window.removeEventListener("keydown", onKey);
        plan.removeEventListener("click", onPlanTap);
        wrap.remove();
      },
    };
  },
};

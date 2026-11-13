// Project: Man Eater — Floor Plan (1D, drawing from memory). Graphic style: cyanotype blueprint.
// DESIGN.md section 11.4, cut to one page: the ground floor's east-west run of rooms, the stride
// trap and the void (days 4 and 6 combined). One square is 75 cm, Fisk's day-1 stride. Halls are
// drawn at their remembered paces; a changed Fisk walked later with a longer stride, so each must be
// converted (paces x that day's stride / 75) before the plan is closed against the outside wall.
// The void is placed where the halls do not close; correct within 2 squares. One retry.

const P = { blue: "#1c3d6e", deep: "#142e55", line: "#eaf2ff", faint: "rgba(234,242,255,.16)", pencil: "#e8d9a8", red: "#ff9a7a" };
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
const SQ = 6, X0 = 30, MAXSQ = 160;

export default {
  mount(root, api) {
    const K = "man-eater-floor-plan-";
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:${P.blue};background-image:radial-gradient(ellipse at 40% 30%,rgba(255,255,255,.07),transparent 60%),linear-gradient(${P.faint} 1px,transparent 1px),linear-gradient(90deg,${P.faint} 1px,transparent 1px);background-size:auto,24px 24px,24px 24px;color:${P.line};font-family:'Courier Prime','Courier New',monospace}
      .${K}page{max-width:1120px;margin:0 auto;padding:14px 16px 20px;display:grid;gap:12px}
      .${K}plan{width:100%;height:auto;display:block;border:2px solid ${P.line};background:rgba(20,46,85,.45);touch-action:manipulation}
      .${K}cols{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:14px}
      .${K}box{border:1.5px solid rgba(234,242,255,.6);padding:10px 12px;background:rgba(20,46,85,.5)}
      .${K}box h4{margin:0 0 6px;font-size:12px;letter-spacing:.18em}
      .${K}entries{display:grid;gap:6px}
      .${K}wrap button{font:inherit;color:inherit;background:transparent;border:1.5px solid rgba(234,242,255,.7);padding:7px 10px;min-height:40px;cursor:pointer;text-align:left}
      .${K}wrap button:focus-visible{outline:3px solid ${P.pencil};outline-offset:2px}
      .${K}entries button{color:${P.pencil};font-family:'Special Elite','Courier Prime',monospace;font-size:14px;display:flex;justify-content:space-between;gap:10px}
      .${K}entries button[aria-pressed=true]{background:rgba(232,217,168,.15);border-color:${P.pencil}}
      .${K}entries button.used span:first-child::after{content:" ✓";color:${P.line}}
      .${K}rule{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
      .${K}rule button[aria-pressed=true]{background:${P.line};color:${P.deep}}
      .${K}acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .${K}acts button.go{background:${P.line};color:${P.deep};font-weight:700}
      .${K}acts button[disabled]{opacity:.35;cursor:not-allowed}
      .${K}say{font-size:13.5px;min-height:2.6em;line-height:1.4}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,46,85,.9);z-index:5;padding:16px}
      .${K}panel{max-width:580px;border:2px solid ${P.line};padding:22px;background:${P.blue}}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:30px;letter-spacing:.08em}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      @media (max-width:720px){.${K}cols{grid-template-columns:1fr}}
    </style>
    <div class="${K}page">
      <svg class="${K}plan" viewBox="0 0 ${X0 * 2 + MAXSQ * SQ} 210" role="img" aria-label="The ground floor plan, drawn from memory"></svg>
      <div class="${K}cols">
        <div class="${K}box"><h4>REMEMBERED PACES · IN PENCIL</h4><div class="${K}entries"></div>
          <p style="margin:8px 0 0;font-size:12.5px;color:${P.pencil};font-family:'Special Elite',monospace">cold here — behind the cold store, through the drains</p></div>
        <div class="${K}box"><h4>CONVERT · SLIDE RULE</h4>
          <div style="font-size:13px">paces × that day's stride ÷ 75 = squares</div>
          <div class="${K}rule" role="group" aria-label="Stride by day, from the Chart"></div>
          <div class="${K}acts"><button type="button" data-conv>Convert selected</button><button type="button" data-raw>Back to raw paces</button></div>
          <div class="${K}acts"><button type="button" class="go" data-close>Close the plan</button><button type="button" class="go" data-void hidden>Place the void stamp</button></div>
          <div class="${K}say" aria-live="polite"></div>
        </div>
      </div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <h2>FLOOR PLAN</h2>
      <p>Draw the ground floor from memory. Click a margin entry to draw that room at its remembered paces; one square is 75 cm, your stride on day 1.</p>
      <p><b>You grew.</b> A room walked on a later day was paced with a longer stride. Select it, set that day's stride on the slide rule and convert. Do the outside wall too. Then close the plan: where the halls do not close, place the void stamp (within 2 squares). One retry.</p>
      <button type="button" data-start>Unroll the paper</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const plan = $("plan"), entries = $("entries"), ruleEl = $("rule"), sayEl = $("say"), intro = $("intro");
    const convBtn = wrap.querySelector("[data-conv]"), rawBtn = wrap.querySelector("[data-raw]"), closeBtn = wrap.querySelector("[data-close]"), voidBtn = wrap.querySelector("[data-void]");

    // state: drawn rooms and their lengths in squares
    const drawn = {}; // id -> { len, conv: day|null }
    const wall = { len: WALL.paces, conv: null };
    let selected = null, stride = 1, closed = false, voidAt = null, tries = 0, over = false;
    const say = (m) => { sayEl.textContent = m; };
    const order = () => ROOMS.filter((r) => drawn[r.id]);
    const totalDrawn = () => order().reduce((a, r) => a + drawn[r.id].len, 0);

    function renderEntries() {
      entries.innerHTML = [...ROOMS, WALL].map((r) => {
        const isWall = r.id === "wall";
        const d = isWall ? wall : drawn[r.id];
        const state = d ? (d.conv ? ` → ${d.len.toFixed(1)} sq (D${d.conv})` : ` → ${d.len} sq raw`) : "";
        return `<button type="button" data-id="${r.id}" class="${d ? "used" : ""}" aria-pressed="${selected === r.id}"><span>${r.name.toLowerCase()}: ${r.paces - 1} to ${r.paces + 1}</span><span>day ${r.day}${state}</span></button>`;
      }).join("");
      entries.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => pick(b.dataset.id)));
    }
    function renderRule() {
      ruleEl.innerHTML = [1, 2, 3, 4].map((d) => `<button type="button" data-d="${d}" aria-pressed="${stride === d}">D${d} · ${STRIDE[d]} cm</button>`).join("");
      ruleEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { stride = +b.dataset.d; renderRule(); ruleEl.querySelector('[aria-pressed="true"]').focus(); }));
    }
    function renderPlan() {
      const X = (sq) => X0 + sq * SQ;
      let s = `<defs><pattern id="${K}g" width="${SQ}" height="${SQ}" patternUnits="userSpaceOnUse" x="${X0}" y="0"><path d="M${SQ} 0H0V${SQ}" fill="none" stroke="${P.faint}" stroke-width=".6"/></pattern>
        <pattern id="${K}h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${P.line}" stroke-width="1.2" opacity=".55"/></pattern></defs>
        <rect x="${X0}" y="40" width="${MAXSQ * SQ}" height="130" fill="url(#${K}g)"/>`;
      for (let q = 0; q <= MAXSQ; q += 10) s += `<line x1="${X(q)}" x2="${X(q)}" y1="40" y2="170" stroke="${P.line}" stroke-opacity="${q % 50 === 0 ? 0.35 : 0.16}"/>`;
      // the outside wall measure along the top, in ink
      const wx = X(wall.len);
      s += `<line x1="${X(0)}" x2="${wx}" y1="24" y2="24" stroke="${P.line}" stroke-width="2"/><line x1="${X(0)}" x2="${X(0)}" y1="16" y2="32" stroke="${P.line}" stroke-width="2"/><line x1="${wx}" x2="${wx}" y1="16" y2="32" stroke="${P.line}" stroke-width="2"/>
        <text x="${(X(0) + wx) / 2}" y="18" fill="${P.line}" font-size="11" text-anchor="middle" font-family="Courier Prime,monospace">OUTSIDE WALL, EAST–WEST: ${WALL.paces} PACES (DAY 3)${wall.conv ? ` = ${wall.len.toFixed(1)} SQ` : " (RAW)"}</text>`;
      // rooms, west to east
      let at = 0;
      for (const r of order()) {
        const d = drawn[r.id];
        const sel = selected === r.id;
        s += `<g data-room="${r.id}" style="cursor:pointer"><rect x="${X(at)}" y="70" width="${d.len * SQ}" height="80" fill="${sel ? "rgba(232,217,168,.12)" : "transparent"}" stroke="${sel ? P.pencil : P.line}" stroke-width="${sel ? 3 : 2.2}"/>
          <text x="${X(at + d.len / 2)}" y="108" fill="${P.line}" font-size="${d.len < 17 ? 8 : 11}" text-anchor="middle" font-family="Courier Prime,monospace">${r.name}</text>
          <text x="${X(at + d.len / 2)}" y="124" fill="${d.conv ? P.line : P.pencil}" font-size="9" text-anchor="middle" font-family="Courier Prime,monospace">${d.conv ? d.len.toFixed(1) + " sq" : d.len + " raw"}</text></g>`;
        at += d.len;
      }
      // hall line under the rooms
      if (at > 0) s += `<line x1="${X(0)}" x2="${X(at)}" y1="160" y2="160" stroke="${P.line}" stroke-width="2"/>`;
      if (closed) {
        const gap = wall.len - at;
        if (Math.abs(gap) >= 3) {
          s += `<rect x="${X(Math.min(at, wall.len))}" y="70" width="${Math.abs(gap) * SQ}" height="80" fill="url(#${K}h)" stroke="${P.line}" stroke-dasharray="5 4"/>
            <text x="${X(Math.min(at, wall.len) + Math.abs(gap) / 2)}" y="64" fill="${P.pencil}" font-size="11" text-anchor="middle" font-family="Courier Prime,monospace">${gap.toFixed(1)} SQ ?</text>`;
        }
      }
      if (voidAt != null) {
        s += `<g transform="translate(${X(voidAt)},110)"><rect x="-26" y="-14" width="52" height="28" fill="${P.deep}" stroke="${P.red}" stroke-width="2.5" transform="rotate(-8)"/><text y="5" fill="${P.red}" font-size="12" font-weight="700" text-anchor="middle" font-family="Courier Prime,monospace" transform="rotate(-8)">VOID</text></g>`;
      }
      // compass rose and scale bar
      s += `<g transform="translate(${X0 + MAXSQ * SQ - 26},196)"><path d="M0-16L4 0L0 16L-4 0Z" fill="${P.line}"/><text y="-20" fill="${P.line}" font-size="9" text-anchor="middle">N</text></g>
        <g transform="translate(${X0},190)"><rect width="${10 * SQ}" height="5" fill="${P.line}"/><rect x="${10 * SQ}" width="${10 * SQ}" height="5" fill="none" stroke="${P.line}"/><text y="16" fill="${P.line}" font-size="9" font-family="Courier Prime,monospace">0</text><text x="${20 * SQ}" y="16" fill="${P.line}" font-size="9" text-anchor="middle" font-family="Courier Prime,monospace">20 SQ = 15 M</text></g>
        <text x="${X0 + 160}" y="200" fill="${P.line}" font-size="10" font-family="Courier Prime,monospace">FLOOR PLAN / GROUND / DRAWN FROM MEMORY</text>`;
      plan.innerHTML = s;
      plan.querySelectorAll("[data-room]").forEach((g) => g.addEventListener("click", () => pick(g.dataset.room)));
    }
    const render = () => { renderEntries(); renderPlan(); };

    function pick(id) {
      if (over) return;
      if (id !== "wall" && !drawn[id]) {
        const r = ROOMS.find((x) => x.id === id);
        drawn[id] = { len: r.paces, conv: null };
        closed = false; voidBtn.hidden = true;
        say(`${r.name.toLowerCase()} drawn at ${r.paces} squares, as paced. Paced on day ${r.day}.`);
      } else say(`Selected: ${(id === "wall" ? WALL : ROOMS.find((x) => x.id === id)).name.toLowerCase()}. Set the stride for the day it was paced, then Convert.`);
      selected = id; render();
    }
    function convert(raw) {
      if (over || !selected) return say("Select a room or the outside wall first.");
      const r = selected === "wall" ? WALL : ROOMS.find((x) => x.id === selected);
      const d = selected === "wall" ? wall : drawn[selected];
      if (raw) { d.len = r.paces; d.conv = null; say(`${r.name.toLowerCase()} back to ${r.paces} raw paces.`); }
      else {
        d.len = Math.round(((r.paces * STRIDE[stride]) / 75) * 10) / 10; d.conv = stride;
        say(`${r.paces} × ${STRIDE[stride]} ÷ 75 = ${d.len.toFixed(1)} squares.${stride !== r.day ? " (That was not the stride of the day it was paced.)" : ""}`);
      }
      closed = false; voidAt = null; voidBtn.hidden = true;
      render();
    }
    function closePlan() {
      if (over) return;
      if (order().length < ROOMS.length) return say(`Draw every room first: ${ROOMS.length - order().length} still to draw.`);
      closed = true;
      const gap = wall.len - totalDrawn();
      voidAt = null;
      if (Math.abs(gap) < 3) say(`The plan closes: ${totalDrawn().toFixed(1)} of ${wall.len.toFixed(1)} squares.`);
      else say(`The plan does not close. The rooms total ${totalDrawn().toFixed(1)} squares against ${wall.len.toFixed(1)}: ${gap.toFixed(1)} squares unaccounted for. Tap the plan to set the void stamp, then place it.`);
      voidBtn.hidden = false;
      render();
    }
    const onPlanTap = (e) => {
      if (!closed || over || e.target.closest("[data-room]")) return;
      const pt = plan.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const m = plan.getScreenCTM(); if (!m) return;
      const loc = pt.matrixTransform(m.inverse());
      voidAt = Math.max(0, Math.min(MAXSQ, Math.round((loc.x - X0) / SQ)));
      say(`Void stamp at square ${voidAt}. Arrow keys nudge it. Place it when you are sure.`);
      renderPlan();
    };
    plan.addEventListener("click", onPlanTap);
    const onKey = (e) => {
      if (!closed || voidAt == null || over) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { voidAt = Math.max(0, Math.min(MAXSQ, voidAt + (e.key === "ArrowRight" ? 1 : -1))); renderPlan(); say(`Void stamp at square ${voidAt}.`); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    function placeVoid() {
      if (over) return;
      if (voidAt == null) {
        // keyboard path: start the stamp in the middle of the drawn gap
        voidAt = Math.round((totalDrawn() + wall.len) / 2);
        say(`Void stamp at square ${voidAt}. Arrow keys nudge it; press Place again to commit.`);
        return renderPlan();
      }
      const off = Math.abs(voidAt - TRUE_VOID);
      if (off <= 2) {
        over = true;
        return api.end({ outcome: "win", text: `The void is behind the cold store: about ${(conv(WALL) - TRUE_END).toFixed(0)} squares of the base that no hall reaches, and the cold comes up from it. Void located. The halls never measure what they should.` });
      }
      tries++;
      if (tries < 2) { say(`Off by about ${off.toFixed(0)} squares. ${order().some((r) => !drawn[r.id].conv || drawn[r.id].conv !== r.day) || wall.conv !== WALL.day ? "Something on the plan was paced on a later day and never converted." : "Look again at where the drawn rooms end."} One retry.`); voidAt = null; return renderPlan(); }
      over = true;
      api.end({ outcome: "lose", text: `The void stamp is ${off.toFixed(0)} squares out. The plan is saved as it stands, and the stair is not found on night 6. A changed Fisk takes longer strides; the gaps you see may not be the gap that is there.` });
    }
    convBtn.addEventListener("click", () => convert(false));
    rawBtn.addEventListener("click", () => convert(true));
    closeBtn.addEventListener("click", closePlan);
    voidBtn.addEventListener("click", placeVoid);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); say("Start with the bunk hall: click its entry."); entries.querySelector("button")?.focus(); };
    startBtn.addEventListener("click", start);
    renderRule(); render();
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

// The Lord of the Sea: Dead Reckoning (1D, nautical plotting sheet).
// `g-reckon-unwritten` from DESIGN.md section 11: one leg from the fix to the Gullwife boat,
// a steady tidal set, two rocks, a 2 nm target circle. Lay a heading (drag on the rose, or the
// arrow keys) and a time; the still-water run is pencilled. Then lay each hour's tide from the
// table onto the end of that hour's run, mark the dead-reckoned position, and commit. A track
// across a rock is refused and shown. The Unwritten's Wild is 85, so Alexi may stir an hour's
// tide vector up to 30 degrees either way (Wild +5 each). Off target: you arrive in fog.
// Added to fit the browser: two erasers to rub out a plot and try again.

const PAPER = "#F4F1E8", GRID = "#9fb0c4", INK = "#1F2E4A", RED = "#8C2B2B", PENCIL = "#4a4a4a", GOLD = "#E7A93B", GREEN = "#2F6B5E";
const NM = 30;                         // px per nautical mile
const OX = 40, OY = 620;               // chart origin (0, 0) in px; y grows north
const FIX = { x: 3, y: 4 }, TARGET = { x: 24, y: 15, r: 2 };
const ROCKS = [{ x: 17.2, y: 6.1, r: 0.8 }, { x: 11.5, y: 12.6, r: 0.8 }];
const SPEED = 6;                       // knots, from the log-line
const TIDE = { set: 160, rate: 2.0 };  // steady set
const ROSE = { x: 27.6, y: 3.6, r: 3 };
const px = (p) => [OX + p.x * NM, OY - p.y * NM];
const rad = (d) => (d * Math.PI) / 180;
const vec = (bearing, len) => ({ x: Math.sin(rad(bearing)) * len, y: Math.cos(rad(bearing)) * len });

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-dead-reckoning-";
    const S = { heading: 62, quarters: 16, laid: [], stir: [], sel: -1, marked: false, erasers: 2, wild: 85, msg: "", refused: null, over: false };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; background:#d9d4c4; color:${INK}; font-family:'IM Fell English',Georgia,serif; }
      .${P}lay { display:grid; grid-template-columns:minmax(0,1fr) 230px; gap:12px; padding:10px clamp(8px,2vw,20px) 16px; max-width:1300px; margin:0 auto; }
      .${P}sheet { width:100%; height:auto; max-height:calc(100vh - 110px); display:block; background:${PAPER}; box-shadow:0 4px 16px rgba(0,0,0,.25); touch-action:none; }
      .${P}tray { display:grid; gap:10px; align-content:start; }
      .${P}card { background:${PAPER}; border:1px solid ${INK}; padding:9px 10px; box-shadow:2px 3px 0 rgba(31,46,74,.25); }
      .${P}card h3 { margin:0 0 6px; font-family:'IM Fell English SC',Georgia,serif; font-weight:400; font-size:13px; letter-spacing:.14em; }
      .${P}row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
      .${P}row b { font-family:ui-monospace,'JetBrains Mono',monospace; font-weight:600; font-size:18px; min-width:4.5ch; text-align:center; }
      .${P}tray button, .${P}how button { font:inherit; font-size:15px; padding:5px 10px; border:1px solid ${INK}; background:#fff; color:${INK}; cursor:pointer; }
      .${P}tray button:disabled { opacity:.4; cursor:default; }
      .${P}tray button.main { background:${INK}; color:${PAPER}; }
      .${P}tide { font-family:ui-monospace,'JetBrains Mono',monospace; font-size:13px; width:100%; border-collapse:collapse; }
      .${P}tide td { padding:3px 4px; border-bottom:1px dotted ${GRID}; }
      .${P}tide tr[data-h] { cursor:grab; }
      .${P}tide tr.done { color:${GREEN}; }
      .${P}tide tr.next { background:#fff3d6; }
      .${P}msg { font-size:16px; line-height:1.35; min-height:2.6em; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(217,212,196,.9); z-index:3; padding:16px; }
      .${P}how div { max-width:540px; background:${PAPER}; border:1px solid ${INK}; padding:20px 22px; box-shadow:4px 5px 0 rgba(31,46,74,.3);
        background-image: linear-gradient(${GRID}33 1px, transparent 1px), linear-gradient(90deg, ${GRID}33 1px, transparent 1px); background-size:24px 24px; }
      .${P}how h2 { font-weight:400; font-size:30px; margin:0 0 8px; }
      .${P}how p { margin:0 0 10px; font-size:16px; line-height:1.4; }
      @media (max-width:820px) { .${P}lay { grid-template-columns:1fr; } .${P}sheet { max-height:none; } }
    </style>
    <div class="${P}w"><div class="${P}lay">
      <svg class="${P}sheet" viewBox="0 0 1000 660" role="img" aria-label="Plotting sheet"></svg>
      <div class="${P}tray"></div>
    </div>
    <div class="${P}how" role="dialog" aria-label="How to play"><div>
      <h2>Dead Reckoning</h2>
      <p>No chart reaches the Unwritten. Plot a course from the fix to the Gullwife boat inside the dashed circle, clear of both rocks. Lay a <b>heading</b> on the rose and a <b>time</b>; the boat makes 6 knots through the water.</p>
      <p>Then lay the <b>tide</b> hour by hour from the table: it sets you south-east whatever you do, so aim off. Mark where you will be and commit. Here the water is wild enough to <b>stir</b>: turn one hour's tide up to 30° with a circle.</p>
      <button type="button">Unroll the sheet</button>
    </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const svg = w.querySelector("svg");
    const tray = w.querySelector("." + P + "tray");
    const how = w.querySelector("." + P + "how");

    const hours = () => Math.ceil(S.quarters / 4);
    const hourFrac = (h) => Math.min(1, S.quarters / 4 - h); // h from 0
    const tideFor = (h) => vec(TIDE.set + (S.stir[h] || 0), TIDE.rate * hourFrac(h));
    function plot() { // the zigzag: run ends and tide ends
      const pts = [{ ...FIX }], runs = [];
      let p = { ...FIX };
      for (let h = 0; h < hours(); h++) {
        const r = vec(S.heading, SPEED * hourFrac(h));
        const q = { x: p.x + r.x, y: p.y + r.y };
        runs.push([p, q]);
        if (S.laid[h]) { const t = tideFor(h); p = { x: q.x + t.x, y: q.y + t.y }; } else p = q;
        pts.push(p);
      }
      return { pts, runs, end: p };
    }
    const allLaid = () => Array.from({ length: hours() }, (_, h) => !!S.laid[h]).every(Boolean);
    function segHitsCircle(a, b, c) {
      const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.y - a.y) * dy) / l2));
      const qx = a.x + t * dx, qy = a.y + t * dy;
      return Math.hypot(qx - c.x, qy - c.y) < c.r ? { x: qx, y: qy } : null;
    }

    // ---- drawing ----
    function rose() {
      const [cx, cy] = px(ROSE), R = ROSE.r * NM;
      let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="${R - 12}" fill="none" stroke="${INK}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="${R * 0.56}" fill="none" stroke="${RED}" stroke-width=".8" stroke-dasharray="2 3"/>`;
      for (let d = 0; d < 360; d += 5) {
        const a = rad(d), l = d % 30 === 0 ? 12 : d % 10 === 0 ? 8 : 4;
        s += `<line x1="${cx + Math.sin(a) * R}" y1="${cy - Math.cos(a) * R}" x2="${cx + Math.sin(a) * (R - l)}" y2="${cy - Math.cos(a) * (R - l)}" stroke="${INK}" stroke-width=".8"/>`;
        if (d % 30 === 0) s += `<text x="${cx + Math.sin(a) * (R + 13)}" y="${cy - Math.cos(a) * (R + 13) + 4}" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="${INK}">${String(d).padStart(3, "0")}</text>`;
      }
      for (let k = 0; k < 8; k++) {
        const a = rad(k * 45), l = k % 2 ? R * 0.42 : R * 0.7, a1 = rad(k * 45 + 90 / 8 * 2), a2 = rad(k * 45 - 90 / 8 * 2);
        s += `<path d="M${cx + Math.sin(a) * l} ${cy - Math.cos(a) * l} L${cx + Math.sin(a1) * 9} ${cy - Math.cos(a1) * 9} L${cx} ${cy} Z" fill="${INK}"/><path d="M${cx + Math.sin(a) * l} ${cy - Math.cos(a) * l} L${cx + Math.sin(a2) * 9} ${cy - Math.cos(a2) * 9} L${cx} ${cy} Z" fill="${PAPER}" stroke="${INK}" stroke-width=".8"/>`;
      }
      const ha = rad(S.heading);
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(ha) * (R - 2)}" y2="${cy - Math.cos(ha) * (R - 2)}" stroke="${RED}" stroke-width="2"/><circle cx="${cx + Math.sin(ha) * (R - 2)}" cy="${cy - Math.cos(ha) * (R - 2)}" r="5" fill="${RED}"/>`;
      s += `<path d="M${cx} ${cy - R + 18} l-5 10 h10z" fill="${RED}"/>`;
      return `<g class="${P}rose" style="cursor:crosshair">${s}<circle cx="${cx}" cy="${cy}" r="${R + 16}" fill="transparent" data-rose="1"/></g>`;
    }
    function arrowHead(x1, y1, x2, y2, col, triple) {
      const a = Math.atan2(y2 - y1, x2 - x1);
      let s = "";
      const n = triple ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const t = 0.5 + (i - (n - 1) / 2) * 0.12, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
        s += `<path d="M${x - Math.cos(a - 0.45) * 9} ${y - Math.sin(a - 0.45) * 9} L${x} ${y} L${x - Math.cos(a + 0.45) * 9} ${y - Math.sin(a + 0.45) * 9}" fill="none" stroke="${col}" stroke-width="1.6"/>`;
      }
      return s;
    }
    function render() {
      let s = "";
      // grid
      for (let i = 0; i <= 31; i++) s += `<line x1="${OX + i * NM}" y1="20" x2="${OX + i * NM}" y2="${OY + 20}" stroke="${GRID}" stroke-width="${i % 5 ? 0.5 : 1.1}"/>`;
      for (let j = -1; j <= 20; j++) s += `<line x1="20" y1="${OY - j * NM}" x2="980" y2="${OY - j * NM}" stroke="${GRID}" stroke-width="${j % 5 ? 0.5 : 1.1}"/>`;
      s += `<rect x="14" y="14" width="972" height="632" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="14 6"/>`;
      for (let j = 0; j <= 15; j += 5) s += `<text x="22" y="${OY - j * NM - 4}" font-size="10" fill="${INK}" font-family="ui-monospace,monospace">41°${String(j).padStart(2, "0")}'</text>`;
      // scale of miles
      s += `<g transform="translate(330,${OY + 14})">${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * NM}" y="0" width="${NM}" height="6" fill="${i % 2 ? PAPER : INK}" stroke="${INK}"/>`).join("")}<text x="${5 * NM + 8}" y="7" font-size="12" font-style="italic" fill="${INK}">nautical miles</text></g>`;
      // hazards
      for (const r of ROCKS) {
        const [x, y] = px(r);
        s += `<circle cx="${x}" cy="${y}" r="${r.r * NM}" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="2 3"/><path d="M${x - 7} ${y} h14 M${x} ${y - 7} v14 M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10" stroke="${INK}" stroke-width="1.6"/><text x="${x + 14}" y="${y - 10}" font-size="12" font-style="italic" fill="${INK}">rock</text>`;
      }
      // target and fix
      const [tx, ty] = px(TARGET);
      s += `<circle cx="${tx}" cy="${ty}" r="${TARGET.r * NM}" fill="rgba(140,43,43,.06)" stroke="${RED}" stroke-width="1.6" stroke-dasharray="6 4"/><text x="${tx + TARGET.r * NM + 6}" y="${ty - 6}" font-size="13" letter-spacing="2" fill="${RED}" font-family="IM Fell English SC,Georgia,serif">GULLWIFE BOAT</text><circle cx="${tx}" cy="${ty}" r="3" fill="${RED}"/>`;
      const [fx, fy] = px(FIX);
      s += `<circle cx="${fx}" cy="${fy}" r="8" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="${fx}" cy="${fy}" r="2" fill="${INK}"/><text x="${fx - 10}" y="${fy + 24}" font-size="13" font-family="ui-monospace,monospace" fill="${INK}">FIX 0600</text>`;
      s += rose();
      // parallel rule along the heading, from the fix
      const hv = vec(S.heading, 1);
      const L = 360, nx = -hv.y, ny = -hv.x; // screen normal
      const ax = fx + hv.x * 30 + nx * 22, ay = fy - hv.y * 30 + ny * 22;
      s += `<g opacity=".55"><path d="M${ax} ${ay} l${hv.x * L} ${-hv.y * L} l${nx * 26} ${ny * 26} l${-hv.x * L} ${hv.y * L}z" fill="#cfe2e6" stroke="${INK}" stroke-width=".8"/>${Array.from({ length: 24 }, (_, i) => `<line x1="${ax + hv.x * i * 15}" y1="${ay - hv.y * i * 15}" x2="${ax + hv.x * i * 15 + nx * (i % 2 ? 5 : 9)}" y2="${ay - hv.y * i * 15 + ny * (i % 2 ? 5 : 9)}" stroke="${INK}" stroke-width=".7"/>`).join("")}</g>`;
      // the plot
      const pl = plot();
      pl.runs.forEach(([a, b], h) => {
        const [x1, y1] = px(a), [x2, y2] = px(b);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PENCIL}" stroke-width="1.6" ${S.laid[h] ? "" : 'stroke-dasharray="7 5"'}/>${arrowHead(x1, y1, x2, y2, PENCIL, false)}`;
        if (h === 0) s += `<text x="${(x1 + x2) / 2 - 30}" y="${(y1 + y2) / 2 - 10}" font-size="12" font-family="ui-monospace,monospace" fill="${PENCIL}" transform="rotate(${S.heading - 90} ${(x1 + x2) / 2} ${(y1 + y2) / 2})">C ${String(S.heading).padStart(3, "0")}°T S ${SPEED} kn</text>`;
        s += `<line x1="${x2 - 4}" y1="${y2 - 4}" x2="${x2 + 4}" y2="${y2 + 4}" stroke="${PENCIL}"/><text x="${x2 + 6}" y="${y2 + 14}" font-size="10" fill="${PENCIL}" font-family="ui-monospace,monospace">${h + 1 > S.quarters / 4 ? String(6 + h).padStart(2, "0") + String((S.quarters % 4) * 15).padStart(2, "0") : String(7 + h).padStart(2, "0") + "00"}</text>`;
        if (S.laid[h]) {
          const t = tideFor(h), [x3, y3] = px({ x: b.x + t.x, y: b.y + t.y });
          s += `<g data-vec="${h}" style="cursor:pointer"><line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}" stroke="${S.sel === h ? GOLD : INK}" stroke-width="${S.sel === h ? 3.4 : 2}"/>${arrowHead(x2, y2, x3, y3, S.sel === h ? GOLD : INK, true)}<line x1="${x2}" y1="${y2}" x2="${x3}" y2="${y3}" stroke="transparent" stroke-width="18"/></g>`;
          if (S.stir[h]) s += `<text x="${x3 + 6}" y="${y3 + 4}" font-size="11" fill="${GREEN}" font-style="italic">stirred ${S.stir[h] > 0 ? "+" : ""}${S.stir[h]}°</text>`;
        }
      });
      // DR mark and dividers
      const [ex, ey] = px(pl.end);
      if (S.marked) {
        s += `<path d="M${ex - 9} ${ey + 6} L${ex} ${ey - 9} L${ex + 9} ${ey + 6}Z" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="${ex}" cy="${ey}" r="2" fill="${INK}"/><text x="${ex + 12}" y="${ey - 8}" font-size="13" font-family="ui-monospace,monospace" fill="${INK}">DR ${String(6 + Math.floor(S.quarters / 4)).padStart(2, "0")}${String((S.quarters % 4) * 15).padStart(2, "0")}</text>`;
        s += `<g stroke="${INK}" stroke-width="2.2" fill="none"><line x1="${ex}" y1="${ey}" x2="${ex + 26}" y2="${ey - 110}"/><line x1="${ex + 52}" y1="${ey - 4}" x2="${ex + 26}" y2="${ey - 110}"/></g><circle cx="${ex + 26}" cy="${ey - 112}" r="7" fill="${GOLD}" stroke="${INK}"/>`;
      }
      if (S.refused) { const [rx, ry] = px(S.refused); s += `<circle cx="${rx}" cy="${ry}" r="14" fill="none" stroke="${RED}" stroke-width="3"/><path d="M${rx - 10} ${ry - 10} l20 20 m0 -20 l-20 20" stroke="${RED}" stroke-width="3"/>`; }
      // clock
      const cx = 925, cy = 70, hr = S.quarters / 4;
      s += `<circle cx="${cx}" cy="${cy}" r="38" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${cx} ${cy} L${cx} ${cy - 34} A34 34 0 ${hr > 6 ? 1 : 0} 1 ${cx + Math.sin(rad(hr * 30)) * 34} ${cy - Math.cos(rad(hr * 30)) * 34}Z" fill="#f5dca6"/>${Array.from({ length: 12 }, (_, i) => `<line x1="${cx + Math.sin(rad(i * 30)) * 30}" y1="${cy - Math.cos(rad(i * 30)) * 30}" x2="${cx + Math.sin(rad(i * 30)) * 36}" y2="${cy - Math.cos(rad(i * 30)) * 36}" stroke="${INK}"/>`).join("")}<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(rad(hr * 30)) * 30}" y2="${cy - Math.cos(rad(hr * 30)) * 30}" stroke="${INK}" stroke-width="2.4"/><text x="${cx}" y="${cy + 56}" text-anchor="middle" font-size="13" font-family="ui-monospace,monospace" fill="${INK}">${Math.floor(hr)} h ${String((S.quarters % 4) * 15).padStart(2, "0")}</text>`;
      // pencil
      s += `<g transform="translate(560,600) rotate(-14)"><rect x="0" y="0" width="150" height="12" fill="${GOLD}" stroke="${INK}"/><path d="M150 0 l22 6 l-22 6z" fill="#e8cfa0" stroke="${INK}"/><path d="M166 4.5 l6 1.5 l-6 1.5z" fill="${PENCIL}"/><rect x="-14" y="0" width="14" height="12" fill="#d79b9b" stroke="${INK}"/></g>`;
      svg.innerHTML = s;
      svg.querySelectorAll("[data-vec]").forEach((g) => g.addEventListener("click", (e) => { e.stopPropagation(); S.sel = S.sel === +g.dataset.vec ? -1 : +g.dataset.vec; S.msg = S.sel >= 0 ? "Stir it: circle on the sheet (clockwise turns it right), or use the buttons." : ""; render(); }));
      renderTray(pl);
    }
    function renderTray(pl) {
      const locked = S.laid.some(Boolean);
      const next = Array.from({ length: hours() }, (_, h) => h).find((h) => !S.laid[h]);
      const rows = Array.from({ length: Math.max(5, hours()) }, (_, h) => `<tr data-h="${h}" class="${S.laid[h] ? "done" : h === next ? "next" : ""}" ${h < hours() ? 'draggable="true"' : 'style="opacity:.4"'}><td>${String(6 + h).padStart(2, "0")}–${String(7 + h).padStart(2, "0")}</td><td>${TIDE.set}°</td><td>${TIDE.rate.toFixed(1)} kn</td><td>${S.laid[h] ? "✓" : h < hours() ? "lay" : ""}</td></tr>`).join("");
      tray.innerHTML = `
        <div class="${P}card"><h3>COURSE</h3>
          <div class="${P}row">Heading <button type="button" data-a="h-10" ${locked ? "disabled" : ""}>−10</button><button type="button" data-a="h-1" ${locked ? "disabled" : ""}>−1</button><b>${String(S.heading).padStart(3, "0")}°</b><button type="button" data-a="h+1" ${locked ? "disabled" : ""}>+1</button><button type="button" data-a="h+10" ${locked ? "disabled" : ""}>+10</button></div>
          <div class="${P}row" style="margin-top:6px">Time <button type="button" data-a="t-" ${locked ? "disabled" : ""}>−¼</button><b>${(S.quarters / 4).toFixed(2)}h</b><button type="button" data-a="t+" ${locked ? "disabled" : ""}>+¼</button></div>
          <div style="font-size:13px;margin-top:4px;opacity:.8">Log-line: ${SPEED} knots. Run: ${(SPEED * S.quarters / 4).toFixed(1)} nm.</div></div>
        <div class="${P}card"><h3>TIDAL STREAM</h3><table class="${P}tide"><tr><td>HR</td><td>SET</td><td>RATE</td><td></td></tr>${rows}</table>
          <div style="font-size:13px;margin-top:4px;opacity:.8">Drag a row onto the sheet, or click it, to lay that hour's tide.</div></div>
        <div class="${P}card"><h3>STIR · WILD ${S.wild}</h3>
          <div class="${P}row"><button type="button" data-a="s-" ${S.sel >= 0 ? "" : "disabled"}>↺ 5°</button><button type="button" data-a="s+" ${S.sel >= 0 ? "" : "disabled"}>↻ 5°</button><span style="font-size:13px">${S.sel >= 0 ? `hour ${S.sel + 1}: ${(S.stir[S.sel] || 0)}°` : "click a tide arrow"}</span></div></div>
        <div class="${P}card"><div class="${P}row">
          <button type="button" data-a="mark" ${allLaid() && !S.marked ? "" : "disabled"}>Mark DR</button>
          <button type="button" class="main" data-a="commit" ${S.marked && !S.over ? "" : "disabled"}>Commit</button>
          <button type="button" data-a="erase" ${locked && S.erasers > 0 && !S.over ? "" : "disabled"}>Erase (${S.erasers})</button></div>
          <p class="${P}msg" aria-live="polite">${S.msg}</p></div>`;
      tray.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => act(b.dataset.a)));
      tray.querySelectorAll("tr[data-h]").forEach((tr) => {
        tr.addEventListener("click", () => layTide(+tr.dataset.h));
        tr.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", tr.dataset.h); });
      });
    }
    function layTide(h) {
      if (S.over || h >= hours()) return;
      const next = Array.from({ length: hours() }, (_, k) => k).find((k) => !S.laid[k]);
      if (next === undefined) return;
      if (h !== next) { S.msg = `Lay the tide in order: hour ${next + 1} first, from the end of its run.`; render(); return; }
      S.laid[h] = true; S.refused = null;
      S.msg = allLaid() ? "Every hour's tide is laid. Mark the dead-reckoned position with the dividers." : `Hour ${h + 1}'s tide laid.`;
      render();
    }
    function act(a) {
      if (S.over) return;
      const locked = S.laid.some(Boolean);
      const m = a.match(/^h([+-]\d+)$/);
      if (m && !locked) S.heading = (S.heading + +m[1] + 360) % 360;
      if (a === "t-" && !locked) S.quarters = Math.max(4, S.quarters - 1);
      if (a === "t+" && !locked) S.quarters = Math.min(24, S.quarters + 1);
      if ((a === "s-" || a === "s+") && S.sel >= 0) stirBy(S.sel, a === "s+" ? 5 : -5);
      if (a === "mark" && allLaid()) { S.marked = true; S.msg = "Dividers on the DR. Commit when you trust it."; }
      if (a === "erase" && S.erasers > 0) { S.erasers--; S.laid = []; S.stir = []; S.sel = -1; S.marked = false; S.refused = null; S.msg = `Rubbed out. ${S.erasers} eraser${S.erasers === 1 ? "" : "s"} left.`; }
      if (a === "commit" && S.marked) { commit(); return; }
      render();
    }
    function stirBy(h, d) {
      const before = S.stir[h] || 0, after = Math.max(-30, Math.min(30, before + d));
      if (after === before) { S.msg = "Thirty degrees is all the water will give."; return; }
      if (!before) S.wild = Math.min(100, S.wild + 5);
      S.stir[h] = after; S.marked = false;
      S.msg = `Hour ${h + 1}'s tide turned to ${TIDE.set + after}°. Mark the DR again.`;
    }
    function commit() {
      const pl = plot();
      for (let i = 1; i < pl.pts.length; i++) for (const r of ROCKS) {
        const hit = segHitsCircle(pl.pts[i - 1], pl.pts[i], r);
        if (hit) { S.refused = hit; S.marked = false; S.msg = "Refused: that track runs over a rock. See the red cross. Erase or stir to clear it."; render(); return; }
      }
      const off = Math.hypot(pl.end.x - TARGET.x, pl.end.y - TARGET.y);
      S.over = true; render();
      const stirred = S.stir.filter(Boolean).length;
      if (off <= TARGET.r) api.end({ outcome: "win", text: `Arrived, ${off.toFixed(1)} nm from the Gullwife boat: fifty metres off her bow when the fog lifts.${stirred ? ` The tide was stirred ${stirred === 1 ? "once" : stirred + " times"}: Wild ${S.wild}.` : ""}` });
      else api.end({ outcome: "lose", text: `Arrived off-target, ${off.toFixed(1)} nm out. You come up in fog, three hundred metres from the Gullwife boat instead of fifty.` });
    }

    // ---- pointer: the rose, dropping tide rows, the circle stir ----
    function toSvg(e) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
    const g = { mode: null, ang: 0, last: null, cx: 0, cy: 0 };
    svg.addEventListener("pointerdown", (e) => {
      if (S.over) return;
      const p = toSvg(e), [rx, ry] = px(ROSE);
      if (Math.hypot(p.x - rx, p.y - ry) < ROSE.r * NM + 16) {
        if (S.laid.some(Boolean)) { S.msg = "The plot is pencilled in. Erase it to lay a new heading."; render(); return; }
        g.mode = "rose"; svg.setPointerCapture?.(e.pointerId); setHeading(p); e.preventDefault(); return;
      }
      if (S.sel >= 0) { g.mode = "stir"; g.ang = 0; g.last = null; g.cx = p.x; g.cy = p.y; g.pts = 0; svg.setPointerCapture?.(e.pointerId); }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!g.mode) return;
      const p = toSvg(e);
      if (g.mode === "rose") { setHeading(p); return; }
      g.pts++; g.cx += (p.x - g.cx) / Math.min(g.pts, 20); g.cy += (p.y - g.cy) / Math.min(g.pts, 20);
      if (Math.hypot(p.x - g.cx, p.y - g.cy) < 10) return;
      const a = Math.atan2(p.y - g.cy, p.x - g.cx);
      if (g.last != null) { let d = a - g.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; g.ang += d; }
      g.last = a;
      if (Math.abs(g.ang) >= Math.PI / 2) { stirBy(S.sel, g.ang > 0 ? 5 : -5); g.ang = 0; render(); }
    });
    const end = () => { g.mode = null; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    svg.addEventListener("dragover", (e) => e.preventDefault());
    svg.addEventListener("drop", (e) => { e.preventDefault(); const h = +e.dataTransfer.getData("text/plain"); if (!Number.isNaN(h)) layTide(h); });
    function setHeading(p) {
      const [rx, ry] = px(ROSE);
      const d = (Math.round((Math.atan2(p.x - rx, -(p.y - ry)) * 180) / Math.PI) + 360) % 360;
      if (d !== S.heading) { S.heading = d; render(); }
    }
    const onKey = (e) => {
      if (how.isConnected || S.over) return;
      if (e.target.closest && e.target.closest("button")) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") { act(`h-${step}`); e.preventDefault(); }
      if (e.key === "ArrowRight") { act(`h+${step}`); e.preventDefault(); }
      if (e.key === "ArrowUp") { act("t+"); e.preventDefault(); }
      if (e.key === "ArrowDown") { act("t-"); e.preventDefault(); }
      if (e.key === "t") { const next = Array.from({ length: hours() }, (_, k) => k).find((k) => !S.laid[k]); if (next !== undefined) layTide(next); }
      if (e.key === "[" && S.sel >= 0) { stirBy(S.sel, -5); render(); }
      if (e.key === "]" && S.sel >= 0) { stirBy(S.sel, 5); render(); }
    };
    addEventListener("keydown", onKey);
    render();
    const b = how.querySelector("button");
    b.addEventListener("click", () => { how.remove(); S.msg = "Lay a heading on the rose. The tide will set you south-east; aim off."; render(); });
    b.focus();
    return { unmount() { removeEventListener("keydown", onKey); S.over = true; } };
  },
};

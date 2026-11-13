// Project: Man Eater — The Chart (1D, self-diagnosis). Graphic style: medical graph paper.
// DESIGN.md section 11.3, cut to four mornings (days 2 to 5) of one run: an eater who eats 3, 5, 6
// and 6 pieces and swallows the pill. Measurements use the formulas in 11.3. Each morning asks one
// question; the player selects at least two cells that show a trend, picks the hypothesis card and
// rules it Supported or Broken. A correct ruling strikes the list entry. One retry per day.

const P = { ink: "#1B1D1F", paper: "#f3efe3", grid: "#9fbfa6", red: "#9b2f22", steel: "#8A8F93", desk: "#3a2c22", sodium: "#D9A441", bruise: "#5A4F5E" };
const PIECES_BY_DAY = [3, 5, 6, 6]; // eaten on days 1..4
const CH = [0]; for (const p of PIECES_BY_DAY) CH.push(CH[CH.length - 1] + 2 * p + 3); // change on mornings D1..D5
const HUNGER = [2, 4, 6, 7, 8];
const f1 = (v) => v.toFixed(1);
const ROWS = [
  { id: "weight", label: "Weight (kg)", v: (d) => f1(82 - 0.35 * CH[d]) },
  { id: "height", label: "Height (cm)", v: (d) => f1(178 + 1.6 * CH[d]) },
  { id: "temp", label: "Core temp (C)", v: (d) => f1(36.8 - 0.04 * CH[d]) },
  { id: "pulse", label: "Resting pulse", v: (d) => String(Math.round(64 - 0.3 * CH[d])) },
  { id: "grip", label: "Grip (kg)", v: (d) => String(Math.round(45 + 0.9 * CH[d])) },
  { id: "stride", label: "Stride (cm)", v: (d) => String(Math.round(75 + 0.7 * CH[d])) },
  { id: "pieces", label: "Ration pieces yest.", v: (d) => (d === 0 ? "—" : String(PIECES_BY_DAY[d - 1])) },
  { id: "pills", label: "Pills yest.", v: (d) => (d === 0 ? "—" : "1") },
  { id: "hunger", label: "Hunger, self (1–10)", v: (d) => String(HUNGER[d]) },
  { id: "target", label: "TARGET (printed)", from: 4 },
];
const targetVal = (c) => f1(178 + 1.6 * (c <= 4 ? CH[c] : CH[4] + 15 * (c - 4)) + (c === 0 ? 0 : c % 2 ? 0.4 : -0.3));
const LIST = [
  { id: "L2", text: "Crew look “sick and slightly anorexic”", why: "Seen worse" },
  { id: "L7", text: "The meal makes me hungrier", why: "Climate, body adjusts" },
  { id: "L9", text: "Height measured every day", why: "Routine" },
];
const DAYS = [
  { d: 1, q: "Is it the climate?", card: "Climate", list: "L2", rows: ["weight", "height"], need: ["height"], cols: [0, 1], days: 1, say: "Down again. Up again.",
    hint: "A climate can make a man thin. Can it make him taller overnight?", cards: ["Climate", "Bad posting", "Flu going round", "Old age"] },
  { d: 2, q: "Is it the food?", card: "Not the food", list: "L7", rows: ["pieces", "height"], need: ["pieces", "height"], cols: [0, 1, 2], days: 2, say: "Up again.",
    hint: "Set the pieces you ate beside how much you grew, two days running.", cards: ["Not the food", "Climate", "Ventilation", "Bad meat"] },
  { d: 3, q: "Am I hungrier the more I eat?", card: "It fills me", list: "L7", rows: ["pieces", "hunger"], need: ["pieces", "hunger"], cols: [0, 1, 2, 3], days: 2, say: "Up again.",
    hint: "If it filled you, hunger would fall as the pieces rose.", cards: ["It fills me", "Not the food", "Sedative", "Routine"] },
  { d: 4, q: "Is this routine?", card: "Routine", list: "L9", rows: ["height", "target"], need: ["height", "target"], cols: [1, 2, 3, 4], days: 1, say: "On schedule.",
    hint: "The second sheet has a printed curve. Who prints a curve for a routine check?", cards: ["Routine", "Cold-weather study", "Vitamins", "Bad boilers"] },
];

export default {
  mount(root, api) {
    const K = "man-eater-chart-";
    const reduce = api.reducedMotion;
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, reduce ? 0 : ms); timers.push(t); };
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:${P.desk};background-image:repeating-linear-gradient(95deg,rgba(0,0,0,.12) 0 2px,transparent 2px 9px);color:${P.ink};font-family:'Courier Prime','Courier New',monospace}
      .${K}board{position:relative;max-width:1060px;margin:18px auto;padding:34px 16px 16px;background:${P.paper};box-shadow:0 18px 40px rgba(0,0,0,.55);box-sizing:border-box;width:calc(100% - 24px)}
      .${K}clip{position:absolute;left:50%;top:-12px;transform:translateX(-50%);width:160px;height:30px;background:${P.steel};border-radius:6px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)}
      .${K}head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:13px;letter-spacing:.06em;margin-bottom:8px}
      .${K}main{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:14px}
      .${K}grid{width:100%;border-collapse:collapse;font-size:12.5px;background-color:#f6f3ea;background-image:linear-gradient(${P.grid}55 1px,transparent 1px),linear-gradient(90deg,${P.grid}55 1px,transparent 1px);background-size:10px 10px}
      .${K}grid th,.${K}grid td{border:1px solid ${P.grid};padding:4px 5px;text-align:center;white-space:nowrap}
      .${K}grid th:first-child{text-align:left;font-weight:400}
      .${K}grid td button{all:unset;cursor:pointer;display:block;min-width:2.6em;min-height:1.4em;border-radius:2px}
      .${K}grid td button:focus-visible{outline:2px solid ${P.sodium}}
      .${K}grid td button.sel{text-decoration:underline 2px ${P.red};text-underline-offset:3px;background:rgba(155,47,34,.08)}
      .${K}grid td.cur,.${K}grid th.cur{outline:2px solid ${P.sodium};outline-offset:-2px}
      .${K}grid tr.tgt{color:${P.red};font-style:italic}
      .${K}grid .pencil{color:${P.red};font-weight:700;margin-left:2px}
      .${K}plot{width:100%;height:auto;display:block;margin-bottom:8px;background:#f6f3ea}
      .${K}list{border-left:2px solid ${P.red};padding-left:12px;font-family:'Special Elite','Courier Prime',monospace;font-size:14px}
      .${K}list h4{margin:0 0 6px;font-family:'Courier Prime',monospace;letter-spacing:.14em;font-size:12px}
      .${K}list li{margin:0 0 10px;list-style:none}
      .${K}list ul{padding:0;margin:0}
      .${K}list s{color:${P.bruise}}
      .${K}list em{color:${P.red};font-style:normal;display:block;font-size:12.5px}
      .${K}q{margin:12px 0 6px;font-size:16px;font-weight:700}
      .${K}cards{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}
      .${K}cards button,.${K}acts button,.${K}intro button{font:inherit;min-height:42px;padding:8px 14px;cursor:pointer;border:1.5px solid ${P.ink};background:#fffdf6;letter-spacing:.06em;text-transform:uppercase}
      .${K}cards button[aria-pressed=true]{background:${P.ink};color:${P.paper}}
      .${K}acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}
      .${K}acts button.go{background:${P.ink};color:${P.paper}}
      .${K}acts button[disabled]{opacity:.35;cursor:not-allowed}
      .${K}cards button:focus-visible,.${K}acts button:focus-visible,.${K}intro button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}say{font-size:13.5px;min-height:1.4em;flex:1 1 240px}
      .${K}stamp{display:inline-block;border:2px solid ${P.red};color:${P.red};padding:0 5px;transform:rotate(-6deg);font-weight:700;letter-spacing:.1em;font-size:12px}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(58,44,34,.85);z-index:5;padding:16px}
      .${K}panel{max-width:560px;background:${P.paper};padding:22px;box-shadow:0 18px 40px rgba(0,0,0,.5)}
      .${K}panel h2{margin:0 0 8px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:30px;letter-spacing:.06em;text-transform:uppercase}
      .${K}panel p{margin:0 0 10px;font-size:14.5px;line-height:1.45}
      .${K}scroll{overflow-x:auto}
      @media (max-width:760px){.${K}main{grid-template-columns:minmax(0,1fr)}}
    </style>
    <div class="${K}board"><div class="${K}clip"></div>
      <div class="${K}head"><span>CASE 7-F · FISK · INFIRMARY</span><span class="${K}day">DAY 2</span><span>WARD B</span></div>
      <div class="${K}main">
        <div><svg class="${K}plot" viewBox="0 0 600 150" aria-label="Height plotted by day"></svg><div class="${K}scroll"><table class="${K}grid"></table></div></div>
        <div class="${K}list"><h4>THE LIST · IN FISK'S HAND</h4><ul></ul></div>
      </div>
      <div class="${K}q" aria-live="polite"></div>
      <div class="${K}cards" role="group" aria-label="Hypothesis cards"></div>
      <div class="${K}acts"><button type="button" data-r="sup">Supported</button><button type="button" data-r="brk">Broken</button><span class="${K}say" aria-live="polite"></span><button type="button" class="go" data-next hidden>Next</button></div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <h2>The Chart</h2>
      <p>Four mornings in the infirmary. The orderly reads your measurements into the day's column. You are the evidence.</p>
      <p>Each morning asks one question. <b>Select at least two cells that show the trend</b>, pick the hypothesis card the question tests, and rule it Supported or Broken. A correct ruling strikes your explanation off the list. One retry a day.</p>
      <button type="button" data-start>Morning, day 2</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const grid = $("grid"), plot = $("plot"), qEl = $("q"), cardsEl = $("cards"), sayEl = $("say"), listUl = $("list").querySelector("ul");
    const nextBtn = wrap.querySelector("[data-next]"), rBtns = [...wrap.querySelectorAll("[data-r]")];
    const intro = $("intro");

    let di = 0, shown = 0, sel = new Set(), card = null, tries = 0, idle = 0, hintAt = null, solved = [], broken = {}, filling = false;
    const day = () => DAYS[di];

    function renderGrid() {
      const D = day();
      const cols = [0, 1, 2, 3, 4, 5, 6];
      let h = `<thead><tr><th scope="col"></th>${cols.map((c) => `<th scope="col" class="${c === D.d ? "cur" : ""}">D${c + 1}</th>`).join("")}</tr></thead><tbody>`;
      for (const r of ROWS) {
        if (r.from != null && D.d < r.from) continue;
        h += `<tr class="${r.id === "target" ? "tgt" : ""}"><th scope="row">${r.label}</th>`;
        for (const c of cols) {
          // the target is a printed sheet: every column is already filled in
          const val = r.id === "target" ? targetVal(c) : c < D.d || (c === D.d && shown > ROWS.indexOf(r)) ? r.v(c) : "";
          const key = `${r.id}:${c}`;
          const pencil = hintAt === key ? `<span class="pencil" aria-label="Fisk's pencil hovers here">✎</span>` : "";
          h += `<td class="${c === D.d ? "cur" : ""}">${val ? `<button type="button" data-k="${key}" class="${sel.has(key) ? "sel" : ""}" aria-pressed="${sel.has(key)}" aria-label="${r.label}, day ${c + 1}: ${val}">${val}</button>${pencil}` : ""}</td>`;
        }
        h += "</tr>";
      }
      grid.innerHTML = h + "</tbody>";
      grid.querySelectorAll("button[data-k]").forEach((b) => b.addEventListener("click", () => {
        if (filling) return;
        const k = b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); idle = 0; renderGrid(); grid.querySelector(`[data-k="${k}"]`)?.focus();
      }));
    }
    function renderPlot() {
      const D = day();
      const x = (d) => 50 + d * 85, y = (v) => 140 - ((v - 170) / (300 - 170)) * 125;
      let s = `<rect width="600" height="150" fill="#f6f3ea"/>`;
      for (let v = 170; v <= 300; v += 10) s += `<line x1="40" x2="590" y1="${y(v)}" y2="${y(v)}" stroke="${P.grid}" stroke-width="${v % 50 === 0 ? 1.2 : 0.5}"/>${v % 30 === 0 ? `<text x="34" y="${y(v) + 4}" font-size="10" text-anchor="end" font-family="Courier Prime,monospace">${v}</text>` : ""}`;
      for (let d = 0; d < 7; d++) s += `<line x1="${x(d)}" x2="${x(d)}" y1="12" y2="140" stroke="${P.grid}" stroke-width=".8"/><text x="${x(d)}" y="149" font-size="10" text-anchor="middle" font-family="Courier Prime,monospace">D${d + 1}</text>`;
      s += `<text x="44" y="11" font-size="11" font-family="Courier Prime,monospace">HT (cm)</text>`;
      if (D.d >= 4) {
        const pts = [0, 1, 2, 3, 4, 5, 6].map((d) => `${x(d)},${y(178 + 1.6 * (d <= 4 ? CH[d] : CH[4] + 15 * (d - 4)))}`);
        s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${P.red}" stroke-width="2" stroke-dasharray="6 4"/><text x="${x(6) - 4}" y="${y(178 + 1.6 * (CH[4] + 30)) + 14}" font-size="11" fill="${P.red}" text-anchor="end" font-family="Courier Prime,monospace">TARGET</text>`;
      }
      const upto = shown > 1 ? D.d : D.d - 1;
      const pts = []; for (let d = 0; d <= upto; d++) pts.push([x(d), y(178 + 1.6 * CH[d])]);
      if (pts.length > 1) s += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${P.ink}" stroke-width="2"/>`;
      for (const [px, py] of pts) s += `<path d="M${px - 4},${py - 4}L${px + 4},${py + 4}M${px + 4},${py - 4}L${px - 4},${py + 4}" stroke="${P.ink}" stroke-width="1.6"/>`;
      plot.innerHTML = s;
    }
    function renderList() {
      listUl.innerHTML = LIST.map((l) => {
        const b = broken[l.id];
        return `<li><b>${l.id}</b> ${l.text}<br>→ ${b ? `<s>${l.why}</s><em>${b}</em>` : l.why}</li>`;
      }).join("");
    }
    function renderCards() {
      cardsEl.innerHTML = day().cards.map((c) => `<button type="button" aria-pressed="${card === c}">${c}</button>`).join("");
      cardsEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { if (filling) return; card = b.textContent; idle = 0; renderCards(); cardsEl.querySelector('[aria-pressed="true"]').focus(); }));
    }
    function startDay() {
      const D = day();
      sel = new Set(); card = null; tries = 0; idle = 0; hintAt = null; shown = 0; filling = true;
      $("day").textContent = `DAY ${D.d + 1}`;
      qEl.textContent = "";
      sayEl.textContent = "The orderly reads the numbers aloud.";
      nextBtn.hidden = true; rBtns.forEach((b) => (b.disabled = true));
      renderCards(); renderList(); renderGrid(); renderPlot();
      const fill = () => {
        shown++;
        renderGrid(); renderPlot();
        if (shown < ROWS.length) return later(fill, 140);
        filling = false;
        sayEl.textContent = `Orderly: “${D.say}”`;
        qEl.textContent = `Question: ${D.q}`;
        rBtns.forEach((b) => (b.disabled = false));
        grid.querySelector("button[data-k]")?.focus();
      };
      later(fill, 300);
    }
    function rule(r) {
      if (filling || nextBtn.hidden === false) return;
      const D = day();
      if (sel.size < 2) { sayEl.textContent = "Select at least two cells that show it."; return; }
      if (!card) { sayEl.textContent = "Pick the hypothesis card you are ruling on."; return; }
      const cells = [...sel].map((k) => { const [row, c] = k.split(":"); return { row, c: +c }; });
      const cellsOk = cells.every((x) => D.rows.includes(x.row) && D.cols.includes(x.c)) && D.need.every((n) => cells.some((x) => x.row === n)) && new Set(cells.map((x) => x.c)).size >= D.days + (D.days > 1 ? 0 : 0);
      const ok = cellsOk && card === D.card && r === "brk";
      if (ok) {
        broken[D.list] = (broken[D.list] ? broken[D.list] + "; " : "") + `${D.q.replace("?", "")}: no. ${cells.map((x) => `${x.row} D${x.c + 1}`).join(", ")}`;
        solved.push(D.d);
        sayEl.innerHTML = `<span class="${K}stamp">BROKEN</span> “${D.card}” does not hold. Struck through, with the evidence beside it.`;
        renderList(); done();
        return;
      }
      tries++;
      const why = card !== D.card ? "That card is not what this morning's question tests." : r !== "brk" ? "The cells say otherwise. Look at which way they move." : "Those cells do not show it.";
      if (tries < 2) { sayEl.textContent = `${why} One retry.`; return; }
      sayEl.textContent = `${why} Fisk shelves it: “${LIST.find((l) => l.id === D.list).why}” stands.`;
      done();
    }
    function done() {
      rBtns.forEach((b) => (b.disabled = true));
      sayEl.insertAdjacentText("beforeend", " Orderly: “Next.”");
      nextBtn.hidden = false; nextBtn.textContent = di < DAYS.length - 1 ? `Morning, day ${DAYS[di + 1].d + 1}` : "Close the chart";
      nextBtn.focus();
    }
    const onNext = () => {
      if (di < DAYS.length - 1) { di++; startDay(); return; }
      const n = solved.length;
      const knows = n >= 3 ? "pattern" : "anomaly";
      if (n >= 3) api.end({ outcome: "win", text: `${n} of 4 explanations broken. Your own numbers keep to a printed curve: “on schedule”. Fisk knows it is a pattern (knows: ${knows}).` });
      else api.end({ outcome: "lose", text: `${n} of 4 broken. Fisk shelved the rest; the explanations stand, and the chart keeps to its curve without him reading it (knows: ${knows}).` });
    };
    nextBtn.addEventListener("click", onNext);
    rBtns.forEach((b) => b.addEventListener("click", () => rule(b.dataset.r)));
    // the hint: at clarity tier 1 Fisk's pencil hovers over a telling cell after a while
    const hintTimer = setInterval(() => {
      if (filling || !nextBtn.hidden || intro.isConnected) return;
      idle++;
      if (idle === 25 && !hintAt) { const D = day(); hintAt = `${D.need[0]}:${D.d}`; renderGrid(); sayEl.textContent = D.hint; }
    }, 1000);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); startDay(); };
    startBtn.addEventListener("click", start);
    renderGrid(); renderPlot(); renderList(); renderCards();
    rBtns.forEach((b) => (b.disabled = true));
    timers.push(setTimeout(() => startBtn.focus(), 30));

    return {
      unmount() {
        timers.forEach(clearTimeout); clearInterval(hintTimer);
        wrap.remove();
      },
    };
  },
};

// Behind the Peephole / The Statement (1D, logic grid). Style: carbon-copy typewriter form.
// One morning: night one's statement, Room x Place (DESIGN.md section 11, `n1_statement`), from
// games/behind-the-peephole/data/truth.json and beats.json. Cut: categories reduced to one grid
// (as night one is); no false signs on night one, so a second look never shows a tell.

const ROOMS = ["r401", "r402", "r403", "r404", "r405", "r406"];
const RETURN = { r402: "23:25", r406: "00:05", r404: "00:45", r401: "01:30", r405: "02:05", r403: "02:45" };
const PLACES = [
  { id: "glasshouse", name: "The Glasshouse", short: "GLASS" },
  { id: "printworks", name: "The Printworks", short: "PRINT" },
  { id: "assembly", name: "The Assembly Rooms", short: "ASSMB" },
  { id: "bonded", name: "The Bonded House", short: "BONDD" },
  { id: "depot", name: "The tram depot", short: "DEPOT" },
  { id: "fishmarket", name: "The fish market", short: "FISH" },
];
const TRUTH = { r402: "glasshouse", r406: "printworks", r404: "assembly", r401: "bonded", r405: "depot", r403: "fishmarket" };
const ENDS = { glasshouse: "23:00", printworks: "23:30", assembly: "00:30", fishmarket: "02:15" };
// Clue cards held this morning. `fix` ties a room to a place; `end` is a paper's closing time.
const CLUES = [
  { id: "o.n1.guest_cards", src: "office", text: "Six guest cards, one line each: 401 a soldier for hire, 402 a whistleblower, 403 an art thief, 404 an undercover journalist, 405 a hacker, 406 an activist." },
  { id: "o.city", src: "office", text: "The city's traces: red clay on the Bonded House embankment; ink at the Printworks; grease at the tram depot; pollen and warm damp at the Glasshouse; salt rime at the fish market; gold leaf at the Assembly Rooms." },
  { id: "o.n1.lew", src: "told", text: "Lew: \"Nowhere in this town's more than half an hour from here.\"" },
  { id: "o.n1.paper_glasshouse", src: "paper", text: "Evening paper: the Glasshouse late opening ends 23:00.", end: "glasshouse" },
  { id: "o.n1.paper_printworks", src: "paper", text: "Evening paper: the Printworks night run ends 23:30.", end: "printworks" },
  { id: "o.n1.paper_assembly", src: "paper", text: "Evening paper: the Assembly Rooms gala rehearsal ends 00:30.", end: "assembly" },
  { id: "o.n1.paper_fishmarket", src: "paper", text: "Evening paper: fish market trade ends 02:15.", end: "fishmarket" },
  { id: "c.n1.r401.clay", src: "401", text: "Red clay on his collar and knees.", fix: ["r401", "bonded"] },
  { id: "c.n1.r403.salt", src: "403", text: "Salt rime on her boots; she smells her gloves.", fix: ["r403", "fishmarket"] },
  { id: "c.n1.r406.ink", src: "406", text: "Ink on her fingertips; she scrubs at the sink.", fix: ["r406", "printworks"] },
  { id: "c.n1.r406.leaflets", src: "406", text: "A tube of rolled leaflets.", fix: ["r406", "printworks"] },
  { id: "c.n1.r402.tv", src: "402", text: "A game show, loud." },
  { id: "c.n1.r404.ritual", src: "404", text: "Pours a miniature into the sink; writes \"400\" on the notepad." },
  { id: "c.n1.r405.ritual", src: "405", text: "Dry cereal from the box." },
];
const mins = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
// A row agrees with a clue unless the clue rules it out on its own.
function disagreeing(room, place) {
  const out = [];
  for (const c of CLUES) {
    if (c.fix) {
      const [r, p] = c.fix;
      if ((r === room && p !== place) || (r !== room && p === place)) out.push(c);
    }
    if (c.end && c.end === place) {
      const d = mins(RETURN[room]) - mins(ENDS[place]);
      if (d < 0 || d > 45) out.push(c);
    }
  }
  return out;
}

export default {
  mount(root, api) {
    const P = "behind-the-peephole-statement-";
    const C = { paper: "#efe6cf", carbon: "#2a3a8c", ink: "#1c1a17", brass: "#b8913f", ev: "#a3302a", bottle: "#1f3d2c" };
    const style = document.createElement("style");
    style.textContent = `
    .${P}page{position:absolute;inset:0;overflow:auto;background:${C.bottle};font-family:"Courier New",Courier,"IBM Plex Mono",monospace;color:${C.carbon}}
    .${P}sheet{margin:14px auto 90px;max-width:1180px;width:calc(100% - 24px);background:${C.paper};box-shadow:0 8px 30px #0008;padding:18px clamp(12px,3vw,34px) 26px;position:relative;
      background-image:radial-gradient(ellipse at 20% 30%,rgba(42,58,140,.10),transparent 40%),radial-gradient(ellipse at 80% 75%,rgba(42,58,140,.08),transparent 45%),repeating-linear-gradient(0deg,transparent 0 27px,rgba(42,58,140,.06) 27px 28px)}
    .${P}head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 20px;border-bottom:1.5px solid ${C.carbon};padding-bottom:8px;margin-bottom:12px;letter-spacing:.08em}
    .${P}head b{font-size:clamp(15px,2vw,20px)}
    .${P}cols{display:grid;grid-template-columns:auto minmax(0,1fr);gap:26px}
    @media (max-width:820px){.${P}cols{grid-template-columns:1fr}}
    .${P}grid{border-collapse:collapse;margin:0;font-size:13px}
    .${P}gwrap{padding-right:70px;overflow-x:auto}
    .${P}grid th{font-weight:700;padding:2px 3px}
    .${P}grid th.c{height:116px;vertical-align:bottom;width:44px;min-width:44px;max-width:44px;position:relative;padding:0}
    .${P}grid th.c span{position:absolute;left:24px;bottom:6px;transform:rotate(-55deg);transform-origin:left bottom;white-space:nowrap}
    @media (max-width:520px){.${P}gwrap{padding-right:40px}.${P}grid td,.${P}grid th.c{width:38px;min-width:38px;max-width:38px}.${P}grid th.c span{left:20px;font-size:11px}}
    .${P}grid th.r{text-align:left;white-space:nowrap;padding-right:8px}
    .${P}grid th.r small{display:block;font-weight:400;font-size:11px;opacity:.8}
    .${P}grid td{width:44px;height:40px;border:1.3px solid ${C.carbon};text-align:center;font-size:22px;cursor:pointer;user-select:none;position:relative}
    .${P}grid td.hl{background:rgba(224,162,74,.28)}
    .${P}grid td.cur{outline:2.5px dashed ${C.ev};outline-offset:-5px}
    .${P}grid td.x{color:rgba(42,58,140,.6);font-size:18px}
    .${P}grid tr.struck td,.${P}grid tr.struck th small{text-decoration:line-through;opacity:.55}
    .${P}grid tr.inked td.t{background:${C.carbon};color:${C.paper}}
    .${P}grid tr .stamp{position:absolute}
    .${P}rowmark{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;white-space:nowrap}
    .${P}rowmark.ok{color:${C.ev};border:2px solid ${C.ev};padding:0 3px;transform:rotate(-6deg);display:inline-block;opacity:.85}
    .${P}clues{max-height:min(46vh,420px);overflow:auto;display:grid;gap:8px;padding:4px 6px 4px 0}
    .${P}card{background:#fbf6e8;border:1px solid #c9bc98;padding:7px 9px;font-size:13px;line-height:1.35;color:${C.ink};cursor:pointer;text-align:left;font-family:inherit;box-shadow:1px 2px 0 #0001}
    .${P}card.on{border-color:${C.ev};box-shadow:0 0 0 2px rgba(163,48,42,.3)}
    .${P}card small{display:block;color:${C.carbon};letter-spacing:.12em;font-size:10.5px;margin-bottom:2px}
    .${P}card.paper{font-family:"Courier New",monospace}
    .${P}card.beat{font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive}
    .${P}words{margin-top:12px;font-size:13.5px;line-height:1.55;min-height:6em;border-top:1px dashed ${C.carbon};padding-top:8px}
    .${P}words p{margin:0}
    .${P}words .empty{opacity:.5}
    .${P}btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
    .${P}btn{font:inherit;font-weight:700;letter-spacing:.08em;color:${C.carbon};background:transparent;border:1.6px solid ${C.carbon};padding:7px 12px;cursor:pointer;min-height:38px}
    .${P}btn:hover,.${P}btn:focus-visible{background:rgba(42,58,140,.12)}
    .${P}btn[disabled]{opacity:.4;cursor:default}
    .${P}btn.sign{color:${C.ev};border-color:${C.ev}}
    .${P}msg{font-size:13px;color:${C.ink};min-height:1.4em;margin-top:8px}
    .${P}stamp{position:absolute;right:6%;bottom:18px;border:4px double ${C.ev};color:${C.ev};font-weight:700;font-size:clamp(20px,3vw,32px);letter-spacing:.14em;padding:4px 14px;transform:rotate(-8deg);opacity:.8;pointer-events:none}
    .${P}foot{font-size:10.5px;opacity:.6;margin-top:16px;letter-spacing:.08em}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,39,28,.86);z-index:5;padding:16px}
    .${P}intro div{background:${C.paper};max-width:520px;padding:20px 22px;color:${C.ink};font-size:14px;line-height:1.5;border-top:6px solid ${C.carbon}}
    .${P}intro h2{margin:0 0 8px;color:${C.carbon};letter-spacing:.1em;font-size:18px}
    .${P}opt{font-size:12px;display:flex;gap:6px;align-items:center}
    `;
    root.appendChild(style);
    const page = document.createElement("div");
    page.className = P + "page";
    root.appendChild(page);

    const state = {}; // room -> place -> 0 blank | 1 cross | 2 tick
    for (const r of ROOMS) { state[r] = {}; for (const p of PLACES) state[r][p.id] = 0; }
    let autoCross = true, looks = 2, signed = false, cur = [0, 0], hl = new Set(), activeClue = null;
    const listeners = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };

    page.innerHTML = `
      <div class="${P}sheet">
        <div class="${P}head"><b>THE CROSSING · NIGHT LOG · STATEMENT</b><span>NIGHT 1 · CATEGORIES: ROOM × PLACE · COPY 2 OF 2</span></div>
        <div class="${P}cols">
          <div>
            <div class="${P}gwrap"><table class="${P}grid" role="grid" aria-label="Room by place grid"></table></div>
            <div class="${P}btns">
              <label class="${P}opt"><input type="checkbox" checked> a tick crosses its row and column</label>
            </div>
            <div class="${P}words" aria-live="polite"></div>
          </div>
          <div>
            <div style="font-weight:700;letter-spacing:.1em;margin-bottom:6px">CLUE CARDS · TAP ONE TO MARK THE CELLS IT BEARS ON</div>
            <div class="${P}clues"></div>
            <div class="${P}btns">
              <button type="button" class="${P}btn" data-a="look">SECOND LOOK (2)</button>
              <button type="button" class="${P}btn sign" data-a="sign">SIGN ✒</button>
            </div>
            <div class="${P}msg" aria-live="polite"></div>
          </div>
        </div>
        <div class="${P}foot">COPY · NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT · RETURN TIMES ARE THE VALET BELL</div>
      </div>
      <div class="${P}intro"><div>
        <h2>THE STATEMENT</h2>
        <p>Wren wants a signed statement: where did each guest go tonight? Tap a cell to cycle blank → ✕ → ✓. Tap a clue card to see which cells it bears on.</p>
        <p>Sign once. Correct rows are inked and stamped; wrong ones are struck through. Two <b>second looks</b> tell you whether a row agrees with your cards. Arrow keys and Space work too.</p>
        <button type="button" class="${P}btn" data-a="start">START</button>
      </div></div>`;
    const $ = (s) => page.querySelector(s);
    const table = $("." + P + "grid"), words = $("." + P + "words"), msg = $("." + P + "msg");
    const lookBtn = page.querySelector('[data-a="look"]'), signBtn = page.querySelector('[data-a="sign"]');

    // build grid
    const hr = document.createElement("tr");
    hr.innerHTML = `<th></th>` + PLACES.map((p) => `<th class="c" scope="col"><span title="${p.name}">${p.name.replace("The ", "").toUpperCase()}</span></th>`).join("");
    table.appendChild(hr);
    const cells = {};
    ROOMS.forEach((r, ri) => {
      const tr = document.createElement("tr");
      tr.dataset.room = r;
      const th = document.createElement("th");
      th.className = "r"; th.scope = "row";
      th.innerHTML = `${r.slice(1)}<small>bell ${RETURN[r]}</small>`;
      tr.appendChild(th);
      PLACES.forEach((p, pi) => {
        const td = document.createElement("td");
        td.setAttribute("role", "gridcell");
        td.setAttribute("aria-label", `${r.slice(1)} ${p.name}`);
        td.dataset.r = ri; td.dataset.p = pi;
        cells[r + p.id] = td;
        tr.appendChild(td);
      });
      const mark = document.createElement("span");
      mark.className = P + "rowmark";
      th.appendChild(mark);
      table.appendChild(tr);
    });

    const clueBox = $("." + P + "clues");
    CLUES.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `${P}card ${c.src === "office" || c.src === "paper" || c.src === "told" ? "paper" : "beat"}`;
      b.innerHTML = `<small>${c.src === "office" ? "OFFICE" : c.src === "paper" ? "EVENING PAPER" : c.src === "told" ? "TOLD" : "SEEN · ROOM " + c.src}</small>`;
      b.appendChild(document.createTextNode(c.text));
      b.dataset.id = c.id;
      clueBox.appendChild(b);
    });

    function bears(c) {
      const s = new Set();
      if (c.fix) { for (const p of PLACES) s.add(c.fix[0] + p.id); for (const r of ROOMS) s.add(r + c.fix[1]); }
      if (c.end) for (const r of ROOMS) s.add(r + c.end);
      if (c.id === "o.city") for (const r of ROOMS) for (const p of PLACES) s.add(r + p.id);
      return s;
    }

    function rowTick(r) { return PLACES.find((p) => state[r][p.id] === 2); }

    function draw() {
      ROOMS.forEach((r, ri) => PLACES.forEach((p, pi) => {
        const td = cells[r + p.id], v = state[r][p.id];
        td.textContent = v === 2 ? "✓" : v === 1 ? "✕" : "";
        td.className = (v === 1 ? "x " : v === 2 ? "t " : "") + (hl.has(r + p.id) ? "hl " : "") + (cur[0] === ri && cur[1] === pi && !signed ? "cur" : "");
      }));
      const lines = ROOMS.filter((r) => rowTick(r)).map((r) => {
        const p = rowTick(r);
        return `<p>Room ${r.slice(1)} went to ${p.name.replace(/^The/, "the")} and came back at ${RETURN[r]}.</p>`;
      });
      words.innerHTML = lines.length ? lines.join("") : `<p class="empty">Room ___ went to ______ and came back at __:__.</p>`;
      lookBtn.textContent = `SECOND LOOK (${looks})`;
      lookBtn.disabled = signed || looks <= 0;
      signBtn.disabled = signed;
    }

    function cycle(ri, pi) {
      if (signed) return;
      const r = ROOMS[ri], p = PLACES[pi].id;
      const v = (state[r][p] + 1) % 3;
      state[r][p] = v;
      if (v === 2 && autoCross) {
        for (const q of PLACES) if (q.id !== p && state[r][q.id] !== 2) state[r][q.id] = 1;
        for (const s of ROOMS) if (s !== r && state[s][p] !== 2) state[s][p] = 1;
      }
      cur = [ri, pi];
      draw();
    }

    let lookMode = false;
    on(table, "click", (e) => {
      const td = e.target.closest("td[data-r]");
      if (!td) return;
      const ri = +td.dataset.r, pi = +td.dataset.p;
      if (lookMode) { secondLook(ROOMS[ri]); return; }
      cycle(ri, pi);
    });
    on(clueBox, "click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      clueBox.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b && activeClue !== b.dataset.id));
      if (activeClue === b.dataset.id) { activeClue = null; hl = new Set(); }
      else { activeClue = b.dataset.id; hl = bears(CLUES.find((c) => c.id === b.dataset.id)); }
      draw();
    });
    on(page.querySelector(`.${P}opt input`), "change", (e) => { autoCross = e.target.checked; });

    function secondLook(r) {
      lookMode = false;
      const p = rowTick(r);
      if (!p) { msg.textContent = `Room ${r.slice(1)} has no tick yet. Pick a row with a tick.`; draw(); return; }
      looks--;
      const bad = disagreeing(r, p.id);
      msg.textContent = bad.length
        ? `Second look, ${r.slice(1)}: does NOT agree with every card. This one disagrees: “${bad[0].text}”`
        : `Second look, ${r.slice(1)}: agrees with every card you hold. (That is not the same as true.)`;
      draw();
    }
    on(lookBtn, "click", () => {
      if (signed || looks <= 0) return;
      lookMode = true;
      msg.textContent = "Second look: tap any cell in the row you want checked (or press L on the current row).";
    });

    function sign() {
      if (signed) return;
      signed = true;
      let correct = 0;
      ROOMS.forEach((r) => {
        const tr = table.querySelector(`tr[data-room="${r}"]`);
        const p = rowTick(r);
        const ok = p && p.id === TRUTH[r];
        const mark = tr.querySelector("." + P + "rowmark");
        if (ok) { correct++; tr.classList.add("inked"); mark.textContent = "ENTERED"; mark.classList.add("ok"); }
        else { tr.classList.add("struck"); mark.textContent = p ? "" : "INCOMPLETE"; }
      });
      draw();
      const stamp = document.createElement("div");
      stamp.className = P + "stamp";
      stamp.textContent = `NIGHT 1 · ${correct}/6`;
      page.querySelector("." + P + "sheet").appendChild(stamp);
      msg.textContent = "Signed. The page does not say what the right answers were.";
      api.store.set("best", Math.max(api.store.get("best", 0), correct));
      later(() => api.end({
        outcome: correct === 6 ? "win" : correct >= 4 ? "done" : "lose",
        text: correct === 6
          ? "Six rows inked and stamped. Every return placed. The pages go down the chute at 05:00."
          : `${correct} of 6 rows inked and stamped. The rest stay in pencil, struck through, and go down the chute anyway.`,
      }), 1400);
    }
    on(signBtn, "click", sign);

    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    on(window, "keydown", (e) => {
      if (page.querySelector("." + P + "intro")) return;
      if (signed) return;
      const k = e.key;
      if (k === "ArrowUp" || k === "ArrowDown" || k === "ArrowLeft" || k === "ArrowRight") {
        e.preventDefault();
        if (k === "ArrowUp") cur[0] = (cur[0] + 5) % 6;
        if (k === "ArrowDown") cur[0] = (cur[0] + 1) % 6;
        if (k === "ArrowLeft") cur[1] = (cur[1] + 5) % 6;
        if (k === "ArrowRight") cur[1] = (cur[1] + 1) % 6;
        draw();
      } else if ((k === " " || k === "Enter") && document.activeElement && !/BUTTON|INPUT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (lookMode) secondLook(ROOMS[cur[0]]); else cycle(cur[0], cur[1]);
      } else if (k === "l" || k === "L") {
        if (looks > 0) secondLook(ROOMS[cur[0]]);
      }
    });

    on(page.querySelector('[data-a="start"]'), "click", () => { page.querySelector("." + P + "intro").remove(); draw(); });
    draw();
    page.querySelector('[data-a="start"]').focus();

    return {
      unmount() {
        timers.forEach(clearTimeout);
        for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
  },
};

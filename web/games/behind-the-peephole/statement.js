// Behind the Peephole / The Statement (1D, logic grid). Style: carbon-copy typewriter form.
// One morning: night one's statement, Room x Place (DESIGN.md section 11, `n1_statement`), from
// games/behind-the-peephole/data/truth.json and beats.json. Cut: categories reduced to one grid
// (as night one is); no false signs on night one, so a second look never shows a tell.
// Actions: MARK a cell (blank, cross, tick), CONSULT a clue card (it marks the cells it bears on),
// SECOND LOOK at a row (two, from the first tick) and SIGN. Phases: the office cards; Lew's note
// arrives once three rows are ticked; signing inks the rows one by one.

const ROOMS = ["r401", "r402", "r403", "r404", "r405", "r406"];
const RETURN = { r402: "23:25", r406: "00:05", r404: "00:45", r401: "01:30", r405: "02:05", r403: "02:45" };
const PLACES = [
  { id: "glasshouse", name: "The Glasshouse" },
  { id: "printworks", name: "The Printworks" },
  { id: "assembly", name: "The Assembly Rooms" },
  { id: "bonded", name: "The Bonded House" },
  { id: "depot", name: "The tram depot" },
  { id: "fishmarket", name: "The fish market" },
];
const TRUTH = { r402: "glasshouse", r406: "printworks", r404: "assembly", r401: "bonded", r405: "depot", r403: "fishmarket" };
const ENDS = { glasshouse: "23:00", printworks: "23:30", assembly: "00:30", fishmarket: "02:15" };
// Clue cards held this morning. `fix` ties a room to a place; `end` is a paper's closing time.
// `late` cards arrive during play.
const CLUES = [
  { id: "o.n1.guest_cards", src: "office", text: "Six guest cards, one line each: 401 a soldier for hire, 402 a whistleblower, 403 an art thief, 404 an undercover journalist, 405 a hacker, 406 an activist." },
  { id: "o.city", src: "office", text: "The city's traces: red clay on the Bonded House embankment; ink at the Printworks; grease at the tram depot; pollen and warm damp at the Glasshouse; salt rime at the fish market; gold leaf at the Assembly Rooms." },
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
  { id: "o.n1.lew", src: "told", text: "Lew: \"Nowhere in this town's more than half an hour from here.\"", late: true },
];
const NOTES = {
  open: "The morning after night one. The office, the green-shaded lamp, the logbook open at a blank form. Wren wants it on paper before you go home: where each guest went tonight.",
  first: "The first row in your hand. On the carbon it already reads like a fact. You may ask the cards twice whether a row agrees with them.",
  lew: "Lew puts his head round the door on his way off shift and leaves you a line, as if it were nothing.",
  full: "Six rows, six ticks. The pen is on the desk. Once you sign, the top copy goes down the chute and you keep the carbon.",
};
const mins = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
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
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const style = document.createElement("style");
    style.textContent = `
    .${P}page{position:absolute;inset:0;overflow-x:hidden;overflow-y:auto;background:${C.bottle} radial-gradient(ellipse at 50% 0,#2f5a40,${C.bottle} 70%);font-family:"Courier New",Courier,"IBM Plex Mono",monospace;color:${C.carbon}}
    .${P}sheet{margin:14px auto 40px;max-width:1180px;width:calc(100% - 24px);box-sizing:border-box;background:${C.paper};box-shadow:0 8px 30px #0008;padding:20px clamp(14px,3vw,36px) 26px clamp(30px,4vw,48px);position:relative;
      background-image:radial-gradient(ellipse at 18% 28%,rgba(42,58,140,.13),transparent 38%),radial-gradient(ellipse at 82% 76%,rgba(42,58,140,.10),transparent 42%),radial-gradient(ellipse at 60% 10%,rgba(42,58,140,.07),transparent 30%),repeating-linear-gradient(0deg,transparent 0 27px,rgba(42,58,140,.07) 27px 28px)}
    .${P}sheet::before{content:"";position:absolute;left:10px;top:60px;bottom:60px;width:12px;background:radial-gradient(circle,${C.bottle} 0 5px,transparent 6px) 0 0/12px 33.3% repeat-y;opacity:.8}
    .${P}head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 20px;border-bottom:1.5px solid ${C.carbon};padding-bottom:8px;margin-bottom:12px;letter-spacing:.08em;font-size:14px}
    .${P}head b{font-size:clamp(16px,2vw,21px)}
    .${P}cols{display:grid;grid-template-columns:auto minmax(0,1fr);gap:26px}
    @media (max-width:820px){.${P}cols{grid-template-columns:minmax(0,1fr)}}
    .${P}grid{border-collapse:collapse;margin:0;font-size:14px}
    .${P}gwrap{padding-right:70px;overflow-x:auto}
    .${P}grid th{font-weight:700;padding:2px 3px}
    .${P}grid th.c{height:124px;vertical-align:bottom;width:46px;min-width:46px;max-width:46px;position:relative;padding:0}
    .${P}grid th.c span{position:absolute;left:24px;bottom:6px;transform:rotate(-55deg);transform-origin:left bottom;white-space:nowrap;font-size:13px}
    .${P}grid th.c.hl span{background:rgba(224,162,74,.4)}
    @media (max-width:520px){.${P}gwrap{padding-right:30px}.${P}sheet{padding-left:26px;padding-right:12px}.${P}sheet::before{left:7px}.${P}grid td,.${P}grid th.c{width:39px;min-width:39px;max-width:39px}.${P}grid th.c span{left:20px;font-size:12px}}
    .${P}grid th.r{text-align:left;white-space:nowrap;padding-right:8px;font-size:15px}
    .${P}grid th.r small{display:block;font-weight:400;font-size:12px;opacity:.85}
    .${P}grid td{width:46px;height:42px;border:1.3px solid ${C.carbon};text-align:center;font-size:22px;cursor:pointer;user-select:none;position:relative;transition:background .12s}
    .${P}grid td:hover{background:rgba(42,58,140,.10)}
    .${P}grid td.hl{background:rgba(224,162,74,.30)}
    .${P}grid td.cur{outline:2.5px dashed ${C.ev};outline-offset:-5px}
    .${P}grid td.x{color:rgba(42,58,140,.62);font-size:18px}
    .${P}grid td.t{color:${C.carbon};font-weight:700}
    .${P}grid td.clash{background:rgba(163,48,42,.18);color:${C.ev}}
    .${P}grid td.pop{animation:${P}pop .28s ease-out}
    @keyframes ${P}pop{0%{transform:scale(1.35)}100%{transform:scale(1)}}
    .${P}grid tr.struck td,.${P}grid tr.struck th small{text-decoration:line-through;opacity:.55}
    .${P}grid tr.inked td.t{background:${C.carbon};color:${C.paper}}
    .${P}rowmark{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;white-space:nowrap;min-height:1px}
    .${P}rowmark.ok{color:${C.ev};border:2px solid ${C.ev};padding:0 3px;transform:rotate(-6deg);display:inline-block;opacity:.88}
    .${P}rowmark.no{color:${C.ev};opacity:.8}
    .${P}clues{max-height:min(48vh,440px);overflow:auto;display:grid;gap:8px;padding:4px 6px 4px 0}
    .${P}card{background:#fbf6e8;border:1px solid #c9bc98;padding:8px 10px;font-size:14px;line-height:1.38;color:${C.ink};cursor:pointer;text-align:left;font-family:inherit;box-shadow:1px 2px 0 #0001;transition:transform .12s,box-shadow .12s}
    .${P}card:hover,.${P}card:focus-visible{transform:translateX(-3px);box-shadow:3px 3px 0 rgba(42,58,140,.25);outline:none}
    .${P}card.on{border-color:${C.ev};box-shadow:0 0 0 2px rgba(163,48,42,.35)}
    .${P}card.fresh{animation:${P}in .6s ease-out;border-color:${C.carbon}}
    @keyframes ${P}in{0%{transform:translateX(40px);opacity:0}100%{transform:none;opacity:1}}
    .${P}card small{display:block;color:${C.carbon};letter-spacing:.1em;font-size:12px;margin-bottom:2px;font-family:"Courier New",monospace}
    .${P}card.beat{font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:15px}
    .${P}words{margin-top:12px;font-size:14px;line-height:1.55;min-height:6em;border-top:1px dashed ${C.carbon};padding-top:8px}
    .${P}words p{margin:0}
    .${P}words .empty{opacity:.55}
    .${P}words .clash{color:${C.ev}}
    .${P}btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}
    .${P}btn{font:inherit;font-size:14px;font-weight:700;letter-spacing:.08em;color:${C.carbon};background:transparent;border:1.6px solid ${C.carbon};padding:8px 12px;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:rgba(42,58,140,.12);outline:none}
    .${P}btn[disabled]{opacity:.4;cursor:default}
    .${P}btn[hidden]{display:none}
    .${P}btn.sign{color:${C.ev};border-color:${C.ev}}
    .${P}btn.armed{background:rgba(163,48,42,.12)}
    .${P}msg{font-size:14px;color:${C.ink};min-height:1.4em;margin-top:8px;line-height:1.4}
    .${P}story{font:italic 15px/1.4 Georgia,serif;color:${C.ink};margin:0 0 12px;padding:8px 10px;border-left:3px solid ${C.carbon};background:rgba(42,58,140,.05)}
    .${P}stamp{position:absolute;right:6%;bottom:22px;border:4px double ${C.ev};color:${C.ev};font-weight:700;font-size:clamp(20px,3vw,32px);letter-spacing:.14em;padding:4px 14px;transform:rotate(-8deg);opacity:.85;pointer-events:none}
    .${P}stamp.go{animation:${P}st .35s ease-out}
    @keyframes ${P}st{0%{transform:rotate(-8deg) scale(2.2);opacity:0}100%{transform:rotate(-8deg) scale(1);opacity:.85}}
    .${P}foot{font-size:12px;opacity:.7;margin-top:16px;letter-spacing:.06em}
    .${P}opt{font-size:13px;display:flex;gap:6px;align-items:center}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(19,39,28,.88);z-index:5;padding:12px;overflow:auto}
    .${P}form{background:${C.paper};max-width:540px;width:100%;box-sizing:border-box;padding:18px 20px 16px;color:${C.carbon};font-size:14px;line-height:1.5;position:relative;
      background-image:radial-gradient(ellipse at 75% 20%,rgba(42,58,140,.12),transparent 40%),repeating-linear-gradient(0deg,transparent 0 23px,rgba(42,58,140,.07) 23px 24px);box-shadow:0 6px 24px #000a}
    .${P}form .hd{display:flex;flex-wrap:wrap;gap:2px 12px;justify-content:space-between;font-size:12px;letter-spacing:.12em;border-bottom:1.5px solid ${C.carbon};padding-bottom:6px}
    .${P}form h2{margin:10px 0 4px;letter-spacing:.14em;font-size:20px}
    .${P}form .goal{margin:0 0 8px;font-weight:700}
    .${P}form .open{margin:0 0 10px;font:italic 15px/1.4 Georgia,serif;color:${C.ink}}
    .${P}form ol{margin:0 0 12px;padding-left:1.6em}
    .${P}form li{margin:2px 0}
    .${P}form li b{letter-spacing:.06em}
    .${P}form .ft{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    .${P}form .ft span{font-size:12px;opacity:.75}
    `;
    root.appendChild(style);
    const page = document.createElement("div");
    page.className = P + "page";
    root.appendChild(page);

    const state = {};
    for (const r of ROOMS) { state[r] = {}; for (const p of PLACES) state[r][p.id] = 0; }
    let autoCross = true, looks = gentle ? 3 : 2, signed = false, cur = [0, 0], hl = new Set(), hlCols = new Set(), activeClue = null, lookMode = false;
    const held = new Set(CLUES.filter((c) => !c.late).map((c) => c.id));
    const told = new Set();
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    page.innerHTML = `
      <div class="${P}sheet">
        <div class="${P}head"><b>THE CROSSING · NIGHT LOG · STATEMENT</b><span>FORM S-1 · NIGHT 1 · ROOM × PLACE · COPY 2 OF 2</span></div>
        <p class="${P}story" aria-live="polite"></p>
        <div class="${P}cols">
          <div>
            <div class="${P}gwrap"><table class="${P}grid" role="grid" aria-label="Room by place grid"></table></div>
            <div class="${P}btns">
              <label class="${P}opt"><input type="checkbox" checked> a tick crosses its row and column</label>
            </div>
            <div class="${P}words" aria-live="polite"></div>
          </div>
          <div>
            <div style="font-weight:700;letter-spacing:.08em;margin-bottom:6px;font-size:14px">CLUE CARDS · TAP ONE TO MARK THE CELLS IT BEARS ON</div>
            <div class="${P}clues"></div>
            <div class="${P}btns">
              <button type="button" class="${P}btn" data-a="look" hidden>SECOND LOOK (2) · L</button>
              <button type="button" class="${P}btn sign" data-a="sign">SIGN ✒</button>
            </div>
            <div class="${P}msg" aria-live="polite"></div>
          </div>
        </div>
        <div class="${P}foot">COPY · NOT VALID WITHOUT THE SEAL OF THE MANAGEMENT · RETURN TIMES ARE THE VALET BELL</div>
      </div>
      <div class="${P}intro"><div class="${P}form">
        <div class="hd"><span>FORM S-1</span><span>INSTRUCTIONS TO THE NIGHT AUDITOR</span></div>
        <h2>THE STATEMENT</h2>
        <p class="goal">Place all six guests: one place to each room. Then sign, once.</p>
        <p class="open"></p>
        <ol>
          <li><b>MARK</b> · tap a cell: blank, ✕, ✓. Arrow keys and Space work too.</li>
          <li><b>CONSULT</b> · tap a clue card to light the cells it bears on.</li>
          <li><b>SIGN</b> · right rows are inked and stamped; wrong ones are struck through.</li>
        </ol>
        <div class="ft">${streak >= 2 ? `<label class="${P}opt"><input type="checkbox" data-g ${gentle ? "checked" : ""}> a third second look</label>` : `<span>THE PAGE NEVER SAYS WHAT THE RIGHT ANSWER WAS</span>`}<button type="button" class="${P}btn" data-a="start">BEGIN THE FORM</button></div>
      </div></div>`;
    const $ = (s) => page.querySelector(s);
    const table = $("." + P + "grid"), words = $("." + P + "words"), msg = $("." + P + "msg"), story = $("." + P + "story");
    const lookBtn = page.querySelector('[data-a="look"]'), signBtn = page.querySelector('[data-a="sign"]');
    page.querySelector(`.${P}form .open`).textContent = NOTES.open;
    story.textContent = NOTES.open;

    const hr = document.createElement("tr");
    hr.innerHTML = `<th></th>` + PLACES.map((p) => `<th class="c" scope="col" data-p="${p.id}"><span title="${p.name}">${p.name.replace(/^The /, "").toUpperCase()}</span></th>`).join("");
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
    function addCard(c, fresh) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `${P}card ${c.src === "office" || c.src === "paper" || c.src === "told" ? "paper" : "beat"}${fresh ? " fresh" : ""}`;
      b.innerHTML = `<small>${c.src === "office" ? "OFFICE" : c.src === "paper" ? "EVENING PAPER" : c.src === "told" ? "TOLD · LEW" : "SEEN · ROOM " + c.src}${fresh ? " · NEW" : ""}</small>`;
      b.appendChild(document.createTextNode(c.text));
      b.dataset.id = c.id;
      if (fresh) clueBox.prepend(b); else clueBox.appendChild(b);
    }
    CLUES.filter((c) => held.has(c.id)).forEach((c) => addCard(c, false));

    function bears(c) {
      const s = new Set(), cols = new Set();
      if (c.fix) { for (const p of PLACES) s.add(c.fix[0] + p.id); for (const r of ROOMS) s.add(r + c.fix[1]); cols.add(c.fix[1]); }
      if (c.end) { for (const r of ROOMS) s.add(r + c.end); cols.add(c.end); }
      if (c.id === "o.city" || c.id === "o.n1.lew") for (const r of ROOMS) for (const p of PLACES) s.add(r + p.id);
      return [s, cols];
    }
    const rowTicks = (r) => PLACES.filter((p) => state[r][p.id] === 2);
    const rowTick = (r) => rowTicks(r)[0];
    const colTicks = (p) => ROOMS.filter((r) => state[r][p] === 2);

    function draw(popKey) {
      ROOMS.forEach((r, ri) => PLACES.forEach((p, pi) => {
        const td = cells[r + p.id], v = state[r][p.id];
        const clash = v === 2 && (rowTicks(r).length > 1 || colTicks(p.id).length > 1);
        td.textContent = v === 2 ? "✓" : v === 1 ? "✕" : "";
        td.className = (v === 1 ? "x " : v === 2 ? "t " : "") + (clash ? "clash " : "") + (hl.has(r + p.id) ? "hl " : "") + (cur[0] === ri && cur[1] === pi && !signed ? "cur " : "") + (popKey === r + p.id && !RM ? "pop" : "");
      }));
      table.querySelectorAll("th.c").forEach((th) => th.classList.toggle("hl", hlCols.has(th.dataset.p)));
      const lines = ROOMS.filter((r) => rowTick(r)).map((r) => {
        const ts = rowTicks(r), p = ts[0];
        if (ts.length > 1) return `<p class="clash">Room ${r.slice(1)}: two places ticked. One room, one place.</p>`;
        return `<p>Room ${r.slice(1)} went to ${p.name.replace(/^The/, "the")} and came back at ${RETURN[r]}.</p>`;
      });
      words.innerHTML = lines.length ? lines.join("") : `<p class="empty">Room ___ went to ______ and came back at __:__.</p>`;
      lookBtn.textContent = lookMode ? "PICK A ROW…" : `SECOND LOOK (${looks}) · L`;
      lookBtn.classList.toggle("armed", lookMode);
      lookBtn.disabled = signed || looks <= 0;
      signBtn.disabled = signed;
    }
    function beats() {
      const ticked = ROOMS.filter((r) => rowTick(r)).length;
      if (ticked >= 1 && !told.has("first")) { told.add("first"); story.textContent = NOTES.first; lookBtn.hidden = false; }
      if (ticked >= 3 && !told.has("lew")) {
        told.add("lew"); story.textContent = NOTES.lew;
        const c = CLUES.find((x) => x.late); held.add(c.id); addCard(c, true); clueBox.scrollTop = 0;
      }
      if (ticked === 6 && ROOMS.every((r) => rowTicks(r).length === 1) && !told.has("full")) { told.add("full"); story.textContent = NOTES.full; }
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
      draw(r + p);
      beats();
    }

    on(table, "click", (e) => {
      const td = e.target.closest("td[data-r]");
      if (!td) return;
      const ri = +td.dataset.r, pi = +td.dataset.p;
      if (lookMode) { cur = [ri, pi]; secondLook(ROOMS[ri]); return; }
      cycle(ri, pi);
    });
    on(clueBox, "click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      b.classList.remove("fresh");
      clueBox.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b && activeClue !== b.dataset.id));
      if (activeClue === b.dataset.id) { activeClue = null; hl = new Set(); hlCols = new Set(); }
      else { activeClue = b.dataset.id; [hl, hlCols] = bears(CLUES.find((c) => c.id === b.dataset.id)); }
      draw();
    });
    on(page.querySelector(`.${P}opt input`), "change", (e) => { autoCross = e.target.checked; });

    function secondLook(r) {
      lookMode = false;
      const ts = rowTicks(r);
      if (!ts.length) { msg.textContent = `Room ${r.slice(1)} has no tick yet. Pick a row with a tick.`; draw(); return; }
      if (ts.length > 1) { msg.textContent = `Room ${r.slice(1)} has two ticks. Settle it first.`; draw(); return; }
      looks--;
      const bad = disagreeing(r, ts[0].id);
      msg.textContent = bad.length
        ? `Second look, ${r.slice(1)}: does NOT agree with every card. This one disagrees: “${bad[0].text}”`
        : `Second look, ${r.slice(1)}: agrees with every card you hold. (That is not the same as true.)`;
      const tr = table.querySelector(`tr[data-room="${r}"]`);
      tr.querySelector("th").style.background = bad.length ? "rgba(163,48,42,.15)" : "rgba(42,58,140,.12)";
      later(() => { tr.querySelector("th").style.background = ""; }, 1800);
      draw();
    }
    on(lookBtn, "click", () => {
      if (signed || looks <= 0) return;
      lookMode = !lookMode;
      msg.textContent = lookMode ? "Second look: tap any cell in the row you want checked (or press L on the current row)." : "";
      draw();
    });

    let armed = false;
    function sign() {
      if (signed) return;
      const empty = ROOMS.filter((r) => rowTicks(r).length !== 1).length;
      if (empty && !armed) { armed = true; signBtn.classList.add("armed"); signBtn.textContent = "SIGN ANYWAY ✒"; msg.textContent = `${empty} row${empty === 1 ? " is" : "s are"} not settled. Signed, ${empty === 1 ? "it stays" : "they stay"} in pencil and struck through.`; return; }
      signed = true;
      let correct = 0;
      const results = ROOMS.map((r) => { const ts = rowTicks(r); const ok = ts.length === 1 && ts[0].id === TRUTH[r]; if (ok) correct++; return [r, ok, ts.length === 1]; });
      draw();
      msg.textContent = "Signed. The carbon takes the pressure of the pen.";
      results.forEach(([r, ok, complete], i) => later(() => {
        const tr = table.querySelector(`tr[data-room="${r}"]`);
        const mark = tr.querySelector("." + P + "rowmark");
        if (ok) { tr.classList.add("inked"); mark.textContent = "ENTERED"; mark.classList.add("ok"); }
        else { tr.classList.add("struck"); mark.textContent = complete ? "" : "INCOMPLETE"; mark.classList.add("no"); }
      }, RM ? 0 : 250 + i * 260));
      later(() => {
        const stamp = document.createElement("div");
        stamp.className = P + "stamp" + (RM ? "" : " go");
        stamp.textContent = `NIGHT 1 · ${correct}/6`;
        page.querySelector("." + P + "sheet").appendChild(stamp);
        msg.textContent = "The page does not say what the right answers were.";
      }, RM ? 0 : 1900);
      api.store.set("best", Math.max(api.store.get("best", 0), correct));
      const outcome = correct === 6 ? "win" : correct >= 4 ? "done" : "lose";
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      later(() => api.end({
        outcome,
        text: correct === 6
          ? "Six rows inked and stamped. Every return placed, and placed right. The top copy goes down the chute at 05:00; the carbon stays in your drawer, and so does the feeling that someone will read it closely."
          : correct >= 4
            ? `${correct} of 6 rows inked and stamped. The rest stay in pencil, struck through, and go down the chute anyway. Nobody calls to ask which.`
            : `${correct} of 6 rows inked. The rest stay in pencil, struck through. Read the closing times against the bell, and the traces against the city, before you sign again.`,
      }), RM ? 600 : 3200);
    }
    on(signBtn, "click", sign);

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
      } else if ((k === "l" || k === "L") && !lookBtn.hidden) {
        if (looks > 0) secondLook(ROOMS[cur[0]]);
      }
    });

    const gbox = page.querySelector("[data-g]");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); looks = gentle ? 3 : 2; });
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

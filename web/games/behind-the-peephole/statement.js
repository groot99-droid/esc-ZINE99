// Behind the Peephole / The Statement (1D, logic grid). Style: carbon-copy typewriter form.
// One morning: night one's statement, Room x Place (DESIGN.md section 11, `n1_statement`), from
// games/behind-the-peephole/data/truth.json and beats.json. Cut: categories reduced to one grid
// (as night one is); no false signs on night one, so a second look never shows a tell.
// Actions: MARK a cell (blank, cross, tick), CONSULT a clue card (it marks the cells it bears on),
// SECOND LOOK at a row (two, from the first tick) and SIGN. Phases: the office cards; Lew's note
// arrives once three rows are ticked; signing inks the rows one by one.
//
// The carbon (accepted 2026-11-15, phase 1; DESIGN.md section 11, rule 6): after signing, the next
// morning. Wren's copy has gone down the chute with its mistakes; the carbon is in the drawer, two
// night-two cards have turned up (data/beats.json), and ONE struck row may be amended on the carbon
// only. Cut: one morning, so the carbon holds one form; the game keeps every night's.
// Art (games/behind-the-peephole/art): the clue-kind icons on the seen cards, the evening paper's
// clipping, the rubber stamps (ENTERED, CARBON COPY, AMENDED), the typed row slips where the art's
// row is the row on the carbon, form S-1, Wren's envelope, and the chapter cards.

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
  { id: "c.n1.r401.clay", src: "401", kind: "clothing", text: "Red clay on his collar and knees.", fix: ["r401", "bonded"] },
  { id: "c.n1.r403.salt", src: "403", kind: "clothing", text: "Salt rime on her boots; she smells her gloves.", fix: ["r403", "fishmarket"] },
  { id: "c.n1.r406.ink", src: "406", kind: "hands", text: "Ink on her fingertips; she scrubs at the sink.", fix: ["r406", "printworks"] },
  { id: "c.n1.r406.leaflets", src: "406", kind: "luggage", text: "A tube of rolled leaflets.", fix: ["r406", "printworks"] },
  { id: "c.n1.r402.tv", src: "402", kind: "television", text: "A game show, loud." },
  { id: "c.n1.r404.ritual", src: "404", kind: "rituals", text: "Pours a miniature into the sink; writes \"400\" on the notepad." },
  { id: "c.n1.r405.ritual", src: "405", kind: "rituals", text: "Dry cereal from the box." },
  { id: "o.n1.lew", src: "told", text: "Lew: \"Nowhere in this town's more than half an hour from here.\"", late: true },
];
const NOTES = {
  open: "The morning after night one. The office, the green-shaded lamp, the logbook open at a blank form. Wren wants it on paper before you go home: where each guest went tonight.",
  first: "The first row in your hand. On the carbon it already reads like a fact. You may ask the cards twice whether a row agrees with them.",
  lew: "Lew puts his head round the door on his way off shift and leaves you a line, as if it were nothing.",
  full: "Six rows, six ticks. The pen is on the desk. Once you sign, the top copy goes down the chute and you keep the carbon.",
};
// The second morning's cards, verbatim from data/beats.json (night two).
const MORNING = [
  { src: "405", kind: "hands", text: "Grease under her nails again." },
  { src: "401", kind: "luggage", text: "A laminated pass on a lanyard: \"BH\"." },
];
const CARBON = {
  open: "The second morning. Wren's copy of night one went down the chute as you signed it, mistakes and all. The carbon is in your drawer, and nobody reads the carbon but you.",
  rule: "You may amend one struck row, on the carbon only. Wren's copy keeps the mistake; yours can become true.",
  none: "Nothing is struck. The carbon and Wren's copy say the same six things.",
  kept: "You close the drawer on it as signed.",
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
    .${P}card.beat.ic{padding-left:50px;background-repeat:no-repeat;background-position:8px 50%;background-size:34px 34px;min-height:36px}
    .${P}clip{display:block;width:100%;max-width:240px;margin:0 auto;border:0;padding:0;background:none;cursor:pointer;transition:transform .12s}
    .${P}clip:hover,.${P}clip:focus-visible{transform:rotate(-1.5deg) scale(1.03);outline:none}
    .${P}clip img{display:block;width:100%;height:auto}
    .${P}stampimg{position:absolute;right:-64px;top:50%;width:62px;height:auto;transform:translateY(-50%) rotate(-5deg);mix-blend-mode:multiply;pointer-events:none;z-index:2}
    .${P}stampimg.go{animation:${P}sti .3s ease-out}
    @keyframes ${P}sti{0%{transform:translateY(-50%) rotate(-5deg) scale(1.9);opacity:0}100%{transform:translateY(-50%) rotate(-5deg) scale(1);opacity:1}}
    @media (max-width:520px){.${P}stampimg{right:-28px;width:54px;opacity:.9}}
    .${P}cb{position:absolute;inset:0;z-index:6;overflow:auto;background:rgba(19,39,28,.93);padding:12px}
    .${P}cbs{max-width:920px;margin:0 auto 30px;background:#dfe3ee;color:${C.carbon};box-shadow:0 8px 30px #000a;padding:0 0 18px;position:relative;
      background-image:radial-gradient(ellipse at 20% 30%,rgba(42,58,140,.18),transparent 40%),radial-gradient(ellipse at 80% 70%,rgba(42,58,140,.14),transparent 42%),repeating-linear-gradient(0deg,transparent 0 27px,rgba(42,58,140,.08) 27px 28px)}
    .${P}cbs>img.ch{display:block;width:100%;height:clamp(84px,16vw,150px);object-fit:cover;object-position:0 0}
    .${P}cbin{padding:12px clamp(12px,3vw,30px) 0}
    .${P}cbh{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between;border-bottom:1.5px solid ${C.carbon};padding-bottom:8px;margin-bottom:10px;font-size:14px;letter-spacing:.08em}
    .${P}cbh b{font-size:clamp(16px,2vw,20px)}
    .${P}cbh img{height:56px;width:auto;mix-blend-mode:multiply;transform:rotate(-4deg)}
    .${P}cbg{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:18px}
    @media (max-width:720px){.${P}cbg{grid-template-columns:minmax(0,1fr)}}
    .${P}slips{display:grid;gap:8px;background:#a97848 radial-gradient(circle at 30% 20%,#b98a58,#946a3e);padding:8px;box-shadow:inset 0 0 12px #0005}
    .${P}slip{position:relative;display:block;width:100%;text-align:left;font:inherit;font-size:14px;line-height:1.45;letter-spacing:.04em;color:${C.carbon};background:#f6f1e4;border:1px solid #b9b3a2;box-sizing:border-box;padding:9px 96px 9px 12px;min-height:56px;box-shadow:1px 2px 0 #0002;text-transform:uppercase}
    button.${P}slip{cursor:pointer}
    button.${P}slip:hover,button.${P}slip:focus-visible{outline:2.5px dashed ${C.ev};outline-offset:2px}
    .${P}slip.sel{outline:2.5px solid ${C.ev};outline-offset:2px}
    .${P}slip s{color:${C.ev};text-decoration-thickness:2px}
    .${P}slip .st{position:absolute;right:6px;top:50%;height:46px;width:auto;transform:translateY(-50%) rotate(-5deg);mix-blend-mode:multiply}
    .${P}slip .tx{position:absolute;right:8px;top:50%;transform:translateY(-50%) rotate(-5deg);border:2px solid currentColor;padding:1px 5px;font-size:11px;font-weight:700;letter-spacing:.08em}
    .${P}slip.art{padding:0;border:0;background:none;box-shadow:none;min-height:0}
    .${P}slip.art img{display:block;width:100%;height:auto}
    .${P}pl{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
    .${P}pl .${P}btn{font-size:13px;padding:6px 9px}
    .${P}pl .${P}btn.on{background:${C.carbon};color:#f6f1e4}
    .${P}top{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
    .${P}top p{flex:1;margin:0}
    .${P}top img{flex:none;height:auto;box-shadow:1px 2px 6px #0004}
    @media (max-width:520px){.${P}top img{display:none}}
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
    const art = api.art || { has: () => false, url: () => "" };
    const ICON = (k) => (k && art.has("clue-" + k) ? art.url("clue-" + k) : "");
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
        ${art.has("chapter-n1") ? `<img alt="Night One: Returns" src="${art.url("chapter-n1")}" style="display:block;width:calc(100% + 40px);max-width:none;margin:-18px -20px 12px;height:96px;object-fit:cover;object-position:0 0">` : ""}
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
      if (ICON(c.kind)) { b.classList.add("ic"); b.style.backgroundImage = `url(${ICON(c.kind)})`; }
      if (fresh) clueBox.prepend(b); else clueBox.appendChild(b);
    }
    if (art.has("clipping-listings")) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "clip"; b.dataset.id = "paper.all"; b.title = "The evening paper: tonight in town";
      b.innerHTML = `<img alt="The Evening Courant, Tonight in town: the four closing times" src="${art.url("clipping-listings")}">`;
      clueBox.appendChild(b);
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
      else if (b.dataset.id === "paper.all") { activeClue = b.dataset.id; hl = new Set(); hlCols = new Set(Object.keys(ENDS)); for (const r of ROOMS) for (const p of hlCols) hl.add(r + p); }
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
        if (ok && art.has("stamp-entered")) {
          tr.classList.add("inked");
          const im = document.createElement("img"); im.className = P + "stampimg" + (RM ? "" : " go"); im.alt = "ENTERED"; im.src = art.url("stamp-entered");
          tr.lastElementChild.appendChild(im);
        } else if (ok) { tr.classList.add("inked"); mark.textContent = "ENTERED"; mark.classList.add("ok"); }
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
      later(() => carbonPhase(results, correct, outcome), RM ? 900 : 3400);
    }

    // ---- the carbon: the next morning, one amendment, on your copy only
    function carbonPhase(results, correct, outcome) {
      const wrong = results.filter(([, ok]) => !ok).map(([r]) => r);
      const row = {}; for (const r of ROOMS) { const ts = rowTicks(r); row[r] = ts.length === 1 ? ts[0].id : null; }
      let sel = null, pick = null, amended = null;
      const el = document.createElement("div");
      el.className = P + "cb";
      el.innerHTML = `<div class="${P}cbs" role="dialog" aria-label="The carbon copy">
        ${art.has("chapter-n2") ? `<img class="ch" alt="Night Two: The Bell Board" src="${art.url("chapter-n2")}">` : ""}
        <div class="${P}cbin">
          <div class="${P}cbh"><b>FORM S-1 · NIGHT 1 · COPY 2 OF 2</b>${art.has("stamp-carbon") ? `<img alt="CARBON COPY" src="${art.url("stamp-carbon")}">` : `<span>CARBON COPY</span>`}</div>
          <div class="${P}top"><p class="${P}story"></p>
          ${art.has("ui-wren-blind-stamp") ? `<img alt="" title="Wren's envelope: his copy is gone" style="width:96px;transform:rotate(-3deg)" src="${art.url("ui-wren-blind-stamp")}">` : ""}
          ${art.has("form-s1") ? `<img alt="" title="Form S-1, your copy" style="width:62px;transform:rotate(2deg)" src="${art.url("form-s1")}">` : ""}</div>
          <div class="${P}cbg">
            <div><div class="${P}slips"></div></div>
            <div>
              <div style="font-weight:700;letter-spacing:.08em;margin-bottom:6px;font-size:14px">THIS MORNING'S CARDS · NIGHT TWO</div>
              <div class="${P}clues" style="max-height:none"></div>
              <p class="${P}msg" aria-live="polite"></p>
              <div class="${P}pl" hidden></div>
              <div class="${P}btns"><button type="button" class="${P}btn sign" data-a="amend" disabled>AMEND THIS ROW</button><button type="button" class="${P}btn" data-a="keep">CLOSE THE DRAWER</button></div>
            </div>
          </div>
        </div></div>`;
      const q = (x) => el.querySelector(x);
      q("." + P + "story").textContent = CARBON.open;
      const cmsg = q("." + P + "msg"), slips = q("." + P + "slips"), pl = q("." + P + "pl"), amendBtn = q('[data-a="amend"]'), keepBtn = q('[data-a="keep"]');
      cmsg.textContent = wrong.length ? CARBON.rule + " Pick a struck row." : CARBON.none;
      for (const c of MORNING) {
        const d = document.createElement("div");
        d.className = `${P}card beat`; d.style.cursor = "default";
        d.innerHTML = `<small>SEEN · ROOM ${c.src} · NIGHT TWO</small>`; d.appendChild(document.createTextNode(c.text));
        if (ICON(c.kind)) { d.classList.add("ic"); d.style.backgroundImage = `url(${ICON(c.kind)})`; }
        q("." + P + "clues").appendChild(d);
      }
      {
        const d = document.createElement("div"); d.className = `${P}card paper`; d.style.cursor = "default";
        d.innerHTML = `<small>OFFICE · KEPT FROM NIGHT ONE</small>`; d.appendChild(document.createTextNode(CLUES.find((c) => c.id === "o.city").text));
        q("." + P + "clues").appendChild(d);
      }
      const nameOf = (id) => PLACES.find((p) => p.id === id).name.replace(/^The/, "the");
      const stampEl = (id, word, col) => (art.has(id) ? `<img class="st" alt="${word}" src="${art.url(id)}">` : `<span class="tx" style="color:${col}">${word}</span>`);
      function paintSlips() {
        slips.innerHTML = "";
        for (const r of ROOMS) {
          const ok = !wrong.includes(r), isAm = amended && amended.room === r, no = r.slice(1);
          // the art's typed slips carry these exact rows: use them where the carbon says the same
          const artId = "slip-row-" + no, artFits = art.has(artId) && ((ok && (no === "402" || no === "403")) || (isAm && no === "401" && amended.place === "bonded"));
          let d;
          if (artFits) {
            d = document.createElement("div"); d.className = `${P}slip art`;
            d.innerHTML = `<img alt="Room ${no} went to ${nameOf(TRUTH[r])} and came back at ${RETURN[r]}. ${isAm ? "Amended" : "Entered"}." src="${art.url(artId)}">`;
          } else if (ok) {
            d = document.createElement("div"); d.className = P + "slip";
            d.innerHTML = `Room ${no} went to ${nameOf(row[r])} and came back at ${RETURN[r]}.${stampEl("stamp-entered", "ENTERED", C.carbon)}`;
          } else {
            d = document.createElement(amended ? "div" : "button"); d.className = P + "slip" + (sel === r ? " sel" : "");
            if (!amended) { d.type = "button"; d.dataset.room = r; }
            const was = row[r] ? `<s>${nameOf(row[r])}</s>` : `<s>______</s>`;
            d.innerHTML = isAm ? `Room ${no} went to ${was} ${nameOf(amended.place)} and came back at ${RETURN[r]}.${stampEl("stamp-amended", "AMENDED", "#2f6b45")}`
              : `<span style="opacity:.75">Room ${no} went to ${was} and came back at ${RETURN[r]}.</span><span class="tx" style="color:${C.ev}">STRUCK</span>`;
          }
          slips.appendChild(d);
        }
      }
      function paintPlaces() {
        pl.hidden = !sel || !!amended;
        pl.innerHTML = "";
        if (pl.hidden) return;
        for (const p of PLACES) {
          const b = document.createElement("button");
          b.type = "button"; b.className = P + "btn" + (pick === p.id ? " on" : ""); b.dataset.place = p.id; b.textContent = p.name.replace(/^The /, "").toUpperCase();
          pl.appendChild(b);
        }
        amendBtn.disabled = !pick;
      }
      on(slips, "click", (e) => {
        const b = e.target.closest("button[data-room]"); if (!b || amended) return;
        sel = b.dataset.room; pick = null; paintSlips(); paintPlaces();
        cmsg.textContent = `Room ${sel.slice(1)}, bell ${RETURN[sel]}. Where did they go? Choose, then amend. You get one.`;
        const f = slips.querySelector(".sel"); if (f) f.focus();
      });
      on(pl, "click", (e) => { const b = e.target.closest("button[data-place]"); if (!b) return; pick = b.dataset.place; paintPlaces(); });
      on(amendBtn, "click", () => {
        if (!sel || !pick || amended) return;
        amended = { room: sel, place: pick, ok: TRUTH[sel] === pick };
        sel = null; paintSlips(); paintPlaces(); amendBtn.hidden = true;
        cmsg.textContent = "Amended, on the carbon only. Wren's copy still says what you signed. The carbon does not say whether it is true now.";
        keepBtn.focus();
      });
      on(keepBtn, "click", () => {
        keepBtn.disabled = true; amendBtn.disabled = true;
        const carbon = correct + (amended && amended.ok ? 1 : 0);
        api.store.set("bestCarbon", Math.max(api.store.get("bestCarbon", 0), carbon));
        let text;
        if (correct === 6) text = "Six rows inked and stamped; the carbon and Wren's copy agree. The top copy went down the chute at 05:00, and the carbon stays in your drawer with the feeling that someone will read it closely.";
        else if (!amended) text = `Wren's copy: ${correct} of 6, and it keeps the rest struck through. Your carbon: the same, left as signed. ${correct >= 4 ? "Nobody calls to ask which rows." : "Read the closing times against the bell, and the traces against the city, before you sign again."}`;
        else if (amended.ok) text = `Wren's copy: ${correct} of 6, mistakes and all. Your carbon: ${carbon} of 6. Room ${amended.room.slice(1)} is true now, in a drawer, in blue, where only you can read it.${carbon === 6 ? " For the first time your record and his are not the same record." : ""}`;
        else text = `Wren's copy: ${correct} of 6. Your carbon: ${carbon} of 6. You changed room ${amended.room.slice(1)} and it is still not where they went; now the two copies are wrong in different ways.`;
        const out = outcome === "lose" && amended && amended.ok && carbon >= 4 ? "done" : outcome;
        api.store.set("lossStreak", out === "lose" ? streak + 1 : 0);
        later(() => api.end({ outcome: out, text }), 300);
      });
      paintSlips(); paintPlaces();
      page.appendChild(el);
      (wrong.length ? slips.querySelector("button") : keepBtn).focus();
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

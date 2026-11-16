// Behind the Peephole / The Mosaic (1D, link board). Style: cork-board collage, pinned cards and
// pulled thread. One morning: the night-three board (`n3_mosaic`, 6 lengths), with the pins,
// links and questions of games/behind-the-peephole/data/truth.json (mosaic) up to night three, and
// the clue cards those links rest on (data/beats.json). Cut: links do not persist to later nights.
// Actions: SPOOL (choose the kind of link), THREAD (pin to pin; costs a length), READ (a card's clue
// slips, in the reading panel) and the PENCIL RINGS (the design's hint: a ring round a pin with an
// unused true link). Phases: the first threads; new cards go up as true links open them; the last
// lengths.
// Art (games/behind-the-peephole/art): the pin cards and the six guest cards are the art's own,
// each with its pin where the thread ties on; the question cards that have a drawn card pin up as
// that card; the evening paper's clippings and the stopped clock show in the reading panel; chapter
// card three heads the opening note. The thread, the rings and the typed rows stay drawn here.

// Phase 2 (2026-11-16): the ladder. TEACH: the night-two board, three plain links and five lengths.
// TEST: the night-three board above, more links than lengths. TWIST: the night-five board, where
// two of Wren's TYPED ROWS are on the cork. A link that rests only on a typed row pulls taut like any
// other, and FRAYS when the lamp goes out; the SCISSORS, once a morning, cut one thread and give its
// length back. The side panel says what every thread rests on; it never says whether that is true.
// Set-piece: unpin the board and turn it over. Layer link (api.shared "lostProperty", set by
// Lockwork): the green RHYME spool and three of the six left things, each a rhyme with one guest.
import { staged } from "./_stages.js";

const TYPES = [
  { id: "met", name: "met", col: "#b8322a", dash: "", key: "1" },
  { id: "works_for", name: "works for", col: "#2f5fb0", dash: "14 8", key: "2" },
  { id: "family", name: "family", col: "#e2bd3c", dash: "", dbl: true, key: "3" },
  { id: "after", name: "after", col: "#f6f1e4", dash: "2 7", key: "4" },
];
const RHYME = { id: "rhyme", name: "rhyme", col: "#4f9a5c", dash: "", key: "5" };
const THINGS = [
  { id: "thing_rook", name: "A ROOK", about: "From lost property, tagged in Dora's hand: a chess rook, boxwood, the felt worn off its base. Last season's.", with: "r405", slip: "Fenn's log, last season, his 405: \"Chess by post. Night six: the bell, and no return.\"" },
  { id: "thing_orchid", name: "A DRY ORCHID", about: "From lost property, tagged in Dora's hand: an orchid pressed flat in a hotel directory. Last season's.", with: "r402", slip: "Fenn's log, last season, his 402: \"A flower every night. Night seven: out through the lobby, between two men.\"" },
  { id: "thing_boat", name: "A PAPER BOAT", about: "From lost property, tagged in Dora's hand: a paper boat gone brown along its folds. Last season's.", with: "r406", slip: "Fenn's log, last season, his 406: \"Folds paper. Night six: the sill is empty.\"" },
];
const TYPED_ROWS = ["TYPED · H.W. · 406 · N3 · MET 403", "TYPED · H.W. · 406 · N1 · THE BONDED HOUSE"];
const TYPED_LINKS = [
  { a: "r406", b: "r403", type: "met", q: "What did 406 want from 403?", typed: TYPED_ROWS[0] },
  { a: "r406", b: "bonded_house", type: "after", q: "What was 406 doing on the embankment?", typed: TYPED_ROWS[1] },
];
const RESTS = { "r402|r404": "the orchid in her buttonhole, and what you saw on his desk", "bonded_house|r403": "red clay and a brass tag, both seen", "bonded_house|r401": "the lanyard: \"BH\", seen", "case|r403": "the case under her bed, seen", "r405|r406": "\"Ruthie, it's—\", heard through the door", "r401|r403": "the photograph on his desk, seen", "bonded_house|r405": "a stamped row of your own: CABLE SPOOL · ERASED" };
const BOARDS = [
  { night: 2, lengths: 5, need: 3, links: [0, 4, 2], goal: "Pull three threads taut. Five lengths: two to spare.",
    open: "The morning after night two. The cork board in the office, under the green lamp. Three things you saw last night belong together; the thread will tell you when you have them." },
  { night: 3, lengths: 6, need: 5, links: [0, 1, 2, 3, 4, 5, 6], goal: "Pull at least five threads taut with six lengths.",
    open: "The morning after night three. The cork board in the office, under the green lamp: six lives you know only by what they carry home, and six lengths of thread." },
  { night: 5, lengths: 6, need: 5, links: [0, 1, 2, 3, 4, 5, 6], typed: true, goal: "Five threads still taut when the lamp goes out. Six lengths, one pair of scissors.",
    open: "The morning after night five. Two rows on the cork were typed before you sat down, with H.W. under them. A thread tied on a typed row pulls as taut as any other." },
];
const GUESTS = [
  { id: "r401", name: "401", clues: ["Red clay on his collar and knees.", "A laminated pass on a lanyard: \"BH\".", "A photograph on the desk, face up, then face down: 403's guest at her own door."] },
  { id: "r402", name: "402", clues: ["An orchid in her buttonhole.", "Presses the orchid in the hotel directory."] },
  { id: "r403", name: "403", clues: ["Red clay on her boots and on the white gloves: the same red as 401's collar.", "A brass tag, \"BH-0611\", set on the sill.", "A flat hard case under the bed, where there was nothing last night."] },
  { id: "r404", name: "404", clues: ["A photocopied page, read under the lamp with a magnifier."] },
  { id: "r405", name: "405", clues: ["A spool of cable.", "Dials the room phone: \"Ruthie, it's—\""] },
  { id: "r406", name: "406", clues: ["The room phone rings; she answers, hears a voice, hangs up."] },
];
const BASE_OTHERS = [
  { id: "bonded_house", name: "THE BONDED HOUSE", about: "A bonded warehouse on the river embankment, red clay underfoot. The city's traces card puts the clay there." },
  { id: "case", name: "THE CASE", hidden: true, about: "A flat hard case under 403's bed." },
  { id: "drost", name: "DROST", hidden: true, about: "The name behind the Bonded House." },
  { id: "photograph", name: "THE PHOTOGRAPH", about: "Seen on 401's desk: 403's guest at her own door." },
  { id: "gala", name: "THE GALA", about: "The Assembly Rooms gala, rehearsing this week." },
  { id: "stranger", name: "THE STRANGER", about: "Whoever knocks at 2:14." },
  { id: "you", name: "YOU", about: "The night auditor, fourth floor." },
];
const BASE_ROWS = [
  "401 · N1 · THE BONDED HOUSE", "402 · N1 · THE GLASSHOUSE", "403 · N1 · THE FISH MARKET",
  "404 · N2 · PHOTOCOPY · RECEIVED", "402 · N2 · ORCHID · HANDED OVER", "405 · N2 · CABLE SPOOL · ERASED",
  "403 · N2 · CRATE TAG · STOLE", "401 · N2 · SECURITY PASS · BRIEFED",
];
const ALL_LINKS = [
  { a: "r402", b: "r404", type: "met", q: "What did she give him?" },
  { a: "r403", b: "bonded_house", type: "after", q: "What did she take?", adds: "case" },
  { a: "r401", b: "bonded_house", type: "works_for", q: "Who is he guarding it for?", adds: "drost" },
  { a: "r403", b: "case", type: "after", q: "Who wants it back?" },
  { a: "r405", b: "r406", type: "family", q: "Why did she call?" },
  { a: "r401", b: "r403", type: "after", q: "What will he do?" },
  { a: "r405", b: "bonded_house", type: "works_for", q: "What did she erase?" },
];
const pairKey = (a, b) => [a, b].sort().join("|");
const NOTES = {
  open: "The morning after night three. The cork board in the office, under the green lamp: six lives you know only by what they carry home, and six lengths of thread.",
  taut: "It pulls taut. A question goes up, and questions are how you learn where to look tonight.",
  slack: "Slack. The thread hangs between two lives that never touched, as far as you know.",
  case: "A new card goes up: THE CASE. Something came home with 403 that was not there the night before.",
  drost: "A name goes up that the hotel never says aloud: DROST.",
  last: "Two lengths left on the spools, and the light in the office is turning grey.",
};

function wrapText(text, n) {
  const out = []; let line = "";
  for (const w of text.split(" ")) { if ((line + " " + w).trim().length > n) { out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line);
  return out;
}

const P = "behind-the-peephole-mosaic-";
export default staged(P, ["three plain links", "more links than lengths", "a taut thread can be wrong"], function play(root, api, stage) {
    const BD = BOARDS[stage.stage], LENGTHS = BD.lengths;
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const LOSTP = stage.stage > 0 && !!shared.get("lostProperty", false);
    const LINKS = BD.links.map((i) => ALL_LINKS[i]).concat(BD.typed ? TYPED_LINKS : []);
    const ROWS = BD.typed ? BASE_ROWS.slice(0, 6).concat(TYPED_ROWS) : BASE_ROWS;
    if (LOSTP && !TYPES.includes(RHYME)) TYPES.push(RHYME); else if (!LOSTP && TYPES.includes(RHYME)) TYPES.pop();
    const OTHERS = LOSTP ? BASE_OTHERS.concat(THINGS) : BASE_OTHERS;
    const NS = "http://www.w3.org/2000/svg";
    const art = api.art || { has: () => false, url: () => "" };
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:#3a2716;display:grid;grid-template-columns:minmax(0,1fr) 290px;grid-template-rows:auto minmax(0,1fr);overflow:hidden;touch-action:none;user-select:none;font:14px/1.4 "Courier New",monospace;color:#1c1a17}
    .${P}qs{grid-column:1 / -1;display:flex;gap:8px;overflow-x:auto;padding:8px 10px;min-height:46px;background:#5a3e22;align-items:center;box-shadow:inset 0 -2px 0 #2a1a0c}
    .${P}qs .q{flex:none;background:#fbf6e8;padding:6px 12px 6px 22px;font:italic 15px Georgia,serif;position:relative;transform:rotate(-1deg);box-shadow:2px 3px 0 #0005}
    .${P}qs .q::before{content:"";position:absolute;left:7px;top:50%;width:9px;height:9px;margin-top:-5px;border-radius:50%;background:#a3302a}
    .${P}qs img.qa{flex:none;height:clamp(64px,9vh,84px);width:auto;box-shadow:2px 3px 0 #0005;transform:rotate(-1deg)}
    .${P}qs img.qa.fresh{animation:${P}pin .5s ease-out}
    .${P}read img.ra{display:block;width:min(100%,220px);height:auto;margin:8px auto 2px;box-shadow:2px 3px 0 #0004}
    .${P}note img.ch{display:block;width:100%;height:84px;object-fit:cover;object-position:0 0;margin:0 0 10px}
    .${P}qs .q.fresh{animation:${P}pin .5s ease-out}
    @keyframes ${P}pin{0%{transform:translateY(-30px) rotate(-6deg);opacity:0}100%{transform:rotate(-1deg);opacity:1}}
    .${P}qs .none{color:#f4ecd6;opacity:.8;font-size:14px;letter-spacing:.06em}
    .${P}board{position:relative;min-height:0}
    .${P}board svg{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pin{cursor:pointer}
    .${P}pin:focus{outline:none}
    .${P}pin:focus .${P}card,.${P}pin:hover .${P}card{stroke:#f6cf86;stroke-width:4}
    .${P}side{background:#2a1a0c;color:#f4ecd6;padding:10px;overflow:auto;display:flex;flex-direction:column;gap:10px;border-left:2px solid #1a0f06;min-height:0}
    .${P}side>*{flex:none}
    .${P}spools{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .${P}sp{display:flex;align-items:center;gap:8px;font:700 13px "Courier New",monospace;letter-spacing:.04em;color:#1c1a17;background:#e9dcc0;border:2px solid transparent;padding:6px 8px;min-height:44px;cursor:pointer;text-align:left}
    .${P}sp:hover,.${P}sp:focus-visible{border-color:#f6cf86;outline:none}
    .${P}sp.on{background:#f6cf86;border-color:#1c1a17;box-shadow:inset 0 0 0 2px #fff6}
    .${P}sp svg{flex:none}
    .${P}len{display:flex;align-items:center;gap:6px;font:700 14px "Courier New",monospace;letter-spacing:.08em}
    .${P}len i{display:inline-block;width:18px;height:6px;border-radius:3px;background:#b8322a}
    .${P}len i.gone{background:#6a5440}
    .${P}read{background:#f4ecd6;color:#1c1a17;padding:9px 10px 10px;box-shadow:3px 4px 0 #0006;min-height:120px}
    .${P}read h3{margin:0 0 6px;font:700 15px "Courier New",monospace;letter-spacing:.06em;border-bottom:1px solid #a3302a;padding-bottom:3px}
    .${P}read p{margin:0 0 6px;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:15px;line-height:1.3}
    .${P}read p.t{font-family:"Courier New",monospace;font-size:14px}
    .${P}read small{display:block;font-size:12px;color:#5a4a30}
    .${P}msg{font:italic 15px/1.35 Georgia,serif;color:#f6cf86;min-height:2.6em}
    .${P}msg.bad{color:#ffb3a0}
    .${P}story{font:italic 14px/1.4 Georgia,serif;color:#e9dcc0;border-left:3px solid #b8913f;padding-left:8px}
    .${P}row{display:flex;gap:6px;flex-wrap:wrap}
    .${P}btn{font:700 13px "Courier New",monospace;letter-spacing:.08em;padding:8px 12px;border:2px solid #1c1a17;background:#e0a24a;color:#1c1a17;cursor:pointer;min-height:42px}
    .${P}btn:hover,.${P}btn:focus-visible{background:#f6cf86;outline:none}
    .${P}btn.ghost{background:#e9dcc0}
    .${P}btn[hidden]{display:none}
    .${P}btn.new{animation:${P}n 1s ease-in-out 3}
    @keyframes ${P}n{50%{box-shadow:0 0 0 3px #f6cf86}}
    .${P}ths{font:13px/1.35 "Courier New",monospace;display:grid;gap:4px}
    .${P}ths div{background:#3a2716;padding:4px 6px;display:flex;gap:6px;align-items:center;justify-content:space-between}
    .${P}ths div.fr{opacity:.6;text-decoration:line-through}
    .${P}ths i{font-style:normal;color:#e9dcc0;font-size:12px;display:block}
    .${P}ths button{flex:none;min-width:40px;min-height:36px;font-size:16px;cursor:pointer;background:#e9dcc0;border:2px solid #1c1a17}
    .${P}rows{display:none;font-size:13px;color:#2a3a8c}
    .${P}rows div{background:#efe6cf;padding:3px 6px;margin:3px 0}
    @media (max-width:760px){
      .${P}wrap{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) 40%}
      .${P}board{overflow-y:auto;touch-action:pan-y}
      .${P}board svg{position:static;height:auto}
      .${P}side{border-left:0;border-top:2px solid #1a0f06;padding:8px}
      .${P}spools{grid-template-columns:repeat(4,1fr)}
      .${P}sp{flex-direction:column;gap:2px;padding:4px;font-size:12px;text-align:center}
      .${P}read{min-height:0}
      .${P}rows{display:block}
    }
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(30,18,8,.86);padding:12px;z-index:3;overflow:auto}
    .${P}note{max-width:500px;width:100%;box-sizing:border-box;background:#f4ecd6;color:#1c1a17;padding:24px 22px 18px;font:14px/1.5 "Courier New",monospace;box-shadow:5px 7px 0 #0007;transform:rotate(-1deg);position:relative}
    .${P}note::before{content:"";position:absolute;left:50%;top:-8px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#e05a4a,#8a2018);box-shadow:1px 2px 2px #0006}
    .${P}note::after{content:"";position:absolute;right:-10px;top:30px;width:70px;height:22px;background:rgba(240,230,190,.7);transform:rotate(30deg)}
    .${P}note h2{margin:0 0 6px;font:700 22px "Courier New",monospace;letter-spacing:.1em}
    .${P}note .goal{font-weight:700;margin:0 0 6px}
    .${P}note .open{font:italic 15px/1.4 Georgia,serif;margin:0 0 10px}
    .${P}note ul{list-style:none;padding:0;margin:0 0 12px;display:grid;gap:5px}
    .${P}note li b{display:inline-block;min-width:6.5em;letter-spacing:.06em}
    .${P}note .ft{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    `;
    root.appendChild(st);
    const wrapEl = document.createElement("div");
    wrapEl.className = P + "wrap";
    root.appendChild(wrapEl);
    wrapEl.innerHTML = `<div class="${P}qs" aria-live="polite"><span class="none">QUESTIONS PIN HERE WHEN A THREAD PULLS TAUT</span></div>
      <div class="${P}board"></div>
      <div class="${P}side">
        <div class="${P}spools" role="radiogroup" aria-label="Thread"></div>
        <div class="${P}len"></div><div class="${P}ths"></div>
        <div class="${P}msg" aria-live="polite"></div>
        <div class="${P}read"><h3>READ A CARD</h3><small>Hover or tap a pinned card to read its clue cards here.</small></div>
        <div class="${P}story"></div>
        <div class="${P}rows"></div>
        <div class="${P}row"><button type="button" class="${P}btn ghost" data-act="rings" hidden>PENCIL RINGS · ON</button><button type="button" class="${P}btn" data-act="done">LEAVE THE BOARD</button></div>
      </div>`;
    const board = wrapEl.querySelector("." + P + "board"), qsEl = wrapEl.querySelector("." + P + "qs"), spoolsEl = wrapEl.querySelector("." + P + "spools");
    const lenEl = wrapEl.querySelector("." + P + "len"), msgEl = wrapEl.querySelector("." + P + "msg"), readEl = wrapEl.querySelector("." + P + "read"), storyEl = wrapEl.querySelector("." + P + "story");
    const ringsBtn = wrapEl.querySelector('[data-act="rings"]'), doneBtn = wrapEl.querySelector('[data-act="done"]');
    wrapEl.querySelector("." + P + "rows").innerHTML = "<b>STAMPED ROWS</b>" + ROWS.map((r) => `<div>${r}</div>`).join("");
    storyEl.textContent = NOTES.open;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "application");
    svg.setAttribute("aria-label", "Cork board. Drag a thread from one pinned card to another.");
    board.appendChild(svg);
    const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };

    let spool = 0, lengths = LENGTHS, threads = [], revealed = new Set(), questions = [], over = false, rings = true, slackN = 0;
    let rhymeLen = 3, scissors = BD.typed ? 1 : 0, nightDone = false, backView = false;
    const thsEl = wrapEl.querySelector("." + P + "ths");
    let drag = null, kbFrom = null, portrait = false, pos = {}, VB = [1200, 900], fresh = null;
    const listeners = [], timers = [], told = new Set();
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const say = (m, bad) => { msgEl.textContent = m; msgEl.classList.toggle("bad", !!bad); };
    const tell = (m) => { storyEl.textContent = m; };

    TYPES.forEach((t, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "sp"; b.dataset.spool = i; b.setAttribute("role", "radio");
      b.innerHTML = `<svg width="34" height="16" viewBox="0 0 34 16"><path d="M2 8 H32" stroke="${t.col}" stroke-width="${t.dbl ? 7 : 4}" stroke-dasharray="${t.dash || "none"}" stroke-linecap="round"/>${t.dbl ? '<path d="M2 8 H32" stroke="#5a3e22" stroke-width="2"/>' : ""}</svg><span>${t.key} ${t.name.toUpperCase()}</span>`;
      spoolsEl.appendChild(b);
    });
    function paintSide() {
      spoolsEl.querySelectorAll("button").forEach((b, i) => { b.classList.toggle("on", i === spool); b.setAttribute("aria-checked", i === spool); });
      lenEl.innerHTML = `LENGTHS ${lengths}/${LENGTHS} ` + Array.from({ length: LENGTHS }, (_, i) => `<i class="${i < lengths ? "" : "gone"}" style="background:${i < lengths ? TYPES[spool].col : ""}"></i>`).join("");
      if (TYPES[spool] === RHYME) lenEl.innerHTML = `GREEN SPOOL ${rhymeLen}/3 ` + Array.from({ length: 3 }, (_, i) => `<i class="${i < rhymeLen ? "" : "gone"}" style="background:${i < rhymeLen ? RHYME.col : ""}"></i>`).join("");
      ringsBtn.textContent = `PENCIL RINGS · ${rings ? "ON" : "OFF"}`;
      // what each thread rests on (the twist: the board never says whether that is true)
      thsEl.innerHTML = "";
      if (BD.typed) threads.forEach((t, i) => { const d = document.createElement("div"); if (t.frayed) d.className = "fr"; d.innerHTML = `<span>${label(t.a)} – ${label(t.b)} · ${t.frayed ? "frayed" : t.taut ? "taut" : "slack"}<i></i></span>`; d.querySelector("i").textContent = t.rests ? "rests on " + t.rests : "rests on nothing you hold"; if (scissors > 0 && !nightDone && !t.frayed) { const b = document.createElement("button"); b.type = "button"; b.dataset.cut = i; b.textContent = "✂"; b.setAttribute("aria-label", `Cut the thread from ${label(t.a)} to ${label(t.b)}`); d.appendChild(b); } thsEl.appendChild(d); });
      doneBtn.textContent = backView ? "PIN IT BACK" : nightDone ? "UNPIN THE BOARD" : BD.typed ? "LAMP OUT" : "LEAVE THE BOARD";
    }
    function paintQs() {
      qsEl.innerHTML = questions.length ? "" : `<span class="none">QUESTIONS PIN HERE WHEN A THREAD PULLS TAUT</span>`;
      questions.forEach((q) => {
        if (QART[q] && art.has(QART[q])) { const im = document.createElement("img"); im.className = "qa" + (q === fresh && !RM ? " fresh" : ""); im.alt = q; im.title = q; im.src = art.url(QART[q]); qsEl.appendChild(im); return; }
        const d = document.createElement("span"); d.className = "q" + (q === fresh && !RM ? " fresh" : ""); d.textContent = q; qsEl.appendChild(d);
      });
    }
    function readCard(id) {
      const g = GUESTS.find((x) => x.id === id), o = OTHERS.find((x) => x.id === id);
      readEl.innerHTML = "";
      const h = document.createElement("h3"); h.textContent = g ? `ROOM ${g.name}` : o.name; readEl.appendChild(h);
      if (g) g.clues.forEach((c) => { const p = document.createElement("p"); p.textContent = "· " + c; readEl.appendChild(p); });
      else { const p = document.createElement("p"); p.className = "t"; p.textContent = o.about; readEl.appendChild(p); }
      if (READART[id] && art.has(READART[id][0])) { const im = document.createElement("img"); im.className = "ra"; im.alt = READART[id][1]; im.title = READART[id][1]; im.src = art.url(READART[id][0]); readEl.appendChild(im); }
      const links = threads.filter((t) => t.a === id || t.b === id);
      if (links.length) { const s = document.createElement("small"); s.textContent = "Threads: " + links.map((t) => `${t.taut ? "taut" : "slack"} ${TYPES.find((x) => x.id === t.type).name} to ${label(t.a === id ? t.b : t.a)}`).join("; "); readEl.appendChild(s); }
    }
    const label = (id) => { const g = GUESTS.find((x) => x.id === id); return g ? g.name : OTHERS.find((x) => x.id === id).name.replace(/^THE /, "").toLowerCase(); };

    const ARTID = (id) => (id[0] === "r" && id.length === 4 ? "pin-guest-" + id.slice(1) : "pin-" + id.replace(/_/g, "-"));
    const hasArt = (id) => art.has(ARTID(id));
    const QART = { "What did she give him?": "question-give", "What did she take?": "question-take", "Who is he guarding it for?": "question-guarding", "Why did she call?": "question-sisters" };
    const READART = { gala: ["clipping-caterers", "The Evening Courant: Gala caterers briefed tonight"], r402: ["clipping-orchid", "The Evening Courant: Orchid week at the Glasshouse"], stranger: ["thread-own", "A clock stopped at 2:14"] };
    function computeLayout() {
      const w = board.clientWidth || 1000, h = board.clientHeight || 700;
      portrait = w < 640 || w / h < 0.95;
      pos = {};
      const others = OTHERS.filter((o) => !o.hidden || revealed.has(o.id));
      if (!portrait) {
        VB = [1200, 900];
        const n = others.length, cw = Math.min(150, 1120 / n);
        const cwa = Math.min(162, 1130 / n);
        others.forEach((o, i) => { pos[o.id] = hasArt(o.id) ? { x: 600 - (n - 1) * cwa / 2 + i * cwa, y: 158, w: cwa - 12, h: (cwa - 12) * 240 / 260, art: true } : { x: 600 - (n - 1) * cw / 2 + i * cw, y: 150, w: cw - 16, h: 66 }; });
        GUESTS.forEach((g, i) => { pos[g.id] = hasArt(g.id) ? { x: 115 + i * 194, y: 448, w: 156, h: 216, guest: true, art: true } : { x: 115 + i * 194, y: 430, w: 150, h: 170, guest: true }; });
        pos.rows = { x: 40, y: 712, cols: 2, cw: 560, rh: 42 };
      } else {
        VB = [800, Math.max(900, Math.min(1300, 800 * h / w))];
        const pa = BASE_OTHERS.every((o) => hasArt(o.id)) && GUESTS.every((g) => hasArt(g.id));
        if (pa) {
          // the art's cards: four across for the things, three across for the guests
          others.forEach((o, i) => { pos[o.id] = { x: 108 + (i % 4) * 195, y: 112 + Math.floor(i / 4) * 184, w: 184, h: hasArt(o.id) ? 170 : 110, big: true, art: hasArt(o.id) }; });
          const gy1 = 112 + Math.ceil(others.length / 4) * 184 + 110;
          GUESTS.forEach((g, i) => { pos[g.id] = { x: 140 + (i % 3) * 260, y: gy1 + Math.floor(i / 3) * 370, w: 204, h: 282, guest: true, big: true, art: true }; });
          VB[1] = Math.max(VB[1], gy1 + 370 + 220);
        } else {
        others.forEach((o, i) => { pos[o.id] = { x: 140 + (i % 3) * 260, y: 90 + Math.floor(i / 3) * 112, w: 236, h: 88, big: true }; });
        const gy0 = 90 + Math.ceil(others.length / 3) * 112 + 150;
        GUESTS.forEach((g, i) => { pos[g.id] = { x: 140 + (i % 3) * 260, y: gy0 + Math.floor(i / 3) * 330, w: 220, h: 230, guest: true, big: true }; });
        VB[1] = Math.max(VB[1], gy0 + 330 + 160);
        }
        pos.rows = null;
      }
      svg.setAttribute("viewBox", `0 0 ${VB[0]} ${VB[1]}`);
    }
    // where the thread ties on: the art's own pin, or the brass pin drawn here
    const pinPt = (id) => (pos[id].art ? { x: pos[id].x, y: pos[id].y - pos[id].h / 2 + pos[id].h * (pos[id].guest ? 34 / 360 : 40 / 240) } : { x: pos[id].x, y: pos[id].y - (pos[id].guest ? pos[id].h / 2 + 4 : pos[id].h / 2 - 6) });

    function threadPath(a, b, taut) {
      if (taut) return `M${a.x},${a.y} L${b.x},${b.y}`;
      const mx = (a.x + b.x) / 2, my = Math.max(a.y, b.y) + 60 + Math.hypot(b.x - a.x, b.y - a.y) * 0.18;
      return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    }
    function drawThread(g, a, b, type, taut, extra = {}) {
      const t = TYPES.find((x) => x.id === type);
      const d = threadPath(a, b, taut);
      const w = portrait ? 6 : 3.6;
      if (t.dbl) {
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": w * 2.2, opacity: taut ? 1 : 0.8, ...extra }, g);
        el("path", { d, fill: "none", stroke: "#5a3e22", "stroke-width": w * 0.7, ...extra }, g);
      } else {
        el("path", { d, fill: "none", stroke: "#0006", "stroke-width": w + 1, transform: "translate(2 3)", ...extra }, g);
        el("path", { d, fill: "none", stroke: t.col, "stroke-width": w, "stroke-dasharray": t.dash, "stroke-linecap": "round", opacity: taut ? 1 : 0.85, ...extra }, g);
      }
    }

    function render() {
      computeLayout();
      svg.innerHTML = "";
      const defs = el("defs", {}, svg);
      const pat = el("pattern", { id: P + "cork", width: 60, height: 60, patternUnits: "userSpaceOnUse" }, defs);
      el("rect", { width: 60, height: 60, fill: art.has("pin-case") ? "#b5824e" : "#b07a45" }, pat);
      const rng = api.rng(7);
      for (let i = 0; i < 40; i++) el("circle", { cx: rng() * 60, cy: rng() * 60, r: 0.6 + rng() * 1.6, fill: rng() < 0.5 ? "#7a4a24" : "#d29a5e", opacity: 0.7 }, pat);
      el("rect", { x: 0, y: 0, width: VB[0], height: VB[1], fill: "#5a3e22" }, svg);
      el("rect", { x: 12, y: 12, width: VB[0] - 24, height: VB[1] - 24, fill: `url(#${P}cork)` }, svg);
      // old pin holes and a coffee ring, for wear
      for (let i = 0; i < 30; i++) el("circle", { cx: 30 + rng() * (VB[0] - 60), cy: 30 + rng() * (VB[1] - 60), r: 1.6, fill: "#3a2716", opacity: 0.6 }, svg);
      el("circle", { cx: VB[0] * 0.86, cy: VB[1] * 0.9, r: 46, fill: "none", stroke: "#6a4220", "stroke-width": 5, opacity: 0.25 }, svg);
      if (pos.rows) {
        const rh = el("text", { x: pos.rows.x, y: pos.rows.y - 12, "font-family": "Courier New,monospace", "font-size": 18, "font-weight": 700, fill: "#2a1a0c" }, svg);
        rh.textContent = "STAMPED STATEMENT ROWS";
        ROWS.forEach((r, i) => {
          const x = pos.rows.x + (i % pos.rows.cols) * pos.rows.cw, y = pos.rows.y + Math.floor(i / pos.rows.cols) * pos.rows.rh;
          el("rect", { x, y, width: pos.rows.cw - 12, height: pos.rows.rh - 8, fill: "#efe6cf", stroke: "#b8a77f", transform: `rotate(${(i % 2) ? 0.6 : -0.5} ${x} ${y})` }, svg);
          const t = el("text", { x: x + 10, y: y + 24, "font-family": "Courier New,monospace", "font-size": 19, fill: "#2a3a8c" }, svg);
          t.textContent = r;
        });
      }
      const under = el("g", {}, svg);
      const cards = el("g", {}, svg);
      const over_ = el("g", {}, svg);
      for (const th of threads) if (!th.taut && pos[th.a] && pos[th.b]) drawThread(under, pinPt(th.a), pinPt(th.b), th.type, false, th.frayed ? { opacity: 0.35 } : {});

      if (backView) { drawBack(); paintSide(); return; }
      const unused = new Map();
      if (rings) for (const L of LINKS) {
        if (!pos[L.a] || !pos[L.b]) continue;
        if (threads.some((t) => t.taut && pairKey(t.a, t.b) === pairKey(L.a, L.b))) continue;
        unused.set(L.a, L.type); unused.set(L.b, L.type);
      }
      const all = [...OTHERS.filter((o) => pos[o.id]), ...GUESTS];
      all.forEach((o, i) => {
        const p = pos[o.id];
        const g = el("g", { class: P + "pin", "data-pin": o.id, tabindex: 0, role: "button", "aria-label": `Pin: ${p.guest ? "Room " + o.name : o.name}`, transform: p.art ? "" : `rotate(${((i * 37) % 7) - 3} ${p.x} ${p.y})` }, cards);
        if (p.art) {
          const top = p.y - p.h / 2;
          if (o.id === fresh) el("rect", { x: p.x - p.w / 2 - 5, y: top - 5, width: p.w + 10, height: p.h + 10, fill: "none", stroke: "#f6cf86", "stroke-width": 4, rx: 4 }, g);
          const im = el("image", { class: P + "card", x: p.x - p.w / 2, y: top, width: p.w, height: p.h, preserveAspectRatio: "none" }, g);
          im.setAttribute("href", art.url(ARTID(o.id)));
          if (p.guest) {
            const sw = p.w - 8, sh = p.big ? 50 : 34;
            el("rect", { x: p.x - sw / 2, y: top + p.h + 4, width: sw, height: sh, fill: "#fbf6e8", stroke: "#c9bc98", transform: `rotate(${(i % 2) ? 1.2 : -1} ${p.x} ${top + p.h})` }, g);
            const ct = el("text", { x: p.x, y: top + p.h + sh - (p.big ? 12 : 7), "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": p.big ? 25 : 16, fill: "#2a3a8c" }, g);
            ct.textContent = `${o.clues.length} CARD${o.clues.length === 1 ? "" : "S"} · READ`;
          }
        } else if (p.guest) {
          const top = p.y - p.h / 2;
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: top, width: p.w, height: p.h, fill: "#f4f1ea", stroke: "#cfc6b0", "stroke-width": 1.5 }, g);
          el("rect", { x: p.x - p.w / 2 + 10, y: top + 10, width: p.w - 20, height: p.h * 0.6, fill: "#2b3540" }, g);
          const hc = top + 10 + p.h * 0.3;
          el("circle", { cx: p.x, cy: hc - p.h * 0.06, r: p.w * 0.12, fill: "#14181c" }, g);
          el("path", { d: `M${p.x - p.w * 0.26},${top + 10 + p.h * 0.6} Q${p.x - p.w * 0.22},${hc + p.h * 0.08} ${p.x},${hc + p.h * 0.06} Q${p.x + p.w * 0.22},${hc + p.h * 0.08} ${p.x + p.w * 0.26},${top + 10 + p.h * 0.6}Z`, fill: "#14181c" }, g);
          const t = el("text", { x: p.x, y: top + p.h - (p.big ? 22 : 18), "text-anchor": "middle", "font-family": "Georgia,serif", "font-weight": 700, "font-size": p.big ? 44 : 28, fill: "#1c1a17" }, g);
          t.textContent = o.name;
          // the clue slips, typed and pinned under the photo
          const sw = p.w + 10, sh = p.big ? 54 : 40;
          el("rect", { x: p.x - sw / 2, y: top + p.h + 6, width: sw, height: sh, fill: "#fbf6e8", stroke: "#c9bc98" }, g);
          for (let k = 0; k < 2; k++) el("line", { x1: p.x - sw / 2 + 8, x2: p.x + sw / 2 - 8 - k * 30, y1: top + p.h + 16 + k * 8, y2: top + p.h + 16 + k * 8, stroke: "#2a3a8c", opacity: 0.25, "stroke-width": 2 }, g);
          const ct = el("text", { x: p.x, y: top + p.h + sh - (p.big ? 10 : 8), "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": p.big ? 26 : 16, fill: "#2a3a8c" }, g);
          ct.textContent = `${o.clues.length} CARD${o.clues.length === 1 ? "" : "S"} · READ`;
        } else {
          el("rect", { class: P + "card", x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, fill: o.id === fresh ? "#fff7d6" : "#efe6cf", stroke: "#b8a77f", "stroke-width": 1.5 }, g);
          el("line", { x1: p.x - p.w / 2, x2: p.x + p.w / 2, y1: p.y - p.h / 2 + 18, y2: p.y - p.h / 2 + 18, stroke: "#a3302a", opacity: 0.5 }, g);
          const fs = p.big ? 28 : 17;
          const lines = wrapText(o.name, Math.max(6, Math.floor(p.w / (fs * 0.62))));
          lines.forEach((l, k) => { const t = el("text", { x: p.x, y: p.y + 12 + (k - (lines.length - 1) / 2) * (fs + 2), "text-anchor": "middle", "font-family": "Courier New,monospace", "font-weight": 700, "font-size": fs, fill: "#1c1a17" }, g); t.textContent = l; });
        }
        const pp = pinPt(o.id), pr = p.big ? 14 : 9;
        if (unused.has(o.id)) el("circle", { cx: pp.x, cy: pp.y, r: pr * 2.1, fill: "none", stroke: gentle ? TYPES.find((t) => t.id === unused.get(o.id)).col : "#3a3a3a", "stroke-width": gentle ? 3 : 1.6, "stroke-dasharray": "5 4", opacity: 0.85 }, g);
        const sel = (drag && drag.from === o.id) || kbFrom === o.id;
        if (p.art) { if (sel) el("circle", { cx: pp.x, cy: pp.y, r: pr * 1.5, fill: "none", stroke: "#f6cf86", "stroke-width": 4 }, g); }
        else {
        el("circle", { cx: pp.x + 1.5, cy: pp.y + 2.5, r: pr, fill: "#0005" }, g);
        el("circle", { cx: pp.x, cy: pp.y, r: sel ? pr * 1.3 : pr, fill: sel ? "#f6cf86" : "#b8913f", stroke: "#3b2a0e", "stroke-width": 1.5 }, g);
        }
      });
      for (const th of threads) if (th.taut) drawThread(over_, pinPt(th.a), pinPt(th.b), th.type, true, { "pointer-events": "none" });
      if (drag && drag.pt) {
        const a = pinPt(drag.from), t = TYPES[spool];
        const over = pinAt(drag.pt);
        el("line", { x1: a.x, y1: a.y, x2: drag.pt.x, y2: drag.pt.y, stroke: t.col, "stroke-width": portrait ? 6 : 3.5, "stroke-dasharray": t.dash || "none", "pointer-events": "none" }, svg);
        if (over && over !== drag.from) { const q = pinPt(over); el("circle", { cx: q.x, cy: q.y, r: portrait ? 26 : 16, fill: "none", stroke: "#f6cf86", "stroke-width": 3, "pointer-events": "none" }, svg); }
      }
      paintSide();
    }

    // the back of the board: last season's mosaic in pinholes, the same shape, and one hole more
    function drawBack() {
      svg.innerHTML = "";
      el("rect", { x: 0, y: 0, width: VB[0], height: VB[1], fill: "#2a1a0c" }, svg);
      el("rect", { x: 12, y: 12, width: VB[0] - 24, height: VB[1] - 24, fill: "#6b5235" }, svg);
      const r2 = api.rng(11);
      for (let i = 0; i < 140; i++) el("line", { x1: 20 + r2() * (VB[0] - 40), y1: 20 + r2() * (VB[1] - 40), x2: 20 + r2() * (VB[0] - 40), y2: 20 + r2() * (VB[1] - 40), stroke: "#5a4429", "stroke-width": 1, opacity: 0.25 }, svg);
      const mir = (p) => ({ x: VB[0] - p.x, y: p.y });
      for (const th of threads) if (th.taut && pos[th.a] && pos[th.b]) { const a = mir(pinPt(th.a)), b = mir(pinPt(th.b)); el("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "#3a2716", "stroke-width": 2, "stroke-dasharray": "2 9", opacity: 0.7 }, svg); }
      for (const id in pos) { if (!pos[id] || pos[id].w == null) continue; const p = mir(pinPt(id)); el("circle", { cx: p.x, cy: p.y, r: portrait ? 8 : 5, fill: "#1a0f06" }, svg); el("circle", { cx: p.x, cy: p.y, r: portrait ? 15 : 10, fill: "none", stroke: "#3a2716", opacity: 0.5 }, svg); }
      const ex = { x: VB[0] / 2, y: VB[1] - (portrait ? 150 : 110) };
      el("circle", { cx: ex.x, cy: ex.y, r: portrait ? 9 : 6, fill: "#1a0f06", "data-extra": 1 }, svg); el("circle", { cx: ex.x, cy: ex.y, r: portrait ? 24 : 16, fill: "none", stroke: "#e9dcc0", "stroke-dasharray": "4 5", opacity: 0.7 }, svg);
      const t = el("text", { x: VB[0] / 2, y: portrait ? 60 : 56, "text-anchor": "middle", "font-family": "Courier New,monospace", "font-size": portrait ? 26 : 20, "font-weight": 700, fill: "#e9dcc0", opacity: 0.85 }, svg); t.textContent = "THE BACK OF THE BOARD";
    }
    function night() {
      nightDone = true;
      const fr = threads.filter((t) => t.typed && t.taut);
      fr.forEach((t) => { t.taut = false; t.frayed = true; questions = questions.filter((q) => q !== t.q); });
      paintQs();
      say(fr.length ? `The lamp goes out. In the morning ${fr.length === 1 ? "one thread has" : fr.length + " threads have"} frayed through: ${fr.map((t) => label(t.a) + " – " + label(t.b)).join(", ")}. ${fr.length === 1 ? "It" : "They"} rested on a typed row and on nothing you saw.` : "The lamp goes out. In the morning every thread you tied is still taut.", fr.length > 0);
      tell("The board hangs on two nails. Nobody has ever taken it down.");
      render(); doneBtn.focus();
    }
    function link(a, b) {
      if (over || nightDone || a === b) return;
      if (TYPES[spool] === RHYME) {
        if (threads.some((t) => pairKey(t.a, t.b) === pairKey(a, b))) { say("A thread already runs between those two.", true); render(); return; }
        if (rhymeLen <= 0) { say("The green spool is empty.", true); return; }
        const th = THINGS.find((x) => (x.id === a && x.with === b) || (x.id === b && x.with === a));
        rhymeLen--; threads.push({ a, b, type: "rhyme", taut: !!th, rhyme: true, rests: th ? "a rhyme: last season's thing, this season's habit" : "" });
        if (th) { say(`A rhyme. ${th.slip}`); tell("The green thread is from lost property. It does not join two people. It joins a season to the one before."); questions.push("LAST SEASON · " + th.name); paintQs(); }
        else say("The green thread hangs slack. A left thing rhymes with one guest's habit, or with nobody's.", true);
        render(); return;
      }
      if (lengths <= 0) return;
      if (threads.some((t) => pairKey(t.a, t.b) === pairKey(a, b))) { say("A thread already runs between those two.", true); render(); return; }
      const type = TYPES[spool].id;
      const L = LINKS.find((l) => pairKey(l.a, l.b) === pairKey(a, b) && l.type === type);
      lengths--;
      threads.push({ a, b, type, taut: !!L, typed: !!(L && L.typed), q: L && L.q, rests: L ? (L.typed ? `a typed row: “${L.typed}”` : RESTS[pairKey(a, b)] || "what you saw") : "" });
      if (L) {
        questions.push(L.q); fresh = L.q;
        if (L.adds) { revealed.add(L.adds); fresh = L.adds; }
        say(`Taut. “${L.q}” pins to the top.${L.adds ? " A new card goes up." : ""}`);
        if (L.adds === "case") tell(NOTES.case);
        else if (L.adds === "drost") tell(NOTES.drost);
        else if (!told.has("taut")) { told.add("taut"); tell(NOTES.taut); }
        paintQs(); fresh = L.adds || null;
      } else {
        slackN++;
        say(`Slack: ${label(a)} and ${label(b)} as "${TYPES[spool].name}". One length gone.`, true);
        if (!told.has("slack")) { told.add("slack"); tell(NOTES.slack); }
      }
      if (slackN >= 1 && ringsBtn.hidden) { ringsBtn.hidden = false; ringsBtn.classList.add("new"); timers.push(setTimeout(() => ringsBtn.classList.remove("new"), 3200)); }
      if (lengths === 2) tell(NOTES.last);
      render();
      if (lengths <= 0) { if (BD.typed) { if (scissors <= 0) night(); else say("The last length is tied. Cut one thread if you doubt it, then put the lamp out."); } else finish(); }
    }
    function finish() {
      if (over) return;
      over = true;
      const taut = threads.filter((t) => t.taut && !t.rhyme).length, tied = threads.filter((t) => !t.rhyme).length, rh = threads.filter((t) => t.rhyme && t.taut).length, fr = threads.filter((t) => t.frayed).length;
      api.store.set("best", Math.max(api.store.get("best", 0), taut));
      const outcome = taut >= BD.need ? "win" : taut >= BD.need - 2 ? "done" : "lose";
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      const rhy = rh ? ` ${rh} green rhyme${rh === 1 ? "" : "s"} with last season.` : "";
      let text = `${taut} of ${tied} threads pulled taut; ${questions.length} question${questions.length === 1 ? "" : "s"} pinned for tonight.${rhy} `;
      if (stage.stage === 0) text += taut >= 3 ? "Three things you saw now hold each other up. Tomorrow's board has more links than you have thread." : "Read the cards before you tie on: the orchid, the lanyard, the phone.";
      else if (stage.stage === 2) text = `${taut} thread${taut === 1 ? "" : "s"} still taut after the night${fr ? `, ${fr} frayed through` : ""}.${rhy} ` + (taut >= BD.need ? "You tied nothing on Wren's typing, or cut it in time. " : "A thread on a typed row pulls taut and proves nothing. ") + "On the back of the board, last season's mosaic in pinholes: the same shape as yours, and one hole more at the bottom, in the middle, where your board has no card.";
      else text += taut >= 5 ? "“Their stories overlap. Their secrets rhyme. Their patterns converge.” You can see it on the cork now, and you can see how little of it is yours to know."
            : taut >= 3 ? "Some of it holds. The rest hangs slack until another night's evidence comes home."
              : "Mostly slack thread, and few questions to carry into the night. Read the cards before you tie on: the clay, the tag, the phone.";
      timers.push(setTimeout(() => api.end({ outcome, text }), 1100));
    }

    function svgPt(e) {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(m.inverse());
      return { x: q.x, y: q.y };
    }
    function pinAt(pt) {
      let best = null, bd = 1e9;
      for (const id in pos) {
        const p = pos[id]; if (!p || p.w == null) continue;
        const top = p.y - p.h / 2 - 22, bot = p.y + p.h / 2 + (p.guest ? 64 : 6);
        if (pt.x >= p.x - p.w / 2 - 8 && pt.x <= p.x + p.w / 2 + 8 && pt.y >= top && pt.y <= bot) {
          const d = Math.hypot(pt.x - p.x, pt.y - p.y); if (d < bd) { bd = d; best = id; }
        }
      }
      return best;
    }
    on(spoolsEl, "click", (e) => { const b = e.target.closest("[data-spool]"); if (!b || over) return; spool = +b.dataset.spool; render(); });
    on(ringsBtn, "click", () => { rings = !rings; render(); });
    on(doneBtn, "click", () => {
      if (over) return;
      if (!BD.typed) { finish(); return; }
      if (!nightDone) { night(); return; }
      if (!backView) { backView = true; say("You lift it off its nails and turn it over."); tell("Pinholes. Somebody kept a mosaic on this board before you, and it was the same shape as yours. One hole more, bottom centre."); render(); return; }
      finish();
    });
    on(thsEl, "click", (e) => {
      const b = e.target.closest("[data-cut]"); if (!b || over || nightDone || scissors <= 0) return;
      const t = threads[+b.dataset.cut]; threads.splice(+b.dataset.cut, 1); scissors--;
      if (t.rhyme) rhymeLen++; else lengths++;
      if (t.q) { questions = questions.filter((q) => q !== t.q); paintQs(); }
      say(`Cut: ${label(t.a)} – ${label(t.b)}. The length is back on its spool. The scissors go back in the drawer until tomorrow.`); render();
    });
    on(svg, "pointerdown", (e) => {
      if (over || backView) return;
      const id = pinAt(svgPt(e));
      if (!id) { if (kbFrom) { kbFrom = null; say(""); render(); } return; }
      readCard(id);
      if (kbFrom && kbFrom !== id) { const f = kbFrom; kbFrom = null; link(f, id); return; }
      drag = { from: id, pt: null, moved: false };
      svg.setPointerCapture && svg.setPointerCapture(e.pointerId);
      render();
    });
    let hoverId = null;
    on(svg, "pointermove", (e) => {
      const pt = svgPt(e);
      if (!drag) { const id = pinAt(pt); if (id && id !== hoverId) { hoverId = id; readCard(id); } return; }
      drag.pt = pt; drag.moved = true; render();
    });
    on(svg, "pointerup", (e) => {
      if (!drag) return;
      const from = drag.from, moved = drag.moved;
      drag = null;
      const id = pinAt(svgPt(e));
      if (id && id !== from) { link(from, id); return; }
      if (!moved) { kbFrom = from === kbFrom ? null : from; say(kbFrom ? `Thread tied on at ${label(from)}. Tap the card it runs to.` : ""); render(); return; }
      render();
    });
    on(svg, "focusin", (e) => { const g = e.target.closest && e.target.closest("[data-pin]"); if (g) readCard(g.dataset.pin); });
    on(svg, "keydown", (e) => {
      if (over) return;
      const g = e.target.closest && e.target.closest("[data-pin]");
      if ((e.key === "Enter" || e.key === " ") && g) {
        e.preventDefault();
        const id = g.dataset.pin;
        if (!kbFrom) { kbFrom = id; say(`Thread tied on at ${label(id)}. Tab to the card it runs to and press Enter.`); render(); }
        else if (kbFrom === id) { kbFrom = null; say(""); render(); }
        else { const f = kbFrom; kbFrom = null; link(f, id); }
        const again = svg.querySelector(`[data-pin="${id}"]`); if (again) again.focus();
      }
    });
    on(window, "keydown", (e) => {
      if (over || wrapEl.querySelector("." + P + "intro")) return;
      if (/^[1-5]$/.test(e.key) && +e.key <= TYPES.length) { spool = +e.key - 1; render(); }
      if ((e.key === "r" || e.key === "R") && !ringsBtn.hidden) { rings = !rings; render(); }
      if (e.key === "Escape") { kbFrom = null; drag = null; say(""); render(); }
    });
    const ro = new ResizeObserver(() => render());
    ro.observe(board);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}note">${art.has("chapter-n" + BD.night) ? `<img class="ch" alt="Night ${BD.night}" src="${art.url("chapter-n" + BD.night)}">` : ""}<h2>THE MOSAIC · NIGHT ${BD.night}</h2>
      <p class="goal">${BD.goal}</p>
      <p class="open"></p>
      <ul>
        <li><b>SPOOL</b> keys 1–4 or tap: <span style="color:#b8322a;font-weight:700">met</span>, <span style="color:#2f5fb0;font-weight:700">works for</span>, <span style="color:#a8862a;font-weight:700">family</span>, <b style="min-width:0">after</b>.</li>
        <li><b>THREAD</b> drag one pin to another, or tap one then the other.</li>
        <li><b>READ</b> hover or tap a card: its clue cards show at the side.</li>
        ${BD.typed ? "<li><b>SCISSORS</b> ✂ beside a thread: cut it, once, and its length comes back.</li>" : ""}${LOSTP ? "<li><b>GREEN</b> key 5, from lost property: tie a left thing to the guest it rhymes with.</li>" : ""}
      </ul>
      <div class="ft">${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> rings drawn in the colour of the thread they want</label>` : "<span>A true link pulls taut; a wrong one hangs slack.</span>"}<button type="button" class="${P}btn">TO THE BOARD</button></div></div>`;
    intro.querySelector(".open").textContent = BD.open + (LOSTP ? " Because you opened lost property in Lockwork, a green spool lies with the others, and three of the left things are pinned along the top." : "");
    intro.querySelector("ul").after(stage.row(P + "btn"));
    storyEl.textContent = BD.open;
    wrapEl.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); render(); });
    const sb = [...intro.querySelectorAll("button")].pop();
    on(sb, "click", () => { intro.remove(); render(); });
    render();
    sb.focus();

    return {
      unmount() {
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
});

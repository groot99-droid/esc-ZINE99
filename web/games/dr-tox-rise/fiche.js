// Dr. Tox: Rise, 1D game: Fiche (DESIGN.md section 11, `g1_fiche`; scene `s1_fiche_1`, chapter 9).
// Scratchboard: white lines cut from a black ground, frames of an index card grid. The one colour on the
// page is the amber cell on the sheet that marks the frame being read (the reader's lamp).
//
// Indexed retrieval on microfiche. Six sheets of 168 frames (rows A to N, columns 1 to 12) hold the
// thousand subjects of the river study. The index (a card of its own) lists every subject by number in
// Roman numerals with a sheet, row and column, and their distinguishing marks. Set the carrier (sheet,
// row, column), turn the focus knob until the frame is sharp, and the frame reads its name aloud.
//   Stage 1: find CMXCIX, his own file (`fiche.own_file_found`).
//   Stage 2: search the index's marks for what the player noticed by the river in chapter 3
//            (`river.details`); each child found is read aloud by name (`fiche.children_found`).
//   Stage 3: his file's SEE leads, through a chain of three, to "BIOSYNTH, SEE CORRIDOR C": follow it.
// Every subject frame read counts toward `fiche.names_read`. The lamp fails at six minutes: the hum calls
// him on, and the names not read stay unread.
//
// Art (api.art): fiche-sheet, fiche-hood, fiche-tray, fiche-knob, fiche-lamp, fiche-see, fiche-frame-blank,
// fiche-frame-cmxcix, fiche-frame-biosynth and the four fiche-mark-* cards. Each one falls back to a
// drawing in CSS when the id is missing. The index is drawn in CSS so it stays readable at 390 px.
//
// Added for the game (not in DESIGN.md): the 994 other subjects' names and marks (generated from two
// fixed lists), the children's subject numbers, the frames' positions, the two middle links of the
// cross-reference chain (a study log and a transfer slip) and their wording, and the page's own UI lines.
// Dale, June and Hollis have no surname in the design, so their surnames are cut away on the fiche.
// Where no `river.details` was written (chapter 3 is a 3D scene, not on the web), the how-to card stands in
// for the river and shows all four details once.

const P = "dtr-fiche-";
const BK = "#0a0a0a", CUT = "#efeee8", AMBER = "#D99A2B";
const ROWS = "ABCDEFGHIJKLMN";
const SHEETS = 6, NR = 14, NC = 12;
const LAMP_MS = 6 * 60 * 1000;
const FOCUS_TOL = 5;
const READ_MS = 450;
const OWN = 999;

const roman = (n) => {
  const t = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = "";
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const coord = (s, r, c) => `${s + 1}·${ROWS[r]}·${c + 1}`;

// ---- the archive (fixed, so a second visit finds the same sheets) ------------------------------------
const FIRST = ["Ada", "Abel", "Amos", "Anya", "Asa", "Bea", "Bram", "Cal", "Cora", "Dev", "Eli", "Elsie", "Emmett", "Esme", "Ezra",
  "Faye", "Finn", "Gus", "Hattie", "Ida", "Ines", "Ivo", "Jo", "Jonah", "Kit", "Lark", "Lena", "Levi", "Lio", "Mae", "Mabel", "Milo",
  "Nina", "Noor", "Oren", "Otto", "Pia", "Quinn", "Rafe", "Rosa", "Ruby", "Sam", "Sela", "Tam", "Teo", "Tess", "Uma", "Vera", "Wes",
  "Wren", "Yuri", "Zia", "Abe", "Clem", "Delia", "Etta", "Hugo", "Iris", "Juno", "Lou", "Mina", "Ned", "Opal", "Rhea", "Silas",
  "Theo", "Vida", "Ward", "Willa", "Bo", "Cass", "Dot", "Eden", "Gil", "Hal", "Ike", "Joss", "Kay", "Lyle", "Nan"];
const LAST = ["Abernathy", "Baird", "Calder", "Dunmore", "Ekberg", "Farrow", "Galloway", "Hadley", "Ingram", "Jessop", "Kittredge",
  "Lindqvist", "Marsh", "Nakamura", "Oduya", "Pruitt", "Quill", "Renner", "Salas", "Thibodeaux", "Underhill", "Varga", "Whitlock",
  "Zeller", "Ames", "Brandt", "Castillo", "Dryden", "Eames", "Fenwick", "Gault", "Hask", "Ivers", "Juarez", "Kessler", "Lowry",
  "Mendez", "Novak", "Orr", "Petrakis", "Rasmussen", "Sorensen", "Tate", "Ulrich", "Vance", "Weller", "Yoder", "Aldana", "Birch",
  "Coyle", "Delgado", "Engstrom", "Fisk", "Greer", "Holm", "Imai", "Jansen", "Kowal", "Lund", "Pike"];
const MARKS = ["NONE RECORDED", "NONE RECORDED", "NONE RECORDED", "NONE RECORDED", "NONE RECORDED", "NONE RECORDED",
  "MOLE, LEFT CHEEK", "CHIPPED FRONT TOOTH", "BIRTHMARK, NAPE", "FRECKLES", "SCAR ABOVE RIGHT BROW", "EARS PIERCED", "GLASSES",
  "GAP IN FRONT TEETH", "DIMPLE, LEFT", "HEARING AID, RIGHT", "CURLS, RED", "LEFT-HANDED", "STAMMER", "BITTEN NAILS"];

// the river children (DESIGN.md section 6, "The river children (added)")
const KIDS = [
  { key: "dale", n: 212, first: "Dale", shown: "Dale", marks: "TWO-WHEELER, ONE TRAINING WHEEL LEFT ON", art: "fiche-mark-wheel",
    detail: "a two-wheeler with one training wheel left on", words: ["bike", "bicycle", "two-wheeler", "wheel", "training", "cycle"] },
  { key: "june", n: 388, first: "June", shown: "June", marks: "CHALK NUMBERS ON THE KERB, COUNTING DOWN", art: "fiche-mark-chalk",
    detail: "chalk numbers on the kerb, counting down to her birthday", words: ["chalk", "numbers", "kerb", "curb", "birthday", "counting", "countdown"] },
  { key: "twins", n: 641, first: "Mira", last: "Ostrowski", shown: "Mira Ostrowski", marks: "MATCHING SCABS ON MATCHING KNEES", art: "fiche-mark-scabs",
    detail: "matching scabs on matching knees, from the same fall", words: ["scab", "scabs", "knee", "knees", "twin", "twins", "fall", "ostrowski"] },
  { key: "twins", n: 642, first: "Pell", last: "Ostrowski", shown: "Pell Ostrowski", marks: "MATCHING SCABS ON MATCHING KNEES", art: "fiche-mark-scabs",
    detail: "matching scabs on matching knees, from the same fall", words: ["scab", "scabs", "knee", "knees", "twin", "twins", "fall", "ostrowski"] },
  { key: "hollis", n: 857, first: "Hollis", shown: "Hollis", marks: "JAR OF MINNOWS FROM THE RIVER, ON A WINDOWSILL", art: "fiche-mark-minnows",
    detail: "a jar of minnows from the river, kept on a windowsill", words: ["jar", "minnow", "minnows", "fish", "windowsill", "window", "river"] },
];
const CHILD_KEYS = ["dale", "june", "twins", "hollis"];
const CHILD_LABEL = { dale: "Dale", june: "June", twins: "Mira and Pell Ostrowski", hollis: "Hollis" };

// the cross-reference chain from his file: 3·F·8, then 5·K·2, then 2·C·11 (BIOSYNTH)
const CHAIN = [
  { id: "log", s: 2, r: 5, c: 7, title: "RCC · STUDY LOG", lines: [["COHORT", "RIVER, 1,000 SUBJECTS"], ["COVER", "ENVIRONMENTAL CONTAMINATION EVENT"], ["RETAINED", "ONE"]] },
  { id: "transfer", s: 4, r: 10, c: 1, title: "RCC · TRANSFER", lines: [["MATERIAL", "SUBJECT CMXCIX, SAMPLES"], ["TO", "BIOSYNTH DIVISION"], ["BY", "CORRIDOR C"]] },
  { id: "biosynth", s: 1, r: 2, c: 10, title: "RCC · BIOSYNTH" },
];

function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function buildArchive() {
  const rnd = mulberry(20262207);
  const subjects = new Map();
  const used = new Set(["Balklin, Alexander"]);
  subjects.set(OWN, { n: OWN, name: "BALKLIN, ALEXANDER", shown: "Alexander Balklin", marks: "", own: true });
  for (const k of KIDS) {
    subjects.set(k.n, { n: k.n, name: k.last ? `${k.last.toUpperCase()}, ${k.first.toUpperCase()}` : `—, ${k.first.toUpperCase()}`,
      cutSurname: !k.last, shown: k.shown, marks: k.marks, kid: k });
  }
  for (let n = 1; n <= 1000; n++) {
    if (subjects.has(n)) continue;
    let f, l;
    do { f = FIRST[Math.floor(rnd() * FIRST.length)]; l = LAST[Math.floor(rnd() * LAST.length)]; } while (used.has(l + ", " + f));
    used.add(l + ", " + f);
    subjects.set(n, { n, name: `${l.toUpperCase()}, ${f.toUpperCase()}`, shown: `${f} ${l}`, marks: MARKS[Math.floor(rnd() * MARKS.length)] });
  }
  // slots: 1008; the chain's three are fixed, the thousand are shuffled into the rest, five stay blank
  const slots = [];
  const chainAt = new Set(CHAIN.map((c) => `${c.s}/${c.r}/${c.c}`));
  for (let s = 0; s < SHEETS; s++) for (let r = 0; r < NR; r++) for (let c = 0; c < NC; c++) if (!chainAt.has(`${s}/${r}/${c}`)) slots.push([s, r, c]);
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const grid = {};
  for (let n = 1; n <= 1000; n++) {
    const [s, r, c] = slots[n - 1];
    const sub = subjects.get(n);
    sub.s = s; sub.r = r; sub.c = c;
    grid[`${s}/${r}/${c}`] = { kind: "subject", sub };
  }
  for (const ch of CHAIN) grid[`${ch.s}/${ch.r}/${ch.c}`] = { kind: "chain", ch };
  // each child's keywords, and every subject's own marks words
  for (const sub of subjects.values()) {
    const w = sub.marks.toLowerCase().split(/[^a-z-]+/).filter((x) => x.length >= 3 && x !== "none" && x !== "recorded");
    sub.words = sub.kid ? [...new Set(w.concat(sub.kid.words))] : w;
  }
  return { subjects, grid };
}

const FOCUS_BASE = [30, 62, 44, 72, 24, 55];
const focusTarget = (s, r) => FOCUS_BASE[s] + Math.round((r - 6.5) * 1.2);

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, url: () => "" };
    const A = (id) => (art.has && art.has(id) ? art.url(id) : "");
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const sh = {
      get: (k, d) => { try { return api.shared ? api.shared.get(k, d) : d; } catch { return d; } },
      set: (k, v) => { try { if (api.shared) api.shared.set(k, v); } catch { /* storage off */ } },
    };

    const { subjects, grid } = buildArchive();

    // what the player noticed by the river (chapter 3); with no ledger, the how-to card stands in
    let ledger = sh.get("river.details", null);
    const noticed = new Set();
    let standIn = true;
    if (Array.isArray(ledger) && ledger.length) {
      standIn = false;
      for (const e of ledger) {
        const t = `${(e && e.child) || ""} ${(e && e.detail) || ""}`.toLowerCase();
        if (/dale|wheel/.test(t)) noticed.add("dale");
        if (/june|chalk/.test(t)) noticed.add("june");
        if (/mira|pell|ostrowski|twin|scab/.test(t)) noticed.add("twins");
        if (/hollis|minnow|jar/.test(t)) noticed.add("hollis");
      }
    } else CHILD_KEYS.forEach((k) => noticed.add(k));

    const st = {
      started: false, over: false, sheet: 0, row: 6, col: 5, focus: 50,
      view: "frame", stable: 0, readAt: 0, lastKey: "", blurHintAt: 0,
      ownFound: false, read: new Set(), kidsRead: new Set(), chainRead: new Set(), corridor: false,
      t0: 0, elapsed: 0, lastTick: 0, idxRange: 0, idxPage: 0, query: "", note: null,
    };

    // ---- DOM ------------------------------------------------------------------------------------
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${BK};color:${CUT};font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;container-type:inline-size;-webkit-tap-highlight-color:transparent}
.${P}wrap *,.${P}idx *{box-sizing:border-box}
.${P}wrap button,.${P}idx button{font:inherit;color:${CUT};background:${BK};border:1.5px solid ${CUT};border-radius:0;cursor:pointer;touch-action:manipulation}
.${P}wrap button:focus-visible,.${P}wrap input:focus-visible,.${P}idx button:focus-visible,.${P}idx input:focus-visible{outline:2px solid ${AMBER};outline-offset:2px}
.${P}wrap button:disabled{opacity:.35;cursor:default}
.${P}main{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);grid-template-areas:"sheet hood" "stage ctl";gap:12px 18px;padding:12px 16px 90px;max-width:1240px;margin:0 auto;align-items:start}
.${P}sheetp{grid-area:sheet;position:relative;min-width:0}
.${P}stage{grid-area:stage}
.${P}hoodp{grid-area:hood;min-width:0;max-width:470px;width:100%;justify-self:center}
.${P}ctl{grid-area:ctl;min-width:0;max-width:470px;width:100%;justify-self:center;display:grid;gap:10px}
@container (max-width:760px){.${P}main{grid-template-columns:minmax(0,1fr);grid-template-areas:"hood" "ctl" "sheet" "stage";gap:8px;padding:8px 16px 110px}.${P}hood{max-width:300px;margin:0 auto}.${P}cap{min-height:52px;margin-top:4px;padding:4px 0}.${P}cap .${P}say{font-size:17px}.${P}cap .${P}sub{font-size:13px}.${P}cap img{width:48px;height:48px}.${P}tray{padding:6px}.${P}dial button{width:32px;height:32px}.${P}dial output{font-size:19px}.${P}tabs button{height:30px}.${P}tabs{margin-bottom:6px}.${P}knob{width:64px;height:64px}.${P}tbl th{letter-spacing:.02em;font-size:10px}}
.${P}tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px;align-items:center}
.${P}tabs span{font-size:12px;letter-spacing:.12em;margin-right:4px}
.${P}tabs button{min-width:38px;height:34px;font-size:14px}
.${P}tabs button[aria-pressed=true]{background:${CUT};color:${BK}}
.${P}sheet{position:relative;width:100%;aspect-ratio:960/680;background:${BK} center/100% 100% no-repeat}
.${P}sheet.${P}draw{border:2px solid ${CUT};box-shadow:inset 0 0 0 6px ${BK},inset 0 0 0 7px ${CUT}}
.${P}shead{position:absolute;left:1.04%;top:1.47%;width:97.9%;height:8.2%;display:flex;align-items:center;justify-content:space-between;padding:0 2%;font-size:clamp(9px,1.9cqw,15px);letter-spacing:.12em;font-weight:bold}
.${P}sheet:not(.${P}draw) .${P}shead .${P}st1{visibility:hidden}
.${P}shead .${P}sno{background:${BK};padding:0 .3em}
.${P}sheet.${P}draw .${P}shead{border-bottom:2px solid ${CUT}}
.${P}cell{position:absolute;border:0!important;background:transparent!important;padding:0}
.${P}sheet.${P}draw .${P}cell::before{content:"";position:absolute;inset:10%;border:1px solid ${CUT};opacity:.8;background:repeating-linear-gradient(180deg,transparent 0 22%,rgba(239,238,232,.55) 22% 27%) 22% 0/60% 100% no-repeat}
.${P}cell.${P}seen::after{content:"";position:absolute;right:16%;top:18%;width:22%;height:30%;border-right:2px solid ${CUT};border-bottom:2px solid ${CUT};transform:rotate(40deg)}
.${P}cell.${P}cur{outline:3px solid ${AMBER}!important;outline-offset:-1px;box-shadow:0 0 12px ${AMBER}}
.${P}lab{position:absolute;font-size:clamp(8px,1.5cqw,12px);text-align:center;pointer-events:none}
.${P}hood{position:relative;width:100%;aspect-ratio:640/500;background:${BK} center/100% 100% no-repeat}
.${P}hood.${P}draw{border-radius:16px;border:14px solid transparent;background:repeating-linear-gradient(80deg,${CUT} 0 1.2px,${BK} 1.2px 6px) border-box;}
.${P}scr{position:absolute;left:9.375%;top:9.2%;width:81.25%;height:68.8%;background:${BK};overflow:hidden;container-type:inline-size}
.${P}hood.${P}draw .${P}scr{left:5%;top:5%;width:90%;height:76%;outline:3px solid ${CUT}}
.${P}plate{position:absolute;left:34%;width:32%;top:90.4%;height:7.2%;border:1.5px solid ${CUT};display:flex;align-items:center;justify-content:center;font-size:clamp(8px,2.2cqw,13px);letter-spacing:.14em;background:${BK}}
.${P}hood:not(.${P}draw) .${P}plate{display:none}
.${P}in{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transition:filter .12s linear}
.${P}scan{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(180deg,transparent 0 13px,rgba(239,238,232,.08) 13px 14px)}
.${P}dim{position:absolute;inset:0;pointer-events:none;background:#000;opacity:0}
.${P}fr{position:relative;width:96%;aspect-ratio:480/320;background:${BK} center/100% 100% no-repeat;container-type:inline-size}
.${P}fr.${P}draw{border:2px solid ${CUT};box-shadow:inset 0 0 0 4px ${BK},inset 0 0 0 5px ${CUT}}
.${P}fh{position:absolute;left:4.6%;right:4.6%;top:5%;height:11.5%;display:flex;align-items:center;font-weight:bold;font-size:3.6cqw;letter-spacing:.14em;border-bottom:1.5px solid ${CUT}}
.${P}fl{position:absolute;left:4.6%;font-size:2.7cqw;letter-spacing:.12em}
.${P}fv{position:absolute;right:4.6%;font-weight:bold;font-size:4.1cqw;letter-spacing:.1em;white-space:nowrap;text-align:right}
.${P}fv.${P}long{font-size:2.9cqw}
.${P}fu{position:absolute;left:4.6%;right:4.6%;height:0;border-top:1px solid ${CUT}}
.${P}fr:not(.${P}draw) .${P}fh,.${P}fr:not(.${P}draw) .${P}fl,.${P}fr:not(.${P}draw) .${P}fu{visibility:hidden}
.${P}cutname{display:inline-block;min-width:5.5em;height:.55em;vertical-align:middle;background:repeating-linear-gradient(-30deg,${CUT} 0 2px,${BK} 2px 5px);margin-right:.4em}
.${P}stamp{position:absolute;right:4%;bottom:5.5%;border:2px solid ${CUT};padding:.2em .6em;font-weight:bold;font-size:3.4cqw;letter-spacing:.12em;transform:rotate(-6deg)}
.${P}see{position:absolute;left:4.6%;bottom:6%;display:flex;align-items:center;gap:2%;font-weight:bold;font-size:4.2cqw;letter-spacing:.1em;width:60%}
.${P}see img{width:28%;display:block}
.${P}see .${P}seebox{border:2px solid ${CUT};padding:0 .4em;font-size:.9em}
.${P}cl{position:absolute;left:4.6%;right:4.6%;font-size:3.3cqw;letter-spacing:.08em;display:flex;justify-content:space-between;gap:4%;border-bottom:1px solid rgba(239,238,232,.6);padding-bottom:.4em}
.${P}cl b{white-space:nowrap}
.${P}struck{position:absolute;left:4.6%;height:2.6%;background:${CUT}}
.${P}struck::after{content:"";position:absolute;left:0;right:0;top:30%;height:40%;background:${BK}}
.${P}big{position:absolute;left:4.6%;bottom:9%;font-size:6cqw;font-weight:bold;letter-spacing:.1em}
.${P}none{font-size:5cqw;letter-spacing:.3em;opacity:.7}
.${P}cap{min-height:64px;margin-top:8px;display:flex;gap:12px;align-items:center;border-top:1px solid rgba(239,238,232,.4);border-bottom:1px solid rgba(239,238,232,.4);padding:8px 0}
.${P}cap img{width:64px;height:64px;flex:none}
.${P}cap .${P}ct{flex:1;min-width:0}
.${P}cap .${P}say{font-size:20px;font-weight:bold;letter-spacing:.04em;line-height:1.2}
.${P}cap .${P}sub{font-size:14px;opacity:.85;margin-top:3px;line-height:1.35}
.${P}stage{font-size:14px;line-height:1.45;letter-spacing:.02em}
.${P}stage b{letter-spacing:.12em;font-size:12px;margin-right:.5em}
.${P}tray{display:flex;gap:8px;padding:12px 10px;background:${BK} center/cover no-repeat;border:1.5px solid ${CUT};flex-wrap:wrap;justify-content:space-between}
.${P}tray.${P}draw{background:repeating-linear-gradient(0deg,${BK} 0 6px,rgba(239,238,232,.35) 6px 7px)}
.${P}dial{background:${BK};border:1.5px solid ${CUT};padding:4px 6px 6px;flex:1 1 30%;min-width:96px}
.${P}dial .${P}dl{font-size:11px;letter-spacing:.14em;font-weight:bold}
.${P}dial .${P}dr{display:flex;align-items:center;justify-content:space-between;gap:4px}
.${P}dial button{width:36px;height:36px;font-size:18px;line-height:1;padding:0}
.${P}dial output{font-size:22px;font-weight:bold;min-width:1.6em;text-align:center}
.${P}row2{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.${P}knobw{display:flex;align-items:center;gap:6px}
.${P}knobw > button{width:40px;height:40px;font-size:20px;padding:0}
.${P}knob{width:84px;height:84px;position:relative;touch-action:none;cursor:grab;border:0!important;padding:0;background:${BK}!important}
.${P}knob .${P}kd{position:absolute;inset:0;background:center/100% 100% no-repeat;transform-origin:50% 45%}
.${P}knob.${P}draw .${P}kd{border-radius:50%;inset:6px;border:2px dashed ${CUT}!important;background:repeating-linear-gradient(30deg,${CUT} 0 1px,${BK} 1px 5px);transform-origin:50% 50%}
.${P}knob.${P}draw .${P}kd::after{content:"";position:absolute;left:calc(50% - 2px);top:4%;width:4px;height:44%;background:${CUT}}
.${P}lamp{display:flex;flex-direction:column;align-items:center;gap:4px;width:56px}
.${P}lamp .${P}bulb{width:42px;height:56px;background:center/100% 100% no-repeat}
.${P}lamp .${P}bulb.${P}draw{border:2px solid ${CUT};border-radius:50% 50% 30% 30%;background:repeating-linear-gradient(70deg,${CUT} 0 1px,${BK} 1px 6px)}
.${P}lamp .${P}bar{width:100%;height:6px;border:1px solid ${CUT}}
.${P}lamp .${P}bar i{display:block;height:100%;background:${CUT}}
.${P}lamp small{font-size:10px;letter-spacing:.14em}
.${P}acts{display:flex;gap:8px;flex-wrap:wrap;flex:1;justify-content:flex-end}
.${P}acts button{height:42px;padding:0 14px;font-size:14px;letter-spacing:.08em}
.${P}acts .${P}go{background:${CUT};color:${BK};font-weight:bold;white-space:nowrap}
.${P}note{font-size:13px;letter-spacing:.08em;border:1.5px dashed ${CUT};padding:6px 10px}
.${P}idx{position:absolute;inset:0;z-index:5;background:${BK};color:${CUT};font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;box-sizing:border-box;border:2px solid ${CUT};box-shadow:inset 0 0 0 5px ${BK},inset 0 0 0 6px ${CUT};padding:14px 14px 12px;display:flex;flex-direction:column;gap:8px;overflow:auto}
.${P}idx.${P}full{position:absolute;inset:0;z-index:30}
.${P}ih{display:flex;justify-content:space-between;align-items:center;font-weight:bold;letter-spacing:.14em;border-bottom:1.5px solid ${CUT};padding-bottom:6px;font-size:15px}
.${P}ih button{height:34px;padding:0 10px;font-size:12px}
.${P}ranges{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
.${P}ranges button{height:30px;padding:0 2px;font-size:12px;white-space:nowrap;overflow:hidden}
.${P}ranges button[aria-pressed=true]{background:${CUT};color:${BK}}
.${P}tbl{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}
.${P}tbl th{font-size:11px;letter-spacing:.12em;text-align:left;font-weight:normal;border-bottom:1px solid ${CUT};padding:2px 4px}
.${P}tbl td{padding:0;border-bottom:1px solid rgba(239,238,232,.4)}
.${P}tbl td button{all:unset;display:block;width:100%;padding:6px 4px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}
.${P}tbl td button:focus-visible{outline:2px solid ${AMBER}}
.${P}tbl tr:hover td{background:rgba(239,238,232,.1)}
.${P}tbl tr.${P}noted td{background:${CUT};color:${BK}}
.${P}pg{display:flex;align-items:center;gap:8px;font-size:13px}
.${P}pg button{width:38px;height:32px}
.${P}srch{display:flex;gap:6px;flex-wrap:wrap;align-items:center;border-top:1px solid rgba(239,238,232,.5);padding-top:8px}
.${P}srch label{font-size:11px;letter-spacing:.14em;width:100%}
.${P}srch input{flex:1;min-width:120px;height:36px;background:${BK};color:${CUT};border:1.5px solid ${CUT};font:inherit;font-size:16px;padding:0 8px;border-radius:0}
.${P}srch button{height:36px;padding:0 12px}
.${P}chips{display:flex;gap:6px;flex-wrap:wrap}
.${P}chips button{font-size:12px;padding:4px 8px}
.${P}msg{font-size:13px;opacity:.9;min-height:1.2em}
.${P}intro{position:absolute;inset:0;z-index:40;background:rgba(10,10,10,.94);overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:20px 16px}
.${P}card{max-width:620px;width:100%;border:2px solid ${CUT};box-shadow:inset 0 0 0 5px ${BK},inset 0 0 0 6px ${CUT};padding:22px 22px 20px;background:${BK};margin:auto 0}
.${P}card .${P}kick{font-size:12px;letter-spacing:.16em}
.${P}card h2{margin:6px 0 10px;font-size:30px;letter-spacing:.2em}
.${P}card blockquote{margin:0 0 12px;padding-left:12px;border-left:2px solid ${CUT};font-style:italic;font-family:Georgia,serif;font-size:16px;line-height:1.45}
.${P}card blockquote cite{display:block;font-style:normal;font-family:inherit;font-size:12px;opacity:.75;margin-top:4px}
.${P}card p{font-size:14px;line-height:1.5;margin:0 0 10px}
.${P}card ul{list-style:none;padding:0;margin:0 0 12px;display:grid;gap:6px;font-size:13.5px;line-height:1.4}
.${P}card ul b{letter-spacing:.1em;margin-right:.5em}
.${P}card .${P}rv{border:1.5px dashed ${CUT};padding:10px 12px;margin:0 0 14px}
.${P}card .${P}rv p{margin:0 0 4px}
.${P}card .${P}start{height:46px;padding:0 22px;font-size:16px;letter-spacing:.14em;background:${CUT};color:${BK};font-weight:bold}
.${P}flash{animation:${P}fl .5s ease-out}
@keyframes ${P}fl{from{filter:brightness(2.2)}to{filter:none}}
@media (prefers-reduced-motion: reduce){.${P}in{transition:none}.${P}flash{animation:none}}
`;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<div class="${P}main">
  <section class="${P}sheetp" aria-label="The sheet of fiche">
    <div class="${P}tabs" role="group" aria-label="Sheet"><span>SHEET</span></div>
    <div class="${P}sheet"><div class="${P}shead"><span class="${P}st1">RCC · SUBJECT INDEX</span><span class="${P}sno">SHEET 1</span></div></div>
  </section>
  <section class="${P}hoodp" aria-label="The reader">
    <div class="${P}hood"><div class="${P}scr"><div class="${P}in"></div><div class="${P}scan"></div><div class="${P}dim"></div></div><div class="${P}plate">READER 4</div></div>
    <div class="${P}cap" aria-live="polite"><div class="${P}ct"><div class="${P}say"></div><div class="${P}sub"></div></div></div>
  </section>
  <div class="${P}stage"></div>
  <section class="${P}ctl" aria-label="Carrier, focus and lamp">
    <div class="${P}tray"></div>
    <div class="${P}row2">
      <div class="${P}knobw"><button type="button" data-f="-1" aria-label="Focus down">−</button><button type="button" class="${P}knob" aria-label="Focus knob: drag to turn, or use Q and E"><div class="${P}kd"></div></button><button type="button" data-f="1" aria-label="Focus up">+</button></div>
      <div class="${P}lamp" title="The reader's lamp"><div class="${P}bulb"></div><div class="${P}bar"><i></i></div><small>LAMP</small></div>
      <div class="${P}acts"><button type="button" class="${P}ib">INDEX (I)</button></div>
    </div>
    <div class="${P}note" hidden></div>
  </section>
</div>`;
    root.append(css, wrap);
    const $ = (c) => wrap.querySelector("." + P + c);
    const sheetEl = $("sheet"), tabsEl = $("tabs"), hoodEl = $("hood"), inEl = $("in"), dimEl = $("dim");
    const sayEl = $("say"), subEl = $("sub"), capEl = $("cap"), stageEl = $("stage"), trayEl = $("tray"), noteEl = $("note");
    const knobEl = $("knob"), kdEl = $("kd"), bulbEl = $("bulb"), barEl = wrap.querySelector(`.${P}bar i`), actsEl = $("acts"), ibEl = $("ib");

    // art, or the CSS drawing
    const setBg = (el, id) => { const u = A(id); if (u) el.style.backgroundImage = `url("${u}")`; else el.classList.add(P + "draw"); return !!u; };
    setBg(sheetEl, "fiche-sheet");
    setBg(hoodEl, "fiche-hood");
    setBg(trayEl, "fiche-tray");
    if (!setBg(kdEl, "fiche-knob")) knobEl.classList.add(P + "draw");
    setBg(bulbEl, "fiche-lamp");

    // sheet tabs and cells (the art's grid: x0 70, y0 104, 72 x 40 in 960 x 680)
    const tabBtns = [];
    for (let s = 0; s < SHEETS; s++) {
      const b = document.createElement("button"); b.type = "button"; b.textContent = String(s + 1);
      b.setAttribute("aria-label", "Sheet " + (s + 1));
      on(b, "click", () => setCarrier(s, st.row, st.col));
      tabsEl.appendChild(b); tabBtns.push(b);
    }
    const cells = [];
    const pctX = (x) => (x / 960 * 100) + "%", pctY = (y) => (y / 680 * 100) + "%";
    for (let c = 0; c < NC; c++) {
      const l = document.createElement("div"); l.className = P + "lab";
      Object.assign(l.style, { left: pctX(70 + c * 72), width: pctX(72), top: pctY(78), height: pctY(20) });
      l.textContent = c + 1; if (!sheetEl.classList.contains(P + "draw")) l.style.visibility = "hidden";
      sheetEl.appendChild(l);
    }
    for (let r = 0; r < NR; r++) {
      const l = document.createElement("div"); l.className = P + "lab";
      Object.assign(l.style, { left: pctX(28), width: pctX(26), top: pctY(104 + r * 40 + 12), height: pctY(20) });
      l.textContent = ROWS[r]; if (!sheetEl.classList.contains(P + "draw")) l.style.visibility = "hidden";
      sheetEl.appendChild(l);
      for (let c = 0; c < NC; c++) {
        const b = document.createElement("button"); b.type = "button"; b.className = P + "cell"; b.tabIndex = -1;
        Object.assign(b.style, { left: pctX(70 + c * 72), top: pctY(104 + r * 40), width: pctX(72), height: pctY(40) });
        b.setAttribute("aria-label", `Row ${ROWS[r]}, column ${c + 1}`);
        on(b, "click", () => setCarrier(st.sheet, r, c));
        sheetEl.appendChild(b); cells.push(b);
      }
    }
    const snoEl = $("sno");

    // tray dials
    const dials = {};
    for (const [k, lbl, n, fmt] of [["sheet", "SHEET", SHEETS, (v) => v + 1], ["row", "ROW", NR, (v) => ROWS[v]], ["col", "COL", NC, (v) => v + 1]]) {
      const d = document.createElement("div"); d.className = P + "dial";
      d.innerHTML = `<div class="${P}dl">${lbl}</div><div class="${P}dr"><button type="button" aria-label="${lbl} back">‹</button><output></output><button type="button" aria-label="${lbl} on">›</button></div>`;
      const [bm, bp] = d.querySelectorAll("button");
      const step = (dv) => { const cur = { sheet: st.sheet, row: st.row, col: st.col }; cur[k] = (cur[k] + dv + n) % n; setCarrier(cur.sheet, cur.row, cur.col); };
      on(bm, "click", () => step(-1)); on(bp, "click", () => step(1));
      trayEl.appendChild(d); dials[k] = { out: d.querySelector("output"), fmt };
    }

    // ---- frames in the hood ----------------------------------------------------------------------
    const fieldY = (k) => 92 + k * 52;          // the blank frame's four fields (480 x 320)
    const pY = (y) => (y / 320 * 100) + "%";
    function subjectFrame(sub) {
      const fr = document.createElement("div"); fr.className = P + "fr";
      const useArt = sub.own ? setBg(fr, "fiche-frame-cmxcix") : setBg(fr, "fiche-frame-blank");
      let h = `<div class="${P}fh">RCC · SUBJECT RECORD</div>`;
      ["NAME", "NO.", "INTAKE", "DISTINGUISHING MARKS"].forEach((t, k) => {
        h += `<div class="${P}fl" style="top:${pY(fieldY(k) - 13)}">${t}</div><div class="${P}fu" style="top:${pY(fieldY(k) + 26)}"></div>`;
      });
      if (!(sub.own && useArt)) {
        const nm = sub.cutSurname ? `<span class="${P}cutname"></span>${esc(sub.name.replace(/^—, /, ""))}` : esc(sub.name);
        const no = sub.own ? "CMXCIX  (999 OF 1,000)" : roman(sub.n);
        const vals = [nm, esc(no), "2207", esc(sub.marks)];
        vals.forEach((v, k) => {
          if (!v) return;
          const long = k === 3 && sub.marks.length > 24;
          h += `<div class="${P}fv${long ? " " + P + "long" : ""}" style="top:${pY(fieldY(k) + (long ? 6 : 1))}">${v}</div>`;
        });
        if (sub.own) h += `<div class="${P}stamp">SURVIVOR</div>`;
      }
      if (sub.own) {
        const n = CHAIN[0];
        const seeUrl = A("fiche-see");
        h += `<div class="${P}see">${seeUrl ? `<img alt="SEE" src="${seeUrl}">` : `<span class="${P}seebox">SEE →</span>`}<span>${coord(n.s, n.r, n.c)}</span></div>`;
      }
      fr.innerHTML = h;
      return fr;
    }
    function chainFrame(ch, i) {
      const fr = document.createElement("div"); fr.className = P + "fr";
      if (ch.id === "biosynth") {
        if (!setBg(fr, "fiche-frame-biosynth")) {
          let h = `<div class="${P}fh">${ch.title}</div>`;
          for (let k = 0; k < 5; k++) h += `<div class="${P}struck" style="top:${pY(84 + k * 30)};width:${(300 + (k * 41) % 120) / 480 * 100}%"></div>`;
          h += `<div class="${P}big">SEE CORRIDOR C →</div>`;
          fr.innerHTML = h;
        }
        return fr;
      }
      fr.classList.add(P + "draw");
      const nx = CHAIN[i + 1];
      const seeUrl = A("fiche-see");
      let h = `<div class="${P}fh">${ch.title}</div>`;
      ch.lines.forEach(([a, b], k) => { h += `<div class="${P}cl" style="top:${pY(76 + k * 44)}"><span>${a}</span><b>${b}</b></div>`; });
      h += `<div class="${P}see">${seeUrl ? `<img alt="SEE" src="${seeUrl}">` : `<span class="${P}seebox">SEE →</span>`}<span>${coord(nx.s, nx.r, nx.c)}</span></div>`;
      fr.innerHTML = h;
      return fr;
    }
    function blankFrame() {
      const fr = document.createElement("div"); fr.className = P + "fr " + P + "draw";
      fr.innerHTML = `<div class="${P}fh">RCC</div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="${P}none">NO RECORD</span></div>`;
      return fr;
    }
    const slotAt = () => grid[`${st.sheet}/${st.row}/${st.col}`] || null;
    function showFrame() {
      const slot = slotAt();
      inEl.innerHTML = "";
      let fr;
      if (!slot) fr = blankFrame();
      else if (slot.kind === "chain") fr = chainFrame(slot.ch, CHAIN.indexOf(slot.ch));
      else fr = subjectFrame(slot.sub);
      inEl.appendChild(fr);
      if (!RM) { inEl.classList.remove(P + "flash"); void inEl.offsetWidth; inEl.classList.add(P + "flash"); }
    }

    // ---- state changes ---------------------------------------------------------------------------
    function paintCarrier() {
      dials.sheet.out.textContent = dials.sheet.fmt(st.sheet);
      dials.row.out.textContent = dials.row.fmt(st.row);
      dials.col.out.textContent = dials.col.fmt(st.col);
      tabBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i === st.sheet)));
      snoEl.textContent = "SHEET " + (st.sheet + 1);
      cells.forEach((b, i) => {
        const r = Math.floor(i / NC), c = i % NC;
        b.classList.toggle(P + "cur", r === st.row && c === st.col);
        const slot = grid[`${st.sheet}/${r}/${c}`];
        const seen = slot && (slot.kind === "subject" ? st.read.has(slot.sub.n) || (slot.sub.own && st.ownFound) : st.chainRead.has(slot.ch.id));
        b.classList.toggle(P + "seen", !!seen);
      });
    }
    function setCarrier(s, r, c) {
      if (st.over || !st.started) return;
      if (s === st.sheet && r === st.row && c === st.col) return;
      st.sheet = s; st.row = r; st.col = c;
      st.stable = performance.now(); st.readAt = 0;
      paintCarrier(); showFrame(); paintFocus();
      say(coord(s, r, c), "");
    }
    function paintFocus() {
      const d = Math.abs(st.focus - focusTarget(st.sheet, st.row));
      const blur = Math.min(9, Math.max(0, (d - 1.5) * 0.55));
      inEl.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      kdEl.style.transform = `rotate(${((st.focus - 50) * 2.7).toFixed(1)}deg)`;
      knobEl.setAttribute("aria-valuenow", String(Math.round(st.focus)));
    }
    function setFocus(v) {
      if (st.over || !st.started) return;
      st.focus = Math.max(0, Math.min(100, v));
      st.stable = performance.now(); st.readAt = 0;
      paintFocus();
    }
    function say(main, sub, img) {
      sayEl.textContent = main; subEl.textContent = sub || "";
      const old = capEl.querySelector("img"); if (old) old.remove();
      if (img) { const u = A(img); if (u) { const im = document.createElement("img"); im.alt = ""; im.src = u; capEl.prepend(im); } }
    }
    const namesRead = () => [...st.read].filter((n) => n !== OWN).length;
    const kidsFound = () => CHILD_KEYS.filter((k) => noticed.has(k) && (k === "twins" ? st.kidsRead.has(641) && st.kidsRead.has(642) : st.kidsRead.has(KIDS.find((x) => x.key === k).n))).length;
    function writeFlags() {
      sh.set("fiche.own_file_found", st.ownFound);
      sh.set("fiche.names_read", namesRead());
      sh.set("fiche.children_found", kidsFound());
    }
    function paintStage() {
      let h;
      const own = CHAIN[0];
      if (!st.ownFound) h = `<b>STAGE 1</b>Find his own file: Subject CMXCIX. The index lists every subject by number, with a sheet, a row and a column.`;
      else if (!st.corridor) h = `<b>STAGE ${st.chainRead.size ? 3 : 2}</b>The index lists distinguishing marks too: search it for what you noticed by the river (${kidsFound()} of ${noticed.size} found). His file says SEE ${coord(own.s, own.r, own.c)}.`;
      else h = `<b>STAGE 3</b>BIOSYNTH: SEE CORRIDOR C. Follow it when you are done reading.`;
      h += ` <span style="opacity:.7">Names read: ${namesRead()}.</span>`;
      stageEl.innerHTML = h;
    }
    function read() {
      const slot = slotAt();
      if (!slot) { say("No record.", "An empty frame."); return; }
      if (slot.kind === "chain") {
        const ch = slot.ch;
        const fresh = !st.chainRead.has(ch.id);
        st.chainRead.add(ch.id);
        if (ch.id === "biosynth") {
          say("SEE CORRIDOR C.", "Every other line on the frame is cut through.");
          if (!st.corridor) {
            st.corridor = true;
            const b = document.createElement("button"); b.type = "button"; b.className = P + "go"; b.textContent = "FOLLOW: CORRIDOR C (F)";
            on(b, "click", () => finish("win"));
            actsEl.appendChild(b);
          }
        } else if (fresh) say(ch.title.replace("RCC · ", ""), ch.lines.map((l) => l[1].toLowerCase()).join(". ") + ".");
        paintStage(); paintCarrier();
        return;
      }
      const sub = slot.sub;
      if (sub.own) {
        if (!st.ownFound) { st.ownFound = true; writeFlags(); }
        say("He finds his own file.", "Balklin, Alexander. CMXCIX, 999 of 1,000. Intake 2207. Survivor.");
        paintStage(); paintCarrier();
        return;
      }
      const fresh = !st.read.has(sub.n);
      st.read.add(sub.n);
      if (sub.kid) {
        st.kidsRead.add(sub.n);
        const known = noticed.has(sub.kid.key);
        say(`“${sub.shown}.”`, known ? sub.kid.detail.charAt(0).toUpperCase() + sub.kid.detail.slice(1) + "." : sub.marks.toLowerCase() + ".", known ? sub.kid.art : null);
      } else say(`“${sub.shown}.”`, `${roman(sub.n)}. Intake 2207.${sub.marks === "NONE RECORDED" ? "" : " " + sub.marks.charAt(0) + sub.marks.slice(1).toLowerCase() + "."}`);
      if (fresh) writeFlags();
      paintStage(); paintCarrier();
    }

    // ---- the index -------------------------------------------------------------------------------
    let idxEl = null;
    const RANGES = Array.from({ length: 10 }, (_, i) => [i * 100 + 1, i * 100 + 100]);
    const PER = 8;
    function openIndex() {
      if (st.over || !st.started) return;
      if (idxEl) { closeIndex(); return; }
      idxEl = document.createElement("div"); idxEl.className = P + "idx"; idxEl.setAttribute("role", "dialog"); idxEl.setAttribute("aria-label", "The index");
      if (wrap.clientWidth <= 760) { idxEl.classList.add(P + "full"); root.appendChild(idxEl); } else wrap.querySelector(`.${P}sheetp`).appendChild(idxEl);
      paintIndex(true);
    }
    function closeIndex() { if (idxEl) { idxEl.remove(); idxEl = null; ibEl.focus({ preventScroll: true }); } }
    function rowsHtml(list) {
      return list.map((sub) => `<tr class="${st.note && st.note.n === sub.n ? P + "noted" : ""}"><td><button type="button" data-n="${sub.n}">${roman(sub.n)}</button></td><td><button type="button" data-n="${sub.n}">${sub.s + 1}</button></td><td><button type="button" data-n="${sub.n}">${ROWS[sub.r]}</button></td><td><button type="button" data-n="${sub.n}">${sub.c + 1}</button></td><td><button type="button" data-n="${sub.n}">${sub.own ? "—" : esc(sub.marks)}</button></td></tr>`).join("");
    }
    function searchList(q) {
      const words = q.toLowerCase().split(/[^a-z-]+/).filter((w) => w.length >= 3);
      if (!words.length) return null;
      const out = [];
      for (const sub of subjects.values()) {
        if (sub.kid && !noticed.has(sub.kid.key)) {
          // a detail not noticed cannot be searched: the child's own words are not in the player's memory
          const plain = sub.marks.toLowerCase().split(/[^a-z-]+/);
          if (!words.some((w) => plain.some((x) => x.startsWith(w)))) continue;
        }
        if (words.some((w) => sub.words.some((x) => x.startsWith(w)))) out.push(sub);
      }
      return out.sort((a, b) => a.n - b.n);
    }
    function paintIndex(first) {
      if (!idxEl) return;
      const [lo, hi] = RANGES[st.idxRange];
      const pages = Math.ceil((hi - lo + 1) / PER);
      st.idxPage = Math.max(0, Math.min(pages - 1, st.idxPage));
      let list, info = "";
      const res = st.ownFound && st.query ? searchList(st.query) : null;
      if (res) {
        list = res.slice(0, PER);
        info = res.length ? (res.length > PER ? `${res.length} entries carry “${st.query}”. The first ${PER}:` : `${res.length} ${res.length === 1 ? "entry carries" : "entries carry"} “${st.query}”.`) : `No marks line carries “${st.query}”.`;
      } else {
        list = [];
        for (let n = lo + st.idxPage * PER; n <= Math.min(hi, lo + st.idxPage * PER + PER - 1); n++) list.push(subjects.get(n));
      }
      const chips = !standIn && st.ownFound ? [...noticed].map((k) => `<button type="button" data-q="${esc(KIDS.find((x) => x.key === k).words[0])}">${esc(KIDS.find((x) => x.key === k).detail)}</button>`).join("") : "";
      const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset : null;
      idxEl.innerHTML = `
<div class="${P}ih"><span>RCC · INDEX</span><button type="button" data-x="close">BACK TO THE SHEET</button></div>
<div class="${P}ranges" role="group" aria-label="Subjects by number">${RANGES.map(([a, b], i) => `<button type="button" data-r="${i}" aria-pressed="${!res && i === st.idxRange}">${roman(a)}–${roman(b)}</button>`).join("")}</div>
${res ? `<div class="${P}msg">${esc(info)} <button type="button" data-x="clear" style="height:28px;padding:0 8px;font-size:12px">CLEAR</button></div>` :
    `<div class="${P}pg"><button type="button" data-p="-1" aria-label="Previous page">‹</button><span>${roman(lo + st.idxPage * PER)}–${roman(Math.min(hi, lo + st.idxPage * PER + PER - 1))} · card ${st.idxPage + 1} of ${pages}</span><button type="button" data-p="1" aria-label="Next page">›</button></div>`}
<table class="${P}tbl"><colgroup><col style="width:28%"><col style="width:13%"><col style="width:11%"><col style="width:11%"><col></colgroup>
<thead><tr><th>SUBJECT</th><th>SHEET</th><th>ROW</th><th>COL</th><th>MARKS</th></tr></thead><tbody>${rowsHtml(list)}</tbody></table>
${st.ownFound ? `<form class="${P}srch"><label for="${P}q">SEARCH THE MARKS FOR WHAT YOU NOTICED BY THE RIVER</label><input id="${P}q" autocomplete="off" enterkeyhint="search" value="${esc(st.query)}" placeholder="a word you remember"><button type="submit">SEARCH</button><div class="${P}chips">${chips}</div></form>` :
    `<div class="${P}msg">Tap an entry to note it on the tray. Then set the carrier there.</div>`}`;
      if (first) { const b = idxEl.querySelector("[data-r]"); if (b) b.focus(); }
      else if (active && active.q === undefined && active.n === undefined) {
        const sel = active.r !== undefined ? `[data-r="${active.r}"]` : active.p !== undefined ? `[data-p="${active.p}"]` : null;
        const b = sel && idxEl.querySelector(sel); if (b) b.focus();
      }
    }
    on(root, "click", (e) => {
      if (!idxEl || !idxEl.contains(e.target)) return;
      const b = e.target.closest("button"); if (!b) return;
      const d = b.dataset;
      if (d.x === "close") closeIndex();
      else if (d.x === "clear") { st.query = ""; paintIndex(); }
      else if (d.r !== undefined) { st.idxRange = +d.r; st.idxPage = 0; st.query = ""; paintIndex(); }
      else if (d.p !== undefined) { st.idxPage += +d.p; paintIndex(); }
      else if (d.q !== undefined) { st.query = d.q; paintIndex(); }
      else if (d.n !== undefined) {
        const sub = subjects.get(+d.n);
        st.note = { n: sub.n, s: sub.s, r: sub.r, c: sub.c };
        noteEl.hidden = false;
        noteEl.textContent = `NOTED: ${roman(sub.n)} → SHEET ${sub.s + 1}, ROW ${ROWS[sub.r]}, COL ${sub.c + 1}`;
        paintIndex();
        if (wrap.clientWidth <= 760) later(closeIndex, 350);
      }
    });
    on(root, "submit", (e) => {
      if (!idxEl || !idxEl.contains(e.target)) return;
      e.preventDefault();
      const inp = idxEl.querySelector("input");
      st.query = (inp ? inp.value : "").trim();
      paintIndex();
      const i2 = idxEl.querySelector("input"); if (i2 && st.query) { /* keep the list in view on a phone */ i2.blur(); }
    });
    on(ibEl, "click", openIndex);

    // ---- focus knob ------------------------------------------------------------------------------
    knobEl.setAttribute("role", "slider"); knobEl.setAttribute("aria-valuemin", "0"); knobEl.setAttribute("aria-valuemax", "100");
    let drag = null;
    const angle = (e) => { const r = knobEl.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height * 0.45), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    on(knobEl, "pointerdown", (e) => { e.preventDefault(); knobEl.setPointerCapture(e.pointerId); drag = { a: angle(e), y: e.clientY }; knobEl.focus(); });
    on(knobEl, "pointermove", (e) => {
      if (!drag) return;
      const a = angle(e); let da = a - drag.a; if (da > 180) da -= 360; if (da < -180) da += 360;
      const dy = drag.y - e.clientY;
      drag.a = a; drag.y = e.clientY;
      const dist = Math.hypot(e.clientX - (knobEl.getBoundingClientRect().left + 42), e.clientY - (knobEl.getBoundingClientRect().top + 38));
      setFocus(st.focus + (dist > 14 ? da / 2.7 : dy / 3));
    });
    const endDrag = () => { drag = null; };
    on(knobEl, "pointerup", endDrag); on(knobEl, "pointercancel", endDrag);
    on(knobEl, "wheel", (e) => { e.preventDefault(); setFocus(st.focus + (e.deltaY < 0 ? 1.5 : -1.5)); }, { passive: false });
    let hold = null;
    wrap.querySelectorAll("[data-f]").forEach((b) => {
      const dv = +b.dataset.f;
      const stopHold = () => { if (hold) { clearInterval(hold); hold = null; } };
      on(b, "pointerdown", (e) => { e.preventDefault(); setFocus(st.focus + dv * 1.5); stopHold(); const t0 = performance.now(); hold = setInterval(() => { if (performance.now() - t0 > 300) setFocus(st.focus + dv); }, 50); });
      on(b, "pointerup", stopHold); on(b, "pointerleave", stopHold); on(b, "pointercancel", stopHold);
      on(b, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFocus(st.focus + dv * 1.5); } });
    });

    // ---- keyboard --------------------------------------------------------------------------------
    on(window, "keydown", (e) => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) { if (e.key === "Escape") closeIndex(); return; }
      if (!st.started) { if (e.key === "Enter" && intro) { e.preventDefault(); begin(); } return; }
      if (st.over) return;
      const k = e.key;
      if (k === "Escape" && idxEl) { closeIndex(); e.preventDefault(); return; }
      if (k === "i" || k === "I") { openIndex(); e.preventDefault(); return; }
      if (idxEl) return;
      if (k === "ArrowLeft") setCarrier(st.sheet, st.row, (st.col + NC - 1) % NC);
      else if (k === "ArrowRight") setCarrier(st.sheet, st.row, (st.col + 1) % NC);
      else if (k === "ArrowUp") setCarrier(st.sheet, (st.row + NR - 1) % NR, st.col);
      else if (k === "ArrowDown") setCarrier(st.sheet, (st.row + 1) % NR, st.col);
      else if (k === "z" || k === "Z" || k === "PageUp") setCarrier((st.sheet + SHEETS - 1) % SHEETS, st.row, st.col);
      else if (k === "x" || k === "X" || k === "PageDown") setCarrier((st.sheet + 1) % SHEETS, st.row, st.col);
      else if (k === "q" || k === "Q" || k === "-") setFocus(st.focus - 1.5);
      else if (k === "e" || k === "E" || k === "=" || k === "+") setFocus(st.focus + 1.5);
      else if ((k === "f" || k === "F") && st.corridor) finish("win");
      else return;
      e.preventDefault();
    });

    // ---- the loop: the read delay and the lamp ---------------------------------------------------
    let raf = 0;
    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!st.started || st.over) return;
      const dt = Math.min(100, now - (st.lastTick || now)); st.lastTick = now;
      st.elapsed += dt;
      const left = Math.max(0, LAMP_MS - st.elapsed);
      barEl.style.width = (left / LAMP_MS * 100).toFixed(2) + "%";
      // the lamp fails: the last minute dims, and (with motion) flickers
      let dim = left < 60000 ? (1 - left / 60000) * 0.45 : 0;
      if (!RM && left < 60000 && Math.random() < 0.04 + (1 - left / 60000) * 0.08) dim = Math.min(0.92, dim + 0.5);
      dimEl.style.opacity = dim.toFixed(2);
      bulbEl.style.opacity = left < 60000 ? (0.4 + 0.6 * left / 60000).toFixed(2) : "1";
      if (left <= 0) { finish("lose"); return; }
      const d = Math.abs(st.focus - focusTarget(st.sheet, st.row));
      if (d <= FOCUS_TOL) {
        if (!st.readAt && now - st.stable > READ_MS) { st.readAt = now; read(); }
      } else if (!st.readAt && now - st.stable > 1600 && st.blurHintAt !== st.stable) {
        st.blurHintAt = st.stable;
        say(coord(st.sheet, st.row, st.col) + ": out of focus.", "Turn the knob until the frame is sharp.");
      }
    }
    raf = requestAnimationFrame(tick);

    function finish(outcome) {
      if (st.over) return;
      st.over = true;
      closeIndex();
      writeFlags();
      const n = namesRead(), k = kidsFound();
      const river = `The river: ${k} of ${noticed.size} found by what you noticed.`;
      let text;
      if (outcome === "win") {
        text = `He leaves the reader lit and follows the hum to Corridor C. ${st.ownFound ? "His own file: found." : ""} ${river} “He finds the other nine hundred and ninety-nine only as names.” ${n} read aloud.`;
      } else {
        dimEl.style.opacity = "0.94";
        say("The lamp fails.", "The hum calls him on.");
        text = `The lamp fails. The hum calls him on. ${st.ownFound ? "" : "His own file is still on the sheet. "}${river} ${n} ${n === 1 ? "name" : "names"} read aloud; the names not read stay unread.`;
      }
      later(() => api.end({ outcome, text: text.replace(/\s+/g, " ").trim() }), outcome === "lose" && !RM ? 900 : 200);
    }

    // ---- how to play -----------------------------------------------------------------------------
    let intro = document.createElement("div");
    intro.className = P + "intro";
    const recall = standIn
      ? `<div class="${P}rv"><p><b>2207, by the river, you noticed:</b></p>${CHILD_KEYS.map((k) => `<p>${CHILD_LABEL[k]}: ${esc(KIDS.find((x) => x.key === k).detail)}.</p>`).join("")}<p style="opacity:.75;font-size:12.5px;margin-top:6px">Remember them. The index will not show you this card again.</p></div>`
      : `<div class="${P}rv"><p>By the river you noticed ${noticed.size} of the four children. What you did not notice cannot be searched.</p></div>`;
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="Fiche: how to play">
<div class="${P}kick">CHAPTER 9 · TWO YEARS AND ONE WEEK LATER · SNAKEHEAD</div>
<h2>FICHE</h2>
<blockquote>“He finds his own file. He finds the other nine hundred and ninety-nine only as names.”<cite>Story: Origin</cite></blockquote>
<p>The archive under the breach. One reader still lit, and its lamp is failing: six minutes.</p>
<p><b>GOAL</b> Find his own file, Subject CMXCIX. Then find the river children by what you noticed, and follow the cross-references from his file to where they lead.</p>
<ul>
<li><b>INDEX</b>I, or the button: subjects by number (Roman), with sheet, row and column</li>
<li><b>CARRIER</b>tap a frame on the sheet, or ‹ › on the tray; arrow keys, Z / X for the sheet</li>
<li><b>FOCUS</b>drag or turn the knob, − / +, or Q / E, until the frame is sharp; then it reads its name aloud</li>
</ul>
${recall}
<button type="button" class="${P}start">BEGIN</button></div>`;
    wrap.appendChild(intro);
    const startBtn = intro.querySelector("." + P + "start");
    function begin() {
      if (st.started) return;
      st.started = true; st.stable = performance.now(); st.lastTick = 0;
      intro.remove(); intro = null;
      say("Sheet 1, row G, column 6.", "Out of focus. Find the frame you want, and turn the knob.");
      ibEl.focus({ preventScroll: true });
    }
    on(startBtn, "click", begin);
    later(() => { if (startBtn.isConnected) startBtn.focus({ preventScroll: true }); }, 60);

    paintCarrier(); showFrame(); paintFocus(); paintStage();
    barEl.style.width = "100%";

    return {
      unmount() {
        st.over = true;
        cancelAnimationFrame(raf);
        if (hold) clearInterval(hold);
        timers.forEach(clearTimeout);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (idxEl) idxEl.remove();
        wrap.remove(); css.remove();
      },
    };
  },
};

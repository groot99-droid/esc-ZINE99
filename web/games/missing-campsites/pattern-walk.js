// Missing Campsites / The pattern walk (2D, op-art geometric).
//
// DESIGN.md section 10, mode B, cut to pattern_walk_1: glyphs 19 down to 12, eight junctions, on
// the other side. Every lost site stands rebuilt in trees: a ringed tree for the post, four for the
// table's corners, a circle for the fire ring, a square for the tent pad with a tree inside for
// each person who slept there. At each junction two to four glyphs are in view; one is the next
// site. Tam's Sites page shows the row for that site; a written detail is carried in the true
// glyph's trees. A blank row is a guess unless something else reads it. Stepping onto a wrong glyph:
// the screen goes white, Tam stands on the last true glyph, drift +1.
//
// Actions (the refine pass), all from DESIGN.md section 10:
//   Step   choose a glyph (click, tap, or 1–4; arrows and Enter to look and step).
//   Ask    Marisol reads the layout from memory and names one candidate. Three asks; she is right
//          four times in five. Unlocks at the first junction.
//   Count  pattern_key: the Ranger's Book counts. Two uses. Each candidate shows its sleepers and
//          the row shows the book's count, so a blank row can be read. Unlocks at the first blank row.
// On blank rows the decoys always differ in their sleeper count, so a saved Count solves one.
// Outcomes: reach 12 with drift 0–1 (a clean walk), 2–3 (win, the car is close), 4 or more (lose:
// the car is at the window first). After two losses in a row the limit is DESIGN.md's own 6.
// Every narrative line in TEXT is written for the game (listed for approval), not quoted; row 17's
// detail is DESIGN.md's own example.
//
// Phase 1 (accepted 2026-11-15, DESIGN.md "Accepted development"):
//   Recite  the List, said backwards, is the route. Tam holds four of its items here (19, 17, 15, 12).
//           Tap a held tile (or R, then Enter) to say it: if it is the item of the site Tam is looking
//           for, the true glyph hums. Each item can be said once; said at the wrong junction it is
//           spent and nothing answers. Every glyph passed gives up its item to the List strip.
// Art (api.art): the glyph kit and detail saplings as the key, the List tiles as the strip, Marisol's
// outline on Ask, chapter 7's card on the how-to, and the title lettering over the lit window behind
// the result. The field's glyphs stay drawn from each junction's spec: the kit is their legend.

//
// Phase 2 (2026-11-16): the ladder. The eight junctions of pattern_walk_1 in three stages:
//   1 Teach  19, 18, 17: one written detail, two candidate glyphs.
//   2 Test   16, 15, 14: four candidates with overlapping details; reciting, and the book's counts.
//   3 Twist  13, 12: the place built from the notebook. Row 12 is written wrong ("three slept here"),
//            and the set-piece stands at its junction: a glyph that matches the line exactly and was
//            never there. The book's count, the List and Marisol still tell the truth; the page does not.
// Links read here (api.shared): "sure", the rows stamped Sure in Reconcile's twist (stamps to trees:
// a right row loses a decoy, a wrong row stands built as written), and "pattern_key", the counts
// matched to trees in The Ranger's Book's twist (one more Count, from the first junction).

import { pic, chapterCard, resultCard, LIST, listId, ladder, stageTabs, linkNote, sharedList } from "./kit.js";

const NS = "http://www.w3.org/2000/svg";
const INK = "#111", PEARL = "#ecebe6", GREEN = "#2e6a5c", DEEP = "#0f3a33";
const P = "missing-campsites-pattern-walk-";

const NAMES = ["Two glyphs", "Four glyphs", "Built as written"];
const ALL_ROWS = [
  { n: 19, text: "two of them, a hammock slung between two trees", want: { persons: 2, hammock: true } },
  { n: 18, text: "table down by the creek side, three people", want: { persons: 3, table: -1 } },
  { n: 17, text: "bike, onions, a tent pitched crooked", want: { wheel: true, crooked: true } },
  { n: 16, text: "the tall cedar", want: { cedar: true } },
  { n: 15, text: "", want: {}, book: 2 },
  { n: 14, text: "fire ring built double, one person", want: { double: true, persons: 1 } },
  { n: 13, text: "", want: {}, book: 4 },
  { n: 12, text: "the creek bend; three slept here", want: { persons: 4 }, book: 4, written: { persons: 3 }, right: "the creek bend; four slept here" },
];
const STAGE = {
  1: { rows: [19, 18, 17], counts: [2, 2, 2], held: [], asks: 1, cnt: 0, from: "20–24", lose: 3 },
  2: { rows: [16, 15, 14], counts: [4, 4, 4], held: [15, 14], asks: 2, cnt: 1, from: "17", lose: 3 },
  3: { rows: [13, 12], counts: [3, 4], held: [12], asks: 2, cnt: 1, from: "14", lose: 3 },
};

const TEXT = {
  when: ["The other side · the path out · glyphs 19 to 17", "The other side · glyphs 16 to 14", "The other side · glyphs 13 and 12"],
  goal: ["Walk back down the loop, glyph by glyph, to 17. Fewer than three forgotten steps.", "On to 14. Four glyphs at every junction now, and they share their details.", "On to 12, before the car reaches the booth."],
  rule: ["Every lost site stands rebuilt in trees. Your Sites page says what was there; the true glyph carries it.", "Read every detail of the row, not the first one. Where the row is blank, say the List or read the book's counts.", "This place has read your notebook. A row you wrote wrong stands here in trees, exactly as written. Check the page against the book and the List before you trust it."],
  gentle: "A gentler walk: the car waits for two more forgotten steps.",
  twist: "Thirteen is blank. Twelve is in your hand, and you were tired when you wrote it.",
  setPiece: "One of these is the site. One of them is your handwriting, grown.",
  asWritten: "It is exactly what you wrote. Every tree of it. It was built from your page, and it was never there. White.",
  sureTrap: "Stamped Sure, and wrong. It stands as you stamped it, and it was never there. White.",
  end1: (d) => `Glyph 17: a wheel of saplings where a bike stood. ${d ? `${d} step${d > 1 ? "s" : ""} forgotten.` : "Not one step forgotten."}`,
  end2: (d) => `Glyph 14, the double ring. ${d ? `${d} step${d > 1 ? "s" : ""} forgotten.` : "Not one step forgotten."} The rows ahead are the ones you were surest of.`,
  open: "Pearl light, no shadows. The trees stand in exact rows, and the rows are sites.",
  ask: "Marisol walks beside you. \"I checked every one of these in. Ask me.\" (A: ask her.)",
  recite: "June's backwards lap, for real. You hold two things off the List: say one where it belongs and the trees answer. (R, or tap a tile.)",
  hum: (name) => `"…and ${name}." The trees of one glyph hum.`,
  dud: (name) => `"…${name}." Nothing answers. That was not what comes next, and it is said now.`,
  gave: (n, name) => `${n}: ${name}. It goes on the List.`,
  count: "This row is blank in your notebook. You never walked it. But the ranger's book kept its counts. (C: read them.)",
  r17: "A ring of saplings, like a wheel lying down. Somebody's bike stood here.",
  r16: "One tree here is taller than the rest, and darker.",
  r13: "Thirteen: blank again. The rows of trees hum when you look straight at them.",
  r12: "The creek is not here. The ground still bends where it went.",
  drift1: "White. You are standing where you were, and the step you took is nowhere.",
  drift3: "Somewhere behind you, an engine idles. A car is on the road to the booth.",
  wrongAsk: "Marisol frowns at her own finger. \"No… the table was the other side.\"",
  askSays: (k) => `Marisol: "That one. Number ${k}. I'd swear to it."`,
  end: {
    clean: (d) => `Glyph 12, and the path runs on toward 11. ${d ? "One step forgotten." : "Not one step forgotten."} You walk it the way the loop went, and you are well ahead of the car.`,
    win: (d) => `Glyph 12, drift ${d}. The ground forgot ${d} steps, and you are still ahead of the car, but not by much.`,
    lose: (d, at) => `Glyph ${at}, drift ${d}. Too many steps forgotten. You find the path again, but by the time you reach the booth, the car is already at the window, and the passengers have taken a map from the rack themselves.`,
  },
};

const CSS = `
.${P}wrap{position:absolute;inset:0;background:${PEARL};color:${INK};display:flex;font-family:'IBM Plex Mono',ui-monospace,monospace;overflow:hidden}
.${P}field{flex:1;min-width:0;position:relative}
.${P}field svg{position:absolute;inset:0;width:100%;height:100%}
.${P}side{width:min(290px,34vw);border-left:3px solid ${INK};background:#f7f3e8;padding:12px;box-sizing:border-box;overflow:auto;display:flex;flex-direction:column;gap:10px}
.${P}side>*{flex:none}
.${P}side h3{margin:0;font-size:13px;letter-spacing:.18em}
.${P}row{font-family:Caveat,'Segoe Print',cursive;font-size:20px;line-height:1.1;padding:5px 6px;border-bottom:1px solid #9bb4ad;color:#444}
.${P}row b{font-family:'IBM Plex Mono',monospace;font-size:13px;margin-right:6px;color:${INK}}
.${P}row.now{background:#fff;outline:3px solid ${INK};color:${INK}}
.${P}row.done{text-decoration:line-through;opacity:.55}
.${P}row i{color:#777}
.${P}row .bk{display:block;font:600 13px 'IBM Plex Mono',monospace;color:${GREEN};margin-top:2px}
.${P}drift{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:.1em;font-weight:600}
.${P}drift i{width:16px;height:16px;border:2px solid ${INK};display:inline-block}
.${P}drift i.on{background:${INK}}
.${P}drift i.edge{border-style:dashed}
.${P}drift.bump{animation:${P}bump .5s}
@keyframes ${P}bump{30%{transform:translateX(-6px)}60%{transform:translateX(6px)}}
.${P}acts{display:flex;gap:6px;flex-wrap:wrap}
.${P}acts button{font:600 14px 'IBM Plex Mono',monospace;background:#fff;color:${INK};border:2px solid ${INK};padding:8px 10px;cursor:pointer;min-height:40px}
.${P}acts button:hover:not(:disabled),.${P}acts button:focus-visible{background:${INK};color:${PEARL}}
.${P}acts button:disabled{opacity:.35;cursor:default}
.${P}acts button[hidden]{display:none}
.${P}acts button.fresh{animation:${P}fresh 1s 2}
@keyframes ${P}fresh{50%{box-shadow:0 0 0 5px rgba(17,17,17,.25)}}
.${P}key{border-top:2px solid ${INK};padding-top:8px}
.${P}key summary{font-size:13px;letter-spacing:.14em;font-weight:600;cursor:pointer}
.${P}key ul{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:4px}
.${P}key li{display:flex;align-items:center;gap:8px;font-size:13px;line-height:1.2}
.${P}key svg{width:30px;height:30px;flex:none}
.${P}voice{font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.15;background:${INK};color:${PEARL};padding:8px 10px;min-height:24px}
.${P}voice:empty{display:none}
.${P}list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.${P}list button{position:relative;aspect-ratio:1;padding:0;border:1.5px dashed #9a948a;background:#f6f1e2;font:600 12px 'IBM Plex Mono',monospace;color:#8a857b;cursor:default;overflow:hidden;min-width:0}
.${P}list button img{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}list button.held{border:2px solid ${INK};cursor:pointer;box-shadow:0 0 0 2px #c9a862}
.${P}list button.held:hover,.${P}list button.held:focus-visible{outline:3px solid ${GREEN};outline-offset:1px}
.${P}list button.walked{border:1.5px solid #9a948a}
.${P}list button.spent{box-shadow:none;border:1.5px solid #9a948a;cursor:default}
.${P}list button.spent img{opacity:.45}
.${P}list button.now{outline:3px solid ${INK};outline-offset:1px}
.${P}lh{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:13px;letter-spacing:.14em;font-weight:600}
.${P}lh small{letter-spacing:0;font-weight:400;font-size:12px}
.${P}wrap g.hum .ring{stroke:${GREEN};stroke-width:10;fill:#e9f3ee}
.${P}wrap g.hum.live .ring{animation:${P}hum .9s ease-in-out infinite}
@keyframes ${P}hum{50%{stroke-width:18;stroke:${DEEP}}}
.${P}acts button img{width:22px;height:27px;object-fit:cover;object-position:50% 22%;vertical-align:middle;margin-right:6px;border:1px solid ${INK}}
.${P}key li img{width:76px;height:76px;flex:none;border:1px solid #c9c8c2}
.${P}flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .12s}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(236,235,230,.92);z-index:4;padding:16px;overflow:auto}
.${P}card{max-width:460px;width:100%;box-sizing:border-box;background:#fff;padding:20px 22px;border:4px solid ${INK};position:relative;
  box-shadow:10px 10px 0 ${INK};background-image:radial-gradient(circle,${INK} 1.2px,transparent 1.6px);background-size:12px 12px;background-position:-200px -200px}
.${P}card::before{content:"";position:absolute;inset:8px;border:1.5px solid ${INK};pointer-events:none}
.${P}card>*{position:relative;background:#fff}
.${P}card h2{margin:0 0 2px;font:700 30px 'Zilla Slab',Georgia,serif;letter-spacing:.02em}
.${P}card .when{font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 12px;color:${GREEN}}
.${P}card .goal{font-size:16px;line-height:1.4;margin:0 0 10px;font-weight:600}
.${P}card .rule{font-size:14px;line-height:1.45;margin:0 0 12px}
.${P}card dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0 0 12px;font-size:14px}
.${P}card dt{font-weight:700;background:${INK};color:#fff;padding:0 6px;align-self:start}
.${P}card dd{margin:0}
.${P}card .gentle{font-size:14px;color:${GREEN};margin:0 0 10px}
.${P}card button{font:600 15px 'IBM Plex Mono',monospace;background:${INK};color:${PEARL};border:0;padding:11px 22px;cursor:pointer}
.${P}card button:focus-visible{outline:3px solid ${GREEN};outline-offset:3px}
.${P}wrap g[role=button]{cursor:pointer;outline:none}
.${P}wrap g[role=button]:focus .ring,.${P}wrap g[role=button]:hover .ring{stroke:${INK};stroke-width:6;fill:#fff}
.${P}wrap g.hint .ring{stroke:${GREEN};stroke-width:7;stroke-dasharray:14 8}
@media (max-width:640px){.${P}wrap{flex-direction:column}.${P}side{width:auto;border-left:0;border-top:3px solid ${INK};order:2;padding:8px 10px;gap:6px;max-height:40%}.${P}acts button{padding:6px 8px;min-height:36px}.${P}side h3{display:none}.${P}row:not(.now){display:none}.${P}key ul{grid-template-columns:1fr 1fr}.${P}lh small{display:none}.${P}list{grid-template-columns:repeat(8,minmax(0,1fr));gap:3px}.${P}key li img{width:56px;height:56px}.${P}voice{font-size:19px}}
`;

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage];
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const DRIFT_LOSE = CFG.lose + (losses >= 2 ? 2 : 0);
    // the links: rows stamped Sure in Reconcile, and the book's counts matched to trees in The Ranger's Book
    const sure = (api.shared && api.shared.get("sure", {})) || {};
    const keyed = !!(api.shared && api.shared.get("pattern_key", false));
    const shList = sharedList(api);
    const ROWS = CFG.rows.map((n) => {
      const r = { ...ALL_ROWS.find((x) => x.n === n) }, s = sure[n];
      if (s && s.right) { r.sure = "right"; if (r.written) { r.text = r.right; delete r.written; } }
      else if (s) { r.sure = "wrong"; r.text = s.line || r.text; r.written = s.spec || { empty: true }; r.stamped = true; if (!r.book) r.book = 0; }
      return r;
    });
    const COUNTS = CFG.counts.map((c, i) => Math.max(2, c - (ROWS[i].sure === "right" ? 1 : 0)));
    const HELD = CFG.held;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}field"><svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" aria-label="Glyphs of trees"></svg><div class="${P}flash"></div></div>
      <div class="${P}side"><h3>SITES</h3><div class="rows"></div>
        <div class="${P}lh"><span>THE LIST</span><small>say one you hold (R)</small></div>
        <div class="${P}list" aria-label="The List, items 19 to 12"></div>
        <div class="${P}drift" aria-live="polite"></div>
        <div class="${P}voice" aria-live="polite"></div>
        <div class="${P}acts"><button type="button" class="ask" hidden>Ask Marisol (A) ·3</button><button type="button" class="cnt" hidden>Count (C) ·2</button></div>
        <details class="${P}key" open><summary>GLYPH KEY</summary><ul></ul></details></div>
      <div class="${P}intro"><div class="${P}card"><h2>The pattern walk</h2><div class="when"></div>
        <p class="goal"></p><p class="rule"></p>
        <dl><dt>Step</dt><dd>click or tap a glyph, or press 1–4</dd><dt>Look</dt><dd>← → to look along the glyphs, Enter to step</dd><dt>Recite</dt><dd>tap a List tile you hold (or R): said at its own site, the true glyph hums</dd></dl>
        <p class="gentle" hidden></p>
        <button type="button">Step off the five sites</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when[stage - 1]; $(".goal").textContent = TEXT.goal[stage - 1]; $(".rule").textContent = TEXT.rule[stage - 1];
    if (losses >= 2) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    stageTabs(api, $(`.${P}card>button`));
    if (stage === 1) { $(`.${P}lh small`).textContent = "what the glyphs give up"; wrap.querySelectorAll(`.${P}card dl dt`)[2].remove(); wrap.querySelectorAll(`.${P}card dl dd`)[2].remove(); }
    {
      const mine = ROWS.filter((r) => r.sure);
      if (mine.length) linkNote($(`.${P}side`), `Because you stamped ${mine.map((r) => "row " + r.n).join(" and ")} Sure in Reconcile: ${mine.map((r) => (r.sure === "right" ? `${r.n} was right, and one false glyph cannot stand beside it` : `${r.n} was wrong, and it stands here built as written`)).join("; ")}.`);
      if (keyed) linkNote($(`.${P}side`), "Because you matched the book's counts to the trees in The Ranger's Book, you can read them here from the first junction, once more than before.");
      const side = $(`.${P}side`); side.querySelectorAll('[role="status"]').forEach((n) => side.querySelector(".rows").after(n));
    }
    const svg = wrap.querySelector("svg");
    const flash = $(`.${P}flash`), rowsEl = $(".rows"), driftEl = $(`.${P}drift`), voice = $(`.${P}voice`);
    const askBtn = $(".ask"), cntBtn = $(".cnt");
    const art = api.art;
    chapterCard(art, "chapter-7", $(`.${P}card`));
    // ---- the List strip: 19 down to 12; four tiles held, the rest given up by the glyphs as Tam passes ----
    const listEl = $(`.${P}list`), tiles = {}, held = new Set(HELD), spent = new Set();
    let humming = false;
    function fillTile(n) {
      const b = tiles[n]; b.textContent = "";
      const im = pic(art, listId(n), "", "");
      if (im) b.appendChild(im); else b.textContent = n;
    }
    ROWS.forEach((r) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = r.n;
      b.addEventListener("click", () => recite(r.n));
      listEl.appendChild(b); tiles[r.n] = b;
      if (held.has(r.n)) fillTile(r.n);
    });
    function paintList() {
      ROWS.forEach((r, i) => {
        const b = tiles[r.n], can = held.has(r.n) && !spent.has(r.n);
        b.className = (can ? "held " : "") + (spent.has(r.n) ? "spent " : "") + (b.dataset.walked ? "walked " : "") + (i === j && !over ? "now" : "");
        b.disabled = !can || busy || over;
        b.setAttribute("aria-label", `The List, ${r.n}: ${held.has(r.n) || b.dataset.walked ? LIST[r.n] : "not known"}${can ? ". Say it" : spent.has(r.n) ? ", said" : ""}`);
      });
    }
    function recite(n) {
      if (busy || over || !held.has(n) || spent.has(n) || $(`.${P}intro`)) return;
      spent.add(n);
      if (api.shared && n === ROWS[j].n) api.shared.set("recited", (api.shared.get("recited", 0) || 0) + 1);
      if (n === ROWS[j].n) {
        const c = cands.find((x) => x.ok);
        c.g.classList.add("hum"); if (!api.reducedMotion) c.g.classList.add("live");
        humming = true;
        speak(TEXT.hum(LIST[n]));
      } else speak(TEXT.dud(LIST[n]));
      paintList();
    }
    if (window.matchMedia && matchMedia("(max-width:640px)").matches) $(`.${P}key`).open = false;
    const timers = [];
    let raf = 0, j = 0, drift = 0, busy = true, over = false, cands = [], focusIdx = 0;
    let asks = CFG.asks, counts = CFG.cnt + (keyed ? 1 : 0), counting = false, asked = false, curTrue = null;
    const said = new Set();

    const el = (tag, a = {}, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    function speak(t) { voice.textContent = t; }
    function beat(k, t) { if (said.has(k)) return; said.add(k); speak(t); }

    // The op-art ground: exactly spaced dots whose size breathes in rows.
    const defs = el("defs");
    const pat = el("pattern", { id: "mc-pw-dots", width: 22, height: 22, patternUnits: "userSpaceOnUse" }, defs);
    el("circle", { cx: 11, cy: 11, r: 3.2, fill: "#b9b8b2" }, pat);
    el("rect", { x: -200, y: -200, width: 1400, height: 1500, fill: "url(#mc-pw-dots)" });
    const breath = el("g");
    for (let y = 11; y < 1100; y += 44) for (let x = 11; x < 1000; x += 44) el("circle", { cx: x, cy: y, r: 1.4 + 1.2 * Math.abs(Math.sin(x / 140 + y / 90)), fill: "#9d9c96" }, breath);
    const layer = el("g");

    ROWS.forEach((r) => {
      const d = document.createElement("div");
      d.className = P + "row";
      d.innerHTML = `<b>${r.n}</b>`;
      if (r.sure) { const stp = pic(art, "stamp-sure", "", "stamped Sure"); if (stp) { stp.style.cssText = "float:right;width:44px;height:44px;margin:-4px -2px -4px 4px"; d.appendChild(stp); } else { const sb = document.createElement("b"); sb.textContent = "SURE"; sb.style.cssText = "float:right;color:#9c3b30"; d.appendChild(sb); } }
      if (r.text) d.appendChild(document.createTextNode(r.text));
      else { const i = document.createElement("i"); i.textContent = "(unwritten)"; d.appendChild(i); }
      rowsEl.appendChild(d);
    });
    function paintDrift() {
      driftEl.innerHTML = "DRIFT " + Array.from({ length: DRIFT_LOSE }, (_, k) => `<i class="${k < drift ? "on" : ""}${k === DRIFT_LOSE - 1 ? " edge" : ""}"></i>`).join("");
      driftEl.setAttribute("aria-label", `Drift ${drift} of ${DRIFT_LOSE}`);
    }
    const face = pic(art, "outline-marisol", "", "");
    function paintActs() {
      paintList();
      askBtn.textContent = `Ask Marisol (A) ·${asks}`; askBtn.disabled = !asks || asked || busy;
      if (face) askBtn.prepend(face);
      cntBtn.textContent = counting ? "Counting…" : `Count (C) ·${counts}`; cntBtn.disabled = !counts || counting || busy;
    }

    function tree(g, x, y, r, filled) {
      if (filled) { el("circle", { cx: x, cy: y, r, fill: INK }, g); return; }
      el("circle", { cx: x, cy: y, r, fill: "none", stroke: GREEN, "stroke-width": r * 0.38 }, g);
      el("circle", { cx: x, cy: y, r: r * 0.35, fill: DEEP }, g);
    }
    // The key: each part of a glyph drawn small, as it stands in the trees.
    const keyItems = [
      ["post", (g) => { [12, 8, 4].forEach((r, i) => el("circle", { cx: 15, cy: 15, r, fill: "none", stroke: i === 1 ? INK : GREEN, "stroke-width": 2.4 }, g)); }],
      ["table (left = creek side)", (g) => { [[6, 8], [24, 8], [6, 22], [24, 22]].forEach(([x, y]) => tree(g, x, y, 4)); }],
      ["fire ring · double", (g) => { for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; tree(g, 15 + Math.cos(a) * 11, 15 + Math.sin(a) * 11, 2.6); } for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; tree(g, 15 + Math.cos(a) * 5, 15 + Math.sin(a) * 5, 2); } }],
      ["tent pad, ● = a sleeper", (g) => { el("rect", { x: 4, y: 4, width: 22, height: 22, fill: "none", stroke: GREEN, "stroke-width": 2, "stroke-dasharray": "3 3" }, g); el("circle", { cx: 11, cy: 11, r: 3.4, fill: INK }, g); el("circle", { cx: 19, cy: 19, r: 3.4, fill: INK }, g); }],
      ["crooked pad", (g) => { el("rect", { x: 6, y: 6, width: 18, height: 18, fill: "none", stroke: GREEN, "stroke-width": 2, "stroke-dasharray": "3 3", transform: "rotate(24 15 15)" }, g); }],
      ["hammock", (g) => { tree(g, 6, 15, 4, true); tree(g, 24, 15, 4, true); el("path", { d: "M6 15 Q15 24 24 15", fill: "none", stroke: INK, "stroke-width": 1.6, "stroke-dasharray": "2 3" }, g); }],
      ["wheel of saplings", (g) => { for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283; el("circle", { cx: 15 + Math.cos(a) * 10, cy: 15 + Math.sin(a) * 10, r: 2.2, fill: GREEN }, g); } el("circle", { cx: 15, cy: 15, r: 2.4, fill: INK }, g); }],
      ["tall cedar", (g) => { el("circle", { cx: 15, cy: 15, r: 12, fill: "none", stroke: INK, "stroke-width": 2.4 }, g); el("circle", { cx: 15, cy: 15, r: 7.5, fill: INK }, g); }],
    ];
    const keyUl = $(`.${P}key ul`);
    const KEY_ART = ["glyph-post", "glyph-table", "glyph-ring", "glyph-persons", "sapling-crooked-pad", null, "sapling-wheel", "sapling-cedar"];
    keyItems.forEach(([label, draw], i) => {
      const li = document.createElement("li");
      const im = pic(art, KEY_ART[i], "", "");
      if (im) li.appendChild(im);                    // the kit's own module; the small drawing is the fallback
      else { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 30 30"); s.setAttribute("aria-hidden", "true"); li.appendChild(s); draw(s); }
      li.appendChild(document.createTextNode(label)); keyUl.appendChild(li);
    });
    [["glyph-whole", "a whole glyph: one lost site"], ["glyph-pad", "tent pad, nobody in it"], ["glyph-decoy", "a decoy: same build, one detail off"], ["glyph-path", "the path between glyphs"]].forEach(([id, label]) => {
      const im = pic(art, id, "", "");
      if (!im) return;
      const li = document.createElement("li"); li.appendChild(im); li.appendChild(document.createTextNode(label)); keyUl.appendChild(li);
    });

    function baseSpec() {
      return { persons: 1 + Math.floor(rng() * 4), hammock: false, table: rng() < 0.5 ? -1 : 1, wheel: false, crooked: false, cedar: false, double: false };
    }
    function trueSpec(row) { const s = baseSpec(); if (row.book) s.persons = row.book; return Object.assign(s, row.want); }
    function decoyFrom(t, row, k, used) {
      const s = { ...t };
      const keys = Object.keys(row.want);
      const flip = (key) => {
        if (key === "persons") { let v, n = 0; do { v = 1 + Math.floor(rng() * 4); n++; } while ((v === t.persons || (row.book && used.has(v) && n < 20))); s.persons = v; used.add(v); }
        else if (key === "table") s.table = -t.table;
        else s[key] = !t[key];
      };
      if (keys.length) {
        flip(keys[k % keys.length]);                 // differ in one noted detail; the written row breaks the tie
        const free = ["persons", "table"].filter((key) => !keys.includes(key));
        if (free.length && rng() < 0.4) flip(free[Math.floor(rng() * free.length)]);
      } else {
        flip("persons");                             // a blank row: the book's count always tells them apart
        const opts = ["table", "hammock", "wheel", "crooked", "cedar", "double"];
        if (rng() < 0.6) flip(opts[Math.floor(rng() * opts.length)]);
      }
      return s;
    }
    function describe(spec) {
      if (spec.empty) return "bare ground inside a ring, nothing standing in it";
      const parts = [`table ${spec.table < 0 ? "on the creek side" : "on the far side"}`, `${spec.crooked ? "crooked" : "square"} pad`, `${spec.persons} sleeper${spec.persons > 1 ? "s" : ""}`];
      if (spec.double) parts.push("double fire ring");
      if (spec.hammock) parts.push("a hammock");
      if (spec.wheel) parts.push("a wheel of saplings");
      if (spec.cedar) parts.push("a tall cedar");
      return parts.join(", ");
    }

    function glyph(parent, cx, cy, s, spec, label) {
      const g = el("g", { transform: `translate(${cx} ${cy}) scale(${s})` }, parent);
      el("circle", { class: "ring", cx: 0, cy: 0, r: 118, fill: "#f4f3ef", stroke: "#c9c8c2", "stroke-width": 2 }, g);
      [16, 11, 6].forEach((r, i) => el("circle", { cx: -62, cy: -18, r, fill: "none", stroke: i === 1 ? INK : GREEN, "stroke-width": 3.4 }, g));
      el("circle", { cx: -62, cy: -18, r: 2.5, fill: INK }, g);
      if (spec.empty) {
        if (label != null) { el("rect", { x: -20, y: 92, width: 40, height: 30, fill: INK }, g); const t0 = el("text", { x: 0, y: 115, "text-anchor": "middle", "font-size": 24, "font-weight": 700, "font-family": "IBM Plex Mono, monospace", fill: PEARL }, g); t0.textContent = label; }
        return g;
      }
      const tx = spec.table < 0 ? -40 : 18;
      [[0, 0], [34, 0], [0, 20], [34, 20]].forEach(([a, b]) => tree(g, tx + a, -78 + b, 6));
      for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; tree(g, 48 + Math.cos(a) * 26, 22 + Math.sin(a) * 26, 5); }
      if (spec.double) for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + 0.2; tree(g, 48 + Math.cos(a) * 13, 22 + Math.sin(a) * 13, 3.6); }
      const pad = el("g", { transform: `translate(-26 48) rotate(${spec.crooked ? 24 : 0})` }, g);
      for (let k = 0; k < 5; k++) for (const [a, b] of [[k, 0], [k, 4], [0, k], [4, k]]) el("circle", { cx: -24 + a * 12, cy: -24 + b * 12, r: 3, fill: "none", stroke: GREEN, "stroke-width": 1.8 }, pad);
      const spots = [[-7, -7], [7, 7], [7, -7], [-7, 7]];
      for (let k = 0; k < spec.persons; k++) el("circle", { cx: spots[k][0], cy: spots[k][1], r: 5, fill: INK }, pad);
      if (spec.wheel) { for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; el("circle", { cx: -86 + Math.cos(a) * 15, cy: 40 + Math.sin(a) * 15, r: 2.8, fill: GREEN }, g); } el("circle", { cx: -86, cy: 40, r: 3, fill: INK }, g); }
      if (spec.cedar) { el("circle", { cx: 70, cy: -50, r: 22, fill: "none", stroke: INK, "stroke-width": 3 }, g); el("circle", { cx: 70, cy: -50, r: 14, fill: INK }, g); }
      if (spec.hammock) { tree(g, 6, -38, 7, true); tree(g, 52, -42, 7, true); el("path", { d: "M6 -38 Q29 -24 52 -42", fill: "none", stroke: INK, "stroke-width": 2, "stroke-dasharray": "2 4" }, g); }
      if (label != null) {
        el("rect", { x: -20, y: 92, width: 40, height: 30, fill: INK }, g);
        const t = el("text", { x: 0, y: 115, "text-anchor": "middle", "font-size": 24, "font-weight": 700, "font-family": "IBM Plex Mono, monospace", fill: PEARL }, g); t.textContent = label;
      }
      return g;
    }
    function countBadge(c) {
      const g = el("g", { transform: `translate(${c.x + 70 * c.sc} ${c.y - 92 * c.sc})`, "pointer-events": "none" }, layer);
      el("circle", { r: 24, fill: GREEN, stroke: "#fff", "stroke-width": 3 }, g);
      const t = el("text", { y: 9, "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#fff", "font-family": "IBM Plex Mono, monospace" }, g);
      t.textContent = c.spec.persons;
    }

    function dotsPath(x1, y1, x2, y2) {
      const d = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(d / 24);
      for (let k = 1; k < n; k++) {
        const t = k / n;
        el("circle", { cx: x1 + (x2 - x1) * t, cy: y1 + (y2 - y1) * t, r: 3.2 + 2 * (k % 2), fill: "none", stroke: INK, "stroke-width": 1.6 }, layer);
      }
    }

    const HERE = { x: 500, y: 600 };
    let hereSpec = null, hereLabel = "20";
    function layout() {
      layer.innerHTML = "";
      cands = []; asked = false; counting = false; humming = false;
      const row = ROWS[j];
      const n = COUNTS[j];
      const t = trueSpec(row);
      curTrue = t;
      const specs = [t];
      const used = new Set([t.persons]);
      let trap = null;                               // the row as written, standing in trees
      if (row.written) { trap = row.written.empty ? { ...t, empty: true, persons: 0 } : { ...t, ...row.written }; trap.asWritten = true; used.add(trap.persons); specs.push(trap); }
      for (let k = specs.length - 1; k < n - 1; k++) specs.push(decoyFrom(t, row, k, used));
      for (let k = specs.length - 1; k > 0; k--) { const r = Math.floor(rng() * (k + 1)); [specs[k], specs[r]] = [specs[r], specs[k]]; }
      const fr = svg.getBoundingClientRect();
      const portrait = fr.width > 0 && fr.width < fr.height * 0.95;
      let pts, sc;
      if (portrait) {
        svg.setAttribute("viewBox", "0 0 560 1000");
        HERE.x = 280; HERE.y = 880;
        pts = { 2: [[140, 330], [420, 330]], 3: [[140, 170], [420, 170], [280, 480]], 4: [[140, 160], [420, 160], [140, 470], [420, 470]] }[n];
        sc = 1.08;
      } else {
        svg.setAttribute("viewBox", "0 0 1000 700");
        HERE.x = 500; HERE.y = 600;
        pts = { 2: [300, 700], 3: [190, 500, 810], 4: [130, 377, 623, 870] }[n].map((x, i) => [x, i % 2 ? 230 : 200]);
        sc = n === 4 ? 0.9 : 1.05;
      }
      pts.forEach(([x, y]) => dotsPath(HERE.x, HERE.y, x, y));
      if (hereSpec) glyph(layer, HERE.x, HERE.y + 10, 0.55, hereSpec, hereLabel);
      else {
        el("rect", { x: HERE.x - 72, y: HERE.y - 40, width: 144, height: 90, fill: "#fff", stroke: INK, "stroke-width": 4 }, layer);
        const tt = el("text", { x: HERE.x, y: HERE.y + 32, "text-anchor": "middle", "font-size": 22, "font-weight": 700, fill: INK }, layer); tt.textContent = CFG.from;
      }
      pts.forEach(([x, y], i) => {
        const g = glyph(layer, x, y, sc, specs[i], String(i + 1));
        g.setAttribute("role", "button"); g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", `Glyph ${i + 1}: ${describe(specs[i])}`);
        const c = { g, x, y, sc, spec: specs[i], ok: specs[i] === t, i };
        g.addEventListener("click", () => choose(c));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(c); } });
        cands.push(c);
      });
      const tam = el("circle", { cx: HERE.x, cy: HERE.y, r: 13, fill: INK, stroke: PEARL, "stroke-width": 4 }, layer);
      cands.tam = tam;
      [...rowsEl.children].forEach((d, i) => { d.classList.toggle("now", i === j); d.classList.toggle("done", i < j); });
      rowsEl.children[j].scrollIntoView?.({ block: "nearest" });
      focusIdx = 0;
      busy = false;
      // beats and unlocks by junction
      if ((keyed || !row.text || row.written) && cntBtn.hidden && counts > 0) { cntBtn.hidden = false; if (!api.reducedMotion) cntBtn.classList.add("fresh"); }
      if (stage === 2 && j === 0) beat("recite", TEXT.recite);
      else if (stage === 3 && j === 0) beat("twist", TEXT.twist);
      else if (row.written && !row.stamped) beat("setpiece", TEXT.setPiece);
      else if (!row.text) beat("count", TEXT.count);
      else if (row.n === 17) beat("17", TEXT.r17);
      else if (row.n === 16) beat("16", TEXT.r16);
      else if (row.n === 13) { beat("13", TEXT.r13); if (!api.reducedMotion) breath.setAttribute("opacity", "0.55"); }
      else if (row.n === 12) beat("12", TEXT.r12);
      paintActs();
    }

    function unlockAsk() {
      if (over || !askBtn.hidden) return;
      askBtn.hidden = false; if (!api.reducedMotion) askBtn.classList.add("fresh");
      if (!voice.textContent || voice.textContent === TEXT.open) beat("ask", TEXT.ask); paintActs();
    }
    function ask() {
      if (busy || over || !asks || asked) return;
      asks--; asked = true;
      const live = cands.filter((c) => !c.dead);
      const right = rng() < 0.8;
      const pick = right ? live.find((c) => c.ok) : live.filter((c) => !c.ok)[Math.floor(rng() * live.filter((c) => !c.ok).length)] || live.find((c) => c.ok);
      pick.g.classList.add("hint");
      speak(TEXT.askSays(pick.i + 1));
      paintActs();
    }
    function count() {
      if (busy || over || !counts || counting) return;
      counts--; counting = true;
      cands.filter((c) => !c.dead).forEach(countBadge);
      const row = ROWS[j];
      const d = rowsEl.children[j];
      if (!d.querySelector(".bk")) { const s = document.createElement("span"); s.className = "bk"; s.textContent = `book: ${curTrue.persons} ${curTrue.persons === 1 ? "person" : "persons"}`; d.appendChild(s); }
      paintActs();
    }

    function walk(to, done) {
      const tam = cands.tam;
      const dur = api.reducedMotion ? 1 : 650;
      const t0 = performance.now();
      const stepF = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        tam.setAttribute("cx", HERE.x + (to.x - HERE.x) * e);
        tam.setAttribute("cy", HERE.y + (to.y - HERE.y) * e);
        if (k < 1) raf = requestAnimationFrame(stepF); else done();
      };
      raf = requestAnimationFrame(stepF);
    }

    function ripple(c) {
      if (api.reducedMotion) return;
      const rings = [0, 1, 2].map((k) => el("circle", { cx: c.x, cy: c.y, r: 20, fill: "none", stroke: INK, "stroke-width": 4 }, layer));
      const t0 = performance.now();
      const f = (now) => {
        const k = (now - t0) / 500;
        rings.forEach((r, i) => { const kk = Math.max(0, k - i * 0.15); r.setAttribute("r", 20 + kk * 140); r.setAttribute("opacity", Math.max(0, 1 - kk)); });
        if (k < 1.4) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    }

    function choose(c) {
      if (busy || over || c.dead) return;
      busy = true; paintActs();
      walk(c, () => {
        if (c.ok) {
          ripple(c);
          unlockAsk();
          hereSpec = c.spec; hereLabel = String(ROWS[j].n);
          const n = ROWS[j].n;                         // the glyph gives its item up to the List
          if (!held.has(n)) { tiles[n].dataset.walked = "1"; fillTile(n); if (!humming) speak(TEXT.gave(n, LIST[n])); }
          shList.add(n);
          j++;
          if (j >= ROWS.length) return finish();
          timers.push(setTimeout(layout, api.reducedMotion ? 0 : 520));
        } else {
          drift++;
          paintDrift();
          if (!api.reducedMotion) { driftEl.classList.remove("bump"); void driftEl.offsetWidth; driftEl.classList.add("bump"); }
          if (c.spec.asWritten) speak(ROWS[j].stamped ? TEXT.sureTrap : TEXT.asWritten);
          else if (c.g.classList.contains("hint")) speak(TEXT.wrongAsk);
          else if (drift >= 3) { if (said.has("drift3")) speak(TEXT.drift1); else beat("drift3", TEXT.drift3); }
          else speak(TEXT.drift1);
          flash.style.opacity = "1";
          timers.push(setTimeout(() => {
            flash.style.opacity = "0";
            cands.tam.setAttribute("cx", HERE.x); cands.tam.setAttribute("cy", HERE.y);
            c.g.setAttribute("opacity", "0.22"); c.g.removeAttribute("tabindex"); c.g.setAttribute("aria-disabled", "true"); c.dead = true;
            busy = false; paintActs();
            if (drift >= DRIFT_LOSE) finish();
          }, 500));
        }
      });
    }

    function finish() {
      if (over) return;
      over = true;
      [...rowsEl.children].forEach((d) => d.classList.add("done"));
      const lose = drift >= DRIFT_LOSE;
      api.store.set("losses", lose ? losses + 1 : 0);
      paintList();
      if (api.shared) api.shared.set("drift", drift);
      resultCard(wrap, art, { cards: [stage === 3 ? "thread-own" : stage === 2 ? "glyph-whole" : "sapling-wheel"], lost: lose ? 5 : Math.min(4, drift), reducedMotion: api.reducedMotion });
      if (lose) api.end({ outcome: "lose", text: TEXT.end.lose(drift, ROWS[Math.min(j, ROWS.length - 1)].n) });
      else if (stage === 1) api.end({ outcome: "win", text: TEXT.end1(drift), next: "Four glyphs at a junction, and the List to say." });
      else if (stage === 2) api.end({ outcome: "win", text: TEXT.end2(drift), next: "The place has read your notebook." });
      else api.end({ outcome: "win", text: drift <= 1 ? TEXT.end.clean(drift) : TEXT.end.win(drift) });
    }

    const kd = (e) => {
      if (busy || over || $(`.${P}intro`)) return;
      const live = cands.filter((c) => !c.dead);
      const k = e.key.toLowerCase();
      if (/^[1-4]$/.test(k)) { const c = cands[+k - 1]; if (c && !c.dead) choose(c); }
      else if (k === "a") ask();
      else if (k === "r") { const b = ROWS.map((r) => tiles[r.n]).find((x) => x.classList.contains("held")); if (b) b.focus(); }
      else if (k === "c") count();
      else if (k === "arrowright" || k === "arrowleft") {
        e.preventDefault();
        focusIdx = (focusIdx + (k === "arrowright" ? 1 : live.length - 1)) % live.length;
        live[focusIdx].g.focus();
      }
    };
    window.addEventListener("keydown", kd);
    askBtn.addEventListener("click", ask);
    cntBtn.addEventListener("click", count);
    const go = $(`.${P}card>button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); layout(); speak(TEXT.open); timers.push(setTimeout(unlockAsk, api.reducedMotion ? 1500 : 3500)); });
    go.focus();
    paintDrift();
    layout(); busy = true; paintActs();   // the first junction stands behind the intro so the field reads at once

    return {
      unmount() {
        over = true;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        window.removeEventListener("keydown", kd);
      },
    };
  }
}

// Missing Campsites / Pack List (1D, wax crayon on kraft paper).
//
// DESIGN.md section 11, Pack List, at pack_list_1: five seats round the fire, the chain at most ten,
// one phantom: "a blue enamel kettle" (site 5's table), which Rafe's repetition includes though
// nobody added it. Each speaker says the chain in order and adds one item; each word fades 4 s after
// it is said (the last three stay 2 s longer on this first appearance; "Hold the chain" keeps all).
// On Tam's turn, tap the tiles in the chain's order, then add one of three items from Tam's pack.
// The phantom may be repeated where Rafe put it (accepted +1), or challenged: press "Nobody said
// that." and tap it (a line in the notebook). A false challenge costs warmth. A wrong order loses
// the round; everyone laughs. June fails on lap 3, cheerfully, and the round is won.
//
// Actions (the refine pass):
//   Repeat     tap the tiles in the chain's order (or Tab and Enter).
//   Add        one item of Tam's own, when the chain is said.
//   Challenge  "Nobody said that." (N), then tap the item: right writes a line, wrong costs warmth.
//              Unlocks when a phantom has been said.
//   Notebook   check the notebook (B), once: Tam has been writing down what each friend added, so
//              for four seconds the true chain shows in pencil, and a phantom is not in it.
//              Unlocks on lap 2.
// Outcomes: the round lasts and the kettle is caught (win); the round lasts but the kettle was
// repeated or let pass (done: it is packed now); a wrong order (lose). After two losses in a row,
// "Hold the chain" starts on. Lines in TEXT are written for the game (listed for approval);
// Rafe's "Did I? … I did, didn't I." is DESIGN.md's own line.
//
// Phase 1 (accepted 2026-11-15, DESIGN.md "Accepted development"):
//   Backwards lap  June's house rule: lap 2 is said last thing first, by everyone, Tam included. It is
//                  the practice for the pattern walk, where the List is said backwards.
//   The List       catching the kettle writes item 5 on the notebook's List page (L opens it): the
//                  first step of the game's long puzzle.
// Art (api.art): the 36 item tiles as the tray, the friends' portrait outlines on the seats, the
// List tiles and notebook tabs on the List page, chapter 2's card on the how-to, and the title
// lettering with the night card behind the result. Every element falls back to the crayon drawing.

import { pic, chapterCard, resultCard, listPage, LIST } from "./kit.js";

const P = "missing-campsites-pack-list-";
const SEATS = [
  { name: "June", color: "#3f7d3a" }, { name: "Dell", color: "#9c3b30" }, { name: "Rafe", color: "#6b3f8a" },
  { name: "Inés", color: "#b07a10" }, { name: "Tam", color: "#2b5d8a" },
];
// Every item here has a tile in the art (pieces/item-*); the names are the tiles' own.
const ADDS = { June: ["a tarp", "tent pegs"], Dell: ["marshmallows", "foil"], Rafe: ["rope", "playing cards"], "Inés": ["a tin cup", "a sun hat"] };
const TAM_PACK = [["the torch", "dry socks", "a toothbrush"], ["a thermos", "a compass", "a book"]];
const PHANTOM = "a blue enamel kettle";
const PHANTOM_AFTER = 3;          // Rafe slips it in after the third item, on lap 2
const DISTRACT = ["a lantern", "a water bottle", "boots", "the map", "a blanket", "a camera", "a frying pan", "a rucksack", "matches",
  "a tent", "the cooler", "firewood", "a mallet", "a pocket knife", "the van keys", "a walkie-talkie"];
const BACK_LAP = 2;               // June's house rule: this lap is said backwards
const WORD_MS = 850;

const TEXT = {
  when: "Night 1 · the first fire",
  goal: "Say the whole list back in order on your turn, and last the round.",
  rule: "Each friend says every item so far, then adds one. The words fade.",
  gentle: "\"Hold the chain\" is on: the words stay in the air this time.",
  open: "The fire is going. Five of you, five seats. June starts, because June always starts.",
  lap1: "June: \"House rule. Second lap goes backwards. Last thing in, first thing out.\"",
  backTurn: "Your turn, and it is the backwards lap. Last thing first.",
  backDone: "June, grinning: \"See? You can walk it either way.\"",
  listUnlock: "A new page in your notebook, after Tally: the List. (L: open it.)",
  listNote: "Things nobody packed, in the order they were said.",
  notebookUnlock: "Your notebook is open on your knee. You've been writing down what each of them added, without meaning to. (B: check it, once.)",
  phantomHeard: "Something in Rafe's list sounds like it belongs to someone else's trip.",
  challengeUnlock: "If you heard something nobody added, say so: Nobody said that (N), then tap it.",
  challengeOn: "Nobody said that? Then tap the thing nobody said.",
  caught: "Rafe looks at the fire. \"Did I? … I did, didn't I.\"",
  caughtNote: `The List, 5: "${PHANTOM}". Nobody packed it. Site 5's table, 16:10, day 1.`,
  falseCh: "\"I did say that.\" A small silence. (Warmth −1)",
  accepted: "You say the kettle as if someone packed it. Nobody blinks.",
  notebookShow: "Your notebook, in pencil: what each of them added, in order.",
  notebookBack: "Your notebook, in pencil, first to last. June wants it last to first.",
  juneOut: "June: \"…and…a…\" She laughs into her sleeve. \"I'm out. I'm out!\"",
  yourTurn: "Your turn. Say it in order.",
  addNow: "Now add something of yours.",
  end: {
    win: (w) => `June is out, laughing, and the round is yours. You caught the kettle; the line is in your notebook, in your hand. Warmth ${w}.`,
    accepted: (w) => `June is out, laughing, and the round is yours. You repeated the kettle as if someone had packed it, and now it is packed. Warmth ${w}.`,
    missed: (w) => `June is out, laughing, and the round is yours. Nobody mentions the kettle again, and nobody remembers who said it. Warmth ${w}.`,
    lose: (w, wanted, caught) => `You said ${w} where ${wanted} went. Everyone laughs; nothing else is lost.${caught ? " The kettle line stays in your notebook." : ""}`,
  },
};

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;color:#2b1d14;font-family:Caveat,'Segoe Print','Comic Sans MS',cursive;background:#b98b5a;
  background-image:radial-gradient(rgba(70,40,15,.18) 1px,transparent 1.4px),radial-gradient(rgba(255,230,190,.12) 1px,transparent 1.6px),repeating-linear-gradient(8deg,rgba(90,55,25,.06) 0 2px,transparent 2px 7px);
  background-size:7px 7px,11px 11px,auto;display:grid;grid-template-rows:max-content max-content;gap:10px;padding:12px;box-sizing:border-box;align-content:start}
.${P}band{background:#ecdcba;padding:8px 14px;min-height:72px;position:relative;box-shadow:0 2px 0 rgba(60,35,10,.25)}
.${P}band small{display:flex;justify-content:space-between;gap:10px;font-size:19px;color:#5b4129}
.${P}band small em{font-style:normal;font-weight:700}
.${P}words{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:clamp(21px,2.6vw,27px);min-height:32px;font-weight:700}
.${P}words span{transition:opacity .8s}
.${P}words span.fade{opacity:0}
.${P}words span.ring{outline:3px solid #c8321f;outline-offset:2px;border-radius:40%}
.${P}words.nb span{color:#4a4a4c!important;font-weight:500}
.${P}main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
.${P}fire{width:100%;max-height:60vh;height:auto;display:block}
.${P}side{display:flex;flex-direction:column;gap:10px}
.${P}tray{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:#6e4f2e;padding:8px;transition:box-shadow .2s}
.${P}tray.ch{box-shadow:0 0 0 4px #c8321f}
.${P}tile{position:relative;font:inherit;font-size:clamp(17px,1.9vw,20px);font-weight:700;line-height:1;background:#f4ead2;color:#2b1d14;border:0;padding:12px 4px;min-height:56px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.${P}tile.art{padding:3px 3px 5px;justify-content:flex-start}
.${P}tile img{width:100%;aspect-ratio:1/.8;object-fit:cover;object-position:50% 12%;display:block;pointer-events:none}
.${P}listb{font:inherit;font-size:21px;font-weight:700;background:#f6f1e2;color:#3a3a3c;border:0;box-shadow:inset 0 0 0 3px #4a4a48;padding:8px 14px;cursor:pointer}
.${P}listb[hidden]{display:none}
.${P}note{display:flex;gap:8px;align-items:center}
.${P}note img{width:64px;height:64px;flex:none}
.${P}back{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.12em;background:#2b5d8a;color:#fff;padding:1px 8px;margin-left:8px}
.${P}back[hidden]{display:none}
.${P}tile:hover:not(:disabled){background:#fff6dd;transform:rotate(-1deg)}
.${P}tile:disabled{opacity:.4;cursor:default}
.${P}tile.used{background:#cfe0b8;color:#3a5a2a}
.${P}tile.used::after{content:"✓";position:absolute;right:5px;top:2px;color:#3f7d3a;font-size:20px}
.${P}tile.bad{background:#f2b6a8;animation:${P}shake .4s}
.${P}tile.caught{outline:4px solid #c8321f;outline-offset:-4px}
.${P}tile:focus-visible{outline:3px solid #2b5d8a}
@keyframes ${P}shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.${P}edge{position:absolute;inset:2px;border:3px solid #3b3734;filter:url(#mc-pl-wax);pointer-events:none}
.${P}row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.${P}no,.${P}nbk{font:inherit;font-size:23px;font-weight:700;background:#c8321f;color:#fff;border:0;padding:8px 16px;cursor:pointer;position:relative}
.${P}nbk{background:#f4ead2;color:#2b1d14;box-shadow:inset 0 0 0 3px #3b3734}
.${P}no.on{background:#7a1a0e;box-shadow:inset 0 0 0 3px #fff8}
.${P}no:disabled,.${P}nbk:disabled{opacity:.4;cursor:default}
.${P}no[hidden],.${P}nbk[hidden]{display:none}
.${P}fresh{animation:${P}fresh 1s 2}
@keyframes ${P}fresh{50%{transform:scale(1.08)}}
.${P}say{font-size:23px;line-height:1.15;background:#ecdcba;padding:6px 12px;min-height:30px}
.${P}prog{font-size:20px;color:#2b1d14;font-weight:700}
.${P}note{font-size:20px;color:#3a3a3c;background:#fbf8ee;padding:6px 10px;border-left:4px solid #d58a7a}
.${P}note[hidden]{display:none}
.${P}hold{font:600 14px 'IBM Plex Mono',monospace;display:flex;gap:6px;align-items:center;color:#2b1d14}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(110,79,46,.86);z-index:4;padding:16px;overflow:auto}
.${P}card{max-width:460px;width:100%;box-sizing:border-box;background:#f4ead2;padding:22px 24px 20px;font-size:21px;line-height:1.2;position:relative;transform:rotate(-1.2deg)}
.${P}card::before{content:"";position:absolute;inset:6px;border:4px solid #c8321f;filter:url(#mc-pl-wax);pointer-events:none}
.${P}card h2{margin:0;font-size:42px;line-height:1;color:#c8321f}
.${P}card .when{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 10px;color:#6b5236}
.${P}card .goal{margin:0 0 6px;font-size:23px;font-weight:700}
.${P}card .rule{margin:0 0 10px}
.${P}card ul{margin:0 0 12px;padding:0;list-style:none;display:grid;gap:4px}
.${P}card li::before{content:"✎ ";color:#c8321f}
.${P}card li b{color:#2b5d8a}
.${P}card .gentle{font:600 14px 'IBM Plex Mono',monospace;color:#3f7d3a;margin:0 0 10px}
.${P}card button{font:inherit;font-size:26px;font-weight:700;background:#c8321f;color:#fff;border:0;padding:6px 24px;cursor:pointer}
.${P}card button:focus-visible{outline:3px dashed #2b5d8a;outline-offset:3px}
@media (max-width:700px){.${P}main{grid-template-columns:1fr}.${P}fire{max-height:30vh}.${P}tile{min-height:50px;font-size:16px;padding:8px 3px}.${P}tile.art{padding:2px 2px 4px}.${P}say{font-size:21px}}
`;

export default {
  mount(root, api) {
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mc-pl-wax"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></svg>
      <div class="${P}band"><small><span>I packed my bag, and in it I put…<b class="${P}back" hidden>BACKWARDS LAP</b></span><em class="who"></em></small><div class="${P}words" aria-live="polite"></div></div>
      <div class="${P}main"><svg class="${P}fire" viewBox="0 0 400 380" aria-label="The fire ring and the seats"></svg>
        <div class="${P}side"><div class="${P}say">Waiting by the fire.</div>
          <div class="${P}prog" aria-live="polite"></div>
          <div class="${P}tray"></div>
          <div class="${P}row"><button type="button" class="${P}no" hidden>Nobody said that. (N)</button>
            <button type="button" class="${P}nbk" hidden>Check the notebook (B)</button>
            <button type="button" class="${P}listb" hidden>The List (L)</button>
            <label class="${P}hold"><input type="checkbox"> Hold the chain</label></div>
          <div class="${P}note" hidden></div></div></div>
      <div class="${P}intro"><div class="${P}card"><h2>Pack List</h2><div class="when"></div>
        <p class="goal"></p><p class="rule"></p>
        <ul><li><b>Repeat:</b> tap the tiles in the chain's order</li><li><b>Add:</b> then tap one thing of your own</li><li><b>Slip:</b> one wrong tile and you're out</li><li><b>Lap two:</b> June's rule, the list goes backwards</li></ul>
        <p class="gentle" hidden></p>
        <button type="button">Sit down</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when; $(".goal").textContent = TEXT.goal; $(".rule").textContent = TEXT.rule;
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const words = $(`.${P}words`), tray = $(`.${P}tray`), sayEl = $(`.${P}say`), noBtn = $(`.${P}no`), nbBtn = $(`.${P}nbk`), noteEl = $(`.${P}note`), progEl = $(`.${P}prog`);
    const holdBox = $(`.${P}hold input`);
    const art = api.art, listBtn = $(`.${P}listb`);
    chapterCard(art, "chapter-2", $(`.${P}card`));
    const TILE = {};                                    // item name -> art id, from the tiles' own titles
    if (art && art.list) for (const id of art.list("pieces")) { const t = art.info(id).title; if (t.startsWith("Pack List tile: ")) TILE[t.slice(16)] = id; }
    const FACE = { June: "outline-june", Dell: "outline-dell", Rafe: "outline-rafe", "Inés": "outline-ines", Tam: "item-notebook" };
    const found = new Set();
    const list = listPage(wrap, art, { note: TEXT.listNote });
    list.set(found);
    listBtn.addEventListener("click", () => list.toggle());
    holdBox.checked = gentle;
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, api.reducedMotion ? Math.min(ms, 400) : ms); timers.push(t); return t; };
    let over = false, chain = [], phantomSaid = false, phantomUsed = false, caught = false, warmth = 4, mistakes = 0, nbLeft = 1, nbShowing = false;
    let turn = null;

    // ---- the fire and the seats, in crayon ----
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}fire`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const ngon = (x, y, r, n, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * Math.PI * 2; return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
    const wax = { filter: "url(#mc-pl-wax)" };
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mk("polygon", { points: ngon(200 + Math.cos(a) * 70, 190 + Math.sin(a) * 70, 15, 6, a), fill: "#6e6b66", stroke: "#3b3734", "stroke-width": 4, ...wax }); }
    mk("polygon", { points: ngon(200, 190, 55, 12), fill: "#2b1d14", ...wax });
    const flames = mk("g", {});
    [["#d8401f", 46], ["#f08a24", 32], ["#ffd23f", 18]].forEach(([c, r]) => {
      const pts = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; const rr = i % 2 ? r * 0.45 : r; return `${(200 + Math.cos(a) * rr).toFixed(1)},${(190 + Math.sin(a) * rr).toFixed(1)}`; }).join(" ");
      mk("polygon", { points: pts, fill: c, stroke: c, "stroke-width": 3, ...wax }, flames);
    });
    const seatEls = SEATS.map((s, i) => {
      const a = -Math.PI / 2 + i / SEATS.length * Math.PI * 2;
      const x = 200 + Math.cos(a) * 150, y = 190 + Math.sin(a) * 146;
      const g = mk("g", {});
      const face = art && art.has(FACE[s.name]) ? FACE[s.name] : null;
      const r = mk("rect", { x: x - 44, y: y - (face ? 42 : 30), width: 88, height: face ? 84 : 60, fill: "#f4ead2", stroke: s.color, "stroke-width": 4, ...wax }, g);
      if (face) {                                       // the People page's outline (Tam's own seat shows the notebook: Tam's face is never drawn)
        const im = mk("image", { x: x - 30, y: y - 38, width: 60, height: 54, preserveAspectRatio: s.name === "Tam" ? "xMidYMid meet" : "xMidYMin slice" }, g);
        im.setAttribute("href", art.url(face));
      } else mk("path", { d: `M${x - 10} ${y - 8} L${x} ${y - 18} L${x + 10} ${y - 8}`, fill: "none", stroke: s.color, "stroke-width": 3, ...wax }, g);
      const t = mk("text", { x, y: y + (face ? 37 : 20), "text-anchor": "middle", "font-size": 24, fill: s.color, "font-family": "Caveat, cursive", "font-weight": 700 }, g);
      t.textContent = s.name;
      return { g, r, x, y };
    });
    const light = (i) => {
      seatEls.forEach((s, k) => { s.r.setAttribute("stroke-width", k === i ? 9 : 4); s.r.setAttribute("fill", k === i ? "#fff6dd" : "#f4ead2"); });
      $(".who").textContent = i == null ? "" : `${SEATS[i].name} speaks`;
      $(".who").style.color = i == null ? "" : SEATS[i].color;
    };
    const say = (t) => { sayEl.textContent = t; };
    function unlock(btn, text) { if (!btn.hidden) return; btn.hidden = false; if (!api.reducedMotion) btn.classList.add(P + "fresh"); say(text); }

    // ---- the spoken band ----
    function speak(word, who, stay = 4000) {
      const s = document.createElement("span");
      s.textContent = word;
      s.style.color = who.color;
      words.appendChild(s);
      if (!holdBox.checked) later(() => s.classList.add("fade"), stay);
      if (words.children.length > 14) words.firstChild.remove();
      return s;
    }
    holdBox.addEventListener("change", () => { if (holdBox.checked) words.querySelectorAll(".fade").forEach((s) => s.classList.remove("fade")); });

    // A friend recites the chain, then adds one. Rafe on lap 2 slips the kettle in.
    function friendTurn(i, lap, done) {
      const who = SEATS[i];
      light(i);
      say(`${who.name}: "I packed my bag, and in it I put…"`);
      words.classList.remove("nb");
      words.innerHTML = "";
      const back = lap === BACK_LAP;
      $(`.${P}back`).hidden = !back;
      const said = chain.slice();
      const phantomNow = who.name === "Rafe" && lap === 2;
      if (phantomNow) { said.splice(PHANTOM_AFTER, 0, PHANTOM); phantomSaid = true; }
      if (back) said.reverse();                         // the kettle keeps its place between the third thing and the fourth
      if (who.name === "June" && lap === 3) {
        const stopAt = 6;
        said.slice(0, stopAt).forEach((w, k) => later(() => speak(w, who), WORD_MS * (k + 1)));
        later(() => { say(TEXT.juneOut); done(); }, WORD_MS * (stopAt + 2));
        return;
      }
      const n = said.length;
      said.forEach((w, k) => later(() => speak(w, who, 4000 + (k >= n - 3 ? 2000 : 0)), WORD_MS * (k + 1)));
      const add = ADDS[who.name][lap - 1];
      later(() => { speak(add, who, 6000); chain.push(add); say(`${who.name} adds ${add}.`); }, WORD_MS * (n + 1) + 300);
      if (phantomNow) later(() => say(TEXT.phantomHeard), WORD_MS * (n + 2) + 200);
      later(done, WORD_MS * (n + 2) + (phantomNow ? 2200 : 600));
    }

    function paintProg() {
      if (!turn) { progEl.textContent = ""; return; }
      progEl.textContent = turn.adding ? "Now one of yours." : `Said ${turn.idx} of ${chain.length}${turn.back ? " · backwards" : ""}`;
    }

    function tamTurn(lap, done) {
      light(4);
      const back = lap === BACK_LAP;
      $(`.${P}back`).hidden = !back;
      say(back ? TEXT.backTurn : TEXT.yourTurn);
      const pool = new Set(chain);
      if (phantomSaid) pool.add(PHANTOM);
      const extra = DISTRACT.slice().sort(() => rng() - 0.5);
      while (pool.size < 16 && extra.length) pool.add(extra.pop());
      const items = [...pool].sort(() => rng() - 0.5);
      const seq = back ? chain.slice().reverse() : chain.slice();
      // where the kettle goes if Tam repeats it: after the third thing, or before it on the backwards lap
      turn = { lap, idx: 0, challenge: false, done, adding: false, back, seq, phantomAt: back ? seq.length - PHANTOM_AFTER : PHANTOM_AFTER };
      tray.innerHTML = "";
      items.forEach((w) => tray.appendChild(tile(w, (b) => tapTile(w, b))));
      if (phantomSaid && !caught) unlock(noBtn, TEXT.challengeUnlock);
      noBtn.disabled = !phantomSaid || caught;
      if (lap === 2) later(() => { if (turn && !over) { unlock(nbBtn, TEXT.notebookUnlock); nbBtn.disabled = nbLeft <= 0 || turn.adding; } }, 3500);
      nbBtn.disabled = nbLeft <= 0;
      paintProg();
      tray.querySelector("button")?.focus();
    }
    function tile(w, on) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "tile";
      const im = pic(art, w === PHANTOM && !caught && art && art.has("item-kettle-said") ? "item-kettle-said" : TILE[w]);
      if (im) { b.classList.add("art"); b.appendChild(im); } else b.innerHTML = `<span class="${P}edge"></span>`;
      b.appendChild(document.createTextNode(w));
      b.addEventListener("click", () => on(b));
      return b;
    }

    function tamWord(w) { speak(w, SEATS[4], 8000); }

    function tapTile(w, b) {
      if (!turn || over || turn.adding) return;
      if (turn.challenge) {
        turn.challenge = false; noBtn.classList.remove("on"); tray.classList.remove("ch");
        if (w === PHANTOM) {
          caught = true; b.classList.add("caught"); b.disabled = true; noBtn.disabled = true;
          { const im = b.querySelector("img"); if (im && TILE[PHANTOM]) im.src = art.url(TILE[PHANTOM]); }   // now it is circled
          words.querySelectorAll("span").forEach((s) => { if (s.textContent === PHANTOM) s.classList.add("ring"); });
          say(TEXT.caught);
          noteEl.hidden = false;
          noteEl.textContent = "";
          const lt = pic(art, "list-05", "", "The List, 5");
          if (lt) noteEl.appendChild(lt);
          const sp = document.createElement("span"); sp.textContent = TEXT.caughtNote; noteEl.appendChild(sp);
          found.add(5); list.set(found, 5);            // the long puzzle's first step
          if (listBtn.hidden) { listBtn.hidden = false; if (!api.reducedMotion) listBtn.classList.add(P + "fresh"); later(() => { if (!over && turn) say(TEXT.listUnlock); }, 2600); }
        } else {
          warmth -= 1;
          b.classList.add("bad"); later(() => b.classList.remove("bad"), 500);
          say(TEXT.falseCh);
        }
        return;
      }
      if (w === turn.seq[turn.idx]) {
        turn.idx++; b.classList.add("used"); b.disabled = true; tamWord(w); paintProg();
        if (turn.idx >= chain.length) startAdding();
        return;
      }
      if (w === PHANTOM && !phantomUsed && !caught && turn.idx === turn.phantomAt) {
        phantomUsed = true; b.classList.add("used"); b.disabled = true; tamWord(w); say(TEXT.accepted);
        return;
      }
      mistakes++;                                        // a wrong order loses the round
      b.classList.add("bad");
      say(`"${w}"? Everyone laughs. Dell: "Out! Tam's out."`);
      const wanted = turn.seq[turn.idx];
      turn = null;
      over = true;
      api.store.set("losses", losses + 1);
      later(() => { showResult("lose"); api.end({ outcome: "lose", text: TEXT.end.lose(w, wanted, caught) }); }, 1600);
    }

    function startAdding() {
      turn.adding = true;
      noBtn.disabled = true; nbBtn.disabled = true;
      say(TEXT.addNow);
      tray.innerHTML = "";
      TAM_PACK[turn.lap - 1].forEach((w) => tray.appendChild(tile(w, () => {
        tamWord(w); chain.push(w);
        say(turn.back ? TEXT.backDone : `You add ${w}.`);
        tray.innerHTML = "";
        const d = turn.done; turn = null; paintProg();
        later(d, 900);
      })));
      paintProg();
      tray.querySelector("button")?.focus();
    }

    function challenge() {
      if (!turn || turn.adding || caught || noBtn.hidden || noBtn.disabled) return;
      turn.challenge = !turn.challenge;
      noBtn.classList.toggle("on", turn.challenge);
      tray.classList.toggle("ch", turn.challenge);
      say(turn.challenge ? TEXT.challengeOn : TEXT.yourTurn);
    }
    function notebook() {
      if (!turn || turn.adding || nbLeft <= 0 || nbBtn.hidden || nbShowing) return;
      nbLeft--; nbBtn.disabled = true; nbShowing = true;
      const keep = [...words.childNodes];
      words.innerHTML = ""; words.classList.add("nb");
      chain.forEach((w, k) => { const s = document.createElement("span"); s.textContent = `${k + 1}. ${w}`; words.appendChild(s); });
      say(turn.back ? TEXT.notebookBack : TEXT.notebookShow);
      later(() => { words.classList.remove("nb"); words.innerHTML = ""; keep.forEach((n) => words.appendChild(n)); nbShowing = false; }, 4000);
    }
    noBtn.addEventListener("click", challenge);
    nbBtn.addEventListener("click", notebook);
    const kd = (e) => {
      if (over || $(`.${P}intro`)) return;
      const k = e.key.toLowerCase();
      if (k === "escape" && list.isOpen) { list.close(); return; }
      if (k === "l" && !listBtn.hidden) { list.toggle(); return; }
      if (list.isOpen) return;
      if (k === "n") challenge();
      else if (k === "b") notebook();
    };
    window.addEventListener("keydown", kd);

    // The order: June, Dell, Rafe, Inés, Tam, for two laps; June fails on lap 3.
    function run(lap, seat) {
      if (over) return;
      if (lap === 2 && seat === 0) say(TEXT.lap1);
      if (lap === 3) {
        friendTurn(0, 3, () => {
          over = true;
          if (!mistakes) warmth += 1;
          const w = `${warmth}`;
          api.store.set("losses", 0);
          const outcome = caught ? "win" : "done";
          const text = caught ? TEXT.end.win(w) : phantomUsed ? TEXT.end.accepted(w) : TEXT.end.missed(w);
          later(() => { showResult(caught ? "win" : phantomUsed ? "accepted" : "missed"); api.end({ outcome, text }); }, 1800);
        });
        return;
      }
      const next = () => (seat === 4 ? run(lap + 1, 0) : run(lap, seat + 1));
      const go = () => (seat === 4 ? tamTurn(lap, next) : friendTurn(seat, lap, next));
      if (lap === 2 && seat === 0) later(go, 1600); else go();
    }

    // The card behind the result: what the List holds now (or the kettle, packed), over night 1.
    function showResult(how) {
      list.close();
      resultCard(wrap, art, {
        cards: [how === "win" || (how === "lose" && caught) ? "list-05" : how === "lose" ? "night-1" : "item-kettle", "night-1"].filter((v, i, a) => a.indexOf(v) === i),
        lost: { win: 0, missed: 1, accepted: 2, lose: 3 }[how],
        caption: caught ? `The List, 5: ${LIST[5]}.` : "", reducedMotion: api.reducedMotion,
      });
    }

    const go = $(`.${P}card button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); light(null); say(TEXT.open); later(() => run(1, 0), 1800); });
    go.focus();

    return {
      unmount() { over = true; timers.forEach(clearTimeout); window.removeEventListener("keydown", kd); },
    };
  },
};

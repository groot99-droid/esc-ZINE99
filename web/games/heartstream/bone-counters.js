// A Journey Into the Heartstream, 1D game: Bone Counters (DESIGN.md section 11, `g1_counters`).
// Linocut: bold carved black on cream, gouge marks in the pits, red for the beat.
// Two sittings and the cut, as the design has them, at a small scope:
//   the first sitting (`s1_counters_1`, 60 bpm): the hollow that would capture glows when hovered,
//     and the elder shows where the last counter will land;
//   the second sitting (`s1_counters_2`, 64 bpm): no glows;
//   the cut: the elders call the brothers to the Recognition mid-game, and you pocket your counter
//     piece or leave it on the board (`self.kept_counter`). The match is never finished.
// Solo: you play the one who argues, the companion who will carve for you. Board indices run
// anticlockwise: 0-4 your row, 5 your keep, 6-10 his row, 11 his keep.
//
// Actions: Pick a hollow; Drop each counter on the beat; Read a hollow (hover or focus: where the
// last counter lands, first sitting only); at the cut, Pocket or Leave your piece.
// "Choose your sign.", "Sow with the heart." and "It is time." are the elders' lines from DESIGN.md section 6.
//
// Phase 1 (DESIGN.md "Accepted development (2026-11-15)"): The Small One Moves a Counter. In the first
// sitting the child of the next group creeps out and moves one counter in your row; you Put it back
// or Leave it. Its lines are written for the game (DEEP_DIVE.md section 2), not the author's text.
//
// Art (api.art): the board (counters-board), the six marks and counter pieces, the two seat
// portraits, the beat rim, the small one, chapter cards 1 and 4, the two interstitials, the hall wall
// and the thread. Every one falls back to the mode's own drawing when the id is missing.

import { howTo, Beats, flourish, disposeKit, artUrl, artImg, pngUrl, plate, flashPlate, endCard, ladder, stagePicker, shared, revealMark, secondRun, marks, introNote } from "./_kit.js";
//
// Phase 2 (DEEP_DIVE.md section 3, built 2026-11-16): a ladder of three sittings.
//   Teach  the first sitting: sow on the beat. Eight turns, the glows on, and the small one at the rim.
//   Test   captures and rung hollows: twelve turns, the glows still on. New: the lent counter (give him one
//          counter from your keep to sow once from his row).
//   Twist  the second sitting starts from the position the small one left: a board you did not set, no
//          glows, a faster beat, and the cut. It ends in the set-piece, One Move on the Oldest Board: one
//          ancient board in the hall is a single sowing from finished, and as your last counter falls an
//          elder's hand covers the hollow, catches it, and closes your fingers round it.
// Links (api.shared): the row you leave when the elders call, read as five heights, is offered in
// Marrow-Song as a phrase and hummed by the raft in the river section; the hand he sows with is the hand
// The Carving's grip has to fit.
// Lines written for the game: the stage cards, the lent counter's beat and the oldest board's lines.

const C = { ink: "#15100c", cream: "#efe4cc", red: "#B3202E", gold: "#F2B544", dim: "#8a7a66" };
const GOOD = 120;
const MARKS = ["ring", "notch", "spiral", "fork", "star", "wave"];

const DEFAULT_LEFT = [4, 0, 5, 1, 3, 3, 2, 4, 1, 3, 0, 4];   // a position the small one left, when none was played
export default ladder(run, {
  theme: { bg: "#efe4cc", fg: "#15100c", accent: "#B3202E", ink: "#efe4cc" },
  next: [null, "Next: the same board, played to take. Captures, hollows that ring, and a counter you may lend him.",
    "Next, days later: the second sitting. The board is as the small one left it, and nobody shows you where a counter lands."],
});

function run(root, api, ctl) {
  {
    const SG = ctl.stage, sh = shared(api);
    const P = "heartstream-bone-counters-";
    const rng = api.rng();
    const RM = api.reducedMotion;
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    const board = Array(12).fill(3); board[5] = 0; board[11] = 0;
    let leftBy = null;
    if (SG === 2) {
      let left = null; try { left = api.store.get("left", null); } catch { /* storage off */ }
      const ok = left && Array.isArray(left.board) && left.board.length === 12 && left.board.every((n) => Number.isInteger(n) && n >= 0) && left.board.reduce((a, n) => a + n, 0) === 30
        && left.board.slice(0, 5).some((n) => n > 0) && left.board.slice(6, 11).some((n) => n > 0);
      (ok ? left.board : DEFAULT_LEFT).forEach((n, i) => { board[i] = n; });
      leftBy = ok ? left.small || null : { from: 2, to: 1, choice: "left" };
    }
    let hand = sh.get("hand", null);
    if (!hand || !/^(left|right)$/.test(hand.side)) { hand = { side: rng() < 0.5 ? "left" : "right", wide: rng() < 0.5 }; sh.set("hand", hand); }
    const TURNS = [8, 12, 12][SG];
    const st = { started: false, over: false, turn: 0, who: 0, phase: "pick", hover: -1, sel: 2, rung: {}, sow: null,
      drops: [], rounds: [0, 0], r1: null, myDrops: 0, myOn: 0, msg: "", lastBeat: -1, sitting: SG === 2 ? 2 : 1, bpm: [60, 62, 64][SG], sit2At: 0, cutDue: false, caps: 0, hisCaps: 0, rings: 0, flashes: [], lent: 0 };
    let t0 = 0, raf = 0, audio = null;
    const PERIOD = () => 60000 / st.bpm;
    const SIT1_TURNS = 8, SIT2_MS = 100000;

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:${C.cream};color:${C.ink};font-family:var(--g-display);display:flex;flex-direction:column;align-items:center;padding:10px;box-sizing:border-box;user-select:none;-webkit-user-select:none;
  background-image:radial-gradient(rgba(21,16,12,.07) 1px,transparent 1.5px);background-size:7px 7px}
.${P}head{width:100%;max-width:1100px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 18px}
.${P}head h2{margin:0;font-size:clamp(22px,3.4vw,38px);letter-spacing:.14em;font-weight:700}
.${P}head span{color:${C.red};font-style:italic;font-size:18px}
.${P}head .${P}score{margin-left:auto;font-size:17px;font-style:normal;color:${C.ink};font-family:var(--g-body)}
.${P}msg{width:100%;max-width:1100px;font-size:18px;min-height:1.5em;font-style:italic}
.${P}wrap svg.${P}board{width:100%;max-width:1100px;flex:1 1 auto;min-height:0;touch-action:manipulation}
.${P}hol{cursor:pointer;outline:none}
.${P}hol:focus .${P}pit{stroke:${C.red};stroke-width:6}
.${P}bar{display:flex;gap:10px;align-items:center;justify-content:center;padding:6px;flex-wrap:wrap}
.${P}drop{font:700 19px var(--g-display);letter-spacing:.2em;background:${C.ink};color:${C.cream};border:0;padding:14px 34px;cursor:pointer;min-width:190px;min-height:54px;touch-action:manipulation;box-shadow:5px 5px 0 ${C.red};transition:transform .06s}
.${P}drop:active{transform:translate(3px,3px);box-shadow:2px 2px 0 ${C.red}}
.${P}drop.${P}tap{transform:translate(3px,3px);box-shadow:2px 2px 0 ${C.red}}
.${P}drop:disabled{opacity:.3;box-shadow:none}
.${P}drop.${P}live{animation:${P}pulse ${"var(--beat,1s)"} infinite}
@keyframes ${P}pulse{0%{background:${C.red}}25%{background:${C.ink}}}
.${P}choice{display:flex;gap:10px}.${P}choice[hidden]{display:none}
.${P}choice button{font:700 17px var(--g-display);letter-spacing:.12em;background:${C.cream};color:${C.ink};border:4px solid ${C.ink};padding:12px 22px;cursor:pointer;box-shadow:5px 5px 0 ${C.ink}}
.${P}choice button:hover{background:#fff7e6}
.${P}legend{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 16px;font-size:15px;font-family:var(--g-body);justify-content:center}
.${P}legend b{font-family:var(--g-display);letter-spacing:.06em}
.${P}legend li.${P}new{animation:${P}hl 1.2s 2}
@keyframes ${P}hl{50%{background:${C.gold}}}
.${P}beat{position:absolute;left:50%;top:64px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:14px 18px;background:${C.cream};border:5px solid ${C.ink};box-shadow:8px 8px 0 ${C.ink};font-size:20px;line-height:1.3;text-align:center;z-index:6}
.${P}beat b{display:block;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:${C.red};font-family:var(--g-body)}
.${P}beat.${P}in{animation:${P}stamp .3s ease-out}
@keyframes ${P}stamp{from{transform:translateX(-50%) scale(1.08);opacity:.2}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,228,204,.88);z-index:8;overflow:auto}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:${C.cream};border:6px solid ${C.ink};padding:0 0 18px;box-shadow:10px 10px 0 ${C.ink}}
.${P}kick{background:${C.ink};color:${C.cream};font:700 13px var(--g-body);letter-spacing:.24em;text-transform:uppercase;padding:8px 20px;background-image:repeating-linear-gradient(100deg,transparent 0 9px,rgba(239,228,204,.18) 9px 11px)}
.${P}card h2{font-size:34px;margin:12px 20px 4px;letter-spacing:.1em}
.${P}scene{margin:0 20px 10px;font-size:16px;line-height:1.45}
.${P}goal{margin:0 20px 12px;font-size:17px;line-height:1.4;border:3px solid ${C.ink};padding:8px 10px}
.${P}goal b{color:${C.red};font-family:var(--g-body);font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin-right:6px}
.${P}keys{list-style:none;margin:0 20px 14px;padding:0;display:grid;gap:8px}
.${P}keys li{display:grid;grid-template-columns:86px 1fr;gap:0 10px;font-size:16px;align-items:baseline}
.${P}kv{background:${C.ink};color:${C.cream};text-align:center;padding:3px 6px;letter-spacing:.1em}
.${P}kc{font-family:var(--g-body);font-weight:700;font-size:15px}
.${P}kw{grid-column:2;font-size:15px;font-style:italic}
.${P}extra{margin:0 20px 12px;font-size:15px;font-style:italic}
.${P}start{margin-left:20px;font:700 18px var(--g-display);letter-spacing:.2em;background:${C.ink};color:${C.cream};border:0;padding:12px 30px;cursor:pointer;box-shadow:5px 5px 0 ${C.red}}
.${P}who{display:flex;align-items:center;gap:6px;font:700 12px var(--g-body);letter-spacing:.12em;text-transform:uppercase}
.${P}who img{height:46px;width:auto;border:2px solid ${C.ink}}
.${P}rim{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.25;z-index:1}
.${P}marks{display:flex;gap:6px;flex-wrap:wrap;margin:0 20px 12px;align-items:center}
.${P}marks b{font:700 12px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:${C.red};flex-basis:100%}
.${P}marks button{padding:0;border:3px solid ${C.ink};background:${C.cream};cursor:pointer;width:46px;height:46px;font:700 11px var(--g-body)}
.${P}marks button img{display:block;width:100%;height:100%}
.${P}marks button[aria-pressed=true]{border-color:${C.red};box-shadow:3px 3px 0 ${C.red}}
.${P}lend{font:700 15px var(--g-display);letter-spacing:.08em;background:${C.cream};color:${C.ink};border:4px solid ${C.ink};padding:10px 14px;cursor:pointer;min-height:54px;box-shadow:4px 4px 0 ${C.ink}}
.${P}lend:disabled{opacity:.35;box-shadow:none;cursor:default}
.${P}lend[hidden]{display:none}
.${P}old{position:absolute;inset:0;z-index:9;background:rgba(21,16,12,.94);color:${C.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;box-sizing:border-box;overflow:auto;text-align:center}
.${P}old .${P}op{position:relative;width:min(100%,760px)}
.${P}old .${P}op>img{display:block;width:100%;height:auto;max-height:34vh;object-fit:cover;border:4px solid ${C.cream}}
.${P}old svg{display:block;width:min(100%,640px);height:auto;touch-action:manipulation}
.${P}old .${P}hand{position:absolute;right:4%;bottom:-18%;width:clamp(90px,24%,170px);border:4px solid ${C.cream};box-shadow:6px 6px 0 ${C.red}}
.${P}old p{margin:0;max-width:640px;font-size:19px;line-height:1.35;min-height:4em}
.${P}old b{display:block;font:700 12px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:${C.gold}}
.${P}old button{font:700 17px var(--g-display);letter-spacing:.14em;background:${C.cream};color:${C.ink};border:0;padding:12px 26px;min-height:50px;cursor:pointer;box-shadow:5px 5px 0 ${C.red}}
.${P}old g[role=button]{cursor:pointer;outline:none}
.${P}old g[role=button]:focus ellipse{stroke:${C.gold};stroke-width:6}
.${P}small:focus{outline:none}
.${P}small{position:absolute;left:50%;top:58px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;background:${C.cream};border:5px solid ${C.ink};box-shadow:8px 8px 0 ${C.ink};z-index:7;display:grid;grid-template-columns:auto 1fr;gap:0 12px;padding:10px}
.${P}small img{width:clamp(84px,24vw,150px);height:auto;grid-row:1 / span 3;align-self:center}
.${P}small b{font:700 12px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:${C.red};align-self:end}
.${P}small p{margin:2px 0 8px;font-size:18px;line-height:1.3}
.${P}small div{display:flex;gap:8px;flex-wrap:wrap}
.${P}small button{font:700 15px var(--g-display);letter-spacing:.1em;background:${C.cream};color:${C.ink};border:4px solid ${C.ink};padding:9px 12px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink};min-height:44px}
.${P}small button:hover{background:#fff7e6}
@media (max-aspect-ratio:1/1){.${P}rim{display:none}}
@media (max-width:640px){.${P}msg{font-size:16px}.${P}who img{height:34px}.${P}small p{font-size:16px}.${P}beat{font-size:18px;top:56px}.${P}legend{font-size:13px}.${P}drop{min-width:150px;padding:12px 20px}}
`;
    wrap.appendChild(css);
    const head = document.createElement("div"); head.className = P + "head";
    head.innerHTML = `<h2>BONE COUNTERS</h2><span class="${P}sit">${["the first sitting · 60 beats a minute", "the first sitting, played to take · 62 beats a minute", "the second sitting · 64 beats a minute · no glows"][SG]}</span><b class="${P}score"></b>`;
    // the two at the board: seat portraits (blue: this is before the Recognition)
    const who = document.createElement("div"); who.className = P + "who";
    { const a = artImg(api, "seat-laughs-blue", "", "you, the one who laughs"), b = artImg(api, "seat-argues-blue", "", "the one who argues");
      if (a && b) { who.append(a, "you · him", b); head.insertBefore(who, head.querySelector("." + P + "score")); } }
    if (artUrl(api, "counters-board")) head.querySelector("h2").hidden = true; // the board's own plate carries the title
    const rim = artImg(api, "ui-beat-rim"); if (rim) { rim.className = P + "rim"; wrap.appendChild(rim); }
    const msg = document.createElement("div"); msg.className = P + "msg"; msg.setAttribute("aria-live", "polite");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", P + "board"); svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const bar = document.createElement("div"); bar.className = P + "bar";
    const dropBtn = document.createElement("button"); dropBtn.type = "button"; dropBtn.className = P + "drop"; dropBtn.textContent = "DROP"; dropBtn.disabled = true;
    const choice = document.createElement("div"); choice.className = P + "choice"; choice.hidden = true;
    choice.innerHTML = `<button type="button" data-c="pocket">POCKET YOUR PIECE <small>(P)</small></button><button type="button" data-c="leave">LEAVE IT ON THE BOARD <small>(L)</small></button>`;
    const lendBtn = document.createElement("button"); lendBtn.type = "button"; lendBtn.className = P + "lend"; lendBtn.innerHTML = "LEND HIM A COUNTER <small>(G)</small>"; lendBtn.hidden = true; lendBtn.disabled = true;
    bar.append(dropBtn, lendBtn, choice);
    const legendEl = document.createElement("ul"); legendEl.className = P + "legend";
    wrap.append(head, msg, svg, bar, legendEl);
    const beats = new Beats(P, wrap, RM);
    const SPEC = [{
      kicker: "Chapter one · the hall of boards",
      title: "Bone Counters",
      scene: "Around you hang the boards of every group before yours, none of them finished. An elder sets a new one between you and the one who argues. Your counter piece sits in your keep.",
      goal: "Sow on the beat: drop at least half your counters as the heart falls. Nobody is counting keeps yet.",
      keys: [["Pick", "tap a hollow in your row · ←/→ and Enter", "its counters are sown anticlockwise, one per heartbeat"],
        ["Drop", "Space · tap the board · DROP", "as each counter falls; on the beat it rings"],
        ["Read", "hover or focus a hollow", "the elder shows where the last counter lands"]],
    }, {
      kicker: "Chapter one · played to take",
      title: "Captures and rung hollows",
      scene: "The same board, and the one who argues has stopped being kind. The elder still shows where a counter will land.",
      goal: "Be ahead in the keeps after twelve turns, with at least one capture or one rung hollow of your own.",
      keys: [["Capture", "last counter into an empty hollow of yours", "you take it and everything opposite"],
        ["Ring", "on the beat, into a hollow that then holds three", "nobody sows from it next turn"],
        ["Lend", "G · LEND HIM A COUNTER", "one counter from your keep into his row; he sows it at once, and your turn is spent"]],
    }, {
      kicker: "Chapter three · the second sitting",
      title: "The board he left",
      scene: `Days have passed. The board is where you left it, and as the small one left it: the counter he moved is ${leftBy && leftBy.choice === "back" ? "back where you set it, and the rest is as the two of you stopped" : "still where he put it"}. The elders have stopped showing where counters land.`,
      goal: "Be ahead when the elders come for you. Then decide what to do with your piece.",
      keys: [["No glows", "count the hollows yourself", "the opening the glow taught you is not on this board"],
        ["The cut", "P pocket · L leave", "the match will not be finished"]],
    }][SG];
    const intro = howTo(P, {
      ...SPEC,
      extra: `<div class="${P}marks" role="group" aria-label="Choose your sign"><b>“Choose your sign.” It is cut into your counter piece.</b>${MARKS.map((m) => `<button type="button" data-m="${m}" aria-pressed="false" aria-label="${m}">${artUrl(api, "mark-" + m) ? `<img alt="" src="${artUrl(api, "mark-" + m)}">` : m}</button>`).join("")}</div>` + "Last counter in your keep: go again. In an empty hollow of yours: take it and the hollow opposite. On the beat into a hollow that then holds three: it rings, and no one sows from it next turn.",
    });
    { // the rules line is the kit's .extra; the marks sit above it as their own row
      const ex = intro.querySelector("." + P + "extra"), mk = ex && ex.querySelector("." + P + "marks");
      if (mk) ex.parentNode.insertBefore(mk, ex);
    }
    plate(api, intro, P, { card: SG === 2 ? "chapter-3" : "chapter-1", numeral: SG === 2 ? "numeral-3" : "numeral-1", at: "30% 60%" });
    stagePicker(P, intro, ctl);
    // a later crossing: the first crossing's board hangs in the hall
    const lastX = secondRun(api) ? marks(api).last() : null;
    const lastRow = lastX && Array.isArray(lastX.boardRow) ? lastX.boardRow.slice(0, 5).map((v) => v | 0) : null;
    const rowWords = lastRow ? (lastRow.some((v) => v > 0) ? `Your row is still in it as you left it, ${lastRow.join(" · ")}` : "Your row is empty in it, as you left it") : "";
    if (lastRow && SG === 0) introNote(P, intro, "The hall, this time", `At the end of the lowest shelf hangs a board you know. ${rowWords}, and nobody has finished that one either.`);
    let myMark = (api.store && api.store.get("mark", "ring")) || "ring"; if (!MARKS.includes(myMark)) myMark = "ring";
    let pieceUrl = "", plainUrl = "";
    const setMark = (m) => {
      myMark = m; try { api.store.set("mark", m); } catch { /* storage off */ }
      intro.querySelectorAll("." + P + "marks button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === m)));
      pngUrl(api, "counter-" + m, 128, 128).then((u) => { if (myMark === m) { pieceUrl = u; render(); } });
    };
    pngUrl(api, "counter-plain", 96, 96).then((u) => { plainUrl = u; });
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const legend = { items: new Set(), add(k, v, c, fresh) { if (this.items.has(k)) return; this.items.add(k); const li = document.createElement("li"); li.innerHTML = `<b></b> <span></span>`; li.querySelector("b").textContent = v; li.querySelector("span").textContent = c; legendEl.appendChild(li); if (fresh) flourish(li, P + "new", RM, 2400); } };
    const say = (m) => { st.msg = m; msg.textContent = m; };

    // ---- the block: wide (rows left to right) or tall (rows top to bottom) ---------------------
    let narrow = false, POS = [], VW = 1200, VH = 760, T = (x, y) => [x, y];
    const isKeep = (i) => i === 5 || i === 11;
    // The board is laid out on the art's own block (counters-board, 1600 x 900): hollows 195 apart,
    // a keep at each end. When the art is missing the same block is drawn here.
    const boardUrl = artUrl(api, "counters-board");
    function build() {
      narrow = wrap.clientWidth < 640 && wrap.clientHeight > wrap.clientWidth;
      // drawn in wide coordinates; when tall it is turned a quarter, keeps top and bottom
      if (narrow) { VW = 900; VH = 1780; T = (x, y) => [900 - y, x + 20]; } else { VW = 1600; VH = 1010; T = (x, y) => [x, y]; }
      const base = [];
      for (let i = 0; i < 5; i++) base[i] = [410 + i * 195, 580];
      base[5] = [1360, 450];
      for (let j = 6; j <= 10; j++) base[j] = [410 + (10 - j) * 195, 320];
      base[11] = [240, 450];
      POS = base.map(([x, y]) => T(x, y));
      svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
      const turn = narrow ? 'transform="translate(900,20) rotate(90)"' : "";
      let s = `<defs><filter id="${P}rough"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter><clipPath id="${P}disc" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".46"/></clipPath></defs>`;
      if (boardUrl) s += `<image href="${boardUrl}" x="0" y="0" width="1600" height="900" ${turn}/>`;
      else {
        const R = mulberry(4);
        s += `<g filter="url(#${P}rough)" ${turn}><rect x="110" y="170" width="1380" height="560" rx="150" fill="${C.ink}"/>`;
        base.forEach(([cx, cy], i) => {
          const rx = isKeep(i) ? 82 : 78, ry = isKeep(i) ? 200 : 70;
          s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.cream}"/>`;
          for (let m = 0; m < (isKeep(i) ? 14 : 8); m++) {
            const a = R() * Math.PI * 2, rr = 0.3 + R() * 0.55, x = cx + rx * rr * Math.cos(a), y = cy + ry * rr * Math.sin(a);
            s += `<path d="M${x - 9},${y} q9,${(R() - 0.5) * 12} 18,0" fill="none" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`;
          }
        });
        s += `</g>`;
      }
      s += `<g class="${P}dyn"></g>`;
      svg.innerHTML = s;
      dyn = svg.querySelector("." + P + "dyn");
      render();
    }
    function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    let dyn = null;
    const spots = (n, i) => Array.from({ length: n }, (_, k) => {
      const [cx, cy] = POS[i];
      if (isKeep(i)) { const off = [((k % 3) - 1) * 30, -108 + Math.floor(k / 3) * 27]; return narrow ? [cx - off[1], cy + off[0]] : [cx + off[0], cy + off[1]]; }
      const a = k * 2.4, r = 11 + 10 * Math.sqrt(k); return [cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.85];
    });

    // ---- rules ----------------------------------------------------------------------------------
    const mine = (who, i) => (who === 0 ? i >= 0 && i <= 4 : i >= 6 && i <= 10);
    const keepOf = (who) => (who === 0 ? 5 : 11);
    const isRung = (i) => st.rung[i] != null && st.rung[i] >= st.turn;
    const legal = (who) => [0, 1, 2, 3, 4].map((k) => (who === 0 ? k : 6 + k)).filter((i) => board[i] > 0 && !isRung(i));
    function simulate(i, who) {
      let n = board[i], j = i; const skip = who === 0 ? 11 : 5;
      while (n > 0) { j = (j + 1) % 12; if (j === skip) continue; n--; }
      return { last: j, cap: mine(who, j) && (j === i ? false : board[j] === 0) && board[10 - j] > 0, keep: j === keepOf(who) };
    }
    function startSow(i, who) {
      const n = board[i]; board[i] = 0;
      const now = performance.now(), k = Math.ceil((now - t0) / PERIOD() + 0.15);
      st.sow = { who, from: i, left: n, at: i, nextBeat: k, taps: [] };
      st.phase = "sow";
      dropBtn.disabled = who !== 0; dropBtn.classList.toggle(P + "live", who === 0 && !RM);
      say(who === 0 ? `${n} counter${n === 1 ? "" : "s"} to sow. Tap Drop as each one falls.` : `He sows, with his ${hand.side} hand${hand.wide ? ": a wide hand, the counters vanish in it" : ": a narrow hand, he holds them in his fingertips"}. Watch the beat.`);
      if (who === 1) sh.set("sawHand", true);
      lendBtn.disabled = true;
      render();
    }
    function dropOne() {
      const sw = st.sow; const skip = sw.who === 0 ? 11 : 5;
      do { sw.at = (sw.at + 1) % 12; } while (sw.at === skip);
      board[sw.at]++; sw.left--;
      const k = sw.nextBeat; sw.nextBeat++;
      sw.pending = { k, at: sw.at, last: sw.left === 0 };
      if (sw.who === 1) sw.pending.on = rng() < 0.9;
      render();
    }
    function judge() {
      const sw = st.sow, p = sw.pending; sw.pending = null;
      let onBeat = p.on;
      if (sw.who === 0) { onBeat = sw.taps.some((t) => Math.abs(t - (t0 + p.k * PERIOD())) <= GOOD); st.myDrops++; if (onBeat) st.myOn++; }
      st.drops.push({ who: sw.who, on: onBeat }); if (st.drops.length > 14) st.drops.shift();
      st.flashes.push({ at: p.at, on: onBeat, t: performance.now(), who: sw.who });
      chime(onBeat);
      if (p.last) endSow(p.at, onBeat);
      else if (st.cutDue && sw.who === 0) return cut();
      render();
    }
    function endSow(j, onBeat) {
      const who = st.sow.who; st.sow = null; dropBtn.disabled = true; dropBtn.classList.remove(P + "live");
      let again = false, note = "";
      if (j === keepOf(who)) { again = true; note = who === 0 ? "Into your keep: go again." : "Into his keep: he goes again."; }
      else if (mine(who, j) && board[j] === 1 && board[10 - j] > 0) {
        const got = board[j] + board[10 - j]; board[keepOf(who)] += got; board[j] = 0; board[10 - j] = 0;
        note = who === 0 ? `Captured ${got}.` : `He captures ${got}.`;
        if (who === 0) { st.caps++; beats.show("He looks at the empty hollow a long time. The one who argues does not like to lose one.", 3600, "cap1"); }
        else st.hisCaps++;
      }
      if (onBeat && j !== 5 && j !== 11 && board[j] === 3) { st.rung[j] = st.turn + 2; note += " The hollow rings: no one sows from it next turn."; if (who === 0) { st.rings++; beats.show("It rings. A clear note, the first one this board has made.", 3200, "ring"); } }
      const rowA = [0, 1, 2, 3, 4].reduce((a, i) => a + board[i], 0), rowB = [6, 7, 8, 9, 10].reduce((a, i) => a + board[i], 0);
      if (!rowA || !rowB) {
        // a row has run empty: the round is counted (the match never is)
        st.rowLeft = [0, 1, 2, 3, 4].map((i) => board[i]);
        for (let i = 0; i < 5; i++) { board[5] += board[i]; board[i] = 0; board[11] += board[6 + i]; board[6 + i] = 0; }
        const a = board[5], b = board[11], w = a > b ? 0 : b > a ? 1 : -1;
        if (w >= 0) st.rounds[w]++;
        st.r1 = { a, b };
        render();
        beats.show(w === 0 ? `A row runs empty, and the round is yours, ${a} to ${b}. The elder cuts a notch in your side of the rim.` : w === 1 ? `A row runs empty, and the round is his, ${b} to ${a}. He cuts the notch in the rim himself, slowly, so you see it.` : `A row runs empty and the round ends even, ${a} each. Nobody cuts a notch.`, 5200, "round1", "A round is counted");
        if (SG === 2) return cut(true);
        st.phase = "wait";
        return later(() => finish("round"), RM ? 1200 : 3600);
      }
      st.turn++;
      if (SG < 2 && st.turn >= TURNS && !again) return finish("called");
      if (st.cutDue || (SG === 2 && st.turn >= TURNS && !again)) return cut();
      if (!again) st.who = 1 - who;
      if (!legal(st.who).length) st.who = 1 - st.who;
      st.phase = "pick";
      say((note ? note + " " : "") + (st.who === 0 ? "Your turn: pick a hollow." : ""));
      render();
      offerLend();
      if (st.who === 0 && !st.small && SG === 0 && st.turn >= 3 && smallOne()) return;
      if (st.who === 1) companionTurn();
    }
    // ---- phase 2: the lent counter ------------------------------------------------------------------
    // One counter from your keep goes into his emptiest hollow, he sows from that hollow at once, and your
    // turn is spent. It keeps a row from running empty; it is also simply a thing you can give him.
    function offerLend() {
      if (SG === 0) return;
      const can = !st.over && st.phase === "pick" && st.who === 0 && board[5] >= 1;
      lendBtn.hidden = false; lendBtn.disabled = !can;
      if (can && legend.add("lend", "Lend", "G · one counter from your keep, into his row", true)) beats.show("You have counters in your keep now. You may lend him one: it goes into his row, he sows it at once, and your turn is spent.", 5600, "lend0", "New · The lent counter");
      const his = [6, 7, 8, 9, 10].reduce((a, i) => a + board[i], 0);
      if (can && his <= 2) beats.show("His row is almost bare. When a row runs empty the round is counted, and the game you are playing is over. A lent counter keeps it going.", 5600, "lend1", "His row");
    }
    function lend() {
      if (SG === 0 || st.over || st.phase !== "pick" || st.who !== 0 || board[5] < 1) return;
      const to = [10, 9, 8, 7, 6].reduce((a, i) => (board[i] < board[a] ? i : a), 10);
      board[5]--; board[to]++; st.lent++; st.turn++;
      beats.show("You take one counter out of your keep and set it in his row. He looks at it, and then at you, and sows it.", 4600, "lent", "The lent counter");
      st.who = 1; render();
      startSow(to, 1);
    }
    function interlude() {
      st.phase = "wait"; st.who = 1; render();
      if (smallEl) smallChoice("auto");
      flashPlate(wrap, api, "interstitial-days-later", RM ? 1200 : 5200, RM, "top:58%");
      beats.show("Days pass in the marrow. The song is nearly found. You sit to the board again; the elders have stopped showing where counters land.", 5600, "sit2", "The second sitting · 64 beats a minute");
      later(() => {
        st.sitting = 2; st.bpm = 64; t0 = performance.now(); st.sit2At = performance.now();
        head.querySelector("." + P + "sit").textContent = "the second sitting · 64 beats a minute · no glows";
        dropBtn.style.setProperty("--beat", `${PERIOD()}ms`);
        st.who = 0; st.phase = "pick"; say("Your turn: pick a hollow. No glows now."); render();
        later(() => { st.cutDue = true; if (st.phase === "pick" && st.who === 0) cut(); }, SIT2_MS);
      }, RM ? 1200 : 5800);
    }
    function cut(lastFall) {
      if (st.over) return;
      st.lastFall = !!lastFall;
      if (smallEl) smallChoice("auto");
      flashPlate(wrap, api, "interstitial-dimming", RM ? 1200 : 3600, RM, "top:58%");
      st.phase = "cut"; st.sow = null; dropBtn.disabled = true; dropBtn.classList.remove(P + "live");
      render();
      beats.show(lastFall ? "“It is time.” The elders are at the door as the last counter of the round falls, before anyone counts the keeps." : "“It is time.” The elders are at the door. The counter you were sowing stays in your hand.", 6000, "cut", "The cut");
      say("The match will not be finished. Your counter piece is in your keep: pocket it, or leave it on the board.");
      legend.add("piece", "Pocket / Leave", "P · L · the buttons", true);
      dropBtn.hidden = true; choice.hidden = false; choice.querySelector("button").focus();
    }
    function choose(c) {
      if (st.phase !== "cut" || st.over) return;
      st.kept = c === "pocket";
      if (SG === 2) return oldest();
      finish("cut");
    }
    // ---- the set-piece: One Move on the Oldest Board ------------------------------------------------
    let oldEl = null;
    function oldest() {
      st.phase = "old"; choice.hidden = true;
      oldEl = document.createElement("div"); oldEl.className = P + "old"; oldEl.setAttribute("role", "dialog"); oldEl.setAttribute("aria-label", "The oldest board in the hall");
      const wall = artUrl(api, "counters-hall-wall"), handUrl = artUrl(api, "thread-own");
      const cell = (i, n, live) => { const x = 110 + (i % 5) * 96, y = i < 5 ? 150 : 60; let d = `<ellipse cx="${x}" cy="${y}" rx="38" ry="32" fill="#d8ccb4" stroke="${live ? C.gold : C.dim}" stroke-width="${live ? 5 : 2}"/>`;
        for (let k = 0; k < n; k++) d += `<ellipse cx="${x - 12 + k * 12}" cy="${y + (k % 2) * 6 - 3}" rx="10" ry="7" fill="${C.ink}"/>`; return d; };
      const draw = (row, keep, step) => `<svg viewBox="0 0 640 210" role="img" aria-label="An old board, grey with handling: one hollow still holds counters"><rect x="6" y="14" width="628" height="182" rx="70" fill="#4a4038"/>
<ellipse cx="46" cy="105" rx="30" ry="72" fill="#d8ccb4" stroke="${C.dim}" stroke-width="2"/><ellipse cx="594" cy="105" rx="30" ry="72" fill="#d8ccb4" stroke="${step === 2 ? C.gold : C.dim}" stroke-width="${step === 2 ? 5 : 2}"/>
${[0, 1, 2, 3, 4].map((i) => cell(5 + i, 0, false)).join("")}${row.map((n, i) => (step === 0 && n ? `<g role="button" tabindex="0" data-old="${i}" aria-label="The last hollow with counters in it: ${n}">${cell(i, n, true)}</g>` : cell(i, n, false))).join("")}
${Array.from({ length: 14 }, (_, k) => `<ellipse cx="${36 + (k % 2) * 20}" cy="${50 + Math.floor(k / 2) * 15}" rx="9" ry="6" fill="${C.ink}"/>`).join("")}${Array.from({ length: keep }, (_, k) => `<ellipse cx="${584 + (k % 2) * 20}" cy="${46 + Math.floor(k / 2) * 15}" rx="9" ry="6" fill="${C.ink}"/>`).join("")}</svg>`;
      const row = [0, 0, 0, 0, 1]; let keep = 15, step = 0;
      const paint = (text, btn) => {
        oldEl.innerHTML = `<div class="${P}op">${wall ? `<img alt="The hall wall: the boards of every group, none of them finished." src="${wall}">` : ""}${step === 2 && handUrl ? `<img class="${P}hand" alt="A closed hand above a board." src="${handUrl}">` : ""}</div>${draw(row, keep, step === 1 ? 2 : step)}<p aria-live="polite"><b>One move on the oldest board</b>${text}</p>${btn ? `<button type="button">${btn}</button>` : ""}`;
        const f = oldEl.querySelector("button, g[role=button]"); if (f) f.focus();
      };
      const act = () => {
        if (step === 0) { step = 1; row[4] = 0; paint("You lift it. One counter, and the keep in front of it. When it lands this row is empty, and the oldest game in the world is over. The heart beats, and you let go on the beat, as you were taught.", "DROP <small>(Space)</small>"); }
        else if (step === 1) { step = 2; st.oldDone = true; paint("As it falls an old hand covers the keep. The counter drops into the palm instead. The hand turns over, and closes your fingers round it. Nobody says anything.", "GO TO THE ELDERS <small>(Enter)</small>"); }
        else if (step === 2) {
          // phase 3: the first of the Four Marks, on this board's rim
          step = 3;
          revealMark(root, api, "board", "Before you go you look at the rim. Four signs are cut along it, worn almost smooth: a wave, a spiral, a fork, a star. Beside them the tally this group kept stops at the third of five notches, and the wave is cut there, deeper than the rest. Their game is still one move from finished.", () => { if (oldEl) { oldEl.remove(); oldEl = null; } finish("cut"); });
        }
      };
      wrap.appendChild(oldEl);
      on(oldEl, "click", (e) => { if (e.target.closest("button, g[role=button]")) act(); });
      st.oldAct = act;
      paint("On the way out, the elder stops you at the lowest board on the wall. It is grey with handling. Every hollow is empty but the last in the near row, and that one holds a single counter: one sowing would finish it. He waits.", "");
    }
    let compTimer = 0;
    function companionTurn() {
      compTimer = later(() => {
        if (st.over || st.phase === "cut" || st.phase === "wait") return;
        const opts = legal(1); if (!opts.length) return;
        const caps = opts.filter((i) => simulate(i, 1).cap);
        const keeps = opts.filter((i) => simulate(i, 1).last === 11);
        const pick = keeps[0] ?? caps[0] ?? opts[Math.floor(rng() * opts.length)];
        startSow(pick, 1);
      }, 900);
    }
    function finish(how) {
      if (st.over) return;
      if (smallEl) smallChoice("auto");
      st.over = true; dropBtn.disabled = true; lendBtn.disabled = true; render();
      const a = board[5], b = board[11], share = st.myDrops ? Math.round((100 * st.myOn) / st.myDrops) : 0;
      const time = ` You dropped ${share}% of your counters on the beat${share >= 70 ? ": your hands have the heart's time (+15 ms on the river)." : share <= 40 ? ": on the river your window will narrow (−10 ms)." : "."}`;
      // links: the row you leave is a phrase in Marrow-Song and the raft's hum; the teach's board is where the twist begins
      const row = st.rowLeft || [0, 1, 2, 3, 4].map((i) => board[i]);
      sh.set("boardRow", row);
      if (SG === 0) { try { api.store.set("left", { board: board.slice(), small: st.small ? { from: st.small.from, to: st.small.to, choice: st.small.choice } : null }); } catch { /* storage off */ } }
      const rowNote = ` The row you leave: ${row.join(" · ")}.`;
      let text, outcome;
      if (SG === 0) {
        outcome = share >= 50 ? "win" : "done";
        text = `The elders call you to eat, and the board stays where it is between you, ${how === "round" ? "one round counted" : "mid-game"} (keeps: you ${a}, him ${b}).${rowNote}`;
      } else if (SG === 1) {
        const took = st.caps + st.rings;
        outcome = a < b ? "lose" : a === b ? "done" : took ? "win" : "done";
        text = (a > b ? `Twelve turns, and you are ahead: ${a} to ${b}, with ${st.caps} capture${st.caps === 1 ? "" : "s"} and ${st.rings} rung hollow${st.rings === 1 ? "" : "s"}${took ? "." : ". You were ahead without ever taking anything."}` : a < b ? `Twelve turns, and he is ahead, ${b} to ${a}. He will say so for as long as you are together.` : `Twelve turns, and it stands even at ${a}.`)
          + (st.lent ? ` You lent him ${st.lent} counter${st.lent === 1 ? "" : "s"}; he did not thank you, and he sowed ${st.lent === 1 ? "it" : "them"}.` : "") + rowNote;
      } else if (how === "round") {
        outcome = a > b ? "win" : a < b ? "lose" : "done";
        text = a > b ? `A row runs empty and the round is yours, ${a} to ${b}. The match goes on another day; no group finishes it.` : a < b ? `A row runs empty and he takes the round, ${b} to ${a}. He will not let you forget it, for as long as you are together.` : `A row runs empty: ${a} each.`;
      } else {
        const [ra, rb] = st.rounds, ahead = ra !== rb ? (ra > rb ? 0 : 1) : a > b ? 0 : b > a ? 1 : -1;
        outcome = ahead === 0 ? "win" : ahead === 1 ? "lose" : "done";
        const rounds = ra + rb ? `Rounds ${ra} to ${rb}; ` : "";
        const cap0 = (x) => x.charAt(0).toUpperCase() + x.slice(1);
        const lead0 = ahead === 0 ? `${rounds}you were ahead (keeps: you ${a}, him ${b}) when the elders came.` : ahead === 1 ? `${rounds}he was ahead (keeps: you ${a}, him ${b}) when the elders came, and he will say so for as long as you are together.` : `${rounds}it stood even when the elders came.`;
        const lead = cap0(lead0);
        const piece = st.kept ? " You pocket your counter piece. It will be in your hand on the river." : " You leave your piece in your keep. The board goes up on the wall with the others, unfinished, and your piece with it.";
        text = lead + piece;
      }
      const small = st.small && st.small.choice ? (st.small.choice === "left" ? " The counter the small one moved stayed where he put it." : " You put the small one's counter back.") : "";
      const old = st.oldDone ? " On the way out you lifted the last counter of the oldest board in the hall, and it is closed in your hand. That game is still one move from finished." : "";
      ctl.end({ outcome, text: text + small + old + time }, () => endCard(wrap, api, "chapter-4", { numeral: "numeral-4", inset: st.kept || st.oldDone ? "thread-own" : "counters-hall-wall" }));
    }

    // ---- sound ----------------------------------------------------------------------------------
    function chime(onBeat) {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.type = onBeat ? "sine" : "triangle"; o.frequency.value = onBeat ? 880 : 140;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(onBeat ? 0.25 : 0.3, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + (onBeat ? 0.9 : 0.15));
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 1);
    }
    function thump() {
      if (!audio) return;
      const t = audio.currentTime, o = audio.createOscillator(), v = audio.createGain();
      o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.1);
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(0.18, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(v).connect(audio.destination); o.start(t); o.stop(t + 0.2);
    }

    // ---- drawing --------------------------------------------------------------------------------
    function render() {
      if (!dyn) return;
      let d = "";
      const readable = st.sitting === 1 && st.phase === "pick" && st.who === 0 && st.hover >= 0 && st.hover <= 4 && board[st.hover] > 0 && !isRung(st.hover);
      const sim = readable ? simulate(st.hover, 0) : null;
      const rx0 = narrow ? 70 : 78, ry0 = narrow ? 78 : 70;
      const sm = st.small && st.small.open ? st.small : null;
      POS.forEach(([cx, cy], i) => {
        const keep = isKeep(i);
        const krx = narrow ? (keep ? 200 : 70) : keep ? 82 : 78, kry = narrow ? (keep ? 82 : 78) : keep ? 200 : 70;
        const pickable = !st.over && st.phase === "pick" && st.who === 0 && i <= 4 && board[i] > 0 && !isRung(i);
        d += `<g class="${P}hol" data-i="${i}" ${i <= 4 ? `tabindex="0" role="button" aria-label="Hollow ${i + 1}, ${board[i]} counters${isRung(i) ? ", rung" : ""}"` : ""}>`;
        d += `<ellipse class="${P}pit" cx="${cx}" cy="${cy}" rx="${krx}" ry="${kry}" fill="transparent" stroke="${pickable && (st.hover === i || st.sel === i) ? C.gold : pickable ? "rgba(242,181,68,.45)" : "none"}" stroke-width="${pickable && (st.hover === i || st.sel === i) ? 10 : 4}"/>`;
        if (isRung(i)) d += `<ellipse cx="${cx}" cy="${cy}" rx="${rx0 + 6}" ry="${ry0 + 6}" fill="none" stroke="${C.red}" stroke-width="9"/><ellipse cx="${cx}" cy="${cy}" rx="${rx0 + 20}" ry="${ry0 + 20}" fill="none" stroke="${C.red}" stroke-width="4" stroke-dasharray="6 8"/>`;
        if (sim && (i === sim.last)) d += `<ellipse cx="${cx}" cy="${cy}" rx="${krx}" ry="${kry}" fill="${sim.cap || sim.keep ? C.gold : C.cream}" opacity=".45" stroke="${C.gold}" stroke-width="5" stroke-dasharray="10 6"/>`;
        if (sim && sim.cap && i === 10 - sim.last) d += `<ellipse cx="${cx}" cy="${cy}" rx="${krx}" ry="${kry}" fill="${C.gold}" opacity=".35"/>`;
        if (sm && i === sm.from) d += `<ellipse cx="${cx}" cy="${cy}" rx="${krx + 8}" ry="${kry + 8}" fill="none" stroke="${C.red}" stroke-width="5" stroke-dasharray="4 10"/>`;
        if (sm && i === sm.to) d += `<ellipse cx="${cx}" cy="${cy}" rx="${krx + 8}" ry="${kry + 8}" fill="none" stroke="${C.red}" stroke-width="8"/>`;
        spots(board[i], i).forEach(([x, y], k) => {
          const piece = i === 5 && k === 0 && !st.kept;
          const his = sm && i === sm.to && k === board[i] - 1; // the counter the small one set down
          if (piece && pieceUrl) d += `<image href="${pieceUrl}" x="${x - 34}" y="${y - 34}" width="68" height="68" clip-path="url(#${P}disc)"/>`;
          else if (his && plainUrl) d += `<image href="${plainUrl}" x="${x - 30}" y="${y - 30}" width="60" height="60" clip-path="url(#${P}disc)"/><circle cx="${x}" cy="${y}" r="29" fill="none" stroke="${C.red}" stroke-width="4"/>`;
          else d += `<ellipse cx="${x}" cy="${y}" rx="${piece ? 25 : 20}" ry="${piece ? 18 : 14}" fill="${piece || his ? C.red : C.ink}" transform="rotate(${((k * 37) % 60) - 30} ${x} ${y})"/><path d="M${x - 8},${y - 4} q8,-5 16,0" fill="none" stroke="${C.cream}" stroke-width="2.5"/>`;
        });
        let lx = cx, ly;
        if (narrow) { lx = keep ? cx + 244 : i <= 4 ? cx - 104 : cx + 104; ly = cy + 16; }
        else ly = keep ? cy + 244 : i <= 4 ? cy + 106 : cy - 82;
        d += `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="${narrow ? 50 : 38}" font-weight="700" fill="${C.cream}" stroke="${C.ink}" stroke-width="5" paint-order="stroke">${board[i]}</text></g>`;
      });
      if (sm) { const [a, b] = [POS[sm.from], POS[sm.to]]; d += `<path d="M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2 + (narrow ? 90 : 0)},${(a[1] + b[1]) / 2 + (narrow ? 0 : 110)} ${b[0]},${b[1]}" fill="none" stroke="${C.red}" stroke-width="6" stroke-dasharray="3 12" stroke-linecap="round"/>`; }
      if (sim) { const [x, y] = POS[sim.last]; d += `<text x="${x}" y="${y - (narrow ? 96 : 84)}" text-anchor="middle" font-size="${narrow ? 34 : 26}" font-style="italic" fill="${C.cream}" stroke="${C.ink}" stroke-width="5" paint-order="stroke">${sim.keep ? "go again" : sim.cap ? "capture" : "lands here"}</text>`; }
      // drop flashes: a red ring on the beat, a dull smudge off it
      const now = performance.now();
      st.flashes = st.flashes.filter((f) => now - f.t < 700);
      for (const f of st.flashes) { const [x, y] = POS[f.at], a = (now - f.t) / 700, r = RM ? 86 : 74 + a * 36; d += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${f.on ? C.red : C.dim}" stroke-width="${f.on ? 10 : 5}" opacity="${1 - a}"/>`; }
      if (st.sow && st.sow.pending) { const [x, y] = POS[st.sow.pending.at]; d += `<ellipse cx="${x}" cy="${y}" rx="${rx0 + 8}" ry="${ry0 + 8}" fill="none" stroke="${C.red}" stroke-width="6" opacity=".9"/>`; }
      const [yk, hk] = [POS[5], POS[11]];
      const tag = (x, y, t, sz) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${sz}" font-weight="700" fill="${C.ink}" stroke="${C.cream}" stroke-width="6" paint-order="stroke">${t}</text>`;
      d += narrow ? tag(yk[0], yk[1] + 172, "YOUR KEEP", 34) + tag(hk[0], hk[1] - 142, "HIS KEEP", 34)
        : tag(yk[0], yk[1] - 296, "YOUR KEEP", 24) + tag(hk[0], hk[1] - 296, "HIS KEEP", 24);
      // the beat row: heartbeat cuts, dull ones faded
      const by = narrow ? VH - 84 : 950, bx0 = narrow ? 40 : 96, bstep = narrow ? 62 : 100;
      st.drops.slice(narrow ? -13 : -14).forEach((b, i) => {
        const x = bx0 + i * bstep, col = b.who === 0 ? C.ink : C.dim;
        d += `<path d="M${x},${by} l14,0 l8,-28 l10,48 l8,-20 l14,0" fill="none" stroke="${b.on ? (b.who === 0 ? C.red : col) : col}" stroke-width="${b.on ? 7 : 5}" stroke-linejoin="round" opacity="${b.on ? 1 : 0.35}"/>`;
      });
      d += `<text x="${bx0 - 20}" y="${by + (narrow ? 62 : 48)}" font-size="${narrow ? 34 : 24}" font-style="italic" fill="${C.ink}">${st.myDrops ? `on the beat: ${Math.round((100 * st.myOn) / st.myDrops)}% of your drops` : "your drops show here; red rang on the beat"}</text>`;
      dyn.innerHTML = d;
      head.querySelector("." + P + "score").textContent = `rounds ${st.rounds[0]}–${st.rounds[1]} · keeps: you ${board[5]}, him ${board[11]}`;
    }

    // ---- phase 1: the small one moves a counter (DEEP_DIVE.md section 2, scene 2) -----------------
    // Once, in the first sitting, before one of your turns. He takes one counter from your fullest
    // hollow and sets it in your emptiest. Put it back, or leave it: the board stays as you decide.
    let smallEl = null;
    function smallOne() {
      const row = [0, 1, 2, 3, 4], from = row.reduce((a, i) => (board[i] > board[a] ? i : a), 0);
      const to = row.filter((i) => i !== from).reduce((a, i) => (board[i] < board[a] ? i : a), from === 0 ? 1 : 0);
      if (board[from] < 2) return false;
      board[from]--; board[to]++;
      st.small = { from, to, open: true, choice: null, t: performance.now() }; st.phase = "small";
      smallEl = document.createElement("div"); smallEl.className = P + "small"; smallEl.setAttribute("role", "dialog"); smallEl.setAttribute("aria-label", "The small one moves a counter");
      const pic = artImg(api, "small-one", "", "A small child at the edge of the board, one hand on a counter");
      smallEl.innerHTML = `<b>The small one · from the alcoves</b><p>He moves one counter. He looks at you to see whether it was allowed.</p><div><button type="button" data-s="back">PUT IT BACK <small>(B)</small></button><button type="button" data-s="left">LEAVE IT <small>(V)</small></button></div>`;
      if (pic) smallEl.insertBefore(pic, smallEl.firstChild);
      wrap.appendChild(smallEl);
      on(smallEl, "click", (e) => { const b = e.target.closest("button"); if (b) smallChoice(b.dataset.s); });
      legend.add("small", "Put back / Leave", "B · V · the buttons", true);
      say(`A child of the next group has crept out. One counter has gone from hollow ${from + 1} to hollow ${to + 1}.`);
      // focus goes to the panel, not a button, and the first moment is ignored: a Drop tap must not answer for you
      smallEl.tabIndex = -1; render(); smallEl.focus({ preventScroll: true });
      return true;
    }
    function smallChoice(c) {
      const sm = st.small; if (!sm || !sm.open || st.over) return;
      if (c !== "auto" && performance.now() - sm.t < 700) return;
      if (c === "auto") c = "left";
      sm.open = false; sm.choice = c;
      if (c === "back") { board[sm.to]--; board[sm.from]++; }
      if (smallEl) { smallEl.remove(); smallEl = null; }
      beats.show(c === "back" ? "You set it back. He goes to his alcove without a sound, humming your song. One note of it is wrong."
        : "You leave it where he put it. He stays at the rim and watches every counter you drop.", 5200, "small", "The small one");
      st.phase = "pick";
      say(c === "back" ? "The board is as it was. Your turn: pick a hollow." : "The board is as he left it. Your turn: pick a hollow.");
      render();
    }

    // ---- input ----------------------------------------------------------------------------------
    function tap() {
      if (!st.sow || st.sow.who !== 0) return;
      st.sow.taps.push(performance.now());
      flourish(dropBtn, P + "tap", RM, 120);
    }
    function pick(i) {
      if (st.over || !st.started || st.phase !== "pick" || st.who !== 0) return;
      if (i > 4 || !board[i]) { if (i <= 4) say("That hollow is empty."); return; }
      if (isRung(i)) { say("That hollow is rung: no sowing from it this turn."); return; }
      startSow(i, 0);
    }
    on(svg, "pointerdown", (e) => {
      if (st.sow) { e.preventDefault(); tap(); return; }
      const h = e.target.closest("." + P + "hol"); if (h) pick(+h.dataset.i);
    });
    on(svg, "pointermove", (e) => { const h = e.target.closest("." + P + "hol"); const i = h ? +h.dataset.i : -1; if (i !== st.hover) { st.hover = i; render(); } });
    on(svg, "focusin", (e) => { const h = e.target.closest("." + P + "hol"); if (h) { st.hover = +h.dataset.i; st.sel = st.hover; render(); } });
    on(dropBtn, "pointerdown", (e) => { e.preventDefault(); tap(); });
    on(choice, "click", (e) => { const b = e.target.closest("button"); if (b) choose(b.dataset.c); });
    on(lendBtn, "click", lend);
    on(window, "keydown", (e) => {
      if (!st.started) { if (e.target && e.target.dataset && e.target.dataset.stage) return; if ((e.key === "Enter" || e.key === " ") && !(e.target.closest && e.target.closest("." + P + "marks"))) { e.preventDefault(); begin(); } return; }
      const k = e.key.toLowerCase();
      if (st.phase === "old") { if (k === " " || k === "enter") { e.preventDefault(); if (!e.repeat && st.oldAct) st.oldAct(); } return; }
      if (st.phase === "cut") { if (k === "p") choose("pocket"); if (k === "l") choose("leave"); return; }
      if (k === "g") { lend(); return; }
      if (st.phase === "small") { if (k === "b") smallChoice("back"); if (k === "v") smallChoice("left"); return; }
      if (k === " " || k === "j") { e.preventDefault(); if (e.repeat) return; if (st.sow) tap(); else pick(st.sel); return; }
      if (st.phase !== "pick" || st.who !== 0) return;
      if (k === "arrowleft" || k === "arrowright" || k === "arrowup" || k === "arrowdown") {
        e.preventDefault(); const d = k === "arrowleft" || k === "arrowup" ? -1 : 1;
        st.sel = (st.sel + d + 5) % 5; st.hover = st.sel; render();
        const g = svg.querySelector(`[data-i="${st.sel}"]`); g && g.focus({ preventScroll: true });
      } else if (k === "enter") { e.preventDefault(); pick(st.sel); }
    });
    function begin() {
      if (st.started) return;
      intro.remove(); st.started = true;
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      t0 = performance.now(); dropBtn.style.setProperty("--beat", `${PERIOD()}ms`);
      legend.add("pick", "Pick", "tap · ←/→ Enter"); legend.add("drop", "Drop", "Space · tap · DROP"); if (SG < 2) legend.add("read", "Read", "hover · focus (first sitting)");
      if (SG === 0) beats.show("“Sow with the heart.”", 2600, "elder", "The elder");
      if (SG === 0 && lastRow) later(() => beats.show(`Your old board is on the wall behind him. ${rowWords}. The small one has been looking at it.`, 5200, "oldboard", "A board you know"), RM ? 0 : 3000);
      if (SG === 2) {
        beats.show("The board is not the one you set. The elders have stopped showing where counters land.", 5200, "sit2", "The second sitting");
        later(() => { st.cutDue = true; if (st.phase === "pick" && st.who === 0 && !st.over) cut(); }, SIT2_MS);
      }
      legend.add("sign", "Your sign", myMark);
      say(SG === 2 ? "Your turn: pick a hollow. No glows now." : "Your turn: pick a hollow in your row. Hover one to see where its last counter lands.");
      offerLend();
      render();
    }
    on(intro.querySelector("." + P + "start"), "click", begin);
    on(intro, "click", (e) => { const b = e.target.closest("." + P + "marks button"); if (b) setMark(b.dataset.m); });
    setMark(myMark);

    function frame(now) {
      if (st.started && !st.over && st.phase !== "cut" && st.phase !== "wait" && st.phase !== "small" && st.phase !== "old") {
        const k = Math.floor((now - t0) / PERIOD());
        if (k !== st.lastBeat) { st.lastBeat = k; thump(); if (rim && !RM) { rim.style.transition = "none"; rim.style.opacity = "1"; void rim.offsetWidth; rim.style.transition = "opacity .6s"; rim.style.opacity = ".2"; } }
        const sw = st.sow;
        if (sw) {
          if (!sw.pending && sw.left > 0 && now >= t0 + sw.nextBeat * PERIOD()) dropOne();
          if (sw.pending && now >= t0 + sw.pending.k * PERIOD() + GOOD + 20) judge();
        }
      }
      if (st.flashes.length) render();
      raf = requestAnimationFrame(frame);
    }
    const ro = new ResizeObserver(() => { const n = wrap.clientWidth < 640 && wrap.clientHeight > wrap.clientWidth; if (n !== narrow || !dyn) build(); });
    ro.observe(wrap);
    build();
    raf = requestAnimationFrame(frame);

    return {
      unmount() {
        cancelAnimationFrame(raf); clearTimeout(compTimer); ro.disconnect();
        timers.forEach(clearTimeout);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  }
}

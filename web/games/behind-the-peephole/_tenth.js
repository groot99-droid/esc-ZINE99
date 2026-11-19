// Behind the Peephole / The Statement, night seven: the tenth line (phase 3, built 2026-11-16).
// Offered by the Statement once all five marks of the seventh row are in (./_seventh.js). Four parts,
// in the carbon-copy typewriter style of the forms:
//   1. TONIGHT YOU ONLY CONFIRM: the Account arrives typed by H.W.; three of its four lines are bent
//      toward Ruth. Strike what your carbons deny (each strike rings the desk phone once).
//   2. RECONCILE: Mara's dots against your own night strip. One night she has one dot more than you
//      have visits; name the night, then who else was at a rose at one o'clock.
//   3. THE 1971 PAGE, from behind the booking ledger, and THE TENTH LINE, "400: ___": witness,
//      product, guest or nobody. Stamping it solves the long puzzle ("seventh".solved).
//   4. THE CARBONS: under 403's valet door, under all six, or into Wren's envelope.
// Cuts: the six mission rows of the Account are taken as already confirmed; four typed lines stand for
// them. Your visits are the design's night strip, not the run's own.
import { setRun, runOf, isSecond, shiftOf } from "./_seventh.js";

const TYPED = [
  { id: "t405", line: "405 · DROP A BANNER AT THE GALA", carbon: "Your carbon, night five: 405 is Kit Saelens, cables and a laptop at 01:30.", bent: true },
  { id: "t406", line: "406 · WIPE THE CAMERAS AND PLANT THE GALA LOGGER", carbon: "Your carbon, night five: 406 is Ruth Saelens, sewing one letter a night.", bent: true },
  { id: "t402", line: "402 · GIVE DROST'S ACCOUNTS TO THE PRESS", carbon: "Your carbon, night four: 402's hollow needle, and the pages that went to 404.", bent: false },
  { id: "tleak", line: "THE LEAK 401 WAS PAID TO FIND · 406", carbon: "Your carbon, night five: 402 at the mirror with two sets of pages. Not 406.", bent: true },
];
const NIGHTS = [1, 3, 4, 5, 6], DOTS = [1, 1, 2, 1, 1], VISITS = [1, 1, 1, 1, 1];
const WHO = [
  { id: "lew", name: "Lew", why: "brings the tea at one, and stands in the office while you drink it" },
  { id: "dora", name: "Dora", why: "her linen round passes the office door at one; the wheels stop" },
  { id: "fenn", name: "Fenn", why: "knocks at 2:14, never before" },
  { id: "wren", name: "Wren", why: "has never once been on the fourth floor" },
];
const WORDS = ["witness", "product", "guest", "nobody"];

export function tenthLine(root, api) {
  const shared = api.shared, art = api.art || { has: () => false, url: () => "" }, RM = api.reducedMotion;
  const P = "behind-the-peephole-tenth-";
  const st = document.createElement("style");
  st.textContent = `
  .${P}pg{position:absolute;inset:0;overflow-x:hidden;overflow-y:auto;background:#1f3d2c radial-gradient(ellipse at 50% 0,#2f5a40,#1f3d2c 70%);font-family:"Courier New",Courier,monospace;color:#2a3a8c}
  .${P}sh{margin:12px auto 40px;max-width:820px;width:calc(100% - 20px);box-sizing:border-box;background:#efe6cf;box-shadow:0 8px 30px #0008;padding:18px clamp(12px,3vw,32px) 24px;
    background-image:radial-gradient(ellipse at 18% 28%,rgba(42,58,140,.12),transparent 38%),repeating-linear-gradient(0deg,transparent 0 27px,rgba(42,58,140,.07) 27px 28px)}
  .${P}hd{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;border-bottom:1.5px solid #2a3a8c;padding-bottom:6px;letter-spacing:.08em;font-size:13px}
  .${P}hd b{font-size:clamp(15px,2vw,19px)}
  .${P}st{font:italic 15px/1.45 Georgia,serif;color:#1c1a17;margin:10px 0;padding:6px 10px;border-left:3px solid #2a3a8c;background:rgba(42,58,140,.05)}
  .${P}sec{margin:16px 0 0;padding-top:8px;border-top:1px dashed #2a3a8c}
  .${P}sec[aria-disabled="true"]{opacity:.38;pointer-events:none}
  .${P}sec h3{margin:0 0 6px;font-size:14px;letter-spacing:.12em}
  .${P}ty{display:block;width:100%;text-align:left;font:inherit;font-size:14px;line-height:1.4;color:#1c1a17;background:#f6f1e4;border:1px solid #b9b3a2;padding:8px 10px;margin:6px 0;cursor:pointer;min-height:44px;box-sizing:border-box}
  .${P}ty:focus-visible,.${P}b:focus-visible{outline:2.5px dashed #a3302a;outline-offset:2px}
  .${P}ty b{letter-spacing:.04em}
  .${P}ty small{display:block;color:#2a3a8c;font-size:12px;margin-top:3px}
  .${P}ty.x b{text-decoration:line-through;text-decoration-color:#a3302a;text-decoration-thickness:2px;opacity:.6}
  .${P}tb{border-collapse:collapse;font-size:13px;margin:6px 0;max-width:100%}
  .${P}tb th,.${P}tb td{border:1px solid #2a3a8c;padding:4px 6px;text-align:center}
  .${P}tb th:first-child{text-align:left;font-weight:400;font-size:12px}
  .${P}tb button{font:inherit;font-weight:700;color:#2a3a8c;background:transparent;border:0;min-width:40px;min-height:40px;cursor:pointer}
  .${P}tb button.on{background:#2a3a8c;color:#efe6cf}
  .${P}dots i{display:inline-block;width:10px;height:10px;border-radius:50%;background:#b8913f;border:1px solid #5d4518;margin:0 1px}
  .${P}row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
  .${P}b{font:inherit;font-size:13px;font-weight:700;letter-spacing:.06em;color:#2a3a8c;background:transparent;border:1.6px solid #2a3a8c;padding:6px 10px;cursor:pointer;min-height:44px;text-align:left}
  .${P}b.on{background:#2a3a8c;color:#efe6cf}
  .${P}b small{display:block;font-weight:400;letter-spacing:0;font-size:12px}
  .${P}b.sign{color:#a3302a;border-color:#a3302a}
  .${P}b[disabled]{opacity:.4;cursor:default}
  .${P}msg{min-height:1.4em;color:#1c1a17;font-size:14px;margin:6px 0}
  .${P}pp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
  @media (max-width:560px){.${P}pp{grid-template-columns:minmax(0,1fr)}}
  .${P}pp img{width:100%;height:auto;display:block;box-shadow:1px 3px 10px #0005}
  .${P}ten{font-size:18px;font-weight:700;letter-spacing:.06em;margin:8px 0;color:#1c1a17}
  .${P}ten span{display:inline-block;min-width:8em;border-bottom:1.5px dashed #2a3a8c;text-align:center;color:#2a3a8c}
  .${P}stamp{width:160px;max-width:50%;height:auto;display:block;margin:4px 0 0 auto;mix-blend-mode:multiply}
  .${P}intro{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:12px;overflow:auto;background:rgba(19,39,28,.9)}
  .${P}form{max-width:540px;width:100%;box-sizing:border-box;background:#efe6cf;padding:18px 20px;color:#2a3a8c;font-size:14px;line-height:1.5;box-shadow:0 6px 24px #000a}
  .${P}form h2{margin:8px 0 4px;letter-spacing:.14em;font-size:20px}
  .${P}form p{margin:0 0 10px}
  .${P}form .o{font:italic 15px/1.4 Georgia,serif;color:#1c1a17}
  `;
  const pg = document.createElement("div"); pg.className = P + "pg";
  root.append(st, pg);
  const second = isSecond(shared);
  const struck = new Set(); let rings = 0, night = null, who = null, word = null, stamped = false, carbons = null, done = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  pg.innerHTML = `<div class="${P}sh">
    <div class="${P}hd"><b>THE CROSSING · NIGHT LOG · THE ACCOUNT</b><span>FORM S-7 · NIGHT 7</span></div>
    ${art.has("chapter-n7") ? `<img alt="Night Seven: The Lens in Your Door" src="${art.url("chapter-n7")}" style="display:block;width:100%;height:clamp(70px,14vw,130px);object-fit:cover;margin-top:8px">` : ""}
    <p class="${P}st" data-story></p>
    <div class="${P}sec" data-s="1"><h3>1 · TONIGHT YOU ONLY CONFIRM</h3>
      <p style="margin:0;color:#1c1a17">The Account came already typed, initialled H.W. Tap a line to strike it in your own ink. Your carbons are under each.</p>
      <div data-typed></div><div class="${P}row"><button type="button" class="${P}b" data-go="2">THE ACCOUNT STANDS AS STRUCK</button></div></div>
    <div class="${P}sec" data-s="2" aria-disabled="true"><h3>2 · RECONCILE</h3>
      <p style="margin:0;color:#1c1a17">Mara's dots, one for every time her rose went dark while she painted, against your own night strip at 403. Tap the night they disagree.</p>
      <div style="overflow-x:auto"><table class="${P}tb"><tr><th>NIGHT</th>${NIGHTS.map((n, i) => `<th><button type="button" data-n="${i}">N${n}</button></th>`).join("")}</tr>
      <tr><th>MARA'S DOTS</th>${DOTS.map((d) => `<td class="${P}dots">${"<i></i>".repeat(d)}</td>`).join("")}</tr>
      <tr><th>YOUR VISITS</th>${VISITS.map((v) => `<td>${v}</td>`).join("")}</tr></table></div>
      <div data-who hidden><p style="margin:6px 0 0;color:#1c1a17">Her second dot that night is pencilled 01:00. Who else is at a rose at one o'clock?</p>
      <div class="${P}row">${WHO.map((w) => `<button type="button" class="${P}b" data-w="${w.id}">${w.name}<small>${w.why}</small></button>`).join("")}</div></div></div>
    <div class="${P}sec" data-s="3" aria-disabled="true"><h3>3 · THE TENTH LINE</h3>
      <div class="${P}pp"><div>${art.has("doc-1971-page") ? `<img alt="A statement form from 1971: six rooms, one row struck through in another hand, and a seventh line, 400, witness, signed H. Wren, night auditor" src="${art.url("doc-1971-page")}">` : ""}</div>
      <div><p style="margin:0;color:#1c1a17">Behind the booking ledger, folded small: a form from 1971, signed <i>H. Wren, night auditor</i>. One row struck through in another hand. Under the six, a seventh.</p>
      <p class="${P}ten">400 · <span data-word>${second ? String(shiftOf(shared).word || "").toUpperCase() : ""}</span></p>
      <div class="${P}row">${WORDS.map((w) => `<button type="button" class="${P}b" data-word-b="${w}">${w.toUpperCase()}</button>`).join("")}</div>
      <div class="${P}row"><button type="button" class="${P}b sign" data-stamp disabled>STAMP THE ROW</button></div><div data-stampimg></div></div></div></div>
    <div class="${P}sec" data-s="4" aria-disabled="true"><h3>4 · THE CARBONS</h3>
      <p style="margin:0;color:#1c1a17">Wren's copy goes down the chute at 05:00. Your carbons, all seven nights of them, go where you take them.</p>
      <div class="${P}row"><button type="button" class="${P}b" data-c="403">UNDER 403'S VALET DOOR<small>to the one who asked you to stay</small></button><button type="button" class="${P}b" data-c="six">UNDER ALL SIX DOORS<small>the pages of the slide run</small></button><button type="button" class="${P}b" data-c="wren">INTO WREN'S ENVELOPE<small>a complete file</small></button></div>
      <div class="${P}row"><button type="button" class="${P}b sign" data-sign disabled>SIGN THE ACCOUNT</button></div></div>
    <p class="${P}msg" data-msg aria-live="polite"></p></div>`;
  const $ = (s) => pg.querySelector(s), msg = $("[data-msg]"), story = $("[data-story]");
  story.textContent = second
    ? "Night seven, again. The Account is typed already, and under 406 the seventh line is printed this time: 400, and your own word from the first shift, in carbon. Somebody kept your copy."
    : "Night seven, before the shift. Wren: “The file closes tonight.” The Account is already in the typewriter, every line filled, and a tenth line you have never seen on a form: 400, and a blank.";
  const typedBox = $("[data-typed]");
  TYPED.forEach((t) => {
    const b = document.createElement("button"); b.type = "button"; b.className = P + "ty"; b.dataset.t = t.id;
    b.innerHTML = `<b></b><small></small>`; b.querySelector("b").textContent = "[typed] " + t.line; b.querySelector("small").textContent = t.carbon;
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      if (done || $('[data-s="1"]').dataset.closed) return;
      if (struck.has(t.id)) { struck.delete(t.id); b.classList.remove("x"); b.setAttribute("aria-pressed", "false"); msg.textContent = "You write STET over your own strike. The typing stands."; return; }
      struck.add(t.id); b.classList.add("x"); b.setAttribute("aria-pressed", "true"); rings++;
      msg.textContent = rings === 1 ? "Struck through in your ink. On the desk the phone rings once, and stops." : `Struck. The phone again, once. ${rings} rings tonight, and nobody has spoken.`;
    });
    typedBox.appendChild(b);
  });
  const open = (n) => { const s = $(`[data-s="${n}"]`); s.removeAttribute("aria-disabled"); if (s.scrollIntoView) s.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" }); const f = s.querySelector("button:not([disabled])"); if (f) f.focus({ preventScroll: true }); };
  $('[data-go="2"]').addEventListener("click", (e) => {
    $('[data-s="1"]').dataset.closed = "1"; e.target.disabled = true; typedBox.querySelectorAll("button").forEach((b) => (b.disabled = true));
    msg.textContent = `${struck.size} line${struck.size === 1 ? "" : "s"} struck. Whatever stands goes to Wren as you confirmed it.`;
    open(2);
  });
  pg.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => {
    if (night != null) return;
    const i = +b.dataset.n;
    if (DOTS[i] === VISITS[i]) { msg.textContent = `Night ${NIGHTS[i]}: ${DOTS[i]} dot, ${VISITS[i]} visit. They agree.`; return; }
    night = i; b.classList.add("on");
    msg.textContent = "Night four: two dots, and you went to her rose once. A second eye uses the roses.";
    $("[data-who]").hidden = false; $("[data-who] button").focus();
  }));
  pg.querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => {
    if (who) return;
    if (b.dataset.w !== "dora") { rings++; msg.textContent = { lew: "Lew is in the office with you at one, every night, with the tray. The phone rings once.", fenn: "Fenn comes at 2:14. Not at one. The phone rings once.", wren: "Wren has never set foot on the floor. The phone rings once." }[b.dataset.w]; return; }
    who = "dora"; b.classList.add("on");
    msg.textContent = "Dora. While you drink Lew's tea, her eye is at a rose in your door. The seventh column of her chalk has no room number because it is you. Everybody here is counted, and so are you.";
    open(3);
  }));
  pg.querySelectorAll("[data-word-b]").forEach((b) => b.addEventListener("click", () => {
    if (stamped) return;
    word = b.dataset.wordB;
    pg.querySelectorAll("[data-word-b]").forEach((x) => x.classList.toggle("on", x === b));
    $("[data-word]").textContent = word.toUpperCase();
    $("[data-stamp]").disabled = false;
  }));
  $("[data-stamp]").addEventListener("click", () => {
    if (stamped || !word) return;
    stamped = true; pg.querySelectorAll("[data-word-b]").forEach((x) => (x.disabled = true)); $("[data-stamp]").disabled = true;
    if (word === "witness" && art.has("stamp-witness")) $("[data-stampimg]").innerHTML = `<img class="${P}stamp" alt="WITNESS, row seven" src="${art.url("stamp-witness")}">`;
    msg.textContent = {
      witness: "WITNESS. Wren sells six lives and the signed one who vouches for them, someone a client can produce or blame. Every season's file has seven rows, and the seventh signs the other six.",
      product: "PRODUCT. True as far as it goes: you were booked and paid with them. But a product does not sign, and the seventh row is signed.",
      guest: "GUEST. The bell board and the ledger say so. But a guest is watched, and does not vouch; the aud. column vouches every row.",
      nobody: "NOBODY. That is the word Wren would type. The row stays on every form whether you fill it or not.",
    }[word];
    open(4);
  });
  pg.querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => {
    if (done) return;
    carbons = b.dataset.c; pg.querySelectorAll("[data-c]").forEach((x) => x.classList.toggle("on", x === b)); $("[data-sign]").disabled = false;
  }));
  $("[data-sign]").addEventListener("click", () => {
    if (done || !carbons) return;
    done = true; $("[data-sign]").disabled = true;
    const bent = TYPED.filter((t) => t.bent !== struck.has(t.id)).length;
    setRun(shared, { solved: true, word, bent, carbons, rings, reconciled: true });
    const where = carbons === "403" ? "Before the shift you crouch at 403's valet door and slide your carbons under it, all of them, a season of rows in blue." : carbons === "six" ? "Before the shift you go door to door down the passage and slide a carbon under each of the six." : "The carbons go in behind Wren's copy, in the cream envelope with the bird pressed into it.";
    const text = `Signed, and the tenth line stamped: 400 · ${word.toUpperCase()}. ${bent ? `${bent} of Wren's lines stand${bent === 1 ? "s" : ""} the way he wanted them.` : "Every line he bent toward Ruth is struck."} ${where} At 2:14 the knock will come at your own door. Your own rose is waiting in The eye at the hole.`;
    msg.textContent = text;
    later(() => api.end({ outcome: "win", text }), RM ? 400 : 1400);
  });
  // the opening card
  const intro = document.createElement("div"); intro.className = P + "intro";
  intro.innerHTML = `<div class="${P}form"><div style="font-size:12px;letter-spacing:.12em;border-bottom:1.5px solid #2a3a8c;padding-bottom:6px">FORM S-7 · NIGHT SEVEN · THE TENTH LINE</div>
    <h2>THE ACCOUNT</h2><p><b>All five marks of the seventh row are in.</b> Confirm the typed Account, reconcile Mara's dots against your strip, fill the tenth line, and decide where your carbons go.</p>
    <p class="o">“An accurate file is a kindness. It is the guesses that get people hurt.” H.W.</p>
    <button type="button" class="${P}b sign" data-start>BEGIN · ENTER</button></div>`;
  pg.appendChild(intro);
  const startB = intro.querySelector("[data-start]");
  startB.addEventListener("click", () => { intro.remove(); typedBox.querySelector("button").focus(); });
  startB.focus();
  return { unmount() { timers.forEach(clearTimeout); root.innerHTML = ""; } };
}

export const tenthExtra = { title: "the tenth line", ready: (api) => { const r = runOf(api.shared); return !r.solved && ["dots", "chalk", "bell", "aud", "ledger"].every((k) => r.marks && r.marks[k]); }, play: tenthLine };

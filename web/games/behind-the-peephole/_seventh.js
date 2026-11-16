// Behind the Peephole / the seventh row (phase 3, accepted 2026-11-15, built 2026-11-16). Not a mode:
// the long puzzle every mode shares, through api.shared.
//
//   "seventh"  this shift's run: { marks: {dots, chalk, bell, aud, ledger}, solved, word, bent, carbons, lens }
//   "sitting"  The Sitting in the eye: { held, answered }
//   "shift"    finished shifts: { done, last, word, reply, ends: [] }  (the second shift reads this)
//
// Five marks are gathered in five modes (DEEP_DIVE.md section 3, "The long puzzle: the seventh row"):
// Mara's dots (the eye, The Sitting), Dora's chalk (Lockwork, lost property), the bare seventh pull
// (the corridor race, night two), the "aud." column of Fenn's log (the Mosaic, a green rhyme) and the
// ledger's seventh line (Night Patience, Fenn's answer under column six). When all five are in, the
// Statement offers night seven: the typed Account, the reconciliation of Mara's dots against your own
// strip, and the tenth line, "400: ___". Stamping it solves the puzzle. Then the eye offers your own
// rose at 2:14: hold still, step back, or open the door. That choice ends the shift; the next shift is
// the second shift, and four modes read differently.
// notebook() is the small view every mode carries: the five marks gathered so far, in the game's art.

export const MARKS = [
  { id: "dots", name: "Mara's dots", where: "The eye at the hole · The Sitting: what is in the corner of her pictures." },
  { id: "chalk", name: "Dora's chalk ticks", where: "Lockwork · lost property: open the cabinet and read inside its door." },
  { id: "bell", name: "The bare seventh pull", where: "Corridor race · night two: stay on the floor until the last bell." },
  { id: "aud", name: "Fenn's “aud.” column", where: "The Mosaic · the green spool: tie a true rhyme with last season." },
  { id: "ledger", name: "The ledger's seventh line", where: "Night Patience · night four: leave a question on the spike, and reach column six." },
];

export const ENDINGS = {
  the_sitter: { title: "The Sitter", card: "ending-the-sitter", lettering: "ending-title-the-sitter",
    text: "At dawn Mara Linde walks into the lobby with the case, her rivers and your carbons, and hands the police a second file before Wren's can be read. Five of them leave by the revolving door; she stays, by her own choice, and holds out her wrists. The seventh row of her file is filled in, in her pencil: the witness is you, and you will be called. On her last watercolour your own door stands at the end of the passage, and its rose is lit." },
  under_the_door: { title: "Under the Door", card: "ending-under-the-door", lettering: "ending-title-under-the-door",
    text: "Your carbons go under six valet doors instead of Wren's copy, and only the rows you got right are believed. Before dawn the six leave together; the mercenary goes the other way alone, his daughter's last chapter unread. The file is broken, but the seventh row is still yours, and you are the only one on the floor when the knock comes. Behind you the rose in your office door is lit from outside." },
  wrong_picture: { title: "The Wrong Picture", card: "ending-wrong-picture", lettering: "ending-title-wrong-picture",
    text: "The file is believed, and it is wrong where Wren typed it and you let it stand. At dawn Ruth Saelens is led out between two officers for a logger her sister planted, and looks up at the mezzanine. The desk phone rings and the night clerk holds it toward you: “Thank you. That will be all.” Then, after a breath: “I did that once.”" },
  open_door: { title: "The Open Door", card: "ending-open-door", lettering: "ending-title-open-door",
    text: "You open the door at 2:14 and walk with Fenn down the service stair to the river wall. Walking out does not break the file: from the alley the office lamp is still on, and Dora is finishing your log in your hand. From the wall you count the fourth-floor windows, and one is dark, the room you watched most. Fenn: “You'll want to stop looking up.”" },
  next_watcher: { title: "The Next Watcher", card: "ending-next-watcher", lettering: "ending-title-next-watcher",
    text: "Wren's copy goes down the chute complete, and its seventh row is filled: it is you, signed, whatever became of your carbons. At dawn the six leave in the order the file predicted, sold accurately. Next season's contract comes with Fenn's old key, one rung up the ladder, and lost property holds six new things you can name. Behind a rose in the passage, someone watches a figure at your desk lift its head." },
};

const dflt = { get: (k, d) => d, set() {} };
export const runOf = (shared) => (shared || dflt).get("seventh", {}) || {};
export function setRun(shared, patch) { const r = Object.assign({}, runOf(shared), patch); shared.set("seventh", r); return r; }
export const shiftOf = (shared) => (shared || dflt).get("shift", {}) || {};
export const isSecond = (shared) => (shiftOf(shared).done | 0) >= 1;
export const marksIn = (r) => MARKS.filter((m) => r.marks && r.marks[m.id]).length;
export function mark(shared, id) {
  if (!shared) return false;
  const r = runOf(shared), m = Object.assign({}, r.marks || {});
  if (m[id]) return false;
  m[id] = true; setRun(shared, { marks: m }); return true;
}

// which ending this run has earned (null until the tenth line is stamped); data/endings.json in small
export function endingOf(r, s) {
  if (!r || !r.solved) return null;
  s = s || {};
  if (r.lens === "opened") return "open_door";
  if ((r.bent | 0) > 0) return "wrong_picture";
  if (r.lens === "held" && r.carbons === "403" && r.word === "witness" && s.held && s.answered) return "the_sitter";
  if (r.carbons === "six") return "under_the_door";
  return "next_watcher";
}

// the last choice of a shift: record it, and the next run is the second shift
export function finishShift(shared, lens) {
  const r = setRun(shared, { lens });
  const id = endingOf(r, shared.get("sitting", {}) || {});
  const sh = shiftOf(shared);
  shared.set("shift", { done: (sh.done | 0) + 1, last: id, word: r.word || "", reply: shared.get("reply", "") || sh.reply || "", ends: [...(sh.ends || []), id] });
  shared.set("seventh", {}); shared.set("sitting", {});
  return id;
}

// ---- the notebook: a small, always-reachable view of the marks ---------------------------------
export function notebook(root, api, pos) {
  const shared = api.shared || dflt, art = api.art || { has: () => false, url: () => "" };
  const P = "behind-the-peephole-vii-";
  const st = document.createElement("style");
  st.textContent = `
  .${P}b{position:absolute;${pos || "right:8px;top:8px"};z-index:35;width:44px;height:44px;border-radius:50%;padding:0;border:2px solid #5d4518;cursor:pointer;background:#13271c center/100% no-repeat;color:#f1c77c;font:700 13px Georgia,serif;box-shadow:0 2px 8px #000a}
  .${P}b:focus-visible{outline:3px solid #f1c77c;outline-offset:2px}
  .${P}b i{position:absolute;right:-4px;bottom:-4px;min-width:18px;height:18px;border-radius:9px;background:#a3302a;color:#fff;font:600 11px/18px 'IBM Plex Mono',monospace;font-style:normal}
  .${P}m{position:absolute;inset:0;z-index:70;display:grid;place-items:start center;overflow:auto;padding:12px;background:rgba(8,7,5,.86)}
  .${P}p{width:min(620px,100%);box-sizing:border-box;background:#efe6cf;color:#2a3a8c;font:14px/1.45 "Courier New",monospace;padding:14px 16px 16px;box-shadow:0 10px 40px #000;
    background-image:repeating-linear-gradient(0deg,transparent 0 23px,rgba(42,58,140,.07) 23px 24px)}
  .${P}p h2{margin:0 0 4px;font:700 18px "Courier New",monospace;letter-spacing:.14em}
  .${P}p .s{margin:0 0 10px;color:#1c1a17;font:italic 15px/1.4 Georgia,serif}
  .${P}g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
  .${P}g figure{margin:0}
  .${P}g img{display:block;width:100%;height:auto}
  .${P}g .no{aspect-ratio:320/220;border:2px dashed rgba(42,58,140,.45);display:grid;place-items:center;padding:8px;box-sizing:border-box;text-align:center;font-size:12px;color:#1c1a17}
  .${P}g figcaption{font-size:12px;margin-top:2px}
  .${P}f{margin:12px 0 0;color:#1c1a17}
  .${P}f img{display:block;width:100%;height:auto;background:#000;margin:6px 0}
  .${P}x{margin-top:12px;font:700 13px "Courier New",monospace;letter-spacing:.08em;color:#2a3a8c;background:transparent;border:1.6px solid #2a3a8c;min-height:44px;padding:6px 14px;cursor:pointer}
  `;
  const b = document.createElement("button");
  b.type = "button"; b.className = P + "b"; b.setAttribute("aria-label", "The seventh row: the marks gathered so far");
  b.title = "The seventh row";
  if (art.has("ui-seventh-row")) b.style.backgroundImage = `url(${art.url("ui-seventh-row")})`; else b.textContent = "VII";
  const badge = document.createElement("i"); b.appendChild(badge);
  root.append(st, b);
  let m = null;
  const paintBadge = () => { const n = marksIn(runOf(shared)); badge.textContent = n; badge.hidden = !n; };
  paintBadge();
  function close() { if (m) { m.remove(); m = null; b.focus(); } }
  function key(e) { if (m && e.key === "Escape") { e.stopImmediatePropagation(); e.preventDefault(); close(); } }
  window.addEventListener("keydown", key, true);
  b.addEventListener("click", () => {
    if (m) return close();
    const r = runOf(shared), sh = shiftOf(shared), n = marksIn(r);
    m = document.createElement("div"); m.className = P + "m";
    m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "The seventh row");
    const cards = MARKS.map((k, i) => r.marks && r.marks[k.id]
      ? `<figure>${art.has("watcher-" + k.id) ? `<img alt="" src="${art.url("watcher-" + k.id)}">` : `<div class="no">${k.name}</div>`}<figcaption>${i + 1} · ${k.name}</figcaption></figure>`
      : `<figure><div class="no">${i + 1} · not yet<br><br>${k.where}</div></figure>`).join("");
    let foot = "";
    if (r.solved) foot = `Stamped: 400 · ${String(r.word || "").toUpperCase()}. ${r.carbons === "403" ? "Your carbons went under 403's door." : r.carbons === "six" ? "Your carbons went under six doors." : "Your carbons went into Wren's envelope."} Your own rose is waiting: The eye at the hole, night seven.`;
    else if (n === 5) foot = "All five. The Statement has a tenth line now: night seven, the Account.";
    else foot = `${n} of 5. Every season's file has seven rows. Find what makes the seventh.`;
    let past = "";
    if (sh.done) { const e = ENDINGS[sh.last] || {}; past = `<div class="${P}f">Second shift. The first ended: <b>${e.title || ""}</b>.${art.has(e.lettering) ? `<img alt="${e.title || ""}" src="${art.url(e.lettering)}">` : ""}</div>`; }
    m.innerHTML = `<div class="${P}p"><h2>THE SEVENTH ROW</h2><p class="s">Marks of the kind the forms have no column for: watcher.</p><div class="${P}g">${cards}</div><p class="${P}f">${foot}</p>${past}<button type="button" class="${P}x">CLOSE · ESC</button></div>`;
    m.querySelector("." + P + "x").addEventListener("click", close);
    m.addEventListener("pointerdown", (e) => { if (e.target === m) close(); });
    root.appendChild(m);
    m.querySelector("." + P + "x").focus();
  });
  return { refresh: paintBadge, remove() { window.removeEventListener("keydown", key, true); if (m) m.remove(); b.remove(); st.remove(); } };
}

// ---- the result card behind a mode's last screen: the ending's generated card and its lettering ----
export function endingBackdrop(host, api, id) {
  const e = ENDINGS[id]; if (!e) return;
  const src = api.keyart ? api.keyart(e.card) : "";
  const d = document.createElement("div");
  d.style.cssText = `position:absolute;inset:0;z-index:1;background:#050403 ${src ? `url("${src}") center/cover no-repeat` : ""};`;
  if (api.art && api.art.has(e.lettering)) {
    const im = document.createElement("img"); im.alt = e.title; im.src = api.art.url(e.lettering);
    im.style.cssText = "position:absolute;left:50%;top:6%;width:min(92%,900px);transform:translateX(-50%)";
    d.appendChild(im);
  } else {
    const h = document.createElement("h2"); h.textContent = e.title;
    h.style.cssText = "position:absolute;left:0;right:0;top:6%;text-align:center;color:#f1c77c;font:700 34px Georgia,serif;text-shadow:0 2px 10px #000";
    d.appendChild(h);
  }
  host.appendChild(d);
}

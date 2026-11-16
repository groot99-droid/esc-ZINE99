// The Lord of the Sea: the ladder every mode climbs (phase 2, accepted 2026-11-15, built 2026-11-16).
// A mode is three stages: teach, test, twist. This wraps a mode's own mount(): it shows the three rungs, starts
// the one chosen with `api.stage` set, and catches the stage's api.end(). A stage won offers the next one or
// "stop here" (the result as it stands); a stage lost ends the mode as before. The furthest rung reached is kept
// in api.store, so a returning player can start there. Layer links are notes laid over the stage: note().

const INK = "#1F2E4A", PAPER = "#F4F1E8", RED = "#8C2B2B", SEAINK = "#3C7A6A";
export const ORDER = ["teach", "test", "twist"];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// The shared flags of the game (api.shared), read without ever throwing.
export const flag = (api, k, d = false) => { try { return api.shared ? api.shared.get(k, d) : d; } catch { return d; } };
export const setFlag = (api, k, v) => { try { api.shared && api.shared.set(k, v); } catch { /* storage may be unavailable */ } };

// ---- the long puzzle: the tab (phase 3, accepted 2026-11-15, built 2026-11-16) ------------------------------------
// Eight chits, each found in a different mode. A mode that finds one calls gainChit(); every ladder card shows the
// ledger page with the chits gathered so far; the Charter's tab pins them once all eight are in.
export const CHITS = [
  { n: 1, art: "chit-1-bottle-neck", pledge: "one pair land legs, hardly used", look: "The Charter, Schedule C: follow the thread off the page." },
  { n: 2, art: "chit-2-dice-stake", pledge: "the luck of the dice", look: "Liar's Tide, Wenna's Tell: Mother Halse stakes it." },
  { n: 3, art: "chit-3-strongbox", pledge: "an anchor's hold", look: "The Deep, down to the tender: in the strongbox." },
  { n: 4, art: "chit-4-lease-schedule", pledge: "a fog", look: "Dead Reckoning, the Strait: in Corran's lamp room." },
  { n: 5, art: "chit-5-trench", pledge: "a slack water", look: "The Deep, the trench: in the floor's dark." },
  { n: 6, art: "chit-6-under-the-board", pledge: "a fair wind, to order", look: "The Tea Board, the Comptroller: under his board." },
  { n: 7, art: "chit-7-mirror-gallery", pledge: "a shipmate's word", look: "The Engraved Sea, The Glass: at the halls, in the gallery of mirrors." },
  { n: 8, art: "chit-8-lords-hand", pledge: "whatever is left", look: "The Tea Board, the Wreck Book: in the Lord of Tea's own hand." },
];
export function chitsHeld(api) {
  const got = new Set((Array.isArray(flag(api, "chits", [])) ? flag(api, "chits", []) : []).map(Number).filter((n) => n >= 1 && n <= 8));
  if (flag(api, "chit2", false)) got.add(2);   // phase 2 wrote No. 2 on its own
  return got;
}
// Returns true when the chit is new to this run.
export function gainChit(api, n) {
  const got = chitsHeld(api);
  const listed = Array.isArray(flag(api, "chits", [])) ? flag(api, "chits", []).map(Number) : [];
  const fresh = !got.has(n);
  got.add(n);
  if (!listed.includes(n)) setFlag(api, "chits", [...got].sort((a, b) => a - b));
  return fresh;
}
// A finished run (the tideline was reached through the tab) changes the next: the second playthrough.
export const runs = (api) => Math.max(0, +flag(api, "runs", 0) || 0);
export const secondRun = (api) => runs(api) >= 1;
// What the future scholars write at the foot of a second run's pages: they disagree about the ending the player got
// last time. [the deed, the harbour book, the slate, the cup, the tab]
const NOTES = {
  "paid-in-kind": ["Most editors take this deed as the first entry in an account that was later paid in kind. A minority hold that nothing was paid: the toll was only moved to a column headed “outstanding”.",
    "The ‘Paid in Kind’ reading of this book rests on one marginal tick. The tick is in green, and green is the Company's ink.",
    "Halse's slate survives with every line struck through. Whether that means paid, or written off, the slate does not say.",
    "Accounts of this cup agree on the blend and on nothing else. One editor has him drink it; one has him pour it into the sea, a little, counter-clockwise.",
    "The eight chits of the first edition are blank. The editors dispute whether they were paid, or only washed."],
  "the-charter": ["Readers of the Charter tradition call this deed the first draft of the terms. Its critics call the terms a deed with better manners.",
    "This harbour book is cited by the ‘Charter’ editors as precedent. The precedent was struck out in 1743, and nobody now living signed it.",
    "On the Charter reading Halse's slate became Schedule I of the terms. She is not recorded as having agreed.",
    "In the Charter tradition he drank the cup and signed. In the older text he signs first, and the cup goes cold.",
    "The terms printed in the first edition run to eight schedules, one per chit. The toll is the last page, and is the longest."],
  "no-lord": ["Editors who prefer the ‘No Lord’ text note that once the debtor ceased to exist, this deed had no one left to bind. Their opponents ask who, then, answers for the drowned.",
    "In the ‘No Lord’ text the lamp of clause 7 goes out within the year. Nobody kept it, and nobody was owed it.",
    "After the ‘No Lord’ ending the slate was wiped, and the account could not be found. Halse is said to have kept the wiping cloth.",
    "The ‘No Lord’ editors cut this scene. A rowing man has no use for a timetable.",
    "In the ‘No Lord’ text the chits are never pinned. A dead debt does not need reading."],
  "the-wild-sea": ["The ‘Wild Sea’ editors gloss this clause as void, by repudiation. The courts of the halls did not agree, and called the surety.",
    "Every clause of this book is annotated ‘repudiated’ in a hand the editors attribute to him. It is a clockwise hand.",
    "The ‘Wild Sea’ reading has Halse's slate thrown overboard. It was found at the Salt Steps, and is the only line of the account still legible.",
    "In the ‘Wild Sea’ text he upends the cup on the board and walks out. The board, editors note, was cracked already.",
    "The ‘Wild Sea’ edition prints no tab at all. The princess's copy of the writ is reproduced instead."],
  "the-lords-peace": ["The standard edition, in which the Company kept the sea, reads this deed without comment. The comment was removed.",
    "Every clause here is ticked in green in the standard edition. The editors thank the Company for the loan of the book.",
    "In the standard edition the slate is paid off by a salaried officer of the Company. Halse retired on it.",
    "The standard edition takes the salary as read. The cup, the editors note, was Company issue.",
    "The standard edition lists the eight chits under ‘assets’. None is described as called."],
};
// The five endings the tideline can give once the tab is read whole: the name, and the payoff in the game's voice,
// with what it cost. Used by the tab's result and by loading.js's finale().
export const ENDINGS = {
  "paid-in-kind": { name: "Paid in Kind", text: "At the tideline he unsigned them: eight counter-clockwise turns, one for each chit, and the ink of forty years went out of the paper into the foam. The Company keeps its lights and its lanes, lawfully bought, and no longer keeps him; the rose ring is a ripple wide now, and he will never dive for anyone again. The Wreck Book carries the toll as “outstanding, for ever”, and the wild water stays as wild as he left it. He stirred, and the sea gave him a ripple, and for once it was all he had asked for." },
  "the-charter": { name: "The Charter", text: "She laid the terms on the board between them, and the Lord of Tea signed at a tie. The tab became the schedule of the terms: eight pledges, each kept from now on by his own hand, a calm lane here and wild water there. The toll is the last page, read aloud as the reason for the lanes. We had owed the sea a great deal; now it was written down where anyone could read it." },
  "no-lord": { name: "No Lord", text: "He beat the Lord of Tea, read the tab whole, and then let go of all of it. The debtor ceased to exist, so the debt died with him, and the Company's charters and its lights went after it. So did anyone who could answer for the drowned: the epilogue names, region by region, where the wrecks will come back with no one to answer to. He rowed in at dawn with blistered hands, and did not look round." },
  "the-wild-sea": { name: "The Wild Sea", text: "He beat the Lord of Tea, read the tab whole, and repudiated it: forty years of his own hand, and he kept the sea. The surety was called, and she went ashore to face it for her father's house. The hymns came back, and so did the wrecks, and the toll is sung to the hymn's tune, by name. Every spiral ran clockwise; so did the storm." },
  "the-lords-peace": { name: "The Lord's Peace", text: "He read the tab whole, and the board was not his. The Lord of Tea called the eighth chit, whatever was left, and paid it out as a salary: Harbourmaster-General, tides to a timetable. The last bottle is Company issue, the Wreck Book is closed, and so is every hymn. The sea is safe, and it does not answer him." },
};

export function scholarsNote(api, which) {
  const last = flag(api, "last.ending", "");
  const i = ["deed", "book", "slate", "cup", "tab"].indexOf(which);
  return secondRun(api) && NOTES[last] && i >= 0 ? NOTES[last][i] : "";
}
// The footnote as printed: the code-drawn strip behind a dagger and the note. `dark` for a page on a dark ground.
export function footnote(api, text, dark = false) {
  if (!text) return "";
  const a = api.art, bgImg = a && a.has && a.has("scholars-footnote") ? `background-image:linear-gradient(rgba(246,243,234,.88),rgba(246,243,234,.88)),url('${a.url("scholars-footnote")}');background-size:cover;background-position:left center;` : "background:#F6F3EA;";
  return `<aside data-lots-footnote="1" role="note" aria-label="A footnote by later scholars" style="${bgImg}margin:10px 0 0;padding:8px 12px 8px 30px;position:relative;border-top:1px solid ${INK};color:${INK};font:13.5px/1.4 Georgia,'Times New Roman',serif;${dark ? "box-shadow:0 4px 10px rgba(0,0,0,.4);" : ""}text-align:left"><b style="position:absolute;left:10px;top:6px;color:${RED};font-size:17px">†</b>${esc(text)} <i style="color:#666">— later editors</i></aside>`;
}

// The ledger page: the chits gathered so far, as a page of the chandler's book. onLay (optional) is offered when all
// eight are in. Returns a remover.
export function ledgerView(root, api, onLay) {
  const got = chitsHeld(api), art = api.art;
  const has = (id) => art && art.has && art.has(id);
  const d = document.createElement("div");
  d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "The tab: the chits gathered so far");
  d.dataset.lotsLedger = "1";
  d.style.cssText = "position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:10px;overflow:auto;background:rgba(18,26,44,.92);font-family:'IM Fell English',Georgia,serif;";
  const page = has("tab-ledger") ? `background-image:url('${art.url("tab-ledger")}');background-size:cover;` : `background:${PAPER};`;
  d.innerHTML = `<div style="${page}width:min(720px,100%);box-sizing:border-box;border:1px solid ${INK};box-shadow:0 12px 30px rgba(0,0,0,.5);padding:clamp(14px,4vw,30px) clamp(12px,4vw,34px) 16px;color:${INK}">
    <div style="font-family:'IM Fell English SC',Georgia,serif;letter-spacing:.18em;font-size:12.5px;color:${RED};text-align:center">THE TAB · ${got.size} OF 8 IN HAND</div>
    <h2 style="font-weight:400;font-size:clamp(22px,5vw,30px);margin:2px 0 10px;text-align:center;font-style:italic">Alexi, his account</h2>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${CHITS.map((c) => got.has(c.n)
      ? `<figure style="margin:0;display:grid;gap:3px;align-content:start">${has(c.art) ? `<img src="${art.url(c.art)}" alt="Chit No. ${c.n}" style="width:100%;height:auto;display:block">` : `<div style="aspect-ratio:46/30;background:#EADFC2;display:grid;place-items:center">No. ${c.n}</div>`}<figcaption style="font-size:12.5px;line-height:1.25;text-align:center"><b style="color:${RED};font-weight:400">No. ${c.n}</b> <i>${esc(c.pledge)}</i></figcaption></figure>`
      : `<figure style="margin:0;display:grid;gap:3px;align-content:start"><div style="aspect-ratio:46/30;border:1.5px dashed #55524c;display:grid;place-items:center;color:#55524c;font-size:13px">No. ${c.n}</div><figcaption style="font-size:12px;line-height:1.25;text-align:center;color:#4b463c">${esc(c.look)}</figcaption></figure>`).join("")}</div>
    <p style="margin:12px 0 8px;font-style:italic;text-align:center;font-size:15px;color:${got.size === 8 ? SEAINK : "#4b463c"}">${got.size === 8 ? "All eight in hand. Lay them on the chart: the Charter's last page, at the tally." : "Eight chits, eight pledges, each found a different way. The tab can only be read whole."}</p>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${got.size === 8 && onLay ? `<button type="button" data-l="lay" style="font:inherit;font-size:17px;padding:7px 18px;background:${INK};color:${PAPER};border:1px solid ${INK};cursor:pointer">Lay them out</button>` : ""}<button type="button" data-l="shut" style="font:inherit;font-size:17px;padding:7px 18px;background:#fbfaf3;color:${INK};border:1px solid ${INK};cursor:pointer">Close the ledger</button></div></div>`;
  root.appendChild(d);
  const close = () => { removeEventListener("keydown", onKey); d.remove(); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  addEventListener("keydown", onKey);
  d.querySelector("[data-l=shut]").addEventListener("click", close);
  const lay = d.querySelector("[data-l=lay]");
  if (lay) lay.addEventListener("click", () => { close(); onLay(); });
  (lay || d.querySelector("[data-l=shut]")).focus();
  return close;
}

// A layer link firing: one quiet card over the stage, "because you ... in ...". Returns a remover.
// `top` puts it at the head of a page whose controls sit at the foot.
export function note(root, text, ms = 9000, top = false) {
  const d = document.createElement("div");
  d.setAttribute("role", "status");
  d.dataset.lotsLink = "1";
  d.style.cssText = `position:absolute;left:50%;${top ? "top:10px" : "bottom:calc(74px + env(safe-area-inset-bottom))"};transform:translateX(-50%);z-index:9;width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:8px 14px 8px 40px;background:${PAPER};color:${INK};border:1px solid ${SEAINK};outline:1px solid ${SEAINK};outline-offset:2px;font:italic 15px/1.35 'IM Fell English',Georgia,serif;box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer;`;
  d.innerHTML = `<svg viewBox="0 0 60 60" width="24" height="24" aria-hidden="true" style="position:absolute;left:9px;top:9px"><path d="M30 30 C32 26 37 28 36 33 C35 39 26 40 23 34 C19 26 27 17 36 19 C47 22 49 37 41 44 C31 52 14 46 13 32 C12 20 22 10 34 10" fill="none" stroke="${SEAINK}" stroke-width="3" stroke-linecap="round"/></svg>${esc(text)}`;
  root.appendChild(d);
  let t = setTimeout(() => d.remove(), ms);
  d.addEventListener("click", () => { clearTimeout(t); d.remove(); });
  return () => { clearTimeout(t); d.remove(); };
}

// cfg: { title, kicker, stages: { teach: {name, where, line}, test: {...}, twist: {...} }, extra?: {label, hint} }
// start(stageRoot, stageApi) mounts one stage and returns { unmount() }; stageApi.stage is the rung's key.
// extra(root, api) mounts something beside the ladder (the Charter's tab).
export function ladder(root, api, cfg, start, extra) {
  const P = "lots-ladder-";
  const get = (k, d) => { try { return api.store.get(k, d); } catch { return d; } };
  const set = (k, v) => { try { api.store.set(k, v); } catch { /* no storage */ } };
  let reached = Math.max(0, Math.min(2, +get("stage", 0) || 0));
  let inner = null, layer = null, dead = false;
  root.innerHTML = `<style>
    .${P}host { position:absolute; inset:0; }
    .${P}veil { position:absolute; inset:0; z-index:30; display:grid; place-items:center; padding:12px; overflow:auto; background:rgba(18,26,44,.9); font-family:'IM Fell English',Georgia,serif; color:${INK}; }
    .${P}card { width:min(560px,100%); box-sizing:border-box; background:${PAPER}; border:1.5px solid ${INK}; outline:4px double ${INK}; outline-offset:4px; padding:16px 18px 14px; margin:8px; }
    .${P}card .k { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.2em; font-size:12.5px; color:${RED}; text-align:center; }
    .${P}card h2 { font-weight:400; font-size:clamp(24px,5vw,30px); margin:2px 0 4px; text-align:center; }
    .${P}card p { margin:0 0 10px; font-size:16px; line-height:1.4; }
    .${P}card p.c { text-align:center; font-style:italic; }
    .${P}rungs { display:grid; gap:8px; margin:0 0 10px; }
    .${P}rungs button { display:grid; grid-template-columns:auto minmax(0,1fr); gap:2px 12px; text-align:left; font:inherit; color:${INK}; background:#fbfaf3; border:1px solid ${INK}; padding:8px 12px; cursor:pointer; }
    .${P}rungs button b { grid-row:1 / 3; align-self:center; font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.14em; font-size:13px; color:${RED}; min-width:3.6em; }
    .${P}rungs button span { font-size:17px; } .${P}rungs button i { font-size:14.5px; color:#48526a; }
    .${P}rungs button.here { background:${INK}; color:${PAPER}; } .${P}rungs button.here b { color:#f0c36a; } .${P}rungs button.here i { color:#d5dbe8; }
    .${P}rungs button:disabled { opacity:.5; cursor:default; }
    .${P}rungs button:not(:disabled):hover, .${P}rungs button:not(:disabled):focus-visible { outline:2px solid ${RED}; outline-offset:1px; }
    .${P}row { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
    .${P}row button, .${P}x { font:inherit; font-size:17px; padding:7px 18px; cursor:pointer; background:${INK}; color:${PAPER}; border:1px solid ${INK}; }
    .${P}row button.alt, .${P}x { background:#fbfaf3; color:${INK}; }
    .${P}row button:hover, .${P}row button:focus-visible, .${P}x:hover, .${P}x:focus-visible { background:${RED}; color:${PAPER}; }
    .${P}xr { margin-top:10px; padding-top:8px; border-top:1px solid rgba(31,46,74,.35); display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center; justify-content:space-between; font-size:14.5px; font-style:italic; }
    .${P}x { font-size:15px; padding:5px 12px; font-style:normal; }
    @media (max-width:480px) { .${P}card { padding:12px 12px 10px; } .${P}rungs button span { font-size:16px; } }
  </style><div class="${P}host"></div>`;
  const host = root.querySelector("." + P + "host");
  const veil = (html) => {
    if (layer) layer.remove();
    layer = document.createElement("div");
    layer.className = P + "veil"; layer.setAttribute("role", "dialog");
    layer.innerHTML = `<div class="${P}card">${html}</div>`;
    root.appendChild(layer);
    return layer;
  };
  function stopInner() { if (inner) { try { inner.unmount && inner.unmount(); } catch { /* already stopped */ } inner = null; } }
  function run(i) {
    if (dead) return;
    stopInner(); if (layer) { layer.remove(); layer = null; }
    host.innerHTML = "";
    const key = ORDER[i];
    const sapi = Object.create(api);
    sapi.stage = key;
    sapi.end = (result = {}) => ended(i, result);
    inner = start(host, sapi) || null;
  }
  function ended(i, result) {
    if (dead) return;
    const won = result.outcome === "win" || result.outcome === "done";
    if (!won || i === 2) {
      if (won) set("stage", 2);
      api.end(i === 2 && won ? { ...result, text: (result.text || "") + " All three rungs of " + cfg.title + " are climbed." } : result);
      return;
    }
    reached = Math.max(reached, i + 1); set("stage", reached);
    const next = cfg.stages[ORDER[i + 1]];
    const v = veil(`<div class="k">${esc(cfg.stages[ORDER[i]].name.toUpperCase())} · ${i === 0 ? "THE FIRST RUNG" : "THE SECOND RUNG"}</div>
      <p style="margin-top:8px">${esc(result.text || "Done.")}</p>
      <p class="c">Next: <b>${esc(next.name)}</b>. ${esc(next.line)}</p>
      <div class="${P}row"><button type="button" data-n="go">Go on</button><button type="button" class="alt" data-n="stop">Stop here</button><button type="button" class="alt" data-n="ledger">The tab (${chitsHeld(api).size} of 8)</button></div>`);
    v.setAttribute("aria-label", "Stage won");
    v.querySelector("[data-n=go]").addEventListener("click", () => run(i + 1));
    v.querySelector("[data-n=stop]").addEventListener("click", () => { v.remove(); layer = null; api.end(result); });
    v.querySelector("[data-n=ledger]").addEventListener("click", () => ledger());
    v.querySelector("[data-n=go]").focus();
  }
  let unledger = null;
  function ledger() {
    if (unledger) unledger();
    unledger = ledgerView(root, api, extra && cfg.extra ? () => { if (layer) { layer.remove(); layer = null; } host.innerHTML = ""; stopInner(); inner = extra(host, api) || null; } : null);
  }
  function picker() {
    const xc = typeof cfg.extra === "function" ? cfg.extra(api) : cfg.extra;
    const v = veil(`<div class="k">${esc(cfg.kicker)}</div><h2>${esc(cfg.title)}</h2>
      <p class="c">Three rungs. Stop after any of them and the result stands.</p>
      <div class="${P}rungs">${ORDER.map((k, i) => `<button type="button" data-i="${i}" class="${i === reached ? "here" : ""}" ${i > reached ? "disabled" : ""} aria-label="${esc(["Teach", "Test", "Twist"][i] + ": " + cfg.stages[k].name + (i > reached ? " (not reached yet)" : ""))}"><b>${["TEACH", "TEST", "TWIST"][i]}</b><span>${esc(cfg.stages[k].name)}</span><i>${esc(i > reached ? "Win the rung before it first." : cfg.stages[k].where)}</i></button>`).join("")}</div>
      ${extra && xc ? `<div class="${P}xr"><span>${esc(xc.hint)}</span><button type="button" class="${P}x" data-x="1">${esc(xc.label)}</button></div>` : ""}
      <div class="${P}xr"><span>The tab: ${chitsHeld(api).size} of 8 chits in hand.</span><button type="button" class="${P}x" data-ledger="1">Open the ledger</button></div>`);
    v.setAttribute("aria-label", cfg.title + ": choose a stage");
    v.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => run(+b.dataset.i)));
    const x = v.querySelector("[data-x]");
    if (x) x.addEventListener("click", () => {
      if (xc && xc.ready === false) { ledger(); return; }
      v.remove(); layer = null; host.innerHTML = ""; inner = extra(host, api) || null; });
    const lb = v.querySelector("[data-ledger]");
    if (lb) lb.addEventListener("click", () => ledger());
    (v.querySelector("button.here") || v.querySelector("button")).focus();
  }
  picker();
  return { unmount() { dead = true; stopInner(); if (layer) layer.remove(); if (unledger) unledger(); } };
}

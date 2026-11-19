// Missing Campsites / kit: what the six modes share. Not a mode (no key in docs/graphic_styles.json).
//
// The game's code-drawn art (api.art) wired the same way everywhere: a picture, a chapter card at the
// head of a how-to card, a result card behind the shell's result, an offscreen raster for canvas, and
// the notebook's List page (DESIGN.md, "Accepted development (2026-11-15)": nineteen items, one for
// each lost site, in the order the place packed them). Every helper returns null or does nothing when
// an id is missing, so a mode still runs without the bundle.

const K = "missing-campsites-kit-";

// The List, 1 to 19 (index 0 unused). The names are the art's own titles.
export const LIST = [null, "a washing line", "a camp chair", "a hammock", "a dog's bowl", "a blue enamel kettle",
  "a fishing rod", "the owl box", "a kite", "the shallow pool", "a guitar", "a paddle", "milk in the creek",
  "a windbreak", "a red wagon", "a radio", "the tall cedar", "Puddle", "a tyre swing", "a lantern on a pole"];
export const listId = (n) => "list-" + String(n).padStart(2, "0");
const TITLES = ["title-whole", "title-lost-3", "title-lost-6", "title-lost-9", "title-lost-12", "title-gone"];

const CSS = `
.${K}chap{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;margin:0 0 12px;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.${K}res{position:absolute;inset:0;z-index:15;background:rgba(14,22,34,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px 14px 170px;box-sizing:border-box;overflow:hidden}
.${K}res.in{animation:${K}in .5s}
@keyframes ${K}in{0%{opacity:0}}
.${K}res .ttl{width:min(520px,92%);height:auto;flex:none;box-shadow:0 6px 22px rgba(0,0,0,.6)}
.${K}res .cards{display:flex;gap:12px;justify-content:center;align-items:center;min-height:0;flex:0 1 auto;max-width:100%}
.${K}res .cards img{max-width:100%;max-height:min(46vh,420px);min-width:0;height:auto;width:auto;object-fit:contain;box-shadow:0 8px 28px rgba(0,0,0,.7)}
.${K}res .cards img+img{max-width:48%}
.${K}res .cards img:first-child:not(:only-child){max-width:48%}
.${K}res figcaption,.${K}res .cap{font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.15;color:#f1e9d6;text-align:center;max-width:560px}
.${K}list{position:absolute;inset:0;z-index:12;background:rgba(14,22,34,.82);display:grid;place-items:center;padding:12px;box-sizing:border-box;overflow:auto}
.${K}list[hidden]{display:none}
.${K}page{width:min(640px,100%);box-sizing:border-box;background:#f6f1e2;color:#3a3a3c;padding:0 14px 14px;box-shadow:0 14px 40px #000;
  background-image:repeating-linear-gradient(180deg,transparent 0 31px,#a9c3cf 31px 32px)}
.${K}page .tabs{display:block;width:calc(100% + 28px);margin:0 -14px 8px;height:auto}
.${K}page h3{margin:0 0 2px;font:italic 700 26px Georgia,serif;color:#3a3a3c}
.${K}page p{margin:0 0 8px;font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.1}
.${K}grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
.${K}cell{aspect-ratio:1;position:relative;border:1.5px dashed #9a948a;display:grid;place-items:center;font:italic 700 22px Georgia,serif;color:#9a948a;background:rgba(246,241,226,.7);overflow:hidden}
.${K}cell.has{border:1.5px solid #4a4a48}
.${K}cell img{position:absolute;inset:0;width:100%;height:100%}
.${K}cell span{position:relative;font:600 12px 'IBM Plex Mono',monospace;color:#3a3a3c;background:#f6f1e2;padding:2px 3px;text-align:center;font-style:normal}
.${K}cell.fresh{animation:${K}fresh 1s 2}
@keyframes ${K}fresh{50%{box-shadow:0 0 0 5px rgba(201,168,98,.9)}}
.${K}page button{margin-top:10px;font:600 15px 'IBM Plex Mono',monospace;background:#3a3a3c;color:#f6f1e2;border:0;padding:10px 20px;cursor:pointer;min-height:42px}
.${K}page button:focus-visible{outline:3px solid #c9a862;outline-offset:3px}
.${K}page.arm{background-image:none;background:#efe3d2;box-shadow:0 14px 40px #000,inset 6px 0 #1f3fa0}
.${K}page.arm h3,.${K}page.arm p{color:#1f3fa0}
.${K}page.arm .${K}cell.has{border-color:#1f3fa0}
`;
function style(el) { const s = document.createElement("style"); s.textContent = CSS; el.prepend(s); return el; }

// An <img> of one asset, or null.
export function pic(art, id, cls = "", alt = "") {
  if (!art || !art.has || !art.has(id)) return null;
  const im = document.createElement("img");
  im.src = art.url(id); im.alt = alt; im.draggable = false; im.decoding = "async";
  if (cls) im.className = cls;
  return im;
}

// A chapter card set at the head of a mode's how-to card.
export function chapterCard(art, id, into) {
  const im = pic(art, id, K + "chap", art && art.has(id) ? art.info(id).title : "");
  if (!im || !into) return null;
  const st = document.createElement("style"); st.textContent = `.${K}chap{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;margin:0 0 12px;box-shadow:0 0 0 1px rgba(0,0,0,.35)}`;
  into.prepend(im); into.prepend(st);
  return im;
}

// The card behind the result. `lost` 0..5 picks how much of the title lettering is still printed;
// `cards` is one or two art ids. Call it just before api.end.
export function resultCard(root, art, { cards = [], lost = 0, caption = "", reducedMotion = false } = {}) {
  if (!art || !art.has) return null;
  const box = style(document.createElement("div"));
  box.className = K + "res" + (reducedMotion ? "" : " in");
  const t = pic(art, TITLES[Math.max(0, Math.min(5, Math.round(lost)))], "ttl", "Missing Campsites");
  if (t) box.appendChild(t);
  const row = document.createElement("div"); row.className = "cards";
  for (const id of [].concat(cards)) { const im = pic(art, id, "", art.has(id) ? art.info(id).title : ""); if (im) row.appendChild(im); }
  if (row.children.length) box.appendChild(row);
  if (caption) { const c = document.createElement("div"); c.className = "cap"; c.textContent = caption; box.appendChild(c); }
  if (box.children.length <= 1) return null;
  root.appendChild(box);
  return box;
}

// One asset rasterised once into an offscreen canvas at the size it is drawn (many of these SVGs
// carry filters and are slow to rasterise every frame). Resolves to null when the id is missing.
export async function raster(art, id, w, h = w) {
  if (!art || !art.has || !art.has(id)) return null;
  const im = await art.img(id);
  if (!im) return null;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
  return c;
}

// The notebook's List page: nineteen slots, a tile where an item has been gathered.
export function listPage(root, art, { note = "", arm = false } = {}) {
  const el = style(document.createElement("div"));
  el.className = K + "list"; el.hidden = true;
  el.setAttribute("role", "dialog"); el.setAttribute("aria-label", arm ? "The List, on June's arm" : "The notebook's List page");
  const page = document.createElement("div"); page.className = K + "page" + (arm ? " arm" : "");
  const tabs = arm ? pic(art, "june-arm-list", "tabs", "June's forearm, the List in biro") : pic(art, "notebook-tabs", "tabs", "The notebook's tabs: Sites, People, Copied, Tally, the List");
  if (tabs) page.appendChild(tabs);
  if (arm) note = "The notebook went on the fire. What is left of the List is on June's arm, in biro.";
  const h = document.createElement("h3"); h.textContent = arm ? "June's arm" : "the List";
  const p = document.createElement("p"); p.textContent = note;
  const grid = document.createElement("div"); grid.className = K + "grid";
  const cells = [];
  for (let n = 1; n <= 19; n++) { const c = document.createElement("div"); c.className = K + "cell"; c.textContent = n; grid.appendChild(c); cells[n] = c; }
  const close = document.createElement("button"); close.type = "button"; close.textContent = "Close the notebook";
  page.append(h, p, grid, close); el.appendChild(page); root.appendChild(el);
  let back = null;
  const api = {
    el,
    set(found, fresh) {
      for (let n = 1; n <= 19; n++) {
        const c = cells[n], has = found.has(n);
        if (has === c.classList.contains("has")) continue;
        c.classList.toggle("has", has); c.textContent = has ? "" : n;
        if (!has) continue;
        const im = pic(art, listId(n), "", `${n}: ${LIST[n]}`);
        if (im) c.appendChild(im); else { const s = document.createElement("span"); s.textContent = `${n} ${LIST[n]}`; c.appendChild(s); }
        if (n === fresh) c.classList.add(K + "fresh");
      }
      p.textContent = `${note} ${found.size} of 19.`.trim();
    },
    get isOpen() { return !el.hidden; },
    open() { back = document.activeElement; el.hidden = false; close.focus(); },
    close() { el.hidden = true; if (back && back.focus) back.focus(); },
    toggle() { if (el.hidden) api.open(); else api.close(); },
  };
  close.addEventListener("click", api.close);
  el.addEventListener("click", (e) => { if (e.target === el) api.close(); });
  return api;
}

// ---- phase 2: the ladder (teach, test, twist), the links between layers, the shared List ----
//
// ladder() runs a mode as three short stages. mountStage(root, api, stage) builds one stage and
// returns { unmount }. Inside a stage, api.end() is the ladder's: a stage that is won (or ends with
// `advance: true`) offers the next stage or a stop with the result; anything else, and the twist,
// end the mode through the shell. Progress is kept in api.store ("stage"), so a returning player
// starts at the stage they reached and can still pick an earlier one from the how-to card.
export const STAGE_WORDS = ["Teach", "Test", "Twist"];
const LCSS = `
.${K}btw{position:absolute;inset:0;z-index:30;background:rgba(14,22,34,.88);display:grid;place-items:center;padding:16px;box-sizing:border-box;overflow:auto}
.${K}btw>div{max-width:480px;width:100%;box-sizing:border-box;background:#f6f1e2;color:#3a3a3c;padding:18px 20px;box-shadow:0 14px 40px #000;background-image:repeating-linear-gradient(180deg,transparent 0 31px,#a9c3cf 31px 32px)}
.${K}btw small{display:block;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.16em;color:#2f6b3a;margin-bottom:6px}
.${K}btw p{margin:0 0 12px;font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.2}
.${K}btw .nx{font:600 13px 'IBM Plex Mono',monospace;line-height:1.4;margin:0 0 12px}
.${K}btw button{font:600 15px 'IBM Plex Mono',monospace;background:#3a3a3c;color:#f6f1e2;border:0;padding:11px 16px;cursor:pointer;min-height:44px;margin:0 8px 8px 0}
.${K}btw button.alt{background:transparent;color:#3a3a3c;box-shadow:inset 0 0 0 2px #3a3a3c}
.${K}btw button:focus-visible{outline:3px solid #c9a862;outline-offset:3px}
.${K}tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;font-family:'IBM Plex Mono',ui-monospace,monospace}
.${K}tabs button{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.04em;background:transparent;color:inherit;border:1.5px solid currentColor;padding:7px 10px;min-height:38px;cursor:pointer;box-shadow:none;opacity:.85}
.${K}tabs button[aria-current=true]{background:#3a3a3c;color:#f6f1e2;border-color:#3a3a3c;opacity:1}
.${K}tabs button:disabled{opacity:.35;cursor:default;border-style:dashed}
.${K}tabs button:focus-visible{outline:3px solid #c9a862;outline-offset:2px}
.${K}link{font:600 13px/1.35 'IBM Plex Mono',ui-monospace,monospace;background:#f6f1e2;color:#3a3a3c;border-left:5px solid #c9a862;padding:7px 34px 7px 10px;position:relative;box-shadow:0 3px 12px rgba(0,0,0,.35);box-sizing:border-box}
.${K}link.float{position:absolute;left:10px;right:10px;bottom:78px;z-index:4;max-width:560px;margin:0 auto}
.${K}link button{position:absolute;right:2px;top:2px;width:30px;height:30px;border:0;background:transparent;color:#3a3a3c;font:700 16px monospace;cursor:pointer}
`;
function css(el) { const s = document.createElement("style"); s.textContent = LCSS; el.prepend(s); return el; }

export function ladder(root, api, mountStage, names) {
  let cur = null, dead = false;
  {                                                   // phase 3: a new run starts every mode at its first stage
    const runs = runsDone(api);
    if (runs > (+api.store.get("run", 0) || 0)) { api.store.set("stage", 1); api.store.set("run", runs); }
  }
  const reached = () => Math.max(1, Math.min(3, +api.store.get("stage", 1) || 1));
  function start(n) {
    if (dead) return;
    try { if (cur && cur.unmount) cur.unmount(); } catch { /* a stage that fails to stop must not block the next */ }
    cur = null; root.textContent = "";
    const sapi = Object.create(api);
    sapi.stage = n; sapi.stageName = names[n - 1]; sapi.stageNames = names; sapi.reached = reached(); sapi.goStage = start;
    sapi.end = (result = {}) => {
      if (dead) return;
      const pass = result.outcome === "win" || result.advance;
      if (n === 3 && result.outcome === "win") api.store.set("cleared", true);
      if (!pass || n === 3) { api.end(result); return; }
      api.store.set("stage", Math.max(reached(), n + 1));
      const box = css(document.createElement("div")); box.className = K + "btw";
      box.setAttribute("role", "dialog"); box.setAttribute("aria-label", `${STAGE_WORDS[n - 1]} cleared`);
      const card = document.createElement("div");
      const sm = document.createElement("small"); sm.textContent = `${n} OF 3 · ${names[n - 1].toUpperCase()} · CLEARED`;
      const p = document.createElement("p"); p.textContent = result.text || "Done.";
      const nx = document.createElement("div"); nx.className = "nx"; nx.textContent = `Next: ${names[n]}.${result.next ? " " + result.next : ""}`;
      const go = document.createElement("button"); go.type = "button"; go.className = "go"; go.textContent = `Go on: ${names[n]}`;
      const stop = document.createElement("button"); stop.type = "button"; stop.className = "alt stop"; stop.textContent = "Stop here";
      go.addEventListener("click", () => start(n + 1));
      stop.addEventListener("click", () => { box.remove(); api.end({ outcome: result.outcome, text: result.text }); });
      card.append(sm, p, nx, go, stop); box.appendChild(card); root.appendChild(box); go.focus();
    };
    cur = mountStage(root, sapi, n) || null;
  }
  start(reached());
  return { unmount() { dead = true; try { if (cur && cur.unmount) cur.unmount(); } catch { /* nothing to do */ } } };
}

// The three stage tabs on a how-to card: the stage being played, the ones reached, the ones not yet.
export function stageTabs(api, before) {
  if (!api.stage || !before) return null;
  const row = css(document.createElement("div")); row.className = K + "tabs";
  row.setAttribute("role", "group"); row.setAttribute("aria-label", "Stage");
  (api.stageNames || []).forEach((nm, i) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = `${i + 1} ${nm}`;
    if (i + 1 === api.stage) b.setAttribute("aria-current", "true");
    b.disabled = i + 1 > api.reached;
    b.addEventListener("click", () => { if (i + 1 !== api.stage) api.goStage(i + 1); });
    row.appendChild(b);
  });
  before.before(row);
  return row;
}

// A link between layers has fired: one line that says why this mode holds what it holds.
export function linkNote(parent, text, { float = false } = {}) {
  const el = css(document.createElement("div")); el.className = K + "link" + (float ? " float" : "");
  el.setAttribute("role", "status");
  const s = document.createElement("span"); s.textContent = text;
  const x = document.createElement("button"); x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", "Put the note away");
  x.addEventListener("click", () => el.remove());
  el.append(s, x); parent.appendChild(el);
  return el;
}

// The List's items found so far, shared by the modes (api.shared, when there is one).
export function sharedList(api) {
  const sh = api.shared;
  const read = () => new Set(((sh && sh.get("list", [])) || []).filter((n) => n >= 1 && n <= 19));
  return { read, add(n) { const s = read(); if (s.has(n)) return s; s.add(n); if (sh) sh.set("list", [...s].sort((a, b) => a - b)); return s; } };
}

// ---- phase 3 (2026-11-16): the price, the List paid off, and the second run ----
//
// The run: api.shared "runs" counts the runs finished (the List said at the window). A later run
// changes things a returning player would notice (DEEP_DIVE section 3, "A second playthrough"); a
// first run is unchanged. "notebook_burned" is set at Pack List's twist; from then the List lives on
// June's arm. The solve is the pattern walk's: say the List, nineteen to one, at the window.
export const runsDone = (api) => +((api && api.shared && api.shared.get("runs", 0)) || 0);
export const burned = (api) => !!(api && api.shared && api.shared.get("notebook_burned", false));
// What one run writes, and what "Begin again" clears. "runs" and "last_ending" stay.
const RUN_KEYS = ["list", "notebook_burned", "list_said", "first_page_read", "sure", "pattern_key", "recited", "window_seen",
  "backwards_lap_clean", "ghost_plates", "ranger_doubts", "recipe_copied", "supper1_threes", "supper_shared", "seat_fed",
  "breakfast_made", "mother_lines_kept", "drift", "introduced"];
export function beginAgain(api) {
  if (!api.shared) return;
  for (const k of RUN_KEYS) api.shared.set(k, null);
}

const PCSS = `
.${K}lb{position:absolute;z-index:11;font:600 13px 'IBM Plex Mono',monospace;background:#f6f1e2;color:#3a3a3c;border:0;box-shadow:inset 0 0 0 2px #4a4a48,0 3px 10px rgba(0,0,0,.35);padding:8px 10px;min-height:38px;cursor:pointer;display:flex;align-items:center;gap:6px}
.${K}lb img{width:24px;height:24px}
.${K}lb.arm{color:#1f3fa0;box-shadow:inset 0 0 0 2px #1f3fa0,0 3px 10px rgba(0,0,0,.35)}
.${K}lb:focus-visible{outline:3px solid #c9a862;outline-offset:2px}
.${K}rc{position:absolute;inset:0;z-index:20;background:rgba(14,22,34,.94);overflow:auto;padding:14px;box-sizing:border-box;display:grid;place-items:start center}
.${K}rc>div{width:min(720px,100%);box-sizing:border-box;color:#f1e9d6}
.${K}rc h3{margin:4px 0 6px;font:700 28px 'Zilla Slab',Georgia,serif;color:#f2a541}
.${K}rc p{margin:0 0 10px;font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.15}
.${K}rc .said{display:flex;flex-wrap:wrap;gap:4px 10px;min-height:30px;font:600 13px 'IBM Plex Mono',monospace;color:#c9a862;margin:0 0 8px}
.${K}rc .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px;font:600 13px 'IBM Plex Mono',monospace}
.${K}rc .bar button,.${K}rc .go{font:600 14px 'IBM Plex Mono',monospace;background:#f1e9d6;color:#222;border:0;padding:9px 14px;min-height:40px;cursor:pointer}
.${K}rc .bar button:disabled{opacity:.4;cursor:default}
.${K}rc .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px}
.${K}rc .tiles button{position:relative;aspect-ratio:1;border:0;padding:0;background:#f6f1e2;cursor:pointer;overflow:hidden;font:600 11px 'IBM Plex Mono',monospace;color:#3a3a3c}
.${K}rc .tiles button img{position:absolute;left:0;top:-20%;width:100%;height:120%}
.${K}rc .tiles button span{position:absolute;left:0;right:0;bottom:0;background:rgba(246,241,226,.92);padding:2px 3px;text-align:center}
.${K}rc .tiles button:disabled{opacity:.25;cursor:default}
.${K}rc .tiles button.bad{outline:4px solid #c0392b;outline-offset:-4px}
.${K}rc .tiles button:focus-visible{outline:3px solid #f2a541;outline-offset:2px}
.${K}rc .peek{background:#efe3d2;color:#1f3fa0;padding:8px 10px;font-family:Caveat,'Segoe Print',cursive;font-size:20px;line-height:1.2;margin:0 0 10px}
.${K}rc .peek.nb{background:#f6f1e2;color:#3a3a3c}
.${K}rc .peek[hidden]{display:none}
.${K}end{position:absolute;inset:0;z-index:15;background:#0e1622;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;padding:14px 14px 190px;box-sizing:border-box;overflow:auto}
.${K}end .ka{width:min(760px,100%,calc(40vh * 16 / 9));aspect-ratio:16/9;background:#1b2433 center/cover no-repeat;box-shadow:0 10px 30px #000;flex:none}
.${K}end .lt{width:min(760px,100%,calc(40vh * 16 / 9));height:auto;flex:none}
.${K}end .cap{font-family:Caveat,'Segoe Print',cursive;font-size:21px;line-height:1.2;color:#f1e9d6;max-width:620px;text-align:center}
.${K}end .again{font:600 14px 'IBM Plex Mono',monospace;background:transparent;color:#f1e9d6;border:2px solid #f1e9d6;padding:9px 14px;min-height:40px;cursor:pointer}
`;
function pcss(el) { const s = document.createElement("style"); s.textContent = PCSS; el.prepend(s); return el; }

// A small, always-reachable view of the List from any mode: a button (and L) that opens the page.
export function listButton(parent, api, { where = "left:10px;bottom:10px", note = "Things nobody packed, in the order the place packed them." } = {}) {
  const sl = sharedList(api), arm = burned(api);
  const page = listPage(parent, api.art, { note, arm });
  const b = pcss(document.createElement("button")); b.type = "button"; b.className = K + "lb" + (arm ? " arm" : "");
  b.style.cssText = where;
  const paint = () => { const f = sl.read(); page.set(f); b.lastChild.textContent = `${arm ? "June's arm" : "The List"} ${f.size}/19 (L)`; };
  const ic = pic(api.art, arm ? "june-arm-list" : "list-05", "", ""); if (ic) b.appendChild(ic);
  b.appendChild(document.createElement("span"));
  b.setAttribute("aria-label", "Open the List");
  b.addEventListener("click", () => { paint(); page.toggle(); });
  parent.appendChild(b);
  const kd = (e) => {
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === "l" && !e.repeat) { paint(); page.toggle(); }
    else if (k === "escape" && page.isOpen) page.close();
  };
  window.addEventListener("keydown", kd);
  paint();
  return { page, refresh: paint, get isOpen() { return page.isOpen; }, destroy() { window.removeEventListener("keydown", kd); b.remove(); page.el.remove(); } };
}

// The ending's generated card behind a result (api.keyart(id)), with its code-drawn lettering above.
// Falls back to a code-drawn card when the generated one is missing.
export function endingCard(root, api, { keyart, lettering, fallback = "thread-own", caption = "", again = null } = {}) {
  const box = pcss(document.createElement("div")); box.className = K + "end";
  const lt = pic(api.art, lettering, "lt", ""); if (lt) box.appendChild(lt);
  const src = (api.keyart && api.keyart(keyart)) || "";
  if (src) { const d = document.createElement("div"); d.className = "ka"; d.style.backgroundImage = `url("${src}")`; d.setAttribute("role", "img"); d.setAttribute("aria-label", "The ending's card"); box.appendChild(d); }
  else { const fb = pic(api.art, fallback, "lt", ""); if (fb) { fb.style.maxWidth = "420px"; box.appendChild(fb); } }
  if (caption) { const c = document.createElement("div"); c.className = "cap"; c.textContent = caption; box.appendChild(c); }
  if (again) { const b = document.createElement("button"); b.type = "button"; b.className = "again"; b.textContent = "Begin again: a second run"; b.addEventListener("click", again); box.appendChild(b); }
  root.appendChild(box);
  return box;
}

// The solve: at the window, say the List last thing first, nineteen to one. From the List page, or,
// if the notebook went on the fire, from June's arm. Two looks at the page; three breaths for slips.
export function recital(root, api, { onWin, onLose, rng = Math.random } = {}) {
  const arm = burned(api);
  const box = pcss(document.createElement("div")); box.className = K + "rc";
  box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "The window: say the List");
  const inner = document.createElement("div");
  inner.innerHTML = `<h3>The window</h3><p class="lead"></p><div class="peek" hidden></div><div class="bar"><span class="br"></span><button type="button" class="look"></button></div><div class="said" aria-live="polite"></div><div class="tiles"></div>`;
  box.appendChild(inner); root.appendChild(box);
  const $ = (s) => inner.querySelector(s);
  $(".lead").textContent = arm
    ? "The booth is ahead, lit, and nobody is in it. Your notebook is ash. June holds her arm out to the pearl light: the List, in biro, first to last. Say it last thing first, nineteen to one, and the trees let you through."
    : "The booth is ahead, lit, and nobody is in it. Your notebook is open at the List. Say it last thing first, nineteen to one, and the trees let you through.";
  if (arm) $(".peek").classList.remove("nb"); else $(".peek").classList.add("nb");
  let next = 19, breaths = 3, looks = 2, done = false, peekT = 0;
  const said = $(".said"), tiles = $(".tiles"), look = $(".look"), br = $(".br");
  const order = Array.from({ length: 19 }, (_, i) => i + 1).sort(() => rng() - 0.5);
  const btns = {};
  for (const n of order) {
    const b = document.createElement("button"); b.type = "button";
    const im = pic(api.art, listId(n), "", ""); if (im) b.appendChild(im);
    const sp = document.createElement("span"); sp.textContent = LIST[n]; b.appendChild(sp);
    b.setAttribute("aria-label", LIST[n]);
    b.addEventListener("click", () => tap(n, b));
    tiles.appendChild(b); btns[n] = b;
  }
  const paint = () => {
    br.textContent = `Breath ${"●".repeat(breaths)}${"○".repeat(3 - breaths)} · next: ${next}`;
    look.textContent = arm ? `Read June's arm (${looks})` : `Look at the page (${looks})`;
    look.disabled = looks <= 0 || done;
  };
  look.addEventListener("click", () => {
    if (looks <= 0 || done) return;
    looks--; const pk = $(".peek"); pk.hidden = false;
    pk.textContent = Array.from({ length: 19 }, (_, i) => `${i + 1}. ${LIST[i + 1]}`).join(" · ");
    clearTimeout(peekT); peekT = setTimeout(() => { pk.hidden = true; }, api.reducedMotion ? 6000 : 4500);
    paint();
  });
  function reset() {
    next = 19; said.textContent = "";
    for (const n in btns) btns[n].disabled = false;
  }
  function tap(n, b) {
    if (done || b.disabled) return;
    if (n === next) {
      b.disabled = true;
      const s = document.createElement("span"); s.textContent = `${n}. ${LIST[n]}`; said.appendChild(s);
      next--;
      if (next === 0) { done = true; paint(); clearTimeout(peekT); setTimeout(() => { box.remove(); onWin && onWin(); }, api.reducedMotion ? 200 : 900); return; }
      const nb = Object.values(btns).find((x) => !x.disabled); if (document.activeElement === b && nb) nb.focus();
    } else {
      breaths--;
      b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 500);
      if (breaths <= 0) { done = true; paint(); setTimeout(() => { box.remove(); onLose && onLose(); }, 700); return; }
      reset();
    }
    paint();
  }
  paint();
  tiles.querySelector("button").focus();
  return { destroy() { done = true; clearTimeout(peekT); box.remove(); } };
}

// The finale's words, shared by the pattern walk's window and the menu (loading.js finale()).
export const FINALE = {
  unlisted: { title: "Unlisted", keyart: "ending-unlisted", lettering: "ending-lettering-unlisted",
    text: "You walk out by June's arm, last thing first, nineteen to one, and the trees let you through. The booth is lit and empty, its book open at a pencil page in a hand that came out of these trees eleven summers ago, and nobody can say the line: the List that would have said it went on the second fire. A car pulls in, and the five of you walk past the window together, up a road into a world that is not yours, with no proof of anything. Agnes's lines went on the fire with the rest." },
  slipped_through: { title: "Slipped Through", keyart: "ending-slipped-through", lettering: "ending-lettering-slipped-through",
    text: "You say the List last thing first, nineteen to one, and the trees open onto a booth with nobody in it, its book open at a pencil page: Sites, a party of five, no check-out. A car pulls in and asks if it is in the right place, and you hear yourself say it: \"You're at the far end. Twenty through twenty-four.\" Then you set your notebook on the counter and rule the first column, the way Marisol did eleven summers ago. Every row kept, and no one to show them to." },
};

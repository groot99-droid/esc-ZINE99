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
export function listPage(root, art, { note = "" } = {}) {
  const el = style(document.createElement("div"));
  el.className = K + "list"; el.hidden = true;
  el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "The notebook's List page");
  const page = document.createElement("div"); page.className = K + "page";
  const tabs = pic(art, "notebook-tabs", "tabs", "The notebook's tabs: Sites, People, Copied, Tally, the List");
  if (tabs) page.appendChild(tabs);
  const h = document.createElement("h3"); h.textContent = "the List";
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

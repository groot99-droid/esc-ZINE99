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

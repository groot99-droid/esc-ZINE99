// A Journey Into the Heartstream: small shared helpers for the six modes. Behaviour only; every mode
// dresses these elements in its own graphic style through its own class prefix (P).
//
//   howTo(P, spec)      the how-to-play card: kicker, title, goal line, a short key legend, a Start button
//   Legend(P, parent)   the in-play legend; actions are introduced one by one as they unlock
//   Beats(P, parent)    a narrative line shown for a few seconds (the scene's beats)
//   Streak(api)         losses in a row, kept in api.store; after two, a mode may offer a gentler setting
//   flourish(el, cls)   add a class for a short animation, then take it away (respects reduced motion)

const pending = new Set();
const later = (fn, ms) => { const id = setTimeout(() => { pending.delete(id); fn(); }, ms); pending.add(id); return id; };
// cancel every timer the helpers started (call from unmount)
export function disposeKit() { pending.forEach(clearTimeout); pending.clear(); }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// spec: { kicker, title, scene, goal, quote, keys: [[verb, controls, what]], extra, start }
export function howTo(P, spec) {
  const el = document.createElement("div");
  el.className = P + "intro";
  const keys = (spec.keys || []).map(([verb, ctl, what]) =>
    `<li><b class="${P}kv">${esc(verb)}</b><span class="${P}kc">${esc(ctl)}</span>${what ? `<span class="${P}kw">${esc(what)}</span>` : ""}</li>`).join("");
  el.innerHTML = `<div class="${P}card" role="dialog" aria-label="${esc(spec.title)}: how to play">
${spec.kicker ? `<div class="${P}kick">${esc(spec.kicker)}</div>` : ""}
<h2>${esc(spec.title)}</h2>
${spec.quote ? `<blockquote class="${P}q">${esc(spec.quote)}</blockquote>` : ""}
${spec.scene ? `<p class="${P}scene">${esc(spec.scene)}</p>` : ""}
<p class="${P}goal"><b>Goal</b> ${esc(spec.goal)}</p>
<ul class="${P}keys">${keys}</ul>
${spec.extra ? `<div class="${P}extra">${spec.extra}</div>` : ""}
<button type="button" class="${P}start">${esc(spec.start || "Start")}</button></div>`;
  return el;
}

export class Legend {
  constructor(P, parent) {
    this.P = P; this.el = document.createElement("ul"); this.el.className = P + "legend"; this.el.setAttribute("aria-label", "Actions");
    this.items = new Map(); parent.appendChild(this.el);
  }
  add(key, verb, ctl, fresh) {
    if (this.items.has(key)) return false;
    const li = document.createElement("li"); li.dataset.k = key;
    li.innerHTML = `<b>${esc(verb)}</b> <span>${esc(ctl)}</span>`;
    if (fresh) { li.classList.add(this.P + "new"); later(() => li.classList.remove(this.P + "new"), 2600); }
    this.el.appendChild(li); this.items.set(key, li); return true;
  }
  has(key) { return this.items.has(key); }
}

export class Beats {
  constructor(P, parent, reduced) {
    this.P = P; this.reduced = reduced; this.el = document.createElement("div"); this.el.className = P + "beat";
    this.el.setAttribute("aria-live", "polite"); this.el.hidden = true; parent.appendChild(this.el); this.t = 0; this.seen = new Set();
  }
  // show a line once per id (or always when id is null); ms is how long it stays
  show(text, ms = 4200, id = null, who = "") {
    if (id) { if (this.seen.has(id)) return false; this.seen.add(id); }
    clearTimeout(this.t);
    this.el.innerHTML = `${who ? `<b>${esc(who)}</b> ` : ""}<span></span>`;
    this.el.querySelector("span").textContent = text;
    this.el.hidden = false; this.el.classList.remove(this.P + "in"); void this.el.offsetWidth; if (!this.reduced) this.el.classList.add(this.P + "in");
    this.t = later(() => { this.el.hidden = true; }, ms);
    return true;
  }
  dispose() { clearTimeout(this.t); }
}

export class Streak {
  constructor(api) { this.api = api; this.n = (api.store && api.store.get("losses", 0)) || 0; }
  get losses() { return this.n; }
  record(outcome) { this.n = outcome === "lose" ? this.n + 1 : 0; try { this.api.store.set("losses", this.n); } catch { /* storage off */ } }
}

export function flourish(el, cls, reduced, ms = 520) {
  if (!el || reduced) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  later(() => el.classList.remove(cls), ms);
}

// ---- the game's code-drawn art (api.art, docs/WEB.md). Every helper returns "" or null when the
// id is missing, so a mode keeps its own drawing as the fallback. ------------------------------------
//   artUrl(api, id)                      a blob URL for <img> or a CSS background
//   artImg(api, id, css, alt)            an <img>, or null
//   raster(api, id, w, h, fit)           the art drawn once into an offscreen canvas (device pixels)
//   pngUrl(api, id, w, h)                the same as a PNG data URL (for <image> in an SVG that is redrawn often)
//   plate(api, intro, P, ids)            a picture band at the head of the how-to card: chapter card, numeral, title lettering
//   flashPlate(wrap, api, id, ms, RM)    a chapter or interstitial card shown between phases
//   endCard(wrap, api, id, opts)         a card behind the result box; call it just before api.end
const hasArt = (api, id) => { try { return !!(id && api.art && api.art.has(id)); } catch { return false; } };
export const artUrl = (api, id) => (hasArt(api, id) ? api.art.url(id) : "");
export function artImg(api, id, css = "", alt = "") {
  if (!hasArt(api, id)) return null;
  const im = document.createElement("img");
  im.src = api.art.url(id); im.alt = alt; im.draggable = false; im.decoding = "async";
  if (css) im.style.cssText = css;
  return im;
}
export async function raster(api, id, w, h, fit = "fill") {
  if (!hasArt(api, id)) return null;
  const im = await api.art.img(id);
  if (!im) return null;
  const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  const g = c.getContext("2d"), info = api.art.info(id), iw = info.w, ih = info.h;
  try {
    if (fit === "fill") g.drawImage(im, 0, 0, c.width, c.height);
    else {
      const s = fit === "cover" ? Math.max(c.width / iw, c.height / ih) : Math.min(c.width / iw, c.height / ih);
      g.drawImage(im, (c.width - iw * s) / 2, (c.height - ih * s) / 2, iw * s, ih * s);
    }
  } catch { return null; }
  return c;
}
export async function pngUrl(api, id, w, h) {
  const c = await raster(api, id, w, h);
  try { return c ? c.toDataURL("image/png") : ""; } catch { return ""; }
}
export function plate(api, intro, P, ids = {}) {
  const card = intro.querySelector("." + P + "card");
  if (!card || !hasArt(api, ids.card)) return null;
  const el = document.createElement("div");
  el.style.cssText = `position:relative;height:clamp(58px,13vh,112px);margin:0 0 10px;overflow:hidden;background:#17110f;${ids.css || ""}`;
  el.appendChild(artImg(api, ids.card, `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${ids.at || "50% 42%"}`));
  const n = artImg(api, ids.numeral, "position:absolute;left:5px;top:5px;height:calc(100% - 10px);width:auto;box-shadow:0 2px 8px rgba(0,0,0,.5)");
  if (n) el.appendChild(n);
  const t = ids.title === false ? null : artImg(api, "title-lettering", "position:absolute;right:5px;bottom:5px;height:46%;width:auto;box-shadow:0 2px 8px rgba(0,0,0,.5)", "A Journey Into the Heartstream");
  if (t) el.appendChild(t);
  const before = ids.before ? card.querySelector(ids.before) : card.firstChild;
  card.insertBefore(el, before || card.firstChild);
  return el;
}
export function flashPlate(wrap, api, id, ms, reduced, css = "") {
  const im = artImg(api, id, `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(72%,620px);height:auto;max-height:60%;object-fit:contain;z-index:5;pointer-events:none;box-shadow:0 10px 40px rgba(0,0,0,.55);transition:opacity .5s;opacity:${reduced ? 1 : 0};${css}`);
  if (!im) return null;
  wrap.appendChild(im);
  if (!reduced) later(() => { im.style.opacity = "1"; }, 30);
  later(() => { im.style.opacity = "0"; later(() => im.remove(), reduced ? 0 : 520); }, ms);
  return im;
}
// opts: { numeral, inset (a second art id shown small, lower right), caption (a line under the inset or the card) }
export function endCard(wrap, api, id, opts = {}) {
  if (!hasArt(api, id)) return null;
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;inset:0;z-index:12;background:rgba(14,8,8,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:14px 14px 150px;box-sizing:border-box;overflow:hidden;animation:none";
  const box = document.createElement("div");
  box.style.cssText = "position:relative;max-width:min(100%,860px);max-height:100%;display:flex;min-height:0";
  box.appendChild(artImg(api, id, "display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.6)"));
  const n = artImg(api, opts.numeral, "position:absolute;left:8px;top:8px;width:clamp(36px,9%,72px);height:auto;box-shadow:0 2px 8px rgba(0,0,0,.5)");
  if (n) box.appendChild(n);
  const ins = artImg(api, opts.inset, "position:absolute;right:3%;bottom:6%;width:clamp(84px,30%,250px);height:auto;border:3px solid #E8DCC4;box-shadow:0 6px 22px rgba(0,0,0,.7)");
  if (ins) box.appendChild(ins);
  el.appendChild(box);
  if (opts.caption) {
    const c = document.createElement("p");
    c.style.cssText = "margin:0;max-width:640px;text-align:center;font:italic 18px/1.35 var(--g-display,Georgia,serif);color:#E8DCC4";
    c.textContent = opts.caption; el.appendChild(c);
  }
  try { wrap.scrollTop = 0; wrap.style.overflow = "hidden"; } catch { /* a wrap that scrolls would carry the card out of view */ }
  wrap.appendChild(el);
  return el;
}

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

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
    this.el.setAttribute("aria-live", "polite"); this.el.style.pointerEvents = "none"; this.el.hidden = true; parent.appendChild(this.el); this.t = 0; this.seen = new Set();
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
  if (!hasArt(api, id) && !opts.keyart) return null;
  const el = document.createElement("div");
  // opts.keyart: a generated ending card (api.keyart(id)) laid behind the result; "" falls back to the plain ground
  if (opts.keyart) el.style.backgroundImage = `linear-gradient(rgba(14,8,8,.62),rgba(14,8,8,.78)),url("${String(opts.keyart).replace(/"/g, "%22")}")`;
  el.style.cssText += ";position:absolute;inset:0;z-index:12;background-color:rgba(14,8,8,.86);background-size:cover;background-position:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:14px 14px 150px;box-sizing:border-box;overflow:hidden;animation:none";
  const box = document.createElement("div");
  box.style.cssText = "position:relative;max-width:min(100%,860px);max-height:100%;display:flex;min-height:0";
  const main = artImg(api, id, "display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;box-shadow:0 10px 40px rgba(0,0,0,.6)");
  if (main) box.appendChild(main);
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

// ---- phase 2: the ladders and the links between layers ---------------------------------------------
//   ladder(run, opts)     wraps a mode as three stages (teach, test, twist). `run(root, api, ctl)` mounts one
//                         stage and returns { unmount() }; it reads ctl.stage (0..2) and ctl.reached, calls
//                         ctl.end(result, card) where it used to call api.end, and ctl.go(n) to start at a
//                         stage the player has reached. A stage that is not lost offers the next one, or
//                         Stop here (the result, as before). Progress is kept in api.store ("stage").
//   stagePicker(P, intro, ctl)   adds "Start at ..." buttons to the how-to card for the stages reached
//   shared(api)           per-game storage for the links: get(k, d), set(k, v); never throws
export const STAGES = ["Teach", "Test", "Twist"];
export function shared(api) {
  return {
    get(k, d) { try { const v = api.shared.get(k, d); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { api.shared.set(k, v); } catch { /* storage off */ } },
  };
}
export function ladder(run, opts = {}) {
  const th = Object.assign({ bg: "#17110f", fg: "#E8DCC4", accent: "#F2B544", ink: "#17110f" }, opts.theme || {});
  return {
    mount(root, api) {
      let inner = null, card = null, onKey = null;
      const reached = () => { try { return Math.max(0, Math.min(2, api.store.get("stage", 0) | 0)); } catch { return 0; } };
      const drop = () => { if (card) { card.remove(); card = null; } if (onKey) { window.removeEventListener("keydown", onKey, true); onKey = null; } };
      const ctl = {
        stage: 0, reached: reached(), names: opts.names || STAGES,
        go(n) { drop(); if (inner) { try { inner.unmount(); } catch (e) { console.error(e); } } ctl.stage = n; ctl.reached = reached(); inner = run(root, api, ctl); },
        end(result, draw) {
          const pass = result.outcome !== "lose";
          if (pass) { try { api.store.set("stage", Math.max(reached(), Math.min(2, ctl.stage + 1))); if (ctl.stage === 2 && result.outcome === "win") api.store.set("twistWon", true); } catch { /* storage off */ } }
          if (!pass || ctl.stage >= 2) { if (draw) draw(); api.end(result); return; }
          const next = ctl.stage + 1;
          card = document.createElement("div");
          card.setAttribute("role", "dialog"); card.setAttribute("aria-label", `${ctl.names[ctl.stage]} done`);
          card.style.cssText = `position:absolute;inset:0;z-index:30;display:grid;place-items:center;padding:16px;box-sizing:border-box;background:rgba(10,7,6,.72);overflow:auto;font-family:var(--g-body,sans-serif)`;
          const box = document.createElement("div");
          box.style.cssText = `max-width:540px;width:100%;box-sizing:border-box;background:${th.bg};color:${th.fg};border:3px solid ${th.accent};padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.5)`;
          const k = document.createElement("div"); k.style.cssText = `font:700 12px var(--g-body,sans-serif);letter-spacing:.22em;text-transform:uppercase;color:${th.accent};margin-bottom:6px`;
          k.textContent = `Stage ${ctl.stage + 1} of 3 · ${ctl.names[ctl.stage]} · ${result.outcome === "win" ? "done well" : "done"}`;
          const p = document.createElement("p"); p.style.cssText = "margin:0 0 12px;font:17px/1.4 var(--g-display,Georgia,serif)"; p.textContent = result.text || "";
          const nx = document.createElement("p"); nx.style.cssText = "margin:0 0 14px;font-size:14px;line-height:1.4;opacity:.9"; nx.textContent = (opts.next && opts.next[next]) || "";
          const row = document.createElement("div"); row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap";
          const b1 = document.createElement("button"); b1.type = "button"; b1.dataset.ladder = "next"; b1.textContent = `Go on: ${ctl.names[next]}`;
          b1.style.cssText = `font:700 16px var(--g-body,sans-serif);background:${th.accent};color:${th.ink};border:0;padding:11px 20px;min-height:46px;cursor:pointer`;
          const b2 = document.createElement("button"); b2.type = "button"; b2.dataset.ladder = "stop"; b2.textContent = "Stop here";
          b2.style.cssText = `font:700 16px var(--g-body,sans-serif);background:transparent;color:${th.fg};border:2px solid ${th.fg};padding:9px 18px;min-height:46px;cursor:pointer`;
          b1.addEventListener("click", () => ctl.go(next));
          b2.addEventListener("click", () => { drop(); if (draw) draw(); api.end(result); });
          row.append(b1, b2); box.append(k, p, nx, row); card.appendChild(box); root.appendChild(card);
          // the finished stage's own keys must not reach it while the card is up
          onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); if (!card.contains(document.activeElement)) { e.preventDefault(); b1.focus(); } } else if (e.key !== "Tab") e.stopPropagation(); };
          window.addEventListener("keydown", onKey, true);
          b1.focus();
        },
      };
      inner = run(root, api, ctl);
      // phase 3: the ledger of the Four Marks, reachable from every stage of every mode
      let led = null;
      try { led = ledger(root, api); } catch (e) { console.error(e); }
      const onMark = (e) => { if (led) led.refresh(e.detail && e.detail.fresh); };
      root.addEventListener("heartstream-mark", onMark);
      return { unmount() { drop(); if (inner) inner.unmount(); inner = null; root.removeEventListener("heartstream-mark", onMark); if (led) led.remove(); led = null; } };
    },
  };
}
// the how-to card of stage 0 offers the stages already reached
export function stagePicker(P, intro, ctl) {
  const start = intro.querySelector("." + P + "start");
  if (!start) return;
  const tag = document.createElement("div");
  tag.style.cssText = "font:700 12px var(--g-body,sans-serif);letter-spacing:.2em;text-transform:uppercase;opacity:.8;margin:0 0 8px;position:relative;z-index:1";
  tag.textContent = `Stage ${ctl.stage + 1} of 3 · ${ctl.names[ctl.stage]}`;
  start.parentNode.insertBefore(tag, start);
  if (ctl.stage !== 0 || ctl.reached < 1) return;
  for (let n = 1; n <= ctl.reached; n++) {
    const b = document.createElement("button"); b.type = "button"; b.className = start.className; b.dataset.stage = String(n);
    b.textContent = `Start at the ${ctl.names[n].toLowerCase()}`;
    b.style.cssText = "margin:8px 0 0 8px;opacity:.92;font-size:14px;letter-spacing:.04em;padding:8px 14px;position:relative;z-index:1";
    b.addEventListener("click", (e) => { e.stopPropagation(); ctl.go(n); });
    start.parentNode.appendChild(b);
  }
}

// ---- phase 3: the Four Marks, the old phrase, the crossing record ---------------------------------
// The Lamp-Keeper's group left four marks through the world. Each sits at a height, one to five; read from
// the hall to the heart, the heights are the old phrase, which ends home. Each mode that holds one shows it
// once (revealMark) and writes it to api.shared ("marks"); The Carving's Wall at Night gives the key (the
// Lamp-Keeper's tool, turned over). The ledger (a tab on the right edge of every mode, once anything is
// found) shows what has been gathered. Marrow-Song's heart verse takes the phrase when all five are in.
//   shared keys: "marks" {board, wall, hook, chamber, key: true}; "oldPhrase" {solved, choice, ending, crossing};
//   "crossings" (finished crossings, a number); "lastCrossing" {boardRow, song, hands, ending}
export const MARKS = [
  { id: "board", n: "I", where: "the rim of the oldest board in the hall", sign: "the wave", h: 3, mode: "Bone Counters", art: "marks-board",
    who: "the brother sent up the shaft with nothing; the game he left is still one move from finished" },
  { id: "wall", n: "II", where: "the gap in a row of three on the Stencil Wall", sign: "the spiral", h: 4, mode: "The climb", art: "marks-wall",
    who: "the Lamp-Keeper, who stayed; the gap is his" },
  { id: "hook", n: "III", where: "the old hook in the Warden's hold", sign: "the fork", h: 2, mode: "River section", art: "marks-hook",
    who: "the one the Warden took" },
  { id: "chamber", n: "IV", where: "the mouth of the shared chamber, on the back of the chart", sign: "the wave and the star", h: 1, mode: "The Branch Chart", art: "marks-chamber",
    who: "two who held together at the heart, side by side at the mouth and apart at the outlets" },
];
export const OLD_PHRASE = MARKS.map((m) => m.h);
export function marks(api) {
  const sh = shared(api);
  const all = () => { const v = sh.get("marks", {}); return v && typeof v === "object" ? v : {}; };
  return {
    all, has: (id) => !!all()[id],
    add(id) { const v = all(); if (v[id]) return false; v[id] = true; sh.set("marks", v); return true; },
    count: () => MARKS.filter((m) => all()[m.id]).length + (all().key ? 1 : 0),
    complete: () => MARKS.every((m) => all()[m.id]) && !!all().key,
    crossings: () => Math.max(0, sh.get("crossings", 0) | 0),
    last: () => sh.get("lastCrossing", null),
  };
}
// a later crossing: a finished one is on record (a first run never sees any of this)
export const secondRun = (api) => marks(api).crossings() > 0;

const LP = "heartstream-ledger-";
function ledgerCss() {
  if (document.getElementById(LP + "css")) return;
  const s = document.createElement("style"); s.id = LP + "css";
  s.textContent = `
.${LP}tab{position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:11;writing-mode:vertical-rl;font:700 12px/1 var(--g-body,sans-serif);letter-spacing:.18em;text-transform:uppercase;background:#efe3c8;color:#17110f;border:1.5px solid #17110f;border-right:0;padding:12px 8px;min-width:34px;cursor:pointer;box-shadow:-3px 3px 0 rgba(23,17,15,.35)}
.${LP}tab:hover,.${LP}tab:focus-visible{background:#fff7e4;outline:2px solid #7A1020;outline-offset:1px}
.${LP}tab.${LP}new{animation:${LP}pulse 1s 3}
@keyframes ${LP}pulse{50%{background:#F2B544}}
.${LP}ov{position:absolute;inset:0;z-index:40;background:rgba(23,17,15,.72);display:grid;place-items:center;padding:12px;box-sizing:border-box;overflow:auto}
.${LP}pg{position:relative;width:100%;max-width:880px;box-sizing:border-box;background:#efe3c8;color:#17110f;border:2px solid #17110f;outline:1px solid #17110f;outline-offset:4px;padding:16px 18px;font-family:var(--g-display,Georgia,serif);
  background-image:repeating-linear-gradient(88deg,rgba(26,20,16,.06) 0 1px,transparent 1px 11px)}
.${LP}pg h2{margin:0 0 4px;font-weight:500;font-size:26px;letter-spacing:.06em}
.${LP}pg>p{margin:0 0 10px;font-size:16px;line-height:1.4;font-style:italic}
.${LP}row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 10px}
.${LP}row figure{margin:0;min-width:0}
.${LP}row img{display:block;width:100%;height:auto;border:1px solid #17110f}
.${LP}row figcaption{font-size:13px;line-height:1.3;margin-top:4px}
.${LP}row figcaption b{display:block;font:700 11px var(--g-body,sans-serif);letter-spacing:.16em;text-transform:uppercase;color:#7A1020}
.${LP}key{display:flex;gap:12px;align-items:center;border-top:1px dashed rgba(23,17,15,.4);padding-top:10px;margin-bottom:10px}
.${LP}key img{width:min(46%,260px);height:auto;border:1px solid #17110f;flex:none}
.${LP}key p{margin:0;font-size:15px;line-height:1.4;font-style:italic}
.${LP}pg button,.${LP}rv button{font:700 15px var(--g-body,sans-serif);letter-spacing:.06em;background:#17110f;color:#efe3c8;border:0;padding:10px 18px;min-height:44px;cursor:pointer}
.${LP}rv{position:absolute;inset:0;z-index:41;background:rgba(23,17,15,.84);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px;box-sizing:border-box;overflow:auto;text-align:center;color:#efe3c8}
.${LP}rv img{display:block;width:min(78vw,300px);height:auto;border:2px solid #efe3c8;box-shadow:0 8px 30px rgba(0,0,0,.6)}
.${LP}rv p{margin:0;max-width:600px;font:italic 18px/1.4 var(--g-display,Georgia,serif)}
.${LP}rv b{display:block;font:700 12px var(--g-body,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:#F2B544;margin-bottom:4px;font-style:normal}
.${LP}rv button{background:#efe3c8;color:#17110f}
@media (max-width:640px){.${LP}row{grid-template-columns:repeat(2,minmax(0,1fr))}.${LP}key{flex-direction:column;align-items:stretch}.${LP}key img{width:100%}.${LP}pg h2{font-size:22px}}
@media (prefers-reduced-motion:reduce){.${LP}tab.${LP}new{animation:none}}`;
  document.head.appendChild(s);
}
// a modal that keeps the mode's own keys away while it is up; returns close()
function modal(root, el, onClose) {
  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === "Tab") return;
    e.stopPropagation();
    if ((e.key === "Enter" || e.key === " ") && !el.contains(document.activeElement)) { e.preventDefault(); const b = el.querySelector("button"); b && b.focus(); }
  };
  window.addEventListener("keydown", onKey, true);
  root.appendChild(el);
  let done = false;
  function close() { if (done) return; done = true; window.removeEventListener("keydown", onKey, true); el.remove(); if (onClose) onClose(); }
  return close;
}
const imgTag = (api, id, alt) => (artUrl(api, id) ? `<img alt="${esc(alt)}" src="${artUrl(api, id)}">` : "");
// the ledger: the tab on the right edge, and the page it opens
export function ledger(root, api) {
  ledgerCss();
  const M = marks(api);
  const tab = document.createElement("button"); tab.type = "button"; tab.className = LP + "tab";
  let closeIt = null;
  const label = () => { const n = M.count(); tab.textContent = `The Four Marks · ${n}/5`; tab.setAttribute("aria-label", `The Four Marks: ${n} of 5 pieces found. Open the ledger.`); tab.hidden = n === 0 && !secondRun(api); };
  const open = () => {
    if (closeIt) return;
    const v = M.all(), n = MARKS.filter((m) => v[m.id]).length;
    const ov = document.createElement("div"); ov.className = LP + "ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "The Four Marks");
    const cards = MARKS.map((m) => v[m.id]
      ? `<figure>${imgTag(api, m.art, `${m.where}: ${m.sign}, cut beside a notch of the five`)}<figcaption><b>${m.n} · found</b>${esc(m.where.charAt(0).toUpperCase() + m.where.slice(1))}: ${esc(m.sign)}. ${esc(m.who.charAt(0).toUpperCase() + m.who.slice(1))}.</figcaption></figure>`
      : `<figure>${imgTag(api, "marks-unknown", "A page not yet filled")}<figcaption><b>${m.n} · not found</b>Somewhere in ${esc(m.mode)}.</figcaption></figure>`).join("");
    const last = M.last();
    const pencil = secondRun(api) && last && Array.isArray(last.song) ? `<p>On the facing page, in your own hand from the last crossing: ${esc(last.song.join(" · "))}.</p>` : "";
    const keyHtml = v.key
      ? `<div class="${LP}key">${imgTag(api, "keeper-underside", "The Lamp-Keeper's tool, turned over: four signs over four beads, the last one home")}<p>The Lamp-Keeper's tool, turned over at the pulse wall: four signs in a row, and over each a bead on a strand, the last one home. They are a phrase.${n === 4 ? " Read from the hall to the heart, by the height each is cut at. The heart verse in Marrow-Song has room for it, last." : ""}</p></div>`
      : `<div class="${LP}key"><p>${n ? "Each is cut beside one of five notches, at a height. What the heights are for, nobody has told you. Somebody at the pulse wall, at night, might." : "Nothing found yet."} (The fifth piece is in The Carving.)</p></div>`;
    ov.innerHTML = `<div class="${LP}pg"><h2>The Four Marks</h2><p>Four signs an older group left behind them, from the hall to the heart.</p><div class="${LP}row">${cards}</div>${keyHtml}${pencil}<button type="button">Close <small>Esc</small></button></div>`;
    closeIt = modal(root, ov, () => { closeIt = null; tab.focus(); });
    ov.querySelector("button").addEventListener("click", () => closeIt && closeIt());
    ov.addEventListener("click", (e) => { if (e.target === ov && closeIt) closeIt(); });
    ov.querySelector("button").focus();
  };
  tab.addEventListener("click", open);
  label();
  root.appendChild(tab);
  return { refresh(fresh) { label(); if (fresh) flourish(tab, LP + "new", api.reducedMotion, 3000); }, open, remove() { if (closeIt) closeIt(); tab.remove(); } };
}
// show one mark as it is found, copy it into the ledger, then go on. `text` is the moment's own line.
export function revealMark(root, api, id, text, then) {
  ledgerCss();
  const m = MARKS.find((x) => x.id === id), M = marks(api), had = M.has(id);
  const el = document.createElement("div"); el.className = LP + "rv"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", `A mark: ${m.where}`);
  el.innerHTML = `${imgTag(api, m.art, `${m.where}: ${m.sign}, cut beside a notch of the five`)}<p><b>${had ? "A mark you have copied before" : "A mark"} · ${m.n} of the Four</b>${esc(text)}</p><button type="button">${had ? "Go on" : "Copy it into the ledger"} <small>Enter</small></button>`;
  const close = modal(root, el, () => {
    const fresh = M.add(id);
    try { root.dispatchEvent(new CustomEvent("heartstream-mark", { detail: { id, fresh } })); } catch { /* old browsers */ }
    if (then) then(fresh);
  });
  el.querySelector("button").addEventListener("click", close);
  el.querySelector("button").focus();
  return close;
}
// the Lamp-Keeper's key, found at the Wall at Night (The Carving)
export function addKey(root, api) {
  const v = marks(api).all(); if (v.key) return false;
  v.key = true; shared(api).set("marks", v);
  try { root.dispatchEvent(new CustomEvent("heartstream-mark", { detail: { id: "key", fresh: true } })); } catch { /* old browsers */ }
  return true;
}
// a finished crossing: the long puzzle solved. The marks are cleared for the next crossing, and what this one
// left (board row, the heart verse, the hands on the wall, the ending) is kept for it.
export function recordCrossing(api, solve, left) {
  const sh = shared(api), n = marks(api).crossings() + 1;
  sh.set("oldPhrase", Object.assign({ solved: true, crossing: n }, solve));
  sh.set("lastCrossing", left);
  sh.set("crossings", n);
  sh.set("marks", {});
}
// a line on the how-to card (used for what a later crossing finds changed)
export function introNote(P, intro, kicker, text) {
  const start = intro.querySelector("." + P + "start"); if (!start) return null;
  const el = document.createElement("p");
  el.style.cssText = "margin:0 0 12px;padding:8px 10px;border:1.5px dashed currentColor;font-size:15px;line-height:1.4;font-style:italic;position:relative;z-index:1";
  el.innerHTML = `<b style="display:block;font:700 11px var(--g-body,sans-serif);letter-spacing:.18em;text-transform:uppercase;font-style:normal;margin-bottom:2px">${esc(kicker)}</b>${esc(text)}`;
  el.dataset.crossing = "2";
  start.parentNode.insertBefore(el, start);
  return el;
}
// the long puzzle's payoff: which ending a solved crossing earned, in the game's voice (loading.js finale reads it)
export const FINALES = {
  open_hand: { title: "The Open Hand", card: "ending-the-open-hand", art: "ending-the-open-hand",
    text: "On the last note of the old phrase he opened his hand before the heart could open it for him, and his grip passed to the brothers either side. He went into his vessel first, red, the gift lying in his open palm. At its far end the vessel was cold and blue, and the wall there had a pulse in it: somebody carried away long ago, still keeping the beat for a marrow full of the not yet born. He cut his mark beside an old one and began to keep it too, and his friends, who watched his hand open, never learned why." },
  two_together: { title: "Two Together", card: "ending-two-together", art: "ending-two-together",
    text: "They held on through the old phrase, in time, and the heart swept the two of them into one chamber, the way a wave and a star were swept once, side by side at its mouth. For three minutes nobody else existed; then a valve opened between them without struggle, and each was carried on alone. At the end of each vessel a blue wall kept somebody's borrowed beat, and each cut his mark beside an old one. “…never lets you hold what you love for long.”" },
  carried_away: { title: "Carried Away", card: "ending-carried-away", art: "ending-carried-away",
    text: "The current split in the heart and every brother was swept a different way, holding the tool another carved for him. At the end of his vessel the wall was blue and cold and beating: the light in the marrow is the carried, keeping time for those not yet born, and he cut his mark beside an old one and began to keep it too. He turned the gift over and read what his brother had cut, when he could no longer answer it. “No one stays together. / Everyone is carried away. / Life is a river that never lets you hold what you love for long.”" },
};

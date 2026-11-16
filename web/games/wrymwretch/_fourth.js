// WrymWretch: the long puzzle, the fourth row (phase 3, built 2026-11-16; DESIGN.md section 21).
//
// The monolith's fourth row has no still part on any page. Its six still parts are held in the world,
// one a realm. In the full game each is noticed in a 3D scene; in the web build each is noticed inside
// the mode that stands in for that place, and recorded with api.shared ("fourth_row": { realm: true }).
// With all six, row IV of the seal (The Slipping Glyph III) holds, and can be read like any row. Reading
// it sets "fourth_row_read"; the names said after it decide the finale (loading.js).
//
//   PARTS                         the six parts, in realm order
//   gathered(api)                 { realm: true } of the parts recorded so far
//   notice(wrap, api, realm, o)   a glint in the mode: after o.after ms it shows the part for o.stay ms
//                                 (Infinity: until taken), again every o.every ms; tap, Enter or N (o.key) records
//                                 it. Returns { stop() }. Does nothing once that part is in.
//   notebookButton(api)           the button that opens the notebook page: the six parts so far
//   runs(api)                     how many runs have reached the finale (the second playthrough)

import { png } from "./_art.js";

export const PARTS = [
  { realm: "west", what: "the crack in the split tree", mode: "Forgetting run I", hint: "Thalen's run to the outpost, past the tree the world split", part: "stem-01",
    seen: "A crack runs straight down the split cedar. The rest of the forest is going to outline round it, and the crack does not move." },
  { realm: "north", what: "a rune on Aetherius's scales", mode: "Twin flight I", hint: "on Aetherius's neck, once Aeris has been caught", part: "crown-02",
    seen: "Under Aeris's hand, on the scales of his neck, a mark like a roof-peak. It was there before she woke him." },
  { realm: "south", what: "a vein in the Heartstone", mode: "Heartstone I", hint: "in the Heartstone's ring, while Rhyla tunes it", part: "foot-01",
    seen: "One vein in the Heartstone lies level under the ring and does not shake when the shards do." },
  { realm: "east", what: "a kelp line on the seabed", mode: "Forgetting run II", hint: "on Lunessa's climb to the surface, under her", part: "foot-01",
    seen: "Far below, one line of kelp lies flat along the sand, the same level line as the vein in the stone." },
  { realm: "below", what: "a candle shadow in the forbidden chamber", mode: "Six Realms I", hint: "at the Syndicate Elder's table, by the candle", part: "mark-03",
    seen: "The candle by the Syndicate's board throws a shadow that is not its own: a small diamond, and it stays when the flame moves." },
  { realm: "above", what: "a star in the Priory dome", mode: "Star Chart I", hint: "in the Priory dome, over the first plate", part: "crown-02",
    seen: "One star of the Priory's painted dome is set with two lines meeting in a peak, the same mark as on the dragon's neck." },
];
const BY = Object.fromEntries(PARTS.map((p) => [p.realm, p]));
const SEAL = { west: "ui-seal-west", north: "ui-seal-north", south: "ui-seal-south", east: "ui-seal-east", below: "ui-seal-below", above: "ui-seal-above" };
// What the row says, read with all six: the terms of the bargain (DEEP_DIVE.md section 3; wording added).
export const TERMS = [
  ["What was given", "the dragons' memory of us"],
  ["By whom", "six tribes, and not the dragons"],
  ["For how long", "until someone else carries it"],
];

const sget = (api, k, d) => { try { const v = api.shared && api.shared.get(k, d); return v == null ? d : v; } catch { return d; } };
const sset = (api, k, v) => { try { api.shared && api.shared.set(k, v); } catch { /* no storage */ } };
export const gathered = (api) => { const o = sget(api, "fourth_row", {}); return o && typeof o === "object" ? o : {}; };
export const count = (api) => PARTS.filter((p) => gathered(api)[p.realm]).length;
export const runs = (api) => +sget(api, "runs_done", 0) || 0;
export function record(api, realm) { const o = { ...gathered(api) }; o[realm] = true; sset(api, "fourth_row", o); return PARTS.filter((p) => o[p.realm]).length; }

const CSS = `
.wrymwretch-fourth-glint{position:absolute;z-index:12;display:flex;gap:9px;align-items:center;max-width:min(330px,calc(100% - 24px));box-sizing:border-box;padding:7px 12px 7px 7px;cursor:pointer;font:16px/1.25 'Cormorant Garamond',Georgia,serif;color:#E9E2D0;background:rgba(11,13,26,.9);border:1.5px solid #E7C566;box-shadow:0 0 0 3px rgba(231,197,102,.22),0 6px 18px rgba(0,0,0,.5);opacity:0;transition:opacity .5s;text-align:left}
.wrymwretch-fourth-glint.on{opacity:1}
.wrymwretch-fourth-glint:focus-visible{outline:3px solid #fff;outline-offset:2px}
.wrymwretch-fourth-glint img,.wrymwretch-fourth-glint i{width:46px;height:46px;flex:none;border-radius:2px;background:#1d2248}
.wrymwretch-fourth-glint b{display:block;font:700 12.5px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:#E7C566}
.wrymwretch-fourth-glint kbd{font:700 11px ui-monospace,monospace;border:1px solid #E9E2D0;padding:0 4px;border-radius:2px}
.wrymwretch-fourth-glint.pulse{animation:wrymwretch-fourth-pulse 1.6s ease-in-out infinite}
@keyframes wrymwretch-fourth-pulse{50%{box-shadow:0 0 0 7px rgba(231,197,102,.08),0 6px 18px rgba(0,0,0,.5)}}
.wrymwretch-fourth-open{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;min-height:42px;margin:0 0 12px;padding:5px 10px;cursor:pointer;font:700 12.5px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:#17151a;background:rgba(231,197,102,.35);border:1.5px dashed #17151a;border-radius:2px}
.wrymwretch-fourth-open small{font:italic 14px 'Cormorant Garamond',Georgia,serif;letter-spacing:0;margin-left:auto}
.wrymwretch-fourth-open:focus-visible{outline:3px solid #E7C566;outline-offset:1px}
.wrymwretch-fourth-open.dark{color:#E9E2D0;border-color:#E7C566;background:rgba(231,197,102,.12)}
.wrymwretch-fourth-book{position:absolute;inset:0;z-index:30;display:grid;place-items:start center;padding:12px;box-sizing:border-box;overflow:auto;background:rgba(11,13,26,.94);font-family:'Cormorant Garamond',Georgia,serif;color:#E9E2D0}
.wrymwretch-fourth-book>div{position:relative;width:min(540px,100%);box-sizing:border-box;padding:18px 20px 16px;background:linear-gradient(160deg,#1d2248,#0B0D1A);border:1px solid rgba(233,226,208,.45)}
.wrymwretch-fourth-book img.page{display:block;width:100%;height:auto;margin:0 0 8px}
.wrymwretch-fourth-book h3{font:700 19px 'Cinzel',Georgia,serif;letter-spacing:.1em;margin:0;color:#E7C566}
.wrymwretch-fourth-book p{font-size:16.5px;line-height:1.35;margin:6px 0 10px}
.wrymwretch-fourth-book ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.wrymwretch-fourth-book li{display:flex;gap:10px;align-items:center;padding:6px;border:1px solid rgba(233,226,208,.22);background:rgba(233,226,208,.04)}
.wrymwretch-fourth-book li .s{width:34px;height:34px;flex:none}
.wrymwretch-fourth-book li .p{width:52px;height:52px;flex:none;display:grid;place-items:center;border:1.5px dashed rgba(233,226,208,.4);font:700 20px 'Cinzel',serif;color:rgba(233,226,208,.4)}
.wrymwretch-fourth-book li .p img{width:100%;height:100%;display:block}
.wrymwretch-fourth-book li.in .p{border:1.5px solid #E7C566}
.wrymwretch-fourth-book li div{font-size:15.5px;line-height:1.25;min-width:0}
.wrymwretch-fourth-book li b{display:block;font:700 12.5px 'Cinzel',Georgia,serif;letter-spacing:.06em;color:#fbf7ec}
.wrymwretch-fourth-book li.out div{color:#9aa3ad}
.wrymwretch-fourth-book .terms{margin:10px 0 0;padding:10px 12px;border:1.5px solid #E7C566;background:rgba(231,197,102,.08)}
.wrymwretch-fourth-book .terms dt{font:700 12px 'Cinzel',Georgia,serif;letter-spacing:.12em;color:#E7C566}
.wrymwretch-fourth-book .terms dd{margin:0 0 6px;font-size:17px;font-style:italic}
.wrymwretch-fourth-book button.close{font:700 14px 'Cinzel',Georgia,serif;letter-spacing:.06em;min-height:44px;padding:8px 18px;margin-top:12px;cursor:pointer;border:1.5px solid #E7C566;background:#E7C566;color:#0B0D1A}
.wrymwretch-fourth-book button.close:focus-visible{outline:3px solid #fff;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.wrymwretch-fourth-glint.pulse{animation:none}}
`;
function style(host) {
  if (host.querySelector(":scope > style[data-fourth]")) return;
  const s = document.createElement("style"); s.dataset.fourth = "1"; s.textContent = CSS; host.appendChild(s);
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// A glint: the part, shown in the mode for a while. Taking it is the notice.
export function notice(wrap, api, realm, o = {}) {
  const P = BY[realm];
  if (!P || !wrap || gathered(api)[realm]) return { stop() {} };
  style(wrap);
  const after = o.after == null ? 8000 : o.after, stay = o.stay == null ? 10000 : o.stay, every = o.every == null ? 26000 : o.every;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
  let el = null, gone = false;
  const take = () => {
    if (gone || !el) return;
    const n = record(api, realm);
    stop();
    if (o.onTake) o.onTake(n, P);
  };
  const K = (o.key || "n").toLowerCase();
  const key = (e) => { if (el && e.key && e.key.toLowerCase() === K && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); e.stopImmediatePropagation(); take(); } };
  function show() {
    if (gone || gathered(api)[realm]) return;
    el = document.createElement("button");
    el.type = "button"; el.className = "wrymwretch-fourth-glint" + (api.reducedMotion ? "" : " pulse");
    el.style.cssText = o.css || "right:12px;top:58px";
    el.setAttribute("aria-label", `Something holds still: ${P.what}. Record it (${K.toUpperCase()}).`);
    el.innerHTML = `<i></i><span><b>SOMETHING HOLDS STILL</b>${esc(P.what[0].toUpperCase() + P.what.slice(1))}. Record it <kbd>${K.toUpperCase()}</kbd></span>`;
    el.addEventListener("click", (e) => { e.stopPropagation(); take(); });
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    wrap.appendChild(el);
    requestAnimationFrame(() => el && el.classList.add("on"));
    png(api.art, "fourth-part-" + realm, { w: 92 }).then((u) => { if (u && el && el.isConnected) el.querySelector("i").outerHTML = `<img alt="" src="${u}">`; });
    window.addEventListener("keydown", key, true);
    if (stay !== Infinity) later(hide, stay);
  }
  function hide() {
    if (!el) return;
    window.removeEventListener("keydown", key, true);
    const e = el; el = null; e.classList.remove("on"); later(() => e.remove(), 500);
    if (!gone && every) later(show, every);
  }
  function stop() {
    gone = true; window.removeEventListener("keydown", key, true);
    timers.forEach(clearTimeout); timers.clear();
    if (el) { const e = el; el = null; e.classList.remove("on"); setTimeout(() => e.remove(), 400); }
  }
  later(show, after);
  return { stop };
}

// The notebook page: the six parts, the row they make, and (once read) what it says.
export function openNotebook(host, api) {
  if (!host) return;
  style(host);
  host.querySelectorAll(".wrymwretch-fourth-book").forEach((n) => n.remove());
  const got = gathered(api), n = PARTS.filter((p) => got[p.realm]).length, read = !!sget(api, "fourth_row_read", false);
  const box = document.createElement("div");
  box.className = "wrymwretch-fourth-book"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "The notebook: the fourth row");
  box.innerHTML = `<div><span data-page></span><h3>The fourth row · ${n} of 6</h3>
    <p>${read ? "Read at the seal. Its six parts held still in the world, and on the door they hold together." : n === 6 ? "All six are in. On the seal of the Bone Choir (The Slipping Glyph III), row IV will hold now: read it like any row." : "Nothing on any page holds the monolith's fourth row. Its still parts are kept in the world, one a realm. Notice one, and record it."}</p>
    <ol>${PARTS.map((p) => `<li class="${got[p.realm] ? "in" : "out"}" data-r="${p.realm}"><span class="s"></span><span class="p">${got[p.realm] ? "" : "?"}</span>
      <div><b>${esc(p.what[0].toUpperCase() + p.what.slice(1))}</b>${got[p.realm] ? esc(p.seen) : `Not yet noticed. Look ${esc(p.hint)} (${esc(p.mode)}).`}</div></li>`).join("")}</ol>
    ${sget(api, "finale_ending", "") === "empty_saddle" ? `<span data-who></span>` : ""}
    ${read ? `<dl class="terms">${TERMS.map(([a, b]) => `<dt>${esc(a.toUpperCase())}</dt><dd>${esc(b)}</dd>`).join("")}</dl>` : n === 6 ? `<p>Six parts, four kinds: the crown is kept twice, by a dragon's neck and a painted star; the foot twice, by a vein and a line of kelp.</p>` : ""}
    <button type="button" class="close">Close the notebook</button></div>`;
  host.appendChild(box);
  const close = () => box.remove();
  box.querySelector("button.close").addEventListener("click", close);
  box.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });
  box.addEventListener("pointerdown", (e) => e.stopPropagation());
  box.querySelector("button.close").focus();
  png(api.art, "fourth-row-page", { w: 500, strip: [".plate"] }).then((u) => { if (u && box.isConnected) box.querySelector("[data-page]").outerHTML = `<img class="page" alt="" src="${u}">`; });
  if (box.querySelector("[data-who]")) png(api.art, "doc-who-next", { w: 300 }).then((u) => { const h = box.querySelector("[data-who]"); if (u && h) h.outerHTML = `<img alt="The Record's last page, headed Who next?, empty" src="${u}" style="display:block;width:min(240px,70%);height:auto;margin:10px auto">`; });
  PARTS.forEach((p) => {
    const li = box.querySelector(`li[data-r="${p.realm}"]`);
    png(api.art, SEAL[p.realm], { w: 34, strip: [".plate"] }).then((u) => { if (u && li.isConnected) li.querySelector(".s").innerHTML = `<img alt="" src="${u}" style="width:34px;height:34px">`; });
    if (got[p.realm]) png(api.art, "fourth-part-" + p.realm, { w: 104 }).then((u) => { if (u && li.isConnected) li.querySelector(".p").innerHTML = `<img alt="${esc(p.what)}" src="${u}">`; });
  });
}

export function notebookButton(api, host, dark = false) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "wrymwretch-fourth-open" + (dark ? " dark" : "");
  const n = count(api);
  b.innerHTML = `◇ The notebook: the fourth row<small>${sget(api, "fourth_row_read", false) ? "read" : n + " of 6 parts"}</small>`;
  b.addEventListener("click", (e) => { e.stopPropagation(); openNotebook(host(), api); });
  return b;
}

export { style as fourthStyle };

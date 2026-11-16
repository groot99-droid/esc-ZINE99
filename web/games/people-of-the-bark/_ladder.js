// People of the Bark — the ladder every mode climbs (phase 2): teach, test, twist.
// Not a mode: the catalog never lists it. run() wraps a mode's own play(root, api, stage) so that a win
// on the first two stages offers "go on" or "stop here with this result", the stage reached is remembered
// (api.store "stage"), and a returning player may start at any stage reached. note() is the short line a
// layer link shows when something done in another mode changes this one. pulse() moves the hidden meter.
// Phase 3: every mode also carries the tab of the Pulse map (_pulse.js), the long puzzle's book.

import * as book from "./_pulse.js";

const L = "people-of-the-bark-ladder-";
export const STAGES = ["Teach", "Test", "Twist"];

const CSS = `
.${L}veil{position:absolute;inset:0;z-index:30;display:grid;place-items:center;background:rgba(20,13,9,.9);padding:14px;box-sizing:border-box;overflow:auto;font-family:'Cormorant Garamond',Georgia,serif;color:#efe2c4}
.${L}card{max-width:520px;width:100%;box-sizing:border-box;background:linear-gradient(170deg,#3a281c,#241810);border:1px solid #d9902a;padding:16px 18px;box-shadow:6px 6px 0 #0d0805}
.${L}card h3{margin:0 0 2px;font:400 12px ui-monospace,monospace;letter-spacing:.2em;color:#c4d65a;text-transform:uppercase}
.${L}card h2{margin:0 0 8px;font-weight:500;font-size:25px;color:#f0c050;line-height:1.15}
.${L}card p{margin:0 0 10px;font-size:17px;line-height:1.4}
.${L}card p.${L}next{font-style:italic;color:#e9d6ae;border-top:1px dashed #7a5a40;padding-top:8px}
.${L}row{display:flex;flex-wrap:wrap;gap:8px}
.${L}row button{flex:1 1 140px;min-height:46px;font:inherit;font-size:17px;line-height:1.2;color:#efe2c4;background:#2a1d14;border:1px solid #7a5a40;padding:8px 10px;cursor:pointer;text-align:left}
.${L}row button b{display:block;font:400 11px ui-monospace,monospace;letter-spacing:.16em;color:#c4d65a}
.${L}row button.${L}go{background:#d9902a;color:#1b120c;border-color:#f0c050}
.${L}row button.${L}go b{color:#3a281c}
.${L}row button:disabled{opacity:.4;cursor:default}
.${L}row button:hover:not(:disabled){border-color:#f0c050}
.${L}row button:focus-visible{outline:3px solid #c4d65a;outline-offset:2px}
.${L}pips{display:flex;gap:6px;margin:0 0 10px}
.${L}pips i{flex:1;height:5px;background:#4a3324}
.${L}pips i.${L}on{background:#c4d65a}
.${L}pips i.${L}now{background:#f0c050}
.${L}note{position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:25;max-width:min(560px,calc(100% - 20px));box-sizing:border-box;background:rgba(27,18,12,.94);border:1px solid #b9c2c4;border-left-width:4px;color:#efe2c4;font:italic 16px/1.35 'Cormorant Garamond',Georgia,serif;padding:6px 12px;pointer-events:none;transition:opacity .6s}
.${L}note b{font:400 11px ui-monospace,monospace;letter-spacing:.16em;color:#b9c2c4;font-style:normal;display:block}
.${L}chip{position:absolute;left:8px;bottom:8px;z-index:6;font:11px ui-monospace,monospace;letter-spacing:.14em;color:#c9b99a;background:rgba(27,18,12,.8);border:1px solid #5a3d2b;padding:2px 7px;pointer-events:none}
@media (max-width:560px){.${L}card h2{font-size:22px}.${L}card p{font-size:16px}.${L}chip{left:auto;right:6px;bottom:auto;top:4px}}
@media (prefers-reduced-motion:reduce){.${L}note{transition:none}}`;

function veil(root, html) {
  const v = document.createElement("div");
  v.className = L + "veil";
  v.innerHTML = `<div class="${L}card" role="dialog" aria-label="The stages">${html}</div>`;
  root.appendChild(v);
  return v;
}
const pips = (reached, now) => `<div class="${L}pips" aria-hidden="true">${STAGES.map((_, i) => `<i class="${i === now ? L + "now" : i <= reached ? L + "on" : ""}"></i>`).join("")}</div>`;

// spec: { title, stages: [{ name, blurb }, x3] }.  play(root, api, stage, ctx) returns { unmount() }.
export function run(root, api, spec, play) {
  const st = document.createElement("style"); st.textContent = CSS; root.appendChild(st);
  let cur = null, over = null, chip = null, dead = false;
  const timers = [];
  const reached = () => Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
  const clear = () => { if (over) { over.remove(); over = null; } };

  function start(stage) {
    clear();
    if (cur && cur.unmount) { try { cur.unmount(); } catch (e) { console.error(e); } }
    if (chip) chip.remove();
    const inner = Object.assign({}, api, {
      stage,
      end(result = {}) {
        if (dead) return;
        if (result.outcome === "win" && stage < 2) {
          api.store.set("stage", Math.max(reached(), stage + 1));
          const nx = spec.stages[stage + 1];
          over = veil(root, `<h3>${spec.title} · ${STAGES[stage]} done</h3>${pips(stage, stage)}<p>${result.text || "Done."}</p>
<p class="${L}next"><b style="font-style:normal;color:#f0c050">${STAGES[stage + 1]}: ${nx.name}.</b> ${nx.blurb}</p>
<div class="${L}row"><button type="button" class="${L}go" data-a="on"><b>GO ON</b>${STAGES[stage + 1]}: ${nx.name}</button><button type="button" data-a="stop"><b>STOP HERE</b>Keep this result</button></div>`);
          over.querySelector('[data-a="on"]').addEventListener("click", () => start(stage + 1));
          over.querySelector('[data-a="stop"]').addEventListener("click", () => { clear(); api.end(result); });
          over.querySelector('[data-a="on"]').focus({ preventScroll: true });
          return;
        }
        if (result.outcome === "win" && stage === 2) api.store.set("cleared", true);
        api.end(result);
      },
    });
    chip = document.createElement("div"); chip.className = L + "chip"; if (spec.chip) chip.style.cssText = spec.chip; chip.textContent = `${stage + 1}/3 · ${STAGES[stage].toUpperCase()}`;
    cur = play(root, inner, stage) || null;
    root.appendChild(chip);
  }

  // the long puzzle's book is reachable from every stage of every mode (phase 3, _pulse.js)
  const offTab = book.tab(root, api, spec.tabTop, spec.tabSide);
  const r = reached();
  if (r > 0) {
    over = veil(root, `<h3>${spec.title}</h3><h2>Where to start</h2>${pips(r, -1)}
<div class="${L}row">${spec.stages.map((s, i) => `<button type="button" data-s="${i}" class="${i === r ? L + "go" : ""}" ${i > r ? "disabled" : ""}><b>${STAGES[i].toUpperCase()}${i > r ? " · NOT YET" : ""}</b>${s.name}</button>`).join("")}</div>`);
    over.querySelectorAll("button[data-s]").forEach((b) => b.addEventListener("click", () => start(+b.dataset.s)));
    over.querySelector(`button[data-s="${r}"]`).focus({ preventScroll: true });
  } else start(0);

  return {
    unmount() {
      dead = true; clear(); offTab();
      const bv = root.querySelector(".people-of-the-bark-pulse-veil"); if (bv) (bv._close ? bv._close() : bv.remove());
      timers.forEach(clearTimeout);
      if (cur && cur.unmount) { try { cur.unmount(); } catch (e) { console.error(e); } }
      if (chip) chip.remove();
      st.remove();
    },
  };
}

// The line a layer link shows: "Because you ... in ...". Returns a function that removes it.
export function note(root, text, secs = 9) {
  if (!root.querySelector("style[data-" + L + "n]")) { const s = document.createElement("style"); s.setAttribute("data-" + L + "n", ""); s.textContent = CSS; root.appendChild(s); }
  const n = document.createElement("div");
  n.className = L + "note"; n.setAttribute("role", "status");
  n.innerHTML = `<b>THE LAYERS TOUCH</b>${text}`;
  root.appendChild(n);
  const t1 = setTimeout(() => { n.style.opacity = "0"; }, secs * 1000);
  const t2 = setTimeout(() => n.remove(), secs * 1000 + 700);
  return () => { clearTimeout(t1); clearTimeout(t2); n.remove(); };
}

// The hidden meter (DESIGN.md 21, phase 2): 0..100, starts at 40, never shown as a number.
export function pulse(api, delta = 0) {
  const sh = api.shared || { get: (k, d) => d, set() {} };
  let p = sh.get("pulse", 40);
  if (typeof p !== "number") p = 40;
  if (delta) { p = Math.max(0, Math.min(100, p + delta)); sh.set("pulse", p); }
  return p;
}

export const cls = L;

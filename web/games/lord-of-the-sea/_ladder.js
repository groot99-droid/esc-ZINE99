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
      <div class="${P}row"><button type="button" data-n="go">Go on</button><button type="button" class="alt" data-n="stop">Stop here</button></div>`);
    v.setAttribute("aria-label", "Stage won");
    v.querySelector("[data-n=go]").addEventListener("click", () => run(i + 1));
    v.querySelector("[data-n=stop]").addEventListener("click", () => { v.remove(); layer = null; api.end(result); });
    v.querySelector("[data-n=go]").focus();
  }
  function picker() {
    const v = veil(`<div class="k">${esc(cfg.kicker)}</div><h2>${esc(cfg.title)}</h2>
      <p class="c">Three rungs. Stop after any of them and the result stands.</p>
      <div class="${P}rungs">${ORDER.map((k, i) => `<button type="button" data-i="${i}" class="${i === reached ? "here" : ""}" ${i > reached ? "disabled" : ""} aria-label="${esc(["Teach", "Test", "Twist"][i] + ": " + cfg.stages[k].name + (i > reached ? " (not reached yet)" : ""))}"><b>${["TEACH", "TEST", "TWIST"][i]}</b><span>${esc(cfg.stages[k].name)}</span><i>${esc(i > reached ? "Win the rung before it first." : cfg.stages[k].where)}</i></button>`).join("")}</div>
      ${extra && cfg.extra ? `<div class="${P}xr"><span>${esc(cfg.extra.hint)}</span><button type="button" class="${P}x" data-x="1">${esc(cfg.extra.label)}</button></div>` : ""}`);
    v.setAttribute("aria-label", cfg.title + ": choose a stage");
    v.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => run(+b.dataset.i)));
    const x = v.querySelector("[data-x]");
    if (x) x.addEventListener("click", () => { v.remove(); layer = null; host.innerHTML = ""; inner = extra(host, api) || null; });
    (v.querySelector("button.here") || v.querySelector("button")).focus();
  }
  picker();
  return { unmount() { dead = true; stopInner(); if (layer) layer.remove(); } };
}

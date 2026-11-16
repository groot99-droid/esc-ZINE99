// Shared by the seven Lira Calyx modes (phase 2): each mode is a run of three stages, teach, test and
// twist (DEEP_DIVE.md section 3). runStages() draws the stage strip, mounts one stage at a time,
// remembers the stage reached (api.store "stage"), and turns a stage's win into a pause where the
// player can stop with that result or go on. A stage gets the mode's api with three additions:
// api.stage (0..2), api.end (stage-aware) and api.linkNote(text), the short note shown when a layer
// link fires ("Because you ... in ...").
const P = "lira-calyx-stages-";
const LABELS = ["TEACH", "TEST", "TWIST"];

export function runStages(root, api, cfg) {
  const off = [];
  const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
  const c = Object.assign({ bg: "#1c1c1e", fg: "#f1e8d2", accent: "#c8913a", paper: "#f1e8d2", ink: "#3b2618" }, cfg.colors || {});
  const reached = () => Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
  let cur = null, stage = reached(), noteTimers = [];

  const style = document.createElement("style");
  style.textContent = `
    .${P}strip{position:absolute;left:0;right:0;top:0;height:34px;display:flex;align-items:stretch;gap:0;background:${c.bg};border-bottom:1.5px solid ${c.accent};z-index:9;font:700 12px 'Courier Prime',monospace;letter-spacing:.1em}
    .${P}strip button{flex:1 1 0;min-width:0;border:0;border-right:1px solid rgba(128,128,128,.4);background:transparent;color:${c.fg};font:inherit;letter-spacing:inherit;cursor:pointer;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px}
    .${P}strip button:last-child{border-right:0}
    .${P}strip button:hover:not(:disabled){opacity:1}
    .${P}strip button:focus-visible{outline:2px solid ${c.accent};outline-offset:-3px}
    .${P}strip button.on{background:${c.accent};color:${c.bg};opacity:1}
    .${P}strip button:disabled{opacity:.3;cursor:default}
    .${P}strip button small{font-weight:400;letter-spacing:.02em;margin-left:8px;opacity:.9}
    @media (max-width:560px){.${P}strip button small{display:none}}
    .${P}stage{position:absolute;left:0;right:0;top:34px;bottom:0;overflow:hidden}
    .${P}notes{position:absolute;left:50%;top:40px;transform:translateX(-50%);z-index:8;display:flex;flex-direction:column;gap:6px;width:min(560px,calc(100% - 20px));pointer-events:none}
    .${P}note{pointer-events:auto;cursor:pointer;background:${c.paper};color:${c.ink};border:1.5px solid ${c.ink};border-left:6px solid ${c.accent};padding:7px 12px;font:italic 15px/1.35 'IM Fell English',Georgia,serif;box-shadow:3px 3px 0 rgba(0,0,0,.3);text-align:left}
    .${P}note b{font:700 11px 'Courier Prime',monospace;letter-spacing:.12em;font-style:normal;display:block;opacity:.75}
    .${P}pause{position:absolute;inset:34px 0 0 0;z-index:10;display:grid;place-items:center;background:rgba(10,10,10,.72);padding:14px;overflow:auto}
    .${P}pause .in{width:min(480px,100%);background:${c.paper};color:${c.ink};border:2px solid ${c.ink};padding:16px 18px;box-shadow:5px 5px 0 rgba(0,0,0,.35)}
    .${P}pause .k{font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:${c.ink};opacity:.75}
    .${P}pause p{font:16px/1.45 Georgia,serif;margin:6px 0 14px}
    .${P}pause .row{display:flex;flex-wrap:wrap;gap:8px}
    .${P}pause button{font:700 14px 'Courier Prime',monospace;letter-spacing:.08em;min-height:44px;padding:9px 16px;cursor:pointer;border:1.5px solid ${c.ink};background:transparent;color:${c.ink}}
    .${P}pause button.go{background:${c.ink};color:${c.paper}}
    .${P}pause button:hover,.${P}pause button:focus-visible{outline:2px solid ${c.accent};outline-offset:2px}
  `;
  const strip = document.createElement("div"); strip.className = P + "strip"; strip.setAttribute("role", "group"); strip.setAttribute("aria-label", "Stages");
  const stageRoot = document.createElement("div"); stageRoot.className = P + "stage";
  const notes = document.createElement("div"); notes.className = P + "notes"; notes.setAttribute("aria-live", "polite");
  root.append(style, strip, stageRoot, notes);
  let pause = null;

  const renderStrip = () => {
    const r = reached();
    strip.innerHTML = LABELS.map((l, i) => `<button type="button" data-s="${i}" class="${i === stage ? "on" : ""}" ${i > r ? "disabled" : ""} aria-pressed="${i === stage}" title="${cfg.names[i]}">${i + 1} ${l}<small>${cfg.names[i]}</small></button>`).join("");
  };
  on(strip, "click", (e) => { const b = e.target.closest("[data-s]"); if (b && !b.disabled && +b.dataset.s !== stage) go(+b.dataset.s); });

  const closePause = () => { if (pause) { pause.remove(); pause = null; } };
  const teardown = () => {
    closePause();
    if (cur && cur.unmount) { try { cur.unmount(); } catch (e) { console.error(e); } }
    cur = null; stageRoot.innerHTML = ""; stageRoot.removeAttribute("style"); notes.innerHTML = "";
    noteTimers.forEach(clearTimeout); noteTimers = [];
  };
  const linkNote = (text) => {
    const n = document.createElement("div"); n.className = P + "note"; n.setAttribute("role", "status");
    n.innerHTML = "<b>THE LAYERS TOUCH</b>"; n.appendChild(document.createTextNode(text));
    notes.appendChild(n);
    on(n, "click", () => n.remove());
    noteTimers.push(setTimeout(() => n.remove(), 11000));
  };
  const go = (s) => {
    teardown(); stage = s; renderStrip();
    const sapi = Object.create(api);
    sapi.stage = s; sapi.linkNote = linkNote;
    sapi.end = (result = {}) => {
      if (result.outcome === "lose" || s >= 2) { api.end(result); return; }
      if (reached() < s + 1) api.store.set("stage", s + 1);
      renderStrip();
      pause = document.createElement("div"); pause.className = P + "pause";
      pause.innerHTML = `<div class="in" role="dialog" aria-label="Stage complete"><div class="k">${LABELS[s]} · ${cfg.names[s].toUpperCase()} · ${result.outcome === "win" ? "DONE" : "CLOSED"}</div><p></p>
        <div class="row"><button type="button" class="go" data-g="next">Go on: ${cfg.names[s + 1]}</button><button type="button" data-g="stop">Stop here</button></div></div>`;
      pause.querySelector("p").textContent = result.text || "Done.";
      root.appendChild(pause);
      on(pause.querySelector("[data-g=next]"), "click", () => go(s + 1));
      on(pause.querySelector("[data-g=stop]"), "click", () => { closePause(); api.end(result); });
      pause.querySelector("[data-g=next]").focus();
    };
    try { cur = cfg.mount(stageRoot, sapi, s) || null; }
    catch (e) { console.error(e); stageRoot.innerHTML = `<div class="err">This stage failed to start: ${String(e.message || e)}</div>`; }
  };
  go(stage);
  return { unmount() { teardown(); off.forEach((f) => f()); } };
}

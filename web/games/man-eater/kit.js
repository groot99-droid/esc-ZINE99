// Project: Man Eater — shared art helpers for the six modes. Not a mode: nothing routes here.
//
// The game's code-drawn art (api.art) is SVG, and much of it uses filters that are slow to rasterise.
// Every helper here rasterises an asset once, at the size it is shown, and hands back a canvas (for
// canvas modes) or a PNG object URL (for <img> and CSS backgrounds). A missing id gives null or "",
// and each mode keeps its own drawing as the fallback.

export function artKit(api) {
  const art = api.art || null;
  const has = (id) => !!(art && art.has && art.has(id));
  const info = (id) => (has(id) ? art.info(id) : null);
  const canvases = new Map(), pngs = new Map(), made = [];
  let dead = false;

  function load(url) {
    return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = url; });
  }
  // The asset as an offscreen canvas `w` pixels wide. opts.edit(doc) may change the SVG first (and
  // then needs opts.key to name the variant); opts.blur softens it once, for a cast shadow.
  function canvas(id, w, opts = {}) {
    if (!has(id)) return Promise.resolve(null);
    w = Math.max(2, Math.round(w));
    const key = `${id}@${w}${opts.key ? ":" + opts.key : ""}${opts.blur ? ":b" + opts.blur : ""}`;
    if (canvases.has(key)) return canvases.get(key);
    const p = (async () => {
      let im = null;
      if (opts.edit) {
        try {
          const doc = new DOMParser().parseFromString(art.svg(id), "image/svg+xml");
          opts.edit(doc);
          const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc)], { type: "image/svg+xml" }));
          im = await load(url);
          URL.revokeObjectURL(url);
        } catch { im = null; }
      } else im = await art.img(id);
      if (!im || dead) return null;
      const i = art.info(id), h = Math.max(2, Math.round((w * i.h) / i.w));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d");
      if (opts.blur) x.filter = `blur(${opts.blur}px)`;
      x.drawImage(im, 0, 0, w, h);
      return c;
    })();
    canvases.set(key, p);
    return p;
  }
  // The asset as a PNG object URL, `w` CSS pixels wide (rasterised at up to twice that).
  function png(id, w, opts = {}) {
    if (!has(id)) return Promise.resolve("");
    const px = Math.round(w * Math.min(2, window.devicePixelRatio || 1));
    const key = `${id}@${px}${opts.key ? ":" + opts.key : ""}`;
    if (pngs.has(key)) return pngs.get(key);
    const p = canvas(id, px, opts).then((c) => (c ? new Promise((res) => c.toBlob((b) => {
      if (!b || dead) return res("");
      const u = URL.createObjectURL(b); made.push(u); res(u);
    }, "image/png")) : ""));
    pngs.set(key, p);
    return p;
  }
  // An <img> that fills in once its asset is rasterised; it takes no room and shows nothing until then.
  function img(id, w, alt = "", cls = "") {
    const el = document.createElement("img");
    el.alt = alt; if (cls) el.className = cls;
    el.decoding = "async"; el.draggable = false;
    el.hidden = true;
    png(id, w).then((u) => { if (u && !dead) { el.src = u; el.hidden = false; } });
    return el;
  }
  // Put the asset into every element matching `sel` under `rootEl` (as <img src>, or a CSS background).
  function fill(rootEl, sel, id, w, asBackground = false) {
    return png(id, w).then((u) => {
      if (!u || dead) return false;
      rootEl.querySelectorAll(sel).forEach((el) => {
        if (asBackground) el.style.backgroundImage = `url("${u}")`;
        else { el.src = u; el.hidden = false; }
      });
      return true;
    });
  }
  // Dress a mode's opening overlay: a chapter or clock card behind the how-to card, and the title
  // lettering on the how-to card itself.
  function dressIntro(introEl, panelEl, cardId, tint = "rgba(27,29,31,.62)") {
    if (cardId) png(cardId, Math.min(1280, Math.max(640, introEl.clientWidth || 960))).then((u) => {
      if (!u || dead || !introEl.isConnected) return;
      introEl.style.background = `linear-gradient(${tint},${tint}),url("${u}") center/cover no-repeat #1B1D1F`;
    });
    if (panelEl && has("title")) {
      const t = img("title", 220, "Project: Man Eater");
      t.style.cssText = "display:block;width:min(220px,62%);height:auto;margin:0 0 10px;box-shadow:0 2px 6px rgba(0,0,0,.35)";
      panelEl.insertBefore(t, panelEl.firstChild);
    }
  }
  // The ending card: a picture and a rubber stamp shown behind the result bar, then api.end.
  // parts: { card, stamp, caption, strip } (asset ids; any may be missing).
  function endCard(hostEl, parts, result) {
    const ready = [];
    if (hostEl && (has(parts.card) || has(parts.stamp))) {
      const box = document.createElement("div");
      box.setAttribute("aria-hidden", "true");
      box.style.cssText = "position:absolute;inset:0;z-index:15;display:grid;place-items:center;background:rgba(27,29,31,.84);overflow:hidden;padding:12px 12px 150px;box-sizing:border-box";
      const fig = document.createElement("div");
      fig.style.cssText = "position:relative;width:min(100%,720px);max-height:100%;display:grid;place-items:center";
      if (has(parts.card)) {
        const i = art.info(parts.card);
        const c = img(parts.card, Math.min(720, i.w), "");
        c.style.cssText = `display:block;max-width:100%;max-height:calc(100vh - 260px);width:auto;height:auto;aspect-ratio:${i.w}/${i.h};box-shadow:0 18px 40px rgba(0,0,0,.6)`;
        fig.appendChild(c);
        ready.push(png(parts.card, Math.min(720, i.w)));
      }
      if (has(parts.stamp)) {
        const s = img(parts.stamp, 300, "");
        s.style.cssText = `position:${has(parts.card) ? "absolute" : "relative"};right:4%;bottom:6%;width:min(42%,240px);height:auto;transform:rotate(-4deg)`;
        fig.appendChild(s);
        ready.push(png(parts.stamp, 300));
      }
      box.appendChild(fig);
      if (parts.caption) {
        const cap = document.createElement("div");
        cap.textContent = parts.caption;
        cap.style.cssText = "position:absolute;left:0;right:0;top:10px;text-align:center;font:700 13px 'Courier Prime','Courier New',monospace;letter-spacing:.2em;color:#D9D2BF;padding:0 12px";
        box.appendChild(cap);
      }
      // the card covers the stage: a scrolled page goes back to its top and holds still under it
      try { hostEl.scrollTop = 0; if (getComputedStyle(hostEl).overflowY !== "visible") hostEl.style.overflow = "hidden"; } catch { /* ok */ }
      hostEl.appendChild(box);
    }
    // the result waits for the card, but never for long
    Promise.race([Promise.all(ready), new Promise((r) => setTimeout(r, 900))]).then(() => { if (!dead) api.end(result); });
  }
  return {
    has, info, canvas, png, img, fill, dressIntro, endCard,
    dispose() { dead = true; made.forEach((u) => URL.revokeObjectURL(u)); made.length = 0; canvases.clear(); pngs.clear(); },
  };
}

// Remove the baked cast shadow, floor line and flashlight cone from a halls cut-out, leaving the puppet.
export function bareCutout(doc) {
  const root = doc.documentElement;
  const wrap = [...root.children].find((n) => n.tagName === "g" && n.hasAttribute("clip-path"));
  if (wrap) wrap.remove();
  root.querySelectorAll("[fill^='url(#']").forEach((n) => { if (/cone/.test(n.getAttribute("fill"))) n.remove(); });
  const rects = [...root.children].filter((n) => n.tagName === "rect" && n.getAttribute("height") === "3");
  rects.forEach((n) => n.remove());
}

// ---- Phase 2: the three-stage ladder (teach, test, twist) and the notes that show two layers touching.
// A mode's body runs once per stage; `go(n)` (the mode's own) tears the stage down and builds stage n.
// Progress is kept in api.store ("stage": the furthest stage reached), so a returning player may
// start there. Nothing here keeps a timer past dispose().
export function ladder(api, names) {
  const timers = [];
  let dead = false;
  const reached = () => Math.max(1, Math.min(3, +api.store.get("stage", 1) || 1));
  const reach = (n) => { if (n > reached()) api.store.set("stage", Math.min(3, n)); };
  const btn = "font:inherit;font-weight:700;min-height:44px;padding:8px 12px;cursor:pointer;font-size:14px;letter-spacing:.03em;text-align:left;line-height:1.25";
  // The stage row on the opening card: stages up to the one reached may be started.
  function picker(panelEl, before, stage, go, ink = "#1B1D1F", paper = "#D9D2BF") {
    const row = document.createElement("div");
    row.setAttribute("role", "group"); row.setAttribute("aria-label", "Stage");
    row.dataset.ladder = "picker";
    row.style.cssText = "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 12px;position:relative;z-index:1";
    const top = reached();
    for (let n = 1; n <= 3; n++) {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.stage = n;
      const on = n === stage, open = n <= top;
      b.style.cssText = `${btn};border:2px solid ${ink};background:${on ? ink : "transparent"};color:${on ? paper : ink};opacity:${open ? 1 : 0.45};min-width:0`;
      b.innerHTML = `<span style="display:block;font-size:11px;letter-spacing:.14em;font-weight:400">${["TEACH", "TEST", "TWIST"][n - 1]}${open ? "" : " · LOCKED"}</span>${names[n]}`;
      b.setAttribute("aria-pressed", String(on));
      if (!open) { b.disabled = true; b.style.cursor = "not-allowed"; b.title = "Finish the stage before it first"; }
      else if (!on) b.addEventListener("click", () => go(n));
      row.appendChild(b);
    }
    panelEl.insertBefore(row, before || null);
    return row;
  }
  // The card between two stages: go on, or stop here with the result.
  function between(hostEl, o, onNext, onStop) {
    const box = document.createElement("div");
    box.dataset.ladder = "between";
    box.style.cssText = "position:absolute;inset:0;z-index:30;display:grid;place-items:center;background:rgba(27,29,31,.88);padding:16px;overflow:auto;box-sizing:border-box";
    const p = document.createElement("div");
    p.style.cssText = "width:min(560px,100%);box-sizing:border-box;background:#D9D2BF;color:#1B1D1F;padding:18px 20px;border:2px solid #1B1D1F;outline:8px solid #D9D2BF;font-family:'Courier Prime','Courier New',monospace";
    p.innerHTML = `<div style="font-size:12px;letter-spacing:.2em;border-bottom:2px solid #1B1D1F;padding-bottom:5px;margin-bottom:8px">STAGE ${o.stage} OF 3 · ${["TEACH", "TEST", "TWIST"][o.stage - 1]} · DONE</div>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.45"></p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.4;font-weight:700">Next: ${o.next}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px"><button type="button" data-ladder-next style="${btn};background:#1B1D1F;color:#D9D2BF;border:2px solid #1B1D1F">Go on</button><button type="button" data-ladder-stop style="${btn};background:transparent;color:#1B1D1F;border:2px solid #1B1D1F">Stop here</button></div>`;
    p.querySelector("p").textContent = o.text;
    box.appendChild(p);
    try { hostEl.scrollTop = 0; } catch { /* ok */ }
    hostEl.appendChild(box);
    let used = false;
    const once = (fn) => () => { if (used || dead) return; used = true; box.remove(); fn(); };
    p.querySelector("[data-ladder-next]").addEventListener("click", once(onNext));
    p.querySelector("[data-ladder-stop]").addEventListener("click", once(onStop));
    timers.push(setTimeout(() => p.querySelector("[data-ladder-next]")?.focus(), 30));
    return box;
  }
  // The end of a stage: a loss or the last stage ends the mode; otherwise the card between stages.
  function conclude(hostEl, kit, stage, parts, result, go) {
    if (result.outcome !== "lose") reach(stage + 1);
    if (result.outcome === "lose" || stage >= 3) return kit.endCard(hostEl, parts, result);
    between(hostEl, { stage, text: result.text, next: names[stage + 1] }, () => go(stage + 1), () => kit.endCard(hostEl, parts, result));
  }
  // "Because you ... in ...": one line, shown where a link between two layers fires. It takes no clicks.
  function note(hostEl, text, ms = 11000) {
    const n = document.createElement("div");
    n.dataset.ladder = "link"; n.setAttribute("role", "status");
    n.style.cssText = "position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:12;max-width:min(92%,640px);box-sizing:border-box;background:#D9A441;color:#1B1D1F;font:700 13px/1.35 'Courier Prime','Courier New',monospace;padding:7px 12px;border:2px solid #1B1D1F;box-shadow:0 6px 18px rgba(0,0,0,.45);pointer-events:none;text-align:left";
    n.textContent = "LAYERS TOUCH · " + text;
    const stack = hostEl.querySelectorAll("[data-ladder=link]").length;
    if (stack) n.style.top = 8 + stack * 58 + "px";
    hostEl.appendChild(n);
    if (ms) timers.push(setTimeout(() => n.remove(), ms));
    return n;
  }
  return { reached, reach, picker, between, conclude, note, dispose() { dead = true; timers.forEach(clearTimeout); timers.length = 0; } };
}

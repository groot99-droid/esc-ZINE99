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
  // parts: { card, stamp, caption, strip, ending } (asset ids; any may be missing). `ending` is a
  // generated ending card's key-art id (api.keyart): when there is one, it fills the stage behind.
  function endCard(hostEl, parts, result) {
    const ready = [];
    const photo = parts.ending && api.keyart ? api.keyart(parts.ending) : "";
    if (hostEl && (has(parts.card) || has(parts.stamp) || photo)) {
      const box = document.createElement("div");
      box.setAttribute("aria-hidden", "true");
      box.style.cssText = "position:absolute;inset:0;z-index:15;display:grid;place-items:center;background:rgba(27,29,31,.84);overflow:hidden;padding:12px 12px 150px;box-sizing:border-box";
      if (photo) box.style.background = `linear-gradient(rgba(27,29,31,.5),rgba(27,29,31,.86)),url("${photo}") center/cover no-repeat #1B1D1F`;
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
  // ---- Phase 3: the strips in Fisk's sock (the long puzzle, gathered across the modes), always reachable.
  // A small button on the stage opens one page: the six strips found or not, the carry, and, once the
  // Schedule is laid, the week's end and a way to begin the week again.
  const sockEls = [], keyOffs = [];
  function sock(hostEl) {
    if (!hostEl) return null;
    const wk = week(api);
    const PAPER = "#D9D2BF", INK = "#1B1D1F";
    const btn = document.createElement("button");
    btn.type = "button"; btn.dataset.sock = "open";
    // a tab on the right edge, half way down: the one place every mode leaves clear of its controls
    btn.style.cssText = `position:absolute;right:0;top:50%;transform:translateY(-50%);z-index:14;writing-mode:vertical-rl;font:700 11px/1 'Courier Prime','Courier New',monospace;letter-spacing:.12em;min-width:34px;min-height:112px;padding:10px 8px;background:${PAPER};color:${INK};border:2px solid ${INK};border-right:0;box-shadow:-3px 4px 12px rgba(0,0,0,.45);cursor:pointer;text-align:center;white-space:nowrap`;
    const label = () => { btn.textContent = `${wk.second() ? `WEEK ${wk.n()} · ` : ""}STRIPS ${wk.strips().length}/6`; btn.setAttribute("aria-label", `The Schedule strips in your sock: ${wk.strips().length} of 6${wk.second() ? `, week ${wk.n()}` : ""}. Open`); };
    label();
    hostEl.appendChild(btn); sockEls.push(btn);
    let box = null, onKey = null;
    function close() {
      if (!box) return;
      box.remove(); box = null;
      window.removeEventListener("keydown", onKey, true); onKey = null;
      label(); btn.focus();
    }
    function open() {
      if (box || dead) return;
      box = document.createElement("div");
      box.dataset.sock = "page"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "The strips in your sock");
      box.style.cssText = "position:absolute;inset:0;z-index:45;background:rgba(27,29,31,.9);overflow:auto;padding:12px;box-sizing:border-box";
      const pg = document.createElement("div");
      pg.style.cssText = `position:relative;width:min(760px,100%);margin:0 auto;box-sizing:border-box;background:#EEE9DA;color:${INK};padding:16px 16px 18px;border:2px solid ${INK};font-family:'Courier Prime','Courier New',monospace;background-size:cover;background-position:top`;
      png("ledger-page", 760).then((u) => { if (u && box) pg.style.backgroundImage = `linear-gradient(rgba(238,233,218,.9),rgba(238,233,218,.95)),url("${u}")`; });
      const got = wk.strips(), sol = wk.solved();
      const head = document.createElement("div");
      head.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12px;letter-spacing:.18em;border-bottom:2px solid ${INK};padding-bottom:6px;margin-bottom:10px"><span>THE SCHEDULE · STRIPS IN MY SOCK</span><span>${wk.second() ? `WEEK ${wk.n()} · ` : ""}${got.length} OF 6</span></div>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.4">One torn strip on each night out, one in Sam's office, one under the day-7 slab. Day 1's is in the folder. Lay them in The Chart once all six are in.</p>`;
      pg.appendChild(head);
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:8px";
      for (const d of STRIP_DAYS) {
        const cell = document.createElement("div");
        cell.dataset.strip = d; cell.dataset.found = String(got.includes(d));
        cell.style.cssText = `min-width:0;border:1.5px ${got.includes(d) ? "solid" : "dashed"} ${INK};padding:4px;background:${got.includes(d) ? "rgba(255,253,246,.7)" : "transparent"}`;
        if (got.includes(d)) {
          const im = img("schedule-strip-" + d, 300, `Day ${d}'s strip`);
          im.style.cssText = "display:block;width:100%;height:auto;aspect-ratio:800/260";
          cell.appendChild(im);
        }
        const t = document.createElement("div");
        t.style.cssText = "font-size:12px;line-height:1.35;padding:2px 4px";
        t.textContent = got.includes(d) ? `DAY ${d} · ${STRIP_FROM[d].where}` : `DAY ${d} · not found yet · ${STRIP_FROM[d].where} (${STRIP_FROM[d].mode})`;
        cell.appendChild(t);
        grid.appendChild(cell);
      }
      pg.appendChild(grid);
      const carried = !!api.shared.get("carried", false);
      const foot = document.createElement("p");
      foot.style.cssText = "margin:10px 0 0;font-size:14px;line-height:1.45";
      foot.textContent = (carried ? "Frame 112: one line of prints, every toe toward the base. No line on any strip says it. " : "The carry: not done. It is on no strip either. ")
        + (sol ? `The Schedule is laid. This week ended: ${ENDING_NAMES[sol.ending] || sol.ending}.` : wk.all() ? "All six are in. Lay them in The Chart: the folder opens from its first page." : "");
      pg.appendChild(foot);
      const acts = document.createElement("div");
      acts.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:12px";
      const b = (txt, dark) => { const x = document.createElement("button"); x.type = "button"; x.textContent = txt; x.style.cssText = `font:700 14px 'Courier Prime','Courier New',monospace;min-height:44px;padding:8px 12px;cursor:pointer;border:2px solid ${INK};background:${dark ? INK : "transparent"};color:${dark ? PAPER : INK}`; return x; };
      const shut = b("Put them back", true); shut.dataset.sock = "close";
      shut.addEventListener("click", close);
      acts.appendChild(shut);
      if (sol) {
        const again = b("Begin the week again"); again.dataset.sock = "again";
        let armed = false;
        again.addEventListener("click", () => {
          if (!armed) { armed = true; again.textContent = "Begin again: the strips, the carry and this week's marks go"; return; }
          wk.again();
          close(); open();
          if (box) { const n = document.createElement("p"); n.style.cssText = "margin:10px 0 0;font-size:14px;font-weight:700"; n.textContent = `Week ${wk.n()}. The truck, the gate, the same halls. Nothing comes with you but what you know.`; box.querySelector("[data-sock=close]").parentElement.before(n); }
        });
        acts.appendChild(again);
      }
      pg.appendChild(acts);
      box.appendChild(pg);
      box.addEventListener("click", (e) => { if (e.target === box) close(); });
      hostEl.appendChild(box); sockEls.push(box);
      // the page takes the keyboard while it is open: the mode underneath hears nothing
      onKey = (e) => { if (e.key === "Escape") { close(); e.preventDefault(); } if (e.key !== "Tab" && e.key !== "Enter" && e.key !== " ") e.stopImmediatePropagation(); };
      window.addEventListener("keydown", onKey, true); keyOffs.push(() => window.removeEventListener("keydown", onKey, true));
      shut.focus();
    }
    btn.addEventListener("click", open);
    return { open, close, refresh: label, el: btn };
  }
  // A choice on a card (the between-stage card's look): resolves with the chosen option's id.
  function ask(hostEl, title, text, options) {
    return new Promise((res) => {
      const box = document.createElement("div");
      box.dataset.ask = "card";
      box.style.cssText = "position:absolute;inset:0;z-index:31;display:grid;place-items:center;background:rgba(27,29,31,.84);padding:16px;overflow:auto;box-sizing:border-box";
      const p = document.createElement("div");
      p.style.cssText = "width:min(560px,100%);box-sizing:border-box;background:#D9D2BF;color:#1B1D1F;padding:18px 20px;border:2px solid #1B1D1F;outline:8px solid #D9D2BF;font-family:'Courier Prime','Courier New',monospace";
      const h = document.createElement("div"); h.style.cssText = "font-size:12px;letter-spacing:.2em;border-bottom:2px solid #1B1D1F;padding-bottom:5px;margin-bottom:8px"; h.textContent = title;
      const t = document.createElement("p"); t.style.cssText = "margin:0 0 12px;font-size:15px;line-height:1.45"; t.textContent = text;
      const row = document.createElement("div"); row.style.cssText = "display:flex;flex-wrap:wrap;gap:8px";
      options.forEach((o, i) => {
        const x = document.createElement("button"); x.type = "button"; x.dataset.choice = o.id; x.textContent = o.label;
        x.style.cssText = `font:700 14px 'Courier Prime','Courier New',monospace;min-height:44px;padding:8px 12px;cursor:pointer;text-align:left;border:2px solid #1B1D1F;background:${i ? "transparent" : "#1B1D1F"};color:${i ? "#1B1D1F" : "#D9D2BF"}`;
        x.addEventListener("click", () => { box.remove(); res(o.id); });
        row.appendChild(x);
      });
      p.append(h, t, row); box.appendChild(p);
      hostEl.appendChild(box); sockEls.push(box);
      setTimeout(() => row.querySelector("button")?.focus(), 30);
    });
  }
  return {
    has, info, canvas, png, img, fill, dressIntro, endCard, sock, ask,
    dispose() { dead = true; keyOffs.forEach((f) => f()); keyOffs.length = 0; sockEls.forEach((e) => e.remove()); sockEls.length = 0; made.forEach((u) => URL.revokeObjectURL(u)); made.length = 0; canvases.clear(); pngs.clear(); },
  };
}

// ---- Phase 3: the long puzzle and the week (DESIGN.md "Accepted development", phase 3).
// One torn strip of the Schedule is found on each night out (Silhouette halls nights 2 and 6, Snow line
// nights 3 and 5), one in Sam's office on night 4 (The Chart's Carbon), and one under the day-7 slab
// (The Tray). They are laid in The Chart. The carry (Snow line, night 7) is on no strip.
export const STRIP_DAYS = [2, 3, 4, 5, 6, 7];
export const STRIP_FROM = {
  2: { mode: "Silhouette halls", where: "night 2, the latrine drain" },
  3: { mode: "Snow line", where: "night 3, the kennel shed" },
  4: { mode: "The Chart", where: "night 4, Sam's office" },
  5: { mode: "Snow line", where: "night 5, the adit" },
  6: { mode: "Silhouette halls", where: "night 6, the stair" },
  7: { mode: "The Tray", where: "day 7, under the slab" },
};
export const ENDING_NAMES = { one_set_of_prints: "One Set of Prints", the_zoo: "The Zoo", rule_three: "Rule Three", call_me_sam: "Call Me Sam", transferred: "Transferred" };
// What a week clears when it begins again: everything one run wrote. The week number and the count of
// weeks finished stay; they are what the player knows.
const WEEK_KEYS = ["strips", "carried", "schedule_solved", "boots_kept", "fp_heights", "fp_void", "fp_gap", "tray", "route_photo", "hunger_under", "napkin", "bread_given", "bread_hollis", "staff_loaf"];
export function week(api) {
  const sh = api.shared;
  const n = () => Math.max(1, Math.floor(+sh.get("week", 1) || 1));
  const strips = () => { const v = sh.get("strips", null); return Array.isArray(v) ? v.filter((d) => STRIP_DAYS.includes(d)) : []; };
  const has = (d) => strips().includes(d);
  // returns true the first time a strip is found this week
  const find = (d) => { if (has(d)) return false; sh.set("strips", [...strips(), d].sort((a, b) => a - b)); return true; };
  const all = () => STRIP_DAYS.every(has);
  const solved = () => { const v = sh.get("schedule_solved", null); return v && v.week === n() ? v : null; };
  const solve = (way, ending) => { if (solved()) return; sh.set("schedule_solved", { week: n(), way, ending }); sh.set("weeks_done", (+sh.get("weeks_done", 0) || 0) + 1); };
  const again = () => { WEEK_KEYS.forEach((k) => sh.set(k, null)); sh.set("week", n() + 1); };
  return { n, strips, has, find, all, solved, solve, again, second: () => n() >= 2 };
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

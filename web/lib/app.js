// esc-ZINE99 shell: the hub, the routes, each game's loading screen, its menu, and the play frame.
//
// Routes (hash): ''            the hub
//                #<slug>       the game's loading screen, then its menu
//                #<slug>--<key> the loading screen, then that 2D mode or 1D game
//
// A game folder holds loading.js (the loading screen and the game's look) and one module per mode,
// <key>.js, exporting default { mount(root, api) } that returns { unmount() }. See docs/WEB.md.
import catalog from "../data/catalog.js";

const $ = (id) => document.getElementById(id);
const hub = $("hub"), stage = $("stage"), view = $("view"), crumb = $("crumb");
const backBtn = $("back"), restartBtn = $("restart");
const MIN_LOAD_MS = 2200;
let current = null;      // { unmount } of the mounted mode
let loadingCache = {};   // slug -> loading module
let fontsLoaded = {};

const store = {
  get(k, d) { try { const v = localStorage.getItem("ez99:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ez99:" + k, JSON.stringify(v)); } catch { /* storage off */ } },
};

function seededRng(seed) {
  let s = (typeof seed === "number" ? seed : [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

function renderHub() {
  const sheet = $("sheet");
  sheet.innerHTML = "";
  catalog.games.forEach((g, i) => {
    const a = document.createElement("a");
    a.className = "cover";
    a.href = "#" + g.slug;
    const m = g.minutes ? `${g.minutes.min}–${g.minutes.max} min` : "";
    const p = g.players && g.players.max > 1 ? `${g.players.min}–${g.players.max} players` : "1 player";
    a.innerHTML = `<div class="frame"><img alt="" loading="lazy" src="${(g.keyart && g.keyart["key-art-wide"]) || g.cover || g.stills[0]}"><span class="no">${String(i + 1).padStart(2, "0")}</span>${store.get("thread:" + g.slug, false) ? '<span class="stamp">thread found</span>' : ""}</div>
      <h2></h2><div class="facts"><span>${m}</span><span>${p}</span><span>Verb <b></b></span><span>${g.modes.length} playable</span></div>`;
    a.querySelector("h2").textContent = g.title;
    a.querySelector("b").textContent = (g.verb || "").toLowerCase();
    sheet.appendChild(a);
  });
}

async function loadingFor(game) {
  if (!loadingCache[game.slug]) {
    try { loadingCache[game.slug] = await import("../" + game.loading); }
    catch (e) { console.warn("no loading screen for", game.slug, e); loadingCache[game.slug] = { meta: {}, render: null }; }
  }
  return loadingCache[game.slug];
}

function applyLook(meta) {
  const p = meta.palette || {};
  stage.style.setProperty("--g-bg", p.bg || "#0d0d0f");
  stage.style.setProperty("--g-fg", p.fg || "#f2f2ee");
  stage.style.setProperty("--g-accent", p.accent || "#e5337a");
  if (meta.fonts && !fontsLoaded[meta.fonts]) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?" + meta.fonts + "&display=swap";
    document.head.appendChild(l);
    fontsLoaded[meta.fonts] = true;
  }
  stage.style.setProperty("--g-display", meta.display || "var(--display)");
  stage.style.setProperty("--g-body", meta.body || "var(--body)");
}

function stop() {
  if (current && current.unmount) { try { current.unmount(); } catch (e) { console.error(e); } }
  current = null;
  view.innerHTML = "";
  restartBtn.hidden = true;
}

// Show the game's loading screen while `work` (a promise) runs, for at least MIN_LOAD_MS.
async function withLoading(game, mod, work, label) {
  const el = document.createElement("div");
  el.className = "loader";
  view.appendChild(el);
  let handle = null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (mod.render) {
    try { handle = mod.render(el, { title: game.title, label, still: game.cover || game.stills[0], stills: game.stills, reducedMotion: reduce }); }
    catch (e) { console.error("loading screen failed", e); }
  } else {
    el.innerHTML = `<div class="err">Loading ${game.title}…</div>`;
  }
  const t0 = performance.now();
  let done = false, p = 0;
  const tick = () => {
    if (done) return;
    const t = (performance.now() - t0) / MIN_LOAD_MS;
    p = Math.min(0.95, Math.max(p, t * 0.95));
    handle && handle.progress && handle.progress(p);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const [result] = await Promise.all([work, new Promise((r) => setTimeout(r, reduce ? 300 : MIN_LOAD_MS))]);
  done = true;
  handle && handle.progress && handle.progress(1);
  await new Promise((r) => setTimeout(r, reduce ? 0 : 280));
  handle && handle.close && handle.close();
  el.remove();
  return result;
}

function menu(game, meta) {
  const m = document.createElement("div");
  m.className = "menu";
  m.innerHTML = `<h1></h1><p class="sub"></p><div class="modes"></div>`;
  m.querySelector("h1").textContent = game.title;
  m.querySelector(".sub").textContent = meta.menuIntro || "The 2D modes and 1D games of this game. The 3D scenes are built in Blender.";
  const wrap = m.querySelector(".modes");
  const best = store.get("done:" + game.slug, {});
  for (const mode of game.modes) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mode";
    b.innerHTML = `<img alt="" loading="lazy" src="${mode.pictograph}"><span class="t"></span><span class="s"></span>`;
    b.querySelector(".t").textContent = mode.name;
    b.querySelector(".s").textContent = `${mode.layer.toUpperCase()} · ${mode.style}${best[mode.key] ? " · played" : ""}`;
    b.addEventListener("click", () => { location.hash = game.slug + "--" + mode.key; });
    wrap.appendChild(b);
  }
  // The finale: a loading module may export finale({shared, done, keyart}) and return null, or
  // { title, text, image } once the game's long puzzle is paid off across its modes.
  const lm = loadingCache[game.slug];
  if (lm && typeof lm.finale === "function") {
    let f = null;
    try {
      f = lm.finale({ done: best, keyart: (id) => (game.keyart && game.keyart[id]) || "",
        shared: { get: (k, d) => store.get(`${game.slug}/_shared/${k}`, d), set: (k, v) => store.set(`${game.slug}/_shared/${k}`, v) } });
    } catch (e) { console.warn("finale failed", e); }
    if (f && f.title) {
      const box = document.createElement("section");
      box.className = "finale";
      if (f.image) { const im = document.createElement("img"); im.alt = ""; im.src = f.image; box.appendChild(im); }
      const h = document.createElement("h2"); h.textContent = f.title;
      const p = document.createElement("p"); p.textContent = f.text || "";
      box.append(h, p);
      m.insertBefore(box, wrap);
    }
  }
  if (game.endings && game.endings.length) {
    const d = document.createElement("details");
    d.className = "endings";
    const s = document.createElement("summary");
    s.textContent = `How it can end (${game.endings.length} endings, spoilers)`;
    d.appendChild(s);
    const grid = document.createElement("div");
    grid.className = "ends";
    for (const e of game.endings) {
      const c = document.createElement("figure");
      if (e.image) { const im = document.createElement("img"); im.alt = ""; im.loading = "lazy"; im.src = e.image; c.appendChild(im); }
      const cap = document.createElement("figcaption");
      const b = document.createElement("b"); b.textContent = e.name;
      cap.appendChild(b);
      if (e.as_written) { const t = document.createElement("span"); t.className = "tag"; t.textContent = "as written"; cap.appendChild(t); }
      const p = document.createElement("p"); p.textContent = e.cost ? `${e.summary} Cost: ${e.cost}` : e.summary;
      cap.appendChild(p);
      c.appendChild(cap);
      grid.appendChild(c);
    }
    d.appendChild(grid);
    m.appendChild(d);
  }
  return m;
}

// A game's code-drawn art (games/<slug>/art/, bundled by tools/web/build.py into one JSON file).
const artCache = {};
async function loadArt(game) {
  if (artCache[game.slug]) return artCache[game.slug];
  let data = {};
  if (game.art) {
    try { data = await (await fetch(game.art)).json(); }
    catch (e) { console.warn("no art for", game.slug, e); }
  }
  const urls = {};
  const imgs = {};
  const art = {
    has: (id) => id in data,
    info: (id) => (data[id] ? { id, group: data[id].g, w: data[id].w, h: data[id].h, title: data[id].t } : null),
    list: (group) => Object.keys(data).filter((id) => !group || data[id].g === group),
    svg: (id) => (data[id] ? data[id].s : ""),
    url(id) {
      if (!data[id]) return "";
      return urls[id] || (urls[id] = URL.createObjectURL(new Blob([data[id].s], { type: "image/svg+xml" })));
    },
    // A decoded <img>, for canvas drawing. Resolves to null for an unknown id.
    img(id) {
      if (!data[id]) return Promise.resolve(null);
      return imgs[id] || (imgs[id] = new Promise((res) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => res(null);
        im.src = art.url(id);
      }));
    },
  };
  return (artCache[game.slug] = art);
}

async function playMode(game, mode, modModule, meta) {
  stop();
  const root = document.createElement("div");
  root.className = "play";
  view.appendChild(root);
  crumb.textContent = `${game.title} / ${mode.name} · ${mode.layer.toUpperCase()} · ${mode.style}`;
  restartBtn.hidden = false;
  const api = {
    game: game.slug, key: mode.key, title: mode.name, style: mode.style, layer: mode.layer,
    palette: meta.palette || {},
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    rng: (seed) => seededRng(seed ?? `${game.slug}/${mode.key}/${Date.now()}`),
    store: { get: (k, d) => store.get(`${game.slug}/${mode.key}/${k}`, d), set: (k, v) => store.set(`${game.slug}/${mode.key}/${k}`, v) },
    asset: (p) => p,
    // per-game storage, shared by all of the game's modes (layer links); `store` above is per mode
    shared: { get: (k, d) => store.get(`${game.slug}/_shared/${k}`, d), set: (k, v) => store.set(`${game.slug}/_shared/${k}`, v) },
    // generated key art and ending cards: keyart("ending-...") gives a path, or "" when there is none
    keyart: (id) => (game.keyart && game.keyart[id]) || "",
    // the collection thread: the object this game hides for another game (docs/DEEP_DIVE.md section 4)
    thread: { found() { store.set("thread:" + game.slug, true); }, isFound: () => !!store.get("thread:" + game.slug, false) },
    art: await loadArt(game),
    end(result = {}) {
      const done = store.get("done:" + game.slug, {});
      done[mode.key] = true;
      store.set("done:" + game.slug, done);
      const box = document.createElement("div");
      box.className = "ending";
      const msg = document.createElement("p");
      msg.textContent = result.text || (result.outcome === "win" ? "Solved." : result.outcome === "lose" ? "Not this time." : "Done.");
      const again = document.createElement("button"); again.type = "button"; again.textContent = "Play again";
      again.addEventListener("click", () => playMode(game, mode, modModule, meta));
      const out = document.createElement("button"); out.type = "button"; out.textContent = "Back to " + game.title;
      out.addEventListener("click", () => { location.hash = game.slug; });
      box.append(msg, again, out);
      root.appendChild(box);
      again.focus();
    },
  };
  try {
    current = modModule.default.mount(root, api) || null;
  } catch (e) {
    console.error(e);
    root.innerHTML = `<div class="err">This mode failed to start: ${String(e.message || e)}</div>`;
  }
  restartBtn.onclick = () => playMode(game, mode, modModule, meta);
}

async function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  stop();
  if (!h) {
    stage.hidden = true;
    hub.hidden = false;
    renderHub();
    renderThreads();
    document.title = "esc-ZINE99";
    return;
  }
  const [slug, key] = h.split("--");
  const game = catalog.games.find((g) => g.slug === slug);
  if (!game) { location.hash = ""; return; }
  hub.hidden = true;
  stage.hidden = false;
  const mod = await loadingFor(game);
  const meta = mod.meta || {};
  if (meta.cover) game.cover = meta.cover;
  applyLook(meta);
  backBtn.onclick = () => { location.hash = key ? slug : ""; };
  backBtn.textContent = key ? "Menu" : "All games";
  if (!key) {
    crumb.textContent = game.title;
    await withLoading(game, mod, Promise.resolve(), "Loading");
    if (decodeURIComponent(location.hash.slice(1)) !== h) return;
    view.appendChild(menu(game, meta));
    return;
  }
  const mode = game.modes.find((m) => m.key === key);
  if (!mode) { location.hash = slug; return; }
  crumb.textContent = `${game.title} / ${mode.name}`;
  let modModule;
  try {
    [modModule] = await withLoading(game, mod, Promise.all([import("../" + mode.module), loadArt(game)]), mode.name);
  } catch (e) {
    console.error(e);
    view.innerHTML = `<div class="err">${mode.name} is not built yet.</div>`;
    return;
  }
  if (decodeURIComponent(location.hash.slice(1)) !== h) return;
  playMode(game, mode, modModule, meta);
}

// Warm the hub covers with each game's chosen cover still, when its loading module names one.
async function warmCovers() {
  for (const g of catalog.games) {
    const mod = await loadingFor(g);
    if (mod.meta && mod.meta.cover) g.cover = mod.meta.cover;
  }
  renderHub();
}

// The collection thread on the hub: ten slots, and the eleventh page when all ten are found.
let threadData = null;
async function renderThreads() {
  const box = $("threads");
  if (!box) return;
  if (!threadData) {
    try { threadData = await (await fetch("assets/threads.json")).json(); } catch { threadData = {}; }
  }
  const slugs = catalog.games.map((g) => g.slug).filter((s) => threadData[s]);
  const found = slugs.filter((s) => store.get("thread:" + s, false));
  const img = (svg, alt) => {
    const im = document.createElement("img");
    im.alt = alt;
    im.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    return im;
  };
  box.innerHTML = "";
  const all = slugs.length > 0 && found.length === slugs.length;
  const h = document.createElement("h2");
  h.textContent = all ? "The eleventh page" : "Threads";
  const p = document.createElement("p");
  p.textContent = all
    ? "Ten things, each carried out of its own game and left in another. Here they are on one table."
    : `Each game hides one small thing that belongs to another. Found ${found.length} of ${slugs.length}.`;
  const row = document.createElement("div");
  row.className = all ? "table" : "slots";
  slugs.forEach((s, i) => {
    const d = document.createElement("div");
    const t = threadData[s];
    if (all && t.own) {
      d.className = "thing";
      d.style.setProperty("--r", ((i * 37) % 9 - 4) + "deg");
      d.appendChild(img(t.own.svg, t.own.title));
    } else if (found.includes(s) && t.guest) {
      d.className = "slot got";
      d.appendChild(img(t.guest.svg, t.guest.title));
    } else {
      d.className = "slot";
      d.textContent = String(i + 1).padStart(2, "0");
    }
    row.appendChild(d);
  });
  box.append(h, p, row);
}

renderHub();
renderThreads();
warmCovers();
addEventListener("hashchange", route);
route();

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
    a.innerHTML = `<div class="frame"><img alt="" loading="lazy" src="${g.cover || g.stills[0]}"><span class="no">${String(i + 1).padStart(2, "0")}</span></div>
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
  return m;
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
    modModule = await withLoading(game, mod, import("../" + mode.module), mode.name);
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

renderHub();
warmCovers();
addEventListener("hashchange", route);
route();

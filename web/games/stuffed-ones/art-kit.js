// The Stuffed Ones: what the six modes share for drawing with the game's code-drawn art (api.art).
//
// Not a mode. Every picture is rasterised once into an offscreen canvas at the size it is drawn,
// because the SVGs carry filters and are slow to paint each frame. Everything here returns null or
// false when an id is missing, so a mode keeps its own drawing as the fallback.
export function artKit(api) {
  const none = { has: () => false, info: () => null, img: () => Promise.resolve(null), url: () => "", list: () => [] };
  const art = api.art || none;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cache = new Map();
  let alive = true;

  function paint(im, id, w, h, opt) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    const x = c.getContext("2d"); x.scale(dpr, dpr);
    const inf = art.info(id), s = (opt && opt.src) || [0, 0, inf.w, inf.h];
    if (opt && opt.round) { x.beginPath(); x.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, 7); x.clip(); }
    if (opt && opt.cover) {
      const k = Math.max(w / s[2], h / s[3]), dw = s[2] * k, dh = s[3] * k;
      x.drawImage(im, s[0], s[1], s[2], s[3], (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else x.drawImage(im, s[0], s[1], s[2], s[3], 0, 0, w, h);
    if (opt && opt.after) opt.after(x, w, h);
    return c;
  }
  // An offscreen canvas of w x h CSS px holding the asset (or the part of it in opt.src), or null
  // while it is still decoding and when the id is unknown. opt.key tells two crops of one id apart.
  function sprite(id, w, h, opt) {
    if (!art.has(id) || !(w >= 1) || !(h >= 1)) return null;
    w = Math.round(w); h = Math.round(h);
    const key = `${id}|${w}|${h}|${(opt && opt.key) || ""}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit === 0 ? null : hit;
    cache.set(key, 0);
    art.img(id).then((im) => {
      if (!alive || !cache.has(key)) return;
      try { cache.set(key, im ? paint(im, id, w, h, opt) : null); } catch { cache.set(key, null); }
      if (opt && opt.ready) opt.ready();
    });
    return null;
  }
  // Draw it if it is ready; say whether it was drawn.
  function draw(g, id, x, y, w, h, opt) {
    const c = sprite(id, w, h, opt);
    if (!c) return false;
    g.drawImage(c, x, y, w, h);
    return true;
  }
  // A <canvas> element showing the asset at cssW wide (height by its aspect, or opt.h with cover).
  function picture(id, cssW, opt) {
    if (!art.has(id)) return null;
    const inf = art.info(id), s = (opt && opt.src) || [0, 0, inf.w, inf.h];
    const cssH = (opt && opt.h) || Math.round(cssW * s[3] / s[2]);
    const el = document.createElement("canvas");
    el.width = Math.round(cssW * dpr); el.height = Math.round(cssH * dpr);
    el.style.cssText = `width:${cssW}px;height:${cssH}px;max-width:100%;display:block`;
    el.setAttribute("role", "img"); el.setAttribute("aria-label", (opt && opt.alt) || inf.title || "");
    art.img(id).then((im) => { if (!alive || !im) return; try { el.getContext("2d").drawImage(paint(im, id, cssW, cssH, opt), 0, 0); } catch { /* keep it blank */ } });
    return el;
  }
  // A word in the cross-stitch alphabet: one canvas per word, each letter its sampler tile.
  function word(text, tileH) {
    const letters = text.toLowerCase().replace(/[^a-z ]/g, "");
    if (![...letters].every((ch) => ch === " " || art.has("letter-" + ch))) return null;
    const box = document.createElement("div");
    box.style.cssText = "display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center";
    box.setAttribute("role", "img"); box.setAttribute("aria-label", text);
    const tw = Math.round(tileH * 0.8);
    letters.split(" ").filter(Boolean).forEach((wd) => {
      const el = document.createElement("canvas");
      el.width = Math.round(tw * wd.length * dpr); el.height = Math.round(tileH * dpr);
      el.style.cssText = `width:${tw * wd.length}px;height:${tileH}px;max-width:100%;display:block;box-shadow:1px 2px 0 rgba(0,0,0,.3)`;
      const x = el.getContext("2d");
      [...wd].forEach((ch, i) => art.img("letter-" + ch).then((im) => { if (alive && im) x.drawImage(im, i * tw * dpr, 0, tw * dpr, tileH * dpr); }));
      box.appendChild(el);
    });
    return box;
  }
  // A picture laid over the whole mode before api.end: an ending or chapter card behind the result.
  function finale(root, id, ms) {
    return new Promise((res) => {
      const p = art.has(id) ? picture(id, Math.max(200, root.clientWidth), { h: Math.max(200, root.clientHeight), cover: true }) : null;
      if (!p) { res(); return; }
      p.style.cssText += ";position:absolute;inset:0;width:100%;height:100%;z-index:6;opacity:0;transition:opacity .6s";
      root.appendChild(p);
      requestAnimationFrame(() => { p.style.opacity = "1"; });
      setTimeout(() => { if (alive) res(); }, api.reducedMotion ? 250 : ms || 1500);
    });
  }
  // An ending's generated card (a path from api.keyart, or "") laid over the mode before api.end, with
  // its cross-stitch name across the foot. With no card it falls back to the code-drawn picture.
  function card(root, src, titleId, fallbackId, ms) {
    if (!src) return finale(root, fallbackId, ms);
    return new Promise((res) => {
      const box = document.createElement("div");
      box.style.cssText = "position:absolute;inset:0;z-index:6;opacity:0;transition:opacity .6s;background:#1d1712 center/cover no-repeat";
      box.style.backgroundImage = `url("${src}")`;
      box.setAttribute("role", "img"); box.setAttribute("aria-label", (art.info(titleId) || {}).title || "An ending");
      const t = art.has(titleId) ? picture(titleId, Math.max(200, Math.min(560, root.clientWidth - 32))) : null;
      if (t) { t.style.cssText += ";position:absolute;left:50%;top:16px;transform:translateX(-50%);box-shadow:0 6px 18px rgba(0,0,0,.5)"; box.appendChild(t); }
      root.appendChild(box);
      requestAnimationFrame(() => { box.style.opacity = "1"; });
      setTimeout(() => { if (alive) res(); }, api.reducedMotion ? 250 : ms || 1800);
    });
  }
  return { art, has: (id) => art.has(id), sprite, draw, picture, word, finale, card,
    flush() { cache.clear(); }, dispose() { alive = false; cache.clear(); } };
}

// The felt face of a medallion without its mount and name tag, as a round token.
export const FACE = { src: [70, 66, 220, 220], round: true, key: "face" };
// A button peg without its felt ground and name tag.
export const PEG = { src: [26, 22, 148, 148], round: true, key: "peg" };
// A memory patch without its ribbon, for a slot hollow.
export const PATCH = { src: [22, 8, 196, 196], round: true, key: "patch" };

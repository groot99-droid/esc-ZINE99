// People of the Bark — shared helpers for wiring the code-drawn art (api.art) into the modes.
// Not a mode: the catalog never lists it. Every helper returns null or "" when an id is missing, so
// a mode that calls it keeps its own drawing as the fallback.

const A = "people-of-the-bark-art-";

// An offscreen canvas holding art `id` drawn once at w x h (device pixels). `crop` is [sx, sy, sw, sh]
// in the asset's own units. Many of these SVGs carry filters, so nothing should rasterise them per frame.
export async function raster(art, id, w, h, crop) {
  if (!art || !art.has(id)) return null;
  const im = await art.img(id);
  if (!im) return null;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  const g = c.getContext("2d");
  try {
    if (crop) {
      // draw the whole asset scaled so the crop fills the canvas (drawImage's source rect is unreliable for SVG)
      const info = art.info(id), kx = c.width / crop[2], ky = c.height / crop[3];
      g.drawImage(im, -crop[0] * kx, -crop[1] * ky, info.w * kx, info.h * ky);
    } else g.drawImage(im, 0, 0, c.width, c.height);
  } catch { return null; }
  return c;
}

// A pixel-art sprite sheet (art/src/30_crack_runner.py) read back at its native resolution: the SVG is
// drawn at `scale` px a cell, the centre of each block is sampled, and the sheet's ground colour is keyed
// out. Returns { frame(n) } giving a cw x (ch - foot) canvas per cell, or null.
export async function pixelSheet(art, id, { cols, rows, cw, ch, scale, foot = 6, key = [42, 28, 20] }) {
  if (!art || !art.has(id)) return null;
  const big = await raster(art, id, cols * cw * scale, rows * ch * scale);
  if (!big) return null;
  let src;
  try { src = big.getContext("2d").getImageData(0, 0, big.width, big.height); } catch { return null; }
  const frames = [];
  for (let n = 0; n < cols * rows; n++) {
    const c = document.createElement("canvas");
    c.width = cw - 1; c.height = ch - foot - 1;
    const g = c.getContext("2d"), out = g.createImageData(c.width, c.height);
    const ox = (n % cols) * cw + 1, oy = Math.floor(n / cols) * ch + 1;   // skip the cell's grid line
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const sx = (ox + x) * scale + (scale >> 1), sy = (oy + y) * scale + (scale >> 1), k = (sy * src.width + sx) * 4;
      const r = src.data[k], gg = src.data[k + 1], b = src.data[k + 2];
      const isKey = Math.abs(r - key[0]) <= 1 && Math.abs(gg - key[1]) <= 1 && Math.abs(b - key[2]) <= 1;
      const o = (y * c.width + x) * 4;
      out.data[o] = r; out.data[o + 1] = gg; out.data[o + 2] = b; out.data[o + 3] = isKey ? 0 : 255;
    }
    g.putImageData(out, 0, 0);
    frames.push(c);
  }
  return { frame: (n) => frames[n] || null, count: frames.length };
}

// Turn a light-on-dark crop (the smoked-paper sheets) into light-on-nothing: alpha follows brightness.
export function lumaAlpha(c, floor = 70, gain = 2.2) {
  if (!c) return null;
  try {
    const g = c.getContext("2d"), im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const m = Math.max(d[i], d[i + 1], d[i + 2]);
      d[i + 3] = Math.max(0, Math.min(255, (m - floor) * gain));
    }
    g.putImageData(im, 0, 0);
  } catch { return null; }
  return c;
}

// A blob URL for a canvas (for <image href> inside an SVG that is rebuilt often). Revoke it on unmount.
export function blobUrl(c) {
  return new Promise((res) => { if (!c) return res(""); try { c.toBlob((b) => res(b ? URL.createObjectURL(b) : "")); } catch { res(""); } });
}

// The shared stylesheet for cards, marks and plates. Call once per mount; returns the <style> node.
export function styles(root) {
  const st = document.createElement("style");
  st.textContent = `
.${A}mark{width:44px;height:44px;border-radius:50%;flex:none;display:block;box-shadow:0 1px 0 rgba(0,0,0,.35)}
.${A}chap{position:relative;display:block;width:100%;aspect-ratio:16/9;background-size:cover;background-position:50% 50%;border-radius:3px;box-shadow:0 2px 0 rgba(0,0,0,.4)}
.${A}chap.${A}slim{aspect-ratio:16/5;background-position:50% 28%}
.${A}title{display:block;width:min(100%,360px);height:auto;margin:0 auto 6px}
.${A}div{display:block;width:min(100%,300px);height:auto;margin:6px auto;opacity:.9}
.${A}end{position:absolute;inset:0;z-index:10;display:grid;place-items:center;background:rgba(14,9,6,.86);padding:12px 12px 110px;box-sizing:border-box;opacity:0;transition:opacity .5s}
.${A}end.${A}on{opacity:1}
.${A}end figure{margin:0;max-width:min(880px,100%);width:100%}
.${A}end img{display:block;width:100%;height:auto;max-height:calc(100vh - 260px);object-fit:contain;border:1px solid #7a5a40;box-shadow:0 10px 40px rgba(0,0,0,.6);background:#1b120c}
.${A}end figcaption{font:italic 17px/1.35 'Cormorant Garamond',Georgia,serif;color:#efe2c4;text-align:center;margin-top:8px;text-shadow:0 1px 4px #000}
.${A}end figcaption b{display:block;font:400 12px ui-monospace,monospace;letter-spacing:.2em;color:#f0c050;font-style:normal;margin-bottom:2px}
@media (max-width:560px){.${A}end{padding-bottom:190px}.${A}mark{width:38px;height:38px}}
@media (prefers-reduced-motion:reduce){.${A}end{transition:none}}`;
  root.appendChild(st);
  return st;
}

// <img> markup for a cast mark (figures/mark-*.svg), or "" when it is missing.
export function mark(art, who, alt = "") {
  const id = "mark-" + who;
  return art && art.has(id) ? `<img class="${A}mark" src="${art.url(id)}" alt="${alt}" width="44" height="44">` : "";
}

// A chapter card (chapters/*.svg) as a banner for a mode's opening or between phases, or "".
export function chapter(art, id, slim = true) {
  return art && art.has(id) ? `<span class="${A}chap${slim ? " " + A + "slim" : ""}" role="img" aria-label="${(art.info(id).title || "").replace(/"/g, "")}" style="background-image:url(${art.url(id)})"></span>` : "";
}

// The carved title lettering, or "".
export function title(art) {
  return art && art.has("title-lettering") ? `<img class="${A}title" src="${art.url("title-lettering")}" alt="People of the Bark" width="360" height="112">` : "";
}

// The Long Crack divider ornament, or "".
export function divider(art) {
  return art && art.has("ui-divider") ? `<img class="${A}div" src="${art.url("ui-divider")}" alt="" width="300" height="60">` : "";
}

// Show a card (an ending diptych, a chapter card, a plate) over the play, then hand the result to api.end.
// Returns the overlay node (or null when the art is missing; api.end is still called).
// Phase 3: `keyartId` names a generated ending card (api.keyart); when there is one it is shown in place of the
// code-drawn card, which stays the fallback when the path is "".
export function endCard(root, api, id, result, caption, keyartId) {
  let el = null;
  const ka = keyartId && api.keyart ? api.keyart(keyartId) : "";
  if (ka || (api.art && api.art.has(id))) {
    el = document.createElement("div");
    el.className = A + "end";
    const info = ka ? { title: "", w: 1600, h: 900 } : api.art.info(id);
    el.innerHTML = `<figure><img src="${ka || api.art.url(id)}" alt="${(info.title || "").replace(/"/g, "")}" width="${info.w}" height="${info.h}"${ka ? ` data-keyart="${keyartId}"` : ""}>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add(A + "on"));
  }
  api.end(result);
  return el;
}

export const cls = A;

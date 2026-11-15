// The Lord of the Sea: how the modes take the game's code-drawn art (games/lord-of-the-sea/art/) from api.art.
// Every helper gives back nothing ("" or null) when an id is missing, so a mode keeps its old drawing then.

// An <img> for DOM use. `extra` is raw attributes (class, style, alt comes first).
export function pic(art, id, alt = "", extra = "") {
  if (!art || !art.has(id)) return "";
  return `<img src="${art.url(id)}" alt="${alt.replace(/"/g, "&quot;")}" draggable="false" ${extra}>`;
}

// A CSS url() for a background, or "none".
export const bg = (art, id) => (art && art.has(id) ? `url('${art.url(id)}')` : "none");

// Tattoo-flash die cards are 260x300 with a frame and a banner; a die on the table is only the die. This is the
// CSS that crops a square element to the die itself (48,42 to 226,220 of the card).
export function dieCrop(art, face) {
  const id = ["", "die-face-1-gull", "die-face-2-shell", "die-face-3-rope", "die-face-4-bottle", "die-face-5-lantern", "die-face-6-wave"][face];
  if (!art || !art.has(id)) return "";
  return `background-image:url('${art.url(id)}');background-size:146.07% auto;background-position:58.5% 34.4%;background-repeat:no-repeat;`;
}
// The horn cup card cropped to a square round the cup (14,8 to 246,240); shown as a round token.
export function cupCrop(art) {
  if (!art || !art.has("horn-cup")) return "";
  return `background-image:url('${art.url("horn-cup")}');background-size:112% auto;background-position:50% 12%;background-repeat:no-repeat;`;
}
// A porcelain piece tile (240x240) cropped to the piece (46,52 to 194,200).
export function pieceCrop(art, id) {
  if (!art || !art.has(id)) return "";
  return `background-image:url('${art.url(id)}');background-size:162% auto;background-position:50% 56%;background-repeat:no-repeat;`;
}

// One image rasterised once into an offscreen canvas at the size it is drawn (many of these SVGs carry
// filters and are slow to rasterise every frame). `src` crops the source in its own units; `key` turns
// near-black into transparency (for the dark specimen plates); `round` clips to a circle.
export async function raster(art, id, w, h, opts = {}) {
  if (!art || !art.has(id)) return null;
  const im = await art.img(id);
  if (!im) return null;
  const info = art.info(id);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  const g = c.getContext("2d");
  if (opts.round) { g.beginPath(); g.arc(c.width / 2, c.height / 2, Math.min(c.width, c.height) / 2, 0, 7); g.clip(); }
  try {
    if (opts.src) {
      // crop by drawing the whole image scaled so that the source rectangle fills the canvas
      const [sx, sy, sw, sh] = opts.src, kx = c.width / sw, ky = c.height / sh;
      g.drawImage(im, -sx * kx, -sy * ky, info.w * kx, info.h * ky);
    } else g.drawImage(im, 0, 0, c.width, c.height);
    if (opts.key) {
      const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const m = Math.max(p[i], p[i + 1], p[i + 2]); p[i + 3] = m < 34 ? 0 : Math.min(255, (m - 34) * 2.2); }
      g.putImageData(d, 0, 0);
    }
  } catch { /* a tainted canvas keeps the picture as drawn */ }
  return c;
}

// An ending card: the art laid behind the result that api.end() adds. Call it just before api.end.
export function endCard(root, art, id, caption = "", tone = "#12203a", titleId = "") {
  if (!art || !art.has(id)) return;
  const d = document.createElement("div");
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = `position:absolute;inset:0;z-index:15;display:grid;place-items:center;align-content:center;gap:10px;padding:16px 16px clamp(150px,30vh,250px);box-sizing:border-box;background:${tone}e6;animation:lots-card .6s both;`;
  d.innerHTML = `<style>@keyframes lots-card{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion: reduce){[data-lots-card]{animation:none!important}}</style>
    <img src="${art.url(id)}" alt="" style="max-width:min(760px,100%);max-height:100%;min-height:0;object-fit:contain;box-shadow:0 14px 40px rgba(0,0,0,.55);border:1px solid rgba(244,241,232,.5)">
    ${caption ? `<div style="font-family:'IM Fell English SC',Georgia,serif;letter-spacing:.16em;font-size:14px;color:#F4F1E8;text-align:center">${caption}</div>` : ""}
    ${titleId && art.has(titleId) ? `<img src="${art.url(titleId)}" alt="" style="width:min(300px,70%);height:auto;border:1px solid rgba(244,241,232,.5)">` : ""}`;
  d.dataset.lotsCard = "1";
  root.appendChild(d);
}

// The strip of a chapter plate that opens a how-to card.
export function chapterStrip(art, n, alt) {
  const id = "chapter-0" + n;
  if (!art || !art.has(id)) return "";
  return `<img src="${art.url(id)}" alt="${alt}" draggable="false" style="display:block;width:100%;height:clamp(84px,17vh,132px);object-fit:cover;object-position:50% 34%;border:1px solid rgba(0,0,0,.45);margin:0 0 10px;box-sizing:border-box">`;
}

// A circle gesture on an element: calls back with +1 for each clockwise full turn and -1 for each counter-clockwise.
export function circleGesture(el, onTurn) {
  const s = { on: false, ang: 0, last: null, cx: 0, cy: 0, n: 0 };
  const down = (e) => { s.on = true; s.ang = 0; s.last = null; s.n = 0; s.cx = e.clientX; s.cy = e.clientY; el.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!s.on) return;
    s.n++; s.cx += (e.clientX - s.cx) / Math.min(s.n, 24); s.cy += (e.clientY - s.cy) / Math.min(s.n, 24);
    const dx = e.clientX - s.cx, dy = e.clientY - s.cy;
    if (dx * dx + dy * dy < 36) return;
    const a = Math.atan2(dy, dx);
    if (s.last != null) { let d = a - s.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; s.ang += d; }
    s.last = a;
    if (Math.abs(s.ang) >= Math.PI * 1.5) { const dir = s.ang > 0 ? 1 : -1; s.ang = 0; onTurn(dir); }
  };
  const up = () => { s.on = false; };
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
  el.style.touchAction = "none";
  return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
}

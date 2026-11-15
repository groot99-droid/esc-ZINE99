// WrymWretch: how the modes take the game's code-drawn art (api.art, games/wrymwretch/art/).
//
//   raster(art, id, { w, h, strip })   a canvas of the asset at w x h CSS px, drawn once and kept.
//                                      strip: CSS selectors of layers to leave out (the art marks its
//                                      ground "plate", and a few other layers by name, see art/src).
//   png(art, id, opts)                 the same as a data URL, for <img>, <image> and CSS backgrounds.
//   opening(art, el, id)               set a chapter card above a mode's how-to card, on the void.
//   recordPage(wrap, api, spec)        the Record, opened behind the result: what this page wrote.
//
// Every one of them gives null or "" when the art is missing, and the mode keeps its own drawing.

const cache = new Map();

export function raster(art, id, { w, h, strip = [] } = {}) {
  if (!art || !art.has || !art.has(id)) return Promise.resolve(null);
  const info = art.info(id);
  w = Math.max(1, Math.round(w || info.w)); h = Math.max(1, Math.round(h || (w * info.h) / info.w));
  const key = `${id}|${w}|${h}|${strip.join(",")}`;
  if (cache.has(key)) return cache.get(key);
  const p = new Promise((res) => {
    let src = art.svg(id), made = null;
    if (strip.length) {
      try {
        const doc = new DOMParser().parseFromString(src, "image/svg+xml");
        doc.querySelectorAll(strip.join(",")).forEach((n) => n.remove());
        src = new XMLSerializer().serializeToString(doc);
        made = URL.createObjectURL(new Blob([src], { type: "image/svg+xml" }));
      } catch { made = null; }
    }
    const im = new Image();
    im.onload = () => {
      const k = Math.min(2, window.devicePixelRatio || 1);
      const c = document.createElement("canvas");
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      try { c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); } catch { made && URL.revokeObjectURL(made); return res(null); }
      made && URL.revokeObjectURL(made);
      res(c);
    };
    im.onerror = () => { made && URL.revokeObjectURL(made); res(null); };
    im.src = made || art.url(id);
  });
  cache.set(key, p);
  return p;
}

export async function png(art, id, opts = {}) {
  const c = await raster(art, id, opts);
  if (!c) return "";
  if (!c._url) { try { c._url = opts.jpeg ? c.toDataURL("image/jpeg", 0.86) : c.toDataURL("image/png"); } catch { c._url = art.url(id); } }
  return c._url;
}

// several at once: { name: [id, opts] } -> { name: canvas | null }
export async function rasters(art, spec) {
  const out = {};
  await Promise.all(Object.entries(spec).map(async ([k, [id, opts]]) => { out[k] = await raster(art, id, opts); }));
  return out;
}

// The chapter card as the mode's opening card: set above the how-to card, on the void. `el` is the
// mode's intro overlay (one child: its how-to card).
export function opening(art, el, id) {
  if (!el || !art || !art.has(id)) return;
  png(art, id, { w: 640, jpeg: true }).then((u) => {
    if (!u || !el.isConnected) return;
    const card = el.firstElementChild, im = document.createElement("img");
    im.src = u; im.alt = art.info(id).title;
    im.style.cssText = "display:block;flex:none;width:min(440px,100%);height:auto;aspect-ratio:16/9;margin:auto 0 10px;border:1px solid rgba(233,226,208,.45);box-shadow:0 6px 22px rgba(0,0,0,.55)";
    Object.assign(el.style, { display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(11,13,26,.88)", overflow: "auto" });
    if (card) { card.style.flex = "none"; card.style.marginBottom = "auto"; }
    el.insertBefore(im, card);
    el._banner = im;
  });
}
// Change the opening card (a mode with two pages shows the chapter of the page in hand).
export function openingSet(art, el, id) {
  if (!el || !art || !art.has(id)) return;
  el._want = id;
  png(art, id, { w: 640, jpeg: true }).then((u) => { if (u && el._banner && el._want === id) { el._banner.src = u; el._banner.alt = art.info(id).title; } });
}

const REALM_NAME = { west: "Cedarheart", north: "Galewing", south: "Mosswhisper", east: "Tidecaller", below: "Duskbane", above: "the High Realm", wrymreach: "Wrymreach" };
const CSS = `
.wrymwretch-record{position:absolute;inset:0;z-index:15;display:grid;place-items:start center;padding:12px 12px 150px;box-sizing:border-box;overflow:auto;background:radial-gradient(ellipse at 50% 30%,rgba(29,34,72,.97),rgba(11,13,26,.975) 70%);opacity:0;transition:opacity .5s;font-family:'Cormorant Garamond',Georgia,serif;color:#E9E2D0}
.wrymwretch-record.on{opacity:1}
.wrymwretch-record-leaf{position:relative;width:min(560px,100%);box-sizing:border-box;padding:26px 30px 22px;background:linear-gradient(160deg,rgba(233,226,208,.08),rgba(142,151,163,.05));border:1px solid rgba(233,226,208,.35)}
.wrymwretch-record-leaf .c{position:absolute;width:64px;height:64px;pointer-events:none}
.wrymwretch-record-leaf .c.tl{left:-6px;top:-6px}.wrymwretch-record-leaf .c.tr{right:-6px;top:-6px;transform:scaleX(-1)}
.wrymwretch-record-leaf .c.bl{left:-6px;bottom:-6px;transform:scaleY(-1)}.wrymwretch-record-leaf .c.br{right:-6px;bottom:-6px;transform:scale(-1)}
.wrymwretch-record-head{display:block;width:min(300px,82%);height:auto;margin:0 auto 4px}
.wrymwretch-record-headtxt{font:700 20px 'Cinzel',Georgia,serif;letter-spacing:.3em;text-align:center;margin:0 0 6px}
.wrymwretch-record-top{display:flex;gap:14px;align-items:center;margin:6px 0 2px}
.wrymwretch-record-top img.seal{width:62px;height:62px;flex:none}
.wrymwretch-record-top img.pic{width:96px;height:auto;flex:none;border:1px solid rgba(233,226,208,.4)}
.wrymwretch-record-top h3{font:700 19px 'Cinzel',Georgia,serif;letter-spacing:.06em;margin:0;color:#fbf7ec}
.wrymwretch-record-top p{margin:2px 0 0;font-size:15px;color:#b9c0cb;letter-spacing:.04em}
.wrymwretch-record-div{display:block;width:100%;height:auto;margin:4px 0;opacity:.95}
.wrymwretch-record-rule{height:1px;background:rgba(233,226,208,.4);margin:10px 0}
.wrymwretch-record ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.wrymwretch-record li{font-size:17px;line-height:1.32;padding-left:22px;position:relative}
.wrymwretch-record li::before{content:"";position:absolute;left:3px;top:.5em;width:8px;height:8px;transform:rotate(45deg);background:#E7C566}
.wrymwretch-record li.lost{color:#9aa3ad}.wrymwretch-record li.lost::before{background:none;border:1px solid #9aa3ad}
.wrymwretch-record li.link{color:#f3e2ac}.wrymwretch-record li.link::before{background:#A9C7E8;border-radius:50%;transform:none}
.wrymwretch-record li small{display:block;font-size:14px;color:#b9c0cb;letter-spacing:.03em}
.wrymwretch-record-title{display:block;width:150px;height:auto;margin:10px auto 0;opacity:.9}
@media (max-width:520px){.wrymwretch-record-leaf{padding:22px 18px 16px}.wrymwretch-record li{font-size:16px}.wrymwretch-record-top img.pic{width:72px}}
`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// spec: { realm, title, sub, pic (an art id shown beside the heading), lines: [text | { t, kind: "kept"|"lost"|"link", note }] }
// Call it just before api.end: the result bar sits over its foot.
export function recordPage(wrap, api, spec) {
  const art = api.art, has = (id) => art && art.has && art.has(id);
  const el = document.createElement("div");
  el.className = "wrymwretch-record";
  el.setAttribute("aria-label", "The Record");
  const lines = (spec.lines || []).filter(Boolean).map((l) => (typeof l === "string" ? { t: l } : l));
  el.innerHTML = `<style>${CSS}</style><div class="wrymwretch-record-leaf">
    <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
    <div data-head><div class="wrymwretch-record-headtxt">THE RECORD</div></div>
    <div class="wrymwretch-record-top"><span data-seal></span><div><h3>${esc(spec.title || "")}</h3><p>${esc(spec.sub || (REALM_NAME[spec.realm] ? REALM_NAME[spec.realm] + " page" : ""))}</p></div><span data-pic style="margin-left:auto"></span></div>
    <div data-div><div class="wrymwretch-record-rule"></div></div>
    <ul>${lines.map((l) => `<li class="${l.kind === "lost" ? "lost" : l.kind === "link" ? "link" : ""}">${esc(l.t)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</li>`).join("")}</ul>
    <span data-title></span></div>`;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add("on"));
  const put = (sel, id, cls, opts, alt = "") => png(art, id, opts).then((u) => { if (!u || !el.isConnected) return; el.querySelector(sel).innerHTML = `<img class="${cls}" alt="${esc(alt)}" src="${u}">`; });
  if (has("ui-record-header")) put("[data-head]", "ui-record-header", "wrymwretch-record-head", { w: 300, strip: [".plate"] }, "The Record");
  const seal = "ui-seal-" + (spec.realm || "wrymreach");
  if (has(seal)) put("[data-seal]", seal, "seal", { w: 62, strip: [".plate"] });
  const dv = "ui-divider-crack-" + (spec.divider || 1);
  if (has(dv)) put("[data-div]", dv, "wrymwretch-record-div", { w: 500, strip: [".plate"] });
  if (spec.pic && has(spec.pic)) put("[data-pic]", spec.pic, "pic", { w: 192 }, art.info(spec.pic).title);
  if (has("title-wrymwretch")) put("[data-title]", "title-wrymwretch", "wrymwretch-record-title", { w: 300, strip: [".plate"] }, "WrymWretch");
  const corner = spec.crystal && has("ui-record-corner-crystal") ? "ui-record-corner-crystal" : "ui-record-corner";
  if (has(corner)) png(art, corner, { w: 64, strip: [".plate"] }).then((u) => { if (!u || !el.isConnected) return; el.querySelectorAll(".c").forEach((c) => { c.style.background = `url("${u}") 0 0/100% 100% no-repeat`; }); });
  return el;
}

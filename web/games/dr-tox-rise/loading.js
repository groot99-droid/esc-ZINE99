// Dr. Tox: Rise: loading screen, title and menu look.
// The hospital room, 2217, locked off under flat tubes (art `loading-room`), the still graded over it like
// film; the title lettering (`title-rise`); a dated caption box; and one animated element from the game's
// first lesson: the bedside monitor's line, green before the dose, crossfading to amber as the game loads
// (`loading-monitor-green` into `loading-monitor-amber`), with the sweep cursor drawing it left to right.
// The episode strip (`title-episodes`) shows Rise open and Fall, Finale and Altrulan shut (DESIGN.md §14).
//
// Quoted line, verbatim from the author's bible as DESIGN.md section 3 quotes it:
//   dr-tox/source/Dr_Tox_Compiled_Bible_Obsidian.md, Part VI, Dr. Tox §2
//   "It is not a power source. It is a cage, and he built it himself, and he is the only person who can make more of it."
//
// The menu's ending cards come from data/endings.json through the app. Until generated ending cards exist
// (keyart), this module gives each ending its code-drawn fallback card (`ending-<id>`, ASSET_MAP.md), set on
// the catalog entry the app reads, and only where the catalog has no image.
//
// Rise has no cross-mode long puzzle in DESIGN.md, so there is no finale().

import catalog from "../../data/catalog.js";

const SLUG = "dr-tox-rise";

export const meta = {
  cover: "assets/stills/dr-tox-rise/34-the-injection.jpg",
  palette: { bg: "#101414", fg: "#E9ECEA", accent: "#D99A2B" },
  fonts: "family=Oswald:wght@500;700&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;600",
  display: "'Oswald', 'Arial Narrow', Impact, sans-serif",
  body: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
  menuIntro: "Episode 1 of 4. A boy poisoned by Rockcore Chemical Corp builds his own cage at fifteen and walks out at twenty-four; in the chapters between, a boy in a concrete room painted like the sky is made into the company's hero. Start where he did: at the bench, with The Cage.",
};

const QUOTE = "It is not a power source. It is a cage, and he built it himself, and he is the only person who can make more of it.";
const CITE = "Part VI, Dr. Tox §2";
const TIPS = [
  "The Cage: drip A9 until the colour holds in the endpoint window for three seconds, then cap. Short is leaky, past is hot; every batch is used.",
  "The Cage: the front's colour edge brightens before it surges.",
  "Panel run: a gutter skips time, and the guards walk on while you wait. Stillness in cover brings Pulse down.",
  "Panel run: a dart drops a guard for one gutter and costs Pulse 12. Draw few.",
  "Cat's Cradle: Cally takes what Reese offers; Carmy passes only to Cally; Rolan grabs out of turn.",
  "The Window: drag the start time along the rota. What is in the photos and not on the rota is a round too.",
  "Fiche: set the sheet, row and column; follow every SEE. A detail you noticed by the river can be searched.",
  "Aftermath: order the tents as the body made them. Some traces are not his; set them aside.",
  "Barrier escort: every wall pens someone. Walls cost Load; the canister clouds give it back.",
];

// ---- the art bundle (the same file the app gives the modes as api.art) ------------------------------
let artP = null;
function game() { return (catalog.games || []).find((g) => g.slug === SLUG) || null; }
function loadArt() {
  if (artP) return artP;
  const g = game();
  const url = (g && g.art) || `assets/art/${SLUG}.json`;
  artP = fetch(url).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return artP;
}
const urls = {};
function artUrl(data, id) {
  if (!data || !data[id] || !data[id].s) return "";
  return urls[id] || (urls[id] = URL.createObjectURL(new Blob([data[id].s], { type: "image/svg+xml" })));
}
// Fallback ending cards for the menu, only where no generated card exists.
function fillEndingCards(data) {
  const g = game();
  if (!g || !Array.isArray(g.endings)) return;
  for (const e of g.endings) {
    if (e.image) continue;
    const u = artUrl(data, "ending-" + String(e.id || "").replace(/_/g, "-"));
    if (u) e.image = u;
  }
}

// A monitor trace drawn by code, for when the art bundle is missing.
function ecg(w, y, amp, beats) {
  const step = w / beats;
  let d = `M0,${y}`;
  for (let i = 0; i < beats; i++) {
    const x = i * step;
    d += ` L${x + step * 0.42},${y} L${x + step * 0.47},${y - amp * 0.18} L${x + step * 0.52},${y} L${x + step * 0.58},${y + amp * 0.2} L${x + step * 0.63},${y - amp} L${x + step * 0.68},${y + amp * 0.35} L${x + step * 0.74},${y} L${x + step * 0.86},${y - amp * 0.22} L${x + step * 0.94},${y} L${x + step},${y}`;
  }
  return d;
}
function fallbackStrip(color, beats, amp) {
  return `<svg viewBox="0 0 1200 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="140" fill="#060807"/><path d="${ecg(1200, 84, amp, beats)}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/><text x="20" y="28" font-family="monospace" font-size="16" letter-spacing="3" fill="${color}">PULSE</text></svg>`;
}

const GRAIN = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>") + "\")";

export function render(root, ctx) {
  const P = "drtox-load-";
  const reduce = !!ctx.reducedMotion;
  const el = document.createElement("div");
  el.className = P + "root";
  const css = document.createElement("style");
  css.textContent = `
.${P}root{position:absolute;inset:0;overflow:hidden;background:#101414;color:#E9ECEA;font-family:'IBM Plex Sans','Segoe UI',system-ui,sans-serif}
.${P}room,.${P}still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.${P}room{filter:saturate(.7) brightness(.62) contrast(1.05)}
.${P}still{opacity:.28;filter:grayscale(.85) contrast(1.15) brightness(.7);mix-blend-mode:luminosity}
.${P}shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(16,20,20,.55),rgba(16,20,20,.25) 38%,rgba(10,13,13,.86) 74%,#0a0d0d)}
.${P}grain{position:absolute;inset:-20px;background-image:${GRAIN};opacity:.18;mix-blend-mode:overlay;pointer-events:none}
.${P}col{position:absolute;left:16px;right:16px;top:clamp(14px,4vh,44px);bottom:0;display:flex;flex-direction:column;align-items:center}
.${P}col>*{flex-shrink:0}
.${P}cap{align-self:flex-start;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:13px;letter-spacing:.12em;text-transform:uppercase;background:#E9ECEA;color:#101414;padding:5px 10px;border:2px solid #101414;box-shadow:3px 3px 0 rgba(0,0,0,.6);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.${P}title{width:min(720px,100%,calc(36vh * 2.857));margin-top:clamp(8px,2.5vh,26px);aspect-ratio:1200/420;box-shadow:0 18px 60px rgba(0,0,0,.55)}
.${P}title img{width:100%;height:100%;display:block}
.${P}title.fb{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#141a1a}
.${P}title.fb b{font-family:'Oswald','Arial Narrow',Impact,sans-serif;font-size:clamp(48px,11vw,128px);letter-spacing:.06em;line-height:1}
.${P}title.fb i{font-style:normal;font-family:Georgia,serif;color:#D99A2B;letter-spacing:.5em;font-size:clamp(22px,4.5vw,52px)}
.${P}quote{width:min(760px,100%);margin:clamp(12px,3vh,28px) 0 0;font-size:clamp(15px,1.8vw,19px);line-height:1.45;color:#E9ECEA;border-left:3px solid #D99A2B;padding:2px 0 2px 14px;text-wrap:pretty}
.${P}quote cite{display:block;font-style:normal;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11.5px;letter-spacing:.08em;color:#8A9A99;margin-top:6px}
.${P}eps{width:min(600px,100%);margin-top:clamp(10px,2.4vh,22px);aspect-ratio:1200/180;opacity:.95}
.${P}eps img{width:100%;height:100%;display:block}
.${P}eps.fb{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;aspect-ratio:auto}
.${P}eps.fb span{font-family:'Oswald','Arial Narrow',sans-serif;font-size:13px;letter-spacing:.12em;text-align:center;padding:6px 2px;border:1px solid #5E7375;color:#8A9A99}
.${P}eps.fb span:first-child{border-color:#D99A2B;color:#F2C14E}
.${P}foot{margin-top:auto;width:min(900px,100%);padding-bottom:clamp(12px,3vh,30px)}
.${P}mon{position:relative;width:100%;aspect-ratio:1200/140;border:1px solid #2a3433;overflow:hidden;background:#060807}
.${P}mon>div{position:absolute;inset:0}
.${P}mon img{width:100%;height:100%;display:block;object-fit:cover;object-position:left center}
.${P}mon svg{width:100%;height:100%;display:block}
.${P}amber{opacity:0}
.${P}gap{position:absolute;top:0;bottom:0;left:0;width:7%;background:linear-gradient(90deg,#060807 70%,rgba(6,8,7,0));will-change:transform}
.${P}dot{position:absolute;top:0;bottom:0;width:3px;left:0;background:rgba(233,236,234,.55);box-shadow:0 0 10px rgba(233,236,234,.5);will-change:transform}
.${P}row{display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#8A9A99}
.${P}tip{margin-top:8px;font-size:clamp(13.5px,1.5vw,15.5px);line-height:1.45;min-height:2.9em;transition:opacity .45s}
.${P}tip b{font-family:'IBM Plex Mono',ui-monospace,monospace;font-weight:600;color:#D99A2B;font-size:.76em;letter-spacing:.14em;text-transform:uppercase;margin-right:.7em}
@media (max-width:620px){.${P}mon{aspect-ratio:auto;height:84px}.${P}cap{font-size:11.5px}.${P}eps{width:100%}.${P}quote{font-size:15px}}
@media (max-height:560px){.${P}eps{display:none}}
`;
  el.appendChild(css);

  const room = document.createElement("img");
  room.className = P + "room"; room.alt = "";
  const still = document.createElement("img");
  still.className = P + "still"; still.alt = ""; still.src = ctx.still || meta.cover;
  still.onerror = () => { still.remove(); };
  const shade = document.createElement("div"); shade.className = P + "shade";
  const grain = document.createElement("div"); grain.className = P + "grain";
  el.append(room, still, shade, grain);

  const col = document.createElement("div");
  col.className = P + "col";
  col.innerHTML = `<div class="${P}cap"></div>
<div class="${P}title" role="img"></div>
<blockquote class="${P}quote"><span></span><cite></cite></blockquote>
<div class="${P}eps" role="img" aria-label="Episode 1, Rise, open. Fall, Finale and Altrulan are shut."></div>
<div class="${P}foot">
  <div class="${P}mon" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="${P}green"></div><div class="${P}amber"></div><i class="${P}gap"></i><i class="${P}dot"></i>
  </div>
  <div class="${P}row"><span class="${P}state">Before the dose</span><span class="${P}label"></span></div>
  <div class="${P}tip" aria-live="polite"></div>
</div>`;
  el.appendChild(col);
  const q = (c) => col.querySelector("." + P + c);
  const label = ctx.label && ctx.label !== "Loading" ? ctx.label : "";
  q("cap").textContent = label ? `2217. Loading ${label}.` : "2217.";
  const titleBox = q("title");
  titleBox.setAttribute("aria-label", ctx.title || "Dr. Tox: Rise");
  q("quote").querySelector("span").textContent = `“${QUOTE}”`;
  q("quote").querySelector("cite").textContent = CITE;
  q("label").textContent = label || "Episode 1 of 4";
  const eps = q("eps"), mon = q("mon"), green = q("green"), amber = q("amber"), gap = q("gap"), dot = q("dot"), state = q("state");
  if (reduce) { gap.style.display = "none"; dot.style.display = "none"; }

  let closed = false;
  const fallbacks = () => {
    if (!titleBox.firstChild) { titleBox.classList.add("fb"); titleBox.innerHTML = "<b>DR. TOX</b><i>RISE</i>"; }
    if (!eps.firstChild) { eps.classList.add("fb"); eps.innerHTML = "<span>RISE</span><span>FALL</span><span>FINALE</span><span>ALTRULAN</span>"; }
    if (!green.firstChild) green.innerHTML = fallbackStrip("#7FD957", 9, 50);
    if (!amber.firstChild) amber.innerHTML = fallbackStrip("#D99A2B", 6, 32);
  };
  const img = (src) => { const i = document.createElement("img"); i.alt = ""; i.src = src; i.draggable = false; return i; };
  loadArt().then((data) => {
    fillEndingCards(data);
    if (closed) return;
    const u = (id) => artUrl(data, id);
    if (u("loading-room")) room.src = u("loading-room"); else room.remove();
    if (u("title-rise")) titleBox.appendChild(img(u("title-rise")));
    if (u("title-episodes")) eps.appendChild(img(u("title-episodes")));
    if (u("loading-monitor-green")) green.appendChild(img(u("loading-monitor-green")));
    if (u("loading-monitor-amber")) amber.appendChild(img(u("loading-monitor-amber")));
    fallbacks();
  });
  // Draw the fallbacks if the bundle is slow, so the screen is never empty.
  const fbTimer = setTimeout(() => { if (!closed) fallbacks(); }, 900);

  const tip = q("tip");
  let tipI = Math.floor(Math.random() * TIPS.length);
  const showTip = () => { tip.innerHTML = "<b>How it plays</b><span></span>"; tip.querySelector("span").textContent = TIPS[tipI % TIPS.length]; tipI++; };
  showTip();
  let fadeTimer = 0;
  const tipTimer = setInterval(() => {
    if (reduce) { showTip(); return; }
    tip.style.opacity = "0";
    fadeTimer = setTimeout(() => { showTip(); tip.style.opacity = "1"; }, 420);
  }, 2800);
  root.appendChild(el);

  // The monitor: amber rises over green with progress; the sweep cursor crosses once every 1.6 s.
  let shown = 0, target = 0, raf = 0, lastState = "";
  const t0 = performance.now();
  const frame = (now) => {
    shown += (target - shown) * (reduce ? 1 : 0.1);
    // Amber and green never at equal weight (§6): the crossfade steps over the middle (0.3 to 0.7).
    const a = shown < 0.5 ? 1.2 * shown * shown : 1 - 1.2 * (1 - shown) * (1 - shown);
    amber.style.opacity = a.toFixed(3);
    green.style.opacity = (1 - a).toFixed(3);
    mon.setAttribute("aria-valuenow", String(Math.round(shown * 100)));
    const s = shown >= 0.99 ? "The dose is in" : shown > 0.5 ? "Holding" : "Before the dose";
    if (s !== lastState) { state.textContent = s; lastState = s; }
    if (!reduce) {
      const w = mon.clientWidth;
      const x = (((now - t0) / 1600) % 1) * w;
      dot.style.transform = `translateX(${x.toFixed(1)}px)`;
      gap.style.transform = `translateX(${(x + 3).toFixed(1)}px)`;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    progress(p) { target = Math.max(target, Math.min(1, p || 0)); },
    close() {
      closed = true;
      cancelAnimationFrame(raf); clearInterval(tipTimer); clearTimeout(fadeTimer); clearTimeout(fbTimer);
      el.remove();
    },
  };
}

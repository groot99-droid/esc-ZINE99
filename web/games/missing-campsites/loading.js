// Missing Campsites: the loading screen.
//
// The entrance still, printed in graphite on cream map stock. Under it, the campground's loop as a
// survey print: 24 green-ink site squares. A torch circle walks the loop from the entrance inward;
// each square it has passed is gone the moment it leaves the light (never animated: rule 5, "the
// erasure is never seen happening"), and Tam's pencil writes its number where it stood (rule 6,
// "the player's own handwriting holds"). At the end only the five sites, 20 to 24, are still printed.

export const meta = {
  cover: "assets/stills/missing-campsites/01-entrance.jpg",
  // DESIGN.md section 15: night (blue-black field, torch amber), paper (cream stock, graphite,
  // forest-green ink).
  palette: { bg: "#0d1220", fg: "#f1ead6", accent: "#ffb35c" },
  fonts: "family=Zilla+Slab:wght@500;700&family=Caveat:wght@500;700&family=IBM+Plex+Mono:wght@400;600",
  display: "'Zilla Slab', Rockwell, Georgia, serif",
  body: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  menuIntro:
    "Hollin Creek erases itself a few sites at a time, from the entrance inward, and only the five of you can tell. " +
    "Walk the loop by torchlight, compare the map with the ground, and keep what you can in your own hand.",
};

// The quoted lines are verbatim from the author's pitch, as DESIGN.md section 3, beat 3, quotes them:
// creative-writing/vault/04_Book_Concepts/02_Missing_Campsites.md
const QUOTE = ["The map shows them.", "The signs point to them.", "But the land is empty."];

const TIPS = [
  "Compare the map against the ground. Paper lags the land by one step.",
  "Your own handwriting holds. Lines in anyone else's hand do not.",
  "Nothing goes while someone who remembers it is looking. Keep it in the light.",
  "Names go, totals stay. That is why the ranger's book stops adding up.",
  "What you carry into the five sites before dark holds with them.",
];

const CSS = `
.mc-load{position:absolute;inset:0;overflow:hidden;background:#0d1220;color:#f1ead6;font-family:'IBM Plex Mono',ui-monospace,monospace}
.mc-load-photo{position:absolute;inset:0;background-size:cover;background-position:center 40%;filter:grayscale(1) contrast(1.15) brightness(.55) sepia(.35);transform:scale(1.03)}
.mc-load-veil{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 35%,rgba(13,18,32,.15),rgba(13,18,32,.92) 70%)}
.mc-load-sheet{position:absolute;left:50%;bottom:max(18px,4vh);transform:translateX(-50%);width:min(760px,calc(100% - 32px));background:#f1ead6;color:#2b2a27;box-shadow:0 18px 50px rgba(0,0,0,.55);padding:18px 20px 14px;box-sizing:border-box}
.mc-load-sheet::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0 3px,rgba(80,60,30,.035) 3px 4px)}
.mc-load-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-bottom:2px solid #2f6b3a;padding-bottom:6px;color:#2f6b3a}
.mc-load-head small{font-size:12px;letter-spacing:.18em;text-transform:uppercase}
.mc-load-title{font-family:'Zilla Slab',Rockwell,Georgia,serif;font-weight:700;font-size:clamp(28px,6vw,52px);line-height:1;margin:0;color:#1f2a22;letter-spacing:.01em}
.mc-load-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px;align-items:center;margin-top:10px}
.mc-load-map{width:100%;height:auto;display:block}
.mc-load-quote{font-family:'Caveat','Segoe Print',cursive;font-size:clamp(20px,3.4vw,28px);line-height:1.08;color:#3a3a3c;margin:0}
.mc-load-cite{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2f6b3a;margin-top:6px}
.mc-load-tip{margin-top:10px;font-size:14px;line-height:1.45;color:#333336;min-height:3em;border-top:1px dashed #b9b09a;padding-top:8px}
.mc-load-tip b{color:#9c3b30;font-weight:600;letter-spacing:.12em;text-transform:uppercase;font-size:12px;margin-right:6px}
.mc-load-label{position:absolute;top:14px;left:16px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#ffb35c;opacity:.85}
.mc-load-rule{height:4px;background:rgba(47,107,58,.18);margin-top:6px;position:relative}.mc-load-rule i{position:absolute;left:0;top:0;bottom:0;background:#4a4a4c;width:0;background-image:repeating-linear-gradient(90deg,#4a4a4c 0 7px,#6a6a6c 7px 9px)}
.mc-load-tip span{transition:opacity .3s}
@media (max-width:560px){.mc-load-quote{font-size:22px}.mc-load-title{font-size:34px}.mc-load-row{grid-template-columns:1fr}.mc-load-sheet{padding:14px}}
`;

export function render(root, ctx) {
  const reduce = !!ctx.reducedMotion;
  const el = document.createElement("div");
  el.className = "mc-load";
  el.innerHTML = `<style>${CSS}</style>
    <div class="mc-load-photo"></div><div class="mc-load-veil"></div>
    <div class="mc-load-label"></div>
    <div class="mc-load-sheet">
      <div class="mc-load-head"><small>Hollin Creek · Sites 1–24</small><small class="mc-load-pct">0%</small></div><div class="mc-load-rule"><i></i></div>
      <div class="mc-load-row">
        <div><h1 class="mc-load-title"></h1><svg class="mc-load-map" viewBox="0 0 400 210" aria-hidden="true"></svg></div>
        <div><p class="mc-load-quote"></p><span class="mc-load-cite">from the author's pitch</span>
          <div class="mc-load-tip"><b>Tip</b><span></span></div></div>
      </div>
    </div>`;
  root.appendChild(el);
  el.querySelector(".mc-load-photo").style.backgroundImage = `url("${meta.cover}")`;
  el.querySelector(".mc-load-title").textContent = ctx.title || "Missing Campsites";
  el.querySelector(".mc-load-label").textContent = ctx.label || "Loading";
  const q = el.querySelector(".mc-load-quote");
  QUOTE.forEach((line, i) => { if (i) q.appendChild(document.createElement("br")); q.appendChild(document.createTextNode(line)); });

  // The survey print: contours, the loop road, 24 site squares.
  const NS = "http://www.w3.org/2000/svg";
  const svg = el.querySelector("svg");
  const mk = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  for (let k = 0; k < 7; k++) {
    const rx = 40 + k * 22, ry = 22 + k * 13;
    mk("ellipse", { cx: 150 + k * 3, cy: 92 - k * 2, rx, ry, fill: "none", stroke: "#9b6a3c", "stroke-width": k % 3 === 0 ? 1.4 : 0.7, opacity: 0.55 });
  }
  mk("path", { d: "M0 190 C60 170 90 200 150 196 S260 210 300 200", fill: "none", stroke: "#3d7fa6", "stroke-width": 2 });
  const loopD = "M70 168 C30 140 32 70 80 42 C130 14 270 12 320 40 C370 70 372 140 330 168 C290 194 120 196 70 168 Z";
  mk("path", { d: loopD, fill: "none", stroke: "#222", "stroke-width": 6 });
  const road = mk("path", { d: loopD, fill: "none", stroke: "#f1ead6", "stroke-width": 3 });
  mk("path", { d: "M0 205 C30 196 50 186 70 168", fill: "none", stroke: "#222", "stroke-width": 6 });
  mk("path", { d: "M0 205 C30 196 50 186 70 168", fill: "none", stroke: "#f1ead6", "stroke-width": 3 });
  const L = road.getTotalLength ? road.getTotalLength() : 900;
  const pt = (t) => { try { return road.getPointAtLength(((t % 1) + 1) % 1 * L); } catch { return { x: 200, y: 100 }; } };
  const sites = [];
  for (let i = 0; i < 24; i++) {
    const t = (i + 0.5) / 24;
    const p = pt(t), c = { x: 200, y: 104 };
    const ox = (p.x - c.x) * 0.13, oy = (p.y - c.y) * 0.16;
    const x = p.x + ox, y = p.y + oy;
    const g = mk("g", {});
    const sq = mk("rect", { x: x - 5, y: y - 5, width: 10, height: 10, fill: "#2f6b3a" }, g);
    const pencil = mk("text", { x, y: y + 4, "text-anchor": "middle", "font-size": 14, fill: "#333336", "font-family": "Caveat, 'Segoe Print', cursive", "font-weight": 700, visibility: "hidden" }, g);
    pencil.textContent = String(i + 1);
    sites.push({ t, sq, pencil, gone: false });
  }
  const glow = mk("circle", { r: 18, fill: "url(#mc-load-torch)", opacity: 0.95 });
  const defs = mk("defs", {});
  const rg = mk("radialGradient", { id: "mc-load-torch" }, defs);
  mk("stop", { offset: "0", "stop-color": "#fff0c8", "stop-opacity": 0.85 }, rg);
  mk("stop", { offset: "0.55", "stop-color": "#ffb35c", "stop-opacity": 0.45 }, rg);
  mk("stop", { offset: "1", "stop-color": "#ffb35c", "stop-opacity": 0 }, rg);

  // The torch travels from site 1 to just past site 19; the five sites stay printed.
  const END_T = (19 + 0.5) / 24 + 0.03;
  let target = 0, shown = 0, raf = 0, tipTimer = 0, tipIdx = 0, open = true;
  const pctEl = el.querySelector(".mc-load-pct");
  const ruleEl = el.querySelector(".mc-load-rule i");
  const place = (p) => {
    const t = p * END_T;
    const c = pt(t);
    glow.setAttribute("cx", c.x); glow.setAttribute("cy", c.y);
    for (const s of sites) {
      if (!s.gone && s.t < t - 0.025 && s.t < (19.5 / 24)) {   // has left the light: gone, unseen
        s.gone = true;
        s.sq.setAttribute("visibility", "hidden");
        s.pencil.setAttribute("visibility", "visible");
      }
    }
    pctEl.textContent = Math.round(p * 100) + "%";
    ruleEl.style.width = (p * 100).toFixed(1) + "%";
  };
  const frame = () => {
    if (!open) return;
    shown += (target - shown) * 0.12;
    place(shown);
    raf = requestAnimationFrame(frame);
  };
  if (reduce) place(0); else raf = requestAnimationFrame(frame);

  const tipEl = el.querySelector(".mc-load-tip span");
  tipIdx = Math.floor(Math.random() * TIPS.length);
  tipEl.textContent = TIPS[tipIdx];
  tipTimer = setInterval(() => { tipIdx = (tipIdx + 1) % TIPS.length; tipEl.textContent = TIPS[tipIdx]; }, reduce ? 4000 : 2600);

  return {
    progress(p) {
      target = Math.max(0, Math.min(1, p));
      if (reduce) place(target);
    },
    close() {
      open = false;
      cancelAnimationFrame(raf);
      clearInterval(tipTimer);
      el.remove();
    },
  };
}

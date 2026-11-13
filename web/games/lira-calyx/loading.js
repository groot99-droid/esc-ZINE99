// The Redacted Testament of Lira Calyx: loading screen.
// A page of Lira's journal: the terrace still pasted in as an ink-wash plate, the title in a field
// naturalist's type, the torn last line of the testament, and a survey cross-section whose dotted
// route climbs the ridge as the game loads (the route "stays in the journal as a page", DESIGN 10).
export const meta = {
  cover: "assets/stills/lira-calyx/01-terrace.jpg",
  palette: { bg: "#efe4cb", fg: "#3b2618", accent: "#b3212b" }, // journal paper, iron-gall ink, seal red
  fonts: "family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700",
  display: "'IM Fell English', Georgia, serif",
  body: "Georgia, 'Times New Roman', serif",
  menuIntro: "Dr. Lira Calyx measures a mountain world by hand while someone corrects, censors and forges her journal. These are the journal's climbs, plates and pages: take the number, decide whether to trust it.",
};

const TIPS = [
  "A number is only as good as its source. Hand readings are slow and true.",
  "In the climb, hold Anchor when the edge of the page darkens: a storm front is coming.",
  "Under the lens, only the teal plane is solid. Magenta passes through you.",
  "In the Assay, a reading counts as precise only within two nanometres.",
  "The Key: when a name's description contradicts your measures, write a new couplet.",
  "Each interval from the drone is thirty degrees; each rest, a hundred metres.",
  "In the audit, the archivist's small blue hand is not a forgery. Mark it Other hand.",
  "On the Node Board, opposite phases on one edge cancel it. Timing is everything.",
];

export function render(root, ctx) {
  const P = "lira-calyx-loading-";
  const el = document.createElement("div");
  el.className = P + "root";
  el.innerHTML = `
  <style>
    .${P}root{position:absolute;inset:0;overflow:hidden;background:#efe4cb;color:#3b2618;font-family:Georgia,serif;
      background-image:radial-gradient(ellipse at 30% 20%,rgba(255,250,235,.7),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(120,80,40,.18),transparent 55%);}
    .${P}root::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;
      background-image:repeating-linear-gradient(0deg,rgba(59,38,24,.05) 0 1px,transparent 1px 28px);}
    .${P}page{position:absolute;inset:clamp(12px,3vw,40px);display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(14px,3vw,44px);align-items:center}
    @media (max-width:760px){.${P}page{grid-template-columns:1fr;align-content:start;gap:14px}}
    .${P}plate{position:relative;margin:0;transform:rotate(-1.2deg);background:#f6efdc;padding:10px 10px 30px;box-shadow:0 2px 0 rgba(59,38,24,.15),0 10px 24px rgba(59,38,24,.18)}
    .${P}plate img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;filter:sepia(.85) contrast(1.15) brightness(.95) saturate(.8);mix-blend-mode:multiply}
    .${P}plate figcaption{position:absolute;left:12px;right:12px;bottom:7px;font:italic 13px 'IM Fell English',Georgia,serif;display:flex;justify-content:space-between;gap:8px}
    .${P}tape{position:absolute;width:70px;height:20px;background:rgba(220,205,160,.75);top:-8px;left:18px;transform:rotate(-6deg)}
    .${P}tape.r{left:auto;right:18px;transform:rotate(5deg)}
    .${P}bar{position:absolute;left:14%;right:38%;top:58%;height:13%;background:#141414;opacity:0;transition:opacity .6s;
      clip-path:polygon(0 8%,4% 0,97% 4%,100% 50%,98% 100%,2% 94%)}
    .${P}text h1{font:400 clamp(30px,4.4vw,58px)/1.02 'IM Fell English',Georgia,serif;margin:0 0 6px;text-wrap:balance}
    .${P}text h1 i{display:block;font-size:.5em;letter-spacing:.04em;opacity:.8}
    .${P}label{font:700 12px 'Courier Prime',monospace;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin:0 0 14px}
    .${P}quote{font:italic clamp(16px,1.7vw,21px)/1.4 'IM Fell English',Georgia,serif;margin:0 0 14px;padding-left:14px;border-left:2px solid #b3212b;max-width:38ch}
    .${P}quote .torn{display:inline-block;width:2.4em;border-bottom:1px dashed #3b2618;transform:translateY(-4px)}
    .${P}tip{font-size:14px;line-height:1.4;min-height:2.9em;margin:0 0 8px;max-width:44ch;transition:opacity .4s}
    .${P}tip b{font:700 11px 'Courier Prime',monospace;letter-spacing:.1em;color:#b3212b;margin-right:6px}
    .${P}sect{width:100%;max-width:520px;height:auto;display:block}
    @media (max-width:760px){.${P}sect{max-height:26vh}.${P}plate img{aspect-ratio:21/9}}
  </style>
  <div class="${P}page">
    <figure class="${P}plate"><span class="${P}tape"></span><span class="${P}tape r"></span>
      <img alt="" src="${ctx.still || meta.cover}"><div class="${P}bar"></div>
      <figcaption><span>Hollin Terrace, from the bench</span><span>pl. I</span></figcaption></figure>
    <div class="${P}text">
      <p class="${P}label"></p>
      <h1>The Redacted Testament <i>of Lira Calyx</i></h1>
      <p class="${P}quote">“If I don’t make it out, if this book is all that remains, then let it be known that the Peaks are—”<span class="torn"></span></p>
      <p class="${P}tip"><b>FIELD NOTE</b><span></span></p>
      <svg class="${P}sect" viewBox="0 0 520 170" aria-label="Loading: the route climbs the section"></svg>
    </div>
  </div>`;
  // The quoted line: creative-writing/vault/05_Worldbuilding/02_The_Redacted_Testament_of_Lira_Calyx.md
  // (final chapter), quoted in games/lira-calyx/DESIGN.md section 3.
  root.appendChild(el);
  el.querySelector("." + P + "label").textContent = ctx.label && ctx.label !== "Loading" ? "Opening: " + ctx.label : "Opening the journal";
  const tipEl = el.querySelector("." + P + "tip span");
  let ti = Math.floor(Math.random() * TIPS.length);
  tipEl.textContent = TIPS[ti];
  const tipBox = el.querySelector("." + P + "tip");
  const timers = [];
  timers.push(setInterval(() => {
    tipBox.style.opacity = 0;
    timers.push(setTimeout(() => { ti = (ti + 1) % TIPS.length; tipEl.textContent = TIPS[ti]; tipBox.style.opacity = 1; }, ctx.reducedMotion ? 0 : 400));
  }, 2600));
  setTimeout(() => { const b = el.querySelector("." + P + "bar"); if (b) b.style.opacity = 0.92; }, ctx.reducedMotion ? 0 : 900);

  // The cross-section: strata hatched under a ridge, an altitude scale on the left, a dotted route.
  const svg = el.querySelector("svg");
  const NS = "http://www.w3.org/2000/svg";
  const X0 = 46, X1 = 510, YB = 160, YT = 14;
  const ridge = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, x = X0 + t * (X1 - X0);
    const alt = 0.12 + 0.82 * Math.exp(-(((t - 0.68) / 0.3) ** 2)) + 0.03 * Math.sin(t * 23);
    ridge.push([x, YB - (YB - YT) * Math.max(0.06, alt)]);
  }
  const poly = [[X0, YB], ...ridge, [X1, YB]].map((p) => p.join(",")).join(" ");
  let h = `<defs>
    <pattern id="${P}h1" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0,8 L8,0" stroke="#3b2618" stroke-width=".8"/></pattern>
    <pattern id="${P}h2" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#3b2618"/><circle cx="8" cy="8" r=".8" fill="#3b2618"/></pattern>
    <pattern id="${P}h3" width="12" height="8" patternUnits="userSpaceOnUse"><path d="M0,3 H12 M6,3 V8" stroke="#3b2618" stroke-width=".7" fill="none"/></pattern>
    <clipPath id="${P}c"><polygon points="${poly}"/></clipPath></defs>
    <g clip-path="url(#${P}c)">`;
  const fills = [["#b56a3f", "h1"], ["#d9b77c", "h2"], ["#c8913a", "h1"], ["#7c8a6a", "h3"], ["#8d969c", "h1"], ["#b9d8ea", "h3"]];
  for (let k = 0; k < 6; k++) {
    const y0 = YB - (k - 1) * 30 + 8, y1 = y0 - 30;
    const band = `M${X0 - 5},${y0 + 10} L${X1 + 5},${y0 - 40} L${X1 + 5},${y1 - 40} L${X0 - 5},${y1 + 10}Z`;
    h += `<path d="${band}" fill="${fills[k][0]}" opacity=".85"/><path d="${band}" fill="url(#${P}${fills[k][1]})" opacity=".55"/>`;
  }
  h += `</g><polygon points="${poly}" fill="none" stroke="#3b2618" stroke-width="1.6"/>`;
  h += `<line x1="22" y1="${YB}" x2="22" y2="${YT}" stroke="#3b2618"/><rect x="18" y="${YT}" width="8" height="${YB - YT}" fill="none" stroke="#3b2618" stroke-width=".8"/>`;
  for (let a = 0; a <= 5; a++) { const y = YB - (YB - YT) * a / 5; h += `<line x1="14" x2="26" y1="${y}" y2="${y}" stroke="#3b2618"/><text x="30" y="${y - 2}" font-size="8" font-family="Courier Prime,monospace" fill="#3b2618">${a} km</text>`; }
  h += `<rect class="${P}fill" x="18" y="${YB}" width="8" height="0" fill="#3fc4d0"/>`;
  h += `<path class="${P}route" d="" fill="none" stroke="#3b2618" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`;
  h += `<g class="${P}me"><circle r="4" fill="#b3212b"/><line y1="-4" y2="-14" stroke="#3b2618" stroke-width="1.2"/><path d="M0,-14 l7,3 l-7,3z" fill="#b3212b"/></g>`;
  h += `<text class="${P}alt" x="${X1}" y="${YB + 9}" text-anchor="end" font-size="9" font-family="Courier Prime,monospace" fill="#3b2618"></text>`;
  svg.innerHTML = h;
  const route = svg.querySelector("." + P + "route"), me = svg.querySelector("." + P + "me");
  const fill = svg.querySelector("." + P + "fill"), altT = svg.querySelector("." + P + "alt");
  const peakI = ridge.reduce((bi, p, i) => (p[1] < ridge[bi][1] ? i : bi), 0);
  let shown = 0, raf = 0, target = 0;
  const draw = () => {
    const n = Math.max(1, Math.round(shown * peakI));
    const pts = ridge.slice(0, n + 1).map(([x, y]) => `${x.toFixed(1)},${(y - 3).toFixed(1)}`);
    route.setAttribute("d", "M" + pts.join(" L"));
    const [x, y] = ridge[n];
    me.setAttribute("transform", `translate(${x},${y - 3})`);
    const frac = (YB - y) / (YB - YT);
    fill.setAttribute("y", YB - (YB - YT) * frac);
    fill.setAttribute("height", (YB - YT) * frac);
    altT.textContent = `SECTION A–A′  ${Math.round(frac * 5000).toLocaleString("en").replace(",", " ")} m`;
  };
  const step = () => {
    shown += (target - shown) * (ctx.reducedMotion ? 1 : 0.12);
    draw();
    if (Math.abs(target - shown) > 0.001) raf = requestAnimationFrame(step); else raf = 0;
  };
  draw();
  return {
    progress(p) { target = Math.max(target, Math.min(1, p)); if (!raf) raf = requestAnimationFrame(step); },
    close() { cancelAnimationFrame(raf); timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); },
  };
}

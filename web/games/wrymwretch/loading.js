// WrymWretch loading screen: the bone-and-silver reliquary (DESIGN.md section 15).
// The cover still (the King of Dragons and the Queen of Elves, reference/14-the-veil.jpg) sits in a
// carved silver frame with fine crack lines; the progress element is the seal ring, its six realm
// gems lighting one by one as the world is remembered.
//
// Quoted line, verbatim, as DESIGN.md section 3 quotes it:
//   "When the last memory fades, the Astral Architect shall rise."
//   creative-writing/vault/02_Novels/02_WrymWretch.md, line 77 (WW 77)

const P = {
  void: "#07080d", bone: "#f3eee2", ivory: "#e9e1cc", silver: "#c7ccd3", tarnish: "#7d858f",
  sungold: "#e2b33c", moonsilver: "#d9dde2",
};
// one accent per realm (West, North, South, East, Below, Above), from pictographs/make.py
const REALMS = [
  ["West", "#d79a2b"], ["North", "#a9c8e4"], ["South", "#e8571c"],
  ["East", "#1f5f8b"], ["Below", "#5b3a7a"], ["Above", "#fbf6e4"],
];

export const meta = {
  cover: "assets/stills/wrymwretch/14-the-veil.jpg",
  palette: { bg: "#07080d", fg: "#e9e4d6", accent: "#e2b33c" },
  fonts: "family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500",
  display: "'Cinzel', 'Trajan Pro', Georgia, serif",
  body: "'Cormorant Garamond', Georgia, serif",
  menuIntro: "Six elves and their twin-soul dragons fly toward the chasm where their kind was born, " +
    "through a world that is forgetting itself. Fly, run, redraw, read, match, play and tune: every page here keeps something from being forgotten.",
};

const TIPS = [
  "Twin flight: when the sail tears, dive under Aeris before six seconds run out.",
  "Forgetting run: tap Recall just before a faint ledge; lanterns and remembered ground give Focus back.",
  "Star Chart: the ringed stars are the figure you are drawing. Name it before the grey cloud drifts over.",
  "The Slipping Glyph: whatever you stop watching changes. Watch what stays.",
  "Concentration: faces blank to clear glass as you play. Lead a face you have seen and it will not blank.",
  "Six Realms: end a turn on Wrymreach while you hold a Threshold.",
  "Heartstone: still is right, a slow wobble is one step off, a fast one is far. Ring a shard to hear if it belongs at all.",
];

const CSS = `
.wrymwretch-load-root{position:absolute;inset:0;overflow:hidden;background:${P.void};color:${P.bone};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-load-still{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;filter:grayscale(.3) saturate(.75) contrast(1.12) brightness(.82);transform:scale(1.04);transition:transform 6s ease-out}
.wrymwretch-load-root.on .wrymwretch-load-still{transform:scale(1)}
.wrymwretch-load-veil{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,transparent 35%,rgba(7,8,13,.45) 70%,${P.void} 100%),linear-gradient(180deg,rgba(7,8,13,.1),rgba(7,8,13,.05) 40%,rgba(7,8,13,.85) 80%)}
.wrymwretch-load-frame{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.wrymwretch-load-col{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 20px clamp(18px,5vh,46px);text-align:center}
.wrymwretch-load-kicker{font-family:'Cinzel',Georgia,serif;font-size:12px;letter-spacing:.36em;color:${P.silver};text-transform:uppercase;text-shadow:0 1px 3px #000}
.wrymwretch-load-title{font-family:'Cinzel',Georgia,serif;font-weight:700;font-size:clamp(34px,7.4vw,84px);line-height:.95;letter-spacing:.08em;margin:0;color:${P.bone};text-shadow:0 0 1px #fff,0 2px 0 #3a3f47,0 0 28px rgba(199,204,211,.35)}
.wrymwretch-load-label{font-family:'Cinzel',Georgia,serif;font-size:13px;letter-spacing:.28em;color:${P.sungold};text-transform:uppercase;text-shadow:0 1px 3px #000}
.wrymwretch-load-quote{font-style:italic;font-size:clamp(16px,2.3vw,22px);max-width:34ch;color:${P.ivory};margin:2px 0 0;line-height:1.25;text-shadow:0 1px 6px #000}
.wrymwretch-load-cite{font-family:'Cinzel',Georgia,serif;font-size:12px;letter-spacing:.24em;color:${P.silver};opacity:.85;text-transform:uppercase}
.wrymwretch-load-seal{width:clamp(92px,15vh,132px);height:auto;margin-top:6px}
.wrymwretch-load-tip{min-height:2.6em;max-width:46ch;font-size:clamp(15px,1.8vw,18px);line-height:1.3;color:${P.bone};background:rgba(7,8,13,.62);border:1px solid rgba(199,204,211,.28);padding:6px 14px;border-radius:2px;transition:opacity .5s}
.wrymwretch-load-pct{font-family:'Cinzel',Georgia,serif;font-size:13px;letter-spacing:.2em;color:${P.sungold};margin-top:-4px}
@media (max-width:480px){.wrymwretch-load-col{gap:8px;padding:0 26px 30px}.wrymwretch-load-kicker{letter-spacing:.22em}.wrymwretch-load-title{letter-spacing:.04em}}
.wrymwretch-load-tip.fade{opacity:0}
.wrymwretch-load-spin{transform-origin:60px 60px;animation:wrymwretch-load-turn 24s linear infinite}
.wrymwretch-load-root.still .wrymwretch-load-spin{animation:none}
@keyframes wrymwretch-load-turn{to{transform:rotate(360deg)}}
`;

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// A silver reliquary border with fine black crack lines, drawn to the root's size.
function frameSvg(w, h) {
  const r = rng(1407);
  const m = Math.max(10, Math.min(w, h) * 0.025);
  let cracks = "";
  for (let i = 0; i < 26; i++) {
    const side = i % 4;
    let x = side === 0 ? m + r() * (w - 2 * m) : side === 1 ? w - m : side === 2 ? m + r() * (w - 2 * m) : m;
    let y = side === 0 ? m : side === 1 ? m + r() * (h - 2 * m) : side === 2 ? h - m : m + r() * (h - 2 * m);
    let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    const ang = [Math.PI / 2, Math.PI, -Math.PI / 2, 0][side] + (r() - 0.5) * 1.2;
    const n = 3 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) {
      const a = ang + (r() - 0.5) * 1.4, L = 4 + r() * 12;
      x += Math.cos(a) * L; y += Math.sin(a) * L;
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    cracks += `<path d="${d}" stroke="#0b0c10" stroke-width="${(0.5 + r() * 0.8).toFixed(2)}" fill="none" opacity=".85"/>`;
  }
  const corner = (cx, cy, sx, sy) => `<g transform="translate(${cx},${cy}) scale(${sx},${sy})">
      <path d="M0,0 h46 q-14,6 -20,20 q-6,-6 -26,-6z" fill="url(#wwl-silver)" stroke="#0b0c10" stroke-width=".8"/>
      <circle cx="12" cy="12" r="5" fill="${P.ivory}" stroke="#0b0c10" stroke-width=".8"/>
      <path d="M0,0 v46 q6,-14 20,-20 q-6,-6 -6,-26z" fill="url(#wwl-silver)" stroke="#0b0c10" stroke-width=".8"/></g>`;
  return `<svg class="wrymwretch-load-frame" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="wwl-silver" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3eee2"/><stop offset=".45" stop-color="#9aa2ad"/><stop offset=".7" stop-color="#5d646d"/><stop offset="1" stop-color="#d9dde2"/></linearGradient></defs>
    <rect x="${m / 2}" y="${m / 2}" width="${w - m}" height="${h - m}" fill="none" stroke="url(#wwl-silver)" stroke-width="${m * 0.7}"/>
    <rect x="${m * 1.15}" y="${m * 1.15}" width="${w - m * 2.3}" height="${h - m * 2.3}" fill="none" stroke="${P.ivory}" stroke-width="1" opacity=".55"/>
    <rect x="${m / 2}" y="${m / 2}" width="${w - m}" height="${h - m}" fill="none" stroke="#0b0c10" stroke-width="1"/>
    ${cracks}
    ${corner(m * 0.6, m * 0.6, 1, 1)}${corner(w - m * 0.6, m * 0.6, -1, 1)}${corner(m * 0.6, h - m * 0.6, 1, -1)}${corner(w - m * 0.6, h - m * 0.6, -1, -1)}
  </svg>`;
}

// The seal ring: a silver arc fills; six realm gems light as it passes them; a constellation turns inside.
function sealSvg() {
  const gems = REALMS.map(([, c], i) => {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    const x = 60 + Math.cos(a) * 50, y = 60 + Math.sin(a) * 50;
    return `<g data-gem="${i}" opacity=".28"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7.5" fill="${c}" stroke="#0b0c10" stroke-width="1.2"/>
      <circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2.4).toFixed(1)}" r="2" fill="#fff" opacity=".7"/></g>`;
  }).join("");
  const stars = [[60, 30], [78, 48], [72, 72], [48, 74], [40, 50], [60, 56]];
  const lines = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [5, 0], [5, 2]].map(([a, b]) =>
    `<line x1="${stars[a][0]}" y1="${stars[a][1]}" x2="${stars[b][0]}" y2="${stars[b][1]}" stroke="${P.silver}" stroke-width=".7" opacity=".6"/>`).join("");
  return `<svg class="wrymwretch-load-seal" viewBox="0 0 120 120" role="img" aria-label="Loading">
    <circle cx="60" cy="60" r="50" fill="rgba(7,8,13,.6)" stroke="${P.tarnish}" stroke-width="2"/>
    <circle data-arc cx="60" cy="60" r="50" fill="none" stroke="${P.moonsilver}" stroke-width="3.2" stroke-linecap="round"
      stroke-dasharray="314.16" stroke-dashoffset="314.16" transform="rotate(-90 60 60)"/>
    <circle cx="60" cy="60" r="38" fill="none" stroke="${P.tarnish}" stroke-width=".8" stroke-dasharray="2 3"/>
    <g class="wrymwretch-load-spin">${lines}${stars.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 5 ? 2.6 : 1.8}" fill="${P.bone}"/>`).join("")}</g>
    <path data-crack d="M60,10 L57,24 L63,34 L58,46" stroke="#0b0c10" stroke-width="1.4" fill="none" opacity="0"/>
    ${gems}
  </svg>`;
}

export function render(root, ctx) {
  const wrap = document.createElement("div");
  wrap.className = "wrymwretch-load-root" + (ctx.reducedMotion ? " still" : "");
  wrap.innerHTML = `<style>${CSS}</style>
    <img class="wrymwretch-load-still" alt="" src="${ctx.still}">
    <div class="wrymwretch-load-veil"></div>
    <div data-frame></div>
    <div class="wrymwretch-load-col">
      <div class="wrymwretch-load-kicker">The remembering of Wyrmreach</div>
      <h1 class="wrymwretch-load-title"></h1>
      <div class="wrymwretch-load-label"></div>
      <p class="wrymwretch-load-quote">“When the last memory fades, the Astral Architect shall rise.”</p>
      <div class="wrymwretch-load-cite">WrymWretch · the prophecy</div>
      ${sealSvg()}
      <div class="wrymwretch-load-pct" aria-hidden="true">0 / 6 realms</div>
      <div class="wrymwretch-load-tip" aria-live="polite"></div>
    </div>`;
  wrap.querySelector(".wrymwretch-load-title").textContent = ctx.title || "WrymWretch";
  wrap.querySelector(".wrymwretch-load-label").textContent = ctx.label || "";
  root.appendChild(wrap);

  const frameHost = wrap.querySelector("[data-frame]");
  const drawFrame = () => { frameHost.innerHTML = frameSvg(Math.max(1, wrap.clientWidth), Math.max(1, wrap.clientHeight)); };
  drawFrame();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(drawFrame) : null;
  ro && ro.observe(wrap);

  const arc = wrap.querySelector("[data-arc]");
  const crack = wrap.querySelector("[data-crack]");
  const gems = [...wrap.querySelectorAll("[data-gem]")];
  const tip = wrap.querySelector(".wrymwretch-load-tip");
  const pct = wrap.querySelector(".wrymwretch-load-pct");
  let ti = Math.floor(Math.random() * TIPS.length);
  tip.textContent = TIPS[ti];
  const timers = [];
  const iv = setInterval(() => {
    ti = (ti + 1) % TIPS.length;
    if (ctx.reducedMotion) { tip.textContent = TIPS[ti]; return; }
    tip.classList.add("fade");
    timers.push(setTimeout(() => { tip.textContent = TIPS[ti]; tip.classList.remove("fade"); }, 450));
  }, 2600);
  const raf = requestAnimationFrame(() => wrap.classList.add("on"));

  return {
    progress(p) {
      p = Math.max(0, Math.min(1, p));
      arc.setAttribute("stroke-dashoffset", (314.16 * (1 - p)).toFixed(1));
      gems.forEach((g, i) => g.setAttribute("opacity", p >= (i + 0.5) / 6 ? "1" : ".28"));
      crack.setAttribute("opacity", p >= 1 ? ".9" : "0");
      const lit = gems.filter((_, i) => p >= (i + 0.5) / 6).length;
      pct.textContent = p >= 1 ? "remembered" : `${lit} / 6 realms`;
    },
    close() {
      clearInterval(iv);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      ro && ro.disconnect();
      wrap.remove();
    },
  };
}

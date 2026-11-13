// A Journey Into the Heartstream: loading screen.
// The marrow-cavern still under a cold blue wash; a Blue-Born hand that reddens from the wrist up as
// the game loads ("the red that climbs the players' arms"), pulsing on a 60 bpm heartbeat, while the
// edges of the screen breathe light on the same beat.
//
// Quoted line, verbatim from the author's text (DESIGN.md section 3):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "They live in a labyrinth of glowing marrow tunnels, where the walls pulse faintly with the rhythm of the distant heart."

export const meta = {
  cover: "assets/stills/heartstream/01-marrow-caverns.jpg",
  palette: { bg: "#1E3557", fg: "#E8DCC4", accent: "#E0603A" },
  fonts: "family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=Alegreya+Sans:wght@400;700",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Alegreya Sans', 'Trebuchet MS', sans-serif",
  menuIntro: "Four Blue-Born brothers grow up in the marrow, then row a living raft down a river of blood to the heart. Every mode here keeps time with that heart; the other brothers are your companions.",
};

const QUOTE = "They live in a labyrinth of glowing marrow tunnels, where the walls pulse faintly with the rhythm of the distant heart.";
const TIPS = [
  "Everything is judged against the heartbeat. Act on the pulse, not between pulses.",
  "On the river, row on the beat; when the drone sounds, hold Hush until the eye closes.",
  "In the shaft, a hold grabbed on the beat is firm. When the holds glisten, brace and cling.",
  "A Reach gains two holds on the very heart of the beat, and slides you two when it misses.",
  "Carve with the grain: a stroke across it costs two. Rub the ink to find the knots.",
  "In Marrow-Song, joins that step by one or less are smooth. The heart verse must end home, on 1.",
  "Bone Counters: tap Drop as each counter falls. A last counter on the beat into a hollow of three rings it.",
  "On the Branch Chart, a tie goes to the strongest current. The body simply moves them on.",
];

// Port of hand_d() in games/heartstream/pictographs/make.py: an open hand, palm and five fingers.
function handPath(cx, cy, s) {
  const pt = (x, y) => `${(cx + x * s).toFixed(1)},${(cy + y * s).toFixed(1)}`;
  const parts = [];
  const palm = [];
  for (let i = 0; i < 20; i++) { const t = (i * Math.PI) / 10; palm.push(pt(Math.cos(t) * 26, Math.sin(t) * 30 + 8)); }
  parts.push("M" + palm.join(" L") + "Z");
  for (const [bx, ln, ang, wd] of [[-30, 52, -38, 0.85], [-13, 72, -12, 1], [4, 76, 2, 1.05], [20, 68, 14, 0.95], [36, 40, 52, 0.8]]) {
    const a = ((ang - 90) * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, w = 7.5 * wd;
    const b = [bx * 0.75, Math.abs(bx) < 30 ? -12 : 6];
    const q = [[b[0] + nx * w, b[1] + ny * w], [b[0] + ux * ln + nx * w, b[1] + uy * ln + ny * w], [b[0] + ux * (ln + w), b[1] + uy * (ln + w)],
      [b[0] + ux * ln - nx * w, b[1] + uy * ln - ny * w], [b[0] - nx * w, b[1] - ny * w]];
    parts.push("M" + q.map(([x, y]) => pt(x, y)).join(" L") + "Z");
  }
  return parts.join(" ");
}

export function render(root, ctx) {
  const P = "heartstream-load-";
  const el = document.createElement("div");
  el.className = P + "root";
  const css = document.createElement("style");
  css.textContent = `
.${P}root{position:absolute;inset:0;overflow:hidden;background:#0c1426;color:#E8DCC4;font-family:'Alegreya Sans','Trebuchet MS',sans-serif}
.${P}still{position:absolute;inset:-2%;width:104%;height:104%;object-fit:cover;filter:grayscale(.55) contrast(1.1) brightness(.55);opacity:.9}
.${P}wash{position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,53,87,.55),rgba(14,24,44,.82) 70%,#0c1426);mix-blend-mode:normal}
.${P}blue{position:absolute;inset:0;background:#2F5D8C;mix-blend-mode:color;opacity:.75}
.${P}red{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(0deg,rgba(179,32,46,.55),rgba(122,16,32,.25) 70%,rgba(122,16,32,0));mix-blend-mode:screen;transition:height .25s linear}
.${P}rim{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 90px 10px rgba(127,178,224,.35);opacity:.35}
.${P}text{position:absolute;left:clamp(16px,6vw,90px);right:clamp(16px,6vw,90px);top:clamp(20px,9vh,110px);max-width:760px}
.${P}label{font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:#7FB2E0}
.${P}title{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(34px,6.4vw,84px);line-height:.98;margin:.25em 0 .35em;text-wrap:balance;text-shadow:0 2px 30px rgba(0,0,0,.6)}
.${P}quote{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(17px,2.1vw,25px);line-height:1.35;max-width:34em;color:#e9dfca;margin:0;border-left:2px solid #E0603A;padding-left:14px}
.${P}hand{position:absolute;right:clamp(10px,7vw,120px);bottom:clamp(70px,14vh,150px);width:clamp(130px,22vw,260px);height:auto;overflow:visible}
.${P}vein{position:absolute;left:clamp(16px,6vw,90px);right:clamp(16px,6vw,90px);bottom:clamp(64px,11vh,100px);height:4px;background:rgba(127,178,224,.25);border-radius:2px;overflow:hidden}
.${P}vein i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2F5D8C,#B3202E 60%,#E0603A)}
.${P}tip{position:absolute;left:clamp(16px,6vw,90px);right:clamp(16px,6vw,90px);bottom:clamp(18px,5vh,46px);font-size:clamp(14px,1.6vw,17px);line-height:1.4;max-width:46em;transition:opacity .5s}
.${P}tip b{color:#7FB2E0;font-weight:700;letter-spacing:.14em;font-size:.78em;text-transform:uppercase;margin-right:.6em}
@media (max-width:620px){.${P}hand{width:110px;bottom:150px;opacity:.85}.${P}vein{bottom:120px}.${P}label{font-size:12px}}
`;
  el.appendChild(css);
  const img = document.createElement("img");
  img.className = P + "still"; img.alt = ""; img.src = ctx.still || meta.cover;
  const wash = document.createElement("div"); wash.className = P + "wash";
  const blue = document.createElement("div"); blue.className = P + "blue";
  const red = document.createElement("div"); red.className = P + "red";
  const rim = document.createElement("div"); rim.className = P + "rim";
  el.append(img, blue, wash, red, rim);

  const text = document.createElement("div");
  text.className = P + "text";
  text.innerHTML = `<div class="${P}label"></div><h1 class="${P}title"></h1><p class="${P}quote"></p>`;
  text.querySelector("." + P + "label").textContent = ctx.label && ctx.label !== "Loading" ? `Loading · ${ctx.label}` : "The Rite of the Blue-Born";
  text.querySelector("." + P + "title").textContent = ctx.title || "A Journey Into the Heartstream";
  text.querySelector("." + P + "quote").textContent = `“${QUOTE}”`;
  el.appendChild(text);

  // The hand: blue skin, with red rising from the wrist as progress climbs.
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "-70 -100 140 170");
  svg.setAttribute("class", P + "hand");
  svg.setAttribute("aria-hidden", "true");
  const d = handPath(0, 0, 1) + " M-22,30 L22,30 L20,68 L-20,68Z";
  svg.innerHTML = `
    <defs>
      <clipPath id="${P}clip"><path d="${d}"/></clipPath>
      <radialGradient id="${P}glow"><stop offset="0" stop-color="#7FB2E0" stop-opacity=".55"/><stop offset="1" stop-color="#7FB2E0" stop-opacity="0"/></radialGradient>
    </defs>
    <circle class="${P}halo" cx="0" cy="-10" r="95" fill="url(#${P}glow)"/>
    <g clip-path="url(#${P}clip)">
      <rect x="-70" y="-100" width="140" height="170" fill="#2F5D8C"/>
      <rect class="${P}fill" x="-70" y="68" width="140" height="0" fill="#B3202E"/>
      <rect class="${P}edge" x="-70" y="66" width="140" height="3" fill="#E0603A"/>
    </g>
    <path d="${d}" fill="none" stroke="#E8DCC4" stroke-width="1.6" stroke-linejoin="round" opacity=".85"/>`;
  el.appendChild(svg);
  const fill = svg.querySelector("." + P + "fill"), edge = svg.querySelector("." + P + "edge"), halo = svg.querySelector("." + P + "halo");

  const tip = document.createElement("div");
  tip.className = P + "tip";
  tip.setAttribute("aria-live", "polite");
  const vein = document.createElement("div"); vein.className = P + "vein"; vein.innerHTML = "<i></i>";
  vein.setAttribute("role", "progressbar"); vein.setAttribute("aria-label", "Loading");
  el.append(vein, tip);
  const veinFill = vein.querySelector("i");
  let tipI = Math.floor(Math.random() * TIPS.length);
  const showTip = () => { tip.innerHTML = `<b>How it plays</b><span></span>`; tip.querySelector("span").textContent = TIPS[tipI % TIPS.length]; tipI++; };
  showTip();
  let fadeTimer = 0;
  const tipTimer = setInterval(() => {
    if (ctx.reducedMotion) { showTip(); return; }
    tip.style.opacity = "0";
    fadeTimer = setTimeout(() => { showTip(); tip.style.opacity = "1"; }, 450);
  }, 2600);
  root.appendChild(el);

  let shown = 0, target = 0, raf = 0;
  const t0 = performance.now();
  const frame = (now) => {
    shown += (target - shown) * (ctx.reducedMotion ? 1 : 0.12);
    const h = 168 * shown;
    fill.setAttribute("y", String(68 - h)); fill.setAttribute("height", String(h));
    edge.setAttribute("y", String(66 - h));
    red.style.height = `${Math.round(shown * 62)}%`;
    veinFill.style.width = `${(shown * 100).toFixed(1)}%`;
    if (!ctx.reducedMotion) {
      // 60 bpm: a sharp systole, then a slow ease back.
      const ph = ((now - t0) / 1000) % 1;
      const beat = Math.exp(-ph * 7) + 0.45 * Math.exp(-Math.max(0, ph - 0.18) * 9) * (ph > 0.18 ? 1 : 0);
      svg.style.transform = `scale(${1 + 0.035 * beat})`;
      rim.style.opacity = String(0.18 + 0.5 * beat);
      halo.setAttribute("r", String(85 + 18 * beat));
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    progress(p) { target = Math.max(target, Math.min(1, p || 0)); },
    close() { cancelAnimationFrame(raf); clearInterval(tipTimer); clearTimeout(fadeTimer); el.remove(); },
  };
}

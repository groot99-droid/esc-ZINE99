// People of the Bark: the loading screen.
// The tremor still, graded warm like a tilt-shift miniature; dust drifting down from the ridges; the
// title in a manuscript face; one verbatim line of the treatment; and sap running along a crack in
// the bark as the progress bar.
//
// Quoted line: "At dawn, the bark people wake to a strange vibration."
//   creative-writing/vault/05_Worldbuilding/01_People_of_the_Bark.md (DESIGN.md section 3, The Tremor)

export const meta = {
  cover: "assets/stills/people-of-the-bark/01-the-tremor.jpg",
  // DESIGN.md 15: bark umber and grey-brown; lichen sage and lime; sap amber and gold; lantern orange.
  palette: { bg: "#1b120c", fg: "#efe2c4", accent: "#d9902a" },
  fonts: "family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Silkscreen",
  display: "'IM Fell English', 'Cormorant Garamond', Georgia, serif",
  body: "'Cormorant Garamond', Georgia, serif",
  menuIntro: "A tiny people on the bark of the Endless Trunk read every tremor, gust and shadow as a sign. You can see what really happened; they can never be told. Run their cracks, hold their barricades, and play the games they read their world with.",
};

const TIPS = [
  "Every event has an ordinary cause. Turn the Backyard card to see it; the people never will.",
  "A reading whose meaning fits the real cause pays off in practice. They will thank the gods.",
  "In the crack runner, hold Brace when the tremor marker lights, or Mossa is knocked a ledge down.",
  "Before a beetle comes, the reading decides it: a monster is fought, a god is escorted.",
  "Sound the fall-back before a barricade breaks. Warriors left on a falling line are lost.",
  "Ring Door: turning one ring turns the next ring in, the other way. Count before you cut.",
  "Old Resin names what each pot is like. Her book's blank entries tell you what to aim for.",
  "The squirrel keeps a routine. The Tremor Scroll is how the scholars learn it without a word for squirrel.",
];

export function render(root, ctx) {
  const P = "people-of-the-bark-load-";
  const el = document.createElement("div");
  el.className = P + "root";
  el.innerHTML = `
<style>
.${P}root{position:absolute;inset:0;overflow:hidden;background:#1b120c;color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif}
.${P}still{position:absolute;inset:-3%;background-size:cover;background-position:30% 50%;filter:sepia(.35) saturate(1.15) contrast(1.05) brightness(.82);transform-origin:50% 60%}
.${P}grade{position:absolute;inset:0;background:
  radial-gradient(ellipse 70% 60% at 38% 45%,transparent 30%,rgba(27,18,12,.55) 70%,rgba(27,18,12,.95) 100%),
  linear-gradient(180deg,rgba(27,18,12,.65) 0%,transparent 22%,transparent 55%,rgba(27,18,12,.92) 82%);}
.${P}blur{position:absolute;inset:0;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
  mask-image:linear-gradient(180deg,#000 0%,transparent 26%,transparent 62%,#000 90%);-webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 26%,transparent 62%,#000 90%)}
.${P}dust{position:absolute;inset:0;width:100%;height:100%}
.${P}foot{position:absolute;left:max(16px,6vw);right:max(16px,6vw);bottom:clamp(16px,4vh,40px);display:flex;flex-direction:column;gap:clamp(14px,3vh,26px)}
.${P}kick{font-family:'Silkscreen',monospace;font-size:11px;letter-spacing:.18em;color:#f0c050;text-transform:uppercase;margin-bottom:10px}
.${P}title{font-family:'IM Fell English',Georgia,serif;font-size:clamp(40px,8vw,104px);line-height:.92;margin:0;color:#efe2c4;text-shadow:0 2px 24px rgba(0,0,0,.6)}
.${P}quote{font-family:'IM Fell English',Georgia,serif;font-style:italic;font-size:clamp(17px,2.2vw,24px);margin:14px 0 0;max-width:34ch;color:#e9d6ae}
.${P}quote::before{content:"\\201C"}.${P}quote::after{content:"\\201D"}
.${P}tip{font-size:clamp(15px,1.6vw,18px);min-height:2.6em;display:flex;gap:10px;align-items:flex-start;color:#d8c8a4;transition:opacity .45s}
.${P}tip b{font-family:'Silkscreen',monospace;font-weight:400;font-size:10px;letter-spacing:.14em;color:#c4d65a;padding-top:4px;white-space:nowrap}
.${P}crack{height:26px}
@media (max-width:560px){.${P}tip{flex-direction:column;gap:4px}}
.${P}crack svg{width:100%;height:100%;overflow:visible;display:block}
.${P}label{position:absolute;right:max(16px,6vw);top:18px;font-family:'Silkscreen',monospace;font-size:10px;letter-spacing:.16em;color:#c9b99a;text-transform:uppercase}
</style>
<div class="${P}still"></div>
<div class="${P}blur"></div>
<div class="${P}grade"></div>
<canvas class="${P}dust"></canvas>
<div class="${P}label"></div>
<div class="${P}foot"><div class="${P}text">
  <div class="${P}kick">The Endless Trunk · the year of the message</div>
  <h1 class="${P}title"></h1>
  <p class="${P}quote">At dawn, the bark people wake to a strange vibration.</p>
</div>
<div class="${P}crack"><svg viewBox="0 0 1000 26" preserveAspectRatio="none" aria-hidden="true">
  <path class="${P}c-bed" d="" fill="none" stroke="#0d0805" stroke-width="9" stroke-linecap="round"/>
  <path class="${P}c-rim" d="" fill="none" stroke="#7d6c5a" stroke-width="1.2" stroke-opacity=".7" transform="translate(0,-5)"/>
  <path class="${P}c-sap" d="" fill="none" stroke="#d9902a" stroke-width="5" stroke-linecap="round"/>
  <path class="${P}c-glow" d="" fill="none" stroke="#f0c050" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".9"/>
  <circle class="${P}c-drop" r="5.5" fill="#f0c050"/>
</svg></div>
<div class="${P}tip" role="status"><b>HOW IT PLAYS</b><span></span></div></div>`;
  root.appendChild(el);
  el.querySelector("." + P + "still").style.backgroundImage = `url("${meta.cover}")`;
  el.querySelector("." + P + "title").textContent = ctx.title || "People of the Bark";
  el.querySelector("." + P + "label").textContent = ctx.label || "Loading";

  // The crack: a jagged line across the bottom, built once.
  const pts = [];
  let y = 13;
  for (let x = 0; x <= 1000; x += 20) {
    y = Math.max(6, Math.min(20, y + (Math.sin(x * 0.037) * 3 + Math.cos(x * 0.11) * 2.2)));
    pts.push([x, +y.toFixed(1)]);
  }
  const d = "M" + pts.map((p) => p.join(",")).join("L");
  for (const c of ["c-bed", "c-rim", "c-sap", "c-glow"]) el.querySelector("." + P + c).setAttribute("d", d);
  const sap = el.querySelector("." + P + "c-sap");
  const glow = el.querySelector("." + P + "c-glow");
  const drop = el.querySelector("." + P + "c-drop");
  const len = sap.getTotalLength ? sap.getTotalLength() : 1100;
  for (const s of [sap, glow]) { s.style.strokeDasharray = `${len} ${len}`; s.style.strokeDashoffset = String(len); }

  // Tips rotate.
  const tipEl = el.querySelector("." + P + "tip");
  const tipText = tipEl.querySelector("span");
  let tipIdx = Math.floor(Math.random() * TIPS.length);
  tipText.textContent = TIPS[tipIdx];
  const timers = [];
  timers.push(setInterval(() => {
    tipEl.style.opacity = "0";
    timers.push(setTimeout(() => { tipIdx = (tipIdx + 1) % TIPS.length; tipText.textContent = TIPS[tipIdx]; tipEl.style.opacity = "1"; }, ctx.reducedMotion ? 0 : 420));
  }, 2600));

  // Dust from the ridges, and a small tremor now and then.
  const cv = el.querySelector("." + P + "dust");
  const g = cv.getContext("2d");
  const still = el.querySelector("." + P + "still");
  let W = 0, H = 0, raf = 0, last = performance.now(), t = 0, progress = 0, shown = 0;
  const motes = [];
  function size() {
    const r = el.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  const ro = new ResizeObserver(size); ro.observe(el);
  for (let i = 0; i < (ctx.reducedMotion ? 30 : 90); i++) motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, v: 0.02 + Math.random() * 0.05, s: Math.random() * 6 });

  function drawMotes(shake) {
    g.clearRect(0, 0, W, H);
    for (const m of motes) {
      const a = 0.25 + 0.5 * Math.min(1, m.r / 2);
      g.fillStyle = `rgba(233,214,174,${a * (0.6 + shake)})`;
      g.beginPath();
      g.arc(m.x * W + Math.sin(t * 0.7 + m.s) * 6, m.y * H, m.r, 0, Math.PI * 2);
      g.fill();
    }
  }
  function setBar(p) {
    const off = len * (1 - p);
    sap.style.strokeDashoffset = String(off);
    glow.style.strokeDashoffset = String(off);
    const at = sap.getPointAtLength ? sap.getPointAtLength(Math.max(0.1, len * p)) : { x: 1000 * p, y: 13 };
    drop.setAttribute("cx", at.x); drop.setAttribute("cy", at.y);
  }
  setBar(0);

  if (ctx.reducedMotion) {
    drawMotes(0.3);
  } else {
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      // a tremor every 2.4 s, lasting 0.5 s
      const ph = t % 2.4;
      const shake = ph < 0.5 ? Math.sin(ph * 60) * (0.5 - ph) * 2 : 0;
      still.style.transform = `translate(${(shake * 4).toFixed(2)}px,${(Math.abs(shake) * 2).toFixed(2)}px) scale(1.04)`;
      for (const m of motes) {
        m.y += m.v * dt * (1 + Math.abs(shake) * 6);
        if (m.y > 1.02) { m.y = -0.02; m.x = Math.random(); }
      }
      drawMotes(Math.abs(shake));
      shown += (progress - shown) * Math.min(1, dt * 8);
      setBar(shown);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  return {
    progress(p) { progress = Math.max(0, Math.min(1, p)); if (ctx.reducedMotion) setBar(progress); },
    close() {
      cancelAnimationFrame(raf);
      timers.forEach((x) => { clearInterval(x); clearTimeout(x); });
      ro.disconnect();
      el.remove();
    },
  };
}

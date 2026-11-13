// Project: Man Eater — loading screen.
//
// The tall hall still, washed to the 2D palette (ink, wall cream, print), with the rules card
// screwed to the bunk door. The progress element is the bunk-room clock: its minute hand climbs
// from nine toward 10:00 precisely, and the card's rule two is the line it is counting down to.
//
// Quoted line, verbatim from creative-writing/vault/03_Stories/07_Project_-_Man_Eater.md, line 29
// (also quoted in games/man-eater/DESIGN.md section 3, beat 5):
//   "Do not, under any circumstances, leave this room after 10:00 precisely."

export const meta = {
  cover: "assets/stills/man-eater/02-tall-halls.jpg",
  // DESIGN.md section 15: ink, wall.cream, sodium
  palette: { bg: "#1B1D1F", fg: "#D9D2BF", accent: "#D9A441" },
  fonts: "family=Special+Elite&family=Stardos+Stencil:wght@400;700&family=Courier+Prime:wght@400;700",
  display: "'Stardos Stencil', 'Courier Prime', monospace",
  body: "'Courier Prime', 'Courier New', monospace",
  menuIntro: "Seven days and nights on a base in the North Dakota woods. Eat what is served and grow strong enough to break a rule, or refuse it and stay yourself. Here are the halls, the yard, the card table, the tray, the chart and the plan.",
};

const TIPS = [
  "Every piece you eat makes you taller, stronger and hungrier, and takes a little of your mind.",
  "In the halls the guards see your shadow before they see you. Crouch to shorten it.",
  "Out in the yard your footprints stay. A patrol that finds a fresh print will follow it.",
  "At the card table, bid exactly what you take. Only exact bidders get bread.",
  "The orderly's gaze rests on you for a few seconds of every eight. Pocket food when it moves on.",
  "Read your own chart: two cells that show a trend can break an explanation you gave yourself.",
  "You grew. The same hall walked later counts fewer paces. Convert before you trust the plan.",
];

export function render(root, ctx) {
  const reduce = !!ctx.reducedMotion;
  const css = `
  .me-load{position:absolute;inset:0;overflow:hidden;background:#1B1D1F;color:#D9D2BF;font-family:'Courier Prime','Courier New',monospace}
  .me-load-still{position:absolute;inset:-3%;background-size:cover;background-position:50% 40%;filter:grayscale(1) contrast(1.15) brightness(.55) sepia(.25);opacity:0;transition:opacity 900ms ease}
  .me-load-still.on{opacity:1}
  .me-load-veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(27,29,31,.94) 0%,rgba(27,29,31,.72) 46%,rgba(27,29,31,.2) 100%),repeating-linear-gradient(0deg,rgba(217,210,191,.035) 0 1px,transparent 1px 3px)}
  .me-load-wrap{position:absolute;inset:0;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:24px;align-items:center;padding:clamp(16px,4vw,56px)}
  .me-load-l{min-width:0}
  .me-load-kick{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#7C8C99;margin:0 0 14px}
  .me-load-title{font-family:'Stardos Stencil','Courier Prime',monospace;font-weight:700;font-size:clamp(40px,7.4vw,104px);line-height:.88;margin:0;text-transform:uppercase;letter-spacing:.02em;color:#D9D2BF}
  .me-load-title span{display:block;font-size:.42em;letter-spacing:.3em;color:#D9A441;margin-bottom:.25em}
  .me-load-card{margin:26px 0 0;max-width:46ch;background:#D9D2BF;color:#1B1D1F;padding:16px 18px 14px;position:relative;box-shadow:0 10px 30px rgba(0,0,0,.5);transform:rotate(-1.2deg)}
  .me-load-card::before,.me-load-card::after{content:"";position:absolute;top:8px;width:9px;height:9px;border-radius:50%;background:#8A8F93;box-shadow:inset -2px -2px 0 rgba(0,0,0,.35)}
  .me-load-card::before{left:8px}.me-load-card::after{right:8px}
  .me-load-card h3{margin:0 0 6px;font-family:'Stardos Stencil',monospace;font-size:13px;letter-spacing:.25em;text-transform:uppercase}
  .me-load-card blockquote{margin:0;font-family:'Special Elite','Courier Prime',monospace;font-size:clamp(16px,1.9vw,21px);line-height:1.35}
  .me-load-card cite{display:block;margin-top:8px;font-style:normal;font-size:11px;letter-spacing:.08em;color:#5A4F5E}
  .me-load-tip{margin:24px 0 0;max-width:52ch;min-height:3.2em;font-size:14px;line-height:1.45;color:#D9D2BF;opacity:.86;transition:opacity 400ms}
  .me-load-tip b{color:#D9A441;font-weight:700;letter-spacing:.12em;margin-right:8px;font-size:11px}
  .me-load-r{display:flex;flex-direction:column;align-items:center;gap:14px;min-width:0}
  .me-load-clock{width:min(34vh,30vw,300px);height:auto;filter:drop-shadow(0 12px 28px rgba(0,0,0,.6))}
  .me-load-time{font-size:15px;font-weight:700;letter-spacing:.25em;color:#7C8C99}
  .me-load-bar{width:160px;height:4px;background:rgba(217,210,191,.2);margin:6px 0}
  .me-load-bar i{display:block;height:100%;width:0;background:#D9A441}
  .me-load-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#D9A441}
  @media (max-width:720px){.me-load-bar{width:120px}.me-load-wrap{grid-template-columns:1fr;align-content:center;gap:12px}.me-load-r{order:-1;flex-direction:row}.me-load-clock{width:110px}.me-load-card{margin-top:16px}.me-load-tip{margin-top:14px}}
  `;
  root.innerHTML = `<style>${css}</style>
  <div class="me-load">
    <div class="me-load-still"></div><div class="me-load-veil"></div>
    <div class="me-load-wrap">
      <div class="me-load-l">
        <p class="me-load-kick">North Dakota · Bunk room · Rules card</p>
        <h1 class="me-load-title"><span>Project:</span>Man Eater</h1>
        <div class="me-load-card"><h3>Rule two</h3>
          <blockquote>“Do not, under any circumstances, leave this room after 10:00 precisely.”</blockquote>
          <cite>Project: Man Eater, line 29</cite></div>
        <p class="me-load-tip" aria-live="polite"></p>
      </div>
      <div class="me-load-r">
        <svg class="me-load-clock" viewBox="-110 -110 220 220" role="img" aria-label="The bunk-room clock"></svg>
        <div><div class="me-load-time">21:00</div><div class="me-load-bar"><i></i></div><div class="me-load-label"></div></div>
      </div>
    </div>
  </div>`;
  const still = root.querySelector(".me-load-still");
  const img = new Image();
  img.onload = () => still.classList.add("on");
  img.src = meta.cover;
  still.style.backgroundImage = `url("${meta.cover}")`;
  root.querySelector(".me-load-label").textContent = ctx.label || "Loading";

  // the clock face
  const NS = "http://www.w3.org/2000/svg";
  const svg = root.querySelector(".me-load-clock");
  const el = (n, a, parent = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); parent.appendChild(e); return e; };
  el("circle", { r: 104, fill: "#8A8F93" });
  el("circle", { r: 96, fill: "#D9D2BF" });
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
    const r1 = big ? 78 : 86, r2 = 92;
    el("line", { x1: Math.sin(a) * r1, y1: -Math.cos(a) * r1, x2: Math.sin(a) * r2, y2: -Math.cos(a) * r2, stroke: "#1B1D1F", "stroke-width": big ? 4 : 1.4 });
  }
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const t = el("text", { x: Math.sin(a) * 64, y: -Math.cos(a) * 64 + 7, "text-anchor": "middle", "font-size": 19, "font-family": "'Stardos Stencil',monospace", fill: h === 10 ? "#9b2f22" : "#1B1D1F" });
    t.textContent = h;
  }
  // the ten o'clock mark the night is counted toward
  const a10 = (10 / 12) * Math.PI * 2;
  el("circle", { cx: Math.sin(a10) * 64, cy: -Math.cos(a10) * 64, r: 16, fill: "none", stroke: "#9b2f22", "stroke-width": 2, opacity: 0.8 });
  const hour = el("line", { x1: 0, y1: 10, x2: 0, y2: -44, stroke: "#1B1D1F", "stroke-width": 7, "stroke-linecap": "round" });
  const minute = el("line", { x1: 0, y1: 14, x2: 0, y2: -76, stroke: "#1B1D1F", "stroke-width": 4, "stroke-linecap": "round" });
  const second = el("line", { x1: 0, y1: 18, x2: 0, y2: -84, stroke: "#9b2f22", "stroke-width": 1.6 });
  el("circle", { r: 6, fill: "#1B1D1F" });
  // frost creeping in from the rim as the hour closes
  const frost = el("circle", { r: 99, fill: "none", stroke: "#EEF1F2", "stroke-width": 0, opacity: 0.5 });

  let p = 0, shown = 0, raf = 0, last = performance.now(), sec = 0;
  const timeEl = root.querySelector(".me-load-time");
  const barEl = root.querySelector(".me-load-bar i");
  const set = (v) => {
    // 21:00 -> 22:00 across the load
    const mins = v * 60;
    minute.setAttribute("transform", `rotate(${mins * 6})`);
    hour.setAttribute("transform", `rotate(${(9 + mins / 60) * 30})`);
    frost.setAttribute("stroke-width", (v * 10).toFixed(1));
    barEl.style.width = (v * 100).toFixed(1) + "%";
    const m = Math.min(59, Math.floor(mins));
    timeEl.textContent = v >= 1 ? "22:00" : `21:${String(m).padStart(2, "0")}`;
  };
  set(0);
  const frame = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    shown += (p - shown) * Math.min(1, dt * 6);
    set(shown);
    sec = (sec + dt) % 60;
    // the second hand ticks, it does not sweep: the night's metronome
    second.setAttribute("transform", `rotate(${Math.floor(sec) * 6})`);
    raf = requestAnimationFrame(frame);
  };
  if (!reduce) raf = requestAnimationFrame(frame);

  // rotating tip
  const tipEl = root.querySelector(".me-load-tip");
  let ti = Math.floor(Math.random() * TIPS.length);
  const showTip = () => { tipEl.innerHTML = "<b>NOTE</b>"; tipEl.appendChild(document.createTextNode(TIPS[ti % TIPS.length])); ti++; };
  showTip();
  const tipTimer = setInterval(() => {
    if (reduce) { showTip(); return; }
    tipEl.style.opacity = "0";
    setTimeout(() => { showTip(); tipEl.style.opacity = ".86"; }, 380);
  }, 2600);

  return {
    progress(v) { p = Math.max(0, Math.min(1, v)); if (reduce) set(p); },
    close() { cancelAnimationFrame(raf); clearInterval(tipTimer); },
  };
}

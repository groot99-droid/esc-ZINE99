// The Endless Temple: loading screen.
// An open book on the reading table. The left page is an illustration plate (the still, inked onto
// vellum in honey and walnut); the right page carries the title, the line Elaris says over the
// nameless book, and a rotating tip. Sand sifts out of the bottom of the pages and heaps in the
// gutter below: the heap is the progress bar, as the sand book leaks until it is read.

export const meta = {
  cover: "assets/stills/endless-temple/01-elaris-wakes.jpg",
  // DESIGN.md section 15: walnut, honey gold, vellum cream (sage, moon silver, bruise purple in modes)
  palette: { bg: "#22170e", fg: "#f3ead2", accent: "#d4a23a" },
  fonts: "family=IM+Fell+English:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,600;1,400",
  display: "'IM Fell English', 'EB Garamond', Georgia, serif",
  body: "'EB Garamond', Georgia, serif",
  menuIntro:
    "Elaris Sel Marden keeps a temple where every book is a living world. Brew the tea, read yourself into the sand book, and find out what to call it. These are its drawn pages and its table-top puzzles; the temple halls themselves are built in 3D.",
};

// Source: creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md
// (DESIGN.md section 3, beat 8), quoted verbatim.
const QUOTE = "Well, I guess since this one doesn't have a name, I'll just have to read this one and find out what to call it,";

const TIPS = [
  "The tea decides how deep you read. Three spoons, one steep dial, and the book's card to meet.",
  "As the tea fades, “I” becomes “he”: your hold on the narrator slips. Sip to steady it.",
  "On the sand sea, pump down the face of a wave and release at the crest to jump.",
  "In the stacks, follow the motes. Where they thicken, the calling book is near.",
  "A rule is read by its words. Tap an underlined word to learn what it really forbids.",
  "A rule with “or” in it is a price, not a ban.",
  "A named book rests: its sand stops running.",
  "Adjacent gears turn opposite ways. Count before you place.",
];

export function render(root, ctx) {
  const rm = !!ctx.reducedMotion;
  const P = "endless-temple-load-";
  const style = document.createElement("style");
  style.textContent = `
  .${P}root{position:absolute;inset:0;overflow:hidden;background:
    radial-gradient(120% 90% at 50% 30%, #4a3220 0%, #2b1d12 55%, #170f09 100%);color:#f3ead2;
    font-family:'EB Garamond',Georgia,serif;display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:18px 16px 0;box-sizing:border-box;opacity:1;transition:opacity .28s}
  .${P}root.${P}out{opacity:0}
  .${P}book{position:relative;display:grid;grid-template-columns:1fr 1fr;width:min(1060px,96%);
    aspect-ratio:2.05/1;max-height:62vh;background:#efe3c4;border-radius:4px 4px 6px 6px;
    box-shadow:0 0 0 6px #5a3d27,0 0 0 8px #3a2716,0 18px 50px rgba(0,0,0,.6);}
  .${P}book::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:60px;transform:translateX(-50%);
    background:linear-gradient(90deg,transparent,rgba(90,61,39,.28) 45%,rgba(60,40,24,.42) 50%,rgba(90,61,39,.28) 55%,transparent);pointer-events:none}
  .${P}page{position:relative;padding:5% 7%;box-sizing:border-box;min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:center}
  .${P}page::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;
    background-image:radial-gradient(rgba(90,61,39,.18) 1px,transparent 1.2px);background-size:5px 5px}
  .${P}plate{position:relative;width:100%;flex:1;min-height:0;border:1px solid #5a3d27;outline:1px solid rgba(90,61,39,.4);outline-offset:4px;overflow:hidden;background:#e9d9b3}
  .${P}plate img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:sepia(.55) saturate(.85) contrast(1.06) brightness(1.04);mix-blend-mode:multiply;opacity:.95}
  .${P}plate::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 40px rgba(212,162,58,.45);}
  .${P}cap{font-style:italic;font-size:14px;color:#5a3d27;text-align:center;margin-top:8px}
  .${P}title{font-family:'IM Fell English','EB Garamond',Georgia,serif;color:#3a2716;font-size:clamp(26px,4.2vw,56px);line-height:.98;margin:0 0 .25em;text-wrap:balance}
  .${P}label{font-variant:small-caps;letter-spacing:.12em;color:#8a6a2a;font-size:clamp(13px,1.3vw,15px);margin-bottom:1em}
  .${P}orn{width:60%;height:12px;margin:.2em 0 1em;color:#b98a2c}
  .${P}quote{font-style:italic;color:#3a2716;font-size:clamp(15px,1.55vw,19px);line-height:1.35;margin:0;text-wrap:pretty}
  .${P}quote small{display:block;font-style:normal;font-size:max(13px,.72em);color:#7a5d3a;margin-top:.5em;letter-spacing:.04em}
  .${P}tip{margin-top:auto;padding-top:1em;color:#4a3020;font-size:clamp(14px,1.3vw,16px);min-height:3.2em;transition:opacity .4s}
  .${P}tip b{font-variant:small-caps;letter-spacing:.1em;color:#8a6a2a;font-weight:600;margin-right:.4em}
  .${P}sand{position:relative;width:min(1060px,96%);height:min(22vh,150px);flex:none}
  .${P}sand canvas{position:absolute;inset:0;width:100%;height:100%}
  .${P}pct{position:absolute;right:0;top:4px;font-variant:small-caps;letter-spacing:.14em;font-size:14px;color:#e5c27a;background:rgba(23,15,9,.85);padding:1px 8px;border-radius:3px;z-index:1}
  @media (max-width:640px){
    .${P}book{grid-template-columns:1fr;aspect-ratio:auto;max-height:none;width:100%}
    .${P}book::after{display:none}
    .${P}page.${P}left{height:26vh}
    .${P}title{font-size:30px}
    .${P}sand{height:16vh;width:100%}
  }`;
  const wrap = document.createElement("div");
  wrap.className = P + "root";
  wrap.innerHTML = `
    <div class="${P}book" role="img" aria-label="An open book with an illustration plate; sand sifts from its pages.">
      <div class="${P}page ${P}left">
        <div class="${P}plate"><img alt="" src="${ctx.still}"></div>
        <div class="${P}cap">Plate the first. ~ The keeper, and the morning light.</div>
      </div>
      <div class="${P}page">
        <h1 class="${P}title"></h1>
        <div class="${P}label"></div>
        <svg class="${P}orn" viewBox="0 0 200 12" aria-hidden="true"><path d="M2 6 C40 -2 60 14 100 6 C140 -2 160 14 198 6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="6" r="2.6" fill="currentColor"/></svg>
        <p class="${P}quote">“${QUOTE}”<small>Elaris, over the book with no name</small></p>
        <div class="${P}tip" aria-live="polite"><b>Reading tip</b><span></span></div>
      </div>
    </div>
    <div class="${P}sand"><canvas></canvas><span class="${P}pct">0</span></div>`;
  wrap.querySelector("." + P + "title").textContent = ctx.title || "The Endless Temple";
  wrap.querySelector("." + P + "label").textContent = ctx.label && ctx.label !== "Loading" ? "Now reading: " + ctx.label : "Brewing the tea";
  root.append(style, wrap);

  // rotating tip
  const tipEl = wrap.querySelector("." + P + "tip");
  const tipSpan = tipEl.querySelector("span");
  let tipI = Math.floor(Math.random() * TIPS.length);
  tipSpan.textContent = TIPS[tipI];
  const timers = [];
  const tipTimer = setInterval(() => {
    tipI = (tipI + 1) % TIPS.length;
    if (rm) { tipSpan.textContent = TIPS[tipI]; return; }
    tipEl.style.opacity = 0;
    timers.push(setTimeout(() => { tipSpan.textContent = TIPS[tipI]; tipEl.style.opacity = 1; }, 400));
  }, 2600);

  // sand: grains fall from the book's lower edge into a heap that grows with progress
  const box = wrap.querySelector("." + P + "sand");
  const cv = box.querySelector("canvas");
  const pctEl = box.querySelector("." + P + "pct");
  const cx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = box.clientWidth; H = box.clientHeight;
    cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize); ro.observe(box);
  let progress = 0, shown = 0;
  const grains = [];
  let raf = 0, last = performance.now();
  const streams = [0.28, 0.46, 0.55, 0.72];
  function draw(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    shown += (progress - shown) * Math.min(1, dt * 6);
    cx.clearRect(0, 0, W, H);
    const heapH = (H - 14) * (0.12 + 0.88 * shown);
    // the heap: a soft dune across the gutter
    const top = (x) => H - heapH * (0.55 + 0.45 * Math.exp(-Math.pow((x / W - 0.5) / 0.28, 2))) - 3 * Math.sin(x * 0.03 + now * 0.0004);
    cx.beginPath(); cx.moveTo(0, H);
    for (let x = 0; x <= W; x += 6) cx.lineTo(x, top(x));
    cx.lineTo(W, H); cx.closePath();
    const g = cx.createLinearGradient(0, H - heapH, 0, H);
    g.addColorStop(0, "#d9b46a"); g.addColorStop(1, "#8a6230");
    cx.fillStyle = g; cx.fill();
    cx.strokeStyle = "rgba(58,39,22,.7)"; cx.lineWidth = 1.2;
    cx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = top(x); x ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke();
    if (!rm) {
      for (const s of streams) for (let k = 0; k < 3; k++) {
        grains.push({ x: s * W + (Math.random() - 0.5) * 10, y: 0, vy: 30 + Math.random() * 40, vx: (Math.random() - 0.5) * 12 });
      }
      cx.fillStyle = "#e5c27a";
      for (let i = grains.length - 1; i >= 0; i--) {
        const q = grains[i];
        q.vy += 380 * dt; q.y += q.vy * dt; q.x += q.vx * dt;
        if (q.y > top(q.x)) { grains.splice(i, 1); continue; }
        cx.fillRect(q.x, q.y, 1.6, 1.6);
      }
    } else {
      cx.fillStyle = "rgba(229,194,122,.6)";
      for (const s of streams) cx.fillRect(s * W, 0, 1.5, top(s * W));
    }
    pctEl.textContent = Math.round(shown * 100) + " grains in a hundred";
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  return {
    progress(p) { progress = Math.max(0, Math.min(1, p)); },
    close() {
      cancelAnimationFrame(raf);
      clearInterval(tipTimer);
      timers.forEach(clearTimeout);
      ro.disconnect();
      wrap.classList.add(P + "out");
    },
  };
}

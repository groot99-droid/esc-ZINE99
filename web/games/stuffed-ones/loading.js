// The Stuffed Ones: loading screen.
//
// The shelf seen "like looking through plastic": the awakening still, warm and soft at the edges,
// with the warmth creeping inward as the load runs (the hunger). Across the bottom a seam is
// sewn in running stitch, one stitch per step of progress, the needle dipping in and out.
// Palette from DESIGN.md section 15 (hex values as in games/stuffed-ones/pictographs/make.py).

export const meta = {
  cover: "assets/stills/stuffed-ones/07-awakening.jpg",
  palette: { bg: "#2e2119", fg: "#f6f1e4", accent: "#e39a2d" },
  fonts: "family=IM+Fell+English:ital@0;1&family=Karla:wght@400;600",
  display: "'IM Fell English', Georgia, 'Times New Roman', serif",
  body: "Karla, 'Helvetica Neue', Arial, sans-serif",
  menuIntro:
    "Three days in a cheap cabin with four old friends, then the cabin takes you and you wake on its shelf. " +
    "Here are the cutaway nights, the labyrinth, and the four pages of thread and paper: hold still, sew, read, tamper, pack.",
};

// The quoted line is verbatim from the vault: creative-writing/vault/02_Novels/01_The_Stuffed_Ones.md
// (Mabel, ch 1; quoted in games/stuffed-ones/DESIGN.md sections 3 and 6).
const QUOTE = "“They like company.”";
const QUOTE_WHO = "Mabel";

const TIPS = [
  "Dollhouse: a toy standing still in a sight cone is safe. Only moving inside an open eye is seen.",
  "Dollhouse: Three taps at a bedroom door bring the guest out, and the hall light on.",
  "Labyrinth: come within a metre of a guest and they freeze. The pack herds; it never pounces.",
  "Stitchwork: in, out, pull. Release the thread while the needle sits in the green band.",
  "Stitchwork: when the pack's pulse beats through the thread, Steady the needle.",
  "The Hand-Sewn Book: red thread is an act, black a thing, white who. A slot takes only its colour.",
  "Parlour: when a face comes to the window, hold still. A toy on the table is a toy someone left there.",
  "Stuffing: a slot left empty is warm. The hunger lives there.",
];

export function render(root, ctx) {
  const P = meta.palette;
  const el = document.createElement("div");
  el.className = "stuffed-ones-load";
  el.innerHTML = `
<style>
.stuffed-ones-load{position:absolute;inset:0;overflow:hidden;background:${P.bg};color:${P.fg};font-family:${meta.body}}
.stuffed-ones-load-still{position:absolute;inset:-4%;background-size:cover;background-position:50% 45%;filter:sepia(.35) saturate(.85) contrast(1.05) brightness(.82) blur(.4px);transform:scale(1.02)}
.stuffed-ones-load-plastic{position:absolute;inset:0;backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);
  -webkit-mask:radial-gradient(ellipse 58% 52% at 50% 46%,transparent 55%,#000 100%);mask:radial-gradient(ellipse 58% 52% at 50% 46%,transparent 55%,#000 100%)}
.stuffed-ones-load-warm{position:absolute;inset:0;pointer-events:none;mix-blend-mode:multiply;transition:opacity .4s}
.stuffed-ones-load-grain{position:absolute;inset:0;opacity:.18;mix-blend-mode:overlay;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.25) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}
.stuffed-ones-load-text{position:absolute;left:0;right:0;top:0;bottom:118px;display:flex;flex-direction:column;justify-content:flex-end;padding:0 max(16px,6vw);gap:10px}
.stuffed-ones-load-label{font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.stuffed-ones-load h1{margin:0;font-family:${meta.display};font-weight:400;font-size:clamp(44px,9vw,120px);line-height:.9;letter-spacing:-.01em;text-shadow:0 2px 24px rgba(0,0,0,.55)}
.stuffed-ones-load h1 i{font-style:italic;color:#efe5cf}
.stuffed-ones-load-quote{font-family:${meta.display};font-style:italic;font-size:clamp(20px,2.6vw,30px);opacity:.92;margin:4px 0 0}
.stuffed-ones-load-quote span{font-style:normal;font-family:${meta.body};font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-left:10px}
.stuffed-ones-load-tip{min-height:2.8em;max-width:60ch;font-size:15px;line-height:1.45;opacity:.95;transition:opacity .5s;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.stuffed-ones-load-seam{position:absolute;left:0;bottom:0;width:100%;height:104px;display:block}
@media (max-width:520px){.stuffed-ones-load-text{bottom:96px}.stuffed-ones-load-seam{height:86px}}
</style>
<div class="stuffed-ones-load-still"></div>
<div class="stuffed-ones-load-plastic"></div>
<div class="stuffed-ones-load-warm"></div>
<div class="stuffed-ones-load-grain"></div>
<div class="stuffed-ones-load-text">
  <div class="stuffed-ones-load-label"></div>
  <h1>The <i>Stuffed</i> Ones</h1>
  <p class="stuffed-ones-load-quote">${QUOTE}<span>${QUOTE_WHO}</span></p>
  <p class="stuffed-ones-load-tip" aria-live="polite"></p>
</div>
<canvas class="stuffed-ones-load-seam" aria-hidden="true"></canvas>`;
  root.appendChild(el);
  el.querySelector(".stuffed-ones-load-still").style.backgroundImage = `url("${meta.cover || ctx.still}")`;
  el.querySelector(".stuffed-ones-load-label").textContent = ctx.label && ctx.label !== "Loading" ? `Loading · ${ctx.label}` : "Loading the cabin";
  const warm = el.querySelector(".stuffed-ones-load-warm");
  const tipEl = el.querySelector(".stuffed-ones-load-tip");
  const cv = el.querySelector("canvas");
  const g = cv.getContext("2d");

  let tipI = Math.floor(Math.random() * TIPS.length);
  tipEl.textContent = TIPS[tipI];
  const tipTimer = setInterval(() => {
    tipI = (tipI + 1) % TIPS.length;
    if (ctx.reducedMotion) { tipEl.textContent = TIPS[tipI]; return; }
    tipEl.style.opacity = 0;
    setTimeout(() => { tipEl.textContent = TIPS[tipI]; tipEl.style.opacity = 0.88; }, 450);
  }, 2600);

  let p = 0, shown = 0, raf = 0, t0 = performance.now(), closed = false;

  function setWarm(v) {
    // warmth creeps in from the edges: cream -> amber -> red as the load (the hunger) rises
    const a = 0.25 + v * 0.55;
    warm.style.background = `radial-gradient(ellipse 75% 70% at 50% 45%, rgba(239,229,207,0) 40%, rgba(227,154,45,${a * 0.7}) 78%, rgba(184,50,42,${a}) 100%)`;
  }

  function draw(now) {
    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // the fabric band: two felts meeting at a seam
    const y = h * 0.52;
    g.fillStyle = "#6b4a32"; g.fillRect(0, y - 26, w, 26);
    g.fillStyle = "#a5553a"; g.fillRect(0, y, w, h - y);
    // felt fibres
    g.globalAlpha = 0.12; g.fillStyle = "#000";
    for (let x = 0; x < w; x += 5) { g.fillRect(x, y - 26 + ((x * 7) % 11), 1, 2); g.fillRect(x + 2, y + 6 + ((x * 13) % 17), 1, 2); }
    g.globalAlpha = 1;
    // raw edge of the tear, still open to the right of the needle
    const gap = 18, x0 = Math.max(16, w * 0.04), x1 = w - x0;
    const n = Math.max(8, Math.floor((x1 - x0) / gap));
    const done = Math.floor(shown * n);
    const tipX = x0 + Math.min(n, shown * n) * gap;
    g.strokeStyle = "rgba(246,241,228,.35)"; g.lineWidth = 1; g.setLineDash([2, 3]);
    g.beginPath(); g.moveTo(tipX, y); g.lineTo(x1, y); g.stroke(); g.setLineDash([]);
    // running stitches in bone-white thread, one per step, across the seam
    g.lineCap = "round";
    for (let i = 0; i < done; i++) {
      const sx = x0 + i * gap;
      g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(sx + 2, y + 1.5); g.lineTo(sx + gap * 0.62, y + 1.5); g.stroke();
      g.strokeStyle = "#f6f1e4"; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(sx + 1, y); g.lineTo(sx + gap * 0.62, y); g.stroke();
    }
    // the needle, dipping in and out at the working end
    const bob = ctx.reducedMotion ? 0 : Math.sin((now - t0) / 140) * 6;
    const nx = tipX + 6, ny = y - 4 + bob;
    g.save(); g.translate(nx, ny); g.rotate(-0.55);
    g.fillStyle = "#d9d4c7"; g.strokeStyle = "#2a211b"; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(34, -2.2); g.lineTo(36, 0); g.lineTo(34, 2.2); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(30, 0, 3, 1, 0, 0, Math.PI * 2); g.fillStyle = "#2e2119"; g.fill();
    g.restore();
    // the loose thread trailing to the needle's eye
    g.strokeStyle = "#f6f1e4"; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(tipX - 2, y); g.quadraticCurveTo(tipX + 10, y - 30 - bob, nx + 28 * Math.cos(-0.55), ny + 28 * Math.sin(-0.55)); g.stroke();
    // stitch count in the margin, like a pattern
    g.fillStyle = "rgba(246,241,228,.92)"; g.font = "600 13px Karla, Arial, sans-serif"; g.textAlign = "right";
    g.fillText(`${Math.min(done, n)} / ${n} stitches`, x1, h - 12);
  }

  function frame(now) {
    if (closed) return;
    shown += (p - shown) * (ctx.reducedMotion ? 1 : 0.12);
    setWarm(shown);
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  setWarm(0);
  raf = requestAnimationFrame(frame);

  return {
    progress(v) { p = Math.max(p, Math.min(1, v || 0)); },
    close() { closed = true; cancelAnimationFrame(raf); clearInterval(tipTimer); el.remove(); },
  };
}

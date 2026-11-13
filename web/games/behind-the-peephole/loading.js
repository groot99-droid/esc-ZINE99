// Behind the Peephole: loading screen. The still is seen only through a backwards door viewer;
// the eye drifts across it, and the amber catch ring from "The eye at the hole" closes round the
// lens as the game loads. Palette from DESIGN.md section 15 (pictographs/make.py hex values).
//
// Quoted line: "You never see their missions. / You only see their return."
// Source: creative-writing/vault/04_Book_Concepts/01_Behind_the_Peephole.md (DESIGN.md section 3).

export const meta = {
  cover: "assets/stills/behind-the-peephole/02-eye-at-the-hole.jpg",
  palette: { bg: "#13271c", fg: "#efe6cf", accent: "#e0a24a" },
  fonts: "family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IBM+Plex+Mono:wght@400;600",
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'IBM Plex Mono', ui-monospace, monospace",
  menuIntro:
    "A night job behind the fourth floor of an old river hotel: six peepholes fitted backwards into six sealed valet doors. Watch the returns, run the passage, pick the locks, sign the statement, and pin the six lives together.",
};

const TIPS = [
  "Hold the view still on a beat for a breath and a half to catch it as a clue card.",
  "A guest who faces the brass rose can feel the dark behind it. Step back before they look.",
  "Past 404 the boards talk. Walk them; never run.",
  "The bell rings the room number. You have twelve minutes before that door opens.",
  "A tick crosses the rest of its row and column. Sign only when you are sure.",
  "A true thread pulls taut. A slack one cost you a length and nothing else.",
  "Only the binding pin moves. Ease the tension when a spool pin pushes back.",
];

export function render(root, ctx) {
  const P = "behind-the-peephole-load-";
  const css = document.createElement("style");
  css.textContent = `
  .${P}wrap{position:absolute;inset:0;overflow:hidden;background:#0b0907;color:#efe6cf;font-family:'IBM Plex Mono',ui-monospace,monospace}
  .${P}paper{position:absolute;inset:0;background:
     repeating-linear-gradient(90deg,#1f3d2c 0 30px,#2f5a40 30px 40px,#1f3d2c 40px 52px,#3d6b4c 52px 55px,#1f3d2c 55px 72px);opacity:.35;filter:saturate(.8)}
  .${P}dark{position:absolute;inset:0;background:radial-gradient(circle at var(--x) var(--y),transparent 0,transparent var(--r),rgba(11,9,7,.97) calc(var(--r) + 2px))}
  .${P}still{position:absolute;inset:0;background-size:cover;background-position:center;filter:sepia(.45) saturate(1.25) contrast(1.08) brightness(1.15)}
  .${P}svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  .${P}txt{position:absolute;left:max(16px,4vw);right:max(16px,4vw);bottom:max(18px,5vh);display:grid;gap:10px;max-width:640px}
  .${P}label{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#e0a24a}
  .${P}title{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:clamp(40px,8vw,92px);line-height:.9;margin:0;color:#f6cf86;text-shadow:0 2px 18px #000}
  .${P}q{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(18px,2.4vw,26px);line-height:1.25;margin:0;color:#efe6cf}
  .${P}tip{font-size:12.5px;line-height:1.5;color:#c9bfa6;min-height:3em;transition:opacity .5s}
  .${P}clock{position:absolute;top:max(14px,3vh);right:max(16px,4vw);font-size:12px;letter-spacing:.2em;color:#b8913f}
  `;
  const wrap = document.createElement("div");
  wrap.className = P + "wrap";
  wrap.innerHTML = `
    <div class="${P}paper"></div>
    <div class="${P}still"></div>
    <div class="${P}dark"></div>
    <svg class="${P}svg" aria-hidden="true"><g class="${P}ring"></g></svg>
    <div class="${P}clock">23:00 · VALET PASSAGE · 4F</div>
    <div class="${P}txt">
      <div class="${P}label"></div>
      <h1 class="${P}title"></h1>
      <p class="${P}q">“You never see their missions.<br>You only see their return.”</p>
      <div class="${P}tip"></div>
    </div>`;
  root.append(css, wrap);
  wrap.querySelector("." + P + "still").style.backgroundImage = `url("${meta.cover}")`;
  wrap.querySelector("." + P + "label").textContent = ctx.label || "Loading";
  wrap.querySelector("." + P + "title").textContent = ctx.title || "Behind the Peephole";
  const tipEl = wrap.querySelector("." + P + "tip");
  const clockEl = wrap.querySelector("." + P + "clock");
  let tipI = Math.floor(Math.random() * TIPS.length);
  tipEl.textContent = TIPS[tipI];
  const svg = wrap.querySelector("svg");
  const ringG = wrap.querySelector("." + P + "ring");
  const NS = "http://www.w3.org/2000/svg";
  const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const brass = mk("circle", { fill: "none", stroke: "#b8913f", "stroke-width": 14 });
  const brassEdge = mk("circle", { fill: "none", stroke: "#3b2a0e", "stroke-width": 2 });
  const track = mk("circle", { fill: "none", stroke: "#2a1a0c", "stroke-width": 7 });
  const arc = mk("circle", { fill: "none", stroke: "#e0a24a", "stroke-width": 5, "stroke-linecap": "round" });
  ringG.append(brass, brassEdge, track, arc);

  let p = 0, raf = 0, t0 = performance.now(), alive = true;
  const tipTimer = setInterval(() => {
    tipEl.style.opacity = 0;
    setTimeout(() => { if (!alive) return; tipI = (tipI + 1) % TIPS.length; tipEl.textContent = TIPS[tipI]; tipEl.style.opacity = 1; }, 450);
  }, 2600);

  function frame(now) {
    const w = wrap.clientWidth || 1, h = wrap.clientHeight || 1;
    const t = (now - t0) / 1000;
    const r = Math.min(w, h) * (w < 600 ? 0.3 : 0.26);
    const drift = ctx.reducedMotion ? 0 : 1;
    const x = w * (w < 600 ? 0.5 : 0.62) + drift * Math.sin(t * 0.55) * w * 0.07;
    const y = h * 0.38 + drift * Math.sin(t * 0.83 + 1) * h * 0.05;
    const dark = wrap.querySelector("." + P + "dark");
    dark.style.setProperty("--x", x + "px");
    dark.style.setProperty("--y", y + "px");
    dark.style.setProperty("--r", r + "px");
    for (const c of [brass, brassEdge, track, arc]) { c.setAttribute("cx", x); c.setAttribute("cy", y); }
    brass.setAttribute("r", r + 9); brassEdge.setAttribute("r", r + 16);
    track.setAttribute("r", r + 26); arc.setAttribute("r", r + 26);
    const circ = 2 * Math.PI * (r + 26);
    arc.setAttribute("stroke-dasharray", `${circ * p} ${circ}`);
    arc.setAttribute("transform", `rotate(-90 ${x} ${y})`);
    const mins = Math.floor(p * 14);
    clockEl.textContent = `23:${String(mins).padStart(2, "0")} · VALET PASSAGE · 4F`;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    progress(v) { p = Math.max(0, Math.min(1, v)); },
    close() { alive = false; cancelAnimationFrame(raf); clearInterval(tipTimer); },
  };
}

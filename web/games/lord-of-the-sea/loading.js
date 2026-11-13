// The Lord of the Sea: loading screen.
// The open-sea still pulled into the Engraved Sea's ink (sepia, ruled burin lines over it), the
// title in a copperplate face, one verbatim line, a rotating tip, and the stir ring from the HUD
// (DESIGN.md section 14): the outer ring fills from Company ink-blue to sea-green as the load runs,
// and an ink spiral winds in clockwise, the way a stir rouses the water.

export const meta = {
  cover: "assets/stills/lord-of-the-sea/11-the-open-sea.jpg",
  // DESIGN.md section 15: Order ink-blue, lamp white, dawn gold.
  palette: { bg: "#1F2E4A", fg: "#F4F1E8", accent: "#E7A93B" },
  fonts: "family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Pinyon+Script&family=Rye",
  display: "'IM Fell English', 'Iowan Old Style', Georgia, serif",
  body: "'IM Fell English', 'Iowan Old Style', Georgia, serif",
  menuIntro:
    "A sea god long past his age wakes on an old boat in a century when a trading company owns the calm. " +
    "Stir: clockwise rouses the water, counter-clockwise stills it. Two engraved seas to cross and four tables to play.",
};

// Verbatim, 02_Novels/02_WrymWretch.md line 286 (DESIGN.md section 3, beat 4).
const QUOTE = "Something in him stirred. A pull. A promise he couldn’t name.";

const TIPS = [
  "Stir by drawing circles: clockwise raises a crest, counter-clockwise flattens it.",
  "Run down the face of a wave you raised behind you: the surf is worth up to sixty per cent.",
  "Broadside to a steep face for a second and a half and the boat goes over.",
  "In the deep there is no air to watch. Watch the edges darken: the deep wants to keep him.",
  "At the cup, every stir draws the sailors' eyes. Stir only when the round is worth it.",
  "The binding clause is the one every other obligation routes through. Follow the red thread.",
  "On the Tea Board a tie, in the factor's books, is his. Take a port outright.",
  "Lay the tide from the end of each hour's run, not from the fix.",
];

let uid = 0;

export function render(root, ctx) {
  const id = "lots-load-" + ++uid;
  const reduce = !!ctx.reducedMotion;
  const still = meta.cover || ctx.still;
  root.innerHTML = `
  <style>
    .${id} { position:absolute; inset:0; overflow:hidden; background:#1F2E4A; color:#F4F1E8;
      font-family:'IM Fell English','Iowan Old Style',Georgia,serif; display:grid; }
    .${id} .still { position:absolute; inset:-4%; background:url("${still}") center/cover no-repeat;
      filter: grayscale(1) sepia(.55) contrast(1.25) brightness(.62); transform:scale(1.04); }
    .${id}.drift .still { animation:${id}-drift 14s ease-in-out infinite alternate; }
    @keyframes ${id}-drift { from { transform:scale(1.04) translate(0,0); } to { transform:scale(1.1) translate(-1.5%,1%); } }
    .${id} .burin { position:absolute; inset:0; mix-blend-mode:multiply; opacity:.75;
      background: repeating-linear-gradient(0deg, rgba(31,46,74,.0) 0 2px, rgba(31,46,74,.85) 2px 3px); }
    .${id} .wash { position:absolute; inset:0;
      background: linear-gradient(180deg, rgba(31,46,74,.25) 0%, rgba(31,46,74,.15) 45%, rgba(20,30,50,.92) 100%); }
    .${id} .plate { position:absolute; inset:14px; border:1px solid rgba(244,241,232,.45); outline:3px double rgba(244,241,232,.3); outline-offset:5px; pointer-events:none; }
    .${id} .body { position:relative; align-self:end; padding: 0 max(28px,5vw) max(30px,6vh); display:grid; gap:14px;
      grid-template-columns: minmax(0,1fr) auto; align-items:end; }
    .${id} .kicker { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.18em; font-size:13px; opacity:.85; color:#E7A93B; }
    .${id} h1 { margin:0; font-weight:400; font-size:clamp(40px,8.5vw,112px); line-height:.92; letter-spacing:-.005em;
      text-shadow:0 2px 0 rgba(0,0,0,.35); text-wrap:balance; }
    .${id} h1 i { font-style:italic; color:#E8F2EE; }
    .${id} blockquote { margin:6px 0 0; font-style:italic; font-size:clamp(17px,2.1vw,24px); max-width:34ch; color:#E8F2EE; line-height:1.3; }
    .${id} blockquote::before { content:"— "; color:#E7A93B; }
    .${id} .tip { font-size:15px; max-width:52ch; min-height:2.6em; opacity:.88; transition:opacity .5s; }
    .${id} .tip b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; color:#E7A93B; letter-spacing:.08em; margin-right:.5em; }
    .${id} .ring { width:clamp(110px,16vw,168px); height:auto; display:block; }
    .${id} .ringlbl { font-family:'IM Fell English SC',Georgia,serif; font-size:12px; letter-spacing:.14em; text-align:center; opacity:.8; margin-top:4px; }
    @media (max-width:640px) { .${id} .body { grid-template-columns:1fr; } .${id} .rose { justify-self:start; order:-1; } }
  </style>
  <div class="${id}${reduce ? "" : " drift"}" role="status" aria-label="Loading ${esc(ctx.title)}">
    <div class="still"></div><div class="burin"></div><div class="wash"></div><div class="plate"></div>
    <div class="body">
      <div class="text">
        <div class="kicker">${esc(ctx.label && ctx.label !== "Loading" ? "Now loading · " + ctx.label : "esc-ZINE99 · a game of the open chart")}</div>
        <h1>The Lord <i>of the</i> Sea</h1>
        <blockquote>${esc(QUOTE)}</blockquote>
        <p class="tip"><b>Tip</b><span></span></p>
      </div>
      <div class="rose">
        <svg class="ring" viewBox="-60 -60 120 120" aria-hidden="true">
          <circle r="52" fill="none" stroke="rgba(244,241,232,.35)" stroke-width="1"/>
          <circle class="arc" r="48" fill="none" stroke="#1F2E4A" stroke-width="7" stroke-dasharray="0 400" transform="rotate(-90)"/>
          <circle r="44" fill="none" stroke="rgba(244,241,232,.5)" stroke-width=".6"/>
          <g class="ticks" stroke="rgba(244,241,232,.7)" stroke-width=".8"></g>
          <path class="spiral" fill="none" stroke="#E8F2EE" stroke-width="1.4" stroke-linecap="round"/>
          <g class="needle"><path d="M0,-40 L4,0 L0,40 L-4,0Z" fill="none" stroke="#E7A93B" stroke-width="1"/><path d="M0,-40 L4,0 L-4,0Z" fill="#E7A93B"/></g>
          <circle r="2.2" fill="#F4F1E8"/>
        </svg>
        <div class="ringlbl">ORDER → WILD</div>
      </div>
    </div>
  </div>`;
  const box = root.querySelector("." + id);
  const arc = box.querySelector(".arc");
  const spiral = box.querySelector(".spiral");
  const needle = box.querySelector(".needle");
  const tipEl = box.querySelector(".tip span");
  const ticks = box.querySelector(".ticks");
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2, r1 = i % 8 === 0 ? 37 : 41;
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", (Math.cos(a) * r1).toFixed(2)); l.setAttribute("y1", (Math.sin(a) * r1).toFixed(2));
    l.setAttribute("x2", (Math.cos(a) * 44).toFixed(2)); l.setAttribute("y2", (Math.sin(a) * 44).toFixed(2));
    ticks.appendChild(l);
  }
  // An Archimedean spiral, wound clockwise from the rim inward: a stir.
  let d = "";
  const turns = 3.2, steps = 220;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, a = -Math.PI / 2 + t * turns * Math.PI * 2, r = 34 * (1 - t) + 3;
    d += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(2) + "," + (Math.sin(a) * r).toFixed(2);
  }
  spiral.setAttribute("d", d);
  const spiralLen = spiral.getTotalLength ? spiral.getTotalLength() || 420 : 420;
  spiral.style.strokeDasharray = spiralLen;
  spiral.style.strokeDashoffset = spiralLen;
  const circ = 2 * Math.PI * 48;

  let tipIndex = Math.floor(Math.random() * TIPS.length);
  tipEl.textContent = TIPS[tipIndex];
  const tipTimer = setInterval(() => {
    tipEl.parentElement.style.opacity = reduce ? 1 : 0;
    setTimeout(() => { tipIndex = (tipIndex + 1) % TIPS.length; tipEl.textContent = TIPS[tipIndex]; tipEl.parentElement.style.opacity = 1; }, reduce ? 0 : 450);
  }, 3200);

  const mix = (a, b, t) => {
    const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",") + ")";
  };
  let last = 0, spin = 0, raf = 0, t0 = performance.now();
  function frame(now) {
    if (!reduce) {
      spin = ((now - t0) / 1000) * 40 * (0.4 + last);
      needle.setAttribute("transform", `rotate(${spin.toFixed(1)})`);
    }
    raf = requestAnimationFrame(frame);
  }
  if (!reduce) raf = requestAnimationFrame(frame);

  return {
    progress(p) {
      p = Math.max(0, Math.min(1, p));
      if (p < last) return;
      last = p;
      arc.setAttribute("stroke-dasharray", `${(circ * p).toFixed(1)} 400`);
      arc.setAttribute("stroke", p < 0.5 ? mix("3A4F78", "2F6B5E", p * 2) : mix("2F6B5E", "E8F2EE", (p - 0.5) * 2));
      spiral.style.strokeDashoffset = (spiralLen * (1 - p)).toFixed(1);
      if (reduce) needle.setAttribute("transform", `rotate(${(p * 360).toFixed(0)})`);
    },
    close() {
      clearInterval(tipTimer);
      cancelAnimationFrame(raf);
    },
  };
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

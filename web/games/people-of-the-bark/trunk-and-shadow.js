// People of the Bark — Trunk and Shadow (1D, knotwork board).
// DESIGN.md 11.4, the spring festival (c2_tns) against Captain Burr, who charges the nearest Folk
// and looks one move ahead. Old Rules: 4 Folk start on the Root row; move one Folk up to 2 squares
// along open cracks (the bands); the 2 × 2 Shadow then moves 1 square in any direction, and any Folk
// under it (not on a knot square) is hidden and comes back to the Root row 2 rounds later.
// Win: 3 Folk on the Crown row. Lose: round 16 ends first.
// Spring's rule cards: Blessing (3 rain squares: a Folk ending there moves again), Tremor (every 4th
// round all Folk shift one square along the printed pattern), and the Eye policy card (once, a
// chant: the Shadow skips a turn).
// Actions: move a Folk; chant (the Eye card, once); read Burr (he glances where the Shadow will go
// next and commits to it: two looks a game, a hint in the spirit of DESIGN's shaded Shadow squares);
// wait (pass the move, to keep a Folk on its knot). At round 9 the festival crowd takes up the chant
// and the Eye card can be used once more. Retuned: bands run up a square 90% of the time (was 80%).
// After two lost festivals Burr plays carelessly and gives four looks.

const COLS = 5, ROWS = 8, ROUNDS = 16, GUARD_AT = 9;
const GOLD = "#f0c050", AMBER = "#d9902a", DARK = "#1b120c", UMBER = "#5a3d2b", SAGE = "#8fa37a", LIME = "#c4d65a", LANT = "#e8742a", PAPER = "#efe2c4", BLUE = "#6f9ab8", MUTED = "#d8c8a4";
const KNOTS = [[1, 2], [3, 3], [0, 5], [4, 5]];
const RAIN = [[2, 1], [4, 2], [1, 4]];
const TREMOR_PATTERN = { 4: [0, 1, "up"], 8: [1, 0, "right"], 12: [0, 1, "up"], 16: [-1, 0, "left"] };
const BURR_LINES = ["“Forward! The nearest first.”", "“Hold still and I'll have you.”", "“A Folk in the open is a Folk for the Shadow.”", "“Ha! Run, then.”", "“No knot will save you twice.”"];
const BURR_GUARD = ["“I'm not afraid. I'm ready. They feel the same from inside.”", "“Chant all you like!”", "“Forward! The nearest first.”"];

export default {
  mount(root, api) {
    const P = "people-of-the-bark-trunk-and-shadow-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const rnd = api.rng();
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;

    // ---- the cracks: which sides of each square are open ----
    const up = [], right = [];
    for (let r = 0; r < ROWS; r++) { up.push([]); right.push([]); for (let c = 0; c < COLS; c++) { up[r].push(r < ROWS - 1 && rnd() < 0.9); right[r].push(c < COLS - 1 && rnd() < 0.5); } }
    const par = Array.from({ length: COLS * ROWS }, (_, i) => i);
    const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
    const id = (c, r) => r * COLS + c;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (up[r][c]) par[find(id(c, r))] = find(id(c, r + 1)); if (right[r][c]) par[find(id(c, r))] = find(id(c + 1, r)); }
    for (let guard = 0; guard < 500; guard++) {
      const roots = new Set(par.map((_, i) => find(i))); if (roots.size === 1) break;
      const c = Math.floor(rnd() * COLS), r = Math.floor(rnd() * ROWS);
      if (rnd() < 0.5 && r < ROWS - 1 && find(id(c, r)) !== find(id(c, r + 1))) { up[r][c] = true; par[find(id(c, r))] = find(id(c, r + 1)); }
      else if (c < COLS - 1 && find(id(c, r)) !== find(id(c + 1, r))) { right[r][c] = true; par[find(id(c, r))] = find(id(c + 1, r)); }
    }
    const open = (c, r, dc, dr) => {
      const c2 = c + dc, r2 = r + dr;
      if (c2 < 0 || c2 >= COLS || r2 < 0 || r2 >= ROWS) return false;
      if (dr === 1) return up[r][c]; if (dr === -1) return up[r2][c];
      if (dc === 1) return right[r][c]; return right[r][c2];
    };
    const isKnot = (c, r) => KNOTS.some(([x, y]) => x === c && y === r);
    const isRain = (c, r) => RAIN.some(([x, y]) => x === c && y === r);

    const S = {
      round: 1, turn: "player", folk: [0, 1, 3, 4].map((c, i) => ({ i, c, r: 0, hidden: 0 })),
      shadow: { c: 1, r: 6 }, sel: null, again: null, chantUsed: false, skipNext: false, over: false, line: BURR_LINES[0], fired: null, log: "",
      looks: gentle ? 4 : 2, peek: null, guard: false, hiddenTotal: 0, beats: new Set(),
    };
    const under = (f, sh = S.shadow) => f.c >= sh.c && f.c <= sh.c + 1 && f.r >= sh.r && f.r <= sh.r + 1;
    const occupied = (c, r, except) => S.folk.some((f) => f !== except && !f.hidden && f.c === c && f.r === r);
    function reach(f) {
      const seen = new Map([[f.c + "," + f.r, 0]]), q = [[f.c, f.r, 0]], out = [];
      while (q.length) {
        const [c, r, d] = q.shift(); if (d === 2) continue;
        for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          if (!open(c, r, dc, dr)) continue;
          const k = (c + dc) + "," + (r + dr); if (seen.has(k)) continue;
          seen.set(k, d + 1); q.push([c + dc, r + dr, d + 1]);
          if (!occupied(c + dc, r + dr, f)) out.push([c + dc, r + dr]);
        }
      }
      return out;
    }
    // Burr's choice of the Shadow's next square
    function plan() {
      const opts = [];
      for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
        const c = S.shadow.c + dc, r = S.shadow.r + dr;
        if (c < 0 || c > COLS - 2 || r < 0 || r > ROWS - 2) continue;
        const sh = { c, r };
        const caught = S.folk.filter((f) => !f.hidden && under(f, sh) && !isKnot(f.c, f.r));
        const live = S.folk.filter((f) => !f.hidden && !(under(f, sh) && !isKnot(f.c, f.r)));
        let near = 99, top = 0;
        for (const f of live) { const dx = Math.max(0, c - f.c, f.c - (c + 1)), dy = Math.max(0, r - f.r, f.r - (r + 1)); near = Math.min(near, Math.max(dx, dy)); top = Math.max(top, f.r); }
        let score = caught.length * 10 + caught.reduce((a, f) => a + f.r, 0) * 0.5 - near;
        score += rnd() * (gentle ? 6 : 0.3);
        opts.push({ sh, score });
      }
      opts.sort((a, b) => b.score - a.score);
      return opts[0].sh;
    }

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${PAPER};font-family:'Cormorant Garamond',Georgia,serif;
 background:radial-gradient(ellipse at 50% 40%,#33241a,#1b120c 80%)}
.${P}page{box-sizing:border-box;min-height:100%;max-width:1200px;margin:0 auto;padding:14px clamp(12px,3vw,32px);display:grid;grid-template-columns:200px minmax(0,1fr) 230px;gap:18px;align-items:center}
.${P}cards{display:flex;flex-direction:column;gap:10px}
.${P}rc{border:1.5px solid #6a5a48;border-radius:6px;padding:9px 10px;background:rgba(58,40,28,.7);text-align:center;position:relative;transition:border-color .2s,box-shadow .2s}
.${P}rc::before{content:"";position:absolute;left:10px;right:10px;top:4px;height:5px;background:repeating-radial-gradient(circle at 3px 2.5px,transparent 0 1.6px,${SAGE} 1.7px 2.4px,transparent 2.5px) 0 0/7px 5px}
.${P}rc b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:20px;letter-spacing:.08em;margin-top:6px}
.${P}rc i{font-size:16px;color:${MUTED};line-height:1.2;display:block}
.${P}rc.${P}fire{border-color:${GOLD};box-shadow:0 0 0 3px rgba(240,192,80,.4)}
.${P}rc button{font:inherit;font-size:16px;margin-top:6px;background:${AMBER};color:${DARK};border:0;padding:5px 12px;cursor:pointer;border-radius:3px;min-height:34px}
.${P}rc button:disabled{opacity:.4;cursor:default}
.${P}board{min-width:0;display:grid;place-items:center}
.${P}board svg{height:min(calc(100vh - 120px),780px);max-width:100%;min-height:360px;display:block;touch-action:manipulation}
.${P}sq{cursor:pointer}
.${P}tgt{cursor:pointer}
.${P}tgt:hover circle{fill:${GOLD}}
.${P}opp{text-align:center}
.${P}opp .${P}por{background:none;border:0;padding:0;cursor:pointer;border-radius:50%}
.${P}opp .${P}por:disabled{cursor:default;opacity:.85}
.${P}opp .${P}por:hover:not(:disabled) svg{filter:drop-shadow(0 0 6px ${GOLD})}
.${P}opp h3{margin:4px 0 0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:21px;letter-spacing:.1em}
.${P}opp p{margin:2px 0 8px;font-style:italic;color:${MUTED};font-size:16px}
.${P}say{font-family:'IM Fell English',Georgia,serif;font-size:18px;line-height:1.3;min-height:2.7em;color:${GOLD}}
.${P}dots{display:grid;grid-template-columns:repeat(8,14px);gap:5px;justify-content:center;margin:10px 0 6px}
.${P}dots i{width:14px;height:14px;border-radius:50%;border:1.5px solid ${AMBER};box-sizing:border-box}
.${P}dots i.${P}d{background:${AMBER}}
.${P}dots i.${P}now{background:${GOLD};box-shadow:0 0 0 3px rgba(240,192,80,.35)}
.${P}dots i.${P}trem{border-color:${LIME}}
.${P}rd{font:13px ui-monospace,monospace;letter-spacing:.18em}
.${P}stat{font-size:17px;margin-top:8px;color:#efe2c4;line-height:1.35}
.${P}stat i{color:${MUTED}}
.${P}acts{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:8px}
.${P}acts button{font:14px ui-monospace,monospace;background:transparent;color:${PAPER};border:1px solid #8a7864;padding:6px 10px;cursor:pointer;border-radius:3px;min-height:36px}
.${P}acts button:hover:not(:disabled){border-color:${GOLD};color:${GOLD}}
.${P}acts button:disabled{opacity:.4;cursor:default}
.${P}wrap button:focus-visible{outline:3px solid ${LIME};outline-offset:2px}
@keyframes ${P}shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.${P}no{animation:${P}shake .3s}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.92);z-index:4;padding:16px;overflow:auto}
.${P}knot{max-width:480px;width:100%;box-sizing:border-box;background:#2e2016;padding:22px 24px;position:relative;border-radius:6px;
 box-shadow:0 0 0 4px #1b120c,0 0 0 7px ${AMBER},0 0 0 9px #1b120c,0 0 0 11px ${SAGE}}
.${P}knot h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${GOLD};letter-spacing:.04em}
.${P}knot .${P}sub{font:12px ui-monospace,monospace;letter-spacing:.2em;color:${SAGE};margin-bottom:8px}
.${P}knot .${P}beat{font-style:italic;font-size:17px;line-height:1.4;margin:0 0 10px;color:#e9d6ae}
.${P}knot .${P}goal{font-size:18px;line-height:1.35;margin:0 0 10px;border-top:1px solid #5a4a3a;padding-top:8px}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:16px;line-height:1.3;margin:0 0 14px}
.${P}key kbd{font:13px ui-monospace,monospace;color:${GOLD};border:1px solid #7d6c5a;padding:1px 6px;border-radius:2px;white-space:nowrap;align-self:start}
.${P}knot button{font:inherit;font-size:19px;background:${AMBER};color:${DARK};border:0;padding:8px 18px;cursor:pointer;border-radius:3px}
@media (max-width:820px){.${P}page{grid-template-columns:1fr 1fr;grid-template-areas:"board board" "opp opp" "cards cards"}.${P}board{grid-area:board}.${P}cards{grid-area:cards;display:grid;grid-template-columns:1fr 1fr}.${P}opp{grid-area:opp;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;text-align:left;align-items:center}
 .${P}opp .${P}por svg{width:72px;height:72px}.${P}opp .${P}who{grid-column:2}.${P}opp .${P}rest{grid-column:1 / -1}.${P}dots{justify-content:start}.${P}acts{justify-content:start}.${P}board svg{height:auto;width:100%;min-height:0;max-height:none}}
@media (prefers-reduced-motion:reduce){.${P}no{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}cards"></div>
 <div class="${P}board"><svg viewBox="-34 -56 368 590" aria-label="The board: five columns, eight rows"></svg></div>
 <div class="${P}opp">
  <button class="${P}por" type="button" title="Read Burr (W)" aria-label="Read Burr: see where the Shadow goes next"><svg viewBox="-60 -60 120 120" width="120" height="120" aria-hidden="true">
   ${Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return `<circle cx="${Math.cos(a) * 50}" cy="${Math.sin(a) * 50}" r="6" fill="none" stroke="${SAGE}" stroke-width="2"/>`; }).join("")}
   <path d="M-22 30 V-6 Q-22 -26 0 -26 Q22 -26 22 -6 V30 H8 V6 H-8 V30Z" fill="#7d6c5a" stroke="${DARK}" stroke-width="2"/>
   <path d="M-6 -30 Q14 -48 34 -34 Q16 -34 6 -22Z" fill="${LANT}"/>
  </svg></button>
  <div class="${P}who"><h3>CAPTAIN BURR</h3><p class="${P}mood">charges the nearest</p></div>
  <div class="${P}rest">
   <div class="${P}say" aria-live="polite"></div>
   <div class="${P}dots"></div><div class="${P}rd"></div>
   <div class="${P}stat" aria-live="polite"></div>
   <div class="${P}acts"><button type="button" data-a="look">read Burr · W</button><button type="button" data-a="wait">wait · .</button></div>
  </div>
 </div>
</div>
<div class="${P}intro"><div class="${P}knot" role="dialog" aria-label="How to play">
 <h2>Trunk and Shadow</h2><div class="${P}sub">THE SPRING FESTIVAL · HIGHRIDGE</div>
 <p class="${P}beat">Lanterns in the square, the whole city watching. The festival board is a flat flake; you play the Folk, and Captain Burr, who has never fought anything bigger than a mite, plays the Shadow.</p>
 <p class="${P}goal"><b>Goal:</b> three Folk on the Crown row before round 16 ends.</p>
 <div class="${P}key">
  <kbd>tap a Folk · 1–4</kbd><span>then a glowing square: up to 2 steps, only along the gold bands</span>
  <kbd>the Shadow</kbd><span>steps after you; a Folk under it is hidden for 2 rounds, unless it stands on a knot</span>
 </div>
 <button type="button">Sit down to play</button>
</div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const svg = wrap.querySelector("svg[aria-label]");
    const cardsEl = $("cards"), sayEl = $("say"), dots = $("dots"), rd = $("rd"), stat = $("stat"), mood = $("mood"), por = $("por");
    const lookBtn = wrap.querySelector("[data-a=look]"), waitBtn = wrap.querySelector("[data-a=wait]");
    const Z = 60, X = (c) => c * Z + Z / 2, Y = (r) => (ROWS - 1 - r) * Z + Z / 2;

    function drawBoard() {
      let s = `<defs><pattern id="${P}hat" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-width="2" opacity=".35"/></pattern>
<filter id="${P}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .6" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .12  0 0 0 0 .06  0 0 0 .35 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`;
      const flake = "M-14 -12 Q150 -26 314 -12 Q328 240 314 492 Q150 506 -14 492 Q-28 240 -14 -12Z";
      s += `<path d="${flake}" fill="#6b4c33" stroke="${DARK}" stroke-width="3"/><path d="${flake}" fill="#6b4c33" filter="url(#${P}grain)"/>`;
      // braided border: two interlaced chains
      for (let x = 0; x <= 300; x += 15) for (const y of [-28, 508]) s += `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="none" stroke="${SAGE}" stroke-width="2"/><ellipse cx="${x + 7.5}" cy="${y}" rx="7" ry="4" fill="none" stroke="${AMBER}" stroke-width="1.2" opacity=".6"/>`;
      for (let y = 0; y <= 480; y += 15) for (const x of [-26, 326]) s += `<ellipse cx="${x}" cy="${y}" rx="4" ry="7" fill="none" stroke="${SAGE}" stroke-width="2"/><ellipse cx="${x}" cy="${y + 7.5}" rx="4" ry="7" fill="none" stroke="${AMBER}" stroke-width="1.2" opacity=".6"/>`;
      s += `<text x="150" y="-44" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${GOLD}">CROWN</text>
<text x="150" y="532" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${PAPER}" opacity=".85">ROOT</text>
<rect x="0" y="0" width="${COLS * Z}" height="${Z}" fill="${GOLD}" opacity=".10"/>`;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        s += `<rect class="${P}sq" data-c="${c}" data-r="${r}" x="${c * Z + 1}" y="${(ROWS - 1 - r) * Z + 1}" width="${Z - 2}" height="${Z - 2}" fill="${(c + r) % 2 ? "#8a6a4a" : "#80603f"}" opacity=".55"/>`;
      }
      const segs = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (up[r][c]) segs.push({ x1: X(c), y1: Y(r), x2: X(c), y2: Y(r + 1) });
        if (right[r][c]) segs.push({ x1: X(c), y1: Y(r), x2: X(c + 1), y2: Y(r) });
      }
      const line = (q, w, col, extra = "", cap = "round") => `<line x1="${q.x1}" y1="${q.y1}" x2="${q.x2}" y2="${q.y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}" pointer-events="none" ${extra}/>`;
      segs.forEach((q) => (s += line(q, 16, DARK)));
      segs.forEach((q) => (s += line(q, 11, GOLD)));
      segs.forEach((q) => (s += line(q, 2.5, AMBER, 'opacity=".8"')));
      // interlace: at every crossing, alternate which band passes over, with a dark gap either side
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const vThrough = up[r][c] && r > 0 && up[r - 1][c], hThrough = right[r][c] && c > 0 && right[r][c - 1];
        if (!(vThrough && hThrough)) continue;
        const o = (c + r) % 2 ? { x1: X(c), y1: Y(r) - 18, x2: X(c), y2: Y(r) + 18 } : { x1: X(c) - 18, y1: Y(r), x2: X(c) + 18, y2: Y(r) };
        s += line(o, 16, DARK, "", "butt") + line(o, 11, GOLD, "", "butt") + line(o, 2.5, AMBER, 'opacity=".8"', "butt");
      }
      for (const [c, r] of KNOTS) s += `<g transform="translate(${X(c)} ${Y(r)})" pointer-events="none"><circle r="16" fill="${UMBER}" stroke="${LANT}" stroke-width="2.5"/><circle r="10" fill="none" stroke="${LANT}" stroke-width="2"/><circle r="4" fill="${LANT}"/></g>`;
      for (const [c, r] of RAIN) s += `<g transform="translate(${X(c) + 18} ${Y(r) - 18})" pointer-events="none"><circle r="10" fill="#1b120c" opacity=".6"/><path d="M0 -8 Q6 1 0 6 Q-6 1 0 -8Z" fill="${BLUE}" stroke="${PAPER}" stroke-width=".8"/></g>`;
      s += `<g class="${P}dyn"></g>`;
      svg.innerHTML = s;
    }
    drawBoard();
    const dyn = svg.querySelector("." + P + "dyn");

    function drawDyn() {
      let s = "";
      const sh = S.shadow;
      if (S.turn === "player" && !S.over) {
        const c0 = Math.max(0, sh.c - 1), c1 = Math.min(COLS - 1, sh.c + 2), r0 = Math.max(0, sh.r - 1), r1 = Math.min(ROWS - 1, sh.r + 2);
        s += `<rect x="${c0 * Z}" y="${(ROWS - 1 - r1) * Z}" width="${(c1 - c0 + 1) * Z}" height="${(r1 - r0 + 1) * Z}" fill="#000" opacity=".2" pointer-events="none" stroke="#5a4a6a" stroke-dasharray="4 4"/>`;
      }
      if (S.peek && !S.over) s += `<rect x="${S.peek.c * Z + 3}" y="${(ROWS - 2 - S.peek.r) * Z + 3}" width="${2 * Z - 6}" height="${2 * Z - 6}" rx="14" fill="none" stroke="${LANT}" stroke-width="3" stroke-dasharray="8 5" pointer-events="none"/><text x="${S.peek.c * Z + Z}" y="${(ROWS - 2 - S.peek.r) * Z + 18}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" fill="${LANT}" pointer-events="none">BURR LOOKS HERE</text>`;
      if (S.sel && !S.over && S.turn === "player") for (const [c, r] of reach(S.sel)) {
        const danger = !isKnot(c, r) && c >= sh.c - 1 && c <= sh.c + 2 && r >= sh.r - 1 && r <= sh.r + 2;
        s += `<g class="${P}tgt" data-c="${c}" data-r="${r}"><rect x="${c * Z + 2}" y="${(ROWS - 1 - r) * Z + 2}" width="${Z - 4}" height="${Z - 4}" fill="transparent"/><circle cx="${X(c)}" cy="${Y(r)}" r="12" fill="${danger ? "#e0a050" : LIME}" opacity=".9" stroke="${DARK}" stroke-width="1.5"/>${danger ? `<text x="${X(c)}" y="${Y(r) + 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${DARK}">!</text>` : ""}</g>`;
      }
      for (const f of S.folk) {
        if (f.hidden) continue;
        const sel = S.sel === f;
        s += `<g class="${P}sq" data-f="${f.i}" transform="translate(${X(f.c)} ${Y(f.r)})">
<circle r="19" fill="${sel ? GOLD : LIME}" stroke="${DARK}" stroke-width="2.5"/><circle r="13" fill="${SAGE}" stroke="${DARK}" stroke-width="1.5"/>
<circle cy="-3" r="4" fill="${DARK}"/><path d="M-7 8 Q0 -2 7 8" fill="${DARK}"/><circle cx="14" cy="-14" r="8" fill="${DARK}"/><text x="14" y="-10" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" fill="${PAPER}">${f.i + 1}</text>${isKnot(f.c, f.r) ? `<circle r="23" fill="none" stroke="${LANT}" stroke-width="1.8" stroke-dasharray="3 3"/>` : ""}</g>`;
      }
      s += `<g pointer-events="none" style="transition:transform .4s;transform:translate(${sh.c * Z + 4}px,${(ROWS - 2 - sh.r) * Z + 4}px)">
<rect width="${2 * Z - 8}" height="${2 * Z - 8}" rx="14" fill="#1a1020" opacity=".74" stroke="#6a5a7a" stroke-width="2"/><rect width="${2 * Z - 8}" height="${2 * Z - 8}" rx="14" fill="url(#${P}hat)"/>
<text x="${Z - 4}" y="${Z + 1}" text-anchor="middle" font-family="IM Fell English,serif" font-size="15" fill="#cdbfdc" letter-spacing="2">SHADOW</text></g>`;
      dyn.innerHTML = s;
    }

    function drawSide() {
      const t = S.round;
      const cards = [
        { k: "old", t: "OLD RULES", d: "a Folk on a knot cannot be hidden" },
        { k: "rain", t: "BLESSING", d: "end on rain: move again" },
        { k: "tremor", t: "TREMOR", d: `every 4th round: ↑ → ↑ ←${[4, 8, 12, 16].includes(t) ? "" : ` · next round ${[4, 8, 12, 16].find((x) => x >= t) || "—"}`}` },
        { k: "eye", t: "EYE", d: "once, a chant: the Shadow skips a turn", btn: true },
      ];
      cardsEl.innerHTML = cards.map((c) => `<div class="${P}rc ${S.fired === c.k ? P + "fire" : ""}"><b>${c.t}</b><i>${c.d}</i>${c.btn ? `<button type="button" title="E" ${S.chantUsed || S.over || S.turn !== "player" ? "disabled" : ""}>${S.chantUsed ? (S.skipNext ? "chanting…" : "chanted") : "Chant · E"}</button>` : ""}</div>`).join("");
      const b = cardsEl.querySelector("button"); if (b) b.onclick = chant;
      dots.innerHTML = Array.from({ length: ROUNDS }, (_, i) => `<i class="${i < t - 1 ? P + "d" : i === t - 1 ? P + "now" : ""} ${[3, 7, 11, 15].includes(i) ? P + "trem" : ""}"></i>`).join("");
      rd.textContent = `ROUND ${Math.min(t, ROUNDS)} / ${ROUNDS}`;
      const crown = S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length, hid = S.folk.filter((f) => f.hidden);
      stat.innerHTML = `On the Crown: <b>${crown}</b> / 3${hid.length ? ` · hidden: ${hid.map((f) => `${f.i + 1} (back in ${f.hidden - 1 || 1})`).join(", ")}` : ""}${S.log ? `<br><i>${S.log}</i>` : ""}`;
      sayEl.textContent = S.line;
      mood.textContent = S.guard ? "charges, with the crowd chanting" : "charges the nearest";
      lookBtn.textContent = `read Burr · ${S.looks}`;
      lookBtn.disabled = por.disabled = S.looks <= 0 || S.over || S.turn !== "player" || !!S.peek;
      waitBtn.disabled = S.over || S.turn !== "player";
    }
    function refresh() { drawDyn(); drawSide(); }
    function nope(el) { if (!el || api.reducedMotion) return; el.classList.remove(P + "no"); void el.offsetWidth; el.classList.add(P + "no"); }

    function chant() {
      if (S.chantUsed || S.over || S.turn !== "player") return;
      S.chantUsed = true; S.skipNext = true; S.peek = null; S.log = "The Folk chant. The Shadow will skip its next turn."; S.fired = "eye"; refresh();
    }
    function look() {
      if (S.looks <= 0 || S.over || S.turn !== "player" || S.peek) return;
      S.looks--; S.peek = S.skipNext ? { ...S.shadow } : plan();
      S.log = S.skipNext ? "Burr glances at the chanters and does not move." : "Burr glances at the board. That is where the Shadow will go, whatever you do now.";
      refresh();
    }
    function wait() {
      if (S.over || S.turn !== "player") return;
      S.sel = null; S.again = null; S.log = "The Folk hold where they are."; S.turn = "shadow"; refresh();
      later(shadowTurn, api.reducedMotion ? 150 : 520);
    }
    on(lookBtn, "click", look); on(por, "click", look); on(waitBtn, "click", wait);

    function checkWin() {
      if (S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length >= 3) {
        S.over = true; S.line = "“Well run! Well run.” He means it."; refresh();
        api.store.set("losses", 0);
        later(() => api.end({ outcome: "win", text: `Three Folk stand on the Crown in round ${S.round}. Burr laughs, bows to the board and polishes his spear. The square cheers; the Battlements +4, morale +5.${S.hiddenTotal ? ` The Shadow hid ${S.hiddenTotal} Folk on the way.` : " Not one Folk was hidden."}` }), 700);
        return true;
      }
      return false;
    }

    function playerMove(f, c, r) {
      f.c = c; f.r = r; S.sel = null; S.log = "";
      if (checkWin()) return;
      if (isRain(c, r) && S.again !== f) { S.again = f; S.sel = f; S.log = "Rain: a blessing. This Folk moves again."; S.fired = "rain"; refresh(); return; }
      S.again = null;
      if (f.r === ROWS - 1 && !S.beats.has("crown1")) { S.beats.add("crown1"); S.log = "A Folk reaches the Crown. Somewhere in the crowd, Twig: “And then what?”"; }
      S.turn = "shadow"; refresh();
      later(shadowTurn, api.reducedMotion ? 150 : 520);
    }

    function shadowTurn() {
      if (S.over) return;
      S.fired = null;
      const promised = S.peek; S.peek = null;
      if (S.skipNext) { S.skipNext = false; S.line = "“…” Burr bows his head for the chant."; S.log = "The Shadow stands still."; S.fired = "eye"; return endRound(); }
      S.shadow = promised || plan();
      const caught = S.folk.filter((f) => !f.hidden && under(f) && !isKnot(f.c, f.r));
      for (const f of caught) f.hidden = 3;
      S.hiddenTotal += caught.length;
      S.line = caught.length ? "“Got you! Back to the Root with you.”" : (S.guard ? BURR_GUARD : BURR_LINES)[Math.floor(rnd() * (S.guard ? BURR_GUARD : BURR_LINES).length)];
      S.log = caught.length ? `${caught.length} Folk hidden by the Shadow. They will come back at the Root.` : (S.log || "");
      endRound();
    }

    function endRound() {
      S.round++;
      for (const f of S.folk) if (f.hidden) {
        f.hidden--;
        if (!f.hidden) {
          const free = [0, 1, 2, 3, 4].filter((c) => !occupied(c, 0, f) && !under({ c, r: 0 }));
          if (free.length) { f.c = free[0]; f.r = 0; } else f.hidden = 1;
        }
      }
      if (S.round > ROUNDS) {
        S.over = true; refresh();
        const crown = S.folk.filter((f) => !f.hidden && f.r === ROWS - 1).length;
        api.store.set("losses", losses + 1);
        later(() => api.end({ outcome: "lose", text: `Round 16 ends with ${crown} Folk on the Crown. Burr wins the festival game and looks almost sorry about it; a loss takes nothing. The Folk will try again at summer's festival.${losses + 1 >= 2 ? " Next time, Burr says, he will go easier, and let you read him more." : ""}` }), 600);
        return;
      }
      if (S.round === GUARD_AT && !S.guard) {
        S.guard = true;
        if (S.chantUsed && !S.skipNext) S.chantUsed = false;
        S.line = "“Louder, then! Let's hear it!” Burr waves the crowd on, grinning.";
        S.log = (S.log ? S.log + " " : "") + "The lanterns are lit and the whole square takes up the chant: the Eye card can be used once more.";
      }
      const tp = TREMOR_PATTERN[S.round];
      if (tp) {
        S.fired = "tremor";
        const [dc, dr, name] = tp;
        const order = S.folk.filter((f) => !f.hidden).sort((a, b) => (dr ? b.r - a.r : dc > 0 ? b.c - a.c : a.c - b.c));
        for (const f of order) if (open(f.c, f.r, dc, dr) && !occupied(f.c + dc, f.r + dr, f)) { f.c += dc; f.r += dr; }
        S.log = (S.log ? S.log + " " : "") + `A tremor: every Folk shifts ${name} where a band runs.`;
        if (checkWin()) return;
      }
      S.turn = "player"; refresh();
    }

    // ---- input ----
    on(svg, "click", (e) => {
      if (S.over || S.turn !== "player") return;
      const t = e.target.closest("[data-f],[data-c]");
      if (!t) return;
      if (t.dataset.f != null) {
        const f = S.folk[+t.dataset.f];
        if (S.again && S.again !== f) { nope(sayEl); S.log = "Only the blessed Folk may move again."; drawSide(); return; }
        S.sel = S.sel === f ? (S.again ? f : null) : f; refresh(); return;
      }
      const c = +t.dataset.c, r = +t.dataset.r;
      if (S.sel && reach(S.sel).some(([x, y]) => x === c && y === r)) playerMove(S.sel, c, r);
      else {
        const f = S.folk.find((q) => !q.hidden && q.c === c && q.r === r);
        if (f && !S.again) { S.sel = f; refresh(); }
        else if (S.sel) { S.log = "No band runs there in two steps."; drawSide(); nope(stat); }
      }
    });
    let kpath = null;
    on(window, "keydown", (e) => {
      if (S.over || S.turn !== "player" || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^Digit[1-4]$/.test(e.code)) { const f = S.folk[+e.code.slice(5) - 1]; if (!f.hidden && (!S.again || S.again === f)) { S.sel = f; kpath = { c: f.c, r: f.r, n: 0 }; refresh(); } else nope(stat); return; }
      if (e.key === "e" || e.key === "E") return chant();
      if (e.key === "w" || e.key === "W") return look();
      if (e.key === ".") return wait();
      const dirs = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (dirs[e.key] && S.sel) {
        e.preventDefault();
        if (!kpath) kpath = { c: S.sel.c, r: S.sel.r, n: 0 };
        const [dc, dr] = dirs[e.key];
        if (!open(kpath.c, kpath.r, dc, dr)) { nope(stat); return; }
        kpath = { c: kpath.c + dc, r: kpath.r + dr, n: kpath.n + 1 };
        if (kpath.n === 2) { const k = kpath; kpath = null; if (!occupied(k.c, k.r, S.sel)) playerMove(S.sel, k.c, k.r); }
        else { dyn.insertAdjacentHTML("beforeend", `<circle cx="${X(kpath.c)}" cy="${Y(kpath.r)}" r="8" fill="${GOLD}" stroke="${DARK}"/>`); }
      }
      if (e.key === "Enter" && kpath && kpath.n === 1 && !occupied(kpath.c, kpath.r, S.sel)) { const k = kpath; kpath = null; playerMove(S.sel, k.c, k.r); }
    });
    const startBtn = wrap.querySelector(`.${P}intro button`);
    on(startBtn, "click", () => {
      wrap.querySelector("." + P + "intro").remove();
      S.log = gentle ? "Burr, cheerfully: “I'll go easy. Watch my eyes, if you like.” (W: read Burr, 4 looks)" : "New: tap Burr's portrait (W) to read where the Shadow will go next. Two looks a game.";
      refresh();
    });
    startBtn.focus();
    refresh();
    wrap._test = { S, reach, isKnot, under, open, plan: () => plan() };

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

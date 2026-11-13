// People of the Bark — The Ring Door (1D, dendrochronology letterpress).
// DESIGN.md 11.3, the Deep Knot (c4_door): four rings of eight positions, par 9, one stiff ring that
// turns two steps per click. Turning ring n also turns ring n+1 (the next one in) one step the other
// way. The door opens when every ring's grain notch lies on the line. Each move over par is a scar
// (bark integrity −1, at most −5); at or under par is a clean cut (Knot +4). After 10 moves with no
// new ring in line, the ring to turn next glows. Reset puts the rings back; moves still count.

const N = 4, POS = 8, STIFF = 1; // ring index 1 (second from outside) is stiff
const STEP = Array.from({ length: N }, (_, i) => (i === STIFF ? 2 : 1));
const BROWN = "#5a3d2b", DARK = "#3a281c", ORANGE = "#e8742a", AMBER = "#d9902a", PAPER = "#efe2c4", INK = "#2e2016";
const BANDS = [[196, 156], [156, 118], [118, 82], [82, 46]];
const GLYPHS = [
  { name: "The First Ring", line: "The people woke when the Trunk first breathed.", d: "M0 -9 L0 9 M-9 0 L9 0 M-6 -6 L6 6 M-6 6 L6 -6" },
  { name: "The Age of Grooves", line: "The first cities, carved where dawn reaches first.", d: "M-9 8 L0 -8 L9 8 M0 -8 L0 8" },
  { name: "The Great Flake", line: "Underhollow carved too many temples; the plate fell into the Under.", d: "M-9 -6 L9 -6 L5 8 L-7 4Z" },
  { name: "The Year of Two Shadows", line: "A shadow twice in one year. They hid in the knots; nothing happened.", d: "M-9 0 A5 5 0 1 0 -1 0 A5 5 0 1 0 -9 0 M1 0 A5 5 0 1 0 9 0 A5 5 0 1 0 1 0" },
];

const enc = (s) => s.reduce((a, v) => a * POS + v, 0);
const dec = (k) => { const s = new Array(N); for (let i = N - 1; i >= 0; i--) { s[i] = k % POS; k = Math.floor(k / POS); } return s; };
function apply(s, i, d) {
  const t = s.slice();
  t[i] = (t[i] + d * STEP[i] + POS * 4) % POS;
  if (i + 1 < N) t[i + 1] = (t[i + 1] - d + POS * 4) % POS;
  return t;
}
// distances from the solved door to every state (moves are reversible)
const DIST = (() => {
  const dist = new Int16Array(POS ** N).fill(-1);
  const q = [0]; dist[0] = 0;
  for (let h = 0; h < q.length; h++) {
    const s = dec(q[h]);
    for (let i = 0; i < N; i++) for (const d of [1, -1]) { const k = enc(apply(s, i, d)); if (dist[k] < 0) { dist[k] = dist[q[h]] + 1; q.push(k); } }
  }
  return dist;
})();

export default {
  mount(root, api) {
    const P = "people-of-the-bark-ring-door-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const rnd = api.rng();

    // a scramble exactly par moves from open
    const PAR = 9;
    const pool = []; for (let k = 0; k < DIST.length; k++) if (DIST[k] === PAR && dec(k).every((v) => v !== 0)) pool.push(k);
    const start = dec(pool[Math.floor(rnd() * pool.length)]);
    let st = start.slice(), moves = 0, sinceNew = 0, ccw = false, over = false;
    const revealed = new Set();
    let hintRing = -1;
    const angle = st.map((v) => v * 45); // displayed angles, accumulate so turns animate the short way

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;background:#e9dcc0;color:${INK};font-family:'Cormorant Garamond',Georgia,serif}
.${P}page{box-sizing:border-box;min-height:100%;margin:0 auto;max-width:1200px;padding:18px clamp(12px,3vw,34px);display:grid;grid-template-columns:150px minmax(0,1fr) 200px;gap:16px;align-items:center;position:relative}
.${P}page::before{content:"";position:absolute;inset:8px;border:1.5px solid ${BROWN};pointer-events:none}
.${P}h{font:600 12px ui-monospace,monospace;letter-spacing:.24em;border-bottom:1px solid ${INK};padding-bottom:4px;margin:0 0 12px}
.${P}left .${P}h{font-family:'IM Fell English',serif;font-size:19px;letter-spacing:.1em;font-weight:400}
.${P}lab{font:11px ui-monospace,monospace;letter-spacing:.24em;margin-top:14px}
.${P}big{font-family:'IM Fell English',Georgia,serif;font-size:58px;line-height:1}
.${P}big.${P}over{color:#b8402a}
.${P}small{font-size:15px;font-style:italic;line-height:1.3;margin-top:14px}
.${P}door{min-width:0;display:grid;place-items:center}
.${P}door svg{width:min(100%,calc(100vh - 150px));min-width:260px;aspect-ratio:1;display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.${P}ring{cursor:pointer;transition:transform .28s cubic-bezier(.3,1.4,.5,1)}
.${P}chron div{display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:start;margin:0 0 12px;font-size:15px;line-height:1.2}
.${P}chron i{font-size:13px;color:#5a3d2b}
.${P}chron .${P}hid{opacity:.35}
.${P}btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.${P}btn{font:13px ui-monospace,monospace;letter-spacing:.06em;background:transparent;border:1px solid ${INK};color:${INK};padding:6px 10px;cursor:pointer}
.${P}btn[aria-pressed=true]{background:${BROWN};color:${PAPER}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(233,220,192,.95);z-index:4;padding:16px}
.${P}intro div{max-width:470px;border:1.5px solid ${BROWN};background:#f3e9d2;padding:20px 22px}
.${P}intro h2{margin:0 0 6px;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px}
.${P}intro p{margin:0 0 10px;font-size:18px;line-height:1.35}
@media (max-width:820px){.${P}page{grid-template-columns:1fr 1fr;grid-template-areas:"door door" "left right"}.${P}door{grid-area:door}.${P}left{grid-area:left}.${P}right{grid-area:right}.${P}big{font-size:40px}}
</style>
<div class="${P}page">
 <div class="${P}left"><div class="${P}h">THE DEEP KNOT</div>
  <div class="${P}lab">MOVES</div><div class="${P}big ${P}mv">00</div>
  <div class="${P}lab">PAR</div><div class="${P}big">${String(PAR).padStart(2, "0")}</div>
  <div class="${P}small ${P}note">click: clockwise<br>right-click: back<br>the next ring in turns the other way</div>
  <div class="${P}btns"><button class="${P}btn ${P}dir" type="button" aria-pressed="false">↺ turn back</button><button class="${P}btn ${P}reset" type="button">reset</button></div>
 </div>
 <div class="${P}door"><svg viewBox="-210 -230 420 440" aria-label="The knot door: four rings"></svg></div>
 <div class="${P}right"><div class="${P}h">CHRONICLE</div><div class="${P}chron"></div></div>
</div>
<div class="${P}intro"><div>
 <h2>The Ring Door</h2>
 <p>The temple door is the knot's own growth rings. Turn each ring until its orange grain notch sits on the line at the top.</p>
 <p>Click a ring to turn it clockwise (right-click, or “turn back”, for the other way). Each turn also turns the next ring in one step the <b>opposite</b> way. The second ring is stiff: it moves two steps. Par is ${PAR}; each move over it scars the bark.</p>
 <button class="${P}btn" type="button">Lay hands on the door</button>
</div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg");
    const mvEl = wrap.querySelector("." + P + "mv"), chron = wrap.querySelector("." + P + "chron"), note = wrap.querySelector("." + P + "note");
    const dirBtn = wrap.querySelector("." + P + "dir");

    // ---- the printed knot ----
    function ringsTexture(r0, r1, seed) {
      const r = api.rng(seed);
      let s = "";
      for (let rad = r1 + 1.5; rad < r0 - 1; rad += 2.2 + r() * 2.6) {
        const wob = 0.8 + r() * 1.5, ph = r() * 6;
        let d = "";
        for (let a = 0; a <= 360; a += 10) {
          const t = a * Math.PI / 180, rr = rad + Math.sin(t * 3 + ph) * wob * 0.5;
          d += (a ? "L" : "M") + (Math.sin(t) * rr).toFixed(1) + " " + (-Math.cos(t) * rr).toFixed(1);
        }
        s += `<path d="${d}Z" fill="none" stroke="${BROWN}" stroke-width="${(0.5 + r() * 0.9).toFixed(2)}" opacity="${(0.45 + r() * 0.5).toFixed(2)}"/>`;
      }
      return s;
    }
    function build() {
      let out = `<defs><filter id="${P}ink"><feTurbulence baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter></defs>
<rect x="-210" y="-230" width="420" height="440" fill="none"/>
<circle r="203" fill="#d7c094" stroke="${DARK}" stroke-width="3"/>`;
      BANDS.forEach(([r0, r1], i) => {
        const mid = (r0 + r1) / 2, w = (r0 - r1) / 2;
        out += `<g class="${P}ring" data-r="${i}" style="transform:rotate(${angle[i]}deg)" filter="url(#${P}ink)">
<circle r="${mid}" fill="none" stroke="${i % 2 ? "#e2cc9c" : "#d4b783"}" stroke-width="${r0 - r1}"/>
${ringsTexture(r0, r1, 11 + i * 7)}
<circle r="${r0}" fill="none" stroke="${DARK}" stroke-width="2"/>
<path d="M-${w * 0.55} -${r0 - 1} L${w * 0.55} -${r0 - 1} L${w * 0.25} -${r1 + 1} L-${w * 0.25} -${r1 + 1}Z" fill="${ORANGE}" stroke="${DARK}" stroke-width="1"/>
${i === STIFF ? `<text x="0" y="${mid + 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" letter-spacing="2" fill="${DARK}">STIFF ×2</text>` : ""}
</g>`;
      });
      out += `<circle r="${BANDS[N - 1][1]}" fill="#c9a76c" stroke="${DARK}" stroke-width="2"/>${ringsTexture(BANDS[N - 1][1], 6, 99)}<circle r="9" fill="${BROWN}"/>`;
      // the line: a thin radial crack from the heart to the top
      out += `<path d="M0 -9 L1.5 -60 L-1 -110 L1.2 -160 L0 -228" stroke="${INK}" stroke-width="2.4" fill="none"/>`;
      out += `<g class="${P}marks"></g><g class="${P}hint"></g>`;
      svg.innerHTML = out;
    }
    build();
    const ringEls = [...svg.querySelectorAll("." + P + "ring")];
    function paint() {
      ringEls.forEach((el, i) => { el.style.transform = `rotate(${angle[i]}deg)`; });
      mvEl.textContent = String(moves).padStart(2, "0");
      mvEl.classList.toggle(P + "over", moves > PAR);
      // revealed glyphs on the line
      const marks = svg.querySelector("." + P + "marks");
      marks.innerHTML = BANDS.map(([r0, r1], i) => revealed.has(i) ? `<g transform="translate(0 ${-(r0 + r1) / 2})"><rect x="-13" y="-13" width="26" height="26" fill="${PAPER}" stroke="${INK}"/><path d="${GLYPHS[i].d}" stroke="${INK}" stroke-width="2" fill="none"/></g>` : "").join("");
      const hint = svg.querySelector("." + P + "hint");
      hint.innerHTML = hintRing >= 0 ? `<circle r="${(BANDS[hintRing][0] + BANDS[hintRing][1]) / 2}" fill="none" stroke="${AMBER}" stroke-width="${BANDS[hintRing][0] - BANDS[hintRing][1]}" opacity=".28" pointer-events="none"/>` : "";
      chron.innerHTML = GLYPHS.map((gl, i) => `<div class="${revealed.has(i) ? "" : P + "hid"}"><svg viewBox="-12 -12 24 24" width="22" height="22"><path d="${revealed.has(i) ? gl.d : "M-9 -9 H9 V9 H-9Z"}" stroke="${INK}" stroke-width="2" fill="none" ${revealed.has(i) ? "" : 'stroke-dasharray="2 2"'}/></svg><span>RING ${i + 1}${revealed.has(i) ? `<br><b>${gl.name}</b><br><i>${gl.line}</i>` : ""}</span></div>`).join("");
    }
    function turn(i, d) {
      if (over || wrap.querySelector("." + P + "intro")) return;
      st = apply(st, i, d);
      angle[i] += d * STEP[i] * 45;
      if (i + 1 < N) angle[i + 1] -= d * 45;
      moves++; sinceNew++;
      let gotNew = false;
      st.forEach((v, k) => { if (v === 0 && !revealed.has(k)) { revealed.add(k); gotNew = true; } });
      if (gotNew) { sinceNew = 0; hintRing = -1; }
      if (sinceNew >= 10) {
        const k = enc(st), dd = DIST[k];
        outer: for (let r = 0; r < N; r++) for (const dir of [1, -1]) if (DIST[enc(apply(st, r, dir))] === dd - 1) { hintRing = r; break outer; }
      }
      paint();
      if (st.every((v) => v === 0)) open();
    }
    function open() {
      over = true;
      const scars = Math.min(5, Math.max(0, moves - PAR));
      api.store.set("best", Math.min(api.store.get("best", 99), moves));
      timers.push(setTimeout(() => api.end(scars === 0
        ? { outcome: "win", text: `The Deep Knot opens in ${moves} moves, at par: a clean cut. The Knot +4. On the third ring, the Great Flake: the plate Underhollow carved too deep.` }
        : { outcome: "done", text: `The Deep Knot opens in ${moves} moves, ${moves - PAR} over par. The careless turns scar the bark: integrity −${scars}. The temple is open all the same.` }), 700));
    }

    // ---- input ----
    function ringAt(e) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const r = Math.hypot(p.x, p.y);
      return BANDS.findIndex(([r0, r1]) => r <= r0 && r > r1);
    }
    on(svg, "click", (e) => { const i = ringAt(e); if (i >= 0) turn(i, e.shiftKey || ccw ? -1 : 1); });
    on(svg, "contextmenu", (e) => { e.preventDefault(); const i = ringAt(e); if (i >= 0) turn(i, -1); });
    on(dirBtn, "click", () => { ccw = !ccw; dirBtn.setAttribute("aria-pressed", String(ccw)); note.innerHTML = ccw ? "tap: turn back<br>(anticlockwise)" : "click: clockwise<br>right-click: back<br>the next ring in turns the other way"; });
    on(wrap.querySelector("." + P + "reset"), "click", () => {
      if (over) return;
      // the rings go back to how the door was found; the moves stay counted
      for (let i = 0; i < N; i++) { const diff = ((start[i] - st[i]) % POS + POS) % POS; angle[i] += (diff > 4 ? diff - 8 : diff) * 45; }
      st = start.slice(); paint();
    });
    on(window, "keydown", (e) => {
      if (/^Digit[1-4]$/.test(e.code)) { e.preventDefault(); turn(+e.code.slice(5) - 1, e.shiftKey ? -1 : 1); }
    });
    const startBtn = wrap.querySelector(`.${P}intro .${P}btn`);
    on(startBtn, "click", () => wrap.querySelector("." + P + "intro").remove());
    startBtn.focus();
    paint();

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

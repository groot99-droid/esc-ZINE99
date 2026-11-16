// People of the Bark — The Ring Door (1D, dendrochronology letterpress).
// DESIGN.md 11.3, two doors of Knotholm played in order:
//   The Door of the First Ring (c2_door): 3 rings of 8, par 6. Pell shows the link rule on the first move.
//   The Deep Knot (c4_door): 4 rings of 8, par 9, the second ring stiff (two steps per click).
// Turning ring n also turns ring n+1 (the next one in) one step the other way. A door opens when
// every ring's grain notch lies on the line. Each move over par is a scar (bark integrity −1, at most
// −5 a door); at or under par is a clean cut (Knot +4). After 10 moves with no new ring in line, the
// ring to turn next glows (DESIGN hint). Reset puts the rings back; moves still count.
// Actions: turn (click or 1–4), turn back (right-click, Shift, or the toggle), Pell's hand (a limited
// hint: shows the best next turn), reset. Hovering a ring previews which rings it will move.

// Art (api.art): each door's printed plate heads its card (the First Ring, the Deep Knot) and the Heartwood
// Door closes the sitting; Pell's mark sits by his lines; the bark-song crack is drawn over the scar count;
// the paper frame and the Long Crack divider dress the cards. The turning rings stay drawn by code: the
// plates are still pictures and cannot turn.
import * as kit from "./_art.js";
import * as ladder from "./_ladder.js";

// Phase 2: one door a stage. Teach: the First Ring, the link rule. Test: the Deep Knot, the stiff ring, and
// five scars end the sitting. Twist: the Heartwood Door. It does not start where the chronicle says the Knot
// left it, and ring four has an eaten arc: while its notch lies in those three places it drags nothing, so the
// one rule the first two doors taught does not hold there. Opened, the push-in keeps going; then it may be
// sealed again (closing a door: par 11, pulse −10, the Knot −4). Scars are remembered (api.shared
// "door_scars"): each is a side entrance in the next Crack defence; a clean cut is a knot shelter in c6_shadow.
const CHALK = "#b9c2c4";
const SPEC = { title: "The Ring Door", chip: "left:auto;right:8px;bottom:auto;top:4px", stages: [
  { name: "The Door of the First Ring", blurb: "The link rule alone: a ring drags the next one in, the other way." },
  { name: "The Deep Knot", blurb: "Four rings, one stiff with age. Five scars and Pell takes your hands off the door." },
  { name: "The Heartwood Door", blurb: "Five rings. Someone has turned it since. On ring four the rule you learned does not hold." },
] };

const POS = 8;
const BROWN = "#5a3d2b", DARK = "#3a281c", ORANGE = "#e8742a", AMBER = "#d9902a", PAPER = "#efe2c4", INK = "#2e2016", RED = "#b8402a";
const DOORS = [
  {
    name: "THE DOOR OF THE FIRST RING", short: "The First Ring", n: 3, par: 6, stiff: -1,
    bands: [[196, 150], [150, 104], [104, 58]],
    glyphs: [
      { name: "The First Ring", line: "The people woke when the Trunk first breathed.", d: "M0 -9 L0 9 M-9 0 L9 0 M-6 -6 L6 6 M-6 6 L6 -6" },
      { name: "The Age of Grooves", line: "The first cities, carved where dawn reaches first.", d: "M-9 8 L0 -8 L9 8 M0 -8 L0 8" },
      { name: "The First Temple", line: "Knotholm was carved around this knot, ring by ring, so the door would always know its way.", d: "M-8 9 V-2 L0 -9 L8 -2 V9 Z M-3 9 V3 H3 V9" },
    ],
  },
  {
    name: "THE DEEP KNOT", short: "The Deep Knot", n: 4, par: 9, stiff: 1,
    bands: [[196, 156], [156, 118], [118, 82], [82, 46]],
    glyphs: [
      { name: "The Long Crack", line: "The road first run from Lowridge to Knotholm, by a runner whose name is worn away.", d: "M-9 -8 L-3 -2 L-6 3 L1 6 L-1 9 M9 -9 L4 -4" },
      { name: "The Scroll House", line: "Scholars began to write the tremors down, so the gods would not have to repeat themselves.", d: "M-8 -7 H8 M-8 -2 H5 M-8 3 H8 M-8 8 H3" },
      { name: "The Great Flake", line: "Underhollow carved too many temples; the plate fell into the Under.", d: "M-9 -6 L9 -6 L5 8 L-7 4Z" },
      { name: "The Year of Two Shadows", line: "A shadow twice in one year. They hid in the knots; nothing happened.", d: "M-9 0 A5 5 0 1 0 -1 0 A5 5 0 1 0 -9 0 M1 0 A5 5 0 1 0 9 0 A5 5 0 1 0 1 0" },
    ],
  },
  {
    name: "THE HEARTWOOD DOOR", short: "The Heartwood Door", n: 5, par: 9, stiff: -1, eaten: { ring: 3, pos: [3, 4, 5] },
    bands: [[196, 164], [164, 133], [133, 102], [102, 72], [72, 44]],
    glyphs: [
      { name: "Underhollow", line: "The Knot's chronicle: they carved too many temples, and the plate fell.", d: "M-9 -6 L9 -6 L5 8 L-7 4Z M-4 -6 L-2 8" },
      { name: "The Floor Went First", line: "Scratched beside it, in another hand: the floor went first.", d: "M-9 -3 H9 M-9 3 H-3 M3 3 H9 M-2 5 L0 9 L2 5" },
      { name: "Turned Since", line: "This ring is not where the chronicle says the Knot left it. Someone has turned it since.", d: "M-7 4 A8 8 0 1 1 6 5 M6 5 L9 0 M6 5 L1 4" },
      { name: "The Eaten Arc", line: "Three places on this ring are thin as paper. There it turns alone.", d: "M-9 2 A9 9 0 0 1 9 2 M-5 6 h2 M-1 7 h2 M3 6 h2" },
      { name: "The Pulse", line: "At the heart there is no carving. Only a small steady tapping, and nobody's hand.", d: "M-9 0 H-4 L-2 -6 L1 6 L3 0 H9" },
    ],
  },
];

function solver(door) {
  const N = door.n, STEP = Array.from({ length: N }, (_, i) => (i === door.stiff ? 2 : 1));
  const enc = (s) => s.reduce((a, v) => a * POS + v, 0);
  const dec = (k) => { const s = new Array(N); for (let i = N - 1; i >= 0; i--) { s[i] = k % POS; k = Math.floor(k / POS); } return s; };
  const E = door.eaten || null;
  // the eaten arc: while that ring's notch lies in it, turning the ring drags nothing
  const loose = (s, i) => !!E && i === E.ring && E.pos.includes(s[i]);
  const apply = (s, i, d) => { const t = s.slice(); t[i] = (t[i] + d * STEP[i] + POS * 4) % POS; if (i + 1 < N && !loose(s, i)) t[i + 1] = (t[i + 1] - d + POS * 4) % POS; return t; };
  const dist = new Int16Array(POS ** N).fill(-1);
  if (!E) {
    const q = [0]; dist[0] = 0;
    for (let h = 0; h < q.length; h++) {
      const s = dec(q[h]);
      for (let i = 0; i < N; i++) for (const d of [1, -1]) { const k = enc(apply(s, i, d)); if (dist[k] < 0) { dist[k] = dist[q[h]] + 1; q.push(k); } }
    }
  } else {
    // with the arc a turn cannot always be undone, so distances are found backwards from the open door
    const M = N * 2, total = POS ** N, nxt = new Int32Array(total * M), cnt = new Int32Array(total + 1);
    for (let k = 0; k < total; k++) { const s = dec(k); for (let i = 0; i < N; i++) for (let j = 0; j < 2; j++) { const t = enc(apply(s, i, j ? -1 : 1)); nxt[k * M + i * 2 + j] = t; cnt[t + 1]++; } }
    for (let k = 0; k < total; k++) cnt[k + 1] += cnt[k];
    const fill = cnt.slice(0, total), pred = new Int32Array(total * M);
    for (let k = 0; k < total; k++) for (let m = 0; m < M; m++) { const t = nxt[k * M + m]; pred[fill[t]++] = k; }
    const q = [0]; dist[0] = 0;
    for (let h = 0; h < q.length; h++) { const t = q[h]; for (let p = cnt[t]; p < cnt[t + 1]; p++) { const k = pred[p]; if (dist[k] < 0) { dist[k] = dist[t] + 1; q.push(k); } } }
  }
  const best = (s) => { const dd = dist[enc(s)]; for (let r = 0; r < N; r++) for (const d of [1, -1]) if (dist[enc(apply(s, r, d))] === dd - 1) return [r, d]; return null; };
  return { N, STEP, enc, dec, apply, dist, best, loose };
}

export default {
  mount(root, api) { return ladder.run(root, api, SPEC, play); },
};

function play(root, api, stage) {
  {
    const P = "people-of-the-bark-ring-door-";
    const shared = api.shared || { get: (k, d) => d, set() {} };
    let sealing = false, arcSaid = false;
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const rnd = api.rng();
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;

    let di = 0, D = DOORS[0], SV = solver(D), start, st, moves = 0, sinceNew = 0, ccw = false, over = false, busy = false;
    let revealed = new Set(), hintRing = -1, hintDir = 1, hands = gentle ? 4 : 2, angle = [], hover = -1;
    const record = []; // per door: { moves, scars }

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${INK};font-family:'Cormorant Garamond',Georgia,serif;
 background:radial-gradient(ellipse at 50% 45%,#f1e6cc,#e2d1ac 80%)}
.${P}wrap::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.5;
 background:repeating-linear-gradient(0deg,rgba(90,61,43,.05) 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,rgba(90,61,43,.04) 0 1px,transparent 1px 4px)}
.${P}page{box-sizing:border-box;min-height:100%;margin:0 auto;max-width:1200px;padding:18px clamp(14px,3vw,34px);display:grid;grid-template-columns:190px minmax(0,1fr) 230px;gap:16px;align-items:center;position:relative}
.${P}page::before{content:"";position:absolute;inset:8px;border:1.5px solid ${BROWN};outline:1px solid ${BROWN};outline-offset:-5px;pointer-events:none}
.${P}h{font-family:'IM Fell English',serif;font-size:19px;letter-spacing:.08em;font-weight:400;border-bottom:1.5px solid ${INK};padding-bottom:5px;margin:0 0 10px;line-height:1.15}
.${P}lab{font:12px ui-monospace,monospace;letter-spacing:.22em;margin-top:12px}
.${P}big{font-family:'IM Fell English',Georgia,serif;font-size:56px;line-height:1;transition:color .2s}
.${P}big.${P}over{color:${RED}}
.${P}scar{font:13px ui-monospace,monospace;color:${RED};min-height:1.2em;letter-spacing:.06em}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:5px 8px;font-size:15px;line-height:1.25;margin-top:12px}
.${P}key kbd{font:12px ui-monospace,monospace;border:1px solid ${INK};padding:1px 5px;border-radius:2px;white-space:nowrap;align-self:start;background:rgba(255,250,235,.5)}
.${P}left .${P}key{grid-template-columns:1fr;gap:2px}.${P}left .${P}key span{margin-bottom:6px}
.${P}door{min-width:0;display:grid;place-items:center;position:relative}
.${P}door svg{width:min(100%,calc(100vh - 130px));min-width:260px;aspect-ratio:420/440;display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.${P}ring{cursor:pointer;transition:transform .32s cubic-bezier(.3,1.4,.5,1)}
.${P}hov{opacity:.0;transition:opacity .15s}
.${P}chron .${P}e{display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:start;margin:0 0 12px;font-size:15px;line-height:1.25}
.${P}chron i{font-size:15px;color:#4a3324}
.${P}chron .${P}hid{opacity:.5}
.${P}chron .${P}new{animation:${P}ink 1.2s ease-out}
@keyframes ${P}ink{0%{background:rgba(232,116,42,.45)}100%{background:transparent}}
.${P}btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.${P}btn{font:14px ui-monospace,monospace;letter-spacing:.04em;background:rgba(255,250,235,.5);border:1px solid ${INK};color:${INK};padding:7px 10px;cursor:pointer;min-height:38px;border-radius:2px}
.${P}btn:hover:not(:disabled){background:#fff6dc}
.${P}btn:disabled{opacity:.4;cursor:default}
.${P}btn[aria-pressed=true]{background:${BROWN};color:${PAPER}}
.${P}btn:focus-visible{outline:3px solid ${ORANGE};outline-offset:2px}
.${P}pell{font-style:italic;font-size:16px;line-height:1.35;min-height:2.8em;margin-top:12px;color:#4a3324}
.${P}pell b{font-style:normal;font:12px ui-monospace,monospace;letter-spacing:.14em;color:${RED};display:block}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(226,209,172,.94);z-index:4;padding:16px;overflow:auto}
.${P}plate{max-width:460px;width:100%;box-sizing:border-box;background:#f6ecd4;border:2px solid ${BROWN};outline:1px solid ${BROWN};outline-offset:4px;padding:18px 22px;text-align:center;position:relative}
.${P}plate svg{width:120px;height:120px;display:block;margin:0 auto 4px}
.${P}plate{max-height:100%;overflow:auto}
.${P}plate .${P}pic{display:block;width:min(100%,230px);height:auto;margin:8px auto 6px;border:1px solid ${BROWN}}
.${P}picwrap{aspect-ratio:4/3;width:min(100%,250px);margin:8px auto 6px;background:center/100% 100% no-repeat;display:grid;place-items:center}
.${P}picwrap .${P}pic{width:auto;height:72%;margin:0;border:0;box-shadow:0 1px 0 rgba(58,40,28,.4)}
.${P}song{display:block;width:100%;height:auto;margin:10px 0 2px;border:1px solid ${DARK}}
.${P}pellrow{display:flex;gap:8px;align-items:flex-start;margin-top:12px}
.${P}pellrow .${P}pell{margin-top:0;flex:1}
.${P}plate h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:28px;letter-spacing:.08em;text-transform:uppercase}
.${P}plate .${P}sub{font:12px ui-monospace,monospace;letter-spacing:.24em;color:${RED};margin:2px 0 10px}
.${P}plate .${P}beat{font-style:italic;font-size:17px;line-height:1.4;margin:0 0 10px}
.${P}plate .${P}goal{font-size:18px;line-height:1.35;margin:0 0 10px;border-top:1px solid ${BROWN};border-bottom:1px solid ${BROWN};padding:8px 0}
.${P}plate .${P}key{text-align:left;max-width:340px;margin:0 auto 14px;font-size:16px}
.${P}go{font-family:'IM Fell English',Georgia,serif;font-size:19px;background:${BROWN};color:${PAPER};border:0;padding:8px 18px;cursor:pointer;border-radius:2px}
.${P}go:focus-visible{outline:3px solid ${ORANGE};outline-offset:3px}
@media (max-width:820px){.${P}page{grid-template-columns:1fr 1fr;grid-template-areas:"door door" "left right"}.${P}door{grid-area:door}.${P}left{grid-area:left}.${P}right{grid-area:right}.${P}big{font-size:40px}.${P}door svg{width:100%}}
@media (prefers-reduced-motion:reduce){.${P}ring{transition:none}.${P}chron .${P}new{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}left"><div class="${P}h ${P}name"></div>
  <div class="${P}lab">MOVES</div><div class="${P}big ${P}mv">00</div>
  <div class="${P}lab">PAR</div><div class="${P}big ${P}par">00</div>
  ${api.art && api.art.has("ui-bark-song") ? `<img class="${P}song" src="${api.art.url("ui-bark-song")}" alt="" width="1200" height="140">` : ""}
  <div class="${P}scar" aria-live="polite"></div>
  <div class="${P}btns"><button class="${P}btn ${P}dir" type="button" aria-pressed="false" title="Shift">↺ turn back</button><button class="${P}btn ${P}hand" type="button" title="H"></button><button class="${P}btn ${P}reset" type="button" title="R">reset</button></div>
  <div class="${P}key"><kbd>tap / 1–4</kbd><span>turn a ring clockwise</span><kbd>right-click / ⇧</kbd><span>turn it back</span></div>
 </div>
 <div class="${P}door"><svg viewBox="-210 -230 420 440" aria-label="The knot door"></svg></div>
 <div class="${P}right"><div class="${P}h">CHRONICLE</div><div class="${P}chron"></div><div class="${P}pellrow">${kit.mark(api.art, "pell", "Elder Pell")}<div class="${P}pell" aria-live="polite"></div></div></div>
</div>`;
    root.appendChild(wrap);
    kit.styles(wrap);
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    let endEl = null;
    const $ = (s) => wrap.querySelector("." + P + s);
    const svg = wrap.querySelector("svg");
    const mvEl = $("mv"), parEl = $("par"), chron = $("chron"), pell = $("pell"), scarEl = $("scar"), nameEl = $("name");
    const dirBtn = $("dir"), handBtn = $("hand"), resetBtn = $("reset");
    const say = (who, t) => { pell.innerHTML = `<b>${who}</b>${t}`; };

    function setupDoor(i) {
      di = i; D = DOORS[i]; SV = solver(D);
      let par = sealing ? 11 : D.par;
      const pool = [];
      for (; par > 2 && !pool.length; par--) for (let k = 0; k < SV.dist.length; k++) if (SV.dist[k] === par && SV.dec(k).every((v) => v !== 0)) pool.push(k);
      par++;
      if (par !== D.par) D = Object.assign({}, D, { par });

      start = SV.dec(pool[Math.floor(rnd() * pool.length)]);
      st = start.slice(); moves = 0; sinceNew = 0; over = false; busy = false; revealed = new Set(); hintRing = -1; hover = -1;
      angle = st.map((v) => v * 45);
      nameEl.textContent = D.name; parEl.textContent = String(D.par).padStart(2, "0");
      build(); paint();
    }

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
      const B = D.bands, N = D.n;
      let out = `<defs><filter id="${P}ink"><feTurbulence baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="1.6"/></filter>
<marker id="${P}ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${RED}"/></marker></defs>
<circle r="205" fill="#d7c094" stroke="${DARK}" stroke-width="3"/><g class="${P}scars"></g>`;
      B.forEach(([r0, r1], i) => {
        const mid = (r0 + r1) / 2, w = (r0 - r1) / 2;
        out += `<g class="${P}ring" data-r="${i}" style="transform:rotate(${angle[i]}deg)" filter="url(#${P}ink)">
<circle r="${mid}" fill="none" stroke="${i % 2 ? "#e6cf9c" : "#d9b77c"}" stroke-width="${r0 - r1}"/>
${ringsTexture(r0, r1, 11 + i * 7 + di * 50)}
<circle r="${r0}" fill="none" stroke="${DARK}" stroke-width="2"/>
<path d="M-${w * 0.55} -${r0 - 1} L${w * 0.55} -${r0 - 1} L${w * 0.25} -${r1 + 1} L-${w * 0.25} -${r1 + 1}Z" fill="${ORANGE}" stroke="${DARK}" stroke-width="1"/>
<text x="0" y="${mid + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" font-weight="600" fill="${DARK}" opacity=".75">${i + 1}${i === D.stiff ? " · STIFF ×2" : ""}</text>
</g>`;
      });
      out += `<circle r="${B[N - 1][1]}" fill="#c9a76c" stroke="${DARK}" stroke-width="2"/>${ringsTexture(B[N - 1][1], 6, 99)}<circle r="9" fill="${BROWN}"/>`;
      if (D.eaten) {
        // the eaten arc: fixed on the frame, pale and ribbed, where ring four turns alone
        const [e0, e1] = B[D.eaten.ring], em = (e0 + e1) / 2, a0 = (D.eaten.pos[0] - 0.5) * 45, a1 = (D.eaten.pos[D.eaten.pos.length - 1] + 0.5) * 45;
        const pt = (a, r) => [Math.sin(a * Math.PI / 180) * r, -Math.cos(a * Math.PI / 180) * r];
        const [x0, y0] = pt(a0, em), [x1, y1] = pt(a1, em);
        out += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${em} ${em} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${CHALK}" stroke-width="${e0 - e1 - 6}" opacity=".62" stroke-dasharray="3 5" pointer-events="none"/>`;
      }
      out += `<path d="M0 -9 L1.5 -60 L-1 -110 L1.2 -160 L0 -228" stroke="${INK}" stroke-width="2.4" fill="none"/>`;
      out += `<g class="${P}marks"></g><g class="${P}hint" pointer-events="none"></g><g class="${P}prev" pointer-events="none"></g>`;
      svg.innerHTML = out;
      svg.setAttribute("aria-label", `${D.short}: ${N} rings`);
    }
    const ringEls = () => [...svg.querySelectorAll("." + P + "ring")];
    function arc(r, a0, a1, col, w, dash) {
      const p = (a) => [Math.sin(a * Math.PI / 180) * r, -Math.cos(a * Math.PI / 180) * r];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 ${a1 > a0 ? 1 : 0} ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#${P}ah)"/>`;
    }
    function paint() {
      ringEls().forEach((el, i) => { el.style.transform = `rotate(${angle[i]}deg)`; });
      mvEl.textContent = String(moves).padStart(2, "0");
      mvEl.classList.toggle(P + "over", moves > D.par);
      const scars = Math.min(5, Math.max(0, moves - D.par));
      scarEl.textContent = scars ? `scars ${"✕".repeat(scars)}  integrity −${scars}` : moves === D.par ? "at par: no more spare turns" : `${D.par - moves} turns to spare`;
      // scars cut into the outer bark, one notch per move over par
      svg.querySelector("." + P + "scars").innerHTML = Array.from({ length: scars }, (_, k) => { const a = 200 + k * 34; return `<path d="M0 -205 l-3 12 l5 -4 l-2 12" stroke="${RED}" stroke-width="2.4" fill="none" transform="rotate(${a})"/>`; }).join("");
      svg.querySelector("." + P + "marks").innerHTML = D.bands.map(([r0, r1], i) => revealed.has(i) ? `<g transform="translate(0 ${-(r0 + r1) / 2})"><rect x="-14" y="-14" width="28" height="28" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><path d="${D.glyphs[i].d}" stroke="${INK}" stroke-width="2" fill="none"/></g>` : "").join("");
      const hint = svg.querySelector("." + P + "hint");
      if (hintRing >= 0) {
        const [r0, r1] = D.bands[hintRing], mid = (r0 + r1) / 2;
        hint.innerHTML = `<circle r="${mid}" fill="none" stroke="${AMBER}" stroke-width="${r0 - r1}" opacity=".32"/>` + arc(mid, hintDir > 0 ? -60 : 60, hintDir > 0 ? -20 : 20, RED, 4);
      } else hint.innerHTML = "";
      // hover preview: the ring you point at, and the next one in, which turns the other way
      const prev = svg.querySelector("." + P + "prev");
      if (hover >= 0 && !over) {
        const d = ccw ? -1 : 1, [h0, h1] = D.bands[hover], m = (h0 + h1) / 2;
        let s = `<circle r="${m}" fill="none" stroke="#fff6dc" stroke-width="${h0 - h1}" opacity=".22"/>` + arc(m, d > 0 ? 25 : -25, d > 0 ? 25 + 30 * SV.STEP[hover] : -25 - 30 * SV.STEP[hover], RED, 3);
        if (hover + 1 < D.n && !SV.loose(st, hover)) { const [n0, n1] = D.bands[hover + 1], mn = (n0 + n1) / 2; s += arc(mn, d > 0 ? 55 : -55, d > 0 ? 25 : -25, RED, 2.5, "5 4"); }
        prev.innerHTML = s;
      } else prev.innerHTML = "";
      chron.innerHTML = D.glyphs.map((gl, i) => `<div class="${P}e ${revealed.has(i) ? "" : P + "hid"}" data-g="${i}"><svg viewBox="-12 -12 24 24" width="24" height="24"><path d="${revealed.has(i) ? gl.d : "M-9 -9 H9 V9 H-9Z"}" stroke="${INK}" stroke-width="2" fill="none" ${revealed.has(i) ? "" : 'stroke-dasharray="2 2"'}/></svg><span>RING ${i + 1}${revealed.has(i) ? `<br><b>${gl.name}</b><br><i>${gl.line}</i>` : ""}</span></div>`).join("");
      handBtn.textContent = stage === 2 ? `A steady hand · ${hands}` : `Pell's hand · ${hands}`;
      handBtn.disabled = hands <= 0 || over;
    }
    function turn(i, d) {
      if (over || busy || wrap.querySelector("." + P + "intro") || i < 0 || i >= D.n) return;
      const alone = SV.loose(st, i);
      st = SV.apply(st, i, d);
      angle[i] += d * SV.STEP[i] * 45;
      if (i + 1 < D.n && !alone) angle[i + 1] -= d * 45;
      moves++; sinceNew++;
      if (hintRing === i) hintRing = -1;
      const fresh = [];
      st.forEach((v, k) => { if (v === 0 && !revealed.has(k)) { revealed.add(k); fresh.push(k); } });
      if (fresh.length) { sinceNew = 0; hintRing = -1; }
      if (sinceNew >= 10) { const b = SV.best(st); if (b) { [hintRing, hintDir] = b; say("The grain", "One ring glows where your hands keep missing it."); } }
      paint();
      for (const k of fresh) {
        const el = chron.querySelector(`[data-g="${k}"]`); if (el) el.classList.add(P + "new");
      }
      if (moves === 1 && di === 0) say("Pell", i + 1 < D.n ? `“See? Ring ${i + 2} moved too, the other way. The knot grew them together.”` : "“The heart ring turns alone. The others drag their neighbour.”");
      else if (fresh.length) say(stage === 2 ? "Chanter Hollow" : "Pell", stage === 2 ? `holds the lantern to the ring. ${D.glyphs[fresh[0]].name}. He reads it, and does not chant.` : `“${D.glyphs[fresh[0]].name}. The Trunk does not shout twice. Write it down.”`);
      else if (moves === D.par + 1) say("Pell", "“Gently. Every extra turn is a cut in the living bark.”");
      if (alone && !arcSaid) { arcSaid = true; say("The grain", "Ring four turns and ring five does not follow. Under your hand the wood here is thin as paper. In the pale arc it drags nothing."); }
      else if (stage === 2 && moves === 1 && !sealing) say("Chanter Hollow", "“This is not how the chronicle says the Knot left it.” Someone has turned it since. He does not say who he thinks it was.");
      if (st.every((v) => v === 0)) open();
      else if (stage === 1 && moves - D.par >= 5) {
        over = true; busy = true; paint();
        shared.set("door_scars", 2); api.store.set("losses", losses + 1);
        say("Pell", "takes your hands off the door.");
        later(() => api.end({ outcome: "lose", text: `Five scars round the Deep Knot, and the door still shut. Pell takes your hands off it. “The Trunk remembers the turns. So will the crack below this temple.” Bark integrity −5.${losses + 1 >= 2 ? " Next time Pell will lend his hand more often." : ""}` }), 1200);
      }
    }
    function hand() {
      if (over || hands <= 0) return;
      const b = SV.best(st); if (!b) return;
      hands--; [hintRing, hintDir] = b;
      say(stage === 2 ? "Your own hand" : "Pell's hand", `rests on ring ${b[0] + 1}: ${b[1] > 0 ? "“This way, with the sun.”" : "“Back. Against the sun.”"}`);
      paint();
    }
    function open() {
      over = true; busy = true; hover = -1;
      const scars = Math.min(5, Math.max(0, moves - D.par));
      record.push({ moves, scars, par: D.par });
      paint();
      say("The door", scars ? `swings in, grinding. ${scars} scar${scars > 1 ? "s" : ""} in the bark around it.` : "swings in without a sound. A clean cut.");
      // what the door remembers goes to the other layers: scars are side entrances, a clean cut is a shelter
      shared.set("door_scars", Math.min(2, scars)); if (!scars) shared.set("door_clean", (shared.get("door_clean", 0) | 0) + 1);
      api.store.set("losses", scars ? losses + 1 : 0);
      const cut = scars ? `${scars} scar${scars > 1 ? "s" : ""} in the living bark (integrity −${scars})` : "a clean cut (the Knot +4)";
      const wait = api.reducedMotion ? 400 : 1300;
      if (stage === 0) later(() => api.end({ outcome: "win", text: `The Door of the First Ring opens in ${moves} turns (par ${D.par}): ${cut}. Pell: “The knot grew them together. Now you know it in your hands.”` }), wait);
      else if (stage === 1) later(() => api.end({ outcome: "win", text: `The Deep Knot opens in ${moves} turns (par ${D.par}): ${cut}. Pell runs his thumb along the Great Flake ring and says nothing for a long time.` }), wait);
      else if (!sealing) later(pushIn, wait);
      else later(() => finishTwist(true, scars), wait);
    }
    // the set-piece: the door opens and the push-in keeps going
    let openScars = 0;
    function pushIn() {
      openScars = record[record.length - 1].scars;
      plate("The Heartwood, opened", "WINTER · UNDER KNOTHOLM",
        "The door swings in and the push-in keeps going. Where the hall of ancestors should be there is lantern light travelling a long way down, and walls of something thin and pale, ribbed with dried mud. Nothing moves. Chanter Hollow's offering bowls stand by the crack in the threshold, where “the Trunk drinks them”, all of them empty.",
        "The Knot wants the door <b>closed</b> again and never spoken of: bring every notch back to the crack once more (par 11; the Pulse falls, the Knot −4). Or leave it standing open.",
        `<kbd>the pale arc</kbd><span>ring four still turns alone there</span>`,
        "Seal the Heartwood", () => { sealing = true; over = false; busy = false; setupDoor(2); say("Chanter Hollow", "“Trunk, hear us. Trunk, hold us.” He does not look through the door while you work."); }, "door-heartwood");
      const card = wrap.querySelector("." + P + "intro"), b = document.createElement("button");
      b.type = "button"; b.className = P + "go"; b.style.marginLeft = "8px"; b.textContent = "Leave it open";
      card.querySelector("." + P + "plate").appendChild(b);
      on(b, "click", () => { card.remove(); finishTwist(false, openScars); });
    }
    function finishTwist(sealed, scars) {
      const total = record.reduce((a, r) => a + r.scars, 0);
      if (sealed) { ladder.pulse(api, -10); shared.set("heartwood", "sealed"); } else shared.set("heartwood", "open");
      shared.set("door_scars", Math.min(2, total));
      const res = { outcome: "win", text: sealed
        ? `The Heartwood Door is opened and sealed again${total ? `, with ${total} scar${total > 1 ? "s" : ""} round it` : ", on clean cuts"}. Behind it the tapping goes on, fainter. The Knot −4: a thing that had to be shut is a thing that was seen. Nobody speaks of the hall.`
        : `The Heartwood Door stands open${total ? `, with ${total} scar${total > 1 ? "s" : ""} round it` : ", on a clean cut"}. Lantern light goes a long way down between paper walls. The Knot sets a novice at the threshold to say that nothing is there.` };
      const id = sealed && art.has("door-heartwood-sealed") ? "door-heartwood-sealed" : "door-heartwood";
      endEl = kit.endCard(root, api, id, res, sealed ? "<b>THE HEARTWOOD · SEALED</b>Turned back to the line, and the line chalked over." : "<b>THE HEARTWOOD · OPEN</b>Where the hall of ancestors should be.");
    }
    function interludeOld() {}
    function interlude() {
      const r = record[0];
      plate("The Deep Knot", "AUTUMN · THE SECOND DOOR",
        `${r.scars ? `The First Ring is open, with ${r.scars} scar${r.scars > 1 ? "s" : ""}.` : "The First Ring is open, clean."} Pell leads you down, under Knotholm, to an older door. The second ring here is stiff with age: it moves two steps for one push.`,
        `Line up four rings. Par is 9.`,
        `<kbd>H</kbd><span>Pell's hand: shows the best next turn (${hands} left)</span><kbd>R</kbd><span>reset: rings back as found, moves still count</span>`,
        "Lay hands on the Deep Knot", () => setupDoor(1), "door-deep-knot");
    }
    function finish() {
      const total = record.reduce((a, r) => a + r.scars, 0), clean = record.filter((r) => !r.scars).length;
      api.store.set("best", Math.min(api.store.get("best", 99), record[1].moves));
      api.store.set("losses", total ? losses + 1 : 0);
      const knot = clean * 4;
      const parts = record.map((r, i) => `${DOORS[i].short} in ${r.moves} (par ${r.par})`).join(", ");
      endEl = kit.endCard(root, api, "door-heartwood", total === 0
        ? { outcome: "win", text: `Both doors open on clean cuts: ${parts}. The Knot +${knot}. Pell runs his thumb along the Great Flake ring and says nothing for a long time.` }
        : { outcome: "done", text: `Both doors open: ${parts}. The careless turns cost the bark ${total} point${total > 1 ? "s" : ""} of integrity${knot ? `; the clean door pleases the Knot, +${knot}` : ""}. The temples are open all the same.${losses + 1 >= 2 ? " Next time Pell will lend his hand more often." : ""}` },
        "<b>DEEPER STILL · WINTER</b>The Heartwood Door: five rings, and the last the Knot will ask of your hands.");
    }
    function plate(title, sub, beat, goal, keys, btn, go, doorArt, chap) {
      const card = document.createElement("div");
      card.className = P + "intro";
      const rings = Array.from({ length: 7 }, (_, k) => `<circle r="${54 - k * 7}" fill="none" stroke="${BROWN}" stroke-width="${k % 2 ? 1 : 2.4}"/>`).join("");
      const pic = doorArt && art.has(doorArt)
        ? `<div class="${P}picwrap" ${art.has("ui-frame-paper") ? `style="background-image:url(${art.url("ui-frame-paper")})"` : ""}><img class="${P}pic" src="${art.url(doorArt)}" alt="${art.info(doorArt).title}, as the chronicle prints it" width="230" height="230"></div>`
        : `<svg viewBox="-60 -60 120 120" aria-hidden="true">${rings}<path d="M-6 -54 L6 -54 L3 -40 L-3 -40Z" fill="${ORANGE}"/><path d="M0 -60 V0" stroke="${INK}" stroke-width="1.6"/></svg>`;
      card.innerHTML = `<div class="${P}plate" role="dialog" aria-label="${title}">${chap ? kit.chapter(art, chap) : ""}${pic}
<h2>${title}</h2><div class="${P}sub">${sub}</div><p class="${P}beat">${beat}</p><p class="${P}goal">${goal}</p><div class="${P}key">${keys}</div>${kit.divider(art)}<button class="${P}go" type="button">${btn}</button></div>`;
      wrap.appendChild(card);
      const b = card.querySelector("button");
      on(b, "click", () => { card.remove(); go && go(); });
      b.focus({ preventScroll: true });
    }

    // ---- input ----
    function ringAt(e) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const r = Math.hypot(p.x, p.y);
      return D.bands.findIndex(([r0, r1]) => r <= r0 && r > r1);
    }
    on(svg, "click", (e) => { const i = ringAt(e); if (i >= 0) turn(i, e.shiftKey || ccw ? -1 : 1); });
    on(svg, "contextmenu", (e) => { e.preventDefault(); const i = ringAt(e); if (i >= 0) turn(i, -1); });
    on(svg, "pointermove", (e) => { if (e.pointerType === "touch") return; const i = ringAt(e); if (i !== hover) { hover = i; paint(); } });
    on(svg, "pointerleave", () => { if (hover !== -1) { hover = -1; paint(); } });
    const setDir = (v) => { ccw = v; dirBtn.setAttribute("aria-pressed", String(ccw)); dirBtn.textContent = ccw ? "↺ turning back" : "↺ turn back"; paint(); };
    on(dirBtn, "click", () => setDir(!ccw));
    on(handBtn, "click", hand);
    on(resetBtn, "click", () => {
      if (over) return;
      for (let i = 0; i < D.n; i++) { const diff = ((start[i] - st[i]) % POS + POS) % POS; angle[i] += (diff > 4 ? diff - 8 : diff) * 45; }
      st = start.slice(); hintRing = -1; paint();
      say("Pell", "“Back to how the knot was found. The Trunk remembers the turns.”");
    });
    on(window, "keydown", (e) => {
      if (wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^Digit[1-5]$/.test(e.code)) { e.preventDefault(); turn(+e.code.slice(5) - 1, e.shiftKey || ccw ? -1 : 1); }
      else if (e.key === "h" || e.key === "H") hand();
      else if (e.key === "r" || e.key === "R") resetBtn.click();
    });

    setupDoor(stage);
    if (stage === 1) plate("The Deep Knot", "AUTUMN · THE SECOND DOOR",
      "Pell leads you down, under Knotholm, to an older door. The second ring here is stiff with age: it moves two steps for one push.",
      "Line up four rings. Par is 9. <b>Five scars</b> and Pell stops you: the bark will not take more.",
      `<kbd>H</kbd><span>Pell's hand: shows the best next turn (${hands} left)</span><kbd>R</kbd><span>reset: rings back as found, moves still count</span>`,
      "Lay hands on the Deep Knot", () => say("Pell", "“Count before you cut.”"), "door-deep-knot", "chapter-4-autumn");
    else if (stage === 2) plate("The Heartwood Door", "WINTER · THE LAST DOOR",
      "Five rings, and the last the Knot will ask of your hands. Pell is dead; Chanter Hollow holds the lantern. The chronicle says how the Knot left this door. It is not how you find it.",
      "Line up five rings. Par is 9. On ring four a pale arc is marked: while that ring's notch lies in it, the ring <b>drags nothing</b>.",
      `<kbd>tap a ring · 1–5</kbd><span>turn it; ⇧ or right-click turns it back</span><kbd>H</kbd><span>a hand on the right ring (${hands} left)</span>`,
      "Lay hands on the Heartwood", () => say("Chanter Hollow", "“The Trunk drinks what we pour here. It has always been thirsty at this door.”"), "door-heartwood", "chapter-5-winter");
    else plate("The Ring Door", "KNOTHOLM · THE FIRST DOOR",
      "Their temples are carved into knots. Elder Pell's eyes are failing, so tonight your hands are his. The door is the knot's own growth rings, cut free.",
      "Turn each ring until its orange notch sits on the crack at the top. Stay at par and the bark is not scarred.",
      `<kbd>tap a ring</kbd><span>turn it one step clockwise</span><kbd>right-click / ⇧</kbd><span>turn it back</span><kbd>watch</kbd><span>the next ring in turns too, the other way</span>`,
      "Lay hands on the door", () => say("Pell", gentle ? "“Take my hand when you need it. I have four turns of help in me tonight.”" : "“Count before you cut.”"), "door-first-ring");

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); if (endEl) endEl.remove(); wrap.remove(); } };
  }
}

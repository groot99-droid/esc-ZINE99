// A Journey Into the Heartstream, 1D game: The Carving (DESIGN.md section 11, `g1_carving`).
// Scrimshaw: scratched black lines on ivory bone. One carving cut from `s1_carve_gift`: a tool for
// your recipient, 24 strokes, three knots, a soft timer (a lamp burning down). Solo: you are the one
// who laughs, so you carve for the one who argues (the ring laughs -> argues -> dreams -> fears).
//
// Actions:
//   Cut           drag a straight stroke (with the grain 1, across it 2; a knot splits three times wide)
//   Rub the ink   (costs 1 stroke, once) rub soot into the bone: the hidden knots show as dark rings
//   Elder's tool  (three looks) the form as it should be, and the bone still to come away, for 2 s
//   Cut his mark  (3 strokes) trace his sign once at the grip end
// Knots are hidden until the ink is rubbed or a cut finds one; that is this mode's reading of
// "Knots (2–4 per blank)" with only the grain named as visible (DESIGN.md section 11).
//
// Lines shown, verbatim (DESIGN.md section 3, "What they shared"):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "They have grown up side by side, carved tools together, sung marrow‑songs together, dreamed of the world above the bone."
// "Carve for him." is the elders' line from DESIGN.md section 6; "Not that one." is the one who argues's.

import { howTo, Legend, Beats, flourish, disposeKit } from "./_kit.js";

const C = { ink: "#1a1410", ivory: "#f3e9d2", paper: "#efe3c8", slab: "#cdbb98", red: "#7A1020", gold: "#F2B544" };
const BW = 36, BH = 108;          // the blank, in mm (grain runs along its length)
const MAXLEN = BH / 3;            // a stroke is a drag of up to a third of the blank's length
const QUOTE = "They have grown up side by side, carved tools together, sung marrow‑songs together, dreamed of the world above the bone.";
const FORMS = {
  hook: { name: "Hook", effect: "Climb: one extra hold of reach. Heart: grip drains 1 less per beat.", rough: "Climb reach only",
    in: (x, y) => (Math.abs(x - 22) <= 7 && y >= 26 && y <= 104) || (() => { const d = Math.hypot(x - 14, y - 26); return d >= 2 && d <= 15 && (y <= 26 || x <= 10) && y <= 44; })() },
  awl: { name: "Awl", effect: "Chart: reveals every patrol at one junction per chart.", rough: "One branch per chart",
    in: (x, y) => y >= 8 && y <= 102 && Math.abs(x - 18) <= (y < 62 ? 3 + ((y - 8) / 54) * 5.5 : y < 70 ? 8.5 : 11) },
  comb: { name: "Comb", effect: "River: tendrils do not sting its holder.", rough: "Sting lasts 1 beat",
    in: (x, y) => x >= 5 && x <= 31 && ((y >= 64 && y <= 100) || (y >= 14 && y < 64 && ((x - 5) % 7.33) < 3.7)) },
  scraper: { name: "Scraper", effect: "River 3D: on-beat strokes count double against eddies.", rough: "×1.5",
    in: (x, y) => (y >= 12 && y <= 50 && Math.abs(x - 18) <= 14 - (y - 12) * 0.12) || (y > 50 && y <= 102 && Math.abs(x - 18) <= 6) },
  flute: { name: "Flute", effect: "Whole raft: after each calm, the good window widens by 10 ms for 30 s.", rough: "5 ms",
    in: (x, y) => y >= 6 && y <= 102 && Math.abs(x - 18) <= 7 },
};
const inBlank = (x, y) => { const rx = BW / 2, cy = Math.min(Math.max(y, rx), BH - rx); return Math.hypot((x - rx) / rx, (y - cy) / rx * 1.0) <= 1; };
// a small outline of each form for its button (drawn from its rule)
function formIcon(k) {
  let s = "";
  for (let y = 0; y < BH; y += 4) for (let x = 0; x < BW; x += 3) if (FORMS[k].in(x + 1.5, y + 2) && inBlank(x + 1.5, y + 2)) s += `<rect x="${x}" y="${y}" width="3" height="4"/>`;
  return `<svg viewBox="0 0 ${BW} ${BH}" width="13" height="38" aria-hidden="true"><g fill="currentColor">${s}</g></svg>`;
}

export default {
  mount(root, api) {
    const P = "heartstream-carving-";
    const rng = api.rng();
    const RM = api.reducedMotion;
    const listeners = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const timers = [];
    const STROKES = 24, TIME = 240, LOOKS = 3;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const css = document.createElement("style");
    const scratches = `repeating-linear-gradient(-45deg,rgba(26,20,16,.05) 0 1px,transparent 1px 7px)`;
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${C.paper};color:${C.ink};font-family:var(--g-display);display:grid;grid-template-columns:minmax(170px,1fr) minmax(240px,2.2fr) minmax(170px,1fr);gap:10px;padding:14px;box-sizing:border-box;background-image:${scratches}}
.${P}wrap *{box-sizing:border-box}
.${P}side{display:flex;flex-direction:column;gap:10px;border:1.5px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:-5px;padding:14px;background:rgba(243,233,210,.94);min-width:0}
.${P}h{font-size:13px;letter-spacing:.2em;text-transform:uppercase;margin:0;font-family:var(--g-body);font-weight:700}
.${P}mark{display:flex;align-items:center;gap:10px;font-style:italic;font-size:15px}
.${P}forms{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px}
.${P}forms button,.${P}btn{font:600 15px var(--g-display);color:${C.ink};background:${C.ivory};border:1.5px solid ${C.ink};padding:6px 8px;cursor:pointer;min-height:44px;display:flex;align-items:center;gap:6px;justify-content:center;transition:background .15s}
.${P}forms button:hover:not(:disabled),.${P}btn:hover:not(:disabled){background:#fff9ea;box-shadow:inset 0 0 0 1px ${C.ink}}
.${P}forms button[aria-pressed=true]{background:${C.ink};color:${C.ivory}}
.${P}forms button:disabled{opacity:.4;cursor:default}
.${P}btn:disabled{opacity:.4;cursor:default}
.${P}btn small{font-size:13px;opacity:.75;font-style:italic}
.${P}eff{font-size:15px;line-height:1.35;font-style:italic}
.${P}notches{font-family:var(--g-body);font-size:15px;display:flex;flex-wrap:wrap;gap:3px}
.${P}notches i{display:block;width:6px;height:18px;border:1.5px solid ${C.ink};border-radius:1px}
.${P}notches i.${P}on{background:${C.ink}}
.${P}notches i.${P}gone{opacity:.25}
.${P}notches i.${P}spend{animation:${P}nick .5s}
@keyframes ${P}nick{50%{background:${C.red};transform:scaleY(1.4)}}
.${P}stage{position:relative;min-height:320px;border:1.5px solid ${C.ink};background:#e4d6b8}
.${P}stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}
.${P}stage canvas:focus-visible{outline:3px solid ${C.red};outline-offset:-3px}
.${P}lamp{height:80px;display:flex;justify-content:center;align-items:center;gap:10px;font-size:14px;font-style:italic}
.${P}done{background:${C.ink}!important;color:${C.ivory}!important;font-size:18px!important;letter-spacing:.2em}
.${P}say{font-size:16px;font-style:italic;min-height:2.6em;line-height:1.3;border-left:2px solid ${C.red};padding-left:8px}
.${P}legend{list-style:none;margin:0;padding:0;font-size:14px;line-height:1.5;font-family:var(--g-body)}
.${P}legend b{font-family:var(--g-display);font-size:15px}
.${P}legend li.${P}new{animation:${P}hl 1.2s 2}
@keyframes ${P}hl{50%{background:rgba(122,16,32,.15)}}
.${P}beat{position:absolute;left:50%;top:12px;transform:translateX(-50%);width:min(92%,420px);padding:10px 14px;background:${C.ivory};border:1.5px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:3px;font-size:17px;line-height:1.35;font-style:italic;text-align:center;z-index:2}
.${P}beat b{display:block;font-style:normal;font-family:var(--g-body);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${C.red}}
.${P}beat.${P}in{animation:${P}fd .5s}
@keyframes ${P}fd{from{opacity:0}}
.${P}flash{animation:${P}fl .45s}
@keyframes ${P}fl{40%{box-shadow:inset 0 0 0 6px ${C.red}}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(239,227,200,.86);z-index:5;overflow:auto}
.${P}card{position:relative;max-width:560px;width:100%;background:${C.ivory};border:2px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:5px;padding:24px 26px 20px;background-image:repeating-linear-gradient(88deg,rgba(26,20,16,.06) 0 1px,transparent 1px 11px)}
.${P}card::before,.${P}card::after{content:"✦";position:absolute;font-size:16px;color:${C.red}}
.${P}card::before{left:8px;top:6px}.${P}card::after{right:8px;bottom:6px}
.${P}kick{font:700 12px var(--g-body);letter-spacing:.24em;text-transform:uppercase;color:${C.red}}
.${P}card h2{font-size:36px;margin:2px 0 6px;font-weight:500;border-bottom:1px solid ${C.ink};padding-bottom:4px}
.${P}q{font-style:italic;font-size:17px;line-height:1.4;margin:0 0 10px}
.${P}scene{margin:0 0 10px;font-size:16px;line-height:1.4}
.${P}goal{margin:0 0 10px;font-size:17px;line-height:1.4}
.${P}goal b{font-family:var(--g-body);font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${C.red};margin-right:6px}
.${P}keys{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:6px}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:0 10px;font-size:16px;align-items:baseline;border-top:1px dashed rgba(26,20,16,.35);padding-top:5px}
.${P}kv{font-weight:700}
.${P}kc{font-family:var(--g-body);font-size:14px}
.${P}kw{grid-column:2;font-size:15px;font-style:italic}
.${P}start{font:600 18px var(--g-display);letter-spacing:.2em;background:${C.ink};color:${C.ivory};border:0;padding:10px 26px;cursor:pointer}
@media (max-width:760px){.${P}wrap{grid-template-columns:1fr;grid-auto-rows:auto;padding:10px;gap:8px}.${P}stage{min-height:min(56vh,520px)}
  .${P}left{order:-2;padding:10px;gap:6px}.${P}stage{order:-1}.${P}mark,.${P}eff{display:none}.${P}lamp{height:56px}.${P}forms{grid-template-columns:repeat(5,1fr)}.${P}forms button{padding:4px 2px;font-size:14px;flex-direction:column;gap:0}.${P}forms button svg{height:22px}}
`;
    wrap.appendChild(css);
    const left = document.createElement("div"); left.className = P + "side " + P + "left";
    left.innerHTML = `<p class="${P}h">For</p><div class="${P}mark"><svg width="54" height="54" viewBox="-30 -30 60 60" aria-hidden="true"><circle r="22" fill="none" stroke="${C.ink}" stroke-width="2"/><path d="M-11,12 L0,-13 L11,12 M-6,2 L6,2" fill="none" stroke="${C.red}" stroke-width="3"/></svg><span>the one who argues<br>his mark</span></div>
<p class="${P}h">Form</p><div class="${P}forms"></div><div class="${P}eff">Pick a form for his tool.</div><p class="${P}h">Strokes <span class="${P}left-n"></span></p><div class="${P}notches" aria-hidden="true"></div>`;
    const stage = document.createElement("div"); stage.className = P + "stage";
    const cv = document.createElement("canvas"); cv.setAttribute("aria-label", "The bone blank. Drag to carve a stroke; with the keyboard, arrows move the chisel and Space sets each end."); cv.tabIndex = 0;
    stage.appendChild(cv);
    const right = document.createElement("div"); right.className = P + "side";
    right.innerHTML = `<p class="${P}h">The gift</p><div class="${P}say">Pick a form, then cut away what is not it.</div>
<ul class="${P}legend" aria-label="Actions"></ul>
<button type="button" class="${P}btn" data-a="ink" hidden>Rub the ink <small>1 stroke · I</small></button>
<button type="button" class="${P}btn" data-a="elder" hidden>The elder's old tool <small>3 looks · E</small></button>
<button type="button" class="${P}btn" data-a="mark" hidden>Cut his mark <small>3 strokes · M</small></button>
<div class="${P}lamp"><svg viewBox="0 0 60 90" height="100%" aria-hidden="true"><path class="${P}flame" d="M30,10 C22,28 24,40 30,46 C36,40 38,28 30,10Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/><rect class="${P}oil" x="14" y="56" width="32" height="20" fill="${C.red}" opacity=".5"/><path d="M8,52 h44 l-6,28 h-32z" fill="none" stroke="${C.ink}" stroke-width="2"/></svg><span class="${P}lampt">the lamp</span></div>
<button type="button" class="${P}btn ${P}done" data-a="done">DONE</button>`;
    wrap.append(left, stage, right);
    const beats = new Beats(P, stage, RM);
    const intro = howTo(P, {
      kicker: "Chapter two · the shedding gallery",
      title: "The Carving",
      quote: `“${QUOTE}”`,
      scene: "An elder sets a bone blank on the slab in front of you. “Carve for him.” The tool is for the one who argues; it will ride with him to the end.",
      goal: "Make his tool from the blank in 24 strokes, as close to its form as you can.",
      keys: [["Form", "click a form", "its faint outline lies over the blank"], ["Cut", "drag a straight line · arrows + Space", "with the grain costs 1, across it 2"]],
      extra: `<p style="margin:0 0 12px;font-size:15px;font-style:italic">Other tools lie on the slab; you will find them as you work.</p>`,
    });
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const g = cv.getContext("2d");
    const say = right.querySelector("." + P + "say"), eff = left.querySelector("." + P + "eff"), notches = left.querySelector("." + P + "notches");
    const oil = right.querySelector("." + P + "oil"), flame = right.querySelector("." + P + "flame"), lampt = right.querySelector("." + P + "lampt");
    const legendEl = right.querySelector("." + P + "legend");
    const legend = { items: new Set(), add(k, verb, ctl, fresh) { if (this.items.has(k)) return; this.items.add(k); const li = document.createElement("li"); li.innerHTML = `<b></b> <span></span>`; li.querySelector("b").textContent = verb; li.querySelector("span").textContent = ctl; legendEl.appendChild(li); if (fresh) flourish(li, P + "new", RM, 2400); }, has(k) { return this.items.has(k); } };
    const btn = (a) => right.querySelector(`[data-a="${a}"]`);

    // ---- the blank ------------------------------------------------------------------------------
    const RES = 2; // cells per mm
    const GW = BW * RES, GH = BH * RES;
    const mat = new Uint8Array(GW * GH);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) mat[j * GW + i] = inBlank((i + 0.5) / RES, (j + 0.5) / RES) ? 1 : 0;
    const knots = [];
    while (knots.length < 3) {
      const k = { x: 4 + rng() * (BW - 8), y: 14 + rng() * (BH - 40), r: 2.2, seen: false };
      if (knots.every((o) => Math.hypot(o.x - k.x, o.y - k.y) > 18)) knots.push(k);
    }
    const grain = Array.from({ length: 16 }, (_, i) => ({ x: (i + 0.5) * BW / 16 + (rng() - 0.5), ph: rng() * 6, k: 0.05 + rng() * 0.06 }));
    const st = { started: false, over: false, form: null, formMask: null, left: STROKES, cuts: [], marked: false, tracing: null, inked: false, looks: LOOKS,
      drag: null, cursor: { x: BW / 2, y: BH / 2 }, kbStart: null, elderT: 0, hintT: 0, idle: 0, time: TIME, splits: 0, across: 0, best: 0 };

    function setForm(key) {
      if (st.cuts.length || !st.started) return;
      st.form = key;
      st.formMask = new Uint8Array(GW * GH);
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) st.formMask[j * GW + i] = mat[j * GW + i] && FORMS[key].in((i + 0.5) / RES, (j + 0.5) / RES) ? 1 : 0;
      formsEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
      eff.textContent = `${FORMS[key].name}: ${FORMS[key].effect}`;
      say.textContent = `${/^[AEIOU]/.test(FORMS[key].name) ? "An" : "A"} ${FORMS[key].name.toLowerCase()}. Its outline lies over the blank: cut away the bone outside it.`;
      if (key === "flute") beats.show("“Not that one.” He says it of everything. You carve it anyway.", 3800, "argues", "The one who argues, watching");
      draw();
    }
    const formsEl = left.querySelector("." + P + "forms");
    for (const k of Object.keys(FORMS)) {
      const b = document.createElement("button"); b.type = "button"; b.dataset.k = k; b.innerHTML = `${formIcon(k)}<span>${FORMS[k].name}</span>`; b.setAttribute("aria-pressed", "false");
      on(b, "click", () => setForm(k)); formsEl.appendChild(b);
    }
    function quality() {
      if (!st.formMask) return 0;
      let inter = 0, uni = 0;
      for (let n = 0; n < mat.length; n++) { const a = mat[n], b = st.formMask[n]; if (a && b) inter++; if (a || b) uni++; }
      return uni ? inter / uni : 0;
    }
    function renderNotches(spent = 0) {
      let s = "";
      for (let i = 0; i < STROKES; i++) {
        const remaining = i < st.left, justSpent = !remaining && i < st.left + spent;
        s += `<i class="${remaining ? P + "on" : P + "gone"}${justSpent && !RM ? " " + P + "spend" : ""}"></i>`;
      }
      notches.innerHTML = s;
      left.querySelector("." + P + "left-n").textContent = `· ${Math.max(0, st.left)} left`;
    }

    // ---- geometry -------------------------------------------------------------------------------
    let scale = 4, ox = 0, oy = 0, W = 0, H = 0, dpr = 1;
    function layout() {
      const r = stage.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      scale = Math.min((H - 40) / BH, (W - 30) / BW); ox = (W - BW * scale) / 2; oy = (H - BH * scale) / 2 + 10; draw();
    }
    const ro = new ResizeObserver(layout); ro.observe(stage);
    const toMm = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / scale, y: (e.clientY - r.top - oy) / scale }; };
    function clampSeg(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      return L > MAXLEN ? { x: a.x + (dx / L) * MAXLEN, y: a.y + (dy / L) * MAXLEN } : b;
    }
    const segDist = (px, py, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / L2)); return Math.hypot(px - a.x - t * dx, py - a.y - t * dy); };
    const costOf = (a, b) => { const ang = Math.abs(Math.atan2(b.x - a.x, b.y - a.y) * 180 / Math.PI); const off = Math.min(ang, 180 - ang); return off <= 20 ? 1 : 2; };
    const knotsHit = (a, b) => knots.filter((k) => segDist(k.x, k.y, a, b) <= k.r);

    function unlockTools() {
      if (st.cuts.length === 2 && !st.inked) {
        btn("ink").hidden = false; legend.add("ink", "Rub the ink", "I · 1 stroke, once", true);
        beats.show("The bone is not all one grain: knots hide under the surface, and a cut through one splits wide. Rub soot into the bone and they show.", 5600, "ink", "Rub the ink");
      }
      if (st.cuts.length === 4) {
        btn("elder").hidden = false; legend.add("elder", "Elder's tool", "E · three looks", true);
        beats.show("The elder's own old tool lies at the edge of the slab, worn smooth. Look at it, and you see the form as it should be.", 5200, "elder", "On the slab");
      }
      if (st.cuts.length === 7) {
        btn("mark").hidden = false; legend.add("mark", "His mark", "M · 3 strokes, trace", true);
        beats.show("His sign could go into the grip. It costs three strokes, and he would know whose hand cut it.", 5200, "mark", "The grip end");
      }
    }

    function cut(a, b0) {
      const b = clampSeg(a, b0);
      if (Math.hypot(b.x - a.x, b.y - a.y) < 2) return;
      if (!st.form) { say.textContent = "Pick a form first."; flourish(formsEl, P + "flash", RM, 450); return; }
      const cost = costOf(a, b);
      if (cost > st.left) { say.textContent = "Not enough strokes for a cut across the grain."; return; }
      const hit = knotsHit(a, b), split = hit.length > 0, half = split ? 6 : 2;
      const q0 = quality();
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
        const n = j * GW + i; if (!mat[n]) continue;
        if (segDist((i + 0.5) / RES, (j + 0.5) / RES, a, b) <= half) mat[n] = 0;
      }
      hit.forEach((k) => { k.seen = true; });
      st.left -= cost; st.cuts.push({ a, b, half, split, t: performance.now() }); st.idle = 0;
      if (split) st.splits++; if (cost === 2) st.across++;
      formsEl.querySelectorAll("button").forEach((x) => { x.disabled = x.dataset.k !== st.form; });
      const q = Math.round(quality() * 100), dq = q - Math.round(q0 * 100);
      st.best = Math.max(st.best, q);
      say.textContent = split ? `A hidden knot split: the sliver came away three times as wide. Likeness ${q}%.`
        : `${cost === 2 ? "Across the grain: two strokes." : "With the grain."} Likeness ${q}% (${dq >= 0 ? "+" : ""}${dq}).`;
      if (split) flourish(stage, P + "flash", RM, 450);
      renderNotches(cost); unlockTools();
      if (q >= 60) beats.show(`It is beginning to look like ${/^[AEIOU]/.test(FORMS[st.form].name) ? "an" : "a"} ${FORMS[st.form].name.toLowerCase()}.`, 3200, "q60");
      if (q >= 80) beats.show("True. You could stop here, and he would have the whole of it.", 3800, "q80");
      draw();
      if (st.left <= 0) finish();
    }
    function traceMark(path) {
      const pts = markPts();
      const ok = pts.every((p) => path.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 3.5));
      st.tracing = null;
      if (!ok) { say.textContent = "Trace his sign through all three points at the grip end."; draw(); return; }
      st.marked = true; st.left -= 3; renderNotches(3);
      btn("mark").disabled = true;
      say.textContent = "His mark is cut into the grip.";
      beats.show("His mark, in your hand's line. Whatever else the tool is, it is his.", 3800, "marked");
      draw();
      if (st.left <= 0) finish();
    }
    const markPts = () => [{ x: BW / 2 - 4, y: BH - 6 }, { x: BW / 2, y: BH - 16 }, { x: BW / 2 + 4, y: BH - 6 }];
    function useInk() {
      if (st.inked || st.left < 1 || !st.form) { if (!st.form) say.textContent = "Pick a form first."; return; }
      st.inked = true; st.left -= 1; renderNotches(1); knots.forEach((k) => { k.seen = true; });
      btn("ink").disabled = true;
      say.textContent = `Soot in the scratches: ${knots.length} knots show as dark rings. Cut around them.`; draw();
      if (st.left <= 0) finish();
    }
    function useElder() {
      if (!st.form) { say.textContent = "Pick a form first."; return; }
      if (st.looks <= 0) return;
      st.looks--; st.elderT = 2200;
      btn("elder").querySelector("small").textContent = `${st.looks} look${st.looks === 1 ? "" : "s"} left · E`;
      if (!st.looks) btn("elder").disabled = true;
      say.textContent = "The elder's own old tool: the form as it should be, and the bone still to come away."; draw();
    }
    function startMark() {
      if (st.left < 3) { say.textContent = "Not enough strokes left for his mark."; return; }
      if (st.marked) return;
      st.tracing = true; say.textContent = "Trace his sign once, through the three points at the grip end."; draw();
    }

    // ---- input ----------------------------------------------------------------------------------
    on(cv, "pointerdown", (e) => {
      if (!st.started || st.over) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      const p = toMm(e);
      st.drag = { a: p, b: p, path: [p] };
      draw();
    });
    on(cv, "pointermove", (e) => {
      const p = toMm(e); st.cursor = p;
      if (!st.drag) { if (st.started) draw(); return; }
      st.drag.b = p; st.drag.path.push(p); draw();
    });
    const release = () => {
      if (!st.drag) return;
      const d = st.drag; st.drag = null;
      if (st.tracing) traceMark(d.path); else cut(d.a, d.b);
    };
    on(cv, "pointerup", release); on(cv, "pointercancel", () => { st.drag = null; draw(); });
    on(cv, "keydown", (e) => {
      if (!st.started || st.over) return;
      const step = e.shiftKey ? 5 : 1.5, c = st.cursor;
      if (e.key === "ArrowLeft") c.x -= step; else if (e.key === "ArrowRight") c.x += step;
      else if (e.key === "ArrowUp") c.y -= step; else if (e.key === "ArrowDown") c.y += step;
      else if (e.key === " " || e.key === "Enter") {
        if (!st.kbStart) st.kbStart = { ...c };
        else { const a = st.kbStart; st.kbStart = null; if (st.tracing) traceMark([a, { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }, { ...c }, ...markPts()]); else cut(a, { ...c }); }
      } else if (e.key === "Escape") st.kbStart = null;
      else return;
      e.preventDefault();
      c.x = Math.max(-2, Math.min(BW + 2, c.x)); c.y = Math.max(-2, Math.min(BH + 2, c.y));
      draw();
    });
    on(wrap, "keydown", (e) => {
      if (!st.started || st.over || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (k === "i" && !btn("ink").hidden) useInk();
      else if (k === "e" && !btn("elder").hidden) useElder();
      else if (k === "m" && !btn("mark").hidden && !st.marked) startMark();
      else if (/^[1-5]$/.test(k)) setForm(Object.keys(FORMS)[+k - 1]);
    });
    on(right, "click", (e) => {
      const a = e.target.closest("button"); if (!a || !st.started || st.over) return;
      if (a.dataset.a === "ink") useInk();
      if (a.dataset.a === "elder") useElder();
      if (a.dataset.a === "mark") startMark();
      if (a.dataset.a === "done") finish();
    });
    on(intro.querySelector("." + P + "start"), "click", () => {
      intro.remove(); st.started = true; last = performance.now();
      legend.add("cut", "Cut", "drag · arrows + Space");
      beats.show("“Carve for him.”", 2600, "elder0", "The elder");
      formsEl.querySelector("button").focus();
    });

    // ---- the lamp (soft timer) and the idle hint ------------------------------------------------
    let last = performance.now();
    timers.push(setInterval(() => {
      if (!st.started || st.over) return;
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      st.time -= dt; st.idle += dt;
      const f = Math.max(0, st.time / TIME);
      oil.setAttribute("height", String(20 * f)); oil.setAttribute("y", String(56 + 20 * (1 - f)));
      flame.setAttribute("transform", `translate(30 46) scale(${0.4 + 0.6 * f}) translate(-30 -46)`);
      lampt.textContent = f > 0.5 ? "the lamp" : f > 0.2 ? "the lamp is low" : "the lamp gutters";
      if (f < 0.5) beats.show("The lamp is half burned. The others are already polishing.", 3600, "half");
      if (f < 0.15) beats.show("The lamp gutters. Finish what you can.", 3200, "gutter");
      if (st.elderT > 0) { st.elderT -= dt * 1000; if (st.elderT <= 0) draw(); }
      if (st.idle > 60 && st.form && st.hintT <= 0) { st.hintT = 3000; st.idle = 0; say.textContent = "The bone still to come away glows faintly."; draw(); }
      if (st.hintT > 0) { st.hintT -= dt * 1000; if (st.hintT <= 0) draw(); }
      if (st.time <= 0) { say.textContent = "The lamp is out."; finish(); }
    }, 200));

    function finish() {
      if (st.over) return;
      if (!st.form) { say.textContent = "Pick a form first."; flourish(formsEl, P + "flash", RM, 450); if (st.time > 0) return; setForm("flute"); }
      st.over = true; draw();
      const q = Math.round(quality() * 100), F = FORMS[st.form];
      const word = q >= 80 ? "true" : q >= 60 ? "rough" : "keepsake";
      const used = STROKES - st.left;
      const how = st.splits ? ` ${st.splits === 1 ? "A knot split" : st.splits + " knots split"} under the chisel.` : st.inked ? " The ink kept you clear of the knots." : "";
      const what = word === "true" ? `He will feel it in his hand. ${F.effect}`
        : word === "rough" ? `Rough, but it will serve: ${F.rough.charAt(0).toLowerCase() + F.rough.slice(1)}.`
        : "It will do nothing on the river. It rides with him to the last frame all the same.";
      api.end({ outcome: word === "true" ? "win" : "done",
        text: `${/^[AEIOU]/.test(F.name) ? "An" : "A"} ${F.name.toLowerCase()} for the one who argues, ${word} (${q}% likeness), in ${used} stroke${used === 1 ? "" : "s"}${st.marked ? ", his mark cut in the grip" : ""}.${how} ${what}` });
    }

    // ---- drawing (scrimshaw) --------------------------------------------------------------------
    function draw() {
      if (!W) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#e4d6b8"; g.fillRect(0, 0, W, H);
      g.strokeStyle = "rgba(26,20,16,.12)"; g.lineWidth = 1; g.beginPath();
      for (let x = -H; x < W; x += 9) { g.moveTo(x, H); g.lineTo(x + H, 0); } g.stroke();
      g.save(); g.translate(ox, oy); g.scale(scale, scale);
      const cs = 1 / RES;
      g.fillStyle = C.ivory;
      for (let j = 0; j < GH; j++) { let run = -1; for (let i = 0; i <= GW; i++) { const v = i < GW && mat[j * GW + i]; if (v && run < 0) run = i; if (!v && run >= 0) { g.fillRect(run * cs, j * cs, (i - run) * cs + 0.02, cs + 0.02); run = -1; } } }
      g.save();
      g.beginPath();
      for (let j = 0; j < GH; j++) { let run = -1; for (let i = 0; i <= GW; i++) { const v = i < GW && mat[j * GW + i]; if (v && run < 0) run = i; if (!v && run >= 0) { g.rect(run * cs, j * cs, (i - run) * cs + 0.02, cs + 0.02); run = -1; } } }
      g.clip();
      if (st.inked) { g.fillStyle = "rgba(26,20,16,.08)"; g.fillRect(0, 0, BW, BH); }
      g.strokeStyle = C.ink; g.lineWidth = 0.18; g.globalAlpha = st.inked ? 0.8 : 0.55;
      for (const l of grain) { g.beginPath(); for (let y = 0; y <= BH; y += 2) { const x = l.x + Math.sin(y * l.k + l.ph) * 0.9; y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.globalAlpha = 1;
      for (const k of knots) {
        if (!k.seen) continue;
        for (let r = 0.6; r <= k.r + 1.6; r += 0.7) { g.beginPath(); g.ellipse(k.x, k.y, r * 0.8, r * 1.3, 0, 0, 7); g.lineWidth = 0.26; g.stroke(); }
      }
      if ((st.hintT > 0 || st.elderT > 0) && st.formMask) {
        g.fillStyle = st.elderT > 0 ? "rgba(122,16,32,.3)" : "rgba(122,16,32,.22)";
        for (let n = 0; n < mat.length; n++) if (mat[n] && !st.formMask[n]) g.fillRect((n % GW) * cs, Math.floor(n / GW) * cs, cs, cs);
      }
      g.restore();
      g.strokeStyle = C.ink; g.lineWidth = 0.35; g.globalAlpha = 0.35;
      g.beginPath(); g.moveTo(0, BW / 2); g.arc(BW / 2, BW / 2, BW / 2, Math.PI, 0); g.lineTo(BW, BH - BW / 2); g.arc(BW / 2, BH - BW / 2, BW / 2, 0, Math.PI); g.closePath(); g.stroke();
      g.globalAlpha = 1;
      // the cuts: two scratched edges per sliver; the newest flashes red a moment
      const now = performance.now();
      for (const c of st.cuts) {
        const dx = c.b.x - c.a.x, dy = c.b.y - c.a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * c.half, ny = dx / L * c.half;
        const fresh = !RM && now - c.t < 600;
        g.strokeStyle = fresh || c.split ? C.red : C.ink; g.lineWidth = fresh ? 0.5 : 0.3;
        g.beginPath(); g.moveTo(c.a.x + nx, c.a.y + ny); g.lineTo(c.b.x + nx, c.b.y + ny); g.moveTo(c.a.x - nx, c.a.y - ny); g.lineTo(c.b.x - nx, c.b.y - ny); g.stroke();
      }
      if (st.formMask) {
        g.strokeStyle = st.elderT > 0 ? C.red : C.ink; g.lineWidth = st.elderT > 0 ? 0.6 : 0.3; g.globalAlpha = st.elderT > 0 ? 1 : 0.6;
        g.setLineDash(st.elderT > 0 ? [] : [0.8, 0.8]); g.beginPath();
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
          const v = st.formMask[j * GW + i]; if (!v) continue;
          if (i + 1 >= GW || !st.formMask[j * GW + i + 1]) { g.moveTo((i + 1) * cs, j * cs); g.lineTo((i + 1) * cs, (j + 1) * cs); }
          if (i === 0 || !st.formMask[j * GW + i - 1]) { g.moveTo(i * cs, j * cs); g.lineTo(i * cs, (j + 1) * cs); }
          if (j + 1 >= GH || !st.formMask[(j + 1) * GW + i]) { g.moveTo(i * cs, (j + 1) * cs); g.lineTo((i + 1) * cs, (j + 1) * cs); }
          if (j === 0 || !st.formMask[(j - 1) * GW + i]) { g.moveTo(i * cs, j * cs); g.lineTo((i + 1) * cs, j * cs); }
        }
        g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
      }
      const mp = markPts();
      if (st.tracing || st.marked) {
        g.strokeStyle = st.marked ? C.red : C.ink; g.lineWidth = st.marked ? 0.7 : 0.35; g.setLineDash(st.marked ? [] : [0.8, 0.8]);
        g.beginPath(); g.moveTo(mp[0].x, mp[0].y); g.lineTo(mp[1].x, mp[1].y); g.lineTo(mp[2].x, mp[2].y); g.moveTo(mp[0].x + 1.4, mp[0].y - 4); g.lineTo(mp[2].x - 1.4, mp[2].y - 4); g.stroke(); g.setLineDash([]);
        if (st.tracing) for (const p of mp) { g.beginPath(); g.arc(p.x, p.y, 1.2, 0, 7); g.fillStyle = C.red; g.fill(); }
      }
      const a = st.drag ? st.drag.a : st.kbStart, b0 = st.drag ? st.drag.b : st.kbStart ? st.cursor : null;
      let tag = null;
      if (a && b0 && !st.tracing) {
        const b = clampSeg(a, b0), cost = costOf(a, b), known = knotsHit(a, b).some((k) => k.seen);
        g.strokeStyle = known ? C.red : C.ink; g.lineWidth = 0.5; g.setLineDash([1.2, 0.8]);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.setLineDash([]);
        tag = { x: ox + b.x * scale, y: oy + b.y * scale, text: `${cost === 1 ? "with the grain · 1" : "across · 2"}${known ? " · knot!" : ""}${cost > st.left ? " · not enough" : ""}`, warn: known || cost === 2 };
      } else if (st.tracing && st.drag) {
        g.strokeStyle = C.red; g.lineWidth = 0.4; g.beginPath(); st.drag.path.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
      }
      if (document.activeElement === cv || st.kbStart) { const c = st.cursor; g.strokeStyle = C.red; g.lineWidth = 0.3; g.beginPath(); g.moveTo(c.x - 2, c.y); g.lineTo(c.x + 2, c.y); g.moveTo(c.x, c.y - 2); g.lineTo(c.x, c.y + 2); g.stroke(); }
      g.restore();
      // labels in screen pixels, so they stay legible at any size
      if (tag) {
        g.font = "italic 15px Georgia"; g.textAlign = "left";
        const tw = g.measureText(tag.text).width + 12, tx = Math.min(W - tw - 4, tag.x + 10), ty = Math.max(20, tag.y - 10);
        g.fillStyle = "rgba(243,233,210,.95)"; g.fillRect(tx, ty - 16, tw, 22); g.strokeStyle = tag.warn ? C.red : C.ink; g.lineWidth = 1; g.strokeRect(tx, ty - 16, tw, 22);
        g.fillStyle = tag.warn ? C.red : C.ink; g.fillText(tag.text, tx + 6, ty);
      }
      const q = Math.round(quality() * 100);
      g.font = "italic 16px Georgia"; g.textAlign = "left";
      const label = st.form ? `likeness ${q}%  ·  true at 80` : "pick a form";
      const lw = g.measureText(label).width + 16;
      g.fillStyle = "rgba(243,233,210,.92)"; g.fillRect(8, 8, lw, 26); g.fillStyle = q >= 80 ? C.red : C.ink; g.fillText(label, 16, 27);
      if (st.form) { g.fillStyle = "rgba(26,20,16,.2)"; g.fillRect(8, 36, lw, 5); g.fillStyle = q >= 80 ? C.red : C.ink; g.fillRect(8, 36, lw * q / 100, 5); g.fillStyle = C.red; g.fillRect(8 + lw * 0.8 - 1, 33, 2, 11); }
    }
    renderNotches(); layout();

    return {
      unmount() {
        timers.forEach(clearInterval); ro.disconnect();
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        wrap.remove();
      },
    };
  },
};

// Dr. Tox: Rise / The Cage (1D, titration). Graphic style: Comic colourist's flats: flat unshaded fills
// to a heavy line, amber against green, never at equal weight (docs/graphic_styles.json).
//
// DESIGN.md section 11, "The Cage": a green front (immune pressure, an indicator colour in the flask, never
// his body) rises in the flask; each drop of A9 pushes it down under an amber band. Hold the front in the
// ENDPOINT window for three seconds and cap. Steady: on the endpoint (4 doses). Leaky: short (4 doses, Pulse
// floor +10 next chapter). Hot: past it (3 doses). Every batch is used. Writes `amber` (0 to 6) and
// `amber_quality` to the game's shared store.
//
// Three batches, the design's three appearances: s1_cage_1 (2217, the bench, slow front, wide window),
// s1_cage_2 (a larger flask to carry outside, faster front with a wobble, narrower window), s1_cage_3 (his own
// lab: two flasks, surges alternating between them, two lead shield plates, the narrowest window).
// A9, its drops and every number here are invented and describe no real substance, procedure, dose or route.
//
// Art (games/dr-tox-rise/art/ASSET_MAP.md, "The Cage"): cage-* plus hud-amber, hud-amber-empty and
// hud-margin-calm. Every piece has a drawn fallback when api.art does not have it.

const P = "cg-";
const C = { ink: "#141414", amber: "#D99A2B", gold: "#F2C14E", green: "#7FD957", greenHot: "#C8FF8A", glass: "#dce8e6",
  cream: "#f3eedf", teal: "#a9bdbc", grey: "#5E7375", grey2: "#8A9A99", white: "#E9ECEA", bg: "#101414" };
const QUOTE = "It is not a power source. It is a cage, and he built it himself, and he is the only person who can make more of it.";
const CITE = "Part VI, Dr. Tox §2";
const HOLD = 3;                 // seconds the colour must hold in the window
const STREAM = 0.22;            // seconds between drops while the drip is held
const DOSES = { steady: 4, leaky: 4, hot: 3 };

// The three appearances. Units are invented: f is the front's height as a fraction of the liquid.
const BATCHES = [
  { id: "s1_cage_1", name: "First batch", caption: "2217", where: "The bench he built in the hospital room. He is fifteen.",
    backdrop: "cage-bench-2217", flask: "std", flasks: 1, v: 0.010, wob: 0, drop: 0.032, win: [0.18, 0.34],
    surge: [9, 13], surgeAmt: 0.07, start: 0.52, plates: 0, syringe: true },
  { id: "s1_cage_2", name: "A batch to carry outside", caption: "2226", where: "The same bench, the morning the door unlocks. A larger flask, and a front that will not sit still.",
    backdrop: "cage-bench-2217", flask: "large", flasks: 1, v: 0.016, wob: 0.025, drop: 0.030, win: [0.21, 0.32],
    surge: [7, 10], surgeAmt: 0.08, start: 0.55, plates: 0 },
  { id: "s1_cage_3", name: "His own lab", caption: "Snakehead", where: "His own bench under the amber lamp. Two flasks at once, and two lead plates.",
    backdrop: "cage-lab", flask: "std", flasks: 2, v: 0.018, wob: 0.015, drop: 0.030, win: [0.23, 0.31],
    surge: [5, 7], surgeAmt: 0.08, start: 0.5, plates: 2 },
];

// Flask geometry in the art's own coordinates (cage-flask 320x400, cage-flask-large 420x460).
const FLASKS = {
  std: { id: "cage-flask", w: 320, h: 400, surface: 178, bottom: 383,
    path: [[126.4, 26], [193.6, 26], [193.6, 162.8], [300, 357.2], [292, 386], [28, 386], [20, 357.2], [126.4, 162.8]] },
  large: { id: "cage-flask-large", w: 420, h: 460, surface: 202, bottom: 443,
    path: [[164.4, 26], [255.6, 26], [255.6, 185.6], [400, 412.4], [392, 446], [28, 446], [20, 412.4], [164.4, 185.6]] },
};
// The side bar art's bands (cage-side-bar 180x560): LEAKY 20-260, ENDPOINT 260-370, HOT 370-434, blank below.
const BAR = { w: 180, h: 560, top: 20, endHi: 260, endLo: 370, hotLo: 434, bottom: 536 };

const CSS = `
.${P}root{position:absolute;inset:0;display:flex;flex-direction:column;background:${C.bg};color:${C.ink};font-family:var(--g-body,system-ui,sans-serif);overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.${P}top{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:8px 16px;background:${C.cream};border-bottom:4px solid ${C.ink};position:relative;z-index:2}
.${P}counter{position:relative;width:150px;height:59px;flex:none}
.${P}counter img,.${P}counter .${P}cfb{position:absolute;inset:0;width:100%;height:100%}
.${P}cfb{background:${C.cream};border:3px solid ${C.ink};border-radius:8px;box-sizing:border-box;font:700 10px var(--g-body,sans-serif);letter-spacing:.2em;padding:3px 10px}
.${P}num{position:absolute;left:15.4%;top:51%;width:55%;height:32%;display:flex;align-items:center;justify-content:center;font:700 19px/1 var(--g-mono,'IBM Plex Mono',ui-monospace,monospace);color:${C.gold};letter-spacing:.12em}
.${P}cap{flex:1 1 auto;display:flex;align-items:center;gap:10px;min-width:0}
.${P}date{background:${C.cream};border:3px solid ${C.ink};padding:3px 10px;font:700 15px/1.1 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.06em;white-space:nowrap;box-shadow:3px 3px 0 ${C.ink}}
.${P}where{font-size:13px;line-height:1.3;color:#3a3a36;min-width:0}
.${P}amber{display:flex;align-items:center;gap:3px;flex:none}
.${P}amber span{font:700 11px var(--g-body,sans-serif);letter-spacing:.16em;margin-right:4px}
.${P}amber img,.${P}amber i{width:26px;height:26px;display:block}
.${P}amber i{border-radius:50%;border:3px solid ${C.ink};box-sizing:border-box;background:${C.cream}}
.${P}amber i.${P}on{background:${C.amber}}
.${P}scene{position:relative;flex:1 1 auto;min-height:0}
.${P}scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:pointer}
.${P}status{position:absolute;left:50%;top:10px;transform:translateX(-50%);max-width:min(92%,560px);background:${C.cream};border:3px solid ${C.ink};box-shadow:3px 3px 0 ${C.ink};padding:5px 12px;font:600 14px/1.3 var(--g-body,sans-serif);text-align:center;pointer-events:none}
.${P}status.${P}warn{background:${C.green}}
.${P}status.${P}ok{background:${C.gold}}
.${P}ctl{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:10px 16px 12px;background:${C.cream};border-top:4px solid ${C.ink};position:relative;z-index:2}
.${P}ctl button{font:700 16px var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.08em;text-transform:uppercase;color:${C.ink};border:4px solid ${C.ink};border-radius:10px;padding:10px 20px;min-height:52px;min-width:120px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink};touch-action:none}
.${P}ctl button:active,.${P}ctl button.${P}held{transform:translate(3px,3px);box-shadow:1px 1px 0 ${C.ink}}
.${P}ctl button:focus-visible{outline:3px solid ${C.green};outline-offset:3px}
.${P}drip{background:${C.amber}}
.${P}capb{background:#9aa6a6}
.${P}capb.${P}ready{background:${C.gold}}
.${P}ctl button:disabled{opacity:.45;cursor:default}
.${P}plate{min-width:0!important;padding:4px 10px!important;background:#c4cdcb;display:flex;align-items:center;gap:6px}
.${P}plate img{height:38px;width:auto;pointer-events:none}
.${P}plate.${P}used{display:none}
.${P}ghost{position:absolute;z-index:9;pointer-events:none;height:90px;width:auto;transform:translate(-50%,-50%)}
.${P}intro{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:16px;box-sizing:border-box;overflow:auto;background:rgba(16,20,20,.78)}
.${P}card{max-width:600px;width:100%;margin:auto 0;background:${C.cream};color:${C.ink};border:5px solid ${C.ink};box-shadow:8px 8px 0 ${C.ink};padding:16px 18px 18px;box-sizing:border-box}
.${P}kick{font:700 11px var(--g-body,sans-serif);letter-spacing:.2em;text-transform:uppercase;color:#8a5a10}
.${P}card h2{margin:4px 0 8px;font:700 34px/1 var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.02em;text-transform:uppercase}
.${P}card blockquote{margin:0 0 10px;padding:8px 12px;background:${C.amber};border:3px solid ${C.ink};font:italic 15px/1.35 var(--g-body,serif)}
.${P}card blockquote cite{display:block;font:600 11px var(--g-body,sans-serif);letter-spacing:.08em;margin-top:4px;font-style:normal}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.4}
.${P}card ul{margin:0 0 10px;padding:0;list-style:none;display:grid;gap:5px}
.${P}card li{font-size:14px;line-height:1.35}
.${P}card li b{display:inline-block;min-width:62px;background:${C.ink};color:${C.cream};padding:1px 6px;margin-right:6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.${P}note{font-size:12px!important;color:#55554f}
.${P}batches{display:grid;gap:8px;margin-top:12px}
.${P}batches button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;font:inherit;color:${C.ink};background:#e9e2cb;border:4px solid ${C.ink};border-radius:10px;padding:8px 12px;cursor:pointer;box-shadow:4px 4px 0 ${C.ink}}
.${P}batches button b{font:700 17px var(--g-display,'Oswald',Impact,sans-serif);letter-spacing:.04em;text-transform:uppercase}
.${P}batches button span{font-size:13px;color:#4a4a44}
.${P}batches button.${P}next{background:${C.gold}}
.${P}batches button:disabled{opacity:.45;cursor:default;box-shadow:none}
.${P}batches button:focus-visible{outline:3px solid ${C.green};outline-offset:3px}
.${P}result{position:absolute;inset:0;z-index:12;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;padding:16px 16px 150px;box-sizing:border-box;background:rgba(16,20,20,.84);overflow:hidden}
.${P}result img.${P}rc{width:clamp(150px,24vh,260px);height:auto;border:4px solid ${C.ink};box-shadow:6px 6px 0 ${C.ink};min-height:0}
.${P}result img.${P}sy{width:clamp(200px,40vw,420px);height:auto}
.${P}result .${P}fb{width:200px;height:260px;border:5px solid ${C.ink};background:${C.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 30px var(--g-display,Impact,sans-serif);letter-spacing:.08em}
.${P}result .${P}fb small{font-size:18px;color:#8a5a10}
.${P}result p{margin:0;max-width:560px;text-align:center;color:${C.white};font-size:14px;line-height:1.35}
@media (max-width:560px){
 .${P}top{padding:6px 16px;gap:6px 8px}
 .${P}counter{width:120px;height:47px}
 .${P}num{font-size:15px}
 .${P}where{display:none}
 .${P}amber img,.${P}amber i{width:22px;height:22px}
 .${P}amber span{display:none}
 .${P}ctl{gap:8px;padding:8px 16px 10px}
 .${P}ctl button{min-width:96px;padding:8px 12px;font-size:15px}
 .${P}status{font-size:13px;top:6px}
 .${P}card h2{font-size:28px}
}
@media (prefers-reduced-motion:reduce){.${P}ctl button:active,.${P}ctl button.${P}held{transform:none}}
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const rng = api.rng ? api.rng() : Math.random;
    const has = (id) => { try { return !!(api.art && api.art.has(id)); } catch { return false; } };
    const url = (id) => (has(id) ? api.art.url(id) : "");
    const sget = (k, d) => { try { const v = api.shared.get(k, d); return v == null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { api.shared.set(k, v); } catch { /* storage off */ } };
    const mget = (k, d) => { try { const v = api.store.get(k, d); return v == null ? d : v; } catch { return d; } };
    const mset = (k, v) => { try { api.store.set(k, v); } catch { /* storage off */ } };

    // ---- disposables -------------------------------------------------------------------------
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    let raf = 0, alive = true, ro = null;

    // ---- DOM ------------------------------------------------------------------------------------
    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = P + "root";
    wrap.innerHTML = `
<div class="${P}top">
  <div class="${P}counter" aria-label="Drops">${has("cage-counter") ? `<img alt="" src="${url("cage-counter")}" draggable="false">` : `<div class="${P}cfb">DROPS</div>`}<div class="${P}num" aria-live="off">000</div></div>
  <div class="${P}cap"><div class="${P}date"></div><div class="${P}where"></div></div>
  <div class="${P}amber" aria-label="Amber on hand"><span>AMBER</span></div>
</div>
<div class="${P}scene"><canvas aria-label="The flask and the side bar. Hold to drip." role="img"></canvas><div class="${P}status" aria-live="polite"></div></div>
<div class="${P}ctl">
  <button type="button" class="${P}drip" aria-label="Drip A9 (hold to stream)">Drip</button>
  <button type="button" class="${P}capb" aria-label="Cap the flask">Cap</button>
</div>`;
    root.append(style, wrap);
    const $ = (s) => wrap.querySelector(s);
    const numEl = $("." + P + "num"), dateEl = $("." + P + "date"), whereEl = $("." + P + "where");
    const amberEl = $("." + P + "amber"), statusEl = $("." + P + "status"), scene = $("." + P + "scene");
    const canvas = scene.querySelector("canvas"), g = canvas.getContext("2d");
    const dripBtn = $("." + P + "drip"), capBtn = $("." + P + "capb"), ctl = $("." + P + "ctl");

    function drawAmber(n) {
      amberEl.querySelectorAll("img,i").forEach((x) => x.remove());
      for (let i = 0; i < 6; i++) {
        const id = i < n ? "hud-amber" : "hud-amber-empty";
        let el;
        if (has(id)) { el = document.createElement("img"); el.src = url(id); el.alt = ""; el.draggable = false; }
        else { el = document.createElement("i"); if (i < n) el.className = P + "on"; }
        amberEl.appendChild(el);
      }
      amberEl.setAttribute("aria-label", `Amber on hand: ${n} of 6`);
    }
    drawAmber(clamp(sget("amber", 0) | 0, 0, 6));

    // ---- art, baked to canvases at the size drawn -------------------------------------------------
    const imgs = {};
    const want = ["cage-bench-2217", "cage-lab", "cage-flask", "cage-flask-large", "cage-dropper", "cage-side-bar", "cage-drop", "cage-shield-plate", "cage-cap", "hud-margin-calm"];
    want.forEach((id) => { if (has(id)) api.art.img(id).then((im) => { if (alive && im) { imgs[id] = im; layout(); } }).catch(() => {}); });
    const baked = {};
    function bake(id, w, h, sx, sy, sw, sh, fit) {
      const im = imgs[id];
      if (!im) return null;
      w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
      const key = `${id}|${w}|${h}|${sx}|${sy}|${fit || ""}`;
      if (baked[key]) return baked[key];
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const x = c.getContext("2d");
      try {
        if (sw) x.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
        else if (fit === "cover") {
          const info = api.art.info(id), s = Math.max(w / info.w, h / info.h);
          x.drawImage(im, (w - info.w * s) / 2, (h - info.h * s) / 2, info.w * s, info.h * s);
        } else x.drawImage(im, 0, 0, w, h);
      } catch { return null; }
      return (baked[key] = c);
    }

    // ---- state ------------------------------------------------------------------------------------
    let B = null;               // the batch's parameters
    let flasks = [];            // { f, surgeAt, hint, surgeLeft, plate, ripple, x, ... }
    let sel = 0;                // the flask under the dropper
    let dropperX = 0;           // drawn x of the dropper (eases toward the selected flask)
    let drops = [];             // falling drops { fi, y, vy }
    let count = 0, held = 0, t = 0, phase = "intro", dripping = false, nextDrip = 0, platesLeft = 0;
    let beat = 0;               // tutorial beat already shown
    let lastFrameMs = [];
    const dpr = () => Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, L = null;  // css size and layout

    function level(fl) { return fl.f + (B.wob ? B.wob * Math.sin(t * 2 * Math.PI / 3.1 + fl.phase) : 0); }
    function zone(f) { return f > B.win[1] ? "leaky" : f < B.win[0] ? "hot" : "end"; }
    const hotFloor = () => Math.max(0.02, B.win[0] - 0.08);

    function layout() {
      const r = scene.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      const d = dpr();
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
      if (!B) return;
      const F = FLASKS[B.flask];
      const margin = 16;
      // the side bar on the right
      let barH = H * 0.8, barW = barH * BAR.w / BAR.h;
      if (barW > W * 0.2) { barW = W * 0.2; barH = barW * BAR.h / BAR.w; }
      const barX = W - margin - barW, barY = (H - barH) / 2 + 6;
      // flasks: the area left of the bar
      const areaW = barX - margin * 2, n = B.flasks;
      const bench = H - Math.max(26, H * 0.06);
      let fh = H * 0.5, fw = fh * F.w / F.h;
      const maxW = (areaW - (n - 1) * 18) / n * 0.92;
      if (fw > maxW) { fw = maxW; fh = fw * F.h / F.w; }
      const s = fh / F.h;
      const xs = [];
      for (let i = 0; i < n; i++) xs.push(margin + areaW * (i + 0.5) / n - fw / 2 + margin * 0.5);
      const top = bench - fh;
      // the dropper hangs from the top: the tube, stopcock and tip of cage-dropper (x 96 to 204, y 0 to 424)
      const gap = Math.max(24, H * 0.08);
      const dh = Math.max(60, top - gap), ds = dh / 424, dw = 108 * ds;
      L = { s, fw, fh, xs, top, bench, barX, barY, barW, barH, dh, dw, ds, mouthY: top + F.path[0][1] * s };
      dropperX = xs[sel] + fw / 2;
    }

    // ---- input ------------------------------------------------------------------------------------
    function status(text, kind = "") { statusEl.textContent = text; statusEl.className = P + "status" + (kind ? " " + P + kind : ""); statusEl.hidden = !text; }
    function drip() {
      if (phase !== "play") return;
      count++;
      numEl.textContent = String(count).padStart(3, "0");
      const fl = flasks[sel];
      if (RM || !L) applyDrop(sel);
      else drops.push({ fi: sel, y: L.dh + 4, vy: 120 });
      if (beat === 0) { beat = 1; status(B.flasks > 1 ? "Watch both pointers on the side bar." : "Watch the pointer on the side bar. Bring it into ENDPOINT."); }
      void fl;
    }
    function applyDrop(fi) {
      const fl = flasks[fi];
      if (!fl) return;
      fl.f = Math.max(0, fl.f - B.drop);
      fl.ripple = RM ? 0 : 1;
      fl.spread = Math.min(1, fl.spread + 0.25);
    }
    function startDrip() { if (phase !== "play" || dripping) return; dripping = true; dripBtn.classList.add(P + "held"); drip(); nextDrip = t + STREAM * 1.6; }
    function stopDrip() { dripping = false; dripBtn.classList.remove(P + "held"); }
    function select(i) { if (B && i >= 0 && i < B.flasks && i !== sel) { sel = i; stopDrip(); } }

    on(dripBtn, "pointerdown", (e) => { e.preventDefault(); try { dripBtn.setPointerCapture(e.pointerId); } catch { /* ok */ } startDrip(); });
    on(dripBtn, "pointerup", stopDrip);
    on(dripBtn, "pointercancel", stopDrip);
    on(dripBtn, "lostpointercapture", stopDrip);
    on(dripBtn, "keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (!e.repeat) drip(); } });
    on(capBtn, "click", () => cap(false));
    on(canvas, "pointerdown", (e) => {
      if (phase !== "play" || !L) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch { /* ok */ }
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left;
      if (B.flasks > 1) {
        let best = 0, bd = Infinity;
        L.xs.forEach((fx, i) => { const dd = Math.abs(fx + L.fw / 2 - x); if (dd < bd) { bd = dd; best = i; } });
        select(best);
      }
      startDrip();
    });
    on(canvas, "pointerup", stopDrip);
    on(canvas, "pointercancel", stopDrip);
    on(canvas, "lostpointercapture", stopDrip);
    on(window, "keydown", (e) => {
      if (phase !== "play") return;
      if (e.target && e.target.closest && (e.target.closest(".ending") || e.target.closest("." + P + "plate"))) return;
      const k = e.key;
      if (k === " " || k === "ArrowDown" || k === "d" || k === "D") { e.preventDefault(); if (!e.repeat) startDrip(); }
      else if (k === "c" || k === "C") { e.preventDefault(); cap(false); }
      else if (k === "ArrowLeft" || k === "1") { e.preventDefault(); select(0); }
      else if (k === "ArrowRight" || k === "2") { e.preventDefault(); select(1); }
      else if ((k === "s" || k === "S") && platesLeft) { e.preventDefault(); placePlate(sel); }
    }, true);
    on(window, "keyup", (e) => { if (e.key === " " || e.key === "ArrowDown" || e.key === "d" || e.key === "D") stopDrip(); }, true);
    on(window, "blur", stopDrip);

    // Shield plates (third batch): drag one onto a flask, or tap it to place it beside the flask under the dropper.
    const plateBtns = [];
    function placePlate(i) {
      const fl = flasks[i];
      if (!fl || !platesLeft) return false;
      if (fl.plate) { const o = flasks[1 - i]; if (o && !o.plate) i = 1 - i; else return false; }
      flasks[i].plate = true; platesLeft--;
      const b = plateBtns.find((x) => !x.classList.contains(P + "used"));
      if (b) b.classList.add(P + "used");
      status(`A lead plate beside flask ${i + 1}. Its front climbs slower.`);
      return true;
    }
    function buildPlates(n) {
      plateBtns.splice(0).forEach((b) => b.remove());
      for (let i = 0; i < n; i++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "plate"; b.setAttribute("aria-label", "Lead shield plate: drag onto a flask, or tap to place it by the flask under the dropper (S)");
        b.innerHTML = has("cage-shield-plate") ? `<img alt="" src="${url("cage-shield-plate")}">Plate` : "Plate";
        let ghost = null, sx = 0, sy = 0, moved = false;
        b.addEventListener("pointerdown", (e) => {
          if (phase !== "play" || b.classList.contains(P + "used")) return;
          e.preventDefault(); sx = e.clientX; sy = e.clientY; moved = false;
          try { b.setPointerCapture(e.pointerId); } catch { /* ok */ }
          if (has("cage-shield-plate")) { ghost = document.createElement("img"); ghost.src = url("cage-shield-plate"); ghost.alt = ""; }
          else { ghost = document.createElement("div"); ghost.style.cssText = `width:36px;background:${C.grey};border:3px solid ${C.ink}`; }
          ghost.className = P + "ghost"; ghost.hidden = true; wrap.appendChild(ghost);
        });
        b.addEventListener("pointermove", (e) => {
          if (!ghost) return;
          if (Math.hypot(e.clientX - sx, e.clientY - sy) > 8) moved = true;
          const r = wrap.getBoundingClientRect();
          ghost.hidden = !moved; ghost.style.left = (e.clientX - r.left) + "px"; ghost.style.top = (e.clientY - r.top) + "px";
        });
        const done = (e) => {
          if (!ghost) return;
          ghost.remove(); ghost = null;
          if (!moved) { placePlate(sel); return; }
          const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
          if (!L || y < 0 || y > r.height || x < 0 || x > r.width) return;
          let best = 0, bd = Infinity;
          L.xs.forEach((fx, i) => { const dd = Math.abs(fx + L.fw / 2 - x); if (dd < bd) { bd = dd; best = i; } });
          if (bd < L.fw) placePlate(best);
        };
        b.addEventListener("pointerup", done);
        b.addEventListener("pointercancel", () => { if (ghost) { ghost.remove(); ghost = null; } });
        b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); placePlate(sel); } });
        ctl.insertBefore(b, capBtn);
        plateBtns.push(b);
      }
    }

    // ---- a batch ------------------------------------------------------------------------------------
    function begin(bi) {
      B = BATCHES[bi]; B.index = bi;
      flasks = [];
      for (let i = 0; i < B.flasks; i++) {
        flasks.push({ f: B.start + (i ? 0.06 : 0), phase: i * 2.1, plate: false, hint: 0, surgeLeft: 0, ripple: 0, spread: 0,
          surgeAt: B.surge[0] + (B.flasks > 1 ? i * (B.surge[0] / 2) : 0) + rng() * (B.surge[1] - B.surge[0]) });
      }
      sel = 0; drops = []; count = 0; held = 0; t = 0; beat = 0; platesLeft = B.plates;
      numEl.textContent = "000";
      dateEl.textContent = B.caption; whereEl.textContent = B.where;
      buildPlates(B.plates);
      capBtn.classList.remove(P + "ready");
      phase = "play";
      layout();
      status(B.flasks > 1 ? "Two flasks. Tap a flask (or press ← →) to swing the dropper; hold to drip." : "Hold Drip (or Space, or press on the flask) to drip A9.");
      dripBtn.focus({ preventScroll: true });
    }

    function judge(fl) {
      const f = level(fl);
      if (fl.burnt) return fl.burnt;
      if (f < B.win[0]) return "hot";
      if (f > B.win[1]) return "leaky";
      return held >= HOLD ? "steady" : "leaky";
    }

    function cap(forced, why) {
      if (phase !== "play") return;
      stopDrip();
      phase = "done";
      let q = "steady";
      const each = flasks.map(judge);
      if (each.includes("hot")) q = "hot"; else if (each.includes("leaky")) q = "leaky";
      const unsettled = !forced && q === "leaky" && flasks.every((fl) => zone(level(fl)) === "end");
      const doses = DOSES[q];
      const before = clamp(sget("amber", 0) | 0, 0, 6);
      const after = Math.min(6, before + doses);
      sset("amber", after);
      sset("amber_quality", q);
      sset("cage_batches", (sget("cage_batches", 0) | 0) + 1);
      mset("reached", Math.max(mget("reached", 0) | 0, Math.min(2, B.index + 1)));
      drawAmber(after);
      const lost = before + doses - after;
      const head = { steady: "Steady.", leaky: "Leaky.", hot: "Hot." }[q];
      let body;
      if (q === "steady") body = `The amber held on the endpoint and he capped it. ${doses} doses.`;
      else if (q === "leaky") body = (why || (unsettled ? "Capped in the window before the colour had held." : "Capped short of the endpoint, the green still climbing.")) + ` ${doses} doses, and his Pulse will start higher next chapter.`;
      else body = (why || "Capped past the endpoint.") + ` ${doses} doses, one short.`;
      if (B.syringe) body += " He loads the lead-shielded syringe.";
      body += ` Every batch is used. Amber on hand: ${after} of 6${lost > 0 ? ` (no more than six on hand)` : ""}.`;
      status("");
      // the batch's result card (and, after the first batch, the syringe) behind the result box
      const box = document.createElement("div");
      box.className = P + "result";
      const rid = "cage-result-" + q;
      if (has(rid)) { const im = document.createElement("img"); im.className = P + "rc"; im.src = url(rid); im.alt = `${head} ${doses} doses`; box.appendChild(im); }
      else { const fb = document.createElement("div"); fb.className = P + "fb"; fb.innerHTML = `${esc(q.toUpperCase())}<small>${doses} DOSES</small>`; box.appendChild(fb); }
      if (B.syringe && has("cage-syringe")) { const sy = document.createElement("img"); sy.className = P + "sy"; sy.src = url("cage-syringe"); sy.alt = "The lead-shielded syringe"; box.appendChild(sy); }
      const nx = BATCHES[B.index + 1];
      if (nx) { const p = document.createElement("p"); p.textContent = `Play again for the next batch: ${nx.name}.`; box.appendChild(p); }
      wrap.appendChild(box);
      ctl.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      later(() => { if (alive) api.end({ outcome: q === "steady" ? "win" : "lose", text: `${head} ${body}` }); }, RM ? 0 : 450);
    }

    // ---- the loop -----------------------------------------------------------------------------------
    let last = 0;
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const t0 = performance.now();
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (phase === "play") step(dt);
      draw();
      lastFrameMs.push(performance.now() - t0);
      if (lastFrameMs.length > 600) lastFrameMs.shift();
    }

    function step(dt) {
      t += dt;
      if (dripping && t >= nextDrip) { drip(); nextDrip = t + STREAM; }
      for (const fl of flasks) {
        let v = B.v * (fl.plate ? 0.55 : 1);
        // surges: the colour edge brightens (the hint) for 1.4 s, then the front climbs fast for 0.9 s
        if (t >= fl.surgeAt && !fl.hint && !fl.surgeLeft) fl.hint = 1.4;
        if (fl.hint) { fl.hint -= dt; if (fl.hint <= 0) { fl.hint = 0; fl.surgeLeft = 0.9; } }
        if (fl.surgeLeft) {
          v += B.surgeAmt / 0.9 * (fl.plate ? 0.55 : 1);
          fl.surgeLeft -= dt;
          if (fl.surgeLeft <= 0) {
            fl.surgeLeft = 0;
            const gapS = B.surge[0] + rng() * (B.surge[1] - B.surge[0]);
            fl.surgeAt = t + (B.flasks > 1 ? gapS * 1.5 : gapS);
          }
        }
        fl.f = Math.min(1, fl.f + v * dt);
        fl.ripple = Math.max(0, fl.ripple - dt * 2.2);
        fl.spread = Math.max(0, fl.spread - dt * 0.35);
      }
      // drops in flight
      if (L) {
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.vy += 1400 * dt; d.y += d.vy * dt;
          const fl = flasks[d.fi], F = FLASKS[B.flask];
          const surfY = L.top + F.surface * L.s;
          if (!fl || d.y >= surfY) { applyDrop(d.fi); drops.splice(i, 1); }
        }
      }
      // the window and the hold
      const inAll = flasks.every((fl) => zone(level(fl)) === "end");
      held = inAll ? held + dt : 0;
      capBtn.classList.toggle(P + "ready", held >= HOLD);
      if (inAll && beat < 2) { beat = 2; status("In the window. Hold it there for three seconds.", "ok"); }
      if (held >= HOLD && beat < 3) { beat = 3; status("It holds. Cap it (C).", "ok"); }
      if (!inAll && beat === 3 && held === 0) { beat = 2; status("It slipped. Bring it back into the window."); }
      const hinting = flasks.findIndex((fl) => fl.hint > 0);
      if (hinting >= 0 && beat >= 1 && statusEl.dataset.h !== "1") { statusEl.dataset.h = "1"; status(B.flasks > 1 ? `Flask ${hinting + 1}: the edge brightens.` : "The edge brightens.", "warn"); later(() => { statusEl.dataset.h = ""; }, 1600); }
      // the two ends that cap themselves
      for (let i = 0; i < flasks.length; i++) {
        const fl = flasks[i], f = level(fl);
        if (f >= 0.97) { cap(true, B.flasks > 1 ? `The front reached the neck of flask ${i + 1}.` : "The front reached the neck."); return; }
        if (fl.f <= hotFloor() - 0.0001 || f < hotFloor()) { fl.burnt = "hot"; cap(true, B.flasks > 1 ? `Flask ${i + 1} ran past the endpoint; the amber took the whole flask.` : "Past the endpoint; the amber took the whole flask."); return; }
      }
    }

    function flaskPath(F, x0, y0, s) {
      g.beginPath();
      F.path.forEach(([px, py], i) => (i ? g.lineTo : g.moveTo).call(g, x0 + px * s, y0 + py * s));
      g.closePath();
    }

    function draw() {
      const d = dpr();
      g.setTransform(d, 0, 0, d, 0, 0);
      g.clearRect(0, 0, W, H);
      if (!B || !L) { g.fillStyle = C.bg; g.fillRect(0, 0, W, H); return; }
      // backdrop, then a flat wash so the instrument reads first
      const bd = bake(B.backdrop, W * d, H * d, 0, 0, 0, 0, "cover");
      if (bd) g.drawImage(bd, 0, 0, W, H); else { g.fillStyle = B.backdrop === "cage-lab" ? "#2a2416" : "#c9d2d0"; g.fillRect(0, 0, W, H); }
      g.fillStyle = "rgba(16,20,20,.28)"; g.fillRect(0, 0, W, H);
      // the bench line
      g.fillStyle = B.backdrop === "cage-lab" ? "#3b2f1a" : C.grey2; g.fillRect(0, L.bench, W, H - L.bench);
      g.fillStyle = C.ink; g.fillRect(0, L.bench, W, 4);
      const F = FLASKS[B.flask];
      // dropper eases to the flask under it
      const target = L.xs[sel] + L.fw / 2;
      dropperX += (target - dropperX) * (RM ? 1 : 0.25);
      const dsrc = bake("cage-dropper", L.dw * d, L.dh * d, 96, 0, 108, 424);
      const dx = dropperX - (142 - 96) * L.ds;
      if (dsrc) g.drawImage(dsrc, dx, 0, L.dw, L.dh);
      else {
        g.fillStyle = C.glass; g.strokeStyle = C.ink; g.lineWidth = 3;
        g.fillRect(dropperX - 12, 0, 24, L.dh * 0.78); g.strokeRect(dropperX - 12, 0, 24, L.dh * 0.78);
        g.fillStyle = C.amber; g.fillRect(dropperX - 8, 4, 16, L.dh * 0.74);
        g.beginPath(); g.moveTo(dropperX - 4, L.dh * 0.78); g.lineTo(dropperX + 4, L.dh * 0.78); g.lineTo(dropperX, L.dh); g.closePath(); g.fillStyle = C.ink; g.fill();
      }
      // flasks
      flasks.forEach((fl, i) => {
        const x0 = L.xs[i], y0 = L.top, s = L.s;
        if (fl.plate) {
          const pw = L.fw * 0.3, ph = pw * 320 / 140, px = x0 - pw * 0.55, py = L.bench - ph;
          const pl = bake("cage-shield-plate", pw * d, ph * d);
          if (pl) g.drawImage(pl, px, py, pw, ph); else { g.fillStyle = "#6e7a79"; g.strokeStyle = C.ink; g.lineWidth = 3; g.fillRect(px, py, pw, ph); g.strokeRect(px, py, pw, ph); }
        }
        const fa = bake(F.id, L.fw * d, L.fh * d);
        if (fa) g.drawImage(fa, x0, y0, L.fw, L.fh);
        else { flaskPath(F, x0, y0, s); g.fillStyle = C.glass; g.fill(); }
        // the liquid: green below the front, amber above it, flat fills to the line
        const f = level(fl);
        const ySurf = y0 + F.surface * s, yBot = y0 + F.bottom * s;
        const yFront = clamp(yBot - f * (yBot - ySurf), ySurf, yBot);
        g.save(); flaskPath(F, x0, y0, s); g.clip();
        g.fillStyle = C.amber; g.fillRect(x0, ySurf, L.fw, yFront - ySurf);
        if (fl.spread > 0.05) { g.fillStyle = C.gold; g.fillRect(x0, ySurf, L.fw, (yFront - ySurf) * fl.spread * 0.45); }
        g.fillStyle = C.green; g.fillRect(x0, yFront, L.fw, yBot + 10 - yFront);
        const bright = fl.hint > 0;
        g.fillStyle = bright ? C.greenHot : C.ink;
        g.fillRect(x0, yFront - (bright ? 4 : 2), L.fw, bright ? 8 : 4);
        if (bright) { g.fillStyle = C.ink; g.fillRect(x0, yFront - 6, L.fw, 2); g.fillRect(x0, yFront + 4, L.fw, 2); }
        g.fillStyle = C.ink; g.fillRect(x0, ySurf - 1, L.fw, 3);
        if (fl.ripple > 0) {
          g.strokeStyle = C.gold; g.lineWidth = 3;
          const rr = (1 - fl.ripple) * L.fw * 0.18 + 4;
          g.beginPath(); g.ellipse(x0 + L.fw / 2, ySurf + 6, rr, rr * 0.3, 0, 0, Math.PI * 2); g.stroke();
        }
        // the endpoint window marked on the glass
        const yHi = yBot - B.win[1] * (yBot - ySurf), yLo = yBot - B.win[0] * (yBot - ySurf);
        g.setLineDash([7, 5]); g.strokeStyle = C.ink; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x0, yHi); g.lineTo(x0 + L.fw, yHi); g.moveTo(x0, yLo); g.lineTo(x0 + L.fw, yLo); g.stroke();
        g.setLineDash([]);
        g.restore();
        flaskPath(F, x0, y0, s); g.strokeStyle = C.ink; g.lineWidth = Math.max(3, 5 * s); g.lineJoin = "round"; g.stroke();
        // window brackets on the flask's right edge
        const bx = x0 + L.fw + 4;
        g.fillStyle = C.ink; g.fillRect(bx, yHi, 4, yLo - yHi); g.fillRect(bx, yHi - 1, 10, 3); g.fillRect(bx, yLo - 2, 10, 3);
        // selection and flask number when there are two
        if (B.flasks > 1) {
          g.font = `700 ${Math.round(clamp(L.fw * 0.12, 13, 22))}px ${getComputedStyle(wrap).fontFamily}`;
          g.textAlign = "center"; g.textBaseline = "top";
          const lx = x0 + L.fw / 2, ly = Math.max(4, y0 - 30);
          g.fillStyle = i === sel ? C.gold : C.cream; g.strokeStyle = C.ink; g.lineWidth = 3;
          const tw = 34; g.fillRect(lx - tw / 2, ly, tw, 22); g.strokeRect(lx - tw / 2, ly, tw, 22);
          g.fillStyle = C.ink; g.fillText(String(i + 1), lx, ly + 2);
        }
        if (held >= HOLD) { g.strokeStyle = C.gold; g.lineWidth = 3; g.setLineDash([10, 6]); flaskPath(F, x0, y0, s); g.stroke(); g.setLineDash([]); }
      });
      // drops in flight
      const dw = clamp(L.fw * 0.08, 14, 26), dh = dw * 56 / 40;
      const dimg = bake("cage-drop", dw * d, dh * d);
      for (const dr of drops) {
        const x = L.xs[dr.fi] + L.fw / 2;
        if (dimg) g.drawImage(dimg, x - dw / 2, dr.y - dh / 2, dw, dh);
        else { g.fillStyle = C.amber; g.beginPath(); g.arc(x, dr.y, dw / 2, 0, Math.PI * 2); g.fill(); }
      }
      // the side bar and its pointers
      const sb = bake("cage-side-bar", L.barW * d, L.barH * d);
      const k = L.barH / BAR.h, bx = L.barX, by = L.barY;
      if (sb) g.drawImage(sb, bx, by, L.barW, L.barH);
      else {
        const band = (y1, y2, c) => { g.fillStyle = c; g.fillRect(bx + 20 * k, by + y1 * k, 140 * k, (y2 - y1) * k); };
        band(20, 540, C.white); band(20, 260, C.teal); band(260, 370, C.amber); band(370, 434, C.green);
        g.strokeStyle = C.ink; g.lineWidth = 3; g.strokeRect(bx + 20 * k, by + 20 * k, 140 * k, 520 * k);
        g.fillStyle = C.ink; g.textAlign = "center"; g.font = `700 ${Math.max(9, 18 * k)}px sans-serif`;
        g.fillText("LEAKY", bx + 90 * k, by + 150 * k); g.fillText("ENDPOINT", bx + 90 * k, by + 320 * k); g.fillText("HOT", bx + 90 * k, by + 408 * k);
      }
      const barY = (f) => {
        const [lo, hi] = B.win, hf = hotFloor();
        let y;
        if (f >= hi) y = BAR.endHi - (Math.min(f, 0.97) - hi) / (0.97 - hi) * (BAR.endHi - BAR.top);
        else if (f >= lo) y = BAR.endLo - (f - lo) / (hi - lo) * (BAR.endLo - BAR.endHi);
        else if (f >= hf) y = BAR.hotLo - (f - hf) / (lo - hf) * (BAR.hotLo - BAR.endLo);
        else y = BAR.hotLo + (hf - f) / hf * (BAR.bottom - BAR.hotLo);
        return by + y * k;
      };
      flasks.forEach((fl, i) => {
        const y = barY(level(fl));
        const size = clamp(16 * k * 1.6, 10, 18), right = i === 1;
        const px = right ? bx + 162 * k : bx + 18 * k, dir = right ? 1 : -1;
        g.fillStyle = C.ink; g.fillRect(bx + 20 * k, y - 2, 140 * k, 4);
        g.beginPath(); g.moveTo(px, y); g.lineTo(px - dir * size, y - size * 0.7); g.lineTo(px - dir * size, y + size * 0.7); g.closePath();
        g.fillStyle = zone(level(fl)) === "end" ? C.gold : zone(level(fl)) === "hot" ? C.green : C.cream; g.fill();
        g.strokeStyle = C.ink; g.lineWidth = 3; g.stroke();
        if (B.flasks > 1) {
          const tx = right ? bx + 150 * k : bx + 30 * k;
          g.font = `700 ${Math.round(clamp(20 * k * 1.4, 11, 16))}px sans-serif`; g.textAlign = right ? "right" : "left"; g.textBaseline = "bottom";
          g.fillStyle = C.ink; g.fillText(String(i + 1), tx, y - 3);
        }
      });
      // the hold: a bar under the side bar that fills over three seconds
      const hy = Math.min(H - 14, by + L.barH + 6), hw = L.barW * 0.78, hx = bx + (L.barW - hw) / 2;
      g.fillStyle = C.cream; g.fillRect(hx, hy, hw, 10);
      g.fillStyle = C.amber; g.fillRect(hx, hy, hw * clamp(held / HOLD, 0, 1), 10);
      g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(hx, hy, hw, 10);
      // his monitor line along the foot of the page, calm
      const ml = bake("hud-margin-calm", W * d, 16 * d);
      if (ml) g.drawImage(ml, 0, H - 16, W, 16);
    }

    // ---- the how-to card -------------------------------------------------------------------------
    const reached = clamp(mget("reached", 0) | 0, 0, 2);
    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="The Cage: how to play">
<div class="${P}kick">Dr. Tox: Rise · 1D · Titration</div>
<h2>The Cage</h2>
<blockquote>“${esc(QUOTE)}”<cite>${esc(CITE)}</cite></blockquote>
<p>A green front climbs in the flask. Drops of A9 push it down under an amber band. Bring the pointer on the side bar into <b>ENDPOINT</b>, hold it there for three seconds, then cap. Short is leaky, past is hot. Every batch is used.</p>
<ul>
<li><b>Drip</b>Hold Drip, Space or ↓, or press on the flask: one drop per tap, a stream while held.</li>
<li><b>Cap</b>Cap, or C. The Cap button turns gold when the colour has held.</li>
<li><b>Watch</b>The front's edge brightens before it surges.</li>
${reached >= 2 ? `<li><b>Third</b>Two flasks: tap one, or ← → (1, 2), to swing the dropper. Drag a lead plate beside a flask (or press S) to slow its front.</li>` : ""}
</ul>
<p class="${P}note">A9, its drops and the marks are invented. Nothing here is a real substance, procedure or dose.</p>
<div class="${P}batches"></div></div>`;
    const list = intro.querySelector("." + P + "batches");
    BATCHES.forEach((b, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.disabled = i > reached;
      if (i === reached) btn.classList.add(P + "next");
      btn.innerHTML = `<b>${i + 1}. ${esc(b.name)} · ${esc(b.caption)}</b><span>${esc(i > reached ? "Make the batch before it first." : b.where)}</span>`;
      btn.addEventListener("click", () => { intro.remove(); begin(i); });
      list.appendChild(btn);
    });
    wrap.appendChild(intro);
    dateEl.textContent = BATCHES[reached].caption; whereEl.textContent = BATCHES[reached].where;
    status("");
    later(() => { const b = list.querySelector("." + P + "next"); if (b && alive) b.focus({ preventScroll: true }); }, 0);

    if (typeof ResizeObserver === "function") { ro = new ResizeObserver(() => layout()); ro.observe(scene); }
    else on(window, "resize", layout);
    layout();
    raf = requestAnimationFrame(frame);

    // for the test harness: the average frame cost (ms) over the last frames
    wrap.__cageFrame = () => (lastFrameMs.length ? lastFrameMs.reduce((a, b) => a + b, 0) / lastFrameMs.length : 0);
    wrap.__cageState = () => ({ phase, held, flasks: flasks.map((fl) => ({ f: fl.f, level: B ? level(fl) : 0, zone: B ? zone(level(fl)) : "" })), win: B && B.win, count });

    return {
      unmount() {
        alive = false;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach((f) => f()); offs.length = 0;
        if (ro) { ro.disconnect(); ro = null; }
        stopDrip();
        wrap.remove(); style.remove();
      },
    };
  },
};

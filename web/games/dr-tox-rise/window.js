// Dr. Tox: Rise / The Window (1D, timetable). Fumetti photo-comic: posed surveillance photos in grey
// tone with typed time captions on the left, the guard rota typed on paper in the margin on the right,
// a typed caption strip below. One red: the grease pencil of his own marks (DESIGN.md section 11).
//
// Two sheets, as the design's two appearances: s1_window_1 (the research floor, 2226: two guards,
// three zones, all on the rota) and s1_window_2 (the cold-storage depot, 2227: three guards, four zones,
// a dog round that is not on the rota, and a clock that runs while he looks). The player drags his
// route's start along the time strip; a segment that overlaps a round in its zone turns red; slack is
// the smallest margin between any segment and any bar. Confirm a start: slack 90 s or more is CLEAR
// (the Panel run starts at Pulse 20), slack 0 is TIGHT with a guard in the first panel (Pulse 50).
// Writes window.slack (0 to 90) and pulse (20 + (90 - slack) / 3) to api.shared (data/flags.json).
//
// Art (games/dr-tox-rise/art/ASSET_MAP.md, "The Window"): window-photo-*, window-rota, window-guard-bar,
// window-segment, window-segment-overlap, window-clue-ring, window-stamp-clear/-tight, window-caption,
// and the shared hud-caption and hud-margin-calm. Every one has a drawn fallback.

const P = "wn-";
const MONO = "'Courier Prime','Courier New',Courier,ui-monospace,monospace";
const PAPER = "#f2f0ea", TYPE = "#1d1d1b", PEN = "#b3261e", GREY = "#5e7375";
const STEP = 15;        // seconds per keyboard step and drag snap
const SHEET = 3600;     // the strip runs 02:00 to 03:00

// The rounds, in minutes after 02:00: [zone index, from, to, who]. Tuned so each sheet has a narrow
// clean window; on the depot sheet the widest gap on the rota is the dog's.
const SHEETS = [
  {
    scene: "s1_window_1", year: "2226", place: "The research floor",
    zones: ["FENCE", "YARD", "DOOR"],
    route: [[0, 3], [1, 4], [2, 2]],
    photos: [
      { id: "window-photo-research-1", time: "02:10", spots: [
        { x: 330, y: 205, r: 48, say: "02:10. Fence. A guard on the far side of the wire, as posted." },
        { x: 255, y: 220, r: 50, say: "02:10. The gate. Chained." },
        { x: 380, y: 70, r: 44, say: "02:10. One floodlight. It does not move." }] },
      { id: "window-photo-research-2", time: "02:31", spots: [
        { x: 140, y: 265, r: 52, say: "02:31. Yard. A guard past the van, as posted." },
        { x: 320, y: 205, r: 60, say: "02:31. A van, parked. Cold engine." }] },
      { id: "window-photo-research-3", time: "02:44", spots: [
        { x: 220, y: 190, r: 62, say: "02:44. The side door. Nobody, as posted." },
        { x: 390, y: 220, r: 60, say: "02:44. The outside stair. Empty." }] },
    ],
    bars: [
      [0, 0, 1, "1"], [0, 8, 12, "1"], [1, 12, 16, "1"], [0, 26, 30, "1"], [1, 30, 34, "1"], [0, 44, 48, "1"], [1, 48, 52, "1"],
      [2, 0, 4, "2"], [1, 4, 6, "2"], [2, 16, 20, "2"], [1, 20, 22, "2"], [2, 34, 38, "2"], [1, 38, 40, "2"], [2, 52, 56, "2"], [1, 56, 58, "2"],
    ],
    hidden: [],
    clock: 0,
  },
  {
    scene: "s1_window_2", year: "2227", place: "The depot",
    zones: ["FENCE", "YARD", "DOOR", "STAIR"],
    route: [[0, 2], [1, 3], [2, 2], [3, 3]],
    photos: [
      { id: "window-photo-depot-1", time: "01:48", spots: [
        { x: 400, y: 280, r: 52, say: "01:48. The loading bay. A guard at the edge of the light, before the sheet's hour." },
        { x: 210, y: 180, r: 80, say: "01:48. The shutter. Down." }] },
      { id: "window-photo-depot-2", time: "02:05", spots: [
        { x: 295, y: 150, r: 50, say: "02:05. The hut. The window lit." },
        { x: 170, y: 302, r: 56, clue: true, say: "02:05. A water bowl by the hut. A dog round, not on the sheet." },
        { x: 214, y: 195, r: 40, clue: true, say: "02:05. A leash hook by the door. A dog round, not on the sheet." }] },
      { id: "window-photo-depot-3", time: "02:22", spots: [
        { x: 220, y: 185, r: 70, say: "02:22. The cold-store door. Nobody, as posted." },
        { x: 415, y: 215, r: 50, say: "02:22. The back stair. Dark." }] },
    ],
    bars: [
      [0, 0, 3, "1"], [1, 3, 6, "1"], [0, 24, 27, "1"], [1, 27, 30, "1"], [0, 46, 49, "1"], [1, 49, 52, "1"],
      [2, 4, 7, "2"], [3, 7, 10, "2"], [2, 29, 32, "2"], [3, 32, 35, "2"], [2, 51, 54, "2"], [3, 54, 57, "2"],
      [3, 16, 19, "3"], [2, 19, 21, "3"], [0, 36, 38, "3"], [3, 42, 45, "3"], [2, 45, 47, "3"],
    ],
    hidden: [[1, 19, 24, "DOG"], [1, 40, 43, "DOG"], [1, 55, 58, "DOG"]],
    clock: 5,   // real seconds per minute of the night while he looks
  },
];

const fmt = (s) => { s = Math.round(s); const h = 2 + Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`; };
const fmtHM = (s) => fmt(s).slice(0, 5);
const fmtSlack = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function css() {
  return `
.${P}page{position:absolute;inset:0;overflow:auto;background:#d9d6cd;background-image:radial-gradient(rgba(0,0,0,.05) 1px,transparent 1.2px),linear-gradient(180deg,#e4e1d9,#d3cfc5);background-size:5px 5px,auto;color:${TYPE};font-family:${MONO};-webkit-tap-highlight-color:transparent}
.${P}wrap{box-sizing:border-box;min-height:100%;max-width:1180px;margin:0 auto;padding:14px 16px 20px;display:grid;grid-template-columns:min(280px,calc((100vh - 120px) / 2.25)) minmax(0,1fr);grid-template-rows:auto auto auto auto 1fr;grid-template-areas:"photos head" "photos sheet" "photos ctl" "photos cap" "photos margin";gap:10px 22px;align-content:start}
.${P}head{grid-area:head;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.${P}dated{position:relative;padding:6px 16px;min-width:180px;font-weight:700;font-size:15px;letter-spacing:.06em;background:${PAPER};border:1.5px solid ${TYPE};box-shadow:2px 2px 0 rgba(0,0,0,.18)}
.${P}dated.${P}art{background:center/100% 100% no-repeat;border:0;box-shadow:none;padding:10px 22px}
.${P}watch{margin-left:auto;font-size:14px;font-weight:700;padding:5px 10px;background:${TYPE};color:${PAPER};letter-spacing:.05em}
.${P}watch[hidden]{display:none}
.${P}watch.${P}late{background:${PEN}}
.${P}photos{grid-area:photos;display:flex;flex-direction:column;gap:10px}
.${P}photo{position:relative;aspect-ratio:4/3;width:100%;background:#2a2d2d;box-shadow:3px 4px 0 rgba(0,0,0,.22);cursor:crosshair;transform:rotate(var(--r,0deg));touch-action:manipulation;outline:none}
.${P}photo:focus-visible{box-shadow:0 0 0 3px ${PEN},3px 4px 0 rgba(0,0,0,.22)}
.${P}photo img{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;user-select:none}
.${P}fb{position:absolute;inset:0;border:7px solid #fff;box-sizing:border-box;background:radial-gradient(ellipse at 70% 25%,#9a9e9c 0,#3a3e3e 35%,#1b1d1d 80%)}
.${P}fb b{position:absolute;left:6px;top:6px;background:${PAPER};padding:2px 6px;font-size:13px}
.${P}fb i{position:absolute;border-radius:50%;background:#9a9e9c}
.${P}spot{position:absolute;transform:translate(-50%,-50%);border-radius:50%;border:0;background:transparent;padding:0;margin:0;cursor:crosshair}
.${P}spot:focus-visible{outline:2px dashed ${PEN};outline-offset:2px}
.${P}ring{position:absolute;transform:translate(-50%,-50%);pointer-events:none;width:30%;aspect-ratio:4/3}
.${P}ring img{position:static;width:100%;height:100%}
.${P}ring.${P}draw{animation:${P}ring .45s ease-out}
@keyframes ${P}ring{from{opacity:0;transform:translate(-50%,-50%) scale(1.5) rotate(-12deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}
.${P}tick{position:absolute;width:14px;height:14px;transform:translate(-50%,-50%);border:2px solid ${PEN};border-radius:50%;pointer-events:none;opacity:.8}
.${P}sheetbox{grid-area:sheet;align-self:start;justify-self:start;width:100%;max-width:680px}
.${P}sheet{position:relative;width:100%;aspect-ratio:640/440;background:${PAPER};box-shadow:3px 4px 0 rgba(0,0,0,.2);transform:rotate(.35deg);user-select:none}
.${P}sheet>img.${P}bg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.${P}grid{position:absolute;left:18.75%;width:77.5%;top:20.45%;height:69.09%;touch-action:pan-y;cursor:ew-resize}
.${P}fz{position:absolute;left:-23.2%;font-weight:700;font-size:clamp(9px,1.6vw,15px)}
.${P}fl{position:absolute;top:0;bottom:0;width:0;border-left:1px solid #c9c6bc}
.${P}ft{position:absolute;top:-6.5%;transform:translateX(-50%);font-size:clamp(8px,1.2vw,12px)}
.${P}fh{position:absolute;left:-23.2%;top:-21%;font-weight:700;font-size:clamp(10px,1.9vw,18px)}
.${P}rowline{position:absolute;left:-23.2%;right:0;border-top:1px solid ${TYPE}}
.${P}nopost{position:absolute;left:-23.2%;right:-1%;background:${PAPER};display:flex;align-items:center;justify-content:center;font-size:clamp(9px,1.3vw,13px);color:#7a776d;letter-spacing:.2em;border-top:1px dashed #b9b5aa}
.${P}past{position:absolute;top:0;bottom:0;left:0;background:repeating-linear-gradient(-45deg,rgba(29,29,27,.16) 0 3px,transparent 3px 8px);border-right:2px solid ${TYPE};pointer-events:none}
.${P}past::after{content:attr(data-t);position:absolute;right:-1px;bottom:-14px;transform:translateX(50%);font-size:11px;font-weight:700;background:${TYPE};color:${PAPER};padding:0 3px}
.${P}bar{position:absolute;box-sizing:border-box;background:#8a8a85 center/100% 100% no-repeat;border:1.5px solid ${TYPE};pointer-events:none}
.${P}bar.${P}art{border:0;background-color:transparent}
.${P}bar span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:${PAPER};font-size:clamp(8px,1.1vw,11px);font-weight:700;padding:0 2px;line-height:1.2}
.${P}bar.${P}hot{outline:2px solid ${PEN};outline-offset:1px}
.${P}dog{background:repeating-linear-gradient(-50deg,rgba(179,38,30,.35) 0 2px,transparent 2px 6px);border:2.5px solid ${PEN};border-radius:3px}
.${P}dog span{color:${PEN}}
.${P}dog.${P}draw{animation:${P}dog .6s ease-out}
@keyframes ${P}dog{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.${P}route{position:absolute;inset:0;pointer-events:none}
.${P}seg{position:absolute;box-sizing:border-box;background:center/100% 100% no-repeat}
.${P}seg.${P}nf{background:#fff;border:2px solid ${TYPE}}
.${P}seg.${P}nf.${P}red{background:#f2d6d3;border:2.5px solid ${PEN}}
.${P}knob{position:absolute;top:-9%;bottom:-9%;width:0;border-left:2px dashed ${TYPE};pointer-events:none}
.${P}grid:focus{outline:none}
.${P}grid:focus-visible{outline:2px dashed ${PEN};outline-offset:6px}
.${P}stamp{position:absolute;left:50%;top:48%;width:46%;transform:translate(-50%,-50%) rotate(-4deg);pointer-events:none;z-index:3}
.${P}stamp img{width:100%;display:block}
.${P}stamp.${P}fbk{border:5px solid ${TYPE};padding:6px 10px;text-align:center;font-size:clamp(22px,4vw,40px);font-weight:700;letter-spacing:.2em;background:rgba(242,240,234,.7)}
.${P}stamp.${P}in{animation:${P}stamp .35s cubic-bezier(.2,1.6,.4,1)}
@keyframes ${P}stamp{from{opacity:0;transform:translate(-50%,-50%) rotate(-4deg) scale(1.9)}to{opacity:1;transform:translate(-50%,-50%) rotate(-4deg) scale(1)}}
.${P}ctl{grid-area:ctl;display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;max-width:680px}
.${P}ctl button,.${P}cap button,.${P}card button{font:700 14px ${MONO};color:${TYPE};background:${PAPER};border:2px solid ${TYPE};padding:8px 12px;min-height:40px;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.25)}
.${P}ctl button:active,.${P}cap button:active{transform:translate(1px,1px);box-shadow:1px 1px 0 rgba(0,0,0,.25)}
.${P}ctl button:focus-visible,.${P}cap button:focus-visible,.${P}card button:focus-visible{outline:3px solid ${PEN};outline-offset:2px}
.${P}ctl .${P}go{background:${TYPE};color:${PAPER}}
.${P}ctl button:disabled{opacity:.45;cursor:default}
.${P}read{display:flex;flex-direction:column;line-height:1.15;min-width:118px}
.${P}read small{font-size:11px;letter-spacing:.08em;color:#55534c}
.${P}read b{font-size:18px}
.${P}read.${P}warn b{color:${PEN}}
.${P}cap{grid-area:cap;align-self:start;max-width:680px;position:relative;min-height:64px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 26px 14px;box-sizing:border-box;background:${PAPER} center/100% 100% no-repeat;border:1.5px solid ${TYPE};transform:rotate(-.3deg);box-shadow:2px 3px 0 rgba(0,0,0,.18)}
.${P}cap.${P}art{border:0;box-shadow:none;background-color:transparent;padding:14px 34px 16px}
.${P}cap p{margin:0;flex:1 1 240px;font-size:15px;line-height:1.35;min-height:1.35em}
.${P}margin{grid-area:margin;align-self:start;max-width:680px;height:14px;background:center/100% 100% no-repeat;opacity:.85}
.${P}intro{position:absolute;inset:0;z-index:6;display:grid;place-items:start center;padding:16px;background:rgba(27,29,29,.62);overflow:auto}
.${P}card{position:relative;box-sizing:border-box;width:100%;max-width:560px;margin:auto 0;background:${PAPER};border:2px solid ${TYPE};padding:18px 20px 18px;box-shadow:6px 7px 0 rgba(0,0,0,.35);transform:rotate(-.4deg)}
.${P}card .${P}kick{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#55534c}
.${P}card h2{margin:4px 0 8px;font:700 28px ${MONO};letter-spacing:.04em}
.${P}card blockquote{margin:0 0 10px;padding:6px 10px;border-left:4px solid ${GREY};font-style:italic;font-size:14px}
.${P}card blockquote cite{display:block;font-style:normal;font-size:11px;color:#55534c;margin-top:3px}
.${P}card p{margin:0 0 8px;font-size:14px;line-height:1.4}
.${P}card ul{margin:0 0 12px;padding:0;list-style:none;font-size:13.5px}
.${P}card li{display:grid;grid-template-columns:118px 1fr;gap:8px;padding:4px 0;border-top:1px dashed #b9b5aa}
.${P}card li b{font-weight:700}
.${P}card .${P}pic{position:relative;height:88px;margin:0 0 10px;overflow:hidden;background:#2a2d2d}
.${P}card .${P}pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 70%}
.${P}card .${P}red{color:${PEN};font-weight:700}
@media (max-width:820px){
 .${P}wrap{grid-template-columns:minmax(0,1fr);grid-template-rows:none;grid-template-areas:"head" "photos" "sheet" "ctl" "cap" "margin";padding:10px 16px 22px;gap:9px}
 .${P}photos{flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;gap:10px}
 .${P}photo{flex:0 0 min(62%,250px);scroll-snap-align:start}
 .${P}dated{font-size:13px;min-width:0}
 .${P}watch{font-size:13px}
 .${P}read b{font-size:16px}
 .${P}read{min-width:96px}
 .${P}ctl button{padding:7px 10px;font-size:13px}
 .${P}cap{padding:10px 18px 12px}
 .${P}cap.${P}art{padding:12px 22px 14px}
 .${P}cap p{font-size:13.5px}
 .${P}card li{grid-template-columns:96px 1fr}
}
@media (prefers-reduced-motion:reduce){.${P}page *{animation:none!important;transition:none!important}}
`;
}

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || null;
    const has = (id) => { try { return !!(art && art.has(id)); } catch { return false; } };
    const url = (id) => { try { return has(id) ? art.url(id) : ""; } catch { return ""; } };
    // bars, segments and caption strips are stretched to their span: the SVG must not keep its aspect
    const blobs = [], stretched = {};
    const surl = (id) => {
      if (!has(id)) return "";
      if (stretched[id]) return stretched[id];
      let u = "";
      try {
        let t = art.svg(id) || "";
        if (t) {
          t = /<svg\b[^>]*preserveAspectRatio=/.test(t) ? t.replace(/(<svg\b[^>]*preserveAspectRatio=)("[^"]*"|'[^']*')/, '$1"none"') : t.replace(/<svg\b/, '<svg preserveAspectRatio="none"');
          u = URL.createObjectURL(new Blob([t], { type: "image/svg+xml" })); blobs.push(u);
        }
      } catch { u = ""; }
      return (stretched[id] = u || url(id));
    };
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    let dead = false, clockTimer = 0, typeTimer = 0;

    const style = mk("style", null, root); style.textContent = css();
    const page = mk("div", P + "page", root);
    page.setAttribute("aria-label", "The Window: a guard rota and surveillance photos");

    // ---- state ------------------------------------------------------------------------------------
    let si = 0, S = null, start = 0, clock = 0, found = false, locked = true, lastTick = 0;
    const results = [];
    let dom = {};

    const total = () => S.route.reduce((a, r) => a + r[1] * 60, 0);
    const knownBars = () => S.bars.concat(found ? S.hidden : []);
    const minStart = () => (S.clock ? Math.ceil(clock / STEP) * STEP : 0);
    const maxStart = () => SHEET - total();
    function segments(st = start) {
      let t = st; return S.route.map(([z, m]) => { const a = t; t += m * 60; return { z, a, b: t }; });
    }
    function slackOf(st, bars) {
      let best = Infinity; const hot = new Set();
      for (const s of segments(st)) {
        for (let i = 0; i < bars.length; i++) {
          const [z, f, t] = bars[i]; if (z !== s.z) continue;
          const x = f * 60, y = t * 60;
          const gap = (s.a < y && x < s.b) ? 0 : (x >= s.b ? x - s.b : s.a - y);
          if (gap === 0) hot.add(i);
          best = Math.min(best, gap);
        }
      }
      return { slack: best === Infinity ? SHEET : best, hot };
    }

    // ---- how to play ------------------------------------------------------------------------------
    function intro() {
      const box = mk("div", P + "intro", page);
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "The Window: how to play");
      if (has("window-photo-research-2")) {
        const pic = mk("div", P + "pic", card); const im = mk("img", null, pic); im.src = url("window-photo-research-2"); im.alt = "";
      }
      mk("div", P + "kick", card, "1D · Chapters 5 and 7 · Fumetti photo-comic");
      mk("h2", null, card, "The Window");
      const q = mk("blockquote", null, card, "Twelve months of undercover reconnaissance");
      mk("cite", null, q, "Bible, Part VI, Dr. Tox, Story: Origin");
      mk("p", null, card, "He watches before he enters. The photos show the site at stated times; the rota in the margin gives each guard's rounds as bars on a time strip per zone. His route runs zone by zone, each segment with its length.");
      const g = mk("p", null, card); mk("b", null, g, "Goal "); g.append("Find a start time where no segment meets a round in its zone. Ninety seconds of slack or more is clean. A red segment means he walks into a guard.");
      const ul = mk("ul", null, card);
      for (const [a, b] of [
        ["Move the start", "Drag along the rota, or ← → (15 s; Shift: 1 min)"],
        ["Check a photo", "Click or tap a detail. Something not on the rota may be in the photos: tap it to add the round."],
        ["Confirm", "The button, or Enter"],
      ]) { const li = mk("li", null, ul); mk("b", null, li, a); mk("span", null, li, b); }
      const n = mk("p", null, card); n.append("Two sheets: the research floor, then the depot. ");
      mk("span", P + "red", n, "On the depot sheet the night keeps moving while he looks.");
      const btn = mk("button", null, card, "Start"); btn.type = "button";
      on(btn, "click", () => { box.remove(); beginSheet(0); });
      later(() => { if (!dead) btn.focus({ preventScroll: true }); }, 30);
    }

    // ---- one sheet ---------------------------------------------------------------------------------
    function beginSheet(i) {
      si = i; S = SHEETS[i]; found = false; clock = 0; locked = false;
      start = minStart();
      for (const k of Object.keys(dom)) delete dom[k];
      [...page.children].forEach((c) => { if (!c.classList.contains(P + "intro")) c.remove(); });
      const wrap = mk("div", P + "wrap", page);

      // head: the dated caption and the watch
      const head = mk("div", P + "head", wrap);
      const dated = mk("div", P + "dated", head, `${S.year}. ${S.place}.`);
      if (has("hud-caption")) { dated.classList.add(P + "art"); dated.style.backgroundImage = `url("${surl("hud-caption")}")`; }
      dom.watch = mk("div", P + "watch", head); dom.watch.hidden = !S.clock;
      dom.watch.setAttribute("aria-live", "off");

      // photos
      const photos = mk("div", P + "photos", wrap);
      S.photos.forEach((ph, k) => photoPanel(photos, ph, k));

      // the rota sheet
      const box = mk("div", P + "sheetbox", wrap);
      const sheet = mk("div", P + "sheet", box); dom.sheet = sheet;
      const artRota = has("window-rota");
      if (artRota) { const bg = mk("img", P + "bg", sheet); bg.src = url("window-rota"); bg.alt = ""; bg.draggable = false; }
      const grid = mk("div", P + "grid", sheet); dom.grid = grid;
      grid.tabIndex = 0; grid.setAttribute("role", "slider");
      grid.setAttribute("aria-label", "Start time of his route"); grid.setAttribute("aria-valuemin", "0"); grid.setAttribute("aria-valuemax", String(SHEET));
      if (!artRota) drawRotaFallback(grid);
      // a sheet with three zones pastes over the fourth row
      for (let z = S.zones.length; z < 4; z++) {
        const np = mk("div", P + "nopost", grid, "NOT ON HIS ROUTE"); np.style.top = `${z * 25}%`; np.style.height = "25%";
      }
      dom.past = mk("div", P + "past", grid); dom.past.hidden = !S.clock;
      dom.bars = S.bars.map((b) => bar(grid, b, false, false));
      dom.dogs = [];
      dom.route = mk("div", P + "route", grid);
      dom.segs = S.route.map(() => mk("div", P + "seg", dom.route));
      dom.knob = mk("div", P + "knob", dom.route);
      wireDrag(grid);

      // controls
      const ctl = mk("div", P + "ctl", wrap);
      const back = mk("button", null, ctl, "◀ 15s"); back.type = "button"; back.setAttribute("aria-label", "Start 15 seconds earlier");
      const r1 = mk("div", P + "read", ctl); mk("small", null, r1, "START"); dom.start = mk("b", null, r1);
      const fwd = mk("button", null, ctl, "15s ▶"); fwd.type = "button"; fwd.setAttribute("aria-label", "Start 15 seconds later");
      const r2 = mk("div", P + "read", ctl); mk("small", null, r2, "SLACK ON THE SHEET"); dom.slack = mk("b", null, r2); dom.slackBox = r2;
      const go = mk("button", P + "go", ctl, "Confirm start"); go.type = "button"; dom.go = go;
      on(back, "click", () => nudge(-STEP)); on(fwd, "click", () => nudge(STEP)); on(go, "click", confirm);
      dom.ctlButtons = [back, fwd, go];

      // caption strip
      const cap = mk("div", P + "cap", wrap);
      if (has("window-caption")) { cap.classList.add(P + "art"); cap.style.backgroundImage = `url("${surl("window-caption")}")`; }
      dom.capP = mk("p", null, cap); dom.capP.setAttribute("aria-live", "polite"); dom.cap = cap;
      if (has("hud-margin-calm")) { const m = mk("div", P + "margin", wrap); m.style.backgroundImage = `url("${surl("hud-margin-calm")}")`; }

      render();
      say(i === 0
        ? "Two guards, three zones, all on the rota. Fence, yard, door: nine minutes."
        : "Three guards, four zones. Fence, yard, door, stair: ten minutes. The watch is running.");
      if (S.clock) { lastTick = performance.now(); clockTimer = setInterval(tickClock, 250); }
      later(() => { if (!dead && dom.grid) dom.grid.focus({ preventScroll: true }); }, 40);
    }

    function photoPanel(parent, ph, k) {
      const el = mk("div", P + "photo", parent);
      el.style.setProperty("--r", `${[-0.8, 0.6, -0.4][k] || 0}deg`);
      el.setAttribute("aria-label", `Photo ${k + 1}, ${ph.time}`);
      if (has(ph.id)) { const im = mk("img", null, el); im.src = url(ph.id); im.alt = ""; im.draggable = false; }
      else {
        const fb = mk("div", P + "fb", el); mk("b", null, fb, ph.time);
        if (ph.spots.some((s) => s.clue)) { const bowl = mk("i", null, fb); bowl.style.cssText = "left:28%;top:82%;width:14%;height:6%"; }
      }
      // details: invisible buttons, so the keyboard visits the same spots the pointer does
      for (const sp of ph.spots) {
        const b = mk("button", P + "spot", el); b.type = "button";
        b.style.left = `${(sp.x / 480) * 100}%`; b.style.top = `${(sp.y / 360) * 100}%`;
        b.style.width = `${((sp.r * 2) / 480) * 100}%`; b.style.height = `${((sp.r * 2) / 360) * 100}%`;
        b.setAttribute("aria-label", `Photo ${k + 1}, ${ph.time}: a detail`);
        on(b, "click", (e) => { e.stopPropagation(); spot(el, sp); });
      }
      on(el, "click", (e) => { if (locked) return; if (e.target === el || e.target.tagName === "IMG" || e.target.classList.contains(P + "fb")) say(`${ph.time}. Nothing there the rota does not already say.`); });
    }

    function spot(el, sp) {
      if (locked) return;
      const at = (n) => `${n}%`;
      if (sp.clue) {
        const ring = mk("div", P + "ring", el); ring.style.left = at((sp.x / 480) * 100); ring.style.top = at((sp.y / 360) * 100);
        if (has("window-clue-ring")) { const im = mk("img", null, ring); im.src = url("window-clue-ring"); im.alt = ""; }
        else ring.style.cssText += `;border:3px solid ${PEN};border-radius:50%`;
        if (!RM) ring.classList.add(P + "draw");
        if (!found) {
          found = true;
          dom.dogs = S.hidden.map((b) => bar(dom.grid, b, true, !RM));
          dom.grid.insertBefore(dom.route, null);
          say(sp.say + " Added to the rota in pencil.");
          render();
        } else say(sp.say);
        return;
      }
      const t = mk("div", P + "tick", el); t.style.left = at((sp.x / 480) * 100); t.style.top = at((sp.y / 360) * 100);
      say(sp.say);
    }

    function bar(grid, [z, f, t, who], dog, anim) {
      const e = mk("div", P + "bar", grid);
      e.style.left = `${(f * 60 / SHEET) * 100}%`; e.style.width = `${((t - f) * 60 / SHEET) * 100}%`;
      e.style.top = `${z * 25 + 3}%`; e.style.height = `${25 * 0.36}%`;
      if (dog) { e.classList.add(P + "dog"); if (anim) e.classList.add(P + "draw"); }
      else if (has("window-guard-bar")) { e.classList.add(P + "art"); e.style.backgroundImage = `url("${surl("window-guard-bar")}")`; }
      mk("span", null, e, dog ? "DOG" : who);
      return e;
    }

    function drawRotaFallback(grid) {
      mk("div", P + "fh", grid, "ROTA — NIGHT");
      for (let k = 0; k <= 12; k++) {
        const l = mk("div", P + "fl", grid); l.style.left = `${(k / 12) * 100}%`;
        if (k % 3 === 0) { const t = mk("div", P + "ft", grid, k < 12 ? `02:${String(k * 5).padStart(2, "0")}` : "03:00"); t.style.left = `${(k / 12) * 100}%`; }
      }
      ["FENCE", "YARD", "DOOR", "STAIR"].forEach((z, i) => {
        const n = mk("div", P + "fz", grid, z); n.style.top = `${i * 25 + 6}%`;
        const r = mk("div", P + "rowline", grid); r.style.top = `${i * 25 + 23}%`;
      });
    }

    // ---- input ------------------------------------------------------------------------------------
    function setStart(v) {
      const nv = clamp(Math.round(v / STEP) * STEP, minStart(), maxStart());
      if (nv !== start) { start = nv; render(); }
    }
    function nudge(d) { if (!locked) setStart(start + d); }
    function wireDrag(grid) {
      let grab = null;
      const tAt = (e) => { const r = grid.getBoundingClientRect(); return ((e.clientX - r.left) / Math.max(1, r.width)) * SHEET; };
      on(grid, "pointerdown", (e) => {
        if (locked || (e.pointerType === "mouse" && e.button !== 0)) return;
        const t = tAt(e), T = total();
        grab = (t >= start && t <= start + T) ? t - start : T / 2;
        try { grid.setPointerCapture(e.pointerId); } catch { /* fine */ }
        setStart(t - grab);
        grid.focus({ preventScroll: true });
      });
      on(grid, "pointermove", (e) => { if (grab != null && !locked) setStart(tAt(e) - grab); });
      const up = () => { grab = null; };
      on(grid, "pointerup", up); on(grid, "pointercancel", up); on(grid, "lostpointercapture", up);
      on(grid, "keydown", (e) => {
        if (locked) return;
        const big = e.shiftKey ? 60 : STEP;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { nudge(-big); e.preventDefault(); }
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") { nudge(big); e.preventDefault(); }
        else if (e.key === "PageDown") { nudge(-300); e.preventDefault(); }
        else if (e.key === "PageUp") { nudge(300); e.preventDefault(); }
        else if (e.key === "Home") { setStart(minStart()); e.preventDefault(); }
        else if (e.key === "End") { setStart(maxStart()); e.preventDefault(); }
        else if (e.key === "Enter" || e.key === " ") { confirm(); e.preventDefault(); }
      });
    }

    // ---- the watch (depot sheet) -----------------------------------------------------------------
    function tickClock() {
      if (dead || locked || !S.clock) return;
      const now = performance.now(); const dt = Math.min(1, (now - lastTick) / 1000); lastTick = now;
      clock += (dt / S.clock) * 60;
      if (start < minStart()) start = minStart();
      if (minStart() > maxStart()) { clock = SHEET; render(); dawn(); return; }
      render();
    }

    // ---- drawing ----------------------------------------------------------------------------------
    function render() {
      if (!S || !dom.grid) return;
      const segs = segments(), bars = knownBars();
      const { slack, hot } = slackOf(start, bars);
      const artSeg = has("window-segment") && has("window-segment-overlap");
      segs.forEach((s, i) => {
        const e = dom.segs[i];
        const bad = bars.some(([z, f, t]) => z === s.z && s.a < t * 60 && f * 60 < s.b);
        e.style.left = `${(s.a / SHEET) * 100}%`; e.style.width = `${((s.b - s.a) / SHEET) * 100}%`;
        e.style.top = `${s.z * 25 + 13}%`; e.style.height = `${25 * 0.44}%`;
        if (artSeg) { e.classList.remove(P + "nf"); e.style.backgroundImage = `url("${surl(bad ? "window-segment-overlap" : "window-segment")}")`; }
        else { e.classList.add(P + "nf"); e.classList.toggle(P + "red", bad); }
      });
      const all = S.bars.concat(found ? S.hidden : []);
      all.forEach((b, i) => { const el = i < dom.bars.length ? dom.bars[i] : dom.dogs[i - dom.bars.length]; if (el) el.classList.toggle(P + "hot", hot.has(i)); });
      dom.knob.style.left = `${(start / SHEET) * 100}%`;
      dom.start.textContent = fmt(start);
      dom.slack.textContent = slack === 0 ? "NONE" : fmtSlack(slack);
      dom.slackBox.classList.toggle(P + "warn", slack < 90);
      dom.grid.setAttribute("aria-valuenow", String(start));
      dom.grid.setAttribute("aria-valuetext", `Start ${fmt(start)}, slack on the sheet ${slack === 0 ? "none, a segment meets a round" : fmtSlack(slack)}`);
      if (S.clock) {
        const c = Math.min(clock, SHEET);
        dom.past.style.width = `${(c / SHEET) * 100}%`; dom.past.dataset.t = fmtHM(c);
        dom.watch.textContent = `WATCH ${fmt(c)}`;
        dom.watch.classList.toggle(P + "late", minStart() + 120 > maxStart() - 300);
      }
    }

    // ---- captions ---------------------------------------------------------------------------------
    function say(text) {
      if (!dom.capP) return;
      clearInterval(typeTimer);
      if (RM) { dom.capP.textContent = text; return; }
      let n = 0; dom.capP.textContent = "";
      typeTimer = setInterval(() => {
        if (dead || !dom.capP) { clearInterval(typeTimer); return; }
        n = Math.min(text.length, n + 2); dom.capP.textContent = text.slice(0, n);
        if (n >= text.length) clearInterval(typeTimer);
      }, 16);
    }

    // ---- confirm ----------------------------------------------------------------------------------
    function stampOn(word) {
      const id = word === "CLEAR" ? "window-stamp-clear" : "window-stamp-tight";
      const st = mk("div", P + "stamp", dom.sheet);
      if (has(id)) { const im = mk("img", null, st); im.src = url(id); im.alt = word; }
      else { st.classList.add(P + "fbk"); st.textContent = word; st.style.color = word === "CLEAR" ? TYPE : PEN; st.style.borderColor = word === "CLEAR" ? TYPE : PEN; }
      if (!RM) st.classList.add(P + "in");
    }

    function lock() {
      locked = true; clearInterval(clockTimer); clockTimer = 0;
      dom.ctlButtons.forEach((b) => { b.disabled = true; });
      dom.grid.style.cursor = "default";
    }

    function confirm() {
      if (locked) return;
      lock();
      const truth = slackOf(start, S.bars.concat(S.hidden));
      const known = slackOf(start, knownBars());
      const slack = truth.slack, s90 = Math.min(90, slack);
      const pulse = Math.round(20 + (90 - s90) / 3);
      try { api.shared.set("window.slack", s90); api.shared.set("pulse", pulse); } catch { /* storage off */ }
      const surprised = !found && S.hidden.length > 0 && truth.slack < known.slack;
      if (surprised) { dom.dogs = S.hidden.map((b) => bar(dom.grid, b, true, !RM)); found = true; dom.grid.appendChild(dom.route); render(); }
      results.push({ scene: S.scene, start, slack, pulse, surprised, read: found && !surprised });
      try { const best = api.store.get("best", null); if (best == null || slack > best) api.store.set("best", slack); } catch { /* storage off */ }
      stampOn(slack >= 90 ? "CLEAR" : "TIGHT");

      let line;
      if (slack === 0) line = surprised
        ? `${fmt(start)}. The dog round was not on the sheet. A guard in the first panel. Pulse ${pulse}.`
        : `${fmt(start)}. A segment meets a round. A guard in the first panel. Pulse ${pulse}.`;
      else if (slack >= 90) line = `${fmt(start)}. ${fmtSlack(slack)} of slack. He goes in quiet. Pulse ${pulse}.`;
      else line = `${fmt(start)}. ${fmtSlack(slack)} of slack. Close. Pulse ${pulse}.`;
      if (surprised && slack > 0) line = `The dog round was not on the sheet. ` + line;
      say(line);

      const last = si === SHEETS.length - 1 || slack === 0;
      const btn = mk("button", null, dom.cap, last ? "Read the sheet" : "Next sheet: the depot"); btn.type = "button";
      on(btn, "click", () => { btn.remove(); if (last) finish(); else beginSheet(si + 1); });
      later(() => { if (!dead) btn.focus({ preventScroll: true }); }, RM ? 20 : 400);
    }

    function dawn() {
      if (locked) return;
      lock();
      try { api.shared.set("window.slack", 0); api.shared.set("pulse", 50); } catch { /* storage off */ }
      results.push({ scene: S.scene, start: SHEET, slack: 0, pulse: 50, dawn: true });
      stampOn("TIGHT");
      say("03:00. The sheet ran out while he looked. He goes in anyway. Pulse 50.");
      const btn = mk("button", null, dom.cap, "Read the sheet"); btn.type = "button";
      on(btn, "click", () => { btn.remove(); finish(); });
      later(() => { if (!dead) btn.focus({ preventScroll: true }); }, 400);
    }

    function finish() {
      const r = results[results.length - 1];
      const first = results.length > 1 ? `Research floor: ${fmtSlack(results[0].slack)} of slack. ` : "";
      let outcome, text;
      if (r.dawn) { outcome = "lose"; text = `${first}Depot: the watch ran to 03:00 before he chose. The Panel run starts at Pulse 50, with a guard in the first panel.`; }
      else if (r.slack === 0) {
        outcome = "lose";
        text = `${first}${r.scene === "s1_window_1" ? "Research floor" : "Depot"}: ${r.surprised ? "a dog round the rota never posted" : "his route walks into a round"}. TIGHT. The Panel run starts at Pulse 50, with a guard in the first panel.`;
      } else if (r.slack >= 90 && results.length === SHEETS.length) {
        outcome = "win";
        text = `${first}Depot: ${fmtSlack(r.slack)} of slack${r.read ? ", the dog round read from the photo" : ""}. CLEAR. The Panel run starts at Pulse ${r.pulse}.`;
      } else {
        outcome = "done";
        text = `${first}Depot: ${fmtSlack(r.slack)} of slack. In, but close. The Panel run starts at Pulse ${r.pulse}.`;
      }
      api.end({ outcome, text });
    }

    intro();

    return {
      unmount() {
        dead = true;
        clearInterval(clockTimer); clearInterval(typeTimer);
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach((f) => f()); offs.length = 0;
        blobs.forEach((u) => { try { URL.revokeObjectURL(u); } catch { /* fine */ } });
        root.innerHTML = "";
      },
    };
  },
};

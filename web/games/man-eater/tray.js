// Project: Man Eater — The Tray (1D, portioning). Graphic style: Isotype pictograms.
// DESIGN.md section 11.2, cut to one meal: d5_tray. Six pieces, the pill, the broth, Jax beside you,
// the orderly's gaze resting on Fisk for 4 s of every 8, 90 seconds of page time. Each piece can be
// eaten, pocketed in the napkin (holds three), passed to Jax, or left. Hunger 70+ makes pieces creep
// toward the mouth. Effects per item from the table in 11.2. Counted icons in rows are the tally.
//
// Actions: send a piece (mouth, napkin, Jax); push a creeping piece back; cheek the pill and spit it
// later; drink the broth; eat the bread heel Jax slides over (the design's heel, from Jax, mid-meal).
// Phases: the cut; the meal under the gaze; the heel (35 s); the cook's "Eat up." (55 s); collection.
//
// Phase 1 of the accepted development: the cut is yours. The slab is cut where the player puts the
// knife, into 3 to 10 pieces. The orderly counts pieces left, not weight: a coarse cut hides a
// refusal, and each big piece eaten changes more. A piece bigger than a standard sixth will not fold
// into the napkin. One standard piece (a sixth of the slab) carries the effects in the table in 11.2.
// Art (api.art): the Isotype icons (drop zones, tally rows, the tray's extras, the tally man at five
// heights), the orderly's cut-out, the day's chapter card.
import { artKit } from "./kit.js";

const P = { ink: "#1B1D1F", paper: "#ece6d8", steel: "#8A8F93", tray: "#c9ccce", meat: "#5A4F5E", red: "#b4432f", green: "#5E7363", sodium: "#D9A441", bread: "#b98a4e" };
const STD = 6, MIN_CUT = 3, MAX_CUT = 10, BASE_CHANGE = 37, GAZE_ON = 4, CYCLE = 8, MEAL = 90, HEEL_AT = 35, COOK_AT = 55, COLLECT_AT = 78;

const ICON = {
  piece: `<path d="M-16 8L-12-10Q0-16 14-9L16 9Z"/>`,
  pill: `<rect x="-15" y="-7" width="30" height="14" rx="7"/>`,
  eye: `<path d="M-18 0Q0-14 18 0Q0 14-18 0Z"/><circle r="5" fill="${P.paper}"/>`,
  shut: `<path d="M-18 0Q0 10 18 0" fill="none" stroke="currentColor" stroke-width="4"/>`,
  napkin: `<path d="M-16-14H16L-16 14Z"/>`,
  mouth: `<path d="M-18-4Q0 16 18-4Z"/>`,
  man: `<circle cy="-34" r="8"/><path d="M-10-24H10L8-2H-8Z"/><rect x="-8" y="-2" width="6" height="20"/><rect x="2" y="-2" width="6" height="20"/>`,
  bowl: `<circle r="15"/><circle r="10" fill="${P.sodium}"/>`,
  heel: `<path d="M-16 8Q-18-8 0-12Q18-8 16 8Z"/><path d="M-10-2H10" stroke="${P.paper}" stroke-width="2"/>`,
  hand: `<path d="M-14 12V-2H-8V-14H-3V-2H2V-16H7V-2H12V-10H16V12Z"/>`,
};
const svg = (name, fill, size = 28, extra = "") => `<svg width="${name === "man" ? size * 0.62 : size}" height="${size}" viewBox="${name === "man" ? "-12.5 -43 25 62" : "-20 -20 40 40"}" ${extra} aria-hidden="true"><g fill="${fill}" color="${fill}">${ICON[name]}</g></svg>`;

export default {
  mount(root, api) {
    const K = "man-eater-tray-";
    const reduce = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;overflow-x:hidden;background:${P.paper};color:${P.ink};font-family:'Courier Prime','Courier New',monospace;user-select:none;-webkit-user-select:none;background-image:radial-gradient(rgba(27,29,31,.05) 1px,transparent 1.3px);background-size:6px 6px}
      .${K}wrap::after{content:"";position:fixed;inset:0;pointer-events:none;box-shadow:inset 0 0 calc(30px + var(--h,0) * 70px) rgba(180,67,47,calc(var(--h,0) * .45));animation:${K}pulse var(--pr,3s) ease-in-out infinite;z-index:4}
      @keyframes ${K}pulse{0%,100%{opacity:.35}50%{opacity:1}}
      .${K}page{max-width:880px;margin:0 auto;padding:0 16px 24px;display:grid;gap:10px;position:relative}
      .${K}gaze{position:sticky;top:0;z-index:3;margin:0 -16px;padding:8px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;background:${P.paper};border-bottom:3px solid ${P.ink};transition:background .25s,color .25s}
      .${K}gaze.on{background:${P.ink};color:${P.paper}}
      .${K}gaze .who{display:flex;align-items:flex-end;gap:2px}
      .${K}gaze .lbl{font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(15px,3.6vw,20px);letter-spacing:.12em;font-weight:700}
      .${K}gaze .sub{font-size:13px}
      .${K}eyes{display:flex;gap:2px;align-items:center}
      .${K}eyes span{display:inline-grid;place-items:center;width:min(30px,6vw);height:24px;border-bottom:3px solid transparent}
      .${K}eyes span.now{border-bottom-color:currentColor}
      .${K}eyes svg{width:100%;height:auto}
      .${K}tray{position:relative;background:${P.tray};border:3px solid ${P.steel};border-radius:10px;padding:26px 16px 14px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;box-shadow:inset 0 2px 0 rgba(255,255,255,.5),inset 0 0 0 6px rgba(138,143,147,.25);background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 2px,transparent 2px 7px)}
      .${K}tray h5{position:absolute;left:12px;top:6px;margin:0;font-family:'Stardos Stencil',monospace;letter-spacing:.16em;font-size:13px}
      .${K}slab{display:flex;gap:6px;flex-wrap:wrap;min-height:80px;align-items:center;position:relative;touch-action:none}
      .${K}whole{width:min(100%,460px);height:64px;background:${P.meat};border-radius:10px 14px 6px 8px;cursor:crosshair;position:relative;touch-action:none;flex:1 1 260px}
      .${K}whole.none::after{content:"tap where the knife goes";position:absolute;inset:0;display:grid;place-items:center;color:${P.paper};font-size:14px;letter-spacing:.06em;pointer-events:none}
      .${K}whole:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}knife{position:absolute;top:-8px;width:4px;height:80px;background:${P.ink};border-radius:3px;left:0;pointer-events:none;transform:translateX(-2px);opacity:.55}
      .${K}cutline{position:absolute;top:-3px;bottom:-3px;width:3px;background:${P.paper};box-shadow:0 0 0 1px ${P.ink};transform:translateX(-1.5px);pointer-events:none}
      .${K}cutbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;flex-basis:100%}
      .${K}cutbar button{font:inherit;font-weight:700;min-height:40px;min-width:40px;padding:6px 10px;cursor:pointer;font-size:14px;background:${P.paper};color:${P.ink};border:2px solid ${P.ink}}
      .${K}cutbar button.go{background:${P.ink};color:${P.paper}}
      .${K}cutbar button[disabled]{opacity:.35;cursor:not-allowed}
      .${K}cutbar button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}cutbar span{font-size:13px}
      .${K}meat{display:block;height:44px;background:${P.meat};border-radius:7px 10px 5px 6px;box-shadow:inset 0 -5px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.12);margin:3px auto}
      .${K}item.big .${K}meat{box-shadow:inset 0 -5px 0 rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.12),0 0 0 2px ${P.ink}}
      .${K}art{display:block;margin:0 auto}
      .${K}drop img{width:44px;height:44px;display:block;margin:0 auto 2px}
      .${K}row h5 img{width:30px;height:30px;vertical-align:middle;margin-right:6px}
      .${K}who img{height:52px;width:auto;display:block}
      .${K}gaze .gz{width:40px;height:40px;display:block}
      .${K}fman{width:min(52px,16vw);height:auto;aspect-ratio:1;transition:opacity .4s}
      .${K}dv{display:block;width:100%;height:auto;opacity:.8}
      .${K}item{background:none;border:0;padding:2px 4px;cursor:grab;touch-action:none;position:relative;border-radius:6px;font:inherit;color:inherit;transition:transform .15s}
      .${K}item:hover{background:rgba(255,255,255,.35)}
      .${K}item:focus-visible,.${K}item.sel{outline:3px solid ${P.sodium};outline-offset:1px;background:rgba(255,255,255,.45)}
      .${K}item[data-kind=piece]{transform:translateY(calc(var(--d,0) * 30px))}
      .${K}item[data-kind=piece].creep svg{filter:drop-shadow(0 4px 0 rgba(180,67,47,.6))}
      .${K}item small{display:block;font-size:12px}
      .${K}item.arrive{animation:${K}arrive .6s ease-out}
      @keyframes ${K}arrive{0%{transform:translateX(-60px) rotate(-10deg);opacity:0}100%{transform:none;opacity:1}}
      .${K}side{display:flex;gap:10px;align-items:center}
      .${K}clock{width:68px;height:68px}
      .${K}bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:46px}
      .${K}bar button,.${K}intro button{font:inherit;font-weight:700;background:${P.ink};color:${P.paper};border:0;min-height:44px;padding:8px 14px;cursor:pointer;font-size:15px}
      .${K}bar button:hover{background:#3a3d40}
      .${K}bar button[aria-pressed=true]{background:${P.red}}
      .${K}bar button[hidden]{display:none}
      .${K}bar button:focus-visible,.${K}intro button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}msg{font-size:15px;line-height:1.4;flex:1 1 220px;min-width:0}
      .${K}msg.bad{color:${P.red};font-weight:700}
      .${K}drops{display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px}
      .${K}drop{border:2.5px dashed ${P.ink};border-radius:8px;padding:10px 8px;text-align:center;font-family:'Stardos Stencil',monospace;letter-spacing:.12em;font-size:15px;cursor:pointer;min-height:64px;display:grid;place-items:center;align-content:center;gap:2px;background:rgba(255,255,255,.3);transition:background .15s,transform .15s}
      .${K}drop small{font-family:'Courier Prime',monospace;letter-spacing:0;font-size:12px}
      .${K}drop[data-drop=mouth]{border-color:${P.red};color:${P.red};border-radius:30px 30px 60px 60px}
      .${K}drop.can{background:rgba(217,164,65,.25)}
      .${K}drop.hot{background:rgba(217,164,65,.55);transform:scale(1.03)}
      .${K}drop.risky{border-style:solid;box-shadow:inset 0 0 0 3px rgba(180,67,47,.35)}
      .${K}chart{border-top:3px solid ${P.ink};padding-top:6px}
      .${K}chart h4{margin:0 0 4px;font-family:'Stardos Stencil',monospace;letter-spacing:.18em;font-size:13px}
      .${K}row{display:grid;grid-template-columns:100px 1fr auto;align-items:center;gap:10px;min-height:40px;border-bottom:1px solid rgba(27,29,31,.15)}
      .${K}row h5{margin:0;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:13px;letter-spacing:.14em}
      .${K}row .n{font-size:13px;white-space:nowrap}
      .${K}icons{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-end;min-height:30px;min-width:0}
      .${K}slot{opacity:.25}
      .${K}icons .pop{animation:${K}pop .45s ease-out}
      @keyframes ${K}pop{0%{transform:scale(1.8)}100%{transform:scale(1)}}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(236,230,216,.94);z-index:6;padding:16px;overflow:auto}
      .${K}panel{width:min(540px,100%);box-sizing:border-box;border:3px solid ${P.ink};padding:18px 20px;background:${P.paper}}
      .${K}panel .top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.18em;border-bottom:2px solid ${P.ink};padding-bottom:5px;margin-bottom:8px}
      .${K}panel h2{margin:0 0 6px;font-family:'Stardos Stencil',monospace;font-size:clamp(28px,7vw,36px);letter-spacing:.08em;text-transform:uppercase;line-height:1}
      .${K}goal{margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 10px;font-size:14px;line-height:1.45;font-style:italic}
      .${K}key{margin:0 0 12px;display:grid;grid-template-columns:auto 1fr;gap:8px 12px;align-items:center;font-size:14px;line-height:1.3}
      .${K}key dt{display:flex;gap:2px;align-items:center}
      .${K}key dd{margin:0}
      .${K}toast{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:8;font-family:'Stardos Stencil',monospace;font-size:26px;letter-spacing:.12em;padding:8px 16px;border:4px solid currentColor;background:${P.paper};pointer-events:none}
      .${K}toast.in{animation:${K}stamp .5s ease-out}
      @keyframes ${K}stamp{0%{transform:translate(-50%,-50%) scale(1.8) rotate(-8deg);opacity:0}100%{transform:translate(-50%,-50%) rotate(-3deg);opacity:1}}
      .${K}ghost{position:fixed;pointer-events:none;z-index:9;transform:translate(-50%,-50%)}
      @media (max-width:560px){.${K}row{grid-template-columns:76px minmax(0,1fr)}.${K}row .n{grid-column:2;font-size:12px}.${K}tray{grid-template-columns:1fr}.${K}gaze{grid-template-columns:1fr auto}.${K}gaze .who{display:none}.${K}eyes{grid-column:1/-1}}
    </style>
    <div class="${K}page">
      <div class="${K}gaze" aria-live="polite"><div class="who ${K}who">${svg("man", "currentColor", 44)}</div><div><div class="lbl">ORDERLY · LOOKING AWAY</div><div class="sub">4 s of every 8 on you</div></div><div class="${K}eyes"></div></div>
      <div class="${K}tray"><h5>TRAY · DAY 5 · NOON</h5><div class="${K}slab"></div><div class="${K}side"><div class="${K}extras"></div><svg class="${K}clock" viewBox="-34 -34 68 68" aria-label="Time left"><circle r="28" fill="none" stroke="${P.steel}" stroke-width="6" opacity=".35"/><circle class="${K}ring" r="28" fill="none" stroke="${P.ink}" stroke-width="6" stroke-dasharray="175.9" stroke-dashoffset="0" transform="rotate(-90)"/><text class="${K}secs" y="6" text-anchor="middle" font-size="17" font-weight="700" font-family="Courier Prime,monospace" fill="${P.ink}">90</text></svg></div></div>
      <div class="${K}bar"><span class="${K}msg" aria-live="polite">Cut the slab first.</span><span class="${K}cutbar"></span><button type="button" class="${K}cheek" aria-pressed="false" hidden>Cheek (C)</button></div>
      <div class="${K}drops">
        <div class="${K}drop" data-drop="mouth" role="button" tabindex="-1"><img alt="" data-i="icon-mouth" hidden>▼ MOUTH ▼<small>eat · E</small></div>
        <div class="${K}drop" data-drop="napkin" role="button" tabindex="-1"><img alt="" data-i="icon-napkin" hidden>NAPKIN<small>pocket · N</small></div>
        <div class="${K}drop" data-drop="jax" role="button" tabindex="-1"><img alt="" data-i="icon-passed" hidden>JAX<small>pass · J</small></div>
      </div>
      <img class="${K}dv" alt="" hidden>
      <div class="${K}chart"><h4>THE MEAL, COUNTED · 1 ICON = 1 PIECE, DRAWN TO ITS SIZE</h4>
        <div class="${K}row"><h5 data-i="icon-mouth">EATEN</h5><div class="${K}icons" data-c="mouth"></div><span class="n">change +2 a sixth</span></div>
        <div class="${K}row"><h5 data-i="icon-napkin">NAPKIN</h5><div class="${K}icons" data-c="napkin"></div><span class="n">holds 3, none over a sixth</span></div>
        <div class="${K}row"><h5 data-i="icon-passed">TO JAX</h5><div class="${K}icons" data-c="jax"></div><span class="n">trust +5 each</span></div>
        <div class="${K}row"><h5 data-i="icon-left">LEFT</h5><div class="${K}icons" data-c="left"></div><span class="n">+5 suspicion a piece, any size</span></div>
        <div class="${K}row"><h5 data-i="icon-gaze">SEEN</h5><div class="${K}icons" data-c="seen"></div><span class="n">twice, and he stops at your tray</span></div>
        <div class="${K}row"><h5>FISK</h5><div class="${K}icons" data-c="fisk"></div><span class="n ${K}chg">change +0</span></div>
      </div>
    </div>
    <div class="${K}intro"><div class="${K}panel">
      <div class="top"><span>TABLE 3 · SEAT 7</span><span>DAY 5 · NOON</span></div>
      <h2>The Tray</h2>
      <p class="${K}goal">Get through the meal without being seen. How much you eat, and how you cut it, is yours to decide.</p>
      <p class="${K}beat">The orderly stands closer today. Jax is on your right, eating slowly. You are hungry, and the meat will make you hungrier.</p>
      <dl class="${K}key">
        <dt><img alt="" data-i="icon-piece" width="34" height="34" hidden></dt><dd><b>The cut is yours:</b> 3 to 10 pieces. He counts the pieces you leave, not their weight. Big pieces change you more, and do not fit the napkin</dd>
        <dt>${svg("piece", P.meat, 26)}→${svg("mouth", P.red, 26)}</dt><dd>drag a piece to the mouth, the napkin or Jax. Or tap it, then tap where it goes (E, N, J)</dd>
        <dt>${svg("eye", P.red, 26)}</dt><dd>while he looks at you, pocketing or passing is seen. Twice seen and the meal is over</dd>
      </dl>
      <button type="button" data-start>Sit down</button>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const slab = $("slab"), extras = $("extras"), msgEl = $("msg"), cheekBtn = $("cheek"), eyesEl = $("eyes"), intro = $("intro"), gazeEl = $("gaze");
    const col = (c) => wrap.querySelector(`[data-c=${c}]`);

    // ---- state
    const st = { cut: false, t: 0, change: 0, hunger: 74, clarity: 70, strength: 77, susp: 0, seen: 0, pills: 0, eaten: 0, napkin: [], jax: 0, ate: [], gave: [], cheeked: false, pillIn: true, broth: true, spat: false, breaks: 0, heel: false, heelAte: false, beats: {} };
    const pieces = [];
    let cuts = [], knifeAt = 0.5, total = 0;
    const kit = artKit(api);
    const iconUrl = {};
    const r1 = (v) => (Math.round(v * 10) / 10).toString();
    for (const id of ["icon-mouth", "icon-napkin", "icon-passed", "icon-left", "icon-gaze", "icon-piece", "icon-pill", "icon-broth", "icon-heel"]) {
      kit.png(id, 64).then((u) => {
        if (!u) return; iconUrl[id] = u;
        wrap.querySelectorAll(`img[data-i="${id}"]`).forEach((im) => { im.src = u; im.hidden = false; if (im.previousElementSibling?.tagName === "svg") im.previousElementSibling.remove(); });
        if (/pill|broth|heel/.test(id) && !drag) renderExtras();
        wrap.querySelectorAll(`h5[data-i="${id}"]`).forEach((h) => { const im = document.createElement("img"); im.alt = ""; im.src = u; h.prepend(im); });
      });
    }
    kit.png("cutout-orderly", 40).then((u) => { if (u) wrap.querySelector("." + K + "who").innerHTML = `<img alt="" src="${u}">`; });
    kit.fill(wrap, "." + K + "dv", "divider-perforation", 860);
    kit.dressIntro(intro, intro.querySelector("." + K + "panel"), "chapter-6", "rgba(236,230,216,.72)");
    const MAN = [178, 218, 258, 298, 338];
    const manFor = (chg) => { const h = 178 + 1.6 * (BASE_CHANGE + chg); return MAN.reduce((b, m) => (Math.abs(m - h) < Math.abs(b - h) ? m : b), MAN[0]); };
    let running = false, over = false, raf = 0, last = 0, cheekHeld = false, sel = null, lastSec = -1, lastCounts = {};
    const timers = [];
    const say = (m, bad) => { msgEl.textContent = m; msgEl.classList.toggle("bad", !!bad); };
    const gazeOn = () => (st.t % CYCLE) >= CYCLE - GAZE_ON;
    function toast(text, color) {
      const t = document.createElement("div"); t.className = K + "toast" + (reduce ? "" : " in"); t.textContent = text; t.style.color = color; wrap.appendChild(t);
      timers.push(setTimeout(() => t.remove(), 1000));
    }

    function renderEyes() {
      const sec = Math.floor(st.t % CYCLE);
      if (sec === lastSec && running) return;
      lastSec = sec;
      const on = gazeOn();
      gazeEl.classList.toggle("on", on);
      const left = on ? CYCLE - sec : CYCLE - GAZE_ON - sec;
      gazeEl.querySelector(".lbl").textContent = on ? `WATCHING YOU · ${left} s` : `LOOKING AWAY · ${left} s`;
      gazeEl.querySelector(".sub").textContent = on ? "Eat, or wait. Do not pocket or pass." : left <= 1 ? "He is turning back." : "Pocket, pass or spit now.";
      eyesEl.innerHTML = Array.from({ length: CYCLE }, (_, i) => {
        const look = i >= CYCLE - GAZE_ON;
        return `<span class="${i === sec ? "now" : ""}" style="opacity:${i === sec ? 1 : 0.45}">${svg(look ? "eye" : "shut", on ? (look ? P.red : P.paper) : (look ? P.red : P.ink), 30)}</span>`;
      }).join("");
      // the risky drops are marked while he watches
      wrap.querySelectorAll(`.${K}drop[data-drop=napkin],.${K}drop[data-drop=jax]`).forEach((d) => d.classList.toggle("risky", on));
    }
    function renderTally() {
      const slots = (n, of, icon, fill) => Array.from({ length: of }, (_, i) => (i < n ? svg(icon, fill, 26) : `<span class="${K}slot">${svg(icon, P.ink, 26)}</span>`)).join("");
      const sized = (list, fill) => list.map((u) => svg("piece", fill, Math.round(16 + 10 * Math.min(2.4, u)))).join("");
      const put = (c, html, n) => { const el = col(c); el.innerHTML = html; if (lastCounts[c] != null && n > lastCounts[c] && !reduce) el.querySelectorAll("svg")[n - 1]?.classList.add("pop"); lastCounts[c] = n; };
      put("mouth", sized(st.ate, P.red) + (st.pills ? svg("pill", P.red, 26) : "") + (st.heelAte ? svg("heel", P.bread, 26) : ""), st.eaten);
      put("napkin", slots(st.napkin.length, 3, "napkin", P.meat), st.napkin.length);
      put("jax", sized(st.gave, P.green), st.jax);
      put("left", st.cut ? sized(pieces.map((q) => q.u), P.steel) + `<span style="font-size:13px;align-self:center"> ${pieces.length} of ${total} pieces</span>` : `<span style="font-size:13px">the whole slab</span>`, pieces.length);
      put("seen", slots(st.seen, 2, "eye", P.red), st.seen);
      const m = manFor(st.change), mid = "icon-man-" + m;
      if (kit.has(mid)) {
        // the tally man at five heights, the one nearest Fisk's height inked in
        if (!col("fisk").dataset.m) for (const h of MAN) { if (!kit.has("icon-man-" + h)) continue; const im = kit.img("icon-man-" + h, 52, `${h} cm`, K + "fman"); im.dataset.h = h; col("fisk").appendChild(im); }
        col("fisk").dataset.m = mid;
        col("fisk").querySelectorAll("img").forEach((im) => { im.style.opacity = +im.dataset.h === m ? "1" : ".28"; });
      } else {
        const men = [svg("man", P.ink, 34)];
        for (let i = 1; i <= Math.ceil(st.change / 2); i++) men.push(svg("man", P.ink, 34 + i * 3));
        col("fisk").innerHTML = men.join("");
      }
      $("chg").textContent = `change +${r1(st.change)} · ${Math.round(178 + 1.6 * (BASE_CHANGE + st.change))} cm`;
      wrap.style.setProperty("--h", Math.max(0, (st.hunger - 40) / 60).toFixed(2));
      wrap.style.setProperty("--pr", `${Math.max(0.8, 4 - (st.hunger - 40) / 15)}s`);
    }
    function renderExtras() {
      extras.innerHTML = "";
      if (st.pillIn) extras.appendChild(item("pill", st.cheeked ? "in cheek" : "pill"));
      if (st.broth) extras.appendChild(item("broth", "broth"));
      if (st.heel) { const h = item("heel", "heel"); if (!reduce && !st.beats.heelShown) { h.classList.add("arrive"); st.beats.heelShown = true; } extras.appendChild(h); }
    }
    function item(kind, label, id, u) {
      const b = document.createElement("button");
      b.type = "button"; b.className = K + "item"; b.dataset.kind = kind; if (id != null) b.dataset.id = id;
      const aid = kind === "pill" ? "icon-pill" : kind === "heel" ? "icon-heel" : kind === "broth" ? "icon-broth" : "";
      if (kind === "piece") { b.innerHTML = `<span class="${K}meat" style="width:${Math.round(22 + 34 * u)}px"></span><small>${label}</small>`; b.classList.toggle("big", u > 1.05); }
      else b.innerHTML = (iconUrl[aid] && !(kind === "pill" && st.cheeked) ? `<img class="${K}art" alt="" width="48" height="48" src="${iconUrl[aid]}">` : kind === "pill" ? svg("pill", st.cheeked ? P.red : "#fff", 42, `style="filter:drop-shadow(0 0 1px ${P.ink})"`) : kind === "heel" ? svg("heel", P.bread, 46) : svg("bowl", P.steel, 44)) + `<small>${label}</small>`;
      b.setAttribute("aria-label", kind === "piece" ? `Ration piece, ${u > 1.05 ? "big: " : ""}${r1(u)} sixths of the slab` : kind === "pill" ? (st.cheeked ? "The pill, held in your cheek" : "The pill") : kind === "heel" ? "Bread heel from Jax (tap to eat)" : "Broth (tap to drink)");
      b.addEventListener("pointerdown", startDrag);
      b.addEventListener("click", () => tapItem(b));
      return b;
    }

    // ---- cutting: the knife goes where the player puts it (3 to 10 pieces)
    const cutbar = $("cutbar");
    function makeWhole() {
      slab.innerHTML = `<div class="${K}whole none" role="slider" tabindex="0" aria-label="The ration slab. Tap where the knife goes, or use the arrow keys and Space; Enter serves it" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><div class="${K}knife"></div></div>`;
      const w = slab.firstElementChild;
      w.addEventListener("pointerdown", (e) => { if (!running) return; const r = w.getBoundingClientRect(); knifeAt = (e.clientX - r.left) / r.width; toggleCut(knifeAt); });
      w.addEventListener("pointermove", (e) => { const r = w.getBoundingClientRect(); knifeAt = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); drawKnife(); });
      w.addEventListener("keydown", (e) => {
        if (!running) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { knifeAt = Math.max(0.05, Math.min(0.95, Math.round((knifeAt + (e.key === "ArrowRight" ? 0.05 : -0.05)) * 20) / 20)); drawKnife(); e.preventDefault(); }
        else if (e.key === " ") { toggleCut(knifeAt); e.preventDefault(); }
        else if (e.key === "Enter") { serve(); e.preventDefault(); }
      });
      cutbar.innerHTML = `<span>Even:</span><button type="button" data-even="3">3</button><button type="button" data-even="6">6</button><button type="button" data-even="10">10</button><button type="button" data-clear>Clear</button><button type="button" class="go" data-serve disabled>Serve</button>`;
      cutbar.querySelectorAll("[data-even]").forEach((b) => b.addEventListener("click", () => { if (!running) return; const n = +b.dataset.even; cuts = Array.from({ length: n - 1 }, (_, i) => (i + 1) / n); drawCuts(); }));
      cutbar.querySelector("[data-clear]").addEventListener("click", () => { cuts = []; drawCuts(); });
      cutbar.querySelector("[data-serve]").addEventListener("click", serve);
      drawCuts();
    }
    function drawKnife() { const w = slab.querySelector("." + K + "whole"); if (!w) return; w.querySelector("." + K + "knife").style.left = knifeAt * 100 + "%"; w.setAttribute("aria-valuenow", Math.round(knifeAt * 100)); }
    function toggleCut(at) {
      at = Math.round(at * 40) / 40;
      const near = cuts.findIndex((c) => Math.abs(c - at) < 0.04);
      if (near >= 0) cuts.splice(near, 1);
      else if (at < 0.06 || at > 0.94) return say("Too near the end to cut.");
      else if (cuts.length >= MAX_CUT - 1) return say("Ten pieces is as fine as this knife cuts.");
      else { cuts.push(at); cuts.sort((a, b) => a - b); }
      drawCuts();
    }
    function drawCuts() {
      const w = slab.querySelector("." + K + "whole"); if (!w) return;
      w.querySelectorAll("." + K + "cutline").forEach((x) => x.remove());
      for (const c of cuts) { const l = document.createElement("div"); l.className = K + "cutline"; l.style.left = c * 100 + "%"; w.appendChild(l); }
      w.classList.toggle("none", !cuts.length);
      drawKnife();
      const n = cuts.length + 1, ok = n >= MIN_CUT && n <= MAX_CUT;
      cutbar.querySelector("[data-serve]").disabled = !ok;
      if (running) say(n === 1 ? "Cut the slab: tap where the knife goes (tap a cut again to take it back). 3 to 10 pieces." : `${n} pieces.${ok ? " Serve when it is cut the way you want. He will count what you leave, not weigh it." : ` At least ${MIN_CUT}.`}`);
    }
    function serve() {
      if (st.cut || !running) return;
      const n = cuts.length + 1;
      if (n < MIN_CUT || n > MAX_CUT) return say(`Cut it into ${MIN_CUT} to ${MAX_CUT} pieces first.`);
      st.cut = true; total = n;
      const edges = [0, ...cuts, 1];
      slab.innerHTML = ""; cutbar.innerHTML = "";
      for (let i = 0; i < n; i++) {
        const u = (edges[i + 1] - edges[i]) * STD;
        const el = item("piece", u > 1.05 ? "big" : u < 0.7 ? "small" : "piece", i, u);
        slab.appendChild(el); pieces.push({ id: i, el, u, drift: -i * 0.18 });
      }
      const big = pieces.filter((q) => q.u > 1.05).length;
      say(`${n} pieces${big ? `, ${big} of them bigger than a sixth: those change you more and will not fold into the napkin` : ""}. Eat, pocket, pass or leave each one. The pill and the broth sit beside them.`);
      renderTally();
      pieces[0].el.focus();
    }

    // ---- moving things
    function removePiece(id) { const i = pieces.findIndex((p) => p.id === id); if (i >= 0) { pieces[i].el.remove(); pieces.splice(i, 1); } }
    function seenAct(what) {
      st.seen++; st.susp += 20;
      say(`Seen: ${what}. The orderly writes on the clipboard. Suspicion +20.${st.seen === 1 ? " Once more and he stops at your tray." : ""}`, true);
      toast("SEEN", P.red);
      if (st.seen >= 2) { renderTally(); finish(); return true; }
      return false;
    }
    function send(kind, id, to) {
      if (!running) return;
      if (kind === "broth") { if (to === "mouth") { st.broth = false; st.hunger -= 3; say("Broth, warm and thin. Hunger −3."); renderExtras(); renderTally(); } return; }
      if (kind === "heel") {
        if (to === "mouth") { st.heel = false; st.heelAte = true; st.hunger -= 10; say(`The heel is dry and it is bread. Hunger −10, to ${Math.round(st.hunger)}. ${st.hunger < 70 ? "The pieces stop creeping toward you." : ""}`); toast("BREAD", P.bread); renderExtras(); renderTally(); }
        else if (to === "napkin") { if (st.napkin.length >= 3) return say("The napkin holds three."); st.heel = false; st.napkin.push("heel"); if (gazeOn()) { if (seenAct("pocketing bread")) return; } else say("Bread in the napkin, for tonight."); renderExtras(); renderTally(); }
        else say("It was Jax's to give. He will not take it back.");
        return;
      }
      if (kind === "pill") {
        if (to === "mouth" && !st.cheeked) {
          if (cheekHeld) { st.cheeked = true; say("In your cheek, under the tongue. Spit it into the napkin when he looks away."); }
          else { st.pillIn = false; st.pills++; st.change += 3; st.clarity -= 3; say("Swallowed. Change +3, clarity −3."); }
        } else if (to === "napkin" && st.cheeked) {
          if (st.napkin.length >= 3) return say("The napkin is full.");
          st.pillIn = false; st.cheeked = false; st.napkin.push("pill"); st.spat = true;
          if (gazeOn()) { st.breaks++; if (seenAct("you spat the pill (rule one, seen)")) return; }
          else { say("Spat into the napkin, folded over. He did not see."); toast("UNSEEN", P.green); }
        } else if (to === "napkin") return say("The pill has to go in your mouth first. Hold Cheek, send it to the mouth, then spit it here.");
        else if (to === "jax") return say("Jax shakes his head at the pill.");
        renderExtras(); renderTally();
        if (st.cut && !pieces.length && !st.pillIn && !st.cheeked) finishSoon();
        return;
      }
      const pc = pieces.find((q) => q.id === id); if (!pc) return;
      const u = pc.u;
      if (to === "mouth") {
        removePiece(id); st.eaten++; st.ate.push(u); st.change += 2 * u; st.hunger -= 6 * u; st.clarity -= 2 * u; st.strength += u;
        say(st.eaten === 1 ? `“He didn't enjoy the taste, but he wanted more.” Change +${r1(2 * u)}, hunger −${r1(6 * u)}.` : `Eaten${u > 1.05 ? ", a big one" : ""}. Change +${r1(2 * u)}, hunger −${r1(6 * u)} for now, clarity −${r1(2 * u)}.`);
      } else if (to === "napkin") {
        if (u > 1.05) return say("Too big. Anything over a sixth of the slab will not fold into the napkin: eat it, pass it, or leave it to be counted.", true);
        if (st.napkin.length >= 3) return say("The napkin holds three. Eat it, pass it, or leave it.");
        removePiece(id); st.napkin.push("piece");
        if (gazeOn()) { if (seenAct("pocketing")) return; } else { say("Pocketed. He was looking the other way."); toast("UNSEEN", P.green); }
      } else if (to === "jax") {
        removePiece(id); st.jax++; st.gave.push(u);
        if (gazeOn()) { if (seenAct("passing to Jax")) return; } else { say("Jax eats it, or hides it. Your tray looks cleaner. Jax's trust +5."); toast("PASSED", P.green); }
      }
      renderTally();
      if (!pieces.length && !st.pillIn && !st.cheeked) finishSoon();
    }
    function finishSoon() { say("The tray is clear. You sit with your hands flat on the table."); timers.push(setTimeout(finish, 1200)); }

    function tapItem(b) {
      if (!running || b._dragged) { b._dragged = false; return; }
      const kind = b.dataset.kind, id = b.dataset.id == null ? null : +b.dataset.id;
      if (kind === "broth") return send("broth", null, "mouth");
      if (kind === "piece") { const p = pieces.find((q) => q.id === id); if (p && p.drift > 0.05) { p.drift = Math.min(p.drift, 0); say("Pushed back to the middle of the tray."); } }
      if (kind === "pill" && !st.beats.cheek) { st.beats.cheek = true; cheekBtn.hidden = false; }
      wrap.querySelectorAll("." + K + "item.sel").forEach((x) => x.classList.remove("sel"));
      sel = { kind, id }; b.classList.add("sel");
      wrap.querySelectorAll("." + K + "drop").forEach((d) => d.classList.add("can"));
      if (kind === "pill") say(st.cheeked ? "The pill is in your cheek. Napkin (N) when he looks away." : "NEW · The pill: mouth (E) swallows it. Hold Cheek (C) while it goes in to keep it, and spit it into the napkin later.");
      else if (kind === "heel") say("The heel: mouth (E) eats it now. Napkin (N) keeps it for tonight.");
      else if (!msgEl.textContent.startsWith("Pushed")) say("Now the mouth (E), the napkin (N) or Jax (J).");
    }
    const clearSel = () => { sel = null; wrap.querySelectorAll("." + K + "item.sel").forEach((x) => x.classList.remove("sel")); wrap.querySelectorAll("." + K + "drop").forEach((d) => d.classList.remove("can")); };
    const onDropClick = (e) => { if (!sel) return; const to = e.currentTarget.dataset.drop; const s2 = sel; clearSel(); send(s2.kind, s2.id, to); };
    const drops = [...wrap.querySelectorAll("." + K + "drop")];
    drops.forEach((d) => d.addEventListener("click", onDropClick));

    let drag = null;
    function startDrag(e) {
      if (!running) return;
      const b = e.currentTarget;
      if (b.dataset.kind === "broth") return;
      drag = { b, x: e.clientX, y: e.clientY, ghost: null, id: e.pointerId };
      try { b.setPointerCapture(e.pointerId); } catch { /* ok */ }
      b.addEventListener("pointermove", moveDrag); b.addEventListener("pointerup", endDrag); b.addEventListener("pointercancel", endDrag);
    }
    function moveDrag(e) {
      if (!drag) return;
      if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.ghost = document.createElement("div"); drag.ghost.className = K + "ghost"; drag.ghost.innerHTML = drag.b.firstElementChild.outerHTML; wrap.appendChild(drag.ghost);
        if (drag.b.dataset.kind === "piece") { const p = pieces.find((q) => q.id === +drag.b.dataset.id); if (p) p.drift = 0; }
        drops.forEach((d) => d.classList.add("can"));
      }
      if (drag.ghost) {
        drag.ghost.style.left = e.clientX + "px"; drag.ghost.style.top = e.clientY + "px";
        const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-drop]");
        drops.forEach((d) => d.classList.toggle("hot", d === t));
      }
    }
    function endDrag(e) {
      if (!drag) return;
      const { b, ghost } = drag; drag = null;
      b.removeEventListener("pointermove", moveDrag); b.removeEventListener("pointerup", endDrag); b.removeEventListener("pointercancel", endDrag);
      drops.forEach((d) => d.classList.remove("hot", "can"));
      if (!ghost) return;
      ghost.remove(); b._dragged = true;
      const t = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-drop]");
      if (t) send(b.dataset.kind, b.dataset.id == null ? null : +b.dataset.id, t.dataset.drop);
    }

    // ---- the clock
    function tick(now) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      st.t += dt;
      // the meal's beats
      if (st.t >= HEEL_AT && !st.beats.heel) { st.beats.heel = true; st.heel = true; renderExtras(); say("NEW · Jax slides a heel of bread under the rim of your tray without looking at you. Bread quiets hunger and changes nothing. Tap it to eat it."); }
      if (st.t >= COOK_AT && !st.beats.cook) { st.beats.cook = true; say("The cook, from the hatch, to the whole room: “Eat up.” Nobody answers him."); }
      if (st.t >= COLLECT_AT && !st.beats.collect) { st.beats.collect = true; say("Trays are being collected from the far end of the table. Whatever is left on yours, he will count."); }
      // hunger pulls: at 70 or more, pieces creep toward the mouth
      if (st.cut && st.hunger >= 70) {
        for (const p of pieces.slice()) {
          p.drift += dt / 22;
          p.el.style.setProperty("--d", Math.max(0, p.drift).toFixed(3));
          p.el.classList.toggle("creep", p.drift > 0.3);
          if (p.drift > 0.3 && !st.beats.creep) { st.beats.creep = true; say("NEW · A piece is creeping toward your mouth. Tap it to push it back to the middle of the tray."); }
          if (p.drift >= 1) { const u = p.u; send("piece", p.id, "mouth"); say(`A piece was in your mouth before you decided. Change +${r1(2 * u)}.`, true); toast("EATEN", P.red); if (!running) return; }
        }
      } else for (const p of pieces) { p.el.style.setProperty("--d", "0"); p.el.classList.remove("creep"); }
      const left = Math.max(0, MEAL - st.t);
      wrap.querySelector("." + K + "ring").setAttribute("stroke-dashoffset", (175.9 * (1 - left / MEAL)).toFixed(1));
      wrap.querySelector("." + K + "ring").setAttribute("stroke", left < 15 ? P.red : P.ink);
      wrap.querySelector("." + K + "secs").textContent = Math.ceil(left);
      renderEyes();
      if (left <= 0) return finish();
      raf = requestAnimationFrame(tick);
    }
    function finish() {
      if (over) return;
      over = true; running = false; cancelAnimationFrame(raf);
      const leftN = pieces.length;
      st.susp += leftN * 5;
      if (st.cheeked) { st.pills++; st.change += 3; st.clarity -= 3; st.cheeked = false; }
      // a pill still in its paper cup is swallowed at the collection, under the orderly's eye
      let forced = false;
      if (st.pillIn && !st.spat) { st.pillIn = false; st.pills++; st.change += 3; st.clarity -= 3; forced = true; }
      renderTally();
      st.change = Math.round(st.change * 10) / 10; st.hunger = Math.round(st.hunger); st.clarity = Math.round(st.clarity);
      const ateU = st.ate.reduce((a, b) => a + b, 0);
      const ledger = `Cut into ${total || 1}. Eaten ${st.eaten} (${r1(ateU)} sixths of the slab), napkin ${st.napkin.length}, to Jax ${st.jax}, left ${leftN}. Pill ${forced ? "swallowed at the collection, while he watched" : st.pills ? "swallowed" : st.spat ? "cheeked and spat" : "left in its cup"}. Change +${st.change}, hunger ${st.hunger}, clarity ${st.clarity}, suspicion +${st.susp}.`;
      if (st.seen >= 2) {
        api.store.set("losses", losses + 1);
        return kit.endCard(wrap, { card: "icon-gaze", stamp: "stamp-hold", caption: "TABLE 3 · SEAT 7 · SEEN TWICE" }, { outcome: "lose", text: `The orderly stops at your tray and does not move on. He watches you finish, writes two lines, and the meal is over for you. ${ledger}` });
      }
      api.store.set("losses", 0);
      const who = st.eaten === 0 ? "You ate none of it. Logged as refused; tonight you will be yourself, and hungry." : ateU >= 4.5 ? `You ate ${r1(ateU)} sixths of the slab. Your sleeves are shorter than they were this morning, and you want more.` : `You ate ${r1(ateU)} sixths of it, and kept the rest of yourself back.`;
      const clean = !leftN && !st.seen;
      const leftU = pieces.reduce((a, q) => a + q.u, 0);
      const hid = leftN && leftU / leftN > 1.3 ? ` A coarse cut: he wrote down ${leftN}, and it was ${r1(leftU)} sixths of the slab.` : "";
      kit.endCard(wrap, { card: "icon-man-" + manFor(st.change), caption: `TRAY · DAY 5 · FISK, ${Math.round(178 + 1.6 * (BASE_CHANGE + st.change))} CM` }, { outcome: clean ? "win" : "done", text: `${clean ? "The tray goes back clean and unremarked." : leftN ? `The tray is collected with ${leftN} piece${leftN > 1 ? "s" : ""} on it; the orderly counts them onto the clipboard.` : "The tray is collected; the orderly remembers what he saw."}${hid} ${who} ${ledger}` });
    }

    // ---- keys and the cheek
    const setCheek = (v) => { cheekHeld = v; cheekBtn.setAttribute("aria-pressed", String(v)); if (v) cheekBtn.hidden = false; };
    const onKey = (e) => {
      if (!running) return;
      if (e.key === "c" || e.key === "C") { setCheek(e.type === "keydown"); return; }
      if (e.type !== "keydown" || !sel) return;
      const to = { e: "mouth", E: "mouth", n: "napkin", N: "napkin", j: "jax", J: "jax" }[e.key];
      if (to) { e.preventDefault(); const s2 = sel; clearSel(); send(s2.kind, s2.id, to); }
    };
    window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    const cheekDown = (e) => { e.preventDefault(); setCheek(!cheekHeld); };
    cheekBtn.addEventListener("click", cheekDown);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); running = true; last = performance.now(); drawCuts(); raf = requestAnimationFrame(tick); wrap.querySelector("." + K + "whole")?.focus(); };
    startBtn.addEventListener("click", start);

    makeWhole(); renderExtras(); renderTally(); renderEyes();
    timers.push(setTimeout(() => startBtn.focus(), 30));

    return {
      unmount() {
        running = false; over = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
        window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey);
        cheekBtn.removeEventListener("click", cheekDown);
        kit.dispose();
        wrap.remove();
      },
    };
  },
};

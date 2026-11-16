// Cross-section climb (2D, Geological survey section). DESIGN.md section 10, Mode A, cut to one
// sequence modelled on b3-climb: 2 800 to 4 600 m, a camp halfway where Mara hands over her
// rebreather (gear tier 1 to 2), storm fronts with a 3 s warning, storm rock, low gravity above
// 4 000 m. The design has no game over; here a third black-out ends the climb so it can be lost.
//
// Actions: move and jump (the climb), anchor at a ring (the defence against a front), and at the two
// reading stations either a hand reading (hold still 3 s while air drains) or the relay beacon
// (instant, never verified). DESIGN 10 names the instrument at a reading station; DESIGN 12 the relay.
// Phases: the lower section; Mara's camp (rebreather); above 4 000 m, low gravity and fronts that
// come faster. After two lost climbs the intro offers Mara's slower pace (air drains 30% less).
// Drawn with the game's art (api.art): Lira and Mara are cut-out sprites (walk, jump, anchor, the still
// kneel of a hand reading), pre-rendered once; the pose plate sits above the legend on wide screens;
// the how-to card opens on the survey sheets, this climb's section marked. The stick figure remains
// as the fallback.
// Phase 2 (DEEP_DIVE section 3): three stages, one sheet each. Teach (Book I, 2 100 to 2 700 m):
// anchor through a front, watch your air; one reading station; the shapes at 2 600 m. Test (Book III,
// 3 700 to 4 500 m): low gravity and storm rock together; sung gaps (after Mara each front carries a
// neume: a note must be anchored through, a rest is a gap to stand in); two core marks (hold still
// 4 s while air drains). Twist (the escape from the city): the sheet has been redacted. Inside a
// black bar the lamps cannot see you and you cannot see the ledges; dust falling on the 7-second
// period outlines them for one beat. There are no rings: standing in the open, the old safe move,
// is how you are seen. Layer links: bars ruled at the Excision Desk (Journal Audit) decide which
// strata are black here; the wolf couplet (The Key) changes what the shapes at 2 600 m are; cores
// drilled here add true lines to the Assay's reference card.
import { runStages } from "./_stages.js";
import { again } from "./_bars.js";
const P = "lira-calyx-cross-section-climb-";
const INK = "#3b2618", PAPER = "#f1e8d2", SEAL = "#b3212b", CYAN = "#3fc4d0", VIOLET = "#5a3f7a", SLATE = "#56606a", OCHRE = "#c8913a";
const LW = 640, S = 2.4; // logical px per metre of altitude
const fmtM = (m) => `${Math.round(m).toLocaleString("en").replace(",", " ")} m`;
const STG = [
  { a0: 2100, a1: 2700, tier: 0, sheet: "section-b1-climb", no: 1, book: "BOOK I", legend: "Book I climb, 2 100–2 700 m", base: "Hollin, upper stair", goal: "Aether-Vine ridge, 2 700 m",
    camps: [{ alt: 2400, name: "Joren's cairn", x: 150, w: 360, anchor: 440 }], stations: [{ alt: 2620, name: "Vine-sighting compass" }], front: [16, 10], rock: 9999 },
  { a0: 3700, a1: 4500, tier: 2, sheet: "section-b3-climb", no: 3, book: "BOOK III", legend: "Book III climb, 3 700–4 500 m", base: "Mara's camp", goal: "Summit camp, 4 500 m",
    camps: [{ alt: 4180, name: "High camp", x: 220, w: 300, anchor: 250 }], stations: [{ alt: 3900, name: "Core mark: crystal vein", core: true }, { alt: 4330, name: "Core mark: ice schist", core: true }], front: [13, 9], rock: 3760 },
  { a0: 1400, a1: 2000, tier: 2, sheet: "section-b3-escape", no: 4, book: "BOOK III", legend: "The escape, 1 400–2 000 m", base: "Record gallery", goal: "Shaft mouth, 2 000 m",
    camps: [{ alt: 1745, name: "Pump niche", x: 170, w: 300, anchor: null }], stations: [], front: null, rock: 9999, noRings: true },
];
// the twist: four strata of the sheet that a bar can lie on (metres), one per line of the Excision Desk page
const SLOTS = [[1470, 1560], [1620, 1710], [1790, 1880], [1920, 1985]];

function mountStage(root, api, stage) {
  {
    const G = STG[stage], ALT0 = G.a0, ALT1 = G.a1;
    const WORLD_H = (ALT1 - ALT0) * S, TOP = 60, BASE = TOP + WORLD_H;
    const yOf = (alt) => BASE - (alt - ALT0) * S;
    const altOf = (y) => ALT0 + (BASE - y) / S;
    const off = [], timers = [];
    let raf = 0, alive = true;
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const later = (f, ms) => { const id = setTimeout(f, ms); timers.push(id); return id; };
    const RM = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const TWO = again(api); // a later reading of the book (phase 3): she knows what the relay is
    root.style.background = PAPER;
    const style = document.createElement("style");
    style.textContent = `
      .${P}wrap{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;color:${INK}}
      .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
      .${P}hud{position:absolute;left:10px;top:8px;right:10px;max-width:560px;z-index:3;background:rgba(246,239,220,.95);border:1.5px solid ${INK};
        box-shadow:3px 3px 0 rgba(59,38,24,.18);padding:6px 10px 7px;font:700 13px 'Courier Prime',monospace;letter-spacing:.04em;pointer-events:none}
      .${P}hud .r1{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .${P}air{flex:1 1 140px;min-width:110px;height:14px;border:1.5px solid ${INK};position:relative;background:repeating-linear-gradient(90deg,transparent 0 9.6%,rgba(59,38,24,.35) 9.6% 10%)}
      .${P}air i{position:absolute;left:0;top:0;bottom:0;background:${CYAN};transition:background .3s}
      .${P}air.low i{background:${SEAL};animation:${P}pulse .7s steps(2) infinite}
      @keyframes ${P}pulse{50%{opacity:.45}}
      .${P}hud .r2{display:flex;gap:6px 14px;flex-wrap:wrap;margin-top:4px;font-weight:400}
      .${P}hud .r2 b{font-weight:700}
      .${P}hud .anc{color:${SEAL}}
      .${P}hud .storm{color:#fff;background:${SLATE};padding:0 6px}
      .${P}msg{position:absolute;left:50%;top:84px;transform:translateX(-50%);z-index:3;max-width:min(560px,calc(100% - 24px));width:max-content;
        background:#f6efdc;border:1.5px solid ${INK};padding:7px 14px;font:italic 16px/1.35 'IM Fell English',Georgia,serif;text-align:center;
        pointer-events:none;transition:opacity .3s;box-shadow:3px 3px 0 rgba(59,38,24,.18)}
      .${P}msg.voice{border-left:5px solid ${OCHRE};text-align:left}
      .${P}msg.bad{border-color:${SEAL};color:${SEAL}}
      .${P}pad{position:absolute;bottom:12px;display:flex;gap:8px;z-index:3}
      .${P}pad.l{left:12px}.${P}pad.r{right:12px}
      .${P}pad button{font:700 14px 'Courier Prime',monospace;color:${INK};background:rgba(241,232,210,.92);border:1.5px solid ${INK};
        min-width:58px;height:54px;border-radius:4px;touch-action:none;cursor:pointer;letter-spacing:.06em;padding:0 10px}
      .${P}pad button:hover{background:#fff8e6}
      .${P}pad button.on{background:${INK};color:${PAPER}}
      .${P}pad button.st{border-color:${VIOLET};color:${VIOLET}}
      .${P}pad button[hidden]{display:none}
      .${P}flash{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .5s}
      .${P}card img.bd{display:block;width:100%;height:auto;border:1px solid ${INK};margin-bottom:6px}
      .${P}card .sheets{display:flex;gap:4px;align-items:center;margin-bottom:8px;font:700 11px 'Courier Prime',monospace;letter-spacing:.1em}
      .${P}card .sheets img{width:17%;height:auto;border:1px solid ${INK};opacity:.45}.${P}card .sheets img.on{opacity:1;outline:2px solid ${SEAL}}
      .${P}card .sheets span{margin-left:auto;white-space:nowrap}
      @media (max-height:700px){.${P}card img.bd{display:none}}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(241,232,210,.86);z-index:5;padding:14px;overflow:auto}
      .${P}card{width:min(470px,100%);background:#f6efdc;border:2px solid ${INK};color:${INK};box-shadow:5px 5px 0 rgba(59,38,24,.22)}
      .${P}card .tb{display:flex;justify-content:space-between;border-bottom:1.5px solid ${INK};font:700 12px 'Courier Prime',monospace;letter-spacing:.12em;padding:6px 12px;
        background:repeating-linear-gradient(135deg,rgba(200,145,58,.25) 0 6px,transparent 6px 12px)}
      .${P}card .in{padding:12px 16px 14px}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:0 0 4px}
      .${P}card .goal{font:italic 16px/1.4 'IM Fell English',Georgia,serif;margin:0 0 10px}
      .${P}card table{width:100%;border-collapse:collapse;font:15px/1.3 Georgia,serif;margin:0 0 10px}
      .${P}card td{border-top:1px solid rgba(59,38,24,.3);padding:5px 4px;vertical-align:top}
      .${P}card td:first-child{white-space:nowrap;font:700 13px 'Courier Prime',monospace;width:1%;padding-right:10px}
      .${P}card .note{font:14px/1.4 Georgia,serif;margin:0 0 10px;opacity:.85}
      .${P}card label{display:flex;gap:8px;align-items:center;font:15px Georgia,serif;margin:0 0 10px;color:${VIOLET}}
      .${P}card button{font:700 15px 'Courier Prime',monospace;background:${INK};color:${PAPER};border:0;padding:11px 22px;cursor:pointer;letter-spacing:.1em}
      .${P}card button:hover,.${P}card button:focus-visible{background:${SEAL}}
    `;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    const cv = document.createElement("canvas");
    wrap.append(style, cv);
    const flashEl = document.createElement("div"); flashEl.className = P + "flash"; wrap.appendChild(flashEl);
    const hud = document.createElement("div"); hud.className = P + "hud";
    hud.innerHTML = `<div class="r1"><span>AIR</span><span class="${P}air"><i></i></span><span class="a"></span></div><div class="r2"></div>`;
    wrap.appendChild(hud);
    const msgEl = document.createElement("div"); msgEl.className = P + "msg"; msgEl.style.opacity = 0; msgEl.setAttribute("aria-live", "polite"); wrap.appendChild(msgEl);
    const padL = document.createElement("div"); padL.className = P + "pad l";
    const padR = document.createElement("div"); padR.className = P + "pad r";
    const mk = (pad, label, key, aria) => { const b = document.createElement("button"); b.type = "button"; b.textContent = label; b.dataset.k = key; b.setAttribute("aria-label", aria); pad.appendChild(b); return b; };
    const btns = [mk(padL, "◀", "left", "Move left"), mk(padL, "▶", "right", "Move right"), mk(padR, "ANCHOR", "anchor", "Hold to anchor"), mk(padR, "JUMP", "jump", "Jump")];
    const readBtn = mk(padR, "READ", "read", "Hold for a hand reading"); readBtn.classList.add("st"); readBtn.hidden = true;
    const relayBtn = mk(padR, TWO ? "RELAY ✕" : "RELAY", "relay", TWO ? "Take the relay beacon's number, knowing it is theirs" : "Take the relay beacon's number"); relayBtn.classList.add("st"); relayBtn.hidden = true;
    padR.prepend(readBtn, relayBtn);
    wrap.append(padL, padR);
    root.appendChild(wrap);
    const ctx = cv.getContext("2d");
    // ---- art: each image decoded once and pre-rendered into an offscreen canvas at the size it is drawn
    const A = api.art || { has: () => false, url: () => "", img: async () => null };
    const SPR = {}, PLATE = {};
    const bake = (img, w, h, flip) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); if (flip) { g.translate(w, 0); g.scale(-1, 1); } g.drawImage(img, 0, 0, w, h); return c; };
    ["stand", "walk", "walk-2", "jump", "anchor", "drill"].forEach((k) => A.img("spr-lira-" + k).then((im) => { if (im && alive) SPR[k] = [bake(im, 132, 165), bake(im, 132, 165, true)]; }).catch(() => {}));
    A.img("fig-wolf").then((im) => { if (im && alive) SPR.wolf = [bake(im, 120, 160), bake(im, 120, 160, true)]; }).catch(() => {});
    ["punctum", "rest"].forEach((k) => A.img("neume-" + k).then((im) => { if (im && alive) SPR["n-" + k] = bake(im, 96, 96); }).catch(() => {}));
    A.img("spr-mara").then((im) => { if (im && alive) SPR.mara = [bake(im, 132, 165, true)]; }).catch(() => {});
    [["stand", "fig-lira-stand"], ["walk", "fig-lira-walk"], ["jump", "fig-lira-jump"], ["anchor", "fig-lira-anchor"], ["drill", "fig-lira-drill"], ["climb", "fig-lira-climb"]].forEach(([k, id]) => A.img(id).then((im) => { if (im && alive) PLATE[k] = bake(im, 240, 320); }).catch(() => {}));

    // ---- strata patterns (after the pictograph's survey hatching)
    const pat = (bg, draw, size = 16) => {
      const c = document.createElement("canvas"); c.width = c.height = size;
      const g = c.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, size, size); g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 1; draw(g, size);
      return ctx.createPattern(c, "repeat");
    };
    const PATS = [
      ["Moss terrace", "#7c8a6a", pat("#7c8a6a", (g) => { g.beginPath(); g.moveTo(0, 4); g.lineTo(16, 4); g.moveTo(0, 12); g.lineTo(16, 12); g.moveTo(8, 4); g.lineTo(8, 12); g.moveTo(4, 0); g.lineTo(4, 4); g.moveTo(12, 12); g.lineTo(12, 16); g.stroke(); })],
      ["Slate", "#8d969c", pat("#8d969c", (g) => { g.lineWidth = 1.4; g.beginPath(); g.moveTo(1, 5); g.lineTo(8, 5); g.moveTo(10, 13); g.lineTo(15, 13); g.stroke(); })],
      ["Rust breccia", "#b56a3f", pat("#b56a3f", (g) => { g.beginPath(); g.moveTo(3, 3); g.lineTo(7, 7); g.moveTo(7, 3); g.lineTo(3, 7); g.moveTo(11, 11); g.lineTo(15, 15); g.moveTo(15, 11); g.lineTo(11, 15); g.stroke(); })],
      ["Ochre sandstone", "#c8913a", pat("#c8913a", (g) => { g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 10); g.lineTo(10, 0); g.stroke(); }, 10)],
      ["Crystal vein", "#6e7f8f", pat("#6e7f8f", (g) => { g.strokeStyle = "#b9d8ea"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 8); g.quadraticCurveTo(4, 3, 8, 8); g.quadraticCurveTo(12, 13, 16, 8); g.stroke(); })],
      ["Ice schist", "#9aa9ae", pat("#9aa9ae", (g) => { g.lineWidth = 0.9; g.beginPath(); g.moveTo(8, 2); g.lineTo(13, 8); g.lineTo(8, 14); g.lineTo(3, 8); g.closePath(); g.stroke(); })],
    ];
    const BAND = 118;
    // paper grain, drawn once
    const grain = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"); const r = api.rng(7);
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(59,38,24,${r() * 0.07})`; g.fillRect(r() * 128, r() * 128, 1 + r(), 1 + r()); } return ctx.createPattern(c, "repeat"); })();

    // ---- the section: ledges, anchors, storm rock, camps, reading stations
    const rng = api.rng();
    const ledges = [{ x: 48, w: LW - 48, y: BASE, camp: G.base, anchor: null, rock: false }];
    let y = BASE, cx = 300;
    const camps = G.camps.map((c) => ({ ...c })), STATIONS = G.stations;
    let si = 0, ci = 0;
    while (y > yOf(ALT1) + 70) {
      y -= 62 + rng() * 16;
      const alt = altOf(y);
      if (ci < camps.length && alt >= camps[ci].alt) {
        const c = camps[ci++];
        ledges.push({ x: c.x, w: c.w, y, camp: c.name, anchor: c.anchor, rock: false });
        cx = c.x + c.w / 2; continue;
      }
      cx = Math.max(110, Math.min(LW - 80, cx + (rng() < 0.5 ? -1 : 1) * (60 + rng() * 100)));
      const w = 74 + rng() * 54;
      const L = { x: Math.max(56, cx - w / 2), w, y, camp: null, anchor: null, rock: false };
      if (si < STATIONS.length && alt >= STATIONS[si].alt) { L.station = { ...STATIONS[si], done: null, prog: 0 }; L.w = Math.max(L.w, 110); L.anchor = G.noRings ? null : L.x + L.w - 18; si++; }
      else if (alt > G.rock && rng() < 0.28 && !ledges[ledges.length - 1].rock) L.rock = true;
      else if (!G.noRings && rng() < (stage === 0 ? 0.6 : 0.42)) L.anchor = L.x + 14 + rng() * (L.w - 28);
      ledges.push(L);
    }
    ledges.push({ x: 160, w: 340, y: yOf(ALT1), camp: G.goal, anchor: G.noRings ? null : 200, rock: false, goal: true });
    ledges.forEach((L, i) => { L.i = i; L.state = 0; L.t = 0; });
    // layer link 3 (The Key -> here): what lives at 2 600 m
    const wolfKey = api.shared.get("wolf", null), wolves = [];
    if (stage === 0) {
      const at = ledges.filter((L) => !L.camp && !L.station && altOf(L.y) > 2520 && altOf(L.y) < 2680);
      [at[0], at[2]].filter(Boolean).forEach((L, k) => { L.anchor = null; wolves.push({ L, x: L.x + L.w * 0.7, dir: k ? 1 : -1, hit: 0 }); });
      if (wolfKey === "keyed") for (const w of wolves) for (const L of ledges) if (!L.camp && Math.abs(L.i - w.L.i) <= 2 && L !== w.L) L.warm = true;
    }
    // layer link 1 (the Excision Desk -> here): which strata of the sheet are black
    const desk = api.shared.get("desk", null), bars = [];
    if (stage === 2) {
      const mine = desk && desk.played;
      SLOTS.forEach(([a, b], k) => {
        const kind = mine ? (desk.clumsy ? "brushed" : desk.bars.includes(k) ? "ruled" : "word") : ["word", "ruled", "brushed", "ruled"][k];
        if (kind !== "word") { bars.push({ y0: yOf(b), y1: yOf(a), kind, k }); return; }
        // only the word was cut on this line: a patch of black one ledge wide, where a full bar would have covered the stratum
        const mid = (a + b) / 2, L = ledges.filter((q) => !q.camp && altOf(q.y) > a && altOf(q.y) < b).sort((p, q) => Math.abs(altOf(p.y) - mid) - Math.abs(altOf(q.y) - mid))[0];
        if (L) bars.push({ y0: L.y - 80, y1: L.y + 16, x0: L.x - 16, x1: L.x + L.w + 16, kind, k });
      });
    }
    const inBar = (yy, xx = pl.x) => bars.some((b) => yy - 20 >= b.y0 && yy - 20 <= b.y1 && (b.x0 == null || (xx >= b.x0 && xx <= b.x1)));
    const barAt = (yy, xx) => bars.some((b) => yy >= b.y0 && yy <= b.y1 && (b.x0 == null || (xx >= b.x0 && xx <= b.x1)));

    // ---- state
    const pl = { x: 300, y: BASE, vx: 0, vy: 0, ground: ledges[0], anchored: false, fallFrom: BASE, face: 1, walk: 0 };
    const st = { cores: 0, lamp: { next: 8, x: null, warn: 0 }, dust: 7, dustT: 0, seen: 0, air: 100, tier: G.tier, camp: 0, blackouts: 0, best: ALT0, time: 0, storm: { next: G.front ? 9 : 1e9, warn: 0, x: null, hit: false, rest: false }, route: [[pl.x, pl.y]],
      started: false, over: false, gentle: false, readings: [], beats: {}, knock: 0 };
    const keys = { left: false, right: false, jump: false, anchor: false, read: false };
    let msgTimer = 0;
    const say = (m, secs = 3.2, kind = "") => {
      msgEl.textContent = m; msgEl.className = P + "msg" + (kind ? " " + kind : ""); msgEl.style.opacity = 1;
      clearTimeout(msgTimer); msgTimer = later(() => { msgEl.style.opacity = 0; }, secs * 1000);
    };
    const flash = (col) => { flashEl.style.transition = "none"; flashEl.style.background = col; flashEl.style.opacity = RM ? 0.25 : 0.5; requestAnimationFrame(() => { flashEl.style.transition = "opacity .6s"; flashEl.style.opacity = 0; }); };
    const beat = (id, text, secs = 5) => { if (st.beats[id]) return; st.beats[id] = true; say(text, secs, "voice"); };

    const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", ArrowUp: "jump", w: "jump", W: "jump", " ": "jump", ArrowDown: "anchor", s: "anchor", S: "anchor", Shift: "anchor", r: "read", R: "read" };
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      if (e.key === "b" || e.key === "B") { relay(); e.preventDefault(); return; }
      const k = KEYMAP[e.key]; if (k) { keys[k] = true; e.preventDefault(); }
    });
    on(window, "keyup", (e) => { const k = KEYMAP[e.key]; if (k) keys[k] = false; });
    btns.concat([readBtn]).forEach((b) => {
      const k = b.dataset.k;
      on(b, "pointerdown", (e) => { e.preventDefault(); keys[k] = true; b.classList.add("on"); try { b.setPointerCapture(e.pointerId); } catch {} });
      const up = () => { keys[k] = false; b.classList.remove("on"); };
      on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
    });
    on(relayBtn, "click", () => relay());

    // ---- sizing
    let W = 0, H = 0, dpr = 1, sc = 1, ox = 0, camY = BASE - 400, camX = 0;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      // on a phone the section is shown larger and follows Lira sideways
      sc = W < 700 ? Math.max(0.82, Math.min(1, H / 640)) : Math.max(Math.min(W / LW, H / 520) * 0.9, Math.min((W - 300) / LW, H / 520, 1.5));
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);

    // ---- helpers
    const lowG = () => stage === 1 && altOf(pl.y) >= 4000;
    const drainRate = (alt) => (stage === 2 ? 1.05 : stage === 0 ? 0.8 : (alt < 3200 ? 1 : 2.1) / (1 + 0.25 * st.tier)) * (st.gentle ? 0.7 : 1) * (pl.ground && pl.ground.warm ? 0 : 1);
    const ledgeBelow = () => {
      let best = 0;
      for (const L of ledges) if (L.y >= pl.y - 1 && (best === 0 || L.y < ledges[best].y) && L.state !== 2) best = L.i;
      return best;
    };
    const placeOn = (L) => { pl.x = L.x + L.w / 2; pl.y = L.y; pl.vx = pl.vy = 0; pl.ground = L; pl.fallFrom = L.y; pl.anchored = false; };
    const station = () => (pl.ground && pl.ground.station && !pl.ground.station.done ? pl.ground.station : null);
    const blackout = (why) => {
      st.blackouts++;
      flash("rgba(20,14,10,.9)");
      if (st.blackouts >= 3) { finish(false, why); return; }
      const camp = ledges[st.camp];
      placeOn(camp); st.air = 100; st.time += 25;
      for (const L of ledges) if (L.station && !L.station.done) L.station.prog = 0;
      say(stage === 2 ? `${why} ${st.blackouts} of 3: you come to at the ${camp.camp.toLowerCase()}, and the boots below are closer.` : `${why} Black-out ${st.blackouts} of 3: you wake at ${camp.camp.toLowerCase()}, 25 s lost.`, 4.5, "bad");
    };
    const relay = () => {
      const s = station(); if (!s || st.over || s.core) return;
      s.done = "relay"; st.readings.push("relay");
      say(TWO ? `${s.name}: she takes the relay's number knowing whose it is, and writes it in pencil with a question mark. It is quick. It is theirs.` : `${s.name}: the relay beacon gives its number at once. You write it down in a smaller hand.`, 4);
      flash("rgba(90,63,122,.35)");
    };
    const finish = (won, why) => {
      if (st.over) return;
      st.over = true;
      const mins = Math.floor(st.time / 60), secs = Math.round(st.time % 60);
      const t = `${mins}:${String(secs).padStart(2, "0")}`;
      const hand = st.readings.filter((r) => r === "hand").length, rel = st.readings.filter((r) => r === "relay").length;
      api.store.set("losses", won ? 0 : losses + 1);
      if (stage === 1 && st.cores) api.shared.set("cores", Math.max(api.shared.get("cores", 0) | 0, st.cores));
      if (won && stage === 0) {
        const rd = hand ? "The vine azimuth is in her own hand, taken still and slow: node N2, and it will hold." : rel ? "The azimuth came from the relay. It was quick, and nobody checked it." : "The station was passed by; the page carries the route and nothing else.";
        const wf = wolfKey === "keyed" ? " Two juvenile Ember Wolves at 2 600 m, exactly where her pencil couplet said they might be." : " Two grey shapes at 2 600 m that the key has no name for.";
        api.end({ outcome: hand ? "win" : "done", text: `The Aether-Vine ridge, 2 700 m, in ${t} with ${st.blackouts} black-out${st.blackouts === 1 ? "" : "s"}. ${rd}${wf} The dotted route stays in the journal as a page.` });
      } else if (won && stage === 1) {
        const cr = st.cores === 2 ? "Two cores in the pack, drilled still while the air ran down: rock nobody has written on. They will stand on the next reference card in her own hand." : st.cores === 1 ? "One core in the pack; the other mark was passed by." : "The core marks were passed by. The next bench will have only the printed card to go on.";
        api.end({ outcome: st.cores === 2 ? "win" : "done", text: `Summit camp, 4 500 m, in ${t} with ${st.blackouts} black-out${st.blackouts === 1 ? "" : "s"}. ${cr} Mara sang the fronts in from below, and the rests in her song were places to stand.` });
      } else if (won) {
        api.end({ outcome: "win", text: `The shaft mouth, in ${t}, seen ${st.seen} time${st.seen === 1 ? "" : "s"}. You climbed through the censor's own bars, blind, counting to seven, with the lamps crossing the white paper on either side. Whoever ruled those lines gave you somewhere to stand. The stolen logs are still against your ribs.` });
      } else {
        api.end({ outcome: "lose", text: stage === 2 ? `${why} A third time, at ${fmtM(st.best)}: hands close on your collar on the open paper. The logs go back down the shaft with you.` : `${why} A third black-out at ${fmtM(st.best)}: the climb is called off and you are walked down on a short rope. The route ends in a broken line.` });
      }
    };

    // ---- physics
    const update = (dt) => {
      st.time += dt;
      const g = lowG() ? 750 : 1500, maxFall = lowG() ? 330 : 660;
      // anchor
      const near = pl.ground && pl.ground.anchor != null && Math.abs(pl.ground.anchor - pl.x) < 30;
      const was = pl.anchored;
      pl.anchored = keys.anchor && !!pl.ground && near;
      if (pl.anchored && !was) flash("rgba(179,33,43,.18)");
      if (keys.anchor && pl.ground && !near && !st.anchorTold) { st.anchorTold = 1.6; say(G.noRings ? "No rings in these shafts. Nothing here holds you but the dark." : pl.ground.anchor == null ? "No anchor ring on this ledge. Rings are marked ○." : "Walk to the ring ○ to clip on.", 1.6); }
      st.anchorTold = Math.max(0, (st.anchorTold || 0) - dt);
      // reading station
      const s = station();
      readBtn.hidden = relayBtn.hidden = !s;
      readBtn.textContent = s && s.core ? "DRILL" : "READ"; if (s && s.core) relayBtn.hidden = true;
      if (s && !st.beats["st" + s.name]) { beat("st" + s.name, s.core ? `${s.name}. Hold DRILL (R) still for 4 s to take a core. Your air drains while you do.` : TWO ? `${s.name}. The relay mast hums beside it. She has read this book before: every number it has given her was poisoned at the source. Hold READ (R) still for 3 s.` : `${s.name}. Hold READ (R) still for 3 s to take it by hand, or press RELAY (B): instant, never verified.`, 5.5); }
      const reading = s && keys.read && !keys.left && !keys.right;
      if (s) {
        if (reading) { s.prog += dt / (s.core ? 4 : 3); if (s.prog >= 1) { s.done = "hand"; st.readings.push("hand"); if (s.core) st.cores++; say(s.core ? `Core ${st.cores} of 2, a finger of ${s.name.split(": ")[1]}, wrapped and labelled. A true line for the next bench.` : `${s.name}: read by hand. The number goes in the journal in her own ink.`, 3.5); flash("rgba(63,196,208,.3)"); } }
        else if (s.prog > 0 && (keys.left || keys.right)) { s.prog = 0; say("You moved: the needle settles again. Start the reading over.", 1.8, "bad"); }
      }
      // move
      const want = reading ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      pl.vx = pl.anchored ? 0 : want * 190;
      if (want) pl.face = want;
      if (keys.jump && pl.ground && !pl.anchored) { pl.vy = -545; pl.ground = null; pl.fallFrom = pl.y; keys.jump = false; }
      if (!pl.ground) pl.vy = Math.min(maxFall, pl.vy + g * dt);
      const ny = pl.y + pl.vy * dt;
      pl.x = Math.max(56, Math.min(LW - 8, pl.x + pl.vx * dt));
      pl.walk += Math.abs(pl.vx) * dt;
      if (pl.ground) {
        if (pl.x < pl.ground.x - 4 || pl.x > pl.ground.x + pl.ground.w + 4 || pl.ground.state === 2) { pl.ground = null; pl.fallFrom = pl.y; pl.vy = 0; }
      } else {
        if (pl.vy < 0) pl.fallFrom = Math.min(pl.fallFrom, ny);
        let landed = null;
        if (pl.vy >= 0) for (const L of ledges) {
          if (L.state === 2) continue;
          if (pl.y <= L.y + 0.5 && ny >= L.y && pl.x >= L.x - 4 && pl.x <= L.x + L.w + 4) { if (!landed || L.y < landed.y) landed = L; }
        }
        if (landed) {
          pl.y = landed.y; pl.vy = 0; pl.ground = landed; st.land = 0.18;
          if (landed.y < st.route[st.route.length - 1][1] - 1) st.route.push([pl.x, landed.y]);
          const drop = landed.y - pl.fallFrom;
          if (drop > 320) { blackout("A long fall."); return; }
          if (landed.rock && landed.state === 0) { landed.state = 1; landed.t = 1.4; say("Storm rock: it flashes twice, then bursts. Move on.", 2, "bad"); }
          if (landed.camp && landed.i > st.camp) {
            st.camp = landed.i; st.air = 100;
            if (landed.goal) { finish(true); return; }
            if (stage === 1) say("High camp: a tarp, a cairn, a tin of chalk. Air refilled. The last stretch is the pale rock above.", 4.5, "voice");
            else if (stage === 0) say("Joren’s cairn, 2 400 m. Air refilled. Above here something has been using the ledges; the moss is worn in a line.", 5, "voice");
            else say("The pump niche. Breath back. The lamps do not reach in here, and the dust comes down the shaft every seven seconds, like a clock.", 5, "voice");
          } else if (landed.camp) st.air = 100;
        } else pl.y = ny;
      }
      if (pl.ground && pl.ground.camp) st.air = 100;
      st.best = Math.max(st.best, altOf(pl.y));
      // progress beats
      if (stage === 1 && st.best > 4000) beat("lowg", "4 000 m. The rock goes pale and shimmers: low gravity. Jumps go twice as high, falls half as fast, and the fronts come quicker.", 5.5);
      if (stage === 1 && st.best > 4380) beat("near", "The summit flag is in sight. Mara’s voice comes up from below, singing the gaps between the gusts.", 4);
      if (stage === 0 && st.best > 2500) beat("shapes", wolfKey === "keyed" ? "2 600 m. Juvenile Ember Wolves, too high, as the pencil couplet says. Their trail is warm: on a ledge they have crossed, your air holds." : "2 600 m. Grey shapes on the ledges ahead, too high for anything the key names. Keep clear of them.", 5.5);
      if (stage === 2 && inBar(pl.y)) beat("dark", "Inside the bar. The lamps cannot find you here, and you cannot find the ledges. Dust falls every 7 s and lies on them for one beat: count.", 6);
      // the shapes at 2 600 m (teach): wolves if the key has a couplet for them, grey shapes if not
      for (const w of wolves) {
        w.x += w.dir * 34 * dt; if (w.x < w.L.x + 14) w.dir = 1; if (w.x > w.L.x + w.L.w - 14) w.dir = -1; w.hit = Math.max(0, w.hit - dt);
        if (wolfKey !== "keyed" && pl.ground === w.L && Math.abs(pl.x - w.x) < 20 && w.hit <= 0) {
          w.hit = 2; const tgt = Math.max(0, w.L.i - 1); placeOn(ledges[tgt]); st.knock = 0.5; flash("rgba(86,96,106,.6)");
          say("A grey shape shoulders you off the ledge: knocked back one. You never keyed what lives this high.", 3, "bad");
        }
      }
      // the lamps and the dust (twist)
      if (stage === 2) {
        st.dust -= dt; st.dustT = Math.max(0, st.dustT - dt);
        if (st.dust <= 0) { st.dust += 7; st.dustT = 1.3; }
        const lp = st.lamp;
        if (lp.x == null) {
          lp.next -= dt;
          if (lp.next <= 3 && !lp.warn) { lp.warn = 1; if (!inBar(pl.y)) say("Lamps swinging up the shaft: 3 s. Get into the black.", 2.6, "bad"); }
          if (lp.next <= 0) { lp.x = -200; lp.hit = false; lp.warn = 0; }
        } else {
          lp.x += 560 * dt;
          if (!lp.hit && lp.x + 90 > pl.x && lp.x - 90 < pl.x) {
            lp.hit = true;
            if (inBar(pl.y) || (pl.ground && pl.ground.camp === "Pump niche")) { beat("unseen", "The lamp crosses the white paper on either side of you and finds nothing to light.", 4); }
            else { st.seen++; st.blackouts++; flash("rgba(255,236,170,.7)");
              if (st.blackouts >= 3) { finish(false, "Seen on the open paper."); return; }
              const tgt = Math.max(0, ledgeBelow() - 2); placeOn(ledges[tgt]); st.knock = 0.5;
              say(`Seen on the open paper: ${st.blackouts} of 3. A shout from below, and you drop two ledges.`, 3, "bad"); }
          }
          if (lp.x > LW + 260) { lp.x = null; lp.next = (st.gentle ? 9 : 6.5) + rng() * 2; }
        }
      }
      // storm rock
      for (const L of ledges) {
        if (L.state === 1) { L.t -= dt; if (L.t <= 0) { L.state = 2; L.t = 4.5; } }
        else if (L.state === 2) { L.t -= dt; if (L.t <= 0) { L.state = 0; } }
      }
      // air (paused while taking a hand reading? no: a hand reading costs breath, that is its price)
      st.air -= drainRate(altOf(pl.y)) * dt;
      if (st.air <= 0) { st.air = 0; blackout("Your air runs out."); return; }
      // weather
      const sm = st.storm;
      if (sm.x == null) {
        sm.next -= dt;
        if (sm.next <= 3 && sm.warn === 0) { sm.warn = 1; sm.rest = stage === 1 && rng() < 0.4;
          say(stage === 1 ? (sm.rest ? "Mara sings the front in, and leaves a rest: a gap. Stand in it, unanchored. Keep climbing." : "Mara sings the front in on a held note: no gap. Walk to a ring ○ and hold ANCHOR.") : "The page edge darkens: storm front in 3 s. Walk to a ring ○ and hold ANCHOR.", 3, sm.rest ? "voice" : "bad"); }
        if (sm.next <= 0) { sm.x = -260; sm.hit = false; sm.warn = 0; }
      } else {
        sm.x += 520 * dt;
        if (!sm.hit && sm.x + 120 > pl.x && sm.x - 120 < pl.x) {
          sm.hit = true;
          if (sm.rest) { beat("gap1", "The front opens round you where she left the rest, and closes behind. A silence in a song is a place.", 4.5); }
          else if (pl.anchored) { say("Clipped on. The front passes over you.", 2); beat("anch1", "In the margin of the route, in her hand: ring held, front passed, 0 m lost.", 4); }
          else {
            const tgt = Math.max(0, ledgeBelow() - 2);
            placeOn(ledges[tgt]); st.knock = 0.5; flash("rgba(86,96,106,.6)");
            const s2 = ledges[tgt]; if (s2) for (const L of ledges) if (L.station && !L.station.done) L.station.prog = 0;
            say("Unanchored in the front: knocked back two ledges.", 2.6, "bad");
          }
        }
        if (sm.x > LW + 300) { sm.x = null; sm.next = (lowG() ? G.front[0] - 3 : G.front[0]) + rng() * G.front[1]; }
      }
      st.land = Math.max(0, (st.land || 0) - dt); st.knock = Math.max(0, st.knock - dt);
    };

    // ---- drawing
    let pose = "stand";
    const draw = (now) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H);
      const viewH = H / sc;
      const target = pl.y - viewH * (W < 700 ? 0.6 : 0.62);
      camY += (target - camY) * 0.12;
      camY = Math.max(TOP - 140, Math.min(BASE + 70 - viewH, camY));
      // horizontal: centre the section, or follow Lira when it is wider than the screen
      const secW = LW * sc, room = W - 40;
      let tx = secW <= room ? 40 + (room - secW) / 2 - (W > 900 ? 120 : 0) : Math.max(W - secW - 6, Math.min(30, W / 2 - pl.x * sc));
      if (W > 900) tx = Math.max(40, tx);
      camX += (tx - camX) * (camX ? 0.15 : 1); ox = camX;
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, -dpr * sc * camY);
      ctx.save(); ctx.beginPath(); ctx.rect(40, camY - 200, LW - 40, viewH + 400); ctx.clip();
      // strata bands, dipping right
      const y0 = camY - 120, y1 = camY + viewH + 140;
      const kStart = Math.floor((y0 - 200) / BAND) - 1, kEnd = Math.ceil((y1 + 200) / BAND) + 1;
      const edge = (k, x) => k * BAND - x * 0.16 + 12 * Math.sin(x / 70 + k * 1.7) + 5 * Math.sin(x / 23 + k);
      for (let k = kStart; k <= kEnd; k++) {
        const pidx = ((k % PATS.length) + PATS.length) % PATS.length;
        ctx.beginPath();
        for (let x = 40; x <= LW + 20; x += 20) ctx.lineTo(x, edge(k, x) + 200);
        for (let x = LW + 20; x >= 40; x -= 20) ctx.lineTo(x, edge(k + 1, x) + 200);
        ctx.closePath();
        ctx.globalAlpha = 0.5; ctx.fillStyle = PATS[pidx][2]; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath();
        for (let x = 40; x <= LW + 20; x += 20) ctx.lineTo(x, edge(k, x) + 200);
        ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
      }
      // altitude grid
      ctx.font = "12px 'Courier Prime', monospace";
      for (let a = ALT0; a <= ALT1; a += 100) {
        const yy = yOf(a); if (yy < y0 || yy > y1) continue;
        ctx.strokeStyle = SLATE; ctx.globalAlpha = 0.45; ctx.lineWidth = 0.6; ctx.setLineDash([2, 6]);
        ctx.beginPath(); ctx.moveTo(48, yy); ctx.lineTo(LW, yy); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        if (a % 200 === 0) { ctx.fillStyle = "rgba(246,239,220,.8)"; ctx.fillRect(LW - 62, yy - 13, 58, 14); ctx.fillStyle = INK; ctx.fillText(fmtM(a), LW - 60, yy - 2); }
      }
      // low gravity
      const lg = yOf(4000);
      if (stage === 1 && lg > y0) {
        ctx.fillStyle = "rgba(90,63,122,0.10)"; ctx.fillRect(48, TOP - 160, LW - 48, lg - TOP + 160);
        ctx.strokeStyle = VIOLET; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(48, lg); ctx.lineTo(LW, lg); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = VIOLET; ctx.font = "700 12px 'Courier Prime', monospace"; ctx.fillText("LOW GRAVITY: JUMP ×2, FALL ×½", 60, lg - 6);
        for (let i = 0; i < 40; i++) {
          const sx = 60 + ((i * 97) % 570), sy = lg - 20 - ((i * 53) % (lg - TOP));
          const tw = RM ? 0.5 : 0.5 + 0.5 * Math.sin(now / 400 + i);
          ctx.globalAlpha = 0.25 + 0.4 * tw; ctx.beginPath(); ctx.arc(sx, sy, 1.4, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // the redaction (twist): black bars across the section; ruled ones have blue under the black
      for (const b of bars) {
        if (b.y1 < y0 || b.y0 > y1) continue;
        ctx.fillStyle = "#141414"; ctx.beginPath();
        if (b.kind === "ruled") { ctx.rect(44, b.y0, LW - 44, b.y1 - b.y0); ctx.fill(); ctx.fillStyle = "#3c5a8c"; ctx.fillRect(40, b.y1, LW - 40, 3); }
        else if (b.kind === "word") { ctx.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.fill(); ctx.fillStyle = "rgba(241,232,210,.5)"; ctx.font = "700 11px 'Courier Prime', monospace"; ctx.fillText(`WORD · C.${b.k + 1}`, b.x0 + 6, b.y0 + 14); continue; }
        else { ctx.moveTo(52, b.y0 + 9); for (let x = 52; x <= LW; x += 28) ctx.lineTo(x, b.y0 + 6 * Math.sin(x / 31 + b.k)); for (let x = LW; x >= 52; x -= 28) ctx.lineTo(x, b.y1 + 7 * Math.sin(x / 23 + b.k * 2)); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = "rgba(241,232,210,.5)"; ctx.font = "700 11px 'Courier Prime', monospace"; ctx.fillText(b.kind === "ruled" ? `RULED · LINE C.${b.k + 1}` : "BRUSHED", 60, b.y0 + 16);
      }
      // ledges
      for (const L of ledges) {
        if (L.y < y0 - 40 || L.y > y1 + 40) continue;
        if (bars.length && !L.camp && barAt(L.y + 4, L.x + L.w / 2)) { // unseen in the black, but for the beat when the dust lies on it
          // the dust lies on the ledge for one beat, then its chalk fades over the next five; the last second before the next fall is dark
          const since = 7 - st.dust - 1.3, after = st.dustT > 0 ? 0 : 0.42 * Math.max(0, 1 - since / 4.6);
          const k = Math.max(st.gentle ? 0.3 : 0, st.dustT / 1.3, after);
          if (k > 0) { ctx.globalAlpha = Math.min(1, k * 1.4); ctx.fillStyle = "#e9e0c8"; for (let x = L.x + 2; x < L.x + L.w; x += 5) ctx.fillRect(x, L.y - 1 - ((x * 7) % 3), 2.4, 2.4); ctx.globalAlpha = 1; }
          continue;
        }
        if (L.warm) { ctx.fillStyle = OCHRE; for (let x = L.x + 12; x < L.x + L.w - 8; x += 22) { ctx.beginPath(); ctx.arc(x, L.y - 4, 2.6, 0, 7); ctx.arc(x + 5, L.y - 8, 1.7, 0, 7); ctx.arc(x - 4, L.y - 8, 1.7, 0, 7); ctx.fill(); } }
        if (L.state === 2) { ctx.strokeStyle = INK; ctx.setLineDash([3, 4]); ctx.strokeRect(L.x, L.y, L.w, 10); ctx.setLineDash([]); continue; }
        const flashOn = L.state === 1 && Math.floor(L.t * 3) % 2 === 0;
        ctx.fillStyle = L.rock ? (flashOn ? "#e8c9c9" : "#a59bb3") : "#f6efdc";
        ctx.fillRect(L.x, L.y, L.w, L.camp ? 14 : 10);
        ctx.strokeStyle = flashOn ? SEAL : INK; ctx.lineWidth = 1.5; ctx.strokeRect(L.x, L.y, L.w, L.camp ? 14 : 10);
        if (L.rock) { ctx.beginPath(); ctx.moveTo(L.x + L.w * 0.3, L.y); ctx.lineTo(L.x + L.w * 0.4, L.y + 6); ctx.lineTo(L.x + L.w * 0.34, L.y + 10); ctx.moveTo(L.x + L.w * 0.7, L.y); ctx.lineTo(L.x + L.w * 0.62, L.y + 10); ctx.lineWidth = 1; ctx.stroke(); }
        if (L.anchor != null) {
          const hot = st.storm.warn || st.storm.x != null;
          ctx.lineWidth = hot ? 2.4 : 1.6; ctx.strokeStyle = hot ? SEAL : INK; ctx.beginPath(); ctx.moveTo(L.anchor, L.y); ctx.lineTo(L.anchor, L.y - 7); ctx.stroke(); ctx.beginPath(); ctx.arc(L.anchor, L.y - 11, hot ? 5 : 4, 0, 7); ctx.stroke();
        }
        if (L.station) {
          const sx = L.x + 18, done = L.station.done;
          ctx.strokeStyle = VIOLET; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx - 8, L.y); ctx.lineTo(sx, L.y - 26); ctx.lineTo(sx + 8, L.y); ctx.moveTo(sx, L.y - 26); ctx.lineTo(sx, L.y); ctx.stroke();
          ctx.fillStyle = done ? (done === "hand" ? CYAN : "#a59bb3") : "#f6efdc"; ctx.fillRect(sx - 9, L.y - 38, 18, 13); ctx.strokeRect(sx - 9, L.y - 38, 18, 13);
          if (!done && L.station.prog > 0) { ctx.fillStyle = CYAN; ctx.fillRect(sx - 9, L.y - 44, 18 * L.station.prog, 4); }
          ctx.fillStyle = VIOLET; ctx.font = "italic 13px 'IM Fell English', Georgia, serif";
          ctx.fillText(done ? (done === "hand" ? "read by hand" : "relay, unverified") : "reading station", sx + 14, L.y - 8);
          if (TWO && !L.station.core) { ctx.fillStyle = SEAL; ctx.font = "700 11px 'Courier Prime', monospace"; ctx.fillText("RELAY: POISONED AT SOURCE", sx + 14, L.y + 22); }
        }
        if (L.camp) {
          const tx2 = L.x + 26; ctx.fillStyle = L.goal ? SEAL : OCHRE;
          ctx.beginPath(); ctx.moveTo(tx2, L.y); ctx.lineTo(tx2 + 14, L.y - 20); ctx.lineTo(tx2 + 28, L.y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(tx2 + 14, L.y - 20); ctx.lineTo(tx2 + 14, L.y - 34); ctx.stroke(); ctx.fillStyle = SEAL; ctx.beginPath(); ctx.moveTo(tx2 + 14, L.y - 34); ctx.lineTo(tx2 + 25, L.y - 30); ctx.lineTo(tx2 + 14, L.y - 26); ctx.fill();
          ctx.fillStyle = INK; ctx.font = "italic 14px 'IM Fell English', Georgia, serif"; ctx.fillText(L.camp, tx2 + 34, L.y - 6);
          if (L.camp === "Mara's camp" && SPR.mara) ctx.drawImage(SPR.mara[0], L.x + L.w - 60 - 22, L.y - 52, 44, 55);
          else if (L.camp === "Mara's camp") { // Mara, a seated figure by her tent
            const mx = L.x + L.w - 60; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, L.y - 26, 4.5, 0, 7); ctx.moveTo(mx, L.y - 21); ctx.lineTo(mx, L.y - 8); ctx.lineTo(mx + 8, L.y - 4); ctx.stroke();
          }
        }
      }
      // the shapes at 2 600 m
      for (const w of wolves) {
        if (wolfKey === "keyed" && SPR.wolf) ctx.drawImage(SPR.wolf[w.dir > 0 ? 0 : 1], w.x - 21, w.L.y - 54, 42, 56);
        else { ctx.fillStyle = wolfKey === "keyed" ? "#9c4a25" : "rgba(86,96,106,.75)"; ctx.beginPath(); ctx.ellipse(w.x, w.L.y - 13, 19, 12, 0, 0, 7); ctx.ellipse(w.x + w.dir * 15, w.L.y - 22, 8, 7, 0, 0, 7); ctx.fill(); if (wolfKey !== "keyed") { ctx.strokeStyle = SLATE; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = INK; ctx.font = "italic 13px 'IM Fell English', Georgia, serif"; ctx.fillText("?", w.x - 3, w.L.y - 32); } }
      }
      // dotted route in journal ink
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.setLineDash([0.5, 6]);
      ctx.beginPath(); st.route.forEach(([x, yy], i) => (i ? ctx.lineTo(x, yy - 3) : ctx.moveTo(x, yy - 3))); ctx.stroke(); ctx.setLineDash([]); ctx.lineCap = "butt";
      // Lira
      const fx = pl.x, fy = pl.y, sw = pl.ground && pl.vx ? Math.sin(pl.walk / 9) * 6 : 0, sq = st.land > 0 && !RM ? 3 : 0;
      if (pl.anchored) { ctx.strokeStyle = SEAL; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(fx, fy - 24); ctx.lineTo(pl.ground.anchor, pl.ground.y - 11); ctx.stroke(); }
      const reading = !!(keys.read && pl.ground && pl.ground.station && !pl.ground.station.done && !pl.vx);
      pose = pl.anchored ? "anchor" : reading ? "drill" : !pl.ground ? "jump" : pl.vx ? (Math.floor(pl.walk / 14) % 2 ? "walk-2" : "walk") : "stand";
      const spr = SPR[pose] || SPR.stand;
      if (bars.length && inBar(pl.y)) { // in the black she is a breath of pale chalk, no more
        ctx.strokeStyle = "rgba(241,232,210,.75)"; ctx.lineWidth = 1.6; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.arc(fx, fy - 24, 13, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(241,232,210,.75)"; ctx.fillRect(fx - 5, fy - 1, 10, 2);
      } else if (spr) {
        if (st.knock > 0) { ctx.strokeStyle = SEAL; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(fx, fy - 24, 26, 0, 7); ctx.stroke(); }
        ctx.drawImage(spr[pl.face < 0 ? 1 : 0], fx - 22, fy - 52 + sq, 44, 55 - sq);
        if (st.tier >= 2) { ctx.fillStyle = CYAN; ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(fx + pl.face * 5, fy - 40 + sq, 3, 0, 7); ctx.fill(); ctx.stroke(); }
      } else {
      ctx.strokeStyle = st.knock > 0 ? SEAL : INK; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(fx, fy - 16 + sq); ctx.lineTo(fx - 5 + sw * 0.6, fy); ctx.moveTo(fx, fy - 16 + sq); ctx.lineTo(fx + 5 - sw * 0.6, fy);
      ctx.moveTo(fx, fy - 16 + sq); ctx.lineTo(fx, fy - 32 + sq);
      ctx.moveTo(fx, fy - 29 + sq); ctx.lineTo(fx + pl.face * 9, fy - (pl.ground ? 21 : 38)); ctx.stroke();
      ctx.fillStyle = st.tier >= 2 ? CYAN : OCHRE; ctx.fillRect(fx - pl.face * 9 - 4, fy - 32 + sq, 8, 13); ctx.strokeRect(fx - pl.face * 9 - 4, fy - 32 + sq, 8, 13);
      ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(fx, fy - 38 + sq, 5, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineCap = "butt";
      }
      // storm front
      const sm = st.storm;
      if (sm.x != null) {
        ctx.fillStyle = "rgba(60,64,72,0.55)"; ctx.fillRect(sm.x - 120, camY - 20, 240, viewH + 40);
        ctx.strokeStyle = "rgba(242,244,245,0.85)"; ctx.lineWidth = 1.4;
        for (let i = 0; i < 14; i++) { const yy = camY + 20 + i * (viewH / 14); ctx.beginPath(); ctx.moveTo(sm.x - 100, yy); ctx.lineTo(sm.x + 70, yy); ctx.lineTo(sm.x + 58, yy - 5); ctx.moveTo(sm.x + 70, yy); ctx.lineTo(sm.x + 58, yy + 5); ctx.stroke(); }
      }
      if (sm.x != null && stage === 1) { const n = SPR[sm.rest ? "n-rest" : "n-punctum"], ny = camY + Math.max(96, viewH * 0.2);
        if (n) { ctx.drawImage(n, sm.x - 30, ny, 60, 60); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(sm.x - 30, ny, 60, 60); }
        if (sm.rest) { ctx.clearRect(0, 0, 0, 0); ctx.fillStyle = "rgba(241,232,210,.55)"; ctx.fillRect(sm.x - 60, camY - 20, 120, viewH + 40); } }
      // the lamps from below (twist)
      const lp = st.lamp;
      if (lp.x != null) { const gr = ctx.createLinearGradient(lp.x - 90, 0, lp.x + 90, 0); gr.addColorStop(0, "rgba(255,236,170,0)"); gr.addColorStop(0.5, "rgba(255,236,170,.6)"); gr.addColorStop(1, "rgba(255,236,170,0)"); ctx.fillStyle = gr;
        ctx.beginPath(); ctx.rect(lp.x - 90, camY - 20, 180, viewH + 40); ctx.fill();
        for (const b of bars) { ctx.fillStyle = "#141414"; const xa = Math.max(b.x0 != null ? b.x0 : 44, lp.x - 90), xb = Math.min(b.x1 != null ? b.x1 : LW, lp.x + 90); if (xb > xa) ctx.fillRect(xa, b.y0 + (b.kind === "brushed" ? 8 : 0), xb - xa, b.y1 - b.y0 - (b.kind === "brushed" ? 14 : 0)); } }
      ctx.restore();
      // section frame
      ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.strokeRect(40, camY - 200, LW - 40, viewH + 400);
      // ---- screen space
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (lp.x == null && lp.next < 3 && stage === 2) {
        const a = Math.min(1, (3 - lp.next) / 3) * 0.6;
        const gr = ctx.createLinearGradient(0, H, 0, H * 0.55); gr.addColorStop(0, `rgba(255,226,150,${a})`); gr.addColorStop(1, "rgba(255,226,150,0)");
        ctx.fillStyle = gr; ctx.fillRect(0, H * 0.55, W, H * 0.45);
      }
      if (sm.x == null && sm.next < 3) {
        const a = Math.min(1, (3 - sm.next) / 3) * 0.75;
        const gr = ctx.createLinearGradient(0, 0, W * 0.4, 0); gr.addColorStop(0, `rgba(20,20,20,${a})`); gr.addColorStop(1, "rgba(20,20,20,0)");
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W * 0.4, H);
      }
      // altitude scale on the left edge
      const sx = 10, sTop = 110, sBot = H - 84, sH = Math.max(40, sBot - sTop);
      ctx.fillStyle = "rgba(246,239,220,.92)"; ctx.fillRect(sx, sTop, 14, sH); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(sx, sTop, 14, sH);
      const fr = (st.best - ALT0) / (ALT1 - ALT0);
      ctx.fillStyle = CYAN; ctx.fillRect(sx + 1, sTop + sH * (1 - fr), 12, sH * fr);
      ctx.font = "12px 'Courier Prime', monospace"; ctx.fillStyle = INK;
      for (let a = ALT0; a <= ALT1; a += 200) { const yy = sTop + sH * (1 - (a - ALT0) / (ALT1 - ALT0)); ctx.beginPath(); ctx.moveTo(sx + 14, yy); ctx.lineTo(sx + 20, yy); ctx.stroke(); if (sH > 220 && W > 700) ctx.fillText(`${(a / 1000).toFixed(1)}k`, sx + 22, yy + 4); }
      for (const L of ledges) if (L.camp || L.station) { const yy = sTop + sH * (1 - (altOf(L.y) - ALT0) / (ALT1 - ALT0)); ctx.fillStyle = L.station ? VIOLET : L.goal ? SEAL : OCHRE; ctx.beginPath(); if (L.station) ctx.rect(sx + 3, yy - 4, 8, 8); else { ctx.moveTo(sx - 2, yy); ctx.lineTo(sx + 7, yy - 9); ctx.lineTo(sx + 16, yy); } ctx.fill(); }
      const cur = sTop + sH * (1 - (altOf(pl.y) - ALT0) / (ALT1 - ALT0)); ctx.fillStyle = SEAL; ctx.beginPath(); ctx.moveTo(sx - 6, cur - 6); ctx.lineTo(sx + 1, cur); ctx.lineTo(sx - 6, cur + 6); ctx.fill();
      // legend block on the right margin (wide screens), as on a survey sheet
      const lx = ox + LW * sc + 18;
      if (W - lx > 220) {
        const lw = Math.min(250, W - lx - 16), ly = Math.max(110, H - 330);
        ctx.fillStyle = "rgba(246,239,220,.95)"; ctx.fillRect(lx, ly, lw, 262); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(lx, ly, lw, 262);
        ctx.fillStyle = INK; ctx.font = "700 13px 'Courier Prime', monospace"; ctx.fillText("SECTION A–A′  LEGEND", lx + 10, ly + 20);
        PATS.forEach(([name, , p], i) => { ctx.fillStyle = p; ctx.fillRect(lx + 10, ly + 32 + i * 24, 26, 16); ctx.strokeStyle = INK; ctx.strokeRect(lx + 10, ly + 32 + i * 24, 26, 16); ctx.fillStyle = INK; ctx.font = "14px Georgia, serif"; ctx.fillText(name, lx + 44, ly + 45 + i * 24); });
        ctx.font = "13px 'Courier Prime', monospace"; ctx.fillStyle = INK;
        ctx.fillText(stage === 2 ? "▬ a bar: unseen, unseeing" : "○ anchor ring   ▲ camp", lx + 10, ly + 196); ctx.fillStyle = VIOLET; ctx.fillText(stage === 2 ? "dust falls every 7 s" : stage === 1 ? "■ core mark" : "■ reading station", lx + 10, ly + 216);
        ctx.fillStyle = INK; ctx.globalAlpha = 0.8; ctx.fillText(G.legend, lx + 10, ly + 244); ctx.globalAlpha = 1;
        const pk = pose === "walk-2" ? "walk" : pose, plate = PLATE[pk] || PLATE.stand;
        if (plate && ly - 186 > 96) { ctx.drawImage(plate, lx, ly - 180, 126, 168); ctx.strokeStyle = INK; ctx.strokeRect(lx, ly - 180, 126, 168); }
      }
      // HUD text
      hudAir.style.width = Math.max(0, st.air) + "%"; hudAirBox.classList.toggle("low", st.air < 25);
      hudA.textContent = `${Math.ceil(st.air)}  −${drainRate(altOf(pl.y)).toFixed(1)}/s`;
      const stormTxt = sm.x != null ? `<span class="storm">FRONT</span>` : sm.next < 3 ? `<span class="storm">FRONT ${Math.ceil(sm.next)} s</span>` : "";
      const lampTxt = stage === 2 ? (lp.x != null ? `<span class="storm">LAMPS</span>` : lp.next < 3 ? `<span class="storm">LAMPS ${Math.ceil(lp.next)} s</span>` : "") : "";
      const r2 = `<span><b>${fmtM(altOf(pl.y))}</b></span>${stage === 2 ? `<span>CAUGHT ${"●".repeat(st.blackouts)}${"○".repeat(3 - st.blackouts)}</span><span>DUST ${st.dustT > 0 ? "NOW" : "●".repeat(Math.max(0, 7 - Math.ceil(st.dust))) + "○".repeat(Math.min(7, Math.ceil(st.dust)))}</span>${inBar(pl.y) ? '<span class="anc">IN THE BLACK</span>' : ""}${lampTxt}` :
        `<span>GEAR ${st.tier}</span><span>BLACK-OUTS ${"●".repeat(st.blackouts)}${"○".repeat(3 - st.blackouts)}</span><span>${stage === 1 ? `CORES ${st.cores}/2` : `READING ${st.readings.length}/1`}</span>${pl.ground && pl.ground.warm ? '<span class="anc">WARM LEDGE</span>' : ""}${pl.anchored ? '<span class="anc">ANCHORED</span>' : ""}${stormTxt}`}`;
      if (r2 !== lastR2) { hudR2.innerHTML = r2; lastR2 = r2; }
    };
    const hudAir = hud.querySelector("i"), hudAirBox = hud.querySelector("." + P + "air"), hudA = hud.querySelector(".a"), hudR2 = hud.querySelector(".r2");
    let lastR2 = "";

    let last = 0;
    const loop = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (st.started && !st.over && !(api.held && api.held())) update(dt);
      draw(now);
      if (!st.over) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ---- how to play: a survey sheet's title block
    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="tb"><span>SECTION A–A′</span><span>${G.book} · ${["TEACH", "TEST", "TWIST"][stage]}</span></div><div class="in">
      ${A.has(G.sheet) ? `<img class="bd" alt="The survey sheet" src="${A.url(G.sheet)}"><div class="sheets" aria-hidden="true">${["section-b1-climb", "section-b2-descent", "section-b3-climb", "section-b3-escape", "section-b4-descent"].filter((id) => A.has(id)).map((id) => `<img alt="" class="${id === G.sheet ? "on" : ""}" src="${A.url(id)}">`).join("")}<span>SHEET ${G.no} OF 5</span></div>` : ""}
      <h2>${["Cross-section climb", "Cross-section climb: the Peaks", "Cross-section climb: the escape"][stage]}</h2>
      <p class="goal">${["Climb from Hollin’s upper stair to the Aether-Vine ridge at 2 700 m before your air gives out three times.", "Climb from Mara’s camp to the summit at 4 500 m, and drill both core marks on the way.", "Climb out of the city with the logs. The survey sheet has been redacted: the black bars are the only place the lamps cannot see."][stage]}</p>
      <table>
        <tr><td>← →  ◀ ▶</td><td>Walk the ledge</td></tr>
        <tr><td>↑ / Space</td><td>Jump to the next ledge</td></tr>
        ${stage === 2 ? `<tr><td>the black</td><td>Inside a bar you are unseen, and the ledges are too. Dust shows them for one beat every 7 s, and its chalk fades over the next five: count the seven dots on the DUST meter and jump while you can still see where</td></tr><tr><td>the lamps</td><td>Be in the black when they sweep. There are no rings down here</td></tr>`
          : `<tr><td>hold ↓  ANCHOR</td><td>Clip on at a ring ○ when the page edge darkens: a storm front</td></tr>`}
        ${stage === 1 ? `<tr><td>her song</td><td>Each front carries a neume: a note, anchor; a rest, a gap you can stand in</td></tr><tr><td>hold R  DRILL</td><td>At a core mark, hold still 4 s. Your air keeps draining</td></tr>` : ""}
      </table>
      <p class="note">${["A reading station near the top gives you a choice when you reach it. Something has been seen on the ledges at 2 600 m.", "Low gravity above 4 000 m: jumps go twice as high. Storm rock flashes twice, then bursts.", "Joren brought the guards. Their lamps come up the shafts every few seconds."][stage]}</p>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle"> ${stage === 2 ? "A little chalk on the ledges: they stay faintly visible in the black, and air drains 30% slower" : "Climb at Mara’s pace: air drains 30% slower"}</label>` : ""}
      <button type="button">Start the climb</button></div></div>`;
    wrap.appendChild(intro);
    const startBtn = intro.querySelector("button");
    on(startBtn, "click", () => {
      const g = intro.querySelector(".gentle"); st.gentle = !!(g && g.checked);
      intro.remove(); st.started = true;
      say(["Hollin’s upper stair, 2 100 m, Book I. The Aether-Vines are on the ridge above, and Joren says the weather comes through in fronts you can see on the page before you feel them.",
        "Mara’s camp, 3 700 m, Book III. Her rebreather is on your back. “I will sing the fronts in from here,” she says. “Listen for where I do not.”",
        "The record gallery, under the city. The logs are inside your coat. Above you the sheet is barred in black, and below you the lamps are starting up the shaft."][stage], 6.5, "voice");
      if (stage === 0 && wolfKey) api.linkNote(wolfKey === "keyed" ? "Because you wrote the upland-wolf couplet in The Key, the shapes at 2 600 m are wolves, and their trail marks warm ledges where your air holds." : "Because the wolf went into The Key under the old name, the shapes at 2 600 m stay grey shapes, and they knock you back.");
      if (stage === 2 && desk && desk.played) api.linkNote(desk.clumsy ? "Because your page at the Excision Desk (Journal Audit) went to the clerk with the brush, all four strata of this sheet are brushed black." : `Because you ruled ${desk.bars.length} full bar${desk.bars.length === 1 ? "" : "s"} at the Excision Desk in Journal Audit, ${desk.bars.length} strat${desk.bars.length === 1 ? "um" : "a"} of this sheet ${desk.bars.length === 1 ? "is" : "are"} black: ${desk.bars.map((k) => "C." + (k + 1)).join(", ")}.${desk.bars.length < 4 ? ` Where you cut only the word, the black is one ledge wide.` : ""}`);
    });
    startBtn.focus();

    return {
      unmount() {
        alive = false; cancelAnimationFrame(raf); ro.disconnect();
        off.forEach((f) => f()); timers.forEach(clearTimeout); clearTimeout(msgTimer);
      },
    };
  }
}

export default {
  mount(root, api) {
    return runStages(root, api, { names: ["To the ridge", "The Peaks", "The escape"], colors: { bg: "#3b2618", fg: "#f1e8d2", accent: "#c8913a", paper: "#f6efdc", ink: INK }, mount: mountStage });
  },
};

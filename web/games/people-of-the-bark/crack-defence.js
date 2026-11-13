// People of the Bark — Crack defence (2D, isometric diorama).
// DESIGN.md 10, Mode B, cut to one sequence: the summer Beetle (c3_beetle), with mites for company.
// Before it starts, the reading decides what the Beetle is (the god-or-monster rule):
//   monster — hold the five barricade lines until its will runs out; a line that falls with
//             warriors on it loses them, unless the fall-back was sounded. All five fall: breach.
//   god     — escort it: keep the people's groups out of its path and lay an offering at each line.
// Cut to fit: will is 60 s of hold instead of 90; the escort is about 75 s; squad is 5 (standing 30).
// Actions, monster: move Burr; assign a warrior to his line (Q); shore a quiet line (E); then, as the
// Beetle comes, pour sap-glue (F, 2 sap) and sound the fall-back (R). Halfway through its will the
// Beetle rears and pushes harder. Actions, god: move; lead a group aside (Q); lay an offering (F,
// 2 sap); sound the hush (R, twice: every group in the crack lies flat for 6 s and is not startled).
// Lost warriors go on the Roll of the Bark by name (DESIGN 12.6). After two lost defences the squad
// is six and the Beetle's will is 45 s; an escort gets a third hush.

const C = { umber: "#5a3d2b", umberD: "#3a281c", umberL: "#7a5a40", grey: "#7d6c5a", greyL: "#a8977f", dark: "#1b120c",
  sage: "#8fa37a", lime: "#c4d65a", amber: "#d9902a", gold: "#f0c050", lantern: "#e8742a", paper: "#efe2c4", red: "#c8482e" };
const LEN = 32, WID = 3;
const LINE_U = [7, 12, 17, 22, 27];
// The Roll of the Bark: a name and one habit each. The first two are DESIGN.md 6's own examples.
const ROLL = ["Hob, who counted ridges to fall asleep", "Wren, who saved the last sip for whoever came in late",
  "Tamsin, who whistled through the gap in her teeth", "Orrin, who carved his spear-notches crooked on purpose",
  "Pip, who was afraid of the dark and stood the night watch anyway", "Bryony, who knew every lichen by its taste",
  "Fell, who sang the wrong words to every chant", "Moss, who kept a dead beetle's wing case as a shield",
  "Ash, who always offered to carry the planks"];

export default {
  mount(root, api) {
    const P = "people-of-the-bark-crack-defence-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    let raf = 0;
    const pending = [];
    const later = (f, ms) => pending.push(setTimeout(f, ms));
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const WILL = gentle ? 45 : 60;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 45%,#3d2a1d,#1b120c 78%);color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}cv{position:absolute;inset:0;width:100%;height:100%;cursor:pointer}
.${P}hud{position:absolute;right:12px;top:10px;border:1px solid ${C.amber};background:linear-gradient(180deg,rgba(58,40,28,.94),rgba(27,18,12,.94));padding:8px 12px;font:13px ui-monospace,monospace;letter-spacing:.06em;min-width:250px;max-width:calc(100% - 24px);box-sizing:border-box;box-shadow:0 3px 0 #120c08}
.${P}row{display:flex;align-items:center;gap:10px;margin:4px 0}
.${P}row>span:first-child{width:62px;color:#d8c8a4;flex:none}
.${P}notch{display:inline-block;width:24px;height:12px;margin-right:4px;background:${C.lime};transform:skewX(-20deg);transition:background .3s}
.${P}notch.${P}hit{background:${C.gold}}
.${P}notch.${P}low{background:${C.red}}
.${P}notch.${P}off{background:transparent;border:1px solid #8a7864}
.${P}bar{flex:1;height:12px;border:1px solid #8a7864;position:relative;overflow:hidden}
.${P}bar i{position:absolute;inset:0 auto 0 0;background:${C.lantern};transition:width .15s}
.${P}bar.${P}drain i{background:repeating-linear-gradient(90deg,${C.lantern} 0 6px,${C.gold} 6px 9px)}
.${P}note{font-style:italic;font-family:'Cormorant Garamond',serif;color:${C.gold};font-size:15px;text-align:right;margin-top:4px;letter-spacing:0}
.${P}msg{position:absolute;left:12px;right:12px;bottom:84px;text-align:center;font:600 15px ui-monospace,monospace;letter-spacing:.06em;color:${C.gold};text-shadow:0 2px 6px #000,0 0 2px #000;pointer-events:none;transition:opacity .2s}
.${P}msg.${P}bad{color:#ff9b7a}
.${P}msg.${P}shake{animation:${P}shake .3s}
@keyframes ${P}shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.${P}beat{position:absolute;left:12px;top:10px;max-width:min(420px,calc(100% - 290px));font-style:italic;font-size:17px;line-height:1.35;color:#f3e4c0;background:rgba(27,18,12,.78);border-left:3px solid ${C.amber};padding:6px 10px;pointer-events:none;transition:opacity .4s}
.${P}beat b{font-style:normal;font:12px ui-monospace,monospace;letter-spacing:.14em;color:${C.lime};display:block}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:10px;background:linear-gradient(transparent,rgba(27,18,12,.92) 35%)}
.${P}pad button{position:relative;overflow:hidden;font:14px ui-monospace,monospace;color:#efe2c4;background:rgba(58,40,28,.95);border:1px solid ${C.umberL};padding:8px 11px;min-width:46px;min-height:44px;cursor:pointer;border-radius:2px}
.${P}pad button b{color:${C.gold};font-weight:400;margin-right:5px}
.${P}pad button:hover:not(:disabled){border-color:${C.gold}}
.${P}pad button:disabled{opacity:.38;cursor:default}
.${P}pad button.${P}new{box-shadow:0 0 0 2px ${C.lime};animation:${P}pulse 1s ease-in-out 3}
@keyframes ${P}pulse{50%{box-shadow:0 0 0 5px rgba(196,214,90,.4)}}
.${P}pad button i{position:absolute;left:0;bottom:0;height:3px;background:${C.gold}}
.${P}pad button:focus-visible{outline:3px solid ${C.lime};outline-offset:2px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.9);padding:16px;z-index:4;overflow:auto}
.${P}plaque{max-width:560px;width:100%;box-sizing:border-box;background:linear-gradient(160deg,#4a3324,#2e2016);border:1px solid ${C.amber};padding:18px 22px;position:relative;
 box-shadow:8px 8px 0 #120c08,inset 0 0 0 1px rgba(240,192,80,.15);transform:perspective(900px) rotateX(4deg)}
.${P}plaque h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;margin:0;color:${C.gold}}
.${P}plaque .${P}sub{font:12px ui-monospace,monospace;letter-spacing:.2em;color:${C.lime};margin-bottom:8px}
.${P}plaque p{margin:0 0 10px;font-size:17px;line-height:1.4}
.${P}plaque .${P}lead{font-style:italic;color:#e9d6ae}
.${P}choice{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.${P}choice button{flex:1 1 220px;font:inherit;font-size:16px;line-height:1.3;text-align:left;color:#efe2c4;background:#2a1d14;border:1px solid ${C.umberL};padding:10px 12px 10px 14px;cursor:pointer;position:relative;clip-path:polygon(10px 0,100% 0,100% 100%,10px 100%,0 50%)}
.${P}choice button:hover,.${P}choice button:focus-visible{border-color:${C.gold};background:#3a281c;outline:none}
.${P}choice b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:22px;color:${C.gold}}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:16px;line-height:1.3;margin:8px 0 12px}
.${P}key kbd{font:13px ui-monospace,monospace;color:${C.gold};border:1px solid ${C.grey};padding:1px 6px;border-radius:2px;white-space:nowrap;align-self:start}
.${P}go{font-family:'IM Fell English',Georgia,serif;font-size:19px;background:${C.amber};color:${C.dark};border:0;padding:8px 18px;cursor:pointer;border-radius:2px}
.${P}go:focus-visible{outline:3px solid ${C.lime};outline-offset:3px}
@media (max-width:640px){.${P}hud{left:10px;right:10px;top:8px;min-width:0;padding:6px 10px}.${P}beat{top:auto;bottom:178px;max-width:none;right:12px;font-size:15px}.${P}msg{bottom:124px;font-size:13px}.${P}pad button{font-size:13px;padding:6px 8px;min-height:42px}.${P}row>span:first-child{width:50px}}
@media (prefers-reduced-motion:reduce){.${P}msg.${P}shake,.${P}pad button.${P}new{animation:none}}
</style>
<canvas class="${P}cv" aria-label="The crack, seen as a diorama. Tap the crack to send Burr there."></canvas>
<div class="${P}hud"></div>
<div class="${P}beat" aria-live="polite"></div>
<div class="${P}msg" aria-live="polite"></div>
<div class="${P}pad"></div>
<div class="${P}intro"><div class="${P}plaque" role="dialog" aria-label="How to play">
 <h2>Crack defence · the Beetle</h2><div class="${P}sub">SUMMER · THE LONG CRACK BELOW SPLINTERWATCH</div>
 <p class="${P}lead">You are Captain Burr. You have never fought anything bigger than a mite. Something as big as a city is climbing the crack from the Under, and the Knot's reading will say what it is.</p>
 <p><b>Goal:</b> five barricade lines, ${gentle ? "six" : "five"} warriors. Choose the reading:</p>
 <div class="${P}choice">
  <button data-r="monster" type="button"><b>A monster</b>Fight. Hold the lines until its will runs out. Warriors left on a falling line are lost.</button>
  <button data-r="god" type="button"><b>A god</b>Escort. Keep the people out of its path and lay an offering at every line it passes.</button>
 </div>
</div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const cv = $("cv"), g = cv.getContext("2d"), hud = $("hud"), msgEl = $("msg"), intro = $("intro"), pad = $("pad"), beatEl = $("beat");
    const rnd = api.rng();

    const S = {
      mode: null, started: false, over: false, t: 0,
      burr: 24, target: null, sap: 12,
      lines: LINE_U.map((u) => ({ u, hp: 10, w: 0, fallen: false, offering: false, flash: 0 })),
      lost: [], will: WILL, mites: [], waves: [{ at: 4, n: 7 }, { at: 30, n: 8 }, { at: 56, n: 9 }],
      beetle: null, glue: [], groups: [], groupPlan: [{ at: 6 }, { at: 22 }, { at: 36 }, { at: 50 }],
      disturbed: 0, cleared: 0, cds: { build: 0 }, msg: "", msgT: 0, bad: false, unlocked: new Set(), beats: new Set(), rear: false,
      hush: gentle ? 3 : 2, hushT: 0, engaged: [0, 0, 0, 0, 0], fx: [],
    };
    const squad = gentle ? 6 : 5;
    S.lines[4].w = 2; S.lines[3].w = 2; S.lines[2].w = squad - 4;
    const say = (m, t = 2, bad = false) => {
      S.msg = m; S.msgT = t; S.bad = bad;
      msgEl.classList.toggle(P + "bad", bad);
      if (bad && !api.reducedMotion) { msgEl.classList.remove(P + "shake"); void msgEl.offsetWidth; msgEl.classList.add(P + "shake"); }
    };
    let beatT = 0;
    const beat = (who, text, secs = 7) => { beatEl.innerHTML = `<b>${who}</b>${text}`; beatEl.style.opacity = "1"; beatT = secs; };
    const front = () => { for (let i = 4; i >= 0; i--) if (!S.lines[i].fallen) return i; return -1; };
    const nearestLine = (maxD = 2.2) => {
      let best = -1, bd = maxD;
      S.lines.forEach((l, i) => { const d = Math.abs(l.u - S.burr); if (!l.fallen && d <= bd) { bd = d; best = i; } });
      return best;
    };

    // ---- the action pad ----
    const ACTS = {
      monster: [["left", "A", "◀"], ["right", "D", "▶"], ["assign", "Q", "assign"], ["build", "E", "shore"], ["glue", "F", "sap-glue"], ["back", "R", "fall back"]],
      god: [["left", "A", "◀"], ["right", "D", "▶"], ["assign", "Q", "lead aside"], ["glue", "F", "offering"], ["back", "R", "hush"]],
    };
    function buildPad() {
      pad.innerHTML = ACTS[S.mode].map(([a, k, label]) => `<button type="button" data-a="${a}" ${S.unlocked.has(a) ? "" : "hidden"}><b>${k}</b>${label}<i></i></button>`).join("");
      pad.querySelectorAll("button").forEach((b) => {
        const a = b.dataset.a;
        if (a === "left" || a === "right") {
          on(b, "pointerdown", (e) => { e.preventDefault(); held[a] = true; S.target = null; try { b.setPointerCapture(e.pointerId); } catch { /* */ } });
          const up = () => { held[a] = false; };
          on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
        } else on(b, "click", () => act(a));
      });
    }
    function unlock(a, line) {
      if (S.unlocked.has(a)) return;
      S.unlocked.add(a);
      const b = pad.querySelector(`[data-a="${a}"]`);
      if (b) { b.hidden = false; if (line) { b.classList.add(P + "new"); later(() => b.classList.remove(P + "new"), 3200); } }
      if (line) say(line, 3);
    }

    // ---- actions ----
    function act(a) {
      if (!S.started || S.over) return;
      if (!S.unlocked.has(a)) return;
      const li = nearestLine();
      if (a === "assign") {
        if (S.mode === "god") {
          const gr = S.groups.find((q) => !q.gone && Math.abs(q.u - S.burr) < 2.4);
          if (gr) { gr.gone = true; gr.leaving = 1; S.cleared++; say("THE PEOPLE STEP ASIDE INTO A SIDE GROOVE"); fx(gr.u, gr.v, C.lime); }
          else say("NO ONE NEAR BURR TO LEAD AWAY", 1.4, true);
          return;
        }
        if (li < 0) { say("STAND BY A LINE TO ASSIGN", 1.4, true); return; }
        let src = -1, most = 0;
        S.lines.forEach((l, i) => { if (i !== li && !l.fallen && l.w > most) { most = l.w; src = i; } });
        if (src < 0) { say("NO WARRIOR TO SPARE", 1.4, true); return; }
        S.lines[src].w--; S.lines[li].w++; say(`A WARRIOR TO LINE ${li + 1}`, 1.2); fx(S.lines[li].u, 1.5, C.gold);
      } else if (a === "build") {
        if (li < 0) { say("STAND BY A LINE", 1.4, true); return; }
        if (S.cds.build > 0) { say("STILL CARRYING THE LAST PLANKS", 1.2, true); return; }
        if (S.engaged[li]) { say("NO PLANKS UNDER ATTACK: SHORE A LINE BEHIND", 1.6, true); return; }
        const l = S.lines[li]; l.hp = Math.min(10, l.hp + 4); S.cds.build = 3; say(`LINE ${li + 1} SHORED UP`, 1.2); fx(l.u, 1.5, C.lime);
      } else if (a === "glue") {
        if (S.sap < 2) { say("NO SAP LEFT", 1.4, true); return; }
        if (S.mode === "god") {
          if (li < 0) { say("STAND BY A LINE TO LAY AN OFFERING", 1.4, true); return; }
          const l = S.lines[li];
          if (l.offering) { say("AN OFFERING ALREADY LIES HERE", 1.4, true); return; }
          if (S.beetle && S.beetle.u < l.u) { say("IT HAS ALREADY PASSED THIS LINE", 1.4, true); return; }
          l.offering = true; S.sap -= 2; say(`AN OFFERING AT LINE ${li + 1}`, 1.2); fx(l.u, WID - 0.4, C.gold); return;
        }
        S.sap -= 2; S.glue.push({ u: S.burr, t: 6 }); say("SAP-GLUE POURED", 1); fx(S.burr, 1.5, C.amber);
      } else if (a === "back") {
        if (S.mode === "god") {
          if (S.hush <= 0) { say("NO MORE BREATH FOR A HUSH", 1.4, true); return; }
          S.hush--; S.hushT = 6; say(`HUSH! THE PEOPLE LIE FLAT (${S.hush} LEFT)`, 2); return;
        }
        const f = front();
        if (f <= 0) { say("THERE IS NO LINE BEHIND", 1.4, true); return; }
        const n = S.lines[f].w;
        if (!n) { say(`NO ONE ON LINE ${f + 1} TO CALL BACK`, 1.4, true); return; }
        S.lines[f].w = 0; S.lines[f - 1].w += n;
        say(`FALL BACK! ${n} TO LINE ${f}`, 1.6);
      }
    }
    const fx = (u, v, col) => { if (!api.reducedMotion) S.fx.push({ u, v, col, t: 0.6 }); };

    // ---- input ----
    const KEYS = { KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right", KeyQ: "assign", KeyE: "build", KeyF: "glue", KeyR: "back" };
    const held = { left: false, right: false };
    on(window, "keydown", (e) => {
      const a = KEYS[e.code]; if (!a || !S.started || e.ctrlKey || e.metaKey || e.altKey) return; e.preventDefault();
      if (a === "left" || a === "right") { held[a] = true; S.target = null; } else if (!e.repeat) act(a);
    });
    on(window, "keyup", (e) => { const a = KEYS[e.code]; if (a === "left" || a === "right") held[a] = false; });
    on(window, "blur", () => { held.left = held.right = false; });
    on(cv, "pointerdown", (e) => {
      if (!S.started) return;
      const r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let best = S.burr, bd = 1e9;
      for (let u = 0; u <= LEN; u += 0.25) { const p = proj(u, 1.5, 0); const d = (p.x - mx) ** 2 + (p.y - my) ** 2; if (d < bd) { bd = d; best = u; } }
      S.target = Math.max(1, Math.min(LEN - 1, best));
    });
    intro.querySelectorAll("button[data-r]").forEach((b) => on(b, "click", () => chooseReading(b.dataset.r)));
    intro.querySelector("button[data-r]").focus();

    function chooseReading(mode) {
      S.mode = mode;
      const legend = mode === "monster"
        ? `<kbd>A D · tap the crack</kbd><span>move Burr along it</span><kbd>Q</kbd><span>assign: pull a warrior to the line Burr stands by</span><kbd>E</kbd><span>shore a line that is not under attack</span>`
        : `<kbd>A D · tap the crack</kbd><span>move Burr along it</span><kbd>Q</kbd><span>lead aside a group of people near Burr</span><kbd>F</kbd><span>lay an offering at Burr's line (2 sap)</span>`;
      intro.innerHTML = `<div class="${P}plaque" role="dialog" aria-label="How to play"><h2>${mode === "monster" ? "A monster" : "A god"}</h2><div class="${P}sub">${mode === "monster" ? "HOLD THE CRACK" : "ESCORT THE VISITOR"}</div>
<p class="${P}lead">${mode === "monster" ? "Burr: “Small ones we fight. Big ones we bow to. Middling ones, we ask the Knot.” The Knot has said: fight." : "The Knot has said: a god. Burr lowers his spear, and looks almost relieved."}</p>
<p><b>Goal:</b> ${mode === "monster" ? `hold until the Beetle's will is spent (${WILL} s of it facing warriors). Watch the WILL bar.` : "let it pass with no one in its path. Twice startled and the escort fails."}</p>
<div class="${P}key">${legend}</div><p style="font-size:15px;font-style:italic">More orders come as the Beetle does.</p>
<button class="${P}go" type="button">${mode === "monster" ? "Hold the lines" : "Clear the way"}</button></div>`;
      const b = intro.querySelector("button");
      on(b, "click", start);
      b.focus();
    }
    function start() {
      intro.remove(); S.started = true;
      ["left", "right", "assign", S.mode === "monster" ? "build" : "glue"].forEach((a) => S.unlocked.add(a));
      buildPad();
      if (S.mode === "god") {
        S.beetle = { u: LEN + 2 }; S.lines.forEach((l) => (l.w = 0));
        say("THE VISITOR COMES. CLEAR ITS PATH", 2.5);
        beat("Burr", "“Spears down. Heads down. Nobody stands in its road.”");
      } else {
        say("HOLD THE LINES", 2);
        beat("Burr", "“Battlements! Everyone on the— yes, you too.” Mites first: the small ones always come first.");
      }
      last = performance.now();
    }

    // ---- projection ----
    let W = 0, H = 0, K = 20, OX = 0, OY = 0;
    function fit() {
      const r = wrap.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cos = 0.866, sin = 0.5;
      const spanX = (LEN + WID + 2) * cos, spanY = (LEN + WID + 2) * sin + 4.5;
      const narrow = W < 640;
      const top = narrow ? 120 : 40, bottom = narrow ? 120 : 70;
      K = Math.min((W - 16) / spanX, (H - top - bottom) / spanY);
      OX = (W - spanX * K) / 2 + (WID + 1) * cos * K;
      OY = top + 4 * K + ((H - top - bottom) - spanY * K) / 2;
    }
    function proj(u, v, z) { return { x: OX + (u - v) * 0.866 * K, y: OY + (u + v) * 0.5 * K - z * K }; }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(wrap);

    function poly(pts, fill, stroke) {
      g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
      g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
    }
    function cube(u, v, z, du, dv, dz, top, left, right) {
      const A = proj(u, v, z + dz), B = proj(u + du, v, z + dz), Cc = proj(u + du, v + dv, z + dz), D = proj(u, v + dv, z + dz);
      const B0 = proj(u + du, v, z), C0 = proj(u + du, v + dv, z), D0 = proj(u, v + dv, z);
      poly([D, Cc, C0, D0], left, "rgba(0,0,0,.25)");
      poly([B, Cc, C0, B0], right, "rgba(0,0,0,.25)");
      poly([A, B, Cc, D], top, "rgba(0,0,0,.2)");
      // bark grain on the top face
      g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 1;
      for (let k = 1; k < 3; k++) { const a = proj(u + du * k / 3, v, z + dz), b = proj(u + du * k / 3, v + dv, z + dz); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    }
    function figure(u, v, col, spear, crest, s = 1, flat = false) {
      const p = proj(u, v, 0); const k = K * 0.55 * s;
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(p.x, p.y, k * 0.5, k * 0.22, 0, 0, 7); g.fill();
      if (flat) { g.fillStyle = col; g.beginPath(); g.ellipse(p.x, p.y - k * 0.15, k * 0.55, k * 0.2, 0, 0, 7); g.fill(); return; }
      g.fillStyle = col; g.fillRect(p.x - k * 0.22, p.y - k * 1.3, k * 0.44, k * 1.1);
      g.fillStyle = C.paper; g.beginPath(); g.arc(p.x, p.y - k * 1.55, k * 0.3, 0, 7); g.fill();
      if (crest) { g.fillStyle = C.lantern; g.beginPath(); g.ellipse(p.x, p.y - k * 1.85, k * 0.35, k * 0.14, -0.4, 0, 7); g.fill(); }
      if (spear) { g.strokeStyle = C.paper; g.lineWidth = Math.max(1, k * 0.08); g.beginPath(); g.moveTo(p.x + k * 0.35, p.y - k * 0.2); g.lineTo(p.x + k * 0.35, p.y - k * 2.3); g.stroke(); }
    }

    // ---- simulation ----
    function update(dt) {
      S.t += dt;
      if (S.msgT > 0) S.msgT -= dt;
      S.cds.build = Math.max(0, S.cds.build - dt);
      S.hushT = Math.max(0, S.hushT - dt);
      S.lines.forEach((l) => (l.flash = Math.max(0, l.flash - dt)));
      S.fx.forEach((f) => (f.t -= dt)); S.fx = S.fx.filter((f) => f.t > 0);
      let dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (!dir && S.target != null) { const d = S.target - S.burr; if (Math.abs(d) < 0.1) S.target = null; else dir = Math.sign(d); }
      S.burr = Math.max(1, Math.min(LEN - 1, S.burr + dir * 6.5 * dt));
      S.glue.forEach((q) => (q.t -= dt)); S.glue = S.glue.filter((q) => q.t > 0);
      const slow = (u) => (S.glue.some((q) => Math.abs(q.u - u) < 1.2) ? 0.4 : 1);
      if (S.mode === "monster") updateMonster(dt, slow); else updateGod(dt);
    }

    function lineFalls(i) {
      const l = S.lines[i]; l.fallen = true; l.hp = 0;
      if (l.w > 0) {
        const names = [];
        for (let k = 0; k < l.w; k++) { const n = ROLL[S.lost.length % ROLL.length]; S.lost.push(n); names.push(n.split(",")[0]); }
        say(`LINE ${i + 1} FALLS. ${names.join(" AND ").toUpperCase()} LOST`, 3, true);
        beat("The Roll of the Bark", S.lost.slice(-l.w).join("; ") + ".", 8);
        l.w = 0;
      } else say(`LINE ${i + 1} FALLS. NO ONE WAS ON IT`, 2.2);
      if (front() < 0) {
        S.over = true;
        api.store.set("losses", losses + 1);
        later(() => api.end({ outcome: "lose", text: `The crack is breached and the Beetle walks on toward Highridge, not hurrying. Bark integrity −5, the Battlements −3.${S.lost.length ? ` On the Roll of the Bark: ${S.lost.join("; ")}.` : " No one was left on a falling line."}${losses + 1 >= 2 ? " Next time a sixth warrior joins the squad." : ""}` }), 900);
      }
    }

    function updateMonster(dt, slow) {
      for (const w of S.waves) if (!w.done && S.t >= w.at) {
        w.done = true; say(`MITES: ${w.n} IN THE CRACK`, 1.8);
        for (let i = 0; i < w.n; i++) S.mites.push({ u: LEN + 1 + i * 0.7, v: 0.4 + rnd() * 2.2, hp: 1 });
      }
      if (!S.beetle && S.t >= 14) {
        S.beetle = { u: LEN + 3 }; say("THE BEETLE CLIMBS FROM THE UNDER", 2.6);
        beat("Burr", "“I'm not afraid. I'm ready. They feel the same from inside.”");
        later(() => unlock("glue", "NEW ORDER: F POURS SAP-GLUE, SLOWING WHATEVER WALKS IN IT"), 2500);
      }
      const f = front();
      const engaged = [0, 0, 0, 0, 0];
      for (const m of S.mites) {
        const stop = f >= 0 ? S.lines[f].u + 0.6 : -5;
        if (m.u > stop) m.u -= 1.3 * slow(m.u) * dt;
        else if (f >= 0) { engaged[f]++; S.lines[f].hp -= 0.2 * slow(m.u) * dt; S.lines[f].flash = 0.2; }
      }
      S.lines.forEach((l) => {
        if (l.fallen || !l.w) return;
        const at = S.mites.filter((m) => Math.abs(m.u - (l.u + 0.6)) < 0.7);
        if (at.length) at[0].hp -= 0.6 * l.w * dt;
      });
      S.mites = S.mites.filter((m) => m.hp > 0);
      if (S.beetle) {
        const b = S.beetle; const stop = f >= 0 ? S.lines[f].u + 1.6 : -5;
        if (b.u > stop) b.u -= (S.rear ? 0.9 : 0.7) * slow(b.u) * dt;
        else if (f >= 0) {
          engaged[f] += 3;
          S.lines[f].hp -= (S.rear ? 0.62 : 0.5) * slow(b.u) * dt; S.lines[f].flash = 0.25;
          if (S.lines[f].w > 0) S.will = Math.max(0, S.will - dt);
        }
        if (!S.rear && S.will <= WILL / 2) {
          S.rear = true; say("IT REARS. IT PUSHES HARDER", 2.4, true);
          beat("Burr", "“It's tiring! Hold! Hold, and it turns!”");
        }
      }
      S.engaged = engaged;
      S.lines.forEach((l, i) => { if (!l.fallen && l.w && !engaged[i]) l.hp = Math.min(10, l.hp + 0.9 * dt); });
      if (f >= 0 && S.lines[f].hp < 5 && S.lines[f].w > 0 && f > 0) unlock("back", "NEW ORDER: R SOUNDS THE FALL-BACK. CALL THEM BEFORE THE LINE BREAKS");
      if (f >= 0 && S.lines[f].hp <= 0) lineFalls(f);
      if (S.will <= 0 && !S.over) {
        S.over = true;
        const heldN = S.lines.filter((l) => !l.fallen).length;
        say("IT TURNS BACK", 3);
        S.beetle.leaving = true;
        api.store.set("losses", 0);
        later(() => api.end({ outcome: "win", text: `The Beetle's will is spent and it turns back into the Under. ${heldN} of 5 lines still stand. ${S.lost.length ? `The Roll of the Bark gains ${S.lost.length === 1 ? "a name" : S.lost.length + " names"}: ${S.lost.join("; ")}.` : "No one is lost, and Burr's spear is still unblooded; he is glad of it."} The Battlements +4.` }), 1500);
      }
    }

    function updateGod(dt) {
      const b = S.beetle;
      b.u -= 0.42 * dt;
      for (const p of S.groupPlan) if (!p.done && S.t >= p.at) {
        p.done = true;
        const u = Math.max(3, Math.min(b.u - 6, 6 + rnd() * (b.u - 12)));
        S.groups.push({ u, v: 0.6 + rnd() * 1.8, gone: false });
        say("PEOPLE WANDER INTO THE CRACK", 1.8);
        if (S.groups.length === 2) later(() => unlock("back", `NEW: R SOUNDS THE HUSH. EVERYONE IN THE CRACK LIES FLAT FOR 6 S (${S.hush} LEFT)`), 1800);
      }
      for (const q of S.groups) {
        if (q.leaving) q.leaving = Math.max(0, q.leaving - dt);
        if (!q.gone && b.u - 1.4 < q.u) {
          if (S.hushT > 0) { q.gone = true; q.flatPass = true; q.leaving = 1; say("IT PASSES OVER THEM. NOBODY BREATHES", 2); continue; }
          q.gone = true; q.hit = true; S.disturbed++;
          say(S.disturbed >= 2 ? "THE VISITOR IS DISTURBED AGAIN" : "THE VISITOR WALKS INTO THE PEOPLE. THEY SCATTER", 2.6, true);
        }
      }
      for (const l of S.lines) if (!l.passed && b.u < l.u) {
        l.passed = true;
        const i = S.lines.indexOf(l);
        if (!l.offering) say(`IT PASSED LINE ${i + 1} WITH NO OFFERING`, 2, true);
        if (i === 2 && !S.beats.has("mid")) { S.beats.add("mid"); beat("A child in a side groove", "“It has six feet. Gods have six feet?” Someone hushes her."); }
      }
      if (S.disturbed >= 2 && !S.over) {
        S.over = true;
        api.store.set("losses", losses + 1);
        later(() => api.end({ outcome: "lose", text: `Twice the god walked into its people. They scattered into the side grooves; hands −2, morale −4. The Knot will say the visitor was angered.${losses + 1 >= 2 ? " Next time Burr will have breath for a third hush." : ""}` }), 1000);
      }
      if (b.u < -2 && !S.over) {
        S.over = true;
        const offered = S.lines.filter((l) => l.offering).length;
        api.store.set("losses", 0);
        api.end({ outcome: "win", text: `The visitor passes on its own, up and away over the ridge. ${offered} of 5 lines laid an offering; ${S.disturbed ? "one group was startled" : "no one stood in its path"}. Nobody is lost, and Burr is glad not to have needed his spear.` });
      }
    }

    // ---- drawing ----
    function draw() {
      g.clearRect(0, 0, W, H);
      cube(-0.5, -1.2, -0.6, LEN + 1, WID + 2.4, 0.6, C.umberD, "#2a1d14", "#33241a");
      for (let u = 0; u < LEN; u++) for (let v = 0; v < WID; v++) {
        const A = proj(u, v, 0), B = proj(u + 1, v, 0), Cc = proj(u + 1, v + 1, 0), D = proj(u, v + 1, 0);
        poly([A, B, Cc, D], (u + v) % 2 ? "#4f3726" : "#4a3221", "rgba(0,0,0,.2)");
      }
      // Burr's reach: the line he would act on
      const li = S.started && !S.over ? nearestLine() : -1;
      if (li >= 0) { const l = S.lines[li]; const a = proj(l.u - 1, -0.2, 0), b = proj(l.u + 1, -0.2, 0), c = proj(l.u + 1, WID + 0.2, 0), d = proj(l.u - 1, WID + 0.2, 0); poly([a, b, c, d], "rgba(240,192,80,.14)"); }
      for (const q of S.glue) { const p = proj(q.u, 1.5, 0); g.fillStyle = `rgba(217,144,42,${0.35 + 0.4 * Math.min(1, q.t / 2)})`; g.beginPath(); g.ellipse(p.x, p.y, K * 1.4, K * 0.7, 0, 0, 7); g.fill(); }
      for (let i = 0; i < 2; i++) { const p = proj(0.6, 0.6 + i * 1.6, 0); g.fillStyle = C.lantern; g.globalAlpha = 0.85; g.beginPath(); g.arc(p.x, p.y - K * 0.6, K * 0.22, 0, 7); g.fill(); g.globalAlpha = 1; }

      const items = [];
      for (let u = 0; u < LEN; u++) {
        const h = 2 + ((u * 7) % 5 === 0 ? 2 : (u * 3) % 4 === 0 ? 1 : 0);
        items.push({ d: u - 1, f: () => { for (let z = 0; z < h; z++) cube(u, -1, z, 1, 1, 1, z === h - 1 ? C.grey : C.umberL, C.umber, C.umberD); } });
        items.push({ d: u + WID + 0.2, f: () => cube(u, WID, 0, 1, 0.6, 0.35, C.umberL, C.umber, C.umberD) });
      }
      const fr = front();
      S.lines.forEach((l, i) => {
        items.push({ d: l.u + 1.5, f: () => {
          if (l.fallen) { for (let v = 0.2; v < WID; v += 0.7) cube(l.u - 0.15, v, 0, 0.5, 0.35, 0.12, "#3a281c", "#2a1d14", "#2a1d14"); return; }
          const hh = 0.25 + 0.75 * (l.hp / 10);
          const hot = l.flash > 0 && !api.reducedMotion && Math.floor(S.t * 12) % 2;
          cube(l.u - 0.2, 0, 0, 0.4, WID, hh, hot ? C.gold : l.hp < 3.5 ? C.red : C.greyL, C.umber, C.umberL);
          for (let v = 0.25; v < WID; v += 0.5) { const a = proj(l.u, v, hh), b2 = proj(l.u, v, hh + 0.55); g.strokeStyle = C.paper; g.lineWidth = Math.max(1, K * 0.07); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b2.x, b2.y); g.stroke(); }
          if (l.offering) { const p = proj(l.u - 0.6, WID - 0.4, 0); g.fillStyle = C.gold; g.beginPath(); g.arc(p.x, p.y - K * 0.2, K * 0.22, 0, 7); g.fill(); }
          // the line's number and its strength
          const m = proj(l.u, WID + 1, 0);
          g.fillStyle = i === fr ? C.gold : C.greyL; g.font = `600 ${Math.max(13, K * 0.6)}px ui-monospace,monospace`; g.textAlign = "center"; g.fillText(String(i + 1), m.x, m.y + K * 0.2);
          if (S.mode === "monster") {
            const bw = Math.max(26, K * 1.3), bx = m.x - bw / 2, by = m.y + K * 0.4;
            g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(bx - 1, by - 1, bw + 2, 7);
            g.fillStyle = l.hp < 3.5 ? C.red : l.hp < 6 ? C.amber : C.lime; g.fillRect(bx, by, bw * l.hp / 10, 5);
            if (l.w) { g.fillStyle = C.paper; g.font = `${Math.max(12, K * 0.5)}px ui-monospace,monospace`; g.fillText(`${l.w}♦`, m.x, by + Math.max(17, K * 0.85)); }
          }
        } });
        for (let k = 0; k < l.w; k++) items.push({ d: l.u - 0.2 + k * 0.01, f: () => figure(l.u - 0.55, 0.4 + (k % 4) * 0.65, "#a8977f", true, false, 1.45) });
      });
      for (const q of S.groups) {
        if (q.gone && !q.leaving) continue;
        const v = q.gone ? q.v - (1 - q.leaving) * 3 : q.v;
        const flat = S.hushT > 0 && !q.gone;
        items.push({ d: q.u + v, f: () => { for (let k = 0; k < 3; k++) figure(q.u + k * 0.35, v + (k % 2) * 0.3, q.hit ? C.red : C.sage, false, false, 1.15, flat); if (!flat) { const p = proj(q.u, v, 0); g.fillStyle = C.lantern; g.beginPath(); g.arc(p.x + K * 0.2, p.y - K * 0.9, K * 0.1, 0, 7); g.fill(); } } });
      }
      for (const m of S.mites) items.push({ d: m.u + m.v, f: () => { const p = proj(m.u, m.v, 0); g.fillStyle = C.red; g.beginPath(); g.ellipse(p.x, p.y - K * 0.12, K * 0.2, K * 0.13, 0, 0, 7); g.fill(); g.strokeStyle = C.dark; g.lineWidth = 1; for (let s = -1; s <= 1; s++) { g.beginPath(); g.moveTo(p.x + s * K * 0.1, p.y - K * 0.1); g.lineTo(p.x + s * K * 0.22, p.y + K * 0.05); g.stroke(); } } });
      if (S.beetle && S.beetle.u < LEN + 2.5) {
        const b = S.beetle;
        items.push({ d: b.u + 1.5, f: () => {
          const wob = S.rear && !api.reducedMotion ? Math.sin(S.t * 9) * K * 0.08 : 0;
          const p = proj(b.u + 0.8, 1.5, 0), k = K;
          g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(p.x, p.y, k * 1.9, k * 0.9, 0, 0, 7); g.fill();
          g.strokeStyle = "#0b0f0c"; g.lineWidth = Math.max(1.5, k * 0.12);
          for (let s = -1; s <= 1; s++) for (const side of [-1, 1]) { g.beginPath(); g.moveTo(p.x + s * k * 0.7, p.y - k * 0.5); g.lineTo(p.x + s * k * 0.9 + side * k * 0.4, p.y + side * k * 0.55); g.stroke(); }
          const grd = g.createRadialGradient(p.x - k * 0.5, p.y - k * 1.2 + wob, k * 0.1, p.x, p.y - k * 0.7, k * 1.8);
          grd.addColorStop(0, "#3d5a48"); grd.addColorStop(0.5, "#16201a"); grd.addColorStop(1, "#070908");
          g.fillStyle = grd; g.beginPath(); g.ellipse(p.x + k * 0.2, p.y - k * 0.75 + wob, k * 1.6, k * 0.95, -0.35, 0, 7); g.fill();
          g.fillStyle = "#101511"; g.beginPath(); g.ellipse(p.x - k * 1.45, p.y - k * 0.2 + wob * 1.5, k * 0.5, k * 0.38, -0.35, 0, 7); g.fill();
          g.strokeStyle = "rgba(196,214,90,.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x - k * 0.9, p.y - k * 0.5 + wob); g.lineTo(p.x + k * 1.4, p.y - k * 1.3 + wob); g.stroke();
        } });
      }
      items.push({ d: S.burr + 2.2, f: () => { figure(S.burr, 2.2, C.amber, true, true, 1.6); const p = proj(S.burr, 2.2, 0); g.strokeStyle = C.gold; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(p.x, p.y, K * 0.6, K * 0.3, 0, 0, 7); g.stroke(); g.setLineDash([]); } });
      items.sort((a, b) => a.d - b.d).forEach((it) => it.f());
      for (const f of S.fx) { const p = proj(f.u, f.v, 0); g.strokeStyle = f.col; g.globalAlpha = Math.max(0, f.t / 0.6); g.lineWidth = 2; g.beginPath(); g.ellipse(p.x, p.y - K * 0.3, K * (1.6 - f.t), K * (0.8 - f.t / 2), 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (S.hushT > 0) { g.fillStyle = `rgba(27,18,12,${0.18 * Math.min(1, S.hushT)})`; g.fillRect(0, 0, W, H); }
    }

    function renderHud() {
      const notches = S.lines.map((l, i) => `<i class="${P}notch${l.fallen ? " " + P + "off" : l.hp < 3.5 ? " " + P + "low" : S.engaged[i] ? " " + P + "hit" : ""}"></i>`).join("");
      let second = "", note = "";
      if (S.mode === "god") {
        const pct = S.beetle ? Math.max(0, Math.min(1, 1 - (S.beetle.u + 2) / (LEN + 4))) : 0;
        const off = S.lines.filter((l) => l.offering).length;
        second = `<div class="${P}row"><span>PASSAGE</span><div class="${P}bar"><i style="width:${(pct * 100).toFixed(1)}%;background:${C.lime}"></i></div></div>
<div class="${P}row"><span>OFFER</span>${off}/5 · sap ${S.sap}${S.unlocked.has("back") ? ` · hush ${S.hush}` : ""}</div>
<div class="${P}row"><span>STARTLED</span><span style="color:${S.disturbed ? C.red : C.lime}">${"●".repeat(Math.min(2, S.disturbed))}${"○".repeat(Math.max(0, 2 - S.disturbed))}</span>${S.hushT > 0 ? ` <span style="color:${C.gold}">hush ${S.hushT.toFixed(0)}s</span>` : ""}</div>`;
        note = "the Beetle, read as a god";
      } else {
        const draining = S.beetle && S.engaged.some((x) => x >= 3) && S.lines[front()]?.w > 0;
        second = `<div class="${P}row"><span>WILL</span><div class="${P}bar${draining ? " " + P + "drain" : ""}"><i style="width:${(S.will / WILL * 100).toFixed(1)}%"></i></div><span>${Math.ceil(S.will)}s</span></div>
<div class="${P}row"><span>SQUAD</span>${S.lines.reduce((a, l) => a + l.w, 0)} standing${S.lost.length ? ` · lost ${S.lost.length}` : ""} · sap ${S.sap}</div>`;
        note = S.beetle ? (draining ? "its will drains while warriors face it" : "no warrior faces it: its will holds") : "mites first";
      }
      hud.innerHTML = `<div class="${P}row"><span>LINES</span><div>${notches}</div></div>${second}<div class="${P}note">${S.mode ? note : ""}</div>`;
      pad.querySelectorAll("button").forEach((b) => {
        const a = b.dataset.a, bar = b.querySelector("i");
        let dis = S.over;
        if (a === "glue") dis = dis || S.sap < 2;
        if (a === "back" && S.mode === "god") dis = dis || S.hush <= 0;
        b.disabled = dis;
        if (bar) bar.style.width = a === "build" && S.cds.build > 0 ? `${(1 - S.cds.build / 3) * 100}%` : "0";
      });
    }

    let last = performance.now(), hudT = 0;
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (S.started && !S.over) update(dt);
      else if (S.over && S.beetle && S.beetle.leaving) S.beetle.u += 1.2 * dt;
      if (beatT > 0) { beatT -= dt; if (beatT <= 0) beatEl.style.opacity = "0"; }
      draw();
      hudT -= dt; if (hudT <= 0) { renderHud(); hudT = 0.12; }
      msgEl.textContent = S.msgT > 0 ? S.msg : "";
      raf = requestAnimationFrame(loop);
    }
    beatEl.style.opacity = "0";
    raf = requestAnimationFrame(loop);
    wrap._test = { S, front, nearestLine };
    return {
      unmount() {
        cancelAnimationFrame(raf);
        S.over = true; S.started = false;
        pending.forEach(clearTimeout);
        offs.forEach((f) => f());
        ro.disconnect();
        wrap.remove();
      },
    };
  },
};

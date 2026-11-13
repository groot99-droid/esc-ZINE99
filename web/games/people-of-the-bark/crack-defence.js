// People of the Bark — Crack defence (2D, isometric diorama).
// DESIGN.md 10, Mode B, cut to one sequence: the summer Beetle (c3_beetle), with mites for company.
// Before it starts, the reading decides what the Beetle is (the god-or-monster rule):
//   monster — hold the five barricade lines until its will runs out; a line that falls with
//             warriors on it loses them, unless the fall-back was sounded. All five fall: breach.
//   god     — escort it: keep the people's groups out of its path and lay an offering at each line.
// Cut to fit: will is 60 s of hold instead of 90; the escort is about 75 s; squad is 5 (standing 30).

const C = { umber: "#5a3d2b", umberD: "#3a281c", umberL: "#7a5a40", grey: "#7d6c5a", greyL: "#a8977f", dark: "#1b120c",
  sage: "#8fa37a", lime: "#c4d65a", amber: "#d9902a", gold: "#f0c050", lantern: "#e8742a", paper: "#efe2c4", red: "#b8402a" };
const LEN = 32, WID = 3;
const LINE_U = [7, 12, 17, 22, 27]; // line 1 (back, by Highridge) .. line 5 (front, toward the Under)

export default {
  mount(root, api) {
    const P = "people-of-the-bark-crack-defence-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    let raf = 0;
    const pending = [];
    const later = (f, ms) => pending.push(setTimeout(f, ms));

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#3a281c,#1b120c 75%);color:#efe2c4;font-family:'Cormorant Garamond',Georgia,serif;touch-action:none;user-select:none;-webkit-user-select:none}
.${P}cv{position:absolute;inset:0;width:100%;height:100%}
.${P}hud{position:absolute;right:12px;top:12px;border:1px solid #d9902a;background:rgba(27,18,12,.82);padding:8px 12px;font:12px ui-monospace,monospace;letter-spacing:.08em;min-width:220px;max-width:calc(100% - 24px)}
.${P}row{display:flex;align-items:center;gap:10px;margin:3px 0}
.${P}row span:first-child{width:56px;color:#c9b99a}
.${P}notch{display:inline-block;width:22px;height:10px;margin-right:3px;background:#c4d65a;transform:skewX(-20deg)}
.${P}notch.${P}off{background:transparent;border:1px solid #7d6c5a}
.${P}bar{flex:1;height:10px;border:1px solid #7d6c5a;position:relative}
.${P}bar i{position:absolute;inset:0 auto 0 0;background:#e8742a}
.${P}note{font-style:italic;color:#f0c050;font-size:11px;text-align:right;margin-top:4px;letter-spacing:0}
.${P}msg{position:absolute;left:0;right:0;bottom:78px;text-align:center;font:600 13px ui-monospace,monospace;letter-spacing:.1em;color:#f0c050;text-shadow:0 2px 6px #000;pointer-events:none;padding:0 12px}
.${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:10px;background:linear-gradient(transparent,rgba(27,18,12,.9))}
.${P}pad button{font:12px ui-monospace,monospace;color:#efe2c4;background:rgba(58,40,28,.9);border:1px solid #7a5a40;padding:8px 10px;min-width:44px;min-height:40px;cursor:pointer}
.${P}pad button b{color:#f0c050;font-weight:400;margin-right:4px}
.${P}pad button:hover{border-color:#d9902a}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(27,18,12,.88);padding:16px;z-index:4}
.${P}card{max-width:520px;border:1px solid #d9902a;background:#2a1d14;padding:20px 22px}
.${P}card h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:28px;margin:0 0 8px;color:#f0c050}
.${P}card p{margin:0 0 10px;font-size:17px;line-height:1.4}
.${P}card kbd{font:12px ui-monospace,monospace;border:1px solid #7d6c5a;padding:0 4px;color:#f0c050}
.${P}choice{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.${P}choice button{flex:1 1 200px;font:inherit;font-size:17px;text-align:left;color:#efe2c4;background:#3a281c;border:1px solid #7a5a40;padding:10px 12px;cursor:pointer}
.${P}choice button:hover,.${P}choice button:focus-visible{border-color:#f0c050;outline:none}
.${P}choice b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:21px;color:#f0c050}
@media (max-width:560px){.${P}msg{bottom:118px;font-size:11px}.${P}hud{left:12px;right:12px;min-width:0}.${P}row span:first-child{width:46px}}
</style>
<canvas class="${P}cv"></canvas>
<div class="${P}hud"></div>
<div class="${P}msg"></div>
<div class="${P}pad">
 <button data-a="left"><b>A</b>◀</button><button data-a="right"><b>D</b>▶</button>
 <button data-a="assign"><b>Q</b>assign</button><button data-a="build"><b>E</b>barricade</button>
 <button data-a="glue"><b>F</b>sap-glue</button><button data-a="back"><b>R</b>fall back</button>
</div>
<div class="${P}intro"><div class="${P}card">
 <h2>Crack defence · the Beetle</h2>
 <p>A shape as big as a city climbs the crack from the Under. You are Captain Burr, with five warriors and five barricade lines. Move with <kbd>A</kbd>/<kbd>D</kbd> (or tap the crack). Keys act on the line nearest Burr.</p>
 <p>The Knot's reading decides what it is. Choose it:</p>
 <div class="${P}choice">
  <button data-r="monster"><b>A monster</b>Fight. Hold until its will runs out. <kbd>Q</kbd> moves a warrior to Burr's line, <kbd>E</kbd> shores a barricade not under attack, <kbd>F</kbd> pours sap-glue, <kbd>R</kbd> sounds the fall-back before a line breaks.</button>
  <button data-r="god"><b>A god</b>Escort. Lead each group of people out of its path (<kbd>Q</kbd> beside them) and lay an offering at every line before it passes (<kbd>F</kbd>, 2 sap).</button>
 </div>
</div></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("." + P + "cv");
    const g = cv.getContext("2d");
    const hud = wrap.querySelector("." + P + "hud");
    const msgEl = wrap.querySelector("." + P + "msg");
    const intro = wrap.querySelector("." + P + "intro");
    const rnd = api.rng();

    // ---- state ----
    const S = {
      mode: null, started: false, over: false, t: 0,
      burr: 24, target: null, dir: 0, sap: 12,
      lines: LINE_U.map((u) => ({ u, hp: 10, w: 0, fallen: false, offering: false })),
      lost: 0, will: 60, mites: [], waves: [{ at: 4, n: 7 }, { at: 30, n: 8 }, { at: 56, n: 9 }],
      beetle: null, glue: [], groups: [], groupPlan: [{ at: 6 }, { at: 24 }, { at: 42 }],
      disturbed: 0, cleared: 0, cds: { build: 0, assign: 0 }, msg: "", msgT: 0,
    };
    S.lines[4].w = 2; S.lines[3].w = 2; S.lines[2].w = 1;
    const say = (m, t = 2) => { S.msg = m; S.msgT = t; };
    const front = () => { for (let i = 4; i >= 0; i--) if (!S.lines[i].fallen) return i; return -1; };
    const nearestLine = (maxD = 2.2) => {
      let best = -1, bd = maxD;
      S.lines.forEach((l, i) => { const d = Math.abs(l.u - S.burr); if (!l.fallen && d <= bd) { bd = d; best = i; } });
      return best;
    };

    // ---- actions ----
    function act(a) {
      if (!S.started || S.over) return;
      const li = nearestLine();
      if (a === "assign") {
        if (S.mode === "god") {
          const gr = S.groups.find((q) => !q.gone && Math.abs(q.u - S.burr) < 2.2);
          if (gr) { gr.gone = true; gr.leaving = 1; S.cleared++; say("THE PEOPLE STEP ASIDE INTO A SIDE GROOVE"); }
          else say("NO ONE NEAR BURR TO LEAD AWAY", 1.2);
          return;
        }
        if (li < 0) { say("STAND BY A LINE TO ASSIGN", 1.2); return; }
        let src = -1, most = 0;
        S.lines.forEach((l, i) => { if (i !== li && !l.fallen && l.w > most) { most = l.w; src = i; } });
        if (src < 0) { say("NO WARRIOR TO SPARE", 1.2); return; }
        S.lines[src].w--; S.lines[li].w++; say(`A WARRIOR TO LINE ${li + 1}`, 1.2);
      } else if (a === "build") {
        if (li < 0) { say("STAND BY A LINE", 1.2); return; }
        if (S.cds.build > 0) { say("STILL CARRYING THE LAST PLANKS", 1); return; }
        if (S.engaged && S.engaged[li]) { say("NO PLANKS UNDER ATTACK: SHORE A LINE BEHIND", 1.4); return; }
        const l = S.lines[li]; l.hp = Math.min(10, l.hp + 3); S.cds.build = 3; say(`LINE ${li + 1} SHORED UP`, 1.2);
      } else if (a === "glue") {
        if (S.sap < 2) { say("NO SAP LEFT", 1.2); return; }
        if (S.mode === "god") {
          if (li < 0) { say("STAND BY A LINE TO LAY AN OFFERING", 1.2); return; }
          const l = S.lines[li];
          if (l.offering) { say("AN OFFERING ALREADY LIES HERE", 1.2); return; }
          if (S.beetle && S.beetle.u < l.u) { say("IT HAS ALREADY PASSED THIS LINE", 1.2); return; }
          l.offering = true; S.sap -= 2; say(`AN OFFERING AT LINE ${li + 1}`, 1.2); return;
        }
        S.sap -= 2; S.glue.push({ u: S.burr, t: 6 }); say("SAP-GLUE POURED", 1);
      } else if (a === "back") {
        if (S.mode === "god") return;
        const f = front();
        if (f <= 0) { say("THERE IS NO LINE BEHIND", 1.2); return; }
        const n = S.lines[f].w; S.lines[f].w = 0; S.lines[f - 1].w += n;
        say(`FALL BACK! ${n} TO LINE ${f}`, 1.5);
      }
    }

    // ---- input ----
    const KEYS = { KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right", KeyQ: "assign", KeyE: "build", KeyF: "glue", KeyR: "back" };
    const held = { left: false, right: false };
    on(window, "keydown", (e) => {
      const a = KEYS[e.code]; if (!a || !S.started) return; e.preventDefault();
      if (a === "left" || a === "right") { held[a] = true; S.target = null; } else if (!e.repeat) act(a);
    });
    on(window, "keyup", (e) => { const a = KEYS[e.code]; if (a === "left" || a === "right") held[a] = false; });
    wrap.querySelectorAll("." + P + "pad button").forEach((b) => {
      const a = b.dataset.a;
      if (a === "left" || a === "right") {
        on(b, "pointerdown", (e) => { e.preventDefault(); held[a] = true; S.target = null; try { b.setPointerCapture(e.pointerId); } catch { /* */ } });
        const up = () => { held[a] = false; };
        on(b, "pointerup", up); on(b, "pointercancel", up); on(b, "lostpointercapture", up);
      } else on(b, "click", () => act(a));
    });
    on(cv, "pointerdown", (e) => {
      if (!S.started) return;
      const r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      // invert the projection on the channel's mid-line (v = 1.5)
      let best = S.burr, bd = 1e9;
      for (let u = 0; u <= LEN; u += 0.25) { const p = proj(u, 1.5, 0); const d = (p.x - mx) ** 2 + (p.y - my) ** 2; if (d < bd) { bd = d; best = u; } }
      S.target = Math.max(1, Math.min(LEN - 1, best));
    });
    intro.querySelectorAll("button[data-r]").forEach((b) => on(b, "click", () => {
      S.mode = b.dataset.r; S.started = true; intro.remove();
      if (S.mode === "god") {
        S.beetle = { u: LEN + 2, will: 0 }; S.lines.forEach((l) => (l.w = 0)); say("THE VISITOR COMES. CLEAR ITS PATH", 2.5);
        const pad = wrap.querySelector("." + P + "pad");
        pad.querySelector("[data-a=assign]").innerHTML = "<b>Q</b>lead aside";
        pad.querySelector("[data-a=glue]").innerHTML = "<b>F</b>offering";
        pad.querySelector("[data-a=build]").hidden = true; pad.querySelector("[data-a=back]").hidden = true;
      }
      else say("HOLD THE LINES", 2);
    }));
    intro.querySelector("button[data-r]").focus();

    // ---- projection ----
    let W = 0, H = 0, K = 20, OX = 0, OY = 0;
    function fit() {
      const r = wrap.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // world extents: u 0..LEN, v -1..WID+1, z up to 4
      const cos = 0.866, sin = 0.5;
      const spanX = (LEN + WID + 2) * cos, spanY = (LEN + WID + 2) * sin + 4.5;
      const top = W < 560 ? 150 : 70, bottom = 70;
      K = Math.min((W - 24) / spanX, (H - top - bottom) / spanY);
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
    }
    function figure(u, v, col, spear, crest, s = 1) {
      const p = proj(u, v, 0); const k = K * 0.55 * s;
      g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(p.x, p.y, k * 0.5, k * 0.22, 0, 0, 7); g.fill();
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
      let dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (!dir && S.target != null) { const d = S.target - S.burr; if (Math.abs(d) < 0.1) S.target = null; else dir = Math.sign(d); }
      S.burr = Math.max(1, Math.min(LEN - 1, S.burr + dir * 6 * dt));
      S.glue.forEach((q) => (q.t -= dt)); S.glue = S.glue.filter((q) => q.t > 0);
      const slow = (u) => (S.glue.some((q) => Math.abs(q.u - u) < 1) ? 0.45 : 1);
      if (S.mode === "monster") updateMonster(dt, slow); else updateGod(dt);
    }

    function lineFalls(i, why) {
      const l = S.lines[i]; l.fallen = true; l.hp = 0;
      if (l.w > 0) { S.lost += l.w; say(`LINE ${i + 1} FALLS. ${l.w} WARRIOR${l.w > 1 ? "S" : ""} LOST`, 2.6); l.w = 0; }
      else say(`LINE ${i + 1} FALLS${why ? ". " + why : ""}`, 2.2);
      if (front() < 0) {
        S.over = true;
        later(() => api.end({ outcome: "lose", text: `The crack is breached. The Beetle walks into Highridge; bark integrity −5, the Battlements −3. ${S.lost} warrior${S.lost === 1 ? " is" : "s are"} on the Roll of the Bark.` }), 600);
      }
    }

    function updateMonster(dt, slow) {
      // mites
      for (const w of S.waves) if (!w.done && S.t >= w.at) {
        w.done = true; say(`MITES: ${w.n} IN THE CRACK`, 1.6);
        for (let i = 0; i < w.n; i++) S.mites.push({ u: LEN + 1 + i * 0.7, v: 0.4 + rnd() * 2.2, hp: 1 });
      }
      if (!S.beetle && S.t >= 14) { S.beetle = { u: LEN + 3 }; say("THE BEETLE CLIMBS FROM THE UNDER", 2.4); }
      const f = front();
      const engaged = new Array(5).fill(0);
      for (const m of S.mites) {
        const stop = f >= 0 ? S.lines[f].u + 0.6 : -5;
        if (m.u > stop) m.u -= 1.3 * slow(m.u) * dt;
        else if (f >= 0) { engaged[f]++; S.lines[f].hp -= 0.22 * slow(m.u) * dt; }
      }
      // warriors kill mites at their line
      S.lines.forEach((l, i) => {
        if (l.fallen || !l.w) return;
        const at = S.mites.filter((m) => Math.abs(m.u - (l.u + 0.6)) < 0.7);
        if (at.length) { at[0].hp -= 0.55 * l.w * dt; }
      });
      S.mites = S.mites.filter((m) => m.hp > 0);
      // the beetle
      if (S.beetle) {
        const b = S.beetle; const stop = f >= 0 ? S.lines[f].u + 1.6 : -5;
        if (b.u > stop) b.u -= 0.7 * slow(b.u) * dt;
        else if (f >= 0) {
          engaged[f] += 3;
          S.lines[f].hp -= 0.5 * slow(b.u) * dt;
          if (S.lines[f].w > 0) S.will = Math.max(0, S.will - dt);
        }
      }
      S.engaged = engaged;
      // repairs on quiet lines
      S.lines.forEach((l, i) => { if (!l.fallen && l.w && !engaged[i]) l.hp = Math.min(10, l.hp + 1 * dt); });
      if (f >= 0 && S.lines[f].hp <= 0) lineFalls(f);
      if (S.will <= 0 && !S.over) {
        S.over = true;
        const held = S.lines.filter((l) => !l.fallen).length;
        say("IT TURNS BACK", 3);
        S.beetle.leaving = true;
        later(() => api.end({ outcome: "win", text: `The Beetle's will is spent and it turns back to the Under. ${held} of 5 lines still stand. ${S.lost ? S.lost + " warrior" + (S.lost > 1 ? "s" : "") + " lost; their names go on the Roll of the Bark." : "No one is lost. Burr's spear is still unblooded."} The Battlements +4.` }), 1400);
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
      }
      for (const q of S.groups) {
        if (q.leaving) q.leaving = Math.max(0, q.leaving - dt);
        if (!q.gone && b.u - 1.4 < q.u) {
          q.gone = true; q.hit = true; S.disturbed++;
          say(S.disturbed >= 2 ? "THE VISITOR IS DISTURBED AGAIN" : "THE VISITOR WALKS INTO THE PEOPLE. THEY SCATTER", 2.4);
        }
      }
      for (const l of S.lines) if (!l.passed && b.u < l.u) { l.passed = true; if (!l.offering) say(`IT PASSED LINE ${S.lines.indexOf(l) + 1} WITH NO OFFERING`, 1.8); }
      if (S.disturbed >= 2 && !S.over) {
        S.over = true;
        later(() => api.end({ outcome: "lose", text: "Twice the god walked into its people. They scattered into the side grooves; hands −2, morale −4. The Knot will say the visitor was angered." }), 900);
      }
      if (b.u < -2 && !S.over) {
        S.over = true;
        const offered = S.lines.filter((l) => l.offering).length;
        api.end({ outcome: "win", text: `The visitor passes on its own, up and away over the ridge. ${offered} of 5 lines laid an offering; ${S.disturbed ? "one group was startled" : "no one stood in its path"}. Nobody is lost.` });
      }
    }

    // ---- drawing ----
    function draw() {
      g.clearRect(0, 0, W, H);
      // ground slab
      cube(-0.5, -1.2, -0.6, LEN + 1, WID + 2.4, 0.6, C.umberD, "#2a1d14", "#33241a");
      // channel floor
      for (let u = 0; u < LEN; u++) for (let v = 0; v < WID; v++) {
        const A = proj(u, v, 0), B = proj(u + 1, v, 0), Cc = proj(u + 1, v + 1, 0), D = proj(u, v + 1, 0);
        poly([A, B, Cc, D], (u + v) % 2 ? "#4a3324" : "#46301f", "rgba(0,0,0,.18)");
      }
      // glue pools
      for (const q of S.glue) { const p = proj(q.u, 1.5, 0); g.fillStyle = `rgba(217,144,42,${0.35 + 0.4 * Math.min(1, q.t / 2)})`; g.beginPath(); g.ellipse(p.x, p.y, K * 1.3, K * 0.65, 0, 0, 7); g.fill(); }
      // the Highridge end: lantern doors
      for (let i = 0; i < 2; i++) { const p = proj(0.6, 0.6 + i * 1.6, 0); g.fillStyle = C.lantern; g.globalAlpha = 0.85; g.beginPath(); g.arc(p.x, p.y - K * 0.6, K * 0.22, 0, 7); g.fill(); g.globalAlpha = 1; }

      const items = [];
      // back wall of bark blocks (v = -1) and a low front lip (v = WID)
      for (let u = 0; u < LEN; u++) {
        const h = 2 + ((u * 7) % 5 === 0 ? 2 : (u * 3) % 4 === 0 ? 1 : 0);
        items.push({ d: u - 1, f: () => { for (let z = 0; z < h; z++) cube(u, -1, z, 1, 1, 1, z === h - 1 ? C.grey : C.umberL, C.umber, C.umberD); } });
        items.push({ d: u + WID + 0.2, f: () => cube(u, WID, 0, 1, 0.6, 0.35, C.umberL, C.umber, C.umberD) });
      }
      // barricade lines
      S.lines.forEach((l, i) => {
        items.push({ d: l.u + 1.5, f: () => {
          if (l.fallen) {
            for (let v = 0.2; v < WID; v += 0.7) cube(l.u - 0.15, v, 0, 0.5, 0.35, 0.12, "#3a281c", "#2a1d14", "#2a1d14");
            return;
          }
          const hh = 0.25 + 0.75 * (l.hp / 10);
          cube(l.u - 0.2, 0, 0, 0.4, WID, hh, l.hp < 3.5 ? C.red : C.greyL, C.umber, C.umberL);
          for (let v = 0.25; v < WID; v += 0.5) { const a = proj(l.u, v, hh), b2 = proj(l.u, v, hh + 0.55); g.strokeStyle = C.paper; g.lineWidth = Math.max(1, K * 0.07); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b2.x, b2.y); g.stroke(); }
          if (l.offering) { const p = proj(l.u - 0.6, WID - 0.4, 0); g.fillStyle = C.gold; g.beginPath(); g.arc(p.x, p.y - K * 0.2, K * 0.2, 0, 7); g.fill(); }
          // line number marker
          const m = proj(l.u, WID + 0.9, 0); g.fillStyle = i === front() ? C.gold : C.greyL; g.font = `600 ${Math.max(10, K * 0.55)}px ui-monospace,monospace`; g.textAlign = "center"; g.fillText(String(i + 1), m.x, m.y);
        } });
        for (let k = 0; k < l.w; k++) items.push({ d: l.u - 0.6 + 0.4 + k * 0.01, f: () => figure(l.u - 0.55, 0.4 + (k % 4) * 0.65, "#a8977f", true, false, 1.45) });
      });
      // people groups (escort)
      for (const q of S.groups) {
        if (q.gone && !q.leaving) continue;
        const v = q.gone ? q.v - (1 - q.leaving) * 3 : q.v;
        items.push({ d: q.u + v, f: () => { for (let k = 0; k < 3; k++) figure(q.u + k * 0.35, v + (k % 2) * 0.3, C.sage, false, false, 1.1); const p = proj(q.u, v, 0); g.fillStyle = C.lantern; g.beginPath(); g.arc(p.x + K * 0.2, p.y - K * 0.9, K * 0.1, 0, 7); g.fill(); } });
      }
      // mites
      for (const m of S.mites) items.push({ d: m.u + m.v, f: () => { const p = proj(m.u, m.v, 0); g.fillStyle = C.red; g.beginPath(); g.ellipse(p.x, p.y - K * 0.12, K * 0.18, K * 0.12, 0, 0, 7); g.fill(); g.strokeStyle = C.dark; g.lineWidth = 1; for (let s = -1; s <= 1; s++) { g.beginPath(); g.moveTo(p.x + s * K * 0.1, p.y - K * 0.1); g.lineTo(p.x + s * K * 0.2, p.y + K * 0.04); g.stroke(); } } });
      // the beetle
      if (S.beetle && S.beetle.u < LEN + 2.5) {
        const b = S.beetle;
        items.push({ d: b.u + 1.5, f: () => {
          const p = proj(b.u + 0.8, 1.5, 0), k = K;
          g.fillStyle = "rgba(0,0,0,.4)"; g.beginPath(); g.ellipse(p.x, p.y, k * 1.9, k * 0.9, 0, 0, 7); g.fill();
          g.strokeStyle = "#0b0f0c"; g.lineWidth = Math.max(1.5, k * 0.12);
          for (let s = -1; s <= 1; s++) for (const side of [-1, 1]) { g.beginPath(); g.moveTo(p.x + s * k * 0.7, p.y - k * 0.5); g.lineTo(p.x + s * k * 0.9 + side * k * 0.4, p.y + side * k * 0.55); g.stroke(); }
          const grd = g.createRadialGradient(p.x - k * 0.5, p.y - k * 1.2, k * 0.1, p.x, p.y - k * 0.7, k * 1.8);
          grd.addColorStop(0, "#3d5a48"); grd.addColorStop(0.5, "#16201a"); grd.addColorStop(1, "#070908");
          g.fillStyle = grd; g.beginPath(); g.ellipse(p.x + k * 0.2, p.y - k * 0.75, k * 1.6, k * 0.95, -0.35, 0, 7); g.fill();
          g.fillStyle = "#101511"; g.beginPath(); g.ellipse(p.x - k * 1.45, p.y - k * 0.2, k * 0.5, k * 0.38, -0.35, 0, 7); g.fill();
          g.strokeStyle = "rgba(196,214,90,.25)"; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x - k * 0.9, p.y - k * 0.5); g.lineTo(p.x + k * 1.4, p.y - k * 1.3); g.stroke();
        } });
      }
      // Burr
      items.push({ d: S.burr + 2.2, f: () => { figure(S.burr, 2.2, C.amber, true, true, 1.6); const p = proj(S.burr, 2.2, 0); g.strokeStyle = C.gold; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(p.x, p.y, K * 0.55, K * 0.27, 0, 0, 7); g.stroke(); g.setLineDash([]); } });
      items.sort((a, b) => a.d - b.d).forEach((it) => it.f());
    }

    function renderHud() {
      const notches = S.lines.map((l) => `<i class="${P}notch${l.fallen ? " " + P + "off" : ""}"></i>`).join("");
      const lost = S.lost ? ` · lost ${S.lost}` : "";
      let second = "", note = "";
      if (S.mode === "god") {
        const pct = S.beetle ? Math.max(0, Math.min(1, 1 - (S.beetle.u + 2) / (LEN + 4))) : 0;
        const off = S.lines.filter((l) => l.offering).length;
        second = `<div class="${P}row"><span>PASSAGE</span><div class="${P}bar"><i style="width:${(pct * 100).toFixed(1)}%;background:#c4d65a"></i></div></div>
<div class="${P}row"><span>OFFER</span>${off}/5 · sap ${S.sap} · startled ${S.disturbed}/2</div>`;
        note = "beetle: read as god";
      } else {
        second = `<div class="${P}row"><span>WILL</span><div class="${P}bar"><i style="width:${(S.will / 60 * 100).toFixed(1)}%"></i></div></div>
<div class="${P}row"><span>SQUAD</span>${S.lines.reduce((a, l) => a + l.w, 0)} standing${lost} · sap ${S.sap}</div>`;
        note = "beetle: read as monster";
      }
      hud.innerHTML = `<div class="${P}row"><span>LINES</span><div>${notches}</div></div>${second}<div class="${P}note">${S.mode ? note : ""}</div>`;
    }

    let last = performance.now(), hudT = 0;
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (S.started && !S.over) update(dt);
      else if (S.over && S.beetle && S.beetle.leaving) S.beetle.u += 1.2 * dt;
      draw();
      hudT -= dt; if (hudT <= 0) { renderHud(); hudT = 0.12; }
      msgEl.textContent = S.msgT > 0 ? S.msg : "";
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
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

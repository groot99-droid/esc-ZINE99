// Missing Campsites / Torchlight loop (2D, charcoal chiaroscuro).
//
// DESIGN.md section 10, mode A, cut to one sequence: torch_loop_2, the carrying run at day 2 dusk.
// Posts 19 to 16 stand south of the five sites. Each goes at its time (16 at 40 s, 17 at 70 s,
// 18 at 140 s, 19 at 170 s) the first moment it is outside the torch circle. Hold E for 2 s at a
// post to pull it; one post slows Tam to x0.6, two to x0.45. Walking into the five sites sets
// carried posts in free slots. Battery drains 25 a minute walking, 10 standing; at 0 June comes
// with a lantern and walks Tam home. Dell calls everyone to the van at the end of the run.
// Win: three or four posts held in the slots. Fewer: the posts went.

const PPM = 24;                       // pixels per metre in the pre-drawn ground
const WX0 = -9, WX1 = 11, WY0 = -7, WY1 = 62;
const TORCH_R = 1.75;                 // the circle is 3.5 m across
const SPEED = 1.4;
const RUN_S = 205;                    // Dell calls at the van
const POSTS = [
  { n: 19, y: 14, due: 170 }, { n: 18, y: 26, due: 140 },
  { n: 17, y: 38, due: 70 }, { n: 16, y: 50, due: 40 },
];
const DX0 = -24, DX1 = 26, DY0 = -16, DY1 = 72;   // the charcoal reaches past any screen
const roadX = (y) => 2.1 * Math.sin(y / 8.5);

const CSS = (p) => `
.missing-campsites-torchlight-loop-wrap{position:absolute;inset:0;overflow:hidden;background:#141518;touch-action:none;user-select:none;-webkit-user-select:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:#e9e2d2}
.missing-campsites-torchlight-loop-wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.missing-campsites-torchlight-loop-hud{position:absolute;top:12px;left:12px;background:rgba(11,12,15,.78);padding:6px 10px;font-size:clamp(14px,2.4vw,20px);letter-spacing:.04em}
.missing-campsites-torchlight-loop-hud small{display:block;font-size:11px;opacity:.75;letter-spacing:.08em;margin-top:2px}
.missing-campsites-torchlight-loop-bat{height:5px;background:#3a3c42;margin-top:5px;width:120px}
.missing-campsites-torchlight-loop-bat i{display:block;height:100%;background:${p.accent || "#ffb35c"}}
.missing-campsites-torchlight-loop-tally{position:absolute;top:12px;right:12px;width:74px;background:rgba(232,225,207,.93);color:#4a4a4c;padding:8px 6px;font-family:Caveat,'Segoe Print',cursive;font-size:20px;line-height:1.05;box-sizing:border-box}
.missing-campsites-torchlight-loop-tally b{display:block;font:600 10px 'IBM Plex Mono',monospace;letter-spacing:.14em;margin-bottom:4px}
.missing-campsites-torchlight-loop-sketch{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:min(520px,calc(100% - 24px));height:44px;background:rgba(232,225,207,.9)}
.missing-campsites-torchlight-loop-btns{position:absolute;right:12px;bottom:64px;display:flex;flex-direction:column;gap:8px}
.missing-campsites-torchlight-loop-btns button{font:600 13px 'IBM Plex Mono',monospace;color:#e9e2d2;background:rgba(20,21,24,.85);border:1px solid #e9e2d2;padding:10px 14px;min-width:96px;cursor:pointer;touch-action:none}
.missing-campsites-torchlight-loop-btns button:focus-visible{outline:2px solid ${p.accent || "#ffb35c"}}
.missing-campsites-torchlight-loop-msg{position:absolute;left:50%;top:18%;transform:translateX(-50%);font-family:Caveat,'Segoe Print',cursive;font-size:clamp(20px,3.6vw,28px);color:#f6e7c8;text-shadow:0 1px 6px #000;text-align:center;pointer-events:none;width:min(560px,90%)}
.missing-campsites-torchlight-loop-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,11,14,.82);z-index:5;padding:16px}
.missing-campsites-torchlight-loop-intro div{max-width:460px;background:#e8e1cf;color:#2b2a27;padding:20px 22px;box-shadow:0 10px 40px #000}
.missing-campsites-torchlight-loop-intro h2{margin:0 0 8px;font:700 24px 'Zilla Slab',Georgia,serif}
.missing-campsites-torchlight-loop-intro p{margin:0 0 8px;font-size:13px;line-height:1.5}
.missing-campsites-torchlight-loop-intro button{margin-top:6px;font:600 14px 'IBM Plex Mono',monospace;background:#141518;color:#ffb35c;border:0;padding:10px 20px;cursor:pointer}
`;

function drawGround(rng) {
  const c = document.createElement("canvas");
  c.width = (WX1 - WX0) * PPM; c.height = (WY1 - WY0) * PPM;
  const g = c.getContext("2d");
  const X = (x) => (x - WX0) * PPM, Y = (y) => (y - WY0) * PPM;
  g.fillStyle = "#5b4a33"; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 9000; i++) {                // needles and duff
    g.fillStyle = rng() < 0.5 ? "rgba(122,98,67,.6)" : "rgba(58,44,28,.55)";
    const x = rng() * c.width, y = rng() * c.height, a = rng() * Math.PI;
    g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-4, -0.6, 8 + rng() * 6, 1.3); g.restore();
  }
  for (let y = WY0; y < WY1; y += 0.25) {          // the gravel road, 3 m wide
    g.fillStyle = "#a49478";
    g.fillRect(X(roadX(y) - 1.5), Y(y), 3 * PPM, 0.3 * PPM);
  }
  for (let i = 0; i < 7000; i++) {
    const y = WY0 + rng() * (WY1 - WY0), x = roadX(y) + (rng() - 0.5) * 2.9;
    g.fillStyle = rng() < 0.5 ? "rgba(216,204,176,.8)" : "rgba(120,108,88,.7)";
    g.beginPath(); g.arc(X(x), Y(y), 0.6 + rng() * 1.6, 0, 7); g.fill();
  }
  // the five sites: a trodden clearing at the north end
  g.fillStyle = "rgba(179,165,133,.7)";
  g.beginPath(); g.ellipse(X(1), Y(-2.5), 7.5 * PPM, 3.6 * PPM, 0, 0, 7); g.fill();
  return c;
}

function drawDark(rng) {                           // the charcoal field outside the light
  const c = document.createElement("canvas");
  c.width = (DX1 - DX0) * 16; c.height = (DY1 - DY0) * 16;
  const g = c.getContext("2d");
  g.fillStyle = "#141518"; g.fillRect(0, 0, c.width, c.height);
  g.lineCap = "round";
  for (let i = 0; i < 2200; i++) {                 // smudged grey charcoal, nothing to read in it
    const v = 40 + rng() * 26;
    g.strokeStyle = `rgba(${v},${v + 1},${v + 4},${0.05 + rng() * 0.1})`;
    g.lineWidth = 1 + rng() * 5;
    const x = rng() * c.width, y = rng() * c.height, a = -0.5 + rng() * 0.4, l = 14 + rng() * 55;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l * 0.5, y + l * a - 6, x + l, y + l * a); g.stroke();
  }
  return c;
}

export default {
  mount(root, api) {
    const p = api.palette || {};
    const rng = api.rng("hollin-torch");
    const wrap = document.createElement("div");
    wrap.className = "missing-campsites-torchlight-loop-wrap";
    wrap.innerHTML = `<style>${CSS(p)}</style><canvas aria-label="Top-down view of the loop road by torchlight"></canvas>
      <div class="missing-campsites-torchlight-loop-hud"><span class="c">POSTS: 9</span><small class="k">19:05 · dusk</small><div class="missing-campsites-torchlight-loop-bat"><i></i></div></div>
      <div class="missing-campsites-torchlight-loop-tally"><b>TALLY</b><span class="t"></span></div>
      <svg class="missing-campsites-torchlight-loop-sketch" viewBox="0 0 520 44" preserveAspectRatio="none" aria-hidden="true"></svg>
      <div class="missing-campsites-torchlight-loop-btns"><button type="button" class="pull">Pull (E)</button><button type="button" class="tick">Tick (T)</button></div>
      <div class="missing-campsites-torchlight-loop-msg" aria-live="polite"></div>
      <div class="missing-campsites-torchlight-loop-intro"><div><h2>Torchlight loop</h2>
        <p>Day 2, dusk. Posts 19 to 16 stand south of the five sites, and the loss is coming up the road. A post goes the first moment no light is on it.</p>
        <p>Walk with WASD, arrows, or hold a finger where you want to go. At a post, hold <b>E</b> (or Pull) for two seconds to pull it; carry up to two back into the five sites. Hold three to win.</p>
        <button type="button" class="go">Start</button></div></div>`;
    root.appendChild(wrap);
    const canvas = wrap.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const $ = (s) => wrap.querySelector(s);
    const msgEl = $(".missing-campsites-torchlight-loop-msg");
    const ground = drawGround(rng), dark = drawDark(rng);

    const st = {
      x: roadX(1), y: 1, t: 0, battery: 100, carried: [], slotted: [], running: false, over: false,
      pullT: 0, pulling: false, keys: new Set(), ptr: null, msgT: 0, ticked: new Set(), juneT: -1, flick: 0,
    };
    const posts = POSTS.map((o) => ({ ...o, x: roadX(o.y) + 2.5, gone: false, pulled: false }));
    let W = 0, H = 0, S = 40, dpr = 1, raf = 0, last = 0;
    const timers = [];

    function say(text, secs = 3) { msgEl.textContent = text; st.msgT = secs; }

    function resize() {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      S = Math.max(26, Math.min(70, Math.min(W, H) / 11.5));
    }
    const ro = new ResizeObserver(resize); ro.observe(wrap); resize();

    // Tam's pencil sketch of the road: it never loses anything.
    const sk = $(".missing-campsites-torchlight-loop-sketch");
    const NS = "http://www.w3.org/2000/svg";
    const sv = (tag, a) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); sk.appendChild(n); return n; };
    sv("path", { d: "M20 22 Q140 16 260 22 T500 22", fill: "none", stroke: "#4a4a4c", "stroke-width": 1.6 });
    const skX = (y) => 20 + (y + 3) / 56 * 480;
    [["20–24", -2], ["19", 14], ["18", 26], ["17", 38], ["16", 50]].forEach(([n, y]) => {
      sv("line", { x1: skX(y), x2: skX(y), y1: 16, y2: 28, stroke: "#4a4a4c", "stroke-width": 1.2 });
      const t = sv("text", { x: skX(y), y: 41, "text-anchor": "middle", "font-size": 11, fill: "#4a4a4c", "font-family": "Caveat, cursive" });
      t.textContent = n;
    });
    const skDot = sv("circle", { r: 5, cy: 22, fill: p.accent || "#ffb35c", stroke: "#3a2a10", "stroke-width": 1.5 });

    function existing() { return 5 + posts.filter((q) => !q.gone).length; }
    function hud() {
      $(".c").textContent = `POSTS: ${existing()}`;
      const mins = 5 + Math.floor(st.t / 60 * 5);     // the run compresses dusk into minutes
      $(".k").textContent = `19:${String(Math.min(30, mins)).padStart(2, "0")} · carrying ${st.carried.length}/2`;
      $(".missing-campsites-torchlight-loop-bat i").style.width = Math.max(0, st.battery) + "%";
      const tl = [...st.ticked].sort((a, b) => b - a).map((n) => `${n} |`).join("<br>");
      $(".t").innerHTML = tl || "&nbsp;";
      skDot.setAttribute("cx", skX(Math.max(-3, Math.min(53, st.y))));
    }

    const near = () => posts.find((q) => !q.gone && !q.pulled && Math.hypot(q.x - st.x, q.y - st.y) < 1.7);
    function tick() {
      const q = near();
      if (q && !st.ticked.has(q.n)) { st.ticked.add(q.n); say(`Post ${q.n}: ticked in pencil.`, 1.6); hud(); }
    }

    function finish(reason) {
      if (st.over) return;
      st.over = true; st.running = false;
      const held = st.slotted.length + (reason === "june" ? st.carried.length : 0);
      const ticks = st.ticked.size;
      const lead = reason === "june"
        ? "The torch dies. June's walkie crackles, and she comes down the road with a lantern and walks you home. "
        : "Dell calls everyone to the van. ";
      const tail = ` ${ticks ? `Your tally holds ${ticks} tick${ticks > 1 ? "s" : ""}; the counter says ${existing()}.` : ""}`;
      if (held >= 3) api.end({ outcome: "win", text: `${lead}${held} post${held > 1 ? "s" : ""} stand in the slots at the five sites. They will hold with them.${tail}` });
      else api.end({ outcome: "lose", text: `${lead}Only ${held} post${held === 1 ? "" : "s"} made it into the slots. The rest went while nobody was looking.${tail}` });
    }

    function step(dt) {
      st.t += dt;
      let mx = 0, my = 0;
      const k = st.keys;
      if (k.has("a") || k.has("arrowleft")) mx -= 1;
      if (k.has("d") || k.has("arrowright")) mx += 1;
      if (k.has("w") || k.has("arrowup")) my -= 1;
      if (k.has("s") || k.has("arrowdown")) my += 1;
      if (!mx && !my && st.ptr) {
        const wx = st.x + (st.ptr.x - W / 2) / S, wy = st.y + (st.ptr.y - H / 2) / S;
        const dx = wx - st.x, dy = wy - st.y, d = Math.hypot(dx, dy);
        if (d > 0.25) { mx = dx / d; my = dy / d; }
      }
      const moving = (mx || my) && !st.pulling;
      if (moving) {
        const d = Math.hypot(mx, my);
        const mult = st.carried.length === 2 ? 0.45 : st.carried.length === 1 ? 0.6 : 1;
        st.x += mx / d * SPEED * mult * dt; st.y += my / d * SPEED * mult * dt;
        st.x = Math.max(roadX(st.y) - 6, Math.min(roadX(st.y) + 6, st.x));
        st.y = Math.max(-5, Math.min(57, st.y));
        if (st.y > 56.5) say("Past 16 the road is only forest floor now.", 2);
      }
      st.battery -= (moving ? 25 : 10) / 60 * dt;
      // pulling
      const q = near();
      if (st.pulling && q && st.carried.length < 2) {
        st.pullT += dt;
        if (st.pullT >= 2) {
          q.pulled = true; st.carried.push(q.n); st.pullT = 0; st.pulling = false;
          say(`Post ${q.n} comes out of the ground. Heavy.`, 2);
        }
      } else { st.pullT = 0; if (st.pulling && st.carried.length >= 2) say("Two is the most you can carry.", 1.5); }
      // set posts into the slots at the five sites
      if (st.y < 2.5 && st.carried.length) {
        st.slotted.push(...st.carried);
        say(`Post${st.carried.length > 1 ? "s" : ""} ${st.carried.join(" and ")} set in a slot at the five sites.`, 2.4);
        st.carried = [];
      }
      // erasure: only outside the light, never seen
      for (const o of posts) {
        if (o.gone || o.pulled || st.t < o.due) continue;
        if (Math.hypot(o.x - st.x, o.y - st.y) > TORCH_R) o.gone = true;
      }
      if (st.msgT > 0) { st.msgT -= dt; if (st.msgT <= 0) msgEl.textContent = ""; }
      if (st.battery <= 0 && st.juneT < 0) { st.battery = 0; st.juneT = 2.5; say("The torch shrinks to almost nothing.", 3); }
      if (st.juneT >= 0) { st.juneT -= dt; if (st.juneT <= 0) finish("june"); }
      const left = posts.filter((o) => !o.gone && !o.pulled).length;
      if (st.t >= RUN_S || (left === 0 && st.carried.length === 0)) finish("van");
    }

    function draw() {
      const c = ctx;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ox = W / 2 - st.x * S, oy = H / 2 - st.y * S;
      const wx = (x) => ox + x * S, wy = (y) => oy + y * S;
      c.fillStyle = "#141518"; c.fillRect(0, 0, W, H);
      c.drawImage(dark, wx(DX0), wy(DY0), (DX1 - DX0) * S, (DY1 - DY0) * S);
      const R = (st.battery <= 0 ? 0.5 : TORCH_R) * S * (1 + st.flick);
      const cx = W / 2, cy = H / 2;
      c.save();
      c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
      c.drawImage(ground, wx(WX0), wy(WY0), (WX1 - WX0) * S, (WY1 - WY0) * S);
      // site furniture that still exists: gravel apron, fire ring, cedar post
      for (const o of posts) {
        if (o.gone) {                                    // the road narrows a hand's width here
          c.fillStyle = "#5b4a33"; c.fillRect(wx(roadX(o.y) + 1.25), wy(o.y - 1.6), 0.3 * S, 3.2 * S);
          continue;
        }
        c.fillStyle = "rgba(203,189,158,.85)";
        c.beginPath(); c.ellipse(wx(o.x + 1.3), wy(o.y + 0.3), 1.9 * S, 1.3 * S, 0, 0, 7); c.fill();
        c.strokeStyle = "#77706a"; c.lineWidth = 0.22 * S; c.setLineDash([0.3 * S, 0.12 * S]);
        c.beginPath(); c.arc(wx(o.x + 2.1), wy(o.y + 0.7), 0.5 * S, 0, 7); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#2b2420"; c.beginPath(); c.arc(wx(o.x + 2.1), wy(o.y + 0.7), 0.38 * S, 0, 7); c.fill();
        if (!o.pulled) {
          c.fillStyle = "#8a5a3b"; c.strokeStyle = "#4a2e1c"; c.lineWidth = 2;
          c.fillRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.strokeRect(wx(o.x) - 0.3 * S, wy(o.y) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.55 * S)}px sans-serif`;
          c.fillText(String(o.n), wx(o.x) - 0.45 * S, wy(o.y) - 0.45 * S);
        } else {
          c.fillStyle = "#2b2420"; c.beginPath(); c.arc(wx(o.x), wy(o.y), 0.2 * S, 0, 7); c.fill();
        }
      }
      // the slots at the five sites
      for (let i = 0; i < 10; i++) {
        const sx = -3.4 + i * 0.95, sy = -3.2;
        const filled = st.slotted[i];
        c.strokeStyle = "#3a2c1c"; c.lineWidth = 1.5;
        c.strokeRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S);
        if (filled) {
          c.fillStyle = "#8a5a3b"; c.fillRect(wx(sx) - 0.3 * S, wy(sy) - 0.3 * S, 0.6 * S, 0.6 * S);
          c.fillStyle = "#f6e7c8"; c.font = `bold ${Math.round(0.4 * S)}px sans-serif`;
          c.fillText(String(filled), wx(sx) - 0.24 * S, wy(sy) + 0.14 * S);
        }
      }
      // the amber light, 3000 K, falling off into charcoal
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, R);
      gr.addColorStop(0, "rgba(255,240,200,.30)"); gr.addColorStop(0.5, "rgba(255,179,92,.14)");
      gr.addColorStop(0.82, "rgba(90,44,12,.32)"); gr.addColorStop(1, "rgba(20,21,24,.92)");
      c.fillStyle = gr; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      c.restore();
      // a smudged halo where charcoal meets light
      const hg = c.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.35);
      hg.addColorStop(0, "rgba(20,21,24,.0)"); hg.addColorStop(0.3, "rgba(20,21,24,.75)"); hg.addColorStop(1, "rgba(20,21,24,0)");
      c.fillStyle = hg; c.beginPath(); c.arc(cx, cy, R * 1.35, 0, 7); c.fill();
      // Tam, from above, with whatever is carried
      c.fillStyle = "#2a3346"; c.beginPath(); c.ellipse(cx, cy + 0.06 * S, 0.34 * S, 0.24 * S, 0, 0, 7); c.fill();
      c.fillStyle = "#3b2b22"; c.beginPath(); c.arc(cx, cy, 0.17 * S, 0, 7); c.fill();
      st.carried.forEach((n, i) => {
        c.fillStyle = "#8a5a3b"; c.fillRect(cx - 0.55 * S + i * 0.75 * S, cy + 0.35 * S, 0.35 * S, 0.35 * S);
      });
      if (st.pullT > 0) {
        c.strokeStyle = p.accent || "#ffb35c"; c.lineWidth = 4;
        c.beginPath(); c.arc(cx, cy, 0.7 * S, -Math.PI / 2, -Math.PI / 2 + st.pullT / 2 * Math.PI * 2); c.stroke();
      }
      if (st.battery <= 0) {                              // June's lantern on the road
        const t = Math.max(0, st.juneT) / 2.5;
        c.fillStyle = "rgba(255,190,110,.6)"; c.beginPath(); c.arc(cx, cy - (1 + t * 3) * S, 0.45 * S, 0, 7); c.fill();
      }
    }

    function loop(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      if (st.running) {
        step(dt);
        st.flick = api.reducedMotion ? 0 : (Math.sin(now / 90) * 0.006 + Math.sin(now / 37) * 0.004);
        hud();
      }
      draw();
      if (!st.over) raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    // input
    const kd = (e) => {
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowleft", "arrowright", "arrowup", "arrowdown"].includes(k)) { st.keys.add(k); e.preventDefault(); }
      if (k === "e") st.pulling = true;
      if (k === "t" && st.running) tick();
    };
    const ku = (e) => { const k = e.key.toLowerCase(); st.keys.delete(k); if (k === "e") st.pulling = false; };
    const pd = (e) => { if (!st.running) return; canvas.setPointerCapture?.(e.pointerId); const r = canvas.getBoundingClientRect(); st.ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pm = (e) => { if (!st.ptr) return; const r = canvas.getBoundingClientRect(); st.ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pu = () => { st.ptr = null; };
    const pullBtn = $(".pull");
    const pbd = (e) => { e.preventDefault(); st.pulling = true; };
    const pbu = () => { st.pulling = false; };
    const tickBtn = () => st.running && tick();
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    canvas.addEventListener("pointerdown", pd); canvas.addEventListener("pointermove", pm);
    canvas.addEventListener("pointerup", pu); canvas.addEventListener("pointercancel", pu);
    pullBtn.addEventListener("pointerdown", pbd); pullBtn.addEventListener("pointerup", pbu);
    pullBtn.addEventListener("pointerleave", pbu); pullBtn.addEventListener("pointercancel", pbu);
    $(".tick").addEventListener("click", tickBtn);
    $(".go").addEventListener("click", () => {
      $(".missing-campsites-torchlight-loop-intro").remove();
      st.running = true; last = 0;
      say("Post 16 is furthest. It will go first.", 3);
      canvas.focus?.();
    });
    $(".go").focus();
    hud();

    return {
      unmount() {
        st.over = true; st.running = false;
        cancelAnimationFrame(raf);
        timers.forEach(clearTimeout);
        ro.disconnect();
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  },
};

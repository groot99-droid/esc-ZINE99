// The Endless Temple / The stacks (2D, scroll). Style: Impossible-architecture line drawing.
// DESIGN.md section 10, Mode B, sequence s2_stacks_c5: five junctions, rolling ladders, the call
// as falling drops (drawn as gold motes: the only colour on the page). Side-on through shelves
// that do not end, toward the weather book that is calling.
//
// Walk (A/D or arrows). At a junction take a ladder up (W/Up), a hatch down (S/Down) or walk on.
// Where the motes thicken is the right way: it lengthens the bookmark ribbon. The wrong way thins
// them, and the aisle bends back to the last junction. Rolling ladders: press E (Grab) to ride,
// push with D, E again to step off. Falling books cast a shadow a second before they land; a hit
// staggers you, and a hit on a ladder drops you back to the landing. No failure is fatal: the run
// is scored by time and wrong turns.

const JUNCTIONS = 5;
const EXITS = ["up", "down", "on"];

export default {
  mount(root, api) {
    const P = "endless-temple-stacks-";
    const rng = api.rng("et-stacks-c5");
    const C = { paper: "#efe8d6", ink: "#2a2a2a", faint: "rgba(42,42,42,.35)", gold: "#d4a23a", goldHi: "#f0c45a", sage: "#8fa07a" };
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:hidden;background:${C.paper};touch-action:none;user-select:none;-webkit-user-select:none}
    .${P}root canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    .${P}pad{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:10px 12px 12px;pointer-events:none;gap:8px}
    .${P}pad div{display:flex;gap:8px}
    .${P}pad button{pointer-events:auto;font:600 15px 'EB Garamond',Georgia,serif;color:${C.ink};background:rgba(239,232,214,.9);border:1px solid ${C.ink};min-width:56px;min-height:56px;border-radius:4px;touch-action:none}
    .${P}pad button.${P}on{background:${C.goldHi}}
    @media (hover:hover) and (pointer:fine){.${P}pad{opacity:.7}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,232,214,.8);z-index:5;padding:16px}
    .${P}intro div{max-width:460px;background:${C.paper};color:${C.ink};padding:24px;border:1px solid ${C.ink};outline:1px solid ${C.ink};outline-offset:5px;font-family:'EB Garamond',Georgia,serif}
    .${P}intro h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:0 0 8px}
    .${P}intro p{margin:0 0 10px}
    .${P}intro button{font:inherit;font-size:17px;padding:8px 26px;border:1px solid ${C.ink};background:${C.goldHi};cursor:pointer}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `<canvas aria-label="Side-on shelves that do not end; a stream of gold motes drifts toward the calling book."></canvas>
      <div class="${P}pad"><div><button type="button" data-k="left">◀</button><button type="button" data-k="right">▶</button></div>
      <div><button type="button" data-k="grab">Grab</button><button type="button" data-k="down">▼</button><button type="button" data-k="up">▲</button></div></div>`;
    root.append(css, el);
    const cv = el.querySelector("canvas");
    const g = cv.getContext("2d");

    // ---- segments ------------------------------------------------------------------------------
    // a segment is an aisle; it ends in a junction (three exits), a bend back (after a wrong turn),
    // or the calling book (after the last junction)
    const answers = Array.from({ length: JUNCTIONS }, () => EXITS[Math.floor(rng() * 3)]);
    function makeSeg(kind) {
      const L = 40 + Math.floor(rng() * 24);
      const seg = { kind, L, seed: Math.floor(rng() * 1e6), books: [], ladders: [] };
      if (kind !== "book") for (let x = 8; x < L - 12; x += 7 + rng() * 8) seg.books.push({ x, t: -1, state: "wait", trig: x - 3 - rng() * 2 });
      if (rng() < 0.85) seg.ladders.push({ x: 4 + rng() * 6, v: 0, rail: [2, L - 14] });
      return seg;
    }
    const S = {
      ribbon: 0, wrong: 0, hits: 0, t: 0, started: false, done: false,
      seg: makeSeg("junction"), x: 1.5, v: 0, facing: 1, climb: null, stagger: 0, riding: null, runT: 0,
      motes: [], msg: "", msgT: 0, fade: 0,
    };
    const keys = { left: false, right: false, up: false, down: false };
    function say(t, s = 2.4) { S.msg = t; S.msgT = s; }
    const exitX = (seg) => ({ up: seg.L - 9, down: seg.L - 5, on: seg.L });

    function enter(kind) { S.seg = makeSeg(kind); S.x = 1.5; S.v = 0; S.riding = null; S.motes = []; S.fade = 1; }
    function takeExit(ex) {
      const seg = S.seg;
      if (seg.kind === "junction") {
        if (ex === answers[S.ribbon]) {
          S.ribbon++;
          if (S.ribbon >= JUNCTIONS) { enter("book"); say("The drops gather ahead. The calling book is close."); }
          else { enter("junction"); say(`The motes thicken. Junction ${S.ribbon} of ${JUNCTIONS} behind you.`); }
        } else { S.wrong++; enter("bend"); say("The motes thin out here."); }
      } else if (seg.kind === "bend") { enter("junction"); say("The aisle bends back. The same junction again; the shelves go on."); }
    }

    // ---- input ---------------------------------------------------------------------------------
    const KM = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down", e: "grab", " ": "grab" };
    function grab() {
      if (S.climb || S.stagger > 0) return;
      if (S.riding) { S.v = S.riding.v; S.riding = null; say("Off the ladder.", 1); return; }
      const l = S.seg.ladders.find((l) => Math.abs(l.x - S.x) < 1.2);
      if (l) { S.riding = l; l.v = Math.max(1.5, Math.abs(S.v)); say("Riding the rolling ladder. Push with ▶.", 1.6); }
    }
    const onDown = (e) => { const k = KM[e.key.toLowerCase()]; if (!k || !S.started) return; e.preventDefault(); if (k === "grab") { if (!e.repeat) grab(); } else keys[k] = true; };
    const onUp = (e) => { const k = KM[e.key.toLowerCase()]; if (k && k !== "grab") keys[k] = false; };
    addEventListener("keydown", onDown); addEventListener("keyup", onUp);
    const ptr = [];
    for (const b of el.querySelectorAll("[data-k]")) {
      const k = b.dataset.k;
      const d = (e) => { e.preventDefault(); if (!S.started) return; b.classList.add(P + "on"); if (k === "grab") grab(); else keys[k] = true; };
      const u = (e) => { e.preventDefault(); b.classList.remove(P + "on"); if (k !== "grab") keys[k] = false; };
      b.addEventListener("pointerdown", d); b.addEventListener("pointerup", u); b.addEventListener("pointercancel", u); b.addEventListener("pointerleave", u);
      ptr.push([b, d, u]);
    }

    // ---- update --------------------------------------------------------------------------------
    function update(dt) {
      S.t += dt;
      if (S.msgT > 0) S.msgT -= dt;
      if (S.fade > 0) S.fade = Math.max(0, S.fade - dt * 2);
      const seg = S.seg, ex = exitX(seg);

      if (S.climb) {
        S.climb.t += dt;
        if (S.climb.fall) { if (S.climb.t > 0.8) { S.climb = null; say("Down to the landing.", 1.4); } }
        else if (S.climb.t > 1.1) { const d = S.climb.dir; S.climb = null; takeExit(d); }
      } else if (S.stagger > 0) {
        S.stagger -= dt; S.v *= 0.9;
      } else if (S.riding) {
        const l = S.riding;
        if (keys.right) l.v = Math.min(5, l.v + 2.2 * dt);
        else if (keys.left) l.v = Math.max(1.5, l.v - 3 * dt);
        else l.v = Math.max(1.5, l.v - 0.25 * dt);
        l.x += l.v * dt;
        if (l.x >= l.rail[1]) { l.x = l.rail[1]; S.v = 0; S.riding = null; say("The rail ends. You step down.", 1.2); }
        S.x = l.x;
      } else {
        const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        if (dir) { S.runT += dt; S.facing = dir; } else S.runT = 0;
        const target = dir * (S.runT > 0.9 ? 3.6 : 2.2);
        S.v += (target - S.v) * Math.min(1, dt * 8);
        S.x = Math.max(0.5, S.x + S.v * dt);
        // exits
        if (seg.kind === "junction") {
          if (keys.up && Math.abs(S.x - ex.up) < 0.8) { S.climb = { dir: "up", t: 0 }; S.x = ex.up; }
          else if (keys.down && Math.abs(S.x - ex.down) < 0.8) { S.climb = { dir: "down", t: 0 }; S.x = ex.down; }
          else if (S.x > ex.on + 0.5) takeExit("on");
        } else if (seg.kind === "bend") {
          if (S.x > seg.L + 0.5) takeExit("on");
        } else if (seg.kind === "book" && S.x > seg.L - 3) finish();
      }
      // rolling ladders drift on their own a little
      for (const l of seg.ladders) if (l !== S.riding) { l.x = Math.min(l.rail[1], Math.max(l.rail[0], l.x + Math.sin(S.t * 0.7 + l.rail[0]) * 0.1 * dt)); }

      // falling books: a shadow, a second, the fall
      for (const b of seg.books) {
        if (b.state === "wait" && S.x > b.trig) { b.state = "shadow"; b.t = 0; }
        else if (b.state === "shadow") { b.t += dt; if (b.t >= 1) { b.state = "fall"; b.t = 0; } }
        else if (b.state === "fall") {
          b.t += dt;
          if (b.t >= 0.25) {
            b.state = "down";
            if (Math.abs(S.x - b.x) < 0.7) {
              S.hits++;
              if (S.climb && !S.climb.fall) { S.climb = { fall: true, t: 0 }; }
              else { S.stagger = 1.1; S.riding = null; say("A book falls on you. You stagger.", 1.4); }
            }
          }
        }
      }

      // motes: thick toward the right exit, thin and drifting back after a wrong turn
      const right = seg.kind === "junction" ? answers[S.ribbon] : seg.kind === "book" ? "book" : null;
      const rate = right ? 26 : 5;
      let n = rate * dt; while (n > 0) { if (rng() < n) spawnMote(right); n -= 1; }
      for (let i = S.motes.length - 1; i >= 0; i--) {
        const m = S.motes[i]; m.life -= dt;
        const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy) || 1;
        m.vx += (dx / d) * 2.4 * dt + Math.sin(S.t * 2 + m.ph) * 0.3 * dt; m.vy += (dy / d) * 2.4 * dt + Math.cos(S.t * 1.7 + m.ph) * 0.2 * dt;
        m.vx *= 0.97; m.vy *= 0.97; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.life <= 0 || d < 0.3) S.motes.splice(i, 1);
      }
    }
    function spawnMote(right) {
      const seg = S.seg, ex = exitX(seg);
      const x = S.x - 8 + rng() * 14;
      const y = 0.4 + rng() * 2.6;
      let tx, ty;
      if (right === "up") { tx = ex.up; ty = 6; } else if (right === "down") { tx = ex.down; ty = -2.5; }
      else if (right === "on") { tx = ex.on + 6; ty = 1.5; } else if (right === "book") { tx = seg.L - 1; ty = 1.4; }
      else { tx = S.x - 14; ty = 1 + rng(); }
      S.motes.push({ x, y, vx: 0, vy: 0, tx, ty, life: 4 + rng() * 2, ph: rng() * 6 });
    }
    function finish() {
      if (S.done) return;
      S.done = true;
      const secs = Math.round(S.t);
      timers.push(setTimeout(() => api.end({ outcome: "win", text: `The weather book, found: ${JUNCTIONS} junctions in ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}, with ${S.wrong} wrong turn${S.wrong === 1 ? "" : "s"} and ${S.hits} falling book${S.hits === 1 ? "" : "s"}.` }), api.reducedMotion ? 100 : 600));
    }

    // ---- draw ----------------------------------------------------------------------------------
    let W = 0, H = 0, dpr = 1;
    function resize() { dpr = Math.min(2, devicePixelRatio || 1); W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);
    const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

    function line(x1, y1, x2, y2) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
    function draw() {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
      const s = Math.max(24, Math.min(80, (H * 0.5) / 4.6)); // px per metre
      const floorY = H * 0.68, ceilY = floorY - 4.6 * s;
      const camX = S.x - (W * 0.38) / s;
      const X = (x) => (x - camX) * s, Y = (y) => floorY - y * s;
      const seg = S.seg, ex = exitX(seg);
      g.lineWidth = 1; g.strokeStyle = C.ink; g.lineCap = "butt";

      // bays: each with its own vanishing point, above or below, so no single perspective is true.
      // The galleries above and below are drawn too, fainter: the shelves go on in every direction.
      const bayW = 3;
      const first = Math.floor(camX / bayW) - 1, last = Math.ceil((camX + W / s) / bayW) + 1;
      const levH = floorY - ceilY + 22;
      for (let lv = -2; lv <= 2; lv++) {
        const off = lv * levH;
        const fY = floorY - off, cY = ceilY - off;
        if (fY < -10 || cY > H + 10) continue;
        const main = lv === 0;
        g.globalAlpha = main ? 1 : 0.38;
        for (let i = first; i <= last; i++) {
          const x0 = X(i * bayW), x1 = X((i + 1) * bayW);
          const up = (((i + lv) % 2) + 2) % 2 === 0;
          const vpx = (x0 + x1) / 2 + (hash(i, seg.seed + lv) - 0.5) * s, vpy = up ? cY - 3 * s : fY + 3 * s;
          const k = 0.22;
          const ix0 = x0 + (vpx - x0) * k, ix1 = x1 + (vpx - x1) * k;
          const iy0 = cY + (vpy - cY) * k, iy1 = fY + (vpy - fY) * k;
          g.strokeStyle = C.ink;
          g.strokeRect(x0, cY, x1 - x0, fY - cY);
          g.strokeStyle = C.faint;
          line(x0, cY, ix0, iy0); line(x1, cY, ix1, iy0); line(x0, fY, ix0, iy1); line(x1, fY, ix1, iy1);
          g.strokeRect(ix0, iy0, ix1 - ix0, iy1 - iy0);
          for (let sh = 1; sh < 8; sh++) {
            const fy = fY - (sh / 8) * (fY - cY), by = iy1 - (sh / 8) * (iy1 - iy0);
            g.strokeStyle = C.ink; line(x0, fy, x1, fy);
            g.strokeStyle = C.faint; line(x0, fy, ix0, by); line(x1, fy, ix1, by);
            g.strokeStyle = C.ink;
            const n = 9 + Math.floor(hash(i + lv * 7, sh) * 7);
            for (let b = 0; b < n; b++) {
              if (hash(i * 3 + b, sh + lv) < 0.12) continue;
              const bx = x0 + 3 + ((x1 - x0 - 6) * b) / n, bh = (0.45 + hash(b, i + sh) * 0.5) * ((fY - cY) / 8);
              line(bx, fy, bx + (hash(b, sh) < 0.1 ? 4 : 0), fy - bh);
            }
          }
        }
        if (!main) { line(0, fY + 6, W, fY + 6); line(0, cY - 6, W, cY - 6); }
      }
      g.globalAlpha = 1;
      g.fillStyle = "rgba(239,232,214,.5)"; g.fillRect(0, floorY + 7, W, 16); g.fillRect(0, ceilY - 23, W, 16);
      // the floor, the gallery above and the gallery below (cut views)
      g.strokeStyle = C.ink;
      line(0, floorY, W, floorY); line(0, floorY + 6, W, floorY + 6);
      line(0, ceilY, W, ceilY); line(0, ceilY - 6, W, ceilY - 6);
      for (let x = Math.floor(camX); x < camX + W / s + 1; x++) { line(X(x), ceilY - 6, X(x), ceilY - 22); line(X(x), floorY + 6, X(x) - 6, floorY + 20); }
      line(0, ceilY - 22, W, ceilY - 22);

      // exits
      g.lineWidth = 1.2;
      if (seg.kind === "junction") {
        // ladder up through the ceiling
        const ux = X(ex.up);
        g.fillStyle = C.paper; g.fillRect(ux - 16, ceilY - 24, 32, 30);
        line(ux - 12, floorY, ux - 12, ceilY - 30); line(ux + 12, floorY, ux + 12, ceilY - 30);
        for (let r = floorY - 10; r > ceilY - 30; r -= 14) line(ux - 12, r, ux + 12, r);
        // hatch down through the floor
        const dx = X(ex.down);
        g.fillStyle = C.paper; g.fillRect(dx - 18, floorY - 1, 36, 9);
        g.strokeRect(dx - 18, floorY - 1, 36, 9);
        line(dx - 11, floorY - 14, dx - 11, floorY + 40); line(dx + 11, floorY - 14, dx + 11, floorY + 40);
        for (let r = floorY - 6; r < floorY + 40; r += 12) line(dx - 11, r, dx + 11, r);
        // the aisle on: an arch
        const ox = X(ex.on);
        g.beginPath(); g.moveTo(ox, floorY); g.lineTo(ox, ceilY + 1.2 * s); g.arc(ox + 0.9 * s, ceilY + 1.2 * s, 0.9 * s, Math.PI, 0); g.lineTo(ox + 1.8 * s, floorY); g.stroke();
        g.font = "italic 13px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink;
        g.fillText("up", ux - 8, ceilY - 30); g.fillText("down", dx - 14, floorY + 54); g.fillText("on", ox + 0.6 * s, ceilY + 1.2 * s - 6);
      } else if (seg.kind === "bend") {
        const ox = X(seg.L);
        g.beginPath(); g.moveTo(ox, floorY); g.bezierCurveTo(ox + 2 * s, floorY - 1 * s, ox + 2 * s, ceilY + s, ox - 0.5 * s, ceilY + 0.5 * s); g.stroke();
        g.font = "italic 13px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink; g.fillText("the aisle bends back", ox - 2.2 * s, ceilY + 0.3 * s);
      } else if (seg.kind === "book") {
        const bx = X(seg.L - 1);
        line(bx, floorY, bx, floorY - 1.1 * s); line(bx - 0.5 * s, floorY, bx + 0.5 * s, floorY);
        g.beginPath(); g.moveTo(bx - 0.6 * s, floorY - 1.1 * s); g.lineTo(bx + 0.6 * s, floorY - 1.3 * s); g.lineTo(bx + 0.6 * s, floorY - 1.0 * s); g.lineTo(bx - 0.6 * s, floorY - 0.85 * s); g.closePath();
        g.fillStyle = C.goldHi; g.fill(); g.stroke();
        g.font = "italic 13px 'EB Garamond',Georgia,serif"; g.fillStyle = C.ink; g.fillText("the calling book", bx - 0.9 * s, floorY - 1.6 * s);
      }
      g.lineWidth = 1;
      // rolling ladders on their rail
      for (const l of seg.ladders) {
        line(X(l.rail[0]), ceilY + 0.3 * s, X(l.rail[1]), ceilY + 0.3 * s);
        const lx = X(l.x);
        line(lx, ceilY + 0.3 * s, lx + 0.7 * s, floorY - 4); line(lx + 0.45 * s, ceilY + 0.3 * s, lx + 1.15 * s, floorY - 4);
        for (let r = 1; r < 9; r++) { const t = r / 9; line(lx + t * 0.7 * s, ceilY + 0.3 * s + t * (floorY - ceilY - 0.3 * s), lx + 0.45 * s + t * 0.7 * s, ceilY + 0.3 * s + t * (floorY - ceilY - 0.3 * s)); }
        g.beginPath(); g.arc(lx + 0.7 * s, floorY - 2, 3, 0, 7); g.arc(lx + 1.15 * s, floorY - 2, 3, 0, 7); g.stroke();
      }
      // falling books: shadow first, then the book
      for (const b of seg.books) {
        const bx = X(b.x);
        if (b.state === "shadow") { g.strokeStyle = C.ink; g.setLineDash([3, 3]); g.beginPath(); g.ellipse(bx, floorY - 2, 0.35 * s * (0.4 + b.t), 4, 0, 0, 7); g.stroke(); g.setLineDash([]); }
        if (b.state === "fall" || b.state === "down") {
          const y = b.state === "fall" ? ceilY + (floorY - 10 - ceilY) * (b.t / 0.25) : floorY - 8;
          g.strokeStyle = C.ink; g.save(); g.translate(bx, y); g.rotate(b.state === "down" ? 0.1 : b.t * 4); g.strokeRect(-12, -6, 24, 12); line(-9, -6, -9, 6); g.restore();
        }
      }
      // Elaris: a tall thin figure in a monk's robe, in the same single line
      let ey = floorY, ex2 = X(S.x);
      if (S.riding) ey = floorY - 0.9 * s;
      if (S.climb && !S.climb.fall) ey = floorY + (S.climb.dir === "up" ? -1 : 1) * S.climb.t * 2.4 * s;
      if (S.climb && S.climb.fall) ey = floorY - (0.8 - S.climb.t) * 2 * s;
      g.strokeStyle = C.ink; g.lineWidth = 1.2;
      const hgt = 2.4 * s, sway = S.stagger > 0 ? Math.sin(S.t * 20) * 4 : 0;
      g.beginPath(); g.moveTo(ex2 - 0.3 * s, ey); g.lineTo(ex2 - 0.12 * s + sway, ey - hgt * 0.78); g.lineTo(ex2 + 0.12 * s + sway, ey - hgt * 0.78); g.lineTo(ex2 + 0.3 * s, ey); g.closePath(); g.stroke();
      g.beginPath(); g.arc(ex2 + sway, ey - hgt * 0.86, 0.13 * s, 0, 7); g.stroke();
      const step = Math.sin(S.x * 3) * (Math.abs(S.v) > 0.2 ? 0.1 * s : 0);
      line(ex2 - 0.1 * s + sway, ey - hgt * 0.66, ex2 + S.facing * 0.32 * s + step, ey - hgt * 0.42);
      g.lineWidth = 1;
      // motes: the only colour (drops, for the weather book)
      for (const m of S.motes) {
        const mx = X(m.x), my = Y(m.y);
        if (mx < -10 || mx > W + 10) continue;
        g.fillStyle = m.life < 1 ? `rgba(212,162,58,${m.life.toFixed(2)})` : C.gold;
        g.beginPath(); g.moveTo(mx, my - 5); g.quadraticCurveTo(mx + 3.5, my + 1, mx, my + 3); g.quadraticCurveTo(mx - 3.5, my + 1, mx, my - 5); g.fill();
      }
      // the rebuild fade
      if (S.fade > 0) { g.fillStyle = `rgba(239,232,214,${S.fade.toFixed(2)})`; g.fillRect(0, 0, W, H); }

      // the bookmark ribbon across the top
      const rw = Math.min(W - 32, 520), rx = 16, ry = 12;
      g.fillStyle = "rgba(239,232,214,.92)"; g.fillRect(rx - 6, ry - 6, rw + 12, 46);
      g.strokeStyle = C.ink; g.strokeRect(rx, ry, rw, 14);
      for (let j = 0; j < JUNCTIONS; j++) {
        const x = rx + (rw / JUNCTIONS) * j;
        if (j < S.ribbon) { g.fillStyle = C.sage; g.fillRect(x + 2, ry + 2, rw / JUNCTIONS - 4, 10); }
        if (j) line(x, ry, x, ry + 14);
      }
      g.fillStyle = C.ink; g.font = "13px 'EB Garamond',Georgia,serif";
      g.fillText(`${S.ribbon} / ${JUNCTIONS}   ·   wrong turns ${S.wrong}   ·   ${Math.floor(S.t / 60)}:${String(Math.floor(S.t % 60)).padStart(2, "0")}`, rx, ry + 32);
      // prompt near an exit or ladder
      let prompt = "";
      if (!S.climb && seg.kind === "junction") {
        if (Math.abs(S.x - ex.up) < 0.8) prompt = "▲ climb up";
        else if (Math.abs(S.x - ex.down) < 0.8) prompt = "▼ climb down";
      }
      if (!S.riding && seg.ladders.some((l) => Math.abs(l.x - S.x) < 1.2)) prompt = prompt || "Grab (E) the rolling ladder";
      if (prompt) { g.font = "italic 15px 'EB Garamond',Georgia,serif"; g.fillText(prompt, X(S.x) - 40, Y(2.9)); }
      if (S.msgT > 0) {
        g.font = "italic 16px 'EB Garamond',Georgia,serif"; g.textAlign = "center";
        g.fillStyle = "rgba(239,232,214,.9)"; const tw = g.measureText(S.msg).width; g.fillRect(W / 2 - tw / 2 - 10, floorY + 64, tw + 20, 26);
        g.fillStyle = C.ink; g.fillText(S.msg, W / 2, floorY + 82); g.textAlign = "left";
      }
    }

    let raf = 0, last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (S.started && !S.done) update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>The stacks</h2>
      <p>A book is calling, and the shelves do not end. Walk with <b>◀ ▶</b> (A/D). At each junction, climb <b>up</b> (W), go <b>down</b> the hatch (S), or walk <b>on</b>. Follow the gold motes: where they thicken, you are right.</p>
      <p>Ride rolling ladders with <b>Grab</b> (E). Watch for a book's shadow on the floor. Five junctions to the weather book.</p>
      <button type="button">Start</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); S.started = true; last = performance.now(); say("Follow the motes."); });
    intro.querySelector("button").focus();

    return {
      unmount() {
        cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect();
        removeEventListener("keydown", onDown); removeEventListener("keyup", onUp);
        for (const [b, d, u] of ptr) { b.removeEventListener("pointerdown", d); b.removeEventListener("pointerup", u); b.removeEventListener("pointercancel", u); b.removeEventListener("pointerleave", u); }
      },
    };
  },
};

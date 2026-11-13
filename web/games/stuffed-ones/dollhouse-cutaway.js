// The Stuffed Ones: Dollhouse cutaway (2D, scroll), drawn as a Victorian dollhouse catalogue
// lithograph.
//
// DESIGN.md section 10 "Mode A", sequence `c10_dollhouse_sound` (night 1, the Sound game). The
// cabin cut open from the front, every room at once. Point to a destination and the selected toy
// walks there at 0.6 m/s while Still is released; holding Still freezes it. Each guest has a sight
// cone, 70 degrees wide and 4 m long. Asleep, a cone opens for 2-4 s at random; a light sleeper's
// (Wes, lamp on) more often; Ana reads awake until 01:00. A toy that moves inside an open cone is
// seen: a slip (dread +15 to that guest, +5 to the others, one memory). Standing still in a cone is
// safe. Creaking stairs: passing the third step opens the cone of any guest within 4 m toward it.
// Tools (Sound): Thump, Drag, Squeak, and Three taps (both toys at one door). The night runs 23:00
// to 05:00; bedroom doors stand open, so an eye sees along its whole floor. Cut to fit: one night of about three minutes, cone timings compressed to match, the hall
// light hazard left out, the cellar drawn but not walked.
const PRE = "stuffed-ones-dollhouse-cutaway-";
const C = { paper: "#efe4c9", ink: "#2a211b", cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", moss: "#7d8a5a", rust: "#a5553a",
  sky: "#8fa9bf", cream: "#efe5cf", bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", night: "#56627a", nightL: "#7f8ca3", rose: "#c9a7b0" };
const W_M = 12, FLOOR = 3, CELLAR = 2.2, ROOF = 2.6;
const ROOMS = [
  { id: "bedA", name: "BEDROOM", x0: 0, x1: 4, lvl: 1, wall: "#aeb6c6", sprig: "#e6dcc6" },
  { id: "landing", name: "LANDING & SHELF", x0: 4, x1: 8, lvl: 1, wall: "#b9b2a6", sprig: "#8fa9bf" },
  { id: "bedB", name: "BEDROOM", x0: 8, x1: 12, lvl: 1, wall: "#b7a9b4", sprig: "#efe5cf" },
  { id: "parlour", name: "PARLOUR", x0: 0, x1: 4, lvl: 0, wall: "#a9b39c", sprig: "#efe5cf" },
  { id: "hall", name: "HALL", x0: 4, x1: 8, lvl: 0, wall: "#b6a796", sprig: "#7d8a5a" },
  { id: "kitchen", name: "KITCHEN", x0: 8, x1: 12, lvl: 0, wall: "#a8b4bf", sprig: "#efe5cf" },
];
const STAIR = { x0: 4.5, x1: 7.4 };            // ground at x0, landing at x1
const DOORS = [{ x: 4, lvl: 1, room: "bedA" }, { x: 8, lvl: 1, room: "bedB" }, { x: 4, lvl: 0, room: "parlour" }];
const GUESTS = [
  // eye position (m), facing (radians, 0 = right), room
  { id: "noor", name: "Noor", room: "bedA", ex: 1.3, ey: FLOOR + 0.75, face: 0.15, sleep: [10, 20], awakeUntil: 0 },
  { id: "wes", name: "Wes", room: "bedB", ex: 10.7, ey: FLOOR + 0.75, face: Math.PI - 0.15, sleep: [5, 11], awakeUntil: 0, lamp: true },
  { id: "ana", name: "Ana", room: "parlour", ex: 1.4, ey: 0.85, face: 0.1, sleep: [9, 18], awakeUntil: 2 * 30 },
];
const TOOLS = [
  { id: "thump", name: "Thump", dread: 4, range: 6, floors: 0, hunger: 3 },
  { id: "drag", name: "Drag", dread: 5, range: 6, floors: 1, hunger: 3 },
  { id: "squeak", name: "Squeak", dread: 6, range: 4, floors: 0, hunger: 3 },
  { id: "taps", name: "Three taps", dread: 8, range: 0, floors: 0, hunger: 5 },
];
const NIGHT = 180, CONE = (70 * Math.PI) / 180, REACH = 4, SPEED = 0.6;

function kit() {
  const offs = []; let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    wrap.tabIndex = 0;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:${C.paper};overflow:hidden;touch-action:none;outline:none;font-family:'IM Fell English',Georgia,serif;color:${C.ink}}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}bar{position:absolute;left:0;right:0;bottom:8px;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:0 10px;z-index:2}
.${PRE}bar button{font:600 13px Karla,Arial,sans-serif;background:${C.bone};color:${C.ink};border:1px solid ${C.ink};box-shadow:2px 2px 0 ${C.ink};padding:7px 11px;cursor:pointer;min-height:38px;letter-spacing:.02em}
.${PRE}bar button:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.${PRE}bar .${PRE}still{background:${C.ink};color:${C.bone};min-width:110px;text-transform:uppercase;letter-spacing:.12em}
.${PRE}bar .${PRE}still[aria-pressed=true]{background:${C.red};border-color:${C.red}}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,228,201,.82);z-index:3;padding:16px}
.${PRE}intro div{max-width:500px;background:${C.bone};border:3px double ${C.ink};padding:18px 22px}
.${PRE}intro h2{margin:0 0 4px;font:400 30px 'IM Fell English',Georgia,serif}
.${PRE}intro h2+small{display:block;font:italic 13px 'IM Fell English',Georgia,serif;margin-bottom:10px;opacity:.75}
.${PRE}intro p{margin:0 0 8px;font:14px/1.45 Karla,Arial,sans-serif}
.${PRE}intro button{font:600 14px Karla,Arial,sans-serif;background:${C.ink};color:${C.bone};border:0;padding:9px 22px;cursor:pointer;margin-top:6px}
.${PRE}intro label{font:12px Karla,Arial,sans-serif;display:flex;gap:6px;align-items:center;margin-top:6px}
</style><canvas aria-label="The cabin cut open from the front at night, every room at once"></canvas>
<div class="${PRE}bar">
  <button type="button" class="${PRE}still" aria-pressed="false">Hold still</button>
  ${TOOLS.map((t) => `<button type="button" data-tool="${t.id}">${t.name}</button>`).join("")}
  <button type="button" data-a="switch">Switch toy</button>
</div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const stillBtn = wrap.querySelector("." + PRE + "still");
    const toolBtns = [...wrap.querySelectorAll("button[data-tool]")];

    // state
    const toys = [
      { name: "You", kind: "cat", col: C.amber, x: 6.2, lvl: 1, sx: 0, plan: [], moved: false, grace: 0, creaked: false },
      { name: "Jamie", kind: "bear", col: "#c2925f", x: 9.4, lvl: 0, plan: [], moved: false, grace: 0, creaked: false },
    ];
    toys.forEach((t) => (t.y = t.lvl * FLOOR));
    const guests = GUESTS.map((gd) => ({ ...gd, dread: 0, open: 0, warn: 0, next: gd.sleep[0] + rng() * (gd.sleep[1] - gd.sleep[0]), look: gd.face, lookAt: null }));
    let sel = 0, still = false, stillToggle = false, started = false, over = false, speed = 1, t = 0;
    let memories = 6, hunger = 60, slips = 0, cooldown = 0, msg = "", msgT = 0, flash = 0, pack = 0;
    let L = null, plate = null;
    const roomOf = (x, lvl) => ROOMS.find((r) => r.lvl === lvl && x >= r.x0 && x <= r.x1);
    const clock = () => { const m = 23 * 60 + (t / (NIGHT * speed)) * 360; const h = Math.floor(m / 60) % 24; return `${String(h).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`; };

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight, wide = W >= 860;
      const cards = wide ? { w: Math.min(190, W * 0.17) } : { h: 64 };
      const top = 54, bottom = W < 560 ? 104 : 60;
      const availW = (wide ? W - cards.w - 40 : W - 24), availH = H - top - bottom - (wide ? 0 : cards.h + 8) - 26;
      const totalH = CELLAR + FLOOR * 2 + ROOF;
      const k = Math.max(10, Math.min(availW / (W_M + 1.4), availH / totalH));
      const ox = (wide ? 20 : 12) + (availW - W_M * k) / 2;
      const base = top + ROOF * k + FLOOR * 2 * k + (availH - totalH * k) / 2 + 8;
      L = { W, H, wide, k, ox, base, top, cards, bottom };
      plate = null;
    }
    const S = (x, y) => [L.ox + x * L.k, L.base - y * L.k];

    // ---- the plate: rooms, wallpaper at the cut edge, furniture -----------------------------
    function paperGrain(x, w, h) {
      x.fillStyle = C.paper; x.fillRect(0, 0, w, h);
      for (let i = 0; i < (w * h) / 60; i++) { x.fillStyle = Math.random() < 0.5 ? "rgba(107,74,50,.05)" : "rgba(255,255,255,.12)"; x.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2); }
    }
    function sprigs(x, rx, ry, rw, rh, ground, sprig, s) {
      x.fillStyle = ground; x.fillRect(rx, ry, rw, rh);
      x.fillStyle = sprig; x.globalAlpha = 0.55;
      for (let yy = ry + s / 4; yy < ry + rh; yy += s) for (let xx = rx + s / 4 + ((Math.floor((yy - ry) / s) % 2) * s) / 2; xx < rx + rw; xx += s) { x.beginPath(); x.arc(xx, yy, 1.4, 0, 7); x.fill(); x.beginPath(); x.arc(xx - 2.4, yy, 0.9, 0, 7); x.arc(xx + 2.4, yy, 0.9, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    }
    function buildPlate() {
      const { W, H, k } = L;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const x = c.getContext("2d");
      paperGrain(x, W, H);
      const P = (mx, my) => [L.ox + mx * k, L.base - my * k];
      // ground line and earth
      const [gx0, gy0] = P(-0.6, 0), [gx1] = P(W_M + 0.6, 0);
      x.fillStyle = "#d8c9a6"; x.fillRect(gx0 - 10, gy0, gx1 - gx0 + 20, CELLAR * k + 10);
      x.strokeStyle = "rgba(42,33,27,.25)"; for (let i = 0; i < 60; i++) { const ex = gx0 + ((i * 37) % (gx1 - gx0)), ey = gy0 + 6 + ((i * 53) % (CELLAR * k)); x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex + 6, ey + 2); x.stroke(); }
      // cellar
      const [cx0, cy0] = P(0.3, -0.25), [cx1, cy1] = P(W_M - 0.3, -CELLAR + 0.25);
      x.fillStyle = "#8a93a6"; x.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      x.strokeStyle = C.ink; x.lineWidth = 1.2; x.strokeRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      for (let i = 0; i < 6; i++) { const [bx, by] = P(1 + i * 1.9, -CELLAR + 0.25); x.fillStyle = i % 2 ? C.cedar : "#c8c3b0"; const w = (i % 2 ? 0.9 : 0.45) * k, h = (i % 2 ? 0.8 : 0.6) * k; x.fillRect(bx, by - h, w, h); x.strokeRect(bx, by - h, w, h); if (i % 2) { x.beginPath(); x.moveTo(bx, by - h); x.lineTo(bx + w, by); x.stroke(); } }
      x.fillStyle = C.ink; x.font = `${Math.max(9, k * 0.2)}px Georgia,serif`; x.fillText("CELLAR", cx0 + 6, cy0 + 13);
      // rooms
      ROOMS.forEach((r) => {
        const [rx, ry] = P(r.x0, (r.lvl + 1) * FLOOR), [rx2, ry2] = P(r.x1, r.lvl * FLOOR);
        sprigs(x, rx, ry, rx2 - rx, ry2 - ry, r.wall, r.sprig, Math.max(10, k * 0.42));
        // night wash, blue-grey without black
        x.fillStyle = "rgba(86,98,122,.28)"; x.fillRect(rx, ry, rx2 - rx, ry2 - ry);
        x.fillStyle = C.ink; x.font = `${Math.max(9, k * 0.19)}px Georgia,serif`; x.textBaseline = "top";
        x.fillText(r.name, rx + 6, ry + 5);
      });
      // floors and walls at the cut: wood with the wallpaper shown at the edge
      x.strokeStyle = C.ink; x.lineWidth = 1.4;
      for (let lvl = 0; lvl <= 2; lvl++) {
        const [fx0, fy] = P(-0.15, lvl * FLOOR), [fx1] = P(W_M + 0.15, lvl * FLOOR);
        x.fillStyle = C.cedar; x.fillRect(fx0, fy - 3, fx1 - fx0, 7); x.strokeRect(fx0, fy - 3, fx1 - fx0, 7);
      }
      [0, 4, 8, 12].forEach((wx) => {
        for (let lvl = 0; lvl < 2; lvl++) {
          const [px, py] = P(wx, (lvl + 1) * FLOOR), [, py2] = P(wx, lvl * FLOOR);
          const outer = wx === 0 || wx === 12;
          const door = !outer;
          const doorTop = L.base - (lvl * FLOOR + 2.1) * k;
          x.fillStyle = C.cedarD; x.fillRect(px - 3, py, 6, (door ? doorTop : py2) - py);
          x.fillStyle = "#c9a7b0"; x.fillRect(px - 1, py, 2, (door ? doorTop : py2) - py); // wallpaper at the cut edge
          x.strokeRect(px - 3, py, 6, (door ? doorTop : py2) - py);
        }
      });
      // roof with shingles and a round window
      const [r0x, r0y] = P(-0.7, 2 * FLOOR), [r1x] = P(W_M + 0.7, 2 * FLOOR), [rpx, rpy] = P(W_M / 2, 2 * FLOOR + ROOF);
      x.fillStyle = "#c9a184"; x.beginPath(); x.moveTo(r0x, r0y); x.lineTo(rpx, rpy); x.lineTo(r1x, r0y); x.closePath(); x.fill();
      x.save(); x.clip(); x.strokeStyle = "rgba(42,33,27,.35)"; x.lineWidth = 1;
      for (let yy = rpy; yy < r0y; yy += Math.max(5, k * 0.18)) { x.beginPath(); x.moveTo(r0x, yy); x.lineTo(r1x, yy); x.stroke(); for (let xx = r0x + ((yy / 7) % 2) * 6; xx < r1x; xx += 12) { x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy + 5); x.stroke(); } }
      x.restore(); x.strokeStyle = C.ink; x.lineWidth = 1.4; x.beginPath(); x.moveTo(r0x, r0y); x.lineTo(rpx, rpy); x.lineTo(r1x, r0y); x.closePath(); x.stroke();
      const [wx, wy] = P(W_M / 2, 2 * FLOOR + ROOF * 0.42); x.fillStyle = "#e9c98a"; x.beginPath(); x.arc(wx, wy, k * 0.32, 0, 7); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(wx - k * 0.32, wy); x.lineTo(wx + k * 0.32, wy); x.moveTo(wx, wy - k * 0.32); x.lineTo(wx, wy + k * 0.32); x.stroke();
      // stairs in the hall
      const steps = 10;
      for (let i = 0; i < steps; i++) {
        const a = P(STAIR.x0 + (STAIR.x1 - STAIR.x0) * i / steps, FLOOR * (i + 1) / steps), b = P(STAIR.x1, 0);
        x.fillStyle = i === 2 ? "#a77b55" : "#b8916b"; x.fillRect(a[0], a[1], b[0] - a[0], (FLOOR * k) / steps); x.strokeRect(a[0], a[1], b[0] - a[0], (FLOOR * k) / steps);
      }
      // furniture: beds, couch, shelf, counter
      const furn = (mx, my, mw, mh, col) => { const [fx, fy] = P(mx, my + mh); x.fillStyle = col; x.fillRect(fx, fy, mw * k, mh * k); x.strokeRect(fx, fy, mw * k, mh * k); };
      furn(0.3, FLOOR, 2.6, 0.55, "#e5d3d9"); furn(0.3, FLOOR + 0.55, 0.35, 0.6, C.cedar);
      furn(9.1, FLOOR, 2.6, 0.55, "#d9dfe5"); furn(11.35, FLOOR + 0.55, 0.35, 0.6, C.cedar);
      furn(0.3, 0, 2.6, 0.5, C.moss); furn(0.3, 0.5, 0.3, 0.4, C.moss);
      furn(4.4, FLOOR + 1.3, 3.2, 0.1, C.cedar); // the landing shelf
      furn(8.6, 0, 2.2, 0.95, "#c8c3b0"); furn(11.0, 0, 0.7, 1.4, C.cedar);
      // Wes's lamp, on
      const [lx, ly] = P(11.55, FLOOR + 1.3); const lg = x.createRadialGradient(lx, ly, 2, lx, ly, k * 1.4); lg.addColorStop(0, "rgba(233,201,138,.75)"); lg.addColorStop(1, "rgba(233,201,138,0)"); x.fillStyle = lg; x.beginPath(); x.arc(lx, ly, k * 1.4, 0, 7); x.fill();
      x.fillStyle = "#e9c98a"; x.beginPath(); x.moveTo(lx - 6, ly); x.lineTo(lx + 6, ly); x.lineTo(lx + 4, ly - 8); x.lineTo(lx - 4, ly - 8); x.closePath(); x.fill(); x.stroke();
      // plate border and caption
      x.strokeStyle = C.ink; x.lineWidth = 1; x.strokeRect(6, 6, W - 12, H - 12); x.strokeRect(10, 10, W - 20, H - 20);
      x.font = `italic ${W < 560 ? 11 : 13}px 'IM Fell English',Georgia,serif`; x.fillStyle = C.ink; x.textBaseline = "alphabetic";
      const [, capY] = P(0, -CELLAR - 0.1);
      x.fillText("Plate III. THE CABIN IN SECTION, BY NIGHT. Move while no eye is open.", L.ox, Math.min(H - L.bottom - 4, capY + 16));
      return c;
    }

    // ---- drawing the live parts -------------------------------------------------------------
    function toy(x, y, s, body, glow, selected, kind = "cat") {
      if (glow) { const gr = g.createRadialGradient(x, y - 10 * s, 1, x, y - 10 * s, 30 * s); gr.addColorStop(0, "rgba(227,154,45,.7)"); gr.addColorStop(1, "rgba(227,154,45,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y - 10 * s, 30 * s, 0, 7); g.fill(); }
      if (selected) { g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([3, 2]); g.beginPath(); g.arc(x, y - 12 * s, 24 * s, 0, 7); g.stroke(); g.setLineDash([]); }
      g.fillStyle = body; g.strokeStyle = C.ink; g.lineWidth = 1.3;
      g.beginPath(); g.ellipse(x, y - 8 * s, 9 * s, 9 * s, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.arc(x, y - 21 * s, 8 * s, 0, 7); g.fill(); g.stroke();
      [-5, 5].forEach((dx) => { g.beginPath(); if (kind === "bear") g.arc(x + dx * 1.1 * s, y - 27 * s, 3.4 * s, 0, 7); else { g.moveTo(x + dx * s - 3 * s, y - 26 * s); g.lineTo(x + dx * s, y - 33 * s); g.lineTo(x + dx * s + 3 * s, y - 26 * s); } g.fill(); g.stroke(); g.fillStyle = C.ink; g.beginPath(); g.arc(x + dx * 0.55 * s, y - 22 * s, 1.4 * s, 0, 7); g.fill(); g.fillStyle = body; });
    }
    function sleeper(gu, s) {
      const [x, y] = S(gu.ex, gu.ey);
      g.fillStyle = C.dust; g.strokeStyle = C.ink; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, 7 * s, 0, 7); g.fill(); g.stroke();
      // eye: a closed line or an open dot
      const dir = Math.cos(gu.look) > 0 ? 1 : -1;
      if (gu.open > 0) { g.fillStyle = C.ink; g.beginPath(); g.arc(x + dir * 3 * s, y - 1 * s, 1.6 * s, 0, 7); g.fill(); }
      else { g.beginPath(); g.moveTo(x + dir * 1 * s, y - 1 * s); g.lineTo(x + dir * 5 * s, y - 1 * s); g.stroke(); }
    }
    function cone(gu, now) {
      const r = ROOMS.find((q) => q.id === gu.room);
      const [ex, ey] = S(gu.ex, gu.ey);
      const [rx0, ry0] = S(0, (r.lvl + 1) * FLOOR), [rx1, ry1] = S(W_M, r.lvl * FLOOR);
      g.save(); g.beginPath(); g.rect(rx0, ry0, rx1 - rx0, ry1 - ry0); g.clip();
      const a0 = -gu.look - CONE / 2, a1 = -gu.look + CONE / 2, R = REACH * L.k;
      g.beginPath(); g.moveTo(ex, ey); g.arc(ex, ey, R, a0, a1); g.closePath();
      if (gu.open > 0) {
        const gr = g.createRadialGradient(ex, ey, 2, ex, ey, R); gr.addColorStop(0, "rgba(246,236,190,.75)"); gr.addColorStop(1, "rgba(246,236,190,.12)");
        g.fillStyle = gr; g.fill();
        g.save(); g.clip(); g.strokeStyle = "rgba(42,33,27,.18)"; g.lineWidth = 1; for (let k2 = -R; k2 < R * 2; k2 += 6) { g.beginPath(); g.moveTo(ex + k2, ey - R); g.lineTo(ex + k2 - R, ey + R); g.stroke(); } g.restore();
        g.strokeStyle = "rgba(42,33,27,.6)"; g.lineWidth = 1; g.stroke();
      } else if (gu.warn > 0) {
        g.strokeStyle = `rgba(184,50,42,${api.reducedMotion ? 0.7 : 0.4 + 0.4 * Math.sin(now / 60)})`; g.lineWidth = 1.5; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
      }
      g.restore();
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, k, wide } = L, dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!plate) plate = buildPlate();
      g.drawImage(plate, 0, 0, W, H);
      const s = Math.max(0.55, k / 46);
      guests.forEach((gu) => cone(gu, now));
      guests.forEach((gu) => sleeper(gu, s));
      // toys and their walk paths
      toys.forEach((ty, i) => {
        if (ty.plan.length && i === sel) {
          g.strokeStyle = C.red; g.lineWidth = 1.2; g.setLineDash([2, 4]); g.beginPath();
          let [px, py] = S(ty.x, ty.y + 0.05); g.moveTo(px, py);
          ty.plan.forEach((w) => { const [qx, qy] = S(w.x, w.y + 0.05); g.lineTo(qx, qy); });
          g.stroke(); g.setLineDash([]);
          const end = ty.plan[ty.plan.length - 1], [qx, qy] = S(end.x, end.y); g.fillStyle = C.red; g.fillRect(qx - 3, qy - 3, 6, 6);
        }
        const [x, y] = S(ty.x, ty.y);
        toy(x, y, s, ty.col, i === 0, i === sel, ty.kind);
        if (i === sel && still) { g.fillStyle = C.bone; g.strokeStyle = C.ink; g.lineWidth = 1; const tw = 74; g.fillRect(x + 12 * s, y - 30 * s, tw, 15); g.strokeRect(x + 12 * s, y - 30 * s, tw, 15); g.fillStyle = C.ink; g.font = "600 9px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("HOLD STILL", x + 12 * s + tw / 2, y - 22 * s); }
      });
      // door marks for Three taps
      DOORS.forEach((d) => { const [x, y] = S(d.x, d.lvl * FLOOR + 1.0); const both = toys.every((ty) => ty.lvl === d.lvl && Math.abs(ty.x - d.x) < 0.8 && !ty.plan.length); g.fillStyle = both ? C.red : "rgba(42,33,27,.35)"; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); });
      // night clock along the top
      const cx0 = 34, cx1 = (wide ? W - L.cards.w - 40 : W - 24), cy = 30;
      g.strokeStyle = C.night; g.lineWidth = 2; g.beginPath(); g.moveTo(cx0, cy); g.lineTo(cx1, cy); g.stroke();
      g.fillStyle = C.ink; g.font = "10px Georgia,serif"; g.textAlign = "center"; g.textBaseline = "bottom";
      for (let h = 0; h <= 6; h++) { const x = cx0 + (cx1 - cx0) * h / 6; g.fillRect(x - 0.5, cy - 4, 1, 8); if (W > 420 || h % 2 === 0) g.fillText(`${String((23 + h) % 24).padStart(2, "0")}:00`, x, cy - 6); }
      const p = Math.min(1, t / (NIGHT * speed)), mx = cx0 + (cx1 - cx0) * p;
      g.fillStyle = C.amber; g.beginPath(); g.moveTo(mx - 6, cy + 12); g.lineTo(mx + 6, cy + 12); g.lineTo(mx, cy + 3); g.closePath(); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1; g.stroke();
      // status line
      g.textAlign = "left"; g.textBaseline = "alphabetic"; g.font = "12px Karla,Arial,sans-serif"; g.fillStyle = C.ink;
      g.fillText(`${clock()}  ·  leading: ${toys[sel].name}  ·  memories ${memories}  ·  hunger ${Math.round(hunger)}${hunger >= 75 ? " (trembling)" : ""}`, cx0, cy + 26);
      // guest cards
      guests.forEach((gu, i) => {
        let x, y, w, h;
        if (wide) { w = L.cards.w; h = 84; x = W - w - 20; y = 44 + i * (h + 12); }
        else { w = (W - 24 - 16) / 3; h = L.cards.h; x = 12 + i * (w + 8); y = H - L.bottom - h - 4; }
        g.fillStyle = C.bone; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(x, y, w, h); g.strokeRect(x + 3, y + 3, w - 6, h - 6);
        if (i === 0 && wide) { g.font = "12px Georgia,serif"; g.fillStyle = C.ink; g.textAlign = "left"; g.fillText("GUESTS", x, y - 6); }
        const pr = Math.min(16, h * 0.24);
        g.fillStyle = C.dust; g.beginPath(); g.ellipse(x + 10 + pr, y + h / 2, pr, pr * 1.2, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = C.night; g.beginPath(); g.arc(x + 10 + pr, y + h / 2 - pr * 0.25, pr * 0.42, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 10 + pr, y + h / 2 + pr * 0.75, pr * 0.7, pr * 0.42, 0, Math.PI, 0); g.fill();
        g.fillStyle = C.ink; g.textAlign = "left"; g.font = `italic ${wide ? 14 : 12}px 'IM Fell English',Georgia,serif`;
        const tx = x + 16 + pr * 2;
        g.fillText(gu.name, tx, y + (wide ? 22 : 18));
        g.font = "9px Karla,Arial,sans-serif"; g.fillText(gu.open > 0 ? "eyes open" : t < gu.awakeUntil * speed ? "reading" : gu.lamp ? "asleep, lamp on" : "asleep", tx, y + (wide ? 36 : 30));
        const bw = x + w - 10 - tx, bh = wide ? 14 : 10, by = y + h - bh - 10;
        g.fillStyle = C.cream; g.fillRect(tx, by, bw, bh); g.strokeRect(tx, by, bw, bh);
        g.save(); g.beginPath(); g.rect(tx, by, bw * Math.min(1, gu.dread / 60), bh); g.clip();
        g.strokeStyle = C.red; for (let q = -20; q < bw; q += 4) { g.beginPath(); g.moveTo(tx + q, by + bh); g.lineTo(tx + q + bh, by); g.stroke(); }
        g.restore();
      });
      if (flash > 0) { g.fillStyle = `rgba(184,50,42,${flash * 0.25})`; g.fillRect(0, 0, W, H); }
      if (msg && now - msgT < 2600) {
        g.font = "600 14px Karla,Arial,sans-serif"; const w = g.measureText(msg).width + 26;
        g.fillStyle = C.bone; g.strokeStyle = C.ink; g.fillRect(W / 2 - w / 2, 64, w, 30); g.strokeRect(W / 2 - w / 2, 64, w, 30);
        g.fillStyle = C.ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(msg, W / 2, 79);
      }
      K.frame(draw);
    }

    // ---- simulation -----------------------------------------------------------------------
    function say(m) { msg = m; msgT = performance.now(); }
    function inCone(gu, x, y) {
      if (gu.open <= 0) return false;
      const r = ROOMS.find((q) => q.id === gu.room);
      if (y < r.lvl * FLOOR - 0.01 || y > (r.lvl + 1) * FLOOR) return false; // doors stand open: an eye sees along its floor
      const dx = x - gu.ex, dy = (y + 0.3) - gu.ey, d = Math.hypot(dx, dy);
      if (d > REACH) return false;
      let a = Math.atan2(dy, dx) - gu.look; a = Math.atan2(Math.sin(a), Math.cos(a));
      return Math.abs(a) <= CONE / 2;
    }
    function plan(ty, tx, tlvl) {
      tx = Math.max(0.35, Math.min(W_M - 0.35, tx));
      const out = [];
      let lvl = ty.lvl;
      if (tlvl !== lvl) {
        const fromX = lvl === 0 ? STAIR.x0 : STAIR.x1, toX = tlvl === 0 ? STAIR.x0 : STAIR.x1;
        out.push({ x: fromX, y: lvl * FLOOR, lvl });
        out.push({ x: toX, y: tlvl * FLOOR, lvl: tlvl, stair: true });
        lvl = tlvl;
      }
      out.push({ x: tx, y: lvl * FLOOR, lvl });
      ty.plan = out; ty.creaked = false;
    }
    function slip(gu, why) {
      slips++; memories--; flash = 1;
      guests.forEach((o) => (o.dread = Math.min(100, o.dread + (o === gu ? 15 : 5))));
      say(`${why} A slip: one memory goes.`);
      if (memories <= 0) lose();
    }
    // a guest gets used to the same night noises: each sound frightens a little less than the last
    function scare(gu, v) { gu.dread = Math.min(100, gu.dread + v * Math.pow(0.85, gu.heard || 0)); gu.heard = (gu.heard || 0) + 1; }
    function act(tool) {
      if (!started || over || cooldown > 0) return;
      const ty = toys[sel];
      if (ty.plan.length && !still) { say("Stop first: hold still, then act."); return; }
      if (tool.id === "taps") {
        const door = DOORS.find((d) => toys.every((o) => o.lvl === d.lvl && Math.abs(o.x - d.x) < 0.8));
        if (!door) { say("Three taps needs both toys at one door."); return; }
        guests.filter((gu) => gu.room === door.room).forEach((gu) => { scare(gu, tool.dread); gu.lookAt = door; gu.warn = 0.6; gu.open = Math.max(gu.open, 0); });
        say(`Three taps at the ${door.room === "parlour" ? "parlour" : "bedroom"} door.`);
      } else {
        let hit = 0;
        guests.forEach((gu) => {
          const gl = gu.ey > FLOOR ? 1 : 0;
          if (Math.abs(gl - ty.lvl) > tool.floors) return;
          if (Math.hypot(gu.ex - ty.x, gu.ey - ty.y - 0.4) <= tool.range) { scare(gu, tool.dread); hit++; }
        });
        say(hit ? `${tool.name}: ${hit} guest${hit > 1 ? "s" : ""} heard it.` : `${tool.name}: nobody near enough to hear.`);
      }
      hunger = Math.max(0, hunger - tool.hunger); cooldown = 2;
      // an action is a movement: inside an open cone it is seen
      const seer = guests.find((gu) => inCone(gu, ty.x, ty.y));
      if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw the ${ty.name === "You" ? "cat" : "bear"} move.`); ty.grace = 2; }
    }
    function update(dt) {
      t += dt;
      if (cooldown > 0) cooldown -= dt;
      if (flash > 0) flash = Math.max(0, flash - dt * 1.5);
      hunger += dt / 2 / speed;
      // the pack's own rhythm: the friends play Sound by themselves (+6 to every guest across the night)
      const pk = Math.min(6, (t / (NIGHT * speed)) * 6); guests.forEach((gu) => (gu.dread += pk - pack)); pack = pk;
      // guests' eyes
      guests.forEach((gu) => {
        const awake = t < gu.awakeUntil * speed;
        if (awake) { gu.open = 1; gu.look = gu.face + Math.sin(t * 0.9 / speed) * 0.55; return; }
        if (gu.open > 0) { gu.open -= dt / speed; gu.look += (Math.sin(t * 1.3) * 0.5 * dt); if (gu.open <= 0) { gu.lookAt = null; gu.look = gu.face; gu.next = (gu.sleep[0] + rng() * (gu.sleep[1] - gu.sleep[0])) * speed; } return; }
        if (gu.warn > 0) {
          gu.warn -= dt / speed;
          if (gu.warn <= 0) {
            gu.open = 2 + rng() * 2;
            if (gu.lookAt) { const tx = gu.lookAt.x - gu.ex, ty2 = (gu.lookAt.lvl * FLOOR + 0.6) - gu.ey; gu.look = Math.atan2(ty2, tx); }
            else gu.look = gu.face + (rng() - 0.5) * 0.6;
          }
          return;
        }
        gu.next -= dt;
        if (gu.next <= 0) gu.warn = 0.8;
      });
      // toys walk while Still is released
      const holding = still;
      toys.forEach((ty, i) => {
        ty.grace = Math.max(0, ty.grace - dt);
        ty.moved = false;
        if (i === sel && holding) return;
        if (i !== sel && !ty.plan.length) return;
        if (i !== sel && holding) return; // the pulse: the pack holds together
        if (!ty.plan.length) return;
        const w = ty.plan[0];
        const dx = w.x - ty.x, dy = w.y - ty.y, d = Math.hypot(dx, dy);
        const step = (SPEED / speed) * dt * (w.stair ? 1.6 : 1);
        if (d <= step) { ty.x = w.x; ty.y = w.y; ty.lvl = w.lvl; ty.plan.shift(); }
        else { ty.x += dx / d * step; ty.y += dy / d * step; }
        ty.moved = true;
        // creaking third step
        if (w.stair && !ty.creaked) {
          const f = Math.min(ty.y, FLOOR - ty.y) / FLOOR;
          if (ty.y > 0.25 && ty.y < 1.05 && f < 0.35) {
            ty.creaked = true;
            guests.forEach((gu) => { if (Math.hypot(gu.ex - ty.x, gu.ey - ty.y) <= 4 && gu.open <= 0) { gu.lookAt = { x: ty.x, lvl: 0 }; gu.warn = 0.4; say(`The third step creaks. ${gu.name} stirs.`); } });
          }
        }
        const seer = guests.find((gu) => inCone(gu, ty.x, ty.y));
        if (seer && ty.grace <= 0) { slip(seer, `${seer.name} saw ${i === 0 ? "the cat" : "Jamie"} move.`); ty.grace = 2.5; }
      });
      // the hunger: tremor, then a lurch at 100
      if (hunger >= 100) {
        const ty = toys[0];
        memories -= 2; hunger = 55; flash = 1;
        const seer = guests.find((gu) => inCone(gu, ty.x, ty.y));
        say("The hunger lurches you: two memories go.");
        if (seer) slip(seer, `${seer.name} saw the lurch.`);
        if (memories <= 0) lose();
      }
      if (!over && t >= NIGHT * speed) finish();
    }
    function finish() {
      over = true;
      const avg = guests.reduce((a, gu) => a + gu.dread, 0) / guests.length;
      const won = avg >= 35 && memories > 0;
      api.end({ outcome: won ? "win" : "done", text: `05:00. The night ends with the guests' dread at ${Math.floor(avg)} on average, 35 needed (${guests.map((gu) => `${gu.name} ${Math.round(gu.dread)}`).join(", ")}). ${slips} slip${slips === 1 ? "" : "s"}, ${memories} memor${memories === 1 ? "y" : "ies"} left.${won ? "" : " Not yet enough to make them think of leaving."}` });
    }
    function lose() { if (over) return; over = true; api.end({ outcome: "lose", text: `${clock()}. Nothing is left of you to hold still with. ${slips} slip${slips === 1 ? "" : "s"}.` }); }

    // ---- input -------------------------------------------------------------------------------
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    K.on(cv, "pointerdown", (e) => {
      if (!started || over) return;
      const [px, py] = pt(e);
      const mx = (px - L.ox) / L.k, my = (L.base - py) / L.k;
      const ti = toys.findIndex((ty) => Math.abs(ty.x - mx) < 0.5 && my > ty.y - 0.2 && my < ty.y + 1.0);
      if (ti >= 0) { sel = ti; return; }
      if (mx < -0.3 || mx > W_M + 0.3 || my < 0 || my > 2 * FLOOR) return;
      plan(toys[sel], mx, my >= FLOOR ? 1 : 0);
    });
    function setStill(v) { still = v; stillBtn.setAttribute("aria-pressed", String(v)); }
    K.on(stillBtn, "pointerdown", (e) => { e.preventDefault(); if (stillToggle) setStill(!still); else setStill(true); });
    K.on(stillBtn, "pointerup", () => { if (!stillToggle) setStill(false); });
    K.on(stillBtn, "pointerleave", () => { if (!stillToggle && still) setStill(false); });
    K.on(stillBtn, "click", (e) => { if (e.detail === 0) setStill(!still); }); // keyboard activation toggles
    toolBtns.forEach((b) => K.on(b, "click", () => act(TOOLS.find((x) => x.id === b.dataset.tool))));
    K.on(wrap.querySelector('button[data-a="switch"]'), "click", () => { sel = (sel + 1) % toys.length; });
    K.on(wrap, "keydown", (e) => {
      if (!started || over) return;
      if (e.key === " " && !e.repeat) { e.preventDefault(); if (stillToggle) setStill(!still); else setStill(true); }
      else if (e.key === "Tab") { e.preventDefault(); sel = (sel + 1) % toys.length; }
      else if (["1", "2", "3", "4"].includes(e.key)) act(TOOLS[+e.key - 1]);
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { const ty = toys[sel]; plan(ty, ty.x + (e.key === "ArrowLeft" ? -1 : 1), ty.lvl); }
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") { const ty = toys[sel]; plan(ty, e.key === "ArrowUp" ? STAIR.x1 + 0.4 : STAIR.x0 - 0.4, e.key === "ArrowUp" ? 1 : 0); }
    });
    K.on(wrap, "keyup", (e) => { if (e.key === " " && !stillToggle) { e.preventDefault(); setStill(false); } });
    K.on(window, "blur", () => { if (!stillToggle) setStill(false); });

    let prev = performance.now(), tickRaf = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
      if (started && !over) update(dt);
      tickRaf = requestAnimationFrame(tick);
    }
    tickRaf = requestAnimationFrame(tick);

    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div><h2>Dollhouse cutaway</h2><small>Night one: the Sound game</small>
      <p>Tap a room to send your cat there; it walks whenever you are not holding <b>Still</b> (Space, or the button). A toy standing still in an open eye is safe. Moving inside one is a slip.</p>
      <p>Get near the guests and frighten them: Thump, Drag (through a floor), Squeak, and Three taps with Jamie at the same door (Tab switches toy). Each guest gets used to a noise, so spread your fright across all three: their dread must average 35 by 05:00.</p>
      <button type="button">Start</button>
      <label><input type="checkbox" data-o="toggle"> Still toggles instead of hold</label>
      <label><input type="checkbox" data-o="half"> Half speed (night clock and cones)</label></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    K.on(sb, "click", () => {
      stillToggle = intro.querySelector('[data-o="toggle"]').checked; speed = intro.querySelector('[data-o="half"]').checked ? 2 : 1;
      guests.forEach((gu) => (gu.next *= speed));
      intro.remove(); started = true; wrap.focus();
    });
    sb.focus();

    const ro = new ResizeObserver(() => layout());
    ro.observe(wrap);
    layout(); K.frame(draw);
    return { unmount() { cancelAnimationFrame(tickRaf); K.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

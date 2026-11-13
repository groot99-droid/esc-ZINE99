// Behind the Peephole / The eye at the hole (2D, tilt). Style: fisheye gouache: warm opaque paint
// inside one bowed circle, everything else the black of the valet door.
// One shift at one door: room 402, night one (`n1_shift_eye`), with its six beats from
// games/behind-the-peephole/data/beats.json, suspicion from DESIGN.md section 12, the gap, the
// look at the lens and the blind lens. Cuts: one room instead of six; the quiet hours between
// 00:20 and 02:10 pass quickly; the lens is drawn larger than 34 % of the screen height so a
// phone can read it; layer parallax is left out.

const RW = 1280, RH = 960, D = 400;          // room plane, and the lens's view width in plane px
const MIN = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
const START = MIN("23:34"), END = MIN("02:33");
const SPM = 1.6;                              // real seconds per game minute (about 40x)

// The guest's evening, as poses on the room plane. face: 0 turned away, 1 facing the door far, 2 near.
const POSES = [
  { from: "23:37", pose: "stand", x: 185, y: 820, face: 0 },        // in at the main door, keycard
  { from: "23:40", pose: "stand", x: 205, y: 820, face: 0 },        // the chain, seven times
  { from: "23:44", pose: "walk", x: 420, y: 840, face: 1, to: 560 }, // crosses the room
  { from: "23:47", pose: "sit", x: 620, y: 720, face: 0 },          // watches the game show
  { from: "00:05", pose: "stand", x: 880, y: 860, face: 2 },        // turns the TV off, close to the door
  { from: "00:09", pose: "phone", x: 640, y: 720, face: 1 },        // whispers on the phone
  { from: "00:21", pose: "sleep", x: 640, y: 700, face: 0 },
  { from: "02:15", pose: "sit", x: 560, y: 720, face: 0, stare: true }, // the knock; she stares at the door
  { from: "02:29", pose: "stand", x: 250, y: 850, face: 0 },        // goes to the envelope
];
// The night's beats in 402, verbatim clue text from beats.json. pt(t): where to hold the eye.
const BEATS = [
  { id: "keycard", start: "23:37", end: "23:43", kind: "hands", text: "The keycard shakes in her hand; she drops it twice.", pt: () => ({ x: 245, y: 560 }), floor: () => ({ x: 230 }) },
  { id: "chain", start: "23:40", end: "23:48", kind: "ritual", text: "The door chain on, seven times.", pt: () => ({ x: 262, y: 430 }) },
  { id: "pollen", start: "23:44", end: "23:52", kind: "clothing", text: "Pollen on a dark sleeve. Her glasses fog, then clear.", pt: (g) => ({ x: g.x + 26, y: g.y - 230 }) },
  { id: "tv", start: "23:47", end: "00:05", kind: "tv", text: "A game show, loud.", pt: () => ({ x: 945, y: 455 }) },
  { id: "call", start: "00:10", end: "00:20", kind: "calls", text: "Whispers into the phone: \"Is she eating?\"", pt: (g) => ({ x: g.x + 10, y: g.y - 205 }) },
  { id: "envelope", start: "02:14", end: "02:30", kind: "visitors", text: "An envelope under the main door. She stares at it and leaves it till 02:30.", pt: () => ({ x: 170, y: 905 }), floor: () => ({ x: 170 }) },
];
const SUBS = [
  { from: "23:37", to: "23:40", text: "[a keycard scrapes at the lock, twice]" },
  { from: "23:47", to: "00:05", text: "[a game show, loud: applause]" },
  { from: "00:10", to: "00:20", text: "[whispering]  “Is she eating?”" },
  { from: "02:14", to: "02:17", text: "[a knock at her main door, 2:14]" },
];

export default {
  mount(root, api) {
    const P = "behind-the-peephole-eye-at-the-hole-";
    const COL = { bottle: "#1f3d2c", bottleD: "#13271c", bottleL: "#2f5a40", amber: "#e0a24a", amberL: "#f6cf86", brass: "#b8913f", brassL: "#e3c47a", river: "#6f7c80", cream: "#efe6cf", ev: "#a3302a" };
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:#0b0907;overflow:hidden;touch-action:none;user-select:none;cursor:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:${COL.cream}}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}hud{position:absolute;right:14px;bottom:14px;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;cursor:default}
    .${P}b{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.12em;color:${COL.amberL};background:rgba(11,9,7,.75);border:1px solid ${COL.brass};min-height:42px;padding:6px 12px;cursor:pointer}
    .${P}b.on{background:${COL.brass};color:#1c1a17}
    .${P}sub{position:absolute;left:12px;right:12px;bottom:72px;text-align:center;font-size:14px;color:${COL.amberL};text-shadow:0 1px 4px #000;pointer-events:none;min-height:1.3em}
    .${P}toast{position:absolute;left:14px;bottom:150px;max-width:min(360px,70vw);font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:15px;background:${COL.cream};color:#1c1a17;padding:8px 10px;transform:rotate(-2deg);box-shadow:0 4px 14px #000a;transition:opacity .5s;pointer-events:none}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(11,9,7,.85);z-index:3;padding:16px;cursor:default}
    .${P}intro div{max-width:520px;border:1px solid ${COL.brass};background:#140f0a;padding:20px 22px;font-size:14px;line-height:1.55}
    .${P}intro h2{font-family:'Cormorant Garamond',Georgia,serif;color:${COL.amberL};font-size:30px;margin:0 0 8px}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.appendChild(wrap);
    const cv = document.createElement("canvas");
    wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const sub = document.createElement("div"); sub.className = P + "sub"; wrap.appendChild(sub);
    const toast = document.createElement("div"); toast.className = P + "toast"; toast.style.opacity = 0; wrap.appendChild(toast);
    const hud = document.createElement("div");
    hud.className = P + "hud";
    hud.innerHTML = `<button type="button" class="${P}b" data-a="back">STEP BACK · ESC</button><button type="button" class="${P}b" data-a="crouch">CROUCH · C</button>`;
    wrap.appendChild(hud);
    const backBtn = hud.querySelector('[data-a="back"]'), crouchBtn = hud.querySelector('[data-a="crouch"]');

    // ---- the painted room, once
    const rng = api.rng(402);
    const room = document.createElement("canvas"); room.width = RW; room.height = RH;
    const scene = document.createElement("canvas"); scene.width = RW; scene.height = RH;
    const rc = room.getContext("2d"), sc = scene.getContext("2d");
    function dabs(g, x, y, w, h, cols, n, len = 14, vertical = false) {
      g.lineCap = "round";
      for (let i = 0; i < n; i++) {
        const px = x + rng() * w, py = y + rng() * h, a = (vertical ? Math.PI / 2 : 0) + (rng() - 0.5) * 0.9, L = len * (0.5 + rng());
        g.strokeStyle = cols[Math.floor(rng() * cols.length)]; g.globalAlpha = 0.28 + rng() * 0.3; g.lineWidth = 3 + rng() * 4;
        g.beginPath(); g.moveTo(px - L * Math.cos(a) / 2, py - L * Math.sin(a) / 2); g.lineTo(px + L * Math.cos(a) / 2, py + L * Math.sin(a) / 2); g.stroke();
      }
      g.globalAlpha = 1;
    }
    function paintRoom() {
      const g = rc;
      // wall: bottle-green wallpaper stripes
      g.fillStyle = COL.bottle; g.fillRect(0, 0, RW, 790);
      for (let x = 0; x < RW; x += 46) { g.fillStyle = "rgba(47,90,64,.6)"; g.fillRect(x, 0, 14, 790); g.fillStyle = "rgba(61,107,76,.5)"; g.fillRect(x + 24, 0, 4, 790); }
      dabs(g, 0, 0, RW, 790, [COL.bottleL, "#3d6b4c", COL.bottleD], 900, 16, true);
      g.fillStyle = "#4a3420"; g.fillRect(0, 150, RW, 16);  // picture rail
      g.fillStyle = "#3a2716"; g.fillRect(0, 772, RW, 22);  // skirting
      // carpet
      g.fillStyle = "#7a4a24"; g.fillRect(0, 790, RW, RH - 790);
      for (let y = 800; y < RH; y += 20) { g.fillStyle = "rgba(143,90,44,.55)"; g.fillRect(0, y, RW, 6); }
      dabs(g, 0, 790, RW, RH - 790, ["#9a6a3a", "#6a3d1e"], 500, 18);
      // main door (vestibule), dark wood with brass
      g.fillStyle = "#3b2414"; g.fillRect(90, 250, 220, 540);
      g.strokeStyle = "#24160c"; g.lineWidth = 6; g.strokeRect(110, 280, 180, 220); g.strokeRect(110, 530, 180, 230);
      dabs(g, 90, 250, 220, 540, ["#5a3820", "#2a180c"], 160, 20, true);
      g.fillStyle = COL.brass; g.beginPath(); g.arc(270, 560, 10, 0, 7); g.fill(); g.fillRect(262, 548, 18, 6);
      g.fillStyle = "#ffd98a"; g.globalAlpha = 0.35; g.fillRect(92, 786, 216, 6); g.globalAlpha = 1; // light under the door
      // coat hook
      g.fillStyle = COL.brass; g.fillRect(340, 300, 26, 8);
      // bathroom door ajar, a strip of light
      g.fillStyle = "#2c2418"; g.fillRect(370, 330, 150, 450);
      g.fillStyle = "#f2e2b0"; g.globalAlpha = 0.65; g.fillRect(500, 340, 14, 430); g.globalAlpha = 1;
      // bed: headboard, cream sheets, green blanket
      g.fillStyle = "#4a2f1a"; g.fillRect(560, 470, 340, 190);
      g.fillStyle = "#d9c7a3"; g.fillRect(540, 620, 380, 160);
      g.fillStyle = "#efe2c4"; g.fillRect(560, 600, 150, 46);
      g.fillStyle = "#6c7d5c"; g.fillRect(540, 690, 380, 90);
      dabs(g, 540, 600, 380, 180, ["#e9dcbc", "#bfae88", "#7d8f6b"], 260, 12);
      g.fillStyle = "#3a2716"; g.fillRect(540, 776, 380, 14);
      // desk with TV and lamp
      g.fillStyle = "#5a3a1e"; g.fillRect(840, 560, 230, 20); g.fillRect(852, 580, 18, 200); g.fillRect(1040, 580, 18, 200);
      g.fillStyle = "#1f1c1a"; g.fillRect(880, 400, 140, 110); g.fillStyle = "#2a2826"; g.fillRect(930, 510, 40, 50);
      g.fillStyle = COL.brass; g.fillRect(1046, 440, 8, 120);
      g.fillStyle = COL.bottleL; g.beginPath(); g.moveTo(1018, 440); g.lineTo(1082, 440); g.lineTo(1070, 390); g.lineTo(1030, 390); g.fill();
      // window: river-grey night behind a blind
      g.fillStyle = "#2b3540"; g.fillRect(1100, 220, 150, 330);
      g.fillStyle = COL.river; g.globalAlpha = 0.6; g.fillRect(1100, 220, 150, 120); g.globalAlpha = 1;
      for (let y = 226; y < 548; y += 18) { g.fillStyle = "rgba(76,90,96,.85)"; g.fillRect(1100, y, 150, 5); }
      g.fillStyle = "#5a3e22"; g.fillRect(1090, 548, 170, 14);
      // armchair arm, very near, bottom right
      g.fillStyle = "#4b2a1a"; g.beginPath(); g.moveTo(1280, 820); g.lineTo(1120, 860); g.lineTo(1100, 960); g.lineTo(1280, 960); g.fill();
      dabs(g, 1100, 820, 180, 140, ["#6a3d24", "#3a1e12"], 80, 14);
      // the rose's own view: a warm lamp pool
      const pool = g.createRadialGradient(1050, 470, 10, 1050, 470, 300);
      pool.addColorStop(0, "rgba(246,207,134,.55)"); pool.addColorStop(1, "rgba(224,162,74,0)");
      g.fillStyle = pool; g.fillRect(700, 170, 600, 600);
    }
    paintRoom();

    // ---- state
    const T = () => START + game;      // current game minute
    let game = 0, eye = { x: 260, y: 520 }, tgt = { x: 260, y: 520 }, speed = 0, mode = "eye"; // eye | back | gap
    let gapX = 260;
    let susp = 0, blind = false, look = null, glanceCD = 0, over = false, started = false;
    const caught = new Set(), prog = {};
    let toastT = 0, ffLabel = false;
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };

    function poseAt(t) {
      let p = null;
      for (const q of POSES) if (t >= MIN(q.from)) p = q;
      if (!p) return null;
      const g = { ...p };
      if (p.pose === "walk") { const k = Math.min(1, (t - MIN(p.from)) / 3); g.x = p.x + (p.to - p.x) * k; }
      return g;
    }
    function drawGuest(g, guest, t) {
      if (!guest) return;
      const { x, y, pose } = guest;
      g.save();
      const coat = "#2a2a33", coatL = "#3c3c50", skin = "#8a6448", hair = "#2a1e16";
      if (pose === "sleep") {
        g.fillStyle = coat; g.beginPath(); g.ellipse(x + 60, y - 50, 120, 26, 0, 0, 7); g.fill();
        g.fillStyle = hair; g.beginPath(); g.ellipse(x - 70, y - 70, 26, 22, 0, 0, 7); g.fill();
        g.restore(); return;
      }
      const sit = pose === "sit" || pose === "phone";
      const h = sit ? 190 : 270;
      // body: a painted cut-out
      g.fillStyle = coat;
      g.beginPath();
      g.moveTo(x - 46, y); g.lineTo(x - 50, y - h * 0.62); g.quadraticCurveTo(x - 44, y - h * 0.86, x, y - h * 0.88);
      g.quadraticCurveTo(x + 44, y - h * 0.86, x + 50, y - h * 0.62); g.lineTo(x + 46, y); g.closePath(); g.fill();
      g.fillStyle = coatL; g.fillRect(x - 30, y - h * 0.8, 60, h * 0.3);
      if (sit) { g.fillStyle = "#24242c"; g.fillRect(x - 46, y - 60, 120, 40); }
      // head
      const hy = y - h * 0.88 - 34;
      g.fillStyle = skin; g.beginPath(); g.ellipse(x, hy, 26, 32, 0, 0, 7); g.fill();
      g.fillStyle = hair;
      if (guest.face) { g.beginPath(); g.ellipse(x, hy - 16, 28, 20, 0, Math.PI, 0); g.fill(); g.fillStyle = "#1c1a17"; g.fillRect(x - 13, hy - 2, 7, 4); g.fillRect(x + 6, hy - 2, 7, 4); g.strokeStyle = "#c9bfa6"; g.lineWidth = 1.5; g.strokeRect(x - 16, hy - 5, 12, 9); g.strokeRect(x + 4, hy - 5, 12, 9); }
      else { g.beginPath(); g.ellipse(x, hy - 4, 29, 32, 0, 0, 7); g.fill(); }
      // hands, phone, pollen
      if (pose === "phone") { g.fillStyle = "#1c1a17"; g.fillRect(x + 18, hy - 6, 10, 24); }
      if (t >= MIN("23:44") && t < MIN("23:52")) { g.fillStyle = "#e9c84a"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.8; g.fillRect(x + 14 + ((i * 7) % 26), y - h * 0.7 + ((i * 11) % 40), 3, 3); } g.globalAlpha = 1; }
      g.restore();
    }
    function paintScene(t) {
      sc.drawImage(room, 0, 0);
      const tvOn = t >= MIN("23:45") && t < MIN("00:05");
      if (tvOn) {
        sc.fillStyle = `hsl(${205 + Math.sin(performance.now() / 180) * 15},70%,${55 + Math.sin(performance.now() / 90) * 10}%)`;
        sc.fillRect(888, 408, 124, 94);
        const glow = sc.createRadialGradient(950, 455, 10, 950, 455, 340);
        glow.addColorStop(0, "rgba(120,170,230,.35)"); glow.addColorStop(1, "rgba(120,170,230,0)");
        sc.fillStyle = glow; sc.fillRect(600, 120, 700, 700);
      }
      const sleeping = t >= MIN("00:21") && t < MIN("02:14");
      if (sleeping) { sc.fillStyle = "rgba(8,10,14,.55)"; sc.fillRect(0, 0, RW, RH); }
      // door chain
      const chainOn = t >= MIN("23:40") + ((t - MIN("23:40")) % 1 > 0.5 ? 0 : 0);
      sc.strokeStyle = COL.brassL; sc.lineWidth = 3;
      sc.beginPath();
      if (t >= MIN("23:40") && t < MIN("23:46")) { const k = Math.sin((t - MIN("23:40")) * 6) > 0; sc.moveTo(290, 420); sc.quadraticCurveTo(320, k ? 440 : 470, 350, 430); }
      else if (t >= MIN("23:46") || !chainOn) { sc.moveTo(290, 420); sc.lineTo(350, 430); }
      sc.stroke();
      // keycard, dropped
      if (t >= MIN("23:37") && t < MIN("23:41")) { sc.fillStyle = COL.cream; sc.fillRect(220, (t - MIN("23:37")) % 2 < 1 ? 552 : 880, 30, 18); }
      // the envelope under the main door
      if (t >= MIN("02:14") && t < MIN("02:31")) { sc.fillStyle = "#f3ead2"; sc.fillRect(140, 896, 64, 22); sc.strokeStyle = "#b8a77f"; sc.lineWidth = 1; sc.strokeRect(140, 896, 64, 22); }
      // the guest, once her door has opened
      if (t >= MIN("23:37")) drawGuest(sc, poseAt(t), t);
    }

    // ---- screen geometry
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, door = null;
    function resize() {
      const r = wrap.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(H * 0.3, W * 0.42); cx = W / 2; cy = H * 0.46;
      // the dark door, lit only around the lens
      door = document.createElement("canvas"); door.width = cv.width; door.height = cv.height;
      const g = door.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#0b0907"; g.fillRect(0, 0, W, H);
      const glow = g.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 2.6);
      glow.addColorStop(0, "rgba(106,66,32,.85)"); glow.addColorStop(0.4, "rgba(58,36,20,.55)"); glow.addColorStop(1, "rgba(11,9,7,0)");
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      const rr = api.rng(9);
      g.strokeStyle = "#c88a4a"; g.globalAlpha = 0.16; g.lineWidth = 1;
      for (let i = 0; i < 60; i++) { const y0 = rr() * H, a = 4 + rr() * 12, f = 0.004 + rr() * 0.006, ph = rr() * 6; g.beginPath(); for (let x = -10; x <= W + 10; x += 20) g.lineTo(x, y0 + a * Math.sin(ph + x * f)); g.stroke(); }
      g.globalAlpha = 1;
      // brass escutcheon
      const br = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R + 30);
      br.addColorStop(0, COL.brassL); br.addColorStop(0.8, COL.brass); br.addColorStop(1, "#5d4518");
      g.fillStyle = br; g.beginPath(); g.arc(cx, cy, R + 26, 0, 7); g.fill();
      g.strokeStyle = "#3b2a0e"; g.lineWidth = 2; g.stroke();
      for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.strokeStyle = "rgba(107,82,32,.6)"; g.beginPath(); g.moveTo(cx + (R + 6) * Math.cos(a), cy + (R + 6) * Math.sin(a)); g.lineTo(cx + (R + 22) * Math.cos(a), cy + (R + 22) * Math.sin(a)); g.stroke(); }
      // room plate
      g.fillStyle = COL.brass; g.fillRect(cx - 46, Math.max(6, cy - R - 70), 92, 34); g.strokeStyle = "#3b2a0e"; g.strokeRect(cx - 46, Math.max(6, cy - R - 70), 92, 34);
      g.fillStyle = "#2a1a0c"; g.font = "bold 22px Georgia,serif"; g.textAlign = "center"; g.fillText("402", cx, Math.max(6, cy - R - 70) + 25);
    }

    // ---- the lens: barrel distortion by concentric rings
    const K = 16;
    function drawLens(ex, ey, blur) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      ctx.fillStyle = "#000"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      if (blur && "filter" in ctx) ctx.filter = "blur(5px)";
      for (let k = K; k >= 1; k--) {
        const r = k / K, dr = R * r;
        const rho = r * (1 - 0.18 * (1 - r * r));   // 18 % barrel: the centre is magnified
        const s = (D / 2) * rho;
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, dr, 0, 7); ctx.clip();
        ctx.drawImage(scene, ex - s, ey - s, 2 * s, 2 * s, cx - dr, cy - dr, 2 * dr, 2 * dr);
        ctx.restore();
      }
      ctx.filter = "none";
      if (blind) {
        ctx.fillStyle = "#e8e0cc"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.strokeStyle = "rgba(160,150,128,.5)"; ctx.lineWidth = 3;
        for (let y = -R; y < R; y += 7) { ctx.beginPath(); for (let x = -R; x <= R; x += 6) ctx.lineTo(cx + x, cy + y + ((x / 6) % 2 ? 2 : -2)); ctx.stroke(); }
      }
      if (look && performance.now() >= look.t) {
        // the guest looks straight at the rose: her eye fills a quarter of the view
        const a = Math.min(1, (performance.now() - look.t) / 250);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#8a6448"; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.75, R * 0.42, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#efe6cf"; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.5, R * 0.22, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#5a3a1e"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, 7); ctx.fill();
        ctx.fillStyle = "#120c08"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.08, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.globalAlpha = a * 0.7; ctx.beginPath(); ctx.arc(cx - R * 0.05, cy - R * 0.06, R * 0.03, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      }
      const rim = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
      rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(1, "rgba(0,0,0,.85)");
      ctx.fillStyle = rim; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.ellipse(cx - R * 0.45, cy - R * 0.5, R * 0.22, R * 0.08, -0.6, 0, 7); ctx.fill();
      ctx.restore();
      // inner half, where a beat must sit
      ctx.setLineDash([3, 9]); ctx.strokeStyle = "rgba(246,207,134,.45)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R / 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    function drawCatchRing(p) {
      ctx.lineWidth = 9; ctx.strokeStyle = "#2a1a0c"; ctx.beginPath(); ctx.arc(cx, cy, R + 13, 0, 7); ctx.stroke();
      if (p > 0) { ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.strokeStyle = COL.amber; ctx.beginPath(); ctx.arc(cx, cy, R + 13, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.lineCap = "butt"; }
    }
    function drawGap(blur) {
      // crouched at the gap: a strip at floor level, moving on X only
      const sh = Math.max(40, H * 0.09), sy = H * 0.5 - sh / 2;
      ctx.fillStyle = "#050403"; ctx.fillRect(0, 0, W, H);
      const span = RW / 2.6 * 1.3, srcY = 860, srcH = RH - srcY;
      ctx.save();
      if (blur && "filter" in ctx) ctx.filter = "blur(4px)";
      ctx.drawImage(scene, gapX - span / 2, srcY, span, srcH, 0, sy, W, sh);
      ctx.restore();
      const gr = ctx.createLinearGradient(0, sy, 0, sy + sh);
      gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.3, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.4)");
      ctx.fillStyle = gr; ctx.fillRect(0, sy, W, sh);
      ctx.strokeStyle = "rgba(246,207,134,.45)"; ctx.setLineDash([3, 9]);
      ctx.strokeRect(W / 4, sy - 6, W / 2, sh + 12); ctx.setLineDash([]);
      return { sy, sh };
    }

    // ---- loop
    let raf = 0, last = performance.now();
    function step(dt) {
      if (!started || over) return;
      const t = T();
      // clock: quick through the quiet hours
      const active = BEATS.some((b) => !caught.has(b.id) && t >= MIN(b.start) - 3 && t <= MIN(b.end));
      const next = BEATS.filter((b) => MIN(b.start) > t).map((b) => MIN(b.start))[0];
      const quiet = !active && next && next - t > 4 && t > MIN("00:20");
      ffLabel = quiet;
      game += dt * (quiet ? 18 : 1 / SPM);
      if (T() >= END) { finish(); return; }
      // eye motion: ease toward the target, capped at 1.2 view-widths a second
      const ox = mode === "gap" ? gapX : eye.x, oy = eye.y;
      if (mode === "gap") {
        const d = tgt.x - gapX, k = 1 - Math.exp(-dt / 0.12);
        gapX += Math.max(-1.2 * D * dt, Math.min(1.2 * D * dt, d * k));
        gapX = Math.max(260, Math.min(RW - 260, gapX));
      } else {
        const k = 1 - Math.exp(-dt / 0.12);
        let dx = (tgt.x - eye.x) * k, dy = (tgt.y - eye.y) * k;
        const m = Math.hypot(dx, dy), cap = 1.2 * D * dt;
        if (m > cap && m > 0) { dx *= cap / m; dy *= cap / m; }
        eye.x = Math.max(D * 0.4, Math.min(RW - D * 0.4, eye.x + dx));
        eye.y = Math.max(D * 0.4, Math.min(RH - D * 0.4, eye.y + dy));
      }
      const nx = mode === "gap" ? gapX : eye.x, ny = eye.y;
      const sp = Math.hypot(nx - ox, mode === "gap" ? 0 : ny - oy) / Math.max(dt, 1e-3) / D;
      speed = speed * 0.7 + sp * 0.3;
      const still = speed < 0.05 * 3; // a little slack for pointer jitter
      // suspicion
      const guest = t >= MIN("23:37") ? poseAt(t) : null;
      const watching = mode === "eye" && !blind;
      if (watching && guest && guest.pose !== "sleep") susp += dt * (guest.face === 2 ? 9 : guest.face === 1 ? 4 : 1);
      else susp -= dt;
      susp = Math.max(0, susp);
      glanceCD -= dt;
      if (look) {
        // she turns toward the rose (a 0.6 s tell), then looks straight at it for 0.9 s
        const since = performance.now() - look.t;
        if (mode !== "eye" && since < 500) { susp += 15; look = null; }
        else if (since > 900) { susp += mode === "eye" ? 30 : 15; look = null; }
      } else if (watching && susp >= 40 && glanceCD <= 0 && guest && guest.pose !== "sleep") {
        look = { t: performance.now() + 600 }; glanceCD = 14;
      }
      if (!blind && susp >= 70) {
        blind = true; look = null;
        showToast("She hangs a towel over the brass rose. Only the gap is left tonight.", false);
      }
      // catching beats
      let ringP = 0;
      for (const b of BEATS) {
        if (caught.has(b.id)) continue;
        const open = t >= MIN(b.start) && t <= MIN(b.end);
        let ok = false;
        if (open && still && speed < 0.8) {
          if (mode === "eye" && !blind && !look) { const p = b.pt(guest || {}); ok = Math.hypot(p.x - eye.x, p.y - eye.y) < D / 4; }
          if (mode === "gap" && b.floor) ok = Math.abs(b.floor().x - gapX) < (RW / 2.6 * 1.3) / 4;
        }
        prog[b.id] = ok ? (prog[b.id] || 0) + dt : 0;
        if (prog[b.id] >= 1.5) { caught.add(b.id); showToast(b.text, true); }
        ringP = Math.max(ringP, Math.min(1, (prog[b.id] || 0) / 1.5));
      }
      return ringP;
    }
    let ringP = 0;
    function showToast(text, card) {
      toast.textContent = card ? "✎ " + text : text;
      toast.style.opacity = 1; toastT = performance.now();
    }
    function render(now) {
      const t = T();
      paintScene(t);
      ctx.drawImage(door, 0, 0, W, H);
      const blur = speed > 0.8;
      if (mode === "eye") { drawLens(eye.x, eye.y, blur); drawCatchRing(ringP); }
      else if (mode === "gap") {
        const { sy, sh } = drawGap(blur);
        if (ringP > 0) { ctx.fillStyle = COL.amber; ctx.fillRect(W / 4, sy + sh + 10, (W / 2) * ringP, 5); }
      } else {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
        ctx.fillStyle = "#1a0f08"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        gl.addColorStop(0, "rgba(224,162,74,.35)"); gl.addColorStop(1, "rgba(0,0,0,.9)");
        ctx.fillStyle = gl; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
        ctx.fillStyle = COL.amberL; ctx.font = "13px 'IBM Plex Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText("STEPPED BACK · the rose lets its light through", cx, cy + 4); ctx.textAlign = "left";
      }
      // pocket watch, unease and the cards caught tonight
      const hh = Math.floor(t / 60) % 24, mm = Math.floor(t % 60);
      ctx.fillStyle = COL.amberL; ctx.font = "600 15px 'IBM Plex Mono',monospace";
      ctx.fillText(`◷ ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}${ffLabel ? "  · the quiet hours pass" : ""}`, 16, 28);
      ctx.font = "11px 'IBM Plex Mono',monospace"; ctx.fillStyle = "rgba(239,230,207,.75)";
      ctx.fillText("402 · HER UNEASE", 16, 50);
      ctx.strokeStyle = "rgba(184,145,63,.8)"; ctx.strokeRect(16, 56, 120, 8);
      ctx.fillStyle = susp >= 70 ? COL.ev : susp >= 40 ? COL.amber : COL.brass; ctx.fillRect(17, 57, Math.min(118, 118 * susp / 100), 6);
      ctx.fillStyle = "rgba(239,230,207,.5)"; ctx.fillRect(16 + 120 * 0.4, 54, 1, 12); ctx.fillRect(16 + 120 * 0.7, 54, 1, 12);
      const n = caught.size, by = H - 26;
      ctx.fillStyle = COL.amber; ctx.font = "600 12px 'IBM Plex Mono',monospace";
      ctx.fillText(`CAUGHT TONIGHT  ${n}`, 16, by - 64);
      for (let i = 0; i < n; i++) {
        ctx.save(); ctx.translate(36 + i * 18, by); ctx.rotate((-24 + i * 9) * Math.PI / 180);
        ctx.fillStyle = COL.cream; ctx.strokeStyle = "#6b5a3a"; ctx.fillRect(-18, -48, 36, 48); ctx.strokeRect(-18, -48, 36, 48);
        ctx.strokeStyle = "rgba(122,106,82,.7)"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-12, -38 + k * 10); ctx.lineTo(12, -38 + k * 10); ctx.stroke(); }
        ctx.restore();
      }
      // subtitles: heard through the door
      const s = SUBS.find((x) => t >= MIN(x.from) && t < MIN(x.to));
      sub.textContent = look ? "[she turns toward the brass rose. Step back!]" : s ? s.text : "";
      if (performance.now() - toastT > 3800) toast.style.opacity = 0;
      // the eye's own cursor
      if (mode === "eye" && pointerIn) { ctx.strokeStyle = "rgba(246,207,134,.5)"; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.stroke(); }
    }
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      const r = step(dt); if (r != null) ringP = r;
      render(now);
      raf = requestAnimationFrame(loop);
    };

    function finish() {
      if (over) return;
      over = true;
      const strip = BEATS.map((b) => (caught.has(b.id) ? "●" : "○")).join(" ");
      const n = caught.size;
      api.store.set("best", Math.max(api.store.get("best", 0), n));
      const outcome = blind ? "lose" : n >= 5 ? "win" : n >= 3 ? "done" : "lose";
      const text = `${blind ? "She covered the rose: the rest of 402's night is terry cloth. " : ""}Caught ${n} of ${BEATS.length} in 402 tonight. The night strip, 23:00 to 05:00: ${strip}. It never says what a hollow dot was.`;
      timers.push(setTimeout(() => api.end({ outcome, text }), 400));
    }

    // ---- input
    let pointerIn = false, px = 0, py = 0, touchLast = null;
    const setMode = (m) => {
      if (over) return;
      mode = mode === m ? "eye" : m;
      if (mode === "gap") { gapX = eye.x; tgt.x = eye.x; }
      if (mode === "eye") { tgt.x = eye.x; tgt.y = eye.y; }
      backBtn.classList.toggle("on", mode === "back");
      crouchBtn.classList.toggle("on", mode === "gap");
    };
    on(backBtn, "click", () => setMode("back"));
    on(crouchBtn, "click", () => setMode("gap"));
    on(cv, "pointermove", (e) => {
      const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; pointerIn = true;
      if (e.pointerType === "mouse") {
        tgt.x = (px / W) * RW; tgt.y = (py / H) * RH;
      } else if (touchLast) {
        tgt.x -= (px - touchLast.x) * RW / W * 1.4; tgt.y -= (py - touchLast.y) * RH / H * 1.4;
        tgt.x = Math.max(0, Math.min(RW, tgt.x)); tgt.y = Math.max(0, Math.min(RH, tgt.y));
        touchLast = { x: px, y: py };
      }
    });
    on(cv, "pointerdown", (e) => { const r = cv.getBoundingClientRect(); touchLast = { x: e.clientX - r.left, y: e.clientY - r.top }; if (e.pointerType !== "mouse") cv.setPointerCapture(e.pointerId); });
    const endTouch = () => { touchLast = null; };
    on(cv, "pointerup", endTouch); on(cv, "pointercancel", endTouch);
    on(cv, "pointerleave", () => { pointerIn = false; });
    const keys = new Set();
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "Escape" || k === "b" || k === "B") { e.preventDefault(); setMode("back"); }
      else if (k === "c" || k === "C") setMode("gap");
      else if (k.startsWith("Arrow")) { e.preventDefault(); keys.add(k); }
    });
    on(window, "keyup", (e) => keys.delete(e.key));
    const keyTick = setInterval(() => {
      if (!keys.size) return;
      const v = D * 1.0 / 30;
      if (keys.has("ArrowLeft")) tgt.x -= v; if (keys.has("ArrowRight")) tgt.x += v;
      if (keys.has("ArrowUp")) tgt.y -= v; if (keys.has("ArrowDown")) tgt.y += v;
      tgt.x = Math.max(0, Math.min(RW, tgt.x)); tgt.y = Math.max(0, Math.min(RH, tgt.y));
    }, 33);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    resize();

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>The eye at the hole · 402</h2>
      <p>Your eye is at the lens in 402's valet door. Move the mouse (drag on a phone, or arrow keys) to look round her room. Hold the view still on something she does, inside the dotted inner circle, until the amber ring closes: it becomes a clue card.</p>
      <p>She can feel the dark behind the rose. <b>Step back</b> (Esc) when her unease climbs; <b>crouch</b> (C) to watch the gap under the valet door, which she never notices. At 70 she covers the lens.</p>
      <button type="button" class="${P}b">START · 23:34</button></div>`;
    wrap.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => { intro.remove(); started = true; last = performance.now(); });
    raf = requestAnimationFrame(loop);
    sb.focus();

    return {
      unmount() {
        cancelAnimationFrame(raf);
        clearInterval(keyTick);
        timers.forEach(clearTimeout);
        ro.disconnect();
        for (const [el, ev, fn, o] of listeners) el.removeEventListener(ev, fn, o);
        root.innerHTML = "";
      },
    };
  },
};

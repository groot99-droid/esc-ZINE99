// Behind the Peephole / The eye at the hole (2D, tilt). Style: fisheye gouache: warm opaque paint
// inside one bowed circle, everything else the black of the valet door.
// One shift at one door: room 402, night one (`n1_shift_eye`), with its six beats from
// games/behind-the-peephole/data/beats.json, suspicion from DESIGN.md section 12, the gap, the
// look at the lens, the blind lens and the pocket watch (section 10). Cuts: one room instead of
// six; the quiet hours between 00:20 and 02:10 pass quickly; the lens is drawn larger than 34 % of
// the screen height so a phone can read it; layer parallax is left out.
//
// Actions: LOOK (move and hold still to catch a beat), STEP BACK (halves a look's cost), CROUCH
// (the gap under the valet door: floor beats only, never felt) and the POCKET WATCH (the night
// strip so far and the windows still to come, at the price of not watching).
// Phases: her arrival (three beats at once), the evening (she comes close to the door), the quiet
// hours, and the 2:14 knock (she stares at the door; the envelope is a floor beat).
//
// A second shift (accepted 2026-11-15, phase 1): room 403, night four, The Sitting. It folds four
// phase-1 items into one sitting of about three minutes: the BRASS DOT on Mara's pinned pictures (a
// beat), THE SITTING (she pins tonight's picture facing the rose and looks straight in: hold, and the
// ring closes on her eye; step back, and she writes "gone"), ANSWERING (two taps: darken the rose
// twice within three seconds for yes) and THE HELD PAGE (night five: a page too near to take in, read
// in three holds). Cuts: the count under the picture is the design's sample, eleven, not the run's
// own; the look is held 2.4 s, not 1.5; the held page follows at once instead of a night later.
// Art (games/behind-the-peephole/art): the room plates, the 403 overlays, gap-402, the roses, the
// catch ring, the number plates, the watch face, the clue-kind icons, the chapter cards and the title;
// the towel over a covered rose; gap-403 under her valet door (the case on its edge, her boots: nothing to catch, and never felt).

const RW = 1280, RH = 960, D = 400;          // room plane, and the lens's view width in plane px
const MIN = (t) => { const [h, m] = t.split(":").map(Number); return (h < 12 ? h + 24 : h) * 60 + m; };
const START = MIN("23:34"), END = MIN("02:33");
const SPM = 2.0;                              // real seconds per game minute in the active hours

// The guest's evening, as poses on the room plane. face: 0 turned away, 1 facing the door far, 2 near.
const POSES = [
  { from: "23:37", pose: "stand", x: 185, y: 820, face: 0 },        // in at the main door, keycard
  { from: "23:40", pose: "stand", x: 205, y: 820, face: 0 },        // the chain, seven times
  { from: "23:44", pose: "walk", x: 420, y: 840, face: 1, to: 560 }, // crosses the room
  { from: "23:47", pose: "sit", x: 620, y: 720, face: 0 },          // watches the game show
  { from: "00:05", pose: "stand", x: 880, y: 860, face: 2 },        // turns the TV off, close to the door
  { from: "00:09", pose: "phone", x: 640, y: 720, face: 1 },        // whispers on the phone
  { from: "00:21", pose: "sleep", x: 640, y: 700, face: 0 },
  { from: "02:15", pose: "sit", x: 560, y: 720, face: 1, stare: true }, // the knock; she stares at the door
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
  { from: "00:05", to: "00:09", text: "[the television clicks off. She is close enough to hear breathing]" },
  { from: "00:10", to: "00:20", text: "[whispering]  “Is she eating?”" },
  { from: "00:21", to: "00:24", text: "[the lamp clicks off]" },
  { from: "02:14", to: "02:17", text: "[a knock at her main door: two quick, one slow]" },
];
// Narrative beats, in the log's hand (written for the game).
const NOTES = {
  open: "Night one, 23:34. Lew has gone back down the stair. The bell rang twice: 402 is on her way up.",
  first: "Your pencil moves before you think. The log has its first line.",
  near: "She has come to the door to switch the set off. Do not be the dark she notices.",
  quiet: "She sleeps. The quiet hours go by on the watch's second hand.",
  knock: "A knock at 2:14, at her main door, not yours. Feet go away down the hall. She does not open it.",
};

// ---- room 403, night four: The Sitting (text from data/beats.json and DEEP_DIVE.md section 2)
const M_START = MIN("03:24"), M_SIT = MIN("03:40"), M_GONE = MIN("03:50");
const M_BEATS = [
  { id: "dot", start: "03:24", end: "03:38", kind: "ritual", text: "A second river beside the first. Each has a brass dot in its corner; they are not the same.", pt: () => ({ x: 540, y: 368 }) },
  { id: "room", start: "03:28", end: "03:40", kind: "ritual", text: "Paints, but the picture is of the room.", pt: () => ({ x: 1010, y: 560 }) },
  { id: "sitting", start: "03:40", end: "03:50", kind: "ritual", text: "She pins tonight's picture facing the rose: the valet door, the rose a black dot. In pencil under it, a count of your visits, and \"I count too. Don't stop.\"", pt: () => ({ x: 640, y: 470 }) },
];
const M_POSES = [
  { from: "03:24", pose: "sit", x: 1058, y: 790, face: 0 },
  { from: "03:33", pose: "sit", x: 1058, y: 790, face: 1 },   // she turns in the chair: the old rule still holds
  { from: "03:35", pose: "sit", x: 1058, y: 790, face: 0 },
  { from: "03:40", pose: "stand", x: 1010, y: 850, face: 2 }, // beside the picture, facing the rose
];
const M_SUBS = [
  { from: "03:24", to: "03:33", text: "[a brush rinsed in a glass. The radiator ticks]" },
  { from: "03:33", to: "03:35", text: "[the chair creaks: she has turned round]" },
  { from: "03:40", to: "03:42", text: "[a pin pushed into the wall, close to the door]" },
];
const M_NOTES = {
  open: "Night four, 03:24. 403 has not left her room in two days. She paints every night and pins the picture up; tonight she is not painting the river.",
  go: "Two rivers over the bed, and Mara at the desk under the window. Look at what she has pinned up.",
  turn: "The chair creaks. She is turning toward the rose: step back.",
  sit: "She takes tonight's picture off the desk and pins it up facing you. Read it.",
  look: "She is looking straight in. Everything you have learned says step back.",
  held: "The ring closes on her eye. She does not blink first.",
  taps: "She writes “Tomorrow?” under the count and taps the pencil twice. Darken the rose twice for yes: step back and return, twice, inside three seconds.",
  yes: "The rose went dark twice. She nods once, to the brass.",
  no: "The rose stays as it is. She waits a while, then puts the pencil down.",
  page: "Night five, 23:40. She has copied the folded pages all evening. Now she holds one to the rose, too near to take in. Read it a third at a time.",
  gone: "You stepped back. When you look again she has written one word under the count: “gone”. The picture is turned to the wall.",
  never: "She stood by the picture until ten to four and the rose stayed lit. She wrote “gone” under the count.",
};
const M_PAGE = [
  { x: 290, head: "DATE", rows: ["3 MAR", "17 MAR", "31 MAR", "14 APR", "28 APR", "12 MAY"], line: "The left third: dates. Every second Friday since March." },
  { x: 640, head: "SUM", rows: ["4 000", "4 000", "4 000", "4 000", "16 000", "4 000"], line: "The middle third: sums. The same sum each time, and once four times the size." },
  { x: 990, head: "INIT.", rows: ["D.", "D.", "D.", "D.", "D.", "D."], line: "The right third: initials. One hand signs every line, and it is not hers." },
];
const KIND_ICON = { hands: "clue-hands", ritual: "clue-rituals", clothing: "clue-clothing", tv: "clue-television", calls: "clue-calls", visitors: "clue-visitors", luggage: "clue-luggage" };

export default {
  mount(root, api) {
    const P = "behind-the-peephole-eye-at-the-hole-";
    const art = api.art || { has: () => false, url: () => "", img: () => Promise.resolve(null) };
    const COL = { bottle: "#1f3d2c", bottleD: "#13271c", bottleL: "#2f5a40", amber: "#e0a24a", amberL: "#f6cf86", brass: "#b8913f", brassL: "#e3c47a", river: "#6f7c80", cream: "#efe6cf", ev: "#a3302a" };
    const RM = api.reducedMotion;
    const streak = api.store.get("lossStreak", 0);
    let gentle = api.store.get("gentle", false);
    const st = document.createElement("style");
    st.textContent = `
    .${P}wrap{position:absolute;inset:0;background:#0b0907;overflow:hidden;touch-action:none;user-select:none;cursor:none;font-family:'IBM Plex Mono',ui-monospace,monospace;color:${COL.cream}}
    .${P}wrap canvas{position:absolute;inset:0;width:100%;height:100%}
    .${P}hud{position:absolute;right:12px;bottom:12px;left:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;cursor:default;pointer-events:none}
    .${P}b{pointer-events:auto;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.1em;color:${COL.amberL};background:rgba(11,9,7,.8);border:1px solid ${COL.brass};min-height:44px;padding:6px 12px;cursor:pointer;transition:background .15s,color .15s,box-shadow .2s}
    .${P}b:hover,.${P}b:focus-visible{background:#3b2a12;outline:none;box-shadow:0 0 0 2px ${COL.amber}}
    .${P}b.on{background:${COL.brass};color:#1c1a17}
    .${P}b[hidden]{display:none}
    .${P}b.new{animation:${P}glow 1.2s ease-in-out 3}
    @keyframes ${P}glow{50%{box-shadow:0 0 0 4px ${COL.amber},0 0 22px ${COL.amber}}}
    .${P}sub{position:absolute;left:12px;right:12px;top:70%;text-align:center;font-size:15px;line-height:1.35;color:${COL.amberL};text-shadow:0 1px 4px #000,0 0 10px #000;pointer-events:none;min-height:1.3em}
    .${P}sub.warn{color:#ffb3a0;font-weight:600}
    .${P}note{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:min(760px,calc(100% - 24px));text-align:center;font:italic 500 19px/1.3 'Cormorant Garamond',Georgia,serif;color:${COL.amberL};text-shadow:0 1px 6px #000;pointer-events:none;transition:opacity .6s}
    .${P}toast{position:absolute;left:14px;bottom:150px;max-width:min(340px,calc(100% - 28px));font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:16px;line-height:1.3;background:${COL.cream};color:#1c1a17;padding:9px 12px;transform:rotate(-2deg);box-shadow:0 4px 14px #000a;transition:opacity .5s,transform .5s;pointer-events:none;
      background-image:repeating-linear-gradient(0deg,transparent 0 21px,rgba(42,58,140,.18) 21px 22px)}
    .${P}toast.in{transform:rotate(-2deg) translateY(0)}
    .${P}toast.alarm{background:#f3d6c8}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 50%,rgba(60,38,18,.75),rgba(5,4,3,.97) 70%);z-index:3;padding:12px;cursor:default}
    .${P}lens{width:min(640px,94vw);aspect-ratio:1;border-radius:50%;box-sizing:border-box;padding:10% 12%;display:flex;flex-direction:column;justify-content:center;gap:8px;text-align:center;
      background:radial-gradient(circle at 38% 32%,#e8b968 0,#b8752e 30%,#5e3518 62%,#1e1209 86%);box-shadow:0 0 0 12px ${COL.brass},0 0 0 15px #3b2a0e,0 0 60px 18px rgba(224,162,74,.25),inset 0 0 70px 20px rgba(0,0,0,.75);color:#fff4dc;text-shadow:0 1px 3px #000c}
    .${P}lens h2{font:700 clamp(26px,5vw,34px)/1 'Cormorant Garamond',Georgia,serif;margin:0;color:#fff0c8}
    .${P}lens .goal{font:italic 500 18px/1.3 'Cormorant Garamond',Georgia,serif;margin:0}
    .${P}lens .open{font:14px/1.45 'IBM Plex Mono',monospace;margin:0;opacity:.95}
    .${P}keys{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;text-align:left;font-size:14px;line-height:1.3;margin:4px auto 0;max-width:420px}
    .${P}keys b{color:#ffe1a0;letter-spacing:.06em;white-space:nowrap}
    .${P}lens .start{align-self:center;margin-top:6px;pointer-events:auto}
    .${P}lens label{font-size:14px;display:flex;gap:6px;justify-content:center;align-items:center}
    .${P}intro.ch{background-size:cover;background-position:center}
    .${P}lens img.ttl{width:56%;align-self:center;display:block;margin:-4px 0 0}
    .${P}doors{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:6px}
    .${P}doors .${P}b{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:132px;line-height:1.25}
    .${P}doors i{display:block;width:78px;height:32px;background-size:300% 200%;border-radius:3px}
    .${P}doors small{font-size:11px;letter-spacing:.06em;opacity:.9}
    @media (max-width:600px){.${P}lens{aspect-ratio:auto;border-radius:46% / 30%;padding:56px 26px}.${P}keys{font-size:14px}}
    `;
    root.appendChild(st);
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    root.appendChild(wrap);
    const cv = document.createElement("canvas");
    wrap.appendChild(cv);
    const ctx = cv.getContext("2d");
    const note = document.createElement("div"); note.className = P + "note"; note.style.opacity = 0; wrap.appendChild(note);
    const sub = document.createElement("div"); sub.className = P + "sub"; sub.setAttribute("aria-live", "polite"); wrap.appendChild(sub);
    const toast = document.createElement("div"); toast.className = P + "toast"; toast.style.opacity = 0; wrap.appendChild(toast);
    const hud = document.createElement("div");
    hud.className = P + "hud";
    hud.innerHTML = `<button type="button" class="${P}b" data-a="watch" hidden>WATCH · TAB</button><button type="button" class="${P}b" data-a="crouch" hidden>CROUCH · C</button><button type="button" class="${P}b" data-a="back">STEP BACK · ESC</button>`;
    wrap.appendChild(hud);
    const backBtn = hud.querySelector('[data-a="back"]'), crouchBtn = hud.querySelector('[data-a="crouch"]'), watchBtn = hud.querySelector('[data-a="watch"]');

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
      g.fillStyle = COL.bottle; g.fillRect(0, 0, RW, 790);
      for (let x = 0; x < RW; x += 46) { g.fillStyle = "rgba(47,90,64,.6)"; g.fillRect(x, 0, 14, 790); g.fillStyle = "rgba(61,107,76,.5)"; g.fillRect(x + 24, 0, 4, 790); }
      dabs(g, 0, 0, RW, 790, [COL.bottleL, "#3d6b4c", COL.bottleD], 900, 16, true);
      g.fillStyle = "#4a3420"; g.fillRect(0, 150, RW, 16);
      g.fillStyle = "#3a2716"; g.fillRect(0, 772, RW, 22);
      g.fillStyle = "#7a4a24"; g.fillRect(0, 790, RW, RH - 790);
      for (let y = 800; y < RH; y += 20) { g.fillStyle = "rgba(143,90,44,.55)"; g.fillRect(0, y, RW, 6); }
      dabs(g, 0, 790, RW, RH - 790, ["#9a6a3a", "#6a3d1e"], 500, 18);
      g.fillStyle = "#3b2414"; g.fillRect(90, 250, 220, 540);
      g.strokeStyle = "#24160c"; g.lineWidth = 6; g.strokeRect(110, 280, 180, 220); g.strokeRect(110, 530, 180, 230);
      dabs(g, 90, 250, 220, 540, ["#5a3820", "#2a180c"], 160, 20, true);
      g.fillStyle = COL.brass; g.beginPath(); g.arc(270, 560, 10, 0, 7); g.fill(); g.fillRect(262, 548, 18, 6);
      g.fillStyle = "#ffd98a"; g.globalAlpha = 0.35; g.fillRect(92, 786, 216, 6); g.globalAlpha = 1;
      g.fillStyle = COL.brass; g.fillRect(340, 300, 26, 8);
      g.fillStyle = "#2c2418"; g.fillRect(370, 330, 150, 450);
      g.fillStyle = "#f2e2b0"; g.globalAlpha = 0.65; g.fillRect(500, 340, 14, 430); g.globalAlpha = 1;
      g.fillStyle = "#4a2f1a"; g.fillRect(560, 470, 340, 190);
      g.fillStyle = "#d9c7a3"; g.fillRect(540, 620, 380, 160);
      g.fillStyle = "#efe2c4"; g.fillRect(560, 600, 150, 46);
      g.fillStyle = "#6c7d5c"; g.fillRect(540, 690, 380, 90);
      dabs(g, 540, 600, 380, 180, ["#e9dcbc", "#bfae88", "#7d8f6b"], 260, 12);
      g.fillStyle = "#3a2716"; g.fillRect(540, 776, 380, 14);
      g.fillStyle = "#5a3a1e"; g.fillRect(840, 560, 230, 20); g.fillRect(852, 580, 18, 200); g.fillRect(1040, 580, 18, 200);
      g.fillStyle = "#1f1c1a"; g.fillRect(880, 400, 140, 110); g.fillStyle = "#2a2826"; g.fillRect(930, 510, 40, 50);
      g.fillStyle = COL.brass; g.fillRect(1046, 440, 8, 120);
      g.fillStyle = COL.bottleL; g.beginPath(); g.moveTo(1018, 440); g.lineTo(1082, 440); g.lineTo(1070, 390); g.lineTo(1030, 390); g.fill();
      g.fillStyle = "#2b3540"; g.fillRect(1100, 220, 150, 330);
      g.fillStyle = COL.river; g.globalAlpha = 0.6; g.fillRect(1100, 220, 150, 120); g.globalAlpha = 1;
      for (let y = 226; y < 548; y += 18) { g.fillStyle = "rgba(76,90,96,.85)"; g.fillRect(1100, y, 150, 5); }
      g.fillStyle = "#5a3e22"; g.fillRect(1090, 548, 170, 14);
      g.fillStyle = "#4b2a1a"; g.beginPath(); g.moveTo(1280, 820); g.lineTo(1120, 860); g.lineTo(1100, 960); g.lineTo(1280, 960); g.fill();
      dabs(g, 1100, 820, 180, 140, ["#6a3d24", "#3a1e12"], 80, 14);
      const pool = g.createRadialGradient(1050, 470, 10, 1050, 470, 300);
      pool.addColorStop(0, "rgba(246,207,134,.55)"); pool.addColorStop(1, "rgba(224,162,74,0)");
      g.fillStyle = pool; g.fillRect(700, 170, 600, 600);
      // gouache: a last pass of warm opaque dabs over everything, so the room reads as paint
      dabs(g, 0, 0, RW, RH, ["rgba(224,162,74,.5)", "rgba(20,14,8,.5)"], 260, 22);
    }
    paintRoom();

    // ---- the art, rasterised once at the size it is drawn
    const A = {};
    let artReady = false, disposed = false;
    const rooms = { 402: room };
    async function raster(id, w, h) {
      const im = await art.img(id); if (!im || disposed) return null;
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      try { c.getContext("2d").drawImage(im, 0, 0, w, h); } catch { return null; }
      return (A[id] = c);
    }
    (async () => {
      const p402 = await raster("plate-402", RW, RH);
      if (p402) rc.drawImage(p402, 0, 0);
      const p403 = await raster("plate-403", RW, RH);
      rooms[403] = p403 || room;
      await Promise.all([
        raster("overlay-403-pictures-2", 360, 270), raster("overlay-403-sitting", 640, 480), raster("gap-402", 1600, 144), raster("gap-403", 1600, 144), raster("overlay-406-towel", 640, 480),
        raster("ui-rose-lit", 300, 300), raster("ui-rose-dark", 96, 96), raster("ui-catch-ring-closed", 480, 480),
        raster("ui-number-plates", 720, 240), raster("ui-watch-face", 72, 72),
        ...Object.values(KIND_ICON).map((id) => raster(id, 64, 64)),
      ]);
      if (disposed) return;
      artReady = true; resize();
    })();

    // ---- state
    let shift = "402", B = BEATS, PO = POSES, SU = SUBS, startMin = START, endMin = END;
    // room 403: paint | sitting | look | taps | page | end
    let mp = "paint", lookHold = 0, ans = null, answered = null, sittingHeld = false, gone = null, darkWhilePainting = false;
    const pageRead = new Set(), pageProg = [0, 0, 0], caughtKinds = [];
    let pageCv = null, pageBlur = null;
    const T = () => startMin + game;
    let game = 0, eye = { x: 260, y: 520 }, tgt = { x: 260, y: 520 }, speed = 0, mode = "eye"; // eye | back | gap | watch
    let gapX = 260;
    let susp = 0, blind = false, look = null, glanceCD = 0, over = false, started = false, looksTaken = 0;
    const caught = new Set(), prog = {}, said = new Set();
    let toastT = 0, ffLabel = false, flash = null, noteT = 0;
    const listeners = [], timers = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); };
    const HOLD = () => (gentle ? 1.0 : 1.5);

    function poseAt(t) {
      let p = null;
      for (const q of PO) if (t >= MIN(q.from)) p = q;
      if (!p) return null;
      const g = { ...p };
      if (p.pose === "walk") { const k = Math.min(1, (t - MIN(p.from)) / 3); g.x = p.x + (p.to - p.x) * k; }
      return g;
    }
    function drawGuest(g, guest, t) {
      if (!guest) return;
      const { x, y, pose } = guest;
      g.save();
      const mara = shift === "403";
      const coat = mara ? "#39464b" : "#2a2a33", coatL = mara ? "#55656b" : "#3c3c50", skin = mara ? "#b08a6a" : "#8a6448", hair = mara ? "#5a4a3e" : "#2a1e16";
      if (pose === "sleep") {
        g.fillStyle = coat; g.beginPath(); g.ellipse(x + 60, y - 50, 120, 26, 0, 0, 7); g.fill();
        g.fillStyle = hair; g.beginPath(); g.ellipse(x - 70, y - 70, 26, 22, 0, 0, 7); g.fill();
        g.restore(); return;
      }
      const sit = pose === "sit" || pose === "phone";
      const h = sit ? 190 : 270;
      // soft painted shadow on the carpet
      g.fillStyle = "rgba(10,6,3,.35)"; g.beginPath(); g.ellipse(x + 10, y + 4, 70, 14, 0, 0, 7); g.fill();
      g.fillStyle = coat;
      g.beginPath();
      g.moveTo(x - 46, y); g.lineTo(x - 50, y - h * 0.62); g.quadraticCurveTo(x - 44, y - h * 0.86, x, y - h * 0.88);
      g.quadraticCurveTo(x + 44, y - h * 0.86, x + 50, y - h * 0.62); g.lineTo(x + 46, y); g.closePath(); g.fill();
      g.fillStyle = coatL; g.fillRect(x - 30, y - h * 0.8, 60, h * 0.3);
      // lamp-side highlight, opaque gouache
      g.fillStyle = "rgba(224,162,74,.25)"; g.fillRect(x + 20, y - h * 0.84, 22, h * 0.8);
      if (sit) { g.fillStyle = "#24242c"; g.fillRect(x - 46, y - 60, 120, 40); }
      const hy = y - h * 0.88 - 34;
      g.fillStyle = skin; g.beginPath(); g.ellipse(x, hy, 26, 32, 0, 0, 7); g.fill();
      g.fillStyle = hair;
      if (guest.face) { g.beginPath(); g.ellipse(x, hy - 16, 28, 20, 0, Math.PI, 0); g.fill(); g.fillStyle = "#1c1a17"; g.fillRect(x - 13, hy - 2, 7, 4); g.fillRect(x + 6, hy - 2, 7, 4); if (!mara) { g.strokeStyle = "#c9bfa6"; g.lineWidth = 1.5; g.strokeRect(x - 16, hy - 5, 12, 9); g.strokeRect(x + 4, hy - 5, 12, 9); } }
      else { g.beginPath(); g.ellipse(x, hy - 4, 29, 32, 0, 0, 7); g.fill(); }
      if (pose === "phone") { g.fillStyle = "#1c1a17"; g.fillRect(x + 18, hy - 6, 10, 24); }
      if (mara) { // white cotton gloves, and the brush or the pencil
        g.fillStyle = "#f1ede2"; g.beginPath(); g.ellipse(x - 50, y - h * 0.5, 12, 15, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 50, y - h * 0.5, 12, 15, 0, 0, 7); g.fill();
        g.strokeStyle = "#c9a23a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 50, y - h * 0.5); g.lineTo(x - 64, y - h * 0.5 - 34); g.stroke();
      }
      if (!mara && t >= MIN("23:44") && t < MIN("23:52")) { g.fillStyle = "#e9c84a"; for (let i = 0; i < 14; i++) { g.globalAlpha = 0.8; g.fillRect(x + 14 + ((i * 7) % 26), y - h * 0.7 + ((i * 11) % 40), 3, 3); } g.globalAlpha = 1; }
      g.restore();
    }
    function buildPage() {
      pageCv = document.createElement("canvas"); pageCv.width = RW; pageCv.height = RH;
      const g = pageCv.getContext("2d");
      g.fillStyle = "#efe6cf"; g.fillRect(0, 0, RW, RH);
      g.strokeStyle = "rgba(42,58,140,.25)"; g.lineWidth = 2;
      for (let y = 250; y < RH - 60; y += 96) { g.beginPath(); g.moveTo(60, y + 34); g.lineTo(RW - 60, y + 34); g.stroke(); }
      for (const x of [465, 815]) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x, RH - 70); g.strokeStyle = "rgba(163,48,42,.45)"; g.stroke(); }
      g.fillStyle = "#1a2a5a"; g.textAlign = "center";
      for (const c of M_PAGE) {
        g.font = "600 44px 'IBM Plex Mono',monospace"; g.fillText(c.head, c.x, 180);
        g.font = "italic 64px 'Bradley Hand','Segoe Print','Comic Sans MS',cursive";
        c.rows.forEach((r, i) => { g.save(); g.translate(c.x, 270 + i * 96); g.rotate(-0.03 + (i % 3) * 0.02); g.fillText(r, 0, 0); g.restore(); });
      }
      g.textAlign = "left";
      // two gloved fingertips at the lower corners, holding it to the brass
      g.fillStyle = "#f8f5ec"; g.beginPath(); g.ellipse(70, RH - 30, 90, 70, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(RW - 70, RH - 30, 90, 70, 0, 0, 7); g.fill();
      pageBlur = document.createElement("canvas"); pageBlur.width = RW / 4; pageBlur.height = RH / 4;
      const b = pageBlur.getContext("2d");
      if ("filter" in b) b.filter = "blur(5px)";
      b.drawImage(pageCv, 0, 0, RW / 4, RH / 4);
    }
    function paintMara(t) {
      sc.drawImage(rooms[403] || room, 0, 0);
      if (A["overlay-403-pictures-2"]) sc.drawImage(A["overlay-403-pictures-2"], 360, 232);
      else for (let i = 0; i < 2; i++) { sc.fillStyle = "#f4efe2"; sc.fillRect(410 + i * 150, 300, 120, 96); sc.fillStyle = COL.river; sc.fillRect(418 + i * 150, 308, 104, 60); sc.fillStyle = i ? COL.brass : "#f4efe2"; sc.strokeStyle = COL.brass; sc.lineWidth = 2; sc.beginPath(); sc.arc(518 + i * 150, 384, 5, 0, 7); sc.fill(); sc.stroke(); }
      if (mp === "paint") { // tonight's sheet on the desk: a small dark door
        sc.fillStyle = "#f4efe2"; sc.fillRect(944, 560, 96, 34); sc.fillStyle = "#35503f"; sc.fillRect(952, 564, 80, 24); sc.fillStyle = "#5a3e26"; sc.fillRect(980, 566, 24, 22);
      }
      drawGuest(sc, poseAt(t), t);
      if (mp !== "paint") {
        if (gone) {
          sc.save(); sc.translate(640, 440); sc.rotate(0.03);
          sc.fillStyle = "rgba(0,0,0,.3)"; sc.fillRect(-146, -110, 300, 240); sc.fillStyle = "#e9e2cf"; sc.fillRect(-150, -116, 300, 240); sc.fillStyle = "#c9c2b0"; sc.beginPath(); sc.arc(0, -104, 5, 0, 7); sc.fill();
          sc.fillStyle = "#4a4a4a"; sc.font = "italic 44px 'Bradley Hand','Segoe Print',cursive"; sc.textAlign = "center"; sc.fillText("gone", 0, 20); sc.textAlign = "left";
          sc.restore();
        } else if (A["overlay-403-sitting"]) {
          sc.drawImage(A["overlay-403-sitting"], 360, 240, 560, 420);
          if (mp === "taps" || answered) { sc.save(); sc.translate(640, 590); sc.rotate(-0.035); sc.fillStyle = "#4a4a4a"; sc.font = "italic 21px 'Bradley Hand','Segoe Print',cursive"; sc.textAlign = "center"; sc.fillText("Tomorrow?", 0, 0); sc.textAlign = "left"; sc.restore(); }
        } else {
          sc.fillStyle = "#f4efe2"; sc.fillRect(420, 250, 440, 400); sc.fillStyle = "#35503f"; sc.fillRect(450, 280, 380, 250); sc.fillStyle = "#5a3e26"; sc.fillRect(570, 300, 140, 230);
          sc.fillStyle = "#0a0806"; sc.beginPath(); sc.arc(640, 420, 9, 0, 7); sc.fill(); sc.fillStyle = COL.brass; sc.beginPath(); sc.arc(820, 620, 9, 0, 7); sc.fill();
          sc.fillStyle = "#4a4a4a"; sc.font = "italic 26px 'Bradley Hand','Segoe Print',cursive"; sc.textAlign = "center"; sc.fillText("Eleven times. I count too.", 640, 580); sc.fillText(mp === "taps" || answered ? "Don't stop. Tomorrow?" : "Don't stop.", 640, 614); sc.textAlign = "left";
        }
      }
    }
    function paintScene(t) {
      if (shift === "403") { if (mp === "page") sc.drawImage(pageCv, 0, 0); else paintMara(t); return; }
      sc.drawImage(room, 0, 0);
      const tvOn = t >= MIN("23:45") && t < MIN("00:05");
      if (tvOn) {
        const k = RM ? 0 : 1;
        sc.fillStyle = `hsl(${205 + k * Math.sin(performance.now() / 180) * 15},70%,${55 + k * Math.sin(performance.now() / 90) * 10}%)`;
        sc.fillRect(888, 408, 124, 94);
        const glow = sc.createRadialGradient(950, 455, 10, 950, 455, 340);
        glow.addColorStop(0, "rgba(120,170,230,.35)"); glow.addColorStop(1, "rgba(120,170,230,0)");
        sc.fillStyle = glow; sc.fillRect(600, 120, 700, 700);
      }
      const sleeping = t >= MIN("00:21") && t < MIN("02:14");
      if (sleeping) { sc.fillStyle = "rgba(8,10,14,.55)"; sc.fillRect(0, 0, RW, RH); }
      sc.strokeStyle = COL.brassL; sc.lineWidth = 3;
      sc.beginPath();
      if (t >= MIN("23:40") && t < MIN("23:46")) { const k = Math.sin((t - MIN("23:40")) * 6) > 0; sc.moveTo(290, 420); sc.quadraticCurveTo(320, k ? 440 : 470, 350, 430); }
      else if (t >= MIN("23:46")) { sc.moveTo(290, 420); sc.lineTo(350, 430); }
      sc.stroke();
      if (t >= MIN("23:37") && t < MIN("23:41")) { sc.fillStyle = COL.cream; sc.fillRect(220, (t - MIN("23:37")) % 2 < 1 ? 552 : 880, 30, 18); }
      if (t >= MIN("02:14") && t < MIN("02:31")) { sc.fillStyle = "#f3ead2"; sc.fillRect(140, 896, 64, 22); sc.strokeStyle = "#b8a77f"; sc.lineWidth = 1; sc.strokeRect(140, 896, 64, 22); }
      if (t >= MIN("23:37")) drawGuest(sc, poseAt(t), t);
    }

    // ---- screen geometry
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, door = null, dpr = 1;
    function resize() {
      const r = wrap.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const nar = W < 600;
      R = Math.min(H * 0.3, W * 0.42); cx = W / 2; cy = H * (nar ? 0.5 : 0.46);
      note.style.top = nar ? "84px" : "10px"; note.style.fontSize = nar ? "17px" : "";
      backBtn.textContent = nar ? "BACK · ESC" : "STEP BACK · ESC"; crouchBtn.textContent = nar ? "CROUCH" : "CROUCH · C"; watchBtn.textContent = nar ? "WATCH" : "WATCH · TAB";
      sub.style.top = Math.round(cy + R + 36) + "px";
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
      const br = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.2, cx, cy, R + 30);
      br.addColorStop(0, COL.brassL); br.addColorStop(0.8, COL.brass); br.addColorStop(1, "#5d4518");
      g.fillStyle = br; g.beginPath(); g.arc(cx, cy, R + 26, 0, 7); g.fill();
      g.strokeStyle = "#3b2a0e"; g.lineWidth = 2; g.stroke();
      for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.strokeStyle = "rgba(107,82,32,.6)"; g.beginPath(); g.moveTo(cx + (R + 6) * Math.cos(a), cy + (R + 6) * Math.sin(a)); g.lineTo(cx + (R + 22) * Math.cos(a), cy + (R + 22) * Math.sin(a)); g.stroke(); }
      const plateY = Math.max(6, cy - R - 64);
      if (A["ui-number-plates"]) { const i = +shift - 401; g.drawImage(A["ui-number-plates"], 130 + (i % 3) * 230 - 80, 70 + Math.floor(i / 3) * 104 - 36, 160, 68, cx - 47, plateY - 2, 94, 40); }
      else {
        g.fillStyle = COL.brass; g.fillRect(cx - 46, plateY, 92, 34); g.strokeStyle = "#3b2a0e"; g.strokeRect(cx - 46, plateY, 92, 34);
        g.fillStyle = "#2a1a0c"; g.font = "bold 22px Georgia,serif"; g.textAlign = "center"; g.fillText(shift, cx, plateY + 25);
      }
    }

    // ---- the lens: barrel distortion by concentric rings
    const K = 16;
    function drawLens(ex, ey, blur) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      ctx.fillStyle = "#000"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      const pageMode = shift === "403" && mp === "page" && pageBlur;
      if (blur && "filter" in ctx) ctx.filter = "blur(5px)";
      for (let k = K; k >= 1; k--) {
        const r = k / K, dr = R * r;
        const rho = r * (1 - 0.18 * (1 - r * r));
        const s = (D / 2) * rho;
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, dr, 0, 7); ctx.clip();
        const far = pageMode && k > K / 2;
        if (far) ctx.drawImage(pageBlur, (ex - s) / 4, (ey - s) / 4, s / 2, s / 2, cx - dr, cy - dr, 2 * dr, 2 * dr);
        else ctx.drawImage(scene, ex - s, ey - s, 2 * s, 2 * s, cx - dr, cy - dr, 2 * dr, 2 * dr);
        ctx.restore();
      }
      ctx.filter = "none";
      if (blind && A["overlay-406-towel"]) {
        // terry cloth over the rose (the art's towel serves every room)
        ctx.fillStyle = "#d9cdb8"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.drawImage(A["overlay-406-towel"], 100, 20, 440, 440, cx - R, cy - R, 2 * R, 2 * R);
      } else if (blind) {
        ctx.fillStyle = "#e8e0cc"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.strokeStyle = "rgba(160,150,128,.5)"; ctx.lineWidth = 3;
        for (let y = -R; y < R; y += 7) { ctx.beginPath(); for (let x = -R; x <= R; x += 6) ctx.lineTo(cx + x, cy + y + ((x / 6) % 2 ? 2 : -2)); ctx.stroke(); }
      }
      if (look && performance.now() >= look.t) {
        const a = Math.min(1, (performance.now() - look.t) / 250);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#8a6448"; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.75, R * 0.42, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#efe6cf"; ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.5, R * 0.22, 0, 0, 7); ctx.fill();
        ctx.fillStyle = "#5a3a1e"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, 7); ctx.fill();
        ctx.fillStyle = "#120c08"; ctx.beginPath(); ctx.arc(cx, cy, R * 0.08, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.globalAlpha = a * 0.7; ctx.beginPath(); ctx.arc(cx - R * 0.05, cy - R * 0.06, R * 0.03, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (look && !look.sitting) {
        // the tell: the rim reddens as she turns toward the rose
        ctx.fillStyle = "rgba(163,48,42,.22)"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      }
      const rim = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
      rim.addColorStop(0, "rgba(0,0,0,0)"); rim.addColorStop(1, "rgba(0,0,0,.85)");
      ctx.fillStyle = rim; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.beginPath(); ctx.ellipse(cx - R * 0.45, cy - R * 0.5, R * 0.22, R * 0.08, -0.6, 0, 7); ctx.fill();
      ctx.restore();
      ctx.setLineDash([3, 9]); ctx.strokeStyle = "rgba(246,207,134,.55)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, R / 2, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    function drawCatchRing(p) {
      ctx.lineWidth = 9; ctx.strokeStyle = "#2a1a0c"; ctx.beginPath(); ctx.arc(cx, cy, R + 13, 0, 7); ctx.stroke();
      if (p > 0) { ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.strokeStyle = COL.amber; ctx.beginPath(); ctx.arc(cx, cy, R + 13, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke(); ctx.lineCap = "butt"; }
    }
    function drawGap(blur) {
      const sh = Math.max(48, H * 0.11), sy = cy - sh / 2;
      ctx.fillStyle = "#050403"; ctx.fillRect(0, 0, W, H);
      const span = RW / 2.6 * 1.3, srcY = 860, srcH = RH - srcY;
      ctx.save();
      if (blur && "filter" in ctx) ctx.filter = "blur(4px)";
      const gt = T();
      const ga = shift === "403" ? A["gap-403"] : gt >= MIN("02:14") && gt < MIN("02:31") ? A["gap-402"] : null;
      if (ga) ctx.drawImage(ga, (gapX - span / 2) / RW * 1600, 0, span / RW * 1600, 144, 0, sy, W, sh);
      else ctx.drawImage(scene, gapX - span / 2, srcY, span, srcH, 0, sy, W, sh);
      ctx.restore();
      const gr = ctx.createLinearGradient(0, sy, 0, sy + sh);
      gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.3, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.4)");
      ctx.fillStyle = gr; ctx.fillRect(0, sy, W, sh);
      ctx.strokeStyle = "rgba(246,207,134,.55)"; ctx.setLineDash([3, 9]);
      ctx.strokeRect(W / 4, sy - 6, W / 2, sh + 12); ctx.setLineDash([]);
      ctx.fillStyle = COL.amberL; ctx.font = "13px 'IBM Plex Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText("THE GAP UNDER THE VALET DOOR · she never feels it", cx, sy - 16); ctx.textAlign = "left";
      return { sy, sh };
    }
    // the pocket watch: the night strip so far, and the windows still to come
    function drawWatch(t) {
      const r = Math.min(R * 1.05, W * 0.44);
      ctx.save();
      ctx.fillStyle = "rgba(5,4,3,.82)"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, "#fff3d6"); g.addColorStop(1, "#d9c49a");
      ctx.fillStyle = COL.brass; ctx.beginPath(); ctx.arc(cx, cy, r + 12, 0, 7); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
      ctx.fillStyle = COL.brass; ctx.fillRect(cx - 10, cy - r - 30, 20, 20);
      ctx.fillStyle = "#2a1a0c"; ctx.textAlign = "center";
      const hh = Math.floor(t / 60) % 24, mm = Math.floor(t % 60);
      ctx.font = `600 ${Math.max(22, r * 0.18)}px Georgia,serif`;
      ctx.fillText(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`, cx, cy - r * 0.42);
      ctx.font = "13px 'IBM Plex Mono',monospace";
      ctx.fillText(shift + " · TONIGHT", cx, cy - r * 0.24);
      // the strip: 23:30 to 02:40, a dot per beat
      const x0 = cx - r * 0.78, x1 = cx + r * 0.78, y = cy;
      const w0 = shift === "403" ? MIN("03:20") : MIN("23:30"), w1 = shift === "403" ? MIN("03:55") : MIN("02:40");
      const tx = (m) => x0 + (x1 - x0) * (Math.max(w0, Math.min(w1, m)) - w0) / (w1 - w0);
      ctx.strokeStyle = "#2a1a0c"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = "#c0392b"; ctx.fillRect(tx(t) - 1, y - 16, 2, 32);
      for (const b of B) {
        const s = MIN(b.start), e = MIN(b.end), x = tx((s + e) / 2);
        const done = caught.has(b.id), past = t > e, now = t >= s && t <= e;
        ctx.beginPath(); ctx.arc(x, y + (b.floor && !b.pt ? 0 : 0), 7, 0, 7);
        if (done) { ctx.fillStyle = "#2a1a0c"; ctx.fill(); }
        else if (past) { ctx.lineWidth = 1.5; ctx.strokeStyle = "#2a1a0c"; ctx.stroke(); }
        else { ctx.setLineDash([2, 3]); ctx.strokeStyle = now ? "#c0392b" : "rgba(42,26,12,.55)"; ctx.lineWidth = now ? 2.5 : 1.3; ctx.stroke(); ctx.setLineDash([]); }
        if (b.floor) { ctx.fillStyle = "#2a1a0c"; ctx.font = "11px 'IBM Plex Mono',monospace"; ctx.fillText("▾", x, y + 22); }
      }
      ctx.font = "13px 'IBM Plex Mono',monospace"; ctx.fillStyle = "#2a1a0c";
      ctx.fillText("● caught  ○ missed  ◌ to come  ▾ floor", cx, cy + r * 0.32);
      const next = B.find((b) => !caught.has(b.id) && t <= MIN(b.end));
      ctx.font = "italic 16px Georgia,serif";
      if (next) ctx.fillText(t >= MIN(next.start) ? "Something is happening now." : `Next: about ${next.start}.`, cx, cy + r * 0.5);
      if (gentle && next) ctx.fillText(next.floor ? "Try the gap." : next.id === "dot" || next.id === "sitting" ? "Look at what is pinned up." : "Look where her hands are.", cx, cy + r * 0.66);
      ctx.restore(); ctx.textAlign = "left";
    }

    // ---- loop
    let raf = 0, last = performance.now();
    function say(text) { note.textContent = text; note.style.opacity = 1; noteT = performance.now(); }
    function moveEye(dt) {
      const ox = mode === "gap" ? gapX : eye.x, oy = eye.y;
      if (mode === "gap") {
        const d = tgt.x - gapX, k = 1 - Math.exp(-dt / 0.12);
        gapX += Math.max(-1.2 * D * dt, Math.min(1.2 * D * dt, d * k));
        gapX = Math.max(260, Math.min(RW - 260, gapX));
      } else if (mode === "eye") {
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
      return speed < 0.05 * 3;
    }
    // a glance at the rose: stepping back inside half a second halves it
    function resolveLook() {
      if (!look || look.sitting) return;
      const since = performance.now() - look.t;
      if (mode !== "eye" && since < 500) { susp += 15; look = null; looksTaken++; flash = { t: performance.now(), good: true }; toastMsg("You stepped back in time. She saw only brass.", false); }
      else if (since > 900) {
        const full = mode === "eye";
        susp += full ? 30 : 15; look = null; looksTaken++;
        flash = { t: performance.now(), good: !full };
        if (full) toastMsg("She looked straight into the rose. Something in her face decides.", true);
      }
    }
    function catchBeats(nt, still, guest) {
      let ringP = 0;
      for (const b of B) {
        if (caught.has(b.id)) continue;
        const open = nt >= MIN(b.start) && nt <= MIN(b.end);
        let ok = false;
        if (open && still && speed < 0.8) {
          if (mode === "eye" && !blind && !look) { const p = b.pt(guest || {}); ok = Math.hypot(p.x - eye.x, p.y - eye.y) < D / 4 * (gentle ? 1.25 : 1); }
          if (mode === "gap" && b.floor) ok = Math.abs(b.floor().x - gapX) < (RW / 2.6 * 1.3) / 4;
        }
        prog[b.id] = ok ? (prog[b.id] || 0) + dt_ : Math.max(0, (prog[b.id] || 0) - dt_ * 2);
        if (prog[b.id] >= HOLD()) {
          caught.add(b.id); caughtKinds.push(b.kind); showCard(b.text);
          flash = { t: performance.now(), good: true, catch: true };
          if (caught.size === 1 && shift === "402") timers.push(setTimeout(() => { if (!over) say(NOTES.first); }, 900));
        }
        ringP = Math.max(ringP, Math.min(1, (prog[b.id] || 0) / HOLD()));
      }
      return ringP;
    }
    let dt_ = 0;
    const after = (ms, fn) => timers.push(setTimeout(() => { if (!over && !disposed) fn(); }, ms));
    const HOLDL = () => (gentle ? 1.6 : 2.4), ANSW = () => (gentle ? 5000 : 3000);
    // room 403, night four: the dot, The Sitting, Answering, the held page
    function stepMara(dt) {
      const now = performance.now();
      if (mp === "paint" || mp === "sitting" || mp === "page") game += dt / SPM;
      const nt = T();
      ffLabel = false;
      const still = moveEye(dt);
      const watching = mode === "eye" && !blind;
      const guest = poseAt(nt);
      let ring = 0;
      if (mp === "paint") {
        if (!said.has("watch") && nt >= MIN("03:27")) { said.add("watch"); unlock(watchBtn, ""); unlock(crouchBtn, ""); }
        if (watching && nt >= MIN("03:28")) darkWhilePainting = true;
        if (watching && guest) susp += dt * (guest.face === 1 ? 4 : 1); else susp -= dt * 1.5;
        susp = Math.max(0, susp);
        if (!said.has("turn") && nt >= MIN("03:33")) { said.add("turn"); say(M_NOTES.turn); if (watching) look = { t: now + 700 }; }
        resolveLook();
        if (!blind && susp >= 70) { blind = true; look = null; toastMsg("She hangs a towel over the brass rose.", true); }
        if (nt >= M_SIT) {
          if (blind) { finishMara(); return 0; }
          mp = "sitting"; look = null; say(M_NOTES.sit);
        }
      } else if (mp === "sitting") {
        if (watching && (caught.has("sitting") || nt >= M_SIT + 5)) {
          mp = "look"; look = { t: now + 700, sitting: true }; lookHold = 0;
          after(700, () => { if (mp === "look") say(M_NOTES.look); });
        } else if (nt >= M_GONE) { gone = "never"; mp = "end"; say(M_NOTES.never); after(3000, finishMara); }
      } else if (mp === "look") {
        if (mode !== "eye") {
          gone = "stepped"; look = null; mp = "end"; flash = { t: now, good: false }; say(M_NOTES.gone); after(3600, finishMara);
        } else if (now >= look.t) {
          lookHold += dt; ring = lookHold / HOLDL();
          if (lookHold >= HOLDL()) {
            sittingHeld = true; look = null; mp = "held"; caught.add("look"); caughtKinds.push("hands");
            showCard("She looks straight into the rose and does not look away. Two taps of the pencil on the desk.");
            flash = { t: now, good: true, catch: true }; say(M_NOTES.held);
            after(2600, () => { mp = "taps"; ans = { t0: 0, darks: 0, until: performance.now() + 16000 }; say(M_NOTES.taps); });
          }
        }
      } else if (mp === "taps") {
        if (ans.t0 && now - ans.t0 > ANSW() && ans.darks < 2) { ans.t0 = 0; ans.darks = 0; }
        if (now > ans.until && !ans.t0) { answered = "no"; mp = "end"; say(M_NOTES.no); after(3000, finishMara); }
      } else if (mp === "page") {
        M_PAGE.forEach((c, i) => {
          if (pageRead.has(i) || mp !== "page") return;
          const ok = mode === "eye" && still && speed < 0.8 && Math.abs(eye.x - c.x) < 120;
          pageProg[i] = ok ? pageProg[i] + dt : Math.max(0, pageProg[i] - dt * 2);
          ring = Math.max(ring, pageProg[i] / HOLD());
          if (pageProg[i] >= HOLD()) {
            pageRead.add(i); flash = { t: now, good: true, catch: pageRead.size === 3 };
            if (pageRead.size === 3) {
              caught.add("page"); caughtKinds.push("hands"); mp = "end";
              showCard("She holds a copied page to the rose, too near to take in at once: a column of dates, a column of sums, a column of initials.");
              after(2800, finishMara);
            } else toastMsg("✎ " + c.line, false);
          }
        });
        if (mp === "page" && nt >= MIN("23:58")) { mp = "end"; finishMara(); }
      }
      if (mp === "paint" || mp === "sitting") { dt_ = dt; ring = Math.max(ring, catchBeats(nt, still, guest)); }
      return Math.min(1, ring);
    }
    function finishMara() {
      if (over) return;
      over = true;
      const n = caught.size, dot = darkWhilePainting ? "filled in: the rose was dark while she painted" : "a hollow ring: the rose stayed lit while she painted";
      let outcome, text;
      if (blind) { outcome = "lose"; text = `She hung a towel over the rose before the paint was dry. Whatever tonight's picture was, it was not shown to you. ${n} of 5 in the log. Step back when she turns, and let the meter fall.`; }
      else if (gone === "stepped") { outcome = "lose"; text = `You stepped back, as the job taught you. Under the count she wrote “gone”, and turned the picture to the wall. Tonight's dot is ${dot}. Her pencil said “Don't stop.” Next time someone behind the glass asks you to stay, stay.`; }
      else if (gone) { outcome = "lose"; text = `She stood by the picture until ten to four and the rose stayed lit. She wrote “gone” under the count. Tonight's dot is ${dot}. Put your eye to the rose when she pins the picture up, and keep it there.`; }
      else if (answered === "yes" && pageRead.size === 3) { outcome = "win"; text = `She has known since night one: brass does not go dark by itself. Eleven visits, a dot for every night she painted, and tonight's is ${dot}. You were seen and did not step back; you answered; and she held Drost's page to the rose until you had all of it. ${n} of 5 in the log. For the first time something has come through the glass the other way.`; }
      else {
        outcome = "done";
        text = `You held under her look, and tonight's dot is ${dot}. ` + (answered === "no" ? "The pencil tapped twice and the rose did not answer. She did not ask again; the page she was copying stays on her desk." : `She held the page to the rose and you took in ${pageRead.size} of its three columns before her arm tired.`) + ` ${n} of 5 in the log.`;
      }
      api.store.set("best403", Math.max(api.store.get("best403", 0), n));
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      timers.push(setTimeout(() => api.end({ outcome, text }), 400));
    }
    function step(dt) {
      if (!started || over) return;
      if (shift === "403") return stepMara(dt);
      const t = T();
      const active = B.some((b) => !caught.has(b.id) && t >= MIN(b.start) - 3 && t <= MIN(b.end));
      const next = B.filter((b) => MIN(b.start) > t).map((b) => MIN(b.start))[0];
      const quiet = !active && next && next - t > 4 && t > MIN("00:20");
      ffLabel = quiet;
      game += dt * (quiet ? 18 : 1 / SPM);
      if (T() >= endMin) { finish(); return; }
      const nt = T();
      if (!said.has("near") && nt >= MIN("00:05")) { said.add("near"); say(NOTES.near); }
      if (!said.has("quiet") && nt >= MIN("00:24")) { said.add("quiet"); say(NOTES.quiet); }
      if (!said.has("knock") && nt >= MIN("02:14")) { said.add("knock"); say(NOTES.knock); unlock(crouchBtn, "The envelope lies on the carpet. The gap sees the floor."); }
      if (!said.has("watch") && nt >= MIN("23:53")) { said.add("watch"); unlock(watchBtn, "Your pocket watch: the night so far, and what is still to come. Raise it with Tab."); }
      if (!said.has("crouch") && nt >= MIN("23:48")) { said.add("crouch"); unlock(crouchBtn, "Crouch (C) to the gap under the valet door. She never feels it, but it sees only the floor."); }
      const still = moveEye(dt);
      const guest = nt >= MIN("23:37") ? poseAt(nt) : null;
      const watching = mode === "eye" && !blind;
      if (watching && guest && guest.pose !== "sleep") susp += dt * (guest.face === 2 ? 9 : guest.face === 1 ? 4 : 1);
      else susp -= dt * (mode === "watch" || mode === "back" ? 1.5 : 1);
      susp = Math.max(0, susp);
      glanceCD -= dt;
      if (look) resolveLook();
      else if (watching && susp >= 40 && glanceCD <= 0 && guest && guest.pose !== "sleep") {
        look = { t: performance.now() + 600 }; glanceCD = 14;
      }
      if (!blind && susp >= 70) {
        blind = true; look = null;
        toastMsg("She hangs a towel over the brass rose. Only the gap is left tonight.", true);
        unlock(crouchBtn, "");
      }
      dt_ = dt;
      return catchBeats(nt, still, guest);
    }
    let ringP = 0;
    function showCard(text) { toast.className = P + "toast"; toast.textContent = "✎ " + text; toast.style.opacity = 1; toastT = performance.now(); }
    function toastMsg(text, alarm) { toast.className = P + "toast" + (alarm ? " alarm" : ""); toast.textContent = text; toast.style.opacity = 1; toastT = performance.now(); }
    function unlock(btn, text) {
      if (!btn.hidden) return;
      btn.hidden = false; btn.classList.add("new");
      timers.push(setTimeout(() => btn.classList.remove("new"), 3800));
      if (text) say(text);
    }
    function render(now) {
      const t = T();
      paintScene(t);
      ctx.drawImage(door, 0, 0, W, H);
      const blur = speed > 0.8;
      if (mode === "eye") { drawLens(eye.x, eye.y, blur); drawCatchRing(ringP); }
      else if (mode === "gap") {
        const { sy, sh } = drawGap(blur);
        ctx.fillStyle = "rgba(42,26,12,.9)"; ctx.fillRect(W / 4, sy + sh + 12, W / 2, 6);
        if (ringP > 0) { ctx.fillStyle = COL.amber; ctx.fillRect(W / 4, sy + sh + 12, (W / 2) * ringP, 6); }
      } else {
        ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
        ctx.fillStyle = "#1a0f08"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        gl.addColorStop(0, "rgba(224,162,74,.35)"); gl.addColorStop(1, "rgba(0,0,0,.9)");
        ctx.fillStyle = gl; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
        if (mode === "back") {
          const lit = A["ui-rose-lit"];
          if (lit) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); ctx.drawImage(lit, cx - R, cy - R, 2 * R, 2 * R); ctx.restore(); }
          ctx.fillStyle = COL.amberL; ctx.font = "600 14px 'IBM Plex Mono',monospace"; ctx.textAlign = "center"; ctx.shadowColor = "#000"; ctx.shadowBlur = 6;
          ctx.fillText("STEPPED BACK", cx, cy + R * (lit ? 0.62 : -0.03)); ctx.font = "italic 16px Georgia,serif"; ctx.fillText("the rose lets its light through", cx, cy + R * (lit ? 0.62 : -0.03) + 20); ctx.textAlign = "left"; ctx.shadowBlur = 0;
        } else drawWatch(t);
      }
      // flourish: a gold or red bloom round the brass
      if (flash) {
        const k = Math.max(0, (now - flash.t) / 700);
        if (k >= 1) flash = null;
        else {
          ctx.save(); ctx.globalAlpha = (1 - k) * 0.9; ctx.lineWidth = 10 * (1 - k) + 2;
          ctx.strokeStyle = flash.good ? COL.amberL : "#d0402e";
          ctx.beginPath(); ctx.arc(cx, cy, R + 26 + (RM ? 0 : k * 30), 0, 7); ctx.stroke(); ctx.restore();
          // a catch: the art's closed ring shows through the brass for a moment
          if (flash.catch && A["ui-catch-ring-closed"] && mode === "eye") {
            const z = R / 170 * 240;
            ctx.save(); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(cx, cy, R * 1.2, 0, 7); ctx.arc(cx, cy, R, 0, 7, true); ctx.clip();
            ctx.drawImage(A["ui-catch-ring-closed"], cx - z, cy - z, 2 * z, 2 * z); ctx.restore();
          }
        }
      }
      // HUD: pocket watch time, her unease, and tonight's cards
      const hh = Math.floor(t / 60) % 24, mm = Math.floor(t % 60);
      const narrow = W < 600;
      const hy = 12;
      ctx.fillStyle = COL.amberL; ctx.font = "600 16px 'IBM Plex Mono',monospace";
      if (A["ui-watch-face"]) { ctx.drawImage(A["ui-watch-face"], 12, hy - 4, 30, 30); ctx.fillText(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}${ffLabel ? " · quiet hours" : ""}`, 48, hy + 16); }
      else ctx.fillText(`◷ ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}${ffLabel ? " · quiet hours" : ""}`, 16, hy + 16);
      const gw = narrow ? 150 : 210, gx = 16, gyy = hy + 40;
      ctx.font = "600 12px 'IBM Plex Mono',monospace"; ctx.fillStyle = COL.cream;
      const mood = blind ? "COVERED THE ROSE" : sittingHeld ? "SHE KNOWS YOU ARE HERE" : shift === "403" && mp !== "paint" ? "WAITING" : susp >= 40 ? "UNEASY" : susp >= 20 ? "RESTLESS" : shift === "403" ? "PAINTING" : "UNAWARE";
      ctx.fillText(`${shift} · ${mood}`, gx, gyy - 6);
      ctx.fillStyle = "rgba(11,9,7,.85)"; ctx.fillRect(gx, gyy, gw, 12);
      ctx.strokeStyle = COL.brass; ctx.lineWidth = 1; ctx.strokeRect(gx + 0.5, gyy + 0.5, gw - 1, 11);
      const wob = !RM && susp >= 40 ? Math.sin(now / 90) * 1.5 : 0;
      ctx.fillStyle = susp >= 70 ? COL.ev : susp >= 40 ? "#e0702a" : COL.brass;
      ctx.fillRect(gx + 2, gyy + 2 + wob * 0, Math.min(gw - 4, (gw - 4) * susp / 100), 8);
      for (const v of [40, 70]) { ctx.fillStyle = COL.cream; ctx.fillRect(gx + gw * v / 100, gyy - 2, 1.5, 16); }
      ctx.font = "12px 'IBM Plex Mono',monospace"; ctx.fillStyle = "rgba(239,230,207,.8)";
      ctx.fillText("40", gx + gw * 0.4 - 8, gyy + 28); ctx.fillText("70", gx + gw * 0.7 - 8, gyy + 28);
      const n = caught.size, by = H - (narrow ? 84 : 26);
      ctx.fillStyle = COL.amber; ctx.font = "600 13px 'IBM Plex Mono',monospace";
      ctx.fillText(`CAUGHT ${n} OF ${shift === "403" ? 5 : 6}`, 16, by - 60);
      for (let i = 0; i < n; i++) {
        ctx.save(); ctx.translate(30 + i * 16, by); ctx.rotate((-24 + i * 9) * Math.PI / 180);
        ctx.fillStyle = COL.cream; ctx.strokeStyle = "#6b5a3a"; ctx.fillRect(-16, -42, 32, 42); ctx.strokeRect(-16, -42, 32, 42);
        const ic = A[KIND_ICON[caughtKinds[i]]];
        if (ic) ctx.drawImage(ic, -15, -38, 30, 30);
        else { ctx.strokeStyle = "rgba(122,106,82,.7)"; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-10, -34 + k * 9); ctx.lineTo(10, -34 + k * 9); ctx.stroke(); } }
        ctx.restore();
      }
      const s = SU.find((x) => t >= MIN(x.from) && t < MIN(x.to));
      const warn = !!look && !look.sitting && mode === "eye";
      sub.classList.toggle("warn", warn);
      let line = warn ? "[she turns toward the brass rose: step back!]" : s ? s.text : "";
      if (shift === "403") {
        if (mp === "look") line = "[she is looking straight into the rose. She does not move]";
        else if (mp === "taps") line = "[two taps of a pencil on the desk]";
        else if (mp === "page") line = `[paper against the brass]  read ${pageRead.size} of 3`;
        else if (mp !== "paint" && mp !== "sitting") line = "";
      }
      if (sub.textContent !== line) sub.textContent = line;
      // Answering: two roses to darken, and the three seconds
      if (shift === "403" && mp === "taps" && ans) {
        const ay = cy + R + 44 + (narrow ? 34 : 30), dk = A["ui-rose-dark"];
        for (let i = 0; i < 2; i++) {
          const x = cx - 34 + i * 68;
          ctx.globalAlpha = i < ans.darks ? 1 : 0.6;
          if (dk) ctx.drawImage(dk, x - 22, ay - 22, 44, 44); else { ctx.fillStyle = COL.brass; ctx.beginPath(); ctx.arc(x, ay, 16, 0, 7); ctx.fill(); ctx.fillStyle = "#0a0806"; ctx.beginPath(); ctx.arc(x, ay, 6, 0, 7); ctx.fill(); }
          ctx.globalAlpha = 1;
          if (i < ans.darks) { ctx.strokeStyle = COL.amberL; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, ay, 25, 0, 7); ctx.stroke(); }
        }
        if (ans.t0) { const k = Math.max(0, 1 - (now - ans.t0) / ANSW()); ctx.fillStyle = "rgba(11,9,7,.8)"; ctx.fillRect(cx - 70, ay + 30, 140, 6); ctx.fillStyle = COL.amber; ctx.fillRect(cx - 70, ay + 30, 140 * k, 6); }
      }
      if (performance.now() - toastT > 4200) toast.style.opacity = 0;
      if (performance.now() - noteT > 6500) note.style.opacity = 0;
      if (mode === "eye" && pointerIn) { ctx.strokeStyle = "rgba(246,207,134,.6)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.stroke(); }
    }
    const loop = (now) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      const r = step(dt); if (r != null) ringP = r;
      render(now);
      raf = requestAnimationFrame(loop);
    };

    function finish() {
      if (over) return;
      if (shift === "403") { finishMara(); return; }
      over = true;
      const strip = BEATS.map((b) => (caught.has(b.id) ? "●" : "○")).join(" ");
      const n = caught.size;
      api.store.set("best", Math.max(api.store.get("best", 0), n));
      const outcome = blind ? "lose" : n >= 5 ? "win" : n >= 3 ? "done" : "lose";
      api.store.set("lossStreak", outcome === "lose" ? streak + 1 : 0);
      let text;
      if (blind) text = `She hung a towel over the rose; the rest of 402's night is terry cloth, and she will remember the dark behind the door. ${n} of 6 in the log. The night strip: ${strip}.`;
      else if (outcome === "win") text = `${n} of 6 lines in the log, and she never knew the rose was looking. The night strip: ${strip}. It never says what a hollow dot was.`;
      else if (outcome === "done") text = `${n} of 6 in the log: enough for Wren, not enough for you. The night strip: ${strip}. It never says what a hollow dot was.`;
      else text = `She was home three hours and the log has ${n} line${n === 1 ? "" : "s"}. The night strip: ${strip}. Hold the eye still where her hands are, and use the gap when she stares.`;
      timers.push(setTimeout(() => api.end({ outcome, text }), 400));
    }

    // ---- input
    let pointerIn = false, px = 0, py = 0, touchLast = null;
    const setMode = (m) => {
      if (over || !started) return;
      const prev = mode;
      mode = mode === m ? "eye" : m;
      if (shift === "403" && mp === "taps" && ans) {
        const now = performance.now();
        if (mode === "back" && prev === "eye" && !ans.t0) ans.t0 = now;
        else if (mode === "eye" && prev === "back" && ans.t0 && now - ans.t0 <= ANSW()) {
          ans.darks++; flash = { t: now, good: true };
          if (ans.darks >= 2) {
            answered = "yes"; mp = "answered"; say(M_NOTES.yes);
            after(2800, () => { mp = "page"; game = MIN("23:40") - startMin; eye.x = tgt.x = 640; eye.y = tgt.y = 470; say(M_NOTES.page); });
          }
        }
      }
      if (mode === "gap") { gapX = eye.x; tgt.x = eye.x; }
      if (mode === "eye") { tgt.x = eye.x; tgt.y = eye.y; }
      backBtn.classList.toggle("on", mode === "back");
      crouchBtn.classList.toggle("on", mode === "gap");
      watchBtn.classList.toggle("on", mode === "watch");
    };
    on(backBtn, "click", () => setMode("back"));
    on(crouchBtn, "click", () => setMode("gap"));
    on(watchBtn, "click", () => setMode("watch"));
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
    on(cv, "pointerdown", (e) => { const r = cv.getBoundingClientRect(); touchLast = { x: e.clientX - r.left, y: e.clientY - r.top }; if (e.pointerType !== "mouse") cv.setPointerCapture(e.pointerId); if (mode === "watch" || mode === "back") setMode("eye"); });
    const endTouch = () => { touchLast = null; };
    on(cv, "pointerup", endTouch); on(cv, "pointercancel", endTouch);
    on(cv, "pointerleave", () => { pointerIn = false; });
    const keys = new Set();
    on(window, "keydown", (e) => {
      if (!started || over) return;
      const k = e.key;
      if (k === "Escape" || k === "b" || k === "B") { e.preventDefault(); setMode("back"); }
      else if ((k === "c" || k === "C") && !crouchBtn.hidden) setMode("gap");
      else if ((k === "Tab" || k === "w" || k === "W") && !watchBtn.hidden) { e.preventDefault(); setMode("watch"); }
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
    const plate = (i) => (art.has("ui-number-plates") ? `<i style="background-image:url(${art.url("ui-number-plates")});background-position:${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%"></i>` : "");
    intro.innerHTML = `<div class="${P}lens">
      ${art.has("title-lettering") ? `<img class="ttl" alt="Behind the Peephole" src="${art.url("title-lettering")}">` : ""}
      <h2>The eye at the hole</h2>
      <p class="goal">Catch what the guest does tonight without being felt. Choose a door.</p>
      <div class="${P}keys">
        <b>LOOK</b><span>mouse, drag, or arrow keys</span>
        <b>CATCH</b><span>hold still on a thing, inside the dotted ring</span>
        <b>STEP BACK</b><span>Esc, when she turns to the rose</span>
      </div>
      ${streak >= 2 ? `<label><input type="checkbox" ${gentle ? "checked" : ""}> a steadier hand (quicker catches, a hint on the watch)</label>` : ""}
      <div class="${P}doors">
        <button type="button" class="${P}b" data-door="402">${plate(1)}NIGHT ONE<small>catch five of six</small></button>
        <button type="button" class="${P}b" data-door="403">${plate(2)}NIGHT FOUR<small>The Sitting</small></button>
      </div></div>`;
    if (art.has("chapter-n1")) { intro.classList.add("ch"); intro.style.backgroundImage = `radial-gradient(circle at 50% 50%,rgba(40,26,12,.55),rgba(5,4,3,.9) 75%),url(${art.url("chapter-n1")})`; }
    wrap.appendChild(intro);
    const gbox = intro.querySelector("input");
    if (gbox) on(gbox, "change", () => { gentle = gbox.checked; api.store.set("gentle", gentle); });
    const sb = intro.querySelector('[data-door="402"]');
    function begin(door) {
      intro.remove(); shift = door; started = true; last = performance.now();
      if (door === "403") {
        B = M_BEATS; PO = M_POSES; SU = M_SUBS; startMin = M_START; endMin = Infinity;
        eye.x = tgt.x = 760; eye.y = tgt.y = 520; buildPage(); resize();
        note.textContent = M_NOTES.open; note.style.opacity = 1; noteT = performance.now();
        after(5200, () => { if (mp === "paint") say(M_NOTES.go); });
      } else { say(NOTES.open); after(5200, () => { if (caught.size === 0) say("The keycard is at her lock. Find her hands."); }); }
    }
    on(sb, "click", () => begin("402"));
    on(intro.querySelector('[data-door="403"]'), "click", () => begin("403"));
    on(intro, "pointermove", (e) => { const b = e.target.closest("[data-door]"); if (!b || !art.has("chapter-n4")) return; const id = b.dataset.door === "403" ? "chapter-n4" : "chapter-n1"; if (intro.dataset.ch !== id) { intro.dataset.ch = id; intro.style.backgroundImage = `radial-gradient(circle at 50% 50%,rgba(40,26,12,.55),rgba(5,4,3,.9) 75%),url(${art.url(id)})`; } });
    raf = requestAnimationFrame(loop);
    sb.focus();

    return {
      unmount() {
        disposed = true;
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

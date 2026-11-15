// The Stuffed Ones: Stuffing (1D, allocation), drawn as a dressmaker's tissue pattern.
//
// DESIGN.md section 11 "Stuffing" and section 12 "Memory tokens" / "Hunger". One packing on the
// second night, before Scent and Proximity: your body laid open as six pattern pieces with slot
// hollows, memory tokens in a tray. Pack tokens into slots; an empty slot is warm (+15 percent
// hunger each). Tonight's two games (Scent needs a warm Chest slot, Proximity a warm Arm slot) may
// be joined or held. Close plays the night: tray tokens unravel, each joined game takes one memory
// from its seam, each lurch takes two from the warmest seam, and a cost with nothing to take moves
// on Head, Chest, Arms, Legs. The bound slot never pays. No failure: the result is a win or "done".
//
// Actions: Pack (drag, or tap a token then a hollow; arrows and Enter). Bind (once, B): spread 2's
// gold thread on the slot you choose. Join or Hold each game. Close the seams. A mid-packing twist
// from Ruth's evening round (section 6): she pulls one seam tighter by hand, closing a slot. The
// result counts as a win when five or more are kept (the Warning's need), at least one memory of
// each friend survives, and no lurch comes. Narrative lines are written for the game (refine
// additions list); token names are the design's (section 12).
//
// Phase 1 (DESIGN.md "Accepted development", 2026-11-15). Borrowed patches: after the second
// packing four patches come down the pulse in the friends' own thread, Dani's secret always among
// them. Packed, one costs a hollow, slows the pack's hunger (by dawn -6 each) and keeps that friend
// one line of voice; it is not yours, so it is never counted as kept and never pays a cost. Left in
// the tray it goes back up the pulse. Wadding: plain fill for a hollow; a wadded slot is cold, keeps
// nothing and plays no game, and a body packed with nothing but wadding is the Empty Toy, chosen by
// hand. The patches are the game's art (api.art); the lettered discs stay as the fallback.
import { artKit, PATCH, FACE } from "./art-kit.js";
const PRE = "stuffed-ones-stuffing-";
const C = { cedar: "#6b4a32", cedarD: "#4a3222", dust: "#e6dcc6", moss: "#7d8a5a", rust: "#a5553a", sky: "#8fa9bf",
  cream: "#efe5cf", bone: "#f6f1e4", amber: "#e39a2d", red: "#b8322a", ink: "#2a211b", gold: "#c9a227", rose: "#c07a8e", green: "#4f6b2c" };

// Token names are the design's memory tokens (section 12); colour by whose memory it is. The second
// field of each is a recollection written for the game.
const TOKENS = [
  ["My name", "you", "Your own hand in the guestbook, under all the other names.", "patch-my-name"],
  ["The drive up", "you", "The forest road, four voices over the radio.", "patch-drive-up"],
  ["My hands", "you", "The feel of a needle that was the right size for you.", "patch-my-hands"],
  ["The door", "you", "The bedroom door on the first night, and twenty seconds of not going in.", "patch-the-door"],
  ["Jamie's question", "jamie", "At breakfast, the one who asked first.", "patch-jamie-question"],
  ["Jamie's bad postcard", "jamie", "Deliberately terrible, as every trip since you were nine.", "patch-jamie-postcard"],
  ["Jamie's narration", "jamie", "A nature film about a hiker, until the birds did not answer.", "patch-jamie-narration"],
  ["Lila's hum", "lila", "Three notes, the same three, whenever she was nervous.", "patch-lila-hum"],
  ["Lila's mushroom photo", "lila", "Crouched by the creek, so pleased with a small brown cap.", "patch-lila-mushroom"],
  ["Marcus's strap", "marcus", "The strap you mended at the table. It held.", "patch-marcus-strap"],
  ["Marcus's paper map", "marcus", "Folded wrong, always, and always right about the way back.", "patch-marcus-map"],
  ["The chili", "dani", "Camp-stove chili, though the cabin had a kitchen.", "patch-chili"],
  ["Dani names the toys", "dani", "She stood at the shelves and gave them names.", "patch-dani-names"],
];
// Borrowed patches: a friend's memory in the friend's thread. The names are the patches' own; the
// recollections are written for the game. Dani's secret always comes; the others bring one of two.
const BORROWED = {
  dani: [["Dani moved Gerald.", "Night one. She put the bear she had named on Marcus's pillow, for a joke. She thinks she began it. This is not your memory.", "patch-borrowed-dani-gerald"]],
  jamie: [["The rare hiker", "His own voice, narrating himself up a hill, pleased with it.", "patch-borrowed-jamie-hiker"], ["Since we were nine", "A fence, two bikes, one summer. He remembers you smaller than you remember yourself.", "patch-borrowed-jamie-nine"]],
  lila: [["Two years, one flat", "A hallway with two coats on one hook. She remembers which stair creaked.", "patch-borrowed-lila-flat"], ["Don't laugh.", "The lock on her door, and telling you why. She remembers that you didn't.", "patch-borrowed-lila-laugh"]],
  marcus: [["The compass", "Brass, scratched, older than he is. He remembers it pointing somewhere.", "patch-borrowed-marcus-compass"], ["Your stitches held", "A broken crib, a jump, the strap taking his weight.", "patch-borrowed-marcus-held"]],
};
// The one line of voice a kept friend keeps (DESIGN.md section 6, their added lines).
const VOICE = { jamie: "“And here, the rare hiker, in his natural habitat.”", lila: "“I lock it so I don't go wandering. Don't laugh.”",
  marcus: "“There's always a way out. You just haven't drawn it yet.”", dani: "“I'm glad I came. Don't make it weird.”" };
const MEDAL = { you: "medallion-narrator", jamie: "medallion-jamie", lila: "medallion-lila", marcus: "medallion-marcus", dani: "medallion-dani" };
const SHEET = { you: "pattern-narrator", jamie: "pattern-jamie", lila: "pattern-lila", marcus: "pattern-marcus", dani: "pattern-dani" };
const BORROW_AFTER = 2, BORROW_EASE = 6;
const WHO = { you: [C.cream, "Y", "You"], jamie: [C.sky, "J", "Jamie"], lila: [C.rose, "L", "Lila"], marcus: [C.moss, "M", "Marcus"], dani: [C.amber, "D", "Dani"] };
const FRIENDS = ["jamie", "lila", "marcus", "dani"];

// Pattern pieces in a 690 x 410 pattern space. Cost order: Head, Chest, Arms, Legs.
const SEAMS = [
  { id: "head", name: "HEAD", seam: 1, pts: [[160, 62], [172, 22], [208, 48], [252, 48], [288, 22], [300, 62], [306, 118], [272, 160], [188, 160], [154, 118]], slots: [[205, 108], [255, 108]], grain: [[230, 70], [230, 150]] },
  { id: "chest", name: "CHEST", seam: 2, pts: [[150, 188], [310, 188], [332, 258], [322, 382], [138, 382], [128, 258]], slots: [[180, 300], [230, 300], [280, 300]], grain: [[230, 205], [230, 370]] },
  { id: "larm", name: "LEFT ARM", seam: 3, pts: [[28, 178], [96, 168], [112, 262], [102, 392], [44, 398], [22, 282]], slots: [[66, 252], [66, 332]], grain: [[48, 200], [48, 380]] },
  { id: "rarm", name: "RIGHT ARM", seam: 4, pts: [[358, 178], [426, 168], [442, 262], [432, 392], [374, 398], [352, 282]], slots: [[396, 252], [396, 332]], grain: [[378, 200], [378, 380]] },
  { id: "lleg", name: "LEFT LEG", seam: 5, pts: [[478, 58], [562, 58], [566, 180], [578, 302], [468, 302], [474, 180]], slots: [[520, 140], [520, 232]], grain: [[492, 75], [492, 290]] },
  { id: "rleg", name: "RIGHT LEG", seam: 6, pts: [[590, 58], [672, 58], [674, 180], [680, 302], [584, 302], [586, 180]], slots: [[630, 182]], grain: [[606, 75], [606, 290]] },
];
const GAMES = [
  { id: "scent", name: "Scent", needs: ["chest"], needName: "the CHEST" },
  { id: "proximity", name: "Proximity", needs: ["larm", "rarm"], needName: "an ARM" },
];
const RUTH_AFTER = 4; // tokens packed before Ruth's round

function kit() {
  const offs = [], timers = new Set(); let raf = 0;
  return {
    on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; },
    frame(fn) { cancelAnimationFrame(raf); raf = requestAnimationFrame(fn); },
    dispose() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); offs.forEach((f) => f()); },
  };
}

export default {
  mount(root, api) {
    const K = kit();
    const A = artKit(api), rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = PRE + "wrap";
    const tissue = `background-color:rgba(239,229,207,.94);background-image:repeating-linear-gradient(115deg,rgba(120,90,60,.07) 0 1px,transparent 1px 22px),repeating-linear-gradient(25deg,rgba(255,255,255,.25) 0 1px,transparent 1px 31px)`;
    wrap.innerHTML = `<style>
.${PRE}wrap{position:absolute;inset:0;background:#5a3f2b;color:${C.ink};font-family:Karla,Arial,sans-serif;overflow:hidden;touch-action:none;outline:none}
.${PRE}wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.${PRE}panel{position:absolute;${tissue};border:1px solid ${C.ink};box-shadow:3px 4px 0 rgba(0,0,0,.25);font-size:14px;line-height:1.35;box-sizing:border-box;display:flex;flex-direction:column}
.${PRE}scroll{overflow:auto;padding:10px 12px 4px;flex:1}
.${PRE}panel h3{margin:0 0 4px;font:700 13px Karla,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.${PRE}panel .${PRE}rate{font:400 30px 'IM Fell English',Georgia,serif;color:${C.red};line-height:1}
.${PRE}panel .${PRE}row{display:flex;align-items:center;gap:8px;margin:5px 0;flex-wrap:wrap}
.${PRE}panel button{font:600 14px Karla,Arial,sans-serif;border:1.5px dashed ${C.ink};background:${C.bone};color:${C.ink};padding:5px 12px;cursor:pointer;min-height:38px}
.${PRE}panel button:hover:not(:disabled){background:#fff}
.${PRE}panel button[aria-pressed=true]{background:${C.ink};color:${C.bone};border-style:solid}
.${PRE}panel button:disabled{opacity:.45;cursor:not-allowed}
.${PRE}panel button.${PRE}bind{border-color:${C.gold};color:#6b5410;border-width:2px}
.${PRE}panel button.${PRE}bind[aria-pressed=true]{background:${C.gold};color:${C.ink}}
.${PRE}close{background:${C.red}!important;color:${C.bone}!important;border:0!important;margin:0 12px 10px;font-size:15px!important;min-height:44px!important}
.${PRE}panel small{font-size:13px;opacity:.85}
.${PRE}checks{list-style:none;margin:4px 0 0;padding:0}
.${PRE}checks li{display:flex;gap:6px;align-items:baseline;font-size:14px;margin:2px 0}
.${PRE}checks li b{width:16px;text-align:center}
.${PRE}beat{position:absolute;left:50%;transform:translateX(-50%);top:14px;width:min(460px,calc(100% - 32px));box-sizing:border-box;${tissue};border:1.5px dashed ${C.ink};padding:12px 16px 12px 40px;font:15px/1.45 Karla,Arial,sans-serif;z-index:3;transition:opacity .5s;pointer-events:none;box-shadow:3px 4px 0 rgba(0,0,0,.25)}
.${PRE}beat::before{content:"✂";position:absolute;left:12px;top:10px;font-size:18px}
.${PRE}beat b{font:400 18px 'IM Fell English',Georgia,serif;display:block}
.${PRE}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,33,27,.55);z-index:5;padding:16px;overflow:auto}
.${PRE}card{width:min(470px,100%);box-sizing:border-box;${tissue};clip-path:polygon(0 3%,4% 0,96% 0,100% 4%,100% 96%,95% 100%,5% 100%,0 97%);padding:26px 26px 22px;position:relative}
.${PRE}card::before{content:"";position:absolute;inset:10px;border:1.5px dashed ${C.ink};pointer-events:none}
.${PRE}card::after{content:"CUT 1 · INSTRUCTIONS";position:absolute;right:22px;top:16px;font:700 11px Karla,Arial,sans-serif;letter-spacing:.14em;opacity:.7}
.${PRE}card h2{margin:6px 0 4px;font:400 34px 'IM Fell English',Georgia,serif}
.${PRE}card .${PRE}goal{margin:0 0 12px;font:15px/1.45 Karla,Arial,sans-serif}
.${PRE}legend div{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;font:15px Karla,Arial,sans-serif;padding:4px 0}
.${PRE}legend i{width:22px;height:22px;border-radius:50%;display:block;border:1.5px dashed ${C.ink}}
.${PRE}legend kbd{font:600 12px ui-monospace,Menlo,monospace;border:1px dashed ${C.ink};padding:1px 6px;background:${C.bone}}
.${PRE}card button{font:600 16px Karla,Arial,sans-serif;background:${C.red};color:${C.bone};border:0;padding:11px 24px;cursor:pointer;margin-top:14px;min-height:46px;position:relative;z-index:1}
.${PRE}card button:focus-visible{outline:3px solid ${C.ink};outline-offset:2px}
.${PRE}log{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,calc(100% - 32px));box-sizing:border-box;${tissue};border:1.5px dashed ${C.ink};padding:16px 20px;font-size:15px;line-height:1.5;z-index:4;max-height:72%;overflow:auto}
.${PRE}log p{margin:0 0 5px}
.${PRE}log p.${PRE}cost{color:${C.red}}
.${PRE}card canvas,.${PRE}panel canvas{position:static;width:auto;height:auto}
.${PRE}card .${PRE}plate{margin:0 0 6px;border:1px dashed ${C.ink}}
</style><canvas aria-label="Your body laid open as a sewing pattern, with memory tokens in a tray"></canvas>
<div class="${PRE}panel" aria-live="polite"><div class="${PRE}scroll"></div><button type="button" class="${PRE}close">Close the seams</button></div>
<div class="${PRE}beat" aria-live="polite" style="opacity:0"></div>`;
    root.appendChild(wrap);
    const cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
    const panel = wrap.querySelector("." + PRE + "panel"), scroll = panel.querySelector("." + PRE + "scroll"), closeBtn = panel.querySelector("." + PRE + "close");
    const beatEl = wrap.querySelector("." + PRE + "beat");

    // state
    const tokens = TOKENS.map(([name, who, line, art], i) => ({ i, name, who, line, art, kind: "mine", slot: null, lost: false, fade: 0 }));
    const slots = [];
    SEAMS.forEach((s, si) => s.slots.forEach((p, k) => slots.push({ seam: si, k, x: p[0], y: p[1], bound: false, closed: false, token: null, wad: false })));
    const wad = { tx: 0, ty: 0, r: 20 };
    let borrowedCame = false, wadSaid = false;
    const join = { scent: true, proximity: true };
    let kbUsed = false, started = false, closing = false, dragging = null, hover = null, cursor = 0, held = null, binding = false, bindUsed = false;
    let ruthDone = false, packedEver = 0;
    const pops = [], seenLine = new Set();
    let L = null, beatTimer = 0;

    const joinPic = A.picture("ui-join-hold", 220, { alt: "Join or Hold" });
    if (joinPic) joinPic.style.margin = "0 0 6px";
    function beat(title, text, ms = 4500) {
      beatEl.innerHTML = ""; const b = document.createElement("b"); b.textContent = title; beatEl.append(b, document.createTextNode(text));
      beatEl.style.opacity = 1; clearTimeout(beatTimer); beatTimer = K.after(ms, () => (beatEl.style.opacity = 0));
    }
    function pop(text, x, y, col) { pops.push({ text, x, y, col, t0: performance.now() }); }

    function layout() {
      const W = wrap.clientWidth, H = wrap.clientHeight;
      const wide = W >= 760;
      let pat, tray, pan;
      if (wide) {
        const pw = Math.min(330, Math.max(260, W * 0.28));
        const nTray = tokens.filter((t) => t.slot === null && !t.lost).length + 1;
        const th = 52 + Math.ceil(nTray / Math.max(3, Math.floor((W - 44) / 96))) * 88;
        pan = { x: W - pw - 14, y: 14, w: pw, h: H - th - 34 };
        tray = { x: 14, y: H - th - 12, w: W - 28, h: th };
        pat = { x: 14, y: 14, w: W - pw - 42, h: H - th - 40 };
      } else {
        const per = Math.max(4, Math.floor((W - 28) / 64));
        const th = 34 + Math.ceil((tokens.filter((t) => t.slot === null && !t.lost).length + 1) / per) * 74;
        const patH = Math.min((W - 8) * 410 / 690 + 16, H * 0.4);
        tray = { x: 10, y: H - th - 8, w: W - 20, h: th };
        pat = { x: 4, y: 4, w: W - 8, h: patH };
        pan = { x: 10, y: patH + 10, w: W - 20, h: tray.y - patH - 18 };
      }
      const s = Math.max(0.2, Math.min(pat.w / 690, pat.h / 410));
      const ox = pat.x + (pat.w - 690 * s) / 2 + 5 * s, oy = pat.y + (pat.h - 410 * s) / 2 - 10 * s;
      L = { W, H, wide, pat, tray, pan, s, ox, oy };
      beatEl.style.top = (wide ? 14 : pan.y) + "px";
      panel.style.left = pan.x + "px"; panel.style.top = pan.y + "px"; panel.style.width = pan.w + "px"; panel.style.height = pan.h + "px";
      const per = wide ? Math.max(3, Math.floor((tray.w - 16) / 96)) : Math.max(4, Math.floor((W - 28) / 64));
      let n = 0;
      const rr = wide ? 26 : 19;
      const seat = (t) => {
        const row = Math.floor(n / per), col = n % per;
        t.tx = tray.x + 16 + col * ((tray.w - 32) / per) + (tray.w - 32) / per / 2;
        t.ty = tray.y + (wide ? 58 : 46) + row * (wide ? 88 : 74);
        t.r = rr;
        n++;
      };
      tokens.forEach((t) => { if (t.slot === null && !t.lost) seat(t); });
      seat(wad);
      slots.forEach((sl) => { sl.sx = L.ox + sl.x * s; sl.sy = L.oy + sl.y * s; sl.r = Math.max(15, 19 * s); });
      tokens.forEach((t) => { if (t.slot !== null) { const sl = slots[t.slot]; t.tx = sl.sx; t.ty = sl.sy; t.r = sl.r - 2; } });
    }

    // ---- the night, worked out from the packing --------------------------------------------
    const open = (sl) => !sl.closed && sl.token === null && !sl.wad;
    function warmIn(si) { return slots.filter((s) => s.seam === si && open(s)).length; }
    function canPlay(game) { return game.needs.some((id) => warmIn(SEAMS.findIndex((s) => s.id === id)) > 0); }
    function simulate() {
      const fill = slots.map((s) => s.token);
      const events = [];
      tokens.filter((t) => t.slot === null && !t.lost).forEach((t) => events.push(t.kind === "borrowed"
        ? { kind: "back", token: t.i, text: `${t.name} goes back up the pulse to ${WHO[t.who][2]}. It was never yours to keep.` }
        : { kind: "tray", token: t.i, text: `${t.name} is left in the tray. It unravels.` }));
      const live = slots.filter((s) => !s.closed);
      const emptyToy = live.length > 0 && live.every((s) => s.wad);
      const lent = fill.filter((x) => x !== null && tokens[x].kind === "borrowed").map((x) => tokens[x]);
      const w = slots.filter(open).length;
      function take(si, why) {
        for (let step = 0; step < SEAMS.length; step++) {
          const sj = (si + step) % SEAMS.length;
          const idx = slots.findIndex((s, k) => s.seam === sj && !s.bound && fill[k] !== null && tokens[fill[k]].kind === "mine");
          if (idx >= 0) {
            const tk = fill[idx]; fill[idx] = null;
            events.push({ kind: "cost", token: tk, text: `${why}: ${tokens[tk].name} goes from the ${SEAMS[sj].name.toLowerCase()}${step ? " (its own seam had nothing to give)" : ""}.` });
            return;
          }
        }
        events.push({ kind: "none", text: `${why}: nothing left to take.` });
      }
      let joined = 0;
      GAMES.forEach((gm) => {
        if (join[gm.id] && canPlay(gm)) {
          joined++;
          let best = -1, bw = -1;
          gm.needs.forEach((id) => { const si = SEAMS.findIndex((s) => s.id === id); if (warmIn(si) > bw) { bw = warmIn(si); best = si; } });
          take(best, `${gm.name}, joined`);
        } else events.push({ kind: "hold", text: `${gm.name}: you hold. The hunger is not fed.` });
      });
      const hunger = 64 + 40 * (1 + 0.15 * w) - 18 * joined - BORROW_EASE * lent.length;
      const lurches = !emptyToy && hunger >= 100 ? 1 + Math.floor((hunger - 100) / 40) : 0;
      let warmest = 0, ww = -1;
      SEAMS.forEach((s, si) => { if (warmIn(si) > ww) { ww = warmIn(si); warmest = si; } });
      for (let k = 0; k < lurches; k++) { take(warmest, `Lurch at 100, the ${SEAMS[warmest].name.toLowerCase()} jerks`); take(warmest, "The same lurch"); }
      const keptIdx = fill.filter((x) => x !== null && tokens[x].kind === "mine");
      const friends = FRIENDS.map((f) => [f, keptIdx.some((i) => tokens[i].who === f)]);
      const kept = keptIdx.length;
      const ok = kept >= 5 && friends.every((x) => x[1]) && lurches === 0;
      return { w, joined, hunger: Math.round(hunger), lurches, warmest, events, kept, fill, friends, ok, lent, emptyToy };
    }

    function renderPanel() {
      const r = simulate();
      const gameRows = GAMES.map((gm) => {
        const ok = canPlay(gm);
        return `<div class="${PRE}row"><b style="min-width:80px">${gm.name}</b>
          <button type="button" data-g="${gm.id}" data-v="1" aria-pressed="${!!join[gm.id] && ok}" ${ok ? "" : "disabled"}>Join</button>
          <button type="button" data-g="${gm.id}" data-v="0" aria-pressed="${!join[gm.id] || !ok}">Hold</button>
          <small>${ok ? `warm slot in ${gm.needName}` : `needs a warm slot in ${gm.needName}`}</small></div>`;
      }).join("");
      const mark = (b) => `<b style="color:${b ? C.green : C.red}">${b ? "✓" : "✗"}</b>`;
      const sel = held !== null ? `<div class="${PRE}row"><small>Holding <b>${held === "wad" ? "wadding" : tokens[held].name}</b>: tap a hollow.</small></div>` : binding ? `<div class="${PRE}row"><small><b style="color:#6b5410">Tap a slot to bind it in gold.</b></small></div>` : "";
      scroll.innerHTML = `<h3>Tonight: Scent, then Proximity</h3>${gameRows}
        <div class="${PRE}row" style="justify-content:space-between;align-items:flex-end"><div><h3 style="margin:6px 0 0">Hunger rate</h3><span class="${PRE}rate">+${r.w * 15}%</span> <small>${r.w} warm</small></div>
        <div style="text-align:right"><small>by dawn</small><br><b style="font-size:20px;color:${r.hunger >= 100 ? C.red : C.ink}">${r.hunger}</b> <small>/ 100</small></div></div>
        <ul class="${PRE}checks">
          <li>${mark(r.kept >= 5)}<span>Kept by morning: <b>${r.kept}</b> of ${TOKENS.length} (the Warning needs 5)</span></li>
          ${borrowedCame ? `<li><b style="color:${C.cedar}">+</b><span>Borrowed, packed: <b>${r.lent.length}</b>${r.lent.length ? ` (${r.lent.map((t) => WHO[t.who][2]).join(", ")}: hunger −${BORROW_EASE * r.lent.length}, a line of voice each)` : ". Each costs a hollow and slows the pack's hunger."}</span></li>` : ""}
          ${r.emptyToy ? `<li><b style="color:${C.red}">○</b><span><b>Nothing but wadding.</b> Close now and you have packed yourself with nothing.</span></li>` : ""}
          <li>${mark(r.friends.every((x) => x[1]))}<span>A memory of each friend: ${r.friends.map(([f, k]) => `<span style="color:${k ? C.ink : C.red};${k ? "" : "text-decoration:line-through"}">${WHO[f][2]}</span>`).join(" · ")}</span></li>
          <li>${mark(!r.lurches)}<span>${r.lurches ? `${r.lurches} lurch${r.lurches > 1 ? "es" : ""}: two memories each from the ${SEAMS[r.warmest].name.toLowerCase()}` : "No lurch tonight"}</span></li>
        </ul>
        <div class="${PRE}row" style="margin-top:8px"><button type="button" class="${PRE}bind" aria-pressed="${binding}" ${bindUsed ? "disabled" : ""}>${bindUsed ? "Gold thread used" : "Bind a slot (B)"}</button><small>${bindUsed ? "the bound slot never pays" : "once: that slot never pays"}</small></div>${sel}`;
      if (joinPic) scroll.prepend(joinPic);
      scroll.querySelectorAll("button[data-g]").forEach((b) => b.addEventListener("click", () => { join[b.dataset.g] = b.dataset.v === "1"; renderPanel(); }));
      scroll.querySelector("." + PRE + "bind").addEventListener("click", () => { if (!bindUsed && started && !closing) { binding = !binding; held = null; renderPanel(); } });
      closeBtn.disabled = closing || !started;
    }

    // ---- drawing --------------------------------------------------------------------------
    function smooth(pts) {
      g.beginPath();
      const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      let m = mid(pts[n - 1], pts[0]);
      g.moveTo(m[0], m[1]);
      for (let i = 0; i < n; i++) { const p = pts[i], q = mid(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
      g.closePath();
    }
    function inset(pts, d) {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      return pts.map((p) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] - dx / l * d, p[1] - dy / l * d]; });
    }
    function arrow(x1, y1, x2, y2) {
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      [[x1, y1, 1], [x2, y2, -1]].forEach(([x, y, d]) => { g.beginPath(); g.moveTo(x - 4, y + 7 * d); g.lineTo(x, y); g.lineTo(x + 4, y + 7 * d); g.stroke(); });
    }
    function drawToken(t, x, y, r, alpha = 1) {
      const [col, letter] = WHO[t.who];
      g.save(); g.globalAlpha = alpha;
      if (t.art) {
        const d = Math.round(r * 2);
        if (A.draw(g, t.art, x - r, y - r, d, d, PATCH)) {
          g.strokeStyle = col; g.lineWidth = 2; if (t.kind === "borrowed") g.setLineDash([4, 3]);
          g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.stroke(); g.setLineDash([]);
          g.restore(); return;
        }
      }
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.arc(x + 1.5, y + 2, r, 0, 7); g.fill();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.strokeStyle = C.bone; g.lineWidth = 1.4; g.setLineDash([2.5, 2]); g.beginPath(); g.arc(x, y, r - 3.5, 0, 7); g.stroke(); g.setLineDash([]);
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
      g.fillStyle = C.ink; g.font = `italic ${Math.round(r * 0.95)}px 'IM Fell English',Georgia,serif`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(letter, x, y + 1);
      g.restore();
    }
    // wadding: plain fill, a pale tuft with nothing stitched on it
    function drawWad(x, y, r, cold) {
      g.save();
      g.fillStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.arc(x + 1.5, y + 2, r, 0, 7); g.fill();
      g.fillStyle = "#f3efe6";
      for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.6, 0, 7); g.fill(); }
      g.strokeStyle = "rgba(42,33,27,.35)"; g.lineWidth = 1;
      for (let k = 0; k < 5; k++) { const a = k * 1.3 + 0.4; g.beginPath(); g.arc(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.5, a, a + 1.6); g.stroke(); }
      if (cold) { g.fillStyle = C.sky; g.font = "700 11px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#4c6276"; g.fillText("COLD", x, y + 1); }
      g.restore();
    }
    function label(text, x, y, max, size) {
      g.font = `${size}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "top";
      const words = text.split(" "); let line = "", yy = y;
      for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, yy); line = w; yy += size + 1; } else line = t; }
      g.fillText(line, x, yy);
    }

    function draw(now) {
      if (!L) layout();
      const { W, H, s, ox, oy, tray, wide } = L;
      const dpr = Math.min(2, devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#5a3f2b"; g.fillRect(0, 0, W, H);
      g.globalAlpha = 0.08; g.fillStyle = "#000";
      for (let y = 0; y < H; y += 7) g.fillRect(0, y, W, 1);
      g.globalAlpha = 1;
      const r = simulate();
      const pulse = api.reducedMotion ? 0.6 : 0.5 + 0.5 * Math.sin(now / 420);
      // the cost seams tonight, for the "this seam pays" marks
      const pays = new Set();
      GAMES.forEach((gm) => { if (join[gm.id] && canPlay(gm)) { let best = -1, bw = -1; gm.needs.forEach((id) => { const si = SEAMS.findIndex((x) => x.id === id); if (warmIn(si) > bw) { bw = warmIn(si); best = si; } }); pays.add(best); } });
      SEAMS.forEach((sm, si) => {
        g.save(); g.translate(ox, oy); g.scale(s, s);
        g.fillStyle = "rgba(0,0,0,.18)"; g.save(); g.translate(4, 5); smooth(sm.pts); g.fill(); g.restore();
        g.fillStyle = "rgba(239,229,207,.86)"; smooth(sm.pts); g.fill();
        g.save(); smooth(sm.pts); g.clip();
        g.strokeStyle = "rgba(120,90,60,.10)"; g.lineWidth = 1;
        for (let k = -400; k < 700; k += 23) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 160, 420); g.stroke(); }
        slots.forEach((sl) => { if (sl.seam !== si || !open(sl)) return;
          const gr = g.createRadialGradient(sl.x, sl.y, 2, sl.x, sl.y, 46);
          gr.addColorStop(0, `rgba(227,154,45,${0.55 + 0.25 * pulse})`); gr.addColorStop(0.5, `rgba(184,50,42,${0.22 + 0.1 * pulse})`); gr.addColorStop(1, "rgba(184,50,42,0)");
          g.fillStyle = gr; g.fillRect(sl.x - 50, sl.y - 50, 100, 100); });
        g.restore();
        g.strokeStyle = C.ink; g.lineWidth = 1.2; smooth(sm.pts); g.stroke();
        g.setLineDash([6, 4]); g.lineWidth = 1; g.strokeStyle = "rgba(42,33,27,.8)"; smooth(inset(sm.pts, 9)); g.stroke(); g.setLineDash([]);
        g.fillStyle = C.ink;
        [0, Math.floor(sm.pts.length / 2)].forEach((k) => { const a = sm.pts[k], b = sm.pts[(k + 1) % sm.pts.length];
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; g.beginPath(); g.moveTo(mx - 4, my); g.lineTo(mx + 4, my); g.lineTo(mx, my + (my < 200 ? 6 : -6)); g.closePath(); g.fill(); });
        g.strokeStyle = "rgba(42,33,27,.7)"; g.lineWidth = 1; arrow(sm.grain[0][0], sm.grain[0][1], sm.grain[1][0], sm.grain[1][1]);
        g.restore();
        // seam labels at screen size, so they stay legible when the pattern is small
        const top = Math.min(...sm.pts.map((p) => p[1])), bot = Math.max(...sm.pts.map((p) => p[1])), cx = sm.slots.reduce((a, p) => a + p[0], 0) / sm.slots.length;
        const lx = ox + cx * s, ly = oy + top * s + Math.max(16, 24 * s);
        g.font = `700 ${s > 0.8 ? 13 : 12}px Karla,Arial,sans-serif`; g.textAlign = "center"; g.textBaseline = "alphabetic";
        const tw = g.measureText(sm.name).width + 8; g.fillStyle = "rgba(239,229,207,.9)"; g.fillRect(lx - tw / 2, ly - 12, tw, 16);
        g.fillStyle = C.ink; g.fillText(sm.name, lx, ly);
        if (s > 0.8) { g.font = "12px Karla,Arial,sans-serif"; g.fillText(`CUT 2 · SEAM ${sm.seam}`, lx, ly + 15); }
        const tags = [];
        if (si === r.warmest && r.lurches) tags.push(["LURCH", C.red]);
        if (pays.has(si)) tags.push([wide ? "PAYS TONIGHT" : "PAYS", C.cedar]);
        tags.forEach(([txt, col], k) => { g.font = "700 12px Karla,Arial,sans-serif"; const w = g.measureText(txt).width + 10; const yy = oy + bot * s - 14 - k * 19; g.fillStyle = col; g.fillRect(lx - w / 2, yy - 13, w, 17); g.fillStyle = C.bone; g.fillText(txt, lx, yy); });
      });
      // slot hollows
      slots.forEach((sl, k) => {
        if (sl.wad && !sl.closed) drawWad(sl.sx, sl.sy, sl.r - 2, true);
        if (sl.closed) {
          g.strokeStyle = C.ink; g.lineWidth = 2;
          g.beginPath(); for (let q = -2; q <= 2; q++) { g.moveTo(sl.sx - sl.r * 0.8, sl.sy + q * sl.r * 0.3); g.lineTo(sl.sx + sl.r * 0.8, sl.sy + q * sl.r * 0.3 + 2); } g.stroke();
          return;
        }
        g.strokeStyle = sl.bound ? C.gold : C.ink; g.lineWidth = sl.bound ? 3 : 1.2;
        g.setLineDash(sl.bound ? [] : [3, 2.5]);
        g.fillStyle = sl.token === null ? "rgba(90,50,30,.15)" : "rgba(0,0,0,0)";
        g.beginPath(); g.arc(sl.sx, sl.sy, sl.r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]);
        const focus = (held !== null || dragging || binding) && hover === "s" + k;
        const kb = kbUsed && kbTargets()[cursor] === "s" + k;
        if (focus || kb) { g.strokeStyle = binding ? C.gold : C.bone; g.lineWidth = 3; g.beginPath(); g.arc(sl.sx, sl.sy, sl.r + 5, 0, 7); g.stroke(); }
        if (binding && !sl.bound) { g.strokeStyle = C.gold; g.lineWidth = 1.5; g.setLineDash([2, 3]); g.beginPath(); g.arc(sl.sx, sl.sy, sl.r + 9, 0, 7); g.stroke(); g.setLineDash([]); }
        if (sl.bound && sl.token === null) { g.fillStyle = C.gold; g.font = "700 12px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "top"; g.fillText("BOUND", sl.sx, sl.sy + sl.r + 4); }
      });
      // tray
      g.fillStyle = "rgba(42,33,27,.6)"; g.fillRect(tray.x, tray.y, tray.w, tray.h);
      g.strokeStyle = "rgba(246,241,228,.6)"; g.setLineDash([5, 4]); g.strokeRect(tray.x + 4, tray.y + 4, tray.w - 8, tray.h - 8); g.setLineDash([]);
      g.fillStyle = C.bone; g.font = "700 13px Karla,Arial,sans-serif"; g.textAlign = "left"; g.textBaseline = "top";
      g.fillText(wide ? "TRAY: whatever is left here unravels when you close" : "TRAY: left here, it unravels", tray.x + 12, tray.y + 11);
      if (wide) {
        // whose patterns the thread comes from: yours, then the four on the shelf across the room
        const heldTok = typeof held === "number" ? tokens[held] : dragging && dragging.t ? dragging.t : null;
        let px = tray.x + tray.w - 12, any = false;
        ["dani", "marcus", "lila", "jamie", "you"].forEach((who) => {
          const hot = heldTok && heldTok.who === who, kept = who === "you" || r.friends.find((f) => f[0] === who)[1];
          if (A.draw(g, MEDAL[who], px - 30, tray.y + 5, 30, 30, FACE)) {
            any = true;
            g.strokeStyle = hot ? C.amber : WHO[who][0]; g.lineWidth = hot ? 3 : 1.5; g.beginPath(); g.arc(px - 15, tray.y + 20, 16, 0, 7); g.stroke();
            if (!kept) { g.strokeStyle = C.red; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px - 28, tray.y + 32); g.lineTo(px - 2, tray.y + 8); g.stroke(); }
            px -= 38;
          }
        });
        if (!any) { g.textAlign = "right"; g.fillText("PATTERN No. 6 · ONE BODY, SIX SEAMS", tray.x + tray.w - 12, tray.y + 11); }
        else if (heldTok && heldTok.kind === "borrowed") A.draw(g, SHEET[heldTok.who], tray.x + tray.w - 12 - 64, tray.y - 96, 64, 88);
      }
      // the wadding, always in the tray
      {
        const lift = hover === "w" && !dragging ? 2 : 0;
        if (!(dragging && dragging.wad && dragging.moved)) drawWad(wad.tx, wad.ty - lift, wad.r, false);
        g.fillStyle = C.bone; label("Wadding", wad.tx, wad.ty + wad.r + 3, 80, wide ? 13 : 12);
        const kb = kbUsed && kbTargets()[cursor] === "w";
        if (held === "wad" || kb || lift) { g.strokeStyle = held === "wad" ? C.amber : C.bone; g.lineWidth = 3; g.beginPath(); g.arc(wad.tx, wad.ty - lift, wad.r + 5, 0, 7); g.stroke(); }
      }
      tokens.forEach((t) => {
        if (t.lost && t.fadeStart) t.fade = Math.min(1, (now - t.fadeStart) / (api.reducedMotion ? 1 : 800));
        if (t.lost && t.fade >= 1) return;
        if (dragging && dragging.t === t && dragging.moved) return;
        const a = t.lost ? 1 - t.fade : 1;
        const lift = hover === "t" + t.i && !dragging && held === null ? 2 : 0;
        drawToken(t, t.tx, t.ty - lift, t.r, a);
        g.fillStyle = t.slot === null ? C.bone : C.ink; g.globalAlpha = a;
        if (t.slot === null) label(t.name, t.tx, t.ty + t.r + 3, wide ? 92 : 62, wide ? 13 : 12);
        g.globalAlpha = 1;
        const kb = kbUsed && kbTargets()[cursor] === "t" + t.i;
        if (held === t.i || kb || lift) { g.strokeStyle = held === t.i ? C.amber : C.bone; g.lineWidth = 3; g.beginPath(); g.arc(t.tx, t.ty - lift, t.r + 5, 0, 7); g.stroke(); }
      });
      // the name of a packed token, on hover
      if (hover && hover[0] === "t" && !dragging) { const t = tokens[+hover.slice(1)]; if (t.slot !== null) { g.font = "700 13px Karla,Arial,sans-serif"; const w = g.measureText(t.name).width + 12; g.fillStyle = C.ink; g.fillRect(t.tx - w / 2, t.ty - t.r - 26, w, 20); g.fillStyle = C.bone; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t.name, t.tx, t.ty - t.r - 16); } }
      if (dragging && dragging.moved) { if (dragging.wad) drawWad(dragging.x, dragging.y, 24, false); else drawToken(dragging.t, dragging.x, dragging.y, 28); }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i], a = (now - p.t0) / 1400;
        if (a >= 1) { pops.splice(i, 1); continue; }
        const rise = api.reducedMotion ? 0 : a * 26;
        g.globalAlpha = 1 - a * a; g.font = "700 14px Karla,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        const w = g.measureText(p.text).width + 12; g.fillStyle = C.bone; g.fillRect(p.x - w / 2, p.y - rise - 11, w, 22);
        g.fillStyle = p.col; g.fillText(p.text, p.x, p.y - rise); g.globalAlpha = 1;
      }
      K.frame(draw);
    }

    // ---- input ----------------------------------------------------------------------------
    function hit(x, y) {
      for (const t of tokens) if (!t.lost && Math.hypot(t.tx - x, t.ty - y) <= t.r + 6) return "t" + t.i;
      if (Math.hypot(wad.tx - x, wad.ty - y) <= wad.r + 6) return "w";
      for (let k = 0; k < slots.length; k++) if (!slots[k].closed && Math.hypot(slots[k].sx - x, slots[k].sy - y) <= slots[k].r + 10) return "s" + k;
      return null;
    }
    function place(ti, k) {
      const t = tokens[ti];
      if (k === null) { if (t.slot !== null) { slots[t.slot].token = null; pop("back to the tray", t.tx, t.ty - 30, C.amber); } t.slot = null; }
      else {
        const sl = slots[k];
        if (sl.closed) return;
        sl.wad = false;
        if (sl.token !== null && sl.token !== ti) { const other = tokens[sl.token]; other.slot = t.slot; if (t.slot !== null) slots[t.slot].token = other.i; }
        else if (t.slot !== null) slots[t.slot].token = null;
        sl.token = ti; t.slot = k;
        pop(sl.bound ? "packed · bound" : "packed", sl.sx, sl.sy - sl.r - 12, sl.bound ? "#6b5410" : C.green);
        packedEver++;
      }
      layout(); renderPanel();
      if (!borrowedCame && packedEver >= BORROW_AFTER) { borrowedCame = true; K.after(900, borrowed); }
      if (!ruthDone && slots.filter((x) => x.token !== null).length >= RUTH_AFTER) K.after(700, ruth);
    }
    // wadding goes into a hollow, or comes out of one
    function wadSlot(k) {
      const sl = slots[k]; if (!sl || sl.closed) return;
      if (sl.token !== null) { tokens[sl.token].slot = null; sl.token = null; }
      sl.wad = true;
      pop("wadding · cold", sl.sx, sl.sy - sl.r - 12, "#4c6276");
      if (!wadSaid) { wadSaid = true; beat("Wadding", "Plain fill. The hollow goes cold: no hunger lives in it, no memory, and it plays no game. Tap a wadded hollow to pull it out again.", 5600); }
      layout(); renderPanel();
    }
    function unwad(k) { slots[k].wad = false; pop("pulled out", slots[k].sx, slots[k].sy - slots[k].r - 12, C.amber); renderPanel(); }
    const drop = (k) => { if (held === "wad") wadSlot(k); else place(held, k); };
    // borrowed patches: four memories that are not yours come down the pulse into the tray
    function borrowed() {
      if (closing) return;
      FRIENDS.forEach((f) => {
        const pick = BORROWED[f][Math.floor(rng() * BORROWED[f].length)];
        tokens.push({ i: tokens.length, name: pick[0], who: f, line: pick[1], art: pick[2], kind: "borrowed", slot: null, lost: false, fade: 0 });
      });
      layout(); renderPanel();
      beat("Borrowed", "Something comes down the pulse that is not yours: four patches in other people's thread. One reads “Dani moved Gerald.” Pack one and that friend hungers slower and keeps a line of their voice. It costs you a hollow.", 8000);
    }
    function bindSlot(k) {
      const sl = slots[k]; if (!sl || sl.closed || bindUsed) return;
      sl.bound = true; bindUsed = true; binding = false;
      pop("gold thread", sl.sx, sl.sy - sl.r - 12, "#6b5410");
      renderPanel();
    }
    // Ruth's evening round: she pulls one seam tighter by hand, and a slot closes
    function ruth() {
      if (ruthDone || closing) return;
      ruthDone = true;
      // the leg seam with the most room, or the first that has an open slot
      const cand = slots.map((s, k) => k).filter((k) => !slots[k].bound && (SEAMS[slots[k].seam].id === "lleg" || SEAMS[slots[k].seam].id === "rleg"));
      const k = cand.find((q) => slots[q].token !== null) ?? cand[0];
      const sl = slots[k];
      if (sl.token !== null) { const t = tokens[sl.token]; t.slot = null; sl.token = null; }
      sl.closed = true;
      layout(); renderPanel();
      beat("Ruth's evening round", `She checks the windows, then the shelves. She turns you over, says nothing, and pulls your ${SEAMS[sl.seam].name.toLowerCase()} seam tighter by hand. One hollow is gone; whatever was in it is back in the tray.`, 6500);
    }
    const pt = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    function select(i) {
      held = held === i ? null : i;
      if (held !== null && !seenLine.has(i)) { seenLine.add(i); const t = tokens[i]; beat(t.name, t.line, 3600); }
      renderPanel();
    }
    K.on(cv, "pointerdown", (e) => {
      if (!started || closing) return;
      const [x, y] = pt(e), h = hit(x, y);
      if (binding) { if (h && h[0] === "s") bindSlot(+h.slice(1)); else if (h && h[0] === "t" && tokens[+h.slice(1)].slot !== null) bindSlot(tokens[+h.slice(1)].slot); return; }
      if (h === "w") { dragging = { wad: true, t: null, x, y, moved: false, sx: x, sy: y }; cv.setPointerCapture(e.pointerId); return; }
      if (h && h[0] === "s" && held === null && slots[+h.slice(1)].wad) { unwad(+h.slice(1)); return; }
      if (h && h[0] === "t") { const t = tokens[+h.slice(1)]; dragging = { t, x, y, moved: false, sx: x, sy: y }; cv.setPointerCapture(e.pointerId); }
      else if (h && h[0] === "s" && held !== null) { drop(+h.slice(1)); held = null; renderPanel(); }
    });
    K.on(cv, "pointermove", (e) => {
      const [x, y] = pt(e);
      hover = hit(x, y);
      cv.style.cursor = dragging ? "grabbing" : hover ? "pointer" : "default";
      if (dragging) { dragging.x = x; dragging.y = y; if (Math.hypot(x - dragging.sx, y - dragging.sy) > 6) dragging.moved = true; }
    });
    K.on(cv, "pointerup", (e) => {
      if (!dragging) return;
      const [x, y] = pt(e), d = dragging; dragging = null;
      if (!d.moved) { if (d.wad) { held = held === "wad" ? null : "wad"; binding = false; renderPanel(); } else select(d.t.i); return; }
      let best = null, bd = 1e9;
      slots.forEach((sl, k) => { if (sl.closed) return; const dd = Math.hypot(sl.sx - x, sl.sy - y); if (dd < bd && dd < sl.r + 22) { bd = dd; best = k; } });
      if (d.wad) { if (best !== null) wadSlot(best); held = null; renderPanel(); return; }
      if (!seenLine.has(d.t.i)) { seenLine.add(d.t.i); beat(d.t.name, d.t.line, 3600); }
      place(d.t.i, best); held = null; renderPanel();
    });
    function kbTargets() {
      return held === null && !binding ? tokens.filter((t) => !t.lost).sort((a, b) => (a.slot === null ? 0 : 1) - (b.slot === null ? 0 : 1)).map((t) => "t" + t.i).concat(["w"]) : slots.map((_, k) => "s" + k).filter((id) => !slots[+id.slice(1)].closed);
    }
    K.on(wrap, "keydown", (e) => {
      if (!started || closing) return;
      if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      kbUsed = true;
      const list = kbTargets();
      if (["ArrowRight", "ArrowDown"].includes(e.key)) { cursor = (cursor + 1) % list.length; e.preventDefault(); }
      else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { cursor = (cursor - 1 + list.length) % list.length; e.preventDefault(); }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = list[cursor];
        if (binding && id) { bindSlot(+id.slice(1)); cursor = 0; }
        else if (held === null && id === "w") { held = "wad"; cursor = 0; }
        else if (held === null && id && id[0] === "t") { select(+id.slice(1)); cursor = 0; }
        else if (held !== null && id) { drop(+id.slice(1)); held = null; cursor = 0; }
        renderPanel();
      } else if ((e.key === "Backspace" || e.key === "Delete") && held !== null) { if (held !== "wad") place(held, null); held = null; cursor = 0; renderPanel(); }
      else if (e.key === "w" || e.key === "W") { held = held === "wad" ? null : "wad"; binding = false; cursor = 0; renderPanel(); }
      else if (e.key === "Escape") { held = null; binding = false; renderPanel(); }
      else if ((e.key === "b" || e.key === "B") && !bindUsed) { binding = !binding; held = null; cursor = 0; renderPanel(); }
    });
    wrap.tabIndex = 0;

    // ---- closing the seams plays the night ------------------------------------------------
    function closeSeams() {
      if (closing || !started) return;
      closing = true; held = null; binding = false;
      const r = simulate();
      closeBtn.disabled = true;
      scroll.querySelectorAll("button").forEach((b) => (b.disabled = true));
      const log = document.createElement("div");
      log.className = PRE + "log";
      log.innerHTML = `<p><b>The seams close. The night runs.</b></p>`;
      wrap.appendChild(log);
      const step = api.reducedMotion ? 300 : 1000;
      r.events.forEach((ev, k) => K.after(step * (k + 1), () => {
        const p = document.createElement("p"); p.textContent = ev.text; if (ev.kind === "cost" || ev.kind === "tray") p.className = PRE + "cost";
        if (r.emptyToy && ev.kind !== "tray" && ev.kind !== "back") return; log.appendChild(p); log.scrollTop = 1e6;
        if (ev.token !== undefined) {
          const t = tokens[ev.token]; t.lost = true;
          if (t.slot !== null) { slots[t.slot].token = null; t.slot = null; }
          t.fadeStart = performance.now();
        }
      }));
      K.after(step * (r.events.length + 2), () => {
        const kept = tokens.filter((t) => !t.lost && t.kind === "mine").map((t) => t.name);
        const voices = r.lent.map((t) => `${WHO[t.who][2]}, later, once: ${VOICE[t.who]}`);
        if (r.emptyToy) {
          A.finale(wrap, "movement-2").then(() => api.end({ outcome: "done", text: `Six seams of wadding. You pack yourself with nothing: no memory to lose, no hunger to feed, no game you can be made to play. The others climb down without you. In the morning Mabel dusts around a toy that does not move. “And the worst part? / We were awake.” This is the Empty Toy, chosen by hand.` }));
          return;
        }
        const best = api.store.get("best", 0);
        if (r.kept > best) api.store.set("best", r.kept);
        const gone = r.friends.filter((x) => !x[1]).map(([f]) => WHO[f][2]);
        let why;
        if (r.ok) why = `Enough is left of you for the Warning, and something of each of them: ${FRIENDS.map((f) => WHO[f][2]).join(", ")}.`;
        else if (r.lurches) why = "The hunger lurched in the night and took what it wanted from the warmest seam.";
        else if (gone.length) why = `Nothing is left of ${gone.join(" or ")}. You know there was someone; you cannot think who.`;
        else why = "Too little is left of you for the Warning.";
        api.end({ outcome: r.ok ? "win" : r.lurches ? "lose" : "done", text: `Kept ${r.kept} of ${TOKENS.length}: ${kept.join(", ") || "nothing"}. ${why} ${r.joined ? `You joined ${r.joined === 2 ? "both games" : "one game"}.` : "You held through both games."}${voices.length ? " Borrowed and kept: " + voices.join(" ") : ""}` });
      });
    }
    K.on(closeBtn, "click", closeSeams);

    // ---- how to play: a pattern instruction sheet --------------------------------------------
    const intro = document.createElement("div");
    intro.className = PRE + "intro";
    intro.innerHTML = `<div class="${PRE}card" role="dialog" aria-label="How to play Stuffing">
      <h2>Stuffing</h2>
      <p class="${PRE}goal">The second night, before Scent and Proximity. Your body lies open like a sewing pattern. What you pack is what you keep: keep five, keep something of each friend, and don't let the hunger lurch.</p>
      <div class="${PRE}legend">
        <div><i style="background:${C.sky}"></i><span>Drag a memory into a hollow, or tap it then a hollow</span><kbd>arrows · Enter</kbd></div>
        <div><i style="background:radial-gradient(${C.amber},${C.red})"></i><span>An empty hollow is warm: hunger lives there, and games need it</span><span></span></div>
        <div><i style="background:${C.bone}"></i><span>Join or Hold tonight's games, then Close</span><kbd>panel</kbd></div>
        <div><i style="background:#f3efe6"></i><span>Wadding fills a hollow with nothing: cold, and it plays no game</span><kbd>W</kbd></div>
      </div>
      <button type="button">Lay out the pattern</button>
    </div>`;
    wrap.appendChild(intro);
    {
      const cardEl = intro.querySelector("." + PRE + "card"), h2 = intro.querySelector("h2");
      const cw = Math.min(418, wrap.clientWidth - 84);
      const plate = A.picture("chapter-12", cw, { alt: "Chapter 12: Scent, then Proximity" });
      if (plate) { plate.className = PRE + "plate"; cardEl.insertBefore(plate, h2); }
      const ttl = A.word("Stuffing", 40);
      if (ttl) { h2.textContent = ""; h2.appendChild(ttl); }
      const meter = A.picture("ui-warmth-meter", Math.min(300, cw), { alt: "The hunger meter" });
      if (meter) { meter.style.margin = "8px 0 0"; cardEl.insertBefore(meter, cardEl.querySelector("button")); }
    }
    const startBtn = intro.querySelector("button");
    K.on(startBtn, "click", () => { intro.remove(); started = true; wrap.focus(); renderPanel(); beat("Gold thread", "Spread 2 taught you to bind one slot. Choose it with Bind (B): whatever sits there, the night cannot take.", 5000); });
    startBtn.focus();

    const ro = new ResizeObserver(() => { A.flush(); layout(); });
    ro.observe(wrap);
    // a read-only probe for automated play tests
    layout(); renderPanel(); K.frame(draw);
    return { unmount() { K.dispose(); A.dispose(); ro.disconnect(); wrap.remove(); } };
  },
};

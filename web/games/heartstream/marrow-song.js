// A Journey Into the Heartstream, 1D game: Marrow-Song (DESIGN.md section 11, `g1_song`).
// Bead-string notation: beads on strands, height as pitch, the last bead home.
//
// Phase 2 (DEEP_DIVE.md section 3, built 2026-11-16): a ladder of three verses.
//   Teach  verse one (`s1_song_1`, the singing hollow): eight slots, smooth joins only. Each companion has
//          set one phrase, you place yours, and at Sing they fill what is left. It closes on the set-piece,
//          The First Listen: every growth in the hollow answers verse one at once.
//   Test   the heart verse (`s1_song_2`, a calm pool): four slots, one phrase from each brother, alternating
//          accents, beginning near where verse one ended and ending home. New: the rest bead (a silent beat
//          anyone may place, at most four in a verse; a join is read from the nearest sounded bead), the
//          small one's phrase with its wrong note, and the row you left on the board as a phrase.
//   Twist  the one who fears is gone. His phrase keeps its slot and sounds as silence: a hollow bead. Joins
//          are read across the gap (only the same height carries across silence), his silence has used the
//          verse's four rests, and the group chooses whether the song ends on his gap. The First Listen
//          returns as its last picture, with his growths dark.
// Links (api.shared): rest beads sung here are where the Warden's eye opens in the river section; the row
// left at the cut in Bone Counters, read as five heights, is offered here as a phrase.
//
// Actions: Place (drag, or tap a phrase then a slot); Take back (tap your placed phrase); Listen; Ask the
// one who dreams; Rest (R, then tap a bead; or 1-4 on a focused slot).
//
// Art (api.art): the song membrane under the slots, each brother's bead, temperament glyph and seat
// portrait on his tray, the rest and hollow beads, the small one, chapter cards 3 and 7. The mode's own
// drawing remains as the fallback for each.
//
// Lines shown, verbatim (DESIGN.md section 3):
//   creative-writing/vault/03_Stories/02_A_Journey_Into_the_Heartstream_-_The_Rite_of_the_Blue-Born.md
//   "Their society is calm, cold, and ceremonial. Everything they do prepares them for the moment they will leave the bones forever."
//   "The young men laugh, argue, dream, and fear — all the emotions of early adulthood, amplified by the knowledge that this is the last time they will ever be together."
// "Sing it whole." is the elders' line from DESIGN.md section 6. The stage cards, the First Listen's lines and
// the hollow bead's lines are written for the game.

import { howTo, Beats, flourish, disposeKit, artUrl, pngUrl, plate, endCard, ladder, stagePicker, shared } from "./_kit.js";

const SEATS = [
  { name: "you, the one who laughs", short: "You", col: "#7FB2E0", wave: "sine", t: "laughs" },
  { name: "the one who argues", short: "Argues", col: "#E8DCC4", wave: "triangle", t: "argues" },
  { name: "the one who dreams", short: "Dreams", col: "#E0603A", wave: "square", t: "dreams" },
  { name: "the one who fears", short: "Fears", col: "#F2B544", wave: "sawtooth", t: "fears" },
  { name: "the small one", short: "Small", col: "#b9a7d6", wave: "sine", t: null },
];
const PITCH = [0, 196, 220, 262, 294, 330];
const SOCIETY = "Their society is calm, cold, and ceremonial. Everything they do prepares them for the moment they will leave the bones forever.";
const BROTHERS = "The young men laugh, argue, dream, and fear — all the emotions of early adulthood, amplified by the knowledge that this is the last time they will ever be together.";

// ---- reading a verse ------------------------------------------------------------------------------
const isRest = (p, j) => p.hollow || p.notes[j] === 0 || p.rest.has(j);
const firstNote = (p) => { for (let j = 0; j < p.notes.length; j++) if (!isRest(p, j)) return p.notes[j]; return null; };
const lastNote = (p) => { for (let j = p.notes.length - 1; j >= 0; j--) if (!isRest(p, j)) return p.notes[j]; return null; };
const accentOf = (p) => (p.accent && !isRest(p, p.accent - 1) ? p.accent : 0);
const silent = (p) => firstNote(p) == null;
const restsIn = (p) => (p.hollow ? 4 : p.notes.reduce((a, _, j) => a + (isRest(p, j) ? 1 : 0), 0));
// every join in the verse: neighbours, or two phrases with one silent phrase between them (read across the gap)
function joins(slots) {
  const out = [];
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i]; if (!a || silent(a)) continue;
    let j = i + 1, across = false;
    if (slots[j] && silent(slots[j])) { j++; across = true; }
    const b = slots[j]; if (!b || silent(b)) continue;
    const d = Math.abs(lastNote(a) - firstNote(b));
    const kind = across ? (d === 0 ? "smooth" : d === 1 ? "rough" : "break") : d <= 1 ? "smooth" : d === 2 ? "rough" : "break";
    out.push({ i, j, kind, across, call: !across && accentOf(a) && accentOf(b) && accentOf(a) !== accentOf(b) });
  }
  return out;
}
function score(slots) {
  const js = joins(slots);
  const smooth = js.filter((x) => x.kind === "smooth").length, rough = js.filter((x) => x.kind === "rough").length, breaks = js.filter((x) => x.kind === "break").length, calls = js.filter((x) => x.call).length;
  const child = slots.some((p) => p && p.seat === 4) ? 1 : 0;   // the small one's phrase breaks one join, wherever it stands
  return { smooth, rough, breaks, calls, child, h: Math.max(0, Math.min(100, 50 + 6 * smooth - 8 * (breaks + child) + 3 * calls)) };
}
const harmony = (slots) => score(slots).h;
function companionFill(slots, phrases) {
  const out = slots.slice(), used = new Set(out.filter(Boolean).map((p) => p.id));
  for (let i = 0; i < out.length; i++) {
    if (out[i]) continue;
    let best = null, bv = -1e9;
    for (const p of phrases) {
      if (p.seat === 0 || used.has(p.id)) continue;
      let v = 0;
      if (i > 0 && out[i - 1]) { const d = Math.abs(lastNote(out[i - 1]) - firstNote(p)); v += d <= 1 ? 6 : d >= 3 ? -8 : 0; }
      if (v > bv) { bv = v; best = p; }
    }
    if (best) { out[i] = best; used.add(best.id); }
  }
  return out;
}

export default ladder(run, {
  theme: { bg: "#11203a", fg: "#E8DCC4", accent: "#F2B544", ink: "#0b1424" },
  next: [null, "Next, days later on the river: the heart verse. Four slots, one phrase from each of you, accents that answer each other, and a silent bead you may set where a join will not hold.",
    "Next: the same verse, after the patrol. One of the four is not on the raft."],
});

function run(root, api, ctl) {
  {
    const SG = ctl.stage, sh = shared(api);
    const P = "heartstream-marrow-song-";
    const RM = api.reducedMotion;
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const rng = api.rng();
    const mk = (id, seat, notes, accent) => ({ id, seat, notes, accent, rest: new Set() });
    const randPhrase = (id, seat, first) => {
      const n = [first ?? 1 + Math.floor(rng() * 5)];
      for (let j = 1; j < 4; j++) n.push(Math.max(1, Math.min(5, n[j - 1] + Math.floor(rng() * 5) - 2)));
      return mk(id, seat, n, SG === 0 ? 0 : rng() < 0.5 ? 1 : 3);
    };
    const boardRow = sh.get("boardRow", null);
    let lastHeight = 3;
    try { const v = api.store.get("lastHeight", 3) | 0; if (v >= 1 && v <= 5) lastHeight = v; } catch { /* storage off */ }

    // ---- teach: verse one, generated until the best arrangement holds and a careless one does not ----
    let phrases = [], fixed = [], solution = null;
    let keepGen = null;
    if (SG === 0) {
      for (let tries = 0; tries < 500; tries++) {
        phrases = [];
        for (let s = 0; s < 4; s++) for (let k = 0; k < 3; k++) phrases.push(randPhrase(`${s}-${k}`, s));
        fixed = Array(8).fill(null);
        const spots = [1, 3, 4, 6].sort(() => rng() - 0.5).slice(0, 3);
        [1, 2, 3].forEach((s, i) => { fixed[spots[i]] = phrases.find((p) => p.seat === s); });
        const free = fixed.map((p, i) => (p ? -1 : i)).filter((i) => i >= 0);
        const mine = phrases.filter((p) => p.seat === 0);
        let best = -1, bestSlots = null, sum = 0, n = 0;
        const rec = (slots, left) => {
          if (slots.some((p) => p && p.seat === 0)) { const h = harmony(companionFill(slots, phrases)); sum += h; n++; if (h > best) { best = h; bestSlots = slots.slice(); } }
          for (const p of left) for (const i of free) if (!slots[i]) { slots[i] = p; rec(slots, left.filter((q) => q !== p)); slots[i] = null; }
        };
        rec(fixed.slice(), mine);
        if (!keepGen || best > keepGen.best) keepGen = { best, phrases, fixed, solution: bestSlots };
        if (best >= 80 && sum / n < 64) break;
      }
      ({ phrases, fixed, solution } = keepGen);
    }

    // ---- the heart verse ---------------------------------------------------------------------------
    const near = (h) => Math.max(1, Math.min(5, h + Math.floor(rng() * 3) - 1));
    // one phrase from each brother (or two to choose from): a verse "holds" when it begins near, ends home and nothing breaks
    const holds = (slots) => { const f = slots.map((p) => p && firstNote(p)).find((v) => v != null), sounded = slots.filter((p) => p && !silent(p)), l = sounded.length ? lastNote(sounded[sounded.length - 1]) : null; const sc = score(slots);
      return { near: f != null && Math.abs(f - lastHeight) <= 1, home: l === 1, sc, win: f != null && Math.abs(f - lastHeight) <= 1 && l === 1 && sc.breaks === 0 && (SG === 2 ? sc.rough === 0 : sc.h + 8 * sc.child >= 68) }; };
    const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r])));
    function makeTest() {
      for (let tries = 0; tries < 4000; tries++) {
        const chain = [], order = [0, 1, 2, 3].sort(() => rng() - 0.5);
        let start = near(lastHeight), acc = rng() < 0.5 ? 1 : 3;
        for (let i = 0; i < 4; i++) { const p = randPhrase(`h${order[i]}a`, order[i], start); p.accent = acc; acc = acc === 1 ? 3 : 1; chain.push(p); start = near(p.notes[3]); }
        if (chain[3].notes[3] !== 1) continue;
        if (joins(chain).some((x) => x.kind !== "smooth")) continue;
        // one join is spoiled: the phrase's last bead leaps away, and only a rest on it lets the bead before it carry the join
        const k = Math.floor(rng() * 3), nx = chain[k + 1].notes[0];
        if (nx === 3) continue;
        chain[k].notes[2] = nx; chain[k].notes[3] = nx >= 4 ? nx - 3 : nx + 3;
        if (Math.abs(chain[k].notes[1] - chain[k].notes[2]) > 2) chain[k].notes[1] = chain[k].notes[2];
        if (k === 0 && Math.abs(chain[0].notes[0] - lastHeight) > 1) continue;
        const decoys = [0, 1, 2, 3].map((s) => randPhrase(`h${s}b`, s));
        const all = [...chain, ...decoys];
        // without a rest no arrangement may hold
        let open = false;
        for (let m = 0; m < 16 && !open; m++) { const pick = [0, 1, 2, 3].map((s) => all.find((p) => p.seat === s && p.id.endsWith(m >> s & 1 ? "b" : "a"))); for (const o of perms(pick)) if (holds(o).win) { open = true; break; } }
        if (open) continue;
        chain[k].rest.add(3); const ok = holds(chain).win; chain[k].rest.delete(3);
        if (!ok) continue;
        return { chain, restAt: [k, 3], all: all.sort((a, b) => a.seat - b.seat || (a.id < b.id ? -1 : 1)) };
      }
      const chain = [0, 1, 2, 3].map((s, i) => mk(`h${s}a`, s, [lastHeight, 2, 2, i === 3 ? 1 : 2], i % 2 ? 3 : 1));
      return { chain, restAt: null, all: chain };
    }
    function makeTwist() {
      for (let tries = 0; tries < 4000; tries++) {
        const order = [0, 1, 2].sort(() => rng() - 0.5), chain = [];
        let start = near(lastHeight), acc = rng() < 0.5 ? 1 : 3;
        for (let i = 0; i < 3; i++) { const p = randPhrase(`h${order[i]}a`, order[i], start); p.accent = acc; acc = acc === 1 ? 3 : 1; chain.push(p); start = i === 0 ? p.notes[3] : near(p.notes[3]); }
        if (chain[2].notes[3] !== 1 || chain[0].notes[3] !== chain[1].notes[0]) continue;
        if (joins(chain).some((x) => x.kind !== "smooth")) continue;
        const decoys = [0, 1, 2].map((s) => randPhrase(`h${s}b`, s));
        const gap = { id: "h3x", seat: 3, notes: [0, 0, 0, 0], accent: 0, rest: new Set(), hollow: true };
        return { chain: [...chain, gap], inside: [chain[0], gap, chain[1], chain[2]], all: [...chain, ...decoys, gap].sort((a, b) => a.seat - b.seat || (a.id < b.id ? -1 : 1)) };
      }
      const c = [0, 1, 2].map((s, i) => mk(`h${s}a`, s, [lastHeight, lastHeight, 2, i === 2 ? 1 : lastHeight], i % 2 ? 3 : 1));
      const gap = { id: "h3x", seat: 3, notes: [0, 0, 0, 0], accent: 0, rest: new Set(), hollow: true };
      return { chain: [...c, gap], inside: [c[0], gap, c[1], c[2]], all: [...c, gap] };
    }
    const heart = SG === 1 ? makeTest() : SG === 2 ? makeTwist() : null;
    let linkBoard = false;
    if (SG === 1) {
      // the wrong note: the small one's phrase is yours with one bead wrong
      const mine = heart.chain.find((p) => p.seat === 0) || heart.all.find((p) => p.seat === 0);
      const n = mine.notes.slice(); n[1] = n[1] >= 4 ? n[1] - 2 : n[1] + 2;
      heart.all.push(mk("child", 4, n, mine.accent));
      // link, board to song: the row left at the cut, read as five heights (an empty hollow is a silent beat)
      if (Array.isArray(boardRow) && boardRow.slice(0, 5).some((v) => v > 0)) {
        const hs = boardRow.slice(0, 5).map((v) => Math.max(0, Math.min(5, v | 0)));
        heart.all.push(mk("board", 0, hs, hs[0] > 0 ? 1 : hs[2] > 0 ? 3 : 0)); linkBoard = true;
      }
    }
    const N = SG === 0 ? 8 : 4;
    const st = { started: false, over: false, slots: SG === 0 ? fixed.slice() : [null, null, null, null], sel: null, time: SG === 2 ? 130 : 160, ghost: null, playing: null, hints: 2, restMode: false, auto: false };
    const pool = () => (SG === 0 ? phrases : heart.all);
    const movable = (p) => p && (SG > 0 || p.seat === 0);
    const restCount = () => st.slots.reduce((a, p) => a + (p ? restsIn(p) : 0), 0);

    // ---- DOM ------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    const strand = (y, c) => `linear-gradient(transparent ${y - 1}px,${c} ${y - 1}px ${y + 1}px,transparent ${y + 1}px)`;
    css.textContent = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 50% 30%,#2F5D8C 0,#1E3557 55%,#0d1a30 100%);color:#E8DCC4;font-family:var(--g-body);padding:14px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px}
.${P}top{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}
.${P}top h2{font-family:var(--g-display);font-weight:500;font-size:clamp(20px,3vw,28px);letter-spacing:.12em;margin:0;flex:1 1 auto;text-transform:uppercase}
.${P}hbar{display:flex;align-items:center;gap:8px;font-size:13px;letter-spacing:.16em}
.${P}hbar span{display:block;width:140px;height:14px;border-radius:7px;border:1px solid #7FB2E0;overflow:hidden;position:relative}
.${P}hbar span::after{content:"";position:absolute;left:75%;top:0;bottom:0;width:2px;background:#E8DCC4}
.${P}hbar i{display:block;height:100%;background:#7ed38a;transition:width .3s}
.${P}hbar b{font-size:16px;min-width:2ch}
.${P}timer{font-size:14px;letter-spacing:.08em;color:#c9d8ec}
.${P}btn{font:700 15px var(--g-body);color:#0b1424;background:#E8DCC4;border:0;border-radius:18px;padding:9px 16px;cursor:pointer;min-height:42px;transition:transform .1s}
.${P}btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 0 0 2px #7FB2E0}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}sing{background:#F2B544}
.${P}scroll{flex:1 1 280px;min-height:220px;display:flex}
.${P}mem{width:100%;height:100%;max-height:440px}
.${P}mem g[role=button]{cursor:pointer;outline:none}
.${P}mem g[role=button]:hover rect.${P}hit{stroke-opacity:.8}
.${P}mem g[role=button]:focus rect.${P}hit{stroke:#F2B544;stroke-width:3;stroke-opacity:1}
.${P}trays{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.${P}tray{border:1.5px solid;border-radius:14px;padding:8px;background:rgba(11,20,36,.55);min-width:0}
.${P}tray h3{font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;font-weight:700;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.${P}tray h3 img{height:38px;width:auto;border-radius:4px;flex:none}
.${P}tray h3 img.${P}sm{height:26px;border-radius:50%}
.${P}tray .${P}ph{display:flex;gap:6px;flex-wrap:wrap}
.${P}phr{background:none;border:1.5px solid rgba(127,178,224,.25);border-radius:10px;padding:2px;cursor:grab;touch-action:none}
.${P}phr:hover:not(:disabled){border-color:#7FB2E0}
.${P}phr[aria-pressed=true]{border-color:#F2B544;background:rgba(242,181,68,.18);box-shadow:0 0 12px rgba(242,181,68,.4)}
.${P}phr:disabled{opacity:.45;cursor:default}
.${P}say{min-height:1.4em;font-size:16px;font-style:italic;color:#dbe6f4}
.${P}legend{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;color:#c9d8ec}
.${P}legend b{color:#E8DCC4}
.${P}drag{position:fixed;pointer-events:none;z-index:50;opacity:.9}
.${P}beat{position:absolute;left:50%;top:70px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));box-sizing:border-box;padding:12px 18px;background:rgba(11,20,36,.94);border:1.5px solid #7FB2E0;border-radius:22px;font-family:var(--g-display);font-size:19px;line-height:1.35;text-align:center;z-index:6;box-shadow:0 8px 30px rgba(0,0,0,.4)}
.${P}beat b{display:block;font-family:var(--g-body);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#F2B544}
.${P}beat.${P}in{animation:${P}up .5s ease-out}
@keyframes ${P}up{from{opacity:0;transform:translate(-50%,10px)}}
.${P}ok{animation:${P}okk .6s}
@keyframes ${P}okk{40%{filter:drop-shadow(0 0 10px #7ed38a)}}
.${P}bad{animation:${P}bd .45s}
@keyframes ${P}bd{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:rgba(13,26,48,.84);z-index:8;overflow:auto}
.${P}card{position:relative;max-width:560px;width:100%;box-sizing:border-box;background:#11203a;border:1.5px solid #7FB2E0;border-radius:22px;padding:34px 24px 20px;
  background-image:${strand(14, "rgba(127,178,224,.5)")},radial-gradient(circle at 10% 14px,#7FB2E0 5px,transparent 6px),radial-gradient(circle at 18% 14px,#E8DCC4 5px,transparent 6px),radial-gradient(circle at 26% 14px,#E0603A 6px,transparent 7px),radial-gradient(circle at 34% 14px,#F2B544 5px,transparent 6px),radial-gradient(circle at 90% 14px,#7FB2E0 7px,transparent 8px)}
.${P}kick{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#7FB2E0}
.${P}card h2{font-family:var(--g-display);font-weight:500;font-size:34px;margin:2px 0 6px}
.${P}q{font-family:var(--g-display);font-style:italic;font-size:18px;line-height:1.35;margin:0 0 10px;color:#c9d8ec}
.${P}scene{margin:0 0 10px;font-size:15px;line-height:1.45}
.${P}goal{margin:0 0 12px;font-size:16px;line-height:1.4}
.${P}goal b{color:#F2B544;font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin-right:6px}
.${P}keys{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px}
.${P}keys li{display:grid;grid-template-columns:22px 92px 1fr;gap:0 8px;font-size:15px;align-items:baseline}
.${P}keys li::before{content:"";width:14px;height:14px;border-radius:50%;background:#7FB2E0;box-shadow:inset -3px -3px 0 rgba(0,0,0,.25);align-self:center}
.${P}keys li:nth-child(2)::before{background:#7ed38a}.${P}keys li:nth-child(3)::before{background:#F2B544}
.${P}kv{font-weight:700}
.${P}kw{grid-column:3;font-size:14px;color:#c9d8ec}
.${P}extra{font-size:14px;color:#c9d8ec;margin:0 0 12px}
.${P}start{font:700 16px var(--g-body);color:#0b1424;background:#F2B544;border:0;border-radius:18px;padding:10px 26px;cursor:pointer}
@media (max-width:640px){.${P}scroll{flex:0 0 auto;min-height:0}.${P}mem{height:auto;max-height:none}.${P}hbar span{width:100px}.${P}top h2{flex-basis:100%}.${P}beat{top:110px;font-size:17px}.${P}trays{grid-template-columns:1fr 1fr}.${P}tray h3{font-size:12px}.${P}tray h3 img{height:30px}.${P}tray h3 img.${P}sm{height:22px}.${P}keys li{grid-template-columns:20px 76px 1fr}}
.${P}btn[aria-pressed=true]{background:#7FB2E0}
.${P}mem [data-beat]{cursor:pointer}
.${P}tag{display:block;font:italic 12px var(--g-body);color:#c9d8ec;margin:2px 0 4px}
.${P}fl{position:absolute;inset:0;z-index:12;background:#0a1322;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:14px;box-sizing:border-box;overflow:auto;text-align:center}
.${P}fl .${P}hol{position:relative;width:min(100%,820px);aspect-ratio:16/8;background:#0d1a30 center/cover no-repeat;border:1.5px solid #7FB2E0;border-radius:18px;overflow:hidden}
.${P}fl svg{position:absolute;inset:0;width:100%;height:100%}
.${P}fl .${P}gr{opacity:.16;transition:opacity 1.1s ease-out}
.${P}fl .${P}lit .${P}gr{opacity:1}
.${P}fl .${P}lit .${P}gr.${P}dk{opacity:.1}
.${P}fl p{margin:0;max-width:640px;font-family:var(--g-display);font-size:19px;line-height:1.4;color:#E8DCC4}
.${P}fl b{display:block;font:700 12px var(--g-body);letter-spacing:.2em;text-transform:uppercase;color:#F2B544;margin-bottom:4px}
`;
    wrap.appendChild(css);
    const top = document.createElement("div"); top.className = P + "top";
    top.innerHTML = `<h2></h2><div class="${P}hbar">HARMONY <span><i></i></span><b></b></div><span class="${P}timer"></span>
<button type="button" class="${P}btn" data-a="rest" aria-pressed="false" ${SG === 0 ? "hidden" : ""}>Rest bead</button><button type="button" class="${P}btn" data-a="hint">Ask the one who dreams (2)</button><button type="button" class="${P}btn" data-a="listen">Listen</button><button type="button" class="${P}btn ${P}sing" data-a="sing" disabled>Sing</button>`;
    const NS = "http://www.w3.org/2000/svg";
    const mem = document.createElementNS(NS, "svg"); mem.setAttribute("class", P + "mem"); mem.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const say = document.createElement("div"); say.className = P + "say"; say.setAttribute("aria-live", "polite");
    const legendEl = document.createElement("ul"); legendEl.className = P + "legend";
    legendEl.innerHTML = `<li><b>Place</b> drag · tap phrase then slot · Enter</li><li><b>Take back</b> tap ${SG === 0 ? "your" : "a"} phrase in the verse</li><li><b>Listen</b> L · hear the verse</li><li><b>Ask</b> H · the one who dreams suggests</li>${SG > 0 ? "<li><b>Rest</b> R, then tap a bead · 1–4 on a focused slot</li>" : ""}`;
    const trays = document.createElement("div"); trays.className = P + "trays";
    const scroller = document.createElement("div"); scroller.className = P + "scroll"; scroller.appendChild(mem);
    wrap.append(top, scroller, say, trays, legendEl);
    const beats = new Beats(P, wrap, RM);
    const intro = howTo(P, [{
      kicker: "Chapter three · the singing hollow",
      title: "Marrow-Song",
      quote: `“${SOCIETY}”`,
      scene: "The four of you have found your phrases in the hollow. Tonight the elders want one song from four throats. It will be the rowing chant, and it will be sung back at the heart.",
      goal: "Set your phrases into verse one so it holds: harmony 68 or more, on joins alone.",
      keys: [["Place", "drag, or tap a phrase then a slot", "higher bead, higher note; your phrases are blue"],
        ["Join", "end to start: a step of 0 or 1 is smooth", "a step of 3 or more breaks the song"]],
      extra: "Press Sing when you are ready; your brothers fill what is left.",
    }, {
      kicker: "Chapter seven · a calm pool on the river",
      title: "The heart verse",
      quote: `“${BROTHERS}”`,
      scene: "Days later the raft turns slowly in a calm pool. One phrase from each of you, in an order you choose: the verse you will sing back at the heart.",
      goal: `Set four phrases, one from each brother, so the verse begins near ${lastHeight}, ends home on the lowest bead, and nothing breaks.`,
      keys: [["Call", "neighbours with different accents", "the big bead is the accent; each change is a rowing call"],
        ["Rest", "R, then tap a bead · 1–4 on a slot", "a silent beat, four at most; the join is read from the nearest sounded bead"],
        ["Offered", "two phrases you did not find", "the small one's, with its wrong note; and any row you left on the board"]],
      extra: "One join here will not hold as the beads lie. Something has to be left unsung.",
    }, {
      kicker: "Chapter seven · after the patrol",
      title: "The hollow bead",
      scene: "The one who fears is not on the raft. His seat is empty and his oar is shipped. The verse still has four slots.",
      goal: `Set the verse for three voices and a gap: begin near ${lastHeight}, end home, and let every join hold.`,
      keys: [["His phrase", "a hollow bead: it keeps its slot and sounds as silence", "it must stand somewhere in the verse"],
        ["Across", "the join is read across his gap", "only the same height carries across silence"],
        ["No rests", "his silence has used the verse's four", "this one is solved by order alone"]],
      extra: "The song may end on his gap, or close over it. That is for the three of you to choose.",
    }][SG]);
    plate(api, intro, P, { card: SG === 0 ? "chapter-3" : "chapter-7", numeral: SG === 0 ? "numeral-3" : "numeral-7", css: "border-radius:12px", at: "50% 50%" });
    stagePicker(P, intro, ctl);
    let memUrl = "";
    pngUrl(api, "song-membrane", 1200, 375).then((u) => { memUrl = u; drawMem(); });
    wrap.appendChild(intro);
    root.appendChild(wrap);
    const singBtn = top.querySelector('[data-a="sing"]'), hintBtn = top.querySelector('[data-a="hint"]'), restBtn = top.querySelector('[data-a="rest"]'), timerEl = top.querySelector("." + P + "timer");
    const GOAL = SG === 0 ? 68 : SG === 1 ? 68 : 62;
    { const mk2 = document.createElement("style"); mk2.textContent = `.${P}hbar span::after{left:${GOAL}%}`; wrap.appendChild(mk2); }

    // ---- sound ----------------------------------------------------------------------------------
    let audio = null;
    function note(seat, h, at, accent, dur = 0.42) {
      if (!audio || !h) return;
      const o = audio.createOscillator(), v = audio.createGain(), f = audio.createBiquadFilter();
      o.type = SEATS[seat].wave; o.frequency.value = PITCH[h]; f.type = "lowpass"; f.frequency.value = 1200;
      const t = audio.currentTime + at, peak = accent ? 0.22 : 0.12;
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(peak, t + 0.03); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f).connect(v).connect(audio.destination); o.start(t); o.stop(t + dur + 0.03);
    }
    const BEAT = 0.42;
    function playPhrase(p, at = 0) { const d = (4 * BEAT) / p.notes.length; p.notes.forEach((h, j) => { if (!isRest(p, j)) note(p.seat, h, at + j * d, j + 1 === accentOf(p), d); }); }
    function listen(slots, then) {
      if (st.playing) return;
      const t0 = performance.now(), n = slots.length;
      slots.forEach((p, i) => p && playPhrase(p, i * 4 * BEAT));
      const tick = () => {
        const beat = (performance.now() - t0) / 1000 / BEAT;
        st.playing.head = beat; drawMem();
        if (beat >= n * 4) { st.playing = null; drawMem(); if (then) then(); return; }
        st.playing.raf = requestAnimationFrame(tick);
      };
      st.playing = { head: 0, raf: requestAnimationFrame(tick) };
    }

    // ---- layout: one row of slots when wide, two rows when narrow --------------------------------
    const SW = 115;
    let narrow = false;
    const geom = () => { const cols = narrow && N === 8 ? 4 : N, rows = Math.ceil(N / cols); return { n: N, cols, rows, w: 60 + cols * SW, h: rows * 280 + 20 }; };
    const slotXY = (i) => { const G = geom(); return { x: 40 + (i % G.cols) * SW, y: Math.floor(i / G.cols) * 280 }; };
    const Y = (h, oy) => oy + 250 - h * 38;
    const beadX = (p, x, w, j) => x + (w / p.notes.length) * (j + 0.5);
    function beadsSvg(p, x, w, oy, ghost, hit) {
      const col = SEATS[p.seat].col;
      const pts = p.notes.map((h, j) => (isRest(p, j) ? null : `${beadX(p, x, w, j)},${Y(h, oy)}`)).filter(Boolean);
      let s = pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="${col}" stroke-width="2" opacity="${ghost ? 0.4 : 0.8}"/>` : "";
      let prev = 3;
      p.notes.forEach((h, j) => {
        const cx = beadX(p, x, w, j);
        if (isRest(p, j)) {
          // a silent beat: a hollow ring on the strand (his hollow beads sit on the middle strand)
          const cy = Y(p.hollow ? 3 : prev, oy);
          s += `<circle cx="${cx}" cy="${cy}" r="9" fill="${p.hollow ? "rgba(13,26,48,.9)" : "none"}" stroke="${p.hollow ? "#8a93a3" : col}" stroke-width="2.5" stroke-dasharray="${p.hollow ? "" : "3 3"}" opacity="${ghost ? 0.45 : 1}"${hit ? ` data-beat="${j}"` : ""}/>`;
          return;
        }
        prev = h;
        const r = j + 1 === accentOf(p) ? 12 : 8;
        s += `<circle cx="${cx}" cy="${Y(h, oy)}" r="${r}" fill="${col}" stroke="#0b1424" stroke-width="2" opacity="${ghost ? 0.45 : 1}" ${ghost ? 'stroke-dasharray="3 3"' : ""}${hit ? ` data-beat="${j}"` : ""}/>`;
        if (!ghost) s += `<circle cx="${cx - r * 0.35}" cy="${Y(h, oy) - r * 0.35}" r="${r * 0.3}" fill="#fff" opacity=".6" pointer-events="none"/>`;
        if (hit && st.restMode) s += `<circle cx="${cx}" cy="${Y(h, oy)}" r="17" fill="rgba(127,178,224,.12)" stroke="#7FB2E0" stroke-dasharray="2 4" data-beat="${j}"/>`;
      });
      return s;
    }
    function drawMem() {
      const G = geom();
      mem.setAttribute("viewBox", `0 0 ${G.w} ${G.h}`);
      let s = "";
      for (let r = 0; r < G.rows; r++) {
        const oy = r * 280;
        if (memUrl) s += `<image href="${memUrl}" x="6" y="${oy + 14}" width="${G.w - 12}" height="272" preserveAspectRatio="none" opacity=".8"/>`;
        s += `<rect x="20" y="${oy + 20}" width="${G.w - 40}" height="260" rx="40" fill="#fff" opacity="${memUrl ? 0 : 0.05}" stroke="#7FB2E0" stroke-opacity=".35"/>`;
        for (let h = 1; h <= 5; h++) s += `<line x1="30" x2="${G.w - 30}" y1="${Y(h, oy)}" y2="${Y(h, oy)}" stroke="#7FB2E0" stroke-opacity="${h === 1 && SG > 0 ? 0.6 : 0.18}"/><text x="30" y="${Y(h, oy) + 5}" font-size="14" fill="#7FB2E0" text-anchor="end" opacity=".75">${h}</text>`;
      }
      if (SG > 0) {
        const a = slotXY(0), z = slotXY(3), hi = Math.min(5, lastHeight + 1), lo = Math.max(1, lastHeight - 1);
        s += `<rect x="${a.x + 8}" y="${Y(hi, a.y) - 14}" width="${(SW - 12) / 4 - 4}" height="${(hi - lo) * 38 + 28}" rx="12" fill="#7ed38a" opacity=".14" stroke="#7ed38a" stroke-opacity=".6" stroke-dasharray="4 4"/>`;
        s += `<text x="${a.x + 4}" y="${a.y + 34}" font-size="14" fill="#7ed38a">start near ${lastHeight}</text>`;
        s += `<circle cx="${z.x + 6 + (SW - 12) * 7 / 8}" cy="${Y(1, z.y)}" r="17" fill="none" stroke="#F2B544" stroke-width="2" stroke-dasharray="4 4"/><text x="${z.x + SW - 4}" y="${z.y + 34}" font-size="14" fill="#F2B544" text-anchor="end">home</text>`;
      }
      for (let i = 0; i < G.n; i++) {
        const { x, y: oy } = slotXY(i), p = st.slots[i];
        const fixedHere = p && !movable(p);
        s += `<g role="button" tabindex="0" data-slot="${i}" aria-label="Slot ${i + 1}${p ? ", " + (p.hollow ? "the one who fears: silence" : SEATS[p.seat].short + " " + p.notes.map((h, j) => (isRest(p, j) ? "rest" : h)).join(" ")) : ", empty"}">`;
        s += `<rect class="${P}hit" x="${x + 3}" y="${oy + 40}" width="${SW - 6}" height="230" rx="22" fill="${p ? "rgba(255,255,255,.03)" : st.sel ? "rgba(242,181,68,.12)" : "rgba(255,255,255,.06)"}" stroke="${st.sel && !fixedHere ? "#F2B544" : "#7FB2E0"}" stroke-opacity="${st.sel && !fixedHere ? 0.7 : 0.3}" stroke-dasharray="${p ? "" : "6 6"}"/>`;
        if (p) s += beadsSvg(p, x + 6, SW - 12, oy, false, SG > 0);
        else if (st.ghost && st.ghost.slot === i) s += beadsSvg(st.ghost.p, x + 6, SW - 12, oy, true);
        s += `<text x="${x + SW / 2}" y="${oy + 292 - 8}" font-size="14" text-anchor="middle" fill="${p ? (p.hollow ? "#8a93a3" : SEATS[p.seat].col) : "#7FB2E0"}" opacity=".9">${p ? (p.hollow ? "HIS GAP" : SEATS[p.seat].short.toUpperCase()) : i + 1}</text></g>`;
      }
      for (const jn of joins(st.slots)) {
        const a = st.slots[jn.i], b = st.slots[jn.j], k = jn.kind, col = k === "smooth" ? "#7ed38a" : k === "rough" ? "#f0a640" : "#9a9a9a";
        const pa = slotXY(jn.i), pb = slotXY(jn.j);
        let ja = a.notes.length - 1; while (isRest(a, ja)) ja--; let jb = 0; while (isRest(b, jb)) jb++;
        const x1 = beadX(a, pa.x + 6, SW - 12, ja), x2 = beadX(b, pb.x + 6, SW - 12, jb), y1 = Y(lastNote(a), pa.y), y2 = Y(firstNote(b), pb.y);
        const dash = k === "break" ? 'stroke-dasharray="4 6"' : jn.across ? 'stroke-dasharray="14 5"' : "";
        if (pa.y === pb.y) s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" ${dash} pointer-events="none"/>`;
        else s += `<line x1="${x1}" y1="${y1}" x2="${G.w - 22}" y2="${y1}" stroke="${col}" stroke-width="5" ${dash}/><line x1="22" y1="${y2}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="5" ${dash}/>`;
        if (jn.call) s += `<text x="${pa.y === pb.y ? pb.x : G.w - 34}" y="${pa.y + 36}" font-size="18" text-anchor="middle" fill="#F2B544">≈</text>`;
      }
      if (st.playing) { const i = Math.min(G.n - 1, Math.floor(st.playing.head / 4)), p0 = slotXY(i), x = p0.x + 6 + (st.playing.head - i * 4) * ((SW - 12) / 4); s += `<line x1="${x}" x2="${x}" y1="${p0.y + 30}" y2="${p0.y + 275}" stroke="#7FB2E0" stroke-width="4" opacity=".85"/>`; }
      mem.innerHTML = s;
      const sc = score(st.slots), h = sc.h;
      top.querySelector("i").style.width = h + "%";
      top.querySelector("i").style.background = h >= GOAL ? "#7ed38a" : h <= 40 ? "#9a9a9a" : "#f0a640";
      top.querySelector("b").textContent = String(h);
      singBtn.disabled = !canSing() || st.over;
      hintBtn.textContent = `Ask the one who dreams (${st.hints})`;
      hintBtn.disabled = st.hints <= 0 || st.over;
      restBtn.textContent = SG === 2 ? "Rest bead (none left)" : `Rest bead (${Math.max(0, 4 - restCount())} left)`;
      restBtn.setAttribute("aria-pressed", String(st.restMode)); restBtn.disabled = st.over;
      top.querySelector("h2").textContent = SG === 0 ? "Marrow-Song · verse one" : SG === 1 ? "Marrow-Song · the heart verse" : "Marrow-Song · three voices and a gap";
    }
    // Sing is offered once the verse is set; whether it holds is the player's to judge
    function canSing() {
      if (SG === 0) return st.slots.some((p) => p && p.seat === 0);
      if (!st.slots.every(Boolean)) return false;
      const seats = st.slots.map((p) => p.seat), brothers = new Set(seats.filter((x) => x < 4));
      return new Set(seats).size === 4 && brothers.size >= 3 && (SG === 1 || seats.includes(3));
    }
    function drawTrays() {
      const fa = document.activeElement, keep = fa && trays.contains(fa) && fa.dataset ? fa.dataset.id : null;
      trays.innerHTML = "";
      SEATS.forEach((seat, s) => {
        const list = pool().filter((q) => q.seat === s); if (!list.length) return;
        const t = document.createElement("div"); t.className = P + "tray"; t.style.borderColor = seat.col;
        const pic = (id, cls) => (artUrl(api, id) ? `<img alt="" ${cls ? `class="${cls}"` : ""} src="${artUrl(api, id)}">` : "");
        const gone = SG === 2 && s === 3;
        t.innerHTML = `<h3 style="color:${seat.col}">${s === 4 ? pic("small-one") : pic(`seat-${seat.t}-${SG === 0 ? "blue" : gone ? "blue" : "turning"}`)}${s === 4 ? "" : pic("ui-glyph-" + seat.t, P + "sm")}<span>${seat.name}${gone ? " · gone" : ""}</span>${pic(gone ? "bead-hollow" : s === 4 ? "" : "bead-" + seat.t, P + "sm")}</h3>${gone ? `<span class="${P}tag">his phrase keeps its slot, and sounds as silence</span>` : s === 4 ? `<span class="${P}tag">your phrase, with one note wrong; it breaks one join, and it is the only phrase he will remember</span>` : ""}<div class="${P}ph"></div>`;
        for (const p of list) {
          const placed = st.slots.includes(p);
          const b = document.createElement("button"); b.type = "button"; b.className = P + "phr"; b.dataset.id = p.id;
          b.setAttribute("aria-pressed", String(st.sel === p)); b.setAttribute("aria-label", p.hollow ? `His hollow phrase: four silent beats${placed ? ", placed" : ""}` : `Phrase ${p.notes.map((h) => h || "rest").join(" ")}${p.accent ? `, accent on beat ${p.accent}` : ""}${p.id === "board" ? ", the row you left on the board" : ""}${placed ? ", placed" : ""}`);
          b.disabled = !movable(p) || placed || st.over;
          if (p.id === "board") b.title = "the row you left on the board";
          const mini = (v) => (v - 50) * 0.24 + 12;
          b.innerHTML = `<svg width="96" height="64" viewBox="0 0 92 64">${beadsSvg(p, 2, 88, 0, placed).replace(/cy="(\d+(\.\d+)?)"/g, (m, v) => `cy="${mini(+v)}"`).replace(/points="([^"]+)"/, (m, pts) => `points="${pts.split(" ").map((xy) => { const [x, y] = xy.split(","); return `${x},${mini(+y)}`; }).join(" ")}"`)}</svg>${p.id === "board" ? `<span class="${P}tag" style="margin:0">from the board</span>` : ""}`;
          t.querySelector("." + P + "ph").appendChild(b);
        }
        trays.appendChild(t);
      });
      if (keep) { const b = trays.querySelector(`[data-id="${keep}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); }
    }
    const redraw = () => { drawMem(); drawTrays(); };
    const verdict = () => {
      if (SG === 0 || !st.slots.every(Boolean)) return "";
      const v = holds(st.slots);
      return !v.near ? ` It does not begin near ${lastHeight}.` : !v.home ? " It does not end home." : v.sc.breaks ? " A join breaks." : v.win ? " It holds." : " It holds, roughly.";
    };

    // ---- placing --------------------------------------------------------------------------------
    function place(p, i) {
      if (st.over || !movable(p)) return;
      const cur = st.slots[i];
      if (cur && !movable(cur)) { say.textContent = "That slot holds a brother's phrase. You can only move your own."; flourish(mem, P + "bad", RM, 450); return; }
      const old = st.slots.indexOf(p);
      if (old >= 0) st.slots[old] = cur && SG > 0 ? cur : null;
      // one phrase from each brother: a second from the same seat sends the first back to its tray
      if (SG > 0) st.slots.forEach((q, k) => { if (q && q !== p && k !== i && q.seat === p.seat) st.slots[k] = null; });
      st.slots[i] = p; st.sel = null; st.ghost = null;
      if (restCount() > 4) { p.rest.clear(); }
      const mine = joins(st.slots).filter((x) => x.i === i || x.j === i);
      const bad = mine.some((x) => x.kind === "break"), good = mine.some((x) => x.kind === "smooth");
      say.textContent = (p.hollow ? "His gap stands here." : mine.length ? `Joins ${mine.map((x) => `${x.i === i ? "out" : "in"}${x.across ? " across the gap" : ""}: ${x.kind}`).join(", ")}.` : "Placed.") + verdict();
      if (bad) flourish(mem, P + "bad", RM, 450); else if (good) flourish(mem, P + "ok", RM, 600);
      playPhrase(p);
      redraw();
      if (SG === 0 && harmony(st.slots) >= GOAL) beats.show("The verse holds. You can hear the oars in it already.", 3400, "true1");
      if (SG > 0 && st.slots.every(Boolean) && holds(st.slots).win) beats.show(SG === 2 && st.slots[3].hollow ? "It comes home, and then there is one beat more that nobody sings." : "It comes home. Low, on the first note any of you ever learned.", 3800, "home");
      if (p.seat === 4) beats.show("He hums it from his alcove every night, and one note of it is wrong. It breaks a join wherever it stands. It is the only phrase he will remember.", 5600, "child", "The small one's phrase");
      if (p.hollow) beats.show("Nobody says his name. The phrase is set down with nothing on it, and the verse makes room.", 4600, "gap", "The hollow bead");
    }
    function takeBack(i) {
      const cur = st.slots[i]; if (!movable(cur)) return;
      st.slots[i] = null; if (!cur.hollow) cur.rest.clear(); say.textContent = "Taken back to the tray."; redraw();
    }
    function toggleRest(i, j) {
      const p = st.slots[i]; if (!p || st.over || SG === 0) return;
      if (SG === 2) { say.textContent = "His silence has taken the verse's four rests. There are none left to place."; flourish(mem, P + "bad", RM, 450); return; }
      if (p.hollow || p.notes[j] === 0 || j >= p.notes.length) return;
      if (p.rest.has(j)) { p.rest.delete(j); say.textContent = "The bead sounds again." + verdict(); }
      else if (restCount() >= 4) { say.textContent = "At most four rest beads in a verse."; flourish(mem, P + "bad", RM, 450); return; }
      else { p.rest.add(j); say.textContent = "A rest bead: that beat is silent, and the join is read from the bead beside it." + verdict(); beats.show("A silent beat. Nobody rows on it. Whatever listens to this song will learn where it falls.", 4600, "rest1", "The rest bead"); }
      redraw();
      if (st.slots.every(Boolean) && holds(st.slots).win) beats.show("It comes home. Low, on the first note any of you ever learned.", 3800, "home");
    }
    on(trays, "click", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      const p = pool().find((q) => q.id === b.dataset.id);
      st.sel = st.sel === p ? null : p; if (st.sel) say.textContent = "Now tap a slot in the verse."; playPhrase(p); redraw();
    });
    on(mem, "click", (e) => {
      const g = e.target.closest("[data-slot]"); if (!g || dragMoved || !st.started) return;
      const i = +g.dataset.slot, cur = st.slots[i];
      if (st.sel) place(st.sel, i);
      else if (st.restMode && cur && e.target.dataset && e.target.dataset.beat != null) toggleRest(i, +e.target.dataset.beat);
      else if (st.restMode && cur) say.textContent = "Tap a bead to make it a rest.";
      else if (movable(cur)) takeBack(i);
      else if (cur) playPhrase(cur);
    });
    on(mem, "keydown", (e) => {
      const t = e.target; if (!t.dataset || t.dataset.slot == null) return;
      const i = t.dataset.slot, refocus = () => later(() => { const n = mem.querySelector(`[data-slot="${i}"]`); n && n.focus(); }, 0);
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const cur = st.slots[+i]; if (st.sel) place(st.sel, +i); else if (movable(cur)) takeBack(+i); else if (cur) playPhrase(cur); refocus(); }
      else if (/^[1-5]$/.test(e.key) && SG > 0 && st.slots[+i]) { e.preventDefault(); e.stopPropagation(); toggleRest(+i, +e.key - 1); refocus(); }
    });
    let drag = null, dragMoved = false;
    on(trays, "pointerdown", (e) => {
      const b = e.target.closest("." + P + "phr"); if (!b || b.disabled) return;
      drag = { p: pool().find((q) => q.id === b.dataset.id), x: e.clientX, y: e.clientY, el: null }; dragMoved = false;
    });
    on(window, "pointermove", (e) => {
      if (!drag) return;
      if (!drag.el && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.el = document.createElement("div"); drag.el.className = P + "drag";
        drag.el.innerHTML = trays.querySelector(`[data-id="${drag.p.id}"]`).innerHTML; wrap.appendChild(drag.el); dragMoved = true;
      }
      if (drag.el) { drag.el.style.left = e.clientX - 46 + "px"; drag.el.style.top = e.clientY - 32 + "px"; }
    });
    on(window, "pointerup", (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.el) {
        d.el.remove();
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const g = hit && hit.closest && hit.closest("[data-slot]");
        if (g) place(d.p, +g.dataset.slot);
        later(() => { dragMoved = false; }, 0);
      }
    });
    const setRestMode = (v) => { st.restMode = v; st.sel = null; say.textContent = v ? (SG === 2 ? "His silence has taken the verse's four rests." : "Tap a bead in the verse to make it silent. Tap it again to sound it.") : ""; redraw(); };
    on(top, "click", (e) => {
      const b = e.target.closest("button"); if (!b || st.over || !st.started) return;
      if (b.dataset.a === "listen") listen(st.slots.slice());
      if (b.dataset.a === "hint") hint();
      if (b.dataset.a === "sing") sing();
      if (b.dataset.a === "rest") setRestMode(!st.restMode);
    });
    function hint() {
      if (st.hints <= 0) return;
      const target = SG === 0 ? solution : heart.chain;
      let i = target.findIndex((q, k) => q && movable(q) && st.slots[k] !== q && !st.slots[k] && !st.slots.includes(q));
      if (i < 0) i = target.findIndex((q, k) => q && movable(q) && st.slots[k] !== q);
      if (i < 0) {
        if (SG === 1 && heart.restAt && !heart.chain[heart.restAt[0]].rest.has(3)) { st.hints--; say.textContent = `The one who dreams sings slot ${heart.restAt[0] + 1} and stops one bead short. He looks at you.`; beats.show("He leaves the last bead of it unsung, and the next phrase comes in clean.", 3600, null, "The one who dreams"); redraw(); return; }
        say.textContent = "The one who dreams hums along: he has nothing to add."; return;
      }
      st.hints--;
      const p = target[i]; st.ghost = { p, slot: i }; st.sel = p;
      if (st.slots.includes(p)) st.slots[st.slots.indexOf(p)] = null;
      say.textContent = `The one who dreams hums a placement for slot ${i + 1}. Tap the slot to accept.`; redraw();
      beats.show(p.hollow ? "He does not hum. He points at the last slot, and looks away." : "He hums it once, low, and looks at the slot.", 2600, null, "The one who dreams");
    }

    // ---- the set-piece: The First Listen ----------------------------------------------------------
    // Twelve growths, three to a brother. In the teach they all answer verse one at once; in the twist
    // the picture returns with the three that were the one who fears's left dark.
    let flEl = null;
    function firstListen(dark, then) {
      flEl = document.createElement("div"); flEl.className = P + "fl"; flEl.setAttribute("role", "dialog"); flEl.setAttribute("aria-label", "The First Listen");
      const bg = artUrl(api, "chapter-3");
      let g = "";
      for (let k = 0; k < 12; k++) {
        const seat = k % 4, x = 60 + k * 62 + (k % 2) * 8, hgt = 150 + ((k * 37) % 70), col = SEATS[seat].col, dk = dark && seat === 3;
        g += `<g class="${P}gr${dk ? " " + P + "dk" : ""}"><path d="M${x},330 C${x - 14},${330 - hgt * 0.5} ${x + 14},${330 - hgt * 0.8} ${x},${330 - hgt}" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${330 - hgt - 16}" rx="17" ry="24" fill="${col}"/><ellipse cx="${x}" cy="${330 - hgt - 16}" rx="42" ry="52" fill="${col}" opacity=".22"/></g>`;
      }
      flEl.innerHTML = `<div class="${P}hol" style="${bg ? `background-image:linear-gradient(rgba(10,19,34,.72),rgba(10,19,34,.72)),url(${bg})` : ""}"><svg viewBox="0 0 820 410" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg></div>
<p aria-live="polite"><b>The First Listen</b>${dark ? "The first night, every growth in the hollow answered at once. You remember the sound of it as you sing." : "You sing verse one whole, the four of you, for the first time."}</p><button type="button" class="${P}btn ${P}sing">${dark ? "Sing" : "Listen"} <small>Enter</small></button>`;
      try { wrap.scrollTop = 0; } catch { /* keep the card in view */ }
      wrap.appendChild(flEl);
      const b = flEl.querySelector("button"); let step = 0;
      const go = () => {
        if (step === 0) {
          step = 1; flEl.querySelector("." + P + "hol").classList.add(P + "lit");
          st.slots.forEach((p) => p && playPhrase(p, 0));   // all of it at once: the hollow's answer
          flEl.querySelector("p").innerHTML = dark ? "<b>The First Listen</b>Nine lights, and three that stay dark. The river gives the song back with three voices, and a gap that keeps its place."
            : "<b>The First Listen</b>Every growth in the hollow answers at once: twelve lights, one chord, your four voices given back as one. Nobody has told you it would do that.";
          b.innerHTML = "Go on <small>Enter</small>";
        } else { flEl.remove(); flEl = null; then(); }
      };
      on(b, "click", go);
      b.focus();
    }

    // ---- singing --------------------------------------------------------------------------------
    function sing() {
      if (st.over || !canSing()) return;
      if (st.playing) { cancelAnimationFrame(st.playing.raf); st.playing = null; }
      st.over = true; st.sel = null; st.ghost = null; st.restMode = false;
      if (SG === 0) {
        st.slots = companionFill(st.slots, phrases);
        say.textContent = "Your brothers fill the empty slots, and the four of you sing it whole.";
        redraw();
        const h1 = harmony(st.slots), lh = lastNote(st.slots[7]);
        try { api.store.set("lastHeight", lh); } catch { /* storage off */ }
        if (h1 <= 40) return finish();
        firstListen(false, finish);
      } else {
        redraw();
        if (SG === 1) sh.set("song", { rests: restCount(), child: st.slots.some((p) => p.seat === 4), board: st.slots.some((p) => p.id === "board") });
        say.textContent = SG === 2 ? "The three of you sing it, and keep his beat empty." : "The four of you sing it, quietly, so the river will not hear.";
        const after = () => (SG === 2 && holds(st.slots).win ? firstListen(true, finish) : finish());
        if (audio && !RM) listen(st.slots, after); else after();
      }
    }
    function finish() {
      st.over = true;
      if (SG === 0) {
        const h1 = harmony(st.slots), mine = st.slots.filter((p) => p && p.seat === 0).length;
        const yours = `${mine === 1 ? "One of its phrases is" : `${mine} of its phrases are`} yours.`;
        ctl.end(h1 <= 40 ? { outcome: "lose", text: `Verse one: harmony ${h1}. It breaks in too many places to row to; on the river every brother's window will narrow by 10 ms.` }
          : { outcome: h1 >= GOAL ? "win" : "done", text: `${h1 >= GOAL ? `Verse one holds (${h1}), and the hollow gave it back at once: on the river every brother's window widens by 15 ms.` : `Verse one is a song you can row to (${h1}), though it does not hold all the way.`} ${yours}` },
          () => endCard(wrap, api, "chapter-3", { numeral: "numeral-3" }));
        return;
      }
      const v = holds(st.slots), sc = v.sc;
      const lost = st.auto || !v.near || !v.home || sc.breaks >= 2;
      let text;
      if (st.auto) text = "The pool ran out before the verse was set. The current takes the raft, and the four of you row on with a song that has no ending.";
      else if (!v.home) text = "The verse does not come home. Its last sounded bead hangs above the lowest strand, and there is no note to hold on at the heart.";
      else if (!v.near) text = `The verse does not begin where verse one ended. Nobody can find the first note of it, and it is left unsung.`;
      else if (sc.breaks >= 2) text = `The verse breaks in ${sc.breaks} places. It cannot be rowed to.`;
      else if (SG === 1) {
        const rests = restCount();
        text = `${v.win ? `The heart verse comes home without a stumble (${sc.h}); its last note falls on the sixteenth beat.` : `The heart verse comes home, though it stumbles on the way (${sc.h}).`}${rests ? ` ${rests === 1 ? "One beat of it is" : `${rests} beats of it are`} silent. On the river the eye will open there, where nobody rows.` : ""}${sc.child ? " One phrase of it is the small one's, wrong note and all. It is the only phrase he will remember." : ""}${st.slots.some((p) => p.id === "board") ? " One phrase of it is the row you left on the board." : ""}`;
      } else {
        const last = st.slots[3].hollow;
        text = `${v.win ? "Three voices, and every join holds." : "Three voices, and one join that drags."} ${last ? "The song ends on his gap: the three of you stop, and the last beat is his." : "His silence sits inside the song, and the song closes over it and comes home."} ${last ? "Nobody decided it aloud." : "Nobody looks at the empty seat while you sing it."}`;
      }
      ctl.end({ outcome: lost ? "lose" : v.win ? "win" : "done", text }, () => endCard(wrap, api, "chapter-7", { numeral: "numeral-7" }));
    }

    on(intro.querySelector("." + P + "start"), "click", () => {
      intro.remove(); st.started = true;
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
      if (SG === 0) beats.show("“Sing it whole.”", 2600, "elder", "The elder");
      if (SG === 1) {
        beats.show("The heart verse: one phrase from each of you, in an order you choose. It must begin near where verse one ended, and end home, on the lowest bead.", 5600, "heart2", "The heart verse");
        if (linkBoard) later(() => beats.show(`Your row at the cut, read as five heights: ${heart.all.find((p) => p.id === "board").notes.map((h) => h || "–").join(" · ")}. It lies in your tray. The raft has been humming it since you boarded.`, 7000, "link-board", "Because of the row you left on the board in Bone Counters"), RM ? 0 : 5900);
      }
      if (SG === 2) beats.show("His phrase is in his tray, with nothing on it. It has to stand somewhere.", 4600, "gone", "Three voices");
      say.textContent = SG === 0 ? "Tap one of your blue phrases, then an empty slot." : "Tap a phrase, then a slot. One phrase from each brother.";
      const f = trays.querySelector("button:not(:disabled)"); f && f.focus();
    });
    on(window, "keydown", (e) => {
      if (!st.started || st.over || flEl || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "l") listen(st.slots.slice()); else if (k === "h") hint(); else if (k === "s" && !singBtn.disabled) sing(); else if (k === "r" && SG > 0) setRestMode(!st.restMode);
    });
    const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
    timers.push(setInterval(() => {
      if (!st.started || st.over) return;
      st.time -= 1;
      timerEl.textContent = fmt(Math.max(0, st.time));
      if (st.time === 30) beats.show(SG === 0 ? "The soft timer is nearly out; your brothers will fill the verse." : "The pool is ending. The current takes the raft again soon.", 3200);
      if (st.time <= 0) {
        if (SG === 0) { if (!st.slots.some((p) => p && p.seat === 0)) { const p = phrases.find((q) => q.seat === 0); st.slots[st.slots.indexOf(null)] = p; } sing(); }
        else if (canSing()) sing();
        else { st.auto = true; finish(); }
      }
    }, 1000));
    const mq = matchMedia("(max-width: 640px)");
    const onMq = () => { narrow = mq.matches; drawMem(); };
    on(mq, "change", onMq); narrow = mq.matches;
    redraw();
    timerEl.textContent = fmt(st.time);

    return {
      unmount() {
        timers.forEach((id) => { clearInterval(id); clearTimeout(id); });
        if (st.playing) cancelAnimationFrame(st.playing.raf);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        beats.dispose(); disposeKit();
        if (audio) audio.close().catch(() => {});
        wrap.remove();
      },
    };
  }
}

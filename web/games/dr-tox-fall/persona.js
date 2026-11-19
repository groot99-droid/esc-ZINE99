// Dr. Tox: Fall, 1D game: Persona (DESIGN.md section 11, `g1_persona`; scenes s1_persona_1 and s1_persona_2).
// 1950s romance comic: pastel flats, thought balloons, a heart-shaped panel, a tear on a lash; no dot screen.
//
// Deck-building to a target attachment profile. The target is Aegis; the player is Cally, under the leash.
// His profile is six facets with weights built from Rise (the painted sky 20; the string 10 + 5 per figure from
// Cat's Cradle, up to 30; Cally = reese.bond_cally / 2; Carmy = bond_carmy / 3; Rolan = bond_rolan / 3; amber
// warmth 15), normalised to 100. The player sees the facets only as thought balloons, and the weights only as the
// balloons' size. Cards are gestures and lines, each tagged with one or two facets. Match is how closely a hand's
// facet totals fit the profile, 0 to 100, to one decimal; the author's mark is 94.6.
//
// Page 1, the annex (s1_persona_1): three "days". Each day a draft of three cards, keep one; then the deck deals
// itself one card Cally did not build ("Drop the blade", "Leave the string where it fell", "Paint over the sky").
// Burn it (no effect) or keep it (persona.crack_cards +1, cally.crack +5, and it fits no facet, so the match falls).
// The meter shows a forecast: the best seven the deck can make.
// Page 2, the gala table (s1_persona_2): three exchanges across a table. Each exchange Cally offers one gesture
// (the card is spent) and his small reaction reveals one hidden weight (that card's first facet); then a dealt card
// arrives, burn or keep. Then she plays a hand of seven from what is left; a kept dealt card is already in it. The
// final match is written to cally.bond_aegis. 94.6 needs the whole profile read and every dealt card burned.
//
// There is no failure state in the design ("a low match is a low number"): the page ends with `done` at any
// match below 94.6 and `win` at 94.6 or more. Nothing here says the word for what the kept card is.
//
// Shared flags (data/flags.json): reads reese.bond_cally, reese.bond_carmy, reese.bond_rolan, cradle.figures_made;
// writes persona.match, persona.crack_cards, cally.crack (+5 per kept card, tracked so a replay does not double it),
// cally.bond_aegis (page 2 only); persona.deck (the annex's deck, which the table plays from).
//
// Art (api.art, ASSET_MAP.md "Persona"): persona-page, persona-card-<scarf|string|hand|hum|laugh|light|back>,
// persona-card-<blade|fell|paint> (dealt), persona-heart-panel, persona-balloon-<sky|string|cally|carmy|rolan|amber>,
// persona-meter, persona-tear. Every id falls back to a drawing made here when the bundle lacks it.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): which facets each card is tagged with and
// the split (a card gives one point, shared between its tags); the match formula (100 - 0.25 x the summed distance
// between the hand's facet shares and the profile, less 4 for each dealt card in the hand, so that 94.6 can be reached
// from a good hand and never with a dealt card in it); the starting deck of eight (the string and the warm light are
// missing and must be drafted); the guarantee that a day's draft offers a missing card; hand of seven; the table
// hiding the weights until reaction; Aegis's reaction lines; the captions; the wording of the how-to.

const P = "dtf-pe-";
const INK = "#3B2A4A", CREAM = "#FCF1E6", PINK = "#F6C9D3", ROSE = "#E07A9A", BLUSH = "#F9E3E0", SKYB = "#C5DAF0", GOLD = "#F6E0A8", GOLD2 = "#E8A33A";
const MARK = 94.6, HAND = 7;

const FAC = [
  { k: "sky",    name: "a painted sky",  art: "persona-balloon-sky",    col: "#9CC3E6", side: "L" },
  { k: "string", name: "a loop of string", art: "persona-balloon-string", col: "#C9A0DC", side: "L" },
  { k: "cally",  name: "Cally",          art: "persona-balloon-cally",  col: "#F2A7B8", side: "L" },
  { k: "carmy",  name: "Carmy",          art: "persona-balloon-carmy",  col: "#E8C468", side: "R" },
  { k: "rolan",  name: "Rolan",          art: "persona-balloon-rolan",  col: "#7DB89A", side: "R" },
  { k: "amber",  name: "warm amber light", art: "persona-balloon-amber", col: "#E8A33A", side: "R" },
];
const FI = {}; FAC.forEach((f, i) => { FI[f.k] = i; });

// built cards: a card gives one point, shared between its tags (the first tag is the one an offer reveals)
const TYPES = {
  scarf:  { name: "Sky-blue scarf",       art: "persona-card-scarf",  tags: [["sky", .6], ["cally", .4]] },
  string: { name: "Loop of string",       art: "persona-card-string", tags: [["string", 1]] },
  hand:   { name: "Take his hand",        art: "persona-card-hand",   tags: [["cally", .5], ["rolan", .5]] },
  hum:    { name: "Hum four notes",       art: "persona-card-hum",    tags: [["carmy", .5], ["cally", .5]] },
  laugh:  { name: "Laugh at his joke",    art: "persona-card-laugh",  tags: [["carmy", .5], ["rolan", .5]] },
  light:  { name: "Stand in the warm light", art: "persona-card-light", tags: [["amber", .6], ["sky", .4]] },
};
const TKEYS = Object.keys(TYPES);
const DEAD = {
  blade: { name: "Drop the blade",                  art: "persona-card-blade" },
  fell:  { name: "Leave the string where it fell",  art: "persona-card-fell" },
  paint: { name: "Paint over the sky",              art: "persona-card-paint" },
};
const DKEYS = Object.keys(DEAD);
const isDead = (c) => c.charAt(0) === "x";
const deadKey = (c) => c.slice(2);
const START = ["scarf", "scarf", "hand", "hand", "hum", "hum", "laugh", "laugh"];
const FALLBACK_ADDS = ["string", "light", "scarf"];

// Aegis's small reactions at the table (added): one line per facet when the weight is large, a middling and a low line
const REACT = {
  sky:    "He looks up, at a ceiling, for a sky it does not have.",
  string: "His fingers move on the tablecloth: a loop made, and unmade.",
  cally:  "He almost says something, and laughs at himself instead.",
  carmy:  "He laughs, quick and surprised, and stops, as if someone else had.",
  rolan:  "His shoulders drop an inch. Somebody once stood beside him like that.",
  amber:  "He turns toward the lamp without knowing he has.",
};
const MID = "A small flinch, there and gone.";
const LOW = "Nothing. He nods, politely, the way you nod at a stranger's story.";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = (x) => Math.round(x * 10) / 10;
const fmt = (x) => r1(x).toFixed(1);

// ---- the rules, kept free of the DOM so they can be read on their own ---------------------------------------
function profileFrom(bc, bk, br, fig) {
  const w = [20, Math.min(30, 10 + 5 * fig), bc / 2, bk / 3, br / 3, 15];
  const s = w.reduce((a, b) => a + b, 0) || 1;
  return w.map((x) => x * 100 / s);
}
function matchOf(hand, w) {
  if (!hand.length) return 0;
  const t = [0, 0, 0, 0, 0, 0]; let dead = 0;
  for (const c of hand) {
    if (isDead(c)) { dead++; continue; }
    for (const [f, v] of TYPES[c].tags) t[FI[f]] += v;
  }
  const n = hand.length;
  let l1 = 0;
  for (let i = 0; i < 6; i++) l1 += Math.abs(t[i] * 100 / n - w[i]);
  return clamp(100 - 0.25 * l1 - 4 * dead, 0, 100);
}
// the best hand the deck can make: seven cards, the dealt ones already in it
function bestHand(deck, w, spent) {
  const avail = {}; TKEYS.forEach((k) => { avail[k] = 0; });
  let dead = [];
  for (const c of deck) { if (isDead(c)) dead.push(c); else avail[c]++; }
  if (spent) for (const k of TKEYS) avail[k] = Math.max(0, avail[k] - (spent[k] || 0));
  dead = dead.slice(0, HAND);
  const need = HAND - dead.length;
  let best = { m: -1, hand: [] };
  const cur = [];
  (function rec(i, left) {
    if (left === 0) { const h = cur.concat(dead); const m = matchOf(h, w); if (m > best.m) best = { m, hand: h.slice() }; return; }
    if (i >= TKEYS.length) return;
    const k = TKEYS[i];
    for (let n = Math.min(avail[k], left); n >= 0; n--) {
      for (let j = 0; j < n; j++) cur.push(k);
      rec(i + 1, left - n);
      for (let j = 0; j < n; j++) cur.pop();
    }
  })(0, need);
  if (best.m < 0) { const h = deck.slice(0, HAND); return { m: matchOf(h, w), hand: h }; }
  return best;
}

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, url: () => "" };
    const A = (id) => (art.has && art.has(id) ? art.url(id) : "");
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const rng = (() => { try { const r = api.rng && api.rng(); if (typeof r === "function") return r; } catch (_) { /* fall through */ } return Math.random; })();
    const listeners = [], timers = new Set();
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let dead = false, ro = null;
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch (_) { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch (_) { /* storage off */ } };
    const num = (k, d) => { const v = sget(k, d); return typeof v === "number" && isFinite(v) ? v : d; };
    const stGet = (k, d) => { try { const v = store.get(k, d); return v === undefined || v === null ? d : v; } catch (_) { return d; } };
    const stSet = (k, v) => { try { store.set(k, v); } catch (_) { /* storage off */ } };

    const W = profileFrom(clamp(num("reese.bond_cally", 60), 0, 100), clamp(num("reese.bond_carmy", 50), 0, 100),
      clamp(num("reese.bond_rolan", 50), 0, 100), clamp(num("cradle.figures_made", 3), 0, 4));
    const rankWord = (i) => { const r = W.filter((x) => x > W[i] + 1e-9).length; return r <= 1 ? "large" : r <= 3 ? "middling" : "small"; };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${CREAM};color:${INK};font-family:Georgia,"Times New Roman",serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}wrap *{box-sizing:border-box}
.${P}top{flex:0 0 auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 12px;background:${GOLD};border-bottom:4px solid ${INK};font:italic 700 15px/1.2 Georgia,serif}
.${P}top b{font-size:17px;letter-spacing:.04em;text-transform:uppercase;font-style:normal}
.${P}top .sp{flex:1}
.${P}top .deck{font:italic 13px Georgia,serif}
.${P}main{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:8px 12px 10px}
.${P}col{max-width:1100px;margin:0 auto}
.${P}panel{background:#fff8f0;border:3px solid ${INK};border-radius:10px;padding:6px 8px;margin-bottom:8px;box-shadow:3px 3px 0 ${PINK}}
.${P}mw{position:sticky;top:-8px;z-index:5;background:${CREAM};margin:0 -12px 4px;padding:6px 12px 0;border-bottom:2px solid ${PINK}}
.${P}meter{position:relative;width:100%;max-width:640px;margin:0 auto;aspect-ratio:1000/90}
.${P}meter>img,.${P}meter>.fbm{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}meter .fbm{background:#fff;border:4px solid ${INK};border-radius:20px;inset:44% 6% 14% 6%;width:auto;height:auto}
.${P}meter .fill{position:absolute;left:6.4%;top:47%;height:31%;width:0;max-width:87.2%;background:${ROSE};border-radius:999px;transition:width .35s,background .3s}
.${P}wrap.rm .${P}meter .fill{transition:none}
.${P}meter .fill.hit{background:${GOLD2}}
.${P}meter .num{position:absolute;left:18%;top:-2%;font:italic 800 20px/1 Georgia,serif;letter-spacing:.02em}
.${P}meter .num small{font:italic 12px Georgia,serif;margin-left:6px;opacity:.8}
.${P}meter .mk{position:absolute;left:89.25%;top:30%;height:60%;width:0;border-left:0 solid transparent}
.${P}prof{position:relative;height:330px;margin-bottom:4px}
.${P}wrap:not(.narrow) .${P}col{display:grid;grid-template-columns:1.2fr 1fr;gap:0 14px;align-items:start}
.${P}wrap:not(.narrow) .${P}mw{grid-column:1/-1}
.${P}prof .heart{position:absolute;left:50%;top:40px;width:250px;transform:translateX(-50%);display:block}
.${P}prof .hfb{position:absolute;left:50%;top:6px;width:320px;height:210px;transform:translateX(-50%);background:${PINK};border:4px solid ${INK};border-radius:50% 50% 45% 45%;display:flex;align-items:center;justify-content:center;font:italic 18px Georgia,serif;text-align:center;padding:30px}
.${P}prof .tear{position:absolute;top:56px;left:calc(50% + 96px);width:60px;height:60px}
.${P}prof .tear.drop{animation:${P}tear 1.3s ease-in}
@keyframes ${P}tear{0%{transform:translateY(-6px);opacity:.2}30%{opacity:1}100%{transform:translateY(60px);opacity:.0}}
.${P}wrap.rm .${P}prof .tear.drop{animation:none}
.${P}bal{position:absolute;display:block;transition:width .4s;line-height:0;pointer-events:none}
.${P}wrap.rm .${P}bal{transition:none}
.${P}bal img,.${P}bal .bfb{width:100%;display:block}
.${P}bal .bfb{aspect-ratio:360/210;background:#fff;border:3px solid ${INK};border-radius:50%;display:flex;align-items:center;justify-content:center;font:italic 15px Georgia,serif;text-align:center;line-height:1.1;padding:10px}
.${P}bal .dot{position:absolute;left:6%;top:6%;width:14px;height:14px;border-radius:50%;border:2px solid ${INK}}
.${P}bal.veil img,.${P}bal.veil .bfb{opacity:.45;filter:saturate(.4)}
.${P}bal.veil .q{display:flex}
.${P}bal .q{display:none;position:absolute;inset:0;align-items:center;justify-content:center;font:italic 800 30px Georgia,serif;line-height:1;opacity:.75}
.${P}bal.rev{filter:drop-shadow(0 0 5px ${GOLD2})}
.${P}wrap.narrow .${P}prof{height:auto;display:flex;flex-wrap:wrap;justify-content:center;align-content:flex-start;gap:2px 6px}
.${P}wrap.narrow .${P}prof .heart,.${P}wrap.narrow .${P}prof .hfb{position:relative;left:auto;top:auto;transform:none;width:190px;flex:0 0 100%;margin:0 auto 2px;max-width:190px}
.${P}wrap.narrow .${P}prof .hfb{height:130px;padding:10px;font-size:14px}
.${P}wrap.narrow .${P}prof .tear{left:calc(50% + 70px);top:6px;width:44px;height:44px}
.${P}wrap.narrow .${P}bal{position:relative;left:auto!important;top:auto!important;right:auto!important;flex:0 0 auto}
.${P}h{margin:0 0 4px;font:italic 800 17px/1.2 Georgia,serif}
.${P}h small{font:italic 400 13px Georgia,serif;margin-left:6px}
.${P}row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start}
.${P}card{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0;border:0;background:none;color:${INK};cursor:pointer;touch-action:manipulation;border-radius:12px;font:italic 13px/1.15 Georgia,serif;text-align:center}
.${P}card .pic{position:relative;display:block;line-height:0;border-radius:12px;transition:transform .15s}
.${P}card .pic img{display:block;width:100%;height:auto}
.${P}card:hover:not(:disabled) .pic,.${P}card:focus-visible .pic{transform:translateY(-4px) rotate(-1.2deg)}
.${P}wrap.rm .${P}card .pic{transition:none}
.${P}wrap.rm .${P}card:hover:not(:disabled) .pic,.${P}wrap.rm .${P}card:focus-visible .pic{transform:none}
.${P}card:focus-visible{outline:4px solid ${INK};outline-offset:3px}
.${P}card:disabled{cursor:default;opacity:.34}
.${P}card .cap{display:block;max-width:100%;padding:0 2px}
.${P}card .cap b{display:block;font-weight:800}
.${P}card .cap span{display:block;font-size:12px;opacity:.85}
.${P}card .pic .tg{position:absolute;left:12.5%;width:71%;top:83.5%;height:6.5%;display:flex;align-items:center;justify-content:center;gap:5%}
.${P}card .pic .tg i{height:84%;aspect-ratio:1;border-radius:50%;border:1.5px solid ${INK}}
.${P}card .fb{display:flex;flex-direction:column;align-items:center;justify-content:center;background:${PINK};border:3px solid ${INK};border-radius:12px;padding:8px;font:italic 700 15px/1.15 Georgia,serif;aspect-ratio:240/340;line-height:1.1}
.${P}card .badge{position:absolute;right:-4px;top:-6px;min-width:26px;height:26px;padding:0 6px;border-radius:13px;background:${INK};color:${CREAM};font:800 14px/26px Georgia,serif;text-align:center}
.${P}card.in{animation:${P}pop .28s ease-out}
@keyframes ${P}pop{0%{transform:scale(.88);opacity:.2}100%{transform:scale(1);opacity:1}}
.${P}wrap.rm .${P}card.in{animation:none}
.${P}tray{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:6px 4px;margin:4px 0 2px}
.${P}slot{position:relative;width:64px;border:2px dashed ${INK};border-radius:9px;aspect-ratio:240/340;background:${BLUSH};padding:0;display:block;line-height:0;opacity:.95}
.${P}slot img,.${P}slot .sfb{display:block;width:100%;height:100%;border-radius:7px;object-fit:fill}
.${P}slot .sfb{background:${PINK};font:italic 700 9px/1.1 Georgia,serif;line-height:1.1;padding:3px;display:flex;align-items:center;justify-content:center;text-align:center}
button.${P}slot{cursor:pointer;border-style:solid;touch-action:manipulation}
button.${P}slot:focus-visible{outline:4px solid ${INK};outline-offset:2px}
.${P}slot.lock{border-style:solid;border-color:${INK};box-shadow:0 0 0 3px ${ROSE}}
.${P}slot.lock::after{content:"kept";position:absolute;left:0;right:0;bottom:-18px;font:italic 11px Georgia,serif;line-height:1;text-align:center}
.${P}says{margin:4px auto 2px;max-width:640px;font:italic 15px/1.35 Georgia,serif;text-align:center}
.${P}says b{font-weight:800}
.${P}bar{flex:0 0 auto;padding:6px 12px 8px;background:${PINK};border-top:4px solid ${INK};display:flex;flex-direction:column;gap:6px}
.${P}log{min-height:40px;font:italic 15px/1.3 Georgia,serif;max-width:1100px;width:100%;margin:0 auto}
.${P}log div{font-size:13px;opacity:.6}
.${P}acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:1100px;width:100%;margin:0 auto}
.${P}acts button,.${P}ov button.go{font:italic 800 16px Georgia,serif;min-height:46px;padding:6px 18px;background:#fff;color:${INK};border:3px solid ${INK};border-radius:24px;cursor:pointer;touch-action:manipulation;box-shadow:3px 3px 0 ${INK}}
.${P}acts button.pri,.${P}ov button.go{background:${INK};color:${CREAM}}
.${P}acts button:disabled{opacity:.4;cursor:default}
.${P}acts button:focus-visible,.${P}ov button:focus-visible{outline:4px solid ${GOLD2};outline-offset:2px}
.${P}acts button.glow{box-shadow:0 0 0 4px ${GOLD2},3px 3px 0 ${INK}}
.${P}acts kbd{font:700 11px sans-serif;opacity:.7;margin-left:5px}
.${P}ov{position:absolute;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(59,42,74,.6);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}pcard{max-width:660px;width:100%;margin:auto;background:#fff8f0;border:4px solid ${INK};border-radius:14px;box-shadow:6px 6px 0 ${ROSE};padding:12px 18px 14px}
.${P}pcard img.cv{display:block;width:100%;height:70px;object-fit:cover;object-position:top;border-radius:8px;border:3px solid ${INK};margin-bottom:8px}
.${P}kick{font:italic 700 12px Georgia,serif;letter-spacing:.14em;text-transform:uppercase}
.${P}pcard h2{margin:2px 0 6px;font:italic 800 28px/1.05 Georgia,serif}
.${P}pcard p{margin:0 0 8px;font:15px/1.4 Georgia,serif}
.${P}q{padding-left:10px;border-left:6px solid ${ROSE};font-style:italic}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:5px;font:14px/1.3 Georgia,serif}
.${P}keys li{display:grid;grid-template-columns:92px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${CREAM};font:italic 700 12px Georgia,serif;padding:3px 6px;text-align:center;border-radius:10px}
.${P}seq{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 10px}
.${P}seq button{font:italic 800 14px Georgia,serif;text-align:left;padding:8px 10px;background:#fff;color:${INK};border:3px solid ${INK};border-radius:12px;cursor:pointer;min-height:56px}
.${P}seq button small{display:block;font:italic 400 12px Georgia,serif;margin-top:2px}
.${P}seq button[aria-pressed=true]{background:${INK};color:${CREAM}}
.${P}seq button:focus-visible{outline:4px solid ${GOLD2};outline-offset:2px}
.${P}big{font:italic 800 46px/1 Georgia,serif;margin:4px 0}
.${P}wrap.narrow .${P}pcard{padding:10px 12px}.${P}wrap.narrow .${P}pcard h2{font-size:22px}.${P}wrap.narrow .${P}seq{grid-template-columns:1fr}.${P}wrap.narrow .${P}keys li{grid-template-columns:76px 1fr}
.${P}wrap.narrow .${P}top{font-size:13px;gap:6px}
.${P}wrap:not(.narrow) .${P}slot{width:58px}.${P}wrap.narrow .${P}meter .num{font-size:15px}
.${P}wrap.narrow .${P}slot{width:46px;border-width:2px;border-radius:6px}
.${P}wrap.narrow .${P}tray{gap:4px}
`;
    const topEl = document.createElement("div"); topEl.className = P + "top";
    const mainEl = document.createElement("div"); mainEl.className = P + "main";
    const colEl = document.createElement("div"); colEl.className = P + "col";
    mainEl.appendChild(colEl);
    const bar = document.createElement("div"); bar.className = P + "bar";
    const logEl = document.createElement("div"); logEl.className = P + "log"; logEl.setAttribute("aria-live", "polite");
    const acts = document.createElement("div"); acts.className = P + "acts";
    bar.append(logEl, acts);
    const ov = document.createElement("div"); ov.className = P + "ov";
    wrap.append(css, topEl, mainEl, bar, ov);
    if (RM) wrap.classList.add("rm");
    root.appendChild(wrap);

    // static parts of the column: the meter, the profile (heart panel and balloons), then the phase's own area
    const meterEl = document.createElement("div"); meterEl.className = P + "meter";
    const mUrl = A("persona-meter");
    meterEl.innerHTML = (mUrl ? `<img alt="" aria-hidden="true" src="${mUrl}">` : `<div class="fbm"></div><div style="position:absolute;left:89.25%;top:30%;height:60%;border-left:5px solid ${INK}"></div><div style="position:absolute;left:6%;top:0;font:italic 700 14px Georgia;letter-spacing:.2em">MATCH</div>`) +
      `<div class="fill"></div><div class="num" role="status" aria-live="off"></div>`;
    const fillEl = meterEl.querySelector(".fill"), numEl = meterEl.querySelector(".num");
    const profEl = document.createElement("div"); profEl.className = P + "prof"; profEl.setAttribute("role", "group"); profEl.setAttribute("aria-label", "Aegis's profile: six thought balloons, their size is their weight");
    const hUrl = A("persona-heart-panel"), tUrl = A("persona-tear");
    profEl.innerHTML = (hUrl ? `<img class="heart" alt="His profile, a heart-shaped panel" src="${hUrl}">` : `<div class="hfb">His profile, a heart-shaped panel</div>`) +
      (tUrl ? `<img class="tear" alt="" aria-hidden="true" src="${tUrl}">` : `<div class="tear" style="border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${SKYB};border:3px solid ${INK};width:28px;height:28px"></div>`);
    const tearEl = profEl.querySelector(".tear");
    const balEls = {};
    FAC.forEach((f) => {
      const b = document.createElement("div"); b.className = P + "bal";
      const u = A(f.art);
      b.innerHTML = (u ? `<img alt="" aria-hidden="true" src="${u}">` : `<div class="bfb">${esc(f.name)}</div>`) + `<i class="dot" style="background:${f.col}"></i><span class="q" aria-hidden="true">?</span>`;
      profEl.appendChild(b); balEls[f.k] = b;
    });
    const phaseEl = document.createElement("div");
    const mw = document.createElement("div"); mw.className = P + "mw"; mw.appendChild(meterEl);
    colEl.append(mw, profEl, phaseEl);

    // ---- state ----------------------------------------------------------------------------------------
    let narrow = false, firstFit = true;
    let mode = "intro";          // intro | draft | dealt | offer | final | recap
    let pgNo = 1, day = 0, exch = 0;
    let deck = START.slice();
    let offers = [], dealtCard = null, hand = [], spent = {}, revealed = new Set();
    let lastReact = "";
    let focusKey = null;
    let keptNow = 0;             // dealt cards kept on this run (this sitting)
    let veiled = false;
    let chosenPage = 1;
    const dealtOrder = DKEYS.slice().sort(() => rng() - 0.5);

    const deadCount = () => deck.filter(isDead).length;
    const realCount = (k) => deck.filter((c) => c === k).length - (spent[k] || 0);
    const say = (t, small) => { logEl.innerHTML = `<span>${esc(t)}</span>${small ? `<div>${esc(small)}</div>` : ""}`; };
    const handCards = () => deck.filter(isDead).slice(0, HAND).concat(hand);   // dealt cards kept are already in her hand

    // ---- balloons -------------------------------------------------------------------------------------
    function balWidth(w, mid) {
      const v = mid ? 18 : w;
      const px = 150 + (clamp(v, 6, 30) - 8) * 6.5;
      return Math.round(px * (narrow ? 0.64 : 0.78));
    }
    function placeBalloons() {
      const cnt = { L: 0, R: 0 };
      FAC.forEach((f, i) => {
        const el = balEls[f.k], mid = veiled && !revealed.has(f.k);
        const w = balWidth(W[i], mid);
        el.style.width = w + "px";
        el.classList.toggle("veil", mid);
        el.classList.toggle("rev", veiled && revealed.has(f.k));
        if (!narrow) {
          const slot = cnt[f.side]++;
          const tops = [0, 104, 208];
          el.style.top = tops[slot] + (f.side === "L" ? 0 : 14) + "px";
          if (f.side === "L") { el.style.left = (slot % 2 ? 4 : 0) + "%"; el.style.right = ""; }
          else { el.style.right = (slot % 2 ? 4 : 0) + "%"; el.style.left = ""; }
        } else { el.style.top = ""; el.style.left = ""; el.style.right = ""; }
        const size = mid ? "not yet known" : rankWord(i);
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", `Thought balloon: ${f.name}. ${size === "not yet known" ? "Its size is not yet known." : "It is " + size + "."}`);
      });
    }

    // ---- meter ----------------------------------------------------------------------------------------
    function setMeter(m, label, partial) {
      const v = clamp(m, 0, 100);
      fillEl.style.width = (87.2 * v / 100) + "%";
      fillEl.classList.toggle("hit", r1(v) >= MARK && !partial);
      numEl.innerHTML = `${fmt(v)}${label ? `<small>${esc(label)}</small>` : ""}`;
    }

    // ---- card html ------------------------------------------------------------------------------------
    function cardHtml(key, w, o) {
      o = o || {};
      const d = isDead(key);
      const info = d ? DEAD[deadKey(key)] : TYPES[key];
      const u = A(info.art);
      const tags = d ? "" : `<span class="tg" aria-hidden="true">${info.tags.map(([f]) => `<i style="background:${FAC[FI[f]].col}"></i>`).join("")}</span>`;
      const pic = u ? `<img alt="" aria-hidden="true" src="${u}">${tags}` : `<span class="fb"><b>${esc(info.name)}</b></span>`;
      const tagText = d ? "fits no balloon" : info.tags.map(([f]) => FAC[FI[f]].name).join(" + ");
      return { pic, name: info.name, tagText };
    }
    function cardBtn(key, w, opt) {
      const c = cardHtml(key, w, opt);
      const aria = `${c.name}${opt.count !== undefined ? ", " + opt.count + " left" : ""}. ${c.tagText}.`;
      return `<button type="button" class="${P}card${opt.anim ? " in" : ""}" data-act="${opt.act}" data-k="${opt.k}" ${opt.disabled ? "disabled" : ""} aria-label="${esc(aria)}" style="width:${w}px">` +
        `<span class="pic" style="width:${w}px">${c.pic}${opt.count !== undefined ? `<span class="badge" aria-hidden="true">×${opt.count}</span>` : ""}</span>` +
        `<span class="cap"><b>${esc(c.name)}</b><span>${esc(c.tagText)}</span></span></button>`;
    }
    const slotHtml = (key, lock, i) => {
      const d = isDead(key), info = d ? DEAD[deadKey(key)] : TYPES[key], u = A(info.art);
      const inner = u ? `<img alt="" aria-hidden="true" src="${u}">` : `<span class="sfb">${esc(info.name)}</span>`;
      return lock ? `<span class="${P}slot lock" role="img" aria-label="${esc(info.name)}, kept, in the hand">${inner}</span>`
        : `<button type="button" class="${P}slot" data-act="unplay" data-i="${i}" aria-label="${esc(info.name)}: put back">${inner}</button>`;
    };

    // ---- the phases -----------------------------------------------------------------------------------
    function topLine() {
      const pgT = pgNo === 1 ? "The annex" : "The gala table";
      const prog = mode === "intro" || mode === "recap" ? "" :
        pgNo === 1 ? `Day ${Math.min(day, 3)} of 3` : (mode === "final" ? "The hand" : `Exchange ${Math.min(exch, 3)} of 3`);
      const dd = deadCount();
      topEl.innerHTML = `<b>Persona</b><span>${pgT}${prog ? " · " + prog : ""}</span><span class="sp"></span><span class="deck">deck ${deck.length - (spent && Object.keys(spent).length ? Object.values(spent).reduce((a, b) => a + b, 0) : 0)}${dd ? " · " + dd + " dealt kept" : ""}</span>`;
    }
    function deckStrip() {
      const items = TKEYS.map((k) => `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 6px 2px 0"><i style="display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid ${INK};background:${FAC[FI[TYPES[k].tags[0][0]]].col}"></i>${esc(TYPES[k].name)} ×${realCount(k)}</span>`);
      const dd = deadCount();
      return `<div class="${P}panel" style="font:italic 13px/1.3 Georgia,serif"><b>Deck</b> ${items.join("")}${dd ? `<span>· dealt, kept ×${dd}</span>` : ""}</div>`;
    }
    function forecast() { const b = bestHand(deck, W, spent); return b; }

    function render() {
      if (dead) return;
      placeBalloons(); topLine();
      let html = "", a = "";
      const w = narrow ? 104 : 128;
      if (mode === "draft") {
        html = `<div class="${P}panel"><p class="${P}h">Day ${day} of 3 · draft <small>three cards: keep one. It joins the deck.</small></p><div class="${P}row">` +
          offers.map((k, i) => cardBtn(k, w, { act: "pick", k, key: String(i + 1), anim: !RM })).join("") + `</div></div>` + deckStrip();
        const b = forecast(); setMeter(b.m, "forecast: best seven of this deck", true);
        a = "";
      } else if (mode === "dealt") {
        html = `<div class="${P}panel"><p class="${P}h">The deck dealt itself a card <small>one she did not build.</small></p><div class="${P}row">` +
          cardBtn(dealtCard, narrow ? 150 : 200, { act: "none", k: dealtCard, anim: !RM, disabled: false }).replace('data-act="none"', 'data-act="none" tabindex="-1"') + `</div>` +
          `<p class="${P}says">Burn it, and nothing happens. Keep it, and it sits in her hand, fitting no balloon on the page.</p></div>` + deckStrip();
        a = `<button type="button" class="pri" data-act="burn" data-k="burn">Burn it <kbd>B</kbd></button><button type="button" data-act="keep" data-k="keep">Keep it <kbd>K</kbd></button>`;
        const b = forecast(); setMeter(b.m, "forecast", true);
      } else if (mode === "offer") {
        const stacks = TKEYS.map((k, i) => cardBtn(k, narrow ? 96 : 104, { act: "offer", k, count: realCount(k), disabled: realCount(k) <= 0, key: String(i + 1) })).join("");
        html = `<div class="${P}panel"><p class="${P}h">Exchange ${exch} of 3 · offer a gesture <small>across the table; the card is spent.</small></p>` +
          (lastReact ? `<p class="${P}says"><b>${esc(lastReact)}</b></p>` : `<p class="${P}says">His small reaction will tell her how large one balloon really is. The others are still a guess.</p>`) +
          `<div class="${P}row">${stacks}</div></div>`;
        const b = forecast(); setMeter(b.m, "forecast: best seven left", true);
        a = "";
      } else if (mode === "final") {
        const locked = deck.filter(isDead).slice(0, HAND);
        const need = HAND - locked.length;
        const stacks = TKEYS.map((k, i) => {
          const left = realCount(k) - hand.filter((c) => c === k).length;
          return cardBtn(k, narrow ? 96 : 104, { act: "play", k, count: left, disabled: left <= 0 || hand.length >= need, key: String(i + 1) });
        }).join("");
        const slots = [];
        locked.forEach((c) => slots.push(slotHtml(c, true)));
        hand.forEach((c, i) => slots.push(slotHtml(c, false, i)));
        for (let i = locked.length + hand.length; i < HAND; i++) slots.push(`<span class="${P}slot" aria-hidden="true"></span>`);
        html = `<div class="${P}panel"><p class="${P}h">The hand <small>${hand.length + locked.length} of ${HAND}. Tap a card to lay it down, tap it again to take it back.</small></p>` +
          `<div class="${P}tray" role="group" aria-label="Her hand">${slots.join("")}</div>` +
          (locked.length ? `<p class="${P}says" style="margin-top:20px">${locked.length === 1 ? "A card she kept is already in it." : locked.length + " cards she kept are already in it."}</p>` : "") + `</div>` +
          `<div class="${P}panel"><p class="${P}h">What is left of the deck</p><div class="${P}row">${stacks}</div></div>`;
        const m = matchOf(handCards(), W);
        setMeter(m, hand.length + locked.length < HAND ? "so far" : "this hand", hand.length + locked.length < HAND);
        const full = hand.length >= need;
        a = `<button type="button" data-act="clear" data-k="clear"${hand.length ? "" : " disabled"}>Take it all back</button><button type="button" class="pri${full ? " glow" : ""}" data-act="confirm" data-k="confirm"${full ? "" : " disabled"}>Play this hand <kbd>Enter</kbd></button>`;
      }
      phaseEl.innerHTML = html;
      acts.innerHTML = a;
      // focus: stay on the same control when it still exists, else the first one
      const sel = focusKey ? wrap.querySelector(`[data-k="${focusKey}"]:not(:disabled)`) : null;
      const first = wrap.querySelector(`.${P}acts button:not(:disabled), .${P}card:not(:disabled)[data-act]:not([data-act=none])`);
      const tgt = sel || first;
      if (tgt && ov.hidden) { try { tgt.focus({ preventScroll: true }); } catch (_) { /* gone */ } }
    }

    // ---- flow -----------------------------------------------------------------------------------------
    function newOffers() {
      const have = new Set(deck.filter((c) => !isDead(c)));
      const missing = TKEYS.filter((k) => !have.has(k));
      const pool = TKEYS.slice().sort(() => rng() - 0.5);
      const o = [];
      if (missing.length) o.push(missing[Math.floor(rng() * missing.length)]);
      for (const k of pool) { if (o.length >= 3) break; if (!o.includes(k)) o.push(k); }
      return o.sort(() => rng() - 0.5);
    }
    function nextDealt() {
      const k = dealtOrder[((pgNo === 1 ? day : 3 + exch) - 1) % DKEYS.length];
      dealtCard = "x:" + k;
    }
    function startPage(n) {
      pgNo = n; hand = []; spent = {}; revealed = new Set(); lastReact = ""; focusKey = null; keptNow = 0;
      ov.hidden = true;
      if (n === 1) {
        deck = START.slice(); veiled = false; day = 1; mode = "draft"; offers = newOffers();
        say("Three days in the annex. Read his balloons: the bigger the balloon, the more of him is in it. Keep the card that fits.", "The deck begins with eight gestures. The string and the warm light are not in it.");
      } else {
        const d = sget("persona.deck", null);
        const ok = Array.isArray(d) && d.length >= 8 && d.every((c) => typeof c === "string" && (isDead(c) ? DEAD[deadKey(c)] : TYPES[c]));
        deck = ok ? d.slice() : START.concat(FALLBACK_ADDS);
        veiled = true; exch = 1; mode = "offer";
        say("The gala table. His balloons are folded away; she is not shown his file here. Offer one gesture and watch his face.", ok ? "She plays from the deck she built in the annex." : "No annex was played: the deck is the one the annex would have built.");
      }
      render(); banner(n === 1 ? "THE ANNEX" : "THE GALA TABLE");
    }
    let bannerEl = null;
    function banner(t) {
      if (!bannerEl) {
        bannerEl = document.createElement("div");
        bannerEl.style.cssText = `position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);background:${INK};color:${CREAM};padding:8px 24px;font:italic 800 26px Georgia,serif;letter-spacing:.06em;border-radius:24px;z-index:60;pointer-events:none;opacity:0;transition:opacity .3s;max-width:90%;text-align:center`;
        wrap.appendChild(bannerEl);
      }
      bannerEl.textContent = t;
      if (RM) { bannerEl.style.transition = "none"; bannerEl.style.opacity = ".92"; later(() => { bannerEl.style.opacity = "0"; }, 900); return; }
      bannerEl.style.opacity = ".92"; later(() => { bannerEl.style.opacity = "0"; }, 1100);
    }

    function pick(k) {
      if (mode !== "draft" || !offers.includes(k)) return;
      deck.push(k);
      say(`She keeps "${TYPES[k].name}". It goes in the deck.`);
      focusKey = null; nextDealt(); mode = "dealt"; render();
    }
    function decide(keep) {
      if (mode !== "dealt") return;
      const name = DEAD[deadKey(dealtCard)].name;
      if (keep) {
        deck.push(dealtCard); keptNow++;
        tearEl.classList.remove("drop"); void tearEl.offsetWidth; tearEl.classList.add("drop");
        say(`She keeps "${name}". It fits no balloon on the page.`, "It will be in her hand.");
      } else say(`She burns "${name}". It was never part of the design.`);
      focusKey = null;
      if (pgNo === 1) {
        if (day >= 3) { endAnnex(); return; }
        day++; offers = newOffers(); mode = "draft";
      } else {
        if (exch >= 3) { lastReact = ""; hand = []; mode = "final"; say("Three exchanges. Now the hand: seven cards on the table, and then the number.", `Spent at the table: ${Object.values(spent).reduce((a, b) => a + b, 0)} cards.`); render(); return; }
        exch++; mode = "offer";
      }
      render();
    }
    function offer(k) {
      if (mode !== "offer" || realCount(k) <= 0) return;
      spent[k] = (spent[k] || 0) + 1;
      const f = TYPES[k].tags[0][0], i = FI[f], w = W[i];
      revealed.add(f);
      const line = w >= 20 ? REACT[f] : w >= 14 ? MID : LOW;
      lastReact = line;
      say(`She offers "${TYPES[k].name}". ${line}`, `The balloon for ${FAC[i].name} unfolds: ${rankWord(i)}.`);
      focusKey = null; nextDealt(); mode = "dealt"; render();
    }
    function playCard(k) {
      if (mode !== "final") return;
      const need = HAND - Math.min(HAND, deadCount());
      const left = realCount(k) - hand.filter((c) => c === k).length;
      if (left <= 0 || hand.length >= need) return;
      hand.push(k); say(`"${TYPES[k].name}" goes down.`); render();
    }
    function unplay(i) { if (mode !== "final" || !hand[i]) return; const c = hand.splice(i, 1)[0]; say(`"${TYPES[c].name}" is taken back.`); render(); }

    // ---- flags ----------------------------------------------------------------------------------------
    function commit(match, final) {
      sset("persona.deck", deck.slice());
      sset("persona.match", r1(match));
      const kept = deadCount();
      sset("persona.crack_cards", kept);
      // cally.crack: +5 for each dealt card kept, tracked so a replay changes it by the difference only
      const applied = stGet("kept_applied", 0);
      const cur = num("cally.crack", 20);
      sset("cally.crack", clamp(cur + 5 * (kept - (typeof applied === "number" ? applied : 0)), 0, 100));
      stSet("kept_applied", kept);
      if (final) sset("cally.bond_aegis", clamp(r1(match), 0, 100));
    }
    function endAnnex() {
      mode = "recap"; render();
      const b = bestHand(deck, W, {});
      commit(b.m, false);
      const need = deadCount() ? "A dealt card in the hand costs the number." : "";
      ov.hidden = false;
      ov.innerHTML = `<div class="${P}pcard" role="dialog" aria-label="The annex is done"><div class="${P}kick">The annex · three days</div>
<h2>The deck is built</h2>
<p>The best seven it can make read <b>${fmt(b.m)}</b> against his file; the program's mark is ${MARK}. This is a forecast. At the table he will not hold still. ${esc(need)}</p>
<p style="font-size:13px;opacity:.8">${deck.length} cards${deadCount() ? ", " + deadCount() + " of them dealt and kept" : ""}.</p>
<div class="${P}acts" style="justify-content:flex-start"><button type="button" class="go" data-act="table" data-k="table">To the gala table</button><button type="button" class="go" data-act="leave" data-k="leave" style="background:#fff;color:${INK}">Leave it here</button></div></div>`;
      const g = ov.querySelector("[data-act=table]"); if (g) g.focus({ preventScroll: true });
      mode = "recap"; endAfter = b.m;
    }
    let endAfter = 0;
    function confirmHand() {
      if (mode !== "final") return;
      const locked = deck.filter(isDead).slice(0, HAND);
      if (hand.length < HAND - locked.length) return;
      const hc = handCards();
      const m = matchOf(hc, W);
      const final = r1(m);
      commit(m, true);
      const won = final >= MARK;
      mode = "recap";
      setMeter(m, "this hand", false); say(`Seven cards down. ${fmt(m)}.`);
      const dd = hc.filter(isDead).length;
      const text = won
        ? `Seven cards face up on the cloth, and he does not look away. The page reads ${fmt(m)} and calls it a person.`
        : `Seven cards face up on the cloth. He is kind to her. The page reads ${fmt(m)}, which is a number and not yet a name.` + (dd ? ` There ${dd === 1 ? "is a card" : "are cards"} in the hand that no balloon asked for.` : "");
      later(() => { if (!dead) api.end({ outcome: won ? "win" : "done", text }); }, RM ? 100 : 700);
    }
    function leave() { api.end({ outcome: "done", text: `The deck is built. The best seven it can make read ${fmt(endAfter)} against his file. The table is not set.` }); }

    // ---- input ----------------------------------------------------------------------------------------
    on(wrap, "click", (e) => {
      const t = e.target.closest && e.target.closest("[data-act]");
      if (!t || !wrap.contains(t) || t.disabled) return;
      const act = t.dataset.act, k = t.dataset.k;
      focusKey = k;
      if (act === "pick") pick(k);
      else if (act === "burn") decide(false);
      else if (act === "keep") decide(true);
      else if (act === "offer") offer(k);
      else if (act === "play") playCard(k);
      else if (act === "unplay") unplay(+t.dataset.i);
      else if (act === "clear") { hand = []; say("The table is cleared."); render(); }
      else if (act === "confirm") confirmHand();
      else if (act === "table") startPage(2);
      else if (act === "leave") leave();
    });
    on(window, "keydown", (e) => {
      if (dead || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!ov.hidden && mode !== "recap") return;
      const key = e.key.toLowerCase();
      if (mode === "draft" && /^[1-3]$/.test(key)) { pick(offers[+key - 1]); e.preventDefault(); }
      else if (mode === "dealt" && (key === "b" || key === "k")) { decide(key === "k"); e.preventDefault(); }
      else if (mode === "offer" && /^[1-6]$/.test(key)) { offer(TKEYS[+key - 1]); e.preventDefault(); }
      else if (mode === "final") {
        if (/^[1-6]$/.test(key)) { playCard(TKEYS[+key - 1]); e.preventDefault(); }
        else if (key === "backspace") { if (hand.length) { hand.pop(); render(); } e.preventDefault(); }
        else if (key === "enter") { const ae = document.activeElement; if (ae && ae.tagName === "BUTTON" && ae.dataset.act && ae.dataset.act !== "confirm") return; confirmHand(); e.preventDefault(); }
      }
    });

    // ---- layout ---------------------------------------------------------------------------------------
    function fit() {
      if (dead) return;
      const nw = wrap.clientWidth < 1000;
      if (nw !== narrow || firstFit) { narrow = nw; firstFit = false; wrap.classList.toggle("narrow", nw); if (mode !== "intro") render(); else placeBalloons(); }
    }
    on(window, "resize", fit);
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => fit()); ro.observe(wrap); }

    // ---- intro ----------------------------------------------------------------------------------------
    function showIntro() {
      mode = "intro"; ov.hidden = false;
      const pu = A("persona-page");
      ov.innerHTML = `<div class="${P}pcard" role="dialog" aria-label="How to play Persona">
${pu ? `<img class="cv" alt="" aria-hidden="true" src="${pu}">` : ""}
<div class="${P}kick">Persona · 1950s romance comic</div><h2>Seventy-two hours to love him</h2>
<p class="${P}q">“SECONDARY APPLICATION: ANY HIGH-VALUE ASSET WITH PRE-EXISTING / ATTACHMENT SIGNATURE. RECOMMENDED CALIBRATION PERIOD: 72HRS.”<br><small style="font-size:12px;opacity:.75">Dr. Tox bible, Part VIII, Scene 3, as the design quotes it.</small></p>
<p>Cally builds a person to fit Aegis's file: six thought balloons, and the bigger the balloon, the more of him is in it. The match is how closely her hand fits. The program's mark is ${MARK}. There is no losing here, only a number.</p>
<ul class="${P}keys">
<li><b>Draft</b><span>Three cards a day: keep one. Tap it, or press 1, 2, 3. A card's coloured dots are the balloons it touches.</span></li>
<li><b>Dealt</b><span>Each round the deck deals itself a card she did not build. Burn it (B) or keep it (K). A kept one fits no balloon and sits in her hand.</span></li>
<li><b>Offer</b><span>At the table the balloons are folded away. Offer one gesture (tap a stack, or 1 to 6): it is spent, and his small reaction shows how large one balloon is.</span></li>
<li><b>The hand</b><span>Lay down seven cards, tap one to take it back, then Play this hand (Enter). The meter fills as you go.</span></li>
</ul>
<p style="font-size:12px;opacity:.75">Reading him whole, and burning every card the deck deals, is the only way to the mark.</p>
<div class="${P}kick">Page</div><div class="${P}seq">
<button type="button" data-pg="1" aria-pressed="${chosenPage === 1}">1. The annex<small>Three days: build the deck.</small></button>
<button type="button" data-pg="2" aria-pressed="${chosenPage === 2}">2. The gala table<small>Three exchanges, then the hand.</small></button></div>
<button type="button" class="go" data-go>Open the page</button></div>`;
      ov.querySelectorAll("[data-pg]").forEach((b) => on(b, "click", () => { chosenPage = +b.dataset.pg; ov.querySelectorAll("[data-pg]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.pg === chosenPage))); }));
      const go = ov.querySelector("[data-go]");
      on(go, "click", () => startPage(chosenPage));
      go.focus({ preventScroll: true });
    }

    fit(); placeBalloons(); topLine(); setMeter(0, "", true);
    say("Persona.");
    showIntro();

    return {
      unmount() {
        dead = true;
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const id of timers) clearTimeout(id);
        timers.clear();
        if (ro) { try { ro.disconnect(); } catch (_) { /* gone */ } }
        wrap.remove();
      },
    };
  },
};

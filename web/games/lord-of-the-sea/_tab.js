// The Lord of the Sea: The Charter, last appearance: the tab, at the tally (accepted 2026-11-15, phase 1).
// Eight chits lie on the chart table, one from each region of the run. Each pledged something small and
// bought the Company one piece of its order. Pin every chit to the region whose order it bought. The rules
// are The Charter's own: three ink, a wrong pin spills one, at none the paper goes back in the drawer.
// Four pledges cannot be read (sea-swollen, or struck out by a clerk). Stir a drop of seawater onto one and
// the ink stands up again, but each wetting runs one line of the chart to a blur for good.
// All eight pinned opens Pay at the tideline. Every pledge, every "kept here" line and every line of talk
// is written for the game (DESIGN.md section 22).
import { pic, endCard, chapterStrip, circleGesture } from "./_art.js";

const INK = "#2a2118", RED = "#8C2B2B", PAPER = "#F4F1E8", VELLUM = "#efe3c4", WOOD = "#6B4A2B", BLUE = "#1F2E4A", GREEN = "#2F6B5E", GOLD = "#E7A93B", SEAINK = "#3C7A6A";

const REGIONS = [
  { id: "home", name: "Home Reach", art: "chapter-01", keeps: "Mooring No. 1, where his own boat lies. It has not dragged in any weather on record." },
  { id: "lanes", name: "Tidewater", art: "coast-lanes", seal: "seal-tidewater", keeps: "A quay that does not move, and a ferry that has not missed its footing or its six minutes in forty years.", toll: ["toll-wreck-ferry", "toll-lost-wenna"], who: ["the ferry", "Wenna"] },
  { id: "unwritten", name: "The Unwritten", art: "chapter-04", keeps: "Nothing. No buoy, no light, no lane. Entered in the Company's books as “not yet called”." },
  { id: "salt", name: "The Salt Steps", art: "coast-salt", seal: "seal-company", keeps: "A patrol cutter on the reef before any pilot can lie. In any weather: she has never once been becalmed.", toll: ["toll-wreck-skiffs", "toll-lost-old-marrow"], who: ["two reef skiffs", "Old Marrow"] },
  { id: "strait", name: "The Lamplit Strait", art: "coast-strait", seal: "seal-lights", keeps: "Five lights, seen from headland to headland on every night of the year. There has not been a thick night in twenty.", toll: ["toll-wreck-packet", "toll-lost-corran"], who: ["a Company packet", "Corran"] },
  { id: "pearl", name: "The Pearl Banks", art: "coast-pearl", seal: "seal-pearl-compact", keeps: "The bank dived daily at the Company's hour, when the water over it stands still for exactly one shift.", toll: ["toll-wreck-diving-boat", "toll-lost-ide"], who: ["a diving boat", "Ide"] },
  { id: "spice", name: "The Spice Mouth", art: "coast-spice", seal: "seal-company", keeps: "Every lighter underwritten, and not one cargo lost in eleven years. The pay has never gone to the bottom.", toll: ["toll-wreck-lighter", "toll-lost-dock-warden"], who: ["the pay lighter", "the dock-warden"] },
  { id: "halls", name: "The King's Halls", art: "coast-halls", seal: "seal-kings-house", keeps: "Held on a guarantee: the king's house stood surety for an old shipmate, and the surety was called.", toll: ["toll-wreck-supply-boat", "toll-lost-old-oarsman"], who: ["the supply boat", "an old oarsman"] },
];
const CHITS = [
  { n: 1, id: "chit-1-bottle-neck", pledge: "one pair land legs, hardly used", where: "tied at the neck of a bottle on the cabin wall", ch: 1, region: "lanes",
    yes: "His land legs bought Tidewater its footing: a quay that does not move, a ferry that never lurches. He has lurched ashore ever since.", ask: "Who never lurches, in the one place where he always does?" },
  { n: 2, id: "chit-2-dice-stake", pledge: "the luck of the dice", where: "laid as a stake by Mother Halse, at Tidewater", ch: 3, region: "spice",
    yes: "The luck of the dice bought the Company its insurance. Nothing is lost at the Spice Mouth because nothing there is left to chance.", ask: "What does an underwriter sell, if it is not luck?" },
  { n: 3, id: "chit-3-strongbox", raised: "chit-3-strongbox-raised", pledge: "an anchor's hold", hidden: "sea-swollen: the pledge has run to a blur", where: "in the strongbox of the sunken tender", ch: 4, region: "home",
    yes: "An anchor's hold bought Mooring No. 1. Every night he thought he lay free, he lay to a Company buoy.", ask: "What keeps a boat where it was left?" },
  { n: 4, id: "chit-4-lease-schedule", pledge: "a fog", where: "pinned to the lease schedule, at the Lamplit Strait", ch: 5, region: "strait",
    yes: "The fog bought the Strait's lights. Five lamps are easy to see when there has not been a thick night in twenty years.", ask: "What does a lamp need the night to be?" },
  { n: 5, id: "chit-5-trench", pledge: "a slack water", where: "on the trench floor, off the Pearl Banks", ch: 5, region: "pearl",
    yes: "A slack water bought the divers' hour. The sea stands still over the bank for exactly one Company shift.", ask: "What does a diver need the water to do?" },
  { n: 6, id: "chit-6-under-the-board", raised: "chit-6-under-the-board-raised", pledge: "a fair wind, to order", hidden: "struck out, and smudged by the board's foot-ring", where: "under the Comptroller's board, at the Spice Mouth", ch: 5, region: "salt",
    yes: "A fair wind, to order, bought the reef patrol. The cutter is never becalmed, because the wind was never hers to wait for.", ask: "What would a patrol never want to wait for?" },
  { n: 7, id: "chit-7-mirror-gallery", raised: "chit-7-mirror-gallery-raised", pledge: "a shipmate's word", hidden: "struck out; in the glass it reads only backwards", where: "in the mirror gallery of the King's Halls", ch: 6, region: "halls",
    yes: "A shipmate's word bought the surety. The king put his house behind an old friend's promise, and the Company called it.", ask: "Whose word did my father take, and never tell me?" },
  { n: 8, id: "chit-8-lords-hand", raised: "chit-8-lords-hand-raised", pledge: "whatever is left", hidden: "struck out on Company stock, and ticked in green", where: "in the Lord of Tea's own hand", ch: 7, region: "unwritten",
    yes: "Whatever is left: the one chit he has not called. Nothing is built in the Unwritten because the Company is still holding the paper.", ask: "Once seven are called, what is the eighth for?" },
];
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export function mountTab(root, api) {
  const P = "lord-of-the-sea-charter-tab-";
  const art = api.art;
  const rng = api.rng();
  const losses = +api.store.get("tablosses", 0) || 0;
  const S = { ink: 3, sel: null, pins: {}, raised: new Set(), blurred: new Set(), asks: losses >= 2 ? 3 : 1, pencil: "", voice: false, over: false, shake: null, flash: null, wets: 0, started: false };
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
  // a run's chart, as the tally might find it: each play draws another
  const run = {};
  for (const r of REGIONS) {
    const peopled = !!r.toll;
    const wild = r.id === "unwritten" ? 85 : r.id === "home" ? [35, 50, 65][Math.floor(rng() * 3)] : [15, 30, 45, 62, 70, 85][Math.floor(rng() * 6)];
    const port = !peopled ? "none" : ["bound", "broken", "rewritten"][Math.floor(rng() * 3)];
    run[r.id] = { wild, port, toll: peopled ? [wild >= 60 ? 0 : -1, wild >= 80 ? 1 : -1].filter((x) => x >= 0) : [] };
  }
  const tollCount = Object.values(run).reduce((a, r) => a + r.toll.length, 0);
  const chitOf = (rid) => +Object.keys(S.pins).find((n) => S.pins[n] === rid) || 0;
  const legible = (c) => !c.hidden || S.raised.has(c.n);
  const pinned = () => Object.keys(S.pins).length;

  root.innerHTML = `
  <style>
    .${P}w { position:absolute; inset:0; overflow:auto; color:${INK}; font-family:'IM Fell English',Georgia,serif;
      background: repeating-linear-gradient(92deg, rgba(0,0,0,.08) 0 2px, transparent 2px 19px), repeating-linear-gradient(88deg, rgba(255,255,255,.04) 0 1px, transparent 1px 7px), ${WOOD}; }
    .${P}lay { display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:14px; padding:12px clamp(8px,2vw,24px) 20px; max-width:1260px; margin:0 auto; align-items:start; }
    .${P}bar { grid-column:1/-1; display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; justify-content:space-between; background:#3d2a18; color:${PAPER}; padding:8px 12px; border:1px solid #20150b; position:sticky; top:0; z-index:2; }
    .${P}bar h2 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.14em; font-size:16px; margin:0; }
    .${P}bar .ink { display:flex; gap:4px; align-items:center; }
    .${P}bar button, .${P}side button, .${P}how button { font:inherit; font-size:15px; padding:5px 12px; cursor:pointer; border:1px solid ${INK}; background:${PAPER}; color:${INK}; }
    .${P}bar button:disabled, .${P}side button:disabled { opacity:.45; cursor:default; }
    .${P}chart { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
    .${P}reg { font:inherit; color:${INK}; text-align:left; display:grid; gap:5px; align-content:start; padding:8px 9px 9px; cursor:pointer; position:relative;
      background: radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; box-shadow:0 5px 12px rgba(0,0,0,.4); min-height:216px; }
    .${P}reg:hover, .${P}reg:focus-visible { outline:3px solid ${GOLD}; outline-offset:0; }
    .${P}reg.done { cursor:default; background:radial-gradient(ellipse at 30% 20%, #f3f7ee, #dfe9d6 70%, #c9d8c0); }
    .${P}reg.done:hover { outline:none; }
    .${P}reg .hd { display:flex; align-items:center; gap:6px; justify-content:space-between; }
    .${P}reg .nm { font-family:'IM Fell English SC',Georgia,serif; letter-spacing:.07em; font-size:15px; line-height:1.1; }
    .${P}reg .st { display:flex; align-items:center; gap:4px; font-size:12px; white-space:nowrap; }
    .${P}reg .st img { width:26px; height:26px; border-radius:50%; object-fit:cover; }
    .${P}reg .strip { width:100%; aspect-ratio:8/1; object-fit:cover; object-position:50% 36%; display:block; border:1px solid rgba(42,33,24,.4); background:#d9d0b4; }
    .${P}reg .kp { font-size:14px; line-height:1.3; margin:0; }
    .${P}reg .kp b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; font-size:11px; letter-spacing:.12em; color:${RED}; display:block; }
    .${P}reg .kp.blur span { filter:blur(3.2px); opacity:.7; user-select:none; }
    .${P}reg .kp.blur::after { content:"(run to a blur)"; display:block; font-style:italic; font-size:12px; color:${SEAINK}; }
    .${P}reg .toll { display:flex; gap:4px; align-items:center; font-size:11px; font-style:italic; flex-wrap:wrap; }
    .${P}reg .toll img { width:44px; height:32px; object-fit:cover; border:1px solid rgba(42,33,24,.5); }
    .${P}reg .pin { display:flex; gap:6px; align-items:center; font-size:13px; border-top:1px dashed rgba(42,33,24,.35); padding-top:5px; margin-top:auto; min-height:38px; }
    .${P}reg .pin img { width:56px; height:auto; display:block; box-shadow:1px 2px 3px rgba(0,0,0,.35); }
    .${P}reg .pin .seal { width:30px; }
    .${P}reg.shake { animation:${P}shk .45s; }
    .${P}reg.flash { animation:${P}fl 1.2s; }
    @keyframes ${P}shk { 0%,100% { transform:none; } 25% { transform:translateX(-5px); } 75% { transform:translateX(5px); } }
    @keyframes ${P}fl { 0%,40% { box-shadow:0 0 0 5px ${GOLD}; } 100% { box-shadow:0 5px 12px rgba(0,0,0,.4); } }
    .${P}side { background:#3d2a18; color:${PAPER}; border:1px solid #20150b; padding:10px; display:grid; gap:8px; position:sticky; top:52px; }
    .${P}side h3 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.14em; font-size:12px; margin:0; text-align:center; }
    .${P}tray { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; }
    .${P}chit { font:inherit; padding:0; border:2px solid transparent; background:none; cursor:pointer; position:relative; display:block; }
    .${P}chit img { width:100%; height:auto; display:block; }
    .${P}chit .fb { display:grid; place-items:center; aspect-ratio:46/30; background:${VELLUM}; color:${INK}; font-size:13px; }
    .${P}chit.sel { border-color:${GOLD}; }
    .${P}chit.used { opacity:.3; cursor:default; }
    .${P}chit i { position:absolute; left:2px; top:1px; font-style:normal; font-size:11px; background:${PAPER}; color:${RED}; padding:0 3px; }
    .${P}det { background:${PAPER}; color:${INK}; padding:8px; display:grid; gap:6px; font-size:14px; line-height:1.3; border:1px solid #b9a578; }
    .${P}det .big { position:relative; cursor:grab; }
    .${P}det .big img { width:100%; height:auto; display:block; }
    .${P}det .prov { display:grid; grid-template-columns:84px minmax(0,1fr); gap:8px; align-items:center; font-size:13px; }
    .${P}det .prov img { width:84px; height:47px; object-fit:cover; border:1px solid rgba(42,33,24,.5); }
    .${P}det .pl { font-size:17px; font-style:italic; color:${BLUE}; }
    .${P}det .hid { font-style:italic; color:${SEAINK}; }
    .${P}det button.wet { background:${SEAINK}; color:${PAPER}; border-color:${SEAINK}; }
    .${P}pencil { grid-column:1/-1; font-style:italic; font-size:16px; line-height:1.35; min-height:2.7em; margin:0; padding:8px 12px; background:rgba(244,241,232,.92); border:1px solid #b9a578; color:#4b463c; }
    .${P}pencil.voice { color:${SEAINK}; }
    .${P}say { display:none; font-style:italic; font-size:14px; line-height:1.3; color:${PAPER}; }
    .${P}say.voice { color:#9fd8c6; }
    .${P}say:empty { display:none !important; }
    .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(40,28,16,.78); z-index:3; padding:14px; overflow:auto; }
    .${P}deed { max-width:560px; box-sizing:border-box; margin:8px; background:radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; padding:18px 24px 16px; box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 0 30px rgba(120,90,40,.25); }
    .${P}deed h2 { font-family:'Pinyon Script',cursive; font-weight:400; font-size:clamp(38px,8vw,48px); margin:0; text-align:center; line-height:1.1; }
    .${P}deed .goal { text-align:center; font-size:18px; margin:4px 0 6px; }
    .${P}deed .open { font-style:italic; text-align:center; font-size:15px; line-height:1.4; margin:0 0 10px; color:#4b3f30; }
    .${P}deed ol { list-style:none; margin:0 0 12px; padding:10px 0 0; border-top:1px solid rgba(42,33,24,.35); display:grid; gap:7px; counter-reset:it; }
    .${P}deed li { display:grid; grid-template-columns:auto minmax(0,1fr); gap:10px; font-size:16px; line-height:1.35; }
    .${P}deed li::before { content:counter(it, lower-roman) "."; counter-increment:it; font-family:'Pinyon Script',cursive; color:${RED}; font-size:22px; line-height:1; min-width:1.4em; }
    .${P}deed li b { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.06em; color:${RED}; }
    .${P}deed kbd { font-family:inherit; border:1px solid ${INK}; padding:0 4px; font-size:14px; }
    .${P}deed .gentle { text-align:center; font-style:italic; color:${GREEN}; font-size:15px; margin:0 0 8px; }
    .${P}deed button { display:block; margin:0 auto; font-size:18px; padding:8px 22px; background:${RED}; color:${PAPER}; }
    @media (prefers-reduced-motion: reduce) { .${P}reg.shake, .${P}reg.flash { animation:none; } }
    @media (max-width:980px) { .${P}chart { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width:760px) { .${P}lay { grid-template-columns:minmax(0,1fr); padding-bottom:230px; } .${P}reg { min-height:0; } .${P}reg .kp { font-size:13px; }
      .${P}side { position:fixed; left:0; right:0; bottom:0; top:auto; z-index:2; padding:6px 8px 8px; gap:5px; box-shadow:0 -6px 14px rgba(0,0,0,.45); max-height:46vh; overflow:auto; }
      .${P}tray { grid-template-columns:repeat(8,minmax(0,1fr)); gap:3px; } .${P}side h3 { display:none; } .${P}say { display:block; } .${P}pencil { display:none; }
      .${P}det { grid-template-columns:118px minmax(0,1fr); padding:6px; font-size:13px; } .${P}det .prov { grid-template-columns:minmax(0,1fr); } .${P}det .prov img { display:none; } .${P}det .pl { font-size:15px; } }
  </style>
  <div class="${P}w"><div class="${P}lay"></div>
    <div class="${P}how" role="dialog" aria-label="How to play"><div class="${P}deed">
      ${chapterStrip(art, 7, "Chapter VII: The Lord of Tea")}
      <h2>The Tab</h2>
      <p class="goal">Pin each of the eight chits to the region whose order it bought.</p>
      <p class="open">Chapter VI, the cabin, the night of the tally. Forty years of drinking on credit lie on the chart table: eight chits, each signed with a clockwise spiral, each pledging something small. The Company bought them all, and built its peace on them.</p>
      ${losses >= 2 ? `<p class="gentle">She has sat through this twice: she will answer three questions, not one.</p>` : ""}
      <ol>
        <li><span><b>Pin</b>: pick a chit, then the region whose line says what the pledge paid for. Three ink; a wrong pin spills one.</span></li>
        <li><span><b>Wet</b>: four pledges cannot be read. Circle on the chit (or <kbd>W</kbd>) to stir a drop of seawater onto it. The ink stands up again, and one line of the chart runs to a blur for good.</span></li>
        <li><span><kbd>1</kbd>–<kbd>8</kbd> pick a chit; <kbd>Tab</kbd> and <kbd>Enter</kbd> pin it; <kbd>A</kbd> asks her.</span></li>
      </ol>
      <button type="button">Lay them out</button>
    </div></div>
  </div>`;
  const w = root.querySelector("." + P + "w");
  const lay = w.querySelector("." + P + "lay");
  const how = w.querySelector("." + P + "how");
  let ungest = null;

  function say(t, voice) { S.pencil = t; S.voice = !!voice; }
  function render() {
    const drops = Array.from({ length: 3 }, (_, i) => `<svg viewBox="0 0 20 26" width="16" height="22" aria-hidden="true"><path d="M10 2 C14 10 18 14 18 18 A8 8 0 0 1 2 18 C2 14 6 10 10 2Z" fill="${i < S.ink ? "#7fa3d9" : "none"}" stroke="${i < S.ink ? PAPER : RED}" stroke-width="1.4"/></svg>`).join("");
    const reg = (r) => {
      const st = run[r.id], cn = chitOf(r.id), c = cn ? CHITS[cn - 1] : null;
      const strip = pic(art, r.art, "", `class="strip"`) || `<div class="strip"></div>`;
      const sealImg = st.port !== "none" ? pic(art, "port-seal-" + st.port, st.port) : "";
      const toll = st.toll.length ? `<div class="toll">toll: ${st.toll.map((k) => pic(art, r.toll[k], r.who[k], `title="${r.who[k]}"`) || r.who[k]).join("")}</div>` : "";
      return `<button type="button" class="${P}reg${c ? " done" : ""}${S.shake === r.id ? " shake" : ""}${S.flash === r.id ? " flash" : ""}" data-reg="${r.id}" ${c ? "aria-disabled=\"true\"" : ""} aria-label="${r.name}${c ? `, chit ${cn} pinned` : ""}">
        <span class="hd"><span class="nm">${r.name}</span><span class="st">${sealImg}Wild ${st.wild}${st.port !== "none" ? "" : " · not bound"}</span></span>
        ${strip}
        <span class="kp${S.blurred.has(r.id) && !c ? " blur" : ""}"><b>THE COMPANY KEEPS HERE</b><span>${r.keeps}</span></span>
        ${toll}
        <span class="pin">${c ? `${pic(art, S.raised.has(cn) && c.raised ? c.raised : c.id, "") || ""}<span>No. ${cn}: <i>${c.pledge}</i></span>${r.seal ? pic(art, r.seal, "", `class="seal"`) : ""}` : `<span style="opacity:.6">no chit pinned</span>`}</span>
      </button>`;
    };
    const tray = CHITS.map((c) => {
      const used = c.n in S.pins;
      const im = pic(art, S.raised.has(c.n) && c.raised ? c.raised : c.id, "") || `<span class="fb">No. ${c.n}</span>`;
      return `<button type="button" class="${P}chit${S.sel === c.n ? " sel" : ""}${used ? " used" : ""}" data-chit="${c.n}" ${used ? "disabled" : ""} aria-label="Chit ${c.n}: ${legible(c) ? c.pledge : "pledge unreadable"}${used ? ", pinned" : ""}" aria-pressed="${S.sel === c.n}">${im}<i>${c.n}</i></button>`;
    }).join("");
    const c = S.sel ? CHITS[S.sel - 1] : null;
    const det = c ? `<div class="${P}det">
        <div class="big" data-big="1">${pic(art, S.raised.has(c.n) && c.raised ? c.raised : c.id, `Chit ${c.n}`) || `<div style="padding:18px;background:${VELLUM}">Chit No. ${c.n}</div>`}</div>
        <div style="display:grid;gap:6px;align-content:start">
          <div class="prov">${pic(art, "chapter-0" + c.ch, "") || "<span></span>"}<span>No. ${c.n}. Found ${c.where} (chapter ${ROMAN[c.ch]}).</span></div>
          ${legible(c) ? `<div class="pl">“${c.pledge}” — pays next tide.</div>` : `<div class="hid">The pledge is ${c.hidden}.</div><button type="button" class="wet" data-a="wet">Stir a drop of seawater onto it (W)</button>`}
          <div style="font-size:13px;opacity:.8">${legible(c) ? "Now pick the region it bought." : "Or pin it blind, by what is left."}</div>
        </div></div>` : `<div class="${P}det" style="font-style:italic;grid-template-columns:minmax(0,1fr)">Pick a chit. Each pledged something small; each bought the Company something that has not failed since.</div>`;
    lay.innerHTML = `
      <div class="${P}bar"><h2>THE TAB · ${pinned()} OF 8 PINNED</h2>
        <span class="ink" aria-label="${S.ink} ink left">INK ${drops}</span>
        <button type="button" data-a="ask" ${S.asks > 0 && !S.over ? "" : "disabled"} title="Trust 40+: she answers one question">Ask her (${S.asks})</button></div>
      <div class="${P}chart" role="group" aria-label="The chart: eight regions, ${tollCount} in the toll this run">${REGIONS.map(reg).join("")}</div>
      <aside class="${P}side"><div class="${P}say${S.voice ? " voice" : ""}">${S.pencil}</div><h3>THE CHITS</h3><div class="${P}tray">${tray}</div>${det}</aside>
      <p class="${P}pencil${S.voice ? " voice" : ""}" aria-live="polite">${S.pencil}</p>`;
    S.shake = null;
    lay.querySelectorAll("[data-chit]").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.chit)));
    lay.querySelectorAll("[data-reg]").forEach((b) => b.addEventListener("click", () => pin(b.dataset.reg)));
    lay.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => (b.dataset.a === "wet" ? wet() : ask())));
    if (ungest) { ungest(); ungest = null; }
    const big = lay.querySelector("[data-big]");
    if (big && c && !legible(c)) ungest = circleGesture(big, () => wet());
  }
  function pick(n) {
    if (S.over || n in S.pins) return;
    S.sel = S.sel === n ? null : n;
    const c = S.sel ? CHITS[S.sel - 1] : null;
    if (c) say(legible(c) ? `No. ${c.n}: “${c.pledge}”. What on this chart has that never failed?` : `No. ${c.n}: the pledge is ${c.hidden}. A drop of seawater would raise it, at a price.`);
    render();
  }
  function pin(rid) {
    if (S.over) return;
    if (chitOf(rid)) return;
    if (!S.sel) { say("Pick a chit first, then the region it bought."); render(); return; }
    const c = CHITS[S.sel - 1], r = REGIONS.find((x) => x.id === rid);
    if (c.region === rid) {
      S.pins[c.n] = rid; S.flash = rid; S.sel = null;
      later(() => { S.flash = null; }, 1300);
      say(c.yes);
      if (pinned() === 4) later(() => { if (!S.over) { say("Half the sea, and all of it in our own hand.", true); render(); } }, 4200);
      render();
      if (pinned() === 8) finish(true);
    } else {
      S.ink--; S.shake = rid;
      say(S.ink > 0 ? `Not ${r.name}. Ink spilled: ${S.ink} left. ${legible(c) ? `Read what the Company keeps there again, and ask what “${c.pledge}” could have paid for.` : "Pinning blind is dear. Wet it, or pin the ones you can read first."}` : `Not ${r.name}, and that was the last of the ink.`);
      render();
      if (S.ink <= 0) finish(false);
    }
  }
  function wet() {
    if (S.over || !S.sel) return;
    const c = CHITS[S.sel - 1];
    if (legible(c)) return;
    S.raised.add(c.n); S.wets++;
    // the price: one line of the chart, not this chit's own, runs for good
    const victim = REGIONS.slice().reverse().find((r) => !chitOf(r.id) && r.id !== c.region && !S.blurred.has(r.id));
    if (victim) S.blurred.add(victim.id);
    say(`The salt lets go of the ink: “${c.pledge}”.${victim ? ` And on the chart the line under ${victim.name} runs to a blur, for good.` : ""}`);
    render();
  }
  function ask() {
    if (S.over || S.asks <= 0) return;
    S.asks--;
    const blurred = REGIONS.find((r) => S.blurred.has(r.id) && !chitOf(r.id));
    const c = S.sel ? CHITS[S.sel - 1] : null;
    if (c && legible(c)) say(`She turns No. ${c.n} to the lamp. “${c.ask}”`);
    else if (blurred) { S.blurred.delete(blurred.id); say(`She says the line under ${blurred.name} from memory, and pencils it back in: “${blurred.keeps}”`); }
    else if (c) say(`“I cannot read it either. Wet it, or leave it for last and let the chart tell you.”`);
    else { const first = CHITS.find((x) => !(x.n in S.pins) && legible(x)); say(first ? `She slides No. ${first.n} toward him. “${first.ask}”` : "“Wet one. There is no other way to read them.”"); }
    render();
  }
  function finish(won) {
    S.over = true; render();
    api.store.set("tablosses", won ? 0 : losses + 1);
    later(() => {
      if (won) {
        endCard(root, art, "wreck-book-open-year", "THE WRECK BOOK · OUTSTANDING, FOR EVER", "#12203a", "title-lettering");
        api.end({ outcome: "win", text: `All eight chits pinned to what they bought, ${S.ink === 3 ? "and not a drop of ink spilled" : `with ${S.ink} ink to spare`}${S.wets ? `; ${S.wets} wetted` : ""}. The tab is read whole for the first time in forty years, and Pay opens at the tideline: eight counter-clockwise stirs, one for each chit, each taking a tier off the rose ring for good.${tollCount ? ` The ${tollCount} in this run's toll will be entered as “outstanding, for ever”.` : ""}` });
      } else {
        endCard(root, art, "wreck-book-lost-list", "THE WRECK BOOK · THE LOST LIST");
        api.end({ outcome: "lose", text: `The ink is gone with ${pinned()} of eight pinned. The tab stays a drawer of paper he cannot read, Pay stays shut at the tideline, and the Lord of Tea goes on keeping the account alone.` });
      }
    }, won ? 1600 : 900);
  }
  const onKey = (e) => {
    if (how.isConnected || S.over) return;
    if (/^[1-8]$/.test(e.key)) { pick(+e.key); const b = lay.querySelector(`[data-chit="${e.key}"]`); b && b.focus(); }
    if (e.key === "w" || e.key === "W") wet();
    if (e.key === "a" || e.key === "A") ask();
    if (e.key === "Escape") { S.sel = null; render(); }
  };
  addEventListener("keydown", onKey);
  render();
  const b = how.querySelector("button");
  b.addEventListener("click", () => { how.remove(); S.started = true; say("Start with the four that can be read. A pin protects a region's line: nothing pinned can blur."); render(); });
  b.focus();
  return { unmount() { timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", onKey); if (ungest) ungest(); S.over = true; } };
}

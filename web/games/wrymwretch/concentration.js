// WrymWretch · Concentration (1D, Stained glass). DESIGN.md section 11, Concentration.
// One page: s_conc_bestiary (20 cards, 10 pairs: a creature's picture and its name; blank interval
// 6; flip budget 44; 8 pairs kept wins the healing song). Every 6 flips one unmatched face fades to
// clear glass for good. A blank can still be matched: turn its partner, then the blank, and say
// "This is the one". Right, and the face returns; wrong, and one more card blanks at once.
// Aetherius's telepathy shows one blank face for 2 s, once. Remembrance lines: data/bestiary.json.
// Refinements: Lead a face (added): twice a page, spend a flip to lead a face-down card you have seen
// so it cannot blank. Halfway through the flips the plague quickens and the blank interval drops to 5.
// A blank falls on a card the player has already seen, when there is one (retuned: a never-seen card
// that blanked was pure luck). After two losses in a row: more flips and a slower candle (api.store).
//
// Phase 1 (accepted 2026-11-15), "Names become ground": the page now opens on a choice of two pages.
//   I  The ward (s_conc_ward: 12 cards, 6 pairs of a patient's face and their name; blank interval 8;
//      30 flips). Every name kept is a lit lantern, with that name on it, on the bone bridge and in the
//      Expanse (forgetting runs III and IV); lose three and those stretches are dark, which is this
//      page's loss in the prototype. The six patients' names and lines are added for the game.
//   II The bestiary (s_conc_bestiary), as before. The Star Moth takes the Stormrider's place, so that
//      every picture is one of the game's glass cards.
// Art (games/wrymwretch/art): the stained-glass card back, the ten creature panes and the six ward
// patients as the card faces; chapter cards 2 and 8 above the how-to; the Record behind the result.
// The name cards, the clear-glass blank and the old picture faces are drawn here (the last only when
// a pane is missing).

import { png, opening } from "./_art.js";
import { staged } from "./_stages.js";

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder. The two pages are now stages, and a third follows.
//   I   Teach, the ward: faces blank.            II  Test, the bestiary: choose the blank from memory.
//   III Twist, Ilvarra's memories (s_conc_ilvarra): the game starts lying. False faces (new): two cards
//       on the table are the Remnants'. A false face shows a different memory each time it is turned,
//       and a pair made with one is kept like any other: a lie, locked into the Record until it is
//       unpicked (tap a kept pair: two flips). So a match on first sight, the safe move until now, is
//       the wrong one: a card is trusted when it has shown the same face twice. No candle on this page.
//       Set-piece: Cendre's face is clear glass before the first flip. Turn her name with the blank pane
//       and eight blank panes are laid out; she is picked from them by her lead line alone.
// Names become ground (layer link 1): the ward's result is written to api.shared ("ward"), and the bone
// bridge (Forgetting run III) reads it.
const LADDER = [
  { name: "The ward", sub: "Six names, before the faces go." },
  { name: "The bestiary", sub: "Ten creatures: choose the blank from memory." },
  { name: "Ilvarra's memories", sub: "The game starts lying." },
];
const MEMS = [
  { id: "rim", name: "The Rim", realm: "below", a: "glass-memory-rim", b: "glass-memory-rim-sound", bName: "Wind over the wound", line: "Two cliffs and the wound between them, and the sound the wind makes going over." },
  { id: "bridge", name: "The bone bridge", realm: "above", a: "glass-memory-bridge", b: "glass-memory-bridge-sound", bName: "The bones hum", line: "Vertebrae and ribs across the chasm. She crossed it the first time on Cendre's back, laughing." },
  { id: "banner_wood", name: "Wood banner", realm: "west", a: "glass-memory-banner-west", b: null, line: "The Wood tribe's banner at the Imprisonment. It was the first to be raised." },
  { id: "banner_dark", name: "Dark banner", realm: "below", a: "glass-memory-banner-below", b: null, line: "The Dark tribe's banner. It was raised last, and held longest." },
];
const maskFace = `<svg viewBox="0 0 100 133"><rect width="100" height="133" fill="#1d1c26"/><path d="M50,22 C74,22 80,48 76,74 C72,100 58,114 50,114 C42,114 28,100 24,74 C20,48 26,22 50,22Z" fill="#e9e2d0" stroke="${"#15130f"}" stroke-width="3"/><path d="M34,62 q8,-5 14,0 M52,62 q6,-5 14,0" stroke="#15130f" stroke-width="3.5" fill="none"/><text x="50" y="128" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="9" fill="#b9c0cb">a Remnant card</text><rect x="2" y="2" width="96" height="129" fill="none" stroke="#15130f" stroke-width="5" rx="3"/></svg>`;
// eight blank panes: only the lead lines are left. One has a horn shorter than the other.
const PANES = [[30, 30, 0], [20, 20, 1], [31, 31, 2], [25, 25, 0], [31, 16, 0], [22, 22, 2], [35, 35, 1], [27, 27, 1]];
function pane([L, Rr, v]) {
  const horn = (x, dir, len) => `<path d="M${x},50 q${dir * 3},${-len * 0.5} ${dir * 9},${-len} q${-dir * 1},${len * 0.55} ${-dir * 3},${len * 0.9}" />`;
  return `<svg viewBox="0 0 100 133"><rect width="100" height="133" fill="#dfe8ea"/><path d="M8,120 L70,4 M30,128 L92,14" stroke="#fff" stroke-width="7" opacity=".7"/>
    <g fill="none" stroke="#3d434b" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${horn(38, -1, L)}${horn(62, 1, Rr)}
    <path d="M34,52 Q50,${v === 2 ? 40 : 44} 66,52 L${v === 1 ? 72 : 69},74 L58,${v === 0 ? 100 : 104} Q50,108 42,${v === 0 ? 100 : 104} L${v === 1 ? 28 : 31},74 Z"/><path d="M40,66 l7,3 M60,66 l-7,3 M46,96 l1,3 M54,96 l-1,3"/>${v === 2 ? '<path d="M31,74 l-8,6 M69,74 l8,6"/>' : ""}
    <path d="M0,40 L34,52 M100,40 L66,52 M50,108 V133 M0,92 L31,74 M100,92 L69,74"/></g><rect x="2" y="2" width="96" height="129" fill="none" stroke="#15130f" stroke-width="5" rx="3"/></svg>`;
}

const LEAD = "#15130f", GLASS = "#f3eee2", CLEAR = "#dfe8ea", NIGHT = "#1d1c26", GOLD = "#e2b33c";
const REALM = { west: ["#4f6b2e", "#d79a2b"], north: ["#7fa6cf", "#c7ccd3"], south: ["#c88a2e", "#e8571c"], east: ["#1f5f8b", "#8fb7c9"], below: ["#5b3a7a", "#2e2440"], above: ["#d4a72c", "#fbf6e4"] };
const CREATURES = [
  { id: "grove_stag", name: "Grove Stag", realm: "west", line: "It walked the groves at dusk, and the moss stood up where it had passed.",
    art: `<path d="M50,82 L41,56 L43,42 L50,37 L57,42 L59,56 Z"/><path d="M45,42 L34,26 L26,30 M34,26 L31,13 M55,42 L66,26 L74,30 M66,26 L69,13" fill="none" stroke-width="5"/>` },
  { id: "whisperfox", name: "Whisperfox", realm: "west", line: "It carried the rangers' calls from tree to tree, so no one in the groves was ever lost.",
    art: `<path d="M28,24 L42,46 L58,46 L72,24 L68,58 L50,80 L32,58 Z"/><circle cx="42" cy="56" r="3" fill="${LEAD}"/><circle cx="58" cy="56" r="3" fill="${LEAD}"/>` },
  { id: "star_moth", name: "Star Moth", realm: "north", line: "Galechanters followed its flight at night to find the stars they were singing to.",
    art: `<path d="M50,40 Q20,12 12,40 Q14,60 50,54 Q86,60 88,40 Q80,12 50,40 Z"/><path d="M50,54 Q30,62 28,80 Q44,78 50,62 Q56,78 72,80 Q70,62 50,54 Z"/><path d="M50,36 V70 M46,34 L40,22 M54,34 L60,22" fill="none" stroke-width="4"/>` },
  { id: "cloud_serpent", name: "Cloud Serpent", realm: "north", line: "It held the drifting sky-cities together in storms, coiled round their moorings.",
    art: `<path d="M16,74 C30,36 48,84 62,50 S82,24 88,34" fill="none" stroke-width="11" stroke="${LEAD}"/><path d="M16,74 C30,36 48,84 62,50 S82,24 88,34" fill="none" stroke-width="6" stroke="${GLASS}"/><circle cx="26" cy="30" r="9"/><circle cx="38" cy="26" r="11"/>` },
  { id: "crystal_crawler", name: "Crystal Crawler", realm: "south", line: "They polished the gem veins of the deep cities and made them shine.",
    art: `<path d="M24,40 L14,32 M24,54 L12,58 M76,40 L86,32 M76,54 L88,58 M30,66 L24,78 M70,66 L76,78" fill="none" stroke-width="4"/><path d="M50,24 L72,38 L72,62 L50,76 L28,62 L28,38 Z"/><path d="M50,24 L50,76 M28,38 L72,62 M72,38 L28,62" fill="none" stroke-width="2"/>` },
  { id: "fossil_wurm", name: "Fossil Wurm", realm: "south", line: "It carried the memory of the first stones in its bones, and the Stonekeepers sang to it.",
    art: `<circle cx="22" cy="70" r="8"/><circle cx="32" cy="54" r="9"/><circle cx="46" cy="42" r="10"/><circle cx="62" cy="38" r="10"/><circle cx="76" cy="46" r="9"/><path d="M80,48 L92,40 L90,56 Z"/>` },
  { id: "tide_serpent", name: "Tide Serpent", realm: "east", line: "It turned the tides in the bays and brought the fish in close to the Tidecaller nets.",
    art: `<path d="M8,64 Q22,40 36,64 T64,64 Q72,52 72,40 L86,32 L82,46 L74,48 Q74,62 64,72 Q50,84 36,72 Q22,86 8,72 Z"/>` },
  { id: "moonfish", name: "Moonfish", realm: "east", line: "It showed the way home to lost divers by the light of its scales.",
    art: `<ellipse cx="46" cy="52" rx="26" ry="16"/><path d="M70,52 L88,38 L88,66 Z"/><path d="M40,18 A14,14 0 1,0 54,32 A10,10 0 1,1 40,18 Z"/><circle cx="32" cy="48" r="3" fill="${LEAD}"/>` },
  { id: "shadehound", name: "Shadehound", realm: "below", line: "The Syndicate kept it to find the lost in the labyrinth and bring them out.",
    art: `<path d="M22,62 L38,42 L42,26 L50,40 L72,44 L84,54 L66,60 L58,76 L36,74 Z"/><circle cx="56" cy="50" r="3" fill="${GOLD}"/>` },
  { id: "starborn_owl", name: "Starborn Owl", realm: "above", line: "It kept watch over the Priory's sleepers and woke them when the stars moved.",
    art: `<path d="M30,30 L40,40 L60,40 L70,30 L72,60 Q72,82 50,84 Q28,82 28,60 Z"/><circle cx="41" cy="52" r="8" fill="${GOLD}"/><circle cx="59" cy="52" r="8" fill="${GOLD}"/><circle cx="41" cy="52" r="3" fill="${LEAD}"/><circle cx="59" cy="52" r="3" fill="${LEAD}"/>` },
];
// The ward's six (names and lines added for the game). A bust in the old hand, for when a pane is missing.
const BUST = `<path d="M50,20 Q70,20 70,44 Q70,62 50,66 Q30,62 30,44 Q30,20 50,20 Z"/><path d="M30,40 L14,30 L28,50 Z M70,40 L86,30 L72,50 Z"/><path d="M22,92 Q24,70 50,68 Q76,70 78,92 Z"/>`;
const PATIENTS = [
  { id: "patient_1", n: 1, name: "Maerith", realm: "north", line: "She hung the bells on the east moorings, and knows each one by its note.", art: BUST },
  { id: "patient_2", n: 2, name: "Illeth", realm: "north", line: "She mends sky-sails. Her own hangs half stitched by the door.", art: BUST },
  { id: "patient_3", n: 3, name: "Corvane", realm: "north", line: "He ran the rope bridges as a boy and never once looked down.", art: BUST },
  { id: "patient_4", n: 4, name: "Dovra", realm: "north", line: "She keeps the ward's lamp oil, and counts it aloud every night.", art: BUST },
  { id: "patient_5", n: 5, name: "Hesk", realm: "north", line: "He sang the low part in the Gale choir, the part nobody hears until it stops.", art: BUST },
  { id: "patient_6", n: 6, name: "Ansel", realm: "north", line: "He is the healer's brother. The healer has begun to call him the sixth bed.", art: BUST },
];
const PAGES = {
  ward: { key: "ward", label: "I · The ward", what: "six names", chapter: "chapter-02", realm: "north", items: PATIENTS, cols: 4, budget: [30, 36], interval: [8, 9], win: 4, leads: 2,
    artId: (c) => "glass-patient-" + c.n, noun: "name", goal: "Keep the fevered elves' names before their faces go." },
  bestiary: { key: "bestiary", label: "II · The bestiary", what: "ten creatures", chapter: "chapter-08", realm: "wrymreach", items: CREATURES, cols: 5, budget: [44, 50], interval: [6, 7], win: 8, leads: 2,
    artId: (c) => "glass-" + c.id.replace(/_/g, "-"), noun: "creature", goal: "Keep eight of the ten creatures before their faces go." },
  ilvarra: { key: "ilvarra", label: "III · Ilvarra's memories", what: "four memories, and Cendre", chapter: "chapter-09", realm: "wrymreach", items: MEMS, cols: 4, budget: [38, 46], interval: [999, 999], win: 3, leads: 0,
    artId: (c) => c.a, noun: "memory", goal: "Keep Ilvarra's memories, and do not keep a lie." },
};

// a jewel-glass ground: wedges in the realm's pair of colours, leaded
function ground(realm, seed) {
  const [a, b] = REALM[realm];
  let s = "";
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2 + seed, a1 = ((i + 1) / 8) * Math.PI * 2 + seed;
    s += `<path d="M50,66 L${50 + Math.cos(a0) * 90},${66 + Math.sin(a0) * 90} L${50 + Math.cos(a1) * 90},${66 + Math.sin(a1) * 90} Z" fill="${i % 2 ? a : b}" opacity="${i % 3 ? 0.95 : 0.75}"/>`;
  }
  return s;
}
const lead = (inner) => `<rect x="2" y="2" width="96" height="129" fill="none" stroke="${LEAD}" stroke-width="5" rx="3"/>${inner}`;
function face(c, kind, i) {
  if (kind === "pic") {
    return `<svg viewBox="0 0 100 133">${ground(c.realm, i)}<g stroke="${LEAD}" stroke-width="2.5" opacity=".9">${Array.from({ length: 8 }, (_, k) => `<line x1="50" y1="66" x2="${50 + Math.cos(k / 8 * 6.283 + i) * 90}" y2="${66 + Math.sin(k / 8 * 6.283 + i) * 90}"/>`).join("")}</g>
      <circle cx="50" cy="66" r="38" fill="${NIGHT}" stroke="${LEAD}" stroke-width="4"/><g transform="translate(14,30) scale(.72)" fill="${GLASS}" stroke="${LEAD}" stroke-width="3" stroke-linejoin="round">${c.art}</g>${lead("")}</svg>`;
  }
  const words = c.name.split(" ");
  return `<svg viewBox="0 0 100 133">${ground(c.realm, i + 1.3)}<g stroke="${LEAD}" stroke-width="2.5">${[22, 44, 89, 111].map((y) => `<line x1="0" y1="${y}" x2="100" y2="${y + (y % 3) * 4 - 4}"/>`).join("")}</g>
    <rect x="10" y="42" width="80" height="50" fill="${GLASS}" stroke="${LEAD}" stroke-width="4"/>
    ${words.map((w, k) => `<text x="50" y="${(words.length === 1 ? 72 : 63 + k * 18)}" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="700" font-size="${w.length > 9 ? 11 : 13}" fill="${LEAD}">${w}</text>`).join("")}${lead("")}</svg>`;
}
function back() {
  let s = `<svg viewBox="0 0 100 133"><rect width="100" height="133" fill="#1f3f8f"/>`;
  for (let y = -10; y < 150; y += 16) for (let x = -10; x < 110; x += 16) s += `<path d="M${x},${y + 8} L${x + 8},${y} L${x + 16},${y + 8} L${x + 8},${y + 16} Z" fill="${(x + y) % 32 ? "#a42a1c" : "#2a4fa8"}" stroke="${LEAD}" stroke-width="1.6"/>`;
  return s + `<circle cx="50" cy="66" r="11" fill="${GOLD}" stroke="${LEAD}" stroke-width="2.5"/><path d="M50,58 L52.5,64 L58,64 L53.5,68 L55,74 L50,70.5 L45,74 L46.5,68 L42,64 L47.5,64 Z" fill="#fbf6e4"/>${lead("")}</svg>`;
}
const blankFace = `<svg viewBox="0 0 100 133"><rect width="100" height="133" fill="${CLEAR}"/><path d="M8,120 L70,4 M30,128 L92,14" stroke="#fff" stroke-width="7" opacity=".7"/><ellipse cx="50" cy="62" rx="22" ry="28" fill="none" stroke="#9aa3ad" stroke-width="1.4" stroke-dasharray="3 3"/><text x="50" y="112" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="10" fill="#7d858f">blanked</text>${lead("")}</svg>`;

const CSS = `
.wrymwretch-concentration-root{position:absolute;inset:0;overflow:auto;background:radial-gradient(ellipse at 40% 30%,#2b2a3a,${NIGHT} 70%);color:${GLASS};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-concentration-page{display:flex;flex-wrap:wrap;gap:16px;padding:14px;align-items:flex-start;justify-content:center}
.wrymwretch-concentration-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;flex:1 1 440px;max-width:min(780px,calc((100vh - 165px) / 4 * .75 * 5 + 60px));padding:10px;background:#0c0b10;border:3px solid #6b5a3a;border-radius:4px}
.wrymwretch-concentration-card{all:unset;box-sizing:border-box;aspect-ratio:3/4;cursor:pointer;border-radius:3px;position:relative;transition:transform .2s,box-shadow .2s,filter .6s;box-shadow:0 2px 6px rgba(0,0,0,.6)}
.wrymwretch-concentration-card:hover:not(.locked){transform:translateY(-2px);box-shadow:0 0 0 2px rgba(226,179,60,.6),0 6px 12px rgba(0,0,0,.6)}
.wrymwretch-concentration-card.miss{animation:wrymwretch-concentration-miss .5s}
@keyframes wrymwretch-concentration-miss{20%{transform:translateX(-5px);box-shadow:0 0 0 3px #a42a1c}50%{transform:translateX(4px);box-shadow:0 0 0 3px #a42a1c}80%{transform:translateX(-2px)}}
.wrymwretch-concentration-card.won{animation:wrymwretch-concentration-won .9s}
@keyframes wrymwretch-concentration-won{0%{box-shadow:0 0 0 0 rgba(226,179,60,.95)}100%{box-shadow:0 0 0 16px rgba(226,179,60,0)}}
.wrymwretch-concentration-card.fading{animation:wrymwretch-concentration-fade 1.2s}
@keyframes wrymwretch-concentration-fade{0%{filter:brightness(2.2) saturate(0)}100%{filter:none}}
.wrymwretch-concentration-card .lead{position:absolute;right:6%;top:4%;width:22%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 35%,#9aa3ad,#3d434b);border:2px solid ${LEAD};box-shadow:0 1px 3px #000}
.wrymwretch-concentration-card svg,.wrymwretch-concentration-card img{width:100%;height:100%;display:block}
.wrymwretch-concentration-card img{object-fit:fill;border-radius:3px}
.wrymwretch-concentration-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr));max-width:min(620px,calc((100vh - 165px) / 3 * .714 * 4 + 60px))}
.wrymwretch-concentration-lamps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 6px}
.wrymwretch-concentration-lamp{display:flex;flex-direction:column;align-items:center;gap:2px;font:700 11.5px 'Cinzel',Georgia,serif;letter-spacing:.06em;color:#6f6a78;text-align:center}
.wrymwretch-concentration-lamp i{width:16px;height:22px;border:2px solid #6f6a78;border-radius:3px 3px 2px 2px;position:relative;display:block}
.wrymwretch-concentration-lamp i::before{content:"";position:absolute;left:3px;right:3px;top:-6px;height:4px;border:2px solid #6f6a78;border-bottom:0;border-radius:4px 4px 0 0}
.wrymwretch-concentration-lamp.lit{color:#f6e3b4}
.wrymwretch-concentration-lamp.lit i{border-color:${GOLD};background:radial-gradient(circle at 50% 60%,#fff6c8,#f2a93a 70%);box-shadow:0 0 14px rgba(242,169,58,.75)}
.wrymwretch-concentration-lamp.lit i::before{border-color:${GOLD}}
.wrymwretch-concentration-lamp.dark{color:#57525f;text-decoration:line-through}
.wrymwretch-concentration-pages{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.wrymwretch-concentration-pages button small{display:block;font:italic 13px 'Cormorant Garamond',Georgia,serif;letter-spacing:0;text-transform:none}
.wrymwretch-concentration-card:focus-visible{box-shadow:0 0 0 3px ${GOLD}}
.wrymwretch-concentration-card.up{transform:translateY(-3px);box-shadow:0 0 0 3px ${GOLD},0 6px 14px rgba(0,0,0,.6)}
.wrymwretch-concentration-card.locked{cursor:default;box-shadow:0 0 0 2px #c7a24a,0 0 14px rgba(226,179,60,.35)}
.wrymwretch-concentration-side{flex:0 1 250px;min-width:220px;background:#16151d;border:1.5px solid #4a4658;border-radius:6px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.wrymwretch-concentration-h{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.16em;color:#d4d8de}
.wrymwretch-concentration-kept{display:flex;flex-wrap:wrap;gap:6px;min-height:40px}
.wrymwretch-concentration-kept span{width:34px;height:34px;border-radius:50%;overflow:hidden;border:2px solid ${GOLD};display:block}
.wrymwretch-concentration-kept svg{width:100%;height:auto;transform:translateY(-22%)}
.wrymwretch-concentration-kept img{width:100%;height:140%;object-fit:cover;object-position:50% 30%}
.wrymwretch-concentration-line{font-style:italic;font-size:16px;line-height:1.3;color:#e9e1cc;min-height:3.9em}
.wrymwretch-concentration-stats{display:flex;flex-direction:column;gap:10px}
.wrymwretch-concentration-beat{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);width:min(520px,calc(100% - 28px));box-sizing:border-box;z-index:2;background:linear-gradient(135deg,#2a4fa8 0 25%,#1f3f8f 25% 50%,#2a4fa8 50% 75%,#1f3f8f 75%) 0 0/22px 22px;border:5px solid ${LEAD};outline:2px solid #6b5a3a;padding:4px;opacity:0;transition:opacity .5s;pointer-events:none}
.wrymwretch-concentration-beat.on{opacity:1}
.wrymwretch-concentration-beat div{background:${GLASS};color:${LEAD};padding:10px 14px;font-size:17px;line-height:1.35;border:3px solid ${LEAD}}
.wrymwretch-concentration-beat cite{display:block;font:700 12px 'Cinzel',Georgia,serif;font-style:normal;letter-spacing:.12em;color:#7a2a1c;margin-top:3px}
.wrymwretch-concentration-big{font:500 34px 'Cinzel',Georgia,serif;color:${GOLD}}
.wrymwretch-concentration-big small{font-size:16px;color:#9aa3ad}
.wrymwretch-concentration-candle{display:flex;align-items:flex-end;gap:12px;height:90px}
.wrymwretch-concentration-wax{width:22px;background:repeating-linear-gradient(#f3eee2 0 9px,#d9d2c2 9px 10px);border:1.5px solid ${LEAD};position:relative;transition:height .4s}
.wrymwretch-concentration-wax::before{content:"";position:absolute;left:50%;top:-16px;width:8px;height:14px;margin-left:-4px;border-radius:50% 50% 40% 40%;background:radial-gradient(circle at 50% 70%,#fff6c8,#f2a93a 60%,transparent 70%)}
.wrymwretch-concentration-ask{display:flex;flex-direction:column;gap:6px;padding:8px;border:1.5px dashed ${GOLD}}
.wrymwretch-concentration-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.1em;color:${NIGHT};background:${GOLD};border:0;padding:9px 12px;cursor:pointer;min-height:40px}
.wrymwretch-concentration-btn.ghost{background:transparent;color:${GOLD};border:1.5px solid ${GOLD}}
.wrymwretch-concentration-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-concentration-card.lie-open{box-shadow:0 0 0 3px #a42a1c}
.wrymwretch-concentration-panes{position:absolute;inset:0;z-index:4;display:grid;place-items:center;padding:14px;box-sizing:border-box;overflow:auto;background:rgba(13,12,18,.9)}
.wrymwretch-concentration-panes>div{width:min(560px,100%);background:#16151d;border:1.5px solid #6b5a3a;padding:14px 16px 16px;box-sizing:border-box}
.wrymwretch-concentration-panes h3{font:700 19px 'Cinzel',Georgia,serif;margin:0 0 4px;color:#e2b33c;letter-spacing:.06em}
.wrymwretch-concentration-panes p{font-size:17px;line-height:1.35;margin:0 0 10px;color:#f3eee2}
.wrymwretch-concentration-panes .g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.wrymwretch-concentration-panes .g button{all:unset;box-sizing:border-box;aspect-ratio:3/4;cursor:pointer;border-radius:3px;box-shadow:0 2px 6px rgba(0,0,0,.6)}
.wrymwretch-concentration-panes .g button svg{width:100%;height:100%;display:block}
.wrymwretch-concentration-panes .g button:hover:not(:disabled),.wrymwretch-concentration-panes .g button:focus-visible{box-shadow:0 0 0 3px #e2b33c}
.wrymwretch-concentration-panes .g button:disabled{opacity:.25;cursor:default}
.wrymwretch-concentration-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(13,12,18,.8);padding:16px;z-index:3;overflow:auto}
.wrymwretch-concentration-cardx{width:min(400px,100%);box-sizing:border-box;background:${LEAD};padding:6px;clip-path:polygon(0 18%,12% 7%,30% 1.5%,50% 0,70% 1.5%,88% 7%,100% 18%,100% 100%,0 100%)}
.wrymwretch-concentration-cardx .pane{background:linear-gradient(160deg,#f3eee2,#dfe8ea);color:${LEAD};padding:64px 22px 20px;font-size:16px;line-height:1.4;clip-path:polygon(0 17%,12% 6.5%,30% 1.2%,50% 0,70% 1.2%,88% 6.5%,100% 17%,100% 100%,0 100%);position:relative}
.wrymwretch-concentration-cardx .pane::before{content:"";position:absolute;left:50%;top:14px;width:46px;height:46px;margin-left:-23px;border-radius:50%;background:radial-gradient(circle,${GOLD} 0 9px,#a42a1c 9px 15px,#1f5f8b 15px 21px,${LEAD} 21px)}
.wrymwretch-concentration-cardx h2{font:700 23px 'Cinzel',Georgia,serif;margin:0;text-align:center;color:#7a2a1c}
.wrymwretch-concentration-cardx .goal{font-style:italic;font-size:17px;text-align:center;margin:4px 0 12px}
.wrymwretch-concentration-cardx dl{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;margin:0 0 12px;padding:10px 0;border-top:3px solid ${LEAD};border-bottom:3px solid ${LEAD}}
.wrymwretch-concentration-cardx dt{font:700 13px 'Cinzel',Georgia,serif;color:#1f3f8f;white-space:nowrap;padding-top:2px}
.wrymwretch-concentration-cardx dd{margin:0}
.wrymwretch-concentration-cardx .more{font-size:15px;margin:0 0 12px}
.wrymwretch-concentration-cardx .wrymwretch-concentration-btn{display:block;margin:0 auto}
.wrymwretch-concentration-btn:hover:not(:disabled){filter:brightness(1.15)}
.wrymwretch-concentration-btn.on{background:#c7ccd3;color:${NIGHT}}
@media (max-width:560px){.wrymwretch-concentration-page{flex-direction:column-reverse;flex-wrap:nowrap;align-items:stretch;padding:10px;gap:10px}.wrymwretch-concentration-grid,.wrymwretch-concentration-grid.c4{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:6px;flex:none;max-width:none}.wrymwretch-concentration-lamps{grid-template-columns:repeat(6,1fr)}.wrymwretch-concentration-lamp{font-size:10px}.wrymwretch-concentration-side{flex:none;min-width:0;padding:10px 12px;gap:6px}.wrymwretch-concentration-stats{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 14px}.wrymwretch-concentration-big{font-size:24px}.wrymwretch-concentration-candle{height:auto;align-items:center}.wrymwretch-concentration-wax{max-height:30px;margin-top:16px}.wrymwretch-concentration-kept{min-height:0}.wrymwretch-concentration-kept span{width:26px;height:26px}.wrymwretch-concentration-line{min-height:2.6em;font-size:15px}}
`;

function play(root, api, ctx) {
    const ST = ctx.stage, PK = ["ward", "bestiary", "ilvarra"][ST];
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-concentration-root";
    wrap.innerHTML = `<style>${CSS}</style><div class="wrymwretch-concentration-page">
        <div class="wrymwretch-concentration-grid" role="grid" aria-label="Cards"></div>
        <div class="wrymwretch-concentration-side">
          <div class="wrymwretch-concentration-h" data-head>PAIRS KEPT</div>
          <div class="wrymwretch-concentration-kept"></div>
          <div class="wrymwretch-concentration-lamps" hidden aria-label="Lanterns for the bone bridge and the Expanse"></div>
          <div class="wrymwretch-concentration-line" aria-live="polite"></div>
          <div class="wrymwretch-concentration-stats">
          <div><div class="wrymwretch-concentration-h">FLIPS LEFT</div>
          <div class="wrymwretch-concentration-big"><span data-flips></span> <small data-of></small></div></div>
          <div><div class="wrymwretch-concentration-h">NEXT BLANK</div>
          <div class="wrymwretch-concentration-candle"><div class="wrymwretch-concentration-wax"></div><i data-next></i></div></div>
          </div>
          <div data-ask></div>
          <button type="button" class="wrymwretch-concentration-btn ghost" data-lead hidden>Lead a face</button>
          <button type="button" class="wrymwretch-concentration-btn ghost" data-hint>Aetherius: show a blank</button>
        </div></div>
      <div class="wrymwretch-concentration-beat" aria-live="polite"><div></div></div>
      <div class="wrymwretch-concentration-intro"><div class="wrymwretch-concentration-cardx"><div class="pane">
        <h2>Concentration</h2>
        <div data-tabs></div>
        ${[`<p class="goal">Keep the fevered elves' names before their faces go to clear glass.</p>
        <dl>
          <dt>Turn two</dt><dd>match a face to its name; a match is kept</dd>
          <dt>The candle</dt><dd>every few flips one face fades to clear glass for good</dd>
          <dt>Flips</dt><dd>thirty on this page; when they run out, the page closes</dd>
        </dl>
        <p class="more">${gentle ? "Kinder pages this time: more flips, a slower candle. " : ""}A blank can still be kept. You will see how when the first face goes.</p>`,
        `<p class="goal">Keep eight of the ten creatures before their faces go.</p>
        <dl>
          <dt>Twenty cards</dt><dd>a creature's picture and its name; the candle is quicker here</dd>
          <dt>A blank</dt><dd>turn its partner, then the blank, and say <b>This is the one</b>: from memory</dd>
          <dt>Lead a face</dt><dd>twice: spend a flip to lead a card you have seen, and it will not blank</dd>
        </dl>
        <p class="more">${gentle ? "Kinder pages this time: more flips, a slower candle. " : ""}A wrong claim blanks one more card at once.</p>`,
        `<p class="goal">Keep Ilvarra's memories of the Imprisonment, and do not keep a lie.</p>
        <dl>
          <dt>False faces</dt><dd>new: two cards are the Remnants'. A false face shows a different memory each time it is turned</dd>
          <dt>A lie</dt><dd>a pair made with a false face is kept like any other. Tap a kept pair to unpick it (two flips)</dd>
          <dt>Cendre</dt><dd>her face was clear glass before the first flip. Turn her name with the blank pane</dd>
        </dl>
        <p class="more">${gentle ? "More flips this time. " : ""}No candle here. Trust a card when it has shown you the same face twice.</p>`][ST]}
        <div class="wrymwretch-concentration-pages"><button type="button" class="wrymwretch-concentration-btn" data-start data-page="${PK}">Turn the cards</button></div></div></div></div>`;
    root.appendChild(wrap);
    const gridEl = wrap.querySelector(".wrymwretch-concentration-grid"), keptEl = wrap.querySelector(".wrymwretch-concentration-kept"), lampsEl = wrap.querySelector(".wrymwretch-concentration-lamps");
    const lineEl = wrap.querySelector(".wrymwretch-concentration-line"), flipsEl = wrap.querySelector("[data-flips]"), headEl = wrap.querySelector("[data-head]");
    const wax = wrap.querySelector(".wrymwretch-concentration-wax"), nextEl = wrap.querySelector("[data-next]"), askEl = wrap.querySelector("[data-ask]");
    const hintBtn = wrap.querySelector("[data-hint]"), leadBtn = wrap.querySelector("[data-lead]");
    const beatEl = wrap.querySelector(".wrymwretch-concentration-beat");
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let dead = false;

    let P = PAGES.ward, ITEMS = P.items, WIN = P.win, BUDGET = 30, INTERVAL = 8, LEADS = 2;
    let cards = [];
    const st = { lies: 0, caught: 0, cendre: "", up: [], flips: 0, since: 0, kept: 0, busy: false, over: false, hint: true, peek: -1, started: false, leads: 0, leading: false, claims: 0, quick: false, beats: new Set(), blanks: 0 };
    const pics = {};   // art id -> data URL, as each pane is drawn
    let backUrl = "";
    let beatTimer = null;
    function beat(html, ms = 6500) {
      beatEl.firstChild.innerHTML = html; beatEl.classList.add("on");
      if (beatTimer) { clearTimeout(beatTimer); timers.delete(beatTimer); }
      beatTimer = setTimeout(() => { timers.delete(beatTimer); beatEl.classList.remove("on"); }, ms); timers.add(beatTimer);
    }
    const once = (id, html, ms) => { if (st.beats.has(id)) return; st.beats.add(id); beat(html, ms); };
    const fx = (el, cls) => { if (api.reducedMotion) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    const BACK = back();
    const picOf = (c) => (c.caught ? maskFace : (c.kind === "pic" || c.art) && pics[c.artId] ? `<img alt="" draggable="false" src="${pics[c.artId]}">` : c.faceSvg || blankFace);
    const IL = PK === "ilvarra";
    const showing = (c) => (c.kind === "false" ? MEMS[c.show].name + " picture" : c.kind === "cname" ? "Cendre's name" : c.kind === "cface" ? "Cendre's face" : c.kind === "cblank" ? "a blank pane, clear glass" : c.kind === "half" ? ITEMS[c.p].bName || ITEMS[c.p].name + " name" : ITEMS[c.p].name + " picture");

    function begin(pageKey) {
      P = PAGES[pageKey] || PAGES.ward; ITEMS = P.items; WIN = P.win; LEADS = P.leads;
      BUDGET = P.budget[gentle ? 1 : 0]; INTERVAL = P.interval[gentle ? 1 : 0];
      st.flips = BUDGET; st.leads = LEADS;
      gridEl.classList.toggle("c4", P.cols === 4);
      wrap.querySelector("[data-of]").textContent = "/ " + BUDGET;
      cards = [];
      if (IL) {
        ITEMS.forEach((c, p) => { cards.push({ p, kind: "pic", art: true, aid: c.a }, { p, kind: "half", art: !!c.b, aid: c.b || c.a }); });
        cards.push({ p: -1, kind: "cname", art: true, aid: "glass-memory-cendre-name" }, { p: -1, kind: "cblank", art: true, aid: "glass-cendre-blank" });
        const off = Math.floor(R() * 4); cards.push({ p: -2, kind: "false", art: true, show: off, aid: MEMS[off].a }, { p: -2, kind: "false", art: true, show: (off + 2) % 4, aid: MEMS[(off + 2) % 4].a });
        wrap.querySelector(".wrymwretch-concentration-candle").parentNode.hidden = true; hintBtn.hidden = true;
      } else
      ITEMS.forEach((c, p) => { cards.push({ p, kind: "pic" }, { p, kind: "name" }); });
      for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
      cards.forEach((c, i) => {
        c.blank = false; c.locked = false; c.i = i; c.seen = false; c.leaded = false;
        c.artId = c.aid || P.artId(ITEMS[c.p]);
        c.faceSvg = c.p >= 0 ? face(ITEMS[c.p], c.kind === "half" ? "name" : c.kind, i * 0.37) : "";
        c.el = document.createElement("button");
        c.el.type = "button"; c.el.className = "wrymwretch-concentration-card";
        c.el.addEventListener("click", () => pick(c));
        gridEl.appendChild(c.el);
      });
      // the glass panes, drawn once each at card size
      png(api.art, "glass-back", { w: 180 }).then((u) => { if (u && !dead) { backUrl = u; paint(true); } });
      [...new Set(cards.map((c) => c.artId).concat(IL ? MEMS.map((m) => m.a).concat("glass-memory-cendre-face") : []))].forEach((id) => { png(api.art, id, { w: 180 }).then((u) => { if (u && !dead) { pics[id] = u; paint(true); } }); });
      if (P.key === "ward") {
        lampsEl.hidden = false; keptEl.hidden = true;
        lampsEl.innerHTML = ITEMS.map((it) => `<span class="wrymwretch-concentration-lamp" data-lamp="${it.id}"><i></i>${it.name}</span>`).join("");
        lineEl.textContent = "Twelve sleepers in blankets, wings drooping. Their names are going.";
      } else lineEl.textContent = IL ? "Ilvarra's memories of the Imprisonment, laid face down at her fire. Two of these cards are not hers." : "The healers' creature cards. Their faces are going.";
      paint(true);
    }
    function paint(force) {
      cards.forEach((c, i) => {
        const shown = c.locked || st.up.includes(c) || st.peek === i;
        const state = (c.caught ? "caught" : shown ? (c.blank && st.peek !== i ? "blank" : "face" + (c.artId || "")) : "back") + (c.leaded && !c.locked ? "+lead" : "");
        if (force || c.el._state !== state) {
          c.el._state = state;
          c.el.innerHTML = (c.caught ? maskFace : shown ? (c.blank && st.peek !== i ? blankFace : picOf(c)) : backUrl ? `<img alt="" draggable="false" src="${backUrl}">` : BACK) + (c.leaded && !c.locked ? `<i class="lead" aria-hidden="true"></i>` : "");
        }
        c.el.classList.toggle("up", st.up.includes(c));
        c.el.classList.toggle("locked", c.locked);
        if (IL) c.el.setAttribute("aria-label", c.caught ? "a Remnant card, unmasked" : c.locked ? `${showing(c)}, kept` : shown ? showing(c) : "face-down card");
        else c.el.setAttribute("aria-label", c.locked ? `${ITEMS[c.p].name}, kept` : shown ? (c.blank ? "blank card, face up" : `${ITEMS[c.p].name} ${c.kind === "pic" ? (P.key === "ward" ? "face" : "picture") : "name"}`) : "face-down card");
      });
      flipsEl.textContent = st.flips;
      headEl.textContent = IL ? `MEMORIES KEPT ${st.kept + st.lies} / ${ITEMS.length} · CENDRE ${st.cendre === "kept" ? "KEPT" : st.cendre === "lost" ? "LOST" : "CLEAR GLASS"}` : P.key === "ward" ? `NAMES KEPT ${st.kept} / ${ITEMS.length} · LANTERNS` : `PAIRS KEPT ${st.kept} / ${ITEMS.length} · song at ${WIN}`;
      wax.style.height = 10 + 60 * (1 - st.since / INTERVAL) + "px";
      nextEl.textContent = `in ${INTERVAL - st.since} flip${INTERVAL - st.since === 1 ? "" : "s"}`;
      hintBtn.disabled = !st.hint || !cards.some((c) => c.blank && !c.locked) || st.over;
      leadBtn.textContent = st.leading ? "Choose a seen card…" : `Lead a face (${st.leads})`;
      leadBtn.disabled = st.leads < 1 || st.over || st.busy || st.up.length > 0; leadBtn.classList.toggle("on", st.leading);
    }
    function blankOne(exclude = []) {
      // the faces that go are ones the player has already seen, so memory can still keep them
      const all = cards.filter((c) => !c.locked && !c.blank && !c.leaded && !exclude.includes(c));
      const seenPool = all.filter((c) => c.seen);
      const pool = seenPool.length ? seenPool : all;
      if (!pool.length) return;
      const c = pool[Math.floor(R() * pool.length)];
      c.blank = true; st.blanks++; fx(c.el, "fading");
      if (st.blanks === 1) { leadBtn.hidden = false; beat(`A face goes to clear glass. It is still a card: turn its partner, then the blank, and say <b>This is the one</b>. <cite>New: Lead a face, twice. Spend a flip to lead a card you have seen, and it will not blank</cite>`, 9000); }
    }
    function countFlip() {
      st.flips--; st.since++;
      if (st.since >= INTERVAL) { st.since = 0; blankOne(st.up); lineEl.textContent = "A face has gone to clear glass."; }
      if (!IL && !st.quick && st.flips <= BUDGET / 2) { st.quick = true; INTERVAL = Math.max(4, INTERVAL - 1); st.since = Math.min(st.since, INTERVAL - 1); beat(`In the next room a sleeper cries out and forgets the healer's name. The plague quickens. <cite>A face now blanks every ${INTERVAL} flips</cite>`, 6500); }
    }
    function keep(a, b) {
      a.locked = b.locked = true; a.blank = b.blank = false; st.kept++;
      const c = ITEMS[a.p];
      const m = document.createElement("span"); m.innerHTML = picOf(cards.find((x) => x.p === a.p && x.kind === "pic")); m.title = c.name;
      keptEl.appendChild(m);
      lineEl.textContent = `${c.name}. ${c.line}`;
      fx(a.el, "won"); fx(b.el, "won");
      if (P.key === "ward") {
        const lamp = lampsEl.querySelector(`[data-lamp="${c.id}"]`); lamp && lamp.classList.add("lit");
        if (st.kept === 1) once("lamp1", `The healer writes <b>${c.name}</b> on a slip and ties it to a lantern. <q>A name somebody kept is a light somebody can walk by.</q> <cite>Names become ground · a lantern for the bone bridge and the Expanse</cite>`, 8000);
        if (st.kept === WIN) once("kw", `Four lanterns named. Whatever is lost now, the road at the end will not be all dark. <cite>Lose three names and three stretches go dark</cite>`);
        return;
      }
      if (IL) return;
      if (st.kept === 4) once("k4", `A Tidecaller healer reads the kept pages aloud, one by one, so the room will not forget them twice. <cite>4 kept · the song needs ${WIN}</cite>`);
      if (st.kept === WIN) once("k8", `Eight creatures held. The healers begin to hum the healing song the Galechanters asked for. <cite>The song is safe · keep going if you can</cite>`);
    }
    // III: a pair made with a false face is kept like any other, and is a lie until it is unpicked
    function keepLie(a, b) {
      const f = a.kind === "false" ? a : b, h = f === a ? b : a;
      a.locked = b.locked = true; a.lie = b.lie = true; a.mate = b; b.mate = a; st.lies++; f.artId = MEMS[f.show].a;
      const m = document.createElement("span"); m.innerHTML = picOf(f); m.title = MEMS[h.p].name; m.dataset.lie = h.p; keptEl.appendChild(m);
      lineEl.textContent = `${MEMS[h.p].name}. ${MEMS[h.p].line}`;
      fx(a.el, "won"); fx(b.el, "won");
    }
    function unpick(c) {
      const m = c.mate; if (!m || st.busy || st.up.length) return;
      st.flips = Math.max(0, st.flips - 2); c.locked = m.locked = false; c.mate = m.mate = null;
      if (c.lie) {
        const f = c.kind === "false" ? c : m, h = f === c ? m : c; c.lie = m.lie = false; st.lies--; st.caught++; f.caught = true; f.locked = true;
        const medal = keptEl.querySelector(`[data-lie="${h.p}"]`); medal && medal.remove();
        lineEl.textContent = `Unpicked. The pane that passed for ${MEMS[h.p].name} was a Remnant's, and it is out of the game.`;
        once("caught", `Under the kept pair, one pane has no memory in it at all: a mask, and somebody else's hand. Ilvarra turns it face down on the ground. <cite>A lie unpicked · the true half is back on the table</cite>`, 8000);
      } else { st.kept--; const k = [...keptEl.children].find((x) => x.title === ITEMS[c.p].name && !x.dataset.lie); k && k.remove(); lineEl.textContent = `Unpicked: ${ITEMS[c.p].name} was true. Both halves are back on the table.`; }
      paint(); if (st.flips <= 0) later(settle, 400);
    }
    function cendre(a, b) {   // the set-piece: eight blank panes, and only the lead line to know her by
      st.busy = true;
      const order = PANES.map((p, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const ov = document.createElement("div"); ov.className = "wrymwretch-concentration-panes"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Eight blank panes");
      ov.innerHTML = `<div><h3>Cendre</h3><p>Her face went to clear glass before the first flip. Eight blank panes came out of the same window, and nothing is left in any of them but the lead. All Ilvarra said of her at the fire: one horn shorter than the other. <b data-left>Three tries.</b></p>
        <div class="g">${order.map((i) => `<button type="button" data-pane="${i}" aria-label="blank pane: ${PANES[i][0] === PANES[i][1] ? "both horns the same length" : "one horn shorter than the other"}">${pane(PANES[i])}</button>`).join("")}</div></div>`;
      wrap.appendChild(ov);
      let tries = 3;
      ov.querySelectorAll("[data-pane]").forEach((bt) => bt.addEventListener("click", () => {
        const i = +bt.dataset.pane;
        if (PANES[i][0] !== PANES[i][1]) {
          st.cendre = "kept"; ov.remove(); a.locked = b.locked = true; const bl = a.kind === "cblank" ? a : b; bl.artId = "glass-memory-cendre-face"; bl.kind = "cface";
          lineEl.textContent = "Cendre. Ember-coloured, one horn shorter than the other. The face comes back into the glass.";
          beat(`The lead lines fill: orange, then the dark of the eye. Ilvarra does not touch the pane. <q>Her name was Cendre,</q> she says, as if she had been asked. <cite>Kept from clear glass, by its lead alone</cite>`, 9000);
          fx(a.el, "won"); fx(b.el, "won"); return settle();
        }
        tries--; bt.disabled = true; ov.querySelector("[data-left]").textContent = tries === 1 ? "One try left." : `${tries} tries left.`;
        if (tries <= 0) { st.cendre = "lost"; ov.remove(); a.locked = b.locked = true; lineEl.textContent = "Three wrong panes. Whichever was hers, nobody can say now."; settle(); }
      }));
      ov.querySelector("[data-pane]").focus();
    }
    function settle() {
      st.up = []; st.busy = false; askEl.innerHTML = ""; paint();
      if (IL) { if (st.cendre === "lost" || (st.kept === ITEMS.length && st.cendre) || st.flips <= 0) return finish(); return; }
      if (st.kept === ITEMS.length) return finish();
      if (st.flips <= 0) return finish();
    }
    function finish() {
      st.over = true; paint();
      const win = IL ? st.cendre === "kept" && st.kept >= WIN && st.lies === 0 : st.kept >= WIN;
      api.store.set("losses", win ? 0 : losses + 1);
      const keptNames = ITEMS.filter((c, p) => cards.some((x) => x.p === p && x.locked && !x.lie)).map((c) => c.name);
      const lost = ITEMS.filter((c, p) => !cards.some((x) => x.p === p && x.locked && !x.lie)).map((c) => c.name);
      if (P.key === "ward") { try { api.shared.set("ward", { kept: keptNames, lost }); } catch { /* no storage */ } }
      if (IL) {
        const lies = ITEMS.filter((c, p) => cards.some((x) => x.p === p && x.lie)).map((c) => c.name);
        return later(() => { if (dead) return; ctx.done(wrap, { win, record: { realm: "wrymreach", title: "Concentration III: Ilvarra's memories", sub: "At her fire · chapter 9, The Last Witness", divider: 2, pic: st.cendre === "kept" ? "glass-memory-cendre-face" : "glass-cendre-blank", lines: [
          st.cendre === "kept" ? "Cendre's face: kept from clear glass, by one horn shorter than the other." : { t: st.cendre === "lost" ? "Cendre's face: lost among eight blank panes." : "Cendre's face: still clear glass. Her name was never turned with it.", kind: "lost" },
          keptNames.length ? `Kept, and true: ${keptNames.join(", ")}.` : null,
          ...lies.map((n) => ({ t: `${n}: a lie, locked into the Record. The pane that matched it was a Remnant's.`, kind: "lost" })),
          lost.filter((n) => !lies.includes(n)).length ? { t: `Not kept: ${lost.filter((n) => !lies.includes(n)).join(", ")}.`, kind: "lost" } : null,
          st.caught ? `Remnant cards unmasked: ${st.caught} of 2.` : null ] },
          text: win ? `${st.kept} of Ilvarra's four memories kept, every one of them true${st.caught ? `, and ${st.caught} Remnant card${st.caught > 1 ? "s" : ""} unmasked` : ""}. Cendre's face came back out of clear glass by nothing but its lead: one horn shorter than the other. Ilvarra holds the pane to the fire and looks through it at the bridge.`
            : `${st.cendre !== "kept" ? "Cendre's face stays clear glass. " : ""}${lies.length ? `${lies.join(" and ")} ${lies.length > 1 ? "are" : "is"} kept as a lie: the Record now remembers what a Remnant showed it. ` : ""}${st.kept} of four memories kept true. Ilvarra gathers the panes without counting them.${kinder0()}` }); }, 500);
      }
      if (P.key === "ward") lampsEl.querySelectorAll(".wrymwretch-concentration-lamp:not(.lit)").forEach((l) => l.classList.add("dark"));
      const kinder = losses + 1 >= 2 ? " The next page will be kinder." : "";
      const result = P.key === "ward"
        ? (win ? { outcome: "win", text: `${st.kept} of 6 names kept in the ward${st.claims ? `, ${st.claims} of them from clear glass` : ""}: ${keptNames.join(", ")}. Each is a lantern now, with the name on it, waiting on the bone bridge and in the Expanse.${lost.length ? ` ${lost.join(" and ")} could not be held; ${lost.length === 1 ? "that stretch" : "those stretches"} will be dark.` : " Not one sleeper was lost."}${st.kept >= 5 ? " The Galechanters will trust Aeris for this." : ""}` }
          : { outcome: "lose", text: `${st.kept} of 6 names kept. ${lost.join(", ")} have gone to clear glass, and three stretches or more of the last road will be dark. The whisper goes on through the ward: “Remember me.” (WW 49)${kinder}` })
        : (win ? { outcome: "win", text: `${st.kept} of 10 creatures kept${st.claims ? `, ${st.claims} of them from clear glass` : ""}. The healing song is written into the Record for the Galechanters, and the kept pages ink back in.${lost.length ? ` Still clear glass: ${lost.join(", ")}.` : " Not one face was lost."}` }
          : { outcome: "lose", text: `${st.kept} of 10 creatures kept, short of the ${WIN} the healing song needs. The healers stop humming; ${lost.slice(0, 3).join(", ")}${lost.length > 3 ? " and the rest" : ""} stay clear glass.${kinder}` });
      later(() => {
        if (dead) return;
        ctx.done(wrap, { win: result.outcome === "win", text: result.text, record: P.key === "ward"
          ? { realm: "north", title: "Concentration I: the fevered's names", sub: "Galewing page · chapter 2, Remember Me", divider: 2, lines: [
            ...keptNames.map((n) => ({ t: `${n}: kept. A lantern carries the name.`, kind: "link" })),
            ...lost.map((n) => ({ t: `${n}: gone to clear glass. That stretch is dark.`, kind: "lost" })),
            { t: `Galewing memory +${st.kept * 2}.${st.kept >= 5 ? " The Galechanters trust Aeris." : ""}`, note: "Names become ground: the lanterns stand on the bone bridge and in the Expanse." }] }
          : { realm: "wrymreach", title: "Concentration II: the bestiary", sub: "The Rim Moot · chapter 8", divider: 2, lines: [
            `Pages restored: ${keptNames.join(", ") || "none"}.`,
            lost.length ? { t: `Still clear glass: ${lost.join(", ")}.`, kind: "lost" } : null,
            win ? "The healing song, for the Priest of the Gale." : { t: "The healing song: not learned.", kind: "lost" }] } });
      }, 500);
    }
    const kinder0 = () => (losses + 1 >= 2 ? " The next page will be kinder." : "");
    function pick(c) {
      if (IL && c.locked && !c.caught && c.mate && st.started && !st.busy && !st.over && !st.up.length) return unpick(c);
      if (!st.started || st.busy || st.over || c.locked || st.up.includes(c)) return;
      if (c.kind === "false") { c.show = (c.show + 1) % MEMS.length; let n = 0; while (n++ < 4 && cards.some((x) => x.p === c.show && x.kind === "pic" && x.locked && !x.lie)) c.show = (c.show + 1) % MEMS.length; c.artId = MEMS[c.show].a; }
      if (st.leading) {
        if (!c.seen || c.blank || c.leaded) { lineEl.textContent = c.blank ? "A blank face cannot be led." : c.leaded ? "That card is already led." : "Lead only a card you have already seen face-up."; return; }
        st.leading = false; st.leads--; c.leaded = true; countFlip();
        lineEl.textContent = `Lead set round ${P.key === "ward" ? "" : "the "}${ITEMS[c.p].name}${c.kind === "pic" ? (P.key === "ward" ? "'s face" : " picture") : P.key === "ward" ? "'s name" : " name"}. It will not blank.`;
        paint(); if (st.flips <= 0) later(settle, 300); return;
      }
      st.up.push(c); c.seen = true; countFlip(); paint();
      if (st.up.length < 2) { if (st.flips <= 0) later(settle, 700); return; }
      const [a, b] = st.up;
      if (IL) {
        const kinds = [a.kind, b.kind].sort().join("+");
        if (kinds === "cblank+cname") return cendre(a, b);
        if (a.p === b.p && a.p >= 0 && a.kind !== b.kind) { a.mate = b; b.mate = a; keep(a, b); return settle(); }
        const f = a.kind === "false" ? a : b.kind === "false" ? b : null, h = f === a ? b : a;
        if (f && h.kind === "half" && h.p === f.show) { keepLie(a, b); return settle(); }
        if (f && h.kind === "pic" && h.p === f.show) once("twin", `Two panes with the same picture. Ilvarra frowns. She has only one memory of it. <cite>One of the two is not hers: see which keeps its face</cite>`, 8000);
        if ((a.kind === "cblank" || b.kind === "cblank") && !st.beats.has("cb")) once("cb", `A pane of clear glass, on the table before anyone turned a card. Somebody's face was in it. <cite>Turn it with her name</cite>`, 7000);
        st.busy = true; fx(a.el, "miss"); fx(b.el, "miss");
        return later(settle, 950);
      }
      if (a.blank || b.blank) {
        st.busy = true;
        askEl.innerHTML = `<div class="wrymwretch-concentration-ask"><span>One of these faces is gone. Is this its pair?</span>
          <button type="button" class="wrymwretch-concentration-btn" data-yes>This is the one</button>
          <button type="button" class="wrymwretch-concentration-btn ghost" data-no>Turn them back</button></div>`;
        askEl.querySelector("[data-yes]").addEventListener("click", () => {
          if (a.p === b.p) { st.claims++; keep(a, b); lineEl.textContent += " The face returns."; }
          else { fx(a.el, "miss"); fx(b.el, "miss"); blankOne([a, b]); lineEl.textContent = "Not its pair. Another face goes to glass."; }
          settle();
        });
        askEl.querySelector("[data-no]").addEventListener("click", settle);
        askEl.querySelector("[data-yes]").focus();
        return;
      }
      if (a.p === b.p) { keep(a, b); settle(); return; }
      st.busy = true; fx(a.el, "miss"); fx(b.el, "miss");
      later(settle, 950);
    }
    leadBtn.addEventListener("click", () => { if (st.leads < 1 || st.over || st.busy || st.up.length) return; st.leading = !st.leading; lineEl.textContent = st.leading ? "Choose a face-down card you have seen. Leading it costs a flip." : ""; paint(); });
    hintBtn.addEventListener("click", () => {
      const pool = cards.filter((c) => c.blank && !c.locked);
      if (!st.hint || !pool.length || st.over) return;
      st.hint = false; const c = pool[Math.floor(R() * pool.length)];
      st.peek = c.i; paint();
      lineEl.textContent = "Aetherius's telepathy: one lost face, for two seconds.";
      later(() => { st.peek = -1; paint(); }, 2000);
    });
    const intro = wrap.querySelector(".wrymwretch-concentration-intro");
    opening(api.art, intro, PAGES[PK].chapter);
    ctx.picker(intro.querySelector("[data-tabs]"));
    intro.querySelectorAll("[data-page]").forEach((b) => {
      b.addEventListener("click", () => {
        intro.remove(); begin(b.dataset.page); st.started = true; cards[0].el.focus();
        if (IL) beat(`The night before the bridge, at Ilvarra's fire. She lays out what she has left of the Imprisonment, in glass, and asks you to help her hold it. Some of these panes were put among hers. <cite>Turn two cards · a face that changes is not hers</cite>`, 9000);
        else if (P.key === "ward" && ctx.second) beat(`The healers' ward again. From the beds the whisper goes round as it did before: <q>Remember me.</q> You know now what remembering is. Each name you keep here is a name somebody will have to carry. <cite>WW 49 · the second time · turn two cards</cite>`, 9000);
        else if (P.key === "ward") beat(`The healers' ward, in the sky-city. <q>They speak of voices in the wind. They say the stars are calling them by name.</q> Match each sleeper's face to their name before the face goes. <cite>WW 47 · turn two cards</cite>`, 8000);
        else beat(`With the Tidecaller healers. The bestiary's creature pages are going blank with the plague, and the healers need eight of them whole to sing the healing song. <cite>Turn two cards</cite>`, 7000);
      });
    });
    intro.querySelector("[data-page]").focus();
    return { unmount() { st.over = true; dead = true; timers.forEach(clearTimeout); wrap.remove(); } };
}

export default staged({ stages: LADDER }, play);

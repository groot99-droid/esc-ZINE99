// WrymWretch · Concentration (1D, Stained glass). DESIGN.md section 11, Concentration.
// One page: s_conc_bestiary (20 cards, 10 pairs: a creature's picture and its name; blank interval
// 6; flip budget 44; 8 pairs kept wins the healing song). Every 6 flips one unmatched face fades to
// clear glass for good. A blank can still be matched: turn its partner, then the blank, and say
// "This is the one". Right, and the face returns; wrong, and one more card blanks at once.
// Aetherius's telepathy shows one blank face for 2 s, once. Remembrance lines: data/bestiary.json.
// Refinements: Lead a face (added): twice a page, spend a flip to lead a face-down card you have seen
// so it cannot blank. Halfway through the flips the plague quickens and the blank interval drops to 5.
// A blank falls on a card the player has already seen, when there is one (retuned: a never-seen card
// that blanked was pure luck). After two losses in a row: 50 flips and a blank every 7 (api.store).

const LEAD = "#15130f", GLASS = "#f3eee2", CLEAR = "#dfe8ea", NIGHT = "#1d1c26", GOLD = "#e2b33c";
const REALM = { west: ["#4f6b2e", "#d79a2b"], north: ["#7fa6cf", "#c7ccd3"], south: ["#c88a2e", "#e8571c"], east: ["#1f5f8b", "#8fb7c9"], below: ["#5b3a7a", "#2e2440"], above: ["#d4a72c", "#fbf6e4"] };
const CREATURES = [
  { id: "grove_stag", name: "Grove Stag", realm: "west", line: "It walked the groves at dusk, and the moss stood up where it had passed.",
    art: `<path d="M50,82 L41,56 L43,42 L50,37 L57,42 L59,56 Z"/><path d="M45,42 L34,26 L26,30 M34,26 L31,13 M55,42 L66,26 L74,30 M66,26 L69,13" fill="none" stroke-width="5"/>` },
  { id: "whisperfox", name: "Whisperfox", realm: "west", line: "It carried the rangers' calls from tree to tree, so no one in the groves was ever lost.",
    art: `<path d="M28,24 L42,46 L58,46 L72,24 L68,58 L50,80 L32,58 Z"/><circle cx="42" cy="56" r="3" fill="${LEAD}"/><circle cx="58" cy="56" r="3" fill="${LEAD}"/>` },
  { id: "stormrider", name: "Stormrider", realm: "north", line: "It ran messages between the sky-cities on the high winds, faster than any sail.",
    art: `<path d="M10,50 Q30,26 50,46 Q70,26 90,50 Q70,42 50,62 Q30,42 10,50 Z"/><path d="M50,46 L46,74 L50,68 L54,74 Z"/>` },
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
const WIN = 8, LEADS = 2;

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
.wrymwretch-concentration-card svg{width:100%;height:100%;display:block}
.wrymwretch-concentration-card:focus-visible{box-shadow:0 0 0 3px ${GOLD}}
.wrymwretch-concentration-card.up{transform:translateY(-3px);box-shadow:0 0 0 3px ${GOLD},0 6px 14px rgba(0,0,0,.6)}
.wrymwretch-concentration-card.locked{cursor:default;box-shadow:0 0 0 2px #c7a24a,0 0 14px rgba(226,179,60,.35)}
.wrymwretch-concentration-side{flex:0 1 250px;min-width:220px;background:#16151d;border:1.5px solid #4a4658;border-radius:6px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.wrymwretch-concentration-h{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.16em;color:#d4d8de}
.wrymwretch-concentration-kept{display:flex;flex-wrap:wrap;gap:6px;min-height:40px}
.wrymwretch-concentration-kept span{width:34px;height:34px;border-radius:50%;overflow:hidden;border:2px solid ${GOLD};display:block}
.wrymwretch-concentration-kept svg{width:100%;height:auto;transform:translateY(-22%)}
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
@media (max-width:560px){.wrymwretch-concentration-page{flex-direction:column-reverse;flex-wrap:nowrap;align-items:stretch;padding:10px;gap:10px}.wrymwretch-concentration-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:6px;flex:none;max-width:none}.wrymwretch-concentration-side{flex:none;min-width:0;padding:10px 12px;gap:6px}.wrymwretch-concentration-stats{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 14px}.wrymwretch-concentration-big{font-size:24px}.wrymwretch-concentration-candle{height:auto;align-items:center}.wrymwretch-concentration-wax{max-height:30px;margin-top:16px}.wrymwretch-concentration-kept{min-height:0}.wrymwretch-concentration-kept span{width:26px;height:26px}.wrymwretch-concentration-line{min-height:2.6em;font-size:15px}}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const BUDGET = gentle ? 50 : 44;
    let INTERVAL = gentle ? 7 : 6;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-concentration-root";
    wrap.innerHTML = `<style>${CSS}</style><div class="wrymwretch-concentration-page">
        <div class="wrymwretch-concentration-grid" role="grid" aria-label="Creature cards"></div>
        <div class="wrymwretch-concentration-side">
          <div class="wrymwretch-concentration-h">PAIRS KEPT <span data-n>0</span> / 10 · song at ${WIN}</div>
          <div class="wrymwretch-concentration-kept"></div>
          <div class="wrymwretch-concentration-line" aria-live="polite">The healers' creature cards. Their faces are going.</div>
          <div class="wrymwretch-concentration-stats">
          <div><div class="wrymwretch-concentration-h">FLIPS LEFT</div>
          <div class="wrymwretch-concentration-big"><span data-flips>${BUDGET}</span> <small>/ ${BUDGET}</small></div></div>
          <div><div class="wrymwretch-concentration-h">NEXT BLANK</div>
          <div class="wrymwretch-concentration-candle"><div class="wrymwretch-concentration-wax"></div><i data-next></i></div></div>
          </div>
          <div data-ask></div>
          <button type="button" class="wrymwretch-concentration-btn ghost" data-lead hidden>Lead a face (${LEADS})</button>
          <button type="button" class="wrymwretch-concentration-btn ghost" data-hint>Aetherius: show a blank</button>
        </div></div>
      <div class="wrymwretch-concentration-beat" aria-live="polite"><div></div></div>
      <div class="wrymwretch-concentration-intro"><div class="wrymwretch-concentration-cardx"><div class="pane">
        <h2>Concentration</h2>
        <p class="goal">Keep ${WIN} of the ten creatures before their faces go.</p>
        <dl>
          <dt>Turn two</dt><dd>match a creature's picture to its name; a match is kept</dd>
          <dt>The candle</dt><dd>every ${INTERVAL} flips a face fades to clear glass</dd>
          <dt>Flips</dt><dd>${BUDGET} in all; when they run out, the page closes</dd>
        </dl>
        <p class="more">${gentle ? `A kinder page this time: ${BUDGET} flips, a blank every ${INTERVAL}. ` : ""}A blank can still be kept. You will see how when the first face goes.</p>
        <button type="button" class="wrymwretch-concentration-btn" data-start>Begin</button></div></div></div>`;
    root.appendChild(wrap);
    const gridEl = wrap.querySelector(".wrymwretch-concentration-grid"), keptEl = wrap.querySelector(".wrymwretch-concentration-kept");
    const lineEl = wrap.querySelector(".wrymwretch-concentration-line"), flipsEl = wrap.querySelector("[data-flips]"), nEl = wrap.querySelector("[data-n]");
    const wax = wrap.querySelector(".wrymwretch-concentration-wax"), nextEl = wrap.querySelector("[data-next]"), askEl = wrap.querySelector("[data-ask]");
    const hintBtn = wrap.querySelector("[data-hint]"), leadBtn = wrap.querySelector("[data-lead]");
    const beatEl = wrap.querySelector(".wrymwretch-concentration-beat");
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    const cards = [];
    CREATURES.forEach((c, p) => { cards.push({ p, kind: "pic" }, { p, kind: "name" }); });
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    const st = { up: [], flips: BUDGET, since: 0, kept: 0, busy: false, over: false, hint: true, peek: -1, started: false, leads: LEADS, leading: false, claims: 0, quick: false, beats: new Set(), blanks: 0 };
    let beatTimer = null;
    function beat(html, ms = 6500) {
      beatEl.firstChild.innerHTML = html; beatEl.classList.add("on");
      if (beatTimer) { clearTimeout(beatTimer); timers.delete(beatTimer); }
      beatTimer = setTimeout(() => { timers.delete(beatTimer); beatEl.classList.remove("on"); }, ms); timers.add(beatTimer);
    }
    const once = (id, html, ms) => { if (st.beats.has(id)) return; st.beats.add(id); beat(html, ms); };
    const fx = (el, cls) => { if (api.reducedMotion) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    cards.forEach((c, i) => {
      c.blank = false; c.locked = false; c.i = i; c.seen = false; c.leaded = false;
      c.faceSvg = face(CREATURES[c.p], c.kind, i * 0.37);
      c.el = document.createElement("button");
      c.el.type = "button"; c.el.className = "wrymwretch-concentration-card";
      c.el.addEventListener("click", () => pick(c));
      gridEl.appendChild(c.el);
    });
    const BACK = back();
    function paint() {
      cards.forEach((c, i) => {
        const shown = c.locked || st.up.includes(c) || st.peek === i;
        const html = (shown ? (c.blank && st.peek !== i ? blankFace : c.faceSvg) : BACK) + (c.leaded && !c.locked ? `<i class="lead" aria-hidden="true"></i>` : "");
        if (c.el._html !== html) { c.el.innerHTML = html; c.el._html = html; }
        c.el.classList.toggle("up", st.up.includes(c));
        c.el.classList.toggle("locked", c.locked);
        c.el.setAttribute("aria-label", c.locked ? `${CREATURES[c.p].name}, kept` : shown ? (c.blank ? "blank card, face up" : `${CREATURES[c.p].name} ${c.kind === "pic" ? "picture" : "name"}`) : "face-down card");
      });
      flipsEl.textContent = st.flips; nEl.textContent = st.kept;
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
      if (!st.quick && st.flips <= BUDGET / 2) { st.quick = true; INTERVAL = Math.max(4, INTERVAL - 1); st.since = Math.min(st.since, INTERVAL - 1); beat(`In the next room a sleeper cries out and forgets the healer's name. The plague quickens. <cite>A face now blanks every ${INTERVAL} flips</cite>`, 6500); }
    }
    function keep(a, b) {
      a.locked = b.locked = true; a.blank = b.blank = false; st.kept++;
      const c = CREATURES[a.p];
      const m = document.createElement("span"); m.innerHTML = cards.find((x) => x.p === a.p && x.kind === "pic").faceSvg; m.title = c.name;
      keptEl.appendChild(m);
      lineEl.textContent = `${c.name}. ${c.line}`;
      fx(a.el, "won"); fx(b.el, "won");
      if (st.kept === 4) once("k4", `A Tidecaller healer reads the kept pages aloud, one by one, so the room will not forget them twice. <cite>4 kept · the song needs ${WIN}</cite>`);
      if (st.kept === WIN) once("k8", `Eight creatures held. The healers begin to hum the healing song the Galechanters asked for. <cite>The song is safe · keep going if you can</cite>`);
    }
    function settle() {
      st.up = []; st.busy = false; askEl.innerHTML = ""; paint();
      if (st.kept === CREATURES.length) return finish();
      if (st.flips <= 0) return finish();
    }
    function finish() {
      st.over = true; paint();
      const win = st.kept >= WIN;
      api.store.set("losses", win ? 0 : losses + 1);
      const lost = CREATURES.filter((c, p) => !cards.some((x) => x.p === p && x.locked)).map((c) => c.name);
      later(() => api.end(win
        ? { outcome: "win", text: `${st.kept} of 10 creatures kept${st.claims ? `, ${st.claims} of them from clear glass` : ""}. The healing song is written into the Record for the Galechanters, and the kept pages ink back in.${lost.length ? ` Still clear glass: ${lost.join(", ")}.` : " Not one face was lost."}` }
        : { outcome: "lose", text: `${st.kept} of 10 creatures kept, short of the ${WIN} the healing song needs. The healers stop humming; ${lost.slice(0, 3).join(", ")}${lost.length > 3 ? " and the rest" : ""} stay clear glass.${losses + 1 >= 2 ? " The next page will be kinder." : ""}` }), 500);
    }
    function pick(c) {
      if (!st.started || st.busy || st.over || c.locked || st.up.includes(c)) return;
      if (st.leading) {
        if (!c.seen || c.blank || c.leaded) { lineEl.textContent = c.blank ? "A blank face cannot be led." : c.leaded ? "That card is already led." : "Lead only a card you have already seen face-up."; return; }
        st.leading = false; st.leads--; c.leaded = true; countFlip();
        lineEl.textContent = `Lead set round the ${CREATURES[c.p].name} ${c.kind === "pic" ? "picture" : "name"}. It will not blank.`;
        paint(); if (st.flips <= 0) later(settle, 300); return;
      }
      st.up.push(c); c.seen = true; countFlip(); paint();
      if (st.up.length < 2) { if (st.flips <= 0) later(settle, 700); return; }
      const [a, b] = st.up;
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
    const intro = wrap.querySelector(".wrymwretch-concentration-intro"), sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => {
      intro.remove(); st.started = true; cards[0].el.focus();
      beat(`With the Tidecaller healers. The bestiary's creature pages are going blank with the plague, and the healers need eight of them whole to sing the healing song. <cite>Turn two cards</cite>`, 7000);
    });
    sb.focus();
    paint();
    return { unmount() { st.over = true; timers.forEach(clearTimeout); wrap.remove(); } };
  },
};

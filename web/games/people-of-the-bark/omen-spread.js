// People of the Bark — Omen Spread (1D, marginalia drolleries).
// DESIGN.md 11.1, the two summer spreads read one after the other:
//   The Windstorm (c3_omen_wind): Fit is shown once the Backyard card is turned.
//   The Beetle (c3_omen_beetle): the reading decides god or monster; a Spear policy reads it as a
//   monster, anything else as a god. The preview says so before the reading is laid.
// Lay three cards from the hand in Root, Branch and Crown around the event card. Meaning = the suit
// with the highest weight (event card counts 2; ties go to Root's suit). Policy = the sigil on two or
// three cards; one of each is a balanced reading. Clear = all three of the event's suit; Bold = none.
// Fit = the meaning matches the real cause on the Backyard card (section 12.5). A spread always
// finishes ("done").
// Actions: lay a card (drag, tap card then slot, or 1–6 then R/B/C); take one back; turn the
// Backyard card (see the real cause and the suit that fits it); ask Pell (once a spread he names a
// slot for one card: DESIGN's easy-setting hint); lay the reading.

const SUITS = {
  wind: { name: "Wind", belief: "a Trial" },
  rain: { name: "Rain", belief: "a Blessing" },
  song: { name: "Song", belief: "a Prophecy" },
  tremor: { name: "Tremor", belief: "a Message" },
  leaf: { name: "Leaf", belief: "an Omen of Death" },
  mandible: { name: "Mandible", belief: "a Visitor" },
};
const SIGILS = { eye: "the Knot", spear: "the Battlements", quill: "the Scroll House" };
const INST = { eye: "Knot", spear: "Battlements", quill: "Scroll House" };
const DECK = [
  ["wind", "eye", "The Bowed Elder", 2], ["wind", "spear", "The Bending Ridge", 3], ["wind", "quill", "The Counted Gust", 1],
  ["rain", "eye", "The Full Cup", 3], ["rain", "spear", "The Washed Spear", 1], ["rain", "quill", "The Marked Bead", 2],
  ["song", "eye", "The Singer Above", 3], ["song", "spear", "The War Note", 1], ["song", "quill", "The Written Tune", 2],
  ["tremor", "eye", "The Shaken Lamp", 1], ["tremor", "spear", "The Braced Wall", 2], ["tremor", "quill", "The Long Scroll", 3],
  ["leaf", "eye", "The Last Leaf", 3], ["leaf", "spear", "The Falling Shield", 2], ["leaf", "quill", "The Leaf Count", 1],
  ["mandible", "eye", "The Great Visitor", 1], ["mandible", "spear", "The Biting Thing", 3], ["mandible", "quill", "The Measured Shell", 2],
].map(([suit, sigil, name, w], id) => ({ id, suit, sigil, name, w }));
const INK = "#3a281c", RED = "#a8321e", BLUE = "#2f5a8c", GOLD = "#c98a1e", GREEN = "#5f7a3a", PAPER = "#efe2c4", LANT = "#e8742a";
const EVENTS = [
  { key: "wind", suit: "wind", fit: "wind", name: "THE WINDSTORM", title: "The Windstorm", sees: "Bands of wind sweep the bark. Towers lean. The Knot lays out a spread.",
    cause: ["a summer gust,", "nothing more"], fitPay: "the next storm does no damage; the towers count as lashed" },
  { key: "beetle", suit: "mandible", fit: "mandible", name: "THE BEETLE", title: "The Beetle", sees: "A shape as big as a city climbs from the Under. The Knot lays out a spread.",
    cause: ["a ground beetle,", "wandering"], fitPay: null },
];

const SIGIL_SVG = {
  eye: `<path d="M-26 0 Q0 -22 26 0 Q0 22 -26 0Z" fill="none" stroke="${INK}" stroke-width="3"/><circle r="8" fill="${INK}"/><circle r="3" cx="-2" cy="-2" fill="${PAPER}"/>`,
  spear: `<path d="M0 -30 L7 -14 L2 -14 L2 30 L-2 30 L-2 -14 L-7 -14Z" fill="${INK}"/><path d="M-8 18 L8 18" stroke="${INK}" stroke-width="3"/>`,
  quill: `<path d="M18 -30 C-10 -18 -16 8 -14 22 C-2 10 12 -6 18 -30Z" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-14 22 L-20 32 M-12 14 L10 -20" stroke="${INK}" stroke-width="2"/>`,
};
const SUIT_SVG = {
  wind: `<path d="M-9 -3 Q-3 -8 3 -3 T9 -3 M-9 3 Q-3 -2 3 3 T9 3" fill="none" stroke="${RED}" stroke-width="1.8"/>`,
  rain: `<path d="M0 -8 Q7 2 0 7 Q-7 2 0 -8Z" fill="${BLUE}"/>`,
  song: `<path d="M-2 6 L-2 -8 L6 -6" fill="none" stroke="${RED}" stroke-width="1.8"/><circle cx="-5" cy="6" r="3.2" fill="${RED}"/>`,
  tremor: `<path d="M-10 0 L-6 -6 L-2 6 L2 -6 L6 6 L10 0" fill="none" stroke="${RED}" stroke-width="1.8"/>`,
  leaf: `<path d="M-8 8 Q-8 -8 8 -8 Q8 8 -8 8Z" fill="${GREEN}"/><path d="M-8 8 L6 -6" stroke="${PAPER}" stroke-width="1"/>`,
  mandible: `<path d="M-7 8 Q-10 -4 -2 -8 Q-6 0 -3 6 M7 8 Q10 -4 2 -8 Q6 0 3 6" fill="none" stroke="${INK}" stroke-width="2"/>`,
};

export default {
  mount(root, api) {
    const P = "people-of-the-bark-omen-spread-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const rnd = api.rng();

    let ev = 0, E = EVENTS[0], hand = [], slots = {}, selected = null, turned = false, done = false, askLeft = 1, pellTip = null;
    const readings = [];
    const rope = { eye: 30, spear: 30, quill: 30 };
    let morale = 0;

    function deal() {
      E = EVENTS[ev];
      const deck = DECK.slice();
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      hand = deck.slice(0, 5);
      if (!hand.some((c) => c.suit === E.suit)) hand[4] = deck.find((c) => c.suit === E.suit);
      slots = { root: null, branch: null, crown: null }; selected = null; turned = false; done = false; askLeft = 1; pellTip = null;
    }
    deal();

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${INK};font-family:'Cormorant Garamond',Georgia,serif;
 background:radial-gradient(ellipse at 30% 20%,rgba(255,250,235,.75),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(201,138,30,.2),transparent 50%),#e8d6ae}
.${P}wrap::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.45;background:
 radial-gradient(circle at 30% 40%,rgba(107,74,32,.12) 0 1px,transparent 1.4px) 0 0/6px 6px,
 radial-gradient(circle at 70% 20%,rgba(107,74,32,.08) 0 1px,transparent 1.4px) 0 0/9px 9px}
.${P}page{position:relative;min-height:100%;box-sizing:border-box;padding:18px clamp(44px,7vw,96px) 16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,260px);grid-template-rows:auto 1fr auto;gap:10px 22px;
 grid-template-areas:"head side" "table side" "hand hand"}
.${P}frame{position:absolute;inset:10px clamp(30px,5vw,72px);border:2px solid ${RED};outline:1px solid ${RED};outline-offset:4px;pointer-events:none}
.${P}vine{position:absolute;top:0;bottom:0;width:clamp(28px,4.5vw,64px);pointer-events:none}
.${P}vine svg{width:100%;height:100%}
.${P}head{grid-area:head;display:flex;align-items:flex-start;gap:12px}
.${P}init{font-family:'IM Fell English',Georgia,serif;font-size:46px;line-height:1;background:${BLUE};color:#f0c050;padding:2px 10px 6px;border:2px solid #f0c050;box-shadow:inset 0 0 0 2px ${BLUE},inset 0 0 0 3px #f0c050}
.${P}head h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(24px,3vw,34px)}
.${P}head p{margin:2px 0 0;font-size:17px;font-style:italic;max-width:46ch;line-height:1.3}
.${P}phase{font:12px ui-monospace,monospace;letter-spacing:.18em;color:${RED}}
.${P}table{grid-area:table;display:grid;grid-template-columns:repeat(3,auto);grid-template-rows:auto auto;justify-content:center;align-content:center;gap:34px clamp(12px,3vw,42px);
 grid-template-areas:". crown ." "root event branch";padding-bottom:22px}
.${P}slot{width:var(--cw);height:calc(var(--cw)*1.45);border:2px dashed rgba(168,50,30,.65);border-radius:8px;position:relative;display:grid;place-items:center;cursor:pointer;background:rgba(255,250,235,.3);transition:background .15s,border-color .15s}
.${P}slot:hover,.${P}slot.${P}hot{border-color:${GOLD};border-style:solid;background:rgba(240,192,80,.28)}
.${P}slot.${P}want{animation:${P}glow 1.2s ease-in-out infinite alternate}
@keyframes ${P}glow{from{box-shadow:0 0 0 0 rgba(201,138,30,.0)}to{box-shadow:0 0 0 6px rgba(201,138,30,.45)}}
.${P}slot>span{position:absolute;bottom:-23px;left:-10px;right:-10px;text-align:center;font:600 12px ui-monospace,monospace;letter-spacing:.14em;color:${RED};white-space:nowrap}
.${P}slot>em{font-size:15px;color:${RED};opacity:.8;text-align:center;padding:4px;line-height:1.15}
.${P}card{width:var(--cw);height:calc(var(--cw)*1.45);background:#fbf3df;border:1.5px solid ${INK};border-radius:8px;box-shadow:2px 3px 0 rgba(58,40,28,.35);position:relative;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:transform .15s,box-shadow .15s}
.${P}card svg{width:100%;height:100%;display:block}
.${P}card:hover{box-shadow:0 0 0 2px rgba(201,138,30,.6),2px 4px 0 rgba(58,40,28,.35)}
.${P}card:focus-visible{outline:3px solid ${BLUE};outline-offset:3px}
.${P}card.${P}sel{box-shadow:0 0 0 3px ${GOLD},2px 6px 0 rgba(58,40,28,.35)}
.${P}card.${P}ev{border:2px solid ${GOLD};cursor:default}
.${P}card.${P}land{animation:${P}land .35s ease-out}
@keyframes ${P}land{0%{transform:scale(1.12) rotate(-3deg)}100%{transform:none}}
.${P}hand{grid-area:hand;display:flex;justify-content:center;flex-wrap:wrap;gap:10px;padding-top:16px;min-height:calc(var(--cw)*1.45 + 22px)}
.${P}hand .${P}card:nth-child(odd){transform:rotate(-3deg)}.${P}hand .${P}card:nth-child(even){transform:rotate(2.5deg)}
.${P}hand .${P}card.${P}sel{transform:translateY(-14px)}
.${P}num{position:absolute;top:-10px;left:-8px;background:${INK};color:${PAPER};font:12px ui-monospace,monospace;width:20px;height:20px;border-radius:50%;display:grid;place-items:center}
.${P}side{grid-area:side;display:flex;flex-direction:column;gap:12px}
.${P}preview{font-family:'IM Fell English',Georgia,serif;font-size:20px;line-height:1.3;color:${INK};min-height:5.4em}
.${P}preview em{color:${RED}}
.${P}preview small{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;line-height:1.35;margin-top:6px;color:#4a3324}
.${P}selinfo{font-size:16px;line-height:1.3;border-left:3px solid ${GOLD};padding-left:8px;min-height:2.6em}
.${P}selinfo b{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:18px}
.${P}rope{display:grid;gap:5px;font:13px ui-monospace,monospace}
.${P}rope div{display:grid;grid-template-columns:52px 1fr 64px;align-items:center;gap:6px}
.${P}strand{display:block;height:9px;border-radius:5px;background:repeating-linear-gradient(60deg,var(--c) 0 6px,rgba(0,0,0,.2) 6px 8px);transition:width .4s}
.${P}back{display:flex;gap:10px;align-items:flex-end}
.${P}bk{width:calc(var(--cw)*.8);height:calc(var(--cw)*1.16);border-radius:6px;border:1.5px solid ${INK};background:repeating-linear-gradient(45deg,#7a3a22 0 5px,#8e4a2a 5px 10px);display:grid;place-items:center;color:#f0c050;font:28px 'IM Fell English',serif;cursor:pointer;flex:none;transition:transform .15s}
.${P}bk:hover{transform:rotate(-3deg) translateY(-3px)}
.${P}bk:focus-visible{outline:3px solid ${BLUE};outline-offset:3px}
.${P}bk.${P}up{background:#fbf3df;color:${INK};cursor:default;padding:0;place-items:stretch;transform:none}
.${P}help{font-size:15px;font-style:italic;color:#4a3324;line-height:1.3}
.${P}acts{display:flex;flex-wrap:wrap;gap:8px}
.${P}lay{font:inherit;font-family:'IM Fell English',Georgia,serif;font-size:20px;background:${RED};color:${PAPER};border:0;padding:8px 16px;cursor:pointer;border-radius:3px;min-height:42px}
.${P}lay:disabled{opacity:.4;cursor:default}
.${P}ask{font:inherit;font-size:16px;background:rgba(255,250,235,.6);color:${INK};border:1px solid ${INK};padding:6px 12px;cursor:pointer;border-radius:3px;min-height:42px}
.${P}ask:disabled{opacity:.4;cursor:default}
.${P}wrap button:focus-visible{outline:3px solid ${BLUE};outline-offset:2px}
.${P}pell{font-style:italic;font-size:16px;line-height:1.35;color:${RED};min-height:1.3em}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(232,214,174,.95);z-index:4;padding:16px;overflow:auto}
.${P}leaf{max-width:470px;width:100%;box-sizing:border-box;border:2px solid ${RED};outline:1px solid ${RED};outline-offset:4px;background:#f7ebd0;padding:18px 22px 18px 22px;position:relative}
.${P}leaf .${P}init{float:left;margin:4px 12px 0 0;font-size:52px}
.${P}leaf h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${RED}}
.${P}leaf .${P}beat{font-style:italic;font-size:17px;line-height:1.4;margin:4px 0 10px}
.${P}leaf .${P}goal{clear:both;font-size:18px;line-height:1.35;margin:0 0 10px;border-top:1px solid rgba(168,50,30,.5);padding-top:8px}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:16px;line-height:1.3;margin:0 0 14px}
.${P}key kbd{font:13px ui-monospace,monospace;border:1px solid ${RED};color:${RED};padding:1px 6px;border-radius:2px;white-space:nowrap;align-self:start}
.${P}ghost{position:fixed;pointer-events:none;z-index:50;opacity:.92;transform:rotate(-4deg)}
@media (max-width:760px){.${P}page{grid-template-columns:1fr;grid-template-areas:"head" "table" "hand" "side";padding:16px 30px 20px}.${P}preview{position:sticky;bottom:0;z-index:3;background:#f3e4c0;border:1px solid ${RED};padding:6px 10px;box-shadow:0 -4px 14px rgba(58,40,28,.25)}.${P}table{gap:32px 8px}.${P}preview{min-height:0;font-size:19px}.${P}vine{width:24px}.${P}frame{inset:8px 20px}.${P}init{font-size:38px}}
@media (prefers-reduced-motion:reduce){.${P}slot.${P}want,.${P}card.${P}land{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}frame"></div>
 <div class="${P}vine" style="left:0"></div><div class="${P}vine" style="right:0"></div>
 <div class="${P}head"><div class="${P}init">T</div><div><div class="${P}phase"></div><h2></h2><p class="${P}sees"></p></div></div>
 <div class="${P}table">
  <div class="${P}slot" data-s="crown" style="grid-area:crown"><em>what will come of it</em><span>CROWN · C</span></div>
  <div class="${P}slot" data-s="root" style="grid-area:root"><em>why it came</em><span>ROOT · R</span></div>
  <div style="grid-area:event" class="${P}evwrap"></div>
  <div class="${P}slot" data-s="branch" style="grid-area:branch"><em>what it asks of us</em><span>BRANCH · B</span></div>
 </div>
 <div class="${P}side">
  <div class="${P}preview" aria-live="polite"></div>
  <div class="${P}selinfo"></div>
  <div class="${P}rope" aria-label="The Balance Rope"></div>
  <div class="${P}back"><div class="${P}bk" role="button" tabindex="0" aria-label="Turn the Backyard card (Y)">?</div><div class="${P}help">The Backyard card. Only you can turn it (Y). It is never placed.</div></div>
  <div class="${P}pell" aria-live="polite"></div>
  <div class="${P}acts"><button class="${P}ask" type="button"></button><button class="${P}lay" type="button" disabled>Lay the reading</button></div>
 </div>
 <div class="${P}hand"></div>
</div>
<div class="${P}intro"><div class="${P}leaf" role="dialog" aria-label="How to play">
 <div class="${P}init">S</div>
 <h2>Omen Spread</h2>
 <p class="${P}beat">Summer, at the Knot's table in Highridge. Elder Pell reads by the notches on the card edges now; his eyes are going. Two things have happened this week, and the city waits to be told what they meant.</p>
 <p class="${P}goal"><b>Goal:</b> read two events. Lay three cards around each: the heaviest suit is what it <i>means</i>; a sigil on two cards decides <i>who answers</i>.</p>
 <div class="${P}key">
  <kbd>drag · or tap</kbd><span>a card, then a slot: Root, Branch, Crown</span>
  <kbd>1–6 · R B C</kbd><span>the same, from the keys</span>
  <kbd>Lay · Enter</kbd><span>seal it when the preview says what you mean</span>
 </div>
 <button class="${P}lay" type="button">Begin the reading</button>
</div></div>`;
    root.appendChild(wrap);
    const sizeCards = () => {
      const r = wrap.getBoundingClientRect();
      const cw = r.width < 760 ? Math.min(100, Math.max(76, (r.width - 76) / 3.3)) : Math.min(128, Math.max(80, (r.height - 320) / 4.7), r.width / 11);
      wrap.style.setProperty("--cw", Math.round(cw) + "px");
    };
    sizeCards();
    const ro = new ResizeObserver(sizeCards); ro.observe(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const handEl = $("hand"), preview = $("preview"), ropeEl = $("rope"), layBtn = wrap.querySelector(`.${P}side .${P}lay`), bk = $("bk"), askBtn = $("ask"), pellEl = $("pell"), selInfo = $("selinfo");

    function vineSvg(seed, flip) {
      const r = api.rng(seed);
      let d = "M20 0", leaves = "";
      for (let y = 0; y <= 1000; y += 40) {
        const x = 20 + Math.sin(y / 70 + seed) * 9;
        d += ` Q${x + (flip ? -10 : 10)} ${y - 20} ${x} ${y}`;
        const side = (y / 40) % 2 ? 1 : -1, col = [GREEN, RED, GOLD, BLUE][Math.floor(r() * 4)];
        leaves += `<path d="M${x} ${y} q${side * 14} -10 ${side * 22} -2 q${-side * 10} 8 ${-side * 22} 2Z" fill="${col}" opacity=".85"/>`;
      }
      const bird = `<g transform="translate(22 70)"><ellipse rx="11" ry="7" fill="${BLUE}"/><circle cx="${flip ? -10 : 10}" cy="-7" r="5" fill="${BLUE}"/><path d="M${flip ? -15 : 15} -7 l${flip ? -6 : 6} 2 l${flip ? 6 : -6} 1z" fill="${GOLD}"/><path d="M0 7 L-2 16 M4 7 L4 16" stroke="${INK}" stroke-width="1.2"/></g>`;
      const snail = `<g transform="translate(22 940)"><path d="M-14 8 L16 8 Q20 8 20 4" fill="none" stroke="${INK}" stroke-width="2"/><circle r="10" fill="${GOLD}" stroke="${LANT}" stroke-width="1.5"/><path d="M0 0 m-6 0 a6 6 0 1 0 6 -6 a4 4 0 1 0 -4 4" fill="none" stroke="${RED}" stroke-width="1.3"/></g>`;
      return `<svg viewBox="0 0 44 1000" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${GREEN}" stroke-width="2"/>${leaves}${flip ? bird : snail}</svg>`;
    }
    const vines = wrap.querySelectorAll("." + P + "vine");
    vines[0].innerHTML = vineSvg(3, false); vines[1].innerHTML = vineSvg(8, true);

    function cardSvg(c, isEvent) {
      if (isEvent) {
        const big = E.suit === "mandible"
          ? `<g transform="translate(50 74)"><ellipse rx="22" ry="15" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M-12 -12 Q-24 -26 -30 -18 M12 -12 Q24 -26 30 -18" fill="none" stroke="${INK}" stroke-width="1.5"/></g>`
          : `<g transform="translate(50 74)" fill="none" stroke="${INK}" stroke-width="1.6"><path d="M-30 -14 Q-10 -26 10 -14 T40 -14"/><path d="M-34 0 Q-14 -12 6 0 T36 0"/><path d="M-30 14 Q-10 2 10 14 T40 14"/></g>`;
        return `<svg viewBox="0 0 100 145"><rect x="4" y="4" width="92" height="137" rx="6" fill="none" stroke="${GOLD}" stroke-width="1"/>
<rect x="18" y="14" width="64" height="17" fill="${RED}"/><text x="50" y="27" text-anchor="middle" font-family="IM Fell English,serif" font-size="12" fill="${PAPER}" letter-spacing="1.5">EVENT</text>
<g transform="translate(50 74) scale(1.4)">${SUIT_SVG[E.suit]}</g>${big}
<text x="50" y="120" text-anchor="middle" font-family="IM Fell English,serif" font-size="11.5" fill="${INK}" ${E.name.length > 10 ? 'textLength="84" lengthAdjust="spacingAndGlyphs"' : ""}>${E.name}</text>
<text x="50" y="134" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="11" fill="${RED}">${SUITS[E.suit].name} · weight 2</text></svg>`;
      }
      const dots = Array.from({ length: c.w }, (_, i) => `<circle cx="${86 - i * 9}" cy="14" r="3.4" fill="none" stroke="${GOLD}" stroke-width="1.8"/>`).join("");
      return `<svg viewBox="0 0 100 145" role="img" aria-label="${c.name}, ${SUITS[c.suit].name}, ${c.sigil}, weight ${c.w}">
<path d="M8 12 q4 -6 8 0 t8 0 t8 0" fill="none" stroke="${RED}" stroke-width="1.5"/>
<g transform="translate(17 28) scale(1.2)">${SUIT_SVG[c.suit]}</g>${dots}
<g transform="translate(50 68)">${SIGIL_SVG[c.sigil]}</g>
<text x="50" y="118" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-weight="600" font-size="12.5" fill="${INK}">${c.name}</text>
<text x="50" y="134" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9.5" fill="${RED}" letter-spacing="1">${SUITS[c.suit].name.toUpperCase()}</text></svg>`;
    }
    function makeCard(c, numberLabel) {
      const d = document.createElement("div");
      d.className = P + "card"; d.tabIndex = 0; d.dataset.id = c.id;
      d.innerHTML = cardSvg(c) + (numberLabel ? `<span class="${P}num">${numberLabel}</span>` : "");
      attachDrag(d, c);
      on(d, "pointerenter", () => showInfo(c));
      on(d, "focus", () => showInfo(c));
      return d;
    }
    function showInfo(c) {
      const cc = c || selected;
      selInfo.innerHTML = cc ? `<b>${cc.name}</b><br>${SUITS[cc.suit].name} (${SUITS[cc.suit].belief.replace(/^an? /, "")}) · ${cap(cc.sigil)}, ${SIGILS[cc.sigil]} · weight ${cc.w}` : `<i>Point at a card to read its edge.</i>`;
    }

    function setupHead() {
      $("phase").textContent = `SPREAD ${ev + 1} OF 2 · SUMMER`;
      wrap.querySelector(`.${P}head h2`).textContent = E.title;
      $("sees").textContent = E.sees;
      wrap.querySelector(`.${P}head .${P}init`).textContent = E.title[4];
      const ew = $("evwrap"); ew.innerHTML = "";
      const evCard = document.createElement("div");
      evCard.className = P + "card " + P + "ev"; evCard.innerHTML = cardSvg(null, true);
      ew.appendChild(evCard);
      bk.className = P + "bk"; bk.setAttribute("role", "button"); bk.tabIndex = 0; bk.textContent = "?";
      $("help").textContent = "The Backyard card. Only you can turn it (Y). It is never placed.";
      askBtn.textContent = `Ask Pell · ${askLeft}`;
    }

    // ---- reading logic ----
    function reading() {
      const placed = Object.values(slots).filter(Boolean);
      const wsum = {};
      wsum[E.suit] = 2;
      for (const c of placed) wsum[c.suit] = (wsum[c.suit] || 0) + c.w;
      let best = -1, meaning = null;
      for (const [s, w] of Object.entries(wsum)) if (w > best) { best = w; meaning = s; }
      const tied = Object.entries(wsum).filter(([, w]) => w === best).map(([s]) => s);
      if (tied.length > 1 && slots.root && tied.includes(slots.root.suit)) meaning = slots.root.suit;
      const count = { eye: 0, spear: 0, quill: 0 };
      for (const c of placed) count[c.sigil]++;
      let policy = null, balanced = false;
      for (const k in count) if (count[k] >= 2) policy = k;
      if (placed.length === 3 && !policy) balanced = true;
      const delta = { eye: 0, spear: 0, quill: 0 }; let mor = 0;
      if (policy && count[policy] === 2) delta[policy] += 6;
      if (policy && count[policy] === 3) { delta[policy] += 9; for (const k in delta) if (k !== policy) delta[k] -= 2; }
      if (balanced) for (const k in delta) delta[k] += 2;
      const clear = placed.length === 3 && placed.every((c) => c.suit === E.suit);
      const bold = placed.length === 3 && placed.every((c) => c.suit !== E.suit);
      if (clear) mor += 5;
      if (bold) { mor -= 3; delta.quill += 2; }
      const fit = meaning === E.fit;
      const monster = E.key === "beetle" && policy === "spear";
      return { placed, meaning, policy, balanced, delta, morale: mor, clear, bold, fit, monster, n: placed.length };
    }
    function renderPreview() {
      const r = reading();
      if (!r.n) {
        preview.innerHTML = `The reader's pen waits.<small>Lay a card in Root, Branch or Crown. The reading writes itself here as you go.</small>`;
      } else {
        const who = r.policy ? `${cap(SIGILS[r.policy])} will answer it.` : r.balanced ? "All three will answer it together." : "Who answers is not yet plain.";
        const kind = r.clear ? " A <em>clear</em> reading." : r.bold ? " A <em>bold</em> reading." : "";
        const fit = turned ? (r.fit ? " <em>It fits the cause.</em>" : " It does not fit the cause.") : "";
        const beast = E.key === "beetle" ? (r.monster ? "The Beetle will be met as a <em>monster</em>: the warriors hold the crack." : "The Beetle will be met as a <em>god</em>: it will be escorted.") : "";
        preview.innerHTML = `It is ${SUITS[r.meaning].belief}. ${who}${kind}${fit}<small>${beast}${slots.crown ? ` The saying on the wall: “${slots.crown.name}.”` : ""}</small>`;
      }
      const labels = { eye: "Eye", spear: "Spear", quill: "Quill" }, cols = { eye: BLUE, spear: RED, quill: GOLD };
      ropeEl.innerHTML = Object.keys(labels).map((k) => {
        const v = rope[k] + r.delta[k];
        return `<div><span>${labels[k]}</span><i class="${P}strand" style="--c:${cols[k]};width:${Math.max(8, Math.min(100, v * 1.8))}%"></i><span>${v}${r.delta[k] ? ` (${r.delta[k] > 0 ? "+" : ""}${r.delta[k]})` : ""}</span></div>`;
      }).join("");
      layBtn.disabled = r.n < 3 || done;
      askBtn.disabled = askLeft <= 0 || done;
      askBtn.textContent = `Ask Pell · ${askLeft}`;
    }
    const cap = (s) => s[0].toUpperCase() + s.slice(1);

    let landed = null;
    function renderHand() {
      handEl.innerHTML = "";
      hand.forEach((c, i) => { const d = makeCard(c, String(i + 1)); if (selected === c) d.classList.add(P + "sel"); handEl.appendChild(d); });
      wrap.querySelectorAll("." + P + "slot").forEach((s) => {
        s.querySelectorAll("." + P + "card").forEach((x) => x.remove());
        const c = slots[s.dataset.s];
        s.querySelector("em").style.display = c ? "none" : "";
        s.classList.toggle(P + "want", !!pellTip && pellTip.slot === s.dataset.s && !c);
        if (c) { const d = makeCard(c); if (landed === c && !api.reducedMotion) d.classList.add(P + "land"); s.prepend(d); }
      });
      landed = null;
      showInfo(null);
      renderPreview();
    }
    function place(c, slot) {
      if (done) return;
      for (const k in slots) if (slots[k] === c) slots[k] = null;
      hand = hand.filter((x) => x !== c);
      if (slots[slot]) hand.push(slots[slot]);
      slots[slot] = c; selected = null; landed = c;
      if (pellTip && pellTip.slot === slot) pellTip = null;
      renderHand();
      const n = Object.values(slots).filter(Boolean).length;
      if (n === 1 && ev === 0) pellSays("He taps the card's edge twice. “A card means what we do after it.”");
      if (n === 3 && !turned) pellSays("“Before you lay it: the Backyard card is yours to turn, not mine.”");
    }
    function unplace(c) {
      for (const k in slots) if (slots[k] === c) { slots[k] = null; hand.push(c); }
      selected = null; renderHand();
    }
    const inSlot = (c) => Object.values(slots).includes(c);
    const pellSays = (t, who = "Pell") => { pellEl.textContent = (who ? who + ": " : "") + t; };

    // ---- drag and tap ----
    let drag = null;
    function attachDrag(el, c) {
      on(el, "pointerdown", (e) => {
        if (done || e.button > 0) return;
        e.preventDefault();
        drag = { c, el, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, id: e.pointerId };
      });
      on(el, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); tap(c); } });
    }
    function tap(c) {
      if (inSlot(c)) { unplace(c); return; }
      selected = selected === c ? null : c; renderHand();
      if (selected) { showInfo(selected); const el = handEl.querySelector(`[data-id="${c.id}"]`); el && el.focus({ preventScroll: true }); }
    }
    function slotAt(x, y) {
      for (const s of wrap.querySelectorAll("." + P + "slot")) { const r = s.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s; }
      return null;
    }
    on(window, "pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
        drag.moved = true;
        const gh = drag.el.cloneNode(true); gh.classList.add(P + "ghost"); gh.classList.remove(P + "sel");
        const r = drag.el.getBoundingClientRect(); gh.style.width = r.width + "px"; gh.style.height = r.height + "px";
        drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; drag.ghost = gh; wrap.appendChild(gh); drag.el.style.opacity = ".3";
      }
      if (drag.moved) {
        drag.ghost.style.left = e.clientX - drag.dx + "px"; drag.ghost.style.top = e.clientY - drag.dy + "px";
        wrap.querySelectorAll("." + P + "slot").forEach((s) => s.classList.remove(P + "hot"));
        const s = slotAt(e.clientX, e.clientY); if (s) s.classList.add(P + "hot");
      }
    });
    on(window, "pointerup", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      wrap.querySelectorAll("." + P + "slot").forEach((s) => s.classList.remove(P + "hot"));
      if (d.ghost) d.ghost.remove();
      d.el.style.opacity = "";
      if (!d.moved) { tap(d.c); return; }
      const s = slotAt(e.clientX, e.clientY);
      if (s) place(d.c, s.dataset.s);
      else if (inSlot(d.c) && handEl.contains(document.elementFromPoint(e.clientX, e.clientY))) unplace(d.c);
      else renderHand();
    });
    wrap.querySelectorAll("." + P + "slot").forEach((s) => on(s, "click", (e) => {
      if (e.target.closest("." + P + "card")) return;
      if (selected) place(selected, s.dataset.s);
      else pellSays("“Choose a card first. Then its place.”");
    }));
    function turn() {
      if (turned || done) return; turned = true;
      bk.classList.add(P + "up"); bk.removeAttribute("role"); bk.tabIndex = -1;
      const art = E.key === "beetle"
        ? `<ellipse cx="40" cy="70" rx="15" ry="9" fill="#222"/><circle cx="25" cy="68" r="5" fill="#222"/><path d="M28 76 l-6 7 M40 78 l0 8 M52 76 l6 7" stroke="#222" stroke-width="1.5"/>`
        : `<path d="M10 104 Q14 84 22 72 M24 104 Q26 82 36 70 M40 104 Q42 84 52 74 M56 104 Q58 86 66 76" stroke="#3e7a2e" stroke-width="2.4" fill="none"/><path d="M8 52 Q30 44 52 52 T76 50 M14 62 Q34 56 54 62" stroke="#7aa0c0" stroke-width="1.6" fill="none"/>`;
      bk.innerHTML = `<svg viewBox="0 0 80 116" style="width:100%;height:100%"><rect x="2" y="2" width="76" height="112" fill="#e6f0dc" rx="4"/><rect x="2" y="78" width="76" height="36" fill="#8fbf6a"/>
${art}<text x="40" y="20" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#222">${E.cause[0]}</text><text x="40" y="31" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#222">${E.cause[1]}</text>
<rect x="52" y="92" width="24" height="20" rx="3" fill="#fbf3df" stroke="#333" stroke-width=".6"/><g transform="translate(64 102) scale(.8)">${SUIT_SVG[E.fit]}</g><text x="48" y="106" text-anchor="end" font-family="sans-serif" font-size="8" fill="#222">fits</text></svg>`;
      $("help").textContent = `The real cause, drawn plain. The suit in its corner, ${SUITS[E.fit].name}, fits it. The people never see this card.`;
      renderPreview();
    }
    on(bk, "click", turn);
    on(bk, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(); } });
    function ask() {
      if (done || askLeft <= 0) return;
      // Pell's notch-reading: the hand card that would most raise the event's own suit, into the first empty slot
      const empty = ["root", "branch", "crown"].filter((k) => !slots[k]);
      if (!empty.length || !hand.length) { pellSays("“The table is full. Take one back first.”"); return; }
      askLeft--;
      const pick = hand.slice().sort((a, b) => (b.suit === E.suit) - (a.suit === E.suit) || b.w - a.w)[0];
      pellTip = { slot: empty[0], id: pick.id };
      selected = pick; renderHand();
      pellSays(`He runs a thumb over the notches. “${pick.name}. In the ${empty[0] === "root" ? "Root" : empty[0] === "branch" ? "Branch" : "Crown"}, I think. But you choose.”`);
    }
    on(askBtn, "click", ask);

    on(window, "keydown", (e) => {
      if (done || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-7]$/.test(e.key)) { const c = hand[+e.key - 1]; if (c) { selected = c; renderHand(); showInfo(c); } return; }
      const map = { r: "root", b: "branch", c: "crown" };
      const k = e.key.toLowerCase();
      if (map[k]) { if (selected) place(selected, map[k]); else pellSays("“Which card? Pick one with its number.”"); }
      if (k === "y") turn();
      if (k === "p") ask();
      if (e.key === "Enter" && !layBtn.disabled && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("button,[role=button]," + "." + P + "card"))) lay();
    });

    function lay() {
      const r = reading(); if (r.n < 3 || done) return;
      done = true;
      for (const k in rope) rope[k] += r.delta[k];
      morale += r.morale;
      readings.push({ ev: E, r, crown: slots.crown.name, turned });
      renderPreview();
      api.store.set("last", { event: E.key, meaning: r.meaning, policy: r.policy || (r.balanced ? "balanced" : null), monster: r.monster });
      if (ev === 0) {
        pellSays(r.fit ? "“A trial. Yes. Lash the towers.” He does not know why it will work. It will." : "“So it is written.” He sets the cards back in the deck, in order.");
        later(() => {
          const card = document.createElement("div");
          card.className = P + "intro";
          card.innerHTML = `<div class="${P}leaf" role="dialog" aria-label="The Beetle"><div class="${P}init">B</div><h2>The Beetle</h2>
<p class="${P}beat">The wind has hardly dropped when a runner from Splinterwatch falls through the door. Something as big as a city is climbing from the Under. Captain Burr, at the window: “Small ones we fight. Big ones we bow to. Middling ones, we ask the Knot.”</p>
<p class="${P}goal">This reading decides it. A <b>Spear</b> policy makes the Beetle a <b>monster</b>, fought at the barricades. Anything else makes it a <b>god</b>, to be escorted. Lives depend on which.</p>
<div class="${P}key"><kbd>Y</kbd><span>turn the Backyard card: see the real cause</span><kbd>Ask Pell · P</kbd><span>once a spread, he names a card and a slot</span></div>
<button class="${P}lay" type="button">Lay out the second spread</button></div>`;
          wrap.appendChild(card);
          const b = card.querySelector("button");
          on(b, "click", () => { card.remove(); ev = 1; deal(); setupHead(); pellEl.textContent = ""; renderHand(); handEl.querySelector("." + P + "card")?.focus(); });
          b.focus();
        }, api.reducedMotion ? 600 : 1700);
        return;
      }
      if (r.monster) pellSays("Burr is already buckling his helmet.", ""); else pellSays("“Then we bow, and we get out of its way.”");
      later(finish, api.reducedMotion ? 300 : 1200);
    }
    function finish() {
      const [w, b] = readings;
      const ch = Object.entries(rope).map(([k, v]) => `${INST[k]} ${v}`).join(", ");
      const windTxt = `The wind was read as ${SUITS[w.r.meaning].belief}${w.r.fit ? ", which fits the gust: the towers are lashed and the next storm does no harm" : ""}.`;
      const beast = b.r.monster ? "The Beetle is read as a monster: the warriors will hold the crack" : "The Beetle is read as a god: it will be escorted";
      const bfit = b.r.fit ? (b.r.monster ? " The meaning fits the real cause, so its will is a line shorter to drain." : " The meaning fits the real cause: it passes with no losses.") : "";
      const kinds = [w, b].map((x) => x.r.clear ? "clear" : x.r.bold ? "bold" : null).filter(Boolean);
      const unturned = [w, b].filter((x) => !x.turned).length;
      api.end({ outcome: "done", text: `${windTxt} ${beast}.${bfit} Painted on the ridge: “${w.crown}” and “${b.crown}.” The rope stands at ${ch}${morale ? `; morale ${morale > 0 ? "+" : "−"}${Math.abs(morale)}` : ""}${kinds.length ? ` (${kinds.join(" and ")} reading${kinds.length > 1 ? "s" : ""})` : ""}.${unturned ? ` You left ${unturned === 2 ? "both Backyard cards" : "one Backyard card"} face down.` : ""}` });
    }
    on(layBtn, "click", lay);
    const startBtn = wrap.querySelector(`.${P}intro .${P}lay`);
    on(startBtn, "click", () => { wrap.querySelector("." + P + "intro").remove(); pellSays("“The Trunk does not shout twice. Write it down.”"); handEl.querySelector("." + P + "card")?.focus(); });
    startBtn.focus();
    setupHead();
    renderHand();
    wrap._test = { get hand() { return hand; }, get ev() { return ev; } };

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); ro.disconnect(); wrap.remove(); } };
  },
};

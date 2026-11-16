// People of the Bark — Omen Spread (1D, marginalia drolleries).
// DESIGN.md 11.1 and "Accepted development (2026-11-15)", four readings across the year:
//   The Windstorm (c3_omen_wind): Fit is shown once the Backyard card is turned.
//   The Beetle (c3_omen_beetle): the reading decides god or monster; a Spear policy reads it as a
//   monster, anything else as a god. The preview says so before the reading is laid.
//   The Pulse (autumn night; the midpoint, phase 1): the event card has no suit and the Backyard card
//   turns over blank. For once the player knows no more than Pell does.
//   The Shadow (c6_omen, cut down): Pell is dead and the heir deals honest hands in character. The heir
//   is whoever the year's policies point to (two or more of one sigil; otherwise Twig). Burr's hand runs
//   Spear-heavy; Fenn shows the next two cards and one may be taken; Twig deals one card face down that
//   must be placed unseen; Hollow allows one redeal. The reading follows the Reading of the Shadow table:
//   one of each sigil is a trial; a majority is that institution's reading only if it leads the rope by
//   12, otherwise a trial. (The forecast gate on the scholars' reading is not checked here.)
// Lay three cards from the hand in Root, Branch and Crown around the event card. Meaning = the suit
// with the highest weight (a suited event card counts 2; ties go to Root's suit). Policy = the sigil on
// two or three cards; one of each is a balanced reading. Clear = all three of the event's suit; Bold = none.
// Fit = the meaning matches the real cause on the Backyard card (section 12.5). A spread always
// finishes ("done"): DESIGN 11.1, "there is no losing hand".
// Actions: lay a card (drag, tap card then slot, or 1–6 then R/B/C); take one back; turn the
// Backyard card; ask Pell (once a spread) or use the heir's allowance; lay the reading.
// Art: the 18 Omen faces, the back, the event cards, the Backyard faces, cast marks, sigils, chapter
// cards, the saying wall and the ending diptychs come from api.art; each has its old drawing as a fallback.
import * as kit from "./_art.js";
import * as ladder from "./_ladder.js";

// Phase 2: three stages. Teach: the Windstorm, meaning and policy, and no reading is wrong. Test: the Beetle,
// after The Thumb on the Deck; the reading must fit the cause, and lives ride on it. Twist: the Pulse and the
// Shadow. The leading house lays the Crown first and it cannot be moved (the contested slot); the Backyard
// card is blank; then Pell is gone, the deal is honest, and the only help is the player's own thumb on the
// notches (once: feel the top card, and trade a hand card for it). The twist is won when the Shadow's
// reading stands as laid, and not when it falls to a trial the player did not mean.
const SPEC = { title: "Omen Spread", chip: "left:auto;right:8px;bottom:auto;top:6px", stages: [
  { name: "The Windstorm", blurb: "Meaning and policy, and Pell's thumb to help." },
  { name: "The Beetle", blurb: "The reading must fit the real cause. Lives ride on it." },
  { name: "The Blank Card, then an honest deal", blurb: "The card you always turn has nothing on it. After Pell, nobody deals you what you need." },
] };

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
  { key: "wind", suit: "wind", fit: "wind", name: "THE WINDSTORM", title: "The Windstorm", season: "SUMMER", sees: "Bands of wind sweep the bark. Towers lean. The Knot lays out a spread.",
    cause: ["a summer gust,", "nothing more"], fitPay: "the next storm does no damage; the towers count as lashed" },
  { key: "beetle", suit: "mandible", fit: "mandible", name: "THE BEETLE", title: "The Beetle", season: "SUMMER", sees: "A shape as big as a city climbs from the Under. The Knot lays out a spread.",
    cause: ["a ground beetle,", "wandering"], fitPay: null },
  { key: "pulse", suit: null, fit: null, name: "THE PULSE", title: "The Pulse", season: "AUTUMN NIGHT", sees: "Something wakes Highridge in the dark: a tapping with no face to it, from inside the wall. The Knot lays out a spread.",
    cause: null, fitPay: null },
  { key: "shadow", suit: null, fit: null, name: "THE SHADOW", title: "The Shadow", season: "THE YEAR'S TURN", sees: "The world goes dark from edge to edge. The deck is in new hands, and nobody's thumb knows the notches.",
    cause: ["a hand,", "checking for termites"], fitPay: null },
];
const HEIRS = {
  hollow: { name: "Chanter Hollow", who: "hollow", sigil: "eye", rule: "Hollow allows <b>one redeal</b>: the whole hand goes back and five new cards come.", line: "“Trunk, hear us. Trunk, hold us.”" },
  burr: { name: "Captain Burr", who: "burr", sigil: "spear", rule: "Burr's hands run <b>Spear-heavy</b>: three of his five cards carry the Spear.", line: "“I'm not afraid. I'm ready. They feel the same from inside.”" },
  fenn: { name: "Fenn", who: "fenn", sigil: "quill", rule: "Fenn shows <b>the next two cards</b> of the deck. You may take one of them for a card in your hand, once.", line: "“If it comes every seventh day, then it is coming.”" },
  twig: { name: "Twig", who: "twig", sigil: null, rule: "Twig deals <b>one card face down</b>. It must be laid in a slot unseen, and turns over when the reading is laid.", line: "“What if the Shadow is just playing?”" },
};
const SHADOW = {
  trial: { line: "The Trunk tests us. Chant, stand, record.", end: "ending-the-shadow-passes" },
  enemy: { line: "It is an enemy. We go up to meet it.", end: "ending-the-war-on-the-god", lead: "spear" },
  habit: { line: "It is a thing with a habit. We will learn its shape.", end: "ending-the-edge-of-the-world", lead: "quill" },
  offering: { line: "It is a hungry god. Give it everything.", end: "ending-the-shadow-passes", lead: "eye" },
};
const BY_SIGIL = { spear: "enemy", quill: "habit", eye: "offering" };
const slug = (name) => name.toLowerCase().replace(/^the /, "").replace(/[^a-z]+/g, "-");

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
  mount(root, api) { return ladder.run(root, api, SPEC, play); },
};

function play(root, api, stage) {
  {
    const P = "people-of-the-bark-omen-spread-";
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const rnd = api.rng();

    let ev = stage, E = EVENTS[stage], locked = null, notch = 0, hand = [], slots = {}, selected = null, turned = false, done = false, askLeft = 1, pellTip = null;
    let deck = [], heir = null, redeals = 0, swaps = 0, shown = [], down = null;
    const readings = [];
    const rope = Object.assign({ eye: 30, spear: 30, quill: 30 }, stage > 0 ? api.store.get("rope", {}) : {});
    const past = (k, d) => Object.assign({ crown: d, r: { meaning: "wind", policy: null, monster: false, fit: false }, turned: true }, api.store.get(k, {}));
    let morale = 0;
    const lead = () => { for (const k in rope) if (Object.keys(rope).every((o) => o === k || rope[k] >= rope[o] + 12)) return k; return null; };
    let leading = null;

    function shuffle() {
      const d = DECK.slice();
      for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
      return d;
    }
    function deal() {
      E = EVENTS[ev];
      deck = shuffle(); shown = []; down = null;
      if (heir && heir.who === "burr") {
        // Burr's hand runs Spear-heavy: three Spear cards and two of whatever comes
        const sp = deck.filter((c) => c.sigil === "spear").slice(0, 3), rest = deck.filter((c) => !sp.includes(c));
        hand = sp.concat(rest.slice(0, 2)); deck = rest.slice(2);
        for (let i = hand.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [hand[i], hand[j]] = [hand[j], hand[i]]; }
      } else {
        hand = deck.slice(0, 5); deck = deck.slice(5);
        // Pell deals by the notches: one card of the event's suit is always there. An heir's deal is honest.
        if (!heir && E.suit && !hand.some((c) => c.suit === E.suit)) { const k = deck.findIndex((c) => c.suit === E.suit); const [c] = deck.splice(k, 1); deck.push(hand[4]); hand[4] = c; }
      }
      if (heir && heir.who === "fenn") shown = deck.slice(0, 2);
      if (heir && heir.who === "twig") down = hand[Math.floor(rnd() * hand.length)];
      slots = { root: null, branch: null, crown: null }; selected = null; turned = false; done = false; askLeft = 1; pellTip = null; locked = null;
      // the contested slot: from autumn the leading house lays the Crown first, and it stays
      if (E.key === "pulse") {
        const top = lead() || Object.keys(rope).sort((a, b) => rope[b] - rope[a])[0];
        const k = deck.findIndex((c) => c.sigil === top);
        if (k >= 0) { locked = deck.splice(k, 1)[0]; slots.crown = locked; }
      }
      notch = E.key === "shadow" ? 1 : 0;
    }
    deal();

    // what the year has already read: an event card beside the Backyard card only the player turned
    function yearStrip(items, wheel) {
      const figs = items.filter(([k]) => art.has("event-" + k)).map(([k, cap]) => `<figure><img src="${art.url("event-" + k)}" alt="Event card">${art.has("backyard-" + k) ? `<img src="${art.url("backyard-" + k)}" alt="Its Backyard card">` : ""}<figcaption>${cap}</figcaption></figure>`).join("");
      return figs ? `<div class="${P}year">${figs}${wheel && art.has("ui-season-wheel") ? `<img class="${P}wheel" src="${art.url("ui-season-wheel")}" alt="The year's wheel" width="64" height="64">` : ""}</div>` : "";
    }
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
.${P}slot{width:var(--cw);height:calc(var(--cw)*1.4 + 20px);border:2px dashed rgba(168,50,30,.65);border-radius:8px;position:relative;display:grid;place-items:center;cursor:pointer;background:rgba(255,250,235,.3);transition:background .15s,border-color .15s}
.${P}slot:hover,.${P}slot.${P}hot{border-color:${GOLD};border-style:solid;background:rgba(240,192,80,.28)}
.${P}slot.${P}want{animation:${P}glow 1.2s ease-in-out infinite alternate}
@keyframes ${P}glow{from{box-shadow:0 0 0 0 rgba(201,138,30,.0)}to{box-shadow:0 0 0 6px rgba(201,138,30,.45)}}
.${P}slot>span{position:absolute;bottom:-23px;left:-10px;right:-10px;text-align:center;font:600 12px ui-monospace,monospace;letter-spacing:.14em;color:${RED};white-space:nowrap}
.${P}slot>em{font-size:15px;color:${RED};opacity:.8;text-align:center;padding:4px;line-height:1.15}
.${P}card{width:var(--cw);height:calc(var(--cw)*1.4 + 20px);background:#fbf3df;overflow:hidden;border:1.5px solid ${INK};border-radius:8px;box-shadow:2px 3px 0 rgba(58,40,28,.35);position:relative;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:transform .15s,box-shadow .15s}
.${P}card svg{width:100%;height:100%;display:block}
.${P}card:hover{box-shadow:0 0 0 2px rgba(201,138,30,.6),2px 4px 0 rgba(58,40,28,.35)}
.${P}card:focus-visible{outline:3px solid ${BLUE};outline-offset:3px}
.${P}card.${P}sel{box-shadow:0 0 0 3px ${GOLD},2px 6px 0 rgba(58,40,28,.35)}
.${P}card.${P}ev{border:2px solid ${GOLD};cursor:default}
.${P}card.${P}land{animation:${P}land .35s ease-out}
@keyframes ${P}land{0%{transform:scale(1.12) rotate(-3deg)}100%{transform:none}}
.${P}hand{grid-area:hand;display:flex;justify-content:center;flex-wrap:wrap;gap:10px;padding-top:16px;min-height:calc(var(--cw)*1.4 + 42px)}
.${P}hand .${P}card:nth-child(odd){transform:rotate(-3deg)}.${P}hand .${P}card:nth-child(even){transform:rotate(2.5deg)}
.${P}hand .${P}card.${P}sel{transform:translateY(-14px)}
.${P}num{position:absolute;top:2px;left:2px;z-index:1;background:${INK};color:${PAPER};font:12px ui-monospace,monospace;width:20px;height:20px;border-radius:50%;display:grid;place-items:center}
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
.${P}bk{width:calc(var(--cw)*.8);height:calc(var(--cw)*1.12);overflow:hidden;border-radius:6px;border:1.5px solid ${INK};background:repeating-linear-gradient(45deg,#7a3a22 0 5px,#8e4a2a 5px 10px);display:grid;place-items:center;color:#f0c050;font:28px 'IM Fell English',serif;cursor:pointer;flex:none;transition:transform .15s}
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

.${P}card>img{display:block;width:100%;height:calc(100% - 20px);object-fit:cover;pointer-events:none;-webkit-user-drag:none}
.${P}card>svg{height:calc(100% - 20px)}
.${P}cap{position:absolute;left:0;right:0;bottom:0;height:20px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:2px;padding:0 4px 0 5px;background:#fbf3df;border-top:1px solid ${INK};font:600 11px ui-monospace,monospace;letter-spacing:0;color:${INK};white-space:nowrap;pointer-events:none}
.${P}cap img,.${P}cap svg{width:15px;height:15px;flex:none}
.${P}cap b{font-weight:600;color:${RED}}
.${P}card.${P}down .${P}cap{background:#3a281c;color:${PAPER};border-top-color:#1b120c;justify-content:center}
.${P}bk img{display:block;width:100%;height:100%;object-fit:cover}
.${P}rope div img{width:20px;height:20px;vertical-align:-5px;margin-right:3px}
.${P}rope div{grid-template-columns:74px 1fr 64px}
.${P}next{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
.${P}next .${P}card{cursor:pointer;--cw:72px}
.${P}next small{flex:1 1 100%;font-size:15px;font-style:italic;color:#4a3324;line-height:1.25}
.${P}who{display:flex;gap:10px;align-items:center;margin:0 0 8px}
.${P}who b{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:21px;display:block}
.${P}who span{font-size:16px;line-height:1.3}
.${P}pellrow{display:flex;gap:8px;align-items:flex-start}
.${P}leaf>span[role=img]{margin:-4px 0 10px}
.${P}wall{position:relative;margin:0 0 10px;font-family:'IM Fell English',Georgia,serif;font-style:italic;color:#e6ecc0;container-type:inline-size}
.${P}wall i{position:absolute;left:61%;width:34%;font-size:3.4cqw;line-height:1.15;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.${P}wall i+i{left:16%}
.${P}leaf{max-height:100%;overflow:auto}
.${P}year{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:flex-end;margin:0 0 10px;clear:both}
.${P}year figure{margin:0;display:flex;gap:3px;align-items:flex-end}
.${P}year figure img{width:46px;height:auto;display:block;border-radius:3px;box-shadow:1px 2px 0 rgba(58,40,28,.35)}
.${P}year figure img+img{width:38px}
.${P}year figcaption{font:italic 15px/1.2 'Cormorant Garamond',Georgia,serif;margin-left:4px;max-width:9em}
.${P}year .${P}wheel{width:64px;height:64px;margin-left:auto}
.${P}thread{float:right;width:104px;height:104px;margin:0 0 6px 10px;border-radius:6px}
.${P}two{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 8px}
.${P}leaf img[class$="art-title"]{width:min(100%,250px)}
.${P}ropewrap{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center}
.${P}ropewrap>img{height:74px;width:auto}
@media (max-width:760px){.${P}cap{font-size:10.5px;padding:0 3px}.${P}cap img,.${P}cap svg{width:13px;height:13px}}
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
  <div class="${P}ropewrap">${art.has("ui-balance-rope") ? `<img src="${art.url("ui-balance-rope")}" alt="" width="23" height="74">` : "<span></span>"}<div class="${P}rope" aria-label="The Balance Rope"></div></div>
  <div class="${P}back"><div class="${P}bk" role="button" tabindex="0" aria-label="Turn the Backyard card (Y)">?</div><div class="${P}help">The Backyard card. Only you can turn it (Y). It is never placed.</div></div>
  <div class="${P}next" hidden></div>
  <div class="${P}pellrow"><span class="${P}face"></span><div class="${P}pell" aria-live="polite"></div></div>
  <div class="${P}acts"><button class="${P}ask" type="button"></button><button class="${P}ask ${P}notch" type="button" hidden></button><button class="${P}lay" type="button" disabled>Lay the reading</button></div>
 </div>
 <div class="${P}hand"></div>
</div>
<div class="${P}intro"><div class="${P}leaf" role="dialog" aria-label="How to play">
 ${kit.title(art)}
 <div class="${P}init">S</div>
 <h2>Omen Spread</h2>
 <p class="${P}beat">Summer, at the Knot's table in Highridge. Elder Pell reads by the notches on the card edges now; his eyes are going. Things happen, and the city waits to be told what they meant.</p>
 ${yearStrip([["tremor", "The Tremor: a squirrel, landing"], ["rain", "The Rain: a spring shower"]], true)}
 <p class="${P}goal"><b>Goal:</b> read the windstorm. Lay three cards around the event card: the heaviest suit is what it <i>means</i>; a sigil on two cards decides <i>who answers</i>. No reading is wrong here. Try a few before you seal one.</p>
 <div class="${P}key">
  <kbd>drag · or tap</kbd><span>a card, then a slot: Root, Branch, Crown</span>
  <kbd>1–6 · R B C</kbd><span>the same, from the keys</span>
  <kbd>Lay · Enter</kbd><span>seal it when the preview says what you mean</span>
 </div>
 <button class="${P}lay" type="button">Begin the reading</button>
</div></div>`;
    root.appendChild(wrap);
    kit.styles(wrap);
    const sizeCards = () => {
      const r = wrap.getBoundingClientRect();
      const cw = r.width < 760 ? Math.min(100, Math.max(76, (r.width - 76) / 3.3)) : Math.min(128, Math.max(84, (r.height - 300) / 4.6), r.width / 11);
      wrap.style.setProperty("--cw", Math.round(cw) + "px");
    };
    sizeCards();
    const ro = new ResizeObserver(sizeCards); ro.observe(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const notchBtn = $("notch");
    const handEl = $("hand"), preview = $("preview"), ropeEl = $("rope"), layBtn = wrap.querySelector(`.${P}side .${P}lay`), bk = $("bk"), askBtn = $("ask"), pellEl = $("pell"), selInfo = $("selinfo"), nextEl = $("next"), faceEl = $("face");

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

    // ---- card faces: the art where it exists, the old inked drawing where it does not ----
    const sigilIcon = (k) => (art.has("ui-sigil-" + k) ? `<img src="${art.url("ui-sigil-" + k)}" alt="${cap(k)}">` : `<svg viewBox="-34 -34 68 68" aria-label="${cap(k)}">${SIGIL_SVG[k]}</svg>`);
    function eventFace() {
      const id = "event-" + E.key;
      const capLine = `<span class="${P}cap"><span>${E.suit ? SUITS[E.suit].name : "no suit"}</span><b>${E.suit ? "weight 2" : "—"}</b></span>`;
      if (art.has(id)) return `<img src="${art.url(id)}" alt="Event card: ${E.title}${E.suit ? ", " + SUITS[E.suit].name + ", weight 2" : ", no suit"}">${capLine}`;
      const big = E.suit === "mandible"
        ? `<g transform="translate(50 74)"><ellipse rx="22" ry="15" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M-12 -12 Q-24 -26 -30 -18 M12 -12 Q24 -26 30 -18" fill="none" stroke="${INK}" stroke-width="1.5"/></g>`
        : `<g transform="translate(50 74)" fill="none" stroke="${INK}" stroke-width="1.6"><path d="M-30 -14 Q-10 -26 10 -14 T40 -14"/><path d="M-34 0 Q-14 -12 6 0 T36 0"/><path d="M-30 14 Q-10 2 10 14 T40 14"/></g>`;
      return `<svg viewBox="0 0 100 145"><rect x="4" y="4" width="92" height="137" rx="6" fill="none" stroke="${GOLD}" stroke-width="1"/>
<rect x="18" y="14" width="64" height="17" fill="${RED}"/><text x="50" y="27" text-anchor="middle" font-family="IM Fell English,serif" font-size="12" fill="${PAPER}" letter-spacing="1.5">EVENT</text>
${E.suit ? `<g transform="translate(50 74) scale(1.4)">${SUIT_SVG[E.suit]}</g>${big}` : `<circle cx="50" cy="74" r="20" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 4"/>`}
<text x="50" y="122" text-anchor="middle" font-family="IM Fell English,serif" font-size="11.5" fill="${INK}" ${E.name.length > 10 ? 'textLength="84" lengthAdjust="spacingAndGlyphs"' : ""}>${E.name}</text></svg>${capLine}`;
    }
    function cardFace(c, hidden) {
      if (hidden) {
        const capLine = `<span class="${P}cap">unseen</span>`;
        return (art.has("omen-back") ? `<img src="${art.url("omen-back")}" alt="A card dealt face down">` : `<svg viewBox="0 0 100 145"><rect width="100" height="145" fill="#4a2a18"/><circle cx="50" cy="72" r="26" fill="none" stroke="${GOLD}" stroke-width="2"/></svg>`) + capLine;
      }
      const capLine = `<span class="${P}cap"><span>${SUITS[c.suit].name} <b>${c.w}</b></span>${sigilIcon(c.sigil)}</span>`;
      const label = `${c.name}, ${SUITS[c.suit].name}, ${c.sigil}, weight ${c.w}`;
      const id = "omen-" + slug(c.name);
      if (art.has(id)) return `<img src="${art.url(id)}" alt="${label}">${capLine}`;
      const dots = Array.from({ length: c.w }, (_, i) => `<circle cx="${86 - i * 9}" cy="14" r="3.4" fill="none" stroke="${GOLD}" stroke-width="1.8"/>`).join("");
      return `<svg viewBox="0 0 100 145" role="img" aria-label="${label}">
<path d="M8 12 q4 -6 8 0 t8 0 t8 0" fill="none" stroke="${RED}" stroke-width="1.5"/>
<g transform="translate(17 28) scale(1.2)">${SUIT_SVG[c.suit]}</g>${dots}
<g transform="translate(50 68)">${SIGIL_SVG[c.sigil]}</g>
<text x="50" y="122" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-weight="600" font-size="12.5" fill="${INK}">${c.name}</text></svg>${capLine}`;
    }
    function makeCard(c, numberLabel) {
      const d = document.createElement("div");
      const hidden = c === down && !done;
      d.className = P + "card" + (hidden ? " " + P + "down" : ""); d.tabIndex = 0; d.dataset.id = c.id;
      d.innerHTML = cardFace(c, hidden) + (numberLabel ? `<span class="${P}num">${numberLabel}</span>` : "");
      attachDrag(d, c);
      on(d, "pointerenter", () => showInfo(c));
      on(d, "focus", () => showInfo(c));
      return d;
    }
    function showInfo(c) {
      const cc = c || selected;
      if (cc && cc === down && !done) { selInfo.innerHTML = `<b>A card face down</b><br>Twig dealt it that way. It must be laid, and turns over with the reading.`; return; }
      selInfo.innerHTML = cc ? `<b>${cc.name}</b><br>${SUITS[cc.suit].name} (${SUITS[cc.suit].belief.replace(/^an? /, "")}) · ${cap(cc.sigil)}, ${SIGILS[cc.sigil]} · weight ${cc.w}` : `<i>Point at a card to read its edge.</i>`;
    }

    function setupHead() {
      $("phase").textContent = `SPREAD ${ev + 1} OF ${EVENTS.length} · ${E.season}`;
      wrap.querySelector(`.${P}head h2`).textContent = E.title;
      $("sees").textContent = E.sees;
      wrap.querySelector(`.${P}head .${P}init`).textContent = E.title[4];
      const ew = $("evwrap"); ew.innerHTML = "";
      const evCard = document.createElement("div");
      evCard.className = P + "card " + P + "ev"; evCard.innerHTML = eventFace();
      ew.appendChild(evCard);
      bk.className = P + "bk"; bk.setAttribute("role", "button"); bk.tabIndex = 0; bk.textContent = "?";
      $("help").textContent = "The Backyard card. Only you can turn it (Y). It is never placed.";
      faceEl.innerHTML = kit.mark(art, heir ? heir.who : "pell", heir ? heir.name : "Elder Pell");
      renderNext();
    }
    function renderNext() {
      nextEl.hidden = !(heir && heir.who === "fenn");
      if (nextEl.hidden) return;
      nextEl.innerHTML = "";
      shown.forEach((c, i) => {
        const d = document.createElement("div");
        d.className = P + "card"; d.tabIndex = swaps || done ? -1 : 0; d.setAttribute("role", "button");
        d.setAttribute("aria-label", `Next in the deck: ${c.name}. Take it for the chosen card (${i ? "G" : "F"})`);
        d.innerHTML = cardFace(c, false);
        on(d, "click", () => swap(i));
        on(d, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); swap(i); } });
        on(d, "pointerenter", () => showInfo(c));
        nextEl.appendChild(d);
      });
      nextEl.insertAdjacentHTML("beforeend", `<small>${swaps ? "Fenn has squared the deck again." : "The next two in the deck, shown. Choose a hand card, then one of these (F, G), to trade them. Once."}</small>`);
    }
    function swap(i) {
      if (done || swaps || !shown[i]) return;
      if (!selected || !hand.includes(selected)) { pellSays("“Choose the card you would give up first.”", "Fenn"); return; }
      const k = hand.indexOf(selected);
      [hand[k], shown[i]] = [shown[i], hand[k]];
      swaps = 1; selected = null; renderHand(); renderNext();
      pellSays("writes the trade down, with the hour.", "Fenn");
    }

    // ---- reading logic ----
    function reading() {
      const placed = Object.values(slots).filter(Boolean);
      const wsum = {};
      if (E.suit) wsum[E.suit] = 2;
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
      const clear = !!E.suit && placed.length === 3 && placed.every((c) => c.suit === E.suit);
      const bold = !!E.suit && placed.length === 3 && placed.every((c) => c.suit !== E.suit);
      if (clear) mor += 5;
      if (bold) { mor -= 3; delta.quill += 2; }
      const fit = !!E.fit && meaning === E.fit;
      const monster = E.key === "beetle" && policy === "spear";
      // the Reading of the Shadow: a majority reading holds only if that institution leads the rope
      let shadow = null, fell = false;
      if (E.key === "shadow" && placed.length === 3) {
        const want = policy ? BY_SIGIL[policy] : "trial";
        if (want !== "trial" && leading !== policy) { shadow = "trial"; fell = want; } else shadow = want;
      }
      return { placed, meaning, policy, balanced, delta, morale: mor, clear, bold, fit, monster, shadow, fell, n: placed.length };
    }
    const PULSE_WHO = { eye: "The Knot will keep it holy, and unread.", spear: "The Battlements will stand a watch on the wall.", quill: "The Scroll House will write down a thing with no face." };
    function renderPreview() {
      const r = reading();
      const blind = !!down && !done && r.placed.includes(down);
      if (!r.n) {
        preview.innerHTML = `The reader's pen waits.<small>Lay a card in Root, Branch or Crown. The reading writes itself here as you go.</small>`;
      } else if (blind) {
        preview.innerHTML = `One card lies face down. <em>The reading is not whole until it turns.</em><small>Twig is watching your hand, not the cards.</small>`;
      } else if (E.key === "shadow") {
        const line = r.shadow ? `“${SHADOW[r.shadow].line}”` : "The reading is not yet whole.";
        const why = r.fell ? ` ${cap(SIGILS[BY_SIGIL_KEY(r.fell)])} ${BY_SIGIL_KEY(r.fell) === "spear" ? "do" : "does"} not lead the year, so its reading cannot be laid: it falls to a trial.` : "";
        preview.innerHTML = `${line}<small>${r.shadow ? `It will be read as <em>${r.shadow === "trial" ? "a trial" : r.shadow === "enemy" ? "an enemy" : r.shadow === "habit" ? "a thing with a habit" : "a hungry god"}</em>.${why}` : "One of each sigil is a trial. Two of one is that house's reading, if it leads the rope by 12."}${slots.crown && slots.crown !== down ? ` The saying on the wall: “${slots.crown.name}.”` : ""}</small>`;
      } else {
        const who = E.key === "pulse" ? (r.policy ? PULSE_WHO[r.policy] : r.balanced ? "All three will answer it together." : "Who answers is not yet plain.")
          : r.policy ? `${cap(SIGILS[r.policy])} will answer it.` : r.balanced ? "All three will answer it together." : "Who answers is not yet plain.";
        const kind = r.clear ? " A <em>clear</em> reading." : r.bold ? " A <em>bold</em> reading." : "";
        const fit = !turned ? "" : E.fit ? (r.fit ? " <em>It fits the cause.</em>" : " It does not fit the cause.") : E.key === "pulse" ? " <em>There is no cause to fit it to.</em>" : "";
        const beast = E.key === "beetle" ? (r.monster ? "The Beetle will be met as a <em>monster</em>: the warriors hold the crack." : "The Beetle will be met as a <em>god</em>: it will be escorted.") : "";
        preview.innerHTML = `It is ${SUITS[r.meaning].belief}. ${who}${kind}${fit}<small>${beast}${slots.crown ? ` The saying on the wall: “${slots.crown.name}.”` : ""}</small>`;
      }
      const labels = { eye: "Eye", spear: "Spear", quill: "Quill" }, cols = { eye: BLUE, spear: RED, quill: GOLD };
      ropeEl.innerHTML = Object.keys(labels).map((k) => {
        const d = blind ? 0 : r.delta[k], v = rope[k] + d;
        return `<div><span>${art.has("ui-sigil-" + k) ? `<img src="${art.url("ui-sigil-" + k)}" alt="">` : ""}${labels[k]}${leading === k ? " ★" : ""}</span><i class="${P}strand" style="--c:${cols[k]};width:${Math.max(8, Math.min(100, v * 1.8))}%"></i><span>${v}${d ? ` (${d > 0 ? "+" : ""}${d})` : ""}</span></div>`;
      }).join("");
      layBtn.disabled = r.n < 3 || done || (!!down && !r.placed.includes(down));
      layBtn.textContent = down && r.n === 3 && !r.placed.includes(down) && !done ? "Lay Twig's card first" : "Lay the reading";
      if (!heir) { askBtn.hidden = false; askBtn.disabled = askLeft <= 0 || done; askBtn.textContent = `Ask Pell · ${askLeft}`; }
      else if (heir.who === "hollow") { askBtn.hidden = false; askBtn.disabled = redeals <= 0 || done; askBtn.textContent = `Redeal · ${redeals}`; }
      else askBtn.hidden = true;
      notchBtn.hidden = E.key !== "shadow"; notchBtn.disabled = notch <= 0 || done; notchBtn.textContent = `Feel the notch · ${notch}`;
    }
    const BY_SIGIL_KEY = (reading) => Object.keys(BY_SIGIL).find((k) => BY_SIGIL[k] === reading);
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
      if (locked && (c === locked || slots[slot] === locked)) { pellSays(`“That one is ${SIGILS[locked.sigil]}'s. It was laid before you sat down.”`); selected = null; renderHand(); return; }
      for (const k in slots) if (slots[k] === c) slots[k] = null;
      hand = hand.filter((x) => x !== c);
      if (slots[slot]) hand.push(slots[slot]);
      slots[slot] = c; selected = null; landed = c;
      if (pellTip && pellTip.slot === slot) pellTip = null;
      renderHand();
      const n = Object.values(slots).filter(Boolean).length;
      if (n === 1 && ev === 0) pellSays("He taps the card's edge twice. “A card means what we do after it.”");
      if (n === 3 && !turned && ev < 2) pellSays("“Before you lay it: the Backyard card is yours to turn, not mine.”");
      if (n === 3 && !turned && ev === 2) pellSays("waits. He can hear that you have not turned your card.");
    }
    function unplace(c) {
      if (c === locked) { pellSays(`“Leave it. ${cap(SIGILS[locked.sigil])} laid it first, and it stays.”`); return; }
      for (const k in slots) if (slots[k] === c) { slots[k] = null; hand.push(c); }
      selected = null; renderHand();
    }
    const inSlot = (c) => Object.values(slots).includes(c);
    const pellSays = (t, who) => { const w = who === undefined ? (heir ? heir.name : "Pell") : who; pellEl.textContent = (w ? w + ": " : "") + t; };

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
      const id = E.key === "pulse" ? "backyard-blank" : "backyard-" + E.key;
      if (art.has(id)) bk.innerHTML = `<img src="${art.url(id)}" alt="${E.cause ? "The Backyard card: " + E.cause.join(" ") : "The Backyard card, blank"}">`;
      else {
        const pic = E.key === "beetle"
          ? `<ellipse cx="40" cy="70" rx="15" ry="9" fill="#222"/><circle cx="25" cy="68" r="5" fill="#222"/><path d="M28 76 l-6 7 M40 78 l0 8 M52 76 l6 7" stroke="#222" stroke-width="1.5"/>`
          : E.key === "wind" ? `<path d="M10 104 Q14 84 22 72 M24 104 Q26 82 36 70 M40 104 Q42 84 52 74 M56 104 Q58 86 66 76" stroke="#3e7a2e" stroke-width="2.4" fill="none"/><path d="M8 52 Q30 44 52 52 T76 50 M14 62 Q34 56 54 62" stroke="#7aa0c0" stroke-width="1.6" fill="none"/>` : "";
        bk.innerHTML = E.cause ? `<svg viewBox="0 0 80 116" style="width:100%;height:100%"><rect x="2" y="2" width="76" height="112" fill="#e6f0dc" rx="4"/><rect x="2" y="78" width="76" height="36" fill="#8fbf6a"/>
${pic}<text x="40" y="20" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#222">${E.cause[0]}</text><text x="40" y="31" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#222">${E.cause[1]}</text></svg>`
          : `<svg viewBox="0 0 80 116" style="width:100%;height:100%"><rect x="2" y="2" width="76" height="112" fill="#efe9dc" rx="4" stroke="#bdb6a6"/></svg>`;
      }
      if (E.key === "pulse") {
        $("help").textContent = "You looked up, as always. A dark yard, one lit window, nothing moving. The card is blank. For the first time you know no more than Pell does.";
        pellSays("feels you hesitate. “Then for once we are holding the same hand.”");
        api.store.set("blank", true);
      } else if (E.key === "shadow") {
        $("help").textContent = `The real cause, drawn plain: ${E.cause.join(" ")}. No suit fits it, and no reading of yours can tell them.`;
      } else $("help").textContent = `The real cause, drawn plain: ${E.cause.join(" ")}. The suit in its corner, ${SUITS[E.fit].name}, fits it. The people never see this card.`;
      renderPreview();
    }
    on(bk, "click", turn);
    on(bk, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(); } });
    function ask() {
      if (done) return;
      if (heir) {
        if (heir.who !== "hollow" || redeals <= 0) return;
        redeals--; const keep = heir; deal(); heir = keep; renderHand();
        pellSays("gathers the cards without a word and deals five more.", "Hollow");
        return;
      }
      if (askLeft <= 0) return;
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
    // notch-reading: what Pell's thumb did for forty years, done once, by the player
    function feel() {
      if (done || notch <= 0 || !deck.length) return;
      const top = deck[0];
      if (!selected || !hand.includes(selected) || selected === down) { pellSays(`Your thumb finds the notch on the top card: ${top.name} (${SUITS[top.suit].name}, ${cap(top.sigil)}, weight ${top.w}). Choose a hand card first to trade for it, then feel again.`, ""); return; }
      notch--; const k = hand.indexOf(selected); deck[0] = hand[k]; hand[k] = top; selected = null; renderHand();
      pellSays(`You deal yourself ${top.name} off the top, the way he did. “Clumsy me,” says nobody.`, "");
    }
    on(notchBtn, "click", feel);

    on(window, "keydown", (e) => {
      if (done || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-7]$/.test(e.key)) { const c = hand[+e.key - 1]; if (c) { selected = c; renderHand(); showInfo(c); } return; }
      const map = { r: "root", b: "branch", c: "crown" };
      const k = e.key.toLowerCase();
      if (map[k]) { if (selected) place(selected, map[k]); else pellSays("“Which card? Pick one with its number.”"); }
      if (k === "y") turn();
      if (k === "p") ask();
      if (k === "n") feel();
      if (k === "f" && shown.length) swap(0);
      if (k === "g" && shown.length) swap(1);
      if (e.key === "Enter" && !layBtn.disabled && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("button,[role=button]," + "." + P + "card"))) lay();
    });

    // ---- between the spreads ----
    function card(html, btnLabel, go) {
      const el = document.createElement("div");
      el.className = P + "intro";
      el.innerHTML = `<div class="${P}leaf" role="dialog">${html}<button class="${P}lay" type="button">${btnLabel}</button></div>`;
      wrap.appendChild(el);
      const b = el.querySelector("button");
      on(b, "click", () => { el.remove(); go(); });
      b.focus({ preventScroll: true });
    }
    function nextSpread() { ev++; deal(); setupHead(); pellEl.textContent = ""; renderHand(); handEl.querySelector("." + P + "card")?.focus(); }
    function chooseHeir() {
      const n = { eye: 0, spear: 0, quill: 0 };
      for (const x of [past("r0"), past("r1")].concat(readings)) if (x.r.policy) n[x.r.policy]++;
      const top = Object.keys(n).sort((a, b) => n[b] - n[a])[0];
      return n[top] >= 2 ? HEIRS[{ eye: "hollow", spear: "burr", quill: "fenn" }[top]] : HEIRS.twig;
    }

    function lay() {
      const r = reading(); if (r.n < 3 || done || (down && !r.placed.includes(down))) return;
      done = true;
      for (const k in rope) rope[k] += r.delta[k];
      morale += r.morale;
      // an honest hand may hold no reading that can stand; then laying the trial knowingly is not a failure
      let could = true;
      if (E.key === "shadow") {
        const all = hand.concat(Object.values(slots).filter(Boolean)); could = false;
        for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) for (let c = b + 1; c < all.length; c++) {
          const t = [all[a], all[b], all[c]]; if (down && !t.includes(down)) continue;
          const n = { eye: 0, spear: 0, quill: 0 }; t.forEach((x) => n[x.sigil]++);
          const pol = Object.keys(n).find((k) => n[k] >= 2);
          if (!pol || pol === leading) could = true;
        }
      }
      readings.push({ ev: E, r, crown: slots.crown.name, turned, could });
      renderHand();
      api.store.set("last", { event: E.key, meaning: r.meaning, policy: r.policy || (r.balanced ? "balanced" : null), monster: r.monster, shadow: r.shadow });
      const wait = api.reducedMotion ? 600 : 1700;
      api.store.set("rope", rope);
      const keepR = { crown: slots.crown.name, r: { meaning: r.meaning, policy: r.policy, monster: r.monster, fit: r.fit }, turned };
      if (ev === 0) {
        api.store.set("r0", keepR);
        pellSays(r.fit ? "“A trial. Yes. Lash the towers.” He does not know why it will work. It will." : "“So it is written.” He sets the cards back in the deck, in order.");
        later(() => api.end({ outcome: "win", text: `The wind is read as ${SUITS[r.meaning].belief}. ${r.policy ? cap(SIGILS[r.policy]) + " will answer it" : "All three houses will answer it together"}, and “${slots.crown.name}” goes up on the saying wall.${turned ? (r.fit ? " It fitted the real cause: the towers are lashed before the next gust, and nobody on the bark knows why that was right." : " It did not fit the real cause, and nobody on the bark will ever know that either.") : " You did not turn the Backyard card."} No reading is wrong at this table. Some are only more use.` }), wait);
      } else if (ev === 1) {
        api.store.set("r1", keepR);
        if (r.monster) pellSays("Burr is already buckling his helmet.", ""); else pellSays("“Then we bow, and we get out of its way.”");
        const lives = r.monster ? "Burr holds the crack against a monster, and names go on the Roll of the Bark." : "The Beetle is escorted as a god, and nobody stands in its road.";
        later(() => api.end(r.fit
          ? { outcome: "win", text: `The Beetle is read as ${SUITS[r.meaning].belief}: it fits. ${lives} “${slots.crown.name}” goes up on the wall. A wandering thing was met as a wandering thing, and it wandered on.` }
          : { outcome: "lose", text: `The Beetle is read as ${SUITS[r.meaning].belief}. It was a ground beetle, wandering, and the reading did not fit it. ${lives} The city spends the week answering ${SUITS[r.meaning].belief} that never came, and the crack is short-handed for it. Mandible has to be the heaviest suit on the table.` }), wait);
      } else if (ev === 2) {
        pellSays(r.policy === "eye" ? "“Holy, then. And we do not ask it questions.”" : r.policy === "quill" ? "“Write it, Fenn. Even without a face.”" : r.policy === "spear" ? "“A watch on a wall. Burr will like that less than he thinks.”" : "“All of us, then. Good. I would not want to answer this one alone.”");
        api.store.set("pulse", { policy: r.policy || "balanced", meaning: r.meaning, sawBlank: turned });
        later(() => {
          heir = chooseHeir(); leading = lead(); redeals = heir.who === "hollow" ? 1 : 0; swaps = 0;
          const why = heir.who === "twig" ? "No house answered the year twice, so the deck went to the one who asks “and then what?”" : `${cap(SIGILS[heir.sigil])} answered the year more than once, and Pell's last reading left the deck there.`;
          card(`<div class="${P}two">${kit.chapter(art, "chapter-5-winter")}${kit.chapter(art, "chapter-6-the-shadow")}</div><div class="${P}who">${kit.mark(art, heir.who, heir.name)}<span><b>${heir.name} has the deck</b>${heir.line}</span></div>
<p class="${P}beat">Twig, at the door, of the tapping: “Is it knocking to come in, or knocking to see who's home?” Nobody answers. Winter comes. Elder Pell dies in the frost, of age, as his leaf said he would. ${why}</p>
<p class="${P}goal"><b>An honest deal.</b> Pell dealt by the notches, and a card of the event's suit was always in your hand. No one else can. ${heir.rule}</p>
${yearStrip([["leaf", "The Leaf: autumn"], ["song", "The Birdsong: a small bird"], ["year", "The Year: Pell's last reading"]])}
<p class="${P}beat">Then the world goes dark. ${leading ? `${cap(SIGILS[leading])} lead${leading === "spear" ? "" : "s"} the year (★): two of its sigil lays its own reading of the Shadow.` : "No house leads the year by 12: whatever is laid, the Shadow will be read as a trial."}</p>`, "Lay out the last spread", nextSpread);
        }, wait);
      } else {
        const twigWas = down ? ` Twig's card turns over: ${down.name}.` : "";
        pellSays((r.shadow === "enemy" ? "“Battlements!”" : r.shadow === "habit" ? "“Stakes and string. We measure it.”" : r.shadow === "offering" ? "“Pour it. All of it.”" : "“Chant. Stand. Record.”") + twigWas, heir.who === "hollow" ? "The city" : heir.name);
        later(finish, api.reducedMotion ? 300 : 1500);
      }
    }
    function beetleCard() {
      return `${kit.mark(art, "twig", "Twig")}<div class="${P}init">T</div><h2>The Thumb on the Deck</h2>
<p class="${P}beat">The summer festival. Pell lets Twig deal for him, for a treat, and Twig deals him an ugly hand: nothing in it that answers anything. Pell gathers the cards up. “Clumsy me.” He squares the deck and deals again, and you see his thumb go along the edge and stop at a notch. The second hand is a good one. It always has been.</p>
<p class="${P}beat">Then a runner from Splinterwatch falls through the door. Something as big as a city is climbing from the Under. Captain Burr, at the window: “Small ones we fight. Big ones we bow to. Middling ones, we ask the Knot.”</p>
<p class="${P}goal"><b>Goal:</b> a reading that <b>fits</b>. Turn the Backyard card (Y) to see the real cause and its suit; that suit must be the heaviest on the table. A <b>Spear</b> policy makes the Beetle a <b>monster</b>, fought at the barricades; anything else a <b>god</b>, escorted. Lives depend on which.</p>
<div class="${P}key"><kbd>Y</kbd><span>turn the Backyard card: see the real cause</span><kbd>Ask Pell · P</kbd><span>once a spread, his thumb names a card and a slot</span></div>`;
    }
    function pulseCard() {
      const w = past("r0", "The Bowed Elder"), b = past("r1", "The Great Visitor");
      const wall = art.has("saying-wall") ? `<div class="${P}wall">${kit.chapter(art, "saying-wall", false)}<i style="top:14%">${w.crown}.</i><i style="top:40%">${b.crown}.</i></div>` : "";
      return `${kit.chapter(art, "chapter-4-autumn")}${art.has("thread-own") ? `<img class="${P}thread" src="${art.url("thread-own")}" alt="A knock, answered from the other side of a wall" width="104" height="104">` : `<div class="${P}init">P</div>`}<h2>The Pulse</h2>${wall}
<p class="${P}beat">Autumn. Your two sayings are on the wall with Pell's own: “${w.crown}” and “${b.crown}.” Then one night something wakes Highridge. Not the dawn tremor. A small steady tapping, from no face of the Trunk, because it comes from inside. The Knot calls it the Trunk's Pulse and lays out a spread.</p>
<p class="${P}goal">The event card has <b>no suit</b>: only the cards give it a meaning. From autumn the leading house lays the <b>Crown</b> before you sit down, and that card cannot be moved. Look up, as you always do, and turn the Backyard card.</p>`;
    }
    function finish() {
      const [pu, sh] = readings, w = past("r0", "The Bowed Elder"), b = past("r1", "The Great Visitor");
      const ch = Object.entries(rope).map(([k, v]) => `${INST[k]} ${v}`).join(", ");
      const beast = b.r.monster ? "the Beetle was fought as a monster" : "the Beetle was escorted as a god";
      const fits = [w, b].filter((x) => x.r.fit).length;
      const unturned = readings.filter((x) => !x.turned).length;
      const pulse = pu.turned ? "On the night of the Pulse your card came up blank, and you read it knowing no more than they did." : "On the night of the Pulse you did not look up.";
      const s = sh.r.shadow;
      const ends = {
        trial: "The Shadow is read as a trial. The priests chant, the warriors stand, the scholars record, and the Shadow passes. “Even the smallest world is a universe to the ones who live in it.”",
        offering: "The Shadow is read as a hungry god, and the Knot pours out everything the city has. The Shadow passes. “Even the smallest world is a universe to the ones who live in it.”",
        enemy: "The Shadow is read as an enemy, and the Battlements go up the wall to meet it. The War on the God.",
        habit: "The Shadow is read as a thing with a habit, and the Scroll House walks to its edge with stakes and string. The Edge of the World.",
      };
      const names = { trial: "THE SHADOW PASSES · AS WRITTEN", offering: "THE SHADOW PASSES · AS WRITTEN", enemy: "THE WAR ON THE GOD", habit: "THE EDGE OF THE WORLD" };
      const text = `${ends[s]} ${heir.name} dealt the last hand honestly. Over the year: the wind was ${SUITS[w.r.meaning].belief}, ${beast}${fits ? ` (${fits} reading${fits > 1 ? "s" : ""} fitted the real cause)` : ""}. ${pulse} The rope stands at ${ch}${morale ? `; morale ${morale > 0 ? "+" : "−"}${Math.abs(morale)}` : ""}.${unturned ? ` Backyard cards left face down: ${unturned}.` : ""}`;
      const stood = !sh.r.fell || !sh.could;
      endEl = kit.endCard(root, api, SHADOW[s].end, { outcome: stood ? "win" : "done", text: stood ? text + (sh.r.fell ? " No three cards in that honest hand could have stood; you laid the trial knowing it." : "") : text + " You laid another reading and it fell to a trial, because its house does not lead the year: the twist is not yet won." }, `<b>${names[s]}</b>Painted on the ridge: “${w.crown}”, “${b.crown}”, “${pu.crown}”, “${sh.crown}.”`);
    }
    let endEl = null;
    on(layBtn, "click", lay);
    const startBtn = wrap.querySelector(`.${P}intro .${P}lay`);
    on(startBtn, "click", () => { wrap.querySelector("." + P + "intro").remove(); pellSays("“The Trunk does not shout twice. Write it down.”"); handEl.querySelector("." + P + "card")?.focus(); });
    startBtn.focus({ preventScroll: true });
    setupHead();
    renderHand();
    if (stage > 0) {
      wrap.querySelector("." + P + "intro").remove();
      card(stage === 1 ? beetleCard() : pulseCard(), stage === 1 ? "Lay out the spread" : "Lay out the night spread", () => { pellEl.textContent = ""; handEl.querySelector("." + P + "card")?.focus(); });
    }

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); ro.disconnect(); if (endEl) endEl.remove(); wrap.remove(); } };
  }
}

// Missing Campsites / Foil Supper (1D, two-colour risograph recipe card).
//
// DESIGN.md section 11, Foil Supper, at foil_supper_2: day 2 dusk, five friends and Marisol, food
// for five. No corn, no butter, no onions, no ramps (gone at step 4). Each packet needs one
// ingredient in each role: Base, Body, Fat, Flavour. Score: 3 = the card's own in every role;
// 2 = one substitution the card allows; 1 = edible; 0 = a role empty, not made (that diner shares).
// The coal bar runs 3 minutes (pausable). Bea's card is in someone else's hand, so on day 2 its
// heading and every line naming the store are blank; the card was not copied on day 1 here.
//
// Actions (the refine pass):
//   Pick    an ingredient from the cooler (click, or 1–6), and the pencil shows what each space
//           would score.
//   Place   it in a role space; Take back by tapping a filled space.
//   Taste   (T) the unlabelled jar June finds a minute in: tasting costs 20 s of coal (DESIGN.md's
//           own price for an unknown) and shows its role. Untasted, it can only be "edible".
//   Cook    Onto the coals, whenever you like; at 0 the packets cook as they are.
// There is olive oil for three, so the jar decides whether a fourth packet can be a 2.
// Outcomes: six packets, average 1.5 or better (win); six packets, average 1 or better (done);
// otherwise lose. After two losses in a row the coals last four minutes.
// Lines in TEXT are written for the game (listed for approval); the card lines are this prototype's.
//
// Art (api.art): the riso ingredient tiles in the cooler and on the sheets (the store's and the gifts'
// tiles stay on the shelf, struck through); Bea's card, blank as it is on day 2, with yesterday's
// legible card on the how-to; the diners' portrait outlines on their sheets (Tam's sheet has none:
// Tam's face is never drawn); chapter 4's card on the how-to; and the title lettering over chapter
// 5's card behind the result. The dotted swatches and the typed card lines are the fallback.

//
// Phase 2 (2026-11-16): the ladder. Three meals, each an appearance of DESIGN.md section 11:
//   1 Teach  foil_supper_1: five diners, everything in the cooler, the card legible. Copy the card
//            (C, one press). Link (supper to the run): each friend whose packet is the card's own
//            (score 3) stands on the road with a lantern in the Torchlight loop's carrying run.
//   2 Test   foil_supper_2: substitution, six from food for five, and coal zones: hot at the left,
//            cool at the right. Sausage wants the hot end or the middle, a lentil cake the cool end or
//            the middle, and the middle takes two. A packet in the wrong place loses a point.
//   3 Twist  foil_supper_3, breakfast on the other side: grey apples and a salt that tastes of nothing.
//            They cook backwards, colder the longer they sit, so a packet with one in it belongs OFF
//            the coals, and the move of two suppers (get it on the heat) ruins it. One sheet too many:
//            fill it or leave it. The set-piece: a packet opens on Bea's supper, exactly right, and
//            tastes of nothing.

import { pic, chapterCard, resultCard, ladder, stageTabs } from "./kit.js";

const NAMES = ["The card's own", "Coal zones", "Breakfast"];

const PINK = "#ff4fa3", TEAL = "#0f8a8a", NAVY = "#24344f", PAPER = "#efe7dc";
const P = "missing-campsites-foil-supper-";
const ROLES = ["Base", "Body", "Fat", "Flavour"];
const ALL_INGR = [
  { id: "potato", name: "Potatoes", home: "Base" },
  { id: "sausage", name: "Sausages", home: "Body" },
  { id: "lentil", name: "Lentil cakes", home: "Body" },
  { id: "oil", name: "Olive oil", home: "Fat" },
  { id: "salt", name: "Salt & pepper", home: "Flavour" },
  { id: "jar", name: "A jar, no label", home: "?", late: true },
  { id: "apple", name: "Grey apples", home: "?" },
  { id: "nsalt", name: "A salt, no taste", home: "?" },
  { id: "corn", name: "Store corn", home: "Base" },
  { id: "butter", name: "Butter pats", home: "Fat" },
  { id: "onion", name: "Garden onions", home: "Flavour" },
  { id: "ramps", name: "Wild ramps", home: "Flavour" },
];
const UNK = { jar: ["Fat", "lard"], apple: ["Base", "a root, of a kind"], nsalt: ["Flavour", "salt, of a kind"] };   // unknowns: role and name once tasted
const FIVE = ["Tam", "Dell", "Rafe", "Inés", "June"];
const STAGE = {
  1: { diners: FIVE, coals: 110, need: 5, counts: { potato: 6, sausage: 4, lentil: 2, oil: 2, salt: 8, corn: 2, butter: 6, onion: 3, ramps: 2 }, zones: null,
    card: ["Bea's foil supper", "2 potatoes, or any root", "1 sausage each (June: a lentil cake)", "a pat of the store's butter, or oil", "an onion from next door, or ramps", "salt & pepper", "fold tight, 3 folds", "coals 25 min"] },
  2: { diners: [...FIVE, "Marisol"], coals: 150, need: 6, counts: { potato: 6, sausage: 4, lentil: 3, oil: 3, salt: 8, jar: 0, corn: 0, butter: 0, onion: 0, ramps: 0 }, zones: ["Hot", "Middle", "Cool"],
    card: [null, "2 potatoes, or any root", "1 sausage each (June: a lentil cake)", null, null, "salt & pepper", "fold tight, 3 folds", "coals 25 min"] },
  3: { diners: [...FIVE, "The spare sheet"], coals: 130, need: 5, counts: { potato: 3, sausage: 3, lentil: 2, oil: 5, salt: 2, apple: 3, nsalt: 4 }, zones: ["Hot", "Middle", "Cool", "Off"],
    card: [null, "2 potatoes, or any root", "1 sausage each (June: a lentil cake)", null, null, "salt & pepper", "fold tight, 3 folds", "coals 25 min"] },
};
const TILE = { apple: ["ingredient-grey-apples"], nsalt: ["ingredient-nothing-salt"], potato: ["ingredient-potatoes"], sausage: ["ingredient-sausages"], lentil: ["ingredient-lentil-cakes"], oil: ["ingredient-olive-oil"],
  salt: ["ingredient-salt", "ingredient-pepper"], corn: ["ingredient-store-corn"], butter: ["ingredient-butter-pats"], onion: ["ingredient-garden-onions"], ramps: ["ingredient-wild-ramps"] };
const FACE = { Dell: "outline-dell", Rafe: "outline-rafe", "Inés": "outline-ines", June: "outline-june", Marisol: "outline-marisol" };
const OWN = { Base: "potato", Body: "sausage", Fat: "butter", Flavour: "salt" };
const JAR_AT = 40, TASTE_COST = 20;
// Bea's card: STAGE[n].card. null = a line in her hand that named something from the campground: blank on day 2.
const COPIED = { 0: "Bea's foil supper", 3: "a pat of the store's butter, or oil", 4: "an onion from next door, or ramps" };

const TEXT = {
  when: ["Day 1 · dusk · serves 5", "Day 2 · dusk · serves 6", "The final morning · serves whoever woke"],
  goal: ["Five foil packets before the coals go grey, averaging 2 or better.", "Six foil packets before the coals go grey, averaging 1.5 or better, each on the right part of the coals.", "Breakfast for five from what came across, and from things nobody packed."],
  steps: [["Pick something from the cooler.", "Lay it in a space: Base, Body, Fat, Flavour.", "The pencil number is what it would score: 3 the card's own, 2 a swap the card allows, 1 edible.", "Copy the card (C) while you can read it."],
    ["Fill the sheets as before; the store's things are gone.", "Each sheet's COALS button moves it: hot, middle, cool.", "Sausage: hot end or middle. Lentil cake: cool end or middle. The middle takes two.", "The number on the sheet is what it will be when it is cooked."],
    ["Fill five sheets. The sixth is one too many: fill it or leave it.", "Things nobody packed can be tasted (T): it costs coal.", "They cook backwards: colder the longer they sit. A packet with one in it goes OFF the coals.", "Everything else still wants its place on the heat."]],
  gentle: "A gentler meal: the coals last a minute longer.",
  open: ["Dusk, day 1. The cooler is full, the card is Bea's and you can read every line. Five to feed.", "Dusk. The store's things are gone from the cooler, and Marisol has come to eat with you. Six to feed from food for five.", "No sun, and the coals are lit anyway. Half the cooler is yours. The rest nobody packed. Somebody has laid out six sheets."],
  copy: "You copy Bea's card into the notebook, line for line. In your hand, it holds.",
  copied: "Your copy of the card is in the margin: the lines hers has lost are still in yours.",
  zone: "Dell rakes the coals out long: \"Hot end there, cool end there. Don't cremate June's lentils.\"",
  tastedU: (what) => `You taste it. Cold: colder in your mouth than it was in the cooler. It is ${what}. On the coals it will only get colder.`,
  spare: "A sixth sheet, laid out with the rest. Nobody says who it is for.",
  sp: {
    lead: (who) => `${who} opens ${who === "Tam" ? "yours" : "the packet"} and stops.`,
    body: "It is Bea's supper. The store's corn, the butter, the onion from next door: every line of the card, the blank ones too. Nobody cooked that. It is exactly right, and it tastes of nothing.",
    copied: "Your copy of the card is in your pocket. The packet is more exact than your copy.",
    uncopied: "They are the lines you never copied. You are reading them for the first time, in food.",
    btn: "Eat",
  },
  folded: "Dell takes the first packet and folds it tight, three folds, the way the card says.",
  jar: "June, from the bottom of the cooler: \"Whose is this?\" A jar, no label. Nobody packed it. (T: taste it, 20 s of coal.)",
  tasted: "You taste it. Lard, or something like it. It will do for a Fat, and the card would allow it.",
  marisol: "Marisol: \"I'll eat whatever's going. I've had worse at the booth.\"",
  low: "The coals are greying at the edges.",
  pickFirst: "Pick something from the cooler first.",
  untasted: "Nobody knows what it is yet. It goes in as edible, and no more.",
  end: {
    lead: (timeUp) => (timeUp ? "The coals go grey; the packets cook as they are." : "Every sheet goes onto the coals."),
    stats: (made, avg, of = 6) => `${made} of ${of} packets made, average ${avg.toFixed(2)}.`,
    t1win: (n) => `The card's own supper, the way Bea wrote it${n ? `: ${n} of your friends ate it exactly so` : ""}.`,
    t1done: "Everyone is fed, and nobody would call it Bea's.",
    t3win: "Five of you are fed on the far side of everything, and the grey things were kept off the heat.",
    t3done: "Five of you are fed. It is food, and that is all anyone says about it.",
    t3lose: (n) => `${n} of five have something they can eat. The grey things went on the coals and came off colder than they went on, frost on the foil.`,
    seat: (fed) => (fed ? "The sixth sheet is folded tight and set at the empty place. In the morning light nobody mentions it, and nobody moves it." : "The sixth sheet stays flat. You fold it and put it back in the box."),
    warm: (avg) => (avg >= 2 ? "Warmth +2." : avg >= 1 ? "Warmth +1." : "Nobody says much."),
    win: "Marisol eats with the five of you, and says it is the best thing she has had all summer.",
    done: "Everyone is fed. Dell says nothing about the card's blank lines, and neither do you.",
    share: (who) => (who.includes(",") ? `${who} share other people's packets, and pretend not to mind.` : `${who} shares someone else's packet, and pretends not to mind.`),
    thin: "Nobody eats much. The foil goes back in the box, folded flat.",
  },
};

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${PAPER};color:${NAVY};font-family:'IBM Plex Mono',ui-monospace,monospace;padding:12px;box-sizing:border-box;display:grid;grid-template-rows:auto auto 1fr auto;gap:10px;
  background-image:radial-gradient(rgba(36,52,79,.07) 1px,transparent 1.3px);background-size:5px 5px}
.${P}head{background:${NAVY};color:${PAPER};padding:8px 14px;font-weight:600;font-size:clamp(18px,3vw,26px);letter-spacing:.1em;text-shadow:2px 1px 0 ${PINK}99;border:2px solid ${PINK};outline:2px solid ${TEAL};outline-offset:-6px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.${P}head small{font-size:14px;letter-spacing:.06em;text-shadow:none;color:#ffd0e6}
.${P}say{font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.15;color:#3d2d22;border-left:5px solid ${PINK};padding:2px 10px;min-height:26px}
.${P}main{display:grid;grid-template-columns:minmax(170px,.85fr) minmax(0,2.2fr) minmax(160px,.9fr);gap:12px;align-items:start}
.${P}box{border:2px solid ${TEAL};padding:8px;box-shadow:3px 2px 0 ${PINK}66;background:${PAPER}}
.${P}box h4{margin:0 0 6px;color:${TEAL};letter-spacing:.2em;font-size:14px;text-shadow:1.5px 1px 0 ${PINK}77}
.${P}box.shake{animation:${P}shake .4s}
@keyframes ${P}shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.${P}ing{display:flex;align-items:center;gap:8px;width:100%;font:inherit;font-size:14px;background:transparent;border:0;padding:5px 4px;color:${NAVY};cursor:pointer;text-align:left}
.${P}ing:hover:not(:disabled){background:rgba(255,79,163,.12)}
.${P}ing i{width:30px;height:30px;flex:none;background:${PINK};background-image:radial-gradient(${PAPER} 1.3px,transparent 1.6px);background-size:5px 5px;mix-blend-mode:multiply;font-style:normal;display:grid;place-items:center;color:#fff;font-weight:700;font-size:14px}
.${P}ing:nth-child(even) i{background-color:${TEAL}}
.${P}ing small{display:block;font-size:12px;opacity:.8}
.${P}ing.sel{outline:3px solid ${NAVY};background:#fff}
.${P}ing:disabled{opacity:.45;cursor:default}
.${P}ing.out span{text-decoration:line-through;text-decoration-color:${PINK}}
.${P}ing[hidden]{display:none}
.${P}ing.new{animation:${P}new 1.2s 2}
@keyframes ${P}new{50%{background:#ffd0e6}}
.${P}sheets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.${P}sheet{border:2px solid ${PINK};padding:6px;position:relative;background:repeating-linear-gradient(45deg,#e7dfd6 0 3px,#f4eee6 3px 6px);box-shadow:-2px 2px 0 ${TEAL}66}
.${P}sheet>b{display:block;font-size:13px;margin-bottom:4px;letter-spacing:.1em}
.${P}sheet .sc{position:absolute;top:-11px;right:-9px;width:30px;height:30px;border-radius:50%;background:#9aa;color:#fff;display:grid;place-items:center;font-weight:700;font-size:15px;box-shadow:2px 1px 0 ${PINK}}
.${P}sheet .sc.s1{background:#c06a2a}.${P}sheet .sc.s2{background:${TEAL}}.${P}sheet .sc.s3{background:${NAVY}}
.${P}sheet.pop{animation:${P}pop .45s}
@keyframes ${P}pop{40%{transform:scale(1.04)}}
.${P}roles{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.${P}role{font:inherit;font-size:13px;min-height:46px;border:0;background:${PINK};background-image:radial-gradient(rgba(255,255,255,.35) 1.2px,transparent 1.5px);background-size:4px 4px;color:#fff;cursor:pointer;padding:3px 5px;text-align:left;position:relative;line-height:1.15;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.${P}role.empty{background:rgba(255,79,163,.14);color:${NAVY};outline:1.5px dashed ${PINK};outline-offset:-3px;text-shadow:none}
.${P}role.empty:hover{background:rgba(15,138,138,.18)}
.${P}role em{display:block;font-style:normal;font-size:12px;letter-spacing:.1em;opacity:.9}
.${P}role .pv{position:absolute;right:5px;bottom:1px;font-family:Caveat,cursive;font-size:22px;font-weight:700;color:#3a3a3c}
.${P}role .pv.p2{color:${TEAL}}.${P}role .pv.p3{color:${NAVY}}
.${P}card p{margin:0;padding:5px 2px;border-bottom:1px solid ${TEAL}66;font-family:Caveat,'Segoe Print',cursive;font-size:19px;min-height:22px;color:#4a3626}
.${P}card p.blank{background:repeating-linear-gradient(90deg,${PINK}22 0 6px,transparent 6px 10px);background-size:100% 3px;background-repeat:no-repeat;background-position:0 70%}
.${P}card small{display:block;margin-top:6px;font-size:12px;color:${TEAL}}
.${P}avg{font-size:14px;margin-top:8px;font-weight:600}
.${P}coal{border:2px solid ${TEAL};height:32px;position:relative;background:${PAPER}}
.${P}coal i{position:absolute;left:0;top:0;bottom:0;background-image:radial-gradient(${PAPER} 1.4px,transparent 1.7px),linear-gradient(90deg,${PINK},#ff9a3d);background-size:5px 5px,100% 100%;transition:width .9s linear}
.${P}coal span{position:absolute;right:8px;top:6px;font-weight:600;font-size:14px;color:${NAVY};background:${PAPER};padding:0 4px}
.${P}coal.low{animation:${P}low 1s steps(2) infinite}
.${P}coal.low i{background-image:radial-gradient(${PAPER} 1.4px,transparent 1.7px),linear-gradient(90deg,#8b8b8b,#c06a2a)}
@keyframes ${P}low{50%{border-color:${PINK}}}
.${P}bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.${P}bar button{font:600 14px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:9px 14px;cursor:pointer}
.${P}bar button:hover:not(:disabled){background:${TEAL}}
.${P}bar button:disabled{opacity:.4;cursor:default}
.${P}bar button[hidden]{display:none}
.${P}bar label{font-size:14px;display:flex;gap:6px;align-items:center}
.${P}sheet .zn{position:absolute;left:6px;bottom:-12px;font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.06em;background:${NAVY};color:${PAPER};border:1.5px solid ${PINK};padding:3px 7px;cursor:pointer;min-height:26px}
.${P}sheet .zn.Hot{background:#c0392b}.${P}sheet .zn.Middle{background:#c06a2a}.${P}sheet .zn.Cool{background:${TEAL}}.${P}sheet .zn.Off{background:#6b6b6b}
.${P}sheets.zoned{row-gap:22px;padding-bottom:12px}
.${P}sheet.spare{border-style:dashed;opacity:.92}
.${P}zkey{font-size:12px;letter-spacing:.06em;display:flex;justify-content:space-between;margin-top:3px;color:${NAVY}}
.${P}card .mine{font-family:Caveat,'Segoe Print',cursive;font-size:18px;line-height:1.15;color:#3a3a3c;background:#f6f1e2;border-left:3px solid #d58a7a;padding:4px 8px;margin-top:6px}
.${P}card .mine:empty{display:none}
.${P}spx{position:absolute;inset:0;z-index:6;background:rgba(36,52,79,.94);display:grid;place-items:center;padding:16px;box-sizing:border-box;overflow:auto}
.${P}spx>div{max-width:440px;width:100%;background:${PAPER};padding:16px 18px;box-sizing:border-box;border:2px solid #9a9a9a;box-shadow:5px 4px 0 #6b6b6b;text-align:center}
.${P}spx img{width:min(220px,60%);height:auto;filter:grayscale(1) contrast(.9);display:block;margin:0 auto 10px}
.${P}spx p{font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.2;color:#3d2d22;margin:0 0 10px;text-align:left}
.${P}spx button{font:600 15px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid #9a9a9a;padding:10px 26px;cursor:pointer;min-height:44px}
.${P}ing .tl{display:flex;flex:none}
.${P}ing .tl img{width:46px;height:46px;display:block;box-shadow:1px 1px 0 ${NAVY}55}
.${P}ing .tl img+img{margin-left:-22px}
.${P}ing.out .tl img{filter:grayscale(1);opacity:.5}
.${P}role .mini{float:right;width:30px;height:30px;margin:0 0 0 4px;box-shadow:0 0 0 1px #fff8}
.${P}sheet>b{display:flex;align-items:center;gap:6px}
.${P}sheet>b img{width:30px;height:36px;object-fit:cover;object-position:50% 20%;border:1px solid ${NAVY}}
.${P}card .cardart{display:block;width:100%;height:auto;max-width:300px;margin:0 auto}
.${P}card.hasart .lines{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.${P}card{position:relative}
.${P}rcard .yest{float:right;width:112px;margin:0 0 6px 12px;text-align:center;font-size:12px;color:${TEAL}}
.${P}rcard .yest img{display:block;width:100%;height:auto;box-shadow:2px 2px 0 ${PINK}88}
.${P}rcard .pk{width:34px;height:34px;vertical-align:middle;margin-left:6px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,231,220,.94);z-index:4;padding:16px;overflow:auto}
.${P}rcard{max-width:470px;width:100%;box-sizing:border-box;border:2px solid ${PINK};box-shadow:5px 4px 0 ${TEAL};background:${PAPER};padding:18px 22px;position:relative;
  background-image:linear-gradient(${PAPER},${PAPER}),repeating-linear-gradient(180deg,transparent 0 27px,${TEAL}44 27px 28px);background-clip:content-box,padding-box}
.${P}rcard h2{margin:0;font:700 34px 'Zilla Slab',Georgia,serif;color:${NAVY};text-shadow:3px 2px 0 ${PINK}aa,-1px -1px 0 ${TEAL}88;letter-spacing:.02em}
.${P}rcard .when{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:${TEAL};margin:2px 0 10px;border-bottom:2px dotted ${PINK};padding-bottom:6px}
.${P}rcard .goal{font-size:16px;line-height:1.4;font-weight:600;margin:0 0 10px}
.${P}rcard ol{margin:0 0 12px;padding-left:22px;font-size:14px;line-height:1.45}
.${P}rcard ol li::marker{color:${PINK};font-weight:700}
.${P}rcard .gentle{font-size:14px;color:${TEAL};margin:0 0 10px}
.${P}rcard button{font:600 15px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:10px 22px;cursor:pointer;box-shadow:3px 2px 0 ${TEAL}}
.${P}rcard button:focus-visible{outline:3px solid ${TEAL};outline-offset:3px}
@media (max-width:820px){.${P}main{grid-template-columns:1fr}.${P}sheets{grid-template-columns:repeat(2,minmax(0,1fr))}.${P}main>.${P}box:first-child{position:sticky;top:-12px;z-index:2}
  .cool{display:flex;flex-wrap:wrap;gap:2px}.${P}ing{width:auto;font-size:13px;padding:4px}.${P}ing i{width:22px;height:22px;font-size:12px}.${P}ing .tl img{width:36px;height:36px}.${P}card .cardart{max-width:220px}.${P}rcard .yest{width:84px}.${P}ing small{display:none}.${P}ing.out{display:none}.${P}role{font-size:12px;min-height:44px}.${P}say{font-size:20px}}
`;

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage], DINERS = CFG.diners, CARD = CFG.card;
    const INGR = ALL_INGR.filter((g) => g.id in CFG.counts).map((g) => ({ ...g, n: CFG.counts[g.id] }));
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const COALS_S = CFG.coals + (gentle ? 60 : 0);
    const wasCopied = stage > 1 && !!(api.shared && api.shared.get("recipe_copied", false));
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}head"><span>${["FOIL SUPPER / DAY 1", "FOIL SUPPER / DAY 2", "FOIL BREAKFAST"][stage - 1]}</span><small class="hd"></small></div>
      <div class="${P}say" aria-live="polite"></div>
      <div class="${P}main">
        <div class="${P}box cbox"><h4>COOLER</h4><div class="cool"></div></div>
        <div class="${P}sheets"></div>
        <div class="${P}box ${P}card"><h4>THE CARD</h4><div class="lines"></div><div class="mine"></div><small class="cst"></small><div class="${P}avg"></div></div>
      </div>
      <div><div class="${P}coal"><i></i><span>COALS 3:00</span></div>${CFG.zones ? `<div class="${P}zkey"><span>◂ HOT END</span><span>MIDDLE (takes two)</span><span>COOL END ▸</span></div>` : ""}
        <div class="${P}bar" style="margin-top:8px"><button type="button" class="cook">${stage === 3 ? "Open the packets" : "Onto the coals"}</button><button type="button" class="copy" ${stage === 1 ? "" : "hidden"}>Copy the card (C)</button><button type="button" class="taste" hidden>Taste the jar (T) · −20 s</button><label><input type="checkbox" class="pause"> Pause the coals</label></div></div>
      <div class="${P}intro"><div class="${P}rcard"><h2>Foil Supper</h2><div class="when"></div>
        <p class="goal"></p><ol></ol><p class="gentle" hidden></p>
        <button type="button">Light the coals</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when[stage - 1]; $(`.${P}rcard .goal`).textContent = TEXT.goal[stage - 1];
    stageTabs(api, $(`.${P}rcard>button`));
    TEXT.steps[stage - 1].forEach((t) => { const li = document.createElement("li"); li.textContent = t; $("ol").appendChild(li); });
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const art = api.art;
    chapterCard(art, ["chapter-2", "chapter-4", "chapter-6"][stage - 1], $(`.${P}rcard`));
    { const y = stage === 1 ? null : pic(art, "recipe-legible", "", "Bea's card as it read on day 1");
      if (y) { const f = document.createElement("div"); f.className = "yest"; f.append(y, document.createTextNode("the card, on day 1")); $(`.${P}rcard .goal`).before(f); }
      const pk = pic(art, "ingredient-packet", "pk", ""); if (pk) $(`.${P}rcard ol`).lastElementChild.appendChild(pk);
      const blank = pic(art, stage === 1 ? "recipe-legible" : wasCopied ? "recipe-copied" : "recipe-blank", "cardart", stage === 1 ? "Bea's card: every line legible" : "Bea's card today: the heading and every line naming the store are blank");
      if (blank) { $(".lines").before(blank); $(`.${P}card`).classList.add("hasart"); } }
    const counts = Object.fromEntries(INGR.map((i) => [i.id, i.n]));
    const packets = DINERS.map(() => ({}));
    let sel = null, coal = COALS_S, running = false, over = false, iv = 0, t = 0, copiedNow = false;
    const tasted = {};
    const zone = DINERS.map(() => (CFG.zones ? "Hot" : null));
    $(".cst").textContent = stage === 1 ? "card: not copied · diners 5" : `card: ${wasCopied ? "copied on day 1" : "not copied"} · diners ${stage === 2 ? "5 + 1" : "5, and a sheet over"}`;
    if (wasCopied) $(`.${P}card .mine`).textContent = `Your copy: ${Object.values(COPIED).join(" · ")}`;
    const said = new Set();
    const say = (s) => { $(`.${P}say`).textContent = s; };
    const beat = (k, s) => { if (said.has(k)) return; said.add(k); say(s); };

    const allowed = (role, id) => (role === "Body" && id === "lentil") || (role === "Fat" && id === "oil") || (role === "Flavour" && (id === "onion" || id === "ramps")) || (UNK[id] && tasted[id] && UNK[id][0] === role);
    const hasUnk = (pk) => ROLES.some((r) => pk[r] && UNK[pk[r]] && pk[r] !== "jar");
    // what a packet will be once cooked where it lies (stages 2 and 3: the coal zones)
    function cooked(i) {
      const pk = packets[i]; let s = score(pk);
      if (!s || !CFG.zones) return s;
      const z = zone[i];
      if (stage === 3) { if (hasUnk(pk)) return z === "Off" ? s : 0; if (z === "Off") return 0; }
      if (z === "Middle" && packets.filter((p2, k) => k < i && zone[k] === "Middle" && score(p2) > 0).length >= 2) s--;
      if (pk.Body === "sausage" && z === "Cool") s--;
      if (pk.Body === "lentil" && z === "Hot") s--;
      return Math.max(1, s);
    }
    const fit = (role, id) => (OWN[role] === id ? 3 : allowed(role, id) ? 2 : 1);
    function score(pk) {
      if (ROLES.some((r) => !pk[r])) return 0;
      const subs = ROLES.filter((r) => OWN[r] !== pk[r]);
      if (!subs.length) return 3;
      if (subs.length === 1 && allowed(subs[0], pk[subs[0]])) return 2;
      return 1;
    }

    CARD.forEach((ln) => { const p = document.createElement("p"); if (ln) p.textContent = ln; else { p.className = "blank"; p.innerHTML = "&nbsp;"; } $(".lines").appendChild(p); });

    const cool = $(".cool");
    const ingBtns = {};
    let key = 0;
    INGR.forEach((ing) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "ing";
      ing.key = ing.n > 0 || ing.late ? ++key : null;
      b.innerHTML = `<i>${ing.key || ""}</i><span></span>`;
      const ims = (TILE[ing.id] || []).map((id) => pic(art, id, "", "")).filter(Boolean);
      if (ims.length) { const tl = document.createElement("span"); tl.className = "tl"; tl.append(...ims); b.querySelector("i").after(tl); b.querySelector("i").style.cssText = `width:20px;height:20px;font-size:12px;background:${NAVY};mix-blend-mode:normal;visibility:${ing.key ? "visible" : "hidden"}`; }
      if (ing.late) b.hidden = true;
      b.addEventListener("click", () => pick(ing.id));
      cool.appendChild(b);
      ingBtns[ing.id] = b;
    });

    const sheetsEl = $(`.${P}sheets`);
    const roleBtns = [];
    DINERS.forEach((d, i) => {
      const s = document.createElement("div");
      s.className = P + "sheet";
      s.innerHTML = `<b>${d.toUpperCase()}${i === 5 && stage === 2 ? " · GUEST" : ""}</b><span class="sc">–</span><div class="${P}roles"></div>`;
      if (i === 5 && stage === 3) s.classList.add("spare");
      if (CFG.zones) {
        const zb = document.createElement("button"); zb.type = "button"; zb.className = "zn Hot"; zb.textContent = "COALS: HOT";
        zb.addEventListener("click", () => { if (!running) return; zone[i] = CFG.zones[(CFG.zones.indexOf(zone[i]) + 1) % CFG.zones.length]; beat("zone", TEXT.zone); paint(); });
        s.appendChild(zb); sheetsEl.classList.add("zoned");
      }
      { const f = pic(art, FACE[d], "", ""); if (f) s.querySelector("b").prepend(f); }
      const rr = s.querySelector(`.${P}roles`);
      roleBtns[i] = {};
      ROLES.forEach((r) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "role";
        b.addEventListener("click", () => place(i, r));
        rr.appendChild(b);
        roleBtns[i][r] = b;
      });
      sheetsEl.appendChild(s);
    });

    const nameOf = (id) => INGR.find((x) => x.id === id).name;
    function paint() {
      INGR.forEach((ing) => {
        const b = ingBtns[ing.id];
        const sp = b.querySelector("span:not(.tl)"); sp.innerHTML = "";
        const nm = document.createElement("span"); nm.textContent = ing.id === "jar" && tasted.jar ? "The jar: lard" : ing.name;
        const sm = document.createElement("small"); sm.textContent = `×${counts[ing.id]} · ${UNK[ing.id] ? (tasted[ing.id] ? UNK[ing.id][0].toLowerCase() : "unknown") : ing.home.toLowerCase()}`;
        sp.append(nm, sm);
        b.disabled = counts[ing.id] <= 0;
        b.classList.toggle("out", ing.n === 0 && !ing.late);
        b.classList.toggle("sel", sel === ing.id);
      });
      DINERS.forEach((_, i) => {
        ROLES.forEach((r) => {
          const b = roleBtns[i][r], v = packets[i][r];
          b.className = P + "role" + (v ? "" : " empty");
          b.innerHTML = `<em>${r.toUpperCase()}</em>`;
          if (v) { const mi = pic(art, (TILE[v] || [])[0], "mini", ""); if (mi) b.appendChild(mi); b.appendChild(document.createTextNode(v === "jar" && tasted.jar ? "Lard" : nameOf(v))); }
          if (!v && sel) { const pv = document.createElement("span"); const f = fit(r, sel); pv.className = "pv p" + f; pv.textContent = "= " + f; b.appendChild(pv); }
          b.setAttribute("aria-label", `${DINERS[i]} ${r}: ${v ? nameOf(v) : "empty"}${!v && sel ? `, would score ${fit(r, sel)}` : ""}`);
        });
        const sc = cooked(i);
        const scEl = sheetsEl.children[i].querySelector(".sc");
        const done = ROLES.every((r) => packets[i][r]);
        scEl.textContent = done ? sc : "–";
        scEl.className = "sc" + (done ? " s" + sc : "");
        const zb = sheetsEl.children[i].querySelector(".zn");
        if (zb) { zb.className = "zn " + zone[i]; zb.textContent = zone[i] === "Off" ? "OFF THE COALS" : "COALS: " + zone[i].toUpperCase(); zb.setAttribute("aria-label", `${DINERS[i]}: ${zone[i] === "Off" ? "off the coals" : zone[i] + " coals"}. Move it`); }
      });
      const all = packets.map((_, i) => cooked(i)).slice(0, CFG.need);
      const made = all.filter((s) => s > 0);
      const avg = all.reduce((a, b) => a + b, 0) / CFG.need;
      $(`.${P}avg`).textContent = `made ${made.length}/${CFG.need} · average ${avg.toFixed(2)}`;
      $(".hd").textContent = `${made.length}/${CFG.need} packets`;
      const tb = $(".taste");
      const next = stage === 3 ? ["apple", "nsalt"].find((u) => !tasted[u]) : "jar";
      tb.disabled = !next || tasted[next] || !running;
      tb.textContent = stage === 3 ? (next ? `Taste ${next === "apple" ? "a grey apple" : "the salt"} (T) · −${TASTE_COST} s` : "Both tasted") : tasted.jar ? "Tasted: lard" : `Taste the jar (T) · −${TASTE_COST} s`;
      $(".copy").disabled = copiedNow || !running;
      if (copiedNow) $(".copy").textContent = "Card copied";
    }

    function pick(id) {
      if (!running || counts[id] <= 0) return;
      sel = id;
      if (UNK[sel] && !tasted[sel]) say(TEXT.untasted);
      paint();
    }
    function place(i, r) {
      if (!running) return;
      const cur = packets[i][r];
      if (cur) { counts[cur]++; delete packets[i][r]; paint(); return; }
      if (!sel || counts[sel] <= 0) {
        say(TEXT.pickFirst);
        const cb = $(".cbox"); if (!api.reducedMotion) { cb.classList.remove("shake"); void cb.offsetWidth; cb.classList.add("shake"); }
        return;
      }
      packets[i][r] = sel; counts[sel]--;
      if (counts[sel] <= 0) sel = null;
      paint();
      if (ROLES.every((x) => packets[i][x])) {
        const s = sheetsEl.children[i];
        if (!api.reducedMotion) { s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); }
        beat("fold", TEXT.folded);
      }
    }
    function taste() {
      if (!running) return;
      const u = stage === 3 ? ["apple", "nsalt"].find((x) => !tasted[x]) : "jar";
      if (!u || tasted[u] || !ingBtns[u] || ingBtns[u].hidden) return;
      tasted[u] = true; coal = Math.max(1, coal - TASTE_COST); say(u === "jar" ? TEXT.tasted : TEXT.tastedU(UNK[u][1])); paintCoal(); paint();
    }
    function copyCard() {
      if (!running || stage !== 1 || copiedNow) return;
      copiedNow = true; if (api.shared) api.shared.set("recipe_copied", true);
      $(`.${P}card .mine`).textContent = `Your copy: ${CARD.slice(0, 6).join(" · ")}`; $(".cst").textContent = "card: copied · diners 5";
      say(TEXT.copy); paint();
    }

    function cook(timeUp) {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      const every = packets.map((_, i) => cooked(i)), scores = every.slice(0, CFG.need), N = CFG.need;
      const made = scores.filter((s) => s > 0).length;
      const avg = scores.reduce((a, b) => a + b, 0) / N;
      const shared = DINERS.slice(0, N).filter((_, i) => scores[i] === 0);
      const E = TEXT.end;
      const base = `${stage === 3 ? "The foil comes open." : E.lead(timeUp)} ${E.stats(made, avg, N)} ${E.warm(avg)}`;
      api.store.set("last", { avg, made, supper_shared: stage === 2 && scores[5] > 0 ? 1 : 0 });
      let outcome = "lose", tail = shared.length && made > 0 ? E.share(shared.join(", ")) : E.thin, next = "";
      if (stage === 1) {
        const threes = DINERS.filter((d, i) => i > 0 && scores[i] === 3);
        if (api.shared) api.shared.set("supper1_threes", threes);        // supper to the run: lanterns on the road
        if (made === N && avg >= 2) { outcome = "win"; tail = E.t1win(threes.length); }
        else if (made === N) { outcome = "done"; tail = E.t1done; }
        if (copiedNow) tail += " The card is copied into your notebook.";
        next = "Day 2: the store's things are gone, and the coals have a hot end.";
      } else if (stage === 2) {
        if (api.shared) api.shared.set("supper_shared", scores[5] > 0 ? 1 : 0);
        if (made === N && avg >= 1.5) { outcome = "win"; tail = E.win; }
        else if (made === N && avg >= 1) { outcome = "done"; tail = E.done; }
        next = "The final morning: breakfast, and things nobody packed.";
      } else {
        const fed = every[5] > 0;
        if (api.shared) { api.shared.set("seat_fed", fed); api.shared.set("breakfast_made", made === N); }
        if (made === N && avg >= 1.2) { outcome = "win"; tail = E.t3win; }
        else if (made === N) { outcome = "done"; tail = E.t3done; }
        else tail = E.t3lose(made);
        tail += " " + E.seat(fed);
      }
      api.store.set("losses", outcome === "lose" ? losses + 1 : 0);
      const fin = () => {
        resultCard(wrap, art, { cards: [["night-1", "chapter-5", "chapter-7"][stage - 1]], lost: outcome === "win" ? 0 : outcome === "done" ? 2 : 4, reducedMotion: api.reducedMotion });
        api.end({ outcome, text: `${base} ${tail}`, advance: outcome === "done", next });
      };
      const sp = stage === 3 ? packets.findIndex((pk, i) => every[i] > 0 && hasUnk(pk)) : -1;
      if (sp < 0) { fin(); return; }
      // the set-piece: a packet opens on Bea's supper, exactly right, and tastes of nothing
      const copied = !!(api.shared && api.shared.get("recipe_copied", false));
      const box = document.createElement("div"); box.className = P + "spx"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "A packet opens");
      const inner = document.createElement("div");
      const im = pic(art, "recipe-legible", "", "Bea's card, every line legible, in grey"); if (im) inner.appendChild(im);
      [E_SP.lead(sp === 0 ? "Tam" : "Dell"), E_SP.body, copied ? E_SP.copied : E_SP.uncopied].forEach((tx) => { const p0 = document.createElement("p"); p0.textContent = tx; inner.appendChild(p0); });
      const eb = document.createElement("button"); eb.type = "button"; eb.textContent = E_SP.btn; eb.addEventListener("click", () => { box.remove(); fin(); });
      inner.appendChild(eb); box.appendChild(inner); wrap.appendChild(box); eb.focus();
    }
    const E_SP = TEXT.sp;

    function paintCoal() {
      const m = Math.max(0, coal);
      $(`.${P}coal i`).style.width = (m / COALS_S * 100) + "%";
      $(`.${P}coal span`).textContent = `COALS ${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
      $(`.${P}coal`).classList.toggle("low", m <= 30);
    }
    function tick() {
      if (!running || $(".pause").checked) return;
      coal -= 1; t += 1;
      paintCoal();
      if (stage === 2 && t === JAR_AT) { counts.jar = 2; ingBtns.jar.hidden = false; $(".taste").hidden = false; if (!api.reducedMotion) ingBtns.jar.classList.add("new"); say(TEXT.jar); said.add("jar"); paint(); }
      if (stage === 2 && t === JAR_AT + 30) beat("marisol", TEXT.marisol);
      if (stage === 3 && t === 12) beat("spare", TEXT.spare);
      if (coal === 30) beat("low", TEXT.low);
      if (coal <= 0) cook(true);
    }
    const kd = (e) => {
      if (!running || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      const ing = INGR.find((x) => String(x.key) === k);
      if (ing && !ingBtns[ing.id].hidden) { pick(ing.id); return; }
      if (k === "t") taste();
      else if (k === "c") copyCard();
    };
    window.addEventListener("keydown", kd);
    paintCoal();
    $(".cook").addEventListener("click", () => running && cook(false));
    $(".taste").addEventListener("click", taste);
    $(".copy").addEventListener("click", copyCard);
    if (stage === 3) $(".taste").hidden = false;
    paint();
    const go = $(`.${P}rcard>button`);
    go.addEventListener("click", () => {
      $(`.${P}intro`).remove();
      running = true;
      say(wasCopied && stage === 2 ? TEXT.open[1] + " " + TEXT.copied : TEXT.open[stage - 1]);
      iv = setInterval(tick, 1000);
      paint();
      ingBtns.potato.focus();
    });
    go.focus();

    return { unmount() { over = true; running = false; clearInterval(iv); window.removeEventListener("keydown", kd); } };
  }
}

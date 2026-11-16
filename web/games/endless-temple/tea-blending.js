// The Endless Temple / Tea Blending (1D, brewing). Style: Art nouveau apothecary labels.
// DESIGN.md section 11 (Tea Blending) and section 12 (steep). One sitting at the pantry table:
// three books in turn (the requirement cards of g_tea_c3, g_tea_c5 and g_tea_c7) from one kettle of
// six pours, then the last pot (g_tea_c8: no requirement, all eight jars; its binding is the last
// push on steep). Mint is always the base; add exactly three spoons; set the steep dial; Pour.
// Actions: spoon (a jar), return a spoon, the steep dial, Taste (three sips that show the cup's
// numbers before you pour; unlocked at the second book or after a failed pour), Pour.
// Win: the three books open (the last pot then colours the ending). Lose: the kettle runs dry.
// Accepted development, phase 1 (DESIGN.md "Accepted development (2026-11-15)"):
//   Sweep: the sand book leaks onto the table; a swept pile goes into a ninth jar, gutter sand
//     (depth 2, length 0, binding -3), two spoons at most.
//   The ledger opens (L): its front pages are the jars and recipes, its last recipe is unfinished.
//     At the last pot it can be turned over: the back pages are a count of days that stops at forty.
//   The Parting Cup: seer's sprig and two spoons of gutter sand at mark 3 (depth 8, binding -5),
//     brewed as the last pot. No cup without gutter sand reaches depth 7 at binding -4.
// Art (api.art): the nine jar labels, the five cup rings, the six ledger pages, chapter headings,
// a frontispiece, glyphs, fleurons and the thread ring. Every element falls back to the old drawing.
// Phase 2 (DEEP_DIVE.md section 3, Tea Blending): the sitting is a ladder of three stages.
//   Teach: meet a depth (the sand book's card, a small kettle).
//   Test: three constraints (Hollin, then the Procession) from one kettle, with the second pour:
//     pour again over the leaves just used, for no kettle water: depth halved, binding 0.
//   Twist: brew for letting go. The set-piece: the steep is at 80, and the cup on the table already
//     holds three spoons the player did not add. This brew is made by taking things out; a cup that
//     binds loses the sitting.
// Layer links (api.shared): the drifts left on this table jam The Clasps, and a table swept between
// clasps has already put gutter sand in the ninth jar here; the last cup's taste carries into the
// living illustration. api.store keeps the stage reached.
// The source line in the how-to-play is DESIGN.md section 3 beat 10, verbatim, from
// creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md.
// Phase 3 (DEEP_DIVE.md section 3, the long puzzle and the second playthrough; rules in _ledger.js):
//   The twist is longer, by the design's own steep-80 rule ("in the temple the cup is found refilled
//   after each brew"): the last pot keeps coming back with three spoons he did not add until a cup
//   brings the steep under 80, and each cup must still hold a reader (depth 4) while letting go.
//   The long puzzle is solved here: with the three pieces in (the ledger's back pages, the scraped
//   title from The Naming, swept sand), the Parting Cup brewed at the last pot sets parting_cup.
//   Turning the ledger over and sweeping write their pieces (ledger_turned, sand_swept).
//   Second run: the ledger falls open at the back, at a page in Elaris's own hand, and can be turned
//   from the first book; the old keeper's hints are marked as his, and as binding.
//   The last pot's result shows the ending its cup leads to: the Parting Cup's, or the heavy cup's.

import { mountNotebook, sharedOf, piecesIn, PIECES, has, secondRun, endingFor, endingCard, ENDINGS } from "./_ledger.js";

const SOURCE_TEA = "It was mint herbal tea with a unique herb in it that made scholars more vividly imagine, if not envision, the book they were reading so clearly it was as if they were the narrator of the book.";

const HERBS = {
  mint: { name: "Mint", d: 1, l: 1, b: 0, col: "#8fa07a" },
  sprig: { name: "Seer's sprig", d: 3, l: 0, b: 1, col: "#5f7d4e" },
  honeymoss: { name: "Honeymoss", d: 0, l: 1, b: -2, col: "#d4a23a" },
  clove: { name: "Clove-bark", d: 0, l: 3, b: 1, col: "#7a4a2a" },
  dunevine: { name: "Dune-vine pith", d: 1, l: 2, b: 0, col: "#c98a3a" },
  storm: { name: "Stormcress", d: 2, l: 0, b: -1, col: "#5d6f86" },
  ember: { name: "Ember root", d: 2, l: 1, b: 2, col: "#a8432c" },
  lampash: { name: "Lamp-ash", d: 0, l: 2, b: -1, col: "#6b6660" },
  sand: { name: "Gutter sand", d: 2, l: 0, b: -3, col: "#b9bec6" },
};
const LABEL = { mint: "label-mint", sprig: "label-seers-sprig", honeymoss: "label-honeymoss", clove: "label-clove-bark", dunevine: "label-dune-vine-pith", storm: "label-stormcress", ember: "label-ember-root", lampash: "label-lamp-ash", sand: "label-gutter-sand" };
const SAND_MAX = 2;
// Narration written for the game (not quotations). The ledger lines are the design's hint form.
const LINES = {
  open: "Morning in the pantry. Three books wait by the reading chair, and the kettle holds six pours.",
  opened: "The page opens. The tea will hold at {hold}.",
  failed: "Below the book's mark: the page stays plain text, and sand runs from the cover.",
  ring20: "The cup leaves a faint ring on the table.",
  ring40: "The ring darkens.",
  taste: "The ledger's margin, in another keeper's hand: taste before you pour. (Taste shows the cup's numbers; three sips.)",
  lastPot: "The last pot. No book asks anything of it. Whatever it binds is the last push on the steep.",
  endLight: "Three books open, and the last cup is light. Elaris sets it down when the clock coos, and the table under it is clean.",
  endEven: "Three books open. The last cup is ordinary; it will let him go when the pot is empty.",
  endHeavy: "Three books open, and the last cup is heavy with binding. The ring on the table is dark, and one more page sounds very reasonable.",
  lose: "The kettle is dry, and “{book}” stays shut. Opened {n} of 3.",
  gentle: "The kettle has been filled to the brim this time, and the ledger is a page ahead.",
  sandStart: "Overnight the sand book has leaked a small drift onto the table.",
  sandMore: "While he read, the sand book leaked again: another drift on the table.",
  swept: "Swept. The pan goes into a ninth jar instead of out of the window: gutter sand.",
  sweptFull: "Swept. The ninth jar is full, so this panful goes out of the window.",
  noSand: "The table is clean. There is nothing to sweep.",
  turnOver: "Elaris turns the ledger over. The back pages are not recipes. They are a count of days, in the same hand.",
  lastPotBack: "The ledger's last recipe is unfinished, and its back pages stop at forty.",
  // DEEP_DIVE.md sample line, written for the game:
  day31: "Day thirty-one. I meant to turn at the cairn. I did not turn. I cannot say why.",
  endParting: "The Parting Cup: seer's sprig and what the book gave back, depth {d} and binding {b}. It is the lightest deep cup the pantry can make, the only one that lets a reader close a book that is still going. Elaris sets it by the sand book and, for now, only looks at it.",
  endSandLeft: " {n} drift{s} of sand still lie{v} on the table.",
  // phase 2
  second: "The margin again: leaves can be poured over twice. A second pour (X) costs no kettle water: half the depth, and none of the binding.",
  secondThin: "The second pour is too thin for this card.",
  dryLeaves: "The kettle is dry, but the leaves are still in the pot: one second pour (X) is left.",
  twistOpen: "The last pot. The ring under the cup is dark, and three spoons are in it that he did not add. This brew is made by taking things out.",
  twistAsk: "A cup for letting go: binding 0 or less, and deep enough to hold him at the page (depth 4). While the ring under it stays stained, the cup comes back filled.",
  // phase 3
  refilled: "He looks down and the cup is full again, three spoons in it he did not add. The ring under it is still stained.",
  refillLight: "A cup that lets go. The ring is a little lighter, and not light enough.",
  refillBound: "That cup bound him tighter. The ring darkens.",
  ringClear: "The ring under the cup lightens, and this time the cup stays empty.",
  dryHeavy: "The kettle is dry, and the cup is full again anyway.",
  partingSolved: " The three pieces are in: the day count at the back of the ledger, the title he scraped away, and the sand he swept. Elaris knows what this cup is for.",
  partingMissing: " He does not yet know what it is for: {missing} not in the notebook.",
  secondOpen: "The ledger falls open at the back this morning, at a page in his own hand. The front pages are the old keeper's, and every recipe in them binds.",
  secondHint: "The old keeper's hint (his recipes bind): ",
  endBound: " It is not a cup for letting go: the three spoons he did not add are still doing their work.",
  linkJar: "Because you swept the table between clasps, the ninth jar already holds {n} of gutter sand.",
  stop1: "The sand book is open on the reading table, and the kettle is still warm. Two more books wait by the chair.",
  stop2: "Three books open from one kettle. The last pot is still to brew, and the ring under the cup has begun to set.",
};
const STAGE_NAMES = ["Teach: meet a depth", "Test: three constraints", "Twist: brew for letting go"];
const PRELOAD = ["ember", "ember", "clove"];   // the three spoons the player did not add
const REFILLS = [["ember", "clove", "sprig"], ["clove", "clove", "ember"], ["ember", "ember", "dunevine"]];   // and each time the cup comes back
const REFILL_AT = 80;   // DESIGN.md section 12: at steep 80 the cup is found refilled after each brew
// The ledger's pages (art/documents). The captions repeat what the page says, for small screens.
const LEDGER_FRONT = [
  { art: "ledger-front-1-jars", cap: "Jars kept in the pantry: each herb with its depth, length and binding." },
  { art: "ledger-front-2-recipes", cap: "What opens a book: sprig and honeymoss for depth 3; sprig, sprig, clove for a long sand reading. And a note: for long sand, clove… and something from the sand itself." },
  { art: "ledger-front-3-unfinished", cap: "The last recipe is unfinished: “For leaving a book that is still going: sprig, and what the book gives back”." },
];
const LEDGER_BACK = [
  { art: "ledger-back-1-days", cap: "The back pages: a count of days in fives. Five, ten, fifteen, twenty." },
  { art: "ledger-back-2-thirty-one", cap: "“Day thirty-one. I meant to turn at the cairn. I did not turn. I cannot say why.”" },
  { art: "ledger-back-3-forty", cap: "The count stops at forty. Pinned over it, a slip from a journal: “Day forty. The leaves hold. The track goes on.” Under it, in the ledger's hand: “I did not turn.”" },
];
// the second run's document: a last leaf in Elaris's own hand (art/documents/ledger-back-4-elaris)
const LEDGER_ELARIS = { art: "ledger-back-4-elaris", cap: "A last leaf, in an upright hand that is his own: “Kept at the back, for the next one. What it gives back is the sand I swept. Sprig, gutter sand, gutter sand. Mark 3. The front pages bind. Every recipe in them keeps a reader in. Read them as his. I looked away, and did not look back.”" };
const CHAPTER_OF = { g_tea_c3: "heading-c3", g_tea_c5: "heading-c5", g_tea_c7: "heading-c7", g_tea_c8: "heading-c8" };
const BOOKS = [
  { scene: "g_tea_c3", book: "The sand book, again", req: { dmin: 5, lmin: 4 }, jars: ["sprig", "honeymoss", "clove"],
    note: "A long reading of the sand sea.",
    ledger: ["For a long sand reading: clove-bark, for the length of it…", "Clove-bark, and the seer's sprig… more than once?", "Sprig, sprig, clove-bark. Mark 3."] },
  { scene: "g_tea_c5", book: "The Weather-Clerk of Hollin", req: { dmin: 5, bmax: 1 }, jars: ["sprig", "honeymoss", "clove", "dunevine"],
    note: "A book about a binding.",
    ledger: ["A book about a binding wants something to loosen the cup: honeymoss…", "Honeymoss, and a little of the sand itself (dune-vine)…", "Sprig, dune-vine, honeymoss. Mark 3."] },
  { scene: "g_tea_c7", book: "The Long Procession", req: { dmin: 6, lmin: 6, bmax: 2 }, jars: ["sprig", "honeymoss", "clove", "dunevine", "storm", "ember"],
    note: "A long road, walked by masked pilgrims.",
    ledger: ["A long road: dune-vine, and let the kettle sit a while…", "Dune-vine twice, and the sprig for depth…", "Sprig, dune-vine, dune-vine. Mark 4."] },
];
const LAST = { scene: "g_tea_c8", book: "The last pot", req: { dmin: 4, bmax: 0 }, jars: Object.keys(HERBS).filter((k) => k !== "mint" && k !== "sand"), note: LINES.lastPot,
  ledger: ["No recipe. The binding is yours to choose. (The ledger has more pages: open it.)"],
  ledgerBack: ["“…sprig, and what the book gives back.” What does a sand book give back to the table?", "Sprig, and the swept sand, twice over. Leave the dial where it rests.", "Sprig, gutter sand, gutter sand. Mark 3."] };
// The Parting Cup: deep and unbinding at once. Only gutter sand reaches it.
const isParting = (spoons, r) => spoons.includes("sprig") && spoons.includes("sand") && r.d >= 7 && r.b <= -4;
const DIAL = { 1: [0.5, 0], 2: [0.75, 0], 3: [1, 0], 4: [1, 1], 5: [1, 2] };
const DIAL_NOTE = { 1: "depth halved", 2: "depth ×¾", 3: "neutral", 4: "+1 length and binding", 5: "+2 length and binding" };

function brew(spoons, mark) {
  let d = HERBS.mint.d, l = HERBS.mint.l, b = HERBS.mint.b;
  for (const s of spoons) { d += HERBS[s].d; l += HERBS[s].l; b += HERBS[s].b; }
  const [f, add] = DIAL[mark];
  return { d: Math.floor(d * f), l: l + add, b: b + add };
}
function meets(r, q) {
  return (q.dmin == null || r.d >= q.dmin) && (q.lmin == null || r.l >= q.lmin) && (q.bmax == null || r.b <= q.bmax);
}
function reqText(q) {
  const p = [];
  if (q.dmin != null) p.push(`Depth ${q.dmin} or more`);
  if (q.lmin != null) p.push(`length ${q.lmin} or more`);
  if (q.bmax != null) p.push(`binding ${q.bmax} or less`);
  return p.length ? p.join("; ") : "Nothing. Choose the binding.";
}
// a label's three marks: filled bars for plus, open rings for minus (colour is never the only carrier)
function marksSvg(h) {
  const row = (lab, v, y) => {
    let s = `<text x="2" y="${y + 8}" font-size="11" font-weight="600" fill="#3a2a1c">${lab}</text>`;
    if (v === 0) s += `<line x1="16" y1="${y + 4}" x2="24" y2="${y + 4}" stroke="#3a2a1c" stroke-width="1.5"/>`;
    for (let i = 0; i < Math.abs(v); i++) {
      s += v > 0 ? `<rect x="${16 + i * 10}" y="${y}" width="8" height="8" fill="#3a2a1c"/>`
        : `<circle cx="${20 + i * 10}" cy="${y + 4}" r="3.6" fill="none" stroke="#a8432c" stroke-width="1.8"/>`;
    }
    return s;
  };
  return `<svg viewBox="0 0 48 38" width="100%" aria-hidden="true">${row("D", h.d, 1)}${row("L", h.l, 14)}${row("B", h.b, 27)}</svg>`;
}

export default {
  mount(root, api) {
    const P = "endless-temple-tea-blending-";
    const pal = { honey: "#d4a23a", sage: "#8fa07a", walnut: "#5a3d27", sepia: "#3a2a1c", cream: "#f6eedb", ochre: "#c98a3a", red: "#a8432c", green: "#3f6a32" };
    const rm = api.reducedMotion;
    const losses = api.store.get("lossStreak", 0);
    const gentle = losses >= 2;
    const STAGE_POURS = gentle ? [4, 6, 5] : [3, 4, 4];
    let POURS = STAGE_POURS[0];
    const shared = sharedOf(api);
    const second = secondRun(shared);   // read once: a run finished before this sitting began
    const ledgerBack = second ? [...LEDGER_BACK, LEDGER_ELARIS] : LEDGER_BACK;
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    let stage = 0, leaves = null, secondOn = false, linkNote = "";
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:#e7dcc0;color:${pal.sepia};font-family:'EB Garamond',Georgia,serif;font-size:16px;
      background-image:radial-gradient(rgba(90,61,39,.08) 1px,transparent 1.3px),radial-gradient(rgba(255,255,255,.35) 1px,transparent 1.3px);background-size:6px 6px,9px 9px}
    .${P}frame{position:relative;min-height:100%;box-sizing:border-box;padding:12px 16px 120px;max-width:1180px;margin:0 auto}
    .${P}vine{position:absolute;inset:6px;pointer-events:none;width:calc(100% - 12px);height:calc(100% - 12px)}
    .${P}head{position:sticky;top:0;z-index:3;text-align:center;background:linear-gradient(#e7dcc0 93%,rgba(231,220,192,0));padding:4px 0 12px}
    .${P}head h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,32px);margin:0;letter-spacing:.04em}
    .${P}strip{display:inline-flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;align-items:center;margin-top:4px;padding:5px 16px;border:1.5px solid ${pal.walnut};border-radius:20px;background:${pal.cream};font-size:16px}
    .${P}strip i{font-style:italic}
    .${P}strip b{font-weight:600}
    .${P}books{display:inline-flex;gap:4px}
    .${P}bk{width:16px;height:20px;border:1.5px solid ${pal.walnut};border-radius:2px 4px 4px 2px;background:transparent;transition:background .4s}
    .${P}bk.${P}open{background:${pal.honey}}
    .${P}bk.${P}now{box-shadow:0 0 0 2px ${pal.honey}}
    .${P}beat{margin:6px auto 0;max-width:62ch;font-style:italic;font-size:16px;min-height:1.3em}
    .${P}grid{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,.9fr);gap:18px;margin-top:8px;align-items:start}
    @media (max-width:860px){.${P}grid{grid-template-columns:1fr}}
    .${P}panel{background:${pal.cream};border:1.5px solid ${pal.walnut};outline:1px solid ${pal.honey};outline-offset:-6px;border-radius:44px 44px 6px 6px;padding:22px 14px 14px;position:relative}
    .${P}panel h3{margin:0 0 8px;text-align:center;font-variant:small-caps;letter-spacing:.16em;font-weight:600;font-size:15px;color:${pal.walnut}}
    .${P}jars{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px 8px}
    .${P}jar{font:inherit;color:inherit;cursor:pointer;background:transparent;border:0;padding:0;display:flex;flex-direction:column;align-items:center;transition:transform .15s}
    .${P}jar:hover:not(:disabled),.${P}jar:focus-visible{transform:translateY(-4px);outline:none}
    .${P}jar:disabled{opacity:.45;cursor:not-allowed}
    .${P}jar.${P}new .${P}glass{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}lid{width:46%;height:9px;background:${pal.walnut};border-radius:3px 3px 0 0}
    .${P}glass{width:88%;border:1.5px solid ${pal.sepia};border-radius:6px 6px 14px 14px;background:linear-gradient(#f6f1e2,#e2e6d6);padding:6px 4px 8px;position:relative;transition:box-shadow .15s}
    .${P}jar:hover:not(:disabled) .${P}glass,.${P}jar:focus-visible .${P}glass{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}lab{background:#fbf6e8;border:1px solid ${pal.walnut};border-radius:18px 18px 3px 3px;padding:4px 3px 0;text-align:center}
    .${P}lab b{display:block;font-variant:small-caps;font-size:14px;letter-spacing:.03em;line-height:1.05;min-height:2.1em}
    .${P}fleck{height:10px;margin-top:4px;border-radius:0 0 8px 8px}
    .${P}key{font-size:14px;margin:10px 4px 0;line-height:1.35;display:flex;gap:8px;align-items:center}
    .${P}key img{width:44px;flex:none;border-radius:4px}
    .${P}jar img.${P}lbl{display:block;width:100%;height:auto;border-radius:6px 6px 12px 12px;box-shadow:0 2px 5px rgba(58,42,28,.35);transition:box-shadow .15s}
    .${P}jar:hover:not(:disabled) img.${P}lbl,.${P}jar:focus-visible img.${P}lbl{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}jar.${P}new img.${P}lbl{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}cap{display:block;text-align:center;font-size:14px;line-height:1.15;margin-top:4px}
    .${P}cap b{display:block;font-variant:small-caps;letter-spacing:.03em}
    .${P}cap i{font-style:normal;font-size:13px;white-space:nowrap}
    .${P}cap em{font-style:italic;font-size:13px;display:block}
    .${P}chap{display:block;width:100%;height:auto;border-radius:3px;margin:0 0 8px}
    .${P}fleur{display:block;width:min(300px,70%);height:auto;margin:2px auto 0;mix-blend-mode:multiply}
    .${P}piles{display:flex;gap:6px;align-items:flex-end;min-height:22px;margin:2px 0 6px}
    .${P}pile{width:30px;height:14px;border-radius:50% 50% 0 0/100% 100% 0 0;background:radial-gradient(circle at 40% 90%,#e6dcc0,#b9a877);border:1px solid ${pal.walnut};border-bottom:0}
    .${P}mini{font:inherit;font-variant:small-caps;letter-spacing:.08em;font-size:15px;min-height:40px;padding:4px 12px 4px 6px;border-radius:22px;border:1.5px solid ${pal.sepia};background:${pal.cream};color:${pal.sepia};cursor:pointer;display:inline-flex;align-items:center;gap:6px}
    .${P}mini img{width:30px;height:30px}
    .${P}mini:hover:not(:disabled),.${P}mini:focus-visible{outline:2px solid ${pal.honey};outline-offset:2px}
    .${P}mini:disabled{opacity:.45;cursor:not-allowed}
    .${P}book{position:absolute;inset:0;z-index:6;background:rgba(34,23,14,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:10px 12px;box-sizing:border-box;overflow:auto}
    .${P}book img.${P}pg{max-height:min(62vh,640px);max-width:100%;width:auto;height:auto;box-shadow:0 10px 30px rgba(0,0,0,.6);border-radius:2px;background:#d9c9a0}
    .${P}book .${P}pgfall{width:min(420px,100%);min-height:200px;background:#e9dcb8;border:1px solid ${pal.walnut};padding:20px;box-sizing:border-box;font-style:italic;font-size:18px}
    .${P}book p{margin:0;max-width:60ch;color:${pal.cream};font-size:16px;line-height:1.35;text-align:center}
    .${P}book small{color:#e7d6a8;font-variant:small-caps;letter-spacing:.14em;font-size:14px}
    .${P}bknav{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
    .${P}endc{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:rgba(34,23,14,.86);padding:16px 16px 150px;box-sizing:border-box;overflow:auto}
    .${P}endc figure{margin:0;max-width:420px;text-align:center;color:${pal.cream}}
    .${P}endc img{width:min(300px,70vw);height:auto;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,.6)}
    .${P}endc figcaption{font-family:'IM Fell English',Georgia,serif;font-size:22px;margin-top:10px}
    .${P}label img.${P}front{display:block;height:150px;width:auto;margin:0 auto 6px;border-radius:2px;box-shadow:0 3px 10px rgba(58,42,28,.4)}
    .${P}cupwrap{display:flex;flex-direction:column;align-items:center;gap:10px}
    .${P}cupwrap svg{width:100%;max-width:300px}
    .${P}slots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .${P}slot{font:inherit;min-width:96px;min-height:42px;border:1.5px dashed ${pal.walnut};border-radius:20px;background:#fbf6e8;color:inherit;cursor:pointer;font-size:15px;padding:4px 10px}
    .${P}slot.${P}full{border-style:solid;background:#f1e2b8}
    .${P}slot.${P}full:hover,.${P}slot.${P}full:focus-visible{background:#f7d4c4;outline:none;text-decoration:line-through}
    .${P}dial{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap}
    .${P}dial span{font-variant:small-caps;letter-spacing:.1em;font-size:15px;margin-right:4px}
    .${P}mk{font:inherit;width:42px;height:42px;border-radius:50%;border:1.5px solid ${pal.walnut};background:#fbf6e8;color:inherit;cursor:pointer;font-weight:600;font-size:16px}
    .${P}mk:hover,.${P}mk:focus-visible{box-shadow:0 0 0 3px rgba(212,162,58,.5);outline:none}
    .${P}mk[aria-pressed=true]{background:${pal.honey};color:#2a1a0c;border-color:${pal.sepia}}
    .${P}dialnote{font-size:15px;font-style:italic;min-height:1.3em}
    .${P}acts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
    .${P}btn{font:inherit;font-variant:small-caps;letter-spacing:.12em;font-size:18px;padding:8px 24px;border-radius:24px;border:2px solid ${pal.sepia};background:${pal.walnut};color:${pal.cream};cursor:pointer}
    .${P}btn:hover:not(:disabled),.${P}btn:focus-visible{background:#7a5333;outline:2px solid ${pal.honey};outline-offset:2px}
    .${P}btn.${P}alt{background:${pal.cream};color:${pal.sepia}}
    .${P}btn:disabled{opacity:.4;cursor:not-allowed}
    .${P}btn[hidden]{display:none}
    .${P}card{background:#fbf6e8;border:1px solid ${pal.walnut};padding:10px 12px;margin-bottom:12px;border-radius:3px;font-size:16px;line-height:1.35}
    .${P}card small{display:block;font-variant:small-caps;letter-spacing:.12em;color:${pal.walnut};font-size:14px}
    .${P}card strong{font-size:18px;font-weight:600}
    .${P}card.${P}shake{animation:${P}shake .45s}
    @keyframes ${P}shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    .${P}stamp{display:inline-block;margin-top:4px;border:2px solid ${pal.green};color:${pal.green};font-variant:small-caps;letter-spacing:.2em;padding:0 8px;transform:rotate(-4deg);font-weight:600}
    .${P}ledger{font-style:italic;background:#f4ead0;border-left:3px solid ${pal.honey}}
    .${P}ok{color:${pal.green};font-weight:600}.${P}no{color:${pal.red};font-weight:600}
    .${P}kettle{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .${P}drop{width:16px;height:21px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;border:1.5px solid ${pal.walnut};background:${pal.sage};transition:background .5s,transform .5s}
    .${P}drop.${P}used{background:transparent;transform:scale(.85)}
    .${P}drop.${P}low{background:${pal.red}}
    .${P}taste{display:flex;gap:4px;align-items:center}
    .${P}taste i{width:10px;height:10px;border-radius:50%;border:1.5px solid ${pal.walnut};background:${pal.sage}}
    .${P}taste i.${P}used{background:transparent}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(58,42,28,.6);z-index:5;padding:16px;overflow:auto}
    .${P}label{position:relative;background:${pal.cream};max-width:420px;padding:34px 30px 24px;border-radius:120px 120px 10px 10px;border:2px solid ${pal.walnut};outline:1.5px solid ${pal.honey};outline-offset:-9px;text-align:center}
    .${P}label svg.${P}whip{position:absolute;left:0;top:0;width:100%;height:70px;pointer-events:none}
    .${P}label h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:6px 0 4px;font-size:30px}
    .${P}label q{display:block;font-style:italic;font-size:15px;margin:0 0 10px;quotes:none;line-height:1.35}
    .${P}label .${P}goal{margin:0 0 10px;font-size:17px;border-top:1px solid ${pal.honey};border-bottom:1px solid ${pal.honey};padding:8px 0}
    .${P}label table{margin:0 auto 14px;border-collapse:collapse;font-size:16px;text-align:left}
    .${P}label td{padding:3px 6px;vertical-align:top}
    .${P}label td:first-child{font-variant:small-caps;letter-spacing:.08em;font-weight:600;white-space:nowrap;text-align:right;color:${pal.walnut}}
    .${P}steam{position:absolute;pointer-events:none}
    .${P}slot.${P}pre{border-color:${pal.red};background:#f3d6c6;font-style:italic}
    .${P}link{font-size:15px;font-style:italic;border:1px dashed ${pal.walnut};border-radius:6px;padding:3px 10px;margin:6px auto 0;max-width:62ch;background:${pal.cream}}
    .${P}link[hidden]{display:none}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 0 12px}
    .${P}start button{font:inherit;font-size:14px;color:${pal.sepia};background:transparent;border:1.5px solid ${pal.walnut};border-radius:18px;padding:5px 10px;cursor:pointer;min-height:38px}
    .${P}start button[aria-pressed=true]{background:${pal.walnut};color:${pal.cream}}
    @media (prefers-reduced-motion:reduce){.${P}card.${P}shake{animation:none}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}frame" tabindex="-1" style="outline:none">
        <svg class="${P}vine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 98 C2 60 6 40 3 20 C1 10 6 3 16 2 M98 98 C98 60 94 40 97 20 C99 10 94 3 84 2 M16 2 C35 6 65 -2 84 2"
            fill="none" stroke="${pal.walnut}" stroke-width=".35" vector-effect="non-scaling-stroke"/>
          <path d="M4 96 C6 70 2 50 6 30 C9 16 4 8 20 5 M96 96 C94 70 98 50 94 30 C91 16 96 8 80 5"
            fill="none" stroke="${pal.honey}" stroke-width=".25" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="${P}head"><h2>The Pantry Table</h2>${art.has("fleuron-cup") ? `<img class="${P}fleur" src="${art.url("fleuron-cup")}" alt="">` : ""}
          <div class="${P}strip"><span class="${P}books" aria-label="Books opened"></span><i class="${P}bookname"></i><span>Asks: <b class="${P}req"></b></span></div></div>
        <div style="text-align:center;padding:0 0 8px"><p class="${P}beat" aria-live="polite"></p><p class="${P}link" hidden></p></div>
        <div class="${P}grid">
          <section class="${P}panel" aria-label="Jars"><h3>The Jars</h3><div class="${P}jars"></div>
            <p class="${P}key">${art.has("label-mint") ? `<img src="${art.url("label-mint")}" alt="">` : ""}<span>Each label: <b>D</b>epth, <b>L</b>ength, <b>B</b>inding. A bar adds one; a ring takes one away. Mint (D1 L1 B0) is already in the cup.</span></p></section>
          <section class="${P}panel ${P}cupwrap" aria-label="The cup">
            <h3>The Cup</h3>
            <svg viewBox="0 0 240 190" aria-hidden="true"><g class="${P}cupsvg"></g></svg>
            <div class="${P}slots"></div>
            <div class="${P}dial" role="group" aria-label="Steep dial"><span>Steep</span></div>
            <div class="${P}dialnote"></div>
            <div class="${P}acts"><button type="button" class="${P}btn ${P}alt ${P}tastebtn" hidden>Taste (A)</button><button type="button" class="${P}btn ${P}alt ${P}secondbtn" hidden>Second pour (X)</button><button type="button" class="${P}btn ${P}pour">Pour</button></div>
          </section>
          <section class="${P}panel" aria-label="Cards">
            <h3>The Book's Card</h3>
            <img class="${P}chap" alt="" hidden>
            <div class="${P}card ${P}reqcard"><small>Requirement</small><strong class="${P}req2"></strong><div class="${P}note" style="font-style:italic;margin-top:2px"></div></div>
            <div class="${P}card ${P}ledger"><small>The pantry ledger</small><span class="${P}led"></span>
              <div style="margin-top:6px"><button type="button" class="${P}mini ${P}openled">${art.has("glyph-read") ? `<img src="${art.url("glyph-read")}" alt="">` : ""}Open the ledger (L)</button></div></div>
            <div class="${P}card ${P}sandcard"><small>Sand on the table</small><div class="${P}piles" aria-live="polite"></div>
              <button type="button" class="${P}mini ${P}sweep">${art.has("glyph-sweep") ? `<img src="${art.url("glyph-sweep")}" alt="">` : ""}Sweep (S)</button></div>
            <div class="${P}card"><small>The kettle</small><div class="${P}kettle"></div></div>
            <div class="${P}card ${P}tastecard" hidden><small>Tastes left</small><div class="${P}taste"></div></div>
            <div class="${P}card ${P}result" aria-live="polite"><small>The pour</small><span class="${P}res">Nothing poured yet.</span></div>
          </section>
        </div>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let bookI = 0, spoons = [], mark = 3, poursLeft = POURS, failsHere = 0, steep = 0, over = false, busy = false;
    let backLooks = 0;
    let tastes = 3, tasteOn = false, tasted = null, lastPot = false, pourFlash = null;
    let piles = 1, jarSand = Math.max(0, Math.min(SAND_MAX, shared.get("jar_sand", 0) | 0)), ledgerTurned = false, ledgerSeen = false;
    if (jarSand > 0) linkNote = LINES.linkJar.replace("{n}", jarSand === 1 ? "one spoon" : "two spoons");
    let preload = 0;   // how many of the spoons in the cup the player did not add
    const sandInCup = () => spoons.filter((x) => x === "sand").length;
    const jarsNow = () => (jarSand + sandInCup() > 0 ? [...curBook().jars, "sand"] : curBook().jars);
    const opened = [];
    const curBook = () => (lastPot ? LAST : BOOKS[bookI]);

    // cup drawing: the steep ring around the cup shows the dial; the stain ring under it shows steep
    const cupG = q("cupsvg");
    function drawCup(fill, color) {
      const ring = Math.min(1, steep / 60);
      const marks = [1, 2, 3, 4, 5].map((m, i) => {
        const a = Math.PI * (1.1 + i * 0.2);
        const x = 120 + 96 * Math.cos(a), y = 112 + 96 * Math.sin(a);
        const on = m === mark;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 7 : 4}" fill="${on ? pal.honey : pal.walnut}"/>`;
      }).join("");
      const a = Math.PI * (1.1 + (mark - 1) * 0.2);
      const flecks = spoons.map((s, i) => `<path d="M${102 + i * 13} ${108 - (i % 2) * 4} q4 -6 8 0" stroke="${HERBS[s].col}" stroke-width="3.5" fill="none"/>`).join("");
      const steamOn = pourFlash && pourFlash.ok && performance.now() < pourFlash.until;
      const ringId = "cup-ring-" + (steep < 20 ? "1-clear" : steep < 40 ? "2-faint" : steep < 60 ? "3-set" : steep < 80 ? "4-wide" : "5-stained");
      if (art.has(ringId)) {
        // the cup from above, on the pantry table: the art carries the ring the steep has left
        const dots = spoons.map((s, i) => `<circle cx="${108 + i * 12}" cy="${104 + (i % 2) * 8}" r="5.5" fill="${HERBS[s].col}" stroke="#2a1a0c" stroke-width="1"/>`).join("");
        cupG.innerHTML = `
        <path d="M24 112 A96 96 0 0 1 216 112" fill="none" stroke="${pal.walnut}" stroke-width="1" stroke-dasharray="2 4"/>
        <path d="M120 112 L${(120 + 88 * Math.cos(a)).toFixed(1)} ${(112 + 88 * Math.sin(a)).toFixed(1)}" stroke="${pal.honey}" stroke-width="2" stroke-dasharray="3 3"/>
        <clipPath id="${P}cc"><rect x="42" y="30" width="156" height="156" rx="14"/></clipPath>
        <image href="${art.url(ringId)}" x="42" y="30" width="156" height="156" clip-path="url(#${P}cc)"/>
        <rect x="42" y="30" width="156" height="156" rx="14" fill="none" stroke="${pal.walnut}" stroke-width="1.5"/>
        ${steamOn ? `<g stroke="#f6eedb" fill="none" stroke-width="2" opacity=".8"><path d="M105 86 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M122 84 q8 -14 0 -28 q-8 -12 0 -26"/><path d="M138 86 q-6 -10 0 -20"/></g>` : ""}
        ${pourFlash && !pourFlash.ok && performance.now() < pourFlash.until ? `<g fill="#e6dcc0">${Array.from({ length: 16 }, (_, k) => `<circle cx="${60 + (k * 37) % 120}" cy="${160 + (k * 13) % 20}" r="1.8"/>`).join("")}</g>` : ""}
        ${dots}${marks}`;
        return;
      }
      cupG.innerHTML = `
        <path d="M24 112 A96 96 0 0 1 216 112" fill="none" stroke="${pal.walnut}" stroke-width="1" stroke-dasharray="2 4"/>
        <path d="M120 112 L${(120 + 80 * Math.cos(a)).toFixed(1)} ${(112 + 80 * Math.sin(a)).toFixed(1)}" stroke="${pal.honey}" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M44 150 C30 120 60 92 80 104 M196 150 C210 120 180 92 160 104" fill="none" stroke="${pal.honey}" stroke-width="1.6"/>
        ${steep >= 20 ? `<ellipse cx="120" cy="164" rx="${66 + ring * 6}" ry="${16 + ring * 2}" fill="none" stroke="#8a6230" stroke-opacity="${0.25 + ring * 0.5}" stroke-width="${1 + ring * 6}"/>` : ""}
        <ellipse cx="120" cy="160" rx="62" ry="13" fill="#fbf6e8" stroke="${pal.walnut}"/>
        <path d="M78 108 L86 154 Q120 166 154 154 L162 108 Z" fill="#fbf6e8" stroke="${pal.sepia}" stroke-width="1.5"/>
        <path d="M162 116 q22 4 10 24 q-6 6 -14 4" fill="none" stroke="${pal.sepia}" stroke-width="1.5"/>
        <ellipse cx="120" cy="108" rx="42" ry="9" fill="${color}" fill-opacity="${0.35 + 0.6 * fill}" stroke="${pal.sepia}" stroke-width="1.2"/>
        ${steamOn ? `<g stroke="${pal.walnut}" fill="none" stroke-width="1.6" opacity=".7"><path d="M105 96 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M122 94 q8 -14 0 -28 q-8 -12 0 -26"/><path d="M138 96 q-6 -10 0 -20"/></g>` : ""}
        ${pourFlash && !pourFlash.ok && performance.now() < pourFlash.until ? `<g fill="${pal.ochre}">${Array.from({ length: 16 }, (_, k) => `<circle cx="${80 + (k * 37) % 80}" cy="${170 + (k * 13) % 14}" r="1.6"/>`).join("")}</g>` : ""}
        ${flecks}${marks}`;
    }

    const jarsBox = q("jars");
    let prevJars = [];
    function buildJars() {
      jarsBox.innerHTML = "";
      const list = jarsNow();
      const sgn = (v) => (v < 0 ? "\u2212" + -v : v);
      list.forEach((id, k) => {
        const h = HERBS[id];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "jar" + (prevJars.length && !prevJars.includes(id) ? " " + P + "new" : "");
        b.dataset.herb = id;
        b.setAttribute("aria-label", `${h.name}: depth ${h.d}, length ${h.l}, binding ${h.b}. Add a spoon.`);
        const key = "QWERTYUIO"[k] || "";
        if (art.has(LABEL[id])) {
          b.innerHTML = `<img class="${P}lbl" src="${art.url(LABEL[id])}" alt="" draggable="false">
            <span class="${P}cap"><b>${h.name}</b><i>D${h.d} · L${h.l} · B${sgn(h.b)}</i>${id === "sand" ? `<em class="${P}sandleft"></em>` : ""}</span>`;
        } else {
          b.innerHTML = `<div class="${P}lid"></div><div class="${P}glass"><div class="${P}lab"><b>${h.name}</b>${marksSvg(h)}</div>
          <div class="${P}fleck" style="background:repeating-linear-gradient(110deg,${h.col} 0 3px,transparent 3px 7px)"></div></div>${id === "sand" ? `<span class="${P}cap"><em class="${P}sandleft"></em></span>` : ""}`;
        }
        b.title = key ? `${h.name} (${key})` : h.name;
        b.addEventListener("click", () => addSpoon(id));
        b.addEventListener("mousedown", (e) => e.preventDefault());   // keep keyboard focus where it was, so Enter still pours
        jarsBox.appendChild(b);
      });
      prevJars = list.slice();
    }
    function addSpoon(id) {
      if (over || busy || spoons.length >= 3) return;
      if (id === "sand") { if (jarSand <= 0) return; jarSand--; }
      spoons.push(id); tasted = null; update();
    }
    function takeSpoon(i) {
      if (over || busy || i < 0 || i >= spoons.length) return;
      if (spoons[i] === "sand") jarSand++;
      spoons.splice(i, 1); tasted = null; if (i < preload) preload--; update();
    }
    function sweep() {
      if (over || busy) return;
      if (piles <= 0) { beat(LINES.noSand); return; }
      piles--;
      const had = jarSand + sandInCup() > 0;
      if (jarSand + sandInCup() < SAND_MAX) { jarSand++; beat(LINES.swept); shared.set("sand_swept", true); } else beat(LINES.sweptFull);
      notebook.refresh();
      if (!had) buildJars();
      update();
    }
    const slotsBox = q("slots");
    function drawSlots() {
      slotsBox.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const s = spoons[i];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "slot" + (s ? " " + P + "full" : "") + (s && i < preload ? " " + P + "pre" : "");
        b.textContent = s ? HERBS[s].name + (i < preload ? " (not yours)" : "") : `spoon ${i + 1}`;
        b.setAttribute("aria-label", s ? `Return ${HERBS[s].name} to its jar` : `Empty spoon ${i + 1}`);
        b.addEventListener("click", () => { if (s) takeSpoon(i); });
        slotsBox.appendChild(b);
      }
    }
    const dial = q("dial");
    const mkBtns = [1, 2, 3, 4, 5].map((m) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "mk"; b.textContent = m;
      b.setAttribute("aria-label", `Steep mark ${m}: ${DIAL_NOTE[m]}`);
      b.addEventListener("click", () => setMark(m));
      dial.appendChild(b); return b;
    });
    function setMark(m) { if (!over && !busy) { mark = m; tasted = null; update(); } }
    const pourBtn = q("pour"), tasteBtn = q("tastebtn");
    const resEl = q("res");
    function beat(t) { q("beat").textContent = t; }

    function unlockTaste() {
      if (tasteOn) return;
      tasteOn = true; tasteBtn.hidden = false; q("tastecard").hidden = false;
      beat(LINES.taste);
    }
    function update() {
      const B = curBook();
      q("bookname").textContent = (lastPot ? B.book : `${B.book} (book ${bookI + 1} of ${BOOKS.length})`) + " · " + STAGE_NAMES[stage].split(":")[0].toLowerCase();
      shared.set("jar_sand", Math.min(SAND_MAX, jarSand + sandInCup())); shared.set("tea_table", { drifts: piles });
      const sb = q("secondbtn"); sb.hidden = !secondOn || lastPot; sb.disabled = !leaves || over || busy;
      const lk = q("link"); lk.hidden = !linkNote; lk.textContent = linkNote;
      q("req").textContent = reqText(B.req);
      q("req2").textContent = reqText(B.req);
      q("note").textContent = B.note;
      const lead = gentle ? 2 : 0;
      const led = lastPot && ledgerTurned ? B.ledgerBack : B.ledger;
      q("led").textContent = (second && !(lastPot && ledgerTurned) ? LINES.secondHint : "") + (lastPot && ledgerTurned ? led[Math.max(0, Math.min(led.length - 1, gentle ? backLooks : Math.min(1, backLooks - 1)))] : led[Math.min(led.length - 1, failsHere + lead >= 4 ? 2 : failsHere + lead >= 2 ? 1 : 0)]);
      q("piles").innerHTML = piles ? Array.from({ length: piles }, () => `<span class="${P}pile"></span>`).join("") + `<span>${piles} drift${piles === 1 ? "" : "s"}</span>` : "<span>The table is clean.</span>";
      q("sweep").disabled = over || busy || piles <= 0;
      const ch = q("chap"), chId = CHAPTER_OF[B.scene];
      if (art.has(chId)) { if (ch.dataset.id !== chId) { ch.src = art.url(chId); ch.dataset.id = chId; } ch.hidden = false; } else ch.hidden = true;
      const sl = q("sandleft"); if (sl) sl.textContent = `${jarSand} spoon${jarSand === 1 ? "" : "s"} left`;
      q("books").innerHTML = BOOKS.map((_, i) => `<span class="${P}bk ${opened[i] ? P + "open" : ""} ${i === bookI && !lastPot ? P + "now" : ""}"></span>`).join("");
      q("kettle").innerHTML = Array.from({ length: POURS }, (_, i) => `<span class="${P}drop ${i >= poursLeft ? P + "used" : poursLeft <= 2 ? P + "low" : ""}"></span>`).join("") + `<span style="margin-left:6px">${`${poursLeft} pour${poursLeft === 1 ? "" : "s"} left`}</span>`;
      q("taste").innerHTML = [0, 1, 2].map((i) => `<i class="${i >= tastes ? P + "used" : ""}"></i>`).join("") + `<span style="margin-left:6px">${tastes} left</span>`;
      mkBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i + 1 === mark)));
      q("dialnote").textContent = `Mark ${mark}: ${DIAL_NOTE[mark]}`;
      drawSlots();
      pourBtn.disabled = spoons.length !== 3 || over || busy || (!lastPot && poursLeft <= 0);
      tasteBtn.disabled = spoons.length !== 3 || over || busy || tastes <= 0 || !!tasted;
      for (const j of jarsBox.children) j.disabled = spoons.length >= 3 || over || busy || (j.dataset.herb === "sand" && jarSand <= 0);
      drawCup(spoons.length / 3, spoons.length ? HERBS[spoons[spoons.length - 1]].col : HERBS.mint.col);
      if (!busy && !over) {
        if (tasted) resEl.innerHTML = `Tasted: ${tally(tasted, B.req)}`;
        else if (spoons.length === 3) resEl.textContent = tasteOn && tastes ? "Three spoons in. Taste it, or pour." : "Three spoons in. Pour when the dial is set.";
        else if (leaves && !spoons.length && !lastPot) resEl.textContent = "The leaves of the last cup are still in the pot: a second pour (X) costs no water. Or add three spoons.";
        else resEl.textContent = `${3 - spoons.length} spoon${spoons.length === 2 ? "" : "s"} to add.`;
      }
    }
    function tally(r, req) {
      const tick = (c, s) => `<span class="${c ? P + "ok" : P + "no"}">${s} ${c ? "✓" : "✗"}</span>`;
      const parts = [];
      parts.push(req.dmin != null ? tick(r.d >= req.dmin, `Depth ${r.d}`) : `Depth ${r.d}`);
      parts.push(req.lmin != null ? tick(r.l >= req.lmin, `Length ${r.l}`) : `Length ${r.l}`);
      parts.push(req.bmax != null ? tick(r.b <= req.bmax, `Binding ${r.b}`) : `Binding ${r.b}`);
      return parts.join(" · ");
    }
    function taste() {
      if (!tasteOn || spoons.length !== 3 || over || busy || tastes <= 0 || tasted) return;
      tastes--; tasted = brew(spoons, mark); update();
    }
    function shake(c) { if (rm) return; c.classList.remove(P + "shake"); void c.offsetWidth; c.classList.add(P + "shake"); }

    function pour() {
      if (spoons.length !== 3 || over || busy || (!lastPot && poursLeft <= 0)) return;
      const B = curBook();
      const r = brew(spoons, mark);
      const before = steep;
      steep = Math.max(0, steep + 3 * r.b);
      if (lastPot) { twistPour(r); return; }
      poursLeft--;
      const ok = meets(r, B.req);
      const hold = Math.min(100, 40 + 10 * r.d);
      busy = true;
      pourFlash = { ok, until: performance.now() + (rm ? 0 : 1300) };
      if (ok) {
        opened[bookI] = true;
        resEl.innerHTML = `${tally(r, B.req)}<br>${LINES.opened.replace("{hold}", hold)} <span class="${P}stamp">opened</span>`;
      } else {
        failsHere++;
        resEl.innerHTML = `${tally(r, B.req)}<br>${LINES.failed}`;
        shake(q("reqcard"));
        if (failsHere === 1) unlockTaste();
      }
      if (before < 20 && steep >= 20) beat(LINES.ring20); else if (before < 40 && steep >= 40) beat(LINES.ring40);
      update();
      const tick = setInterval(() => drawCup(1, HERBS[spoons[2] || "mint"].col), 120);
      const used = { r, spoons: spoons.slice() };
      timers.push(setTimeout(() => {
        clearInterval(tick);
        busy = false; spoons = []; tasted = null; pourFlash = null; preload = 0;
        piles = Math.min(4, piles + 1);   // a failed pour runs sand from the cover; a long reading leaks while he reads
        leaves = secondOn ? used : null;
        if (ok) { setTaste(used.spoons); advance(); return; }
        if (poursLeft <= 0) {
          if (leaves) { beat(LINES.dryLeaves); update(); return; }
          lose(); return;
        }
        update();
      }, rm ? 300 : 1400));
      timers.push(() => clearInterval(tick));
    }
    // the twist: each pour of the last pot lowers or raises the steep; while it stays at 80 or more the
    // cup comes back filled with three spoons he did not add (DESIGN.md section 12, threshold 80)
    let refillN = 0;
    function twistPour(r) {
      poursLeft--;
      const ok = meets(r, LAST.req);
      if (steep < REFILL_AT || poursLeft <= 0) { finishLastPot(r); return; }
      busy = true;
      pourFlash = { ok, until: performance.now() + (rm ? 0 : 1300) };
      resEl.innerHTML = `${tally(r, LAST.req)}<br>${ok ? LINES.refillLight : LINES.refillBound}`;
      if (!ok) shake(q("reqcard"));
      update();
      timers.push(setTimeout(() => {
        busy = false; pourFlash = null; tasted = null;
        spoons = REFILLS[refillN++ % REFILLS.length].slice(); preload = 3;
        beat(LINES.refilled + " " + LINES.twistAsk);
        update();
      }, rm ? 300 : 1400));
    }
    function lose() {
      over = true; update();
      api.store.set("lossStreak", losses + 1);
      api.end({ outcome: "lose", text: LINES.lose.replace("{book}", BOOKS[bookI].book).replace("{n}", bookI) + " Each cup fell short of what its card asked." });
    }
    // the taste the last cup carries into the next ride: stormcress over lamp-ash over ember root
    function setTaste(sp) { shared.set("cup_taste", sp.includes("storm") ? "storm" : sp.includes("lampash") ? "lampash" : sp.includes("ember") ? "ember" : "mint"); shared.set("tea_played", true); }
    // a book has opened: the next book, or the end of the stage
    function advance() {
      failsHere = 0; mark = 3;
      if (bookI === 0 || bookI === BOOKS.length - 1) { update(); between(); return; }
      bookI++;
      beat(`${BOOKS[bookI].book}: ${BOOKS[bookI].note} ${LINES.sandMore}`);
      buildJars(); update();
    }
    // the second pour: the leaves just used, poured over again for no kettle water
    function secondPour() {
      if (!leaves || !secondOn || over || busy || lastPot) return;
      const B = curBook();
      const r = { d: Math.floor(leaves.r.d / 2), l: leaves.r.l, b: 0 };
      const sp = leaves.spoons; leaves = null;
      const ok = meets(r, B.req);
      busy = true; pourFlash = { ok, until: performance.now() + (rm ? 0 : 1000) };
      if (ok) { opened[bookI] = true; resEl.innerHTML = `Second pour: ${tally(r, B.req)}<br>${LINES.opened.replace("{hold}", Math.min(100, 40 + 10 * r.d))} <span class="${P}stamp">opened</span>`; }
      else { resEl.innerHTML = `Second pour: ${tally(r, B.req)}<br>${LINES.secondThin}`; shake(q("reqcard")); }
      update();
      timers.push(setTimeout(() => {
        busy = false; pourFlash = null;
        if (ok) { setTaste(sp); advance(); }
        else if (poursLeft <= 0) lose();
        else update();
      }, rm ? 300 : 1100));
    }
    // ---- the stages ------------------------------------------------------------------------------
    function setStage(i) {
      stage = i; over = false; busy = false; spoons = []; tasted = null; leaves = null; failsHere = 0; mark = 3; preload = 0;
      POURS = STAGE_POURS[i]; poursLeft = POURS;
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, i));
      lastPot = i === 2; bookI = i === 0 ? 0 : i === 1 ? 1 : BOOKS.length;
      for (let k = 0; k < BOOKS.length; k++) opened[k] = k < bookI;
      if (i >= 1) { unlockTaste(); secondOn = true; }
      if (i === 0) beat((second ? LINES.secondOpen + " " : "") + LINES.open + " " + LINES.sandStart + " First, " + BOOKS[0].book.toLowerCase() + ": " + BOOKS[0].note);
      else if (i === 1) beat(`${BOOKS[1].book}: ${BOOKS[1].note} ${LINES.second}`);
      else {
        steep = Math.max(steep, 92); spoons = PRELOAD.slice(); preload = 3; piles = Math.max(piles, 2); refillN = 0;
        beat(LINES.twistOpen + " " + LINES.twistAsk);
      }
      prevJars = []; buildJars(); update();
    }
    function between() {
      const c = document.createElement("div");
      c.className = P + "intro";
      c.innerHTML = `<div class="${P}label" role="dialog" aria-label="The stage is done">
        <h2>${stage === 0 ? "The page opens" : "Three books open"}</h2>
        <p class="${P}goal"></p>
        <div class="${P}acts"><button type="button" class="${P}btn" data-a="go">${stage === 0 ? "Two more books" : "The last pot"}</button><button type="button" class="${P}btn ${P}alt" data-a="stop">Stop here</button></div></div>`;
      c.querySelector("p").textContent = `Next, ${STAGE_NAMES[stage + 1].toLowerCase()}. ${stage === 0 ? "One kettle for two books, and the leaves can be poured twice." : "No book asks for it. The cup is already on the table."}`;
      el.appendChild(c);
      c.querySelector('[data-a="go"]').addEventListener("click", () => { c.remove(); setStage(stage + 1); q("frame").focus(); });
      c.querySelector('[data-a="stop"]').addEventListener("click", () => {
        c.remove(); over = true; update(); api.store.set("lossStreak", 0);
        let text = stage === 0 ? LINES.stop1 : LINES.stop2;
        if (piles) text += LINES.endSandLeft.replace("{n}", piles).replace("{s}", piles === 1 ? "" : "s").replace("{v}", piles === 1 ? "s" : "");
        api.end({ outcome: "win", text });
      });
      c.querySelector('[data-a="go"]').focus();
    }
    function finishLastPot(r) {
      const parting = isParting(spoons, r);
      const refilling = steep >= REFILL_AT;   // the kettle ran dry while the cup still came back full
      const light = !refilling;
      over = true; busy = true; setTaste(spoons);
      pourFlash = { ok: true, until: performance.now() + (rm ? 0 : 1300) };
      resEl.innerHTML = `${tally(r, LAST.req)}<br>${parting ? "<b>The Parting Cup.</b>" : "The last pot is poured."}`;
      update();
      api.store.set("lossStreak", light ? 0 : losses + 1);
      api.store.set("partingCup", parting || api.store.get("partingCup", false));
      shared.set("jar_sand", jarSand);   // what went into the cup is gone from the ninth jar
      if (ledgerTurned) shared.set("ledger_turned", true);
      // the long puzzle: the Parting Cup, brewed with every piece in, is the answer
      const solvedNow = parting && light && piecesIn(shared);
      if (solvedNow) { shared.set("parting_cup", true); shared.set("solves", (shared.get("solves", 0) | 0) + 1); }
      let text = refilling ? LINES.dryHeavy + " " + LINES.endHeavy
        : parting ? LINES.endParting.replace("{d}", r.d).replace("{b}", "\u2212" + -r.b) : r.b <= 0 ? LINES.endLight : LINES.endEven;
      if (parting && light) text += solvedNow ? LINES.partingSolved : LINES.partingMissing.replace("{missing}", PIECES.filter((p) => !has(shared, p.key)).map((p) => p.name.toLowerCase()).join(" and ") + (PIECES.filter((p) => !has(shared, p.key)).length === 1 ? " is" : " are"));
      else if (light) text = LINES.ringClear + " " + text;
      if (!parting) text += ` (The last cup bound ${r.b}${preload ? `, with ${preload} of the spoons he did not add still in it` : ""}.)`;
      if (!light) text += LINES.endBound;
      if (piles) text += LINES.endSandLeft.replace("{n}", piles).replace("{s}", piles === 1 ? "" : "s").replace("{v}", piles === 1 ? "s" : "");
      if (!parting && !ledgerTurned) text += " The ledger was never turned over.";
      notebook.refresh();
      timers.push(setTimeout(() => {
        // the twist ends on an ending's image: the heavy cup's, or the one the Parting Cup leads to
        const e = !light ? ENDINGS.stayed : solvedNow ? endingFor(shared) : null;
        if (e) endingCard(root, api, e, !light ? "One more page." : "The Parting Cup.");
        else endCard(parting ? "The Parting Cup" : "The last cup");
        api.end({ outcome: light ? "win" : "lose", text });
      }, rm ? 300 : 1500));
    }
    // the ending card: the ring a cup leaves on a table (the collection's thread), behind the result
    function endCard(title) {
      if (!art.has("thread-own")) return;
      const c = document.createElement("div");
      c.className = P + "endc";
      c.innerHTML = `<figure><img src="${art.url("thread-own")}" alt="The ring a cup leaves on a table."><figcaption></figcaption></figure>`;
      c.querySelector("figcaption").textContent = title;
      root.appendChild(c);   // on the stage, not in the scrolling page, so it is seen wherever the page was scrolled
    }
    // ---- the ledger, opened ----------------------------------------------------------------------
    let ledgerEl = null, ledSide = "front", ledPage = 0;
    function openLedger() {
      if (over || busy || ledgerEl) return;
      ledgerSeen = true;
      if (second) { ledSide = "back"; ledPage = ledgerBack.length - 1; }
      else { ledSide = ledgerTurned ? "back" : "front"; ledPage = ledgerTurned ? 0 : (lastPot ? 2 : 0); }
      ledgerEl = document.createElement("div");
      ledgerEl.className = P + "book";
      ledgerEl.setAttribute("role", "dialog"); ledgerEl.setAttribute("aria-label", "The pantry ledger");
      root.appendChild(ledgerEl);
      drawLedger();
    }
    function closeLedger() { if (ledgerEl) { ledgerEl.remove(); ledgerEl = null; update(); q("frame").focus(); } }
    function drawLedger() {
      const pages = ledSide === "front" ? LEDGER_FRONT : ledgerBack;
      const pg = pages[ledPage];
      const canTurn = lastPot || second;   // the keeper only thinks to turn it over once no book is asking; a second reader knows
      ledgerEl.innerHTML = `<small>${ledSide === "front" ? "The pantry ledger" : "The ledger, turned over"} · page ${ledPage + 1} of ${pages.length}</small>
        ${art.has(pg.art) ? `<img class="${P}pg" src="${art.url(pg.art)}" alt="">` : `<div class="${P}pgfall"></div>`}
        <p></p>
        <div class="${P}bknav">
          <button type="button" class="${P}mini" data-a="prev" ${ledPage === 0 ? "disabled" : ""}>◀ Back a page</button>
          <button type="button" class="${P}mini" data-a="next" ${ledPage === pages.length - 1 ? "disabled" : ""}>On a page ▶</button>
          ${canTurn ? `<button type="button" class="${P}mini" data-a="turn">${ledSide === "front" ? "Turn the ledger over (O)" : "Turn it back (O)"}</button>` : ""}
          <button type="button" class="${P}mini" data-a="close">Close (Esc)</button>
        </div>`;
      ledgerEl.querySelector("p").textContent = pg.cap;
      const fall = ledgerEl.querySelector("." + P + "pgfall"); if (fall) fall.textContent = pg.cap;
      ledgerEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => ledgerAct(b.dataset.a)));
      (ledgerEl.querySelector('[data-a="next"]:not(:disabled)') || ledgerEl.querySelector('[data-a="close"]')).focus();
      if (ledSide === "back") backLooks = Math.max(backLooks, ledPage + 1);
    }
    function ledgerAct(a) {
      if (!ledgerEl) return;
      const pages = ledSide === "front" ? LEDGER_FRONT : ledgerBack;
      if (a === "prev" && ledPage > 0) ledPage--;
      else if (a === "next" && ledPage < pages.length - 1) ledPage++;
      else if (a === "turn" && (lastPot || second)) {
        ledSide = ledSide === "front" ? "back" : "front"; ledPage = 0;
        if (!ledgerTurned) { ledgerTurned = true; shared.set("ledger_turned", true); notebook.refresh(); beat(LINES.turnOver + " " + LINES.lastPotBack); }
      }
      else if (a === "close") { closeLedger(); return; }
      drawLedger();
    }
    q("openled").addEventListener("click", openLedger);
    q("sweep").addEventListener("click", sweep);
    pourBtn.addEventListener("click", pour);
    tasteBtn.addEventListener("click", taste);
    q("secondbtn").addEventListener("click", secondPour);

    const onKey = (e) => {
      if (over || el.querySelector("." + P + "intro")) return;
      if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled && (e.key === "Enter" || e.key === " ")) return;
      const k = e.key.toLowerCase();
      if (ledgerEl) {
        if (k === "escape" || k === "l") closeLedger();
        else if (k === "arrowleft") ledgerAct("prev");
        else if (k === "arrowright") ledgerAct("next");
        else if (k === "o") ledgerAct("turn");
        else return;
        e.preventDefault(); return;
      }
      const jars = jarsNow();
      const jk = "qwertyuio".indexOf(k);
      if (e.key >= "1" && e.key <= "5") setMark(+e.key);
      else if (jk >= 0 && jk < jars.length && k.length === 1) addSpoon(jars[jk]);
      else if (k === "backspace") takeSpoon(spoons.length - 1);
      else if (k === "s") sweep();
      else if (k === "l") openLedger();
      else if (k === "enter" || k === "p") pour();
      else if (k === "a") taste();
      else if (k === "x") secondPour();
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}label" role="dialog" aria-label="How to play">
      <svg class="${P}whip" viewBox="0 0 420 70" preserveAspectRatio="none" aria-hidden="true"><path d="M60 64 C80 10 150 30 175 14 C190 4 200 20 210 12 C220 20 230 4 245 14 C270 30 340 10 360 64" fill="none" stroke="${pal.honey}" stroke-width="1.5"/><circle cx="210" cy="12" r="4" fill="${pal.honey}"/></svg>
      ${art.has("frontis-c3") ? `<img class="${P}front" src="${art.url("frontis-c3")}" alt="">` : ""}
      <h2>Tea Blending</h2>
      <q>“${SOURCE_TEA}”</q>
      <p class="${P}goal"><b>Goal:</b> brew a cup that meets each book's card. Three stages: teach, test, twist. You can stop after any of them.</p>
      <table>
        <tr><td>Spoon</td><td>Tap a jar (Q W E R…) to add. Exactly three.</td></tr>
        <tr><td>Steep</td><td>Dial 1 to 5. Low thins depth; high adds length and binding.</td></tr>
        <tr><td>Pour</td><td>Enter. A short cup costs a pour.</td></tr>
        <tr><td>Sweep</td><td>S. Sand swept from the table fills a ninth jar.</td></tr>
        <tr><td>Ledger</td><td>L. The old keeper's recipes. Read all of it.</td></tr>
      </table>
      ${gentle ? `<p style="font-style:italic;margin:0 0 12px">${LINES.gentle}</p>` : ""}
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${STAGE_NAMES.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.split(":")[0]}</button>`).join("")}</div>` : ""}
      <button type="button" class="${P}btn ${P}light">Light the kettle</button></div>`;
    el.appendChild(intro);
    let startAt = 0;
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { startAt = +b.dataset.s; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); }));
    intro.querySelector("." + P + "light").addEventListener("click", () => { intro.remove(); setStage(startAt); q("frame").focus(); });
    intro.querySelector("." + P + "light").focus();

    const notebook = mountNotebook(root, api, { at: { left: "8px", bottom: "8px" } });
    buildJars();
    update();
    return {
      unmount() { timers.forEach((t) => (typeof t === "function" ? t() : clearTimeout(t))); removeEventListener("keydown", onKey); notebook.unmount(); },
    };
  },
};

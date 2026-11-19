// Missing Campsites / Pack List (1D, wax crayon on kraft paper).
//
// DESIGN.md section 11, Pack List, at pack_list_1: five seats round the fire, the chain at most ten,
// one phantom: "a blue enamel kettle" (site 5's table), which Rafe's repetition includes though
// nobody added it. Each speaker says the chain in order and adds one item; each word fades 4 s after
// it is said (the last three stay 2 s longer on this first appearance; "Hold the chain" keeps all).
// On Tam's turn, tap the tiles in the chain's order, then add one of three items from Tam's pack.
// The phantom may be repeated where Rafe put it (accepted +1), or challenged: press "Nobody said
// that." and tap it (a line in the notebook). A false challenge costs warmth. A wrong order loses
// the round; everyone laughs. June fails on lap 3, cheerfully, and the round is won.
//
// Actions (the refine pass):
//   Repeat     tap the tiles in the chain's order (or Tab and Enter).
//   Add        one item of Tam's own, when the chain is said.
//   Challenge  "Nobody said that." (N), then tap the item: right writes a line, wrong costs warmth.
//              Unlocks when a phantom has been said.
//   Notebook   check the notebook (B), once: Tam has been writing down what each friend added, so
//              for four seconds the true chain shows in pencil, and a phantom is not in it.
//              Unlocks on lap 2.
// Outcomes: the round lasts and the kettle is caught (win); the round lasts but the kettle was
// repeated or let pass (done: it is packed now); a wrong order (lose). After two losses in a row,
// "Hold the chain" starts on. Lines in TEXT are written for the game (listed for approval);
// Rafe's "Did I? … I did, didn't I." is DESIGN.md's own line.
//
// Phase 1 (accepted 2026-11-15, DESIGN.md "Accepted development"):
//   Backwards lap  June's house rule: lap 2 is said last thing first, by everyone, Tam included. It is
//                  the practice for the pattern walk, where the List is said backwards.
//   The List       catching the kettle writes item 5 on the notebook's List page (L opens it): the
//                  first step of the game's long puzzle.
// Art (api.art): the 36 item tiles as the tray, the friends' portrait outlines on the seats, the
// List tiles and notebook tabs on the List page, chapter 2's card on the how-to, and the title
// lettering with the night card behind the result. Every element falls back to the crayon drawing.

//
// Phase 2 (2026-11-16): the ladder. Three rounds:
//   1 Teach  night 1, one lap: the chain, and one phantom (Rafe's blue enamel kettle).
//   2 Test   the backwards lap, with two phantoms (Dell's heron sign, Inés's "Puddle the bicycle": the
//            List's 17). June's arm, once a round (J): the chain in biro. Channel two says June's
//            words a half-second before she does.
//   3 Twist  night 2, seven seats: Abel sits in and adds a guest's item (Nell's telephone number), and
//            the seat nobody filled is dealt a turn. The set-piece: its words rise in the band before
//            any mouth moves; it says the whole chain without a slip and adds something Tam wrote and
//            never said (the tall cedar, then the owl box). It plays to win. The move the first two
//            rounds taught, "Nobody said that", is now the wrong one: it was said, and challenging it
//            puts Tam out. Say it back, twice, and Dell goes out, not cheerfully.
//
// Phase 3 (2026-11-16, DESIGN.md section 20a): the price.
//   June's arm  in the backwards lap, reading her arm (J) also shows three things at her wrist in a
//               different biro, written before anyone sat down: what channel two said first. Items 1,
//               2 and 3 of the List (a washing line, a camp chair, a hammock).
//   The seat    after its owl box it takes a third turn, says everything without a slip, and adds a
//               twentieth thing: "a notebook". Dell: "Put it on the fire or put it away." Tam chooses:
//               put the notebook on the fire (api.shared "notebook_burned": the List now lives on June's
//               arm, and the ending is Unlisted's if no guest sleeps inside), or keep it and say the
//               whole chain back a third time, the notebook included. If the spare sheet was filled at
//               Foil Supper (api.shared "seat_fed"), the seat's turn is slower and its words stay.
//   Second run  (api.shared "runs" > 0): channel two is on from the first lap of night 1, and June
//               turns the walkie down before she starts.

import { pic, chapterCard, resultCard, listPage, LIST, listId, ladder, stageTabs, sharedList, runsDone, burned } from "./kit.js";

const NAMES = ["The chain", "Backwards", "The empty seat"];

const P = "missing-campsites-pack-list-";
const SEATS = [
  { name: "June", color: "#3f7d3a" }, { name: "Dell", color: "#9c3b30" }, { name: "Rafe", color: "#6b3f8a" },
  { name: "Inés", color: "#b07a10" }, { name: "Tam", color: "#2b5d8a" },
];
// Every item here has a tile in the art (pieces/item-*); the names are the tiles' own.
const ADDS = { June: ["a tarp", "tent pegs"], Dell: ["marshmallows", "foil"], Rafe: ["rope", "playing cards"], "Inés": ["a tin cup", "a sun hat"] };
const TAM_PACK = [["the torch", "dry socks", "a toothbrush"], ["a thermos", "a compass", "a book"]];
const KETTLE = { name: "a blue enamel kettle", after: 1, list: 5, heard: "Something in Rafe's list sounds like it belongs to someone else's trip.",
  caughtLine: "Rafe looks at the fire. \"Did I? … I did, didn't I.\"", note: "The List, 5: \"a blue enamel kettle\". Nobody packed it. Site 5's table, 16:10, day 1." };
const HERON = { name: "a heron sign", after: 2, list: 0, heard: "Dell said something in the middle there that nobody put in.",
  caughtLine: "Dell frowns. \"The sign? We drove past a sign. …Did we pack a sign?\"", note: "\"A heron sign\": nobody packed it. Dell, backwards lap. It stands at the entrance. For now." };
const PUDDLE = { name: "Puddle the bicycle", after: 4, list: 17, heard: "Inés said a name in her list. Bags do not have names in them.",
  caughtLine: "Inés: \"Puddle. That's… a kid's bike has a name like that. Why do I know that?\"", note: "The List, 17: \"Puddle\". Nobody packed it. Lottie Ashby's bicycle, site 17." };
const FIVE = [{ name: "June", color: "#3f7d3a" }, { name: "Dell", color: "#9c3b30" }, { name: "Rafe", color: "#6b3f8a" }, { name: "Inés", color: "#b07a10" }, { name: "Tam", color: "#2b5d8a" }];
const STAGE = {
  1: { seats: FIVE, chain: [], phantoms: [KETTLE], peek: null },
  2: { seats: FIVE, chain: ["a tarp", "marshmallows", "rope", "a tin cup", "the torch"], phantoms: [HERON, PUDDLE], peek: "arm" },
  3: { seats: [FIVE[0], FIVE[1], FIVE[2], FIVE[3], { name: "Abel", color: "#5a6a70" }, { name: "—", color: "#8a857b", empty: true }, FIVE[4]], chain: ["a tarp", "marshmallows", "rope", "a tin cup"], phantoms: [], peek: "nb" },
};
const PHANTOM = "a blue enamel kettle";
const PHANTOM_AFTER = 3;          // Rafe slips it in after the third item, on lap 2
const DISTRACT = ["a lantern", "a water bottle", "boots", "the map", "a blanket", "a camera", "a frying pan", "a rucksack", "matches",
  "a tent", "the cooler", "firewood", "a mallet", "a pocket knife", "the van keys", "a walkie-talkie"];
const BACK_LAP = 2;               // June's house rule: this lap is said backwards
const WORD_MS = 850;

const TEXT = {
  when: ["Night 1 · the first fire", "Night 1 · the second lap", "Night 2 · the second fire · seven seats"],
  goal: ["Say the whole list back in order on your turn, and last the round.", "Say it back last thing first, and catch what nobody added.", "Say the whole list back, twice. One of the seats is empty, and it is playing."],
  rule: ["Each friend says every item so far, then adds one. The words fade.", "June's house rule: this lap goes backwards. Two things in it nobody packed.", "The empty seat is dealt a turn, and it plays to win. What it says was said, in turn: you cannot challenge it away. Say it back."],
  how: [["<b>Repeat:</b> tap the tiles in the chain's order", "<b>Add:</b> then tap one thing of your own", "<b>Slip:</b> one wrong tile and you're out", "<b>Nobody said that (N):</b> if someone repeats a thing nobody added"],
    ["<b>Backwards:</b> last thing in, first thing out", "<b>Nobody said that (N):</b> twice, if you heard two", "<b>June's arm (J):</b> once: the chain in biro, first to last", "<b>Slip:</b> one wrong tile and you're out"],
    ["<b>Repeat:</b> all of it, in order, the seat's things too", "<b>Notebook (B):</b> once: the chain in pencil", "<b>Nobody said that:</b> it was said. Don't", "<b>Slip:</b> one wrong tile and you're out"]],
  voice: "June's walkie is on channel two in her lap. Each word hissed out of it a half-second before she said it. She does not look down.",
  armUnlock: "June holds her forearm to the fire: the chain, in biro, first to last. \"Once. No more.\" (J: read it.)",
  armShow: "June's arm, in biro, first to last. The lap wants it last to first.",
  abelAdds: "Abel adds Nell's telephone number. He says it the way you say a thing you are afraid to stop saying.",
  seatTurn: "Nobody is in the sixth seat. It is its turn.",
  seatAdds: "The words were in the air before any mouth moved. Then one more: the tall cedar. You wrote that yesterday, row 16. You never said it aloud.",
  seatAdds2: "All of it, quicker, without a slip. Then: the owl box. Row 7, in your hand. Nobody looks at the seat.",
  seatYourTurn: "Your turn. Everyone is waiting for you to say it. All of it.",
  seatYourTurn2: "Your turn again. It will not slip. You can.",
  seatChallenge: "\"Nobody said that.\" Dell does not laugh. \"We all heard it, Tam. It was said. You're out.\"",
  notebookSeat: "Your notebook, in pencil. Two of these lines you wrote yesterday, on the Sites page. They are here now too.",
  dellOut: "Dell stops in the middle. \"No. I'm out. I'm not playing against a chair.\" Nobody laughs.",
  gentle: "\"Hold the chain\" is on: the words stay in the air this time.",
  open: ["The fire is going. Five of you, five seats. June starts, because June always starts.", "Same fire, second lap. Five things in the bag so far, and June has a rule.", "The second fire. Abel has pulled up a stump. Somebody set out a seventh seat, and nobody is in it."],
  lap1: "June: \"House rule. Second lap goes backwards. Last thing in, first thing out.\"",
  backTurn: "Your turn, and it is the backwards lap. Last thing first.",
  backDone: "June, grinning: \"See? You can walk it either way.\"",
  listUnlock: "A new page in your notebook, after Tally: the List. (L: open it.)",
  listNote: "Things nobody packed, in the order they were said.",
  wrist: "At her wrist, in a different biro, three more, written before anyone sat down: a washing line, a camp chair, a hammock. \"Channel two said those first.\"",
  wristNote: "The List, 1 to 3: a washing line, a camp chair, a hammock. Nobody at this fire said them. June wrote them down off channel two.",
  seatAdds3: "All of it, without a slip, fast. Then a twentieth thing, one nobody at the fire has ever said: \"…and a notebook.\"",
  seatAdds3fed: "All of it, slower this time, as if it had eaten, and the words stay in the air. Then a twentieth thing: \"…and a notebook.\"",
  dellFire: "Dell, not looking at you: \"Put it on the fire or put it away. I can't eat with it open.\"",
  burnBtn: "Put the notebook on the fire",
  keepBtn: "Keep it. Say it back",
  burnt: "You put it on the coals open, the List page up. It takes a long time to catch. Nobody stops you. June pulls her sleeve down over her arm and then, after a while, pushes it back up.",
  keepTurn: "You close the notebook on your knee and keep your hand on it. Your turn. All of it, the notebook too.",
  again: "June turns the walkie down before she starts. \"It knows this one,\" she says, to nobody. \"It played last time.\"",
  notebookUnlock: "Your notebook is open on your knee. You've been writing down what each of them added, without meaning to. (B: check it, once.)",

  challengeUnlock: "If you heard something nobody added, say so: Nobody said that (N), then tap it.",
  challengeOn: "Nobody said that? Then tap the thing nobody said.",

  falseCh: "\"I did say that.\" A small silence. (Warmth −1)",
  accepted: (w) => `You say ${w} as if someone packed it. Nobody blinks.`,
  notebookShow: "Your notebook, in pencil: what each of them added, in order.",
  notebookBack: "Your notebook, in pencil, first to last. June wants it last to first.",
  juneOut: "June: \"…and…a…\" She laughs into her sleeve. \"I'm out. I'm out!\"",
  yourTurn: "Your turn. Say it in order.",
  addNow: "Now add something of yours.",
  end: {
    t2: (got, w) => `June is out, laughing, and the backwards lap is yours. ${got === 2 ? "You caught both: the sign is a line in your notebook, and Puddle is on the List." : got === 1 ? "You caught one of the two things nobody packed. The other is packed now." : "Two things went round that nobody packed, and now they are packed."} Warmth ${w}.`,
    t3burn: (w) => `The notebook burned, and the seat nobody filled did not take another turn. The tall cedar and the owl box, and everything else on the List, are on June's arm now and nowhere else. Agnes's lines went on the fire with the rest. Warmth ${w}.`,
    t3keep: (w) => `Dell is out, and not laughing. You said all of it back, the notebook too, and you still have it. It is the twentieth thing on somebody's list now. Warmth ${w}.`,
    t3: (w) => `Dell is out, and not laughing. The seat nobody filled said every item and never slipped, and so did you. The tall cedar and the owl box were on your Sites page; they are on the List now too, and you did not put them there. Warmth ${w}.`,
    seatLose: (w) => `You said nobody said "${w}". Everybody heard it said. The seat nobody filled is still in the round, and you are not.`,
    win: (w) => `June is out, laughing, and the round is yours. You caught the kettle; the line is in your notebook, in your hand. Warmth ${w}.`,
    accepted: (w) => `June is out, laughing, and the round is yours. You repeated the kettle as if someone had packed it, and now it is packed. Warmth ${w}.`,
    missed: (w) => `June is out, laughing, and the round is yours. Nobody mentions the kettle again, and nobody remembers who said it. Warmth ${w}.`,
    lose: (w, wanted, caught) => `You said ${w} where ${wanted} went. Everyone laughs; nothing else is lost.${caught ? " What you caught stays in your notebook." : ""}`,
  },
};

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;color:#2b1d14;font-family:Caveat,'Segoe Print','Comic Sans MS',cursive;background:#b98b5a;
  background-image:radial-gradient(rgba(70,40,15,.18) 1px,transparent 1.4px),radial-gradient(rgba(255,230,190,.12) 1px,transparent 1.6px),repeating-linear-gradient(8deg,rgba(90,55,25,.06) 0 2px,transparent 2px 7px);
  background-size:7px 7px,11px 11px,auto;display:grid;grid-template-rows:max-content max-content;gap:10px;padding:12px;box-sizing:border-box;align-content:start}
.${P}band{background:#ecdcba;padding:8px 14px;min-height:72px;position:relative;box-shadow:0 2px 0 rgba(60,35,10,.25)}
.${P}band small{display:flex;justify-content:space-between;gap:10px;font-size:19px;color:#5b4129}
.${P}band small em{font-style:normal;font-weight:700}
.${P}words{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:clamp(21px,2.6vw,27px);min-height:32px;font-weight:700}
.${P}words span{transition:opacity .8s}
.${P}words span.fade{opacity:0}
.${P}words span.ring{outline:3px solid #c8321f;outline-offset:2px;border-radius:40%}
.${P}words.nb span{color:#4a4a4c!important;font-weight:500}
.${P}words.arm span{color:#1f3fa0!important;font-weight:500}
.${P}words span.v2{color:#8a857b;font:600 .62em 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;align-self:center}
.${P}main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
.${P}fire{width:100%;max-height:60vh;height:auto;display:block}
.${P}side{display:flex;flex-direction:column;gap:10px}
.${P}tray{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:#6e4f2e;padding:8px;transition:box-shadow .2s}
.${P}tray.ch{box-shadow:0 0 0 4px #c8321f}
.${P}tile{position:relative;font:inherit;font-size:clamp(17px,1.9vw,20px);font-weight:700;line-height:1;background:#f4ead2;color:#2b1d14;border:0;padding:12px 4px;min-height:56px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.${P}tile.art{padding:3px 3px 5px;justify-content:flex-start}
.${P}tile img{width:100%;aspect-ratio:1/.8;object-fit:cover;object-position:50% 12%;display:block;pointer-events:none}
.${P}listb{font:inherit;font-size:21px;font-weight:700;background:#f6f1e2;color:#3a3a3c;border:0;box-shadow:inset 0 0 0 3px #4a4a48;padding:8px 14px;cursor:pointer}
.${P}listb[hidden]{display:none}
.${P}note{display:flex;gap:8px;align-items:center}
.${P}note img{width:64px;height:64px;flex:none}
.${P}back{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.12em;background:#2b5d8a;color:#fff;padding:1px 8px;margin-left:8px}
.${P}back[hidden]{display:none}
.${P}tile:hover:not(:disabled){background:#fff6dd;transform:rotate(-1deg)}
.${P}tile:disabled{opacity:.4;cursor:default}
.${P}tile.used{background:#cfe0b8;color:#3a5a2a}
.${P}tile.used::after{content:"✓";position:absolute;right:5px;top:2px;color:#3f7d3a;font-size:20px}
.${P}tile.bad{background:#f2b6a8;animation:${P}shake .4s}
.${P}tile.caught{outline:4px solid #c8321f;outline-offset:-4px}
.${P}tile:focus-visible{outline:3px solid #2b5d8a}
@keyframes ${P}shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.${P}edge{position:absolute;inset:2px;border:3px solid #3b3734;filter:url(#mc-pl-wax);pointer-events:none}
.${P}row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.${P}no,.${P}nbk{font:inherit;font-size:23px;font-weight:700;background:#c8321f;color:#fff;border:0;padding:8px 16px;cursor:pointer;position:relative}
.${P}nbk{background:#f4ead2;color:#2b1d14;box-shadow:inset 0 0 0 3px #3b3734}
.${P}no.on{background:#7a1a0e;box-shadow:inset 0 0 0 3px #fff8}
.${P}no:disabled,.${P}nbk:disabled{opacity:.4;cursor:default}
.${P}no[hidden],.${P}nbk[hidden]{display:none}
.${P}fresh{animation:${P}fresh 1s 2}
@keyframes ${P}fresh{50%{transform:scale(1.08)}}
.${P}say{font-size:23px;line-height:1.15;background:#ecdcba;padding:6px 12px;min-height:30px}
.${P}prog{font-size:20px;color:#2b1d14;font-weight:700}
.${P}note{font-size:20px;color:#3a3a3c;background:#fbf8ee;padding:6px 10px;border-left:4px solid #d58a7a}
.${P}note[hidden]{display:none}
.${P}hold{font:600 14px 'IBM Plex Mono',monospace;display:flex;gap:6px;align-items:center;color:#2b1d14}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(110,79,46,.86);z-index:4;padding:16px;overflow:auto}
.${P}card{max-width:460px;width:100%;box-sizing:border-box;background:#f4ead2;padding:22px 24px 20px;font-size:21px;line-height:1.2;position:relative;transform:rotate(-1.2deg)}
.${P}card::before{content:"";position:absolute;inset:6px;border:4px solid #c8321f;filter:url(#mc-pl-wax);pointer-events:none}
.${P}card h2{margin:0;font-size:42px;line-height:1;color:#c8321f}
.${P}card .when{font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase;margin:4px 0 10px;color:#6b5236}
.${P}card .goal{margin:0 0 6px;font-size:23px;font-weight:700}
.${P}card .rule{margin:0 0 10px}
.${P}card ul{margin:0 0 12px;padding:0;list-style:none;display:grid;gap:4px}
.${P}card li::before{content:"✎ ";color:#c8321f}
.${P}card li b{color:#2b5d8a}
.${P}card .gentle{font:600 14px 'IBM Plex Mono',monospace;color:#3f7d3a;margin:0 0 10px}
.${P}card button{font:inherit;font-size:26px;font-weight:700;background:#c8321f;color:#fff;border:0;padding:6px 24px;cursor:pointer}
.${P}card button:focus-visible{outline:3px dashed #2b5d8a;outline-offset:3px}
@media (max-width:700px){.${P}main{grid-template-columns:1fr}.${P}fire{max-height:30vh}.${P}tile{min-height:50px;font-size:16px;padding:8px 3px}.${P}tile.art{padding:2px 2px 4px}.${P}say{font-size:21px}}
`;

export default { mount(root, api) { return ladder(root, api, mountStage, NAMES); } };

function mountStage(root, api, stage) {
  {
    const CFG = STAGE[stage], SEATS = CFG.seats, TAM = SEATS.length - 1;
    const rng = api.rng();
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mc-pl-wax"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></svg>
      <div class="${P}band"><small><span>I packed my bag, and in it I put…<b class="${P}back" hidden>BACKWARDS LAP</b></span><em class="who"></em></small><div class="${P}words" aria-live="polite"></div></div>
      <div class="${P}main"><svg class="${P}fire" viewBox="0 0 400 380" aria-label="The fire ring and the seats"></svg>
        <div class="${P}side"><div class="${P}say">Waiting by the fire.</div>
          <div class="${P}prog" aria-live="polite"></div>
          <div class="${P}tray"></div>
          <div class="${P}row"><button type="button" class="${P}no" hidden>Nobody said that. (N)</button>
            <button type="button" class="${P}nbk" hidden>Check the notebook (B)</button>
            <button type="button" class="${P}listb" hidden>The List (L)</button>
            <label class="${P}hold"><input type="checkbox"> Hold the chain</label></div>
          <div class="${P}note" hidden></div></div></div>
      <div class="${P}intro"><div class="${P}card"><h2>Pack List</h2><div class="when"></div>
        <p class="goal"></p><p class="rule"></p>
        <ul>${TEXT.how[stage - 1].map((h) => `<li>${h}</li>`).join("")}</ul>
        <p class="gentle" hidden></p>
        <button type="button">Sit down</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when[stage - 1]; $(".goal").textContent = TEXT.goal[stage - 1]; $(".rule").textContent = TEXT.rule[stage - 1];
    stageTabs(api, $(`.${P}card>button`));
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const words = $(`.${P}words`), tray = $(`.${P}tray`), sayEl = $(`.${P}say`), noBtn = $(`.${P}no`), nbBtn = $(`.${P}nbk`), noteEl = $(`.${P}note`), progEl = $(`.${P}prog`);
    const holdBox = $(`.${P}hold input`);
    const art = api.art, listBtn = $(`.${P}listb`);
    chapterCard(art, stage === 3 ? "chapter-5" : "chapter-2", $(`.${P}card`));
    if (stage === 2) { nbBtn.textContent = "Read June's arm (J)"; }
    const TILE = {};                                    // item name -> art id, from the tiles' own titles
    if (art && art.list) for (const id of art.list("pieces")) { const t = art.info(id).title; if (t.startsWith("Pack List tile: ")) TILE[t.slice(16)] = id; }
    if (art && art.has) { if (art.has("list-16")) TILE["the tall cedar"] = "list-16"; if (art.has("list-07")) TILE["the owl box"] = "list-07"; }
    const FACE = { June: "outline-june", Dell: "outline-dell", Rafe: "outline-rafe", "Inés": "outline-ines", Abel: "outline-abel", Tam: "item-notebook" };
    const shList = sharedList(api);
    const found = shList.read();
    const again = runsDone(api) > 0, fed = !!(api.shared && api.shared.get("seat_fed", false));
    if (art && art.has && art.has("item-notebook")) TILE["a notebook"] = "item-notebook";
    const list = listPage(wrap, art, { note: TEXT.listNote, arm: burned(api) });
    list.set(found);
    listBtn.addEventListener("click", () => list.toggle());
    listBtn.hidden = false;                             // phase 3: the List is always one button away
    holdBox.checked = gentle;
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, api.reducedMotion ? Math.min(ms, 400) : ms); timers.push(t); return t; };
    let over = false, chain = CFG.chain.slice(), warmth = 4, mistakes = 0, nbLeft = 1, nbShowing = false;
    let turn = null;
    const fedHold = stage === 3 && fed;                // the seat, fed at supper, speaks slower and its words stay

    // ---- the fire and the seats, in crayon ----
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}fire`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const ngon = (x, y, r, n, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * Math.PI * 2; return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
    const wax = { filter: "url(#mc-pl-wax)" };
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mk("polygon", { points: ngon(200 + Math.cos(a) * 70, 190 + Math.sin(a) * 70, 15, 6, a), fill: "#6e6b66", stroke: "#3b3734", "stroke-width": 4, ...wax }); }
    mk("polygon", { points: ngon(200, 190, 55, 12), fill: "#2b1d14", ...wax });
    const flames = mk("g", {});
    [["#d8401f", 46], ["#f08a24", 32], ["#ffd23f", 18]].forEach(([c, r]) => {
      const pts = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; const rr = i % 2 ? r * 0.45 : r; return `${(200 + Math.cos(a) * rr).toFixed(1)},${(190 + Math.sin(a) * rr).toFixed(1)}`; }).join(" ");
      mk("polygon", { points: pts, fill: c, stroke: c, "stroke-width": 3, ...wax }, flames);
    });
    const seatEls = SEATS.map((s, i) => {
      const a = -Math.PI / 2 + i / SEATS.length * Math.PI * 2;
      const x = 200 + Math.cos(a) * 150, y = 190 + Math.sin(a) * 146;
      const g = mk("g", {});
      const face = art && art.has(FACE[s.name]) ? FACE[s.name] : null;
      const r = mk("rect", { x: x - 44, y: y - (face ? 42 : 30), width: 88, height: face ? 84 : 60, fill: "#f4ead2", stroke: s.color, "stroke-width": 4, ...(s.empty ? { "stroke-dasharray": "9 7", "fill-opacity": 0.35 } : {}), ...wax }, g);
      if (s.empty) { const t0 = mk("text", { x, y: y + 8, "text-anchor": "middle", "font-size": 20, fill: s.color, "font-family": "Caveat, cursive", "font-weight": 700 }, g); t0.textContent = "nobody"; return { g, r, x, y }; }
      if (face) {                                       // the People page's outline (Tam's own seat shows the notebook: Tam's face is never drawn)
        const im = mk("image", { x: x - 30, y: y - 38, width: 60, height: 54, preserveAspectRatio: s.name === "Tam" ? "xMidYMid meet" : "xMidYMin slice" }, g);
        im.setAttribute("href", art.url(face));
      } else mk("path", { d: `M${x - 10} ${y - 8} L${x} ${y - 18} L${x + 10} ${y - 8}`, fill: "none", stroke: s.color, "stroke-width": 3, ...wax }, g);
      const t = mk("text", { x, y: y + (face ? 37 : 20), "text-anchor": "middle", "font-size": 24, fill: s.color, "font-family": "Caveat, cursive", "font-weight": 700 }, g);
      t.textContent = s.name;
      return { g, r, x, y };
    });
    const light = (i) => {
      seatEls.forEach((s, k) => { s.r.setAttribute("stroke-width", k === i ? 9 : 4); s.r.setAttribute("fill", k === i ? "#fff6dd" : "#f4ead2"); });
      $(".who").textContent = i == null ? "" : SEATS[i].empty ? "nobody speaks" : `${SEATS[i].name} speaks`;
      $(".who").style.color = i == null ? "" : SEATS[i].color;
    };
    const say = (t) => { sayEl.textContent = t; };
    function unlock(btn, text) { if (!btn.hidden) return; btn.hidden = false; if (!api.reducedMotion) btn.classList.add(P + "fresh"); say(text); }

    // ---- the spoken band ----
    function speak(word, who, stay = 4000) {
      const early = [...words.querySelectorAll("span.v2")].find((g) => g.textContent === word); if (early) early.remove();
      const s = document.createElement("span");
      s.textContent = word;
      s.style.color = who.color;
      words.appendChild(s);
      if (!holdBox.checked && !(fedHold && who.empty)) later(() => s.classList.add("fade"), stay);
      if (words.children.length > 14) words.firstChild.remove();
      return s;
    }
    holdBox.addEventListener("change", () => { if (holdBox.checked) words.querySelectorAll(".fade").forEach((s) => s.classList.remove("fade")); });

    // ---- phantoms: things said that nobody added; and what the empty seat adds (stage 3) ----
    const phantoms = CFG.phantoms.map((x) => ({ ...x, said: false, caught: false, used: false }));
    const ph = (w) => phantoms.find((x) => x.name === w && x.said);
    const seatItems = new Set();
    const openPh = () => phantoms.some((x) => x.said && !x.caught);
    const seat = (name) => SEATS.findIndex((x) => x.name === name);

    function ghost(w) {                                  // channel two: the word, a half-second early
      const g = document.createElement("span"); g.textContent = w; g.className = "v2"; words.appendChild(g);
    }
    // A seat recites the chain, then adds one. o: { back, slip, add, addLine, then, stopAt, outLine, voice, fast, nobody }
    function recite(i, o, done) {
      const who = SEATS[i];
      light(i);
      say(o.nobody ? TEXT.seatTurn : `${who.name}: "I packed my bag, and in it I put…"`);
      words.classList.remove("nb", "arm");
      words.innerHTML = "";
      $(`.${P}back`).hidden = !o.back;
      const said = chain.slice();
      if (o.slip) { said.splice(o.slip.after, 0, o.slip.name); o.slip.said = true; }
      if (o.back) said.reverse();                         // a phantom keeps its place between the same two things
      const ms = o.fast ? 560 : WORD_MS;
      if (o.stopAt) {
        said.slice(0, o.stopAt).forEach((w, k) => later(() => speak(w, who), ms * (k + 1)));
        later(() => { say(o.outLine); done(); }, ms * (o.stopAt + 2));
        return;
      }
      const n = said.length;
      said.forEach((w, k) => {
        if (o.voice) later(() => ghost(w), ms * (k + 1) - 430);
        later(() => speak(w, who, 4000 + (k >= n - 3 ? 2000 : 0)), ms * (k + 1));
      });
      later(() => { speak(o.add, who, 6000); chain.push(o.add); if (o.nobody) seatItems.add(o.add); say(o.addLine || `${who.name} adds ${o.add}.`); }, ms * (n + 1) + 300);
      if (o.slip) later(() => say(o.slip.heard), ms * (n + 2) + 200);
      if (o.then) later(() => say(o.then), ms * (n + 2) + 900);
      later(done, ms * (n + 2) + (o.slip ? 2200 : o.then ? 3600 : o.nobody ? 2000 : 600));
    }

    function paintProg() {
      if (!turn) { progEl.textContent = ""; return; }
      progEl.textContent = turn.adding ? "Now one of yours." : `Said ${turn.idx} of ${chain.length}${turn.back ? " · backwards" : ""}`;
    }

    function tamTurn(o, done) {
      light(TAM);
      $(`.${P}back`).hidden = !o.back;
      say(o.back ? TEXT.backTurn : o.line || TEXT.yourTurn);
      const pool = new Set(chain);
      phantoms.forEach((x) => { if (x.said) pool.add(x.name); });
      const extra = DISTRACT.filter((w) => !pool.has(w)).sort(() => rng() - 0.5);
      while (pool.size < 16 && extra.length) pool.add(extra.pop());
      const items = [...pool].sort(() => rng() - 0.5);
      const seq = o.back ? chain.slice().reverse() : chain.slice();
      turn = { idx: 0, challenge: false, done, adding: false, back: !!o.back, seq, pack: o.pack };
      tray.innerHTML = "";
      items.forEach((w) => tray.appendChild(tile(w, (b) => tapTile(w, b))));
      if (stage === 3) noBtn.hidden = false;
      else if (openPh()) unlock(noBtn, TEXT.challengeUnlock);
      noBtn.disabled = !(openPh() || stage === 3);
      if (CFG.peek && nbLeft > 0) later(() => { if (turn && !over) { unlock(nbBtn, CFG.peek === "arm" ? TEXT.armUnlock : TEXT.notebookUnlock); nbBtn.disabled = nbLeft <= 0 || turn.adding; } }, 3200);
      nbBtn.disabled = nbLeft <= 0;
      paintProg();
      tray.querySelector("button")?.focus();
    }
    function tile(w, on) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "tile";
      const x = ph(w);
      const im = pic(art, w === "a blue enamel kettle" && x && !x.caught && art && art.has("item-kettle-said") ? "item-kettle-said" : TILE[w]);
      if (im) { b.classList.add("art"); b.appendChild(im); } else b.innerHTML = `<span class="${P}edge"></span>`;
      b.appendChild(document.createTextNode(w));
      b.addEventListener("click", () => on(b));
      return b;
    }

    function tamWord(w) { speak(w, SEATS[TAM], 8000); }
    function out(text, endText) {
      mistakes++;
      say(text);
      turn = null;
      over = true;
      api.store.set("losses", losses + 1);
      later(() => { showResult("lose"); api.end({ outcome: "lose", text: endText }); }, 1600);
    }

    function tapTile(w, b) {
      if (!turn || over || turn.adding) return;
      if (turn.challenge) {
        turn.challenge = false; noBtn.classList.remove("on"); tray.classList.remove("ch");
        const x = ph(w);
        if (x && !x.caught) {
          x.caught = true; b.classList.add("caught"); b.disabled = true; noBtn.disabled = !(openPh() || stage === 3);
          { const im = b.querySelector("img"); if (im && TILE[w]) im.src = art.url(TILE[w]); }   // now it is circled
          words.querySelectorAll("span").forEach((sp) => { if (sp.textContent === w) sp.classList.add("ring"); });
          say(x.caughtLine);
          noteEl.hidden = false;
          noteEl.textContent = "";
          if (x.list) { const lt = pic(art, listId(x.list), "", `The List, ${x.list}`); if (lt) noteEl.appendChild(lt); }
          const sp = document.createElement("span"); sp.textContent = x.note; noteEl.appendChild(sp);
          if (x.list) {                                  // a step of the game's long puzzle
            found.add(x.list); shList.add(x.list); list.set(found, x.list);
            if (listBtn.hidden) { listBtn.hidden = false; if (!api.reducedMotion) listBtn.classList.add(P + "fresh"); later(() => { if (!over && turn) say(TEXT.listUnlock); }, 2600); }
          }
        } else if (seatItems.has(w)) {                   // the twist: it was said, in turn, and everyone heard it
          b.classList.add("bad");
          out(TEXT.seatChallenge, TEXT.end.seatLose(w));
        } else {
          warmth -= 1;
          b.classList.add("bad"); later(() => b.classList.remove("bad"), 500);
          say(TEXT.falseCh);
        }
        return;
      }
      if (w === turn.seq[turn.idx]) {
        turn.idx++; b.classList.add("used"); b.disabled = true; tamWord(w); paintProg();
        if (turn.idx >= chain.length) startAdding();
        return;
      }
      const x = ph(w);
      if (x && !x.used && !x.caught && turn.idx === (turn.back ? turn.seq.length - x.after : x.after)) {
        x.used = true; b.classList.add("used"); b.disabled = true; tamWord(w); say(TEXT.accepted(w));
        return;
      }
      b.classList.add("bad");                            // a wrong order loses the round
      const wanted = turn.seq[turn.idx];
      out(`"${w}"? Everyone laughs. Dell: "Out! Tam's out."`, TEXT.end.lose(w, wanted, phantoms.some((q) => q.caught)));
    }

    function startAdding() {
      turn.adding = true;
      noBtn.disabled = true; nbBtn.disabled = true;
      say(TEXT.addNow);
      tray.innerHTML = "";
      turn.pack.forEach((w) => tray.appendChild(tile(w, () => {
        tamWord(w); chain.push(w);
        say(turn.back ? TEXT.backDone : `You add ${w}.`);
        if (turn.back && !mistakes && api.shared) api.shared.set("backwards_lap_clean", true);
        tray.innerHTML = "";
        const d = turn.done; turn = null; paintProg();
        later(d, 900);
      })));
      paintProg();
      tray.querySelector("button")?.focus();
    }

    function challenge() {
      if (!turn || turn.adding || noBtn.hidden || noBtn.disabled) return;
      turn.challenge = !turn.challenge;
      noBtn.classList.toggle("on", turn.challenge);
      tray.classList.toggle("ch", turn.challenge);
      say(turn.challenge ? TEXT.challengeOn : TEXT.yourTurn);
    }
    // June's arm (stage 2) or the notebook (stage 3): the true chain, once, for five seconds.
    function notebook() {
      if (!turn || turn.adding || nbLeft <= 0 || nbBtn.hidden || nbShowing) return;
      nbLeft--; nbBtn.disabled = true; nbShowing = true;
      const keep = [...words.childNodes];
      words.innerHTML = ""; words.classList.add(CFG.peek === "arm" ? "arm" : "nb");
      chain.forEach((w, k) => { const sp = document.createElement("span"); sp.textContent = `${k + 1}. ${w}${seatItems.has(w) ? " (your hand, yesterday)" : ""}`; words.appendChild(sp); });
      say(CFG.peek === "arm" ? TEXT.armShow : seatItems.size ? TEXT.notebookSeat : TEXT.notebookShow);
      if (CFG.peek === "arm") {                          // phase 3: what channel two said first, at her wrist
        for (const n of [3, 2, 1]) { const sp = document.createElement("span"); sp.textContent = `${n}. ${LIST[n]}`; sp.style.color = "#5a2fa0"; words.appendChild(sp); }
        later(() => {
          if (over) return;
          say(TEXT.wrist);
          for (const n of [1, 2, 3]) { found.add(n); shList.add(n); }
          list.set(found, 1);
          noteEl.hidden = false; noteEl.textContent = "";
          const lt = pic(art, listId(1), "", "The List, 1"); if (lt) noteEl.appendChild(lt);
          const sp = document.createElement("span"); sp.textContent = TEXT.wristNote; noteEl.appendChild(sp);
          if (listBtn.hidden) listBtn.hidden = false;
        }, 2200);
      }
      later(() => { words.classList.remove("nb", "arm"); words.innerHTML = ""; keep.forEach((n) => words.appendChild(n)); nbShowing = false; }, 5000);
    }
    noBtn.addEventListener("click", challenge);
    nbBtn.addEventListener("click", notebook);
    const kd = (e) => {
      if (over || $(`.${P}intro`)) return;
      const k = e.key.toLowerCase();
      if (k === "escape" && list.isOpen) { list.close(); return; }
      if (k === "l" && !listBtn.hidden) { list.toggle(); return; }
      if (list.isOpen) return;
      if (k === "n") challenge();
      else if (k === "b" || k === "j") notebook();
    };
    window.addEventListener("keydown", kd);

    // ---- the three rounds ----
    // Phase 3: the seat's twentieth item, and the choice by the fire.
    function fireChoice(done) {
      light(null); say(TEXT.dellFire);
      tray.innerHTML = "";
      const mk = (label, cls, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = P + "tile " + P + cls; b.textContent = label; b.addEventListener("click", fn); tray.appendChild(b); return b; };
      const im = pic(art, "notebook-on-fire", "", "");
      const bb = mk(TEXT.burnBtn, "burn", () => {
        if (over) return;
        fire = "burn"; if (api.shared) api.shared.set("notebook_burned", true);
        tray.innerHTML = ""; say(TEXT.burnt);
        noteEl.hidden = false; noteEl.textContent = ""; const fi = pic(art, "notebook-on-fire", "", "The notebook on the fire"); if (fi) noteEl.appendChild(fi);
        const sp = document.createElement("span"); sp.textContent = "The List: on June's arm, and nowhere else."; noteEl.appendChild(sp);
        later(() => { roundOver(); }, 3600);
      });
      if (im) { bb.classList.add("art"); bb.prepend(im); }
      mk(TEXT.keepBtn, "keep", () => { if (over) return; fire = "keep"; tray.innerHTML = ""; later(done, 300); });
      tray.querySelector("button").focus();
    }
    let fire = "";

    function roundOver() {
      over = true;
      if (!mistakes) warmth += 1;
      api.store.set("losses", 0);
      const w = `${warmth}`, got = phantoms.filter((x) => x.caught).length, E = TEXT.end;
      let outcome = "win", text, how = "win";
      if (stage === 1) {
        const k = phantoms[0];
        outcome = k.caught ? "win" : "done"; how = k.caught ? "win" : k.used ? "accepted" : "missed";
        text = k.caught ? E.win(w) : k.used ? E.accepted(w) : E.missed(w);
      } else if (stage === 2) {
        outcome = got === 2 ? "win" : "done"; how = got === 2 ? "win" : got ? "missed" : "accepted";
        text = E.t2(got, w);
      } else {
        for (const n of [16, 7]) { found.add(n); shList.add(n); }
        list.set(found, 16);
        text = fire === "burn" ? E.t3burn(w) : fire === "keep" ? E.t3keep(w) : E.t3(w);
        if (fire === "burn") how = "burn";
      }
      later(() => { showResult(how); api.end({ outcome, text, advance: true, next: stage === 1 ? "June's house rule: the second lap goes backwards." : "Night 2. Seven seats, and one of them is empty." }); }, 1800);
    }
    const J = seat("June"), D = seat("Dell"), R = seat("Rafe"), I = seat("Inés"), A = seat("Abel"), S = seat("—");
    const SCRIPT = {
      1: [(n) => recite(J, { add: "a tarp", voice: again }, n), (n) => recite(D, { add: "marshmallows", voice: again }, n), (n) => recite(R, { slip: phantoms[0], add: "rope", voice: again }, n),
        (n) => recite(I, { add: "a tin cup", voice: again }, n), (n) => tamTurn({ pack: TAM_PACK[0] }, n), (n) => recite(J, { stopAt: 3, outLine: TEXT.juneOut }, n)],
      2: [(n) => { say(TEXT.lap1); later(n, 2200); }, (n) => recite(J, { back: true, voice: true, add: "tent pegs", then: TEXT.voice }, n),
        (n) => recite(D, { back: true, slip: phantoms[0], add: "foil" }, n), (n) => recite(I, { back: true, slip: phantoms[1], add: "a sun hat" }, n),
        (n) => tamTurn({ back: true, pack: TAM_PACK[1] }, n), (n) => recite(J, { stopAt: 5, outLine: TEXT.juneOut }, n)],
      3: [(n) => recite(J, { add: "tent pegs" }, n), (n) => recite(A, { add: "Nell's telephone number", addLine: TEXT.abelAdds }, n),
        (n) => recite(S, { nobody: true, add: "the tall cedar", addLine: TEXT.seatAdds }, n), (n) => tamTurn({ pack: TAM_PACK[0], line: TEXT.seatYourTurn }, n),
        (n) => recite(S, { nobody: true, fast: true, add: "the owl box", addLine: TEXT.seatAdds2 }, n), (n) => tamTurn({ pack: TAM_PACK[1], line: TEXT.seatYourTurn2 }, n),
        (n) => recite(S, { nobody: true, fast: !fed, add: "a notebook", addLine: fed ? TEXT.seatAdds3fed : TEXT.seatAdds3 }, n),
        (n) => fireChoice(n), (n) => tamTurn({ pack: ["a pocket knife", "a blanket"], line: TEXT.keepTurn }, n),
        (n) => recite(D, { stopAt: 4, outLine: TEXT.dellOut }, n)],
    }[stage];
    if (stage === 1 && again) { SCRIPT[0] = ((f) => (n) => { say(TEXT.again); later(() => f(n), 2600); })(SCRIPT[0]); }
    function run(k) {
      if (over) return;
      if (k >= SCRIPT.length) { roundOver(); return; }
      SCRIPT[k](() => run(k + 1));
    }

    // The card behind the result: what the List holds now (or the kettle, packed), over the night's card.
    function showResult(how) {
      list.close();
      const night = stage === 3 ? "night-2" : "night-1";
      const got = phantoms.find((x) => x.caught && x.list);
      const first = how === "burn" ? "notebook-on-fire" : stage === 3 && how !== "lose" ? "list-16" : got ? listId(got.list) : how === "lose" ? night : stage === 1 ? "item-kettle" : "item-puddle";
      resultCard(wrap, art, {
        cards: [first, night].filter((v, i, a) => a.indexOf(v) === i),
        lost: { win: 0, missed: 1, accepted: 2, lose: 3, burn: 5 }[how],
        caption: how === "burn" ? "The notebook, on the fire. The List is on June's arm." : stage === 3 && how !== "lose" ? `The List, 16 and 7: ${LIST[16]}, ${LIST[7]}.` : got ? `The List, ${got.list}: ${LIST[got.list]}.` : "", reducedMotion: api.reducedMotion,
      });
    }

    const go = $(`.${P}card>button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); light(null); say(TEXT.open[stage - 1]); later(() => run(0), 1800); });
    go.focus();

    return {
      unmount() { over = true; timers.forEach(clearTimeout); window.removeEventListener("keydown", kd); },
    };
  }
}

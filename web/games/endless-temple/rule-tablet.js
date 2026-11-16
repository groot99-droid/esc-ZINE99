// The Endless Temple / The Rule Tablet (1D, logic loophole). Style: Cuneiform clay tablet.
// DESIGN.md section 11, The Rule Tablet, played as two appearances in one sitting:
//   g_tablet_c2, the shrine-store (the tutorial), then g_tablet_c6, the gods' rules (the hardest).
// Rules, key-word meanings, Ways, solutions and the watchers' rules are the design's
// (games/endless-temple/data/tablets.json). Two lines are the source's own, verbatim, from
// creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md (DESIGN.md
// section 3): rule 1 of the gods' tablet, and beat 18, "They had rules for everything, and it was
// stifling." Every other line of narration here is added for the game (listed in LINES below).
//
// Actions: arrange Ways in the plan row; read a key word (its meaning); Test the plan (each failed
// Test draws the watcher's eye: +20 scrutiny, and at 100 he carves a rule that closes the gap);
// Break (unlocked after the first Test): go on anyway, and the broken rule is remembered.
// Win: the gods' loophole. Lose: break the gods' rules. The shrine-store result colours the ending.
// Art (api.art): each tablet's drawn face on its opening card and on the result, the chapter
// headings, and the watcher's shadow (figures/watcher-c2, -c6) falling across the tablet's edge as
// scrutiny rises. The CSS shadow stays as the fallback.
// Phase 2 (DEEP_DIVE.md section 3, The Rule Tablet): a ladder of three tablets. Teach: meanings (the
// shrine-store). Test: a price, "or" (the gods' rules). Twist: rules have ages and authors: the gods'
// tablet again, the watcher's rule already on it in fresh clay, so the plan that held before is caught.
// Fresh clay: Cite (C) an older rule against a newer one it contradicts, and the newer is set aside.
// The set-piece: the wedges of "We do not ride on the backs of the gods" are sharp where every other
// rule is worn. Answer the watcher: if The Well-Post was seen (the shrine-store left clean), the
// watcher's shadow withdraws once. The Keeper's Binding (g_tablet_c8) is phase 3 and is not here.

const SOURCE_RULES_LINE = "They had rules for everything, and it was stifling.";

// Narration written for the game (not quotations).
const LINES = {
  c2open: "The lizard clan's village, the night Xandri means to leave. His father's leaf-cord and waterskin are in the shrine-store, and the shamans keep the store.",
  c2eye: "A shaman leans on his cane by the well-post, watching the store.",
  c2win: "The cord and the skin come out through the roof-gap at dusk, claimed for his father's house. No rule is broken.",
  c2break: "He takes his father's things, and the clan will remember how.",
  bridge: "Days later, at the edge of the sand sea, the herd passes. The shamans' second tablet is longer.",
  c6open: "The Xandrixes are moving toward the end. Xandri wants to go with them, and every rule of the gods stands in his way.",
  c6eye: "A shadow lies across the tablet's edge. Someone has seen him testing the gods' rules.",
  watcherCarves: "The watcher carves a new rule at the foot of the tablet. The clean way is closed; only Break remains for that plan.",
  c6win: "The leaves, not his foot, press the track; and “or is named lost” is a price he can pay.",
  endWinBoth: "Two tablets, and not one rule broken. Xandri walks behind the gods in their own track, wearing the Zorlop leaves, and lets the clan name him lost.",
  endWinMixed: "Xandri follows the gods' track cleanly, in the Zorlop leaves, named lost by his own choice. Only the shrine-store remembers a rule he broke.",
  endLose: "Xandri goes after the herd, but not cleanly. The broken rule is written down, and the loophole stays unfound.",
  gentle: "The clay is softer this time: the tablet shows its hints sooner.",
  // phase 2
  wellPost: "At the well-post the old shaman with the cane sees an arm go in at the roof-gap, and looks at the moon instead. Then he goes inside and restrings a second leaf-cord.",
  wellPostNote: "The Well-Post. Nobody speaks.",
  twistBridge: "The tablet again, by daylight. Someone has been at it: a ninth rule stands at its foot, and the clay there is still dark.",
  twistOpen: "The plan that held last night is caught now. But clay has an age: run a thumb over the wedge marks. An older rule can be cited against a newer one it contradicts.",
  feelWorn: "Rule {n}: the wedges are worn round. This clay is as old as the tablet.",
  feelFresh9: "Rule 9: the wedges are sharp and the clay is dark. Carved this season, by whoever watches.",
  feelFresh1: "Rule 1: every other rule on the tablet is worn, and these wedges are sharp. It was carved after the rest, by a careful hand.",
  citePick: "Cite: tap the older rule first, then the newer one it contradicts.",
  citeOk: "<b>Rule 9 is set aside.</b> The old clay sends the clan to sleep where the gods have slept, and nobody can lie down there without following where a god has gone. The older rule stands.",
  citeNotOlder: "That clay is no older than the rule it is cited against. Only an older rule can be cited.",
  citeNotFresh: "That rule is as old as the tablet. Nothing on it is old enough to set it aside.",
  citeRule1: "No older rule quarrels with rule 1: rule 3 says the same thing with a hand. It stands, late as it is.",
  citeMiss: "Rule {a} says nothing about where a god has gone. The citation fails, and the watcher has heard it.",
  answered: "The shadow at the tablet's edge draws back. He has let this boy go once before.",
  answeredLink: "Because the shrine-store was left clean and the well-post seen, the watcher's shadow withdraws once.",
  taken: "The shadow covers the tablet. The watcher has heard enough testing, and carries it indoors.",
  twistWin: "Rule 8 against rule 9; the leaves against rule 5; “or is named lost” against rule 7. Xandri walks behind the gods in their own track, and the fresh clay at the foot of the tablet means nothing.",
  stop1Clean: "The shrine-store, left clean: his father's leaf-cord and waterskin, and no rule broken. The gods' tablet waits at the edge of the sand sea.",
  stop1Broken: "His father's things are in his pack, and a rule is written down against him. The gods' tablet waits at the edge of the sand sea.",
};
const STAGE_NAMES = ["Teach: meanings", "Test: a price", "Twist: ages and authors"];

const TABLETS = [
  {
    id: "c2", name: "The shrine-store", who: "a shaman",
    want: "Take my father's leaf-cord and waterskin from the shrine-store.",
    open: LINES.c2open, eye: LINES.c2eye, win: LINES.c2win,
    rules: [
      { n: 1, parts: ["No one ", { k: "enters", m: "passes the threshold with both feet" }, " the shrine-store but a shaman."] },
      { n: 2, parts: ["Nothing is taken from the shrine-store by ", { k: "night", m: "after the moon clears the well-post" }, "."] },
      { n: 3, parts: ["The belongings of ", { k: "the dead", m: "one who has no house to speak for him" }, " are kept for the gods."] },
      { n: 4, parts: ["A son ", { c: "speaks" }, " for his father's house."] },
    ],
    watcher: { n: 5, parts: ["No hand ", { c: "reaches" }, " into the shrine-store but a shaman's."], watcher: true },
    ways: [["enter", "Enter the store"], ["reach", "Reach through the roof-gap"], ["dawn", "Wait for dawn"], ["dusk", "Go at dusk"], ["claim", "Claim them for my father's house"], ["ask", "Ask a shaman"]],
    hintWord: "the dead", hintWay: "claim",
    judge(plan, watcher) {
      const has = (w) => plan.includes(w);
      const broken = []; let want = true, wantWhy = "";
      const means = has("enter") || has("reach");
      if (has("enter")) broken.push({ n: 1, word: "enters", why: "Both feet over the threshold is entering." });
      if (means && !has("dusk") && !has("dawn")) broken.push({ n: 2, word: "night", why: "With no hour named, he goes when the village sleeps, after the moon clears the well-post." });
      if (means && !has("claim")) broken.push({ n: 3, word: "the dead", why: "With no house speaking for him, his father is one of the dead, and his things are the gods'." });
      if (watcher && has("reach")) broken.push({ n: 5, word: "reaches", why: "The watcher's rule forbids the roof-gap itself." });
      if (has("ask")) { want = false; wantWhy = "The shaman says the store keeps what it keeps. Nothing comes out."; }
      else if (!means) { want = false; wantWhy = "Nothing in this plan reaches the shelf."; }
      else if (has("dawn")) { want = false; wantWhy = "Dawn is too late: he leaves tonight."; }
      return { broken, want, wantWhy };
    },
  },
  {
    id: "c6", name: "The gods' rules", who: "a shaman",
    want: "Go where the Xandrixes go, toward the end.",
    open: LINES.c6open, eye: LINES.c6eye, win: LINES.c6win,
    rules: [
      { n: 1, parts: ["We do not ", { c: "ride" }, " on the backs of the gods."], source: true },
      { n: 2, parts: ["No one walks ", { k: "before", m: "ahead of, in its path" }, " a god."] },
      { n: 3, parts: ["No hand ", { c: "touches" }, " a god."] },
      { n: 4, parts: ["The sand of the deep belongs to the gods; no one ", { c: "takes" }, " from it."] },
      { n: 5, parts: ["What the gods leave behind is holy and may not be ", { k: "trodden", m: "pressed by a foot of the clan" }, "."] },
      { n: 6, parts: ["The holy is not ", { c: "carried away" }, "."] },
      { n: 7, parts: ["A son of the clan ", { c: "returns" }, " by the third moon, ", { k: "or is named lost", m: "a price, not a ban" }, "."] },
      { n: 8, parts: ["No one ", { c: "sleeps" }, " where the gods have not slept."] },
    ],
    watcher: { n: 9, parts: ["No one ", { c: "follows" }, " where a god has gone."], watcher: true },
    ways: [["climb_xandrix", "Climb onto a Xandrix"], ["walk_ahead", "Walk ahead to scout"], ["follow_track", "Follow in their track"], ["wear_leaves", "Wear the Zorlop leaves"], ["walk_beside", "Walk beside the herd"], ["carry_scale", "Carry a shed scale as a guide"], ["sleep_in_track", "Sleep in their track"], ["return_third_moon", "Return by the third moon"], ["accept_named_lost", "Accept being named lost"]],
    hintWord: "trodden", hintWay: "wear_leaves",
    judge(plan, watcher) {
      const has = (w) => plan.includes(w);
      const broken = []; let want = true, wantWhy = "";
      const moving = has("follow_track") || has("climb_xandrix") || has("walk_ahead");
      if (has("climb_xandrix")) { broken.push({ n: 1, word: "ride", why: "On a Xandrix's back is riding it." }); broken.push({ n: 3, word: "touches", why: "Climbing is a hand on a god." }); }
      if (has("walk_ahead")) broken.push({ n: 2, word: "before", why: "Ahead of the herd is in its path." });
      if (has("follow_track") && !has("wear_leaves")) broken.push({ n: 5, word: "trodden", why: "The track is what the gods leave behind, and his bare foot would press it." });
      if (has("carry_scale")) broken.push({ n: 6, word: "carried away", why: "A shed scale is holy, and he would carry it off." });
      if (has("sleep_in_track")) broken.push({ n: 8, word: "sleeps", why: "The herd never stops in its track to sleep." });
      if (watcher && has("follow_track")) broken.push({ n: 9, word: "follows", why: "The watcher's rule forbids the track itself." });
      if (moving && !has("return_third_moon") && !has("accept_named_lost")) broken.push({ n: 7, word: "returns", why: "He would not return by the third moon, and has not accepted the other half of the rule." });
      if (has("walk_beside")) { want = false; wantWhy = "Beside the herd the waves still break: he would be swallowed."; }
      else if (!moving) { want = false; wantWhy = "Nothing in this plan moves him toward the end."; }
      else if (has("walk_ahead") && !has("wear_leaves") && !has("follow_track") && !has("climb_xandrix")) { want = false; wantWhy = "Out on the open waves without the leaves, he would be swallowed."; }
      else if (has("return_third_moon")) { want = false; wantWhy = "Turned home by the third moon, he never goes where they go."; }
      return { broken, want, wantWhy };
    },
  },
];
// The twist: the same clay, read by age. Rule 1 and the watcher's rule 9 are fresh; rule 9 is on the tablet from the start.
TABLETS.push({
  ...TABLETS[1], id: "c6b", name: "The gods' rules, by age", twist: true,
  open: LINES.twistBridge + " " + LINES.twistOpen, win: LINES.twistWin,
  fresh: [1, 9], cite: [8, 9],
});

// n wedge marks (a vertical wedge = a triangle head and a tail)
function wedges(n, x0, y0, s) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const row = i < 5 ? 0 : 1, col = i < 5 ? i : i - 5;
    const x = x0 + col * s * 0.9, y = y0 + row * s * 1.5;
    d += `<path d="M${x - s * 0.35} ${y} L${x + s * 0.35} ${y} L${x} ${y + s * 0.55} Z" /><path d="M${x} ${y + s * 0.4} L${x} ${y + s * 1.25}" stroke-width="${s * 0.14}"/>`;
  }
  return d;
}
// a horizontal wedge, used as a bullet in the legend
const WEDGE = `<svg viewBox="0 0 22 12" width="22" height="12" aria-hidden="true"><path d="M1 1 L1 11 L8 6Z"/><path d="M6 6 L21 6" stroke-width="2"/></svg>`;

export default {
  mount(root, api) {
    const P = "endless-temple-rule-tablet-";
    const clay = { hi: "#dcb683", mid: "#c08a55", lo: "#8f5f35", ink: "#3d2412", dark: "#1d140d", red: "#a3271a", cream: "#f3ead2", gold: "#f0b36a" };
    const timers = [];
    const art = api.art || { has: () => false, url: () => "", info: () => null };
    const pic = (id, cls, alt = "") => (art.has(id) ? `<img class="${P}${cls}" src="${art.url(id)}" alt="${alt}" draggable="false">` : "");
    const FACE = { c2: "tablet-c2-shrine-store", c6: "tablet-c6-gods-rules", c6b: "tablet-c6-gods-rules" }, HEAD = { c2: "heading-c2", c6: "heading-c6", c6b: "heading-c6" }, WATCH = { c2: "watcher-c2", c6: "watcher-c6", c6b: "watcher-c6" };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const reached = Math.max(0, Math.min(2, api.store.get("stage", 0) | 0));
    const rm = api.reducedMotion;
    const losses = api.store.get("lossStreak", 0);
    const gentle = losses >= 2;
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:radial-gradient(120% 100% at 50% 0%,#33251a,#140e09);color:${clay.cream};font-family:'EB Garamond',Georgia,serif;font-size:16px}
    .${P}wrap{max-width:1180px;margin:0 auto;padding:14px 16px 120px;display:grid;grid-template-columns:minmax(0,1fr) 230px;grid-template-areas:"head head" "tab side" "lower lower";gap:14px 18px}
    @media (max-width:820px){.${P}wrap{grid-template-columns:1fr;grid-template-areas:"head" "side" "tab" "lower"}}
    .${P}head{grid-area:head;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px}
    .${P}head h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,30px);color:${clay.gold}}
    .${P}head span{font-variant:small-caps;letter-spacing:.14em;font-size:14px;opacity:.85}
    .${P}beat{grid-area:auto;margin:0;font-style:italic;font-size:16px;line-height:1.4;color:#eadbbd;flex-basis:100%;max-width:70ch}
    .${P}tab{grid-area:tab;position:relative;border-radius:26px;padding:16px 14px 18px;background:
      radial-gradient(140% 90% at 30% 10%,${clay.hi},${clay.mid} 55%,${clay.lo});box-shadow:inset 0 2px 0 rgba(255,240,210,.5),inset 0 -6px 14px rgba(60,30,10,.45),0 14px 30px rgba(0,0,0,.6);color:${clay.ink};overflow:hidden}
    .${P}tab::before{content:"";position:absolute;inset:0;opacity:.4;pointer-events:none;background-image:radial-gradient(rgba(70,40,20,.5) 1px,transparent 1.4px),radial-gradient(rgba(255,240,210,.4) 1px,transparent 1.4px),repeating-linear-gradient(17deg,transparent 0 40px,rgba(80,45,20,.12) 40px 41px);background-size:7px 7px,11px 11px,auto;background-position:0 0,3px 5px,0 0}
    .${P}tab.${P}shake{animation:${P}shake .45s}
    @keyframes ${P}shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    .${P}tab.${P}glow{box-shadow:0 0 0 3px ${clay.gold},0 0 40px rgba(240,179,106,.7),inset 0 -6px 14px rgba(60,30,10,.45)}
    .${P}shadow{position:absolute;inset:0;pointer-events:none;background:linear-gradient(270deg,rgba(15,8,4,.8),rgba(15,8,4,0) 50%);opacity:0;transition:opacity .8s}
    .${P}watch{position:absolute;right:0;top:0;height:100%;width:min(36%,300px);object-fit:cover;object-position:right center;pointer-events:none;opacity:0;transition:opacity .8s;mix-blend-mode:multiply;-webkit-mask-image:linear-gradient(to left,#000 45%,transparent);mask-image:linear-gradient(to left,#000 45%,transparent)}
    .${P}card2 img.${P}hd{display:block;width:100%;height:auto;border-radius:3px;margin:0 0 10px}
    .${P}card2 img.${P}face{float:right;width:112px;height:auto;margin:0 0 8px 12px;border-radius:6px;box-shadow:0 4px 10px rgba(40,20,8,.5)}
    .${P}card2 img.${P}bigface{display:block;width:min(240px,60%);height:auto;margin:0 auto 10px;border-radius:8px;box-shadow:0 6px 14px rgba(40,20,8,.55)}
    .${P}endc{position:absolute;inset:0;z-index:6;display:grid;place-items:center;background:rgba(10,6,3,.84);padding:16px 16px 170px;box-sizing:border-box;overflow:auto}
    .${P}endc figure{margin:0;text-align:center;color:${clay.cream};font-family:'IM Fell English',Georgia,serif;font-size:22px}
    .${P}endc img{display:block;width:min(250px,60vw);height:auto;margin:0 auto 10px;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.7)}
    .${P}endc.${P}lost img{filter:grayscale(.7) brightness(.8)}
    .${P}reg{position:relative;display:grid;grid-template-columns:48px 1fr;gap:8px;align-items:center;padding:8px 4px;border-bottom:2px solid rgba(90,55,25,.45);box-shadow:0 1px 0 rgba(255,235,200,.45)}
    .${P}reg:last-child{border-bottom:0;box-shadow:none}
    .${P}reg svg{width:44px;height:28px;fill:${clay.ink};stroke:${clay.ink}}
    .${P}txt{font-size:clamp(16px,1.7vw,19px);line-height:1.3;text-shadow:0 1px 0 rgba(255,236,200,.55),0 -1px 0 rgba(60,30,10,.35)}
    .${P}reg.${P}lit{background:rgba(255,214,140,.6);border-radius:6px}
    .${P}reg.${P}new{animation:${P}carve 1.2s ease-out}
    @keyframes ${P}carve{from{background:rgba(29,20,13,.5);clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
    .${P}reg.${P}new .${P}txt{font-style:italic}
    .${P}reg svg{cursor:pointer;border-radius:6px}
    .${P}reg svg:hover,.${P}reg svg:focus-visible{background:rgba(255,240,200,.5);outline:none}
    .${P}aged .${P}reg svg{opacity:.38;filter:blur(.5px)}
    .${P}aged .${P}reg.${P}fresh svg{opacity:1;filter:none}
    .${P}aged .${P}reg.${P}fresh{background:rgba(70,40,20,.16);border-radius:6px}
    .${P}reg.${P}aside .${P}txt{text-decoration:line-through;opacity:.55}
    .${P}citing .${P}reg{cursor:pointer}
    .${P}citing .${P}reg:hover{background:rgba(255,214,140,.35)}
    .${P}reg.${P}cited{outline:3px solid ${clay.red};outline-offset:-2px;border-radius:6px}
    .${P}stone.${P}cite{background:radial-gradient(circle at 35% 30%,#f3e2b8,#c9a25e 70%,#8a6a34)}
    .${P}start{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}
    .${P}start button{font:inherit;font-size:14px;color:${clay.ink};background:transparent;border:1.5px solid ${clay.ink};border-radius:18px;padding:5px 10px;cursor:pointer;min-height:38px}
    .${P}start button[aria-pressed=true]{background:${clay.ink};color:${clay.cream}}
    .${P}go.${P}alt{background:transparent;color:${clay.ink}}
    .${P}link{font-size:15px;font-style:italic;border:1px dashed ${clay.gold};border-radius:6px;padding:4px 8px;color:${clay.gold};flex-basis:100%;max-width:70ch;margin:0}
    .${P}link[hidden]{display:none}
    .${P}card2 img.${P}wp{float:right;width:96px;height:auto;margin:0 0 8px 12px;border-radius:6px;mix-blend-mode:multiply}
    .${P}src{font-size:13px;font-style:italic;opacity:.8;margin-left:6px}
    .${P}kw{font:inherit;color:inherit;background:none;border:0;padding:0 1px;cursor:pointer;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;border-radius:3px}
    .${P}kw:hover,.${P}kw:focus-visible{background:rgba(255,240,200,.6);outline:none}
    .${P}kw.${P}read{text-decoration-style:double}
    .${P}catch{text-decoration:underline wavy ${clay.red} 2px;text-underline-offset:4px;color:${clay.red};font-weight:600}
    .${P}pulse{animation:${P}p 1s ease-in-out infinite alternate}
    @keyframes ${P}p{from{box-shadow:0 0 0 0 rgba(255,230,160,0)}to{box-shadow:0 0 0 4px rgba(255,230,160,.95)}}
    .${P}gloss{min-height:1.5em;margin:10px 4px 0;font-style:italic;font-size:16px;color:${clay.ink};position:relative}
    .${P}side{grid-area:side;display:flex;flex-direction:column;gap:14px}
    .${P}card{background:linear-gradient(${clay.hi},${clay.mid});color:${clay.ink};border-radius:14px;padding:10px 12px;box-shadow:inset 0 -3px 6px rgba(60,30,10,.4);font-size:16px;line-height:1.3;transition:filter .4s}
    .${P}card small{display:block;font-variant:small-caps;letter-spacing:.14em;font-size:14px}
    .${P}card.${P}grey{filter:grayscale(1) brightness(.7)}
    .${P}stones{display:flex;gap:14px;justify-content:center}
    .${P}stone{font:inherit;width:88px;height:88px;border-radius:50% 46% 52% 48%;border:0;cursor:pointer;font-variant:small-caps;letter-spacing:.12em;font-size:17px;font-weight:600;color:#1d1a17;background:radial-gradient(circle at 35% 30%,#ecebe6,#a4a29b 70%,#6d6b66);box-shadow:0 6px 12px rgba(0,0,0,.5);transition:transform .12s}
    .${P}stone small{display:block;font-size:12px;letter-spacing:.06em;font-weight:400;font-variant:normal}
    .${P}stone:hover:not(:disabled),.${P}stone:focus-visible{transform:translateY(-3px);outline:2px solid ${clay.gold};outline-offset:3px}
    .${P}stone.${P}brk{background:radial-gradient(circle at 35% 30%,#d9c3bd,#8d6a63 70%,#5b3f39);color:#fff4ee}
    .${P}stone:disabled{opacity:.35;cursor:not-allowed}
    .${P}stone[hidden]{display:none}
    .${P}eye{font-size:14px;font-variant:small-caps;letter-spacing:.12em}
    .${P}pips{display:flex;gap:6px;margin-top:4px}
    .${P}pips i{flex:1;height:12px;border-radius:6px;background:rgba(243,234,210,.16);border:1px solid rgba(243,234,210,.35);transition:background .4s}
    .${P}pips i.${P}on{background:${clay.red};border-color:#e07060}
    .${P}lower{grid-area:lower}
    .${P}lower h3{margin:0 0 6px;font-variant:small-caps;letter-spacing:.14em;font-weight:600;font-size:14px;color:${clay.gold}}
    .${P}plan{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
    .${P}slot{font:inherit;min-height:58px;border-radius:12px;border:2px dashed rgba(216,176,122,.6);background:rgba(216,176,122,.08);color:#e9d8b5;cursor:pointer;padding:6px;font-size:15px}
    .${P}slot.${P}full{border-style:solid;border-color:${clay.lo};background:linear-gradient(${clay.hi},${clay.mid});color:${clay.ink}}
    .${P}slot.${P}full:hover{filter:brightness(1.08)}
    .${P}tray{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}
    .${P}way{font:inherit;font-size:15px;line-height:1.2;min-height:48px;border-radius:12px;border:0;cursor:pointer;color:${clay.ink};background:linear-gradient(${clay.hi},${clay.mid});box-shadow:inset 0 -3px 6px rgba(60,30,10,.4),0 3px 6px rgba(0,0,0,.4);padding:6px 8px;transition:transform .12s,opacity .2s}
    .${P}way:hover:not([aria-pressed=true]),.${P}way:focus-visible{transform:translateY(-2px);outline:2px solid ${clay.gold};outline-offset:2px}
    .${P}way[aria-pressed=true]{opacity:.35}
    .${P}way b{font-size:12px;opacity:.7;margin-right:4px}
    .${P}msg{margin:12px 2px 0;min-height:3em;font-size:16px;line-height:1.4}
    .${P}msg b{color:${clay.gold}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,6,3,.72);z-index:5;padding:16px;overflow:auto}
    .${P}card2{max-width:440px;border-radius:28px 22px 30px 24px;padding:22px 24px 20px;color:${clay.ink};background:radial-gradient(140% 90% at 30% 10%,${clay.hi},${clay.mid} 60%,${clay.lo});box-shadow:inset 0 2px 0 rgba(255,240,210,.5),inset 0 -6px 14px rgba(60,30,10,.45),0 18px 40px rgba(0,0,0,.6);position:relative}
    .${P}card2 h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:28px}
    .${P}card2 .${P}goal{margin:6px 0 10px;font-size:17px;border-bottom:2px solid rgba(90,55,25,.45);padding-bottom:10px}
    .${P}card2 ul{list-style:none;margin:0 0 14px;padding:0}
    .${P}card2 li{display:flex;gap:10px;align-items:baseline;font-size:16px;margin:6px 0;line-height:1.3}
    .${P}card2 li svg{flex:none;fill:${clay.ink};stroke:${clay.ink};position:relative;top:1px}
    .${P}card2 q{display:block;font-style:italic;font-size:15px;margin:0 0 10px;quotes:none}
    .${P}go{font:inherit;font-variant:small-caps;letter-spacing:.12em;font-size:18px;padding:8px 28px;border-radius:20px;border:2px solid ${clay.ink};background:${clay.ink};color:${clay.cream};cursor:pointer}
    .${P}go:hover,.${P}go:focus-visible{background:#5a3519;outline:2px solid ${clay.cream};outline-offset:2px}
    @media (prefers-reduced-motion:reduce){.${P}pulse,.${P}tab.${P}shake,.${P}reg.${P}new{animation:none}.${P}pulse{box-shadow:0 0 0 4px rgba(255,230,160,.95)}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}wrap">
        <header class="${P}head"><h2 class="${P}title"></h2><span class="${P}count"></span><p class="${P}beat" aria-live="polite"></p><p class="${P}link" hidden></p></header>
        <section class="${P}tab" aria-label="The tablet"><div class="${P}regs"></div><div class="${P}gloss" aria-live="polite">Tap an underlined word to read what it means.</div><div class="${P}shadow"></div><img class="${P}watch" alt="" hidden></section>
        <aside class="${P}side">
          <div class="${P}card ${P}want"><small>The Want</small><span class="${P}wanttext"></span></div>
          <div class="${P}stones"><button type="button" class="${P}stone ${P}test">Test<small>T</small></button><button type="button" class="${P}stone ${P}cite" hidden>Cite<small>C</small></button><button type="button" class="${P}stone ${P}brk" hidden>Break<small>B</small></button></div>
          <div class="${P}eye"><span class="${P}eyelabel">The watcher's eye</span><div class="${P}pips"><i></i><i></i><i></i><i></i><i></i></div></div>
        </aside>
        <section class="${P}lower" aria-label="Your plan">
          <h3>The plan row (up to three Ways)</h3>
          <div class="${P}plan"></div>
          <h3>The Ways</h3>
          <div class="${P}tray"></div>
          <p class="${P}msg" aria-live="polite"></p>
        </section>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let ti = 0, T = TABLETS[0];
    let plan = [], scrutiny = 0, fails = 0, watcher = false, over = false, busy = false, lit = null, carved = false, tested = false;
    const read = new Set();
    const results = [];        // per tablet: "loophole" | "broken"
    let aside = false, citing = false, citeOld = null, answerLeft = 0, felt = new Set();
    const regs = q("regs"), gloss = q("gloss"), msg = q("msg");
    const hintAt = gentle ? [1, 2] : [2, 4];

    function setTablet(i) {
      ti = i; T = TABLETS[i];
      plan = []; scrutiny = 0; fails = 0; watcher = !!T.twist; lit = null; carved = false; busy = false; read.clear();
      aside = false; citing = false; citeOld = null; felt = new Set(); tested = !!T.twist || tested;
      answerLeft = T.twist && shared.get("well_post_seen", false) ? 1 : 0;
      q("cite").hidden = !T.twist; q("tab").classList.toggle(P + "aged", !!T.twist); q("link").hidden = true;
      api.store.set("stage", Math.max(reached, api.store.get("stage", 0) | 0, i));
      q("title").textContent = T.name;
      q("count").textContent = `${STAGE_NAMES[i]} · tablet ${i + 1} of ${TABLETS.length} · watched by ${T.who}`;
      q("beat").textContent = T.open;
      q("wanttext").textContent = T.want;
      gloss.textContent = "Tap an underlined word to read what it means.";
      msg.innerHTML = i === 0 ? "Tap a Way to put it in the plan row, then <b>Test</b> it on the tablet." : i === 1 ? "The same hands, a harder tablet. Read the words before you test." : "Tap a rule's wedge marks to feel its clay. <b>Cite</b> (C) an older rule against a newer one.";
      refresh();
    }

    function drawRules() {
      regs.innerHTML = "";
      const list = watcher || aside ? [...T.rules, T.watcher] : T.rules;
      q("tab").classList.toggle(P + "citing", citing);
      for (const r of list) {
        const row = document.createElement("div");
        const isFresh = T.twist && T.fresh.includes(r.n);
        row.className = P + "reg" + (r.watcher && carved ? " " + P + "new" : "") + (isFresh ? " " + P + "fresh" : "") + (r.watcher && aside ? " " + P + "aside" : "") + (citing && citeOld === r.n ? " " + P + "cited" : "");
        row.dataset.n = r.n;
        if (T.twist) row.addEventListener("click", (e) => { if (citing && !e.target.closest("button")) citeTap(r.n); });
        const hit = lit && lit.find((b) => b.n === r.n);
        if (hit) row.classList.add(P + "lit");
        row.innerHTML = `<svg viewBox="0 0 44 28" role="button" tabindex="0" aria-label="Rule ${r.n}: feel the clay">${wedges(r.n, 6, 2, 9)}</svg><div class="${P}txt"></div>`;
        const wsvg = row.querySelector("svg");
        const feel = (e) => { if (citing) return; e.stopPropagation(); feelClay(r.n); };
        wsvg.addEventListener("click", feel);
        wsvg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); feel(e); } });
        if (T.twist && fails >= hintAt[0] && r.n === T.cite[0] && !aside && !over) wsvg.classList.add(P + "pulse");
        const t = row.querySelector("." + P + "txt");
        for (const part of r.parts) {
          if (typeof part === "string") { t.append(part); continue; }
          const word = part.k || part.c;
          let node;
          if (part.k) {
            node = document.createElement("button");
            node.type = "button"; node.className = P + "kw" + (read.has(word) ? " " + P + "read" : ""); node.textContent = word;
            node.setAttribute("aria-label", `Read the meaning of “${word}”`);
            node.addEventListener("click", () => { read.add(word); gloss.textContent = `“${word}”, as the clan uses it: ${part.m}.`; node.classList.add(P + "read"); node.classList.remove(P + "pulse"); });
            if (fails >= hintAt[0] && word === T.hintWord && !over && !read.has(word)) node.classList.add(P + "pulse");
          } else {
            node = document.createElement("span"); node.textContent = word;
          }
          if (hit && hit.word === word) node.classList.add(P + "catch");
          t.append(node);
        }
        if (r.source) { const s = document.createElement("span"); s.className = P + "src"; s.textContent = "(the source's own words)"; t.append(s); }
        if (r.watcher) t.append(aside ? " (set aside by rule 8)" : " (carved by the watcher)");
        regs.appendChild(row);
      }
      carved = false;
      const lvl = scrutiny >= 100 ? 1 : scrutiny >= 60 ? 0.65 : scrutiny >= 40 ? 0.25 : 0;
      const wi = q("watch");
      if (art.has(WATCH[T.id])) {
        if (wi.dataset.id !== T.id) { wi.src = art.url(WATCH[T.id]); wi.dataset.id = T.id; wi.alt = `The shadow of ${T.who} on the tablet's edge.`; }
        wi.hidden = false; wi.style.opacity = lvl ? Math.min(0.92, lvl + 0.2) : 0; q("shadow").style.opacity = 0;
      } else { wi.hidden = true; q("shadow").style.opacity = lvl; }
      el.querySelectorAll("." + P + "pips i").forEach((p, i) => p.classList.toggle(P + "on", i < scrutiny / 20));
    }
    function drawPlan() {
      const pb = q("plan"); pb.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const w = plan[i];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "slot" + (w ? " " + P + "full" : "");
        b.textContent = w ? T.ways.find((x) => x[0] === w)[1] : `Way ${i + 1}`;
        b.setAttribute("aria-label", w ? `Take back: ${b.textContent}` : `Empty Way ${i + 1}`);
        b.addEventListener("click", () => { if (w && !over && !busy) { plan.splice(i, 1); lit = null; refresh(); } });
        pb.appendChild(b);
      }
      const tb = q("tray"); tb.innerHTML = "";
      T.ways.forEach(([id, text], k) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "way"; b.innerHTML = `<b>${k + 1}</b>`; b.append(text);
        b.setAttribute("aria-pressed", String(plan.includes(id)));
        if (fails >= hintAt[1] && id === T.hintWay && !plan.includes(id) && !over) b.classList.add(P + "pulse");
        b.addEventListener("click", () => toggleWay(id));
        tb.appendChild(b);
      });
      q("test").disabled = over || busy || !plan.length;
      q("brk").disabled = over || busy || !plan.length;
      q("brk").hidden = !tested;
      q("cite").disabled = over || busy || aside;
      q("cite").setAttribute("aria-pressed", String(citing));
    }
    // ---- phase 2: the age of the clay, and citing -------------------------------------------------
    function feelClay(n) {
      if (over || busy) return;
      felt.add(n);
      if (!T.twist) { gloss.textContent = `Rule ${n}: pressed in clay like the rest.`; return; }
      gloss.textContent = n === 9 ? LINES.feelFresh9 : n === 1 ? LINES.feelFresh1 : LINES.feelWorn.replace("{n}", n);
    }
    function citeToggle() {
      if (!T.twist || over || busy || aside) return;
      citing = !citing; citeOld = null;
      msg.innerHTML = citing ? LINES.citePick : "The citation is put away.";
      refresh();
    }
    function citeTap(n) {
      if (!citing || over || busy) return;
      if (citeOld == null) { citeOld = n; msg.innerHTML = `Rule ${n}, cited. Now tap the newer rule it contradicts.`; refresh(); return; }
      const a = citeOld, b = n;
      citing = false; citeOld = null;
      if (a === b) { msg.innerHTML = "The citation is put away."; refresh(); return; }
      if (a === T.cite[0] && b === T.cite[1]) {
        aside = true; watcher = false; lit = null;
        msg.innerHTML = LINES.citeOk; q("beat").textContent = "Rule 9 is set aside. The track is open to a careful foot again.";
        refresh(); flourish(P + "glow"); return;
      }
      let why;
      if (T.fresh.includes(a)) why = LINES.citeNotOlder;
      else if (!T.fresh.includes(b)) why = LINES.citeNotFresh;
      else if (b === 1) why = LINES.citeRule1;
      else why = LINES.citeMiss.replace("{a}", a);
      failed(why);
    }
    // a failed test or citation: the watcher's eye, unless he chooses not to see (The Well-Post)
    function failed(text) {
      fails++;
      if (answerLeft > 0) {
        answerLeft--;
        text += `<br><b>${LINES.answered}</b>`;
        const lk = q("link"); lk.textContent = LINES.answeredLink; lk.hidden = false;
      } else scrutiny = Math.min(100, scrutiny + 20);
      if (T.twist && scrutiny >= 100) {
        over = true; busy = true; results[ti] = "taken";
        msg.innerHTML = text + `<br><b>${LINES.taken}</b>`; q("beat").textContent = LINES.taken;
        refresh(); flourish(P + "shake"); next("The tablet is");
        return true;
      }
      if (T.twist && fails === hintAt[0]) text += "<br>One rule's wedge marks catch the light: an old one.";
      msg.innerHTML = text;
      refresh(); flourish(P + "shake");
      return false;
    }
    function toggleWay(id) {
      if (over || busy) return;
      if (plan.includes(id)) plan = plan.filter((x) => x !== id);
      else if (plan.length < 3) plan.push(id);
      else { msg.textContent = "The plan row holds three Ways. Tap one in the row to take it back."; return; }
      lit = null; refresh();
    }
    function refresh() { drawRules(); drawPlan(); q("want").classList.remove(P + "grey"); }
    function flourish(cls) {
      if (rm) return;
      const t = q("tab"); t.classList.remove(cls); void t.offsetWidth; t.classList.add(cls);
      timers.push(setTimeout(() => t.classList.remove(cls), 1200));
    }

    function test() {
      if (over || busy || !plan.length) return;
      const r = T.judge(plan, watcher);
      lit = r.broken;
      const firstTest = !tested; tested = true;
      if (!r.broken.length && r.want) { solved(); return; }
      if (T.twist) {
        let tx = "";
        if (r.broken.length) tx += r.broken.map((b) => `<b>Rule ${b.n}</b> catches on “${b.word}”. ${b.why}`).join("<br>");
        if (!r.want) tx += (tx ? "<br>" : "") + `<b>The Want greys:</b> ${r.wantWhy}`;
        if (r.broken.some((b) => b.n === 9)) tx += "<br>Rule 9 is new clay. Is there an older rule it contradicts?";
        failed(tx);
        if (!r.want) q("want").classList.add(P + "grey");
        return;
      }
      fails++;
      scrutiny = Math.min(100, scrutiny + 20);
      let text = "";
      if (r.broken.length) text += r.broken.map((b) => `<b>Rule ${b.n}</b> catches on “${b.word}”. ${b.why}`).join("<br>");
      if (!r.want) text += (text ? "<br>" : "") + `<b>The Want greys:</b> ${r.wantWhy}`;
      if (scrutiny >= 100 && !watcher) { watcher = true; carved = true; text += `<br><b>${LINES.watcherCarves}</b>`; q("beat").textContent = LINES.watcherCarves; }
      else if (scrutiny === 60) q("beat").textContent = T.eye;
      if (firstTest) text += "<br>Now the <b>Break</b> stone is in reach: go on anyway, and the broken rule is remembered.";
      if (fails === hintAt[0]) text += `<br>One word on the tablet catches the light.`;
      msg.innerHTML = text;
      refresh();
      if (!r.want) q("want").classList.add(P + "grey");
      flourish(P + "shake");
    }
    function solved() {
      over = true; busy = true; results[ti] = "loophole";
      drawRules(); drawPlan(); flourish(P + "glow");
      msg.innerHTML = `<b>The tablet holds.</b> ${T.win}`;
      next();
    }
    function brk() {
      if (over || busy || !plan.length) return;
      const r = T.judge(plan, watcher);
      if (!r.want) { lit = r.broken; refresh(); q("want").classList.add(P + "grey"); msg.innerHTML = `<b>Even broken, this plan fails the Want.</b> ${r.wantWhy}`; flourish(P + "shake"); return; }
      if (!r.broken.length) { msg.innerHTML = "This plan breaks nothing. Test it instead."; return; }
      over = true; busy = true; lit = r.broken; results[ti] = "broken";
      drawRules(); drawPlan();
      const nums = r.broken.map((b) => b.n);
      const ns = nums.length === 1 ? `Rule ${nums[0]} is` : `Rules ${nums.slice(0, -1).join(", ")} and ${nums[nums.length - 1]} are`;
      msg.innerHTML = `<b>Broken on purpose.</b> ${ns} written down against him. ${ti === 0 ? LINES.c2break : ""}`;
      if (ti === 0) shared.set("well_post_seen", false);
      next(ns);
    }
    function endCard(win, face, cap) {
      if (!art.has(face)) return;
      const c = document.createElement("div");
      c.className = P + "endc" + (win ? "" : " " + P + "lost");
      c.innerHTML = `<figure>${pic(face, "x", "The tablet.")}<div></div></figure>`;
      c.querySelector("div").textContent = cap;
      root.appendChild(c);
    }
    function finish(ns) {
      const last = results.length - 1;
      const win = results[last] === "loophole";
      api.store.set("lossStreak", win ? 0 : losses + 1);
      let text;
      if (last === 0) text = win ? LINES.stop1Clean : LINES.stop1Broken;
      else if (results[last] === "taken") text = LINES.taken + " The loophole stays unfound, and nothing is written against him but his own persistence.";
      else if (win && last === 2) text = LINES.twistWin + (results[0] === "broken" ? " Only the shrine-store remembers a rule he broke." : "");
      else if (win) text = results[0] === "loophole" || results[0] == null ? LINES.endWinBoth : LINES.endWinMixed;
      else text = `${LINES.endLose} ${ns} remembered.${results[0] === "loophole" ? " The shrine-store, at least, he left clean." : ""}`;
      endCard(win || last === 0, FACE[T.id], win ? "The tablet holds" : last === 0 ? "His father's things" : results[last] === "taken" ? "The tablet is taken indoors" : "A rule is written down against him");
      api.end({ outcome: win ? "win" : last === 0 ? "done" : "lose", text });
    }
    function next(ns) {
      timers.push(setTimeout(() => {
        const lostHere = ti > 0 && results[ti] !== "loophole";
        if (ti + 1 >= TABLETS.length || lostHere) { finish(ns); return; }
        const NT = TABLETS[ti + 1];
        const go = () => { over = false; el.scrollTop = 0; setTablet(ti + 1); q("beat").textContent = ti === 1 ? LINES.bridge + " " + LINES.c6open : T.open; };
        // the card between two tablets: go on, or stop here with a result
        const c = document.createElement("div");
        c.className = P + "intro";
        const well = ti === 0 && results[0] === "loophole";
        if (well) shared.set("well_post_seen", true);
        c.innerHTML = `<div class="${P}card2" role="dialog" aria-label="The next tablet">${pic(well ? HEAD.c2 : HEAD[NT.id], "hd")}
          ${well ? pic(WATCH.c2, "wp", "A shaman's shadow by the well-post.") : pic(FACE[NT.id], "bigface", "The gods' rules, pressed in clay.")}
          ${well ? `<p style="margin:0 0 4px;font-variant:small-caps;letter-spacing:.1em;font-size:14px"></p><p style="margin:0 0 10px;font-style:italic"></p>` : ""}
          <p class="${P}goal" style="border:0"></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="${P}go" data-a="go">Read the tablet</button><button type="button" class="${P}go ${P}alt" data-a="stop">Stop here</button></div></div>`;
        if (well) { const ps = c.querySelectorAll("p"); ps[0].textContent = LINES.wellPostNote; ps[1].textContent = LINES.wellPost; }
        c.querySelector("." + P + "goal").textContent = (ti === 0 ? LINES.bridge : LINES.twistBridge) + ` Next, ${STAGE_NAMES[ti + 1].toLowerCase()}.`;
        root.appendChild(c);
        const b = c.querySelector('[data-a="go"]');
        b.addEventListener("click", () => { c.remove(); go(); q("tray").querySelector("button")?.focus(); });
        c.querySelector('[data-a="stop"]').addEventListener("click", () => { c.remove(); finish(ns); });
        b.focus();
      }, rm ? 400 : 2400));
    }
    q("test").addEventListener("click", test);
    q("brk").addEventListener("click", brk);
    q("cite").addEventListener("click", citeToggle);
    const onKey = (e) => {
      if (root.querySelector("." + P + "intro") || over || busy) return;
      if (e.target && e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      const k = e.key.toLowerCase();
      if (citing && /^[1-9]$/.test(k)) citeTap(+k);
      else if (k === "c" && T.twist) citeToggle();
      else if (k === "escape" && citing) citeToggle();
      else if (k === "t") test();
      else if (k === "b" && tested) brk();
      else if (/^[1-9]$/.test(k) && T.ways[+k - 1]) toggleWay(T.ways[+k - 1][0]);
      else if (k === "backspace" && plan.length) { plan.pop(); lit = null; refresh(); }
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card2" role="dialog" aria-label="How to play">
      ${pic(HEAD.c2, "hd")}${pic(FACE.c2, "face", "The shrine-store tablet.")}
      <h2>The Rule Tablet</h2>
      <q>“${SOURCE_RULES_LINE}”</q>
      <p class="${P}goal"><b>Goal:</b> find a plan of Ways that gets what Xandri wants and breaks no rule, read word by word.</p>
      <ul>
        <li>${WEDGE}<span><b>Tap a Way</b> (or 1 to 9) to put it in the plan row.</span></li>
        <li>${WEDGE}<span><b>Tap an underlined word</b> to read what it really means.</span></li>
        <li>${WEDGE}<span><b>Test</b> (T). Each failed test draws the watcher's eye.</span></li>
        <li>${WEDGE}<span><b>Three tablets:</b> teach, test, twist. You can stop after any of them.</span></li>
      </ul>
      ${reached > 0 ? `<div class="${P}start" role="group" aria-label="Start at">${STAGE_NAMES.slice(0, reached + 1).map((n, k) => `<button type="button" data-s="${k}" aria-pressed="${k === 0}">${k + 1}. ${n.split(":")[0]}</button>`).join("")}</div>` : ""}
      ${gentle ? `<p style="font-style:italic;margin:0 0 12px">${LINES.gentle}</p>` : ""}
      <button type="button" class="${P}go">Begin</button></div>`;
    el.appendChild(intro);
    let startAt = 0;
    intro.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { startAt = +b.dataset.s; intro.querySelectorAll("[data-s]").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); }));
    intro.querySelector("." + P + "go").addEventListener("click", () => { intro.remove(); if (startAt) setTablet(startAt); q("tray").querySelector("button")?.focus(); });
    intro.querySelector("." + P + "go").focus();

    setTablet(0);
    return { unmount() { timers.forEach(clearTimeout); removeEventListener("keydown", onKey); } };
  },
};

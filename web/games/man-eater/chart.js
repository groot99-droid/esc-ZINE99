// Project: Man Eater — The Chart (1D, self-diagnosis). Graphic style: medical graph paper.
// DESIGN.md section 11.3, cut to four mornings (days 2 to 5) of one run: an eater who eats 3, 5, 6
// and 6 pieces and swallows the pill. Measurements use the formulas in 11.3. Each morning asks one
// question; the player selects at least two cells that show a trend, picks the hypothesis card and
// rules it Supported or Broken. A correct ruling strikes the list entry. One retry per day.
//
// Actions: select cells (a read-out names the trend they show); pick a hypothesis card; rule it;
// ask the orderly (twice in four mornings: Fisk's pencil then hovers over a telling cell, the
// design's tier-1 hint). Phases: three mornings on one sheet; on day 5 the printed target sheet
// slides under the first. Beats: the orderly's lines, and one line a morning in Fisk's hand.
//
// Phase 1 of the accepted development (DESIGN.md "Accepted development (2026-11-15)"):
//   Carbon (night 4, between the day-4 and day-5 mornings): Sam's cabinet is unlocked. The player may
//   shut it, or open Fisk's folder, turn to the Schedule and find tonight's line and tomorrow's.
//   The Schedule (a second sheet under the Chart): the torn strips are laid against the list entries
//   they issued, and on day 7 the player rules on a line that was typed before he chose.
// The 22:00 box on every strip is shown as the art draws it, empty; the page says nothing about it
// (its treatment waits for the cultural consultant, DESIGN.md section 20).
// Art (api.art): the clip, punch holes, frost corners, the stamps, Form 7-F, the target sheet, the
// Schedule and its strips, the chapter cards as day breaks, the night-4 clock card.
//
// Phase 2 (the ladder; DEEP_DIVE.md section 3, DESIGN.md 11.3 rules 8 to 10). Three stages:
//   teach, day 2: two cells and a card, two retries.
//   test, days 3 to 5: correlations and the second sheet, with Carbon and the strips as before; and
//     your word is a row (the player reports his own hunger, and the number he gives is the one on
//     the sheet), and the cut column (a taken man's column is scissored off the ward sheet; a pencil
//     rub on the sheet beneath raises his last numbers).
//   twist, day 6: the hypotheses are the project's, about Fisk. Turned over: the numbers are theirs
//     and prove nothing against them; the evidence is on the list side, and only an entry the
//     Schedule did not issue can break a card. Stamp one Broken and the orderly looks up. Day 7's
//     last line (phase 1) follows it when the carbon was taken.
// The 22:00 box stays as the art draws it, empty, and no text here refers to it.
//
// Phase 3 (the long puzzle pays off; the second week). The strips are no longer all handed out here:
//   one is found on each night out (Silhouette halls 2 and 6, Snow line 3 and 5), one is the carbon
//   torn out here on night 4, one is under the day-7 slab in The Tray (kit.js: week(), the sock).
//   The test stage lays what is in the sock. Once all six are in, the whole Schedule can be laid,
//   from the opening card or after day 6: strips 2 to 6 against what they issued, then day 7's line.
//   The pencilled fourth line is open only to a player who has made the carry (Snow line, night 7).
//   The line chosen is the week's ending (the finale on the menu reads it).
//   A second week (after one is finished): the orderly is asked once, not twice, and is believed less;
//   the folder's Schedule shows days 6 and 7, which the first week hid; the boots taken back on
//   night 3 (Snow line) are one more entry nobody issued.
import { artKit, ladder, week, ENDING_NAMES } from "./kit.js";

const NAMES = { 1: "Day 2 · two cells and a card", 2: "Days 3 to 5 · the second sheet", 3: "Day 6 · their hypotheses" };
const CUT = [ // the ward sheet on day 5: three columns scissored off; each man's last line, raised by a pencil rub
  { name: "Pell", last: "D2", h: "183.0", hunger: 9 }, { name: "Duarte", last: "D3", h: "186.2", hunger: 9 }, { name: "Kimura", last: "D4", h: "189.4", hunger: 9 },
];
const WARD = [{ name: "Hollis", h: "184.6", hunger: 9 }, { name: "Jax", h: "181.2", hunger: 6 }];
const OWN = [ // entries no strip issued (the twist's evidence)
  { id: "A1", text: "Day 5. Jax told me his plan. I did not go to Sam's office." },
  { id: "A2", text: "Showed Jax the page with his plan typed on it. He undid the knots." },
];
const THEIRS = ["Subject will report companion", "Subject will follow"];

const P = { ink: "#1B1D1F", paper: "#f3efe3", grid: "#9fbfa6", red: "#9b2f22", steel: "#8A8F93", desk: "#3a2c22", sodium: "#D9A441", bruise: "#5A4F5E" };
const PIECES_BY_DAY = [3, 5, 6, 6];
const CH = [0]; for (const p of PIECES_BY_DAY) CH.push(CH[CH.length - 1] + 2 * p + 3);
const HUNGER = [2, 4, 6, 7, 8];
const f1 = (v) => v.toFixed(1);
const ROWS = [
  { id: "weight", label: "Weight (kg)", v: (d) => f1(82 - 0.35 * CH[d]) },
  { id: "height", label: "Height (cm)", v: (d) => f1(178 + 1.6 * CH[d]) },
  { id: "temp", label: "Core temp (C)", v: (d) => f1(36.8 - 0.04 * CH[d]) },
  { id: "pulse", label: "Resting pulse", v: (d) => String(Math.round(64 - 0.3 * CH[d])) },
  { id: "grip", label: "Grip (kg)", v: (d) => String(Math.round(45 + 0.9 * CH[d])) },
  { id: "stride", label: "Stride (cm)", v: (d) => String(Math.round(75 + 0.7 * CH[d])) },
  { id: "pieces", label: "Ration pieces yest.", v: (d) => (d === 0 ? "—" : String(PIECES_BY_DAY[d - 1])) },
  { id: "pills", label: "Pills yest.", v: (d) => (d === 0 ? "—" : "1") },
  { id: "hunger", label: "Hunger, self (1–10)", v: (d) => String(HUNGER[d]) },
  { id: "target", label: "TARGET (printed)", from: 4 },
];
const targetVal = (c) => f1(178 + 1.6 * (c <= 4 ? CH[c] : CH[4] + 15 * (c - 4)) + (c === 0 ? 0 : c % 2 ? 0.4 : -0.3));
const LIST = [
  { id: "L2", text: "Crew look “sick and slightly anorexic”", why: "Seen worse" },
  { id: "L7", text: "The meal makes me hungrier", why: "Climate, body adjusts" },
  { id: "L9", text: "Height measured every day", why: "Routine" },
];
const DAYS = [
  { d: 1, q: "Is it the climate?", card: "Climate", list: "L2", rows: ["weight", "height"], need: ["height"], cols: [0, 1], days: 1, say: "Down again. Up again.",
    hint: "A climate can make a man thin. Can it make him taller overnight?", cards: ["Climate", "Bad posting", "Flu going round", "Old age"],
    margin: "4 cm of wrist out of the sleeve this morning." },
  { d: 2, q: "Is it the food?", card: "Not the food", list: "L7", rows: ["pieces", "height"], need: ["pieces", "height"], cols: [0, 1, 2], days: 2, say: "Up again.",
    hint: "Set the pieces you ate beside how much you grew, two days running.", cards: ["Not the food", "Climate", "Ventilation", "Bad meat"],
    margin: "Ate 5 yesterday. Wanted 6." },
  { d: 3, q: "Am I hungrier the more I eat?", card: "It fills me", list: "L7", rows: ["pieces", "hunger"], need: ["pieces", "hunger"], cols: [0, 1, 2, 3], days: 2, say: "Up again.",
    hint: "If it filled you, hunger would fall as the pieces rose.", cards: ["It fills me", "Not the food", "Sedative", "Routine"],
    margin: "Boots tight. Knuckles white." },
  { d: 4, q: "Is this routine?", card: "Routine", list: "L9", rows: ["height", "target"], need: ["height", "target"], cols: [1, 2, 3, 4], days: 1, say: "On schedule.",
    hint: "The second sheet has a printed curve. Who prints a curve for a routine check?", cards: ["Routine", "Cold-weather study", "Vitamins", "Bad boilers"],
    margin: "There is a second sheet under mine." },
];
const ASKS = 2;
// The Schedule's typed lines (games/man-eater/data/schedule.json; the art's strips carry the same text).
const SCHED = {
  1: { time: "06:00", lines: ["Intake. Rules read."], resp: "“Sir yes Sir.”" },
  2: { time: "14:00", lines: ["False statement issued (transfer).", "Companion (uninformed)."], resp: "curiosity. Retained." },
  3: { time: "19:00", lines: ["Card table.", "Loss to witness."], resp: "" },
  4: { time: "23:00", lines: ["Cabinet left unlocked.", "Officers' wing left unwatched."], resp: "" },
  5: { time: "08:00", lines: ["On schedule."], resp: "" },
  6: { time: "09:00", lines: ["Subject will report companion.", "Subject will follow."], resp: "" },
  7: { time: "22:00", lines: ["STAY: retained.", "FOLLOW: see previous.", "FENCE: photographed, not followed."], resp: "" },
};
const schedText = (d) => `DAY ${d} · ${SCHED[d].time} · ${SCHED[d].lines.join(" ")}${SCHED[d].resp ? ` Response: ${SCHED[d].resp}` : ""}`;
// the entries the strips are laid against (ids from data/list_incidents.json; L15 from data/schedule.json)
const ISSUED = [
  { id: "L8", text: "“transferred”", why: "Paperwork, he'll write", strip: 2, hint: "Day 2, two in the afternoon. Who told the bunk something then, and got the hour wrong?" },
  { id: "L10", text: "Chairs empty; nobody mentions it", why: "Rotation", strip: 3, hint: "Day 3, seven in the evening. Where are you at seven, and what did you see there?" },
  { id: "L15", text: "My file has tomorrow in it. Typed.", why: "", strip: 4, hint: "Day 4, eleven at night. The carbon is blue. Which entry did you write that night?" },
  { id: "L9", text: "Height measured every day", why: "Routine", strip: 5, hint: "Day 5, eight in the morning. Two words. Who said them, over which page?" },
];
// day 6's strip, laid against the cards it issued (the whole Schedule only)
const ISSUED6 = { id: "C6", text: "Their two cards about me, on day 6's clipboard", why: "", strip: 6, hint: "Day 6, nine in the morning. Two hypotheses, about you. Where did you read them?" };
// the week's ending, by the line chosen on day 7 (DESIGN.md section 13; stay splits on what was eaten)
const ENDING_BY_WAY = { pencil: "one_set_of_prints", follow: "the_zoo", fence: "rule_three" };
const WAYS = [
  { id: "stay", label: "Stay in the room", typed: "STAY: retained.", stamp: "stamp-retained", stampText: "RETAINED" },
  { id: "follow", label: "Follow the call", typed: "FOLLOW: see previous.", stamp: "stamp-see-previous", stampText: "SEE PREVIOUS" },
  { id: "fence", label: "Go over the fence", typed: "FENCE: photographed, not followed.", stamp: "", stampText: "PHOTOGRAPHED" },
];

export default {
  mount(root, api) {
    const lad = ladder(api, NAMES);
    let cur = null;
    const go = (n) => { if (cur) cur.unmount(); cur = run(n); };
    go(lad.reached());
    return { unmount() { if (cur) cur.unmount(); cur = null; lad.dispose(); } };

    function run(stage) {
    const sh = api.shared, twist = stage === 3, wk = week(api);
    const ASK_N = wk.second() ? 1 : ASKS; // a second week: the orderly is trusted less
    const FIRST = stage === 1 ? 0 : 1, LAST = stage === 1 ? 0 : DAYS.length - 1, TRIES = stage === 1 ? 3 : 2;
    const reported = {}; // day index -> the hunger Fisk said aloud (test)
    const hungerOf = (d) => (reported[d] != null ? reported[d] : HUNGER[d]);
    const K = "man-eater-chart-";
    const reduce = api.reducedMotion;
    const losses = api.store.get("losses", 0);
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, reduce ? 0 : ms); timers.push(t); };
    const wrap = document.createElement("div");
    wrap.className = K + "wrap";
    wrap.innerHTML = `<style>
      .${K}wrap{position:absolute;inset:0;overflow:auto;background:${P.desk};background-image:repeating-linear-gradient(95deg,rgba(0,0,0,.12) 0 2px,transparent 2px 9px);color:${P.ink};font-family:'Courier Prime','Courier New',monospace}
      .${K}board{position:relative;max-width:1080px;margin:18px auto 72px;padding:34px 16px 16px;background:${P.paper};box-shadow:0 18px 40px rgba(0,0,0,.55);box-sizing:border-box;width:calc(100% - 24px);background-image:radial-gradient(rgba(27,29,31,.04) 1px,transparent 1.3px);background-size:5px 5px}
      .${K}under{position:absolute;inset:26px -10px -10px 22px;background:#f6f0dc;box-shadow:0 6px 16px rgba(0,0,0,.35);transform:rotate(1.4deg);z-index:-1;transition:transform .8s}
      .${K}board.two .${K}under{transform:rotate(2.6deg) translate(10px,6px)}
      .${K}clip{position:absolute;left:50%;top:-12px;transform:translateX(-50%);width:160px;height:30px;background:${P.steel};border-radius:6px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)}
      .${K}head{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;font-size:13px;letter-spacing:.06em;margin-bottom:8px;border-bottom:1.5px solid ${P.ink};padding-bottom:6px}
      .${K}main{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px}
      .${K}grid{width:100%;border-collapse:collapse;font-size:14px;background-color:#f6f3ea;background-image:linear-gradient(${P.grid}55 1px,transparent 1px),linear-gradient(90deg,${P.grid}55 1px,transparent 1px);background-size:10px 10px}
      .${K}grid th,.${K}grid td{border:1px solid ${P.grid};padding:3px 4px;text-align:center;white-space:nowrap}
      .${K}grid th:first-child{text-align:left;font-weight:400;position:sticky;left:0;background:#f6f3ea;z-index:1}
      .${K}grid td button{all:unset;cursor:pointer;display:block;min-width:2.8em;min-height:1.7em;line-height:1.7em;border-radius:12px;padding:0 3px;transition:background .12s,box-shadow .12s}
      .${K}grid td button:hover{background:rgba(217,164,65,.22)}
      .${K}grid td button:focus-visible{outline:2px solid ${P.sodium}}
      .${K}grid td button.sel{box-shadow:0 0 0 2px ${P.red};background:rgba(155,47,34,.1);color:${P.red};font-weight:700}
      .${K}grid td.cur,.${K}grid th.cur{outline:2px solid ${P.sodium};outline-offset:-2px}
      .${K}grid td.fresh button{animation:${K}ink .5s ease-out}
      @keyframes ${K}ink{0%{opacity:0;transform:translateY(-4px)}100%{opacity:1;transform:none}}
      .${K}grid tr.tgt{color:${P.red};font-style:italic}
      .${K}grid .pencil{color:${P.red};font-weight:700;margin-left:2px}
      .${K}plot{width:100%;height:auto;display:block;margin-bottom:8px;background:#f6f3ea}
      .${K}read{font-size:14px;min-height:1.5em;margin:6px 0 0;color:${P.bruise}}
      .${K}read b{color:${P.ink}}
      .${K}list{border-left:2px solid ${P.red};padding-left:12px;font-family:'Special Elite','Courier Prime',monospace;font-size:15px}
      .${K}list h4{margin:0 0 6px;font-family:'Courier Prime',monospace;letter-spacing:.14em;font-size:13px}
      .${K}list li{margin:0 0 12px;list-style:none;line-height:1.35}
      .${K}list ul{padding:0;margin:0}
      .${K}list s{color:${P.bruise}}
      .${K}list em{color:${P.red};font-style:normal;display:block;font-size:13px}
      .${K}list .note{color:${P.bruise};font-size:14px;border-top:1px dashed ${P.bruise};padding-top:6px;margin-top:6px}
      .${K}list li.strike{animation:${K}strike .8s ease-out}
      @keyframes ${K}strike{0%{background:rgba(155,47,34,.25)}100%{background:transparent}}
      .${K}q{margin:14px 0 6px;font-size:17px;font-weight:700}
      .${K}steps{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;margin:0 0 6px}
      .${K}steps span{opacity:.55}.${K}steps span.ok{opacity:1;color:#2f5d3a;font-weight:700}
      .${K}cards{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0}
      .${K}cards button,.${K}acts button,.${K}intro button{font:inherit;min-height:44px;padding:8px 14px;cursor:pointer;border:1.5px solid ${P.ink};background:#fffdf6;letter-spacing:.06em;text-transform:uppercase;font-size:15px;transition:background .12s,transform .12s}
      .${K}cards button{box-shadow:2px 2px 0 rgba(27,29,31,.35)}
      .${K}cards button:hover,.${K}acts button:not([disabled]):hover{background:#f1e6c8}
      .${K}cards button[aria-pressed=true]{background:${P.ink};color:${P.paper};transform:translateY(-2px)}
      .${K}acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px}
      .${K}acts button.go{background:${P.ink};color:${P.paper}}
      .${K}acts button.ask{border-style:dashed;text-transform:none}
      .${K}acts button[disabled]{opacity:.35;cursor:not-allowed}
      .${K}cards button:focus-visible,.${K}acts button:focus-visible,.${K}intro button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}say{font-size:15px;min-height:1.4em;flex:1 1 260px;line-height:1.4}
      .${K}stamp{display:inline-block;border:2.5px solid ${P.red};color:${P.red};padding:0 6px;transform:rotate(-6deg);font-weight:700;letter-spacing:.1em;font-size:14px}
      .${K}stamp.in{animation:${K}stampin .45s ease-out}
      @keyframes ${K}stampin{0%{transform:scale(2) rotate(-14deg);opacity:0}100%{transform:rotate(-6deg);opacity:1}}
      .${K}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(58,44,34,.86);z-index:5;padding:16px;overflow:auto}
      .${K}form{width:min(540px,100%);box-sizing:border-box;background:${P.paper};padding:0;box-shadow:0 18px 40px rgba(0,0,0,.5);border:1.5px solid ${P.ink}}
      .${K}form .hd{display:flex;justify-content:space-between;background:${P.ink};color:${P.paper};padding:6px 12px;font-size:12px;letter-spacing:.16em}
      .${K}form .bd{padding:16px 18px;background-image:linear-gradient(${P.grid}44 1px,transparent 1px),linear-gradient(90deg,${P.grid}44 1px,transparent 1px);background-size:12px 12px}
      .${K}form h2{margin:0 0 6px;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(28px,7vw,36px);letter-spacing:.06em;text-transform:uppercase;line-height:1}
      .${K}goal{margin:0 0 8px;font-size:16px;font-weight:700;line-height:1.35}
      .${K}beat{margin:0 0 10px;font-size:14px;line-height:1.45;font-style:italic}
      .${K}fields{display:grid;grid-template-columns:auto 1fr;border:1.5px solid ${P.ink};margin:0 0 12px;font-size:14px;background:#fffdf6}
      .${K}fields dt,.${K}fields dd{margin:0;padding:6px 8px;border-bottom:1px solid ${P.grid}}
      .${K}fields dt{font-weight:700;border-right:1px solid ${P.grid};letter-spacing:.06em;white-space:nowrap}
      .${K}scroll{overflow-x:auto}
      .${K}board{padding-left:40px}
      .${K}clipart{position:absolute;left:50%;top:-30px;transform:translateX(-50%);width:176px;height:auto;z-index:2;pointer-events:none}
      .${K}holes{position:absolute;left:2px;top:46px;width:30px;height:auto;pointer-events:none;mix-blend-mode:multiply}
      .${K}frost{position:absolute;right:0;bottom:0;width:min(30%,200px);height:auto;transform:rotate(180deg);pointer-events:none;opacity:.85}
      .${K}under{background-size:cover;background-position:top right}
      .${K}stampimg{height:46px;width:auto;vertical-align:middle;transform:rotate(-4deg);margin-right:6px}
      .${K}stampimg.in{animation:${K}stampin .45s ease-out}
      .${K}ord{height:56px;width:auto;flex:none;margin:-6px 0}
      .${K}brk{position:absolute;inset:0;z-index:6;display:grid;place-items:center;align-content:center;gap:14px;background:rgba(27,29,31,.92);padding:16px}
      .${K}brk img{display:block;max-width:min(100%,820px);max-height:calc(100% - 90px);width:auto;height:auto;box-shadow:0 18px 40px rgba(0,0,0,.6)}
      .${K}brk button,.${K}night button{font:inherit;min-height:44px;padding:8px 14px;cursor:pointer;border:1.5px solid ${P.paper};background:${P.ink};color:${P.paper};letter-spacing:.06em;font-size:15px}
      .${K}brk button:hover,.${K}night button:hover{background:#34373a}
      .${K}brk button:focus-visible,.${K}night button:focus-visible,.${K}sch button:focus-visible,.${K}last button:focus-visible{outline:3px solid ${P.sodium};outline-offset:2px}
      .${K}night{position:absolute;inset:0;z-index:6;overflow:auto;background:#1B1D1F center/cover no-repeat;color:#D9D2BF;padding:16px;box-sizing:border-box}
      .${K}desk{max-width:860px;margin:0 auto;display:grid;gap:12px}
      .${K}desk h3{margin:0;font-family:'Stardos Stencil','Courier Prime',monospace;font-size:clamp(20px,5vw,28px);letter-spacing:.1em;line-height:1.1}
      .${K}desk .dv{display:block;width:min(100%,420px);height:auto;filter:invert(1);opacity:.7}
      .${K}desk p{margin:0;font-size:15px;line-height:1.45;max-width:64ch}
      .${K}things{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      .${K}things button{padding:6px;display:grid;gap:6px;justify-items:center;text-align:center;min-width:0}
      .${K}things img{display:block;width:100%;max-width:150px;height:auto;aspect-ratio:1;object-fit:cover;object-position:top}
      .${K}things small{display:block;opacity:.8;font-size:12px;letter-spacing:0}
      .${K}folder{background:#2a2420;border:1.5px solid rgba(217,210,191,.5);padding:10px;display:grid;gap:8px;justify-items:center}
      .${K}tabs{display:flex;flex-wrap:wrap;gap:6px;justify-self:stretch}
      .${K}tabs button[aria-pressed=true]{background:${P.paper};color:${P.ink}}
      .${K}pg{position:relative;width:min(100%,460px);aspect-ratio:800/1100;background:#EEE9DA}
      .${K}pg>img{display:block;width:100%;height:100%}
      .${K}hit{position:absolute;left:11%;width:82%;background:transparent;border:2px dashed transparent;padding:0;min-height:0;cursor:pointer;box-sizing:border-box}
      .${K}night .${K}hit{border:2px dashed transparent;background:transparent;min-height:0;padding:0}
      .${K}night .${K}hit:hover,.${K}night .${K}hit:focus-visible{border-color:${P.sodium};background:rgba(217,164,65,.14)}
      .${K}night .${K}hit.found{border:2.5px solid ${P.red};background:rgba(155,47,34,.1)}
      .${K}mask{position:absolute;left:11%;width:82%;top:70%;height:27%;background:#EEE9DA;background-image:repeating-linear-gradient(0deg,transparent 0 23px,rgba(27,29,31,.12) 23px 24px);color:#6b6558;font-size:12px;display:grid;place-items:center;letter-spacing:.1em;pointer-events:none}
      .${K}nsay{min-height:3em;border-left:2px solid ${P.sodium};padding-left:10px}
      .${K}nacts{display:flex;flex-wrap:wrap;gap:8px}
      .${K}nacts .take{background:${P.sodium};color:${P.ink};border-color:${P.sodium};font-weight:700}
      .${K}sch h4,.${K}last h4{margin:0 0 6px;letter-spacing:.14em;font-size:13px}
      .${K}sch .dv,.${K}last .dv{display:block;width:min(100%,520px);height:auto;margin:4px 0 8px}
      .${K}schgrid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px;align-items:start}
      .${K}strip{display:block;width:100%;box-sizing:border-box;background:none;border:2px solid transparent;padding:2px;cursor:pointer;text-align:left;font:inherit;color:inherit;margin:0 0 4px}
      .${K}strip img{display:block;width:100%;height:auto;aspect-ratio:800/260}
      .${K}strip span{display:block;font-size:13px;line-height:1.35;padding:0 8px 4px}
      .${K}strip:hover{background:rgba(217,164,65,.14)}
      .${K}strip[aria-pressed=true]{border-color:${P.red};background:rgba(155,47,34,.08)}
      .${K}strip.laid{cursor:default;opacity:.9}
      .${K}ents{display:grid;gap:8px;font-family:'Special Elite','Courier Prime',monospace}
      .${K}ent{font:inherit;text-align:left;min-height:44px;padding:8px 10px;border:1.5px dashed ${P.ink};background:#fffdf6;cursor:pointer;line-height:1.35;font-size:15px;color:inherit}
      .${K}ent:hover:not([disabled]){background:#f1e6c8}
      .${K}ent[disabled]{cursor:default;border-style:solid;border-color:${P.red};background:rgba(155,47,34,.06);color:inherit;opacity:1}
      .${K}ent em{display:block;font-style:normal;color:${P.red};font-size:13px;font-family:'Courier Prime',monospace}
      .${K}typed{border:1.5px solid ${P.ink};background:#f6f3ea;padding:10px 12px;font-size:15px;line-height:1.6;white-space:pre-wrap;max-width:560px}
      .${K}ways{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
      .${K}ways button{font:inherit;min-height:44px;padding:8px 14px;cursor:pointer;border:1.5px solid ${P.ink};background:#fffdf6;font-size:15px;box-shadow:2px 2px 0 rgba(27,29,31,.35);color:inherit}
      .${K}ways button.pencil{font-family:'Special Elite','Courier Prime',monospace;border-style:dashed;color:${P.bruise}}
      .${K}ways button[disabled]{opacity:.45;cursor:default}
      .${K}ways button[aria-pressed=true]{opacity:1;background:${P.ink};color:${P.paper}}
      .${K}lastimg{display:block;width:min(100%,560px);height:auto;aspect-ratio:800/260}
      .${K}board [hidden]{display:none!important}
      .${K}ward{margin:10px 0 0;border:1.5px solid ${P.ink};background:#f6f0dc;padding:8px 10px;font-size:13px}
      .${K}ward h4{margin:0 0 6px;letter-spacing:.14em;font-size:12px}
      .${K}wcols{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:0}
      .${K}wcols>div,.${K}wcols>button{border:1px solid ${P.grid};padding:4px 2px;text-align:center;min-height:74px;font:inherit;font-size:12px;line-height:1.5;background:#f6f3ea;color:inherit;min-width:0;overflow:hidden}
      .${K}wcols>button{cursor:pointer;background:${P.desk};color:#cbbfa8;border:0;border-left:2px dashed ${P.paper};clip-path:polygon(0 0,100% 0,96% 12%,100% 25%,95% 38%,100% 52%,96% 66%,100% 80%,95% 92%,100% 100%,0 100%,4% 88%,0 74%,5% 60%,0 46%,4% 32%,0 18%,5% 8%)}
      .${K}wcols>button:hover,.${K}wcols>button:focus-visible{background:#4a3a2e;outline:none}
      .${K}wcols>button.rub{background:#ddd6c2;color:#6b6558;cursor:default;font-family:'Special Elite','Courier Prime',monospace}
      .${K}wcols b{display:block;font-size:12px;letter-spacing:.04em}
      .${K}tw h4{margin:0 0 6px;letter-spacing:.14em;font-size:13px}
      .${K}tw p{margin:8px 0;font-size:15px;line-height:1.4}
      .${K}tw .iss{display:grid;gap:4px}
      .${K}tw .iss img{display:block;width:100%;height:auto;aspect-ratio:800/260}
      .${K}tw .iss span{display:block;font-size:12px;line-height:1.3;padding:0 6px 4px;color:${P.bruise}}
      .${K}ent[aria-pressed=true]{border-style:solid;border-color:${P.red};background:rgba(155,47,34,.1);box-shadow:inset 4px 0 0 ${P.red}}
      .${K}twout{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0}
      .${K}twout img.strip{display:block;width:min(100%,520px);height:auto;aspect-ratio:800/260}
      .${K}twout img.eye{width:84px;height:84px}
      .${K}photo{display:block;width:min(100%,220px);height:auto;margin:6px 0;transform:rotate(-2deg);box-shadow:0 3px 8px rgba(0,0,0,.35)}
      .${K}form .new{border-left:4px solid ${P.red};padding-left:8px;margin:0 0 10px;font-size:14px;line-height:1.4}
      @media (max-width:760px){.${K}main,.${K}schgrid{grid-template-columns:minmax(0,1fr)}.${K}board{padding:30px 10px 14px;width:calc(100% - 12px);margin:14px auto}.${K}holes{display:none}.${K}ord{display:none}}
    </style>
    <div class="${K}board"><div class="${K}under"></div><div class="${K}clip"></div><img class="${K}clipart" alt="" hidden><img class="${K}holes" alt="" hidden><img class="${K}frost" alt="" hidden>
      <div class="${K}head"><span>CASE 7-F · FISK · INFIRMARY</span><span class="${K}day">DAY 2</span><span>WARD B</span></div>
      <div class="${K}main">
        <div><svg class="${K}plot" viewBox="0 0 600 150" aria-label="Height plotted by day"></svg><div class="${K}scroll"><table class="${K}grid"></table></div><p class="${K}read" aria-live="polite"></p>
          <div class="${K}ward" hidden><h4>WARD SHEET B · THE TABLE, BY SEAT · THREE COLUMNS CUT OFF</h4><div class="${K}wcols"></div><p class="${K}wsay" style="margin:6px 0 0;line-height:1.4">A taken man's column is scissored off. The sheet beneath kept the dent of the pencil: rub a cut column.</p></div></div>
        <div class="${K}list"><h4>THE LIST · IN FISK'S HAND</h4><ul></ul><div class="note"></div></div>
      </div>
      <div class="${K}q" aria-live="polite"></div>
      <div class="${K}steps"><span data-s="cells">① two cells</span><span data-s="card">② a card</span><span data-s="rule">③ rule it</span></div>
      <div class="${K}cards" role="group" aria-label="Hypothesis cards"></div>
      <div class="${K}sch" hidden><h4>THE SCHEDULE · A SECOND SHEET · STRIPS FOUND ON NIGHTS OUT</h4><img class="dv" alt="" hidden>
        <p style="margin:0 0 10px;font-size:15px;line-height:1.4">Pick a strip, then the list entry it issued. One retry a strip.</p>
        <div class="${K}schgrid"><div class="${K}strips" role="group" aria-label="Strips of the Schedule"></div><div class="${K}ents" role="group" aria-label="The list, in Fisk's hand"></div></div></div>
      <div class="${K}tw" hidden><h4>DAY 6 · THE HYPOTHESES ARE THE PROJECT'S · SUBJECT: FISK</h4>
        <div class="${K}typed">09:00  Subject will report companion.
       Subject will follow.</div>
        <div class="${K}twout"></div>
        <p>Their cards, about you, on their sheet. Every number on the page is theirs as well. Pick at least two things on this page that are <b>yours</b>, then a card, then rule on it.</p>
        <div class="${K}schgrid"><div class="iss" aria-label="The strips, as issued"></div><div class="${K}ents ${K}twents" role="group" aria-label="The list, in Fisk's hand"></div></div>
        <div class="${K}cards ${K}twcards" role="group" aria-label="The project's hypothesis cards"></div></div>
      <div class="${K}last" hidden><h4>DAY 7 · THE LAST LINE · TYPED ONE DAY AHEAD</h4><img class="dv" alt="" hidden>
        <div class="${K}typed"></div>
        <p style="margin:10px 0 0;font-size:15px;line-height:1.4">Three ways out of tonight, each with its outcome typed beside it. Rule on the line: which is yours?</p>
        <div class="${K}ways" role="group" aria-label="Ways out of night 7"></div><div class="${K}lastout"></div></div>
      <div class="${K}acts"><img class="${K}ord" alt="" hidden><button type="button" data-r="sup">Supported (S)</button><button type="button" data-r="brk">Broken (B)</button><button type="button" class="ask" data-ask>Ask the orderly · ${ASK_N}</button><span class="${K}say" aria-live="polite"></span><button type="button" class="go" data-next hidden>Next</button></div>
    </div>
    <div class="${K}intro"><div class="${K}form">
      <div class="hd"><span>FORM 7-F · DAILY MEASURES</span><span>INFIRMARY</span></div>
      <div class="bd">
      <h2>The Chart</h2>
      ${stage === 1 ? `<p class="${K}goal">Break the explanation you gave yourself, using your own numbers.</p>
      <p class="${K}beat">One morning. The orderly reads the tape aloud and writes; he never looks at your face. You are the evidence.</p>`
      : stage === 2 ? `<p class="${K}goal">Break the explanations you gave yourself, using your own numbers.</p>
      <p class="${K}beat">Three mornings, and the night between the second and the third. The orderly reads the tape aloud and writes; he never looks at your face.</p>
      <p class="new"><b>New.</b> Your word is a row: each morning he asks your hunger, one to ten, and writes what you say. And on day 5 the ward sheet has columns cut off it.</p>`
      : `<p class="${K}goal">The cards on the clipboard are theirs now, and they are about you. Break one.</p>
      <p class="${K}beat">Day 6. The strip for this morning was typed yesterday: two hypotheses, and a blank after the word “Response”.</p>
      <p class="new"><b>Turned over.</b> For five mornings your numbers broke your own explanations. Their numbers will not break their cards. The evidence is on the other side of the page, in your hand, and only what they did not issue counts.</p>`}
      <dl class="${K}fields">
        <dt>① SELECT</dt><dd>${twist ? "pick at least two entries of your own" : "click at least two cells that show the trend"}</dd>
        <dt>② CARD</dt><dd>pick the hypothesis ${twist ? "you are ruling on" : "the question tests"}</dd>
        <dt>③ RULE</dt><dd>Supported or Broken (S or B). ${TRIES === 3 ? "Two retries" : "One retry"}${twist ? "" : " a morning"}</dd>
      </dl>
      ${wk.all() && !wk.solved() ? `<p class="new"><b>All six strips are in your sock.</b> The whole Schedule can be laid now, and day 7's line ruled on.</p><button type="button" data-full style="margin:0 8px 8px 0">Lay the whole Schedule</button>` : ""}${wk.second() ? `<p class="new" data-week="${wk.n()}"><b>Week ${wk.n()}, in pencil.</b> “Up again.” He said it last week in the same voice, to the same page. You will ask him once this time, not twice.</p>` : ""}
      <button type="button" data-start>Morning, day ${stage === 1 ? 2 : stage === 2 ? 3 : 6}</button>
      </div>
    </div></div>`;
    root.appendChild(wrap);
    const $ = (c) => wrap.querySelector("." + K + c);
    const grid = $("grid"), plot = $("plot"), qEl = $("q"), cardsEl = $("cards"), sayEl = $("say"), listUl = $("list").querySelector("ul"), noteEl = $("list").querySelector(".note"), readEl = $("read");
    const nextBtn = wrap.querySelector("[data-next]"), rBtns = [...wrap.querySelectorAll("[data-r]")], askBtn = wrap.querySelector("[data-ask]");
    const intro = $("intro");
    const board = $("board"), schEl = $("sch"), lastEl = $("last"), stripsEl = $("strips"), entsEl = $("ents"), waysEl = $("ways"), lastOut = $("lastout");
    const chartParts = [$("main"), qEl, $("steps"), cardsEl, ...rBtns, askBtn];
    const twEl = $("tw"), twEnts = $("twents"), twCards = $("twcards"), twOut = $("twout"), wardEl = $("ward"), wcols = $("wcols"), wsay = $("wsay");

    // ---- art
    const kit = artKit(api);
    kit.dressIntro(intro, intro.querySelector(".bd"), stage === 1 ? "chapter-3" : stage === 2 ? "chapter-4" : "chapter-7", "rgba(58,44,34,.6)");
    lad.picker(intro.querySelector(".bd"), intro.querySelector("[data-start]"), stage, go, P.ink, P.paper);
    kit.sock(root);
    kit.fill(wrap, "." + K + "clipart", "clip", 176).then((ok) => { if (ok) $("clip").style.visibility = "hidden"; });
    kit.fill(wrap, "." + K + "holes", "punch-holes", 30);
    kit.fill(wrap, "." + K + "ord", "cutout-orderly", 40);
    kit.fill(wrap, "." + K + "sch .dv", "divider-stencil", 520);
    kit.fill(wrap, "." + K + "last .dv", "divider-perforation", 520);
    const frost = (n) => kit.fill(wrap, "." + K + "frost", "frost-corner-" + Math.max(1, Math.min(4, n)), 200);
    const stampHtml = (id, text) => `<img class="${K}stampimg${reduce ? "" : " in"}" data-stamp="${id}" alt="${text}" hidden><span class="${K}stamp${reduce ? "" : " in"}" data-stampfb="${id}">${text}</span>`;
    // swap the CSS stamp for the rubber-stamp art once it is rasterised
    const inkStamps = (root, id) => { if (id) kit.png(id, 120).then((u) => { if (!u) return; root.querySelectorAll(`[data-stamp="${id}"]`).forEach((im) => { im.src = u; im.hidden = false; }); root.querySelectorAll(`[data-stampfb="${id}"]`).forEach((x) => x.remove()); }); };
    let phase = "chart";
    const sched = { offered: false, read: twist && (wk.has(4) || (!wk.second() && api.store.get("sched_read", false) === true)), found: {}, laid: {}, missed: {}, tries: {}, pick: null, way: null, full: false, final: false };

    let di = FIRST, shown = 0, sel = new Set(), card = null, tries = 0, idle = 0, hintAt = null, solved = [], broken = {}, filling = false, asks = ASK_N, margins = [], justStruck = null;
    if (stage >= 2) broken.L2 = "Is it the climate: no. height D1, height D2";
    let mismatches = 0, under = false, rubbed = 0, twSel = new Set(), twCard = null, twWon = false;
    ROWS.find((r) => r.id === "hunger").v = (d) => String(hungerOf(d));
    const day = () => DAYS[di];

    function renderGrid() {
      const D = day();
      const cols = [0, 1, 2, 3, 4, 5, 6];
      let h = `<thead><tr><th scope="col"></th>${cols.map((c) => `<th scope="col" class="${c === D.d ? "cur" : ""}">D${c + 1}</th>`).join("")}</tr></thead><tbody>`;
      for (const r of ROWS) {
        if (r.from != null && D.d < r.from) continue;
        h += `<tr class="${r.id === "target" ? "tgt" : ""}"><th scope="row">${r.label}</th>`;
        for (const c of cols) {
          const val = r.id === "target" ? targetVal(c) : c < D.d || (c === D.d && shown > ROWS.indexOf(r)) ? r.v(c) : "";
          const key = `${r.id}:${c}`;
          const pencil = hintAt === key ? `<span class="pencil" aria-label="Fisk's pencil hovers here">✎</span>` : "";
          const fresh = c === D.d && shown === ROWS.indexOf(r) + 1 && filling;
          h += `<td class="${c === D.d ? "cur" : ""}${fresh ? " fresh" : ""}">${val ? `<button type="button" data-k="${key}" class="${sel.has(key) ? "sel" : ""}" aria-pressed="${sel.has(key)}" aria-label="${r.label}, day ${c + 1}: ${val}">${val}</button>${pencil}` : ""}</td>`;
        }
        h += "</tr>";
      }
      grid.innerHTML = h + "</tbody>";
      grid.querySelectorAll("button[data-k]").forEach((b) => b.addEventListener("click", () => {
        if (filling || !nextBtn.hidden) return;
        const k = b.dataset.k; sel.has(k) ? sel.delete(k) : sel.add(k); idle = 0; renderGrid(); renderRead(); grid.querySelector(`[data-k="${k}"]`)?.focus();
      }));
    }
    // a read-out of the selection: what the chosen cells do, row by row (it names a trend, not a verdict)
    function renderRead() {
      const byRow = {};
      for (const k of sel) { const [row, c] = k.split(":"); (byRow[row] = byRow[row] || []).push(+c); }
      const parts = Object.entries(byRow).map(([row, cs]) => {
        const r = ROWS.find((x) => x.id === row);
        cs.sort((a, b) => a - b);
        const vals = cs.map((c) => (row === "target" ? targetVal(c) : r.v(c)));
        const nums = vals.map(Number);
        const trend = cs.length < 2 || nums.some(isNaN) ? "" : nums[nums.length - 1] > nums[0] ? " ↑ rising" : nums[nums.length - 1] < nums[0] ? " ↓ falling" : " = flat";
        return `<b>${r.label}</b> ${cs.map((c, i) => `D${c + 1} ${vals[i]}`).join(" → ")}${trend}`;
      });
      readEl.innerHTML = parts.length ? "Selected: " + parts.join(" · ") : "Selected: nothing yet. Click the numbers that answer the question.";
      renderSteps();
    }
    function renderSteps() {
      wrap.querySelector('[data-s="cells"]').classList.toggle("ok", sel.size >= 2);
      wrap.querySelector('[data-s="card"]').classList.toggle("ok", !!card);
      wrap.querySelector('[data-s="rule"]').classList.toggle("ok", !nextBtn.hidden);
    }
    function renderPlot() {
      const D = day();
      const x = (d) => 50 + d * 85, y = (v) => 140 - ((v - 170) / (300 - 170)) * 125;
      let s = `<rect width="600" height="150" fill="#f6f3ea"/>`;
      for (let v = 170; v <= 300; v += 10) s += `<line x1="40" x2="590" y1="${y(v)}" y2="${y(v)}" stroke="${P.grid}" stroke-width="${v % 50 === 0 ? 1.2 : 0.5}"/>${v % 30 === 0 ? `<text x="34" y="${y(v) + 4}" font-size="12" text-anchor="end" font-family="Courier Prime,monospace">${v}</text>` : ""}`;
      for (let d = 0; d < 7; d++) s += `<line x1="${x(d)}" x2="${x(d)}" y1="12" y2="140" stroke="${P.grid}" stroke-width=".8"/><text x="${x(d)}" y="150" font-size="12" text-anchor="middle" font-family="Courier Prime,monospace">D${d + 1}</text>`;
      s += `<text x="44" y="11" font-size="12" font-family="Courier Prime,monospace">HEIGHT (cm)</text>`;
      if (D.d >= 4) {
        const pts = [0, 1, 2, 3, 4, 5, 6].map((d) => `${x(d)},${y(178 + 1.6 * (d <= 4 ? CH[d] : CH[4] + 15 * (d - 4)))}`);
        s += `<polyline points="${pts.join(" ")}" fill="none" stroke="${P.red}" stroke-width="2" stroke-dasharray="6 4"/><text x="${x(6) - 4}" y="${y(178 + 1.6 * (CH[4] + 30)) + 16}" font-size="13" fill="${P.red}" text-anchor="end" font-family="Courier Prime,monospace">TARGET (PRINTED)</text>`;
      }
      const upto = shown > 1 ? D.d : D.d - 1;
      const pts = []; for (let d = 0; d <= upto; d++) pts.push([x(d), y(178 + 1.6 * CH[d])]);
      if (pts.length > 1) s += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${P.ink}" stroke-width="2.2"/>`;
      for (const [px, py] of pts) s += `<path d="M${px - 4},${py - 4}L${px + 4},${py + 4}M${px + 4},${py - 4}L${px - 4},${py + 4}" stroke="${P.ink}" stroke-width="1.8"/>`;
      plot.innerHTML = s;
    }
    function renderList() {
      listUl.innerHTML = LIST.map((l) => {
        const b = broken[l.id];
        return `<li class="${justStruck === l.id ? "strike" : ""}"><b>${l.id}</b> ${l.text}<br>→ ${b ? `<s>${l.why}</s><em>${b}</em>` : l.why}</li>`;
      }).join("");
      justStruck = null;
      noteEl.innerHTML = margins.map((m) => `<div>· ${m}</div>`).join("");
      noteEl.hidden = !margins.length;
    }
    function renderCards() {
      cardsEl.innerHTML = day().cards.map((c) => `<button type="button" aria-pressed="${card === c}">${c}</button>`).join("");
      cardsEl.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { if (filling || !nextBtn.hidden) return; card = b.textContent; idle = 0; renderCards(); renderSteps(); cardsEl.querySelector('[aria-pressed="true"]').focus(); }));
    }
    // your word is a row (test): he asks, and writes what you say
    function askHunger(then) {
      const D = day();
      filling = true; sel = new Set(); card = null; shown = 0; hintAt = null;
      $("day").textContent = `DAY ${D.d + 1}`;
      nextBtn.hidden = true; rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
      renderList(); renderGrid(); renderPlot(); renderRead();
      qEl.textContent = "Orderly, pencil up: “Hunger. One to ten.”";
      sayEl.textContent = "Your word is a row. He will write what you say.";
      cardsEl.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button type="button" data-h="${n}" aria-label="Say ${n}">${n}</button>`).join("");
      cardsEl.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => {
        const n = +b.dataset.h, off = n - HUNGER[D.d];
        reported[D.d] = n;
        if (Math.abs(off) >= 2) mismatches++;
        if (off <= -2) under = true;
        then(off);
      }));
      cardsEl.querySelector("[data-h]").focus();
    }
    function renderWard() {
      const on = stage === 2 && day().d === 4 && phase === "chart";
      wardEl.hidden = !on;
      if (!on) return;
      wcols.innerHTML = "";
      for (const c of CUT) {
        const b = document.createElement("button");
        b.type = "button"; b.setAttribute("aria-label", `A column cut off the sheet. Rub it with the pencil`);
        b.innerHTML = c.rubbed ? `<b>${c.name}</b>last ${c.last}<br>${c.h} cm<br>hunger ${c.hunger}` : "✂<br>cut";
        if (c.rubbed) { b.classList.add("rub"); b.disabled = true; }
        else b.addEventListener("click", () => {
          c.rubbed = true; rubbed++;
          wsay.textContent = rubbed < 3 ? `Graphite over the dent: ${c.name}, last line ${c.last}. Height ${c.h}. Hunger, self: ${c.hunger}. Then the scissors.` : "Three columns, three last lines, and the same hunger on each: nine. Read the columns that are still on the sheet.";
          if (rubbed === 3) { margins.push("Every cut column ends on hunger 9. Hollis said 9 this morning."); renderList(); }
          renderWard();
        });
        wcols.appendChild(b);
      }
      for (const c of [...WARD, { name: "Fisk", h: f1(178 + 1.6 * CH[4]), hunger: hungerOf(4) }]) {
        const d = document.createElement("div");
        d.innerHTML = `<b>${c.name}</b>D5<br>${c.h} cm<br>hunger ${c.hunger}`;
        wcols.appendChild(d);
      }
    }
    function startDay(off) {
      const D = day();
      if (stage === 2 && reported[D.d] == null) return askHunger(startDay);
      sel = new Set(); card = null; tries = 0; idle = 0; hintAt = null; shown = 0; filling = true;
      $("day").textContent = `DAY ${D.d + 1}`;
      qEl.textContent = "";
      sayEl.textContent = D.d === 4 ? "The orderly slides a second, printed sheet half under yours before he starts." : "The orderly reads the numbers aloud.";
      board.classList.toggle("two", D.d >= 4);
      if (D.d >= 4) kit.fill(wrap, "." + K + "under", "target-sheet", 560, true);
      frost(di + 1);
      nextBtn.hidden = true; rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
      renderCards(); renderList(); renderGrid(); renderPlot(); renderRead();
      const fill = () => {
        shown++;
        renderGrid(); renderPlot();
        if (shown < ROWS.length) return later(fill, 170);
        filling = false;
        margins.push(D.d === 4 && sched.read ? "L15. My file has tomorrow in it. Typed." : D.margin); renderList();
        sayEl.textContent = `Orderly: “${D.say}”` + (off == null ? "" : off <= -2 ? ` You said ${reported[D.d]}. He looks at the grip and the pulse he has just written, and pencils a second number beside yours. Tomorrow's slab will be cut smaller.` : off >= 2 ? ` You said ${reported[D.d]}. He writes it, and a second number beside it.` : ` You said ${reported[D.d]}. He writes it.`) + (mismatches === 3 && off != null && Math.abs(off) >= 2 ? " Three mornings your word has not matched your grip: suspicion +10." : "");
        renderWard();
        if (stage === 2 && D.d === 4 && sh.get("route_photo", false) && !startDay.photo) {
          startDay.photo = true;
          lad.note(wrap, "because your prints in Snow line were big enough to photograph, the route is clipped to the orderly's board this morning.");
          kit.png("print-photographed", 220).then((u) => { if (!u) return; const im = document.createElement("img"); im.className = K + "photo"; im.alt = "A photograph of the east yard: a line of large prints"; im.src = u; noteEl.after(im); });
          margins.push("A photograph on his board: the east yard, my prints, 38 cm. Nobody followed them. They took a picture."); renderList();
        }
        qEl.textContent = `Question, day ${D.d + 1}: ${D.q}`;
        rBtns.forEach((b) => (b.disabled = false)); askBtn.disabled = asks <= 0;
        grid.querySelector("td.cur button")?.focus();
      };
      later(fill, 300);
    }
    function rule(r) {
      if (filling || nextBtn.hidden === false) return;
      const D = day();
      if (sel.size < 2) { sayEl.textContent = "Select at least two cells that show it. The read-out under the grid tells you what they do."; return; }
      if (!card) { sayEl.textContent = "Pick the hypothesis card you are ruling on."; return; }
      const cells = [...sel].map((k) => { const [row, c] = k.split(":"); return { row, c: +c }; });
      const cellsOk = cells.every((x) => D.rows.includes(x.row) && D.cols.includes(x.c)) && D.need.every((n) => cells.some((x) => x.row === n)) && new Set(cells.map((x) => x.c)).size >= D.days;
      // your word is a row: the hunger cells are what he said, and they have to show what he claims
      const hc = cells.filter((x) => x.row === "hunger").sort((a, b) => a.c - b.c).map((x) => hungerOf(x.c));
      const wordOk = !(stage === 2 && D.need.includes("hunger")) || (hc.length >= 2 && hc[hc.length - 1] > hc[0]);
      const ok = cellsOk && wordOk && card === D.card && r === "brk";
      if (ok) {
        broken[D.list] = (broken[D.list] ? broken[D.list] + "; " : "") + `${D.q.replace("?", "")}: no. ${cells.map((x) => `${x.row} D${x.c + 1}`).join(", ")}`;
        solved.push(D.d); justStruck = D.list;
        sayEl.innerHTML = `${stampHtml("stamp-broken", "BROKEN")} “${D.card}” does not hold. Struck through, with the evidence beside it.`;
        inkStamps(sayEl, "stamp-broken");
        renderList(); done();
        return;
      }
      tries++;
      const why = card !== D.card ? "That card is not what this morning's question tests." : r !== "brk" ? "The cells say otherwise. Look at which way they move." : cellsOk && !wordOk ? "The hunger row is your own word, and what you said does not rise with what you ate. You wrote it." : "Those cells do not show it.";
      if (tries < TRIES) { sayEl.textContent = `${why} ${TRIES - tries === 1 ? "One retry" : "Two retries"}.`; if (!reduce) sayEl.animate?.([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); return; }
      sayEl.innerHTML = `${stampHtml("stamp-supported", "SHELVED")} ${why} Fisk shelves it: “${LIST.find((l) => l.id === D.list).why}” stands.`;
      inkStamps(sayEl, "stamp-supported");
      done();
    }
    function ask() {
      if (filling || !nextBtn.hidden || asks <= 0) return;
      asks--; askBtn.textContent = `Ask the orderly · ${asks}`; askBtn.disabled = asks <= 0;
      if (phase === "twist") { sayEl.textContent = "You ask what the cards mean. The orderly, to the clipboard: “On schedule.” His pencil is already over the box marked Supported. He has never been asked to hold it anywhere else."; return; }
      const D = day();
      hintAt = `${D.need[D.need.length - 1]}:${D.d}`; renderGrid();
      sayEl.textContent = `You ask what the numbers mean. The orderly: “${D.say}” He writes a line about the question. Fisk's pencil goes to one cell. (${D.hint})` + (wk.second() ? " He said that last week too, word for word. You do not ask again." : "");
    }
    function done() {
      rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
      sayEl.insertAdjacentText("beforeend", " Orderly: “Next.”");
      nextBtn.hidden = false; nextBtn.textContent = stage === 1 ? "Close the chart" : di === 2 && !sched.offered ? "Night 4" : di < LAST ? `Morning, day ${DAYS[di + 1].d + 1}` : sched.read ? "The second sheet" : "Close the chart";
      renderSteps();
      nextBtn.focus();
    }
    // ---- a day break: the chapter card for the day that is starting
    let brkEl = null;
    // an overlay covers the page: the page under it goes to its top and stops scrolling
    const lock = (on) => { if (on) wrap.scrollTop = 0; wrap.style.overflow = on ? "hidden" : ""; };
    function dayBreak(dayNo, label, then) {
      const id = "chapter-" + (dayNo + 1);
      if (!kit.has(id)) return then();
      const el = document.createElement("div");
      el.className = K + "brk";
      const im = kit.img(id, 820, `Chapter card: day ${dayNo}`);
      const b = document.createElement("button"); b.type = "button"; b.textContent = label;
      el.append(im, b); lock(true); wrap.appendChild(el); brkEl = el;
      let gone = false;
      const go = () => { if (gone) return; gone = true; el.remove(); brkEl = null; lock(false); then(); };
      b.addEventListener("click", go);
      later(go, 2600);
      b.focus();
    }

    // ---- Carbon: night 4, Sam's office. The cabinet was left open, and can be declined.
    const PAGES = [
      { id: "form-7f", tab: "1 · Form 7-F", say: "Your chart, in carbon. Someone keeps a second copy of every number the orderly reads aloud." },
      { id: "target-sheet", tab: "2 · Target", say: "A printed curve of heights by day, drawn before you arrived. The last number on it is 338." },
      { id: "schedule", tab: "3 · Schedule", say: "SCHEDULE. SUBJECT: FISK. One typed line a day, and a blank after the word “Response”. Find tonight's line, then tomorrow's." },
    ];
    const ROW_SAY = {
      1: "Day 1, 06:00. Intake. Rules read. Response: “Sir yes Sir.” They wrote down what you said, and how.",
      2: "Day 2, 14:00. False statement issued (transfer). Companion (uninformed). Response: curiosity. Retained. The lie about the hour was on the sheet before Sam told it.",
      3: "Day 3, 19:00. Card table. Loss to witness. The empty chair was an item.",
      4: "Day 4, 23:00. Cabinet left unlocked. Officers' wing left unwatched. That is tonight. The door you crept through was held open.",
      5: "Day 5, 08:00. On schedule. That is tomorrow, typed already. The blank after “Response” is waiting for you.",
    };
    function openCarbon() {
      phase = "carbon";
      const el = document.createElement("div");
      el.className = K + "night";
      el.innerHTML = `<div class="${K}desk">
        <h3>NIGHT 4 · SAM'S OFFICE · 23:00</h3><img class="dv" alt="" hidden>
        <p>${wk.second() ? `Week ${wk.n()}. The officers' wing is unwatched again, and the cabinet is open again. You know it was left open for you. You can still shut it.` : "Nobody was watching the officers' wing tonight. The cabinet under the staff shelf is not locked, and one folder has your number on its tab."}</p>
        <div class="${K}things">
          <button type="button" data-t="folder"><img alt="" data-a="form-7f" hidden><span>Folder 7-F · FISK<small>open it</small></span></button>
          <button type="button" data-t="env"><img alt="" data-a="thread-own" hidden><span>An envelope<small>look</small></span></button>
          <button type="button" data-t="shelf"><img alt="" data-a="room-staff-mess" hidden><span>The staff shelf<small>look</small></span></button>
        </div>
        <div class="${K}folder" hidden><div class="${K}tabs" role="group" aria-label="Pages in the folder">${PAGES.map((pg, i) => `<button type="button" data-pg="${i}" aria-pressed="false">${pg.tab}</button>`).join("")}</div>
          <div class="${K}pg"><img alt=""><div class="${K}hits"></div></div></div>
        <p class="${K}nsay" aria-live="polite">You can open the folder, or shut the cabinet and walk back the way you came.</p>
        <div class="${K}nacts"><button type="button" class="take" data-take hidden>Tear out tonight's carbon and take it</button><button type="button" data-shut>Shut the cabinet and go back</button></div>
      </div>`;
      lock(true); wrap.appendChild(el);
      kit.png("clock-night-4", 1000).then((u) => { if (u && el.isConnected) el.style.backgroundImage = `linear-gradient(rgba(27,29,31,.84),rgba(27,29,31,.95)),url("${u}")`; });
      kit.fill(el, ".dv", "divider-stencil", 420);
      el.querySelectorAll("[data-a]").forEach((im) => kit.png(im.dataset.a, 150).then((u) => { if (u) { im.src = u; im.hidden = false; } }));
      const nsay = el.querySelector("." + K + "nsay"), folder = el.querySelector("." + K + "folder"), pgImg = folder.querySelector("." + K + "pg>img"), hits = folder.querySelector("." + K + "hits");
      const takeBtn = el.querySelector("[data-take]"), shutBtn = el.querySelector("[data-shut]");
      const sayN = (m) => { nsay.textContent = m; };
      let page = 0;
      function showPage(i) {
        page = i;
        folder.querySelectorAll("[data-pg]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.pg === i)));
        const pg = PAGES[i];
        pgImg.alt = pg.say; pgImg.removeAttribute("src");
        kit.png(pg.id, 460).then((u) => { if (u && page === i) pgImg.src = u; });
        hits.innerHTML = "";
        if (pg.id === "schedule") {
          // rows as the sheet draws them: 800 x 1100, the first at y 160, 122 high
          for (let d = 1; d <= 5; d++) {
            const b = document.createElement("button");
            b.type = "button"; b.className = K + "hit" + (sched.found[d] ? " found" : "");
            b.style.top = ((160 + (d - 1) * 122) / 1100) * 100 + "%"; b.style.height = (122 / 1100) * 100 + "%";
            b.setAttribute("aria-label", `Schedule, day ${d}`);
            b.addEventListener("click", () => readRow(d, b));
            hits.appendChild(b);
          }
          if (!wk.second()) { const m = document.createElement("div"); m.className = K + "mask"; m.textContent = "DAYS 6 AND 7 · NOT YET TYPED"; hits.appendChild(m); }
        }
        sayN(pg.id === "schedule" && wk.second() ? pg.say + " And days 6 and 7 are typed already, down to “carried him” in pencil. Last week you never saw them; this week the page is not covered. You know what it says." : pg.say);
      }
      function readRow(d, b) {
        sayN(ROW_SAY[d]);
        if (d >= 4) { sched.found[d] = true; b.classList.add("found"); }
        if (sched.found[4] && sched.found[5] && takeBtn.hidden) {
          takeBtn.hidden = false;
          if (!reduce) takeBtn.animate?.([{ transform: "scale(1.08)" }, { transform: "none" }], { duration: 500 });
        }
      }
      const LOOK = {
        env: "An envelope stamped HOLD, a house drawn in one corner in a child's manner. It never left the building. It is not addressed to you.",
        shelf: "The staff shelf: enamel mugs and a tin marked 7-F. Staff food, kept apart from yours.",
      };
      el.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => {
        if (b.dataset.t === "folder") { folder.hidden = false; showPage(0); folder.querySelector("[data-pg]").focus(); shutBtn.textContent = "Shut the cabinet and go back"; return; }
        sayN(LOOK[b.dataset.t]);
      }));
      folder.querySelectorAll("[data-pg]").forEach((b) => b.addEventListener("click", () => showPage(+b.dataset.pg)));
      const close = () => {
        el.remove(); lock(false); nightEl = null; nightKey = null; phase = "chart";
        di++; dayBreak(DAYS[di].d + 1, `Morning, day ${DAYS[di].d + 1}`, () => startDay());
      };
      takeBtn.addEventListener("click", () => {
        if (sched.read) return close();
        sched.read = true; api.store.set("sched_read", true); wk.find(4);
        sayN("L15. My file has tomorrow in it. Typed. — You fold the blue carbon into your sock. New Mexico killed the ones who complained about the heat. You didn't complain. Lucky.");
        takeBtn.textContent = "Go back to the bunk"; shutBtn.hidden = true; takeBtn.focus();
      });
      shutBtn.addEventListener("click", close);
      nightEl = el;
      nightKey = (e) => {
        if (folder.hidden) return;
        if (e.key === "ArrowRight") { showPage(Math.min(PAGES.length - 1, page + 1)); e.preventDefault(); }
        if (e.key === "ArrowLeft") { showPage(Math.max(0, page - 1)); e.preventDefault(); }
      };
      el.querySelector("[data-t=folder]").focus();
    }
    let nightEl = null, nightKey = null;

    // ---- the Schedule: the strips laid against the list entries they issued
    const STRIP_ORDER = [4, 2, 5, 3];
    const inSock = (d) => d === 4 ? sched.read || wk.has(4) : wk.has(d);
    const order = () => (sched.full ? [2, 3, 4, 5, 6] : STRIP_ORDER.filter(inSock));
    function openSchedule() {
      phase = "schedule";
      chartParts.forEach((x) => (x.hidden = true));
      schEl.hidden = false; nextBtn.hidden = true;
      $("day").textContent = sched.full ? "THE SCHEDULE · SIX STRIPS" : "DAY 5 · EVENING";
      const n = order().length, lost = STRIP_ORDER.filter((d) => !inSock(d));
      sayEl.textContent = sched.full ? "The whole Schedule. Five strips to lay against what they issued; day 1's is laid already, beside the first thing you said here. Then day 7's line." : `${n} strip${n === 1 ? "" : "s"} in your sock, laid against the list. Day 1's was in the folder; it is already laid, beside the first thing you said here.${lost.length ? ` Not in your sock yet: day ${lost.join(", day ")}. They are found on nights out.` : ""}`;
      renderSched();
      stripsEl.querySelector("button:not(.laid)")?.focus();
    }
    const stripBtn = (d, laidTo) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = K + "strip" + (laidTo ? " laid" : "");
      if (!laidTo) b.setAttribute("aria-pressed", String(sched.pick === d)); else b.disabled = true;
      b.appendChild(kit.img("schedule-strip-" + d, 440, ""));
      const t = document.createElement("span"); t.textContent = schedText(d) + (laidTo ? ` — laid against ${laidTo}` : ""); b.appendChild(t);
      if (!laidTo) b.addEventListener("click", () => { sched.pick = d; renderSched(); sayEl.textContent = `Picked: day ${d}'s strip. Now the list entry it issued.`; stripsEl.querySelector('[aria-pressed="true"]')?.focus(); });
      return b;
    };
    function renderSched() {
      stripsEl.innerHTML = "";
      stripsEl.appendChild(stripBtn(1, "“Sir yes Sir”"));
      for (const d of order()) if (!sched.laid[d] && !sched.missed[d]) stripsEl.appendChild(stripBtn(d, null));
      entsEl.innerHTML = "";
      const rows = sched.full ? [LIST[0], ISSUED[0], LIST[1], ISSUED[3], ISSUED[1], ISSUED6, ISSUED[2]] : [LIST[0], ISSUED[0], LIST[1], ISSUED[3], ISSUED[1], ISSUED[2]];
      for (const e of rows) {
        const d = Object.keys(sched.laid).find((k) => sched.laid[k] === e.id);
        const b = document.createElement("button");
        b.type = "button"; b.className = K + "ent"; b.dataset.e = e.id;
        b.innerHTML = `<b>${e.id}</b> ${e.text}${d ? `<em>ISSUED · ${schedText(+d)}</em>` : ""}`;
        if (d) b.disabled = true; else b.addEventListener("click", () => lay(e.id));
        entsEl.appendChild(b);
      }
    }
    function lay(entryId) {
      const d = sched.pick;
      if (d == null) { sayEl.textContent = "Pick a strip first."; return; }
      const right = [...ISSUED, ISSUED6].find((x) => x.strip === d);
      if (right.id === entryId) {
        sched.laid[d] = entryId; sched.pick = null;
        sayEl.innerHTML = `${d === 2 ? stampHtml("stamp-retained", "RETAINED") : ""} Laid. ${schedText(d)} What you thought you found, they had typed the day before.`;
        if (d === 2) inkStamps(sayEl, "stamp-retained");
      } else {
        sched.tries[d] = (sched.tries[d] || 0) + 1;
        if (sched.full) { sayEl.textContent = `That line was not written for that. ${right.hint}`; if (!reduce) sayEl.animate?.([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); }
        else if (sched.tries[d] >= 2) { sched.missed[d] = true; sched.pick = null; sayEl.textContent = `Not that one either. Day ${d}'s strip goes back in your sock, unread.`; }
        else { sayEl.textContent = `That line was not written for that. ${right.hint} One retry.`; if (!reduce) sayEl.animate?.([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); }
      }
      renderSched();
      if (order().every((x) => sched.laid[x] || sched.missed[x])) {
        const n = Object.keys(sched.laid).length, of = order().length;
        if (sched.full) {
          sayEl.insertAdjacentText("beforeend", " Five of five laid. Every discovery on those lines was issued, a day ahead. One strip is left: day 7, 22:00.");
          nextBtn.hidden = false; nextBtn.textContent = "The last strip · day 7"; nextBtn.focus();
        } else {
          sayEl.insertAdjacentText("beforeend", ` ${n} of ${of} laid.${n ? " Every discovery on those lines was issued." : ""} There are more strips, and they are not for today.`);
          nextBtn.hidden = false; nextBtn.textContent = "Close the chart"; nextBtn.focus();
        }
      } else (stripsEl.querySelector("button:not(.laid)") || entsEl.querySelector("button"))?.focus();
    }
    // ---- the twist: day 6. The cards are the project's; the evidence is the list, and only what was not issued.
    function openTwist() {
      phase = "twist";
      chartParts.forEach((x) => (x.hidden = true));
      rBtns.forEach((b) => { b.hidden = false; b.disabled = false; }); askBtn.hidden = false; askBtn.disabled = asks <= 0;
      twEl.hidden = false; nextBtn.hidden = true; tries = 0;
      $("day").textContent = "DAY 6"; frost(4);
      const iss = twEl.querySelector(".iss");
      for (const e of ISSUED.filter((x) => sched.read || x.id !== "L15")) { const d = document.createElement("div"); d.appendChild(kit.img("schedule-strip-" + e.strip, 440, "")); const s = document.createElement("span"); s.textContent = schedText(e.strip); d.appendChild(s); iss.appendChild(d); }
      const given = sh.get("bread_given", "");
      if (given) lad.note(wrap, `because you gave bread to ${given} in Short Rations, there is one more line on the list that nobody issued.`);
      const boots = !!sh.get("boots_kept", false);
      if (boots) lad.note(wrap, "because you took his boots back to the bunk in Snow line, there is a line on the list that nobody issued.");
      const ents = [...ISSUED.filter((e) => sched.read || e.id !== "L15").map((e) => ({ ...e, issued: true })), ...OWN, ...(given ? [{ id: "A3", text: `Gave my loaf to ${given}. It is not on any strip.` }] : []), ...(boots ? [{ id: "A4", text: "Took his boots back to the bunk, laces tied. Nobody typed it." }] : [])];
      const order = ["L8", "A1", "L10", "L15", "A2", "L9", "A3", "A4"].map((id) => ents.find((e) => e.id === id)).filter(Boolean);
      twEnts.innerHTML = "";
      for (const e of order) {
        const b = document.createElement("button");
        b.type = "button"; b.className = K + "ent"; b.dataset.e = e.id; b.setAttribute("aria-pressed", "false");
        b.innerHTML = `<b>${e.id}</b> ${e.text}${e.issued ? `<em>ISSUED · ${schedText(e.strip)}</em>` : ""}`;
        b.addEventListener("click", () => { if (twWon || !nextBtn.hidden) return; twSel.has(e.id) ? twSel.delete(e.id) : twSel.add(e.id); b.setAttribute("aria-pressed", String(twSel.has(e.id))); });
        twEnts.appendChild(b);
      }
      twCards.innerHTML = THEIRS.map((c) => `<button type="button" aria-pressed="false">${c}</button>`).join("");
      twCards.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { if (!nextBtn.hidden) return; twCard = b.textContent; twCards.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
      sayEl.textContent = "The orderly lays this morning's strip on the clipboard. “Coming along,” he says, to the page. It is what Sam says.";
      twEnts.querySelector("button").focus();
    }
    function ruleTwist(r) {
      if (!nextBtn.hidden) return;
      if (twSel.size < 2) { sayEl.textContent = "Pick at least two entries from the list. Yours, not theirs."; return; }
      if (!twCard) { sayEl.textContent = "Pick the card you are ruling on."; return; }
      const picked = [...twSel], theirs = picked.filter((id) => ISSUED.some((e) => e.id === id));
      const ok = r === "brk" && twCard === THEIRS[0] && !theirs.length;
      if (ok) {
        twWon = true; api.store.set("losses", 0);
        sayEl.innerHTML = `${stampHtml("stamp-broken", "BROKEN")} “${THEIRS[0]}.” Broken, on their sheet, with ${picked.join(" and ")} beside it. Nothing they typed made you do those. The orderly, who has not once looked at your face, looks up.`;
        inkStamps(sayEl, "stamp-broken");
        twOut.appendChild(kit.img("schedule-strip-6", 520, "Day 6's strip, stamped Broken", "strip"));
        twOut.appendChild(kit.img("icon-gaze", 84, "He is looking at you", "eye"));
        rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
        nextBtn.hidden = false; nextBtn.textContent = wk.all() && !wk.solved() ? "Lay the whole Schedule" : sched.read ? "Day 7" : "Close the chart"; nextBtn.focus();
        return;
      }
      tries++;
      const why = r !== "brk" ? "The orderly ticks the box without looking up. “On schedule.” That is the ruling they printed the card for."
        : twCard !== THEIRS[0] ? "Nothing you have written answers that card. It is about tonight and tomorrow night, and those are not on your side of the page yet."
        : `${theirs.join(" and ")} will not do. ${theirs.length > 1 ? "They were" : "It was"} issued: typed the day before you found ${theirs.length > 1 ? "them" : "it"}. A thing they gave you cannot be held against them.`;
      if (tries < TRIES + (losses >= 2 ? 1 : 0)) { sayEl.textContent = `${why} ${tries === 1 ? "Try again." : "Once more."}`; if (!reduce) sayEl.animate?.([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); return; }
      sayEl.innerHTML = `${stampHtml("stamp-supported", "SUPPORTED")} ${why} The strip goes back under the clip as it was typed.`;
      inkStamps(sayEl, "stamp-supported");
      rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
      nextBtn.hidden = false; nextBtn.textContent = "Close the chart"; nextBtn.focus();
    }
    // ---- the last step: day 7's line, typed before the choice
    function openFull() {
      sched.full = true; sched.laid = {}; sched.missed = {}; sched.tries = {}; sched.pick = null; sched.read = true;
      schEl.querySelector("h4").textContent = "THE SCHEDULE · ALL SIX STRIPS · LAID AGAINST WHAT THEY ISSUED";
      schEl.querySelector("p").textContent = "Pick a strip, then the list entry it issued. A wrong entry earns a hint, not a loss.";
      frost(4);
      openSchedule();
    }
    function openLast(final = false) {
      phase = "last"; sched.final = final;
      schEl.hidden = true; twEl.hidden = true; lastEl.hidden = false; nextBtn.hidden = true;
      rBtns.forEach((b) => (b.hidden = true)); askBtn.hidden = true;
      $("day").textContent = "DAY 7"; frost(4);
      lastEl.querySelector("." + K + "typed").textContent = `22:00  ${SCHED[7].lines[0]}\n       ${SCHED[7].lines[1]}\n       ${SCHED[7].lines[2]}`;
      const carried = !!sh.get("carried", false), pencilOpen = !final || carried;
      waysEl.innerHTML = WAYS.map((w) => `<button type="button" data-w="${w.id}" aria-pressed="false">${w.label}</button>`).join("") + `<button type="button" class="pencil" data-w="pencil" aria-pressed="false"${pencilOpen ? "" : " disabled"}>Write a line they have not typed ✎${pencilOpen ? "" : " (not done)"}</button>`;
      waysEl.querySelectorAll("button:not([disabled])").forEach((b) => b.addEventListener("click", () => chooseWay(b.dataset.w)));
      sayEl.textContent = "The orderly lays the last strip on the clipboard and reads nothing aloud." + (final ? (carried ? " Frame 112 is clipped beside it: one line of prints, every toe toward the base. That is not on the strip." : " A pencilled line would have to be something you did. You have not done anything they did not type: the carry is Snow line's, night 7.") : "");
      waysEl.querySelector("button").focus();
    }
    function chooseWay(id) {
      if (sched.way) return;
      sched.way = id;
      waysEl.querySelectorAll("button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.w === id)); b.disabled = true; });
      const w = WAYS.find((x) => x.id === id);
      if (w) {
        lastOut.innerHTML = stampHtml(w.stamp || "none", w.stampText);
        inkStamps(lastOut, w.stamp);
        sayEl.textContent = `“${w.typed}” It was typed before you chose it. The orderly ticks the line and does not look up.`;
      } else {
        lastOut.appendChild(kit.img("schedule-strip-7", 560, "Day 7's strip, with a line added by hand", K + "lastimg"));
        sayEl.textContent = "In pencil, under the typed lines: “Carry Jax over. Walk back.” There is no line for it. The orderly, who never looks at your face, looks at the sheet, and writes it in by hand: carried him.";
      }
      if (sched.final) {
        const ending = ENDING_BY_WAY[id] || ((sh.get("tray", null) || {}).ate < 1 ? "transferred" : "call_me_sam");
        wk.solve(id, ending);
        sayEl.insertAdjacentText("beforeend", ` The Schedule is laid, every line. This week ends: ${ENDING_NAMES[ending]}.`);
      }
      nextBtn.hidden = false; nextBtn.textContent = sched.final ? "Close the folder" : "Close the chart"; nextBtn.focus();
    }
    // the whole Schedule laid: the week's ending, its generated card behind the result
    const FULL_TEXT = {
      one_set_of_prints: "The Schedule is laid: every discovery on it was issued a day ahead, and you laid each against the thing it gave you. The last line is in pencil, in the orderly's hand: carried him. It is the one act on the sheet nobody typed, and it was to carry Jax to the trees and walk back in. Open the game's menu: the week is written up there.",
      the_zoo: "The Schedule is laid, every line issued a day ahead. On day 7 you ruled for the line they typed: FOLLOW: see previous. The cell was stamped before you chose it. Open the game's menu: the week is written up there.",
      rule_three: "The Schedule is laid, every line issued a day ahead. On day 7 you ruled for FENCE: photographed, not followed. They knew the route; it was clipped to the board. Open the game's menu: the week is written up there.",
      call_me_sam: "The Schedule is laid, every line issued a day ahead. On day 7 you ruled for STAY: retained. The changed man who stays in the room is the result they wanted. Open the game's menu: the week is written up there.",
      transferred: "The Schedule is laid, every line issued a day ahead. On day 7 you ruled for STAY, and you had eaten nothing: no use to them. Retained becomes transferred. Open the game's menu: the week is written up there.",
    };
    const FULL_STAMP = { one_set_of_prints: "stamp-no-crossing", the_zoo: "stamp-see-previous", call_me_sam: "stamp-retained", transferred: "stamp-hold", rule_three: "" };
    function finishFull() {
      const sol = wk.solved(); if (!sol) return finishAll();
      const e = sol.ending;
      api.store.set("losses", 0);
      kit.endCard(wrap, { ending: "ending-" + e.replace(/_/g, "-"), card: "ending-title-" + e.replace(/_/g, "-"), stamp: FULL_STAMP[e], caption: `SCHEDULE · SUBJECT: FISK · WEEK ${wk.n()} · ${ENDING_NAMES[e].toUpperCase()}` }, { outcome: "win", text: FULL_TEXT[e] });
    }
    function finishAll() {
      if (stage === 1) {
        const ok = solved.length === 1;
        api.store.set("losses", ok ? 0 : losses + 1);
        return lad.conclude(wrap, kit, stage, { card: "form-7f", stamp: ok ? "stamp-broken" : "stamp-supported", caption: ok ? "CASE 7-F · DAY 2 · BROKEN" : "CASE 7-F · DAY 2 · SHELVED" },
          ok ? { outcome: "win", text: "Day 2. A climate can make a man thin; it does not make him taller overnight. “Seen worse” is struck through on the list, with two of your own numbers beside it. The orderly: “Next.”" }
            : { outcome: "lose", text: "Day 2. Fisk shelves it: the climate, a bad posting, he has seen worse. The numbers stay on the sheet, unread." }, go);
      }
      if (twist) {
        if (!twWon) api.store.set("losses", losses + 1);
        const wayEnd = !sched.way ? "" : "ending-" + (ENDING_BY_WAY[sched.way] || "call_me_sam").replace(/_/g, "-");
        const coda = !sched.way ? "" : sched.way === "pencil" ? " Day 7: the last line on your sheet is in the orderly's handwriting, not his typewriter's." : " Day 7 went the way it was typed.";
        return lad.conclude(wrap, kit, stage, twWon ? { card: "schedule", ending: wayEnd, caption: "SCHEDULE · DAY 6 · RESPONSE: BROKEN" } : { card: "schedule", stamp: "stamp-supported", caption: "SCHEDULE · DAY 6 · ON SCHEDULE" },
          twWon ? { outcome: "win", text: `Day 6. Their card said you would report him, and their own sheet could not show it: everything they could point to, they had issued. What broke it was in your hand, and it was not on any strip. The orderly looked up. He will have to write that down, and there is no box for it.${coda}` }
            : { outcome: "lose", text: `Day 6. The card stands as typed. Their numbers could not break their own hypothesis, and the things they issued could not either. The orderly did not look up.${coda}` }, go);
      }
      sh.set("hunger_under", under);
      const n = solved.length;
      const knows = n >= 2 ? "pattern" : "anomaly";
      api.store.set("losses", n >= 2 ? 0 : losses + 1);
      const laid = Object.keys(sched.laid).length;
      const sheet = !sched.offered ? "" : !sched.read ? " The cabinet stayed shut; whatever is in that folder, you chose not to know it."
        : ` The Schedule: ${laid} of 4 strips laid against the list.`;
      const word = (under ? " You told him you were less hungry than you were; tomorrow's slab is cut smaller for it." : "") + (mismatches >= 3 ? " Three mornings your word did not match your grip: suspicion +10." : "") + (rubbed === 3 ? " Three cut columns, each ending on hunger 9; Hollis said 9 this morning." : "");
      let result;
      if (n === 3) result = { outcome: "win", text: `All three broken, with the climate before them. The food, the hunger and the routine: none of it holds against your own numbers, and they keep to a printed curve, “on schedule”. Fisk knows it is a pattern (knows: ${knows}).${sheet}${word}` };
      else if (n >= 2) result = { outcome: "win", text: `${n} of 3 explanations broken. Your own numbers keep to a printed curve: “on schedule”. Fisk knows it is a pattern (knows: ${knows}), even with one entry left standing on the list.${sheet}${word}` };
      else result = { outcome: "lose", text: `${n} of 3 broken. Fisk shelved the rest; the explanations stand, and the chart keeps to its curve whether he reads it or not (knows: ${knows}).${sheet}${word}` };
      const win = n >= 2;
      lad.conclude(wrap, kit, stage, { card: win ? "target-sheet" : "form-7f", stamp: win ? "stamp-broken" : "stamp-supported", caption: win ? "CASE 7-F · KNOWS: PATTERN" : "CASE 7-F · SHELVED" }, result, go);
    }
    const onNext = () => {
      if (phase === "schedule" && sched.full) return dayBreak(7, "Morning, day 7", () => openLast(true));
      if (phase === "last" && sched.final) return finishFull();
      if (phase === "schedule" || phase === "last") return finishAll();
      if (phase === "twist") return twWon && wk.all() && !wk.solved() ? (twEl.hidden = true, openFull()) : twWon && sched.read ? dayBreak(7, "Morning, day 7", openLast) : finishAll();
      if (phase !== "chart") return;
      if (stage === 1) return finishAll();
      if (di === 2 && !sched.offered) { sched.offered = true; nextBtn.hidden = true; return openCarbon(); }
      if (di < LAST) { di++; return dayBreak(DAYS[di].d + 1, `Morning, day ${DAYS[di].d + 1}`, () => startDay()); }
      if (sched.read) return openSchedule();
      finishAll();
    };
    nextBtn.addEventListener("click", onNext);
    rBtns.forEach((b) => b.addEventListener("click", () => (phase === "twist" ? ruleTwist(b.dataset.r) : rule(b.dataset.r))));
    askBtn.addEventListener("click", ask);
    const onKey = (e) => {
      if (nightKey && phase === "carbon") return nightKey(e);
      if ((phase !== "chart" && phase !== "twist") || brkEl) return;
      if (intro.isConnected || filling || !nextBtn.hidden) return;
      const R = phase === "twist" ? ruleTwist : rule;
      if (e.key === "s" || e.key === "S") { R("sup"); e.preventDefault(); }
      if (e.key === "b" || e.key === "B") { R("brk"); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    // at clarity tier 1 Fisk's pencil hovers over a telling cell after a while, for free (sooner after two lost charts)
    const hintTimer = setInterval(() => {
      if (filling || !nextBtn.hidden || intro.isConnected || phase !== "chart" || brkEl) return;
      idle++;
      if (phase === "chart" && idle === (losses >= 2 || stage === 1 ? 12 : 30) && !hintAt) { const D = day(); hintAt = `${D.need[0]}:${D.d}`; renderGrid(); sayEl.textContent = D.hint; }
    }, 1000);
    const startBtn = intro.querySelector("[data-start]");
    const start = () => { intro.remove(); if (twist) dayBreak(6, "Morning, day 6", openTwist); else startDay(); };
    startBtn.addEventListener("click", start);
    const fullBtn = intro.querySelector("[data-full]");
    if (fullBtn) fullBtn.addEventListener("click", () => { intro.remove(); openFull(); });
    renderGrid(); renderPlot(); renderList(); renderCards(); renderRead();
    rBtns.forEach((b) => (b.disabled = true)); askBtn.disabled = true;
    timers.push(setTimeout(() => startBtn.focus(), 30));

    return {
      unmount() {
        timers.forEach(clearTimeout); clearInterval(hintTimer);
        window.removeEventListener("keydown", onKey);
        kit.dispose();
        wrap.remove();
      },
    };
    }
  },
};

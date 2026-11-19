// Dr. Tox: Rise, 1D game: Aftermath (DESIGN.md section 11, `g1_aftermath`, reconstruction).
// Manga screentone, evidence tents: black line, flat white, grey only as dot screens. No colour but the
// amber Pulse margin every Alexander page keeps, and the archive's dim red light.
//
// "He reads the room afterward like evidence of a crime he did not witness." (Part VI, Dr. Tox §3)
// The room after, wide and still. Each trace has a numbered tent; tap it for its card (what it is and a
// clue to when). Put the tents in the strip in the order the body made them. Each correct adjacent pair
// uncovers one band of the silhouette panel: the shape the State took, never the act. Traces that are not
// his are set aside. Confirm at any time: all correct is reconstructed (Self -10), anything else is not
// (Self -15, and the panel stays blank in his record).
//
// Two pages, as the design has them:
//   I.  `s1_aftermath_1`, the depot guard post (chapter 7): six tents, direct clues. Shape I.
//   II. `s1_aftermath_2`, the archive (Green in the Archive only): nine tents, two false traces (the
//       Cauldron's etch, a guard's dropped torch), three names on tents. Shape II. Here it opens once page I
//       has been played, or when another page has set `toxin_in_escape`.
// Writes (api.shared): `toxin_events` (one entry per scene, upserted), `aftermath.solved`, `self`.
//
// Art (api.art): aftermath-depot-post, aftermath-archive, aftermath-tent-1..9, aftermath-trace-*,
// aftermath-shape-one/two/blank, aftermath-slot, aftermath-set-aside, hud-margin-calm, hud-self. Every id
// falls back to the module's own drawing when missing.
//
// Written for the game (not the bible, not DESIGN.md): the how-to text, the cards' second lines, the
// archive's seven traces of his and their clues, the three security names on the archive tents
// (Platt, Vale, Daska) and the one thing each left, and the result lines.

const P = "dtx-aft-";
const INK = "#111111", WHITE = "#ffffff", PAPER = "#f4f4f1", AMBER = "#D99A2B", RED = "#5a1416";

// ---- the two rooms ---------------------------------------------------------------------------------
// x, y: the tent's base centre, in the 1280x640 room. `n`: the tent's number. `order`: the body's order.
const PAGES = [
  {
    id: "depot", scene: "s1_aftermath_1", chapter: "c7_hunt", trigger: "scripted",
    roman: "I", name: "The guard post", room: "aftermath-depot-post", shape: "aftermath-shape-one",
    shapeTitle: "Shape I: shoulders too high",
    kick: "Chapter VII · the depot, after",
    scenery: "A cold-storage depot's guard post. A door closed on him, the guard and the dog. The panel went green from the corners, and the page was cut. Now the room is still.",
    goal: "Put the six tents in the order the body made them.",
    order: ["clock", "plate", "strap", "light", "dent", "scrape"],
    traces: {
      scrape: { n: 1, x: 905, y: 505, art: "aftermath-trace-scrape", title: "Long scrape to the door", clue: "Last. It ends at the door the guard went out by.", note: "Someone dragged himself out. The scrape is a man leaving, not a man taken." },
      light: { n: 2, x: 805, y: 128, art: "aftermath-trace-light", title: "Strip light, failed", clue: "Pulled down on one chain. Glass fell on the strap.", note: "The room went half dark here." },
      plate: { n: 3, x: 770, y: 610, art: "aftermath-trace-plate", title: "Lacquered flakes", clue: "Black plate, set hard. Shed early, long dry.", note: "The torn strap lies across two of them." },
      clock: { n: 4, x: 535, y: 165, art: "aftermath-trace-clock", title: "Wall clock, stopped", clue: "Stopped at the moment of a blow to the wall. The first thing.", note: "It says the time he cannot remember." },
      strap: { n: 5, x: 250, y: 600, art: "aftermath-trace-strap", title: "Torn strap", clue: "Torn before the dent: no glass under it.", note: "His own. The suit failing was the first thing the panel showed." },
      dent: { n: 6, x: 345, y: 430, art: "aftermath-trace-dent", title: "Locker, dented", clue: "Struck from inside the room, after the light.", note: "ARLO BENN on the door. Inside, taped up, a child's drawing." },
    },
    win: "Reconstructed. Clock, flakes, strap, light, locker, the scrape to the door. Arlo Benn went out by that door. The record has its shape, and it costs him less of himself.",
    lose: "Not reconstructed. The panel stays blank in his record, and the night costs him more of himself than it had to.",
  },
  {
    id: "archive", scene: "s1_aftermath_2", chapter: "c10_observers", trigger: "pulse",
    roman: "II", name: "The archive", room: "aftermath-archive", shape: "aftermath-shape-two",
    shapeTitle: "Shape II: a joint too many", red: true,
    kick: "Chapter X · Green in the Archive",
    scenery: "The escape's last panel went green. He wakes in dim red, small in a wide room, and the tents are already out: the Observers set them for him and stand back.",
    goal: "Nine tents. Seven are his. Order those; set the other two aside.",
    order: ["rail", "plate", "radio", "cabinet", "visor", "strap", "cuff"],
    traces: {
      cabinet: { n: 1, x: 520, y: 450, title: "Cabinet, toppled", clue: "Fell across the treads. The radio's aerial is pinned under it.", pic: "cabinet" },
      etch: { n: 2, x: 865, y: 420, art: "aftermath-trace-etch", title: "Etched doorway", clue: "Pitted at the edges, as if eaten.", note: "The edges are still warm to the hand.", not: true },
      cuff: { n: 3, x: 130, y: 480, title: "Restraint cuff, snapped", clue: "Snapped open, empty, nearest the inner door. The last thing.", pic: "cuff", name: "DASKA", note: "Inside the band, a name scratched small, for luck." },
      plate: { n: 4, x: 1065, y: 530, art: "aftermath-trace-plate", title: "Lacquered flakes", clue: "Black plate, set hard. Shed early, long dry.", note: "On the stair treads, under everything else." },
      torch: { n: 5, x: 705, y: 612, art: "aftermath-trace-torch", title: "Dropped torch", clue: "Guard issue. The switch is still on.", note: "Its beam lies along the floor toward the stair.", not: true },
      visor: { n: 6, x: 380, y: 570, title: "Visor, cracked", clue: "Lying on the toppled cabinet's side.", pic: "visor", name: "VALE", note: "In the helmet's lining, a ration bar, half eaten, wrapped again for later." },
      rail: { n: 7, x: 1180, y: 430, title: "Stair rail, bent outward", clue: "Bent from the stair side, where the alarm lamp still turns. It began here.", pic: "rail" },
      radio: { n: 8, x: 940, y: 612, title: "Radio, crushed", clue: "Flat on the treads, on top of the flakes.", pic: "radio", name: "PLATT", note: "Its channel card is corrected in a second hand." },
      strap: { n: 9, x: 225, y: 612, title: "Suit strap, torn", clue: "Torn from the suit. It lies across the visor.", pic: "strap" },
    },
    win: "Reconstructed. Rail, flakes, the radio, the cabinet, the visor, the strap, the cuff. The etch was the Cauldron's; the torch was a guard's. Platt, Vale and Daska are names in his record now, not tents.",
    lose: "Not reconstructed. The Observers fold the tents away. The panel stays blank, and the archive costs him more of himself than it had to.",
  },
];

// ---- drawing ------------------------------------------------------------------------------------
const TONE = (lvl, cell = 6) => `radial-gradient(${INK} ${Math.round(lvl * 34)}%, transparent ${Math.round(lvl * 34) + 3}%) 0 0/${cell}px ${cell}px, radial-gradient(${INK} ${Math.round(lvl * 34)}%, transparent ${Math.round(lvl * 34) + 3}%) ${cell / 2}px ${cell / 2}px/${cell}px ${cell}px`;

function toneDefs(id, lvl, cell = 7) {
  return `<pattern id="${id}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="${cell / 2}" cy="${cell / 2}" r="${(lvl * cell * 0.62).toFixed(2)}" fill="${INK}"/></pattern>`;
}

// The archive's own trace pictures (no art asset draws them): line and dot screen, 280x240.
function pic(key) {
  const id = P + "pt-" + key, L = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  const bg = (lvl) => `<defs>${toneDefs(id, lvl)}</defs><rect width="280" height="240" fill="${WHITE}"/><rect width="280" height="240" fill="url(#${id})"/>`;
  const body = {
    rail: `${bg(0.45)}<path d="M20,240 L20,150 L120,150 C170,150 190,90 230,96 L270,100" fill="none" stroke="${WHITE}" stroke-width="16"/><path d="M20,240 L20,150 L120,150 C170,150 190,90 230,96 L270,100" fill="none" ${L}/><path d="M60,240 L60,150 M100,240 L100,150" ${L}/><circle cx="240" cy="40" r="16" fill="${WHITE}" ${L}/><path d="M240,18 L240,8 M262,40 L272,40 M218,40 L208,40" ${L}/>`,
    cabinet: `${bg(0.55)}<path d="M30,200 L200,120 L250,170 L80,250Z" fill="${WHITE}" ${L}/><path d="M60,214 L210,144 M90,228 L226,160" ${L}/><path d="M200,120 L246,60 M246,60 L262,68" fill="none" stroke="${INK}" stroke-width="2.5"/>`,
    radio: `${bg(0.4)}<path d="M70,170 L190,150 L200,184 L80,206Z" fill="${WHITE}" ${L}/><path d="M100,176 L120,172 M100,188 L150,180" ${L}/><path d="M186,152 L230,90" stroke="${INK}" stroke-width="3"/><path d="M90,206 l-10,10 m40,-14 l-4,12 m40,-18 l6,12" ${L}/>`,
    visor: `${bg(0.3)}<path d="M60,160 C60,90 220,90 220,160 L200,180 L80,180Z" fill="${WHITE}" ${L}/><path d="M80,150 L200,150 L190,172 L90,172Z" fill="url(#${id})" ${L}/><path d="M120,150 L140,164 L132,172 M140,164 L160,156" fill="none" stroke="${WHITE}" stroke-width="2"/>`,
    strap: `${bg(0.35)}<path d="M30,150 C90,120 150,180 220,140" fill="none" stroke="${INK}" stroke-width="16"/><path d="M30,150 C90,120 150,180 220,140" fill="none" stroke="${WHITE}" stroke-width="10"/><path d="M220,140 l16,-14 m-16,14 l20,-2 m-20,2 l14,10" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M40,190 L250,190 L246,206 L44,206Z" fill="${WHITE}" ${L}/>`,
    cuff: `${bg(0.5)}<path d="M80,140 C80,90 180,90 180,140" fill="none" stroke="${WHITE}" stroke-width="16"/><path d="M80,140 C80,90 180,90 180,140" fill="none" ${L}/><path d="M180,140 L200,180 M80,140 L70,182" fill="none" stroke="${INK}" stroke-width="5"/><rect x="190" y="176" width="22" height="16" fill="${WHITE}" ${L}/>`,
  }[key] || bg(0.5);
  return `<svg viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}

function tentSvg(n) {
  return `<svg viewBox="0 0 140 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12,106 L29,18 L111,18 L128,106Z" fill="${WHITE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="44" y="40" width="52" height="46" fill="${INK}"/><text x="70" y="78" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="40" fill="${WHITE}">${n}</text></svg>`;
}

function shapeFallback(pageId) {
  const pts = pageId === "depot"
    ? "80,280 90,200 60,150 70,70 110,40 130,70 150,30 190,40 210,80 200,160 170,200 180,280"
    : "70,280 90,230 60,190 100,150 80,100 120,60 160,64 190,110 170,150 210,190 180,230 200,280";
  return `<svg viewBox="0 0 280 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${toneDefs(P + "sf", 0.25)}</defs><rect width="280" height="320" fill="${WHITE}"/><rect x="10" y="10" width="260" height="300" fill="url(#${P}sf)"/><polygon points="${pts}" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="10" y="10" width="260" height="300" fill="none" stroke="${INK}" stroke-width="4"/></svg>`;
}

const CSS = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${PAPER};color:${INK};font-family:"Arial Narrow","Helvetica Neue",Arial,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;box-sizing:border-box}
.${P}wrap *{box-sizing:border-box}
.${P}head{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 14px;padding:8px 12px 6px;border-bottom:3px solid ${INK};background:${WHITE}}
.${P}head h2{margin:0;font:900 clamp(20px,3vw,30px)/1 "Arial Black","Arial Narrow",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase}
.${P}head .${P}pg{font-weight:700;font-size:15px;letter-spacing:.12em;text-transform:uppercase}
.${P}cap{flex-basis:100%;font:italic 15px/1.3 Georgia,serif;margin:2px 0 0}
.${P}cap s{text-decoration-thickness:2px}
.${P}main{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) clamp(112px,14vw,170px);gap:10px;padding:8px 12px 6px}
.${P}left{display:flex;flex-direction:column;min-height:0;gap:8px}
.${P}roombox{flex:1 1 auto;min-height:110px;position:relative}
.${P}room{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border:3px solid ${INK};background:${WHITE};overflow:hidden}
.${P}room>img.${P}bg{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}room .${P}fallbg{position:absolute;inset:0;background:${TONE(0.35, 8)}}
.${P}room .${P}fallbg::after{content:"";position:absolute;left:0;right:0;top:66%;bottom:0;background:${WHITE};background:${TONE(0.6, 8)};border-top:3px solid ${INK}}
.${P}red .${P}room::after{content:"";position:absolute;inset:0;background:${RED};mix-blend-mode:multiply;opacity:.5;pointer-events:none}
.${P}spot{position:absolute;width:clamp(30px,5.4%,74px);aspect-ratio:140/120;transform:translate(-50%,-100%);border:2px dashed ${INK};background:rgba(255,255,255,.55);display:grid;place-items:center;font:700 12px sans-serif;z-index:1;pointer-events:none}
.${P}tent{position:relative;padding:0;margin:0;border:0;background:none;cursor:grab;touch-action:none;display:block;outline:none;line-height:0}
.${P}tent img,.${P}tent svg{width:100%;height:auto;display:block;pointer-events:none}
.${P}tent:focus-visible{outline:3px solid ${INK};outline-offset:2px}
.${P}tent.${P}sel{filter:drop-shadow(0 0 0 ${INK}) drop-shadow(3px 3px 0 ${INK})}
.${P}tent .${P}nm{position:absolute;left:50%;top:100%;transform:translate(-50%,1px);background:${INK};color:${WHITE};font:700 10px/1.25 sans-serif;letter-spacing:.08em;padding:0 3px;white-space:nowrap}
.${P}room .${P}tent{position:absolute;width:clamp(36px,5.6%,76px);transform:translate(-50%,-100%);z-index:2}
.${P}room .${P}tent.${P}seen::after{content:"";position:absolute;right:-3px;top:-3px;width:9px;height:9px;border-radius:50%;background:${INK};border:2px solid ${WHITE}}
.${P}row{display:flex;gap:8px;align-items:stretch}
.${P}strip{flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:0;min-width:0}
.${P}slot{flex:1 1 0;max-width:92px;min-width:0;aspect-ratio:160/150;position:relative;display:flex;align-items:center;justify-content:center;padding:14px 5px 3px;border:2px dashed ${INK};background:${TONE(0.15, 6)};background-color:${WHITE}}
.${P}slot.${P}hasart{border:0;background:center/100% 100% no-repeat}
.${P}slot>b{position:absolute;top:2px;left:50%;transform:translateX(-50%);font:700 11px sans-serif;color:${INK}}
.${P}slot.${P}hasart>b{color:${WHITE};top:1%}
.${P}slot .${P}tent{width:100%}
.${P}slot.${P}want{animation:${P}want .9s ease-in-out infinite}
@keyframes ${P}want{50%{outline:3px solid ${INK};outline-offset:2px}}
.${P}slot .${P}empty{position:absolute;inset:0;border:0;background:none;cursor:pointer;width:100%;height:100%}
.${P}slot .${P}empty:focus-visible{outline:3px solid ${INK};outline-offset:-4px}
.${P}link{flex:0 0 clamp(4px,1.2vw,12px);height:4px;border-top:2px dashed ${INK};align-self:center;margin-top:8%}
.${P}link.${P}ok{border-top:5px solid ${INK}}
.${P}tray{flex:0 0 clamp(96px,20%,220px);position:relative;display:flex;flex-direction:column;align-items:stretch}
.${P}tray .${P}lab{font:700 11px sans-serif;letter-spacing:.14em;text-align:center}
.${P}trayin{flex:1;min-height:52px;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:4px;padding:6px;border:3px solid ${INK};background:${TONE(0.4, 6)};background-color:${WHITE};position:relative}
.${P}trayin.${P}hasart{border:0;background:center/100% 100% no-repeat;padding:22px 26px 30px}
.${P}trayin .${P}tent{width:clamp(30px,40%,58px)}
.${P}trayin .${P}hint{font:700 12px sans-serif;background:${WHITE};padding:1px 4px;letter-spacing:.1em}
.${P}side{display:flex;flex-direction:column;gap:8px;min-height:0}
.${P}sil{position:relative;width:100%;aspect-ratio:280/320;border:0;flex:0 0 auto}
.${P}sil>img,.${P}sil>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}band{position:absolute;left:3.6%;right:3.6%;background:${TONE(0.3, 7)};background-color:${WHITE};border-bottom:2px solid ${INK};transition:opacity .5s}
.${P}band.${P}open{opacity:0}
.${P}rm .${P}band{transition:none}
.${P}sidelab{font:700 11px sans-serif;letter-spacing:.14em;text-transform:uppercase}
.${P}msg{font:15px/1.3 Georgia,serif;min-height:2.6em}
.${P}btn{font:800 14px "Arial Black","Arial Narrow",Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;background:${INK};color:${WHITE};border:0;padding:11px 12px;min-height:44px;cursor:pointer;box-shadow:4px 4px 0 #8a8a8a;touch-action:manipulation}
.${P}btn.${P}alt{background:${WHITE};color:${INK};border:3px solid ${INK};box-shadow:none}
.${P}btn:disabled{opacity:.35;cursor:default}
.${P}btn:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}margin{flex:0 0 auto;height:14px;width:100%;display:block;background:${AMBER} center/cover no-repeat}
.${P}modal{position:absolute;inset:0;z-index:12;display:grid;place-items:center;padding:12px;background:rgba(244,244,241,.82);background-image:${TONE(0.2, 6)};overflow:auto}
.${P}card{background:${WHITE};border:4px solid ${INK};box-shadow:8px 8px 0 ${INK};width:min(100%,360px);padding:12px;display:flex;flex-direction:column;gap:8px}
.${P}card .${P}art{width:min(100%,250px);margin:0 auto;display:block;max-height:46vh;object-fit:contain}
.${P}own{border:3px solid ${INK};padding:8px}
.${P}own svg{width:100%;height:auto;display:block;border:3px solid ${INK}}
.${P}own h3{margin:8px 0 2px;font:900 17px "Arial Black",Arial,sans-serif;text-transform:uppercase;letter-spacing:.03em}
.${P}own p{margin:0;font:16px/1.3 Georgia,serif}
.${P}card .${P}tn{display:flex;align-items:center;gap:8px;font:700 13px sans-serif;letter-spacing:.12em;text-transform:uppercase}
.${P}card .${P}tn span{background:${INK};color:${WHITE};padding:2px 7px;font-size:16px}
.${P}card .${P}note{margin:0;font:italic 15px/1.35 Georgia,serif;border-left:4px solid ${INK};padding-left:8px}
.${P}card .${P}acts{display:flex;flex-wrap:wrap;gap:8px}
.${P}card .${P}acts .${P}btn{flex:1 1 140px}
.${P}intro{position:absolute;inset:0;z-index:14;display:grid;place-items:center;padding:12px;background:${PAPER};background-image:${TONE(0.18, 7)};overflow:auto}
.${P}how{background:${WHITE};border:5px solid ${INK};box-shadow:10px 10px 0 ${INK};width:min(100%,600px);padding:0 0 14px}
.${P}how .${P}kick{background:${INK};color:${WHITE};font:700 12px sans-serif;letter-spacing:.24em;text-transform:uppercase;padding:7px 16px}
.${P}how h2{font:900 clamp(26px,5vw,38px)/1 "Arial Black",Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;margin:12px 16px 6px}
.${P}how blockquote{margin:0 16px 10px;font:italic 16px/1.4 Georgia,serif;border-left:5px solid ${INK};padding-left:10px}
.${P}how blockquote cite{display:block;font:normal 12px sans-serif;letter-spacing:.06em;margin-top:2px}
.${P}how ul{margin:0 16px 12px;padding:0 0 0 18px;font:15px/1.4 Georgia,serif}
.${P}how li{margin:2px 0}
.${P}how .${P}pages{display:flex;flex-wrap:wrap;gap:10px;margin:0 16px}
.${P}how .${P}pages button{flex:1 1 220px;text-align:left;font:15px/1.3 Georgia,serif;background:${WHITE};color:${INK};border:4px solid ${INK};padding:10px 12px;cursor:pointer;box-shadow:5px 5px 0 ${INK};min-height:64px}
.${P}how .${P}pages button b{display:block;font:900 16px "Arial Black",Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em}
.${P}how .${P}pages button:disabled{opacity:.45;cursor:default;box-shadow:none}
.${P}how .${P}pages button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}ghost{position:fixed;left:0;top:0;width:64px;pointer-events:none;z-index:50;opacity:.9;filter:drop-shadow(4px 4px 0 rgba(0,0,0,.4))}
.${P}ghost img,.${P}ghost svg{width:100%;height:auto;display:block}
@media (max-width:700px){
  .${P}main{grid-template-columns:1fr;grid-template-rows:auto auto;align-content:start;gap:12px;padding:10px 8px 4px}
  .${P}roombox{flex:0 0 auto;aspect-ratio:2/1;min-height:0}
  .${P}room .${P}tent{width:40px}
  .${P}side{flex-direction:row;align-items:center;gap:8px}
  .${P}sil{width:64px}
  .${P}sidelab{display:none}
  .${P}side .${P}msg{flex:1;font-size:14px;min-height:0}
  .${P}side .${P}btns{display:flex;flex-direction:column;gap:6px}
  .${P}btn{font-size:12px;padding:8px 10px}
  .${P}row{flex-direction:column;gap:6px}
  .${P}tray{flex:0 0 auto;flex-direction:row;align-items:center;gap:6px}
  .${P}tray .${P}lab{writing-mode:horizontal-tb;flex:0 0 auto}
  .${P}trayin{min-height:44px;flex-wrap:nowrap}
  .${P}trayin.${P}hasart{padding:4px 8px;background:${TONE(0.4, 6)};background-color:${WHITE};border:3px solid ${INK}}
  .${P}trayin .${P}tent{width:40px}
  .${P}head{padding:6px 10px 4px}
  .${P}cap{font-size:13px}
}
.${P}side .${P}btns{display:flex;flex-direction:column;gap:8px}
`;

export default {
  mount(root, api) {
    const art = api.art || { has: () => false, url: () => "", svg: () => "" };
    const has = (id) => { try { return !!art.has(id); } catch { return false; } };
    const url = (id) => { try { return has(id) ? art.url(id) : ""; } catch { return ""; } };
    const RM = !!api.reducedMotion;
    const listeners = [], timers = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
    const sget = (k, d) => { try { const v = api.shared.get(k, d); return v === undefined ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { api.shared.set(k, v); } catch { /* storage off */ } };
    const mget = (k, d) => { try { const v = api.store.get(k, d); return v === undefined ? d : v; } catch { return d; } };
    const mset = (k, v) => { try { api.store.set(k, v); } catch { /* storage off */ } };
    const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls.split(" ").map((c) => P + c).join(" "); if (html != null) e.innerHTML = html; return e; };

    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = el("div", "wrap" + (RM ? " rm" : ""));
    root.append(style, wrap);

    let page = null, st = null, ro = null, drag = null, cardOpen = null, held = null, over = false;
    const tentEls = {};

    // ---- how to play, and the page picker ------------------------------------------------------
    function intro() {
      const ov = el("div", "intro");
      const card = el("div", "how");
      const archiveOpen = !!mget("depotPlayed", false) || !!sget("toxin_in_escape", false);
      card.innerHTML = `<div class="${P}kick">1D · Aftermath · reconstruction</div>
<h2>Aftermath</h2>
<blockquote>He reads the room afterward like evidence of a crime he did not witness.<cite>Part VI, Dr. Tox §3</cite></blockquote>
<ul>
<li>The Toxin State had the controls. He does not remember. The room does.</li>
<li><b>Tap a tent</b> (or press its number) to read its trace: what it is, and a clue to when.</li>
<li><b>Drag</b> a tent into the strip, or use the card's buttons. Order the traces the way the body made them, first on the left.</li>
<li>Each pair you get right uncovers a band of the panel on the right: the shape the State took. Never what it did.</li>
<li>A trace that is not his goes in the tray marked <b>Not his</b>.</li>
<li><b>Confirm</b> when you are sure. Reconstructed, it costs him less of himself. Wrong, and the panel stays blank in his record.</li>
</ul>`;
      const pages = el("div", "pages");
      PAGES.forEach((pg, i) => {
        const b = document.createElement("button");
        b.type = "button";
        const locked = i === 1 && !archiveOpen;
        b.disabled = locked;
        b.innerHTML = `<b>${pg.roman}. ${pg.name}</b>${i === 0 ? "Chapter VII. Six tents." : locked ? "Green in the Archive only. Play the guard post first." : "Green in the Archive. Nine tents, two not his."}`;
        on(b, "click", () => { ov.remove(); start(i); });
        pages.appendChild(b);
      });
      card.appendChild(pages);
      ov.appendChild(card);
      wrap.appendChild(ov);
      later(() => { const b = pages.querySelector("button:not(:disabled)"); if (b) b.focus({ preventScroll: true }); }, 30);
    }

    // ---- one page --------------------------------------------------------------------------------
    let roomEl, roomBox, stripEl, trayIn, silEl, msgEl, confirmBtn, capEl, bands = [], links = [], slotEls = [];

    function start(i) {
      page = PAGES[i];
      over = false;
      held = null;
      const ids = Object.keys(page.traces);
      st = { loc: Object.fromEntries(ids.map((id) => [id, { where: "room" }])), slots: Array(page.order.length).fill(null), seen: {}, pairs: 0 };
      build();
      layout();
      say(page.goal);
    }

    function build() {
      wrap.innerHTML = "";
      wrap.classList.toggle(P + "red", !!page.red);
      for (const k in tentEls) delete tentEls[k];
      bands = []; links = []; slotEls = [];

      const head = el("div", "head");
      head.innerHTML = `<h2>Aftermath</h2><span class="${P}pg">${page.roman}. ${page.name}</span>`;
      capEl = el("p", "cap");
      capEl.textContent = page.scenery;
      head.appendChild(capEl);
      wrap.appendChild(head);
      strikeCaption();

      const main = el("div", "main");
      const left = el("div", "left");
      roomBox = el("div", "roombox");
      roomEl = el("div", "room");
      roomEl.setAttribute("role", "group");
      roomEl.setAttribute("aria-label", "The room after, with numbered evidence tents");
      if (has(page.room)) {
        const bg = document.createElement("img");
        bg.className = P + "bg"; bg.alt = ""; bg.draggable = false; bg.src = url(page.room);
        roomEl.appendChild(bg);
      } else roomEl.appendChild(el("div", "fallbg"));
      roomEl.dataset.drop = "room";
      for (const [id, t] of Object.entries(page.traces)) {
        const spot = el("div", "spot");
        spot.style.left = (t.x / 12.8) + "%";
        spot.style.top = (t.y / 6.4) + "%";
        spot.textContent = t.n;
        roomEl.appendChild(spot);
        tentEls[id] = makeTent(id, t);
      }
      roomBox.appendChild(roomEl);
      left.appendChild(roomBox);

      const row = el("div", "row");
      stripEl = el("div", "strip");
      stripEl.setAttribute("aria-label", "Ordering strip, first on the left");
      page.order.forEach((_, k) => {
        if (k) { const l = el("span", "link"); links.push(l); stripEl.appendChild(l); }
        const s = el("div", "slot");
        if (has("aftermath-slot")) { s.classList.add(P + "hasart"); s.style.backgroundImage = `url("${url("aftermath-slot")}")`; }
        s.dataset.drop = "slot:" + k;
        const nb = el("b", null); nb.textContent = k + 1; s.appendChild(nb);
        const eb = el("button", "empty");
        eb.type = "button"; eb.setAttribute("aria-label", `Slot ${k + 1}, empty`);
        on(eb, "click", () => slotTap(k));
        s.appendChild(eb);
        slotEls.push(s);
        stripEl.appendChild(s);
      });
      const tray = el("div", "tray");
      tray.appendChild(el("div", "lab", "NOT HIS"));
      trayIn = el("div", "trayin");
      trayIn.dataset.drop = "aside";
      if (has("aftermath-set-aside")) { trayIn.classList.add(P + "hasart"); trayIn.style.backgroundImage = `url("${url("aftermath-set-aside")}")`; }
      tray.appendChild(trayIn);
      row.append(stripEl, tray);
      left.appendChild(row);
      main.appendChild(left);

      const side = el("div", "side");
      side.appendChild(el("div", "sidelab", "What the State was"));
      silEl = el("div", "sil");
      silEl.setAttribute("role", "img");
      silEl.setAttribute("aria-label", "Silhouette panel, covered");
      if (has(page.shape)) { const im = document.createElement("img"); im.alt = ""; im.draggable = false; im.src = url(page.shape); silEl.appendChild(im); }
      else silEl.insertAdjacentHTML("beforeend", shapeFallback(page.id));
      const nb = page.order.length - 1;
      for (let k = 0; k < nb; k++) {
        const b = el("div", "band");
        b.style.top = (3.1 + (93.8 * k) / nb) + "%";
        b.style.height = (93.8 / nb) + "%";
        if (k === nb - 1) b.style.borderBottom = "0";
        bands.push(b); silEl.appendChild(b);
      }
      side.appendChild(silEl);
      msgEl = el("div", "msg");
      msgEl.setAttribute("aria-live", "polite");
      side.appendChild(msgEl);
      const btns = el("div", "btns");
      confirmBtn = el("button", "btn", "Confirm");
      confirmBtn.type = "button";
      on(confirmBtn, "click", confirm);
      const clearBtn = el("button", "btn alt", "Clear");
      clearBtn.type = "button";
      on(clearBtn, "click", () => { if (over) return; for (const id in st.loc) st.loc[id] = { where: "room" }; st.slots.fill(null); layout(); say("The strip is clear. The tents are back where they stood."); });
      btns.append(confirmBtn, clearBtn);
      side.appendChild(btns);
      main.appendChild(side);
      wrap.appendChild(main);

      const margin = el("div", "margin");
      margin.setAttribute("aria-hidden", "true");
      if (has("hud-margin-calm")) margin.style.backgroundImage = `url("${url("hud-margin-calm")}")`;
      wrap.appendChild(margin);

      fitRoom();
      if (typeof ResizeObserver !== "undefined") { if (ro) ro.disconnect(); ro = new ResizeObserver(fitRoom); ro.observe(roomBox); }
      else on(window, "resize", fitRoom);
    }

    function fitRoom() {
      if (!roomBox || !roomEl) return;
      const w = roomBox.clientWidth, h = roomBox.clientHeight;
      const rw = Math.max(80, Math.min(w, h * 2)), rh = rw / 2;
      roomEl.style.width = rw + "px";
      roomEl.style.height = rh + "px";
    }

    function makeTent(id, t) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = P + "tent";
      b.dataset.id = id;
      b.setAttribute("aria-label", `Tent ${t.n}${t.name ? ", " + t.name : ""}: ${t.title}`);
      const tid = "aftermath-tent-" + t.n;
      if (has(tid)) { const im = document.createElement("img"); im.alt = ""; im.draggable = false; im.src = url(tid); b.appendChild(im); }
      else b.insertAdjacentHTML("beforeend", tentSvg(t.n));
      if (t.name) { const n = el("span", "nm"); n.textContent = t.name; b.appendChild(n); }
      on(b, "pointerdown", (e) => pDown(e, id));
      on(b, "click", (e) => { if (drag && drag.suppress) { drag = null; e.preventDefault(); return; } tentTap(id); });
      return b;
    }

    // ---- layout: put each tent where the state says ------------------------------------------
    function layout() {
      for (const [id, t] of Object.entries(page.traces)) {
        const b = tentEls[id], loc = st.loc[id];
        b.classList.toggle(P + "sel", held === id);
        b.classList.toggle(P + "seen", !!st.seen[id]);
        if (loc.where === "room") {
          b.style.left = (t.x / 12.8) + "%";
          b.style.top = (t.y / 6.4) + "%";
          if (b.parentNode !== roomEl) roomEl.appendChild(b);
        } else {
          b.style.left = ""; b.style.top = "";
          const dest = loc.where === "aside" ? trayIn : slotEls[loc.i];
          if (b.parentNode !== dest) dest.appendChild(b);
        }
      }
      slotEls.forEach((s, k) => {
        const eb = s.querySelector("." + P + "empty");
        eb.hidden = !!st.slots[k];
        s.classList.toggle(P + "want", !!held && !over && !st.slots[k]);
      });
      const hint = trayIn.querySelector("." + P + "hint");
      if (!trayIn.querySelector("." + P + "tent")) { if (!hint) trayIn.appendChild(el("span", "hint", "drop here")); }
      else if (hint) hint.remove();
      // correct adjacent pairs: consecutive in the body's order
      let pairs = 0;
      links.forEach((l, k) => {
        const a = st.slots[k], b = st.slots[k + 1];
        const ok = !!a && !!b && page.order.indexOf(b) === page.order.indexOf(a) + 1;
        l.classList.toggle(P + "ok", ok);
        if (ok) pairs++;
      });
      const before = st.pairs;
      st.pairs = pairs;
      bands.forEach((b, k) => b.classList.toggle(P + "open", k < pairs));
      silEl.setAttribute("aria-label", `Silhouette panel, ${pairs} of ${bands.length} bands uncovered`);
      return pairs - before;
    }

    function say(t) { if (msgEl) msgEl.textContent = t; }

    // Self below 90 strikes one word in each caption (DESIGN.md section 12).
    function strikeCaption() {
      const self = Number(sget("self", 100));
      if (!(self < 90) || !capEl) return;
      const words = capEl.textContent.split(" ");
      const k = Math.min(words.length - 1, 3 + (page.order.length % 3));
      capEl.innerHTML = "";
      words.forEach((w, i) => {
        if (i) capEl.appendChild(document.createTextNode(" "));
        if (i === k) { const s = document.createElement("s"); s.textContent = w; capEl.appendChild(s); }
        else capEl.appendChild(document.createTextNode(w));
      });
    }

    // ---- moves -----------------------------------------------------------------------------------
    function moveTo(id, dest) {
      if (over) return;
      const from = st.loc[id];
      if (from.where === "slot") st.slots[from.i] = null;
      if (dest.where === "slot") {
        const occ = st.slots[dest.i];
        if (occ && occ !== id) {
          // swap: the occupant goes where the moved tent came from
          if (from.where === "slot") { st.slots[from.i] = occ; st.loc[occ] = { where: "slot", i: from.i }; }
          else st.loc[occ] = { ...from };
        }
        st.slots[dest.i] = id;
      }
      st.loc[id] = dest;
      held = null;
      const gained = layout();
      const t = page.traces[id];
      const filled = st.slots.filter(Boolean).length;
      if (dest.where === "aside") say(`Tent ${t.n} set aside: not his.`);
      else if (dest.where === "room") say(`Tent ${t.n} back where it stood.`);
      else if (gained > 0) say(`Tent ${t.n} in place ${dest.i + 1}. A band of the panel comes clear.`);
      else if (filled === st.slots.length) say("The strip is full. Confirm, or keep moving tents.");
      else say(`Tent ${t.n} in place ${dest.i + 1}.`);
    }

    function nextEmpty() { return st.slots.findIndex((s) => !s); }

    function slotTap(k) {
      if (over) return;
      if (held) moveTo(held, { where: "slot", i: k });
      else say("Pick a tent first: tap it, then choose a slot.");
    }

    function tentTap(id) {
      if (over) return;
      if (held && held !== id && st.loc[id].where === "slot") { moveTo(held, { where: "slot", i: st.loc[id].i }); return; }
      openCard(id);
    }

    // ---- the trace card ----------------------------------------------------------------------------
    function openCard(id) {
      closeCard();
      const t = page.traces[id];
      st.seen[id] = true;
      tentEls[id].classList.add(P + "seen");
      const ov = el("div", "modal");
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-label", `Tent ${t.n}: ${t.title}`);
      const c = el("div", "card");
      const tn = el("div", "tn");
      tn.innerHTML = `<span>${t.n}</span>Tent${t.name ? " · " + t.name : ""}`;
      c.appendChild(tn);
      if (t.art && has(t.art)) {
        const im = document.createElement("img"); im.className = P + "art"; im.alt = `${t.title}. ${t.clue}`; im.src = url(t.art); im.draggable = false;
        c.appendChild(im);
      } else {
        const own = el("div", "own");
        own.innerHTML = pic(t.pic || id);
        const h = el("h3", null); h.textContent = t.title;
        const p = el("p", null); p.textContent = t.clue;
        own.append(h, p);
        c.appendChild(own);
      }
      if (t.note) { const n = el("p", "note"); n.textContent = t.note; c.appendChild(n); }
      const acts = el("div", "acts");
      const loc = st.loc[id];
      const add = (label, fn, alt) => { const b = el("button", "btn" + (alt ? " alt" : ""), label); b.type = "button"; on(b, "click", fn); acts.appendChild(b); return b; };
      const ne = nextEmpty();
      const first = add(ne >= 0 ? `Next slot (${ne + 1})` : "Strip full", () => { closeCard(); moveTo(id, { where: "slot", i: nextEmpty() }); });
      if (ne < 0) first.disabled = true;
      add("Choose a slot", () => { closeCard(); held = id; layout(); say(`Tent ${t.n} in hand. Tap a slot, or another tent in the strip to swap.`); }, true);
      if (loc.where !== "aside") add("Not his", () => { closeCard(); moveTo(id, { where: "aside" }); }, true);
      if (loc.where !== "room") add("Back to the room", () => { closeCard(); moveTo(id, { where: "room" }); }, true);
      add("Close", () => closeCard(), true);
      c.appendChild(acts);
      ov.appendChild(c);
      on(ov, "pointerdown", (e) => { if (e.target === ov) closeCard(); });
      wrap.appendChild(ov);
      cardOpen = { ov, id };
      later(() => { if (cardOpen && cardOpen.ov === ov) (first.disabled ? acts.children[1] : first).focus({ preventScroll: true }); }, 20);
    }

    function closeCard() {
      if (!cardOpen) return;
      const id = cardOpen.id;
      cardOpen.ov.remove();
      cardOpen = null;
      if (tentEls[id] && !over) tentEls[id].focus({ preventScroll: true });
    }

    // ---- dragging ---------------------------------------------------------------------------------
    function pDown(e, id) {
      if (over || e.button > 0) return;
      drag = { id, x: e.clientX, y: e.clientY, pid: e.pointerId, moving: false, ghost: null, suppress: false };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* fine */ }
    }
    function pMove(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moving && dx * dx + dy * dy > 64) {
        drag.moving = true;
        const g = el("div", "ghost");
        g.innerHTML = tentEls[drag.id].innerHTML;
        document.body.appendChild(g);
        drag.ghost = g;
        tentEls[drag.id].style.opacity = ".35";
      }
      if (drag.moving) drag.ghost.style.transform = `translate(${e.clientX - 32}px,${e.clientY - 40}px)`;
    }
    function pUp(e) {
      if (!drag || e.pointerId !== drag.pid) return;
      if (!drag.moving) { drag = null; return; }
      const id = drag.id;
      drag.ghost.remove();
      tentEls[id].style.opacity = "";
      drag.suppress = true;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const zone = hit && hit.closest && hit.closest("[data-drop]");
      const t = zone ? zone.dataset.drop : "";
      if (t.startsWith("slot:")) moveTo(id, { where: "slot", i: +t.slice(5) });
      else if (t === "aside") moveTo(id, { where: "aside" });
      else if (t === "room") moveTo(id, { where: "room" });
      else say("Dropped nowhere. The tent stays where it was.");
      // the click that follows a drag is swallowed in the tent's click handler; clear it if none comes
      later(() => { if (drag && drag.suppress) drag = null; }, 300);
    }
    function pCancel() {
      if (!drag) return;
      if (drag.ghost) drag.ghost.remove();
      if (tentEls[drag.id]) tentEls[drag.id].style.opacity = "";
      drag = null;
    }
    on(window, "pointermove", pMove);
    on(window, "pointerup", pUp);
    on(window, "pointercancel", pCancel);

    // ---- keyboard ---------------------------------------------------------------------------------
    on(window, "keydown", (e) => {
      if (!page || over) return;
      if (e.key === "Escape") { if (cardOpen) { closeCard(); e.preventDefault(); } else if (held) { held = null; layout(); say("Put down."); } return; }
      if (cardOpen) return;
      if (/^[1-9]$/.test(e.key)) {
        const id = Object.keys(page.traces).find((k) => page.traces[k].n === +e.key);
        if (id) { e.preventDefault(); openCard(id); }
      } else if (e.key === "Backspace") {
        for (let k = st.slots.length - 1; k >= 0; k--) if (st.slots[k]) { moveTo(st.slots[k], { where: "room" }); e.preventDefault(); break; }
      }
    });

    // ---- confirm, and what it writes -------------------------------------------------------------
    function confirm() {
      if (over || !page) return;
      closeCard();
      const right = page.order.every((id, k) => st.slots[k] === id)
        && Object.entries(page.traces).every(([id, t]) => !t.not || st.loc[id].where === "aside");
      over = true;
      held = null;
      layout();
      confirmBtn.disabled = true;
      Object.values(tentEls).forEach((b) => { b.disabled = true; b.style.cursor = "default"; });
      if (right) bands.forEach((b) => b.classList.add(P + "open"));
      record(right);
      const placed = st.slots.filter(Boolean).length;
      let why = "";
      if (!right) {
        const wrongAside = Object.entries(page.traces).filter(([id, t]) => !t.not && st.loc[id].where === "aside").length;
        const keptFalse = Object.entries(page.traces).filter(([id, t]) => t.not && st.loc[id].where !== "aside").length;
        why = placed < page.order.length ? ` ${page.order.length - placed} of his traces were left out of the strip.` : "";
        if (keptFalse) why += ` ${keptFalse === 1 ? "One trace that was not his" : keptFalse + " traces that were not his"} stayed in his record.`;
        if (wrongAside) why += ` ${wrongAside === 1 ? "One of his own was" : wrongAside + " of his own were"} set aside.`;
        if (!why) why = ` ${st.pairs} of ${page.order.length - 1} pairs were right.`;
      }
      say(right ? "Reconstructed." : "Not reconstructed.");
      later(() => api.end({ outcome: right ? "win" : "lose", text: right ? page.win : page.lose + why }), RM ? 200 : 900);
    }

    function record(right) {
      if (page.id === "depot") mset("depotPlayed", true);
      let events = sget("toxin_events", []);
      if (!Array.isArray(events)) events = [];
      const entry = { chapter: page.chapter, scene: page.scene, trigger: page.trigger, reconstructed: right };
      const k = events.findIndex((e) => e && e.scene === page.scene);
      if (k >= 0) events[k] = { ...events[k], reconstructed: !!events[k].reconstructed || right };
      else events.push(entry);
      sset("toxin_events", events);
      sset("aftermath.solved", events.filter((e) => e && e.reconstructed && /^s1_aftermath_/.test(e.scene)).length);
      // Self: -15 for an event, -10 once its ledger entry is reconstructed. A replay adjusts this page's own cost; it never stacks.
      const applied = mget("selfApplied", {}) || {};
      const prev = applied[page.scene] || 0;
      const cost = (k >= 0 && events[k].reconstructed) || right ? 10 : 15;
      const now = prev ? Math.min(prev, cost) : cost;
      const self = Number(sget("self", 100));
      sset("self", Math.max(0, Math.min(100, (isFinite(self) ? self : 100) + prev - now)));
      applied[page.scene] = now;
      mset("selfApplied", applied);
    }

    intro();

    return {
      unmount() {
        timers.forEach(clearTimeout);
        listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
        if (ro) ro.disconnect();
        if (drag && drag.ghost) drag.ghost.remove();
        document.querySelectorAll("." + P + "ghost").forEach((g) => g.remove());
        drag = null;
        style.remove();
        wrap.remove();
      },
    };
  },
};

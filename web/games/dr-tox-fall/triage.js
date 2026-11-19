// Dr. Tox: Fall, 1D game: Triage (DESIGN.md section 11, `g1_triage`; scenes s1_triage_1 to s1_triage_4).
// Alcohol-marker sketch cards: streaky marker tones on white card stock, a name and a want in the corner.
//
// Sorting patients under scarcity. Every card is a named person with one want that is not medical. The table has
// three columns, NOW, WAIT and CANNOT. Move a card (drag it, or tap it and tap a column) and give what the page
// has: marks of the tincture (an invented unit of an unnamed tincture), water, cots and his time. A card in NOW
// whose asks are met is settled. A card in WAIT stays and its pain rises one need next round. A card in CANNOT is set
// aside by name. A mark past the need settles any card at once: the pain stops asking. The card's corner is stamped
// "came back early" in later pages. Nobody dies on the page. There is no failure: the last round ends, or the player
// closes the shutter, and the cards still unsettled leave the hall, named in the closing caption.
//
// Four pages, chosen on the how-to card: 1 the breach (two cards, one round), 2 behind the shutter (six cards plus
// the exposed from the Crowd thread, three rounds), 3 under the freeway (eight cards, the set-aside returning, four
// rounds) and 4 as Aegis (he gives no marks: he carries the CANNOT cards to cots, four lifts, and reads the stamped
// corners).
//
// Shared flags (data/flags.json): reads crowd.exposed_names, barrier.released (Nell Okafor's card), fortress.batch_hours
// (each hour takes a cot-hour), triage.set_aside (they return), pulse and self (the margin), load (page 4);
// writes triage.treated, triage.marks_given, triage.over_marks, triage.set_aside, following.
//
// Art (api.art, ASSET_MAP.md "Triage"): triage-table, triage-card-<name>, triage-tray, triage-mark, triage-mark-past,
// triage-water, triage-cot, triage-time, triage-stamp-early; shared hud-margin-calm, hud-margin-edge, hud-load,
// hud-word-hope. Every id falls back to a drawing made here when the bundle lacks it.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): the asks of every card (what each person
// wants of the page, within the two slots of the art), the supplies of each page (marks, water, cots, time), Petra's
// empty card (she asks for nothing and is left alone), Wren's plea for a third mark (page 1 and 3), the wording of the
// captions, and the `triage.stamped` list kept in this mode's own storage (not a flag). Where a page has no ledger
// of the exposed or the set-aside (the Crowd thread or an earlier page was not played) stand-in people are used.

const P = "dtf-tr-";
const INK = "#17140f", PAPER = "#FDFDFB", BOARD = "#C4CDCB", BOARD2 = "#D4DAD8", AMBER = "#D99A2B", BLUE = "#8FB0D8", RUST = "#9C4A2A", TEAL = "#5E7375";

const T = { mark: "a mark", water: "water", cot: "a cot", time: "his time" };
const LETTER = { mark: "M", water: "W", cot: "C", time: "T" };
const COLS = ["now", "wait", "cannot"];
const CNAME = { now: "NOW", wait: "WAIT", cannot: "CANNOT" };

// every person with a card in the art; asks are the two slots (added)
const PEOPLE = {
  teo:     { name: "Teo Halloran", want: "to stop being carried", asks: ["mark", "mark"] },
  wren:    { name: "Wren Halloran", want: "for her brother to walk by spring", asks: ["water", "time"] },
  lupe:    { name: "Lupe Andrade", want: "her hands steady enough to sew", asks: ["mark", "time"] },
  bashir:  { name: "Bashir Kade", want: "one night's sleep", asks: ["cot", "mark"] },
  ines:    { name: "Ines Varga", want: "someone to write a letter to her daughter in the Spire", asks: ["time", "water"] },
  kofi:    { name: "Kofi Mensah", want: "to see the river again", asks: ["mark", "mark"] },
  arturo:  { name: "Arturo Sol", want: "to keep his place in the queue he has stood in for nine years", asks: ["water"] },
  odile:   { name: "Odile Marchetti", want: "her ration card back", asks: ["time", "water"] },
  nell:    { name: "Nell Okafor", want: "her brother's water drum, still", asks: ["cot", "water"] },
  mercy:   { name: "Mercy Abiodun", want: "for the settlement not to have to be afraid", asks: ["time"] },
  dov:     { name: "Dov Ashkenazi", want: "to fix the generator for good", asks: ["time", "water"] },
  marisol: { name: "Marisol Quiroga", want: "her son's boots back from the State truck", asks: ["time", "water"] },
  yusuf:   { name: "Yusuf Demir", want: "to be useful", asks: ["mark", "water"] },
  petra:   { name: "Petra Lind", want: "to be left alone", asks: [], alone: true },
  ren:     { name: "Ren Sato", want: "to get home to his shift rota", asks: ["mark", "cot"] },
};
const KEY_OF = {}; for (const k of Object.keys(PEOPLE)) KEY_OF[PEOPLE[k].name] = k;
const STAND = [["Wynn Okoro", "a bed for his mother"], ["Sela Brandt", "her dog let in"], ["Amos Reyes", "the lamp fixed"], ["Lena Idowu", "a letter read to her"]];
const EXPOSED_ASKS = [["mark"], ["water"], ["cot"], ["mark", "water"], ["time"], ["mark", "time"]];

// the pages: supplies, rounds and the cards (the supplies are added for the game)
const PAGES = [
  { n: 1, id: "s1_triage_1", title: "The breach", chapter: "Chapter 1 · The Knock", rounds: 1, marks: 3, water: 1, cotsPer: 0, cotPool: 0, time: 1,
    scene: "Two cards, one round, a tray of marks. Wren has carried her brother down the cavern on a door. The ring on the floor keeps her outside it.",
    cards: ["teo", "wren"] },
  { n: 2, id: "s1_triage_2", title: "Behind the shutter", chapter: "Chapter 2 · Relief", rounds: 3, marks: 8, water: 4, cotsPer: 2, cotPool: 6, time: 1,
    scene: "Six cards, the people he breathed on in the queue, three rounds, two cots. Plenty of marks, little water, and his time one card at a time.",
    cards: ["lupe", "bashir", "ines", "kofi", "arturo", "odile"], nell: true, exposed: 3 },
  { n: 3, id: "s1_triage_3", title: "Under the freeway", chapter: "Chapter 5 · The Settlement", rounds: 4, marks: 8, water: 3, cotsPer: 2, cotPool: 5, time: 1,
    scene: "Eight cards and the set-aside coming back. Four rounds. People ask for more by name.",
    cards: ["teo", "dov", "marisol", "yusuf", "petra", "ren", "mercy"], returning: 2 },
  { n: 4, id: "s1_triage_4", title: "As Aegis", chapter: "Chapter 7 · The Hero Comes Down", rounds: 1, marks: 0, water: 0, cotsPer: 0, cotPool: 0, time: 0, aegis: true, lifts: 4,
    scene: "Reese gives no marks. He can stand inside the radius, so he carries the CANNOT cards to cots: four lifts. He reads the stamped corners.",
    cards: [] },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const list = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

// stage geometry (the table art is 1280 x 720)
const SW = 1280, SH = 720, COLX = [304, 629, 954], COLY = 116, COLW = 305, COLH = 580, CW = 146, CH = 204;
// the tray art (240 x 520) drawn at 0.958, its wells centred at (56 + 64i, 124 + 64j) minus 7 in the art's own space
const TS = 0.958, TX = 36, TY = 124;
const WELL = []; for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) WELL.push([56 + 64 * i, 117 + 64 * j]);

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || { has: () => false, url: () => "" };
    const A = (id) => (art.has && art.has(id) ? art.url(id) : "");
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const listeners = [], timers = new Set();
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push([t, ev, fn, o]); };
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let dead = false, ro = null;
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch (_) { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch (_) { /* storage off */ } };
    const num = (k, d) => { const v = sget(k, d); return typeof v === "number" && isFinite(v) ? v : d; };
    const stGet = (k, d) => { try { const v = store.get(k, d); return v === undefined || v === null ? d : v; } catch (_) { return d; } };
    const stSet = (k, v) => { try { store.set(k, v); } catch (_) { /* storage off */ } };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${BOARD};color:${INK};font-family:"Trebuchet MS","Segoe UI",Helvetica,Arial,sans-serif;user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}wrap *{box-sizing:border-box}
.${P}top{flex:0 0 auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:5px 10px;background:${PAPER};border-bottom:2px solid ${INK};font:700 12px/1.2 "Trebuchet MS",sans-serif;letter-spacing:.08em;text-transform:uppercase}
.${P}top .sp{flex:1}
.${P}top b{font-size:14px}
.${P}hud{display:flex;align-items:center;gap:6px}
.${P}hud .bar{position:relative;width:150px;height:16px;border:2px solid ${INK};background:${BOARD2};overflow:hidden}
.${P}hud .bar img{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
.${P}hud .bar i{position:absolute;top:0;bottom:0;width:5px;margin-left:-2px;background:${AMBER};border:1px solid ${INK}}
.${P}hud img.w{height:22px;width:auto;display:block}
.${P}board{position:relative;flex:1 1 auto;min-height:0;overflow:hidden}
.${P}sw{position:absolute;left:50%;top:50%}
.${P}stage{position:absolute;left:0;top:0;width:${SW}px;height:${SH}px;transform-origin:0 0;background:${BOARD}}
.${P}stage>img.tb{position:absolute;inset:0;width:100%;height:100%}
.${P}col{position:absolute;border-radius:10px}
.${P}col.over{outline:4px dashed ${INK};outline-offset:-4px}
.${P}col.drop{background:rgba(255,255,255,.34)}
.${P}rnd{position:absolute;left:1214px;top:16px;width:50px;text-align:center;font:700 22px/1 "Trebuchet MS",sans-serif}
.${P}tray{position:absolute;left:${TX}px;top:${TY}px;width:${240 * TS}px;height:${520 * TS}px}
.${P}tray>img{position:absolute;inset:0;width:100%;height:100%}
.${P}paperTray{position:absolute;inset:0;background:${PAPER};border:2px solid #9a9a94;border-radius:10px}
.${P}res{position:absolute;display:flex;align-items:center;justify-content:center;border:0;background:none;padding:0;cursor:grab;touch-action:none;border-radius:50%}
.${P}res img,.${P}res .gl{width:100%;height:100%;display:block;object-fit:contain;pointer-events:none}
.${P}res.held{outline:4px solid ${INK};box-shadow:0 0 0 7px ${AMBER}}
.${P}res:focus-visible{outline:4px solid ${INK};box-shadow:0 0 0 7px ${AMBER}}
.${P}tray div>img.g{width:100%;height:100%;object-fit:contain;display:block}
.${P}tray.aeg{background:${PAPER};border:2px solid #9a9a94;border-radius:10px;box-shadow:3px 4px 0 rgba(0,0,0,.12)}
.${P}tray.aeg>img,.${P}tray.aeg>.${P}paperTray{display:none}
.${P}tlab{position:absolute;font:700 11px "Trebuchet MS",sans-serif;letter-spacing:.14em;text-transform:uppercase;pointer-events:none}
.${P}card{position:absolute;width:${CW}px;height:${CH}px;border-radius:7px;cursor:grab;touch-action:none;transition:left .28s,top .28s,transform .15s,opacity .3s;outline:none}
.${P}wrap.rm .${P}card{transition:none}
.${P}card .art{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.${P}card .paper{position:absolute;inset:0;background:${PAPER};border:1.5px solid #9a9a94;border-radius:7px;box-shadow:2px 3px 0 rgba(0,0,0,.14);padding:8px;display:flex;flex-direction:column;pointer-events:none}
.${P}card .paper svg{width:100%;height:96px;display:block}
.${P}card .paper b{display:block;margin-top:6px;font:700 15px/1.1 "Trebuchet MS",sans-serif}
.${P}card .paper em{display:block;margin-top:3px;font:italic 12px/1.25 Georgia,serif;color:#333}
.${P}card .nmstrip{display:none;position:absolute;left:0;right:0;top:0;padding:3px 6px;background:rgba(253,253,251,.9);border-radius:7px 7px 0 0;font:700 12px/1.1 "Trebuchet MS",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.${P}card.sq .nmstrip{display:block}
.${P}card .sl{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;display:flex;align-items:center;justify-content:center;pointer-events:none}
.${P}card .sl .g{width:100%;height:100%;opacity:.5;border-radius:50%}
.${P}card .sl.met .g{opacity:1}
.${P}card .sl.met{background:${PAPER};border-radius:50%;box-shadow:0 0 0 1.5px ${INK}}
.${P}card .stamp{position:absolute;right:-12px;top:-4px;width:112px;transform:rotate(-9deg);pointer-events:none;opacity:.95}
.${P}card .tick{position:absolute;inset:0;display:none;align-items:center;justify-content:center;font:900 80px/1 "Trebuchet MS",sans-serif;color:#3d7a3a;pointer-events:none;text-shadow:0 0 0 #fff}
.${P}card.done .tick{display:flex}
.${P}card.done{opacity:.62}
.${P}card .big{display:none;position:absolute;left:4px;right:4px;top:84px;padding:4px 6px;background:rgba(253,253,251,.94);border:2px solid ${INK};border-radius:6px;font:700 13px/1.2 "Trebuchet MS",sans-serif;pointer-events:none}
.${P}card.waited .big{display:block}
.${P}card.sel{z-index:30;transform:scale(1.38);box-shadow:0 0 0 3px ${AMBER}}
.${P}card:focus-visible{z-index:30;box-shadow:0 0 0 4px ${INK},0 0 0 7px ${AMBER}}
.${P}card.nowc{box-shadow:0 0 0 3px rgba(217,154,43,.0)}
.${P}card.pulse{animation:${P}pop .4s}
@keyframes ${P}pop{0%{transform:scale(1.08)}100%{transform:scale(1)}}
.${P}card .row{display:none}
.${P}plea{position:absolute;left:6px;right:6px;bottom:30px;background:#fff;border:2px solid ${INK};border-radius:10px;padding:3px 6px;font:italic 12px/1.2 Georgia,serif;z-index:5;pointer-events:none}
/* narrow: a list, three sections */
.${P}nl{position:absolute;inset:0;overflow-y:auto;padding:6px 8px 10px;display:none}
.${P}wrap.narrow .${P}sw{display:none}
.${P}wrap.narrow .${P}nl{display:block}
.${P}sec{margin:0 0 8px;border-radius:8px}
.${P}sec.over{outline:3px dashed ${INK}}
.${P}sech{display:flex;align-items:center;gap:8px;padding:2px 4px 3px;font:900 16px/1 "Trebuchet MS",sans-serif;letter-spacing:.14em;border-bottom:3px solid ${INK};margin-bottom:5px}
.${P}sech small{font:italic 12px Georgia,serif;letter-spacing:0;font-weight:400}
.${P}secb{display:flex;flex-direction:column;gap:5px;min-height:34px}
.${P}secb:empty::before{content:"empty";font:italic 12px Georgia,serif;opacity:.6;padding:6px 4px}
.${P}wrap.narrow .${P}card{position:relative;left:auto!important;top:auto!important;width:auto;height:auto;min-height:56px;background:${PAPER};border:2px solid ${INK};border-radius:9px;box-shadow:2px 2px 0 rgba(0,0,0,.2);touch-action:pan-y;transition:none;cursor:pointer}
.${P}wrap.narrow .${P}card>:not(.row):not(.stamp):not(.tick){display:none!important}
.${P}wrap.narrow .${P}card{overflow:hidden;max-width:100%}.${P}wrap.narrow .${P}card .stamp{overflow:visible}.${P}wrap.narrow .${P}card.sel{transform:none;box-shadow:0 0 0 3px ${AMBER},2px 2px 0 rgba(0,0,0,.2)}
.${P}wrap.narrow .${P}card .row{display:grid;grid-template-columns:50px 1fr auto;gap:8px;align-items:center;padding:4px 6px}
.${P}wrap.narrow .${P}card .stamp{width:84px;right:-6px;top:-8px}
.${P}wrap.narrow .${P}card .tick{font-size:42px;justify-content:flex-start;padding-left:8px}
.${P}thumb{width:50px;height:50px;border-radius:6px;border:1.5px solid #9a9a94;background-color:${BOARD2};overflow:hidden}
.${P}thumb svg{width:100%;height:100%;display:block}
.${P}row{min-width:0}.${P}row .tx{min-width:0}.${P}row .tx b{display:block;font:700 14px/1.15 "Trebuchet MS",sans-serif}
.${P}row .tx span{display:block;font:italic 12px/1.25 Georgia,serif;color:#2a2a2a}
.${P}card.waited .row .tx span{font:italic 700 15px/1.2 Georgia,serif;color:${RUST}}
.${P}row .as{display:flex;gap:4px}
.${P}row .as .sl2{position:relative;width:26px;height:26px;border:2px dashed ${AMBER};border-radius:50%;display:flex;align-items:center;justify-content:center}
.${P}row .as .sl2 .g{width:18px;height:18px;opacity:.55}
.${P}row .as .sl2.met{border-style:solid;border-color:${INK};background:${PAPER}}
.${P}row .as .sl2.met .g{opacity:1}
.${P}mv{grid-column:1/-1;display:none;gap:5px;padding-top:3px}
.${P}card.sel .${P}mv{display:flex}
.${P}mv button{flex:1;min-height:44px;font:700 13px "Trebuchet MS",sans-serif;letter-spacing:.06em;background:${PAPER};color:${INK};border:2px solid ${INK};border-radius:8px;cursor:pointer}
.${P}mv button.cur{background:${INK};color:${PAPER}}
.${P}g{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font:900 10px/1 sans-serif;color:${INK}}
.${P}g.mark{background:${AMBER}}.${P}g.water{background:${BLUE}}.${P}g.cot{background:${BOARD}}.${P}g.time{background:#fff;border:1.5px solid ${INK}}
.${P}ntray{display:none;flex:0 0 auto;gap:5px;padding:5px 8px;background:${BOARD2};border-top:2px solid ${INK}}
.${P}wrap.narrow .${P}ntray{display:flex}
.${P}ntray button{flex:1;min-width:0;min-height:48px;display:flex;align-items:center;justify-content:center;gap:5px;padding:2px 3px;font:700 14px "Trebuchet MS",sans-serif;background:${PAPER};color:${INK};border:2px solid ${INK};border-radius:9px;cursor:pointer}
.${P}ntray button img,.${P}ntray button .gl{width:26px;height:26px;object-fit:contain;display:block}
.${P}ntray button.held{background:${INK};color:${PAPER};box-shadow:0 0 0 3px ${AMBER}}
.${P}ntray button:disabled{opacity:.4}
.${P}log{flex:0 0 auto;min-height:44px;padding:5px 10px;background:${PAPER};border-top:2px solid ${INK};font:700 14px/1.3 Georgia,serif}
.${P}log div{font-weight:400;font-style:italic;opacity:.55;font-size:13px}
.${P}acts{flex:0 0 auto;display:flex;gap:8px;padding:6px 8px 8px;background:${BOARD2};justify-content:flex-end;flex-wrap:wrap}
.${P}acts button,.${P}ov button.go{font:700 14px "Trebuchet MS",sans-serif;letter-spacing:.07em;text-transform:uppercase;min-height:44px;padding:6px 14px;background:${PAPER};color:${INK};border:3px solid ${INK};border-radius:9px;box-shadow:2px 2px 0 ${INK};cursor:pointer}
.${P}acts button.pri,.${P}ov button.go{background:${INK};color:${PAPER}}
.${P}acts button:focus-visible,.${P}ov button:focus-visible,.${P}ntray button:focus-visible,.${P}mv button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}acts button.glow{box-shadow:0 0 0 4px ${AMBER}}
.${P}ban{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);background:${INK};color:${PAPER};padding:10px 26px;font:900 28px "Trebuchet MS",sans-serif;letter-spacing:.14em;border-radius:6px;z-index:60;pointer-events:none;opacity:0;transition:opacity .3s}
.${P}ban.on{opacity:.93}
.${P}ghost{position:absolute;z-index:80;pointer-events:none;opacity:.88;transform:rotate(-3deg);box-shadow:4px 6px 0 rgba(0,0,0,.25)}
.${P}ov{position:absolute;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(23,20,15,.6);overflow:auto}
.${P}ov[hidden]{display:none}
.${P}panel{max-width:640px;width:100%;margin:auto;background:${PAPER};border:4px solid ${INK};border-radius:10px;box-shadow:6px 6px 0 ${INK};padding:14px 18px;background-image:repeating-linear-gradient(0deg,transparent 0 12px,rgba(143,176,216,.18) 12px 24px)}
.${P}kick{font:700 12px "Trebuchet MS",sans-serif;letter-spacing:.16em;text-transform:uppercase}
.${P}panel h2{margin:2px 0 6px;font:900 28px/1.05 "Trebuchet MS",sans-serif;text-transform:uppercase}
.${P}panel p{margin:0 0 8px;font:15px/1.4 Georgia,serif}
.${P}q{padding-left:10px;border-left:6px solid ${AMBER};font-style:italic}
.${P}keys{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:4px;font:14px/1.3 Georgia,serif}
.${P}keys li{display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:baseline}
.${P}keys b{background:${INK};color:${PAPER};font:700 11px "Trebuchet MS",sans-serif;padding:3px 6px;text-transform:uppercase;text-align:center;border-radius:4px}
.${P}seq{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 10px}
.${P}seq button{font:700 13px "Trebuchet MS",sans-serif;text-align:left;padding:8px;background:${PAPER};color:${INK};border:3px solid ${INK};border-radius:8px;cursor:pointer;min-height:56px}
.${P}seq button small{display:block;font:400 11px Georgia,serif;margin-top:2px}
.${P}seq button[aria-pressed=true]{background:${INK};color:${PAPER}}
@media (max-width:640px){.${P}panel{padding:10px 12px}.${P}panel h2{font-size:22px}.${P}seq{grid-template-columns:1fr}.${P}keys li{grid-template-columns:78px 1fr}.${P}hud .bar{width:90px}.${P}top{font-size:11px;gap:6px}.${P}acts button{flex:1}}
`;
    const topEl = document.createElement("div"); topEl.className = P + "top";
    const board = document.createElement("div"); board.className = P + "board";
    const sw = document.createElement("div"); sw.className = P + "sw";
    const stage = document.createElement("div"); stage.className = P + "stage";
    sw.appendChild(stage);
    const nl = document.createElement("div"); nl.className = P + "nl";
    board.append(sw, nl);
    const ntray = document.createElement("div"); ntray.className = P + "ntray";
    const logEl = document.createElement("div"); logEl.className = P + "log"; logEl.setAttribute("aria-live", "polite");
    const acts = document.createElement("div"); acts.className = P + "acts";
    const ban = document.createElement("div"); ban.className = P + "ban"; ban.setAttribute("aria-hidden", "true");
    const ov = document.createElement("div"); ov.className = P + "ov";
    wrap.append(css, topEl, board, ntray, logEl, acts, ban, ov);
    if (RM) wrap.classList.add("rm");
    root.appendChild(wrap);

    // ---- table (wide) ---------------------------------------------------------------------------------
    const tableUrl = A("triage-table");
    stage.innerHTML = tableUrl ? `<img class="tb" alt="" aria-hidden="true" src="${tableUrl}">` : "";
    if (!tableUrl) {
      stage.style.background = BOARD;
      COLX.forEach((x, i) => { const h = document.createElement("div"); h.style.cssText = `position:absolute;left:${x}px;top:50px;width:${COLW}px;text-align:center;font:900 34px "Trebuchet MS",sans-serif;letter-spacing:.14em;border-bottom:4px solid ${INK}`; h.textContent = CNAME[COLS[i]]; stage.appendChild(h); });
    }
    const colEls = {}, secBody = {}, secEls = {};
    COLS.forEach((c, i) => {
      const d = document.createElement("div"); d.className = P + "col"; d.dataset.col = c;
      d.style.cssText = `left:${COLX[i]}px;top:${COLY}px;width:${COLW}px;height:${COLH}px`;
      d.setAttribute("aria-label", CNAME[c] + " column");
      stage.appendChild(d); colEls[c] = d;
      const s = document.createElement("div"); s.className = P + "sec"; s.dataset.col = c;
      const h = document.createElement("div"); h.className = P + "sech"; h.innerHTML = `${CNAME[c]} <small></small>`;
      const b = document.createElement("div"); b.className = P + "secb";
      s.append(h, b); nl.appendChild(s); secBody[c] = b; secEls[c] = s;
    });
    const cardLayer = document.createElement("div"); cardLayer.style.cssText = "position:absolute;inset:0;pointer-events:none"; stage.appendChild(cardLayer);
    const rndEl = document.createElement("div"); rndEl.className = P + "rnd"; stage.appendChild(rndEl);
    const trayEl = document.createElement("div"); trayEl.className = P + "tray";
    const trayUrl = A("triage-tray");
    trayEl.innerHTML = trayUrl ? `<img alt="" aria-hidden="true" src="${trayUrl}">` : `<div class="${P}paperTray"></div><div class="${P}tlab" style="left:14px;top:12px;font-size:16px">TINCTURE</div>`;
    stage.appendChild(trayEl);
    const trayRes = document.createElement("div"); trayRes.style.cssText = "position:absolute;inset:0"; trayEl.appendChild(trayRes);

    // ---- glyphs ---------------------------------------------------------------------------------------
    const GID = { mark: "triage-mark", water: "triage-water", cot: "triage-cot", time: "triage-time" };
    function glyph(t, cls) {
      const u = A(GID[t]);
      return u ? `<img class="g ${cls || ""}" alt="" aria-hidden="true" src="${u}">` : `<span class="gl g ${P}g ${t} ${cls || ""}">${LETTER[t]}</span>`;
    }
    const silhouette = (seed) => {
      const tone = ["#8FB0D8", "#9ec7a5", "#d8b98f", "#c4a3c9", "#8fb7b5"][seed % 5];
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="${tone}" opacity=".45"/><path d="M18 100c0-26 14-36 32-40 18 4 32 14 32 40z" fill="${tone}" stroke="${INK}" stroke-width="3"/><ellipse cx="50" cy="38" rx="17" ry="20" fill="${tone}" stroke="${INK}" stroke-width="3"/></svg>`;
    };

    // ---- state ----------------------------------------------------------------------------------------
    let pg = PAGES[0], P1 = null, mode = "intro";   // intro | play | over
    let cards = [], R = null;    // R: the page's supplies
    let sel = null, held = null, wide = true, k = 1, logLines = [], ids = 0;
    const stamped = new Set((() => { const a = stGet("stamped", []); return Array.isArray(a) ? a : []; })());
    const nameSet = () => new Set(cards.map((c) => c.name));

    function mkCard(name, want, asks, o) {
      const key = KEY_OF[name] || null;
      const c = Object.assign({ id: "c" + ids++, key, name, want, asks: asks.map((t) => ({ t, met: false })), col: "wait", settled: false, over: false, waited: false,
        gone: false, alone: false, returning: false, el: null, plea: null }, o || {});
      c.stamped = stamped.has(name);
      return c;
    }
    function build(page) {
      pg = page; ids = 0; sel = null; held = null;
      cards.forEach((c) => c.el && c.el.remove()); cards = [];
      const batch = clamp(num("fortress.batch_hours", 0), 0, 4);
      R = { round: 1, rounds: page.rounds, marks: page.marks, marksMax: page.marks, water: page.water, waterMax: page.water, cotPool: Math.max(page.cotPool ? 1 : 0, page.cotPool - batch),
        cotsRound: 0, time: page.time, lifts: page.lifts || 0, treated: 0, markGiven: 0, over: 0, follow: 0, settledNames: [], overNames: [], setAside: new Map() };
      if (!page.aegis) R.cotsRound = Math.min(page.cotsPer, R.cotPool);
      if (page.n === 1) {
        for (const k2 of page.cards) { const p = PEOPLE[k2]; cards.push(mkCard(p.name, p.want, p.asks, k2 === "teo" ? { plea: { by: "Wren", text: "A third. For him. Please." } } : {})); }
      } else if (page.aegis) {
        const aside = sget("triage.set_aside", []);
        let pool = (Array.isArray(aside) ? aside : []).map((e) => (typeof e === "string" ? { name: e, want: "" } : e)).filter((e) => e && e.name);
        for (const k2 of ["arturo", "odile", "lupe", "bashir", "kofi", "ines"]) if (pool.length < 6 && !pool.some((e) => e.name === PEOPLE[k2].name)) pool.push({ name: PEOPLE[k2].name, want: PEOPLE[k2].want });
        for (const e of pool.slice(0, 6)) { const p = PEOPLE[KEY_OF[e.name]]; cards.push(mkCard(e.name, e.want || (p && p.want) || "to be seen", [], { col: "cannot", returning: true })); }
      } else {
        const names = new Set();
        for (const k2 of page.cards) { const p = PEOPLE[k2]; names.add(p.name); cards.push(mkCard(p.name, p.want, p.asks, Object.assign({}, p.alone ? { alone: true } : {}, k2 === "teo" ? { plea: { by: "Wren", text: "One more, for him. Please." } } : {}))); }
        if (page.nell && num("barrier.released", 0) >= 1) { const p = PEOPLE.nell; names.add(p.name); cards.push(mkCard(p.name, p.want, p.asks)); }
        if (page.exposed) {
          const led = sget("crowd.exposed_names", []);
          let ex = (Array.isArray(led) ? led : []).map((e) => (typeof e === "string" ? { name: e, want: "" } : e)).filter((e) => e && e.name && !names.has(e.name));
          if (!ex.length) ex = STAND.slice(0, 2).map(([name, want]) => ({ name, want, stand: true }));
          ex.slice(0, page.exposed).forEach((e, i) => { names.add(e.name); cards.push(mkCard(e.name, e.want || "to be seen", EXPOSED_ASKS[(i + 2) % EXPOSED_ASKS.length], { exposed: true })); });
        }
        if (page.returning) {
          const aside = sget("triage.set_aside", []);
          let ret = (Array.isArray(aside) ? aside : []).map((e) => (typeof e === "string" ? { name: e, want: "" } : e)).filter((e) => e && e.name && !names.has(e.name));
          if (!ret.length) { const p = PEOPLE.arturo; ret = [{ name: p.name, want: p.want }]; }
          ret.slice(0, page.returning).forEach((e) => {
            const p = PEOPLE[KEY_OF[e.name]];
            const asks = p ? p.asks.slice() : ["mark"];
            if (asks.length < 2 && !p) asks.push("water");
            if (asks.length < 2) asks.push("mark");
            names.add(e.name);
            cards.push(mkCard(e.name, e.want || (p && p.want) || "to be seen", asks.slice(0, 2), { returning: true, waited: true }));
          });
        }
      }
      for (const c of cards) buildEl(c);
      renderAll(true);
    }

    // ---- card elements --------------------------------------------------------------------------------
    function buildEl(c) {
      const el = document.createElement("div"); el.className = P + "card"; el.dataset.card = c.id; el.tabIndex = 0; el.setAttribute("role", "button");
      const au = c.key ? A("triage-card-" + c.key) : "";
      const slots = [[28, 93.6], [39.3, 93.6]];
      el.innerHTML = (au ? `<img class="art" alt="" aria-hidden="true" src="${au}">`
        : `<div class="paper">${silhouette(c.name.length)}<b>${esc(c.name)}</b><em>wants ${esc(c.want)}</em></div>`) +
        `<div class="nmstrip">${esc(c.name)}</div>` +
        slots.map((p, i) => `<div class="sl" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%"></div>`).join("") +
        `<div class="big"></div><div class="tick" aria-hidden="true">✓</div>` +
        `<div class="row ${P}row"><div class="${P}thumb" aria-hidden="true"></div><div class="tx"><b>${esc(c.name)}</b><span>${esc(c.want)}</span></div><div class="as"></div><div class="${P}mv"></div></div>`;
      const th = el.querySelector("." + P + "thumb");
      if (au) { th.style.backgroundImage = `url("${au}")`; th.style.backgroundSize = "87px 122px"; th.style.backgroundPosition = "-12px -6px"; }
      else th.innerHTML = silhouette(c.name.length);
      c.el = el;
    }
    function stampImg() { const u = A("triage-stamp-early"); return u ? `<img class="stamp" alt="Came back early" src="${u}">` : `<div class="stamp" style="border:3px solid ${RUST};color:${RUST};font:900 13px sans-serif;padding:4px;text-align:center;background:rgba(253,253,251,.8)">CAME BACK EARLY</div>`; }
    function askText(c) {
      if (!c.asks.length) return c.alone ? "nothing" : "nothing";
      return list(c.asks.map((a) => T[a.t] + (a.met ? " (given)" : "")));
    }
    function updateEl(c) {
      const el = c.el;
      el.classList.toggle("sel", sel === c.id);
      el.classList.toggle("done", c.settled);
      el.classList.toggle("waited", c.waited && !c.settled);
      el.style.display = c.gone ? "none" : "";
      el.setAttribute("aria-label", `${c.name}, wants ${c.want}. Asks ${askText(c)}. ${c.settled ? "Settled. " : ""}${c.stamped || c.over ? "Corner stamped, came back early. " : ""}In ${CNAME[c.col]}.`);
      el.setAttribute("aria-pressed", String(sel === c.id));
      el.querySelectorAll(".sl").forEach((s, i) => {
        const a = c.asks[i];
        s.className = "sl" + (a && a.met ? " met" : "");
        s.innerHTML = a ? glyph(a.t) : "";
      });
      el.querySelector(".big").textContent = "wants " + c.want;
      el.querySelector(".as").innerHTML = c.asks.length ? c.asks.map((a) => `<div class="sl2${a.met ? " met" : ""}" title="${T[a.t]}">${glyph(a.t)}</div>`).join("") : "";
      let st = el.querySelector(".stamp");
      const want = c.stamped || c.over;
      if (want && !st) el.insertAdjacentHTML("beforeend", stampImg());
      else if (!want && st) st.remove();
      let pl = el.querySelector("." + P + "plea");
      const showPlea = c.plea && c.settled && !c.over && c.pleaShown;
      if (showPlea && !pl) el.insertAdjacentHTML("beforeend", `<div class="${P}plea"><b>${esc(c.plea.by)}:</b> “${esc(c.plea.text)}”</div>`);
      else if (!showPlea && pl) pl.remove();
      const mv = el.querySelector("." + P + "mv");
      if (!mv.dataset.b || mv.dataset.b !== (pg.aegis ? "a" : "n")) {
        mv.dataset.b = pg.aegis ? "a" : "n";
        mv.innerHTML = pg.aegis ? `<button type="button" data-mv="now">Carry to a cot</button>` : COLS.map((x) => `<button type="button" data-mv="${x}">${CNAME[x]}</button>`).join("");
      }
      mv.querySelectorAll("button").forEach((b) => b.classList.toggle("cur", b.dataset.mv === c.col));
    }

    // ---- layout ---------------------------------------------------------------------------------------
    function renderAll(force) {
      const ae = document.activeElement, keep = ae && ae.closest && ae.closest("[data-card]") ? ae.closest("[data-card]").dataset.card : null;
      for (const c of cards) updateEl(c);
      COLS.forEach((col, ci) => {
        const ls = cards.filter((c) => c.col === col && !c.gone);
        const sh = secEls[col].querySelector("small");
        sh.textContent = ls.length ? ls.length + (ls.length === 1 ? " card" : " cards") : "";
        if (wide) {
          const n = ls.length, rows = Math.ceil(n / 2);
          const pitch = rows <= 1 ? 0 : Math.min(CH + 8, (COLH - CH - 14) / (rows - 1));
          ls.forEach((c, i) => {
            if (c.el.parentNode !== cardLayer) cardLayer.appendChild(c.el);
            const r = Math.floor(i / 2), cc = i % 2;
            c.el.style.left = COLX[ci] + 6 + cc * (CW + 7) + "px"; c.el.style.top = COLY + 10 + r * pitch + "px";
            c.el.style.zIndex = String(r * 2 + cc + 1);
            c.el.style.pointerEvents = "auto";
            c.el.classList.toggle("sq", rows > 1 && pitch < CH - 6);
          });
        } else {
          ls.forEach((c) => { c.el.style.left = ""; c.el.style.top = ""; c.el.style.zIndex = ""; c.el.classList.remove("sq"); });
          secBody[col].append(...ls.map((c) => c.el));
        }
      });
      for (const c of cards) if (c.gone && c.el.parentNode) c.el.remove();
      if (keep && (!document.activeElement || document.activeElement === document.body)) { const n = wrap.querySelector(`[data-card="${keep}"]`); if (n) n.focus({ preventScroll: true }); }
      renderTray(); renderTop(); renderActs();
    }

    function renderTray() {
      const pr = pg;
      trayEl.classList.toggle("aeg", !!pr.aegis);
      // wide: units drawn on the tray; narrow: one button per kind
      let h = "";
      const unit = (t, x, y, s, i) => `<button type="button" class="${P}res${held === t ? " held" : ""}" data-res="${t}" data-i="${i}" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px" aria-label="${T[t]}: pick up, then tap a card in NOW"${R && ((t === "cot" && R.cotsRound <= 0) || (t === "time" && R.time <= 0)) ? " disabled" : ""}>${glyph(t)}</button>`;
      if (pr.aegis) {
        h += `<div class="${P}tlab" style="left:16px;top:16px;font-size:15px">LIFTS</div>`;
        for (let i = 0; i < 4; i++) h += `<div style="position:absolute;left:${24 + (i % 2) * 96}px;top:${54 + Math.floor(i / 2) * 62}px;width:84px;height:50px;opacity:${i < R.lifts ? 1 : 0.2}">${glyph("cot")}</div>`;
        h += `<div class="${P}tlab" style="left:16px;top:200px;width:196px;line-height:1.5;letter-spacing:.05em;text-transform:none;font-size:13px;font-family:Georgia,serif;font-weight:400;font-style:italic">He gives no marks. He can stand inside the radius. Four lifts, to a cot.</div>`;
        trayRes.innerHTML = h;
      } else {
        for (let i = 0; i < R.marks; i++) { const w = WELL[i]; if (w) h += unit("mark", (w[0] - 22) * TS, (w[1] - 22) * TS, 44 * TS, i); }
        for (let i = 0; i < R.water; i++) h += unit("water", (108 + i * 30) * TS, 388 * TS, 40 * TS, i);
        for (let i = 0; i < R.cotsRound; i++) h += unit("cot", (100 + i * 66) * TS, 452 * TS, 62 * TS, i);
        h += `<div class="${P}tlab" style="right:10px;top:${500 * TS}px;text-align:right;color:${TEAL}">${R.cotPool}h</div>`;
        h += `<div class="${P}tlab" style="left:6px;top:${520 * TS + 22}px">his time</div>`;
        for (let i = 0; i < R.time; i++) h += unit("time", 96 + i * 46, 520 * TS + 8, 44, i);
        trayRes.innerHTML = h;
      }
      // narrow tray
      if (pr.aegis) ntray.innerHTML = `<button type="button" disabled>${glyph("cot")} ${R.lifts} lifts left</button>`;
      else {
        ntray.innerHTML = [["mark", R.marks], ["water", R.water], ["cot", R.cotsRound], ["time", R.time]].map(([t, n]) =>
          `<button type="button" data-res="${t}" class="${held === t ? "held" : ""}" ${n <= 0 ? "disabled" : ""} aria-label="${T[t]}, ${n} left: pick up, then tap a card in NOW">${glyph(t)}<span>${n}</span></button>`).join("");
      }
    }

    function renderTop() {
      const pulse = clamp(num("pulse", 20), 0, 100), self = clamp(num("self", 100), 30, 100), ld = clamp(num("load", 0), 0, 100);
      const hud = pg.aegis
        ? `<span class="${P}hud">${A("hud-word-hope") ? `<img class="w" alt="HOPE" src="${A("hud-word-hope")}">` : "HOPE"}<span class="bar" role="meter" aria-label="Load" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(ld)}">${A("hud-load") ? `<img alt="" aria-hidden="true" src="${A("hud-load")}">` : ""}<i style="left:${ld}%"></i></span></span>`
        : `<span class="${P}hud">pulse<span class="bar" role="meter" aria-label="Pulse against the Self line" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pulse)}">${A(pulse >= self - 12 ? "hud-margin-edge" : "hud-margin-calm") ? `<img alt="" aria-hidden="true" src="${A(pulse >= self - 12 ? "hud-margin-edge" : "hud-margin-calm")}">` : ""}<i style="left:${pulse}%"></i></span></span>`;
      const left = cards.filter((c) => !c.gone && !c.settled).length;
      topEl.innerHTML = `<span><b>Triage</b> · ${esc(pg.title)}</span>` +
        (pg.aegis ? `<span>lifts <b>${R.lifts}</b> / 4</span>` : `<span>round <b>${R.round}</b> / ${R.rounds}</span>`) +
        `<span>${left} waiting</span><span class="sp"></span>${hud}`;
      rndEl.textContent = pg.aegis ? `LIFTS ${R.lifts}/4` : `${R.round}/${R.rounds}`;
      rndEl.style.cssText = pg.aegis ? `left:1134px;top:12px;width:130px;height:42px;line-height:38px;background:#fff;border:2px solid ${INK};border-radius:9px;font-size:17px;letter-spacing:.1em` : "";
    }
    function renderActs() {
      if (mode !== "play") { acts.innerHTML = ""; return; }
      const last = !pg.aegis && R.round >= R.rounds;
      acts.innerHTML = (pg.aegis ? "" : `<button type="button" class="pri" data-act="end">${last ? "End the last round" : "End the round"}</button>`) +
        `<button type="button" data-act="close">Close the shutter</button><button type="button" data-act="help" aria-label="How to play">?</button>`;
    }

    function say(t) {
      logLines.unshift(t); if (logLines.length > 2) logLines.length = 2;
      logEl.innerHTML = logLines.map((l, i) => `<div style="${i === 0 ? "opacity:1;font-style:normal;font-weight:700;font-size:14px" : ""}">${esc(l)}</div>`).join("");
    }
    function banner(t) {
      ban.textContent = t; ban.classList.add("on");
      later(() => ban.classList.remove("on"), RM ? 700 : 1100);
    }
    function pop(c) { if (RM || !c.el) return; c.el.classList.remove("pulse"); void c.el.offsetWidth; c.el.classList.add("pulse"); later(() => c.el && c.el.classList.remove("pulse"), 450); }

    // ---- rules ----------------------------------------------------------------------------------------
    const byId = (id) => cards.find((c) => c.id === id);
    const supply = (t) => (t === "mark" ? R.marks : t === "water" ? R.water : t === "cot" ? R.cotsRound : R.time);

    function move(c, col) {
      if (mode !== "play" || !c || c.gone) return;
      if (pg.aegis) { if (col === "now") lift(c); else say("Reese carries. He doesn't sort."); return; }
      if (c.settled && col !== "now") { say(c.name + " is settled."); return; }
      if (c.col === col) return;
      c.col = col; pop(c);
      if (col === "cannot") say(`${c.name} is set aside. ${c.want[0].toUpperCase() + c.want.slice(1)} stays wanted.`);
      else if (col === "now") say(`${c.name} is in NOW: asks ${askText(c)}.`);
      else say(`${c.name} waits. The pain will ask for more.`);
      renderAll();
    }
    function lift(c) {
      if (c.col === "now" || c.settled) { say(c.name + " is already on a cot."); return; }
      if (R.lifts <= 0) { say("No lifts left."); return; }
      R.lifts--; c.col = "now"; c.settled = true; c.carried = true; R.treated++; R.settledNames.push(c.name); pop(c);
      say(`Reese lifts ${c.name} to a cot. ${R.lifts} lift${R.lifts === 1 ? "" : "s"} left.`);
      renderAll();
      if (R.lifts === 0) later(() => { if (!dead && mode === "play") finish(false); }, RM ? 400 : 1300);
    }
    function give(c, t) {
      if (mode !== "play" || !c || c.gone) return;
      if (pg.aegis) { say("Reese gives nothing. He carries."); return; }
      if (c.col !== "now") { say(`Move ${c.name} to NOW first.`); return; }
      if (c.settled && !(t === "mark" && !c.over)) { say(c.name + " is settled."); return; }
      if (supply(t) <= 0) { say(t === "cot" ? (R.cotPool <= 0 ? "No cot-hours left." : "No cot free this round.") : t === "time" ? "No time left this round." : `No ${t === "mark" ? "marks" : t} left.`); return; }
      const a = c.settled ? null : c.asks.find((x) => x.t === t && !x.met);
      if (!a && t !== "mark") { say(`${c.name} doesn't ask for ${T[t]}.`); return; }
      if (t === "mark") R.marks--; else if (t === "water") R.water--; else if (t === "cot") { R.cotsRound--; R.cotPool--; } else R.time--;
      if (a) {
        a.met = true;
        if (t === "mark") { R.markGiven++; R.follow += 2; say(`A mark to ${c.name}, within the need.`); }
        else say(`${T[t][0].toUpperCase() + T[t].slice(1)} for ${c.name}.`);
        if (c.asks.every((x) => x.met)) settle(c);
      } else {
        // a mark past the need: it settles the card at once, and the pain stops asking
        R.markGiven++; R.over++; R.follow += 8; R.overNames.push(c.name);
        c.asks.forEach((x) => { x.met = true; });
        c.over = true; c.stamped = true;
        say(`A mark past the need. ${c.name} stops asking, at once. They will come back early.`);
        if (!c.settled) settle(c, true); else c.pleaShown = false;
      }
      pop(c); renderAll();
    }
    function settle(c, over) {
      c.settled = true; R.treated++; R.settledNames.push(c.name);
      if (c.plea && !over) {
        c.pleaShown = true;
        say(`${c.plea.by}, from the ring's edge: “${c.plea.text}”`);
      }
    }

    function endRound() {
      if (mode !== "play" || pg.aegis) return;
      // settled cards leave; the waiting ones ask for more; the set-aside is noted by name
      for (const c of cards) if (c.settled && !c.gone) c.gone = true;
      let more = [];
      for (const c of cards) {
        if (c.gone) continue;
        if (c.col === "wait" && !c.alone) {
          c.waited = true;
          if (c.asks.length < 2) { c.asks.push({ t: "mark", met: false }); more.push(c.name); }
        }
        if (c.col === "cannot") R.setAside.set(c.name, c.want);
      }
      if (R.round >= R.rounds) { finish(false); return; }
      R.round++; R.time = pg.time; R.cotsRound = Math.min(pg.cotsPer, Math.max(0, R.cotPool)); held = null;
      if (sel && byId(sel) && byId(sel).gone) sel = null;
      banner("ROUND " + R.round);
      say(more.length ? `Round ${R.round}. ${list(more)} ask${more.length === 1 ? "s" : ""} for more now.` : `Round ${R.round}. Those who waited have waited.`);
      renderAll();
    }

    function finish(early) {
      if (mode !== "play") return;
      mode = "over";
      const left = cards.filter((c) => !c.gone && !c.settled);
      const aside = cards.filter((c) => !c.gone && !c.settled && c.col === "cannot");
      const alone = left.filter((c) => c.alone && !c.over && c.col !== "cannot");
      const gone = left.filter((c) => !alone.includes(c));
      // the ledgers
      sset("triage.treated", num("triage.treated", 0) + R.treated);
      sset("triage.marks_given", num("triage.marks_given", 0) + R.markGiven);
      sset("triage.over_marks", num("triage.over_marks", 0) + R.over);
      sset("following", clamp(num("following", 0) + R.follow, 0, 100));
      const led = sget("triage.set_aside", []);
      let ledger = (Array.isArray(led) ? led : []).map((e) => (typeof e === "string" ? { name: e, want: "" } : e)).filter((e) => e && e.name);
      ledger = ledger.filter((e) => !R.settledNames.includes(e.name));
      const have = new Set(ledger.map((e) => e.name));
      const toAdd = new Map(R.setAside); aside.forEach((c) => toAdd.set(c.name, c.want));
      if (!pg.aegis) for (const [n, w] of toAdd) if (!have.has(n) && !R.settledNames.includes(n)) ledger.push({ name: n, want: w });
      sset("triage.set_aside", ledger);
      R.overNames.forEach((n) => stamped.add(n)); stSet("stamped", [...stamped]);
      stSet("done" + pg.n, true);

      let text;
      if (pg.aegis) {
        const names = R.settledNames;
        text = names.length ? `Reese carried ${list(names)} to cots. ${gone.length ? list(gone.map((c) => c.name)) + (gone.length === 1 ? " stayed" : " stayed") + " where they were set down." : ""}` : "Nobody was carried. The set-aside stayed where they were set down.";
      } else {
        const parts = [];
        parts.push(R.settledNames.length ? `Settled: ${list(R.settledNames)}.` : "Nobody was settled.");
        if (R.overNames.length) parts.push(`${list(R.overNames)} had a mark past the need. The pain stopped asking, and the corner is stamped.`);
        if (gone.length) parts.push(`Left the hall unsettled: ${list(gone.map((c) => c.name))}.`);
        if (alone.length) parts.push(`${list(alone.map((c) => c.name))} asked to be left alone, and was.`);
        if (aside.length) parts.push(`Set aside by name: ${list(aside.map((c) => c.name))}. They come back.`);
        text = parts.join(" ");
      }
      later(() => { if (!dead) api.end({ outcome: "done", text }); }, RM ? 100 : 500);
    }

    // ---- input ----------------------------------------------------------------------------------------
    function activateCard(c) {
      if (mode !== "play" || !c) return;
      if (held && !pg.aegis) { give(c, held); if (supply(held) <= 0) held = null; renderAll(); return; }
      sel = sel === c.id ? null : c.id;
      if (sel) {
        say(pg.aegis
          ? `${c.name}: ${c.want}.${c.stamped ? " Corner stamped, came back early: the pain had stopped asking and they were set down anyway." : ""}`
          : `${c.name} wants ${c.want}. Asks ${askText(c)}.${c.stamped ? " Stamped: came back early." : ""}`);
      }
      renderAll();
    }
    function activateRes(t) {
      if (mode !== "play" || pg.aegis) return;
      held = held === t ? null : t;
      if (held) say(`Holding ${T[t]}. Tap a card in NOW.`);
      renderAll();
    }
    function activateCol(col) {
      if (mode !== "play" || !sel) return;
      const c = byId(sel); if (!c) return;
      if (pg.aegis) { if (col === "now") { lift(c); sel = null; renderAll(); } return; }
      move(c, col); sel = null; renderAll();
    }

    let drag = null, noClick = false;
    function targetUnder(x, y, attr) {
      for (const e of document.elementsFromPoint(x, y)) { const t = e.closest ? e.closest("[" + attr + "]") : null; if (t && wrap.contains(t)) return t; }
      return null;
    }
    on(board, "pointerdown", (e) => {
      if (mode !== "play" || e.button > 0) return;
      const r = e.target.closest("[data-res]"), c = e.target.closest("[data-card]");
      if (e.target.closest("[data-mv]")) return;
      if (r && !r.disabled && !pg.aegis) drag = { kind: "res", type: r.dataset.res, src: r, sx: e.clientX, sy: e.clientY, moved: false };
      else if (c) drag = { kind: "card", id: c.dataset.card, src: c, sx: e.clientX, sy: e.clientY, moved: false };
    });
    on(ntray, "pointerdown", () => { /* narrow tray taps only */ });
    function dragMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 8) return;
        if (e.pointerType === "touch" && !wide) { drag = null; return; }   // a touch on the list scrolls it
        drag.moved = true;
        const g = drag.src.cloneNode(true); g.classList.add(P + "ghost"); g.classList.remove("sel", "pulse");
        g.style.cssText = `width:${drag.kind === "card" ? (wide ? CW * k : 150) : 40}px;height:${drag.kind === "card" ? (wide ? CH * k : "auto") : 40 + "px"}`;
        g.style.position = "absolute"; g.removeAttribute("data-card"); g.removeAttribute("data-res"); g.removeAttribute("tabindex");
        g.classList.add(P + "ghost"); g.style.display = "";
        wrap.appendChild(g); drag.ghost = g;
        if (drag.kind === "card") { drag.src.style.opacity = ".35"; wrap.classList.add("dragging"); Object.values(colEls).forEach((x) => x.classList.add("drop")); }
      }
      const wr = wrap.getBoundingClientRect(), gw = drag.ghost.offsetWidth, gh = drag.ghost.offsetHeight;
      drag.ghost.style.left = e.clientX - wr.left - gw / 2 + "px"; drag.ghost.style.top = e.clientY - wr.top - gh / 2 + "px";
      Object.values(colEls).concat(Object.values(secEls)).forEach((x) => x.classList.remove("over"));
      if (drag.kind === "card") { const t = targetUnder(e.clientX, e.clientY, "data-col"); if (t) t.classList.add("over"); }
    }
    function dragEnd(e) {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      noClick = true; later(() => { noClick = false; }, 60);
      if (d.ghost) d.ghost.remove();
      d.src.style.opacity = ""; Object.values(colEls).forEach((x) => x.classList.remove("drop", "over")); Object.values(secEls).forEach((x) => x.classList.remove("over"));
      if (d.kind === "card") {
        const t = targetUnder(e.clientX, e.clientY, "data-col");
        if (t) move(byId(d.id), t.dataset.col);
      } else {
        const t = targetUnder(e.clientX, e.clientY, "data-card");
        if (t) { const c = byId(t.dataset.card); held = d.type; give(c, d.type); held = null; renderAll(); }
      }
    }
    on(window, "pointermove", dragMove);
    on(window, "pointerup", dragEnd);
    on(window, "pointercancel", () => { if (drag && drag.ghost) { drag.ghost.remove(); drag.src.style.opacity = ""; Object.values(colEls).forEach((x) => x.classList.remove("drop", "over")); } drag = null; });

    on(wrap, "click", (e) => {
      if (noClick) return;
      const mvb = e.target.closest("[data-mv]");
      if (mvb) { const c = byId(mvb.closest("[data-card]").dataset.card); if (c) { if (pg.aegis) { lift(c); } else move(c, mvb.dataset.mv); sel = null; renderAll(); } return; }
      const r = e.target.closest("[data-res]");
      if (r && !r.disabled) { activateRes(r.dataset.res); return; }
      const c = e.target.closest("[data-card]");
      if (c) { activateCard(byId(c.dataset.card)); return; }
      const act = e.target.closest("[data-act]");
      if (act) {
        if (act.dataset.act === "end") endRound();
        else if (act.dataset.act === "close") finish(true);
        else if (act.dataset.act === "help") showIntro(true);
        return;
      }
      const col = e.target.closest("[data-col]");
      if (col && board.contains(col)) { activateCol(col.dataset.col); return; }
    });
    on(document, "keydown", (e) => {
      if (mode !== "play" || ov && !ov.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase(), f = document.activeElement && document.activeElement.closest ? document.activeElement.closest("[data-card]") : null;
      if ((key === "enter" || key === " ") && f) { e.preventDefault(); activateCard(byId(f.dataset.card)); return; }
      if (key === "enter" || key === " ") { const rb = document.activeElement && document.activeElement.closest ? document.activeElement.closest("[data-res]") : null; if (rb) { e.preventDefault(); activateRes(rb.dataset.res); } return; }
      const target = f ? byId(f.dataset.card) : sel ? byId(sel) : null;
      if (key === "1" || key === "2" || key === "3") { if (target) { e.preventDefault(); if (pg.aegis) { if (key === "1") lift(target); } else move(target, COLS[+key - 1]); sel = null; renderAll(); } }
      else if (key === "m") activateRes("mark"); else if (key === "w") activateRes("water"); else if (key === "c") activateRes("cot"); else if (key === "t") activateRes("time");
      else if (key === "e") endRound();
      else if (key === "escape") { held = null; sel = null; renderAll(); }
    });

    // ---- scaling --------------------------------------------------------------------------------------
    function fit() {
      if (dead) return;
      const bw = board.clientWidth, bh = board.clientHeight;
      const nw = bw < 820 || bh < 430;
      k = Math.min(bw / SW, bh / SH);
      stage.style.transform = `scale(${k})`;
      sw.style.width = SW * k + "px"; sw.style.height = SH * k + "px"; sw.style.marginLeft = -SW * k / 2 + "px"; sw.style.marginTop = -SH * k / 2 + "px";
      if (nw !== !wide || firstFit) { wide = !nw; firstFit = false; wrap.classList.toggle("narrow", nw); if (cards.length) renderAll(); }
    }
    let firstFit = true;
    on(window, "resize", fit);
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => fit()); ro.observe(board); }

    // ---- intro ----------------------------------------------------------------------------------------
    let chosen = 1;
    function showIntro(resume) {
      ov.hidden = false;
      const pgx = PAGES.find((p) => p.n === chosen) || PAGES[0];
      ov.innerHTML = `<div class="${P}panel" role="dialog" aria-label="How to play Triage">
<div class="${P}kick">${esc(pgx.chapter)}</div><h2>Triage · ${esc(pgx.title)}</h2>
<p class="${P}q">“Two marks. Not three.”</p>
<p>${esc(pgx.scene)}</p>
<ul class="${P}keys">
${pgx.aegis ? `<li><b>Lift</b><span>Tap a card, then Carry to a cot, or drag it into NOW. Four lifts. Tap a stamped card to read its corner.</span></li>`
        : `<li><b>Sort</b><span>Drag a card into NOW, WAIT or CANNOT, or tap it and tap a column. Keys 1, 2, 3 move the card you are on.</span></li>
<li><b>Give</b><span>Drag a mark, water, a cot or his time onto a card in NOW, or tap the item and then the card. A card with all its asks met is settled.</span></li>
<li><b>Round</b><span>WAIT cards ask for more next round. CANNOT cards are set aside by name, and come back.</span></li>
<li><b>Marks</b><span>A mark past the need settles a card at once. It also makes them need you. Nobody tells you how many that is.</span></li>`}
</ul>
<p style="font-size:12px;opacity:.75">The mark is an invented unit. The page never shows what the tincture is, or how it is given.</p>
${resume && mode === "play" ? "" : `<div class="${P}kick">Page</div><div class="${P}seq">${PAGES.map((p) => `<button type="button" data-pg="${p.n}" aria-pressed="${p.n === chosen}">${p.n}. ${esc(p.title)}<small>${p.aegis ? "As Aegis, if he stood down" : p.rounds + " round" + (p.rounds > 1 ? "s" : "")}</small></button>`).join("")}</div>`}
<button type="button" class="go" data-go>${resume && mode === "play" ? "Back to the table" : "Open the table"}</button></div>`;
      ov.querySelectorAll("[data-pg]").forEach((b) => on(b, "click", () => { chosen = +b.dataset.pg; showIntro(false); }));
      const go = ov.querySelector("[data-go]");
      on(go, "click", () => {
        ov.hidden = true;
        if (!(resume && mode === "play")) start();
      });
      go.focus({ preventScroll: true });
    }
    function start() {
      mode = "play";
      build(PAGES.find((p) => p.n === chosen) || PAGES[0]);
      logLines = []; logEl.innerHTML = "";
      say(pg.aegis ? "Reese stands in the hall. The set-aside are where they were set down." : `Round 1 of ${pg.rounds}. Move a card to NOW, then give.`);
      fit(); renderAll(true);
      banner(pg.aegis ? "AS AEGIS" : "ROUND 1");
    }

    fit();
    showIntro(false);
    topEl.innerHTML = `<span><b>Triage</b></span>`;

    return {
      unmount() {
        dead = true;
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const id of timers) clearTimeout(id);
        timers.clear();
        if (ro) { try { ro.disconnect(); } catch (_) { /* gone */ } }
        if (drag && drag.ghost) drag.ghost.remove();
        wrap.remove();
      },
    };
  },
};

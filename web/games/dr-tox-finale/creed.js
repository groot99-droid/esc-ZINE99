// Dr. Tox: Finale / The Creed (1D, dominoes; DESIGN.md section 11, `g1_creed`; scenes s1_creed_1, s1_creed_2).
// Pocket tract booklet: a small stapled booklet on thin paper in two inks (black and one red), a heavy title
// band, his lines split across domino ends, a verse printed at the foot as joints are made.
//
// A set of 28 tiles. Each end carries a word, not pips: blank, RING, MARK, NEED, AMBER, RCC, BLOOD. Dr. Tox and
// the lector (Mercy) take turns laying a tile at either open end of the chain, ends matching; a player who cannot
// lay draws from the boneyard. Doctrine (cult.doctrine): each BLOOD joint +4 (creed.blood_joints +1: the lector
// reads "NOT MY BLOOD. NOT ALL OF IT." as ALL OF IT IS HIS BLOOD); each other joint the lector makes +2; each RING
// or NEED joint Dr. Tox makes -3 (creed.word_joints +1). A hand ends when one side goes out or the chain is
// blocked; his remaining tiles with a BLOOD end are read aloud anyway (+2 each). He can win a hand and still lose
// the verse. Cally deals him, once a hand, a tile that is not his (a painted sky, a loop of string): it matches
// nothing; laid crosswise as a spinner it costs his turn (creed.sky_tiles +1, cally.crack +5), or it goes face
// down with no effect. Creed 2 (the camp, three hands): if split.cult_marks >= 3 he holds the naming tile (the
// station keeper's name, blank both ends); laid on a BLOOD end it closes that end (creed.named_harm, doctrine -10).
// Creed 1 is two hands; the lector goes to BLOOD only when she can, and not every time. Creed 2 is three hands,
// and she goes to BLOOD whenever she can.
//
// Reads (data/flags.json): following, cult.icon, manifold.resin_line, bloom.settlement_lost, fiche.names_read,
// cult.doctrine, cally.crack, cally.kept_secret, split.cult_marks. Writes: cult.doctrine, creed.blood_joints,
// creed.word_joints, creed.sky_tiles, cally.crack, creed.named_harm. A replay undoes that page's earlier write
// first, so nothing is counted twice. No HUD on this page: the doctrine is a line of type on the cover that
// grows, and the verse at the foot. Nothing here is a quantity of anything: the unit is a word.
//
// Failure: none (the design says so). The page ends `win` when the tract's doctrine rose by less than WIN_PER_HAND
// a hand on average (he kept most of it his), and `done` otherwise, and says what was printed.
//
// Art (games/dr-tox-finale/art/ASSET_MAP.md, "The Creed"): creed-tile-frame with creed-end-<word> in its slots,
// creed-tile-sky/-string/-naming, creed-tile-back, creed-boneyard, creed-hand-tray, creed-spread, creed-cover-line,
// creed-tract-cover, creed-lector, creed-dealer-hands, creed-tox-hand, creed-hint, creed-verse-blood/-ring. Every id
// falls back to a drawing made here when the bundle lacks it.
//
// Quoted from the author's work, verbatim (DESIGN.md section 11): the tile lines "Stay outside | the ring",
// "Two marks. | Not three.", "Not my blood. | Not all of it.", "That plate says | who runs this hall"; the verse
// "ALL OF IT IS HIS BLOOD." and "THE RING IS HOLY." (the lector's readings). Bible: "his beliefs have outgrown him"
// (Part VI, Dr. Tox, Story: The Finale).
//
// Added for the game (not in DESIGN.md; the author approves or strikes): the other 24 tile lines (the HEAD and TAIL
// fragments below, joined by the two ends); the verse lines for the other joints; the dealer's captions and the
// string tile's; the starter tile; the lector's chance of going to BLOOD in Creed 1; going out with only a dealt or
// naming tile left; the win threshold; the how-to and the hand and verdict wording; the hall's variants by Fall flags.

const P = "dtf-cr-";
const INK = "#1c1b1a", RED = "#b3261e", PAPER = "#f1ecdc", PAPER2 = "#e6dfc9", DESK = "#2b2926";
const MONO = "'IBM Plex Mono','Courier New',Courier,monospace";
const DISPLAY = "'Oswald','Arial Narrow',Impact,sans-serif";
const WORDS = ["blank", "ring", "mark", "need", "amber", "rcc", "blood"];
const LABEL = { blank: "BLANK", ring: "RING", mark: "MARK", need: "NEED", amber: "AMBER", rcc: "RCC", blood: "BLOOD" };
const WIN_PER_HAND = 14;  // doctrine rise per hand, on average, at or under which the tract is mostly his (play averages about 17)

// His lines, split across the two ends. Four are the author's (DESIGN.md section 11); the rest are joined from these.
const HEAD = { blank: "Listen,", ring: "Stay back,", mark: "Count the marks,", need: "Say what you need,", amber: "Hold the lamp,", rcc: "Say RCC,", blood: "Not my blood," };
const TAIL = { blank: "and breathe.", ring: "keep the ring.", mark: "name the hand.", need: "then go home.", amber: "it is a cage.", rcc: "it is the State.", blood: "not all of it." };
const OWN = {
  "ring|blank": ["Stay outside", "the ring"],
  "mark|blank": ["Two marks.", "Not three."],
  "blood|blank": ["Not my blood.", "Not all of it."],
  "rcc|blank": ["That plate says", "who runs this hall"],
};
const VERSE = {
  blood: "ALL OF IT IS HIS BLOOD.", ringLector: "THE RING IS HOLY.", ringTox: "STAY OUTSIDE THE RING.",
  need: "SAY WHAT YOU NEED.", mark: "ONE MARK, ONE HAND.", amber: "THE LAMP IS LIT.", rcc: "THE PLATE SAYS WHO RUNS THIS HALL.", blank: "BREATHE.",
};

const DEALS = [
  { kind: "sky", say: "A painted sky on both ends. A dark-haired woman in the back row dealt it to him. It matches nothing." },
  { kind: "string", say: "A loop of string, dealt to him from the back row. It matches nothing." },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const key = (a, b) => (WORDS.indexOf(a) <= WORDS.indexOf(b) ? `${a}|${b}` : `${b}|${a}`);

function fullSet() {
  const out = []; let n = 0;
  for (let i = 0; i < WORDS.length; i++) for (let j = i; j < WORDS.length; j++) {
    const a = WORDS[i], b = WORDS[j];
    // the author's lines are stored as (word|blank); the pair is its own set key
    const own = OWN[`${b}|${a}`] || OWN[`${a}|${b}`];
    out.push({ id: n++, a, b, kind: "dom", line: own || [HEAD[a], TAIL[b]] });
  }
  return out;
}

const PAGES = [
  { scene: "s1_creed_1", n: 1, place: "The cavern hall", year: "2236", hands: 2, lectorBlood: 0.7 },
  { scene: "s1_creed_2", n: 2, place: "The camp below the last city", year: "2238", hands: 3, lectorBlood: 1 },
];

function css() {
  return `
.${P}page{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;background:${DESK};background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1.3px);background-size:6px 6px;color:${INK};font-family:${MONO};-webkit-tap-highlight-color:transparent}
.${P}book{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;box-sizing:border-box;margin:8px auto;width:calc(100% - 16px);max-width:1180px;background:${PAPER};box-shadow:0 0 0 1px #0006,4px 6px 0 rgba(0,0,0,.35);padding:0 0 6px}
.${P}book::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:0;border-left:1px dashed rgba(28,27,26,.18);pointer-events:none}
.${P}stap{position:absolute;left:50%;width:14px;height:3px;margin-left:-7px;background:#8d8a80;border-radius:1px;pointer-events:none}
.${P}head{position:relative;display:flex;align-items:center;gap:10px;padding:8px 14px 6px;flex-wrap:wrap}
.${P}title{flex:0 0 auto;font:700 clamp(20px,3.4vw,30px) ${DISPLAY};letter-spacing:.14em;text-transform:uppercase;background:${INK};color:${PAPER};padding:2px 14px 1px;line-height:1.3}
.${P}dated{font-size:12px;letter-spacing:.05em;color:${INK};opacity:.85}
.${P}cl{position:relative;flex:1 1 280px;max-width:640px;min-width:0;aspect-ratio:640/60;display:block}
.${P}cl img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
.${P}cl span.${P}ty{position:absolute;left:24%;right:3%;top:0;bottom:0;display:flex;align-items:center;justify-content:flex-end;gap:.8em;overflow:hidden;white-space:nowrap;font:700 clamp(10px,1.45vw,13px) ${MONO};letter-spacing:.06em;padding-top:5%;box-sizing:border-box}
.${P}cl.${P}nf{border:1.5px solid ${INK};background:${PAPER2};aspect-ratio:auto;height:34px}
.${P}cl.${P}nf::before{content:"DOCTRINE:";position:absolute;left:8px;top:50%;transform:translateY(-50%);font:700 12px ${MONO};color:${RED}}
.${P}red{color:${RED}}
.${P}table{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 10px;padding:0 12px}
.${P}chainbox{position:relative;min-height:0;overflow:auto;border:1.5px solid ${INK};background:${PAPER2};background-position:center;background-size:cover;padding:10px}
.${P}chainbox.${P}art{background-color:${PAPER}}
.${P}chain{display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px 4px;align-items:center}
.${P}side{position:relative;width:176px;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:2px}
.${P}side img{display:block;width:100%;height:auto;pointer-events:none}
.${P}lec{width:min(150px,100%)}
.${P}turn{font:700 11px ${MONO};letter-spacing:.1em;text-align:center;padding:3px 6px;border:1.5px solid ${INK};background:${PAPER};min-width:120px}
.${P}turn.${P}you{background:${INK};color:${PAPER}}
.${P}dealer{width:100%;transition:opacity .4s}
.${P}tile{position:relative;flex:0 0 auto;width:var(--tw,150px);aspect-ratio:260/180;box-sizing:border-box;padding:0;margin:0;border:0;background:transparent;font-family:${MONO}}
.${P}tile .${P}fr{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.${P}tile .${P}ff{position:absolute;inset:0;border:2px solid ${INK};background:${PAPER};border-radius:3px;box-shadow:1px 2px 0 rgba(0,0,0,.25)}
.${P}tile .${P}ff::after{content:"";position:absolute;left:50%;top:22%;bottom:5%;border-left:2px solid ${INK}}
.${P}end{position:absolute;top:22.2%;width:43.8%;height:73.3%;pointer-events:none}
.${P}end.${P}L{left:3.85%}.${P}end.${P}R{left:52.3%}
.${P}end img{width:100%;height:100%;display:block}
.${P}end b{position:absolute;inset:3px;border:1.5px solid ${INK};display:flex;align-items:center;justify-content:center;font:700 clamp(8px,1.5vw,12px) ${MONO};letter-spacing:.04em;background:${PAPER2}}
.${P}end b.${P}rd{color:${RED};border-color:${RED}}
.${P}bar{position:absolute;left:4%;right:4%;top:2.5%;height:18%;display:flex;align-items:center;justify-content:space-between;gap:4px;font:600 8.5px/1.05 ${MONO};letter-spacing:0;overflow:hidden;pointer-events:none;color:${INK}}
.${P}bar i{font-style:normal;flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${P}bar i:last-child{text-align:right}
.${P}tile.${P}special .${P}bar{display:none}
.${P}nm{position:absolute;left:8%;right:8%;top:34%;bottom:10%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font:700 clamp(9px,1.5vw,13px)/1.15 ${MONO};letter-spacing:.06em;pointer-events:none}
.${P}nm small{font-weight:400;letter-spacing:0;font-size:8.5px}
.${P}hand .${P}tile{cursor:pointer;transition:transform .12s,filter .12s;outline:none}
.${P}hand .${P}tile.${P}no{filter:saturate(.5) opacity(.62)}
.${P}hand .${P}tile:hover{transform:translateY(-3px)}
.${P}hand .${P}tile.${P}sel{transform:translateY(-9px);filter:drop-shadow(0 0 0 ${RED})}
.${P}hand .${P}tile.${P}sel::after{content:"";position:absolute;inset:-3px;border:3px solid ${RED};border-radius:4px;pointer-events:none}
.${P}hand .${P}tile:focus-visible::before{content:"";position:absolute;inset:-5px;border:3px dashed ${RED};border-radius:5px;pointer-events:none}
.${P}laid{animation:${P}pop .28s ease-out}
@keyframes ${P}pop{from{opacity:0;transform:scale(.78) rotate(-4deg)}to{opacity:1;transform:none}}
.${P}slot{position:relative;flex:0 0 auto;width:var(--sw,74px);height:var(--sh,82px);margin:0 2px;padding:0;border:2.5px dashed ${INK};background:rgba(255,255,255,.35);cursor:default;font-family:${MONO};display:block;border-radius:3px}
.${P}slot .${P}end{position:absolute;left:8%;top:6%;width:84%;height:70%}
.${P}slot .${P}hint{position:absolute;left:-6%;top:-6%;width:112%;height:112%;pointer-events:none;opacity:.95}
.${P}slot em{position:absolute;left:0;right:0;bottom:2px;font:700 10px ${MONO};font-style:normal;text-align:center;letter-spacing:.06em}
.${P}slot.${P}on{border-color:${RED};background:rgba(179,38,30,.12);cursor:pointer}
.${P}slot.${P}on em{color:${RED}}
.${P}slot.${P}on:hover{background:rgba(179,38,30,.24)}
.${P}slot:focus-visible{outline:3px solid ${RED};outline-offset:2px}
.${P}slot.${P}shut{border-style:solid;background:${INK};color:${PAPER}}
.${P}slot.${P}shut em{color:${PAPER}}
.${P}kept{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px;padding-top:6px;border-top:1.5px dashed ${INK};align-items:center}
.${P}kept small{flex:1 0 100%;font:700 10px ${MONO};letter-spacing:.1em}
.${P}kept .${P}tile{--tw:84px;transform:rotate(90deg);margin:10px 14px}
.${P}verse{position:relative;margin:6px 12px 0;min-height:46px;display:flex;align-items:center;justify-content:center;border-top:2.5px solid ${INK};border-bottom:1px solid ${INK};padding:3px 0}
.${P}verse img{display:block;width:min(100%,900px);height:auto;max-height:46px;object-fit:contain}
.${P}verse p{margin:0;font:700 clamp(13px,2.2vw,19px) ${DISPLAY};letter-spacing:.1em;text-align:center}
.${P}verse small{position:absolute;left:4px;bottom:1px;font:400 9px ${MONO};letter-spacing:.06em;opacity:.7;max-width:60%;overflow:hidden;white-space:nowrap}
.${P}cap{position:relative;margin:6px 12px 0;padding:8px 12px 8px;border:1.5px solid ${INK};background:${PAPER};min-height:64px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;box-sizing:border-box}
.${P}cap p{margin:0;flex:1 1 220px;font-size:13.5px;line-height:1.35}
.${P}act{display:flex;gap:6px;flex-wrap:wrap}
.${P}act button,.${P}card button,.${P}cap button{font:700 13px ${MONO};color:${INK};background:${PAPER};border:2px solid ${INK};padding:7px 11px;min-height:40px;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.25)}
.${P}act button:disabled{opacity:.4;cursor:default;box-shadow:none}
.${P}act button.${P}go,.${P}card button.${P}go,.${P}cap button.${P}go{background:${INK};color:${PAPER}}
.${P}act button:focus-visible,.${P}card button:focus-visible,.${P}cap button:focus-visible{outline:3px solid ${RED};outline-offset:2px}
.${P}act button:active:not(:disabled){transform:translate(1px,1px);box-shadow:1px 1px 0 rgba(0,0,0,.25)}
.${P}trayrow{position:relative;display:flex;align-items:stretch;gap:8px;margin:6px 12px 0;box-sizing:border-box}
.${P}tray{position:relative;flex:1;min-width:0;min-height:var(--th,120px);background:${PAPER2} center/100% 100% no-repeat;border:1.5px solid ${INK};box-sizing:border-box;overflow-x:auto;overflow-y:hidden}
.${P}tray.${P}art{border:0;background-color:transparent}
.${P}hand{display:flex;gap:8px;align-items:center;padding:14px 14px 6px;min-width:min-content;min-height:calc(var(--th,120px) - 6px);box-sizing:border-box}
.${P}bone{position:relative;flex:0 0 auto;width:var(--bw,92px);padding:0;border:2px solid ${INK};background:${PAPER};cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.25);font-family:${MONO}}
.${P}bone:disabled{opacity:.5;cursor:default;box-shadow:none}
.${P}bone:focus-visible{outline:3px solid ${RED};outline-offset:2px}
.${P}bone.${P}need{border-color:${RED};box-shadow:0 0 0 3px rgba(179,38,30,.35),2px 2px 0 rgba(0,0,0,.25)}
.${P}bone img{display:block;width:100%;height:auto;max-height:84px;object-fit:contain;pointer-events:none}
.${P}bone span{display:block;font:700 10px ${MONO};letter-spacing:.06em;padding:1px 2px 3px}
.${P}bone .${P}bf{height:54px;display:flex;align-items:center;justify-content:center;font:700 22px ${DISPLAY}}
.${P}intro{position:absolute;inset:0;z-index:6;display:grid;place-items:start center;padding:14px;background:rgba(20,19,18,.72);overflow:auto}
.${P}card{position:relative;box-sizing:border-box;width:100%;max-width:640px;margin:auto 0;background:${PAPER};border:2px solid ${INK};padding:16px 18px;box-shadow:6px 7px 0 rgba(0,0,0,.4);display:grid;grid-template-columns:auto 1fr;gap:4px 16px}
.${P}card .${P}cv{grid-row:1 / span 6;align-self:start;height:min(300px,40vh);width:auto;display:block;box-shadow:3px 3px 0 rgba(0,0,0,.3)}
.${P}card .${P}cvf{grid-row:1 / span 6;width:150px;height:210px;background:${INK};color:${PAPER};display:flex;align-items:center;justify-content:center;text-align:center;font:700 26px ${DISPLAY};letter-spacing:.14em;box-shadow:3px 3px 0 rgba(0,0,0,.3)}
.${P}card > *:not(img):not(.${P}cvf){grid-column:2}
.${P}card .${P}kick{font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.${P}card h2{margin:2px 0 6px;font:700 30px ${DISPLAY};letter-spacing:.12em;text-transform:uppercase}
.${P}card blockquote{margin:0 0 6px;padding:4px 10px;border-left:4px solid ${RED};font-style:italic;font-size:13px}
.${P}card blockquote cite{display:block;font-style:normal;font-size:10.5px;opacity:.7;margin-top:2px}
.${P}card p{margin:0 0 6px;font-size:13px;line-height:1.4}
.${P}card ul{margin:0 0 8px;padding:0;list-style:none;font-size:12.5px}
.${P}card li{display:grid;grid-template-columns:104px 1fr;gap:8px;padding:3px 0;border-top:1px dashed #9a9684}
.${P}card .${P}btns{display:flex;gap:8px;flex-wrap:wrap}
.${P}pop{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:14px;background:rgba(20,19,18,.55)}
.${P}pop .${P}card{max-width:520px;grid-template-columns:1fr}
.${P}pop .${P}card > *{grid-column:1 !important}
@media (max-width:760px){
 .${P}table{grid-template-columns:minmax(0,1fr);padding:0 8px}
 .${P}table{grid-template-rows:auto minmax(0,1fr)}
 .${P}side{order:-1;grid-row:1;width:auto;flex-direction:row;align-items:center;justify-content:flex-end;gap:8px;padding:0 0 4px}
 .${P}chainbox{grid-row:2}
 .${P}side .${P}lec{width:34px;order:2}.${P}side .${P}dealer{display:none}
 .${P}turn{min-width:0;font-size:10px;padding:2px 5px}
 .${P}head{padding:6px 8px 4px;gap:6px}
 .${P}cl{flex:1 1 100%;order:3}
 .${P}trayrow,.${P}cap,.${P}verse{margin-left:8px;margin-right:8px}
 .${P}card{grid-template-columns:1fr;padding:14px}
 .${P}card .${P}cv,.${P}card .${P}cvf{display:none}
 .${P}card > *{grid-column:1 !important}
 .${P}card h2{font-size:26px}
 .${P}cap p{font-size:12.5px}
 .${P}cap{padding:6px 10px;min-height:56px}
}
@media (prefers-reduced-motion:reduce){.${P}page *{animation:none!important;transition:none!important}}
`;
}

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || null;
    const has = (id) => { try { return !!(art && art.has(id)); } catch { return false; } };
    const url = (id) => { try { return has(id) ? art.url(id) : ""; } catch { return ""; } };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch { /* storage off */ } };
    const num = (k, d) => { const v = Number(sget(k, d)); return Number.isFinite(v) ? v : d; };
    let rnd; try { rnd = api.rng(); if (typeof rnd !== "function") rnd = Math.random; } catch { rnd = Math.random; }

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    let dead = false;

    const style = mk("style", null, root); style.textContent = css();
    const page = mk("div", P + "page", root);
    page.setAttribute("aria-label", "The Creed: a pocket tract and a game of dominoes");

    // ---- the flags this page reads ------------------------------------------------------------------
    const F = {
      following: num("following", 60),
      icon: !!sget("cult.icon", false), resin: !!sget("manifold.resin_line", false), lost: !!sget("bloom.settlement_lost", false),
      names: Math.round(num("fiche.names_read", 40)),
      kept: !!sget("cally.kept_secret", false),
      marks: num("split.cult_marks", 0),
    };
    const baseDoctrine = () => clamp(Math.round(F.following / 2 + (F.icon ? 20 : 0) + (F.resin ? 15 : 0)), 0, 100);

    // ---- state -------------------------------------------------------------------------------------
    let pi = 0, PG = PAGES[0], handNo = 0, mode = "intro";
    let H = null;                 // the hand in play
    let sel = null;               // selected hand tile id
    let busy = false;
    let totals = null;            // this page's running totals
    const pageResults = [];
    let namingUsed = false;
    const dom = {};

    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const tileOf = (id) => H.byId[id];

    // ---- tile logic --------------------------------------------------------------------------------
    // orientation [l, r] a tile takes laid at a side, or null
    function orient(t, side) {
      const w = side === "L" ? H.chain[0].l : H.chain[H.chain.length - 1].r;
      if (t.kind === "naming") return w === "blood" ? ["blank", "blank"] : null;
      if (t.kind !== "dom") return null;
      if (side === "R") { if (t.a === w) return [t.a, t.b]; if (t.b === w) return [t.b, t.a]; }
      else { if (t.b === w) return [t.a, t.b]; if (t.a === w) return [t.b, t.a]; }
      return null;
    }
    const sideOpen = (side) => !(side === "L" ? H.shutL : H.shutR);
    const legal = (t, side) => (sideOpen(side) ? orient(t, side) : null);
    const hasLegal = (hand) => hand.some((t) => t.kind !== "sky" && t.kind !== "string" && (legal(t, "L") || legal(t, "R")));
    const hasLegalDom = (hand) => hand.some((t) => t.kind === "dom" && (legal(t, "L") || legal(t, "R")));
    const stuck = () => !hasLegalDom(H.hand) && H.yard.length === 0;
    const holdsExtra = () => H.hand.some((t) => t.kind === "sky" || t.kind === "string" || (t.kind === "naming" && (legal(t, "L") || legal(t, "R"))));
    const openWord = (side) => (side === "L" ? H.chain[0].l : H.chain[H.chain.length - 1].r);

    function buildHand() {
      const set = shuffle(fullSet());
      const byId = {}; set.forEach((t) => { byId[t.id] = t; });
      // the starter: a tile with no BLOOD end if there is one
      let si = set.findIndex((t) => t.a !== "blood" && t.b !== "blood");
      if (si < 0) si = 0;
      const start = set.splice(si, 1)[0];
      const tox = set.splice(0, 7), lec = set.splice(0, 7);
      const deal = DEALS[(handNo + (pi ? 1 : 0)) % DEALS.length];
      const dealt = { id: 100 + handNo, kind: deal.kind, line: ["", ""], say: deal.say };
      byId[dealt.id] = dealt; tox.push(dealt);
      const wantNaming = PG.n === 2 && F.marks >= 3 && !namingUsed;
      if (wantNaming) {
        const nm = { id: 200, kind: "naming", a: "blank", b: "blank", line: ["", ""] };
        byId[nm.id] = nm; tox.push(nm);
      }
      H = {
        byId, yard: set, hand: tox, lec, chain: [{ t: start, l: start.a, r: start.b }], shutL: false, shutR: false, kept: [],
        turn: "tox", passes: 0, joints: [], verse: null, over: false, d: { doc: 0, blood: 0, word: 0, sky: 0, named: 0 },
        drewThisTurn: false, last: null,
      };
      sel = null;
    }

    // a tile is laid: scoring and printing
    function lay(actor, t, side) {
      const o = orient(t, side);
      if (!o) return;
      const w = openWord(side);
      const entry = { t, l: o[0], r: o[1], fresh: true };
      if (t.kind === "naming") {
        entry.cap = true;
        if (side === "L") { H.chain.unshift(entry); H.shutL = true; } else { H.chain.push(entry); H.shutR = true; }
        H.d.named += 1; H.d.doc -= 10; namingUsed = true;
        H.last = { side, text: "Hal Brenner. Mercy reads the name aloud. The end is closed." };
        H.verse = { kind: "name" };
      } else {
        if (side === "L") H.chain.unshift(entry); else H.chain.push(entry);
        let line = null;
        if (w === "blood") { H.d.doc += 4; H.d.blood += 1; line = "blood"; }
        else if (actor === "lec") { H.d.doc += 2; line = w === "ring" ? "ringLector" : w; }
        else if (w === "ring" || w === "need") { H.d.doc -= 3; H.d.word += 1; line = w === "ring" ? "ringTox" : "need"; }
        else line = null;
        H.joints.push({ word: w, who: actor });
        if (line) H.verse = { kind: line };
        H.last = { side, word: w };
      }
      // out of the hand
      const arr = actor === "tox" ? H.hand : H.lec;
      arr.splice(arr.indexOf(t), 1);
      H.passes = 0;
    }

    // ---- the hand's end ------------------------------------------------------------------------------
    const domLeft = (arr) => arr.filter((t) => t.kind === "dom");
    function checkEnd() {
      if (domLeft(H.hand).length === 0) return "tox";
      if (H.lec.length === 0) return "lec";
      if (H.passes >= 2 && H.yard.length === 0) return "block";
      return null;
    }

    function finishHand(why) {
      H.over = true; busy = true; sel = null;
      let reads = 0;
      if (why !== "tox") {
        reads = domLeft(H.hand).filter((t) => t.a === "blood" || t.b === "blood").length;
        H.d.doc += 2 * reads;
      }
      totals.doc += H.d.doc; totals.blood += H.d.blood; totals.word += H.d.word; totals.sky += H.d.sky; totals.named += H.d.named;
      totals.hands.push({ why, doc: H.d.doc, reads });
      render();
      const last = handNo >= PG.hands - 1;
      const who = why === "tox" ? "He goes out first." : why === "lec" ? "Mercy goes out first." : "The chain is blocked. Nobody can lay.";
      const readLine = reads ? ` ${reads === 1 ? "A tile of his with BLOOD on it is" : reads + " tiles of his with BLOOD on them are"} read aloud anyway.` : "";
      const d = H.d.doc;
      const verdict = d > 0 ? `The tract grew by ${d}: belief exceeds him.` : d < 0 ? `The tract lost ${-d}: his words held.` : "The tract did not move.";
      const won = why === "tox" && d > 0 ? " He won the hand and still lost the verse." : "";
      say(`Hand ${handNo + 1} of ${PG.hands}. ${who}${readLine} ${verdict}${won}`);
      const row = dom.actions; row.textContent = "";
      const b = mk("button", P + "go", row, last ? "Close the tract" : "Next hand"); b.type = "button";
      on(b, "click", () => { if (last) endPage(); else { handNo++; startHand(); } });
      later(() => { if (!dead) b.focus({ preventScroll: true }); }, RM ? 20 : 300);
    }
    let onlyTwo = false;

    // ---- the lector -----------------------------------------------------------------------------------
    function lectorPlays() {
      const out = [];
      for (const t of H.lec) for (const s of ["L", "R"]) { const o = legal(t, s); if (o) out.push({ t, s, w: openWord(s) }); }
      return out;
    }
    function lectorTurn() {
      if (dead || H.over) return;
      H.turn = "lec"; busy = true; render();
      const step = () => {
        if (dead || H.over) return;
        const plays = lectorPlays();
        if (plays.length) {
          const bl = plays.filter((p) => p.w === "blood");
          const p = bl.length && rnd() < PG.lectorBlood ? bl[Math.floor(rnd() * bl.length)] : plays[Math.floor(rnd() * plays.length)];
          lay("lec", p.t, p.s); H.lastWho = "lec";
          const e = H.chain[p.s === "L" ? 0 : H.chain.length - 1];
          const ln = `"${p.t.line[0]} ${p.t.line[1]}"`;
          const verseSay = p.w === "blood" ? `Mercy lays ${ln}. She reads it: ALL OF IT IS HIS BLOOD.` : `Mercy lays ${ln} at the ${p.s === "L" ? "left" : "right"} end: ${LABEL[p.w]}.`;
          say(verseSay);
          const r = checkEnd(); render();
          if (r) { later(() => finishHand(r), RM ? 100 : 700); return; }
          later(toxTurn, RM ? 80 : 500);
          return;
        }
        if (H.yard.length) { const t = H.yard.pop(); H.lec.push(t); say("Mercy draws from the boneyard."); render(); later(step, RM ? 60 : 420); return; }
        H.passes++; say("Mercy cannot lay and the boneyard is empty. She passes."); render();
        const r = checkEnd(); if (r) { later(() => finishHand(r), RM ? 100 : 700); return; }
        later(toxTurn, RM ? 80 : 600);
      };
      later(step, RM ? 120 : 650);
    }

    // ---- his turn -------------------------------------------------------------------------------------
    function toxTurn() {
      if (dead || H.over) return;
      H.turn = "tox"; busy = false; render();
      if (stuck() && !holdsExtra()) {
        // nothing to lay and nothing to draw: the page passes for him after a beat
        busy = true; H.passes++;
        say("He has nothing to lay, and the boneyard is empty. He passes.");
        render();
        const r = checkEnd(); if (r) { later(() => finishHand(r), RM ? 100 : 700); return; }
        later(lectorTurn, RM ? 100 : 900); return;
      }
      if (stuck()) say("Nothing he holds fits, and the boneyard is empty. Use the dealt tile, lay the name, or pass.");
      else if (!hasLegalDom(H.hand)) say("Nothing he holds matches an open end. Draw from the boneyard.");
      else say(`Open ends: ${LABEL[openWord("L")]} and ${LABEL[openWord("R")]}. Pick a tile.`);
      if (!RM || true) later(() => { if (!dead && dom.hand && !H.over && !(document.activeElement && dom.hand.contains(document.activeElement))) { const t = dom.hand.querySelector("button"); if (t) t.focus({ preventScroll: true }); } }, 20);
    }

    function pass() {
      if (busy || mode !== "play" || H.over || H.turn !== "tox" || !stuck()) return;
      busy = true; sel = null; H.passes++;
      say("He passes.");
      render();
      const r = checkEnd(); if (r) { later(() => finishHand(r), RM ? 100 : 700); return; }
      later(lectorTurn, RM ? 100 : 700);
    }

    function select(id) {
      if (busy || mode !== "play" || H.over) return;
      if (sel === id) { sel = null; render(); return; }
      sel = id; const t = tileOf(id);
      render();
      if (t.kind === "dom") {
        const l = legal(t, "L"), r = legal(t, "R");
        const ln = `${t.line[0]} | ${t.line[1]}`;
        if (!l && !r) say(`"${ln}". Ends ${LABEL[t.a]} and ${LABEL[t.b]}: no open end matches.`);
        else say(`"${ln}". ${l && r ? "It fits at either end." : l ? "It fits at the left end." : "It fits at the right end."}`);
      } else if (t.kind === "naming") {
        say("The station keeper's name, HAL BRENNER, blank on both ends. Laid on a BLOOD end it closes that end for the hand.");
      } else say(t.say + " Lay it crosswise (it costs his turn) or turn it face down.");
      const first = dom.hand.querySelector(`[data-id="${id}"]`); if (first) first.focus({ preventScroll: true });
    }

    function toxLay(side) {
      if (busy || sel == null) return;
      const t = tileOf(sel); if (!t || !legal(t, side)) return;
      busy = true;
      const before = H.d.doc;
      const w = openWord(side);
      lay("tox", t, side); H.lastWho = "tox"; sel = null;
      let line;
      const ln = t.kind === "dom" ? ` "${t.line[0]} ${t.line[1]}"` : "";
      if (t.kind === "naming") line = "He lays the name on the BLOOD end. Mercy reads it aloud: Hal Brenner. That end is closed.";
      else if (w === "blood") line = "A BLOOD joint. Mercy reads it: ALL OF IT IS HIS BLOOD. His own tile, her reading.";
      else if (w === "ring" || w === "need") line = `A ${LABEL[w]} joint, his word, kept in play.`;
      else line = `${LABEL[w]} joint.`;
      say(t.kind === "dom" ? ln.trim() + " " + line : line);
      const r = checkEnd(); render();
      if (r) { later(() => finishHand(r), RM ? 100 : 700); return; }
      later(lectorTurn, RM ? 100 : 650);
    }

    function draw() {
      if (busy || mode !== "play" || H.over || H.turn !== "tox") return;
      if (hasLegalDom(H.hand)) { say("He holds a tile that fits. Lay it first."); return; }
      if (!H.yard.length) { say("The boneyard is empty."); return; }
      const t = H.yard.pop(); H.hand.push(t); sel = null;
      render();
      say(legal(t, "L") || legal(t, "R") ? "He draws a tile that fits." : "He draws. It does not fit.");
      if (stuck() && !holdsExtra()) { busy = true; later(toxTurn, 300); }
    }

    function spinner() {
      if (busy || sel == null) return;
      const t = tileOf(sel); if (!t || (t.kind !== "sky" && t.kind !== "string")) return;
      busy = true;
      H.hand.splice(H.hand.indexOf(t), 1); H.kept.push(t); sel = null; H.d.sky += 1;
      H.passes = 0;
      say(`He lays it crosswise as a spinner. It joins nothing, and costs him his turn. She watched someone keep it.`);
      render();
      later(lectorTurn, RM ? 100 : 700);
    }
    function faceDown() {
      if (busy || sel == null) return;
      const t = tileOf(sel); if (!t || (t.kind !== "sky" && t.kind !== "string")) return;
      H.hand.splice(H.hand.indexOf(t), 1); sel = null;
      say("He turns it face down. No effect.");
      render();
      if (!H.over && domLeft(H.hand).length === 0) { busy = true; later(() => finishHand("tox"), RM ? 100 : 500); }
    }

    // ---- drawing --------------------------------------------------------------------------------------
    function endPanel(w, cls, parent, red) {
      const e = mk("span", P + "end " + P + cls, parent);
      if (has("creed-end-" + w)) { const im = mk("img", null, e); im.src = url("creed-end-" + w); im.alt = ""; im.draggable = false; }
      else { const b = mk("b", red ? P + "rd" : null, e, LABEL[w]); if (w === "blood") b.classList.add(P + "rd"); }
      return e;
    }

    function tileEl(t, o, parent, tag = "div") {
      const el = mk(tag, P + "tile", parent);
      if (tag === "button") el.type = "button";
      const frameId = t.kind === "sky" ? "creed-tile-sky" : t.kind === "string" ? "creed-tile-string" : t.kind === "naming" ? "creed-tile-naming" : "creed-tile-frame";
      if (has(frameId)) { const im = mk("img", P + "fr", el); im.src = url(frameId); im.alt = ""; im.draggable = false; } else mk("div", P + "ff", el);
      if (t.kind === "dom" || t.kind === "cap") {
        const [l, r] = o || [t.a, t.b];
        endPanel(l, "L", el); endPanel(r, "R", el);
        const bar = mk("div", P + "bar", el);
        const fl = (o && o[0] !== t.a) ? [t.line[1], t.line[0]] : t.line;
        mk("i", null, bar, fl[0]); mk("i", null, bar, fl[1]);
      } else {
        el.classList.add(P + "special");
        if (t.kind === "naming") {
          const [l, r] = o || ["blank", "blank"];
          void l; void r;
          const nm = mk("div", P + "nm", el, "HAL BRENNER"); mk("small", null, nm, "the station keeper");
        } else if (!has(frameId)) {
          const nm = mk("div", P + "nm", el, t.kind === "sky" ? "A PAINTED SKY" : "A LOOP OF STRING");
          nm.style.top = "20%";
        }
      }
      return el;
    }
    const lineOf = (t) => (t.kind === "dom" ? `${t.line[0]} ${t.line[1]}` : t.kind === "naming" ? "the naming tile, Hal Brenner" : t.kind === "sky" ? "a painted sky, dealt by Cally" : "a loop of string, dealt by Cally");

    function sizes() {
      const w = page.clientWidth || 800;
      const narrow = w <= 760;
      page.style.setProperty("--tw", narrow ? "104px" : "150px");
      page.style.setProperty("--th", narrow ? "112px" : "132px");
      page.style.setProperty("--bw", narrow ? "70px" : "100px");
      page.style.setProperty("--sw", narrow ? "64px" : "78px");
      page.style.setProperty("--sh", narrow ? "72px" : "86px");
      return narrow;
    }

    function slotEl(side, parent) {
      const w = openWord(side), shut = !sideOpen(side);
      const b = mk("button", P + "slot", parent); b.type = "button";
      b.dataset.side = side;
      const selT = sel != null ? tileOf(sel) : null;
      const ok = !shut && selT && !busy && legal(selT, side);
      if (shut) { b.classList.add(P + "shut"); b.disabled = true; mk("em", null, b, "CLOSED"); b.setAttribute("aria-label", `${side === "L" ? "Left" : "Right"} end closed`); }
      else {
        endPanel(w, side === "L" ? "L" : "L", b);
        // a hint on a BLOOD end the lector can match
        if (w === "blood" && H.lec.some((t) => t.kind === "dom" && (t.a === "blood" || t.b === "blood")) && has("creed-hint")) { const h = mk("img", P + "hint", b); h.src = url("creed-hint"); h.alt = ""; h.draggable = false; }
        else if (w === "blood" && H.lec.some((t) => t.kind === "dom" && (t.a === "blood" || t.b === "blood"))) b.style.boxShadow = `0 0 0 3px ${RED}`;
        mk("em", null, b, side === "L" ? "◀ LEFT" : "RIGHT ▶");
        b.setAttribute("aria-label", `${side === "L" ? "Left" : "Right"} open end: ${LABEL[w]}${ok ? ". Lay the selected tile here" : ""}`);
        if (ok) { b.classList.add(P + "on"); on(b, "click", () => toxLay(side)); }
        else { b.setAttribute("aria-disabled", "true"); b.tabIndex = -1; }
      }
      return b;
    }

    function render() {
      if (!H || !dom.chain) return;
      const narrow = sizes();
      // the chain
      dom.chain.textContent = "";
      let freshEl = null;
      slotEl("L", dom.chain);
      H.chain.forEach((e) => {
        const el = tileEl(e.t, [e.l, e.r], dom.chain);
        if (e.cap) el.style.filter = "drop-shadow(0 0 0 " + RED + ")";
        if (e.fresh) { if (!RM) el.classList.add(P + "laid"); freshEl = el; }
        e.fresh = false;
      });
      slotEl("R", dom.chain);
      if (freshEl) { const bb = dom.chainbox.getBoundingClientRect(), eb = freshEl.getBoundingClientRect(); if (eb.bottom > bb.bottom - 4) dom.chainbox.scrollTop += eb.bottom - bb.bottom + 14; else if (eb.top < bb.top + 4) dom.chainbox.scrollTop -= bb.top - eb.top + 14; }
      if (H.kept.length) {
        const k = mk("div", P + "kept", dom.chain); mk("small", null, k, "KEPT AS SPINNERS (dealt, not his)");
        H.kept.forEach((t) => tileEl(t, null, k));
      }
      // the hand
      dom.hand.textContent = "";
      const selId = sel;
      H.hand.forEach((t) => {
        const el = tileEl(t, null, dom.hand, "button");
        el.dataset.id = String(t.id);
        el.setAttribute("aria-label", `${lineOf(t)}${t.kind === "dom" ? `, ends ${LABEL[t.a]} and ${LABEL[t.b]}` : ""}${selId === t.id ? ", selected" : ""}`);
        el.setAttribute("aria-pressed", selId === t.id ? "true" : "false");
        if (selId === t.id) el.classList.add(P + "sel");
        if (t.kind === "dom" && !(legal(t, "L") || legal(t, "R"))) el.classList.add(P + "no");
        if (H.over || busy || mode !== "play") el.style.cursor = "default";
        on(el, "click", () => select(t.id));
      });
      if (!H.hand.length) mk("p", null, dom.hand, "His hand is empty.").style.cssText = `margin:0 8px;font:700 13px ${MONO}`;
      // the boneyard
      const can = !H.over && !busy && H.turn === "tox" && !hasLegalDom(H.hand) && H.yard.length > 0;
      dom.bone.disabled = !(can);
      dom.bone.classList.toggle(P + "need", can);
      dom.boneN.textContent = `${H.yard.length} in the boneyard`;
      dom.bone.setAttribute("aria-label", `Draw from the boneyard, ${H.yard.length} left${can ? "" : ", not now"}`);
      // the turn
      dom.turn.textContent = H.over ? "HAND OVER" : H.turn === "tox" ? (busy ? "…" : "YOUR TILE") : "MERCY LAYS";
      dom.turn.classList.toggle(P + "you", H.turn === "tox" && !H.over && !busy);
      // the verse
      dom.verse.textContent = "";
      const v = H.verse;
      if (v) {
        if (v.kind === "blood" && has("creed-verse-blood")) { const im = mk("img", null, dom.verse); im.src = url("creed-verse-blood"); im.alt = VERSE.blood; }
        else if (v.kind === "ringLector" && has("creed-verse-ring")) { const im = mk("img", null, dom.verse); im.src = url("creed-verse-ring"); im.alt = VERSE.ringLector; }
        else {
          const p = mk("p", v.kind === "blood" ? P + "red" : null, dom.verse, v.kind === "name" ? "HAL BRENNER." : VERSE[v.kind]);
          void p;
        }
      } else mk("p", null, dom.verse, "THE VERSE IS PRINTED AS THE JOINTS ARE MADE.").style.opacity = ".45";
      const printed = H.joints.slice(-9).map((j) => (j.who === "lec" ? "" : "·") + LABEL[j.word].toLowerCase()).join(" ");
      if (printed) mk("small", null, dom.verse, printed);
      // the cover line: the doctrine as it grows
      const words = (totals ? totals.line : []).concat(H.joints.map((j) => ({ w: LABEL[j.word], red: j.who === "lec" || j.word === "blood" })));
      dom.cover.textContent = "";
      words.slice(-10).forEach((x) => mk("span", x.red ? P + "red" : null, dom.cover, x.w));
      if (!words.length) { const sp = mk("span", null, dom.cover, "(blank)"); sp.style.opacity = ".4"; }
      // actions
      if (!H.over) {
        dom.actions.textContent = "";
        const t = sel != null ? tileOf(sel) : null;
        const mkb = (label, fn, on_, aria) => { const b = mk("button", null, dom.actions, label); b.type = "button"; b.disabled = !on_; if (aria) b.setAttribute("aria-label", aria); on(b, "click", fn); return b; };
        if (t && (t.kind === "sky" || t.kind === "string")) {
          mkb("Lay crosswise (costs a turn)", spinner, !busy);
          mkb("Face down", faceDown, !busy);
        } else {
          const l = t && !busy && legal(t, "L"), r = t && !busy && legal(t, "R");
          mkb(`◀ Left: ${LABEL[openWord("L")]}`, () => toxLay("L"), !!l, `Lay at the left end, ${LABEL[openWord("L")]}`);
          mkb(`Right: ${LABEL[openWord("R")]} ▶`, () => toxLay("R"), !!r, `Lay at the right end, ${LABEL[openWord("R")]}`);
          if (H.turn === "tox" && !busy && stuck()) mkb("Pass", pass, true);
        }
      }
      void narrow;
    }

    function say(text) { if (dom.capP) dom.capP.textContent = text; }

    // ---- flow -----------------------------------------------------------------------------------------
    function buildStage() {
      page.textContent = "";
      const book = mk("div", P + "book", page); dom.book = book;
      [0.22, 0.78].forEach((f) => { const s = mk("div", P + "stap", book); s.style.top = `${f * 100}%`; });
      const head = mk("div", P + "head", book);
      mk("div", P + "title", head, "The Creed");
      dom.dated = mk("div", P + "dated", head, `${PG.year}. ${PG.place}.`);
      const cl = mk("div", P + "cl", head); dom.cl = cl;
      if (has("creed-cover-line")) { const im = mk("img", null, cl); im.src = url("creed-cover-line"); im.alt = ""; im.draggable = false; } else cl.classList.add(P + "nf");
      dom.cover = mk("span", P + "ty", cl);
      const table = mk("div", P + "table", book);
      const cb = mk("div", P + "chainbox", table); dom.chainbox = cb; cb.tabIndex = -1;
      cb.setAttribute("aria-label", "The chain of tiles across the tract");
      if (has("creed-spread")) { cb.classList.add(P + "art"); cb.style.backgroundImage = `linear-gradient(rgba(241,236,220,.94),rgba(241,236,220,.94)),url("${url("creed-spread")}")`; }
      dom.chain = mk("div", P + "chain", cb);
      const side = mk("div", P + "side", table);
      if (has("creed-lector")) { const im = mk("img", P + "lec", side); im.src = url("creed-lector"); im.alt = "Mercy, the lector, at the drum"; }
      dom.turn = mk("div", P + "turn", side);
      if (has("creed-dealer-hands")) { const im = mk("img", P + "dealer", side); im.src = url("creed-dealer-hands"); im.alt = "The dealer's hands"; dom.dealer = im; }
      dom.verse = mk("div", P + "verse", book); dom.verse.setAttribute("aria-live", "polite");
      const cap = mk("div", P + "cap", book);
      dom.capP = mk("p", null, cap); dom.capP.setAttribute("aria-live", "polite");
      dom.actions = mk("div", P + "act", cap);
      const row = mk("div", P + "trayrow", book);
      const bone = mk("button", P + "bone", row); bone.type = "button"; dom.bone = bone;
      if (has("creed-boneyard")) { const im = mk("img", null, bone); im.src = url("creed-boneyard"); im.alt = ""; im.draggable = false; }
      else mk("div", P + "bf", bone, "▤");
      dom.boneN = mk("span", null, bone);
      on(bone, "click", draw);
      const tray = mk("div", P + "tray", row); dom.tray = tray;
      if (has("creed-hand-tray")) { tray.classList.add(P + "art"); tray.style.backgroundImage = `url("${url("creed-hand-tray")}")`; }
      dom.hand = mk("div", P + "hand", tray); dom.hand.setAttribute("role", "group"); dom.hand.setAttribute("aria-label", "His hand");
    }

    function hallLines() {
      const out = [];
      if (PG.n === 1) {
        if (F.lost) out.push("The hall is smaller. The bloom's marked took it from the freeway; this is not his doing.");
        else out.push(F.icon ? "Over the lectern hangs the face the settlement pinned. It is not how he looks." : `Round the wall, a painted ring of ${F.names} names.`);
        if (F.resin) out.push("Their resin is made from his own line. The tract starts higher.");
      } else {
        out.push("The copier runs off the tract as they play. Dov Ashkenazi keeps it running.");
        if (F.marks >= 3) out.push("Split Field showed him which channel marks were theirs. He holds one tile that is not a line.");
        if (F.kept) out.push("Cally is at the table. He kept her near.");
      }
      return out;
    }

    function intro() {
      mode = "intro";
      const box = mk("div", P + "intro", page); dom.intro = box;
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "The Creed: how to play");
      if (has("creed-tract-cover")) { const im = mk("img", P + "cv", card); im.src = url("creed-tract-cover"); im.alt = "The tract's cover"; }
      else mk("div", P + "cvf", card, "THE CREED");
      mk("div", P + "kick", card, "1D · Chapters 1 and 4 · Pocket tract booklet");
      mk("h2", null, card, "The Creed");
      const q = mk("blockquote", null, card, "his beliefs have outgrown him");
      mk("cite", null, q, "Bible, Part VI, Dr. Tox, Story: The Finale");
      mk("p", null, card, "A table of dominoes in the cavern hall. Each tile is half of one of his own lines, and each end carries a word, not a number. Mercy lays faster than he can. A dark-haired woman in the back row deals for her.");
      const g = mk("p", null, card); mk("b", null, g, "Goal "); g.append("Lay a tile at either open end where its word matches. Every joint prints into the verse at the foot. Go out first, or keep the tract from growing. Nothing here stops it; you can only bend it.");
      const ul = mk("ul", null, card);
      for (const [a, b] of [
        ["Lay", "Tap a tile in your hand, then an open end or the button. Keys: L, R."],
        ["Draw", "Only when nothing fits. The boneyard, or D."],
        ["BLOOD", "A BLOOD joint, whoever lays it, is read as ALL OF IT IS HIS BLOOD. Her joints cost you; RING and NEED joints of yours take some back. A red end is one she can match."],
        ["Dealt tile", "Once a hand a tile that is not his: it fits nothing. Lay it crosswise (costs a turn) or turn it face down."],
      ]) { const li = mk("li", null, ul); mk("b", null, li, a); mk("span", null, li, b); }
      hallLines().forEach((t) => mk("p", null, card, t));
      mk("p", null, card, "Two tracts: the cavern hall (two hands), then the camp (three). There is no failing. The page says what was printed.");
      const bt = mk("div", P + "btns", card);
      const go = mk("button", P + "go", bt, "Start: the cavern hall"); go.type = "button";
      const two = mk("button", null, bt, "Start at the camp"); two.type = "button";
      on(go, "click", () => { box.remove(); beginPage(0, false); });
      on(two, "click", () => { box.remove(); beginPage(1, true); });
      later(() => { if (!dead) go.focus({ preventScroll: true }); }, 30);
    }

    function beginPage(i, solo) {
      pi = i; PG = PAGES[i]; handNo = 0; onlyTwo = solo; namingUsed = false;
      H = null;
      totals = { doc: 0, blood: 0, word: 0, sky: 0, named: 0, hands: [], line: [] };
      buildStage();
      startHand();
    }

    function startHand() {
      mode = "play"; busy = false;
      if (H && H.joints) totals.line = totals.line.concat(H.joints.map((j) => ({ w: LABEL[j.word], red: j.who === "lec" || j.word === "blood" })));
      buildHand();
      render();
      const first = H.chain[0].t;
      const dealt = H.byId[100 + handNo];
      const lead = `Hand ${handNo + 1} of ${PG.hands}. Seven tiles each. The tract opens on "${first.line[0]} ${first.line[1]}".`;
      say(`${lead} ${dealt ? (F.kept && PG.n === 2 ? "She deals slowly, and does not look up. " : "") + "A tile in his hand is not his: " + (dealt.kind === "sky" ? "a painted sky." : "a loop of string.") : ""}${H.hand.some((t) => t.kind === "naming") ? " He holds the naming tile." : ""}`);
      if (dom.dealer && !RM) { dom.dealer.style.opacity = "0"; later(() => { if (!dead && dom.dealer) dom.dealer.style.opacity = "1"; }, 100); }
      later(() => { if (!dead) { const t = dom.hand.querySelector("button"); if (t) t.focus({ preventScroll: true }); } }, 40);
      toxTurn();
    }

    // ---- the page's end: flags -------------------------------------------------------------------------
    function applyFlags() {
      const k = "creed.p" + PG.n;
      const prev = sget(k, null);
      let doc = sget("cult.doctrine", null);
      doc = doc == null ? baseDoctrine() : num("cult.doctrine", baseDoctrine());
      let bj = num("creed.blood_joints", 0), wj = num("creed.word_joints", 0), sk = num("creed.sky_tiles", 0), crack = num("cally.crack", 25), named = !!sget("creed.named_harm", false);
      if (prev && typeof prev === "object") {
        doc -= prev.doc || 0; bj -= prev.blood || 0; wj -= prev.word || 0; sk -= prev.sky || 0; crack -= prev.crack || 0;
        if (prev.named) named = false;
      }
      const dCrack = 5 * totals.sky;
      doc = clamp(Math.round(doc + totals.doc), 0, 100);
      bj = Math.max(0, bj + totals.blood); wj = Math.max(0, wj + totals.word); sk = Math.max(0, sk + totals.sky);
      crack = clamp(crack + dCrack, 0, 100);
      if (totals.named) named = true;
      sset("cult.doctrine", doc); sset("creed.blood_joints", bj); sset("creed.word_joints", wj); sset("creed.sky_tiles", sk);
      sset("cally.crack", Math.round(crack)); sset("creed.named_harm", named);
      sset(k, { doc: totals.doc, blood: totals.blood, word: totals.word, sky: totals.sky, crack: dCrack, named: !!totals.named });
      return { doc, crack };
    }

    function endPage() {
      const res = applyFlags();
      const perHand = totals.doc / Math.max(1, totals.hands.length);
      pageResults.push({ n: PG.n, doc: totals.doc, blood: totals.blood, word: totals.word, sky: totals.sky, named: totals.named, per: perHand, hands: totals.hands.length });
      try { const best = store.get("best", null); const s = -totals.doc; if (best == null || s > best) store.set("best", s); } catch { /* storage off */ }
      if (pi === 0 && !onlyTwo) { pagePop(); return; }
      finish(res);
    }

    function pagePop() {
      const r = pageResults[pageResults.length - 1];
      const box = mk("div", P + "pop", page);
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "The tract is printed");
      mk("div", P + "kick", card, `${PG.year}. ${PG.place}.`);
      mk("h2", null, card, "Printed");
      mk("p", null, card, tallyLine(r));
      mk("p", null, card, "The copier is carried to the camp below the last city. The tract goes on, with more hands.");
      const go = mk("button", P + "go", card, "Next tract: the camp"); go.type = "button";
      on(go, "click", () => { box.remove(); beginPage(1, false); });
      later(() => { if (!dead) go.focus({ preventScroll: true }); }, 30);
    }

    function tallyLine(r) {
      const bits = [];
      bits.push(r.doc > 0 ? `Doctrine +${r.doc}.` : r.doc < 0 ? `Doctrine ${r.doc}.` : "Doctrine unchanged.");
      bits.push(`${r.blood} BLOOD ${r.blood === 1 ? "joint" : "joints"} printed.`);
      bits.push(`${r.word} of his words kept in play.`);
      if (r.sky) bits.push(`${r.sky} dealt ${r.sky === 1 ? "tile" : "tiles"} kept: she watched.`);
      if (r.named) bits.push("The keeper's name was read aloud.");
      return bits.join(" ");
    }

    function finish() {
      mode = "over";
      const doc = pageResults.reduce((a, r) => a + r.doc, 0), hands = pageResults.reduce((a, r) => a + r.hands, 0);
      const blood = pageResults.reduce((a, r) => a + r.blood, 0), word = pageResults.reduce((a, r) => a + r.word, 0), sky = pageResults.reduce((a, r) => a + r.sky, 0);
      const named = pageResults.some((r) => r.named);
      const per = doc / Math.max(1, hands);
      const win = per <= WIN_PER_HAND;
      const where = pageResults.length > 1 ? "Across both tracts" : "In the tract";
      let text = `${where}: ${doc > 0 ? "doctrine +" + doc : doc < 0 ? "doctrine " + doc : "doctrine unchanged"}, ${blood} BLOOD ${blood === 1 ? "joint" : "joints"} printed, ${word} of his words kept in play`;
      if (sky) text += `, ${sky} dealt ${sky === 1 ? "tile" : "tiles"} kept`;
      text += ".";
      if (named) text += " The keeper's name was read aloud, and one end stayed closed.";
      text += win ? " Most of the tract stayed his. It still grew." : " Belief exceeds him. He can bend it, never stop it.";
      api.end({ outcome: win ? "win" : "done", text });
    }

    // ---- keys -----------------------------------------------------------------------------------------
    on(page, "keydown", (e) => {
      if (mode !== "play" || !H || H.over || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "l") { toxLay("L"); e.preventDefault(); }
      else if (k === "r") { toxLay("R"); e.preventDefault(); }
      else if (k === "d") { draw(); e.preventDefault(); }
      else if (k === "p") { pass(); e.preventDefault(); }
      else if (k === "f") { faceDown(); e.preventDefault(); }
      else if (k === "s") { spinner(); e.preventDefault(); }
      else if (k === "escape") { if (sel != null) { sel = null; render(); e.preventDefault(); } }
      else if ((k === "arrowright" || k === "arrowleft") && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id) {
        const btns = [...dom.hand.querySelectorAll("button")]; const i = btns.indexOf(document.activeElement);
        const n = btns[clamp(i + (k === "arrowright" ? 1 : -1), 0, btns.length - 1)]; if (n) n.focus(); e.preventDefault();
      }
    });
    let rz = null;
    const onResize = () => { if (H && dom.chain) render(); };
    if (typeof window !== "undefined") { window.addEventListener("resize", onResize); offs.push(() => window.removeEventListener("resize", onResize)); }
    void rz;

    // keep a handle for the page's own tests and for the how-to
    page.__creed = { get H() { return H; }, get PG() { return PG; }, get mode() { return mode; }, toxLay, select, draw, spinner, faceDown, get busy() { return busy; } };

    intro();

    return {
      unmount() {
        dead = true;
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach((f) => f()); offs.length = 0;
        root.innerHTML = "";
      },
    };
  },
};

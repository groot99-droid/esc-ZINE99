// Dr. Tox: Finale / Two Pans (1D, balance; DESIGN.md section 11, `g1_two_pans`; scenes s1_pans_1, s1_pans_2, s1_pans_3).
// Two-colour pulp, red and black: red and black inks only on rough pulp stock, heavy black shadows, red flat fills,
// the balance drawn as a pulp cover's centrepiece (the page's own cover art is the backdrop).
//
// A beam balance on a stand. Brass pip tokens (1 to 6 pips, an invented unit) go into either pan: RED on the left,
// BLACK on the right, the dial's two ends. The pointer shows the share of BLACK in the whole: it swings, then settles.
// A WINDOW is printed on the dial, black between 70 and 78 percent of the whole. The whole must also reach the page's
// LOAD, exactly. Below the window (too much RED) the pointer will not rest: the beam knocks, and when the load is laid
// the last RED token jumps out of the pan (the page will not weigh a dose that stops hearts). Above it the pointer
// drifts and settles nowhere. Two Pans 3 also has a second band, black between 86 and 90, where the pointer can
// rest too; the page says what it is in one red caption box and nothing else.
//
// Three pages, one after another (the menu's "start at" buttons begin at a later one):
//   1 The bench (s1_pans_1, 2237): the cult's rite jars are laid as they made them (6 BLACK, 6 RED, a load of 12): the
//     pointer will not rest. Rebalance into the window (two_pans.window_learned, two_pans.rite_rebalanced,
//     cult.doctrine -10) or leave their jars. After a minute the tokens that would bring the pointer into the window
//     are outlined in red, with the pan each belongs in.
//   2 The suite (s1_pans_2, 2240): the rack's twelve vials as six tokens, each capped BLACK or RED (9 and 3). Laid by
//     their caps they sit in the window, and always did (two_pans.rcc_ratio_found). The window's edges are printed
//     exactly (70 and 78).
//   3 The core (s1_pans_3, 2240): the city, a load of 30, the window and the heart band, edges printed. Where he rests
//     it is two_pans.final: "window" (the Reset; the held input follows in the 3D core) or "heart" (hub.held_back, the
//     Cage Holds). The window asks for a second word first, and shows the bible's line: the sacrifice is a choice.
//
// Reads: cult.doctrine (and following, cult.icon, manifold.resin_line for its default), cally.kept_secret (a line on
// page 1), cally.said_rcc (a line on page 3). Writes: two_pans.window_learned, two_pans.rite_rebalanced,
// two_pans.rcc_ratio_found, two_pans.final, hub.held_back, cult.doctrine. A replay undoes its own earlier writes first
// (two_pans.p1_doc, two_pans.held_by_pans), so nothing is counted twice. Pulse, Amber and Self are not touched here.
//
// Failure: none (the design says so: the page refuses only what would kill). The page ends `win` only for the best
// result (their rite rebalanced and the last dose rested in the window, the bible's act) and `done` otherwise.
//
// Art (games/dr-tox-finale/art/ASSET_MAP.md, "Two Pans"): the covers (-bench, -suite, -core), -stand, -beam, -pan-red,
// -pan-black, -pointer, -dial, -dial-heart, -token-1..6, -load, -jar, -rack, -confirm, -caption-refuse, -caption-heart.
// `two-pans-tray` is not used: the tray here holds up to twelve tokens, so it is drawn in CSS. Every id falls back to
// a drawing made here when the bundle lacks it.
//
// Quoted from the author's work, verbatim (DESIGN.md): "it always did — it was just never a cure" (bible Part III);
// "His heart fails. This is his sacrifice." (Part VI, Dr. Tox, Story: The Finale, "(stub)"); "the peace that follows it".
// No substance is named and no pip is a quantity of anything: the unit is invented.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): the jars' starting split (6 and 6); the rack's
// split into six tokens and their caps; the token sets and loads' token counts; the hint's wording; the pan-by-pan
// messages; the cap markers; the "Leave their jars" and "Clear" buttons; every card's wording; the line when Cally kept
// her secret (page 1) and the line about a second hand on the stand when she said RCC (page 3); the win rule.

const P = "dtf-tp-";
const INK = "#1a1a1a", RED = "#C8202A", PAPER = "#e8dcc2", PAPER2 = "#d8c9a4";
const SERIF = "'Playfair Display',Georgia,'Times New Roman',serif";
const DISPLAY = "'Oswald','Arial Narrow',Impact,sans-serif";
const MONO = "'IBM Plex Mono','Courier New',Courier,monospace";

const WIN = [0.70, 0.78], HEART = [0.86, 0.90];
const EPS = 1e-9;
const TILT = 10;          // beam tilt in degrees at all BLACK
const HINT_MS = 60000;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// tokens: [pips, cap ("b" | "r" | null), where it starts]
const PAGES = [
  {
    n: 1, scene: "s1_pans_1", cover: "two-pans-cover-bench", place: "The bench", year: "2237", load: 12, pic: "two-pans-jar",
    exact: false, heart: false, hints: true, name: "THE RITE, WEIGHED",
    tokens: [[4, null, "black"], [2, null, "black"], [3, null, "red"], [3, null, "red"], [5, null, "tray"], [3, null, "tray"], [2, null, "tray"], [1, null, "tray"]],
    goal: "Rest the pointer inside the window, with exactly the load laid.",
  },
  {
    n: 2, scene: "s1_pans_2", cover: "two-pans-cover-suite", place: "The suite", year: "2240", load: 12, pic: "two-pans-rack",
    exact: true, heart: false, hints: false, name: "THE RACK",
    tokens: [[3, "b", "tray"], [2, "r", "tray"], [3, "b", "tray"], [1, "r", "tray"], [2, "b", "tray"], [1, "b", "tray"]],
    goal: "Lay each vial in the pan of its cap, and weigh them.",
  },
  {
    n: 3, scene: "s1_pans_3", cover: "two-pans-cover-core", place: "The core", year: "2240", load: 30, pic: "",
    exact: true, heart: true, hints: false, name: "THE LAST WEIGHING",
    tokens: [[6, null, "tray"], [4, null, "tray"], [2, null, "tray"], [5, null, "tray"], [3, null, "tray"], [1, null, "tray"], [6, null, "tray"], [4, null, "tray"], [2, null, "tray"], [5, null, "tray"], [3, null, "tray"], [1, null, "tray"]],
    goal: "A load of 30 pips. Choose where the pointer rests.",
  },
];

// ---- fallback drawings (used only when the art bundle lacks the id) --------------------------------
const polar = (r, p) => { const a = ((-90 + 180 * p) * Math.PI) / 180; return [280 + r * Math.sin(a), 250 - r * Math.cos(a)]; };
const arc = (r, p0, p1) => { const [x0, y0] = polar(r, p0), [x1, y1] = polar(r, p1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0,1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
function fbDial(heart) {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 300"><path d="M80,250 A200,200 0 0,1 480,250" fill="none" stroke="${INK}" stroke-width="8"/>`;
  s += `<path d="${arc(180, WIN[0], WIN[1])}" fill="none" stroke="${RED}" stroke-width="34"/>`;
  if (heart) s += `<path d="${arc(180, HEART[0], HEART[1])}" fill="none" stroke="${INK}" stroke-width="34"/><path d="${arc(180, HEART[0], HEART[1])}" fill="none" stroke="${PAPER}" stroke-width="6"/>`;
  for (let i = 0; i <= 10; i++) { const [x0, y0] = polar(174, i / 10), [x1, y1] = polar(200, i / 10); s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${INK}" stroke-width="4"/>`; }
  s += `<text x="437" y="82" font-size="20" font-family="sans-serif" fill="${RED}" text-anchor="middle" font-weight="bold">WINDOW</text>`;
  if (heart) s += `<text x="505" y="173" font-size="18" font-family="sans-serif" fill="${INK}" text-anchor="middle" font-weight="bold">HEART</text>`;
  s += `<text x="60" y="282" font-size="18" font-family="sans-serif" fill="${RED}" font-weight="bold">ALL RED</text><text x="500" y="282" font-size="18" font-family="sans-serif" fill="${INK}" text-anchor="end" font-weight="bold">ALL BLACK</text><circle cx="280" cy="250" r="6" fill="${INK}"/></svg>`;
  return s;
}
const FB = {
  "two-pans-pointer": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 260"><path d="M20,6 L28,230 L12,230Z" fill="${INK}"/><path d="M20,6 L25,60 L15,60Z" fill="${RED}"/><circle cx="20" cy="240" r="16" fill="${INK}"/><circle cx="20" cy="240" r="5" fill="${RED}"/></svg>`,
  "two-pans-beam": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 60"><path d="M20,22 L340,14 L380,14 L700,22 L700,38 L380,46 L340,46 L20,38Z" fill="${INK}"/><circle cx="360" cy="30" r="9" fill="${RED}"/></svg>`,
  "two-pans-stand": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 520"><rect x="132" y="40" width="36" height="430" fill="${INK}"/><rect x="40" y="470" width="220" height="26" fill="${INK}"/><rect x="70" y="450" width="160" height="24" fill="${INK}"/><circle cx="150" cy="40" r="30" fill="${RED}" stroke="${INK}" stroke-width="5"/><circle cx="150" cy="40" r="8" fill="${INK}"/></svg>`,
  "two-pans-dial": fbDial(false),
  "two-pans-dial-heart": fbDial(true),
};
for (const [id, col, name] of [["two-pans-pan-red", RED, "RED"], ["two-pans-pan-black", INK, "BLACK"]]) {
  FB[id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 290"><circle cx="130" cy="10" r="8" fill="none" stroke="${INK}" stroke-width="4"/><line x1="130" y1="18" x2="30" y2="190" stroke="${INK}" stroke-width="4"/><line x1="130" y1="18" x2="230" y2="190" stroke="${INK}" stroke-width="4"/><path d="M10,190 Q130,290 250,190Z" fill="${col}" stroke="${INK}" stroke-width="5"/><text x="130" y="226" font-size="22" font-family="sans-serif" fill="${col === INK ? PAPER : INK}" text-anchor="middle" font-weight="bold" letter-spacing="3">${name}</text></svg>`;
}
for (let n = 1; n <= 6; n++) FB[`two-pans-token-${n}`] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="42" cy="44" r="34" fill="${INK}"/><circle cx="38" cy="38" r="34" fill="${PAPER}" stroke="${INK}" stroke-width="5"/><circle cx="38" cy="38" r="26" fill="none" stroke="${RED}" stroke-width="3"/><text x="38" y="50" font-size="32" font-family="sans-serif" fill="${INK}" text-anchor="middle" font-weight="bold">${n}</text></svg>`;

function css() {
  return `
.${P}page{position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;background:${INK};color:${INK};font-family:${MONO};-webkit-tap-highlight-color:transparent}
.${P}page *{box-sizing:border-box}
.${P}band{position:relative;z-index:2;flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:6px 12px;background:${RED};border-bottom:5px solid ${INK}}
.${P}band h1{margin:0;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:900 clamp(17px,4.4vw,34px) ${SERIF};letter-spacing:.07em;text-transform:uppercase;color:${INK}}
.${P}no{flex:0 0 auto;border:3px solid ${INK};background:${PAPER};padding:1px 9px;font:700 clamp(12px,2.6vw,18px) ${SERIF};white-space:nowrap}
.${P}help{flex:0 0 auto;width:34px;height:34px;border:3px solid ${INK};background:${PAPER};font:700 17px ${SERIF};cursor:pointer;padding:0;color:${INK}}
.${P}body{position:relative;z-index:1;flex:1 1 auto;min-height:0;display:grid;gap:6px;padding:8px;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto auto auto auto;grid-template-areas:"strip" "stage" "sel" "tray" "cap" "act"}
.${P}cov{position:absolute;left:0;right:0;top:0;bottom:0;z-index:-1;pointer-events:none;background-color:${PAPER2};background-repeat:no-repeat;overflow:hidden}
.${P}strip{grid-area:strip;position:relative;display:flex;align-items:center;gap:8px;min-width:0}
.${P}plate{position:relative;flex:0 0 auto;width:var(--lw);aspect-ratio:300/90;--lw:128px}
.${P}plate img{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}plate .${P}fb{position:absolute;inset:0;border:3px solid ${INK};background:${PAPER};font:700 11px ${MONO};padding:3px 6px}
.${P}plate b{position:absolute;left:36.7%;width:36.7%;bottom:33%;text-align:center;font:900 calc(var(--lw) * .13)/1 ${SERIF};color:${INK}}
.${P}pic{flex:0 0 auto;height:58px;width:auto;display:block}
.${P}pic img{height:100%;width:auto;display:block}
.${P}read{flex:1 1 auto;min-width:0;border:3px solid ${INK};background:${PAPER};padding:4px 8px;font:700 11px/1.35 ${MONO};letter-spacing:.03em}
.${P}read span{white-space:nowrap}
.${P}read em{font-style:normal;color:${RED}}
.${P}stage{grid-area:stage;position:relative;min-height:0;background:rgba(232,220,194,.94);border:4px solid ${INK};box-shadow:6px 6px 0 ${INK};overflow:hidden}
.${P}stage img,.${P}stage svg{display:block}
.${P}dial{position:absolute}
.${P}dial>span.${P}art{position:absolute;inset:0;display:block}
.${P}dial>span.${P}art>*{width:100%;height:100%;display:block}
.${P}ptr{position:absolute;left:46.43%;top:3.33%;width:7.14%;height:86.67%;transform-origin:50% 92.3%;will-change:transform;pointer-events:none}
.${P}ptr>*{width:100%;height:100%;display:block}
.${P}exact{position:absolute;left:24%;right:24%;bottom:0;display:flex;flex-direction:column;align-items:center;font:700 11px/1.25 ${MONO};letter-spacing:.04em;white-space:nowrap;pointer-events:none}
.${P}exact b{color:${RED}}
.${P}beam,.${P}stand,.${P}pan{position:absolute;left:0;top:0}
.${P}beam>*,.${P}stand>*,.${P}pan>.${P}pimg>*{width:100%;height:100%;display:block}
.${P}beam{will-change:transform;pointer-events:none}
.${P}stand{pointer-events:none}
.${P}pan{will-change:transform;touch-action:none}
.${P}pimg{position:absolute;inset:0;pointer-events:none}
.${P}pan.${P}drop::after{content:"";position:absolute;left:-6px;right:-6px;top:30%;bottom:-4px;border:3px dashed ${RED};pointer-events:none}
.${P}pan.${P}shake{animation:${P}shake .35s linear}
@keyframes ${P}shake{0%,100%{margin-left:0}20%{margin-left:-6px}40%{margin-left:6px}60%{margin-left:-4px}80%{margin-left:4px}}
.${P}tok{position:relative;flex:0 0 auto;width:var(--tw,44px);height:var(--tw,44px);padding:0;margin:0;border:0;background:transparent;cursor:grab;touch-action:none;font-family:${MONO};display:block;-webkit-user-select:none;user-select:none}
.${P}tok>img,.${P}tok>span.${P}tk{display:block;width:100%;height:100%;pointer-events:none}
.${P}tok:focus-visible{outline:3px dashed ${RED};outline-offset:3px}
.${P}pan .${P}tok{position:absolute;width:var(--tp,40px);height:var(--tp,40px)}
.${P}tok.${P}sel::after{content:"";position:absolute;inset:-5px;border:4px solid ${RED};border-radius:50%;pointer-events:none;box-shadow:0 0 0 2px ${PAPER}}
.${P}tok.${P}hint::before{content:"";position:absolute;inset:-6px;border:3px dashed ${RED};border-radius:50%;pointer-events:none;background:rgba(200,32,42,.12)}
.${P}tok[data-h]::after{content:attr(data-h);position:absolute;left:50%;top:-15px;transform:translateX(-50%);font:700 9px ${MONO};background:${RED};color:${PAPER};padding:0 3px;white-space:nowrap;pointer-events:none}
.${P}tok.${P}sel[data-h]::after{inset:auto;border:0;box-shadow:none;border-radius:0;left:50%;top:-15px}
.${P}tok i{position:absolute;right:-3px;top:-3px;width:34%;height:34%;border-radius:50%;border:2px solid ${PAPER};pointer-events:none}
.${P}tok i.${P}cb{background:${INK}}.${P}tok i.${P}cr{background:${RED}}
.${P}tok.${P}ghost{position:fixed;z-index:50;pointer-events:none;cursor:grabbing;filter:drop-shadow(3px 4px 0 rgba(0,0,0,.45))}
.${P}tok.${P}lift{opacity:.28}
.${P}tok.${P}jump{animation:${P}jump .55s ease-out}
@keyframes ${P}jump{0%{transform:translateY(-70px) rotate(-60deg);opacity:0}55%{transform:translateY(-14px) rotate(20deg);opacity:1}100%{transform:none}}
.${P}selbar{grid-area:sel;display:flex;gap:6px;justify-content:center;align-items:center;min-height:36px;visibility:hidden;font:700 11px ${MONO};letter-spacing:.04em}
.${P}selbar.${P}on{visibility:visible}
.${P}selbar span{background:${INK};color:${PAPER};padding:6px 8px}
.${P}tray{grid-area:tray;position:relative;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;justify-content:center;min-height:calc(var(--tt,44px) + 16px);padding:8px 10px;background:${INK};border:3px solid ${INK};box-shadow:4px 4px 0 ${RED}}
.${P}tray.${P}drop{outline:3px dashed ${RED};outline-offset:-1px}
.${P}tray .${P}tok{--tw:var(--tt,44px)}
.${P}tlab{position:absolute;left:8px;top:2px;font:700 9px ${MONO};color:${RED};letter-spacing:.1em;pointer-events:none}
.${P}cap{grid-area:cap;position:relative;min-width:0;background:${PAPER};border:3px solid ${INK};box-shadow:4px 4px 0 ${INK};padding:6px 10px;min-height:64px;display:flex;flex-direction:column;justify-content:center;gap:2px}
.${P}cap img{display:block;width:min(100%,210px);height:auto;margin:0 auto 2px}
.${P}cap h3{margin:0;font:700 clamp(12px,2.6vw,15px) ${DISPLAY};letter-spacing:.08em;text-transform:uppercase}
.${P}cap p{margin:0;font-size:12px;line-height:1.35}
.${P}cap .${P}kick{font:700 10px ${MONO};letter-spacing:.1em;color:${RED};text-transform:uppercase}
.${P}cap .${P}note{font-size:11.5px;opacity:.9}
.${P}act{grid-area:act;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap}
.${P}btn{font:700 12px ${MONO};letter-spacing:.04em;border:3px solid ${INK};background:${PAPER};color:${INK};padding:6px 10px;min-height:40px;cursor:pointer;box-shadow:3px 3px 0 ${INK}}
.${P}btn:hover{background:#f1e8d2}.${P}btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ${INK}}
.${P}btn:focus-visible,.${P}rest:focus-visible,.${P}help:focus-visible{outline:3px dashed ${INK};outline-offset:3px}
.${P}btn.${P}go{background:${INK};color:${PAPER};box-shadow:3px 3px 0 ${RED}}
.${P}rest{border:0;background:none;padding:0;cursor:pointer;width:min(210px,52vw);display:block;aspect-ratio:260/90}
.${P}rest img{width:100%;height:100%;display:block;pointer-events:none}
.${P}rest .${P}fb{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:${INK};color:${PAPER};box-shadow:5px 5px 0 ${RED};font:700 24px ${SERIF};letter-spacing:.14em}
.${P}rest[aria-disabled="true"]{filter:grayscale(1) opacity(.5);cursor:not-allowed}
.${P}ov{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(26,26,26,.82);overflow:auto}
.${P}card{width:min(540px,100%);max-height:100%;overflow:auto;background:${PAPER};border:4px solid ${INK};box-shadow:8px 8px 0 ${RED};padding:14px 18px 16px}
.${P}card .${P}kick{font:700 11px ${MONO};letter-spacing:.12em;color:${RED};text-transform:uppercase}
.${P}card h2{margin:2px 0 8px;font:900 clamp(22px,5vw,30px) ${SERIF};letter-spacing:.05em;text-transform:uppercase}
.${P}card p{margin:0 0 8px;font-size:13px;line-height:1.45}
.${P}card ul{margin:0 0 8px;padding:0;list-style:none}
.${P}card li{font-size:12.5px;line-height:1.4;margin:0 0 4px;display:flex;gap:8px}
.${P}card li b{flex:0 0 68px;color:${RED}}
.${P}card blockquote{margin:0 0 10px;padding:6px 10px;border-left:5px solid ${RED};font:italic 600 15px/1.35 ${SERIF}}
.${P}card blockquote cite{display:block;margin-top:3px;font:400 10.5px ${MONO};font-style:normal;opacity:.75}
.${P}card img.${P}cardart{display:block;width:min(100%,320px);height:auto;margin:0 0 10px}
.${P}btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.${P}vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (min-width:900px){
.${P}body{grid-template-columns:232px minmax(0,1fr) 272px;grid-template-rows:minmax(0,1fr) auto auto auto;grid-template-areas:"strip stage cap" "strip sel cap" "strip tray cap" "strip act cap";gap:8px 14px;padding:12px 16px}
.${P}strip{flex-direction:column;align-items:stretch;align-self:start}
.${P}plate{--lw:200px}
.${P}pic{height:auto;width:100%}
.${P}pic img{width:100%;height:auto;max-height:190px;object-fit:contain}
.${P}cap{align-self:start;padding:10px 12px}
.${P}cap img{width:min(100%,300px)}
.${P}cap p{font-size:13px}
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
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch { /* storage off */ } };
    const num = (k, d) => { const v = Number(sget(k, d)); return Number.isFinite(v) ? v : d; };

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    let dead = false;

    // art id -> an element: the bundle's image, or the drawing made here
    function artEl(id, parent, alt) {
      const u = url(id);
      if (u) { const i = mk("img", null, parent); i.src = u; i.alt = alt || ""; i.draggable = false; return i; }
      if (FB[id]) { const s = mk("span", P + "tk", parent); s.innerHTML = FB[id]; s.setAttribute("role", "img"); s.setAttribute("aria-label", alt || ""); return s; }
      return null;
    }

    const style = mk("style", null, root); style.textContent = css();
    const page = mk("div", P + "page", root);
    page.setAttribute("aria-label", "The Two Pans: a balance, and the ratio of the last dose");
    const dom = {};

    // ---- the page's frame (built once) -------------------------------------------------------------
    const band = mk("div", P + "band", page);
    dom.title = mk("h1", null, band, "The Two Pans");
    dom.no = mk("div", P + "no", band, "No. 1");
    dom.help = mk("button", P + "help", band, "?"); dom.help.type = "button"; dom.help.setAttribute("aria-label", "How to play");
    const body = mk("div", P + "body", page);
    dom.cov = mk("div", P + "cov", body);
    dom.strip = mk("div", P + "strip", body);
    dom.plate = mk("div", P + "plate", dom.strip);
    dom.pic = mk("div", P + "pic", dom.strip);
    dom.read = mk("div", P + "read", dom.strip);
    dom.stage = mk("div", P + "stage", body);
    dom.selbar = mk("div", P + "selbar", body);
    dom.tray = mk("div", P + "tray", body);
    dom.cap = mk("div", P + "cap", body); dom.cap.setAttribute("aria-live", "polite");
    dom.act = mk("div", P + "act", body);
    dom.clear = mk("button", P + "btn", dom.act, "Clear"); dom.clear.type = "button";
    dom.leave = mk("button", P + "btn", dom.act, "Leave their jars"); dom.leave.type = "button";
    dom.rest = mk("button", P + "rest", dom.act); dom.rest.type = "button"; dom.rest.setAttribute("aria-label", "Rest it");
    if (has("two-pans-confirm")) artEl("two-pans-confirm", dom.rest, "Rest it"); else mk("span", P + "fb", dom.rest, "REST IT");

    // ---- state -------------------------------------------------------------------------------------
    let mode = "intro";                     // intro | play | weigh | pop | over
    let pi = 0, PG = PAGES[0], firstPage = 0;
    let tokens = [], byId = {};
    const pans = { red: [], black: [] };
    let sel = null;
    let drag = null;
    let reg = { name: "idle", target: 0.5, w: 0, b: 0, r: 0 };
    let disp = 0.5, vel = 0, kt = 0, restT = 0, settled = false;
    let raf = 0, last = 0, hintOn = false, hintMap = null, msg = "", msgTimer = null, capKey = "";
    const M = { W: 0, H: 0 };
    const results = [];
    let played1 = false;

    const F = {
      kept: () => !!sget("cally.kept_secret", false),
      rcc: () => !!sget("cally.said_rcc", false),
      base: () => clamp(Math.round(num("following", 60) / 2 + (sget("cult.icon", false) ? 20 : 0) + (sget("manifold.resin_line", false) ? 15 : 0)), 0, 100),
    };

    // ---- the balance's maths ------------------------------------------------------------------------
    const sum = (ids) => ids.reduce((a, id) => a + byId[id].n, 0);
    function regime() {
      const b = sum(pans.black), r = sum(pans.red), w = b + r;
      if (!w) return { name: "idle", target: 0.5, w, b, r };
      const s = b / w;
      let name = "drift";
      if (s >= WIN[0] - EPS && s <= WIN[1] + EPS) name = "window";
      else if (PG.heart && s >= HEART[0] - EPS && s <= HEART[1] + EPS) name = "heart";
      else if (s < WIN[0] - EPS) name = "knock";
      return { name, target: s, w, b, r };
    }
    const restable = (n) => n === "window" || n === "heart" || n === "idle";

    // ---- layout (the stage's pieces are placed in pixels from the stage's size) ----------------------
    function layout() {
      const W = dom.stage.clientWidth, H = dom.stage.clientHeight;
      if (!W || !H || !dom.dial) return;
      const pad = 8;
      const dialW = Math.max(180, Math.min(W - 2 * pad, 500, H * 0.40 * 560 / 300));
      const dialH = dialW * 300 / 560;
      dom.dial.style.cssText = `left:${(W - dialW) / 2}px;top:${pad}px;width:${dialW}px;height:${dialH}px`;
      if (dom.exact) dom.exact.style.fontSize = `${Math.max(9, Math.min(13, dialW * 0.032)).toFixed(1)}px`;
      const y0 = pad + dialH + 14;
      const bH = H - y0;
      const Pw = clamp(Math.min(W * 0.30, bH * 0.50), 92, 200);
      const Tp = clamp(Pw * 0.34, 34, 50);
      const Tt = clamp(Pw * 0.36, 38, 54);
      const beamW = Math.max(150, Math.min(640, (W / 2 - Pw / 2 - 4) / 0.4722));
      const s = clamp((H - y0 - 6) / 480, 0.25, 0.9);
      Object.assign(M, { W, H, y0, Pw, Tp, Tt, beamW, L: beamW * 340 / 720, hookY: 10 * Pw / 260, panH: Pw * 290 / 260 });
      dom.beam.style.cssText = `width:${beamW}px;height:${beamW * 60 / 720}px;left:${W / 2 - beamW / 2}px;top:${y0 - beamW * 30 / 720}px;transform-origin:50% 50%`;
      dom.stand.style.cssText = `width:${300 * s}px;height:${520 * s}px;left:${W / 2 - 150 * s}px;top:${y0 - 40 * s}px`;
      for (const k of ["red", "black"]) { dom.pan[k].style.width = `${Pw}px`; dom.pan[k].style.height = `${M.panH}px`; }
      page.style.setProperty("--tp", `${Tp}px`); page.style.setProperty("--tt", `${Tt}px`);
      // the cover, cropped below its own title band (the page has its own)
      const cw = dom.cov.clientWidth, ch = dom.cov.clientHeight, cu = url(PG.cover);
      if (cu && cw && ch) {
        const k = Math.max(cw / 1280, ch / 602);
        dom.cov.style.backgroundImage = `url("${cu}")`;
        dom.cov.style.backgroundSize = `${1280 * k}px ${720 * k}px`;
        dom.cov.style.backgroundPosition = `${(cw - 1280 * k) / 2}px ${-118 * k + (ch - 602 * k) / 2}px`;
      }
      placeTokens();
      visual();
    }

    function visual() {
      if (!M.W || !dom.ptr) return;
      dom.ptr.style.transform = `rotate(${(-90 + 180 * disp).toFixed(2)}deg)`;
      const th = TILT * (2 * disp - 1), rad = th * Math.PI / 180;
      dom.beam.style.transform = `rotate(${th.toFixed(2)}deg)`;
      const cx = M.W / 2, dx = M.L * Math.cos(rad), dy = M.L * Math.sin(rad);
      dom.pan.red.style.transform = `translate(${(cx - dx - M.Pw / 2).toFixed(1)}px,${(M.y0 - dy - M.hookY).toFixed(1)}px)`;
      dom.pan.black.style.transform = `translate(${(cx + dx - M.Pw / 2).toFixed(1)}px,${(M.y0 + dy - M.hookY).toFixed(1)}px)`;
    }

    // ---- the pointer's motion ------------------------------------------------------------------------
    function step(dt) {
      const t = reg.target;
      if (RM) { disp = t; vel = 0; settled = true; return; }
      if (reg.name === "knock") {
        kt += dt;
        disp += (t + 0.045 * Math.sin(kt * 17) * (0.65 + 0.35 * Math.sin(kt * 4.3)) - disp) * Math.min(1, dt * 18); vel = 0;
      } else if (reg.name === "drift") {
        kt += dt;
        disp += (t + 0.07 * Math.sin(kt * 0.8) + 0.035 * Math.sin(kt * 2.1 + 1.3) - disp) * Math.min(1, dt * 4); vel = 0;
      } else {
        vel += (70 * (t - disp) - 5.5 * vel) * dt; disp += vel * dt;
      }
      if (restable(reg.name) && Math.abs(disp - t) < 0.004 && Math.abs(vel) < 0.04) restT += dt; else restT = 0;
      const was = settled; settled = restable(reg.name) && restT > 0.4;
      if (was !== settled) caption();
    }
    function frame(now) {
      raf = 0; if (dead) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
      step(dt); visual();
      const done = restable(reg.name) && settled;
      if (done) { disp = reg.target; visual(); last = 0; } else raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (RM) { settled = restable(reg.name); disp = reg.target; visual(); return; }
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }

    // ---- tokens ---------------------------------------------------------------------------------------
    function buildTokens() {
      tokens.forEach((t) => t.el.remove());
      tokens = []; byId = {}; pans.red = []; pans.black = [];
      PG.tokens.forEach(([n, cap, loc], i) => {
        const el = mk("button", P + "tok", null); el.type = "button";
        artEl(`two-pans-token-${n}`, el, `${n} pips`);
        if (cap) mk("i", cap === "b" ? P + "cb" : P + "cr", el);
        el.setAttribute("aria-label", `Token of ${n} ${n === 1 ? "pip" : "pips"}${cap ? ", capped " + (cap === "b" ? "BLACK" : "RED") : ""}`);
        const t = { id: i, n, cap, loc, el, start: loc };
        el.dataset.id = String(i);
        tokens.push(t); byId[i] = t;
        if (loc === "red" || loc === "black") pans[loc].push(i);
        wireToken(t);
      });
    }
    function placeTokens() {
      const rimY = M.Pw * 190 / 260, Tp = M.Tp, rimW = M.Pw * 0.92;
      const step = Tp * 0.78, perRow = Math.max(2, Math.floor((rimW - Tp) / step) + 1);
      for (const k of ["red", "black"]) {
        const ids = pans[k];
        ids.forEach((id, i) => {
          const t = byId[id]; if (t.el.parentNode !== dom.pan[k]) dom.pan[k].appendChild(t.el);
          const row = Math.floor(i / perRow), inRow = Math.min(perRow, ids.length - row * perRow), col = i - row * perRow;
          const rw = Tp + (inRow - 1) * step;
          t.el.style.left = `${M.Pw / 2 - rw / 2 + col * step}px`;
          t.el.style.top = `${rimY - Tp + 8 - row * Tp * 0.8}px`;
          t.el.style.width = t.el.style.height = "";
        });
      }
      for (const t of tokens) if (t.loc === "tray") { if (t.el.parentNode !== dom.tray) dom.tray.appendChild(t.el); t.el.style.left = t.el.style.top = ""; }
    }
    function mark() {
      for (const t of tokens) {
        t.el.classList.toggle(P + "sel", sel === t.id);
        const h = hintOn && hintMap ? hintMap[t.id] : null;
        t.el.classList.toggle(P + "hint", !!h);
        if (h) t.el.dataset.h = h; else delete t.el.dataset.h;
      }
      dom.selbar.classList.toggle(P + "on", sel != null && mode === "play");
      dom.pan.red.classList.toggle(P + "drop", sel != null);
      dom.pan.black.classList.toggle(P + "drop", sel != null);
      dom.selbar.innerHTML = "";
      if (sel != null) {
        const t = byId[sel];
        mk("span", null, dom.selbar, `${t.n} ${t.n === 1 ? "PIP" : "PIPS"}:`);
        for (const [lab, loc] of [["RED PAN", "red"], ["BLACK PAN", "black"], ["TRAY", "tray"]]) {
          const b = mk("button", P + "btn", dom.selbar, lab); b.type = "button"; b.disabled = t.loc === loc;
          on(b, "click", () => place(sel, loc));
        }
      }
    }

    function wireToken(t) {
      const el = t.el;
      on(el, "pointerdown", (e) => {
        if (mode !== "play" || (e.button != null && e.button > 0) || drag) return;
        drag = { id: t.id, sx: e.clientX, sy: e.clientY, moved: false, pid: e.pointerId, ghost: null };
        try { el.setPointerCapture(e.pointerId); } catch { /* none */ }
      });
      on(el, "pointermove", (e) => {
        if (!drag || drag.id !== t.id || e.pointerId !== drag.pid) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) {
          drag.moved = true;
          const g = mk("div", P + "tok " + P + "ghost", page);
          const sz = el.getBoundingClientRect().width || M.Tt; g.style.width = g.style.height = `${sz}px`; g.style.left = g.style.top = "0";
          artEl(`two-pans-token-${t.n}`, g, "");
          drag.ghost = g; drag.sz = sz; el.classList.add(P + "lift");
          sel = null; mark(); dropHint(true);
        }
        if (drag.moved && drag.ghost) drag.ghost.style.transform = `translate(${e.clientX - drag.sz / 2}px,${e.clientY - drag.sz / 2}px)`;
      });
      const end = (e, cancel) => {
        if (!drag || drag.id !== t.id) return;
        const d = drag; drag = null;
        try { el.releasePointerCapture(d.pid); } catch { /* none */ }
        el.classList.remove(P + "lift"); dropHint(false);
        if (d.ghost) d.ghost.remove();
        if (cancel) return;
        if (d.moved) { const loc = hitLoc(e.clientX, e.clientY); if (loc) place(t.id, loc); }
        else if (sel != null && sel !== t.id && (t.loc === "red" || t.loc === "black")) place(sel, t.loc);   // a tap on a laid pip is a tap on its pan
        else { sel = sel === t.id ? null : t.id; mark(); }
      };
      on(el, "pointerup", (e) => end(e, false));
      on(el, "pointercancel", (e) => end(e, true));
      on(el, "click", (e) => { if (e.detail === 0 && mode === "play") { sel = sel === t.id ? null : t.id; mark(); } });
      on(el, "keydown", (e) => {
        if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key;
        if (k === "ArrowLeft" || k === "r" || k === "R") { place(t.id, "red", true); e.preventDefault(); }
        else if (k === "ArrowRight" || k === "b" || k === "B") { place(t.id, "black", true); e.preventDefault(); }
        else if (k === "ArrowDown" || k === "t" || k === "T" || k === "Backspace" || k === "Delete") { place(t.id, "tray", true); e.preventDefault(); }
        else if (k === "Escape" && sel != null) { sel = null; mark(); e.preventDefault(); }
      });
    }
    const inflate = (r, d) => ({ left: r.left - d, right: r.right + d, top: r.top - d, bottom: r.bottom + d });
    const inside = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    function hitLoc(x, y) {
      if (inside(inflate(dom.pan.black.getBoundingClientRect(), 14), x, y)) return "black";
      if (inside(inflate(dom.pan.red.getBoundingClientRect(), 14), x, y)) return "red";
      if (inside(inflate(dom.tray.getBoundingClientRect(), 10), x, y)) return "tray";
      return null;
    }
    function dropHint(on_) { dom.pan.red.classList.toggle(P + "drop", on_); dom.pan.black.classList.toggle(P + "drop", on_); dom.tray.classList.toggle(P + "drop", on_); }

    function place(id, loc, refocus) {
      if (mode !== "play") return false;
      const t = byId[id]; if (!t) return false;
      if (t.loc === loc) { sel = null; mark(); return false; }
      if (loc !== "tray" && t.loc === "tray" && reg.w + t.n > PG.load) {
        shake(loc); flash(`The load is ${PG.load} pips, and ${reg.w} ${reg.w === 1 ? "is" : "are"} laid. Take one out first.`);
        if (refocus) t.el.focus({ preventScroll: true });
        return false;
      }
      if (t.loc === "red" || t.loc === "black") pans[t.loc].splice(pans[t.loc].indexOf(id), 1);
      t.loc = loc; if (loc !== "tray") pans[loc].push(id);
      sel = null; msg = "";
      changed();
      if (refocus) t.el.focus({ preventScroll: true });
      if (loc !== "tray" && reg.w === PG.load && reg.name === "knock") later(() => { if (!dead && mode === "play" && reg.w === PG.load && reg.name === "knock") refuse(); }, RM ? 0 : 450);
      return true;
    }
    function shake(loc) {
      if (RM) return;
      const el = dom.pan[loc]; el.classList.remove(P + "shake"); void el.offsetWidth; el.classList.add(P + "shake");
      later(() => el.classList.remove(P + "shake"), 400);
    }
    // the page will not weigh a dose that stops hearts: the beam knocks and the last RED token jumps out
    function refuse() {
      if (reg.name === "knock" && reg.w === PG.load && pans.red.length) {
        const id = pans.red[pans.red.length - 1], t = byId[id];
        pans.red.splice(pans.red.length - 1, 1); t.loc = "tray";
        changed();
        if (!RM) { t.el.classList.remove(P + "jump"); void t.el.offsetWidth; t.el.classList.add(P + "jump"); later(() => t.el.classList.remove(P + "jump"), 600); }
        flash("It will not rest there. A RED token jumps out of the pan.");
      } else flash("It will not rest there.");
      shake("red"); shake("black");
    }
    function changed() {
      reg = regime(); restT = 0; settled = false; kt = 0;
      placeTokens(); mark(); readout(); kick(); caption();
      if (hintOn) computeHint();
    }

    // ---- hint: the tokens that would bring the pointer into the window (Two Pans 1 only) ---------------
    function computeHint() {
      const T = tokens, L = PG.load, cur = T.map((t) => (t.loc === "tray" ? 0 : t.loc === "black" ? 1 : 2));
      let best = null, bestCost = 1e9; const asg = new Array(T.length).fill(0);
      (function rec(i, b, r, cost) {
        if (cost >= bestCost || b + r > L) return;
        if (i === T.length) { if (b + r === L) { const s = b / L; if (s >= WIN[0] - EPS && s <= WIN[1] + EPS) { best = asg.slice(); bestCost = cost; } } return; }
        for (const v of [cur[i], ...[0, 1, 2].filter((x) => x !== cur[i])]) {
          asg[i] = v; rec(i + 1, b + (v === 1 ? T[i].n : 0), r + (v === 2 ? T[i].n : 0), cost + (v === cur[i] ? 0 : 1));
        }
      })(0, 0, 0, 0);
      hintMap = {};
      if (best) T.forEach((t, i) => { if (best[i] !== cur[i]) hintMap[t.id] = best[i] === 0 ? "TRAY" : best[i] === 1 ? "BLACK" : "RED"; });
      mark();
    }

    // ---- readout and captions --------------------------------------------------------------------------
    function readout() {
      const R = dom.read; R.innerHTML = "";
      const line = (a, b) => { const s = mk("span", null, R); s.append(a); if (b != null) mk("em", null, s, b); R.appendChild(document.createElement("br")); };
      line("BLACK ", String(reg.b)); line("RED ", String(reg.r));
      line("LAID ", `${reg.w} OF ${PG.load}`);
      if (PG.exact && reg.w) line("BLACK SHARE ", `${Math.round(reg.b / reg.w * 1000) / 10}%`);
    }
    function flash(t) {
      msg = t; capKey = ""; caption();
      if (msgTimer) clearTimeout(msgTimer);
      msgTimer = later(() => { msg = ""; capKey = ""; caption(); }, 3200);
    }
    function caption() {
      if (!dom.cap) return;
      setConfirmState();
      if (mode !== "play" && mode !== "weigh") return;
      const key = `${reg.name}|${settled}|${reg.w}|${msg}|${PG.n}`;
      if (key === capKey) return; capKey = key;
      const C = dom.cap; C.innerHTML = "";
      mk("div", P + "kick", C, `No. ${PG.n} · ${PG.place}`);
      if (reg.name === "heart" && settled && !msg) {
        if (!artEl("two-pans-caption-heart", C, "HERE, HIS HEART WOULD HOLD.")) mk("h3", null, C, "HERE, HIS HEART WOULD HOLD.");
        return;
      }
      let head, body;
      if (reg.name === "idle") { head = "The pans are empty."; body = PG.goal; }
      else if (reg.name === "knock") { head = "It will not rest there."; body = "Too much RED. The beam knocks."; if (PG.n === 1 && !hintOn) body += " There is a window printed on the dial."; }
      else if (reg.name === "drift") { head = "It will not rest there."; body = "Too much BLACK. The pointer settles nowhere."; }
      else if (!settled) { head = "It swings."; body = "Wait for the pointer."; }
      else { head = "It rests in the window."; body = reg.w < PG.load ? `${PG.load - reg.w} more ${PG.load - reg.w === 1 ? "pip" : "pips"} to the load.` : (reg.name === "heart" ? "" : "The load is laid. Rest it."); }
      if ((reg.name === "knock" || reg.name === "drift")) { if (!artEl("two-pans-caption-refuse", C, head)) mk("h3", null, C, head); } else mk("h3", null, C, head);
      if (body) mk("p", null, C, body);
      if (msg) mk("p", P + "note", C, msg);
      if (hintOn && PG.hints && reg.name !== "window") mk("p", P + "note", C, "The outlined tokens would bring it into the window.");
    }

    function setConfirmState() {
      const ok = mode === "play" && restable(reg.name) && reg.name !== "idle" && settled && reg.w === PG.load;
      dom.rest.setAttribute("aria-disabled", ok ? "false" : "true");
    }

    // ---- building a page -------------------------------------------------------------------------------
    function beginPage(i) {
      pi = i; PG = PAGES[i];
      dom.title.textContent = "The Two Pans"; dom.no.textContent = `No. ${PG.n}`;
      dom.plate.innerHTML = ""; dom.pic.innerHTML = ""; dom.stage.innerHTML = "";
      page.style.setProperty("--lw", "");
      if (has("two-pans-load")) artEl("two-pans-load", dom.plate, `Load: ${PG.load} pips`); else mk("div", P + "fb", dom.plate, "LOAD PIPS");
      mk("b", null, dom.plate, String(PG.load));
      if (PG.pic) { const el = artEl(PG.pic, dom.pic, PG.pic === "two-pans-jar" ? "One of the cult's rite jars" : "RCC's rack of vials"); if (!el) dom.pic.style.display = "none"; else dom.pic.style.display = ""; }
      else { dom.pic.style.display = "none"; }
      // the stage
      dom.dial = mk("div", P + "dial", dom.stage);
      const dart = mk("span", P + "art", dom.dial); artEl(PG.heart ? "two-pans-dial-heart" : "two-pans-dial", dart, "The dial, with its window");
      dom.ptr = mk("div", P + "ptr", dom.dial); artEl("two-pans-pointer", dom.ptr, "");
      dom.exact = null;
      if (PG.exact) {
        dom.exact = mk("div", P + "exact", dom.dial);
        mk("b", null, dom.exact, "WINDOW 70 TO 78%");
        if (PG.heart) mk("span", null, dom.exact, "HEART 86 TO 90%");
      }
      dom.stand = mk("div", P + "stand", dom.stage); artEl("two-pans-stand", dom.stand, "");
      dom.beam = mk("div", P + "beam", dom.stage); artEl("two-pans-beam", dom.beam, "");
      dom.pan = {};
      for (const k of ["red", "black"]) {
        const p = mk("div", P + "pan", dom.stage); p.setAttribute("role", "group"); p.setAttribute("aria-label", `The ${k.toUpperCase()} pan`);
        const im = mk("div", P + "pimg", p); artEl(`two-pans-pan-${k}`, im, `The ${k.toUpperCase()} pan`);
        dom.pan[k] = p;
        on(p, "click", (e) => { if (mode === "play" && sel != null && !(e.target.closest && e.target.closest("." + P + "tok"))) place(sel, k); });
      }
      on(dom.tray, "click", (e) => { if (mode === "play" && sel != null && e.target === dom.tray) place(sel, "tray"); });
      dom.tray.innerHTML = ""; mk("span", P + "tlab", dom.tray, "TOKENS");
      buildTokens();
      sel = null; hintOn = false; hintMap = null; msg = ""; capKey = ""; disp = 0.5; vel = 0; kt = 0;
      reg = regime(); settled = false; restT = 0;
      dom.leave.style.display = PG.n === 1 ? "" : "none";
      dom.clear.style.display = "";
      mode = "intro";
      layout(); readout(); mark(); setConfirmState();
      dom.cap.innerHTML = ""; mk("div", P + "kick", dom.cap, `No. ${PG.n} · ${PG.place} · ${PG.year}`); mk("h3", null, dom.cap, PG.name);
      intro();
    }

    function startPlay() {
      mode = "play"; capKey = "";
      reg = regime(); changed();
      if (PG.hints) later(() => { if (!dead && mode === "play" && pi === 0) { hintOn = true; capKey = ""; computeHint(); caption(); } }, HINT_MS);
    }

    // ---- cards --------------------------------------------------------------------------------------------
    function card(label) {
      const ov = mk("div", P + "ov", page);
      const c = mk("div", P + "card", ov); c.setAttribute("role", "dialog"); c.setAttribute("aria-label", label);
      return { ov, c };
    }
    function howto(c) {
      const ul = mk("ul", null, c);
      for (const [a, b] of [
        ["Lay", "Brass pips go in a pan: drag one, or tap it and then tap a pan (or a button). RED is the left pan, BLACK the right. Tap a laid pip to move it."],
        ["Keys", "Tab to a pip. Left or R puts it in RED, Right or B in BLACK, Down or T takes it back. Enter picks it up."],
        ["Pointer", "It shows the share of BLACK in the whole. Rest it inside the WINDOW with exactly the load laid, then REST IT."],
        ["Refused", "Too much RED and the beam knocks; the page will not weigh it. Too much BLACK and the pointer settles nowhere."],
      ]) { const li = mk("li", null, ul); mk("b", null, li, a); mk("span", null, li, b); }
    }
    function intro() {
      const { ov, c } = card(`The Two Pans, No. ${PG.n}`);
      mk("div", P + "kick", c, `No. ${PG.n} · ${PG.place} · ${PG.year}`);
      mk("h2", null, c, PG.name);
      if (PG.n === 1) {
        mk("p", null, c, "The cult's rite jars, laid on the scale as they made them: six pips BLACK, six RED, a load of 12. The pointer will not rest. A window is printed on the dial. Find where it is.");
        if (F.kept()) mk("p", null, c, "Behind him, the broom has stopped.");
      } else if (PG.n === 2) {
        mk("p", null, c, "Twelve vials from a rack in a high suite, as six tokens: each capped BLACK or RED. Lay each in the pan of its cap, and weigh them. The window's edges are printed exactly now.");
      } else {
        mk("p", null, c, "A balance on a steel stand, a work lamp, the city. A load of 30 pips. The dial is printed exactly. Choose where the pointer rests.");
      }
      if (pi === firstPage) howto(c);
      const bt = mk("div", P + "btns", c);
      const go = mk("button", P + "btn " + P + "go", bt, pi === firstPage ? `Start: ${PG.place.toLowerCase()}` : "Begin"); go.type = "button";
      on(go, "click", () => { ov.remove(); startPlay(); });
      if (pi === 0 && firstPage === 0 && !results.length) {
        for (const j of [1, 2]) { const b = mk("button", P + "btn", bt, `Start at ${PAGES[j].place.toLowerCase()}`); b.type = "button"; on(b, "click", () => { ov.remove(); firstPage = j; beginPage(j); }); }
      }
      later(() => { if (!dead) go.focus({ preventScroll: true }); }, 30);
      dom.ovIntro = ov;
    }
    on(dom.help, "click", () => {
      if (mode === "over") return;
      const prev = mode; mode = "weigh";
      const { ov, c } = card("How to play");
      mk("div", P + "kick", c, "1D · Pulp, red and black");
      mk("h2", null, c, "How to play"); howto(c);
      mk("p", null, c, "There is no failing. The page refuses only what would kill, and says where the pointer rests.");
      const bt = mk("div", P + "btns", c); const ok = mk("button", P + "btn " + P + "go", bt, "Back to the pans"); ok.type = "button";
      on(ok, "click", () => { ov.remove(); mode = prev; capKey = ""; caption(); mark(); });
      later(() => { if (!dead) ok.focus({ preventScroll: true }); }, 30);
    });

    // ---- resting it ---------------------------------------------------------------------------------------
    function rest() {
      if (mode !== "play") return;
      if (!reg.w) { flash("The pans are empty."); return; }
      if (reg.name === "knock" || reg.name === "drift") { refuse(); return; }
      if (reg.w !== PG.load) { flash(`The load is ${PG.load} pips. ${reg.w} ${reg.w === 1 ? "is" : "are"} laid.`); return; }
      if (!settled) { flash("Let the pointer rest."); return; }
      if (PG.heart) weigh(reg.name); else commit(reg.name);
    }
    on(dom.rest, "click", rest);
    on(dom.clear, "click", () => {
      if (mode !== "play") return;
      for (const t of tokens) t.loc = "tray"; pans.red = []; pans.black = []; sel = null; msg = ""; changed();
    });
    on(dom.leave, "click", () => {
      if (mode !== "play" || PG.n !== 1) return;
      commit("leave");
    });

    // the last weighing: a second word before it is rested (the choice is shown with weight)
    function weigh(where) {
      mode = "weigh";
      const { ov, c } = card("The last weighing");
      if (where === "heart") {
        mk("div", P + "kick", c, "The second band");
        mk("h2", null, c, "Rest it here?");
        if (!artEl("two-pans-caption-heart", c, "HERE, HIS HEART WOULD HOLD.")) mk("blockquote", null, c, "HERE, HIS HEART WOULD HOLD.");
        else c.lastChild.className = P + "cardart";
      } else {
        mk("div", P + "kick", c, "The window");
        mk("h2", null, c, "Rest it here?");
        mk("p", null, c, "The pointer is still. This is the dose the city's own air will carry, and the peace that follows it. It is the last thing he weighs.");
        const q = mk("blockquote", null, c, "His heart fails. This is his sacrifice.");
        mk("cite", null, q, "Bible, Part VI, Dr. Tox, Story: The Finale (stub)");
        if (F.rcc()) mk("p", null, c, "Beside his, a second hand is on the stand. She has not said anything since the door.");
      }
      const bt = mk("div", P + "btns", c);
      const yes = mk("button", P + "btn " + P + "go", bt, "Rest it here"); yes.type = "button";
      const no = mk("button", P + "btn", bt, "Take it back"); no.type = "button";
      on(yes, "click", () => { ov.remove(); commit(where); });
      on(no, "click", () => { ov.remove(); mode = "play"; capKey = ""; caption(); mark(); });
      later(() => { if (!dead) no.focus({ preventScroll: true }); }, 30);   // the weight is in the asking: focus starts on "take it back"
    }

    // ---- flags ----------------------------------------------------------------------------------------------
    function commit(where) {
      mode = "pop";
      const rec = { n: PG.n, where, b: reg.b, r: reg.r };
      if (PG.n === 1) {
        played1 = true;
        const learned = where === "window", rebal = where === "window";
        sset("two_pans.window_learned", !!(sget("two_pans.window_learned", false) || learned));
        sset("two_pans.rite_rebalanced", rebal);
        const prev = num("two_pans.p1_doc", 0), nd = rebal ? -10 : 0;
        sset("cult.doctrine", clamp(Math.round(num("cult.doctrine", F.base()) - prev + nd), 0, 100));
        sset("two_pans.p1_doc", nd);
        rec.rebal = rebal;
      } else if (PG.n === 2) {
        sset("two_pans.rcc_ratio_found", where === "window");
        rec.found = where === "window";
      } else {
        const heart = where === "heart";
        sset("two_pans.final", heart ? "heart" : "window");
        const mine = !!sget("two_pans.held_by_pans", false);
        if (heart) { sset("hub.held_back", true); sset("two_pans.held_by_pans", true); }
        else if (mine) { sset("hub.held_back", false); sset("two_pans.held_by_pans", false); }
        rec.heart = heart;
      }
      results.push(rec);
      try { api.store.set("last", { page: PG.n, where }); } catch { /* storage off */ }
      later(() => { if (!dead) afterCommit(rec); }, RM ? 0 : 500);
    }

    function afterCommit(rec) {
      if (pi < PAGES.length - 1) {
        const { ov, c } = card("Rested");
        mk("div", P + "kick", c, `No. ${PG.n} · ${PG.place} · ${PG.year}`);
        mk("h2", null, c, rec.where === "leave" ? "Their jars, left" : "Rested");
        if (PG.n === 1) {
          if (rec.where === "leave") mk("p", null, c, "He leaves their jars as they made them. The ratio stays theirs. It will not rest, and they do not mind.");
          else {
            mk("p", null, c, `Rested in the window: ${rec.b} BLACK, ${rec.r} RED. The same jars, laid again, are quiet.`);
            mk("p", null, c, "That is a window. His body knows where it is.");
          }
        } else {
          mk("p", null, c, `Rested in the window: ${rec.b} BLACK, ${rec.r} RED. The rack of a high suite sits where the pointer sits.`);
          const q = mk("blockquote", null, c, "it always did — it was just never a cure"); mk("cite", null, q, "Bible, Part III");
        }
        const bt = mk("div", P + "btns", c);
        const nx = mk("button", P + "btn " + P + "go", bt, `Next: ${PAGES[pi + 1].place.toLowerCase()}`); nx.type = "button";
        on(nx, "click", () => { ov.remove(); beginPage(pi + 1); });
        later(() => { if (!dead) nx.focus({ preventScroll: true }); }, 30);
      } else finish();
    }

    function finish() {
      mode = "over";
      const r1 = results.find((r) => r.n === 1), r2 = results.find((r) => r.n === 2), r3 = results.find((r) => r.n === 3);
      const heart = !!(r3 && r3.heart);
      const ok1 = !r1 || r1.rebal;
      const win = !!r3 && !heart && ok1;
      const bits = [];
      if (r1) bits.push(r1.rebal ? "Their rite was rebalanced into the window." : "Their jars were left as they made them.");
      if (r2) bits.push("The suite's rack sat in the window, as it always did.");
      if (heart) bits.push("The last dose was rested where his heart would hold. He walks out. The city's air stays its own.");
      else bits.push("The last dose was rested in the window. What is left is to hold.");
      api.end({ outcome: win ? "win" : "done", text: bits.join(" ") });
    }

    // ---- keys and sizing -----------------------------------------------------------------------------------
    on(page, "keydown", (e) => {
      if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape" && sel != null) { sel = null; mark(); e.preventDefault(); }
    });
    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => { if (!dead) layout(); }); ro.observe(dom.stage); ro.observe(dom.cov); }
    else { on(window, "resize", () => { if (!dead) layout(); }); }

    page.__twopans = { get reg() { return reg; }, get mode() { return mode; }, get PG() { return PG; }, place, rest, tokens: () => tokens, results, get settled() { return settled; } };

    beginPage(0);

    return {
      unmount() {
        dead = true;
        if (raf) cancelAnimationFrame(raf); raf = 0;
        timers.forEach(clearTimeout); timers.clear();
        if (ro) ro.disconnect();
        offs.forEach((f) => f()); offs.length = 0;
        root.innerHTML = "";
      },
    };
  },
};

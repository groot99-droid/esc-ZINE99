// WrymWretch · The Slipping Glyph (1D, Illuminated initials). DESIGN.md section 11.
// A glyph left out of the focus circle for the slip delay changes its unstable parts; its stable part
// never changes. A row's four stable parts make one rune from the key. A wrong rune reshuffles which
// parts are stable in that row; three wrong runes and the surface devours (loss). Aquatica's Purify
// holds one row still for 5 s, once. Rows, answers and the rune key come from data/glyph_pages.json.
// The notebook (rule 4) is in: Sketch copies the glyph in the circle into the margin, and the sketch
// blurs away after 5 seconds. After two losses in a row: slower slips and Purify twice (api.store).
//
// Two pages:
//   I  The monolith (s_glyph_monolith: 4 rows, slip 1.5 s; the fourth row has no stable part). Read
//      the three readable rows to win. Once the second is read the slips quicken (1.5 s to 1.1 s).
//   II The kill-list (s_glyph_killlist: 5 rows, slip 1.2 s, three minutes on the camp's clock). Each
//      row read names a witness and a place, and warns them. Four rows settled wins the page.
//
// Phase 1 (accepted 2026-11-15), on page II:
//   Ysolde's request. Before the slate, the archivist's ask at the fire is put to the player: Burn her
//   Record entry (a mercy: her row is struck from the list, and Duskbane memory pays 4) or keep her
//   name (her row has to be read like the rest, and she is warned though she asked not to be).
//   Dorrin's name. The fifth row names Ilvarra and the bone bridge, and is signed. Reading it turns the
//   signature over: the name inside the Unwriter's mask, Dorrin Vael (flag unwriter_name_known).
// Art (games/wrymwretch/art): the sixteen glyph parts, laid four to a tile; the twelve runes of the key;
// the mask with the name inside it; chapter cards 4 and 9 above the how-to; the Record behind the
// result. With the art the parts slip among its four variants; without it the six drawn here.
//
// Quoted, verbatim as DESIGN.md section 3 quotes them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "a monolith carved with symbols her mind refused to hold" (WW 71)   "She surfaced screaming." (WW 73)
//   "the meaning slid away like a dream upon waking" (WW 71, as section 11 quotes it)
//   "Someone was erasing memories. Someone was killing witnesses." (WW 81)

import { png, opening, openingSet, recordPage } from "./_art.js";

const PARCH = "#efe6d1", INK = "#3b2a14", GILT = "#d4a72c", GILTHI = "#f3d27a", RED = "#a42a1c", VINE = "#4f6b2e", BONE = "#f3eee2";
const TILE_BG = ["#1f4f7b", "#5b3a7a", "#8b2a20", "#3f5f2a"];
const TYPES = ["crown", "stem", "foot", "mark"];

const RUNES = [
  [1, 1, 1, 1], [1, 1, 2, 3], [1, 1, 3, 2], [1, 2, 1, 3], [1, 2, 2, 2], [1, 2, 3, 1],
  [1, 3, 1, 2], [1, 3, 2, 1], [1, 3, 3, 3], [2, 1, 1, 3], [2, 1, 2, 2], [2, 1, 3, 1],
].map(([c, s, f, m], i) => ({ id: i + 1, parts: { crown: c, stem: s, foot: f, mark: m } }));
const PAGES = {
  monolith: { key: "monolith", label: "I · The monolith", what: "four rows, one that will not hold", chapter: "chapter-04", slip: [1.5, 2], need: 3,
    rows: [
      { answer: 4, stable: ["stem", "crown", "mark", "foot"] },
      { answer: 9, stable: ["stem", "mark", "crown", "foot"] },
      { answer: 2, stable: ["stem", "mark", "crown", "foot"] },
      { answer: null, stable: [null, null, null, null] },
    ] },
  killlist: { key: "killlist", label: "II · The kill-list", what: "five rows, three minutes", chapter: "chapter-09", slip: [1.2, 1.7], need: 4, seconds: [180, 240],
    rows: [
      { answer: 7, stable: ["stem", "mark", "foot", "crown"], who: "The Tidecaller healer", where: "the healers' tent" },
      { answer: 11, stable: ["mark", "stem", "foot", "crown"], who: "Ysolde, the archivist", where: "the sky-watch", ysolde: true },
      { answer: 1, stable: ["foot", "stem", "crown", "mark"], who: "The Circle of Seasons' elder", where: "the delegation tents" },
      { answer: 5, stable: ["foot", "mark", "crown", "stem"], who: "The Stonekeeper who listened", where: "the great crystal" },
      { answer: 12, stable: ["foot", "mark", "stem", "crown"], who: "Ilvarra", where: "the bone bridge", signed: true },
    ] },
};
const WRONG_TO_DEVOUR = 3, ROMAN = ["I", "II", "III", "IV", "V"];

// part drawings in a 100 x 100 box (the fallback hand, six variants a part)
const PART = {
  crown: ["M30,30 Q50,4 70,30", "M30,30 L50,12 L70,30", "M36,32 Q30,16 40,10 M64,32 Q70,16 60,10", "M30,26 H70 M50,18 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M28,26 Q39,12 50,26 T72,26", "M50,32 V12 M36,30 V16 M64,30 V16"],
  stem: ["M50,32 V68", "M45,32 V68 M55,32 V68", "M50,32 C34,42 66,58 50,68", "M50,32 V68 M38,50 H62", "M50,32 L41,41 L59,50 L41,59 L50,68", "M50,32 V44 M50,48 V52 M50,56 V68"],
  foot: ["M32,72 H68", "M34,70 Q50,94 66,70", "M50,68 L34,88 M50,68 L66,88", "M50,68 V82 Q50,92 38,86", "M50,72 m-8,8 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "M50,70 L38,88 H62 Z"],
  mark: ["M80,50 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0", "M74,44 L86,56 M86,44 L74,56", "M20,43 L12,56 H28 Z", "M80,42 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 M80,58 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M20,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", "M72,52 L78,58 L88,42"],
};
const glyphPaths = (p, color, w) => TYPES.map((t) => `<path d="${PART[t][p[t] - 1]}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
const pad2 = (n) => String(n).padStart(2, "0");

const CSS = `
.wrymwretch-slipping-glyph-root{position:absolute;inset:0;overflow:auto;background:#2a2019;color:${INK};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-slipping-glyph-page{margin:8px;min-height:calc(100% - 16px);box-sizing:border-box;background:${PARCH};border:16px solid ${VINE};border-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23efe6d1'/%3E%3Cpath d='M0,24 Q12,8 24,24 T48,24' fill='none' stroke='%234f6b2e' stroke-width='3'/%3E%3Cpath d='M12,15 q5,-6 10,-2 q-5,5 -10,2z M36,33 q-5,6 -10,2 q5,-5 10,-2z' fill='%234f6b2e'/%3E%3Ccircle cx='24' cy='24' r='3' fill='%23d4a72c'/%3E%3Ccircle cx='6' cy='18' r='2' fill='%23a42a1c'/%3E%3C/svg%3E") 16 round;outline:2px solid ${RED};outline-offset:-4px;padding:18px 16px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"beat beat beat" "key surface slots" "foot foot foot";gap:14px 18px;align-items:start;box-shadow:0 0 0 3px ${GILT}}
.wrymwretch-slipping-glyph-h{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.24em;color:${RED};margin:0 0 8px}
.wrymwretch-slipping-glyph-key{grid-area:key;background:${PARCH};padding:4px}
.wrymwretch-slipping-glyph-keys{display:grid;grid-template-columns:repeat(2,44px);gap:6px}
.wrymwretch-slipping-glyph-rune{width:44px;height:44px;padding:2px;background:#f8f1df;border:1.5px solid ${INK};cursor:pointer;border-radius:2px}
.wrymwretch-slipping-glyph-rune:hover,.wrymwretch-slipping-glyph-rune:focus-visible{border-color:${RED};background:#fff6dc;outline:none}
.wrymwretch-slipping-glyph-rune svg,.wrymwretch-slipping-glyph-tile svg,.wrymwretch-slipping-glyph-rune img,.wrymwretch-slipping-glyph-slot img,.wrymwretch-slipping-glyph-slot svg{width:100%;height:100%;display:block}
.wrymwretch-slipping-glyph-rune.art,.wrymwretch-slipping-glyph-slot.art{padding:0}
.wrymwretch-slipping-glyph-tile{position:relative}
.wrymwretch-slipping-glyph-tile i,.wrymwretch-slipping-glyph-book .sk i{position:absolute;inset:0;background-size:100% 100%;background-repeat:no-repeat}
.wrymwretch-slipping-glyph-book div.sk{position:relative}
.wrymwretch-slipping-glyph-surface.r5{width:min(100%,520px,calc((100vh - 300px) * .8))}
.wrymwretch-slipping-glyph-slot.struck{border:2px solid ${INK};background:repeating-linear-gradient(135deg,#f8f1df 0 6px,#d9cba8 6px 8px);cursor:default;color:${INK};font-size:20px}
.wrymwretch-slipping-glyph-clock{font:700 15px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:${RED};white-space:nowrap}
.wrymwretch-slipping-glyph-clock.low{animation:wrymwretch-slipping-glyph-low 1s steps(2) infinite}
@keyframes wrymwretch-slipping-glyph-low{50%{opacity:.45}}
.wrymwretch-slipping-glyph-list{margin:8px 0 0;padding:0;list-style:none;font-size:14.5px;line-height:1.25;max-width:150px}
.wrymwretch-slipping-glyph-list li{padding:2px 0 2px 16px;position:relative;color:#5a4426}
.wrymwretch-slipping-glyph-list li::before{content:"";position:absolute;left:2px;top:.55em;width:7px;height:7px;border:1.5px solid ${RED};transform:rotate(45deg)}
.wrymwretch-slipping-glyph-list li.w{color:${INK}}.wrymwretch-slipping-glyph-list li.w::before{background:${GILT};border-color:${INK}}
.wrymwretch-slipping-glyph-list li.x{text-decoration:line-through;color:#8a7a5c}
.wrymwretch-slipping-glyph-sign{position:absolute;inset:0;z-index:2;display:grid;place-items:center;background:rgba(11,13,26,.9);padding:10px;text-align:center;color:#E9E2D0;opacity:0;transition:opacity .6s;pointer-events:none;border-radius:2px}
.wrymwretch-slipping-glyph-sign.on{opacity:1}
.wrymwretch-slipping-glyph-sign img{width:min(250px,62%);height:auto;display:block;margin:0 auto 6px}
.wrymwretch-slipping-glyph-sign b{display:block;font:700 22px 'Cinzel',Georgia,serif;letter-spacing:.12em;color:#fbf7ec}
.wrymwretch-slipping-glyph-sign span{display:block;font-size:16px;line-height:1.3;max-width:340px;margin:4px auto 0}
.wrymwretch-slipping-glyph-card .ask{font-size:17px;line-height:1.4;margin:0 0 10px}
.wrymwretch-slipping-glyph-card .ask q{font-style:italic}
.wrymwretch-slipping-glyph-card .row{display:flex;flex-wrap:wrap;gap:8px}
.wrymwretch-slipping-glyph-card .row button small{display:block;font:italic 13px 'Cormorant Garamond',Georgia,serif;letter-spacing:0;text-transform:none}
.wrymwretch-slipping-glyph-intro{overflow:auto}
.wrymwretch-slipping-glyph-surface{grid-area:surface;position:relative;background:#4a4237;padding:10px;border-radius:2px;box-shadow:inset 0 0 30px rgba(0,0,0,.6);touch-action:none;justify-self:center;width:min(100%,560px,calc(100vh - 310px));min-width:min(100%,300px);outline:none}
.wrymwretch-slipping-glyph-surface:focus-visible{box-shadow:inset 0 0 30px rgba(0,0,0,.6),0 0 0 3px ${GILTHI}}
.wrymwretch-slipping-glyph-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.wrymwretch-slipping-glyph-tile{aspect-ratio:1;border:3px solid ${GILT};border-radius:3px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.35);transition:filter .3s,opacity .3s;opacity:.8;filter:saturate(.75) blur(.5px)}
.wrymwretch-slipping-glyph-tile.focus{opacity:1;filter:none}
.wrymwretch-slipping-glyph-tile.slip{box-shadow:inset 0 0 0 2px rgba(0,0,0,.35),0 0 0 3px rgba(164,42,28,.85)}
.wrymwretch-slipping-glyph-tile.held{animation:wrymwretch-slipping-glyph-gild 1s ease-out}
@keyframes wrymwretch-slipping-glyph-gild{0%{box-shadow:0 0 0 0 rgba(243,210,122,.9)}100%{box-shadow:0 0 0 14px rgba(243,210,122,0)}}
.wrymwretch-slipping-glyph-slotrow{display:flex;align-items:center;gap:6px}
.wrymwretch-slipping-glyph-slotrow b{font:700 14px 'Cinzel',Georgia,serif;color:${RED};width:26px;text-align:right}
.wrymwretch-slipping-glyph-slot.bad{animation:wrymwretch-slipping-glyph-shake .4s}
@keyframes wrymwretch-slipping-glyph-shake{25%{transform:translateX(-5px)}50%{transform:translateX(4px)}75%{transform:translateX(-2px)}}
.wrymwretch-slipping-glyph-book{margin-top:8px;padding:6px;border:1.5px solid ${INK};background:repeating-linear-gradient(#f8f1df 0 11px,#e8dcc0 11px 12px);min-height:62px;width:122px;box-sizing:border-box}
.wrymwretch-slipping-glyph-book .h{font:700 12px 'Cinzel',Georgia,serif;letter-spacing:.14em;color:${RED};margin-bottom:4px}
.wrymwretch-slipping-glyph-book div.sk{display:inline-block;width:52px;height:52px;margin:1px;transition:filter 5s linear,opacity 5s ease-in}
.wrymwretch-slipping-glyph-book div.sk.blur{filter:blur(5px);opacity:.15}
.wrymwretch-slipping-glyph-beat{grid-area:beat;background:#f8f1df;border:2px solid ${GILT};outline:1px solid ${RED};outline-offset:-6px;padding:10px 16px 10px 64px;position:relative;font-size:17px;line-height:1.35;min-height:44px;opacity:0;transition:opacity .5s}
.wrymwretch-slipping-glyph-beat.on{opacity:1}
.wrymwretch-slipping-glyph-beat::first-letter{float:left;font:700 40px/0.9 'Cinzel',Georgia,serif;color:${RED};margin:4px 6px 0 -50px;padding:4px 6px;background:${GILTHI};border:1.5px solid ${INK}}
.wrymwretch-slipping-glyph-beat q{font-style:italic}
.wrymwretch-slipping-glyph-beat cite{display:block;font:600 13px 'Cinzel',Georgia,serif;font-style:normal;letter-spacing:.1em;color:${VINE};margin-top:3px}
.wrymwretch-slipping-glyph-tile.read{opacity:.9;filter:none;border-color:${GILTHI}}
.wrymwretch-slipping-glyph-dark{position:absolute;inset:0;pointer-events:none;border-radius:2px}
.wrymwretch-slipping-glyph-ring{position:absolute;pointer-events:none;border:3px solid ${GILTHI};border-radius:50%;box-shadow:0 0 18px rgba(243,210,122,.7),inset 0 0 12px rgba(243,210,122,.4);transform:translate(-50%,-50%)}
.wrymwretch-slipping-glyph-slots{grid-area:slots;display:flex;flex-direction:column;gap:8px;padding:4px}
.wrymwretch-slipping-glyph-slot{width:56px;height:56px;padding:3px;background:#f8f1df;border:2px dashed ${RED};cursor:pointer;font:700 22px 'Cinzel',Georgia,serif;color:${RED}}
.wrymwretch-slipping-glyph-slot.sel{border-style:solid;background:#fff0c4;box-shadow:0 0 0 3px ${GILTHI}}
.wrymwretch-slipping-glyph-slot.done{border:2px solid ${INK};cursor:default}
.wrymwretch-slipping-glyph-slot.void{opacity:.55;cursor:default;font-size:20px}
.wrymwretch-slipping-glyph-foot{grid-area:foot;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;font-size:16px}
.wrymwretch-slipping-glyph-foot i{flex:1 1 260px}
.wrymwretch-slipping-glyph-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.12em;background:${INK};color:${PARCH};border:0;padding:9px 14px;cursor:pointer;min-height:40px}
.wrymwretch-slipping-glyph-btn:hover:not(:disabled){background:${RED}}
.wrymwretch-slipping-glyph-btn:disabled{opacity:.35}
.wrymwretch-slipping-glyph-dev{font-size:16px}
.wrymwretch-slipping-glyph-dev b{color:${RED};font-size:18px;margin-left:2px}
.wrymwretch-slipping-glyph-dev b.off{color:rgba(164,42,28,.2)}
.wrymwretch-slipping-glyph-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(42,32,25,.7);padding:16px;z-index:3}
.wrymwretch-slipping-glyph-card{max-width:440px;width:100%;box-sizing:border-box;background:${PARCH};padding:22px 24px;border:10px double ${VINE};outline:3px solid ${GILT};font-size:16px;line-height:1.4;position:relative}
.wrymwretch-slipping-glyph-card .cap{float:left;width:66px;height:66px;margin:0 12px 4px 0;background:radial-gradient(circle at 40% 35%,#2a5d8f,#122a44);border:3px solid ${GILT};display:grid;place-items:center;font:700 44px 'Cinzel',Georgia,serif;color:${GILTHI};text-shadow:0 2px 0 ${INK}}
.wrymwretch-slipping-glyph-card h2{font:700 22px 'Cinzel',Georgia,serif;margin:4px 0 2px;color:${RED}}
.wrymwretch-slipping-glyph-card .goal{font-style:italic;font-size:17px;margin:0 0 12px}
.wrymwretch-slipping-glyph-card dl{clear:both;display:grid;grid-template-columns:auto 1fr;gap:7px 12px;margin:0 0 12px;padding:10px 0;border-top:1.5px solid ${GILT};border-bottom:1.5px solid ${GILT}}
.wrymwretch-slipping-glyph-card dt{font:700 13px 'Cinzel',Georgia,serif;color:${RED};white-space:nowrap;padding-top:2px}
.wrymwretch-slipping-glyph-card dd{margin:0}
.wrymwretch-slipping-glyph-card .more{font-size:15px;margin:0 0 12px;color:#5a4426}
@media (max-width:640px){.wrymwretch-slipping-glyph-page{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"beat beat" "surface slots" "key key" "foot foot";padding:16px 12px}.wrymwretch-slipping-glyph-book{width:auto}.wrymwretch-slipping-glyph-book div.sk{width:40px;height:40px}.wrymwretch-slipping-glyph-slotrow b{display:none}.wrymwretch-slipping-glyph-list{display:none}.wrymwretch-slipping-glyph-keys{grid-template-columns:repeat(6,44px)}.wrymwretch-slipping-glyph-slot{width:46px;height:46px}}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const art = api.art;
    // the art's own letterforms, if every part and rune is there
    let useArt = !!(art && art.has) && TYPES.every((t) => [1, 2, 3, 4].every((v) => art.has(`glyph-${t}-${pad2(v)}`))) && RUNES.every((r) => art.has("rune-" + pad2(r.id)));
    const VARIANTS = useArt ? 4 : 6;
    const partUrl = {}, runeUrl = {};
    let dead = false;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-slipping-glyph-root";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="wrymwretch-slipping-glyph-page">
        <div class="wrymwretch-slipping-glyph-key"><div class="wrymwretch-slipping-glyph-h">KEY</div><div class="wrymwretch-slipping-glyph-keys"></div></div>
        <div class="wrymwretch-slipping-glyph-surface" tabindex="0" aria-label="The carved surface. Arrow keys move the focus circle.">
          <div class="wrymwretch-slipping-glyph-grid"></div><div class="wrymwretch-slipping-glyph-dark"></div><div class="wrymwretch-slipping-glyph-ring"></div>
          <div class="wrymwretch-slipping-glyph-sign" aria-live="polite"></div></div>
        <div class="wrymwretch-slipping-glyph-slots"><div class="wrymwretch-slipping-glyph-h">ROWS</div></div>
        <div class="wrymwretch-slipping-glyph-beat" aria-live="polite"></div>
        <div class="wrymwretch-slipping-glyph-foot"><i aria-live="polite">Watch what stays.</i>
          <span class="wrymwretch-slipping-glyph-clock" hidden></span>
          <span class="wrymwretch-slipping-glyph-dev"></span>
          <button type="button" class="wrymwretch-slipping-glyph-btn" data-sketch>Sketch</button>
          <button type="button" class="wrymwretch-slipping-glyph-btn" data-purify>Purify a row</button></div>
      </div>
      <div class="wrymwretch-slipping-glyph-intro"><div class="wrymwretch-slipping-glyph-card">
        <div class="cap" aria-hidden="true">T</div>
        <h2>The Slipping Glyph</h2>
        <p class="goal">Read a carved surface by what stays.</p>
        <dl>
          <dt>Look</dt><dd>move the gilt circle (pointer or arrows). A glyph outside it slips, all but one part</dd>
          <dt>Read</dt><dd>a row's four still parts make one rune: tap its slot, then the rune in the key</dd>
          <dt>Beware</dt><dd>three wrong runes and the surface devours the page</dd>
        </dl>
        <p class="more">${gentle ? "The glyphs slip slower this time, and Aquatica can purify twice. " : ""}A notebook and Aquatica's help are in the margin. Choose a page:</p>
        <div class="row">${Object.values(PAGES).map((p) => `<button type="button" class="wrymwretch-slipping-glyph-btn" data-start data-page="${p.key}">${p.label}<small>${p.what}</small></button>`).join("")}</div></div></div>`;
    root.appendChild(wrap);
    const grid = wrap.querySelector(".wrymwretch-slipping-glyph-grid"), surface = wrap.querySelector(".wrymwretch-slipping-glyph-surface");
    const dark = wrap.querySelector(".wrymwretch-slipping-glyph-dark"), ring = wrap.querySelector(".wrymwretch-slipping-glyph-ring");
    const slotsEl = wrap.querySelector(".wrymwretch-slipping-glyph-slots"), keysEl = wrap.querySelector(".wrymwretch-slipping-glyph-keys");
    const note = wrap.querySelector(".wrymwretch-slipping-glyph-foot i"), devEl = wrap.querySelector(".wrymwretch-slipping-glyph-dev");
    const purifyBtn = wrap.querySelector("[data-purify]"), sketchBtn = wrap.querySelector("[data-sketch]");
    const beatEl = wrap.querySelector(".wrymwretch-slipping-glyph-beat"), clockEl = wrap.querySelector(".wrymwretch-slipping-glyph-clock"), signEl = wrap.querySelector(".wrymwretch-slipping-glyph-sign");
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    let P = PAGES.monolith, ROWS = P.rows, NR = ROWS.length, SLIP = 1.5;
    const st = { running: false, over: false, focus: 5, sel: null, wrong: 0, read: [], purify: gentle ? 2 : 1, sketches: 0, still: -1, stillT: 0, fx: 0.375, fy: 0.375, mercy: null, clock: 0, hold: 0, signed: false };
    const reroll = (cur) => { let v; do v = 1 + Math.floor(R() * VARIANTS); while (v === cur); return v; };
    const glyphs = [];
    let slots = [], book = null, listEl = null;

    // ---- drawing a glyph: four art parts laid over the tile, or the drawn hand -------------------
    // Each part's picture is one CSS rule, written once; a slip only changes four class names.
    const layers = (parts) => TYPES.map((t) => `<i class="wwsg-${t}-${parts[t]}"></i>`).join("");
    const artReady = () => useArt && TYPES.every((t) => [1, 2, 3, 4].every((v) => partUrl[`${t}-${v}`]));
    let partCss = null;
    const writeRules = () => { if (partCss) return; partCss = document.createElement("style"); partCss.textContent = Object.entries(partUrl).map(([k, u]) => `.wrymwretch-slipping-glyph-root .wwsg-${k}{background-image:url("${u}")}`).join(""); wrap.appendChild(partCss); };
    const paint = (gl) => {
      const bg = `radial-gradient(circle at 50% 40%, ${TILE_BG[(gl.ri + gl.ci) % 4]}, #120e0a 130%)`;
      if (gl.el._bg !== bg) { gl.el._bg = bg; gl.el.style.backgroundImage = bg; }
      if (artReady()) {
        writeRules();
        if (gl.el.children.length !== 4 || gl.el.firstChild.tagName !== "I") gl.el.innerHTML = layers(gl.parts);
        else TYPES.forEach((t, k) => { const c = `wwsg-${t}-${gl.parts[t]}`; if (gl.el.children[k].className !== c) gl.el.children[k].className = c; });
      }
      else if (useArt) { /* the parts are still being drawn */ }
      else { gl.el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" fill="none" stroke="${GILT}" stroke-width="1.2" stroke-dasharray="2 3"/>${glyphPaths(gl.parts, BONE, 6.5)}${glyphPaths(gl.parts, "rgba(0,0,0,.25)", 1)}</svg>`; }
    };
    const runeHtml = (id) => (useArt && runeUrl[id] ? `<img alt="rune ${ROMAN[id - 1] || id}" draggable="false" src="${runeUrl[id]}">` : `<svg viewBox="0 0 100 100">${glyphPaths(RUNES[id - 1].parts, INK, 7)}</svg>`);
    const keyBtns = RUNES.map((ru) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wrymwretch-slipping-glyph-rune"; b.setAttribute("aria-label", "rune " + ru.id); b.dataset.rune = ru.id;
      b.innerHTML = runeHtml(ru.id);
      b.addEventListener("click", () => choose(ru.id));
      keysEl.appendChild(b);
      return b;
    });
    if (useArt) {
      const fail = () => { if (dead || !useArt) return; useArt = false; glyphs.forEach(paint); keyBtns.forEach((b) => { b.classList.remove("art"); b.innerHTML = runeHtml(+b.dataset.rune); }); };
      TYPES.forEach((t) => [1, 2, 3, 4].forEach((v) => png(art, `glyph-${t}-${pad2(v)}`, { w: 150, strip: [".plate"] }).then((u) => { if (dead) return; if (!u) return fail(); partUrl[`${t}-${v}`] = u; if (artReady()) glyphs.forEach(paint); })));
      RUNES.forEach((ru) => png(art, "rune-" + pad2(ru.id), { w: 96 }).then((u) => { if (dead || !u || !useArt) return; runeUrl[ru.id] = u; const b = keyBtns[ru.id - 1]; b.classList.add("art"); b.innerHTML = runeHtml(ru.id); slots.forEach((s, ri) => { if (st.read[ri] && ROWS[ri].answer === ru.id) { s.classList.add("art"); s.innerHTML = runeHtml(ru.id); } }); }));
    }

    function build(pageKey) {
      P = PAGES[pageKey] || PAGES.monolith; ROWS = P.rows; NR = ROWS.length; SLIP = P.slip[gentle ? 1 : 0];
      st.read = ROWS.map(() => false); st.fy = 1.5 / NR;
      surface.classList.toggle("r5", NR === 5);
      surface.setAttribute("aria-label", (P.key === "killlist" ? "The dropped slate." : "The monolith.") + " Arrow keys move the focus circle.");
      ROWS.forEach((row, ri) => {
        for (let ci = 0; ci < 4; ci++) {
          const stable = row.stable[ci];
          const parts = {};
          TYPES.forEach((t) => (parts[t] = 1 + Math.floor(R() * VARIANTS)));
          if (stable) parts[stable] = RUNES[row.answer - 1].parts[stable];
          const el = document.createElement("div");
          el.className = "wrymwretch-slipping-glyph-tile";
          grid.appendChild(el);
          const gl = { ri, ci, stable, parts, away: 0, el };
          glyphs.push(gl); paint(gl);
        }
      });
      slots = ROWS.map((row, ri) => {
        const b = document.createElement("button");
        const line = document.createElement("div"); line.className = "wrymwretch-slipping-glyph-slotrow";
        line.innerHTML = `<b>${ROMAN[ri]}</b>`; line.appendChild(b);
        const struck = row.ysolde && st.mercy === true;
        b.type = "button"; b.className = "wrymwretch-slipping-glyph-slot" + (struck ? " struck" : row.answer ? "" : " void");
        b.textContent = struck ? "—" : row.answer ? "?" : "✕";
        if (!row.answer) b.title = "This row will not hold";
        if (struck) { b.title = "Burned at the fire: no one hunts a name nobody keeps"; st.read[ri] = true; glyphs.filter((g) => g.ri === ri).forEach((g) => { g.el.style.opacity = ".25"; g.el.style.filter = "grayscale(1) blur(1.5px)"; }); }
        b.setAttribute("aria-label", struck ? `row ${ri + 1}: struck from the list` : row.answer ? `row ${ri + 1} slot` : `row ${ri + 1}: unreadable`);
        b.addEventListener("click", () => {
          if (struck) { note.textContent = "Her row is struck. Nobody is coming for a name nobody keeps."; return; }
          if (!row.answer || st.read[ri] || st.over) { if (!row.answer) note.textContent = "Nothing in this row stays. It cannot be held."; return; }
          st.sel = ri; slots.forEach((s, i) => s.classList.toggle("sel", i === ri));
          note.textContent = `Row ${ROMAN[ri]}: now choose its rune from the key.`;
        });
        slotsEl.appendChild(line);
        return b;
      });
      if (P.key === "killlist") {
        listEl = document.createElement("ul"); listEl.className = "wrymwretch-slipping-glyph-list"; listEl.setAttribute("aria-label", "Witnesses");
        slotsEl.appendChild(listEl); drawList();
        st.clock = P.seconds[gentle ? 1 : 0]; clockEl.hidden = false; drawClock();
      }
      book = document.createElement("div"); book.className = "wrymwretch-slipping-glyph-book";
      book.innerHTML = `<div class="h">NOTEBOOK</div>`;
      slotsEl.appendChild(book);
      drawDev();
    }
    function drawList() {
      if (!listEl) return;
      listEl.innerHTML = ROWS.map((row, ri) => (row.ysolde && st.mercy ? `<li class="x">${ROMAN[ri]} · struck</li>` : st.read[ri] ? `<li class="w">${ROMAN[ri]} · ${row.who}, ${row.where}: warned</li>` : `<li>${ROMAN[ri]} · unread</li>`)).join("");
    }
    function drawClock() {
      const s = Math.max(0, Math.ceil(st.clock));
      clockEl.textContent = `Smoke · ${Math.floor(s / 60)}:${pad2(s % 60)}`;
      clockEl.classList.toggle("low", s <= 30 && !api.reducedMotion);
    }
    let beatTimer = null;
    function beat(html, ms = 7000) {
      beatEl.innerHTML = html; beatEl.classList.add("on");
      if (beatTimer) { clearTimeout(beatTimer); timers.delete(beatTimer); }
      beatTimer = setTimeout(() => { timers.delete(beatTimer); beatEl.classList.remove("on"); }, ms); timers.add(beatTimer);
    }
    function sketch() {
      if (!st.running || st.over) return;
      if (st.focus < 0) { note.textContent = "Hold a glyph in the circle first; then sketch it."; return; }
      const gl = glyphs[st.focus];
      const d = document.createElement("div"); d.className = "sk";
      if (artReady()) { d.style.background = "#4a3a22"; d.innerHTML = layers(gl.parts); d.setAttribute("aria-label", `sketch of a glyph in row ${ROMAN[gl.ri]}`); }
      else d.innerHTML = `<svg viewBox="0 0 100 100" aria-label="sketch of a glyph in row ${ROMAN[gl.ri]}">${glyphPaths(gl.parts, INK, 6)}</svg>`;
      book.appendChild(d); st.sketches++;
      while (book.querySelectorAll(".sk").length > 2) book.querySelector(".sk").remove();
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("blur")));
      later(() => d.remove(), 5200);
      note.textContent = `Sketched (row ${ROMAN[gl.ri]}). The page will not keep it long.`;
    }
    let maskUrl = "";
    png(art, "ui-mask", { w: 44, strip: [".plate"] }).then((u) => { if (u && !dead) { maskUrl = u; drawDev(); } });
    function drawDev() {   // on the slate, each wrong rune is a mask nearer
      const mask = P.key === "killlist" && maskUrl;
      devEl.innerHTML = (mask ? "Remnants " : "Devour ") + Array.from({ length: WRONG_TO_DEVOUR }, (_, i) => (mask ? `<img alt="${i < st.wrong ? "a mask, near" : ""}" src="${maskUrl}" style="width:22px;height:22px;vertical-align:middle;margin-left:3px;opacity:${i < st.wrong ? 1 : 0.22}">` : `<b class="${i < st.wrong ? "" : "off"}">●</b>`)).join("");
    }
    const settled = () => st.read.filter(Boolean).length;

    // ---- endings --------------------------------------------------------------------------------
    function finish(win, text) {
      if (st.over && finish.done) return;
      finish.done = true; st.over = true;
      api.store.set("losses", win ? 0 : losses + 1);
      const kinder = !win && losses + 1 >= 2 ? " The glyphs will slip slower next time." : "";
      later(() => {
        if (dead) return;
        if (P.key === "monolith") {
          const n = settled();
          recordPage(wrap, api, { realm: "east", title: "The Slipping Glyph I: the monolith", sub: "Tidecaller page · chapter 4, The Monolith", divider: 3, lines: [
            win ? `Rows read: ${n} of 3. They will already be filled in on the seal.` : { t: `Rows read: ${n} of 3. The surface devoured the page.`, kind: "lost" },
            win ? "What Izladar was: one fragment more." : { t: "Tidecaller memory −3.", kind: "lost" },
            { t: "The fourth row: nothing on the stone holds it still.", kind: "lost", note: "Its still parts are not on this page." }] });
        } else {
          const warned = ROWS.filter((r, i) => st.read[i] && !(r.ysolde && st.mercy)).map((r) => r.who);
          const unread = ROWS.filter((r, i) => !st.read[i]).map((r) => r.who);
          recordPage(wrap, api, { realm: "wrymreach", title: "The Slipping Glyph II: the kill-list", sub: "The Rim Moot at dawn · chapter 9, The Last Witness", divider: 3, pic: st.signed ? "thread-own" : null, lines: [
            warned.length ? `Warned: ${warned.join("; ")}.` : null,
            unread.length ? { t: `Unread, and still in the camp: ${unread.join("; ")}.`, kind: "lost" } : null,
            st.mercy ? { t: "Ysolde: let off. Her entry was Burned at the fire, at her asking, and her row is struck.", kind: "link", note: "Duskbane memory −4. Burn, used as a mercy." }
              : st.read[1] ? { t: "Ysolde: warned, and kept in the Record, though she asked not to be.", note: "She still carries what the dying sage told her." } : { t: "Ysolde: kept in the Record, unwarned.", kind: "lost" },
            st.signed ? { t: "The slate is signed with a given-up name: Dorrin Vael.", kind: "link", note: "The Unwriter can now be reminded of it." } : { t: "The fifth row and its signature: unread.", kind: "lost" }] });
        }
        api.end({ outcome: win ? "win" : "lose", text: text + kinder });
      }, (win ? 900 : 1300) + (st.hold > 0 ? 5200 : 0));
    }
    function closeList(reason) {
      const n = settled(), win = n >= P.need;
      const warned = ROWS.filter((r, i) => st.read[i] && !(r.ysolde && st.mercy)).length;
      const tail = st.signed ? " The slate was signed, and the name was Dorrin Vael." : " The fifth row went unread, and with it the name of the hand that signed.";
      finish(win, win
        ? `${reason === "all" ? "Every row on the slate is settled before the smoke reaches the tents." : "The Remnants come back for their slate, but it has been read."} ${warned} witness${warned === 1 ? "" : "es"} warned${st.mercy ? "; Ysolde's row was already struck, at her own asking" : ""}.${tail}`
        : `${reason === "wrong" ? "Three wrong runes, and the slate smears itself blank." : "The smoke reaches the tents and a masked hand takes the slate back."} Only ${warned} witness${warned === 1 ? "" : "es"} warned. “Someone was erasing memories. Someone was killing witnesses.” (WW 81)`);
    }

    function showSignature() {
      st.signed = true; st.hold = 6;
      const cap = `<b>Dorrin Vael</b><span>Where a scribe signs his work, the list is signed with a name its writer gave up. It is cut on the inside of a mask, where only the wearer could read it.</span>`;
      signEl.innerHTML = cap; signEl.classList.add("on");
      png(art, "thread-own", { w: 250 }).then((u) => { if (u && !dead) signEl.innerHTML = `<div><img alt="A bone mask seen from inside, with a name cut where only its wearer could read it" src="${u}">${cap}</div>`; });
      later(() => signEl.classList.remove("on"), 6000);
    }
    function choose(id) {
      if (st.over || !st.running) return;
      if (st.sel == null) { note.textContent = "Pick a row's slot first, on the right."; return; }
      const ri = st.sel, row = ROWS[ri];
      if (id === row.answer) {
        st.read[ri] = true;
        const s = slots[ri]; s.classList.remove("sel"); s.classList.add("done"); if (useArt && runeUrl[id]) s.classList.add("art");
        s.innerHTML = runeHtml(id);
        glyphs.filter((g) => g.ri === ri).forEach((g) => { TYPES.forEach((t) => (g.parts[t] = RUNES[id - 1].parts[t])); g.el.classList.add("read"); paint(g); });
        glyphs.filter((g) => g.ri === ri).forEach((g) => { g.el.classList.remove("held"); void g.el.offsetWidth; if (!api.reducedMotion) g.el.classList.add("held"); });
        st.sel = null;
        const n = settled();
        if (P.key === "killlist") {
          note.textContent = `Row ${ROMAN[ri]}: ${row.who}, at ${row.where}. Warned.`;
          drawList();
          if (row.signed) { showSignature(); beat(`The fifth row is Ilvarra, and the bone bridge. Under it the slate is signed, and the signature is a name: <b>Dorrin Vael</b>. <cite>The Unwriter had a name · it can be said back to him</cite>`, 9000); }
          else if (row.ysolde) beat(`The second row is Ysolde, at the sky-watch. A runner goes. She will be warned, and she will know who kept her name on the page. <cite>Warned · she asked not to be</cite>`, 8000);
          else if (n === 1 + (st.mercy ? 1 : 0)) beat(`The row holds: a name and a place. A runner goes from the fire to ${row.where}. <cite>${row.who}: warned</cite>`, 6500);
          if (st.read.every(Boolean)) closeList("all");
          return;
        }
        note.textContent = `Row ${ROMAN[ri]} read.`;
        if (n === 1) beat(`The first row holds in gold. Lunessa's chest is tight: the water clings to her skin like oil, and the fish have gone. <cite>Two rows to go</cite>`, 7000);
        if (n === 2) { SLIP = Math.min(SLIP, gentle ? 1.5 : 1.1); beat(`Something in the stone stirs at being read. The glyphs slip faster now. <cite>Slips quicken · one row left</cite>`, 7000); }
        if (n === 3) {
          st.over = true;
          note.textContent = "Three rows held. The fourth has nothing that stays.";
          finish(true, `Three rows read from the monolith${st.wrong ? `, ${st.wrong} wrong` : ""}${st.sketches ? `, ${st.sketches} sketch${st.sketches > 1 ? "es" : ""} lost to the water` : ""}. The fourth row has nothing that stays, and as Lunessa reaches for it the surface devours. “She surfaced screaming.” (WW 73)`);
        }
        return;
      }
      st.wrong++; drawDev();
      slots[ri].classList.remove("bad"); void slots[ri].offsetWidth; if (!api.reducedMotion) slots[ri].classList.add("bad");
      if (st.wrong >= WRONG_TO_DEVOUR) {
        st.over = true;
        note.textContent = "The surface devours.";
        grid.style.transition = "filter 1.2s, opacity 1.2s"; grid.style.filter = "blur(6px)"; grid.style.opacity = ".2";
        if (P.key === "killlist") return closeList("wrong");
        const n = settled();
        return finish(false, `Three wrong runes${n ? `, ${n} row${n > 1 ? "s" : ""} read` : ""}. The monolith devours what was read, and “the meaning slid away like a dream upon waking” (WW 71). Lunessa kicks for the light with nothing she can keep. Tidecaller memory −3.`);
      }
      // the row reshuffles which part is stable
      const perm = TYPES.slice().sort(() => R() - 0.5);
      glyphs.filter((g) => g.ri === ri).forEach((g, i) => { g.stable = perm[i]; g.parts[g.stable] = RUNES[row.answer - 1].parts[g.stable]; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); });
      note.textContent = `Not that rune. Row ${ROMAN[ri]} shifts: a different part of each glyph holds now.`;
    }

    // ---- focus ------------------------------------------------------------------------------
    function placeRing() {
      if (!glyphs.length) return;
      const gb = grid.getBoundingClientRect(), sb = surface.getBoundingClientRect();
      const tile = glyphs[0].el.getBoundingClientRect().width || 60;
      const x = gb.left - sb.left + st.fx * gb.width, y = gb.top - sb.top + st.fy * gb.height;
      const d = tile * 1.15;
      ring.style.left = x + "px"; ring.style.top = y + "px"; ring.style.width = ring.style.height = d + "px";
      dark.style.background = `radial-gradient(circle ${d / 2 + 6}px at ${x}px ${y}px, transparent 0, transparent ${d / 2}px, rgba(10,8,6,.42) ${d / 2 + 14}px)`;
      // which glyph is held
      let best = -1, bd = Infinity;
      glyphs.forEach((g, i) => { const r = g.el.getBoundingClientRect(); const cx = r.left + r.width / 2 - gb.left, cy = r.top + r.height / 2 - gb.top; const dd = Math.hypot(cx - st.fx * gb.width, cy - st.fy * gb.height); if (dd < bd) { bd = dd; best = i; } });
      st.focus = bd < tile * 0.6 ? best : -1;
      glyphs.forEach((g, i) => g.el.classList.toggle("focus", i === st.focus));
    }
    const setFromPointer = (e) => { const gb = grid.getBoundingClientRect(); if (!gb.width) return; st.fx = Math.max(0, Math.min(1, (e.clientX - gb.left) / gb.width)); st.fy = Math.max(0, Math.min(1, (e.clientY - gb.top) / gb.height)); placeRing(); };
    surface.addEventListener("pointermove", setFromPointer);
    surface.addEventListener("pointerdown", (e) => { setFromPointer(e); surface.setPointerCapture && surface.setPointerCapture(e.pointerId); });
    surface.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (e.key === " " || e.key === "Enter" || e.key.toLowerCase() === "k") { e.preventDefault(); sketch(); return; }
      if (!d || !glyphs.length) return; e.preventDefault();
      const i = st.focus >= 0 ? st.focus : 5;
      const ci = Math.max(0, Math.min(3, glyphs[i].ci + d[0])), ri = Math.max(0, Math.min(NR - 1, glyphs[i].ri + d[1]));
      st.fx = (ci + 0.5) / 4; st.fy = (ri + 0.5) / NR; placeRing();
    });
    purifyBtn.addEventListener("click", () => {
      if (st.purify < 1 || st.over || !st.running) return;
      const ri = st.sel != null ? st.sel : st.focus >= 0 ? glyphs[st.focus].ri : 0;
      st.purify--; purifyBtn.disabled = st.purify < 1; purifyBtn.textContent = st.purify ? `Purify a row (${st.purify})` : "Purify used"; st.still = ri; st.stillT = 5;
      note.textContent = `Aquatica's Purify: the water clears, and row ${ROMAN[ri]} holds still for five seconds.`;
    });
    sketchBtn.addEventListener("click", sketch);

    // ---- the slip, and the camp's clock ---------------------------------------------------------
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (st.running && !st.over) {
        if (st.hold > 0) st.hold = Math.max(0, st.hold - dt);
        else {
          st.stillT = Math.max(0, st.stillT - dt); if (st.stillT === 0) st.still = -1;
          glyphs.forEach((g, i) => {
            if (st.read[g.ri] || i === st.focus || g.ri === st.still) { g.away = 0; return; }
            g.away += dt;
            if (g.away > SLIP) { g.away = 0; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); g.el.classList.add("slip"); g.slipT = 0.25; }
            if (g.slipT > 0 && (g.slipT -= dt) <= 0) g.el.classList.remove("slip");
          });
          if (P.key === "killlist") {
            const before = Math.ceil(st.clock); st.clock -= dt;
            if (Math.ceil(st.clock) !== before) drawClock();
            if (st.clock <= 60 && !st.said60) { st.said60 = true; beat(`Smoke is rising behind the tents, and the banners are un-inking, names first. <cite>One minute before they come back for the slate</cite>`, 6000); }
            if (st.clock <= 0) closeList("time");
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(placeRing) : null;
    ro && ro.observe(surface);

    // ---- the opening: a page, and on page II the archivist's ask --------------------------------
    const intro = wrap.querySelector(".wrymwretch-slipping-glyph-intro"), card = intro.querySelector(".wrymwretch-slipping-glyph-card");
    opening(art, intro, PAGES.monolith.chapter);
    function start(pageKey) {
      intro.remove(); build(pageKey); st.running = true; surface.focus(); placeRing();
      if (P.key === "monolith") beat(`Lunessa Tidecaller dives through a sea that clings like oil, down to <q>a monolith carved with symbols her mind refused to hold</q>. <cite>WW 71 · watch what stays</cite>`, 8000);
      else beat(st.mercy
        ? `Dawn at the Rim Moot. A Remnant dropped this slate: their list. Ysolde's row is already blank; the entry Kael burned at the fire took her off it. <cite>Each row read warns a witness · three minutes</cite>`
        : `Dawn at the Rim Moot. A Remnant dropped this slate: their list of who remembers, and where each will be. Ysolde is on it still. <cite>Each row read warns a witness · three minutes</cite>`, 9000);
    }
    function askYsolde() {
      openingSet(art, intro, PAGES.killlist.chapter);
      card.innerHTML = `<div class="cap" aria-hidden="true">Y</div><h2>The night before</h2>
        <p class="goal">At Ilvarra's fire, the archivist from the tunnels asked for one thing.</p>
        <p class="ask">Ysolde wrote down what the dying sage told her, and has carried it since. The Remnants hunt whoever is kept in a Record. <q>I am not asking to be saved,</q> Ysolde said. <q>I am asking to be let off.</q></p>
        <p class="more">Burn spends a Record entry for good: her realm, the Underworld, forgets a little (Duskbane memory −4), and no list can name her. Keep her, and her row is on the slate with the others.</p>
        <div class="row"><button type="button" class="wrymwretch-slipping-glyph-btn" data-start data-mercy="1">Burn her entry<small>a mercy; her row is struck</small></button>
        <button type="button" class="wrymwretch-slipping-glyph-btn" data-mercy="0">Keep her name<small>her row must be read</small></button></div>`;
      card.querySelectorAll("[data-mercy]").forEach((b) => b.addEventListener("click", () => { st.mercy = b.dataset.mercy === "1"; start("killlist"); }));
      card.querySelector("[data-mercy]").focus();
    }
    intro.querySelectorAll("[data-page]").forEach((b) => {
      const show = () => openingSet(art, intro, PAGES[b.dataset.page].chapter);
      b.addEventListener("pointerenter", show); b.addEventListener("focus", show);
      b.addEventListener("click", () => (b.dataset.page === "killlist" ? askYsolde() : start("monolith")));
    });
    intro.querySelector("[data-page]").focus();
    raf = requestAnimationFrame(frame);

    return { unmount() { st.over = true; dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro && ro.disconnect(); wrap.remove(); } };
  },
};

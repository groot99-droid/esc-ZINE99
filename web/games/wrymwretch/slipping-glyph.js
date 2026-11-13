// WrymWretch · The Slipping Glyph (1D, Illuminated initials). DESIGN.md section 11.
// One page: s_glyph_monolith (4 rows of 4 glyphs, slip delay 1.5 s; the fourth row has no stable
// part and cannot be read). A glyph left out of the focus circle for 1.5 s changes its unstable
// parts; its stable part never changes. A row's four stable parts make one rune from the key.
// A wrong rune reshuffles which parts are stable in that row; three wrong runes and the monolith
// devours (loss). Read the three readable rows to win. Aquatica's Purify holds one row still for
// 5 s, once. Rows, answers and the rune key come from data/glyph_pages.json.
// The notebook (rule 4) is in: Sketch copies the glyph in the circle into the margin, and the sketch
// blurs away after 5 seconds. Once the second row is read the monolith stirs and slips come faster
// (1.5 s to 1.1 s). After two losses in a row: slips at 2 s and Purify twice (api.store).
//
// Quoted, verbatim as DESIGN.md section 3 quotes them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "a monolith carved with symbols her mind refused to hold" (WW 71)   "She surfaced screaming." (WW 73)
//   "the meaning slid away like a dream upon waking" (WW 71, as section 11 quotes it)

const PARCH = "#efe6d1", INK = "#3b2a14", GILT = "#d4a72c", GILTHI = "#f3d27a", RED = "#a42a1c", VINE = "#4f6b2e", BONE = "#f3eee2";
const TILE_BG = ["#1f4f7b", "#5b3a7a", "#8b2a20", "#3f5f2a"];
const TYPES = ["crown", "stem", "foot", "mark"];
const VARIANTS = 6;

const RUNES = [
  [1, 1, 1, 1], [1, 1, 2, 3], [1, 1, 3, 2], [1, 2, 1, 3], [1, 2, 2, 2], [1, 2, 3, 1],
  [1, 3, 1, 2], [1, 3, 2, 1], [1, 3, 3, 3], [2, 1, 1, 3], [2, 1, 2, 2], [2, 1, 3, 1],
].map(([c, s, f, m], i) => ({ id: i + 1, parts: { crown: c, stem: s, foot: f, mark: m } }));
const ROWS = [
  { answer: 4, stable: ["stem", "crown", "mark", "foot"] },
  { answer: 9, stable: ["stem", "mark", "crown", "foot"] },
  { answer: 2, stable: ["stem", "mark", "crown", "foot"] },
  { answer: null, stable: [null, null, null, null] },
];
const WRONG_TO_DEVOUR = 3, ROMAN = ["I", "II", "III", "IV"];

// part drawings in a 100 x 100 box
const PART = {
  crown: ["M30,30 Q50,4 70,30", "M30,30 L50,12 L70,30", "M36,32 Q30,16 40,10 M64,32 Q70,16 60,10", "M30,26 H70 M50,18 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M28,26 Q39,12 50,26 T72,26", "M50,32 V12 M36,30 V16 M64,30 V16"],
  stem: ["M50,32 V68", "M45,32 V68 M55,32 V68", "M50,32 C34,42 66,58 50,68", "M50,32 V68 M38,50 H62", "M50,32 L41,41 L59,50 L41,59 L50,68", "M50,32 V44 M50,48 V52 M50,56 V68"],
  foot: ["M32,72 H68", "M34,70 Q50,94 66,70", "M50,68 L34,88 M50,68 L66,88", "M50,68 V82 Q50,92 38,86", "M50,72 m-8,8 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", "M50,70 L38,88 H62 Z"],
  mark: ["M80,50 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0", "M74,44 L86,56 M86,44 L74,56", "M20,43 L12,56 H28 Z", "M80,42 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 M80,58 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", "M20,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", "M72,52 L78,58 L88,42"],
};
const glyphPaths = (p, color, w) => TYPES.map((t) => `<path d="${PART[t][p[t] - 1]}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");

const CSS = `
.wrymwretch-slipping-glyph-root{position:absolute;inset:0;overflow:auto;background:#2a2019;color:${INK};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-slipping-glyph-page{margin:8px;min-height:calc(100% - 16px);box-sizing:border-box;background:${PARCH};border:16px solid ${VINE};border-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23efe6d1'/%3E%3Cpath d='M0,24 Q12,8 24,24 T48,24' fill='none' stroke='%234f6b2e' stroke-width='3'/%3E%3Cpath d='M12,15 q5,-6 10,-2 q-5,5 -10,2z M36,33 q-5,6 -10,2 q5,-5 10,-2z' fill='%234f6b2e'/%3E%3Ccircle cx='24' cy='24' r='3' fill='%23d4a72c'/%3E%3Ccircle cx='6' cy='18' r='2' fill='%23a42a1c'/%3E%3C/svg%3E") 16 round;outline:2px solid ${RED};outline-offset:-4px;padding:18px 16px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"beat beat beat" "key surface slots" "foot foot foot";gap:14px 18px;align-items:start;box-shadow:0 0 0 3px ${GILT}}
.wrymwretch-slipping-glyph-h{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.24em;color:${RED};margin:0 0 8px}
.wrymwretch-slipping-glyph-key{grid-area:key;background:${PARCH};padding:4px}
.wrymwretch-slipping-glyph-keys{display:grid;grid-template-columns:repeat(2,44px);gap:6px}
.wrymwretch-slipping-glyph-rune{width:44px;height:44px;padding:2px;background:#f8f1df;border:1.5px solid ${INK};cursor:pointer;border-radius:2px}
.wrymwretch-slipping-glyph-rune:hover,.wrymwretch-slipping-glyph-rune:focus-visible{border-color:${RED};background:#fff6dc;outline:none}
.wrymwretch-slipping-glyph-rune svg,.wrymwretch-slipping-glyph-tile svg{width:100%;height:100%;display:block}
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
@media (max-width:640px){.wrymwretch-slipping-glyph-page{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"beat beat" "surface slots" "key key" "foot foot";padding:16px 12px}.wrymwretch-slipping-glyph-book{width:auto}.wrymwretch-slipping-glyph-book div.sk{width:40px;height:40px}.wrymwretch-slipping-glyph-slotrow b{display:none}.wrymwretch-slipping-glyph-keys{grid-template-columns:repeat(6,44px)}.wrymwretch-slipping-glyph-slot{width:46px;height:46px}}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    let SLIP = gentle ? 2 : 1.5;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-slipping-glyph-root";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="wrymwretch-slipping-glyph-page">
        <div class="wrymwretch-slipping-glyph-key"><div class="wrymwretch-slipping-glyph-h">KEY</div><div class="wrymwretch-slipping-glyph-keys"></div></div>
        <div class="wrymwretch-slipping-glyph-surface" tabindex="0" aria-label="The monolith. Arrow keys move the focus circle.">
          <div class="wrymwretch-slipping-glyph-grid"></div><div class="wrymwretch-slipping-glyph-dark"></div><div class="wrymwretch-slipping-glyph-ring"></div></div>
        <div class="wrymwretch-slipping-glyph-slots"><div class="wrymwretch-slipping-glyph-h">ROWS</div></div>
        <div class="wrymwretch-slipping-glyph-beat" aria-live="polite"></div>
        <div class="wrymwretch-slipping-glyph-foot"><i aria-live="polite">Watch what stays.</i>
          <span class="wrymwretch-slipping-glyph-dev"></span>
          <button type="button" class="wrymwretch-slipping-glyph-btn" data-sketch>Sketch</button>
          <button type="button" class="wrymwretch-slipping-glyph-btn" data-purify>Purify a row</button></div>
      </div>
      <div class="wrymwretch-slipping-glyph-intro"><div class="wrymwretch-slipping-glyph-card">
        <div class="cap" aria-hidden="true">T</div>
        <h2>The Slipping Glyph</h2>
        <p class="goal">Read three rows of the monolith by what stays.</p>
        <dl>
          <dt>Look</dt><dd>move the gilt circle (pointer or arrows). A glyph outside it slips, all but one part</dd>
          <dt>Read</dt><dd>a row's four still parts make one rune: tap its slot, then the rune in the key</dd>
          <dt>Beware</dt><dd>three wrong runes and the monolith devours the page</dd>
        </dl>
        <p class="more">${gentle ? "The glyphs slip slower this time, and Aquatica can purify twice. " : ""}A notebook and Aquatica's help are in the margin.</p>
        <button type="button" class="wrymwretch-slipping-glyph-btn" data-start>Dive</button></div></div>`;
    root.appendChild(wrap);
    const grid = wrap.querySelector(".wrymwretch-slipping-glyph-grid"), surface = wrap.querySelector(".wrymwretch-slipping-glyph-surface");
    const dark = wrap.querySelector(".wrymwretch-slipping-glyph-dark"), ring = wrap.querySelector(".wrymwretch-slipping-glyph-ring");
    const slotsEl = wrap.querySelector(".wrymwretch-slipping-glyph-slots"), keysEl = wrap.querySelector(".wrymwretch-slipping-glyph-keys");
    const note = wrap.querySelector(".wrymwretch-slipping-glyph-foot i"), devEl = wrap.querySelector(".wrymwretch-slipping-glyph-dev");
    const purifyBtn = wrap.querySelector("[data-purify]"), sketchBtn = wrap.querySelector("[data-sketch]");
    const beatEl = wrap.querySelector(".wrymwretch-slipping-glyph-beat");

    const st = { running: false, over: false, focus: 5, sel: null, wrong: 0, read: [false, false, false, false], purify: gentle ? 2 : 1, sketches: 0, still: -1, stillT: 0, fx: 0.375, fy: 0.375 };
    const reroll = (cur) => { let v; do v = 1 + Math.floor(R() * VARIANTS); while (v === cur); return v; };
    // each glyph: parts, stable type, time away from focus
    const glyphs = [];
    ROWS.forEach((row, ri) => {
      for (let ci = 0; ci < 4; ci++) {
        const stable = row.stable[ci];
        const parts = {};
        TYPES.forEach((t) => (parts[t] = 1 + Math.floor(R() * VARIANTS)));
        if (stable) parts[stable] = RUNES[row.answer - 1].parts[stable];
        const el = document.createElement("div");
        el.className = "wrymwretch-slipping-glyph-tile";
        el.style.background = `radial-gradient(circle at 50% 40%, ${TILE_BG[(ri + ci) % 4]}, #120e0a 130%)`;
        grid.appendChild(el);
        glyphs.push({ ri, ci, stable, parts, away: 0, el });
      }
    });
    const paint = (gl) => { gl.el.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" fill="none" stroke="${GILT}" stroke-width="1.2" stroke-dasharray="2 3"/>${glyphPaths(gl.parts, BONE, 6.5)}${glyphPaths(gl.parts, "rgba(0,0,0,.25)", 1)}</svg>`; };
    glyphs.forEach(paint);

    RUNES.forEach((ru) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wrymwretch-slipping-glyph-rune"; b.setAttribute("aria-label", "rune " + ru.id);
      b.innerHTML = `<svg viewBox="0 0 100 100">${glyphPaths(ru.parts, INK, 7)}</svg>`;
      b.addEventListener("click", () => choose(ru.id));
      keysEl.appendChild(b);
    });
    const slots = ROWS.map((row, ri) => {
      const b = document.createElement("button");
      const line = document.createElement("div"); line.className = "wrymwretch-slipping-glyph-slotrow";
      line.innerHTML = `<b>${ROMAN[ri]}</b>`; line.appendChild(b);
      b.type = "button"; b.className = "wrymwretch-slipping-glyph-slot" + (row.answer ? "" : " void");
      b.textContent = row.answer ? "?" : "✕"; if (!row.answer) b.title = "This row will not hold";
      b.setAttribute("aria-label", row.answer ? `row ${ri + 1} slot` : `row ${ri + 1}: unreadable`);
      b.addEventListener("click", () => {
        if (!row.answer || st.read[ri] || st.over) { if (!row.answer) note.textContent = "Nothing in this row stays. It cannot be held."; return; }
        st.sel = ri; slots.forEach((s, i) => s.classList.toggle("sel", i === ri));
        note.textContent = `Row ${ROMAN[ri]}: now choose its rune from the key.`;
      });
      slotsEl.appendChild(line);
      return b;
    });
    const book = document.createElement("div"); book.className = "wrymwretch-slipping-glyph-book";
    book.innerHTML = `<div class="h">NOTEBOOK</div>`;
    slotsEl.appendChild(book);
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
      d.innerHTML = `<svg viewBox="0 0 100 100" aria-label="sketch of a glyph in row ${ROMAN[gl.ri]}">${glyphPaths(gl.parts, INK, 6)}</svg>`;
      book.appendChild(d); st.sketches++;
      while (book.querySelectorAll(".sk").length > 2) book.querySelector(".sk").remove();
      requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("blur")));
      later(() => d.remove(), 5200);
      note.textContent = `Sketched (row ${ROMAN[gl.ri]}). The page will not keep it long.`;
    }
    const drawDev = () => { devEl.innerHTML = "Devour " + Array.from({ length: WRONG_TO_DEVOUR }, (_, i) => `<b class="${i < st.wrong ? "" : "off"}">●</b>`).join(""); };
    drawDev();

    function choose(id) {
      if (st.over || !st.running) return;
      if (st.sel == null) { note.textContent = "Pick a row's slot first, on the right."; return; }
      const ri = st.sel, row = ROWS[ri];
      if (id === row.answer) {
        st.read[ri] = true;
        const s = slots[ri]; s.classList.remove("sel"); s.classList.add("done");
        s.innerHTML = `<svg viewBox="0 0 100 100">${glyphPaths(RUNES[id - 1].parts, INK, 7)}</svg>`;
        glyphs.filter((g) => g.ri === ri).forEach((g) => { TYPES.forEach((t) => (g.parts[t] = RUNES[id - 1].parts[t])); g.el.classList.add("read"); paint(g); });
        glyphs.filter((g) => g.ri === ri).forEach((g) => { g.el.classList.remove("held"); void g.el.offsetWidth; if (!api.reducedMotion) g.el.classList.add("held"); });
        st.sel = null;
        note.textContent = `Row ${ROMAN[ri]} read.`;
        const n = st.read.filter(Boolean).length;
        if (n === 1) beat(`The first row holds in gold. Lunessa's chest is tight: the water clings to her skin like oil, and the fish have gone. <cite>Two rows to go</cite>`, 7000);
        if (n === 2) { SLIP = Math.min(SLIP, gentle ? 1.5 : 1.1); beat(`Something in the stone stirs at being read. The glyphs slip faster now. <cite>Slips quicken · one row left</cite>`, 7000); }
        if (n === 3) {
          st.over = true;
          note.textContent = "Three rows held. The fourth has nothing that stays.";
          api.store.set("losses", 0);
          later(() => api.end({ outcome: "win", text: `Three rows read from the monolith${st.wrong ? `, ${st.wrong} wrong` : ""}${st.sketches ? `, ${st.sketches} sketch${st.sketches > 1 ? "es" : ""} lost to the water` : ""}. The fourth row has nothing that stays, and as Lunessa reaches for it the surface devours. “She surfaced screaming.” (WW 73)` }), 900);
        }
        return;
      }
      st.wrong++; drawDev();
      slots[ri].classList.remove("bad"); void slots[ri].offsetWidth; if (!api.reducedMotion) slots[ri].classList.add("bad");
      if (st.wrong >= WRONG_TO_DEVOUR) {
        st.over = true;
        note.textContent = "The surface devours.";
        grid.style.transition = "filter 1.2s, opacity 1.2s"; grid.style.filter = "blur(6px)"; grid.style.opacity = ".2";
        api.store.set("losses", losses + 1);
        later(() => api.end({ outcome: "lose", text: `Three wrong runes${st.read.some(Boolean) ? `, ${st.read.filter(Boolean).length} row${st.read.filter(Boolean).length > 1 ? "s" : ""} read` : ""}. The monolith devours what was read, and “the meaning slid away like a dream upon waking” (WW 71). Lunessa kicks for the light with nothing she can keep. Tidecaller memory −3.${losses + 1 >= 2 ? " The glyphs will slip slower next time." : ""}` }), 1300);
        return;
      }
      // the row reshuffles which part is stable
      const perm = TYPES.slice().sort(() => R() - 0.5);
      glyphs.filter((g) => g.ri === ri).forEach((g, i) => { g.stable = perm[i]; g.parts[g.stable] = RUNES[row.answer - 1].parts[g.stable]; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); });
      note.textContent = `Not that rune. Row ${ROMAN[ri]} shifts: a different part of each glyph holds now.`;
    }

    // ---- focus ------------------------------------------------------------------------------
    function placeRing() {
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
    const setFromPointer = (e) => { const gb = grid.getBoundingClientRect(); st.fx = Math.max(0, Math.min(1, (e.clientX - gb.left) / gb.width)); st.fy = Math.max(0, Math.min(1, (e.clientY - gb.top) / gb.height)); placeRing(); };
    surface.addEventListener("pointermove", setFromPointer);
    surface.addEventListener("pointerdown", (e) => { setFromPointer(e); surface.setPointerCapture && surface.setPointerCapture(e.pointerId); });
    surface.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (e.key === " " || e.key === "Enter" || e.key.toLowerCase() === "k") { e.preventDefault(); sketch(); return; }
      if (!d) return; e.preventDefault();
      const i = st.focus >= 0 ? st.focus : 5;
      const ci = Math.max(0, Math.min(3, glyphs[i].ci + d[0])), ri = Math.max(0, Math.min(3, glyphs[i].ri + d[1]));
      st.fx = (ci + 0.5) / 4; st.fy = (ri + 0.5) / 4; placeRing();
    });
    purifyBtn.addEventListener("click", () => {
      if (st.purify < 1 || st.over || !st.running) return;
      const ri = st.sel != null ? st.sel : st.focus >= 0 ? glyphs[st.focus].ri : 0;
      st.purify--; purifyBtn.disabled = st.purify < 1; purifyBtn.textContent = st.purify ? `Purify a row (${st.purify})` : "Purify used"; st.still = ri; st.stillT = 5;
      note.textContent = `Aquatica's Purify: the water clears, and row ${ROMAN[ri]} holds still for five seconds.`;
    });
    sketchBtn.addEventListener("click", sketch);

    // ---- the slip ---------------------------------------------------------------------------
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    let raf = 0, last = performance.now();
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (st.running && !st.over) {
        st.stillT = Math.max(0, st.stillT - dt); if (st.stillT === 0) st.still = -1;
        glyphs.forEach((g, i) => {
          if (st.read[g.ri] || i === st.focus || g.ri === st.still) { g.away = 0; return; }
          g.away += dt;
          if (g.away > SLIP) { g.away = 0; TYPES.forEach((t) => { if (t !== g.stable) g.parts[t] = reroll(g.parts[t]); }); paint(g); g.el.classList.add("slip"); g.slipT = 0.25; }
          if (g.slipT > 0 && (g.slipT -= dt) <= 0) g.el.classList.remove("slip");
        });
      }
      raf = requestAnimationFrame(frame);
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(placeRing) : null;
    ro && ro.observe(surface);
    const intro = wrap.querySelector(".wrymwretch-slipping-glyph-intro"), sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => {
      intro.remove(); st.running = true; surface.focus(); placeRing();
      beat(`Lunessa Tidecaller dives through a sea that clings like oil, down to <q>a monolith carved with symbols her mind refused to hold</q>. <cite>WW 71 · watch what stays</cite>`, 8000);
    });
    sb.focus();
    requestAnimationFrame(placeRing);
    raf = requestAnimationFrame(frame);

    return { unmount() { st.over = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro && ro.disconnect(); wrap.remove(); } };
  },
};

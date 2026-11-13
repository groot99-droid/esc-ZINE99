// People of the Bark — Sap Kitchen (1D, alchemical diagram).
// DESIGN.md 11.2, the first visit (c2_kitchen): 50 sap, five pots of 10, recipes 1–4 and 8 open.
// Heat and boil time make thickness; up to three ingredients in order; stirs 0–6 (0–2 clear,
// 3–4 smooth, 5–6 frothy; froth ruins glue). A pot that matches a recipe writes it into Old Resin's
// book. Find three before the sap is gone to win. After each pot Resin says one word about it; after
// three misses in a row she names the thickness the nearest unfound recipe needs.
// Actions: set the fire, the glass and the paddle; add ingredients in order; taste (Resin dips her
// ladle: three per visit, no sap, she says the word and the thickness the pot would come out); empty
// the order; cook. After two lost visits Resin gives 60 sap and the heat × boil table is filled in.

const INK = "#3a281c", RED = "#b8402a", AMBER = "#d9902a", GOLD = "#f0c050", LANT = "#e8742a", LIME = "#c4d65a", PAPER = "#efe2c4", GREY = "#7d6c5a";
const THICK = { low: { short: "runny", long: "syrup" }, middle: { short: "syrup", long: "glue" }, high: { short: "glue", long: "hard" } };
const ING = {
  lichen: { name: "Lichen", ang: -45, open: true },
  pollen: { name: "Pollen", ang: 0, open: true },
  honeydew: { name: "Honeydew", ang: 45, open: true },
  resin: { name: "Resin", ang: 90, open: true },
  ash: { name: "Ash", ang: 135, open: true },
  frost: { name: "Frost", ang: 180, open: false, when: "winter" },
  leaf: { name: "Leaf-skin", ang: 225, open: false, when: "autumn" },
};
const RECIPES = [
  { n: 1, name: "Groove Syrup", cat: "food", thick: "syrup", ing: [], stirs: "clear", eff: "Food +6", hint: "sticky", open: true },
  { n: 2, name: "Lichen Loaf", cat: "food", thick: "hard", ing: ["lichen"], stirs: "smooth", eff: "Food +8", hint: "keeps", open: true },
  { n: 3, name: "Pollen Cake", cat: "food", thick: "hard", ing: ["pollen", "honeydew"], stirs: "smooth", eff: "Food +10, morale +2", hint: "sweet", open: true },
  { n: 4, name: "Dew Broth", cat: "food", thick: "runny", ing: ["honeydew", "lichen"], stirs: "frothy", eff: "Food +7", hint: "frothy", open: true },
  { n: 5, name: "Ridge Glue", cat: "sealant", open: false, when: "autumn" },
  { n: 6, name: "Ashpatch", cat: "sealant", open: false, when: "autumn" },
  { n: 7, name: "Leaf-skin Plaster", cat: "sealant", open: false, when: "autumn" },
  { n: 8, name: "Gold Tear", cat: "offering", thick: "runny", ing: ["pollen", "honeydew"], stirs: "clear", eff: "Knot +3", hint: "gold", open: true },
  { n: 9, name: "Ember Drop", cat: "offering", open: false, when: "autumn" },
  { n: 10, name: "Frost Candy", cat: "food", open: false, when: "winter" },
  { n: 11, name: "Winter Bread", cat: "food", open: false, when: "winter" },
  { n: 12, name: "Pell's Tear", cat: "offering", open: false, when: "winter" },
];
const CAT_COL = { food: LIME, sealant: GREY, offering: GOLD };
const GLYPH = {
  sap: `<circle r="13" fill="none" stroke="${INK}" stroke-width="2"/><path d="M0 -8 Q7 2 0 8 Q-7 2 0 -8Z" fill="${AMBER}"/>`,
  lichen: `<circle r="13" fill="none" stroke="${INK}" stroke-width="2"/><path d="M-7 6 Q-7 -7 7 -7 Q7 6 -7 6Z M-7 6 L5 -5" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
  pollen: `<circle r="6" fill="none" stroke="${INK}" stroke-width="2"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -9 L0 -13" stroke="${INK}" stroke-width="1.8" transform="rotate(${a})"/>`).join("")}`,
  honeydew: `<path d="M5 -11 A11 11 0 1 0 5 11 A8 8 0 1 1 5 -11Z" fill="none" stroke="${INK}" stroke-width="2"/>`,
  resin: `<path d="M0 -12 L11 8 L-11 8Z M0 8 L0 14 M-4 11 L4 11" fill="none" stroke="${INK}" stroke-width="2"/>`,
  ash: `<path d="M0 12 L11 -8 L-11 -8Z M-8 -2 L8 -2" fill="none" stroke="${INK}" stroke-width="2"/>`,
  frost: `<path d="M0 -12 V12 M-10 -6 L10 6 M-10 6 L10 -6" stroke="${INK}" stroke-width="2"/>`,
  leaf: `<path d="M-9 9 Q-9 -9 9 -9 Q9 9 -9 9Z" fill="none" stroke="${INK}" stroke-width="2"/><path d="M-6 6 L6 -6" stroke="${INK}" stroke-width="1.2"/>`,
};

export default {
  mount(root, api) {
    const P = "people-of-the-bark-sap-kitchen-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const timers = [];
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;

    const SAP0 = gentle ? 60 : 50;
    const S = { sap: SAP0, heat: "middle", boil: "short", stirs: 0, order: [], found: new Set(), seen: {}, misses: 0, pots: [], food: 0, knot: 0, morale: 0, over: false, last: null, tastes: 3, cooking: false, beats: new Set() };
    if (gentle) for (const h of ["low", "middle", "high"]) for (const b of ["short", "long"]) S.seen[h + "/" + b] = true;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${INK};font-family:'Cormorant Garamond',Georgia,serif;
 background:radial-gradient(ellipse at 40% 30%,#f5ead0,#dcc89c 85%)}
.${P}wrap::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.6;background:
 radial-gradient(circle at 20% 30%,rgba(122,90,64,.10) 0 1px,transparent 1.5px) 0 0/7px 7px,
 radial-gradient(circle at 60% 70%,rgba(122,90,64,.08) 0 1px,transparent 1.5px) 0 0/11px 11px}
.${P}page{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,320px);gap:12px 22px;padding:12px clamp(12px,3vw,30px) 20px;max-width:1200px;margin:0 auto;box-sizing:border-box;min-height:100%}
.${P}dia{min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px}
.${P}dia>svg{width:100%;height:calc(100vh - 300px);min-height:260px;display:block}
.${P}dia svg *{pointer-events:none}
.${P}dia svg .${P}hot,.${P}dia svg .${P}hot *{pointer-events:auto}
.${P}hot{cursor:pointer}
.${P}hot:hover>circle.${P}ring,.${P}hot:focus>circle.${P}ring{stroke:${RED};stroke-width:3}
.${P}hot:focus{outline:none}
.${P}row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;width:100%}
.${P}row .${P}tag{font:12px ui-monospace,monospace;letter-spacing:.14em;color:#5a3d2b;margin-right:2px}
.${P}ing{font:15px 'Cormorant Garamond',Georgia,serif;font-weight:600;display:inline-flex;gap:6px;align-items:center;background:rgba(251,243,223,.75);border:1px solid ${INK};color:${INK};padding:4px 10px 4px 6px;border-radius:18px;cursor:pointer;min-height:36px}
.${P}ing svg{width:24px;height:24px}
.${P}ing[aria-pressed=true]{background:${GOLD};box-shadow:0 0 0 2px ${RED}}
.${P}ing b{font:12px ui-monospace,monospace;background:${RED};color:${PAPER};border-radius:50%;width:18px;height:18px;display:grid;place-items:center}
.${P}ing:disabled{opacity:.4;cursor:default}
.${P}seg{display:inline-flex;border:1px solid ${INK};border-radius:3px;overflow:hidden}
.${P}seg button{font:14px ui-monospace,monospace;background:rgba(251,243,223,.6);border:0;border-left:1px solid rgba(58,40,28,.4);color:${INK};padding:6px 10px;cursor:pointer;min-height:36px}
.${P}seg button:first-child{border-left:0}
.${P}seg button[aria-pressed=true]{background:${INK};color:${PAPER}}
.${P}btn{font-family:'IM Fell English',Georgia,serif;font-size:19px;color:${PAPER};background:${RED};border:0;padding:8px 18px;cursor:pointer;border-radius:3px;min-height:42px}
.${P}btn:disabled{opacity:.4;cursor:default}
.${P}ghost{font:inherit;font-size:16px;background:rgba(251,243,223,.5);border:1px solid ${INK};color:${INK};padding:6px 12px;cursor:pointer;border-radius:3px;min-height:40px}
.${P}ghost:disabled{opacity:.4;cursor:default}
.${P}ghost:hover:not(:disabled),.${P}ing:hover:not(:disabled),.${P}seg button:hover{background:#fff6dc}
.${P}ing[aria-pressed=true]:hover{background:${GOLD}}
.${P}seg button[aria-pressed=true]:hover{background:${INK}}
.${P}wrap button:focus-visible{outline:3px solid ${LANT};outline-offset:2px}
.${P}side{display:flex;flex-direction:column;gap:12px}
.${P}box{border:1px solid ${INK};padding:10px 12px;background:rgba(251,243,223,.65)}
.${P}box h3{margin:0 0 8px;font:600 12px ui-monospace,monospace;letter-spacing:.2em;text-align:center}
.${P}tbl{display:grid;grid-template-columns:auto 1fr 1fr;gap:3px;font-size:16px;text-align:center}
.${P}tbl span{border:1px solid rgba(58,40,28,.4);padding:2px 4px;font-style:italic}
.${P}tbl b{font:600 12px ui-monospace,monospace;letter-spacing:.06em;align-self:center}
.${P}tbl .${P}lit{background:${GOLD};font-weight:600}
.${P}book{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.${P}ent{border:1px dashed rgba(58,40,28,.6);border-radius:4px;padding:5px 4px;font-size:15px;line-height:1.15;text-align:center;min-height:56px;display:flex;flex-direction:column;justify-content:center;gap:2px}
.${P}ent i{font-size:15px;color:#5a3d2b}
.${P}ent.${P}got{border-style:solid;background:var(--c);color:${INK};font-weight:600}
.${P}ent.${P}got i{font-weight:400;font-size:13px}
.${P}ent.${P}locked{opacity:.5}
.${P}ent small{font:12px ui-monospace,monospace;letter-spacing:.04em}
.${P}ent.${P}new{animation:${P}ink 1.4s ease-out}
@keyframes ${P}ink{0%{transform:scale(1.15);box-shadow:0 0 0 6px ${GOLD}}100%{transform:scale(1);box-shadow:0 0 0 0 transparent}}
.${P}say{font-family:'IM Fell English',Georgia,serif;font-size:22px;color:${RED};min-height:1.4em;text-align:center;border-bottom:1px solid rgba(58,40,28,.4);padding-bottom:8px}
.${P}say small{display:block;font-family:'Cormorant Garamond',serif;font-size:17px;line-height:1.3;color:${INK};margin-top:4px}
.${P}say.${P}miss{animation:${P}shake .35s}
@keyframes ${P}shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes ${P}bub{0%{transform:translateY(0);opacity:.9}100%{transform:translateY(-34px);opacity:0}}
.${P}bub{animation:${P}bub .8s ease-out infinite}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(220,200,156,.95);z-index:4;padding:16px;overflow:auto}
.${P}card{max-width:470px;width:100%;box-sizing:border-box;border:1px solid ${INK};background:#f7ecd2;padding:18px 22px;position:relative;
 background-image:linear-gradient(transparent 31px,rgba(58,40,28,.12) 32px);background-size:100% 32px}
.${P}card h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${RED}}
.${P}card .${P}sub{font:12px ui-monospace,monospace;letter-spacing:.2em;margin-bottom:8px}
.${P}card .${P}beat{font-style:italic;font-size:17px;line-height:1.4;margin:0 0 8px}
.${P}card .${P}goal{font-size:18px;line-height:1.35;margin:0 0 10px}
.${P}key{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:16px;line-height:1.3;margin:0 0 14px}
.${P}key kbd{font:13px ui-monospace,monospace;border:1px solid ${INK};padding:1px 6px;border-radius:2px;white-space:nowrap;align-self:start;background:#fff8e6}
.${P}card .${P}seal{position:absolute;right:16px;top:14px;width:58px;height:58px}
@media (max-width:760px){.${P}page{grid-template-columns:1fr}.${P}say{position:sticky;bottom:0;z-index:2;background:#f3e6c6;border:1px solid ${INK};padding:6px 8px;box-shadow:0 -4px 12px rgba(58,40,28,.2)}.${P}dia>svg{height:auto;max-height:none;aspect-ratio:600/560}}
@media (prefers-reduced-motion:reduce){.${P}bub,.${P}ent.${P}new,.${P}say.${P}miss{animation:none}}
</style>
<div class="${P}page">
 <div class="${P}dia"><svg viewBox="0 0 600 560" aria-label="The pot and its ingredients"></svg>
  <div class="${P}row ${P}shelf"><span class="${P}tag">SHELF</span></div>
  <div class="${P}row ${P}set">
   <span class="${P}tag">HEAT</span><span class="${P}seg" data-g="heat"><button type="button" data-v="low">low</button><button type="button" data-v="middle">mid</button><button type="button" data-v="high">high</button></span>
   <span class="${P}tag">BOIL</span><span class="${P}seg" data-g="boil"><button type="button" data-v="short">short</button><button type="button" data-v="long">long</button></span>
   <span class="${P}tag">STIRS</span><span class="${P}seg" data-g="stir"><button type="button" data-v="-">−</button><button type="button" data-v="n" disabled style="min-width:34px;opacity:1">0</button><button type="button" data-v="+">+</button></span>
  </div>
  <div class="${P}row"><button class="${P}ghost" data-a="taste" type="button"></button><button class="${P}ghost" data-a="clear" type="button">Empty</button><button class="${P}btn" data-a="cook" type="button">Cook · 10 sap</button><button class="${P}ghost" data-a="close" type="button">Close the book</button></div>
 </div>
 <div class="${P}side">
  <div class="${P}say" aria-live="polite"></div>
  <div class="${P}box"><h3>HEAT × BOIL = THICKNESS</h3><div class="${P}tbl"></div></div>
  <div class="${P}box"><h3>OLD RESIN'S BOOK · <span class="${P}cnt"></span></h3><div class="${P}book"></div></div>
 </div>
</div>
<div class="${P}intro"><div class="${P}card" role="dialog" aria-label="How to play">
 <svg class="${P}seal" viewBox="-30 -30 60 60" aria-hidden="true"><circle r="27" fill="none" stroke="${RED}" stroke-width="2"/><path d="M0 -20 L17 10 L-17 10Z" fill="none" stroke="${RED}" stroke-width="2"/><path d="M0 -8 Q6 2 0 7 Q-6 2 0 -8Z" fill="${AMBER}"/></svg>
 <h2>Sap Kitchen</h2><div class="${P}sub">HIGHRIDGE · SPRING</div>
 <p class="${P}beat">Old Resin's kitchen, the first warm week. Her book is mostly blank and she means to fill it before she dies. Today your hands do the lifting. “Sacred water. Lovely. Pass me the sacred water and a spoon.”</p>
 <p class="${P}goal"><b>Goal:</b> find <b>three</b> recipes before the jar runs dry. ${SAP0} sap; each pot costs 10.</p>
 <div class="${P}key">
  <kbd>heat + boil</kbd><span>together they set how thick it comes out</span>
  <kbd>shelf</kbd><span>add up to three things, in order</span>
  <kbd>Cook · C</kbd><span>each blank page has one word: aim for it</span>
 </div>
 <button class="${P}btn" type="button">Light the fire</button>
</div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const svg = wrap.querySelector("svg[aria-label]");
    const sayEl = $("say"), tbl = $("tbl"), book = $("book"), cnt = $("cnt"), shelf = $("shelf");
    const cookBtn = wrap.querySelector(`[data-a=cook]`), tasteBtn = wrap.querySelector(`[data-a=taste]`);
    const CX = 300, CY = 250, R = 205, RI = 178;
    const pos = (ang, r = RI) => [CX + Math.cos(ang * Math.PI / 180) * r, CY + Math.sin(ang * Math.PI / 180) * r];
    const say = (line, sub, miss) => {
      sayEl.innerHTML = `${line}<small>${sub || ""}</small>`;
      if (miss && !api.reducedMotion) { sayEl.classList.remove(P + "miss"); void sayEl.offsetWidth; sayEl.classList.add(P + "miss"); }
    };

    // the ingredient shelf
    for (const [k, v] of Object.entries(ING)) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "ing"; b.dataset.ing = k; b.disabled = !v.open;
      b.innerHTML = `<svg viewBox="-16 -16 32 32" aria-hidden="true">${GLYPH[k]}</svg><span>${v.name}${v.open ? "" : ` · ${v.when}`}</span>`;
      shelf.appendChild(b);
      on(b, "click", () => toggleIng(k));
    }
    function toggleIng(k) {
      if (S.over || S.cooking || !ING[k].open) return;
      const i = S.order.indexOf(k);
      if (i >= 0) S.order.splice(i, 1);
      else if (S.order.length < 3) S.order.push(k);
      else { say("“Three.”", "Three is all the pot will take. Tap one to take it out.", true); return; }
      refresh();
    }
    function set(g, v) {
      if (S.over || S.cooking) return;
      if (g === "heat") S.heat = v;
      if (g === "boil") S.boil = v;
      if (g === "stir") S.stirs = v === "reset" ? 0 : Math.max(0, Math.min(6, S.stirs + (v === "+" ? 1 : -1)));
      refresh();
    }
    wrap.querySelectorAll(`.${P}seg button`).forEach((b) => on(b, "click", () => set(b.parentElement.dataset.g, b.dataset.v)));

    function draw() {
      const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5, [x1, y1] = pos(a, R), [x2, y2] = pos(a, R - (i % 3 ? 5 : 11)); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width=".9"/>`; }).join("");
      const tri = [0, 120, 240].map((a) => pos(a - 90, 150).join(",")).join(" ");
      const tri2 = [0, 120, 240].map((a) => pos(a + 90, 150).join(",")).join(" ");
      let out = `<defs><pattern id="${P}hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width=".8" opacity=".5"/></pattern>
<marker id="${P}ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${RED}"/></marker>
<marker id="${P}ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${INK}"/></marker></defs>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="rgba(251,243,223,.35)" stroke="${INK}" stroke-width="1.8"/><circle cx="${CX}" cy="${CY}" r="${R - 15}" fill="none" stroke="${INK}" stroke-width=".9"/>${ticks}
<polygon points="${tri}" fill="none" stroke="${LANT}" stroke-width="1" opacity=".6"/><polygon points="${tri2}" fill="none" stroke="${LANT}" stroke-width="1" opacity=".6"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="none" stroke="${INK}" stroke-width=".9" stroke-dasharray="2 4"/>`;
      S.order.forEach((k, i) => {
        const [x1, y1] = pos(ING[k].ang, RI - 24), [x2, y2] = pos(ING[k].ang, 84);
        const [mx, my] = pos(ING[k].ang + 6, (RI + 84) / 2);
        out += `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${RED}" stroke-width="2.4" marker-end="url(#${P}ar)"/>
<circle cx="${mx}" cy="${my}" r="12" fill="${RED}"/><text x="${mx}" y="${my + 5}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="15" fill="${PAPER}">${i + 1}</text>`;
      });
      const sapP = pos(-90);
      const jar = Math.max(0, S.sap / SAP0);
      out += `<g transform="translate(${sapP[0]} ${sapP[1]})"><circle r="21" fill="${PAPER}" stroke="${AMBER}" stroke-width="2.4"/>${GLYPH.sap}</g>
<g transform="translate(${CX + 128} ${CY - 214})"><rect x="0" y="0" width="30" height="40" rx="5" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><rect x="2" y="${2 + 36 * (1 - jar)}" width="26" height="${36 * jar}" rx="3" fill="${AMBER}"/><text x="38" y="26" font-family="ui-monospace,monospace" font-size="17" fill="${INK}">SAP ${S.sap}</text></g>`;
      for (const [k, v] of Object.entries(ING)) {
        const [x, y] = pos(v.ang);
        const cs = Math.cos(v.ang * Math.PI / 180), sn = Math.sin(v.ang * Math.PI / 180);
        const lx = x + cs * 28, ly = y + sn * 34 + 5, anchor = cs > 0.3 ? "start" : cs < -0.3 ? "end" : "middle";
        const used = S.order.includes(k);
        out += `<g class="${v.open ? P + "hot" : ""}" data-ing="${k}" tabindex="${v.open ? 0 : -1}" role="${v.open ? "button" : "img"}" aria-label="${v.name}${v.open ? "" : ", not in season"}" transform="translate(${x} ${y})" opacity="${v.open ? 1 : 0.35}">
<circle class="${P}ring" r="21" fill="${used ? GOLD : PAPER}" stroke="${INK}" stroke-width="1.6"/>${GLYPH[k]}</g>
<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="ui-monospace,monospace" font-size="14" letter-spacing="1" opacity="${v.open ? 0.9 : 0.4}">${v.name.toUpperCase()}</text>`;
      }
      const fillCol = S.last ? (S.last.recipe ? CAT_COL[S.last.recipe.cat] : S.last.crumbly ? GREY : AMBER) : AMBER;
      const bubbles = S.cooking ? [-30, -8, 16, 34].map((x, i) => `<circle class="${P}bub" cx="${x}" cy="-22" r="${4 + (i % 2) * 2}" fill="${GOLD}" style="animation-delay:${i * 0.18}s"/>`).join("") : "";
      out += `<g transform="translate(${CX} ${CY})">
<path d="M-64 -18 Q-68 66 0 72 Q68 66 64 -18Z" fill="#5a3d2b" stroke="${INK}" stroke-width="2.2"/>
<ellipse cy="-18" rx="64" ry="16" fill="${fillCol}" stroke="${INK}" stroke-width="2.2"/>
<ellipse cy="-21" rx="42" ry="6" fill="#fff6dc" opacity=".35"/>${bubbles}</g>`;
      // the paddle
      out += `<g class="${P}hot" data-a="stir" tabindex="0" role="button" aria-label="Stir, ${S.stirs} stirs">
<rect x="${CX + 14}" y="${CY - 120}" width="100" height="116" fill="transparent"/>
<circle class="${P}ring" cx="${CX + 84}" cy="${CY - 86}" r="25" fill="${PAPER}" stroke="${INK}" stroke-width="1.4" opacity=".95"/>
<line x1="${CX + 20}" y1="${CY - 12}" x2="${CX + 100}" y2="${CY - 102}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<text x="${CX + 84}" y="${CY - 80}" text-anchor="middle" font-family="IM Fell English,serif" font-size="19" fill="${RED}">${S.stirs}</text>
<g transform="translate(${CX + 74} ${CY - 46})">${Array.from({ length: S.stirs }, (_, i) => `<line x1="${i * 8}" y1="0" x2="${i * 8 + 4}" y2="15" stroke="${RED}" stroke-width="2.6"/>`).join("")}</g></g>`;
      const lv = { low: 1, middle: 2, high: 3 }[S.heat];
      out += `<g class="${P}hot" data-a="heat" tabindex="0" role="button" aria-label="Heat: ${S.heat}" transform="translate(${CX} ${CY + 116})">
<circle class="${P}ring" r="29" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
<path d="M0 -20 L20 15 L-20 15Z" fill="${["", GOLD, LANT, RED][lv]}" stroke="${INK}" stroke-width="1.8"/>
<text y="11" text-anchor="middle" font-family="IM Fell English,serif" font-size="15" fill="${PAPER}">${"I".repeat(lv)}</text></g>`;
      const long = S.boil === "long";
      out += `<g class="${P}hot" data-a="boil" tabindex="0" role="button" aria-label="Boil: ${S.boil}" transform="translate(${CX - 108} ${CY + 18})">
<circle class="${P}ring" r="29" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/>
<path d="M-12 -19 H12 L0 0 L12 19 H-12 L0 0Z" fill="none" stroke="${INK}" stroke-width="2"/>
<path d="${long ? "M-8 14 H8 L0 4Z M-3 -15 H3 L0 -11Z" : "M-9 -16 H9 L0 -3Z M-4 16 H4 L0 12Z"}" fill="${AMBER}"/></g>`;
      // where this pot is heading: thickness, if known
      const k = S.heat + "/" + S.boil;
      out += `<text x="8" y="22" font-family="ui-monospace,monospace" font-size="13" letter-spacing="2" fill="${INK}" opacity=".8">THIS POT</text><text x="8" y="46" font-family="IM Fell English,serif" font-size="22" fill="${RED}">${S.seen[k] ? THICK[S.heat][S.boil] : "?"} · ${S.stirs <= 2 ? "clear" : S.stirs <= 4 ? "smooth" : "frothy"}</text>`;
      [["food", 130], ["sealant", 300], ["offering", 470]].forEach(([cat, x]) => {
        const n = S.pots.filter((p) => p.recipe && p.recipe.cat === cat).length + (cat === "food" ? S.pots.filter((p) => !p.recipe && !p.crumbly).length : 0);
        const lit = n > 0;
        out += `<path d="M${CX + (x - CX) * 0.25} ${CY + 78} L${x} ${CY + 222}" stroke="${INK}" stroke-width="1.1" marker-end="url(#${P}ai)" opacity=".5"/>
<g transform="translate(${x} ${CY + 250})"><path d="M-8 -26 V-12 Q-26 -2 -22 14 Q-18 24 0 24 Q18 24 22 14 Q26 -2 8 -12 V-26Z" fill="${lit ? CAT_COL[cat] : "url(#" + P + "hatch)"}" stroke="${INK}" stroke-width="1.8"/>
<text x="${x < CX ? -30 : 30}" y="10" text-anchor="${x < CX ? "end" : "start"}" font-family="ui-monospace,monospace" font-size="14" letter-spacing="1">${cat.toUpperCase()}${n ? " ×" + n : ""}</text></g>`;
      });
      svg.innerHTML = out;
      svg.querySelectorAll("." + P + "hot").forEach((el) => {
        const act = () => {
          const ing = el.dataset.ing, a = el.dataset.a;
          if (ing) toggleIng(ing);
          if (a === "stir") set("stir", S.stirs >= 6 ? "reset" : "+");
          if (a === "heat") set("heat", { low: "middle", middle: "high", high: "low" }[S.heat]);
          if (a === "boil") set("boil", S.boil === "short" ? "long" : "short");
          const again = svg.querySelector(ing ? `[data-ing="${ing}"]` : `[data-a="${a}"]`); again && again.focus();
        };
        el.addEventListener("click", act);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      });
    }

    function sideboard() {
      tbl.innerHTML = `<b></b><b>SHORT</b><b>LONG</b>` + ["low", "middle", "high"].map((h) => `<b>${h === "middle" ? "MID" : h.toUpperCase()}</b>` + ["short", "long"].map((b) => {
        const k = h + "/" + b, cur = S.heat === h && S.boil === b;
        return `<span class="${cur ? P + "lit" : ""}">${S.seen[k] ? THICK[h][b] : "?"}</span>`;
      }).join("")).join("");
      book.innerHTML = RECIPES.map((r) => {
        if (!r.open) return `<div class="${P}ent ${P}locked"><small>${r.n}</small><i>${r.when}</i></div>`;
        if (S.found.has(r.n)) return `<div class="${P}ent ${P}got" data-n="${r.n}" style="--c:${CAT_COL[r.cat]}"><small>${r.n}</small>${r.name}<i>${r.eff}</i></div>`;
        return `<div class="${P}ent"><small>${r.n}</small><i>“${r.hint}”</i></div>`;
      }).join("");
      cnt.textContent = `${S.found.size} / 3 FOUND`;
      cookBtn.disabled = S.sap < 10 || S.over || S.cooking;
      tasteBtn.textContent = `Taste · ${S.tastes}`;
      tasteBtn.disabled = S.tastes <= 0 || S.over || S.cooking;
      shelf.querySelectorAll("[data-ing]").forEach((b) => {
        const i = S.order.indexOf(b.dataset.ing);
        b.setAttribute("aria-pressed", String(i >= 0));
        const old = b.querySelector("b"); if (old) old.remove();
        if (i >= 0) b.insertAdjacentHTML("afterbegin", `<b>${i + 1}</b>`);
      });
      wrap.querySelectorAll(`.${P}seg[data-g=heat] button`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === S.heat)));
      wrap.querySelectorAll(`.${P}seg[data-g=boil] button`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === S.boil)));
      wrap.querySelector(`.${P}seg[data-g=stir] [data-v=n]`).textContent = String(S.stirs);
    }
    function refresh() { draw(); sideboard(); }

    function resolve() {
      const thick = THICK[S.heat][S.boil];
      const stirs = S.stirs <= 2 ? "clear" : S.stirs <= 4 ? "smooth" : "frothy";
      const crumbly = thick === "glue" && stirs === "frothy";
      const pot = { thick, stirs, ing: S.order.slice(), crumbly };
      const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
      pot.recipe = crumbly ? null : RECIPES.find((r) => r.open && r.thick === thick && r.stirs === stirs && same(r.ing, pot.ing)) || null;
      return pot;
    }
    function word(pot) {
      if (pot.crumbly) return "gritty";
      if (pot.ing.includes("pollen") && pot.ing.includes("honeydew") && pot.thick === "runny") return "gold";
      if (pot.ing.includes("pollen")) return "sweet";
      if (pot.stirs === "frothy") return "frothy";
      return { runny: "thin", syrup: "sticky", glue: "tacky", hard: "keeps" }[pot.thick];
    }
    function taste() {
      if (S.over || S.cooking || S.tastes <= 0) return;
      S.tastes--;
      const pot = resolve();
      S.seen[S.heat + "/" + S.boil] = true;
      say(`“${word(pot)}.”`, `Resin licks the ladle. “It'll come out ${pot.thick}${pot.crumbly ? ", and crumble" : ""}.” ${S.tastes ? `${S.tastes} taste${S.tastes > 1 ? "s" : ""} left.` : "That's all the tasting you get."}`);
      refresh();
    }
    function cook() {
      if (S.over || S.cooking || S.sap < 10) return;
      S.sap -= 10; S.cooking = true;
      const pot = resolve();
      S.seen[S.heat + "/" + S.boil] = true;
      refresh();
      say("…", "The pot rolls over. Resin hums.");
      later(() => serve(pot), api.reducedMotion ? 100 : 900);
    }
    function serve(pot) {
      S.cooking = false;
      S.pots.push(pot); S.last = pot;
      let line = `“${word(pot)}.”`, sub = "", fresh = false;
      if (pot.recipe) {
        fresh = !S.found.has(pot.recipe.n);
        S.found.add(pot.recipe.n); S.misses = 0;
        sub = `${fresh ? "Into the book: " : "Again: "}${pot.recipe.name}. ${pot.recipe.eff}.`;
        if (pot.recipe.cat === "food") S.food += parseInt(pot.recipe.eff.match(/\d+/)[0], 10);
        if (pot.recipe.n === 3) S.morale += 2;
        if (pot.recipe.cat === "offering") S.knot += 3;
      } else {
        S.misses++;
        sub = pot.crumbly ? "Froth ruins glue: it crumbles. A failed pot." : `${cap(pot.thick)}, ${pot.stirs}. Edible, just: food +2.`;
        if (!pot.crumbly) S.food += 2;
        if (S.misses >= 3) {
          const near = RECIPES.find((r) => r.open && !S.found.has(r.n));
          if (near) sub += ` Resin, not looking up: “The ${near.hint} one wants to be ${near.thick}.”`;
        }
      }
      S.order = []; S.stirs = 0;
      say(line, sub, !pot.recipe);
      refresh();
      if (fresh) { const el = book.querySelector(`[data-n="${pot.recipe.n}"]`); if (el && !api.reducedMotion) el.classList.add(P + "new"); }
      beats(fresh);
      if (S.found.size >= 3) finish(true);
      else if (S.sap < 10) finish(false);
    }
    function beats(fresh) {
      const once = (k, f) => { if (!S.beats.has(k)) { S.beats.add(k); f(); } };
      if (fresh && S.found.size === 1) once("first", () => later(() => say("Resin", "“Too hot and it's glue. Too cold and it's a puddle. Like people.”"), 2200));
      if (S.pots.length === 2 && !S.found.has(8)) once("pell", () => later(() => say("A Knot novice at the door", "“Elder Pell asks, if there is anything gold in the pot today, for the shrine.” Resin: “Gold. Hm. Thin and sweet, then.”"), 2400));
      if (S.sap === 10 && S.found.size < 3) once("last", () => later(() => say("The jar", "One pot of sap left. Resin taps the book where it is still blank."), 2400));
    }
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    function finish(won, closed) {
      if (S.over) return;
      S.over = true; sideboard();
      const names = RECIPES.filter((r) => S.found.has(r.n)).map((r) => r.name).join(", ") || "none";
      const tally = `Food +${S.food}${S.knot ? ", Knot +" + S.knot : ""}${S.morale ? ", morale +" + S.morale : ""}; ${S.sap} sap left in the jar.`;
      api.store.set("found", [...S.found]);
      api.store.set("losses", won ? 0 : losses + 1);
      later(() => api.end(won
        ? { outcome: "win", text: `Three new pages in Old Resin's book: ${names}. She closes it with her ladle and tastes the ladle. ${tally}` }
        : { outcome: "lose", text: `${closed ? "You close the book" : "The sap jar is empty"} with ${S.found.size} of 3 recipes found (${names}). Resin scrapes the pot: “Next time we taste first.” ${tally}${losses + 1 >= 2 ? " Next visit she will fill in the heat chart for you, and spare 60 sap." : ""}` }), 1500);
    }
    on(cookBtn, "click", cook);
    on(tasteBtn, "click", taste);
    on(wrap.querySelector("[data-a=clear]"), "click", () => { if (S.over || S.cooking) return; S.order = []; S.stirs = 0; refresh(); say("“Start again.”", "The order is emptied and the paddle set down."); });
    on(wrap.querySelector("[data-a=close]"), "click", () => finish(S.found.size >= 3, true));
    on(window, "keydown", (e) => {
      if (S.over || wrap.querySelector("." + P + "intro") || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.repeat) return;
      if (k === "c") cook();
      else if (k === "t") taste();
      else if (k === "h") set("heat", { low: "middle", middle: "high", high: "low" }[S.heat]);
      else if (k === "b") set("boil", S.boil === "short" ? "long" : "short");
      else if (k === "+" || k === "=" || k === "s") set("stir", "+");
      else if (k === "-") set("stir", "-");
      else if (/^[1-5]$/.test(k)) toggleIng(Object.keys(ING)[+k - 1]);
      else if (k === "backspace" || k === "x") { S.order = []; refresh(); }
    });
    const startBtn = wrap.querySelector(`.${P}intro .${P}btn`);
    on(startBtn, "click", () => {
      wrap.querySelector("." + P + "intro").remove();
      say("“Sap first. Always sap.”", gentle ? "Resin has chalked the heat chart for you. Taste before you cook (T): three dips of the ladle cost nothing." : "Old Resin stirs an empty pot. Taste before you cook (T): three dips of the ladle cost nothing.");
      svg.querySelector("[data-a=heat]").focus();
    });
    startBtn.focus();
    refresh();
    wrap._test = { S };

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

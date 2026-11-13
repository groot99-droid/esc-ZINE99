// People of the Bark — Sap Kitchen (1D, alchemical diagram).
// DESIGN.md 11.2, cut to the first visit (c2_kitchen): 50 sap, five pots of 10, recipes 1–4 and 8 open.
// Set heat and boil time (they make thickness), add up to three ingredients in order, set stirs,
// cook. A pot that matches a recipe writes it into Old Resin's book. Find three before the sap is
// gone to win. After each pot Resin says one word about it; after three misses in a row she names
// the thickness the nearest unfound recipe needs.

const INK = "#3a281c", RED = "#b8402a", AMBER = "#d9902a", GOLD = "#f0c050", LANT = "#e8742a", LIME = "#c4d65a", SAGE = "#8fa37a", PAPER = "#efe2c4", GREY = "#7d6c5a";
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
// the twelve recipes (DESIGN.md 11.2). stirs: "clear" 0–2, "smooth" 3–4, "frothy" 5–6.
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

// alchemical-looking glyphs for each ingredient (drawn, not a font)
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

    const S = { sap: 50, heat: "middle", boil: "short", stirs: 0, order: [], found: new Set(), seen: {}, misses: 0, pots: [], food: 0, knot: 0, morale: 0, word: "", over: false, last: null };

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${INK};font-family:'Cormorant Garamond',Georgia,serif;background:radial-gradient(ellipse at 40% 30%,#f3e7c9,#dcc89c 85%)}
.${P}page{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,300px);gap:14px 22px;padding:16px clamp(12px,3vw,32px) 24px;max-width:1200px;margin:0 auto;box-sizing:border-box;min-height:100%}
.${P}dia{min-width:0;display:flex;flex-direction:column;align-items:center}
.${P}dia svg{width:100%;max-height:calc(100vh - 180px);min-height:300px;display:block}
.${P}dia svg *{pointer-events:none}
.${P}dia svg .${P}hot,.${P}dia svg .${P}hot *{pointer-events:auto}
.${P}hot{cursor:pointer}
.${P}hot:hover>circle.${P}ring,.${P}hot:focus>circle.${P}ring{stroke:${RED};stroke-width:2.5}
.${P}hot:focus{outline:none}
.${P}ctrl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin-top:4px;font-size:16px}
.${P}btn{font:inherit;font-family:'IM Fell English',Georgia,serif;font-size:18px;color:${PAPER};background:${RED};border:0;padding:7px 16px;cursor:pointer;border-radius:3px}
.${P}btn:disabled{opacity:.4;cursor:default}
.${P}ghost{font:inherit;font-size:15px;background:transparent;border:1px solid ${INK};color:${INK};padding:5px 10px;cursor:pointer;border-radius:3px}
.${P}side{display:flex;flex-direction:column;gap:14px}
.${P}box{border:1px solid ${INK};padding:10px 12px;background:rgba(251,243,223,.6)}
.${P}box h3{margin:0 0 8px;font:600 11px ui-monospace,monospace;letter-spacing:.2em;text-align:center}
.${P}tbl{display:grid;grid-template-columns:auto 1fr 1fr;gap:3px;font-size:14px;text-align:center}
.${P}tbl span{border:1px solid rgba(58,40,28,.4);padding:2px 4px;font-style:italic}
.${P}tbl b{font:600 10px ui-monospace,monospace;letter-spacing:.08em;align-self:center}
.${P}tbl .${P}lit{background:${GOLD}}
.${P}book{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.${P}ent{border:1px dashed rgba(58,40,28,.5);border-radius:4px;padding:5px 4px;font-size:13px;line-height:1.15;text-align:center;min-height:52px;display:flex;flex-direction:column;justify-content:center;gap:2px}
.${P}ent i{font-size:12px;color:#7a5a40}
.${P}ent.${P}got{border-style:solid;background:var(--c);color:${INK}}
.${P}ent.${P}locked{opacity:.45}
.${P}ent small{font:9px ui-monospace,monospace;letter-spacing:.06em}
.${P}say{font-family:'IM Fell English',Georgia,serif;font-size:19px;color:${RED};min-height:1.4em;text-align:center}
.${P}say small{display:block;font-family:'Cormorant Garamond',serif;font-size:15px;color:${INK}}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(220,200,156,.95);z-index:4;padding:16px}
.${P}intro div{max-width:480px;border:1px solid ${INK};background:#f6ead0;padding:20px 22px}
.${P}intro h2{margin:0 0 6px;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${RED}}
.${P}intro p{margin:0 0 10px;font-size:18px;line-height:1.35}
@media (max-width:760px){.${P}page{grid-template-columns:1fr}.${P}dia svg{max-height:none}}
</style>
<div class="${P}page">
 <div class="${P}dia"><svg viewBox="0 0 600 600" aria-label="The pot and its ingredients"></svg>
  <div class="${P}ctrl"><button class="${P}ghost" data-a="clear" type="button">Empty the order</button><button class="${P}btn" data-a="cook" type="button">Cook (10 sap)</button><button class="${P}ghost" data-a="close" type="button">Close the book</button></div>
 </div>
 <div class="${P}side">
  <div class="${P}say" aria-live="polite"></div>
  <div class="${P}box"><h3>HEAT × BOIL</h3><div class="${P}tbl"></div></div>
  <div class="${P}box"><h3>OLD RESIN'S BOOK</h3><div class="${P}book"></div></div>
 </div>
</div>
<div class="${P}intro"><div>
 <h2>Sap Kitchen</h2>
 <p>Old Resin's book is mostly blank. Each blank entry has one word: what the pot should be like. Find <b>three</b> recipes with the 50 sap you have; each pot costs 10.</p>
 <p>Tap the <b>fire</b> for heat and the <b>hourglass</b> for boil time: together they set thickness. Tap ingredients to add them in order (up to three), tap the <b>paddle</b> to stir (0–6), then Cook.</p>
 <button class="${P}btn" type="button">Light the fire</button>
</div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg");
    const say = wrap.querySelector("." + P + "say"), tbl = wrap.querySelector("." + P + "tbl"), book = wrap.querySelector("." + P + "book");
    const cookBtn = wrap.querySelector(`[data-a=cook]`);
    const CX = 300, CY = 270, R = 200, RI = 175;
    const pos = (ang, r = RI) => [CX + Math.cos(ang * Math.PI / 180) * r, CY + Math.sin(ang * Math.PI / 180) * r];

    function draw() {
      const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5, [x1, y1] = pos(a, R), [x2, y2] = pos(a, R - (i % 3 ? 5 : 10)); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width=".8"/>`; }).join("");
      // the triangle and square of the old diagram, faint
      const tri = [0, 120, 240].map((a) => pos(a - 90, 150).join(",")).join(" ");
      const tri2 = [0, 120, 240].map((a) => pos(a + 90, 150).join(",")).join(" ");
      let out = `<defs><pattern id="${P}hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width=".7" opacity=".5"/></pattern>
<marker id="${P}ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${RED}"/></marker>
<marker id="${P}ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${INK}"/></marker></defs>
<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="${CX}" cy="${CY}" r="${R - 14}" fill="none" stroke="${INK}" stroke-width=".8"/>${ticks}
<polygon points="${tri}" fill="none" stroke="${LANT}" stroke-width=".8" opacity=".6"/><polygon points="${tri2}" fill="none" stroke="${LANT}" stroke-width=".8" opacity=".6"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="2 4"/>`;
      // order arrows
      S.order.forEach((k, i) => {
        const [x1, y1] = pos(ING[k].ang, RI - 22), [x2, y2] = pos(ING[k].ang, 82);
        const [mx, my] = pos(ING[k].ang + 6, (RI + 82) / 2);
        out += `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${RED}" stroke-width="2" marker-end="url(#${P}ar)"/>
<circle cx="${mx}" cy="${my}" r="10" fill="${RED}"/><text x="${mx}" y="${my + 4}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="${PAPER}">${i + 1}</text>`;
      });
      // ingredients around the ring
      const sapP = pos(-90);
      out += `<g transform="translate(${sapP[0]} ${sapP[1]})"><circle r="19" fill="${PAPER}" stroke="${AMBER}" stroke-width="2"/>${GLYPH.sap}<text y="-26" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11" letter-spacing="2">SAP · ${S.sap}</text></g>`;
      for (const [k, v] of Object.entries(ING)) {
        const [x, y] = pos(v.ang);
        const cs = Math.cos(v.ang * Math.PI / 180), sn = Math.sin(v.ang * Math.PI / 180);
        const lx = x + cs * 26, ly = y + sn * 32 + 4, anchor = cs > 0.3 ? "start" : cs < -0.3 ? "end" : "middle";
        const used = S.order.includes(k);
        out += `<g class="${v.open ? P + "hot" : ""}" data-ing="${k}" tabindex="${v.open ? 0 : -1}" role="${v.open ? "button" : "img"}" aria-label="${v.name}${v.open ? "" : ", not in season"}" transform="translate(${x} ${y})" opacity="${v.open ? 1 : 0.35}">
<circle class="${P}ring" r="19" fill="${used ? GOLD : PAPER}" stroke="${INK}" stroke-width="1.4"/>${GLYPH[k]}</g>
<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="ui-monospace,monospace" font-size="10.5" letter-spacing="1.5" opacity="${v.open ? 1 : 0.45}">${v.name.toUpperCase()}</text>${v.open ? "" : `<text x="${lx}" y="${ly + 12}" text-anchor="${anchor}" font-family="ui-monospace,monospace" font-size="9" opacity=".45">${v.when}</text>`}`;
      }
      // the pot
      const fillCol = S.last ? (S.last.recipe ? CAT_COL[S.last.recipe.cat] : S.last.crumbly ? GREY : AMBER) : AMBER;
      out += `<g transform="translate(${CX} ${CY})">
<path d="M-62 -18 Q-66 64 0 70 Q66 64 62 -18Z" fill="#5a3d2b" stroke="${INK}" stroke-width="2"/>
<ellipse cy="-18" rx="62" ry="15" fill="${fillCol}" stroke="${INK}" stroke-width="2"/>
<ellipse cy="-21" rx="40" ry="6" fill="#fff6dc" opacity=".35"/></g>`;
      // the paddle (stirs)
      out += `<g class="${P}hot" data-a="stir" tabindex="0" role="button" aria-label="Stir, ${S.stirs} stirs">
<rect x="${CX + 14}" y="${CY - 112}" width="88" height="108" fill="transparent"/>
<circle class="${P}ring" cx="${CX + 80}" cy="${CY - 80}" r="23" fill="${PAPER}" stroke="${INK}" stroke-width="1.2" opacity=".9"/>
<line x1="${CX + 18}" y1="${CY - 10}" x2="${CX + 96}" y2="${CY - 96}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
<text x="${CX + 112}" y="${CY - 26}" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11">STIRS ${S.stirs}</text>
<g transform="translate(${CX + 90} ${CY - 18})">${Array.from({ length: S.stirs }, (_, i) => `<line x1="${i * 7}" y1="0" x2="${i * 7 + 4}" y2="14" stroke="${RED}" stroke-width="2.4"/>`).join("")}</g></g>`;
      // heat: a fire triangle with 1–3 marks
      const lv = { low: 1, middle: 2, high: 3 }[S.heat];
      out += `<g class="${P}hot" data-a="heat" tabindex="0" role="button" aria-label="Heat: ${S.heat}" transform="translate(${CX} ${CY + 108})">
<circle class="${P}ring" r="27" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
<path d="M0 -18 L18 14 L-18 14Z" fill="${["", "#f0c050", "#e8742a", "#b8402a"][lv]}" stroke="${INK}" stroke-width="1.6"/>
<text y="10" text-anchor="middle" font-family="IM Fell English,serif" font-size="13" fill="${PAPER}">${"I".repeat(lv)}</text>
<text y="42" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11">HEAT · ${S.heat.toUpperCase()}</text></g>`;
      // boil: hourglass
      const long = S.boil === "long";
      out += `<g class="${P}hot" data-a="boil" tabindex="0" role="button" aria-label="Boil: ${S.boil}" transform="translate(${CX - 102} ${CY + 20})">
<circle class="${P}ring" r="27" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
<path d="M-11 -18 H11 L0 0 L11 18 H-11 L0 0Z" fill="none" stroke="${INK}" stroke-width="1.8"/>
<path d="${long ? "M-7 13 H7 L0 4Z M-3 -14 H3 L0 -10Z" : "M-8 -15 H8 L0 -3Z M-4 15 H4 L0 11Z"}" fill="${AMBER}"/>
<text y="44" text-anchor="middle" font-family="ui-monospace,monospace" font-size="11">${S.boil.toUpperCase()}</text></g>`;
      // outcome flasks, with arrows from the pot
      [["food", 140], ["sealant", 300], ["offering", 460]].forEach(([cat, x]) => {
        const n = S.pots.filter((p) => p.recipe && p.recipe.cat === cat).length + (cat === "food" ? S.pots.filter((p) => !p.recipe).length : 0);
        const lit = n > 0;
        out += `<path d="M${CX + (x - CX) * 0.25} ${CY + 76} L${x} ${520}" stroke="${INK}" stroke-width="1" marker-end="url(#${P}ai)" opacity=".6"/>
<g transform="translate(${x} 548)"><path d="M-8 -26 V-12 Q-26 -2 -22 14 Q-18 24 0 24 Q18 24 22 14 Q26 -2 8 -12 V-26Z" fill="${lit ? CAT_COL[cat] : "url(#" + P + "hatch)"}" stroke="${INK}" stroke-width="1.6"/>
<text y="44" text-anchor="middle" font-family="ui-monospace,monospace" font-size="10" letter-spacing="2">${cat.toUpperCase()}${n ? " ×" + n : ""}</text></g>`;
      });
      svg.innerHTML = out;
      svg.querySelectorAll("." + P + "hot").forEach((el) => {
        const act = () => {
          if (S.over) return;
          const ing = el.dataset.ing, a = el.dataset.a;
          if (ing) { const i = S.order.indexOf(ing); if (i >= 0) S.order.splice(i, 1); else if (S.order.length < 3) S.order.push(ing); else S.word = "Three is all the pot will take."; }
          if (a === "stir") S.stirs = (S.stirs + 1) % 7;
          if (a === "heat") S.heat = { low: "middle", middle: "high", high: "low" }[S.heat];
          if (a === "boil") S.boil = S.boil === "short" ? "long" : "short";
          refresh();
          const again = svg.querySelector(ing ? `[data-ing="${ing}"]` : `[data-a="${a}"]`); again && again.focus();
        };
        el.addEventListener("click", act);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      });
    }

    function sideboard() {
      tbl.innerHTML = `<b></b><b>SHORT</b><b>LONG</b>` + ["low", "middle", "high"].map((h) => `<b>${h.toUpperCase()}</b>` + ["short", "long"].map((b) => {
        const k = h + "/" + b, cur = S.heat === h && S.boil === b;
        return `<span class="${cur ? P + "lit" : ""}">${S.seen[k] ? THICK[h][b] : "?"}</span>`;
      }).join("")).join("");
      book.innerHTML = RECIPES.map((r) => {
        if (!r.open) return `<div class="${P}ent ${P}locked"><small>${r.n}</small><i>${r.when}</i></div>`;
        if (S.found.has(r.n)) return `<div class="${P}ent ${P}got" style="--c:${CAT_COL[r.cat]}"><small>${r.n}</small>${r.name}<i>${r.eff}</i></div>`;
        return `<div class="${P}ent"><small>${r.n}</small><i>“${r.hint}”</i></div>`;
      }).join("");
      cookBtn.disabled = S.sap < 10 || S.over;
    }
    function refresh() { draw(); sideboard(); }

    function word(pot) {
      if (pot.crumbly) return "gritty";
      if (pot.ing.includes("pollen") && pot.ing.includes("honeydew") && pot.thick === "runny") return "gold";
      if (pot.ing.includes("pollen")) return "sweet";
      if (pot.stirs === "frothy") return "frothy";
      return { runny: "thin", syrup: "sticky", glue: "tacky", hard: "keeps" }[pot.thick];
    }
    function cook() {
      if (S.over || S.sap < 10) return;
      S.sap -= 10;
      const thick = THICK[S.heat][S.boil];
      S.seen[S.heat + "/" + S.boil] = true;
      const stirs = S.stirs <= 2 ? "clear" : S.stirs <= 4 ? "smooth" : "frothy";
      const crumbly = thick === "glue" && stirs === "frothy";
      const pot = { thick, stirs, ing: S.order.slice(), crumbly };
      const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
      pot.recipe = crumbly ? null : RECIPES.find((r) => r.open && r.thick === thick && r.stirs === stirs && same(r.ing, pot.ing)) || null;
      S.pots.push(pot); S.last = pot;
      let line = "", sub = "";
      if (pot.recipe) {
        const fresh = !S.found.has(pot.recipe.n);
        S.found.add(pot.recipe.n); S.misses = 0;
        line = `“${word(pot)}.”`;
        sub = `${fresh ? "Into the book: " : "Again: "}${pot.recipe.name}. ${pot.recipe.eff}.`;
        if (pot.recipe.cat === "food") S.food += parseInt(pot.recipe.eff.match(/\d+/)[0], 10);
        if (pot.recipe.n === 3) S.morale += 2;
        if (pot.recipe.cat === "offering") S.knot += 3;
      } else {
        S.misses++;
        line = `“${word(pot)}.”`;
        sub = crumbly ? "Froth ruins glue: it crumbles. A failed pot." : `${cap(thick)}, ${stirs}. Edible, just: food +2.`;
        if (!crumbly) S.food += 2;
        if (S.misses >= 3) {
          const near = RECIPES.find((r) => r.open && !S.found.has(r.n));
          if (near) sub += ` Resin, not looking up: “That one wants to be ${near.thick === "hard" ? "hard" : near.thick}.”`;
        }
      }
      S.word = ""; S.order = []; S.stirs = 0;
      say.innerHTML = `${line}<small>${sub}</small>`;
      refresh();
      if (S.found.size >= 3) finish(true);
      else if (S.sap < 10) finish(false);
    }
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    function finish(won, closed) {
      if (S.over) return;
      S.over = true; sideboard();
      const names = RECIPES.filter((r) => S.found.has(r.n)).map((r) => r.name).join(", ") || "none";
      const tally = `Found: ${names}. Food +${S.food}${S.knot ? ", Knot +" + S.knot : ""}${S.morale ? ", morale +" + S.morale : ""}; ${S.sap} sap left in the jar.`;
      api.store.set("found", [...S.found]);
      timers.push(setTimeout(() => api.end(won
        ? { outcome: "win", text: `Three recipes in Old Resin's book. She closes it with her ladle. ${tally}` }
        : { outcome: "lose", text: `${closed ? "You close the book" : "The sap jar is empty"} with ${S.found.size} of 3 recipes found. ${tally}` }), 900));
    }
    on(cookBtn, "click", cook);
    on(wrap.querySelector("[data-a=clear]"), "click", () => { S.order = []; refresh(); });
    on(wrap.querySelector("[data-a=close]"), "click", () => finish(S.found.size >= 3, true));
    on(window, "keydown", (e) => {
      if (S.over || wrap.querySelector("." + P + "intro")) return;
      const k = e.key.toLowerCase();
      if (k === "c" && !e.repeat) cook();
    });
    const startBtn = wrap.querySelector(`.${P}intro .${P}btn`);
    on(startBtn, "click", () => { wrap.querySelector("." + P + "intro").remove(); say.innerHTML = `“Sap first. Always sap.”<small>Old Resin stirs an empty pot. Set the fire, the glass and the paddle.</small>`; svg.querySelector("[data-a=heat]").focus(); });
    startBtn.focus();
    refresh();

    return { unmount() { timers.forEach(clearTimeout); offs.forEach((f) => f()); wrap.remove(); } };
  },
};

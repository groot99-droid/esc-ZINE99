// Dr. Tox: Fall, 1D game: Composite (DESIGN.md section 11, `g1_composite`; scenes s1_composite_1 and s1_composite_2).
// Identikit acetate overlays: line-drawn feature strips on stacked clear acetate, a light box, typed witness cards,
// grease-pencil witness numbers in red, and the one strip that does not fit (printed askew, with a red question mark).
//
// The player builds the form the Toxin State took from what witnesses say they saw. The bible's constants are printed
// on the base and never chosen ("Pale skin, stretched taut", "Thick blackened veins", "Eyes fully consumed by sickly
// luminous green", "Distended jaw", "Mass pulled from internal reserves"; Part VI, Dr. Tox section 3). The rest is built
// region by region from a stack of strips. Tap a witness to hear the account (their numbers then appear in grease pencil
// on every strip they describe); tap a strip, or drag it with a mouse, onto the light box; pin.
// A strip is SUPPORTED when at least two witnesses with line of sight to its region describe it. AWED strips (a halo,
// wings, a light) are described only by a witness who could not see; TERRIFIED strips (horns, a tail) by one who could
// and was afraid. Reconstructed = every region supported and no awed strip pinned. There is no failure: the page ends
// `win` when reconstructed and `done` otherwise, and says what was pinned.
//
// Page 1 (s1_composite_1, under the freeway, the raid): four regions (head, shoulders, arms, back), six witnesses.
// Page 2 (s1_composite_2, the gala, only after the State fired): five regions (adds gait), four witnesses who will not
// testify in public, no awed strips but two terrified ones.
//
// Shared flags (data/flags.json): reads self, following, toxin_events, composite.reconstructed, composite.awed;
// writes toxin_events (a ledger entry for this scene's chapter, or marks the entry the crowd thread already wrote as
// reconstructed), composite.reconstructed (+1), composite.awed (+ awed strips pinned), cult.icon (two or more awed strips),
// following (+5 per awed strip), self (-10 if reconstructed, else -15; if the crowd thread already took 15 at the gala, the
// 5 is given back). A replay undoes this page's earlier write first, so nothing is counted twice.
//
// Art (api.art, ASSET_MAP.md "Composite"): composite-lightbox, composite-base, composite-strip-<region>-<name> (twelve),
// composite-witness-<key> (ten), composite-map-freeway, composite-map-gala, composite-pin. Every id falls back to a
// drawing made here when the bundle lacks it.
//
// Added for the game (not in DESIGN.md; the author approves or strikes): every witness's account (the words, not the
// facts: only Yusuf's "I saw a light come out of him." is quoted, from DESIGN.md), which regions each had line of sight
// to and which strip each describes (chosen so that each supported strip has two or three, each awed or terrified strip
// one, and Sato, the one at the front and the most afraid, says "too high" against the others' scab plating); that
// numbers appear on strips only after the witness has been heard; the verdict wording; the how-to.

const P = "dtf-co-";
const INK = "#2a3340", ACET = "#7d9aa6", GREASE = "#b03030", ROOM = "#cfd3cd", PAPER = "#fbfbf6", GLOW = "#f4f7f1", AMBER = "#D99A2B";
const MONO = "'IBM Plex Mono','Courier New',Courier,monospace";
const HAND = "'Segoe Print','Bradley Hand','Comic Sans MS','Marker Felt',cursive";

const REG = { head: [10, 200], shoulders: [160, 340], arms: [230, 580], back: [220, 520], gait: [500, 790] };
const STRIPS = {
  "head-sunk":      { region: "head",      kind: "plain",     label: "Head sunk between the shoulders" },
  "head-halo":      { region: "head",      kind: "awed",      label: "A halo" },
  "head-horns":     { region: "head",      kind: "terrified", label: "Horns" },
  "shoulders-high": { region: "shoulders", kind: "plain",     label: "Shoulders too high" },
  "shoulders-plate":{ region: "shoulders", kind: "plain",     label: "Scab plating" },
  "arms-joint":     { region: "arms",      kind: "plain",     label: "A joint too many" },
  "arms-reach":     { region: "arms",      kind: "plain",     label: "Reach" },
  "arms-wings":     { region: "arms",      kind: "awed",      label: "Wings" },
  "back-ridge":     { region: "back",      kind: "plain",     label: "The spine pulled into a ridge" },
  "back-light":     { region: "back",      kind: "awed",      label: "A light coming out of him" },
  "gait-long":      { region: "gait",      kind: "plain",     label: "Low and long" },
  "gait-tail":      { region: "gait",      kind: "terrified", label: "A tail" },
};
const RLAB = { head: "Head and jaw", shoulders: "Shoulders", arms: "Arms", back: "Back", gait: "Gait" };

const PAGES = {
  1: {
    scene: "s1_composite_1", chapter: "c5_freeway", trigger: "scripted", title: "Under the freeway", sub: "The raid, as the settlement saw it",
    form: "Overlapping hardened scab plating across chest, shoulders, forearms",
    map: "composite-map-freeway", stood: [190, 140],
    regions: ["head", "shoulders", "arms", "back"],
    pool: ["head-sunk", "head-halo", "shoulders-plate", "shoulders-high", "arms-joint", "arms-reach", "arms-wings", "back-ridge", "back-light"],
    witnesses: [
      { k: "mercy", n: 1, name: "Mercy Abiodun", where: "at the drums", pos: [176, 182], saw: ["head", "shoulders", "back"],
        says: { head: "head-sunk", shoulders: "shoulders-plate", back: "back-ridge" },
        text: "I was at the drums, so I had him side-on. His head went down between his shoulders, like a man walking into rain. Over the top of him it had grown hard, in layers, the way a scab does. Down his back the spine stood up in a ridge. I kept the drums going. I don't know why." },
      { k: "wren", n: 2, name: "Wren Halloran", where: "at the shelter door", pos: [125, 145], saw: ["shoulders", "arms", "back"],
        says: { arms: "arms-joint", back: "back-ridge" },
        text: "From the door I saw his arms. They hung wrong. Every one had a bend more than it should. And down his back, a ridge, like the keel of a boat turned over. I did not look at his face. I looked at his hands." },
      { k: "bashir", n: 3, name: "Bashir Kade", where: "under the span", pos: [150, 46], saw: ["head", "shoulders", "arms"],
        says: { head: "head-sunk", arms: "arms-joint" },
        text: "The light under the span is bad. His head was sunk, no neck at all. The arms: a joint too many, I'd swear to that. I will sleep tonight, whatever it was, because it went toward the trucks and not toward us." },
      { k: "dov", n: 4, name: "Dov Ashkenazi", where: "at the generator", pos: [333, 92], saw: ["shoulders", "arms", "back"],
        says: { shoulders: "shoulders-plate", back: "back-ridge" },
        text: "The generator coughed and the floodlights caught him. Plates on the shoulders, grown over each other like roof tiles that had been in a fire. The spine up in a ridge. I told myself it was the light. It was not the light." },
      { k: "sato", n: 5, name: "Ren Sato", where: "from the truck, at the front", pos: [210, 108], saw: ["head", "shoulders", "arms"],
        says: { head: "head-sunk", shoulders: "shoulders-high", arms: "arms-joint" },
        text: "I was at the front, from the truck, and I'll tell you what I saw because nobody else was where I was. It looked at us. Head down, sunk between the shoulders. The shoulders up around where its ears should be, huge, too high. Arms with joints that were not joints. I got up. I can't tell you how." },
      { k: "yusuf", n: 6, name: "Yusuf Demir", where: "behind the laundry; saw a light", pos: [70, 196], saw: [],
        says: { head: "head-halo", arms: "arms-wings", back: "back-light" },
        text: "I was behind the laundry lines. I couldn't see him. I saw a light come out of him. A ring over his head, like the lamps at the rite. And spread out behind him, wide as the span. Wings. I'm not saying wings. I'm saying wide." },
    ],
  },
  2: {
    scene: "s1_composite_2", chapter: "c11_clean_air", trigger: "pulse", title: "The gala", sub: "From people who will not testify",
    form: "Reach: everything longer than it should be",
    map: "composite-map-gala", stood: [200, 50],
    regions: ["head", "shoulders", "arms", "back", "gait"],
    pool: ["head-sunk", "head-horns", "shoulders-high", "shoulders-plate", "arms-joint", "arms-reach", "back-ridge", "gait-long", "gait-tail"],
    witnesses: [
      { k: "ama", n: 1, name: "Ama Owusu", where: "at the service door", pos: [28, 116], saw: ["head", "arms", "gait"],
        says: { head: "head-sunk", arms: "arms-reach", gait: "gait-long" },
        text: "I won't say this in a room with a microphone in it. From the service door I saw him on the floor. Head down, sunk. The arms reached. Longer than the sleeves, longer than an arm is. And he came across the floor low." },
      { k: "lev", n: 2, name: "Lev Brandt", where: "in the corridor", pos: [46, 160], saw: ["shoulders", "arms", "gait"],
        says: { shoulders: "shoulders-high", arms: "arms-reach", gait: "gait-tail" },
        text: "The corridor door was open a hand's width. Shoulders up, above where a person's go. Arms that long. And behind him something dragging: a tail, I'd have said. I've thought about it since and I'm less sure than I was." },
      { k: "corinne", n: 3, name: "Corinne Vale", where: "at her table", pos: [250, 110], saw: ["head", "shoulders", "arms", "back"],
        says: { head: "head-horns", shoulders: "shoulders-high", arms: "arms-reach", back: "back-ridge" },
        text: "I'll sign nothing. I was at my table. Horns, I thought: two of them on his head, against the light. His shoulders were high, and his arms went on past where arms stop. His back was a ridge, like a cord pulled tight." },
      { k: "desmond", n: 4, name: "Desmond Achebe", where: "at the balcony post", pos: [318, 46], saw: ["head", "shoulders", "back", "gait"],
        says: { head: "head-sunk", shoulders: "shoulders-high", back: "back-ridge", gait: "gait-long" },
        text: "I had the balcony post, so I had him from above, and from above you can see the head. It was down. No horns. The shoulders were high. The back was a ridge. He crossed the floor long and low, the length of a man laid down. I wrote it all down. Nobody has asked me for it." },
    ],
  },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sid = (key) => "composite-strip-" + key;

// ---- the rules, kept free of the DOM so they can be read on their own ---------------------------------------
function describers(pg, strip) { return pg.witnesses.filter((w) => w.says[STRIPS[strip].region] === strip); }
function sighted(pg, strip) { return describers(pg, strip).filter((w) => w.saw.includes(STRIPS[strip].region)); }
const supported = (pg, strip) => sighted(pg, strip).length >= 2;
function verdict(pg, placed) {
  const rs = pg.regions;
  const nSup = rs.filter((r) => placed[r] && supported(pg, placed[r])).length;
  const awed = rs.filter((r) => placed[r] && STRIPS[placed[r]].kind === "awed").length;
  const terr = rs.filter((r) => placed[r] && STRIPS[placed[r]].kind === "terrified").length;
  return { nSup, awed, terr, rec: nSup === rs.length && awed === 0 };
}

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
    let dead = false, ro = null, ghost = null;
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch (_) { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch (_) { /* storage off */ } };
    const num = (k, d) => { const v = sget(k, d); return typeof v === "number" && isFinite(v) ? v : d; };

    // ---- state ----------------------------------------------------------------------------------------
    let pageNo = 1, pg = PAGES[1], chosenPage = 1;
    let mode = "intro";                 // intro | play | done
    let heard = new Set(), placed = {}, sel = null, say = "", focusKey = null, narrow = false, lastPlaced = null;
    const startPage = (n) => {
      pageNo = n; pg = PAGES[n]; chosenPage = n; heard = new Set(); placed = {}; sel = null; lastPlaced = null;
      say = "The light box is empty but for the base. Tap a witness.";
      mode = "play"; ov.hidden = true; render();
    };

    // ---- DOM ------------------------------------------------------------------------------------------
    const wrap = document.createElement("div"); wrap.className = P + "wrap" + (RM ? " rm" : "");
    const css = document.createElement("style");
    css.textContent = `
.${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:${ROOM};color:${INK};font:13px/1.35 ${MONO};user-select:none;-webkit-user-select:none;overflow:hidden}
.${P}wrap *{box-sizing:border-box}
.${P}bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.55;pointer-events:none}
.${P}wrap button{font:inherit;color:inherit;cursor:pointer}
.${P}wrap button:focus-visible{outline:3px solid ${AMBER};outline-offset:2px}
.${P}top{position:relative;z-index:3;flex:0 0 auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 12px;background:${PAPER};border-bottom:3px solid ${INK}}
.${P}top b{font-size:15px;letter-spacing:.08em;text-transform:uppercase}
.${P}top .sp{flex:1}
.${P}top .st{font-size:12px}
.${P}btn{background:${PAPER};border:2px solid ${INK};border-radius:3px;padding:5px 10px;font-weight:600}
.${P}btn.pin{display:flex;align-items:center;gap:6px;background:#fff;border-color:${GREASE};color:${GREASE}}
.${P}btn.pin img{width:26px;height:26px;display:block}
.${P}btn:hover{background:#fff}
.${P}main{position:relative;z-index:1;flex:1 1 auto;min-height:0;display:grid;grid-template-columns:1fr minmax(250px,390px) 1fr;grid-template-rows:minmax(0,1fr);gap:10px;padding:10px 12px 6px}
.${P}wrap.narrow .${P}main{display:block;overflow-y:auto;overflow-x:hidden}
.${P}col{display:flex;flex-direction:column;gap:8px;min-height:0;overflow-y:auto;overflow-x:hidden;padding:2px}
.${P}ctr{display:flex;flex-direction:column;gap:6px;min-height:0;align-items:center}
.${P}winw{flex:1 1 auto;min-height:0;width:100%;display:flex;justify-content:center}
.${P}win{position:relative;height:100%;aspect-ratio:3/4;max-width:100%;background:radial-gradient(ellipse at 50% 40%,#fff 0%,${GLOW} 60%,#e1e8df 100%);border:3px solid ${INK};border-radius:4px;box-shadow:0 0 0 6px rgba(255,255,255,.35),0 0 30px rgba(255,255,255,.7);overflow:hidden}
.${P}wrap.narrow .${P}winw{height:min(52vh,380px);flex:none}
.${P}win>img,.${P}win>.fb{position:absolute;left:0;width:100%;display:block;pointer-events:none}
.${P}win>img.base{top:0;height:100%}
.${P}win .lay{position:absolute;inset:0;pointer-events:none}
.${P}win .lay img{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}win .lay.new img,.${P}win .lay.new .fb{animation:${P}drop .35s ease-out}
.${P}wrap.rm .${P}win .lay.new img,.${P}wrap.rm .${P}win .lay.new .fb{animation:none}
@keyframes ${P}drop{from{transform:translateY(-14px);opacity:0}to{transform:none;opacity:1}}
.${P}fb{position:absolute;left:4%;right:4%;border:2px dashed ${ACET};background:rgba(125,154,166,.12);font-size:11px;padding:2px 6px;color:${INK}}
.${P}fig{position:absolute;inset:0;width:100%;height:100%}
.${P}num{position:absolute;right:5%;font:700 14px/1 ${HAND};color:${GREASE};letter-spacing:.06em;transform:rotate(-4deg);text-shadow:0 0 2px #fff}
.${P}win.drop{outline:4px dashed ${AMBER};outline-offset:-4px}
.${P}stamp{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-10deg);border:4px solid ${GREASE};color:${GREASE};font:700 30px/1 ${MONO};letter-spacing:.14em;padding:8px 16px;background:rgba(255,255,255,.7);text-align:center;pointer-events:none}
.${P}chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;width:100%}
.${P}chip{border:1.5px solid ${INK};background:${PAPER};padding:1px 6px;font-size:11px;border-radius:2px;white-space:nowrap}
.${P}chip.ok{background:#fff;border-color:${INK};font-weight:700}
.${P}chip.ok::before{content:"\\2713 "}
.${P}chip.no{border-style:dashed;color:${GREASE};border-color:${GREASE}}
.${P}chip.none{opacity:.6}
.${P}says{width:100%;background:${PAPER};border:2px solid ${INK};padding:6px 9px;font-size:12px;max-height:150px;overflow-y:auto;box-shadow:3px 3px 0 rgba(42,51,64,.25)}
.${P}says h4{margin:0 0 3px;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.${P}says p{margin:0 0 3px}
.${P}says .tag{color:#555;font-size:11px}
.${P}wrap.narrow .${P}says{max-height:none;margin:8px 0}
.${P}drawer{background:rgba(251,251,246,.9);border:2px solid ${INK};padding:4px 6px 6px;border-radius:3px}
.${P}drawer h5{margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:space-between;gap:6px}
.${P}drawer h5 i{font-style:normal;color:${ACET};font-weight:400;letter-spacing:0;text-transform:none}
.${P}thumbs{display:flex;gap:6px;flex-wrap:wrap}
.${P}th{position:relative;width:74px;flex:0 0 auto;background:${PAPER};border:2px solid ${ACET};border-radius:3px;padding:2px 2px 3px;text-align:center;font-size:10px;line-height:1.15;touch-action:pan-y}
.${P}th .pv{position:relative;display:block;aspect-ratio:3/4;background:${GLOW};overflow:hidden;margin-bottom:2px}
.${P}th .pv img{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.${P}th .pv img.b{opacity:.35}
.${P}th .pv .fb{left:2px;right:2px;font-size:9px;padding:0 2px;border-width:1px}
.${P}th .num{font-size:11px}
.${P}th[aria-pressed=true]{border-color:${AMBER};box-shadow:0 0 0 2px ${AMBER}}
.${P}th.gone{opacity:.45}
.${P}mapbox{background:rgba(251,251,246,.9);border:2px solid ${INK};padding:4px 6px 6px;border-radius:3px}
.${P}mapbox h5{margin:0 0 3px;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.${P}map{position:relative;width:100%;max-width:230px;aspect-ratio:3/2;margin:0 auto;background:#f5f7f2;border:1px solid ${ACET}}
.${P}map>img,.${P}map>svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.${P}rail{position:relative;z-index:2;flex:0 0 auto;display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:5px 12px 6px;background:rgba(251,251,246,.75);border-top:3px solid ${INK}}
.${P}wrap.narrow .${P}rail{border-top:0;border-bottom:2px solid ${INK};background:rgba(251,251,246,.9)}
.${P}wc{position:relative;flex:0 0 auto;width:132px;padding:0;background:none;border:2px solid transparent;border-radius:4px;text-align:left}
.${P}wc .cd{display:block;width:100%;aspect-ratio:256/160;background:${PAPER};box-shadow:0 2px 0 rgba(42,51,64,.35);overflow:hidden;position:relative}
.${P}wc .cd img{width:100%;height:100%;display:block;pointer-events:none}
.${P}wc .cd .tx{position:absolute;inset:0;padding:6px 8px;font-size:11px}
.${P}wc .cd .tx b{display:inline-block;width:24px;height:24px;border:2px solid ${GREASE};border-radius:50%;color:${GREASE};text-align:center;line-height:20px;font:700 14px/20px ${HAND};margin-right:5px}
.${P}wc[aria-pressed=true]{border-color:${AMBER}}
.${P}wc .hd{position:absolute;right:4px;bottom:4px;background:${GREASE};color:#fff;font-size:9px;padding:0 4px;border-radius:2px;letter-spacing:.06em}
.${P}wc .lg{display:block;font-size:10px;line-height:1.1;padding:2px 2px 0;opacity:.8}
.${P}ov{position:absolute;inset:0;z-index:20;background:rgba(42,51,64,.66);display:flex;align-items:center;justify-content:center;padding:10px;overflow-y:auto}
.${P}ov[hidden]{display:none}
.${P}card{position:relative;width:min(560px,100%);max-height:100%;overflow-y:auto;background:${PAPER};border:3px solid ${INK};padding:14px 16px 14px;box-shadow:6px 6px 0 rgba(0,0,0,.3)}
.${P}card h2{margin:2px 0 6px;font-size:20px;letter-spacing:.04em;text-transform:uppercase}
.${P}card .kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${GREASE}}
.${P}card p{margin:0 0 8px}
.${P}card ul{margin:0 0 8px;padding:0;list-style:none}
.${P}card li{display:flex;gap:8px;margin-bottom:5px}
.${P}card li b{flex:0 0 74px}
.${P}seq{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 10px}
.${P}seq button{flex:1 1 180px;text-align:left;padding:6px 8px;border:2px solid ${INK};background:#fff}
.${P}seq button small{display:block;font-size:11px;opacity:.75}
.${P}seq button[aria-pressed=true]{background:${INK};color:#fff}
.${P}go{width:100%;padding:9px;background:${INK};color:#fff!important;border:0;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
`;
    const bg = document.createElement("div"); bg.className = P + "bg";
    const bgu = A("composite-lightbox"); if (bgu) bg.style.backgroundImage = `url("${bgu}")`;
    const top = document.createElement("div"); top.className = P + "top";
    const main = document.createElement("div"); main.className = P + "main";
    const rail = document.createElement("div"); rail.className = P + "rail";
    const ov = document.createElement("div"); ov.className = P + "ov"; ov.hidden = true;
    ov.setAttribute("aria-live", "polite");
    wrap.append(css, bg, top, main, rail, ov);
    root.appendChild(wrap);

    // ---- drawing helpers ------------------------------------------------------------------------------
    const figure = () => `<svg class="${P}fig" viewBox="0 0 600 800" aria-hidden="true"><g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round">
<path d="M300,60 C335,60 350,95 346,130 C342,165 325,190 300,200 C275,190 258,165 254,130 C250,95 265,60 300,60Z"/>
<path d="M254,210 C200,225 170,250 160,330 L150,540 M346,210 C400,225 430,250 440,330 L450,540"/>
<path d="M254,210 L300,230 L346,210 M300,230 L300,520 M262,520 L338,520 L330,780 M262,520 L270,780"/></g>
<g font-family="monospace" font-size="15" fill="${INK}"><text x="20" y="40">Pale skin, stretched taut</text><text x="20" y="62">Thick blackened veins</text><text x="20" y="84">Eyes consumed by luminous green</text><text x="20" y="106">Distended jaw</text><text x="20" y="128">Mass pulled from internal reserves</text></g></svg>`;
    const baseImg = () => { const u = A("composite-base"); return u ? `<img class="base" alt="" src="${u}">` : figure(); };
    const numsFor = (key) => {
      const ns = describers(pg, key).filter((w) => heard.has(w.k)).map((w) => w.n);
      return ns.length ? ns.join(" ") : "";
    };
    const tabNum = (key) => { const t = numsFor(key); return t ? `<span class="${P}num" style="top:${(REG[STRIPS[key].region][0] / 8 + 1).toFixed(1)}%">${t}</span>` : ""; };
    const stripLayer = (key, isNew) => {
      const u = A(sid(key)), r = STRIPS[key].region, y = REG[r];
      const inner = u ? `<img alt="" src="${u}">` : `<div class="${P}fb" style="top:${y[0] / 8}%;height:${(y[1] - y[0]) / 8}%">${esc(STRIPS[key].label)}</div>`;
      return `<div class="lay${isNew ? " new" : ""}">${inner}${tabNum(key)}</div>`;
    };
    const thumb = (key) => {
      const u = A(sid(key)), b = A("composite-base"), r = STRIPS[key].region, y = REG[r];
      const on = placed[r] === key;
      const pv = u ? `${b ? `<img class="b" alt="" src="${b}">` : ""}<img alt="" src="${u}">`
        : `<div class="${P}fb" style="top:${y[0] / 8}%;height:${Math.max(14, (y[1] - y[0]) / 8)}%"></div>`;
      const n = numsFor(key);
      return `<button type="button" class="${P}th" data-strip="${key}" data-fk="s:${key}" aria-pressed="${on}" aria-label="${esc(STRIPS[key].label)}, ${RLAB[r]} strip${on ? ", on the light box" : ""}">
<span class="pv">${pv}${n ? `<span class="${P}num" style="top:${(y[0] / 8 + 1).toFixed(1)}%;font-size:10px">${n}</span>` : ""}</span>${esc(STRIPS[key].label)}</button>`;
    };
    const status = (r) => {
      const key = placed[r];
      if (!key) return `<span class="${P}chip none">${RLAB[r]}: empty</span>`;
      const sight = sighted(pg, key).filter((w) => heard.has(w.k)).length;
      const said = describers(pg, key).filter((w) => heard.has(w.k)).length;
      if (sight >= 2) return `<span class="${P}chip ok">${RLAB[r]}: ${sight} saw it</span>`;
      if (said && !sight) return `<span class="${P}chip no">${RLAB[r]}: nobody who saw it</span>`;
      return `<span class="${P}chip no">${RLAB[r]}: ${sight} saw it so far</span>`;
    };
    const witnessCard = (w) => {
      const u = A("composite-witness-" + w.k), h = heard.has(w.k);
      const cd = u ? `<img alt="" src="${u}">` : `<span class="tx"><b>${w.n}</b>${esc(w.name)}<br><small>saw from ${esc(w.where)}</small></span>`;
      return `<button type="button" class="${P}wc" data-w="${w.k}" data-fk="w:${w.k}" aria-pressed="${sel === w.k}" aria-label="Witness ${w.n}, ${esc(w.name)}, ${esc(w.where)}${h ? ", heard" : ""}. Key ${w.n}.">
<span class="cd">${cd}${h ? `<span class="hd">HEARD</span>` : ""}</span><span class="lg">${w.n} · ${esc(w.name.split(" ")[0])}</span></button>`;
    };
    const mapHtml = () => {
      const u = A(pg.map), w = sel && pg.witnesses.find((x) => x.k === sel), [sx, sy] = pg.stood;
      const sv = `<svg viewBox="0 0 360 240" aria-hidden="true">${w ? `<line x1="${w.pos[0]}" y1="${w.pos[1]}" x2="${sx}" y2="${sy}" stroke="${GREASE}" stroke-width="2.5" stroke-dasharray="6 5" opacity="${w.saw.length ? 1 : .35}"/><circle cx="${w.pos[0]}" cy="${w.pos[1]}" r="17" fill="none" stroke="${AMBER}" stroke-width="4"/>` : ""}</svg>`;
      const fb = u ? `<img alt="Plan: ${esc(pg.title)}, witnesses' places numbered" src="${u}">` : `<svg viewBox="0 0 360 240" aria-hidden="true"><rect x="2" y="2" width="356" height="236" fill="none" stroke="${ACET}" stroke-width="2"/><path d="M${sx - 9},${sy - 9}L${sx + 9},${sy + 9}M${sx + 9},${sy - 9}L${sx - 9},${sy + 9}" stroke="${INK}" stroke-width="3.5"/>${pg.witnesses.map((x) => `<circle cx="${x.pos[0]}" cy="${x.pos[1]}" r="11" fill="#fff" stroke="${GREASE}" stroke-width="2.5"/><text x="${x.pos[0]}" y="${x.pos[1] + 5}" font-size="14" text-anchor="middle" fill="${GREASE}" font-weight="700">${x.n}</text>`).join("")}</svg>`;
      return `<div class="${P}mapbox"><h5>Who could see</h5><div class="${P}map">${fb}${sv}</div></div>`;
    };
    const saysHtml = () => {
      const w = sel && pg.witnesses.find((x) => x.k === sel);
      if (!w) return `<div class="${P}says"><p>${esc(say)}</p></div>`;
      const sightTxt = w.saw.length ? `Could see: ${w.saw.map((r) => RLAB[r].toLowerCase()).join(", ")}.` : "Could not see him. Saw it, they say, anyway.";
      return `<div class="${P}says"><h4>${w.n} · ${esc(w.name)}</h4><p class="tag">Saw from ${esc(w.where)}. ${sightTxt}</p><p>&ldquo;${esc(w.text)}&rdquo;</p></div>`;
    };

    function render() {
      if (dead) return;
      const done = mode === "done";
      const v = verdict(pg, placed);
      // top bar
      top.innerHTML = `<b>Composite ${pageNo}</b><span>${esc(pg.title)}</span><span class="sp"></span>
<span class="st" aria-live="polite">${heard.size} of ${pg.witnesses.length} heard · ${v.nSup} of ${pg.regions.length} regions held by two who saw</span>
<button type="button" class="${P}btn" data-act="how" data-fk="how">How</button>
<button type="button" class="${P}btn pin" data-act="pin" data-fk="pin"${done ? " disabled" : ""}>${A("composite-pin") ? `<img alt="" src="${A("composite-pin")}">` : ""}Pin it (P)</button>`;
      // light box
      const layers = pg.regions.filter((r) => placed[r]).map((r) => stripLayer(placed[r], !RM && lastPlaced === r)).join("");
      const win = `<div class="${P}winw"><div class="${P}win" data-win role="img" aria-label="The light box: the base form with ${Object.keys(placed).length} strip${Object.keys(placed).length === 1 ? "" : "s"} stacked">${baseImg()}${layers}${done ? `<div class="${P}stamp">PINNED</div>` : ""}</div></div>`;
      const chips = `<div class="${P}chips">${pg.regions.map(status).join("")}</div>`;
      const drawer = (r) => `<div class="${P}drawer"><h5>${RLAB[r]}<i>${placed[r] ? "on the box" : "pick one"}</i></h5><div class="${P}thumbs">${pg.pool.filter((k) => STRIPS[k].region === r).map(thumb).join("")}</div></div>`;
      const half = Math.ceil(pg.regions.length / 2);
      if (narrow) {
        main.innerHTML = `<div class="${P}ctr" style="align-items:stretch">${win}${chips}${saysHtml()}</div><div class="${P}col" style="overflow:visible">${pg.regions.map(drawer).join("")}${mapHtml()}</div>`;
        rail.style.order = ""; wrap.insertBefore(rail, main);
      } else {
        main.innerHTML = `<div class="${P}col">${pg.regions.slice(0, half).map(drawer).join("")}</div>
<div class="${P}ctr">${win}${chips}${saysHtml()}</div>
<div class="${P}col">${mapHtml()}${pg.regions.slice(half).map(drawer).join("")}</div>`;
        if (rail.nextSibling !== ov) wrap.insertBefore(rail, ov);
      }
      rail.innerHTML = pg.witnesses.map(witnessCard).join("");
      lastPlaced = null;
      if (focusKey) { const el = wrap.querySelector(`[data-fk="${focusKey}"]`); if (el && !el.disabled) el.focus({ preventScroll: true }); }
    }

    // ---- actions --------------------------------------------------------------------------------------
    function hear(k) {
      if (mode !== "play") return;
      const w = pg.witnesses.find((x) => x.k === k); if (!w) return;
      sel = k; heard.add(k); focusKey = "w:" + k;
      render();
    }
    function place(key) {
      if (mode !== "play") return;
      const r = STRIPS[key].region;
      if (placed[r] === key) { delete placed[r]; say = `${RLAB[r]}: the strip comes off.`; sel = null; }
      else {
        placed[r] = key; lastPlaced = r; sel = null;
        const k = STRIPS[key].kind;
        say = k === "awed" ? "It is printed askew, with a red question mark. On the box it looks like the rest."
          : k === "terrified" ? "Also printed askew. The one witness who said it was afraid." : `${RLAB[r]}: ${STRIPS[key].label.toLowerCase()}.`;
      }
      focusKey = "s:" + key; render();
    }

    function applyFlags(v, text) {
      const rec = v.rec, key = "composite.p" + pageNo;
      // undo this page's earlier write
      const prev = sget(key, null);
      let ledger = sget("toxin_events", []); ledger = Array.isArray(ledger) ? ledger.slice() : [];
      let self = num("self", 100), fol = num("following", 0), aw = num("composite.awed", 0), rc = num("composite.reconstructed", 0);
      if (prev && typeof prev === "object") {
        self = clamp(self - (prev.self || 0), 0, 100); fol = clamp(fol - (prev.fol || 0), 0, 100);
        aw = Math.max(0, aw - (prev.awed || 0)); rc = Math.max(0, rc - (prev.rec ? 1 : 0));
        if (prev.created) ledger = ledger.filter((e) => !(e && e.scene === pg.scene && e.composite));
        else { const e = ledger.find((x) => x && x.chapter === pg.chapter && x.composite === pageNo); if (e) e.reconstructed = false; }
        if (prev.icon) sset("cult.icon", false);
      }
      // the entry the crowd thread already wrote at the gala (it took 15)
      let entry = ledger.find((e) => e && e.chapter === pg.chapter && !e.composite);
      let created = false, dSelf;
      if (entry) { entry = Object.assign(entry, { form: pg.form, reconstructed: rec, composite: pageNo }); dSelf = rec ? 5 : 0; }
      else { ledger.push({ chapter: pg.chapter, scene: pg.scene, trigger: pg.trigger, form: pg.form, reconstructed: rec, composite: pageNo }); created = true; dSelf = rec ? -10 : -15; }
      const dFol = 5 * v.awed;
      self = clamp(self + dSelf, 0, 100); fol = clamp(fol + dFol, 0, 100); aw += v.awed; rc += rec ? 1 : 0;
      const icon = v.awed >= 2 && !sget("cult.icon", false);
      sset("toxin_events", ledger); sset("self", Math.round(self)); sset("following", Math.round(fol));
      sset("composite.awed", aw); sset("composite.reconstructed", Math.min(2, rc));
      if (v.awed >= 2) sset("cult.icon", true);
      sset(key, { self: dSelf, fol: dFol, awed: v.awed, rec, created, icon });
      try { store.set("last" + pageNo, { rec, awed: v.awed }); } catch (_) { /* storage off */ }
      return { dSelf, icon: v.awed >= 2 };
    }
    function pin() {
      if (mode !== "play") return;
      const v = verdict(pg, placed), n = pg.regions.length;
      const fx = applyFlags(v);
      mode = "done"; sel = null; focusKey = null;
      const cost = v.rec ? "Self takes 10, not 15." : "Self takes the full 15.";
      let text;
      if (v.rec) text = `Every region is held by two people who could see it, and nothing is on the box that nobody saw. The form is pinned as the room gave it, ${pageNo === 1 ? "plates and a ridge" : "long where it should be short"}. ${cost}`;
      else if (v.awed >= 2) text = `${v.awed} strips on the box came from people who believed more than they saw. The settlement will copy this one and pin it in the cavern hall. ${v.nSup} of ${n} regions are held by two who saw. Following +${5 * v.awed}. ${cost}`;
      else if (v.awed === 1) text = `One strip on the box came from someone who could not see him. It is pinned anyway, and some who read it will believe it. ${v.nSup} of ${n} regions are held by two who saw. Following +5. ${cost}`;
      else text = `${v.nSup} of ${n} regions are held by two who saw; the rest is a guess the page does not hide.${v.terr ? " One strip came from fear, not from sight." : ""} Pinned as it is. ${cost}`;
      say = text; render();
      later(() => { if (!dead) api.end({ outcome: v.rec ? "win" : "done", text }); }, RM ? 150 : 900);
      void fx;
    }

    // ---- input ----------------------------------------------------------------------------------------
    let drag = null, noClick = false;
    on(wrap, "click", (e) => {
      if (noClick) { noClick = false; return; }
      const t = e.target.closest && e.target.closest("button"); if (!t || !wrap.contains(t) || t.disabled) return;
      if (t.dataset.w) hear(t.dataset.w);
      else if (t.dataset.strip) place(t.dataset.strip);
      else if (t.dataset.act === "pin") pin();
      else if (t.dataset.act === "how") showIntro();
    });
    on(wrap, "pointerdown", (e) => {
      const t = e.target.closest && e.target.closest("[data-strip]");
      if (!t || e.pointerType === "touch" || e.button) return;
      drag = { key: t.dataset.strip, x: e.clientX, y: e.clientY, on: false, el: t };
    });
    on(window, "pointermove", (e) => {
      if (!drag) return;
      if (!drag.on && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
        drag.on = true;
        ghost = document.createElement("div");
        ghost.style.cssText = `position:fixed;z-index:99;width:84px;pointer-events:none;opacity:.85;background:${PAPER};border:2px solid ${AMBER};font:10px ${MONO};padding:2px;text-align:center`;
        const im = drag.el.querySelector("img:last-of-type");
        ghost.innerHTML = (im ? `<img src="${im.src}" style="width:100%;display:block;aspect-ratio:3/4">` : "") + esc(STRIPS[drag.key].label);
        document.body.appendChild(ghost);
      }
      if (drag.on && ghost) {
        ghost.style.left = e.clientX - 42 + "px"; ghost.style.top = e.clientY - 40 + "px";
        const w = wrap.querySelector("[data-win]"); if (w) { const r = w.getBoundingClientRect(); w.classList.toggle("drop", e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }
      }
    });
    on(window, "pointerup", (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      if (ghost) { ghost.remove(); ghost = null; }
      const w = wrap.querySelector("[data-win]"); if (w) w.classList.remove("drop");
      if (!d.on) return;
      noClick = true; later(() => { noClick = false; }, 60);
      if (w) { const r = w.getBoundingClientRect(); if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom && placed[STRIPS[d.key].region] !== d.key) place(d.key); }
    });
    on(window, "keydown", (e) => {
      if (dead || e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (!ov.hidden) { if (key === "escape" && mode !== "intro") { ov.hidden = true; e.preventDefault(); } return; }
      if (mode !== "play") return;
      if (/^[1-9]$/.test(key)) { const w = pg.witnesses.find((x) => x.n === +key); if (w) { hear(w.k); e.preventDefault(); } }
      else if (key === "p") { pin(); e.preventDefault(); }
      else if (key === "h") { showIntro(); e.preventDefault(); }
    });

    // ---- layout ---------------------------------------------------------------------------------------
    function fit() {
      if (dead) return;
      const nw = wrap.clientWidth < 900;
      if (nw !== narrow) { narrow = nw; wrap.classList.toggle("narrow", nw); if (mode !== "intro") render(); }
    }
    on(window, "resize", fit);
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => fit()); ro.observe(wrap); }

    // ---- intro ----------------------------------------------------------------------------------------
    function showIntro() {
      const first = mode === "intro";
      ov.hidden = false;
      ov.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play Composite">
<div class="kick">Composite · identikit acetate</div><h2>What the room saw</h2>
<p>The settlement saw the Toxin State from where it stood. Build the form from what they say: a base printed with what is always true of him, and a stack of clear strips, one region at a time. This is a reconstruction. Nothing here shows what it did.</p>
<ul>
<li><b>Hear</b><span>Tap a witness card (or press its number). Their number appears in grease pencil on every strip they describe, and the plan shows where they stood.</span></li>
<li><b>Lay</b><span>Tap a strip to put it on the light box, or drag it there with a mouse. Tap again to take it off. One strip per region.</span></li>
<li><b>Held</b><span>A strip is held when two witnesses who could see that region both describe it. A strip nobody could see is printed askew with a red question mark.</span></li>
<li><b>Pin</b><span>Pin it at any time (P). Every region held, and nothing nobody saw, is a reconstruction. There is no losing; the page records what you pinned, and what the settlement will make of it.</span></li>
</ul>
<div class="kick">Page</div><div class="${P}seq">
<button type="button" data-pg="1" aria-pressed="${chosenPage === 1}">1. Under the freeway<small>Four regions, six witnesses.</small></button>
<button type="button" data-pg="2" aria-pressed="${chosenPage === 2}">2. The gala<small>Five regions, four witnesses. Played after the State fired there.</small></button></div>
<button type="button" class="${P}go" data-go>${first ? "Open the light box" : mode === "done" ? "Close" : "Back to the box"}</button></div>`;
      ov.querySelectorAll("[data-pg]").forEach((b) => on(b, "click", () => { chosenPage = +b.dataset.pg; ov.querySelectorAll("[data-pg]").forEach((x) => x.setAttribute("aria-pressed", String(+x.dataset.pg === chosenPage))); }));
      const go = ov.querySelector("[data-go]");
      on(go, "click", () => { if (mode === "intro" || (mode === "play" && chosenPage !== pageNo)) startPage(chosenPage); else ov.hidden = true; });
      go.focus({ preventScroll: true });
    }

    fit(); render(); showIntro();

    return {
      unmount() {
        dead = true;
        for (const [t, ev, fn, o] of listeners) t.removeEventListener(ev, fn, o);
        listeners.length = 0;
        for (const id of timers) clearTimeout(id);
        timers.clear();
        if (ghost) { ghost.remove(); ghost = null; }
        if (ro) { try { ro.disconnect(); } catch (_) { /* gone */ } }
        wrap.remove();
      },
    };
  },
};

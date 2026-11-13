// The Endless Temple / Tea Blending (1D, brewing). Style: Art nouveau apothecary labels.
// DESIGN.md section 11 (Tea Blending) and section 12 (steep). One sitting at the pantry table:
// three books in turn (the requirement cards of g_tea_c3, g_tea_c5 and g_tea_c7) from one kettle of
// six pours, then the last pot (g_tea_c8: no requirement, all eight jars; its binding is the last
// push on steep). Mint is always the base; add exactly three spoons; set the steep dial; Pour.
// Actions: spoon (a jar), return a spoon, the steep dial, Taste (three sips that show the cup's
// numbers before you pour; unlocked at the second book or after a failed pour), Pour.
// Win: the three books open (the last pot then colours the ending). Lose: the kettle runs dry.
// The source line in the how-to-play is DESIGN.md section 3 beat 10, verbatim, from
// creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md.

const SOURCE_TEA = "It was mint herbal tea with a unique herb in it that made scholars more vividly imagine, if not envision, the book they were reading so clearly it was as if they were the narrator of the book.";

const HERBS = {
  mint: { name: "Mint", d: 1, l: 1, b: 0, col: "#8fa07a" },
  sprig: { name: "Seer's sprig", d: 3, l: 0, b: 1, col: "#5f7d4e" },
  honeymoss: { name: "Honeymoss", d: 0, l: 1, b: -2, col: "#d4a23a" },
  clove: { name: "Clove-bark", d: 0, l: 3, b: 1, col: "#7a4a2a" },
  dunevine: { name: "Dune-vine pith", d: 1, l: 2, b: 0, col: "#c98a3a" },
  storm: { name: "Stormcress", d: 2, l: 0, b: -1, col: "#5d6f86" },
  ember: { name: "Ember root", d: 2, l: 1, b: 2, col: "#a8432c" },
  lampash: { name: "Lamp-ash", d: 0, l: 2, b: -1, col: "#6b6660" },
};
// Narration written for the game (not quotations). The ledger lines are the design's hint form.
const LINES = {
  open: "Morning in the pantry. Three books wait by the reading chair, and the kettle holds six pours.",
  opened: "The page opens. The tea will hold at {hold}.",
  failed: "Below the book's mark: the page stays plain text, and sand runs from the cover.",
  ring20: "The cup leaves a faint ring on the table.",
  ring40: "The ring darkens.",
  taste: "The ledger's margin, in another keeper's hand: taste before you pour. (Taste shows the cup's numbers; three sips.)",
  lastPot: "The last pot. No book asks anything of it. Whatever it binds is the last push on the steep.",
  endLight: "Three books open, and the last cup is light. Elaris sets it down when the clock coos, and the table under it is clean.",
  endEven: "Three books open. The last cup is ordinary; it will let him go when the pot is empty.",
  endHeavy: "Three books open, and the last cup is heavy with binding. The ring on the table is dark, and one more page sounds very reasonable.",
  lose: "The kettle is dry, and “{book}” stays shut. Opened {n} of 3.",
  gentle: "The kettle has been filled to the brim this time, and the ledger is a page ahead.",
};
const BOOKS = [
  { scene: "g_tea_c3", book: "The sand book, again", req: { dmin: 5, lmin: 4 }, jars: ["sprig", "honeymoss", "clove"],
    note: "A long reading of the sand sea.",
    ledger: ["For a long sand reading: clove-bark, for the length of it…", "Clove-bark, and the seer's sprig… more than once?", "Sprig, sprig, clove-bark. Mark 3."] },
  { scene: "g_tea_c5", book: "The Weather-Clerk of Hollin", req: { dmin: 5, bmax: 1 }, jars: ["sprig", "honeymoss", "clove", "dunevine"],
    note: "A book about a binding.",
    ledger: ["A book about a binding wants something to loosen the cup: honeymoss…", "Honeymoss, and a little of the sand itself (dune-vine)…", "Sprig, dune-vine, honeymoss. Mark 3."] },
  { scene: "g_tea_c7", book: "The Long Procession", req: { dmin: 6, lmin: 6, bmax: 2 }, jars: ["sprig", "honeymoss", "clove", "dunevine", "storm", "ember"],
    note: "A long road, walked by masked pilgrims.",
    ledger: ["A long road: dune-vine, and let the kettle sit a while…", "Dune-vine twice, and the sprig for depth…", "Sprig, dune-vine, dune-vine. Mark 4."] },
];
const LAST = { scene: "g_tea_c8", book: "The last pot", req: {}, jars: Object.keys(HERBS).filter((k) => k !== "mint"), note: LINES.lastPot, ledger: ["No recipe. The binding is yours to choose."] };
const DIAL = { 1: [0.5, 0], 2: [0.75, 0], 3: [1, 0], 4: [1, 1], 5: [1, 2] };
const DIAL_NOTE = { 1: "depth halved", 2: "depth ×¾", 3: "neutral", 4: "+1 length and binding", 5: "+2 length and binding" };

function brew(spoons, mark) {
  let d = HERBS.mint.d, l = HERBS.mint.l, b = HERBS.mint.b;
  for (const s of spoons) { d += HERBS[s].d; l += HERBS[s].l; b += HERBS[s].b; }
  const [f, add] = DIAL[mark];
  return { d: Math.floor(d * f), l: l + add, b: b + add };
}
function meets(r, q) {
  return (q.dmin == null || r.d >= q.dmin) && (q.lmin == null || r.l >= q.lmin) && (q.bmax == null || r.b <= q.bmax);
}
function reqText(q) {
  const p = [];
  if (q.dmin != null) p.push(`Depth ${q.dmin} or more`);
  if (q.lmin != null) p.push(`length ${q.lmin} or more`);
  if (q.bmax != null) p.push(`binding ${q.bmax} or less`);
  return p.length ? p.join("; ") : "Nothing. Choose the binding.";
}
// a label's three marks: filled bars for plus, open rings for minus (colour is never the only carrier)
function marksSvg(h) {
  const row = (lab, v, y) => {
    let s = `<text x="2" y="${y + 8}" font-size="11" font-weight="600" fill="#3a2a1c">${lab}</text>`;
    if (v === 0) s += `<line x1="16" y1="${y + 4}" x2="24" y2="${y + 4}" stroke="#3a2a1c" stroke-width="1.5"/>`;
    for (let i = 0; i < Math.abs(v); i++) {
      s += v > 0 ? `<rect x="${16 + i * 10}" y="${y}" width="8" height="8" fill="#3a2a1c"/>`
        : `<circle cx="${20 + i * 10}" cy="${y + 4}" r="3.6" fill="none" stroke="#a8432c" stroke-width="1.8"/>`;
    }
    return s;
  };
  return `<svg viewBox="0 0 48 38" width="100%" aria-hidden="true">${row("D", h.d, 1)}${row("L", h.l, 14)}${row("B", h.b, 27)}</svg>`;
}

export default {
  mount(root, api) {
    const P = "endless-temple-tea-blending-";
    const pal = { honey: "#d4a23a", sage: "#8fa07a", walnut: "#5a3d27", sepia: "#3a2a1c", cream: "#f6eedb", ochre: "#c98a3a", red: "#a8432c", green: "#3f6a32" };
    const rm = api.reducedMotion;
    const losses = api.store.get("lossStreak", 0);
    const gentle = losses >= 2;
    const POURS = gentle ? 8 : 6;
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:#e7dcc0;color:${pal.sepia};font-family:'EB Garamond',Georgia,serif;font-size:16px;
      background-image:radial-gradient(rgba(90,61,39,.08) 1px,transparent 1.3px),radial-gradient(rgba(255,255,255,.35) 1px,transparent 1.3px);background-size:6px 6px,9px 9px}
    .${P}frame{position:relative;min-height:100%;box-sizing:border-box;padding:12px 16px 120px;max-width:1180px;margin:0 auto}
    .${P}vine{position:absolute;inset:6px;pointer-events:none;width:calc(100% - 12px);height:calc(100% - 12px)}
    .${P}head{position:sticky;top:0;z-index:3;text-align:center;background:linear-gradient(#e7dcc0 80%,rgba(231,220,192,0));padding:4px 0 8px}
    .${P}head h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,32px);margin:0;letter-spacing:.04em}
    .${P}strip{display:inline-flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;align-items:center;margin-top:4px;padding:5px 16px;border:1.5px solid ${pal.walnut};border-radius:20px;background:${pal.cream};font-size:16px}
    .${P}strip i{font-style:italic}
    .${P}strip b{font-weight:600}
    .${P}books{display:inline-flex;gap:4px}
    .${P}bk{width:16px;height:20px;border:1.5px solid ${pal.walnut};border-radius:2px 4px 4px 2px;background:transparent;transition:background .4s}
    .${P}bk.${P}open{background:${pal.honey}}
    .${P}bk.${P}now{box-shadow:0 0 0 2px ${pal.honey}}
    .${P}beat{margin:6px auto 0;max-width:62ch;font-style:italic;font-size:16px;min-height:1.3em}
    .${P}grid{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,.9fr);gap:18px;margin-top:8px;align-items:start}
    @media (max-width:860px){.${P}grid{grid-template-columns:1fr}}
    .${P}panel{background:${pal.cream};border:1.5px solid ${pal.walnut};outline:1px solid ${pal.honey};outline-offset:-6px;border-radius:44px 44px 6px 6px;padding:22px 14px 14px;position:relative}
    .${P}panel h3{margin:0 0 8px;text-align:center;font-variant:small-caps;letter-spacing:.16em;font-weight:600;font-size:15px;color:${pal.walnut}}
    .${P}jars{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
    .${P}jar{font:inherit;color:inherit;cursor:pointer;background:transparent;border:0;padding:0;display:flex;flex-direction:column;align-items:center;transition:transform .15s}
    .${P}jar:hover:not(:disabled),.${P}jar:focus-visible{transform:translateY(-4px);outline:none}
    .${P}jar:disabled{opacity:.45;cursor:not-allowed}
    .${P}jar.${P}new .${P}glass{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}lid{width:46%;height:9px;background:${pal.walnut};border-radius:3px 3px 0 0}
    .${P}glass{width:88%;border:1.5px solid ${pal.sepia};border-radius:6px 6px 14px 14px;background:linear-gradient(#f6f1e2,#e2e6d6);padding:6px 4px 8px;position:relative;transition:box-shadow .15s}
    .${P}jar:hover:not(:disabled) .${P}glass,.${P}jar:focus-visible .${P}glass{box-shadow:0 0 0 3px ${pal.honey}}
    .${P}lab{background:#fbf6e8;border:1px solid ${pal.walnut};border-radius:18px 18px 3px 3px;padding:4px 3px 0;text-align:center}
    .${P}lab b{display:block;font-variant:small-caps;font-size:14px;letter-spacing:.03em;line-height:1.05;min-height:2.1em}
    .${P}fleck{height:10px;margin-top:4px;border-radius:0 0 8px 8px}
    .${P}key{font-size:14px;margin:10px 4px 0;line-height:1.35}
    .${P}cupwrap{display:flex;flex-direction:column;align-items:center;gap:10px}
    .${P}cupwrap svg{width:100%;max-width:300px}
    .${P}slots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .${P}slot{font:inherit;min-width:96px;min-height:42px;border:1.5px dashed ${pal.walnut};border-radius:20px;background:#fbf6e8;color:inherit;cursor:pointer;font-size:15px;padding:4px 10px}
    .${P}slot.${P}full{border-style:solid;background:#f1e2b8}
    .${P}slot.${P}full:hover,.${P}slot.${P}full:focus-visible{background:#f7d4c4;outline:none;text-decoration:line-through}
    .${P}dial{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap}
    .${P}dial span{font-variant:small-caps;letter-spacing:.1em;font-size:15px;margin-right:4px}
    .${P}mk{font:inherit;width:42px;height:42px;border-radius:50%;border:1.5px solid ${pal.walnut};background:#fbf6e8;color:inherit;cursor:pointer;font-weight:600;font-size:16px}
    .${P}mk:hover,.${P}mk:focus-visible{box-shadow:0 0 0 3px rgba(212,162,58,.5);outline:none}
    .${P}mk[aria-pressed=true]{background:${pal.honey};color:#2a1a0c;border-color:${pal.sepia}}
    .${P}dialnote{font-size:15px;font-style:italic;min-height:1.3em}
    .${P}acts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
    .${P}btn{font:inherit;font-variant:small-caps;letter-spacing:.12em;font-size:18px;padding:8px 24px;border-radius:24px;border:2px solid ${pal.sepia};background:${pal.walnut};color:${pal.cream};cursor:pointer}
    .${P}btn:hover:not(:disabled),.${P}btn:focus-visible{background:#7a5333;outline:2px solid ${pal.honey};outline-offset:2px}
    .${P}btn.${P}alt{background:${pal.cream};color:${pal.sepia}}
    .${P}btn:disabled{opacity:.4;cursor:not-allowed}
    .${P}btn[hidden]{display:none}
    .${P}card{background:#fbf6e8;border:1px solid ${pal.walnut};padding:10px 12px;margin-bottom:12px;border-radius:3px;font-size:16px;line-height:1.35}
    .${P}card small{display:block;font-variant:small-caps;letter-spacing:.12em;color:${pal.walnut};font-size:14px}
    .${P}card strong{font-size:18px;font-weight:600}
    .${P}card.${P}shake{animation:${P}shake .45s}
    @keyframes ${P}shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    .${P}stamp{display:inline-block;margin-top:4px;border:2px solid ${pal.green};color:${pal.green};font-variant:small-caps;letter-spacing:.2em;padding:0 8px;transform:rotate(-4deg);font-weight:600}
    .${P}ledger{font-style:italic;background:#f4ead0;border-left:3px solid ${pal.honey}}
    .${P}ok{color:${pal.green};font-weight:600}.${P}no{color:${pal.red};font-weight:600}
    .${P}kettle{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .${P}drop{width:16px;height:21px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;border:1.5px solid ${pal.walnut};background:${pal.sage};transition:background .5s,transform .5s}
    .${P}drop.${P}used{background:transparent;transform:scale(.85)}
    .${P}drop.${P}low{background:${pal.red}}
    .${P}taste{display:flex;gap:4px;align-items:center}
    .${P}taste i{width:10px;height:10px;border-radius:50%;border:1.5px solid ${pal.walnut};background:${pal.sage}}
    .${P}taste i.${P}used{background:transparent}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(58,42,28,.6);z-index:5;padding:16px;overflow:auto}
    .${P}label{position:relative;background:${pal.cream};max-width:420px;padding:34px 30px 24px;border-radius:120px 120px 10px 10px;border:2px solid ${pal.walnut};outline:1.5px solid ${pal.honey};outline-offset:-9px;text-align:center}
    .${P}label svg.${P}whip{position:absolute;left:0;top:0;width:100%;height:70px;pointer-events:none}
    .${P}label h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:6px 0 4px;font-size:30px}
    .${P}label q{display:block;font-style:italic;font-size:15px;margin:0 0 10px;quotes:none;line-height:1.35}
    .${P}label .${P}goal{margin:0 0 10px;font-size:17px;border-top:1px solid ${pal.honey};border-bottom:1px solid ${pal.honey};padding:8px 0}
    .${P}label table{margin:0 auto 14px;border-collapse:collapse;font-size:16px;text-align:left}
    .${P}label td{padding:3px 6px;vertical-align:top}
    .${P}label td:first-child{font-variant:small-caps;letter-spacing:.08em;font-weight:600;white-space:nowrap;text-align:right;color:${pal.walnut}}
    .${P}steam{position:absolute;pointer-events:none}
    @media (prefers-reduced-motion:reduce){.${P}card.${P}shake{animation:none}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}frame" tabindex="-1" style="outline:none">
        <svg class="${P}vine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 98 C2 60 6 40 3 20 C1 10 6 3 16 2 M98 98 C98 60 94 40 97 20 C99 10 94 3 84 2 M16 2 C35 6 65 -2 84 2"
            fill="none" stroke="${pal.walnut}" stroke-width=".35" vector-effect="non-scaling-stroke"/>
          <path d="M4 96 C6 70 2 50 6 30 C9 16 4 8 20 5 M96 96 C94 70 98 50 94 30 C91 16 96 8 80 5"
            fill="none" stroke="${pal.honey}" stroke-width=".25" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="${P}head"><h2>The Pantry Table</h2>
          <div class="${P}strip"><span class="${P}books" aria-label="Books opened"></span><i class="${P}bookname"></i><span>Asks: <b class="${P}req"></b></span></div>
          <p class="${P}beat" aria-live="polite"></p></div>
        <div class="${P}grid">
          <section class="${P}panel" aria-label="Jars"><h3>The Jars</h3><div class="${P}jars"></div>
            <p class="${P}key">Each label: <b>D</b>epth, <b>L</b>ength, <b>B</b>inding. A square adds one; a ring takes one away. Mint (D1 L1 B0) is already in the cup.</p></section>
          <section class="${P}panel ${P}cupwrap" aria-label="The cup">
            <h3>The Cup</h3>
            <svg viewBox="0 0 240 190" aria-hidden="true"><g class="${P}cupsvg"></g></svg>
            <div class="${P}slots"></div>
            <div class="${P}dial" role="group" aria-label="Steep dial"><span>Steep</span></div>
            <div class="${P}dialnote"></div>
            <div class="${P}acts"><button type="button" class="${P}btn ${P}alt ${P}tastebtn" hidden>Taste (A)</button><button type="button" class="${P}btn ${P}pour">Pour</button></div>
          </section>
          <section class="${P}panel" aria-label="Cards">
            <h3>The Book's Card</h3>
            <div class="${P}card ${P}reqcard"><small>Requirement</small><strong class="${P}req2"></strong><div class="${P}note" style="font-style:italic;margin-top:2px"></div></div>
            <div class="${P}card ${P}ledger"><small>The pantry ledger</small><span class="${P}led"></span></div>
            <div class="${P}card"><small>The kettle</small><div class="${P}kettle"></div></div>
            <div class="${P}card ${P}tastecard" hidden><small>Tastes left</small><div class="${P}taste"></div></div>
            <div class="${P}card ${P}result" aria-live="polite"><small>The pour</small><span class="${P}res">Nothing poured yet.</span></div>
          </section>
        </div>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let bookI = 0, spoons = [], mark = 3, poursLeft = POURS, failsHere = 0, steep = 0, over = false, busy = false;
    let tastes = 3, tasteOn = false, tasted = null, lastPot = false, pourFlash = null;
    const opened = [];
    const curBook = () => (lastPot ? LAST : BOOKS[bookI]);

    // cup drawing: the steep ring around the cup shows the dial; the stain ring under it shows steep
    const cupG = q("cupsvg");
    function drawCup(fill, color) {
      const ring = Math.min(1, steep / 60);
      const marks = [1, 2, 3, 4, 5].map((m, i) => {
        const a = Math.PI * (1.1 + i * 0.2);
        const x = 120 + 96 * Math.cos(a), y = 112 + 96 * Math.sin(a);
        const on = m === mark;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on ? 7 : 4}" fill="${on ? pal.honey : pal.walnut}"/>`;
      }).join("");
      const a = Math.PI * (1.1 + (mark - 1) * 0.2);
      const flecks = spoons.map((s, i) => `<path d="M${102 + i * 13} ${108 - (i % 2) * 4} q4 -6 8 0" stroke="${HERBS[s].col}" stroke-width="3.5" fill="none"/>`).join("");
      const steamOn = pourFlash && pourFlash.ok && performance.now() < pourFlash.until;
      cupG.innerHTML = `
        <path d="M24 112 A96 96 0 0 1 216 112" fill="none" stroke="${pal.walnut}" stroke-width="1" stroke-dasharray="2 4"/>
        <path d="M120 112 L${(120 + 80 * Math.cos(a)).toFixed(1)} ${(112 + 80 * Math.sin(a)).toFixed(1)}" stroke="${pal.honey}" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M44 150 C30 120 60 92 80 104 M196 150 C210 120 180 92 160 104" fill="none" stroke="${pal.honey}" stroke-width="1.6"/>
        ${steep >= 20 ? `<ellipse cx="120" cy="164" rx="${66 + ring * 6}" ry="${16 + ring * 2}" fill="none" stroke="#8a6230" stroke-opacity="${0.25 + ring * 0.5}" stroke-width="${1 + ring * 6}"/>` : ""}
        <ellipse cx="120" cy="160" rx="62" ry="13" fill="#fbf6e8" stroke="${pal.walnut}"/>
        <path d="M78 108 L86 154 Q120 166 154 154 L162 108 Z" fill="#fbf6e8" stroke="${pal.sepia}" stroke-width="1.5"/>
        <path d="M162 116 q22 4 10 24 q-6 6 -14 4" fill="none" stroke="${pal.sepia}" stroke-width="1.5"/>
        <ellipse cx="120" cy="108" rx="42" ry="9" fill="${color}" fill-opacity="${0.35 + 0.6 * fill}" stroke="${pal.sepia}" stroke-width="1.2"/>
        ${steamOn ? `<g stroke="${pal.walnut}" fill="none" stroke-width="1.6" opacity=".7"><path d="M105 96 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M122 94 q8 -14 0 -28 q-8 -12 0 -26"/><path d="M138 96 q-6 -10 0 -20"/></g>` : ""}
        ${pourFlash && !pourFlash.ok && performance.now() < pourFlash.until ? `<g fill="${pal.ochre}">${Array.from({ length: 16 }, (_, k) => `<circle cx="${80 + (k * 37) % 80}" cy="${170 + (k * 13) % 14}" r="1.6"/>`).join("")}</g>` : ""}
        ${flecks}${marks}`;
    }

    const jarsBox = q("jars");
    let prevJars = [];
    function buildJars() {
      jarsBox.innerHTML = "";
      const B = curBook();
      for (const id of B.jars) {
        const h = HERBS[id];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "jar" + (prevJars.length && !prevJars.includes(id) ? " " + P + "new" : "");
        b.setAttribute("aria-label", `${h.name}: depth ${h.d}, length ${h.l}, binding ${h.b}. Add a spoon.`);
        b.innerHTML = `<div class="${P}lid"></div><div class="${P}glass"><div class="${P}lab"><b>${h.name}</b>${marksSvg(h)}</div>
          <div class="${P}fleck" style="background:repeating-linear-gradient(110deg,${h.col} 0 3px,transparent 3px 7px)"></div></div>`;
        b.addEventListener("click", () => addSpoon(id));
        b.addEventListener("mousedown", (e) => e.preventDefault());   // keep keyboard focus where it was, so Enter still pours
        jarsBox.appendChild(b);
      }
      prevJars = B.jars.slice();
    }
    function addSpoon(id) { if (!over && !busy && spoons.length < 3) { spoons.push(id); tasted = null; update(); } }
    const slotsBox = q("slots");
    function drawSlots() {
      slotsBox.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const s = spoons[i];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "slot" + (s ? " " + P + "full" : "");
        b.textContent = s ? HERBS[s].name : `spoon ${i + 1}`;
        b.setAttribute("aria-label", s ? `Return ${HERBS[s].name} to its jar` : `Empty spoon ${i + 1}`);
        b.addEventListener("click", () => { if (s && !over && !busy) { spoons.splice(i, 1); tasted = null; update(); } });
        slotsBox.appendChild(b);
      }
    }
    const dial = q("dial");
    const mkBtns = [1, 2, 3, 4, 5].map((m) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "mk"; b.textContent = m;
      b.setAttribute("aria-label", `Steep mark ${m}: ${DIAL_NOTE[m]}`);
      b.addEventListener("click", () => setMark(m));
      dial.appendChild(b); return b;
    });
    function setMark(m) { if (!over && !busy) { mark = m; tasted = null; update(); } }
    const pourBtn = q("pour"), tasteBtn = q("tastebtn");
    const resEl = q("res");
    function beat(t) { q("beat").textContent = t; }

    function unlockTaste() {
      if (tasteOn) return;
      tasteOn = true; tasteBtn.hidden = false; q("tastecard").hidden = false;
      beat(LINES.taste);
    }
    function update() {
      const B = curBook();
      q("bookname").textContent = lastPot ? B.book : `${B.book} (book ${bookI + 1} of ${BOOKS.length})`;
      q("req").textContent = reqText(B.req);
      q("req2").textContent = reqText(B.req);
      q("note").textContent = B.note;
      const lead = gentle ? 2 : 0;
      q("led").textContent = B.ledger[Math.min(B.ledger.length - 1, failsHere + lead >= 4 ? 2 : failsHere + lead >= 2 ? 1 : 0)];
      q("books").innerHTML = BOOKS.map((_, i) => `<span class="${P}bk ${opened[i] ? P + "open" : ""} ${i === bookI && !lastPot ? P + "now" : ""}"></span>`).join("");
      q("kettle").innerHTML = Array.from({ length: POURS }, (_, i) => `<span class="${P}drop ${i >= poursLeft ? P + "used" : poursLeft <= 2 ? P + "low" : ""}"></span>`).join("") + `<span style="margin-left:6px">${lastPot ? "the last pot is its own" : `${poursLeft} pour${poursLeft === 1 ? "" : "s"} left`}</span>`;
      q("taste").innerHTML = [0, 1, 2].map((i) => `<i class="${i >= tastes ? P + "used" : ""}"></i>`).join("") + `<span style="margin-left:6px">${tastes} left</span>`;
      mkBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i + 1 === mark)));
      q("dialnote").textContent = `Mark ${mark}: ${DIAL_NOTE[mark]}`;
      drawSlots();
      pourBtn.disabled = spoons.length !== 3 || over || busy;
      tasteBtn.disabled = spoons.length !== 3 || over || busy || tastes <= 0 || !!tasted;
      for (const j of jarsBox.children) j.disabled = spoons.length >= 3 || over || busy;
      drawCup(spoons.length / 3, spoons.length ? HERBS[spoons[spoons.length - 1]].col : HERBS.mint.col);
      if (!busy && !over) {
        if (tasted) resEl.innerHTML = `Tasted: ${tally(tasted, B.req)}`;
        else if (spoons.length === 3) resEl.textContent = tasteOn && tastes ? "Three spoons in. Taste it, or pour." : "Three spoons in. Pour when the dial is set.";
        else resEl.textContent = `${3 - spoons.length} spoon${spoons.length === 2 ? "" : "s"} to add.`;
      }
    }
    function tally(r, req) {
      const tick = (c, s) => `<span class="${c ? P + "ok" : P + "no"}">${s} ${c ? "✓" : "✗"}</span>`;
      const parts = [];
      parts.push(req.dmin != null ? tick(r.d >= req.dmin, `Depth ${r.d}`) : `Depth ${r.d}`);
      parts.push(req.lmin != null ? tick(r.l >= req.lmin, `Length ${r.l}`) : `Length ${r.l}`);
      parts.push(req.bmax != null ? tick(r.b <= req.bmax, `Binding ${r.b}`) : `Binding ${r.b}`);
      return parts.join(" · ");
    }
    function taste() {
      if (!tasteOn || spoons.length !== 3 || over || busy || tastes <= 0 || tasted) return;
      tastes--; tasted = brew(spoons, mark); update();
    }
    function shake(c) { if (rm) return; c.classList.remove(P + "shake"); void c.offsetWidth; c.classList.add(P + "shake"); }

    function pour() {
      if (spoons.length !== 3 || over || busy) return;
      const B = curBook();
      const r = brew(spoons, mark);
      const before = steep;
      steep = Math.max(0, steep + 3 * r.b);
      if (lastPot) { finishLastPot(r); return; }
      poursLeft--;
      const ok = meets(r, B.req);
      const hold = Math.min(100, 40 + 10 * r.d);
      busy = true;
      pourFlash = { ok, until: performance.now() + (rm ? 0 : 1300) };
      if (ok) {
        opened[bookI] = true;
        resEl.innerHTML = `${tally(r, B.req)}<br>${LINES.opened.replace("{hold}", hold)} <span class="${P}stamp">opened</span>`;
      } else {
        failsHere++;
        resEl.innerHTML = `${tally(r, B.req)}<br>${LINES.failed}`;
        shake(q("reqcard"));
        if (failsHere === 1) unlockTaste();
      }
      if (before < 20 && steep >= 20) beat(LINES.ring20); else if (before < 40 && steep >= 40) beat(LINES.ring40);
      update();
      const tick = setInterval(() => drawCup(1, HERBS[spoons[2] || "mint"].col), 120);
      timers.push(setTimeout(() => {
        clearInterval(tick);
        busy = false; spoons = []; tasted = null; pourFlash = null;
        if (ok) {
          bookI++; failsHere = 0; mark = 3;
          if (bookI === 1) unlockTaste();
          if (bookI >= BOOKS.length) { lastPot = true; beat(LINES.lastPot); }
          else beat(`${BOOKS[bookI].book}: ${BOOKS[bookI].note}`);
          buildJars();
        } else if (poursLeft <= 0) {
          over = true; update();
          api.store.set("lossStreak", losses + 1);
          api.end({ outcome: "lose", text: LINES.lose.replace("{book}", BOOKS[bookI].book).replace("{n}", bookI) + " Each cup fell short of what its card asked." });
          return;
        }
        update();
      }, rm ? 300 : 1400));
      timers.push(() => clearInterval(tick));
    }
    function finishLastPot(r) {
      over = true; busy = true;
      pourFlash = { ok: true, until: performance.now() + (rm ? 0 : 1300) };
      resEl.innerHTML = `${tally(r, {})}<br>The last pot is poured.`;
      update();
      api.store.set("lossStreak", 0);
      const text = r.b <= 0 ? LINES.endLight : r.b >= 4 ? LINES.endHeavy : LINES.endEven;
      timers.push(setTimeout(() => api.end({ outcome: "win", text: `${text} (${poursLeft} pour${poursLeft === 1 ? " was" : "s were"} left in the kettle; the last cup bound ${r.b}.)` }), rm ? 300 : 1500));
    }
    pourBtn.addEventListener("click", pour);
    tasteBtn.addEventListener("click", taste);

    const onKey = (e) => {
      if (over || intro.isConnected) return;
      if (e.target && e.target.tagName === "BUTTON" && !e.target.disabled && (e.key === "Enter" || e.key === " ")) return;
      const k = e.key.toLowerCase();
      const jars = curBook().jars;
      const jk = "qwertyui".indexOf(k);
      if (e.key >= "1" && e.key <= "5") setMark(+e.key);
      else if (jk >= 0 && jk < jars.length && k.length === 1) addSpoon(jars[jk]);
      else if (k === "backspace") { if (!busy) { spoons.pop(); tasted = null; update(); } }
      else if (k === "enter" || k === "p") pour();
      else if (k === "a") taste();
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", onKey);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}label" role="dialog" aria-label="How to play">
      <svg class="${P}whip" viewBox="0 0 420 70" preserveAspectRatio="none" aria-hidden="true"><path d="M60 64 C80 10 150 30 175 14 C190 4 200 20 210 12 C220 20 230 4 245 14 C270 30 340 10 360 64" fill="none" stroke="${pal.honey}" stroke-width="1.5"/><circle cx="210" cy="12" r="4" fill="${pal.honey}"/></svg>
      <h2>Tea Blending</h2>
      <q>“${SOURCE_TEA}”</q>
      <p class="${P}goal"><b>Goal:</b> brew a cup that meets each book's card. Three books, one kettle of ${POURS} pours.</p>
      <table>
        <tr><td>Spoon</td><td>Tap a jar (Q W E R…) to add. Exactly three.</td></tr>
        <tr><td>Steep</td><td>Dial 1 to 5. Low thins depth; high adds length and binding.</td></tr>
        <tr><td>Pour</td><td>Enter. A short cup costs a pour.</td></tr>
      </table>
      ${gentle ? `<p style="font-style:italic;margin:0 0 12px">${LINES.gentle}</p>` : ""}
      <button type="button" class="${P}btn">Light the kettle</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); beat(LINES.open + " First, " + BOOKS[0].book.toLowerCase() + ": " + BOOKS[0].note); q("frame").focus(); });
    intro.querySelector("button").focus();

    buildJars();
    update();
    return {
      unmount() { timers.forEach((t) => (typeof t === "function" ? t() : clearTimeout(t))); removeEventListener("keydown", onKey); },
    };
  },
};

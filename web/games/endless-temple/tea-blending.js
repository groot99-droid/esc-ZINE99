// The Endless Temple / Tea Blending (1D, brewing). Style: Art nouveau apothecary labels.
// DESIGN.md section 11 (Tea Blending) and section 12 (steep). One sitting at the pantry table:
// three books in turn (the requirement cards of g_tea_c3, g_tea_c5 and g_tea_c7), one kettle of
// six pours. Mint is always the base; add exactly three spoons; set the steep dial; Pour.
// Win: all three books open. Lose: the kettle runs dry first.

const HERBS = {
  mint: { name: "Mint", d: 1, l: 1, b: 0, col: "#8fa07a" },
  sprig: { name: "Seer's sprig", d: 3, l: 0, b: 1, col: "#5f7d4e" },
  honeymoss: { name: "Honeymoss", d: 0, l: 1, b: -2, col: "#d4a23a" },
  clove: { name: "Clove-bark", d: 0, l: 3, b: 1, col: "#7a4a2a" },
  dunevine: { name: "Dune-vine pith", d: 1, l: 2, b: 0, col: "#c98a3a" },
  storm: { name: "Stormcress", d: 2, l: 0, b: -1, col: "#5d6f86" },
  ember: { name: "Ember root", d: 2, l: 1, b: 2, col: "#a8432c" },
};
// requirement cards and their pantry-ledger lines (partial, one more herb, the full recipe)
const BOOKS = [
  { scene: "g_tea_c3", book: "The sand book, again", req: { dmin: 5, lmin: 4 }, jars: ["sprig", "honeymoss", "clove"],
    ledger: ["For a long sand reading: clove-bark, for the length of it…", "Clove-bark, and the seer's sprig… more than once?", "Sprig, sprig, clove-bark. Mark 3."] },
  { scene: "g_tea_c5", book: "The Weather-Clerk of Hollin", req: { dmin: 5, bmax: 1 }, jars: ["sprig", "honeymoss", "clove", "dunevine"],
    ledger: ["A book about a binding wants something to loosen the cup: honeymoss…", "Honeymoss, and a little of the sand itself (dune-vine)…", "Sprig, dune-vine, honeymoss. Mark 3."] },
  { scene: "g_tea_c7", book: "The Long Procession", req: { dmin: 6, lmin: 6, bmax: 2 }, jars: ["sprig", "honeymoss", "clove", "dunevine", "storm", "ember"],
    ledger: ["A long road: dune-vine, and let the kettle sit a while…", "Dune-vine twice, and the sprig for depth…", "Sprig, dune-vine, dune-vine. Mark 4."] },
];
const DIAL = { 1: [0.5, 0], 2: [0.75, 0], 3: [1, 0], 4: [1, 1], 5: [1, 2] };
const POURS = 6;

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
  return p.join("; ");
}

// a label's three marks: filled bars for plus, open rings for minus (colour is never the only carrier)
function marksSvg(h) {
  const row = (lab, v, y) => {
    let s = `<text x="4" y="${y + 6}" font-size="9" fill="#3a2a1c">${lab}</text>`;
    if (v === 0) s += `<line x1="16" y1="${y + 3}" x2="22" y2="${y + 3}" stroke="#3a2a1c" stroke-width="1"/>`;
    for (let i = 0; i < Math.abs(v); i++) {
      s += v > 0 ? `<rect x="${16 + i * 9}" y="${y}" width="7" height="6" fill="#3a2a1c"/>`
        : `<circle cx="${19.5 + i * 9}" cy="${y + 3}" r="3" fill="none" stroke="#a8432c" stroke-width="1.4"/>`;
    }
    return s;
  };
  return `<svg viewBox="0 0 48 34" width="100%" aria-hidden="true">${row("D", h.d, 1)}${row("L", h.l, 12)}${row("B", h.b, 23)}</svg>`;
}

export default {
  mount(root, api) {
    const P = "endless-temple-tea-blending-";
    const pal = { honey: "#d4a23a", sage: "#8fa07a", walnut: "#5a3d27", sepia: "#3a2a1c", cream: "#f3ead2", ochre: "#c98a3a" };
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:#e7dcc0;color:${pal.sepia};font-family:'EB Garamond',Georgia,serif}
    .${P}frame{position:relative;min-height:100%;box-sizing:border-box;padding:18px 16px 96px;max-width:1180px;margin:0 auto}
    .${P}vine{position:absolute;inset:6px;pointer-events:none;width:calc(100% - 12px);height:calc(100% - 12px)}
    .${P}head{text-align:center;position:relative}
    .${P}head h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,34px);margin:4px 0 0;letter-spacing:.04em}
    .${P}head p{margin:2px 0 0;font-style:italic;font-size:14px}
    .${P}grid{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(0,.9fr);gap:18px;margin-top:14px;align-items:start}
    @media (max-width:820px){.${P}grid{grid-template-columns:1fr}}
    .${P}panel{background:${pal.cream};border:1px solid ${pal.walnut};outline:1px solid ${pal.honey};outline-offset:-5px;border-radius:44px 44px 6px 6px;padding:22px 14px 14px}
    .${P}panel h3{margin:0 0 8px;text-align:center;font-variant:small-caps;letter-spacing:.16em;font-weight:600;font-size:14px;color:${pal.walnut}}
    .${P}jars{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px}
    .${P}jar{font:inherit;color:inherit;cursor:pointer;background:transparent;border:0;padding:0;display:flex;flex-direction:column;align-items:center}
    .${P}jar:disabled{opacity:.4;cursor:not-allowed}
    .${P}lid{width:46%;height:9px;background:${pal.walnut};border-radius:3px 3px 0 0}
    .${P}glass{width:84%;border:1.5px solid ${pal.sepia};border-radius:6px 6px 14px 14px;background:linear-gradient(#f6f1e2,#e2e6d6);padding:6px 4px 8px;position:relative}
    .${P}lab{background:#fbf6e8;border:1px solid ${pal.walnut};border-radius:16px 16px 3px 3px;padding:3px 3px 0;text-align:center}
    .${P}lab b{display:block;font-variant:small-caps;font-size:11px;letter-spacing:.06em;line-height:1.1;min-height:2.2em}
    .${P}fleck{height:10px;margin-top:4px;border-radius:0 0 8px 8px}
    .${P}jar:hover .${P}glass,.${P}jar:focus-visible .${P}glass{box-shadow:0 0 0 2px ${pal.honey}}
    .${P}cupwrap{display:flex;flex-direction:column;align-items:center;gap:8px}
    .${P}cupwrap svg{width:100%;max-width:330px}
    .${P}slots{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .${P}slot{font:inherit;min-width:92px;min-height:40px;border:1.5px dashed ${pal.walnut};border-radius:20px;background:#fbf6e8;color:inherit;cursor:pointer;font-size:13px;padding:4px 8px}
    .${P}slot.${P}full{border-style:solid;background:#f1e2b8}
    .${P}dial{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap}
    .${P}dial span{font-variant:small-caps;letter-spacing:.1em;font-size:13px;margin-right:4px}
    .${P}mk{font:inherit;width:40px;height:40px;border-radius:50%;border:1.5px solid ${pal.walnut};background:#fbf6e8;color:inherit;cursor:pointer;font-weight:600}
    .${P}mk[aria-pressed=true]{background:${pal.honey};color:#fff;border-color:${pal.sepia}}
    .${P}pour{font:inherit;font-variant:small-caps;letter-spacing:.14em;font-size:18px;padding:8px 28px;border-radius:24px;border:2px solid ${pal.sepia};background:${pal.walnut};color:${pal.cream};cursor:pointer}
    .${P}pour:disabled{opacity:.45;cursor:not-allowed}
    .${P}card{background:#fbf6e8;border:1px solid ${pal.walnut};padding:10px 12px;margin-bottom:12px;border-radius:3px}
    .${P}card small{display:block;font-variant:small-caps;letter-spacing:.12em;color:${pal.walnut}}
    .${P}card strong{font-size:17px;font-weight:600}
    .${P}ledger{font-style:italic;background:#f4ead0;border-left:3px solid ${pal.honey}}
    .${P}result{min-height:3em}
    .${P}ok{color:#4e6b3c}.${P}no{color:#a8432c}
    .${P}kettle{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
    .${P}drop{width:14px;height:18px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;border:1.5px solid ${pal.walnut};background:${pal.sage}}
    .${P}drop.${P}used{background:transparent}
    .${P}books{display:flex;gap:6px;margin-top:6px}
    .${P}bk{flex:1;height:10px;border:1px solid ${pal.walnut};background:transparent}
    .${P}bk.${P}open{background:${pal.honey}}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(58,42,28,.55);z-index:5;padding:16px}
    .${P}intro div{background:${pal.cream};max-width:440px;padding:26px 24px;border-radius:60px 60px 6px 6px;border:1px solid ${pal.walnut};outline:1px solid ${pal.honey};outline-offset:-7px;text-align:center}
    .${P}intro h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;margin:0 0 8px}
    .${P}intro p{margin:0 0 10px}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}frame">
        <svg class="${P}vine" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2 98 C2 60 6 40 3 20 C1 10 6 3 16 2 M98 98 C98 60 94 40 97 20 C99 10 94 3 84 2 M16 2 C35 6 65 -2 84 2"
            fill="none" stroke="${pal.walnut}" stroke-width=".35" vector-effect="non-scaling-stroke"/>
          <path d="M4 96 C6 70 2 50 6 30 C9 16 4 8 20 5 M96 96 C94 70 98 50 94 30 C91 16 96 8 80 5"
            fill="none" stroke="${pal.honey}" stroke-width=".25" vector-effect="non-scaling-stroke"/>
        </svg>
        <div class="${P}head"><h2>The Pantry Table</h2><p class="${P}bookname"></p></div>
        <div class="${P}grid">
          <section class="${P}panel" aria-label="Jars"><h3>The Jars</h3><div class="${P}jars"></div>
            <p style="font-size:12.5px;margin:10px 4px 0">Marks on each label: <b>D</b>epth, <b>L</b>ength, <b>B</b>inding. A bar adds one; a ring takes one away. Mint (D1 L1 B0) is already in the cup.</p></section>
          <section class="${P}panel ${P}cupwrap" aria-label="The cup">
            <h3>The Cup</h3>
            <svg viewBox="0 0 240 200" aria-hidden="true"><g class="${P}cupsvg"></g></svg>
            <div class="${P}slots"></div>
            <div class="${P}dial" role="group" aria-label="Steep dial"><span>Steep</span></div>
            <button type="button" class="${P}pour">Pour</button>
          </section>
          <section class="${P}panel" aria-label="Cards">
            <h3>The Book's Card</h3>
            <div class="${P}card"><small>Requirement</small><strong class="${P}req"></strong>
              <div class="${P}books" aria-label="Books opened"></div></div>
            <div class="${P}card ${P}ledger"><small>The pantry ledger</small><span class="${P}led"></span></div>
            <div class="${P}card"><small>The kettle</small><div class="${P}kettle"></div></div>
            <div class="${P}card ${P}result" aria-live="polite"><small>The pour</small><span class="${P}res">Nothing poured yet.</span></div>
          </section>
        </div>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let bookI = 0, spoons = [], mark = 3, poursLeft = POURS, failsHere = 0, steep = 0, over = false, busy = false;
    const opened = [];

    // cup drawing
    const cupG = q("cupsvg");
    function drawCup(fill, color) {
      const ring = Math.min(1, steep / 60);
      const marks = [1, 2, 3, 4, 5].map((m, i) => {
        const a = Math.PI * (1.1 + i * 0.2);
        const x = 120 + 92 * Math.cos(a), y = 108 + 92 * Math.sin(a);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${m === mark ? 9 : 6}" fill="${m === mark ? pal.honey : "#fbf6e8"}" stroke="${pal.walnut}" stroke-width="1.2"/>
          <text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" font-size="10" text-anchor="middle" fill="${pal.sepia}">${m}</text>`;
      }).join("");
      const flecks = spoons.map((s, i) => `<path d="M${108 + i * 12} ${110 - i * 6} q4 -6 8 0" stroke="${HERBS[s].col}" stroke-width="3" fill="none"/>`).join("");
      cupG.innerHTML = `
        <path d="M30 108 A90 90 0 0 1 210 108" fill="none" stroke="${pal.walnut}" stroke-width="1" stroke-dasharray="2 4"/>
        <path d="M44 150 C30 120 60 92 80 104 M196 150 C210 120 180 92 160 104" fill="none" stroke="${pal.honey}" stroke-width="1.6"/>
        ${steep >= 20 ? `<ellipse cx="120" cy="160" rx="${66 + ring * 6}" ry="${16 + ring * 2}" fill="none" stroke="#8a6230" stroke-opacity="${0.25 + ring * 0.5}" stroke-width="${1 + ring * 5}"/>` : ""}
        <ellipse cx="120" cy="156" rx="62" ry="13" fill="#fbf6e8" stroke="${pal.walnut}"/>
        <path d="M78 104 L86 150 Q120 162 154 150 L162 104 Z" fill="#fbf6e8" stroke="${pal.sepia}" stroke-width="1.5"/>
        <path d="M162 112 q22 4 10 24 q-6 6 -14 4" fill="none" stroke="${pal.sepia}" stroke-width="1.5"/>
        <ellipse cx="120" cy="104" rx="42" ry="9" fill="${color}" fill-opacity="${0.35 + 0.6 * fill}" stroke="${pal.sepia}" stroke-width="1.2"/>
        ${flecks}${marks}`;
    }

    // jars
    const jarsBox = q("jars");
    function buildJars() {
      jarsBox.innerHTML = "";
      for (const id of BOOKS[bookI].jars) {
        const h = HERBS[id];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "jar";
        b.setAttribute("aria-label", `${h.name}: depth ${h.d}, length ${h.l}, binding ${h.b}. Add a spoon.`);
        b.innerHTML = `<div class="${P}lid"></div><div class="${P}glass"><div class="${P}lab"><b>${h.name}</b>${marksSvg(h)}</div>
          <div class="${P}fleck" style="background:repeating-linear-gradient(110deg,${h.col} 0 3px,transparent 3px 7px)"></div></div>`;
        b.addEventListener("click", () => { if (!over && !busy && spoons.length < 3) { spoons.push(id); update(); } });
        jarsBox.appendChild(b);
      }
    }
    // spoon slots
    const slotsBox = q("slots");
    function drawSlots() {
      slotsBox.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const s = spoons[i];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "slot" + (s ? " " + P + "full" : "");
        b.textContent = s ? HERBS[s].name + " ×" : `spoon ${i + 1}`;
        b.setAttribute("aria-label", s ? `Remove ${HERBS[s].name}` : `Empty spoon ${i + 1}`);
        b.addEventListener("click", () => { if (s && !over && !busy) { spoons.splice(i, 1); update(); } });
        slotsBox.appendChild(b);
      }
    }
    // dial
    const dial = q("dial");
    const mkBtns = [1, 2, 3, 4, 5].map((m) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "mk"; b.textContent = m;
      b.title = m < 3 ? `Mark ${m}: depth ×${DIAL[m][0]}` : m === 3 ? "Mark 3: neutral" : `Mark ${m}: +${DIAL[m][1]} length and binding`;
      b.addEventListener("click", () => { if (!over && !busy) { mark = m; update(); } });
      dial.appendChild(b); return b;
    });
    const pourBtn = q("pour");
    const resEl = q("res");

    function update() {
      const B = BOOKS[Math.min(bookI, BOOKS.length - 1)];
      q("bookname").textContent = `${B.book} · book ${bookI + 1} of ${BOOKS.length}`;
      q("req").textContent = reqText(B.req);
      q("led").textContent = B.ledger[Math.min(2, failsHere >= 4 ? 2 : failsHere >= 2 ? 1 : 0)];
      q("books").innerHTML = BOOKS.map((_, i) => `<div class="${P}bk ${opened[i] ? P + "open" : ""}"></div>`).join("");
      q("kettle").innerHTML = Array.from({ length: POURS }, (_, i) => `<div class="${P}drop ${i >= poursLeft ? P + "used" : ""}"></div>`).join("") + `<span style="margin-left:6px;font-size:13px">${poursLeft} pour${poursLeft === 1 ? "" : "s"} left</span>`;
      mkBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i + 1 === mark)));
      drawSlots();
      pourBtn.disabled = spoons.length !== 3 || over || busy;
      for (const j of jarsBox.children) j.disabled = spoons.length >= 3 || over || busy;
      const preview = brew(spoons, mark);
      drawCup(spoons.length / 3, spoons.length ? HERBS[spoons[spoons.length - 1]].col : HERBS.mint.col);
      if (!busy && !over && spoons.length === 3) resEl.textContent = `Ready to pour. (Spoons in; the dial will make it D${preview.d} L${preview.l} B${preview.b}.)`;
    }

    function pour() {
      if (spoons.length !== 3 || over || busy) return;
      const B = BOOKS[bookI];
      const r = brew(spoons, mark);
      poursLeft--;
      steep = Math.max(0, steep + 3 * r.b);
      const ok = meets(r, B.req);
      const hold = Math.min(100, 40 + 10 * r.d);
      const tick = (c, s) => `<span class="${c ? P + "ok" : P + "no"}">${s} ${c ? "✓" : "✗"}</span>`;
      const parts = [];
      if (B.req.dmin != null) parts.push(tick(r.d >= B.req.dmin, `Depth ${r.d}`)); else parts.push(`Depth ${r.d}`);
      if (B.req.lmin != null) parts.push(tick(r.l >= B.req.lmin, `Length ${r.l}`)); else parts.push(`Length ${r.l}`);
      if (B.req.bmax != null) parts.push(tick(r.b <= B.req.bmax, `Binding ${r.b}`)); else parts.push(`Binding ${r.b}`);
      busy = true;
      if (ok) {
        opened[bookI] = true;
        resEl.innerHTML = `${parts.join(" · ")}<br>The page opens. The tea will hold at ${hold}.`;
      } else {
        failsHere++;
        resEl.innerHTML = `${parts.join(" · ")}<br>Below the book's mark: the page stays plain text. Sand runs from the cover.`;
      }
      update();
      timers.push(setTimeout(() => {
        busy = false;
        spoons = [];
        if (ok) {
          bookI++; failsHere = 0; mark = 3;
          if (bookI >= BOOKS.length) {
            over = true; update();
            const ring = steep >= 40 ? "The cup has left a dark ring on the table." : steep >= 20 ? "The cup has left a faint ring on the table." : "The table is clean beneath the cup.";
            api.end({ outcome: "win", text: `All three books open, with ${poursLeft} pour${poursLeft === 1 ? "" : "s"} to spare. ${ring}` });
            return;
          }
          buildJars();
        } else if (poursLeft <= 0) {
          over = true; update();
          api.end({ outcome: "lose", text: `The kettle is dry, and \u201c${BOOKS[bookI].book}\u201d stays shut. Opened ${bookI} of ${BOOKS.length}.` });
          return;
        }
        update();
      }, api.reducedMotion ? 300 : 1300));
    }
    pourBtn.addEventListener("click", pour);

    const onKey = (e) => {
      if (over || intro.isConnected) return;
      if (e.key >= "1" && e.key <= "5") { mark = +e.key; update(); }
      else if (e.key === "Backspace") { spoons.pop(); update(); }
      else if (e.key === "Enter" && document.activeElement === document.body) pour();
    };
    addEventListener("keydown", onKey);

    // how-to-play
    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>Tea Blending</h2>
      <p>Each book asks for a cup of a certain depth, length and binding. Mint is the base; add exactly three spoons from the jars, set the steep dial, and Pour.</p>
      <p>Low marks thin the depth; high marks add length and binding. Open three books before the kettle's six pours run out.</p>
      <button type="button" class="${P}pour">Start</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); jarsBox.querySelector("button")?.focus(); });
    intro.querySelector("button").focus();

    buildJars();
    update();
    return {
      unmount() { timers.forEach(clearTimeout); removeEventListener("keydown", onKey); },
    };
  },
};

// Dr. Tox: Finale / Panes (1D, key panes; DESIGN.md section 11, `g1_panes`; scenes s1_panes_1 (the atrium) and
// s1_panes_2 (the hub)). Holographic foil trading card: a collectible card washed with rainbow foil in diagonal
// bands, a bevelled frame and a stat box, the tangram pieces as foil facets. Aegis is a product the State sells,
// and the foil is what Altrulan will remember as halos.
//
// The rules, from DESIGN.md. A breach's outline sits in the card's art window. Seven hard-light pieces, the tangram set
// (two large triangles, one medium, two small, a square, a parallelogram), each costing Load to set (-8). Drag, rotate and
// flip them into the outline; pieces cannot overlap; the outline is sealed when every part of it is covered. Fumes come
// through each gap, each turn: Reese absorbs them (Load +6 per gap per turn).
//   Panes 1 (the atrium): the State orders a full seal. Each piece has a face at the crack, named on a sticker on the
//     card's back: any piece left unset leaves a gap that person comes through (panes.let_in, panes.atrium_gaps). The
//     page lets the player seal it with every piece, or confirm with gaps.
//   Panes 2 (the hub): Dr. Tox is on the other side of the breach. Six pieces set as usual; the seventh, the keystone,
//     sets only when Reese says HOPE (reese.hub_word). If he said RCC, the leash fires as he lifts it and every pane goes
//     out for one second per flinch on record (at least three), then comes back without the keystone. If he said nothing,
//     the keystone has no word to set on. With HOPE said, the player can set it (panes.sealed) or keep it in Reese's hand
//     and confirm the card with one gap: room.
//
// Inputs: drag a pane (mouse or touch); rotate (button, R, wheel) in 45 degree steps; flip (button, F); confirm.
// Keys: Tab to a pane, Enter lifts it onto the breach, arrows move it (Shift: a unit), R, F, Enter sets it, Esc puts it
// back, U or Backspace takes a set pane out, 1 to 7 choose a pane, H hints, ? shows the how-to.
// Finish: confirm the card. Failure: none (the design says so). The page ends `win` when Reese leaves room (the keystone
// kept in his hand), which is The Reset's way and the author's; `done` when the hub is sealed (The Light Bringer's Wall).
//
// Reads (data/flags.json): reese.hub_word ("hope" | "rcc" | "silent"; when the gallery scene has not written it, this page
// asks for the Word itself), reese.flinches, reese.said_rcc, load. Writes: load, panes.atrium_gaps, panes.let_in,
// panes.sealed, reese.flinches (+1 at the atrium for the sentence, +1 for an RCC said on this page, each counted once per
// replay), and, only when this page asked for the Word, reese.hub_word and reese.said_rcc.
//
// Art (games/dr-tox-finale/art/ASSET_MAP.md, "Panes"): panes-card-atrium, panes-card-hub, panes-card-back, panes-piece-*,
// panes-keystone, panes-sticker, panes-fumes, panes-hope-seal, and the shared hud-word-hope / -rcc / -silence. Every id
// falls back to a drawing made here when the bundle lacks it.
//
// Quoted from the author's work, verbatim (DESIGN.md): "projects hard-light physical barriers" (Part VI, Aegis);
// "You survived something terrible so you could protect people from it happening again." (Part VIII, Scene 2);
// "a flash with no picture attached, just pressure, just grief with the label torn off" (Scene 2 III).
//
// Added for the game (not in DESIGN.md; the author approves or strikes): which piece lets in which face (the piece left
// out chooses the person; the seven names and wants are from the cult table, the eighth sticker stays blank); a turn is a
// pane set, and a gap is a separate uncovered region (so fumes are +6 per region); the Word picker on page 2 when the
// gallery has not set it; the keystone must be the last piece (six set first); the leash fires once, as the keystone is
// first lifted; a hint button (a ghost of where a free piece fits); the win rule; all captions.

const P = "pn-";
const INK = "#2a2a2a", CREAM = "#f4f0e0", GOLD = "#F2C14E", PALE = "#F6E7B8", TEAL = "#5b6f72", BG = "#101414", DUST = "#4a4639";
const FOIL = ["#f6b3c8", "#F6E7B8", "#a8e6cf", "#9fc6f2", "#d4b0f2"];
const SANS = "var(--g-body,'Helvetica Neue',Helvetica,Arial,sans-serif)";
const DISP = "var(--g-display,'Helvetica Neue',Helvetica,Arial,sans-serif)";

const UNIT = 60;                  // a lattice step: the breach is four of these square
const B0 = { x: 160, y: 204 };    // the breach's top left, in the card's own coordinates (ASSET_MAP.md)
const BS = 240;                   // the breach's side
const SNAP = 22, TOL = 1.5;
const CARD_W = 560, CARD_H = 780, CROP_H = 566;
const SET_COST = 8, FUME = 6, LOAD_START = 40, NEED = 6;
const GRID = 48;                  // coverage samples per side

// The tangram set. poly is the piece's outline in its own art's pixel frame; w and h are the art's size.
const SHAPES = {
  largeA: { type: "L", art: "panes-piece-large-a", poly: [[8, 8], [248, 8], [128, 128]], w: 256, h: 136, rot0: 0 },
  largeB: { type: "L", art: "panes-piece-large-b", poly: [[8, 8], [128, 128], [8, 248]], w: 136, h: 256, rot0: 90 },
  medium: { type: "M", art: "panes-piece-medium", poly: [[128, 8], [128, 128], [8, 128]], w: 136, h: 136, rot0: 0 },
  keystone: { type: "M", art: "panes-keystone", poly: [[8, 93], [178, 93], [93, 8]], w: 186, h: 101, rot0: 0 },
  square: { type: "Q", art: "panes-piece-square", poly: [[8, 68], [68, 8], [128, 68], [68, 128]], w: 136, h: 136, rot0: 0 },
  para: { type: "P", art: "panes-piece-parallelogram", poly: [[8, 68], [68, 8], [188, 8], [128, 68]], w: 196, h: 76, rot0: 0 },
  smallA: { type: "S", art: "panes-piece-small-a", poly: [[68, 8], [68, 128], [8, 68]], w: 76, h: 136, rot0: 90 },
  smallB: { type: "S", art: "panes-piece-small-b", poly: [[68, 8], [128, 68], [8, 68]], w: 136, h: 76, rot0: 0 },
};
const ORDER = ["largeA", "largeB", "medium", "square", "para", "smallA", "smallB"];

// A tiling of the square (lattice units), used only for the hint. Any other tiling is as good.
const SOL = [
  ["L", [[0, 0], [4, 0], [2, 2]]], ["L", [[0, 0], [2, 2], [0, 4]]], ["M", [[4, 2], [4, 4], [2, 4]]],
  ["Q", [[2, 2], [3, 1], [4, 2], [3, 3]]], ["S", [[3, 1], [4, 0], [4, 2]]], ["S", [[2, 2], [3, 3], [1, 3]]],
  ["P", [[1, 3], [3, 3], [2, 4], [0, 4]]],
].map(([type, pts]) => ({ type, poly: pts.map(([x, y]) => [B0.x + x * UNIT, B0.y + y * UNIT]) }));

// Panes 1: the face at the crack that each piece lets in if it is left out (names and wants from DESIGN.md's cult table).
const FACES = {
  largeA: { name: "Kofi Mensah", want: "To see the river again" },
  largeB: { name: "Lupe Andrade", want: "Her hands steady enough to sew the banners" },
  medium: { name: "Wren Halloran", want: "For Teo to walk without a stick" },
  square: { name: "Marisol Quiroga", want: "Her son's boots back" },
  para: { name: "Dara Quill", want: "For her sister to see the rite" },
  smallA: { name: "Petra Lind", want: "To be left alone" },
  smallB: { name: "Yusuf Demir", want: "To be useful" },
};
const SENTENCE = "You survived something terrible so you could protect people from it happening again.";
const FLASH = "a flash with no picture attached, just pressure, just grief with the label torn off";

// ---- geometry ------------------------------------------------------------------------------------------------------------
function centroid(poly) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length], k = x0 * y1 - x1 * y0;
    a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k;
  }
  return [cx / (3 * a), cy / (3 * a)];
}
for (const s of Object.values(SHAPES)) s.c = centroid(s.poly);

function verts(sh, x, y, rot, flip) {
  const r = (rot * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
  return sh.poly.map(([vx, vy]) => {
    let lx = vx - sh.c[0]; const ly = vy - sh.c[1];
    if (flip) lx = -lx;
    return [x + lx * co - ly * si, y + lx * si + ly * co];
  });
}
function axes(poly) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
    const nx = y1 - y0, ny = x0 - x1, l = Math.hypot(nx, ny) || 1;
    out.push([nx / l, ny / l]);
  }
  return out;
}
function overlaps(a, b) {   // convex polygons; flush edges and corners are not an overlap
  for (const [nx, ny] of axes(a).concat(axes(b))) {
    let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
    for (const [x, y] of a) { const d = x * nx + y * ny; if (d < a0) a0 = d; if (d > a1) a1 = d; }
    for (const [x, y] of b) { const d = x * nx + y * ny; if (d < b0) b0 = d; if (d > b1) b1 = d; }
    if (Math.min(a1, b1) - Math.max(a0, b0) <= TOL) return false;
  }
  return true;
}
function inside(poly) {
  return poly.every(([x, y]) => x >= B0.x - TOL && x <= B0.x + BS + TOL && y >= B0.y - TOL && y <= B0.y + BS + TOL);
}
function covers(poly, px, py, eps) {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) { const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length]; sign += x0 * y1 - x1 * y0; }
  sign = sign < 0 ? -1 : 1;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length];
    const l = Math.hypot(x1 - x0, y1 - y0) || 1;
    if (sign * ((x1 - x0) * (py - y0) - (y1 - y0) * (px - x0)) / l < -eps) return false;
  }
  return true;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// The pose that lays a piece on a target polygon, or null (used by the hint, and by the tests).
function matchPose(sh, target) {
  const [tx, ty] = centroid(target);
  for (const flip of [false, true]) for (let rot = 0; rot < 360; rot += 45) {
    const v = verts(sh, tx, ty, rot, flip);
    if (v.length === target.length && target.every((t) => v.some((q) => Math.hypot(q[0] - t[0], q[1] - t[1]) < 2))) return { x: tx, y: ty, rot, flip };
  }
  return null;
}

// ---- fallback drawings ------------------------------------------------------------------------------------------------------
function cardFallback(which) {
  const hub = which === "hub";
  return `<rect x="6" y="6" width="548" height="768" rx="26" fill="#d9d4c4" stroke="#8c8672" stroke-width="6"/>
<rect x="20" y="20" width="520" height="740" rx="18" fill="url(#pn-foil)"/>
<rect x="42" y="34" width="476" height="56" rx="8" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
<text x="60" y="74" font-size="36" font-family="sans-serif" fill="${INK}" font-weight="bold" letter-spacing="6">AEGIS</text>
<text x="500" y="72" font-size="14" font-family="sans-serif" fill="#6a6450" text-anchor="end" font-weight="bold" letter-spacing="2">HARD LIGHT</text>
<rect x="44" y="104" width="472" height="440" fill="${hub ? "#ecebdf" : TEAL}" stroke="${INK}" stroke-width="3"/>
<rect x="${B0.x}" y="${B0.y}" width="${BS}" height="${BS}" fill="${hub ? "#1f2527" : DUST}" stroke="${PALE}" stroke-width="4" stroke-dasharray="10 6"/>
<rect x="42" y="566" width="476" height="174" rx="10" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
<text x="64" y="612" font-size="26" font-family="sans-serif" fill="${INK}" font-weight="bold">LOAD</text>
<rect x="160" y="590" width="333" height="28" fill="#fff" stroke="${INK}" stroke-width="2"/>
<text x="64" y="666" font-size="26" font-family="sans-serif" fill="${INK}" font-weight="bold">PANES</text>
<text x="64" y="722" font-size="14" font-family="sans-serif" fill="#6a6450" letter-spacing="3">SERIES 2240 · PROJECT HOPE</text>`;
}
const CSS = `
.${P}root{position:absolute;inset:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 30%,#1b2323,${BG} 70%);color:${CREAM};font-family:${SANS};overflow:hidden;user-select:none;-webkit-user-select:none}
.${P}root *{box-sizing:border-box}
.${P}band{flex:none;display:flex;align-items:center;gap:8px;padding:6px 16px;min-height:44px}
.${P}band h1{margin:0;font:700 20px/1 ${DISP};letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
.${P}no{flex:1;min-width:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b9c4c0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${P}sq{flex:none;width:34px;height:34px;border-radius:50%;border:2px solid ${PALE};background:transparent;color:${PALE};font:700 16px ${DISP};cursor:pointer}
.${P}sq:focus-visible,.${P}btn:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}
.${P}hud{flex:none;display:none;align-items:center;gap:8px;padding:2px 16px 6px;font:700 11px ${SANS};letter-spacing:.14em}
.${P}hud .${P}bar{position:relative;flex:1;max-width:240px;height:18px;background:${CREAM};border:2px solid ${INK};border-radius:3px;overflow:hidden}
.${P}hud .${P}bar i{position:absolute;left:0;top:0;bottom:0;background:${GOLD}}
.${P}hud .${P}bar b{position:absolute;right:5px;top:0;line-height:14px;font-size:12px;color:${INK}}
.${P}pips{display:flex;gap:3px}.${P}pips i{width:15px;height:15px;border:2px solid ${PALE};transform:rotate(45deg) scale(.82)}.${P}pips i.${P}on{background:${GOLD};border-color:#fff}
.${P}root[data-lay=p] .${P}hud{display:flex}
.${P}stage{position:relative;flex:1 1 auto;min-height:0}
.${P}stage svg{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.${P}piece{cursor:grab;outline:none}
.${P}piece .${P}ring{fill:none;stroke:${GOLD};stroke-width:4;stroke-dasharray:7 5;opacity:0;pointer-events:none}
.${P}piece.${P}sel .${P}ring,.${P}piece:focus-visible .${P}ring{opacity:1}
.${P}piece.${P}lift{cursor:grabbing}
.${P}sheenmove{animation:${P}sheen 7s linear infinite}
@keyframes ${P}sheen{0%{transform:translateX(-300px)}100%{transform:translateX(900px)}}
.${P}drift{animation:${P}drift 3s ease-in-out infinite alternate}
@keyframes ${P}drift{0%{transform:translateY(0);opacity:.75}100%{transform:translateY(-10px);opacity:1}}
.${P}cap{flex:none;min-height:46px;padding:5px 16px;font-size:14px;line-height:1.35;text-align:center;color:#e9ecea;display:flex;align-items:center;justify-content:center}
.${P}cap b{color:${GOLD}}
.${P}acts{flex:none;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:6px 16px 10px;background:rgba(0,0,0,.28)}
.${P}btn{font:700 14px ${DISP};letter-spacing:.06em;text-transform:uppercase;color:${INK};background:${CREAM};border:3px solid ${INK};border-radius:9px;padding:6px 14px;min-height:44px;min-width:64px;cursor:pointer;box-shadow:3px 3px 0 rgba(0,0,0,.5)}
.${P}btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 rgba(0,0,0,.5)}
.${P}btn.${P}go{background:linear-gradient(120deg,${FOIL.join(",")});font-size:15px}
.${P}btn:disabled{opacity:.4;cursor:default;box-shadow:none}
.${P}ov{position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow:auto;background:rgba(10,14,14,.84)}
.${P}card{position:relative;max-width:560px;width:100%;margin:auto 0;color:${INK};background:${CREAM};border:6px solid transparent;border-radius:18px;padding:14px 16px 16px;background-image:linear-gradient(${CREAM},${CREAM}),linear-gradient(130deg,${FOIL.join(",")},${FOIL[0]});background-origin:border-box;background-clip:padding-box,border-box;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.${P}kick{font:700 11px ${SANS};letter-spacing:.2em;text-transform:uppercase;color:#7a6a3a}
.${P}card h2{margin:3px 0 8px;font:700 30px/1.05 ${DISP};letter-spacing:.04em;text-transform:uppercase}
.${P}card p{margin:0 0 8px;font-size:15px;line-height:1.42}
.${P}card ul{margin:0 0 10px;padding:0;list-style:none;display:grid;gap:5px}
.${P}card li{font-size:14px;line-height:1.35}
.${P}card li b{display:inline-block;min-width:60px;background:${INK};color:${CREAM};padding:1px 6px;margin-right:6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.${P}card blockquote{margin:0 0 10px;padding:8px 12px;background:${PALE};border-left:5px solid ${GOLD};font:italic 15px/1.4 Georgia,serif}
.${P}card cite{display:block;margin-top:4px;font:600 11px ${SANS};font-style:normal;letter-spacing:.06em;color:#5a4f2a}
.${P}note{font-size:12px!important;color:#5a5648}
.${P}btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.${P}words{display:grid;gap:8px;margin:8px 0}
.${P}words button{display:flex;align-items:center;gap:12px;text-align:left;font:inherit;color:${INK};background:#e9e3c9;border:3px solid ${INK};border-radius:10px;padding:6px 10px;min-height:56px;cursor:pointer}
.${P}words button img{width:120px;height:48px;flex:none}
.${P}words button span{font-size:13px;line-height:1.3}
.${P}words button:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}
.${P}back{position:relative;width:min(100%,360px,calc((100vh - 220px)*.718));aspect-ratio:560/780;margin:6px auto 8px;background:${PALE} center/100% 100% no-repeat}
.${P}stick{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;color:${INK};line-height:1.1;padding:0 3px;border-radius:4px}
.${P}stick.${P}lit{background:rgba(242,193,78,.8);box-shadow:0 0 12px 3px rgba(255,235,160,.95);outline:2px solid #fff}
.${P}wants{margin:0;padding:0;list-style:none;font-size:13px;display:grid;gap:3px}
@media (max-width:560px){.${P}acts{gap:6px;padding:6px 10px 8px}.${P}btn{font-size:12px;padding:4px 8px;min-width:54px}.${P}btn.${P}go{font-size:12px}}
@media (min-width:900px){.${P}band h1{font-size:24px}.${P}cap{font-size:15px}}
@media (prefers-reduced-motion:reduce){.${P}root *{animation:none!important;transition:none!important}.${P}btn:active{transform:none}}
`;

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || null;
    const has = (id) => { try { return !!(art && art.has(id)); } catch { return false; } };
    const url = (id) => { try { return has(id) ? art.url(id) : ""; } catch { return ""; } };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch { /* storage off */ } };
    const num = (k, d) => { const v = Number(sget(k, d)); return Number.isFinite(v) ? v : d; };

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const NS = "http://www.w3.org/2000/svg";
    const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    let dead = false;

    // ---- DOM ----------------------------------------------------------------------------------------------------------------
    const style = mk("style", null, root); style.textContent = CSS;
    const wrap = mk("div", P + "root", root); wrap.setAttribute("data-lay", "l");
    const band = mk("div", P + "band", wrap);
    mk("h1", null, band, "Panes");
    const noEl = mk("div", P + "no", band);
    const nameBtn = mk("button", P + "sq", band, "A"); nameBtn.type = "button"; nameBtn.setAttribute("aria-label", "The card's back: names at the crack"); nameBtn.title = "The card's back";
    const helpBtn = mk("button", P + "sq", band, "?"); helpBtn.type = "button"; helpBtn.setAttribute("aria-label", "How to play");
    const hud = mk("div", P + "hud", wrap);
    mk("span", null, hud, "LOAD");
    const hbar = mk("div", P + "bar", hud); const hfill = mk("i", null, hbar); const hnum = mk("b", null, hbar);
    mk("span", null, hud, "PANES");
    const hpips = mk("div", P + "pips", hud); const hp = []; for (let i = 0; i < 7; i++) hp.push(mk("i", null, hpips));
    const stage = mk("div", P + "stage", wrap);
    const capEl = mk("div", P + "cap", wrap); capEl.setAttribute("aria-live", "polite");
    const acts = mk("div", P + "acts", wrap);
    const bRot = mk("button", P + "btn", acts, "Rotate"); bRot.type = "button"; bRot.title = "Rotate the chosen pane 45 degrees (R)";
    const bFlip = mk("button", P + "btn", acts, "Flip"); bFlip.type = "button"; bFlip.title = "Flip the chosen pane (F)";
    const bHint = mk("button", P + "btn", acts, "Hint"); bHint.type = "button"; bHint.title = "Show where a free pane fits (H)";
    const bOut = mk("button", P + "btn", acts, "Take out"); bOut.type = "button"; bOut.title = "Take the chosen pane back out (U)";
    const bOk = mk("button", P + "btn " + P + "go", acts, "Confirm"); bOk.type = "button";

    const svg = sv("svg", { role: "group", "aria-label": "The card: a breach, and seven hard-light panes", preserveAspectRatio: "xMidYMid meet" }, stage);
    const defs = sv("defs", null, svg);
    const fg = sv("linearGradient", { id: P + "foil", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    FOIL.forEach((c, i) => sv("stop", { offset: `${(i * 100) / (FOIL.length - 1)}%`, "stop-color": c }, fg));
    const shg = sv("linearGradient", { id: P + "sheen", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [["0", 0], ["45%", 0.0], ["50%", 0.32], ["55%", 0.0], ["100%", 0]].forEach(([o, a]) => sv("stop", { offset: o, "stop-color": "#fff", "stop-opacity": a }, shg));
    const clipCard = sv("clipPath", { id: P + "clipcard" }, defs); const clipRect = sv("rect", { x: 0, y: 0, width: CARD_W, height: CARD_H, rx: 26 }, clipCard);
    const gCard = sv("g", null, svg);
    const gShelf = sv("g", null, svg);
    const gGauge = sv("g", null, svg);
    const gFumes = sv("g", { "pointer-events": "none" }, svg);
    const gSeal = sv("g", { "pointer-events": "none" }, svg);
    const gTray = sv("g", { "pointer-events": "none" }, svg);
    const gGhost = sv("g", { "pointer-events": "none" }, svg);
    const gPieces = sv("g", null, svg);
    const gOut = sv("g", { "pointer-events": "none" }, svg);

    // ---- state --------------------------------------------------------------------------------------------------------------
    let page = 1, load = LOAD_START;
    let mode = "intro";                      // intro | word | play | out | confirm | over
    let word = "silent", wordAsked = false, flashed = false;
    let pcs = [];                            // the pieces: { id, sh, g, gt, poly, img, x, y, rot, flip, set, home, label }
    let sel = null, lift = null, hintT = null;
    let lay = { lay: "l", ox: 590, oy: 40 };
    const results = [];
    let atriumDone = false;
    let tray = null;

    const flinches = () => Math.max(0, Math.round(num("reese.flinches", 2)));
    const byId = (id) => pcs.find((p) => p.id === id);
    const setCount = () => pcs.filter((p) => p.set).length;
    const isKey = (p) => page === 2 && p.id === "medium";
    const wordLabel = () => (word === "hope" ? "HOPE" : word === "rcc" ? "RCC" : "nothing");

    function say(html) { capEl.innerHTML = `<span>${html}</span>`; }

    // ---- the card art ----------------------------------------------------------------------------------------------------------
    function drawCard() {
      gCard.textContent = "";
      const id = page === 1 ? "panes-card-atrium" : "panes-card-hub";
      const u = url(id);
      const cg = sv("g", { "clip-path": lay.lay === "p" ? `url(#${P}clip)` : `url(#${P}clipcard)` }, gCard);
      if (u) { const im = sv("image", { href: u, x: 0, y: 0, width: CARD_W, height: CARD_H }, cg); im.setAttribute("preserveAspectRatio", "none"); }
      else cg.innerHTML = cardFallback(page === 1 ? "atrium" : "hub");
      // the foil sheen: one diagonal band that crosses the card
      const sh = sv("g", { "clip-path": `url(#${P}clipcard)`, "pointer-events": "none" }, cg);
      const mv = sv("g", { class: RM ? "" : P + "sheenmove" }, sh);
      sv("rect", { x: -120, y: -60, width: 150, height: 1000, fill: `url(#${P}sheen)`, transform: "rotate(18 0 400)", opacity: RM ? 0 : 1 }, mv);
    }
    const clipTop = sv("clipPath", { id: P + "clip" }, defs); sv("rect", { x: 0, y: 0, width: CARD_W, height: CROP_H, rx: 20 }, clipTop);

    // ---- the tray (a shelf pack, in world units, relative to the tray's own corner) ------------------------------------------------
    function buildTray() {
      const names = page === 1;
      const items = pcs.map((p) => {
        const v = verts(p.sh, 0, 0, p.sh.rot0, false);
        const xs = v.map((q) => q[0]), ys = v.map((q) => q[1]);
        return { p, minx: Math.min(...xs), miny: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      });
      const W = CARD_W, G = 22, LAB = names ? 30 : 6;
      const rows = []; let row = null;
      for (const it of items) {
        if (!row || row.w + G + it.w > W) { row = { its: [], w: 0, h: 0 }; rows.push(row); }
        row.its.push(it); row.w += (row.its.length > 1 ? G : 0) + it.w; row.h = Math.max(row.h, it.h);
      }
      let y = 0; const out = {};
      for (const r of rows) {
        let x = (W - r.w) / 2;
        for (const it of r.its) {
          const top = y + (r.h - it.h) / 2;
          out[it.p.id] = { x: x - it.minx, y: top - it.miny, lx: x + it.w / 2, ly: y + r.h + 20 };
          x += it.w + G;
        }
        y += r.h + LAB + 12;
      }
      tray = { pos: out, h: y };
    }
    function homeOf(p) { const t = tray.pos[p.id]; return { x: lay.ox + t.x, y: lay.oy + t.y, lx: lay.ox + t.lx, ly: lay.oy + t.ly }; }

    // ---- pieces ------------------------------------------------------------------------------------------------------------------
    function makePieces() {
      gPieces.textContent = ""; pcs = [];
      for (const id of ORDER) {
        const key = page === 2 && id === "medium" ? "keystone" : id;
        const sh = SHAPES[key];
        const p = { id, sh, x: 0, y: 0, rot: sh.rot0, flip: false, set: false };
        pcs.push(p);
        p.g = sv("g", { class: P + "piece", tabindex: 0, role: "button", "data-id": id }, gPieces);
        p.gt = sv("g", null, p.g);
        const u = url(sh.art);
        p.hit = sv("polygon", { points: sh.poly.map((q) => q.join(",")).join(" "), fill: u ? "#000" : `url(#${P}foil)`, "fill-opacity": u ? 0 : 0.92, stroke: u ? "#000" : "#fff", "stroke-opacity": u ? 0 : 1, "stroke-width": u ? 16 : 3, "stroke-linejoin": "round", "pointer-events": "all" }, p.gt);
        if (u) { const im = sv("image", { href: u, x: 0, y: 0, width: sh.w, height: sh.h, "pointer-events": "none" }, p.gt); im.setAttribute("preserveAspectRatio", "none"); }
        p.ring = sv("polygon", { class: P + "ring", points: sh.poly.map((q) => q.join(",")).join(" "), "stroke-linejoin": "round" }, p.gt);
        p.g.addEventListener("focus", () => { if (!dead && mode === "play") choose(p, true); });
        paint(p);
      }
    }
    function paint(p) {
      p.gt.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot}) scale(${p.flip ? -1 : 1} 1) translate(${-p.sh.c[0]} ${-p.sh.c[1]})`);
      const where = p.set ? "set in the breach" : lift && lift.p === p ? "held" : "in the tray";
      p.g.setAttribute("aria-label", `${page === 1 ? FACES[p.id].name + "'s pane" : isKey(p) ? "The keystone" : "Pane " + (ORDER.indexOf(p.id) + 1)}, ${where}`);
    }
    function pose(p) { return verts(p.sh, p.x, p.y, p.rot, p.flip); }
    function sendHome(p) {
      const h = homeOf(p); p.x = h.x; p.y = h.y; p.set = false; paint(p);
    }

    // ---- coverage, gaps, the stat box -------------------------------------------------------------------------------------------------
    function gapInfo() {
      const polys = pcs.filter((p) => p.set).map(pose);
      const cell = BS / GRID, seen = new Uint8Array(GRID * GRID), open = new Uint8Array(GRID * GRID);
      for (let j = 0; j < GRID; j++) for (let i = 0; i < GRID; i++) {
        const x = B0.x + (i + 0.5) * cell, y = B0.y + (j + 0.5) * cell;
        if (!polys.some((q) => covers(q, x, y, 0.8))) open[j * GRID + i] = 1;
      }
      const regs = [];
      for (let s = 0; s < open.length; s++) {
        if (!open[s] || seen[s]) continue;
        const st = [s]; seen[s] = 1; let n = 0, sx = 0, sy = 0;
        while (st.length) {
          const k = st.pop(), i = k % GRID, j = (k / GRID) | 0; n++; sx += i; sy += j;
          for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ni = i + a, nj = j + b; if (ni < 0 || nj < 0 || ni >= GRID || nj >= GRID) continue;
            const nk = nj * GRID + ni; if (open[nk] && !seen[nk]) { seen[nk] = 1; st.push(nk); }
          }
        }
        if (n >= 5) regs.push({ n, x: B0.x + (sx / n + 0.5) * cell, y: B0.y + (sy / n + 0.5) * cell });
      }
      return { count: regs.length, regs, open: open.reduce((a, b) => a + b, 0) };
    }
    let gaps = { count: 1, regs: [], open: 0 };
    function refresh() {
      gaps = gapInfo();
      // fumes
      gFumes.textContent = "";
      const fu = url("panes-fumes");
      gaps.regs.slice(0, 4).forEach((r) => {
        const s = clamp(Math.sqrt(r.n) * 5 * 1.2, 56, 90);
        const g = sv("g", { class: RM ? "" : P + "drift" }, gFumes);
        if (fu) sv("image", { href: fu, x: r.x - s / 2, y: r.y - s / 2, width: s, height: s }, g);
        else sv("circle", { cx: r.x, cy: r.y, r: s / 3, fill: "#8a7b5c", opacity: 0.55 }, g);
      });
      // the stat box
      gGauge.textContent = "";
      const L = lay.lay === "l";
      if (L) {
        sv("rect", { x: 161, y: 591, width: 331 * load / 100, height: 26, fill: GOLD, opacity: 0.8 }, gGauge);
        const t = sv("text", { x: 484, y: 611, "text-anchor": "end", "font-size": 20, "font-weight": 700, fill: INK, "font-family": "sans-serif" }, gGauge); t.textContent = String(Math.round(load));
        pcs.forEach((p, i) => sv("polygon", { points: `${186 + 36 * i},${657 - 17} ${186 + 36 * i + 17},657 ${186 + 36 * i},${657 + 17} ${186 + 36 * i - 17},657`, fill: p.set ? GOLD : "none", stroke: INK, "stroke-width": 2 }, gGauge));
      }
      hfill.style.width = clamp(load, 0, 100) + "%"; hnum.textContent = String(Math.round(load));
      pcs.forEach((p, i) => hp[i] && hp[i].classList.toggle(P + "on", !!p.set));
      // the HOPE seal
      gSeal.textContent = "";
      const su = url("panes-hope-seal");
      if (page === 2 && word === "hope") {
        if (su) sv("image", { href: su, x: 410, y: 112, width: 96, height: 96 }, gSeal);
        else { sv("circle", { cx: 458, cy: 160, r: 40, fill: INK, stroke: GOLD, "stroke-width": 3 }, gSeal); const t = sv("text", { x: 458, y: 166, "text-anchor": "middle", "font-size": 16, "font-weight": 700, fill: GOLD, "font-family": "sans-serif" }, gSeal); t.textContent = "HOPE"; }
      }
      // confirm
      if (page === 1) bOk.disabled = mode !== "play";
      else bOk.disabled = mode !== "play" || !(pcs.filter((p) => p.set && !isKey(p)).length >= NEED || load < SET_COST);
      bOk.textContent = page === 1 ? (setCount() === 7 ? "Confirm: sealed" : "Confirm") : (byId("medium").set ? "Confirm: seal the hub" : "Confirm: leave room");
      bOut.disabled = !(sel && sel.set) || mode !== "play";
    }

    // ---- placing ----------------------------------------------------------------------------------------------------------------
    function valid(p, x, y, rot, flip) {
      const v = verts(p.sh, x, y, rot, flip);
      if (!inside(v)) return false;
      return pcs.every((q) => q === p || !q.set || !overlaps(v, pose(q)));
    }
    function why(p, x, y, rot, flip) {
      const v = verts(p.sh, x, y, rot, flip);
      if (!inside(v)) return "It does not sit inside the breach.";
      return "Two panes cannot share the same light. Move it, turn it, or take the other one out.";
    }
    function snapped(p, x, y, rot, flip) {
      const targets = [];
      for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) targets.push([B0.x + i * UNIT, B0.y + j * UNIT]);
      pcs.forEach((q) => { if (q !== p && q.set) pose(q).forEach((v) => targets.push(v)); });
      const v = verts(p.sh, x, y, rot, flip), cands = [];
      for (const a of v) for (const t of targets) { const d = Math.hypot(t[0] - a[0], t[1] - a[1]); if (d <= SNAP) cands.push([d, t[0] - a[0], t[1] - a[1]]); }
      cands.sort((a, b) => a[0] - b[0]);
      const tried = new Set();
      for (const [, dx, dy] of cands.slice(0, 24)) {
        const k = Math.round(dx) + "," + Math.round(dy); if (tried.has(k)) continue; tried.add(k);
        if (valid(p, x + dx, y + dy, rot, flip)) return { x: x + dx, y: y + dy };
      }
      if (valid(p, x, y, rot, flip)) return { x, y };
      return null;
    }

    function choose(p, quiet) {
      sel = p;
      pcs.forEach((q) => q.g.classList.toggle(P + "sel", q === p));
      if (!quiet) gPieces.appendChild(p.g);
      if (page === 1) say(`<b>${esc(FACES[p.id].name)}</b>: ${esc(FACES[p.id].want.toLowerCase())}. ${p.set ? "Set." : "Left out, this pane is the gap they come through."}`);
      else say(isKey(p) ? "The keystone: the last piece, and the only one the word sets." : "A hard-light pane. Drag it into the breach; turn it, or flip it, to fit.");
      refresh();
    }

    function commit(p, x, y, prev) {   // a pane set: one turn
      const moved = !(prev && prev.set && Math.hypot(prev.x - x, prev.y - y) < 1 && prev.rot === p.rot && prev.flip === p.flip);
      p.x = x; p.y = y; p.set = true; paint(p);
      let note = "Set.";
      if (moved) {
        refresh();
        const cost = isKey(p) ? 0 : SET_COST;
        const fumes = gaps.count * FUME;
        load = clamp(load - cost + fumes, 0, 100);
        note = gaps.count ? `Set. Load -${cost}, fumes +${fumes} through ${gaps.count} gap${gaps.count > 1 ? "s" : ""}.` : `Set. Load -${cost}. The breach is covered.`;
      }
      refresh();
      say(note + (page === 1 && gaps.count === 0 ? " Sealed full, as ordered." : ""));
      announce();
    }
    function announce() {
      if (page === 2 && !byId("medium").set && pcs.filter((p) => p.set && !isKey(p)).length >= NEED) {
        if (word === "hope") say(`Six panes set. The keystone is the last, and the word ${"<b>HOPE</b>"} sets it. Set it, or keep it in his hand.`);
        else if (word === "rcc") say("Six panes set. The keystone is in the tray. He said RCC.");
        else say("Six panes set. The keystone has no word to set on.");
      }
    }

    // ---- lifting and dropping (pointer and keyboard) ------------------------------------------------------------------------------------------
    function canLift(p) {
      if (mode !== "play") return false;
      if (isKey(p) && !byId("medium").set) {
        const others = pcs.filter((q) => q.set && !isKey(q)).length;
        if (others < NEED) { say("Not yet. The keystone is the last piece: set the other six first."); return false; }
        if (word === "rcc" && !flashed) { flinch(); return false; }
      }
      return true;
    }
    function beginLift(p, by) {
      if (!canLift(p)) return false;
      lift = { p, by, prev: { x: p.x, y: p.y, rot: p.rot, flip: p.flip, set: p.set } };
      p.set = false; p.g.classList.add(P + "lift"); gPieces.appendChild(p.g);
      choose(p, true); clearHint(); paint(p);
      if (by === "key") p.g.focus({ preventScroll: true });
      return true;
    }
    function endLift(cancel) {
      if (!lift) return;
      const { p, prev } = lift; lift = null; p.g.classList.remove(P + "lift");
      const near = p.x > B0.x - 110 && p.x < B0.x + BS + 110 && p.y > B0.y - 110 && p.y < B0.y + BS + 110;
      if (!cancel && near) {
        if (isKey(p) && word !== "hope") {
          back(p, prev, word === "rcc" ? "It will not set. The word was not the one." : "It will not set. There is no word for it to set on.");
          return;
        }
        if (!isKey(p) && prev && !prev.set && load < SET_COST) { back(p, prev, "Reese has no Load left for another pane."); return; }
        if (!isKey(p) && prev && prev.set && Math.hypot(prev.x - p.x, prev.y - p.y) < 1) { /* put back */ }
        const s = snapped(p, p.x, p.y, p.rot, p.flip);
        if (s) { commit(p, s.x, s.y, prev); return; }
        back(p, prev, why(p, p.x, p.y, p.rot, p.flip));
        return;
      }
      if (cancel && prev && prev.set) { back(p, prev, "Put back."); return; }
      sendHome(p); refresh();
      say(prev && prev.set ? "Taken out. The gap is open again." : "Back in the tray.");
    }
    function back(p, prev, msg) {   // return a pane to where it came from
      if (prev && prev.set) { p.x = prev.x; p.y = prev.y; p.rot = prev.rot; p.flip = prev.flip; p.set = true; paint(p); }
      else { p.rot = prev ? prev.rot : p.rot; sendHome(p); }
      refresh(); say(msg);
    }

    // pointer
    let drag = null;
    function world(e) {
      const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(m.inverse()); return { x: q.x, y: q.y };
    }
    on(svg, "pointerdown", (e) => {
      if (mode !== "play" || (e.button != null && e.button > 0)) return;
      const el = e.target.closest && e.target.closest("." + P + "piece"); if (!el) return;
      const p = byId(el.getAttribute("data-id")); if (!p) return;
      const w = world(e);
      drag = { p, id: e.pointerId, cx: e.clientX, cy: e.clientY, dx: p.x - w.x, dy: p.y - w.y, moved: false };
      try { svg.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
      e.preventDefault();
    });
    on(svg, "pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) {
        if (Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) < 5) return;
        if (!beginLift(drag.p, "pointer")) { drag = null; return; }
        drag.moved = true;
      }
      const w = world(e); drag.p.x = w.x + drag.dx; drag.p.y = w.y + drag.dy; paint(drag.p);
    });
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      try { svg.releasePointerCapture(e.pointerId); } catch { /* ok */ }
      if (d.moved) endLift(e.type === "pointercancel"); else { choose(d.p); d.p.g.focus({ preventScroll: true }); }
    };
    on(svg, "pointerup", up); on(svg, "pointercancel", up);
    on(svg, "wheel", (e) => {
      if (mode !== "play") return;
      const el = e.target.closest && e.target.closest("." + P + "piece"); if (!el) return;
      e.preventDefault(); const p = byId(el.getAttribute("data-id")); choose(p, true); turn(p, e.deltaY > 0 ? 45 : -45);
    }, { passive: false });

    // rotate and flip
    function turn(p, d) {
      if (!p || mode !== "play") { if (!p) say("Choose a pane first."); return; }
      const old = { rot: p.rot, flip: p.flip };
      p.rot = (((p.rot + d) % 360) + 360) % 360;
      if (p.set && !lift) { const keep = valid(p, p.x, p.y, p.rot, p.flip); if (!keep) { p.rot = old.rot; say("There is no room to turn it there. Take it out first."); return; } refresh(); }
      paint(p); clearHint();
    }
    function mirror(p) {
      if (!p || mode !== "play") { if (!p) say("Choose a pane first."); return; }
      p.flip = !p.flip;
      if (p.set && !lift && !valid(p, p.x, p.y, p.rot, p.flip)) { p.flip = !p.flip; say("There is no room to flip it there. Take it out first."); return; }
      paint(p); clearHint();
    }
    const pick = () => sel || pcs.find((p) => !p.set) || pcs[0];
    on(bRot, "click", () => { const p = pick(); if (p && p !== sel) choose(p, true); turn(p, 45); });
    on(bFlip, "click", () => { const p = pick(); if (p && p !== sel) choose(p, true); mirror(p); });
    on(bOut, "click", () => { if (sel && sel.set && mode === "play") { sendHome(sel); refresh(); say("Taken out. The gap is open again."); } });

    // keyboard
    on(wrap, "keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (mode === "intro" || mode === "word" || mode === "confirm" || mode === "over") return;
      const k = e.key, f = e.target && e.target.closest ? e.target.closest("." + P + "piece") : null;
      if (e.target && e.target.tagName === "BUTTON" && (k === "Enter" || k === " ")) return;
      if (mode !== "play") return;
      if (k === "?" || (k === "/" && e.shiftKey)) { showHelp(); e.preventDefault(); return; }
      if (k >= "1" && k <= "7") { const p = pcs[+k - 1]; if (p) { choose(p); p.g.focus({ preventScroll: true }); } e.preventDefault(); return; }
      if (k === "h" || k === "H") { hint(); e.preventDefault(); return; }
      const p = f ? byId(f.getAttribute("data-id")) : sel;
      if (!p) return;
      if (k === "r" || k === "R") { turn(p, e.shiftKey ? -45 : 45); e.preventDefault(); return; }
      if (k === "f" || k === "F") { mirror(p); e.preventDefault(); return; }
      if (k === "Escape") { if (lift) { endLift(true); e.preventDefault(); } return; }
      if (k === "u" || k === "U" || k === "Backspace" || k === "Delete") { if (lift) endLift(true); if (p.set) { sendHome(p); refresh(); say("Taken out. The gap is open again."); } e.preventDefault(); return; }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        if (lift && lift.p === p) { endLift(false); return; }
        if (!p.set) { if (!beginLift(p, "key")) return; p.x = B0.x + BS / 2; p.y = B0.y + BS / 2; paint(p); say("Held over the breach. Arrows move it, R turns, F flips, Enter sets it, Esc puts it back."); }
        else beginLift(p, "key");
        return;
      }
      if (k.startsWith("Arrow")) {
        e.preventDefault();
        if (!(lift && lift.p === p)) { if (!beginLift(p, "key")) return; if (!p.set && !lift.prev.set) { p.x = B0.x + BS / 2; p.y = B0.y + BS / 2; } }
        const s = e.shiftKey ? UNIT : UNIT / 4;
        p.x += k === "ArrowRight" ? s : k === "ArrowLeft" ? -s : 0; p.y += k === "ArrowDown" ? s : k === "ArrowUp" ? -s : 0;
        paint(p);
      }
    });

    // ---- the hint --------------------------------------------------------------------------------------------------------------------------
    function clearHint() { gGhost.textContent = ""; if (hintT) { clearTimeout(hintT); timers.delete(hintT); hintT = null; } }
    function hint() {
      if (mode !== "play") return;
      clearHint();
      const free = pcs.filter((p) => !p.set && (!isKey(p) || (word === "hope" && pcs.filter((q) => q.set && !isKey(q)).length >= NEED)));
      for (const t of SOL) {
        if (pcs.some((q) => q.set && overlaps(pose(q), t.poly))) continue;
        const p = free.find((q) => q.sh.type === t.type); if (!p) continue;
        const m = matchPose(p.sh, t.poly); if (!m) continue;
        p.rot = m.rot; p.flip = m.flip; paint(p); choose(p, true);
        sv("polygon", { points: t.poly.map((q) => q.join(",")).join(" "), fill: GOLD, "fill-opacity": 0.28, stroke: "#fff", "stroke-width": 3, "stroke-dasharray": "8 6" }, gGhost);
        say(`${page === 1 ? "<b>" + esc(FACES[p.id].name) + "</b>'s pane" : isKey(p) ? "The keystone" : "This pane"} fits here, turned to match. Drag it in.`);
        hintT = later(clearHint, 7000);
        return;
      }
      say("What is set is in the way of every free pane. Take one out and try it another way round.");
    }

    // ---- the flinch (RCC at the hub) -----------------------------------------------------------------------------------------------------------
    function flinch() {
      flashed = true; mode = "out"; clearHint();
      const n = Math.max(3, flinches());
      pcs.filter((p) => p.set).forEach((p) => {
        const q = pose(p);
        sv("polygon", { points: q.map((v) => v.map((z) => z.toFixed(1)).join(",")).join(" "), fill: "#0b0e0e", "fill-opacity": 0.9, stroke: "#6d7a78", "stroke-width": 2 }, gOut);
      });
      sv("rect", { x: 0, y: 0, width: CARD_W, height: lay.lay === "l" ? CARD_H : CROP_H, fill: "#000", "fill-opacity": 0.22 }, gOut);
      refresh();
      let left = n;
      const tick = () => {
        if (dead) return;
        say(`He lifts it. <i>${esc(FLASH)}.</i> Every pane is out: ${left}`);
        if (left <= 0) {
          gOut.textContent = ""; mode = "play"; refresh();
          say("The panes come back. The keystone is not set. It is in the tray, and he is still holding the word.");
          return;
        }
        left--; later(tick, 1000);
      };
      tick();
    }

    // ---- cards (overlays) -------------------------------------------------------------------------------------------------------------------------
    function card(label) {
      const ov = mk("div", P + "ov", wrap); const c = mk("div", P + "card", ov);
      c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "true"); c.setAttribute("aria-label", label);
      return { ov, c };
    }
    function btn(parent, text, go, fn) { const b = mk("button", P + "btn" + (go ? " " + P + "go" : ""), parent, text); b.type = "button"; on(b, "click", fn); return b; }
    function focusSoon(el) { later(() => { if (!dead && el) el.focus({ preventScroll: true }); }, 30); }

    function showHelp(startAfter) {
      const prev = mode; if (mode === "play") mode = "intro";
      const { ov, c } = card("Panes: how to play");
      mk("div", P + "kick", c, `Dr. Tox: Finale · 1D · No. ${page} · ${page === 1 ? "The atrium" : "The hub"} · 2240`);
      mk("h2", null, c, "Panes");
      const q = mk("blockquote", null, c); q.textContent = "“projects hard-light physical barriers”"; mk("cite", null, q, "Bible, Part VI, Aegis");
      if (page === 1) mk("p", null, c, "The State has ordered the breach sealed full. Seven hard-light panes, the tangram set, fit the outline exactly. Each pane you set costs Load, and fumes come through every gap each turn: Reese takes them in. A pane left out is a gap, and each gap is a person at the crack, named on the card's back.");
      else mk("p", null, c, "Dr. Tox is on the other side of the breach, and the order is to seal the hub with him outside. Set six panes as usual. The seventh is the keystone: it sets only on the word HOPE, and only after the six. Set it, or keep it in Reese's hand.");
      const ul = mk("ul", null, c);
      [["Drag", "A pane into the outline. It snaps to the corners. Drag a set pane back out to take it away."],
        ["Turn", "Rotate (R, or the wheel) in 45 degree steps. Flip (F) for the parallelogram."],
        ["Keys", "Tab to a pane, Enter lifts it, arrows move it (Shift: a unit), Enter sets it, Esc puts it back."],
        ["Hint", "Shows where a free pane fits, turned to match."],
        ["Finish", page === 1 ? "Confirm when you are done: with every pane set, or with gaps." : "Confirm when the six are set: with the keystone set or in his hand."]]
        .forEach(([b, t]) => { const li = mk("li", null, ul); mk("b", null, li, b); li.append(t); });
      mk("p", P + "note", c, "Panes, Load and the names of the stickers are the game's own. There is no failing: the page ends when you confirm.");
      const bt = mk("div", P + "btns", c);
      const go = btn(bt, startAfter ? "Begin" : "Back to the card", true, () => { ov.remove(); mode = prev === "play" ? "play" : prev; if (startAfter) startAfter(); });
      focusSoon(go);
    }

    function showBack() {
      if (page !== 1 || mode !== "play") return;
      const prev = mode; mode = "intro";
      const { ov, c } = card("The card's back: names at the crack");
      mk("div", P + "kick", c, "The card's back");
      mk("h2", null, c, "At the crack");
      const bk = mk("div", P + "back", c);
      const u = url("panes-card-back"); if (u) bk.style.backgroundImage = `url("${u}")`;
      const names = ORDER.map((id) => ({ id, ...FACES[id] }));
      const col = [55, 285], row = [290, 394, 498, 602];
      const bw = bk.clientWidth || 340, k = bw / CARD_W;
      for (let i = 0; i < 8; i++) {
        const s = mk("div", P + "stick" + (names[i] && !byId(names[i].id).set ? " " + P + "lit" : ""), bk);
        s.style.left = (col[i % 2] / CARD_W) * 100 + "%"; s.style.top = (row[(i / 2) | 0] / CARD_H) * 100 + "%";
        s.style.width = (210 / CARD_W) * 100 + "%"; s.style.height = (70 / CARD_H) * 100 + "%";
        s.style.fontSize = Math.max(10, Math.round(21 * k)) + "px";
        if (names[i]) s.textContent = names[i].name; else s.style.opacity = 0.35;
      }
      const lit = names.filter((n) => !byId(n.id).set);
      if (lit.length) { const ul = mk("ul", P + "wants", c); lit.forEach((n) => { const li = mk("li", null, ul); const b = mk("b", null, li, n.name); li.append(": " + n.want.toLowerCase() + "."); }); }
      else mk("p", null, c, "Every sticker is dark. No one comes through.");
      const bt = mk("div", P + "btns", c);
      const go = btn(bt, "Turn it over", true, () => { ov.remove(); mode = prev; });
      focusSoon(go);
    }

    // ---- confirming ---------------------------------------------------------------------------------------------------------------------------------
    on(bOk, "click", () => { if (mode === "play") confirmCard(); });
    on(helpBtn, "click", () => { if (mode === "play") showHelp(); });
    on(nameBtn, "click", showBack);
    function confirmCard() {
      clearHint(); if (lift) endLift(true);
      mode = "confirm";
      const { ov, c } = card("Confirm the card");
      if (page === 1) {
        const out = pcs.filter((p) => !p.set);
        mk("div", P + "kick", c, "No. 1 · The atrium");
        if (!out.length) { mk("h2", null, c, "Sealed full"); mk("p", null, c, "Every pane is set. The State's order is kept, and nobody comes through."); }
        else {
          mk("h2", null, c, `${out.length} gap${out.length > 1 ? "s" : ""} left`);
          mk("p", null, c, "Each gap is a person at the crack, and the clean air is theirs for as long as it holds:");
          const ul = mk("ul", P + "wants", c); out.forEach((p) => { const li = mk("li", null, ul); mk("b", null, li, FACES[p.id].name); li.append(": " + FACES[p.id].want.toLowerCase() + "."); });
          mk("p", P + "note", c, "The order was a full seal. Confirm, or keep working.");
        }
        const bt = mk("div", P + "btns", c);
        const yes = btn(bt, out.length ? "Confirm with gaps" : "Confirm", true, () => { ov.remove(); commitPage1(out); });
        btn(bt, "Keep working", false, () => { ov.remove(); mode = "play"; refresh(); });
        focusSoon(out.length ? bt.lastChild : yes);
      } else {
        const key = byId("medium").set;
        mk("div", P + "kick", c, "No. 2 · The hub");
        if (key) {
          mk("h2", null, c, "Seal the hub");
          mk("p", null, c, "The keystone sets. The hub is whole, lit from inside, and Dr. Tox is on the gallery side of the glass.");
          mk("p", P + "note", c, "This is the Light Bringer's Wall. Confirm, or take the keystone out and keep it in his hand.");
        } else {
          mk("h2", null, c, "Leave room");
          mk("p", null, c, word === "hope" ? "The keystone stays in Reese's hand. One gap is left in the glass: the width of one man." : "The keystone does not set. One gap is left in the glass: the width of one man.");
          mk("p", P + "note", c, "Confirm, or keep working.");
        }
        const bt = mk("div", P + "btns", c);
        const no = btn(bt, key ? "Take it back" : "Keep working", false, () => { ov.remove(); mode = "play"; refresh(); });
        btn(bt, key ? "Seal the hub" : "Leave the room", true, () => { ov.remove(); commitPage2(key); });
        focusSoon(no);   // the weight is in the asking: focus starts on the way back
      }
    }

    function commitPage1(out) {
      mode = "over";
      const got = out.map((p) => ({ name: FACES[p.id].name, want: FACES[p.id].want }));
      sset("load", Math.round(load));
      sset("panes.atrium_gaps", out.length);
      sset("panes.let_in", got);
      const prevAdd = num("panes.p1_flinch", 0);
      sset("reese.flinches", Math.max(0, flinches() - prevAdd + 1)); sset("panes.p1_flinch", 1);
      results.push({ n: 1, gaps: out.length });
      try { api.store.set("last", { page: 1, gaps: out.length }); } catch { /* storage off */ }
      later(() => {
        if (dead) return;
        const { ov, c } = card("The atrium, after");
        mk("div", P + "kick", c, "No. 1 · The atrium · after");
        mk("h2", null, c, out.length ? "Let in" : "Sealed");
        if (out.length) mk("p", null, c, `${got.map((g) => g.name).join(", ")} ${got.length > 1 ? "come" : "comes"} through and sit${got.length > 1 ? "" : "s"} on clean stone. Load ${Math.round(load)}.`);
        else mk("p", null, c, `The breach is covered. Nobody is let in. Load ${Math.round(load)}.`);
        mk("p", null, c, "A woman's voice comes on his channel, warm.");
        const q = mk("blockquote", null, c); q.textContent = `“${SENTENCE}”`; mk("cite", null, q, "Bible, Part VIII, Scene 2");
        mk("p", null, c, `The leash fires: a flinch. On record: ${flinches()}.`);
        const bt = mk("div", P + "btns", c);
        const nx = btn(bt, "Next: the hub", true, () => { ov.remove(); beginPage(2); });
        focusSoon(nx);
      }, RM ? 0 : 400);
    }

    function commitPage2(key) {
      mode = "over";
      sset("load", Math.round(load));
      sset("panes.sealed", !!key);
      results.push({ n: 2, sealed: !!key });
      try { api.store.set("last", { page: 2, sealed: !!key }); } catch { /* storage off */ }
      const text = key
        ? "Reese said HOPE and set the keystone. The hub is sealed, and Dr. Tox is on the gallery, outside, with the hard light between them. Reese does not look away. The wall stands, whole and lit from inside."
        : word === "hope"
          ? "Reese said HOPE and kept the keystone in his hand. The glass has one gap in it, the width of one man. The doctor steps through."
          : word === "rcc"
            ? "Reese said RCC, and the keystone did not set. The glass has one gap in it, the width of one man. The doctor steps through."
            : "The keystone had no word to set on, and the glass has one gap in it, the width of one man. The doctor steps through.";
      later(() => { if (!dead) api.end({ outcome: key ? "done" : "win", text }); }, RM ? 0 : 500);
    }

    // ---- pages --------------------------------------------------------------------------------------------------------------------------------------
    function layout() {
      const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H || !tray) return;
      const sL = Math.min(W / 1150, H / 780), sP = Math.min(W / CARD_W, H / (CROP_H + 14 + tray.h + 24));
      const L = sL >= sP ? "l" : "p";
      lay = L === "l" ? { lay: "l", ox: 590, oy: Math.max(30, (CARD_H - tray.h) / 2) } : { lay: "p", ox: 0, oy: CROP_H + 26 };
      wrap.setAttribute("data-lay", L);
      svg.setAttribute("viewBox", L === "l" ? `0 0 1150 ${CARD_H}` : `0 0 ${CARD_W} ${CROP_H + 14 + tray.h + 24}`);
      drawCard();
      gShelf.textContent = "";
      const sx = L === "l" ? 574 : 0, sy = L === "l" ? lay.oy - 18 : CROP_H + 8, sw = L === "l" ? 576 : CARD_W, sh = tray.h + 36;
      sv("rect", { x: sx + 3, y: sy, width: sw - 6, height: sh, rx: 18, fill: "url(#" + P + "foil)", opacity: 0.2 }, gShelf);
      sv("rect", { x: sx + 3, y: sy, width: sw - 6, height: sh, rx: 18, fill: "none", stroke: PALE, "stroke-width": 3, "stroke-opacity": 0.6 }, gShelf);
      gTray.textContent = "";
      pcs.forEach((p) => {
        const h = homeOf(p);
        if (!p.set && !(lift && lift.p === p)) { p.x = h.x; p.y = h.y; paint(p); }
        if (page === 1) { const t = sv("text", { x: h.lx, y: h.ly, "text-anchor": "middle", "font-size": 22, "font-family": "sans-serif", "font-weight": 700, fill: PALE }, gTray); t.textContent = FACES[p.id].name.split(" ")[0]; }
      });
      refresh();
    }

    function beginPage(n) {
      page = n; load = LOAD_START; flashed = false; sel = null; lift = null; mode = "intro";
      gOut.textContent = ""; gGhost.textContent = ""; gFumes.textContent = "";
      noEl.textContent = n === 1 ? "No. 1 · The atrium · 2240" : "No. 2 · The hub · 2240";
      nameBtn.style.display = n === 1 ? "" : "none";
      makePieces(); buildTray(); pcs.forEach((p) => { const h = { x: 0, y: 0 }; p.x = h.x; p.y = h.y; });
      layout();
      pcs.forEach((p) => sendHome(p));
      refresh();
      say(n === 1 ? "The State's order: seal the breach full." : "Dr. Tox is on the other side of the glass. The State's order: seal the hub with him outside.");
      const start = () => { mode = "play"; refresh(); say(n === 1 ? "The State's order: seal it full. Drag the panes in. A pane left out is a gap, and a name." : "Six panes set as usual. The seventh, the keystone, is the last, and it sets only on a word."); const f = pcs[0]; f.g.focus({ preventScroll: true }); };
      if (n === 2) {
        const w = sget("reese.hub_word", null);
        if (w === "hope" || w === "rcc" || w === "silent") {
          if (sget("panes.word_by_panes", false)) askWord(start); else { word = w; start2(start); }
        } else askWord(start);
      } else showHelp(start);
    }
    function start2(start) { showHelp(start); }
    function askWord(start) {
      mode = "word";
      const { ov, c } = card("The Word");
      mk("div", P + "kick", c, "No. 2 · The hub · the Word");
      mk("h2", null, c, "The Word");
      mk("p", null, c, "Dr. Tox is on the other side of the breach, and the State's order is on the channel: seal the hub. Reese has one word at the glass. Only HOPE sets the keystone.");
      const ws = mk("div", P + "words", c);
      const OPTS = [["hope", "hud-word-hope", "HOPE", "The keystone will set, if he wants it to."], ["rcc", "hud-word-rcc", "RCC", "The leash fires. Every pane goes out, one second per flinch on record."], ["silent", "hud-word-silence", "Say nothing", "The keystone has no word to set on."]];
      let first = null;
      for (const [id, art, lab, sub] of OPTS) {
        const b = mk("button", null, ws); b.type = "button";
        const u = url(art);
        if (u) { const i = mk("img", null, b); i.src = u; i.alt = ""; i.draggable = false; }
        const s = mk("span", null, b); s.innerHTML = `<b>${esc(lab)}</b><br>${esc(sub)}`;
        on(b, "click", () => {
          word = id; sset("reese.hub_word", id); sset("panes.word_by_panes", true);
          if (id === "rcc") { sset("reese.said_rcc", true); const had = num("panes.p2_flinch", 0); sset("reese.flinches", Math.max(0, flinches() - had + 1)); sset("panes.p2_flinch", 1); }
          else { const had = num("panes.p2_flinch", 0); if (had) { sset("reese.flinches", Math.max(0, flinches() - had)); sset("panes.p2_flinch", 0); } }
          ov.remove(); refresh(); showHelp(start);
        });
        if (!first) first = b;
      }
      mk("p", P + "note", c, "In the whole game the Word is chosen in the gallery before this page. It is asked here only because that scene has not set it.");
      focusSoon(first);
    }

    // ---- sizing and teardown -------------------------------------------------------------------------------------------------------------------------
    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(() => { if (!dead) layout(); }); ro.observe(stage); }
    else on(window, "resize", () => { if (!dead) layout(); });

    wrap.__panes = {
      get mode() { return mode; }, get page() { return page; }, get load() { return load; }, get word() { return word; },
      get pcs() { return pcs; }, get gaps() { return gaps; }, SOL, SHAPES, matchPose, svg, results,
      toScreen(x, y) { const m = svg.getScreenCTM(); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return { x: q.x, y: q.y }; },
    };

    beginPage(1);

    return {
      unmount() {
        dead = true;
        timers.forEach(clearTimeout); timers.clear();
        if (ro) ro.disconnect();
        offs.forEach((f) => f()); offs.length = 0;
        wrap.remove(); style.remove();
      },
    };
  },
};

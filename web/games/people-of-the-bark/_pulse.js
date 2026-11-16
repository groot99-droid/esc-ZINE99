// People of the Bark — the long puzzle (phase 3): the Pulse map, kept in the back pages of Old Resin's book.
// Not a mode: the catalog never lists it. DEEP_DIVE.md section 3, "The long puzzle", and DESIGN.md section 21.
//
// Seven notes go into the book, one from each mode (api.shared "map.<id>"), each in the voice of the one who
// found it. The map strip itself shows the chalk marks once the autumn sitting held both of them; the other notes
// are words. When all seven are in, the map can be read at the Tremor Scroll (the mode the plan names): the
// player rings the plate the second tap will find (the Sounding), the three taps are answered as rings, and the
// city chooses how to answer the plate. That choice, and how loud the Pulse is, decide which ending the year
// earns (api.shared "finale"); loading.js shows it in the menu. A solved year is counted (api.shared "runs"):
// from then on the modes read differently (the second playthrough, DEEP_DIVE.md section 3).
//
// Everything a viewer can reach is a button: the tab, the plates (arrow keys move between them), the answers.

const Q = "people-of-the-bark-pulse-";
const CHALK = "#b9c2c4";
// the map strip's grid (art/src/70_tremor_scroll.py): 4 plates across, 13 down from the Crown, in 420 x 1100
const MAP = { x0: 110, y0: 96, cw: 62, ch: 70, cols: 4, rows: 13, w: 420, h: 1100, tap: [2, 6] };
const plateBox = (i, j) => `left:${((MAP.x0 + i * MAP.cw + 4) / MAP.w * 100).toFixed(2)}%;top:${((MAP.y0 + j * MAP.ch + 4) / MAP.h * 100).toFixed(2)}%;width:${((MAP.cw - 8) / MAP.w * 100).toFixed(2)}%;height:${((MAP.ch - 8) / MAP.h * 100).toFixed(2)}%`;

// The seven notes. `no(i, j)` is true for a plate the note rules out (columns and plates counted from 0).
export const PIECES = [
  { id: "scroll", who: "fenn", name: "Fenn", mode: "Tremor Scroll", how: "the autumn sitting, both chalk marks right",
    text: "“The chalk marks gather from the sixth plate down to the eighth, under Highridge. I shaded them.”", no: (i, j) => j < 5 || j > 7 },
  { id: "sorrel", who: "sorrel", name: "Sorrel", mode: "Crack runner", how: "the spring run, Sorrel's wall",
    text: "“The outer plates are thick, the way a wall should be. It ticks in the two middle columns. Nowhere else.”", no: (i) => i === 0 || i === 3 },
  { id: "blank", who: "pell", name: "Elder Pell", mode: "Omen Spread", how: "the night of the Pulse, the blank card turned",
    text: "“It woke the east terraces, the two right-hand columns. The west slept through it.”", no: (i) => i < 2 },
  { id: "wall", who: "burr", name: "Captain Burr", mode: "Crack defence", how: "the autumn ants, either reading",
    text: "“The ants hunted the whole eighth plate, end to end, and found nothing there to eat.”", no: (i, j) => j === 7 },
  { id: "arc", who: "hollow", name: "Chanter Hollow", mode: "The Ring Door", how: "the Heartwood Door, opened",
    text: "“The Heartwood is the third plate down. The lantern went four plates lower before the paper walls began.” He does not chant it.", no: (i, j) => j < 6 },
  { id: "plug", who: "resin", name: "Old Resin", mode: "Sap Kitchen", how: "the thirteenth page",
    text: "“Sour sap only comes from a tap over a gallery. This winter only the third column ran sour.”", no: (i) => i !== 2 },
  { id: "shadow", who: "twig", name: "Twig", mode: "Trunk and Shadow", how: "winter, playing the Shadow",
    text: "“It goes where the last knock came from. So the Hand's first tap goes where we carved most, and the second goes to whatever knocks back.”", no: () => false },
];
// The four answers the city can give the plate, and what each earns (DESIGN.md section 21, "In the web build").
const ANSWERS = [
  { id: "mend", who: "resin", label: "Clear it, and plug it", by: "Old Resin and Sorrel's listeners" },
  { id: "pour", who: "hollow", label: "Keep it holy: pour the Great Offering into it", by: "the Knot" },
  { id: "watch", who: "burr", label: "Stand a watch on it", by: "the Battlements" },
  { id: "record", who: "fenn", label: "Write it down, a thing with no face", by: "the Scroll House" },
];
// The endings as the finale tells them. Lines in quotation marks at the end of the Shadow Passes are the
// author's, verbatim: creative-writing/vault/05_Worldbuilding/01_People_of_the_Bark.md. The others are added.
export const FINALES = {
  the_ring: { title: "The Ring", key: "ending-the-ring", art: "ending-the-ring",
    text: "The Knot poured the Great Offering into the plate the map rang, and at the second tap the Trunk sounded like a drum. The hand went away and came back, and when the light returned a band of colour circled the whole world; the people took it for a covenant, and Fenn put her chalk away while the tapping under Highridge went on, fed. Over the fence, the stump the yard has shown since spring has grass grown up round it. The god had left them a ring. They counted it with the others." },
  shadow_passes: { title: "The Shadow Passes", key: "ending-shadow-passes", art: "ending-the-shadow-passes", as_written: true,
    text: "The plate the map rang was cleared and plugged before the dark, and at the second tap it answered thin but held. The hand pressed a crack, looking for termites, and went away, and nothing was settled: it will come again, and nobody on the bark will ever know why. At the feast Fenn lays her ear on the wall and listens. Even the smallest world is a universe to the ones who live in it." },
  shadow_passes_fed: { title: "The Shadow Passes", key: "ending-shadow-passes", art: "ending-the-shadow-passes", as_written: true,
    text: "The Knot poured what the city had into the plate the map rang, and the Pulse was too quiet to drink it all: the bark held, the hand pressed a crack and went away, and nothing was settled. The sap is gone and the tapping goes on, fainter, under Highridge. At the feast Fenn lays her ear on the wall and listens. Even the smallest world is a universe to the ones who live in it." },
  war_on_the_god: { title: "The War on the God", key: "ending-war-on-the-god", art: "ending-the-war-on-the-god",
    text: "Burr's watch stood on the plate the map rang, and when the second tap came down there they struck it. The hand jerked away before the third, so the question it was asking was never finished; Fenn's last entry is the next seventh day, already inked. Names go on the Roll beside Burr's, and his is cut larger. They won. The Trunk will remember it as long as they do." },
  the_flake: { title: "The Flake", key: "ending-the-flake", art: "ending-the-flake",
    text: "Burr's watch stood on the plate the map rang, and the Pulse under it was loud. At the second tap the plate gave, and the flake came away with twelve of them on it. In the yard it lies face down in the grass, and its underside is not solid: Underhollow's name is cleared, too late for anyone who could be told. The Trunk shrugged. They began again." },
  edge_of_the_world: { title: "The Edge of the World", key: "ending-edge-of-the-world", art: "ending-the-edge-of-the-world",
    text: "The Scroll House wrote the plate the map rang into its record, a mark with no face, and let it stand. When the light came back Fenn drew the first map with an edge on it, and then a second edge, inside, round the plates the Pulse lives behind; the heresy is double, and the Knot will not forgive the second. They did not know what lay past the edge. They knew there was one." },
};

const sh = (api) => api.shared || { get: (k, d) => d, set() {} };
export const runs = (api) => Math.max(0, sh(api).get("runs", 0) | 0);
export const secondRun = (api) => runs(api) >= 1;
export const pulseOf = (shared) => { const p = shared.get("pulse", 40); return typeof p === "number" ? p : 40; };
// The Great Offering is five pots of gold tears, two each: the Ring wants the Pulse at 60 once it is poured.
export const ringEarned = (p) => p + 10 >= 60;
export const have = (shared) => PIECES.filter((x) => !!shared.get("map." + x.id, false));

// The finale for loading.js: the ending the last solved year earned, or null.
export function finaleFor(shared, keyart) {
  const f = shared.get("finale", null);
  const F = f && FINALES[f.id];
  if (!F) return null;
  return { title: F.title, text: F.text, image: (keyart && keyart(F.key)) || "" };
}

const CSS = `
.${Q}tab{position:absolute;left:0;top:var(--${Q}top,34%);z-index:32;display:flex;align-items:center;gap:6px;writing-mode:vertical-rl;transform:rotate(180deg);min-width:28px;padding:10px 4px;font:11px ui-monospace,monospace;letter-spacing:.14em;color:#efe2c4;background:rgba(27,18,12,.9);border:1px solid ${CHALK};border-right:0;border-radius:3px 0 0 3px;cursor:pointer;box-shadow:-2px 0 0 #0d0805}
.${Q}tab:hover,.${Q}tab:focus-visible{border-color:#f0c050;outline:none;box-shadow:0 0 0 2px #f0c050}
.${Q}tab svg{width:16px;height:20px;flex:none;transform:rotate(90deg)}
.${Q}tab b{font-weight:400;color:#f0c050}
.${Q}tab.${Q}full{border-color:#f0c050;background:rgba(58,40,28,.95)}
.${Q}tab.${Q}right{left:auto;right:0;transform:none;box-shadow:2px 0 0 #0d0805}
.${Q}veil{position:absolute;inset:0;z-index:40;overflow:auto;background:rgba(14,9,6,.93);padding:12px;box-sizing:border-box;font-family:'Cormorant Garamond',Georgia,serif;color:#2e2016}
.${Q}book{max-width:820px;margin:0 auto;box-sizing:border-box;background:linear-gradient(180deg,#f3e6c6,#e6d3aa);border:1px solid #7a5a40;box-shadow:6px 6px 0 #0d0805;padding:14px 16px 16px;display:grid;grid-template-columns:minmax(110px,190px) minmax(0,1fr);gap:14px}
.${Q}book h2{grid-column:1/-1;margin:0;font:400 24px 'IM Fell English',Georgia,serif;color:#a8321e;display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap}
.${Q}book h2 small{font:12px ui-monospace,monospace;letter-spacing:.14em;color:#5a3d2b}
.${Q}map{position:relative;line-height:0;align-self:start;box-shadow:0 2px 0 rgba(58,40,28,.4)}
.${Q}map img{width:100%;height:auto;display:block}
.${Q}map i{position:absolute;background:repeating-linear-gradient(35deg,rgba(93,103,106,.85) 0 1.5px,rgba(185,194,196,.5) 1.5px 5px);pointer-events:none}
.${Q}map button{position:absolute;background:transparent;border:0;padding:0;cursor:pointer}
.${Q}map button:hover,.${Q}map button:focus-visible{outline:3px solid #d9902a;outline-offset:-2px;background:rgba(240,192,80,.3)}
.${Q}map button.${Q}miss{outline:3px solid #b8402a;background:rgba(184,64,42,.3)}
.${Q}map button.${Q}hit{outline:3px solid #5f7a3a;background:rgba(196,214,90,.35)}
.${Q}ring{position:absolute;border:3px solid #a8321e;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;animation:${Q}ring 1.6s ease-out forwards}
.${Q}ring.${Q}chalk{border-color:#5d676a;border-style:double;border-width:5px}
@keyframes ${Q}ring{0%{width:6%;height:2.4%;opacity:1}100%{width:60%;height:24%;opacity:0}}
.${Q}notes{display:flex;flex-direction:column;gap:7px;min-width:0}
.${Q}note{display:flex;gap:8px;align-items:flex-start;border-bottom:1px dashed rgba(58,40,28,.4);padding-bottom:6px;font-size:16px;line-height:1.3}
.${Q}note img{width:34px;height:34px;flex:none;border-radius:50%}
.${Q}note b{display:block;font:11px ui-monospace,monospace;letter-spacing:.12em;color:#5a3d2b}
.${Q}note.${Q}gap{opacity:.55;font-style:italic}
.${Q}note.${Q}gap img{filter:grayscale(1);opacity:.5}
.${Q}loud{font:12px ui-monospace,monospace;letter-spacing:.1em;color:#3d4a4f;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.${Q}loud svg{height:16px;width:auto}
.${Q}say{font-style:italic;font-size:17px;line-height:1.35;color:#3a281c;margin:0}
.${Q}say b{font-style:normal;color:#a8321e}
.${Q}acts{display:flex;flex-wrap:wrap;gap:8px}
.${Q}acts button,.${Q}ans button{font:inherit;font-size:17px;min-height:44px;padding:6px 12px;border:1px solid #3a281c;background:rgba(255,248,230,.7);color:#2e2016;cursor:pointer;border-radius:2px;text-align:left}
.${Q}acts button.${Q}go{background:#a8321e;color:#efe2c4;border-color:#a8321e}
.${Q}acts button:hover,.${Q}ans button:hover{background:#fff6dc}.${Q}acts button.${Q}go:hover{background:#c0442e}
.${Q}veil button:focus-visible{outline:3px solid #e8742a;outline-offset:2px}
.${Q}ans{display:grid;gap:6px}
.${Q}ans button{display:flex;gap:8px;align-items:center}
.${Q}ans button img{width:32px;height:32px;border-radius:50%;flex:none}
.${Q}ans button small{display:block;font:11px ui-monospace,monospace;letter-spacing:.1em;color:#5a3d2b}
.${Q}end{grid-column:1/-1;margin:0;background:#1b120c;color:#efe2c4;padding:8px;border:1px solid #7a5a40}
.${Q}end img{display:block;width:100%;height:auto;max-height:52vh;object-fit:contain}
.${Q}end figcaption{font:italic 17px/1.4 'Cormorant Garamond',Georgia,serif;padding:8px 4px 2px}
.${Q}end figcaption b{display:block;font:400 13px ui-monospace,monospace;letter-spacing:.2em;color:#f0c050;font-style:normal;margin-bottom:4px}
.${Q}flash{position:absolute;left:50%;top:48px;transform:translateX(-50%);z-index:26;max-width:min(560px,calc(100% - 20px));box-sizing:border-box;background:rgba(239,226,196,.97);color:#2e2016;border:1px solid #7a5a40;border-left:5px solid ${CHALK};font:16px/1.35 'Cormorant Garamond',Georgia,serif;padding:6px 12px;pointer-events:none;transition:opacity .6s;display:flex;gap:8px;align-items:flex-start}
.${Q}flash img{width:30px;height:30px;border-radius:50%;flex:none}
.${Q}flash b{display:block;font:400 11px ui-monospace,monospace;letter-spacing:.14em;color:#5a3d2b}
@media (max-width:560px){.${Q}tab{min-width:20px;padding:6px 2px;font-size:10px;letter-spacing:.08em;gap:3px}.${Q}tab svg{display:none}.${Q}book{grid-template-columns:104px minmax(0,1fr);gap:10px;padding:10px}.${Q}book h2{font-size:20px}.${Q}note{font-size:15px}.${Q}note img{width:28px;height:28px}}
@media (prefers-reduced-motion:reduce){.${Q}ring{animation:none;opacity:.8;width:40%;height:16%}.${Q}flash{transition:none}}`;

function style(root) {
  if (root.querySelector("style[data-" + Q + "s]")) return;
  const s = document.createElement("style"); s.setAttribute("data-" + Q + "s", ""); s.textContent = CSS; root.appendChild(s);
}
const markImg = (art, who, alt = "") => (art && art.has("mark-" + who) ? `<img src="${art.url("mark-" + who)}" alt="${alt}" width="34" height="34">` : "");
// the chalk row's loudness: the hidden meter shown as marks, never as a number
function loudness(p) {
  const n = Math.max(0, Math.min(5, Math.round(p / 20)));
  let d = "";
  for (let k = 0; k < 5; k++) d += `<path d="M${4 + k * 14} 12 l4 -2.4 l-0.8 4 l4.8 -1.6" fill="none" stroke="${k < n ? "#5d676a" : "#c9b99a"}" stroke-width="1.6" stroke-linecap="round"/>`;
  return `<span class="${Q}loud">THE CHALK ROW <svg viewBox="0 0 74 20" aria-hidden="true">${d}</svg> ${["silent", "faint", "faint", "steady", "loud", "loud"][n]}</span>`;
}

const tabs = new Set();
// The always-reachable tab. Returns a function that removes it.
export function tab(root, api, top, side) {
  style(root);
  const b = document.createElement("button");
  if (top) b.style.setProperty("--" + Q + "top", top);
  if (side === "right") b.classList.add(Q + "right");
  b.type = "button"; b.classList.add(Q + "tab");
  b.setAttribute("aria-label", "The Pulse map in Old Resin's book");
  const paint = () => {
    const n = have(sh(api)).length;
    b.classList.toggle(Q + "full", n === PIECES.length);
    b.innerHTML = `<svg viewBox="0 0 18 22" aria-hidden="true"><rect x="1" y="1" width="16" height="20" fill="#ead9b4" stroke="#7a5a40"/>${[0, 1, 2, 3].map((k) => `<path d="M3 ${5 + k * 4} H15" stroke="#3a281c" stroke-width=".7"/>`).join("")}<rect x="9" y="9" width="4" height="4" fill="${CHALK}"/></svg>PULSE MAP <b>${n}/${PIECES.length}</b>`;
  };
  paint();
  b.addEventListener("click", () => open(root, api));
  root.appendChild(b);
  const rec = { paint, root };
  tabs.add(rec);
  return () => { tabs.delete(rec); b.remove(); };
}

// A mode found a note: write it, say so, and update the tab. Returns true the first time.
export function gather(root, api, id) {
  const s = sh(api), piece = PIECES.find((x) => x.id === id);
  if (!piece || s.get("map." + id, false)) return false;
  s.set("map." + id, true);
  tabs.forEach((t) => t.paint());
  style(root);
  const n = have(s).length, el = document.createElement("div");
  el.className = Q + "flash"; el.setAttribute("role", "status");
  el.innerHTML = `${markImg(api.art, piece.who)}<span><b>A NOTE FOR THE PULSE MAP · ${n} OF ${PIECES.length} IN RESIN'S BOOK</b>${piece.name}: ${piece.text}${n === PIECES.length ? " <i>Every note is in. The map can be read at the Tremor Scroll.</i>" : ""}</span>`;
  root.appendChild(el);
  const t1 = setTimeout(() => { el.style.opacity = "0"; }, 10000), t2 = setTimeout(() => el.remove(), 10700);
  if (api._pulseTimers) api._pulseTimers.push(t1, t2);
  return true;
}

// The book, open at the back pages.
export function open(root, api) {
  style(root);
  if (root.querySelector("." + Q + "veil")) return;
  const s = sh(api), art = api.art || { has: () => false, url: () => "" };
  const v = document.createElement("div");
  v.className = Q + "veil";
  v.setAttribute("role", "dialog"); v.setAttribute("aria-label", "The Pulse map");
  root.appendChild(v);
  const back = document.activeElement;
  let phase = "read", tries = 0, timers = [];
  const close = () => { timers.forEach(clearTimeout); window.removeEventListener("keydown", keys, true); v.remove(); tabs.forEach((t) => t.paint()); if (back && back.focus) back.focus({ preventScroll: true }); };
  function keys(e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    const b = e.target && e.target.closest && e.target.closest(`.${Q}map button`);
    if (b && /^Arrow/.test(e.key)) {
      e.preventDefault();
      const i = +b.dataset.i, j = +b.dataset.j;
      const to = e.key === "ArrowRight" ? [Math.min(3, i + 1), j] : e.key === "ArrowLeft" ? [Math.max(0, i - 1), j] : e.key === "ArrowDown" ? [i, Math.min(12, j + 1)] : [i, Math.max(0, j - 1)];
      const n = v.querySelector(`.${Q}map button[data-i="${to[0]}"][data-j="${to[1]}"]`); n && n.focus();
    }
    e.stopPropagation();   // the mode underneath does not hear keys while the book is open
  }
  window.addEventListener("keydown", keys, true);
  v._close = close;

  function render(extra = "") {
    const got = have(s), full = got.length === PIECES.length, p = pulseOf(s);
    const solved = s.get("year_solved", false) ? s.get("finale", null) : null;
    const here = api.key === "tremor-scroll";
    const mapId = phase === "sounded" ? "scroll-pulse-map-sounded" : "scroll-pulse-map-blank";
    const shade = [];
    if (s.get("map.scroll", false) && phase !== "sounded") for (let j = 5; j <= 7; j++) for (let i = 0; i <= 3; i++) shade.push([i, j]);
    const plates = phase === "pick" ? Array.from({ length: MAP.rows * MAP.cols }, (_, k) => { const i = k % MAP.cols, j = Math.floor(k / MAP.cols); return `<button type="button" data-i="${i}" data-j="${j}" aria-label="Plate ${i + 1} across, ${j + 1} down from the Crown" style="${plateBox(i, j)}"></button>`; }).join("") : "";
    const notes = PIECES.map((x) => s.get("map." + x.id, false)
      ? `<div class="${Q}note">${markImg(art, x.who, x.name)}<span><b>${x.name.toUpperCase()} · ${x.mode.toUpperCase()}</b>${x.text}</span></div>`
      : `<div class="${Q}note ${Q}gap">${markImg(art, x.who)}<span><b>NOT YET · ${x.mode.toUpperCase()}</b>A blank line, kept for ${x.how}.</span></div>`).join("");
    let acts = "";
    if (phase === "read") {
      if (full && here && !solved) acts = `<p class="${Q}say"><b>Fenn:</b> “Every note is in. If something knocks three times, where does the second knock land? Ring the plate.”</p><div class="${Q}acts"><button type="button" class="${Q}go" data-a="pick">Read the map: ring the plate</button><button type="button" data-a="close">Close the book</button></div>`;
      else if (full && !solved) acts = `<p class="${Q}say">Every note is in. The map is read at the Tremor Scroll, at Fenn's drum.</p><div class="${Q}acts"><button type="button" data-a="close">Close the book</button></div>`;
      else if (solved) acts = `<p class="${Q}say">This year's map has been read: ${FINALES[solved.id] ? FINALES[solved.id].title : ""}. ${runs(api) > 1 ? `Years read: ${runs(api)}.` : ""}</p><div class="${Q}acts"><button type="button" class="${Q}go" data-a="again">Begin the year again</button><button type="button" data-a="close">Close the book</button></div>`;
      else acts = `<p class="${Q}say">${got.length ? `${got.length} of ${PIECES.length} notes.` : "No notes yet."} Each mode holds one; a blank line says where.</p><div class="${Q}acts"><button type="button" data-a="close">Close the book</button></div>`;
    }
    if (phase === "pick") acts = `<p class="${Q}say">Tap the plate the second tap will find (or move with the arrow keys and press Enter).${tries ? ` <b>${tries} wrong.</b>` : ""}</p><div class="${Q}acts"><button type="button" data-a="read">Back to the notes</button></div>`;
    if (phase === "sounded") acts = `<p class="${Q}say"><b>The Sounding.</b> Three taps, and the bark answers each: I from the plate the people carved most, by the Heartwood; II from the plate you rang, hollow, like a drum; III from where the city stands. Before the dark, the city must choose how to answer the second plate.</p><div class="${Q}ans">${ANSWERS.map((a) => `<button type="button" data-ans="${a.id}">${markImg(art, a.who)}<span>${a.label}<small>${a.by.toUpperCase()}</small></span></button>`).join("")}</div>`;
    v.innerHTML = `<div class="${Q}book"><h2>The Pulse map <small>OLD RESIN'S BOOK · THE BACK PAGES · ${got.length}/${PIECES.length}</small></h2>
<div class="${Q}map">${art.has(mapId) ? `<img src="${art.url(mapId)}" alt="The Pulse map: the bark's plates, four across and thirteen down from the Crown" width="420" height="1100">` : `<div style="aspect-ratio:420/1100;background:#ead9b4;border:1px solid #7a5a40"></div>`}${shade.map(([i, j]) => `<i style="${plateBox(i, j)}"></i>`).join("")}${plates}</div>
<div class="${Q}notes">${loudness(p)}${phase === "sounded" ? "" : notes}${acts}${extra}</div></div>`;
    v.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "close") close();
      else if (a === "pick") { phase = "pick"; render(); const f = v.querySelector(`.${Q}map button[data-i="1"][data-j="5"]`); f && f.focus({ preventScroll: true }); }
      else if (a === "read") { phase = "read"; render(); }
      else if (a === "again") again();
    }));
    v.querySelectorAll(`.${Q}map button`).forEach((b) => b.addEventListener("click", () => ring(b)));
    v.querySelectorAll("[data-ans]").forEach((b) => b.addEventListener("click", () => answer(b.dataset.ans)));
    const first = v.querySelector(`.${Q}ans button, .${Q}acts button.${Q}go, .${Q}acts button`);
    if (first && phase !== "pick") first.focus({ preventScroll: true });
  }
  function ring(b) {
    const i = +b.dataset.i, j = +b.dataset.j;
    if (i === MAP.tap[0] && j === MAP.tap[1]) {
      b.classList.add(Q + "hit");
      timers.push(setTimeout(() => { phase = "sounded"; render(); rings(); }, api.reducedMotion ? 200 : 700));
      return;
    }
    tries++;
    b.classList.add(Q + "miss");
    const why = PIECES.find((x) => x.no(i, j));
    const say = v.querySelector(`.${Q}say`);
    if (say) say.innerHTML = why ? `<b>${why.name}'s note</b> rules that plate out: ${why.text} <b>${tries} wrong.</b>` : `That plate fits every note but one: “${PIECES[6].text}” <b>${tries} wrong.</b>`;
    timers.push(setTimeout(() => b.classList.remove(Q + "miss"), 900));
  }
  function rings() {
    const m = v.querySelector("." + Q + "map");
    if (!m) return;
    const at = [[1, 2, ""], [2, 6, Q + "chalk"], [1, 5, ""]];
    at.forEach(([i, j, c], k) => {
      const go = () => {
        const r = document.createElement("span");
        r.className = Q + "ring " + c;
        r.style.left = ((MAP.x0 + (i + 0.5) * MAP.cw) / MAP.w * 100) + "%";
        r.style.top = ((MAP.y0 + (j + 0.5) * MAP.ch) / MAP.h * 100) + "%";
        m.appendChild(r);
      };
      if (api.reducedMotion) go(); else timers.push(setTimeout(go, 300 + k * 900));
    });
  }
  function answer(id) {
    const p = pulseOf(s);
    const end = id === "pour" ? (ringEarned(p) ? "the_ring" : "shadow_passes_fed") : id === "mend" ? "shadow_passes" : id === "watch" ? (p >= 60 ? "the_flake" : "war_on_the_god") : "edge_of_the_world";
    if (id === "pour") s.set("pulse", Math.min(100, p + 10));
    if (id === "mend") s.set("pulse", Math.max(0, p - 8));
    s.set("finale", { id: end, answer: id }); s.set("year_solved", true);
    s.set("runs", runs(api) + 1);
    s.set("sounding_heard", true);
    const F = FINALES[end];
    const img = (api.keyart && api.keyart(F.key)) || (art.has(F.art) ? art.url(F.art) : "");
    phase = "done";
    v.innerHTML = `<div class="${Q}book"><h2>${F.title}${F.as_written ? " <small>AS WRITTEN</small>" : ""}</h2><figure class="${Q}end">${img ? `<img src="${img}" alt="${F.title}">` : ""}<figcaption><b>${F.title.toUpperCase()}</b>${F.text}</figcaption></figure>
<div class="${Q}acts" style="grid-column:1/-1"><button type="button" class="${Q}go" data-a="close">Close the book</button><button type="button" data-a="again">Begin the year again</button></div></div>`;
    v.querySelector('[data-a="close"]').addEventListener("click", close);
    v.querySelector('[data-a="again"]').addEventListener("click", again);
    v.querySelector('[data-a="close"]').focus({ preventScroll: true });
    tabs.forEach((t) => t.paint());
  }
  // A new year: the notes, the meter and this year's choices are cleared. The count of years read, the
  // last finale and each mode's stages stay; so do the second-run changes they open.
  function again() {
    for (const x of PIECES) s.set("map." + x.id, false);
    for (const k of ["pulse", "pulse_map_whole", "faceless_read", "plug_site", "plug_pots", "heartwood", "door_scars", "door_clean", "ants_escorted", "shadow_played", "sorrel_met", "sounding_heard"]) s.set(k, null);
    s.set("year_solved", false);
    phase = "read"; tries = 0;
    render(`<p class="${Q}say"><b>A new year.</b> Resin turns to a clean back page. The old map is folded into the book behind it.</p>`);
    tabs.forEach((t) => t.paint());
  }
  render();
}

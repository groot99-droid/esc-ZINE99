// Dr. Tox: Finale / Split Field (1D, reconstruction by attribution: toolmark comparison; DESIGN.md section 11,
// `g1_split_field`; scenes s1_split_1 (the station) and s1_split_2 (the perimeter, only if the State fired there)).
// Craftint Doubletone shading board: black ink line on white board, two grey developed tones, nothing else. No colour.
//
// "He reads the room afterward like evidence of a crime he did not witness." The State broadcasts every mark on the board
// as his. Tap a numbered mark (on the board or in the row of chips): the split-field circle shows the mark in its left half.
// Pick a reference tray (HIS plate's edge, THEIRS the hollow blade and resin, the STATE's rims, batons and rounds), then
// slide the reference (drag, arrow keys) and turn it (dial, [ and ] or Q and E) until its lines run on across the hairline.
// Lined up within tolerance, the attribution locks and the record at the right gains a line: who was hurt, what they wanted,
// and by what. Some marks match nothing (old rust, a bloom stain from Fall, old resin): set those aside, NOT OF THIS DAY.
// The page names the hurt and never shows a wound.
// Finish: pin the board at any time. RECONSTRUCTED (ends `win`) when every mark is attributed and every false trace set
// aside; otherwise the page is pinned as it stands (`done`). Failure: none (the design says so).
//
// Reads (data/flags.json): toxin_in_procession (which page is the one that was played), self, toxin_events.
// Writes on pin: split.reconstructed (pages solved, 0 to 2), split.his_marks, split.cult_marks (summed over both pages),
// split.hurt_names (the record, both pages), toxin_events (this scene's entry, reconstructed true or false) and self (the
// event's cost, 10 if reconstructed, 15 if not; a replay takes the earlier cost back first, so nothing is counted twice).
//
// Art (games/dr-tox-finale/art/ASSET_MAP.md, "Split Field"): split-field-station/-perimeter, -circle, -striae-{his,theirs,
// state-rim,state-baton,state-round,rust,bloom,old-resin}, -tray-{his,theirs,state}, -marker-locked, -record, -record-line,
// -stamp-{aside,pin,reconstructed}. Every id falls back to a drawing made here when the bundle lacks it.
//
// Quoted from the author's work, verbatim (DESIGN.md): "He reads the room afterward like evidence of a crime he did not
// witness." (§3). Names and wants are the table in DESIGN.md ("The cult", "At the station and the perimeter").
//
// Added for the game (not in DESIGN.md; the author approves or strikes): which mark is whose (the design fixes only
// counts: station eight marks, two false, three the cult's; perimeter ten marks, three false), the tolerances, the
// object each mark sits on, the "reading" of each trace, a woman from the queue (station mark 7) and a shield bearer of
// the line (perimeter mark 4) as unnamed hurt with a want each, the perimeter's third false trace being bloom (the
// design's "a State round from another night" has no striae of its own: a round would match the State's tray), and
// every caption.

const P = "dtf-sf-";
const INK = "#141414", BOARD = "#fbfbf8", TONE = "#5a5a5a", MID = "#9a9a96", SOFT = "#e6e5df", DESK = "#d9d8d2";
const CAPS = "'Oswald','Arial Narrow',Impact,sans-serif";
const MONO = "'IBM Plex Mono','Courier New',Courier,monospace";
const IDLE_HINT = 45000;
const ANG_TOL = 4.5;
const MAXOFF = 90;

// reference keys, their tray, their striae art and how tightly the lines must meet (along the stripe, across it, period)
const REF = {
  his: { tray: "his", art: "split-field-striae-his", along: 48, across: 9 },
  theirs: { tray: "theirs", art: "split-field-striae-theirs", along: 48, across: 9 },
  rim: { tray: "state", art: "split-field-striae-state-rim", along: 48, across: 4, period: 420 / 34 },
  baton: { tray: "state", art: "split-field-striae-state-baton", along: 55, across: 11 },
  round: { tray: "state", art: "split-field-striae-state-round", along: 16, across: 16, iso: true },
};
const FALSE = { rust: "split-field-striae-rust", bloom: "split-field-striae-bloom", resin: "split-field-striae-old-resin" };
const REF_NAME = { his: "HIS: the plate's edge", theirs: "THEIRS: the hollow blade", rim: "STATE: a shield rim", baton: "STATE: a baton", round: "STATE: a round" };
const READING = {
  his: "broad, glassy-smooth bands with fine cracks across them",
  theirs: "two deep parallel grooves with fine lines beside them",
  rim: "fine lines at even spacing, regular as a comb",
  baton: "a few soft, wide scuffs at a slant, blurred",
  round: "a spiral of fine lines turning across the field",
  rust: "pitted and crosshatched, with no lines to follow",
  bloom: "a soft blot with a ragged edge and no lines",
  resin: "a glossy drip with a crazed edge and no lines",
};
const TRAYS = [
  { id: "his", art: "split-field-tray-his", label: "HIS", note: "the plate's edge of this form, lacquered" },
  { id: "theirs", art: "split-field-tray-theirs", label: "THEIRS", note: "the hollow blade, its open channel; the resin" },
  { id: "state", art: "split-field-tray-state", label: "STATE", note: "shield rims, batons, rounds" },
];
const STATE_KEYS = ["rim", "baton", "round"];

const H = (name, want, by) => ({ name, want, by });
const PAGES = [
  {
    n: 1, scene: "s1_split_1", chapter: "c2_station", art: "split-field-station", place: "The water station after", trigger: "scripted",
    form: "Grotesque arm and shoulder overdevelopment, joints sitting wrong",
    marks: [
      { n: 1, x: 350, y: 92, on: "the tank's rim", truth: "rust" },
      { n: 2, x: 405, y: 300, on: "the ladder's rail", truth: "theirs", hurt: H("Hal Brenner", "To finish his last shift before the station's water is moved inside the city", "THEIRS: the hollow blade") },
      { n: 3, x: 600, y: 412, on: "the kiosk's shutter", truth: "theirs", hurt: H("Dara Quill", "For her sister to see the rite", "THEIRS: the hollow blade") },
      { n: 4, x: 720, y: 330, on: "the price board", truth: "bloom" },
      { n: 5, x: 1000, y: 360, on: "the barricade", truth: "his", hurt: H("Sgt. Ivo Petrak", "A place for his family inside the last city", "HIS: the plate's edge") },
      { n: 6, x: 500, y: 580, on: "the shield lying to the west", truth: "rim", hurt: H("Tomasz Wey", "To be the one who throws first", "THE STATE: a shield rim") },
      { n: 7, x: 1180, y: 575, on: "the shield lying to the east", truth: "baton", hurt: H("A woman from the queue", "To fill her jerrican and get home", "THE STATE: a baton") },
      { n: 8, x: 300, y: 400, on: "the tower's near leg", truth: "theirs", hurt: H("Tomasz Wey", "To be the one who throws first", "THEIRS: the resin") },
    ],
  },
  {
    n: 2, scene: "s1_split_2", chapter: "c6_perimeter", art: "split-field-perimeter", place: "The perimeter after", trigger: "pulse",
    form: "Elongated limbs, extra joints, lean torso, quadrupedal gait",
    marks: [
      { n: 1, x: 640, y: 120, on: "the glass above the plinth gate", truth: "theirs", hurt: H("Yusuf Demir", "To be useful; he preaches “the light”", "THEIRS: the resin") },
      { n: 2, x: 1108, y: 250, on: "the floodlight mast", truth: "rust" },
      { n: 3, x: 370, y: 430, on: "the first barrier", truth: "rim", hurt: H("Petra Lind", "To be left alone", "THE STATE: a shield rim") },
      { n: 4, x: 540, y: 430, on: "the second barrier", truth: "his", hurt: H("A shield bearer of the line", "To go off shift", "HIS: the plate's edge") },
      { n: 5, x: 880, y: 430, on: "the third barrier", truth: "resin" },
      { n: 6, x: 360, y: 600, on: "the fallen banner", truth: "theirs", hurt: H("Marisol Quiroga", "Her son's boots back (still)", "THEIRS: the hollow blade") },
      { n: 7, x: 780, y: 620, on: "a shield left in the road", truth: "baton", hurt: H("Teo Halloran", "To walk at the front", "THE STATE: a baton") },
      { n: 8, x: 1040, y: 620, on: "a second shield in the road", truth: "theirs", hurt: H("Wren Halloran", "For Teo to walk without a stick", "THEIRS: the hollow blade") },
      { n: 9, x: 47, y: 380, on: "the fence's first post", truth: "bloom" },
      { n: 10, x: 210, y: 380, on: "the fence, second bay", truth: "round", hurt: H("Mercy Abiodun", "For the settlement never to be afraid again", "THE STATE: a round") },
    ],
  },
];
const isFalse = (k) => !!FALSE[k];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// the pose the mark's disc is laid at: fixed for a mark, never within tolerance of the reference's starting pose
function markPose(page, n) {
  const sign = n % 2 ? 1 : -1;
  return { a: sign * (13.5 + ((n * 7 + page * 3) % 5) * 4.5), dx: ((n * 37 + page * 11) % 61) - 30, dy: ((n * 53 + page * 7) % 61) - 30 };
}

// a drawn disc for when the bundle lacks a striae id (420 x 420, centred on 210,210)
function fallbackDisc(key) {
  const g = [`<circle cx="210" cy="210" r="206" fill="${BOARD}"/><g clip-path="url(#${P}discclip)">`];
  const line = (y, w, sl = 4, c = INK) => g.push(`<line x1="-20" y1="${y}" x2="440" y2="${y + sl}" stroke="${c}" stroke-width="${w}"/>`);
  if (key === "his") { [0, 56, 127, 190, 262, 330, 398].forEach((y, i) => line(y, [10, 4, 12, 3][i % 4])); }
  else if (key === "theirs") { for (let k = 0; k < 18; k++) line(k * 23.3, k === 7 || k === 9 ? 12 : 2.5); }
  else if (key === "rim") { for (let k = 0; k < 34; k++) line(k * (420 / 34), 1.6, 4); }
  else if (key === "baton") { [20, 90, 180, 250, 330, 390].forEach((y, i) => line(y, i % 2 ? 8 : 14, 14, TONE)); }
  else if (key === "round") { for (let k = 0; k < 22; k++) { const r = 20 + k * 18; g.push(`<path d="M${210 - r},250 A${r},${r * 1.4} 0 0,1 ${210 + r},170" fill="none" stroke="${INK}" stroke-width="2"/>`); } }
  else { for (let k = -10; k < 40; k++) g.push(`<line x1="${k * 12}" y1="420" x2="${k * 12 + 300}" y2="40" stroke="${TONE}" stroke-width="1"/>`); g.push(`<path d="M110,120 C200,70 320,150 300,260 C280,340 140,330 110,240Z" fill="none" stroke="${INK}" stroke-width="3"/>`); }
  g.push(`</g><circle cx="210" cy="210" r="206" fill="none" stroke="${INK}" stroke-width="3"/>`);
  return g.join("");
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

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const svgn = (tag, attrs, parent) => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    let dead = false, raf = 0;

    const style = mk("style", null, root); style.textContent = css();
    const page = mk("div", P + "page", root);
    page.setAttribute("aria-label", "Split Field: a shading board of the place after, a comparison circle and a record of the hurt");

    // ---- state ---------------------------------------------------------------------------------------
    let pi = 0, PG = PAGES[0];
    let marks = [];                    // { m, state: open | locked | aside, ref }
    let sel = -1;                      // selected mark index
    let tray = null, stateKey = "rim"; // chosen tray and, within STATE, the chosen kind
    let pose = { a: 0, dx: 0, dy: 0 };
    let drag = null, lastAct = 0, hintShown = false, misses = 0, refusals = 0, ended = false, mode = "intro";
    const dom = {};

    const refKey = () => (tray === "state" ? stateKey : tray);
    const mp = () => (sel >= 0 ? markPose(PG.n, marks[sel].m.n) : null);

    // ---- the rule ------------------------------------------------------------------------------------
    // does the reference pose meet the mark's pose (same transform of the same disc), within tolerance for that kind
    function meets(key, mpose) {
      const r = REF[key];
      if (Math.abs(pose.a - mpose.a) > ANG_TOL) return false;
      const dx = pose.dx - mpose.dx, dy = pose.dy - mpose.dy;
      const t = mpose.a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
      const along = dx * c + dy * s, across = -dx * s + dy * c;
      if (r.iso) return Math.hypot(dx, dy) <= r.across;
      if (Math.abs(along) > r.along) return false;
      if (r.period) { const m = ((across % r.period) + r.period) % r.period; return Math.min(m, r.period - m) <= r.across; }
      return Math.abs(across) <= r.across;
    }

    // ---- drawing the circle --------------------------------------------------------------------------
    function buildCircle() {
      const box = dom.cbox; box.textContent = "";
      const svg = svgn("svg", { viewBox: "0 0 440 480", class: P + "csvg", role: "img", "aria-label": "The split-field circle: the mark in the left half, the reference in the right half, a hairline between" }, box);
      dom.svg = svg;
      const defs = svgn("defs", {}, svg);
      const cl = svgn("clipPath", { id: P + "discclip" }, defs); svgn("circle", { cx: 220, cy: 220, r: 203 }, cl);
      const cL = svgn("clipPath", { id: P + "left" }, defs); svgn("rect", { x: 0, y: 0, width: 220, height: 480 }, cL);
      const cR = svgn("clipPath", { id: P + "right" }, defs); svgn("rect", { x: 220, y: 0, width: 220, height: 480 }, cR);
      const cc = svgn("clipPath", { id: P + "round" }, defs); svgn("circle", { cx: 210, cy: 210, r: 206 }, cc);
      svgn("circle", { cx: 220, cy: 220, r: 203, fill: BOARD }, svg);
      const inner = svgn("g", { "clip-path": `url(#${P}discclip)` }, svg);
      dom.gL = svgn("g", { "clip-path": `url(#${P}left)` }, inner);
      dom.gR = svgn("g", { "clip-path": `url(#${P}right)` }, inner);
      dom.mark = svgn("g", {}, dom.gL);
      dom.ref = svgn("g", {}, dom.gR);
      dom.blank = svgn("g", {}, dom.gR);
      const url_ = url("split-field-circle");
      if (url_) svgn("image", { href: url_, x: 0, y: 0, width: 440, height: 480 }, svg);
      else {
        svgn("circle", { cx: 220, cy: 220, r: 210, fill: "none", stroke: INK, "stroke-width": 14 }, svg);
        svgn("line", { x1: 220, y1: 20, x2: 220, y2: 420, stroke: INK, "stroke-width": 1.5 }, svg);
        const t1 = svgn("text", { x: 120, y: 466, "text-anchor": "middle", "font-weight": 700, "font-size": 20, "letter-spacing": 3, fill: INK, "font-family": CAPS }, svg); t1.textContent = "MARK";
        const t2 = svgn("text", { x: 320, y: 466, "text-anchor": "middle", "font-weight": 700, "font-size": 20, "letter-spacing": 3, fill: INK, "font-family": CAPS }, svg); t2.textContent = "REFERENCE";
      }
      dom.glow = svgn("circle", { cx: 220, cy: 220, r: 214, fill: "none", stroke: INK, "stroke-width": 0, opacity: 0 }, svg);
      drawDisc(dom.mark, null); drawDisc(dom.ref, null);
      const bt = svgn("text", { x: 320, y: 230, "text-anchor": "middle", "font-weight": 700, "font-size": 15, fill: TONE, "letter-spacing": 2, "font-family": CAPS }, dom.blank);
      bt.textContent = "PICK A TRAY"; dom.blankText = bt;
    }
    // lay one disc (an art id or a drawn one) into a group at 10,10 so its centre sits on the circle's
    function drawDisc(g, key, isMark) {
      g.textContent = "";
      g.removeAttribute("transform");
      if (!key) return;
      const id = isMark ? (FALSE[key] || REF[key].art) : REF[key].art;
      const u = url(id);
      if (u) svgn("image", { href: u, x: 10, y: 10, width: 420, height: 420 }, g);
      else { const h = svgn("g", { transform: "translate(10 10)" }, g); h.innerHTML = fallbackDisc(key); }
    }
    const poseAttr = (p) => `translate(${p.dx.toFixed(2)} ${p.dy.toFixed(2)}) rotate(${p.a.toFixed(2)} 220 220)`;
    function paintPose() {
      if (dead) return;
      dom.ref.setAttribute("transform", poseAttr(pose));
      dom.ang.value = String(Math.round(pose.a));
      dom.angv.textContent = `${Math.round(pose.a)}°`;
    }
    function schedulePaint() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paintPose(); }); }

    // ---- selecting, lining up, locking ---------------------------------------------------------------
    function say(t, strong) {
      dom.log.textContent = t;
      dom.log.classList.toggle(P + "strong", !!strong);
    }
    function selectMark(i) {
      if (ended || mode !== "play") return;
      sel = i; lastAct = performance.now(); hintShown = false;
      const mk_ = marks[i], m = mk_.m;
      drawDisc(dom.mark, m.truth, true);
      dom.mark.setAttribute("transform", poseAttr(markPose(PG.n, m.n)));
      if (mk_.state === "locked") { showLockedRef(mk_); }
      else if (mk_.state === "aside") { drawDisc(dom.ref, null); dom.blank.style.display = ""; dom.blankText.textContent = "SET ASIDE"; }
      else { resetPose(); applyRef(); }
      paintAll();
      const reading = READING[m.truth];
      dom.cap.textContent = "";
      const b = mk("b", null, dom.cap, `MARK ${m.n} `); dom.cap.append(`on ${m.on}: ${reading}.`);
      if (mk_.state === "locked") say(`Mark ${m.n} is attributed: ${REF_NAME[mk_.ref]}. ${m.hurt.name} is on the record.`);
      else if (mk_.state === "aside") say(`Mark ${m.n} is set aside: not of this day.`);
      else say(tray ? `Mark ${m.n} on ${m.on}. Slide and turn the reference until its lines run on across the hairline.` : `Mark ${m.n} on ${m.on}. Pick a tray to lay a reference against it.`);
      dom.circleWrap.classList.toggle(P + "done", mk_.state !== "open");
      if (tray || mk_.state !== "open") toCircle();
    }
    function showLockedRef(mk_) {
      drawDisc(dom.ref, mk_.ref, false);
      dom.blank.style.display = "none";
      pose = Object.assign({}, markPose(PG.n, mk_.m.n));
      paintPose();
    }
    function resetPose() { pose = { a: 0, dx: 0, dy: 0 }; paintPose(); }
    function applyRef() {
      if (sel < 0) return;
      const k = tray ? refKey() : null;
      drawDisc(dom.ref, k, false);
      dom.blank.style.display = k ? "none" : "";
      dom.blankText.textContent = "PICK A TRAY";
      paintPose();
    }
    function toCircle() {
      if (dead || !dom.circleWrap || page.clientWidth >= 900) return;
      try { dom.cbox.scrollIntoView({ block: "center", behavior: RM ? "auto" : "smooth" }); } catch { /* ok */ }
    }
    function pickTray(id) {
      if (ended || mode !== "play") return;
      tray = id; lastAct = performance.now();
      if (sel >= 0 && marks[sel].state === "open") { resetPose(); applyRef(); say(`${TRAYS.find((t) => t.id === id).label} laid in the right half. Slide and turn it against the mark.`); }
      paintAll(); toCircle();
    }
    function pickState(k) {
      stateKey = k; tray = "state"; lastAct = performance.now();
      if (sel >= 0 && marks[sel].state === "open") { resetPose(); applyRef(); say(`${REF_NAME[k]} laid in the right half.`); }
      paintAll(); toCircle();
    }

    // a settled pose: does it lock?
    function settle() {
      if (ended || sel < 0 || !tray) return;
      const mk_ = marks[sel];
      if (mk_.state !== "open") return;
      const m = mk_.m, key = refKey(), mpose = markPose(PG.n, m.n);
      if (isFalse(m.truth) || !meets(key, mpose)) return;
      if (m.truth === key) {
        mk_.state = "locked"; mk_.ref = key; pose = Object.assign({}, mpose); paintPose();
        flash();
        say(`Mark ${m.n} locks: ${REF_NAME[key]}. ${m.hurt.name} goes on the record.`, true);
        paintAll();
        if (allResolved()) { later(() => { if (!dead) say("Every mark is attributed and every false trace set aside. Pin the board.", true); }, RM ? 0 : 900); }
      } else {
        misses++;
        say(`The lines sit in the same place but do not continue across the hairline: ${REF_NAME[key]} did not make mark ${m.n}. Try another reference.`, true);
        shake();
      }
    }
    function setAside() {
      if (ended || sel < 0) return;
      const mk_ = marks[sel], m = mk_.m;
      if (mk_.state !== "open") { say(`Mark ${m.n} is already settled.`); return; }
      if (isFalse(m.truth)) {
        mk_.state = "aside"; flash();
        say(`Mark ${m.n}: not of this day. ${READING[m.truth] ? "It has " + (m.truth === "rust" ? "older rust" : m.truth === "bloom" ? "a bloom stain from Fall" : "old resin from Fall's rite jars") + " on it, and nothing to match." : ""}`, true);
        drawDisc(dom.ref, null); dom.blank.style.display = ""; dom.blankText.textContent = "SET ASIDE";
        paintAll();
        if (allResolved()) later(() => { if (!dead) say("Every mark is attributed and every false trace set aside. Pin the board.", true); }, RM ? 0 : 900);
      } else {
        refusals++;
        say(`Mark ${m.n} has lines, and something made them. The page will not set it aside: lay a reference against it.`, true);
        shake();
      }
    }
    const allResolved = () => marks.every((x) => x.state !== "open");
    function flash() {
      if (RM) return;
      dom.glow.setAttribute("opacity", "1"); dom.glow.setAttribute("stroke-width", "10");
      dom.glow.style.transition = "none"; void dom.glow.getBoundingClientRect();
      dom.glow.style.transition = "opacity .7s, stroke-width .7s";
      dom.glow.setAttribute("opacity", "0"); dom.glow.setAttribute("stroke-width", "0");
    }
    function shake() {
      if (RM) return;
      dom.cbox.classList.remove(P + "shake"); void dom.cbox.offsetWidth; dom.cbox.classList.add(P + "shake");
    }

    // ---- moving the reference ------------------------------------------------------------------------
    const canMove = () => !ended && mode === "play" && sel >= 0 && marks[sel].state === "open" && !!tray;
    function nudge(dx, dy, da) {
      if (!canMove()) { if (sel >= 0 && !tray) say("Pick a tray first."); return; }
      pose.dx = clamp(pose.dx + dx, -MAXOFF, MAXOFF); pose.dy = clamp(pose.dy + dy, -MAXOFF, MAXOFF); pose.a = clamp(pose.a + da, -60, 60);
      lastAct = performance.now(); paintPose();
    }
    function scale() { const r = dom.svg.getBoundingClientRect(); return (r.width || 440) / 440; }
    function onDown(e) {
      if (!canMove()) { if (mode === "play" && sel < 0) say("Tap a numbered mark first."); else if (sel >= 0 && !tray) say("Pick a tray first."); return; }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, k: scale() };
      try { dom.cbox.setPointerCapture(e.pointerId); } catch { /* ok */ }
      dom.cbox.classList.add(P + "grab"); e.preventDefault();
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const ddx = (e.clientX - drag.x) / drag.k, ddy = (e.clientY - drag.y) / drag.k;
      drag.x = e.clientX; drag.y = e.clientY;
      pose.dx = clamp(pose.dx + ddx, -MAXOFF, MAXOFF); pose.dy = clamp(pose.dy + ddy, -MAXOFF, MAXOFF);
      lastAct = performance.now(); schedulePaint();
    }
    function onUp(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null; dom.cbox.classList.remove(P + "grab"); paintPose(); settle();
    }
    function onKey(e) {
      if (mode !== "play") return;
      const k = e.key, big = e.shiftKey ? 1 : 5;
      let h = true;
      if (k === "ArrowLeft") nudge(-big, 0, 0);
      else if (k === "ArrowRight") nudge(big, 0, 0);
      else if (k === "ArrowUp") nudge(0, -big, 0);
      else if (k === "ArrowDown") nudge(0, big, 0);
      else if (k === "[" || k === "q" || k === "Q") nudge(0, 0, e.shiftKey ? -0.5 : -2);
      else if (k === "]" || k === "e" || k === "E") nudge(0, 0, e.shiftKey ? 0.5 : 2);
      else if (k === "r" || k === "R") { if (canMove()) { resetPose(); say("Reference put back."); } }
      else h = false;
      if (h) { e.preventDefault(); clearTimeout(keyT); keyT = setTimeout(settle, 280); }
    }
    let keyT = 0;

    // ---- the page ------------------------------------------------------------------------------------
    function paintAll() {
      if (dead) return;
      // marks on the board and chips
      marks.forEach((x, i) => {
        const h = x.hot, c = x.chip;
        h.classList.toggle(P + "sel", i === sel); c.classList.toggle(P + "sel", i === sel);
        h.classList.toggle(P + "lk", x.state === "locked"); c.classList.toggle(P + "lk", x.state === "locked");
        h.classList.toggle(P + "as", x.state === "aside"); c.classList.toggle(P + "as", x.state === "aside");
        const st = x.state === "locked" ? `attributed, ${REF_NAME[x.ref]}` : x.state === "aside" ? "set aside" : "open";
        h.setAttribute("aria-label", `Mark ${x.m.n}, on ${x.m.on}: ${st}`); c.setAttribute("aria-label", `Mark ${x.m.n}, on ${x.m.on}: ${st}`);
        c.textContent = (x.state === "locked" ? "✓ " : x.state === "aside" ? "∅ " : "") + x.m.n;
        x.lock.style.display = x.state === "locked" ? "block" : "none";
        x.nul.style.display = x.state === "aside" ? "block" : "none";
      });
      // trays
      dom.traybtns.forEach((b, i) => b.classList.toggle(P + "sel", tray === TRAYS[i].id));
      dom.kinds.style.display = tray === "state" ? "" : "none";
      dom.kindbtns.forEach((b, i) => b.classList.toggle(P + "sel", tray === "state" && stateKey === STATE_KEYS[i]));
      // controls
      const mv = canMove();
      dom.ctl.classList.toggle(P + "off", !mv);
      dom.ang.disabled = !mv; dom.rl.disabled = !mv; dom.rr.disabled = !mv; dom.rs.disabled = !mv;
      dom.aside.disabled = sel < 0 || marks[sel].state !== "open";
      // counts
      const done = marks.filter((x) => x.state !== "open").length;
      dom.count.textContent = `${done} of ${marks.length} settled`;
      // record
      dom.rec.textContent = "";
      const lines = marks.filter((x) => x.state === "locked");
      if (!lines.length) mk("div", P + "recempty", dom.rec, "No line yet. Each attribution writes one: who was hurt, what they wanted, by what.");
      lines.forEach((x) => {
        const e = mk("div", P + "recline", dom.rec);
        const u = url("split-field-record-line"); if (u) e.style.backgroundImage = `url("${u}")`;
        const inner = mk("div", P + "recin", e);
        mk("b", P + "recname", inner, x.m.hurt.name);
        mk("span", P + "recmark", inner, `mark ${x.m.n}`);
        mk("div", P + "recwant", inner, x.m.hurt.want);
        const by = mk("div", P + "recby", inner); mk("b", null, by, "BY: "); by.append(x.m.hurt.by.replace(/^[A-Z ]+: /, ""));
        const w = x.m.hurt.by.split(":")[0]; by.append(` (${w.toLowerCase()})`);
      });
      const ao = marks.filter((x) => x.state === "aside").length;
      if (ao) mk("div", P + "recaside", dom.rec, `${ao} set aside: not of this day.`);
    }

    function boardBuild() {
      dom.bd.textContent = "";
      const u = url(PG.art);
      const inner = mk("div", P + "bdin", dom.bd);
      if (u) { const im = mk("img", null, inner); im.src = u; im.alt = ""; im.draggable = false; im.setAttribute("aria-hidden", "true"); }
      else { inner.classList.add(P + "bdfb"); mk("div", P + "bdfbt", inner, PG.place.toUpperCase()); }
      const lockU = url("split-field-marker-locked");
      marks.forEach((x, i) => {
        const m = x.m, px = (m.x / 1280 * 100).toFixed(3), py = (m.y / 720 * 100).toFixed(3);
        const h = mk("button", P + "hot", inner); h.type = "button"; h.style.left = px + "%"; h.style.top = py + "%";
        if (!u) { h.classList.add(P + "fbhot"); h.textContent = String(m.n); }
        x.hot = h;
        x.lock = mk("span", P + "hlock", h);
        if (lockU) { const im = mk("img", null, x.lock); im.src = lockU; im.alt = ""; im.draggable = false; } else x.lock.textContent = "✓";
        x.nul = mk("span", P + "hnul", h, "∅");
        on(h, "click", () => selectMark(i));
      });
      if (!ended) {
        dom.stampBox = mk("div", P + "stampbox", inner);
      }
    }

    function buildPlay() {
      page.textContent = "";
      const wrap = mk("div", P + "wrap", page); dom.wrap = wrap;
      const head = mk("div", P + "head", wrap);
      mk("h2", P + "title", head, "Split Field");
      mk("span", P + "place", head, `${PG.place} · board ${PG.n} of 2`);
      dom.count = mk("span", P + "count", head);
      // layout columns
      const mid = mk("div", P + "mid", wrap), cir = mk("div", P + "cir", wrap), right = mk("div", P + "right", wrap);

      // board + chips
      dom.bd = mk("div", P + "bd", mid);
      dom.chips = mk("div", P + "chips", mid);
      marks.forEach((x, i) => { const c = mk("button", P + "chip", dom.chips); c.type = "button"; x.chip = c; on(c, "click", () => selectMark(i)); });
      boardBuild();

      // trays
      const tr = mk("div", P + "trw", mid);
      mk("div", P + "lh", tr, "REFERENCE TRAYS");
      const tl = mk("div", P + "trays", tr); dom.traybtns = [];
      TRAYS.forEach((t) => {
        const b = mk("button", P + "tray", tl); b.type = "button"; b.setAttribute("aria-label", `Tray ${t.label}: ${t.note}`);
        const u = url(t.art);
        if (u) { const im = mk("img", null, b); im.src = u; im.alt = ""; im.draggable = false; }
        else { b.classList.add(P + "trfb"); mk("b", null, b, t.label); }
        mk("span", P + "trnote", b, t.note);
        on(b, "click", () => pickTray(t.id));
        dom.traybtns.push(b);
      });
      dom.kinds = mk("div", P + "kinds", tr); dom.kindbtns = [];
      mk("span", null, dom.kinds, "The State's:");
      STATE_KEYS.forEach((k) => {
        const b = mk("button", P + "kind", dom.kinds, k.toUpperCase()); b.type = "button"; b.setAttribute("aria-label", `State reference: ${REF_NAME[k]}`);
        on(b, "click", () => pickState(k)); dom.kindbtns.push(b);
      });

      // circle
      dom.circleWrap = mk("div", P + "cwrap", cir);
      dom.cbox = mk("div", P + "cbox", dom.circleWrap);
      dom.cbox.tabIndex = 0; dom.cbox.setAttribute("role", "application");
      dom.cbox.setAttribute("aria-label", "Comparison circle. Arrow keys slide the reference, Q and E turn it, R puts it back.");
      buildCircle();
      on(dom.cbox, "pointerdown", onDown); on(dom.cbox, "pointermove", onMove); on(dom.cbox, "pointerup", onUp); on(dom.cbox, "pointercancel", onUp);
      on(dom.cbox, "keydown", onKey);
      on(dom.cbox, "wheel", (e) => { if (!canMove()) return; e.preventDefault(); nudge(0, 0, e.deltaY > 0 ? 2 : -2); clearTimeout(keyT); keyT = setTimeout(settle, 280); }, { passive: false });
      dom.cap = mk("div", P + "cap", dom.circleWrap, "Tap a numbered mark.");

      dom.ctl = mk("div", P + "ctl", dom.circleWrap);
      dom.rl = mk("button", P + "cb", dom.ctl, "↶"); dom.rl.type = "button"; dom.rl.setAttribute("aria-label", "Turn the reference left");
      const sl = mk("label", P + "sl", dom.ctl); sl.append("TURN ");
      dom.ang = mk("input", null, sl); dom.ang.type = "range"; dom.ang.min = "-60"; dom.ang.max = "60"; dom.ang.step = "1"; dom.ang.value = "0"; dom.ang.setAttribute("aria-label", "Turn the reference, degrees");
      dom.angv = mk("span", P + "angv", sl, "0°");
      dom.rr = mk("button", P + "cb", dom.ctl, "↷"); dom.rr.type = "button"; dom.rr.setAttribute("aria-label", "Turn the reference right");
      dom.rs = mk("button", P + "cb " + P + "wide", dom.ctl, "RESET"); dom.rs.type = "button";
      dom.aside = mk("button", P + "cb " + P + "wide " + P + "aside", dom.ctl); dom.aside.type = "button";
      const asideU = url("split-field-stamp-aside");
      if (asideU) { dom.aside.classList.add(P + "stampbtn"); const im = mk("img", null, dom.aside); im.src = asideU; im.alt = "NOT OF THIS DAY: set the mark aside"; im.draggable = false; } else dom.aside.textContent = "NOT OF THIS DAY";
      on(dom.rl, "click", () => { nudge(0, 0, -2); clearTimeout(keyT); keyT = setTimeout(settle, 350); });
      on(dom.rr, "click", () => { nudge(0, 0, 2); clearTimeout(keyT); keyT = setTimeout(settle, 350); });
      on(dom.ang, "input", () => { if (!canMove()) return; pose.a = clamp(+dom.ang.value, -60, 60); lastAct = performance.now(); schedulePaint(); });
      on(dom.ang, "change", () => settle());
      on(dom.rs, "click", () => { if (canMove()) { resetPose(); say("Reference put back."); } });
      on(dom.aside, "click", setAside);
      dom.log = mk("div", P + "log", dom.circleWrap); dom.log.setAttribute("role", "status"); dom.log.setAttribute("aria-live", "polite");

      // record
      mk("div", P + "recorder", right, "RECORD").style.cssText = "";
      const hd = right.lastChild;
      const ru = url("split-field-record"); if (ru) { hd.classList.add(P + "rechd"); hd.textContent = ""; hd.style.backgroundImage = `url("${ru}")`; hd.setAttribute("aria-label", "Record of the hurt"); }
      dom.rec = mk("div", P + "rec", right);
      const pin = mk("button", P + "pin", right); pin.type = "button";
      const pu = url("split-field-stamp-pin");
      if (pu) { pin.classList.add(P + "stampbtn"); const im = mk("img", null, pin); im.src = pu; im.alt = "PIN THE BOARD"; im.draggable = false; } else pin.textContent = "PIN THE BOARD";
      on(pin, "click", () => askPin());
      dom.pin = pin;
      paintAll(); paintPose();
    }

    // ---- finishing -----------------------------------------------------------------------------------
    function askPin() {
      if (ended || mode !== "play") return;
      const open = marks.filter((x) => x.state === "open").length;
      if (!open) { finish(); return; }
      const ov = mk("div", P + "intro", page);
      const card = mk("div", P + "card", ov); card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Pin the board");
      mk("h2", null, card, "Pin the board as it stands?");
      mk("p", null, card, `${open} mark${open > 1 ? "s are" : " is"} not settled. The State will go on calling ${open > 1 ? "them" : "it"} his. The board can be pinned now, but it will not be reconstructed.`);
      const bt = mk("div", P + "btns", card);
      const keep = mk("button", P + "go", bt, "Keep working"); keep.type = "button";
      const yes = mk("button", null, bt, "Pin it"); yes.type = "button";
      on(keep, "click", () => ov.remove()); on(yes, "click", () => { ov.remove(); finish(); });
      later(() => { if (!dead) keep.focus({ preventScroll: true }); }, 30);
    }

    function finish() {
      if (ended) return;
      ended = true; mode = "done";
      const rec = marks.every((x) => x.state !== "open") && marks.every((x) => (isFalse(x.m.truth) ? x.state === "aside" : x.state === "locked"));
      const lk = marks.filter((x) => x.state === "locked");
      const his = lk.filter((x) => x.ref === "his").length;
      const cult = lk.filter((x) => x.ref === "theirs").length;
      const state = lk.length - his - cult;
      const aside = marks.filter((x) => x.state === "aside").length;
      const left = marks.filter((x) => x.state === "open").length;
      const hurt = lk.map((x) => ({ name: x.m.hurt.name, want: x.m.hurt.want, by: x.ref === "his" ? "his" : x.ref === "theirs" ? "theirs" : "the State's" }));
      const cost = rec ? 10 : 15;

      // write the flags (a replay overwrites this page's share; nothing is counted twice)
      try {
        const pages = Object.assign({}, sget("split.pages", {}) || {});
        const prev = pages[PG.n];
        pages[PG.n] = { rec: rec ? 1 : 0, his, cult, hurt, cost };
        sset("split.pages", pages);
        const all = Object.keys(pages).map((k) => pages[k]);
        sset("split.reconstructed", all.reduce((a, p) => a + (p.rec ? 1 : 0), 0));
        sset("split.his_marks", all.reduce((a, p) => a + p.his, 0));
        sset("split.cult_marks", all.reduce((a, p) => a + p.cult, 0));
        sset("split.hurt_names", Object.keys(pages).sort().reduce((a, k) => a.concat(pages[k].hurt), []));
        const ev = Array.isArray(sget("toxin_events", [])) ? sget("toxin_events", []).slice() : [];
        const entry = { episode: "finale", chapter: PG.chapter, scene: PG.scene, trigger: PG.trigger, form: PG.form, reconstructed: rec };
        const at = ev.findIndex((e) => e && e.scene === PG.scene);
        if (at >= 0) ev[at] = entry; else ev.push(entry);
        sset("toxin_events", ev);
        const s0 = sget("self", 80), self = typeof s0 === "number" && isFinite(s0) ? s0 : 80;
        sset("self", clamp(Math.round(self + (prev ? prev.cost : 0) - cost), 0, 100));
      } catch { /* storage off */ }
      try { const b = api.store.get("best", 0); const sc = lk.length + aside; if (sc > b) api.store.set("best", sc); } catch { /* storage off */ }

      // the stamp on the board, then the end
      const su = rec ? url("split-field-stamp-reconstructed") : "";
      if (dom.stampBox && su) { const im = mk("img", null, dom.stampBox); im.src = su; im.alt = rec ? "RECONSTRUCTED" : "PINNED"; dom.stampBox.classList.add(P + "show"); }
      else if (dom.stampBox) { mk("div", P + "stamptxt", dom.stampBox, rec ? "RECONSTRUCTED" : "PINNED AS IT STANDS"); dom.stampBox.classList.add(P + "show"); }
      dom.pin.disabled = true;

      const total = marks.length;
      let text = rec
        ? `Reconstructed. ${total} marks on the board: ${his} his, ${cult} theirs, ${state} the State's, ${aside} not of this day. `
        : `Pinned as it stands: ${lk.length} of ${total} attributed (${his} his, ${cult} theirs, ${state} the State's), ${aside} set aside, ${left} left unread. `;
      text += hurt.length ? `The record names ${hurt.length === 1 ? "one of the hurt" : hurt.length + " of the hurt"}, and shows no wound. ` : "The record is empty. ";
      text += `The State's broadcast says all ${total} are his. The board says ${his}. `;
      text += cult >= 3 ? "Three or more were the cult's own: the station keeper's name can be spoken against them. " : "";
      text += `Self -${cost}.`;
      later(() => { if (!dead) api.end({ outcome: rec ? "win" : "done", text }); }, RM ? 200 : 1500);
    }

    // ---- how to play ---------------------------------------------------------------------------------
    function intro() {
      mode = "intro";
      page.textContent = "";
      const box = mk("div", P + "intro " + P + "first", page);
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Split Field: how to play");
      mk("div", P + "kick", card, "1D · Chapters 2 and 6 · Craftint Doubletone shading board");
      mk("h2", null, card, "Split Field");
      const q = mk("blockquote", null, card, "He reads the room afterward like evidence of a crime he did not witness.");
      mk("cite", null, q, "Bible, Part VI, Dr. Tox, section 3");
      mk("p", null, card, "The State calls every mark on the board his. Some are. Some were made by his followers in his name, some by the State's own shields, and some by older nights. Match each mark to what made it, as his doctorate taught him.");
      const g = mk("p", null, card); mk("b", null, g, "Goal "); g.append("Attribute every mark and set aside every false trace, then pin the board. The record names the hurt and never shows a wound.");
      const ul = mk("ul", null, card);
      for (const [a, b] of [
        ["Marks", "Tap a number on the board (or in the row of chips). The mark appears in the left half of the circle."],
        ["Trays", "Pick HIS, THEIRS or the STATE's (rim, baton or round). Its lines appear in the right half."],
        ["Line up", "Drag the right half to slide it. Turn it with the dial, the arrows, or Q and E (R puts it back). When the lines run on across the hairline, let go: a true match locks."],
        ["No match", "A mark with no lines to follow is older, not of this day: press NOT OF THIS DAY. A mark that has lines is never set aside."],
      ]) { const li = mk("li", null, ul); mk("b", null, li, a); mk("span", null, li, b); }
      mk("p", null, card, "No failing. Pin the board when you like; it is RECONSTRUCTED only when every mark is read. Reconstructed, the Toxin State costs him 10 of what is left of him, not 15.");
      const bt = mk("div", P + "btns", card);
      const go = mk("button", P + "go", bt, "Start: the water station"); go.type = "button";
      const two = mk("button", null, bt, "Start: the perimeter"); two.type = "button";
      const rec = sget("toxin_in_procession", false) === true;
      if (rec) two.classList.add(P + "go");
      mk("p", P + "fine", card, "The perimeter board is played only if the State fired there; either can be played here.");
      on(go, "click", () => begin(0)); on(two, "click", () => begin(1));
      later(() => { if (!dead) (rec ? two : go).focus({ preventScroll: true }); }, 30);
    }
    function begin(i) {
      pi = i; PG = PAGES[i];
      marks = PG.marks.map((m) => ({ m, state: "open", ref: null }));
      sel = -1; tray = null; stateKey = "rim"; ended = false; misses = 0; refusals = 0; hintShown = false;
      mode = "play"; lastAct = performance.now();
      buildPlay();
      drawDisc(dom.mark, null);
      say("Tap a numbered mark on the board to read it.");
      later(() => { if (!dead && dom.chips.firstChild) dom.chips.firstChild.focus({ preventScroll: true }); }, 30);
    }

    // quiet hint, never a rescue
    const hintT = setInterval(() => {
      if (dead || mode !== "play" || ended || hintShown) return;
      if (performance.now() - lastAct < IDLE_HINT) return;
      hintShown = true;
      if (sel < 0) say("Tap a numbered mark to read it.");
      else if (!tray) say("Pick a tray: compare the mark's lines with what each one would leave.");
      else say("Match the lines across the hairline: the spacing, the widths, where the grooves sit. If nothing will continue, try another tray.");
    }, 4000);

    page.__splitfield = { get mode() { return mode; }, get marks() { return marks; }, get PG() { return PG; }, selectMark, pickTray, pickState, setAside, finish, markPose, poseSet(p) { pose = Object.assign({}, p); paintPose(); }, settle, get pose() { return pose; } };
    intro();

    return {
      unmount() {
        dead = true; clearInterval(hintT); cancelAnimationFrame(raf);
        timers.forEach(clearTimeout); timers.clear(); clearTimeout(keyT);
        offs.forEach((f) => f()); offs.length = 0;
        root.innerHTML = "";
      },
    };
  },
};

function css() {
  return `
.${P}page{position:absolute;inset:0;overflow:auto;background:${DESK};color:${INK};font-family:${MONO};-webkit-tap-highlight-color:transparent;font-size:13px;line-height:1.35}
.${P}page *{box-sizing:border-box}
.${P}wrap{position:relative;margin:8px auto;width:calc(100% - 16px);max-width:1240px;background:${BOARD};border:3px solid ${INK};padding:8px 12px 12px;display:grid;gap:8px 14px;
 grid-template-columns:minmax(0,1fr);grid-template-areas:"head" "mid" "cir" "right"}
.${P}head{grid-area:head;display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap;border-bottom:3px solid ${INK};padding-bottom:6px}
.${P}title{margin:0;font:700 clamp(20px,3.4vw,28px) ${CAPS};letter-spacing:.16em;text-transform:uppercase}
.${P}place{font:700 12px ${MONO};color:${TONE};letter-spacing:.06em;text-transform:uppercase}
.${P}count{margin-left:auto;font:700 12px ${MONO};background:${INK};color:${BOARD};padding:2px 8px;letter-spacing:.06em}
.${P}cir{grid-area:cir;min-width:0}.${P}mid{grid-area:mid;min-width:0}.${P}right{grid-area:right;min-width:0}
.${P}trw{margin-top:10px}
.${P}lh,.${P}recorder{font:700 12px ${CAPS};letter-spacing:.18em;margin-bottom:4px}
.${P}trays{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.${P}tray{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:3px;padding:4px;background:${BOARD};border:2px solid ${INK};cursor:pointer;font:inherit;color:inherit;text-align:left;min-height:48px}
.${P}tray img{width:100%;display:block;height:auto}
.${P}tray.${P}trfb{align-items:center;justify-content:center}
.${P}trnote{font-size:10.5px;line-height:1.25;color:${TONE}}
.${P}tray.${P}sel{background:${SOFT};box-shadow:4px 4px 0 ${INK};transform:translate(-2px,-2px)}
.${P}tray:focus-visible,.${P}kind:focus-visible,.${P}chip:focus-visible,.${P}cb:focus-visible,.${P}pin:focus-visible,.${P}hot:focus-visible,.${P}cbox:focus-visible,.${P}go:focus-visible,.${P}card button:focus-visible{outline:3px solid ${INK};outline-offset:2px}
.${P}kinds{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px;font-weight:700;font-size:12px}
.${P}kind{font:700 12px ${MONO};letter-spacing:.08em;padding:6px 10px;min-height:36px;background:${BOARD};border:2px solid ${INK};cursor:pointer;color:${INK}}
.${P}kind.${P}sel{background:${INK};color:${BOARD}}
.${P}bd{position:relative;width:100%;margin:0 auto}
.${P}bdin{position:relative;width:100%;aspect-ratio:16/9;border:3px solid ${INK};background:${BOARD};overflow:hidden}
.${P}bdin>img{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none;pointer-events:none}
.${P}bdfb{background:${SOFT}}.${P}bdfbt{position:absolute;left:12px;top:10px;font:700 18px ${CAPS};letter-spacing:.14em;color:${TONE}}
.${P}hot{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:transparent;border:0;padding:0;cursor:pointer;font:700 14px ${MONO};color:${INK}}
.${P}hot::after{content:"";position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:3px solid transparent;pointer-events:none}
.${P}hot:hover::after{border-color:${TONE};border-style:dashed}
.${P}hot.${P}sel::after{border-color:${INK};border-style:solid;box-shadow:0 0 0 3px ${BOARD},0 0 0 5px ${INK}}
.${P}fbhot{background:${BOARD};border:3px solid ${INK};width:34px;height:34px;margin:-17px 0 0 -17px}
.${P}hlock{position:absolute;left:50%;top:50%;width:36px;height:36px;margin:-18px 0 0 -18px;pointer-events:none;display:none;font:700 20px ${MONO}}
.${P}hlock img{width:100%;height:100%;display:block}
.${P}hnul{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:${BOARD};border:3px dashed ${TONE};color:${TONE};font:700 20px/28px ${MONO};text-align:center;pointer-events:none;display:none}
.${P}chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0 0}
.${P}chip{min-width:44px;min-height:40px;padding:4px 10px;font:700 14px ${MONO};background:${BOARD};border:2px solid ${INK};cursor:pointer;color:${INK}}
.${P}chip.${P}lk{background:repeating-linear-gradient(45deg,${BOARD} 0 4px,${MID} 4px 5px)}
.${P}chip.${P}as{border-style:dashed;color:${TONE}}
.${P}chip.${P}sel{background:${INK};color:${BOARD}}
.${P}cwrap{position:relative;margin:10px auto 0;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%}
.${P}cbox{position:relative;width:min(100%,340px);min-width:230px;aspect-ratio:440/480;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;outline-offset:4px}
.${P}cbox.${P}grab{cursor:grabbing}
.${P}done .${P}cbox{cursor:default}
.${P}csvg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
.${P}shake{animation:${P}shk .32s}
@keyframes ${P}shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.${P}cap{font-size:12px;text-align:center;min-height:2.6em;max-width:560px}
.${P}ctl{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}
.${P}ctl.${P}off{opacity:.55}
.${P}cb{min-width:44px;min-height:44px;padding:4px 10px;font:700 15px ${MONO};background:${BOARD};border:2px solid ${INK};cursor:pointer;color:${INK}}
.${P}cb.${P}wide{font-size:12px;letter-spacing:.06em}
.${P}cb:disabled{cursor:default}
.${P}sl{display:flex;align-items:center;gap:6px;font:700 11px ${MONO};letter-spacing:.1em}
.${P}sl input{width:min(150px,32vw);height:30px;accent-color:${INK}}
.${P}angv{display:inline-block;min-width:3em;text-align:right;font-weight:700}
.${P}stampbtn{padding:2px;background:${BOARD}}
.${P}stampbtn img{display:block;width:clamp(150px,30vw,200px);height:auto}
.${P}aside.${P}stampbtn img{width:clamp(140px,26vw,190px)}
.${P}log{min-height:3.3em;max-width:560px;text-align:center;font:italic 13px/1.35 ${MONO};color:${TONE};padding:4px 6px}
.${P}log.${P}strong{color:${INK};font-weight:700;font-style:normal}
.${P}rechd{height:0;padding-bottom:calc(100% * 60 / 320);background:center top/100% auto no-repeat;margin-bottom:4px;overflow:hidden;font-size:0}
.${P}rec{display:flex;flex-direction:column;gap:6px}
.${P}recempty{font-size:12px;color:${TONE};border:2px dashed ${MID};padding:10px}
.${P}recline{background:center/100% 100% no-repeat ${SOFT};padding:4px;border:2px solid ${INK}}
.${P}recin{background:${BOARD};padding:5px 8px;position:relative;border:1px solid ${INK}}
.${P}recname{font:700 14px ${CAPS};letter-spacing:.06em;text-transform:uppercase}
.${P}recmark{position:absolute;right:8px;top:6px;font-size:10px;color:${TONE};letter-spacing:.06em}
.${P}recwant{font-size:11.5px;color:${TONE};margin:1px 0 3px}
.${P}recby{font-size:12px;border-top:1px solid ${MID};padding-top:3px}
.${P}recaside{font:italic 12px ${MONO};color:${TONE};text-align:center;padding:4px}
.${P}pin{margin:10px auto 0;display:block;min-height:46px;padding:6px 14px;font:700 14px ${CAPS};letter-spacing:.14em;background:${BOARD};border:3px solid ${INK};cursor:pointer;color:${INK}}
.${P}pin:disabled{opacity:.5;cursor:default}
.${P}stampbox{position:absolute;left:50%;top:44%;width:56%;transform:translate(-50%,-50%) rotate(-6deg) scale(1.4);opacity:0;pointer-events:none}
.${P}stampbox img{width:100%;display:block}
.${P}stampbox.${P}show{opacity:1;transform:translate(-50%,-50%) rotate(-6deg) scale(1);transition:transform .3s ease-in,opacity .15s}
.${P}stamptxt{font:700 clamp(22px,5vw,44px) ${CAPS};letter-spacing:.14em;text-align:center;border:5px solid ${INK};background:${BOARD};padding:8px}
.${P}intro{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-start;justify-content:center;padding:14px;background:rgba(217,216,210,.88);overflow:auto}
.${P}intro.${P}first{background:${DESK}}
.${P}card{background:${BOARD};border:3px solid ${INK};box-shadow:6px 6px 0 ${INK};padding:16px 18px;max-width:560px;width:100%;font-size:13px;margin:auto}
.${P}card h2{margin:2px 0 8px;font:700 clamp(24px,5vw,32px) ${CAPS};letter-spacing:.16em;text-transform:uppercase}
.${P}kick{font:700 11px ${MONO};letter-spacing:.1em;text-transform:uppercase;color:${TONE}}
.${P}card blockquote{margin:6px 0 10px;padding:6px 10px;border-left:5px solid ${INK};background:${SOFT};font:italic 15px/1.4 Georgia,serif}
.${P}card cite{display:block;font:11px ${MONO};letter-spacing:.06em;color:${TONE};font-style:normal;margin-top:2px}
.${P}card p{margin:7px 0}
.${P}card ul{margin:6px 0;padding:0;list-style:none}
.${P}card li{margin:5px 0}.${P}card li b{display:inline-block;min-width:5.6em;letter-spacing:.05em}
.${P}fine{font-size:11px;color:${TONE}}
.${P}btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.${P}card button{min-height:44px;padding:8px 14px;font:700 13px ${MONO};letter-spacing:.05em;background:${BOARD};border:3px solid ${INK};cursor:pointer;color:${INK}}
.${P}card button.${P}go{background:${INK};color:${BOARD}}
@media (min-width:900px){
 .${P}wrap{grid-template-columns:360px minmax(0,1fr) 250px;grid-template-areas:"head head head" "cir mid right";align-items:start}
 .${P}cwrap{margin-top:0}
 .${P}trnote{font-size:11px}
 .${P}bd{max-width:100%}
}
@media (max-width:420px){.${P}wrap{padding:6px 8px 10px;width:calc(100% - 8px);margin:4px auto}.${P}tray{padding:3px}.${P}trnote{font-size:9.5px}}
@media (prefers-reduced-motion:reduce){.${P}page *{animation:none!important;transition:none!important}}
`;
}

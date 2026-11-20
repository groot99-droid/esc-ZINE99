// Dr. Tox: Finale / Switchboard (1D, patching life-support circuits; DESIGN.md section 11, `g1_switchboard`;
// scenes s1_switchboard_1 (the maintenance level) and s1_switchboard_2 (the core)).
// Letterer's balloon page: a comic page at the lettering stage. Pencilled panel borders, inked balloons in hand-lettered
// capitals, balloon tails run as patch cords to the panels, blue guidelines under the letters.
//
// The rules, from DESIGN.md. Panels are districts (THE TOWERS, THE SUITES, THE ATRIUM, THE PLINTH, and on page 2 THE ROAD).
// Balloons are circuits (AIR 1..); each balloon's tail is a cord the player drags to a panel. Every panel keeps at least one
// live tail at all times: pulling a panel's last tail greys it and the cord springs back (nobody's air is cut on the page).
// The red balloons are the State's interlocks: they cut THE PLINTH's only tail whenever THE TOWERS drop below two tails
// ("the plinth breathes only what the towers exhale"). The HUB balloon is the circuit the last dose will ride: three tails
// on page 1, five on page 2. Patching a HUB tail to a panel counts that district in switchboard.reach; to THE PLINTH,
// switchboard.plinth. The interlocks must be bypassed (patched to each other) before the HUB can reach THE PLINTH. Page 2
// adds ASSIST: the suite's patients on assisted breathing (Imogen Hart). Patched to the HUB, the overload's pressure would
// reach them first; patched to its own clean line, it does not (switchboard.suite_isolated).
//
// Inputs: drag a tail (the dot under a balloon, or the plug in a panel) to a panel; drag it off to set it loose; tap a red
// balloon to read it. Or tap a tail, then tap a panel (keys: Enter to pick up, 1 to 5 to patch to a district, U to pull
// it off, Esc to put it down). Finish: confirm the page when every HUB tail is placed. Failure: none (the design says so).
// The page ends `win` when the plinth is reached and, on the core page, the suite is on its own line; `done` otherwise.
//
// Reads (data/flags.json): switchboard.reach and switchboard.plinth (a page-1 result opens page 2 with the interlock's
// note already in the margin). Writes: switchboard.reach (distinct districts the HUB reaches, 0..5), switchboard.plinth,
// switchboard.suite_isolated (page 2). A replay overwrites; nothing is counted twice. No HUD on this page.
//
// Art (games/dr-tox-finale/art/ASSET_MAP.md, "Switchboard"): switchboard-page-1/-2 (cropped to each district),
// switchboard-balloon-air-1..4/-hub/-lock/-assist/-dead, -jack, -socket, -socket-live, -note, -lock-note, -confirm. Every id
// falls back to a drawing made here when the bundle lacks it.
//
// Quoted from the author's work, verbatim (DESIGN.md): "flooding the city's life support" (Story: The Finale);
// "the plinth breathes only what the towers exhale" (marked *added* there).
//
// Added for the game (not in DESIGN.md; the author approves or strikes): every district holds at most three tails (the
// socket row); page 1's single interlock is bypassed by patching it back onto itself (the design says "one interlock" and
// "patch them to each other"); page 2 labels the two interlocks A and B; ASSIST's clean line is any AIR balloon that
// still reaches THE SUITES (the page refuses to move that tail away: it will not cut anyone's air); the opening cords of
// each page; the interlock balloon pulses after forty quiet seconds (a hint, invented); the win rule; all captions.

const P = "dtf-sw-";
const INK = "#151515", RED = "#c4202f", BLUE = "#8EC5E8", BLUE2 = "#2a7fb8", PENCIL = "#9a9a9a", PAPER = "#fbfaf6", DESK = "#d9d6cc";
const HAND = "'Comic Neue','Segoe Print','Bradley Hand','Chalkboard SE',cursive";
const CAPS = "'Oswald','Arial Narrow',Impact,sans-serif";
const MONO = "'IBM Plex Mono','Courier New',Courier,monospace";
const CAP = 3;       // sockets in a district's row
const IDLE_HINT = 40000;

const NAME = { towers: "THE TOWERS", suites: "THE SUITES", atrium: "THE ATRIUM", plinth: "THE PLINTH", road: "THE ROAD" };
// crop of each district out of the page art (native 1280 x 720): x of each panel, common y and size
const CROP = { 1: { xs: [58, 352, 647, 941], w: 282 }, 2: { xs: [57, 293, 529, 765, 1000], w: 223 } };
const CROP_Y = 378, CROP_H = 305;

const PAGES = [
  {
    n: 1, scene: "s1_switchboard_1", place: "The maintenance level", year: "2240", art: "switchboard-page-1",
    panels: ["towers", "suites", "atrium", "plinth"],
    balloons: [
      { id: "air1", kind: "air", label: "AIR 1", art: "switchboard-balloon-air-1", tails: ["towers", "towers"] },
      { id: "air2", kind: "air", label: "AIR 2", art: "switchboard-balloon-air-2", tails: ["suites", "atrium"] },
      { id: "air3", kind: "air", label: "AIR 3", art: "switchboard-balloon-air-3", tails: ["plinth"] },
      { id: "lock", kind: "lock", label: "LOCK", art: "switchboard-balloon-lock", tails: [null] },
      { id: "hub", kind: "hub", label: "HUB", art: "switchboard-balloon-hub", tails: [null, null, null] },
    ],
  },
  {
    n: 2, scene: "s1_switchboard_2", place: "The core", year: "2240", art: "switchboard-page-2",
    panels: ["towers", "suites", "atrium", "plinth", "road"],
    balloons: [
      { id: "air1", kind: "air", label: "AIR 1", art: "switchboard-balloon-air-1", tails: ["road", "towers"] },
      { id: "air2", kind: "air", label: "AIR 2", art: "switchboard-balloon-air-2", tails: ["towers", "suites"] },
      { id: "air3", kind: "air", label: "AIR 3", art: "switchboard-balloon-air-3", tails: ["suites", "atrium"] },
      { id: "air4", kind: "air", label: "AIR 4", art: "switchboard-balloon-air-4", tails: ["plinth"] },
      { id: "lockA", kind: "lock", label: "LOCK A", art: "switchboard-balloon-lock", tails: [null] },
      { id: "lockB", kind: "lock", label: "LOCK B", art: "switchboard-balloon-lock", tails: [null] },
      { id: "assist", kind: "assist", label: "ASSIST", art: "switchboard-balloon-assist", tails: ["@hub"] },
      { id: "hub", kind: "hub", label: "HUB", art: "switchboard-balloon-hub", tails: [null, null, null, null, null] },
    ],
  },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function css() {
  return `
.${P}page{position:absolute;inset:0;overflow:auto;background:${DESK};color:${INK};font-family:${MONO};-webkit-tap-highlight-color:transparent;touch-action:pan-y}
.${P}sheet{position:relative;box-sizing:border-box;margin:8px auto;width:calc(100% - 16px);max-width:1180px;min-height:calc(100% - 16px);background:${PAPER};border:2px solid #b9b5a8;box-shadow:3px 4px 0 rgba(0,0,0,.25);padding:6px 12px 10px;display:flex;flex-direction:column;gap:6px;
 background-image:repeating-linear-gradient(0deg,transparent 0 33px,rgba(142,197,232,.28) 33px 34px)}
.${P}head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.${P}title{font:700 clamp(20px,3.4vw,28px) ${CAPS};letter-spacing:.14em;text-transform:uppercase;margin:0}
.${P}pg{font:700 12px ${MONO};color:${PENCIL};letter-spacing:.08em}
.${P}count{margin-left:auto;font:italic 13px ${HAND};color:${BLUE2}}
.${P}notes{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.${P}note{position:relative;flex:1 1 260px;max-width:520px;min-height:34px;aspect-ratio:520/70;background:center/100% 100% no-repeat;display:flex;align-items:center;padding-left:19%;padding-right:12%;box-sizing:border-box;white-space:nowrap;font:700 clamp(12px,1.6vw,15px) ${HAND};color:${INK};overflow:hidden}
.${P}note.${P}nf{aspect-ratio:auto;padding-left:62px;border-bottom:2px solid ${BLUE}}
.${P}note.${P}nf::before{content:attr(data-k);position:absolute;left:4px;top:50%;transform:translateY(-50%);font:italic 700 15px ${HAND};color:${BLUE2}}
.${P}note b{color:${RED}}
.${P}board{position:relative;display:flex;flex-direction:column;gap:6px;padding-bottom:4px}
.${P}rows{position:relative;display:flex;flex-direction:column;gap:2px;z-index:2}
.${P}row{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px;align-items:flex-start}
.${P}bal{position:relative;display:flex;flex-direction:column;align-items:center;flex:0 0 auto}
.${P}bbody{position:relative;display:block;margin:0;padding:0;border:0;background:transparent;width:var(--bw,150px);cursor:default;font-family:${CAPS}}
.${P}bbody.${P}hubb{width:var(--hw,210px)}
.${P}bbody img{display:block;width:100%;height:auto;pointer-events:none}
.${P}bbody .${P}bf{display:flex;align-items:center;justify-content:center;aspect-ratio:220/120;border:3px solid ${INK};border-radius:50%;background:${PAPER};font:700 clamp(18px,2.4vw,26px) ${CAPS};letter-spacing:.06em}
.${P}bbody.${P}lk{cursor:pointer}
.${P}bbody.${P}lk .${P}bf{border-color:${RED};color:${RED}}
.${P}bbody.${P}dead{opacity:.8}
.${P}bbody.${P}drop{outline:3px dashed ${RED};outline-offset:3px;border-radius:50%}
.${P}bbody:focus-visible{outline:3px solid ${RED};outline-offset:3px}
.${P}bbody.${P}pulse{animation:${P}pulse 1.2s ease-in-out infinite}
@keyframes ${P}pulse{0%,100%{filter:drop-shadow(0 0 0 ${RED})}50%{filter:drop-shadow(0 0 7px ${RED})}}
.${P}sub{font:italic 700 11px ${HAND};color:${BLUE2};margin-top:-2px;letter-spacing:.04em;text-align:center;max-width:var(--bw,150px)}
.${P}tails{display:flex;gap:2px;justify-content:center;min-height:36px;margin-top:-6px}
.${P}tail{position:relative;width:34px;height:36px;padding:0;border:0;background:transparent;cursor:grab;touch-action:none;font-family:${MONO}}
.${P}tail i{position:absolute;left:50%;top:6px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:${INK};border:2px solid ${INK};box-sizing:border-box}
.${P}tail.${P}tr i{background:${RED};border-color:${RED}}
.${P}tail.${P}tb i{background:${BLUE2};border-color:${BLUE2}}
.${P}tail.${P}loose i{background:${PAPER};border-style:dashed}
.${P}tail.${P}sel i{box-shadow:0 0 0 4px rgba(196,32,47,.45);background:${RED}}
.${P}tail em{position:absolute;left:0;right:0;bottom:0;text-align:center;font:700 9px ${MONO};font-style:normal;color:${INK}}
.${P}tail:focus-visible{outline:3px solid ${RED};outline-offset:0;border-radius:6px}
.${P}svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:visible}
.${P}panels{position:relative;display:grid;gap:8px;z-index:2;margin-top:6px}
.${P}panel{position:relative;display:flex;flex-direction:column;min-width:0}
.${P}slots{display:flex;justify-content:center;gap:3px;height:var(--sl,28px);align-items:center}
.${P}slot{position:relative;width:var(--sl,28px);height:var(--sl,28px);padding:0;border:0;background:transparent;cursor:grab;touch-action:none;display:block}
.${P}slot img,.${P}slot b{position:absolute;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px);display:block;pointer-events:none}
.${P}slot b{border:2px dashed ${PENCIL};border-radius:50%;box-sizing:border-box;background:${PAPER}}
.${P}slot.${P}live b{border:2px solid ${INK};background:${INK}}
.${P}slot.${P}live.${P}sr b{background:${RED};border-color:${RED}}
.${P}slot.${P}live.${P}sb b{background:${BLUE2};border-color:${BLUE2}}
.${P}slot.${P}sel{outline:3px solid ${RED};border-radius:50%}
.${P}slot:focus-visible{outline:3px solid ${RED};border-radius:50%}
.${P}slot:not(.${P}live){cursor:default}
.${P}pbody{position:relative;display:block;width:100%;aspect-ratio:var(--ar,282/305);border:0;padding:0;margin:0;background:${PAPER} center/100% 100% no-repeat;cursor:default;font-family:${MONO};overflow:hidden}
.${P}pbody.${P}pf{border:2px solid ${PENCIL}}
.${P}pbody .${P}pn{position:absolute;left:5px;right:5px;bottom:4px;text-align:left;font:700 clamp(8px,1.5vw,13px) ${CAPS};letter-spacing:.06em;color:${PENCIL};pointer-events:none}
.${P}pbody .${P}pc{position:absolute;right:4px;top:3px;font:700 11px ${MONO};color:${INK};background:${PAPER};padding:0 4px;border:1px solid ${INK};pointer-events:none}
.${P}pbody .${P}pk{position:absolute;left:3px;top:3px;font:700 10px ${MONO};color:${BLUE2};background:${PAPER};padding:0 3px;border:1px solid ${BLUE2};pointer-events:none}
.${P}panel.${P}armed .${P}pbody{cursor:pointer;outline:3px dashed ${RED};outline-offset:-3px}
.${P}panel.${P}armed .${P}pbody:hover{background-color:#f6ddd8}
.${P}panel.${P}grey .${P}pbody{filter:grayscale(1) brightness(.78)}
.${P}panel.${P}shake{animation:${P}shake .35s}
@keyframes ${P}shake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.${P}pbody:focus-visible{outline:3px solid ${RED};outline-offset:2px}
.${P}foot{display:flex;gap:10px;align-items:stretch;flex-wrap:wrap}
.${P}cap{position:relative;flex:1 1 300px;box-sizing:border-box;padding:8px 12px;border:1.5px solid ${INK};background:${PAPER};min-height:64px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.${P}cap p{margin:0;flex:1 1 200px;font-size:13.5px;line-height:1.35}
.${P}cap.${P}warn{border-color:${RED}}
.${P}acts{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.${P}acts button,.${P}card button{font:700 13px ${MONO};color:${INK};background:${PAPER};border:2px solid ${INK};padding:7px 11px;min-height:40px;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.25)}
.${P}acts button:disabled{opacity:.4;cursor:default;box-shadow:none}
.${P}acts button:focus-visible,.${P}card button:focus-visible,.${P}ok:focus-visible{outline:3px solid ${RED};outline-offset:2px}
.${P}go{background:${INK}!important;color:${PAPER}!important}
.${P}ok{position:relative;flex:0 0 auto;width:clamp(180px,26vw,280px);aspect-ratio:280/90;padding:0;border:0;background:transparent;cursor:pointer;font:700 20px ${CAPS};letter-spacing:.08em}
.${P}ok img{display:block;width:100%;height:100%;pointer-events:none}
.${P}ok span{display:block;width:100%;height:100%;border:4px solid ${INK};box-sizing:border-box;background:${PAPER};display:flex;align-items:center;justify-content:center}
.${P}ok.${P}off{opacity:.38;filter:grayscale(1)}
.${P}ok:active:not(.${P}off){transform:translate(1px,1px)}
.${P}lnote{position:relative;width:min(100%,420px);aspect-ratio:520/110;background:center/100% 100% no-repeat;margin:2px auto 0;cursor:pointer}
.${P}lnote.${P}nf{aspect-ratio:auto;box-sizing:border-box;border:2px solid ${RED};color:${RED};font:700 14px ${CAPS};letter-spacing:.04em;padding:8px 10px}
.${P}intro,.${P}pop{position:absolute;inset:0;z-index:20;display:grid;place-items:start center;padding:14px;background:rgba(20,19,18,.6);overflow:auto}
.${P}pop{place-items:center}
.${P}card{position:relative;box-sizing:border-box;width:100%;max-width:620px;margin:auto 0;background:${PAPER};border:2px solid ${INK};padding:16px 18px;box-shadow:6px 7px 0 rgba(0,0,0,.4)}
.${P}card .${P}kick{font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.${P}card h2{margin:2px 0 6px;font:700 30px ${CAPS};letter-spacing:.12em;text-transform:uppercase}
.${P}card blockquote{margin:0 0 6px;padding:4px 10px;border-left:4px solid ${RED};font-style:italic;font-size:13px}
.${P}card blockquote cite{display:block;font-style:normal;font-size:10.5px;opacity:.7;margin-top:2px}
.${P}card p{margin:0 0 6px;font-size:13px;line-height:1.4}
.${P}card ul{margin:0 0 8px;padding:0;list-style:none;font-size:12.5px}
.${P}card li{display:grid;grid-template-columns:96px 1fr;gap:8px;padding:3px 0;border-top:1px dashed #9a9684}
.${P}card .${P}btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
@media (max-width:760px){
 .${P}sheet{width:calc(100% - 8px);margin:4px auto;padding:4px 6px 8px;min-height:calc(100% - 8px)}
 .${P}panels{gap:4px}
 .${P}slots{gap:0}
 .${P}row{gap:2px 4px}
 .${P}cap p{font-size:12.5px}
 .${P}cap{padding:6px 10px;min-height:56px}
 .${P}card{padding:14px}
 .${P}card h2{font-size:26px}
 .${P}card li{grid-template-columns:78px 1fr}
 .${P}ok{width:128px;align-self:center}
 .${P}foot{flex-wrap:nowrap}
 .${P}cap{flex:1 1 0;min-width:0}
 .${P}cap p{flex:1 1 120px}
}
@media (prefers-reduced-motion:reduce){.${P}page *{animation:none!important;transition:none!important}}
`;
}

export default {
  mount(root, api) {
    const RM = !!api.reducedMotion;
    const art = api.art || null;
    const has = (id) => { try { return !!(art && art.has(id)); } catch { return false; } };
    const url = (id) => { try { return has(id) ? art.url(id) : ""; } catch { return ""; } };
    const shared = api.shared || { get: (k, d) => d, set() {} };
    const store = api.store || { get: (k, d) => d, set() {} };
    const sget = (k, d) => { try { const v = shared.get(k, d); return v === undefined || v === null ? d : v; } catch { return d; } };
    const sset = (k, v) => { try { shared.set(k, v); } catch { /* storage off */ } };

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const offs = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
    const mk = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const svgn = (tag, attrs, parent) => { const e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    let dead = false;

    const style = mk("style", null, root); style.textContent = css();
    const page = mk("div", P + "page", root);
    page.setAttribute("aria-label", "Switchboard: a comic page at the lettering stage, with balloon tails to patch to districts");

    // ---- state ---------------------------------------------------------------------------------------
    let mode = "intro", pi = 0, PG = PAGES[0], solo = false;
    let balloons = [], tails = [];           // tails: { id, b (balloon id), i, to }  to: panel id | "@balloon" | null
    let sel = null;                          // selected tail id
    let drag = null;                         // { id, x0, y0, moved }
    let moves = 0, refusals = 0, lastCommit = 0, hintOn = false, lockRead = false;
    const results = [];
    const dom = {};
    const isPanel = (t) => t && t[0] !== "@";
    const balOf = (id) => balloons.find((b) => b.id === id);
    const tailOf = (id) => tails.find((t) => t.id === id);
    const kindOf = (t) => balOf(t.b).kind;
    const toLabel = (to) => (to == null ? "loose" : isPanel(to) ? NAME[to] : balOf(to.slice(1)).label);

    function setupPage(i) {
      pi = i; PG = PAGES[i]; sel = null; drag = null; moves = 0; refusals = 0; lockRead = false; hintOn = false;
      balloons = PG.balloons.map((b) => ({ id: b.id, kind: b.kind, label: b.label, art: b.art }));
      tails = [];
      PG.balloons.forEach((b) => b.tails.forEach((to, k) => {
        let dest = to;
        if (to === "@hub") dest = "@hub";
        tails.push({ id: `${b.id}.${k}`, b: b.id, i: k, to: dest });
      }));
      lastCommit = performance.now();
    }

    // ---- rules ---------------------------------------------------------------------------------------
    const countsOf = (st) => {
      const c = {}; PG.panels.forEach((p) => { c[p] = 0; });
      st.forEach((t) => { const k = balloons.find((b) => b.id === t.b).kind; if ((k === "air" || k === "hub") && isPanel(t.to)) c[t.to]++; });
      return c;
    };
    const bypassed = (st) => {
      if (PG.n === 1) { const t = st.find((x) => x.b === "lock"); return !!t && t.to === "@lock"; }
      const a = st.find((x) => x.b === "lockA"), b = st.find((x) => x.b === "lockB");
      return a.to === "@lockB" || b.to === "@lockA";
    };
    // does the ASSIST balloon sit on its own clean line: an AIR balloon that still reaches THE SUITES
    const assistFeed = (st) => { const a = st.find((x) => x.b === "assist"); return a ? a.to : null; };
    const assistClean = (st) => {
      const f = assistFeed(st); if (!f || f === "@hub") return false;
      const id = f.slice(1); const bl = balloons.find((b) => b.id === id);
      return !!bl && bl.kind === "air" && st.some((t) => t.b === id && t.to === "suites");
    };
    // the first rule a state breaks, or null
    function broken(st) {
      const c = countsOf(st);
      for (const p of PG.panels) if (c[p] > CAP) return { why: "full", panel: p };
      for (const p of PG.panels) if (c[p] < 1) return { why: "last", panel: p };
      const by = bypassed(st);
      if (!by) {
        if (c.plinth > 1) return { why: "plinth", panel: "plinth" };
        if (c.towers < 2) return { why: "towers", panel: "towers" };
      }
      const f = assistFeed(st);
      if (f && f !== "@hub" && !assistClean(st)) return { why: "assist", panel: "suites" };
      return null;
    }
    const WHY = {
      full: (b) => `${NAME[b.panel]} has ${CAP} sockets and all ${CAP} are taken.`,
      last: (b) => `${NAME[b.panel]} would lose its last tail and go grey. The cord springs back: nobody's air is cut on this page.`,
      towers: () => `THE TOWERS would drop below two tails. The interlock would cut THE PLINTH's only tail: the plinth breathes only what the towers exhale. The cord springs back.`,
      plinth: () => PG.n === 1
        ? "While the interlock holds, THE PLINTH takes only the one tail the towers give it. Tap the red balloon: patch it back onto itself."
        : "While an interlock holds, THE PLINTH takes only the one tail the towers give it. Tap a red balloon: patch the two to each other.",
      assist: () => "ASSIST would be left with no line that reaches THE SUITES. The page will not cut the patients' air. The cord springs back.",
    };

    // ---- moves ---------------------------------------------------------------------------------------
    function tryMove(id, dest) {
      const t = tailOf(id); if (!t) return;
      const k = kindOf(t);
      if (dest === t.to) { sel = null; render(); say(`${tname(t)} stays where it is.`); return; }
      let bad = null;
      if (dest == null) { if (k === "assist") bad = "ASSIST must stay on a line: the page will not cut the patients' air. Patch it to the HUB or to an AIR balloon."; }
      else if (isPanel(dest)) { if (k === "lock") bad = "An interlock does not patch to a district. Patch it to the other interlock."; else if (k === "assist") bad = "ASSIST patches to a balloon, not to a district: pick the line it breathes through."; }
      else {
        const target = balOf(dest.slice(1));
        if (k === "air" || k === "hub") bad = `${balOf(t.b).label}'s tails patch to districts, not to a balloon.`;
        else if (k === "lock") {
          if (PG.n === 1 && dest !== "@lock") bad = "The interlock patches back onto itself, or sits loose.";
          else if (PG.n === 2 && (dest === "@" + t.b || target.kind !== "lock")) bad = "An interlock patches to the other interlock.";
        } else if (k === "assist") { if (target.kind !== "hub" && target.kind !== "air") bad = "ASSIST breathes through the HUB or through an AIR balloon."; }
      }
      if (bad) { refuse(null, bad, null); return; }
      const next = tails.map((x) => (x.id === id ? { ...x, to: dest } : x));
      const br = broken(next);
      if (br) { refuse(br.panel, br.why === "full" ? WHY.full(br) : br.why === "last" ? WHY.last(br) : WHY[br.why](br), br.why); return; }
      const wasBy = bypassed(tails), wasClean = PG.n === 2 ? assistClean(tails) : false;
      t.to = dest; sel = null; moves++; lastCommit = performance.now(); hintOn = false;
      render();
      if (!wasBy && bypassed(tails)) { say(`The interlock is bypassed.${PG.n === 2 ? " LOCK A and LOCK B are patched to each other." : ""} THE PLINTH can take a second tail now.`); return; }
      if (wasBy && !bypassed(tails)) { say("The interlock holds again: THE PLINTH takes only one tail."); return; }
      if (k === "assist") { say(assistClean(tails) ? `ASSIST breathes through ${balOf(dest.slice(1)).label}, which still reaches THE SUITES. It is on its own line: the overload's pressure does not reach the patients first.` : "ASSIST is on the HUB's line. The overload's pressure would reach the patients first."); return; }
      void wasClean;
      if (dest == null) { say(`${tname(t)} is loose.`); return; }
      if (k === "hub") {
        const extra = dest === "plinth" ? " It breathes what the towers breathe." : "";
        say(`The HUB's tail reaches ${NAME[dest]}.${extra}`);
      } else say(`${tname(t)} patched to ${NAME[dest]}.`);
    }
    const tname = (t) => `${balOf(t.b).label}${balloons.length && PG.balloons.find((b) => b.id === t.b).tails.length > 1 ? ", tail " + (t.i + 1) : ""}`;

    function refuse(panel, text, why) {
      refusals++; sel = null; drag = null;
      render();
      say(text, true);
      if (panel && dom.panels[panel]) {
        const el = dom.panels[panel];
        if (why === "last") { el.classList.add(P + "grey"); later(() => el.classList.remove(P + "grey"), RM ? 700 : 900); }
        if (!RM) { el.classList.remove(P + "shake"); void el.offsetWidth; el.classList.add(P + "shake"); later(() => el.classList.remove(P + "shake"), 400); }
      }
      if (why === "towers" || why === "plinth") showLockNote(true);
    }

    function hubInfo() {
      const hub = tails.filter((t) => t.b === "hub"), placed = hub.filter((t) => isPanel(t.to));
      const set = [...new Set(placed.map((t) => t.to))];
      return { total: hub.length, placed: placed.length, set };
    }
    const canConfirm = () => hubInfo().placed === hubInfo().total;

    // ---- drawing -------------------------------------------------------------------------------------
    function sizes() {
      const w = page.clientWidth || 800, narrow = w <= 760;
      const n = balloons.length;
      let bw = narrow ? Math.floor((w - 28) / 4) - 6 : 150;
      if (!narrow) bw = clamp(Math.floor((Math.min(w, 1180) - 40) / (PG.n === 2 ? 8 : 6)) - 10, 96, 150);
      page.style.setProperty("--bw", bw + "px");
      page.style.setProperty("--hw", clamp(narrow ? Math.floor((w - 28) * 0.62) : bw * 1.4, 150, 230) + "px");
      const sl = narrow ? Math.floor((w - 28) / PG.panels.length / 3) : 28;
      page.style.setProperty("--sl", clamp(sl, 18, 30) + "px");
      void n;
      return narrow;
    }

    function say(text, warn) {
      if (!dom.capP) return;
      dom.capP.textContent = text;
      dom.cap.classList.toggle(P + "warn", !!warn);
    }

    function buildStage() {
      page.textContent = "";
      const sheet = mk("div", P + "sheet", page);
      const head = mk("div", P + "head", sheet);
      mk("h1", P + "title", head, "Switchboard");
      mk("span", P + "pg", head, `PG. ${PG.n} · ${PG.place.toUpperCase()}, ${PG.year}`);
      dom.count = mk("span", P + "count", head);
      const notes = mk("div", P + "notes", sheet);
      dom.hubNote = mk("div", P + "note", notes); dom.hubNote.setAttribute("aria-live", "polite");
      if (has("switchboard-note")) dom.hubNote.style.backgroundImage = `url("${url("switchboard-note")}")`; else { dom.hubNote.classList.add(P + "nf"); dom.hubNote.dataset.k = "HUB:"; }
      dom.assistNote = PG.n === 2 ? mk("div", P + "note " + P + "nf", notes) : null;
      if (dom.assistNote) { dom.assistNote.dataset.k = "ASSIST:"; dom.assistNote.setAttribute("aria-live", "polite"); }
      const board = mk("div", P + "board", sheet); dom.board = board;
      dom.rows = mk("div", P + "rows", board);
      dom.svg = svgn("svg", { class: P + "svg", "aria-hidden": "true" }, board);
      dom.panelsEl = mk("div", P + "panels", board);
      dom.panelsEl.style.gridTemplateColumns = `repeat(${PG.panels.length},minmax(0,1fr))`;
      dom.lockNote = mk("div", "", sheet);
      const foot = mk("div", P + "foot", sheet);
      const cap = mk("div", P + "cap", foot); dom.cap = cap;
      dom.capP = mk("p", null, cap); dom.capP.setAttribute("aria-live", "polite");
      dom.acts = mk("div", P + "acts", cap);
      const ok = mk("button", P + "ok", foot); ok.type = "button"; dom.ok = ok;
      if (has("switchboard-confirm")) { const im = mk("img", null, ok); im.src = url("switchboard-confirm"); im.alt = "OK TO PRINT"; im.draggable = false; } else mk("span", null, ok, "OK TO PRINT");
      ok.setAttribute("aria-label", "OK to print: confirm the page");
      on(ok, "click", confirmPage);
      dom.panels = {};
    }

    function render() {
      if (!dom.rows) return;
      const narrow = sizes();
      // the balloons: AIR and the interlocks and ASSIST in the upper rows, the HUB nearest the districts
      dom.rows.textContent = "";
      const upper = mk("div", P + "row", dom.rows), hubRow = mk("div", P + "row", dom.rows);
      const dragTail = drag && drag.moved ? drag.id : null;
      balloons.forEach((b) => {
        const wrap = mk("div", P + "bal", b.kind === "hub" ? hubRow : upper);
        const mine = tails.filter((t) => t.b === b.id);
        const deadB = (b.kind === "air") && mine.every((t) => t.to == null);
        const body = mk(b.kind === "lock" ? "button" : "div", P + "bbody" + (b.kind === "hub" ? " " + P + "hubb" : "") + (b.kind === "lock" ? " " + P + "lk" : "") + (deadB ? " " + P + "dead" : ""), wrap);
        if (b.kind === "lock") body.type = "button";
        body.dataset.drop = "@" + b.id;
        const aid = deadB && has("switchboard-balloon-dead") ? "switchboard-balloon-dead" : b.art;
        if (has(aid)) { const im = mk("img", null, body); im.src = url(aid); im.alt = ""; im.draggable = false; }
        else mk("div", P + "bf", body, b.label.replace(/^LOCK.*/, "LOCK"));
        if (b.kind === "lock") {
          body.setAttribute("aria-label", `${b.label}: the State's interlock. Tap to read it.`);
          on(body, "click", () => { if (sel) { const t = tailOf(sel); if (t && kindOf(t) !== "air" && kindOf(t) !== "hub") { tryMove(sel, "@" + b.id); return; } } showLockNote(false); });
          if (hintOn) body.classList.add(P + "pulse");
          if (PG.n === 2 || true) mk("div", P + "sub", wrap, bypassed(tails) ? "BYPASSED" : "HOLDS").style.color = bypassed(tails) ? BLUE2 : RED;
        } else if (b.kind === "assist") {
          body.setAttribute("role", "img"); body.setAttribute("aria-label", "ASSIST: the suite's patients on assisted breathing, Imogen Hart among them");
          mk("div", P + "sub", wrap, "I. HART").style.opacity = ".75";
          if (sel && tailOf(sel).b !== "assist") { /* ASSIST is not a target for others */ }
        } else if (b.kind === "hub") { body.setAttribute("role", "img"); body.setAttribute("aria-label", "HUB: the circuit the last dose will ride"); }
        else { body.setAttribute("role", "img"); body.setAttribute("aria-label", b.label); }
        // a balloon that can take a tail: the interlocks and the circuits ASSIST can breathe through
        const st = sel ? tailOf(sel) : null;
        if (st && kindOf(st) === "assist" && (b.kind === "hub" || b.kind === "air") && st.to !== "@" + b.id) {
          body.classList.add(P + "drop"); body.style.cursor = "pointer"; body.setAttribute("role", "button"); body.tabIndex = 0;
          body.setAttribute("aria-label", `${b.label}: patch ASSIST here`);
          on(body, "click", () => tryMove(sel, "@" + b.id));
          on(body, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tryMove(sel, "@" + b.id); } });
        }
        const row = mk("div", P + "tails", wrap);
        mine.forEach((t) => {
          const e = mk("button", P + "tail" + (b.kind === "lock" ? " " + P + "tr" : b.kind === "assist" ? " " + P + "tb" : "") + (t.to == null ? " " + P + "loose" : "") + (sel === t.id ? " " + P + "sel" : ""), row);
          e.type = "button"; e.dataset.tail = t.id; e.dataset.stub = t.id;
          mk("i", null, e);
          mk("em", null, e, mine.length > 1 ? String(t.i + 1) : "");
          e.setAttribute("aria-label", `${tname(t)}: ${t.to == null ? "loose" : "patched to " + toLabel(t.to)}${sel === t.id ? ", picked up" : ""}. Enter to pick up.`);
          e.setAttribute("aria-pressed", sel === t.id ? "true" : "false");
          if (dragTail === t.id) e.style.opacity = ".5";
        });
      });
      if (dom.count) dom.count.textContent = `BALLOONS: ${balloons.length}`;
      // the districts
      dom.panelsEl.textContent = "";
      dom.panels = {};
      const counts = countsOf(tails);
      const st = sel ? tailOf(sel) : null;
      const canPanel = !!st && (kindOf(st) === "air" || kindOf(st) === "hub");
      const cr = CROP[PG.n];
      PG.panels.forEach((p, idx) => {
        const el = mk("div", P + "panel" + (canPanel ? " " + P + "armed" : ""), dom.panelsEl);
        dom.panels[p] = el;
        const slots = mk("div", P + "slots", el);
        const here = tails.filter((t) => isPanel(t.to) && t.to === p && (kindOf(t) === "air" || kindOf(t) === "hub"));
        for (let j = 0; j < CAP; j++) {
          const t = here[j];
          const s = mk(t ? "button" : "span", P + "slot" + (t ? " " + P + "live" + (kindOf(t) === "hub" ? " " + P + "sb" : "") + (sel === t.id ? " " + P + "sel" : "") : ""), slots);
          s.dataset.slot = p + "." + j; s.dataset.p = p;
          const aid = t ? "switchboard-socket-live" : "switchboard-socket";
          if (has(aid)) { const im = mk("img", null, s); im.src = url(aid); im.alt = ""; im.draggable = false; } else mk("b", null, s);
          if (t) { s.type = "button"; s.dataset.tail = t.id; s.setAttribute("aria-label", `${tname(t)} in ${NAME[p]}. Enter to pick it up.`); s.setAttribute("aria-pressed", sel === t.id ? "true" : "false"); }
        }
        const body = mk("button", P + "pbody", el); body.type = "button"; body.dataset.drop = p;
        const x = cr.xs[idx];
        if (has(PG.art)) {
          body.style.backgroundImage = `url("${url(PG.art)}")`;
          body.style.backgroundSize = `${(1280 / cr.w) * 100}% ${(720 / CROP_H) * 100}%`;
          body.style.backgroundPosition = `${(x / (1280 - cr.w)) * 100}% ${(CROP_Y / (720 - CROP_H)) * 100}%`;
          body.style.setProperty("--ar", `${cr.w}/${CROP_H}`);
        } else { body.classList.add(P + "pf"); body.style.setProperty("--ar", `${cr.w}/${CROP_H}`); mk("div", P + "pn", body, NAME[p]); }
        mk("span", P + "pc", body, String(counts[p]));
        const hubHere = here.filter((t) => kindOf(t) === "hub").length;
        if (hubHere) mk("span", P + "pk", body, "HUB");
        body.setAttribute("aria-label", `${NAME[p]}, ${counts[p]} ${counts[p] === 1 ? "tail" : "tails"}${hubHere ? ", the HUB reaches it" : ""}${canPanel ? `. Patch the picked-up tail here (key ${idx + 1})` : ""}`);
        if (canPanel) on(body, "click", () => tryMove(sel, p));
        else { body.tabIndex = -1; }
      });
      // notes and actions
      const h = hubInfo();
      const names = h.set.map((p) => NAME[p].replace("THE ", "")).join(", ");
      dom.hubNote.textContent = `${h.placed} of ${h.total} placed${h.set.length ? `, reaches ${h.set.length}` : ""}`;
      dom.hubNote.title = names ? `Reaches ${names}` : "";
      if (dom.assistNote) {
        const f = assistFeed(tails);
        if (f === "@hub") { dom.assistNote.textContent = "on the HUB's line: pressure reaches them first"; dom.assistNote.style.color = RED; }
        else { dom.assistNote.textContent = `its own line, through ${balOf(f.slice(1)).label}`; dom.assistNote.style.color = INK; }
      }
      dom.acts.textContent = "";
      if (sel) {
        const t = tailOf(sel);
        const bt = mk("button", null, dom.acts, "Pull it off"); bt.type = "button"; bt.disabled = kindOf(t) === "assist" || t.to == null;
        bt.setAttribute("aria-label", `Pull ${tname(t)} off and leave it loose`); on(bt, "click", () => tryMove(sel, null));
        const c = mk("button", null, dom.acts, "Put it down"); c.type = "button"; on(c, "click", () => { sel = null; render(); say("Put down."); });
      }
      dom.ok.classList.toggle(P + "off", !canConfirm());
      dom.ok.setAttribute("aria-disabled", canConfirm() ? "false" : "true");
      // the lock note
      if (dom.lockNote && dom.lockNote.firstChild && !lockRead) dom.lockNote.textContent = "";
      requestAnimationFrame(() => { if (!dead) drawCords(); });
    }

    function showLockNote(auto) {
      dom.lockNote.textContent = "";
      const n = mk("div", P + "lnote", dom.lockNote);
      n.setAttribute("role", "note");
      if (has("switchboard-lock-note")) { n.style.backgroundImage = `url("${url("switchboard-lock-note")}")`; n.setAttribute("aria-label", "THE PLINTH BREATHES ONLY WHAT THE TOWERS EXHALE."); }
      else { n.classList.add(P + "nf"); n.textContent = "THE PLINTH BREATHES ONLY WHAT THE TOWERS EXHALE."; }
      lockRead = true;
      on(n, "click", () => { dom.lockNote.textContent = ""; lockRead = false; });
      if (!auto) say(PG.n === 1
        ? "The State's interlock. While it holds, THE PLINTH breathes only what THE TOWERS exhale: it cuts the plinth's only tail whenever the towers drop below two. Patch it back onto itself to bypass it."
        : "The State's interlocks. While they hold, THE PLINTH breathes only what THE TOWERS exhale: they cut the plinth's only tail whenever the towers drop below two. Patch LOCK A and LOCK B to each other to bypass them.");
    }

    // cords: an SVG layer under the balloons and over the panels' backdrop
    function drawCords() {
      if (dead || !dom.svg || !dom.board) return;
      const svg = dom.svg; svg.textContent = "";
      const br = dom.board.getBoundingClientRect();
      const rel = (r, fx, fy) => ({ x: r.left - br.left + r.width * fx, y: r.top - br.top + r.height * fy });
      svg.setAttribute("viewBox", `0 0 ${br.width} ${br.height}`);
      const jackH = 34, jackW = 17;
      const jack = (x, y, rot, col) => {
        if (has("switchboard-jack")) { const g = svgn("g", { transform: `translate(${x} ${y}) rotate(${rot})` }, svg); svgn("image", { href: url("switchboard-jack"), x: -jackW / 2, y: -jackH, width: jackW, height: jackH }, g); }
        else { const g = svgn("g", { transform: `translate(${x} ${y}) rotate(${rot})` }, svg); svgn("rect", { x: -5, y: -jackH, width: 10, height: jackH - 6, rx: 2, fill: col }, g); svgn("rect", { x: -2, y: -8, width: 4, height: 8, fill: col }, g); }
      };
      const stubs = {};
      dom.rows.querySelectorAll("[data-stub]").forEach((e) => { stubs[e.dataset.stub] = e; });
      const slotsOf = {};
      PG.panels.forEach((p) => { slotsOf[p] = [...dom.panelsEl.querySelectorAll(`[data-p="${p}"]`)]; });
      const used = {};
      tails.forEach((t) => {
        if (drag && drag.moved && drag.id === t.id) return;
        const stub = stubs[t.id]; if (!stub) return;
        const k = kindOf(t);
        const col = k === "lock" ? RED : k === "assist" ? BLUE2 : INK, w = k === "hub" ? 4 : 3;
        const a = rel(stub.getBoundingClientRect(), 0.5, 0.35);
        let b, d, rot = 0;
        if (t.to == null) { b = { x: a.x + (k === "hub" ? 0 : 0), y: a.y + 30 }; d = `M${a.x},${a.y} C${a.x},${a.y + 14} ${b.x + 6},${b.y - 12} ${b.x},${b.y}`; rot = 0; }
        else if (isPanel(t.to)) {
          const arr = slotsOf[t.to]; const j = (used[t.to] = (used[t.to] || 0)); used[t.to]++;
          const slot = arr[j] || arr[0]; if (!slot) return;
          b = rel(slot.getBoundingClientRect(), 0.5, 0.5);
          const dy = Math.max(30, Math.abs(b.y - a.y) * 0.45);
          d = `M${a.x},${a.y} C${a.x},${a.y + dy} ${b.x},${b.y - dy} ${b.x},${b.y}`;
        } else {
          const tb = dom.rows.querySelector(`[data-drop="${t.to}"]`); if (!tb) return;
          const r = tb.getBoundingClientRect();
          if (t.to === "@" + t.b) { b = rel(r, 1, 0.5); d = `M${a.x},${a.y} C${a.x + 40},${a.y + 22} ${b.x + 44},${b.y + 26} ${b.x},${b.y}`; rot = -90; }
          else { b = rel(r, 0.5, 1.0); const hx = Math.abs(b.x - a.x); d = `M${a.x},${a.y} C${a.x},${a.y + 26} ${b.x},${b.y + 30 + (hx > 1 ? 0 : 0)} ${b.x},${b.y}`; }
        }
        const path = svgn("path", { d, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" }, svg);
        if (k === "assist") path.setAttribute("stroke-dasharray", "7 4");
        jack(b.x, b.y + (t.to == null ? 6 : 8), rot, col);
      });
      if (drag && drag.moved) {
        const stub = stubs[drag.id];
        if (stub) {
          const a = rel(stub.getBoundingClientRect(), 0.5, 0.35);
          const bx = drag.px - br.left, by = drag.py - br.top;
          dom.ghost = svgn("path", { d: `M${a.x},${a.y} C${a.x},${a.y + 40} ${bx},${by - 40} ${bx},${by}`, fill: "none", stroke: RED, "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "2 5" }, svg);
          jack(bx, by + 6, 0, RED);
        }
      }
    }

    // ---- pointer: drag a tail, or tap to pick it up -----------------------------------------------------
    on(page, "pointerdown", (e) => {
      if (mode !== "play") return;
      const el = e.target.closest ? e.target.closest("[data-tail]") : null;
      if (!el || e.button > 0) return;
      drag = { id: el.dataset.tail, x0: e.clientX, y0: e.clientY, moved: false, px: e.clientX, py: e.clientY, el };
      try { el.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    });
    on(page, "pointermove", (e) => {
      if (!drag) return;
      drag.px = e.clientX; drag.py = e.clientY;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 9) { drag.moved = true; sel = drag.id; markDrop(); }
      if (drag.moved) { drawCords(); markDrop(e.clientX, e.clientY); e.preventDefault(); }
    });
    function markDrop(x, y) {
      dom.panelsEl.querySelectorAll(`.${P}armed`).forEach((n) => n.classList.remove(P + "armed"));
      if (x == null) return;
      const t = tailOf(drag.id); if (!t) return;
      const k = kindOf(t);
      if (k === "air" || k === "hub") { const p = panelAt(x, y); if (p && dom.panels[p]) dom.panels[p].classList.add(P + "armed"); }
    }
    function panelAt(x, y) {
      for (const p of PG.panels) { const r = dom.panels[p].getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top - 6 && y <= r.bottom) return p; }
      return null;
    }
    function balloonAt(x, y) {
      const els = dom.rows.querySelectorAll("[data-drop]");
      for (const e of els) { const r = e.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return e.dataset.drop; }
      return null;
    }
    const endDrag = (e, cancel) => {
      if (!drag) return;
      const d = drag; drag = null;
      try { d.el.releasePointerCapture(e.pointerId); } catch { /* released */ }
      if (cancel) { sel = null; render(); return; }
      if (!d.moved) { pick(d.id); return; }
      const t = tailOf(d.id); const k = kindOf(t);
      let dest = null, hit = false;
      if (k === "air" || k === "hub") { const p = panelAt(e.clientX, e.clientY); if (p) { dest = p; hit = true; } }
      else { const b = balloonAt(e.clientX, e.clientY); if (b) { dest = b; hit = true; } }
      if (!hit) dest = k === "assist" ? t.to : null;       // dropped on nothing: loose (ASSIST keeps its line)
      if (!hit && k === "assist") { sel = null; render(); say("ASSIST stays on its line: the page will not cut the patients' air."); return; }
      tryMove(d.id, dest);
    };
    on(page, "pointerup", (e) => endDrag(e, false));
    on(page, "pointercancel", (e) => endDrag(e, true));

    function pick(id) {
      if (mode !== "play") return;
      if (sel === id) { sel = null; render(); say("Put down."); return; }
      sel = id; render();
      const t = tailOf(id), k = kindOf(t);
      if (k === "assist") say("ASSIST picked up. Tap the HUB or an AIR balloon to choose the line it breathes through. A clean line is an AIR balloon that still reaches THE SUITES.");
      else if (k === "lock") say(`${balOf(t.b).label} picked up. ${PG.n === 1 ? "Tap the red balloon to patch it back onto itself." : "Tap the other red balloon to patch the two together."}`);
      else say(`${tname(t)} picked up${t.to ? " from " + NAME[t.to] : ""}. Tap a district to patch it${t.to ? ", or pull it off" : ""}.`);
      const f = dom.rows.querySelector(`[data-tail="${id}"]`) || dom.panelsEl.querySelector(`[data-tail="${id}"]`); if (f) f.focus({ preventScroll: true });
    }
    on(page, "click", (e) => {
      if (mode !== "play") return;
      const el = e.target.closest ? e.target.closest("[data-tail]") : null;
      if (el && e.detail === 0) pick(el.dataset.tail);           // keyboard activation (a pointer already picked in pointerup)
    });
    on(page, "keydown", (e) => {
      if (mode !== "play" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (k === "Escape") { if (sel) { sel = null; render(); say("Put down."); e.preventDefault(); } }
      else if (sel && /^[1-9]$/.test(k)) { const p = PG.panels[Number(k) - 1]; const t = tailOf(sel); if (p && (kindOf(t) === "air" || kindOf(t) === "hub")) { tryMove(sel, p); e.preventDefault(); } }
      else if (sel && (k === "u" || k === "U" || k === "Backspace")) { tryMove(sel, null); e.preventDefault(); }
      else if (k === "Enter" && e.target && e.target.dataset && e.target.dataset.tail && e.target.tagName !== "BUTTON") { pick(e.target.dataset.tail); e.preventDefault(); }
    });
    let rzT = null;
    const onResize = () => { if (mode === "play" && dom.rows) { clearTimeout(rzT); rzT = setTimeout(render, 60); } };
    window.addEventListener("resize", onResize); offs.push(() => { window.removeEventListener("resize", onResize); clearTimeout(rzT); });

    // ---- hint: the interlock balloon pulses after forty quiet seconds ---------------------------------------
    const hintTimer = setInterval(() => {
      if (dead || mode !== "play") return;
      if (!hintOn && !bypassed(tails) && performance.now() - lastCommit > IDLE_HINT) { hintOn = true; render(); }
    }, 2000);
    offs.push(() => clearInterval(hintTimer));

    // ---- flow ----------------------------------------------------------------------------------------
    function beginPage(i, only) {
      solo = only; mode = "play";
      setupPage(i); buildStage(); render();
      let lead = `Page ${PG.n}. ${PG.place}, ${PG.year}. `;
      if (PG.n === 1) lead += "Four districts, three tails on the HUB. Patch each HUB tail to a district.";
      else {
        lead += "Five districts, five tails on the HUB, and ASSIST on the HUB's line.";
        const lp = !!sget("switchboard.plinth", false);
        if (!only && lp) lead += " You have seen how the plinth is wired.";
        else if (!only && results.length) lead += " The plinth is still downstream of the towers.";
      }
      say(lead);
      later(() => { if (!dead) { const f = dom.rows.querySelector("[data-tail]"); if (f) f.focus({ preventScroll: true }); } }, 40);
    }

    function confirmPage() {
      if (mode !== "play") return;
      if (!canConfirm()) { const h = hubInfo(); say(`${h.total - h.placed} of the HUB's ${h.total} tails ${h.total - h.placed === 1 ? "is" : "are"} loose. Patch each to a district before the page can print.`, true); return; }
      const h = hubInfo();
      const r = { n: PG.n, reach: h.set.length, plinth: h.set.includes("plinth"), clean: PG.n === 2 ? assistClean(tails) : null, set: h.set.slice(), moves, refusals, bypass: bypassed(tails) };
      sset("switchboard.reach", r.reach); sset("switchboard.plinth", r.plinth);
      if (PG.n === 2) sset("switchboard.suite_isolated", !!r.clean);
      results.push(r);
      try { const best = store.get("best", null); if (best == null || r.reach > best) store.set("best", r.reach); } catch { /* storage off */ }
      mode = "printed";
      if (PG.n === 1 && !solo) { pagePop(r); return; }
      finish();
    }

    const reachLine = (r) => `The HUB reaches ${r.reach} of ${PG.panels.length} districts${r.set.length ? ": " + r.set.map((p) => NAME[p]).join(", ") : ""}.`;
    function pagePop(r) {
      const box = mk("div", P + "pop", page);
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Page one is printed");
      mk("div", P + "kick", card, `${PG.year}. ${PG.place}.`);
      mk("h2", null, card, "Page one: printed");
      mk("p", null, card, reachLine(r));
      mk("p", null, card, r.plinth
        ? "The plinth's shanties are on the HUB's line: they will breathe what the towers breathe."
        : "THE PLINTH is left on the one tail the towers give it. It breathes only what the towers exhale.");
      mk("p", null, card, "The core is the next page: five districts, both interlocks, and the suite's patients.");
      const go = mk("button", P + "go", card, "Next page: the core"); go.type = "button";
      on(go, "click", () => { box.remove(); beginPage(1, false); });
      later(() => { if (!dead) go.focus({ preventScroll: true }); }, 30);
    }

    function finish() {
      const r = results[results.length - 1];
      const plinth = r.plinth, clean = r.n === 2 ? r.clean : true;
      const win = plinth && clean;
      mode = "over";
      let text = r.n === 2 ? "The core is lettered. " : "The maintenance page is lettered. ";
      text += reachLine(r) + " ";
      text += plinth ? "THE PLINTH takes a second tail: the shanties breathe what the towers breathe. " : "THE PLINTH was left on the one tail the towers give it. ";
      if (r.n === 2) text += r.clean ? "The suite's patients are on their own clean line, and no one's air was cut on the page. " : "ASSIST was left on the HUB's line: the overload's pressure reaches the suite's patients first. ";
      text += win ? "Every district breathes. He is the last hand on the page, and the page is printed." : "Every district breathes, but the page is not the one that could have been printed.";
      api.end({ outcome: win ? "win" : "done", text });
    }

    function intro() {
      mode = "intro";
      const box = mk("div", P + "intro", page); dom.intro = box;
      const card = mk("div", P + "card", box);
      card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Switchboard: how to play");
      mk("div", P + "kick", card, "1D · Chapters 7 and 10 · Letterer's balloon page");
      mk("h2", null, card, "Switchboard");
      const q = mk("blockquote", null, card, "flooding the city's life support");
      mk("cite", null, q, "Bible, Part VI, Dr. Tox, Story: The Finale");
      mk("p", null, card, "A comic page at the lettering stage. The districts are the panels along the bottom; the city's air handlers are the balloons above, each with a tail run as a patch cord. Where each tail points is who breathes what. He is the last hand on the page.");
      const g = mk("p", null, card); mk("b", null, g, "Goal "); g.append("Patch every tail of the HUB, the balloon the last dose will ride, to a district, then confirm the page. Where you send them is yours to choose.");
      const ul = mk("ul", null, card);
      for (const [a, b] of [
        ["Patch", "Drag a tail (the dot under a balloon, or a plug in a district) to a district. Or tap the tail, then the district. Keys: Enter picks up, 1 to 5 patches, U pulls off, Esc puts down."],
        ["Pull off", "Drag a tail off the districts to set it loose. Every district must keep one live tail: pulling its last greys it and the cord springs back. No one's air is cut on this page."],
        ["Red balloon", "The State's interlock. While it holds, THE PLINTH takes only one tail, and THE TOWERS may not drop below two. Tap it to read it, and bypass it."],
        ["Sockets", `A district has ${CAP} sockets.`],
      ]) { const li = mk("li", null, ul); mk("b", null, li, a); mk("span", null, li, b); }
      mk("p", null, card, "Two pages: the maintenance level, then the core, where ASSIST (the patients on assisted breathing) starts on the HUB's line. There is no failing. The page says what was printed.");
      const bt = mk("div", P + "btns", card);
      const go = mk("button", P + "go", bt, "Start: the maintenance level"); go.type = "button";
      const two = mk("button", null, bt, "Start at the core"); two.type = "button";
      on(go, "click", () => { box.remove(); beginPage(0, false); });
      on(two, "click", () => { box.remove(); beginPage(1, true); });
      later(() => { if (!dead) go.focus({ preventScroll: true }); }, 30);
    }

    page.__switchboard = { get mode() { return mode; }, get tails() { return tails; }, get PG() { return PG; }, tryMove, pick, confirmPage };
    intro();

    return {
      unmount() {
        dead = true;
        timers.forEach(clearTimeout); timers.clear();
        offs.forEach((f) => f()); offs.length = 0;
        root.innerHTML = "";
      },
    };
  },
};

// The Lord of the Sea: The Charter (1D, engrossed deed with wax seal).
// `g-charter-tidewater` from DESIGN.md section 11: the Tidewater harbour book, three pages, nine
// clauses, one decoy. Find: follow the references (a red thread joins them in the index) and pin
// the clause every other obligation routes through; three ink, a wrong pin costs one, at none the
// clerk takes the paper back. Break: the dues ran "for forty years from the lighting of the quay
// lamp", and the lamp's date is on page I: point at it, or try a thing from the evidence drawer.
// Decide: Strike, Rewrite (her trust is 52 here, so she can) or Leave.
// Every clause below is written for the game (DESIGN.md section 21: the harbour book is added).

const INK = "#2a2118", RED = "#8C2B2B", PAPER = "#F4F1E8", VELLUM = "#efe3c4", WOOD = "#6B4A2B", BLUE = "#1F2E4A", GREEN = "#2F6B5E", GOLD = "#E7A93B";
const TRUST = 52;

const CLAUSES = [
  { n: 1, page: 0, text: `Whereas the Great British Tea Company did light the quay lamp of Tidewater upon <span data-pt="lamp">the first day of March, in the year seventeen hundred and three</span>, the harbour from that day is the Company's to keep, as hereinafter set out.` },
  { n: 2, page: 0, text: `The ferry of Tidewater shall cross the harbour once in every <span data-pt="six">six minutes</span>, its pilot licensed by the Company, subject to the dues of <a data-ref="5">clause 5</a>.` },
  { n: 3, page: 0, text: `Every vessel moored within the harbour shall pay the mooring penny at the Company's office, as set out in <a data-ref="8">the Schedule (clause 8)</a> and levied under <a data-ref="5">clause 5</a>.` },
  { n: 4, page: 1, decoy: true, text: `Any master refusing what is owed shall FORFEIT HIS VESSEL to the Company, without appeal or remedy, notwithstanding anything in <a data-ref="7">clause 7</a>.` },
  { n: 5, page: 1, bind: true, text: `All vessels, and all souls that sail from Tidewater, are bound to the Company by the harbour dues, which shall run <span data-pt="forty">for forty years from the lighting of the quay lamp</span> (<a data-ref="1">clause 1</a>).` },
  { n: 6, page: 1, text: `Fish landed at the Company's steps shall be weighed on the Company's scales, the weighing fee to be taken with the dues of <a data-ref="5">clause 5</a>.` },
  { n: 7, page: 2, text: `The Company shall keep the quay lamp burning, and the harbour lit, for so long as the dues of <a data-ref="5">clause 5</a> are paid.` },
  { n: 8, page: 2, text: `Schedule. The mooring penny: <span data-pt="penny">one penny the day</span> for a skiff, fourpence for a lighter, a shilling for a ship of burden; all levied as dues under <a data-ref="5">clause 5</a>.` },
  { n: 9, page: 2, slip: true, text: `Copied fair and entered <span data-pt="today">this ninth day of June, 1745</span>, by order of the Comptroller. <a data-ref="4">Clause 4</a> to be read with <a data-ref="2">clause 2</a>.` },
];
const PAGES = ["I", "II", "III"];
const SUMMARY = [
  "p. I: when the lamp was lit, the ferry, the mooring penny. All of it 'subject to' something on p. II.",
  "p. II: a loud threat, the dues themselves, the fish scales. Read what the threat actually rests on.",
  "p. III: the lamp, the price list, and a clerk's note with today's date.",
];
const EVIDENCE = [
  { id: "token", name: "Wenna's ferry token", note: "Proves she crosses every six minutes. The book says as much." },
  { id: "song", name: "A song sheet, Gullwife crew", note: "Lovely. It breaks nothing written here." },
  { id: "deed", name: "The deed of sale, p. 4", note: "'All waters adjoining' binds the halls, not this harbour." },
  { id: "dues", name: "A mooring-penny receipt", note: "Paid, and dated this week. It shows the dues still taken, not that they are owed." },
];

export default {
  mount(root, api) {
    const P = "lord-of-the-sea-charter-";
    const S = { page: 0, ink: 3, phase: "find", pinned: null, wrongPins: new Set(), threads: [], held: null, read: false, pencil: "", flash: null };
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };

    root.innerHTML = `
    <style>
      .${P}w { position:absolute; inset:0; overflow:auto; color:${INK}; font-family:'IM Fell English',Georgia,serif;
        background: repeating-linear-gradient(92deg, rgba(0,0,0,.08) 0 2px, transparent 2px 19px), repeating-linear-gradient(88deg, rgba(255,255,255,.04) 0 1px, transparent 1px 7px), ${WOOD}; }
      .${P}desk { display:grid; grid-template-columns: 90px minmax(0,1fr) 210px; gap:16px; padding:16px clamp(10px,2.5vw,28px) 24px; max-width:1180px; margin:0 auto; align-items:start; }
      .${P}index { background:rgba(244,241,232,.9); border:1px solid ${INK}; padding:8px 6px; position:sticky; top:8px; }
      .${P}index h3, .${P}drawer h3 { font-family:'IM Fell English SC',Georgia,serif; font-weight:400; letter-spacing:.14em; font-size:12px; margin:0 0 6px; text-align:center; }
      .${P}index svg { display:block; width:100%; height:auto; }
      .${P}index text { font-family:'IM Fell English',Georgia,serif; cursor:pointer; }
      .${P}paper { position:relative; background: radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM} 70%, #e2d2ac); border:1px solid #b9a578; box-shadow: 0 10px 26px rgba(0,0,0,.45), inset 0 0 40px rgba(120,90,40,.25); padding: 22px clamp(16px,4vw,48px) 30px; min-height:520px; }
      .${P}tabs { display:flex; gap:6px; margin:0 0 -1px 18px; }
      .${P}tabs button { font:inherit; font-size:16px; padding:5px 16px 4px; background:#e2d2ac; color:${INK}; border:1px solid #b9a578; border-bottom:0; cursor:pointer; border-radius:6px 6px 0 0; }
      .${P}tabs button.on { background:#faf3e2; font-weight:600; }
      .${P}title { font-family:'Pinyon Script',cursive; font-size:clamp(30px,4.5vw,46px); line-height:1.1; margin:4px 0 2px; text-align:center; }
      .${P}flour { text-align:center; color:${INK}; opacity:.7; margin-bottom:12px; }
      .${P}cl { position:relative; display:grid; grid-template-columns: 2.4em minmax(0,1fr); gap:6px; padding:9px 8px; margin:2px -8px; font-size:clamp(16px,1.6vw,19px); line-height:1.5; border-radius:3px; cursor:pointer; }
      .${P}cl:hover { background:rgba(140,43,43,.06); }
      .${P}cl .no { font-family:'Pinyon Script',cursive; font-size:1.5em; line-height:1; color:${RED}; }
      .${P}cl.decoy .tx { letter-spacing:.01em; }
      .${P}cl.flash { animation:${P}fl 1.2s; }
      @keyframes ${P}fl { 0%,40% { background:rgba(231,169,59,.45); } 100% { background:transparent; } }
      .${P}cl.pinned .tx { text-decoration: underline ${RED} 2px; text-underline-offset:4px; }
      .${P}cl.pinned::after { content:""; position:absolute; right:-14px; top:6px; width:16px; height:16px; border-radius:50%; background:${RED}; box-shadow: inset -3px -3px 0 rgba(0,0,0,.25); }
      .${P}cl.wrong .tx { text-decoration: line-through rgba(42,33,24,.4); }
      .${P}cl.lit { background:rgba(231,169,59,.28); }
      .${P}cl.slip { background:#fffaf0; border:1px solid #c9b88e; transform:rotate(-1deg); margin:14px 0 4px; box-shadow:2px 3px 6px rgba(0,0,0,.2); font-size:15px; }
      .${P}cl a { color:${RED}; text-decoration:underline dotted; cursor:pointer; }
      .${P}cl span[data-pt] { border-bottom:1px dashed transparent; }
      .${P}w.breaking .${P}cl span[data-pt] { border-bottom-color:${RED}; cursor:crosshair; background:rgba(140,43,43,.06); }
      .${P}pinbtn { font:inherit; font-size:13px; margin-left:8px; padding:1px 8px; background:transparent; border:1px solid ${RED}; color:${RED}; cursor:pointer; vertical-align:middle; }
      .${P}seal { position:absolute; right:clamp(10px,4vw,40px); bottom:16px; width:86px; }
      .${P}pencil { font-family:'IM Fell English',Georgia,serif; font-style:italic; color:#5d5a54; font-size:16px; min-height:1.4em; margin:12px 0 0; border-top:1px solid rgba(42,33,24,.2); padding-top:8px; padding-right:90px; }
      .${P}drawer { background:#3d2a18; color:${PAPER}; border:1px solid #20150b; padding:10px; position:sticky; top:8px; display:grid; gap:8px; }
      .${P}ink { display:flex; gap:6px; justify-content:center; align-items:center; }
      .${P}item { font:inherit; font-size:15px; text-align:left; background:${PAPER}; color:${INK}; border:1px solid #b9a578; padding:7px 9px; cursor:pointer; transform:rotate(-.6deg); box-shadow:1px 2px 4px rgba(0,0,0,.35); }
      .${P}item:nth-child(odd) { transform:rotate(.8deg); }
      .${P}item.held { outline:3px solid ${GOLD}; }
      .${P}acts { display:grid; gap:6px; }
      .${P}acts button, .${P}how button { font:inherit; font-size:17px; padding:7px 12px; cursor:pointer; border:1px solid ${INK}; background:${PAPER}; color:${INK}; }
      .${P}acts button.strike { background:${RED}; color:${PAPER}; }
      .${P}acts button:disabled { opacity:.45; cursor:default; }
      .${P}phase { font-size:15px; line-height:1.35; }
      .${P}how { position:absolute; inset:0; display:grid; place-items:center; background:rgba(40,28,16,.72); z-index:3; padding:16px; }
      .${P}how div { max-width:520px; background:radial-gradient(ellipse at 30% 20%, #faf3e2, ${VELLUM}); border:1px solid #b9a578; padding:22px 24px; box-shadow:0 10px 30px rgba(0,0,0,.5); }
      .${P}how h2 { font-family:'Pinyon Script',cursive; font-weight:400; font-size:42px; margin:0 0 6px; }
      .${P}how p { margin:0 0 10px; font-size:17px; line-height:1.4; }
      @media (max-width:820px) { .${P}desk { grid-template-columns:minmax(0,1fr); } .${P}index, .${P}drawer { position:static; } .${P}index svg { max-height:90px; } }
    </style>
    <div class="${P}w"><div class="${P}desk"></div>
      <div class="${P}how" role="dialog" aria-label="How to play"><div>
        <h2>The Charter</h2>
        <p>The Company holds Tidewater by one clause of its harbour book. Follow the red references from clause to clause, and <b>pin</b> the one every other obligation routes through. You have three ink; a wrong pin costs one.</p>
        <p>Then <b>break</b> it: point at a fact in the book that undoes it, or lay something from your drawer on it. Then strike it, have her rewrite it, or leave it bound.</p>
        <button type="button">Open the book</button>
      </div></div>
    </div>`;
    const w = root.querySelector("." + P + "w");
    const desk = w.querySelector("." + P + "desk");
    const how = w.querySelector("." + P + "how");

    function seal() {
      return `<svg class="${P}seal" viewBox="0 0 100 120" aria-hidden="true">
        <path d="M38 60 L22 116 L36 106 L44 118 L50 64Z M62 60 L78 116 L64 106 L56 118 L50 64Z" fill="${BLUE}" stroke="#14203a"/>
        <path d="M50 8 C68 6 82 18 86 34 C92 52 80 70 62 74 C44 80 20 72 14 52 C8 32 28 10 50 8Z" fill="${RED}" stroke="#5e1b1b" stroke-width="2"/>
        <circle cx="50" cy="41" r="21" fill="none" stroke="#5e1b1b" stroke-width="2"/>
        <path d="M38 48 Q50 24 62 48 Z M50 30 L50 52" fill="none" stroke="#5e1b1b" stroke-width="2.4"/>
        <ellipse cx="40" cy="28" rx="7" ry="3" fill="#fff" opacity=".25" transform="rotate(-30 40 28)"/></svg>`;
    }
    function indexSvg() {
      const hz = w.clientWidth < 820;
      const into = (n) => S.threads.filter(([, b]) => b === n).length;
      if (hz) { // a row under narrow screens: threads arc above the numbers
        const x = (n) => 18 + (n - 1) * 38;
        let arcs = "";
        for (const [a, b] of S.threads) { const xa = x(a), xb = x(b), r = Math.abs(xb - xa) / 2; arcs += `<path d="M${xa} 40 C ${xa} ${40 - Math.min(34, 8 + r * 0.5)}, ${xb} ${40 - Math.min(34, 8 + r * 0.5)}, ${xb} 40" fill="none" stroke="${RED}" stroke-width="1.4"/>`; }
        const nums = CLAUSES.map((c) => `<g data-goto="${c.n}"><circle cx="${x(c.n)}" cy="40" r="2" fill="${INK}"/><text x="${x(c.n) - 6}" y="62" font-size="19" fill="${S.pinned === c.n ? RED : INK}" ${S.wrongPins.has(c.n) ? 'text-decoration="line-through"' : ""}>${c.n}.</text>
          ${Array.from({ length: into(c.n) }, (_, i) => `<circle cx="${x(c.n) - 6 + i * 6}" cy="72" r="2.4" fill="${RED}"/>`).join("")}</g>`).join("");
        return `<svg viewBox="0 0 ${36 + 8 * 38} 80" aria-label="Clause index; red threads show the references you have followed">${arcs}${nums}</svg>`;
      }
      const h = 9 * 34 + 10;
      const y = (n) => 20 + (n - 1) * 34;
      let arcs = "";
      for (const [a, b] of S.threads) {
        const ya = y(a), yb = y(b), r = Math.abs(yb - ya) / 2;
        arcs += `<path d="M30 ${ya} C ${30 - Math.min(26, 8 + r * 0.4)} ${ya}, ${30 - Math.min(26, 8 + r * 0.4)} ${yb}, 30 ${yb}" fill="none" stroke="${RED}" stroke-width="1.4"/>`;
      }
      const nums = CLAUSES.map((c) => `<g data-goto="${c.n}"><text x="${40}" y="${y(c.n) + 6}" font-size="19" fill="${S.pinned === c.n ? RED : INK}" ${S.wrongPins.has(c.n) ? 'text-decoration="line-through"' : ""}>${c.n}.</text>
        ${Array.from({ length: into(c.n) }, (_, i) => `<circle cx="${68 + i * 6}" cy="${y(c.n)}" r="2.4" fill="${RED}"/>`).join("")}<circle cx="30" cy="${y(c.n)}" r="2" fill="${INK}"/></g>`).join("");
      return `<svg viewBox="0 0 110 ${h}" aria-label="Clause index; red threads show the references you have followed">${arcs}${nums}</svg>`;
    }
    function render() {
      const cls = CLAUSES.filter((c) => c.page === S.page);
      const breaking = S.phase === "break";
      w.classList.toggle("breaking", breaking);
      const phaseText = {
        find: `<b>Find.</b> Click a red reference to follow it. Pin the clause that binds.`,
        break: `<b>Break.</b> Clause ${S.pinned} is pinned. Point at the fact in the book that undoes it, or lay a thing from the drawer on it.`,
        decide: `<b>Decide.</b> The clause is lit. What will you do with it?`,
        done: "",
      }[S.phase];
      const drops = Array.from({ length: 3 }, (_, i) => `<svg viewBox="0 0 20 26" width="18" height="24" aria-hidden="true"><path d="M10 2 C14 10 18 14 18 18 A8 8 0 0 1 2 18 C2 14 6 10 10 2Z" fill="${i < S.ink ? BLUE : "none"}" stroke="${PAPER}" stroke-width="1.4"/></svg>`).join("");
      desk.innerHTML = `
        <nav class="${P}index"><h3>INDEX</h3>${indexSvg()}</nav>
        <section>
          <div class="${P}tabs" role="tablist">${PAGES.map((p, i) => `<button type="button" role="tab" aria-selected="${i === S.page}" class="${i === S.page ? "on" : ""}" data-page="${i}">${p}</button>`).join("")}</div>
          <article class="${P}paper">
            ${S.page === 0 ? `<div class="${P}title">The Harbour Book of Tidewater</div><div class="${P}flour">~ ❦ ~</div>` : `<div class="${P}flour" style="margin-top:6px">${PAGES[S.page]}</div>`}
            ${cls.map((c) => `<div class="${P}cl${c.slip ? " slip" : ""}${c.decoy ? " decoy" : ""}${S.pinned === c.n ? " pinned" : ""}${S.wrongPins.has(c.n) ? " wrong" : ""}${S.phase === "decide" && S.pinned === c.n ? " lit" : ""}${S.flash === c.n ? " flash" : ""}" data-cl="${c.n}">
              <span class="no">${c.slip ? "†" : c.n}</span><span class="tx">${c.text}${S.phase === "find" && !S.wrongPins.has(c.n) ? `<button type="button" class="${P}pinbtn" data-pin="${c.n}" aria-label="Pin clause ${c.n}">pin</button>` : ""}</span></div>`).join("")}
            <p class="${P}pencil" aria-live="polite">${S.pencil}</p>
            ${S.page === 0 || S.page === 2 ? seal() : ""}
          </article>
        </section>
        <aside class="${P}drawer">
          <h3>INK</h3><div class="${P}ink" aria-label="${S.ink} ink left">${drops}</div>
          <div class="${P}phase">${phaseText}</div>
          ${S.phase === "find" && !S.read ? `<div class="${P}acts"><button type="button" data-a="read" title="Trust 40+: she reads one page aloud">Ask her to read this page</button></div>` : ""}
          ${S.phase === "decide" ? `<div class="${P}acts">
              <button type="button" class="strike" data-a="strike">Strike</button>
              <button type="button" data-a="rewrite" ${TRUST >= 50 ? "" : "disabled"} title="She redrafts it (trust ${TRUST}, needs 50)">Rewrite</button>
              <button type="button" data-a="leave">Leave</button></div>` : ""}
          <h3 style="margin-top:6px">EVIDENCE</h3>
          ${EVIDENCE.map((e) => `<button type="button" class="${P}item${S.held === e.id ? " held" : ""}" data-ev="${e.id}">${e.name}</button>`).join("")}
        </aside>`;
      wire();
    }
    function setPencil(t) { S.pencil = t; }
    function follow(from, to) {
      if (!S.threads.some(([a, b]) => a === from && b === to)) S.threads.push([from, to]);
      const c = CLAUSES.find((x) => x.n === to);
      S.page = c.page; S.flash = to;
      render();
      later(() => { S.flash = null; }, 1200);
    }
    function pin(n) {
      if (S.phase !== "find") return;
      const c = CLAUSES.find((x) => x.n === n);
      if (c.bind) {
        S.pinned = n; S.phase = "break";
        setPencil("Yes. Everything else is 'subject to' that one. Now: what in this book says it no longer holds?");
      } else {
        S.ink--; S.wrongPins.add(n);
        setPencil(c.decoy ? "Loud, isn't it? But it only enforces something else. Follow what it rests on." : c.slip ? "A clerk's note. It binds nobody." : `Clause ${n} hangs on another clause. Follow its reference.`);
        if (S.ink <= 0) { S.phase = "done"; render(); later(() => api.end({ outcome: "lose", text: "The ink is gone. The clerk takes the harbour book back: notice +10, and Tidewater stays bound until it can be asked for again." }), 700); return; }
      }
      render();
    }
    function point(pt) {
      if (S.phase !== "break") return;
      if (pt === "lamp") {
        S.phase = "decide";
        setPencil("Lit in seventeen hundred and three; dues for forty years; and the clerk dates his copy 1745. The dues ran out two years ago. They have been taking a penny they are not owed.");
      } else if (pt === "today") setPencil("That is today's date. Forty years from when, though?");
      else if (pt === "forty") setPencil("Forty years, yes. From the lighting of the lamp. When was that?");
      else setPencil("That is true, and it breaks nothing.");
      render();
    }
    function useEvidence(id, n) {
      if (S.phase !== "break") return;
      const e = EVIDENCE.find((x) => x.id === id);
      setPencil(n === S.pinned ? e.note : "Lay it on the clause you pinned, if anywhere.");
      S.held = null; render();
    }
    function decide(a) {
      if (S.phase !== "decide") return;
      S.phase = "done"; render();
      const text = {
        strike: "Struck. The port of Tidewater goes broken, and the Company's order goes with it: Wild in the Lanes 10 → 25. One clause token for the Tea Board; her trust +5.",
        rewrite: "Rewritten in her hand: the dues end, the ferry and the lamp stay, and a safe lane is kept there for nothing. Wild unchanged. One clause token; her trust +5.",
        leave: "Left bound. The ferry keeps its six minutes and the penny keeps being taken. She watched you find it: trust −5.",
      }[a];
      api.end({ outcome: a === "leave" ? "done" : "win", text });
    }
    function wire() {
      desk.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => { S.page = +b.dataset.page; render(); }));
      desk.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => { const c = CLAUSES.find((x) => x.n === +b.dataset.goto); S.page = c.page; S.flash = c.n; render(); }));
      desk.querySelectorAll("a[data-ref]").forEach((a) => a.addEventListener("click", (e) => { e.stopPropagation(); follow(+a.closest("[data-cl]").dataset.cl, +a.dataset.ref); }));
      desk.querySelectorAll("[data-pin]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); pin(+b.dataset.pin); }));
      desk.querySelectorAll("span[data-pt]").forEach((sp) => sp.addEventListener("click", (e) => { if (S.phase !== "break") return; e.stopPropagation(); point(sp.dataset.pt); }));
      desk.querySelectorAll("[data-cl]").forEach((c) => c.addEventListener("click", () => { if (S.held) useEvidence(S.held, +c.dataset.cl); }));
      desk.querySelectorAll("[data-ev]").forEach((b) => b.addEventListener("click", () => {
        if (S.phase !== "break") { setPencil("Keep it in the drawer until a clause is pinned."); render(); return; }
        S.held = S.held === b.dataset.ev ? null : b.dataset.ev;
        setPencil(S.held ? "Now lay it on a clause." : ""); render();
      }));
      desk.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "read") { S.read = true; setPencil("She reads it out plainly — " + SUMMARY[S.page]); render(); }
        else decide(a);
      }));
    }
    const onKey = (e) => {
      if (how.isConnected) return;
      if (e.target.closest && e.target.closest("button,a")) return;
      if (e.key === "ArrowRight") { S.page = Math.min(2, S.page + 1); render(); }
      if (e.key === "ArrowLeft") { S.page = Math.max(0, S.page - 1); render(); }
    };
    addEventListener("keydown", onKey);
    // references are links without href: make them reachable by keyboard
    const obs = new MutationObserver(() => desk.querySelectorAll("a[data-ref], span[data-pt]").forEach((a) => {
      if (a.tagName === "A" || w.classList.contains("breaking")) { a.tabIndex = 0; a.setAttribute("role", "button"); }
      if (!a._k) { a._k = true; a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); a.click(); } }); }
    }));
    obs.observe(desk, { childList: true });
    render();
    const b = how.querySelector("button");
    b.addEventListener("click", () => { how.remove(); setPencil("The letters sit still at the chart table. Start where the obligations start."); render(); });
    b.focus();
    return {
      unmount() { timers.forEach(clearTimeout); timers.clear(); removeEventListener("keydown", onKey); obs.disconnect(); },
    };
  },
};

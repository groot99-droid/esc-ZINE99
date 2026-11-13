// Missing Campsites / The Ranger's Book (1D, ledger in graphite).
//
// DESIGN.md section 11, The Ranger's Book, at rangers_book_1: one day, three rows missing (sites 2,
// 5 and 9). Rows naming a lost site are gone and the lines close up; Marisol's totals do not name
// sites, so they stay. Tap a column to sum it in pencil beside her total. For each shortfall insert
// a ghost row at a seam and fill it: persons from the persons gap, fee at $18 a night, permit from
// the skipped sequence (permits went out in arrival order), site from where the permit falls. A
// ghost row that fits locks in pencil; one that breaks a total stays loose. Hold "Tilt to the torch"
// (or F) to see the grooves of the lost lines: tally strokes you can count, words you cannot read.
// Win: every total balances, every ghost locked. Lose: the booth closes at 18:00 (six minutes; this
// clock is the prototype's, DESIGN.md gives the page no timer).
// Hints by idle time: 60 s partial sums, 120 s the disagreeing total underlined, 180 s a ghost filled.

const P = "missing-campsites-rangers-book-";
const ROWS = [
  { site: 1, party: "Okafor", pers: 2, permit: 401 }, { site: 3, party: "Lund", pers: 4, permit: 403 },
  { site: 4, party: "Diaz", pers: 3, permit: 404 }, { site: 6, party: "Moss", pers: 2, permit: 406 },
  { site: 7, party: "Pryce", pers: 5, permit: 407 }, { site: 8, party: "Hale", pers: 1, permit: 408 },
  { site: 10, party: "Kerr", pers: 2, permit: 410 }, { site: 11, party: "Abe", pers: 4, permit: 411 },
  { site: 12, party: "Wren", pers: 3, permit: 412 },
];
const LOST = { 2: 3, 5: 4, 9: 2 };          // site -> persons, felt only as grooves
const TOTALS = { sites: 12, persons: 35, fees: 216, envelopes: 12 };
const FEE = 18, CLOSE_S = 360, GHOSTS = 3;

function tally(n) {
  let s = "";
  for (let k = 0; k < Math.min(n, 4); k++) s += `<line x1="${3 + k * 6}" y1="2" x2="${3 + k * 6}" y2="16"/>`;
  if (n >= 5) s += `<line x1="0" y1="14" x2="24" y2="4"/>`;
  for (let k = 5; k < n; k++) s += `<line x1="${30 + (k - 5) * 6}" y1="2" x2="${30 + (k - 5) * 6}" y2="16"/>`;
  return `<svg width="${n > 5 ? 52 : 28}" height="18" viewBox="0 0 ${n > 5 ? 52 : 28} 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-label="${n}">${s}</svg>`;
}

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:#2b2a27;padding:12px;box-sizing:border-box;font-family:Georgia,'Times New Roman',serif;color:#33302c}
.${P}book{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);background:#ece6d6;max-width:1180px;margin:0 auto;box-shadow:0 10px 30px #000;position:relative}
.${P}book::after{content:"";position:absolute;top:0;bottom:0;left:57.4%;width:18px;margin-left:-9px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.18),transparent);pointer-events:none}
.${P}page{padding:14px 16px 16px;min-width:0}
.${P}left{border-right:1px solid #c9bfa8;padding-left:30px;background-image:repeating-linear-gradient(180deg,transparent 0 33px,#9fb9c4 33px 34px);background-position:0 44px;background-repeat:repeat-y}
.${P}grid{display:grid;grid-template-columns:4.6em minmax(3em,1fr) 4.8em 4.4em 3.6em 6.6em 1.6em;align-items:center;column-gap:4px}
.${P}hd{font:600 11px 'IBM Plex Mono',monospace;letter-spacing:.12em;color:#5a6a70;height:30px;display:flex;align-items:center;border:0;background:none;padding:0;cursor:default;text-align:left}
button.${P}hd{cursor:pointer;text-decoration:underline dotted;color:#2b4a55}
button.${P}hd.done{text-decoration:none;color:#5a6a70}
.${P}cell{height:34px;display:flex;align-items:center;font-size:16px;white-space:nowrap;overflow:hidden}
.${P}cell.it{font-style:italic}
.${P}seam{grid-column:1/-1;height:0;position:relative}
.${P}seam button{position:absolute;left:-26px;top:-10px;width:20px;height:20px;border-radius:50%;border:1px dashed #6b6b6d;background:#ece6d6;color:#4a4a4c;font:12px 'IBM Plex Mono',monospace;line-height:1;cursor:pointer;padding:0;opacity:.55}
.${P}seam button:hover,.${P}seam button:focus-visible{opacity:1;background:#fff}
.${P}groove{position:absolute;left:60px;top:-12px;color:rgba(70,60,40,.0);transition:color .2s;pointer-events:none;font:13px 'IBM Plex Mono',monospace;letter-spacing:.3em;display:flex;gap:16px;align-items:center}
.${P}tilt .${P}groove{color:rgba(70,60,40,.55)}
.${P}tilt .${P}book{background-color:#d9cfb6}
.${P}ghost{overflow:visible;color:#59595b;font-family:'IBM Plex Mono',monospace;font-size:14px;outline:1.5px dashed #8a8a8c;outline-offset:-2px;background:rgba(255,255,255,.25)}
.${P}ghost.lock{outline-style:solid;outline-color:#4a4a4c;background:rgba(74,74,76,.07)}
.${P}st{display:inline-flex;align-items:center;gap:2px}
.${P}st button{font:11px 'IBM Plex Mono',monospace;width:20px;height:24px;border:1px solid #9a9a9a;background:#f6f2e6;cursor:pointer;padding:0;color:#333}
.${P}x{border:0;background:none;color:#9c3b30;font-size:16px;cursor:pointer;padding:0}
.${P}right h3{font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:#5a6a70;margin:4px 0 10px;display:flex;justify-content:space-between}
.${P}tot{display:grid;grid-template-columns:1fr auto auto auto;gap:4px 12px;align-items:baseline;padding:6px 0 10px;border-bottom:1px solid #c9bfa8}
.${P}tot span:first-child{font-size:15px}
.${P}tot .ink{font-size:24px;font-weight:700;font-style:italic;color:#22303a}
.${P}tot .pen{font-family:Caveat,'Segoe Print',cursive;font-size:26px;color:#4a4a4c;min-width:2.5em;text-align:right}
.${P}tot .gap{font-family:Caveat,cursive;font-size:22px;color:#4a4a4c;min-width:3em}
.${P}tot .gap.bad{border:1.5px solid #4a4a4c;border-radius:50%;padding:0 6px}
.${P}tot.under .ink{text-decoration:underline 2px #9c3b30}
.${P}tray{margin-top:12px;font:12px 'IBM Plex Mono',monospace;color:#5a5a5c}
.${P}tray i{display:inline-block;width:56px;height:16px;border:1.5px dashed #6b6b6d;margin-right:6px;vertical-align:middle}
.${P}ctl{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.${P}ctl button{font:600 12px 'IBM Plex Mono',monospace;border:1.5px solid #4a4a4c;background:#f6f2e6;padding:8px 12px;cursor:pointer;touch-action:none}
.${P}clock{font:600 13px 'IBM Plex Mono',monospace;color:#9c3b30}
.${P}msg{margin-top:10px;font-family:Caveat,cursive;font-size:20px;color:#4a4a4c;min-height:24px}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(43,42,39,.86);z-index:4;padding:16px}
.${P}intro div{max-width:480px;background:#ece6d6;padding:18px 22px}
.${P}intro h2{margin:0 0 8px;font:700 24px 'Zilla Slab',Georgia,serif}
.${P}intro p{margin:0 0 8px;font-size:14px;line-height:1.5}
.${P}intro button{font:600 14px 'IBM Plex Mono',monospace;background:#33302c;color:#ece6d6;border:0;padding:10px 20px;cursor:pointer}
@media (max-width:860px){.${P}book{grid-template-columns:1fr}.${P}book::after{display:none}.${P}left{border-right:0;border-bottom:1px solid #c9bfa8}}
@media (max-width:480px){.${P}grid{grid-template-columns:2.2em minmax(1.6em,1fr) 3.2em 2.2em 2.8em 3.6em 1.2em;column-gap:2px}.${P}cell{font-size:13px}.${P}page{padding:10px 8px}.${P}left{padding-left:26px}.${P}ghost{height:auto;min-height:62px;overflow:visible;font-size:12px}.${P}st{flex-direction:column}.${P}st button{width:26px;height:18px}}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}book">
        <div class="${P}page ${P}left"><div class="${P}grid lg"></div></div>
        <div class="${P}page ${P}right"><h3><span>DAY TOTALS</span><span>TAM'S SUM</span></h3><div class="tots"></div>
          <div class="${P}tray"></div>
          <div class="${P}ctl"><button type="button" class="tiltb">Tilt to the torch (F)</button><span class="${P}clock">17:00 · booth shuts 18:00</span></div>
          <div class="${P}msg" aria-live="polite"></div></div>
      </div>
      <div class="${P}intro"><div><h2>The Ranger's Book</h2>
        <p>Marisol's logbook for yesterday. Names of lost sites are gone from it and the lines have closed up, but her totals stand.</p>
        <p>Tap a column heading to sum it in pencil. Where the sums fall short, press + at a seam to insert a ghost row and fill it until it locks. Balance every total before the booth shuts.</p>
        <button type="button">Start</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    const grid = $(".lg"), msgEl = $(`.${P}msg`);
    let ghosts = [];            // { after: index into ROWS (-1..8), site, pers, nights, permit, locked }
    const summed = new Set();
    let running = false, over = false, iv = 0, t = 0, idle = 0, partial = false, underline = false, hinted = false;
    const say = (s) => { msgEl.textContent = s; };

    function ordered() {        // printed rows and ghosts in page order
      const out = [];
      for (let i = -1; i < ROWS.length; i++) {
        if (i >= 0) out.push({ kind: "row", ...ROWS[i], nights: 1, idx: i });
        ghosts.filter((g) => g.after === i).forEach((g) => out.push({ kind: "ghost", g }));
      }
      return out;
    }
    const all = () => ordered().map((r) => (r.kind === "row" ? r : { site: r.g.site, pers: r.g.pers, nights: r.g.nights, permit: r.g.permit, ghost: r.g }));
    function sums() {
      const a = all();
      return { sites: a.length, persons: a.reduce((s, r) => s + r.pers, 0), fees: a.reduce((s, r) => s + FEE * r.nights, 0), envelopes: a.length };
    }

    function fits(g) {
      const list = ordered();
      const at = list.findIndex((r) => r.kind === "ghost" && r.g === g);
      const prev = [...list.slice(0, at)].reverse().find((r) => r.kind === "row");
      const next = list.slice(at + 1).find((r) => r.kind === "row");
      const lo = prev ? prev : { site: 0, permit: 400 }, hi = next ? next : { site: 25, permit: 499 };
      if (!(g.permit > lo.permit && g.permit < hi.permit)) return false;
      if (!(g.site > lo.site && g.site < hi.site)) return false;
      if (g.site !== g.permit - 400) return false;         // permits went out site by site in arrival order
      if (ghosts.some((o) => o !== g && (o.site === g.site || o.permit === g.permit))) return false;
      const s = sums();
      return s.persons <= TOTALS.persons && s.fees <= TOTALS.fees;
    }

    function stepper(val, fmt, on) {
      const w = document.createElement("span"); w.className = P + "st";
      const m = document.createElement("button"); m.type = "button"; m.textContent = "−"; m.setAttribute("aria-label", "less");
      const v = document.createElement("span"); v.textContent = fmt(val);
      const p = document.createElement("button"); p.type = "button"; p.textContent = "+"; p.setAttribute("aria-label", "more");
      m.addEventListener("click", () => on(-1)); p.addEventListener("click", () => on(1));
      w.append(m, v, p);
      return w;
    }

    function render() {
      grid.innerHTML = "";
      const heads = [["SITE", null], ["PARTY", null], ["PERS.", "persons"], ["NTS", null], ["FEE", "fees"], ["PERMIT", null], ["", null]];
      heads.forEach(([h, key]) => {
        const el = document.createElement(key || h === "SITE" ? "button" : "div");
        el.className = P + "hd";
        el.textContent = h;
        if (h === "SITE") { el.type = "button"; el.title = "Count the rows"; el.addEventListener("click", () => sumCol("sites")); if (summed.has("sites")) el.classList.add("done"); }
        if (key) { el.type = "button"; el.addEventListener("click", () => sumCol(key)); if (summed.has(key)) el.classList.add("done"); }
        grid.appendChild(el);
      });
      const seam = (after) => {
        const s = document.createElement("div"); s.className = P + "seam";
        const b = document.createElement("button"); b.type = "button"; b.textContent = "+"; b.setAttribute("aria-label", "Insert a ghost row here");
        b.addEventListener("click", () => insert(after));
        s.appendChild(b);
        // the grooves of a lost line under a low light: tallies, unreadable words
        const lostHere = Object.keys(LOST).map(Number).find((site) => {
          const prev = after >= 0 ? ROWS[after].site : 0, next = after + 1 < ROWS.length ? ROWS[after + 1].site : 25;
          return site > prev && site < next;
        });
        if (lostHere && !ghosts.some((g) => g.site === lostHere && g.locked)) {
          const gv = document.createElement("span"); gv.className = P + "groove";
          gv.innerHTML = `<span>~~~~~~</span>${tally(LOST[lostHere])}<span>~~~~</span>`;
          s.appendChild(gv);
        }
        grid.appendChild(s);
      };
      seam(-1);
      for (const r of ordered()) {
        if (r.kind === "row") {
          [r.site, r.party, tally(r.pers), "1", "$" + FEE, "0" + r.permit, ""].forEach((v, k) => {
            const c = document.createElement("div"); c.className = P + "cell" + (k === 1 ? " it" : "");
            if (k === 2) c.innerHTML = v; else c.textContent = v;
            grid.appendChild(c);
          });
          seam(r.idx);
        } else {
          const g = r.g;
          g.locked = fits(g);
          const cls = P + "cell " + P + "ghost" + (g.locked ? " " + P + "lock" : "");
          const cells = [
            stepper(g.site, (v) => String(v), (d) => { g.site = Math.max(1, Math.min(24, g.site + d)); touched(); }),
            Object.assign(document.createElement("span"), { textContent: "?" }),
            stepper(g.pers, (v) => String(v), (d) => { g.pers = Math.max(1, Math.min(8, g.pers + d)); touched(); }),
            stepper(g.nights, (v) => String(v), (d) => { g.nights = Math.max(1, Math.min(3, g.nights + d)); touched(); }),
            Object.assign(document.createElement("span"), { textContent: "$" + FEE * g.nights }),
            stepper(g.permit, (v) => "0" + v, (d) => { g.permit = Math.max(400, Math.min(413, g.permit + d)); touched(); }),
          ];
          cells.forEach((node) => { const c = document.createElement("div"); c.className = cls; c.appendChild(node); grid.appendChild(c); });
          const xc = document.createElement("div"); xc.className = cls;
          const x = document.createElement("button"); x.type = "button"; x.className = P + "x"; x.textContent = "×"; x.setAttribute("aria-label", "Rub out this ghost row");
          x.addEventListener("click", () => { ghosts = ghosts.filter((o) => o !== g); touched(); });
          xc.appendChild(x); grid.appendChild(xc);
        }
      }
      renderTotals();
    }

    function renderTotals() {
      const s = sums();
      const tots = $(".tots");
      tots.innerHTML = "";
      const names = { sites: "Occupied sites", persons: "Persons", fees: "Fees", envelopes: "Envelopes in the drop box" };
      for (const k of Object.keys(TOTALS)) {
        const row = document.createElement("div"); row.className = P + "tot";
        const show = summed.has(k) || partial || (k === "envelopes" && summed.has("sites"));
        const money = k === "fees" ? "$" : "";
        const gap = TOTALS[k] - s[k];
        if (underline && show && gap !== 0) row.classList.add("under");
        row.innerHTML = `<span></span><span class="ink">${money}${TOTALS[k]}</span><span class="pen">${show ? money + s[k] : ""}</span><span class="gap ${show && gap ? "bad" : ""}">${show ? (gap ? "≠ " + money + gap : "=") : ""}</span>`;
        row.firstChild.textContent = names[k];
        tots.appendChild(row);
      }
      const left = GHOSTS - ghosts.length;
      $(`.${P}tray`).innerHTML = `GHOST ROWS ${"<i></i>".repeat(left)}${left ? "" : "(all used)"}`;
    }

    function sumCol(k) {
      if (!running) return;
      summed.add(k); if (k === "sites") summed.add("envelopes");
      idle = 0;
      render();
      const s = sums()[k];
      say(k === "persons" ? `Persons: ${s}. She wrote ${TOTALS.persons}.` : k === "fees" ? `Fees: $${s}. She wrote $${TOTALS.fees}.` : `${s} rows. She wrote ${TOTALS.sites} sites, and ${TOTALS.envelopes} envelopes.`);
    }
    function insert(after) {
      if (!running) return;
      if (ghosts.length >= GHOSTS) { say("No blank rows left in the tray. Rub one out first."); return; }
      const prev = after >= 0 ? ROWS[after] : { site: 0, permit: 400 };
      ghosts.push({ after, site: prev.site, pers: 1, nights: 1, permit: 400, locked: false });
      idle = 0;
      touched();
    }
    function touched() {
      idle = 0;
      render();
      const s = sums();
      const balanced = Object.keys(TOTALS).every((k) => s[k] === TOTALS[k]);
      if (balanced && ghosts.length === GHOSTS && ghosts.every((g) => g.locked)) win();
    }
    function win() {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      say("Every total balances.");
      const lines = ghosts.map((g) => `site ${g.site}, ${g.pers} ${g.pers === 1 ? "person" : "people"}`).sort();
      api.end({ outcome: "win", text: `Every total balances. Three parties stayed at sites nobody remembers: ${lines.join("; ")}. The world rewrote its own records, and missed the sums. Three lines in your notebook.` });
    }

    // tilt to the torch: hold F or the button
    const tiltOn = () => wrap.classList.add(P + "tilt"), tiltOff = () => wrap.classList.remove(P + "tilt");
    const tb = $(".tiltb");
    tb.addEventListener("pointerdown", tiltOn); tb.addEventListener("pointerup", tiltOff);
    tb.addEventListener("pointerleave", tiltOff); tb.addEventListener("pointercancel", tiltOff);
    const kd = (e) => { if (e.key.toLowerCase() === "f" && running) tiltOn(); };
    const ku = (e) => { if (e.key.toLowerCase() === "f") tiltOff(); };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const bump = () => { idle = 0; };
    wrap.addEventListener("pointerdown", bump);

    function tick() {
      if (!running) return;
      t++; idle++;
      const left = CLOSE_S - t;
      const mins = Math.floor(t / CLOSE_S * 60);
      $(`.${P}clock`).textContent = `17:${String(Math.min(59, mins)).padStart(2, "0")} · booth shuts 18:00`;
      if (idle === 60 && !partial) { partial = true; renderTotals(); say("Partial sums, in the margin."); }
      if (idle === 120 && !underline) { underline = true; renderTotals(); }
      if (idle === 180 && !hinted) {
        hinted = true;
        const after = ROWS.findIndex((r) => r.site === 1);
        const free = ghosts.find((g) => !g.locked) || (ghosts.length < GHOSTS ? (ghosts.push({ after, site: 2, pers: 1, nights: 1, permit: 402 }), ghosts[ghosts.length - 1]) : null);
        if (free) { Object.assign(free, { after, site: 2, permit: 402, pers: 3, nights: 1 }); say("Marisol, over your shoulder: \"Permit 402. That would be… two?\""); touched(); }
      }
      if (left <= 0) {
        over = true; running = false; clearInterval(iv);
        api.end({ outcome: "lose", text: "18:00. Marisol closes the book gently and takes it home. The totals still don't add up, and nobody but you minds." });
      }
    }

    render();
    const go = $(`.${P}intro button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); running = true; iv = setInterval(tick, 1000); grid.querySelector("button")?.focus(); });
    go.focus();

    return {
      unmount() {
        over = true; running = false; clearInterval(iv);
        window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      },
    };
  },
};

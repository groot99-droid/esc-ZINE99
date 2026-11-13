// Journal Audit (1D, Redacted dossier). DESIGN.md section 11, cut to one spread modelled on
// b3-audit-2: 14 lines, 5 forgeries (one imitates her hand and is caught only by the clock), 2
// archivist notes. Mark each line Hers, Forged or Other hand; the loupe, the field card and the clock
// are the evidence. Lira's tells: crossed sevens, Δ for change, a thin space before units. The
// Continuum's: "deg", a flat register, misspelled names, hours out of order, readings the field card
// or physics contradict. Close the audit: every forgery caught with no true line struck wins; three
// or more errors lose; anything between is a scored close.
// Added in the refine pass: a line marked Other hand opens the margin (DESIGN 12): Circle it, Reply
// (one of three lines in Lira's voice) or Leave it; a second reply is answered in the small hand.
// A note at two minutes points at the clock. After two lost audits, the tally counts the forgeries left.
const P = "lira-calyx-journal-audit-";
const INK = "#2b1d14", SEAL = "#b3212b", ARCH = "#3c5a8c", BLACK = "#141414", PAGE = "#f4efe2";
const T = " "; // the thin space Lira puts before a unit
const LINES = [
  { id: 1, pg: 0, who: "hers", day: 201, time: "06:12", text: `N7 ledge, 3${T}840${T}m. Δφ 0.31; glow 3${T}s, steady.`, card: "N7 · 06:12 · Δφ 0.31 · 3 840 m", loupe: "Firm downstrokes, upright. The seven is crossed." },
  { id: 2, pg: 0, who: "forged", day: 201, time: "07:40", text: "N7 bearing 214 deg. Readings nominal.", card: "N7 · 07:38 · bearing 124°", loupe: "Even pressure on every stroke. An uncrossed seven. It writes deg." },
  { id: 3, pg: 0, who: "hers", day: 201, time: "09:05", text: `Mara sings at the ledge. Δφ 0.02 since yesterday; she breathes on the fourth beat.`, card: "N7 · 09:05 · Δφ 0.29 → 0.31 (song)", loupe: "Firm, upright, quick. Her hand." },
  { red: true, pg: 0, day: 201, time: "09:44" },
  { id: 4, pg: 0, who: "arch", text: "not her reading: see field card, D201 07:40", loupe: "Small, slanted left, blue-black ink. Not Lira's hand, and not the flat one." },
  { id: 5, pg: 0, who: "forged", day: 201, time: "11:20", text: "Ridgeback Stryders absent above 3000m. Migration within parameters.", card: "Strider count · 11:20 · 14 crossing at 3 100 m", loupe: "Even pressure. The name is misspelled; no space before the m." },
  { id: 6, pg: 0, who: "forged", day: 201, time: "10:02", text: `N8 ledge, 4${T}120${T}m. Δφ 0.12; glow 2${T}s.`, card: null, loupe: "Upright and firm. It looks like her hand." },
  { id: 7, pg: 0, who: "hers", day: 201, time: "13:47", text: `Spore-Weaver web, 0.44${T}AFU; pulses 7${T}s apart, as below.`, card: "Web · 13:47 · 0.44 AFU · period 7 s", loupe: "Firm, upright; both sevens crossed." },
  { id: 8, pg: 1, who: "hers", day: 202, time: "05:58", text: `Wind 40${T}km/h, gusts to 70. Gravimeter 9.71 → 9.64, Δ −0.07.`, card: "Gravimeter · 05:58 · 9.71, 9.64", loupe: "Firm, upright, the sevens crossed. Written fast, in the cold." },
  { id: 9, pg: 1, who: "forged", day: 202, time: "06:30", text: "N9 chant node, 2900m. Gravity 12.4 m/s2, stable.", card: "N9 · 06:30 · g 9.62 m/s²", loupe: "Even pressure. No space before the unit." },
  { id: 10, pg: 1, who: "hers", day: 202, time: "08:15", text: `Joren's lift cable reads 7${T}kN. He will not meet my eye.`, card: "Lift cable · 08:15 · 7 kN", loupe: "Firm, upright; the seven crossed, pressed hard." },
  { red: true, pg: 1, day: 202, time: "08:50" },
  { id: 11, pg: 1, who: "arch", text: "the chant has its rest in bar 6, not 5", loupe: "Small, slanted left, blue-black ink. Corrections only." },
  { id: 12, pg: 1, who: "forged", day: 202, time: "09:40", text: "Subject relocated to N10, bearing 090 deg. Compliance satisfactory.", card: null, loupe: "Even pressure, typed-flat. It writes deg." },
  { id: 13, pg: 1, who: "hers", day: 202, time: "11:02", text: `N10 by the chant, 3${T}270${T}m. Δφ 0.38; glow 4${T}s.`, card: "N10 · 11:02 · Δφ 0.38 · 3 270 m", loupe: "Firm, upright, quick. Her hand." },
  { id: 14, pg: 1, who: "hers", day: 202, time: "12:30", text: "Margin again, the small hand. I have circled it.", card: null, loupe: "Firm, upright. Her hand, pressed harder at the end." },
];
const MARKS = { H: "Hers", F: "Forged", O: "Other hand" };

export default {
  mount(root, api) {
    const off = [], timers = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    root.style.background = "#1c1c1e";
    const st = { sel: null, marks: {}, over: false, started: false };
    const real = LINES.filter((l) => !l.red);
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:#1c1c1e;color:${INK}}
      .${P}scroll{flex:1;overflow:auto;padding:12px}
      .${P}folder{max-width:1180px;margin:0 auto;background:#c9a86a;padding:16px 14px 14px;border-radius:4px 14px 4px 4px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
      .${P}page{position:relative;background:${PAGE};padding:14px 16px 18px;box-shadow:0 1px 0 rgba(0,0,0,.2)}
      .${P}head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;font:700 13px 'Courier Prime',monospace;letter-spacing:.08em;border-bottom:1.5px solid ${INK};padding-bottom:8px;margin-bottom:8px}
      .${P}tally{background:${BLACK};color:#f2f4f5;padding:5px 10px;font:700 12px 'Courier Prime',monospace;white-space:nowrap}
      .${P}tally b{display:block;font-size:20px}
      .${P}cols{display:flex;flex-wrap:wrap;gap:6px 26px}.${P}col{flex:1 1 380px;min-width:0}
      .${P}col h4{font:700 11px 'Courier Prime',monospace;letter-spacing:.14em;margin:6px 0;opacity:.7}
      .${P}ln{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:start;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid rgba(43,29,20,.18);padding:7px 4px;cursor:pointer;color:${INK};font:16px/1.35 'IM Fell English',Georgia,serif;position:relative;min-height:44px}
      .${P}ln:hover{background:rgba(43,29,20,.07)}
      .${P}ln:focus-visible{outline:2px dashed ${ARCH};outline-offset:-2px}
      .${P}ln.sel{outline:2px solid ${INK};outline-offset:-2px;background:rgba(201,168,106,.18)}
      .${P}ln .bx{width:24px;height:24px;border:1.5px solid ${INK};display:grid;place-items:center;font:700 12px 'Courier Prime',monospace}
      .${P}ln .bx.F{color:${SEAL};border-color:${SEAL}}.${P}ln .bx.O{color:${ARCH};border-color:${ARCH}}
      .${P}ln .ts{font:12px 'Courier Prime',monospace;opacity:.8;margin-right:6px}
      .${P}ln.arch .tx{color:${ARCH};font-size:15px;font-style:italic;display:inline-block;transform:skewX(14deg);transform-origin:left bottom;padding-left:18px}
      .${P}x7{position:relative;display:inline-block}.${P}x7::after{content:"";position:absolute;left:12%;right:0;top:56%;border-top:1.2px solid currentColor}
      .${P}stamp.new{animation:${P}thump .35s}
      @keyframes ${P}thump{from{transform:translateY(-50%) rotate(-8deg) scale(1.8);opacity:0}}
      .${P}reply{display:block;margin:2px 0 6px 38px;font:italic 15px/1.35 'IM Fell English',Georgia,serif;color:${INK}}
      .${P}reply.a{color:${ARCH};transform:skewX(14deg);transform-origin:left;padding-left:12px;font-size:14px}
      .${P}margin{margin:4px 0 8px 38px;padding:8px 10px;border:1.5px dashed ${ARCH};background:rgba(60,90,140,.06);font:14px/1.4 Georgia,serif}
      .${P}margin button{font:14px 'IM Fell English',Georgia,serif;border:1px solid ${ARCH};background:#fff;color:${ARCH};padding:6px 10px;margin:4px 6px 0 0;cursor:pointer;min-height:38px;text-align:left}
      .${P}margin button:hover{background:${ARCH};color:#fff}
      .${P}stamp{position:absolute;right:6px;top:50%;transform:translateY(-50%) rotate(-8deg);border:2.5px solid ${SEAL};color:${SEAL};font:700 13px 'Courier Prime',monospace;letter-spacing:.12em;padding:1px 8px;opacity:.85;pointer-events:none;background:rgba(244,239,226,.6)}
      .${P}stamp.O{border-color:${ARCH};color:${ARCH}}
      .${P}bar{display:block;height:18px;margin:4px 0 4px 38px;background:${BLACK};clip-path:polygon(0 12%,3% 0,40% 9%,70% 0,99% 8%,100% 60%,97% 100%,60% 90%,30% 100%,1% 92%)}
      .${P}seal{position:absolute;right:18px;bottom:12px;width:62px;height:62px;border:3px double ${SEAL};border-radius:50%;display:grid;place-items:center;color:${SEAL};font:700 11px 'Courier Prime',monospace;transform:rotate(-14deg);opacity:.55;pointer-events:none}
      .${P}tray{flex:0 0 auto;background:#26262a;color:#f2f4f5;padding:8px 12px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;border-top:2px solid #000}
      .${P}tray button{font:700 14px 'Courier Prime',monospace;letter-spacing:.06em;padding:8px 12px;min-height:44px;cursor:pointer;border:2px solid #ddd;background:#efe4cb;color:${INK}}
      .${P}tray button:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 0 0 2px rgba(255,255,255,.25)}
      .${P}tray button u{text-decoration-thickness:2px}
      @media (max-width:640px){.${P}tray{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 8px}.${P}tray > span{display:none}
        .${P}tray button{padding:6px 4px;min-height:42px;font-size:13px}.${P}tray button.close{grid-column:1/-1}.${P}out{grid-column:1/-1;font-size:13px!important;min-height:3.6em!important}
        .${P}lens{width:58px!important;height:58px!important;font-size:17px!important}.${P}scroll{padding:6px}.${P}folder{padding:8px 6px}.${P}page{padding:10px 8px 14px}}
      .${P}tray button.F{border-color:${SEAL};color:${SEAL};background:#fff}.${P}tray button.O{border-color:${ARCH};color:${ARCH};background:#fff}
      .${P}tray button.tool{background:transparent;color:#f2f4f5;border:1.5px solid #888;border-radius:20px}
      .${P}tray button.close{background:${SEAL};color:#fff;border-color:${SEAL}}
      .${P}tray button:disabled{opacity:.4;cursor:default}
      .${P}out{flex:1 1 100%;min-height:2.6em;font:15px/1.4 'Courier Prime',monospace;color:#e8e2d0;display:flex;gap:12px;align-items:center}
      .${P}out.v{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:#f3e3b8}
      .${P}lens{flex:0 0 auto;width:74px;height:74px;border-radius:50%;border:4px solid #ccc;background:${PAGE};color:${INK};display:none;place-items:center;overflow:hidden;font:22px 'IM Fell English',Georgia,serif;white-space:nowrap;box-shadow:3px 3px 0 #000}
      .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,20,20,.78);z-index:5;padding:14px;overflow:auto}
      .${P}card{position:relative;width:min(460px,100%);background:#c9a86a;padding:26px 14px 14px;border-radius:4px 14px 4px 4px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
      .${P}card::before{content:"FILE 12-C";position:absolute;top:-16px;left:18px;background:#c9a86a;padding:4px 14px 2px;border-radius:6px 6px 0 0;font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:${INK}}
      .${P}card .pg{background:${PAGE};color:${INK};padding:14px 16px;position:relative}
      .${P}card .cls{font:700 12px 'Courier Prime',monospace;letter-spacing:.16em;color:${SEAL};border:2px solid ${SEAL};display:inline-block;padding:1px 8px;transform:rotate(-3deg)}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:8px 0 4px}
      .${P}card .goal{font:15px/1.4 Georgia,serif;margin:0 0 10px}
      .${P}card .goal i{display:inline-block;background:${BLACK};color:${BLACK};user-select:none}
      .${P}card table{width:100%;border-collapse:collapse;font:15px/1.35 Georgia,serif;margin:0 0 12px}
      .${P}card td{padding:5px 4px;border-top:1px solid rgba(43,29,20,.2)}
      .${P}card td:first-child{width:1%;white-space:nowrap;font:700 13px 'Courier Prime',monospace}
      .${P}card label{display:flex;gap:8px;align-items:center;font:14px Georgia,serif;margin:0 0 10px}
      .${P}card button{font:700 15px 'Courier Prime',monospace;background:${SEAL};color:#fff;border:0;padding:11px 22px;cursor:pointer;letter-spacing:.1em}
      .${P}card button:hover,.${P}card button:focus-visible{background:${INK}}
    </style>
    <div class="${P}scroll"><div class="${P}folder"><div class="${P}page">
      <div class="${P}head"><span>CONTINUUM / RECOVERED FIELD LOG / FILE 12-C<br><span style="font-weight:400;opacity:.7">Lira Calyx, field journal, days 201–202</span></span><div class="${P}tally">CHECKED<b>0 / 14</b></div></div>
      <div class="${P}cols"><div class="${P}col" data-pg="0"><h4>LEFT PAGE · D201</h4></div><div class="${P}col" data-pg="1"><h4>RIGHT PAGE · D202</h4></div></div>
      <div class="${P}seal">AUDIT</div>
    </div></div></div>
    <div class="${P}tray">
      <button type="button" data-m="H"><u>H</u>ERS</button><button type="button" class="F" data-m="F"><u>F</u>ORGED</button><button type="button" class="O" data-m="O"><u>O</u>THER HAND</button>
      <span style="width:6px"></span>
      <button type="button" class="tool" data-t="loupe">◯ <u>l</u>oupe</button><button type="button" class="tool" data-t="card">▭ field <u>c</u>ard</button><button type="button" class="tool" data-t="clock">◷ clock (<u>t</u>)</button>
      <span style="flex:1"></span><button type="button" class="close" data-a="close">CLOSE THE AUDIT</button>
      <div class="${P}out" aria-live="polite"><div class="${P}lens"></div><span>Select a line, then use a tool or mark it.</span></div>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const losses = api.store.get("losses", 0);
    st.replies = 0; st.circled = 0; st.margin = {}; st.helped = false;
    const out = (t, lensText, voice) => {
      if (!voice && !lensText && performance.now() < (st.voiceUntil || 0) && /^Line selected/.test(t)) return;
      if (voice) st.voiceUntil = performance.now() + 4500;
      $("." + P + "out span").textContent = t; $("." + P + "out").classList.toggle("v", !!voice);
      const lens = $("." + P + "lens");
      if (lensText) { lens.style.display = "grid"; lens.innerHTML = lensText; } else lens.style.display = "none";
    };
    const handHTML = (l) => {
      const esc = l.text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return l.who === "hers" ? esc.replace(/7/g, `<span class="${P}x7">7</span>`) : esc;
    };
    const rows = {};
    for (const l of LINES) {
      const col = el.querySelector(`.${P}col[data-pg="${l.pg}"]`);
      if (l.red) { const b = document.createElement("div"); b.className = P + "bar"; b.title = "Redacted"; b.setAttribute("aria-label", `D${l.day} ${l.time}, redacted`); col.appendChild(b); continue; }
      const b = document.createElement("button"); b.type = "button"; b.className = P + "ln" + (l.who === "arch" ? " arch" : "");
      b.innerHTML = `<span class="bx"></span><span>${l.time ? `<span class="ts">D${l.day} · ${l.time}</span>` : ""}<span class="tx">${handHTML(l)}</span></span>`;
      on(b, "click", () => select(l.id));
      col.appendChild(b); rows[l.id] = b;
    }
    const select = (id) => {
      if (st.over || !st.started) return;
      st.sel = id;
      Object.entries(rows).forEach(([k, r]) => r.classList.toggle("sel", +k === id));
      out("Line selected. Loupe, field card or clock; then mark it.");
    };
    const refresh = () => {
      for (const l of real) {
        const r = rows[l.id], m = st.marks[l.id], bx = r.querySelector(".bx");
        bx.textContent = m || ""; bx.className = "bx " + (m || "");
        r.setAttribute("aria-label", `${l.time ? `D${l.day} ${l.time}. ` : ""}${l.text}${m ? `. Marked ${MARKS[m]}` : ""}`);
        const old = r.querySelector("." + P + "stamp"); if (old) old.remove();
        if (m === "F" || m === "O") r.insertAdjacentHTML("beforeend", `<span class="${P}stamp ${m}">${m === "F" ? "FORGED" : "OTHER HAND"}</span>`);
      }
      const done = Object.keys(st.marks).length;
      const left = real.filter((l) => l.who === "forged" && st.marks[l.id] !== "F").length;
      $("." + P + "tally").innerHTML = `CHECKED<b>${done} / ${real.length}</b>${st.helped ? `<small style="display:block;font-size:12px;color:#f3b4b4">${left} FORGED LEFT</small>` : ""}`;
      if (done >= 7 && !st.beats7) { st.beats7 = true; out("Halfway. Above the hideout, boots cross the grating and stop, and go on. Lira does not look up from the page.", null, true); }
    };
    const marginFor = (l) => {
      const row = rows[l.id]; if (st.margin[l.id] || row.nextElementSibling?.classList.contains(P + "margin")) return;
      const box = document.createElement("div"); box.className = P + "margin";
      box.innerHTML = `<div>The small hand, in the margin. Answer it?</div>
        <button type="button" data-r="circle">Circle it</button><button type="button" data-r="0">“Then whose was it?”</button><button type="button" data-r="1">“Thank you. Who are you?”</button><button type="button" data-r="2">“Stay out of my book.”</button><button type="button" data-r="leave">Leave it</button>`;
      row.after(box);
      box.querySelectorAll("[data-r]").forEach((b) => on(b, "click", () => {
        const r = b.dataset.r; box.remove(); st.margin[l.id] = r;
        if (r === "leave") { out("You leave the note as it is.", null, true); return; }
        const rep = document.createElement("span"); rep.className = P + "reply";
        if (r === "circle") { st.circled++; rep.textContent = "◯ Who wrote this?"; row.after(rep); out("You circle it and write the question beside it, as you did on page 47.", null, true); return; }
        st.replies++; rep.textContent = "— " + b.textContent; row.after(rep);
        if (st.replies === 2) { const a = document.createElement("span"); a.className = P + "reply a"; a.textContent = "I can't say who. Not yet."; rep.after(a); out("Under your second reply, while you were reading the other page, the small hand has answered.", null, true); }
        else out("You write your answer under the note. Whoever reads this book will read that too.", null, true);
      }));
    };
    const mark = (m) => {
      if (st.sel == null || st.over) { out("Select a line first."); return; }
      const prev = st.marks[st.sel];
      st.marks[st.sel] = m; refresh();
      const r = rows[st.sel].querySelector("." + P + "stamp"); if (r && prev !== m && !api.reducedMotion) r.classList.add("new");
      const l = real.find((x) => x.id === st.sel);
      if (m === "O" && l.who === "arch") { marginFor(l); return; }
      const idx = real.findIndex((x) => x.id === st.sel);
      if (idx < real.length - 1) { select(real[idx + 1].id); rows[real[idx + 1].id].focus({ preventScroll: false }); }
    };
    const tool = (t) => {
      if (st.sel == null || st.over) { out("Select a line first."); return; }
      const l = real.find((x) => x.id === st.sel);
      if (t === "loupe") {
        const word = l.text.split(/\s+/).slice(-3).join(" ");
        const lens = l.who === "arch" ? `<span style="color:${ARCH};font-style:italic;transform:skewX(14deg)">${word}</span>` : l.who === "hers" ? word.replace(/7/g, `<span class="${P}x7">7</span>`) : word;
        out(`Loupe: ${l.loupe}`, lens);
      }
      if (t === "card") out(l.who === "arch" ? "Field card: no card. This is a note, not a reading." : l.card ? `Field card, as taken by hand: ${l.card}` : "Field card: none filed for this line.");
      if (t === "clock") {
        if (!l.time) { out("Clock: no timestamp on this line."); return; }
        const day = LINES.filter((x) => x.day === l.day && x.time);
        const i = day.indexOf(l), prev = day[i - 1], next = day[i + 1];
        const bad = (prev && prev.time > l.time) || (next && next.time < l.time);
        out(`Clock: ${prev ? prev.time + " → " : ""}[${l.time}]${next ? " → " + next.time : ""}. ${bad ? (prev && prev.time > l.time ? "Out of sequence: written after a later hour." : "The next line runs backward.") : "In sequence."}`);
      }
    };
    el.querySelectorAll("[data-m]").forEach((b) => on(b, "click", () => mark(b.dataset.m)));
    el.querySelectorAll("[data-t]").forEach((b) => on(b, "click", () => tool(b.dataset.t)));
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      const k = e.key.toLowerCase();
      if (k === "h" || k === "f" || k === "o") { mark(k.toUpperCase()); e.preventDefault(); }
      else if (k === "l") tool("loupe"); else if (k === "c") tool("card"); else if (k === "t") tool("clock");
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const i = real.findIndex((l) => l.id === st.sel), n = Math.max(0, Math.min(real.length - 1, (i < 0 ? -1 : i) + (e.key === "ArrowDown" ? 1 : -1)));
        select(real[n].id); rows[real[n].id].focus(); e.preventDefault();
      }
    });
    on($("[data-a=close]"), "click", () => {
      if (st.over) return;
      let caught = 0, missed = 0, falseAcc = 0, archOk = 0;
      for (const l of real) {
        const m = st.marks[l.id] || "H";
        if (l.who === "forged") m === "F" ? caught++ : missed++;
        else if (l.who === "hers") { if (m !== "H") falseAcc++; }
        else if (l.who === "arch") { if (m === "O") archOk++; else if (m === "F") falseAcc++; }
      }
      st.over = true;
      const summary = `${caught} of 5 forgeries caught (nodes restored), ${missed} missed, ${falseAcc} true line${falseAcc === 1 ? "" : "s"} struck${archOk ? `, ${archOk} of 2 notes in the other hand recognised` : ""}.`;
      const margin = st.replies ? ` You answered the small hand ${st.replies === 1 ? "once" : "twice"}; the Continuum reads this book too, and now it knows someone writes back.` : st.circled ? " You circled the small hand's notes and asked, and left it there." : "";
      if (missed === 0 && falseAcc === 0) { api.store.set("losses", 0); api.end({ outcome: "win", text: `Audit closed. ${summary} Every forged line restored, nothing of hers doubted. The journal is hers again, line by line.${margin}` }); }
      else if (missed + falseAcc >= 3) { api.store.set("losses", losses + 1); api.end({ outcome: "lose", text: `Audit closed. ${summary} Too much of the record stays forged or doubted, and the nodes it names go into the dossier unverified.${margin}` }); }
      else api.end({ outcome: "done", text: `Audit closed. ${summary} Most of the page is hers; the rest will follow her into the Peaks as it is.${margin}` });
    });
    timers.push(setTimeout(() => { if (!st.over) out("Lira's note: the left page holds the most of them. And one keeps my hand but not my hour.", null, true); }, 120000));

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="pg"><span class="cls">AUDIT</span>
      <h2>Journal Audit</h2>
      <p class="goal">Find every line someone else wrote in your journal, and strike nothing that is yours.</p>
      <table><tr><td>H</td><td>Hers: crossed sevens, Δ, a thin space before units</td></tr>
      <tr><td style="color:${SEAL}">F</td><td>Forged: “deg”, a flat voice, misspelled names, wrong hours</td></tr>
      <tr><td style="color:${ARCH}">O</td><td>Other hand: small, blue, slanted left</td></tr>
      <tr><td>L · C · T</td><td>Loupe, field card, clock: evidence for the selected line</td></tr></table>
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle" checked> Keep a count of the forgeries left</label>` : ""}
      <button type="button">Open the file</button></div></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const g = intro.querySelector(".gentle"); st.helped = !!(g && g.checked);
      intro.remove(); st.started = true; refresh(); select(real[0].id); rows[real[0].id].focus();
      out("Book III, the hideout. The stolen log came back to you overwritten with false timestamps and fabricated sensor readings. Find their lines before they become your nodes.", null, true);
    });
    sb.focus();
    refresh();
    return { unmount() { timers.forEach(clearTimeout); off.forEach((f) => f()); } };
  },
};

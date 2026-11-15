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
// Phase 1 of the accepted development (DESIGN "Accepted development (2026-11-15)"): the four hands as
// reference cards and under the loupe; the two black bars as things to measure (the bar gauge: ruled
// with blue under the black is surgical, brushed is clumsy; the surgical one is the first of the
// twelve); Pell's book, her copy of Book I, as a second field card for the two lines carried forward
// from Book I (one of them forged, and caught only there). Drawn with the game's art (api.art); every
// element keeps its old drawing as the fallback.
const P = "lira-calyx-journal-audit-";
const INK = "#2b1d14", SEAL = "#b3212b", ARCH = "#3c5a8c", BLACK = "#141414", PAGE = "#f4efe2";
const T = " "; // the thin space Lira puts before a unit
const LINES = [
  { id: 1, pg: 0, who: "hers", day: 201, time: "06:12", text: `N7 ledge, 3${T}840${T}m. Δφ 0.31; glow 3${T}s, steady.`, card: "N7 · 06:12 · Δφ 0.31 · 3 840 m", loupe: "Firm downstrokes, upright. The seven is crossed." },
  { id: 2, pg: 0, who: "forged", day: 201, time: "07:40", text: "N7 bearing 214 deg. Readings nominal.", card: "N7 · 07:38 · bearing 124°", loupe: "Even pressure on every stroke. An uncrossed seven. It writes deg." },
  { id: 3, pg: 0, who: "hers", day: 201, time: "09:05", text: `Mara sings at the ledge. Δφ 0.02 since yesterday; she breathes on the fourth beat.`, card: "N7 · 09:05 · Δφ 0.29 → 0.31 (song)", loupe: "Firm, upright, quick. Her hand." },
  { red: true, id: "b1", kind: "surgical", mm: 41, pg: 0, day: 201, time: "09:44" },
  { id: 4, pg: 0, who: "arch", text: "not her reading: see field card, D201 07:40", loupe: "Small, slanted left, blue-black ink. Not Lira's hand, and not the flat one." },
  { id: 5, pg: 0, who: "forged", day: 201, time: "11:20", text: "Ridgeback Stryders absent above 3000m. Migration within parameters.", card: "Strider count · 11:20 · 14 crossing at 3 100 m", loupe: "Even pressure. The name is misspelled; no space before the m." },
  { id: 6, pg: 0, who: "forged", day: 201, time: "10:02", text: `N8 ledge, 4${T}120${T}m. Δφ 0.12; glow 2${T}s.`, card: null, loupe: "Upright and firm. It looks like her hand." },
  { id: 7, pg: 0, who: "hers", day: 201, time: "13:47", text: `Spore-Weaver web, 0.44${T}AFU; pulses 7${T}s apart, as below.`, card: "Web · 13:47 · 0.44 AFU · period 7 s", loupe: "Firm, upright; both sevens crossed." },
  { id: 15, pg: 0, who: "hers", day: 201, time: "14:20", book1: true, text: `Carried forward from Book I: strider count, bridge, 06:10: 17. Pell says 18.`, card: null, loupe: "Firm, upright; both sevens crossed. Her hand." },
  { id: 8, pg: 1, who: "hers", day: 202, time: "05:58", text: `Wind 40${T}km/h, gusts to 70. Gravimeter 9.71 → 9.64, Δ −0.07.`, card: "Gravimeter · 05:58 · 9.71, 9.64", loupe: "Firm, upright, the sevens crossed. Written fast, in the cold." },
  { id: 9, pg: 1, who: "forged", day: 202, time: "06:30", text: "N9 chant node, 2900m. Gravity 12.4 m/s2, stable.", card: "N9 · 06:30 · g 9.62 m/s²", loupe: "Even pressure. No space before the unit." },
  { id: 10, pg: 1, who: "hers", day: 202, time: "08:15", text: `Joren's lift cable reads 7${T}kN. He will not meet my eye.`, card: "Lift cable · 08:15 · 7 kN", loupe: "Firm, upright; the seven crossed, pressed hard." },
  { red: true, id: "b2", kind: "clumsy", pg: 1, day: 202, time: "08:50" },
  { id: 11, pg: 1, who: "arch", text: "the chant has its rest in bar 6, not 5", loupe: "Small, slanted left, blue-black ink. Corrections only." },
  { id: 12, pg: 1, who: "forged", day: 202, time: "09:40", text: "Subject relocated to N10, bearing 090 deg. Compliance satisfactory.", card: null, loupe: "Even pressure, typed-flat. It writes deg." },
  { id: 13, pg: 1, who: "hers", day: 202, time: "11:02", text: `N10 by the chant, 3${T}270${T}m. Δφ 0.38; glow 4${T}s.`, card: "N10 · 11:02 · Δφ 0.38 · 3 270 m", loupe: "Firm, upright, quick. Her hand." },
  { id: 16, pg: 1, who: "forged", lens: "hers", day: 202, time: "11:40", book1: true, text: `Carried forward from Book I: N1 valley web, 0.47${T}AFU by hand.`, card: null, loupe: "Upright and firm, the seven crossed. It looks like her hand." },
  { id: 14, pg: 1, who: "hers", day: 202, time: "12:30", text: "Margin again, the small hand. I have circled it.", card: null, loupe: "Firm, upright. Her hand, pressed harder at the end." },
];
const MARKS = { H: "Hers", F: "Forged", O: "Other hand" };
const STAMP = { H: "stamp-hers", F: "stamp-forged", O: "stamp-other-hand" };
const HANDS = [["hers", "hand-lira", "Hers", "Slants right; sevens crossed; Δ; a thin space before units."], ["forged", "hand-continuum", "The Continuum", "Upright, even pressure; “deg”; sevens uncrossed."],
  ["arch", "hand-archivist", "The other hand", "Small, slanted left, blue-black. Corrections only."], ["pell", "hand-pell", "Pell", "Capitals, copied each evening. Exactly what the Doctor said."]];
const PELL = ["PELLS BOOK. BOOK I. HOLLIN TERRACE.", "STRIDERS BRIDGE 06:10. DOCTOR 17. ME 18. ONE WAS A BABY.", "N1 VALLEY. DOCTOR SAYS 0.44. I WROTE IT SAME.", "SIREN. DOCTORS LINE. RIVER GLOW.", "WOLF BABY ONE. GLOW UNDER 4 S. 2 600 M: TOO HIGH.", "HAND / RELAY. N1: 0.44 / 0.47. N2, N3. SAME DAY."];

export default {
  mount(root, api) {
    const off = [], timers = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); off.push(() => t.removeEventListener(e, f, o)); };
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const A = api.art || { has: () => false, url: () => "" };
    const pic = (id, cls = "", alt = "") => (A.has(id) ? `<img class="${cls}" src="${A.url(id)}" alt="${alt}" draggable="false">` : "");
    root.style.background = "#1c1c1e";
    const st = { sel: null, marks: {}, over: false, started: false, bars: {}, pellSeen: new Set(), pellPg: 0 };
    const real = LINES.filter((l) => !l.red), bars = LINES.filter((l) => l.red);
    const el = document.createElement("div"); el.className = P + "wrap";
    el.innerHTML = `<style>
      .${P}wrap{position:absolute;inset:0;display:flex;flex-direction:column;background:#1c1c1e;color:${INK}}
      .${P}scroll{flex:1;overflow:auto;padding:12px}
      .${P}tabs{max-width:1180px;margin:0 auto;display:flex;gap:2px;padding:0 18px;height:34px;align-items:flex-end}
      .${P}tabs img{height:30px;width:auto;display:block;filter:brightness(.82)}.${P}tabs img.on{height:34px;filter:none}
      .${P}folder{max-width:1180px;margin:0 auto;background:#c9a86a;padding:16px 14px 14px;border-radius:4px 14px 4px 4px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
      .${P}page{position:relative;background:${PAGE};padding:14px 16px 18px;box-shadow:0 1px 0 rgba(0,0,0,.2)}
      .${P}head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;font:700 13px 'Courier Prime',monospace;letter-spacing:.08em;border-bottom:1.5px solid ${INK};padding-bottom:8px;margin-bottom:8px}
      .${P}tally{background:${BLACK};color:#f2f4f5;padding:5px 10px;font:700 12px 'Courier Prime',monospace;white-space:nowrap}
      .${P}tally b{display:block;font-size:20px}.${P}tally small{display:block;font-size:12px;color:#cfd8e6}
      .${P}cols{display:flex;flex-wrap:wrap;gap:6px 26px}.${P}col{flex:1 1 380px;min-width:0}
      .${P}col h4{font:700 11px 'Courier Prime',monospace;letter-spacing:.14em;margin:6px 0;opacity:.7}
      .${P}ln{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:start;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid rgba(43,29,20,.18);padding:7px 54px 7px 4px;cursor:pointer;color:${INK};font:16px/1.35 'IM Fell English',Georgia,serif;position:relative;min-height:44px}
      .${P}ln:hover{background:rgba(43,29,20,.07)}
      .${P}ln:focus-visible{outline:2px dashed ${ARCH};outline-offset:-2px}
      .${P}ln.sel{outline:2px solid ${INK};outline-offset:-2px;background:rgba(201,168,106,.18)}
      .${P}ln .bx{width:24px;height:24px;border:1.5px solid ${INK};display:grid;place-items:center;font:700 12px 'Courier Prime',monospace}
      .${P}ln .bx.F{color:${SEAL};border-color:${SEAL}}.${P}ln .bx.O{color:${ARCH};border-color:${ARCH}}
      .${P}ln .ts{font:12px 'Courier Prime',monospace;opacity:.8;margin-right:6px}
      .${P}ln.arch .tx{color:${ARCH};font-size:15px;font-style:italic;display:inline-block;transform:skewX(14deg);transform-origin:left bottom;padding-left:18px}
      .${P}ln.arch .bk{position:absolute;left:34px;top:2px;height:calc(100% - 4px);width:auto;mix-blend-mode:multiply;pointer-events:none}
      .${P}x7{position:relative;display:inline-block}.${P}x7::after{content:"";position:absolute;left:12%;right:0;top:56%;border-top:1.2px solid currentColor}
      .${P}stamp.new{animation:${P}thump .35s}
      @keyframes ${P}thump{from{transform:translateY(-50%) rotate(-8deg) scale(1.8);opacity:0}}
      .${P}reply{display:flex;align-items:center;gap:6px;margin:2px 0 6px 38px;font:italic 15px/1.35 'IM Fell English',Georgia,serif;color:${INK}}
      .${P}reply img{height:34px;width:auto;mix-blend-mode:multiply;flex:0 0 auto}
      .${P}reply.a{color:${ARCH};font-size:14px}.${P}reply.a span{transform:skewX(14deg);transform-origin:left;padding-left:6px}
      .${P}margin{margin:4px 0 8px 38px;padding:8px 10px;border:1.5px dashed ${ARCH};background:rgba(60,90,140,.06);font:14px/1.4 Georgia,serif}
      .${P}margin .th{float:right;width:72px;height:72px;margin:0 0 4px 8px;border:1px solid rgba(60,90,140,.5)}
      .${P}margin.g{border-color:${INK};background:rgba(43,29,20,.05)}
      .${P}margin button{font:14px 'IM Fell English',Georgia,serif;border:1px solid ${ARCH};background:#fff;color:${ARCH};padding:6px 10px;margin:4px 6px 0 0;cursor:pointer;min-height:38px;text-align:left}
      .${P}margin.g button{border-color:${INK};color:${INK}}
      .${P}margin button:hover{background:${ARCH};color:#fff}.${P}margin.g button:hover{background:${INK}}
      .${P}stamp{position:absolute;right:6px;top:50%;transform:translateY(-50%) rotate(-8deg);border:2.5px solid ${SEAL};color:${SEAL};font:700 13px 'Courier Prime',monospace;letter-spacing:.12em;padding:1px 8px;opacity:.85;pointer-events:none;background:rgba(244,239,226,.6)}
      .${P}stamp.O{border-color:${ARCH};color:${ARCH}}
      img.${P}stamp{border:0;padding:0;background:none;width:46px;height:46px;right:4px;opacity:.9;mix-blend-mode:multiply;border-radius:3px}
      .${P}bar{display:block;height:18px;margin:4px 0 4px 38px;background:${BLACK};clip-path:polygon(0 12%,3% 0,40% 9%,70% 0,99% 8%,100% 60%,97% 100%,60% 90%,30% 100%,1% 92%)}
      .${P}barb{display:block;position:relative;width:calc(100% - 38px);margin:3px 0 3px 38px;padding:0;border:0;background:transparent;cursor:pointer;min-height:44px}
      .${P}barb img.b{display:block;width:100%;height:auto;mix-blend-mode:multiply}
      .${P}barb.sel{outline:2px solid ${INK};outline-offset:1px}.${P}barb:focus-visible{outline:2px dashed ${ARCH}}
      .${P}barb .tag{position:absolute;left:4px;bottom:1px;font:700 11px 'Courier Prime',monospace;letter-spacing:.08em;background:${PAGE};padding:0 5px;border:1px solid ${INK}}
      .${P}barb .ex{position:absolute;left:-40px;top:-10px;height:66%;width:auto;transform:rotate(-7deg);mix-blend-mode:multiply}
      .${P}seal{position:absolute;right:18px;bottom:12px;width:62px;height:62px;border:3px double ${SEAL};border-radius:50%;display:grid;place-items:center;color:${SEAL};font:700 11px 'Courier Prime',monospace;transform:rotate(-14deg);opacity:.55;pointer-events:none}
      img.${P}seal{border:0;width:84px;height:84px;border-radius:0;mix-blend-mode:multiply;opacity:.8}
      .${P}tray{flex:0 0 auto;background:#26262a;color:#f2f4f5;padding:8px 12px;display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;border-top:2px solid #000}
      .${P}tray button{font:700 14px 'Courier Prime',monospace;letter-spacing:.06em;padding:8px 12px;min-height:44px;cursor:pointer;border:2px solid #ddd;background:#efe4cb;color:${INK}}
      .${P}tray button:hover:not(:disabled){filter:brightness(1.08);box-shadow:0 0 0 2px rgba(255,255,255,.25)}
      .${P}tray button u{text-decoration-thickness:2px}
      @media (max-width:640px){.${P}tray{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:6px 8px}.${P}tray > span{display:none}
        .${P}tray button{padding:5px 4px;min-height:40px;font-size:13px}.${P}tray button.close{grid-column:1/-1;min-height:36px}.${P}out{grid-column:1/-1;font-size:13px!important;min-height:3.9em!important}
        .${P}lens{width:58px!important;height:58px!important;font-size:17px!important}.${P}scroll{padding:6px}.${P}folder{padding:8px 6px}.${P}page{padding:10px 8px 14px}.${P}tabs{padding:0 8px}}
      .${P}tray button.F{border-color:${SEAL};color:${SEAL};background:#fff}.${P}tray button.O{border-color:${ARCH};color:${ARCH};background:#fff}
      .${P}tray button.tool{background:transparent;color:#f2f4f5;border:1.5px solid #888;border-radius:20px}
      .${P}tray button.close{background:${SEAL};color:#fff;border-color:${SEAL}}
      .${P}tray button:disabled{opacity:.4;cursor:default}
      .${P}out{flex:1 1 100%;min-height:2.6em;font:15px/1.4 'Courier Prime',monospace;color:#e8e2d0;display:flex;gap:12px;align-items:center}
      .${P}out.v{font:italic 16px/1.4 'IM Fell English',Georgia,serif;color:#f3e3b8}
      .${P}lens{flex:0 0 auto;width:74px;height:74px;border-radius:50%;border:4px solid #ccc;background:${PAGE} no-repeat;color:${INK};display:none;place-items:center;overflow:hidden;font:22px 'IM Fell English',Georgia,serif;white-space:nowrap;box-shadow:3px 3px 0 #000}
      .${P}intro,.${P}over,.${P}fin{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,20,20,.78);z-index:5;padding:14px;overflow:auto}
      .${P}card{position:relative;width:min(460px,100%);background:#c9a86a;padding:26px 14px 14px;border-radius:4px 14px 4px 4px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
      .${P}card::before{content:"FILE 12-C";position:absolute;top:-16px;left:18px;background:#c9a86a;padding:4px 14px 2px;border-radius:6px 6px 0 0;font:700 12px 'Courier Prime',monospace;letter-spacing:.14em;color:${INK}}
      .${P}card .pg{background:${PAGE};color:${INK};padding:14px 16px;position:relative}
      .${P}card .ttl{display:block;width:100%;height:auto;margin:0 0 8px}
      .${P}card .sl{position:absolute;right:8px;top:54px;width:74px;height:74px;mix-blend-mode:multiply;transform:rotate(9deg);pointer-events:none}
      .${P}card .cls{font:700 12px 'Courier Prime',monospace;letter-spacing:.16em;color:${SEAL};border:2px solid ${SEAL};display:inline-block;padding:1px 8px;transform:rotate(-3deg)}
      .${P}card h2{font:400 28px/1.05 'IM Fell English',Georgia,serif;margin:8px 0 4px}
      .${P}card .goal{font:15px/1.4 Georgia,serif;margin:0 0 8px}
      .${P}card .lift{display:block;width:100%;height:auto;margin:0 0 8px;mix-blend-mode:multiply}
      .${P}card table{width:100%;border-collapse:collapse;font:15px/1.35 Georgia,serif;margin:0 0 12px}
      .${P}card td{padding:5px 4px;border-top:1px solid rgba(43,29,20,.2)}
      .${P}card td:first-child{width:1%;white-space:nowrap;font:700 13px 'Courier Prime',monospace}
      .${P}card label{display:flex;gap:8px;align-items:center;font:14px Georgia,serif;margin:0 0 10px}
      .${P}card button,.${P}sheet button{font:700 15px 'Courier Prime',monospace;background:${SEAL};color:#fff;border:0;padding:11px 22px;cursor:pointer;letter-spacing:.1em;min-height:44px}
      .${P}card button:hover,.${P}card button:focus-visible,.${P}sheet button:hover{background:${INK}}
      .${P}sheet{width:min(880px,100%);max-height:100%;overflow:auto;background:${PAGE};color:${INK};padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,.5)}
      .${P}sheet h3{font:400 24px/1.1 'IM Fell English',Georgia,serif;margin:0 0 4px}.${P}sheet p{font:15px/1.4 Georgia,serif;margin:0 0 10px}
      .${P}hands{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:12px}
      .${P}hands figure{margin:0;border:1px solid rgba(43,29,20,.4);background:#fff8}.${P}hands img{display:block;width:100%;height:auto}
      .${P}hands figcaption{font:14px/1.35 Georgia,serif;padding:6px 8px}.${P}hands figcaption b{font:700 12px 'Courier Prime',monospace;letter-spacing:.1em;display:block}
      .${P}pell{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:10px}
      .${P}pell .pp{flex:0 1 300px;min-width:200px;max-width:min(300px,100%);margin:0 auto}.${P}pell .pp img{display:block;width:100%;height:auto;box-shadow:2px 3px 0 rgba(0,0,0,.25)}
      .${P}pell .pp .fb{aspect-ratio:3/4;display:grid;place-items:center;border:1px solid ${INK};font:700 18px/1.5 'Courier Prime',monospace;padding:14px;text-align:center}
      .${P}pell .tx{flex:1 1 220px;font:15px/1.45 Georgia,serif}.${P}pell .cap{font:700 15px/1.5 'Courier Prime',monospace;letter-spacing:.04em;border-left:3px solid #7d7a74;padding-left:10px;margin:0 0 10px}
      .${P}pell .nav{display:flex;gap:8px;align-items:center;font:700 13px 'Courier Prime',monospace}
      .${P}sheet button.q{background:#fff;color:${INK};border:1.5px solid ${INK};padding:8px 14px}
      .${P}fin{background:rgba(20,20,20,.86);text-align:center;color:#f3e3b8;font:italic 20px 'IM Fell English',Georgia,serif}
      .${P}fin .in{background:${PAGE};padding:18px 26px;color:${INK};box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:min(420px,100%)}
      .${P}fin img{display:block;width:min(240px,60vw);height:auto;margin:0 auto 6px;mix-blend-mode:multiply;animation:${P}drop .4s}
      .${P}fin img.s2{width:90px;margin-top:-30px;margin-left:62%;animation-delay:.25s;animation-fill-mode:backwards}
      @keyframes ${P}drop{from{transform:scale(1.7) rotate(-9deg);opacity:0}}
      @media (prefers-reduced-motion:reduce){.${P}fin img,.${P}stamp.new{animation:none}}
    </style>
    <div class="${P}scroll"><div class="${P}tabs" aria-hidden="true">${pic("tab-entries", "on")}${pic("tab-margin")}</div><div class="${P}folder"><div class="${P}page">
      <div class="${P}head"><span>CONTINUUM / RECOVERED FIELD LOG / FILE 12-C<br><span style="font-weight:400;opacity:.7">Lira Calyx, field journal, days 201–202</span></span><div class="${P}tally">CHECKED<b>0 / ${real.length}</b></div></div>
      <div class="${P}cols"><div class="${P}col" data-pg="0"><h4>LEFT PAGE · D201</h4></div><div class="${P}col" data-pg="1"><h4>RIGHT PAGE · D202</h4></div></div>
      ${pic("seal-press-imprint", P + "seal") || `<div class="${P}seal">AUDIT</div>`}
    </div></div></div>
    <div class="${P}tray">
      <button type="button" data-m="H"><u>H</u>ERS</button><button type="button" class="F" data-m="F"><u>F</u>ORGED</button><button type="button" class="O" data-m="O"><u>O</u>THER HAND</button>
      <span style="width:6px"></span>
      <button type="button" class="tool" data-t="loupe">◯ <u>l</u>oupe</button><button type="button" class="tool" data-t="card">▭ <u>c</u>ard</button><button type="button" class="tool" data-t="clock">◷ clock (<u>t</u>)</button>
      <button type="button" class="tool" data-t="gauge">▬ <u>g</u>auge</button><button type="button" class="tool" data-t="pell">▤ <u>P</u>ell’s book</button><button type="button" class="tool" data-t="hands">✎ ha<u>n</u>ds</button>
      <span style="flex:1"></span><button type="button" class="close" data-a="close">CLOSE THE AUDIT</button>
      <div class="${P}out" aria-live="polite"><div class="${P}lens"></div><span>Select a line, then use a tool or mark it.</span></div>
    </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const losses = api.store.get("losses", 0);
    st.replies = 0; st.circled = 0; st.margin = {}; st.helped = false;
    // the lens: a crop of a hand card's loupe (the card's loupe sits at 634,190, r 96 of 800 x 560), or text
    const out = (t, lensText, voice, lensArt) => {
      if (!voice && !lensText && !lensArt && performance.now() < (st.voiceUntil || 0) && /^Line selected/.test(t)) return;
      if (voice) st.voiceUntil = performance.now() + 4500;
      $("." + P + "out span").textContent = t; $("." + P + "out").classList.toggle("v", !!voice);
      const lens = $("." + P + "lens");
      lens.style.backgroundImage = ""; lens.innerHTML = "";
      if (lensArt && A.has(lensArt.id)) {
        const D = lens.offsetWidth || 74, d = D - 8;
        lens.style.display = "grid"; lens.style.backgroundImage = `url(${A.url(lensArt.id)})`;
        if (lensArt.whole) { lens.style.backgroundSize = "cover"; lens.style.backgroundPosition = "center"; }
        else { const k = d / 192; lens.style.backgroundSize = `${800 * k}px auto`; lens.style.backgroundPosition = `${-538 * k}px ${-94 * k}px`; }
      } else if (lensText) { lens.style.display = "grid"; lens.innerHTML = lensText; } else lens.style.display = "none";
    };
    const handHTML = (l) => {
      const esc = l.text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      return l.who === "hers" || l.lens === "hers" ? esc.replace(/7/g, `<span class="${P}x7">7</span>`) : esc;
    };
    const rows = {};
    const barHTML = (l) => {
      const b = st.bars[l.id] || {};
      const art = l.kind === "surgical" ? (b.gauged ? "bar-gauged" : "bar-surgical") : "bar-clumsy";
      return (pic(art, "b") || `<span class="${P}bar"></span>`) + (b.call ? `<span class="tag">${b.call === "surgical" ? `RULED${l.mm ? ` · ${l.mm} mm` : ""}` : "BRUSHED"}</span>` : b.gauged ? `<span class="tag">GAUGED</span>` : "") +
        (b.call === "surgical" && l.kind === "surgical" ? pic("stamp-excised", "ex") : "");
    };
    for (const l of LINES) {
      const col = el.querySelector(`.${P}col[data-pg="${l.pg}"]`);
      const b = document.createElement("button"); b.type = "button";
      if (l.red) { b.className = P + "barb"; b.innerHTML = barHTML(l); b.setAttribute("aria-label", `D${l.day} ${l.time}, a black bar`); }
      else {
        b.className = P + "ln" + (l.who === "arch" ? " arch" : "");
        b.innerHTML = `<span class="bx"></span><span>${l.time ? `<span class="ts">D${l.day} · ${l.time}</span>` : ""}${l.who === "arch" ? pic("bracket-small-hand", "bk") : ""}<span class="tx">${handHTML(l)}</span></span>`;
      }
      on(b, "click", () => select(l.id));
      col.appendChild(b); rows[l.id] = b;
    }
    const byId = (id) => LINES.find((x) => x.id === id);
    const select = (id) => {
      if (st.over || !st.started) return;
      st.sel = id;
      Object.entries(rows).forEach(([k, r]) => r.classList.toggle("sel", String(k) === String(id)));
      out(byId(id).red ? "A black bar. Loupe it, lay the gauge on it, then say how it was made." : "Line selected. Loupe, field card or clock; then mark it.");
    };
    const refresh = () => {
      for (const l of real) {
        const r = rows[l.id], m = st.marks[l.id], bx = r.querySelector(".bx");
        bx.textContent = m || ""; bx.className = "bx " + (m || "");
        r.setAttribute("aria-label", `${l.time ? `D${l.day} ${l.time}. ` : ""}${l.text}${m ? `. Marked ${MARKS[m]}` : ""}`);
        const old = r.querySelector("." + P + "stamp"); if (old) old.remove();
        if (m) r.insertAdjacentHTML("beforeend", pic(STAMP[m], P + "stamp " + m, MARKS[m]) || (m === "H" ? "" : `<span class="${P}stamp ${m}">${m === "F" ? "FORGED" : "OTHER HAND"}</span>`));
      }
      for (const l of bars) { const r = rows[l.id], b = st.bars[l.id] || {}; r.innerHTML = barHTML(l); r.setAttribute("aria-label", `D${l.day} ${l.time}, a black bar${b.call ? `, called ${b.call === "surgical" ? "ruled" : "brushed"}` : b.gauged ? ", gauged" : ""}`); }
      const done = Object.keys(st.marks).length;
      const left = real.filter((l) => l.who === "forged" && st.marks[l.id] !== "F").length;
      const called = bars.filter((l) => (st.bars[l.id] || {}).call).length;
      $("." + P + "tally").innerHTML = `CHECKED<b>${done} / ${real.length}</b><small>BARS ${called} / ${bars.length}</small>${st.helped ? `<small style="color:#f3b4b4">${left} FORGED LEFT</small>` : ""}`;
      if (done >= 8 && !st.beats7) { st.beats7 = true; out("Halfway. Above the hideout, boots cross the grating and stop, and go on. Lira does not look up from the page.", null, true); }
    };
    const smallHand = (after, text) => { const a = document.createElement("span"); a.className = P + "reply a"; a.innerHTML = `${pic("bracket-small-hand")}<span></span>`; a.querySelector("span").textContent = text; after.after(a); return a; };
    const marginFor = (l) => {
      const row = rows[l.id]; if (st.margin[l.id] || row.nextElementSibling?.classList.contains(P + "margin")) return;
      const box = document.createElement("div"); box.className = P + "margin";
      box.innerHTML = `${pic("thread-own", "th", "A small left-slanted correction in blue-black ink")}<div>The small hand, in the margin. Answer it?</div>
        <button type="button" data-r="circle">Circle it</button><button type="button" data-r="0">“Then whose was it?”</button><button type="button" data-r="1">“Thank you. Who are you?”</button><button type="button" data-r="2">“Stay out of my book.”</button><button type="button" data-r="leave">Leave it</button>`;
      row.after(box);
      box.querySelectorAll("[data-r]").forEach((b) => on(b, "click", () => {
        const r = b.dataset.r; box.remove(); st.margin[l.id] = r;
        if (r === "leave") { out("You leave the note as it is.", null, true); return; }
        const rep = document.createElement("span"); rep.className = P + "reply";
        if (r === "circle") { st.circled++; rep.innerHTML = `${pic("bracket-pencil")}<span>${A.has("bracket-pencil") ? "" : "◯ "}Who wrote this?</span>`; row.after(rep); out("You circle it and write the question beside it, as you did on page 47.", null, true); return; }
        st.replies++; rep.innerHTML = `${pic("bracket-ink")}<span></span>`; rep.querySelector("span").textContent = "— " + b.textContent; row.after(rep);
        if (st.replies === 2) { smallHand(rep, "I can't say who. Not yet."); out("Under your second reply, while you were reading the other page, the small hand has answered.", null, true); }
        else out("You write your answer under the note. Whoever reads this book will read that too.", null, true);
      }));
    };
    // the bar gauge: lay it on a bar, then say how the bar was made
    const gaugeFor = (l) => {
      const row = rows[l.id], b = st.bars[l.id] || (st.bars[l.id] = {});
      b.gauged = true; refresh();
      if (b.call || row.nextElementSibling?.classList.contains(P + "margin")) return;
      const box = document.createElement("div"); box.className = P + "margin g";
      box.innerHTML = `<div>How was this bar made?</div><button type="button" data-c="surgical">Ruled: blue under the black</button><button type="button" data-c="clumsy">Brushed</button>`;
      row.after(box);
      box.querySelectorAll("[data-c]").forEach((q) => on(q, "click", () => {
        b.call = q.dataset.c; b.right = b.call === l.kind; box.remove(); refresh();
        if (l.kind === "surgical" && b.right) {
          const rep = document.createElement("span"); rep.className = P + "reply"; rep.innerHTML = `${pic("bracket-ink")}<span>The bar is ${l.mm}${T}mm long. I measured it. I do not know what else to do with it.</span>`; row.after(rep);
          out("A censor in a hurry does not rule a line to the millimetre. You write its length beside it, as you would any reading.", null, true);
          later(() => { if (st.over || !rep.isConnected) return; smallHand(rep, "I ruled that line. I am sorry for its length."); st.sorry = true; out("Under your measurement, in blue-black, slanted left: the small hand has written again.", null, true); }, api.reducedMotion ? 600 : 9000);
        } else if (b.right) out("Brushed: a wide wet stroke, laid on fast, by someone who only wanted the words gone.", null, true);
        else out(l.kind === "surgical" ? "Brushed, you write. But the edge under the gauge is straight, and there is a blue line beneath the black." : "Ruled, you write. But the gauge will not sit on it, and there is nothing under the black but paper.", null, true);
      }));
    };
    const mark = (m) => {
      if (st.sel == null || st.over) { out("Select a line first."); return; }
      if (byId(st.sel).red) { out("That is a bar, not a line. Lay the gauge on it (G)."); return; }
      const prev = st.marks[st.sel];
      st.marks[st.sel] = m; refresh();
      const r = rows[st.sel].querySelector("." + P + "stamp"); if (r && prev !== m && !api.reducedMotion) r.classList.add("new");
      const l = real.find((x) => x.id === st.sel);
      if (m === "O" && l.who === "arch") { marginFor(l); return; }
      const idx = real.findIndex((x) => x.id === st.sel);
      if (idx < real.length - 1) { select(real[idx + 1].id); rows[real[idx + 1].id].focus({ preventScroll: false }); }
    };
    // overlays: the four hands on file, and Pell's book
    const overlay = (html, focusSel) => {
      closeOverlay();
      const o = document.createElement("div"); o.className = P + "over"; o.innerHTML = html; el.appendChild(o); st.overlay = o;
      on(o, "click", (e) => { if (e.target === o || e.target.closest("[data-x]")) closeOverlay(); });
      const f = o.querySelector(focusSel || "[data-x]"); if (f) f.focus();
      return o;
    };
    const closeOverlay = () => { if (st.overlay) { st.overlay.remove(); st.overlay = null; if (st.sel != null && rows[st.sel]) rows[st.sel].focus(); } };
    const showHands = () => overlay(`<div class="${P}sheet" role="dialog" aria-label="The four hands on file"><h3>The four hands in this book</h3><p>Stroke sets, taken from pages nobody disputes. Put the loupe on a line, then compare.</p>
      <div class="${P}hands">${HANDS.map(([, id, n, d]) => `<figure>${pic(id, "", n)}<figcaption><b>${n.toUpperCase()}</b>${d}</figcaption></figure>`).join("")}</div><button type="button" data-x>Back to the file</button></div>`);
    const showPell = () => {
      const l = st.sel != null ? byId(st.sel) : null;
      const o = overlay(`<div class="${P}sheet" role="dialog" aria-label="Pell's book"><h3>Pell’s book</h3><p>Her copy of Book I, in capitals, made each evening at Hollin: every number as you said it that day, relay readings included. It never left the terrace until now, and nobody has corrected it.</p>
        <div class="${P}pell"><div class="pp"></div><div class="tx"><p class="cap" aria-live="polite"></p><div class="nav"><button type="button" class="q" data-pg="-1" aria-label="Previous page">◀</button><span></span><button type="button" class="q" data-pg="1" aria-label="Next page">▶</button></div>
        <p style="margin-top:10px">${l && l.book1 ? "The selected line says it was carried forward from Book I. Find her page for it." : "It can only speak for Book I. Lines carried forward from Book I can be checked against it."}</p></div></div>
        <button type="button" data-x>Close her book</button></div>`, "[data-pg='1']");
      const show = () => {
        const i = st.pellPg; st.pellSeen.add(i);
        o.querySelector(".pp").innerHTML = pic(`pell-page-${i + 1}`, "", PELL[i]) || `<div class="fb">${PELL[i]}</div>`;
        o.querySelector(".cap").textContent = PELL[i]; o.querySelector(".nav span").textContent = `PAGE ${i + 1} OF ${PELL.length}`;
      };
      o.querySelectorAll("[data-pg]").forEach((b) => on(b, "click", () => { st.pellPg = (st.pellPg + +b.dataset.pg + PELL.length) % PELL.length; show(); }));
      st.pellFlip = (d) => { st.pellPg = (st.pellPg + d + PELL.length) % PELL.length; show(); };
      show();
      out(l && l.book1 ? "Pell’s book, open beside the log. Her capitals against the line you selected." : "Pell’s book: DOCTOR SAYS, and then the number, every evening of Book I.", null, true);
    };
    const tool = (t) => {
      if (st.over || !st.started) return;
      if (t === "hands") { showHands(); return; }
      if (t === "pell") { showPell(); return; }
      if (st.sel == null) { out("Select a line first."); return; }
      const l = byId(st.sel);
      if (l.red) {
        if (t === "loupe") out(l.kind === "surgical" ? "Loupe: the edge is ruled. Under the black, a fine blue line runs past both ends. The ends are fibrous, but square." : "Loupe: brush hairs in the black, an edge that wanders, a dry tail at one end. Nothing under it but paper.", `<span style="display:block;width:150%;height:${l.kind === "surgical" ? 14 : 20}px;background:${BLACK};${l.kind === "surgical" ? `box-shadow:0 2px 0 ${ARCH},0 -2px 0 ${ARCH}` : "border-radius:40% 10% 60% 20%;transform:rotate(-3deg)"}"></span>`);
        else if (t === "gauge") { gaugeFor(l); out(l.kind === "surgical" ? `Bar gauge: ${l.mm} mm, end to end, and the same at both edges. A ruled line.` : "Bar gauge: it will not sit. The edge wanders between 38 and 52 mm."); }
        else if (t === "clock") out(`Clock: the bar sits at ${l.time}, between the lines either side. Whatever it covers was written in sequence.`, null, false, { id: "dial-clock", whole: true });
        else out("Field card: no card. Whatever was written here, it is under the bar.");
        return;
      }
      if (t === "gauge") { out("Bar gauge: nothing ruled here. It measures the black bars."); return; }
      if (t === "loupe") {
        const who = l.lens || l.who, hand = HANDS.find((h) => h[0] === who);
        const word = l.text.split(/\s+/).slice(-3).join(" ");
        const lens = l.who === "arch" ? `<span style="color:${ARCH};font-style:italic;transform:skewX(14deg)">${word}</span>` : who === "hers" ? word.replace(/7/g, `<span class="${P}x7">7</span>`) : word;
        out(`Loupe: ${l.loupe}`, lens, false, hand && { id: hand[1] });
      }
      if (t === "card") out(l.who === "arch" ? "Field card: no card. This is a note, not a reading." : l.card ? `Field card, as taken by hand: ${l.card}` : l.book1 ? "Field card: none. Book I’s cards went with the stolen log. Pell’s book is the only other copy." : "Field card: none filed for this line.");
      if (t === "clock") {
        if (!l.time) { out("Clock: no timestamp on this line."); return; }
        const day = LINES.filter((x) => x.day === l.day && x.time && !x.red);
        const i = day.indexOf(l), prev = day[i - 1], next = day[i + 1];
        const bad = (prev && prev.time > l.time) || (next && next.time < l.time);
        out(`Clock: ${prev ? prev.time + " → " : ""}[${l.time}]${next ? " → " + next.time : ""}. ${bad ? (prev && prev.time > l.time ? "Out of sequence: written after a later hour." : "The next line runs backward.") : "In sequence."}`, null, false, { id: "dial-clock", whole: true });
      }
    };
    el.querySelectorAll("[data-m]").forEach((b) => on(b, "click", () => mark(b.dataset.m)));
    el.querySelectorAll("[data-t]").forEach((b) => on(b, "click", () => tool(b.dataset.t)));
    on(window, "keydown", (e) => {
      if (!st.started || st.over) return;
      const k = e.key.toLowerCase();
      if (st.overlay) { if (e.key === "Escape") closeOverlay(); else if (st.overlay.querySelector("." + P + "pell") && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { st.pellFlip(e.key === "ArrowLeft" ? -1 : 1); e.preventDefault(); } return; }
      if (k === "h" || k === "f" || k === "o") { mark(k.toUpperCase()); e.preventDefault(); }
      else if (k === "l") tool("loupe"); else if (k === "c") tool("card"); else if (k === "t") tool("clock");
      else if (k === "g") tool("gauge"); else if (k === "p") tool("pell"); else if (k === "n") tool("hands");
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const i = LINES.findIndex((l) => l.id === st.sel), n = Math.max(0, Math.min(LINES.length - 1, (i < 0 ? -1 : i) + (e.key === "ArrowDown" ? 1 : -1)));
        select(LINES[n].id); rows[LINES[n].id].focus(); e.preventDefault();
      }
    });
    // the closing card: the file is stamped before the result is read
    const finish = (outcome, text, stamps) => {
      const s = stamps.filter((id) => A.has(id));
      if (!s.length) { api.end({ outcome, text }); return; }
      const f = document.createElement("div"); f.className = P + "fin";
      f.innerHTML = `<div class="in">${pic(s[0], "", "")}${s[1] ? pic(s[1], "s2", "") : ""}<div>Audit closed.</div></div>`;
      el.appendChild(f);
      later(() => api.end({ outcome, text }), api.reducedMotion ? 700 : 1700);
    };
    on($("[data-a=close]"), "click", () => {
      if (st.over) return;
      let caught = 0, missed = 0, falseAcc = 0, archOk = 0;
      const nF = real.filter((l) => l.who === "forged").length;
      for (const l of real) {
        const m = st.marks[l.id] || "H";
        if (l.who === "forged") m === "F" ? caught++ : missed++;
        else if (l.who === "hers") { if (m !== "H") falseAcc++; }
        else if (l.who === "arch") { if (m === "O") archOk++; else if (m === "F") falseAcc++; }
      }
      st.over = true; closeOverlay();
      const summary = `${caught} of ${nF} forgeries caught (nodes restored), ${missed} missed, ${falseAcc} true line${falseAcc === 1 ? "" : "s"} struck${archOk ? `, ${archOk} of 2 notes in the other hand recognised` : ""}.`;
      const margin = st.replies ? ` You answered the small hand ${st.replies === 1 ? "once" : "twice"}; the Continuum reads this book too, and now it knows someone writes back.` : st.circled ? " You circled the small hand's notes and asked, and left it there." : "";
      const sb = st.bars.b1 || {}, cb = st.bars.b2 || {};
      const barTxt = sb.right ? ` One bar on the left page was ruled, 41 mm, with blue under the black${st.sorry ? ", and the small hand has owned it" : ""}: the first you have measured${cb.right ? "; the other was only brushed" : ""}. A censor who rules a line to the millimetre means something by its length.` : sb.gauged || cb.gauged ? " You laid the gauge on a bar and wrote down the wrong kind; the bars stay black shapes on the page." : " The two black bars went unmeasured.";
      const n1 = real.find((l) => l.id === 16), pell = st.marks[16] === "F" ? " Pell’s capitals caught the line your own hand could not: DOCTOR SAYS 0.44." : n1 && st.pellSeen.size ? " Pell’s book was open on the table, and the line that misquotes Book I still stands." : "";
      if (missed === 0 && falseAcc === 0) { api.store.set("losses", 0); finish("win", `Audit closed. ${summary} Every forged line restored, nothing of hers doubted. The journal is hers again, line by line.${pell}${barTxt}${margin}`, ["stamp-restored", "seal-broken"]); }
      else if (missed + falseAcc >= 3) { api.store.set("losses", losses + 1); finish("lose", `Audit closed. ${summary} Too much of the record stays forged or doubted, and the nodes it names go into the dossier unverified.${barTxt}${margin}`, ["stamp-continuum", "stamp-sealed"]); }
      else finish("done", `Audit closed. ${summary} Most of the page is hers; the rest will follow her into the Peaks as it is.${pell}${barTxt}${margin}`, ["stamp-doubted", "seal-continuum-wax"]);
    });
    later(() => { if (!st.over) out("Lira's note: the left page holds the most of them. One keeps my hand but not my hour. And one quotes Book I: Pell would know.", null, true); }, 120000);

    const intro = document.createElement("div"); intro.className = P + "intro";
    intro.innerHTML = `<div class="${P}card" role="dialog" aria-label="How to play"><div class="pg">${pic("title-lettering", "ttl", "The Redacted Testament of Lira Calyx")}${pic("seal-broken", "sl")}<span class="cls">AUDIT</span>
      <h2>Journal Audit</h2>
      <p class="goal">Find every line someone else wrote in your journal, and strike nothing that is yours.</p>
      <table><tr><td>H</td><td>Hers: crossed sevens, Δ, a thin space before units</td></tr>
      <tr><td style="color:${SEAL}">F</td><td>Forged: “deg”, a flat voice, misspelled names, wrong hours</td></tr>
      <tr><td style="color:${ARCH}">O</td><td>Other hand: small, blue, slanted left</td></tr>
      <tr><td>L · C · T</td><td>Loupe, field card, clock: evidence for the selected line</td></tr>
      <tr><td>P · N</td><td>Pell’s book (her copy of Book I) · the four hands on file</td></tr>
      <tr><td>G</td><td>Bar gauge: measure a black bar, then say how it was made</td></tr></table>
      ${pic("bar-lifted", "lift", "A black bar, lifted")}
      ${losses >= 2 ? `<label><input type="checkbox" class="gentle" checked> Keep a count of the forgeries left</label>` : ""}
      <button type="button">Open the file</button></div></div>`;
    el.appendChild(intro);
    const sb = intro.querySelector("button");
    on(sb, "click", () => {
      const g = intro.querySelector(".gentle"); st.helped = !!(g && g.checked);
      intro.remove(); st.started = true; refresh(); select(real[0].id); rows[real[0].id].focus();
      out("Book III, the hideout. The stolen log came back to you overwritten with false timestamps and fabricated sensor readings. Pell’s copy-book of Book I lies beside it. Find their lines before they become your nodes.", null, true);
    });
    sb.focus();
    refresh();
    return { unmount() { timers.forEach(clearTimeout); off.forEach((f) => f()); } };
  },
};

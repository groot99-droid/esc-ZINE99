// The Endless Temple: what the six modes share for phase 3 (DEEP_DIVE.md section 3, "The long puzzle:
// Maudric's ledger and the Parting Cup", and "A second playthrough"). Not a mode of its own.
//
// The long puzzle. The ledger's last recipe is unfinished: "For leaving a book that is still going:
// sprig, and what the book gives back". Its pieces are gathered across the modes and written with
// api.shared:
//   ledger_turned  Tea Blending: the ledger turned over at the last pot (its back pages: the day count)
//   scraped_title  The Naming: the sand book's cartouche raked from all three sides ("The Desert That Ends")
//   sand_swept     Tea Blending or The Clasps: sand swept off the table into the ninth jar (gutter sand)
// When all three are in, the last pot in Tea Blending can be brewed for leaving: seer's sprig and two
// spoons of gutter sand at mark 3. That sets parting_cup (the puzzle solved) and counts a solve.
// Which ending the solve earns is the choice made at The Other Hand in the living illustration
// (other_hand_choice): looked away, The Unread Page; one more page, The Reader Who Stayed; not seen,
// The Named Book if Xandri rode past the mark, else The Son Returns.
// The second run: loading.js's finale records a finished run (runs_done) the first time the menu
// shows a solve's ending. From then on the modes read secondRun() and change (each mode says how).
// Narration here is written for the game (not quotations).

export const PIECES = [
  { key: "ledger_turned", name: "The ledger's back pages", art: "ledger-back-3-forty",
    got: "A count of days in the old keeper's hand, stopping at forty, the same day as the father's journal.",
    where: "Tea Blending: at the last pot, open the ledger and turn it over." },
  { key: "scraped_title", name: "The scraped title", art: "cartouche-c9",
    got: "Under the sand book's cartouche, scraped away: “The Desert That Ends”. He wanted it, and could not make it take.",
    where: "The Naming: on the sand book's page, rake the lamp across the cartouche from all three sides." },
  { key: "sand_swept", name: "A jar of swept sand", art: "label-gutter-sand",
    got: "The sand the book let fall, swept up instead of thrown out: gutter sand, in the ninth jar.",
    where: "Tea Blending or The Clasps: sweep the table, and the pan goes into the ninth jar." },
];

export function sharedOf(api) {
  return api && api.shared ? api.shared : { get: (k, d) => d, set() {} };
}
export const has = (s, key) => !!s.get(key, false) || (key === "sand_swept" && (s.get("jar_sand", 0) | 0) > 0);
export const piecesIn = (s) => PIECES.every((p) => has(s, p.key));
export const solved = (s) => !!s.get("parting_cup", false);
export const secondRun = (s) => (s.get("runs_done", 0) | 0) >= 1;

// The endings the web build can pay off. Text written for the game; the costs are DEEP_DIVE section 2's.
export const ENDINGS = {
  unread: { id: "unread_page", title: "The Unread Page", card: "ending-the-unread-page", letters: "ending-title-unread-page",
    text: "Sprig, and what the book gave back: the sand he had swept. Elaris set the Parting Cup on the cover, lifted his eyes at the herd, and did not look back; he closed the book on a boy who was still walking, and it was the first kind thing he had done to a story. He will never know what Xandri chose, or whether the desert ends, and the book can never be named. Months later one woody leaf slips from its pages." },
  stayed: { id: "reader_who_stayed", title: "The Reader Who Stayed", card: "ending-reader-who-stayed", letters: "ending-title-reader-who-stayed",
    text: "He brewed the one cup that lets a reader go, set it by the book, and turned one more page. The ringed hand had been there before him, and now it was his: Elaris is Maudric now. Xandri looked up out of the plate at the hand with the cup, and walked on without him. The clock struck the hour, and nobody wound it." },
  named: { id: "named_book", title: "The Named Book", card: "ending-named-book", letters: "ending-title-named-book",
    text: "The Parting Cup stood brewed on the table, and he never needed it: Xandri walked the gods' track past his father's mark, and Elaris named the book. A named book rests, and rest is stillness; the last plate holds the boy past the mark, mid-stride, for good. Elaris finished what Maudric could not, and the wind in that desert stopped." },
  returned: { id: "son_returns", title: "The Son Returns", card: "ending-son-returns", letters: "ending-title-son-returns",
    text: "The Parting Cup went cold beside a book nobody closed. Xandri turned back, and years later sits where the storyteller sat and tells the tale of an explorer who never found the end. The book stays nameless and keeps leaking sand, and Elaris sweeps every morning of an eternity." },
};

// Which ending the solve earns (null until the long puzzle is solved).
export function endingFor(s) {
  if (!solved(s)) return null;
  const seen = !!s.get("other_hand_seen", false), choice = s.get("other_hand_choice", null);
  if (seen && choice === "away") return ENDINGS.unread;
  if (seen && choice === "page") return ENDINGS.stayed;
  return s.get("passed_mark", false) ? ENDINGS.named : ENDINGS.returned;
}

// An ending's generated card behind a mode's result, with its tooled name under it. Falls back to the
// lettering alone, then to the plain name, when the card or the art is missing.
export function endingCard(root, api, e, note) {
  if (!e) return null;
  const P = "endless-temple-ledger-";
  ensureCss();
  const card = api && api.keyart ? api.keyart(e.card) : "";
  const art = (api && api.art) || { has: () => false, url: () => "" };
  const c = document.createElement("div");
  c.className = P + "endc";
  const fig = document.createElement("figure");
  if (card) { const im = document.createElement("img"); im.className = P + "card"; im.alt = `${e.title}: the ending's card.`; im.src = card; fig.appendChild(im); }
  if (art.has(e.letters)) { const im = document.createElement("img"); im.className = P + "letters"; im.alt = e.title; im.src = art.url(e.letters); fig.appendChild(im); }
  else { const b = document.createElement("b"); b.textContent = e.title; fig.appendChild(b); }
  if (note) { const p = document.createElement("figcaption"); p.textContent = note; fig.appendChild(p); }
  c.appendChild(fig);
  root.appendChild(c);
  return c;
}

let cssDone = null;
function ensureCss() {
  if (cssDone && cssDone.isConnected) return;
  const P = "endless-temple-ledger-";
  cssDone = document.createElement("style");
  cssDone.textContent = `
  .${P}endc{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:rgba(20,12,6,.88);padding:14px 16px 170px;box-sizing:border-box;overflow:auto}
  .${P}endc figure{margin:0;width:min(560px,100%);text-align:center;color:#f3ead2;font-family:'EB Garamond',Georgia,serif}
  .${P}endc img.${P}card{display:block;width:100%;height:auto;border:2px solid #9a6f1e;border-radius:4px;box-shadow:0 12px 34px rgba(0,0,0,.7)}
  .${P}endc img.${P}letters{display:block;width:min(420px,92%);height:auto;margin:-26px auto 0;position:relative;box-shadow:0 6px 16px rgba(0,0,0,.6)}
  .${P}endc b{display:block;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:24px;color:#f0d488;margin-top:8px}
  .${P}endc figcaption{font-style:italic;font-size:16px;margin-top:8px;line-height:1.35}
  .${P}btn{position:absolute;z-index:4;font:600 14px 'EB Garamond',Georgia,serif;color:#2b1d12;background:rgba(243,234,210,.94);border:1.5px solid #5a3d27;border-radius:16px;min-height:34px;padding:2px 10px 2px 6px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.35)}
  .${P}btn:hover,.${P}btn:focus-visible{outline:2px solid #d4a23a;outline-offset:2px}
  .${P}btn i,.${P}inbtn i{display:inline-flex;gap:2px;margin-right:5px;vertical-align:middle}
  .${P}btn i span,.${P}inbtn i span{width:7px;height:9px;border:1.2px solid #5a3d27;border-radius:1px}
  .${P}btn i span.${P}on,.${P}inbtn i span.${P}on{background:#d4a23a}
  .${P}btn[hidden]{display:none}
  .${P}ov{position:absolute;inset:0;z-index:9;display:grid;place-items:center;background:rgba(20,12,6,.8);padding:12px;box-sizing:border-box;overflow:auto}
  .${P}wrap{width:min(900px,100%)}
  .${P}nb{position:relative;width:100%;aspect-ratio:900/560;box-sizing:border-box;color:#2b1d12;font-family:'EB Garamond',Georgia,serif;background:#f3ead2 center/100% 100% no-repeat;border-radius:4px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
  .${P}nb h2{position:absolute;left:7.6%;top:6%;margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:26px;visibility:hidden}
  .${P}nb.${P}plain h2{visibility:visible}
  .${P}slip{position:absolute;width:35.8%;height:31.8%;display:flex;gap:10px;align-items:flex-start;padding:12px 14px;box-sizing:border-box;font-size:14.5px;line-height:1.28;overflow:hidden}
  .${P}slip:nth-of-type(1){left:8.2%;top:21.1%}.${P}slip:nth-of-type(2){left:53.8%;top:21.1%}.${P}slip:nth-of-type(3){left:8.2%;top:58.9%}.${P}slip:nth-of-type(4){left:53.8%;top:58.9%}
  .${P}slip img{flex:none;width:58px;height:58px;object-fit:cover;border:1px solid #5a3d27;border-radius:2px;background:#e2d4b2;transform:rotate(-2deg);box-shadow:0 2px 5px rgba(0,0,0,.35)}
  .${P}slip b{display:block;font-variant:small-caps;letter-spacing:.06em;font-size:16px}
  .${P}slip.${P}miss{opacity:.8}
  .${P}slip.${P}miss img{filter:grayscale(1) contrast(.6);opacity:.45}
  .${P}slip em{display:block;font-size:14px;color:#5a3d27}
  .${P}foot{margin:10px 2px 0;font-style:italic;font-size:15px;text-align:center;color:#f3ead2}
  .${P}close{display:block;margin:10px auto 0;font:600 15px 'EB Garamond',Georgia,serif;color:#2b1d12;background:#f3ead2;border:0;border-radius:16px;min-height:38px;padding:4px 18px;cursor:pointer}
  .${P}close:hover,.${P}close:focus-visible{outline:2px solid #d4a23a;outline-offset:2px}
  @media (max-width:780px){.${P}nb{aspect-ratio:auto;background-image:none!important;padding:14px 12px}.${P}nb h2{position:static;visibility:visible;font-size:22px;margin:0 0 6px}.${P}slip{position:static;width:auto;height:auto;margin:0 0 6px;border:1px dashed #cdbb93;overflow:visible}}
  `;
  document.head.appendChild(cssDone);
}

// The notebook: a small button in a mode's corner (J) opens Elaris's notebook page, with a slip
// pasted in for each piece gathered so far, and the answer's slot. Always reachable while a mode runs.
export function mountNotebook(root, api, opts = {}) {
  const P = "endless-temple-ledger-";
  ensureCss();
  const s = sharedOf(api);
  const art = (api && api.art) || { has: () => false, url: () => "" };
  const btn = document.createElement("button");
  btn.type = "button";
  if (opts.into) { btn.className = P + "inbtn"; opts.into.appendChild(btn); }   // a mode's own control row
  else { btn.className = P + "btn"; Object.assign(btn.style, opts.at || { left: "8px", bottom: "8px" }); root.appendChild(btn); }
  let ov = null;
  function label() {
    const n = PIECES.filter((p) => has(s, p.key)).length;
    btn.innerHTML = `<i aria-hidden="true">${PIECES.map((p) => `<span class="${has(s, p.key) ? P + "on" : ""}"></span>`).join("")}</i>`;
    btn.append(opts.short ? "Notebook" : "Notebook (J)");
    btn.setAttribute("aria-label", `Elaris's notebook: ${n} of ${PIECES.length} pieces of the unfinished recipe. Key J.`);
  }
  function open() {
    if (ov) return;
    ov = document.createElement("div");
    ov.className = P + "ov";
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Elaris's notebook");
    const nb = document.createElement("div");
    nb.className = P + "nb";
    if (art.has("notebook-pieces")) nb.style.backgroundImage = `url("${art.url("notebook-pieces")}")`; else nb.classList.add(P + "plain");
    nb.innerHTML = `<h2>What the book gives back</h2>`;
    const grid = nb;
    const wrap = document.createElement("div"); wrap.className = P + "wrap";
    wrap.appendChild(nb);
    wrap.insertAdjacentHTML("beforeend", `<p class="${P}foot"></p><button type="button" class="${P}close">Close the notebook (Esc)</button>`);
    const slip = (ok, artId, name, body) => {
      const d = document.createElement("div");
      d.className = P + "slip" + (ok ? "" : " " + P + "miss");
      d.innerHTML = `${art.has(artId) ? `<img src="${art.url(artId)}" alt="">` : ""}<div><b></b><span></span></div>`;
      d.querySelector("b").textContent = name; d.querySelector("span").textContent = body;
      return d;
    };
    for (const p of PIECES) {
      const ok = has(s, p.key);
      const d = slip(ok, p.art, p.name, ok ? p.got : "Not pasted in yet.");
      if (!ok) { const em = document.createElement("em"); em.textContent = p.where; d.querySelector("div").appendChild(em); }
      grid.appendChild(d);
    }
    const done = solved(s), all = piecesIn(s);
    grid.appendChild(slip(done, "label-seers-sprig", done ? "The Parting Cup" : "The unfinished recipe",
      done ? "Sprig, gutter sand, gutter sand, at mark 3: the only cup that lets a reader close a book that is still going."
        : all ? "All three are pasted in. In Tea Blending the last pot can be brewed for leaving: sprig, and what the book gives back."
          : "“For leaving a book that is still going: sprig, and what the book gives back”. The rest is in the pieces."));
    const e = endingFor(s);
    wrap.querySelector("." + P + "foot").textContent = e ? `The cup is brewed. How it ends is in the game's menu: ${e.title}.`
      : secondRun(s) ? "A second reading: the ledger opens at the back now, and the eyes can be lifted from the first plate." : "Paste in what each book gives back.";
    ov.appendChild(wrap);
    root.appendChild(ov);
    const cl = wrap.querySelector("." + P + "close");
    cl.addEventListener("click", close);
    ov.addEventListener("click", (ev) => { if (ev.target === ov) close(); });
    cl.focus();
  }
  function close() { if (!ov) return; ov.remove(); ov = null; label(); btn.focus(); }
  btn.addEventListener("click", () => (ov ? close() : open()));
  btn.addEventListener("pointerdown", (e) => e.stopPropagation());
  const onKey = (e) => {
    const k = (e.key || "").toLowerCase();
    if (ov) {
      if (k === "escape" || k === "j") close();
      if (e.type === "keydown" && k === "tab") return;   // keep focus moving inside the page
      e.stopImmediatePropagation(); e.preventDefault();
      return;
    }
    if (k === "j" && e.type === "keydown" && !e.repeat && !btn.hidden) { e.stopImmediatePropagation(); e.preventDefault(); open(); }
  };
  addEventListener("keydown", onKey, true);
  const onUp = (e) => { if (ov) { e.stopImmediatePropagation(); } };
  addEventListener("keyup", onUp, true);
  label();
  return {
    refresh: label,
    hide(h) { btn.hidden = !!h; },
    isOpen: () => !!ov,
    unmount() { removeEventListener("keydown", onKey, true); removeEventListener("keyup", onUp, true); if (ov) ov.remove(); btn.remove(); },
  };
}

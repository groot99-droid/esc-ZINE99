// The Stuffed Ones: what the six modes share for phase 2 (DESIGN.md section 21). Not a mode.
//
// The ladder: every mode is a run of three stages, Teach, Test and Twist. A stage that is won offers
// the next one or lets the player stop there with a result; the stage reached is remembered
// (api.store "stage"), so a returning player starts where they got to and may pick an earlier one.
//
// The layer links (api.shared, storage shared by this game's modes; every reader has a default, so a
// mode works when the others were never played):
//   strap    "strong" | "fair" | "poor"   Stitchwork, Marcus's strap  -> Labyrinth: his marks as chalk
//   lila_hum true | false                 Stuffing, "Lila's hum" kept -> Dollhouse: Lila does not walk
//   it       "noor" | "wes" | "ana"       Parlour, the guest made It  -> Dollhouse: who wedged the chair
//   jamie    "mended" | "open"            Stitchwork, Jamie's Seam    -> (3D; written into the design)
//   glossary [words]                      Ruth's marks met in any mode -> The Hand-Sewn Book, the backs
//
// Phase 3 (DESIGN.md section 21, built 2026-11-16): the long puzzle, the selvage. Ruth's sentence is six
// lines. The book holds three on its backs (spreads I, III and V); she copied the other three onto her
// own tissue patterns, which turn up in Stuffing (under your pattern), the Dollhouse (the cupboard
// shelf) and Parlour (under the cloth's hem). Stitchwork's ripper uncovers Mabel's pencil key to three
// marks. Each piece is written here; the selvage view (the button on every how-to card) shows what is
// gathered. The Labyrinth's last stage is where it is set in order and paid off.
//   selvage  [line numbers]   pieces gathered        selvage_read true   set in order at the threshold
//   threshold "in" | "held"   walked in, or held     page [marks]        the line sewn in The Page
//   turns    n                finished runs (a selvage paid off); 1 or more is a second playthrough
const P = "stuffed-ones-stage-";
export const BACK_ART = { seven: "glyph-back-01-seven", play: "glyph-back-02-play", stay: "glyph-back-03-stay", warm: "glyph-back-04-warm", cold: "glyph-back-05-cold", company: "glyph-back-06-company",
  still: "glyph-back-07-still", go: "glyph-back-08-go", unpick: "glyph-back-09-unpick", cut: "glyph-back-10-cut", i: "glyph-back-11-i", mother: "glyph-back-12-mother", hunger: "glyph-back-13-hunger", home: "glyph-back-14-home" };
// Ruth's six lines in her order (games/stuffed-ones/data/book.json, backs.lines), and where each is found.
export const LINES = [
  { n: 1, marks: ["i", "seven", "still", "play"], reads: "I am seven still. I play.", where: "The Hand-Sewn Book: the back of spread I", sheet: null },
  { n: 2, marks: ["mother", "cut", "i", "warm"], reads: "Mother cut me warm.", where: "Stuffing: under your own pattern, the second night", sheet: "ruth-pattern-1-seven" },
  { n: 3, marks: ["hunger", "play", "company", "stay", "i", "warm"], reads: "When the hunger plays, company stays, and I am warm.", where: "The Hand-Sewn Book: the back of spread III", sheet: null },
  { n: 4, marks: ["company", "go", "i", "cold", "mother", "cut"], reads: "When company goes I am cold, and Mother cuts again.", where: "Dollhouse: the linen cupboard's shelf, night two", sheet: "ruth-pattern-2-larger" },
  { n: 5, marks: ["unpick", "seven", "cut", "mother", "still", "i", "go", "home"], reads: "Unpick the seven; cut while Mother is still; I go home.", where: "The Hand-Sewn Book: the back of spread V", sheet: null },
  { n: 6, marks: ["i", "go", "cold", "play", "stay", "still", "company", "home"], reads: "I go cold. The play stays still. Company goes home.", where: "Parlour: under the cloth's hem, lying beside the board", sheet: "ruth-pattern-4-recut" },
];
export const ALL_MARKS = Object.keys(BACK_ART);
export const STAGES = ["Teach", "Test", "Twist"];

export function stageKit(api) {
  const clamp = (n) => Math.max(0, Math.min(2, n | 0));
  const get = (k, d) => { try { const v = api.shared ? api.shared.get(k, d) : d; return v === undefined || v === null ? d : v; } catch { return d; } };
  const set = (k, v) => { try { if (api.shared) api.shared.set(k, v); } catch { /* storage off */ } };
  return {
    reached: () => { try { return clamp(api.store.get("stage", 0)); } catch { return 0; } },
    reach(n) { try { if (clamp(n) > clamp(api.store.get("stage", 0))) api.store.set("stage", clamp(n)); } catch { /* storage off */ } },
    get, set,
    knows: (w) => { const gl = get("glossary", []); return Array.isArray(gl) && gl.includes(w); },
    // the selvage: a piece gathered (a line number), the pieces so far, and whether this is a later run
    piece(n) {
      const have = get("selvage", []), list = Array.isArray(have) ? have.slice() : [];
      if (list.includes(n)) return false;
      set("selvage", list.concat([n]).sort((a, b) => a - b)); return true;
    },
    pieces() { const v = get("selvage", []); return Array.isArray(v) ? v.filter((n) => n >= 1 && n <= 6) : []; },
    turns() { const v = get("turns", 0); return typeof v === "number" && v > 0 ? v : 0; },
    // Ruth's marks met outside the book: returns the ones that were new
    learn(words) {
      const gl = get("glossary", []), have = Array.isArray(gl) ? gl.slice() : [];
      const fresh = words.filter((w) => !have.includes(w));
      if (fresh.length) set("glossary", have.concat(fresh));
      return fresh;
    },
  };
}

function css(pal) {
  const bg = pal.bg || "#2a211b", fg = pal.fg || "#f6f1e4", ac = pal.accent || "#e39a2d";
  return `<style>
.${P}veil{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:16px;background:rgba(29,23,18,.72);overflow:auto;font-family:Karla,Arial,sans-serif}
.${P}card{width:min(470px,100%);box-sizing:border-box;background:${fg};color:${bg};border:2px solid ${bg};outline:2px dashed ${ac};outline-offset:-9px;padding:22px 24px 20px;box-shadow:0 10px 0 rgba(0,0,0,.25)}
.${P}card small{display:block;font:700 12px Karla,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.75}
.${P}card h3{margin:4px 0 8px;font:400 28px/1.1 'IM Fell English',Georgia,serif}
.${P}card p{margin:0 0 10px;font:15px/1.5 Karla,Arial,sans-serif}
.${P}card p.${P}next{font:italic 16px/1.4 'IM Fell English',Georgia,serif;border-top:1.5px dashed ${bg};padding-top:10px}
.${P}card div{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.${P}card button{font:600 15px Karla,Arial,sans-serif;min-height:46px;padding:10px 18px;cursor:pointer;border:2px solid ${bg};background:${bg};color:${fg}}
.${P}card button+button{background:transparent;color:${bg}}
.${P}card button:focus-visible{outline:3px solid ${ac};outline-offset:2px}
.${P}pick{display:flex;gap:6px;margin:12px 0 0;flex-wrap:wrap}
.${P}pick button{flex:1 1 30%;min-width:0;min-height:44px;margin:0!important;padding:6px 8px!important;font:600 13px Karla,Arial,sans-serif!important;background:transparent!important;color:inherit!important;border:1.5px dashed currentColor!important;outline:0!important;border-radius:0!important;box-shadow:none!important;cursor:pointer;text-align:left;line-height:1.25;display:block!important}
.${P}pick button b{display:block;font:700 11px Karla,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}
.${P}pick button[aria-pressed=true]{border-style:solid!important;background:rgba(42,33,27,.88)!important;color:#f6f1e4!important}
.${P}pick button:disabled{opacity:.42;cursor:not-allowed}
.${P}pick button:focus-visible{outline:3px solid ${ac}!important;outline-offset:1px}
.${P}note{position:absolute;left:50%;transform:translateX(-50%);bottom:74px;z-index:7;width:min(440px,calc(100% - 28px));box-sizing:border-box;background:${bg};color:${fg};border-left:6px solid ${ac};padding:9px 14px;font:italic 15px/1.4 'IM Fell English',Georgia,serif;pointer-events:none;transition:opacity .6s;box-shadow:0 4px 12px rgba(0,0,0,.4)}
button.${P}selv{display:block!important;width:100%!important;margin:10px 0 0!important;min-height:44px;font:600 13px Karla,Arial,sans-serif!important;text-align:left;padding:8px 12px!important;cursor:pointer;background:rgba(246,241,228,.5)!important;color:#2a211b!important;border:1.5px solid #b8322a!important;border-left-width:6px!important;border-radius:0!important;outline:0!important;box-shadow:none!important}
button.${P}selv:focus-visible{outline:3px solid ${ac}!important;outline-offset:2px}
.${P}sv{z-index:30}
.${P}book{width:min(560px,100%)}
.${P}book ol{margin:6px 0 0;padding:0 0 0 22px;max-height:min(56vh,520px);overflow:auto}
.${P}book li{margin:0 0 10px;font:14px/1.35 Karla,Arial,sans-serif}
.${P}book li.${P}miss{opacity:.62;font-style:italic}
.${P}marks{display:flex;flex-wrap:wrap;gap:4px;margin:0}
.${P}marks figure{margin:0;width:40px;text-align:center}
.${P}marks img{width:40px;height:48px;display:block;object-fit:cover;object-position:top;border:1px solid rgba(0,0,0,.25)}
.${P}marks figcaption{font:600 11px Karla,Arial,sans-serif;color:#b8322a}
.${P}book q{display:block;margin:4px 0 0;font:italic 16px/1.35 'IM Fell English',Georgia,serif;color:#b8322a}
.${P}found{display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:start}
.${P}found img{grid-row:span 2;width:54px;height:74px;object-fit:cover;border:1px solid ${ac}}
.${P}note b{font:700 11px Karla,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;display:block;font-style:normal;opacity:.8}
</style>`;
}

// The three stage buttons on a mode's how-to card. `host` is an element inside the card.
export function stagePicker(host, api, stage, blurbs, onPick) {
  const S = stageKit(api), reached = S.reached();
  const row = document.createElement("div");
  row.className = P + "pick"; row.setAttribute("role", "group"); row.setAttribute("aria-label", "Stage");
  row.innerHTML = css(api.palette || {});
  STAGES.forEach((nm, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.stage = String(i);
    b.setAttribute("aria-pressed", String(i === stage));
    b.disabled = i > reached;
    const t = document.createElement("b"); t.textContent = `${i + 1} · ${nm}`;
    b.append(t, document.createTextNode(i > reached ? "win the stage before" : blurbs[i]));
    b.addEventListener("click", () => { if (i !== stage) onPick(i); });
    row.appendChild(b);
  });
  host.appendChild(row);
  selvageButton(host, api);
  return row;
}

// The selvage: a small notebook page of Ruth's six lines, the ones gathered in her red wool. Reachable
// from every mode's how-to card and from the card between stages.
export function selvageButton(host, api) {
  const S = stageKit(api), n = S.pieces().length;
  const b = document.createElement("button");
  b.type = "button"; b.className = P + "selv";
  b.innerHTML = css(api.palette || {});
  b.append(document.createTextNode(n ? `Ruth's selvage · ${n} of 6 lines` : "Ruth's selvage · nothing yet"));
  b.addEventListener("click", (e) => { e.preventDefault(); selvageView(host.closest(".play") || host.closest("[class$='-wrap']") || document.body, api); });
  host.appendChild(b);
  return b;
}
export function selvageView(root, api) {
  const S = stageKit(api), got = S.pieces(), art = api.art;
  const known = (w) => S.knows(w) || S.get("selvage_read", false) === true;
  const veil = document.createElement("div");
  veil.className = P + "veil " + P + "sv";
  veil.innerHTML = css(api.palette || {}) + `<div class="${P}card ${P}book" role="dialog" aria-label="Ruth's selvage"><small>The selvage · ${got.length} of 6 lines</small><h3>Ruth's sentence</h3><p>Her lines, in red wool, read right to left. A mark you have met elsewhere names itself.</p><ol></ol><div><button type="button">Close</button></div></div>`;
  const ol = veil.querySelector("ol");
  LINES.forEach((ln) => {
    const li = document.createElement("li");
    if (!got.includes(ln.n)) { li.className = P + "miss"; li.textContent = `Not found yet · ${ln.where}`; ol.appendChild(li); return; }
    const marks = document.createElement("span"); marks.className = P + "marks";
    ln.marks.slice().reverse().forEach((w) => {
      const f = document.createElement("figure");
      const u = art && art.has && art.has(BACK_ART[w]) ? art.url(BACK_ART[w]) : "";
      if (u) { const im = document.createElement("img"); im.src = u; im.alt = ""; f.appendChild(im); }
      const c = document.createElement("figcaption"); c.textContent = known(w) ? (w === "i" ? "I" : w) : "?";
      f.appendChild(c); marks.appendChild(f);
    });
    li.appendChild(marks);
    if (ln.marks.every(known)) { const q = document.createElement("q"); q.textContent = ln.reads; li.appendChild(q); }
    ol.appendChild(li);
  });
  const close = () => { veil.remove(); document.removeEventListener("keydown", esc, true); };
  const esc = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
  document.addEventListener("keydown", esc, true);
  veil.querySelector("button").addEventListener("click", close);
  veil.addEventListener("click", (e) => { if (e.target === veil) close(); });
  root.appendChild(veil);
  veil.querySelector("button").focus();
  return { close };
}

// A piece of the selvage found: a strip with the sheet's picture and the line in her marks.
export function foundNote(wrap, api, n, ms = 9000) {
  const S = stageKit(api), fresh = S.piece(n), ln = LINES[n - 1];
  const el = document.createElement("div");
  el.className = P + "note " + P + "found"; el.setAttribute("role", "status");
  el.innerHTML = css(api.palette || {});
  if (ln.sheet && api.art && api.art.has && api.art.has(ln.sheet)) { const im = document.createElement("img"); im.src = api.art.url(ln.sheet); im.alt = ""; el.appendChild(im); }
  const b = document.createElement("b"); b.textContent = fresh ? `A piece of the selvage · ${S.pieces().length} of 6` : "A piece of the selvage, again";
  el.append(b, document.createTextNode(`Ruth's line ${n}, in red wool along the edge of her pattern, copied from the back of the book. It is in your selvage now.`));
  wrap.appendChild(el);
  const t1 = setTimeout(() => { el.style.opacity = "0"; }, ms);
  const t2 = setTimeout(() => el.remove(), ms + 700);
  return { fresh, remove() { clearTimeout(t1); clearTimeout(t2); el.remove(); } };
}

// A quiet strip that says a layer link has fired: "Because you ... in ...".
export function linkNote(wrap, api, text, ms = 7000) {
  const el = document.createElement("div");
  el.className = P + "note"; el.setAttribute("role", "status");
  el.innerHTML = css(api.palette || {});
  const b = document.createElement("b"); b.textContent = "The layers touch";
  el.append(b, document.createTextNode(text));
  wrap.appendChild(el);
  const t1 = setTimeout(() => { el.style.opacity = "0"; }, ms);
  const t2 = setTimeout(() => el.remove(), ms + 700);
  return { remove() { clearTimeout(t1); clearTimeout(t2); el.remove(); } };
}

// Run a mode as three stages. `run(root, api, flow)` builds one stage and returns { unmount }.
//   flow.stage   0, 1 or 2
//   flow.first   true when the how-to card should show (the mode has just been opened)
//   flow.pick(n) restart on stage n, from the how-to card
//   flow.done({ outcome, text })   a stage ended: a win below the twist offers the next stage
//   flow.S       stageKit(api)
export function runStages(root, api, run, blurbs) {
  const S = stageKit(api);
  let cur = null, veil = null, dead = false;
  function clear() {
    if (veil) { veil.remove(); veil = null; }
    if (cur) { try { cur.unmount(); } catch (e) { console.error(e); } cur = null; }
  }
  function start(stage, first) {
    clear();
    if (dead) return;
    const flow = {
      stage, first, S, blurbs,
      pick(n) { start(Math.max(0, Math.min(S.reached(), n)), true); },
      done(result) {
        if (dead) return;
        if (!result || result.outcome !== "win" || stage >= 2) {
          if (result && result.outcome === "win" && stage >= 2) { try { api.store.set("twist_won", true); } catch { /* storage off */ } }
          api.end(result || {});
          return;
        }
        S.reach(stage + 1);
        veil = document.createElement("div");
        veil.className = P + "veil";
        veil.innerHTML = css(api.palette || {}) + `<div class="${P}card" role="dialog" aria-label="Stage won"><small></small><h3></h3><p></p><p class="${P}next"></p><div><button type="button" data-go="next"></button><button type="button" data-go="stop">Stop here</button></div></div>`;
        veil.querySelector("small").textContent = `Stage ${stage + 1} of 3 · ${STAGES[stage]}`;
        veil.querySelector("h3").textContent = stage === 0 ? "You have the rule." : "The rule held.";
        veil.querySelector("p").textContent = result.text || "";
        veil.querySelector("." + P + "next").textContent = `Next, ${STAGES[stage + 1].toLowerCase()}: ${blurbs[stage + 1]}`;
        const go = veil.querySelector('[data-go="next"]');
        go.textContent = `Go on: ${STAGES[stage + 1]}`;
        go.addEventListener("click", () => start(stage + 1, false));
        veil.querySelector('[data-go="stop"]').addEventListener("click", () => { if (veil) { veil.remove(); veil = null; } api.end(result); });
        selvageButton(veil.querySelector("." + P + "card"), api);
        root.appendChild(veil);
        go.focus();
      },
    };
    try { cur = run(root, api, flow) || null; }
    catch (e) { console.error(e); root.innerHTML = `<div class="err">This mode failed to start: ${String(e.message || e)}</div>`; }
  }
  start(S.reached(), true);
  return { unmount() { dead = true; clear(); } };
}

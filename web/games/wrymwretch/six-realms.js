// WrymWretch · Six Realms (1D, Byzantine mosaic). DESIGN.md section 11, Six Realms.
// One match: s_realms_syndicate, against the Syndicate Elder (elder: Dark, Water, Sky; player:
// Dark, Earth, Wood; no house rule; depth-2 AI that makes one deliberate error; a tutorial note on
// the first two turns). 19 hexes; Wrymreach at the centre, six Thresholds, twelve homes. The
// forgetting tide voids one home hex after every third round (marked a round ahead). Recall once a
// game from the centre. Win: end a turn on the centre while also holding a Threshold; or take all
// three; or after 16 rounds hold more Thresholds (a tie goes to the elder). Undo once. Ilvarra
// names the threat after each of the elder's moves. Board and pieces: data/six_realms.json.
// Refinements: from round 9 the tide quickens and forgets every second round (the Tidecallers' house
// rule, borrowed as this match's late twist); the last move is outlined; the elder's remarks and the
// scene's beats are written into the turn log. After two losses in a row the elder allows two undos
// and makes two mistakes (api.store).
// Quoted on the win, verbatim as DESIGN.md section 3 quotes them (creative-writing/vault/02_Novels/02_WrymWretch.md):
//   "When the last memory fades, the Astral Architect shall rise." (WW 77)
//   "Shallock Izladar. A name the world was trying to forget." (WW 79)

const GOLD = "#c9a33a", GOLDDK = "#8a6a1c", BONE = "#f3eee2", OBS = "#1a1520", RED = "#8b2a20";
const REALM_COL = { north: "#a9c8e4", above: "#d4a72c", east: "#1f5f8b", south: "#c88a2e", below: "#5b3a7a", west: "#4f6b2e", centre: "#e9e1cc" };
const TRIBE = { wood: "west", sky: "north", earth: "south", water: "east", dark: "below", celestial: "above" };
const NAMES = { wood: "Wood", sky: "Sky", earth: "Earth", water: "Water", dark: "Dark", celestial: "Celestial" };
const HEXES = [
  ["centre", 0, 0], ["threshold_north", 0, -1], ["threshold_above", 1, -1], ["threshold_east", 1, 0], ["threshold_south", 0, 1], ["threshold_below", -1, 1], ["threshold_west", -1, 0],
  ["home_north_a", 0, -2], ["home_north_b", 1, -2], ["home_above_a", 2, -2], ["home_above_b", 2, -1], ["home_east_a", 2, 0], ["home_east_b", 1, 1],
  ["home_south_a", 0, 2], ["home_south_b", -1, 2], ["home_below_a", -2, 2], ["home_below_b", -2, 1], ["home_west_a", -2, 0], ["home_west_b", -1, -1],
].map(([id, q, r]) => { const [kind, realm] = id === "centre" ? ["centre", "centre"] : id.split("_"); return { id, q, r, kind, realm, key: q + "," + r }; });
const HEX = Object.fromEntries(HEXES.map((h) => [h.key, h]));
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const K = (q, r) => q + "," + r;
const dist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
const ROUNDS = 16, QUICKEN = 9;
const every = (round) => (round >= QUICKEN ? 2 : 3);
const other = (s) => (s === "p" ? "e" : "p");
const hexName = (key) => { const h = HEX[key]; if (!h) return "?"; const R = h.realm[0].toUpperCase() + h.realm.slice(1); return h.kind === "centre" ? "Wrymreach" : h.kind === "threshold" ? `the ${R} Threshold` : `${/^[AEIOU]/.test(R) ? "an" : "a"} ${R} home`; };

// ---- rules (pure; the AI plays them too) -------------------------------------------------------
function initial() {
  const P = (id, side, tribe, q, r) => ({ id, side, tribe, q, r, alive: true, rev: tribe !== "dark", stones: tribe === "earth" ? 2 : 0 });
  return {
    pieces: [P("p_dark", "p", "dark", -1, 2), P("p_earth", "p", "earth", 0, 2), P("p_wood", "p", "wood", 1, 1),
      P("e_dark", "e", "dark", 0, -2), P("e_water", "e", "water", 1, -2), P("e_sky", "e", "sky", -1, -1)],
    groves: {}, stones: [], voids: [], tideNext: null, round: 1, turn: "p", recall: { p: false, e: false }, winner: null, reason: "",
  };
}
const at = (s, key) => s.pieces.find((p) => p.alive && K(p.q, p.r) === key);
const isHome = (key) => HEX[key] && HEX[key].kind === "home";
function protectedPiece(s, p) {
  const key = K(p.q, p.r);
  if (p.tribe === "earth" && isHome(key)) return true;
  return s.pieces.some((c) => c.alive && c.side === p.side && c.tribe === "celestial" && c !== p && dist(c, p) === 1);
}
function enterable(s, key, side) {
  if (!HEX[key] || s.stones.includes(key) || s.voids.includes(key)) return false;
  const gr = s.groves[key];
  return !(gr && gr.side !== side);
}
function genMoves(s, side) {
  const out = [];
  const mine = s.pieces.filter((p) => p.alive && p.side === side);
  const dest = (p, key) => {
    if (!enterable(s, key, side)) return;
    const o = at(s, key);
    if (!o) out.push({ type: "move", pid: p.id, to: key });
    else if (o.side !== side && !protectedPiece(s, o)) out.push({ type: "move", pid: p.id, to: key, cap: o.id });
  };
  for (const p of mine) {
    if (p.tribe === "sky") {
      for (const [dq, dr] of DIRS) for (let n = 1; n <= 3; n++) {
        const key = K(p.q + dq * n, p.r + dr * n);
        if (!HEX[key] || s.stones.includes(key)) break;
        dest(p, key);
      }
    } else if (p.tribe === "water") {
      const seen = new Set([K(p.q, p.r)]); let front = [p];
      for (let n = 0; n < 2; n++) {
        const next = [];
        for (const f of front) for (const [dq, dr] of DIRS) {
          const key = K(f.q + dq, f.r + dr); if (seen.has(key) || !HEX[key]) continue; seen.add(key);
          dest(p, key);
          if (enterable(s, key, side) && !at(s, key)) next.push({ q: f.q + dq, r: f.r + dr });
        }
        front = next;
      }
      for (const [dq, dr] of DIRS) {   // push an adjacent piece 1 hex instead of capturing
        const o = at(s, K(p.q + dq, p.r + dr)); if (!o || o.side === side) continue;
        const to = K(o.q + dq, o.r + dr);
        if (HEX[to] && !s.stones.includes(to) && !at(s, to)) out.push({ type: "push", pid: p.id, target: o.id, to });
      }
    } else {
      for (const [dq, dr] of DIRS) dest(p, K(p.q + dq, p.r + dr));
    }
    if (p.tribe === "dark") for (const f of mine) if (f !== p && dist(f, p) <= 2) out.push({ type: "swap", pid: p.id, other: f.id });
    if (p.tribe === "earth" && p.stones > 0) for (const [dq, dr] of DIRS) {
      const key = K(p.q + dq, p.r + dr);
      if (HEX[key] && key !== "0,0" && !s.stones.includes(key) && !s.voids.includes(key) && !at(s, key)) out.push({ type: "stone", pid: p.id, at: key });
    }
  }
  if (!s.recall[side] && mine.some((p) => p.q === 0 && p.r === 0)) {
    const lost = s.pieces.filter((p) => !p.alive && p.side === side);
    if (lost.length) for (const h of HEXES) if (h.kind === "home" && !s.voids.includes(h.key) && !s.stones.includes(h.key) && !at(s, h.key)) out.push({ type: "recall", pid: lost[0].id, at: h.key });
  }
  return out;
}
const thresholds = (s, side) => s.pieces.filter((p) => p.alive && p.side === side && HEX[K(p.q, p.r)].kind === "threshold").length;
function apply(s0, side, m) {
  const s = JSON.parse(JSON.stringify(s0));
  const p = s.pieces.find((x) => x.id === m.pid);
  if (m.type === "move") {
    const from = K(p.q, p.r);
    if (m.cap) { const o = s.pieces.find((x) => x.id === m.cap); o.alive = false; if (p.tribe === "dark") p.rev = true; }
    if (p.tribe === "wood") s.groves[from] = { side, ttl: 2 };
    [p.q, p.r] = m.to.split(",").map(Number);
  } else if (m.type === "push") {
    const o = s.pieces.find((x) => x.id === m.target);
    [o.q, o.r] = m.to.split(",").map(Number);
    if (s.voids.includes(m.to) && o.tribe !== "earth") o.alive = false;
  } else if (m.type === "swap") {
    const o = s.pieces.find((x) => x.id === m.other);
    [p.q, o.q] = [o.q, p.q]; [p.r, o.r] = [o.r, p.r];
  } else if (m.type === "stone") {
    s.stones.push(m.at); p.stones--;
  } else if (m.type === "recall") {
    p.alive = true; [p.q, p.r] = m.at.split(",").map(Number); s.recall[side] = true;
  }
  // a hidden Dark piece shows when an enemy stands next to it
  for (const d of s.pieces) if (d.alive && d.tribe === "dark" && !d.rev && s.pieces.some((o) => o.alive && o.side !== d.side && dist(o, d) === 1)) d.rev = true;
  const alive = (sd) => s.pieces.filter((x) => x.alive && x.side === sd).length;
  const onCentre = s.pieces.some((x) => x.alive && x.side === side && x.q === 0 && x.r === 0);
  if (onCentre && thresholds(s, side) > 0) { s.winner = side; s.reason = "centre"; }
  else if (!alive(other(side))) { s.winner = side; s.reason = "taken"; }
  for (const k of Object.keys(s.groves)) if (s.groves[k].side !== side && --s.groves[k].ttl <= 0) delete s.groves[k];
  if (!s.winner && side === "e") {
    const ev = every(s.round);
    if (s.round % ev === ev - 1 && !s.tideNext) {
      const pool = HEXES.filter((h) => h.kind === "home" && !s.voids.includes(h.key));
      if (pool.length) s.tideNext = pool[(s.round * 7 + 3 + s.voids.length * 5) % pool.length].key;
    }
    if (s.round % ev === 0 && s.tideNext) {
      const v = at(s, s.tideNext);
      if (v && v.tribe !== "earth") v.alive = false;
      s.voids.push(s.tideNext); delete s.groves[s.tideNext]; s.tideNext = null;
      if (!alive("p")) { s.winner = "e"; s.reason = "taken"; } else if (!alive("e")) { s.winner = "p"; s.reason = "taken"; }
    }
    if (!s.winner && s.round >= ROUNDS) { const a = thresholds(s, "p"), b = thresholds(s, "e"); s.winner = a > b ? "p" : "e"; s.reason = "rounds"; }
    s.round++;
  }
  s.turn = other(side);
  return s;
}
function evaluate(s) {
  if (s.winner) return s.winner === "e" ? 1000 : -1000;
  let v = 0;
  const alive = (sd) => s.pieces.filter((x) => x.alive && x.side === sd);
  v += (alive("e").length - alive("p").length) * 10;
  v += (thresholds(s, "e") - thresholds(s, "p")) * 3;
  const md = (sd) => Math.min(9, ...alive(sd).map((x) => dist(x, { q: 0, r: 0 })));
  v += md("p") - md("e");
  const caps = (sd) => genMoves(s, sd).filter((m) => m.cap).length;
  v += caps("e") * 2 - caps("p") * 4;
  if (s.tideNext) { const t = at(s, s.tideNext); if (t && t.tribe !== "earth") v += t.side === "e" ? -4 : 4; }
  return v;
}
function aiMove(s, rnd, err) {
  const scored = genMoves(s, "e").map((m) => {
    const s1 = apply(s, "e", m);
    let v;
    if (s1.winner) v = evaluate(s1);
    else { const rep = genMoves(s1, "p"); v = rep.length ? Math.min(...rep.map((r) => evaluate(apply(s1, "p", r)))) : evaluate(s1); }
    return { m, v: v + rnd() * 0.5 };
  }).sort((a, b) => b.v - a.v);
  if (!scored.length) return null;
  return err && scored.length > 1 && scored[1].v > -900 ? scored[1].m : scored[0].m;
}

// ---- page -----------------------------------------------------------------------------------
const CSS = `
.wrymwretch-six-realms-root{position:absolute;inset:0;overflow:auto;background:#3a2a10;color:${BONE};font-family:'Cormorant Garamond',Georgia,serif}
.wrymwretch-six-realms-page{display:flex;flex-wrap:wrap;gap:14px;padding:12px;min-height:100%;box-sizing:border-box;align-items:stretch}
.wrymwretch-six-realms-board{flex:2 1 360px;min-width:0;display:flex}
.wrymwretch-six-realms-board svg{width:100%;height:100%;min-height:330px;max-height:calc(100vh - 90px);display:block;touch-action:manipulation}
.wrymwretch-six-realms-hex{cursor:pointer;outline:none}
.wrymwretch-six-realms-hex:focus-visible .wrymwretch-six-realms-edge{stroke:#fff;stroke-width:4}
.wrymwretch-six-realms-hex:hover .wrymwretch-six-realms-edge{stroke:${BONE};stroke-width:3.5}
.wrymwretch-six-realms-hex.bad .wrymwretch-six-realms-edge{stroke:${RED};stroke-width:5}
.wrymwretch-six-realms-burst{transform-box:fill-box;transform-origin:center;animation:wrymwretch-six-realms-burst .8s ease-out forwards}
@keyframes wrymwretch-six-realms-burst{from{transform:scale(.4);opacity:1}to{transform:scale(1.6);opacity:0}}
.wrymwretch-six-realms-side{flex:1 1 240px;max-width:360px;display:flex;flex-direction:column;gap:10px}
.wrymwretch-six-realms-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.wrymwretch-six-realms-tile{background:#f1e8d2;color:${RED};border:3px solid ${OBS};padding:6px 8px;box-shadow:inset 0 0 0 2px #c9a33a}
.wrymwretch-six-realms-tile small{display:block;font:700 12px 'Cinzel',Georgia,serif;letter-spacing:.1em}
.wrymwretch-six-realms-tile b{font:500 26px 'Cinzel',Georgia,serif}
.wrymwretch-six-realms-row{display:flex;flex-wrap:wrap;gap:6px}
.wrymwretch-six-realms-btn{font:700 13px 'Cinzel',Georgia,serif;letter-spacing:.08em;background:${OBS};color:${GOLD};border:1.5px solid ${GOLD};padding:8px 10px;cursor:pointer;min-height:38px}
.wrymwretch-six-realms-btn.on{background:${GOLD};color:${OBS}}
.wrymwretch-six-realms-btn:hover:not(:disabled){border-color:${BONE};color:${BONE}}
.wrymwretch-six-realms-btn.on:hover:not(:disabled){color:${OBS}}
.wrymwretch-six-realms-btn:disabled{opacity:.35;cursor:default}
.wrymwretch-six-realms-ilv{background:rgba(26,21,32,.85);border-left:4px solid ${GOLD};padding:8px 10px;font-size:16px;min-height:2.6em}
.wrymwretch-six-realms-log{flex:1;min-height:120px;max-height:40vh;overflow:auto;background:#f1e8d2;color:#3b2a14;padding:10px 12px;font-style:italic;font-size:16px;line-height:1.35;border:3px solid ${OBS}}
.wrymwretch-six-realms-log p{margin:0 0 4px}
.wrymwretch-six-realms-log p.you{color:#1f3f5f}
.wrymwretch-six-realms-log p.beat{font-style:normal;color:${RED};border:2px solid ${GOLD};background:#fbf4df;padding:7px 9px;margin:4px 0 8px;font-size:16.5px}
.wrymwretch-six-realms-log p.beat q{font-style:italic}
.wrymwretch-six-realms-intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(26,21,32,.72);padding:16px;z-index:3}
.wrymwretch-six-realms-card{width:min(440px,100%);box-sizing:border-box;background:#f1e8d2;color:#3b2a14;padding:12px;border:4px solid ${OBS};font-size:16px;line-height:1.4;background-image:linear-gradient(90deg,#c9a33a 0 6px,transparent 6px),linear-gradient(#c9a33a 0 6px,transparent 6px);background-size:12px 12px;background-position:0 0}
.wrymwretch-six-realms-card .in{background:#f1e8d2;border:3px solid ${OBS};padding:16px 18px}
.wrymwretch-six-realms-card h2{font:700 23px 'Cinzel',Georgia,serif;margin:0;color:${RED};text-align:center}
.wrymwretch-six-realms-card .goal{font-style:italic;font-size:17px;text-align:center;margin:4px 0 12px}
.wrymwretch-six-realms-card dl{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;margin:0 0 12px;padding:10px 0;border-top:3px double ${GOLDDK};border-bottom:3px double ${GOLDDK}}
.wrymwretch-six-realms-card dt{font:700 13px 'Cinzel',Georgia,serif;color:${RED};white-space:nowrap;padding-top:2px}
.wrymwretch-six-realms-card dd{margin:0}
.wrymwretch-six-realms-card .more{font-size:15px;margin:0 0 12px}
.wrymwretch-six-realms-card .wrymwretch-six-realms-btn{display:block;margin:0 auto;font-size:15px;padding:10px 26px}
.wrymwretch-six-realms-drop{transition:transform 1.4s ease-in,opacity 1.4s ease-in}
`;

export default {
  mount(root, api) {
    const R = api.rng();
    const losses = api.store.get("losses", 0) || 0;
    const gentle = losses >= 2;
    const wrap = document.createElement("div");
    wrap.className = "wrymwretch-six-realms-root";
    wrap.innerHTML = `<style>${CSS}</style><div class="wrymwretch-six-realms-page">
      <div class="wrymwretch-six-realms-board"><svg viewBox="-250 -248 500 496" preserveAspectRatio="xMidYMid meet" role="application" aria-label="Six Realms board"></svg></div>
      <div class="wrymwretch-six-realms-side">
        <div class="wrymwretch-six-realms-tiles">
          <div class="wrymwretch-six-realms-tile"><small>ROUND</small><b data-round>1</b></div>
          <div class="wrymwretch-six-realms-tile"><small>TIDE IN</small><b data-tide>3</b></div>
          <div class="wrymwretch-six-realms-tile"><small>HELD</small><b data-held>0-0</b></div>
        </div>
        <div class="wrymwretch-six-realms-row">
          <button type="button" class="wrymwretch-six-realms-btn" data-stone>Raise a Stone</button>
          <button type="button" class="wrymwretch-six-realms-btn" data-recall>Recall</button>
          <button type="button" class="wrymwretch-six-realms-btn" data-threat>Show threats</button>
          <button type="button" class="wrymwretch-six-realms-btn" data-undo>Undo</button>
        </div>
        <div class="wrymwretch-six-realms-ilv" aria-live="polite"></div>
        <div class="wrymwretch-six-realms-log" aria-label="Turn log"></div>
      </div></div>
      <div class="wrymwretch-six-realms-intro"><div class="wrymwretch-six-realms-card"><div class="in">
        <h2>Six Realms</h2>
        <p class="goal">Beat the Syndicate Elder at the tribes' own game.</p>
        <dl>
          <dt>Pick, then a hex</dt><dd>move one of your tribes (Dark, Earth, Wood); onto an enemy takes it</dd>
          <dt>Win</dt><dd>end a turn on Wrymreach, the gold centre, while you also hold a Threshold (the six white-ringed hexes), or take all three</dd>
          <dt>The tide</dt><dd>every third round it forgets a dimmed home hex</dd>
        </dl>
        <p class="more">${gentle ? "The elder is in a forgiving mood: two undos, and two careless moves. " : ""}Ilvarra will tell you each tribe's power as it becomes useful.</p>
        <button type="button" class="wrymwretch-six-realms-btn on" data-start>Sit down</button></div></div></div>`;
    root.appendChild(wrap);
    const svg = wrap.querySelector("svg");
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const S = 56, SQ = Math.sqrt(3);
    const px = (q, r) => [S * 1.5 * q, S * SQ * (r + q / 2)];
    const hexPts = (cx, cy, s) => Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i; return `${(cx + s * Math.cos(a)).toFixed(1)},${(cy + s * Math.sin(a)).toFixed(1)}`; }).join(" ");
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    // ---- the mosaic, laid once ----------------------------------------------------------------
    const defs = mk("defs", {}, svg);
    { // gold tesserae ground
      const pat = mk("pattern", { id: "wwsr-gold", width: 14, height: 12, patternUnits: "userSpaceOnUse" }, defs);
      mk("rect", { width: 14, height: 12, fill: GOLDDK }, pat);
      mk("rect", { x: 0.8, y: 0.8, width: 5.6, height: 4.6, fill: "#d8b04a" }, pat); mk("rect", { x: 7.4, y: 0.8, width: 5.8, height: 4.6, fill: "#c79a30" }, pat);
      mk("rect", { x: 3.8, y: 6.6, width: 5.8, height: 4.6, fill: "#e0bc58" }, pat); mk("rect", { x: -3, y: 6.6, width: 5.8, height: 4.6, fill: "#cfa23a" }, pat); mk("rect", { x: 10.6, y: 6.6, width: 5.8, height: 4.6, fill: "#cfa23a" }, pat);
    }
    mk("rect", { x: -260, y: -240, width: 520, height: 480, fill: "url(#wwsr-gold)" }, svg);
    const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f)))); return `rgb(${c.join(",")})`; };
    const gHex = mk("g", {}, svg), gMark = mk("g", {}, svg), gPiece = mk("g", {}, svg);
    const hexEls = {};
    for (const h of HEXES) {
      const [cx, cy] = px(h.q, h.r);
      const g = mk("g", { class: "wrymwretch-six-realms-hex", tabindex: 0, role: "button", "aria-label": hexName(h.key), "data-key": h.key }, gHex);
      const clip = mk("clipPath", { id: "wwsr-c" + h.id }, defs); mk("polygon", { points: hexPts(cx, cy, S - 3) }, clip);
      mk("polygon", { points: hexPts(cx, cy, S - 1), fill: "#2a2018" }, g);
      const tiles = mk("g", { "clip-path": `url(#wwsr-c${h.id})` }, g);
      const base = REALM_COL[h.realm];
      // opus vermiculatum: rings of tesserae following the hexagon
      for (let ring = 0; ring < 6; ring++) {
        const rad = S - 6 - ring * 9; if (rad < 4) break;
        const n = Math.max(6, Math.round(rad * 6 / 7));
        const col = h.kind === "threshold" && ring % 2 === 1 ? BONE : h.kind === "centre" && ring % 2 ? GOLD : base;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const k = Math.PI / 3, rr = rad * Math.cos(k / 2) / Math.cos(((a % k) + k) % k - k / 2);
          const tx = cx + rr * Math.cos(a), ty = cy + rr * Math.sin(a);
          mk("rect", { x: (tx - 3.4).toFixed(1), y: (ty - 3).toFixed(1), width: 6.8, height: 6, fill: shade(col.startsWith("#") ? col : "#888888", 0.82 + R() * 0.3), transform: `rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${tx.toFixed(1)} ${ty.toFixed(1)})`, class: "wrymwretch-six-realms-drop" }, tiles);
        }
      }
      mk("circle", { cx, cy, r: 6, fill: h.kind === "centre" ? GOLD : shade(base, 0.7) }, tiles);
      mk("polygon", { class: "wrymwretch-six-realms-edge", points: hexPts(cx, cy, S - 2), fill: "none", stroke: OBS, "stroke-width": 2.5 }, g);
      hexEls[h.key] = { g, tiles, cx, cy };
    }
    const ICON = {
      wood: "M0,-9 C8,-5 8,5 0,10 C-8,5 -8,-5 0,-9 Z M0,-6 V8", sky: "M-11,4 L0,-7 L11,4 M-6,8 L0,2 L6,8",
      earth: "M-7,-7 H7 V7 H-7 Z", water: "M-11,0 Q-5.5,-7 0,0 T11,0 M-11,6 Q-5.5,-1 0,6 T11,6",
      dark: "M-11,0 Q0,-10 11,0 Q0,10 -11,0 Z M0,-3.5 a3.5,3.5 0 1,0 0.1,0", celestial: "M0,-11 L3,-3 L11,0 L3,3 L0,11 L-3,3 L-11,0 L-3,-3 Z",
    };

    // ---- state ----------------------------------------------------------------------------------
    let s = initial();
    const ui = { sel: null, mode: null, threats: false, undo: null, undoLeft: gentle ? 2 : 1, busy: false, started: false, over: false, eTurns: 0, errTurn: 2 + Math.floor(R() * 4), errTurn2: gentle ? 7 + Math.floor(R() * 3) : -1, lastE: null, last: [], fx: [], beats: new Set() };
    const logEl = wrap.querySelector(".wrymwretch-six-realms-log"), ilv = wrap.querySelector(".wrymwretch-six-realms-ilv");
    const btn = (k) => wrap.querySelector(`[data-${k}]`);
    const log = (text, you) => { const p = document.createElement("p"); p.textContent = text; if (you) p.className = "you"; logEl.prepend(p); };
    const beat = (id, html) => { if (ui.beats.has(id)) return; ui.beats.add(id); const p = document.createElement("p"); p.className = "beat"; p.innerHTML = html; logEl.prepend(p); };
    const flashHex = (key) => { const el = hexEls[key]; if (!el) return; el.g.classList.add("bad"); later(() => el.g.classList.remove("bad"), 450); };
    const pieceName = (p, viewer = "p") => (p.side !== viewer && !p.rev ? "a hidden piece" : NAMES[p.tribe]);
    const describe = (st0, side, m) => {
      const p = st0.pieces.find((x) => x.id === m.pid);
      const who = side === "p" ? "You" : "The elder";
      if (m.type === "move") {
        const o = m.cap && st0.pieces.find((x) => x.id === m.cap);
        const mover = side === "e" && !p.rev && !(o && p.tribe === "dark") ? "a hidden piece" : NAMES[p.tribe];
        const taken = o ? `, taking ${side === "p" ? "the elder's" : "your"} ${NAMES[o.tribe]}` : "";
        return `${who}: ${mover} to ${hexName(m.to)}${taken}.`;
      }
      if (m.type === "push") { const o = st0.pieces.find((x) => x.id === m.target); return `${who}: Water pushes ${NAMES[o.tribe]} to ${hexName(m.to)}.`; }
      if (m.type === "swap") return `${who}: ${side === "e" ? "two pieces trade places" : "Dark trades places"}.`;
      if (m.type === "stone") return `${who}: Earth raises a Stone on ${hexName(m.at)}.`;
      return `${who}: Recall. ${NAMES[p.tribe]} returns to ${hexName(m.at)}.`;
    };

    function legalFor(pid) {
      return genMoves(s, "p").filter((m) => m.pid === pid && (ui.mode === "stone" ? m.type === "stone" : m.type === "move" || m.type === "swap"));
    }
    function render() {
      gPiece.innerHTML = ""; gMark.innerHTML = "";
      for (const h of HEXES) {
        const el = hexEls[h.key];
        const isVoid = s.voids.includes(h.key);
        if (isVoid && !el.dropped) { el.dropped = true; [...el.tiles.children].forEach((t, i) => { if (api.reducedMotion) t.setAttribute("opacity", 0); else { t.style.transitionDelay = (i % 17) * 0.03 + "s"; t.style.transform = "translateY(40px)"; t.style.opacity = "0"; } }); }
        el.g.setAttribute("opacity", s.tideNext === h.key ? "0.55" : "1");
        if (s.stones.includes(h.key)) { mk("polygon", { points: hexPts(el.cx, el.cy, 22), fill: "#7d858f", stroke: OBS, "stroke-width": 3 }, gMark); mk("path", { d: `M${el.cx - 12},${el.cy - 4} h24 M${el.cx - 12},${el.cy + 6} h24`, stroke: OBS, "stroke-width": 1.5 }, gMark); }
        const gr = s.groves[h.key];
        if (gr) mk("circle", { cx: el.cx, cy: el.cy, r: S * 0.62, fill: "none", stroke: gr.side === "p" ? "#7fae4a" : "#2e4a1a", "stroke-width": 5, "stroke-dasharray": "3 5" }, gMark);
        if (s.tideNext === h.key) mk("text", { x: el.cx, y: el.cy + S * 0.72, "text-anchor": "middle", "font-size": 11, fill: OBS, "font-family": "Cinzel, Georgia, serif", "font-weight": 700 }, gMark).textContent = "TIDE";
      }
      // the last move, outlined in gold; a burst of tesserae where something was taken
      for (const k of ui.last) { const el = hexEls[k]; if (el) mk("polygon", { points: hexPts(el.cx, el.cy, S - 5), fill: "none", stroke: "#fff2b0", "stroke-width": 3, "stroke-dasharray": "6 4", "pointer-events": "none" }, gMark); }
      for (const k of ui.fx) { const el = hexEls[k]; if (el && !api.reducedMotion) { const b = mk("g", { class: "wrymwretch-six-realms-burst", "pointer-events": "none" }, gMark); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mk("rect", { x: el.cx + Math.cos(a) * 30 - 3, y: el.cy + Math.sin(a) * 30 - 3, width: 6, height: 6, fill: i % 2 ? GOLD : RED }, b); } } }
      ui.fx = [];
      if (ui.threats) for (const m of genMoves(s, "e")) if (m.type === "move") { const el = hexEls[m.to]; mk("polygon", { points: hexPts(el.cx, el.cy, S - 8), fill: m.cap ? "rgba(139,42,32,.45)" : "rgba(26,21,32,.18)" }, gMark); }
      // legal targets for the selection
      if (ui.sel) for (const m of legalFor(ui.sel)) {
        const key = m.type === "swap" ? K(...(() => { const o = s.pieces.find((x) => x.id === m.other); return [o.q, o.r]; })()) : m.to || m.at;
        const el = hexEls[key];
        mk("circle", { cx: el.cx, cy: el.cy, r: m.cap ? 28 : 12, fill: m.cap ? "none" : m.type === "stone" ? "#7d858f" : BONE, stroke: m.cap ? RED : m.type === "swap" ? "#5b3a7a" : OBS, "stroke-width": m.cap ? 5 : 3, opacity: 0.9, "pointer-events": "none" }, gMark);
      }
      if (ui.mode === "recall") for (const m of genMoves(s, "p").filter((x) => x.type === "recall")) { const el = hexEls[m.at]; mk("circle", { cx: el.cx, cy: el.cy, r: 14, fill: GOLD, stroke: OBS, "stroke-width": 3, "pointer-events": "none" }, gMark); }
      for (const p of s.pieces) {
        if (!p.alive) continue;
        const [cx, cy] = px(p.q, p.r);
        const g = mk("g", { "pointer-events": "none" }, gPiece);
        const hidden = p.side === "e" && !p.rev;
        mk("circle", { cx, cy: cy + 3, r: 25, fill: "rgba(0,0,0,.35)" }, g);
        mk("circle", { cx, cy, r: 25, fill: hidden ? "#3a3440" : REALM_COL[TRIBE[p.tribe]], stroke: p.side === "p" ? BONE : OBS, "stroke-width": 6 }, g);
        mk("circle", { cx, cy, r: 19, fill: "none", stroke: p.side === "p" ? GOLD : RED, "stroke-width": 2, "stroke-dasharray": "3 2" }, g);
        if (hidden) mk("text", { x: cx, y: cy + 8, "text-anchor": "middle", "font-size": 22, "font-family": "Cinzel, Georgia, serif", fill: BONE }, g).textContent = "?";
        else mk("path", { d: ICON[p.tribe], transform: `translate(${cx},${cy})`, fill: p.tribe === "earth" || p.tribe === "celestial" ? BONE : "none", stroke: p.tribe === "earth" || p.tribe === "celestial" ? OBS : BONE, "stroke-width": 2.6, "stroke-linecap": "round" }, g);
        if (p.side === "p" && p.tribe === "dark" && !p.rev) { mk("rect", { x: cx - 30, y: cy + 17, width: 60, height: 15, rx: 2, fill: OBS, opacity: 0.85 }, g); mk("text", { x: cx, y: cy + 28.5, "text-anchor": "middle", "font-size": 12, fill: BONE, "font-family": "Georgia, serif", "font-style": "italic" }, g).textContent = "face-down"; }
        if (ui.sel === p.id) mk("circle", { cx, cy, r: 31, fill: "none", stroke: "#fff", "stroke-width": 3 }, g);
      }
      wrap.querySelector("[data-round]").textContent = Math.min(s.round, ROUNDS);
      const ev = every(s.round);
      wrap.querySelector("[data-tide]").textContent = ev - (s.round % ev === 0 ? ev : s.round % ev) + 1;
      wrap.querySelector("[data-held]").textContent = `${thresholds(s, "p")}-${thresholds(s, "e")}`;
      const selP = ui.sel && s.pieces.find((x) => x.id === ui.sel);
      btn("stone").disabled = !(selP && selP.tribe === "earth" && selP.stones > 0) || ui.busy;
      btn("stone").textContent = selP && selP.tribe === "earth" ? `Raise a Stone (${selP.stones})` : "Raise a Stone";
      btn("stone").classList.toggle("on", ui.mode === "stone");
      btn("recall").disabled = ui.busy || !genMoves(s, "p").some((m) => m.type === "recall");
      btn("recall").classList.toggle("on", ui.mode === "recall");
      btn("threat").classList.toggle("on", ui.threats);
      btn("undo").disabled = !ui.undo || ui.undoLeft < 1 || ui.busy;
    }

    function threatNote() {
      const caps = genMoves(s, "e").filter((m) => m.cap);
      if (caps.length) { const t = s.pieces.find((x) => x.id === caps[0].cap), by = s.pieces.find((x) => x.id === caps[0].pid); return `Ilvarra: your ${NAMES[t.tribe]} on ${hexName(K(t.q, t.r))} stands where the elder's ${pieceName(by)} can reach it.`; }
      if (s.pieces.some((x) => x.alive && x.side === "e" && x.q === 0 && x.r === 0)) return "Ilvarra: the elder sits on Wrymreach. Keep every Threshold from them.";
      if (s.tideNext) { const v = at(s, s.tideNext); if (v && v.side === "p" && v.tribe !== "earth") return `Ilvarra: the tide will forget ${hexName(s.tideNext)}. Move your ${NAMES[v.tribe]} off it.`; }
      return "Ilvarra: nothing of yours is threatened. Press for a Threshold, then the centre.";
    }
    function end() {
      ui.over = true; render();
      const win = s.winner === "p";
      api.store.set("losses", win ? 0 : losses + 1);
      const how = s.reason === "centre" ? (win ? "You end a turn on Wrymreach while holding a Threshold." : "The elder ends a turn on Wrymreach while holding a Threshold.")
        : s.reason === "taken" ? (win ? "You have taken all three of the elder's tribes." : "All three of your tribes are taken.")
        : `After ${ROUNDS} rounds the Thresholds stand ${thresholds(s, "p")} to ${thresholds(s, "e")}${win ? "" : " (a tie goes to the elder)"}.`;
      later(() => api.end(win ? { outcome: "win", text: `${how} The Syndicate Elder sets down the key, and Kael opens the forbidden chamber. On the pedestal of bone: “When the last memory fades, the Astral Architect shall rise.” (WW 77) “Shallock Izladar. A name the world was trying to forget.” (WW 79)` } : { outcome: "lose", text: `${how} The Syndicate keeps its key and its trust. Kael will have to go round through the guarded gallery instead.${losses + 1 >= 2 ? " The elder will be more forgiving at the next sitting." : ""}` }), 700);
    }
    function play(side, m) {
      log(describe(s, side, m), side === "p");
      const before = s.voids.length, tideBefore = s.tideNext;
      const pBefore = s.pieces.find((x) => x.id === m.pid);
      const from = pBefore && pBefore.alive ? K(pBefore.q, pBefore.r) : null;
      s = apply(s, side, m);
      ui.last = [from, m.to || m.at || (m.type === "push" ? m.to : null)].filter(Boolean);
      if (m.cap) {
        ui.fx.push(m.to);
        if (side === "p") beat("cap-p", `The elder taps the taken piece twice, the Syndicate's way of saying <i>well played</i>, and does not look up.`);
        else beat("cap-e", `“A tribe that forgets where its enemy stands,” the elder says, “is a tribe that will be forgotten.”`);
      }
      if (s.voids.length > before) { log(`The tide forgets ${hexName(s.voids[s.voids.length - 1])}.`); beat("tide1", `The first home hex drops its tiles into the dark under the table. Ilvarra goes quiet: this is how the realms are going.`); }
      if (s.tideNext && s.tideNext !== tideBefore && side === "e") { const h = hexName(s.tideNext); log(`${h[0].toUpperCase() + h.slice(1)} dims: the tide comes for it next.`); }
      if (side === "e" && s.round === QUICKEN) beat("quick", `The elder turns the tide-glass over. “The Tidecallers play it faster. So shall we.” <b>From now the tide forgets every second round.</b>`);
    }
    function playerMove(m) {
      ui.undo = { s: JSON.stringify(s), log: logEl.innerHTML };
      ui.sel = null; ui.mode = null;
      play("p", m);
      if (s.winner) return end();
      ui.busy = true; render();
      ilv.textContent = "The elder considers…";
      later(() => {
        ui.eTurns++;
        const em = aiMove(s, R, ui.eTurns === ui.errTurn || ui.eTurns === ui.errTurn2);
        if (em) play("e", em); else { s.turn = "p"; }
        ui.busy = false;
        if (s.winner) return end();
        ilv.textContent = threatNote();
        if (ui.eTurns === 1) ilv.textContent = "Ilvarra: your Dark is face-down until it takes or an enemy stands beside it. Select it: it can also trade places with a friend within two hexes.";
        if (ui.eTurns === 2) ilv.textContent = "Ilvarra: Wood leaves a Grove where it stood; the elder cannot step there for two turns. Earth can raise a Stone instead of moving (twice).";
        if (ui.eTurns === 4) ilv.textContent = "Ilvarra: 'Show threats' marks every hex the elder can reach. Undo takes back one move, once.";
        if (!ui.beats.has("recall") && genMoves(s, "p").some((m) => m.type === "recall")) { beat("recall", `You stand on Wrymreach with a tribe lost. <b>Recall</b> is open: once a game, bring it back to an empty home hex instead of moving.`); }
        if (!genMoves(s, "p").length) { s.winner = "e"; s.reason = "taken"; return end(); }
        render();
      }, api.reducedMotion ? 200 : 650);
    }

    // ---- input ------------------------------------------------------------------------------------
    function clickHex(key) {
      if (!ui.started || ui.busy || ui.over) return;
      if (ui.mode === "recall") { const m = genMoves(s, "p").find((x) => x.type === "recall" && x.at === key); if (m) return playerMove(m); ui.mode = null; return render(); }
      const here = at(s, key);
      if (ui.sel) {
        const ms = legalFor(ui.sel);
        const m = ms.find((x) => (x.type === "swap" ? (() => { const o = s.pieces.find((y) => y.id === x.other); return K(o.q, o.r) === key; })() : (x.to || x.at) === key));
        if (m) return playerMove(m);
        if (!here || here.side !== "p") { flashHex(key); ilv.textContent = "Ilvarra: that piece cannot go there. The bone dots are where it can."; }
      }
      if (here && here.side === "p") { ui.sel = ui.sel === here.id ? null : here.id; ui.mode = null; }
      else { ui.sel = null; ui.mode = null; }
      render();
    }
    gHex.addEventListener("click", (e) => { const g = e.target.closest(".wrymwretch-six-realms-hex"); if (g) clickHex(g.dataset.key); });
    gHex.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const g = e.target.closest(".wrymwretch-six-realms-hex"); if (g) { e.preventDefault(); clickHex(g.dataset.key); } });
    btn("stone").addEventListener("click", () => { ui.mode = ui.mode === "stone" ? null : "stone"; render(); });
    btn("recall").addEventListener("click", () => { ui.mode = ui.mode === "recall" ? null : "recall"; ui.sel = null; render(); });
    btn("threat").addEventListener("click", () => { ui.threats = !ui.threats; render(); });
    btn("undo").addEventListener("click", () => {
      if (!ui.undo || ui.undoLeft < 1 || ui.busy) return;
      s = JSON.parse(ui.undo.s); logEl.innerHTML = ui.undo.log; ui.undo = null; ui.undoLeft--;
      HEXES.forEach((h) => { const el = hexEls[h.key]; if (el.dropped && !s.voids.includes(h.key)) { el.dropped = false; [...el.tiles.children].forEach((t) => { t.style.transform = ""; t.style.opacity = ""; t.removeAttribute("opacity"); }); } });
      ilv.textContent = "Ilvarra: once. The elder will not allow it twice."; render();
    });
    const intro = wrap.querySelector(".wrymwretch-six-realms-intro"), sb = wrap.querySelector("[data-start]");
    sb.addEventListener("click", () => {
      intro.remove(); ui.started = true;
      log("The Syndicate Elder sets out the board. You move first.");
      beat("open", `Under the Syndicate's labyrinth, Kael Duskbane sits across from the Syndicate Elder. Behind the elder hangs the key to the forbidden chamber. “Play the tribes' game,” the elder says, “and I will know whether you understand the world.”`);
      ilv.textContent = "Ilvarra: pick one of your pieces at the bottom. Earth cannot be taken on a home hex.";
      render(); hexEls["0,2"].g.focus();
    });
    sb.focus();
    render();
    return { unmount() { ui.over = true; timers.forEach(clearTimeout); wrap.remove(); } };
  },
};

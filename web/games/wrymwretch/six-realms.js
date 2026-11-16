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
//
// Phase 1 (accepted 2026-11-15), "The Heartstone's memory changes rooms": if Rhyla kept the founding in
// the Heartstone (chapter 3), Stonekeeper home hexes cannot be tide-taken in any match. The full game
// reads heartstone_kept; here the how-to card asks, since each mode keeps its own storage.
// Art (games/wrymwretch/art): the mosaic board under the hexes, the tribes' mosaic discs as the pieces,
// chapter card 5 above the how-to, the Record behind the result. "A tribe moves as its dragon does": a
// selected piece shows its dragon in ink, using its gift, with the piece's rule; a revealed piece of the
// elder's, tapped, shows its dragon gliding. Without the board the hexes are laid
// in tesserae here, and without a disc a piece is the old ringed token.

import { png, opening } from "./_art.js";
import { staged } from "./_stages.js";

// Phase 2 (accepted 2026-11-15, built 2026-11-16): the ladder. Three sittings.
//   I   Teach, the Syndicate Elder (s_realms_syndicate): as above.
//   II  Test, the Moot's table (s_realms_seasons): the Circle of Seasons' elder (who here plays a lent
//       Sky in place of Earth: three slow tribes could not contest the centre), with the house rules of
//       three tables in force at once: groves last 3 turns (Seasons), two Stones stand at the start
//       (Stonekeepers), and a wind blows each round, shown, carrying a move with it one hex further
//       (Galechanters). The fourth house rule, the Tidecallers' fast tide, is the twist's.
//       The blank tessera (new): a neutral Remnant piece rises from the first hex the tide forgets and
//       moves one hex toward the nearest Threshold each round. It cannot be taken, and a piece beside
//       it loses its power (it moves one hex, like any other, and nothing protects it).
//   III Twist, the Tidecallers (s_realms_tidecallers): the board loses its own goal. The tide forgets
//       every second round, and the first thing it takes is the centre. Wrymreach is void: nobody can
//       end a turn there, and counting Thresholds at the end decides nothing (the elder keeps the game).
//       The match is won by Recall alone: a side that begins its turn holding two Thresholds may Recall
//       Wrymreach, instead of moving, and wins. Only the player may: the elder wins by the round limit.
// The Heartstone's memory changes rooms (layer link 3): the founding, if it was kept in Heartstone, is
// read from api.shared and holds the Stonekeeper homes here without being asked.
const LADDER = [
  { name: "The Syndicate Elder", sub: "The tribes' game, as it is played below.", elder: ["dark", "water", "sky"], mine: ["dark", "earth", "wood"],
    rules: { tide: "quicken", rounds: 16, groveTtl: 2, centreOpens: 4 }, who: "the Syndicate Elder", chapter: "chapter-05", realm: "below" },
  { name: "Three house rules", sub: "Longer groves, standing Stones, a wind; and a blank piece.", elder: ["wood", "sky", "celestial"], mine: ["dark", "earth", "wood"],
    rules: { tide: 3, rounds: 14, groveTtl: 3, wind: true, stones: ["2,-2", "-2,2"], blank: true, centreOpens: 4 }, who: "the Circle of Seasons' elder", chapter: "chapter-08", realm: "west" },
  { name: "The centre falls", sub: "Against the Tidecallers: the board loses its goal.", elder: ["water", "sky", "celestial"], mine: ["dark", "earth", "wood"],
    rules: { tide: 2, rounds: 14, groveTtl: 2, blank: true, centreFalls: true }, who: "the Tidecaller elder", chapter: "chapter-08", realm: "east" },
];
const WIND = ["south-east", "north-east", "north", "north-west", "south-west", "south"];

const GOLD = "#c9a33a", GOLDDK = "#8a6a1c", BONE = "#f3eee2", OBS = "#1a1520", RED = "#8b2a20";
const REALM_COL = { north: "#a9c8e4", above: "#d4a72c", east: "#1f5f8b", south: "#c88a2e", below: "#5b3a7a", west: "#4f6b2e", centre: "#e9e1cc" };
const TRIBE = { wood: "west", sky: "north", earth: "south", water: "east", dark: "below", celestial: "above" };
const NAMES = { wood: "Wood", sky: "Sky", earth: "Earth", water: "Water", dark: "Dark", celestial: "Celestial" };
const DRAGON = { wood: "sylvan", sky: "aetherius", earth: "gaia", water: "aquatica", dark: "umbra", celestial: "astraia" };
const MOVES = {
  wood: "Moves 1 hex. Leaves a Grove on the hex it left: the other side cannot enter it for 2 turns.",
  sky: "Up to 3 hexes in a straight line, jumping pieces.",
  earth: "Moves 1 hex. Cannot be taken on a home hex. May raise a Stone instead of moving, twice a game.",
  water: "Up to 2 hexes. May push an adjacent piece 1 hex instead of taking it.",
  dark: "Moves 1 hex, or trades places with a friend within 2. Face-down until it takes or an enemy stands beside it.",
  celestial: "Moves 1 hex. Friendly pieces beside it cannot be taken.",
};
const HEXES = [
  ["centre", 0, 0], ["threshold_north", 0, -1], ["threshold_above", 1, -1], ["threshold_east", 1, 0], ["threshold_south", 0, 1], ["threshold_below", -1, 1], ["threshold_west", -1, 0],
  ["home_north_a", 0, -2], ["home_north_b", 1, -2], ["home_above_a", 2, -2], ["home_above_b", 2, -1], ["home_east_a", 2, 0], ["home_east_b", 1, 1],
  ["home_south_a", 0, 2], ["home_south_b", -1, 2], ["home_below_a", -2, 2], ["home_below_b", -2, 1], ["home_west_a", -2, 0], ["home_west_b", -1, -1],
].map(([id, q, r]) => { const [kind, realm] = id === "centre" ? ["centre", "centre"] : id.split("_"); return { id, q, r, kind, realm, key: q + "," + r }; });
const HEX = Object.fromEntries(HEXES.map((h) => [h.key, h]));
const DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const K = (q, r) => q + "," + r;
const dist = (a, b) => (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
const QUICKEN = 9;
const every = (s) => (s.rules.tide === "quicken" ? (s.round >= QUICKEN ? 2 : 3) : s.rules.tide);
const windDir = (s) => (s.rules.wind ? DIRS[(s.round - 1) % 6] : null);
// a piece beside the blank tessera has no power
const dulled = (s, p) => !!s.blank && dist(s.blank, p) === 1;
const other = (s) => (s === "p" ? "e" : "p");
const hexName = (key) => { const h = HEX[key]; if (!h) return "?"; const R = h.realm[0].toUpperCase() + h.realm.slice(1); return h.kind === "centre" ? "Wrymreach" : h.kind === "threshold" ? `the ${R} Threshold` : `${/^[AEIOU]/.test(R) ? "an" : "a"} ${R} home`; };

// ---- rules (pure; the AI plays them too) -------------------------------------------------------
function initial(founding, cfg = LADDER[0]) {
  const P = (id, side, tribe, q, r) => ({ id, side, tribe, q, r, alive: true, rev: tribe !== "dark", stones: tribe === "earth" ? 2 : 0 });
  const PP = [[-1, 2], [0, 2], [1, 1]], EP = [[0, -2], [1, -2], [-1, -1]];
  return {
    pieces: [...cfg.mine.map((t, i) => P("p_" + t, "p", t, ...PP[i])), ...cfg.elder.map((t, i) => P("e_" + t, "e", t, ...EP[i]))],
    rules: cfg.rules, blank: null,
    founding: !!founding, groves: {}, stones: (cfg.rules.stones || []).slice(), voids: [], tideNext: null, round: 1, turn: "p", recall: { p: false, e: false }, winner: null, reason: "",
  };
}
const at = (s, key) => s.pieces.find((p) => p.alive && K(p.q, p.r) === key);
const isHome = (key) => HEX[key] && HEX[key].kind === "home";
function protectedPiece(s, p) {
  const key = K(p.q, p.r);
  if (dulled(s, p)) return false;
  if (p.tribe === "earth" && isHome(key)) return true;
  return s.pieces.some((c) => c.alive && c.side === p.side && c.tribe === "celestial" && c !== p && dist(c, p) === 1 && !dulled(s, c));
}
function enterable(s, key, side) {
  if (!HEX[key] || s.stones.includes(key) || s.voids.includes(key)) return false;
  if (s.blank && K(s.blank.q, s.blank.r) === key) return false;
  if (key === "0,0" && s.rules.centreOpens && s.round < s.rules.centreOpens) return false;   // Wrymreach opens with the first tide
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
  const wd = windDir(s);
  if (s.voids.includes("0,0") && s.rules.centreFalls && mine.length && thresholds(s, side) >= 2 && (side === "p" || s.rules.elderRecalls)) out.push({ type: "recallw", pid: mine[0].id });
  for (const p of mine) {
    const dull = dulled(s, p);
    if (dull) { for (const [dq, dr] of DIRS) dest(p, K(p.q + dq, p.r + dr)); continue; }
    if (wd && p.tribe !== "sky" && p.tribe !== "water") {   // the wind carries a one-hex move one further
      const k1 = K(p.q + wd[0], p.r + wd[1]);
      if (enterable(s, k1, side) && !at(s, k1)) dest(p, K(p.q + wd[0] * 2, p.r + wd[1] * 2));
    }
    if (p.tribe === "sky") {
      for (const [dq, dr] of DIRS) for (let n = 1; n <= (wd && wd[0] === dq && wd[1] === dr ? 4 : 3); n++) {
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
        if (HEX[to] && !s.stones.includes(to) && !at(s, to) && !(s.blank && K(s.blank.q, s.blank.r) === to)) out.push({ type: "push", pid: p.id, target: o.id, to });
      }
    } else {
      for (const [dq, dr] of DIRS) dest(p, K(p.q + dq, p.r + dr));
    }
    if (p.tribe === "dark") for (const f of mine) if (f !== p && dist(f, p) <= 2) out.push({ type: "swap", pid: p.id, other: f.id });
    if (p.tribe === "earth" && p.stones > 0) for (const [dq, dr] of DIRS) {
      const key = K(p.q + dq, p.r + dr);
      if (HEX[key] && key !== "0,0" && !s.stones.includes(key) && !s.voids.includes(key) && !at(s, key) && !(s.blank && K(s.blank.q, s.blank.r) === key)) out.push({ type: "stone", pid: p.id, at: key });
    }
  }
  if (!s.recall[side] && !s.voids.includes("0,0") && mine.some((p) => p.q === 0 && p.r === 0)) {
    const lost = s.pieces.filter((p) => !p.alive && p.side === side);
    if (lost.length) for (const h of HEXES) if (h.kind === "home" && !s.voids.includes(h.key) && !s.stones.includes(h.key) && !at(s, h.key)) out.push({ type: "recall", pid: lost[0].id, at: h.key });
  }
  return out;
}
const thresholds = (s, side) => s.pieces.filter((p) => p.alive && p.side === side && HEX[K(p.q, p.r)].kind === "threshold").length;
function apply(s0, side, m) {
  const s = JSON.parse(JSON.stringify(s0));
  const p = s.pieces.find((x) => x.id === m.pid);
  if (m.type === "recallw") {   // III: Wrymreach, recalled. The only way the match is won.
    s.voids = s.voids.filter((k) => k !== "0,0"); s.winner = side; s.reason = "recall"; s.turn = other(side); return s;
  }
  if (m.type === "move") {
    const from = K(p.q, p.r);
    if (m.cap) { const o = s.pieces.find((x) => x.id === m.cap); o.alive = false; if (p.tribe === "dark") p.rev = true; }
    if (p.tribe === "wood" && !dulled(s, p)) s.groves[from] = { side, ttl: s.rules.groveTtl };
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
  if (onCentre && thresholds(s, side) > 0 && !s.voids.includes("0,0")) { s.winner = side; s.reason = "centre"; }
  else if (!alive(other(side))) { s.winner = side; s.reason = "taken"; }
  for (const k of Object.keys(s.groves)) if (s.groves[k].side !== side && --s.groves[k].ttl <= 0) delete s.groves[k];
  if (!s.winner && side === "e") {
    const ev = every(s);
    // the blank tessera: one hex toward the nearest Threshold each round, once it is on the board
    if (s.blank) {
      const here = HEX[K(s.blank.q, s.blank.r)];
      if (!here || here.kind !== "threshold") {
        const ths = HEXES.filter((h) => h.kind === "threshold").sort((a, b) => dist(a, s.blank) - dist(b, s.blank) || a.id.localeCompare(b.id));
        let best = null;
        for (const t of ths) { for (const [dq, dr] of DIRS) { const c = { q: s.blank.q + dq, r: s.blank.r + dr }, k = K(c.q, c.r); if (!HEX[k] || s.stones.includes(k) || at(s, k)) continue; if (dist(c, t) < dist(s.blank, t) && (!best || dist(c, t) < best.d)) best = { c, d: dist(c, t) }; } if (best) break; }
        if (best) s.blank = best.c;
      }
    }
    if (s.round % ev === ev - 1 && !s.tideNext) {
      // the founding, kept in the Heartstone, anchors the Stonekeepers' homes against the tide
      const pool = HEXES.filter((h) => h.kind === "home" && !s.voids.includes(h.key) && !(s.founding && h.realm === "south"));
      if (s.rules.centreFalls && !s.voids.length) s.tideNext = "0,0";   // III: the first thing the tide takes is the centre
      else if (pool.length) s.tideNext = pool[(s.round * 7 + 3 + s.voids.length * 5) % pool.length].key;
    }
    if (s.round % ev === 0 && s.tideNext) {
      const v = at(s, s.tideNext);
      if (v && v.tribe !== "earth") v.alive = false;
      s.voids.push(s.tideNext); delete s.groves[s.tideNext];
      if (s.rules.blank && !s.blank && s.voids.length === 1 && !v) { const [bq, br] = s.tideNext.split(",").map(Number); s.blank = { q: bq, r: br }; }
      s.tideNext = null;
      if (!alive("p")) { s.winner = "e"; s.reason = "taken"; } else if (!alive("e")) { s.winner = "p"; s.reason = "taken"; }
    }
    if (!s.winner && s.round >= s.rules.rounds) { const a = thresholds(s, "p"), b = thresholds(s, "e"); s.winner = a > b && !s.voids.includes("0,0") ? "p" : "e"; s.reason = "rounds"; }
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
  const gone = s.voids.includes("0,0");
  v += (thresholds(s, "e") - thresholds(s, "p")) * (gone ? 9 : 3);
  const md = (sd) => Math.min(9, ...alive(sd).map((x) => dist(x, { q: 0, r: 0 })));
  if (!gone) v += md("p") - md("e");
  else { const near = (sd) => alive(sd).filter((x) => dist(x, { q: 0, r: 0 }) <= 1).length; v += (near("e") - near("p")) * 1.5; }
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
export const rules = { LADDER, initial, genMoves, apply, evaluate, aiMove, thresholds };

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
.wrymwretch-six-realms-who{display:flex;gap:10px;align-items:center;background:#efe4cb;color:#3b2a14;border:3px solid ${OBS};box-shadow:inset 0 0 0 2px ${GOLD};padding:6px 10px;font-size:15.5px;line-height:1.25}
.wrymwretch-six-realms-who img{width:104px;height:78px;flex:none;object-fit:contain}
.wrymwretch-six-realms-who b{display:block;font:700 12.5px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:${RED};margin-bottom:2px}
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
.wrymwretch-six-realms-card .wrymwretch-six-realms-keep{font-size:13px;padding:8px 12px;margin-bottom:10px;text-align:left;width:100%;box-sizing:border-box}
.wrymwretch-six-realms-keep small{display:block;font:italic 14px 'Cormorant Garamond',Georgia,serif;letter-spacing:0;margin-top:2px}
.wrymwretch-six-realms-keep::before{content:"☐ "}.wrymwretch-six-realms-keep[aria-pressed="true"]::before{content:"☑ "}
.wrymwretch-six-realms-keep[aria-pressed="true"]{background:#c88a2e;color:${OBS};border-color:${OBS}}
.wrymwretch-six-realms-drop{transition:transform 1.4s ease-in,opacity 1.4s ease-in}
`;

function play(root, api, ctx) {
    const ST = ctx.stage, CFG = LADDER[ST], ROUNDS = CFG.rules.rounds;
    let hsKept = null; try { hsKept = (api.shared && api.shared.get("heartstone", null)) || null; } catch { hsKept = null; }
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
        <div class="wrymwretch-six-realms-who" hidden></div>
        <div class="wrymwretch-six-realms-ilv" aria-live="polite"></div>
        <div class="wrymwretch-six-realms-log" aria-label="Turn log"></div>
      </div></div>
      <div class="wrymwretch-six-realms-intro"><div class="wrymwretch-six-realms-card"><div class="in">
        <h2>Six Realms</h2>
        <div data-tabs></div>
        ${[`<p class="goal">Beat the Syndicate Elder at the tribes' own game.</p>
        <dl>
          <dt>Pick, then a hex</dt><dd>move one of your tribes (Dark, Earth, Wood); onto an enemy takes it</dd>
          <dt>Win</dt><dd>end a turn on Wrymreach, the gold centre, while you also hold a Threshold (the six white-ringed hexes), or take all three</dd>
          <dt>The tide</dt><dd>every third round it forgets a dimmed home hex. Wrymreach is shut until the first tide has come: nobody steps onto it before round 4</dd>
        </dl>`,
        `<p class="goal">At the Moot, the Circle of Seasons plays by three tables' rules at once.</p>
        <dl>
          <dt>House rules</dt><dd>groves last 3 turns; two Stones stand from the start; a wind blows each round (the arrow), and a one-hex move with it goes one further. Wrymreach opens at round 4, as before</dd>
          <dt>The blank tessera</dt><dd>new: it rises where the tide first forgets, and walks to the nearest Threshold. A piece beside it has no power</dd>
          <dt>Yours</dt><dd>Dark, Earth and Wood, as before. The elder plays Wood, Celestial (friends beside it cannot be taken) and a Sky lent by the Galechanters</dd>
        </dl>`,
        `<p class="goal">Against the Tidecallers, the tide takes the centre.</p>
        <dl>
          <dt>No centre</dt><dd>turned over: Wrymreach goes void with the first tide. Nobody can end a turn there, and Thresholds counted at the end decide nothing</dd>
          <dt>Recall alone</dt><dd>begin your turn holding <b>two Thresholds</b> and you may Recall Wrymreach instead of moving. That wins. The elder cannot: the Tidecallers gave the centre up, and win by keeping the board as it is for 14 rounds</dd>
          <dt>The tide</dt><dd>every second round; the blank tessera rises from the centre</dd>
        </dl>`][ST]}
        <p class="more">${gentle ? "The elder is in a forgiving mood: two undos, and two careless moves. " : ""}${ST ? "The win is as before unless the card says otherwise." : "Ilvarra will tell you each tribe's power as it becomes useful."}</p>
        <button type="button" class="wrymwretch-six-realms-btn wrymwretch-six-realms-keep" data-founding aria-pressed="${hsKept === "founding" ? "true" : "false"}"${hsKept ? " hidden" : ""}>The Heartstone kept the founding<small>what Rhyla chose in chapter 3: Stonekeeper homes cannot be tide-taken</small></button>
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
    const gBoard = mk("g", { "pointer-events": "none" }, svg);
    const gHex = mk("g", {}, svg), gMark = mk("g", {}, svg), gPiece = mk("g", {}, svg);
    const A = { board: false, piece: {}, dragon: {}, blank: "", guest: "" };
    png(api.art, "realms-piece-blank-tessera", { w: 120, strip: [".plate"] }).then((u) => { if (u && !dead) { A.blank = u; render(); } });
    let dead = false;
    const hexEls = {};
    for (const h of HEXES) {
      const [cx, cy] = px(h.q, h.r);
      const g = mk("g", { class: "wrymwretch-six-realms-hex", tabindex: 0, role: "button", "aria-label": hexName(h.key), "data-key": h.key }, gHex);
      const clip = mk("clipPath", { id: "wwsr-c" + h.id }, defs); mk("polygon", { points: hexPts(cx, cy, S - 3) }, clip);
      const under = mk("polygon", { points: hexPts(cx, cy, S - 1), fill: "#2a2018" }, g);
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
      hexEls[h.key] = { g, tiles, cx, cy, under };
    }
    // the mosaic board from the art, laid under the hexes (its hexes are the data's own, at twice this scale)
    png(api.art, "realms-board", { w: 900, jpeg: true }).then((u) => {
      if (!u || dead) return;
      mk("image", { href: u, x: -300, y: -300, width: 600, height: 600, preserveAspectRatio: "none" }, gBoard);
      A.board = true;
      for (const h of HEXES) { const el = hexEls[h.key]; el.tiles.style.display = "none"; el.under.setAttribute("fill", "transparent"); }
      render();
    });
    for (const [t, pose] of [...CFG.mine.map((t) => [t, "gift"]), ...CFG.elder.map((t) => [t, "glide"])]) png(api.art, `flight-${DRAGON[t]}-${pose}`, { w: 208, strip: [".plate"] }).then((u) => { if (u && !dead) { A.dragon[t + pose] = u; render(); } });
    for (const t of ["wood", "sky", "earth", "water", "dark", "celestial"]) png(api.art, "realms-piece-" + t, { w: 120, strip: [".plate"] }).then((u) => { if (u && !dead) { A.piece[t] = u; render(); } });
    const ICON = {
      wood: "M0,-9 C8,-5 8,5 0,10 C-8,5 -8,-5 0,-9 Z M0,-6 V8", sky: "M-11,4 L0,-7 L11,4 M-6,8 L0,2 L6,8",
      earth: "M-7,-7 H7 V7 H-7 Z", water: "M-11,0 Q-5.5,-7 0,0 T11,0 M-11,6 Q-5.5,-1 0,6 T11,6",
      dark: "M-11,0 Q0,-10 11,0 Q0,10 -11,0 Z M0,-3.5 a3.5,3.5 0 1,0 0.1,0", celestial: "M0,-11 L3,-3 L11,0 L3,3 L0,11 L-3,3 L-11,0 L-3,-3 Z",
    };

    // ---- state ----------------------------------------------------------------------------------
    let s = initial(hsKept === "founding", CFG);
    // the collection thread: something small on the table's corner, in the twist. Nobody mentions it.
    const gGuest = mk("g", {}, svg);
    if (ST === 2) png(api.art, "thread-guest", { w: 220 }).then((u) => {
      if (!u || dead) return;
      const cp = mk("clipPath", { id: "wwsr-guest" }, defs); mk("path", { d: "M-236,238 L-232,230 H-230 V178 A36,36 0 0 1 -158,178 V230 H-156 L-152,238Z" }, cp);
      const g = mk("g", { class: "wrymwretch-six-realms-hex", tabindex: 0, role: "button", "aria-label": "something small on the corner of the table", "data-guest": "1" }, gGuest);
      mk("ellipse", { cx: -194, cy: 238, rx: 44, ry: 5, fill: "rgba(0,0,0,.35)" }, g);
      mk("image", { href: u, x: -251.6, y: 126.7, width: 115.2, height: 115.2, "clip-path": "url(#wwsr-guest)" }, g);
      mk("path", { class: "wrymwretch-six-realms-edge", d: "M-236,238 L-232,230 H-230 V178 A36,36 0 0 1 -158,178 V230 H-156 L-152,238Z", fill: "none", stroke: OBS, "stroke-width": 1.5 }, g);
      const found = () => { try { api.thread.found(); } catch { /* no storage */ } ilv.textContent = "Ilvarra does not look up. “It was on the table when I sat down,” she says. “I left it where it was.”"; };
      g.addEventListener("click", found); g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); found(); } });
    });
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
      if (m.type === "recallw") return `${who}: Recall. Wrymreach is remembered, and set back in the board.`;
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
        if (isVoid && !el.dropped && !A.board) { el.dropped = true; [...el.tiles.children].forEach((t, i) => { if (api.reducedMotion) t.setAttribute("opacity", 0); else { t.style.transitionDelay = (i % 17) * 0.03 + "s"; t.style.transform = "translateY(40px)"; t.style.opacity = "0"; } }); }
        el.g.setAttribute("opacity", s.tideNext === h.key ? "0.55" : "1");
        if (A.board && isVoid) {   // on the art board a forgotten hex is a dark bed with a few tesserae left in it
          mk("polygon", { points: hexPts(el.cx, el.cy, S - 3), fill: "#0d0a0e", opacity: 0.94, "pointer-events": "none" }, gMark);
          for (let i = 0; i < 7; i++) mk("rect", { x: el.cx + Math.cos(i * 2.4) * (12 + i * 4) - 3, y: el.cy + Math.sin(i * 2.4) * (10 + i * 3.5) - 3, width: 6, height: 5.5, fill: shade(REALM_COL[h.realm], 0.5), opacity: 0.7, transform: `rotate(${i * 37} ${el.cx} ${el.cy})`, "pointer-events": "none" }, gMark);
        } else if (A.board && s.tideNext === h.key) mk("polygon", { points: hexPts(el.cx, el.cy, S - 3), fill: "rgba(13,10,14,.5)", "pointer-events": "none" }, gMark);
        if (s.founding && h.kind === "home" && h.realm === "south" && !isVoid) mk("path", { d: `M${el.cx},${el.cy - S * 0.78} l5,7 l-5,7 l-5,-7 Z`, fill: "#fff2b0", stroke: OBS, "stroke-width": 1.2, "pointer-events": "none" }, gMark);
        if (s.stones.includes(h.key)) { mk("polygon", { points: hexPts(el.cx, el.cy, 22), fill: "#7d858f", stroke: OBS, "stroke-width": 3 }, gMark); mk("path", { d: `M${el.cx - 12},${el.cy - 4} h24 M${el.cx - 12},${el.cy + 6} h24`, stroke: OBS, "stroke-width": 1.5 }, gMark); }
        const gr = s.groves[h.key];
        if (gr) mk("circle", { cx: el.cx, cy: el.cy, r: S * 0.62, fill: "none", stroke: gr.side === "p" ? "#7fae4a" : "#2e4a1a", "stroke-width": 5, "stroke-dasharray": "3 5" }, gMark);
        if (h.kind === "centre" && s.rules.centreOpens && s.round < s.rules.centreOpens && !ui.over) { mk("circle", { cx: el.cx, cy: el.cy, r: S * 0.5, fill: "rgba(26,21,32,.55)", stroke: OBS, "stroke-width": 2, "stroke-dasharray": "4 4", "pointer-events": "none" }, gMark); mk("text", { x: el.cx, y: el.cy + 4, "text-anchor": "middle", "font-size": 11, fill: BONE, "font-family": "Cinzel, Georgia, serif", "font-weight": 700, "pointer-events": "none" }, gMark).textContent = `SHUT · R${s.rules.centreOpens}`; }
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
      if (s.blank) {   // the blank tessera, and the pieces it has dulled
        const [bx, by] = px(s.blank.q, s.blank.r);
        mk("circle", { cx: bx, cy: by + 3, r: 25, fill: "rgba(0,0,0,.35)", "pointer-events": "none" }, gPiece);
        if (A.blank) mk("image", { href: A.blank, x: bx - 31, y: by - 30, width: 62, height: 62, "pointer-events": "none" }, gPiece);
        else { mk("circle", { cx: bx, cy: by, r: 25, fill: "#e9e2d0", stroke: "#8E97A3", "stroke-width": 5, "pointer-events": "none" }, gPiece); }
        mk("circle", { cx: bx, cy: by, r: S * 1.62, fill: "none", stroke: "rgba(233,226,208,.55)", "stroke-width": 2, "stroke-dasharray": "2 7", "pointer-events": "none" }, gMark);
      }
      { const wd = windDir(s); if (wd) { const [ax, ay] = px(wd[0], wd[1]), L = Math.hypot(ax, ay), ux = ax / L, uy = ay / L, ox = 196, oy2 = -196;
        const g = mk("g", { "pointer-events": "none" }, gMark); mk("circle", { cx: ox, cy: oy2, r: 30, fill: "rgba(26,21,32,.82)", stroke: GOLD, "stroke-width": 2 }, g);
        mk("path", { d: `M${ox - ux * 17},${oy2 - uy * 17} L${ox + ux * 17},${oy2 + uy * 17} M${ox + ux * 17},${oy2 + uy * 17} l${-ux * 9 - uy * 7},${-uy * 9 + ux * 7} M${ox + ux * 17},${oy2 + uy * 17} l${-ux * 9 + uy * 7},${-uy * 9 - ux * 7}`, stroke: BONE, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, g);
        mk("text", { x: ox, y: oy2 + 46, "text-anchor": "middle", "font-size": 12, fill: OBS, "font-family": "Cinzel, Georgia, serif", "font-weight": 700 }, g).textContent = "WIND"; } }
      for (const p of s.pieces) {
        if (!p.alive) continue;
        const [cx, cy] = px(p.q, p.r);
        const g = mk("g", { "pointer-events": "none" }, gPiece);
        const hidden = p.side === "e" && !p.rev;
        const disc = !hidden && A.piece[p.tribe];
        mk("circle", { cx, cy: cy + 3, r: 25, fill: "rgba(0,0,0,.35)" }, g);
        if (disc) {   // the tribe's mosaic disc, ringed in its side's colours
          mk("image", { href: disc, x: cx - 31, y: cy - 30, width: 62, height: 62 }, g);
          mk("circle", { cx, cy, r: 27, fill: "none", stroke: p.side === "p" ? BONE : OBS, "stroke-width": 4.5 }, g);
          mk("circle", { cx, cy, r: 30.2, fill: "none", stroke: p.side === "p" ? GOLD : RED, "stroke-width": 2, "stroke-dasharray": "3 2" }, g);
        } else {
        mk("circle", { cx, cy, r: 25, fill: hidden ? "#3a3440" : REALM_COL[TRIBE[p.tribe]], stroke: p.side === "p" ? BONE : OBS, "stroke-width": 6 }, g);
        mk("circle", { cx, cy, r: 19, fill: "none", stroke: p.side === "p" ? GOLD : RED, "stroke-width": 2, "stroke-dasharray": "3 2" }, g);
        }
        if (hidden) mk("text", { x: cx, y: cy + 8, "text-anchor": "middle", "font-size": 22, "font-family": "Cinzel, Georgia, serif", fill: BONE }, g).textContent = "?";
        else if (!disc) mk("path", { d: ICON[p.tribe], transform: `translate(${cx},${cy})`, fill: p.tribe === "earth" || p.tribe === "celestial" ? BONE : "none", stroke: p.tribe === "earth" || p.tribe === "celestial" ? OBS : BONE, "stroke-width": 2.6, "stroke-linecap": "round" }, g);
        if (p.side === "p" && p.tribe === "dark" && !p.rev) { mk("rect", { x: cx - 30, y: cy + 17, width: 60, height: 15, rx: 2, fill: OBS, opacity: 0.85 }, g); mk("text", { x: cx, y: cy + 28.5, "text-anchor": "middle", "font-size": 12, fill: BONE, "font-family": "Georgia, serif", "font-style": "italic" }, g).textContent = "face-down"; }
        if (dulled(s, p)) { mk("circle", { cx, cy, r: 27, fill: "rgba(233,226,208,.45)" }, g); mk("text", { x: cx, y: cy - 31, "text-anchor": "middle", "font-size": 11, fill: OBS, "font-family": "Georgia, serif", "font-style": "italic" }, g).textContent = "no power"; }
        if (ui.sel === p.id) mk("circle", { cx, cy, r: 34, fill: "none", stroke: "#fff", "stroke-width": 3 }, g);
      }
      {   // the piece in hand, or the elder's piece just looked at: its dragon, and how it moves
        const who = wrap.querySelector(".wrymwretch-six-realms-who");
        const p = s.pieces.find((x) => x.alive && x.id === (ui.sel || ui.look));
        const key = p ? p.id + (ui.sel ? "s" : "l") : "";
        if (who._key !== key || who._n !== Object.keys(A.dragon).length) {
          who._key = key; who._n = Object.keys(A.dragon).length; who.hidden = !p;
          if (p) { const pose = p.side === "p" ? "gift" : "glide", u = A.dragon[p.tribe + pose] || A.dragon[p.tribe + "glide"]; const D = DRAGON[p.tribe]; who.innerHTML = `${u ? `<img alt="${D[0].toUpperCase() + D.slice(1)} in ink" src="${u}">` : ""}<div><b>${p.side === "p" ? "YOUR" : "THE ELDER'S"} ${NAMES[p.tribe].toUpperCase()} · MOVES AS ${D.toUpperCase()} DOES</b>${MOVES[p.tribe]}</div>`; }
        }
      }
      wrap.querySelector("[data-round]").textContent = Math.min(s.round, ROUNDS);
      const ev = every(s);
      wrap.querySelector("[data-tide]").textContent = ev - (s.round % ev === 0 ? ev : s.round % ev) + 1;
      wrap.querySelector("[data-held]").textContent = `${thresholds(s, "p")}-${thresholds(s, "e")}`;
      const selP = ui.sel && s.pieces.find((x) => x.id === ui.sel);
      btn("stone").disabled = !(selP && selP.tribe === "earth" && selP.stones > 0) || ui.busy;
      btn("stone").textContent = selP && selP.tribe === "earth" ? `Raise a Stone (${selP.stones})` : "Raise a Stone";
      btn("stone").classList.toggle("on", ui.mode === "stone");
      const canW = genMoves(s, "p").some((m) => m.type === "recallw");
      btn("recall").textContent = s.voids.includes("0,0") ? "Recall Wrymreach" : "Recall";
      btn("recall").disabled = ui.busy || ui.over || !genMoves(s, "p").some((m) => m.type === "recall" || m.type === "recallw");
      btn("recall").classList.toggle("ready", canW);
      btn("recall").classList.toggle("on", ui.mode === "recall");
      btn("threat").classList.toggle("on", ui.threats);
      btn("undo").disabled = !ui.undo || ui.undoLeft < 1 || ui.busy;
    }

    function threatNote() {
      if (genMoves(s, "p").some((m) => m.type === "recallw")) return "Ilvarra: you hold two Thresholds, and it is your turn. Recall Wrymreach. Now.";
      if (s.voids.includes("0,0") && s.rules.elderRecalls && thresholds(s, "e") >= 2) return "Ilvarra: the elder holds two Thresholds. Take one back this turn, or the elder Recalls the centre.";
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
      const how = s.reason === "recall" ? (win ? "You begin a turn holding two Thresholds, and Recall Wrymreach into the board." : "The elder begins a turn holding two Thresholds, and Recalls Wrymreach.")
        : s.reason === "rounds" && s.voids.includes("0,0") ? `After ${ROUNDS} rounds nobody has Recalled the centre. A board with no centre is the elder's to keep.`
        : s.reason === "centre" ? (win ? "You end a turn on Wrymreach while holding a Threshold." : "The elder ends a turn on Wrymreach while holding a Threshold.")
        : s.reason === "taken" ? (win ? "You have taken all three of the elder's tribes." : "All three of your tribes are taken.")
        : `After ${ROUNDS} rounds the Thresholds stand ${thresholds(s, "p")} to ${thresholds(s, "e")}${win ? "" : " (a tie goes to the elder)"}.`;
      const found = s.founding ? { t: `The founding held: the tide ${s.voids.length ? "took " + s.voids.length + " hex" + (s.voids.length > 1 ? "es" : "") + ", none of them a Stonekeeper home" : "took nothing"}.`, kind: "link", note: hsKept === "founding" ? "The Heartstone's memory changes rooms: because the founding was kept in Heartstone, it anchors the Stonekeeper homes on every board." : "The Heartstone's memory changes rooms: what Rhyla kept in chapter 3 anchors the Stonekeeper homes on every board." } : null;
      if (ST === 1) return later(() => { if (dead) return; ctx.done(wrap, { win, record: { realm: "west", title: "Six Realms II: the Circle of Seasons", sub: "The Rim Moot · chapter 8", divider: 1, lines: [
        win ? `Won: ${how}` : { t: `Lost: ${how}`, kind: "lost" },
        win ? "The Circle of Seasons trusts the party. A watch well spent." : { t: "No trust from the Circle of Seasons. A watch spent for nothing.", kind: "lost" },
        s.blank ? `The blank tessera came onto the board at ${hexName(s.voids[0])} and stands on ${hexName(K(s.blank.q, s.blank.r))}.` : "The blank tessera never rose: the tide took nothing in time.", found ] },
        text: win ? `${how} The Circle of Seasons' elder turns the board a quarter round, to see it as you saw it, and nods. Three tables' rules at once, and a piece on it that belongs to nobody.` : `${how} The elder gathers the pieces by tribe, yours last. The blank one is left on the table. Nobody claims it.${losses + 1 >= 2 ? " The elder will be more forgiving at the next sitting." : ""}` }); }, 700);
      if (ST === 2) return later(() => { if (dead) return; ctx.done(wrap, { win, record: { realm: "east", title: "Six Realms III: the Tidecallers", sub: "The Rim Moot · chapter 8", divider: 1, lines: [
        win ? `Won: ${how}` : { t: `Lost: ${how}`, kind: "lost" },
        "The tide took Wrymreach first. The board had no goal, and had to be given one back.",
        win ? "The Tidecallers trust the party." : { t: "No trust from the Tidecallers.", kind: "lost" }, found ] },
        text: win ? `${how} The gold hex is back in the middle of the table because two of your tribes stood where it could be remembered from. The Tidecaller elder looks at it a long time. “We have played this game without a centre for a year,” she says. “I had forgotten it had one.”` : `${how} The Tidecaller elder does not gloat. She tips the last tesserae of the centre into her palm and holds them out, to show there is nothing written on them.${losses + 1 >= 2 ? " The elder will be more forgiving at the next sitting." : ""}` }); }, 700);
      later(() => { if (dead) return; ctx.done(wrap, { win, record: { realm: "below", title: "Six Realms I: the Syndicate Elder", sub: "Duskbane page · chapter 5, The Hunt", divider: 1, lines: [
        win ? `Won: ${how}` : { t: `Lost: ${how}`, kind: "lost" },
        win ? "The Syndicate trusts Kael. The forbidden chamber is open, and THE NAME enters the Record, fading." : { t: "No Syndicate trust yet. The guarded gallery, then.", kind: "lost" },
        found,
      ] }, text: (win ? { outcome: "win", text: `${how} The Syndicate Elder sets down the key, and Kael opens the forbidden chamber. On the pedestal of bone: “When the last memory fades, the Astral Architect shall rise.” (WW 77) “Shallock Izladar. A name the world was trying to forget.” (WW 79)` } : { outcome: "lose", text: `${how} The Syndicate keeps its key and its trust. Kael will have to go round through the guarded gallery instead.${losses + 1 >= 2 ? " The elder will be more forgiving at the next sitting." : ""}` }).text }); }, 700);
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
      if (s.voids.length > before) { log(`The tide forgets ${hexName(s.voids[s.voids.length - 1])}.`);
        if (s.voids[s.voids.length - 1] === "0,0") beat("centre", `The tide does not take a home. It takes the middle. The gold tesserae of Wrymreach go down into the dark under the table, and both of you sit looking at a game with nothing to win. <b>Wrymreach is void. Hold two Thresholds at the start of your turn, and Recall it.</b>`);
        else beat("tide1", `The first home hex drops its tiles into the dark under the table. Ilvarra goes quiet: this is how the realms are going.`);
        if (s.blank && !ui.beats.has("blank")) beat("blank", `Something comes up out of the hole the tide left: a tessera with nothing on it, bone-white, the Remnants' piece. It belongs to neither side. <b>It walks to the nearest Threshold, and a piece beside it has no power.</b>`); }
      if (s.tideNext && s.tideNext !== tideBefore && side === "e") { const h = hexName(s.tideNext); log(`${h[0].toUpperCase() + h.slice(1)} dims: the tide comes for it next.`); }
      if (side === "e" && s.rules.tide === "quicken" && s.round === QUICKEN) beat("quick", `The elder turns the tide-glass over. “The Tidecallers play it faster. So shall we.” <b>From now the tide forgets every second round.</b>`);
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
        if (ST) { /* the teaching notes belong to the first sitting */ }
        else if (ui.eTurns === 1) ilv.textContent = "Ilvarra: your Dark is face-down until it takes or an enemy stands beside it. Select it: it can also trade places with a friend within two hexes.";
        else if (ui.eTurns === 2) ilv.textContent = "Ilvarra: Wood leaves a Grove where it stood; the elder cannot step there for two turns. Earth can raise a Stone instead of moving (twice).";
        else if (ui.eTurns === 4) ilv.textContent = "Ilvarra: 'Show threats' marks every hex the elder can reach. Undo takes back one move, once.";
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
      if (here && here.side === "p") { ui.sel = ui.sel === here.id ? null : here.id; ui.mode = null; ui.look = null; }
      else { ui.sel = null; ui.mode = null; ui.look = here && here.rev ? here.id : null; }
      render();
    }
    gHex.addEventListener("click", (e) => { const g = e.target.closest(".wrymwretch-six-realms-hex"); if (g) clickHex(g.dataset.key); });
    gHex.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; const g = e.target.closest(".wrymwretch-six-realms-hex"); if (g) { e.preventDefault(); clickHex(g.dataset.key); } });
    btn("stone").addEventListener("click", () => { ui.mode = ui.mode === "stone" ? null : "stone"; render(); });
    btn("recall").addEventListener("click", () => { if (ui.busy || ui.over || !ui.started) return; const w = genMoves(s, "p").find((m) => m.type === "recallw"); if (w) return playerMove(w); ui.mode = ui.mode === "recall" ? null : "recall"; ui.sel = null; render(); });
    btn("threat").addEventListener("click", () => { ui.threats = !ui.threats; render(); });
    btn("undo").addEventListener("click", () => {
      if (!ui.undo || ui.undoLeft < 1 || ui.busy) return;
      s = JSON.parse(ui.undo.s); logEl.innerHTML = ui.undo.log; ui.undo = null; ui.undoLeft--;
      if (!A.board) HEXES.forEach((h) => { const el = hexEls[h.key]; if (el.dropped && !s.voids.includes(h.key)) { el.dropped = false; [...el.tiles.children].forEach((t) => { t.style.transform = ""; t.style.opacity = ""; t.removeAttribute("opacity"); }); } });
      ilv.textContent = "Ilvarra: once. The elder will not allow it twice."; render();
    });
    const intro = wrap.querySelector(".wrymwretch-six-realms-intro"), sb = wrap.querySelector("[data-start]");
    const keepBtn = wrap.querySelector("[data-founding]");
    keepBtn.addEventListener("click", () => keepBtn.setAttribute("aria-pressed", keepBtn.getAttribute("aria-pressed") === "true" ? "false" : "true"));
    opening(api.art, intro, CFG.chapter);
    ctx.picker(intro.querySelector("[data-tabs]"));

    sb.addEventListener("click", () => {
      if (hsKept) ctx.link(wrap, hsKept === "founding" ? `Because you kept <b>the founding</b> in Heartstone, the two Stonekeeper homes carry a chip of living crystal: the tide cannot take them.` : `Because you kept <b>the ${hsKept}</b> in Heartstone, and not the founding, nothing holds the Stonekeeper homes against the tide.`);
      if (keepBtn.getAttribute("aria-pressed") === "true") { s = initial(true, CFG); beat("found", `The two Stonekeeper homes are set with a chip of living crystal. <q>The stone remembers who laid it,</q> the elder says, not pleased. <b>The tide cannot forget a Stonekeeper home.</b>`); }
      intro.remove(); ui.started = true;
      if (ST === 1) { log("The Circle of Seasons' elder sets out the board, and two Stones with it. You move first.");
        beat("open", `A table at the Rim Moot, a watch before the fire. The Circle of Seasons' elder plays as three tribes' guest at once: <b>groves last three turns, two Stones stand already, and the wind (the arrow) carries a one-hex move one further.</b>`);
        ilv.textContent = "Ilvarra: watch the arrow. With the wind a step is two, and the elder's Sky goes four. Their Celestial shields whatever stands beside it. Be beside Wrymreach when it opens, at round 4.";
        render(); hexEls["0,2"].g.focus(); return; }
      if (ST === 2) { log("The Tidecaller elder sets out the board. You move first.");
        beat("open", `The Tidecallers' table, nearest the edge. “We play it fast,” the elder says, and turns the tide-glass before you have sat down. <b>The tide forgets every second round.</b> The centre hex is already dim.`);
        ilv.textContent = "Ilvarra: do not go for the centre. Look at it. Put two of yours on Thresholds, and keep them there one turn.";
        s.tideNext = "0,0"; render(); hexEls["0,2"].g.focus(); return; }
      log("The Syndicate Elder sets out the board. You move first.");
      beat("open", `Under the Syndicate's labyrinth, Kael Duskbane sits across from the Syndicate Elder. Behind the elder hangs the key to the forbidden chamber. “Play the tribes' game,” the elder says, “and I will know whether you understand the world.”`);
      ilv.textContent = "Ilvarra: pick one of your pieces at the bottom. Earth cannot be taken on a home hex. Wrymreach is shut until round 4: be standing beside it by then, with a Threshold held.";
      render(); hexEls["0,2"].g.focus();
    });
    sb.focus();
    render();
    return { unmount() { ui.over = true; dead = true; timers.forEach(clearTimeout); wrap.remove(); } };
}

export default staged({ stages: LADDER }, play);

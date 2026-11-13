// Missing Campsites / Pack List (1D, wax crayon on kraft paper).
//
// DESIGN.md section 11, Pack List, at pack_list_1: five seats round the fire, the chain at most ten,
// one phantom: "a blue enamel kettle" (site 5's table), which Rafe's repetition includes though
// nobody added it. Each speaker says the chain in order and adds one item; each word fades 4 s after
// it is said (the last three stay 2 s longer on this first appearance; "Hold the chain" keeps all).
// On Tam's turn, tap the tiles in the chain's order, then add one of three items from Tam's pack.
// The phantom may be repeated where Rafe put it (accepted +1), or challenged: press "Nobody said
// that." and tap it (a line in the notebook). A false challenge costs warmth. A wrong order loses
// the round; everyone laughs. June fails on lap 3, cheerfully, and the round is won.

const P = "missing-campsites-pack-list-";
const SEATS = [
  { name: "June", color: "#3f7d3a" }, { name: "Dell", color: "#9c3b30" }, { name: "Rafe", color: "#6b3f8a" },
  { name: "Inés", color: "#c48a1a" }, { name: "Tam", color: "#2b5d8a" },
];
const ADDS = { June: ["a tarp", "a whistle"], Dell: ["marshmallows", "foil"], Rafe: ["rope", "a deck of cards"], "Inés": ["a tin mug", "a sun hat"] };
const TAM_PACK = [["a pencil", "wool socks", "the notebook"], ["spare batteries", "a compass", "a harmonica"]];
const PHANTOM = "a blue enamel kettle";
const PHANTOM_AFTER = 3;          // Rafe slips it in after the third item, on lap 2
const DISTRACT = ["a lantern", "bug spray", "a fishing rod", "a map", "a blanket", "a camera", "a frying pan"];

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;color:#2b1d14;font-family:Caveat,'Segoe Print','Comic Sans MS',cursive;background:#b98b5a;
  background-image:radial-gradient(rgba(70,40,15,.18) 1px,transparent 1.4px),radial-gradient(rgba(255,230,190,.12) 1px,transparent 1.6px),repeating-linear-gradient(8deg,rgba(90,55,25,.06) 0 2px,transparent 2px 7px);
  background-size:7px 7px,11px 11px,auto;display:grid;grid-template-rows:auto 1fr;gap:10px;padding:12px;box-sizing:border-box}
.${P}band{background:#e9d9b7;padding:8px 14px;min-height:66px;position:relative}
.${P}band small{display:block;font-size:17px;color:#6b5236}
.${P}words{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:clamp(19px,2.6vw,25px);min-height:30px}
.${P}words span{transition:opacity .8s}
.${P}words span.fade{opacity:0}
.${P}words span.ring{outline:3px solid #c8321f;outline-offset:2px;border-radius:40%}
.${P}main{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
.${P}fire{width:100%;max-height:62vh;height:auto;display:block}
.${P}side{display:flex;flex-direction:column;gap:10px}
.${P}tray{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;background:#6e4f2e;padding:8px}
.${P}tile{position:relative;font:inherit;font-size:clamp(15px,2vw,19px);line-height:1;background:#f4ead2;color:#2b1d14;border:0;padding:12px 4px;min-height:52px;cursor:pointer}
.${P}tile:disabled{opacity:.35;cursor:default}
.${P}tile.used{background:#d9cba9;color:#7a6650}
.${P}tile.caught{outline:3px solid #c8321f}
.${P}tile:focus-visible{outline:3px solid #2b5d8a}
.${P}edge{position:absolute;inset:2px;border:3px solid #3b3734;filter:url(#mc-pl-wax);pointer-events:none}
.${P}row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.${P}no{font:inherit;font-size:22px;background:#c8321f;color:#fff;border:0;padding:10px 18px;cursor:pointer;position:relative}
.${P}no.on{background:#7a1a0e;outline:3px dashed #fff3}
.${P}no:disabled{opacity:.4}
.${P}say{font-size:20px;background:#e9d9b7;padding:6px 10px;min-height:28px}
.${P}note{font-size:18px;color:#4a4a4c;background:#fbf8ee;padding:6px 10px;border-left:3px solid #d58a7a}
.${P}hold{font:600 12px 'IBM Plex Mono',monospace;display:flex;gap:6px;align-items:center;color:#2b1d14}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(110,79,46,.85);z-index:4;padding:16px}
.${P}intro div{max-width:470px;background:#f4ead2;padding:18px 22px;font-size:20px;line-height:1.2}
.${P}intro h2{margin:0 0 8px;font-size:34px}
.${P}intro p{margin:0 0 8px}
.${P}intro button{font:inherit;font-size:24px;background:#c8321f;color:#fff;border:0;padding:8px 22px;cursor:pointer}
@media (max-width:700px){.${P}main{grid-template-columns:1fr}.${P}fire{max-height:38vh}}
`;

export default {
  mount(root, api) {
    const rng = api.rng();
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mc-pl-wax"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></svg>
      <div class="${P}band"><small>I packed my bag, and in it I put…</small><div class="${P}words" aria-live="polite"></div></div>
      <div class="${P}main"><svg class="${P}fire" viewBox="0 0 400 380" aria-label="The fire ring and the seats"></svg>
        <div class="${P}side"><div class="${P}say">Waiting by the fire.</div><div class="${P}tray"></div>
          <div class="${P}row"><button type="button" class="${P}no" disabled>Nobody said that.</button>
          <label class="${P}hold"><input type="checkbox"> Hold the chain</label></div>
          <div class="${P}note" hidden></div></div></div>
      <div class="${P}intro"><div><h2>Pack List</h2>
        <p>Round the fire, each friend says the whole list in order, then adds one thing. The words fade.</p>
        <p>On your turn tap the tiles in order, then add something of yours. If you hear a thing nobody added, press "Nobody said that." and tap it. Get the order wrong and you're out.</p>
        <button type="button">Start</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    const words = $(`.${P}words`), tray = $(`.${P}tray`), sayEl = $(`.${P}say`), noBtn = $(`.${P}no`), noteEl = $(`.${P}note`);
    const holdBox = $(`.${P}hold input`);
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, api.reducedMotion ? Math.min(ms, 400) : ms); timers.push(t); return t; };
    let over = false, chain = [], phantomSaid = false, phantomUsed = false, caught = false, accepted = 0, warmth = 0, mistakes = 0;
    let turn = null; // Tam's turn state

    // ---- the fire and the seats, in crayon ----
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(`.${P}fire`);
    const mk = (tag, a, parent = svg) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); parent.appendChild(n); return n; };
    const ngon = (x, y, r, n, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * Math.PI * 2; return `${(x + Math.cos(a) * r).toFixed(1)},${(y + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
    const wax = { filter: "url(#mc-pl-wax)" };
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mk("polygon", { points: ngon(200 + Math.cos(a) * 70, 190 + Math.sin(a) * 70, 15, 6, a), fill: "#6e6b66", stroke: "#3b3734", "stroke-width": 4, ...wax }); }
    mk("polygon", { points: ngon(200, 190, 55, 12), fill: "#2b1d14", ...wax });
    [["#d8401f", 46], ["#f08a24", 32], ["#ffd23f", 18]].forEach(([c, r]) => {
      const pts = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; const rr = i % 2 ? r * 0.45 : r; return `${(200 + Math.cos(a) * rr).toFixed(1)},${(190 + Math.sin(a) * rr).toFixed(1)}`; }).join(" ");
      mk("polygon", { points: pts, fill: c, stroke: c, "stroke-width": 3, ...wax });
    });
    const seatEls = SEATS.map((s, i) => {
      const a = -Math.PI / 2 + i / SEATS.length * Math.PI * 2 + (i === 4 ? 0 : 0);
      const x = 200 + Math.cos(a) * 150, y = 190 + Math.sin(a) * 150;
      const g = mk("g", {});
      const r = mk("rect", { x: x - 42, y: y - 28, width: 84, height: 56, fill: "#f4ead2", stroke: s.color, "stroke-width": 4, ...wax }, g);
      mk("path", { d: `M${x - 10} ${y - 6} L${x} ${y - 16} L${x + 10} ${y - 6}`, fill: "none", stroke: s.color, "stroke-width": 3, ...wax }, g);
      const t = mk("text", { x, y: y + 18, "text-anchor": "middle", "font-size": 22, fill: s.color, "font-family": "Caveat, cursive", "font-weight": 700 }, g);
      t.textContent = s.name;
      return { g, r, x, y };
    });
    const light = (i) => seatEls.forEach((s, k) => { s.r.setAttribute("stroke-width", k === i ? 8 : 4); s.r.setAttribute("fill", k === i ? "#fff6dd" : "#f4ead2"); });

    // ---- the spoken band ----
    function speak(word, who, stay = 4000) {
      const s = document.createElement("span");
      s.textContent = word;
      s.style.color = who.color;
      words.appendChild(s);
      if (!holdBox.checked) later(() => s.classList.add("fade"), stay);
      if (words.children.length > 14) words.firstChild.remove();
      return s;
    }
    holdBox.addEventListener("change", () => { if (holdBox.checked) words.querySelectorAll(".fade").forEach((s) => s.classList.remove("fade")); });

    // A friend recites the chain, then adds one. Rafe on lap 2 slips the kettle in.
    function friendTurn(i, lap, done) {
      const who = SEATS[i];
      light(i);
      sayEl.textContent = `${who.name}: "I packed my bag, and in it I put…"`;
      words.innerHTML = "";
      const said = chain.slice();
      if (who.name === "Rafe" && lap === 2) { said.splice(PHANTOM_AFTER, 0, PHANTOM); phantomSaid = true; }
      if (who.name === "June" && lap === 3) {
        const stopAt = 6;
        said.slice(0, stopAt).forEach((w, k) => later(() => speak(w, who), 700 * (k + 1)));
        later(() => { sayEl.textContent = `June: "…and…a…" She laughs into her sleeve. "I'm out. I'm out!"`; done(); }, 700 * (stopAt + 2));
        return;
      }
      const n = said.length;
      said.forEach((w, k) => later(() => speak(w, who, 4000 + (k >= n - 3 ? 2000 : 0)), 700 * (k + 1)));
      const add = ADDS[who.name][lap - 1];
      later(() => { speak(add, who, 6000); chain.push(add); sayEl.textContent = `${who.name} adds ${add}.`; }, 700 * (n + 1) + 300);
      later(done, 700 * (n + 2) + 600);
    }

    function tamTurn(lap, done) {
      light(4);
      sayEl.textContent = "Your turn. Say it in order.";
      const pool = new Set(chain);
      if (phantomSaid) pool.add(PHANTOM);
      const extra = DISTRACT.slice().sort(() => rng() - 0.5);
      while (pool.size < 16 && extra.length) pool.add(extra.pop());
      const items = [...pool].sort(() => rng() - 0.5);
      turn = { lap, idx: 0, challenge: false, done, adding: false };
      tray.innerHTML = "";
      items.forEach((w) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "tile";
        b.innerHTML = `<span class="${P}edge"></span>`;
        b.appendChild(document.createTextNode(w));
        b.addEventListener("click", () => tapTile(w, b));
        tray.appendChild(b);
      });
      noBtn.disabled = !phantomSaid || caught;
      if (chain.length === 0) startAdding();
      tray.querySelector("button")?.focus();
    }

    function tamWord(w) { speak(w, SEATS[4], 8000); }

    function tapTile(w, b) {
      if (!turn || over) return;
      if (turn.adding) return;
      if (turn.challenge) {
        turn.challenge = false; noBtn.classList.remove("on");
        if (w === PHANTOM) {
          caught = true; b.classList.add("caught"); b.disabled = true; noBtn.disabled = true;
          words.querySelectorAll("span").forEach((s) => { if (s.textContent === PHANTOM) s.classList.add("ring"); });
          sayEl.textContent = `Rafe looks at the fire. "Did I? … I did, didn't I."`;
          noteEl.hidden = false;
          noteEl.textContent = `Notebook: "${PHANTOM}". Nobody packed it. Site 5's table, 16:10, day 1.`;
        } else {
          warmth -= 1;
          sayEl.textContent = `"I did say that." A small silence. (Warmth −1)`;
        }
        return;
      }
      if (w === chain[turn.idx]) {
        turn.idx++; b.classList.add("used"); tamWord(w);
        if (turn.idx >= chain.length) startAdding();
        return;
      }
      if (w === PHANTOM && !phantomUsed && !caught && turn.idx === PHANTOM_AFTER) {
        phantomUsed = true; accepted++; b.classList.add("used"); tamWord(w);
        return;
      }
      // a wrong order loses the round
      mistakes++;
      b.style.outline = "3px solid #c8321f";
      sayEl.textContent = `"${w}"? Everyone laughs. Dell: "Out! Tam's out."`;
      const wanted = chain[turn.idx];
      turn = null;
      over = true;
      later(() => api.end({ outcome: "lose", text: `You said ${w} where ${wanted} went. Everyone laughs; nothing else is lost.${caught ? " The kettle line stays in your notebook." : ""}` }), 1600);
    }

    function startAdding() {
      turn.adding = true;
      noBtn.disabled = true;
      sayEl.textContent = "Now add something of yours.";
      tray.innerHTML = "";
      TAM_PACK[turn.lap - 1].forEach((w) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "tile";
        b.innerHTML = `<span class="${P}edge"></span>`;
        b.appendChild(document.createTextNode(w));
        b.addEventListener("click", () => {
          tamWord(w); chain.push(w);
          sayEl.textContent = `You add ${w}.`;
          tray.innerHTML = "";
          const d = turn.done; turn = null;
          later(d, 900);
        });
        tray.appendChild(b);
      });
      tray.querySelector("button")?.focus();
    }

    noBtn.addEventListener("click", () => {
      if (!turn || turn.adding || caught) return;
      turn.challenge = !turn.challenge;
      noBtn.classList.toggle("on", turn.challenge);
      sayEl.textContent = turn.challenge ? "Tap the thing nobody said." : "Your turn. Say it in order.";
    });

    // The order: June, Dell, Rafe, Inés, Tam, for two laps; June fails on lap 3.
    function run(lap, seat) {
      if (over) return;
      if (lap === 3) {
        friendTurn(0, 3, () => {
          over = true;
          warmth += mistakes ? 0 : 1;
          const ph = caught ? "You caught the kettle; the line is in your notebook." : phantomUsed ? "You repeated the kettle as if someone had packed it." : "Nobody mentioned the kettle again.";
          later(() => api.end({ outcome: "win", text: `June is out, laughing, and the round is yours. ${ph} Warmth ${warmth >= 0 ? "+" : ""}${warmth}.` }), 1800);
        });
        return;
      }
      const next = () => (seat === 4 ? run(lap + 1, 0) : run(lap, seat + 1));
      if (seat === 4) tamTurn(lap, next); else friendTurn(seat, lap, next);
    }

    const go = $(`.${P}intro button`);
    go.addEventListener("click", () => { $(`.${P}intro`).remove(); later(() => run(1, 0), 400); });
    go.focus();

    return {
      unmount() { over = true; timers.forEach(clearTimeout); },
    };
  },
};

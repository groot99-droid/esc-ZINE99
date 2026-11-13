// People of the Bark — Omen Spread (1D, marginalia drolleries).
// DESIGN.md 11.1, cut to one spread: the Beetle (c3_omen_beetle). Lay three cards from the hand in
// Root, Branch and Crown around the event card. Meaning = the suit with the highest weight (event
// card counts 2; ties go to Root's suit). Policy = the sigil on two or three cards; one of each is a
// balanced reading. Clear = all three of the event's suit; Bold = none. Fit = the meaning matches the
// real cause on the Backyard card. Special rule of this spread: a Spear policy reads the Beetle as a
// monster; anything else reads it as a god. A spread always finishes ("done").

const SUITS = {
  wind: { name: "Wind", belief: "a Trial" },
  rain: { name: "Rain", belief: "a Blessing" },
  song: { name: "Song", belief: "a Prophecy" },
  tremor: { name: "Tremor", belief: "a Message" },
  leaf: { name: "Leaf", belief: "an Omen of Death" },
  mandible: { name: "Mandible", belief: "a Visitor" },
};
const SIGILS = { eye: "the Knot", spear: "the Battlements", quill: "the Scroll House" };
const DECK = [
  ["wind", "eye", "The Bowed Elder", 2], ["wind", "spear", "The Bending Ridge", 3], ["wind", "quill", "The Counted Gust", 1],
  ["rain", "eye", "The Full Cup", 3], ["rain", "spear", "The Washed Spear", 1], ["rain", "quill", "The Marked Bead", 2],
  ["song", "eye", "The Singer Above", 3], ["song", "spear", "The War Note", 1], ["song", "quill", "The Written Tune", 2],
  ["tremor", "eye", "The Shaken Lamp", 1], ["tremor", "spear", "The Braced Wall", 2], ["tremor", "quill", "The Long Scroll", 3],
  ["leaf", "eye", "The Last Leaf", 3], ["leaf", "spear", "The Falling Shield", 2], ["leaf", "quill", "The Leaf Count", 1],
  ["mandible", "eye", "The Great Visitor", 1], ["mandible", "spear", "The Biting Thing", 3], ["mandible", "quill", "The Measured Shell", 2],
].map(([suit, sigil, name, w], id) => ({ id, suit, sigil, name, w }));
const EVENT = { suit: "mandible", name: "THE BEETLE", fit: "mandible", cause: "A ground beetle, wandering" };
const INK = "#3a281c", RED = "#b8402a", BLUE = "#2f5a8c", GOLD = "#d9902a", GREEN = "#6f8a4a", PAPER = "#efe2c4";

const SIGIL_SVG = {
  eye: `<path d="M-26 0 Q0 -22 26 0 Q0 22 -26 0Z" fill="none" stroke="${INK}" stroke-width="3"/><circle r="8" fill="${INK}"/><circle r="3" cx="-2" cy="-2" fill="${PAPER}"/>`,
  spear: `<path d="M0 -30 L7 -14 L2 -14 L2 30 L-2 30 L-2 -14 L-7 -14Z" fill="${INK}"/><path d="M-8 18 L8 18" stroke="${INK}" stroke-width="3"/>`,
  quill: `<path d="M18 -30 C-10 -18 -16 8 -14 22 C-2 10 12 -6 18 -30Z" fill="none" stroke="${INK}" stroke-width="3"/><path d="M-14 22 L-20 32 M-12 14 L10 -20" stroke="${INK}" stroke-width="2"/>`,
};
const SUIT_SVG = {
  wind: `<path d="M-9 -3 Q-3 -8 3 -3 T9 -3 M-9 3 Q-3 -2 3 3 T9 3" fill="none" stroke="${RED}" stroke-width="1.8"/>`,
  rain: `<path d="M0 -8 Q7 2 0 7 Q-7 2 0 -8Z" fill="${BLUE}"/>`,
  song: `<path d="M-2 6 L-2 -8 L6 -6" fill="none" stroke="${RED}" stroke-width="1.8"/><circle cx="-5" cy="6" r="3.2" fill="${RED}"/>`,
  tremor: `<path d="M-10 0 L-6 -6 L-2 6 L2 -6 L6 6 L10 0" fill="none" stroke="${RED}" stroke-width="1.8"/>`,
  leaf: `<path d="M-8 8 Q-8 -8 8 -8 Q8 8 -8 8Z" fill="${GREEN}"/><path d="M-8 8 L6 -6" stroke="${PAPER}" stroke-width="1"/>`,
  mandible: `<path d="M-7 8 Q-10 -4 -2 -8 Q-6 0 -3 6 M7 8 Q10 -4 2 -8 Q6 0 3 6" fill="none" stroke="${INK}" stroke-width="2"/>`,
};

export default {
  mount(root, api) {
    const P = "people-of-the-bark-omen-spread-";
    const offs = [];
    const on = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };
    const rnd = api.rng();

    // deal: 5 cards, at least one of the event's suit
    const deck = DECK.slice();
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    let hand = deck.slice(0, 5);
    if (!hand.some((c) => c.suit === EVENT.suit)) hand[4] = deck.find((c) => c.suit === EVENT.suit);
    const slots = { root: null, branch: null, crown: null };
    let selected = null, turned = false, done = false;

    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `
<style>
.${P}wrap{position:absolute;inset:0;overflow:auto;color:${INK};font-family:'Cormorant Garamond',Georgia,serif;
 background:radial-gradient(ellipse at 30% 20%,rgba(255,250,235,.7),transparent 60%),radial-gradient(ellipse at 80% 90%,rgba(217,144,42,.18),transparent 50%),#e6d4ad}
.${P}page{position:relative;min-height:100%;box-sizing:border-box;padding:18px clamp(40px,7vw,96px) 22px;display:grid;grid-template-columns:minmax(0,1fr) minmax(160px,230px);grid-template-rows:auto 1fr auto;gap:12px 18px;
 grid-template-areas:"head side" "table side" "hand hand"}
.${P}frame{position:absolute;inset:10px clamp(28px,5vw,72px);border:2px solid ${RED};outline:1px solid ${RED};outline-offset:4px;pointer-events:none}
.${P}vine{position:absolute;top:0;bottom:0;width:clamp(26px,4.5vw,64px);pointer-events:none}
.${P}vine svg{width:100%;height:100%}
.${P}head{grid-area:head;display:flex;align-items:flex-start;gap:12px}
.${P}init{font-family:'IM Fell English',Georgia,serif;font-size:44px;line-height:1;background:${BLUE};color:${GOLD};padding:2px 10px 6px;border:2px solid ${GOLD}}
.${P}head h2{margin:0;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,32px)}
.${P}head p{margin:2px 0 0;font-size:16px;font-style:italic;max-width:46ch}
.${P}table{grid-area:table;display:grid;grid-template-columns:repeat(3,auto);grid-template-rows:auto auto;justify-content:center;align-content:center;gap:28px clamp(10px,3vw,40px);
 grid-template-areas:". crown ." "root event branch"}
.${P}slot{width:var(--cw);height:calc(var(--cw)*1.45);border:2px dashed rgba(184,64,42,.6);border-radius:8px;position:relative;display:grid;place-items:center;cursor:pointer;background:rgba(255,250,235,.25)}
.${P}slot.${P}hot{border-color:${GOLD};background:rgba(240,192,80,.25)}
.${P}slot>span{position:absolute;bottom:-20px;left:0;right:0;text-align:center;font:600 11px ui-monospace,monospace;letter-spacing:.2em;color:${RED}}
.${P}wrap{--cw:clamp(78px,10vw,118px)}
.${P}card{width:var(--cw);height:calc(var(--cw)*1.45);background:#fbf3df;border:1.5px solid ${INK};border-radius:8px;box-shadow:2px 3px 0 rgba(58,40,28,.35);position:relative;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;transition:transform .15s}
.${P}card svg{width:100%;height:100%;display:block}
.${P}card.${P}sel{transform:translateY(-12px) rotate(-2deg);box-shadow:0 0 0 3px ${GOLD},2px 6px 0 rgba(58,40,28,.35)}
.${P}card.${P}ev{border:2px solid ${GOLD};cursor:default}
.${P}hand{grid-area:hand;display:flex;justify-content:center;flex-wrap:wrap;gap:10px;padding-top:10px;min-height:calc(var(--cw)*1.45 + 24px)}
.${P}hand .${P}card:nth-child(odd){transform:rotate(-3deg)}.${P}hand .${P}card:nth-child(even){transform:rotate(2.5deg)}
.${P}hand .${P}card.${P}sel{transform:translateY(-14px)}
.${P}num{position:absolute;top:-10px;left:-8px;background:${INK};color:${PAPER};font:11px ui-monospace,monospace;width:18px;height:18px;border-radius:50%;display:grid;place-items:center}
.${P}side{grid-area:side;display:flex;flex-direction:column;gap:12px}
.${P}preview{font-family:'IM Fell English',Georgia,serif;font-size:18px;line-height:1.3;color:${INK};min-height:6em}
.${P}preview em{color:${RED}}
.${P}preview small{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;margin-top:6px;color:#5a3d2b}
.${P}rope{display:grid;gap:5px;font:12px ui-monospace,monospace}
.${P}rope div{display:grid;grid-template-columns:52px 1fr 52px;align-items:center;gap:6px}
.${P}strand{height:8px;border-radius:4px;background:repeating-linear-gradient(60deg,var(--c) 0 6px,rgba(0,0,0,.18) 6px 8px)}
.${P}back{display:flex;gap:10px;align-items:flex-end}
.${P}bk{width:calc(var(--cw)*.82);height:calc(var(--cw)*1.2);border-radius:6px;border:1.5px solid ${INK};background:repeating-linear-gradient(45deg,#7a3a22 0 5px,#8e4a2a 5px 10px);display:grid;place-items:center;color:${GOLD};font:28px 'IM Fell English',serif;cursor:pointer;flex:none}
.${P}bk.${P}up{background:#fbf3df;color:${INK};cursor:default;font:12px 'Cormorant Garamond',serif;padding:4px;text-align:center;place-items:stretch}
.${P}lay{font:inherit;font-family:'IM Fell English',Georgia,serif;font-size:19px;background:${RED};color:${PAPER};border:0;padding:8px 14px;cursor:pointer;border-radius:3px}
.${P}lay:disabled{opacity:.4;cursor:default}
.${P}help{font-size:14px;font-style:italic;color:#5a3d2b}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(230,212,173,.94);z-index:4;padding:16px}
.${P}intro div{max-width:470px;border:2px solid ${RED};outline:1px solid ${RED};outline-offset:4px;background:#f6ead0;padding:20px 22px}
.${P}intro h2{margin:0 0 6px;font-family:'IM Fell English',Georgia,serif;font-weight:400;font-size:30px;color:${RED}}
.${P}intro p{margin:0 0 10px;font-size:18px;line-height:1.35}
.${P}ghost{position:fixed;pointer-events:none;z-index:50;opacity:.9;transform:rotate(-4deg)}
@media (max-width:720px){.${P}page{grid-template-columns:1fr;grid-template-areas:"head" "side" "table" "hand";padding:16px 34px 22px}.${P}side{flex-direction:row;flex-wrap:wrap}.${P}preview{flex:1 1 220px;min-height:0}.${P}wrap{--cw:clamp(64px,19vw,96px)}.${P}table{gap:28px 8px}}
</style>
<div class="${P}page">
 <div class="${P}frame"></div>
 <div class="${P}vine" style="left:0"></div><div class="${P}vine" style="right:0"></div>
 <div class="${P}head"><div class="${P}init">T</div><div><h2>The Beetle</h2><p>A shape as big as a city climbs from the Under. The Knot lays out a spread.</p></div></div>
 <div class="${P}table">
  <div class="${P}slot" data-s="crown" style="grid-area:crown"><span>CROWN · C</span></div>
  <div class="${P}slot" data-s="root" style="grid-area:root"><span>ROOT · R</span></div>
  <div style="grid-area:event" class="${P}evwrap"></div>
  <div class="${P}slot" data-s="branch" style="grid-area:branch"><span>BRANCH · B</span></div>
 </div>
 <div class="${P}side">
  <div class="${P}preview" aria-live="polite"></div>
  <div class="${P}rope"></div>
  <div class="${P}back"><div class="${P}bk" role="button" tabindex="0" aria-label="Turn the Backyard card">?</div><div class="${P}help">Backyard card: only you can turn it. It can never be placed.</div></div>
  <button class="${P}lay" type="button" disabled>Lay the reading</button>
 </div>
 <div class="${P}hand"></div>
</div>
<div class="${P}intro"><div>
 <h2>Omen Spread</h2>
 <p>Lay three cards: <b>Root</b> (why it came), <b>Branch</b> (what it asks of us), <b>Crown</b> (what will come of it). Drag a card to a slot, or tap a card then a slot. Keys: <b>1–5</b> pick, <b>R B C</b> place.</p>
 <p>The heaviest suit is what it means; the sigil on two cards decides who answers. Here, a Spear reading makes the Beetle a monster to fight. Anything else makes it a god to escort.</p>
 <button class="${P}lay" type="button">Begin the reading</button>
</div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector("." + P + s);
    const handEl = $("hand"), preview = $("preview"), ropeEl = $("rope"), layBtn = wrap.querySelector(`.${P}side .${P}lay`), bk = $("bk");

    // margin vines with drolleries (a snail below, a bird above)
    function vineSvg(seed, flip) {
      const r = api.rng(seed);
      let d = "M20 0", leaves = "";
      for (let y = 0; y <= 1000; y += 40) {
        const x = 20 + Math.sin(y / 70 + seed) * 9;
        d += ` Q${x + (flip ? -10 : 10)} ${y - 20} ${x} ${y}`;
        const side = (y / 40) % 2 ? 1 : -1, col = [GREEN, RED, GOLD, BLUE][Math.floor(r() * 4)];
        leaves += `<path d="M${x} ${y} q${side * 14} -10 ${side * 22} -2 q${-side * 10} 8 ${-side * 22} 2Z" fill="${col}" opacity=".85"/>`;
      }
      const bird = `<g transform="translate(22 70)"><ellipse rx="11" ry="7" fill="${BLUE}"/><circle cx="${flip ? -10 : 10}" cy="-7" r="5" fill="${BLUE}"/><path d="M${flip ? -15 : 15} -7 l${flip ? -6 : 6} 2 l${flip ? 6 : -6} 1z" fill="${GOLD}"/><path d="M0 7 L-2 16 M4 7 L4 16" stroke="${INK}" stroke-width="1.2"/></g>`;
      const snail = `<g transform="translate(22 940)"><path d="M-14 8 L16 8 Q20 8 20 4" fill="none" stroke="${INK}" stroke-width="2"/><circle r="10" fill="${GOLD}" stroke="${LANT()}" stroke-width="1.5"/><path d="M0 0 m-6 0 a6 6 0 1 0 6 -6 a4 4 0 1 0 -4 4" fill="none" stroke="${RED}" stroke-width="1.3"/></g>`;
      return `<svg viewBox="0 0 44 1000" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${GREEN}" stroke-width="2"/>${leaves}${flip ? bird : snail}</svg>`;
    }
    function LANT() { return "#e8742a"; }
    const vines = wrap.querySelectorAll("." + P + "vine");
    vines[0].innerHTML = vineSvg(3, false); vines[1].innerHTML = vineSvg(8, true);

    function cardSvg(c, ev) {
      if (ev) {
        return `<svg viewBox="0 0 100 145"><rect x="4" y="4" width="92" height="137" rx="6" fill="none" stroke="${GOLD}" stroke-width="1"/>
<rect x="18" y="16" width="64" height="16" fill="${RED}"/><text x="50" y="28" text-anchor="middle" font-family="IM Fell English,serif" font-size="11" fill="${PAPER}" letter-spacing="1.5">EVENT</text>
<g transform="translate(50 76) scale(1.4)">${SUIT_SVG.mandible}</g>
<g transform="translate(50 76)"><ellipse rx="22" ry="15" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M-12 -12 Q-24 -26 -30 -18 M12 -12 Q24 -26 30 -18" fill="none" stroke="${INK}" stroke-width="1.5"/></g>
<text x="50" y="122" text-anchor="middle" font-family="IM Fell English,serif" font-size="10" fill="${INK}" letter-spacing="1">${EVENT.name}</text>
<text x="50" y="134" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="9" fill="${RED}">Mandible · weight 2</text></svg>`;
      }
      const dots = Array.from({ length: c.w }, (_, i) => `<circle cx="${84 - i * 8}" cy="14" r="3" fill="none" stroke="${GOLD}" stroke-width="1.6"/>`).join("");
      return `<svg viewBox="0 0 100 145" role="img" aria-label="${c.name}, ${SUITS[c.suit].name}, ${c.sigil}, weight ${c.w}">
<path d="M8 12 q4 -6 8 0 t8 0 t8 0" fill="none" stroke="${RED}" stroke-width="1.5"/>
<g transform="translate(16 26)">${SUIT_SVG[c.suit]}</g>${dots}
<g transform="translate(50 70)">${SIGIL_SVG[c.sigil]}</g>
<text x="50" y="122" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="10.5" fill="${INK}">${c.name}</text>
<text x="50" y="135" text-anchor="middle" font-family="ui-monospace,monospace" font-size="7" fill="${RED}" letter-spacing="1">${SUITS[c.suit].name.toUpperCase()}</text></svg>`;
    }
    function makeCard(c, numberLabel) {
      const d = document.createElement("div");
      d.className = P + "card"; d.tabIndex = 0; d.dataset.id = c.id;
      d.innerHTML = cardSvg(c) + (numberLabel ? `<span class="${P}num">${numberLabel}</span>` : "");
      attachDrag(d, c);
      return d;
    }
    const evCard = document.createElement("div");
    evCard.className = P + "card " + P + "ev"; evCard.innerHTML = cardSvg(null, true);
    $("evwrap").appendChild(evCard);

    // ---- reading logic ----
    function reading() {
      const placed = Object.values(slots).filter(Boolean);
      const wsum = {};
      wsum[EVENT.suit] = 2;
      for (const c of placed) wsum[c.suit] = (wsum[c.suit] || 0) + c.w;
      let best = -1, meaning = null;
      for (const [s, w] of Object.entries(wsum)) if (w > best) { best = w; meaning = s; }
      const tied = Object.entries(wsum).filter(([, w]) => w === best).map(([s]) => s);
      if (tied.length > 1 && slots.root && tied.includes(slots.root.suit)) meaning = slots.root.suit;
      const count = { eye: 0, spear: 0, quill: 0 };
      for (const c of placed) count[c.sigil]++;
      let policy = null, balanced = false;
      for (const k in count) if (count[k] >= 2) policy = k;
      if (placed.length === 3 && !policy) balanced = true;
      const delta = { eye: 0, spear: 0, quill: 0 }; let morale = 0;
      if (policy && count[policy] === 2) delta[policy] += 6;
      if (policy && count[policy] === 3) { delta[policy] += 9; for (const k in delta) if (k !== policy) delta[k] -= 2; }
      if (balanced) for (const k in delta) delta[k] += 2;
      const clear = placed.length === 3 && placed.every((c) => c.suit === EVENT.suit);
      const bold = placed.length === 3 && placed.every((c) => c.suit !== EVENT.suit);
      if (clear) morale += 5;
      if (bold) { morale -= 3; delta.quill += 2; }
      const fit = meaning === EVENT.fit;
      const monster = policy === "spear";
      return { placed, meaning, policy, balanced, delta, morale, clear, bold, fit, monster, n: placed.length };
    }
    function renderPreview() {
      const r = reading();
      if (!r.n) {
        preview.innerHTML = `The reader's pen waits.<small>Lay a card in Root, Branch or Crown. The reading is written here as you go.</small>`;
      } else {
        const who = r.policy ? `${cap(SIGILS[r.policy])} will answer it.` : r.balanced ? "All three will answer it together." : "Who will answer it is not yet plain.";
        const kind = r.clear ? " A <em>clear</em> reading." : r.bold ? " A <em>bold</em> reading." : "";
        const fit = turned ? (r.fit ? " <em>It fits the cause.</em>" : " It does not fit the cause.") : "";
        const beast = r.monster ? "The Beetle will be met as a <em>monster</em>: the warriors hold the crack." : "The Beetle will be met as a <em>god</em>: it will be escorted.";
        preview.innerHTML = `It is ${SUITS[r.meaning].belief}. ${who}${kind}${fit}<small>${beast}${slots.crown ? ` The saying on the wall: “${slots.crown.name}.”` : ""}</small>`;
      }
      const base = 30, labels = { eye: "Eye", spear: "Spear", quill: "Quill" }, cols = { eye: BLUE, spear: RED, quill: GOLD };
      ropeEl.innerHTML = Object.keys(labels).map((k) => {
        const v = base + r.delta[k];
        return `<div><span>${labels[k]}</span><i class="${P}strand" style="--c:${cols[k]};width:${Math.max(8, v * 1.6)}%"></i><span>${v}${r.delta[k] ? ` (${r.delta[k] > 0 ? "+" : ""}${r.delta[k]})` : ""}</span></div>`;
      }).join("");
      layBtn.disabled = r.n < 3 || done;
    }
    const cap = (s) => s[0].toUpperCase() + s.slice(1);

    function renderHand() {
      handEl.innerHTML = "";
      hand.forEach((c, i) => { const d = makeCard(c, String(i + 1)); if (selected === c) d.classList.add(P + "sel"); handEl.appendChild(d); });
      wrap.querySelectorAll("." + P + "slot").forEach((s) => {
        s.querySelectorAll("." + P + "card").forEach((x) => x.remove());
        const c = slots[s.dataset.s];
        if (c) { const d = makeCard(c); s.prepend(d); }
      });
      renderPreview();
    }
    function place(c, slot) {
      if (done) return;
      for (const k in slots) if (slots[k] === c) slots[k] = null;
      hand = hand.filter((x) => x !== c);
      if (slots[slot]) hand.push(slots[slot]);
      slots[slot] = c; selected = null; renderHand();
    }
    function unplace(c) {
      for (const k in slots) if (slots[k] === c) { slots[k] = null; hand.push(c); }
      selected = null; renderHand();
    }
    const inSlot = (c) => Object.values(slots).includes(c);

    // ---- drag and tap ----
    let drag = null;
    function attachDrag(el, c) {
      on(el, "pointerdown", (e) => {
        if (done || e.button > 0) return;
        e.preventDefault();
        drag = { c, el, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, id: e.pointerId };
      });
      on(el, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(c); } });
    }
    function tap(c) {
      if (inSlot(c)) { unplace(c); return; }
      selected = selected === c ? null : c; renderHand();
    }
    function slotAt(x, y) {
      for (const s of wrap.querySelectorAll("." + P + "slot")) { const r = s.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s; }
      return null;
    }
    on(window, "pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
        drag.moved = true;
        const gh = drag.el.cloneNode(true); gh.classList.add(P + "ghost"); gh.classList.remove(P + "sel");
        const r = drag.el.getBoundingClientRect(); gh.style.width = r.width + "px"; gh.style.height = r.height + "px";
        drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; drag.ghost = gh; wrap.appendChild(gh); drag.el.style.opacity = ".3";
      }
      if (drag.moved) {
        drag.ghost.style.left = e.clientX - drag.dx + "px"; drag.ghost.style.top = e.clientY - drag.dy + "px";
        wrap.querySelectorAll("." + P + "slot").forEach((s) => s.classList.remove(P + "hot"));
        const s = slotAt(e.clientX, e.clientY); if (s) s.classList.add(P + "hot");
      }
    });
    on(window, "pointerup", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      wrap.querySelectorAll("." + P + "slot").forEach((s) => s.classList.remove(P + "hot"));
      if (d.ghost) d.ghost.remove();
      d.el.style.opacity = "";
      if (!d.moved) { tap(d.c); return; }
      const s = slotAt(e.clientX, e.clientY);
      if (s) place(d.c, s.dataset.s);
      else if (inSlot(d.c) && handEl.contains(document.elementFromPoint(e.clientX, e.clientY))) unplace(d.c);
      else renderHand();
    });
    wrap.querySelectorAll("." + P + "slot").forEach((s) => on(s, "click", (e) => {
      if (selected && !e.target.closest("." + P + "card")) place(selected, s.dataset.s);
    }));
    function turn() {
      if (turned) return; turned = true;
      bk.classList.add(P + "up"); bk.removeAttribute("role");
      bk.innerHTML = `<svg viewBox="0 0 80 110" style="width:100%;height:100%"><rect x="2" y="2" width="76" height="106" fill="#dfeccf" rx="4"/><rect x="2" y="70" width="76" height="38" fill="#7fae5a"/>
<ellipse cx="40" cy="70" rx="15" ry="9" fill="#222"/><circle cx="25" cy="68" r="5" fill="#222"/><path d="M28 76 l-6 7 M40 78 l0 8 M52 76 l6 7" stroke="#222" stroke-width="1.5"/>
<text x="40" y="22" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#333">a ground beetle,</text><text x="40" y="32" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#333">wandering</text>
<g transform="translate(66 96)">${SUIT_SVG.mandible}</g><text x="12" y="100" font-family="sans-serif" font-size="7" fill="#333">fits:</text></svg>`;
      $("help").textContent = "The real cause, drawn plain. The suit in its corner fits it. The people never see this.";
      renderPreview();
    }
    on(bk, "click", turn);
    on(bk, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(); } });

    on(window, "keydown", (e) => {
      if (done || wrap.querySelector("." + P + "intro")) return;
      if (/^[1-7]$/.test(e.key)) { const c = hand[+e.key - 1]; if (c) { selected = c; renderHand(); } }
      const map = { r: "root", b: "branch", c: "crown" };
      if (map[e.key.toLowerCase()] && selected) place(selected, map[e.key.toLowerCase()]);
      if (e.key === "Enter" && !layBtn.disabled && document.activeElement === document.body) lay();
    });

    function lay() {
      const r = reading(); if (r.n < 3 || done) return;
      done = true; renderPreview();
      const who = r.policy ? `${SIGILS[r.policy]} answer it` : "a balanced reading, so no one institution answers it";
      const ch = Object.entries(r.delta).filter(([, v]) => v).map(([k, v]) => `${{ eye: "Knot", spear: "Battlements", quill: "Scroll House" }[k]} ${v > 0 ? "+" : ""}${v}`).join(", ");
      const fitLine = r.fit ? (r.monster ? " The meaning fits the real cause: the Beetle's will is a line shorter to drain." : " The meaning fits the real cause: the Beetle passes with no losses.") : "";
      const beast = r.monster ? "The Beetle is read as a monster. The warriors will hold the crack." : "The Beetle is read as a god. It will be escorted.";
      api.store.set("last", { meaning: r.meaning, policy: r.policy || (r.balanced ? "balanced" : null), monster: r.monster });
      api.end({ outcome: "done", text: `It is ${SUITS[r.meaning].belief}; ${who}. ${beast}${r.clear ? " Clear reading, morale +5." : r.bold ? " Bold reading, morale −3." : ""}${fitLine} ${ch ? ch + "." : ""} The saying painted on the ridge: “${slots.crown.name}.”${turned ? "" : " You did not turn the Backyard card."}` });
    }
    on(layBtn, "click", lay);
    const startBtn = wrap.querySelector(`.${P}intro .${P}lay`);
    on(startBtn, "click", () => { wrap.querySelector("." + P + "intro").remove(); handEl.querySelector("." + P + "card")?.focus(); });
    startBtn.focus();
    renderHand();

    return {
      unmount() { offs.forEach((f) => f()); wrap.remove(); },
    };
  },
};

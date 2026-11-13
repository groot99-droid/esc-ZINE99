// The Endless Temple / The Naming (1D, word assembly). Style: Bookbinder's gold tooling.
// DESIGN.md section 11, The Naming: the sand book at the end of Book One (after g_name_c9's four
// templates), with tiles from the two other books drifting into the trays. Elaris's task, in the
// source's words: read the book "and find out what to call it"
// (creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md, DESIGN.md
// section 3 beat 8). The chapter title "The Never-Ending Dunes and The Wondering Xandrixes" is the
// source's; rebuilding it adds the design's (added) line on the final card.
//
// Rules: choose a template; fill every slot; use at least three motif tiles with at least one from
// each thread (Place, Person, Want); a tile from another book stops the ink taking. Inscribe when
// the rules hold. There is no failure: the page waits, and the gutter runs with sand until named.

const THREADS = {
  Place: ["Desert", "Eternity", "Sand Sea", "Dunes", "Never-Ending", "Silver", "Moon", "Vines", "Waves", "Storm", "Road"],
  Person: ["Xandri", "Explorer", "Father", "Son", "Xadra", "Shaman", "Storyteller", "Xandrixes", "Wondering", "Lizard", "Zorlop", "Clerk", "Pilgrims"],
  Want: ["End", "Proof", "Further", "Leaf", "Wake", "Mark", "Windows", "City"],
};
// tiles that drifted in from the weather book and the road book (false friends)
const FOREIGN = { Storm: "the weather book", Road: "the road book", Clerk: "the weather book", Pilgrims: "the road book", Windows: "the weather book", City: "the road book" };
const CONNECTORS = ["The", "of", "and", "Who", "-less", "Never-"];
// templates: strings are tooled words, null is an open slot
const TEMPLATES = [
  ["The", null, null, "of", null],
  [null, "and the", null, null],
  ["The", null, "Who", null, "the", null],
  ["The", null, null, "and The", null, null],
];
const AUTHOR = ["Never-Ending", "Dunes", "Wondering", "Xandrixes"];
const threadOf = (w) => Object.keys(THREADS).find((t) => THREADS[t].includes(w)) || null;

// join words, gluing "Never-" to the next word and "-less" to the one before
function compose(words) {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === "-less" && out.length) { out[out.length - 1] += "less"; continue; }
    if (w === "Never-" && i + 1 < words.length && words[i + 1] !== "-less") { out.push("Never-" + words[++i].toLowerCase()); continue; }
    out.push(w);
  }
  return out.join(" ").replace(/\s+/g, " ");
}

export default {
  mount(root, api) {
    const P = "endless-temple-naming-";
    const C = { leather: "#4a2416", leather2: "#2f160d", gold: "#d9a93c", gold2: "#f2d27a", blind: "#3a1b10", cream: "#f3ead2" };
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:radial-gradient(120% 100% at 40% 20%,${C.leather},${C.leather2});color:${C.gold};font-family:'EB Garamond',Georgia,serif}
    .${P}cover{position:relative;max-width:1100px;margin:10px auto 0;padding:26px 50px 110px 22px;box-sizing:border-box;min-height:calc(100% - 10px)}
    .${P}fillet{position:absolute;inset:8px 36px 8px 8px;border:2px solid ${C.gold};outline:1px solid ${C.gold};outline-offset:-7px;pointer-events:none;border-radius:2px}
    .${P}fillet::after{content:"";position:absolute;inset:12px;border:3px dotted ${C.gold};opacity:.8}
    .${P}orn{position:absolute;width:30px;height:30px;fill:${C.gold}}
    .${P}gutter{position:absolute;right:6px;top:8px;bottom:8px;width:22px;border:1px solid ${C.gold};overflow:hidden;background:#24100a}
    .${P}gutter canvas{width:100%;height:100%;display:block}
    .${P}tpls{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;position:relative;margin-top:12px}
    .${P}tpl{font:inherit;color:${C.gold};background:${C.blind};border:1.5px solid ${C.gold};border-radius:20px;padding:5px 12px;cursor:pointer;display:flex;gap:4px;align-items:center;min-height:34px}
    .${P}tpl i{display:inline-block;width:14px;height:9px;border:1px solid ${C.gold}}
    .${P}tpl[aria-pressed=true]{background:${C.gold};color:${C.blind}}
    .${P}tpl[aria-pressed=true] i{background:${C.blind}}
    .${P}cart{position:relative;margin:22px auto 10px;max-width:760px;padding:26px 28px;border:2px solid ${C.gold};border-radius:90px;box-shadow:inset 0 0 0 6px ${C.leather},inset 0 0 0 7px ${C.gold};text-align:center;min-height:90px;display:flex;flex-wrap:wrap;gap:10px 12px;justify-content:center;align-items:center}
    .${P}tool{font-family:'IM Fell English',Georgia,serif;font-size:clamp(17px,2.4vw,26px);letter-spacing:.14em;text-transform:uppercase;color:${C.gold2};text-shadow:0 1px 0 #7a4a10,0 -1px 0 rgba(0,0,0,.6)}
    .${P}slot{font:inherit;font-family:'IM Fell English',Georgia,serif;min-width:120px;min-height:38px;padding:4px 10px;border-radius:4px;border:0;cursor:pointer;background:${C.blind};box-shadow:inset 0 2px 4px rgba(0,0,0,.7),0 1px 0 rgba(255,210,140,.18);color:${C.gold2};font-size:clamp(15px,2vw,22px);letter-spacing:.12em;text-transform:uppercase}
    .${P}slot.${P}act{outline:2px solid ${C.gold2};outline-offset:2px}
    .${P}slot.${P}bad{color:#e58a6a;text-decoration:line-through}
    .${P}status{text-align:center;color:${C.cream};font-size:15px;min-height:2.6em;margin:4px auto 10px;max-width:760px}
    .${P}status b{color:${C.gold2};font-weight:600}
    .${P}trays{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    @media (max-width:760px){.${P}trays{grid-template-columns:1fr}.${P}cover{padding-right:40px}}
    .${P}tray{position:relative;border:1.5px solid ${C.gold};padding:24px 8px 10px;border-radius:3px;overflow:hidden}
    .${P}tray h3{position:absolute;top:4px;left:0;right:0;margin:0;text-align:center;font-size:12px;letter-spacing:.3em;font-weight:600}
    .${P}tray.${P}drift{box-shadow:inset 0 -26px 22px -8px rgba(217,180,106,.55)}
    .${P}tray.${P}drift h3::after{content:" · sand gathers here";letter-spacing:.06em;font-style:italic;font-weight:400}
    .${P}tiles{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
    .${P}tile{font:inherit;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:${C.gold2};background:linear-gradient(#5b2c1a,#3e1d11);border:1px solid ${C.gold};border-radius:3px;padding:6px 8px;cursor:pointer;box-shadow:0 2px 3px rgba(0,0,0,.5)}
    .${P}tile:hover,.${P}tile:focus-visible{background:#6d3720}
    .${P}conn{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center}
    .${P}conn span{font-size:12px;letter-spacing:.2em;margin-right:6px}
    .${P}ink{display:flex;justify-content:center;margin-top:16px}
    .${P}btn{font:inherit;font-variant:small-caps;letter-spacing:.18em;font-size:18px;padding:8px 30px;border-radius:22px;border:2px solid ${C.gold};background:${C.gold};color:${C.blind};cursor:pointer}
    .${P}btn:disabled{background:transparent;color:${C.gold};opacity:.5;cursor:not-allowed}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,8,4,.72);z-index:5;padding:16px}
    .${P}intro div{max-width:460px;padding:26px;border:2px solid ${C.gold};outline:1px solid ${C.gold};outline-offset:-8px;background:${C.leather};color:${C.cream};text-align:center}
    .${P}intro h2{font-family:'IM Fell English',Georgia,serif;font-weight:400;color:${C.gold2};margin:0 0 8px;letter-spacing:.1em;text-transform:uppercase}
    .${P}intro p{margin:0 0 10px}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    const fleur = `<path d="M15 2 C18 9 24 10 28 15 C24 20 18 21 15 28 C12 21 6 20 2 15 C6 10 12 9 15 2Z"/><circle cx="15" cy="15" r="3" fill="${C.leather}"/>`;
    el.innerHTML = `
      <div class="${P}cover">
        <div class="${P}fillet"></div>
        <svg class="${P}orn" style="left:14px;top:14px" viewBox="0 0 30 30">${fleur}</svg>
        <svg class="${P}orn" style="right:42px;top:14px" viewBox="0 0 30 30">${fleur}</svg>
        <svg class="${P}orn" style="left:14px;bottom:14px" viewBox="0 0 30 30">${fleur}</svg>
        <svg class="${P}orn" style="right:42px;bottom:14px" viewBox="0 0 30 30">${fleur}</svg>
        <div class="${P}gutter" aria-hidden="true"><canvas></canvas></div>
        <div class="${P}tpls" role="group" aria-label="Title templates"></div>
        <div class="${P}cart" aria-label="The title"></div>
        <div class="${P}status" aria-live="polite"></div>
        <div class="${P}trays"></div>
        <div class="${P}conn"><span>CONNECTORS</span></div>
        <div class="${P}ink"><button type="button" class="${P}btn ${P}inscribe">Inscribe</button></div>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let tpl = 0, fill = [], active = 0, over = false, lastChange = performance.now();
    const slotCount = () => TEMPLATES[tpl].filter((x) => x === null).length;
    const resetFill = () => { fill = new Array(slotCount()).fill(null); active = 0; };
    resetFill();

    // template ring
    const tplBox = q("tpls");
    const tplBtns = TEMPLATES.map((t, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "tpl";
      b.setAttribute("aria-label", "Template: " + t.map((x) => x ?? "blank").join(" "));
      b.innerHTML = t.map((x) => (x === null ? "<i></i>" : `<small>${x}</small>`)).join("");
      b.addEventListener("click", () => { if (over) return; tpl = i; resetFill(); touched(); draw(); });
      tplBox.appendChild(b); return b;
    });

    // trays
    const trays = {};
    for (const t of Object.keys(THREADS)) {
      const box = document.createElement("section");
      box.className = P + "tray";
      box.innerHTML = `<h3>${t.toUpperCase()}</h3><div class="${P}tiles"></div>`;
      const tiles = box.querySelector("." + P + "tiles");
      for (const w of THREADS[t]) tiles.appendChild(tileBtn(w));
      q("trays").appendChild(box); trays[t] = box;
    }
    for (const w of CONNECTORS) q("conn").appendChild(tileBtn(w));
    function tileBtn(w) {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "tile"; b.textContent = w;
      b.addEventListener("click", () => place(w));
      return b;
    }
    function place(w) {
      if (over) return;
      let i = fill[active] == null ? active : fill.indexOf(null);
      if (i < 0) i = active;
      fill[i] = w;
      const next = fill.indexOf(null);
      active = next < 0 ? i : next;
      touched(); draw();
    }
    function touched() { lastChange = performance.now(); }

    function check() {
      const motifs = fill.filter((w) => w && threadOf(w));
      const threads = new Set(motifs.map(threadOf));
      const foreign = fill.filter((w) => w && FOREIGN[w]);
      const empty = fill.filter((w) => !w).length;
      // the source's own chapter title has no Want tile; the page takes it anyway (DESIGN.md section 11)
      const author = tpl === 3 && AUTHOR.every((w, i) => fill[i] === w);
      const ok = !empty && !foreign.length && (author || (motifs.length >= 3 && threads.size === 3));
      return { motifs, threads, foreign, empty, ok, author };
    }
    function words() {
      const out = []; let k = 0;
      for (const x of TEMPLATES[tpl]) {
        if (x === null) { const w = fill[k++]; if (w) out.push(w); }
        else out.push(...x.split(" "));
      }
      return out;
    }

    function draw() {
      tplBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i === tpl)));
      const cart = q("cart"); cart.innerHTML = "";
      let k = 0;
      for (const x of TEMPLATES[tpl]) {
        if (x !== null) { const s = document.createElement("span"); s.className = P + "tool"; s.textContent = x; cart.appendChild(s); continue; }
        const i = k++;
        const b = document.createElement("button");
        b.type = "button";
        b.className = P + "slot" + (i === active && !over ? " " + P + "act" : "") + (fill[i] && FOREIGN[fill[i]] ? " " + P + "bad" : "");
        b.textContent = fill[i] || " ";
        b.setAttribute("aria-label", fill[i] ? `Slot ${i + 1}: ${fill[i]}. Press to clear.` : `Empty slot ${i + 1}`);
        b.addEventListener("click", () => { if (over) return; if (fill[i] && active === i) fill[i] = null; active = i; touched(); draw(); });
        cart.appendChild(b);
      }
      const c = check();
      const mark = (t) => `${t} ${c.threads.has(t) ? "✓" : "✗"}`;
      let s = `Motif tiles <b>${c.motifs.length}</b> (at least 3) · ${mark("Place")} · ${mark("Person")} · ${mark("Want")}`;
      if (c.empty) s += ` · ${c.empty} slot${c.empty > 1 ? "s" : ""} open`;
      if (c.foreign.length) s += `<br>The ink will not take on <b>${c.foreign[0]}</b>: that tile drifted in from ${FOREIGN[c.foreign[0]]}.`;
      else if (c.author) s += `<br>The ink is ready, though no Want is named: <b>${compose(words())}</b>`;
      else if (c.ok) s += `<br>The ink is ready: <b>${compose(words())}</b>`;
      q("status").innerHTML = s;
      q("inscribe").disabled = !c.ok || over;
    }

    q("inscribe").addEventListener("click", () => {
      const c = check();
      if (!c.ok || over) return;
      over = true; draw();
      const name = compose(words());
      const author = c.author;
      leaking = false;
      let text = `Inscribed: “${name}”. The ink sets in gold, and the gutter stops running. The book rests.`;
      if (author) text += " Elaris thought the name had been waiting for him.";
      timers.push(setTimeout(() => api.end({ outcome: "win", text }), api.reducedMotion ? 200 : 1400));
    });

    // the gutter: sand runs until the book is named; after 30 s idle, sand gathers at a missing thread
    const cv = q("gutter").querySelector("canvas");
    const g = cv.getContext("2d");
    let raf = 0, leaking = true, t0 = performance.now(), grains = [];
    function loop(now) {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      g.clearRect(0, 0, w, h);
      if (leaking && !api.reducedMotion && grains.length < 120) grains.push({ x: Math.random() * w, y: -2, v: 20 + Math.random() * 50 });
      g.fillStyle = "#d9b46a";
      const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
      for (let i = grains.length - 1; i >= 0; i--) {
        const p = grains[i]; p.y += p.v * dt * (leaking ? 1 : 0.4);
        if (p.y > h) { grains.splice(i, 1); continue; }
        g.fillRect(p.x, p.y, 1.6, 1.6);
      }
      if (api.reducedMotion && leaking) { g.fillStyle = "rgba(217,180,106,.5)"; g.fillRect(w / 2 - 1, 0, 2, h); }
      // hint
      const c = check();
      const idle = now - lastChange > 30000;
      for (const t of Object.keys(trays)) trays[t].classList.toggle(P + "drift", !over && idle && !c.threads.has(t));
      raf = requestAnimationFrame(loop);
    }

    const onKey = (e) => {
      if (over || intro.isConnected) return;
      if (e.key === "Backspace") { fill[active] = null; touched(); draw(); }
      else if (e.key === "ArrowRight") { active = Math.min(fill.length - 1, active + 1); draw(); }
      else if (e.key === "ArrowLeft") { active = Math.max(0, active - 1); draw(); }
    };
    addEventListener("keydown", onKey);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>The Naming</h2>
      <p>The sand book has no name. Choose a title template, then fill its open slots with the tiles you gathered while reading.</p>
      <p>Use at least three motif tiles, one from each thread: Place, Person, Want. Some tiles drifted in from other books; the ink will not take on them. When the rules hold, Inscribe.</p>
      <button type="button" class="${P}btn">Start</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); touched(); tplBtns[0].focus(); });
    intro.querySelector("button").focus();

    draw();
    raf = requestAnimationFrame(loop);
    return { unmount() { cancelAnimationFrame(raf); timers.forEach(clearTimeout); removeEventListener("keydown", onKey); } };
  },
};

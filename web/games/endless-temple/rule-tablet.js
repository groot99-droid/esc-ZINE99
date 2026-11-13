// The Endless Temple / The Rule Tablet (1D, logic loophole). Style: Cuneiform clay tablet.
// DESIGN.md section 11, g_tablet_c6 "The gods' rules" (games/endless-temple/data/tablets.json).
// Rule 1 is the source's own line, verbatim: "We do not ride on the backs of the gods."
// (creative-writing/vault/02_Novels/05_The_Endless_Temple_-_Elaris_Sel_Marden.md). Every other
// rule, meaning and the watcher's rule are added for the game (DESIGN.md section 21, item 14).
//
// Put up to three Ways in the plan row and Test it against the rules, read literally. A plan that
// reaches the Want and breaks nothing opens the loophole (win). A failed Test adds 20 scrutiny; at
// 100 the watcher carves a ninth rule that closes the loophole. Break commits a rule-breaking plan:
// the book goes on, but the rule is written to rules_broken (loss).

const WANT = "Go where the Xandrixes go, toward the end.";
// text pieces: [plain, {k: key word with a meaning} or {c: catch word}] ; catch = the word lit red when broken
const RULES = [
  { n: 1, parts: ["We do not ", { c: "ride" }, " on the backs of the gods."], source: true },
  { n: 2, parts: ["No one walks ", { k: "before", m: "ahead of, in its path" }, " a god."] },
  { n: 3, parts: ["No hand ", { c: "touches" }, " a god."] },
  { n: 4, parts: ["The sand of the deep belongs to the gods; no one ", { c: "takes" }, " from it."] },
  { n: 5, parts: ["What the gods leave behind is holy and may not be ", { k: "trodden", m: "pressed by a foot of the clan" }, "."] },
  { n: 6, parts: ["The holy is not ", { c: "carried away" }, "."] },
  { n: 7, parts: ["A son of the clan ", { c: "returns" }, " by the third moon, ", { k: "or is named lost", m: "a price, not a ban" }, "."] },
  { n: 8, parts: ["No one ", { c: "sleeps" }, " where the gods have not slept."] },
];
const WATCHER = { n: 9, parts: ["No one ", { c: "follows" }, " where a god has gone."], watcher: true };
const WAYS = [
  ["climb_xandrix", "Climb onto a Xandrix"],
  ["walk_ahead", "Walk ahead to scout"],
  ["follow_track", "Follow in their track"],
  ["wear_leaves", "Wear the Zorlop leaves"],
  ["walk_beside", "Walk beside the herd"],
  ["carry_scale", "Carry a shed scale as a guide"],
  ["sleep_in_track", "Sleep in their track"],
  ["return_third_moon", "Return by the third moon"],
  ["accept_named_lost", "Accept being named lost"],
];
const WAY_TEXT = Object.fromEntries(WAYS);

// literal reading of the plan against the rules
function judge(plan, watcher) {
  const has = (w) => plan.includes(w);
  const broken = []; // {n, word, why}
  let want = true, wantWhy = "";
  const moving = has("follow_track") || has("climb_xandrix") || has("walk_ahead");
  if (has("climb_xandrix")) { broken.push({ n: 1, word: "ride", why: "On a Xandrix's back is riding it." }); broken.push({ n: 3, word: "touches", why: "Climbing is a hand on a god." }); }
  if (has("walk_ahead")) broken.push({ n: 2, word: "before", why: "Ahead of the herd is in its path." });
  if (has("follow_track") && !has("wear_leaves")) broken.push({ n: 5, word: "trodden", why: "The track is what the gods leave behind, and his bare foot would press it." });
  if (has("carry_scale")) broken.push({ n: 6, word: "carried away", why: "A shed scale is holy, and he would carry it off." });
  if (has("sleep_in_track")) broken.push({ n: 8, word: "sleeps", why: "The herd never stops in its track to sleep." });
  if (watcher && has("follow_track")) broken.push({ n: 9, word: "follows", why: "The watcher's rule forbids the track itself." });
  if (moving && !has("return_third_moon") && !has("accept_named_lost")) broken.push({ n: 7, word: "returns", why: "He would not return by the third moon, and has not accepted the other half of the rule." });
  if (has("walk_beside")) { want = false; wantWhy = "Beside the herd the waves still break: you would be swallowed."; }
  else if (!moving) { want = false; wantWhy = "Nothing in this plan moves him toward the end."; }
  else if (has("walk_ahead") && !has("wear_leaves") && !has("follow_track") && !has("climb_xandrix")) { want = false; wantWhy = "Out on the open waves without the leaves, you would be swallowed."; }
  else if (has("return_third_moon")) { want = false; wantWhy = "Turned home by the third moon, he never goes where they go."; }
  return { broken, want, wantWhy };
}

// n wedge marks (a vertical wedge = a triangle head and a tail)
function wedges(n, x0, y0, s) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const row = i < 5 ? 0 : 1, col = i < 5 ? i : i - 5;
    const x = x0 + col * s * 0.9, y = y0 + row * s * 1.5;
    d += `<path d="M${x - s * 0.35} ${y} L${x + s * 0.35} ${y} L${x} ${y + s * 0.55} Z" /><path d="M${x} ${y + s * 0.4} L${x} ${y + s * 1.25}" stroke-width="${s * 0.14}"/>`;
  }
  return d;
}

export default {
  mount(root, api) {
    const P = "endless-temple-rule-tablet-";
    const clay = { hi: "#d8b07a", mid: "#c08a55", lo: "#8f5f35", ink: "#4a2c18", dark: "#1d140d", red: "#b23a2a", cream: "#f3ead2" };
    const timers = [];
    const css = document.createElement("style");
    css.textContent = `
    .${P}root{position:absolute;inset:0;overflow:auto;background:radial-gradient(120% 100% at 50% 0%,#2e2117,#140e09);color:${clay.cream};font-family:'EB Garamond',Georgia,serif}
    .${P}wrap{max-width:1180px;margin:0 auto;padding:16px 16px 110px;display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:18px}
    @media (max-width:820px){.${P}wrap{grid-template-columns:1fr}}
    .${P}tab{position:relative;border-radius:26px;padding:16px 14px 18px;background:
      radial-gradient(140% 90% at 30% 10%,${clay.hi},${clay.mid} 55%,${clay.lo});box-shadow:inset 0 2px 0 rgba(255,240,210,.5),inset 0 -6px 14px rgba(60,30,10,.45),0 14px 30px rgba(0,0,0,.6);color:${clay.ink};overflow:hidden}
    .${P}tab::before{content:"";position:absolute;inset:0;opacity:.35;pointer-events:none;background-image:radial-gradient(rgba(70,40,20,.5) 1px,transparent 1.4px),radial-gradient(rgba(255,240,210,.4) 1px,transparent 1.4px);background-size:7px 7px,11px 11px;background-position:0 0,3px 5px}
    .${P}shadow{position:absolute;inset:0;pointer-events:none;background:linear-gradient(270deg,rgba(15,8,4,.75),rgba(15,8,4,0) 45%);opacity:0;transition:opacity .8s}
    .${P}reg{position:relative;display:grid;grid-template-columns:44px 1fr;gap:8px;align-items:center;padding:7px 4px;border-bottom:2px solid rgba(90,55,25,.45);box-shadow:0 1px 0 rgba(255,235,200,.45)}
    .${P}reg:last-child{border-bottom:0;box-shadow:none}
    .${P}reg svg{width:40px;height:26px;fill:${clay.ink};stroke:${clay.ink}}
    .${P}txt{font-size:clamp(14px,1.6vw,18px);line-height:1.3;text-shadow:0 1px 0 rgba(255,236,200,.55),0 -1px 0 rgba(60,30,10,.35)}
    .${P}reg.${P}lit{background:rgba(255,214,140,.55);border-radius:6px}
    .${P}reg.${P}new .${P}txt{font-style:italic}
    .${P}kw{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
    .${P}kw:focus-visible{outline:2px solid ${clay.ink}}
    .${P}catch{text-decoration:underline wavy ${clay.red} 2px;text-underline-offset:4px;color:${clay.red};font-weight:600}
    .${P}pulse{animation:${P}p 1s ease-in-out infinite alternate}
    @keyframes ${P}p{from{background:rgba(255,230,160,0)}to{background:rgba(255,230,160,.9)}}
    .${P}gloss{min-height:1.5em;margin:8px 4px 0;font-style:italic;color:${clay.ink};position:relative}
    .${P}side{display:flex;flex-direction:column;gap:14px}
    .${P}card{background:linear-gradient(${clay.hi},${clay.mid});color:${clay.ink};border-radius:14px;padding:10px 12px;box-shadow:inset 0 -3px 6px rgba(60,30,10,.4)}
    .${P}card small{display:block;font-variant:small-caps;letter-spacing:.14em}
    .${P}card.${P}grey{filter:grayscale(1) brightness(.75)}
    .${P}stones{display:flex;gap:14px;justify-content:center}
    .${P}stone{font:inherit;width:84px;height:84px;border-radius:50% 46% 52% 48%;border:0;cursor:pointer;font-variant:small-caps;letter-spacing:.14em;font-size:15px;color:#1d1a17;background:radial-gradient(circle at 35% 30%,#e4e2dc,#9c9a93 70%,#6d6b66);box-shadow:0 6px 12px rgba(0,0,0,.5)}
    .${P}stone.${P}brk{background:radial-gradient(circle at 35% 30%,#d9d6cf,#8d8a83 70%,#5b5853)}
    .${P}stone:disabled{opacity:.4;cursor:not-allowed}
    .${P}meter{height:8px;border-radius:4px;background:rgba(243,234,210,.15);overflow:hidden}
    .${P}meter i{display:block;height:100%;background:${clay.red};width:0;transition:width .4s}
    .${P}lower{grid-column:1/-1}
    .${P}plan{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
    .${P}slot{font:inherit;min-height:58px;border-radius:12px;border:2px dashed rgba(216,176,122,.6);background:rgba(216,176,122,.08);color:${clay.cream};cursor:pointer;padding:6px;font-size:14px}
    .${P}slot.${P}full{border-style:solid;background:linear-gradient(${clay.hi},${clay.mid});color:${clay.ink}}
    .${P}tray{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
    .${P}way{font:inherit;font-size:14px;min-height:46px;border-radius:12px;border:0;cursor:pointer;color:${clay.ink};background:linear-gradient(${clay.hi},${clay.mid});box-shadow:inset 0 -3px 6px rgba(60,30,10,.4),0 3px 6px rgba(0,0,0,.4);padding:6px 8px}
    .${P}way[aria-pressed=true]{opacity:.35}
    .${P}msg{margin:12px 2px 0;min-height:3em;font-size:15px}
    .${P}msg b{color:#f0b36a}
    .${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,6,3,.7);z-index:5;padding:16px}
    .${P}intro div{max-width:460px;border-radius:24px;padding:24px;color:${clay.ink};background:radial-gradient(140% 90% at 30% 10%,${clay.hi},${clay.mid} 60%,${clay.lo})}
    .${P}intro h2{margin:0 0 8px;font-family:'IM Fell English',Georgia,serif;font-weight:400}
    .${P}intro p{margin:0 0 10px}
    .${P}go{font:inherit;font-variant:small-caps;letter-spacing:.12em;font-size:17px;padding:8px 26px;border-radius:20px;border:2px solid ${clay.ink};background:${clay.ink};color:${clay.cream};cursor:pointer}
    @media (prefers-reduced-motion:reduce){.${P}pulse{animation:none;background:rgba(255,230,160,.9)}}
    `;
    const el = document.createElement("div");
    el.className = P + "root";
    el.innerHTML = `
      <div class="${P}wrap">
        <section class="${P}tab" aria-label="The gods' rules"><div class="${P}regs"></div><div class="${P}gloss" aria-live="polite">Tap an underlined word to read what it means.</div><div class="${P}shadow"></div></section>
        <aside class="${P}side">
          <div class="${P}card ${P}want"><small>The Want</small>${WANT}</div>
          <div class="${P}stones"><button type="button" class="${P}stone ${P}test">Test</button><button type="button" class="${P}stone ${P}brk">Break</button></div>
          <div><small style="font-variant:small-caps;letter-spacing:.14em">The shamans' attention</small><div class="${P}meter"><i></i></div></div>
        </aside>
        <section class="${P}lower" aria-label="Your plan">
          <div class="${P}plan"></div>
          <div class="${P}tray"></div>
          <p class="${P}msg" aria-live="polite">Choose up to three Ways for Xandri, then Test them on the tablet.</p>
        </section>
      </div>`;
    root.append(css, el);
    const q = (c) => el.querySelector("." + P + c);

    let plan = [], scrutiny = 0, fails = 0, watcher = false, over = false, lit = null;
    const regs = q("regs"), gloss = q("gloss"), msg = q("msg");

    function drawRules() {
      regs.innerHTML = "";
      const list = watcher ? [...RULES, WATCHER] : RULES;
      for (const r of list) {
        const row = document.createElement("div");
        row.className = P + "reg" + (r.watcher ? " " + P + "new" : "");
        const hit = lit && lit.find((b) => b.n === r.n);
        if (hit) row.classList.add(P + "lit");
        row.innerHTML = `<svg viewBox="0 0 40 26" aria-label="Rule ${r.n}">${wedges(r.n, 6, 2, 9)}</svg><div class="${P}txt"></div>`;
        const t = row.querySelector("." + P + "txt");
        for (const part of r.parts) {
          if (typeof part === "string") { t.append(part); continue; }
          const word = part.k || part.c;
          let node;
          if (part.k) {
            node = document.createElement("button");
            node.type = "button"; node.className = P + "kw"; node.textContent = word;
            node.addEventListener("click", () => { gloss.textContent = `“${word}”: ${part.m}.`; });
            if (fails >= 2 && word === "trodden" && !over) node.classList.add(P + "pulse");
          } else {
            node = document.createElement("span"); node.textContent = word;
          }
          if (hit && hit.word === word) node.classList.add(P + "catch");
          t.append(node);
        }
        if (r.watcher) t.append(" — carved by the watcher");
        regs.appendChild(row);
      }
      q("shadow").style.opacity = scrutiny >= 100 ? 1 : scrutiny >= 60 ? 0.65 : 0;
      q("meter").firstElementChild.style.width = Math.min(100, scrutiny) + "%";
    }
    function drawPlan() {
      const pb = q("plan"); pb.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const w = plan[i];
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "slot" + (w ? " " + P + "full" : "");
        b.textContent = w ? WAY_TEXT[w] : `Way ${i + 1}`;
        b.setAttribute("aria-label", w ? `Remove: ${WAY_TEXT[w]}` : `Empty Way ${i + 1}`);
        b.addEventListener("click", () => { if (w && !over) { plan.splice(i, 1); lit = null; refresh(); } });
        pb.appendChild(b);
      }
      const tb = q("tray"); tb.innerHTML = "";
      for (const [id, text] of WAYS) {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "way"; b.textContent = text;
        b.setAttribute("aria-pressed", String(plan.includes(id)));
        if (fails >= 4 && id === "wear_leaves" && !plan.includes(id) && !over) b.classList.add(P + "pulse");
        b.addEventListener("click", () => {
          if (over) return;
          if (plan.includes(id)) plan = plan.filter((x) => x !== id);
          else if (plan.length < 3) plan.push(id);
          else { msg.textContent = "The plan row holds three Ways. Tap one in the row to take it back."; return; }
          lit = null; refresh();
        });
        tb.appendChild(b);
      }
      q("test").disabled = over || !plan.length;
      q("brk").disabled = over || !plan.length;
    }
    function refresh() { drawRules(); drawPlan(); q("want").classList.remove(P + "grey"); }

    function test() {
      if (over || !plan.length) return;
      const r = judge(plan, watcher);
      lit = r.broken;
      if (!r.broken.length && r.want) {
        over = true; drawRules(); drawPlan();
        msg.innerHTML = "<b>The tablet holds.</b> The leaves, not his foot, press the track; and “or is named lost” is a price he can pay.";
        timers.push(setTimeout(() => api.end({ outcome: "win", text: "Loophole found: Xandri wears the Zorlop leaves, follows the gods' track, and accepts being named lost. No rule is broken." }), api.reducedMotion ? 200 : 1600));
        return;
      }
      fails++;
      scrutiny += 20;
      let text = "";
      if (r.broken.length) text += r.broken.map((b) => `<b>Rule ${b.n}</b> catches on “${b.word}”. ${b.why}`).join("<br>");
      if (!r.want) text += (text ? "<br>" : "") + `<b>The Want greys:</b> ${r.wantWhy}`;
      if (scrutiny >= 100 && !watcher) {
        watcher = true;
        text += "<br><b>A shaman has been watching.</b> He carves a ninth rule at the foot of the tablet. The clean way is closed; only Break remains for that plan.";
      } else if (scrutiny >= 60 && scrutiny < 100) text += "<br>A shadow lies across the tablet's edge.";
      msg.innerHTML = text;
      refresh();
      if (lit.length) { const n = lit.map((b) => b.n); lit = r.broken; drawRules(); void n; }
      if (!r.want) q("want").classList.add(P + "grey");
    }
    function brk() {
      if (over || !plan.length) return;
      const r = judge(plan, watcher);
      if (!r.want) { lit = r.broken; refresh(); q("want").classList.add(P + "grey"); msg.innerHTML = `<b>Even broken, this plan fails the Want.</b> ${r.wantWhy}`; return; }
      if (!r.broken.length) { msg.innerHTML = "This plan breaks nothing. Test it instead."; return; }
      over = true; lit = r.broken; drawRules(); drawPlan();
      const nums = r.broken.map((b) => b.n);
      const ns = nums.length === 1 ? `Rule ${nums[0]} is` : `Rules ${nums.slice(0, -1).join(", ")} and ${nums[nums.length - 1]} are`;
      msg.innerHTML = `<b>Broken on purpose.</b> ${ns} written to rules_broken, and the book goes on.`;
      timers.push(setTimeout(() => api.end({ outcome: "lose", text: `Xandri goes on, but not cleanly. ${ns} broken and remembered. The loophole stays unfound.` }), api.reducedMotion ? 200 : 1600));
    }
    q("test").addEventListener("click", test);
    q("brk").addEventListener("click", brk);

    const intro = document.createElement("div");
    intro.className = P + "intro";
    intro.innerHTML = `<div><h2>The Rule Tablet</h2>
      <p>“They had rules for everything, and it was stifling.” Find what the gods' rules do not forbid.</p>
      <p>Pick up to three Ways, then press <b>Test</b>: every rule is read literally, by its words. Tap underlined words for their meanings. Each failed test draws a shaman's eye; at the fifth he closes the gap. <b>Break</b> goes on anyway, at a cost.</p>
      <button type="button" class="${P}go">Start</button></div>`;
    el.appendChild(intro);
    intro.querySelector("button").addEventListener("click", () => { intro.remove(); q("tray").querySelector("button")?.focus(); });
    intro.querySelector("button").focus();

    refresh();
    return { unmount() { timers.forEach(clearTimeout); } };
  },
};

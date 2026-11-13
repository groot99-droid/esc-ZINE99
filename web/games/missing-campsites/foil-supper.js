// Missing Campsites / Foil Supper (1D, two-colour risograph recipe card).
//
// DESIGN.md section 11, Foil Supper, at foil_supper_2: day 2 dusk, five friends and Marisol, food
// for five. No corn, no butter, no onions, no ramps (gone at step 4). Each packet needs one
// ingredient in each role: Base, Body, Fat, Flavour. Score: 3 = the card's own in every role;
// 2 = one substitution the card allows; 1 = edible; 0 = a role empty, not made (that diner shares).
// The coal bar runs 3 minutes (pausable). Bea's card is in someone else's hand, so on day 2 its
// heading and every line naming the store are blank; the card was not copied on day 1 here.
//
// Actions (the refine pass):
//   Pick    an ingredient from the cooler (click, or 1–6), and the pencil shows what each space
//           would score.
//   Place   it in a role space; Take back by tapping a filled space.
//   Taste   (T) the unlabelled jar June finds a minute in: tasting costs 20 s of coal (DESIGN.md's
//           own price for an unknown) and shows its role. Untasted, it can only be "edible".
//   Cook    Onto the coals, whenever you like; at 0 the packets cook as they are.
// There is olive oil for three, so the jar decides whether a fourth packet can be a 2.
// Outcomes: six packets, average 1.5 or better (win); six packets, average 1 or better (done);
// otherwise lose. After two losses in a row the coals last four minutes.
// Lines in TEXT are written for the game (listed for approval); the card lines are this prototype's.

const PINK = "#ff4fa3", TEAL = "#0f8a8a", NAVY = "#24344f", PAPER = "#efe7dc";
const P = "missing-campsites-foil-supper-";
const ROLES = ["Base", "Body", "Fat", "Flavour"];
const INGR = [
  { id: "potato", name: "Potatoes", home: "Base", n: 6 },
  { id: "sausage", name: "Sausages", home: "Body", n: 4 },
  { id: "lentil", name: "Lentil cakes", home: "Body", n: 3 },
  { id: "oil", name: "Olive oil", home: "Fat", n: 3 },
  { id: "salt", name: "Salt & pepper", home: "Flavour", n: 8 },
  { id: "jar", name: "A jar, no label", home: "?", n: 0, late: true },
  { id: "corn", name: "Store corn", home: "Base", n: 0 },
  { id: "butter", name: "Butter pats", home: "Fat", n: 0 },
  { id: "onion", name: "Garden onions", home: "Flavour", n: 0 },
];
const OWN = { Base: "potato", Body: "sausage", Fat: "butter", Flavour: "salt" };
const DINERS = ["Tam", "Dell", "Rafe", "Inés", "June", "Marisol"];
const JAR_AT = 60, TASTE_COST = 20;
// Bea's card. null = a line in her hand that named something from the campground: blank on day 2.
const CARD = [null, "2 potatoes, or any root", "1 sausage each (June: a lentil cake)", null, null, "salt & pepper", "fold tight, 3 folds", "coals 25 min"];

const TEXT = {
  when: "Day 2 · dusk · serves 6",
  goal: "Six foil packets before the coals go grey, averaging 1.5 or better.",
  steps: ["Pick something from the cooler.", "Lay it in a space: Base, Body, Fat, Flavour.", "The pencil number is what it would score: 3 the card's own, 2 a swap the card allows, 1 edible."],
  gentle: "A gentler supper: the coals last four minutes.",
  open: "Dusk. The store's things are gone from the cooler, and Marisol has come to eat with you. Six to feed from food for five.",
  folded: "Dell takes the first packet and folds it tight, three folds, the way the card says.",
  jar: "June, from the bottom of the cooler: \"Whose is this?\" A jar, no label. Nobody packed it. (T: taste it, 20 s of coal.)",
  tasted: "You taste it. Lard, or something like it. It will do for a Fat, and the card would allow it.",
  marisol: "Marisol: \"I'll eat whatever's going. I've had worse at the booth.\"",
  low: "The coals are greying at the edges.",
  pickFirst: "Pick something from the cooler first.",
  untasted: "Nobody knows what it is yet. It goes in as edible, and no more.",
  end: {
    lead: (timeUp) => (timeUp ? "The coals go grey; the packets cook as they are." : "Every sheet goes onto the coals."),
    stats: (made, avg) => `${made} of 6 packets made, average ${avg.toFixed(2)}.`,
    warm: (avg) => (avg >= 2 ? "Warmth +2." : avg >= 1 ? "Warmth +1." : "Nobody says much."),
    win: "Marisol eats with the five of you, and says it is the best thing she has had all summer.",
    done: "Everyone is fed. Dell says nothing about the card's blank lines, and neither do you.",
    share: (who) => (who.includes(",") ? `${who} share other people's packets, and pretend not to mind.` : `${who} shares someone else's packet, and pretends not to mind.`),
    thin: "Nobody eats much. The foil goes back in the box, folded flat.",
  },
};

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${PAPER};color:${NAVY};font-family:'IBM Plex Mono',ui-monospace,monospace;padding:12px;box-sizing:border-box;display:grid;grid-template-rows:auto auto 1fr auto;gap:10px;
  background-image:radial-gradient(rgba(36,52,79,.07) 1px,transparent 1.3px);background-size:5px 5px}
.${P}head{background:${NAVY};color:${PAPER};padding:8px 14px;font-weight:600;font-size:clamp(18px,3vw,26px);letter-spacing:.1em;text-shadow:2px 1px 0 ${PINK}99;border:2px solid ${PINK};outline:2px solid ${TEAL};outline-offset:-6px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.${P}head small{font-size:14px;letter-spacing:.06em;text-shadow:none;color:#ffd0e6}
.${P}say{font-family:Caveat,'Segoe Print',cursive;font-size:22px;line-height:1.15;color:#3d2d22;border-left:5px solid ${PINK};padding:2px 10px;min-height:26px}
.${P}main{display:grid;grid-template-columns:minmax(170px,.85fr) minmax(0,2.2fr) minmax(160px,.9fr);gap:12px;align-items:start}
.${P}box{border:2px solid ${TEAL};padding:8px;box-shadow:3px 2px 0 ${PINK}66;background:${PAPER}}
.${P}box h4{margin:0 0 6px;color:${TEAL};letter-spacing:.2em;font-size:14px;text-shadow:1.5px 1px 0 ${PINK}77}
.${P}box.shake{animation:${P}shake .4s}
@keyframes ${P}shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.${P}ing{display:flex;align-items:center;gap:8px;width:100%;font:inherit;font-size:14px;background:transparent;border:0;padding:5px 4px;color:${NAVY};cursor:pointer;text-align:left}
.${P}ing:hover:not(:disabled){background:rgba(255,79,163,.12)}
.${P}ing i{width:30px;height:30px;flex:none;background:${PINK};background-image:radial-gradient(${PAPER} 1.3px,transparent 1.6px);background-size:5px 5px;mix-blend-mode:multiply;font-style:normal;display:grid;place-items:center;color:#fff;font-weight:700;font-size:14px}
.${P}ing:nth-child(even) i{background-color:${TEAL}}
.${P}ing small{display:block;font-size:12px;opacity:.8}
.${P}ing.sel{outline:3px solid ${NAVY};background:#fff}
.${P}ing:disabled{opacity:.45;cursor:default}
.${P}ing.out span{text-decoration:line-through;text-decoration-color:${PINK}}
.${P}ing[hidden]{display:none}
.${P}ing.new{animation:${P}new 1.2s 2}
@keyframes ${P}new{50%{background:#ffd0e6}}
.${P}sheets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.${P}sheet{border:2px solid ${PINK};padding:6px;position:relative;background:repeating-linear-gradient(45deg,#e7dfd6 0 3px,#f4eee6 3px 6px);box-shadow:-2px 2px 0 ${TEAL}66}
.${P}sheet>b{display:block;font-size:13px;margin-bottom:4px;letter-spacing:.1em}
.${P}sheet .sc{position:absolute;top:-11px;right:-9px;width:30px;height:30px;border-radius:50%;background:#9aa;color:#fff;display:grid;place-items:center;font-weight:700;font-size:15px;box-shadow:2px 1px 0 ${PINK}}
.${P}sheet .sc.s1{background:#c06a2a}.${P}sheet .sc.s2{background:${TEAL}}.${P}sheet .sc.s3{background:${NAVY}}
.${P}sheet.pop{animation:${P}pop .45s}
@keyframes ${P}pop{40%{transform:scale(1.04)}}
.${P}roles{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.${P}role{font:inherit;font-size:13px;min-height:46px;border:0;background:${PINK};background-image:radial-gradient(rgba(255,255,255,.35) 1.2px,transparent 1.5px);background-size:4px 4px;color:#fff;cursor:pointer;padding:3px 5px;text-align:left;position:relative;line-height:1.15;text-shadow:0 1px 0 rgba(0,0,0,.25)}
.${P}role.empty{background:rgba(255,79,163,.14);color:${NAVY};outline:1.5px dashed ${PINK};outline-offset:-3px;text-shadow:none}
.${P}role.empty:hover{background:rgba(15,138,138,.18)}
.${P}role em{display:block;font-style:normal;font-size:12px;letter-spacing:.1em;opacity:.9}
.${P}role .pv{position:absolute;right:5px;bottom:1px;font-family:Caveat,cursive;font-size:22px;font-weight:700;color:#3a3a3c}
.${P}role .pv.p2{color:${TEAL}}.${P}role .pv.p3{color:${NAVY}}
.${P}card p{margin:0;padding:5px 2px;border-bottom:1px solid ${TEAL}66;font-family:Caveat,'Segoe Print',cursive;font-size:19px;min-height:22px;color:#4a3626}
.${P}card p.blank{background:repeating-linear-gradient(90deg,${PINK}22 0 6px,transparent 6px 10px);background-size:100% 3px;background-repeat:no-repeat;background-position:0 70%}
.${P}card small{display:block;margin-top:6px;font-size:12px;color:${TEAL}}
.${P}avg{font-size:14px;margin-top:8px;font-weight:600}
.${P}coal{border:2px solid ${TEAL};height:32px;position:relative;background:${PAPER}}
.${P}coal i{position:absolute;left:0;top:0;bottom:0;background-image:radial-gradient(${PAPER} 1.4px,transparent 1.7px),linear-gradient(90deg,${PINK},#ff9a3d);background-size:5px 5px,100% 100%;transition:width .9s linear}
.${P}coal span{position:absolute;right:8px;top:6px;font-weight:600;font-size:14px;color:${NAVY};background:${PAPER};padding:0 4px}
.${P}coal.low{animation:${P}low 1s steps(2) infinite}
.${P}coal.low i{background-image:radial-gradient(${PAPER} 1.4px,transparent 1.7px),linear-gradient(90deg,#8b8b8b,#c06a2a)}
@keyframes ${P}low{50%{border-color:${PINK}}}
.${P}bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.${P}bar button{font:600 14px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:9px 14px;cursor:pointer}
.${P}bar button:hover:not(:disabled){background:${TEAL}}
.${P}bar button:disabled{opacity:.4;cursor:default}
.${P}bar button[hidden]{display:none}
.${P}bar label{font-size:14px;display:flex;gap:6px;align-items:center}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,231,220,.94);z-index:4;padding:16px;overflow:auto}
.${P}rcard{max-width:470px;width:100%;box-sizing:border-box;border:2px solid ${PINK};box-shadow:5px 4px 0 ${TEAL};background:${PAPER};padding:18px 22px;position:relative;
  background-image:linear-gradient(${PAPER},${PAPER}),repeating-linear-gradient(180deg,transparent 0 27px,${TEAL}44 27px 28px);background-clip:content-box,padding-box}
.${P}rcard h2{margin:0;font:700 34px 'Zilla Slab',Georgia,serif;color:${NAVY};text-shadow:3px 2px 0 ${PINK}aa,-1px -1px 0 ${TEAL}88;letter-spacing:.02em}
.${P}rcard .when{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:${TEAL};margin:2px 0 10px;border-bottom:2px dotted ${PINK};padding-bottom:6px}
.${P}rcard .goal{font-size:16px;line-height:1.4;font-weight:600;margin:0 0 10px}
.${P}rcard ol{margin:0 0 12px;padding-left:22px;font-size:14px;line-height:1.45}
.${P}rcard ol li::marker{color:${PINK};font-weight:700}
.${P}rcard .gentle{font-size:14px;color:${TEAL};margin:0 0 10px}
.${P}rcard button{font:600 15px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:10px 22px;cursor:pointer;box-shadow:3px 2px 0 ${TEAL}}
.${P}rcard button:focus-visible{outline:3px solid ${TEAL};outline-offset:3px}
@media (max-width:820px){.${P}main{grid-template-columns:1fr}.${P}sheets{grid-template-columns:repeat(2,minmax(0,1fr))}.${P}main>.${P}box:first-child{position:sticky;top:-12px;z-index:2}
  .cool{display:flex;flex-wrap:wrap;gap:2px}.${P}ing{width:auto;font-size:13px;padding:4px}.${P}ing i{width:22px;height:22px;font-size:12px}.${P}ing small{display:none}.${P}ing.out{display:none}.${P}role{font-size:12px;min-height:44px}.${P}say{font-size:20px}}
`;

export default {
  mount(root, api) {
    const losses = api.store.get("losses", 0);
    const gentle = losses >= 2;
    const COALS_S = gentle ? 240 : 180;
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}head"><span>FOIL SUPPER / DAY 2</span><small class="hd"></small></div>
      <div class="${P}say" aria-live="polite"></div>
      <div class="${P}main">
        <div class="${P}box cbox"><h4>COOLER</h4><div class="cool"></div></div>
        <div class="${P}sheets"></div>
        <div class="${P}box ${P}card"><h4>THE CARD</h4><div class="lines"></div><small>card: not copied · diners 5 + 1</small><div class="${P}avg"></div></div>
      </div>
      <div><div class="${P}coal"><i></i><span>COALS 3:00</span></div>
        <div class="${P}bar" style="margin-top:8px"><button type="button" class="cook">Onto the coals</button><button type="button" class="taste" hidden>Taste the jar (T) · −20 s</button><label><input type="checkbox" class="pause"> Pause the coals</label></div></div>
      <div class="${P}intro"><div class="${P}rcard"><h2>Foil Supper</h2><div class="when"></div>
        <p class="goal"></p><ol></ol><p class="gentle" hidden></p>
        <button type="button">Light the coals</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    $(".when").textContent = TEXT.when; $(`.${P}rcard .goal`).textContent = TEXT.goal;
    TEXT.steps.forEach((t) => { const li = document.createElement("li"); li.textContent = t; $("ol").appendChild(li); });
    if (gentle) { $(".gentle").hidden = false; $(".gentle").textContent = TEXT.gentle; }
    const counts = Object.fromEntries(INGR.map((i) => [i.id, i.n]));
    const packets = DINERS.map(() => ({}));
    let sel = null, coal = COALS_S, running = false, over = false, iv = 0, t = 0, tasted = false;
    const said = new Set();
    const say = (s) => { $(`.${P}say`).textContent = s; };
    const beat = (k, s) => { if (said.has(k)) return; said.add(k); say(s); };

    const allowed = (role, id) => (role === "Body" && id === "lentil") || (role === "Fat" && (id === "oil" || (id === "jar" && tasted)));
    const fit = (role, id) => (OWN[role] === id ? 3 : allowed(role, id) ? 2 : 1);
    function score(pk) {
      if (ROLES.some((r) => !pk[r])) return 0;
      const subs = ROLES.filter((r) => OWN[r] !== pk[r]);
      if (!subs.length) return 3;
      if (subs.length === 1 && allowed(subs[0], pk[subs[0]])) return 2;
      return 1;
    }

    CARD.forEach((ln) => { const p = document.createElement("p"); if (ln) p.textContent = ln; else { p.className = "blank"; p.innerHTML = "&nbsp;"; } $(".lines").appendChild(p); });

    const cool = $(".cool");
    const ingBtns = {};
    let key = 0;
    INGR.forEach((ing) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "ing";
      ing.key = ing.n > 0 || ing.late ? ++key : null;
      b.innerHTML = `<i>${ing.key || ""}</i><span></span>`;
      if (ing.late) b.hidden = true;
      b.addEventListener("click", () => pick(ing.id));
      cool.appendChild(b);
      ingBtns[ing.id] = b;
    });

    const sheetsEl = $(`.${P}sheets`);
    const roleBtns = [];
    DINERS.forEach((d, i) => {
      const s = document.createElement("div");
      s.className = P + "sheet";
      s.innerHTML = `<b>${d.toUpperCase()}${i === 5 ? " · GUEST" : ""}</b><span class="sc">–</span><div class="${P}roles"></div>`;
      const rr = s.querySelector(`.${P}roles`);
      roleBtns[i] = {};
      ROLES.forEach((r) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = P + "role";
        b.addEventListener("click", () => place(i, r));
        rr.appendChild(b);
        roleBtns[i][r] = b;
      });
      sheetsEl.appendChild(s);
    });

    const nameOf = (id) => INGR.find((x) => x.id === id).name;
    function paint() {
      INGR.forEach((ing) => {
        const b = ingBtns[ing.id];
        const sp = b.querySelector("span"); sp.innerHTML = "";
        const nm = document.createElement("span"); nm.textContent = ing.id === "jar" && tasted ? "The jar: lard" : ing.name;
        const sm = document.createElement("small"); sm.textContent = `×${counts[ing.id]} · ${ing.id === "jar" ? (tasted ? "fat" : "unknown") : ing.home.toLowerCase()}`;
        sp.append(nm, sm);
        b.disabled = counts[ing.id] <= 0;
        b.classList.toggle("out", ing.n === 0 && !ing.late);
        b.classList.toggle("sel", sel === ing.id);
      });
      DINERS.forEach((_, i) => {
        ROLES.forEach((r) => {
          const b = roleBtns[i][r], v = packets[i][r];
          b.className = P + "role" + (v ? "" : " empty");
          b.innerHTML = `<em>${r.toUpperCase()}</em>`;
          if (v) b.appendChild(document.createTextNode(v === "jar" && tasted ? "Lard" : nameOf(v)));
          if (!v && sel) { const pv = document.createElement("span"); const f = fit(r, sel); pv.className = "pv p" + f; pv.textContent = "= " + f; b.appendChild(pv); }
          b.setAttribute("aria-label", `${DINERS[i]} ${r}: ${v ? nameOf(v) : "empty"}${!v && sel ? `, would score ${fit(r, sel)}` : ""}`);
        });
        const sc = score(packets[i]);
        const scEl = sheetsEl.children[i].querySelector(".sc");
        const done = ROLES.every((r) => packets[i][r]);
        scEl.textContent = done ? sc : "–";
        scEl.className = "sc" + (done ? " s" + sc : "");
      });
      const made = packets.filter((pk) => score(pk) > 0);
      const avg = made.length ? packets.map(score).reduce((a, b) => a + b, 0) / DINERS.length : 0;
      $(`.${P}avg`).textContent = `made ${made.length}/6 · average ${avg.toFixed(2)}`;
      $(".hd").textContent = `${made.length}/6 packets`;
      const tb = $(".taste");
      tb.disabled = tasted || !running;
      tb.textContent = tasted ? "Tasted: lard" : `Taste the jar (T) · −${TASTE_COST} s`;
    }

    function pick(id) {
      if (!running || counts[id] <= 0) return;
      sel = id;
      if (sel === "jar" && !tasted) say(TEXT.untasted);
      paint();
    }
    function place(i, r) {
      if (!running) return;
      const cur = packets[i][r];
      if (cur) { counts[cur]++; delete packets[i][r]; paint(); return; }
      if (!sel || counts[sel] <= 0) {
        say(TEXT.pickFirst);
        const cb = $(".cbox"); if (!api.reducedMotion) { cb.classList.remove("shake"); void cb.offsetWidth; cb.classList.add("shake"); }
        return;
      }
      packets[i][r] = sel; counts[sel]--;
      if (counts[sel] <= 0) sel = null;
      paint();
      if (ROLES.every((x) => packets[i][x])) {
        const s = sheetsEl.children[i];
        if (!api.reducedMotion) { s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); }
        beat("fold", TEXT.folded);
      }
    }
    function taste() {
      if (!running || tasted || ingBtns.jar.hidden) return;
      tasted = true; coal = Math.max(1, coal - TASTE_COST); say(TEXT.tasted); paintCoal(); paint();
    }

    function cook(timeUp) {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      const scores = packets.map(score);
      const made = scores.filter((s) => s > 0).length;
      const avg = scores.reduce((a, b) => a + b, 0) / DINERS.length;
      const shared = DINERS.filter((_, i) => scores[i] === 0);
      const E = TEXT.end;
      const base = `${E.lead(timeUp)} ${E.stats(made, avg)} ${E.warm(avg)}`;
      api.store.set("last", { avg, made, supper_shared: scores[5] > 0 ? 1 : 0 });
      let outcome = "lose", tail = shared.length && made > 0 ? E.share(shared.join(", ")) : E.thin;
      if (made === 6 && avg >= 1.5) { outcome = "win"; tail = E.win; }
      else if (made === 6 && avg >= 1) { outcome = "done"; tail = E.done; }
      api.store.set("losses", outcome === "lose" ? losses + 1 : 0);
      api.end({ outcome, text: `${base} ${tail}` });
    }

    function paintCoal() {
      const m = Math.max(0, coal);
      $(`.${P}coal i`).style.width = (m / COALS_S * 100) + "%";
      $(`.${P}coal span`).textContent = `COALS ${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
      $(`.${P}coal`).classList.toggle("low", m <= 30);
    }
    function tick() {
      if (!running || $(".pause").checked) return;
      coal -= 1; t += 1;
      paintCoal();
      if (t === JAR_AT) { counts.jar = 2; ingBtns.jar.hidden = false; $(".taste").hidden = false; if (!api.reducedMotion) ingBtns.jar.classList.add("new"); say(TEXT.jar); said.add("jar"); paint(); }
      if (t === JAR_AT + 30) beat("marisol", TEXT.marisol);
      if (coal === 30) beat("low", TEXT.low);
      if (coal <= 0) cook(true);
    }
    const kd = (e) => {
      if (!running || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      const ing = INGR.find((x) => String(x.key) === k);
      if (ing && !ingBtns[ing.id].hidden) { pick(ing.id); return; }
      if (k === "t") taste();
    };
    window.addEventListener("keydown", kd);
    paintCoal();
    $(".cook").addEventListener("click", () => running && cook(false));
    $(".taste").addEventListener("click", taste);
    paint();
    const go = $(`.${P}rcard button`);
    go.addEventListener("click", () => {
      $(`.${P}intro`).remove();
      running = true;
      say(TEXT.open);
      iv = setInterval(tick, 1000);
      paint();
      ingBtns.potato.focus();
    });
    go.focus();

    return { unmount() { over = true; running = false; clearInterval(iv); window.removeEventListener("keydown", kd); } };
  },
};

// Missing Campsites / Foil Supper (1D, two-colour risograph recipe card).
//
// DESIGN.md section 11, Foil Supper, at foil_supper_2: day 2 dusk, five friends and Marisol, food
// for five. No corn, no butter, no onions, no ramps (gone at step 4). Each packet needs one
// ingredient in each role: Base, Body, Fat, Flavour. Score: 3 = the card's own in every role;
// 2 = one substitution the card allows; 1 = edible; 0 = a role empty, not made (that diner shares).
// The coal bar runs 3 minutes (pausable). Bea's card is in someone else's hand, so on day 2 its
// heading and every line naming the store are blank; the card was not copied on day 1 here.
// Selecting an ingredient shows, in pencil, the score each role would give it.
// Win: six packets made, average 1.5 or better. Lose: someone goes without, or average under 1.

const PINK = "#ff4fa3", TEAL = "#169c9c", NAVY = "#2a3b5a", PAPER = "#efe7dc";
const P = "missing-campsites-foil-supper-";
const ROLES = ["Base", "Body", "Fat", "Flavour"];
const INGR = [
  { id: "potato", name: "Potatoes", home: "Base", n: 6 },
  { id: "sausage", name: "Sausages", home: "Body", n: 4 },
  { id: "lentil", name: "Lentil cakes", home: "Body", n: 3 },
  { id: "oil", name: "Olive oil", home: "Fat", n: 4 },
  { id: "salt", name: "Salt & pepper", home: "Flavour", n: 7 },
  { id: "corn", name: "Store corn", home: "Base", n: 0 },
  { id: "butter", name: "Butter pats", home: "Fat", n: 0 },
  { id: "onion", name: "Garden onions", home: "Flavour", n: 0 },
];
const OWN = { Base: "potato", Body: "sausage", Fat: "butter", Flavour: "salt" };
const ALLOWED = { Body: ["lentil"], Fat: ["oil"] };          // "June: a lentil cake"; "or a spoon of oil"
const DINERS = ["Tam", "Dell", "Rafe", "Inés", "June", "Marisol"];
const COALS_S = 180;
// Bea's card. null = a line in her hand that named something from the campground: blank on day 2.
const CARD = [null, "2 potatoes, or any root", "1 sausage each (June: a lentil cake)", null, null, "salt & pepper", "fold tight, 3 folds", "coals 25 min"];

const fit = (role, id) => (OWN[role] === id ? 3 : (ALLOWED[role] || []).includes(id) ? 2 : 1);
function score(pk) {
  if (ROLES.some((r) => !pk[r])) return 0;
  const subs = ROLES.filter((r) => OWN[r] !== pk[r]);
  if (!subs.length) return 3;
  if (subs.length === 1 && (ALLOWED[subs[0]] || []).includes(pk[subs[0]])) return 2;
  return 1;
}

const CSS = `
.${P}wrap{position:absolute;inset:0;overflow:auto;background:${PAPER};color:${NAVY};font-family:'IBM Plex Mono',ui-monospace,monospace;padding:12px;box-sizing:border-box;display:grid;grid-template-rows:auto 1fr auto;gap:10px;
  background-image:radial-gradient(rgba(42,59,90,.07) 1px,transparent 1.3px);background-size:5px 5px}
.${P}head{background:${NAVY};color:${PAPER};padding:8px 14px;font-weight:600;font-size:clamp(18px,3vw,26px);letter-spacing:.1em;text-shadow:2px 1px 0 ${PINK}88;border:2px solid ${PINK};outline:2px solid ${TEAL};outline-offset:-6px}
.${P}main{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,2.2fr) minmax(150px,.9fr);gap:12px;align-items:start}
.${P}box{border:2px solid ${TEAL};padding:8px;box-shadow:3px 2px 0 ${PINK}66;background:${PAPER}}
.${P}box h4{margin:0 0 6px;color:${TEAL};letter-spacing:.2em;font-size:13px;text-shadow:1.5px 1px 0 ${PINK}77}
.${P}ing{display:flex;align-items:center;gap:8px;width:100%;font:inherit;font-size:13px;background:transparent;border:0;padding:4px;color:${NAVY};cursor:pointer;text-align:left}
.${P}ing i{width:30px;height:30px;flex:none;background:${PINK};background-image:radial-gradient(${PAPER} 1.3px,transparent 1.6px);background-size:5px 5px;mix-blend-mode:multiply}
.${P}ing:nth-child(even) i{background-color:${TEAL}}
.${P}ing small{display:block;opacity:.7}
.${P}ing.sel{outline:3px solid ${NAVY}}
.${P}ing:disabled{opacity:.45;cursor:default}
.${P}ing.out span{text-decoration:line-through;text-decoration-color:${PINK}}
.${P}sheets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.${P}sheet{border:2px solid ${PINK};padding:6px;position:relative;background:repeating-linear-gradient(45deg,#e7dfd6 0 3px,#f4eee6 3px 6px);box-shadow:-2px 2px 0 ${TEAL}66}
.${P}sheet b{display:block;font-size:12px;margin-bottom:4px;letter-spacing:.1em}
.${P}sheet .sc{position:absolute;top:-10px;right:-8px;width:28px;height:28px;border-radius:50%;background:${TEAL};color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;box-shadow:2px 1px 0 ${PINK}}
.${P}roles{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.${P}role{font:inherit;font-size:11px;min-height:44px;border:0;background:${PINK};background-image:radial-gradient(rgba(255,255,255,.35) 1.2px,transparent 1.5px);background-size:4px 4px;color:#fff;cursor:pointer;padding:3px;text-align:left;position:relative;line-height:1.15}
.${P}role.empty{background:rgba(255,79,163,.18);color:${NAVY};outline:1.5px dashed ${PINK};outline-offset:-3px}
.${P}role em{display:block;font-style:normal;font-size:9px;letter-spacing:.12em;opacity:.85}
.${P}role .pv{position:absolute;right:4px;bottom:2px;font-family:Caveat,cursive;font-size:18px;color:#4a4a4c}
.${P}card p{margin:0;padding:5px 2px;border-bottom:1px solid ${TEAL}66;font-family:Caveat,'Segoe Print',cursive;font-size:18px;min-height:20px;color:#5a4636}
.${P}card p.blank{background:repeating-linear-gradient(90deg,${PINK}22 0 6px,transparent 6px 10px);background-size:100% 3px;background-repeat:no-repeat;background-position:0 70%}
.${P}card small{display:block;margin-top:6px;font-size:11px;color:${TEAL}}
.${P}coal{border:2px solid ${TEAL};height:30px;position:relative;background:${PAPER}}
.${P}coal i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,${PINK},${TEAL});background-image:radial-gradient(${PAPER} 1.4px,transparent 1.7px),linear-gradient(90deg,${PINK},#ff9a3d);background-size:5px 5px,100% 100%}
.${P}coal span{position:absolute;right:8px;top:6px;font-weight:600;font-size:13px;color:${TEAL}}
.${P}bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.${P}bar button{font:600 14px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:8px 14px;cursor:pointer}
.${P}bar label{font-size:12px;display:flex;gap:6px;align-items:center}
.${P}intro{position:absolute;inset:0;display:grid;place-items:center;background:rgba(239,231,220,.93);z-index:4;padding:16px}
.${P}intro div{max-width:480px;border:2px solid ${PINK};box-shadow:4px 3px 0 ${TEAL};background:${PAPER};padding:18px 22px}
.${P}intro h2{margin:0 0 8px;font-size:24px;color:${NAVY};text-shadow:2px 1px 0 ${PINK}88}
.${P}intro p{margin:0 0 8px;font-size:13px;line-height:1.5}
.${P}intro button{font:600 14px 'IBM Plex Mono',monospace;background:${NAVY};color:${PAPER};border:2px solid ${PINK};padding:10px 20px;cursor:pointer}
@media (max-width:820px){.${P}main{grid-template-columns:1fr}.${P}sheets{order:-1;grid-template-columns:repeat(2,minmax(0,1fr))}.${P}main>.${P}box:first-child{order:-2;position:sticky;top:-12px;z-index:2}.cool{display:flex;flex-wrap:wrap;gap:2px}.${P}ing{width:auto;font-size:11px;padding:3px}.${P}ing i{width:16px;height:16px}.${P}ing.out{display:none}}
`;

export default {
  mount(root, api) {
    const wrap = document.createElement("div");
    wrap.className = P + "wrap";
    wrap.innerHTML = `<style>${CSS}</style>
      <div class="${P}head">FOIL SUPPER / DAY 2</div>
      <div class="${P}main">
        <div class="${P}box"><h4>COOLER</h4><div class="cool"></div></div>
        <div class="${P}sheets"></div>
        <div class="${P}box ${P}card"><h4>THE CARD</h4><div class="lines"></div><small>card: not copied · diners 5 + 1</small></div>
      </div>
      <div><div class="${P}coal"><i></i><span>COALS 3:00</span></div>
        <div class="${P}bar" style="margin-top:8px"><button type="button" class="cook">Onto the coals</button><label><input type="checkbox" class="pause"> Pause the coals</label><span class="msg" aria-live="polite"></span></div></div>
      <div class="${P}intro"><div><h2>Foil Supper</h2>
        <p>Dusk, day 2. Six to feed from food for five, and the store's things are gone. Each foil packet needs a Base, a Body, a Fat and a Flavour.</p>
        <p>Pick an ingredient, then a space. The pencil number is what it would score there: 3 the card's own, 2 a swap the card allows, 1 edible. Make all six before the coals die, averaging 1.5 or better.</p>
        <button type="button">Start</button></div></div>`;
    root.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    const counts = Object.fromEntries(INGR.map((i) => [i.id, i.n]));
    const packets = DINERS.map(() => ({}));
    let sel = null, coal = COALS_S, running = false, over = false, iv = 0;

    CARD.forEach((t) => { const p = document.createElement("p"); if (t) p.textContent = t; else { p.className = "blank"; p.innerHTML = "&nbsp;"; } $(".lines").appendChild(p); });

    const cool = $(".cool");
    const ingBtns = {};
    INGR.forEach((ing) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = P + "ing";
      b.innerHTML = `<i></i><span></span>`;
      b.addEventListener("click", () => { if (!running) return; sel = ing.id; paint(); });
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
        b.querySelector("span").innerHTML = "";
        const nm = document.createElement("span"); nm.textContent = ing.name;
        const sm = document.createElement("small"); sm.textContent = `×${counts[ing.id]} · ${ing.home.toLowerCase()}`;
        b.querySelector("span").append(nm, sm);
        b.disabled = counts[ing.id] <= 0;
        b.classList.toggle("out", ing.n === 0);
        b.classList.toggle("sel", sel === ing.id);
      });
      DINERS.forEach((_, i) => {
        ROLES.forEach((r) => {
          const b = roleBtns[i][r], v = packets[i][r];
          b.className = P + "role" + (v ? "" : " empty");
          b.innerHTML = `<em>${r.toUpperCase()}</em>${v ? nameOf(v) : ""}`;
          if (!v && sel) { const pv = document.createElement("span"); pv.className = "pv"; pv.textContent = "= " + fit(r, sel); b.appendChild(pv); }
          b.setAttribute("aria-label", `${DINERS[i]} ${r}: ${v ? nameOf(v) : "empty"}`);
        });
        const sc = score(packets[i]);
        sheetsEl.children[i].querySelector(".sc").textContent = ROLES.every((r) => packets[i][r]) ? sc : "–";
      });
    }

    function place(i, r) {
      if (!running) return;
      const cur = packets[i][r];
      if (cur) { counts[cur]++; delete packets[i][r]; if (!sel) sel = null; paint(); return; }
      if (!sel || counts[sel] <= 0) { msg("Pick something from the cooler first."); return; }
      packets[i][r] = sel; counts[sel]--;
      if (counts[sel] <= 0) sel = null;
      paint();
    }
    const msg = (t) => { $(".msg").textContent = t; };

    function cook(timeUp) {
      if (over) return;
      over = true; running = false; clearInterval(iv);
      const scores = packets.map(score);
      const made = scores.filter((s) => s > 0).length;
      const avg = scores.reduce((a, b) => a + b, 0) / DINERS.length;
      const shared = DINERS.filter((_, i) => scores[i] === 0);
      const lead = timeUp ? "The coals go grey; the packets cook as they are. " : "Every sheet goes onto the coals. ";
      const warm = avg >= 2 ? "Warmth +2." : avg >= 1 ? "Warmth +1." : "Nobody says much.";
      const base = `${lead}${made} of 6 packets made, average ${avg.toFixed(2)}. ${warm}`;
      api.store.set("last", { avg, made });
      if (made === 6 && avg >= 1.5) api.end({ outcome: "win", text: `${base} Marisol eats with the five of you, and says it is the best thing she has had all summer.` });
      else if (made === 6 && avg >= 1) api.end({ outcome: "done", text: `${base} Everyone is fed. Dell says nothing about the card.` });
      else api.end({ outcome: "lose", text: `${base} ${shared.length ? shared.join(", ") + " share" + (shared.length === 1 ? "s" : "") + " someone else's packet." : "It is not much of a supper."}` });
    }

    function tick() {
      if (!running || $(".pause").checked) return;
      coal -= 1;
      const m = Math.max(0, coal);
      $(`.${P}coal i`).style.width = (m / COALS_S * 100) + "%";
      $(`.${P}coal span`).textContent = `COALS ${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
      if (coal <= 0) cook(true);
    }
    $(`.${P}coal i`).style.width = "100%";
    $(".cook").addEventListener("click", () => running && cook(false));
    paint();
    const go = $(`.${P}intro button`);
    go.addEventListener("click", () => {
      $(`.${P}intro`).remove();
      running = true;
      iv = setInterval(tick, 1000);
      ingBtns.potato.focus();
    });
    go.focus();

    return { unmount() { over = true; running = false; clearInterval(iv); } };
  },
};

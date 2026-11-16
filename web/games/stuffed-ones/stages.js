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
const P = "stuffed-ones-stage-";
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
  return row;
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

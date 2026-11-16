// Behind the Peephole / the ladder every mode climbs (phase 2): TEACH, TEST, TWIST.
// Not a mode: a helper the six mode files import. It keeps which stage the player has reached
// (api.store: "reached", "at"), hands the mode a stage index, and turns a win on stages one and two
// into a choice: go on to the next stage, or stop here with that result. A loss or a "done" passes
// straight through to api.end, and Play again starts the same stage.
export const STAGE_NAMES = ["TEACH", "TEST", "TWIST"];

export function staged(P, titles, play) {
  return {
    mount(root, api) {
      let reached = Math.max(0, Math.min(2, api.store.get("reached", 0) | 0));
      let at = Math.max(0, Math.min(reached, api.store.get("at", reached) | 0));
      let inner = null, card = null, dead = false;
      const host = document.createElement("div");
      host.style.cssText = "position:absolute;inset:0";
      root.appendChild(host);
      const pal = api.palette || {};
      function start(i) {
        if (dead) return;
        if (inner) inner.unmount();
        if (card) { card.remove(); card = null; }
        host.innerHTML = "";
        at = i; api.store.set("at", at);
        const ctx = {
          stage: i, reached, name: STAGE_NAMES[i], title: titles[i],
          // a row of three stage buttons for the mode's own opening card
          row(btnClass) {
            const d = document.createElement("div");
            d.className = P + "stages";
            d.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:8px 0 2px";
            d.setAttribute("role", "group"); d.setAttribute("aria-label", "Stage");
            STAGE_NAMES.forEach((n, k) => {
              const b = document.createElement("button");
              b.type = "button"; b.className = btnClass; b.dataset.stage = k;
              b.style.cssText = "flex:1 1 30%;min-width:92px;font-size:12px;line-height:1.25;padding:5px 6px" + (k === i ? ";outline:2px solid currentColor;outline-offset:1px" : "");
              b.innerHTML = `<b>${k + 1} · ${n}</b><br><span style="font-weight:400;letter-spacing:0">${titles[k]}</span>`;
              b.disabled = k > reached;
              if (k > reached) b.title = "Reach it by winning the stage before";
              if (k === i) b.setAttribute("aria-current", "true");
              b.addEventListener("click", () => { if (k !== i && k <= reached) start(k); });
              d.appendChild(b);
            });
            return d;
          },
        };
        const sapi = Object.assign({}, api, {
          end(result = {}) {
            if (dead) return;
            if (result.outcome !== "win") { api.end(result); return; }
            if (i >= 2) { api.store.set("cleared", true); api.end(result); return; }
            reached = Math.max(reached, i + 1); api.store.set("reached", reached); api.store.set("at", i + 1);
            card = document.createElement("div");
            card.className = P + "between";
            card.style.cssText = `position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:14px;overflow:auto;background:rgba(8,7,5,.82);font:15px/1.45 Georgia,serif;color:${pal.fg || "#efe6cf"}`;
            card.innerHTML = `<div role="dialog" aria-label="Stage clear" style="max-width:520px;width:100%;box-sizing:border-box;background:${pal.bg || "#1f3a2e"};border:1.5px solid ${pal.accent || "#c98a3a"};padding:18px 20px;box-shadow:0 10px 40px #000a">
              <div style="font:600 12px 'IBM Plex Mono',monospace;letter-spacing:.14em;color:${pal.accent || "#c98a3a"}">STAGE ${i + 1} OF 3 · ${STAGE_NAMES[i]} · CLEAR</div>
              <p data-t style="margin:10px 0 14px"></p>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button type="button" data-next style="flex:2 1 200px;min-height:46px;font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.08em;cursor:pointer;background:${pal.accent || "#c98a3a"};color:#1c1a17;border:0;padding:8px 12px">NEXT · ${STAGE_NAMES[i + 1]}: ${titles[i + 1].toUpperCase()}</button>
                <button type="button" data-stop style="flex:1 1 120px;min-height:46px;font:600 13px 'IBM Plex Mono',monospace;letter-spacing:.08em;cursor:pointer;background:transparent;color:inherit;border:1px solid currentColor;padding:8px 12px">STOP HERE</button>
              </div></div>`;
            card.querySelector("[data-t]").textContent = result.text || "";
            card.querySelector("[data-next]").addEventListener("click", () => start(i + 1));
            card.querySelector("[data-stop]").addEventListener("click", () => { const c = card; card = null; c.remove(); api.end(result); });
            root.appendChild(card);
            card.querySelector("[data-next]").focus();
          },
        });
        inner = play(host, sapi, ctx) || null;
      }
      start(at);
      return { unmount() { dead = true; if (inner) inner.unmount(); inner = null; root.innerHTML = ""; } };
    },
  };
}

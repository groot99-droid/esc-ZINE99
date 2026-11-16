// WrymWretch: the ladder every mode climbs (phase 2). A mode is three stages: teach, test, twist.
//
//   export default staged({ stages: [{ name, sub }, x3] }, play)
//   play(root, api, ctx) -> { unmount() }     builds one stage, exactly as a mode's mount() did
//   ctx.stage                0, 1 or 2
//   ctx.reached              the furthest stage this player has opened (api.store "stage")
//   ctx.picker(el)           puts the three stage tabs into a how-to card; a tab restarts at that stage
//   ctx.done(wrap, { win, text, record })
//                            a stage is over. A loss, or the twist won, closes the mode with the Record
//                            behind the result. A win on teach or test offers the next stage, or stopping
//                            here with the result.
//   ctx.link(wrap, html)     the short note shown when a layer link fires ("because you ... in ...")
//   ctx.notice(wrap, realm, o)  phase 3: a part of the fourth row, shown in play to be noticed (_fourth.js);
//                            stopped when the stage ends. The picker and the stage-won card carry the
//                            notebook, so the parts gathered so far can always be looked at.
//   ctx.second               phase 3: true when a run has already reached the finale (the second
//                            playthrough); a mode reads differently then. A first run never sees it.
//
// Progress is kept in api.store, so a returning player starts at the stage they reached.

import { recordPage } from "./_art.js";
import { notice as fourthNotice, notebookButton, fourthStyle, runs } from "./_fourth.js";

export const STAGE = ["Teach", "Test", "Twist"];
const ROMAN = ["I", "II", "III"];
const CSS = `
.wrymwretch-stage-tabs{display:flex;gap:6px;margin:0 0 12px;flex-wrap:wrap}
.wrymwretch-stage-tabs button{all:unset;box-sizing:border-box;flex:1 1 0;min-width:86px;min-height:44px;padding:5px 8px;text-align:center;cursor:pointer;font:700 12.5px 'Cinzel',Georgia,serif;letter-spacing:.08em;color:#17151a;background:rgba(233,226,208,.6);border:1.5px solid #17151a;border-radius:2px}
.wrymwretch-stage-tabs button small{display:block;font:italic 13px 'Cormorant Garamond',Georgia,serif;letter-spacing:0;line-height:1.15}
.wrymwretch-stage-tabs button[aria-pressed="true"]{background:#17151a;color:#E9E2D0}
.wrymwretch-stage-tabs button:disabled{opacity:.42;cursor:default}
.wrymwretch-stage-tabs button:focus-visible{outline:3px solid #E7C566;outline-offset:1px}
.wrymwretch-stage-next{position:absolute;inset:0;z-index:14;display:grid;place-items:center;padding:16px;box-sizing:border-box;overflow:auto;background:rgba(11,13,26,.82);font-family:'Cormorant Garamond',Georgia,serif;color:#E9E2D0;opacity:0;transition:opacity .4s}
.wrymwretch-stage-next.on{opacity:1}
.wrymwretch-stage-next>div{width:min(460px,100%);box-sizing:border-box;padding:22px 24px 20px;background:linear-gradient(160deg,#1d2248,#0B0D1A);border:1px solid rgba(233,226,208,.5);box-shadow:0 10px 30px rgba(0,0,0,.6)}
.wrymwretch-stage-next h3{font:700 20px 'Cinzel',Georgia,serif;letter-spacing:.08em;margin:0 0 4px;color:#E7C566}
.wrymwretch-stage-next p{font-size:17px;line-height:1.35;margin:6px 0 12px}
.wrymwretch-stage-next p.then{font-style:italic;color:#b9c0cb;font-size:16px}
.wrymwretch-stage-next .row{display:flex;gap:10px;flex-wrap:wrap}
.wrymwretch-stage-next button{font:700 14px 'Cinzel',Georgia,serif;letter-spacing:.06em;min-height:46px;padding:8px 16px;cursor:pointer;border:1.5px solid #E7C566;background:#E7C566;color:#0B0D1A;flex:1 1 150px}
.wrymwretch-stage-next button.ghost{background:transparent;color:#E7C566}
.wrymwretch-stage-next button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.wrymwretch-stage-link{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:9;width:min(480px,calc(100% - 24px));box-sizing:border-box;padding:9px 14px 9px 38px;background:#0B0D1A;color:#E9E2D0;border:1px solid #A9C7E8;font:16px/1.3 'Cormorant Garamond',Georgia,serif;box-shadow:0 6px 18px rgba(0,0,0,.45);opacity:0;transition:opacity .5s;pointer-events:none}
.wrymwretch-stage-link.on{opacity:1}
.wrymwretch-stage-link.low{top:auto;bottom:76px}
.wrymwretch-stage-link::before{content:"";position:absolute;left:13px;top:14px;width:12px;height:12px;border-radius:50%;background:#A9C7E8;box-shadow:0 0 0 3px rgba(169,199,232,.25)}
.wrymwretch-stage-link b{color:#f3e2ac;font-weight:700}
`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function staged(def, play) {
  return {
    mount(root, api) {
      const get = (k, d) => { try { const v = api.store.get(k, d); return v == null ? d : v; } catch { return d; } };
      const set = (k, v) => { try { api.store.set(k, v); } catch { /* no storage */ } };
      let reached = Math.max(0, Math.min(2, +get("stage", 0) || 0));
      let inner = null, gone = false, linkT = null, notices = [];
      const style = document.createElement("style"); style.textContent = CSS; root.appendChild(style);
      fourthStyle(root);
      const stopNotices = () => { notices.forEach((n) => { try { n.stop(); } catch { /* gone */ } }); notices = []; };

      function start(stage) {
        if (gone) return;
        if (inner) { try { inner.unmount(); } catch { /* already gone */ } inner = null; }
        if (linkT) { clearTimeout(linkT); linkT = null; }
        stopNotices();
        const ctx = {
          stage, reached, def: def.stages[stage], second: runs(api) > 0,
          notice(wrap, realm, o = {}) {
            if (gone) return;
            const n = fourthNotice(wrap, api, realm, { ...o, onTake: (k, P) => {
              ctx.link(wrap, `Recorded: <b>${P.what}</b>. ${k === 6 ? "All six parts of the fourth row are in the notebook. On the seal, row IV will hold." : `The fourth row: ${k} of 6 parts in the notebook.`}`, 7000, o.low ? "low" : "");
              if (o.onTake) o.onTake(k, P);
            } });
            notices.push(n); return n;
          },
          picker(el) {
            if (!el) return;
            const box = document.createElement("div");
            box.className = "wrymwretch-stage-tabs"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Stage");
            def.stages.forEach((st, i) => {
              const b = document.createElement("button");
              b.type = "button"; b.dataset.stage = i; b.disabled = i > reached; b.setAttribute("aria-pressed", String(i === stage));
              b.innerHTML = `${ROMAN[i]} · ${STAGE[i].toUpperCase()}<small>${esc(st.name)}</small>`;
              if (i > reached) b.title = `Win ${STAGE[i - 1].toLowerCase()} to open it`;
              b.addEventListener("click", () => { if (i !== stage && i <= reached) start(i); });
              box.appendChild(b);
            });
            el.appendChild(box);
            el.appendChild(notebookButton(api, () => root));
          },
          link(wrap, html, ms = 9000, pos = "") {
            if (!wrap || gone) return;
            wrap.querySelectorAll(".wrymwretch-stage-link").forEach((n) => n.remove());
            const n = document.createElement("div");
            n.className = "wrymwretch-stage-link" + (pos === "low" ? " low" : ""); n.setAttribute("role", "status"); n.innerHTML = html;
            wrap.appendChild(n);
            requestAnimationFrame(() => n.classList.add("on"));
            if (linkT) clearTimeout(linkT);
            linkT = setTimeout(() => { linkT = null; n.classList.remove("on"); }, ms);
          },
          done(wrap, r) {
            if (gone) return;
            const close = (text) => { if (gone) return; if (r.record) recordPage(wrap, api, r.record); api.end({ outcome: r.win ? "win" : "lose", text: text || r.text }); };
            stopNotices();
            if (!r.win) return close();
            if (stage >= 2) { set("stage", 2); set("cleared", true); return close(); }
            reached = Math.max(reached, stage + 1); set("stage", reached);
            const nx = def.stages[stage + 1];
            const el = document.createElement("div");
            el.className = "wrymwretch-stage-next"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", `${STAGE[stage]} won`);
            el.innerHTML = `<div><h3>${ROMAN[stage]} · ${STAGE[stage]}: held</h3><p>${esc(r.text)}</p>
              <p class="then">${ROMAN[stage + 1]} · ${STAGE[stage + 1]}: ${esc(nx.name)}. ${esc(nx.sub || "")}</p>
              <div class="row"><button type="button" data-go>Go on</button><button type="button" class="ghost" data-stop>Stop here</button></div></div>`;
            el.firstElementChild.insertBefore(notebookButton(api, () => root, true), el.firstElementChild.querySelector(".row"));
            wrap.appendChild(el);
            requestAnimationFrame(() => el.classList.add("on"));
            el.querySelector("[data-go]").addEventListener("click", () => start(stage + 1));
            el.querySelector("[data-stop]").addEventListener("click", () => { el.remove(); close(`${r.text} You stopped after ${STAGE[stage].toLowerCase()}; ${STAGE[stage + 1].toLowerCase()} is open when you come back.`); });
            el.querySelector("[data-go]").focus();
          },
        };
        inner = play(root, api, ctx);
      }
      start(reached);
      return { unmount() { gone = true; stopNotices(); if (linkT) clearTimeout(linkT); if (inner) { try { inner.unmount(); } catch { /* gone */ } } style.remove(); root.querySelectorAll(":scope > style[data-fourth], :scope > .wrymwretch-fourth-book").forEach((n) => n.remove()); } };
    },
  };
}

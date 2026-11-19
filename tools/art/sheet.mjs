// Contact sheets of a game's code-drawn art, for looking at it.
//   node tools/art/sheet.mjs <slug> <out-dir> [group ...]
// Writes <out-dir>/<group>-<n>.png (up to 24 assets a sheet, 1600 px wide), from art.json.
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"))); }
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [slug, out, ...groups] = process.argv.slice(2);
const art = path.join(ROOT, "games", slug, "art");
const man = JSON.parse(fs.readFileSync(path.join(art, "art.json"), "utf8"));
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const by = {};
for (const a of man.assets) if (!groups.length || groups.includes(a.group)) (by[a.group] ||= []).push(a);
for (const [g, list] of Object.entries(by)) {
  for (let i = 0; i < list.length; i += 24) {
    const cells = list.slice(i, i + 24).map((a) => {
      const svg = fs.readFileSync(path.join(art, g, a.id + ".svg"), "utf8");
      return `<figure><div class="b">${svg}</div><figcaption>${a.id} · ${a.w}×${a.h}</figcaption></figure>`;
    }).join("");
    await page.setContent(`<style>body{margin:12px;background:#777;font:11px monospace;display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
      figure{margin:0}.b{height:230px;display:flex;align-items:center;justify-content:center;background:#999}
      .b svg{max-width:100%;max-height:230px;width:auto;height:auto}figcaption{color:#fff;padding:2px 0;overflow:hidden;white-space:nowrap}</style>${cells}`);
    const f = path.join(out, `${g}-${i / 24 + 1}.png`);
    await page.screenshot({ path: f, fullPage: true });
    console.log(f);
  }
}
await browser.close();

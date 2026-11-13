// Smoke-test the web site in a headless browser.
//
//   node tools/web/smoke.mjs [slug ...] [--shots DIR]
//
// Serves web/ itself (index.html wrapped in the same doctype skeleton the artifact host adds),
// opens the hub, then each game's loading screen and menu, then every mode. A route fails on a
// console error, an uncaught exception, or a mode that mounts nothing visible. With --shots, saves
// a screenshot of each route (1280x800) into DIR. Exit 0 when every route passes.
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"))); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web");
const args = process.argv.slice(2);
const shotsAt = args.indexOf("--shots");
const shots = shotsAt >= 0 ? args[shotsAt + 1] : null;
const only = args.filter((a, i) => !a.startsWith("--") && i !== shotsAt + 1);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };
const SKELETON = (body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(f);
  if (p === "/index.html") body = SKELETON(body.toString());
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  res.end(body);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;
const catalog = (await import(path.join(ROOT, "data/catalog.js"))).default;
const games = catalog.games.filter((g) => !only.length || only.includes(g.slug));
if (shots) fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
let errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const failures = [];

async function visit(hash, name, check) {
  errors = [];
  await page.goto(base + "#" + hash);
  await page.waitForTimeout(hash.includes("--") ? 3800 : 2900);
  const problem = await check();
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png") });
  const bad = errors.filter((e) => !/fonts\.(googleapis|gstatic)/.test(e));
  if (bad.length || problem) failures.push(`${name}: ${problem || ""} ${bad.slice(0, 3).join(" | ")}`.trim());
  console.log(`${bad.length || problem ? "FAIL" : "ok  "} ${name}${problem ? " " + problem : ""}${bad.length ? " " + bad[0] : ""}`);
}

await visit("", "hub", async () => (await page.locator(".cover").count()) === catalog.games.length ? null : "hub covers missing");
for (const g of games) {
  await visit(g.slug, `${g.slug}`, async () => (await page.locator(".mode").count()) === g.modes.length ? null : "menu incomplete");
  for (const m of g.modes) {
    await visit(`${g.slug}--${m.key}`, `${g.slug}--${m.key}`, async () => {
      if (await page.locator(".err").count()) return (await page.locator(".err").first().textContent()).trim();
      if (!(await page.locator(".play").count())) return "no play area";
      const n = await page.locator(".play *").count();
      if (n < 3) return "mode drew almost nothing";
      if (await page.locator(".err").count()) return (await page.locator(".err").first().textContent()).trim();
      return null;
    });
  }
}
await browser.close();
server.close();
console.log(failures.length ? `FAIL web (${failures.length} routes)` : `ok   web (${games.length} games)`);
process.exit(failures.length ? 1 : 0);

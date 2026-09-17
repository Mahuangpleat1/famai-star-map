import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
const html = '<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'"></head><body><div id="root"></div><script type="module" src="/project/assets/app.js"></script></body></html>';
async function smoke({ wrongFallback = false, brokenAsset = false, pages = true } = {}) {
  const server = createServer((req, res) => {
    for (const key of ["x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"]) res.setHeader(key, "test");
    const path = req.url;
    if (path === "/project/manifest.webmanifest") {res.setHeader("Content-Type", "application/manifest+json"); res.end(JSON.stringify({start_url: "./", scope: "./", icons: [{src: "favicon.svg"}]}));}
    else if (path === "/project/favicon.svg") {res.setHeader("Content-Type", "image/svg+xml"); res.end("<svg></svg>");}
    else if (path === "/project/assets/app.js" || path === "/project/sw.js" || path === "/project/early-boot.js") {res.setHeader("Content-Type", "application/javascript");res.statusCode = brokenAsset && path.includes("assets/") ? 404 : 200;res.end("console.log('test')");}
    else {res.setHeader("Content-Type", "text/html"); if (path !== "/project/") res.statusCode = pages ? 404 : 200; res.end(wrongFallback && path !== "/project/" ? "<html>404 missing</html>" : html);}
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    return await new Promise(resolve => {
      const p = spawn(process.execPath, ["scripts/smoke-deploy.mjs"], {env: {...process.env, STAGING_URL: `http://127.0.0.1:${server.address().port}/project/`, SMOKE_PLATFORM: pages ? "github-pages" : "standard", SMOKE_SKIP_SECURITY_HEADERS: "0"}});
      let output = "";
      p.stdout.on("data", chunk => output += chunk); p.stderr.on("data", chunk => output += chunk);
      p.on("close", code => resolve({code, output}));
    });
  } finally { await new Promise(resolve => server.close(resolve)); }
}
test("Pages subpath requires matching fallback shell, valid manifest and reachable JS", async () => {
  const result = await smoke(); assert.equal(result.code, 0, result.output);
});
test("arbitrary 404 HTML is a failed deployment", async () => {
  const result = await smoke({wrongFallback: true}); assert.equal(result.code, 1, result.output);
});
test("missing built JavaScript fails even when index works", async () => {
  const result = await smoke({brokenAsset: true}); assert.equal(result.code, 1, result.output);
});
test("standard hosting still requires HTTP 200 SPA fallback", async () => {
  const result = await smoke({pages: false}); assert.equal(result.code, 0, result.output);
});

#!/usr/bin/env node
/** Verify a deployed root or subpath. Requires explicit STAGING_URL.
 * Standard hosts must return HTTP 200 SPA fallback and security headers.
 * SMOKE_PLATFORM=github-pages verifies the actual Pages HTTP 404 fallback
 * against the entry HTML, plus its meta CSP; never ignores a failed smoke run.
 * Local preview only: SMOKE_SKIP_SECURITY_HEADERS=1 (not a production check).
 */
const requiredHeaders = ["x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"];
async function main() {
  if (!process.env.STAGING_URL) throw new Error("Set STAGING_URL to the explicit deployment URL");
  const base = new URL(`${process.env.STAGING_URL.replace(/\/+$/, "")}/`);
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("STAGING_URL must be HTTP(S)");
  const pages = process.env.SMOKE_PLATFORM === "github-pages";
  async function request(path, status = 200, mime = "") {
    const url = new URL(path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error(`Resource outside deployment scope: ${path}`);
    const response = await fetch(url, {redirect: "manual", signal: AbortSignal.timeout(15000)});
    if (response.status !== status) throw new Error(`${url.pathname}: expected ${status}, got ${response.status}`);
    if (mime && !mime.split("|").some(value => response.headers.get("content-type")?.includes(value))) throw new Error(`${url.pathname}: unexpected content-type`);
    console.log(`[OK] ${response.status} ${url.pathname}`);
    return response;
  }
  const entry = await request("", 200, "text/html");
  const html = await entry.text();
  if (!/id=["']root["']/.test(html)) throw new Error("Entry is not the application HTML");
  const manifest = await (await request("manifest.webmanifest", 200, "json")).json();
  for (const field of ["start_url", "scope"]) {
    if (typeof manifest[field] !== "string" || new URL(manifest[field], base).href !== base.href) throw new Error(`Manifest ${field} must resolve to deployment base`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) throw new Error("Manifest has no icons");
  for (const icon of manifest.icons) await request(icon.src, 200, "image/");
  await request("favicon.svg", 200, "image/svg+xml");
  await request("sw.js", 200, "javascript");
  await request("early-boot.js", 200, "javascript");
  const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi), match => match[1]);
  if (!scripts.some(path => path.includes("/assets/"))) throw new Error("Entry has no built JavaScript");
  for (const path of scripts) await request(path, 200, "javascript");
  const fallback = await request(`anything-random-path-${Date.now()}`, pages ? 404 : 200, "text/html");
  if ((await fallback.text()) !== html) throw new Error("SPA fallback is not the deployed entry HTML");
  if (pages) {
    if (!/http-equiv=["']Content-Security-Policy["']/i.test(html)) throw new Error("Pages entry must contain meta CSP");
    console.log("[OK] Pages 404 serves matching application shell; meta CSP present (host cannot provide custom headers)");
  } else if (process.env.SMOKE_SKIP_SECURITY_HEADERS === "1") {
    console.log("[SKIP] Header verification explicitly disabled for local preview");
  } else {
    const response = await fetch(base, {method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(15000)});
    if (response.status !== 200) throw new Error(`HEAD entry: expected 200, got ${response.status}`);
    const missing = requiredHeaders.filter(header => !response.headers.has(header));
    if (missing.length) throw new Error(`Missing security headers: ${missing.join(", ")}`);
  }
  console.log(`[smoke-deploy] PASS ${base.href}`);
}
main().catch(error => { console.error(`[smoke-deploy] FAIL: ${error.message}`); process.exitCode = 1; });

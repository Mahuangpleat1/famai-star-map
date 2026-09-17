import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";
const code = await readFile(new URL("../../public/sw.js", import.meta.url), "utf8");
function harness(path = "/project/") {
  const events = {}; const preloaded = []; const cached = new Map(); const removed = [];
  const cache = { addAll: async urls => preloaded.push(...urls), match: async key => cached.get(typeof key === "string" ? key : key.url), put: async (key, value) => cached.set(typeof key === "string" ? key : key.url, value) };
  const ctx = { URL, Response, fetch: async () => { throw new Error("offline"); }, caches: { open: async () => cache, keys: async () => ["famai-v1", "famai-/other/-v2"], delete: async key => removed.push(key) }, self: { registration: {scope: `https://site.example${path}`}, location: {origin: "https://site.example"}, addEventListener: (name, handler) => events[name] = handler, skipWaiting: async () => {}, clients: {claim: async () => {}} } };
  vm.runInNewContext(code, ctx);
  return {events, preloaded, cached, removed};
}
for (const base of ["/", "/project/"]) {
  test(`precache and navigation fallback respect ${base}`, async () => {
    const h = harness(base); let pending;
    h.events.install({waitUntil: promise => pending = promise}); await pending;
    assert.ok(h.preloaded.includes(`${base}index.html`));
    assert.ok(h.preloaded.every(path => path.startsWith(base)));
    h.cached.set(`${base}index.html`, new Response("app shell"));
    let response;
    h.events.fetch({request: {url: `https://site.example${base}route`, method: "GET", mode: "navigate"}, respondWith: promise => response = promise});
    assert.equal(await (await response).text(), "app shell");
  });
}
test("API GETs, external resources and sibling apps bypass caching", () => {
  const h = harness();
  for (const url of ["https://site.example/project/api/models", "https://other.example/file.svg", "https://site.example/other/assets/test.js"]) {
    let called = false;
    h.events.fetch({request: {url, method: "GET", mode: "cors"}, respondWith: () => called = true});
    assert.equal(called, false, url);
  }
});
test("missing JS never receives HTML fallback", async () => {
  const h = harness(); h.cached.set("/project/index.html", new Response("app shell"));
  let response;
  h.events.fetch({request: {url: "https://site.example/project/assets/missing.js", method: "GET", mode: "cors"}, respondWith: promise => response = promise});
  assert.equal((await response).type, "error");
});
test("subpath activation never removes sibling/root app caches", async () => {
  const h = harness(); let pending;
  h.events.activate({waitUntil: promise => pending = promise}); await pending;
  assert.deepEqual(h.removed, []);
});

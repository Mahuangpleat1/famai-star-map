/* eslint-env serviceworker, browser */
/* eslint-disable no-restricted-globals */
// 法脉星图 · Service Worker
// 作用:离线打开 app 壳(HTML/CSS/JS/SVG/fonts/manifest) + 提速二次访问
// 缓存策略:
//   1) cache-first              → /assets/*  (Vite 产出的 hashed 文件,文件名带 hash 可永久缓存)
//   2) network-first            → / 与 /index.html 与 /manifest.webmanifest (经常更新,优先拉新,失败用缓存)
//   3) stale-while-revalidate   → *.svg / favicon / 字体 (低频变更,先返缓存再后台刷新)
//   4) network-first + SPA fallback → 同源页面导航  (失败/离线时返回 /index.html,由前端 router 接管)
//
// 跨域请求(LLM API / 法条外链 / CDN)直接放行,不进入 SW。
// 缓存版本号:CACHE_NAME = "famai-v2",升级 v2/v3 时,activate 会自动清理 famai- 前缀的旧缓存。
//
// 本文件无任何 npm 依赖,纯 Web API,符合项目"零第三方 SDK"原则。

const CACHE_NAME = "famai-v2";
const BASE_PATH = new URL(self.registration.scope).pathname;
const CACHE_PREFIX = `famai-${BASE_PATH}-`;
const SCOPED_CACHE_NAME = `${CACHE_PREFIX}${CACHE_NAME}`;
function scopedPath(path) { return `${BASE_PATH}${path.slice(1)}`; }

// 预缓存关键资源:app 壳 + 静态资源
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/og-image.svg",
  "/mask-icon.svg"
].map(scopedPath);

// ========== install:预缓存 + skipWaiting ==========
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SCOPED_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // skipWaiting:新版本 SW 立即进入 activated 状态,不等旧 SW 控制的 tab 关闭
      .then(() => self.skipWaiting())
  );
});

// ========== activate:清理旧缓存 + clientsClaim ==========
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // 清理所有 famai- 前缀的旧版本缓存(只保留当前 CACHE_NAME)
          keys
            .filter((key) => (key.startsWith(CACHE_PREFIX) && key !== SCOPED_CACHE_NAME) || (BASE_PATH === "/" && key === "famai-v1"))
            .map((key) => caches.delete(key))
        )
      )
      // clientsClaim:SW 激活后立即接管所有已打开的页面(不需要刷新)
      .then(() => self.clients.claim())
  );
});

// ========== 路由判定工具 ==========

// 跨域 / 非 http(s) scheme 一律放行:
// - LLM API 用户自配 baseURL(可能在任意域名)
// - 外链法条(flk.npc.gov.cn 等)
// - chrome-extension:// 等浏览器内部 scheme
function shouldBypass(url) {
  if (url.origin !== self.location.origin) return true;
  if (!url.protocol.startsWith("http")) return true;
  if (!url.pathname.startsWith(BASE_PATH)) return true;
  return false;
}

// Vite 产出的资源在 /assets/ 下,文件名带 hash(如 index-AbCdEf.js)
// hash 变了文件名就变,所以可以永久缓存
function isHashedAsset(pathname) {
  return pathname.startsWith(scopedPath("/assets/"));
}

// HTML 入口 + manifest 必须 network-first,否则发布新版后用户还卡在旧壳上
function isNetworkFirst(pathname) {
  return (
    pathname === scopedPath("/") ||
    pathname === scopedPath("/index.html") ||
    pathname === scopedPath("/manifest.webmanifest")
  );
}

// SVG / 字体 可能改但低频,用 SWR 兼顾首屏速度
function isStaleWhileRevalidate(pathname) {
  if (pathname.endsWith(".svg")) return true;
  if (
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".otf")
  ) {
    return true;
  }
  return false;
}

// ========== fetch 拦截 ==========
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // 只处理 GET,POST/PUT/DELETE 等直接放行(SW 不缓存 mutation)
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch (_e) {
    return;
  }

  // 跨域 / 非 http scheme → 放行给浏览器原生 fetch
  if (shouldBypass(url)) return;

  const { pathname } = url;

  // 1) Hashed 资源:cache-first
  if (isHashedAsset(pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 2) HTML / manifest:network-first
  if (isNetworkFirst(pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 3) SVG / 字体:stale-while-revalidate
  if (isStaleWhileRevalidate(pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 4) 同源页面导航:network-first + 离线 fallback 到 /index.html
  if (request.mode === "navigate") event.respondWith(networkFirstWithSPAFallback(request));
});

// ========== 策略实现 ==========

// cache-first:有缓存用缓存,没有走网络;网络成功回写缓存
async function cacheFirst(request) {
  const cache = await caches.open(SCOPED_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    // Missing JS/CSS must remain a failed resource, never HTML.
    return Response.error();
  }
}

// network-first:先网络,失败回退缓存;网络成功回写缓存
async function networkFirst(request) {
  const cache = await caches.open(SCOPED_CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return request.mode === "navigate" ? (await cache.match(scopedPath("/index.html"))) || Response.error() : Response.error();
  }
}

// stale-while-revalidate:立刻返缓存(如有),后台异步拉新版本
async function staleWhileRevalidate(request) {
  const cache = await caches.open(SCOPED_CACHE_NAME);
  const cached = await cache.match(request);

  // 后台拉新(失败不抛,只静默)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // 优先返缓存;没缓存才等网络
  return (
    cached ||
    (await networkPromise) ||
    Response.error()
  );
}

// network-first + SPA fallback:网络失败时返回 /index.html
// 适用于同源 SPA 路由(任意 path 离线时都进 app,由前端 router 决定视图)
async function networkFirstWithSPAFallback(request) {
  const cache = await caches.open(SCOPED_CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    return (
      (await cache.match(request)) ||
      (await cache.match(scopedPath("/index.html"))) ||
      Response.error()
    );
  }
}

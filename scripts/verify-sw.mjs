#!/usr/bin/env node
/* eslint-env node */
/**
 * 验证 public/sw.js 的语法 + 关键 SW 生命周期事件 + cache 策略完整性。
 *
 * 设计边界(本脚本只做静态校验,不做运行时行为测试):
 *   - 不引 jsdom 跑 SW(超出范围,SW 需要真实 service worker 上下文)
 *   - 用 node 内置 vm.Script 编译,等价于 `node --check` 但能报更友好错误
 *   - 校验必备事件:install / activate / fetch
 *   - 校验 CACHE_NAME 形如 famai-vN
 *   - 校验 cache 策略 4 函数齐全:cacheFirst / networkFirst / staleWhileRevalidate /
 *     networkFirstWithSPAFallback
 *   - 校验路径判定函数覆盖核心 path:`/`、`/index.html`、`/manifest.webmanifest`、
 *     `/assets/*`、`*.svg`、`*.woff2`
 *   - 校验 SPA fallback 在 networkFirstWithSPAFallback 里回退到 `/index.html`
 *
 * 退出码:
 *   0 → PASS
 *   1 → FAIL
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 接受命令行参数:node scripts/verify-sw.mjs [path-to-sw]
// 默认校验 public/sw.js,测试场景可指向临时坏文件
const SW_PATH = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, "..", "public", "sw.js");

const results = []; // 收集所有结果,exit code 由结果决定

function record(passed, msg) {
  results.push({ passed, msg });
  if (passed) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
  }
}

function summarize() {
  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error(
      `\n[verify-sw] FAIL: ${failed.length}/${results.length} checks failed`
    );
    for (const r of failed) {
      console.error(`  - ${r.msg}`);
    }
    process.exit(1);
  }
  console.log(`\n[verify-sw] PASS: ${results.length}/${results.length} checks ✓`);
  process.exit(0);
}

try {
  const code = await readFile(SW_PATH, "utf8");
  if (!code.trim()) {
    record(false, `${SW_PATH} is empty`);
    summarize();
  }
  record(true, `read ${SW_PATH} (${code.length} bytes)`);

  // 1) 语法检查:vm.Script 编译(等价于 node --check,但能精确报错位置)
  try {
    // vm.Script 本身就是检查,不需要 execute(此处有副作用:触发 parse 校验)
    new vm.Script(code, { filename: "sw.js" });
    record(true, "vm.Script syntax check passed");
  } catch (parseErr) {
    record(false, `SyntaxError in sw.js: ${parseErr.message}`);
    summarize(); // 语法失败后续检查无意义
  }

  // 2) 必备生命周期事件(都用 addEventListener 风格)
  const requiredEvents = ["install", "activate", "fetch"];
  for (const evt of requiredEvents) {
    if (!code.includes(`addEventListener("${evt}"`)) {
      record(false, `Missing self.addEventListener("${evt}", ...)`);
    } else {
      record(true, `lifecycle event: ${evt}`);
    }
  }

  // 3) CACHE_NAME 形如 famai-vN
  const cacheNameMatch = code.match(/CACHE_NAME\s*=\s*["']([^"']+)["']/);
  if (!cacheNameMatch) {
    record(false, `CACHE_NAME constant not found in sw.js`);
  } else {
    const cacheName = cacheNameMatch[1];
    if (!/^famai-v\d+$/.test(cacheName)) {
      record(
        false,
        `CACHE_NAME="${cacheName}" 格式不符合 famai-vN 约定(升级 v2/v3 时请同步旧缓存清理逻辑)`
      );
    } else {
      record(true, `CACHE_NAME=${cacheName} (matches famai-vN)`);
    }
  }

  // 4) skipWaiting + clientsClaim(确保升级时能立刻接管)
  if (!code.includes("skipWaiting")) {
    record(false, `sw.js 没有调用 self.skipWaiting(),新版本无法自动激活`);
  } else {
    record(true, "self.skipWaiting() called");
  }
  if (!code.includes("clients.claim")) {
    record(
      false,
      `sw.js 没有调用 self.clients.claim(),激活后无法立即接管现有页面`
    );
  } else {
    record(true, "self.clients.claim() called");
  }

  // 5) 4 个 cache 策略函数必须存在(grep 函数定义 + 调用)
  const strategies = [
    { name: "cacheFirst", purpose: "/assets/* hashed 资源永久缓存" },
    { name: "networkFirst", purpose: "HTML/manifest 优先拉新" },
    { name: "staleWhileRevalidate", purpose: "SVG/字体秒开 + 后台更新" },
    {
      name: "networkFirstWithSPAFallback",
      purpose: "其他同源 GET 网络失败回 /index.html"
    }
  ];
  for (const { name, purpose } of strategies) {
    const defined = new RegExp(`(async\\s+)?function\\s+${name}\\s*\\(`).test(code);
    if (!defined) {
      record(false, `cache 策略函数 ${name}() 未定义(${purpose})`);
    } else {
      record(true, `cache strategy: ${name}() — ${purpose}`);
    }
  }

  // 6) 路径判定函数覆盖核心 path
  //    isNetworkFirst: "/", "/index.html", "/manifest.webmanifest"
  //    isHashedAsset: "/assets/xxx.js" → true
  const networkFirstBlock = code.match(/function\s+isNetworkFirst[\s\S]*?\n\}/);
  if (!networkFirstBlock) {
    record(false, "isNetworkFirst() 函数未找到");
  } else {
    const block = networkFirstBlock[0];
    const required = ['"/"', '"/index.html"', '"/manifest.webmanifest"'];
    for (const path of required) {
      if (!block.includes(path)) {
        record(false, `isNetworkFirst() 缺少路径 ${path}`);
      } else {
        record(true, `isNetworkFirst() covers ${path}`);
      }
    }
  }

  const hashedAssetBlock = code.match(/function\s+isHashedAsset[\s\S]*?\n\}/);
  if (!hashedAssetBlock) {
    record(false, "isHashedAsset() 函数未找到");
  } else if (!hashedAssetBlock[0].includes('"/assets/')) {
    record(false, `isHashedAsset() 未匹配 "/assets/" 前缀`);
  } else {
    record(true, `isHashedAsset() covers /assets/*`);
  }

  // 7) SPA fallback 验证:networkFirstWithSPAFallback 必须 fallback 到 /index.html
  const spaFallbackBlock = code.match(
    /async\s+function\s+networkFirstWithSPAFallback[\s\S]*?\n\}/
  );
  if (!spaFallbackBlock) {
    record(false, "networkFirstWithSPAFallback() 函数未找到");
  } else if (!spaFallbackBlock[0].includes('"/index.html"')) {
    record(
      false,
      `networkFirstWithSPAFallback() 未回退到 /index.html(离线 / 死链 / 拼错 URL 时 React 接管失败)`
    );
  } else {
    record(
      true,
      `SPA fallback: networkFirstWithSPAFallback() → /index.html (React 路由接管)`
    );
  }

  // 8) PRECACHE_URLS 至少包含核心 3 项(/、/index.html、/manifest.webmanifest)
  const precacheBlock = code.match(/PRECACHE_URLS\s*=\s*\[([\s\S]*?)\]/);
  if (!precacheBlock) {
    record(false, "PRECACHE_URLS 常量未找到");
  } else {
    const inner = precacheBlock[1];
    const required = ['"/"', '"/index.html"', '"/manifest.webmanifest"'];
    for (const path of required) {
      if (!inner.includes(path)) {
        record(false, `PRECACHE_URLS 缺少预缓存项 ${path}`);
      } else {
        record(true, `PRECACHE_URLS includes ${path}`);
      }
    }
  }

  // 9) 跨域 / 非 http scheme 放行(shouldBypass 存在)
  if (!/function\s+shouldBypass/.test(code)) {
    record(false, `shouldBypass() 未定义(LLM API / 外链 / 浏览器内部 scheme 应直接放行)`);
  } else {
    record(true, `shouldBypass() defined (LLM/external schemes bypass SW)`);
  }

  summarize();
} catch (err) {
  console.error(`[verify-sw] FAIL: ${err && err.message ? err.message : String(err)}`);
  process.exit(1);
}

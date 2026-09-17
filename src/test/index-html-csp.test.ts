import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexHtmlPath = resolve(process.cwd(), "index.html");

// CSP 为 script-src 'self' 'unsafe-eval'(不含 unsafe-inline):
// index.html 里的任何可执行 inline <script> 都会被浏览器拦截、静默失效。
// 防回归:除 application/ld+json 数据块外,index.html 不允许出现 inline 脚本。
describe("index.html CSP 约束", () => {
  const html = readFileSync(indexHtmlPath, "utf8");
  const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];

  it("不含可执行 inline 脚本(仅允许 application/ld+json)", () => {
    const offenders = scriptBlocks
      .filter(([, attrs, body]) => {
        const isDataBlock = /type\s*=\s*"application\/ld\+json"/i.test(attrs);
        return !isDataBlock && body.trim().length > 0;
      })
      .map(([full]) => full.slice(0, 80));
    expect(offenders).toEqual([]);
  });

  it("早期启动脚本通过外链引入(CSP self 允许)", () => {
    expect(html).toMatch(/<script\b[^>]*src="\/early-boot\.js"[^>]*>/);
  });
});

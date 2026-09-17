// scripts/__tests__/a11y-contrast.test.mjs
//
// Track I · a11y 颜色对比度 CI backstop
//
// 跑法: `node --test scripts/__tests__/a11y-contrast.test.mjs`
//      或 `npm run test:contrast`
//
// 设计:扫 dist/assets/*.css (build 产物),验证所有 `rgba(R, G, B, A)` 中
//  - `A < 0.5` 必须为 0(backstop,保守阈值,实际正文阈值 0.78 在源里)
//
// 同时扫源 CSS 文件 `src/law-universe-lab/css/*.css`,验证:
//  - 任何非 :disabled / .is-disabled / [aria-disabled] 块内的 `color: rgba(R, G, B, A)` 中
//    `A < 0.5` 必须为 0
//
// 这不是替换 `scripts/audit-color-contrast.mjs` 的细粒度审计,而是 CI 硬 backstop:
// 保证 0 严重失败(0.5 以下 alpha 完全不能进入产品)。
//
// 退出码:0 = pass / 1 = fail

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const CSS_SRC_DIR = resolve(REPO, "src", "law-universe-lab", "css");
const DIST_ASSETS = resolve(REPO, "dist", "assets");

// 0.5 是 CI backstop 阈值(保守,实际正文 0.78 + disabled 例外见源审计)
const HARD_BACKSTOP = 0.5;

const COLOR_REGEX = /(?:^|[\s;{(])(?:color|background-color|caret-color|column-rule-color|text-decoration-color|fill|stroke)\s*:\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;

function listFiles(dir, ext) {
  /** @type {string[]} */
  const out = [];
  if (!existsSync(dir)) return out;
  /** @type {string[]} */
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = readdirSync(cur);
    } catch {
      continue;
    }
    for (const name of entries) {
      const p = join(cur, name);
      let s;
      try { s = statSync(p); } catch { continue; }
      if (s.isDirectory()) stack.push(p);
      else if (p.endsWith(ext)) out.push(p);
    }
  }
  return out;
}

/**
 * 扫一组 CSS 文件,返回 { violations: [{ file, line, r, g, b, a, prop }], total: N }
 * violations = A < HARD_BACKSTOP 的所有 color rgba(忽略 :disabled 块)
 */
function scanCssFiles(files) {
  /** @type {{ file: string, line: number, r: number, g: number, b: number, a: number, prop: string }[]} */
  const violations = [];
  let total = 0;

  for (const file of files) {
    const rel = relative(REPO, file);
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");

    let currentBlockSelector = "";
    let braceDepth = 0;
    for (let li = 0; li < lines.length; li++) {
      const lineText = lines[li];
      for (const ch of lineText) {
        if (ch === "{") {
          if (braceDepth === 0) currentBlockSelector = lineText.split("{")[0];
          braceDepth++;
        } else if (ch === "}") {
          braceDepth--;
          if (braceDepth === 0) currentBlockSelector = "";
        }
      }

      let m;
      COLOR_REGEX.lastIndex = 0;
      while ((m = COLOR_REGEX.exec(lineText)) !== null) {
        total++;
        const propMatch = /(?:color|background-color|caret-color|column-rule-color|text-decoration-color|fill|stroke)/.exec(
          lineText.slice(Math.max(0, m.index - 40), m.index)
        );
        const prop = propMatch ? propMatch[0] : "color";
        const r = +m[1], g = +m[2], b = +m[3], a = parseFloat(m[4]);

        if (a >= HARD_BACKSTOP) continue; // 只关心 < 0.5

        // 跳过 disabled 块
        if (/(?::disabled|\.is-disabled|aria-disabled)/.test(currentBlockSelector)) continue;

        violations.push({ file: rel, line: li + 1, r, g, b, a, prop });
      }
    }
  }

  return { violations, total };
}

describe("a11y color contrast CI backstop", () => {
  describe("源 CSS 文件 (src/law-universe-lab/css/*.css)", () => {
    const files = listFiles(CSS_SRC_DIR, ".css");
    const { violations, total } = scanCssFiles(files);

    it(`扫描到 ${total} 处 color rgba() — 0 处低于 ${HARD_BACKSTOP} (WCAG 1.4.3 disabled 例外不计)`, () => {
      if (violations.length > 0) {
        const summary = violations
          .map((v) => `  - ${v.file}:${v.line}  color: rgba(${v.r}, ${v.g}, ${v.b}, ${v.a})  [${v.prop}]`)
          .join("\n");
        assert.fail(
          `发现 ${violations.length} 处 alpha < ${HARD_BACKSTOP} 的 text color (源 CSS):\n${summary}\n\n` +
          `修复: 把 alpha 提升到 ≥ 0.78 (正文) / ≥ 0.65 (大字体) / 引用 var(--universe-text-hint) 等。\n` +
          `例外: disabled 状态 (:disabled / .is-disabled / [aria-disabled]) 已自动跳过。`
        );
      }
    });

    it(`扫描了 ${files.length} 个 CSS 文件`, () => {
      assert.ok(files.length >= 8, `应当 ≥ 8 个 CSS 文件,实际 ${files.length}`);
    });
  });

  describe("build 产物 (dist/assets/*.css) — 集成 CI gate", () => {
    it("dist 目录存在(若不存在则先跑 npm run build)", { skip: !existsSync(DIST_ASSETS) ? "no dist" : false }, () => {
      assert.ok(existsSync(DIST_ASSETS), "dist/assets 不存在,请先跑 `npm run build`");
    });

    it("build 产物中 0 处 alpha < 0.5 的 color rgba (反 minify 后扫描)", { skip: !existsSync(DIST_ASSETS) ? "no dist" : false }, () => {
      const distCssFiles = listFiles(DIST_ASSETS, ".css");
      assert.ok(distCssFiles.length > 0, "dist/assets/*.css 不存在,build 可能未跑或产物路径变了");
      const { violations, total } = scanCssFiles(distCssFiles);
      if (violations.length > 0) {
        const summary = violations
          .map((v) => `  - ${v.file}:${v.line}  color: rgba(${v.r}, ${v.g}, ${v.b}, ${v.a})`)
          .join("\n");
        assert.fail(
          `build 产物发现 ${violations.length} 处 alpha < ${HARD_BACKSTOP} (共 ${total} 处):\n${summary}\n\n` +
          `这是 CI 硬 backstop: 任何 alpha < 0.5 的文字色都不能进入产品。\n` +
          `请在源 CSS 中修复,再 'npm run build' 重跑此测试。`
        );
      }
    });
  });

  describe("CSS 变量定义 (base.css 必备 token)", () => {
    const baseFile = resolve(CSS_SRC_DIR, "law-universe-lab-base.css");
    it("base.css 包含 :root token 块", () => {
      assert.ok(existsSync(baseFile), `缺失: ${baseFile}`);
      const text = readFileSync(baseFile, "utf8");
      assert.match(text, /:root\s*\{/, "应当有 :root 块");
    });

    it("base.css 包含 --universe-text-hint (Track I 新增 a11y 变量)", () => {
      const text = readFileSync(baseFile, "utf8");
      assert.match(text, /--universe-text-hint\s*:/, "缺失 --universe-text-hint 变量");
      // 验证值是 0.78 正文安全阈值
      const m = /--universe-text-hint\s*:\s*rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/.exec(text);
      assert.ok(m, "--universe-text-hint 应当是 rgba 形式");
      const alpha = parseFloat(m[1]);
      assert.ok(alpha >= 0.78, `--universe-text-hint 应当 ≥ 0.78 (WCAG AA),实际 ${alpha}`);
    });

    it("base.css --universe-label-muted ≥ 0.78 (Track I 从 0.6 提升)", () => {
      const text = readFileSync(baseFile, "utf8");
      const m = /--universe-label-muted\s*:\s*rgba\([^,]+,\s*[^,]+,\s*[^,]+,\s*([\d.]+)\)/.exec(text);
      assert.ok(m, "应当有 --universe-label-muted rgba 值");
      const alpha = parseFloat(m[1]);
      assert.ok(alpha >= 0.78, `--universe-label-muted 应当 ≥ 0.78 (Track I 提升),实际 ${alpha}`);
    });
  });
});

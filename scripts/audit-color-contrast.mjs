#!/usr/bin/env node
/**
 * scripts/audit-color-contrast.mjs
 *
 * 法脉星图 · A11y 颜色对比度审计 (Track I)
 *
 * 扫描 src/law-universe-lab/css/*.css 与 src/law-universe-lab/*.tsx 中的
 * 文本色 `color: rgba(...)` 表达式,基于 WCAG 2.1 相对亮度公式估算与
 * 暗色背景 (rgb(5, 7, 10)) 的对比度,输出 markdown 表格。
 *
 * 阈值(WCAG AA):
 *   - 正文(≤ 18pt regular 或 ≤ 14pt bold): ≥ 4.5:1
 *   - 大字体(≥ 18pt 或 ≥ 14pt bold):     ≥ 3:1
 *
 * 保守估算(我们没解析 CSS 上下文,默认按"正文"处理):
 *   - alpha < 0.50              → FAIL (低于 3:1,必 fail)
 *   - 0.50 ≤ alpha < 0.65       → WARN (大概率低于 4.5:1,接近 fail)
 *   - 0.65 ≤ alpha < 0.78       → BORDERLINE (大字体或粗体可能 OK,正文需提升)
 *   - alpha ≥ 0.78              → PASS (按正文 4.5:1 安全)
 *
 * 退出码:始终 0(informational only,可在 CI 输出但不 fail build)
 *   改用 scripts/__tests__/a11y-contrast.test.mjs 做硬 backstop
 *
 * 用法:
 *   node scripts/audit-color-contrast.mjs
 *   npm run audit:contrast
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const REPO = ROOT;

const CSS_DIR = join(REPO, "src", "law-universe-lab", "css");
const TSX_DIR = join(REPO, "src", "law-universe-lab");

// 暗色背景(主面板底色 var(--universe-bg-deep))
const BG_R = 5;
const BG_G = 7;
const BG_B = 10;

// --- WCAG 相对亮度公式 -------------------------------------------------

function srgbToLinear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

function contrastRatio(rgbA, rgbB) {
  const l1 = relativeLuminance(rgbA[0], rgbA[1], rgbA[2]);
  const l2 = relativeLuminance(rgbB[0], rgbB[1], rgbB[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// alpha 合成到背景上,得到最终可见色
function composeOnBg(r, g, b, a, bg = [BG_R, BG_G, BG_B]) {
  return [
    Math.round(bg[0] * (1 - a) + r * a),
    Math.round(bg[1] * (1 - a) + g * a),
    Math.round(bg[2] * (1 - a) + b * a)
  ];
}

// --- 文件扫描 ----------------------------------------------------------

function listFiles(dir, ext) {
  /** @type {string[]} */
  const out = [];
  /** @type {{path: string, isDir: boolean}[]} */
  let stack;
  try {
    stack = readdirSync(dir).map((name) => ({ path: join(dir, name), isDir: statSync(join(dir, name)).isDirectory() }));
  } catch {
    return out;
  }
  while (stack.length) {
    const { path, isDir } = stack.pop();
    if (isDir) {
      for (const name of readdirSync(path)) {
        const p = join(path, name);
        stack.push({ path: p, isDir: statSync(p).isDirectory() });
      }
    } else if (path.endsWith(ext)) {
      out.push(path);
    }
  }
  return out;
}

// 匹配: color: rgba(R, G, B, A)
// 也匹配  background-color: rgba(...)  / caret-color / text-decoration-color
// 不匹配 border-* / outline / fill / stroke(那些是装饰色,不影响文字对比度)
const COLOR_REGEX = /(?:^|[\s;{(])(?:color|background-color|caret-color|column-rule-color|text-decoration-color|fill|stroke)\s*:\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;

// 匹配 inline style 中的 color 字段(TSX)
const INLINE_COLOR_REGEX = /(?:color|backgroundColor|borderColor|outlineColor|caretColor)\s*:\s*["']rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)["']/g;

const cssFiles = listFiles(CSS_DIR, ".css");
const tsxFiles = listFiles(TSX_DIR, ".tsx");

/** @type {{ file: string, line: number, prop: string, r: number, g: number, b: number, a: number, ratio: number, status: 'FAIL'|'WARN'|'BORDERLINE'|'PASS', context: string }[]} */
const findings = [];

for (const file of cssFiles) {
  const rel = relative(REPO, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  // 跟踪当前 selector block(在 { } 之间),以识别 :disabled / .is-disabled
  let currentBlockSelector = "";
  let braceDepth = 0;
  for (let li = 0; li < lines.length; li++) {
    const lineText = lines[li];
    // 简化:更新 brace depth
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
      const propMatch = /(?:color|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|caret-color|column-rule-color|text-decoration-color|fill|stroke|background-color)/.exec(lineText.slice(Math.max(0, m.index - 40), m.index));
      const prop = propMatch ? propMatch[0] : "color";
      const r = +m[1], g = +m[2], b = +m[3], a = parseFloat(m[4]);
      // 装饰属性(fill/stroke/box-shadow)不参与审计
      if (prop === "fill" || prop === "stroke" || prop === "outline" || prop === "border" || prop === "background-color") {
        if (!prop.includes("color") && prop !== "caret-color" && prop !== "text-decoration-color") continue;
      }
      // 跳过 disabled 状态(WCAG 1.4.3 不要求 disabled 文字达到对比度)
      // 检测整块 selector 中是否含 :disabled / .is-disabled / aria-disabled
      if (/(?::disabled|\.is-disabled|aria-disabled)/.test(currentBlockSelector)) continue;
      const composed = composeOnBg(r, g, b, a);
      const ratio = contrastRatio(composed, [BG_R, BG_G, BG_B]);
      let status;
      if (a < 0.5) status = "FAIL";
      else if (a < 0.65) status = "WARN";
      else if (a < 0.78) status = "BORDERLINE";
      else status = "PASS";
      findings.push({
        file: rel,
        line: li + 1,
        prop,
        r, g, b, a,
        ratio,
        status,
        context: lineText.trim().slice(0, 100)
      });
    }
  }
}

for (const file of tsxFiles) {
  const rel = relative(REPO, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const lineText = lines[li];
    let m;
    INLINE_COLOR_REGEX.lastIndex = 0;
    while ((m = INLINE_COLOR_REGEX.exec(lineText)) !== null) {
      const propMatch = /color/i.exec(m[0]);
      const prop = propMatch ? "color(inline)" : "color(inline)";
      const r = +m[1], g = +m[2], b = +m[3], a = parseFloat(m[4]);
      const composed = composeOnBg(r, g, b, a);
      const ratio = contrastRatio(composed, [BG_R, BG_G, BG_B]);
      let status;
      if (a < 0.5) status = "FAIL";
      else if (a < 0.65) status = "WARN";
      else if (a < 0.78) status = "BORDERLINE";
      else status = "PASS";
      findings.push({
        file: rel,
        line: li + 1,
        prop,
        r, g, b, a,
        ratio,
        status,
        context: lineText.trim().slice(0, 100)
      });
    }
  }
}

// --- 统计 + 输出 --------------------------------------------------------

const fail = findings.filter((f) => f.status === "FAIL");
const warn = findings.filter((f) => f.status === "WARN");
const borderline = findings.filter((f) => f.status === "BORDERLINE");
const pass = findings.filter((f) => f.status === "PASS");

function fmt(n) {
  return n.toFixed(2);
}

const out = [];
out.push("# 法脉星图 · A11y 颜色对比度审计\n");
out.push(`> 扫描时间: ${new Date().toISOString()}`);
out.push(`> 背景基色: rgb(${BG_R}, ${BG_G}, ${BG_B})  (var(--universe-bg-deep))`);
out.push(`> 阈值 (WCAG 2.1 AA):`);
out.push(`>   - 正文 (≤ 18pt regular 或 ≤ 14pt bold): ratio ≥ 4.5:1`);
out.push(`>   - 大字体 (≥ 18pt 或 ≥ 14pt bold):     ratio ≥ 3:1`);
out.push(`> 本审计默认按"正文"判定,故阈值 alpha ≥ 0.78 即视为 PASS(见 docs/A11Y-AUDIT.md)`);
out.push("");
out.push("## 摘要\n");
out.push(`| 状态 | 计数 | 含义 |`);
out.push(`|------|------|------|`);
out.push(`| **FAIL** | ${fail.length} | alpha < 0.5,对比度 < 3:1,WCAG AA 必 fail |`);
out.push(`| **WARN** | ${warn.length} | 0.5 ≤ alpha < 0.65,接近 fail,需提升 |`);
out.push(`| **BORDERLINE** | ${borderline.length} | 0.65 ≤ alpha < 0.78,大字体 OK,正文需提升 |`);
out.push(`| **PASS** | ${pass.length} | alpha ≥ 0.78,WCAG AA 4.5:1 通过 |`);
out.push(`| **合计** | ${findings.length} | — |`);
out.push("");

if (fail.length || warn.length) {
  out.push("## 需修的项 (FAIL + WARN)\n");
  out.push("| 文件 | 行 | 属性 | rgb | alpha | 估算对比度 | 状态 |");
  out.push("|------|---|------|-----|-------|------------|------|");
  for (const f of [...fail, ...warn].sort((a, b) => a.a - b.a)) {
    out.push(`| ${f.file} | ${f.line} | ${f.prop} | rgb(${f.r}, ${f.g}, ${f.b}) | ${f.a} | ${fmt(f.ratio)}:1 | ${f.status} |`);
  }
  out.push("");
}

if (borderline.length) {
  out.push("## 边界项 (BORDERLINE,大字体 OK / 正文需提升)\n");
  out.push("| 文件 | 行 | 属性 | rgb | alpha | 估算对比度 |");
  out.push("|------|---|------|-----|-------|------------|");
  for (const f of borderline) {
    out.push(`| ${f.file} | ${f.line} | ${f.prop} | rgb(${f.r}, ${f.g}, ${f.b}) | ${f.a} | ${fmt(f.ratio)}:1 |`);
  }
  out.push("");
}

out.push("## 完整清单\n");
out.push("<details>");
out.push(`<summary>展开全部 ${findings.length} 条</summary>\n`);
out.push("| 文件 | 行 | 属性 | rgb | alpha | ratio | 状态 |");
out.push("|------|---|------|-----|-------|-------|------|");
for (const f of findings.sort((a, b) => a.a - b.a)) {
  out.push(`| ${f.file} | ${f.line} | ${f.prop} | rgb(${f.r}, ${f.g}, ${f.b}) | ${f.a} | ${fmt(f.ratio)}:1 | ${f.status} |`);
}
out.push("\n</details>\n");

out.push("---");
out.push("");
out.push("**注**: 本审计为 informational only,退出码始终 0。");
out.push("CI 硬 backstop 见 `scripts/__tests__/a11y-contrast.test.mjs` (alpha < 0.5 backstop)。");
out.push("");

process.stdout.write(out.join("\n"));

// 始终 exit 0(informational only)
process.exit(0);

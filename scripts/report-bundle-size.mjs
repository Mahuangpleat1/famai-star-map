#!/usr/bin/env node
// 法脉星图 · 产物体积分析报告
// 用法:
//   node scripts/report-bundle-size.mjs           # 默认分析 ./dist
//   node scripts/report-bundle-size.mjs <dir>     # 分析指定目录
//   node scripts/report-bundle-size.mjs --no-fail # 只打印,不以非零退出
//
// 行为:
//   1. 递归读取 dist/,统计每个文件原始字节 + gzip 字节(level 6)
//   2. 解析 dist/index.html 的 modulepreload / link rel=modulepreload 推断 first-load
//   3. 按 docs/PERFORMANCE.md §1.2 预算表逐项打勾 / 告警 / 失败
//   4. 可选:与 bundle-baseline.json 比对,输出 Δ 列
//   5. 任何 chunk 超预算 -> process.exitCode = 1(默认开启,CI 会 fail)

import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import process from "node:process";

/* -------------------------------------------------------------------------- */
/* 预算表 — 与 docs/PERFORMANCE.md §1.2 保持同步                                 */
/* -------------------------------------------------------------------------- */

// isFirstLoad=true 表示该项计入「首次下载总计」;
// isFirstLoad=false 表示按需加载或独立资源,仅做单项预算校验。
// 预算单位为 gzip 字节。thresholdRatio: 0.8=用到 80% 时显示 ⚠。
const BUDGET_RULES = [
  {
    label: "index.html",
    pattern: /^index\.html$/,
    budgetBytes: 8 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/index-*.js",
    pattern: /^assets\/index-[^/]+\.js$/,
    budgetBytes: 80 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/three-*.js",
    pattern: /^assets\/three-[^/]+\.js$/,
    budgetBytes: 200 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/pdfjs-*.js",
    pattern: /^assets\/pdfjs-[^/]+\.js$/,
    budgetBytes: 300 * 1024,
    isFirstLoad: false,
    warnOnly: false
  },
  {
    label: "assets/icons-*.js",
    pattern: /^assets\/icons-[^/]+\.js$/,
    budgetBytes: 30 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/d3-*.js",
    pattern: /^assets\/d3-[^/]+\.js$/,
    budgetBytes: 15 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/react-*.js",
    pattern: /^assets\/react-[^/]+\.js$/,
    budgetBytes: 50 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "assets/vendor-*.js",
    pattern: /^assets\/vendor-[^/]+\.js$/,
    budgetBytes: 50 * 1024,
    isFirstLoad: true,
    warnOnly: false
  },
  {
    label: "favicon.svg",
    pattern: /^favicon\.svg$/,
    budgetBytes: 2 * 1024,
    isFirstLoad: false,
    warnOnly: false
  },
  {
    label: "og-image.svg",
    pattern: /^og-image\.svg$/,
    budgetBytes: 5 * 1024,
    isFirstLoad: false,
    warnOnly: false
  },
  {
    label: "manifest.webmanifest",
    pattern: /^manifest\.webmanifest$/,
    budgetBytes: 2 * 1024,
    isFirstLoad: false,
    warnOnly: false
  },
  {
    label: "assets/index-*.css",
    pattern: /^assets\/index-[^/]+\.css$/,
    budgetBytes: 20 * 1024,
    isFirstLoad: true,
    warnOnly: true
  }
];

/* -------------------------------------------------------------------------- */
/* 面板 chunk 模式表                                                             */
/* -------------------------------------------------------------------------- */
// 按需 lazy 加载的面板。文件名 glob 模式(去掉 hash 前缀) → 人可读标签。
// 出现在 dist/assets/ 下的 chunk 会在 Per-Panel 表格里列出。
// 单个 panel 的预算(单项 gzip,KB)由 panelBudgets 表给出。

const PANEL_PATTERNS = [
  { glob: /^assets\/LawUniverseWorkbenchPanel-/, label: "WorkbenchPanel" },
  { glob: /^assets\/LawUniverseQuizSession-/, label: "QuizSession" },
  { glob: /^assets\/LawUniverseQuiz-/, label: "Quiz" },
  { glob: /^assets\/LawUniverseFavoritesPanel-/, label: "FavoritesPanel" },
  { glob: /^assets\/LawUniverseLearningPathPanel-/, label: "LearningPathPanel" },
  { glob: /^assets\/LawUniverseDetailPanel-/, label: "DetailPanel" },
  { glob: /^assets\/LawUniversePathPanel-/, label: "PathPanel" },
  { glob: /^assets\/LawUniverseSatelliteDetailPanel-/, label: "SatelliteDetailPanel" },
  { glob: /^assets\/LawUniverseRelationLegend-/, label: "RelationLegend" },
  { glob: /^assets\/LawUniverseCommandPalette-/, label: "CommandPalette" },
  { glob: /^assets\/KeyboardCheatsheet-/, label: "KeyboardCheatsheet" }
];

/** 单 panel gzip 预算(KB),超过会标 ⚠,超 1.2x 标 ✗。 */
const PANEL_BUDGETS = {
  WorkbenchPanel: 60,
  QuizSession: 30,
  Quiz: 25,
  FavoritesPanel: 20,
  LearningPathPanel: 25,
  DetailPanel: 30,
  PathPanel: 15,
  SatelliteDetailPanel: 30,
  RelationLegend: 10,
  CommandPalette: 25,
  KeyboardCheatsheet: 15
};

// 「首次下载」总预算(gzip 字节) — docs/PERFORMANCE.md §1.2
const FIRST_LOAD_TOTAL_BUDGET = 500 * 1024;
// 超过预算的 chunk Δ 增长 > 20% 时,触发额外告警
const REGRESSION_THRESHOLD = 0.2;

/* -------------------------------------------------------------------------- */
/* ANSI 颜色                                                                    */
/* -------------------------------------------------------------------------- */

const color = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
};

const ICON = {
  ok: color.green("✓"),
  warn: color.yellow("⚠"),
  fail: color.red("✗"),
  skip: color.dim("·")
};

/* -------------------------------------------------------------------------- */
/* 工具函数(导出供测试)                                                          */
/* -------------------------------------------------------------------------- */

/**
 * gzip 后字节数(level 6 与 HTTP 服务器默认一致)。
 * @param {Buffer|string} input
 * @returns {number}
 */
export function gzipSizeOf(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf-8");
  return gzipSync(buf, { level: 6 }).length;
}

/**
 * 递归列目录,过滤 .map 文件。
 * @param {string} rootDir 绝对路径
 * @returns {Promise<{relativePath: string, absolutePath: string, size: number, gzip: number}[]>}
 */
export async function walkDist(rootDir) {
  /** @type {{relativePath: string, absolutePath: string, size: number, gzip: number}[]} */
  const out = [];
  const root = path.resolve(rootDir);

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name.endsWith(".map")) continue;

      const stat = await fs.stat(abs);
      const buffer = await fs.readFile(abs);
      out.push({
        relativePath: path.relative(root, abs).split(path.sep).join("/"),
        absolutePath: abs,
        size: stat.size,
        gzip: gzipSizeOf(buffer)
      });
    }
  }

  await visit(root);
  return out;
}

/**
 * 从 dist/index.html 解析 first-load 资源集合(modulepreload + module script + preload)。
 * 找不到 index.html 时返回 null,调用方决定如何兜底。
 * @param {string} html
 * @returns {Set<string> | null}
 */
export function parseFirstLoadFromHtml(html) {
  if (typeof html !== "string" || html.length === 0) return null;
  const set = new Set();
  // Vite's module entry identifies the deployment prefix; dist files themselves
  // remain under assets/ even when their URLs start with /repo-name/assets/.
  const moduleEntries = [...html.matchAll(/<script[^>]*type=["']module["'][^>]*\bsrc=["']([^"']+)["']/gi)];
  const entry = moduleEntries[0]?.[1].split(/[?#]/)[0] ?? "";
  const assetsAt = entry.lastIndexOf("/assets/");
  const base = assetsAt >= 0 ? entry.slice(0, assetsAt + 1) : "";
  // 收集 <script type="module" src="...">,主入口
  for (const m of html.matchAll(/<script[^>]*type=["']module["'][^>]*\bsrc=["']([^"']+)["']/gi)) {
    set.add(normalizeAssetRef(m[1], base));
  }
  // 收集 <link rel="modulepreload" href="...">
  for (const m of html.matchAll(/<link[^>]*\brel=["']modulepreload["'][^>]*\bhref=["']([^"']+)["']/gi)) {
    set.add(normalizeAssetRef(m[1], base));
  }
  // 收集 <link rel="preload" as="script" ...>
  for (const m of html.matchAll(/<link[^>]*\brel=["']preload["'][^>]*\bhref=["']([^"']+)["']/gi)) {
    set.add(normalizeAssetRef(m[1], base));
  }
  // 收集 <link rel="stylesheet" href="..."> — 渲染阻塞,也算 first load
  for (const m of html.matchAll(/<link[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["']/gi)) {
    set.add(normalizeAssetRef(m[1], base));
  }
  if (set.size === 0) return null;
  set.add("index.html");
  return set;
}

/** 把 "/assets/index-XYZ.js" 或 "assets/index-XYZ.js" 统一为 "assets/index-XYZ.js" */
function normalizeAssetRef(ref, base = "") {
  let s = String(ref).trim();
  if (base && s.startsWith(base)) s = s.slice(base.length);
  if (s.startsWith("./")) s = s.slice(2);
  if (s.startsWith("/")) s = s.slice(1);
  return s.split(/[?#]/)[0];
}

/**
 * 给定相对路径,返回命中的预算规则,或 null。
 * @param {string} relativePath
 * @returns {import('./report-bundle-size.mjs').BudgetRule | null}
 */
export function matchBudget(relativePath) {
  const norm = String(relativePath).split(path.sep).join("/");
  for (const rule of BUDGET_RULES) {
    if (rule.pattern.test(norm)) return rule;
  }
  return null;
}

/**
 * 计算与基线的差值百分比。
 * @param {number} current
 * @param {number} baseline
 * @returns {number} 0.21 = +21%
 */
export function diffPercent(current, baseline) {
  if (!Number.isFinite(baseline) || baseline <= 0) return 0;
  return (current - baseline) / baseline;
}

/**
 * 字节数格式化为人类可读字符串。KiB 优先,小于 1KB 显示 B。
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 100) return `${kb.toFixed(2)} KB`;
  return `${kb.toFixed(1)} KB`;
}

/**
 * 把百分比格式化为带符号的字符串。0.0% / +12.3% / -4.5%
 * @param {number} p
 * @returns {string}
 */
export function formatPercent(p) {
  if (!Number.isFinite(p)) return "0.0%";
  const sign = p > 0 ? "+" : "";
  return `${sign}${(p * 100).toFixed(1)}%`;
}

/* -------------------------------------------------------------------------- */
/* 报告组装                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} FileEntry
 * @property {string} relativePath
 * @property {number} size
 * @property {number} gzip
 * @property {boolean} [isFirstLoad]
 * @property {ReturnType<typeof matchBudget>} [rule]
 * @property {number} [deltaPct]  // 与 baseline 对比
 * @property {'ok'|'warn'|'fail'|'skip'} [status]
 */

/**
 * 状态机:
 *   - rule 命中且 gzip <= 80% budget         -> ok
 *   - rule 命中且 80% < gzip <= 100% budget  -> warn(在预算内但接近)
 *   - rule 命中且 gzip >  budget              -> fail(rule.warnOnly 决定是否进 exitCode)
 *   - rule 未命中且在 first-load 集合        -> 标记 informational(不在预算表内)
 *   - 其余                                    -> skip
 *
 * @param {FileEntry[]} entries
 * @param {Set<string> | null} firstLoadSet
 * @returns {FileEntry[]}
 */
export function classifyEntries(entries, firstLoadSet) {
  for (const e of entries) {
    const rule = matchBudget(e.relativePath);
    e.rule = rule;
    e.isFirstLoad = firstLoadSet ? firstLoadSet.has(e.relativePath) : false;
    if (!rule) {
      e.status = "skip";
      continue;
    }
    const ratio = e.gzip / rule.budgetBytes;
    if (e.gzip > rule.budgetBytes) {
      e.status = "fail";
    } else if (ratio > 0.8) {
      e.status = "warn";
    } else {
      e.status = "ok";
    }
  }
  return entries;
}

/**
 * 加载并比对基线文件。
 * @param {string | undefined} baselinePath
 * @param {FileEntry[]} entries
 * @returns {Promise<{baseline: object | null, regressions: string[]}>}
 */
export async function applyBaseline(baselinePath, entries) {
  if (!baselinePath) return { baseline: null, regressions: [] };
  let raw;
  try {
    raw = await fs.readFile(baselinePath, "utf-8");
  } catch {
    return { baseline: null, regressions: [] };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { baseline: null, regressions: [] };
  }
  const baselineFiles = (parsed && parsed.files) || {};
  const regressions = [];
  for (const e of entries) {
    const prev = baselineFiles[e.relativePath];
    if (typeof prev === "number" && prev > 0) {
      e.deltaPct = diffPercent(e.gzip, prev);
      // fail 状态且 Δ > 20% 才算 regression
      if (e.status === "fail" && e.deltaPct > REGRESSION_THRESHOLD) {
        regressions.push(
          `${e.relativePath} 超过预算 ${formatPercent(e.deltaPct)} (基线 ${formatBytes(prev)} → 当前 ${formatBytes(e.gzip)})`
        );
      }
    }
  }
  return { baseline: parsed, regressions };
}

/* -------------------------------------------------------------------------- */
/* 渲染                                                                         */
/* -------------------------------------------------------------------------- */

const COL_LABEL = 28;
const COL_RAW = 10;
const COL_GZIP = 10;
const COL_BUDGET = 14;
const COL_DELTA = 10;
// 5 列内容 + 4 个 cell 间隔(各 2 字符 "  ") + 2 个边框 + 2 个 cell 内边距("│ " 和 " │")
const TABLE_WIDTH =
  COL_LABEL + COL_RAW + COL_GZIP + COL_BUDGET + COL_DELTA + 4 * 2 + 2 + 2;

/** 计算不含 ANSI 转义码的可见长度。 */
function visibleLength(s) {
  // 匹配 ESC[...m 形式(ANSI color code)
  // eslint-disable-next-line no-control-regex -- ANSI escape sequence, intentionally matched
  return String(s).replace(/\x1b\[[0-9;]*m/g, "").length;
}

/** 按可见长度右/左填充(保留 ANSI 颜色码)。label 过长则截断。 */
function pad(label, width) {
  const s = String(label);
  const len = visibleLength(s);
  if (len > width) {
    return s.slice(0, width - 1) + "…";
  }
  if (len === width) return s;
  return s + " ".repeat(width - len);
}

function line(ch) {
  return ch.repeat(TABLE_WIDTH);
}

/**
 * @param {FileEntry[]} entries
 * @param {{baseline: object | null, regressions: string[]}} baselineInfo
 * @returns {{ lines: string[], hasFail: boolean }}
 */
export function renderReport(entries, baselineInfo) {
  const out = [];
  out.push(color.bold(color.cyan("Bundle Size Report")));
  if (baselineInfo.baseline) {
    out.push(
      color.dim(
        `对比基线 ${baselineInfo.baseline.label || "bundle-baseline.json"} (${baselineInfo.baseline.generatedAt || "未知时间"})`
      )
    );
  }
  out.push("");

  // 表头
  const header = [
    pad("File", COL_LABEL),
    pad("Raw", COL_RAW),
    pad("Gzip", COL_GZIP),
    pad("Budget", COL_BUDGET),
    pad("Δ", COL_DELTA)
  ].join("  ");
  out.push(color.bold("┌" + line("─").slice(0, TABLE_WIDTH - 2) + "┐"));
  out.push(color.bold("│" + pad(` ${header}`, TABLE_WIDTH - 2) + "│"));
  out.push(color.bold("├" + line("─").slice(0, TABLE_WIDTH - 2) + "┤"));

  let hasFail = false;
  // 把命中的预算项排在前面,skip 的放后面
  const ordered = [...entries].sort((a, b) => {
    const aScore = scoreOrder(a);
    const bScore = scoreOrder(b);
    if (aScore !== bScore) return aScore - bScore;
    return a.relativePath.localeCompare(b.relativePath);
  });

  for (const e of ordered) {
    const rule = e.rule;
    const budgetLabel = rule
      ? `${formatBytes(rule.budgetBytes)} ${iconForStatus(e.status)}`
      : color.dim("(n/a)");
    const deltaLabel =
      typeof e.deltaPct === "number"
        ? formatDelta(e.deltaPct, e.status === "fail")
        : color.dim("-");
    const row = [
      pad(displayLabel(e, rule), COL_LABEL),
      pad(formatBytes(e.size), COL_RAW),
      pad(formatBytes(e.gzip), COL_GZIP),
      pad(budgetLabel, COL_BUDGET),
      pad(deltaLabel, COL_DELTA)
    ].join("  ");
    if (e.status === "fail") hasFail = true;
    out.push("│ " + row + " │");
  }

  // 首次下载汇总
  const firstLoadEntries = entries.filter((e) => e.isFirstLoad);
  const firstLoadBytes = firstLoadEntries.reduce((sum, e) => sum + e.gzip, 0);
  const totalEntries = entries.filter((e) => !e.relativePath.endsWith(".html"));
  const totalBytes = totalEntries.reduce((sum, e) => sum + e.gzip, 0);
  const totalStatus =
    firstLoadBytes > FIRST_LOAD_TOTAL_BUDGET ? "fail" : firstLoadBytes > FIRST_LOAD_TOTAL_BUDGET * 0.8 ? "warn" : "ok";
  if (totalStatus === "fail") hasFail = true;

  out.push(color.bold("├" + line("─").slice(0, TABLE_WIDTH - 2) + "┤"));
  out.push(
    "│ " +
      [
        color.bold(pad("TOTAL (first load gzip)", COL_LABEL)),
        color.dim(pad("-", COL_RAW)),
        color.blue(pad(formatBytes(firstLoadBytes), COL_GZIP)),
        color.bold(
          pad(`${formatBytes(FIRST_LOAD_TOTAL_BUDGET)} ${iconForStatus(totalStatus)}`, COL_BUDGET)
        ),
        color.dim(pad("-", COL_DELTA))
      ].join("  ") +
      " │"
  );
  out.push(
    "│ " +
      [
        color.dim(pad(`TOTAL (all gzip, ${totalEntries.length} files)`, COL_LABEL)),
        color.dim(pad("-", COL_RAW)),
        color.dim(pad(formatBytes(totalBytes), COL_GZIP)),
        color.dim(pad("-", COL_BUDGET)),
        color.dim(pad("-", COL_DELTA))
      ].join("  ") +
      " │"
  );
  out.push(color.bold("└" + line("─").slice(0, TABLE_WIDTH - 2) + "┘"));

  // 提示
  out.push("");
  if (firstLoadEntries.length === 0) {
    out.push(
      color.dim("ℹ 未识别出 first-load 集合(index.html 解析失败或缺失)。已按预算表逐项校验。")
    );
  } else {
    out.push(
      color.dim(
        `ℹ first-load 包含 ${firstLoadEntries.length} 个资源(index.html + modulepreload + 关键 CSS)`
      )
    );
  }

  if (baselineInfo.regressions.length > 0) {
    out.push("");
    out.push(color.yellow(color.bold(`⚠ 性能回归警告(超过预算且 Δ > ${formatPercent(REGRESSION_THRESHOLD)}):`)));
    for (const msg of baselineInfo.regressions) {
      out.push("  " + color.yellow("· " + msg));
    }
  }

  // Per-Panel 报告(单独的子表)
  const panelInfo = buildPanelReport(entries);
  const panelLines = renderPanelReport(panelInfo.rows, { totalGzip: panelInfo.totalGzip, totalRaw: panelInfo.totalRaw });
  for (const ln of panelLines) out.push(ln);
  if (panelInfo.hasFail) hasFail = true;

  return { lines: out, hasFail };
}

function scoreOrder(e) {
  if (!e.rule) return 9;
  if (e.status === "fail") return 0;
  if (e.status === "warn") return 1;
  if (e.status === "ok") return 2;
  return 5;
}

function displayLabel(e, rule) {
  // 命中规则的行:用规则 label(更短,易对比)
  // 命中规则 + 在 first-load 集合:加 * 后缀
  if (rule) {
    const mark = e.isFirstLoad ? color.dim(" *") : "";
    return rule.label + mark;
  }
  // 未命中规则:把长路径裁短到 COL_LABEL(保留末尾文件名以便定位)
  return shortenPath(e.relativePath, COL_LABEL);
}

/** 把 "assets/very-long-name-XYZ.js" 裁到目标宽度,超出则前段用 … 代替。 */
function shortenPath(p, max) {
  if (p.length <= max) return p;
  // 保留文件名后 60% 长度
  const headKeep = Math.max(0, max - Math.floor(max * 0.6) - 1);
  const tailKeep = max - headKeep - 1;
  return p.slice(0, headKeep) + "…" + p.slice(p.length - tailKeep);
}

function iconForStatus(status) {
  if (status === "ok") return ICON.ok;
  if (status === "warn") return ICON.warn;
  if (status === "fail") return ICON.fail;
  return ICON.skip;
}

function formatDelta(pct, isFail) {
  if (Math.abs(pct) < 0.005) return color.dim("0.0%");
  const txt = formatPercent(pct);
  if (isFail) return color.red(txt);
  if (pct > 0) return color.yellow(txt);
  return color.green(txt);
}

/* -------------------------------------------------------------------------- */
/* Per-Panel 报告                                                              */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} PanelRow
 * @property {string} label
 * @property {string} pattern
 * @property {number} raw
 * @property {number} gzip
 * @property {FileEntry[]} files
 * @property {number} budgetKb
 * @property {'ok'|'warn'|'fail'|'missing'} status
 */

/**
 * 把 PANEL_PATTERNS 跟 dist entries 匹配,产出 per-panel 报告行。
 * - 命中 0 个文件 → status=missing(标注该 panel 没拆 chunk,可能与主入口合并)
 * - 命中 1 个文件 → 正常,按预算(默认 30KB gzip)标 ok/warn/fail
 * - 命中 N 个文件 → 拆得过碎,仍然聚合
 *
 * @param {FileEntry[]} entries
 * @returns {{ rows: PanelRow[], hasFail: boolean, totalGzip: number, totalRaw: number }}
 */
export function buildPanelReport(entries) {
  const rows = [];
  let hasFail = false;
  let totalGzip = 0;
  let totalRaw = 0;
  for (const p of PANEL_PATTERNS) {
    const matched = entries.filter((e) => p.glob.test(e.relativePath));
    const raw = matched.reduce((s, e) => s + e.size, 0);
    const gzip = matched.reduce((s, e) => s + e.gzip, 0);
    const budgetKb = PANEL_BUDGETS[p.label] ?? 30;
    const budgetBytes = budgetKb * 1024;
    let status;
    if (matched.length === 0) {
      status = "missing";
    } else if (gzip > budgetBytes * 1.2) {
      status = "fail";
      hasFail = true;
    } else if (gzip > budgetBytes * 0.8) {
      status = "warn";
    } else {
      status = "ok";
    }
    rows.push({
      label: p.label,
      pattern: p.glob.source,
      raw,
      gzip,
      files: matched,
      budgetKb,
      status
    });
    totalGzip += gzip;
    totalRaw += raw;
  }
  return { rows, hasFail, totalGzip, totalRaw };
}

/**
 * 渲染 per-panel 报告(单独的子表格)。
 * @param {PanelRow[]} rows
 * @param {{totalGzip: number, totalRaw: number}} totals
 * @returns {string[]}
 */
export function renderPanelReport(rows, totals) {
  const out = [];
  out.push("");
  out.push(color.bold(color.cyan("Per-Panel Lazy Chunks (按需加载)")));
  out.push(color.dim("ℹ 主入口 LabPage 通过 React.lazy 拆分面板;此表只列已成功拆出独立 chunk 的面板。"));
  out.push("");

  const COL_PANEL = 28;
  const COL_RAW = 10;
  const COL_GZIP = 10;
  const COL_BUDGET = 14;
  const COL_FILES = 8;
  const PANEL_TABLE_WIDTH = COL_PANEL + COL_RAW + COL_GZIP + COL_BUDGET + COL_FILES + 4 * 2 + 2 + 2;

  const header = [
    pad("Panel", COL_PANEL),
    pad("Raw", COL_RAW),
    pad("Gzip", COL_GZIP),
    pad("Budget", COL_BUDGET),
    pad("Files", COL_FILES)
  ].join("  ");
  const tableLine = (ch) => ch.repeat(PANEL_TABLE_WIDTH);

  out.push(color.bold("┌" + tableLine("─").slice(0, PANEL_TABLE_WIDTH - 2) + "┐"));
  out.push(color.bold("│" + pad(` ${header}`, PANEL_TABLE_WIDTH - 2) + "│"));
  out.push(color.bold("├" + tableLine("─").slice(0, PANEL_TABLE_WIDTH - 2) + "┤"));

  // 先 fail / warn / ok,再 missing,组内按 gzip 倒序
  const panelScore = (s) => (s === "fail" ? 0 : s === "warn" ? 1 : s === "ok" ? 2 : 5);
  const ordered = [...rows].sort((a, b) => {
    const aScore = panelScore(a.status);
    const bScore = panelScore(b.status);
    if (aScore !== bScore) return aScore - bScore;
    return b.gzip - a.gzip;
  });

  for (const r of ordered) {
    const budgetLabel = `${r.budgetKb.toFixed(0)} KB ${iconForStatus(r.status === "missing" ? "skip" : r.status)}`;
    const filesLabel = r.files.length === 0 ? color.dim("0") : String(r.files.length);
    const row = [
      pad(displayPanelLabel(r), COL_PANEL),
      pad(r.files.length === 0 ? color.dim("-") : formatBytes(r.raw), COL_RAW),
      pad(r.files.length === 0 ? color.dim("-") : formatBytes(r.gzip), COL_GZIP),
      pad(budgetLabel, COL_BUDGET),
      pad(filesLabel, COL_FILES)
    ].join("  ");
    out.push("│ " + row + " │");
  }

  out.push(color.bold("├" + tableLine("─").slice(0, PANEL_TABLE_WIDTH - 2) + "┤"));
  const splitCount = rows.filter((r) => r.status !== "missing").length;
  const missingCount = rows.filter((r) => r.status === "missing").length;
  out.push(
    "│ " +
      [
        color.bold(pad(`TOTAL (${splitCount} panels split)`, COL_PANEL)),
        color.dim(pad("-", COL_RAW)),
        color.blue(pad(formatBytes(totals.totalGzip), COL_GZIP)),
        color.dim(pad("-", COL_BUDGET)),
        color.dim(pad("-", COL_FILES))
      ].join("  ") +
      " │"
  );
  if (missingCount > 0) {
    out.push(
      "│ " +
        [
          color.dim(
            pad(`(${missingCount} panels kept in main chunk — e.g. co-located hooks)`, COL_PANEL)
          ),
          color.dim(pad("-", COL_RAW)),
          color.dim(pad("-", COL_GZIP)),
          color.dim(pad("-", COL_BUDGET)),
          color.dim(pad("-", COL_FILES))
        ].join("  ") +
        " │"
    );
  }
  out.push(color.bold("└" + tableLine("─").slice(0, PANEL_TABLE_WIDTH - 2) + "┘"));
  return out;
}

function displayPanelLabel(row) {
  if (row.status === "missing") return color.dim(row.label) + color.dim(" (in main)");
  return row.label;
}

/* -------------------------------------------------------------------------- */
/* CLI                                                                         */
/* -------------------------------------------------------------------------- */

async function loadFirstLoadSet(distDir) {
  const htmlPath = path.join(distDir, "index.html");
  try {
    const html = await fs.readFile(htmlPath, "utf-8");
    return parseFirstLoadFromHtml(html);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = { dir: "dist", noFail: false, baseline: "bundle-baseline.json" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-fail") {
      args.noFail = true;
    } else if (a === "--baseline" && argv[i + 1]) {
      args.baseline = argv[++i];
    } else if (a === "--no-baseline") {
      args.baseline = null;
    } else if (!a.startsWith("--")) {
      args.dir = a;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const distDir = path.resolve(projectRoot, args.dir);

  let entries;
  try {
    entries = await walkDist(distDir);
  } catch (err) {
    console.error(color.red(`✗ 无法读取目录 ${distDir}: ${err.message}`));
    console.error(color.dim("提示:先跑 npm run build 生成 dist/"));
    process.exit(2);
    return;
  }

  if (entries.length === 0) {
    console.error(color.yellow(`⚠ 目录 ${distDir} 为空,没有产物可分析。`));
    console.error(color.dim("提示:先跑 npm run build 生成 dist/"));
    process.exit(2);
    return;
  }

  const firstLoadSet = await loadFirstLoadSet(distDir);
  classifyEntries(entries, firstLoadSet);

  let baselineInfo = { baseline: null, regressions: [] };
  if (args.baseline) {
    const baselinePath = path.resolve(projectRoot, args.baseline);
    baselineInfo = await applyBaseline(baselinePath, entries);
  }

  const { lines, hasFail } = renderReport(entries, baselineInfo);
  for (const ln of lines) console.log(ln);

  if (hasFail && !args.noFail) {
    console.error("");
    console.error(color.red(color.bold("✗ 存在 chunk 超过预算 — CI 将失败。")));
    console.error(color.dim("  调整 chunk 拆分、删除未用代码、或更新 docs/PERFORMANCE.md 预算。"));
    process.exitCode = 1;
  } else if (hasFail) {
    console.error(color.yellow("⚠ --no-fail 已开启,仅打印,exit code 不变。"));
  }
}

// 仅当作为主入口被 node 直接运行时才执行;被 import 时只导出 API。
const isMain = (() => {
  if (!process.argv[1]) return false;
  try {
    return pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
  } catch {
    return false;
  }
})();
if (isMain) {
  main().catch((err) => {
    console.error(color.red(`✗ 意外错误: ${err && err.stack ? err.stack : err}`));
    process.exit(2);
  });
}

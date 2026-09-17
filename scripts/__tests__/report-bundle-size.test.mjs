// scripts/__tests__/report-bundle-size.test.mjs
// 用 node:test 内置测试 + assert/strict 验证 report-bundle-size 工具函数。
// 跑法: node --test scripts/__tests__/report-bundle-size.test.mjs

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  gzipSizeOf,
  matchBudget,
  diffPercent,
  formatBytes,
  formatPercent,
  parseFirstLoadFromHtml,
  classifyEntries,
  applyBaseline,
  renderReport,
  buildPanelReport,
  renderPanelReport
} from "../report-bundle-size.mjs";

/* -------------------------------------------------------------------------- */
/* gzipSizeOf                                                                  */
/* -------------------------------------------------------------------------- */

describe("gzipSizeOf", () => {
  it("空字符串返回合法 gzip 头(>= 8 字节)且非 0", () => {
    const n = gzipSizeOf("");
    assert.ok(n >= 8, `空字符串应至少 8 字节,实际 ${n}`);
  });

  it("可压缩文本 gzip 后明显小于原始字节", () => {
    const text = "hello world ".repeat(100);
    const raw = Buffer.byteLength(text, "utf-8");
    const gz = gzipSizeOf(text);
    assert.ok(gz < raw, `gzip 后应小于原始,raw=${raw} gz=${gz}`);
    assert.ok(gz < raw / 5, `gzip 压缩比应至少 5x,raw=${raw} gz=${gz}`);
  });

  it("对同一输入返回稳定结果(幂等)", () => {
    const buf = Buffer.from("famai-star-map", "utf-8");
    assert.equal(gzipSizeOf(buf), gzipSizeOf(buf));
  });
});

/* -------------------------------------------------------------------------- */
/* matchBudget                                                                 */
/* -------------------------------------------------------------------------- */

describe("matchBudget", () => {
  it("命中 assets/index-*.js 主入口规则", () => {
    const rule = matchBudget("assets/index-Vl3s2qMp.js");
    assert.ok(rule);
    assert.equal(rule.label, "assets/index-*.js");
    assert.equal(rule.budgetBytes, 80 * 1024);
  });

  it("命中 three / pdfjs / icons / d3 / react / vendor 各 chunk 规则", () => {
    const cases = [
      ["assets/three-CINnKjIW.js", 200 * 1024, "assets/three-*.js"],
      ["assets/pdfjs-BvmhGDMV.js", 300 * 1024, "assets/pdfjs-*.js"],
      ["assets/icons-CW_BUbV4.js", 30 * 1024, "assets/icons-*.js"],
      ["assets/d3-AbCd.js", 15 * 1024, "assets/d3-*.js"],
      ["assets/react-EySAepEw.js", 50 * 1024, "assets/react-*.js"],
      ["assets/vendor-Cn1yNTNl.js", 50 * 1024, "assets/vendor-*.js"]
    ];
    for (const [file, expected, label] of cases) {
      const rule = matchBudget(file);
      assert.ok(rule, `应该匹配 ${file}`);
      assert.equal(rule.label, label);
      assert.equal(rule.budgetBytes, expected);
    }
  });

  it("命中 root 资源 favicon.svg / og-image.svg / manifest.webmanifest / index.html", () => {
    assert.equal(matchBudget("favicon.svg").label, "favicon.svg");
    assert.equal(matchBudget("og-image.svg").label, "og-image.svg");
    assert.equal(matchBudget("manifest.webmanifest").label, "manifest.webmanifest");
    assert.equal(matchBudget("index.html").label, "index.html");
  });

  it("非预算项返回 null(如 random.txt、service worker、lazy chunk)", () => {
    assert.equal(matchBudget("robots.txt"), null);
    assert.equal(matchBudget("sw.js"), null);
    assert.equal(matchBudget("assets/LawUniverseLabPage-F38nyqO0.js"), null);
    assert.equal(matchBudget("assets/pdf.worker.min-yatZIOMy.mjs"), null);
    assert.equal(matchBudget("sitemap.xml"), null);
  });
});

/* -------------------------------------------------------------------------- */
/* diffPercent / formatBytes / formatPercent                                   */
/* -------------------------------------------------------------------------- */

describe("diffPercent", () => {
  it("baseline=0 时返回 0(避免除零)", () => {
    assert.equal(diffPercent(100, 0), 0);
  });
  it("baseline=100 / current=120 -> +20%", () => {
    assert.ok(Math.abs(diffPercent(120, 100) - 0.2) < 1e-9);
  });
  it("baseline=100 / current=80 -> -20%", () => {
    assert.ok(Math.abs(diffPercent(80, 100) + 0.2) < 1e-9);
  });
  it("current === baseline -> 0", () => {
    assert.equal(diffPercent(50, 50), 0);
  });
});

describe("formatBytes / formatPercent", () => {
  it("formatBytes 边界正确", () => {
    assert.equal(formatBytes(0), "0 B");
    assert.equal(formatBytes(500), "500 B");
    assert.equal(formatBytes(1023), "1023 B");
    assert.equal(formatBytes(1024), "1.00 KB");
    assert.equal(formatBytes(1536), "1.50 KB");
    assert.equal(formatBytes(80 * 1024), "80.00 KB");
    assert.equal(formatBytes(200 * 1024), "200.0 KB");
  });

  it("formatPercent 带符号,一位小数", () => {
    assert.equal(formatPercent(0), "0.0%");
    assert.equal(formatPercent(0.123), "+12.3%");
    assert.equal(formatPercent(-0.045), "-4.5%");
  });
});

/* -------------------------------------------------------------------------- */
/* parseFirstLoadFromHtml                                                      */
/* -------------------------------------------------------------------------- */

describe("parseFirstLoadFromHtml", () => {
  it("项目子路径资源仍计入500KiB首屏预算", () => {
    const html = `<script type="module" src="/famai-star-map/assets/index-A.js"></script>
<link rel="modulepreload" href="/famai-star-map/assets/graph-A.js?v=1#module">
<link rel="preload" href="/famai-star-map/favicon.svg">`;
    const set = parseFirstLoadFromHtml(html);
    assert.deepEqual([...set].sort(), ["assets/graph-A.js", "assets/index-A.js", "favicon.svg", "index.html"]);
    const entries = classifyEntries([
      { relativePath: "index.html", size: 1024, gzip: 512 },
      { relativePath: "assets/index-A.js", size: 5000, gzip: 1024 },
      { relativePath: "assets/graph-A.js", size: 800000, gzip: 510 * 1024 }
    ], set);
    assert.equal(renderReport(entries, { baseline: null, regressions: [] }).hasFail, true);
  });
  it("提取 <script type=module src>, modulepreload, preload, stylesheet", () => {
    const html = `
<!doctype html>
<html>
<head>
  <link rel="icon" href="/favicon.svg" />
  <link rel="preload" href="/favicon.svg" as="image" />
  <link rel="modulepreload" href="/assets/react-XYZ.js" />
  <link rel="modulepreload" href="/assets/vendor-XYZ.js" />
  <link rel="stylesheet" href="/assets/index-XYZ.css" />
</head>
<body>
  <script type="module" crossorigin src="/assets/index-XYZ.js"></script>
</body>
</html>`;
    const set = parseFirstLoadFromHtml(html);
    assert.ok(set instanceof Set);
    // 注意:index-XYZ.js 同时是 module script 和 modulepreload,set 自然去重
    assert.equal(set.size, 6);
    assert.ok(set.has("index.html"));
    assert.ok(set.has("assets/index-XYZ.js"));
    assert.ok(set.has("assets/react-XYZ.js"));
    assert.ok(set.has("assets/vendor-XYZ.js"));
    assert.ok(set.has("assets/index-XYZ.css"));
    assert.ok(set.has("favicon.svg"));
    assert.ok(!set.has("assets/pdfjs-XYZ.js"), "不在 head 里的不计入");
  });

  it("空 HTML 或缺资源时返回 null", () => {
    assert.equal(parseFirstLoadFromHtml(""), null);
    assert.equal(parseFirstLoadFromHtml("<html><body>hi</body></html>"), null);
  });

  it("容错:href 以 / 开头也归一化", () => {
    const html = `<link rel="modulepreload" href="/assets/react-AAA.js" />`;
    const set = parseFirstLoadFromHtml(html);
    assert.ok(set.has("assets/react-AAA.js"));
  });

  it("容错:href 带 querystring 时丢弃", () => {
    const html = `<link rel="modulepreload" href="/assets/react-AAA.js?v=2" />`;
    const set = parseFirstLoadFromHtml(html);
    assert.ok(set.has("assets/react-AAA.js"));
  });
});

/* -------------------------------------------------------------------------- */
/* classifyEntries — ok / warn / fail / skip                                   */
/* -------------------------------------------------------------------------- */

describe("classifyEntries", () => {
  it("gzip <= 80% 预算 -> ok;80% < gzip <= 100% -> warn;gzip > 100% -> fail", () => {
    const entries = [
      // 30KB 预算,gzip 20KB (67%) -> ok
      { relativePath: "assets/icons-x.js", size: 30000, gzip: 20 * 1024 },
      // 50KB 预算,gzip 45KB (90%) -> warn
      { relativePath: "assets/react-x.js", size: 50000, gzip: 45 * 1024 },
      // 50KB 预算,gzip 60KB (120%) -> fail
      { relativePath: "assets/vendor-x.js", size: 60000, gzip: 60 * 1024 },
      // 没命中规则 -> skip
      { relativePath: "robots.txt", size: 100, gzip: 80 }
    ];
    const result = classifyEntries(entries, null);
    const byPath = Object.fromEntries(result.map((e) => [e.relativePath, e]));
    assert.equal(byPath["assets/icons-x.js"].status, "ok");
    assert.equal(byPath["assets/react-x.js"].status, "warn");
    assert.equal(byPath["assets/vendor-x.js"].status, "fail");
    assert.equal(byPath["robots.txt"].status, "skip");
  });

  it("first-load 集合正确写入 isFirstLoad", () => {
    const entries = [
      { relativePath: "index.html", size: 1024, gzip: 512 },
      { relativePath: "assets/react-X.js", size: 100, gzip: 50 },
      { relativePath: "assets/pdfjs-X.js", size: 100, gzip: 50 }
    ];
    const set = new Set(["index.html", "assets/react-X.js"]);
    classifyEntries(entries, set);
    assert.equal(entries[0].isFirstLoad, true);
    assert.equal(entries[1].isFirstLoad, true);
    assert.equal(entries[2].isFirstLoad, false);
  });
});

/* -------------------------------------------------------------------------- */
/* applyBaseline                                                               */
/* -------------------------------------------------------------------------- */

describe("applyBaseline", () => {
  it("无 baseline 文件时安全返回(返回 null baseline + 空 regressions)", async () => {
    const entries = [
      { relativePath: "a.js", size: 100, gzip: 100, rule: null, status: "skip" }
    ];
    const { baseline, regressions } = await applyBaseline("/nonexistent/path.json", entries);
    assert.equal(baseline, null);
    assert.deepEqual(regressions, []);
  });

  it("对 fail 状态且 Δ > 20% 触发 regression 警告;未 fail 不警告", async () => {
    const entries = [
      {
        relativePath: "assets/react-x.js",
        size: 70000,
        gzip: 60 * 1024, // 60KB / 50KB -> fail
        rule: { label: "x", budgetBytes: 50 * 1024, isFirstLoad: true },
        status: "fail"
      },
      {
        relativePath: "assets/vendor-x.js",
        size: 50000,
        gzip: 45 * 1024, // 45KB / 50KB -> warn (不变 fail)
        rule: { label: "y", budgetBytes: 50 * 1024, isFirstLoad: true },
        status: "warn"
      }
    ];
    // 写临时 baseline 文件
    const baselineObj = {
      generatedAt: "2026-08-01",
      files: {
        "assets/react-x.js": 40 * 1024, // 40 -> 60 = +50% (fail + >20% 触发)
        "assets/vendor-x.js": 30 * 1024 // 30 -> 45 = +50% 但 status=warn,不触发
      }
    };
    const tmpPath = `/tmp/baseline-test-${process.pid}.json`;
    const { writeFile, unlink } = await import("node:fs/promises");
    await writeFile(tmpPath, JSON.stringify(baselineObj), "utf-8");
    try {
      const { baseline, regressions } = await applyBaseline(tmpPath, entries);
      assert.ok(baseline, "应返回解析后的 baseline");
      assert.equal(regressions.length, 1, "仅 react-x.js 触发 regression");
      assert.match(regressions[0], /assets\/react-x\.js/);
      assert.ok(entries[0].deltaPct > 0.2, "deltaPct 已写入 entries[0]");
      assert.ok(entries[1].deltaPct > 0.2, "deltaPct 已写入 entries[1]");
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  });
});

/* -------------------------------------------------------------------------- */
/* renderReport — 输出表结构 + exit signal                                      */
/* -------------------------------------------------------------------------- */

describe("renderReport", () => {
  it("输出包含 Unicode 表格框 + 标题 + Total 行", () => {
    const entries = [
      {
        relativePath: "index.html",
        size: 6 * 1024,
        gzip: 2 * 1024,
        rule: { label: "index.html", budgetBytes: 8 * 1024, isFirstLoad: true },
        status: "ok",
        isFirstLoad: true
      },
      {
        relativePath: "assets/index-x.js",
        size: 90 * 1024,
        gzip: 35 * 1024,
        rule: { label: "assets/index-*.js", budgetBytes: 80 * 1024, isFirstLoad: true },
        status: "ok",
        isFirstLoad: true
      }
    ];
    const { lines, hasFail } = renderReport(entries, { baseline: null, regressions: [] });
    assert.ok(Array.isArray(lines) && lines.length > 0);
    assert.equal(hasFail, false);
    // 标题、表格框、TOTAL 行
    assert.ok(lines.some((l) => l.includes("Bundle Size Report")));
    assert.ok(lines.some((l) => l.includes("┌")));
    assert.ok(lines.some((l) => l.includes("└")));
    assert.ok(lines.some((l) => l.includes("TOTAL (first load gzip)")));
  });

  it("当存在 fail chunk 时 hasFail = true", () => {
    const entries = [
      {
        relativePath: "assets/react-x.js",
        size: 80 * 1024,
        gzip: 60 * 1024, // 50KB 预算,60KB fail
        rule: { label: "assets/react-*.js", budgetBytes: 50 * 1024, isFirstLoad: true },
        status: "fail",
        isFirstLoad: true
      }
    ];
    const { lines, hasFail } = renderReport(entries, { baseline: null, regressions: [] });
    assert.equal(hasFail, true);
    // ✗ 图标应出现
    assert.ok(lines.some((l) => l.includes("✗")));
  });

  it("Per-Panel 报告被追加到主表末尾(可由 grep Per-Panel 定位)", () => {
    const entries = [
      {
        relativePath: "assets/LawUniverseWorkbenchPanel-AbCd.js",
        size: 50 * 1024,
        gzip: 16 * 1024,
        rule: null,
        status: "skip"
      }
    ];
    const { lines } = renderReport(entries, { baseline: null, regressions: [] });
    assert.ok(lines.some((l) => l.includes("Per-Panel")), "应包含 Per-Panel 标题");
    assert.ok(lines.some((l) => l.includes("WorkbenchPanel")), "应包含拆出的面板名");
  });
});

/* -------------------------------------------------------------------------- */
/* buildPanelReport                                                            */
/* -------------------------------------------------------------------------- */

describe("buildPanelReport", () => {
  it("按 glob 匹配面板 chunk,聚合 raw + gzip,缺文件标 missing", () => {
    const entries = [
      { relativePath: "assets/LawUniverseWorkbenchPanel-A.js", size: 40 * 1024, gzip: 14 * 1024 },
      { relativePath: "assets/LawUniverseWorkbenchPanel-A.css", size: 5 * 1024, gzip: 2 * 1024 },
      { relativePath: "assets/LawUniverseQuizSession-B.js", size: 10 * 1024, gzip: 4 * 1024 },
      { relativePath: "assets/three-X.js", size: 200 * 1024, gzip: 50 * 1024 } // 不应被任何 panel 匹配
    ];
    const { rows, totalGzip, hasFail } = buildPanelReport(entries);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));
    // WorkbenchPanel:40+5=45KB raw,14+2=16KB gzip(包含 css)
    assert.equal(byLabel.WorkbenchPanel.raw, 45 * 1024);
    assert.equal(byLabel.WorkbenchPanel.gzip, 16 * 1024);
    assert.equal(byLabel.WorkbenchPanel.status, "ok");
    assert.equal(byLabel.WorkbenchPanel.files.length, 2);
    // QuizSession
    assert.equal(byLabel.QuizSession.raw, 10 * 1024);
    assert.equal(byLabel.QuizSession.status, "ok");
    // CommandPalette 没匹配
    assert.equal(byLabel.CommandPalette.status, "missing");
    assert.equal(byLabel.CommandPalette.files.length, 0);
    // 三不归入 total
    assert.equal(totalGzip, 16 * 1024 + 4 * 1024);
    assert.equal(hasFail, false);
  });

  it("gzip 超过 1.2x 预算标 fail 并触发 hasFail", () => {
    const entries = [
      { relativePath: "assets/KeyboardCheatsheet-X.js", size: 60 * 1024, gzip: 25 * 1024 } // 预算 15KB,25KB > 18KB
    ];
    const { rows, hasFail } = buildPanelReport(entries);
    const row = rows.find((r) => r.label === "KeyboardCheatsheet");
    assert.equal(row.status, "fail");
    assert.equal(hasFail, true);
  });

  it("gzip 在 80%-120% 预算之间标 warn,不触发 hasFail", () => {
    const entries = [
      { relativePath: "assets/KeyboardCheatsheet-X.js", size: 30 * 1024, gzip: 14 * 1024 } // 预算 15KB,14KB 93%
    ];
    const { rows, hasFail } = buildPanelReport(entries);
    const row = rows.find((r) => r.label === "KeyboardCheatsheet");
    assert.equal(row.status, "warn");
    assert.equal(hasFail, false);
  });
});

describe("renderPanelReport", () => {
  it("输出包含 Per-Panel 标题 + 表格框 + 至少一个面板行", () => {
    const entries = [
      { relativePath: "assets/LawUniverseWorkbenchPanel-A.js", size: 40 * 1024, gzip: 14 * 1024 }
    ];
    const { rows, totalGzip, totalRaw } = buildPanelReport(entries);
    const lines = renderPanelReport(rows, { totalGzip, totalRaw });
    assert.ok(lines.length > 0);
    assert.ok(lines.some((l) => l.includes("Per-Panel")), "应包含 Per-Panel 标题");
    assert.ok(lines.some((l) => l.includes("WorkbenchPanel")), "应包含面板名");
    assert.ok(lines.some((l) => l.includes("┌")), "应包含表格框");
    assert.ok(lines.some((l) => l.includes("└")), "应包含表格框");
    assert.ok(lines.some((l) => l.includes("TOTAL")), "应包含 TOTAL 行");
  });

  it("missing 面板以灰色 '(in main)' 标记", () => {
    const entries = [];
    const { rows, totalGzip, totalRaw } = buildPanelReport(entries);
    const lines = renderPanelReport(rows, { totalGzip, totalRaw });
    // 找到带 (in main) 的行
    const inMain = lines.find((l) => l.includes("(in main)"));
    assert.ok(inMain, "应包含 '(in main)' 标注");
  });
});

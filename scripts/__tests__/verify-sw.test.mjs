// scripts/__tests__/verify-sw.test.mjs
// 用 node:test + node:child_process 跑 verify-sw.mjs 子进程,做 sanity test。
//
// 跑法: node --test scripts/__tests__/verify-sw.test.mjs
//
// 设计:verify-sw.mjs 接受可选路径参数,这里用同一脚本校验三种输入
//   1) 默认 public/sw.js → 应当 PASS (exit 0)
//   2) 临时坏文件(注入 garbage)→ 应当 FAIL (exit 1)
//   3) 临时不完整文件(缺 fetch handler)→ 应当 FAIL (exit 1)
//
// 这些不是单测覆盖 21 条 check,而是"端到端"验证 verify-sw.mjs 本身能正确退出 0/1。
// 21 条细则的回归靠 sw.js 改动后跑 verify-sw.mjs 即可。

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERIFY_SW = resolve(__dirname, "..", "verify-sw.mjs");
const REAL_SW = resolve(__dirname, "..", "..", "public", "sw.js");

/**
 * 跑 verify-sw.mjs 子进程,返回 { exitCode, stdout, stderr }
 * @param {string} [swPath] - 传给 verify-sw.mjs 的可选路径参数
 */
function runVerifySw(swPath) {
  return new Promise((res, rej) => {
    const args = swPath ? [VERIFY_SW, swPath] : [VERIFY_SW];
    const child = spawn(process.execPath, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => (stdout += c.toString()));
    child.stderr.on("data", (c) => (stderr += c.toString()));
    child.on("error", rej);
    child.on("close", (code) => res({ exitCode: code, stdout, stderr }));
  });
}

describe("verify-sw.mjs sanity", () => {
  let tmpDir;
  let realSwContent;

  before(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "verify-sw-test-"));
    realSwContent = await readFile(REAL_SW, "utf8");
  });

  after(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
  });

  it("happy path: 真实 public/sw.js 通过 21/21 checks (exit 0)", async () => {
    const { exitCode, stdout } = await runVerifySw();
    assert.equal(exitCode, 0, `应当 exit 0,实际 ${exitCode}\nstdout: ${stdout}`);
    assert.match(stdout, /PASS: \d+\/\d+ checks/, "stdout 应包含 PASS 行");
  });

  it("garbage: 临时坏文件(注入非 JS 内容)→ 应当 SyntaxError 失败 (exit 1)", async () => {
    const brokenPath = join(tmpDir, "broken-garbage.js");
    // 在正常 SW 内容末尾塞一段无效语法
    const broken = realSwContent + "\n\nTHIS IS NOT VALID JAVASCRIPT {{{\n";
    await writeFile(brokenPath, broken, "utf8");

    const { exitCode, stderr } = await runVerifySw(brokenPath);
    assert.equal(exitCode, 1, `garbage 文件应当 exit 1,实际 ${exitCode}\nstderr: ${stderr}`);
    // 可能命中 SyntaxError 检查 或 函数定义检查 —— 任一即可
    assert.ok(
      /SyntaxError|Missing|not found|未|失败|FAIL/i.test(stderr),
      `stderr 应有失败原因,实际: ${stderr}`
    );
  });

  it("missing-fetch: 缺 fetch handler 的 SW → 应当 exit 1", async () => {
    const brokenPath = join(tmpDir, "broken-no-fetch.js");
    // 复制正常 SW 但删掉 fetch addEventListener
    const broken = realSwContent.replace(
      /self\.addEventListener\("fetch"[\s\S]*?\}\);/m,
      "// fetch handler removed for test"
    );
    await writeFile(brokenPath, broken, "utf8");

    const { exitCode, stderr } = await runVerifySw(brokenPath);
    assert.equal(exitCode, 1, `缺 fetch 应 exit 1,实际 ${exitCode}\nstderr: ${stderr}`);
    assert.match(stderr, /fetch/i, "stderr 应提及 fetch 缺失");
  });

  it("missing-networkFirst: 删掉 networkFirst 策略函数 → 应当 exit 1", async () => {
    const brokenPath = join(tmpDir, "broken-no-networkFirst.js");
    // 删掉 networkFirst 函数定义(但保留 fetch handler 调用,否则命中"fetch 缺失"分支)
    const broken = realSwContent.replace(
      /async function networkFirst\([\s\S]*?\n\}/m,
      "// networkFirst removed"
    );
    await writeFile(brokenPath, broken, "utf8");

    const { exitCode, stderr } = await runVerifySw(brokenPath);
    assert.equal(exitCode, 1, `缺 networkFirst 应 exit 1,实际 ${exitCode}\nstderr: ${stderr}`);
    assert.match(stderr, /networkFirst/, "stderr 应提及 networkFirst 缺失");
  });
});

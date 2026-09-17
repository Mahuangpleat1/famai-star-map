#!/usr/bin/env node
/**
 * 法脉星图 · 一条龙串行门禁
 *
 * 用法:
 *   node scripts/verify-all.mjs        # 跑全部 8 步,失败立即 exit 1
 *   npm run verify:all
 *
 * 行为:
 *   1. 串行执行 8 步,任何一步非 0 退出即停。
 *   2. 每步用 spawnSync + stdio:inherit,用户看到原始命令输出。
 *   3. 不引入 ANSI 颜色 — 跨平台日志友好(grep / CI 抓取)。
 *   4. 全部通过后打印总耗时 + 🎉 标识。
 *
 * 步骤顺序(Track J spec):
 *   1. lint
 *   2. typecheck
 *   3. check:legal-universe
 *   4. test
 *   5. build  (含 report:bundle)
 *   6. verify:sw
 *   7. audit:contrast
 *   8. test:contrast
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

/* -------------------------------------------------------------------------- */
/* 步骤定义                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 每一步的元数据。label 用于人读输出,cmd 是 argv 数组(传给 npm run)。
 * 期望消息是给自检报告用的,不是正则硬匹配。
 *
 * @type {ReadonlyArray<{label: string, cmd: string[], expect: string}>}
 */
const STEPS = [
  { label: "Lint",                 cmd: ["run", "lint"],                 expect: "0 errors" },
  { label: "Typecheck",            cmd: ["run", "typecheck"],            expect: "0 errors" },
  { label: "Validate legal data",  cmd: ["run", "check:legal-universe"], expect: "610/969/11" },
  { label: "Unit tests",           cmd: ["run", "test"],                 expect: "392+/392+" },
  { label: "Production build",     cmd: ["run", "build"],                expect: "first-load gzip < 305KB" },
  { label: "Verify service worker",cmd: ["run", "verify:sw"],            expect: "21/21" },
  { label: "Audit color contrast", cmd: ["run", "audit:contrast"],       expect: "0 FAIL/WARN" },
  { label: "A11y contrast test",   cmd: ["run", "test:contrast"],        expect: "7/7" }
];

/* -------------------------------------------------------------------------- */
/* 运行器                                                                      */
/* -------------------------------------------------------------------------- */

const total = STEPS.length;
const t0 = Date.now();

/** 格式化毫秒数为人可读字符串。 */
function fmtMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const r = (s - m * 60).toFixed(1);
  return `${m}m${r}s`;
}

/**
 * 跑单步,打印进度,返回是否成功。
 * @param {number} idx  1-based 步骤编号
 * @param {{label: string, cmd: string[], expect: string}} step
 * @returns {boolean}
 */
function runStep(idx, step) {
  const start = Date.now();
  console.log(`[${idx}/${total}] ${step.label} (expect: ${step.expect}) ...`);
  const result = spawnSync("npm", step.cmd, {
    stdio: "inherit",
    env: process.env
  });
  const elapsed = Date.now() - start;
  // 进程被信号终止(罕见,例如 SIGTERM)也算失败
  if (result.error) {
    console.error(`[FAIL] ${step.label} spawn error: ${result.error.message}`);
    return false;
  }
  if (result.status !== 0) {
    console.error(`[FAIL] ${step.label} FAILED (exit ${result.status ?? "?"}, ${fmtMs(elapsed)})`);
    return false;
  }
  console.log(`[OK] ${step.label} (${fmtMs(elapsed)})`);
  return true;
}

for (let i = 0; i < STEPS.length; i += 1) {
  const ok = runStep(i + 1, STEPS[i]);
  if (!ok) {
    console.error(`\nverify-all FAILED at step ${i + 1}/${total}: ${STEPS[i].label}`);
    process.exit(1);
  }
}

const totalMs = Date.now() - t0;
console.log(`\n🎉 verify-all PASS (${total} steps, ${fmtMs(totalMs)})`);
process.exit(0);

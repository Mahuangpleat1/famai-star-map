#!/usr/bin/env node
/* eslint-env node */
/**
 * 生成法脉星图 PWA 图标 PNG。
 *
 * 读 public/favicon.svg(32x32 viewBox,圆角矩形 + 中心金色太阳 + 11 颗卫星点),
 * 渲染成多尺寸 PNG:
 *   - 180x180 → public/apple-touch-icon.png   (iOS Home Screen 触摸图标)
 *   - 192x192 → public/icon-192.png          (PWA manifest,Android)
 *   - 512x512 → public/icon-512.png          (PWA manifest,Android splash)
 *
 * 依赖:sharp(已在 devDependencies)
 *
 * 跑法:
 *   node scripts/generate-apple-touch-icon.mjs
 *
 * 设计边界:
 *   - 直接 resize favicon.svg,SVG 自带圆角矩形(不额外加 iOS 圆角,避免和 SVG 内部 rx 冲突)
 *   - 不引 sharp 的圆角 composite,保持 favicon 视觉一致
 *   - 输出 PNG 用 fit: "contain" + 透明背景,iOS 会自己加圆角
 *   - 失败 exit 1,输出具体原因
 */

import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");
const SVG_PATH = resolve(PUBLIC_DIR, "favicon.svg");

/**
 * @typedef {Object} IconSpec
 * @property {number} size - 输出尺寸(正方形)
 * @property {string} filename - 相对 public/ 的文件名
 * @property {string} purpose - 用途说明(给 console log 用)
 */

/** @type {IconSpec[]} */
const ICONS = [
  { size: 180, filename: "apple-touch-icon.png", purpose: "iOS Home Screen touch icon" },
  { size: 192, filename: "icon-192.png", purpose: "PWA manifest (Android)" },
  { size: 512, filename: "icon-512.png", purpose: "PWA manifest (Android splash)" }
];

function pass(msg) {
  console.log(`[generate-icons] ${msg}`);
}

function fail(msg) {
  console.error(`[generate-icons] FAIL: ${msg}`);
  process.exit(1);
}

try {
  // 1) 源 SVG 必须存在
  await access(SVG_PATH);
  const svgBuffer = await readFile(SVG_PATH);

  // 2) 校验 SVG 格式(sharp 在 malformed SVG 上会抛得很难看)
  if (!svgBuffer.toString("utf8").includes("<svg")) {
    fail(`${SVG_PATH} 不是合法 SVG(缺少 <svg 根)`);
  }

  // 3) 逐个尺寸渲染
  for (const { size, filename, purpose } of ICONS) {
    const outPath = resolve(PUBLIC_DIR, filename);
    await sharp(svgBuffer, { density: 384 }) // 384 DPI 让矢量在 resize 后保持锐利
      .resize(size, size, {
        fit: "contain",
        background: { r: 5, g: 7, b: 10, alpha: 0 } // 透明背景,匹配 manifest theme #05070a
      })
      .png({
        compressionLevel: 9, // 最强压缩,牺牲一点点速度换体积
        palette: true // 调色板模式(颜色数 < 256 时更小)
      })
      .toBuffer()
      .then(async (png) => {
        await writeFile(outPath, png);
        pass(`  ✓ ${filename} (${size}x${size}, ${png.length} bytes) — ${purpose}`);
      })
      .catch((err) => {
        fail(`渲染 ${filename} 失败: ${err.message}`);
      });
  }

  pass(`Done. 3 icons generated under ${PUBLIC_DIR}`);
  pass(`记得在 index.html 加 <link rel="apple-touch-icon" href="/apple-touch-icon.png">`);
  pass(`并在 manifest.webmanifest 的 icons 数组里引用 /icon-192.png + /icon-512.png`);
} catch (err) {
  fail(err && err.message ? err.message : String(err));
}

import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

/**
 * jsdom 没有 `import.meta.env`,但我们的 perf.ts / main.tsx 会读 DEV / PROD。
 * Vitest 默认按 DEV 跑,所以这里兜底一个 env 对象。
 * 测 PROD 行为时,在测试里直接 import.meta.env.PROD = true / 改写属性。
 */
if (typeof import.meta !== "undefined" && !(import.meta as { env?: unknown }).env) {
  Object.defineProperty(import.meta, "env", {
    value: { DEV: true, PROD: false, MODE: "test", BASE_URL: "/" },
    writable: true,
    configurable: true
  });
}

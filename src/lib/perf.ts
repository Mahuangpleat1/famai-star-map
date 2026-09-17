/**
 * perf —— Web Vitals 上报。
 *
 * 监听 5 个核心 Core Web Vitals + 周边指标:
 *   - LCP  (Largest Contentful Paint)  —— 加载性能
 *   - FCP  (First Contentful Paint)     —— 加载性能
 *   - TTFB (Time To First Byte)         —— 服务端响应
 *   - INP  (Interaction to Next Paint)  —— 交互响应(FID 的继任者)
 *   - CLS  (Cumulative Layout Shift)    —— 视觉稳定性
 *
 * 行为分模式:
 *   - DEV:  console.info 输出,不发送网络请求(避免污染用户网络 / 触发 rate limit)
 *   - PROD: 仅在页面内存保留最近样本，不发送网络请求
 *
 * 调用方式:
 *   import { initPerfReporting } from "./perf";
 *   initPerfReporting();   // main.tsx 里调一次
 *
 * 测试:
 *   getPerfSample() 返回最近一次回调的 metric 快照,供单测断言。
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";


let initialized = false;
/** 最近一次回调的 metric 快照,测试用 —— 业务代码不应依赖。 */
let lastSample: Metric | null = null;
/** 用于测试 / 调试的样本列表,保留最近 16 条避免内存泄漏。 */
const sampleBuffer: Metric[] = [];

/**
 * 模块内部 dev/prod 标志。
 *
 * 默认为 import.meta.env.DEV(Vite / Vitest 提供),
 * 通过 __setDevForTests() 可以在测试里切换,验证不同模式的分支行为。
 *
 * 业务代码不直接读这个值,只通过 handleMetric 间接用。
 */
let _isDev: boolean = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

/** Keep diagnostic samples in memory; never transmit them. */
function handleMetric(metric: Metric): void {
  lastSample = metric;
  sampleBuffer.push(metric);
  if (sampleBuffer.length > 16) {
    sampleBuffer.shift();
  }

  if (_isDev) {
    // 开发模式:只打印,不打网络
    console.info(`[law-universe:perf] ${metric.name}=${metric.value} (${metric.rating})`, metric);
    return;
  }


}

/**
 * 启动 Web Vitals 监听。多次调用幂等。
 *
 * web-vitals 内部每个 on* 都会注册 PerformanceObserver,
 * 重复调用会重复监听 —— 我们用 `initialized` flag 保护。
 */
export function initPerfReporting(): void {
  if (initialized) return;
  if (typeof window === "undefined") return; // SSR / 测试环境
  initialized = true;

  try {
    onLCP(handleMetric);
    onINP(handleMetric);
    onCLS(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
  } catch (err) {
    // 注册阶段失败(老浏览器 / PerformanceObserver 缺失)不影响页面
    console.warn("[law-universe:perf] init failed:", err);
  }
}

/**
 * 测试用:取最近一次回调的 metric 快照。
 * 未触发过任何 metric 时返回 null。
 */
export function getPerfSample(): Metric | null {
  return lastSample;
}

/**
 * 测试用:取最近 16 条样本,深拷贝避免外部 mutate。
 */
export function getPerfSampleBuffer(): Metric[] {
  return sampleBuffer.slice();
}

/** 测试用:重置内部状态(供 vitest afterEach 调)。 */
export function __resetPerfForTests(): void {
  initialized = false;
  lastSample = null;
  sampleBuffer.length = 0;
  _isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;
}

/** 测试用:切换 dev/prod 模式,验证 handleMetric 的分支行为。 */
export function __setDevForTests(value: boolean): void {
  _isDev = value;
}

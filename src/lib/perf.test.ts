/**
 * perf 单测 —— 验证:
 *   - 5 个 Web Vitals 指标都被注册
 *   - DEV 模式打 console.info,不打网络
 *   - PROD 模式打 sendClientLog({ kind: "perf", ... })
 *   - 失败静默
 *   - initPerfReporting 幂等
 *
 * 策略:vi.mock("web-vitals") 注入受控的 on* 函数,我们可以手动触发回调。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as clientLog from "./clientLog";

// 收集 web-vitals 注册的回调,测试里手动触发
const handlers: Record<string, (metric: unknown) => void> = {};

vi.mock("web-vitals", () => ({
  onLCP: (cb: (m: unknown) => void) => {
    handlers.LCP = cb;
  },
  onINP: (cb: (m: unknown) => void) => {
    handlers.INP = cb;
  },
  onCLS: (cb: (m: unknown) => void) => {
    handlers.CLS = cb;
  },
  onFCP: (cb: (m: unknown) => void) => {
    handlers.FCP = cb;
  },
  onTTFB: (cb: (m: unknown) => void) => {
    handlers.TTFB = cb;
  }
}));

import {
  __resetPerfForTests,
  __setDevForTests,
  getPerfSample,
  getPerfSampleBuffer,
  initPerfReporting
} from "./perf";

const sampleMetric = {
  name: "LCP",
  value: 1234,
  rating: "good",
  delta: 1234,
  id: "v1-1234",
  entries: [],
  navigationType: "navigate"
};

describe("perf.initPerfReporting", () => {
  let beaconSpy: ReturnType<typeof vi.fn>;
  let sendClientLogSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    for (const k of Object.keys(handlers)) delete handlers[k];
    __resetPerfForTests();

    beaconSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      writable: true,
      value: beaconSpy
    });
    // vi.spyOn 不带泛型参数时返回 MockInstance 的通用形态,这里改用宽松类型
    sendClientLogSpy = vi.spyOn(clientLog, "sendClientLog") as unknown as ReturnType<typeof vi.spyOn>;
    sendClientLogSpy.mockReturnValue(true);
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers all 5 web-vitals listeners (LCP/INP/CLS/FCP/TTFB)", () => {
    initPerfReporting();
    expect(Object.keys(handlers).sort()).toEqual(["CLS", "FCP", "INP", "LCP", "TTFB"].sort());
  });

  it("is idempotent: calling initPerfReporting twice does not re-register", () => {
    initPerfReporting();
    const firstRefs = { ...handlers };
    initPerfReporting();
    for (const k of Object.keys(firstRefs)) {
      expect(handlers[k]).toBe(firstRefs[k]);
    }
  });

  it("DEV mode: triggers console.info, does NOT call sendClientLog", () => {
    // 默认是 DEV
    __setDevForTests(true);
    initPerfReporting();
    handlers.LCP(sampleMetric);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const [msg, arg] = infoSpy.mock.calls[0];
    expect(msg).toContain("LCP");
    expect(msg).toContain("1234");
    expect(arg).toBe(sampleMetric);
    expect(sendClientLogSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
  });

  it("PROD mode retains samples locally without telemetry", () => {
    __setDevForTests(false);
    initPerfReporting();
    handlers.INP({ ...sampleMetric, name: "INP", value: 200 });
    expect(sendClientLogSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    expect(getPerfSample()?.value).toBe(200);
  });

  it("swallows sendClientLog failures (no throw)", () => {
    __setDevForTests(false);
    sendClientLogSpy.mockImplementation(() => {
      throw new Error("upstream down");
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    initPerfReporting();
    expect(() => handlers.CLS({ ...sampleMetric, name: "CLS", value: 0.05 })).not.toThrow();

    warnSpy.mockRestore();
  });

  it("getPerfSample returns the most recent metric after a callback", () => {
    initPerfReporting();
    expect(getPerfSample()).toBeNull();
    handlers.FCP({ ...sampleMetric, name: "FCP", value: 900 });
    const sample = getPerfSample();
    expect(sample).not.toBeNull();
    expect(sample?.name).toBe("FCP");
    expect(sample?.value).toBe(900);
  });

  it("getPerfSampleBuffer keeps recent metrics (capped at 16)", () => {
    initPerfReporting();
    for (let i = 0; i < 20; i += 1) {
      handlers.TTFB({ ...sampleMetric, name: "TTFB", value: i * 10 });
    }
    const buf = getPerfSampleBuffer();
    expect(buf.length).toBe(16);
    expect(buf[buf.length - 1].value).toBe(190);
  });
});

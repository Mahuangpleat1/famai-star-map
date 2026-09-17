import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStorageQuota } from "./useStorageQuota";

beforeEach(() => {
  // jsdom 没有 navigator.storage,需要 mock
  Object.defineProperty(navigator, "storage", {
    configurable: true,
    value: {
      estimate: vi.fn().mockResolvedValue({ quota: 10_000_000, usage: 5_000_000 })
    }
  });
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("useStorageQuota", () => {
  it("returns initial state then loads estimate", async () => {
    const { result } = renderHook(() => useStorageQuota());
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    expect(result.current.quotaBytes).toBe(10_000_000);
    expect(result.current.usageBytes).toBe(5_000_000);
    expect(result.current.usageRatio).toBe(0.5);
    expect(result.current.warning).toBe(false);
    expect(result.current.danger).toBe(false);
    expect(result.current.supported).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("computes warning at warningThreshold (default 0.8)", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockResolvedValue({ quota: 1_000_000, usage: 850_000 })
      }
    });
    const { result } = renderHook(() => useStorageQuota());
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    expect(result.current.usageRatio).toBe(0.85);
    expect(result.current.warning).toBe(true);
    expect(result.current.danger).toBe(false);
  });

  it("computes danger at dangerThreshold (default 0.95)", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockResolvedValue({ quota: 1_000_000, usage: 960_000 })
      }
    });
    const { result } = renderHook(() => useStorageQuota());
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    expect(result.current.usageRatio).toBe(0.96);
    expect(result.current.warning).toBe(true);
    expect(result.current.danger).toBe(true);
  });

  it("respects custom thresholds", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockResolvedValue({ quota: 1_000_000, usage: 400_000 })
      }
    });
    const { result } = renderHook(() =>
      useStorageQuota({ warningThreshold: 0.3, dangerThreshold: 0.7 })
    );
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    expect(result.current.warning).toBe(true);
    expect(result.current.danger).toBe(false);
  });

  it("counts localStorage bytes even when estimate is small", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockResolvedValue({ quota: 1_000_000, usage: 1000 })
      }
    });
    // localStorage 写 100 chars × 2 bytes/char
    window.localStorage.setItem("a".repeat(50), "b".repeat(50));
    const { result } = renderHook(() => useStorageQuota());
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    // 100 chars × 2 = 200 bytes, but max(1000, 200) = 1000
    expect(result.current.localStorageBytes).toBeGreaterThanOrEqual(200);
  });

  it("handles navigator.storage missing gracefully", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: undefined
    });
    const { result } = renderHook(() => useStorageQuota());
    // 等一次 refresh
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    expect(result.current.supported).toBe(false);
    expect(result.current.usageRatio).toBe(0);
  });

  it("handles estimate() throwing gracefully", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: vi.fn().mockRejectedValue(new Error("estimate failed"))
      }
    });
    const { result } = renderHook(() => useStorageQuota());
    await waitFor(() => {
      expect(result.current.updatedAt).toBeGreaterThan(0);
    });
    // 不会 throw,supported=false,quota=0
    expect(result.current.supported).toBe(false);
  });

  it("does not poll when enabled=false", async () => {
    const estimateSpy = vi.fn().mockResolvedValue({ quota: 1_000_000, usage: 500_000 });
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: estimateSpy }
    });
    const { result } = renderHook(() => useStorageQuota({ enabled: false, pollIntervalMs: 100 }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(estimateSpy).not.toHaveBeenCalled();
    expect(result.current.updatedAt).toBe(0);
  });
});

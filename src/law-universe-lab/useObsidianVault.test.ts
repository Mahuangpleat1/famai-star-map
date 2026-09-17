/**
 * useObsidianVault hook 单测 —— Phase 4 F.2。
 *
 * 5 个测试:
 *   1. isSupported true when showDirectoryPicker exists
 *   2. isSupported false when showDirectoryPicker missing
 *   3. pickVault sets vaultHandle on success
 *   4. pickVault throws when isSupported false
 *   5. isSupported detected at mount time (不随 rerender 变化)
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useObsidianVault } from "./useObsidianVault";

describe("useObsidianVault", () => {
  const originalShowDirectoryPicker = (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker;
  const originalStructuredClone = (globalThis as unknown as { structuredClone?: <T>(v: T) => T }).structuredClone;

  beforeEach(() => {
    // Default: supported
    (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker = vi.fn();
    (globalThis as unknown as { structuredClone: <T>(v: T) => T }).structuredClone = <T,>(v: T) =>
      JSON.parse(JSON.stringify(v)) as T;
  });

  afterEach(() => {
    (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker = originalShowDirectoryPicker;
    if (originalStructuredClone) {
      (globalThis as unknown as { structuredClone?: <T>(v: T) => T }).structuredClone = originalStructuredClone;
    }
  });

  it("isSupported true when showDirectoryPicker exists", () => {
    const { result } = renderHook(() => useObsidianVault());
    expect(result.current.isSupported).toBe(true);
  });

  it("isSupported false when showDirectoryPicker missing", () => {
    delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker;
    const { result } = renderHook(() => useObsidianVault());
    expect(result.current.isSupported).toBe(false);
  });

  it("pickVault sets vaultHandle on success", async () => {
    const mockHandle = { kind: "directory", name: "vault" };
    (window as unknown as { showDirectoryPicker: () => Promise<unknown> }).showDirectoryPicker = vi
      .fn()
      .mockResolvedValue(mockHandle);
    const { result } = renderHook(() => useObsidianVault());
    await act(async () => {
      await result.current.pickVault();
    });
    expect(result.current.vaultHandle).toBe(mockHandle);
  });

  it("pickVault throws when isSupported false", async () => {
    delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker;
    const { result } = renderHook(() => useObsidianVault());
    await act(async () => {
      await expect(result.current.pickVault()).rejects.toThrow("不支持");
    });
  });

  it("isSupported detected at mount time", () => {
    const { result, rerender } = renderHook(() => useObsidianVault());
    expect(result.current.isSupported).toBe(true);
    delete (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker;
    rerender();
    // 检测在 mount 时跑,rerender 不会重新检测 (设计)
    expect(result.current.isSupported).toBe(true);
  });
});

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCinematicIntro } from "./useCinematicIntro";

beforeEach(() => {
  vi.useFakeTimers();
  // 默认 jsdom 不提供 matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false
    })
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCinematicIntro", () => {
  it("starts in 'intro' mode and settles to 'settled' after timeout", () => {
    const { result } = renderHook(() => useCinematicIntro(1000));
    expect(result.current[0]).toBe("intro");

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current[0]).toBe("settled");
  });

  it("settle() can manually advance mode", () => {
    const { result } = renderHook(() => useCinematicIntro(10000));
    expect(result.current[0]).toBe("intro");
    act(() => {
      result.current[1](); // settle
    });
    expect(result.current[0]).toBe("settled");
  });

  it("skips intro when prefers-reduced-motion is set", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
      })
    });
    const { result } = renderHook(() => useCinematicIntro(10000));
    // reduced-motion 应该立刻 settled
    expect(result.current[0]).toBe("settled");
  });

  it("uses default 9600ms timeout when no arg given", () => {
    const { result } = renderHook(() => useCinematicIntro());
    expect(result.current[0]).toBe("intro");
    // 不到 9600 不会切
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current[0]).toBe("intro");
    // 超过 9600 才切
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current[0]).toBe("settled");
  });

  it("clears pending timer on unmount", () => {
    const { unmount } = renderHook(() => useCinematicIntro(1000));
    expect(() => unmount()).not.toThrow();
    // unmount 后 advance timer 不应该报 "Can't perform a React state update on an unmounted component"
    act(() => {
      vi.advanceTimersByTime(2000);
    });
  });
});

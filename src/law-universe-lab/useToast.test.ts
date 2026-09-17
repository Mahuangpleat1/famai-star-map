/**
 * useToast hook 单元测试 —— Phase 3 polish (9.1)。
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "./useToast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useToast", () => {
  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("push() returns id and adds toast", () => {
    const { result } = renderHook(() => useToast());
    let id = "";
    act(() => {
      id = result.current.push({ kind: "info", message: "hello" });
    });
    expect(id).toBeTruthy();
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("hello");
    expect(result.current.toasts[0].kind).toBe("info");
  });

  it("success() pushes with kind=success", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("done");
    });
    expect(result.current.toasts[0].kind).toBe("success");
  });

  it("error() pushes with kind=error", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.error("oops");
    });
    expect(result.current.toasts[0].kind).toBe("error");
  });

  it("auto dismisses after duration ms (default 4000)", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.push({ kind: "info", message: "x" });
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("duration 0 means no auto-dismiss", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.push({ kind: "error", message: "x", duration: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("dismiss(id) removes immediately", () => {
    const { result } = renderHook(() => useToast());
    let id = "";
    act(() => {
      id = result.current.push({ kind: "info", message: "x" });
    });
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("supports multiple toasts stacked", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.push({ kind: "info", message: "1" });
      result.current.push({ kind: "info", message: "2" });
      result.current.push({ kind: "info", message: "3" });
    });
    expect(result.current.toasts).toHaveLength(3);
  });

  it("unmount clears pending timers", () => {
    const { result, unmount } = renderHook(() => useToast());
    act(() => {
      result.current.push({ kind: "info", message: "pending" });
    });
    expect(result.current.toasts).toHaveLength(1);
    // unmount 触发 useEffect cleanup,clearTimeout 被调,后续 advance 不应 setState
    unmount();
    expect(() => {
      vi.advanceTimersByTime(10000);
    }).not.toThrow();
  });

  it("dismiss only removes target id, leaves others intact", () => {
    const { result } = renderHook(() => useToast());
    let id1 = "";
    let id2 = "";
    act(() => {
      id1 = result.current.push({ kind: "info", message: "1" });
      id2 = result.current.push({ kind: "info", message: "2" });
    });
    expect(result.current.toasts).toHaveLength(2);
    act(() => {
      result.current.dismiss(id1);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(id2);
  });

  it("action field preserved through push", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.push({
        kind: "warning",
        message: "x",
        action: { label: "重试", onClick: cb },
      });
    });
    expect(result.current.toasts[0].action?.label).toBe("重试");
    result.current.toasts[0].action?.onClick();
    expect(cb).toHaveBeenCalledOnce();
  });
});

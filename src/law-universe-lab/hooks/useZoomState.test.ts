import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useZoomState } from "./useZoomState";

describe("useZoomState", () => {
  it("defaults to zoomLevel 1", () => {
    const { result } = renderHook(() => useZoomState());
    expect(result.current.zoomLevel).toBe(1);
  });
  it("zoomIn increments up to 2, zoomOut decrements down to 0", () => {
    const { result } = renderHook(() => useZoomState());
    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn());
    act(() => result.current.zoomIn()); // clamped
    expect(result.current.zoomLevel).toBe(2);
    act(() => result.current.zoomOut());
    act(() => result.current.zoomOut());
    act(() => result.current.zoomOut()); // clamped
    expect(result.current.zoomLevel).toBe(0);
  });
  it("respects custom initial", () => {
    const { result } = renderHook(() => useZoomState(0));
    expect(result.current.zoomLevel).toBe(0);
  });
});

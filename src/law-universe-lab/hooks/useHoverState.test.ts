import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHoverState } from "./useHoverState";

describe("useHoverState", () => {
  it("starts null", () => {
    const { result } = renderHook(() => useHoverState());
    expect(result.current.hoveredNodeId).toBeNull();
  });
  it("setHoveredNodeId updates state", () => {
    const { result } = renderHook(() => useHoverState());
    act(() => result.current.setHoveredNodeId("node-1"));
    expect(result.current.hoveredNodeId).toBe("node-1");
  });
});

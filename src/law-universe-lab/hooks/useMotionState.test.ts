import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMotionState } from "./useMotionState";

describe("useMotionState", () => {
  it("starts with motion not paused", () => {
    const { result } = renderHook(() => useMotionState());
    expect(result.current.motionPaused).toBe(false);
  });
  it("toggleMotion flips motionPaused", () => {
    const { result } = renderHook(() => useMotionState());
    act(() => result.current.toggleMotion());
    expect(result.current.motionPaused).toBe(true);
    act(() => result.current.toggleMotion());
    expect(result.current.motionPaused).toBe(false);
  });
});
